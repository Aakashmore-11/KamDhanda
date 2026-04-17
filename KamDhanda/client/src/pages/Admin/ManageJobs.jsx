import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { serverObj } from '../../config/serverConfig';
import { Search, Filter, Trash2, ExternalLink, Briefcase, IndianRupee, MapPin, Zap } from 'lucide-react';
import { handleSuccessMsg, handleErrorMsg } from '../../config/toast';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const ManageJobs = () => {
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('All');
    const [searchQuery, setSearchQuery] = useState('');

    const fetchJobs = async () => {
        try {
            const res = await axios.get(`${serverObj.serverAPI}/admin/jobs`, {
                withCredentials: true
            });
            if (res.data.success) {
                setJobs(res.data.jobs);
            }
        } catch (error) {
            handleErrorMsg("Failed to load jobs");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchJobs();
    }, []);

    const handleDelete = async (jobId) => {
        if (!window.confirm("Are you sure you want to permanently delete this job? This will also remove all associated applications.")) return;

        try {
            const res = await axios.delete(
                `${serverObj.serverAPI}/admin/jobs/${jobId}`,
                { withCredentials: true }
            );
            if (res.data.success) {
                handleSuccessMsg(res.data.message);
                setJobs(jobs.filter(j => j._id !== jobId));
            }
        } catch (error) {
            handleErrorMsg(error.response?.data?.message || "Delete failed");
        }
    };

    const filteredJobs = jobs.filter(job => {
        const matchesFilter = filter === 'All' || job.jobType === filter || job.status === filter;
        const matchesSearch = job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (job.employerId && job.employerId.fullName.toLowerCase().includes(searchQuery.toLowerCase())) ||
            (job.location && job.location.toLowerCase().includes(searchQuery.toLowerCase()));
        return matchesFilter && matchesSearch;
    });

    if (loading) {
        return (
            <div className="h-full flex items-center justify-center min-h-[50vh]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            </div>
        );
    }

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
    };
    
    const itemVariants = {
        hidden: { opacity: 0, y: 10 },
        visible: { opacity: 1, y: 0 }
    };

    return (
        <div className="w-full space-y-6 pb-12 select-none">
            
            <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 bg-white p-6 md:p-8 rounded-3xl border border-slate-200 shadow-sm">
                <div>
                    <div className="flex items-center gap-2 mb-2">
                        <span className="flex items-center justify-center bg-amber-100 text-amber-600 w-8 h-8 rounded-lg shrink-0">
                            <Zap size={16} className="fill-amber-600 text-amber-100"/>
                        </span>
                        <span className="text-[10px] uppercase font-bold tracking-widest text-amber-600 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-100">Job Portal Engine</span>
                    </div>
                    <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Job Listing Management</h1>
                </div>
            </motion.div>

            {/* Filters and Search */}
            <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200 flex flex-col md:flex-row gap-6 justify-between items-center">
                <div className="relative w-full md:max-w-md">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input
                        type="text"
                        placeholder="Search title, client, or location..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-amber-500/10 focus:border-amber-500 transition-all font-bold text-sm text-slate-700"
                    />
                </div>

                <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto scroller-hide bg-slate-50 p-1.5 rounded-2xl border border-slate-100">
                    <Filter className="text-slate-400 mx-2 shrink-0" size={16} />
                    {['All', 'Full-time', 'Part-time', 'Contract', 'Remote'].map(tab => (
                        <button
                            key={tab}
                            onClick={() => setFilter(tab)}
                            className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${filter === tab
                                    ? 'bg-white text-amber-600 shadow-sm border border-slate-200'
                                    : 'bg-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-100'
                                }`}
                        >
                            {tab}
                        </button>
                    ))}
                </div>
            </motion.div>

            {/* Jobs Table */}
            <motion.div variants={containerVariants} initial="hidden" animate="visible" className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse min-w-[800px]">
                        <thead>
                            <tr className="bg-slate-50/80 border-b border-slate-100">
                                <th className="p-5 text-[10px] font-bold uppercase tracking-widest text-slate-400">Job Details</th>
                                <th className="p-5 text-[10px] font-bold uppercase tracking-widest text-slate-400">Listed By</th>
                                <th className="p-5 text-[10px] font-bold uppercase tracking-widest text-slate-400">Salary Range</th>
                                <th className="p-5 text-[10px] font-bold uppercase tracking-widest text-slate-400">Date Posted</th>
                                <th className="p-5 text-[10px] font-bold uppercase tracking-widest text-slate-400 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {filteredJobs.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="p-16 text-center">
                                        <div className="bg-slate-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-300">
                                            <Briefcase size={24} />
                                        </div>
                                        <p className="font-extrabold text-slate-700">No Jobs Found</p>
                                        <p className="text-sm font-bold text-slate-400 mt-1">Adjust your filters to see more listings.</p>
                                    </td>
                                </tr>
                            ) : (
                                filteredJobs.map((job, i) => (
                                    <motion.tr variants={itemVariants} key={job._id} className="hover:bg-slate-50 transition-colors group">
                                        <td className="p-5 max-w-[250px]">
                                            <p className="font-extrabold text-sm text-slate-900 truncate group-hover:text-amber-600 transition-colors" title={job.title}>{job.title}</p>
                                            <div className="flex items-center gap-2 mt-1">
                                                <span className="text-[10px] font-bold uppercase tracking-widest text-amber-600 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-100">{job.jobType}</span>
                                                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 flex items-center gap-1"><MapPin size={10}/>{job.location}</span>
                                            </div>
                                        </td>
                                        <td className="p-5">
                                            <div className="flex items-center gap-3">
                                                {job.employerId ? (
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-600 font-bold flex items-center justify-center text-xs shrink-0 border border-slate-200">
                                                            {job.employerId.fullName.charAt(0)}
                                                        </div>
                                                        <div>
                                                            <p className="font-bold text-sm text-slate-800">{job.employerId.fullName}</p>
                                                            <p className="text-[10px] font-bold text-slate-500 mt-0.5">{job.employerId.email}</p>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <span className="text-xs font-bold text-slate-400 italic bg-slate-50 px-3 py-1 rounded-lg">Unknown Listing</span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="p-5">
                                            <div className="flex items-center gap-1 text-slate-700 font-bold text-sm">
                                                <div className="bg-emerald-50 text-emerald-600 p-1 rounded-md border border-emerald-100 shrink-0">
                                                    <IndianRupee size={12} />
                                                </div>
                                                <span>{job.salaryRange?.min?.toLocaleString()} - {job.salaryRange?.max?.toLocaleString()}</span>
                                            </div>
                                        </td>
                                        <td className="p-5 text-sm font-bold text-slate-600">
                                            {new Date(job.createdAt).toLocaleDateString()}
                                        </td>
                                        <td className="p-5 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <Link
                                                    to={`/seeker/job/${job._id}`}
                                                    target="_blank"
                                                    className="p-2.5 text-slate-400 hover:text-amber-600 bg-slate-50 hover:bg-amber-50 border border-transparent hover:border-amber-100 rounded-xl transition-all"
                                                    title="View Public Job Page"
                                                >
                                                    <ExternalLink size={16} />
                                                </Link>
                                                <button
                                                    onClick={() => handleDelete(job._id)}
                                                    className="p-2.5 text-slate-400 hover:text-rose-600 bg-slate-50 hover:bg-rose-50 border border-transparent hover:border-rose-100 rounded-xl transition-all"
                                                    title="Delete Job"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </motion.tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </motion.div>
        </div>
    );
};

export default ManageJobs;
