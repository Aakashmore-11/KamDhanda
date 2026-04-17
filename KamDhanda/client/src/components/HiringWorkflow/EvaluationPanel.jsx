import React, { useState } from 'react';
import axios from 'axios';
import { serverObj } from '../../config/serverConfig';
import { toast } from 'react-hot-toast';
import { FiStar, FiMessageSquare, FiCheck, FiX, FiPause, FiAward } from 'react-icons/fi';

const StarRating = ({ label, value, onChange }) => (
    <div className="space-y-1">
        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{label}</label>
        <div className="flex gap-2">
            {[1, 2, 3, 4, 5].map(star => (
                <button
                    key={star}
                    onClick={() => onChange(star)}
                    className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all active:scale-95 ${
                        star <= value
                            ? 'bg-amber-400 text-white shadow-lg shadow-amber-400/30'
                            : 'bg-gray-100 text-gray-300 hover:bg-amber-50 hover:text-amber-300'
                    }`}
                >
                    <FiStar className="text-sm" />
                </button>
            ))}
        </div>
    </div>
);

const EvaluationPanel = ({ interview, onEvaluated, onClose }) => {
    const [ratings, setRatings] = useState({
        communication: 0,
        technical: 0,
        confidence: 0,
        problemSolving: 0,
        overallRating: 0,
    });
    const [feedback, setFeedback] = useState('');
    const [decision, setDecision] = useState('');
    const [loading, setLoading] = useState(false);
    const serverAPI = serverObj.serverAPI;

    const handleSubmit = async () => {
        if (!decision) return toast.error('Please select a decision');
        if (ratings.overallRating === 0) return toast.error('Please provide an overall rating');

        setLoading(true);
        try {
            const res = await axios.post(
                `${serverAPI}/interviews/evaluate/${interview._id}`,
                { ...ratings, feedback, decision },
                { withCredentials: true }
            );
            if (res.data.success) {
                toast.success('Evaluation submitted!');
                if (onEvaluated) onEvaluated(res.data.interview);
            }
        } catch (e) {
            toast.error(e.response?.data?.message || 'Failed to submit evaluation');
        } finally {
            setLoading(false);
        }
    };

    const avgRating = Object.values(ratings).filter(v => v > 0).length > 0
        ? (Object.values(ratings).reduce((a, b) => a + b, 0) / Object.values(ratings).filter(v => v > 0).length).toFixed(1)
        : '—';

    const decisions = [
        { value: 'Selected', label: 'Selected', icon: FiCheck, color: 'emerald' },
        { value: 'Hold', label: 'On Hold', icon: FiPause, color: 'amber' },
        { value: 'Rejected', label: 'Rejected', icon: FiX, color: 'red' },
    ];

    return (
        <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h2 className="text-2xl font-black text-gray-800 flex items-center gap-2">
                        <FiAward className="text-indigo-600" /> Interview Evaluation
                    </h2>
                    <p className="text-gray-400 text-sm mt-1">
                        {interview?.seekerId?.fullName} — {interview?.title}
                    </p>
                </div>
                {onClose && (
                    <button onClick={onClose} className="p-2 text-gray-300 hover:text-red-500 transition-all">
                        <FiX />
                    </button>
                )}
            </div>

            {/* Average Score Badge */}
            <div className="flex items-center gap-4 p-5 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-2xl border border-indigo-100 mb-6">
                <div className="w-16 h-16 rounded-2xl bg-indigo-600 flex items-center justify-center text-white font-black text-2xl shadow-lg shadow-indigo-600/20">
                    {avgRating}
                </div>
                <div>
                    <p className="text-xs text-gray-400 font-black uppercase tracking-widest">Average Score</p>
                    <p className="text-gray-700 font-bold text-sm mt-1">Rate each category below</p>
                </div>
            </div>

            <div className="space-y-5">
                {/* Rating Categories */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 p-5 bg-gray-50/50 rounded-2xl border border-gray-100">
                    <StarRating label="Communication" value={ratings.communication} onChange={v => setRatings({ ...ratings, communication: v })} />
                    <StarRating label="Technical Skills" value={ratings.technical} onChange={v => setRatings({ ...ratings, technical: v })} />
                    <StarRating label="Confidence" value={ratings.confidence} onChange={v => setRatings({ ...ratings, confidence: v })} />
                    <StarRating label="Problem Solving" value={ratings.problemSolving} onChange={v => setRatings({ ...ratings, problemSolving: v })} />
                </div>

                <div className="p-5 bg-amber-50 rounded-2xl border border-amber-100">
                    <StarRating
                        label="Overall Rating"
                        value={ratings.overallRating}
                        onChange={v => setRatings({ ...ratings, overallRating: v })}
                    />
                </div>

                {/* Written Feedback */}
                <div className="space-y-1">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-1">
                        <FiMessageSquare className="text-xs" /> Written Feedback
                    </label>
                    <textarea
                        value={feedback}
                        onChange={(e) => setFeedback(e.target.value)}
                        className="w-full p-4 bg-gray-50 rounded-2xl h-28 outline-none focus:ring-2 ring-indigo-500/20 font-medium resize-none transition-all"
                        placeholder="Share your detailed thoughts on the candidate's performance..."
                    />
                </div>

                {/* Decision */}
                <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Final Decision</label>
                    <div className="grid grid-cols-3 gap-3">
                        {decisions.map(({ value, label, icon: Icon, color }) => (
                            <button
                                key={value}
                                onClick={() => setDecision(value)}
                                className={`p-4 rounded-2xl border-2 flex flex-col items-center gap-2 transition-all active:scale-95 ${
                                    decision === value
                                        ? color === 'emerald'
                                            ? 'bg-emerald-50 border-emerald-400 text-emerald-700 shadow-lg shadow-emerald-100'
                                            : color === 'amber'
                                                ? 'bg-amber-50 border-amber-400 text-amber-700 shadow-lg shadow-amber-100'
                                                : 'bg-red-50 border-red-400 text-red-700 shadow-lg shadow-red-100'
                                        : 'bg-gray-50 border-gray-100 text-gray-400 hover:border-gray-200'
                                }`}
                            >
                                <Icon className="text-xl" />
                                <span className="text-xs font-black uppercase tracking-wider">{label}</span>
                            </button>
                        ))}
                    </div>
                </div>

                <button
                    onClick={handleSubmit}
                    disabled={loading || !decision}
                    className="w-full py-5 bg-indigo-600 text-white rounded-[2rem] font-black text-xs uppercase tracking-widest shadow-2xl shadow-indigo-600/20 active:scale-95 transition-all disabled:opacity-50"
                >
                    {loading ? 'SUBMITTING...' : '✅ SUBMIT EVALUATION'}
                </button>
            </div>
        </div>
    );
};

export default EvaluationPanel;
