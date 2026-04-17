import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { serverObj } from '../../config/serverConfig';
import { 
    FiClock, 
    FiCheckCircle, 
    FiXCircle, 
    FiActivity,
    FiMapPin,
    FiCalendar,
    FiBriefcase,
    FiArrowUpRight,
    FiZap,
    FiVideo
} from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import Loader from '../../components/common/Loader';
import MockTestInterface from '../../components/HiringWorkflow/MockTestInterface';
import InterviewCard from '../../components/HiringWorkflow/InterviewCard';

const MyApplications = () => {
    const [applications, setApplications] = useState([]);
    const [interviews, setInterviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTestId, setActiveTestId] = useState(null);
    const navigate = useNavigate();
    const serverAPI = serverObj.serverAPI;

    const fetchData = async () => {
        try {
            const [appRes, interviewRes] = await Promise.all([
                axios.get(`${serverAPI}/applications/seeker`, { withCredentials: true }),
                axios.get(`${serverAPI}/interviews/my-interviews`, { withCredentials: true })
            ]);
            setApplications(appRes.data.applications);
            setInterviews(interviewRes.data.interviews);
        } catch (error) {
            console.error("Error fetching data", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [serverAPI]);

    const getStatusConfig = (status) => {
        switch (status) {
            case 'Applied': 
                return { 
                    color: 'text-blue-600', 
                    bg: 'bg-blue-50/50', 
                    border: 'border-blue-100', 
                    icon: <FiClock />,
                    label: 'Application Sent'
                };
            case 'Accepted': 
                return { 
                    color: 'text-indigo-600', 
                    bg: 'bg-indigo-50/50', 
                    border: 'border-indigo-100', 
                    icon: <FiCheckCircle />,
                    label: 'Application Accepted'
                };
            case 'MockTest': 
                return { 
                    color: 'text-amber-600', 
                    bg: 'bg-amber-50/50', 
                    border: 'border-amber-100', 
                    icon: <FiZap />,
                    label: 'Test Pending'
                };
            case 'Interview': 
                return { 
                    color: 'text-purple-600', 
                    bg: 'bg-purple-50/50', 
                    border: 'border-purple-100', 
                    icon: <FiVideo />,
                    label: 'Interview Stage'
                };
            case 'Hired': 
                return { 
                    color: 'text-emerald-600', 
                    bg: 'bg-emerald-50/50', 
                    border: 'border-emerald-100', 
                    icon: <FiCheckCircle />,
                    label: 'Position Secured'
                };
            case 'Rejected': 
                return { 
                    color: 'text-rose-500', 
                    bg: 'bg-rose-50/50', 
                    border: 'border-rose-100', 
                    icon: <FiXCircle />,
                    label: 'Closed'
                };
            default: 
                return { 
                    color: 'text-gray-600', 
                    bg: 'bg-gray-50/50', 
                    border: 'border-gray-100', 
                    icon: <FiClock />,
                    label: status
                };
        }
    };

    const handleStartTest = async (jobId) => {
        try {
            // Get test for this job
            const res = await axios.get(`${serverAPI}/mocktest/get-tests/${jobId}`, { withCredentials: true });
            if (res.data.tests && res.data.tests.length > 0) {
                setActiveTestId(res.data.tests[0]._id);
            } else {
                toast.error("No active test found for this job.");
            }
        } catch (error) {
            console.error("Error starting test", error);
        }
    };

    if (loading) return <Loader />;

    return (
        <div className="min-h-screen pb-20 select-none w-full bg-slate-50 relative overflow-hidden">
            {/* Background Decorations */}
            <div className="fixed inset-0 w-full h-full pointer-events-none z-0 opacity-30 flex justify-center">
                <div className="w-[800px] h-[800px] bg-purple-100 rounded-full blur-[140px] absolute -top-40 left-10"></div>
                <div className="w-[600px] h-[600px] bg-blue-100 rounded-full blur-[120px] absolute top-40 -right-20"></div>
            </div>

            <div className="relative z-10 w-full px-4 sm:px-6 lg:px-8 py-10">
                {/* Hero Section */}
                <header className="mb-12">
                    <motion.div 
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="inline-flex items-center px-4 py-1.5 bg-purple-50 border border-purple-100 text-purple-600 rounded-full text-[10px] font-black uppercase tracking-widest mb-6"
                    >
                        <FiActivity className="mr-2" /> Application Intelligence
                    </motion.div>
                    <h1 className="text-4xl md:text-5xl font-black text-slate-900 mb-4 tracking-tight">
                        Career <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-blue-600">Milestones</span>
                    </h1>
                </header>

                {/* Interviews Section (If any) */}
                {interviews.length > 0 && (
                    <section className="mb-16">
                        <h2 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-3">
                           <div className="w-1.5 h-6 bg-purple-600 rounded-full"></div> Scheduled Interviews
                        </h2>
                        <div className="grid grid-cols-1 gap-6">
                            {interviews.map(interview => (
                                <InterviewCard key={interview._id} interview={interview} role="Seeker" />
                            ))}
                        </div>
                    </section>
                )}

                {/* Applications Grid */}
                <h2 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-3">
                   <div className="w-1.5 h-6 bg-blue-600 rounded-full"></div> Applied Positions
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <AnimatePresence>
                        {applications.map((app, index) => {
                            const config = getStatusConfig(app.status);
                            return (
                                <motion.div
                                    key={app._id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.05 }}
                                    className="group bg-white rounded-[2.5rem] p-8 border border-slate-200/60 hover:border-purple-200/80 hover:shadow-2xl hover:shadow-purple-500/5 transition-all duration-500 relative flex flex-col h-full"
                                >
                                    <div className="flex justify-between items-start mb-8">
                                        <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 text-slate-400 group-hover:text-purple-600 group-hover:bg-purple-50 group-hover:border-purple-100 transition-all duration-300">
                                            <FiBriefcase size={24} />
                                        </div>
                                        <span className={`flex items-center gap-1.5 px-4 py-1.5 rounded-2xl text-[10px] font-black uppercase tracking-widest border ${config.bg} ${config.border} ${config.color}`}>
                                            {config.icon} {config.label}
                                        </span>
                                    </div>

                                    <div className="mb-8">
                                        <h3 className="text-xl font-black text-slate-900 mb-2 leading-tight group-hover:text-purple-600 transition-colors">
                                            {app.jobId?.title || "Position Unavailable"}
                                        </h3>
                                        <div className="flex items-center text-slate-500 font-bold text-xs gap-4">
                                            <span className="flex items-center gap-1.5">
                                                <FiMapPin className="text-slate-300" /> {app.jobId?.location || "Remote"}
                                            </span>
                                            <span className="flex items-center gap-1.5">
                                                <FiCalendar className="text-slate-300" /> {new Date(app.createdAt).toLocaleDateString()}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="mt-auto pt-6 border-t border-slate-50 flex flex-wrap gap-2 mb-8">
                                        <span className="px-3 py-1 bg-slate-50 text-slate-400 text-[10px] font-black uppercase tracking-widest rounded-lg border border-slate-100">
                                            {app.jobId?.jobType || "Full Time"}
                                        </span>
                                        <span className="px-3 py-1 bg-slate-50 text-slate-400 text-[10px] font-black uppercase tracking-widest rounded-lg border border-slate-100">
                                            ₹ {(app.jobId?.salary || "Competitive").toLocaleString()}
                                        </span>
                                    </div>

                                    <div className="space-y-3">
                                        {app.status === 'MockTest' && (
                                            <button 
                                                onClick={() => handleStartTest(app.jobId?._id)}
                                                className="w-full py-4 bg-indigo-600 text-white rounded-2xl text-[11px] font-black uppercase tracking-widest hover:bg-slate-900 transition-all flex items-center justify-center gap-2 group/btn active:scale-[0.98] animate-pulse"
                                            >
                                                Start Mock Test <FiZap />
                                            </button>
                                        )}
                                        
                                        <button 
                                            onClick={() => navigate(`/seeker/job/${app.jobId?._id || app.jobId}`)}
                                            className="w-full py-4 bg-slate-100 text-slate-900 rounded-2xl text-[11px] font-black uppercase tracking-widest hover:bg-slate-200 transition-all flex items-center justify-center gap-2 group/btn active:scale-[0.98]"
                                        >
                                            View Details <FiArrowUpRight className="group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5 transition-transform" />
                                        </button>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </AnimatePresence>
                </div>

                {/* Empty State */}
                {!loading && applications.length === 0 && (
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="py-24 text-center bg-white rounded-[4rem] border-2 border-dashed border-slate-200 shadow-inner"
                    >
                        <div className="w-20 h-20 bg-slate-50 rounded-3xl flex items-center justify-center mx-auto mb-6">
                            <FiActivity className="text-slate-200" size={32} />
                        </div>
                        <h3 className="text-2xl font-black text-slate-900 mb-2">Clear Horizon</h3>
                        <p className="text-slate-500 font-medium max-w-xs mx-auto mb-8">
                            You haven't initiated any career movements yet. Start your journey today.
                        </p>
                        <button className="px-10 py-4 bg-purple-600 text-white rounded-2xl font-black text-[11px] uppercase tracking-widest hover:bg-slate-900 transition-all shadow-xl shadow-purple-200">
                            Explore Job Market
                        </button>
                    </motion.div>
                )}
            </div>

            {/* Mock Test Modal */}
            {activeTestId && (
                <MockTestInterface 
                    testId={activeTestId} 
                    onComplete={() => {
                        setActiveTestId(null);
                        fetchData();
                    }} 
                />
            )}
        </div>
    );
};

export default MyApplications;
