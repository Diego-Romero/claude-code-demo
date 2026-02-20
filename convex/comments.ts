import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const list = query({
  args: { incidentId: v.id("incidents") },
  handler: async (ctx, { incidentId }) => {
    return ctx.db
      .query("comments")
      .withIndex("by_incident", (q) => q.eq("incidentId", incidentId))
      .order("asc")
      .collect();
  },
});

export const add = mutation({
  args: {
    incidentId: v.id("incidents"),
    body: v.string(),
    authorEmail: v.string(),
    authorName: v.string(),
  },
  handler: async (ctx, args) => {
    return ctx.db.insert("comments", args);
  },
});
