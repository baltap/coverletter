import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

// The schema is entirely optional.
// You can delete this file (schema.ts) and the
// app will continue to work.
// The schema provides more precise TypeScript types.
export default defineSchema({
  users: defineTable({
    name: v.string(),
    tokenIdentifier: v.string(),
    cvText: v.optional(v.string()),
    cvFileName: v.optional(v.string()),
    isMax: v.optional(v.boolean()),
    isPro: v.optional(v.boolean()),
    stripeCustomerId: v.optional(v.string()),
    referralCode: v.optional(v.string()),
    referralBalance: v.optional(v.number()),
    referredBy: v.optional(v.string()), // user ID or token identifier
  }).index("by_token", ["tokenIdentifier"])
    .index("by_referral_code", ["referralCode"]),
  coverLetters: defineTable({
    userId: v.id("users"),
    jobUrl: v.optional(v.string()),
    jobDescription: v.string(),
    coverLetter: v.string(),
    companyName: v.optional(v.string()),
    jobTitle: v.optional(v.string()),
    createdAt: v.number(),
  }).index("by_user", ["userId"]),
});
