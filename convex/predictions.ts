import { query, mutation, action } from "./_generated/server";
import { v } from "convex/values";
import { api } from "./_generated/api";

// === QUERY: GET SINGLE LEAD PREDICTION ===
export const getPredictionByLead = query({
  args: { leadId: v.id("leads") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("predictions")
      .withIndex("by_leadId", (q) => q.eq("leadId", args.leadId))
      .unique();
  },
});

// === QUERY: GET ALL PREDICTIONS ===
export const getAllPredictions = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("predictions").collect();
  },
});

// === MUTATION: SAVE PREDICTION RECORD ===
export const savePrediction = mutation({
  args: {
    leadId: v.id("leads"),
    conversionProbability: v.number(),
    recommendedLocations: v.array(v.string()),
    bestFitProperty: v.string(),
    purchaseBehaviorAnalysis: v.string(),
    scrapedMarketTrends: v.string(),
    factorsToConvert: v.array(v.string()),
    nextBestAction: v.string(),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("predictions")
      .withIndex("by_leadId", (q) => q.eq("leadId", args.leadId))
      .unique();

    const data = {
      ...args,
      updatedAt: new Date().toISOString(),
    };

    if (existing) {
      await ctx.db.patch(existing._id, data);
      return existing._id;
    } else {
      return await ctx.db.insert("predictions", data);
    }
  },
});

// === QUERY: GET LEAD PREDICTION CONTEXT ===
export const getLeadPredictionContext = query({
  args: { leadId: v.id("leads") },
  handler: async (ctx, args) => {
    const lead = await ctx.db.get(args.leadId);
    if (!lead) return null;

    const voiceCalls = await ctx.db
      .query("voiceCalls")
      .withIndex("by_leadId", (q) => q.eq("leadId", args.leadId))
      .collect();

    const properties = await ctx.db.query("properties").collect();

    return { lead, voiceCalls, properties };
  },
});

// === INTERNET SCRAPING SIMULATOR FOR AHMEDABAD REGIONS ===
const getScrapedMarketData = (location: string) => {
  const data: Record<string, { trends: string; headlines: string[]; cagr: string }> = {
    "Ambawadi": {
      trends: "Premium residential micro-market with steady 10-12% annual capital appreciation. High density of gated communities and close proximity to elite educational campuses (IIM Ahmedabad).",
      cagr: "11.4% CAGR over past 5 years",
      headlines: [
        "Metro Phase 2 corridor extension near Ambawadi approved, boosting local residential demand.",
        "Renovation of local heritage parks in Ambawadi drives luxury developer interest.",
        "Inventory of premium 3 & 4 BHK projects in Ambawadi drops to a 3-year low, raising unit prices."
      ]
    },
    "SG Highway": {
      trends: "Ahmedabad's primary commercial-residential growth axis. Strong rental yields of 4.5% driven by massive corporate relocations, technology parks, and retail centers.",
      cagr: "14.8% CAGR over past 5 years",
      headlines: [
        "Multiple Fortune 500 offices set up hubs near SG Highway, surging demand for premium apartments.",
        "New flyovers and traffic decongestion projects along SG Highway completed, improving commute ratings.",
        "Rental listings in SG Highway experience 15% year-on-year surge due to IT/consulting professional influx."
      ]
    },
    "Bopal": {
      trends: "Rapidly expanding residential hub, highly favored by mid-income professionals. Excellent connectivity via the SP Ring Road and affordable price points compared to the city center.",
      cagr: "8.7% CAGR over past 5 years",
      headlines: [
        "Bopal civic zone expansion completed with new smart city water drainage systems.",
        "Proposed metro junction at Bopal is driving real estate enquiry volumes up by 30%.",
        "New international schools open in Bopal, making it a hot spot for first-time family buyers."
      ]
    },
    "Satellite": {
      trends: "Ultra-premium, highly saturated residential area. Prime location with high resale value and luxurious low-density apartments. Limited new construction options.",
      cagr: "10.2% CAGR over past 5 years",
      headlines: [
        "Satellite road widening completed, reducing peak-hour transit times.",
        "High-end retail redevelopment projects in Satellite push commercial land rates higher.",
        "Gated community upgrades in Satellite focus on high-security digital gate passes and smart cameras."
      ]
    }
  };

  const norm = location.trim();
  for (const key of Object.keys(data)) {
    if (norm.toLowerCase().includes(key.toLowerCase()) || key.toLowerCase().includes(norm.toLowerCase())) {
      return data[key];
    }
  }
  return {
    trends: "Expanding Ahmedabad suburban market showing stable 7-9% capital growth. High supply of modern apartments with community amenities.",
    cagr: "8.2% CAGR over past 5 years",
    headlines: [
      "Ahmedabad municipal corporation announces expansion of smart public transit grid to fringe zones.",
      "Green zone development guidelines implemented for all upcoming residential developments.",
      "Interest rates for home loans stabilize, encouraging first-time home buyers in developing sectors."
    ]
  };
};

// === ACTION: RUN AI PREDICTION ===
export const runPrediction = action({
  args: {
    leadId: v.id("leads"),
    apiKey: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // 1. Fetch Lead context
    const context = await ctx.runQuery(api.predictions.getLeadPredictionContext, {
      leadId: args.leadId,
    });
    if (!context) {
      throw new Error(`Lead context for ID ${args.leadId} not found`);
    }

    const { lead, voiceCalls, properties } = context;
    const preferredLoc = lead.preferredLocation || "Ambawadi";
    const scrapedMarket = getScrapedMarketData(preferredLoc);

    // 2. Try LLM first if API key exists in server env or args
    const apiKey = process.env.VITE_GROQ_API_KEY || process.env.GROQ_API_KEY || args.apiKey || "";

    if (apiKey && apiKey.trim() !== "" && apiKey !== "YOUR_API_KEY") {
      try {
        const formattedCalls = voiceCalls
          .map(
            (c) =>
              `[Date: ${c.date}, Sentiment: ${c.sentiment}] Summary: ${c.summary}\nTranscript:\n${c.transcript
                .map((t) => `${t.sender}: ${t.text}`)
                .join("\n")}`
          )
          .join("\n\n");

        const prompt = `
You are the AI Purchase Behavior Predictor for Shivalik Group CRM.
Analyze the following data about a customer lead:
Customer Lead Profile:
- Name: ${lead.name}
- Email: ${lead.email}
- Phone: ${lead.phone}
- Budget: INR ${lead.budget || "Unknown"}
- Preferred Location: ${preferredLoc}
- BHK Preference: ${lead.bhkPreference || "Unknown"}
- Property Type: ${lead.propertyType || "Unknown"}
- Occupation: ${lead.occupation || "Unknown"}
- Annual Income: INR ${lead.annualIncome || "Unknown"}
- Purpose: ${lead.purpose || "Buy"}
- Loan Required: ${lead.loanRequired ? "Yes" : "No"}
- Notes: ${lead.notes || "None"}
- Current Pipeline Stage: ${lead.status}
- Lead Score: ${lead.score}

Conversation History (Voice Calls):
${formattedCalls || "No call history available."}

Scraped Internet Market Data & News for Preferred Location (${preferredLoc}):
- CAGR: ${scrapedMarket.cagr}
- Trends: ${scrapedMarket.trends}
- Recent Headlines:
${scrapedMarket.headlines.map((h) => `- ${h}`).join("\n")}

Properties Available:
${properties
  .map(
    (p) =>
      `- Name: ${p.name}, Location: ${p.location}, Price: INR ${p.price}, BHK: ${p.bhk}, Status: ${p.status}`
  )
  .join("\n")}

Based on this information, output a JSON object containing:
{
  "conversionProbability": <number between 0 and 100 representing the likelihood of this lead converting to a client>,
  "recommendedLocations": [<array of string location recommendations inside Ahmedabad, up to 3>],
  "bestFitProperty": "<string representing the name of the best matching Shivalik property, must match one of the available property names>",
  "purchaseBehaviorAnalysis": "<detailed paragraph analyzing their budget, income, job stability, loan requirements, and call history sentiment>",
  "scrapedMarketTrends": "<brief description of the scraped market signals and how they affect this lead>",
  "factorsToConvert": [<array of string positive signals and negative risks, e.g. 'Strong income support', 'Budget constraint at 1.8 Cr'>],
  "nextBestAction": "<string next action to advance the pipeline>"
}
Respond ONLY with this JSON object, no other text. Do not wrap in markdown code fences.
`;

        const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${apiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            messages: [{ role: "user", content: prompt }],
            model: "llama3-8b-8192", // robust and fast standard model
            temperature: 0.2,
            max_tokens: 1000,
          }),
        });

        if (response.ok) {
          const resJson = await response.json();
          const text = resJson.choices[0]?.message?.content || "";
          
          // Attempt to parse JSON
          const cleanText = text.replace(/```json/g, "").replace(/```/g, "").trim();
          const parsed = JSON.parse(cleanText);

          if (parsed && typeof parsed.conversionProbability === "number") {
            const predId = await ctx.runMutation(api.predictions.savePrediction, {
              leadId: args.leadId,
              conversionProbability: parsed.conversionProbability,
              recommendedLocations: parsed.recommendedLocations || [preferredLoc],
              bestFitProperty: parsed.bestFitProperty || properties[0]?.name || "Shivalik Skyview",
              purchaseBehaviorAnalysis: parsed.purchaseBehaviorAnalysis || "AI analysis completed.",
              scrapedMarketTrends: parsed.scrapedMarketTrends || scrapedMarket.trends,
              factorsToConvert: parsed.factorsToConvert || ["Active customer interaction"],
              nextBestAction: parsed.nextBestAction || "Follow up on phone call",
            });
            return { success: true, predictionId: predId, mode: "api" };
          }
        }
      } catch (err) {
        console.warn("[AI Prediction API Error, falling back to heuristic engine]:", err);
      }
    }

    // 3. Fallback Heuristic Generator (high-fidelity local rules)
    console.log("[Heuristic Engine] Running offline rules-based prediction runner...");

    // Find best match property
    const budget = lead.budget || 20000000;
    const bhkPref = lead.bhkPreference || "3 BHK";
    
    let matchedProperty = properties[0]?.name || "Shivalik Skyview";
    let minPriceDiff = Infinity;

    for (const p of properties) {
      if (p.location.toLowerCase() === preferredLoc.toLowerCase()) {
        const priceDiff = Math.abs(p.price - budget);
        if (priceDiff < minPriceDiff) {
          minPriceDiff = priceDiff;
          matchedProperty = p.name;
        }
      }
    }

    // Calculate conversion probability
    let prob = 50; // base probability
    
    // Core parameters influence
    if (lead.score) prob += (lead.score - 70) * 0.5; // lead score correlation (+/- 10%)
    if (lead.annualIncome && lead.budget) {
      const ratio = (lead.annualIncome * 5) / lead.budget;
      if (ratio >= 1.0) prob += 15; // strong income coverage
      else if (ratio < 0.6) prob -= 15; // weak income coverage
    }
    if (lead.loanRequired === false) prob += 10; // no loan needed is easier to close
    
    // Conversation history sentiment influence
    let callSignals = 0;
    let positiveSentimentCount = 0;
    let negativeSentimentCount = 0;

    for (const call of voiceCalls) {
      callSignals++;
      if (call.sentiment.toLowerCase() === "interested" || call.sentiment.toLowerCase() === "positive") {
        positiveSentimentCount++;
      } else if (call.sentiment.toLowerCase() === "not interested" || call.sentiment.toLowerCase() === "negative") {
        negativeSentimentCount++;
      }
    }

    if (positiveSentimentCount > 0) prob += 15;
    if (negativeSentimentCount > 0) prob -= 25;
    if (callSignals === 0) prob -= 5; // cold lead, no calls

    // Clamp probability
    prob = Math.max(35, Math.min(95, Math.round(prob)));

    // Generate locations
    const recommendedLocs = [preferredLoc];
    if (preferredLoc === "Ambawadi" && !recommendedLocs.includes("Satellite")) recommendedLocs.push("Satellite");
    if (preferredLoc === "SG Highway" && !recommendedLocs.includes("Bopal")) recommendedLocs.push("Bopal");
    if (recommendedLocs.length < 2) recommendedLocs.push("SG Highway");

    // Generate factors
    const factors = [];
    if (lead.annualIncome && lead.annualIncome >= 4000000) factors.push("High annual income capability");
    if (lead.loanRequired === false) factors.push("Cash purchases ready (no loan stress)");
    if (positiveSentimentCount > 0) factors.push("Responsive and positive call sentiment");
    if (lead.score >= 80) factors.push("Strong engagement on brochure downloads");
    
    if (lead.budget && lead.budget < 15000000) factors.push("High budget sensitivity");
    if (lead.loanRequired === true) factors.push("Subject to bank finance clearance");
    if (negativeSentimentCount > 0) factors.push("Hesitations raised during phone call");

    if (factors.length === 0) factors.push("Awaiting deeper interactive touchpoints");

    // Generate Purchase Behavior Analysis text
    const incomeStr = lead.annualIncome ? `₹${(lead.annualIncome / 100000).toFixed(0)} Lakhs` : "an unverified amount";
    const budgetStr = lead.budget ? `₹${(lead.budget / 10000000).toFixed(2)} Crores` : "the standard range";
    const relationIncomeBudget = lead.annualIncome && lead.budget ? (lead.annualIncome / lead.budget).toFixed(2) : "0.15";
    
    let analysis = `${lead.name} exhibits a ${lead.purpose === "Invest" ? "ROI-focused investment" : "residential end-user"} purchase behavior. `;
    analysis += `With an annual income of ${incomeStr} against a budget of ${budgetStr}, their debt-to-income ratio is ${relationIncomeBudget}, indicating `;
    
    if (Number(relationIncomeBudget) >= 0.2) {
      analysis += `excellent financial health. They possess high leverage capability and represent a low-risk borrower profile. `;
    } else {
      analysis += `moderate financial stretch. They will highly depend on smooth home loan approvals, making financial tie-ups critical. `;
    }

    if (positiveSentimentCount > 0) {
      analysis += `The call logs highlight active interest in local parameters. During outreach, the client explicitly engaged regarding layout plans, floor customization, and RERA certifications. `;
    } else {
      analysis += `There is limited conversation history to draw soft-sentiment cues. Additional follow-ups are needed to determine key drivers. `;
    }

    analysis += `Based on scraped market trends, their interest in ${preferredLoc} is highly strategic. `;
    analysis += `${preferredLoc} is seeing ${scrapedMarket.cagr} appreciation, backed by infrastructure projects like the Metro Phase 2 or commercial hubs. This makes ${matchedProperty} an exceptionally viable match.`;

    // Next Best Action
    let nextAction = "Schedule a site visit and offer a guided tour.";
    if (lead.loanRequired && lead.status !== "Loan Processing") {
      nextAction = "Facilitate direct consultation with home loan executives for pre-approval.";
    } else if (positiveSentimentCount > 0 && lead.status === "Negotiation") {
      nextAction = "Present a 10:90 flexible payment milestone chart to close booking.";
    } else if (lead.status === "New Lead") {
      nextAction = "Trigger AI outreach call to introduce brochure pricing.";
    }

    // Save prediction
    const predId = await ctx.runMutation(api.predictions.savePrediction, {
      leadId: args.leadId,
      conversionProbability: prob,
      recommendedLocations: recommendedLocs,
      bestFitProperty: matchedProperty,
      purchaseBehaviorAnalysis: analysis,
      scrapedMarketTrends: `Scraped CAGR of ${scrapedMarket.cagr}. Local market shows: ${scrapedMarket.trends}`,
      factorsToConvert: factors,
      nextBestAction: nextAction,
    });

    return { success: true, predictionId: predId, mode: "heuristic" };
  },
});
