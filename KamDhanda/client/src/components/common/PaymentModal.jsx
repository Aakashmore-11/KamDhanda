import React, { useState } from "react";
import axios from "axios";
import { serverObj } from "../../config/serverConfig";
import {
    X,
    IndianRupee,
    ShieldCheck,
    Loader2,
    CheckCircle2,
    XCircle,
    Lock,
    Zap,
} from "lucide-react";

const PaymentModal = ({ project, module, onClose, onSuccess }) => {
    const serverAPI = serverObj.serverAPI;
    const [status, setStatus] = useState("idle"); // idle | loading | success | error
    const [errorMsg, setErrorMsg] = useState("");

    const handlePayment = async () => {
        setStatus("loading");
        try {
            // Step 1: Create order on backend
            // Use module-specific endpoint if module prop exists
            const orderEndpoint = module 
                ? `${serverAPI}/api/payment/create-module-order` 
                : `${serverAPI}/api/payment/create-order`;
                
            const orderPayload = module 
                ? { projectId: project._id, moduleId: module._id } 
                : { projectId: project._id };

            const { data } = await axios.post(
                orderEndpoint,
                orderPayload,
                { withCredentials: true }
            );

            const { order, key_id } = data;

            // Step 2: Open Razorpay Checkout
            const options = {
                key: key_id,
                amount: order.amount,
                currency: order.currency,
                name: "KamDhanda",
                description: module ? `Milestone: ${module.title}` : `Payment for: ${project.title}`,
                order_id: order.id,
                handler: async function (response) {
                    // Step 3: Verify payment on backend
                    try {
                        const verifyEndpoint = module 
                            ? `${serverAPI}/api/payment/verify-module` 
                            : `${serverAPI}/api/payment/verify`;
                            
                        const verifyPayload = {
                            razorpay_order_id: response.razorpay_order_id,
                            razorpay_payment_id: response.razorpay_payment_id,
                            razorpay_signature: response.razorpay_signature,
                            projectId: project._id,
                        };
                        
                        if (module) verifyPayload.moduleId = module._id;

                        const verifyRes = await axios.post(
                            verifyEndpoint,
                            verifyPayload,
                            { withCredentials: true }
                        );

                        if (verifyRes.data.success) {
                            setStatus("success");
                            onSuccess && onSuccess(verifyRes.data.project, verifyRes.data.tracking);
                        } else {
                            setStatus("error");
                            setErrorMsg("Payment verification failed. Please contact support.");
                        }
                    } catch (err) {
                        setStatus("error");
                        setErrorMsg(err.response?.data?.message || "Verification error occurred.");
                    }
                },
                prefill: {},
                theme: { color: "#4F46E5" },
                modal: {
                    ondismiss: () => {
                        if (status === "loading") setStatus("idle");
                    },
                },
            };

            const rzp = new window.Razorpay(options);
            rzp.on("payment.failed", function (response) {
                setStatus("error");
                setErrorMsg(response.error.description || "Payment failed. Please try again.");
            });
            rzp.open();
        } catch (err) {
            setStatus("error");
            setErrorMsg(err.response?.data?.message || "Could not initiate payment. Try again.");
        }
    };

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
            <div className="relative bg-white rounded-[2rem] shadow-2xl w-full max-w-md overflow-hidden">

                {/* Decorative gradient top bar */}
                <div className="h-2 w-full bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-700" />

                {/* Close button */}
                {status !== "loading" && (
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 p-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 transition-all z-10"
                        id="payment-modal-close"
                    >
                        <X size={18} />
                    </button>
                )}

                <div className="p-8">

                    {/* ─── IDLE STATE ─── */}
                    {status === "idle" && (
                        <>
                            <div className="flex items-center gap-3 mb-6">
                                <div className="p-3 bg-indigo-100 rounded-2xl">
                                    <IndianRupee size={22} className="text-indigo-600" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-black text-slate-900">Final Settlement</h2>
                                    <p className="text-xs text-slate-500 font-medium">Secure payment powered by Razorpay</p>
                                </div>
                            </div>

                            <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-5 mb-6">
                                <p className="text-[10px] font-black uppercase tracking-widest text-indigo-400 mb-1">
                                    {module ? "Milestone Context" : "Project"}
                                </p>
                                <p className="text-slate-800 font-black text-base leading-tight">
                                    {module ? `${project.title} - ${module.title}` : project.title}
                                </p>
                                <div className="mt-4 pt-4 border-t border-indigo-100 flex justify-between items-center">
                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Amount Due</span>
                                    <span className="text-3xl font-black text-slate-900">
                                        ₹{module ? module.amount?.toLocaleString("en-IN") : project.finalAmount?.toLocaleString("en-IN")}
                                    </span>
                                </div>
                            </div>

                            <div className="flex items-center gap-2 mb-6 text-xs text-slate-400 font-medium">
                                <ShieldCheck size={14} className="text-emerald-500 shrink-0" />
                                <span>Amount is fixed and cannot be altered. Signature verified on server.</span>
                            </div>

                            <button
                                id="pay-now-btn"
                                onClick={handlePayment}
                                className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-black text-sm uppercase tracking-widest rounded-2xl transition-all shadow-lg shadow-indigo-200 active:scale-95 flex items-center justify-center gap-2"
                            >
                                <Lock size={16} /> Pay ₹{module ? module.amount?.toLocaleString("en-IN") : project.finalAmount?.toLocaleString("en-IN")} Securely
                            </button>

                            <p className="text-center text-[10px] text-slate-400 mt-4 font-medium">
                                You will be redirected to Razorpay's secure checkout.
                            </p>
                        </>
                    )}

                    {/* ─── LOADING STATE ─── */}
                    {status === "loading" && (
                        <div className="flex flex-col items-center justify-center py-12 text-center">
                            <Loader2 size={48} className="text-indigo-500 animate-spin mb-4" />
                            <h3 className="text-lg font-black text-slate-900 mb-2">Processing Payment</h3>
                            <p className="text-sm text-slate-500 font-medium">Please complete the checkout in the Razorpay window…</p>
                        </div>
                    )}

                    {/* ─── SUCCESS STATE ─── */}
                    {status === "success" && (
                        <div className="flex flex-col items-center justify-center py-8 text-center">
                            <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mb-5">
                                <CheckCircle2 size={40} className="text-emerald-500" />
                            </div>
                            <h3 className="text-2xl font-black text-slate-900 mb-2">Payment Successful 🎉</h3>
                            <p className="text-sm text-slate-500 font-medium mb-2">
                                ₹{module ? module.amount?.toLocaleString("en-IN") : project.finalAmount?.toLocaleString("en-IN")} has been released to the freelancer.
                            </p>
                            <p className="text-xs text-slate-400 font-medium mb-8">
                                {module ? `The milestone is now Paid.` : `The project is now`} <span className="text-indigo-600 font-black">{!module && "Paid & Locked"}</span>
                            </p>
                            <button
                                onClick={onClose}
                                id="payment-success-close"
                                className="w-full py-4 bg-slate-900 text-white font-black text-xs uppercase tracking-widest rounded-2xl hover:bg-indigo-600 transition-all active:scale-95"
                            >
                                Done
                            </button>
                        </div>
                    )}

                    {/* ─── ERROR STATE ─── */}
                    {status === "error" && (
                        <div className="flex flex-col items-center justify-center py-8 text-center">
                            <div className="w-20 h-20 bg-rose-100 rounded-full flex items-center justify-center mb-5">
                                <XCircle size={40} className="text-rose-500" />
                            </div>
                            <h3 className="text-2xl font-black text-slate-900 mb-2">Payment Failed ❌</h3>
                            <p className="text-sm text-slate-500 font-medium mb-6">{errorMsg}</p>
                            <div className="flex gap-3 w-full">
                                <button
                                    onClick={() => setStatus("idle")}
                                    id="payment-retry-btn"
                                    className="flex-1 py-4 bg-indigo-600 text-white font-black text-xs uppercase tracking-widest rounded-2xl hover:bg-indigo-700 transition-all active:scale-95 flex items-center justify-center gap-2"
                                >
                                    <Zap size={14} /> Retry
                                </button>
                                <button
                                    onClick={onClose}
                                    className="flex-1 py-4 border border-slate-200 text-slate-500 font-black text-xs uppercase tracking-widest rounded-2xl hover:bg-slate-50 transition-all active:scale-95"
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    )}

                </div>
            </div>

            <style>{`
                @keyframes fadeIn {
                    from { opacity: 0; transform: scale(0.95); }
                    to { opacity: 1; transform: scale(1); }
                }
                .animate-fadeIn { animation: fadeIn 0.25s ease-out forwards; }
            `}</style>
        </div>
    );
};

export default PaymentModal;
