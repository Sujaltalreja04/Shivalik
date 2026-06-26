import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  leads: defineTable({
    name: v.string(),
    phone: v.string(),
    email: v.string(),
    project: v.string(),
    score: v.number(),
    status: v.string(),
    action: v.optional(v.string()),
    source: v.optional(v.string()),
    // New enriched CRM columns
    budget: v.optional(v.number()),
    preferredLocation: v.optional(v.string()),
    propertyType: v.optional(v.string()),
    bhkPreference: v.optional(v.string()),
    purpose: v.optional(v.string()), // e.g. Buy / Rent / Invest
    loanRequired: v.optional(v.boolean()),
    assignedExecutive: v.optional(v.string()),
    familyDetails: v.optional(v.string()),
    occupation: v.optional(v.string()),
    annualIncome: v.optional(v.number()),
    notes: v.optional(v.string()),
  }),
  activityStream: defineTable({
    message: v.string(),
    time: v.string()
  }),
  properties: defineTable({
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
    }),
    // Enriched metadata
    builder: v.optional(v.string()),
    reraNumber: v.optional(v.string()),
    amenities: v.optional(v.array(v.string())),
    brochure: v.optional(v.string()),
    virtualTour: v.optional(v.string())
  }),
  inventory: defineTable({
    tower: v.string(),
    floor: v.number(),
    status: v.string(),
    unit: v.string(),
    type: v.string(),
    views: v.array(v.string()),
    // Enriched individual unit info
    price: v.optional(v.number()),
    area: v.optional(v.number()), // sq.ft.
    facing: v.optional(v.string()),
    amenities: v.optional(v.array(v.string())),
    reraNumber: v.optional(v.string()),
    constructionStatus: v.optional(v.string()),
    brochure: v.optional(v.string()),
    floorPlan: v.optional(v.string()),
    virtualTour: v.optional(v.string())
  }),
  builders: defineTable({
    name: v.string(),
    company: v.string(),
    contact: v.string(),
    activeProjects: v.array(v.string()),
    commissionAgreement: v.string()
  }),
  brokers: defineTable({
    name: v.string(),
    agency: v.string(),
    contact: v.string(),
    reraNumber: v.string(),
    leadReferralsCount: v.number(),
    commissionEarned: v.number(),
    status: v.string() // e.g. Active / Inactive
  }),
  payments: defineTable({
    leadId: v.string(),
    leadName: v.string(),
    amount: v.number(),
    date: v.string(),
    stage: v.string(), // e.g. Token Paid, Foundation Slab, Possession
    status: v.string(), // Paid, Pending, Overdue
    gstAmount: v.number(),
    receiptUrl: v.optional(v.string())
  }),
  followups: defineTable({
    leadId: v.string(),
    leadName: v.string(),
    date: v.string(),
    time: v.string(),
    task: v.string(),
    status: v.string(), // Pending / Completed
    assignedTo: v.string()
  }),
  siteVisits: defineTable({
    leadId: v.string(),
    date: v.string(),
    time: v.string(),
    type: v.string(), // Physical vs AR Walkthrough
    executive: v.string(),
    cabRequired: v.boolean(),
    pickupLocation: v.optional(v.string()),
    feedback: v.optional(v.string()),
    interestLevel: v.string() // Hot, Warm, Cold
  })
});
