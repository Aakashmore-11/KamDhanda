import React, { useState, useEffect } from 'react';
import { MessageSquare, AlertCircle, Shield, Eye, ShieldAlert } from 'lucide-react';
import { motion } from 'framer-motion';

// Note: Since a dedicated "Chat/Message" schema was not found in the current models, 
// this is a functional skeleton preparing for the real-time chat monitoring integration.

const ManageChats = () => {
    const [reportedChats, setReportedChats] = useState([]);
    const [loading, setLoading] = useState(false);

    // Mock data for demonstration until backend chat reporting is fully implemented
    useEffect(() => {
        setLoading(true);
        setTimeout(() => {
            setReportedChats([
                {
                    id: '1',
                    reporter: 'John Doe',
                    reportedUser: 'Spam Bot 99',
                    reason: 'Phishing links',
                    date: new Date().toISOString(),
                    status: 'Pending Review'
                },
                {
                    id: '2',
                    reporter: 'Alice Smith',
                    reportedUser: 'Rude Client 1',
                    reason: 'Inappropriate language',
                    date: new Date(Date.now() - 86400000).toISOString(),
                    status: 'Resolved'
                }
            ]);
            setLoading(false);
        }, 800);
    }, []);

    if (loading) {
        return (
            <div className="h-full flex items-center justify-center min-h-[50vh]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-rose-600"></div>
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
                        <span className="flex items-center justify-center bg-rose-100 text-rose-600 w-8 h-8 rounded-lg shrink-0">
                            <ShieldAlert size={16} />
                        </span>
                        <span className="text-[10px] uppercase font-bold tracking-widest text-rose-600 bg-rose-50 px-2.5 py-1 rounded-lg border border-rose-100">Safety Center</span>
                    </div>
                    <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Message Moderation</h1>
                </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="bg-amber-50 border border-amber-200 rounded-3xl p-6 flex flex-col md:flex-row items-start md:items-center gap-4 text-amber-800 shadow-sm">
                <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center shrink-0 text-amber-600">
                    <AlertCircle size={24} />
                </div>
                <div>
                    <h3 className="font-extrabold text-lg">System Notice</h3>
                    <p className="text-sm font-medium mt-1 opacity-90 max-w-3xl">
                        Direct Database Chat integration is currently being mapped. This view shows reported conversations flagged by users for violating platform terms. Active wiretapping of benign conversations is disabled for privacy.
                    </p>
                </div>
            </motion.div>

            <motion.div variants={containerVariants} initial="hidden" animate="visible" className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse min-w-[800px]">
                        <thead>
                            <tr className="bg-slate-50/80 border-b border-slate-100">
                                <th className="p-5 text-[10px] font-bold uppercase tracking-widest text-slate-400">Reporter</th>
                                <th className="p-5 text-[10px] font-bold uppercase tracking-widest text-slate-400">Flagged User</th>
                                <th className="p-5 text-[10px] font-bold uppercase tracking-widest text-slate-400">Violation Reason</th>
                                <th className="p-5 text-[10px] font-bold uppercase tracking-widest text-slate-400">Incident Date</th>
                                <th className="p-5 text-[10px] font-bold uppercase tracking-widest text-slate-400">Status</th>
                                <th className="p-5 text-[10px] font-bold uppercase tracking-widest text-slate-400 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {reportedChats.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="p-16 text-center text-slate-500">
                                        <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-300">
                                            <Shield size={32} />
                                        </div>
                                        <p className="font-extrabold text-slate-700">No active reports</p>
                                        <p className="text-sm font-bold text-slate-400 mt-1">The platform is currently clear of reported violations.</p>
                                    </td>
                                </tr>
                            ) : (
                                reportedChats.map(report => (
                                    <motion.tr variants={itemVariants} key={report.id} className="hover:bg-slate-50 transition-colors group">
                                        <td className="p-5">
                                            <p className="font-extrabold text-sm text-slate-800">{report.reporter}</p>
                                        </td>
                                        <td className="p-5">
                                            <p className="font-extrabold text-sm text-rose-600 bg-rose-50 px-2 py-1 rounded inline-block">{report.reportedUser}</p>
                                        </td>
                                        <td className="p-5 text-sm font-bold text-slate-600 max-w-xs">
                                            <div className="truncate" title={report.reason}>
                                                {report.reason}
                                            </div>
                                        </td>
                                        <td className="p-5 text-sm font-bold text-slate-500">
                                            {new Date(report.date).toLocaleDateString()}
                                        </td>
                                        <td className="p-5">
                                            <span className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-widest border ${
                                                report.status === 'Resolved' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-amber-50 text-amber-600 border-amber-100'
                                            }`}>
                                                {report.status}
                                            </span>
                                        </td>
                                        <td className="p-5 text-right">
                                            <button
                                                className="px-4 py-2 bg-slate-50 border border-slate-200 text-rose-600 hover:bg-rose-50 hover:border-rose-100 rounded-xl transition-all inline-flex items-center gap-2 text-xs font-bold"
                                                title="Review Conversation Log"
                                            >
                                                <Eye size={14} /> Investigate
                                            </button>
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

export default ManageChats;
