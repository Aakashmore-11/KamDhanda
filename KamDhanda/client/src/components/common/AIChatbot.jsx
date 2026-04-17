import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BotMessageSquare, X, Send, Loader2, Sparkles, User, Minimize2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import axios from 'axios';
import { serverObj } from '../../config/serverConfig';

const AIChatbot = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        { role: 'model', content: "Hi! I'm KamDhanda AI. How can I help you with your freelancing or job search today?" }
    ]);
    const [inputValue, setInputValue] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef(null);
    const serverAPI = serverObj.serverAPI;

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        if (isOpen) {
            scrollToBottom();
        }
    }, [messages, isOpen]);

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!inputValue.trim() || isLoading) return;

        const userMsg = { role: 'user', content: inputValue.trim() };
        setMessages(prev => [...prev, userMsg]);
        setInputValue("");
        setIsLoading(true);

        try {
            // We prepend existing context so the AI remembers the conversation
            const chatHistory = [...messages, userMsg];
            
            const response = await axios.post(`${serverAPI}/ai/chat`, {
                messages: chatHistory
            }, { withCredentials: true });

            setMessages(prev => [...prev, { role: 'model', content: response.data.message }]);
        } catch (error) {
            console.error("Chat error:", error);
            // Specifically format 500 API Key error
            let errorMsg = "Sorry, I'm having trouble connecting right now. Please try again later.";
            if (error.response?.status === 500 && error.response?.data?.error?.includes('GEMINI_API_KEY')) {
                 errorMsg = "Setup Required: System Administrator needs to configure the GEMINI_API_KEY in the server environment.";
            }

            setMessages(prev => [...prev, { 
                role: 'model', 
                content: errorMsg,
                isError: true
            }]);
        } finally {
            setIsLoading(false);
        }
    };



    return (
        <>
            {/* Floating Action Button */}
            <AnimatePresence>
                {!isOpen && (
                    <motion.button
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0, opacity: 0 }}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setIsOpen(true)}
                        className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 px-6 h-14 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-full shadow-xl shadow-indigo-500/30 flex items-center justify-center gap-2.5 text-white z-50 group border border-white/10"
                    >
                        <BotMessageSquare size={24} className="animate-pulse" />
                        <span className="font-bold text-[15px] tracking-wide">Ask AI</span>
                    </motion.button>
                )}
            </AnimatePresence>

            {/* Chat Window Container */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 w-[calc(100vw-2rem)] h-[calc(100vh-8rem)] sm:w-[400px] sm:h-[600px] max-h-[85vh] bg-white rounded-2xl shadow-2xl flex flex-col z-50 overflow-hidden border border-slate-200/60"
                        style={{ transformOrigin: "bottom right" }}
                    >
                        {/* Header */}
                        <div className="bg-gradient-to-r from-slate-900 to-indigo-950 p-4 pb-5 relative shrink-0">
                            <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
                                <Sparkles size={60} />
                            </div>
                            <div className="flex items-start justify-between relative z-10">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center border-2 border-white/10 shadow-inner">
                                        <BotMessageSquare size={20} className="text-white" />
                                    </div>
                                    <div>
                                        <h3 className="text-white font-bold text-sm tracking-wide">KamDhanda AI</h3>
                                        <div className="flex items-center gap-1.5 mt-0.5">
                                            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                                            <span className="text-indigo-200 text-xs font-medium">Online & Ready</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <button onClick={() => setIsOpen(false)} className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white/70 hover:text-white transition-colors">
                                        <Minimize2 size={16} />
                                    </button>
                                </div>
                            </div>
                            
                            {/* Curved decorative bottom */}
                            <div className="absolute -bottom-6 left-0 right-0 h-6 bg-gradient-to-r from-slate-900 to-indigo-950 rounded-b-[100%] pointer-events-none z-0"></div>
                        </div>

                        {/* Messages Area */}
                        <div className="flex-1 bg-slate-50 p-4 sm:p-5 overflow-y-auto pt-8 flex flex-col gap-5 relative z-10 custom-scrollbar">
                            {messages.map((msg, index) => (
                                <motion.div 
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    key={index} 
                                    className={`flex w-full ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                                >
                                    <div className={`flex gap-3 max-w-[85%] ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                                        
                                        {/* Avatar */}
                                        <div className={`w-8 h-8 shrink-0 rounded-full flex items-center justify-center mt-auto ${msg.role === 'user' ? 'bg-slate-200 text-slate-500' : 'bg-indigo-100 text-indigo-600'}`}>
                                            {msg.role === 'user' ? <User size={16} /> : <BotMessageSquare size={16} />}
                                        </div>

                                        {/* Bubble */}
                                        <div className={`px-4 py-3 rounded-2xl text-[14px] leading-relaxed shadow-sm
                                            ${msg.role === 'user' 
                                                ? 'bg-indigo-600 text-white rounded-br-none' 
                                                : msg.isError 
                                                    ? 'bg-rose-50 text-rose-700 border border-rose-100 rounded-bl-none'
                                                    : 'bg-white text-slate-700 border border-slate-100 rounded-bl-none'
                                            }`}
                                        >
                                            {msg.role === 'model' ? (
                                                <div className="prose prose-sm prose-slate mx-auto markdown-rendered">
                                                    <ReactMarkdown>{msg.content}</ReactMarkdown>
                                                </div>
                                            ) : (
                                                msg.content
                                            )}
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                            
                            {isLoading && (
                                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start w-full">
                                    <div className="flex gap-3 max-w-[80%]">
                                        <div className="w-8 h-8 shrink-0 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center mt-auto">
                                            <BotMessageSquare size={16} />
                                        </div>
                                        <div className="p-4 rounded-2xl rounded-bl-none bg-white border border-slate-100 shadow-sm flex items-center gap-2">
                                            <div className="flex gap-1.5">
                                                <span className="w-2 h-2 rounded-full bg-indigo-400 animate-bounce" style={{ animationDelay: '0ms' }}></span>
                                                <span className="w-2 h-2 rounded-full bg-indigo-400 animate-bounce" style={{ animationDelay: '150ms' }}></span>
                                                <span className="w-2 h-2 rounded-full bg-indigo-400 animate-bounce" style={{ animationDelay: '300ms' }}></span>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Input Area */}
                        <div className="p-4 bg-white border-t border-slate-100 z-10 shrink-0">
                            <form onSubmit={handleSendMessage} className="relative flex items-end gap-2">
                                <div className="relative flex-1 bg-slate-50 border border-slate-200 rounded-2xl focus-within:border-indigo-500 focus-within:bg-white focus-within:ring-4 focus-within:ring-indigo-500/10 transition-all">
                                    <textarea
                                        rows={1}
                                        value={inputValue}
                                        onChange={(e) => setInputValue(e.target.value)}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter' && !e.shiftKey) {
                                                e.preventDefault();
                                                handleSendMessage(e);
                                            }
                                        }}
                                        placeholder="Ask about freelancing, jobs, or profile tips..."
                                        className="w-full bg-transparent px-4 py-3.5 text-sm outline-none resize-none max-h-32 custom-scrollbar text-slate-700 placeholder:text-slate-400 font-medium"
                                        style={{ minHeight: '52px' }}
                                    />
                                </div>
                                <button 
                                    type="submit" 
                                    disabled={!inputValue.trim() || isLoading}
                                    className="w-[52px] h-[52px] shrink-0 rounded-2xl bg-indigo-600 flex items-center justify-center text-white hover:bg-indigo-700 disabled:opacity-50 disabled:hover:bg-indigo-600 transition-colors shadow-sm"
                                >
                                    {isLoading ? <Loader2 size={20} className="animate-spin text-white/70" /> : <Send size={20} className="ml-1" />}
                                </button>
                            </form>
                            <p className="text-center text-[10px] uppercase font-bold tracking-widest text-slate-400 mt-3">KamDhanda AI Assistant</p>
                        </div>

                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
};

export default AIChatbot;
