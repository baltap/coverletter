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
    returns: v.union(v.null(), v.id("users")),
    handler: async (ctx) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) {
            return null;
        }

        const user = await ctx.db
            .query("users")
            .withIndex("by_token", (q) =>
                q.eq("tokenIdentifier", identity.tokenIdentifier)
            )
            .unique();

        return user ? user._id : null;
    },
});
