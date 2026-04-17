import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { serverObj } from '../../config/serverConfig';
import { toast } from 'react-hot-toast';
import { FiClock, FiAlertTriangle, FiCheckCircle, FiChevronRight, FiChevronLeft, FiArrowRight, FiInfo, FiCheck } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';

const MockTestInterface = ({ testId, onComplete }) => {
    const [test, setTest] = useState(null);
    const [questions, setQuestions] = useState([]);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [answers, setAnswers] = useState({});
    const [timeLeft, setTimeLeft] = useState(0);
    const [tabWarnings, setTabWarnings] = useState(0);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [loading, setLoading] = useState(true);
    const serverAPI = serverObj.serverAPI;

    // Timer logic
    const timerRef = useRef();

    useEffect(() => {
        const fetchTestDetails = async () => {
            try {
                const res = await axios.get(`${serverAPI}/mocktest/test-details/${testId}`, { withCredentials: true });
                setTest(res.data.test);
                setQuestions(res.data.questions);
                setTimeLeft(res.data.test.duration * 60);
                setLoading(false);
                
                // Start timer
                timerRef.current = setInterval(() => {
                    setTimeLeft(prev => {
                        if (prev <= 1) {
                            clearInterval(timerRef.current);
                            handleSubmit(); // Auto-submit when time ends
                            return 0;
                        }
                        return prev - 1;
                    });
                }, 1000);

            } catch (error) {
                toast.error("Failed to load test");
                setLoading(false);
            }
        };

        fetchTestDetails();

        // Anti-cheat (Tab switch)
        const handleVisibilityChange = () => {
            if (document.hidden) {
                setTabWarnings(prev => {
                    const newWarnings = prev + 1;
                    toast.error(`Warning ${newWarnings}: Tab switching is not allowed!`, { icon: '🚫' });
                    return newWarnings;
                });
            }
        };

        document.addEventListener("visibilitychange", handleVisibilityChange);

        return () => {
            clearInterval(timerRef.current);
            document.removeEventListener("visibilitychange", handleVisibilityChange);
        };
    }, [testId, serverAPI]);

    const handleSubmit = async () => {
        if (isSubmitting) return;
        setIsSubmitting(true);
        clearInterval(timerRef.current);

        try {
            const res = await axios.post(`${serverAPI}/mocktest/submit-test`, {
                testId,
                answers,
                tabSwitchWarnings: tabWarnings,
                timeTaken: test.duration * 60 - timeLeft
            }, { withCredentials: true });

            if (res.data.success || res.status === 201) {
                toast.success("Test submitted successfully!");
                if (onComplete) onComplete(res.data.result);
            }
        } catch (error) {
            toast.error("Error submitting test");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleAnswerSelect = (questionId, optionText) => {
        setAnswers({ ...answers, [questionId]: optionText });
    };

    const formatTime = (seconds) => {
        const minutes = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${minutes}:${secs < 10 ? '0' : ''}${secs}`;
    };

    if (loading) return (
        <div className="h-screen flex flex-col items-center justify-center bg-[#07070d]">
            <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: 'linear' }} className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full"></motion.div>
            <p className="mt-4 font-black text-xs uppercase tracking-widest text-white/50 animate-pulse">Initializing Secure Environment...</p>
        </div>
    );
    if (!test) return <div className="h-screen flex items-center justify-center bg-[#07070d] text-white/50 font-bold">Test not found</div>;
    if (questions.length === 0) return <div className="h-screen flex items-center justify-center font-black text-white/50 uppercase tracking-widest bg-[#07070d]">No questions found in this test</div>;

    const currentQuestion = questions[currentQuestionIndex];
    const progressPercentage = ((currentQuestionIndex + 1) / questions.length) * 100;
    const answeredCount = Object.keys(answers).length;

    return (
        <div className="fixed inset-0 bg-[#07070d] z-[9999] flex flex-col font-sans text-white overflow-hidden select-none">
            {/* Top Navigation / Header */}
            <header className="h-24 px-8 lg:px-12 border-b border-white/5 flex items-center justify-between bg-[#0a0a14] shadow-2xl shrink-0 relative overflow-hidden">
                {/* Decorative glow */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-indigo-600/20 rounded-full blur-[120px] pointer-events-none"></div>

                <div className="flex items-center gap-6 relative z-10">
                    <div className={`p-4 rounded-3xl flex items-center gap-4 ${timeLeft < 60 ? 'bg-red-500/10 border border-red-500/20' : 'bg-white/5 border border-white/10'}`}>
                        <FiClock className={`w-6 h-6 ${timeLeft < 60 ? 'text-red-400 animate-pulse' : 'text-indigo-400'}`} />
                        <div>
                            <p className="text-[9px] font-black uppercase tracking-widest text-white/40 leading-none mb-1">Time Remaining</p>
                            <h2 className={`text-xl font-black font-mono tracking-tight ${timeLeft < 60 ? 'text-red-400' : 'text-white'}`}>
                                {formatTime(timeLeft)}
                            </h2>
                        </div>
                    </div>
                </div>

                <div className="absolute left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2 flex flex-col items-center z-10">
                    <h1 className="text-xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-white to-white/60">{test.title}</h1>
                    <div className="flex items-center gap-3 mt-2">
                        <div className="w-48 h-1.5 bg-white/10 rounded-full overflow-hidden">
                            <motion.div 
                                initial={{ width: 0 }}
                                animate={{ width: `${progressPercentage}%` }}
                                className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full"
                            />
                        </div>
                        <span className="text-[10px] font-black uppercase text-white/50 tracking-widest">{answeredCount}/{questions.length} Answered</span>
                    </div>
                </div>

                <div className="flex items-center gap-4 relative z-10">
                    {tabWarnings > 0 && (
                        <motion.div initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} className="flex items-center gap-3 px-5 py-2.5 bg-red-500/10 rounded-2xl border border-red-500/20 backdrop-blur-md">
                            <FiAlertTriangle className="text-red-400" />
                            <span className="text-[10px] font-black text-red-400 uppercase tracking-widest">Warnings: {tabWarnings}/{test.rules.maxWarnings}</span>
                        </motion.div>
                    )}
                    <button
                        onClick={() => { if (window.confirm("Are you sure you want to completely submit the test?")) handleSubmit(); }}
                        disabled={isSubmitting}
                        className="px-8 py-3.5 bg-white text-black hover:bg-slate-200 rounded-2xl font-black text-[11px] uppercase tracking-widest transition-all hover:scale-105 active:scale-95 shadow-[0_0_40px_rgba(255,255,255,0.1)]"
                    >
                        {isSubmitting ? 'Submitting...' : 'Finish Test'}
                    </button>
                </div>
            </header>

            {/* Main Content */}
            <div className="flex-1 flex overflow-hidden relative">
                
                {/* Navigation Sidebar */}
                <div className="w-80 border-r border-white/5 bg-[#0a0a14]/50 hidden lg:flex flex-col p-8 overflow-y-auto shrink-0 z-10 custom-scrollbar">
                    <h3 className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-6 flex items-center justify-between">
                        Question Navigator
                        <span className="text-indigo-400 bg-indigo-500/10 px-2 py-1 rounded-md">{Math.round(progressPercentage)}%</span>
                    </h3>
                    
                    <div className="grid grid-cols-4 gap-3">
                        {questions.map((q, idx) => {
                            const isAnswered = !!answers[q._id];
                            const isActive = currentQuestionIndex === idx;
                            
                            return (
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    key={idx}
                                    onClick={() => setCurrentQuestionIndex(idx)}
                                    className={`relative h-12 rounded-2xl text-sm font-black transition-all flex items-center justify-center border overflow-hidden ${
                                        isActive 
                                        ? 'bg-indigo-600 text-white border-indigo-500 shadow-[0_0_20px_rgba(79,70,229,0.3)]' 
                                        : isAnswered 
                                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
                                            : 'bg-white/5 text-white/40 border-white/5 hover:border-white/20 hover:text-white'
                                    }`}
                                >
                                    {isActive && (
                                        <motion.div layoutId="activeQ" className="absolute inset-0 bg-gradient-to-br from-indigo-500 to-purple-600 opacity-50" />
                                    )}
                                    <span className="relative z-10">{idx + 1}</span>
                                    {isAnswered && !isActive && <span className="absolute top-1 right-1 w-1.5 h-1.5 bg-emerald-400 rounded-full"></span>}
                                </motion.button>
                            );
                        })}
                    </div>

                    <div className="mt-auto pt-8">
                        <div className="p-5 bg-white/5 rounded-3xl border border-white/5 backdrop-blur-sm">
                            <h4 className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                                <FiInfo className="w-3 h-3" /> Important Rules
                            </h4>
                            <ul className="text-[11px] text-white/50 space-y-3 font-medium leading-relaxed">
                                <li className="flex items-start gap-2"><div className="w-1 h-1 mt-1.5 rounded-full bg-white/20 shrink-0"></div>Do not switch tabs or windows.</li>
                                <li className="flex items-start gap-2"><div className="w-1 h-1 mt-1.5 rounded-full bg-white/20 shrink-0"></div>Ensure a stable internet connection.</li>
                                <li className="flex items-start gap-2"><div className="w-1 h-1 mt-1.5 rounded-full bg-red-400 shrink-0 shadow-[0_0_8px_rgba(248,113,113,0.5)]"></div>Test auto-submits when time expires.</li>
                            </ul>
                        </div>
                    </div>
                </div>

                {/* Question Display Area */}
                <div className="flex-1 overflow-y-auto p-8 lg:p-16 flex flex-col relative custom-scrollbar">
                    <AnimatePresence mode="wait">
                        <motion.div 
                            key={currentQuestionIndex}
                            initial={{ opacity: 0, y: 20, filter: 'blur(10px)' }}
                            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                            exit={{ opacity: 0, y: -20, filter: 'blur(10px)' }}
                            transition={{ duration: 0.3 }}
                            className="max-w-3xl w-full mx-auto"
                        >
                            <div className="flex items-center gap-4 mb-8">
                                <span className="px-4 py-2 bg-white/10 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest leading-none border border-white/10 backdrop-blur-md">
                                    Question {currentQuestionIndex + 1}
                                </span>
                                <span className="px-4 py-2 bg-indigo-500/10 text-indigo-400 rounded-2xl text-[10px] font-black uppercase tracking-widest border border-indigo-500/20 backdrop-blur-md">
                                    {currentQuestion.marks} Marks
                                </span>
                            </div>

                            <h2 className="text-3xl lg:text-4xl font-black text-white mb-12 leading-snug whitespace-pre-wrap tracking-tight">
                                {currentQuestion.questionText}
                            </h2>

                            <div className="space-y-4">
                                {currentQuestion.options.map((option, idx) => {
                                    const isSelected = answers[currentQuestion._id] === option.text;
                                    
                                    return (
                                        <button
                                            key={idx}
                                            onClick={() => handleAnswerSelect(currentQuestion._id, option.text)}
                                            className={`relative w-full group flex items-center gap-6 p-5 lg:p-6 rounded-[2rem] border transition-all duration-300 text-left overflow-hidden ${
                                                isSelected
                                                ? 'bg-indigo-600 border-indigo-500 shadow-[0_10px_40px_-10px_rgba(79,70,229,0.5)] transform -translate-y-1'
                                                : 'bg-white/5 border-white/5 text-white/80 hover:border-white/20 hover:bg-white/10'
                                            }`}
                                        >
                                            {isSelected && (
                                                <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-600 opacity-20 pointer-events-none"></div>
                                            )}
                                            
                                            <div className={`w-12 h-12 shrink-0 rounded-2xl flex items-center justify-center font-black transition-all ${
                                                isSelected
                                                ? 'bg-white text-indigo-600 shadow-xl'
                                                : 'bg-white/10 text-white/50 group-hover:bg-white/20 group-hover:text-white'
                                            }`}>
                                                {String.fromCharCode(65 + idx)}
                                            </div>
                                            <span className={`text-lg font-bold pr-12 ${isSelected ? 'text-white' : 'text-white/90'}`}>{option.text}</span>
                                            
                                            <div className={`absolute right-6 transition-all duration-300 ${isSelected ? 'opacity-100 scale-100' : 'opacity-0 scale-50'}`}>
                                                <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                                                    <FiCheckCircle className="w-5 h-5 text-white" />
                                                </div>
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>
                        </motion.div>
                    </AnimatePresence>

                    {/* Footer Nav Controls */}
                    <div className="max-w-3xl w-full mx-auto mt-auto pt-16 flex items-center justify-between z-10">
                        <button
                            onClick={() => setCurrentQuestionIndex(prev => Math.max(0, prev - 1))}
                            disabled={currentQuestionIndex === 0}
                            className="flex items-center gap-3 px-8 py-4 bg-white/5 border border-white/10 text-white/70 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-white/10 hover:text-white disabled:opacity-20 disabled:hover:bg-white/5 transition-all active:scale-95 backdrop-blur-sm"
                        >
                            <FiChevronLeft className="w-5 h-5" /> Prev
                        </button>

                        <div className="flex gap-2 lg:hidden">
                            <span className="text-xs font-bold text-white/50">{currentQuestionIndex + 1} / {questions.length}</span>
                        </div>

                        {currentQuestionIndex === questions.length - 1 ? (
                            <button
                                onClick={() => { if (window.confirm("All questions done. Submit now?")) handleSubmit(); }}
                                className="flex items-center gap-3 px-8 py-4 bg-white text-black rounded-2xl font-black text-xs uppercase tracking-widest shadow-[0_0_30px_rgba(255,255,255,0.2)] active:scale-95 transition-all hover:scale-105"
                            >
                                Finish <FiCheck className="w-5 h-5" />
                            </button>
                        ) : (
                            <button
                                onClick={() => setCurrentQuestionIndex(prev => Math.min(questions.length - 1, prev + 1))}
                                className="flex items-center gap-3 px-8 py-4 bg-indigo-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-[0_10px_30px_-10px_rgba(79,70,229,0.5)] hover:bg-indigo-500 transition-all active:scale-95"
                            >
                                Next <FiArrowRight className="w-5 h-5" />
                            </button>
                        )}
                    </div>
                </div>
            </div>

            <style>{`
                .custom-scrollbar::-webkit-scrollbar {
                    width: 6px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: transparent;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: rgba(255, 255, 255, 0.1);
                    border-radius: 10px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: rgba(255, 255, 255, 0.2);
                }
            `}</style>
        </div>
    );
};

export default MockTestInterface;
