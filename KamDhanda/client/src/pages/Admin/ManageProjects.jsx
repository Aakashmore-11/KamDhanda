import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { serverObj } from '../../config/serverConfig';
import { Search, Filter, Trash2, ExternalLink, Briefcase, FileText, CheckCircle } from 'lucide-react';
import { handleSuccessMsg, handleErrorMsg } from '../../config/toast';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const ManageProjects = () => {
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('All');
    const [searchQuery, setSearchQuery] = useState('');

    const fetchProjects = async () => {
        try {
            const res = await axios.get(`${serverObj.serverAPI}/admin/projects`, {
                withCredentials: true
            });
            if (res.data.success) {
                setProjects(res.data.projects);
            }
        } catch (error) {
            handleErrorMsg("Failed to load projects");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProjects();
    }, []);

    const handleDelete = async (projectId) => {
        if (!window.confirm("Are you sure you want to permanently delete this project? This will also remove all associated proposals.")) return;

        try {
            const res = await axios.delete(
                `${serverObj.serverAPI}/admin/projects/${projectId}`,
                { withCredentials: true }
            );
            if (res.data.success) {
                handleSuccessMsg(res.data.message);
                setProjects(projects.filter(p => p._id !== projectId));
            }
        } catch (error) {
            handleErrorMsg(error.response?.data?.message || "Delete failed");
        }
    };

    const filteredProjects = projects.filter(project => {
        const matchesFilter = filter === 'All' || project.status === filter;
        const matchesSearch = project.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (project.client_id && project.client_id.fullName.toLowerCase().includes(searchQuery.toLowerCase()));
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
                        <span className="flex items-center justify-center bg-purple-100 text-purple-600 w-8 h-8 rounded-lg shrink-0">
                            <FileText size={16} />
                        </span>
                        <span className="text-[10px] uppercase font-bold tracking-widest text-purple-600 bg-purple-50 px-2.5 py-1 rounded-lg border border-purple-100">Project Engine</span>
                    </div>
                    <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Project Management</h1>
                </div>
            </motion.div>

            {/* Filters and Search */}
            <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200 flex flex-col md:flex-row gap-6 justify-between items-center">
                <div className="relative w-full md:max-w-md">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input
                        type="text"
                        placeholder="Search title or client..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-purple-500/10 focus:border-purple-500 transition-all font-bold text-sm text-slate-700"
                    />
                </div>

                <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto scroller-hide bg-slate-50 p-1.5 rounded-2xl border border-slate-100">
                    <Filter className="text-slate-400 mx-2 shrink-0" size={16} />
                    {['All', 'Open', 'Assigned', 'Completed', 'Closed'].map(tab => (
                        <button
                            key={tab}
                            onClick={() => setFilter(tab)}
                            className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${filter === tab
                                    ? 'bg-white text-purple-600 shadow-sm border border-slate-200'
                                    : 'bg-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-100'
                                }`}
                        >
                            {tab}
                        </button>
                    ))}
                </div>
            </motion.div>

            {/* Projects Table */}
            <motion.div variants={containerVariants} initial="hidden" animate="visible" className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse min-w-[800px]">
                        <thead>
                            <tr className="bg-slate-50/80 border-b border-slate-100">
                                <th className="p-5 text-[10px] font-bold uppercase tracking-widest text-slate-400">Project Details</th>
                                <th className="p-5 text-[10px] font-bold uppercase tracking-widest text-slate-400">Client Info</th>
                                <th className="p-5 text-[10px] font-bold uppercase tracking-widest text-slate-400">Status</th>
                                <th className="p-5 text-[10px] font-bold uppercase tracking-widest text-slate-400">Date Posted</th>
                                <th className="p-5 text-[10px] font-bold uppercase tracking-widest text-slate-400 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {filteredProjects.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="p-16 text-center">
                                        <div className="bg-slate-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-300">
                                            <Briefcase size={24} />
                                        </div>
                                        <p className="font-extrabold text-slate-700">No Projects Found</p>
                                        <p className="text-sm font-bold text-slate-400 mt-1">Adjust your filters to see more results.</p>
                                    </td>
                                </tr>
                            ) : (
                                filteredProjects.map((project, i) => (
                                    <motion.tr variants={itemVariants} key={project._id} className="hover:bg-slate-50 transition-colors group">
                                        <td className="p-5 max-w-[250px]">
                                            <p className="font-extrabold text-sm text-slate-900 truncate group-hover:text-purple-600 transition-colors" title={project.title}>{project.title}</p>
                                            <div className="flex items-center gap-2 mt-1">
                                                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">{project.category}</span>
                                                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">{project.budgetType}</span>
                                            </div>
                                        </td>
                                        <td className="p-5">
                                            <div className="flex items-center gap-3">
                                                {project.client_id ? (
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 font-bold flex items-center justify-center text-xs shrink-0">
                                                            {project.client_id.fullName.charAt(0)}
                                                        </div>
                                                        <div>
                                                            <p className="font-bold text-sm text-slate-800">{project.client_id.fullName}</p>
                                                            {project.client_id.isBlocked && (
                                                                <span className="text-[10px] font-bold uppercase tracking-widest text-rose-600 bg-rose-50 px-2 py-0.5 rounded-md mt-1 inline-block">Blocked</span>
                                                            )}
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <span className="text-xs font-bold text-slate-400 italic bg-slate-50 px-3 py-1 rounded-lg">Unknown Client</span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="p-5">
                                            <div className="flex flex-col items-start gap-1.5">
                                                <span className={`inline-flex items-center justify-center px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-widest border ${
                                                    project.status === 'Open' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                                                    project.status === 'Assigned' ? 'bg-indigo-50 text-indigo-600 border-indigo-100' :
                                                    project.status === 'Completed' ? 'bg-sky-50 text-sky-600 border-sky-100' :
                                                    'bg-slate-50 text-slate-500 border-slate-200'
                                                }`}>
                                                    {project.status === 'Completed' && <CheckCircle size={10} className="mr-1" />}
                                                    {project.status}
                                                </span>
                                                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                                                    {project.proposals?.length || 0} PROPOSALS
                                                </span>
                                            </div>
                                        </td>
                                        <td className="p-5 text-sm font-bold text-slate-600">
                                            {new Date(project.createdAt).toLocaleDateString()}
                                        </td>
                                        <td className="p-5 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <Link
                                                    to={`/project/${project._id}`}
                                                    target="_blank"
                                                    className="p-2.5 text-slate-400 hover:text-indigo-600 bg-slate-50 hover:bg-indigo-50 border border-transparent hover:border-indigo-100 rounded-xl transition-all"
                                                    title="View Public Project Page"
                                                >
                                                    <ExternalLink size={16} />
                                                </Link>
                                                <button
                                                    onClick={() => handleDelete(project._id)}
                                                    className="p-2.5 text-slate-400 hover:text-rose-600 bg-slate-50 hover:bg-rose-50 border border-transparent hover:border-rose-100 rounded-xl transition-all"
                                                    title="Delete Project"
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

export default ManageProjects;
