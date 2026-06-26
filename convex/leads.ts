import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const getLeads = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("leads").collect();
  },
});

export const addLead = mutation({
  args: {
    name: v.string(),
    phone: v.string(),
    email: v.string(),
    project: v.string(),
    score: v.number(),
    status: v.string(),
    action: v.optional(v.string()),
    source: v.optional(v.string()),
    budget: v.optional(v.number()),
    preferredLocation: v.optional(v.string()),
    propertyType: v.optional(v.string()),
    bhkPreference: v.optional(v.string()),
    purpose: v.optional(v.string()),
    loanRequired: v.optional(v.boolean()),
    assignedExecutive: v.optional(v.string()),
    familyDetails: v.optional(v.string()),
    occupation: v.optional(v.string()),
    annualIncome: v.optional(v.number()),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("leads", args);
  },
});

export const updateLeadStatus = mutation({
  args: { id: v.id("leads"), status: v.string() },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, { status: args.status });
  },
});

export const updateLeadDetails = mutation({
  args: {
    id: v.id("leads"),
    name: v.optional(v.string()),
    phone: v.optional(v.string()),
    email: v.optional(v.string()),
    project: v.optional(v.string()),
    score: v.optional(v.number()),
    status: v.optional(v.string()),
    action: v.optional(v.string()),
    source: v.optional(v.string()),
    budget: v.optional(v.number()),
    preferredLocation: v.optional(v.string()),
    propertyType: v.optional(v.string()),
    bhkPreference: v.optional(v.string()),
    purpose: v.optional(v.string()),
    loanRequired: v.optional(v.boolean()),
    assignedExecutive: v.optional(v.string()),
    familyDetails: v.optional(v.string()),
    occupation: v.optional(v.string()),
    annualIncome: v.optional(v.number()),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args;
    await ctx.db.patch(id, updates);
  },
});

export const deleteLead = mutation({
  args: { id: v.id("leads") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});
