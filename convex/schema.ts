import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    email: v.string(),
    name: v.optional(v.string()),
    image: v.optional(v.string()),
  }).index("by_email", ["email"]),

  incidents: defineTable({
    title: v.string(),
    description: v.string(),
    severity: v.union(v.literal("P0"), v.literal("P1"), v.literal("P2"), v.literal("P3")),
    status: v.union(v.literal("active"), v.literal("resolved")),
    assignee: v.optional(v.string()),
    resolvedAt: v.optional(v.number()),
  }).index("by_status", ["status"]),
});
