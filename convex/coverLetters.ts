import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

/**
 * Save a new cover letter for the current user.
 */
export const save = mutation({
    args: {
        jobUrl: v.optional(v.string()),
        jobDescription: v.string(),
        coverLetter: v.string(),
        companyName: v.optional(v.string()),
        jobTitle: v.optional(v.string()),
    },
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

        return await ctx.db.insert("coverLetters", {
            ...args,
            userId: user._id,
            createdAt: Date.now(),
        });
    },
});

/**
 * List all cover letters for the current user.
 */
export const list = query({
    args: {},
    handler: async (ctx) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) {
            return [];
        }

        const user = await ctx.db
            .query("users")
            .withIndex("by_token", (q) =>
                q.eq("tokenIdentifier", identity.tokenIdentifier)
            )
            .unique();

        if (!user) {
            return [];
        }

        return await ctx.db
            .query("coverLetters")
            .withIndex("by_user", (q) => q.eq("userId", user._id))
            .order("desc")
            .collect();
    },
});

/**
 * Delete a cover letter.
 */
export const remove = mutation({
    args: { id: v.id("coverLetters") },
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

        const letter = await ctx.db.get(args.id);
        if (!letter) {
            throw new Error("Letter not found");
        }

        if (letter.userId !== user._id) {
            throw new Error("Unauthorized");
        }

        await ctx.db.delete(args.id);
    },
});

/**
 * Get a single cover letter by ID.
 */
export const get = query({
    args: { id: v.id("coverLetters") },
    handler: async (ctx, args) => {
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

        if (!user) {
            return null;
        }

        const letter = await ctx.db.get(args.id);
        if (!letter || letter.userId !== user._id) {
            return null;
        }

        return letter;
    },
});
