import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { serverObj } from '../../config/serverConfig';
import { FiSearch, FiMapPin, FiBriefcase, FiFilter, FiX } from 'react-icons/fi';
import { IndianRupee, Frown } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

const JobsFeed = () => {
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedType, setSelectedType] = useState('All');
    const [selectedLocation, setSelectedLocation] = useState('All');
    const serverAPI = serverObj.serverAPI;

    useEffect(() => {
        const fetchJobs = async () => {
            try {
                const res = await axios.get(`${serverAPI}/jobs`);
                setJobs(res.data.jobs);
            } catch (error) {
                console.error("Error fetching jobs", error);
            } finally {
                setLoading(false);
            }
        };
        fetchJobs();
    }, [serverAPI]);

    const locations = ['All', ...new Set(jobs.map(job => job.location))];
    const jobTypes = ['All', 'Full-time', 'Part-time', 'Contract', 'Internship'];

    const filteredJobs = jobs.filter(job => {
        const matchesSearch = job.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                             job.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                             job.requiredSkills.some(skill => skill.toLowerCase().includes(searchTerm.toLowerCase()));
        
        const matchesType = selectedType === 'All' || job.jobType === selectedType;
        const matchesLocation = selectedLocation === 'All' || job.location === selectedLocation;

        return matchesSearch && matchesType && matchesLocation;
    });

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
    };
    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.4 } }
    };

    if (loading) return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
        </div>
    );

    return (
        <div className="min-h-screen pb-12 select-none w-full bg-slate-50 relative overflow-hidden">
            {/* Background Orbs */}
            <div className="fixed inset-0 w-full h-full pointer-events-none z-0 opacity-40 mix-blend-multiply flex justify-center">
                <div className="w-[600px] h-[600px] bg-emerald-200 rounded-full blur-[120px] absolute -top-40 right-10"></div>
                <div className="w-[400px] h-[400px] bg-sky-200 rounded-full blur-[100px] absolute top-40 -left-20"></div>
            </div>

            <div className="w-full py-12 relative z-10">
                {/* Header & Search */}
                <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-6">
                    <div>
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-white border border-emerald-100 text-emerald-600 rounded-full text-xs font-bold uppercase tracking-widest shadow-sm mb-4">
                            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                            Career Portal
                        </div>
                        <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight">Explore <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 to-sky-500">Opportunities</span></h1>
                        <p className="text-slate-500 mt-3 font-medium text-lg">Find your next career move among {jobs.length} open positions.</p>
                    </div>
                </motion.div>

                <div className="flex flex-col lg:flex-row gap-8">
                    {/* Filters Sidebar */}
                    <motion.aside initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="lg:w-72 flex-shrink-0">
                        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm sticky top-28">
                            <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100">
                                <h3 className="font-extrabold text-slate-800 flex items-center gap-2 text-lg">
                                    <FiFilter className="text-emerald-500" /> Filters
                                </h3>
                                {(selectedType !== 'All' || selectedLocation !== 'All' || searchTerm !== '') && (
                                    <button 
                                        onClick={() => { setSelectedType('All'); setSelectedLocation('All'); setSearchTerm(''); }}
                                        className="text-xs font-bold bg-rose-50 text-rose-500 px-3 py-1.5 rounded-lg hover:bg-rose-100 hover:text-rose-600 transition-colors uppercase tracking-wider"
                                    >
                                        Clear
                                    </button>
                                )}
                            </div>

                            <div className="space-y-6">
                                {/* Search input in sidebar */}
                                <div>
                                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3 block">Keyword Search</label>
                                    <div className="relative">
                                        <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                                        <input 
                                            type="text" 
                                            placeholder="Job title, skill..." 
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                            className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl shadow-sm focus:outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all font-medium text-slate-700 text-sm"
                                        />
                                    </div>
                                </div>

                                {/* Job Type Filter */}
                                <div>
                                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3 block">Employment Type</label>
                                    <div className="space-y-2">
                                        {jobTypes.map(type => (
                                            <button
                                                key={type}
                                                onClick={() => setSelectedType(type)}
                                                className={`w-full text-left px-4 py-2.5 rounded-xl text-sm font-bold transition-all ${selectedType === type ? 'bg-emerald-600 text-white shadow-md shadow-emerald-200' : 'bg-slate-50 text-slate-600 hover:bg-slate-100'}`}
                                            >
                                                {type}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Location Filter */}
                                <div>
                                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3 block">Location</label>
                                    <select 
                                        value={selectedLocation}
                                        onChange={(e) => setSelectedLocation(e.target.value)}
                                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-700 focus:outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all"
                                    >
                                        {locations.map(loc => (
                                            <option key={loc} value={loc}>{loc}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        </div>
                    </motion.aside>

                    {/* Job Grid */}
                    <div className="flex-1">
                        <AnimatePresence mode="wait">
                            {filteredJobs.length === 0 ? (
                                <motion.div 
                                    key="empty"
                                    initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
                                    className="text-center py-24 bg-white rounded-3xl border-2 border-dashed border-slate-200 shadow-sm"
                                >
                                    <div className="w-20 h-20 bg-indigo-50 rounded-full flex items-center justify-center mx-auto mb-6">
                                        <Frown size={40} className="text-indigo-300" />
                                    </div>
                                    <h3 className="text-2xl font-extrabold text-slate-800 mb-2">No roles matched</h3>
                                    <p className="text-slate-500 max-w-sm mx-auto">We couldn't find any positions matching your selected criteria. Try removing some filters.</p>
                                    <button onClick={() => { setSelectedType('All'); setSelectedLocation('All'); setSearchTerm(''); }} className="mt-6 text-indigo-600 font-bold hover:underline">Clear all filters</button>
                                </motion.div>
                            ) : (
                                <motion.div 
                                    key="grid"
                                    variants={containerVariants} initial="hidden" animate="visible"
                                    className="grid grid-cols-1 md:grid-cols-2 gap-6 place-items-stretch"
                                >
                                    {filteredJobs.map(job => (
                                        <motion.div variants={itemVariants} key={job._id} className="h-full">
                                            <div className="bg-white p-6 md:p-8 rounded-3xl border border-slate-200 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group h-full flex flex-col">
                                                <div className="flex justify-between items-start mb-6">
                                                    <div className="bg-emerald-50 p-3 rounded-2xl text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white transition-colors duration-300">
                                                        <FiBriefcase size={24} />
                                                    </div>
                                                    <span className={`text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-full border ${
                                                        job.jobType === 'Full-time' ? 'bg-green-50 text-green-700 border-green-100' :
                                                        job.jobType === 'Contract' ? 'bg-blue-50 text-blue-700 border-blue-100' :
                                                        'bg-purple-50 text-purple-700 border-purple-100'
                                                    }`}>
                                                        {job.jobType}
                                                    </span>
                                                </div>
                                                
                                                <h2 className="text-xl font-extrabold text-slate-900 mb-3 line-clamp-2">{job.title}</h2>
                                                
                                                <div className="flex flex-col gap-2.5 mb-6">
                                                    <div className="flex items-center text-sm font-medium text-slate-500">
                                                        <FiMapPin className="mr-2 text-slate-400" size={16} /> {job.location}
                                                    </div>
                                                    <div className="flex items-center text-sm font-bold text-slate-700">
                                                        <IndianRupee className="mr-1 text-slate-400" size={16} /> 
                                                        {job.salaryRange.min.toLocaleString()} - {job.salaryRange.max.toLocaleString()}
                                                    </div>
                                                </div>

                                                <div className="flex flex-wrap gap-2 mb-8 mt-auto">
                                                    {job.requiredSkills.slice(0, 3).map((skill, i) => (
                                                        <span key={i} className="text-[10px] bg-slate-50 px-2.5 py-1.5 rounded-lg text-slate-600 border border-slate-100 font-bold uppercase tracking-wide">{skill}</span>
                                                    ))}
                                                    {job.requiredSkills.length > 3 && (
                                                        <span className="text-[10px] bg-slate-50 text-slate-400 font-bold px-2 py-1.5 rounded-lg">+{job.requiredSkills.length - 3}</span>
                                                    )}
                                                </div>

                                                <Link 
                                                    to={`/seeker/job/${job._id}`} 
                                                    className="block w-full text-center py-3.5 bg-slate-900 text-white rounded-xl font-bold hover:bg-emerald-600 hover:shadow-lg hover:shadow-emerald-200 active:scale-95 transition-all text-sm"
                                                >
                                                    View Details & Apply
                                                </Link>
                                            </div>
                                        </motion.div>
                                    ))}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default JobsFeed;
