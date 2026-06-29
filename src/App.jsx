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
          <div style={{ color: '#D4AF37', fontSize: '18px', fontWeight: 700 }}>3D Engine Unavailable</div>
          <div style={{ fontSize: '13px', maxWidth: '340px', textAlign: 'center', lineHeight: 1.6 }}>
            Your browser or device does not support WebGL 3D rendering.
            Please try Chrome or Edge for the full 3D experience.
          </div>
          <button
            onClick={() => this.setState({ hasError: false, error: null })}
            style={{
              marginTop: '8px', padding: '8px 20px', background: 'rgba(212,175,55,0.15)',
              border: '1px solid rgba(212,175,55,0.4)', color: '#D4AF37',
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

export default function App() {
  const { t, i18n } = useTranslation();
  // Navigation & Role states
  const [activeTab, setActiveTab] = useState("landing");
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
              <div className="inline-bar-bg"><div className="inline-bar-fill" style={{ width: "88%", backgroundColor: "#D4AF37" }}></div></div>
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
              <div className="inline-bar-bg"><div className="inline-bar-fill" style={{ width: "85%", backgroundColor: "#D4AF37" }}></div></div>
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
    return locMatch && bhkMatch && statMatch;
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
              <button className={`nav-item ${activeTab === 'landing' ? 'active' : ''}`} onClick={() => setActiveTab('landing')}>
                <Home /> {t("Discover Projects")}
              </button>
              <button className={`nav-item ${activeTab === 'visualize' ? 'active' : ''}`} onClick={() => setActiveTab('visualize')}>
                <Layers /> {t("Property Visualization")}
              </button>
              <button className={`nav-item ${activeTab === '3d-township' ? 'active' : ''}`} onClick={() => setActiveTab('3d-township')}>
                <Building /> {t("3D Township Explorer")}
              </button>
              <button className={`nav-item ${activeTab === 'compare' ? 'active' : ''}`} onClick={() => setActiveTab('compare')}>
                <TrendingUp /> {t("Compare Properties")}
              </button>
              <button className={`nav-item ${activeTab === 'ai-advisor' ? 'active' : ''}`} onClick={() => setActiveTab('ai-advisor')}>
                <MessageSquare /> AI Advisor Chat
              </button>
              <button className={`nav-item ${activeTab === 'interior' ? 'active' : ''}`} onClick={() => setActiveTab('interior')}>
                <Paintbrush /> AI Interior Designer
              </button>
              <button className={`nav-item ${activeTab === 'finder' ? 'active' : ''}`} onClick={() => setActiveTab('finder')}>
                <Sparkles /> Smart Match Finder
              </button>
              <button className={`nav-item ${activeTab === 'customer-portal' ? 'active' : ''}`} onClick={() => setActiveTab('customer-portal')}>
                <FileCheck /> Customer Portal
              </button>
            </div>
          )}

          {role === "sales" && (
            <div className="nav-group">
              <div className="nav-group-title">Sales Intelligence</div>
              <button className={`nav-item ${activeTab === 'leads' ? 'active' : ''}`} onClick={() => setActiveTab('leads')}>
                <Users /> Lead Scoring CRM
              </button>
              <button className={`nav-item ${activeTab === 'sales-analytics' ? 'active' : ''}`} onClick={() => setActiveTab('sales-analytics')}>
                <BarChart2 /> Sales Analytics
              </button>
            </div>
          )}

          {role === "executive" && (
            <div className="nav-group">
              <div className="nav-group-title">Executive Boardroom</div>
              <button className={`nav-item ${activeTab === 'exec-insights' ? 'active' : ''}`} onClick={() => setActiveTab('exec-insights')}>
                <TrendingUp /> Executive Insights
              </button>
              <button className={`nav-item ${activeTab === 'inventory' ? 'active' : ''}`} onClick={() => setActiveTab('inventory')}>
                <Grid /> Inventory Vacancy Map
              </button>
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
              {activeTab === "compare" && "Property Comparison Matrix"}
              {activeTab === "ar-viewer" && "Boardroom AR/VR Pitch Center"}
              {activeTab === "interior" && "AI Real 3D Interior designer"}
              {activeTab === "finder" && "Smart Match Property Finder"}
              {activeTab === "leads" && "CRM Lead Intelligence"}
              {activeTab === "sales-analytics" && "Sales Revenue & Conversion Metrics"}
              {activeTab === "exec-insights" && "Executive Leadership Dashboard"}
              {activeTab === "inventory" && "Real-time Block Vacancy Map"}
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
              <div className="hero-banner">
                <div className="hero-overlay"></div>
                <div className="hero-content">
                  <span className="hero-tag">Shivalik Group Innovation</span>
                  <h1>Find Your Future Home with AI</h1>
                  <p>Experience India's first AI & AR-driven property discovery platform. Walk through floorplans, customize interiors, and identify premium investment potentials from the comfort of your couch.</p>
                  <div className="hero-actions-row">
                    <button className="btn btn-gold" onClick={() => setActiveTab('3d-township')}>Explore 3D Township</button>
                    <button className="btn btn-outline" onClick={() => setActiveTab('ai-advisor')}>Talk to AI Advisor</button>
                  </div>
                </div>
              </div>

              {/* Filters */}
              <div className="glass-card search-filter-card">
                <h3>Smart Filters</h3>
                <div className="filter-grid">
                  <div className="filter-item">
                    <label>Project Location</label>
                    <select value={filterLoc} onChange={(e) => setFilterLoc(e.target.value)}>
                      <option value="all">All Locations</option>
                      <option value="Ambawadi">Ambawadi</option>
                      <option value="SG Highway">SG Highway</option>
                      <option value="Bopal">Bopal</option>
                    </select>
                  </div>
                  <div className="filter-item">
                    <label>Configuration (BHK)</label>
                    <select value={filterBhk} onChange={(e) => setFilterBhk(e.target.value)}>
                      <option value="all">All BHKs</option>
                      <option value="3">3 BHK</option>
                      <option value="4">4 BHK</option>
                      <option value="5">5 BHK / Villa</option>
                    </select>
                  </div>
                  <div className="filter-item">
                    <label>Price Range</label>
                    <select value={filterPrice} onChange={(e) => setFilterPrice(e.target.value)}>
                      <option value="all">Any Price</option>
                      <option value="under2">Under ₹2.0 Crore</option>
                      <option value="over2">Above ₹2.0 Crore</option>
                    </select>
                  </div>
                  <div className="filter-item">
                    <label>Project Status</label>
                    <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
                      <option value="all">Any Status</option>
                      <option value="Ready">Ready to Move</option>
                      <option value="Construction">Under Construction</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="section-header-row">
                <h2>Featured Shivalik Projects</h2>
                <span className="text-muted">Showing simulated premium portfolio</span>
              </div>
              
              <div className="project-grid">
                {filteredProperties.map(p => (
                  <div key={p.id} className="glass-card project-card">
                    <div className="project-card-img-wrapper">
                      <img src={p.image} className="project-card-img" alt={p.name} />
                      <span className="project-status-tag">{p.status}</span>
                    </div>
                    <div className="project-card-body">
                      <h3>{p.name}</h3>
                      <div className="location-text"><MapPin /> {p.location}, Ahmedabad</div>
                      <p className="project-description">{p.description}</p>
                      <div className="project-card-footer">
                        <div className="price-tag">
                          <span className="label">Starting Price</span>
                          <span className="amount">₹{(p.price / 10000000).toFixed(2)} Cr</span>
                        </div>
                        <button className="btn btn-gold btn-small" onClick={() => handleOpenBooking(p.name)}>Book Site Visit</button>
                      </div>
                    </div>
                  </div>
                ))}
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
                        mode="township"
                        selectedTower={selectedTower}
                        onSelectTower={handleSelectTower}
                        onSelectAmenity={handleSelectAmenity}
                        highlightFloor={activeFloorAlert}
                        timeOfDay={geoTimeOfDay}
                      />
                    </ThreeDErrorBoundary>
                  </div>
                  <div className="helper-text-bar"><MousePointer /> Left-Click & Drag to rotate. Scroll to Zoom. Click Towers or Clubhouse Gym/Pool to sync details.</div>
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
                          <button className="btn btn-gold" onClick={() => { setActiveTab("ar-viewer"); setArSubTab("tabletop"); }}><Layout /> Launch Interactive AR Viewer</button>
                          <button className="btn btn-outline" onClick={() => { setCompare1(selectedTower === 'C' ? "high-604" : "sky-301"); setActiveTab("compare"); }}><GitCompare /> Compare in Matrix</button>
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
