import React, { useEffect, useState } from "react";
import axios from "axios";
import { serverObj } from "../../config/serverConfig";
import useAuth from "../../customHooks/useAuth";
import Loader from "../../components/common/Loader";
import {
    IndianRupee,
    CheckCircle2,
    Clock,
    Copy,
    ExternalLink,
    ShieldCheck,
    Receipt,
    CalendarDays,
} from "lucide-react";
import { toast } from "react-hot-toast";

const TransactionHistory = () => {
    const { role } = useAuth();
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const serverAPI = serverObj.serverAPI;

    useEffect(() => {
        const fetchTransactions = async () => {
            try {
                const res = await axios.get(`${serverAPI}/api/payment/history`, {
                    withCredentials: true,
                });
                setTransactions(res.data.transactions || []);
            } catch (err) {
                console.error(err);
                toast.error("Failed to load transaction history");
            } finally {
                setLoading(false);
            }
        };
        fetchTransactions();
    }, []);

    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text);
        toast.success("Copied to clipboard!");
    };

    if (loading) return <Loader />;

    return (
        <div className="min-h-screen bg-slate-50 pb-16 font-sans">
            {/* Hero Header */}
            <div className="relative overflow-hidden bg-slate-900 px-8 py-14 md:px-16 mb-10 border-b border-slate-800">
                <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl -mr-48 -mt-48 pointer-events-none" />
                <div className="relative z-10 max-w-5xl mx-auto">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-3 bg-indigo-500/10 rounded-2xl border border-indigo-500/20">
                            <Receipt size={22} className="text-indigo-400" />
                        </div>
                        <span className="text-[10px] font-black uppercase tracking-widest text-indigo-400">
                            Payments
                        </span>
                    </div>
                    <h1 className="text-4xl md:text-5xl font-black text-white mb-3 leading-tight">
                        Transaction History
                    </h1>
                    <p className="text-slate-400 font-medium text-lg max-w-xl">
                        A complete, immutable record of all payments processed on your account.
                    </p>

                    {/* Summary cards */}
                    <div className="flex flex-wrap gap-4 mt-8">
                        <div className="px-7 py-4 bg-white/5 border border-white/10 rounded-2xl text-white">
                            <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-1">
                                Total Transactions
                            </p>
                            <p className="text-2xl font-black">{transactions.length}</p>
                        </div>
                        <div className="px-7 py-4 bg-white/5 border border-white/10 rounded-2xl text-white">
                            <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-1">
                                Total {role === "Client" ? "Paid" : "Earned"}
                            </p>
                            <p className="text-2xl font-black text-emerald-400">
                                ₹
                                {transactions
                                    .reduce((sum, t) => sum + (t.finalAmount || 0), 0)
                                    .toLocaleString("en-IN")}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-5xl mx-auto px-4 md:px-8">
                {transactions.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-28 text-center bg-white rounded-[2.5rem] border border-slate-200 shadow-sm">
                        <div className="w-20 h-20 bg-slate-100 rounded-3xl flex items-center justify-center mb-6 text-3xl">
                            💸
                        </div>
                        <h3 className="text-2xl font-black text-slate-800 mb-2">No Transactions Yet</h3>
                        <p className="text-slate-500 font-medium max-w-sm">
                            Completed payments will appear here once a project is paid.
                        </p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {transactions.map((txn, idx) => (
                            <div
                                key={txn._id}
                                className="bg-white rounded-[2rem] border border-slate-200 p-6 md:p-8 shadow-sm hover:shadow-lg hover:border-indigo-200 transition-all duration-300"
                            >
                                {/* Top row */}
                                <div className="flex flex-col md:flex-row justify-between items-start gap-5 mb-5">
                                    <div className="flex items-start gap-4">
                                        <div className="w-12 h-12 bg-emerald-100 rounded-2xl flex items-center justify-center shrink-0 text-emerald-600">
                                            <CheckCircle2 size={22} />
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-black text-slate-900 mb-0.5">
                                                {txn.title}
                                            </h3>
                                            <div className="flex items-center gap-2 flex-wrap">
                                                <span className="inline-flex items-center gap-1 px-3 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100 text-[10px] font-black uppercase tracking-widest">
                                                    <ShieldCheck size={10} /> Verified
                                                </span>
                                                <span className="inline-flex items-center gap-1 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                                    <CalendarDays size={10} />
                                                    {txn.paymentDetails?.paidAt
                                                        ? new Date(txn.paymentDetails.paidAt).toLocaleString("en-IN")
                                                        : "—"}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3 shrink-0">
                                        <div className="text-right">
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">
                                                Amount
                                            </p>
                                            <p className="text-2xl font-black text-slate-900">
                                                ₹{txn.finalAmount?.toLocaleString("en-IN")}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Transaction IDs */}
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-5 border-t border-slate-100">
                                    {[
                                        { label: "Payment ID", value: txn.paymentDetails?.paymentId },
                                        { label: "Order ID", value: txn.paymentDetails?.orderId },
                                        { label: "Category", value: txn.category },
                                    ].map((item) =>
                                        item.value ? (
                                            <div
                                                key={item.label}
                                                className="bg-slate-50 rounded-2xl p-4 border border-slate-100"
                                            >
                                                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5">
                                                    {item.label}
                                                </p>
                                                <div className="flex items-center justify-between gap-2">
                                                    <p className="text-xs font-black text-slate-700 truncate">
                                                        {item.value}
                                                    </p>
                                                    {item.label !== "Category" && (
                                                        <button
                                                            onClick={() => copyToClipboard(item.value)}
                                                            className="text-slate-400 hover:text-indigo-600 transition-colors shrink-0"
                                                        >
                                                            <Copy size={12} />
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        ) : null
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default TransactionHistory;
