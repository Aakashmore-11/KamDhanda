import React, { useState } from 'react';
import axios from 'axios';
import { serverObj } from '../../config/serverConfig';
import { toast } from 'react-hot-toast';
import {
    FiCalendar, FiClock, FiMessageSquare, FiX,
    FiPlus, FiTrash2, FiShield, FiVideo
} from 'react-icons/fi';

const InterviewForm = ({ jobId, applicationId, seekerId, onScheduled, onCancel }) => {
    const [formData, setFormData] = useState({
        title: 'Virtual Interview - KamDhanda',
        date: new Date(Date.now() + 86400000).toISOString().slice(0, 10),
        time: '14:00',
        duration: 45,
        timezone: 'Asia/Kolkata',
        notes: '',
        recordingConsent: false,
        questions: ['']
    });
    const [loading, setLoading] = useState(false);
    const serverAPI = serverObj.serverAPI;

    const handleSubmit = async () => {
        if (!formData.date || !formData.time) return toast.error("Please set date and time");

        setLoading(true);
        try {
            const payload = {
                ...formData,
                questions: formData.questions.filter(q => q.trim()),
                jobId, applicationId, seekerId
            };
            const res = await axios.post(`${serverAPI}/interviews/schedule`, payload, { withCredentials: true });

            if (res.data.success) {
                toast.success("Interview scheduled! Applicant notified.");
                if (onScheduled) onScheduled(res.data.interview);
            }
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to schedule interview");
        } finally {
            setLoading(false);
        }
    };

    const addQuestion = () => setFormData({ ...formData, questions: [...formData.questions, ''] });
    const removeQuestion = (i) => setFormData({ ...formData, questions: formData.questions.filter((_, idx) => idx !== i) });
    const updateQuestion = (i, val) => {
        const q = [...formData.questions];
        q[i] = val;
        setFormData({ ...formData, questions: q });
    };

    return (
        <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-black text-gray-800 flex items-center gap-3">
                    <FiVideo className="text-indigo-600" /> Schedule Interview
                </h2>
                {onCancel && (
                    <button onClick={onCancel} className="p-2 text-gray-400 hover:text-red-500 transition-all">
                        <FiX />
                    </button>
                )}
            </div>

            <div className="space-y-5">
                {/* Title */}
                <div className="space-y-1">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Interview Title</label>
                    <input
                        type="text"
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        className="w-full p-4 bg-gray-50 rounded-2xl outline-none focus:ring-2 ring-indigo-500/20 font-bold transition-all"
                    />
                </div>

                {/* Date & Time */}
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Date</label>
                        <div className="relative">
                            <FiCalendar className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input
                                type="date"
                                value={formData.date}
                                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                                className="w-full p-4 pl-12 bg-gray-50 rounded-2xl outline-none focus:ring-2 ring-indigo-500/20 font-bold"
                            />
                        </div>
                    </div>
                    <div className="space-y-1">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Time</label>
                        <div className="relative">
                            <FiClock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input
                                type="time"
                                value={formData.time}
                                onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                                className="w-full p-4 pl-12 bg-gray-50 rounded-2xl outline-none focus:ring-2 ring-indigo-500/20 font-bold"
                            />
                        </div>
                    </div>
                </div>

                {/* Duration & Timezone */}
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Duration (mins)</label>
                        <input
                            type="number"
                            value={formData.duration}
                            onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                            className="w-full p-4 bg-gray-50 rounded-2xl outline-none focus:ring-2 ring-indigo-500/20 font-bold"
                        />
                    </div>
                    <div className="space-y-1">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Timezone</label>
                        <select
                            value={formData.timezone}
                            onChange={(e) => setFormData({ ...formData, timezone: e.target.value })}
                            className="w-full p-4 bg-gray-50 rounded-2xl outline-none focus:ring-2 ring-indigo-500/20 font-bold"
                        >
                            <option value="Asia/Kolkata">IST (India)</option>
                            <option value="UTC">UTC</option>
                            <option value="America/New_York">EST (New York)</option>
                            <option value="Europe/London">GMT (London)</option>
                            <option value="Asia/Dubai">GST (Dubai)</option>
                        </select>
                    </div>
                </div>

                {/* Notes */}
                <div className="space-y-1">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-1">
                        <FiMessageSquare className="text-xs" /> Notes for Candidate
                    </label>
                    <textarea
                        value={formData.notes}
                        onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                        className="w-full p-4 bg-gray-50 rounded-2xl h-20 outline-none focus:ring-2 ring-indigo-500/20 font-medium resize-none"
                        placeholder="What to prepare, dress code, topics to revise..."
                    />
                </div>

                {/* Interview Questions */}
                <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Planned Questions (Optional)</label>
                    {formData.questions.map((q, i) => (
                        <div key={i} className="flex gap-2">
                            <input
                                type="text"
                                value={q}
                                onChange={(e) => updateQuestion(i, e.target.value)}
                                className="flex-1 p-3 bg-gray-50 rounded-xl outline-none focus:ring-1 ring-gray-200 font-medium text-sm"
                                placeholder={`Question ${i + 1}...`}
                            />
                            {formData.questions.length > 1 && (
                                <button onClick={() => removeQuestion(i)} className="p-3 text-gray-300 hover:text-red-500 transition-all">
                                    <FiTrash2 />
                                </button>
                            )}
                        </div>
                    ))}
                    <button onClick={addQuestion} className="flex items-center gap-1 text-xs font-bold text-indigo-600 hover:text-indigo-800 transition-all">
                        <FiPlus /> Add Question
                    </button>
                </div>

                {/* Recording Consent */}
                <label className="flex items-center gap-3 p-4 bg-amber-50 border border-amber-100 rounded-2xl cursor-pointer">
                    <input
                        type="checkbox"
                        checked={formData.recordingConsent}
                        onChange={(e) => setFormData({ ...formData, recordingConsent: e.target.checked })}
                        className="w-5 h-5 accent-amber-500"
                    />
                    <div>
                        <div className="text-sm font-bold text-amber-800 flex items-center gap-1">
                            <FiShield className="text-xs" /> Recording Consent
                        </div>
                        <div className="text-xs text-amber-600">Both parties consent to this interview being recorded</div>
                    </div>
                </label>

                {/* Submit */}
                <button
                    onClick={handleSubmit}
                    disabled={loading}
                    className="w-full py-5 bg-indigo-600 text-white rounded-[2rem] font-black text-xs uppercase tracking-widest shadow-2xl shadow-indigo-600/20 active:scale-95 transition-all disabled:opacity-50"
                >
                    {loading ? "SCHEDULING..." : "📅 SCHEDULE INTERVIEW"}
                </button>
            </div>
        </div>
    );
};

export default InterviewForm;
