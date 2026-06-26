import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const getActivity = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("activityStream").order("desc").take(50);
  },
});

export const addActivity = mutation({
  args: {
    message: v.string(),
    time: v.string()
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("activityStream", args);
  },
});
