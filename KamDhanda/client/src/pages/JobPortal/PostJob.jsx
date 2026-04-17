import React, { useState } from 'react';
import axios from 'axios';
import { serverObj } from '../../config/serverConfig';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { Briefcase, MapPin, AlignLeft, Tag, IndianRupee, Send, Building } from 'lucide-react';
import { motion } from 'framer-motion';

const PostJob = () => {
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        location: '',
        minSalary: '',
        maxSalary: '',
        jobType: 'Full-time',
        requiredSkills: ''
    });
    const [loading, setLoading] = useState(false);
    const serverAPI = serverObj.serverAPI;
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await axios.post(`${serverAPI}/jobs`, {
                ...formData,
                requiredSkills: formData.requiredSkills.split(',').map(s => s.trim())
            }, { withCredentials: true });
            
            if (res.data.success) {
                toast.success("Job posted successfully!");
                navigate('/client/manage-jobs');
            }
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to post job");
        } finally {
            setLoading(false);
        }
    };

    const formVariants = {
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
    };
    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.4 } }
    };

    return (
        <div className="min-h-screen pb-12 select-none w-full bg-slate-50 relative overflow-hidden">
            {/* Background Orbs */}
            <div className="fixed inset-0 w-full h-full pointer-events-none z-0 opacity-40 mix-blend-multiply flex justify-center">
                <div className="w-[500px] h-[500px] bg-emerald-200 rounded-full blur-[100px] absolute -top-40 right-20"></div>
            </div>

            <div className="relative z-10 w-full py-8 text-left">
                
                {/* Header */}
                <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-10 text-center md:text-left">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-white border border-emerald-100 text-emerald-600 rounded-full text-xs font-bold uppercase tracking-widest shadow-sm mb-4">
                        Job Portal
                    </div>
                    <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 leading-tight">
                        Post a full-time role
                    </h1>
                    <p className="text-slate-500 mt-2 font-medium">Find your next star employee and grow your business.</p>
                </motion.div>

                <motion.form variants={formVariants} initial="hidden" animate="visible" onSubmit={handleSubmit} className="space-y-6">
                    
                    {/* Basic Info */}
                    <motion.div variants={itemVariants} className="bg-white p-6 md:p-8 rounded-3xl border border-slate-200 shadow-sm">
                        <h2 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2 border-b border-slate-100 pb-4">
                           <Briefcase className="text-emerald-500" size={20} /> Basic Information
                        </h2>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Job Title</label>
                                <input
                                    required
                                    name="title"
                                    value={formData.title}
                                    onChange={handleChange}
                                    placeholder="e.g. Senior Frontend Developer"
                                    className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-sm rounded-xl px-4 py-3 outline-none transition-all focus:bg-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 shadow-sm"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Location</label>
                                <div className="relative flex items-center">
                                    <span className="absolute left-4 text-slate-400"><MapPin size={18} /></span>
                                    <input
                                        required
                                        name="location"
                                        value={formData.location}
                                        onChange={handleChange}
                                        placeholder="e.g. Remote, NYC, or Pune"
                                        className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-sm rounded-xl pl-11 pr-4 py-3 outline-none transition-all focus:bg-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 shadow-sm"
                                    />
                                </div>
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Job Description</label>
                            <textarea
                                required
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                                rows="6"
                                placeholder="Describe the role, responsibilities, and requirements..."
                                className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-sm rounded-xl px-4 py-3 outline-none transition-all focus:bg-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 shadow-sm resize-y"
                            ></textarea>
                        </div>
                    </motion.div>

                    {/* Job Details */}
                    <motion.div variants={itemVariants} className="bg-white p-6 md:p-8 rounded-3xl border border-slate-200 shadow-sm">
                        <h2 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2 border-b border-slate-100 pb-4">
                           <Building className="text-indigo-500" size={20} /> Compensation & Type
                        </h2>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Min Salary (₹)</label>
                                <div className="relative flex items-center">
                                    <span className="absolute left-4 text-slate-400"><IndianRupee size={18} /></span>
                                    <input
                                        required
                                        type="number"
                                        name="minSalary"
                                        value={formData.minSalary}
                                        onChange={handleChange}
                                        placeholder="50,000"
                                        className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-sm rounded-xl pl-11 pr-4 py-3 outline-none transition-all focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 shadow-sm"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Max Salary (₹)</label>
                                <div className="relative flex items-center">
                                    <span className="absolute left-4 text-slate-400"><IndianRupee size={18} /></span>
                                    <input
                                        required
                                        type="number"
                                        name="maxSalary"
                                        value={formData.maxSalary}
                                        onChange={handleChange}
                                        placeholder="80,000"
                                        className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-sm rounded-xl pl-11 pr-4 py-3 outline-none transition-all focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 shadow-sm"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Job Type</label>
                                <select
                                    name="jobType"
                                    value={formData.jobType}
                                    onChange={handleChange}
                                    className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-sm rounded-xl px-4 py-3 outline-none transition-all focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 shadow-sm"
                                >
                                    <option>Full-time</option>
                                    <option>Part-time</option>
                                    <option>Contract</option>
                                    <option>Internship</option>
                                </select>
                            </div>
                        </div>
                    </motion.div>

                    {/* Requirements */}
                    <motion.div variants={itemVariants} className="bg-white p-6 md:p-8 rounded-3xl border border-slate-200 shadow-sm">
                        <h2 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2 border-b border-slate-100 pb-4">
                           <Tag className="text-amber-500" size={20} /> Requirements
                        </h2>
                        
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Required Skills</label>
                            <input
                                required
                                name="requiredSkills"
                                value={formData.requiredSkills}
                                onChange={handleChange}
                                placeholder="React, Node.js, MongoDB (separate with commas)"
                                className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-sm rounded-xl px-4 py-3 outline-none transition-all focus:bg-white focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10 shadow-sm"
                            />
                        </div>
                    </motion.div>

                    {/* Form Actions */}
                    <motion.div variants={itemVariants} className="flex justify-end pt-4">
                        <button
                            type="submit"
                            disabled={loading}
                            className="px-8 py-4 bg-emerald-600 text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-emerald-700 active:scale-95 transition-all shadow-lg shadow-emerald-200 disabled:opacity-70 w-full md:w-auto text-lg"
                        >
                            <Send size={20} />
                            {loading ? 'Posting...' : 'Post Job Opening'}
                        </button>
                    </motion.div>

                </motion.form>
            </div>
        </div>
    );
};

export default PostJob;
