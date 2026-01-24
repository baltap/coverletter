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
    args: {},
    returns: v.id("users"),
    handler: async (ctx) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) {
            throw new Error("Called storeUser without authentication present");
        }

        // Check if we've already stored this identity before.
        const user = await ctx.db
            .query("users")
            .withIndex("by_token", (q) =>
                q.eq("tokenIdentifier", identity.tokenIdentifier)
            )
            .unique();

        if (user !== null) {
            // If we've seen this identity before but the name has changed, patch it.
            if (user.name !== identity.name) {
                await ctx.db.patch(user._id, { name: identity.name });
            }
            return user._id;
        }

        // If it's a new identity, create a new `User`.
        return await ctx.db.insert("users", {
            name: identity.name!,
            tokenIdentifier: identity.tokenIdentifier,
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

            // Members (standard users) have a 3-letter limit
            const count = await ctx.db
                .query("coverLetters")
                .withIndex("by_user", (q) => q.eq("userId", user._id))
                .collect();

            if (count.length >= 3) {
                return {
                    allowed: false,
                    reason: "Monthly generation limit reached (3/3). Please upgrade to Scribe.CV Max for unlimited access."
                };
            }

            return { allowed: true, count: count.length, limit: 3 };
        }

        // Guest logic (minimal protection via anonymousId)
        // In a real high-load scenario, we would use IP-based rate limiting or harder guest IDs
        return { allowed: true, isGuest: true };
    }
});
