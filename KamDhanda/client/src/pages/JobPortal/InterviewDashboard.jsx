import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { serverObj } from '../../config/serverConfig';
import { useSelector } from 'react-redux';
import { toast } from 'react-hot-toast';
import EvaluationPanel from '../../components/HiringWorkflow/EvaluationPanel';
import {
    FiVideo, FiCalendar, FiClock, FiUser, FiAward,
    FiCheck, FiX, FiAlertTriangle, FiRefreshCw,
    FiStar, FiMessageSquare, FiExternalLink, FiFilter,
    FiChevronRight, FiPause
} from 'react-icons/fi';

const statusConfig = {
    Scheduled: { color: 'bg-blue-50 text-blue-600 border-blue-100', dot: 'bg-blue-400' },
    Rescheduled: { color: 'bg-indigo-50 text-indigo-600 border-indigo-100', dot: 'bg-indigo-400' },
    Waiting: { color: 'bg-amber-50 text-amber-600 border-amber-100', dot: 'bg-amber-400 animate-pulse' },
    Live: { color: 'bg-emerald-50 text-emerald-600 border-emerald-100', dot: 'bg-emerald-400 animate-pulse' },
    Completed: { color: 'bg-gray-50 text-gray-500 border-gray-100', dot: 'bg-gray-400' },
    Cancelled: { color: 'bg-red-50 text-red-500 border-red-100', dot: 'bg-red-400' },
    Missed: { color: 'bg-rose-50 text-rose-500 border-rose-100', dot: 'bg-rose-400' },
};

const decisionBadge = {
    Selected: 'bg-emerald-50 text-emerald-600 border-emerald-200',
    Rejected: 'bg-red-50 text-red-600 border-red-200',
    Hold: 'bg-amber-50 text-amber-600 border-amber-200',
};

const InterviewDashboard = () => {
    const navigate = useNavigate();
    const { user } = useSelector(s => s.auth);
    const isClient = user?.role === 'Client';
    const serverAPI = serverObj.serverAPI;

    const [interviews, setInterviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('All');
    const [selectedInterview, setSelectedInterview] = useState(null);
    const [showEvaluation, setShowEvaluation] = useState(false);
    const [showDetails, setShowDetails] = useState(null);

    const fetchInterviews = async () => {
        try {
            const res = await axios.get(`${serverAPI}/interviews/my-interviews`, { withCredentials: true });
            setInterviews(res.data.interviews || []);
        } catch (e) {
            toast.error('Failed to load interviews');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchInterviews(); }, []);

    const handleCancel = async (id) => {
        if (!window.confirm('Cancel this interview?')) return;
        try {
            await axios.put(`${serverAPI}/interviews/cancel/${id}`, {}, { withCredentials: true });
            toast.success('Interview cancelled');
            fetchInterviews();
        } catch (e) {
            toast.error('Failed to cancel');
        }
    };

    const joinRoom = (roomId, status) => {
        if (status === 'Cancelled' || status === 'Completed' || status === 'Missed') {
            return toast.error('This interview is no longer active');
        }
        navigate(`/interview/room/${roomId}`);
    };

    const filters = ['All', 'Scheduled', 'Rescheduled', 'Live', 'Completed', 'Cancelled'];
    const filtered = filter === 'All' ? interviews : interviews.filter(i => i.status === filter);

    const stats = {
        total: interviews.length,
        scheduled: interviews.filter(i => ['Scheduled', 'Rescheduled'].includes(i.status)).length,
        completed: interviews.filter(i => i.status === 'Completed').length,
        live: interviews.filter(i => i.status === 'Live').length,
    };

    if (loading) return (
        <div className="flex-1 flex items-center justify-center min-h-screen bg-gray-50">
            <div className="text-center">
                <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                <p className="text-gray-500 font-bold text-sm">Loading interviews...</p>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50/30 p-6 lg:p-10">
            {/* Evaluation Modal */}
            {showEvaluation && selectedInterview && (
                <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="w-full max-w-2xl">
                        <EvaluationPanel
                            interview={selectedInterview}
                            onEvaluated={() => { setShowEvaluation(false); fetchInterviews(); }}
                            onClose={() => setShowEvaluation(false)}
                        />
                    </div>
                </div>
            )}

            {/* Header */}
            <div className="mb-10">
                <h1 className="text-4xl font-black text-gray-900 tracking-tight flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-indigo-600 flex items-center justify-center shadow-xl shadow-indigo-600/20">
                        <FiVideo className="text-white text-xl" />
                    </div>
                    Virtual Interviews
                </h1>
                <p className="text-gray-400 mt-2 font-medium">
                    {isClient ? 'Manage and conduct interviews with applicants' : 'Your scheduled interviews and results'}
                </p>
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                {[
                    { label: 'Total', value: stats.total, color: 'from-slate-700 to-slate-900', icon: FiCalendar },
                    { label: 'Upcoming', value: stats.scheduled, color: 'from-blue-500 to-indigo-600', icon: FiClock },
                    { label: 'Live Now', value: stats.live, color: 'from-emerald-400 to-teal-500', icon: FiVideo },
                    { label: 'Completed', value: stats.completed, color: 'from-purple-500 to-indigo-600', icon: FiAward },
                ].map(({ label, value, color, icon: Icon }) => (
                    <div key={label} className={`bg-gradient-to-br ${color} rounded-3xl p-6 text-white shadow-xl`}>
                        <Icon className="text-white/50 text-xl mb-3" />
                        <p className="text-3xl font-black">{value}</p>
                        <p className="text-white/70 text-xs font-bold uppercase tracking-widest mt-1">{label}</p>
                    </div>
                ))}
            </div>

            {/* Filter Tabs */}
            <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
                {filters.map(f => (
                    <button
                        key={f}
                        onClick={() => setFilter(f)}
                        className={`px-5 py-2 rounded-2xl text-xs font-black uppercase tracking-widest whitespace-nowrap transition-all ${
                            filter === f
                                ? 'bg-slate-900 text-white shadow-xl'
                                : 'bg-white text-gray-400 border border-gray-100 hover:border-gray-200'
                        }`}
                    >
                        {f}
                    </button>
                ))}
            </div>

            {/* Interview List */}
            {filtered.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-24 text-center">
                    <div className="w-20 h-20 rounded-3xl bg-gray-100 flex items-center justify-center mb-4">
                        <FiVideo className="text-gray-300 text-3xl" />
                    </div>
                    <p className="text-gray-500 font-bold text-lg">No interviews found</p>
                    <p className="text-gray-300 text-sm mt-1">
                        {filter === 'All' ? 'No interviews scheduled yet' : `No ${filter.toLowerCase()} interviews`}
                    </p>
                </div>
            ) : (
                <div className="space-y-4">
                    {filtered.map((interview) => {
                        const cfg = statusConfig[interview.status] || statusConfig.Scheduled;
                        const isLive = interview.status === 'Live';
                        const isScheduled = ['Scheduled', 'Rescheduled'].includes(interview.status);
                        const isCompleted = interview.status === 'Completed';
                        const hasEvaluation = !!interview.evaluation?.decision;
                        const expanded = showDetails === interview._id;

                        return (
                            <div
                                key={interview._id}
                                className={`bg-white rounded-3xl border transition-all duration-300 overflow-hidden ${
                                    isLive
                                        ? 'border-emerald-200 shadow-xl shadow-emerald-100'
                                        : 'border-gray-100 shadow-sm hover:shadow-md'
                                }`}
                            >
                                {isLive && (
                                    <div className="h-1 bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 animate-pulse" />
                                )}

                                <div className="p-6 flex flex-col lg:flex-row gap-4">
                                    {/* Left: Main Info */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex flex-wrap items-center gap-2 mb-3">
                                            <span className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase border ${cfg.color}`}>
                                                <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
                                                {interview.status}
                                            </span>
                                            {hasEvaluation && (
                                                <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase border ${decisionBadge[interview.evaluation.decision]}`}>
                                                    {interview.evaluation.decision}
                                                </span>
                                            )}
                                        </div>

                                        <h3 className="text-lg font-black text-gray-800 truncate">{interview.title}</h3>

                                        <div className="flex flex-wrap gap-4 mt-2">
                                            <div className="flex items-center gap-1.5 text-gray-400 text-sm">
                                                <FiCalendar className="text-xs" />
                                                <span className="font-medium">
                                                    {new Date(interview.date).toLocaleDateString('en-IN', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-1.5 text-gray-400 text-sm">
                                                <FiClock className="text-xs" />
                                                <span className="font-medium">{interview.time} · {interview.duration} mins</span>
                                            </div>
                                            <div className="flex items-center gap-1.5 text-gray-400 text-sm">
                                                <FiUser className="text-xs" />
                                                <span className="font-medium">
                                                    {isClient ? interview.seekerId?.fullName : interview.clientId?.fullName}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Evaluation Summary */}
                                        {hasEvaluation && (
                                            <div className="mt-3 flex flex-wrap items-center gap-3">
                                                <div className="flex items-center gap-1 text-amber-500">
                                                    <FiStar className="text-sm" />
                                                    <span className="font-black text-sm">{interview.evaluation.overallRating}/5</span>
                                                </div>
                                                {interview.evaluation.feedback && (
                                                    <p className="text-gray-400 text-xs font-medium italic truncate max-w-xs">
                                                        "{interview.evaluation.feedback}"
                                                    </p>
                                                )}
                                            </div>
                                        )}
                                    </div>

                                    {/* Right: Actions */}
                                    <div className="flex flex-row lg:flex-col gap-2 shrink-0">
                                        {/* Join Button */}
                                        {(isLive || isScheduled) && (
                                            <button
                                                onClick={() => joinRoom(interview.roomId, interview.status)}
                                                className={`flex items-center gap-2 px-5 py-3 rounded-2xl font-black text-xs uppercase tracking-wider transition-all active:scale-95 ${
                                                    isLive
                                                        ? 'bg-emerald-500 text-white shadow-xl shadow-emerald-500/30 animate-pulse-slow'
                                                        : 'bg-slate-900 text-white shadow-xl shadow-slate-900/10 hover:bg-indigo-600'
                                                }`}
                                            >
                                                <FiVideo className="text-sm" />
                                                {isLive ? 'JOIN NOW' : 'JOIN ROOM'}
                                            </button>
                                        )}

                                        {/* Evaluate (Client Only, after completed) */}
                                        {isClient && isCompleted && !hasEvaluation && (
                                            <button
                                                onClick={() => { setSelectedInterview(interview); setShowEvaluation(true); }}
                                                className="flex items-center gap-2 px-5 py-3 rounded-2xl font-black text-xs uppercase tracking-wider bg-indigo-600 text-white shadow-xl shadow-indigo-600/20 active:scale-95 transition-all hover:bg-indigo-500"
                                            >
                                                <FiAward className="text-sm" /> Evaluate
                                            </button>
                                        )}

                                        {/* Details Toggle */}
                                        <button
                                            onClick={() => setShowDetails(expanded ? null : interview._id)}
                                            className="flex items-center gap-2 px-5 py-3 rounded-2xl font-black text-xs uppercase tracking-wider bg-gray-50 text-gray-500 border border-gray-100 hover:border-gray-200 transition-all"
                                        >
                                            Details <FiChevronRight className={`text-sm transition-transform ${expanded ? 'rotate-90' : ''}`} />
                                        </button>

                                        {/* Cancel */}
                                        {isScheduled && (
                                            <button
                                                onClick={() => handleCancel(interview._id)}
                                                className="flex items-center gap-2 px-5 py-3 rounded-2xl font-black text-xs uppercase tracking-wider bg-red-50 text-red-400 border border-red-100 hover:border-red-200 transition-all"
                                            >
                                                <FiX className="text-sm" /> Cancel
                                            </button>
                                        )}
                                    </div>
                                </div>

                                {/* Expanded Details */}
                                {expanded && (
                                    <div className="border-t border-gray-50 px-6 pb-6 pt-4 space-y-4">
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                            {/* Job Info */}
                                            <div className="space-y-1">
                                                <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest">Position</p>
                                                <p className="text-sm font-bold text-gray-700">{interview.jobId?.title || 'N/A'}</p>
                                            </div>
                                            {/* Timezone */}
                                            <div className="space-y-1">
                                                <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest">Timezone</p>
                                                <p className="text-sm font-bold text-gray-700">{interview.timezone}</p>
                                            </div>
                                            {/* Room ID */}
                                            <div className="space-y-1">
                                                <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest">Room ID</p>
                                                <p className="text-xs font-mono text-gray-400 truncate">{interview.roomId}</p>
                                            </div>
                                        </div>

                                        {/* Notes */}
                                        {interview.notes && (
                                            <div className="p-4 bg-blue-50/50 border border-blue-100 rounded-2xl">
                                                <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-1 flex items-center gap-1">
                                                    <FiMessageSquare className="text-xs" /> Notes
                                                </p>
                                                <p className="text-sm text-blue-700 font-medium">{interview.notes}</p>
                                            </div>
                                        )}

                                        {/* Interview Questions */}
                                        {interview.questions?.length > 0 && (
                                            <div className="p-4 bg-indigo-50/50 border border-indigo-100 rounded-2xl">
                                                <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-2">Planned Questions</p>
                                                <ul className="space-y-1">
                                                    {interview.questions.map((q, i) => (
                                                        <li key={i} className="text-sm text-indigo-700 font-medium flex items-start gap-2">
                                                            <span className="text-indigo-400 font-black">{i + 1}.</span> {q}
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        )}

                                        {/* Evaluation Detail */}
                                        {hasEvaluation && (
                                            <div className="p-4 bg-emerald-50/50 border border-emerald-100 rounded-2xl space-y-3">
                                                <p className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">Evaluation Results</p>
                                                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                                    {['communication', 'technical', 'confidence', 'problemSolving'].map(key => (
                                                        <div key={key} className="text-center">
                                                            <p className="text-xl font-black text-gray-800">{interview.evaluation[key] || '—'}<span className="text-xs text-gray-400">/5</span></p>
                                                            <p className="text-[9px] text-gray-400 uppercase font-black">{key.replace(/([A-Z])/g, ' $1')}</p>
                                                        </div>
                                                    ))}
                                                </div>
                                                {interview.evaluation.feedback && (
                                                    <p className="text-sm text-gray-600 italic border-t border-emerald-100 pt-3">
                                                        &ldquo;{interview.evaluation.feedback}&rdquo;
                                                    </p>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default InterviewDashboard;
