import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { serverObj } from '../../config/serverConfig';
import { toast } from 'react-hot-toast';
import { FiMapPin, FiBriefcase, FiClock, FiCheckCircle, FiChevronLeft, FiFileText } from 'react-icons/fi';
import { IndianRupee, Send, ShieldCheck, MapPin, Briefcase } from 'lucide-react';
import useAuth from '../../customHooks/useAuth';
import { motion } from 'framer-motion';

const JobDetails = () => {
    const { id } = useParams();
    const [job, setJob] = useState(null);
    const [loading, setLoading] = useState(true);
    const [applying, setApplying] = useState(false);
    const [coverLetter, setCoverLetter] = useState('');
    const [resume, setResume] = useState(null);
    const [useProfileResume, setUseProfileResume] = useState(false);
    const [hasApplied, setHasApplied] = useState(false);
    const { user } = useAuth();
    const serverAPI = serverObj.serverAPI;
    const navigate = useNavigate();

    useEffect(() => {
        const fetchJobAndApplication = async () => {
            try {
                const [jobRes, appsRes] = await Promise.all([
                    axios.get(`${serverAPI}/jobs/${id}`, { withCredentials: true }),
                    axios.get(`${serverAPI}/applications/seeker`, { withCredentials: true })
                ]);
                
                setJob(jobRes.data.job);
                
                const existingApp = appsRes.data.applications?.find(app => app.jobId?._id === id || app.jobId === id);
                if (existingApp) {
                    setHasApplied(true);
                    setCoverLetter(existingApp.coverLetter || '');
                }
            } catch (error) {
                toast.error("Error fetching data");
            } finally {
                setLoading(false);
            }
        };
        fetchJobAndApplication();
    }, [id, serverAPI]);

    const handleApply = async (e) => {
        e.preventDefault();
        if (!useProfileResume && !resume && !hasApplied) return toast.error("Please upload your resume");

        setApplying(true);
        const formData = new FormData();
        formData.append('coverLetter', coverLetter);
        
        if (useProfileResume) {
            if(!user?.resume) return toast.error("No resume found on profile. Please upload one.");
            formData.append('resumeUrl', user.resume);
        } else if (resume) {
            formData.append('resumePdf', resume);
        }

        try {
            const res = await axios.post(`${serverAPI}/applications/${id}/apply`, formData, {
                withCredentials: true
            });
            if (res.data.success) {
                toast.success(res.data.message);
                navigate('/seeker/my-applications');
            }
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to submit application");
        } finally {
            setApplying(false);
        }
    };

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
    };
    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.4 } }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-600"></div>
            </div>
        );
    }
    
    if (!job) return <div className="text-center py-20 font-bold text-slate-500 min-h-screen bg-slate-50">Job not found</div>;

    return (
        <div className="min-h-screen pb-12 select-none w-full bg-slate-50 relative overflow-hidden">
            {/* Background */}
            <div className="fixed inset-0 w-full h-full pointer-events-none z-0 opacity-40 mix-blend-multiply flex justify-center">
                <div className="w-[500px] h-[500px] bg-emerald-200 rounded-full blur-[100px] absolute -top-40 right-10"></div>
            </div>

            <div className="relative z-10 w-full py-8 pt-6">
                
                {/* Back Navigation */}
                <button
                    onClick={() => navigate(-1)}
                    className="flex items-center gap-1.5 text-slate-500 hover:text-emerald-600 font-bold transition-colors mb-6 group"
                >
                    <FiChevronLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
                    Back to Jobs
                </button>

                <motion.div variants={containerVariants} initial="hidden" animate="visible" className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    
                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-8">
                        
                        {/* Header Card */}
                        <motion.div variants={itemVariants} className="bg-white p-6 md:p-8 rounded-3xl border border-slate-200 shadow-sm">
                            <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
                                <div className="flex gap-4">
                                    <div className="w-14 h-14 shrink-0 rounded-2xl flex items-center justify-center text-emerald-600 bg-emerald-50 shadow-md">
                                        <Briefcase size={28} />
                                    </div>
                                    <div>
                                        <div className="flex flex-wrap gap-2 mb-3">
                                            <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-[10px] uppercase tracking-widest font-bold border rounded-xl
                                            ${job.jobType === "Full-time" ? "bg-emerald-50 text-emerald-700 border-emerald-100" :
                                              job.jobType === "Contract" ? "bg-sky-50 text-sky-700 border-sky-100" :
                                              "bg-purple-50 text-purple-700 border-purple-100"}`}>
                                                {job.jobType}
                                            </span>
                                            <span className="inline-flex px-3 py-1.5 text-[10px] uppercase tracking-widest font-bold bg-slate-50 text-slate-500 border border-slate-200 rounded-xl">
                                                Posted {new Date(job.createdAt).toLocaleDateString()}
                                            </span>
                                        </div>
                                        <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 leading-tight">
                                            {job.title}
                                        </h1>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-8 grid grid-cols-2 md:grid-cols-3 gap-4 pt-6 border-t border-slate-100">
                                <div>
                                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-1">Location</p>
                                    <p className="text-sm font-bold text-slate-700 flex items-center gap-1.5"><MapPin size={16} className="text-slate-400"/> {job.location}</p>
                                </div>
                                <div className="col-span-2 md:col-span-1">
                                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-1">Salary Range</p>
                                    <p className="text-sm font-bold text-slate-700 flex items-center gap-1.5">
                                        <IndianRupee size={16} className="text-slate-400"/> 
                                        {job.salaryRange?.min?.toLocaleString('en-IN')} - {job.salaryRange?.max?.toLocaleString('en-IN')}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-1">Experience</p>
                                    <p className="text-sm font-bold text-slate-700 flex items-center gap-1.5"><ShieldCheck size={16} className="text-slate-400"/> Junior-Mid</p>
                                </div>
                            </div>
                        </motion.div>

                        {/* Description Card */}
                        <motion.div variants={itemVariants} className="bg-white p-6 md:p-8 rounded-3xl border border-slate-200 shadow-sm">
                            <h2 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2 border-b border-slate-100 pb-4">
                                <FiFileText size={20} className="text-emerald-500" /> Job Description
                            </h2>
                            <div className="text-slate-600 text-sm leading-relaxed space-y-4 font-medium whitespace-pre-wrap">
                                {job.description}
                            </div>
                        </motion.div>

                        {/* Required Skills Card */}
                        <motion.div variants={itemVariants} className="bg-white p-6 md:p-8 rounded-3xl border border-slate-200 shadow-sm">
                            <h2 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2 border-b border-slate-100 pb-4">
                                <FiCheckCircle size={20} className="text-emerald-500" /> Requirements
                            </h2>
                            <div className="flex flex-wrap gap-2">
                                {job.requiredSkills?.map((skill, index) => (
                                    <div key={index} className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 text-xs font-bold uppercase tracking-wide">
                                        <FiCheckCircle className="text-emerald-500" size={14} /> {skill}
                                    </div>
                                ))}
                            </div>
                        </motion.div>

                    </div>

                    {/* Sidebar */}
                    <div className="lg:col-span-1 space-y-6">
                        
                        {/* Application Card */}
                        <motion.div variants={itemVariants} className="bg-white p-6 md:p-8 rounded-3xl border border-slate-200 shadow-sm sticky top-28">
                            <h3 className="text-xl font-extrabold text-slate-900 mb-2">{hasApplied ? 'Update Application' : 'Apply Now'}</h3>
                            <p className="text-sm font-medium text-slate-500 mb-6 pb-6 border-b border-slate-100">
                                {hasApplied ? 'You have already applied. You can refine your response below.' : 'Submit your application directly to the hiring team.'}
                            </p>

                            <form onSubmit={handleApply} className="space-y-6">
                                
                                <div className="space-y-4">
                                    {/* Resume Checkbox */}
                                    {user?.resume && (
                                        <div className="flex items-center gap-3 p-4 bg-emerald-50 rounded-2xl border border-emerald-100 cursor-pointer hover:bg-emerald-100/50 transition-colors" onClick={() => setUseProfileResume(!useProfileResume)}>
                                            <input 
                                                type="checkbox" 
                                                checked={useProfileResume}
                                                onChange={(e) => setUseProfileResume(e.target.checked)}
                                                className="w-4 h-4 text-emerald-600 focus:ring-emerald-500 border-emerald-300 rounded pointer-events-none"
                                            />
                                            <div className="flex flex-col pointer-events-none">
                                                <span className="text-sm font-bold text-emerald-800 flex items-center gap-1.5">
                                                    <FiFileText size={16} /> Use profile resume
                                                </span>
                                            </div>
                                        </div>
                                    )}

                                    {/* Resume Upload */}
                                    {!useProfileResume && (
                                        <div>
                                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Upload Resume (PDF)</label>
                                            <div className="relative">
                                                <input 
                                                    type="file" 
                                                    accept=".pdf"
                                                    required={!useProfileResume}
                                                    onChange={(e) => setResume(e.target.files[0])}
                                                    className="w-full text-slate-500 text-sm file:mr-4 file:py-3 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:uppercase file:tracking-wider file:bg-slate-100 file:text-slate-600 hover:file:bg-slate-200 transition-all cursor-pointer bg-slate-50 border border-slate-200 rounded-xl"
                                                />
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Cover Letter</label>
                                    <textarea 
                                        rows="4" 
                                        placeholder="Briefly explain why you're a great fit..."
                                        value={coverLetter}
                                        onChange={(e) => setCoverLetter(e.target.value)}
                                        className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-sm rounded-xl px-4 py-3 outline-none transition-all focus:bg-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 shadow-sm resize-y"
                                    ></textarea>
                                </div>

                                <button 
                                    disabled={applying}
                                    type="submit"
                                    className="w-full py-4 bg-emerald-600 text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-emerald-700 active:scale-95 transition-all shadow-lg shadow-emerald-200 disabled:opacity-70 disabled:active:scale-100"
                                >
                                    <Send size={18} />
                                    {applying ? 'Submitting...' : hasApplied ? 'Update Application' : 'Send Application'}
                                </button>
                            </form>
                        </motion.div>

                    </div>

                </motion.div>
            </div>
        </div>
    );
};

export default JobDetails;
