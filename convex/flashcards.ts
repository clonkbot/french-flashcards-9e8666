import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

export const list = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];
    return await ctx.db
      .query("flashcards")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .order("desc")
      .collect();
  },
});

export const create = mutation({
  args: {
    english: v.string(),
    french: v.string(),
    isAiGenerated: v.boolean(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    return await ctx.db.insert("flashcards", {
      userId,
      english: args.english,
      french: args.french,
      isAiGenerated: args.isAiGenerated,
      createdAt: Date.now(),
      timesCorrect: 0,
      timesIncorrect: 0,
    });
  },
});

export const createMany = mutation({
  args: {
    cards: v.array(v.object({
      english: v.string(),
      french: v.string(),
    })),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    for (const card of args.cards) {
      await ctx.db.insert("flashcards", {
        userId,
        english: card.english,
        french: card.french,
        isAiGenerated: true,
        createdAt: Date.now(),
        timesCorrect: 0,
        timesIncorrect: 0,
      });
    }
  },
});

export const markPracticed = mutation({
  args: {
    id: v.id("flashcards"),
    correct: v.boolean(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const card = await ctx.db.get(args.id);
    if (!card || card.userId !== userId) throw new Error("Not found");

    await ctx.db.patch(args.id, {
      lastPracticed: Date.now(),
      timesCorrect: args.correct ? card.timesCorrect + 1 : card.timesCorrect,
      timesIncorrect: args.correct ? card.timesIncorrect : card.timesIncorrect + 1,
    });
  },
});

export const remove = mutation({
  args: { id: v.id("flashcards") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const card = await ctx.db.get(args.id);
    if (!card || card.userId !== userId) throw new Error("Not found");

    await ctx.db.delete(args.id);
  },
});
