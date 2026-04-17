import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { serverObj } from '../../config/serverConfig';
import { toast } from 'react-hot-toast';
import { FiArrowLeft, FiMail, FiDownload, FiCheck, FiX, FiEye, FiZap, FiCalendar, FiAward, FiUserPlus, FiTrendingUp } from 'react-icons/fi';
import CreateMockTest from '../../components/HiringWorkflow/CreateMockTest';
import InterviewForm from '../../components/HiringWorkflow/InterviewForm';
import ReviewTest from '../../components/HiringWorkflow/ReviewTest';

const JobApplications = () => {
    const { jobId } = useParams();
    const [applicants, setApplicants] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeModal, setActiveModal] = useState(null); // 'test' | 'interview' | 'review' | null
    const [selectedApp, setSelectedApp] = useState(null);
    const serverAPI = serverObj.serverAPI;
    const navigate = useNavigate();

    const fetchApplicants = async () => {
        try {
            const res = await axios.get(`${serverAPI}/applications/job/${jobId}`, { withCredentials: true });
            // Filter out applications where seekerId is null (e.g. user was deleted)
            const validApplications = (res.data.applications || []).filter(app => app.seekerId);
            setApplicants(validApplications);
        } catch (error) {
            toast.error("Error fetching applicants");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchApplicants();
    }, [jobId, serverAPI]);

    const getPreviewUrl = (url) => {
        if (!url) return "#";
        const safeUrl = url.replace("http://", "https://");
        return `https://docs.google.com/gview?embedded=true&url=${encodeURIComponent(safeUrl)}`;
    };

    const getDownloadUrl = (url) => {
        if (!url) return "#";
        let safeUrl = url.replace("http://", "https://");
        if (safeUrl.includes("res.cloudinary.com") && safeUrl.includes("/upload/")) {
            return safeUrl.replace("/upload/", "/upload/fl_attachment/");
        }
        return safeUrl;
    };

    const handleStatusUpdate = async (appId, newStatus) => {
        try {
            const res = await axios.patch(
                `${serverAPI}/applications/${appId}/status`,
                { status: newStatus },
                { withCredentials: true }
            );

            if (res.data.success) {
                toast.success(`Status updated to ${newStatus}`);
                fetchApplicants();
            }
        } catch (error) {
            toast.error("Failed to update status");
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'Accepted': return 'bg-blue-50 text-blue-600 border-blue-100';
            case 'MockTest': return 'bg-indigo-50 text-indigo-600 border-indigo-100';
            case 'Interview': return 'bg-purple-50 text-purple-600 border-purple-100';
            case 'Hired': return 'bg-emerald-50 text-emerald-600 border-emerald-100';
            case 'Rejected': return 'bg-rose-50 text-rose-600 border-rose-100';
            default: return 'bg-gray-50 text-gray-500 border-gray-100';
        }
    };

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center bg-white">
          <div className="flex flex-col items-center gap-4">
             <div className="w-12 h-12 border-4 border-slate-900 border-t-transparent rounded-full animate-spin"></div>
             <p className="font-black text-xs uppercase tracking-widest text-slate-400">Screening Talent...</p>
          </div>
       </div>
    );

    return (
        <div className="min-h-screen bg-slate-50/50 p-4 lg:p-10 font-sans">
            <div className="max-w-7xl mx-auto">
                <button
                    onClick={() => navigate(-1)}
                    className="group flex items-center gap-3 mb-10"
                >
                    <div className="p-3 rounded-full bg-white shadow-sm group-hover:bg-slate-900 group-hover:text-white transition-all">
                        <FiArrowLeft className="w-5 h-5" />
                    </div>
                    <span className="text-xs font-black uppercase tracking-widest text-slate-400">Back to Jobs</span>
                </button>

                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
                    <div>
                        <h1 className="text-4xl font-black text-slate-900 tracking-tight mb-2">Applicants Hub</h1>
                        <p className="text-slate-500 font-medium tracking-tight">Structured hiring workflow for your active job posting.</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-6">
                    {applicants.map((app, index) => (
                        <div 
                            key={app._id} 
                            className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-2xl hover:shadow-slate-200 transition-all duration-500 flex flex-col xl:flex-row gap-10 group"
                            style={{ animationDelay: `${index * 100}ms` }}
                        >
                            {/* Candidate Info */}
                            <div className="flex gap-6 shrink-0 lg:w-1/3">
                                <div className="relative">
                                    <img
                                        src={app.seekerId?.profilePic || `https://ui-avatars.com/api/?name=${encodeURIComponent(app.seekerId?.fullName || 'User')}&background=random`}
                                        className="w-24 h-24 rounded-[2rem] object-cover ring-8 ring-slate-50"
                                        alt={app.seekerId?.fullName}
                                    />
                                    <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-emerald-500 rounded-2xl border-4 border-white flex items-center justify-center">
                                        <FiCheck className="text-white w-4 h-4" />
                                    </div>
                                </div>
                                <div className="space-y-3">
                                    <div>
                                        <h3 className="text-xl font-black text-slate-900">{app.seekerId?.fullName}</h3>
                                        <p className="text-slate-400 text-xs font-bold flex items-center gap-2 mt-1">
                                            <FiMail className="text-indigo-400" /> {app.seekerId?.email}
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className={`inline-flex px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${getStatusColor(app.status)}`}>
                                            {app.status}
                                        </div>
                                        {app.testResult && (
                                            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 text-white rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg shadow-indigo-200">
                                                <FiTrendingUp /> {Math.round((app.testResult.score / app.testResult.totalMarks) * 100)}%
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex flex-wrap gap-1.5 pt-2">
                                        {app.seekerId?.skills?.slice(0, 3).map((skill, i) => (
                                            <span key={i} className="text-[9px] px-2.5 py-1 bg-slate-50 border border-slate-100 rounded-lg text-slate-500 font-black uppercase tracking-tighter">
                                                {skill}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Pitch & Resume */}
                            <div className="flex-1 space-y-6 pt-4 xl:pt-0">
                                <div>
                                    <h4 className="text-[9px] font-black uppercase text-slate-400 tracking-widest mb-3">Professional Pitch</h4>
                                    <p className="text-sm text-slate-600 font-medium leading-relaxed italic line-clamp-3">
                                        "{app.coverLetter || "I am highly interested in this role and believe my skills align perfectly."}"
                                    </p>
                                </div>
                                
                                <div className="flex flex-wrap gap-3">
                                    <a
                                        href={getPreviewUrl(app.resumeUrl)}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="flex items-center gap-2 px-6 py-3 bg-slate-100 text-slate-600 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-200 transition-all"
                                    >
                                        <FiEye /> View Resume
                                    </a>
                                    <a
                                        href={getDownloadUrl(app.resumeUrl)}
                                        className="flex items-center gap-2 px-6 py-3 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-800 transition-all shadow-xl shadow-slate-900/10"
                                    >
                                        <FiDownload /> Download PDF
                                    </a>
                                </div>
                            </div>

                            {/* Workflow Actions */}
                            <div className="shrink-0 flex flex-col justify-between gap-4 xl:items-end xl:w-1/4">
                               <div className="space-y-3 w-full">
                                    {app.status === 'Applied' && (
                                        <button
                                            onClick={() => handleStatusUpdate(app._id, 'Accepted')}
                                            className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-indigo-600 text-white rounded-2xl text-[11px] font-black uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-2xl shadow-indigo-600/20 active:scale-95"
                                        >
                                            <FiCheck /> Accept Application
                                        </button>
                                    )}

                                    {['Accepted', 'MockTest'].includes(app.status) && (
                                        <button
                                            onClick={() => { setSelectedApp(app); setActiveModal('test'); }}
                                            className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-slate-900 text-white rounded-2xl text-[11px] font-black uppercase tracking-widest hover:bg-indigo-600 transition-all shadow-2xl shadow-slate-900/10 active:scale-95"
                                        >
                                            <FiZap className="text-amber-400" /> {app.status === 'MockTest' ? 'Manage/Re-send Mock Test' : 'Send Mock Test'}
                                        </button>
                                    )}

                                    {app.testResult && (
                                        <button
                                            onClick={() => { setSelectedApp(app); setActiveModal('review'); }}
                                            className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-emerald-50 text-emerald-600 border border-emerald-100 rounded-2xl text-[11px] font-black uppercase tracking-widest hover:bg-emerald-100 transition-all shadow-lg shadow-emerald-600/5 active:scale-95"
                                        >
                                            <FiTrendingUp /> Review Exam Performance
                                        </button>
                                    )}

                                    {app.status === 'Interview' && (
                                        <button
                                            onClick={() => { setSelectedApp(app); setActiveModal('interview'); }}
                                            className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-purple-600 text-white rounded-2xl text-[11px] font-black uppercase tracking-widest hover:bg-purple-700 transition-all shadow-2xl shadow-purple-600/20 active:scale-95"
                                        >
                                            <FiCalendar /> Schedule Interview
                                        </button>
                                    )}

                                    {(app.status === 'Interview' || app.status === 'Accepted') && (
                                         <button
                                            onClick={() => handleStatusUpdate(app._id, 'Hired')}
                                            className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-emerald-500 text-white rounded-2xl text-[11px] font-black uppercase tracking-widest hover:bg-emerald-600 transition-all shadow-2xl shadow-emerald-500/20 active:scale-95"
                                        >
                                            <FiUserPlus /> Hire Immediately
                                        </button>
                                    )}

                                    {['Applied', 'Accepted', 'MockTest', 'Interview'].includes(app.status) && (
                                        <button
                                            onClick={() => handleStatusUpdate(app._id, 'Rejected')}
                                            className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-white border border-slate-200 text-rose-500 rounded-2xl text-[11px] font-black uppercase tracking-widest hover:bg-rose-50 transition-all active:scale-95"
                                        >
                                            <FiX /> Decline
                                        </button>
                                    )}
                               </div>

                               <p className="text-[9px] text-slate-400 font-bold uppercase text-center xl:text-right">
                                   Applied {new Date(app.createdAt).toLocaleDateString()}
                               </p>
                            </div>
                        </div>
                    ))}

                    {applicants.length === 0 && (
                        <div className="p-32 bg-white rounded-[3rem] border-2 border-dashed border-slate-100 text-center flex flex-col items-center justify-center">
                            <div className="w-20 h-20 bg-slate-50 rounded-3xl flex items-center justify-center mb-6">
                                <FiAward className="w-10 h-10 text-slate-200" />
                            </div>
                            <h3 className="text-xl font-black text-slate-900 mb-2">No Talent Yet</h3>
                            <p className="text-slate-400 font-medium max-w-xs mx-auto">Your job posting is live. We'll notify you when professional experts start applying.</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Modals */}
            {activeModal === 'test' && (
                <div className="fixed inset-0 z-[100] bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-6 lg:p-12">
                   <div className="w-full max-w-4xl relative">
                        <CreateMockTest 
                            jobId={jobId} 
                            onTestCreated={async () => {
                                await handleStatusUpdate(selectedApp._id, 'MockTest');
                                setActiveModal(null);
                            }} 
                            onCancel={() => setActiveModal(null)}
                        />
                   </div>
                </div>
            )}

            {activeModal === 'interview' && (
                <div className="fixed inset-0 z-[100] bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-6">
                   <div className="w-full max-w-xl">
                        <InterviewForm 
                            jobId={jobId}
                            applicationId={selectedApp._id}
                            seekerId={selectedApp.seekerId._id}
                            onScheduled={() => {
                                setActiveModal(null);
                                fetchApplicants();
                            }}
                        />
                        <button 
                            onClick={() => setActiveModal(null)}
                            className="w-full mt-4 text-white text-xs font-black uppercase tracking-widest opacity-50 hover:opacity-100 transition-all"
                        >
                            Back to List
                        </button>
                   </div>
                </div>
            )}

            {activeModal === 'review' && selectedApp?.testResult && (
                <div className="fixed inset-0 z-[100] bg-slate-950/90 backdrop-blur-xl flex items-center justify-center p-6 lg:p-12">
                    <div className="w-full max-w-5xl">
                        <ReviewTest 
                            testId={selectedApp.testResult.testId}
                            result={selectedApp.testResult}
                            onBack={() => setActiveModal(null)}
                        />
                    </div>
                </div>
            )}
        </div>
    );
};

export default JobApplications;