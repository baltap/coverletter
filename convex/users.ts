import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

/**
 * Insert or update the user in the database.
 *
 * If the user has not yet been created, create them.
 * Otherwise, update their information.
 *
 * Returns the user's ID.
 */
export const store = mutation({
    args: { referredByCode: v.optional(v.string()) },
    returns: v.id("users"),
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) {
            throw new Error("Called storeUser without authentication present");
        }

        const user = await ctx.db
            .query("users")
            .withIndex("by_token", (q) =>
                q.eq("tokenIdentifier", identity.tokenIdentifier)
            )
            .unique();

        if (user !== null) {
            if (user.name !== identity.name) {
                await ctx.db.patch(user._id, { name: identity.name });
            }
            return user._id;
        }

        // Handle referral if provided
        let referredByIdentifier = undefined;
        if (args.referredByCode) {
            const referrer = await ctx.db
                .query("users")
                .withIndex("by_referral_code", (q) => q.eq("referralCode", args.referredByCode))
                .unique();

            if (referrer) {
                referredByIdentifier = referrer.tokenIdentifier;
                // Reward the referrer immediately with +2 generations
                await ctx.db.patch(referrer._id, {
                    referralBalance: (referrer.referralBalance || 0) + 2
                });
            }
        }

        // Generate a 4-character hex code for referral
        const referralCode = Math.random().toString(36).substring(2, 6).toUpperCase();

        return await ctx.db.insert("users", {
            name: identity.name!,
            tokenIdentifier: identity.tokenIdentifier,
            referralCode,
            referralBalance: args.referredByCode ? 2 : 0, // Reward the new user too
            referredBy: referredByIdentifier,
        });
    },
});

export const currentUser = query({
    args: {},
    handler: async (ctx) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) {
            return null;
        }

        return await ctx.db
            .query("users")
            .withIndex("by_token", (q) =>
                q.eq("tokenIdentifier", identity.tokenIdentifier)
            )
            .unique();
    },
});

export const updateCV = mutation({
    args: { cvText: v.string(), cvFileName: v.optional(v.string()) },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) {
            throw new Error("Unauthenticated");
        }

        const user = await ctx.db
            .query("users")
            .withIndex("by_token", (q) =>
                q.eq("tokenIdentifier", identity.tokenIdentifier)
            )
            .unique();

        if (!user) {
            throw new Error("User not found");
        }

        await ctx.db.patch(user._id, {
            cvText: args.cvText,
            cvFileName: args.cvFileName
        });
    },
});
export const checkUsage = query({
    args: { anonymousId: v.optional(v.string()) },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();

        if (identity) {
            const user = await ctx.db
                .query("users")
                .withIndex("by_token", (q) =>
                    q.eq("tokenIdentifier", identity.tokenIdentifier)
                )
                .unique();

            if (!user) return { allowed: false, reason: "User not found" };

            // Upgrade/Max users have unlimited access
            if (user.isMax || user.isPro) return { allowed: true, isMax: true };

            const count = await ctx.db
                .query("coverLetters")
                .withIndex("by_user", (q) => q.eq("userId", user._id))
                .collect();

            const baseLimit = 3;
            const bonusGens = user.referralBalance || 0;
            const totalLimit = baseLimit + bonusGens;

            if (count.length >= totalLimit) {
                return {
                    allowed: false,
                    reason: `Generation limit reached (${count.length}/${totalLimit}). Referral bonus adds +2 per friend. Upgrade to Scribe.CV Max for unlimited access.`
                };
            }

            return { allowed: true, count: count.length, limit: totalLimit };
        }

        // Guest logic (minimal protection via anonymousId)
        // In a real high-load scenario, we would use IP-based rate limiting or harder guest IDs
        return { allowed: true, isGuest: true };
    }
});
