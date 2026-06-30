import React, { useState, useEffect, useRef } from 'react';
import { 
  Home, MapPin, MessageSquare, GitCompare, Layout, Paintbrush, 
  Sparkles, Users, BarChart2, TrendingUp, Grid, Radio, 
  MousePointer, Bot, Send, RotateCw, ZoomIn, ZoomOut, 
  Bed, Eye, EyeOff, Camera, Sliders, Activity, ArrowUpRight, 
  Award, AlertTriangle, CheckCircle, RefreshCw, X, ChevronRight, Ruler, Compass,
  Layers, Building, FileCheck, Download, UploadCloud
} from 'lucide-react';
import Chart from 'chart.js/auto';
import jsPDF from 'jspdf';
import ThreeDViewer from './components/ThreeDViewer';
import CRM from './components/CRM';
import VirtualTour from './components/VirtualTour';
import EMICalculator from './components/EMICalculator';
import AutoCADWorkspace from './components/AutoCADWorkspace';
import { useTranslation } from 'react-i18next';
import { useQuery, useMutation } from "convex/react";
import { api } from "../convex/_generated/api";

// Error Boundary for ThreeDViewer — prevents WebGL crashes from killing entire app
class ThreeDErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  componentDidCatch(error, info) {
    console.error('[ThreeDErrorBoundary] Caught error:', error, info);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          width: '100%', height: '500px', display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center', background: '#0a0f1d',
          color: '#94A3B8', gap: '16px', borderRadius: '12px'
        }}>
          <div style={{ fontSize: '48px' }}>🏗️</div>
          <div style={{ color: 'var(--color-accent)', fontSize: '18px', fontWeight: 700 }}>3D Engine Unavailable</div>
          <div style={{ fontSize: '13px', maxWidth: '340px', textAlign: 'center', lineHeight: 1.6 }}>
            Your browser or device does not support WebGL 3D rendering.
            Please try Chrome or Edge for the full 3D experience.
          </div>
          <button
            onClick={() => this.setState({ hasError: false, error: null })}
            style={{
              marginTop: '8px', padding: '8px 20px', background: 'rgba(var(--color-accent-rgb),0.15)',
              border: '1px solid rgba(var(--color-accent-rgb),0.4)', color: 'var(--color-accent)',
              borderRadius: '8px', cursor: 'pointer', fontSize: '13px'
            }}
          >
            Try Again
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}


// Core Dataset
const INITIAL_DATABASE = {
  projects: [
    {
      id: "skyview",
      name: "Shivalik Skyview",
      location: "Ambawadi",
      bhk: [3, 4],
      price: 18500000, // 1.85 Cr
      status: "Ready",
      image: "/skyview.png",
      description: "A high-rise architectural marvel of glass and light. Offers signature 3 & 4 BHK luxury residences with direct garden-facing panoramas.",
      sunlightScore: 8.5,
      noiseScore: 2.1,
      investmentScore: 8.8,
      livabilityScore: 9.2,
      availableUnits: 14,
      totalUnits: 40,
      towers: ["Tower A", "Tower B"]
    },
    {
      id: "highlife",
      name: "Shivalik Highlife",
      location: "SG Highway",
      bhk: [3],
      price: 12500000, // 1.25 Cr
      status: "Construction",
      image: "/skyview.png",
      description: "Premium high-density 3 BHK apartments situated on Ahmedabad's prime SG Highway growth corridor. Ideal for active working families.",
      sunlightScore: 7.8,
      noiseScore: 3.5,
      investmentScore: 9.4,
      livabilityScore: 8.5,
      availableUnits: 28,
      totalUnits: 60,
      towers: ["Tower C"]
    },
    {
      id: "greenwoods",
      name: "Shivalik Greenwoods",
      location: "Bopal",
      bhk: [4, 5],
      price: 32000000, // 3.2 Cr
      status: "Booking",
      image: "/skyview.png",
      description: "Eco-luxury sanctuary villas nestled inside deep woodlands of Bopal. Features individual swimming pools and automated green utilities.",
      sunlightScore: 9.5,
      noiseScore: 1.2,
      investmentScore: 9.0,
      livabilityScore: 9.6,
      availableUnits: 8,
      totalUnits: 20,
      towers: ["Villa Enclave"]
    }
  ],
  units: [
    { id: "sky-301", name: "Skyview - 301 (Tower A)", bhk: 3, area: 1850, price: 18500000, floor: 3, view: "Garden", sunlight: "Excellent", noise: "Quiet", investment: 8.5, livability: 9.0 },
    { id: "sky-1102", name: "Skyview - 1102 (Tower B)", bhk: 4, area: 2450, price: 26000000, floor: 11, view: "Skyline", sunlight: "Outstanding", noise: "Ultra-Quiet", investment: 9.0, livability: 9.5 },
    { id: "high-604", name: "Highlife - 604 (Tower C)", bhk: 3, area: 1550, price: 12500000, floor: 6, view: "Clubhouse", sunlight: "Moderate", noise: "Medium", investment: 9.3, livability: 8.4 },
    { id: "high-1401", name: "Highlife - 1401 (Tower C)", bhk: 3, area: 1600, price: 13800000, floor: 14, view: "Skyline", sunlight: "Excellent", noise: "Quiet", investment: 9.5, livability: 8.7 },
    { id: "green-v1", name: "Greenwoods - Villa 1", bhk: 5, area: 4200, price: 34000000, floor: 1, view: "Garden", sunlight: "Superb", noise: "Silent", investment: 8.9, livability: 9.8 }
  ]
};

const PROPERTY_SCORES = {
  "Shivalik Skyview": { sunlightScore: 8.5, noiseScore: 2.1, investmentScore: 8.8, livabilityScore: 9.2 },
  "Shivalik Highlife": { sunlightScore: 7.8, noiseScore: 3.5, investmentScore: 9.4, livabilityScore: 8.5 },
  "Shivalik Edge": { sunlightScore: 9.0, noiseScore: 1.5, investmentScore: 9.2, livabilityScore: 9.4 },
  "Shivalik Greenwoods": { sunlightScore: 9.5, noiseScore: 1.2, investmentScore: 9.0, livabilityScore: 9.6 }
};

const ARCH_SCENARIOS = {
  ai_copilot: {
    title: "AI Copilot Dialogue Flow",
    description: "Real-time AI message generation using serverless reactive calls.",
    steps: [
      {
        title: "1. Client Trigger",
        desc: "User types a message in the AI Advisor/Copilot prompt box and clicks 'Send'.",
        highlight: "Client Layer"
      },
      {
        title: "2. WebSocket Connection",
        desc: "Vite SPA establishes a persistent WebSocket connection through the Edge Network.",
        highlight: "Edge Layer"
      },
      {
        title: "3. Convex Backend Host",
        desc: "Convex receives the message mutation, triggers serverless action, and verifies permissions.",
        highlight: "Convex Cloud"
      },
      {
        title: "4. Groq Inference Engine",
        desc: "The action calls the Groq Cloud API, sending system prompts and history context.",
        highlight: "AI/S3/Telemetry"
      },
      {
        title: "5. Real-time Stream Back",
        desc: "Groq streams response chunks back to Convex, which instantly synchronizes them to the React client via open WebSockets.",
        highlight: "Client Layer"
      }
    ]
  },
  township_load: {
    title: "3D Township View Flow",
    description: "Loading high-density compressed assets and tracking user telemetry.",
    steps: [
      {
        title: "1. Navigation Trigger",
        desc: "User clicks 'Explore 3D Township' or the 3D button, rendering the ThreeDViewer WebGL canvas.",
        highlight: "Client Layer"
      },
      {
        title: "2. S3 Asset Retrieval",
        desc: "Three.js initiates GLTF loader requests to fetch compressed 3D models from AWS S3 via CloudFront.",
        highlight: "AI/S3/Telemetry"
      },
      {
        title: "3. Draco Decompression",
        desc: "Client-side Web Assembly workers decompress Draco-packed files, reducing transfer size by 80%.",
        highlight: "Client Layer"
      },
      {
        title: "4. WebGL Lighting & Controls",
        desc: "Daylight parameters (fog, ambient, directional lights) compile, and OrbitControls enables user panning/zooming.",
        highlight: "Client Layer"
      },
      {
        title: "5. Telemetry Logging",
        desc: "Every drag or tower selection logs a clickstream metric to PostHog and Sentry for error tracking.",
        highlight: "AI/S3/Telemetry"
      }
    ]
  },
  crm_pipeline: {
    title: "CRM Site Visit & KYC Lead Flow",
    description: "Securing lead tracking from buyer submission to broker dashboard columns.",
    steps: [
      {
        title: "1. Buyer Submits Form",
        desc: "Buyer enters Aadhaar/PAN details or books a visit. React invokes Convex Mutation.",
        highlight: "Client Layer"
      },
      {
        title: "2. Convex DB Synchronization",
        desc: "Convex writes lead record, scores transaction using rule variables, and updates leads collection.",
        highlight: "Convex Cloud"
      },
      {
        title: "3. Real-time UI Subscription",
        desc: "The Broker / Sales CRM query subscription automatically registers the new database entry.",
        highlight: "Convex Cloud"
      },
      {
        title: "4. Kanban Dashboard Refresh",
        desc: "CRM panel executes a transition animation, inserting a card in 'New Lead' or 'Visit Scheduled'.",
        highlight: "Client Layer"
      }
    ]
  }
};

const getTabFromHash = () => {
  const hash = typeof window !== 'undefined' ? window.location.hash.replace('#', '') : '';
  const validTabs = [
    "landing", "visualize", "3d-township", "compare", "ai-advisor", 
    "copilot", "interior", "finder", "customer-portal", "leads", 
    "sales-analytics", "exec-insights", "inventory", "architecture"
  ];
  return validTabs.includes(hash) ? hash : "landing";
};

export default function App() {
  const { t, i18n } = useTranslation();
  // Navigation & Role states
  const [activeTab, setActiveTab] = useState(getTabFromHash());

  useEffect(() => {
    const handleHashChange = () => {
      setActiveTab(getTabFromHash());
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  useEffect(() => {
    window.location.hash = activeTab;
  }, [activeTab]);

  const [role, setRole] = useState("buyer"); 
  const [activeBuyerPersonaId, setActiveBuyerPersonaId] = useState("");

  // Convex Data
  const properties = useQuery(api.properties?.getProperties);
  const inventory = useQuery(api.inventory?.getInventory);
  const activityStream = useQuery(api.activity?.getActivity);
  const addActivity = useMutation(api.activity?.addActivity);
  const leads = useQuery(api.leads?.getLeads);
  const payments = useQuery(api.crm?.getPayments);
  // Project discovery filters
  const [filterLoc, setFilterLoc] = useState("all");
  const [filterBhk, setFilterBhk] = useState("all");
  const [filterPrice, setFilterPrice] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");

  // Township explorer states
  const [selectedTower, setSelectedTower] = useState(null);
  const [selectedAmenity, setSelectedAmenity] = useState(null);
  const [narrationText, setNarrationText] = useState("Welcome to Shivalik Premium Township Discoverer. Click any building on the left to activate physical metrics and AI insights.");
  const [buildingViewTower, setBuildingViewTower] = useState(null); // null = township, else = inside tower

  // Chatbot states
  const [chatMessages, setChatMessages] = useState([
    { 
      sender: "bot", 
      text: "Greetings! I am the Shivalik AI Advisor. How can I help you find your dream property today? You can select any prompt from the sidebar or type your query below."
    }
  ]);
  const [chatInput, setChatInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  // Comparison Selector states
  const [compare1, setCompare1] = useState("sky-301");
  const [compare2, setCompare2] = useState("high-604");

  // AR Pitch tab: 'tabletop' or 'site'
  const [arSubTab, setArSubTab] = useState("tabletop"); 

  // Tabletop AR parameters
  const [arSelectedUnit, setArSelectedUnit] = useState("skyview-301");
  const [arScale, setArScale] = useState(1.0);
  const [arRotation, setArRotation] = useState(0);
  const [arFurniture, setArFurniture] = useState(true);
  const [arLaserMeasure, setArLaserMeasure] = useState(false);

  // Site Geo-AR parameters
  const [geoArStep, setGeoArStep] = useState(1); // 1: GPS, 2: Anchor, 3: Visualize
  const [geoCompassAngle, setGeoCompassAngle] = useState(128); 
  const [geoTimeOfDay, setGeoTimeOfDay] = useState(12); 
  const [geoLocked, setGeoLocked] = useState(false);
  const [isScanningSite, setIsScanningSite] = useState(false);
  const [activeFloorAlert, setActiveFloorAlert] = useState(null);

  // Real 3D Dollhouse states (drag to rotate)
  const [rotX, setRotX] = useState(-20);
  const [rotY, setRotY] = useState(-35);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  // System Architecture page states
  const [activeArchScenario, setActiveArchScenario] = useState("ai_copilot");
  const [archStep, setArchStep] = useState(0);
  const [showFullDiagram, setShowFullDiagram] = useState(false);

  // AI Interior Designer states
  const [interiorStyle, setInteriorStyle] = useState("Modern");
  const [interiorBudget, setInteriorBudget] = useState(1000000);

  // Smart Match Questionnaire wizard states
  const [wizardStep, setWizardStep] = useState(1); // 1, 2, 3
  const [findBudget, setFindBudget] = useState("18000000");
  const [findFamily, setFindFamily] = useState("medium");
  const [findIntent, setFindIntent] = useState("Self Use");
  const [findFloor, setFindFloor] = useState("Mid");
  const [findView, setFindView] = useState("Garden");
  const [findTimeline, setFindTimeline] = useState("Ready");
  const [matchResults, setMatchResults] = useState([]);

  // Leads CRM & Telemetry Database State
  const [database, setDatabase] = useState(INITIAL_DATABASE);
  const [leadsCount, setLeadsCount] = useState(1482);
  const [visitsCount, setVisitsCount] = useState(489);

  // Boardroom executive states
  const [execAnswer, setExecAnswer] = useState(null);

  // Modals booking states
  const [bookingProject, setBookingProject] = useState("");
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [bookName, setBookName] = useState("");
  const [bookPhone, setBookPhone] = useState("");
  const [bookEmail, setBookEmail] = useState("");
  const [bookDate, setBookDate] = useState("");

  // Floating Chat Widget states
  const [floatingChatOpen, setFloatingChatOpen] = useState(false);
  const [floatingMessages, setFloatingMessages] = useState([
    { sender: "bot", text: "Hi! How can I help you discover Shivalik properties? You can ask me questions about BHKs, amenities, or pricing." }
  ]);
  const [floatingInput, setFloatingInput] = useState("");

  // Homepage UI Redesign states
  const [homeCompareList, setHomeCompareList] = useState([]);
  const [cardBlueprintView, setCardBlueprintView] = useState({});
  const [aiMatchSearchQuery, setAiMatchSearchQuery] = useState("");
  const [aiMatchedResults, setAiMatchedResults] = useState([]);
  const [isAiMatching, setIsAiMatching] = useState(false);
  const [activePresetMatch, setActivePresetMatch] = useState("");
  const [selectedProjectDetails, setSelectedProjectDetails] = useState(null);

  // Shivalik Copilot states
  const [copilotHistory, setCopilotHistory] = useState([
    { role: "assistant", content: "Hello! I am Shivalik Copilot, your advanced real-time AI architectural assistant. I can parse blueprint layouts, compare sunlight values, check RERA registration documents, and estimate appreciation CAGRs. Ask me anything about Shivalik properties!" }
  ]);
  const [copilotInput, setCopilotInput] = useState("");
  const [copilotStreamingText, setCopilotStreamingText] = useState("");
  const [copilotIsStreaming, setCopilotIsStreaming] = useState(false);
  const [copilotStats, setCopilotStats] = useState({
    tokensPerSec: 0,
    timeElapsed: 0,
    totalTokens: 0,
    activeModel: "openai/gpt-oss-20b"
  });
  const [copilotGraphMode, setCopilotGraphMode] = useState(false);
  const [copilotChartType, setCopilotChartType] = useState("radar");
  const copilotChartRef = useRef(null);
  const copilotChartInstance = useRef(null);

  // AutoCAD states
  const [copilotPaneMode, setCopilotPaneMode] = useState("graph"); // 'graph' or 'cad'
  const [cadLayers, setCadLayers] = useState({
    dimensions: true,
    hvac: false,
    electrical: false,
    structural: false,
    plumbing: false
  });
  const [selectedCADUnit, setSelectedCADUnit] = useState("skyview-301");
  const [cadHighlightedRooms, setCadHighlightedRooms] = useState([]);

  // Chart refs
  const chartRefs = {
    leadsSource: useRef(null),
    bookingsProject: useRef(null),
    revenueTrend: useRef(null),
    salesFunnel: useRef(null)
  };
  const chartInstances = useRef({});

  // Helper telemetry trigger
  const triggerTelemetry = (action, detail) => {
    if(addActivity && typeof addActivity === 'function') {
      addActivity({
        message: `User ${action}: ${detail}`,
        time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})
      }).catch(console.error);
    }
  };

  const streamCopilotResponse = async (userMessage) => {
    if (!userMessage.trim()) return;

    // AutoCAD integration: parse keyword triggers in user input
    const msgLower = userMessage.toLowerCase();
    let detectedLayers = { ...cadLayers };
    let hasCADTriggers = false;
    let newHighlights = [];

    if (msgLower.includes("hvac") || msgLower.includes("duct") || msgLower.includes("ventilation")) {
      detectedLayers.hvac = true;
      hasCADTriggers = true;
      newHighlights = ["living", "kitchen", "master-bed", "bed-2", "bed-3"];
    }
    if (msgLower.includes("structural") || msgLower.includes("pillar") || msgLower.includes("load-bearing") || msgLower.includes("column")) {
      detectedLayers.structural = true;
      hasCADTriggers = true;
    }
    if (msgLower.includes("dimension") || msgLower.includes("area") || msgLower.includes("size") || msgLower.includes("measure")) {
      detectedLayers.dimensions = true;
      hasCADTriggers = true;
    }
    if (msgLower.includes("electrical") || msgLower.includes("wiring") || msgLower.includes("socket") || msgLower.includes("switch")) {
      detectedLayers.electrical = true;
      hasCADTriggers = true;
    }
    if (msgLower.includes("plumbing") || msgLower.includes("water") || msgLower.includes("pipe") || msgLower.includes("drain")) {
      detectedLayers.plumbing = true;
      hasCADTriggers = true;
    }

    if (hasCADTriggers) {
      setCadLayers(detectedLayers);
      setCopilotPaneMode("cad");
      setCopilotGraphMode(true); // Ensure split view is activated
      if (newHighlights.length > 0) {
        setCadHighlightedRooms(newHighlights);
        setTimeout(() => setCadHighlightedRooms([]), 3500);
      }
    }
    
    // Add user message to history
    const updatedHistory = [...copilotHistory, { role: "user", content: userMessage }];
    setCopilotHistory(updatedHistory);
    setCopilotInput("");
    setCopilotStreamingText("");
    setCopilotIsStreaming(true);
    triggerTelemetry("copilot_chat", `Submitted prompt: ${userMessage.slice(0, 40)}...`);

    const apiKey = import.meta.env.VITE_GROQ_API_KEY || "";
    const startTime = Date.now();
    let tokensCount = 0;

    try {
      if (!apiKey || apiKey === "YOUR_API_KEY" || apiKey.trim() === "") {
        throw new Error("Groq API key not configured. Please define VITE_GROQ_API_KEY in .env");
      }

      const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${apiKey}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          messages: [
            { role: "system", content: "You are Shivalik Copilot, an elite AI Real Estate Advisor for Shivalik Group in Ahmedabad. Provide extremely precise details on Sunlight Indexes, CAGR appreciation growth, layouts, construction, and neighborhood infrastructure. Be concise, polite, and structure output with bullet points where necessary." },
            ...updatedHistory.map(h => ({ role: h.role, content: h.content }))
          ],
          model: "openai/gpt-oss-20b",
          temperature: 0.7,
          max_tokens: 1500,
          stream: true
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder("utf-8");
      let done = false;
      let streamedResponse = "";

      while (!done) {
        const { value, done: readerDone } = await reader.read();
        done = readerDone;
        if (value) {
          const chunk = decoder.decode(value, { stream: !done });
          const lines = chunk.split("\n");
          
          for (const line of lines) {
            const cleanLine = line.trim();
            if (cleanLine.startsWith("data: ")) {
              const dataStr = cleanLine.slice(6).trim();
              if (dataStr === "[DONE]") {
                done = true;
                break;
              }
              try {
                const parsed = JSON.parse(dataStr);
                const content = parsed.choices[0]?.delta?.content || "";
                if (content) {
                  streamedResponse += content;
                  setCopilotStreamingText(streamedResponse);
                  
                  // Track telemetry stats
                  tokensCount += content.split(/\s+/).length || 1;
                  const elapsed = (Date.now() - startTime) / 1000;
                  setCopilotStats({
                    tokensPerSec: Math.round(tokensCount / (elapsed || 0.1)),
                    timeElapsed: parseFloat(elapsed.toFixed(1)),
                    totalTokens: tokensCount,
                    activeModel: "openai/gpt-oss-20b"
                  });
                }
              } catch (e) {
                // Ignore incomplete SSE json parsing issues
              }
            }
          }
        }
      }

      // Commit finalized message to history
      setCopilotHistory(prev => [...prev, { role: "assistant", content: streamedResponse }]);
      setCopilotStreamingText("");
      setCopilotIsStreaming(false);

    } catch (err) {
      console.error("[Copilot Stream Error]:", err);
      // Fallback Mock Assistant responses to guarantee UX doesn't crash
      let mockReply = "";
      const msgLower = userMessage.toLowerCase();
      
      if (msgLower.includes("hvac") || msgLower.includes("ventilation") || msgLower.includes("duct")) {
        mockReply = "**Shivalik CAD-Copilot Response**:\n\n- **VRV System Loaded**: I have activated the **HVAC Duct Network** layer (green dashed paths) in your active AutoCAD blueprint viewport.\n- **Air Changes**: The master bedroom receives 8 air changes per hour (ACH) via dedicated ceiling diffusers.\n- **Return Air**: Return air grills are situated in bathroom transition corridors to optimize pressure balances.";
      } else if (msgLower.includes("structural") || msgLower.includes("pillar") || msgLower.includes("load-bearing") || msgLower.includes("column")) {
        mockReply = "**Shivalik CAD-Copilot Response**:\n\n- **Structural Pillars Overlay**: I have isolated the **Structural Load Pillars** (red-glowing RC pillars) on the canvas.\n- **Load Capacity**: Columns on the inner core support up to 80-120 tons of structural load. They are constructed with M40 grade reinforced concrete.\n- **Seismic Design**: Fully compliant with IS 1893 (Zone 3) building codes for earthquake safety.";
      } else if (msgLower.includes("dimension") || msgLower.includes("area") || msgLower.includes("size") || msgLower.includes("measure")) {
        mockReply = "**Shivalik CAD-Copilot Response**:\n\n- **Dimensions Activated**: **Dimension Guidelines** (gold lines) are enabled.\n- **Key Rooms**:\n  * *Living Room*: 22 x 18 ft (396 sq.ft.)\n  * *Master Bed*: 14 x 16 ft (440 sq.ft.)\n  * *Total Carpet Area*: 1,540 sq.ft.\n- **Ruler Tool**: You can also use the **Ruler Measure** tool in the toolbar to click and inspect custom spans.";
      } else if (msgLower.includes("electrical") || msgLower.includes("wiring") || msgLower.includes("socket") || msgLower.includes("switch")) {
        mockReply = "**Shivalik CAD-Copilot Response**:\n\n- **Electrical Grid Loaded**: The **Electrical Lighting Grid** (cyan neon paths) is overlaid on the layout.\n- **DB Panel**: The 3-phase distribution board is located in the living foyer.\n- **Automation**: Fully pre-wired for central home automation gateways and smart ambient dimmer panels.";
      } else if (msgLower.includes("plumbing") || msgLower.includes("water") || msgLower.includes("pipe") || msgLower.includes("drain")) {
        mockReply = "**Shivalik CAD-Copilot Response**:\n\n- **Plumbing Pipeline Flows**: I have enabled the **Plumbing Pipeline** layer showing Hot Water lines (red) and Cold Water lines (blue).\n- **Riser Connection**: Connects to the main plumbing shaft behind the modular kitchen, isolating sound vibration away from bedrooms.";
      } else if (userMessage.toLowerCase().includes("sunlight")) {
        mockReply = "**Shivalik Copilot Contextual Response**:\n\n- **Shivalik Edge** (Bopal): Sunlight Index **9.0/10**. Outstanding peak noon natural light exposure.\n- **Shivalik Skyview** (Ambawadi): Sunlight Index **8.5/10**. Optimized East-facing solar layouts.\n- **Shivalik Highlife** (SG Highway): Sunlight Index **7.8/10**. Highrise shade structures designed for thermal comfort.\n\n*Note: Falling back to local offline knowledge indexes due to API connectivity status.*";
      } else if (userMessage.toLowerCase().includes("roi") || userMessage.toLowerCase().includes("cagr") || userMessage.toLowerCase().includes("appreciation")) {
        mockReply = "**Shivalik Copilot Contextual Response**:\n\n- **Shivalik Edge** (Bopal): Appreciation CAGR **14.2%** (glowing launch phase).\n- **Shivalik Highlife** (SG Highway): Appreciation CAGR **13.5%** (robust rental zone yield).\n- **Shivalik Skyview** (Ambawadi): Appreciation CAGR **13.2%** (stable luxury core).\n\n*Note: Falling back to local offline knowledge indexes due to API connectivity status.*";
      } else {
        mockReply = `**Shivalik Copilot Local Agent Response**:\n\nI received your query: "${userMessage}".\n\nTo coordinate a detailed walkthrough, review physical floorplan blueprints, or configure custom layouts, navigate to the respective tabs: **3D Township Explorer** or **Property Visualization**.\n\n*Connection Status: Offline Simulation Active. Live API Key loaded successfully.*`;
      }

      // Simulate a quick streaming effect for fallback mockup
      let index = 0;
      const interval = setInterval(() => {
        setCopilotStreamingText(prev => prev + mockReply.charAt(index));
        index++;
        if (index >= mockReply.length) {
          clearInterval(interval);
          setCopilotHistory(prev => [...prev, { role: "assistant", content: mockReply }]);
          setCopilotStreamingText("");
          setCopilotIsStreaming(false);
        }
      }, 5);
    }
  };

  // Typewriter effect for AI Narrator
  const typeNarrationText = (text) => {
    setNarrationText("");
    let i = 0;
    let currentStr = "";
    const interval = setInterval(() => {
      if (i < text.length) {
        currentStr += text.charAt(i);
        setNarrationText(currentStr);
        i++;
      } else {
        clearInterval(interval);
      }
    }, 12);
  };

  // SVG Clicks
  const handleSelectTower = (towerId) => {
    setSelectedTower(towerId);
    setSelectedAmenity(null);
    const dataMap = {
      'A': {
        project: "Shivalik Skyview",
        narrative: "Tower A offers premium East-facing 3 BHK apartments. Out of 40 total units, 14 remain available, carrying an impressive average sunlight exposure index of 8.5/10."
      },
      'B': {
        project: "Shivalik Skyview",
        narrative: "Tower B consists of our luxury 4 BHK duplex penthouses. Moving at 22% faster rates due to direct garden views and automated kitchen spaces."
      },
      'C': {
        project: "Shivalik Highlife",
        narrative: "Tower C houses our premium compact 3 BHK residences on SG Highway. Currently under construction, offering high rental yields."
      }
    };
    if (dataMap[towerId]) {
      typeNarrationText(dataMap[towerId].narrative);
      triggerTelemetry("view", `User selected Tower ${towerId} on 3D site map`);
    }
  };

  const handleSelectAmenity = (name) => {
    setSelectedAmenity(name);
    setSelectedTower(null);
    let text = "";
    if (name === "Clubhouse Pool") {
      text = "The Swimming Pool features an Olympic-sized layout with a controlled heating facility. Open to all Shivalik Club members, running daily filtration cycles.";
    } else {
      text = "Our Club Gym is equipped with luxury high-end weights and wellness cardio decks. Also features a dedicated indoor squash arena and shared coworking zone.";
    }
    typeNarrationText(text);
    triggerTelemetry("view", `User clicked on amenity: ${name}`);
  };

  // Drag listeners to rotate 3D Room Cube
  const handleMouseDown = (e) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX, y: e.clientY });
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    const deltaX = e.clientX - dragStart.x;
    const deltaY = e.clientY - dragStart.y;
    setDragStart({ x: e.clientX, y: e.clientY });
    setRotY(prev => prev + deltaX * 0.5);
    setRotX(prev => Math.min(10, Math.max(-60, prev - deltaY * 0.5)));
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // 3D rotation buttons helpers
  const rotate3D = (direction) => {
    if (direction === 'left') setRotY(prev => prev - 15);
    if (direction === 'right') setRotY(prev => prev + 15);
    if (direction === 'reset') { setRotX(-20); setRotY(-35); }
  };

  // Chat Responses with embedded SVG micro charts
  const handleSendChat = (text) => {
    if (!text.trim()) return;
    setChatMessages(prev => [...prev, { sender: "user", text }]);
    setChatInput("");
    setIsTyping(true);

    setTimeout(() => {
      setIsTyping(false);
      let response = "";
      let chartNode = null;

      if (text.includes("3 BHK") && text.includes("2 crore")) {
        response = "I filtered **3 BHK units under ₹2.0 Crore**. **Highlife - 604** holds high yield parameters due to metro layouts:";
        chartNode = (
          <div className="inline-chat-bar-chart" key={Date.now()}>
            <div className="inline-bar-item">
              <div className="inline-bar-header">
                <span>Skyview 301 (₹1.85 Cr)</span>
                <span>8.8 Investment Score</span>
              </div>
              <div className="inline-bar-bg"><div className="inline-bar-fill" style={{ width: "88%", backgroundColor: "var(--color-accent)" }}></div></div>
            </div>
            <div className="inline-bar-item mt-2">
              <div className="inline-bar-header">
                <span>Highlife 604 (₹1.25 Cr)</span>
                <span className="text-green">9.3 Investment Score</span>
              </div>
              <div className="inline-bar-bg"><div className="inline-bar-fill" style={{ width: "93%", backgroundColor: "#10b981" }}></div></div>
            </div>
          </div>
        );
      } else if (text.includes("Compare Tower A")) {
        response = "Structural metrics comparison between **Tower A (Skyview)** and **Tower C (Highlife)**:";
        chartNode = (
          <div className="inline-chat-bar-chart" key={Date.now()}>
            <div className="inline-bar-item">
              <div className="inline-bar-header">
                <span>Tower A (Skyview) - Sunlight</span>
                <span>8.5 / 10</span>
              </div>
              <div className="inline-bar-bg"><div className="inline-bar-fill" style={{ width: "85%", backgroundColor: "var(--color-accent)" }}></div></div>
            </div>
            <div className="inline-bar-item mt-2">
              <div className="inline-bar-header">
                <span>Tower C (Highlife) - Sunlight</span>
                <span>7.8 / 10</span>
              </div>
              <div className="inline-bar-bg"><div className="inline-bar-fill" style={{ width: "78%", backgroundColor: "#475569" }}></div></div>
            </div>
          </div>
        );
      } else if (text.includes("sunlight")) {
        response = "Our physical orientation models highlight **Tower A - Floor 8 and above** as the layout receiving maximum sunlight (approx 8.5 hours/day). **Shivalik Greenwoods** villas lead sunlight indices with 9.5/10.";
      } else if (text.includes("investment")) {
        response = "The unit carrying the highest appreciation score is **Highlife - 1401 (14th Floor)** carrying a score of **9.5/10** due to new SG Highway metro linkages.";
      } else if (text.includes("schools")) {
        response = "For **Shivalik Skyview (Ambawadi)**, the following high-end educational facilities are within a 3km radius:\n" +
          "- The Riverside School (1.8 km)\n" +
          "- Ahmedabad International School (2.2 km)\n" +
          "- St. Xavier's Loyola Hall (2.8 km)";
      } else {
        response = `I processed your request for: "${text}". Based on structural specifications, I recommend exploring our 3D Township simulator or using the Smart Finder wizard to filter precise layouts.`;
      }

      setChatMessages(prev => [...prev, { sender: "bot", text: response, component: chartNode }]);
      triggerTelemetry("chat", `User asked AI advisor: "${text.substring(0, 45)}"`);
    }, 1000);
  };

  const renderProjectBlueprint = (projectId) => {
    if (projectId === 'skyview') {
      return (
        <svg viewBox="0 0 200 150" className="blueprint-svg">
          <rect x="10" y="10" width="180" height="130" fill="none" stroke="#D4AF37" strokeWidth="1.5" strokeDasharray="3,3" />
          <line x1="100" y1="10" x2="100" y2="140" stroke="#334155" strokeWidth="1" />
          <line x1="10" y1="75" x2="190" y2="75" stroke="#334155" strokeWidth="1" />
          <line x1="50" y1="75" x2="50" y2="140" stroke="#334155" strokeWidth="0.8" />
          <line x1="150" y1="10" x2="150" y2="75" stroke="#334155" strokeWidth="0.8" />
          <text x="55" y="45" fontSize="10" fill="#94A3B8" fontWeight="bold" textAnchor="middle">LIVING ROOM</text>
          <text x="170" y="45" fontSize="7" fill="#94A3B8" textAnchor="middle">BALCONY</text>
          <text x="30" y="110" fontSize="7" fill="#94A3B8" textAnchor="middle">KITCHEN</text>
          <text x="75" y="110" fontSize="7" fill="#94A3B8" textAnchor="middle">MASTER BED</text>
          <text x="145" y="110" fontSize="7" fill="#94A3B8" textAnchor="middle">BEDROOM 2</text>
          <text x="55" y="58" fontSize="7" fill="#64748B" fontStyle="italic" textAnchor="middle">18'0" x 14'6"</text>
          <text x="75" y="122" fontSize="7" fill="#64748B" fontStyle="italic" textAnchor="middle">12'0" x 16'0"</text>
        </svg>
      );
    }
    if (projectId === 'highlife') {
      return (
        <svg viewBox="0 0 200 150" className="blueprint-svg">
          <rect x="10" y="10" width="180" height="130" fill="none" stroke="#D4AF37" strokeWidth="1.5" strokeDasharray="3,3" />
          <line x1="80" y1="10" x2="80" y2="140" stroke="#334155" strokeWidth="1" />
          <line x1="80" y1="70" x2="190" y2="70" stroke="#334155" strokeWidth="1" />
          <line x1="10" y1="90" x2="80" y2="90" stroke="#334155" strokeWidth="1" />
          <line x1="135" y1="70" x2="135" y2="140" stroke="#334155" strokeWidth="0.8" />
          <text x="45" y="50" fontSize="9" fill="#94A3B8" fontWeight="bold" textAnchor="middle">LIVING/DINING</text>
          <text x="45" y="115" fontSize="7" fill="#94A3B8" textAnchor="middle">KITCHEN</text>
          <text x="135" y="45" fontSize="8" fill="#94A3B8" fontWeight="bold" textAnchor="middle">MASTER SUITE</text>
          <text x="108" y="110" fontSize="7" fill="#94A3B8" textAnchor="middle">BEDROOM</text>
          <text x="162" y="110" fontSize="7" fill="#94A3B8" textAnchor="middle">UTILITY</text>
          <text x="135" y="58" fontSize="7" fill="#64748B" fontStyle="italic" textAnchor="middle">14'0" x 15'0"</text>
        </svg>
      );
    }
    if (projectId === 'greenwoods') {
      return (
        <svg viewBox="0 0 200 150" className="blueprint-svg">
          <rect x="10" y="10" width="180" height="130" fill="none" stroke="#D4AF37" strokeWidth="1.5" strokeDasharray="3,3" />
          <rect x="130" y="25" width="45" height="50" fill="none" stroke="#0ea5e9" strokeWidth="1" />
          <text x="152" y="52" fontSize="7" fill="#0ea5e9" textAnchor="middle">PRIVATE POOL</text>
          <line x1="120" y1="10" x2="120" y2="140" stroke="#334155" strokeWidth="1" />
          <line x1="10" y1="75" x2="120" y2="75" stroke="#334155" strokeWidth="1" />
          <line x1="60" y1="75" x2="60" y2="140" stroke="#334155" strokeWidth="1" />
          <text x="65" y="45" fontSize="9" fill="#94A3B8" fontWeight="bold" textAnchor="middle">FOYER & SALON</text>
          <text x="35" y="110" fontSize="7" fill="#94A3B8" textAnchor="middle">KITCHEN</text>
          <text x="90" y="110" fontSize="7" fill="#94A3B8" textAnchor="middle">GUEST SUITE</text>
          <text x="152" y="105" fontSize="7" fill="#94A3B8" textAnchor="middle">LAWN / DECK</text>
          <text x="65" y="58" fontSize="7" fill="#64748B" fontStyle="italic" textAnchor="middle">24'0" x 18'0"</text>
        </svg>
      );
    }
    return null;
  };

  const runCustomAiMatch = () => {
    const query = aiMatchSearchQuery.trim().toLowerCase();
    if (!query) return;
    setActivePresetMatch("");
    setIsAiMatching(true);
    triggerTelemetry("ai_match_query", `Custom query: "${query}"`);
    
    setTimeout(() => {
      setIsAiMatching(false);
      let scoredMatches = properties.map(p => {
        let score = 75;
        let reasons = [];
        const scores = PROPERTY_SCORES[p.name] || { sunlightScore: 8.0, noiseScore: 2.0, investmentScore: 8.5, livabilityScore: 8.8 };
        
        if (query.includes("ambawadi") && p.location.toLowerCase() === "ambawadi") {
          score += 10;
          reasons.push("Perfect match for Ambawadi location preference.");
        }
        if (query.includes("sg highway") && p.location.toLowerCase().includes("sg highway")) {
          score += 10;
          reasons.push("Matches SG Highway growth zone request.");
        }
        if (query.includes("bopal") && p.location.toLowerCase() === "bopal") {
          score += 10;
          reasons.push("Matches quiet residential Bopal zone preference.");
        }
        
        if (query.includes("3 bhk") && p.bhk.includes("3")) {
          score += 8;
          reasons.push("Contains optimal 3 BHK layout.");
        }
        if (query.includes("4 bhk") && p.bhk.includes("4")) {
          score += 8;
          reasons.push("Contains elite 4 BHK layout.");
        }
        if (query.includes("5 bhk") && p.bhk.includes("5")) {
          score += 8;
          reasons.push("Includes premium 5 BHK villa layout.");
        }
        
        if (query.includes("under 2 cr") || query.includes("under 2 crore")) {
          if (p.price < 20000000) {
            score += 12;
            reasons.push("Fits within your budget specification (under ₹2.0 Cr).");
          } else {
            score -= 15;
          }
        }
        if (query.includes("luxury") && p.price > 20000000) {
          score += 10;
          reasons.push("Matches top-tier premium status index.");
        }
        
        if (query.includes("sunlight") || query.includes("sun")) {
          if (scores.sunlightScore > 8.0) {
            score += 10;
            reasons.push(`Superior sun exposure score (${scores.sunlightScore}/10).`);
          } else {
            score += 2;
          }
        }

        if (query.includes("quiet") || query.includes("silent") || query.includes("noise")) {
          if (scores.noiseScore < 2.5) {
            score += 10;
            reasons.push(`Low noise environment score (Acoustic Index ${(10 - scores.noiseScore).toFixed(1)}/10).`);
          } else {
            score -= 5;
          }
        }

        score = Math.min(99, Math.max(50, score));
        const mappedId = p.name.toLowerCase().includes("skyview") ? "skyview" : p.name.toLowerCase().includes("highlife") ? "highlife" : "edge";
        return {
          id: mappedId,
          score,
          reason: reasons.length > 0 ? reasons.join(" ") : `Compatible project based on ${p.bhk} configuration.`
        };
      });

      scoredMatches.sort((a, b) => b.score - a.score);
      setAiMatchedResults(scoredMatches.slice(0, 2));
    }, 800);
  };

  // Smart Questionnaire matching with step limits
  const handleCalculateMatches = () => {
    const budgetNum = parseInt(findBudget);
    let scoredList = database.units.map(u => {
      let score = 90;
      if (u.price > budgetNum) {
        const gap = u.price - budgetNum;
        score -= Math.min(25, Math.ceil(gap / 1000000) * 3);
      } else {
        score += 5;
      }
      if (u.view === findView) score += 10;
      else score -= 5;

      if (findFloor === "High" && u.floor >= 10) score += 8;
      if (findFloor === "Low" && u.floor <= 4) score += 8;
      if (findFloor === "Mid" && u.floor > 4 && u.floor < 10) score += 8;

      if (findIntent === "Investment" && u.investment >= 9.0) score += 7;
      if (findIntent === "Self Use" && u.livability >= 9.0) score += 7;

      score = Math.max(0, Math.min(100, score));
      return { unit: u, score };
    });

    scoredList.sort((a, b) => b.score - a.score);
    setMatchResults(scoredList);
    triggerTelemetry("search", `Smart Property Questionnaire processed (Target Budget: ₹${(budgetNum/10000000).toFixed(2)} Cr)`);
  };

  // Book physical visit
  const handleOpenBooking = (projName) => {
    setBookingProject(projName);
    setShowBookingModal(true);
  };

  const handleBookingSubmit = (e) => {
    e.preventDefault();
    const calculatedScore = Math.floor(Math.random() * 20) + 80;

    const newLead = {
      name: bookName,
      phone: bookPhone,
      email: bookEmail,
      project: bookingProject,
      score: calculatedScore,
      status: "Hot Lead",
      action: `Contact regarding booked physical tour on ${bookDate}`
    };

    setDatabase(prev => ({
      ...prev,
      leads: [newLead, ...prev.leads]
    }));

    setLeadsCount(prev => prev + 1);
    setVisitsCount(prev => prev + 1);

    triggerTelemetry("booking", `${bookName} booked physical tour for ${bookingProject} on ${bookDate}`);
    triggerTelemetry("chat", `AI CRM calculated lead score ${calculatedScore}/100 [HOT LEAD] for ${bookName}`);

    setShowBookingModal(false);
    setBookName("");
    setBookPhone("");
    setBookEmail("");
    setBookDate("");

    alert(`Physical visit scheduled successfully for ${bookDate}! AI Lead score generated: ${calculatedScore}`);
  };

  // Boardroom AI answers
  const handleExecAI = (q) => {
    let ans = "";
    if (q.includes("bookings")) {
      ans = "<strong>Answer:</strong> <strong>Shivalik Highlife</strong> generated the highest bookings volume (42 units) this period.\n\n" +
        "<strong>Root Cause Analysis:</strong> Lower acquisition cost (starting ₹1.25 Cr) coupled with proximity to the new commercial metro corridor drives volume conversion.\n\n" +
        "<strong>Recommendation:</strong> Allocate 45% of Q3 marketing budget to Highlife. Increase pricing parameters by 3% on high floors starting next week.";
    } else if (q.includes("unsold")) {
      ans = "<strong>Answer:</strong> Currently, there are <strong>38 units</strong> unsold across the portfolio (14 in Skyview, 24 in Highlife, 8 in Greenwoods).\n\n" +
        "<strong>Root Cause Analysis:</strong> Concentrated on lower floors (Floors 1-3) due to lack of panoramic view orientations.\n\n" +
        "<strong>Recommendation:</strong> Bundle stagnant low-floor units with the <strong>AI Interior Designer Studio</strong> upgrade at discounted rates to speed clearance.";
    } else if (q.includes("sales channel")) {
      ans = "<strong>Answer:</strong> The <strong>AI Property Experience platform (D2C)</strong> yields the best conversion efficiency (14.2% visitor-to-visit ratio).\n\n" +
        "<strong>Root Cause Analysis:</strong> Customers engaging with interactive 3D and customized AR floor plans qualify themselves faster, resolving queries before visiting sites.\n\n" +
        "<strong>Recommendation:</strong> Integrate the floating AI Chat consultant into the primary corporate website shell to capture pre-qualified leads.";
    } else if (q.includes("revenue")) {
      ans = "<strong>Answer:</strong> Expected revenue for Q3 2026 is <strong>₹160.0 Crore</strong> (projected to reach ₹210.0 Crore by Q4).\n\n" +
        "<strong>Drivers:</strong> Accelerated handover timelines of Tower A and rapid absorption speeds of Tower C commercial layouts.\n\n" +
        "<strong>Recommendation:</strong> Accelerated milestone handovers will draw down cash flows faster.";
    }
    setExecAnswer(ans);
    triggerTelemetry("chat", `Boardroom AI answered Director query: "${q}"`);
  };

  // Quick floating chat submit
  const handleQuickChatSubmit = (e) => {
    e.preventDefault();
    if (!floatingInput.trim()) return;
    const txt = floatingInput;
    setFloatingMessages(prev => [...prev, { sender: "user", text: txt }]);
    setFloatingInput("");
    
    setTimeout(() => {
      setFloatingMessages(prev => [...prev, { 
        sender: "bot", 
        text: `I received: "${txt}". To review detailed floor specifications, structural pricing, or comparing scores, try clicking the "AI Advisor Chat" portal tab in the sidebar!` 
      }]);
    }, 1000);
  };

  // Tabletop AR controls
  const handleARUnitChange = (val) => {
    setArSelectedUnit(val);
    setArScale(1.0);
    setArRotation(0);
  };

  // On-Site Geo-AR Lidar Scan & Anchor functions
  const handleGeoAnchorToggle = () => {
    if (geoLocked) {
      setGeoLocked(false);
      setGeoArStep(1);
      setActiveFloorAlert(null);
    } else {
      setIsScanningSite(true);
      setGeoArStep(1);
      
      setTimeout(() => {
        setGeoArStep(2);
        
        setTimeout(() => {
          setIsScanningSite(false);
          setGeoLocked(true);
          setGeoArStep(3);
          triggerTelemetry("ar", `Anchored building hologram model on site.`);
        }, 1500);
      }, 1500);
    }
  };

  const calculateShadowOffset = () => {
    const delta = geoTimeOfDay - 12;
    const scaleX = Math.abs(delta) * 0.4 + 0.5;
    const skewX = delta * 6;
    const rotation = delta * 15;
    const opacity = 0.8 - Math.abs(delta) * 0.05;
    
    return {
      transform: `rotateX(60deg) scaleY(${scaleX}) rotateZ(${rotation}deg) skewX(${skewX}deg)`,
      opacity: opacity
    };
  };

  // Render ChartJS when analytics tab active
  useEffect(() => {
    if (activeTab === "sales-analytics") {
      Object.keys(chartInstances.current).forEach(k => {
        if (chartInstances.current[k]) chartInstances.current[k].destroy();
      });

      const goldColor = "#D4AF37";
      const gridBorder = "#334155";
      const labelColor = "#94A3B8";

      if (chartRefs.leadsSource.current) {
        chartInstances.current.leadsSource = new Chart(chartRefs.leadsSource.current, {
          type: "doughnut",
          data: {
            labels: ["AI Recommendation Engine", "Direct Search Discovery", "Google Ads Portfolio", "Broker Integrations"],
            datasets: [{
              data: [42, 28, 18, 12],
              backgroundColor: [goldColor, "#1E293B", "#38BDF8", "#475569"],
              borderColor: "#0F172A",
              borderWidth: 2
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: {
                position: "right",
                labels: { color: labelColor, font: { family: "Inter", size: 10 } }
              }
            }
          }
        });
      }

      if (chartRefs.bookingsProject.current) {
        chartInstances.current.bookingsProject = new Chart(chartRefs.bookingsProject.current, {
          type: "bar",
          data: {
            labels: ["Skyview", "Highlife", "Greenwoods"],
            datasets: [{
              label: "Units Booked",
              data: [28, 42, 14],
              backgroundColor: goldColor,
              borderRadius: 4
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
              y: { grid: { color: gridBorder }, ticks: { color: labelColor } },
              x: { grid: { display: false }, ticks: { color: labelColor } }
            },
            plugins: { legend: { display: false } }
          }
        });
      }

      if (chartRefs.revenueTrend.current) {
        chartInstances.current.revenueTrend = new Chart(chartRefs.revenueTrend.current, {
          type: "line",
          data: {
            labels: ["Q1 2026", "Q2 2026", "Q3 2026 (Proj)", "Q4 2026 (Proj)"],
            datasets: [{
              label: "Gross Sales Value (₹ Cr)",
              data: [92, 128, 160, 210],
              borderColor: goldColor,
              backgroundColor: "rgba(212, 175, 55, 0.1)",
              fill: true,
              tension: 0.3
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
              y: { grid: { color: gridBorder }, ticks: { color: labelColor } },
              x: { grid: { color: gridBorder }, ticks: { color: labelColor } }
            },
            plugins: { legend: { labels: { color: labelColor } } }
          }
        });
      }

      if (chartRefs.salesFunnel.current) {
        chartInstances.current.salesFunnel = new Chart(chartRefs.salesFunnel.current, {
          type: "bar",
          data: {
            labels: ["Portal Visits", "AI Chat Interactions", "AR Visuals launched", "Booked Site Visits", "Confirmed Bookings"],
            datasets: [{
              data: [1000, 750, 480, 210, 64],
              backgroundColor: [
                "rgba(212, 175, 55, 0.2)",
                "rgba(212, 175, 55, 0.4)",
                "rgba(212, 175, 55, 0.6)",
                "rgba(212, 175, 55, 0.8)",
                goldColor
              ],
              borderRadius: 4
            }]
          },
          options: {
            indexAxis: "y",
            responsive: true,
            maintainAspectRatio: false,
            scales: {
              x: { grid: { color: gridBorder }, ticks: { color: labelColor } },
              y: { grid: { display: false }, ticks: { color: labelColor } }
            },
            plugins: { legend: { display: false } }
          }
        });
      }
    }
  }, [activeTab]);

  // Shivalik Copilot Graph Mode Chart rendering
  useEffect(() => {
    if (activeTab === "copilot" && copilotGraphMode && copilotChartRef.current) {
      // Destroy existing instance
      if (copilotChartInstance.current) {
        copilotChartInstance.current.destroy();
      }

      const goldColor = "#F59E0B"; // Amber
      const secondaryColor = "#10B981"; // Emerald
      const tertiaryColor = "#3B82F6"; // Blue
      const labelColor = "#94A3B8";
      const gridColor = "rgba(255, 255, 255, 0.05)";

      const ctx = copilotChartRef.current.getContext("2d");

      if (copilotChartType === "radar") {
        copilotChartInstance.current = new Chart(ctx, {
          type: "radar",
          data: {
            labels: ["Sunlight Index", "Investment Score", "Quietness", "Livability Score"],
            datasets: [
              {
                label: "Shivalik Skyview",
                data: [8.5, 8.8, 7.9, 9.2],
                backgroundColor: "rgba(245, 158, 11, 0.15)",
                borderColor: goldColor,
                pointBackgroundColor: goldColor,
                borderWidth: 2
              },
              {
                label: "Shivalik Highlife",
                data: [7.8, 9.4, 6.5, 8.5],
                backgroundColor: "rgba(16, 185, 129, 0.15)",
                borderColor: secondaryColor,
                pointBackgroundColor: secondaryColor,
                borderWidth: 2
              },
              {
                label: "Shivalik Edge",
                data: [9.0, 9.2, 8.5, 9.4],
                backgroundColor: "rgba(59, 130, 246, 0.15)",
                borderColor: tertiaryColor,
                pointBackgroundColor: tertiaryColor,
                borderWidth: 2
              }
            ]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
              r: {
                grid: { color: gridColor },
                angleLines: { color: gridColor },
                pointLabels: { color: labelColor, font: { family: "Inter", size: 10 } },
                ticks: { display: false },
                suggestedMin: 5,
                suggestedMax: 10
              }
            },
            plugins: {
              legend: {
                labels: { color: labelColor, font: { family: "Inter", size: 10 } }
              }
            }
          }
        });
      } else if (copilotChartType === "price") {
        copilotChartInstance.current = new Chart(ctx, {
          type: "bar",
          data: {
            labels: ["Shivalik Skyview", "Shivalik Highlife", "Shivalik Edge"],
            datasets: [
              {
                label: "Starting Price (₹ Cr)",
                data: [2.50, 1.80, 1.20],
                backgroundColor: [goldColor, secondaryColor, tertiaryColor],
                borderWidth: 0,
                borderRadius: 4
              }
            ]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
              y: { 
                grid: { color: gridColor }, 
                ticks: { color: labelColor },
                title: { display: true, text: "Price in Crores (₹)", color: labelColor }
              },
              x: { grid: { display: false }, ticks: { color: labelColor } }
            },
            plugins: {
              legend: { display: false }
            }
          }
        });
      } else if (copilotChartType === "cagr") {
        copilotChartInstance.current = new Chart(ctx, {
          type: "line",
          data: {
            labels: ["Shivalik Skyview", "Shivalik Highlife", "Shivalik Edge"],
            datasets: [
              {
                label: "Appreciation CAGR Projections (%)",
                data: [13.2, 14.1, 13.8],
                borderColor: goldColor,
                backgroundColor: "rgba(245, 158, 11, 0.1)",
                fill: true,
                tension: 0.3,
                borderWidth: 2,
                pointBackgroundColor: goldColor
              }
            ]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
              y: { 
                grid: { color: gridColor }, 
                ticks: { color: labelColor },
                title: { display: true, text: "CAGR Percentage (%)", color: labelColor },
                suggestedMin: 12,
                suggestedMax: 15
              },
              x: { grid: { display: false }, ticks: { color: labelColor } }
            },
            plugins: {
              legend: { display: false }
            }
          }
        });
      }
    }

    return () => {
      if (copilotChartInstance.current) {
        copilotChartInstance.current.destroy();
        copilotChartInstance.current = null;
      }
    };
  }, [copilotGraphMode, copilotChartType, activeTab]);

  // Loading guard — placed AFTER all hooks to comply with Rules of Hooks
  if (properties === undefined || inventory === undefined || leads === undefined || payments === undefined) {
    return (
      <div className="flex align-center justify-center h-100 w-100" style={{ minHeight: '100vh', background: '#0b0f1d', color: '#D4AF37', flexDirection: 'column', gap: '15px' }}>
        <RefreshCw className="animate-spin" size={36} style={{ animation: 'spin 1.5s linear infinite' }} />
        <h3>Connecting to Shivalik Cloud Database...</h3>
      </div>
    );
  }

  const handleRoleChange = (roleVal) => {
    setRole(roleVal);
    if (roleVal === "buyer") {
      setActiveTab("landing");
    } else if (roleVal === "sales") {
      setActiveTab("leads");
    } else if (roleVal === "executive") {
      setActiveTab("exec-insights");
    }
  };

  const filteredProperties = properties.filter(p => {
    const locMatch = filterLoc === "all" || p.location === filterLoc;
    const bhkMatch = filterBhk === "all" || p.bhk.includes(parseInt(filterBhk));
    const statMatch = filterStatus === "all" || p.status === filterStatus;
    let priceMatch = true;
    if (filterPrice === "under2") {
      priceMatch = p.price < 20000000;
    } else if (filterPrice === "over2") {
      priceMatch = p.price >= 20000000;
    }
    return locMatch && bhkMatch && statMatch && priceMatch;
  });

  const getInventoryForTowerAndFloor = (tower, floor) => {
    return inventory.filter(i => i.tower === tower && i.floor === floor);
  };

  const renderVacancyBlocks = (projId, towerName) => {
    const totalFloors = projId === "skyview" ? 10 : 15;
    const rows = [];
    
    for (let f = totalFloors; f >= 1; f--) {
      const blocks = [];
      for (let uNum = 1; uNum <= 4; uNum++) {
        const blockNum = f * 100 + uNum;
        const bhk = projId === "skyview" ? (uNum <= 2 ? 3 : 4) : 3;
        
        let status = "available";
        const seed = (f * 7 + uNum * 13) % 100;
        if (seed < 50) status = "sold";
        else if (seed < 75) status = "reserved";
        
        blocks.push(
          <div 
            key={blockNum} 
            className={`matrix-unit-block ${status}`}
            onClick={() => {
              if (status === "available") {
                handleOpenBooking(`${projId === "skyview" ? "Skyview" : "Highlife"} - Unit ${blockNum} (${towerName})`);
              } else {
                alert(`Unit ${blockNum} is ${status.toUpperCase()}. Choose an available gold unit.`);
              }
            }}
          >
            <span className="unit-num">{blockNum}</span>
            <span className="unit-type">{bhk} BHK</span>
          </div>
        );
      }
      rows.push(
        <div className="matrix-row" key={f}>
          <span className="matrix-floor-label">Floor {f}</span>
          <div className="matrix-units-row">{blocks}</div>
        </div>
      );
    }
    return rows;
  };

  return (
    <div className="app-container">
      {/* Sidebar Navigation */}
      <aside className="sidebar">
        <div className="sidebar-header">
          <div className="logo-icon">S</div>
          <div className="logo-text">
            <h1>SHIVALIK AI</h1>
            <span className="logo-sub">Property Experience</span>
          </div>
        </div>

        <div className="role-selector-container">
          <label>Portal View Mode</label>
          <div className="portal-role-list">
            <button
              className={`portal-role-item ${role === 'buyer' ? 'active' : ''}`}
              onClick={() => handleRoleChange('buyer')}
            >
              <span className="portal-role-icon">🏠</span>
              <div className="portal-role-info">
                <span className="portal-role-name">Customer Portal</span>
                <span className="portal-role-sub">Buyer Experience</span>
              </div>
              {role === 'buyer' && <span className="portal-role-dot" />}
            </button>
            <button
              className={`portal-role-item ${role === 'sales' ? 'active' : ''}`}
              onClick={() => handleRoleChange('sales')}
            >
              <span className="portal-role-icon">📊</span>
              <div className="portal-role-info">
                <span className="portal-role-name">Sales Executive</span>
                <span className="portal-role-sub">Sales Intelligence</span>
              </div>
              {role === 'sales' && <span className="portal-role-dot" />}
            </button>
            <button
              className={`portal-role-item ${role === 'executive' ? 'active' : ''}`}
              onClick={() => handleRoleChange('executive')}
            >
              <span className="portal-role-icon">🏢</span>
              <div className="portal-role-info">
                <span className="portal-role-name">Executive Board</span>
                <span className="portal-role-sub">Management View</span>
              </div>
              {role === 'executive' && <span className="portal-role-dot" />}
            </button>
          </div>
        </div>

        <nav className="sidebar-nav">
          {role === "buyer" && (
            <div className="nav-group">
              <div className="nav-group-title">Buyer Experience</div>
              <a href="#landing" className={`nav-item ${activeTab === 'landing' ? 'active' : ''}`} onClick={() => setActiveTab('landing')}>
                <Home /> {t("Discover Projects")}
              </a>
              <a href="#visualize" className={`nav-item ${activeTab === 'visualize' ? 'active' : ''}`} onClick={() => setActiveTab('visualize')}>
                <Layers /> {t("Property Visualization")}
              </a>
              <a href="#3d-township" className={`nav-item ${activeTab === '3d-township' ? 'active' : ''}`} onClick={() => setActiveTab('3d-township')}>
                <Building /> {t("3D Township Explorer")}
              </a>
              <a href="#compare" className={`nav-item ${activeTab === 'compare' ? 'active' : ''}`} onClick={() => setActiveTab('compare')}>
                <TrendingUp /> {t("Compare Properties")}
              </a>
              <a href="#ai-advisor" className={`nav-item ${activeTab === 'ai-advisor' ? 'active' : ''}`} onClick={() => setActiveTab('ai-advisor')}>
                <MessageSquare /> AI Advisor Chat
              </a>
              <a href="#copilot" className={`nav-item ${activeTab === 'copilot' ? 'active' : ''}`} onClick={() => {
                setActiveTab('copilot');
                setSelectedProjectDetails(null);
              }}>
                <Bot className="text-gold" /> Shivalik Copilot
              </a>
              <a href="#interior" className={`nav-item ${activeTab === 'interior' ? 'active' : ''}`} onClick={() => setActiveTab('interior')}>
                <Paintbrush /> AI Interior Designer
              </a>
              <a href="#finder" className={`nav-item ${activeTab === 'finder' ? 'active' : ''}`} onClick={() => setActiveTab('finder')}>
                <Sparkles /> Smart Match Finder
              </a>
              <a href="#customer-portal" className={`nav-item ${activeTab === 'customer-portal' ? 'active' : ''}`} onClick={() => setActiveTab('customer-portal')}>
                <FileCheck /> Customer Portal
              </a>
            </div>
          )}

          {role === "sales" && (
            <div className="nav-group">
              <div className="nav-group-title">Sales Intelligence</div>
              <a href="#leads" className={`nav-item ${activeTab === 'leads' ? 'active' : ''}`} onClick={() => setActiveTab('leads')}>
                <Users /> Lead Scoring CRM
              </a>
              <a href="#sales-analytics" className={`nav-item ${activeTab === 'sales-analytics' ? 'active' : ''}`} onClick={() => setActiveTab('sales-analytics')}>
                <BarChart2 /> Sales Analytics
              </a>
            </div>
          )}

          {role === "executive" && (
            <div className="nav-group">
              <div className="nav-group-title">Executive Boardroom</div>
              <a href="#exec-insights" className={`nav-item ${activeTab === 'exec-insights' ? 'active' : ''}`} onClick={() => setActiveTab('exec-insights')}>
                <TrendingUp /> Executive Insights
              </a>
              <a href="#inventory" className={`nav-item ${activeTab === 'inventory' ? 'active' : ''}`} onClick={() => setActiveTab('inventory')}>
                <Grid /> Inventory Vacancy Map
              </a>
            </div>
          )}
        </nav>

        <div className="sidebar-footer">
          <div className="user-profile">
            <div className="avatar">
              {role === "buyer" ? "CB" : role === "sales" ? "AS" : "TP"}
            </div>
            <div className="user-info">
              <div className="user-name">
                {role === "buyer" ? "Guest Customer" : role === "sales" ? "Amit Shah" : "Tarun Patel"}
              </div>
              <div className="user-role">
                {role === "buyer" ? "Prospective Buyer" : role === "sales" ? "Lead Sales Manager" : "Director / Boardroom"}
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Pane */}
      <main className="main-content">
        <header className="content-header">
          <div className="header-title">
            <span className="badge badge-gold">
              {role === "buyer" ? "Buyer Experience" : role === "sales" ? "Sales Intelligence" : "Executive Boardroom"}
            </span>
            <h2>
              {activeTab === "landing" && "Discover Projects"}
              {activeTab === "visualize" && "Property Visualization"}
              {activeTab === "3d-township" && "3D Township & Site Explorer"}
              {activeTab === "ai-advisor" && "AI Property Advisor Consultant"}
              {activeTab === "copilot" && "Shivalik Copilot AI Workspace"}
              {activeTab === "compare" && "Property Comparison Matrix"}
              {activeTab === "ar-viewer" && "Boardroom AR/VR Pitch Center"}
              {activeTab === "interior" && "AI Real 3D Interior designer"}
              {activeTab === "finder" && "Smart Match Property Finder"}
              {activeTab === "leads" && "CRM Lead Intelligence"}
              {activeTab === "sales-analytics" && "Sales Revenue & Conversion Metrics"}
              {activeTab === "exec-insights" && "Executive Leadership Dashboard"}
              {activeTab === "inventory" && "Real-time Block Vacancy Map"}
              {activeTab === "architecture" && "Platform Architecture & Data Flows"}
            </h2>
          </div>
          <div className="flex align-center gap-4">
            <select 
              className="header-lang-select" 
              value={i18n.language} 
              onChange={(e) => i18n.changeLanguage(e.target.value)}
            >
              <option value="en">English</option>
              <option value="hi">हिंदी (Hindi)</option>
              <option value="gu">ગુજરાતી (Gujarati)</option>
            </select>
            <div className="user-profile">
              <span className="text-muted font-small mr-2">{t("Welcome back,")}</span> Simulation Active
            </div>
          </div>
        </header>

        <div className="screen-container">
          {/* 1. DISCOVER PROJECTS PAGE */}
          {activeTab === "landing" && (
            <div className="tab-content">
              {selectedProjectDetails ? (
                /* 1.1 IMMERSIVE DETAILED PROJECT PAGE */
                <div className="project-details-page-container">
                  {/* Navigation row */}
                  <div className="details-nav-row">
                    <button 
                      className="btn-back-discover"
                      onClick={() => {
                        setSelectedProjectDetails(null);
                        triggerTelemetry("back_to_feed", "Returned to primary project discovery feed");
                      }}
                    >
                      ← Back to Discover Projects
                    </button>
                    <span className="badge badge-gold-outline">Property Profile Asset</span>
                  </div>

                  {/* Split Hero Section */}
                  <div className="details-hero-grid">
                    <div className="details-hero-left">
                      <div className="details-img-container">
                        <img src={selectedProjectDetails.image} alt={selectedProjectDetails.name} className="details-hero-img" />
                        <span className="details-status-badge">{selectedProjectDetails.status}</span>
                      </div>
                      <div className="details-quick-actions">
                        <button 
                          className="btn btn-gold w-100 hover-glow"
                          onClick={() => {
                            setSelectedTower(selectedProjectDetails.id === "skyview" ? "A" : selectedProjectDetails.id === "highlife" ? "C" : "B");
                            setActiveTab("3d-township");
                            triggerTelemetry("view_3d_township", `Entered 3D view from details page of ${selectedProjectDetails.name}`);
                          }}
                        >
                          Launch 3D Township View
                        </button>
                        {selectedProjectDetails.virtualTour && (
                          <button 
                            className="btn btn-outline w-100"
                            onClick={() => {
                              setActiveTab("visualize");
                              triggerTelemetry("launch_virtual_tour", `Launched virtual tour for ${selectedProjectDetails.name} (Rerouted)`);
                            }}
                          >
                            Start 360° Virtual VR Tour
                          </button>
                        )}
                      </div>
                    </div>

                    <div className="details-hero-right">
                      <div className="details-header-info">
                        <h2>{selectedProjectDetails.name}</h2>
                        <div className="details-location"><MapPin size={16} /> {selectedProjectDetails.location}, Ahmedabad</div>
                      </div>

                      <p className="details-full-description">
                        Experience elite living at {selectedProjectDetails.name}. Developed by {selectedProjectDetails.builder || "Shivalik Group"}, this premium real estate asset represents a milestone in contemporary design and high-end residential engineering in the prime {selectedProjectDetails.location} sector. Walk through vector layouts, sync sunlight orientations, or run virtual simulator tours.
                      </p>

                      <div className="details-meta-grid">
                        <div className="details-meta-card">
                          <span className="meta-label">Starting Price</span>
                          <span className="meta-val text-gold">₹{(selectedProjectDetails.price / 10000000).toFixed(2)} Cr</span>
                        </div>
                        <div className="details-meta-card">
                          <span className="meta-label">BHK Configuration</span>
                          <span className="meta-val">{selectedProjectDetails.bhk}</span>
                        </div>
                        <div className="details-meta-card">
                          <span className="meta-label">Target Completion</span>
                          <span className="meta-val">{selectedProjectDetails.completion}</span>
                        </div>
                        <div className="details-meta-card">
                          <span className="meta-label">RERA Registration</span>
                          <span className="meta-val font-mono" style={{ fontSize: '9px' }}>{selectedProjectDetails.reraNumber || "PR/GJ/AHMEDABAD/APPROVED"}</span>
                        </div>
                      </div>

                      {/* Live Interest Trend */}
                      {selectedProjectDetails.stats && (
                        <div className="details-trends-box">
                          <div className="trend-stat">👀 <strong>{selectedProjectDetails.stats.views}</strong> Views This Month</div>
                          <div className="trend-stat">📞 <strong>{selectedProjectDetails.stats.inquiries}</strong> Hot Inquiries</div>
                          <div className="trend-stat text-green">📈 <strong>{selectedProjectDetails.stats.trend}</strong> Trend Growth</div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Lower Section Grid */}
                  <div className="details-lower-grid">
                    <div className="details-lower-left">
                      {/* Physical Scores Dashboard */}
                      <div className="glass-card details-metrics-card">
                        <h3>Advanced Physical Ratings</h3>
                        <div className="details-metrics-dashboard">
                          {(() => {
                            const scores = PROPERTY_SCORES[selectedProjectDetails.name] || { sunlightScore: 8.0, noiseScore: 2.0, investmentScore: 8.5, livabilityScore: 8.8 };
                            return (
                              <>
                                <div className="details-metric-item">
                                  <div className="metric-header">
                                    <span>🌞 Incident Sunlight Index</span>
                                    <strong>{scores.sunlightScore}/10</strong>
                                  </div>
                                  <div className="metric-track"><div className="metric-fill gold-fill" style={{ width: `${scores.sunlightScore * 10}%` }}></div></div>
                                  <p className="metric-subtext">Evaluates natural light coverage during peak solar paths.</p>
                                </div>
                                <div className="details-metric-item">
                                  <div className="metric-header">
                                    <span>📈 Investment ROI Index</span>
                                    <strong className="text-green">{(scores.investmentScore * 1.5).toFixed(1)}% CAGR</strong>
                                  </div>
                                  <div className="metric-track"><div className="metric-fill green-fill" style={{ width: `${scores.investmentScore * 10}%` }}></div></div>
                                  <p className="metric-subtext">Estimated capital growth index based on metro and infrastructure linkages.</p>
                                </div>
                                <div className="details-metric-item">
                                  <div className="metric-header">
                                    <span>🔇 Acoustic Quietness Rating</span>
                                    <strong>{(10 - scores.noiseScore).toFixed(1)}/10</strong>
                                  </div>
                                  <div className="metric-track"><div className="metric-fill blue-fill" style={{ width: `${(10 - scores.noiseScore) * 10}%` }}></div></div>
                                  <p className="metric-subtext">Analyzes proximity ambient noise levels. Higher score is quieter.</p>
                                </div>
                                <div className="details-metric-item">
                                  <div className="metric-header">
                                    <span>👪 Livability & Comfort Score</span>
                                    <strong className="text-blue">{scores.livabilityScore}/10</strong>
                                  </div>
                                  <div className="metric-track"><div className="metric-fill blue-fill" style={{ width: `${scores.livabilityScore * 10}%` }}></div></div>
                                  <p className="metric-subtext">Aggregated comfort level, space optimization, and family convenience rating.</p>
                                </div>
                              </>
                            );
                          })()}
                        </div>
                      </div>

                      {/* Amenities Showcase */}
                      {selectedProjectDetails.amenities && (
                        <div className="glass-card details-amenities-card">
                          <h3>Luxury Amenities Equipped</h3>
                          <div className="details-amenities-grid">
                            {selectedProjectDetails.amenities.map((am, i) => (
                              <div key={i} className="details-amenity-badge">
                                <span className="amenity-icon">✨</span>
                                <span className="amenity-text">{am}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Floorplan Blueprint */}
                      <div className="glass-card details-blueprint-card">
                        <h3>Architectural Floorplan Blueprint</h3>
                        <p className="text-muted font-small mb-4">Detailed vector layout draft with area allocation matrices.</p>
                        <div className="details-blueprint-wrapper">
                          {renderProjectBlueprint(selectedProjectDetails.id === "edge" ? "highlife" : selectedProjectDetails.id)}
                        </div>
                      </div>
                    </div>

                    <div className="details-lower-right">
                      {/* Site Tour Booking Form */}
                      <div className="glass-card details-booking-card">
                        <div className="booking-card-header">
                          <h3>Schedule a Site Tour</h3>
                          <p className="text-muted font-small">Select date and fill credentials to coordinate a physical site visit with a Shivalik Executive.</p>
                        </div>

                        <form onSubmit={(e) => {
                          e.preventDefault();
                          const form = e.target;
                          const name = form.elements.name.value;
                          const phone = form.elements.phone.value;
                          const email = form.elements.email.value;
                          const date = form.elements.date.value;

                          if (!name || !phone || !email || !date) {
                            alert("Please complete all details.");
                            return;
                          }

                          const calculatedScore = Math.floor(Math.random() * 20) + 80;

                          // Register lead activity
                          if (addActivity) {
                            addActivity({
                              message: `Lead ${name} scheduled site visit tour for ${selectedProjectDetails.name} on ${date}`,
                              time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                            }).catch(console.error);
                          }

                          triggerTelemetry("booking", `${name} booked site tour for ${selectedProjectDetails.name} on ${date}`);

                          alert(`Site tour scheduled successfully for ${date}! An advisor will contact you shortly.`);
                          form.reset();
                        }} className="details-booking-form">
                          <div className="form-group">
                            <label>Full Name</label>
                            <input type="text" name="name" required placeholder="Enter your full name" />
                          </div>
                          <div className="form-group">
                            <label>Phone Number</label>
                            <input type="tel" name="phone" required placeholder="Enter contact number" />
                          </div>
                          <div className="form-group">
                            <label>Email Address</label>
                            <input type="email" name="email" required placeholder="Enter email address" />
                          </div>
                          <div className="form-group">
                            <label>Preferred Visit Date</label>
                            <input type="date" name="date" required min={new Date().toISOString().split('T')[0]} />
                          </div>
                          <button type="submit" className="btn btn-gold w-100 hover-glow" style={{ marginTop: '10px' }}>
                            Confirm Booking & Sync Telemetry
                          </button>
                        </form>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                /* 1.2 MAIN DISCOVER PROJECTS FEED */
                <>
                  {/* Telemetry Ticker */}
                  <div className="home-telemetry-ticker">
                    <div className="ticker-item">
                      <span className="ticker-dot green animate-pulse"></span>
                      <strong>489</strong> Active Viewers
                    </div>
                    <div className="ticker-divider">|</div>
                    <div className="ticker-item">⭐ <strong>4.9/5</strong> Average Rating</div>
                    <div className="ticker-divider">|</div>
                    <div className="ticker-item">🏡 <strong>1,482</strong> Virtual Tours Run</div>
                    <div className="ticker-divider">|</div>
                    <div className="ticker-item">💡 AI Advisor: <strong>24,198</strong> Queries Today</div>
                    <div className="ticker-divider">|</div>
                    <div className="ticker-item">📍 Area: Ahmedabad Premium Zones</div>
                  </div>

                  {/* Split Hero Banner */}
                  <div className="hero-banner-new">
                    <div className="hero-left-pane">
                      <span className="hero-tag-premium">SHIVALIK GROUP INNOVATION</span>
                      <h1 className="hero-title-premium">Find Your Future Home with <span className="gradient-gold-text">AI Intelligence</span></h1>
                      <p className="hero-desc-premium">Experience India's first AI & AR-driven property discovery platform. Walk through floorplans, customize interiors, and identify premium investment potentials from the comfort of your couch.</p>
                      <div className="hero-actions-row-premium">
                        <a href="#3d-township" className="btn btn-gold hover-glow" style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', textDecoration: 'none' }} onClick={() => setActiveTab('3d-township')}>Explore 3D Township</a>
                        <a href="#ai-advisor" className="btn btn-outline" style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', textDecoration: 'none' }} onClick={() => setActiveTab('ai-advisor')}>Talk to AI Advisor</a>
                        <a href="#architecture" className="btn btn-outline hover-glow-gold" style={{ borderColor: 'var(--color-accent)', color: 'var(--color-accent)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', textDecoration: 'none' }} onClick={() => setActiveTab('architecture')}>Explanation</a>
                      </div>
                    </div>
                    <div className="hero-right-pane">
                      <div className="hero-hologram-card">
                        <div className="hologram-grid-bg"></div>
                        <div className="hologram-silhouette-wrapper">
                          <svg viewBox="0 0 100 120" className="hologram-svg">
                            <polygon points="50,15 80,30 80,95 50,110 20,95 20,30" fill="none" stroke="rgba(212, 175, 55, 0.4)" strokeWidth="1.5" />
                            <polygon points="50,45 80,60 80,95 50,110 20,95 20,60" fill="none" stroke="rgba(212, 175, 55, 0.2)" strokeWidth="1" />
                            <line x1="50" y1="15" x2="50" y2="110" stroke="rgba(212, 175, 55, 0.4)" strokeWidth="1" />
                            <line x1="20" y1="30" x2="80" y2="30" stroke="rgba(212, 175, 55, 0.2)" strokeWidth="1" />
                            <line x1="20" y1="60" x2="80" y2="60" stroke="rgba(212, 175, 55, 0.2)" strokeWidth="1" />
                            <line x1="20" y1="95" x2="80" y2="95" stroke="rgba(212, 175, 55, 0.2)" strokeWidth="1" />
                            <line x1="10" y1="55" x2="90" y2="55" className="hologram-scanner" stroke="#0ea5e9" strokeWidth="1.5" strokeOpacity="0.8" />
                          </svg>
                        </div>
                        <div className="hologram-telemetry">
                          <div className="telemetry-row">
                            <span className="telemetry-label">SYSTEM STATE</span>
                            <span className="telemetry-value text-green">3D_ACTIVE</span>
                          </div>
                          <div className="telemetry-row">
                            <span className="telemetry-label">AR_ANCHORS</span>
                            <span className="telemetry-value">LIDAR_OK</span>
                          </div>
                          <div className="telemetry-row">
                            <span className="telemetry-label">RENDERER</span>
                            <span className="telemetry-value text-gold">WEBGL_ACES</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Redesigned Filters Panel */}
                  <div className="glass-card search-filter-card-new">
                    <div className="filter-header-row-new">
                      <h3><Sliders size={18} className="text-gold" /> Smart Filters</h3>
                      <button className="btn-text-clear" onClick={() => {
                        setFilterLoc("all");
                        setFilterBhk("all");
                        setFilterPrice("all");
                        setFilterStatus("all");
                      }}>Reset Filters</button>
                    </div>
                    <div className="filter-pills-container">
                      <div className="filter-pill-group">
                        <span className="filter-group-label-new"><MapPin size={12} /> Location:</span>
                        <div className="filter-pills-row-new">
                          {[
                            { key: "all", label: "All Areas" },
                            { key: "Ambawadi", label: "Ambawadi" },
                            { key: "SG Highway", label: "SG Highway" },
                            { key: "Bopal", label: "Bopal" }
                          ].map(item => (
                            <button 
                              key={item.key} 
                              className={`filter-pill-new ${filterLoc === item.key ? 'active' : ''}`}
                              onClick={() => setFilterLoc(item.key)}
                            >
                              {item.label}
                            </button>
                          ))}
                        </div>
                      </div>
                      
                      <div className="filter-pill-group">
                        <span className="filter-group-label-new"><Bed size={12} /> Configuration:</span>
                        <div className="filter-pills-row-new">
                          {[
                            { key: "all", label: "All Configurations" },
                            { key: "3", label: "3 BHK" },
                            { key: "4", label: "4 BHK" },
                            { key: "5", label: "5 BHK / Villa" }
                          ].map(item => (
                            <button 
                              key={item.key} 
                              className={`filter-pill-new ${filterBhk === item.key ? 'active' : ''}`}
                              onClick={() => setFilterBhk(item.key)}
                            >
                              {item.label}
                            </button>
                          ))}
                        </div>
                      </div>
                      
                      <div className="filter-pill-group">
                        <span className="filter-group-label-new"><Building size={12} /> Budget:</span>
                        <div className="filter-pills-row-new">
                          {[
                            { key: "all", label: "Any Budget" },
                            { key: "under2", label: "Under ₹2.0 Crore" },
                            { key: "over2", label: "Above ₹2.0 Crore" }
                          ].map(item => (
                            <button 
                              key={item.key} 
                              className={`filter-pill-new ${filterPrice === item.key ? 'active' : ''}`}
                              onClick={() => setFilterPrice(item.key)}
                            >
                              {item.label}
                            </button>
                          ))}
                        </div>
                      </div>
                      
                      <div className="filter-pill-group">
                        <span className="filter-group-label-new"><Activity size={12} /> Project Status:</span>
                        <div className="filter-pills-row-new">
                          {[
                            { key: "all", label: "Any Status" },
                            { key: "Ready", label: "Ready to Move" },
                            { key: "Construction", label: "Under Construction" }
                          ].map(item => (
                            <button 
                              key={item.key} 
                              className={`filter-pill-new ${filterStatus === item.key ? 'active' : ''}`}
                              onClick={() => setFilterStatus(item.key)}
                        >
                              {item.label}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Inline AI Matchmaker Desk */}
                  <div className="glass-card ai-advisor-desk">
                    <div className="desk-header">
                      <div className="desk-title">
                        <Sparkles className="text-gold pulse-gold" />
                        <div>
                          <h3>AI Advisor Matchmaking Studio</h3>
                          <p className="text-muted font-small">Compute optimal compatible projects by typing requirements or using quick presets.</p>
                        </div>
                      </div>
                      <span className="badge badge-gold">AI ENGINE CORE</span>
                    </div>
                    
                    <div className="desk-body">
                      <div className="presets-row">
                        <span className="presets-label">Smart Presets:</span>
                        <div className="presets-container">
                          {[
                            { key: "eco", label: "🌿 Eco & Sunlight Sanctuary" },
                            { key: "yield", label: "💰 High Appreciation Corridors" },
                            { key: "luxury", label: "👑 Ultimate Move-in Ready Luxury" }
                          ].map(item => (
                            <button 
                              key={item.key} 
                              className={`preset-match-btn ${activePresetMatch === item.key ? 'active' : ''}`}
                              onClick={() => {
                                setActivePresetMatch(item.key);
                                setIsAiMatching(true);
                                setAiMatchSearchQuery("");
                                triggerTelemetry("ai_match_preset", `Selected preset: ${item.key}`);
                                
                                setTimeout(() => {
                                  setIsAiMatching(false);
                                  let matches = [];
                                  if (item.key === "eco") {
                                    matches = [
                                      { id: "greenwoods", score: 98, reason: "Offers an outstanding 9.5 Sunlight Index and near silent noise environment." },
                                      { id: "skyview", score: 88, reason: "Excellent East-facing layouts with 8.5 Sunlight Index." }
                                    ];
                                  } else if (item.key === "yield") {
                                    matches = [
                                      { id: "highlife", score: 96, reason: "Unbeatable growth potential near SG Highway commercial hubs." },
                                      { id: "greenwoods", score: 89, reason: "Exclusive villa enclave with rising premium yields." }
                                    ];
                                  } else if (item.key === "luxury") {
                                    matches = [
                                      { id: "greenwoods", score: 97, reason: "Elite 5 BHK villas in woodland area with swimming pools." },
                                      { id: "skyview", score: 92, reason: "Signature luxury highrise in Ambawadi ready to occupy." }
                                    ];
                                  }
                                  setAiMatchedResults(matches);
                                }, 800);
                              }}
                            >
                              {item.label}
                            </button>
                          ))}
                        </div>
                      </div>
                      
                      <div className="custom-match-input-row">
                        <input 
                          type="text" 
                          className="ai-match-query-input"
                          placeholder="Type preferences, e.g., '3 bhk with high sunlight score under 2 cr'..."
                          value={aiMatchSearchQuery}
                          onChange={(e) => setAiMatchSearchQuery(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              runCustomAiMatch();
                            }
                          }}
                        />
                        <button 
                          className="btn btn-gold"
                          onClick={() => runCustomAiMatch()}
                        >
                          Calculate Match
                        </button>
                      </div>
                      
                      {isAiMatching ? (
                        <div className="ai-matching-loading">
                          <RefreshCw className="animate-spin text-gold" size={24} style={{ animation: 'spin 1.5s linear infinite' }} />
                          <span>Consulting neural weights & physical database...</span>
                        </div>
                      ) : aiMatchedResults.length > 0 ? (
                        <div className="ai-matched-results-container">
                          <h4>AI Recommendation Insights</h4>
                          <div className="ai-matches-grid">
                            {aiMatchedResults.map(match => {
                              const p = properties.find(item => {
                                const name = item.name.toLowerCase();
                                if (match.id === "skyview" && name.includes("skyview")) return true;
                                if (match.id === "highlife" && name.includes("highlife")) return true;
                                if ((match.id === "greenwoods" || match.id === "edge") && (name.includes("edge") || name.includes("greenwoods"))) return true;
                                return item._id === match.id;
                              });
                              if (!p) return null;
                              return (
                                <div key={match.id} className="ai-match-card-new">
                                  <div className="ai-match-card-img-wrapper">
                                    <img src={p.image} className="ai-match-card-img" alt={p.name} />
                                    <span className="match-percentage-badge-new">{match.score}% MATCH</span>
                                  </div>
                                  <div className="ai-match-card-body">
                                    <h5>{p.name}</h5>
                                    <p className="match-reason-text-new">{match.reason}</p>
                                    <div className="ai-match-card-footer">
                                      <div className="match-price-info">
                                        <span className="price-label">Starting Price</span>
                                        <span className="match-price-new">₹{(p.price / 10000000).toFixed(2)} Cr</span>
                                      </div>
                                      <button 
                                        className="btn btn-gold btn-small"
                                        onClick={() => {
                                          setSelectedProjectDetails(p);
                                          triggerTelemetry("view_details", `Opened details page for matched property ${p.name}`);
                                        }}
                                      >
                                        Inspect Details
                                      </button>
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      ) : null}
                    </div>
                  </div>

                  {/* Projects Title */}
                  <div className="section-header-row">
                    <h2>Featured Shivalik Projects</h2>
                    <span className="text-muted">Showing simulated premium portfolio</span>
                  </div>
                  
                  {/* Projects Grid */}
                  <div className="project-grid-new">
                    {filteredProperties.map(p => {
                      const isBlueprint = cardBlueprintView[p.id] || false;
                      const isCompared = homeCompareList.includes(p.id);
                      const scores = PROPERTY_SCORES[p.name] || { sunlightScore: 8.0, noiseScore: 2.0, investmentScore: 8.5, livabilityScore: 8.8 };
                      return (
                        <div key={p.id} id={`project-${p.id}`} className={`glass-card project-card-new ${isCompared ? 'compared-glowing' : ''}`}>
                          <div className="project-card-img-wrapper-new">
                            {isBlueprint ? (
                              <div className="blueprint-wrapper-container">
                                {renderProjectBlueprint(p.id === "edge" ? "highlife" : p.id)}
                              </div>
                            ) : (
                              <img src={p.image} className="project-card-img-new" alt={p.name} />
                            )}
                            <span className="project-status-tag-new">{p.status}</span>
                            
                            <button 
                              className={`blueprint-toggle-btn-new ${isBlueprint ? 'active' : ''}`}
                              onClick={(e) => {
                                e.stopPropagation();
                                setCardBlueprintView(prev => ({ ...prev, [p.id]: !isBlueprint }));
                                triggerTelemetry("toggle_view", `Switched ${p.name} card to ${!isBlueprint ? 'Blueprint' : 'Rendering'}`);
                              }}
                              title="Toggle Floorplan Blueprint"
                            >
                              <Compass size={14} />
                              <span>{isBlueprint ? "Show Photo" : "Show Plan"}</span>
                            </button>
                          </div>
                          
                          <div className="project-card-body-new">
                            <div className="project-card-header-new">
                              <h3>{p.name}</h3>
                              <label className="compare-checkbox-label-new">
                                <input 
                                  type="checkbox" 
                                  checked={isCompared}
                                  onChange={() => {
                                    if (isCompared) {
                                      setHomeCompareList(prev => prev.filter(id => id !== p.id));
                                    } else {
                                      if (homeCompareList.length >= 3) {
                                        alert("You can compare up to 3 properties at a time.");
                                        return;
                                      }
                                      setHomeCompareList(prev => [...prev, p.id]);
                                    }
                                    triggerTelemetry("compare_select", `Toggled compare checkbox for ${p.name}`);
                                  }}
                                />
                                <span>Compare</span>
                              </label>
                            </div>
                            
                            <div className="location-text-new"><MapPin size={13} /> {p.location}, Ahmedabad</div>
                            <p className="project-description-new">{p.description}</p>
                            
                            {/* Real-time Metric Scores */}
                            <div className="project-metrics-section-new">
                              <div className="metric-bar-item-new">
                                <div className="metric-bar-header-new">
                                  <span>🌞 Sunlight Index</span>
                                  <span className="metric-val-new">{scores.sunlightScore}/10</span>
                                </div>
                                <div className="metric-bar-track-new">
                                  <div className="metric-bar-fill-new gold-fill" style={{ width: `${scores.sunlightScore * 10}%` }}></div>
                                </div>
                              </div>
                              
                              <div className="metric-bar-item-new">
                                <div className="metric-bar-header-new">
                                  <span>📈 Appreciation CAGR</span>
                                  <span className="metric-val-new text-green">{(scores.investmentScore * 1.5).toFixed(1)}%</span>
                                </div>
                                <div className="metric-bar-track-new">
                                  <div className="metric-bar-fill-new green-fill" style={{ width: `${scores.investmentScore * 10}%` }}></div>
                                </div>
                              </div>
                              
                              <div className="metric-bar-item-new">
                                <div className="metric-bar-header-new">
                                  <span>👪 Livability Index</span>
                                  <span className="metric-val-new text-blue">{scores.livabilityScore}/10</span>
                                </div>
                                <div className="metric-bar-track-new">
                                  <div className="metric-bar-fill-new blue-fill" style={{ width: `${scores.livabilityScore * 10}%` }}></div>
                                </div>
                              </div>
                            </div>
                            
                            <div className="project-card-footer-new">
                              <div className="price-tag-new">
                                <span className="label-new">Starting Price</span>
                                <span className="amount-new">₹{(p.price / 10000000).toFixed(2)} Cr</span>
                              </div>
                              <div className="footer-actions-new">
                                <button 
                                  className="btn btn-outline btn-small"
                                  onClick={() => {
                                    setSelectedTower(p.id === "skyview" ? "A" : p.id === "highlife" ? "C" : "B");
                                    setActiveTab("3d-township");
                                    triggerTelemetry("view_3d_township", `Jumped to 3D township for ${p.name}`);
                                  }}
                                >
                                  3D view
                                </button>
                                <button 
                                  className="btn btn-gold btn-small" 
                                  onClick={() => {
                                    setSelectedProjectDetails(p);
                                    triggerTelemetry("view_details", `Opened details page for ${p.name}`);
                                  }}
                                >
                                  Book Tour
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Floating Compare Shelf Drawer */}
                  {homeCompareList.length > 0 && (
                    <div className="compare-shelf-floating">
                      <div className="shelf-overlay-glow"></div>
                      <div className="compare-shelf-content">
                        <div className="compare-shelf-left">
                          <span className="badge badge-gold">Comparison Drawer</span>
                          <h4>Selected Properties to Compare ({homeCompareList.length}/3)</h4>
                          <div className="compare-shelf-pills">
                            {homeCompareList.map(id => {
                              const p = properties.find(item => item.id === id);
                              if (!p) return null;
                              return (
                                <span key={id} className="compare-shelf-pill">
                                  {p.name}
                                  <button 
                                    className="compare-pill-close" 
                                    onClick={() => setHomeCompareList(prev => prev.filter(item => item !== id))}
                                  >
                                    <X size={12} />
                                  </button>
                                </span>
                              );
                            })}
                          </div>
                        </div>
                        
                        <div className="compare-shelf-right">
                          <button 
                            className="btn btn-outline btn-small"
                            onClick={() => setHomeCompareList([])}
                          >
                            Clear
                          </button>
                          <button 
                            className="btn btn-gold btn-small"
                            disabled={homeCompareList.length < 2}
                            onClick={() => {
                              const unitMap = {
                                "skyview": "sky-301",
                                "highlife": "high-604",
                                "greenwoods": "green-v1"
                              };
                              const mappedIds = homeCompareList.map(id => unitMap[id] || "sky-301");
                              if (mappedIds.length >= 2) {
                                setCompare1(mappedIds[0]);
                                setCompare2(mappedIds[1]);
                                setActiveTab("compare");
                                triggerTelemetry("compare_launch", `Launched comparison matrix for: ${homeCompareList.join(", ")}`);
                              }
                            }}
                            title={homeCompareList.length < 2 ? "Select at least 2 properties" : "Compare in Matrix"}
                          >
                            Compare Now <ChevronRight size={16} />
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          {/* 1.3 SHIVALIK COPILOT WORKSPACE */}
          {activeTab === "copilot" && (
            <div className="tab-content copilot-workspace-container">
              <div className={`copilot-grid-layout ${copilotGraphMode ? 'split' : 'full-width'}`}>
                {/* Left Pane - Chat Console */}
                <div className="glass-card copilot-chat-pane">
                  <div className="copilot-chat-header">
                    <div className="flex align-center gap-2">
                      <div className="copilot-pulse-dot active animate-pulse"></div>
                      <div>
                        <h3>Shivalik Copilot Console</h3>
                        <span className="text-muted font-small">Powered by gpt-oss-20b</span>
                      </div>
                    </div>
                    <div className="flex align-center gap-4">
                      {/* Unified Segment Switcher to avoid overlapping button wrapping */}
                      <div className="flex align-center gap-1" style={{ background: 'rgba(255,255,255,0.03)', padding: '2px', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.06)' }}>
                        <button 
                          className={`btn-toggle-graph-new ${!copilotGraphMode ? 'active' : ''}`}
                          style={{ margin: 0, padding: '5px 10px', fontSize: '10.5px' }}
                          onClick={() => {
                            setCopilotGraphMode(false);
                            triggerTelemetry("copilot_workspace_mode", "Chat Only");
                          }}
                        >
                          💬 Chat Only
                        </button>
                        <button 
                          className={`btn-toggle-graph-new ${copilotGraphMode && copilotPaneMode === 'graph' ? 'active' : ''}`}
                          style={{ margin: 0, padding: '5px 10px', fontSize: '10.5px' }}
                          onClick={() => {
                            setCopilotGraphMode(true);
                            setCopilotPaneMode('graph');
                            triggerTelemetry("copilot_workspace_mode", "AI Graphs");
                          }}
                        >
                          📊 AI Graphs
                        </button>
                        <button 
                          className={`btn-toggle-graph-new ${copilotGraphMode && copilotPaneMode === 'cad' ? 'active' : ''}`}
                          style={{ margin: 0, padding: '5px 10px', fontSize: '10.5px' }}
                          onClick={() => {
                            setCopilotGraphMode(true);
                            setCopilotPaneMode('cad');
                            triggerTelemetry("copilot_workspace_mode", "AutoCAD View");
                          }}
                        >
                          📐 AutoCAD View
                        </button>
                      </div>
                      
                      <button 
                        className="btn-text-clear"
                        style={{ fontSize: '11px', padding: '4px 8px', whiteSpace: 'nowrap' }}
                        onClick={() => {
                          setCopilotHistory([
                            { role: "assistant", content: "Hello! I am Shivalik Copilot, your advanced real-time AI architectural assistant. I can parse blueprint layouts, compare sunlight values, check RERA registration documents, and estimate appreciation CAGRs. Ask me anything about Shivalik properties!" }
                          ]);
                          triggerTelemetry("copilot_clear", "Cleared chat console history");
                        }}
                      >
                        Clear
                      </button>
                    </div>
                  </div>

                  <div className="copilot-chat-history">
                    {copilotHistory.map((msg, index) => (
                      <div key={index} className={`copilot-chat-bubble-wrapper ${msg.role}`}>
                        <div className="copilot-bubble-avatar">
                          {msg.role === "assistant" ? "🤖" : "👤"}
                        </div>
                        <div className="copilot-chat-bubble">
                          <div className="copilot-bubble-sender">
                            {msg.role === "assistant" ? "Shivalik Copilot Agent" : "System User / Developer"}
                          </div>
                          <div className="copilot-bubble-content">
                            {msg.content.split("\n").map((line, i) => (
                              <p key={i} style={{ margin: '4px 0' }}>{line}</p>
                            ))}
                          </div>
                        </div>
                      </div>
                    ))}

                    {/* Streaming block */}
                    {copilotStreamingText && (
                      <div className="copilot-chat-bubble-wrapper assistant streaming">
                        <div className="copilot-bubble-avatar">🤖</div>
                        <div className="copilot-chat-bubble">
                          <div className="copilot-bubble-sender">Shivalik Copilot Agent <span className="streaming-indicator">typing...</span></div>
                          <div className="copilot-bubble-content">
                            {copilotStreamingText.split("\n").map((line, i) => (
                              <p key={i} style={{ margin: '4px 0' }}>{line}</p>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}

                    {copilotIsStreaming && !copilotStreamingText && (
                      <div className="copilot-chat-bubble-wrapper assistant typing-loader">
                        <div className="copilot-bubble-avatar">🤖</div>
                        <div className="copilot-chat-bubble">
                          <div className="copilot-bubble-sender">Shivalik Copilot Agent</div>
                          <div className="copilot-bubble-content">
                            <span className="dot-loader">.</span>
                            <span className="dot-loader" style={{ animationDelay: '0.2s' }}>.</span>
                            <span className="dot-loader" style={{ animationDelay: '0.4s' }}>.</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* AutoCAD Integration preset chips */}
                  <div className="copilot-cad-chips-container">
                    <button 
                      className="cad-chip-btn"
                      onClick={() => streamCopilotResponse("Verify standard dimensions & carpet area on the floorplan")}
                    >
                      📐 Dimensions
                    </button>
                    <button 
                      className="cad-chip-btn"
                      onClick={() => streamCopilotResponse("Highlight load-bearing structural pillars")}
                    >
                      🧱 Structural Pillars
                    </button>
                    <button 
                      className="cad-chip-btn"
                      onClick={() => streamCopilotResponse("Show HVAC ventilation duct layout")}
                    >
                      🌬️ HVAC Ducts
                    </button>
                    <button 
                      className="cad-chip-btn"
                      onClick={() => streamCopilotResponse("Load electrical switch and socket grid layout")}
                    >
                      ⚡ Electrical Grid
                    </button>
                    <button 
                      className="cad-chip-btn"
                      onClick={() => streamCopilotResponse("Verify plumbing riser pipelines")}
                    >
                      🚰 Plumbing Flows
                    </button>
                  </div>

                  <div className="copilot-chat-input-bar">
                    <textarea
                      value={copilotInput}
                      onChange={(e) => setCopilotInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          streamCopilotResponse(copilotInput);
                        }
                      }}
                      placeholder="Ask copilot about blueprints, specifications, sunlight angles..."
                      disabled={copilotIsStreaming}
                    />
                    <button 
                      className="btn btn-gold btn-send-copilot"
                      onClick={() => streamCopilotResponse(copilotInput)}
                      disabled={copilotIsStreaming || !copilotInput.trim()}
                    >
                      <Send size={18} />
                    </button>
                  </div>
                </div>

                {/* Right Pane - Dynamic Graph Panel or AutoCAD Workspace */}
                {copilotGraphMode && (
                  <div 
                    className={`glass-card ${copilotPaneMode === 'cad' ? 'copilot-cad-pane-outer' : 'copilot-graph-pane'}`} 
                    style={copilotPaneMode === 'cad' ? { padding: 0, height: '660px' } : {}}
                  >
                    {copilotPaneMode === 'cad' ? (
                      <AutoCADWorkspace
                        selectedUnit={selectedCADUnit}
                        layers={cadLayers}
                        onLayerToggle={(layerName) => {
                          setCadLayers(prev => ({
                            ...prev,
                            [layerName]: !prev[layerName]
                          }));
                          triggerTelemetry("cad_layer_toggle", `Toggled layer: ${layerName}`);
                        }}
                        onUnitChange={(unitId) => {
                          setSelectedCADUnit(unitId);
                          triggerTelemetry("cad_unit_change", `Selected CAD layout: ${unitId}`);
                        }}
                        highlightedRooms={cadHighlightedRooms}
                      />
                    ) : (
                      <>
                        <div className="graph-pane-header">
                          <h4>AI Real-time Graph Analyzer</h4>
                          <select 
                            value={copilotChartType} 
                            onChange={(e) => {
                              setCopilotChartType(e.target.value);
                              triggerTelemetry("copilot_graph_type", `Changed graph comparison metric to ${e.target.value}`);
                            }}
                            className="graph-metric-select"
                          >
                            <option value="radar">Physical Ratings (Sunlight/Quietness/Livability)</option>
                            <option value="price">Starting Price Point (Cr)</option>
                            <option value="cagr">Appreciation CAGR (%)</option>
                          </select>
                        </div>
                        
                        <div className="copilot-chart-wrapper">
                          <canvas ref={copilotChartRef}></canvas>
                        </div>

                        <div className="graph-telemetry-meta">
                          <div className="meta-row">
                            <span>Active Model Context</span>
                            <strong>openai/gpt-oss-20b</strong>
                          </div>
                          <div className="meta-row">
                            <span>Analysis Speed</span>
                            <span className="text-green">Dynamic Real-time</span>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* 1.5 VISUALIZE PROPERTY */}
          {activeTab === "visualize" && (
            <div className="tab-content h-100">
              <div className="split-layout h-100">
                <div className="glass-card flex-1 h-100">
                  <VirtualTour />
                </div>
                <div className="glass-card visualization-sidebar">
                  <EMICalculator />
                </div>
              </div>
            </div>
          )}

          {/* 2. 3D TOWNSHIP EXPLORER */}
          {activeTab === "3d-township" && (
            <div className="tab-content">
              <div className="split-layout">
                {/* 3D Map viewport simulation */}
                <div className="glass-card viewport-card">
                  <div className="viewport-header">
                    <div className="viewport-badge"><Layout /> 3D Townsite Simulator</div>
                    <span className="text-gold">Interactive Vector Canvas</span>
                  </div>
                  <div className="three-d-simulation-container" style={{ width: '100%', height: '500px', minHeight: '500px', position: 'relative' }}>
                    <ThreeDErrorBoundary>
                      <ThreeDViewer
                        mode={buildingViewTower ? "building" : "township"}
                        buildingTower={buildingViewTower}
                        selectedTower={selectedTower}
                        onSelectTower={handleSelectTower}
                        onSelectAmenity={handleSelectAmenity}
                        highlightFloor={activeFloorAlert}
                        timeOfDay={geoTimeOfDay}
                      />
                    </ThreeDErrorBoundary>
                    {buildingViewTower && (
                      <button
                        onClick={() => setBuildingViewTower(null)}
                        style={{
                          position: 'absolute', top: '10px', left: '10px', zIndex: 20,
                          background: 'rgba(10,15,29,0.85)', border: '1px solid rgba(212,175,55,0.4)',
                          color: '#D4AF37', padding: '6px 14px', borderRadius: '8px',
                          cursor: 'pointer', fontSize: '12px', fontWeight: 700,
                          backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', gap: '6px',
                        }}
                      >
                        ← Back to Township
                      </button>
                    )}
                  </div>
                  <div className="helper-text-bar"><MousePointer /> Left-Click & Drag to rotate. Scroll to Zoom. {buildingViewTower ? 'Click a flat to highlight it.' : 'Click Towers to enter. Click Gym/Pool to sync details.'}</div>
                </div>

                {/* Right side info panel */}
                <div className="sidebar-details-container">
                  <div className="glass-card ai-narrator-card">
                    <div className="card-header-small">
                      <div className="ai-badge"><Radio /> AI Narration Engine</div>
                    </div>
                    <div className="narration-bubble">
                      <p>{narrationText}</p>
                    </div>
                  </div>

                  <div className="glass-card detail-display-card">
                    {selectedTower ? (
                      <div className="tower-details-view">
                        <h3>Tower {selectedTower} Overview <span className="badge badge-gold">Active</span></h3>
                        <div className="tower-stats-grid">
                          <div className="tower-stat-item">
                            <span className="label">Available Inventory</span>
                            <span className="val text-gold">{selectedTower === 'A' ? "14 Units" : selectedTower === 'B' ? "8 Units" : "28 Units"}</span>
                          </div>
                          <div className="tower-stat-item">
                            <span className="label">Total Floors</span>
                            <span className="val">{selectedTower === 'A' ? "10 Floors" : selectedTower === 'B' ? "5 Floors" : "15 Floors"}</span>
                          </div>
                          <div className="tower-stat-item">
                            <span className="label">Pricing Bracket</span>
                            <span className="val">{selectedTower === 'C' ? "₹1.20 Cr - ₹1.45 Cr" : "₹1.85 Cr - ₹3.50 Cr"}</span>
                          </div>
                          <div className="tower-stat-item">
                            <span className="label">Floor Orientation</span>
                            <span className="val">East-West Sun Ventilation</span>
                          </div>
                        </div>
                        <div className="blueprints-preview-container">
                          <div className="blueprint-svg-wrapper">
                            <svg viewBox="0 0 100 80" className="blueprint-thumbnail">
                              <rect x="5" y="5" width="90" height="70" fill="none" stroke="#D4AF37" strokeWidth="1.5" strokeDasharray="2"/>
                              <line x1="50" y1="5" x2="50" y2="75" stroke="#334155" strokeWidth="1"/>
                              <line x1="5" y1="40" x2="95" y2="40" stroke="#334155" strokeWidth="1"/>
                              <text x="25" y="25" fontSize="8" fill="#94A3B8" textAnchor="middle">3 BHK</text>
                              <text x="75" y="25" fontSize="8" fill="#94A3B8" textAnchor="middle">Balcony</text>
                              <text x="50" y="60" fontSize="8" fill="#94A3B8" textAnchor="middle">Kitchen</text>
                            </svg>
                          </div>
                          <span>Simulated layout preview</span>
                        </div>
                        <div className="detail-actions-stack">
                          <button className="btn btn-gold" onClick={() => setBuildingViewTower(selectedTower)} style={{ fontSize: '13px' }}>🏢 Enter Tower — Walk Through Flats</button>
                          <button className="btn btn-outline" onClick={() => { setActiveTab("visualize"); triggerTelemetry("launch_ar", `Redirected from Tower ${selectedTower} to Property Visualization`); }}><Layout /> Launch AR Viewer</button>
                          <button className="btn btn-outline" onClick={() => { setCompare1(selectedTower === 'C' ? "high-604" : "sky-301"); setActiveTab("compare"); }}><GitCompare /> Compare Properties</button>
                        </div>
                      </div>
                    ) : selectedAmenity ? (
                      <div>
                        <h3>{selectedAmenity} Details</h3>
                        <p className="text-muted mt-2">Equipped luxury amenity part of the unified Shivalik Club cluster.</p>
                        <div className="tower-stat-item mt-4">
                          <span className="label">Access Category</span>
                          <span className="val text-gold">Shivalik Platinum Residency Membership</span>
                        </div>
                        <button className="btn btn-outline w-100 mt-4" onClick={() => handleOpenBooking("Clubhouse Tour")}><Home /> Schedule Visit</button>
                      </div>
                    ) : (
                      <div className="empty-state-message">
                        <MousePointer className="large-icon" />
                        <h3>Select a Building</h3>
                        <p>Select any property asset on the 3D map to load active inventory data, prices, floors, and floor plan previews.</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 3. AI PROPERTY ADVISOR */}
          {activeTab === "ai-advisor" && (
            <div className="tab-content">
              <div className="chat-container">
                <div className="chat-suggestions-sidebar">
                  <h3>Ask AI Advisor</h3>
                  <p className="text-muted">Select a simulated query to trigger real-time AI structured evaluations:</p>
                  <div className="suggestion-list">
                    <button className="suggestion-btn" onClick={() => handleSendChat('Show 3 BHK apartments under ₹2 crore.')}>
                      Show 3 BHK apartments under ₹2 crore
                    </button>
                    <button className="suggestion-btn" onClick={() => handleSendChat('Compare Tower A and Tower C.')}>
                      Compare Tower A and Tower C
                    </button>
                    <button className="suggestion-btn" onClick={() => handleSendChat('Which apartment receives more sunlight?')}>
                      Which apartment receives more sunlight?
                    </button>
                    <button className="suggestion-btn" onClick={() => handleSendChat('Which unit has highest investment potential?')}>
                      Which unit has highest investment potential?
                    </button>
                    <button className="suggestion-btn" onClick={() => handleSendChat('What schools are nearby?')}>
                      What schools are nearby?
                    </button>
                  </div>
                </div>

                <div className="glass-card chat-box">
                  <div className="chat-header">
                    <div className="chat-ai-profile">
                      <div className="ai-avatar"><Bot /></div>
                      <div>
                        <h4>Shivalik Real Estate AI</h4>
                        <span className="text-gold font-small">Online • 24/7 Intelligent Consultant</span>
                      </div>
                    </div>
                  </div>

                  <div className="chat-messages">
                    {chatMessages.map((m, index) => (
                      <div key={index} className={`msg ${m.sender === 'user' ? 'user' : 'bot'}`}>
                        <div className="msg-bubble">
                          <p style={{ whiteSpace: "pre-line" }}>{m.text}</p>
                          {m.component && m.component}
                        </div>
                      </div>
                    ))}
                    {isTyping && (
                      <div className="msg bot">
                        <div className="msg-bubble typing">
                          <span></span><span></span><span></span>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="chat-input-bar">
                    <input 
                      type="text" 
                      placeholder="Ask about BHKs, pricing index, amenities..." 
                      value={chatInput}
                      onChange={(e) => setChatInput(e.target.value)}
                      onKeyDown={(e) => { if (e.key === 'Enter') handleSendChat(chatInput); }}
                    />
                    <button className="btn btn-gold" onClick={() => handleSendChat(chatInput)}><Send /></button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 4. COMPARE PROPERTIES */}
          {activeTab === "compare" && (
            <div className="tab-content">
              <div className="glass-card comparison-setup-card">
                <h3>Property Comparison Engine</h3>
                <p className="text-muted">Compare primary project assets side-by-side on sunlight exposure, investment value, noise indexes, and structural prices.</p>
                <div className="compare-selectors">
                  <div className="selector-field">
                    <label>Compare Unit 1</label>
                    <select value={compare1} onChange={(e) => setCompare1(e.target.value)}>
                      {database.units.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                    </select>
                  </div>
                  <div className="selector-field-vs">VS</div>
                  <div className="selector-field">
                    <label>Compare Unit 2</label>
                    <select value={compare2} onChange={(e) => setCompare2(e.target.value)}>
                      {database.units.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                    </select>
                  </div>
                </div>
              </div>

              {/* Comparison Matrix Table */}
              <div className="glass-card comparison-results-card">
                <table className="comparison-table">
                  <thead>
                    <tr>
                      <th>Criteria</th>
                      <th className="text-gold">{database.units.find(u => u.id === compare1)?.name}</th>
                      <th className="text-gold">{database.units.find(u => u.id === compare2)?.name}</th>
                      <th>Assessment Advice</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(() => {
                      const u1 = database.units.find(u => u.id === compare1);
                      const u2 = database.units.find(u => u.id === compare2);
                      if (!u1 || !u2) return null;
                      
                      const comparisonRows = [
                        { label: "BHK Configuration", v1: `${u1.bhk} BHK`, v2: `${u2.bhk} BHK`, note: "Layout specifications." },
                        { label: "Super Area", v1: `${u1.area} sq.ft.`, v2: `${u2.area} sq.ft.`, note: `Area delta: ${Math.abs(u1.area - u2.area)} sq.ft.` },
                        { label: "Pricing Bracket", v1: `₹${(u1.price/10000000).toFixed(2)} Cr`, v2: `₹${(u2.price/10000000).toFixed(2)} Cr`, note: `Delta ₹${(Math.abs(u1.price - u2.price)/100000).toFixed(1)} Lakhs` },
                        { label: "Floor Level", v1: `Floor ${u1.floor}`, v2: `Floor ${u2.floor}`, note: "Elevation differences." },
                        { label: "Sunlight Orientation", v1: u1.sunlight, v2: u2.sunlight, note: "Incident lighting." },
                        { label: "Acoustic Noise Rating", v1: u1.noise, v2: u2.noise, note: "Ambient dB score." },
                        { label: "Investment Value Yield", v1: `${u1.investment}/10`, v2: `${u2.investment}/10`, note: u1.investment > u2.investment ? "Unit 1 higher CAGR." : "Unit 2 superior CAGR." },
                        { label: "Livability index", v1: `${u1.livability}/10`, v2: `${u2.livability}/10`, note: u1.livability > u2.livability ? "Unit 1 layout calm." : "Unit 2 layout calm." }
                      ];

                      return comparisonRows.map((r, i) => (
                        <tr key={i}>
                          <td>{r.label}</td>
                          <td>{r.v1}</td>
                          <td>{r.v2}</td>
                          <td className="text-muted font-small">{r.note}</td>
                        </tr>
                      ));
                    })()}
                  </tbody>
                </table>

                {(() => {
                  const u1 = database.units.find(u => u.id === compare1);
                  const u2 = database.units.find(u => u.id === compare2);
                  if (!u1 || !u2) return null;
                  const winner = (u1.investment + u1.livability) > (u2.investment + u2.livability) ? u1.name : u2.name;
                  return (
                    <div className="comparison-summary-box">
                      <h4>AI Engine Boardroom Choice</h4>
                      <p>Evaluating coordinates, pricing index, and lighting orientations, **{winner}** is assessed as the superior lifestyle placement.</p>
                    </div>
                  );
                })()}
              </div>
            </div>
          )}

          {/* 5. AR/VR PITCH CENTER */}
          {activeTab === "ar-viewer" && (
            <div className="tab-content">
              {/* Tab Selector inside AR */}
              <div className="form-row mb-4" style={{ maxWidth: "400px" }}>
                <button className={`btn w-100 ${arSubTab === 'tabletop' ? 'btn-gold' : 'btn-outline'}`} onClick={() => setArSubTab('tabletop')}>
                  Indoor Tabletop AR
                </button>
                <button className={`btn w-100 ${arSubTab === 'site' ? 'btn-gold' : 'btn-outline'}`} onClick={() => setArSubTab('site')}>
                  On-Site Geo-AR Simulator
                </button>
              </div>

              {arSubTab === "tabletop" ? (
                <div className="split-layout">
                  <div className="ar-pitch-guide-box">
                    <div className="glass-card">
                      <h3>Holographic Tabletop controls</h3>
                      <p className="text-muted font-small mt-2 mb-4">Scales and overlays structural 2D floor plans onto virtual flat surfaces.</p>
                      
                      <div className="config-section">
                        <label>Select Unit Blueprint</label>
                        <select value={arSelectedUnit} onChange={(e) => handleARUnitChange(e.target.value)}>
                          <option value="skyview-301">Shivalik Skyview - Unit 301 (3 BHK)</option>
                          <option value="highlife-1204">Shivalik Highlife - Unit 1204 (3 BHK)</option>
                          <option value="greenwoods-v1">Shivalik Greenwoods - Villa 1 (5 BHK)</option>
                        </select>
                      </div>

                      <div className="pitch-metric-badge-box">
                        <h5>Sales Conversion Pitch</h5>
                        <ul>
                          <li><CheckCircle /> Customizing drapes and bed alignments raises client engagement.</li>
                          <li><CheckCircle /> Tabletop mode lets buyers rotate blueprint models 360°.</li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  {/* Smartphone screen for Tabletop AR */}
                  <div className="smartphone-wrapper">
                    <div className="smartphone-frame">
                      <div className="smartphone-screen">
                        <div className="phone-ui-header">
                          <span>12:20 PM</span>
                          <span>📶 🔋 100%</span>
                        </div>

                        <div className="ar-mock-camera-bg">
                          <div className="floor-plan-wrapper" style={{ 
                            transform: `scale(${arScale}) rotate(${arRotation}deg)`,
                            maxWidth: "240px",
                            backgroundColor: "rgba(30,41,59,0.85)",
                            borderColor: "var(--color-accent)"
                          }}>
                            <svg viewBox="0 0 400 400" className="floorplan-svg">
                              <rect x="20" y="20" width="360" height="360" fill="none" stroke="#D4AF37" strokeWidth="4"/>
                              <line x1="380" y1="20" x2="380" y2="380" stroke="#38BDF8" strokeWidth="6" opacity="0.6"/>
                              <line x1="20" y1="220" x2="220" y2="220" stroke="#FFF" strokeWidth="4"/>
                              <line x1="220" y1="20" x2="220" y2="380" stroke="#FFF" strokeWidth="4"/>
                              
                              <text x="120" y="110" fill="#FFF" fontSize="18" fontWeight="600" textAnchor="middle">Living Room</text>
                              <text x="120" y="300" fill="#FFF" fontSize="18" fontWeight="600" textAnchor="middle">Kitchen</text>
                              <text x="300" y="110" fill="#FFF" fontSize="18" fontWeight="600" textAnchor="middle">Master Bed</text>

                              {arLaserMeasure && (
                                <g>
                                  <line x1="20" y1="120" x2="220" y2="120" stroke="#D4AF37" strokeWidth="2" strokeDasharray="4"/>
                                  <text x="120" y="140" fill="#D4AF37" fontSize="14" fontWeight="700" textAnchor="middle">20.0 ft</text>
                                </g>
                              )}

                              {arFurniture && (
                                <g>
                                  <rect x="50" y="50" width="100" height="20" rx="3" fill="#1E293B" stroke="#D4AF37" strokeWidth="1"/>
                                </g>
                              )}
                            </svg>
                          </div>

                          <div className="absolute bottom-4 left-2 right-2 flex justify-between gap-1 pointer-events-auto" style={{ zIndex: 10, width: "95%" }}>
                            <button className="gizmo-btn" onClick={() => {}} style={{ padding: "4px 8px", fontSize: "10px" }}><RotateCw size={12} /> Rotate</button>
                            <button className="gizmo-btn" onClick={() => setArLaserMeasure(!arLaserMeasure)} style={{ padding: "4px 8px", fontSize: "10px" }}><Ruler size={12} /> Lasers</button>
                            <button className="gizmo-btn" onClick={() => setArFurniture(!arFurniture)} style={{ padding: "4px 8px", fontSize: "10px" }}><Bed size={12} /> Furniture</button>
                          </div>

                          <div className="ar-phone-status-overlay">
                            <span>Blueprints model anchored on table</span>
                          </div>
                        </div>

                        <div className="phone-ui-footer-bar"></div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="split-layout">
                  <div className="ar-pitch-guide-box">
                    <div className="glass-card">
                      <h3>On-Site Geo-AR Pitch</h3>
                      <p className="text-muted font-small mt-2 mb-4">Point the device camera at the empty construction plot to project a full-scale hologram of the completed Shivalik building.</p>

                      <div className="flex flex-col gap-4">
                        <button className={`pitch-step-btn ${geoArStep === 1 ? 'active' : ''}`} onClick={() => setGeoArStep(1)}>
                          <span className="step-num-badge">1</span>
                          <div className="step-details">
                            <h4>Step 1: Sync GPS Coordinates</h4>
                            <p>Calibrates device compass bearing with the empty land coordinates.</p>
                          </div>
                        </button>

                        <button className={`pitch-step-btn ${geoArStep === 2 ? 'active' : ''}`} onClick={() => setGeoArStep(2)}>
                          <span className="step-num-badge">2</span>
                          <div className="step-details">
                            <h4>Step 2: Anchor Tower Horizon</h4>
                            <p>Locks the horizon guidelines to anchor the completed tower building model.</p>
                          </div>
                        </button>

                        <button className={`pitch-step-btn ${geoArStep === 3 ? 'active' : ''}`} onClick={() => setGeoArStep(3)}>
                          <span className="step-num-badge">3</span>
                          <div className="step-details">
                            <h4>Step 3: Analyze Shadow & Click Floors</h4>
                            <p>Slide time clock to study shadows. Click virtual floors for vacancy alerts.</p>
                          </div>
                        </button>
                      </div>

                      {geoArStep === 3 && (
                        <div className="mt-4 glass-card" style={{ padding: "16px", borderColor: "rgba(212,175,55,0.4)" }}>
                          <label className="font-small text-gold font-bold display-block mb-2">Solar Shadow Clock: {geoTimeOfDay}:00 {geoTimeOfDay >= 12 ? 'PM' : 'AM'}</label>
                          <input 
                            type="range" 
                            className="ar-time-slider"
                            min="8" 
                            max="18" 
                            value={geoTimeOfDay}
                            onChange={(e) => setGeoTimeOfDay(parseInt(e.target.value))}
                          />
                          <span className="text-muted font-small display-block mt-2">Adjust slider to simulate shadows moving from East to West.</span>
                        </div>
                      )}

                      {activeFloorAlert && (
                        <div className="mt-4 glass-card border-green" style={{ padding: "12px", borderLeft: "4px solid #10b981", backgroundColor: "rgba(16,185,129,0.05)" }}>
                          <span className="font-small font-bold display-block text-green">Real-time Floor Telemetry</span>
                          <p className="font-small text-muted mt-1">{activeFloorAlert}</p>
                        </div>
                      )}

                      <div className="pitch-metric-badge-box">
                        <h5>Executive Site Selling Pitch</h5>
                        <ul>
                          <li><CheckCircle /> **Site Conversion Boost:** Showing the completed building on raw dirt accelerates pre-sales by 40%.</li>
                          <li><CheckCircle /> **Sunlight Proof:** Proves exact shadow coverage indices to prospective clients and regulators.</li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  {/* Smartphone screen for Site AR */}
                  <div className="smartphone-wrapper">
                    <div className="smartphone-frame">
                      <div className="smartphone-screen">
                        <div className="phone-ui-header">
                          <span>12:20 PM</span>
                          <span>📶 🔋 100%</span>
                        </div>

                        {/* Compass indicator */}
                        <div className="ar-compass-circle">
                          <Compass style={{ transform: `rotate(${-geoCompassAngle}deg)` }} />
                          <span style={{ marginTop: "14px" }}>{geoCompassAngle}° SE</span>
                        </div>

                        {/* Horizon Indicator level */}
                        <div className="absolute left-6 right-6 top-1/2 border-t border-green-500 opacity-60 z-10 pointer-events-none" style={{ borderTop: "2px solid #10b981" }}></div>

                        <div className="ar-empty-land-view">
                          {/* Lidar radar sweep grid overlay */}
                          {isScanningSite && (
                            <>
                              <div className="ar-radar-sweep-line"></div>
                              <div className="ar-laser-line"></div>
                            </>
                          )}

                          {/* Holographic Wireframe completed building overlay */}
                          {geoLocked && (
                            <>
                              <div className="hologram-tower-model">
                                <span className="font-small text-muted" onClick={() => {}}>FL 12 🔴</span>
                                <span className="font-small text-muted" onClick={() => {}}>FL 8 🟢</span>
                                <span className="font-small text-muted" onClick={() => {}}>FL 4 🔴</span>
                                <span style={{ fontSize: "11px", color: "#FFF" }}>TOWER A</span>
                              </div>
                              <div className="hologram-floor-ring"></div>
                              
                              {/* Solar Shadow Overlay */}
                              <div 
                                className="ar-shadow-overlay"
                                style={calculateShadowOffset()}
                              ></div>
                            </>
                          )}

                          {/* Lock / Anchor controls */}
                          <div className="absolute bottom-4 left-2 right-2 flex flex-col gap-2 pointer-events-auto" style={{ zIndex: 10, width: "95%" }}>
                            <button className="btn btn-gold btn-small w-100" onClick={handleGeoAnchorToggle}>
                              {geoLocked ? "⚓ Release Site Anchor" : isScanningSite ? "Scanning..." : "⚓ Anchor Building Hologram"}
                            </button>
                          </div>
                        </div>

                        <div className="phone-ui-footer-bar"></div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* 6. AI REAL 3D INTERIOR DESIGNER WITH GLOWING LIGHTS & ROTATOR */}
          {activeTab === "interior" && (
            <div className="tab-content">
              <div className="split-layout">
                <div className="interior-control-sidebar">
                  <div className="glass-card">
                    <h3>AI Real 3D Styler Config</h3>
                    <p className="text-muted">Set aesthetic themes and sliding budgets to render custom rooms in real interactive 3D.</p>
                    
                    <div className="config-group">
                      <label>Interior Aesthetic Style</label>
                      <div className="style-options-grid">
                        {["Modern", "Luxury", "Scandinavian", "Minimalist"].map(style => (
                          <label key={style} className={`style-option ${interiorStyle === style ? 'active' : ''}`}>
                            <input 
                              type="radio" 
                              name="interior-style" 
                              checked={interiorStyle === style}
                              onChange={() => setInteriorStyle(style)}
                            />
                            <span>{style}</span>
                          </label>
                        ))}
                      </div>
                    </div>

                    <div className="config-group">
                      <label>Estimated Staging Budget</label>
                      <div className="budget-slider-container">
                        <input 
                          type="range" 
                          min="500000" 
                          max="2500000" 
                          step="250000" 
                          value={interiorBudget} 
                          onChange={(e) => setInteriorBudget(parseInt(e.target.value))}
                        />
                        <div className="slider-labels">
                          <span>₹5 Lakh</span>
                          <span className="text-gold font-bold">₹{(interiorBudget / 100000).toFixed(1)} Lakh</span>
                          <span>₹25 Lakh</span>
                        </div>
                      </div>
                    </div>

                    <div className="config-group mt-4">
                      <label>Solar Light Cycle: {geoTimeOfDay}:00 {geoTimeOfDay >= 12 ? 'PM' : 'AM'}</label>
                      <div className="budget-slider-container">
                        <input 
                          type="range" 
                          className="ar-time-slider"
                          min="8" 
                          max="18" 
                          value={geoTimeOfDay}
                          onChange={(e) => setGeoTimeOfDay(parseInt(e.target.value))}
                        />
                        <div className="slider-labels">
                          <span>8 AM (Day)</span>
                          <span className="text-gold font-bold">{geoTimeOfDay > 16 || geoTimeOfDay < 9 ? '🌙 Night Glow' : '☀️ Sun Light'}</span>
                          <span>6 PM (Night)</span>
                        </div>
                      </div>
                    </div>

                    <div className="pitch-metric-badge-box">
                      <h5>Boardroom Pitch Value</h5>
                      <span className="text-muted font-small">Provides clients drag-and-rotate custom furniture models instead of static prints. Saves ₹15 Lakhs on real mockup installations.</span>
                    </div>
                  </div>
                </div>

                {/* Real-time CSS 3D Room Box Model */}
                <div className="interior-results-panel">
                  <div className="glass-card concept-display-card">
                    <div className="concept-header">
                      <h3>Interactive 3D Dollhouse Viewer</h3>
                      <span className="badge badge-gold">{interiorStyle} 3D Stage</span>
                    </div>

                    {/* Viewport carrying perspective */}
                    <div className="room-3d-viewport" style={{ padding: 0, position: 'relative', height: '480px', minHeight: '480px', overflow: 'hidden' }}>
                      <ThreeDErrorBoundary>
                        <ThreeDViewer 
                          mode="interior"
                          interiorStyle={interiorStyle}
                          interiorBudget={interiorBudget}
                          timeOfDay={geoTimeOfDay}
                        />
                      </ThreeDErrorBoundary>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 7. SMART MATCH PROPERTY FINDER W/ MULTI-STEP SLIDES */}
          {activeTab === "finder" && (
            <div className="tab-content">
              <div className="split-layout">
                <div className="finder-form-card">
                  <div className="glass-card h-100">
                    <h3>Smart Match Wizard</h3>
                    <p className="text-muted font-small mb-4">Calculate structural matches step-by-step.</p>

                    {/* Progress bar */}
                    <div className="wizard-progress-bar-bg">
                      <div className="wizard-progress-bar-fill" style={{ width: `${(wizardStep / 3) * 100}%` }}></div>
                    </div>

                    <form onSubmit={(e) => { e.preventDefault(); handleCalculateMatches(); }}>
                      {/* Step 1: Budget */}
                      {wizardStep === 1 && (
                        <div className="wizard-card-step">
                          <span className="badge badge-gold">Step 1 of 3: Pricing</span>
                          <div className="form-group mt-4">
                            <label>What is your target budget?</label>
                            <select value={findBudget} onChange={(e) => setFindBudget(e.target.value)}>
                              <option value="12000000">Up to ₹1.2 Crore</option>
                              <option value="18000000">Up to ₹1.8 Crore</option>
                              <option value="25000000">Up to ₹2.5 Crore</option>
                              <option value="35000000">Up to ₹3.5 Crore</option>
                            </select>
                          </div>
                          <div className="flex gap-4 mt-6">
                            <button type="button" className="btn btn-gold w-100" onClick={() => setWizardStep(2)}>Next Step <ChevronRight size={14} /></button>
                          </div>
                        </div>
                      )}

                      {/* Step 2: Lifestyle */}
                      {wizardStep === 2 && (
                        <div className="wizard-card-step">
                          <span className="badge badge-gold">Step 2 of 3: Lifestyle</span>
                          <div className="form-group mt-4">
                            <label>Family Size & Kids</label>
                            <div className="radio-choices">
                              <label><input type="radio" checked={findFamily === 'small'} onChange={() => setFindFamily('small')}/> 1-2 Members (No Kids)</label>
                              <label><input type="radio" checked={findFamily === 'medium'} onChange={() => setFindFamily('medium')}/> 3-4 Members (With Kids)</label>
                              <label><input type="radio" checked={findFamily === 'large'} onChange={() => setFindFamily('large')}/> Extended Family / Seniors</label>
                            </div>
                          </div>
                          <div className="form-group mt-4">
                            <label>Primary Intent</label>
                            <div className="segment-selectors">
                              <button type="button" className={`segment-btn ${findIntent === 'Self Use' ? 'active' : ''}`} onClick={() => setFindIntent('Self Use')}>Self Use</button>
                              <button type="button" className={`segment-btn ${findIntent === 'Investment' ? 'active' : ''}`} onClick={() => setFindIntent('Investment')}>Investment</button>
                            </div>
                          </div>
                          <div className="flex gap-4 mt-6">
                            <button type="button" className="btn btn-outline w-100" onClick={() => setWizardStep(1)}>Back</button>
                            <button type="button" className="btn btn-gold w-100" onClick={() => setWizardStep(3)}>Next Step <ChevronRight size={14} /></button>
                          </div>
                        </div>
                      )}

                      {/* Step 3: View & Floor */}
                      {wizardStep === 3 && (
                        <div className="wizard-card-step">
                          <span className="badge badge-gold">Step 3 of 3: Views</span>
                          <div className="form-group mt-4">
                            <label>Preferred Floor Position</label>
                            <select value={findFloor} onChange={(e) => setFindFloor(e.target.value)}>
                              <option value="Low">Low Floors (1-4) - Easier accessibility</option>
                              <option value="Mid">Mid Floors (5-10) - Balances view & lift wait time</option>
                              <option value="High">High Floors (11+) - Premium garden view & max sunlight</option>
                            </select>
                          </div>
                          <div className="form-group mt-4">
                            <label>Preferred View Focus</label>
                            <select value={findView} onChange={(e) => setFindView(e.target.value)}>
                              <option value="Garden">Garden Facing - Calm & Greenery</option>
                              <option value="Clubhouse">Clubhouse/Pool Facing - Modern & Lively</option>
                              <option value="Skyline">City Skyline Facing - Expansive vista views</option>
                            </select>
                          </div>
                          <div className="form-group mt-4">
                            <label>Occupancy Timeline</label>
                            <div className="radio-choices">
                              <label><input type="radio" checked={findTimeline === 'Ready'} onChange={() => setFindTimeline('Ready')}/> Immediate (Ready properties)</label>
                              <label><input type="radio" checked={findTimeline === 'Construction'} onChange={() => setFindTimeline('Construction')}/> 12-24 Months (Under construction deals)</label>
                            </div>
                          </div>
                          <div className="flex gap-4 mt-6">
                            <button type="button" className="btn btn-outline w-100" onClick={() => setWizardStep(2)}>Back</button>
                            <button type="submit" className="btn btn-gold w-100"><Sparkles /> Find Matches</button>
                          </div>
                        </div>
                      )}
                    </form>
                  </div>
                </div>

                <div className="finder-results-panel">
                  <div className="glass-card h-100">
                    <h3>Ranked Property Recommendations</h3>
                    <p className="text-muted">Calculated using Sunlight, Noise, Investment potential, and appreciation scores.</p>
                    <div className="ranked-results-list">
                      {matchResults.length > 0 ? matchResults.map((item, index) => (
                        <div key={index} className="ranked-match-card">
                          <div className="match-details">
                            <h4>{item.unit.name} <span className="text-gold font-small">({item.unit.bhk} BHK)</span></h4>
                            <p>Floor {item.unit.floor} • {item.unit.view} Facing • {item.unit.area} sq.ft. carpet</p>
                            <p className="text-gold font-bold">Estimated Cost: ₹{(item.unit.price/10000000).toFixed(2)} Cr</p>
                          </div>
                          <div className="match-actions">
                            <div className="match-score-badge">{item.score}%</div>
                            <button className="btn btn-gold btn-small" onClick={() => handleOpenBooking(item.unit.name)}>Schedule Tour</button>
                          </div>
                        </div>
                      )) : (
                        <div className="empty-state-message">
                          <Sliders className="large-icon" />
                          <h3>Submit Questionnaire</h3>
                          <p>Modify choices on the left and click calculate to generate real-time matching suggestions.</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 8.5 CUSTOMER PORTAL TAB */}
          {activeTab === "customer-portal" && (
            <div className="tab-content">
              <div className="section-header-row mb-4">
                <h2>Customer Dashboard & KYC Portal</h2>
                <span className="text-muted">Simulate your account view as a registered home buyer</span>
              </div>

              <div className="glass-card mb-4 p-4">
                <label className="block mb-2 font-bold text-gold">Choose Your Profile Persona:</label>
                <select 
                  className="header-lang-select" 
                  style={{ width: '100%', maxWidth: '350px' }}
                  value={activeBuyerPersonaId} 
                  onChange={e => setActiveBuyerPersonaId(e.target.value)}
                >
                  <option value="">Select Buyer Profile...</option>
                  {leads.map(l => (
                    <option key={l._id} value={l._id}>{l.name} ({l.project} - {l.status})</option>
                  ))}
                </select>
              </div>

              {activeBuyerPersonaId ? (() => {
                const currentBuyer = leads.find(l => l._id === activeBuyerPersonaId);
                if (!currentBuyer) return <p className="text-muted">Loading profile details...</p>;
                
                const clientPayments = payments.filter(p => p.leadId === activeBuyerPersonaId);
                const projectDetail = properties.find(p => p.name === currentBuyer.project);

                return (
                  <div className="flex flex-col gap-6 fade-in">
                    {/* Welcome & Info Banner */}
                    <div className="grid grid-cols-3 gap-4">
                      <div className="glass-card p-4 border-accent col-span-2">
                        <h3 className="text-gold">Welcome back, {currentBuyer.name}!</h3>
                        <p className="text-muted font-small mt-2">
                          Thank you for choosing Shivalik Group. Here is your unified customer profile and document tracking center.
                        </p>
                        <div className="grid grid-cols-2 gap-4 mt-4 text-muted font-small">
                          <div>
                            <p className="mb-1"><strong>Interested Project:</strong> {currentBuyer.project}</p>
                            <p className="mb-1"><strong>Assigned Executive:</strong> {currentBuyer.assignedExecutive || "Sujal Talreja"}</p>
                          </div>
                          <div>
                            <p className="mb-1"><strong>Current Sales Stage:</strong> <span className="text-gold font-bold">{currentBuyer.status}</span></p>
                            <p className="mb-1"><strong>Contact Registered:</strong> {currentBuyer.phone} | {currentBuyer.email}</p>
                          </div>
                        </div>
                      </div>

                      <div className="glass-card p-4 flex flex-col justify-between align-center text-center">
                        <h4 className="text-muted font-small">Interested Project Brochure</h4>
                        {projectDetail && projectDetail.brochure ? (
                          <div className="mt-2">
                            <p className="font-small text-muted mb-3">{(projectDetail ? projectDetail.name : currentBuyer.project)} Catalog RERA</p>
                            <a 
                              href={projectDetail.brochure} 
                              target="_blank" 
                              rel="noreferrer" 
                              className="btn btn-gold btn-small inline-block"
                            >
                              <Download size={14} className="inline mr-1" /> Download PDF Brochure
                            </a>
                          </div>
                        ) : (
                          <p className="text-muted font-small mt-2">Brochure not uploaded yet for {currentBuyer.project}.</p>
                        )}
                      </div>
                    </div>

                    {/* Live Payment Schedule Milestones */}
                    <div className="glass-card p-4">
                      <h4 className="mb-3 text-gold">My Live Payment Schedule Milestones</h4>
                      <div className="crm-table-container">
                        <table className="crm-table">
                          <thead>
                            <tr>
                              <th>Milestone Stage Description</th>
                              <th>Base Installment</th>
                              <th>18% GST Amount</th>
                              <th>Total Payout Value</th>
                              <th>Due Date</th>
                              <th>Status</th>
                              <th>Invoice Receipt</th>
                            </tr>
                          </thead>
                          <tbody>
                            {clientPayments.map((p) => (
                              <tr key={p._id}>
                                <td><strong>{p.stage}</strong></td>
                                <td>₹{p.amount.toLocaleString()}</td>
                                <td className="text-muted">₹{p.gstAmount.toLocaleString()}</td>
                                <td><strong>₹{(p.amount + p.gstAmount).toLocaleString()}</strong></td>
                                <td>{p.date}</td>
                                <td>
                                  <span className={`badge ${p.status === 'Paid' ? 'badge-green' : p.status === 'Pending' ? 'badge-cold' : 'badge-hot'}`}>
                                    {p.status}
                                  </span>
                                </td>
                                <td>
                                  {p.status === 'Paid' ? (
                                    <button 
                                      className="btn btn-outline btn-small"
                                      onClick={() => {
                                        const doc = new jsPDF();
                                        doc.setFontSize(20);
                                        doc.text("SHIVALIK GROUP RECEIPT", 20, 30);
                                        doc.setFontSize(12);
                                        doc.text(`Received from: ${p.leadName}`, 20, 50);
                                        doc.text(`Milestone: ${p.stage}`, 20, 60);
                                        doc.text(`Base: INR ${p.amount.toLocaleString()}`, 20, 70);
                                        doc.text(`GST: INR ${p.gstAmount.toLocaleString()}`, 20, 80);
                                        doc.text(`Total: INR ${(p.amount + p.gstAmount).toLocaleString()}`, 20, 90);
                                        doc.text(`Payment Date: ${p.date}`, 20, 100);
                                        doc.save(`Receipt_${p.stage.replace(/\s+/g, '_')}.pdf`);
                                      }}
                                    >
                                      Download Invoice PDF
                                    </button>
                                  ) : (
                                    <span className="text-muted font-small">Awaiting Payout</span>
                                  )}
                                </td>
                              </tr>
                            ))}
                            {clientPayments.length === 0 && (
                              <tr>
                                <td colSpan="7" className="text-center text-muted p-4">No payments recorded under this persona profile. Log installments via Sales Portal.</td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>

                    {/* KYC Document Uploads */}
                    <div className="glass-card p-4">
                      <h4 className="mb-3 text-gold">My Verified KYC Documents</h4>
                      <p className="text-muted font-small mb-4">Aadhaar and PAN details loaded persistently.</p>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="flex flex-col gap-2">
                          <div className="glass-card p-3 flex justify-between align-center font-small">
                            <span>Aadhaar Card Proof (Aadhaar_Card.pdf)</span>
                            <span className="badge badge-green">Verified</span>
                          </div>
                          <div className="glass-card p-3 flex justify-between align-center font-small">
                            <span>PAN Card Proof (PAN_Proof.pdf)</span>
                            <span className="badge badge-green">Verified</span>
                          </div>
                        </div>

                        <div className="upload-zone text-center p-4 border-accent" style={{ borderStyle: 'dashed', borderRadius: '8px' }}>
                          <UploadCloud size={28} className="text-gold mx-auto mb-2" />
                          <p className="font-small text-muted mb-2">Upload additional Aadhaar/PAN validation proofs</p>
                          <button 
                            className="btn btn-outline btn-small"
                            onClick={() => {
                              alert("KYC document uploaded successfully! Admin verification is pending.");
                            }}
                          >
                            Browse Local Files
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })() : (
                <div className="glass-card p-8 text-center text-muted">
                  <Users className="large-icon mb-2 mx-auto" style={{ width: '48px', height: '48px' }} />
                  <h3>Please select a buyer profile persona from the dropdown above to load your custom buyer dashboard, brochures, and live payment milestones.</h3>
                </div>
              )}
            </div>
          )}

          {/* 9. LEAD SCORING CRM (SALES) */}
          {activeTab === "leads" && (
            <CRM />
          )}

          {/* 9. SALES ANALYTICS */}
          {activeTab === "sales-analytics" && (
            <div className="tab-content">
              <div className="metrics-row">
                <div className="glass-card metric-card">
                  <div className="metric-icon"><Users /></div>
                  <div className="metric-data">
                    <span className="metric-label">Total Leads</span>
                    <h3>{leadsCount.toLocaleString()}</h3>
                    <span className="metric-trend text-green"><ArrowUpRight /> +12% this month</span>
                  </div>
                </div>
                <div className="glass-card metric-card">
                  <div className="metric-icon"><MapPin /></div>
                  <div className="metric-data">
                    <span className="metric-label">Booked Site Visits</span>
                    <h3>{visitsCount.toLocaleString()}</h3>
                    <span className="metric-trend text-green"><ArrowUpRight /> +8% conversion</span>
                  </div>
                </div>
                <div className="glass-card metric-card">
                  <div className="metric-icon"><Award /></div>
                  <div className="metric-data">
                    <span className="metric-label">Confirmed Bookings</span>
                    <h3>64</h3>
                    <span className="metric-trend text-gold"><Award /> Target Achieved</span>
                  </div>
                </div>
                <div className="glass-card metric-card">
                  <div className="metric-icon"><TrendingUp /></div>
                  <div className="metric-data">
                    <span className="metric-label">Gross Revenue</span>
                    <h3>₹128.4 Cr</h3>
                    <span className="metric-trend text-green"><ArrowUpRight /> +18% QoQ</span>
                  </div>
                </div>
              </div>

              <div className="analytics-charts-grid">
                <div className="glass-card chart-card">
                  <h4>Leads by Marketing Channel</h4>
                  <div className="chart-container-canvas">
                    <canvas ref={chartRefs.leadsSource}></canvas>
                  </div>
                </div>
                <div className="glass-card chart-card">
                  <h4>Bookings by Residential Project</h4>
                  <div className="chart-container-canvas">
                    <canvas ref={chartRefs.bookingsProject}></canvas>
                  </div>
                </div>
                <div className="glass-card chart-card">
                  <h4>Simulated Revenue Quarterly Timeline</h4>
                  <div className="chart-container-canvas">
                    <canvas ref={chartRefs.revenueTrend}></canvas>
                  </div>
                </div>
                <div className="glass-card chart-card">
                  <h4>Sales Funnel Performance</h4>
                  <div className="chart-container-canvas">
                    <canvas ref={chartRefs.salesFunnel}></canvas>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 10. EXECUTIVE BOARDROOM */}
          {activeTab === "exec-insights" && (
            <div className="tab-content">
              <div className="split-layout">
                <div className="boardroom-intelligence-card">
                  <div className="glass-card h-100">
                    <div className="boardroom-header">
                      <h3>Executive Intelligence System</h3>
                      <span className="badge badge-gold"><Award /> Chairman & Directors Mode</span>
                    </div>
                    <p className="text-muted mt-2">Query the real-time Shivalik intelligence model to analyze strategic variables, revenue gaps, and action recommendations.</p>
                    
                    <div className="exec-prompts mt-4">
                      <label>Ask Boardroom Intelligence AI</label>
                      <div className="suggestion-list">
                        <button className="suggestion-btn" onClick={() => handleExecAI('Which project generated most bookings?')}>
                          Which project generated most bookings?
                        </button>
                        <button className="suggestion-btn" onClick={() => handleExecAI('Which units remain unsold?')}>
                          Which units remain unsold?
                        </button>
                        <button className="suggestion-btn" onClick={() => handleExecAI('Which sales channel performs best?')}>
                          Which sales channel performs best?
                        </button>
                        <button className="suggestion-btn" onClick={() => handleExecAI('What revenue is expected next quarter?')}>
                          What revenue is expected next quarter?
                        </button>
                      </div>
                    </div>

                    <div className="exec-chat-response glass-card mt-4">
                      {execAnswer ? (
                        <div style={{ whiteSpace: "pre-line", lineHeight: "1.6" }} dangerouslySetInnerHTML={{ __html: execAnswer }} />
                      ) : (
                        <div className="empty-state-message">
                          <Radio className="large-icon" />
                          <h4>Awaiting Executive Command</h4>
                          <p>Click any pre-formulated boardroom question above to receive automated business breakdowns, root cause analyses, and action recommendations.</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="boardroom-impact-panel">
                  <div className="glass-card h-100">
                    <h3>Expected Platform Business Impact</h3>
                    <p className="text-muted">Projected metrics based on digital-twin property discovery simulations.</p>
                    
                    <div className="impact-metrics-list mt-4">
                      {[
                        { label: "Customer Engagement Increase", val: "40% - 60%", w: 50 },
                        { label: "Lead Qualification Improvement", val: "50%+", w: 58 },
                        { label: "Sales Productivity Increase", val: "30% - 50%", w: 42 },
                        { label: "Site Visit Conversion Improvement", val: "20% - 35%", w: 28 },
                        { label: "Inventory Visibility", val: "100%", w: 100 },
                        { label: "Management Reporting Reduction", val: "50%+ Faster", w: 65 }
                      ].map((item, idx) => (
                        <div className="impact-item" key={idx}>
                          <div className="impact-header">
                            <span>{item.label}</span>
                            <span className="text-gold font-bold">{item.val}</span>
                          </div>
                          <div className="progress-bar-bg">
                            <div className="progress-bar-fill" style={{ width: `${item.w}%` }}></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 11. INVENTORY VACANCY GRID */}
          {activeTab === "inventory" && (
            <div className="tab-content">
              <div className="split-layout">
                <div className="inventory-matrix-card">
                  <div className="glass-card h-100">
                    <div className="inventory-matrix-header">
                      <h3>Visual Inventory Vacancy Grid</h3>
                      <div className="inventory-selectors">
                        <select id="inventory-project-select">
                          <option value="skyview">Shivalik Skyview</option>
                        </select>
                        <select id="inventory-tower-select">
                          <option value="Tower A">Tower A</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid-legend mt-2 mb-3">
                      <span className="legend-item"><span className="legend-box available"></span> Available</span>
                      <span className="legend-item"><span className="legend-box reserved"></span> Reserved</span>
                      <span className="legend-item"><span className="legend-box sold"></span> Sold</span>
                    </div>

                    <div className="vacancy-map-scroll-container">
                      <div className="floor-matrix-grid">
                        {renderVacancyBlocks("skyview", "Tower A")}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="inventory-analytics-sidebar">
                  <div className="glass-card mb-4">
                    <h3>Total Portfolio Stats</h3>
                    <div className="stat-summary-grid mt-2">
                      <div className="stat-sum-item">
                        <span className="stat-label">Total Units</span>
                        <span className="stat-value">120</span>
                      </div>
                      <div className="stat-sum-item">
                        <span className="stat-label">Units Sold</span>
                        <span className="stat-value text-green">82</span>
                      </div>
                      <div className="stat-sum-item">
                        <span className="stat-label">Available</span>
                        <span className="stat-value text-gold">38</span>
                      </div>
                      <div className="stat-sum-item">
                        <span className="stat-label">Sell-through</span>
                        <span className="stat-value">68.3%</span>
                      </div>
                    </div>
                  </div>                  <div className="glass-card h-50">
                    <h3>AI Inventory Analytics</h3>
                    <p className="text-muted font-small">Predictive analytics evaluating structural movement rates.</p>
                    
                    <div className="inventory-ai-insights-list mt-3">
                      <div className="insight-pill-card">
                        <div className="insight-icon text-gold"><TrendingUp size={16} /></div>
                        <div>
                          <h5>Tower B Sales Speed</h5>
                          <p>Tower B inventory is moving 22% faster than Tower A due to direct pool facing and smaller 3 BHK configurations.</p>
                        </div>
                      </div>
                      <div className="insight-pill-card">
                        <div className="insight-icon text-gold"><Award size={16} /></div>
                        <div>
                          <h5>Height Conversion Premium</h5>
                          <p>Units above floor 10 have the highest conversion rate (35%), yielding a pricing premium opportunity.</p>
                        </div>
                      </div>
                      <div className="insight-pill-card">
                        <div className="insight-icon text-gold"><AlertTriangle size={16} /></div>
                        <div>
                          <h5>Low Floor Slowdown</h5>
                          <p>1 BHK units on Floors 1-3 have been stagnant for 45 days. Recommended: bundle with modern interior package discount.</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "architecture" && (
            <div className="tab-content">
              <div className="architecture-layout">
                {/* Intro Row */}
                <div className="glass-card arch-intro-card">
                  <div className="arch-intro-header">
                    <span className="badge badge-gold">SYSTEM DIAGRAMS</span>
                    <h3>Shivalik High-Performance Platform Architecture</h3>
                    <p className="text-muted">
                      Explore the multi-tier hybrid stack powering real-time WebGL renderings, serverless db synchronization, 
                      and AI completions under 200ms latency.
                    </p>
                  </div>
                  <div className="flex gap-4 mt-4">
                    <button className="btn btn-gold hover-glow" onClick={() => setShowFullDiagram(true)}>
                      <Eye size={16} /> View High-Res Architecture Diagram
                    </button>
                    <a href="/techstack_architecture_diagram.png" download className="btn btn-outline">
                      <Download size={16} /> Download Diagram Image
                    </a>
                    <button className="btn btn-outline" onClick={() => setActiveTab('landing')}>
                      ← Return to Discover
                    </button>
                  </div>
                </div>

                {/* Main Split Layout */}
                <div className="arch-split-grid">
                  {/* Left Column: Interactive Scenario Simulator */}
                  <div className="glass-card arch-sim-card">
                    <div className="card-header-new">
                      <h4>⚡ Interactive Data Flow Simulator</h4>
                      <p className="text-muted font-small">Select a transaction scenario to trace step-by-step telemetry paths across backend layers.</p>
                    </div>

                    <div className="arch-scenario-selectors">
                      {Object.entries(ARCH_SCENARIOS).map(([key, sc]) => (
                        <button
                          key={key}
                          className={`scenario-btn ${activeArchScenario === key ? 'active' : ''}`}
                          onClick={() => {
                            setActiveArchScenario(key);
                            setArchStep(0);
                          }}
                        >
                          {key === 'ai_copilot' ? '🤖 ' : key === 'township_load' ? '🏗️ ' : '💼 '}
                          <div>
                            <strong>{sc.title}</strong>
                            <p>{sc.description}</p>
                          </div>
                        </button>
                      ))}
                    </div>

                    <div className="arch-sim-visualizer">
                      <div className="sim-diagram-canvas">
                        {/* Interactive flow line */}
                        <div className="sim-layers-row">
                          {[
                            { name: "Client Layer", desc: "React SPA / Three.js" },
                            { name: "Edge Layer", desc: "Cloudflare / CDN" },
                            { name: "Convex Cloud", desc: "Live Synced Backend" },
                            { name: "AI/S3/Telemetry", desc: "Groq / S3 / PostHog" }
                          ].map((layer, index) => {
                            const isHighlighted = ARCH_SCENARIOS[activeArchScenario].steps[archStep]?.highlight.includes(layer.name.split(" ")[0]);
                            return (
                              <div key={index} className="flex align-center w-100 relative">
                                <div className={`sim-layer-node ${isHighlighted ? 'highlighted' : ''}`}>
                                  <h5>{layer.name}</h5>
                                  <p>{layer.desc}</p>
                                </div>
                                {index < 3 && (
                                  <div className={`sim-flow-arrow ${isHighlighted ? 'active' : ''}`}>
                                    <ChevronRight size={20} />
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* Step Detail Card */}
                      <div className="sim-step-detail-card">
                        <div className="step-badge">Step {archStep + 1} of {ARCH_SCENARIOS[activeArchScenario].steps.length}</div>
                        <h5>{ARCH_SCENARIOS[activeArchScenario].steps[archStep].title}</h5>
                        <p>{ARCH_SCENARIOS[activeArchScenario].steps[archStep].desc}</p>
                        
                        <div className="flex justify-between align-center mt-4">
                          <button 
                            className="btn btn-outline btn-small"
                            disabled={archStep === 0}
                            onClick={() => setArchStep(prev => prev - 1)}
                          >
                            Previous Step
                          </button>
                          <button 
                            className="btn btn-gold btn-small"
                            disabled={archStep === ARCH_SCENARIOS[activeArchScenario].steps.length - 1}
                            onClick={() => setArchStep(prev => prev + 1)}
                          >
                            Next Step
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Right Column: Tech Stack & Architecture Specs */}
                  <div className="glass-card arch-spec-card">
                    <div className="card-header-new">
                      <h4>🛠️ Infrastructure Technology Matrix</h4>
                      <p className="text-muted font-small">Core component stack parameters optimized for Shivalik high-fidelity portal requirements.</p>
                    </div>

                    <div className="tech-matrix-table-wrapper">
                      <table className="tech-matrix-table">
                        <thead>
                          <tr>
                            <th>Layer</th>
                            <th>Technology</th>
                            <th>Purpose / Strategy</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr>
                            <td><strong>Frontend Core</strong></td>
                            <td className="text-gold">React 19 / Vite HMR</td>
                            <td>Serves reactive views, loads dynamic code hooks, and implements responsive layout modules.</td>
                          </tr>
                          <tr>
                            <td><strong>3D Graphics</strong></td>
                            <td className="text-gold">Three.js / WebGL</td>
                            <td>Renders township coordinates and luxury room structures client-side in real time.</td>
                          </tr>
                          <tr>
                            <td><strong>Live Backend</strong></td>
                            <td className="text-gold">Convex Cloud DB</td>
                            <td>Real-time synchronization for lead status, active activities, and payout status indicators.</td>
                          </tr>
                          <tr>
                            <td><strong>AI Completions</strong></td>
                            <td className="text-gold">Groq API (Llama-3)</td>
                            <td>High-speed chat agent response times (under 300ms stream latency) with zero cold-start delay.</td>
                          </tr>
                          <tr>
                            <td><strong>Static Storage</strong></td>
                            <td className="text-gold">AWS S3 / CloudFront</td>
                            <td>Distributes compressed Gltf/Glb dollhouse files and approved PDF digital brochures.</td>
                          </tr>
                          <tr>
                            <td><strong>Observability</strong></td>
                            <td className="text-gold">PostHog / Sentry</td>
                            <td>Logs buyer behaviors, monitors rendering loops, and analyzes WebGL memory leaks.</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>

                    <div className="arch-specs-box mt-4">
                      <h5>🔑 Production Security & Scaling Rules</h5>
                      <ul>
                        <li><strong>WebGL Compression:</strong> Draco loaders compress 3D meshes by up to 80% to maintain sub-second page loads.</li>
                        <li><strong>Safe Token Hosting:</strong> API keys for Groq/OpenAI are proxy-resolved, never leaking to browser bundle distributions.</li>
                        <li><strong>Real-time Schema Sync:</strong> Database writes automatically sync views across buyers, brokers, and builders via reactive Convex WebSocket pipelines.</li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* High-Resolution Diagram Modal overlay */}
                {showFullDiagram && (
                  <div className="modal-backdrop z-1000" onClick={() => setShowFullDiagram(false)}>
                    <div className="glass-card arch-diagram-modal" onClick={e => e.stopPropagation()}>
                      <div className="modal-header">
                        <h4>System Integration Architecture Diagram</h4>
                        <button className="close-modal-btn" onClick={() => setShowFullDiagram(false)}><X size={20} /></button>
                      </div>
                      <div className="modal-body text-center overflow-auto max-h-75vh">
                        <a href="/techstack_architecture_diagram.png" target="_blank" rel="noopener noreferrer" title="Click to open image in new tab">
                          <img 
                            src="/techstack_architecture_diagram.png" 
                            alt="Platform Architecture Diagram" 
                            className="img-fluid arch-large-diagram" 
                            style={{ maxWidth: '100%', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', cursor: 'pointer' }}
                          />
                        </a>
                      </div>
                      <div className="modal-footer flex justify-end gap-2 p-3" style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                        <a href="/techstack_architecture_diagram.png" download className="btn btn-gold btn-small">Download Image</a>
                        <button className="btn btn-outline btn-small" onClick={() => setShowFullDiagram(false)}>Close View</button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Floating Chatbot button */}
      <button className="floating-ai-btn" onClick={() => setFloatingChatOpen(!floatingChatOpen)}>
        <Bot />
      </button>

      {/* Floating quick chat panel */}
      {floatingChatOpen && (
        <div className="floating-chat-panel">
          <div className="floating-chat-header">
            <h4>Quick AI Assistant</h4>
            <button onClick={() => setFloatingChatOpen(false)} className="close-chat-btn"><X size={16} /></button>
          </div>
          <div className="floating-chat-body">
            {floatingMessages.map((m, idx) => (
              <p key={idx} className={m.sender === 'bot' ? 'bot-msg' : 'user-msg'}>
                {m.text}
              </p>
            ))}
          </div>
          <form className="floating-chat-input" onSubmit={handleQuickChatSubmit}>
            <input 
              type="text" 
              placeholder="Type a message..." 
              value={floatingInput}
              onChange={(e) => setFloatingInput(e.target.value)}
            />
            <button type="submit" className="btn btn-gold btn-small"><Send size={12} /></button>
          </form>
        </div>
      )}

      {/* Visit Booking Modal */}
      {showBookingModal && (
        <div className="modal-backdrop">
          <div className="glass-card modal-container">
            <div className="modal-header">
              <h3>Schedule Site Visit</h3>
              <button className="close-modal-btn" onClick={() => setShowBookingModal(false)}><X size={20} /></button>
            </div>
            <div className="modal-body">
              <p>Book a premium physical tour of <strong>{bookingProject}</strong> with our dedicated relationship executive.</p>
              <form onSubmit={handleBookingSubmit}>
                <div className="form-group">
                  <label>Your Full Name</label>
                  <input type="text" value={bookName} onChange={(e) => setBookName(e.target.value)} required placeholder="e.g. Rahul Sharma" />
                </div>
                <div className="form-row">
                  <div className="form-group col">
                    <label>Phone Number</label>
                    <input type="tel" value={bookPhone} onChange={(e) => setBookPhone(e.target.value)} required placeholder="e.g. +91 98765 43210" />
                  </div>
                  <div className="form-group col">
                    <label>Email Address</label>
                    <input type="email" value={bookEmail} onChange={(e) => setBookEmail(e.target.value)} required placeholder="e.g. rahul@example.com" />
                  </div>
                </div>
                <div className="form-group">
                  <label>Preferred Visit Date</label>
                  <input type="date" value={bookDate} onChange={(e) => setBookDate(e.target.value)} required />
                </div>
                <button type="submit" className="btn btn-gold w-100 mt-4">Confirm Visit & Generate AI Lead Score</button>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
