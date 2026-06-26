import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// === BUILDERS ===
export const getBuilders = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("builders").collect();
  },
});

export const addBuilder = mutation({
  args: {
    name: v.string(),
    company: v.string(),
    contact: v.string(),
    activeProjects: v.array(v.string()),
    commissionAgreement: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("builders", args);
  },
});

// === BROKERS ===
export const getBrokers = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("brokers").collect();
  },
});

export const addBroker = mutation({
  args: {
    name: v.string(),
    agency: v.string(),
    contact: v.string(),
    reraNumber: v.string(),
    leadReferralsCount: v.number(),
    commissionEarned: v.number(),
    status: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("brokers", args);
  },
});

export const updateBrokerReferral = mutation({
  args: {
    id: v.id("brokers"),
    leadReferralsCount: v.number(),
    commissionEarned: v.number(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.patch(args.id, {
      leadReferralsCount: args.leadReferralsCount,
      commissionEarned: args.commissionEarned,
    });
  },
});

// === PAYMENTS ===
export const getPayments = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("payments").collect();
  },
});

export const addPayment = mutation({
  args: {
    leadId: v.string(),
    leadName: v.string(),
    amount: v.number(),
    date: v.string(),
    stage: v.string(),
    status: v.string(),
    gstAmount: v.number(),
    receiptUrl: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("payments", args);
  },
});

export const updatePaymentStatus = mutation({
  args: {
    id: v.id("payments"),
    status: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.patch(args.id, { status: args.status });
  },
});

// === FOLLOWUPS ===
export const getFollowups = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("followups").collect();
  },
});

export const addFollowup = mutation({
  args: {
    leadId: v.string(),
    leadName: v.string(),
    date: v.string(),
    time: v.string(),
    task: v.string(),
    status: v.string(),
    assignedTo: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("followups", args);
  },
});

export const updateFollowupStatus = mutation({
  args: {
    id: v.id("followups"),
    status: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.patch(args.id, { status: args.status });
  },
});

export const deleteFollowup = mutation({
  args: {
    id: v.id("followups"),
  },
  handler: async (ctx, args) => {
    return await ctx.db.delete(args.id);
  },
});

// === SITE VISITS ===
export const getSiteVisits = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("siteVisits").collect();
  },
});

export const addSiteVisit = mutation({
  args: {
    leadId: v.string(),
    date: v.string(),
    time: v.string(),
    type: v.string(),
    executive: v.string(),
    cabRequired: v.boolean(),
    pickupLocation: v.optional(v.string()),
    feedback: v.optional(v.string()),
    interestLevel: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("siteVisits", args);
  },
});

export const updateSiteVisitFeedback = mutation({
  args: {
    id: v.id("siteVisits"),
    feedback: v.string(),
    interestLevel: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.patch(args.id, {
      feedback: args.feedback,
      interestLevel: args.interestLevel,
    });
  },
});
