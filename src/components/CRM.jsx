import React, { useState } from 'react';
import { 
  Activity, Edit, Plus, Trash2, Phone, Mail, MapPin, X, Calendar, 
  MessageSquare, FileText, Sparkles, Send, UploadCloud, CheckCircle, 
  Smartphone, Download, DollarSign, Briefcase, Award, TrendingUp, 
  Users, Shield, Clock, FileCheck, Check, UserPlus, FileSignature,
  Layout, Building
} from 'lucide-react';
import jsPDF from 'jspdf';
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";

export default function CRM() {
  // Convex Database Queries
  const leads = useQuery(api.leads?.getLeads);
  const activityStream = useQuery(api.activity?.getActivity);
  const inventory = useQuery(api.inventory?.getInventory);
  const properties = useQuery(api.properties?.getProperties);
  const builders = useQuery(api.crm?.getBuilders);
  const brokers = useQuery(api.crm?.getBrokers);
  const payments = useQuery(api.crm?.getPayments);
  const followups = useQuery(api.crm?.getFollowups);
  const siteVisits = useQuery(api.crm?.getSiteVisits);

  if (leads === undefined || payments === undefined || builders === undefined || brokers === undefined || followups === undefined) {
    return (
      <div className="flex align-center justify-center h-100 w-100" style={{ minHeight: '300px', color: '#D4AF37', flexDirection: 'column', gap: '10px' }}>
        <Activity className="animate-spin" size={24} />
        <p className="font-small">Retrieving CRM Database records...</p>
      </div>
    );
  }

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
