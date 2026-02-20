import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const list = query({
  args: {
    status: v.optional(v.union(v.literal("active"), v.literal("resolved"))),
  },
  handler: async (ctx, { status }) => {
    if (status)
      return ctx.db
        .query("incidents")
        .withIndex("by_status", (q) => q.eq("status", status))
        .order("desc")
        .collect();
    return ctx.db.query("incidents").order("desc").collect();
  },
});

export const create = mutation({
  args: {
    title: v.string(),
    description: v.string(),
    severity: v.union(
      v.literal("P0"),
      v.literal("P1"),
      v.literal("P2"),
      v.literal("P3"),
    ),
    assignee: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    return ctx.db.insert("incidents", { ...args, status: "active" });
  },
});

export const resolve = mutation({
  args: { id: v.id("incidents") },
  handler: async (ctx, { id }) => {
    await ctx.db.patch(id, { status: "resolved", resolvedAt: Date.now() });
  },
});

export const update = mutation({
  args: {
    id: v.id("incidents"),
    title: v.optional(v.string()),
    description: v.optional(v.string()),
    severity: v.optional(
      v.union(
        v.literal("P0"),
        v.literal("P1"),
        v.literal("P2"),
        v.literal("P3"),
      ),
    ),
    assignee: v.optional(v.string()),
  },
  handler: async (ctx, { id, ...fields }) => {
    await ctx.db.patch(id, fields);
  },
});

export const remove = mutation({
  args: { id: v.id("incidents") },
  handler: async (ctx, { id }) => {
    await ctx.db.delete(id);
  },
});
