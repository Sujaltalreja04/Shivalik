import { mutation } from "./_generated/server";

const INITIAL_LEADS = [
  {
    name: "Rahul Sharma",
    phone: "+91 98765 43210",
    email: "rahul.s@example.com",
    project: "Shivalik Skyview",
    score: 92,
    status: "Negotiation",
    action: "Follow up on pricing",
    source: "Website Chat",
    budget: 25000000,
    preferredLocation: "Ambawadi",
    propertyType: "Apartment",
    bhkPreference: "3 BHK",
    purpose: "Buy",
    loanRequired: true,
    assignedExecutive: "Sujal Talreja",
    familyDetails: "Spouse and 1 Child",
    occupation: "Software Architect",
    annualIncome: 4500000,
    notes: "Requires high floor with east facing layout. Interested in flexible payment plan."
  },
  {
    name: "Priya Patel",
    phone: "+91 98222 11100",
    email: "priya.p@example.com",
    project: "Shivalik Highlife",
    score: 85,
    status: "Site Visit Scheduled",
    action: "Schedule AR Tour",
    source: "Facebook Ads",
    budget: 18000000,
    preferredLocation: "SG Highway",
    propertyType: "Apartment",
    bhkPreference: "3 BHK",
    purpose: "Buy",
    loanRequired: false,
    assignedExecutive: "Aarti Amin",
    familyDetails: "Joint family (Parents and spouse)",
    occupation: "Business Owner",
    annualIncome: 6000000,
    notes: "Wants a peaceful view of clubhouse. Prefers early possession."
  },
  {
    name: "Amit Desai",
    phone: "+91 99888 77665",
    email: "amit.d@example.com",
    project: "Shivalik Skyview",
    score: 78,
    status: "Contacted",
    action: "Send brochure",
    source: "Google Search",
    budget: 28000000,
    preferredLocation: "Ambawadi",
    propertyType: "Apartment",
    bhkPreference: "4 BHK",
    purpose: "Invest",
    loanRequired: true,
    assignedExecutive: "Sujal Talreja",
    familyDetails: "Spouse only",
    occupation: "Doctor (Radiologist)",
    annualIncome: 7500000,
    notes: "Pure investment play. Looking for maximum ROI and rental yield."
  },
  {
    name: "Neha Gupta",
    phone: "+91 91234 56789",
    email: "neha.g@example.com",
    project: "Shivalik Highlife",
    score: 65,
    status: "New Lead",
    action: "Call back next week",
    source: "Instagram",
    budget: 16000000,
    preferredLocation: "SG Highway",
    propertyType: "Apartment",
    bhkPreference: "3 BHK",
    purpose: "Buy",
    loanRequired: true,
    assignedExecutive: "Rohan Vora",
    familyDetails: "Single",
    occupation: "Senior Consultant",
    annualIncome: 3200000,
    notes: "First-time home buyer, extremely budget-sensitive."
  },
  {
    name: "Vikram Singh",
    phone: "+91 90000 11223",
    email: "vikram.s@example.com",
    project: "Shivalik Edge",
    score: 45,
    status: "Closed/Lost",
    action: "Add to nurture campaign",
    source: "Walk-in",
    budget: 12000000,
    preferredLocation: "Bopal",
    propertyType: "Apartment",
    bhkPreference: "2 BHK",
    purpose: "Buy",
    loanRequired: true,
    assignedExecutive: "Aarti Amin",
    familyDetails: "Retired spouse",
    occupation: "Retired Bank Manager",
    annualIncome: 1200000,
    notes: "Looking for downsized apartment close to community parks."
  }
];

const INITIAL_ACTIVITY = [
  { message: "Lead Rahul Sharma progressed to Negotiation stage for Skyview unit 1201.", time: "10:42 AM" },
  { message: "Priya Patel scheduled a virtual AR walkthrough for Highlife.", time: "09:15 AM" },
  { message: "New inbound lead captured from Facebook campaign: Amit Desai.", time: "08:30 AM" }
];

const INITIAL_PROPERTIES = [
  { 
    name: "Shivalik Skyview", 
    location: "Ambawadi", 
    price: 25000000, 
    bhk: "3 & 4 BHK", 
    status: "Under Construction", 
    image: "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=600&q=80", 
    completion: "Dec 2026", 
    stats: { views: 1245, inquiries: 84, trend: "+12%" },
    builder: "Shivalik Group",
    reraNumber: "PR/GJ/AHMEDABAD/AUDA/CAA00123/251226",
    amenities: ["Rooftop Garden", "Infinite Pool", "Double-Height Lounge", "Yoga Sanctuary"],
    brochure: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
    virtualTour: "https://demo.virtualtour.com/skyview"
  },
  { 
    name: "Shivalik Highlife", 
    location: "SG Highway", 
    price: 18000000, 
    bhk: "3 BHK", 
    status: "Ready to Move", 
    image: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=600&q=80", 
    completion: "Ready", 
    stats: { views: 3420, inquiries: 215, trend: "+5%" },
    builder: "Shivalik Group",
    reraNumber: "PR/GJ/AHMEDABAD/AUDA/CAA00456/150124",
    amenities: ["Clubhouse Lounge", "Gymnasium", "Children Play Area", "Cricket Pitch"],
    brochure: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
    virtualTour: "https://demo.virtualtour.com/highlife"
  },
  { 
    name: "Shivalik Edge", 
    location: "Bopal", 
    price: 12000000, 
    bhk: "2 & 3 BHK", 
    status: "Newly Launched", 
    image: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=600&q=80", 
    completion: "Mar 2027", 
    stats: { views: 890, inquiries: 45, trend: "+28%" },
    builder: "Shivalik Group",
    reraNumber: "PR/GJ/AHMEDABAD/AUDA/CAA00789/300327",
    amenities: ["Co-working Space", "Electric Vehicle Chargers", "Jogging Track", "Mini Theater"],
    brochure: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
    virtualTour: "https://demo.virtualtour.com/edge"
  }
];

const INITIAL_INVENTORY = [
  { 
    tower: "Tower A", 
    floor: 12, 
    status: "Available", 
    unit: "1201", 
    type: "3 BHK", 
    views: ["Skyline", "Garden"],
    price: 25000000,
    area: 2100,
    facing: "East",
    amenities: ["Rooftop Garden", "Infinite Pool"],
    reraNumber: "PR/GJ/AHMEDABAD/AUDA/CAA00123/251226",
    constructionStatus: "Slab Completed",
    brochure: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
    floorPlan: "https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=600&q=80",
    virtualTour: "https://demo.virtualtour.com/skyview"
  },
  { 
    tower: "Tower A", 
    floor: 12, 
    status: "Sold", 
    unit: "1202", 
    type: "3 BHK", 
    views: ["Clubhouse"],
    price: 24500000,
    area: 2050,
    facing: "West",
    amenities: ["Rooftop Garden"],
    reraNumber: "PR/GJ/AHMEDABAD/AUDA/CAA00123/251226",
    constructionStatus: "Slab Completed",
    brochure: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
    floorPlan: "https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=600&q=80",
    virtualTour: "https://demo.virtualtour.com/skyview"
  },
  { 
    tower: "Tower A", 
    floor: 12, 
    status: "Hold", 
    unit: "1203", 
    type: "3 BHK", 
    views: ["Skyline"],
    price: 24800000,
    area: 2080,
    facing: "North-East",
    amenities: ["Rooftop Garden", "Infinite Pool"],
    reraNumber: "PR/GJ/AHMEDABAD/AUDA/CAA00123/251226",
    constructionStatus: "Slab Completed",
    brochure: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
    floorPlan: "https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=600&q=80",
    virtualTour: "https://demo.virtualtour.com/skyview"
  },
  { 
    tower: "Tower A", 
    floor: 12, 
    status: "Available", 
    unit: "1204", 
    type: "4 BHK", 
    views: ["Skyline", "Pool"],
    price: 34000000,
    area: 2850,
    facing: "East",
    amenities: ["Infinite Pool", "Double-Height Lounge"],
    reraNumber: "PR/GJ/AHMEDABAD/AUDA/CAA00123/251226",
    constructionStatus: "Slab Completed",
    brochure: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
    floorPlan: "https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=600&q=80",
    virtualTour: "https://demo.virtualtour.com/skyview"
  },
  { 
    tower: "Tower B", 
    floor: 5, 
    status: "Available", 
    unit: "501", 
    type: "3 BHK", 
    views: ["Garden"],
    price: 18000000,
    area: 1750,
    facing: "South",
    amenities: ["Clubhouse Lounge", "Gymnasium"],
    reraNumber: "PR/GJ/AHMEDABAD/AUDA/CAA00456/150124",
    constructionStatus: "Ready",
    brochure: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
    floorPlan: "https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=600&q=80",
    virtualTour: "https://demo.virtualtour.com/highlife"
  },
  { 
    tower: "Tower B", 
    floor: 5, 
    status: "Available", 
    unit: "502", 
    type: "3 BHK", 
    views: ["Clubhouse"],
    price: 18200000,
    area: 1770,
    facing: "East",
    amenities: ["Clubhouse Lounge", "Children Play Area"],
    reraNumber: "PR/GJ/AHMEDABAD/AUDA/CAA00456/150124",
    constructionStatus: "Ready",
    brochure: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
    floorPlan: "https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=600&q=80",
    virtualTour: "https://demo.virtualtour.com/highlife"
  }
];

const INITIAL_BUILDERS = [
  {
    name: "Shivalik Group",
    company: "Shivalik Projects Limited",
    contact: "+91 79 3500 1100",
    activeProjects: ["Shivalik Skyview", "Shivalik Highlife", "Shivalik Edge"],
    commissionAgreement: "2.5% commission payout. 1% upon execution of allotment letter, 1.5% upon registration."
  },
  {
    name: "Legacy Developers",
    company: "Legacy Buildcon LLP",
    contact: "+91 79 4800 2200",
    activeProjects: ["Legacy Manor", "Legacy Heights"],
    commissionAgreement: "2.0% standard broker payout, disbursed within 30 days of client sale deed execution."
  }
];

const INITIAL_BROKERS = [
  {
    name: "Rohan Mehta",
    agency: "Amdavad Realty Experts",
    contact: "+91 98980 12345",
    reraNumber: "PR/GJ/AHMEDABAD/AG/110224",
    leadReferralsCount: 12,
    commissionEarned: 750000,
    status: "Active"
  },
  {
    name: "Sonia Shah",
    agency: "Elite Spaces Realty",
    contact: "+91 97777 88888",
    reraNumber: "PR/GJ/AHMEDABAD/AG/550625",
    leadReferralsCount: 8,
    commissionEarned: 480000,
    status: "Active"
  },
  {
    name: "Karan Johar",
    agency: "Dream Abodes",
    contact: "+91 91111 22222",
    reraNumber: "PR/GJ/AHMEDABAD/AG/990326",
    leadReferralsCount: 3,
    commissionEarned: 150000,
    status: "Inactive"
  }
];

const INITIAL_PAYMENTS = [
  {
    leadId: "placeholder",
    leadName: "Rahul Sharma",
    amount: 500000,
    date: "2026-06-20",
    stage: "Token Amount Paid",
    status: "Paid",
    gstAmount: 90000,
    receiptUrl: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf"
  },
  {
    leadId: "placeholder",
    leadName: "Rahul Sharma",
    amount: 2000000,
    date: "2026-07-15",
    stage: "Foundation Slab Stage",
    status: "Pending",
    gstAmount: 360000,
    receiptUrl: ""
  },
  {
    leadId: "placeholder",
    leadName: "Priya Patel",
    amount: 180000,
    date: "2026-06-22",
    stage: "Token Amount Paid",
    status: "Paid",
    gstAmount: 32400,
    receiptUrl: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf"
  }
];

const INITIAL_FOLLOWUPS = [
  {
    leadId: "placeholder",
    leadName: "Rahul Sharma",
    date: "2026-06-26",
    time: "14:30",
    task: "Verify HDFC home loan approval documents and interest rate negotiation.",
    status: "Pending",
    assignedTo: "Sujal Talreja"
  },
  {
    leadId: "placeholder",
    leadName: "Priya Patel",
    date: "2026-06-26",
    time: "16:00",
    task: "Send updated floor customization options for the master bedroom.",
    status: "Pending",
    assignedTo: "Aarti Amin"
  },
  {
    leadId: "placeholder",
    leadName: "Amit Desai",
    date: "2026-06-28",
    time: "11:00",
    task: "Check in regarding corporate registry paperwork and company resolution for buying under business name.",
    status: "Pending",
    assignedTo: "Sujal Talreja"
  }
];

const INITIAL_SITE_VISITS = [
  {
    leadId: "placeholder",
    date: "2026-06-27",
    time: "11:00",
    type: "AR Walkthrough",
    executive: "Sujal Talreja",
    cabRequired: true,
    pickupLocation: "Vastrapur Lake Circle, Ahmedabad",
    feedback: "Extremely impressed by the 3D unit overlay and natural light simulation.",
    interestLevel: "Hot"
  }
];

export const seedDatabase = mutation({
  args: {},
  handler: async (ctx) => {
    // 0. Clear existing data to allow clean rebuild
    const oldLeads = await ctx.db.query("leads").collect();
    for (const lead of oldLeads) {
      await ctx.db.delete(lead._id);
    }
    const oldProperties = await ctx.db.query("properties").collect();
    for (const prop of oldProperties) {
      await ctx.db.delete(prop._id);
    }
    const oldInventory = await ctx.db.query("inventory").collect();
    for (const inv of oldInventory) {
      await ctx.db.delete(inv._id);
    }
    const oldActivity = await ctx.db.query("activityStream").collect();
    for (const act of oldActivity) {
      await ctx.db.delete(act._id);
    }
    const oldBuilders = await ctx.db.query("builders").collect();
    for (const bld of oldBuilders) {
      await ctx.db.delete(bld._id);
    }
    const oldBrokers = await ctx.db.query("brokers").collect();
    for (const brk of oldBrokers) {
      await ctx.db.delete(brk._id);
    }
    const oldPayments = await ctx.db.query("payments").collect();
    for (const pay of oldPayments) {
      await ctx.db.delete(pay._id);
    }
    const oldFollowups = await ctx.db.query("followups").collect();
    for (const f of oldFollowups) {
      await ctx.db.delete(f._id);
    }
    const oldSiteVisits = await ctx.db.query("siteVisits").collect();
    for (const sv of oldSiteVisits) {
      await ctx.db.delete(sv._id);
    }

    // 1. Seed properties
    const propertyIds: Record<string, string> = {};
    for (const property of INITIAL_PROPERTIES) {
      const id = await ctx.db.insert("properties", property);
      propertyIds[property.name] = id;
    }

    // 2. Seed inventory
    for (const item of INITIAL_INVENTORY) {
      await ctx.db.insert("inventory", item);
    }

    // 3. Seed builders & brokers
    for (const builder of INITIAL_BUILDERS) {
      await ctx.db.insert("builders", builder);
    }
    for (const broker of INITIAL_BROKERS) {
      await ctx.db.insert("brokers", broker);
    }

    // 4. Seed activity
    for (const activity of INITIAL_ACTIVITY) {
      await ctx.db.insert("activityStream", activity);
    }

    // 5. Seed leads and capture their IDs dynamically for payments/followups/visits
    const leadIds: Record<string, string> = {};
    for (const lead of INITIAL_LEADS) {
      const id = await ctx.db.insert("leads", lead);
      leadIds[lead.name] = id;
    }

    // 6. Seed payments with real lead references
    for (const payment of INITIAL_PAYMENTS) {
      const matchedId = leadIds[payment.leadName] || "";
      await ctx.db.insert("payments", {
        ...payment,
        leadId: matchedId
      });
    }

    // 7. Seed followups with real lead references
    for (const followup of INITIAL_FOLLOWUPS) {
      const matchedId = leadIds[followup.leadName] || "";
      await ctx.db.insert("followups", {
        ...followup,
        leadId: matchedId
      });
    }

    // 8. Seed site visits
    for (const visit of INITIAL_SITE_VISITS) {
      // Pick a sample lead
      const sampleLeadName = Object.keys(leadIds)[0];
      const matchedId = leadIds[sampleLeadName] || "";
      await ctx.db.insert("siteVisits", {
        ...visit,
        leadId: matchedId
      });
    }

    return "Database seeded with rich real-estate records successfully!";
  }
});
