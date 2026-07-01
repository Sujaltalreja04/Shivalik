import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { api } from "./_generated/api";

// === QUERY: GET VOICE CALL HISTORY ===
export const getVoiceCalls = query({
  args: {
    leadId: v.optional(v.id("leads"))
  },
  handler: async (ctx, args) => {
    if (args.leadId) {
      return await ctx.db
        .query("voiceCalls")
        .filter((q) => q.eq(q.field("leadId"), args.leadId))
        .collect();
    }
    return await ctx.db.query("voiceCalls").order("desc").collect();
  },
});

// === MUTATION: SAVE VOICE CALL RECORD ===
export const saveVoiceCall = mutation({
  args: {
    leadId: v.id("leads"),
    leadName: v.string(),
    project: v.string(),
    status: v.string(),
    duration: v.number(),
    transcript: v.array(v.object({
      sender: v.string(),
      text: v.string(),
      time: v.string()
    })),
    summary: v.string(),
    sentiment: v.string(),
    brochureSent: v.boolean(),
    followupScheduled: v.boolean(),
  },
  handler: async (ctx, args) => {
    const callId = await ctx.db.insert("voiceCalls", {
      ...args,
      date: new Date().toISOString().split('T')[0]
    });
    return callId;
  },
});

// === MUTATION: EXECUTE PIPELINE AUTOMATION ATOMICALLY ===
export const executePipelineAutomation = mutation({
  args: {
    leadId: v.id("leads"),
    language: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const lead = await ctx.db.get("leads", args.leadId);
    if (!lead) {
      throw new Error(`Lead with ID ${args.leadId} not found`);
    }

    const leadName = lead.name;
    const project = lead.project || "Shivalik Skyview";
    const email = lead.email || "client@shivalik.com";
    const bhk = lead.bhkPreference || "3 BHK";

    // Detect lead gender for correct Indic grammar
    const femaleFirstNames = [
      "priya", "neha", "aarti", "sonia", "rhea", "diya", "ananya", "pooja", 
      "tanvi", "isha", "kiara", "manisha", "vidya", "sunita", "kavita", "geeta", 
      "reena", "seema", "deepa", "rekha", "kavya", "ishita", "shreya", "shruti", 
      "suhani", "rupali", "simran", "poonam", "nisha", "meera", "lata", "radha", 
      "anjali", "swati", "mamta", "sapna", "ritu", "shalini", "divya", "archana", 
      "amita", "heena", "hema", "nita", "rita", "shanta", "asha", "usha", 
      "kiran", "manju", "saroj", "sudha", "rama", "leela", "vimla", "pushpa"
    ];
    const leadFirstName = leadName.split(" ")[0];
    const isFemaleLead = femaleFirstNames.includes(
      leadFirstName.trim().toLowerCase()
    );

    const getGujHonorific = (name: string) => {
      if (!name) return "";
      return isFemaleLead ? "બહેન" : "ભાઈ";
    };

    const language = args.language || "en";

    const formatBudget = (budgetNum: number, lang: string): string => {
      const crores = Math.floor(budgetNum / 10000000);
      const rem = budgetNum % 10000000;
      const lakhs = Math.floor(rem / 100000);

      if (lang === "hi") {
        const parts = [];
        if (crores > 0) parts.push(`${crores} करोड़`);
        if (lakhs > 0) parts.push(`${lakhs} लाख`);
        return parts.join(" ") || "0 लाख";
      } else if (lang === "gu") {
        const parts = [];
        if (crores > 0) parts.push(`${crores} કરોડ`);
        if (lakhs > 0) parts.push(`${lakhs} લાખ`);
        return parts.join(" ") || "0 લાખ";
      } else {
        const parts = [];
        if (crores > 0) parts.push(`${crores} Crore${crores > 1 ? "s" : ""}`);
        if (lakhs > 0) parts.push(`${lakhs} Lakh${lakhs > 1 ? "s" : ""}`);
        return parts.join(" ") || "0 Lakhs";
      }
    };

    const rawBudget = lead.budget || 18000000;
    const budgetStr = formatBudget(rawBudget, language);

    let transcript = [];
    let callSummary = "";
    let sentiment = "Interested";

    const agentGender: "male" | "female" = "male";

    const guAgentSpeaking =
      agentGender === "male" ? "કરી રહ્યો છું" : "કરી રહી છું";

    const guAgentCall =
      agentGender === "male" ? "બોલી રહ્યો છું" : "બોલી રહી છું";

    const hiAgentCall =
      agentGender === "male" ? "बोल रहा हूँ" : "बोल रही हूँ";

    const hiAgentSpeak =
      agentGender === "male" ? "रहा" : "रही";

    if (language === "hi") {
      const lRaha  = isFemaleLead ? "रही" : "रहा";
      const lTha   = isFemaleLead ? "थी" : "था";
      const lDijiye = "दीजिए";
      const lSaku  = "सकूँ";

      transcript = [
        {
          sender: "agent",
          text: `नमस्ते, क्या मैं ${leadName} जी से बात कर ${hiAgentSpeak} हूँ?`,
          time: "0:02"
        },
        {
          sender: "lead",
          text: `हाँ, मैं ${leadName} बोल ${lRaha} हूँ। आप कौन?`,
          time: "0:06"
        },
        {
          sender: "agent",
          text: `नमस्ते! मैं शिवालिक ग्रुप से बात कर ${hiAgentSpeak} हूँ। मुझे दिखा कि आपने हमारी परियोजना ${project} में रुचि दिखाई थी और ${bhk} फ़्लैट के विकल्प देख रहे थे। क्या यह आपसे बात करने का सही समय है?`,
          time: "0:18"
        },
        {
          sender: "lead",
          text: `हाँ, मैं देख ${lRaha} ${lTha}। मुझे ${budgetStr} के बजट के आसपास कोई अच्छा फ़्लैट चाहिए। क्या आपके पास विकल्प उपलब्ध हैं?`,
          time: "0:25"
        },
        {
          sender: "agent",
          text: `बिल्कुल! हमारे पास ${project} में बहुत अच्छे विकल्प हैं जो आपके बजट में आते हैं। इनमें बेहतरीन धूप, खुली बालकनी और स्मार्ट होम सुविधाएं हैं। क्या मैं आपको आधिकारिक RERA-रजिस्टर्ड PDF ब्रोशर भेज दूँ?`,
          time: "0:42"
        },
        {
          sender: "lead",
          text: `हाँ, ज़रूर भेज ${lDijiye} ताकि मैं फ़्लोर प्लान देख ${lSaku}।`,
          time: "0:48"
        },
        {
          sender: "agent",
          text: `बहुत बढ़िया! मैंने ब्रोशर भेजने की प्रक्रिया शुरू कर दी है। आपको व्हाट्सएप और ईमेल पर ब्रोशर का लिंक मिल जाएगा। मैं कल सुबह 11:00 बजे एक फ़ॉलो-अप कॉल भी शेड्यूल कर रही हूँ ताकि हमारी टीम आपके सवालों के जवाब दे सके। क्या यह ठीक रहेगा?`,
          time: "1:05"
        },
        {
          sender: "lead",
          text: `हाँ, कल सुबह 11 बजे ठीक है। धन्यवाद!`,
          time: "1:11"
        },
        {
          sender: "agent",
          text: `बहुत-बहुत धन्यवाद! ब्रोशर ज़रूर देखिएगा। कल बात करते हैं। आपका दिन शुभ हो!`,
          time: "1:20"
        }
      ];
      callSummary = `शिवालिक AI आउटरीच सफल रहा। ${leadName} ने ${project} के लिए ब्रोशर का अनुरोध किया। कल सुबह 11 बजे का फॉलो-अप शेड्यूल किया गया।`;
    } else if (language === "gu") {
      const honorific = getGujHonorific(leadName);
      const gShoDhiRaha = isFemaleLead ? "શોધી રહી છું" : "શોધી રહ્યો છું";
      const leadSalutation = isFemaleLead ? "બહેન" : "સાહેબ";

      transcript = [
        {
          sender: "agent",
          text: `નમસ્કાર ${leadName} ${honorific}, હું શિવાલિક ગ્રુપમાંથી ${guAgentCall}. શું આપ સાથે બે મિનિટ વાત કરી શકું?`,
          time: "0:02"
        },
        {
          sender: "lead",
          text: `હા, હું ${leadName} બોલું છું. બોલોને, આપ કોણ?`,
          time: "0:06"
        },
        {
          sender: "agent",
          text: `આપે થોડા દિવસ પહેલા અમારા ${project} પ્રોજેક્ટ અંગે પૂછપરછ કરી હતી. ખાસ કરીને ${bhk} ફ્લેટમાં આપનો રસ હતો. એટલે થોડું માર્ગદર્શન આપવા માટે ફોન કર્યો છે.`,
          time: "0:18"
        },
        {
          sender: "lead",
          text: `હા બોલો ${agentGender === "male" ? "સાહેબ" : "બહેન"}, હું હાલમાં ${budgetStr} ના બજેટમાં સારો ફ્લેટ ${gShoDhiRaha}. શું હાલ કોઈ યુનિટ ઉપલબ્ધ છે?`,
          time: "0:25"
        },
        {
          sender: "agent",
          text: `ચોક્કસ ${leadSalutation}. અમારા ${project} પ્રોજેક્ટમાં હાલમાં ખૂબ સરસ ${bhk} ના વિકલ્પો ઉપલબ્ધ છે. સારી હવા, કુદરતી પ્રકાશ, વિશાળ બાલ્કની અને તમામ આધુનિક સુવિધાઓ સાથે આવે છે. જો આપને અનુકૂળ હોય તો હું હમણાં જ અધિકૃત RERA મંજૂર બ્રોશર WhatsApp અને Email પર મોકલી દઉં?`,
          time: "0:42"
        },
        {
          sender: "lead",
          text: `હા જરૂર મોકલી આપો. હું અને મારો પરિવાર સાથે બેસીને ફ્લોર પ્લાન અને પ્રાઇસિંગ જોઈ લઈશું.`,
          time: "0:48"
        },
        {
          sender: "agent",
          text: `સરસ. બ્રોશર થોડા જ ક્ષણોમાં પહોંચી જશે. હું આવતીકાલે સવારે ૧૧ વાગ્યે ફરી સંપર્ક કરીશ જેથી આપના કોઈ પ્રશ્ન હોય તો તેનું માર્ગદર્શન આપી શકીએ.`,
          time: "1:05"
        },
        {
          sender: "lead",
          text: `બરાબર ${agentGender === "male" ? "સાહેબ" : "બહેન"}. આવતીકાલે સવારે વાત કરીએ. આભાર.`,
          time: "1:11"
        },
        {
          sender: "agent",
          text: `ખૂબ ખૂબ આભાર ${leadName} ${honorific}. આપનો કિંમતી સમય આપવા બદલ આભાર. બ્રોશર જરૂર જોઈ લેજો. શુભ દિવસ.`,
          time: "1:20"
        }
      ];
      callSummary = `શિવાલિક AI આઉટરીચ સફળ રહ્યો. ${leadName} એ પ્રોજેક્ટ ${project} માટે RERA બ્રોશર મંગાવ્યું. કાલે સવારે ૧૧ વાગ્યાનો ફોલો-અપ નક્કી કર્યો.`;
    } else {
      transcript = [
        {
          sender: "agent",
          text: `Hello, is this ${leadName}?`,
          time: "0:02"
        },
        {
          sender: "lead",
          text: `Yes, this is ${leadName}. Who is this?`,
          time: "0:06"
        },
        {
          sender: "agent",
          text: `Hi ${leadName}! I'm calling from Shivalik Group CRM. I see you recently inquired about our luxury residential high-rise project, ${project}, and were specifically checking options for a premium ${bhk} layout. Am I reaching you at a good time?`,
          time: "0:18"
        },
        {
          sender: "lead",
          text: `Yes, I was looking at that. I'm searching for a property in that neighborhood with a budget around ${budgetStr}. Are there units available?`,
          time: "0:25"
        },
        {
          sender: "agent",
          text: `Yes, absolutely! We have a few premium garden-facing ${bhk} options in ${project} that align perfectly with your budget. They feature high sunlight ratings, structural height optimization, and modern glassmorphic balconies. Would you like me to send you the official RERA-registered PDF brochure?`,
          time: "0:42"
        },
        {
          sender: "lead",
          text: `Yes, definitely. Please send it over so I can review the floor plans.`,
          time: "0:48"
        },
        {
          sender: "agent",
          text: `Wonderful! I have triggered the brochure dispatch system. You'll receive the PDF download link on WhatsApp and your email, ${email}, right away. I'm also scheduling an automated follow-up call for tomorrow at 11:00 AM so our coordinator can answer any structural questions. Would that be alright?`,
          time: "1:05"
        },
        {
          sender: "lead",
          text: `Sure, tomorrow at 11 AM works for me. Thanks for the quick call!`,
          time: "1:11"
        },
        {
          sender: "agent",
          text: `Excellent. Enjoy reviewing the brochure, and we will connect tomorrow. Have a great day, ${leadName}!`,
          time: "1:20"
        }
      ];
      callSummary = `Simulated AI outreach call successful. Customer confirmed interest in a ${bhk} at ${project} with a budget of ${budgetStr}. RERA brochure sent automatically, and a next-day follow-up call has been scheduled.`;
    }

    // 2. Save the Call Log to database
    const callId = await ctx.db.insert("voiceCalls", {
      leadId: args.leadId,
      leadName: leadName,
      project: project,
      status: "Completed",
      duration: 80,
      transcript: transcript,
      summary: callSummary,
      sentiment: sentiment,
      brochureSent: true,
      followupScheduled: true,
      date: new Date().toISOString().split('T')[0]
    });

    // 3. Update the Lead's details and automation flags
    await ctx.db.patch(args.leadId, {
      status: "Contacted",
      score: Math.min(lead.score + 15, 95), // Increase lead score
      action: "Review Brochure Response",
      automationStatus: "Follow-up Scheduled",
      lastCallId: callId,
      brochureSent: true,
      brochureSentTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    });

    // 4. Schedule Follow-up Task in followups table
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = tomorrow.toISOString().split('T')[0];

    await ctx.db.insert("followups", {
      leadId: args.leadId.toString(),
      leadName: leadName,
      date: tomorrowStr,
      time: "11:00",
      task: `Nurture follow-up: Check layout feedback for ${project} (${bhk}) following the automated brochure delivery.`,
      status: "Pending",
      assignedTo: "Sujal Talreja"
    });

    // 5. Log in Activity Stream
    await ctx.db.insert("activityStream", {
      message: `Sales automation complete for ${leadName}: voice call finished, PDF brochure sent, and follow-up scheduled.`,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    });

    return {
      callId,
      transcript,
      summary: callSummary,
      sentiment
    };
  }
});

// === MUTATION: RESET LEAD AUTOMATION STATE (FOR TESTING / DEMOS) ===
export const resetLeadAutomation = mutation({
  args: {
    leadId: v.id("leads")
  },
  handler: async (ctx, args) => {
    // Delete any voice calls associated with this lead
    const calls = await ctx.db
      .query("voiceCalls")
      .filter((q) => q.eq(q.field("leadId"), args.leadId))
      .collect();

    for (const call of calls) {
      await ctx.db.delete(call._id);
    }

    // Reset lead fields to default
    await ctx.db.patch(args.leadId, {
      status: "New Lead",
      score: 75,
      action: "New inquiry received",
      automationStatus: undefined,
      lastCallId: undefined,
      brochureSent: undefined,
      brochureSentTime: undefined
    });

    // Add activity stream event
    await ctx.db.insert("activityStream", {
      message: `Reset pipeline automation state for lead ID ${args.leadId}`,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    });

    return true;
  }
});
