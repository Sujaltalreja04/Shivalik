import React, { useState, useEffect, useRef } from 'react';
import { 
  Activity, Edit, Plus, Trash2, Phone, Mail, MapPin, X, Calendar, 
  MessageSquare, FileText, Sparkles, Send, UploadCloud, CheckCircle, 
  Smartphone, Download, DollarSign, Briefcase, Award, TrendingUp, 
  Users, Shield, Clock, FileCheck, Check, UserPlus, FileSignature,
  Layout, Building, Cpu, Volume2, VolumeX, PhoneCall, PhoneOff, RotateCcw,
  History
} from 'lucide-react';
import jsPDF from 'jspdf';
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";

const fallbackLeads = [
  {
    _id: "mock-lead-1",
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
    notes: "Requires high floor with east facing layout. Interested in flexible payment plan.",
    automationStatus: ""
  },
  {
    _id: "mock-lead-2",
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
    notes: "Wants a peaceful view of clubhouse. Prefers early possession.",
    automationStatus: ""
  },
  {
    _id: "mock-lead-3",
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
    notes: "Pure investment play. Looking for maximum ROI and rental yield.",
    automationStatus: ""
  },
  {
    _id: "mock-lead-4",
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
    notes: "First-time home buyer, extremely budget-sensitive.",
    automationStatus: ""
  }
];

const fallbackBuilders = [
  {
    _id: "mock-builder-1",
    name: "Shivalik Group",
    company: "Shivalik Projects Limited",
    contact: "+91 79 3500 1100",
    activeProjects: ["Shivalik Skyview", "Shivalik Highlife", "Shivalik Edge"],
    commissionAgreement: "2.5% commission payout. 1% upon execution of allotment letter, 1.5% upon registration."
  }
];

const fallbackBrokers = [
  {
    _id: "mock-broker-1",
    name: "Rohan Mehta",
    agency: "Amdavad Realty Experts",
    contact: "+91 98980 12345",
    reraNumber: "PR/GJ/AHMEDABAD/AG/110224",
    leadReferralsCount: 12,
    commissionEarned: 750000,
    status: "Active"
  },
  {
    _id: "mock-broker-2",
    name: "Sonia Shah",
    agency: "Elite Spaces Realty",
    contact: "+91 97777 88888",
    reraNumber: "PR/GJ/AHMEDABAD/AG/550625",
    leadReferralsCount: 8,
    commissionEarned: 480000,
    status: "Active"
  }
];

const fallbackPayments = [
  {
    _id: "mock-payment-1",
    leadId: "mock-lead-1",
    leadName: "Rahul Sharma",
    amount: 500000,
    date: "2026-06-20",
    stage: "Token Amount Paid",
    status: "Paid",
    gstAmount: 90000,
    receiptUrl: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf"
  },
  {
    _id: "mock-payment-2",
    leadId: "mock-lead-1",
    leadName: "Rahul Sharma",
    amount: 2000000,
    date: "2026-07-15",
    stage: "Foundation Slab Stage",
    status: "Pending",
    gstAmount: 360000,
    receiptUrl: ""
  },
  {
    _id: "mock-payment-3",
    leadId: "mock-lead-2",
    leadName: "Priya Patel",
    amount: 180000,
    date: "2026-06-22",
    stage: "Token Amount Paid",
    status: "Paid",
    gstAmount: 32400,
    receiptUrl: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf"
  }
];

const fallbackFollowups = [
  {
    _id: "mock-followup-1",
    leadId: "mock-lead-1",
    leadName: "Rahul Sharma",
    date: "2026-06-26",
    time: "14:30",
    task: "Verify HDFC home loan approval documents and interest rate negotiation.",
    status: "Pending",
    assignedTo: "Sujal Talreja"
  },
  {
    _id: "mock-followup-2",
    leadId: "mock-lead-2",
    leadName: "Priya Patel",
    date: "2026-06-26",
    time: "16:00",
    task: "Send updated floor customization options for the master bedroom.",
    status: "Pending",
    assignedTo: "Aarti Amin"
  }
];

export default function CRM() {
  // Convex Database Queries
  const leadsQuery = useQuery(api.leads?.getLeads);
  const [localLeads, setLocalLeads] = useState([]);
  const leads = leadsQuery === undefined ? undefined : (localLeads.length > 0 ? localLeads : (leadsQuery.length > 0 ? leadsQuery : fallbackLeads));

  // Sync leads query results into local state wrapper
  useEffect(() => {
    if (leadsQuery !== undefined) {
      if (leadsQuery.length > 0) {
        setLocalLeads(leadsQuery);
      } else {
        setLocalLeads(fallbackLeads);
      }
    }
  }, [leadsQuery]);

  const activityStream = useQuery(api.activity?.getActivity);
  const inventory = useQuery(api.inventory?.getInventory);
  const properties = useQuery(api.properties?.getProperties) || [];

  const buildersQuery = useQuery(api.crm?.getBuilders);
  const builders = buildersQuery === undefined ? undefined : (buildersQuery.length > 0 ? buildersQuery : fallbackBuilders);

  const brokersQuery = useQuery(api.crm?.getBrokers);
  const brokers = brokersQuery === undefined ? undefined : (brokersQuery.length > 0 ? brokersQuery : fallbackBrokers);

  const paymentsQuery = useQuery(api.crm?.getPayments);
  const payments = paymentsQuery === undefined ? undefined : (paymentsQuery.length > 0 ? paymentsQuery : fallbackPayments);

  const followupsQuery = useQuery(api.crm?.getFollowups);
  const [localFollowups, setLocalFollowups] = useState([]);
  const followups = followupsQuery === undefined ? undefined : (localFollowups.length > 0 ? localFollowups : (followupsQuery.length > 0 ? followupsQuery : fallbackFollowups));

  // Sync followups query results into local state wrapper
  useEffect(() => {
    if (followupsQuery !== undefined) {
      if (followupsQuery.length > 0) {
        setLocalFollowups(followupsQuery);
      } else {
        setLocalFollowups(fallbackFollowups);
      }
    }
  }, [followupsQuery]);

  const siteVisits = useQuery(api.crm?.getSiteVisits);

  // Convex Database Mutations
  const addLead = useMutation(api.leads?.addLead);
  const updateLeadStatus = useMutation(api.leads?.updateLeadStatus);
  const updateLeadDetails = useMutation(api.leads?.updateLeadDetails);
  const deleteLead = useMutation(api.leads?.deleteLead);
  const addActivity = useMutation(api.activity?.addActivity);

  const addBuilder = useMutation(api.crm?.addBuilder);
  const addBroker = useMutation(api.crm?.addBroker);
  const updateBrokerReferral = useMutation(api.crm?.updateBrokerReferral);
  const addPayment = useMutation(api.crm?.addPayment);
  const updatePaymentStatus = useMutation(api.crm?.updatePaymentStatus);
  const addFollowup = useMutation(api.crm?.addFollowup);
  const updateFollowupStatus = useMutation(api.crm?.updateFollowupStatus);
  const deleteFollowup = useMutation(api.crm?.deleteFollowup);
  const addSiteVisit = useMutation(api.crm?.addSiteVisit);
  const updateSiteVisitFeedback = useMutation(api.crm?.updateSiteVisitFeedback);

  // Sales Automation queries and mutations
  const voiceCalls = useQuery(api.automation?.getVoiceCalls) || [];
  const [localVoiceCalls, setLocalVoiceCalls] = useState([]);
  const allVoiceCalls = [...localVoiceCalls, ...voiceCalls];
  const executeAutomation = useMutation(api.automation?.executePipelineAutomation);
  const resetLeadAutomation = useMutation(api.automation?.resetLeadAutomation);

  // CRM Navigation Sub-Tab State
  const [crmTab, setCrmTab] = useState('pipeline');

  // Selected Lead & Modal State
  const [selectedLead, setSelectedLead] = useState(null);
  const [activeProfileTab, setActiveProfileTab] = useState('profile');
  const [isAddingLead, setIsAddingLead] = useState(false);

  // Form Local States
  const [commsInput, setCommsInput] = useState("");
  const [uploadedDocs, setUploadedDocs] = useState([
    { name: 'Aadhaar_Card.pdf', date: '2026-06-20', status: 'Verified' },
    { name: 'Income_Proof.pdf', date: '2026-06-21', status: 'Verified' }
  ]);
  const [showSmartMatchResults, setShowSmartMatchResults] = useState(false);

  // Add Lead Form State
  const [newLead, setNewLead] = useState({
    name: '', phone: '', email: '', project: 'Shivalik Skyview', score: 75, status: 'New Lead', source: 'Website Chat',
    budget: 20000000, preferredLocation: 'Ambawadi', propertyType: 'Apartment', bhkPreference: '3 BHK', purpose: 'Buy',
    loanRequired: true, assignedExecutive: 'Sujal Talreja', familyDetails: '', occupation: '', annualIncome: 2000000, notes: ''
  });

  // Add Follow-up Form State
  const [newFollowup, setNewFollowup] = useState({
    leadId: '', date: '', time: '', task: '', assignedTo: 'Sujal Talreja'
  });

  // Add Payment Form State
  const [newPayment, setNewPayment] = useState({
    leadId: '', amount: 100000, stage: 'Token Amount Paid', status: 'Paid'
  });

  // Add Builder Form State
  const [newBuilder, setNewBuilder] = useState({
    name: '', company: '', contact: '', activeProjects: '', commissionAgreement: ''
  });

  // Add Broker Form State
  const [newBroker, setNewBroker] = useState({
    name: '', agency: '', contact: '', reraNumber: '', status: 'Active'
  });

  // Add Site Visit Form State (inside Lead profile modal)
  const [newVisit, setNewVisit] = useState({
    date: '', time: '', type: 'Physical Site Tour', executive: 'Sujal Talreja', cabRequired: false, pickupLocation: '', feedback: '', interestLevel: 'Warm'
  });

  // Edit Lead Mode Local State (for profile modal fields)
  const [isEditingLeadFields, setIsEditingLeadFields] = useState(false);
  const [editableLeadFields, setEditableLeadFields] = useState({});

  // Sales Automation Local States
  const [activeAutoLeadId, setActiveAutoLeadId] = useState("");
  const [isCalling, setIsCalling] = useState(false);
  const [callStatus, setCallStatus] = useState("Idle"); // Idle, Dialing, Ringing, Connected, Completed
  const [isMuted, setIsMuted] = useState(false);
  const [activeCallLog, setActiveCallLog] = useState(null);
  const [visibleTranscript, setVisibleTranscript] = useState([]);
  const [selectedCallHistory, setSelectedCallHistory] = useState(null);
  const [automationLang, setAutomationLang] = useState("en"); // en, hi, gu
  const agentGender = "male";
  const [showWhatsAppSim, setShowWhatsAppSim] = useState(false);
  const [showEmailSim, setShowEmailSim] = useState(false);
  const [dispatchActiveTab, setDispatchActiveTab] = useState("whatsapp");
  
  // Audio Speech Synthesis reference
  const speechRef = useRef(null);

  // Audio reference for Sarvam TTS playback
  const sarvamAudioRef = useRef(null);
  const audioPrefetchMap = useRef({});

  // Helper: split text into ≤500 char chunks on sentence boundaries
  const chunkText = (text, maxLen = 480) => {
    if (text.length <= maxLen) return [text];
    const chunks = [];
    // Split on sentence-ending punctuation (supports Devanagari ।)
    const parts = text.split(/(?<=[।.!?])\s+/);
    let current = "";
    for (const part of parts) {
      if ((current + " " + part).trim().length <= maxLen) {
        current = (current + " " + part).trim();
      } else {
        if (current) chunks.push(current);
        // If a single part is still too long, hard-split it
        if (part.length > maxLen) {
          let remaining = part;
          while (remaining.length > maxLen) {
            chunks.push(remaining.slice(0, maxLen));
            remaining = remaining.slice(maxLen);
          }
          current = remaining;
        } else {
          current = part;
        }
      }
    }
    if (current) chunks.push(current);
    return chunks.filter(c => c.trim().length > 0);
  };

  // Play a base64 WAV string, returns a Promise that resolves when audio ends
  const playBase64Audio = (base64) => new Promise((resolve) => {
    try {
      const byteChars = atob(base64);
      const byteArr = new Uint8Array(byteChars.length);
      for (let i = 0; i < byteChars.length; i++) byteArr[i] = byteChars.charCodeAt(i);
      const blob = new Blob([byteArr], { type: "audio/wav" });
      const url = URL.createObjectURL(blob);
      const audio = new Audio(url);
      sarvamAudioRef.current = audio;
      audio.onended = () => { URL.revokeObjectURL(url); resolve(); };
      audio.onerror  = (e) => { 
        console.error("[TTS] Audio playback error event:", e); 
        URL.revokeObjectURL(url); 
        resolve(); 
      };
      audio.play().catch((err) => {
        console.error("[TTS] Audio play() promise rejected:", err);
        resolve();
      });
    } catch (err) {
      console.error("[TTS] playBase64Audio conversion error:", err);
      resolve();
    }
  });

  const normalizeTextForTTS = (text, langCode) => {
    if (!text) return "";

    const lakhsToWords = (lakhsVal, lang) => {
      const crores = Math.floor(lakhsVal / 100);
      const remainingLakhs = lakhsVal % 100;
      
      const numberNamesEn = {
        0: "", 1: "one", 2: "two", 3: "three", 4: "four", 5: "five", 6: "six", 7: "seven", 8: "eight", 9: "nine", 10: "ten",
        11: "eleven", 12: "twelve", 13: "thirteen", 14: "fourteen", 15: "fifteen", 16: "sixteen", 17: "seventeen", 18: "eighteen", 19: "nineteen",
        20: "twenty", 30: "thirty", 40: "forty", 50: "fifty", 60: "sixty", 70: "seventy", 80: "eighty", 90: "ninety"
      };

      const numberNamesHi = {
        0: "", 1: "एक", 2: "दो", 3: "तीन", 4: "चार", 5: "पांच", 6: "छह", 7: "सात", 8: "आठ", 9: "नौ", 10: "दस",
        11: "ग्यारह", 12: "बारह", 13: "तेरह", 14: "चौदह", 15: "पंद्रह", 16: "सोलह", 17: "सत्रह", 18: "अठारह", 19: "उन्नीस",
        20: "बीस", 25: "पच्चीस", 30: "तीस", 40: "चालीस", 50: "पचास", 60: "साठ", 70: "सत्तर", 80: "अस्सी", 90: "नब्बे"
      };

      const numberNamesGu = {
        0: "", 1: "એક", 2: "બે", 3: "ત્રણ", 4: "ચાર", 5: "પાંચ", 6: "છ", 7: "સાત", 8: "આઠ", 9: "નવ", 10: "દસ",
        11: "અગિયાર", 12: "બાર", 13: "તેર", 14: "ચૌદ", 15: "પંદર", 16: "સોળ", 17: "સત્તર", 18: "અઢાર", 19: "ઓગણીસ",
        20: "વીસ", 25: "પચ્ચીસ", 30: "ત્રીસ", 40: "ચાલીસ", 50: "પચાસ", 60: "સાઠ", 70: "સીંતેર", 80: "એંસી", 90: "નેવુ"
      };

      const getTwoDigitWords = (val, names) => {
        if (names[val]) return names[val];
        const tens = Math.floor(val / 10) * 10;
        const ones = val % 10;
        return `${names[tens]} ${names[ones]}`;
      };

      if (lang === "hi") {
        let parts = [];
        if (crores > 0) parts.push(`${getTwoDigitWords(crores, numberNamesHi)} करोड़`);
        if (remainingLakhs > 0) parts.push(`${getTwoDigitWords(remainingLakhs, numberNamesHi)} लाख`);
        return parts.join(" ");
      } else if (lang === "gu") {
        let parts = [];
        if (crores > 0) parts.push(`${getTwoDigitWords(crores, numberNamesGu)} કરોડ`);
        if (remainingLakhs > 0) parts.push(`${getTwoDigitWords(remainingLakhs, numberNamesGu)} લાખ`);
        return parts.join(" ");
      } else {
        let parts = [];
        if (crores > 0) parts.push(`${getTwoDigitWords(crores, numberNamesEn)} crore`);
        if (remainingLakhs > 0) parts.push(`${getTwoDigitWords(remainingLakhs, numberNamesEn)} lakh`);
        return parts.join(" ");
      }
    };

    let clean = text;

    if (langCode === "hi-IN") {
      clean = clean.replace(/2\s*BHK/gi, "टू बीएचके");
      clean = clean.replace(/3\s*BHK/gi, "थ्री बीएचके");
      clean = clean.replace(/4\s*BHK/gi, "फोर बीएचके");
      clean = clean.replace(/11:00\s*बजे/g, "ग्यारह बजे");
      clean = clean.replace(/11:00/g, "ग्यारह");
      
      clean = clean.replace(/(\d+)\s*करोड़\s*(\d+)\s*लाख/g, (match, p1, p2) => {
        const cVal = parseInt(p1, 10);
        const lVal = parseInt(p2, 10);
        return lakhsToWords(cVal * 100 + lVal, "hi") + " रुपये";
      });
      clean = clean.replace(/(\d+)\s*करोड़/g, (match, p1) => {
        const cVal = parseInt(p1, 10);
        return lakhsToWords(cVal * 100, "hi") + " रुपये";
      });
      clean = clean.replace(/(\d+)\s*लाख/g, (match, p1) => {
        const lVal = parseInt(p1, 10);
        return lakhsToWords(lVal, "hi") + " रुपये";
      });
      clean = clean.replace(/₹(\d+)\s*लाख/g, (match, p1) => {
        const num = parseInt(p1, 10);
        return lakhsToWords(num, "hi") + " रुपये";
      });
      clean = clean.replace(/₹/g, "रुपये ");
      clean = clean.replace(/PDF/gi, "पीडीएफ");
      clean = clean.replace(/RERA/gi, "रेरा");

    } else if (langCode === "gu-IN") {
      clean = clean.replace(/2\s*BHK/gi, "ટુ બીએચકે");
      clean = clean.replace(/3\s*BHK/gi, "થ્રી બીએચકે");
      clean = clean.replace(/4\s*BHK/gi, "ફોર બીએચકે");
      clean = clean.replace(/11:00\s*વાગ્યે/g, "અગિયાર વાગ્યે");
      clean = clean.replace(/11:00/g, "અગિયાર");

      clean = clean.replace(/(\d+)\s*કરોડ\s*(\d+)\s*લાખ(ના|નો|ની|નું|માં)?/g, (match, p1, p2, p3) => {
        const cVal = parseInt(p1, 10);
        const lVal = parseInt(p2, 10);
        const suffix = p3 || "";
        const word = lakhsToWords(cVal * 100 + lVal, "gu");
        if (suffix === "ના") return word + " રૂપિયાના";
        if (suffix === "નો") return word + " રૂપિયાનો";
        if (suffix === "ની") return word + " રૂપિયાની";
        if (suffix === "નું") return word + " રૂપિયાનું";
        if (suffix === "માં") return word + " રૂપિયાના";
        return word + " રૂપિયા";
      });
      clean = clean.replace(/(\d+)\s*કરોડ(ના|નો|ની|નું|માં)?/g, (match, p1, p2) => {
        const cVal = parseInt(p1, 10);
        const suffix = p2 || "";
        const word = lakhsToWords(cVal * 100, "gu");
        if (suffix === "ના") return word + " રૂપિયાના";
        if (suffix === "નો") return word + " રૂપિયાનો";
        if (suffix === "ની") return word + " રૂપિયાની";
        if (suffix === "નું") return word + " રૂપિયાનું";
        if (suffix === "માં") return word + " રૂપિયાના";
        return word + " રૂપિયા";
      });
      clean = clean.replace(/(\d+)\s*લાખ(ના|નો|ની|નું|માં)?/g, (match, p1, p2) => {
        const lVal = parseInt(p1, 10);
        const suffix = p2 || "";
        const word = lakhsToWords(lVal, "gu");
        if (suffix === "ના") return word + " રૂપિયાના";
        if (suffix === "નો") return word + " રૂપિયાનો";
        if (suffix === "ની") return word + " રૂપિયાની";
        if (suffix === "નું") return word + " રૂપિયાનું";
        if (suffix === "માં") return word + " રૂપિયાના";
        return word + " રૂપિયા";
      });
      clean = clean.replace(/₹(\d+)\s*લાખ(ના|નો|ની|નું|માં)?/g, (match, p1, p2) => {
        const num = parseInt(p1, 10);
        const suffix = p2 || "";
        const word = lakhsToWords(num, "gu");
        if (suffix === "ના") return word + " રૂપિયાના";
        if (suffix === "નો") return word + " રૂપિયાનો";
        if (suffix === "ની") return word + " રૂપિયાની";
        if (suffix === "નું") return word + " રૂપિયાનું";
        if (suffix === "માં") return word + " રૂપિયાના";
        return word + " રૂપિયા";
      });
      clean = clean.replace(/₹/g, "રૂપિયા ");
      clean = clean.replace(/PDF/gi, "પીડીએફ");
      clean = clean.replace(/RERA/gi, "રેરા");

    } else {
      clean = clean.replace(/2\s*BHK/gi, "two B H K");
      clean = clean.replace(/3\s*BHK/gi, "three B H K");
      clean = clean.replace(/4\s*BHK/gi, "four B H K");
      clean = clean.replace(/11:00\s*AM/gi, "eleven A M");
      clean = clean.replace(/11:00/gi, "eleven");

      clean = clean.replace(/(\d+)\s*Crores?\s*(\d+)\s*Lakhs?/gi, (match, p1, p2) => {
        const cVal = parseInt(p1, 10);
        const lVal = parseInt(p2, 10);
        return lakhsToWords(cVal * 100 + lVal, "en") + " rupees";
      });
      clean = clean.replace(/(\d+)\s*Crores?/gi, (match, p1) => {
        const cVal = parseInt(p1, 10);
        return lakhsToWords(cVal * 100, "en") + " rupees";
      });
      clean = clean.replace(/(\d+)\s*Lakhs?/gi, (match, p1) => {
        const lVal = parseInt(p1, 10);
        return lakhsToWords(lVal, "en") + " rupees";
      });
      clean = clean.replace(/₹/g, "rupees ");
      clean = clean.replace(/RERA/gi, "Rera");
      clean = clean.replace(/PDF/gi, "P D F");
    }

    return clean;
  };

  // === SARVAM AI — Text-to-Speech for transcript lines ===
  const speakBrowserTTS = (text, lang, isAgent) => {
    return new Promise((resolve) => {
      if (!window.speechSynthesis) {
        resolve();
        return;
      }
      window.speechSynthesis.cancel();
      
      const utterance = new SpeechSynthesisUtterance(text);
      
      // Voice selection
      const voices = window.speechSynthesis.getVoices();
      let selectedVoice = null;
      if (lang === "hi") {
        selectedVoice = voices.find(v => v.lang.startsWith("hi") || v.name.toLowerCase().includes("hindi"));
      } else if (lang === "gu") {
        selectedVoice = voices.find(v => v.lang.startsWith("gu") || v.name.toLowerCase().includes("gujarati"));
        if (!selectedVoice) {
          selectedVoice = voices.find(v => v.lang.startsWith("hi") || v.name.toLowerCase().includes("hindi"));
        }
      } else {
        selectedVoice = voices.find(v => v.lang.startsWith("en-IN") || v.name.toLowerCase().includes("india") || v.lang.startsWith("en"));
      }
      
      if (selectedVoice) {
        utterance.voice = selectedVoice;
        utterance.lang = selectedVoice.lang;
      } else {
        utterance.lang = lang === "hi" ? "hi-IN" : lang === "gu" ? "gu-IN" : "en-IN";
      }

      if (lang === "gu") {
        utterance.rate = 0.78; // slower rate for clear Gujarati syllable articulation
      } else {
        utterance.rate = 0.88; // slightly slower for better local articulation
      }
      utterance.pitch = isAgent ? 1.05 : 0.95;

      let resolved = false;
      const done = () => {
        if (!resolved) {
          resolved = true;
          clearTimeout(timeoutId);
          resolve();
        }
      };

      utterance.onend = done;
      utterance.onerror = done;

      // Safety timeout: resolve if onend doesn't fire
      const durationLimit = Math.max(3000, text.length * 100);
      const timeoutId = setTimeout(() => {
        console.warn("[TTS] Speech synthesis timed out after", durationLimit, "ms");
        window.speechSynthesis.cancel();
        done();
      }, durationLimit);

      window.speechSynthesis.speak(utterance);
    });
  };

  const prefetchCallAudio = async (callLog) => {
    if (!callLog || !callLog.transcript) return;
    
    const apiKey = import.meta.env.VITE_SARVAM_API_KEY || "";
    if (!apiKey) return;
    
    const langMap = { en: "en-IN", hi: "hi-IN", gu: "gu-IN" };
    const langCode = langMap[automationLang] || "en-IN";
    const transcript = callLog.transcript;

    // Reset prefetch map to fetching status for all lines
    audioPrefetchMap.current = {};
    for (let i = 0; i < transcript.length; i++) {
      audioPrefetchMap.current[i] = { status: "fetching" };
    }

    const fetchLineAudio = async (line, idx) => {
      try {
        const cleanText = normalizeTextForTTS(line.text, langCode);
        
        // Detect speaker gender
        const femaleNames = ["priya", "neha", "aarti", "sonia", "rhea", "diya", "ananya", "pooja", "tanvi", "isha", "kiara", "manisha", "vidya", "sunita", "kavita", "geeta", "reena", "seema", "deepa", "rekha", "kavya", "ishita", "shreya", "shruti", "suhani", "rupali", "simran", "poonam", "nisha", "meera", "lata", "radha", "anjali", "swati", "mamta", "sapna", "ritu", "shalini", "divya", "archana", "amita", "heena", "hema", "nita", "rita", "shanta", "asha", "usha", "kiran", "manju", "saroj", "sudha", "rama", "leela", "vimla", "pushpa"];
        const isFemale = line.sender === "agent" 
          ? (agentGender === "female") 
          : (line.sender === "lead" && (() => {
              const selectedLead = leads?.find(l => l._id === activeAutoLeadId);
              if (selectedLead?.name) {
                const firstName = selectedLead.name.split(" ")[0];
                return femaleNames.includes(firstName.trim().toLowerCase());
              }
              return false;
            })());

        let speaker = "shubh";
        if (automationLang === "gu") {
          speaker = isFemale ? "shreya" : "ratan";
        } else if (automationLang === "hi") {
          speaker = isFemale ? "ritu" : "shubh";
        } else {
          speaker = isFemale ? "neha" : "aditya";
        }

        const chunks = chunkText(cleanText, 480);
        const audioData = [];
        
        for (const chunk of chunks) {
          const res = await fetch("https://api.sarvam.ai/text-to-speech", {
            method: "POST",
            headers: {
              "api-subscription-key": apiKey,
              "Content-Type": "application/json"
            },
            body: JSON.stringify({
              inputs: [chunk],
              target_language_code: langCode,
              speaker: speaker,
              pace: 1.0,
              speech_sample_rate: 22050,
              enable_preprocessing: true,
              model: "bulbul:v3",
              output_audio_codec: "wav"
            })
          });

          if (res.ok) {
            const data = await res.json();
            const base64Audio = data?.audios?.[0];
            if (base64Audio) {
              audioData.push(base64Audio);
            }
          } else {
            throw new Error(`Status ${res.status}`);
          }
        }
        audioPrefetchMap.current[idx] = { status: "success", audios: audioData };
      } catch (err) {
        console.warn(`[Prefetch] Failed for line ${idx}:`, err);
        audioPrefetchMap.current[idx] = { status: "failed" };
      }
    };

    // Trigger concurrent background pre-fetching with 250ms spacing to respect rate-limiting
    for (let i = 0; i < transcript.length; i++) {
      fetchLineAudio(transcript[i], i);
      await new Promise(resolve => setTimeout(resolve, 250));
    }
  };

  const speakLine = async (line, idx) => {
    if (isMuted) return;

    // Stop any previous Sarvam audio immediately
    if (sarvamAudioRef.current) {
      sarvamAudioRef.current.pause();
      sarvamAudioRef.current = null;
    }

    const apiKey = import.meta.env.VITE_SARVAM_API_KEY || "";
    const langMap = { en: "en-IN", hi: "hi-IN", gu: "gu-IN" };
    const langCode = langMap[automationLang] || "en-IN";

    // 1. Check if the line is pre-fetched successfully and play it instantly
    const prefetched = audioPrefetchMap.current[idx];
    if (prefetched && prefetched.status === "success" && prefetched.audios.length > 0) {
      console.log(`[TTS] Playing pre-fetched audio for line ${idx}`);
      for (const base64Audio of prefetched.audios) {
        if (isMuted) break;
        await playBase64Audio(base64Audio);
      }
      return;
    }

    // 2. If it is still fetching in background, wait for it up to 4s
    if (prefetched && prefetched.status === "fetching") {
      console.log(`[TTS] Waiting for pre-fetched audio for line ${idx} to finish downloading...`);
      const success = await new Promise((resolve) => {
        const checkInterval = setInterval(() => {
          const checkVal = audioPrefetchMap.current[idx];
          if (checkVal && checkVal.status !== "fetching") {
            clearInterval(checkInterval);
            resolve(checkVal.status === "success");
          }
        }, 100);
        setTimeout(() => {
          clearInterval(checkInterval);
          resolve(false);
        }, 4000);
      });

      if (success) {
        const val = audioPrefetchMap.current[idx];
        for (const base64Audio of val.audios) {
          if (isMuted) break;
          await playBase64Audio(base64Audio);
        }
        return;
      }
    }

    // 3. Fallback: fetch dynamically or use browser TTS
    console.log(`[TTS] Pre-fetch not available for line ${idx}. Fetching dynamically.`);
    const cleanText = normalizeTextForTTS(line.text, langCode);

    const femaleNames = ["priya", "neha", "aarti", "sonia", "rhea", "diya", "ananya", "pooja", "tanvi", "isha", "kiara", "manisha", "vidya", "sunita", "kavita", "geeta", "reena", "seema", "deepa", "rekha", "kavya", "ishita", "shreya", "shruti", "suhani", "rupali", "simran", "poonam", "nisha", "meera", "lata", "radha", "anjali", "swati", "mamta", "sapna", "ritu", "shalini", "divya", "archana", "amita", "heena", "hema", "nita", "rita", "shanta", "asha", "usha", "kiran", "manju", "saroj", "sudha", "rama", "leela", "vimla", "pushpa"];
    const isFemale = line.sender === "agent" 
      ? (agentGender === "female") 
      : (line.sender === "lead" && (() => {
          const selectedLead = leads?.find(l => l._id === activeAutoLeadId);
          if (selectedLead?.name) {
            const firstName = selectedLead.name.split(" ")[0];
            return femaleNames.includes(firstName.trim().toLowerCase());
          }
          return false;
        })());

    let speaker = "shubh";
    if (automationLang === "gu") {
      speaker = isFemale ? "shreya" : "ratan";
    } else if (automationLang === "hi") {
      speaker = isFemale ? "ritu" : "shubh";
    } else {
      speaker = isFemale ? "neha" : "aditya";
    }

    if (!apiKey) {
      await speakBrowserTTS(cleanText, automationLang, line.sender === "agent");
      return;
    }

    const chunks = chunkText(cleanText, 480);
    for (const chunk of chunks) {
      if (isMuted) break;
      try {
        const res = await fetch("https://api.sarvam.ai/text-to-speech", {
          method: "POST",
          headers: {
            "api-subscription-key": apiKey,
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            inputs: [chunk],
            target_language_code: langCode,
            speaker: speaker,
            pace: 1.0,
            speech_sample_rate: 22050,
            enable_preprocessing: true,
            model: "bulbul:v3",
            output_audio_codec: "wav"
          })
        });

        if (res.ok) {
          const data = await res.json();
          const base64Audio = data?.audios?.[0];
          if (base64Audio) {
            await playBase64Audio(base64Audio);
          }
        } else {
          await speakBrowserTTS(chunk, automationLang, line.sender === "agent");
        }
      } catch (err) {
        await speakBrowserTTS(chunk, automationLang, line.sender === "agent");
      }
    }
  };


  // Calling sequence simulator — sequential: each line waits for Sarvam TTS to finish
  useEffect(() => {
    let cancelled = false;

    if (isCalling && callStatus === "Connected" && activeCallLog) {
      const fullTranscript = activeCallLog.transcript;

      const runSequence = async () => {
        for (let i = 0; i < fullTranscript.length; i++) {
          if (cancelled) break;

          const line = fullTranscript[i];
          setVisibleTranscript(prev => [...prev, line]);

          // Scroll transcript box to bottom
          setTimeout(() => {
            const box = document.getElementById("auto-transcript-box");
            if (box) box.scrollTop = box.scrollHeight;
          }, 50);

          // Speak the line and WAIT for it to fully finish before next
          await speakLine(line, i);

          if (i === 6) {
            setShowWhatsAppSim(true);
            setShowEmailSim(true);
            setTimeout(() => {
              setShowWhatsAppSim(false);
            }, 6000);
            setTimeout(() => {
              setShowEmailSim(false);
            }, 6000);
          }

          if (cancelled) break;

          // Small natural pause between lines (500ms)
          await new Promise(r => setTimeout(r, 500));
        }

        if (!cancelled) {
          setCallStatus("Completed");
          if (window.speechSynthesis) window.speechSynthesis.cancel();

          // If fallback call, add it to local calls list on completion
          if (activeCallLog && activeCallLog.callId === "mock-call-id") {
            const selected = leads.find(l => l._id === activeAutoLeadId);
            const newMockCall = {
              _id: "mock-" + Date.now(),
              leadId: activeAutoLeadId,
              leadName: selected?.name || "Client",
              project: activeCallLog.project,
              status: "Completed",
              duration: 80,
              transcript: activeCallLog.transcript,
              summary: activeCallLog.summary,
              sentiment: activeCallLog.sentiment,
              brochureSent: true,
              followupScheduled: true,
              date: new Date().toISOString().split('T')[0]
            };
            setLocalVoiceCalls(prev => [newMockCall, ...prev]);

            setLocalLeads(prevLeads => prevLeads.map(l => l._id === activeAutoLeadId ? {
              ...l,
              status: "Contacted",
              score: 90,
              automationStatus: "Interested",
              brochureSent: true,
              brochureSentTime: new Date().toISOString()
            } : l));

            const newFollowup = {
              _id: "mock-followup-" + Date.now(),
              leadId: activeAutoLeadId,
              leadName: selected?.name || "Client",
              date: new Date(Date.now() + 86400000).toISOString().split('T')[0],
              time: "11:00",
              task: `Follow-up call on brochure interest for project ${activeCallLog.project}.`,
              status: "Pending",
              assignedTo: "Sujal Talreja"
            };
            setLocalFollowups(prev => [newFollowup, ...prev]);
          }
        }
      };

      runSequence();
    }

    return () => {
      cancelled = true;
      if (sarvamAudioRef.current) {
        sarvamAudioRef.current.pause();
        sarvamAudioRef.current = null;
      }
      if (window.speechSynthesis) window.speechSynthesis.cancel();
    };
  }, [isCalling, callStatus, activeCallLog]);


  if (leads === undefined || payments === undefined || builders === undefined || brokers === undefined || followups === undefined) {
    return (
      <div className="flex align-center justify-center h-100 w-100" style={{ minHeight: '300px', color: '#D4AF37', flexDirection: 'column', gap: '10px' }}>
        <Activity className="animate-spin" size={24} />
        <p className="font-small">Retrieving CRM Database records...</p>
      </div>
    );
  }

  // 10 Detailed Sales Pipeline Stages
  const pipelineStages = [
    "New Lead", 
    "Contacted", 
    "Site Visit Scheduled", 
    "Visited", 
    "Negotiation", 
    "Token Paid", 
    "Loan Processing", 
    "Registration", 
    "Possession", 
    "Closed/Lost"
  ];

  // Pipeline Status Update
  const handleUpdateLeadStatus = (leadId, targetStatus) => {
    if (updateLeadStatus) {
      updateLeadStatus({ id: leadId, status: targetStatus })
        .then(() => {
          if (addActivity) {
            addActivity({
              message: `Lead status updated to ${targetStatus} for lead ID ${leadId}`,
              time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            }).catch(console.error);
          }
        })
        .catch(console.error);
    }
  };

  // Drag and Drop support
  const handleDragStart = (e, leadId) => {
    e.dataTransfer.setData("leadId", leadId);
  };

  const handleDrop = (e, targetStatus) => {
    e.preventDefault();
    const leadId = e.dataTransfer.getData("leadId");
    if (leadId) {
      handleUpdateLeadStatus(leadId, targetStatus);
    }
  };

  const allowDrop = (e) => {
    e.preventDefault();
  };

  // Archive / Delete Lead
  const handleDeleteLead = (leadId) => {
    if (window.confirm("Are you sure you want to archive this lead? All associated history will be deleted.")) {
      if (deleteLead) {
        deleteLead({ id: leadId })
          .then(() => {
            if (addActivity) {
              addActivity({
                message: `Lead archived successfully.`,
                time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
              }).catch(console.error);
            }
            setSelectedLead(null);
          })
          .catch(console.error);
      }
    }
  };

  // Lead Submission
  const handleAddLeadSubmit = (e) => {
    e.preventDefault();
    if (addLead) {
      addLead(newLead)
        .then(() => {
          if (addActivity) {
            addActivity({
              message: `New Lead Registered: ${newLead.name} via ${newLead.source}`,
              time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            }).catch(console.error);
          }
          setIsAddingLead(false);
          // reset form
          setNewLead({
            name: '', phone: '', email: '', project: 'Shivalik Skyview', score: 75, status: 'New Lead', source: 'Website Chat',
            budget: 20000000, preferredLocation: 'Ambawadi', propertyType: 'Apartment', bhkPreference: '3 BHK', purpose: 'Buy',
            loanRequired: true, assignedExecutive: 'Sujal Talreja', familyDetails: '', occupation: '', annualIncome: 2000000, notes: ''
          });
        })
        .catch(console.error);
    }
  };

  // Save Lead Profile Fields from Modal
  const handleSaveLeadDetailsSubmit = () => {
    if (updateLeadDetails && selectedLead) {
      updateLeadDetails({
        id: selectedLead._id,
        ...editableLeadFields
      })
        .then(() => {
          setSelectedLead(prev => ({ ...prev, ...editableLeadFields }));
          setIsEditingLeadFields(false);
          if (addActivity) {
            addActivity({
              message: `Updated profile details for customer ${selectedLead.name}`,
              time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            }).catch(console.error);
          }
        })
        .catch(console.error);
    }
  };

  // Schedule Follow-up Submission
  const handleAddFollowupSubmit = (e) => {
    e.preventDefault();
    const targetLead = leads.find(l => l._id === newFollowup.leadId);
    if (!targetLead) return;
    if (addFollowup) {
      addFollowup({
        leadId: newFollowup.leadId,
        leadName: targetLead.name,
        date: newFollowup.date,
        time: newFollowup.time,
        task: newFollowup.task,
        status: 'Pending',
        assignedTo: newFollowup.assignedTo
      })
        .then(() => {
          setNewFollowup({ leadId: '', date: '', time: '', task: '', assignedTo: 'Sujal Talreja' });
          alert("Follow-up successfully scheduled!");
        })
        .catch(console.error);
    }
  };

  // Add Payment Submission
  const handleAddPaymentSubmit = (e) => {
    e.preventDefault();
    const targetLead = leads.find(l => l._id === newPayment.leadId);
    if (!targetLead) return;
    const gstAmount = Math.round(newPayment.amount * 0.18);
    if (addPayment) {
      addPayment({
        leadId: newPayment.leadId,
        leadName: targetLead.name,
        amount: Number(newPayment.amount),
        date: new Date().toISOString().split('T')[0],
        stage: newPayment.stage,
        status: newPayment.status,
        gstAmount: gstAmount,
        receiptUrl: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf"
      })
        .then(() => {
          setNewPayment({ leadId: '', amount: 100000, stage: 'Token Amount Paid', status: 'Paid' });
          alert("Payment recorded successfully!");
        })
        .catch(console.error);
    }
  };

  // Add Builder Submission
  const handleAddBuilderSubmit = (e) => {
    e.preventDefault();
    if (addBuilder) {
      addBuilder({
        name: newBuilder.name,
        company: newBuilder.company,
        contact: newBuilder.contact,
        activeProjects: newBuilder.activeProjects.split(',').map(s => s.trim()),
        commissionAgreement: newBuilder.commissionAgreement
      })
        .then(() => {
          setNewBuilder({ name: '', company: '', contact: '', activeProjects: '', commissionAgreement: '' });
          alert("Builder details added successfully!");
        })
        .catch(console.error);
    }
  };

  // Add Broker Submission
  const handleAddBrokerSubmit = (e) => {
    e.preventDefault();
    if (addBroker) {
      addBroker({
        name: newBroker.name,
        agency: newBroker.agency,
        contact: newBroker.contact,
        reraNumber: newBroker.reraNumber,
        leadReferralsCount: 0,
        commissionEarned: 0,
        status: newBroker.status
      })
        .then(() => {
          setNewBroker({ name: '', agency: '', contact: '', reraNumber: '', status: 'Active' });
          alert("Broker registered successfully!");
        })
        .catch(console.error);
    }
  };

  // Record Broker Referral (increases referrals and commission payout)
  const handleRecordBrokerReferral = (broker) => {
    if (updateBrokerReferral) {
      updateBrokerReferral({
        id: broker._id,
        leadReferralsCount: broker.leadReferralsCount + 1,
        commissionEarned: broker.commissionEarned + 50000
      })
        .then(() => {
          alert(`Referral recorded! Earned ₹50,000 for ${broker.name}.`);
        })
        .catch(console.error);
    }
  };

  // Schedule Site Visit from Profile Modal
  const handleScheduleSiteVisitSubmit = (e) => {
    e.preventDefault();
    if (addSiteVisit && selectedLead) {
      addSiteVisit({
        leadId: selectedLead._id,
        date: newVisit.date,
        time: newVisit.time,
        type: newVisit.type,
        executive: newVisit.executive,
        cabRequired: newVisit.cabRequired,
        pickupLocation: newVisit.pickupLocation,
        feedback: newVisit.feedback,
        interestLevel: newVisit.interestLevel
      })
        .then(() => {
          // Auto advance lead status to "Site Visit Scheduled"
          handleUpdateLeadStatus(selectedLead._id, "Site Visit Scheduled");
          setSelectedLead(prev => ({ ...prev, status: "Site Visit Scheduled" }));
          setNewVisit({
            date: '', time: '', type: 'Physical Site Tour', executive: 'Sujal Talreja', cabRequired: false, pickupLocation: '', feedback: '', interestLevel: 'Warm'
          });
          alert("Site visit scheduled and lead pipeline advanced!");
        })
        .catch(console.error);
    }
  };

  // Toggle Followup completed
  const handleToggleFollowup = (follow) => {
    const nextStatus = follow.status === 'Pending' ? 'Completed' : 'Pending';
    if (updateFollowupStatus) {
      updateFollowupStatus({ id: follow._id, status: nextStatus }).catch(console.error);
    }
  };

  // Delete Followup
  const handleDeleteFollowup = (id) => {
    if (confirm("Delete this follow-up task?")) {
      if (deleteFollowup) {
        deleteFollowup({ id }).catch(console.error);
      }
    }
  };

  // Open profile modal
  const openLeadProfile = (lead) => {
    setSelectedLead(lead);
    setEditableLeadFields(lead);
    setActiveProfileTab('profile');
    setShowSmartMatchResults(false);
    setIsEditingLeadFields(false);
  };

  // Smart matching logic against properties / inventory in DB
  const getSmartMatches = () => {
    if (!selectedLead) return [];
    const clientBudget = selectedLead.budget || 20000000;
    const clientBhk = selectedLead.bhkPreference || '3 BHK';

    return inventory.filter(item => {
      const matchBhk = item.type === clientBhk;
      const matchBudget = (item.price || 15000000) <= clientBudget;
      return matchBhk && matchBudget && item.status === 'Available';
    }).map(item => {
      // Calculate match percentage
      let score = 70;
      if (item.facing === selectedLead.facing) score += 10;
      if ((item.price || 15000000) <= clientBudget * 0.9) score += 10;
      if (item.views.includes(selectedLead.preferredLocation)) score += 10;
      return {
        ...item,
        matchScore: Math.min(score, 99)
      };
    }).sort((a, b) => b.matchScore - a.matchScore);
  };

  // Exporter for dynamic RERA brochures
  const handleDownloadAutomationBrochure = (leadName, project, bhk) => {
    const doc = new jsPDF();
    doc.setFont("Helvetica", "bold");
    doc.setFontSize(24);
    doc.setTextColor(212, 175, 55);
    doc.text('SHIVALIK RERA BROCHURE', 20, 30);
    
    doc.setFont("Helvetica", "normal");
    doc.setFontSize(11);
    doc.setTextColor(120, 120, 120);
    doc.text(`Project Name: ${project}`, 20, 40);
    doc.text(`RERA Approved Booking Code: SHV/RERA/2026/A54`, 20, 46);
    doc.text(`Prepared Exclusively For: ${leadName}`, 20, 52);
    
    doc.line(20, 58, 190, 58);
    
    doc.setFontSize(14);
    doc.setTextColor(40, 40, 40);
    doc.text(`Luxury ${bhk || '3 BHK'} Floor Plan Specifications`, 20, 68);
    
    doc.setFontSize(10);
    doc.text('• Carpet Area: 1450 sq.ft. | Balcony: 250 sq.ft. (Glassmorphic Balustrade)', 25, 78);
    doc.text('• Orientation: Garden Facing (East/West Cross-Ventilation)', 25, 84);
    doc.text('• Sunlight Index Rating: 8.5 Hours/Day optimized orientation', 25, 90);
    doc.text('• Noise Rating: 2.1 dB (Double glazed glass acoustic barriers)', 25, 96);
    doc.text('• Smart Home Integrations: Video door lock, touch panel automation ready', 25, 102);

    doc.setFontSize(14);
    doc.text(`Premium Amenities Included`, 20, 116);
    doc.setFontSize(10);
    doc.text('1. Elevated Skydeck Walkway (Towers connection on 14th Floor)', 25, 126);
    doc.text('2. Temperature-controlled Olympic Swimming sanctuary & Spa', 25, 132);
    doc.text('3. Yoga Meditation Pavilion & Lush Green Miyawaki Garden', 25, 138);
    doc.text('4. RERA Compliant structural earthquake resistance standard (Zone V)', 25, 144);
    
    doc.line(20, 154, 190, 154);
    
    doc.setFontSize(12);
    doc.setFont("Helvetica", "bold");
    doc.text('PAYMENT PLAN & SCHEDULER MATRIX', 20, 164);
    doc.setFont("Helvetica", "normal");
    doc.setFontSize(10);
    doc.text('• Token Amount: Booking registration deposit 5% base price', 25, 172);
    doc.text('• Foundation Slab: 15% payment release on structural foundation completion', 25, 178);
    doc.text('• Possession Phase: Final 10% payment with RERA tax registration', 25, 184);
    
    doc.save(`Shivalik_${project.replace(/\s+/g, '_')}_Brochure.pdf`);
  };

  // Exporter for GST receipts
  const handleGenerateInvoice = (payment) => {
    const doc = new jsPDF();
    doc.setFont("Helvetica", "bold");
    doc.setFontSize(22);
    doc.setTextColor(212, 175, 55);
    doc.text('SHIVALIK GROUP', 20, 30);
    doc.setFont("Helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text('GST No: 24AAACS7062J1Z3 • RERA No: PR/GJ/AHMEDABAD/AUDA', 20, 37);

    doc.setFontSize(14);
    doc.setTextColor(40, 40, 40);
    doc.text('GST TAX INVOICE & RECEIPT', 20, 55);

    doc.rect(20, 62, 170, 40);
    doc.setFontSize(11);
    doc.text(`Receipt ID: ${payment._id}`, 25, 68);
    doc.text(`Customer Name: ${payment.leadName}`, 25, 76);
    doc.text(`Date of Issue: ${payment.date}`, 25, 84);
    doc.text(`Milestone Stage: ${payment.stage}`, 25, 92);

    doc.rect(20, 110, 170, 45);
    doc.setFont("Helvetica", "bold");
    doc.text('Description', 25, 117);
    doc.text('Amount (INR)', 150, 117);
    doc.setFont("Helvetica", "normal");
    doc.line(20, 120, 190, 120);

    doc.text('Base Installment Payout', 25, 128);
    doc.text(`INR ${payment.amount.toLocaleString()}`, 150, 128);

    doc.text('CGST @ 9% + SGST @ 9% (18% Total)', 25, 136);
    doc.text(`INR ${payment.gstAmount.toLocaleString()}`, 150, 136);
    
    doc.line(20, 142, 190, 142);
    doc.setFont("Helvetica", "bold");
    doc.text('Total Invoice Value (Inclusive of GST)', 25, 149);
    doc.text(`INR ${(payment.amount + payment.gstAmount).toLocaleString()}`, 150, 149);

    doc.setFont("Helvetica", "normal");
    doc.setFontSize(9);
    doc.text('Note: This is a system-generated PDF invoice and does not require physical signature.', 20, 170);

    doc.save(`Invoice_${payment.leadName.replace(/\s+/g, '_')}_${payment.stage.replace(/\s+/g, '_')}.pdf`);
  };

  // Export Property pitch deck
  const handleGeneratePitchDeck = () => {
    const doc = new jsPDF();
    doc.setFontSize(22);
    doc.setTextColor(212, 175, 55);
    doc.text('Shivalik Premium Portfolio', 20, 30);
    
    doc.setFontSize(13);
    doc.setTextColor(60, 60, 60);
    doc.text(`Prepared Exclusively For: ${selectedLead.name}`, 20, 45);
    doc.text(`Preferred Configuration: ${selectedLead.bhkPreference || '3 BHK'}`, 20, 52);
    doc.text(`Financial Limit: INR ${(selectedLead.budget || 20000000).toLocaleString()}`, 20, 59);

    doc.setFontSize(16);
    doc.setTextColor(40, 40, 40);
    doc.text('Matched Residential Inventory:', 20, 80);

    const matches = getSmartMatches();
    if (matches.length === 0) {
      doc.setFontSize(11);
      doc.text('No physical available matches found matching active constraints.', 20, 95);
    } else {
      let offset = 95;
      matches.slice(0, 3).forEach((item, idx) => {
        doc.setFontSize(12);
        doc.setFont("Helvetica", "bold");
        doc.text(`${idx + 1}. Unit ${item.unit} (${item.tower}) - Match Rating: ${item.matchScore}%`, 20, offset);
        doc.setFont("Helvetica", "normal");
        doc.setFontSize(10);
        doc.text(`   • Configuration: ${item.type} | Area: ${item.area} sq.ft. | Facing: ${item.facing || 'East'}`, 20, offset + 6);
        doc.text(`   • Agreement Value: INR ${(item.price || 15000000).toLocaleString()} (Excl. Stamp & GST)`, 20, offset + 12);
        doc.text(`   • Project Amenities: ${(item.amenities || []).join(', ') || 'Clubhouse, Swimming pool, Security'}`, 20, offset + 18);
        offset += 30;
      });
    }

    doc.save(`Shivalik_AI_PitchDeck_${selectedLead.name.replace(/\s+/g, '_')}.pdf`);
  };

  // AI draft triggers
  const handleAIDraftComms = (type) => {
    if (!selectedLead) return;
    const clientName = selectedLead.name;
    const clientProject = selectedLead.project || 'Shivalik Skyview';
    const clientBhk = selectedLead.bhkPreference || '3 BHK';

    let draft = '';
    if (type === 'whatsapp') {
      draft = `Dear ${clientName}, this is Sujal Talreja from Shivalik Group. Based on our AI mapping, we have opened up two premium ${clientBhk} apartments facing the gardens in ${clientProject} which perfectly align with your budget parameters. Please let me know when you would like to schedule a quick physical visit or a digital AR interactive tour. Cheers!`;
    } else if (type === 'email') {
      draft = `Subject: Tailored Housing Portfolio - Shivalik ${clientProject}\n\nDear ${clientName},\n\nHope this email finds you well.\n\nFollowing up on our discussions regarding a residency at Shivalik Group, our real-estate analytics engine has mapped your preferences to our newly updated inventory matrix. We have matched units in ${clientProject} that match your preferred ${clientBhk} layout and fit within your target budget criteria.\n\nAttached is our official digital RERA brochure. Let us schedule an executive tour of the site soon.\n\nBest regards,\nSujal Talreja\nSales Coordinator, Shivalik Group`;
    } else if (type === 'summary') {
      draft = `Interaction Summary:\n• Client is interested in a premium ${clientBhk} in ${clientProject}.\n• Financial standing: budget capped at INR ${(selectedLead.budget || 20000000).toLocaleString()}, annual income reported at INR ${(selectedLead.annualIncome || 2000000).toLocaleString()}.\n• Loan requirement flagged as ${selectedLead.loanRequired ? 'YES' : 'NO'}.\n• Main preferences: high floors, quiet neighborhood, East-facing, and requires a dedicated cab service for physical site visits.`;
    }
    setCommsInput(draft);
  };

  // Calculate dynamic stats widgets
  const totalLeads = leads.length;
  const newLeadsCount = leads.filter(l => l.status === 'New Lead').length;
  const activeDeals = leads.filter(l => l.status !== 'Closed/Lost' && l.status !== 'New Lead').length;
  const visitsScheduled = siteVisits.length;
  const bookedDeals = leads.filter(l => l.status === 'Booked' || l.status === 'Possession' || l.status === 'Registration').length;
  const availableInventory = inventory.filter(i => i.status === 'Available').length;
  const conversionRate = totalLeads ? Math.round((bookedDeals / totalLeads) * 100) : 0;
  
  // Total value calculation
  const totalRevenue = payments.reduce((acc, p) => p.status === 'Paid' ? acc + p.amount : acc, 0);

  return (
    <div className="crm-module h-100 flex flex-col">
      {/* Centralized KPI Widgets */}
      <div className="kpi-widgets-grid">
        <div className="kpi-widget-card glass-card">
          <h5>Total Leads</h5>
          <div className="kpi-value">{totalLeads}</div>
        </div>
        <div className="kpi-widget-card glass-card">
          <h5>New Inquiries Today</h5>
          <div className="kpi-value">{newLeadsCount}</div>
        </div>
        <div className="kpi-widget-card glass-card">
          <h5>Active Deals</h5>
          <div className="kpi-value">{activeDeals}</div>
        </div>
        <div className="kpi-widget-card glass-card">
          <h5>Site Visits</h5>
          <div className="kpi-value text-blue">{visitsScheduled}</div>
        </div>
        <div className="kpi-widget-card glass-card">
          <h5>Booked Deals</h5>
          <div className="kpi-value text-green">{bookedDeals}</div>
        </div>
        <div className="kpi-widget-card glass-card">
          <h5>Inventory Available</h5>
          <div className="kpi-value">{availableInventory} Units</div>
        </div>
        <div className="kpi-widget-card glass-card">
          <h5>Recorded Payments</h5>
          <div className="kpi-value text-gold">₹{(totalRevenue / 10000000).toFixed(2)} Cr</div>
        </div>
        <div className="kpi-widget-card glass-card">
          <h5>Conversion Rate</h5>
          <div className="kpi-value">{conversionRate}%</div>
        </div>
      </div>

      {/* CRM Navigation Sub-Tab Bar */}
      <div className="crm-nav">
        <button className={`crm-nav-btn ${crmTab === 'pipeline' ? 'active' : ''}`} onClick={() => setCrmTab('pipeline')}>
          <Layout size={16} /> Pipeline Kanban
        </button>
        <button className={`crm-nav-btn ${crmTab === 'followups' ? 'active' : ''}`} onClick={() => setCrmTab('followups')}>
          <Clock size={16} /> Follow-ups Center ({followups.filter(f => f.status === 'Pending').length})
        </button>
        <button className={`crm-nav-btn ${crmTab === 'automation' ? 'active' : ''}`} onClick={() => setCrmTab('automation')}>
          <Cpu size={16} /> Sales Automation ({leads.filter(l => l.status === 'New Lead').length})
        </button>
        <button className={`crm-nav-btn ${crmTab === 'payments' ? 'active' : ''}`} onClick={() => setCrmTab('payments')}>
          <DollarSign size={16} /> Payment Tracker
        </button>
        <button className={`crm-nav-btn ${crmTab === 'builders' ? 'active' : ''}`} onClick={() => setCrmTab('builders')}>
          <Building size={16} /> Builder Directory
        </button>
        <button className={`crm-nav-btn ${crmTab === 'brokers' ? 'active' : ''}`} onClick={() => setCrmTab('brokers')}>
          <Users size={16} /> Broker Network
        </button>
        <button className={`crm-nav-btn ${crmTab === 'analytics' ? 'active' : ''}`} onClick={() => setCrmTab('analytics')}>
          <TrendingUp size={16} /> Executive Analytics
        </button>
      </div>

      {/* RENDER ACTIVE CRM SUB-TAB VIEW */}
      
      {/* 1. PIPELINE KANBAN TAB */}
      {crmTab === 'pipeline' && (
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="flex justify-between align-center mb-4">
            <div>
              <h3>Interactive Sales Pipeline</h3>
              <p className="text-muted font-small">Drag cards to advance sales stages in real-time</p>
            </div>
            <button className="btn btn-gold flex align-center gap-2" onClick={() => setIsAddingLead(true)}>
              <Plus size={16} /> Add New Lead
            </button>
          </div>

          <div className="kanban-board flex-1">
            {pipelineStages.map(status => (
              <div 
                key={status} 
                className="kanban-column"
                onDragOver={allowDrop}
                onDrop={(e) => handleDrop(e, status)}
              >
                <div className="kanban-column-header">
                  <h4>{status}</h4>
                  <span className="lead-count">{leads.filter(l => l.status === status).length}</span>
                </div>
                <div className="kanban-cards">
                  {leads.filter(l => l.status === status).map((lead) => (
                    <div 
                      key={lead._id} 
                      className="kanban-card glass-card"
                      draggable
                      onDragStart={(e) => handleDragStart(e, lead._id)}
                      onClick={() => openLeadProfile(lead)}
                    >
                      <div className="kanban-card-top flex justify-between mb-2">
                        <strong className="lead-name">{lead.name}</strong>
                        <span className={`badge ${lead.score >= 80 ? 'badge-hot' : 'badge-cold'}`}>Score: {lead.score}</span>
                      </div>
                      <div className="lead-project text-gold font-small mb-2">
                        <MapPin size={12} className="inline mr-1"/>{lead.project}
                      </div>
                      {lead.budget && (
                        <div className="text-muted font-small mb-1">Budget: ₹{(lead.budget / 100000).toFixed(0)} L</div>
                      )}
                      <div className="lead-action text-muted font-small">{lead.action || "No pending actions"}</div>
                      {lead.automationStatus && (
                        <div className="mt-2 flex gap-1 flex-wrap">
                          <span className="badge badge-green font-small flex align-center gap-1" style={{ fontSize: '9px', padding: '2px 6px', background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)', color: '#10b981' }}>
                            🤖 AI: {lead.automationStatus}
                          </span>
                          {lead.brochureSent && (
                            <span className="badge badge-gold font-small flex align-center gap-1" style={{ fontSize: '9px', padding: '2px 6px', background: 'rgba(212,175,55,0.1)', border: '1px solid rgba(212,175,55,0.3)', color: '#D4AF37' }}>
                              📄 Brochure Sent
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 2. FOLLOW-UPS CENTER TAB */}
      {crmTab === 'followups' && (
        <div className="crm-split-layout">
          {/* Schedule Followup Form */}
          <div className="crm-form-card glass-card">
            <h4>Schedule Follow-up Task</h4>
            <p className="text-muted font-small mb-4">Set action logs for sales nurturing campaigns</p>
            <form onSubmit={handleAddFollowupSubmit}>
              <div className="form-group mt-3">
                <label>Select Target Lead</label>
                <select 
                  value={newFollowup.leadId} 
                  onChange={e => setNewFollowup({...newFollowup, leadId: e.target.value})} 
                  required
                >
                  <option value="">Choose Lead...</option>
                  {leads.map(l => <option key={l._id} value={l._id}>{l.name} ({l.project})</option>)}
                </select>
              </div>
              <div className="form-row">
                <div className="form-group col">
                  <label>Due Date</label>
                  <input 
                    type="date" 
                    value={newFollowup.date} 
                    onChange={e => setNewFollowup({...newFollowup, date: e.target.value})} 
                    required 
                  />
                </div>
                <div className="form-group col">
                  <label>Due Time</label>
                  <input 
                    type="time" 
                    value={newFollowup.time} 
                    onChange={e => setNewFollowup({...newFollowup, time: e.target.value})} 
                    required 
                  />
                </div>
              </div>
              <div className="form-group">
                <label>Assigned Executive</label>
                <select 
                  value={newFollowup.assignedTo} 
                  onChange={e => setNewFollowup({...newFollowup, assignedTo: e.target.value})}
                >
                  <option value="Sujal Talreja">Sujal Talreja</option>
                  <option value="Aarti Amin">Aarti Amin</option>
                  <option value="Rohan Vora">Rohan Vora</option>
                </select>
              </div>
              <div className="form-group">
                <label>Task Description / Follow-up Notes</label>
                <textarea 
                  rows="3" 
                  value={newFollowup.task} 
                  onChange={e => setNewFollowup({...newFollowup, task: e.target.value})} 
                  placeholder="e.g. Discuss home loan files, verify payment plans..." 
                  required
                />
              </div>
              <button type="submit" className="btn btn-gold w-100 mt-4">Confirm Scheduler</button>
            </form>
          </div>

          {/* Followups List */}
          <div className="flex flex-col gap-3">
            <div className="card-header-small border-accent flex justify-between align-center mb-2">
              <h4>Active Follow-up Reminder Logs</h4>
              <span className="badge badge-gold">{followups.filter(f => f.status === 'Pending').length} Due</span>
            </div>
            <div className="crm-table-container">
              <table className="crm-table">
                <thead>
                  <tr>
                    <th>Customer Name</th>
                    <th>Due Schedule</th>
                    <th>Assigned Executive</th>
                    <th>Follow-up Task Details</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {followups.map((follow) => (
                    <tr key={follow._id} style={{ opacity: follow.status === 'Completed' ? 0.6 : 1 }}>
                      <td><strong>{follow.leadName}</strong></td>
                      <td>
                        <div className="flex align-center gap-1"><Clock size={12}/>{follow.date} at {follow.time}</div>
                      </td>
                      <td>{follow.assignedTo}</td>
                      <td><p className="text-muted" style={{ maxWidth: '280px' }}>{follow.task}</p></td>
                      <td>
                        <button 
                          onClick={() => handleToggleFollowup(follow)}
                          className={`btn btn-small ${follow.status === 'Completed' ? 'btn-outline' : 'btn-gold'}`}
                          style={{ minWidth: '95px' }}
                        >
                          {follow.status === 'Completed' ? (
                            <span className="flex align-center gap-1 justify-center"><Check size={12}/> Completed</span>
                          ) : (
                            <span>Mark Pending</span>
                          )}
                        </button>
                      </td>
                      <td>
                        <button className="btn-close text-red" onClick={() => handleDeleteFollowup(follow._id)}>
                          <Trash2 size={14}/>
                        </button>
                      </td>
                    </tr>
                  ))}
                  {followups.length === 0 && (
                    <tr>
                      <td colSpan="6" className="text-center text-muted">No scheduled follow-up actions found.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 3. PAYMENT INSTALLMENTS TAB */}
      {crmTab === 'payments' && (
        <div className="crm-split-layout">
          {/* Record Payout Form */}
          <div className="crm-form-card glass-card">
            <h4>Log Installment Payment</h4>
            <p className="text-muted font-small mb-4">Calculate booking amounts & 18% GST invoice entries</p>
            <form onSubmit={handleAddPaymentSubmit}>
              <div className="form-group mt-3">
                <label>Select Target Lead</label>
                <select 
                  value={newPayment.leadId} 
                  onChange={e => setNewPayment({...newPayment, leadId: e.target.value})} 
                  required
                >
                  <option value="">Select Buyer...</option>
                  {leads.filter(l => l.status !== "Closed/Lost").map(l => (
                    <option key={l._id} value={l._id}>{l.name} ({l.project})</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Installment Amount (INR)</label>
                <input 
                  type="number" 
                  value={newPayment.amount} 
                  onChange={e => setNewPayment({...newPayment, amount: Number(e.target.value)})} 
                  min="5000" 
                  required 
                />
              </div>
              <div className="form-group">
                <label>GST Calculation (18% Auto)</label>
                <div className="glass-card p-2 text-muted font-small flex justify-between">
                  <span>Calculated GST:</span>
                  <strong className="text-gold">₹{Math.round(newPayment.amount * 0.18).toLocaleString()}</strong>
                </div>
                <div className="glass-card p-2 mt-1 text-muted font-small flex justify-between">
                  <span>Total Value:</span>
                  <strong className="text-green">₹{Math.round(newPayment.amount * 1.18).toLocaleString()}</strong>
                </div>
              </div>
              <div className="form-row">
                <div className="form-group col">
                  <label>Milestone Stage</label>
                  <select 
                    value={newPayment.stage} 
                    onChange={e => setNewPayment({...newPayment, stage: e.target.value})}
                  >
                    <option value="Token Amount Paid">Token Amount Paid</option>
                    <option value="Allotment Amount Paid">Allotment Amount Paid</option>
                    <option value="Foundation Slab Stage">Foundation Slab Stage</option>
                    <option value="First Floor Completed">First Floor Completed</option>
                    <option value="Superstructure Completed">Superstructure Completed</option>
                    <option value="Possession Handover">Possession Handover</option>
                  </select>
                </div>
                <div className="form-group col">
                  <label>Status</label>
                  <select 
                    value={newPayment.status} 
                    onChange={e => setNewPayment({...newPayment, status: e.target.value})}
                  >
                    <option value="Paid">Paid</option>
                    <option value="Pending">Pending</option>
                    <option value="Overdue">Overdue</option>
                  </select>
                </div>
              </div>
              <button type="submit" className="btn btn-gold w-100 mt-3">Log Payout Receipt</button>
            </form>
          </div>

          {/* Payment Ledger */}
          <div className="flex flex-col gap-3">
            <div className="card-header-small border-accent mb-2">
              <h4>Corporate Payment Ledger</h4>
            </div>
            <div className="crm-table-container">
              <table className="crm-table">
                <thead>
                  <tr>
                    <th>Lead/Buyer</th>
                    <th>Milestone Stage</th>
                    <th>Base Amount</th>
                    <th>18% GST Tax</th>
                    <th>Total Value</th>
                    <th>Due Date</th>
                    <th>Status</th>
                    <th>Invoicing</th>
                  </tr>
                </thead>
                <tbody>
                  {payments.map((p) => (
                    <tr key={p._id}>
                      <td><strong>{p.leadName}</strong></td>
                      <td>{p.stage}</td>
                      <td>₹{p.amount.toLocaleString()}</td>
                      <td className="text-muted">₹{p.gstAmount.toLocaleString()}</td>
                      <td><strong>₹{(p.amount + p.gstAmount).toLocaleString()}</strong></td>
                      <td>{p.date}</td>
                      <td>
                        <select 
                          className={`badge ${p.status === 'Paid' ? 'badge-green' : p.status === 'Pending' ? 'badge-cold' : 'badge-hot'}`}
                          style={{ border: 'none', background: 'rgba(255,255,255,0.05)', color: 'inherit', padding: '2px 8px' }}
                          value={p.status} 
                          onChange={(e) => {
                            if (updatePaymentStatus) {
                              updatePaymentStatus({ id: p._id, status: e.target.value });
                            }
                          }}
                        >
                          <option value="Paid">Paid</option>
                          <option value="Pending">Pending</option>
                          <option value="Overdue">Overdue</option>
                        </select>
                      </td>
                      <td>
                        <button className="btn btn-outline btn-small flex align-center gap-1" onClick={() => handleGenerateInvoice(p)}>
                          <Download size={12}/> Invoice PDF
                        </button>
                      </td>
                    </tr>
                  ))}
                  {payments.length === 0 && (
                    <tr>
                      <td colSpan="8" className="text-center text-muted">No payout ledgers registered.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 4. BUILDER DIRECTORY TAB */}
      {crmTab === 'builders' && (
        <div className="crm-split-layout">
          {/* Register Builder Form */}
          <div className="crm-form-card glass-card">
            <h4>Register Construction Partner</h4>
            <p className="text-muted font-small mb-4">Maintain active builders & commission agreements</p>
            <form onSubmit={handleAddBuilderSubmit}>
              <div className="form-group mt-3">
                <label>Builder Name</label>
                <input 
                  type="text" 
                  value={newBuilder.name} 
                  onChange={e => setNewBuilder({...newBuilder, name: e.target.value})} 
                  placeholder="e.g. Shivalik Group" 
                  required 
                />
              </div>
              <div className="form-group">
                <label>Company Designation</label>
                <input 
                  type="text" 
                  value={newBuilder.company} 
                  onChange={e => setNewBuilder({...newBuilder, company: e.target.value})} 
                  placeholder="e.g. Shivalik Projects Limited" 
                  required 
                />
              </div>
              <div className="form-group">
                <label>Office Direct Line</label>
                <input 
                  type="tel" 
                  value={newBuilder.contact} 
                  onChange={e => setNewBuilder({...newBuilder, contact: e.target.value})} 
                  placeholder="e.g. +91 79 3500 1100" 
                  required 
                />
              </div>
              <div className="form-group">
                <label>Active Project Catalog (Comma separated)</label>
                <input 
                  type="text" 
                  value={newBuilder.activeProjects} 
                  onChange={e => setNewBuilder({...newBuilder, activeProjects: e.target.value})} 
                  placeholder="e.g. Skyview, Highlife, Edge" 
                  required 
                />
              </div>
              <div className="form-group">
                <label>Brokerage / Payout Commission Agreement Details</label>
                <textarea 
                  rows="4" 
                  value={newBuilder.commissionAgreement} 
                  onChange={e => setNewBuilder({...newBuilder, commissionAgreement: e.target.value})} 
                  placeholder="e.g. 2.5% standard commission agreement on booking value..." 
                  required 
                />
              </div>
              <button type="submit" className="btn btn-gold w-100 mt-4">Save Builder Partner</button>
            </form>
          </div>

          {/* Builder List Grid */}
          <div className="flex flex-col gap-3">
            <div className="card-header-small border-accent mb-2">
              <h4>Builder Directory</h4>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {builders.map((builder) => (
                <div key={builder._id} className="glass-card p-4 border-accent">
                  <div className="flex justify-between align-start mb-2">
                    <div>
                      <h4 className="text-gold">{builder.name}</h4>
                      <p className="text-muted font-small">{builder.company}</p>
                    </div>
                    <Briefcase size={20} className="text-gold opacity-60"/>
                  </div>
                  <div className="contact-info text-muted font-small mb-3">
                    <p className="mb-1 flex align-center gap-1"><Phone size={12}/> {builder.contact}</p>
                  </div>
                  <div className="mb-3">
                    <strong className="font-small text-muted block mb-1">Active Portfolios:</strong>
                    <div className="flex flex-wrap gap-1">
                      {builder.activeProjects.map((p, idx) => (
                        <span key={idx} className="badge badge-cold">{p}</span>
                      ))}
                    </div>
                  </div>
                  <div className="bg-glass-tertiary p-3 rounded" style={{ backgroundColor: 'rgba(255,255,255,0.02)', border: '1px solid var(--color-tertiary)' }}>
                    <strong className="font-small text-gold block mb-1 flex align-center gap-1"><FileSignature size={12}/> Commission Terms:</strong>
                    <p className="font-small text-muted">{builder.commissionAgreement}</p>
                  </div>
                </div>
              ))}
              {builders.length === 0 && (
                <div className="glass-card p-8 text-center text-muted col-span-2">No builders registered.</div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 5. BROKER NETWORK TAB */}
      {crmTab === 'brokers' && (
        <div className="crm-split-layout">
          {/* Register Broker Form */}
          <div className="crm-form-card glass-card">
            <h4>Register Sub-Broker Partner</h4>
            <p className="text-muted font-small mb-4">Track agency referrals and commission payouts</p>
            <form onSubmit={handleAddBrokerSubmit}>
              <div className="form-group mt-3">
                <label>Broker Full Name</label>
                <input 
                  type="text" 
                  value={newBroker.name} 
                  onChange={e => setNewBroker({...newBroker, name: e.target.value})} 
                  placeholder="e.g. Rohan Mehta" 
                  required 
                />
              </div>
              <div className="form-group">
                <label>Agency Name</label>
                <input 
                  type="text" 
                  value={newBroker.agency} 
                  onChange={e => setNewBroker({...newBroker, agency: e.target.value})} 
                  placeholder="e.g. Amdavad Realty Experts" 
                  required 
                />
              </div>
              <div className="form-group">
                <label>Contact Phone Number</label>
                <input 
                  type="tel" 
                  value={newBroker.contact} 
                  onChange={e => setNewBroker({...newBroker, contact: e.target.value})} 
                  placeholder="e.g. +91 98980 12345" 
                  required 
                />
              </div>
              <div className="form-group">
                <label>RERA Registration License Number</label>
                <input 
                  type="text" 
                  value={newBroker.reraNumber} 
                  onChange={e => setNewBroker({...newBroker, reraNumber: e.target.value})} 
                  placeholder="e.g. PR/GJ/AHMEDABAD/AG/110224" 
                  required 
                />
              </div>
              <div className="form-group">
                <label>Status</label>
                <select 
                  value={newBroker.status} 
                  onChange={e => setNewBroker({...newBroker, status: e.target.value})}
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>
              <button type="submit" className="btn btn-gold w-100 mt-4">Save Broker Profile</button>
            </form>
          </div>

          {/* Broker Network List */}
          <div className="flex flex-col gap-3">
            <div className="card-header-small border-accent mb-2">
              <h4>Broker Network Ledger</h4>
            </div>
            <div className="crm-table-container">
              <table className="crm-table">
                <thead>
                  <tr>
                    <th>Broker Name</th>
                    <th>Agency Details</th>
                    <th>RERA ID License</th>
                    <th>Referrals Logs</th>
                    <th>Commissions Paid</th>
                    <th>Network Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {brokers.map((broker) => (
                    <tr key={broker._id}>
                      <td><strong>{broker.name}</strong></td>
                      <td>
                        <div>{broker.agency}</div>
                        <div className="text-muted font-small">{broker.contact}</div>
                      </td>
                      <td className="text-gold font-small">{broker.reraNumber}</td>
                      <td>
                        <span className="badge badge-cold mr-2">{broker.leadReferralsCount} Referrals</span>
                      </td>
                      <td><strong>₹{broker.commissionEarned.toLocaleString()}</strong></td>
                      <td>
                        <span className={`badge ${broker.status === 'Active' ? 'badge-green' : 'badge-cold'}`}>{broker.status}</span>
                      </td>
                      <td>
                        {broker.status === 'Active' && (
                          <button 
                            className="btn btn-gold btn-small flex align-center gap-1"
                            onClick={() => handleRecordBrokerReferral(broker)}
                          >
                            <UserPlus size={12}/> Log Lead Referral
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                  {brokers.length === 0 && (
                    <tr>
                      <td colSpan="7" className="text-center text-muted">No sub-brokers logged.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 6. EXECUTIVE ANALYTICS TAB */}
      {crmTab === 'analytics' && (
        <div className="flex flex-col gap-6">
          <h3>Real-time Sales Boardroom Analytics</h3>
          
          <div className="grid grid-cols-3 gap-4">
            <div className="glass-card p-4">
              <h4 className="mb-3 flex align-center gap-2"><Award size={18} className="text-gold"/> Agent Performance Leaderboard</h4>
              <div className="flex flex-col gap-3 mt-2">
                <div className="flex justify-between align-center p-2 rounded" style={{ background: 'rgba(212,175,55,0.08)' }}>
                  <span>1. Sujal Talreja</span>
                  <strong>₹5.8 Cr closed</strong>
                </div>
                <div className="flex justify-between align-center p-2 rounded" style={{ background: 'rgba(255,255,255,0.03)' }}>
                  <span>2. Aarti Amin</span>
                  <strong>₹3.6 Cr closed</strong>
                </div>
                <div className="flex justify-between align-center p-2 rounded" style={{ background: 'rgba(255,255,255,0.03)' }}>
                  <span>3. Rohan Vora</span>
                  <strong>₹1.2 Cr closed</strong>
                </div>
              </div>
            </div>

            <div className="glass-card p-4">
              <h4 className="mb-3 flex align-center gap-2"><Clock size={18} className="text-blue"/> Lead Pipeline Velocity</h4>
              <div className="flex flex-col gap-3">
                <div className="flex justify-between">
                  <span className="text-muted">Avg. Lead Score:</span>
                  <strong>{leads.length ? Math.round(leads.reduce((a,b)=>a+b.score, 0)/leads.length) : 0}%</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted">Avg. Time-to-Close:</span>
                  <strong>14.5 Days</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted">Qualified Ratio:</span>
                  <strong>{leads.length ? Math.round((leads.filter(l=>l.score >= 80).length / leads.length)*100) : 0}%</strong>
                </div>
              </div>
            </div>

            <div className="glass-card p-4">
              <h4 className="mb-3 flex align-center gap-2"><Shield size={18} className="text-green"/> RERA & KYC Regulatory Status</h4>
              <div className="flex flex-col gap-3">
                <div className="flex justify-between">
                  <span className="text-muted">RERA Registered Builders:</span>
                  <strong className="text-green">{builders.length} Verified</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted">Registered Broker Network:</span>
                  <strong className="text-green">{brokers.filter(b=>b.status==='Active').length} Active</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted">Total KYC Pending:</span>
                  <strong className="text-gold">2 Leads</strong>
                </div>
              </div>
            </div>
          </div>

          <div className="glass-card p-4">
            <h4 className="mb-4">Traffic Acquisition Channels split (Marketing ROI)</h4>
            <div className="flex flex-col gap-3">
              {['Facebook Ads', 'Google Search', 'Website Chat', 'Walk-in', 'Instagram'].map(chan => {
                const count = leads.filter(l => l.source === chan).length;
                const pct = leads.length ? Math.round((count / leads.length) * 100) : 0;
                return (
                  <div key={chan} className="flex align-center gap-3">
                    <span className="text-muted" style={{ width: '120px' }}>{chan}</span>
                    <div className="flex-1 rounded" style={{ height: '8px', background: 'rgba(255,255,255,0.05)', overflow: 'hidden' }}>
                      <div className="h-100 bg-gold" style={{ width: `${pct}%`, background: 'var(--color-accent)' }}></div>
                    </div>
                    <span className="font-bold" style={{ width: '40px', textRight: 'true' }}>{pct}%</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* 7. SALES AUTOMATION PIPELINE TAB */}
      {crmTab === 'automation' && (
        <div className="flex flex-col gap-6">
          <div className="flex justify-between align-center mb-2 border-bottom pb-3">
            <div>
              <h3 className="flex align-center gap-2 text-gold"><Cpu /> AI Sales Pipeline Automation</h3>
              <p className="text-muted font-small">Nurture leads automatically with voice calling, PDF brochure dispatch, and followup actions</p>
            </div>
            <div className="flex gap-2">
              <button className="btn btn-outline flex align-center gap-2" onClick={() => setSelectedCallHistory(null)}>
                <History size={16} /> View History ({allVoiceCalls.length})
              </button>
            </div>
          </div>

          {/* KPI Summary Row */}
          <div className="automation-kpi-grid">
            <div className="glass-card p-3 text-center">
              <span className="text-muted font-small">Total Automated Calls</span>
              <h3 className="text-gold mt-1">{allVoiceCalls.length} Completed</h3>
            </div>
            <div className="glass-card p-3 text-center">
              <span className="text-muted font-small">Brochures Dispatched</span>
              <h3 className="text-green mt-1">{allVoiceCalls.filter(c => c.brochureSent).length} PDF</h3>
            </div>
            <div className="glass-card p-3 text-center">
              <span className="text-muted font-small">Follow-ups Scheduled</span>
              <h3 className="text-blue mt-1">{allVoiceCalls.filter(c => c.followupScheduled).length} Active</h3>
            </div>
            <div className="glass-card p-3 text-center">
              <span className="text-muted font-small">AI Nurturing Success Rate</span>
              <h3 className="text-gold mt-1">
                {allVoiceCalls.length ? Math.round((allVoiceCalls.filter(c => c.sentiment === 'Interested').length / allVoiceCalls.length) * 100) : 0}%
              </h3>
            </div>
          </div>

          {!isCalling ? (
            <div className="automation-flex-layout">
              {/* Left Column: Launch Automation Form */}
              <div className="crm-form-card glass-card p-4">
                <h4 className="text-gold mb-3 flex align-center gap-2"><PhoneCall size={18}/> Initiate Nurturing Pipeline</h4>
                <p className="text-muted font-small mb-4">Choose any lead to trigger the automatic sales nurturing pipeline. This will run a simulated voice call, speak out the conversation (if unmuted), and save logs.</p>
                
                <div className="form-group">
                  <label>Select Target Lead</label>
                  <select 
                    value={activeAutoLeadId} 
                    onChange={e => {
                      setActiveAutoLeadId(e.target.value);
                      setSelectedCallHistory(null);
                    }}
                  >
                    <option value="">Choose Lead...</option>
                    {leads.map(l => (
                      <option key={l._id} value={l._id}>
                        {l.name} - {l.project} ({l.status})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group mt-3">
                  <label>Automation Outreach Language</label>
                  <select 
                    value={automationLang} 
                    onChange={e => setAutomationLang(e.target.value)}
                  >
                    <option value="en">English (US/India)</option>
                    <option value="hi">Hindi (हिंदी)</option>
                    <option value="gu">Gujarati (ગુજરાતી)</option>
                  </select>
                </div>

                {activeAutoLeadId && (
                  (() => {
                    const selected = leads.find(l => l._id === activeAutoLeadId);
                    if (!selected) return null;
                    return (
                      <div className="glass-card p-3 font-small text-muted flex flex-col gap-2 mb-4 border-accent">
                        <div><strong className="text-gold">Lead Name:</strong> {selected.name}</div>
                        <div><strong className="text-gold">Phone:</strong> {selected.phone}</div>
                        <div><strong className="text-gold">Email:</strong> {selected.email}</div>
                        <div><strong className="text-gold">Project:</strong> {selected.project}</div>
                        <div><strong className="text-gold">BHK Preference:</strong> {selected.bhkPreference || '3 BHK'}</div>
                        <div><strong className="text-gold">Budget Constraint:</strong> ₹{(selected.budget || 20000000).toLocaleString()}</div>
                        {selected.automationStatus && (
                          <div className="mt-2 p-1 bg-glass-tertiary rounded flex justify-between align-center">
                            <span>Status: <strong className="text-green">{selected.automationStatus}</strong></span>
                            <button 
                              className="btn btn-outline btn-small text-red py-0 px-2 h-auto" 
                              onClick={() => {
                                if (confirm(`Reset automation history and restore lead status to New Lead for ${selected.name}?`)) {
                                  resetLeadAutomation({ leadId: selected._id })
                                    .then(() => alert("Automation history reset successfully!"))
                                    .catch(console.error);
                                }
                              }}
                            >
                              Reset State
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })()
                )}

                <div className="flex justify-between align-center mt-4">
                  <button 
                    className="btn btn-gold flex-1 flex align-center justify-center gap-2" 
                    disabled={!activeAutoLeadId}
                    onClick={() => {
                      if (!activeAutoLeadId) return;
                      // Start Simulated connection
                      setCallStatus("Dialing");
                      setIsCalling(true);
                      setVisibleTranscript([]);
                      setShowWhatsAppSim(false);
                      setShowEmailSim(false);
                      setDispatchActiveTab("whatsapp");
                      
                      const selected = leads.find(l => l._id === activeAutoLeadId);
                      
                      const bhkText = selected?.bhkPreference || "3 BHK";
                      
                      const formatBudget = (budgetNum, lang) => {
                        const crores = Math.floor(budgetNum / 10000000);
                        const rem = budgetNum % 10000000;
                        const lakhs = Math.floor(rem / 100000);
                        if (lang === "hi") {
                          let parts = [];
                          if (crores > 0) parts.push(`${crores} करोड़`);
                          if (lakhs > 0) parts.push(`${lakhs} लाख`);
                          return parts.join(" ") || "0 लाख";
                        } else if (lang === "gu") {
                          let parts = [];
                          if (crores > 0) parts.push(`${crores} કરોડ`);
                          if (lakhs > 0) parts.push(`${lakhs} લાખ`);
                          return parts.join(" ") || "0 લાખ";
                        } else {
                          let parts = [];
                          if (crores > 0) parts.push(`${crores} Crore${crores > 1 ? "s" : ""}`);
                          if (lakhs > 0) parts.push(`${lakhs} Lakh${lakhs > 1 ? "s" : ""}`);
                          return parts.join(" ") || "0 Lakhs";
                        }
                      };
                      const rawBudget = selected?.budget || 18000000;
                      const budText = formatBudget(rawBudget, automationLang);
                      
                      const projText = selected?.project || "Shivalik Skyview";
                      const leadNameText = selected?.name || "Client";

                      // Helper to get Gujarati honorific based on name
                      const getGujHonorific = (name) => {
                        if (!name) return "";
                        return isFemaleLead ? "બહેન" : "ભાઈ";
                      };

                      let transcript = [];
                      let summary = "";
                      let sentiment = "Interested";

                      // Detect lead gender for correct Hindi grammar
                      const femaleFirstNames = ["priya", "neha", "aarti", "sonia", "rhea", "diya", "ananya", "pooja", "tanvi", "isha", "kiara", "manisha", "vidya", "sunita", "kavita", "geeta", "reena", "seema", "deepa", "rekha", "kavya", "ishita", "shreya", "shruti", "suhani", "rupali", "simran", "poonam", "nisha", "meera", "lata", "radha", "anjali", "swati", "mamta", "sapna", "ritu", "shalini", "divya", "archana", "amita", "heena", "hema", "nita", "rita", "shanta", "asha", "usha", "kiran", "manju", "saroj", "sudha", "rama", "leela", "vimla", "pushpa"];
                      const leadFirstName = leadNameText.split(" ")[0];
                      const isFemaleLead = femaleFirstNames.includes(leadFirstName.trim().toLowerCase());

                      // Gender-correct forms
                      const lRaha  = isFemaleLead ? "रही" : "रहा";
                      const lTha   = isFemaleLead ? "थी" : "था";
                      const lSaku  = isFemaleLead ? "सकूँ" : "सकूँ";
                      const lDijiye = "दीजिए";
                      const gShoDhiRaha = isFemaleLead ? "શોધી રહી છું" : "શોધી રહ્યો છું";

                      const agentGender = "male";

                      const guAgentSpeaking =
                        agentGender === "male" ? "કરી રહ્યો છું" : "કરી રહી છું";

                      const guAgentCall =
                        agentGender === "male" ? "બોલી રહ્યો છું" : "બોલી રહી છું";

                      const hiAgentCall =
                        agentGender === "male" ? "बोल रहा हूँ" : "बोल रही हूँ";

                      const hiAgentSpeak =
                        agentGender === "male" ? "रहा" : "रही";

                      if (automationLang === "hi") {
                        transcript = [
                          { sender: "agent", text: `नमस्ते, क्या मैं ${leadNameText} जी से बात कर ${hiAgentSpeak} हूँ?`, time: "0:02" },
                          { sender: "lead",  text: `हाँ, मैं ${leadNameText} बोल ${lRaha} हूँ। आप कौन?`, time: "0:06" },
                          { sender: "agent", text: `नमस्ते! मैं शिवालिक ग्रुप से बात कर ${hiAgentSpeak} हूँ। मुझे दिखा कि आपने हमारी परियोजना ${projText} में रुचि दिखाई थी और ${bhkText} फ़्लैट के विकल्प देख रहे थे। क्या यह आपसे बात करने का सही समय है?`, time: "0:18" },
                          { sender: "lead",  text: `हाँ, मैं देख ${lRaha} ${lTha}। मुझे ₹${budText} के बजट के आसपास कोई अच्छा फ़्लैट चाहिए। क्या आपके पास विकल्प उपलब्ध हैं?`, time: "0:25" },
                          { sender: "agent", text: `बिल्कुल! हमारे पास ${projText} में बहुत अच्छे विकल्प हैं जो आपके बजट में आते हैं। इनमें बेहतरीन धूप, खुली बालकनी और स्मार्ट होम सुविधाएं हैं। क्या मैं आपको आधिकारिक साइट ब्रोशर भेज दूँ?`, time: "0:42" },
                          { sender: "lead",  text: `हाँ, ज़रूर भेज ${lDijiye} ताकि मैं फ़्लोर प्लान देख ${lSaku}।`, time: "0:48" },
                          { sender: "agent", text: `बहुत बढ़िया! मैंने ब्रोशर भेजने की प्रक्रिया शुरू कर दी है। आपको व्हाट्सएप और ईमेल पर ब्रोशर का लिंक मिल जाएगा। मैं कल सुबह 11:00 बजे एक फ़ॉलो-अप कॉल भी शेड्यूल कर ${hiAgentSpeak} हूँ ताकि हमारी टीम आपके सवालों के जवाब दे सके। क्या यह ठीक रहेगा?`, time: "1:05" },
                          { sender: "lead",  text: `हाँ, कल सुबह 11 बजे ठीक है। धन्यवाद!`, time: "1:11" },
                          { sender: "agent", text: `बहुत-बहुत धन्यवाद! ब्रोशर ज़रूर देखिएगा। कल बात करते हैं। आपका दिन शुभ हो!`, time: "1:20" }
                        ];
                        summary = `शिवालिक AI आउटरीच सफल रहा। ${leadNameText} ने ${projText} के लिए ब्रोशर का अनुरोध किया। कल सुबह 11 बजे का फॉलो-अप शेड्यूल किया गया।`;

                      } else if (automationLang === "gu") {
                        const honorific = getGujHonorific(leadNameText);
                        const leadSalutation = isFemaleLead ? "બહેન" : "સાહેબ";
                        transcript = [
                          { sender: "agent", text: `નમસ્કાર ${leadNameText} ${honorific}, હું શિવાલિક ગ્રુપમાંથી ${guAgentCall}. શું આપ સાથે બે મિનિટ વાત કરી શકું?`, time: "0:02" },
                          { sender: "lead", text: `હા, હું ${leadNameText} બોલું છું. બોલોને, આપ કોણ?`, time: "0:06" },
                          { sender: "agent", text: `આપે થોડા દિવસ પહેલા અમારા ${projText} પ્રોજેક્ટ અંગે પૂછપરછ કરી હતી. ખાસ કરીને ${bhkText} ફ્લેટમાં આપનો રસ હતો. એટલે થોડું માર્ગદર્શન આપવા માટે ફોન કર્યો છે.`, time: "0:18" },
                          { sender: "lead", text: `હા બોલો ${agentGender === "male" ? "સાહેબ" : "બહેન"}, હું હાલમાં ${budText} ના બજેટમાં સારો ફ્લેટ ${gShoDhiRaha}. શું હાલ કોઈ યુનિટ ઉપલબ્ધ છે?`, time: "0:25" },
                          { sender: "agent", text: `ચોક્કસ ${leadSalutation}. અમારા ${projText} પ્રોજેક્ટમાં હાલમાં ખૂબ સરસ ${bhkText} ના વિકલ્પો ઉપલબ્ધ છે. સારી હવા, કુદરતી પ્રકાશ, વિશાળ બાલ્કની અને તમામ આધુનિક સુવિધાઓ સાથે આવે છે. જો આપને અનુકૂળ હોય તો હું હમણાં જ સાઇટ બ્રોશર WhatsApp અને Email પર મોકલી દઉં?`, time: "0:42" },
                          { sender: "lead", text: `હા જરૂર મોકલી આપો. હું અને મારો પરિવાર સાથે બેસીને ફ્લોર પ્લાન અને પ્રાઇસિંગ જોઈ લઈશું.`, time: "0:48" },
                          { sender: "agent", text: `સરસ. બ્રોશર થોડા જ ક્ષણોમાં પહોંચી જશે. હું આવતીકાલે સવારે ૧૧ વાગ્યે ફરી સંપર્ક કરીશ જેથી આપના કોઈ પ્રશ્ન હોય તો તેનું માર્ગદર્શન આપી શકીએ.`, time: "1:05" },
                          { sender: "lead", text: `બરાબર ${agentGender === "male" ? "સાહેબ" : "બહેન"}. આવતીકાલે સવારે વાત કરીએ. આભાર.`, time: "1:11" },
                          { sender: "agent", text: `ખૂબ ખૂબ આભાર ${leadNameText} ${honorific}. આપનો કિંમતી સમય આપવા બદલ આભાર. બ્રોશર જરૂર જોઈ લેજો. શુભ દિવસ.`, time: "1:20" }
                        ];
                        summary = `શિવાલિક AI આઉટરીચ સફળ રહ્યો. ${leadNameText} એ પ્રોજેક્ટ ${projText} માટે સાઇટ બ્રોશર મંગાવ્યું. કાલે સવારે ૧૧ વાગ્યાનો ફોલો-અપ નક્કી કર્યો.`;
    } else {
                        transcript = [
                          { sender: "agent", text: `Hello, is this ${leadNameText}?`, time: "0:02" },
                          { sender: "lead", text: `Yes, this is ${leadNameText}. Who is this?`, time: "0:06" },
                          { sender: "agent", text: `Hi! I'm calling from Shivalik Group. I see you recently inquired about our project, ${projText}, and were checking options for a premium ${bhkText}. Am I reaching you at a good time?`, time: "0:18" },
                          { sender: "lead", text: `Yes, I was looking at that. I'm searching for a property with a budget around ₹${budText} Lakhs. Are there units available?`, time: "0:25" },
                          { sender: "agent", text: `Yes, absolutely! We have a few premium options in ${projText} that align perfectly. They feature high sunlight ratings, structural height optimization, and modern balconies. Would you like me to send you the site brochure?`, time: "0:42" },
                          { sender: "lead", text: `Yes, definitely. Please send it over so I can review the floor plans.`, time: "0:48" },
                          { sender: "agent", text: `Wonderful! I have triggered the brochure dispatch system. You'll receive the PDF download link right away. I'm also scheduling a follow-up call for tomorrow at 11:00 AM. Would that be alright?`, time: "1:05" },
                          { sender: "lead", text: `Sure, tomorrow at 11 AM works for me. Thanks!`, time: "1:11" },
                          { sender: "agent", text: `Excellent. Enjoy reviewing the brochure, and we will connect tomorrow. Have a great day!`, time: "1:20" }
                        ];
                        summary = `Outreach call successful. ${leadNameText} is interested in ${projText} and requested the brochure. Scheduled next-day follow-up.`;
                      }

                      const fallbackRes = {
                        callId: "mock-call-id",
                        project: projText,
                        transcript,
                        summary,
                        sentiment
                      };

                      // Handle local mock leads to avoid backend validation errors
                      if (activeAutoLeadId.startsWith("mock-")) {
                        console.log("Local mock lead detected. Using local frontend simulation client-side.");
                        setActiveCallLog(fallbackRes);
                        prefetchCallAudio(fallbackRes);
                        setTimeout(() => {
                          setCallStatus("Ringing");
                        }, 1500);
                        setTimeout(() => {
                          setCallStatus("Connected");
                        }, 3000);
                      } else {
                        // Trigger backend mutation
                        executeAutomation({ leadId: activeAutoLeadId, language: automationLang })
                          .then((res) => {
                            setActiveCallLog(res);
                            prefetchCallAudio(res);
                            setTimeout(() => {
                              setCallStatus("Ringing");
                            }, 1500);
                            setTimeout(() => {
                              setCallStatus("Connected");
                            }, 3000);
                          })
                          .catch(err => {
                            console.warn("Convex database is offline or not synced. Falling back to local frontend simulation client-side.", err);
                            setActiveCallLog(fallbackRes);
                            prefetchCallAudio(fallbackRes);
                            setTimeout(() => {
                              setCallStatus("Ringing");
                            }, 1500);
                            setTimeout(() => {
                              setCallStatus("Connected");
                            }, 3000);
                          });
                      }
                    }}
                  >
                    <PhoneCall size={16} /> Launch Automated Calling Nurturing
                  </button>
                </div>
              </div>

              {/* Right Column: Past Call History List */}
              <div className="glass-card p-4 flex flex-col gap-3">
                <h4 className="text-gold mb-3 flex align-center gap-2"><History size={18}/> Automation logs and history</h4>
                <div className="crm-table-container" style={{ maxHeight: '350px' }}>
                  <table className="crm-table">
                    <thead>
                      <tr>
                        <th>Date</th>
                        <th>Lead Name</th>
                        <th>Project</th>
                        <th>Sentiment</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {allVoiceCalls.map((call) => (
                        <tr key={call._id} className="hover-glow-gold cursor-pointer" onClick={() => setSelectedCallHistory(call)}>
                          <td>{call.date}</td>
                          <td><strong>{call.leadName}</strong></td>
                          <td>{call.project}</td>
                          <td>
                            <span className={`badge ${call.sentiment === 'Interested' ? 'badge-green' : 'badge-gold'}`}>
                              {call.sentiment}
                            </span>
                          </td>
                          <td>
                            <button className="btn btn-outline btn-small py-1">View Logs</button>
                          </td>
                        </tr>
                      ))}
                      {allVoiceCalls.length === 0 && (
                        <tr>
                          <td colSpan="5" className="text-center text-muted">No automation runs logged yet.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          ) : (
            /* Active Calling Console View */
            <div className={`dialer-view glass-card ${(callStatus === "Connected" || callStatus === "Completed") ? 'max-w-5xl' : 'max-w-4xl'} mx-auto transition-all duration-500`} style={{ transition: 'max-width 0.5s ease-in-out' }}>
              <style>{`
                @keyframes slideInRight {
                  from { transform: translateX(40px); opacity: 0; }
                  to { transform: translateX(0); opacity: 1; }
                }
                @keyframes slideUp {
                  from { transform: translateY(20px); opacity: 0; }
                  to { transform: translateY(0); opacity: 1; }
                }
                .animate-slide-in-right {
                  animation: slideInRight 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
                }
                .animate-slide-up-bubble {
                  animation: slideUp 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards;
                }
              `}</style>

              <div className="flex flex-col md:flex-row gap-6">
                {/* Main Call Console Column */}
                <div className="flex-1 flex flex-col gap-4">
                  <div className="flex justify-between align-center border-bottom pb-2">
                    <div className="flex align-center gap-2">
                      <span className="ai-badge"><Sparkles size={12}/> AI Calling Agent Active</span>
                      <span className="text-muted font-small">Agent Ref: Shivalik Voice CRM-V1</span>
                      <span style={{ fontSize: '10px', padding: '2px 7px', background: 'rgba(99,102,241,0.18)', border: '1px solid rgba(99,102,241,0.4)', borderRadius: '6px', color: '#a5b4fc', fontWeight: 600, letterSpacing: '0.3px' }}>
                        🎙 Sarvam AI TTS
                      </span>
                    </div>
                    <div className="flex align-center gap-3">
                      <button 
                        className="btn btn-outline btn-small flex align-center gap-1"
                        onClick={() => setIsMuted(!isMuted)}
                      >
                        {isMuted ? <VolumeX size={14} className="text-red" /> : <Volume2 size={14} className="text-green" />}
                        {isMuted ? "Unmute Voice" : "Mute Voice"}
                      </button>
                      <button 
                        className="btn btn-outline btn-small text-red flex align-center gap-1"
                        onClick={() => {
                          setIsCalling(false);
                          setCallStatus("Idle");
                          if (sarvamAudioRef.current) {
                            sarvamAudioRef.current.pause();
                            sarvamAudioRef.current = null;
                          }
                          if (window.speechSynthesis) {
                            window.speechSynthesis.cancel();
                          }
                        }}
                      >
                        <PhoneOff size={14} /> Hang Up
                      </button>
                    </div>
                  </div>

                  {/* Pulse Dialer Visualizer */}
                  <div className="my-3">
                    <div className="pulse-circle">
                      <Phone size={36} className="text-gold animate-pulse" />
                    </div>
                    <h4 className="mt-2 text-gold">
                      {callStatus === "Dialing" && "Dialing Customer..."}
                      {callStatus === "Ringing" && "Ringing (+91 99XXXX XX44)..."}
                      {callStatus === "Connected" && "Connected (AI Agent Nurturing...)"}
                      {callStatus === "Completed" && "Call Sequence Finished!"}
                    </h4>
                    <p className="text-muted font-small mt-1">
                      Target Lead: <strong>{leads.find(l => l._id === activeAutoLeadId)?.name}</strong> | Project: <strong>{leads.find(l => l._id === activeAutoLeadId)?.project}</strong>
                    </p>
                  </div>

                  {/* Sound wave visualizer (only when Connected and speaking) */}
                  {callStatus === "Connected" && (
                    <div className="wave-container">
                      <div className="wave-bar"></div>
                      <div className="wave-bar"></div>
                      <div className="wave-bar"></div>
                      <div className="wave-bar"></div>
                      <div className="wave-bar"></div>
                      <div className="wave-bar"></div>
                      <div className="wave-bar"></div>
                    </div>
                  )}

                  {/* Live Email SMTP Server notification overlay */}
                  {callStatus === "Connected" && showEmailSim && (
                    <div className="glass-card p-3 text-left flex gap-3 align-center border-accent animate-fade-in" style={{ background: 'linear-gradient(135deg, rgba(30,58,138,0.15), rgba(59,130,246,0.1))', border: '1px solid rgba(59,130,246,0.3)', borderRadius: '8px', animation: 'fadeIn 0.5s ease-out' }}>
                      <div className="p-2 rounded-circle" style={{ background: '#3B82F6', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Mail size={16} />
                      </div>
                      <div className="flex-1 overflow-hidden" style={{ minWidth: 0 }}>
                        <div className="flex justify-between align-center">
                          <strong style={{ color: '#3B82F6', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Email SMTP Server</strong>
                          <span style={{ fontSize: '9px', background: 'rgba(59,130,246,0.15)', color: '#3B82F6', padding: '1px 5px', borderRadius: '4px' }}>Sent & Signed</span>
                        </div>
                        <p style={{ fontSize: '10px', color: '#e2e8f0', margin: '2px 0 0 0', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                          Sent to {leads.find(l => l._id === activeAutoLeadId)?.email || "client@domain.com"}: Brochure & RERA attachments.
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Real-time scrolling speech transcript box */}
                  {(callStatus === "Connected" || callStatus === "Completed") && (
                    <div className="flex flex-col gap-2">
                      <div className="flex align-center justify-between pl-1 pr-1">
                        <div className="text-left font-bold text-muted font-small">Live Call Transcription:</div>
                        <div style={{ fontSize: '10px', color: '#a5b4fc', display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#a5b4fc', display: 'inline-block', animation: 'pulse 1.5s infinite' }}></span>
                          Sarvam Neural Voice ({{ en: 'en-IN', hi: 'hi-IN', gu: 'gu-IN' }[automationLang]})
                        </div>
                      </div>
                      <div id="auto-transcript-box" className="transcript-box">
                        {visibleTranscript.map((line, idx) => (
                          <div 
                            key={idx} 
                            className={`bubble ${line.sender === 'agent' ? 'bubble-agent' : 'bubble-lead'}`}
                          >
                            <span className="block font-bold text-muted" style={{ fontSize: '10px', marginBottom: '3px' }}>
                              {line.sender === 'agent' ? '🤖 AI Sales Agent' : '👤 Customer'} ({line.time})
                            </span>
                            <p>{line.text}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Post Call Automation Execution Results */}
                  {callStatus === "Completed" && (
                    <div className="glass-card p-4 border-accent bg-glass-tertiary text-left mt-3">
                      <h4 className="text-green mb-3 flex align-center gap-2"><CheckCircle size={18}/> CRM Pipeline Automation Triggered Successfully</h4>
                      <div className="grid grid-cols-2 gap-4 font-small text-muted mb-4">
                        <div>
                          <p className="mb-2">🟢 <strong>Call Log Saved:</strong> Recorded duration 80 seconds with sentiment <strong>"Interested"</strong>.</p>
                          <p className="mb-2">🟢 <strong>Kanban Stage Updated:</strong> Lead advanced to stage <strong>"Contacted"</strong>.</p>
                          <p className="mb-2">🟢 <strong>Interaction Lead Score:</strong> Fit Score increased by 15 points to <strong>90%</strong>.</p>
                        </div>
                        <div>
                          <p className="mb-2">🟢 <strong>Followup Call Logged:</strong> Scheduled follow-up for tomorrow at 11:00 AM in Convex DB.</p>
                          <p className="mb-2">🟢 <strong>PDF Brochure Sent:</strong> RERA brochure for project <strong>{leads.find(l => l._id === activeAutoLeadId)?.project}</strong> dispatched.</p>
                        </div>
                      </div>

                      <div className="flex gap-3 justify-end border-top pt-3">
                        <button 
                          className="btn btn-outline flex align-center gap-2"
                          onClick={() => {
                            const target = leads.find(l => l._id === activeAutoLeadId);
                            if (target) {
                              handleDownloadAutomationBrochure(target.name, target.project, target.bhkPreference);
                            }
                          }}
                        >
                          <Download size={14} /> Download PDF Brochure
                        </button>
                        <button 
                          className="btn btn-gold px-6"
                          onClick={() => {
                            setIsCalling(false);
                            setCallStatus("Idle");
                          }}
                        >
                          Return to Automation Center
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Simulated Real-time Dispatches Monitor Column */}
                {(callStatus === "Connected" || callStatus === "Completed") && (
                  <div className="flex justify-center items-center animate-slide-in-right md:border-l md:pl-6" style={{ borderColor: 'rgba(255,255,255,0.08)', minWidth: '300px' }}>
                    <div className="flex flex-col gap-4">
                      {/* Tab Navigation Segment */}
                      <div className="flex bg-glass-tertiary p-1 rounded-lg" style={{ border: '1px solid rgba(255,255,255,0.05)' }}>
                        <button 
                          className={`flex-1 py-1.5 px-3 rounded-md font-small transition-all flex align-center justify-center gap-1.5 ${dispatchActiveTab === "whatsapp" ? 'bg-gold text-dark font-bold' : 'text-muted hover:text-white'}`}
                          onClick={() => setDispatchActiveTab("whatsapp")}
                          style={{ border: 'none', outline: 'none', cursor: 'pointer' }}
                        >
                          <Send size={12} /> WhatsApp
                        </button>
                        <button 
                          className={`flex-1 py-1.5 px-3 rounded-md font-small transition-all flex align-center justify-center gap-1.5 ${dispatchActiveTab === "email" ? 'bg-gold text-dark font-bold' : 'text-muted hover:text-white'}`}
                          onClick={() => setDispatchActiveTab("email")}
                          style={{ border: 'none', outline: 'none', cursor: 'pointer' }}
                        >
                          <Mail size={12} /> Email Inbox
                        </button>
                      </div>

                      {dispatchActiveTab === "whatsapp" ? (
                        /* WhatsApp Smartphone Mockup */
                        <div className="smartphone-bezel" style={{
                          width: '280px',
                          height: '460px',
                          background: '#111827',
                          borderRadius: '36px',
                          border: '8px solid #374151',
                          boxShadow: '0 20px 40px -10px rgba(0,0,0,0.5), 0 0 15px rgba(212,175,55,0.15)',
                          position: 'relative',
                          overflow: 'hidden',
                          display: 'flex',
                          flexDirection: 'column'
                        }}>
                          {/* Speaker Notch */}
                          <div style={{
                            width: '100px',
                            height: '16px',
                            background: '#374151',
                            borderRadius: '0 0 10px 10px',
                            position: 'absolute',
                            top: 0,
                            left: '50%',
                            transform: 'translateX(-50%)',
                            zIndex: 10
                          }}></div>

                          {/* WhatsApp Chat Header */}
                          <div style={{
                            background: '#075E54',
                            color: '#fff',
                            padding: '20px 12px 10px 12px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                            boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                          }}>
                            <span style={{ fontSize: '12px', marginRight: '1px' }}>←</span>
                            <div style={{
                              width: '26px',
                              height: '26px',
                              borderRadius: '50%',
                              background: 'var(--color-accent, #D4AF37)',
                              color: '#111',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: '10px',
                              fontWeight: 'bold'
                            }}>SG</div>
                            <div style={{ flex: 1, minWidth: 0, textAlign: 'left' }}>
                              <div style={{ fontSize: '11px', fontWeight: 'bold', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>Shivalik Group Official</div>
                              <div style={{ fontSize: '8px', opacity: 0.8 }}>Online (Business Account)</div>
                            </div>
                          </div>

                          {/* Chat Wallpaper Background */}
                          <div style={{
                            flex: 1,
                            background: '#efeae2',
                            backgroundImage: 'radial-gradient(#dfdcd6 1px, transparent 0)',
                            backgroundSize: '16px 16px',
                            padding: '10px',
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'flex-end',
                            gap: '8px',
                            overflowY: 'auto'
                          }}>
                            <div style={{
                              alignSelf: 'center',
                              background: 'rgba(255, 255, 255, 0.75)',
                              color: '#54656f',
                              padding: '3px 8px',
                              borderRadius: '6px',
                              fontSize: '8px',
                              boxShadow: '0 1px 1px rgba(0,0,0,0.05)',
                              marginBottom: '6px'
                            }}>
                              TODAY
                            </div>

                            {/* Client Request */}
                            <div style={{
                              alignSelf: 'flex-start',
                              background: '#fff',
                              padding: '6px 8px',
                              borderRadius: '0 8px 8px 8px',
                              maxWidth: '85%',
                              fontSize: '10px',
                              boxShadow: '0 1px 1px rgba(0,0,0,0.15)',
                              color: '#111',
                              textAlign: 'left'
                            }}>
                              Hi, I would like to get details of your projects.
                              <div style={{ fontSize: '7px', color: '#667781', textAlign: 'right', marginTop: '2px' }}>11:34 AM</div>
                            </div>

                            {/* Sent Brochure Message Bubble */}
                            {showWhatsAppSim ? (
                              <div className="animate-slide-up-bubble" style={{
                                alignSelf: 'flex-end',
                                background: '#d9fdd3',
                                padding: '5px',
                                borderRadius: '8px 0 8px 8px',
                                maxWidth: '85%',
                                boxShadow: '0 1px 1px rgba(0,0,0,0.15)',
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '3px'
                              }}>
                                <div style={{
                                  background: '#c7ebb8',
                                  borderRadius: '5px',
                                  padding: '6px',
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '6px',
                                  borderLeft: '3px solid #b33939'
                                }}>
                                  <div style={{ color: '#b33939', fontSize: '15px' }}>📄</div>
                                  <div style={{ flex: 1, minWidth: 0, textAlign: 'left' }}>
                                    <div style={{ fontSize: '9px', fontWeight: 'bold', color: '#111', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                      {leads.find(l => l._id === activeAutoLeadId)?.project}_site_brochure.pdf
                                    </div>
                                    <div style={{ fontSize: '7px', color: '#667781' }}>4.2 MB • PDF</div>
                                  </div>
                                </div>
                                <div style={{ fontSize: '10px', color: '#111', padding: '0 2px', textAlign: 'left' }}>
                                  Hello {leads.find(l => l._id === activeAutoLeadId)?.name}, here is the brochure for {leads.find(l => l._id === activeAutoLeadId)?.project} project as requested.
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '2px', marginTop: '1px' }}>
                                  <span style={{ fontSize: '7px', color: '#667781' }}>11:35 AM</span>
                                  <span style={{ color: '#53bdeb', fontSize: '9px' }}>✓✓</span>
                                </div>
                              </div>
                            ) : (
                              <div style={{
                                display: 'flex',
                                alignSelf: 'stretch',
                                background: 'rgba(255,255,255,0.7)',
                                padding: '10px',
                                borderRadius: '8px',
                                fontSize: '9px',
                                color: '#4b5563',
                                textAlign: 'left',
                                gap: '8px',
                                border: '1px dashed rgba(0,0,0,0.1)'
                              }}>
                                <span style={{ animation: 'pulse 1s infinite' }}>⏳</span>
                                <div>
                                  <strong>Waiting for agent trigger...</strong>
                                  <div style={{ fontSize: '8px', opacity: 0.8, marginTop: '2px' }}>Brochure will dispatch automatically.</div>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      ) : (
                        /* High-fidelity Email Client/Inbox Preview */
                        <div className="email-client-box animate-fade-in" style={{
                          width: '280px',
                          height: '460px',
                          background: '#ffffff',
                          borderRadius: '12px',
                          border: '1px solid rgba(255,255,255,0.1)',
                          boxShadow: '0 20px 40px -10px rgba(0,0,0,0.5), 0 0 15px rgba(59,130,246,0.15)',
                          overflow: 'hidden',
                          display: 'flex',
                          flexDirection: 'column',
                          color: '#333333'
                        }}>
                          {/* Browser Address Bar */}
                          <div style={{
                            background: '#f1f5f9',
                            padding: '8px 12px',
                            borderBottom: '1px solid #e2e8f0',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px'
                          }}>
                            <div style={{ display: 'flex', gap: '4px' }}>
                              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#ef4444', display: 'inline-block' }}></span>
                              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#eab308', display: 'inline-block' }}></span>
                              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#22c55e', display: 'inline-block' }}></span>
                            </div>
                            <div style={{
                              flex: 1,
                              background: '#ffffff',
                              borderRadius: '4px',
                              border: '1px solid #cbd5e1',
                              fontSize: '8px',
                              padding: '2px 6px',
                              textAlign: 'left',
                              color: '#64748b',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap'
                            }}>
                              https://mail.google.com/mail/u/0/#inbox
                            </div>
                          </div>

                          {/* Email Headers */}
                          <div style={{
                            padding: '10px 12px',
                            borderBottom: '1px solid #e2e8f0',
                            textAlign: 'left',
                            fontSize: '10px',
                            background: '#fafafa'
                          }}>
                            <div style={{ marginBottom: '3px' }}>
                              <strong style={{ color: '#64748b' }}>From:</strong> sales@shivalikgroup.com
                            </div>
                            <div style={{ marginBottom: '3px' }}>
                              <strong style={{ color: '#64748b' }}>To:</strong> {leads.find(l => l._id === activeAutoLeadId)?.email || "client@domain.com"}
                            </div>
                            <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              <strong style={{ color: '#64748b' }}>Subject:</strong> Brochure & Site Floor Plans - Shivalik Group
                            </div>
                          </div>

                          {/* Email Content Body */}
                          <div style={{
                            flex: 1,
                            padding: '12px',
                            overflowY: 'auto',
                            fontSize: '10px',
                            lineHeight: '1.4',
                            textAlign: 'left',
                            background: '#ffffff'
                          }}>
                            {showEmailSim ? (
                              <div className="animate-slide-up-bubble">
                                {/* Shivalik Brand Header */}
                                <div style={{
                                  borderBottom: '2px solid #D4AF37',
                                  pb: '6px',
                                  marginBottom: '10px',
                                  display: 'flex',
                                  justifyContent: 'space-between',
                                  alignItems: 'center'
                                }}>
                                  <strong style={{ color: '#D4AF37', letterSpacing: '1px', fontSize: '11px' }}>SHIVALIK GROUP</strong>
                                  <span style={{ fontSize: '8px', color: '#94a3b8', fontStyle: 'italic' }}>Verified Sender</span>
                                </div>

                                <p style={{ margin: '0 0 8px 0', fontWeight: 'bold' }}>
                                  Dear {leads.find(l => l._id === activeAutoLeadId)?.name || "Valued Lead"},
                                </p>

                                <p style={{ margin: '0 0 8px 0', color: '#475569' }}>
                                  Thank you for taking the time to speak with our AI Outreach Specialist today regarding <strong>{leads.find(l => l._id === activeAutoLeadId)?.project || "our premium properties"}</strong>.
                                </p>

                                <p style={{ margin: '0 0 10px 0', color: '#475569' }}>
                                  As requested, we have compiled the official site plans and structure details. You can download the complete site brochure directly using the button below:
                                </p>

                                {/* Action Download Button */}
                                <div style={{ textAlign: 'center', margin: '14px 0' }}>
                                  <a 
                                    href="#"
                                    onClick={(e) => e.preventDefault()}
                                    style={{
                                      background: '#D4AF37',
                                      color: '#111111',
                                      padding: '6px 14px',
                                      borderRadius: '4px',
                                      textDecoration: 'none',
                                      fontWeight: 'bold',
                                      fontSize: '9px',
                                      boxShadow: '0 2px 4px rgba(212,175,55,0.2)',
                                      display: 'inline-block'
                                    }}
                                  >
                                    Download Site Brochure (PDF)
                                  </a>
                                </div>

                                <p style={{ margin: '0 0 4px 0', color: '#64748b', fontSize: '9px' }}>
                                  Sincerely,
                                </p>
                                <strong style={{ color: '#1e293b', fontSize: '9px' }}>
                                  Sales CRM Coordinator
                                </strong>
                                <div style={{ color: '#94a3b8', fontSize: '8px' }}>
                                  Shivalik Group, Ahmedabad
                                </div>
                              </div>
                            ) : (
                              <div style={{
                                display: 'flex',
                                alignSelf: 'stretch',
                                background: 'rgba(243,244,246,0.8)',
                                padding: '10px',
                                borderRadius: '8px',
                                fontSize: '9px',
                                color: '#4b5563',
                                textAlign: 'left',
                                gap: '8px',
                                border: '1px dashed rgba(0,0,0,0.1)',
                                marginTop: '30px'
                              }}>
                                <span style={{ animation: 'pulse 1s infinite' }}>⏳</span>
                                <div>
                                  <strong>Waiting for SMTP release...</strong>
                                  <div style={{ fontSize: '8px', opacity: 0.8, marginTop: '2px' }}>Email template will load dynamically.</div>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Detailed Call Log History View Overlay/Modal */}
          {selectedCallHistory && (
            <div className="modal-overlay">
              <div className="glass-card modal-content max-w-2xl">
                <div className="modal-header">
                  <h3 className="text-gold flex align-center gap-2"><History /> Voice Call Log Details</h3>
                  <button className="btn-close" onClick={() => setSelectedCallHistory(null)}><X /></button>
                </div>
                
                <div className="flex flex-col gap-4 font-small text-muted mt-3">
                  <div className="grid grid-cols-2 gap-3 p-3 bg-glass-tertiary rounded border">
                    <div><strong>Customer Name:</strong> {selectedCallHistory.leadName}</div>
                    <div><strong>Interested Project:</strong> {selectedCallHistory.project}</div>
                    <div><strong>Call Date:</strong> {selectedCallHistory.date}</div>
                    <div><strong>Call Duration:</strong> {selectedCallHistory.duration} seconds</div>
                    <div><strong>Analysis Sentiment:</strong> <span className="badge badge-gold">{selectedCallHistory.sentiment}</span></div>
                    <div><strong>Brochure Sent:</strong> {selectedCallHistory.brochureSent ? 'Yes (PDF RERA)' : 'No'}</div>
                  </div>

                  <div>
                    <strong>Conversation Transcription Archive:</strong>
                    <div className="transcript-box mt-2" style={{ height: '200px' }}>
                      {selectedCallHistory.transcript.map((line, idx) => (
                        <div key={idx} className={`bubble ${line.sender === 'agent' ? 'bubble-agent' : 'bubble-lead'}`}>
                          <span className="block font-bold text-muted" style={{ fontSize: '9px', marginBottom: '2px' }}>
                            {line.sender === 'agent' ? '🤖 AI Agent' : '👤 Customer'} ({line.time})
                          </span>
                          <p>{line.text}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="p-3 bg-glass-tertiary rounded border">
                    <strong>AI Executive Summary:</strong>
                    <p className="mt-1 text-muted">{selectedCallHistory.summary}</p>
                  </div>

                  <div className="flex justify-between align-center border-top pt-3 mt-2">
                    <button 
                      className="btn btn-outline flex align-center gap-1"
                      onClick={() => handleDownloadAutomationBrochure(selectedCallHistory.leadName, selectedCallHistory.project, '3 BHK')}
                    >
                      <Download size={14}/> Download Sent Brochure PDF
                    </button>
                    <button className="btn btn-gold" onClick={() => setSelectedCallHistory(null)}>
                      Close Logs
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* LEAD PROFILE EXPANDED MODAL */}
      {selectedLead && (
        <div className="modal-overlay">
          <div className="glass-card modal-content crm-modal-expanded">
            <div className="modal-header">
              <div className="flex align-center gap-4">
                <h3>{selectedLead.name}</h3>
                <span className={`badge ${selectedLead.score >= 80 ? 'badge-hot' : 'badge-cold'}`}>AI Match Fit: {selectedLead.score}</span>
                <span className="badge badge-gold">{selectedLead.status}</span>
              </div>
              <button className="btn-close" onClick={() => setSelectedLead(null)}><X /></button>
            </div>
            
            <div className="crm-modal-body">
              {/* Vertical Sidebar Tabs */}
              <div className="crm-tabs-sidebar">
                <button className={`crm-tab-btn ${activeProfileTab === 'profile' ? 'active' : ''}`} onClick={() => setActiveProfileTab('profile')}>
                  <Activity size={16}/> Profile Sheet
                </button>
                <button className={`crm-tab-btn ${activeProfileTab === 'match' ? 'active' : ''}`} onClick={() => setActiveProfileTab('match')}>
                  <Sparkles size={16}/> Smart Match
                </button>
                <button className={`crm-tab-btn ${activeProfileTab === 'visit' ? 'active' : ''}`} onClick={() => setActiveProfileTab('visit')}>
                  <Calendar size={16}/> Visits & Logistics
                </button>
                <button className={`crm-tab-btn ${activeProfileTab === 'comms' ? 'active' : ''}`} onClick={() => setActiveProfileTab('comms')}>
                  <MessageSquare size={16}/> Communications
                </button>
                <button className={`crm-tab-btn ${activeProfileTab === 'docs' ? 'active' : ''}`} onClick={() => setActiveProfileTab('docs')}>
                  <FileText size={16}/> Documents
                </button>
              </div>

              {/* Tab Content Area */}
              <div className="crm-tab-content-area">
                
                {/* 1. COMPREHENSIVE PROFILE SHEET TAB */}
                {activeProfileTab === 'profile' && (
                  <div className="flex flex-col gap-4">
                    <div className="flex justify-between align-center border-bottom pb-2">
                      <h4 className="text-gold">Contact & Demographic Details</h4>
                      <button 
                        className="btn btn-outline btn-small"
                        onClick={() => {
                          if (isEditingLeadFields) {
                            handleSaveLeadDetailsSubmit();
                          } else {
                            setIsEditingLeadFields(true);
                          }
                        }}
                      >
                        {isEditingLeadFields ? "Save Changes" : "Edit Profile Sheet"}
                      </button>
                    </div>

                    {!isEditingLeadFields ? (
                      <div className="grid grid-cols-2 gap-4 text-muted">
                        <div>
                          <p className="mb-2"><strong className="text-gold">Mobile:</strong> {selectedLead.phone}</p>
                          <p className="mb-2"><strong className="text-gold">Email Address:</strong> {selectedLead.email}</p>
                          <p className="mb-2"><strong className="text-gold">Budget Level:</strong> ₹{(selectedLead.budget || 20000000).toLocaleString()}</p>
                          <p className="mb-2"><strong className="text-gold">BHK Preference:</strong> {selectedLead.bhkPreference || "3 BHK"}</p>
                          <p className="mb-2"><strong className="text-gold">Preferred Area:</strong> {selectedLead.preferredLocation || "Ambawadi"}</p>
                          <p className="mb-2"><strong className="text-gold">Source Origin:</strong> {selectedLead.source || "Direct"}</p>
                        </div>
                        <div>
                          <p className="mb-2"><strong className="text-gold">Occupation:</strong> {selectedLead.occupation || "N/A"}</p>
                          <p className="mb-2"><strong className="text-gold">Annual Earnings:</strong> ₹{(selectedLead.annualIncome || 0).toLocaleString()}</p>
                          <p className="mb-2"><strong className="text-gold">Family Setup:</strong> {selectedLead.familyDetails || "N/A"}</p>
                          <p className="mb-2"><strong className="text-gold">Buying Purpose:</strong> {selectedLead.purpose || "Buy"}</p>
                          <p className="mb-2"><strong className="text-gold">Bank Loan Required:</strong> {selectedLead.loanRequired ? "Yes" : "No"}</p>
                          <p className="mb-2"><strong className="text-gold">Assigned Agent:</strong> {selectedLead.assignedExecutive || "Sujal Talreja"}</p>
                        </div>
                        <div className="col-span-2 bg-glass-tertiary p-3 rounded" style={{ border: '1px solid var(--color-tertiary)', background: 'rgba(255,255,255,0.01)' }}>
                          <strong className="text-gold block mb-1">Consultation Action Notes:</strong>
                          <p>{selectedLead.notes || selectedLead.action || "No notes logged for this customer profile yet."}</p>
                        </div>
                      </div>
                    ) : (
                      <div className="grid grid-cols-2 gap-3">
                        <div className="form-group col">
                          <label>Full Name</label>
                          <input type="text" value={editableLeadFields.name || ''} onChange={e => setEditableLeadFields({...editableLeadFields, name: e.target.value})}/>
                        </div>
                        <div className="form-group col">
                          <label>Mobile Number</label>
                          <input type="text" value={editableLeadFields.phone || ''} onChange={e => setEditableLeadFields({...editableLeadFields, phone: e.target.value})}/>
                        </div>
                        <div className="form-group col">
                          <label>Email Address</label>
                          <input type="email" value={editableLeadFields.email || ''} onChange={e => setEditableLeadFields({...editableLeadFields, email: e.target.value})}/>
                        </div>
                        <div className="form-group col">
                          <label>Financial Budget (INR)</label>
                          <input type="number" value={editableLeadFields.budget || 20000000} onChange={e => setEditableLeadFields({...editableLeadFields, budget: Number(e.target.value)})}/>
                        </div>
                        <div className="form-group col">
                          <label>BHK Config</label>
                          <select value={editableLeadFields.bhkPreference || '3 BHK'} onChange={e => setEditableLeadFields({...editableLeadFields, bhkPreference: e.target.value})}>
                            <option>2 BHK</option>
                            <option>3 BHK</option>
                            <option>4 BHK</option>
                            <option>5 BHK</option>
                          </select>
                        </div>
                        <div className="form-group col">
                          <label>Preferred Location</label>
                          <input type="text" value={editableLeadFields.preferredLocation || 'Ambawadi'} onChange={e => setEditableLeadFields({...editableLeadFields, preferredLocation: e.target.value})}/>
                        </div>
                        <div className="form-group col">
                          <label>Occupation</label>
                          <input type="text" value={editableLeadFields.occupation || ''} onChange={e => setEditableLeadFields({...editableLeadFields, occupation: e.target.value})}/>
                        </div>
                        <div className="form-group col">
                          <label>Annual Income (INR)</label>
                          <input type="number" value={editableLeadFields.annualIncome || 2000000} onChange={e => setEditableLeadFields({...editableLeadFields, annualIncome: Number(e.target.value)})}/>
                        </div>
                        <div className="form-group col">
                          <label>Family Details</label>
                          <input type="text" value={editableLeadFields.familyDetails || ''} onChange={e => setEditableLeadFields({...editableLeadFields, familyDetails: e.target.value})}/>
                        </div>
                        <div className="form-group col">
                          <label>Assigned Executive</label>
                          <select value={editableLeadFields.assignedExecutive || 'Sujal Talreja'} onChange={e => setEditableLeadFields({...editableLeadFields, assignedExecutive: e.target.value})}>
                            <option>Sujal Talreja</option>
                            <option>Aarti Amin</option>
                            <option>Rohan Vora</option>
                          </select>
                        </div>
                        <div className="form-group col-span-2">
                          <label>General Executive Consultation Notes</label>
                          <textarea rows="3" value={editableLeadFields.notes || ''} onChange={e => setEditableLeadFields({...editableLeadFields, notes: e.target.value})}></textarea>
                        </div>
                      </div>
                    )}

                    <div className="flex justify-between mt-4 border-top pt-3">
                      <div className="form-group w-50">
                        <label>Fast-Track Sales Stage</label>
                        <select 
                          value={selectedLead.status}
                          onChange={(e) => handleUpdateLeadStatus(selectedLead._id, e.target.value)}
                        >
                          {pipelineStages.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                      </div>
                      <div className="flex align-end">
                        <button className="btn btn-outline text-red flex align-center gap-2" onClick={() => handleDeleteLead(selectedLead._id)}>
                          <Trash2 size={16} /> Archive Customer
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* 2. SMART PROPERTY MATCH TAB */}
                {activeProfileTab === 'match' && (
                  <div className="crm-match-tab">
                    <h4 className="mb-2">AI Intelligent Property Matching</h4>
                    <p className="text-muted font-small mb-4">Compare client parameters against live vacant units.</p>
                    
                    {!showSmartMatchResults ? (
                      <button className="btn btn-gold w-100" onClick={() => setShowSmartMatchResults(true)}>
                        <Sparkles size={16}/> Calculate Fit Score Matching
                      </button>
                    ) : (
                      <div className="match-results flex flex-col gap-3">
                        <div className="flex justify-between align-center mb-1">
                          <h5 className="text-gold">AI Recommended Units</h5>
                          <button className="btn btn-outline btn-small flex align-center gap-2" onClick={handleGeneratePitchDeck}>
                            <Download size={14}/> Export Custom PDF Pitch
                          </button>
                        </div>
                        
                        {getSmartMatches().slice(0, 3).map((item, idx) => (
                          <div key={idx} className="glass-card p-3 border-accent flex justify-between align-center">
                            <div>
                              <div className="flex align-center gap-2">
                                <span className="badge badge-green font-bold">{item.matchScore}% AI Match</span>
                                <strong className="text-gold">{item.tower} - Unit {item.unit}</strong>
                              </div>
                              <p className="font-small text-muted mt-1">{item.type} • Floor {item.floor} • Facing {item.facing || 'East'} • {item.area} sq.ft.</p>
                              <p className="font-small text-gold mt-1">Asking price: ₹{item.price ? item.price.toLocaleString() : 'N/A'}</p>
                            </div>
                            <button className="btn btn-outline btn-small" onClick={() => handleAIDraftComms('whatsapp')}>
                              Send Pitch WhatsApp
                            </button>
                          </div>
                        ))}

                        {getSmartMatches().length === 0 && (
                          <div className="glass-card p-6 text-center text-muted">
                            No available units matches BHK preference of {selectedLead.bhkPreference || '3 BHK'} under budget limit.
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {/* 3. SITE VISITS & LOGISTICS TAB */}
                {activeProfileTab === 'visit' && (
                  <div className="flex flex-col gap-4">
                    <h4 className="text-gold">Site Visit Booking & Logistics</h4>
                    <p className="text-muted font-small">Schedule cab routes, designate pickup coordinates, and assign sales executives.</p>

                    <form onSubmit={handleScheduleSiteVisitSubmit} className="glass-card p-3 border-accent">
                      <div className="form-row">
                        <div className="form-group col">
                          <label>Visit Date</label>
                          <input type="date" value={newVisit.date} onChange={e => setNewVisit({...newVisit, date: e.target.value})} required/>
                        </div>
                        <div className="form-group col">
                          <label>Time Slot</label>
                          <input type="time" value={newVisit.time} onChange={e => setNewVisit({...newVisit, time: e.target.value})} required/>
                        </div>
                      </div>
                      <div className="form-row">
                        <div className="form-group col">
                          <label>Tour Mode</label>
                          <select value={newVisit.type} onChange={e => setNewVisit({...newVisit, type: e.target.value})}>
                            <option>Physical Site Tour</option>
                            <option>Virtual AR Walkthrough</option>
                          </select>
                        </div>
                        <div className="form-group col">
                          <label>Assigned Escort</label>
                          <select value={newVisit.executive} onChange={e => setNewVisit({...newVisit, executive: e.target.value})}>
                            <option>Sujal Talreja</option>
                            <option>Aarti Amin</option>
                            <option>Rohan Vora</option>
                          </select>
                        </div>
                      </div>

                      <div className="form-group mt-2">
                        <label className="flex align-center gap-2">
                          <input 
                            type="checkbox" 
                            checked={newVisit.cabRequired} 
                            onChange={e => setNewVisit({...newVisit, cabRequired: e.target.checked})} 
                          />
                          Require Complimentary Cab Pickup Service
                        </label>
                      </div>

                      {newVisit.cabRequired && (
                        <div className="form-group">
                          <label>Pickup Location Address Details</label>
                          <input 
                            type="text" 
                            value={newVisit.pickupLocation} 
                            onChange={e => setNewVisit({...newVisit, pickupLocation: e.target.value})} 
                            placeholder="e.g. 303, Saffron Complex, Vastrapur, Ahmedabad"
                            required
                          />
                        </div>
                      )}

                      <button type="submit" className="btn btn-gold w-100 mt-3">Confirm Schedule & Despatch Cab</button>
                    </form>

                    {/* Historical site visit logs */}
                    <div>
                      <h5 className="text-gold mb-2">Logged Site Visits History</h5>
                      <div className="flex flex-col gap-2">
                        {siteVisits.filter(v => v.leadId === selectedLead._id).map((visit, i) => (
                          <div key={i} className="glass-card p-3 font-small flex justify-between align-center">
                            <div>
                              <strong>{visit.date} at {visit.time} ({visit.type})</strong>
                              <p className="text-muted mt-1">Escort Executive: {visit.executive} | Cab Pickup: {visit.cabRequired ? visit.pickupLocation : "None"}</p>
                              {visit.feedback && <p className="text-gold mt-1">Feedback: {visit.feedback}</p>}
                            </div>
                            <span className="badge badge-hot">{visit.interestLevel || 'Warm'} Interest</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* 4. COMMUNICATIONS TAB (WITH AI TEMPLATING) */}
                {activeProfileTab === 'comms' && (
                  <div className="crm-comms-tab h-100 flex flex-col">
                    <div className="flex justify-between align-center mb-1">
                      <h4 className="text-gold">Client Interactions & Comms</h4>
                      <span className="ai-badge"><Sparkles size={12}/> AI Executive Copilot</span>
                    </div>
                    <p className="text-muted font-small mb-3">Draft templates or review text thread history.</p>

                    {/* AI Prompting panel */}
                    <div className="ai-actions-panel">
                      <button className="ai-action-btn" onClick={() => handleAIDraftComms('whatsapp')}>
                        Draft WhatsApp Follow-up
                      </button>
                      <button className="ai-action-btn" onClick={() => handleAIDraftComms('email')}>
                        Draft Follow-up Email
                      </button>
                      <button className="ai-action-btn" onClick={() => handleAIDraftComms('summary')}>
                        Summarize Interaction
                      </button>
                    </div>
                    
                    <div className="comms-chat-window flex-1 mb-3" style={{ maxHeight: '180px' }}>
                      <div className="chat-bubble chat-system text-muted">
                        <span className="block font-small mb-1 opacity-70">10:00 AM</span>
                        <p>Lead captured via Website chat portal</p>
                      </div>
                      <div className="chat-bubble chat-left">
                        <span className="block font-small mb-1 opacity-70">10:02 AM</span>
                        <p>Hi, I am interested in booking a site tour of Shivalik Skyview unit 1201.</p>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <textarea 
                        className="flex-1" 
                        placeholder="Type message text..." 
                        value={commsInput} 
                        onChange={e => setCommsInput(e.target.value)}
                        rows="3"
                      />
                      <button className="btn btn-gold flex justify-center align-center" style={{ width: '50px' }} onClick={() => {
                        if (commsInput) {
                          alert("Draft dispatched!");
                          setCommsInput("");
                        }
                      }}>
                        <Send size={16}/>
                      </button>
                    </div>
                  </div>
                )}

                {/* 5. DOCUMENT & KYC TAB */}
                {activeProfileTab === 'docs' && (
                  <div className="crm-docs-tab">
                    <h4 className="mb-2">KYC Document Locker</h4>
                    <p className="text-muted font-small mb-4">Validate identity proofs & transaction files.</p>
                    
                    <div className="docs-list mb-4">
                      {uploadedDocs.map((doc, i) => (
                        <div key={i} className="doc-item flex justify-between align-center p-3 mb-2 glass-card">
                          <span className="flex align-center gap-2">
                            <FileText size={16} className="text-gold"/> 
                            <div>
                              <div>{doc.name}</div>
                              <div className="text-muted font-small" style={{ fontSize: '10px' }}>Uploaded on {doc.date}</div>
                            </div>
                          </span>
                          <button 
                            className={`badge ${doc.status === 'Verified' ? 'badge-green' : 'badge-cold'}`}
                            onClick={() => {
                              const updated = [...uploadedDocs];
                              updated[i].status = updated[i].status === 'Verified' ? 'Pending' : 'Verified';
                              setUploadedDocs(updated);
                            }}
                          >
                            {doc.status}
                          </button>
                        </div>
                      ))}
                    </div>

                    <div className="upload-zone text-center p-4 border-accent" style={{ borderStyle: 'dashed', borderRadius: '8px' }}>
                      <UploadCloud size={32} className="text-gold mx-auto mb-2" />
                      <p className="font-small text-muted mb-2">Drag & drop customer KYC PDF files here</p>
                      <button className="btn btn-outline btn-small" onClick={() => {
                        const filename = prompt("Enter mock document filename:", "Agreement_Draft.pdf");
                        if (filename) {
                          setUploadedDocs([...uploadedDocs, {
                            name: filename,
                            date: new Date().toISOString().split('T')[0],
                            status: 'Pending'
                          }]);
                        }
                      }}>Select File</button>
                    </div>
                  </div>
                )}

              </div>
            </div>
          </div>
        </div>
      )}

      {/* ADD LEAD MODAL */}
      {isAddingLead && (
        <div className="modal-overlay">
          <div className="glass-card modal-content">
            <div className="modal-header">
              <h3>Create New Customer Lead</h3>
              <button className="btn-close" onClick={() => setIsAddingLead(false)}><X /></button>
            </div>
            <form onSubmit={handleAddLeadSubmit}>
              <div className="form-group mt-4">
                <label>Lead Full Name</label>
                <input required type="text" value={newLead.name} onChange={e => setNewLead({...newLead, name: e.target.value})} placeholder="e.g. Amit Desai" />
              </div>
              <div className="form-row">
                <div className="form-group col">
                  <label>Mobile Number</label>
                  <input required type="tel" value={newLead.phone} onChange={e => setNewLead({...newLead, phone: e.target.value})} placeholder="+91 99888 77665" />
                </div>
                <div className="form-group col">
                  <label>Email Address</label>
                  <input required type="email" value={newLead.email} onChange={e => setNewLead({...newLead, email: e.target.value})} placeholder="amit@example.com" />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group col">
                  <label>Interested Project</label>
                  <select value={newLead.project} onChange={e => setNewLead({...newLead, project: e.target.value})}>
                    <option value="Shivalik Skyview">Shivalik Skyview</option>
                    <option value="Shivalik Highlife">Shivalik Highlife</option>
                    <option value="Shivalik Edge">Shivalik Edge</option>
                  </select>
                </div>
                <div className="form-group col">
                  <label>Lead Score (Fit Rating)</label>
                  <input type="number" min="1" max="100" value={newLead.score} onChange={e => setNewLead({...newLead, score: Number(e.target.value)})} />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group col">
                  <label>Target Budget (INR)</label>
                  <input type="number" value={newLead.budget} onChange={e => setNewLead({...newLead, budget: Number(e.target.value)})} />
                </div>
                <div className="form-group col">
                  <label>BHK Preference</label>
                  <select value={newLead.bhkPreference} onChange={e => setNewLead({...newLead, bhkPreference: e.target.value})}>
                    <option>2 BHK</option>
                    <option>3 BHK</option>
                    <option>4 BHK</option>
                    <option>5 BHK</option>
                  </select>
                </div>
              </div>
              <div className="form-row">
                <div className="form-group col">
                  <label>Purchase Intent Purpose</label>
                  <select value={newLead.purpose} onChange={e => setNewLead({...newLead, purpose: e.target.value})}>
                    <option value="Buy">Buy</option>
                    <option value="Invest">Invest</option>
                    <option value="Rent">Rent</option>
                  </select>
                </div>
                <div className="form-group col">
                  <label>Executive Allocation</label>
                  <select value={newLead.assignedExecutive} onChange={e => setNewLead({...newLead, assignedExecutive: e.target.value})}>
                    <option>Sujal Talreja</option>
                    <option>Aarti Amin</option>
                    <option>Rohan Vora</option>
                  </select>
                </div>
              </div>
              <div className="form-group">
                <label>Lead Generation Source</label>
                <select value={newLead.source} onChange={e => setNewLead({...newLead, source: e.target.value})}>
                  <option value="Website Chat">Website Chat</option>
                  <option value="Facebook Ads">Facebook Ads</option>
                  <option value="Google Ads">Google Ads</option>
                  <option value="Instagram">Instagram</option>
                  <option value="Property Portal">Property Portal</option>
                  <option value="WhatsApp">WhatsApp</option>
                  <option value="Phone Call">Phone Call</option>
                  <option value="Referral">Referral</option>
                  <option value="Walk-in">Walk-in</option>
                </select>
              </div>
              <div className="form-group">
                <label>Recommended Call Action / Description Notes</label>
                <input type="text" value={newLead.action} onChange={e => setNewLead({...newLead, action: e.target.value})} placeholder="e.g. Schedule visit next Saturday morning..." />
              </div>
              <button type="submit" className="btn btn-gold w-100 mt-4">Confirm Lead Creation</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
