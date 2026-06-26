import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const getProperties = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("properties").collect();
  },
});

export const addProperty = mutation({
  args: {
    name: v.string(),
    location: v.string(),
    price: v.number(),
    bhk: v.string(),
    status: v.string(),
    image: v.string(),
    completion: v.string(),
    stats: v.object({
      views: v.number(),
      inquiries: v.number(),
      trend: v.string()
    })
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("properties", args);
  },
});
