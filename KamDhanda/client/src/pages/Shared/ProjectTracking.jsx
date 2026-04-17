import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { serverObj } from '../../config/serverConfig';
import { toast } from 'react-hot-toast';
import useAuth from '../../customHooks/useAuth';
import Loader from '../../components/common/Loader';
import PaymentModal from '../../components/common/PaymentModal';
import {
    Clock, CheckCircle2, Files, BarChart3, Plus,
    Download, FileText, Calendar, Trash2, Upload,
    ArrowRight, ChevronRight, AlertCircle, Info,
    CheckCircle, Circle, X, IndianRupee, ShieldCheck
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const ProjectTracking = () => {
    const { id: projectId } = useParams();
    const { user, role } = useAuth();
    const [loading, setLoading] = useState(true);
    const [project, setProject] = useState(null);
    const [tracking, setTracking] = useState(null);
    const [fileSubmission, setFileSubmission] = useState({ name: '', file: null });
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [payingModule, setPayingModule] = useState(null);
    const [isUploading, setIsUploading] = useState(false);
    const [showSubmitModal, setShowSubmitModal] = useState(false);

    const fileInputRef = useRef(null);
    const serverAPI = serverObj.serverAPI;

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [projRes, trackRes] = await Promise.all([
                    axios.get(`${serverAPI}/freelancerProject/${projectId}`, { withCredentials: true }),
                    axios.get(`${serverAPI}/projectTracking/${projectId}`, { withCredentials: true })
                ]);
                setProject(projRes.data);
                setTracking(trackRes.data);
            } catch (err) {
                console.error(err);
                toast.error("Failed to load project details");
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [projectId, serverAPI]);

    // Module Progress Update (Seeker Only)
    const handleUpdateModuleProgress = async (moduleId, newProgress) => {
        try {
            const res = await axios.patch(`${serverAPI}/projectTracking/${projectId}/modules/${moduleId}`, { progress: parseInt(newProgress) }, { withCredentials: true });
            setTracking(res.data);
        } catch (err) {
            toast.error("Failed to update module progress");
        }
    };

    // Module Actions: 'submit', 'approve', 'reject'
    const handleModuleAction = async (moduleId, action) => {
        try {
            const res = await axios.patch(`${serverAPI}/projectTracking/${projectId}/modules/${moduleId}`, { action }, { withCredentials: true });
            setTracking(res.data);
            
            if (action === 'submit') toast.success("Module submitted for client approval");
            if (action === 'approve') toast.success("Module approved!");
            if (action === 'reject') toast.error("Module rejected for revision");
        } catch (err) {
            toast.error(`Failed to ${action} module`);
        }
    };

    const handlePayModuleClick = (module) => {
        setPayingModule(module);
        setShowPaymentModal(true);
    };

    const handlePaymentSuccess = (updatedProject, updatedTracking) => {
        setProject(updatedProject);
        if (updatedTracking) {
             setTracking(updatedTracking);
        } else {
             // If this was full project payment tracking fetch might be needed manually 
             // but verify-module returns tracking natively.
        }
        setShowPaymentModal(false);
        setPayingModule(null);
    };

    const handleSubmitDeliverable = async (e) => {
        e.preventDefault();
        if (!fileSubmission.file || !fileSubmission.name) {
            toast.error("Please provide both name and file");
            return;
        }

        const formData = new FormData();
        formData.append('deliverable', fileSubmission.file);
        formData.append('name', fileSubmission.name);

        setIsUploading(true);
        try {
            const res = await axios.post(`${serverAPI}/projectTracking/${projectId}/files`, formData, {
                withCredentials: true,
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            setTracking(res.data);
            setFileSubmission({ name: '', file: null });
            setShowSubmitModal(false);
            toast.success("Deliverable submitted!");
        } catch (err) {
            toast.error("Failed to submit file");
        } finally {
            setIsUploading(false);
        }
    };

    if (loading) return <Loader />;
    if (!project) return <div className="p-8 text-center text-red-500 font-bold bg-slate-50 min-h-screen">Project not found</div>;

    const isClient = role === 'Client';
    const hasModules = tracking?.modules && tracking.modules.length > 0;
    
    // Stats calculation based on modules if they exist, otherwise fallback to old task schema if needed
    const completedItemsNum = hasModules ? tracking.modules.filter(m => m.status === 'Approved' || m.status === 'Completed').length : 0;
    const totalItemsNum = hasModules ? tracking.modules.length : 0;
    const assetsNum = tracking?.files?.length || 0;

    const containerVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.5, staggerChildren: 0.1 } }
    };

    const cardVariants = {
        hidden: { opacity: 0, x: -20 },
        visible: { opacity: 1, x: 0 }
    };

    const StatCard = ({ icon: Icon, label, value, color, secondaryValue }) => (
        <motion.div
            variants={cardVariants}
            className="bg-white border border-slate-200 p-8 rounded-3xl flex flex-col gap-3 group hover:shadow-2xl hover:border-indigo-200 transition-all duration-300"
        >
            <div className={`p-4 rounded-2xl w-fit ${color}/10 mb-4 transition-transform group-hover:scale-110`}>
                <Icon size={24} className={color.replace('bg-', 'text-')} />
            </div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{label}</p>
            <div className="flex items-baseline gap-2">
                <span className={`text-4xl font-black text-slate-900`}>{value}</span>
                {secondaryValue && <span className="text-sm font-bold text-slate-400">{secondaryValue}</span>}
            </div>
        </motion.div>
    );

    return (
        <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-indigo-100 selection:text-indigo-900">
            {/* Background Orbs */}
            <div className="fixed top-0 left-0 w-full h-full pointer-events-none z-0 overflow-hidden opacity-40">
                <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-indigo-200 rounded-full blur-[120px] opacity-20"></div>
                <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-purple-200 rounded-full blur-[100px] opacity-20"></div>
            </div>

            <main className="relative z-10 w-full max-w-7xl mx-auto px-4 md:px-8 py-10 lg:py-16">
                <motion.div
                    initial="hidden"
                    animate="visible"
                    variants={containerVariants}
                    className="space-y-12"
                >
                    {/* Header */}
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                        <div>
                            <div className="flex items-center gap-3 mb-2">
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] bg-slate-200/50 px-2.5 py-1 rounded-full">PRJ-{project._id.slice(-6).toUpperCase()}</span>
                                <span className="w-1.5 h-1.5 bg-slate-300 rounded-full"></span>
                                <span className="text-[10px] font-black text-emerald-500 uppercase tracking-[0.2em] bg-emerald-50 border border-emerald-100 px-2.5 py-1 rounded-full">Milestone Workflow</span>
                            </div>
                            <h1 className="text-4xl md:text-5xl lg:text-7xl font-extrabold text-slate-900 leading-none tracking-tight">
                                {project.title}
                            </h1>
                        </div>

                        <div className="flex gap-4">
                            {project.status === 'Paid' && (
                                <div className="flex items-center gap-3">
                                    <div className="px-6 py-3 bg-emerald-50 border border-emerald-100 rounded-2xl flex items-center gap-3 shadow-sm">
                                        <ShieldCheck className="text-emerald-600" size={20} />
                                        <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest leading-none">All Milestones Paid</span>
                                    </div>
                                    <button
                                        onClick={() => window.print()}
                                        className="p-3 bg-indigo-600 text-white rounded-2xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100"
                                        title="Download Initial Receipt"
                                    >
                                        <Download size={20} />
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        <StatCard
                            icon={Clock}
                            label="Days Remaining"
                            value={project?.status === "Paid" || tracking?.progress >= 100 ? "0" : (tracking?.remainingDays !== null ? tracking.remainingDays : '--')}
                            secondaryValue={project?.status === "Paid" ? "Completed" : ""}
                            color="bg-amber-500"
                        />
                        <StatCard
                            icon={CheckCircle2}
                            label="Milestones Done"
                            value={completedItemsNum}
                            secondaryValue={`/ ${totalItemsNum}`}
                            color="bg-indigo-600"
                        />
                        <StatCard
                            icon={Files}
                            label="Assets"
                            value={assetsNum}
                            color="bg-purple-600"
                        />
                        <motion.div
                            variants={cardVariants}
                            className="bg-white border border-slate-200 p-8 rounded-3xl flex flex-col justify-between group hover:shadow-2xl transition-all duration-300"
                        >
                            <div className="flex justify-between items-start mb-6">
                                <div className="p-4 rounded-2xl bg-indigo-50 group-hover:scale-110 transition-transform">
                                    <BarChart3 size={24} className="text-indigo-600" />
                                </div>
                                <span className="text-2xl font-black text-indigo-600">{tracking?.progress}%</span>
                            </div>
                            <div>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Overall Progress</p>
                                <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: `${tracking?.progress}%` }}
                                        className="h-full bg-indigo-600 shadow-[0_0_10px_rgba(79,70,229,0.3)]"
                                    />
                                </div>
                            </div>
                        </motion.div>
                    </div>

                    {/* Main Content */}
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">

                        {/* Milestones / Modules Section */}
                        <div className="lg:col-span-12 space-y-8">
                            <div className="flex flex-col md:flex-row justify-between md:items-center bg-white p-5 rounded-3xl border border-slate-200 shadow-sm gap-4">
                                <div className="px-4">
                                    <h2 className="text-2xl font-black text-slate-900">Project timeline & Milestones</h2>
                                    <p className="text-xs font-bold text-slate-400">Track and pay for isolated project modules</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {!hasModules ? (
                                    <div className="col-span-full text-center py-24 bg-white rounded-[2.5rem] border border-dashed border-slate-200 shadow-inner">
                                        <Info className="mx-auto text-slate-300 mb-4" size={32} />
                                        <p className="text-slate-400 font-bold">No milestones configured for this project.</p>
                                    </div>
                                ) : (
                                    tracking?.modules.map((module, idx) => (
                                        <motion.div
                                            key={module._id}
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: idx * 0.05 }}
                                            className={`p-6 rounded-[2rem] border transition-all duration-300 flex flex-col justify-between h-full bg-white group hover:shadow-xl ${module.paymentStatus === "Paid" ? 'border-emerald-200/50' : 'border-slate-200'}`}
                                        >
                                            <div>
                                                <div className="flex justify-between items-start mb-4">
                                                    <span className="px-3 py-1 bg-slate-100 text-slate-600 text-[10px] font-black uppercase tracking-widest rounded-lg">
                                                        Phase {idx + 1}
                                                    </span>
                                                    <span className={`px-3 py-1 text-[9px] font-black uppercase tracking-widest rounded-lg ${
                                                        module.status === 'Approved' ? 'bg-emerald-100 text-emerald-700' :
                                                        module.status === 'Waiting for Client Approval' ? 'bg-amber-100 text-amber-700 animate-pulse' :
                                                        module.status === 'Completed' ? 'bg-emerald-50 text-emerald-600' :
                                                        module.status === 'In Progress' ? 'bg-indigo-50 text-indigo-600' :
                                                        'bg-slate-100 text-slate-500'
                                                    }`}>
                                                        {module.status}
                                                    </span>
                                                </div>

                                                <h3 className="text-xl font-black text-slate-900 mb-2">{module.title}</h3>
                                                {module.description && <p className="text-xs font-bold text-slate-400 mb-6">{module.description}</p>}

                                            </div>

                                            <div className="mt-8">
                                                <div className="flex justify-between items-end mb-4 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                                                    <div>
                                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Milestone Value</p>
                                                        <p className="text-xl font-black text-slate-900">₹{module.amount.toLocaleString()}</p>
                                                    </div>
                                                    <div>
                                                        <span className={`px-3 py-1 text-[10px] font-black uppercase rounded-lg ${
                                                            module.paymentStatus === 'Paid' ? 'bg-emerald-500 text-white' :
                                                            module.paymentStatus === 'Ready to Pay' ? 'bg-indigo-600 text-white animate-pulse' :
                                                            'bg-slate-200 text-slate-500'
                                                        }`}>
                                                            {module.paymentStatus}
                                                        </span>
                                                    </div>
                                                </div>
                                                
                                                {/* Progress Bar & Slider */}
                                                <div className="mb-6">
                                                    <div className="flex justify-between items-center mb-2">
                                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Progress</p>
                                                        <p className="text-xs font-black text-indigo-600">{module.progress}%</p>
                                                    </div>
                                                    
                                                    {(!isClient && (module.status === "Pending" || module.status === "In Progress" || module.status === "Completed")) ? (
                                                        <input 
                                                            type="range" 
                                                            min="0" max="100" 
                                                            value={module.progress}
                                                            onChange={(e) => handleUpdateModuleProgress(module._id, e.target.value)}
                                                            className="w-full focus:outline-none accent-indigo-600 h-2 bg-slate-100 rounded-full appearance-none cursor-pointer hover:accent-indigo-500"
                                                        />
                                                    ) : (
                                                        <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                                                            <div className={`h-full ${module.paymentStatus === 'Paid' ? 'bg-emerald-500' : 'bg-indigo-500'}`} style={{ width: `${module.progress}%` }}></div>
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Action Buttons */}
                                                <div className="flex gap-2">
                                                    {!isClient && module.progress === 100 && (module.status === "In Progress" || module.status === "Completed") && (
                                                        <button 
                                                            onClick={() => handleModuleAction(module._id, 'submit')}
                                                            className="flex-1 py-3 bg-slate-900 text-white rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-800 transition-all active:scale-95 shadow-md"
                                                        >
                                                            Request Approval
                                                        </button>
                                                    )}

                                                    {isClient && module.status === "Waiting for Client Approval" && (
                                                        <>
                                                            <button 
                                                                onClick={() => handleModuleAction(module._id, 'approve')}
                                                                className="flex-1 py-3 bg-emerald-500 text-white rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-emerald-600 transition-all active:scale-95 shadow-md shadow-emerald-500/20"
                                                            >
                                                                Approve
                                                            </button>
                                                            <button 
                                                                onClick={() => handleModuleAction(module._id, 'reject')}
                                                                className="flex-1 py-3 bg-white border border-rose-200 text-rose-500 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-rose-50 transition-all active:scale-95"
                                                            >
                                                                Reject Review
                                                            </button>
                                                        </>
                                                    )}

                                                    {isClient && module.status === "Approved" && module.paymentStatus === "Ready to Pay" && (
                                                        <button 
                                                            onClick={() => handlePayModuleClick(module)}
                                                            className="w-full py-3 bg-indigo-600 text-white rounded-xl font-black text-[11px] uppercase tracking-widest hover:bg-indigo-700 transition-all active:scale-95 shadow-xl shadow-indigo-600/30 flex items-center justify-center gap-2 group/pay"
                                                        >
                                                            <IndianRupee className="w-4 h-4 text-indigo-300" /> Pay Escrow
                                                            <ArrowRight className="w-4 h-4 group-hover/pay:translate-x-1 transition-transform" />
                                                        </button>
                                                    )}
                                                    
                                                    {module.paymentStatus === "Paid" && (
                                                        <div className="w-full py-3 bg-emerald-50 border border-emerald-100 text-emerald-600 rounded-xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2">
                                                            <CheckCircle2 size={16} /> Fund Released
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </motion.div>
                                    ))
                                )}
                            </div>
                        </div>

                        {/* Secondary Row: Deliverables */}
                        <div className="lg:col-span-12 mt-4 space-y-6">
                            <div className="flex justify-between items-center bg-white p-5 rounded-3xl border border-slate-200 shadow-sm">
                                <div className="px-4">
                                    <h2 className="text-2xl font-black text-slate-900">Asset Drops & Deliverables</h2>
                                    <p className="text-xs font-bold text-slate-400">Files and assets submitted per milestone</p>
                                </div>
                                {!isClient && project.status !== 'Paid' && (
                                    <button
                                        onClick={() => setShowSubmitModal(true)}
                                        className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white font-black text-[10px] uppercase tracking-widest rounded-2xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 active:scale-95"
                                    >
                                        <Plus size={14} /> Submit
                                    </button>
                                )}
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                {tracking?.files?.length === 0 ? (
                                    <div className="col-span-full text-center py-16 bg-white rounded-[2.5rem] border border-dashed border-slate-200 shadow-inner">
                                        <FileText className="mx-auto text-slate-300 mb-4" size={32} />
                                        <p className="text-slate-400 font-bold">No assets explicitly dropped yet.</p>
                                    </div>
                                ) : (
                                    tracking?.files.map((file, idx) => (
                                        <motion.div
                                            key={file._id}
                                            initial={{ opacity: 0, x: 20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: idx * 0.1 }}
                                            className="group relative p-6 rounded-[2rem] bg-white border border-slate-200 hover:border-indigo-200 hover:shadow-lg transition-all duration-300 flex flex-col items-center text-center"
                                        >
                                            <div className="w-16 h-16 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 group-hover:scale-110 group-hover:bg-indigo-600 group-hover:text-white transition-all shadow-sm mb-4">
                                                <FileText size={28} />
                                            </div>
                                            <h4 className="font-black text-slate-900 text-sm w-full truncate px-2 mb-1">{file.name}</h4>
                                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
                                                {new Date(file.uploadedAt).toLocaleDateString()}
                                            </p>
                                            <a
                                                href={file.url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="absolute inset-x-4 bottom-4 opacity-0 group-hover:opacity-100 py-3 rounded-xl bg-slate-900 text-white font-black text-[10px] uppercase tracking-widest transition-all shadow-lg flex justify-center translate-y-2 group-hover:translate-y-0 items-center gap-2"
                                            >
                                                View Asset <Download size={14} />
                                            </a>
                                        </motion.div>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>
                </motion.div>
            </main>

            {/* Asset Submission Modal */}
            <AnimatePresence>
                {showSubmitModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm"
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="bg-white border border-slate-200 w-full max-w-lg rounded-[2.5rem] overflow-hidden shadow-2xl relative"
                        >
                            <button
                                onClick={() => setShowSubmitModal(false)}
                                className="absolute top-8 right-8 p-2 text-slate-400 hover:text-slate-900 transition-colors"
                            >
                                <X size={24} />
                            </button>
                            <div className="p-10 space-y-8">
                                <div className="text-center">
                                    <div className="w-20 h-20 bg-indigo-50 rounded-3xl flex items-center justify-center mx-auto mb-6">
                                        <Upload size={32} className="text-indigo-600" />
                                    </div>
                                    <h3 className="text-3xl font-black text-slate-900 mb-2">Submit Asset</h3>
                                    <p className="text-slate-500 text-sm font-bold">Upload project deliverable files</p>
                                </div>

                                <form onSubmit={handleSubmitDeliverable} className="space-y-6">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Asset Name</label>
                                        <input
                                            type="text"
                                            placeholder="e.g. Final Logo Concepts"
                                            className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 text-sm font-bold focus:outline-none focus:border-indigo-500 focus:bg-white transition-all text-slate-900"
                                            value={fileSubmission.name}
                                            onChange={(e) => setFileSubmission({ ...fileSubmission, name: e.target.value })}
                                            required
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Upload File</label>
                                        <div
                                            onClick={() => fileInputRef.current.click()}
                                            className="w-full bg-slate-50 border-2 border-dashed border-slate-200 rounded-2xl p-10 flex flex-col items-center justify-center cursor-pointer hover:border-indigo-400 hover:bg-white transition-all group"
                                        >
                                            <input
                                                type="file"
                                                ref={fileInputRef}
                                                className="hidden"
                                                onChange={(e) => setFileSubmission({ ...fileSubmission, file: e.target.files[0] })}
                                                accept="*/*"
                                            />
                                            {fileSubmission.file ? (
                                                <div className="flex items-center gap-3 bg-indigo-50 px-6 py-3 rounded-2xl border border-indigo-100">
                                                    <CheckCircle2 size={16} className="text-indigo-600" />
                                                    <span className="text-sm font-black text-indigo-600 truncate max-w-[200px]">{fileSubmission.file.name}</span>
                                                </div>
                                            ) : (
                                                <>
                                                    <Upload size={24} className="text-slate-300 mb-3 group-hover:text-indigo-500 transition-colors" />
                                                    <span className="text-sm font-bold text-slate-400">Click or drag to upload</span>
                                                    <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest mt-2">Max 50MB</span>
                                                </>
                                            )}
                                        </div>
                                    </div>

                                    <div className="flex gap-4 pt-4">
                                        <button
                                            type="button"
                                            onClick={() => setShowSubmitModal(false)}
                                            className="flex-1 py-4 bg-slate-100 text-slate-600 font-black text-[10px] uppercase tracking-widest rounded-3xl hover:bg-slate-200 transition-all"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            type="submit"
                                            disabled={isUploading}
                                            className="flex-[2] py-4 bg-indigo-600 text-white font-black text-[10px] uppercase tracking-widest rounded-3xl hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100 disabled:opacity-50"
                                        >
                                            {isUploading ? 'Uploading...' : 'Submit Deliverable'}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
            {/* Payment Modal */}
            {showPaymentModal && (
                <PaymentModal
                    project={project}
                    module={payingModule}
                    onClose={() => {
                        setShowPaymentModal(false);
                        setPayingModule(null);
                    }}
                    onSuccess={handlePaymentSuccess}
                />
            )}

            {/* Print-only Receipt Section */}
            <div className="hidden print:block print:fixed print:inset-0 print:bg-white print:z-[200] p-10 font-sans text-slate-900 border-t-8 border-indigo-600">
                <div className="flex justify-between items-start mb-12">
                    <div>
                        <h1 className="text-4xl font-black text-indigo-600 mb-2">KamDhanda</h1>
                        <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Payment Receipt</p>
                    </div>
                    <div className="text-right">
                        <p className="font-black text-lg">Transaction Date</p>
                        <p className="text-slate-500 font-bold">{new Date().toLocaleDateString()}</p>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-10 mb-12 border-y border-slate-100 py-10">
                    <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Project Details</p>
                        <p className="font-black text-xl mb-1">{project.title}</p>
                        <p className="text-slate-500 text-sm font-bold">PRJ-{project._id.slice(-6).toUpperCase()}</p>
                    </div>
                    <div className="text-right">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Payment Breakdown</p>
                        <div className="space-y-1">
                            <div className="flex justify-between text-sm font-bold">
                                <span>Project Base Amount</span>
                                <span>₹{(project.finalAmount / 1.18).toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between text-sm font-bold text-slate-400">
                                <span>GST (18%)</span>
                                <span>₹{(project.finalAmount - (project.finalAmount / 1.18)).toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between text-xl font-black pt-4 border-t border-slate-100 mt-2 text-indigo-600">
                                <span>Total Amount Paid</span>
                                <span>₹{project.finalAmount}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {tracking?.modules && tracking.modules.length > 0 && (
                    <div className="mb-12">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Milestone Breakdown</p>
                        <table className="w-full text-left text-sm font-medium">
                            <thead>
                                <tr className="border-b border-slate-200">
                                    <th className="py-2">Phase</th>
                                    <th className="py-2 text-right">Amount</th>
                                    <th className="py-2 text-right">Payment ID</th>
                                </tr>
                            </thead>
                            <tbody>
                                {tracking.modules.map((mod, idx) => (
                                    <tr key={idx} className="border-b border-slate-50 text-slate-600">
                                        <td className="py-3">
                                            <p className="font-black text-slate-900">{mod.title}</p>
                                            <span className="text-[10px] uppercase text-slate-400">{mod.paymentStatus}</span>
                                        </td>
                                        <td className="py-3 text-right">₹{mod.amount}</td>
                                        <td className="py-3 text-right text-xs font-mono">{mod.paymentDetails?.paymentId || "—"}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                <div className="p-6 bg-slate-50 border border-slate-100 rounded-2xl">
                    <p className="text-center text-slate-400 text-xs font-bold px-10">
                        This is an officially generated tracking receipt. <br />
                        For any queries, please reach out to support@kamdhanda.com
                    </p>
                </div>

                <div className="mt-20 border-t-2 border-slate-50 pt-6 text-center">
                    <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.4em]">Official KamDhanda Project Milestone Receipt</p>
                </div>
            </div>

            <style>{`
                @media print {
                    body * {
                        visibility: hidden;
                    }
                    .print\\:block, .print\\:block * {
                        visibility: visible;
                    }
                    .print\\:block {
                        position: absolute;
                        left: 0;
                        top: 0;
                        width: 100%;
                    }
                }
            `}</style>
        </div>
    );
};

export default ProjectTracking;
