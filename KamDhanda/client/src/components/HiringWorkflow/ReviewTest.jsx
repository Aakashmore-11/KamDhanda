import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { serverObj } from '../../config/serverConfig';
import { FiX, FiCheck, FiAlertTriangle, FiClock } from 'react-icons/fi';

const ReviewTest = ({ testId, result, onBack }) => {
    const [test, setTest] = useState(null);
    const [questions, setQuestions] = useState([]);
    const [loading, setLoading] = useState(true);
    const serverAPI = serverObj.serverAPI;

    useEffect(() => {
        const fetchTestDetails = async () => {
            try {
                // Fetch test and questions
                const res = await axios.get(`${serverAPI}/mocktest/test-details/${testId}`, { withCredentials: true });
                setTest(res.data.test);
                setQuestions(res.data.questions);
            } catch (error) {
                console.error("Failed to load test details for review", error);
            } finally {
                setLoading(false);
            }
        };

        fetchTestDetails();
    }, [testId, serverAPI]);

    if (loading) return (
        <div className="flex flex-col items-center justify-center p-20 animate-pulse text-indigo-600 font-black uppercase tracking-widest bg-white rounded-3xl">
            Loading Exam Details...
        </div>
    );

    return (
        <div className="bg-white rounded-[3rem] shadow-2xl overflow-hidden max-h-[85vh] flex flex-col font-sans">
            {/* Header */}
            <div className="p-8 border-b border-gray-50 flex items-center justify-between shrink-0 bg-slate-50">
                <div className="flex items-center gap-6">
                    <div className={`w-16 h-16 rounded-2xl flex items-center justify-center font-black text-2xl ${result.status === 'Passed' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                        {Math.round((result.score / result.totalMarks) * 100)}%
                    </div>
                    <div>
                        <h2 className="text-xl font-black text-slate-900 tracking-tight">{test?.title} Assessment Review</h2>
                        <div className="flex items-center gap-4 mt-1 text-[10px] font-black uppercase tracking-widest text-slate-400">
                             <span className="flex items-center gap-1.5"><FiClock /> {result.timeTaken}s taken</span>
                             <span className={`px-3 py-1 rounded-full ${result.status === 'Passed' ? 'bg-emerald-100/50 text-emerald-600' : 'bg-rose-100/50 text-rose-600'}`}>{result.status}</span>
                        </div>
                    </div>
                </div>
                <button onClick={onBack} className="p-4 hover:bg-slate-200 rounded-2xl transition-all">
                    <FiX className="w-6 h-6 text-slate-400" />
                </button>
            </div>

            {/* Questions list */}
            <div className="flex-1 overflow-y-auto p-8 space-y-8 custom-scrollbar">
                {questions.map((question, idx) => {
                    const attempt = result.attemptDetails.find(a => a.questionId.toString() === question._id.toString());
                    const isCorrect = attempt?.isCorrect;
                    
                    return (
                        <div key={idx} className={`p-8 rounded-[2rem] border transition-all ${isCorrect ? 'bg-emerald-50/20 border-emerald-100' : 'bg-rose-50/20 border-rose-100'}`}>
                            <div className="flex justify-between items-start gap-4 mb-6">
                                <div className="flex gap-4">
                                     <span className="w-10 h-10 shrink-0 bg-white border border-slate-100 rounded-xl flex items-center justify-center font-black text-slate-400 text-sm">{idx + 1}</span>
                                     <h3 className="text-lg font-black text-slate-900 leading-tight pt-1 whitespace-pre-wrap">{question.questionText}</h3>
                                </div>
                                <div className="flex flex-col items-end gap-1">
                                    <span className={`text-[10px] font-black uppercase px-2.5 py-1 rounded-lg ${isCorrect ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'}`}>
                                        {isCorrect ? '+ ' : ''}{attempt?.score || 0} / {question.marks} Marks
                                    </span>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pl-14">
                                {question.options.map((option, oIdx) => {
                                    const isSelected = attempt?.userAnswer === option.text;
                                    const isCorrectOpt = option.isCorrect;
                                    
                                    let variantClasses = "bg-white border-slate-50 text-slate-500 opacity-60";
                                    if (isSelected && isCorrectOpt) variantClasses = "bg-emerald-500 border-emerald-500 text-white shadow-lg ring-4 ring-emerald-500/10";
                                    if (isSelected && !isCorrectOpt) variantClasses = "bg-rose-500 border-rose-500 text-white shadow-lg ring-4 ring-rose-500/10";
                                    if (!isSelected && isCorrectOpt) variantClasses = "bg-emerald-100 border-emerald-200 text-emerald-700 font-bold";

                                    return (
                                        <div key={oIdx} className={`p-4 rounded-2xl border flex items-center justify-between transition-all ${variantClasses}`}>
                                            <span className="text-sm">{option.text}</span>
                                            {isCorrectOpt && <FiCheck className="w-4 h-4" />}
                                            {isSelected && !isCorrectOpt && <FiX className="w-4 h-4" />}
                                        </div>
                                    );
                                })}
                            </div>

                            {!isCorrect && (
                                <div className="mt-6 pl-14 flex items-center gap-2 text-rose-600 text-xs font-black uppercase tracking-wider">
                                     <FiAlertTriangle /> Incorrect Submission
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            <style>{`
                .custom-scrollbar::-webkit-scrollbar {
                    width: 6px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: transparent;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: #e2e8f0;
                    border-radius: 10px;
                }
            `}</style>
        </div>
    );
};

export default ReviewTest;
