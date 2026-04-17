import React, { useEffect, useState } from "react";
import axios from "axios";
import { serverObj } from "../../config/serverConfig";
import Loader from "../../components/common/Loader";
import {
    IndianRupee,
    CheckCircle2,
    Search,
    ShieldCheck,
    CalendarDays,
    Copy,
    TrendingUp,
    Receipt,
} from "lucide-react";
import { toast } from "react-hot-toast";

const AdminPayments = () => {
    const [payments, setPayments] = useState([]);
    const [filtered, setFiltered] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const serverAPI = serverObj.serverAPI;

    useEffect(() => {
        const fetchPayments = async () => {
            try {
                const res = await axios.get(`${serverAPI}/api/payment/admin/all`, {
                    withCredentials: true,
                });
                setPayments(res.data.payments || []);
                setFiltered(res.data.payments || []);
            } catch (err) {
                console.error(err);
                toast.error("Failed to load payment records");
            } finally {
                setLoading(false);
            }
        };
        fetchPayments();
    }, []);

    useEffect(() => {
        if (!search.trim()) {
            setFiltered(payments);
        } else {
            setFiltered(
                payments.filter(
                    (p) =>
                        p.title?.toLowerCase().includes(search.toLowerCase()) ||
                        p.paymentDetails?.paymentId?.toLowerCase().includes(search.toLowerCase()) ||
                        p.paymentDetails?.orderId?.toLowerCase().includes(search.toLowerCase())
                )
            );
        }
    }, [search, payments]);

    const totalRevenue = payments.reduce((sum, p) => sum + (p.finalAmount || 0), 0);

    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text);
        toast.success("Copied!");
    };

    if (loading) return <Loader />;

    return (
        <div className="min-h-screen bg-slate-50 pb-16 font-sans">
            {/* Header */}
            <div className="relative overflow-hidden bg-slate-900 px-8 py-12 md:px-12 mb-10 border-b border-slate-800">
                <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl -mr-40 -mt-40 pointer-events-none" />
                <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-2.5 bg-indigo-500/10 rounded-xl border border-indigo-500/20">
                            <Receipt size={18} className="text-indigo-400" />
                        </div>
                        <span className="text-[10px] font-black uppercase tracking-widest text-indigo-400">
                            Admin · Payments
                        </span>
                    </div>
                    <h1 className="text-3xl md:text-4xl font-black text-white mb-2">
                        Payment Monitor
                    </h1>
                    <p className="text-slate-400 font-medium">
                        Real-time oversight of all platform transactions.
                    </p>

                    {/* Summary */}
                    <div className="flex flex-wrap gap-4 mt-8">
                        <div className="px-6 py-4 bg-white/5 border border-white/10 rounded-2xl text-white">
                            <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-1">
                                Total Payments
                            </p>
                            <p className="text-2xl font-black">{payments.length}</p>
                        </div>
                        <div className="px-6 py-4 bg-white/5 border border-white/10 rounded-2xl text-white">
                            <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-1">
                                Total Volume
                            </p>
                            <p className="text-2xl font-black text-emerald-400">
                                ₹{totalRevenue.toLocaleString("en-IN")}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-6xl mx-auto px-4 md:px-8">
                {/* Search */}
                <div className="relative mb-8">
                    <Search size={16} className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Search by project name, payment ID or order ID..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full pl-12 pr-6 py-4 bg-white border border-slate-200 rounded-2xl text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-400/30 focus:border-indigo-300 shadow-sm transition-all"
                    />
                </div>

                {filtered.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-24 text-center bg-white rounded-[2.5rem] border border-slate-200 shadow-sm">
                        <div className="w-20 h-20 bg-slate-100 rounded-3xl flex items-center justify-center mb-6 text-3xl">💳</div>
                        <h3 className="text-xl font-black text-slate-800 mb-2">No Payments Found</h3>
                        <p className="text-slate-500 font-medium">
                            {search ? "Try adjusting your search." : "No payments have been processed yet."}
                        </p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {/* Table Header */}
                        <div className="hidden md:grid grid-cols-12 gap-4 px-6 py-3">
                            <span className="col-span-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Project</span>
                            <span className="col-span-2 text-[10px] font-black uppercase tracking-widest text-slate-400">Amount</span>
                            <span className="col-span-3 text-[10px] font-black uppercase tracking-widest text-slate-400">Payment ID</span>
                            <span className="col-span-2 text-[10px] font-black uppercase tracking-widest text-slate-400">Paid At</span>
                            <span className="col-span-1 text-[10px] font-black uppercase tracking-widest text-slate-400">Status</span>
                        </div>

                        {filtered.map((txn) => (
                            <div
                                key={txn._id}
                                className="bg-white rounded-2xl border border-slate-200 hover:border-indigo-200 hover:shadow-md transition-all p-5 md:p-6"
                            >
                                <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
                                    {/* Project */}
                                    <div className="md:col-span-4 flex items-center gap-3">
                                        <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center text-indigo-700 font-black text-lg shrink-0">
                                            {txn.title?.charAt(0) || "P"}
                                        </div>
                                        <div className="min-w-0">
                                            <p className="font-black text-slate-800 text-sm truncate">{txn.title}</p>
                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest truncate">
                                                {txn.category}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Amount */}
                                    <div className="md:col-span-2">
                                        <p className="text-lg font-black text-slate-900">
                                            ₹{txn.finalAmount?.toLocaleString("en-IN")}
                                        </p>
                                    </div>

                                    {/* Payment ID */}
                                    <div className="md:col-span-3">
                                        {txn.paymentDetails?.paymentId ? (
                                            <div className="flex items-center gap-2">
                                                <p className="text-xs font-black text-slate-600 truncate max-w-[140px]">
                                                    {txn.paymentDetails.paymentId}
                                                </p>
                                                <button
                                                    onClick={() => copyToClipboard(txn.paymentDetails.paymentId)}
                                                    className="text-slate-400 hover:text-indigo-600 transition-colors shrink-0"
                                                >
                                                    <Copy size={12} />
                                                </button>
                                            </div>
                                        ) : (
                                            <span className="text-slate-400 text-xs">—</span>
                                        )}
                                    </div>

                                    {/* Paid At */}
                                    <div className="md:col-span-2">
                                        <p className="text-xs font-bold text-slate-500 flex items-center gap-1">
                                            <CalendarDays size={11} className="text-slate-400" />
                                            {txn.paymentDetails?.paidAt
                                                ? new Date(txn.paymentDetails.paidAt).toLocaleDateString("en-IN")
                                                : "—"}
                                        </p>
                                    </div>

                                    {/* Status */}
                                    <div className="md:col-span-1">
                                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-100 text-[9px] font-black uppercase tracking-widest whitespace-nowrap">
                                            <CheckCircle2 size={9} /> Paid
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminPayments;
