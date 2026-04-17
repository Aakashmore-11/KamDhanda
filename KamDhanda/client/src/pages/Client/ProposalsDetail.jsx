import React, { useEffect, useState } from "react";
import { serverObj } from "../../config/serverConfig";
import axios from "axios";
import {
  CheckCircle2,
  XCircle,
  Clock,
  User,
  IndianRupee,
  ChevronLeft,
  Calendar,
  Briefcase,
  Star,
  MessageSquare,
  Award,
  TrendingUp,
  Zap,
  Sparkles,
  X,
  Mail,
  Phone,
  MapPin,
  Globe,
  Github,
  Linkedin,
  Download,
  Eye,
  ThumbsUp,
  AlertCircle,
  Send,
} from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import Loader from "../../components/common/Loader";

const ProposalsDetail = () => {
  const serverAPI = serverObj.serverAPI;
  const { id } = useParams();
  const [project, setProject] = useState(null);
  const [recommendedFreelancers, setRecommendedFreelancers] = useState([]);
  const [selectedFreelancer, setSelectedFreelancer] = useState(null);
  const [isMessaging, setIsMessaging] = useState(false);
  const [messageText, setMessageText] = useState("");
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("proposals");
  const [expandedProposal, setExpandedProposal] = useState(null);
  const [notification, setNotification] = useState({ show: false, message: "", type: "" });
  const [moduleSetup, setModuleSetup] = useState({ show: false, proposalId: null, proposalAmount: 0, modules: [{ id: 1, title: 'Phase 1', description: '', amount: 0 }], amountConfig: 'auto' });
  const navigate = useNavigate();

  const fetchAllProposals = async () => {
    try {
      const res = await axios.get(
        `${serverAPI}/freelancerProject/get-allProposals`,
        { withCredentials: true, headers: { projectId: id } }
      );
      if (res.data) {
        setProject(res.data);
      }
    } catch (error) {
      console.error("Error fetching proposals:", error);
      showNotification("Failed to load proposals", "error");
    } finally {
      setLoading(false);
    }
  };

  const fetchRecommendedFreelancers = async () => {
    try {
      const res = await axios.get(
        `${serverAPI}/freelancerProject/${id}/recommended-freelancers`,
        { withCredentials: true }
      );
      if (res.data) {
        setRecommendedFreelancers(res.data);
      }
    } catch (error) {
      console.error("Error fetching recommended freelancers:", error);
    }
  };

  useEffect(() => {
    fetchAllProposals();
    fetchRecommendedFreelancers();
  }, []);

  const showNotification = (message, type) => {
    setNotification({ show: true, message, type });
    setTimeout(() => setNotification({ show: false, message: "", type: "" }), 3000);
  };

  const handleAcceptReject = async (proposalId, action, finalModules = null) => {
    try {
      const payload = { proposalId, _id: project._id };
      if (finalModules) payload.modules = finalModules;

      const res = await axios.patch(
        `${serverAPI}/freelancerProject/${action}-proposal`,
        payload,
        { withCredentials: true }
      );

      showNotification(
        `Proposal ${action === 'accept' ? 'accepted' : 'rejected'} successfully!`,
        "success"
      );
      if (action === "accept") setModuleSetup({ ...moduleSetup, show: false });
      fetchAllProposals();
    } catch (error) {
      console.error(`Error ${action}ing proposal:`, error);
      showNotification(`Failed to ${action} proposal`, "error");
    }
  };

  const handleHireClick = (proposal) => {
    setModuleSetup({
      show: true,
      proposalId: proposal._id,
      proposalAmount: proposal.bidAmount,
      modules: [{ id: Date.now(), title: 'Milestone 1', description: '', amount: proposal.bidAmount }],
      amountConfig: 'auto'
    });
  };

  const handleAddModule = () => {
    setModuleSetup(prev => {
      const newModules = [...prev.modules, { id: Date.now(), title: `Milestone ${prev.modules.length + 1}`, description: '', amount: 0 }];
      return { ...prev, modules: newModules };
    });
  };

  const updateModule = (id, field, value) => {
    setModuleSetup(prev => ({
      ...prev,
      modules: prev.modules.map(m => m.id === id ? { ...m, [field]: value } : m)
    }));
  };

  const removeModule = (id) => {
    setModuleSetup(prev => {
      if (prev.modules.length <= 1) return prev;
      return { ...prev, modules: prev.modules.filter(m => m.id !== id) };
    });
  };

  const confirmHireWithModules = () => {
    let finalModules = [...moduleSetup.modules];
    // Auto distribute amount if needed
    if (moduleSetup.amountConfig === 'auto') {
      const splitAmount = Math.floor(moduleSetup.proposalAmount / finalModules.length);
      const remainder = moduleSetup.proposalAmount % finalModules.length;
      finalModules = finalModules.map((m, i) => ({
        ...m,
        amount: splitAmount + (i === 0 ? remainder : 0) // give remainder to first module
      }));
    } else {
      const totalEntered = finalModules.reduce((sum, m) => sum + Number(m.amount), 0);
      if (totalEntered !== moduleSetup.proposalAmount) {
        showNotification("Total module amounts must equal the bid amount!", "error");
        return;
      }
    }

    // Map to db schema format
    const dbModules = finalModules.map(m => ({
      title: m.title,
      description: m.description,
      amount: m.amount
    }));

    handleAcceptReject(moduleSetup.proposalId, "accept", dbModules);
  };


  const getStatusBadge = (status) => {
    const statusConfig = {
      Accepted: {
        icon: CheckCircle2,
        bg: "bg-emerald-50",
        text: "text-emerald-700",
        border: "border-emerald-200",
        label: "Accepted"
      },
      Rejected: {
        icon: XCircle,
        bg: "bg-rose-50",
        text: "text-rose-700",
        border: "border-rose-200",
        label: "Rejected"
      },
      Pending: {
        icon: Clock,
        bg: "bg-amber-50",
        text: "text-amber-700",
        border: "border-amber-200",
        label: "Pending"
      }
    };

    const config = statusConfig[status] || statusConfig.Pending;
    const Icon = config.icon;

    return (
      <span className={`flex items-center px-3 py-1 text-xs font-medium ${config.bg} ${config.text} rounded-full border ${config.border}`}>
        <Icon className="w-3.5 h-3.5 mr-1" />
        {config.label}
      </span>
    );
  };

  const getMatchScoreColor = (score) => {
    if (score >= 90) return "from-emerald-500 to-green-500";
    if (score >= 75) return "from-blue-500 to-indigo-500";
    if (score >= 60) return "from-amber-500 to-orange-500";
    return "from-rose-500 to-pink-500";
  };

  const handleSendMessage = async () => {
    if (!messageText.trim()) return;

    try {
      const projectLink = `${window.location.origin}/seeker/project/${project._id}`;
      const finalMessage = `${messageText}\n\nProject Link: ${projectLink}`;

      await axios.post(
        `${serverAPI}/notification/send`,
        {
          recipientId: selectedFreelancer._id,
          message: finalMessage,
          projectId: project._id
        },
        { withCredentials: true }
      );
      showNotification("Message sent successfully!", "success");
      setIsMessaging(false);
      setMessageText("");
    } catch (error) {
      console.error("Error sending message:", error);
      showNotification("Failed to send message", "error");
    }
  };

  const closeModal = () => {
    setSelectedFreelancer(null);
    setIsMessaging(false);
    setMessageText("");
  };

  if (loading) return <Loader />;

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
      {/* Notification Toast */}
      {notification.show && (
        <div className={`fixed top-6 right-6 z-50 px-6 py-4 rounded-[2rem] shadow-2xl flex items-center gap-3 animate-slideIn ${notification.type === 'success' ? 'bg-emerald-500 text-white' : 'bg-rose-500 text-white'
          }`}>
          {notification.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 shadow-sm" />
          ) : (
            <AlertCircle className="w-5 h-5 shadow-sm" />
          )}
          <span className="font-black text-xs uppercase tracking-widest leading-none">
            {notification.message}
          </span>
        </div>
      )}

      <div className="w-full px-4 py-8 md:p-8 lg:p-12 xl:px-16">
        {/* Header with Back Button */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
          <button
            onClick={() => navigate(-1)}
            className="group flex items-center gap-3"
          >
            <div className="p-3 rounded-full bg-white shadow-xl group-hover:bg-slate-900 group-hover:text-white group-hover:-translate-x-1 transition-all">
              <ChevronLeft className="w-5 h-5" />
            </div>
            <div>
              <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest leading-tight">Project Portal</p>
              <h2 className="text-lg font-black text-slate-900 leading-tight">View Proposals</h2>
            </div>
          </button>

          <div className="flex items-center gap-4">
            <div className="px-5 py-2.5 bg-indigo-600/10 text-indigo-600 rounded-full border border-indigo-600/20">
              <span className="text-sm font-black mr-2 uppercase tracking-widest">Active Intake</span>
              <span className="px-3 py-1 bg-indigo-600 text-white rounded-full text-[10px] font-black">
                {project?.proposals?.length || 0}
              </span>
            </div>
          </div>
        </div>

        {/* Project Overview Card */}
        <div className="relative overflow-hidden bg-slate-900 p-8 md:p-12 rounded-[2.5rem] shadow-2xl mb-12 border border-slate-800">
          <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl -mr-48 -mt-48"></div>

          <div className="relative z-10 flex flex-col lg:flex-row justify-between items-start lg:items-end gap-10">
            <div className="max-w-3xl">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl">
                  <Briefcase className="w-8 h-8 text-indigo-400" />
                </div>
                <span className="px-3 py-1 bg-white/5 text-white/60 text-[10px] font-black uppercase tracking-widest rounded-full border border-white/10">Project Brief</span>
              </div>
              <h1 className="text-4xl md:text-5xl font-black text-white mb-6 leading-tight tracking-tight">{project?.title}</h1>
              <div className="flex flex-wrap items-center gap-6 text-sm mb-8">
                <span className="flex items-center text-slate-400 font-bold">
                  <Calendar className="w-4 h-4 mr-2 text-indigo-400" />
                  Intake started on {new Date(project?.createdAt).toLocaleDateString()}
                </span>
                <span className="flex items-center text-slate-400 font-bold">
                  <IndianRupee className="w-4 h-4 mr-1 text-emerald-400" />
                  <span className="text-white">₹{project?.minBudget?.toLocaleString()} - ₹{project?.maxBudget?.toLocaleString()}</span>
                  <span className="ml-2 text-indigo-400 uppercase tracking-widest text-[10px]">{project?.budgetType}</span>
                </span>
              </div>
              <p className="text-slate-400 text-lg font-medium leading-relaxed mb-10 border-l-4 border-indigo-600/30 pl-6">
                {project?.description}
              </p>
              <div className="flex flex-wrap gap-2">
                {project?.skills?.map((skill, index) => (
                  <span
                    key={index}
                    className="px-5 py-2 bg-white/5 text-white text-[11px] font-black uppercase tracking-widest rounded-xl border border-white/10 hover:bg-white/10 transition-all cursor-default"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Tabs Navigation */}
        <div className="flex gap-1 mb-10 p-1.5 bg-white border border-slate-200/60 rounded-[2rem] shadow-sm w-fit">
          <button
            onClick={() => setActiveTab("proposals")}
            className={`px-8 py-3.5 font-black text-[11px] uppercase tracking-widest rounded-full transition-all flex items-center gap-3 ${activeTab === "proposals"
              ? "bg-slate-900 text-white shadow-xl shadow-slate-900/10"
              : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
              }`}
          >
            Submitted Proposals
            {project?.proposals?.length > 0 && (
              <span className={`px-2 py-0.5 text-[9px] font-black rounded-full ${activeTab === "proposals"
                ? "bg-indigo-500 text-white"
                : "bg-slate-100 text-slate-500 shadow-inner"
                }`}>
                {project?.proposals?.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab("recommended")}
            className={`px-8 py-3.5 font-black text-[11px] uppercase tracking-widest rounded-full transition-all flex items-center gap-3 ${activeTab === "recommended"
              ? "bg-slate-900 text-white shadow-xl shadow-slate-900/10"
              : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
              }`}
          >
            <Sparkles className={`w-4 h-4 transition-all ${activeTab === "recommended" ? "text-amber-400 rotate-12" : "text-slate-300"}`} />
            Intelligent Matching
            {recommendedFreelancers?.length > 0 && (
              <span className={`px-2 py-0.5 text-[9px] font-black rounded-full ${activeTab === "recommended"
                ? "bg-indigo-500 text-white"
                : "bg-slate-100 text-slate-500 shadow-inner"
                }`}>
                {recommendedFreelancers?.length}
              </span>
            )}
          </button>
        </div>

        {/* Proposals Tab Content */}
        {activeTab === "proposals" && (
          <div className="grid grid-cols-1 gap-6 w-full">
            {project?.proposals?.length > 0 ? (
              project.proposals.map((proposal, index) => (
                <div
                  key={proposal._id}
                  className="group relative bg-white rounded-[2rem] border border-slate-200/60 hover:border-indigo-200/80 hover:shadow-2xl hover:shadow-indigo-500/10 transition-all duration-500 animate-fadeIn overflow-hidden"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="p-8">
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
                      <div className="flex items-center gap-6">
                        <div className="relative">
                          <img
                            src={proposal.seeker_id?.profilePic || `https://ui-avatars.com/api/?name=${encodeURIComponent(proposal.seeker_id?.fullName || "Seeker")}&background=random`}
                            alt={proposal.seeker_id?.fullName}
                            className="w-20 h-20 rounded-2xl border-4 border-slate-50 object-cover shadow-lg group-hover:scale-105 transition-transform duration-500"
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(proposal.seeker_id?.fullName || "Seeker")}&background=random`;
                            }}
                          />
                          <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-emerald-500 rounded-full border-4 border-white shadow-sm"></div>
                        </div>

                        <div>
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-xl font-black text-slate-900 group-hover:text-indigo-600 transition-colors">
                              {proposal.seeker_id?.fullName || "Unknown Professional"}
                            </h3>
                            {proposal.seeker_currentStatus && (
                              <span className="px-3 py-1 bg-indigo-50/80 text-indigo-700 text-[10px] font-black uppercase tracking-widest rounded-full border border-indigo-100">
                                {proposal.seeker_currentStatus}
                              </span>
                            )}
                          </div>

                          <div className="flex flex-wrap items-center gap-6">
                            <div className="flex flex-col">
                              <span className="text-slate-400 text-[9px] font-black uppercase tracking-widest mb-1">Bid Amount</span>
                              <span className="text-lg font-black text-slate-900">₹{proposal.bidAmount?.toLocaleString()}</span>
                            </div>
                            <div className="w-px h-8 bg-slate-100"></div>
                            <div className="flex flex-col">
                              <span className="text-slate-400 text-[9px] font-black uppercase tracking-widest mb-1">Timeline</span>
                              <span className="text-lg font-black text-slate-900">{proposal.deliveryTime}</span>
                            </div>
                            <div className="w-px h-8 bg-slate-100"></div>
                            <div className="flex flex-col">
                              <span className="text-slate-400 text-[9px] font-black uppercase tracking-widest mb-1">Confidence</span>
                              <div className="flex items-center gap-1">
                                <span className="text-lg font-black text-indigo-600">
                                  {(() => {
                                    const projectSkills = project?.skills || [];
                                    const seekerSkills = proposal.seeker_id?.skills || [];
                                    if (projectSkills.length === 0) return "100%";
                                    const matches = projectSkills.filter(s =>
                                      seekerSkills.some(ss => ss.toLowerCase().trim() === s.toLowerCase().trim())
                                    ).length;
                                    return `${Math.round((matches / projectSkills.length) * 100)}%`;
                                  })()}
                                </span>
                                <TrendingUp className="w-4 h-4 text-indigo-400" />
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-4 bg-slate-50/50 p-4 rounded-3xl border border-slate-100">
                        {getStatusBadge(proposal.status || "Pending")}

                        {(!proposal.status || proposal.status === "Pending") && project.status === "Open" && (
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleHireClick(proposal)}
                              className="px-6 py-2.5 bg-slate-900 text-white rounded-2xl hover:bg-indigo-600 transition-all text-[11px] font-black uppercase tracking-widest shadow-xl shadow-slate-900/10 active:scale-95"
                            >
                              Hire Now
                            </button>
                            <button
                              onClick={() => handleAcceptReject(proposal._id, "reject")}
                              className="px-4 py-2.5 bg-white text-rose-600 rounded-2xl hover:bg-rose-50 transition-all text-[11px] font-black uppercase tracking-widest border border-slate-200 active:scale-95"
                            >
                              Decline
                            </button>
                          </div>
                        )}

                        <button
                          onClick={() => setExpandedProposal(expandedProposal === proposal._id ? null : proposal._id)}
                          className={`p-3 rounded-2xl transition-all ${expandedProposal === proposal._id ? 'bg-indigo-600 text-white rotate-180 shadow-xl shadow-indigo-600/20' : 'bg-white text-slate-400 hover:text-indigo-600 shadow-sm'}`}
                        >
                          <ChevronLeft className="w-5 h-5 -rotate-90" />
                        </button>
                      </div>
                    </div>

                    {/* Detailed Cover Letter */}
                    {expandedProposal === proposal._id && (
                      <div className="mt-8 pt-8 border-t border-slate-100 animate-slideDown">
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                          <div className="lg:col-span-2">
                            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                              <MessageSquare className="w-4 h-4 text-indigo-600" />
                              Strategic Approach
                            </h4>
                            <p className="text-slate-600 font-medium leading-relaxed bg-slate-50 p-8 rounded-[2rem] border border-slate-100 border-l-4 border-l-indigo-500 whitespace-pre-line shadow-inner">
                              {proposal.coverLetter}
                            </p>
                          </div>

                          <div className="space-y-6">
                            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Competency Matrix</h4>
                            {proposal.seeker_id?.experience && (
                              <div className="group p-5 bg-indigo-50/50 rounded-2xl border border-indigo-100/50 hover:bg-white hover:shadow-xl hover:shadow-indigo-500/10 transition-all">
                                <p className="text-[10px] text-indigo-400 font-black uppercase tracking-widest mb-1">Experience</p>
                                <p className="text-sm text-slate-800 font-black">{proposal.seeker_id?.experience}</p>
                              </div>
                            )}
                            {proposal.seeker_id?.portfolioLink && (
                              <a
                                href={proposal.seeker_id?.portfolioLink}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center justify-between p-5 bg-slate-900 border border-slate-800 rounded-2xl hover:bg-slate-800 transition-all group"
                              >
                                <div className="flex flex-col">
                                  <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mb-1">Private Portfolio</p>
                                  <p className="text-sm text-white font-black group-hover:text-amber-400">Review Case Studies</p>
                                </div>
                                <div className="p-2 bg-white/5 rounded-xl group-hover:scale-110 transition-transform">
                                  <Globe className="w-5 h-5 text-indigo-400" />
                                </div>
                              </a>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-24 bg-white rounded-[3rem] border border-slate-200/60 shadow-inner">
                <div className="w-24 h-24 bg-slate-50 rounded-3xl flex items-center justify-center mx-auto mb-6 transform -rotate-6 shadow-sm">
                  <div className="p-4 bg-white rounded-2xl shadow-xl">
                    <MessageSquare className="w-10 h-10 text-slate-300" />
                  </div>
                </div>
                <h3 className="text-2xl font-black text-slate-900 mb-2">No Submissions Yet</h3>
                <p className="text-slate-400 font-medium max-w-sm mx-auto mb-8 leading-relaxed">
                  The candidates haven't responded yet. Explore our top AI-matched professionals while you wait.
                </p>
                <button
                  onClick={() => setActiveTab("recommended")}
                  className="px-10 py-4 bg-slate-900 text-white rounded-2xl hover:bg-indigo-600 transition-all font-black text-[11px] uppercase tracking-widest shadow-2xl active:scale-95"
                >
                  Intelligent Sourcing
                </button>
              </div>
            )}
          </div>
        )}

        {/* Recommended Freelancers Tab Content */}
        {activeTab === "recommended" && (
          <div className="space-y-8 w-full">
            <div className="relative overflow-hidden bg-gradient-to-br from-indigo-600 to-indigo-900 rounded-[2.5rem] p-10 text-white shadow-2xl">
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-32 -mt-32"></div>
              <div className="relative z-10">
                <div className="flex items-center gap-4 mb-4">
                  <div className="p-3 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20">
                    <Sparkles className="w-6 h-6 text-amber-400" />
                  </div>
                  <h2 className="text-3xl font-black tracking-tight">Intelligence Engine</h2>
                </div>
                <p className="text-indigo-100 text-lg font-medium max-w-2xl leading-relaxed">
                  Our proprietary matching algorithm has analyzed over 5,000 professionals to find the top talent
                  specifically compatible with your project's technology stack and budget.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {recommendedFreelancers.map((freelancer, index) => (
                <div
                  key={`rec-${freelancer._id}`}
                  className="group relative bg-white rounded-[2.5rem] border border-slate-200/60 hover:border-indigo-200/80 hover:shadow-2xl hover:shadow-indigo-500/10 transition-all duration-500 animate-fadeIn overflow-hidden"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="relative h-32 bg-slate-900 overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500/20 to-purple-500/20"></div>
                    <div className="absolute top-6 left-8">
                      <div className="px-4 py-1.5 bg-white/10 backdrop-blur-xl border border-white/20 rounded-full">
                        <span className="text-[10px] font-black text-white uppercase tracking-widest leading-none">
                          Ranked #{index + 1} Match
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="relative pt-12 p-10">
                    <div className="absolute -top-12 left-10">
                      <div className="relative">
                        <img
                          src={freelancer.profilePic || `https://ui-avatars.com/api/?name=${encodeURIComponent(freelancer.fullName || "Freelancer")}&background=random`}
                          alt={freelancer.fullName}
                          className="w-24 h-24 rounded-3xl border-4 border-white shadow-2xl object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        <div className="absolute -bottom-1 -right-1 w-7 h-7 bg-emerald-500 rounded-full border-4 border-white shadow-sm"></div>
                      </div>
                    </div>

                    <div className="flex justify-between items-start mb-6">
                      <div>
                        <h3 className="text-2xl font-black text-slate-900 mb-1">{freelancer.fullName}</h3>
                        <p className="text-indigo-600 text-xs font-black uppercase tracking-widest">{freelancer.role || "Professional Expert"}</p>
                      </div>
                      <div className={`px-5 py-2.5 rounded-full bg-gradient-to-r ${getMatchScoreColor(freelancer.matchScore)} text-white text-[11px] font-black uppercase tracking-widest shadow-lg`}>
                        {freelancer.matchScore}% Compatibility
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2 mb-8">
                      {freelancer.skills?.slice(0, 4).map((skill, i) => (
                        <span key={i} className="px-3 py-1 bg-slate-50 text-slate-500 text-[10px] font-black uppercase tracking-widest rounded-lg border border-slate-100">
                          {skill}
                        </span>
                      ))}
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-8">
                      <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Track Record</p>
                        <p className="text-sm font-black text-slate-800">{freelancer.completedProjects || 0} Projects Complete</p>
                      </div>
                      <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Market Rate</p>
                        <p className="text-sm font-black text-slate-800">₹{freelancer.hourlyRate}/hr</p>
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <button
                        onClick={() => setSelectedFreelancer(freelancer)}
                        className="flex-1 px-6 py-4 bg-slate-900 text-white rounded-2xl hover:bg-indigo-600 transition-all font-black text-[11px] uppercase tracking-widest shadow-xl active:scale-95"
                      >
                        Deep Profile Review
                      </button>
                      <button className="p-4 bg-white border border-slate-200 text-slate-400 rounded-2xl hover:bg-slate-50 hover:text-indigo-600 transition-all active:scale-95">
                        <MessageSquare className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Enhanced Freelancer Profile Modal */}
        {selectedFreelancer && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
            <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-3xl max-h-[92vh] overflow-hidden flex flex-col relative">

              {/* Dynamic Header */}
              <div className="relative h-48 sm:h-56 shrink-0">
                <div className="absolute inset-0 bg-gradient-to-tr from-[#1a1c4b] via-[#0d1730] to-[#0d222b]"></div>

                <div className="absolute top-6 right-6 z-10">
                  <button
                    onClick={closeModal}
                    className="p-3 bg-white/5 hover:bg-white/10 backdrop-blur-xl border border-white/10 rounded-[1rem] text-white transition-all hover:scale-105 active:scale-95"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <div className="relative px-8 md:px-12 pb-12 overflow-y-auto custom-scrollbar">
                {/* Profile Header section */}
                <div className="relative -mt-16 mb-10 flex flex-col sm:flex-row justify-between items-start sm:items-end gap-6 border-b border-transparent pb-0">

                  <div className="flex flex-row items-end gap-6">
                    {/* Avatar */}
                    <div className="relative shrink-0 z-10">
                      <div className="p-2 bg-white rounded-[2.25rem] shadow-sm">
                        <div className="w-32 h-32 sm:w-36 sm:h-36 rounded-[2rem] bg-[#fbc62f] overflow-hidden flex items-center justify-center relative shadow-sm">
                          {selectedFreelancer.profilePic ? (
                            <img src={selectedFreelancer.profilePic} alt={selectedFreelancer.fullName} className="w-full h-full object-cover" />
                          ) : (
                            <span className="text-5xl font-black text-[#1a1c4b] uppercase tracking-tighter">
                              {selectedFreelancer.fullName.split(' ').map(n => n[0]).join('').substring(0, 2)}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="pb-4">
                      <h2 className="text-3xl sm:text-5xl font-black text-[#131b32] mb-1 font-['Outfit'] tracking-tighter">
                        {selectedFreelancer.fullName}
                      </h2>
                      <p className="text-indigo-600 font-black text-[10px] uppercase tracking-[0.2em] mt-2">
                        {selectedFreelancer.role || "SEEKER"}
                      </p>
                    </div>
                  </div>

                  {selectedFreelancer.matchScore && (
                    <div className="pb-4 shrink-0">
                      <div className="px-5 py-2.5 rounded-[1.25rem] bg-[#00d05c] text-white font-black text-[10px] uppercase tracking-widest shadow-lg shadow-emerald-500/20 flex items-center gap-2">
                        <Sparkles className="w-4 h-4" />
                        {selectedFreelancer.matchScore}% MATCH SCORE
                      </div>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
                  <div className="p-5 bg-white border border-slate-100/80 rounded-[1.5rem] shadow-sm flex flex-col justify-between h-[130px]">
                    <div className="w-10 h-10 rounded-xl bg-indigo-50/80 flex items-center justify-center">
                      <Briefcase className="w-5 h-5 text-indigo-500" />
                    </div>
                    <div>
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Experience</p>
                      <p className="text-[13px] font-black text-[#131b32]">{selectedFreelancer.experience || "Not listed"}</p>
                    </div>
                  </div>
                  <div className="p-5 bg-white border border-slate-100/80 rounded-[1.5rem] shadow-sm flex flex-col justify-between h-[130px]">
                    <div className="w-10 h-10 rounded-xl bg-emerald-50/80 flex items-center justify-center">
                      <Award className="w-5 h-5 text-emerald-500" />
                    </div>
                    <div>
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Portfolio</p>
                      <p className="text-[13px] font-black text-[#131b32]">{selectedFreelancer.completedProjects || 0}+ Successes</p>
                    </div>
                  </div>
                  <div className="p-5 bg-white border border-slate-100/80 rounded-[1.5rem] shadow-sm flex flex-col justify-between h-[130px]">
                    <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center">
                      <Star className="w-5 h-5 text-amber-500 fill-amber-500" />
                    </div>
                    <div>
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Avg Rating</p>
                      <p className="text-[13px] font-black text-[#131b32]">{selectedFreelancer.rating || "5.0"}/5.0</p>
                    </div>
                  </div>
                  <div className="p-5 bg-white border border-slate-100/80 rounded-[1.5rem] shadow-sm flex flex-col justify-between h-[130px]">
                    <div className="w-10 h-10 rounded-xl bg-blue-50/80 flex items-center justify-center">
                      <IndianRupee className="w-5 h-5 text-blue-500" />
                    </div>
                    <div>
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Est. Rate</p>
                      <p className="text-[13px] font-black text-[#131b32]">₹{selectedFreelancer.hourlyRate || "0"}/hr</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-12">
                  <section>
                    <h3 className="text-[18px] font-black text-[#131b32] mb-5 flex items-center gap-3">
                      <div className="w-1.5 h-5 bg-indigo-600 rounded-full"></div>
                      Professional Bio
                    </h3>
                    <p className="text-slate-500 font-bold leading-relaxed ml-4">
                      {selectedFreelancer.bio || "This professional is a highly experienced freelancer with a proven track record of delivering top-tier projects on time and within budget. Their expertise aligns perfectly with your requirements."}
                    </p>
                  </section>

                  {/* Skills */}
                  {selectedFreelancer.skills?.length > 0 && (
                    <section>
                      <h3 className="text-lg font-black text-slate-900 mb-5 flex items-center gap-3">
                        <div className="w-1.5 h-6 bg-emerald-500 rounded-full"></div>
                        Technical Stack
                      </h3>
                      <div className="flex flex-wrap gap-2.5">
                        {selectedFreelancer.skills.map((skill, index) => (
                          <span key={index} className="px-5 py-2.5 bg-slate-50 text-slate-700 rounded-xl text-[11px] font-black uppercase tracking-widest border border-slate-100 hover:bg-white hover:border-indigo-200 hover:text-indigo-600 hover:shadow-md transition-all cursor-default">
                            {skill}
                          </span>
                        ))}
                      </div>
                    </section>
                  )}

                  {/* Online Presence */}
                  <section>
                    <h3 className="text-lg font-black text-slate-900 mb-5 flex items-center gap-3">
                      <div className="w-1.5 h-6 bg-slate-900 rounded-full"></div>
                      Digital Footprint
                    </h3>
                    <div className="flex flex-wrap gap-4">
                      {selectedFreelancer.github && (
                        <a href={selectedFreelancer.github} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 px-6 py-4 bg-slate-900 text-white rounded-2xl hover:bg-slate-800 transition-all font-black text-[11px] uppercase tracking-widest shadow-lg hover:-translate-y-1">
                          <Github className="w-5 h-5" /> GitHub
                        </a>
                      )}
                      {selectedFreelancer.linkedin && (
                        <a href={selectedFreelancer.linkedin} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 px-6 py-4 bg-[#0077b5] text-white rounded-2xl hover:bg-[#006da3] transition-all font-black text-[11px] uppercase tracking-widest shadow-lg hover:-translate-y-1">
                          <Linkedin className="w-5 h-5" /> LinkedIn
                        </a>
                      )}
                      {selectedFreelancer.portfolio && (
                        <a href={selectedFreelancer.portfolio} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 px-6 py-4 bg-white border border-slate-200 text-slate-900 rounded-2xl hover:bg-slate-50 transition-all font-black text-[11px] uppercase tracking-widest shadow-sm hover:shadow-md hover:-translate-y-1">
                          <Globe className="w-5 h-5 text-indigo-600" /> Case Studies
                        </a>
                      )}
                    </div>
                  </section>

                  {/* Messaging / Call to Action */}
                  <div className="pt-10 border-t border-slate-100 mt-10">
                    {!isMessaging ? (
                      <div className="flex flex-col sm:flex-row gap-4">
                        <button
                          onClick={() => setIsMessaging(true)}
                          className="flex-1 px-8 py-5 bg-slate-900 text-white rounded-2xl hover:bg-slate-800 transition-all font-black text-[13px] uppercase tracking-widest shadow-xl shadow-slate-900/20 active:scale-95 group relative overflow-hidden"
                        >
                          <span className="relative z-10 flex items-center justify-center gap-2">Initiate Interview <MessageSquare className="w-4 h-4 group-hover:translate-x-1 transition-transform" /></span>
                          <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                        </button>
                        <button className="px-8 py-5 bg-white border-2 border-slate-100 text-slate-600 rounded-2xl hover:bg-slate-50 hover:border-slate-200 hover:text-slate-900 transition-all font-black text-[13px] uppercase tracking-widest active:scale-95">
                          Save to Shortlist
                        </button>
                      </div>
                    ) : (
                      <div className="bg-white p-8 rounded-[2rem] border border-slate-100 animate-slideDown shadow-2xl shadow-indigo-500/5">
                        <div className="flex items-center justify-between mb-6">
                          <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest flex items-center gap-2">
                            <MessageSquare className="w-4 h-4 text-indigo-600" /> Direct Message to {selectedFreelancer.fullName.split(' ')[0]}
                          </h3>
                          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                        </div>
                        <textarea
                          value={messageText}
                          onChange={(e) => setMessageText(e.target.value)}
                          placeholder="Your invitation message... (A link to the project will be automatically attached)"
                          className="w-full min-h-[140px] p-6 bg-slate-50 border-none rounded-[1.5rem] shadow-inner ring-1 ring-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 outline-none resize-none text-[15px] font-medium mb-6 transition-all"
                        />
                        <div className="flex gap-3">
                          <button
                            disabled={!messageText.trim()}
                            onClick={handleSendMessage}
                            className="flex-1 bg-indigo-600 text-white py-4 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-600/20 disabled:opacity-50 disabled:cursor-not-allowed active:scale-95 flex items-center justify-center gap-2"
                          >
                            Send Invitation <Send className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setIsMessaging(false)}
                            className="px-8 py-4 bg-white border border-slate-200 text-slate-500 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-slate-50 hover:text-slate-900 transition-all active:scale-95"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Milestone Definition Modal */}
        {moduleSetup.show && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-6 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
            <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col relative">
              <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                <div>
                  <h2 className="text-2xl font-black text-slate-900">Configure Payment Milestones</h2>
                  <p className="text-sm text-slate-500 font-medium mt-1">Break down the project into modules for secure milestone-based payments.</p>
                </div>
                <button onClick={() => setModuleSetup({ ...moduleSetup, show: false })} className="p-3 bg-white hover:bg-slate-100 rounded-full text-slate-400 transition-all shadow-sm">
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="p-8 overflow-y-auto custom-scrollbar flex-1 bg-white">
                <div className="mb-8 flex items-center justify-between p-5 bg-indigo-50 border border-indigo-100 rounded-2xl">
                  <div>
                    <p className="text-xs font-black text-indigo-400 uppercase tracking-widest">Total Agreed Bid</p>
                    <h3 className="text-2xl font-black text-indigo-700">₹{moduleSetup.proposalAmount.toLocaleString()}</h3>
                  </div>
                  <div className="flex bg-white rounded-xl p-1 shadow-sm border border-indigo-100">
                    <button
                      onClick={() => setModuleSetup(prev => ({ ...prev, amountConfig: 'auto' }))}
                      className={`px-4 py-2 text-xs font-black uppercase tracking-widest rounded-lg transition-all ${moduleSetup.amountConfig === 'auto' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:bg-slate-50'}`}
                    >
                      Auto Splitting
                    </button>
                    <button
                      onClick={() => setModuleSetup(prev => ({ ...prev, amountConfig: 'custom' }))}
                      className={`px-4 py-2 text-xs font-black uppercase tracking-widest rounded-lg transition-all ${moduleSetup.amountConfig === 'custom' ? 'bg-slate-900 text-white' : 'text-slate-400 hover:bg-slate-50'}`}
                    >
                      Custom Values
                    </button>
                  </div>
                </div>

                <div className="space-y-4">
                  {moduleSetup.modules.map((m, idx) => (
                    <div key={m.id} className="p-5 bg-slate-50 border border-slate-200 rounded-[1.5rem] relative group">
                      <div className="absolute -left-3 -top-3 w-8 h-8 bg-slate-900 text-white rounded-xl flex items-center justify-center font-black text-xs shadow-lg">{idx + 1}</div>
                      {moduleSetup.modules.length > 1 && (
                        <button onClick={() => removeModule(m.id)} className="absolute right-4 top-4 text-rose-400 hover:text-rose-600 transition-colors">
                          <XCircle className="w-5 h-5" />
                        </button>
                      )}

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                        <div className="col-span-1 md:col-span-2">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 block">Milestone Title</label>
                          <input
                            type="text"
                            value={m.title}
                            onChange={(e) => updateModule(m.id, 'title', e.target.value)}
                            className="w-full bg-white border border-slate-200 px-4 py-3 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500/20 text-sm font-bold"
                            placeholder="e.g. Design Wireframes"
                          />
                        </div>
                        <div className="col-span-1 md:col-span-2">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 block">Description (Optional)</label>
                          <input
                            type="text"
                            value={m.description}
                            onChange={(e) => updateModule(m.id, 'description', e.target.value)}
                            className="w-full bg-white border border-slate-200 px-4 py-3 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500/20 text-sm font-medium"
                            placeholder="What will be delivered in this phase?"
                          />
                        </div>
                        {moduleSetup.amountConfig === 'custom' && (
                          <div className="col-span-1 md:col-span-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 block">Milestone Amount (₹)</label>
                            <input
                              type="number"
                              value={m.amount}
                              onChange={(e) => updateModule(m.id, 'amount', e.target.value)}
                              className="w-full bg-white border border-slate-200 px-4 py-3 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500/20 text-sm font-bold text-emerald-600"
                              placeholder="0"
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-6 flex justify-center">
                  <button
                    onClick={handleAddModule}
                    className="flex items-center gap-2 px-6 py-3 bg-white border-2 border-dashed border-slate-300 text-slate-500 rounded-xl hover:bg-slate-50 hover:text-indigo-600 hover:border-indigo-300 transition-all font-black text-xs uppercase tracking-widest"
                  >
                    + Add Milestone
                  </button>
                </div>
              </div>

              <div className="p-6 border-t border-slate-100 flex gap-4 bg-slate-50">
                <button onClick={() => setModuleSetup({ ...moduleSetup, show: false })} className="px-8 py-4 bg-white border border-slate-200 text-slate-500 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-100 transition-all flex-1">
                  Cancel
                </button>
                <button onClick={confirmHireWithModules} className="px-8 py-4 bg-emerald-500 text-white rounded-2xl hover:bg-emerald-600 transition-all font-black text-xs uppercase tracking-widest shadow-xl shadow-emerald-500/20 active:scale-95 flex-1">
                  Finalize Hire & Start
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #e2e8f0;
          border-radius: 20px;
          border: 4px solid transparent;
          background-clip: content-box;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #cbd5e1;
        }

        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes slideIn {
          from { opacity: 0; transform: translateX(20px); }
          to { opacity: 1; transform: translateX(0); }
        }
        
        @keyframes blob {
          0% { transform: scale(1); }
          33% { transform: scale(1.1); }
          66% { transform: scale(0.9); }
          100% { transform: scale(1); }
        }

        .animate-fadeIn { animation: fadeIn 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        .animate-slideDown { animation: slideDown 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        .animate-slideIn { animation: slideIn 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        .animate-blob { animation: blob 7s infinite; }
      `}</style>
    </div>
  );
};

export default ProposalsDetail;