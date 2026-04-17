import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { serverObj } from '../../config/serverConfig';
import { Plus, Trash2, Search, BookOpen, Layers } from 'lucide-react';
import { handleSuccessMsg, handleErrorMsg } from '../../config/toast';
import { motion, AnimatePresence } from 'framer-motion';

const ManageSkills = () => {
    const [skills, setSkills] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [newSkillName, setNewSkillName] = useState('');
    const [newSkillCategory, setNewSkillCategory] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const fetchSkills = async () => {
        try {
            const res = await axios.get(`${serverObj.serverAPI}/admin/skills`, {
                withCredentials: true
            });
            if (res.data.success) {
                setSkills(res.data.skills);
            }
        } catch (error) {
            handleErrorMsg("Failed to load skills");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSkills();
    }, []);

    const handleAddSkill = async (e) => {
        e.preventDefault();
        if (!newSkillName.trim()) return;

        setIsSubmitting(true);
        try {
            const res = await axios.post(
                `${serverObj.serverAPI}/admin/skills`,
                { name: newSkillName.trim(), category: newSkillCategory.trim() || 'General' },
                { withCredentials: true }
            );
            if (res.data.success) {
                handleSuccessMsg(res.data.message);
                setSkills([...skills, res.data.skill].sort((a, b) => a.name.localeCompare(b.name)));
                setNewSkillName('');
                setNewSkillCategory('');
            }
        } catch (error) {
            handleErrorMsg(error.response?.data?.message || "Failed to add skill");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async (skillId) => {
        if (!window.confirm("Are you sure you want to delete this skill?")) return;

        try {
            const res = await axios.delete(
                `${serverObj.serverAPI}/admin/skills/${skillId}`,
                { withCredentials: true }
            );
            if (res.data.success) {
                handleSuccessMsg(res.data.message);
                setSkills(skills.filter(s => s._id !== skillId));
            }
        } catch (error) {
            handleErrorMsg(error.response?.data?.message || "Delete failed");
        }
    };

    const filteredSkills = skills.filter(skill =>
        skill.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        skill.category.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Group skills by category for better display
    const groupedSkills = filteredSkills.reduce((acc, skill) => {
        acc[skill.category] = acc[skill.category] || [];
        acc[skill.category].push(skill);
        return acc;
    }, {});

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
                        <span className="flex items-center justify-center bg-indigo-100 text-indigo-600 w-8 h-8 rounded-lg shrink-0">
                            <Layers size={16} />
                        </span>
                        <span className="text-[10px] uppercase font-bold tracking-widest text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-lg border border-indigo-100">Taxonomy</span>
                    </div>
                    <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Global Skill Dictionary</h1>
                </div>
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* Add New Skill Form */}
                <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="bg-white rounded-3xl shadow-sm border border-slate-200 p-6 md:p-8 h-fit lg:sticky lg:top-24">
                    <h2 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
                        <Plus size={20} className="text-indigo-600" />
                        Add New Subject
                    </h2>
                    <form onSubmit={handleAddSkill} className="space-y-5">
                        <div>
                            <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-2">
                                Skill Name <span className="text-rose-500">*</span>
                            </label>
                            <input
                                type="text"
                                value={newSkillName}
                                onChange={(e) => setNewSkillName(e.target.value)}
                                placeholder="e.g. React.js, UI Design"
                                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all font-bold text-sm text-slate-800"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-2">
                                Category Name
                            </label>
                            <input
                                type="text"
                                value={newSkillCategory}
                                onChange={(e) => setNewSkillCategory(e.target.value)}
                                placeholder="e.g. Frontend, Design (Optional)"
                                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all font-bold text-sm text-slate-800"
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={isSubmitting || !newSkillName.trim()}
                            className="w-full bg-indigo-600 text-white font-bold py-3.5 rounded-xl flex justify-center items-center gap-2 transition-all shadow-md shadow-indigo-200 hover:bg-indigo-700 active:scale-95 disabled:opacity-50 disabled:active:scale-100"
                        >
                            {isSubmitting ? (
                                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                            ) : (
                                <>
                                    <Plus size={18} /> Append to Dictionary
                                </>
                            )}
                        </button>
                    </form>
                </motion.div>

                {/* Skills List */}
                <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="lg:col-span-2 bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden flex flex-col min-h-[600px] max-h-[800px]">
                    <div className="p-6 border-b border-slate-100 bg-slate-50">
                        <div className="relative">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                            <input
                                type="text"
                                placeholder="Query dictionary..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all shadow-sm font-bold text-sm text-slate-700"
                            />
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto p-6 md:p-8 scroller-hide bg-white">
                        {Object.keys(groupedSkills).length === 0 ? (
                            <div className="h-full flex flex-col items-center justify-center text-slate-400 pb-10">
                                <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-4 border border-slate-100 text-slate-300">
                                    <BookOpen size={40} />
                                </div>
                                <p className="font-extrabold text-slate-700 text-lg">No Results</p>
                                <p className="text-sm font-bold text-slate-400 mt-1">Try a different search query.</p>
                            </div>
                        ) : (
                            <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-8">
                                {Object.entries(groupedSkills).map(([category, catSkills]) => (
                                    <motion.div variants={itemVariants} key={category} className="mb-0">
                                        <div className="flex items-center gap-3 mb-4">
                                            <div className="h-px bg-slate-100 flex-1"></div>
                                            <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                                <div className="w-2 h-2 rounded-full bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.5)]"></div>
                                                {category}
                                            </h3>
                                            <div className="h-px bg-slate-100 flex-1"></div>
                                        </div>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                                            <AnimatePresence>
                                                {catSkills.map(skill => (
                                                    <motion.div 
                                                        initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}
                                                        key={skill._id} 
                                                        className="flex items-center justify-between p-3.5 bg-slate-50 border border-slate-100 rounded-2xl hover:border-indigo-200 hover:bg-indigo-50 hover:shadow-sm transition-all group"
                                                    >
                                                        <span className="font-bold text-sm text-slate-800">{skill.name}</span>
                                                        <button
                                                            onClick={() => handleDelete(skill._id)}
                                                            className="p-1.5 text-slate-400 hover:text-rose-500 hover:bg-rose-100 rounded-xl transition-all opacity-0 group-hover:opacity-100 focus:opacity-100"
                                                            title="Remove From Dictionary"
                                                        >
                                                            <Trash2 size={14} />
                                                        </button>
                                                    </motion.div>
                                                ))}
                                            </AnimatePresence>
                                        </div>
                                    </motion.div>
                                ))}
                            </motion.div>
                        )}
                    </div>
                </motion.div>

            </div>
        </div>
    );
};

export default ManageSkills;
