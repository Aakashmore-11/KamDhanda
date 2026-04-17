import React, { useState } from 'react';
import axios from 'axios';
import { serverObj } from '../../config/serverConfig';
import { toast } from 'react-hot-toast';
import { FiPlus, FiTrash2, FiClock, FiSettings, FiCheckCircle } from 'react-icons/fi';

const CreateMockTest = ({ jobId, onTestCreated, onCancel }) => {
    const [testData, setTestData] = useState({
        title: '',
        description: '',
        duration: 30,
        passingCriteria: 60,
        testType: 'MCQ',
        totalMarks: 0,
        startTime: new Date().toISOString().slice(0, 16),
        endTime: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 16),
        rules: {
            negativeMarking: false,
            tabSwitchWarning: true,
            maxWarnings: 3
        }
    });

    const [questions, setQuestions] = useState([
        { questionText: '', type: 'MCQ-Single', marks: 5, correctAnswer: '', options: [{ text: '', isCorrect: false }, { text: '', isCorrect: false }] }
    ]);

    const [loading, setLoading] = useState(false);
    const serverAPI = serverObj.serverAPI;

    const handleAddQuestion = () => {
        setQuestions([...questions, { questionText: '', type: 'MCQ-Single', marks: 5, correctAnswer: '', options: [{ text: '', isCorrect: false }, { text: '', isCorrect: false }] }]);
    };

    const handleRemoveQuestion = (index) => {
        setQuestions(questions.filter((_, i) => i !== index));
    };

    const handleQuestionChange = (index, field, value) => {
        const newQuestions = [...questions];
        newQuestions[index][field] = value;
        setQuestions(newQuestions);
    };

    const handleOptionChange = (qIndex, oIndex, field, value) => {
        const newQuestions = [...questions];
        newQuestions[qIndex].options[oIndex][field] = value;
        setQuestions(newQuestions);
    };

    const handleAddOption = (qIndex) => {
        const newQuestions = [...questions];
        newQuestions[qIndex].options.push({ text: '', isCorrect: false });
        setQuestions(newQuestions);
    };

    const handleCreate = async () => {
        if (!testData.title || !testData.description) return toast.error("Please fill test title and description");
        
        setLoading(true);
        try {
            const totalMarks = questions.reduce((acc, q) => acc + parseInt(q.marks), 0);
            
            // 1. Create the test
            const testRes = await axios.post(`${serverAPI}/mocktest/create-test`, {
                ...testData,
                jobId,
                totalMarks
            }, { withCredentials: true });

            if (testRes.data.test) {
                const testId = testRes.data.test._id;

                // 2. Add questions
                await axios.post(`${serverAPI}/mocktest/add-questions`, {
                    testId,
                    questions
                }, { withCredentials: true });

                toast.success("Mock test created and questions added!");
                if (onTestCreated) onTestCreated(testRes.data.test);
            }
        } catch (error) {
            console.error(error);
            toast.error(error.response?.data?.message || "Failed to create mock test");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-xl max-h-[85vh] overflow-y-auto">
            <h2 className="text-2xl font-black text-gray-800 mb-6 flex items-center gap-3">
                <FiSettings className="text-indigo-600" /> Configure Mock Test
            </h2>

            <div className="space-y-6">
                {/* Basic Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label className="text-xs font-black uppercase text-gray-400">Test Title</label>
                        <input
                            type="text"
                            value={testData.title}
                            onChange={(e) => setTestData({ ...testData, title: e.target.value })}
                            className="w-full p-4 bg-gray-50 rounded-2xl outline-none focus:ring-2 ring-indigo-500/20 transition-all font-bold"
                            placeholder="e.g., Frontend React Assessment"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-xs font-black uppercase text-gray-400">Duration (Minutes)</label>
                        <div className="relative">
                            <FiClock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input
                                type="number"
                                value={testData.duration}
                                onChange={(e) => setTestData({ ...testData, duration: e.target.value })}
                                className="w-full p-4 pl-12 bg-gray-50 rounded-2xl outline-none focus:ring-2 ring-indigo-500/20 transition-all font-bold"
                            />
                        </div>
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="text-xs font-black uppercase text-gray-400">Description / Instructions</label>
                    <textarea
                        value={testData.description}
                        onChange={(e) => setTestData({ ...testData, description: e.target.value })}
                        className="w-full p-4 bg-gray-50 rounded-2xl h-24 outline-none focus:ring-2 ring-indigo-500/20 transition-all font-medium"
                        placeholder="Instructions for the candidates..."
                    />
                </div>

                {/* Rules */}
                <div className="flex flex-wrap gap-4 p-4 bg-indigo-50/50 rounded-2xl border border-indigo-100">
                   <label className="flex items-center gap-2 cursor-pointer">
                       <input 
                        type="checkbox" 
                        checked={testData.rules.tabSwitchWarning}
                        onChange={(e) => setTestData({...testData, rules: {...testData.rules, tabSwitchWarning: e.target.checked}})}
                        className="w-5 h-5 rounded accent-indigo-600"
                        />
                       <span className="text-sm font-bold text-indigo-700">Anti-Cheat (Tab Warnings)</span>
                   </label>
                   <label className="flex items-center gap-2 cursor-pointer">
                       <input 
                         type="checkbox" 
                         checked={testData.rules.negativeMarking}
                         onChange={(e) => setTestData({...testData, rules: {...testData.rules, negativeMarking: e.target.checked}})}
                         className="w-5 h-5 rounded accent-indigo-600"
                       />
                       <span className="text-sm font-bold text-indigo-700">Negative Marking (0.25)</span>
                   </label>
                </div>

                {/* Questions Section */}
                <div className="space-y-6 pt-6 border-t border-gray-100">
                    <div className="flex items-center justify-between">
                        <h3 className="text-lg font-black text-gray-800 uppercase tracking-widest">Questions ({questions.length})</h3>
                        <button
                            onClick={handleAddQuestion}
                            className="flex items-center gap-2 px-5 py-2.5 bg-slate-900 text-white rounded-xl font-black text-[10px] uppercase hover:bg-slate-800 transition-all"
                        >
                            <FiPlus /> Add Question
                        </button>
                    </div>

                    {questions.map((q, qIndex) => (
                        <div key={qIndex} className="p-6 bg-white border border-gray-100 rounded-[2rem] shadow-sm space-y-4 relative group">
                            <button
                                onClick={() => handleRemoveQuestion(qIndex)}
                                className="absolute top-6 right-6 p-2 text-gray-300 hover:text-red-500 transition-all"
                            >
                                <FiTrash2 />
                            </button>

                            <div className="flex flex-col md:flex-row gap-4 items-start">
                                <div className="flex-1 w-full space-y-2">
                                    <label className="text-[10px] font-black text-gray-400 uppercase">Question {qIndex + 1}</label>
                                    <textarea
                                        value={q.questionText}
                                        onChange={(e) => handleQuestionChange(qIndex, 'questionText', e.target.value)}
                                        className="w-full p-4 bg-gray-50 rounded-2xl outline-none focus:ring-1 ring-gray-200 font-bold h-24"
                                        placeholder="Enter your question here..."
                                    />
                                </div>
                                <div className="flex gap-4 w-full md:w-auto">
                                    <div className="w-40 space-y-2">
                                        <label className="text-[10px] font-black text-gray-400 uppercase">Type</label>
                                        <select
                                            value={q.type}
                                            onChange={(e) => handleQuestionChange(qIndex, 'type', e.target.value)}
                                            className="w-full p-4 bg-gray-50 rounded-2xl outline-none focus:ring-1 ring-gray-200 font-bold"
                                        >
                                            <option value="MCQ-Single">MCQ (Single)</option>
                                            <option value="Short-Answer">Short Answer</option>
                                            <option value="Coding">Coding</option>
                                        </select>
                                    </div>
                                    <div className="w-24 space-y-2">
                                        <label className="text-[10px] font-black text-gray-400 uppercase">Marks</label>
                                        <input
                                            type="number"
                                            value={q.marks}
                                            onChange={(e) => handleQuestionChange(qIndex, 'marks', e.target.value)}
                                            className="w-full p-4 bg-gray-50 rounded-2xl outline-none focus:ring-1 ring-gray-200 font-black text-center"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-2 py-2">
                                <label className="text-[10px] font-black text-emerald-600 uppercase flex items-center gap-1 px-1">
                                    <FiCheckCircle className="text-xs" /> Set Original Answer (Correct Answer Key)
                                </label>
                                <input
                                    type="text"
                                    value={q.correctAnswer || ''}
                                    onChange={(e) => handleQuestionChange(qIndex, 'correctAnswer', e.target.value)}
                                    className="w-full p-4 bg-emerald-50/30 border border-emerald-100 rounded-2xl outline-none focus:ring-2 ring-emerald-500/10 font-bold text-sm text-emerald-900 placeholder:text-emerald-300 transition-all focus:bg-emerald-50"
                                    placeholder={q.type === 'MCQ-Single' ? "Select a correct option below or type the answer here..." : "Type the exact correct answer for matching..."}
                                />
                            </div>

                            {/* Options for MCQ */}
                            {q.type === 'MCQ-Single' && (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    {q.options.map((opt, oIndex) => (
                                        <div 
                                            key={oIndex} 
                                            className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${
                                                opt.isCorrect ? 'bg-emerald-50 border-emerald-500 shadow-sm' : 'bg-gray-50/50 border-gray-100'
                                            }`}
                                        >
                                            <div className="flex flex-col items-center">
                                                <input
                                                    type="radio"
                                                    name={`q-${qIndex}`}
                                                    checked={opt.isCorrect}
                                                    onChange={() => {
                                                        const newQuestions = [...questions];
                                                        newQuestions[qIndex].options = newQuestions[qIndex].options.map((o, idx) => ({ ...o, isCorrect: idx === oIndex }));
                                                        // Sync
                                                        newQuestions[qIndex].correctAnswer = opt.text;
                                                        setQuestions(newQuestions);
                                                    }}
                                                    className="w-4 h-4 accent-emerald-600 cursor-pointer"
                                                />
                                                {opt.isCorrect && <span className="text-[8px] font-black text-emerald-600 uppercase mt-0.5">Correct</span>}
                                            </div>
                                            <input
                                                type="text"
                                                value={opt.text}
                                                onChange={(e) => {
                                                    handleOptionChange(qIndex, oIndex, 'text', e.target.value);
                                                    // Sync if correct
                                                    if (opt.isCorrect) {
                                                        const newQuestions = [...questions];
                                                        newQuestions[qIndex].correctAnswer = e.target.value;
                                                        setQuestions(newQuestions);
                                                    }
                                                }}
                                                className="flex-1 bg-transparent outline-none font-bold text-sm text-slate-700"
                                                placeholder={`Option ${oIndex + 1}`}
                                            />
                                        </div>
                                    ))}
                                    <button
                                        onClick={() => handleAddOption(qIndex)}
                                        className="p-3 border border-dashed border-gray-200 rounded-xl text-gray-400 hover:text-indigo-600 hover:border-indigo-200 flex items-center justify-center gap-2 text-xs font-bold"
                                    >
                                        <FiPlus /> Add Option
                                    </button>
                                </div>
                            )}
                        </div>
                    ))}
                </div>

                <div className="pt-8 flex gap-4">
                    <button
                        onClick={handleCreate}
                        disabled={loading}
                        className="flex-1 py-5 bg-indigo-600 text-white rounded-[2rem] font-black text-xs uppercase tracking-widest shadow-2xl shadow-indigo-600/20 active:scale-95 transition-all disabled:opacity-50"
                    >
                        {loading ? "SAVING..." : "DEPLOY MOCK TEST"}
                    </button>
                    <button
                        onClick={onCancel}
                        className="px-10 py-5 border border-slate-200 text-slate-500 rounded-[2rem] font-black text-xs uppercase tracking-widest hover:bg-slate-50"
                    >
                        CANCEL
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CreateMockTest;
