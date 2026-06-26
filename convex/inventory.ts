import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const getInventory = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("inventory").collect();
  },
});

export const addInventory = mutation({
  args: {
    tower: v.string(),
    floor: v.number(),
    status: v.string(),
    unit: v.string(),
    type: v.string(),
    views: v.array(v.string())
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("inventory", args);
  },
});

export const updateInventoryStatus = mutation({
  args: {
    id: v.id("inventory"),
    status: v.string()
  },
  handler: async (ctx, args) => {
    return await ctx.db.patch(args.id, { status: args.status });
  }
});
