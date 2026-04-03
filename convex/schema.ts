import { defineSchema, defineTable } from "convex/server";
import { authTables } from "@convex-dev/auth/server";
import { v } from "convex/values";

export default defineSchema({
  ...authTables,
  flashcards: defineTable({
    userId: v.id("users"),
    english: v.string(),
    french: v.string(),
    isAiGenerated: v.boolean(),
    createdAt: v.number(),
    lastPracticed: v.optional(v.number()),
    timesCorrect: v.number(),
    timesIncorrect: v.number(),
  }).index("by_user", ["userId"]),
});
