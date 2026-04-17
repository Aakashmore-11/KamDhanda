import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useSearchParams, useNavigate } from 'react-router-dom';
import {
    Plus, MoreVertical, Search, Send, Smile, Paperclip, Mic, X, Reply, ArrowLeft, Phone, Video, ShieldAlert, Filter, ListFilter, UserPlus, Info, Download, Trash2, Edit2, CheckCheck, Clock, MessageSquare, ShieldCheck, User, FileText
} from 'lucide-react';
import toast from 'react-hot-toast';
import { serverObj } from '../../config/serverConfig';
import useAuth from '../../customHooks/useAuth';
import Loader from '../../components/common/Loader';
import {
    generateKeyPair,
    exportPublicKey,
    exportPrivateKey,
    importPrivateKey,
    encryptMessage,
    decryptMessage
} from '../../utils/encryptionUtils';
const renderMessageWithLinks = (text) => {
    if (!text || typeof text !== 'string') return text;
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const parts = text.split(urlRegex);
    return parts.map((part, index) => {
        if (part.match(urlRegex)) {
            return (
                <a 
                    key={index} 
                    href={part} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="text-indigo-400 hover:text-indigo-500 underline decoration-indigo-400/30 underline-offset-2 transition-colors break-all"
                    onClick={(e) => e.stopPropagation()}
                >
                    {part}
                </a>
            );
        }
        return part;
    });
};

const Messages = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const serverAPI = serverObj.serverAPI;

    const [conversations, setConversations] = useState([]);
    const [selectedChat, setSelectedChat] = useState(null);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState("");
    const [loading, setLoading] = useState(true);
    const [conversationLoading, setConversationLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedFiles, setSelectedFiles] = useState([]);
    const [decryptedMessages, setDecryptedMessages] = useState({});
    const [replyingTo, setReplyingTo] = useState(null);
    const [editingMessage, setEditingMessage] = useState(null);
    const [showOptionsId, setShowOptionsId] = useState(null);
    const [isTyping, setIsTyping] = useState(false);
    const [sending, setSending] = useState(false);
    const typingTimeoutRef = useRef(null);
    const [draggedMsgId, setDraggedMsgId] = useState(null);
    const [dragOffset, setDragOffset] = useState(0);
    const fileInputRef = useRef(null);

    const messagesEndRef = useRef(null);
    const messagesContainerRef = useRef(null);
    const [isAtBottom, setIsAtBottom] = useState(true);
    const messagesRef = useRef([]);
    const privateKeyRef = useRef(null);

    useEffect(() => {
        messagesRef.current = messages;
    }, [messages]);

    const scrollToBottom = (behavior = "smooth", force = false) => {
        if (force || isAtBottom) {
            messagesEndRef.current?.scrollIntoView({ behavior });
        }
    };

    const handleScroll = (e) => {
        const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
        const reachedBottom = scrollHeight - scrollTop - clientHeight < 100;
        setIsAtBottom(reachedBottom);
    };

    useEffect(() => {
        if (messages.length > 0 && isAtBottom) {
            scrollToBottom("auto");
        }
    }, [decryptedMessages]);

    const fetchConversations = async () => {
        try {
            const res = await axios.get(`${serverAPI}/notification/conversations`, {
                withCredentials: true
            });
            setConversations(res.data);
            setConversationLoading(false);

            if (selectedChat) {
                const updatedConv = res.data.find(c => c.otherUser._id === selectedChat._id);
                if (updatedConv) {
                    const hasStatusChanged =
                        updatedConv.otherUser.typingTo !== selectedChat.typingTo ||
                        updatedConv.otherUser.lastSeen !== selectedChat.lastSeen;

                    if (hasStatusChanged) {
                        setSelectedChat(updatedConv.otherUser);
                    }
                }
            }

            const userIdFromUrl = searchParams.get('user_id');
            if (userIdFromUrl && !selectedChat) {
                const existingConv = res.data.find(c => c.otherUser._id === userIdFromUrl);
                if (existingConv) {
                    setSelectedChat(existingConv.otherUser);
                }
            }
        } catch (error) {
            console.error("Error fetching conversations", error);
            setConversationLoading(false);
        }
    };

    const manageKeys = async () => {
        if (!user) return;

        let privateKeyJWK = localStorage.getItem(`chat_priv_${user._id}`);
        let publicKeyJWK = localStorage.getItem(`chat_pub_${user._id}`);

        if (!privateKeyJWK || !publicKeyJWK) {
            try {
                const keyPair = await generateKeyPair();
                publicKeyJWK = await exportPublicKey(keyPair.publicKey);
                privateKeyJWK = await exportPrivateKey(keyPair.privateKey);

                localStorage.setItem(`chat_priv_${user._id}`, privateKeyJWK);
                localStorage.setItem(`chat_pub_${user._id}`, publicKeyJWK);

                await axios.patch(`${serverAPI}/user/update-public-key`, { publicKey: publicKeyJWK }, {
                    withCredentials: true
                });
            } catch (error) {
                console.error("Error setting up encryption keys", error);
            }
        }
        privateKeyRef.current = privateKeyJWK;
        if (messages.length > 0) decryptAll();
    };

    useEffect(() => {
        manageKeys();
    }, [user?._id]);

    const decryptAll = async () => {
        if (!privateKeyRef.current || (!messages.length && !conversations.length)) return;

        const newDecrypted = {};
        let hasChanges = false;

        for (const msg of messages) {
            if (msg.isEncrypted && !msg.isDeletedForEveryone && !decryptedMessages[msg._id]) {
                const senderId = msg.sender_id?._id || msg.sender_id;
                const isOwnMessage = senderId?.toString() === user?._id?.toString();
                const encryptedKey = isOwnMessage ? msg.senderEncryptedKey : msg.encryptedKey;

                if (encryptedKey && msg.iv) {
                    try {
                        const decrypted = await decryptMessage(msg.message, encryptedKey, msg.iv, privateKeyRef.current);
                        newDecrypted[msg._id] = decrypted;
                        hasChanges = true;
                    } catch (err) {
                        console.error("Decryption error", err);
                    }
                }
            }
            if (msg.replyTo && msg.replyTo.isEncrypted && !msg.replyTo.isDeletedForEveryone && !decryptedMessages[msg.replyTo._id]) {
                const rSenderId = msg.replyTo.sender_id?._id || msg.replyTo.sender_id;
                const isOwnReply = rSenderId?.toString() === user?._id?.toString();
                const rKey = isOwnReply ? msg.replyTo.senderEncryptedKey : msg.replyTo.encryptedKey;
                if (rKey && msg.replyTo.iv) {
                    try {
                        const decrypted = await decryptMessage(msg.replyTo.message, rKey, msg.replyTo.iv, privateKeyRef.current);
                        newDecrypted[msg.replyTo._id] = decrypted;
                        hasChanges = true;
                    } catch (err) {
                    }
                }
            }
        }

        for (const conv of conversations) {
            if (conv.isEncrypted && conv.lastMessageId && !conv.isDeletedForEveryone && !decryptedMessages[conv.lastMessageId]) {
                const isOwnMessage = conv.lastMessageSenderId?.toString() === user?._id?.toString();
                const encryptedKey = isOwnMessage ? conv.senderEncryptedKey : conv.encryptedKey;

                if (encryptedKey && conv.iv) {
                    try {
                        const decrypted = await decryptMessage(conv.lastMessage, encryptedKey, conv.iv, privateKeyRef.current);
                        newDecrypted[conv.lastMessageId] = decrypted;
                        hasChanges = true;
                    } catch (err) {
                    }
                }
            }
        }

        if (hasChanges) {
            setDecryptedMessages(prev => ({ ...prev, ...newDecrypted }));
        }
    };

    useEffect(() => {
        if ((messages.length > 0 || conversations.length > 0) && user?._id) {
            decryptAll();
        }
    }, [messages, conversations, user?._id]);


    const fetchChatHistory = async (otherUserId, showLoader = false, forceScroll = false) => {
        if (showLoader) setLoading(true);
        try {
            const res = await axios.get(`${serverAPI}/notification/history/${otherUserId}`, {
                withCredentials: true
            });
            setMessages(res.data);
            setLoading(false);
            if (forceScroll) setTimeout(() => scrollToBottom("auto", true), 50);
        } catch (error) {
            console.error("Error fetching history", error);
            setLoading(false);
        }
    };

    useEffect(() => {
        if (user) fetchConversations();
    }, [user]);

    useEffect(() => {
        if (selectedChat?._id) {
            fetchChatHistory(selectedChat._id, false, true);
            axios.patch(`${serverAPI}/notification/mark-chat-read/${selectedChat._id}`, {}, { withCredentials: true })
                .then(() => fetchConversations())
                .catch(() => { });

            const interval = setInterval(() => {
                fetchChatHistory(selectedChat._id, false, false);
                fetchConversations();
            }, 5000);
            return () => clearInterval(interval);
        }
    }, [selectedChat?._id]);

    const handleSend = async (e) => {
        e.preventDefault();
        if (!newMessage.trim() && selectedFiles.length === 0) return;
        if (!selectedChat || sending) return;

        setSending(true);
        try {
            if (editingMessage) {
                let editPayload = { message: newMessage };
                if (selectedChat.publicKey && privateKeyRef.current) {
                    const myPublicKeyJWK = localStorage.getItem(`chat_pub_${user._id}`);
                    const encryptedPayload = await encryptMessage(newMessage, selectedChat.publicKey, myPublicKeyJWK);
                    editPayload = {
                        message: encryptedPayload.encryptedMessage,
                        isEncrypted: true,
                        encryptedKey: encryptedPayload.encryptedKey,
                        senderEncryptedKey: encryptedPayload.senderEncryptedKey,
                        iv: encryptedPayload.iv
                    };
                }
                const res = await axios.patch(`${serverAPI}/notification/edit/${editingMessage._id}`, editPayload, { withCredentials: true });
                const updatedMsg = res.data.notification;
                if (updatedMsg.isEncrypted) setDecryptedMessages(prev => ({ ...prev, [updatedMsg._id]: newMessage }));
                setMessages(prev => prev.map(msg => msg._id === updatedMsg._id ? updatedMsg : msg));
                setEditingMessage(null);
                setNewMessage("");
                setSending(false);
                return;
            }

            const formData = new FormData();
            formData.append('recipientId', selectedChat._id);
            formData.append('type', 'message');

            if (selectedChat.publicKey && privateKeyRef.current) {
                const myPublicKeyJWK = localStorage.getItem(`chat_pub_${user._id}`);
                const encryptedPayload = await encryptMessage(newMessage, selectedChat.publicKey, myPublicKeyJWK);
                formData.append('message', encryptedPayload.encryptedMessage);
                formData.append('isEncrypted', 'true');
                formData.append('encryptedKey', encryptedPayload.encryptedKey);
                formData.append('senderEncryptedKey', encryptedPayload.senderEncryptedKey);
                formData.append('iv', encryptedPayload.iv);
            } else {
                formData.append('message', newMessage);
                formData.append('isEncrypted', 'false');
            }

            if (replyingTo) formData.append('replyTo', replyingTo._id);
            selectedFiles.forEach(file => formData.append('attachments', file));

            const res = await axios.post(`${serverAPI}/notification/send`, formData, { withCredentials: true });
            const sentMsg = res.data.notification;
            if (sentMsg.isEncrypted) setDecryptedMessages(prev => ({ ...prev, [sentMsg._id]: newMessage }));
            setMessages(prev => [...prev, sentMsg]);
            setNewMessage("");
            setSelectedFiles([]);
            setReplyingTo(null);
            setSending(false);
            setTimeout(() => scrollToBottom("smooth", true), 100);
            fetchConversations();
        } catch (error) {
            console.error("Error sending", error);
            setSending(false);
            const errMsg = error.response?.data?.message || "Failed to send";
            toast.error(errMsg);
        }
    };

    const handleMouseDown = (e, msgId) => {
        setDraggedMsgId(msgId);
        e.currentTarget.dataset.startX = e.clientX;
    };

    const handleMouseMove = (e) => {
        if (!draggedMsgId) return;
        const startX = parseFloat(e.currentTarget.dataset.startX);
        const diff = e.clientX - startX;
        // Limit drag offset (e.g., -80px to reply)
        if (diff < 0) {
            setDragOffset(Math.max(diff, -100));
        }
    };

    const handleMouseUp = (e, msg) => {
        if (draggedMsgId === msg._id && dragOffset < -60) {
            setReplyingTo(msg);
        }
        setDraggedMsgId(null);
        setDragOffset(0);
    };

    const startEdit = (msg) => {
        setEditingMessage(msg);
        setNewMessage(decryptedMessages[msg._id] || msg.message);
        setTimeout(() => document.getElementById('chat-input')?.focus(), 50);
    };

    const handleReact = async (messageId, emoji) => {
        try {
            const res = await axios.post(`${serverAPI}/notification/react/${messageId}`, { emoji }, { withCredentials: true });
            setMessages(prev => prev.map(msg => msg._id === messageId ? { ...msg, reactions: res.data } : msg));
            setShowOptionsId(null);
        } catch (err) { }
    };

    const handleDelete = async (messageId, deleteForEveryone = false) => {
        if (!window.confirm("Confirm delete?")) return;
        try {
            const decryptContent = decryptedMessages[messageId] || messages.find(m => m._id === messageId)?.message;
            await axios.delete(`${serverAPI}/notification/delete/${messageId}${deleteForEveryone ? '?type=everyone' : '?type=me'}`, {
                data: { decryptedMessage: decryptContent },
                withCredentials: true
            });
            if (deleteForEveryone) {
                setMessages(prev => prev.map(msg => msg._id === messageId ? { ...msg, message: "🚫 Message deleted", isDeletedForEveryone: true, attachments: [], reactions: [] } : msg));
            } else {
                setMessages(prev => prev.filter(msg => msg._id !== messageId));
            }
            setShowOptionsId(null);
        } catch (err) { }
    };

    const handleFiles = (e) => {
        const files = Array.from(e.target.files);
        setSelectedFiles(prev => [...prev, ...files].slice(0, 5));
        e.target.value = "";
    };

    const getStatus = (otherUser) => {
        if (!otherUser || !otherUser.lastSeen) return "Offline";
        const lastSeenDate = new Date(otherUser.lastSeen);
        const now = new Date();
        if (now - lastSeenDate < 120000) return "Online";
        return "Offline";
    };

    const resetKeys = async () => {
        if (!window.confirm("This will reset your security keys. Any past encrypted messages you haven't backed up may be unreadable. Continue?")) return;
        localStorage.removeItem(`chat_priv_${user._id}`);
        localStorage.removeItem(`chat_pub_${user._id}`);
        await manageKeys();
        toast.success("Security keys re-synchronized");
    };

    const filtered = conversations.filter(c => c.otherUser.fullName.toLowerCase().includes(searchTerm.toLowerCase()));

    if (conversationLoading) return <div className="h-screen flex items-center justify-center bg-white"><Loader /></div>;

    return (
        <div className="flex h-screen bg-white overflow-hidden font-['Outfit'] selection:bg-indigo-100 selection:text-indigo-900">
            {/* Sidebar */}
            <div className={`w-full md:w-[420px] flex flex-col border-r border-slate-50 transition-all duration-300 ${selectedChat ? 'hidden md:flex' : 'flex'}`}>
                <div className="p-8 border-b border-slate-50 bg-white sticky top-0 z-10">
                    <div className="flex items-center justify-between mb-8">
                        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Messages</h1>
                        <div className="flex items-center gap-2">
                            <button className="p-2 text-slate-400 hover:text-slate-600 transition-colors"><Plus className="w-5 h-5" /></button>
                        </div>
                    </div>
                    <div className="relative group mb-4">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Search people & messages..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-11 pr-4 py-3 bg-slate-50 border-none rounded-xl text-sm font-medium focus:ring-2 focus:ring-indigo-500/10 transition-all outline-none"
                        />
                    </div>
                    <div className="flex gap-2">
                        <button className="flex-1 py-3 px-4 rounded-xl bg-indigo-50 text-indigo-600 font-bold text-[10px] flex items-center justify-center gap-2 border border-indigo-100/50 transition-all hover:bg-indigo-100 shadow-sm uppercase tracking-widest"><ListFilter className="w-4 h-4" /> RECENT</button>
                        <button className="flex-1 py-3 px-4 rounded-xl bg-white text-slate-500 font-bold text-[10px] flex items-center justify-center gap-2 border border-slate-100 transition-all hover:bg-slate-50 uppercase tracking-widest"><Filter className="w-4 h-4" /> FILTER</button>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto custom-scrollbar p-2 space-y-1">
                    <div className="px-6 py-4 uppercase text-[10px] font-bold text-slate-400 tracking-widest">Pinned</div>
                    {filtered.slice(0, 2).map((conv) => (
                        <div key={conv.otherUser._id} onClick={() => setSelectedChat(conv.otherUser)} className={`group flex items-center gap-4 p-4 cursor-pointer rounded-2xl transition-all ${selectedChat?._id === conv.otherUser._id ? 'bg-slate-50' : 'hover:bg-slate-50/50'}`}>
                            <div className="relative shrink-0">
                                <div className="w-12 h-12 rounded-2xl overflow-hidden bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-lg">
                                    {conv.otherUser.profilePic ? <img src={conv.otherUser.profilePic} alt="" className="w-full h-full object-cover" /> : conv.otherUser.fullName.charAt(0)}
                                </div>
                                <div className={`absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 border-4 border-white rounded-full bg-indigo-500`}></div>
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex justify-between items-center mb-0.5">
                                    <h3 className="text-sm font-bold truncate text-slate-900">{conv.otherUser.fullName}</h3>
                                    <span className="text-[11px] text-slate-400">10:42</span>
                                </div>
                                <p className="text-[13px] text-slate-500 truncate pr-4">{conv.isEncrypted ? (decryptedMessages[conv.lastMessageId] || (conv.lastMessageHasAttachments ? "Shared a file" : "[Secure Message]")) : conv.lastMessage}</p>
                            </div>
                        </div>
                    ))}

                    <div className="px-6 py-4 uppercase text-[10px] font-bold text-slate-400 tracking-widest mt-2">All Messages</div>
                    {filtered.slice(2).map((conv) => (
                        <div key={conv.otherUser._id} onClick={() => setSelectedChat(conv.otherUser)} className={`group flex items-center gap-4 p-4 cursor-pointer rounded-2xl transition-all ${selectedChat?._id === conv.otherUser._id ? 'bg-slate-50/80 border border-slate-100 shadow-sm' : 'hover:bg-slate-50/50'}`}>
                            <div className="relative shrink-0">
                                <div className={`w-12 h-12 rounded-2xl overflow-hidden flex items-center justify-center font-bold text-lg ${['bg-red-50 text-red-600', 'bg-blue-50 text-blue-600', 'bg-purple-50 text-purple-600'][Math.floor(Math.random() * 3)]}`}>
                                    {conv.otherUser.profilePic ? <img src={conv.otherUser.profilePic} alt="" className="w-full h-full object-cover" /> : conv.otherUser.fullName.charAt(0)}
                                </div>
                                <div className={`absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 border-4 border-white rounded-full ${getStatus(conv.otherUser) === "Online" ? "bg-indigo-500" : "bg-slate-200"}`}></div>
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex justify-between items-center mb-0.5">
                                    <h3 className="text-sm font-bold truncate text-slate-900">{conv.otherUser.fullName}</h3>
                                    <span className="text-[11px] text-slate-400">Yesterday</span>
                                </div>
                                <p className="text-[13px] text-slate-500 truncate pr-4">{conv.isEncrypted ? (decryptedMessages[conv.lastMessageId] || (conv.lastMessageHasAttachments ? "Shared a file" : "[Secure Message]")) : conv.lastMessage}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Chat Window */}
            <div className={`flex-1 flex flex-col bg-white relative transition-all duration-500 ease-in-out ${!selectedChat ? 'hidden md:flex' : 'flex'}`}>
                {selectedChat ? (
                    <>
                        {/* Chat Header */}
                        <div className="h-20 flex items-center justify-between px-8 border-b border-slate-100 bg-white sticky top-0 z-30">
                            <div className="flex items-center gap-4">
                                <button onClick={() => setSelectedChat(null)} className="md:hidden w-10 h-10 flex items-center justify-center bg-slate-50 rounded-xl text-slate-900"><ArrowLeft className="w-5 h-5" /></button>
                                <div className="relative">
                                    <div className="w-11 h-11 rounded-2xl overflow-hidden bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-lg">
                                        {selectedChat.profilePic ? <img src={selectedChat.profilePic} className="w-full h-full object-cover" /> : selectedChat.fullName?.charAt(0)}
                                    </div>
                                    <div className={`absolute -bottom-1 -right-1 w-4 h-4 border-2 border-white rounded-full ${getStatus(selectedChat) === "Online" ? "bg-indigo-500" : "bg-slate-300"}`}></div>
                                </div>
                                <div className="min-w-0">
                                    <h2 className="text-base font-bold text-slate-900 truncate tracking-tight">{selectedChat.fullName || 'Unknown'}</h2>
                                    <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Workspace • {getStatus(selectedChat)}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <button onClick={resetKeys} title="Reset Security Keys" className="w-10 h-10 flex items-center justify-center text-emerald-600 bg-emerald-50 rounded-xl hover:bg-emerald-100 transition-all"><ShieldCheck className="w-5 h-5" /></button>
                                <button className="w-10 h-10 flex items-center justify-center text-slate-400 hover:text-slate-600 transition-all"><Phone className="w-5 h-5" /></button>
                                <button className="w-10 h-10 flex items-center justify-center text-slate-400 hover:text-slate-600 transition-all"><Video className="w-5 h-5" /></button>
                                <button className="w-10 h-10 flex items-center justify-center text-slate-400 hover:text-slate-600 transition-all"><MoreVertical className="w-5 h-5" /></button>
                            </div>
                        </div>

                        {/* Messages Body */}
                        <div ref={messagesContainerRef} onScroll={handleScroll} className="flex-1 overflow-y-auto p-10 space-y-10 bg-white custom-scrollbar relative">
                            {loading ? <div className="h-full flex items-center justify-center"><Loader /></div> : (
                                <>
                                    <div className="flex justify-center my-6">
                                        <span className="bg-slate-50 px-6 py-2.5 rounded-[20px] text-[10px] font-black text-slate-400 shadow-sm border border-slate-100/50 uppercase tracking-[0.3em]">Today</span>
                                    </div>

                                    {messages.map((m) => {
                                        const sid = m.sender_id?._id || m.sender_id;
                                        const isOwn = sid?.toString() === user?._id?.toString();
                                        const txt = m.isDeletedForEveryone ? "Content redacted" : m.isEncrypted ? (decryptedMessages[m._id] || (m.attachments?.length > 0 ? "" : "[Encrypted]")) : m.message;

                                        return (
                                            <div 
                                                key={m._id} 
                                                id={m._id} 
                                                className={`flex flex-col ${isOwn ? 'items-end' : 'items-start'} max-w-4xl transition-all duration-300 relative`}
                                                onMouseDown={(e) => handleMouseDown(e, m._id)}
                                                onMouseMove={(e) => handleMouseMove(e)}
                                                onMouseUp={(e) => handleMouseUp(e, m)}
                                                onMouseLeave={(e) => handleMouseUp(e, m)}
                                                onTouchStart={(e) => {
                                                    setDraggedMsgId(m._id);
                                                    e.currentTarget.dataset.startX = e.touches[0].clientX;
                                                }}
                                                onTouchMove={(e) => {
                                                    if (!draggedMsgId) return;
                                                    const startX = parseFloat(e.currentTarget.dataset.startX);
                                                    const diff = e.touches[0].clientX - startX;
                                                    if (diff < 0) setDragOffset(Math.max(diff, -100));
                                                }}
                                                onTouchEnd={(e) => handleMouseUp(e, m)}
                                            >
                                                {!isOwn && <div className="text-[12px] font-bold text-slate-500 mb-1 ml-14">{m.sender_id?.fullName || "User"}</div>}
                                                
                                                <div 
                                                    className={`flex items-end gap-3 ${isOwn ? 'flex-row-reverse' : 'flex-row'} transition-transform duration-100`}
                                                    style={{ transform: draggedMsgId === m._id ? `translateX(${dragOffset}px)` : 'none' }}
                                                >
                                                    {!isOwn && (
                                                        <div className={`w-10 h-10 rounded-2xl overflow-hidden flex items-center justify-center font-bold text-sm shrink-0 mb-1 ${['bg-red-50 text-red-600', 'bg-blue-50 text-blue-600', 'bg-purple-50 text-purple-600'][Math.floor(Math.random() * 3)]}`}>
                                                            {m.sender_id?.profilePic ? <img src={m.sender_id.profilePic} className="w-full h-full object-cover" /> : m.sender_id?.fullName?.charAt(0)}
                                                        </div>
                                                    )}
                                                    
                                                    <div className="relative group">
                                                        <div className={`px-6 py-4 rounded-[24px] shadow-sm relative transition-all duration-300
                                                            ${isOwn
                                                                ? 'bg-indigo-600 text-white rounded-[24px] rounded-tr-none shadow-md shadow-indigo-950/20'
                                                                : 'bg-[#f1f5f9] text-slate-800 rounded-[24px] rounded-tl-none border border-slate-200/50'
                                                            } ${m.isDeletedForEveryone ? 'opacity-50' : ''}`}
                                                            onContextMenu={(e) => { e.preventDefault(); setShowOptionsId(showOptionsId === m._id ? null : m._id); }}>
                                                            
                                                            {m.replyTo && (
                                                                <div className={`mb-3 p-3 rounded-xl border-l-[4px] cursor-pointer shadow-sm transition-all hover:brightness-95
                                                                    ${isOwn ? 'bg-black/10 border-white/40' : 'bg-white/50 border-indigo-500'}`}
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        const el = document.getElementById(m.replyTo._id);
                                                                        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                                                                    }}>
                                                                    <div className={`text-[10px] font-black uppercase tracking-widest mb-1 ${isOwn ? 'text-white/60' : 'text-indigo-600'}`}>{m.replyTo.sender_id?.fullName || "User"}</div>
                                                                    <div className={`text-xs font-semibold line-clamp-2 leading-relaxed ${isOwn ? 'text-white/80' : 'text-slate-500'}`}>{m.replyTo.isEncrypted ? (decryptedMessages[m.replyTo._id] || "[Encrypted]") : m.replyTo.message}</div>
                                                                </div>
                                                            )}

                                                            <div className="text-[15px] leading-relaxed font-medium break-words max-w-[500px] whitespace-pre-wrap">
                                                                {renderMessageWithLinks(txt)}
                                                                {m.updatedAt !== m.createdAt && <span className={`ml-2 text-[10px] opacity-50 italic`}>edited</span>}
                                                            </div>
                                                            
                                                            {m.attachments?.length > 0 && (
                                                                <div className="mt-4 space-y-2 text-left">
                                                                    {m.attachments.map((f, i) => (
                                                                        <div key={i} className="group/attach relative">
                                                                            {f.fileType === 'image' ? (
                                                                                <div className="relative rounded-2xl overflow-hidden border border-white/10 shadow-sm max-w-[320px] transition-all hover:scale-[1.01]">
                                                                                    <img src={f.url} className="w-full h-auto object-cover max-h-[400px]" alt="Shared" />
                                                                                    <div className="absolute inset-0 bg-black/0 group-hover/attach:bg-black/20 transition-all flex items-center justify-center opacity-0 group-hover/attach:opacity-100">
                                                                                        <button type="button" onClick={(e) => { e.stopPropagation(); window.open(f.url); }} className="w-10 h-10 bg-white/90 text-slate-900 rounded-full flex items-center justify-center shadow-lg hover:bg-white"><Download className="w-5 h-5" /></button>
                                                                                    </div>
                                                                                </div>
                                                                            ) : (
                                                                                <div className={`flex items-center gap-4 p-4 rounded-2xl border transition-all ${isOwn ? 'bg-white/10 border-white/5 backdrop-blur-sm hover:bg-white/20' : 'bg-white border-slate-100 hover:bg-slate-50 shadow-sm'}`}>
                                                                                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${isOwn ? 'bg-white/20 text-white' : 'bg-indigo-50 text-indigo-600'}`}>
                                                                                        <FileText className="w-6 h-6" />
                                                                                    </div>
                                                                                    <div className="flex-1 min-w-0">
                                                                                        <div className={`text-sm font-bold truncate ${isOwn ? 'text-white' : 'text-slate-900'}`}>
                                                                                            {f.fileName || f.name || `file-${i+1}.pdf`}
                                                                                        </div>
                                                                                        <div className={`text-[11px] font-bold uppercase tracking-widest leading-none mt-1 truncate ${isOwn ? 'text-white/60' : 'text-slate-400'}`}>
                                                                                            {f.fileType === 'pdf' ? 'PDF' : 'DOC'}
                                                                                        </div>
                                                                                    </div>
                                                                                    <button 
                                                                                        type="button" 
                                                                                        className={`p-2 transition-colors ${isOwn ? 'text-white/60 hover:text-white' : 'text-slate-400 hover:text-indigo-600'}`} 
                                                                                        onClick={(e) => { e.stopPropagation(); window.open(f.url); }}
                                                                                    >
                                                                                        <Download className="w-5 h-5" />
                                                                                    </button>
                                                                                </div>
                                                                            )}
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            )}
                                                            
                                                            <div className={`flex items-center gap-2 mt-2 ${isOwn ? 'justify-end' : 'justify-start'}`}>
                                                                <span className={`text-[10px] font-bold truncate ${isOwn ? 'text-white/40' : 'text-slate-400'}`}>
                                                                    {new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                                </span>
                                                                {isOwn && <CheckCheck className="w-3.5 h-3.5 text-white/40" />}
                                                            </div>
                                                        </div>
                                                        
                                                        <div className={`absolute top-0 ${isOwn ? '-left-14' : '-right-14'} opacity-0 group-hover:opacity-100 transition-opacity flex flex-col gap-1 z-10`}>
                                                            <button onClick={() => setReplyingTo(m)} className="p-2 hover:bg-slate-50 rounded-xl text-slate-400 transition-colors"><Reply className="w-4 h-4" /></button>
                                                            <button onClick={() => setShowOptionsId(showOptionsId === m._id ? null : m._id)} className="p-2 hover:bg-slate-50 rounded-xl text-slate-400 transition-colors"><Smile className="w-4 h-4" /></button>
                                                        </div>

                                                        {/* Reaction Picker Popover */}
                                                        {showOptionsId === m._id && (
                                                            <div className={`absolute ${isOwn ? 'right-0' : 'left-0'} bottom-full mb-4 z-[100] animate-in slide-in-from-bottom-2 duration-300`}>
                                                                <div className="bg-slate-900 border border-white/10 rounded-[24px] shadow-2xl p-2.5 flex gap-1.5 ring-4 ring-black/5">
                                                                    {['👍', '❤️', '😂', '😮', '😢', '🙏'].map(e => (
                                                                        <button key={e} onClick={() => handleReact(m._id, e)} className="hover:bg-white/10 p-2.5 rounded-2xl text-2xl transition-all hover:scale-125">{e}</button>
                                                                    ))}
                                                                    <div className="w-[1px] h-8 bg-white/10 mx-1 self-center"></div>
                                                                    <button onClick={() => { startEdit(m); setShowOptionsId(null); }} className="hover:bg-white/10 p-2.5 rounded-2xl text-white transition-all"><Edit2 className="w-5 h-5" /></button>
                                                                    <button onClick={() => { handleDelete(m._id, isOwn); setShowOptionsId(null); }} className="hover:bg-red-500/20 p-2.5 rounded-2xl text-red-500 transition-all"><Trash2 className="w-5 h-5" /></button>
                                                                </div>
                                                            </div>
                                                        )}

                                                        {/* Applied Reactions */}
                                                        {m.reactions?.length > 0 && (
                                                            <div className={`flex flex-wrap gap-1 mt-2 ${isOwn ? 'justify-end' : 'justify-start'}`}>
                                                                <div className="bg-white border border-slate-100 rounded-full px-2 py-0.5 shadow-sm flex gap-1 animate-in zoom-in-50">
                                                                    {Object.entries(m.reactions.reduce((acc, r) => { acc[r.emoji] = (acc[r.emoji] || 0) + 1; return acc; }, {})).map(([emoji, count]) => (
                                                                        <span key={emoji} className="text-xs flex items-center gap-1 font-bold text-slate-600">
                                                                            {emoji} {count > 1 && <span className="opacity-50">{count}</span>}
                                                                        </span>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>

                                                {/* Swipe to Reply Visual Indicator */}
                                                {draggedMsgId === m._id && dragOffset < -30 && (
                                                    <div className="absolute right-[-40px] top-1/2 -translate-y-1/2 opacity-0 animate-in fade-in slide-in-from-right-4 flex items-center gap-2">
                                                        <div className={`p-2 rounded-full ${dragOffset < -60 ? 'bg-indigo-100 text-indigo-600' : 'bg-slate-50 text-slate-300'} transition-colors shadow-sm`}>
                                                            <Reply className="w-5 h-5" />
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                    <div ref={messagesEndRef} />
                                </>
                            )}
                        </div>

                        {/* Input Area */}
                        <div className="p-8 bg-white border-t border-slate-50 sticky bottom-0 z-30">
                            {replyingTo && (
                                <div className="mb-4 mx-2 bg-indigo-50 rounded-3xl p-5 border-l-[6px] border-indigo-600 flex justify-between items-center animate-in slide-in-from-bottom-2 duration-300 shadow-sm">
                                    <div className="min-w-0 flex-1">
                                        <h4 className="text-[10px] font-black text-indigo-600 uppercase tracking-widest mb-1.5 leading-none">Replying to {replyingTo.sender_id?.fullName || "User"}</h4>
                                        <p className="text-xs font-bold text-slate-500 truncate leading-relaxed">
                                            {replyingTo.isEncrypted ? (decryptedMessages[replyingTo._id] || "•••••••••") : replyingTo.message}
                                        </p>
                                    </div>
                                    <button onClick={() => setReplyingTo(null)} className="w-8 h-8 flex items-center justify-center bg-white/50 rounded-full text-slate-400 hover:text-slate-600 transition-colors"><X className="w-4 h-4" /></button>
                                </div>
                            )}

                            <form onSubmit={handleSend} className="px-4 pb-2 pt-2">
                                {selectedFiles.length > 0 && (
                                    <div className="flex flex-wrap gap-3 mb-4 p-4 bg-slate-50/50 rounded-3xl border border-dashed border-slate-200 animate-in fade-in zoom-in-95 duration-300">
                                        {selectedFiles.map((file, idx) => (
                                            <div key={idx} className="relative group/file animate-in slide-in-from-bottom-2 duration-300">
                                                <div className="w-20 h-20 rounded-2xl overflow-hidden border border-white shadow-sm bg-white flex items-center justify-center relative">
                                                    {file.type.startsWith('image/') ? (
                                                        <img src={URL.createObjectURL(file)} className="w-full h-full object-cover" />
                                                    ) : (
                                                        <div className="flex flex-col items-center gap-1">
                                                            <FileText className="w-8 h-8 text-red-500" />
                                                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-tighter px-2 truncate w-full text-center">PDF</span>
                                                        </div>
                                                    )}
                                                </div>
                                                <button 
                                                    type="button"
                                                    onClick={() => setSelectedFiles(prev => prev.filter((_, i) => i !== idx))}
                                                    className="absolute -top-2 -right-2 w-6 h-6 bg-slate-900 text-white rounded-full flex items-center justify-center opacity-0 group-hover/file:opacity-100 transition-opacity shadow-lg hover:bg-red-500"
                                                >
                                                    <X className="w-3.5 h-3.5" />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                                <div className="bg-[#f1f5f9] rounded-[28px] p-2 pr-4 flex items-center gap-2 group transition-all">
                                    <button type="button" className="p-3 text-slate-400 hover:text-slate-600 transition-colors"><Smile className="w-5 h-5" /></button>
                                    <input
                                        id="chat-input"
                                        type="text"
                                        placeholder="Write a message..."
                                        value={newMessage}
                                        onChange={(e) => setNewMessage(e.target.value)}
                                        className="flex-1 bg-transparent border-none py-3 text-[15px] font-medium text-slate-900 placeholder:text-slate-500 focus:ring-0 outline-none"
                                    />
                                    <button type="button" onClick={() => fileInputRef.current.click()} className="p-2.5 text-slate-400 hover:text-slate-600 transition-colors"><Paperclip className="w-5 h-5" /></button>
                                    <button type="button" className="p-2.5 text-slate-400 hover:text-slate-600 transition-colors"><Mic className="w-5 h-5" /></button>
                                    <button type="submit" disabled={(!newMessage.trim() && selectedFiles.length === 0) || sending} className="w-10 h-10 bg-slate-200 text-slate-400 rounded-full flex items-center justify-center transition-all hover:bg-slate-900 hover:text-white disabled:opacity-50">
                                        {sending ? (
                                            <div className="w-4 h-4 border-2 border-slate-400 border-t-white rounded-full animate-spin"></div>
                                        ) : (
                                            <Send className="w-4 h-4 translate-x-0.5" />
                                        )}
                                    </button>
                                </div>
                                <div className="flex items-center justify-center gap-2 mt-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">
                                    <ShieldAlert className="w-3.5 h-3.5" />
                                    End-to-end encrypted
                                </div>
                                <input type="file" ref={fileInputRef} onChange={handleFiles} hidden multiple />
                            </form>
                        </div>
                    </>
                ) : (
                    <div className="flex flex-col items-center justify-center h-full bg-slate-50/10 p-12 text-center relative overflow-hidden group">
                        <div className="absolute top-[-20%] right-[-10%] w-[500px] h-[500px] bg-slate-900/5 rounded-full blur-[120px] group-hover:bg-slate-900/10 transition-colors duration-1000"></div>
                        <div className="absolute bottom-[-20%] left-[-10%] w-[500px] h-[500px] bg-slate-900/5 rounded-full blur-[120px] group-hover:bg-slate-900/10 transition-colors duration-1000"></div>
                        <div className="relative z-10 animate-in fade-in zoom-in-95 duration-1000">
                            <div className="w-32 h-32 bg-white rounded-[40px] shadow-2xl flex items-center justify-center mb-10 mx-auto rotate-3 hover:rotate-0 transition-transform duration-500 shadow-slate-100">
                                <div className="w-20 h-20 bg-slate-900 rounded-[25px] flex items-center justify-center shadow-lg">
                                    <MessageSquare className="w-10 h-10 text-white" />
                                </div>
                            </div>
                            <h2 className="text-4xl font-extrabold text-slate-900 mb-4 tracking-tighter">Secure Messaging</h2>
                            <p className="text-slate-500 font-medium max-w-sm mx-auto mb-12 leading-relaxed text-lg">Experience enterprise-grade security with a seamless design. Select a colleague to start collaborating.</p>
                            <div className="flex flex-wrap justify-center gap-5">
                                <div className="px-6 py-3 bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl shadow-slate-100/50 text-[11px] font-black uppercase tracking-widest text-slate-900 border border-slate-900/10">🛡️ E2EE Protocol</div>
                                <div className="px-6 py-3 bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl shadow-slate-100/50 text-[11px] font-black uppercase tracking-widest text-emerald-600 border border-emerald-50">⚡ Real-time Sync</div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            <style>{`
                .custom-scrollbar::-webkit-scrollbar { width: 6px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { 
                    background: #e2e8f0; 
                    border-radius: 10px; 
                    border: 2px solid white;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #cbd5e1; }
            `}</style>
        </div>
    );
};

export default Messages;
