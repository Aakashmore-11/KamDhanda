import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { serverObj } from '../../config/serverConfig';
import { Search, Filter, ShieldBan, ShieldCheck, Trash2, AlertCircle, Eye, Briefcase, FileText, CheckCircle, Users } from 'lucide-react';
import { handleSuccessMsg, handleErrorMsg } from '../../config/toast';
import { motion, AnimatePresence } from 'framer-motion';

const ManageUsers = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('All');
    const [searchQuery, setSearchQuery] = useState('');

    // Activity Modal State
    const [selectedUser, setSelectedUser] = useState(null);
    const [activities, setActivities] = useState(null);
    const [activityLoading, setActivityLoading] = useState(false);
    const [showModal, setShowModal] = useState(false);

    const fetchUsers = async () => {
        try {
            const res = await axios.get(`${serverObj.serverAPI}/admin/users`, {
                withCredentials: true
            });
            if (res.data.success) {
                setUsers(res.data.users);
            }
        } catch (error) {
            handleErrorMsg("Failed to load users");
        } finally {
            setLoading(false);
        }
    };

    const fetchUserActivities = async (user) => {
        setSelectedUser(user);
        setActivityLoading(true);
        setShowModal(true);
        try {
            const res = await axios.get(`${serverObj.serverAPI}/admin/users/${user._id}/activities`, {
                withCredentials: true
            });
            if (res.data.success) {
                setActivities(res.data.activities);
            }
        } catch (error) {
            handleErrorMsg("Failed to load user activities");
            setShowModal(false);
        } finally {
            setActivityLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const handleToggleBlock = async (userId, currentStatus) => {
        try {
            const res = await axios.patch(
                `${serverObj.serverAPI}/admin/users/${userId}/toggle-block`,
                {},
                { withCredentials: true }
            );
            if (res.data.success) {
                handleSuccessMsg(res.data.message);
                setUsers(users.map(u => u._id === userId ? { ...u, isBlocked: !currentStatus } : u));
            }
        } catch (error) {
            handleErrorMsg(error.response?.data?.message || "Action failed");
        }
    };

    const handleDelete = async (userId) => {
        if (!window.confirm("Are you sure you want to permanently delete this user?")) return;

        try {
            const res = await axios.delete(
                `${serverObj.serverAPI}/admin/users/${userId}`,
                { withCredentials: true }
            );
            if (res.data.success) {
                handleSuccessMsg(res.data.message);
                setUsers(users.filter(u => u._id !== userId));
            }
        } catch (error) {
            handleErrorMsg(error.response?.data?.message || "Delete failed");
        }
    };

    const filteredUsers = users.filter(user => {
        const matchesFilter = filter === 'All' || user.role === filter;
        const matchesSearch = user.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            user.email.toLowerCase().includes(searchQuery.toLowerCase());
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
                        <span className="flex items-center justify-center bg-sky-100 text-sky-600 w-8 h-8 rounded-lg shrink-0">
                            <Users size={16} />
                        </span>
                        <span className="text-[10px] uppercase font-bold tracking-widest text-sky-600 bg-sky-50 px-2.5 py-1 rounded-lg border border-sky-100">User Network</span>
                    </div>
                    <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Access Management</h1>
                </div>
            </motion.div>

            {/* Filters and Search */}
            <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200 flex flex-col md:flex-row gap-6 justify-between items-center">
                <div className="relative w-full md:max-w-md">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input
                        type="text"
                        placeholder="Search name or email..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-sky-500/10 focus:border-sky-500 transition-all font-bold text-sm text-slate-700"
                    />
                </div>

                <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto scroller-hide bg-slate-50 p-1.5 rounded-2xl border border-slate-100">
                    <Filter className="text-slate-400 mx-2 shrink-0" size={16} />
                    {['All', 'Seeker', 'Client', 'Admin'].map(tab => (
                        <button
                            key={tab}
                            onClick={() => setFilter(tab)}
                            className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${filter === tab
                                    ? 'bg-white text-sky-600 shadow-sm border border-slate-200'
                                    : 'bg-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-100'
                                }`}
                        >
                            {tab}
                        </button>
                    ))}
                </div>
            </motion.div>

            {/* Users Table */}
            <motion.div variants={containerVariants} initial="hidden" animate="visible" className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse min-w-[800px]">
                        <thead>
                            <tr className="bg-slate-50/80 border-b border-slate-100">
                                <th className="p-5 text-[10px] font-bold uppercase tracking-widest text-slate-400">User Profile</th>
                                <th className="p-5 text-[10px] font-bold uppercase tracking-widest text-slate-400">System Role</th>
                                <th className="p-5 text-[10px] font-bold uppercase tracking-widest text-slate-400">Account Status</th>
                                <th className="p-5 text-[10px] font-bold uppercase tracking-widest text-slate-400">Registration Date</th>
                                <th className="p-5 text-[10px] font-bold uppercase tracking-widest text-slate-400 text-right">Admin Controls</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {filteredUsers.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="p-16 text-center">
                                        <div className="bg-slate-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-300">
                                            <AlertCircle size={24} />
                                        </div>
                                        <p className="font-extrabold text-slate-700">No Users Found</p>
                                        <p className="text-sm font-bold text-slate-400 mt-1">Adjust your filters to see more results.</p>
                                    </td>
                                </tr>
                            ) : (
                                filteredUsers.map((user, i) => (
                                    <motion.tr variants={itemVariants} key={user._id} className="hover:bg-slate-50 transition-colors group">
                                        <td className="p-5">
                                            <div className="flex items-center gap-4">
                                                <div className="h-12 w-12 rounded-2xl bg-slate-100 flex items-center justify-center overflow-hidden shrink-0 border border-slate-200">
                                                    {user.profilePic ? (
                                                        <img src={user.profilePic} className="h-full w-full object-cover" alt="" onError={(e) => {
                                                            e.target.onerror = null;
                                                            e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(user.fullName || "User")}&background=random`;
                                                        }} />
                                                    ) : (
                                                        <span className="font-black text-slate-400 text-lg">{user.fullName.charAt(0)}</span>
                                                    )}
                                                </div>
                                                <div>
                                                    <p className="font-extrabold text-sm text-slate-900 group-hover:text-sky-600 transition-colors">{user.fullName}</p>
                                                    <p className="text-xs font-bold text-slate-500 mt-0.5">{user.email}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-5">
                                            <span className={`inline-flex px-3 py-1.5 rounded-xl text-[10px] font-bold uppercase tracking-widest border ${
                                                user.role === 'Admin' ? 'bg-purple-50 text-purple-600 border-purple-100' :
                                                user.role === 'Client' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                                                'bg-sky-50 text-sky-600 border-sky-100'
                                            }`}>
                                                {user.role}
                                            </span>
                                        </td>
                                        <td className="p-5">
                                            {user.isBlocked ? (
                                                <span className="inline-flex items-center gap-1.5 text-rose-600 text-[10px] font-bold uppercase tracking-widest bg-rose-50 border border-rose-100 px-3 py-1.5 rounded-xl">
                                                    <ShieldBan size={12} /> Blocked
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1.5 text-emerald-600 text-[10px] font-bold uppercase tracking-widest bg-emerald-50 border border-emerald-100 px-3 py-1.5 rounded-xl">
                                                    <ShieldCheck size={12} /> Active
                                                </span>
                                            )}
                                        </td>
                                        <td className="p-5 text-sm font-bold text-slate-600">
                                            {new Date(user.createdAt).toLocaleDateString()}
                                        </td>
                                        <td className="p-5 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    onClick={() => fetchUserActivities(user)}
                                                    className="p-2.5 text-slate-400 hover:text-sky-600 bg-slate-50 hover:bg-sky-50 border border-transparent hover:border-sky-100 rounded-xl transition-all"
                                                    title="View Activity Logs"
                                                >
                                                    <Eye size={16} />
                                                </button>
                                                {user.role !== 'Admin' && (
                                                    <>
                                                        <button
                                                            onClick={() => handleToggleBlock(user._id, user.isBlocked)}
                                                            className={`p-2.5 border border-transparent rounded-xl transition-all ${user.isBlocked
                                                                ? 'text-emerald-500 hover:text-emerald-600 bg-emerald-50 hover:border-emerald-100'
                                                                : 'text-amber-500 hover:text-amber-600 bg-amber-50 hover:border-amber-100'
                                                                }`}
                                                            title={user.isBlocked ? "Unblock User" : "Block User"}
                                                        >
                                                            {user.isBlocked ? <ShieldCheck size={16} /> : <ShieldBan size={16} />}
                                                        </button>
                                                        <button
                                                            onClick={() => handleDelete(user._id)}
                                                            className="p-2.5 text-slate-400 hover:text-rose-600 bg-slate-50 hover:bg-rose-50 border border-transparent hover:border-rose-100 rounded-xl transition-all"
                                                            title="Delete User"
                                                        >
                                                            <Trash2 size={16} />
                                                        </button>
                                                    </>
                                                )}
                                            </div>
                                        </td>
                                    </motion.tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </motion.div>

            {/* User Activity Modal */}
            <AnimatePresence>
                {showModal && (
                    <motion.div 
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[999] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm"
                    >
                        <motion.div 
                            initial={{ scale: 0.95, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0, y: 20 }}
                            className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh] border border-slate-200"
                        >
                            {/* Modal Header */}
                            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50">
                                <div className="flex items-center gap-4">
                                    <div className="h-12 w-12 rounded-2xl bg-indigo-600 flex items-center justify-center text-white font-black text-xl shadow-md border border-indigo-500">
                                        {selectedUser?.fullName?.charAt(0)}
                                    </div>
                                    <div>
                                        <h3 className="font-extrabold text-slate-900 text-lg">{selectedUser?.fullName}</h3>
                                        <p className="text-[10px] text-slate-500 uppercase font-bold tracking-widest mt-1">{selectedUser?.role} Activity Logs</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setShowModal(false)}
                                    className="p-2.5 bg-white border border-slate-200 hover:bg-slate-100 rounded-xl text-slate-500 transition-colors"
                                >
                                    <Trash2 size={18} className="opacity-0 hidden" /> {/* spacer */}
                                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
                                </button>
                            </div>

                            {/* Modal Body */}
                            <div className="flex-1 overflow-y-auto p-6 md:p-8 bg-white">
                                {activityLoading ? (
                                    <div className="h-48 flex flex-col items-center justify-center gap-4 text-slate-400">
                                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                                        <p className="text-xs font-bold uppercase tracking-widest">Compiling Records...</p>
                                    </div>
                                ) : activities ? (
                                    <div className="space-y-8">
                                        {selectedUser?.role?.toLowerCase() === 'seeker' ? (
                                            <>
                                                {/* Seeker: Job Applications */}
                                                <section>
                                                    <h4 className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-slate-900 mb-4 bg-indigo-50 text-indigo-600 px-4 py-2 rounded-xl w-fit">
                                                        <Briefcase size={16} /> Applications ({activities.applications?.length || 0})
                                                    </h4>
                                                    <div className="space-y-3">
                                                        {activities.applications?.length > 0 ? (
                                                            activities.applications.map(app => (
                                                                <div key={app._id} className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between hover:border-indigo-200 transition-colors">
                                                                    <div>
                                                                        <p className="font-extrabold text-slate-800 text-sm mb-1">{app.jobId?.title}</p>
                                                                        <p className="text-xs font-bold text-slate-500">{app.jobId?.companyName}</p>
                                                                    </div>
                                                                    <div className="text-right">
                                                                        <span className={`text-[10px] uppercase font-bold px-3 py-1 rounded-lg border ${app.status === 'Hired' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-slate-50 text-slate-600 border-slate-200'}`}>
                                                                            {app.status}
                                                                        </span>
                                                                        <p className="text-[10px] font-bold text-slate-400 mt-2">{new Date(app.createdAt).toLocaleDateString()}</p>
                                                                    </div>
                                                                </div>
                                                            ))
                                                        ) : (
                                                            <div className="text-center py-6 border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50">
                                                                <p className="text-sm font-bold text-slate-500">No applications on file.</p>
                                                            </div>
                                                        )}
                                                    </div>
                                                </section>

                                                {/* Seeker: Project Proposals */}
                                                <section>
                                                    <h4 className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-emerald-600 mb-4 bg-emerald-50 px-4 py-2 rounded-xl w-fit">
                                                        <FileText size={16} /> Proposals ({activities.proposals?.length || 0})
                                                    </h4>
                                                    <div className="space-y-3">
                                                        {activities.proposals?.length > 0 ? (
                                                            activities.proposals.map(proj => (
                                                                <div key={proj._id} className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between hover:border-emerald-200 transition-colors">
                                                                    <div>
                                                                        <p className="font-extrabold text-slate-800 text-sm mb-1">{proj.title}</p>
                                                                        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Project Status: {proj.status}</p>
                                                                    </div>
                                                                    <div className="text-right">
                                                                        <span className="text-[10px] uppercase font-bold px-3 py-1 rounded-lg border bg-emerald-50 text-emerald-600 border-emerald-100">
                                                                            {proj.proposals?.[0]?.status || 'Pending'}
                                                                        </span>
                                                                        <p className="text-[10px] font-bold text-slate-400 mt-2">{new Date(proj.createdAt).toLocaleDateString()}</p>
                                                                    </div>
                                                                </div>
                                                            ))
                                                        ) : (
                                                            <div className="text-center py-6 border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50">
                                                                <p className="text-sm font-bold text-slate-500">No proposals on file.</p>
                                                            </div>
                                                        )}
                                                    </div>
                                                </section>
                                            </>
                                        ) : (
                                            <>
                                                {/* Client: Projects Posted */}
                                                <section>
                                                    <h4 className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-indigo-600 mb-4 bg-indigo-50 px-4 py-2 rounded-xl w-fit">
                                                        <FileText size={16} /> Freelance Projects ({activities.projects?.length || 0})
                                                    </h4>
                                                    <div className="space-y-3">
                                                        {activities.projects?.length > 0 ? (
                                                            activities.projects.map(proj => (
                                                                <div key={proj._id} className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between hover:border-indigo-200 transition-colors">
                                                                    <div>
                                                                        <p className="font-extrabold text-slate-800 text-sm mb-1">{proj.title}</p>
                                                                        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">{proj.category}</p>
                                                                    </div>
                                                                    <div className="text-right">
                                                                        <span className="text-[10px] uppercase font-bold px-3 py-1 rounded-lg border bg-indigo-50 text-indigo-600 border-indigo-100">
                                                                            {proj.status}
                                                                        </span>
                                                                        <p className="text-[10px] font-bold text-slate-400 mt-2">{new Date(proj.createdAt).toLocaleDateString()}</p>
                                                                    </div>
                                                                </div>
                                                            ))
                                                        ) : (
                                                            <div className="text-center py-6 border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50">
                                                                <p className="text-sm font-bold text-slate-500">No projects authored.</p>
                                                            </div>
                                                        )}
                                                    </div>
                                                </section>

                                                {/* Client: Jobs Posted */}
                                                <section>
                                                    <h4 className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-emerald-600 mb-4 bg-emerald-50 px-4 py-2 rounded-xl w-fit">
                                                        <Briefcase size={16} /> Job Postings ({activities.jobs?.length || 0})
                                                    </h4>
                                                    <div className="space-y-3">
                                                        {activities.jobs?.length > 0 ? (
                                                            activities.jobs.map(job => (
                                                                <div key={job._id} className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between hover:border-emerald-200 transition-colors">
                                                                    <div>
                                                                        <p className="font-extrabold text-slate-800 text-sm mb-1">{job.title}</p>
                                                                        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">{job.location}</p>
                                                                    </div>
                                                                    <div className="text-right">
                                                                        <span className="text-[10px] uppercase font-bold px-3 py-1 rounded-lg border bg-emerald-50 text-emerald-600 border-emerald-100">
                                                                            {job.status}
                                                                        </span>
                                                                        <p className="text-[10px] font-bold text-slate-400 mt-2">{new Date(job.createdAt).toLocaleDateString()}</p>
                                                                    </div>
                                                                </div>
                                                            ))
                                                        ) : (
                                                            <div className="text-center py-6 border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50">
                                                                <p className="text-sm font-bold text-slate-500">No jobs authored.</p>
                                                            </div>
                                                        )}
                                                    </div>
                                                </section>
                                            </>
                                        )}
                                    </div>
                                ) : (
                                    <div className="h-48 flex flex-col items-center justify-center gap-3 text-slate-400 bg-slate-50 rounded-3xl border border-slate-100">
                                        <AlertCircle size={32} />
                                        <p className="text-[10px] font-bold uppercase tracking-widest">No activity logs associated with ID.</p>
                                    </div>
                                )}
                            </div>

                            {/* Modal Footer */}
                            <div className="p-6 bg-slate-50 border-t border-slate-100 flex justify-end">
                                <button
                                    onClick={() => setShowModal(false)}
                                    className="px-8 py-3 bg-indigo-600 text-white rounded-xl font-bold text-sm hover:bg-indigo-700 shadow-md shadow-indigo-200 active:scale-95 transition-all"
                                >
                                    Acknowledge
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default ManageUsers;
