import { v } from "convex/values";
import { mutation, query, internalMutation } from "./_generated/server";

/**
 * Mutation to mark a user as Pro.
 * Called by our webhook handler.
 */
export const markUserAsMax = mutation({
    args: {
        tokenIdentifier: v.string(),
        stripeCustomerId: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        const user = await ctx.db
            .query("users")
            .withIndex("by_token", (q) => q.eq("tokenIdentifier", args.tokenIdentifier))
            .unique();

        if (!user) {
            throw new Error("User not found during Max upgrade");
        }

        await ctx.db.patch(user._id, {
            isMax: true,
            stripeCustomerId: args.stripeCustomerId,
        });
    },
});

/**
 * Query to check if the current user is Pro.
 */
export const getMaxStatus = query({
    args: {},
    handler: async (ctx) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) {
            return false;
        }

        const user = await ctx.db
            .query("users")
            .withIndex("by_token", (q) => q.eq("tokenIdentifier", identity.tokenIdentifier))
            .unique();

        return (user?.isMax || user?.isPro) ?? false;
    },
});
