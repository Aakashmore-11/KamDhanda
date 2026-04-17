import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { io } from 'socket.io-client';
import axios from 'axios';
import { serverObj } from '../../config/serverConfig';
import { useSelector } from 'react-redux';
import { toast } from 'react-hot-toast';
import {
    FiMic, FiMicOff, FiVideo, FiVideoOff, FiMonitor,
    FiMessageSquare, FiPhone, FiUsers, FiWifi,
    FiSend, FiX, FiClock, FiUser, FiAlertTriangle
} from 'react-icons/fi';

const ICE_SERVERS = {
    iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' },
    ]
};

const InterviewRoom = () => {
    const { roomId } = useParams();
    const navigate = useNavigate();
    const { user } = useSelector(s => s.auth);
    const serverAPI = serverObj.serverAPI;
    const socketUrl = serverAPI; // socket.io is on the same server

    // Interview data
    const [interview, setInterview] = useState(null);
    const [loading, setLoading] = useState(true);
    const [phase, setPhase] = useState('waiting'); // waiting | live | ended

    // Media controls
    const [audioOn, setAudioOn] = useState(true);
    const [videoOn, setVideoOn] = useState(true);
    const [screenSharing, setScreenSharing] = useState(false);

    // UI panels
    const [chatOpen, setChatOpen] = useState(false);
    const [participantsOpen, setParticipantsOpen] = useState(false);
    const [networkQuality, setNetworkQuality] = useState(4); // 1-5

    // Chat
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [unreadCount, setUnreadCount] = useState(0);

    // Timer
    const [elapsed, setElapsed] = useState(0);
    const [participants, setParticipants] = useState([]);

    // Refs
    const localVideoRef = useRef(null);
    const remoteVideoRef = useRef(null);
    const socketRef = useRef(null);
    const peerConnectionRef = useRef(null);
    const localStreamRef = useRef(null);
    const screenStreamRef = useRef(null);
    const timerRef = useRef(null);
    const chatBottomRef = useRef(null);
    const remoteSocketIdRef = useRef(null);

    // ─── Fetch interview ───────────────────────────────────────────────────────
    useEffect(() => {
        const fetchInterview = async () => {
            try {
                const res = await axios.get(`${serverAPI}/interviews/room/${roomId}`, { withCredentials: true });
                setInterview(res.data.interview);
            } catch (e) {
                toast.error('Interview room not found or access denied');
                navigate(-1);
            } finally {
                setLoading(false);
            }
        };
        fetchInterview();
    }, [roomId]);

    // ─── Setup media & socket ──────────────────────────────────────────────────
    useEffect(() => {
        if (!interview || !user) return;

        let socket;
        let pc;

        const setup = async () => {
            // Get local media
            try {
                const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
                localStreamRef.current = stream;
                if (localVideoRef.current) localVideoRef.current.srcObject = stream;
            } catch (e) {
                toast.error('Could not access camera/microphone');
                return;
            }

            // Connect socket
            socket = io(socketUrl, { withCredentials: true });
            socketRef.current = socket;

            // Create RTCPeerConnection
            pc = new RTCPeerConnection(ICE_SERVERS);
            peerConnectionRef.current = pc;

            // Add local tracks to peer connection
            localStreamRef.current.getTracks().forEach(track => {
                pc.addTrack(track, localStreamRef.current);
            });

            // Handle remote stream
            pc.ontrack = (event) => {
                if (remoteVideoRef.current) {
                    remoteVideoRef.current.srcObject = event.streams[0];
                }
            };

            // ICE candidates
            pc.onicecandidate = (event) => {
                if (event.candidate && remoteSocketIdRef.current) {
                    socket.emit('ice-candidate', { to: remoteSocketIdRef.current, candidate: event.candidate });
                }
            };

            // Monitor connection quality
            pc.onconnectionstatechange = () => {
                const state = pc.connectionState;
                if (state === 'connected') setNetworkQuality(5);
                else if (state === 'connecting') setNetworkQuality(3);
                else if (state === 'disconnected') setNetworkQuality(1);
            };

            // Join the room via Socket.IO
            socket.emit('join-room', {
                roomId,
                userId: user._id,
                userName: user.fullName,
                role: user.role
            });

            setPhase('waiting');

            // ── Socket event handlers ────────────────────────────────────────
            socket.on('user-joined', async ({ userId, userName, role, socketId }) => {
                remoteSocketIdRef.current = socketId;
                setParticipants(prev => [...prev, { userId, userName, role, socketId }]);
                toast.success(`${userName} joined the room`);

                // If we're the initiator (client), create offer
                if (user.role === 'Client') {
                    const offer = await pc.createOffer();
                    await pc.setLocalDescription(offer);
                    socket.emit('offer', { to: socketId, offer });
                }

                setPhase('live');
                startTimer();
            });

            socket.on('room-users', ({ count }) => {
                if (count >= 2) {
                    setPhase('live');
                    startTimer();
                }
            });

            socket.on('offer', async ({ from, offer }) => {
                remoteSocketIdRef.current = from;
                await pc.setRemoteDescription(new RTCSessionDescription(offer));
                const answer = await pc.createAnswer();
                await pc.setLocalDescription(answer);
                socket.emit('answer', { to: from, answer });
                setPhase('live');
                startTimer();
            });

            socket.on('answer', async ({ answer }) => {
                await pc.setRemoteDescription(new RTCSessionDescription(answer));
            });

            socket.on('ice-candidate', async ({ candidate }) => {
                try {
                    await pc.addIceCandidate(new RTCIceCandidate(candidate));
                } catch (e) { console.warn('ICE error', e); }
            });

            socket.on('chat-message', (msg) => {
                setMessages(prev => [...prev, msg]);
                if (!chatOpen) setUnreadCount(prev => prev + 1);
            });

            socket.on('peer-media-status', ({ socketId, audio, video }) => {
                setParticipants(prev => prev.map(p =>
                    p.socketId === socketId ? { ...p, audio, video } : p
                ));
            });

            socket.on('user-left', ({ socketId }) => {
                setParticipants(prev => prev.filter(p => p.socketId !== socketId));
                if (remoteVideoRef.current) remoteVideoRef.current.srcObject = null;
                toast.error('The other participant left the room');
                setPhase('waiting');
                stopTimer();
            });
        };

        setup();

        return () => {
            cleanup();
        };
    }, [interview, user]);

    // ─── Timer ────────────────────────────────────────────────────────────────
    const startTimer = () => {
        if (timerRef.current) return;
        timerRef.current = setInterval(() => setElapsed(e => e + 1), 1000);
    };
    const stopTimer = () => {
        clearInterval(timerRef.current);
        timerRef.current = null;
    };

    const formatTime = (secs) => {
        const h = Math.floor(secs / 3600);
        const m = Math.floor((secs % 3600) / 60);
        const s = secs % 60;
        if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
        return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
    };

    // ─── Cleanup ──────────────────────────────────────────────────────────────
    const cleanup = () => {
        stopTimer();
        localStreamRef.current?.getTracks().forEach(t => t.stop());
        screenStreamRef.current?.getTracks().forEach(t => t.stop());
        peerConnectionRef.current?.close();
        socketRef.current?.emit('leave-room', { roomId });
        socketRef.current?.disconnect();
    };

    // ─── Controls ─────────────────────────────────────────────────────────────
    const toggleAudio = () => {
        const track = localStreamRef.current?.getAudioTracks()[0];
        if (track) {
            track.enabled = !track.enabled;
            setAudioOn(track.enabled);
            socketRef.current?.emit('media-status', { roomId, audio: track.enabled, video: videoOn });
        }
    };

    const toggleVideo = () => {
        const track = localStreamRef.current?.getVideoTracks()[0];
        if (track) {
            track.enabled = !track.enabled;
            setVideoOn(track.enabled);
            socketRef.current?.emit('media-status', { roomId, audio: audioOn, video: track.enabled });
        }
    };

    const toggleScreenShare = async () => {
        if (screenSharing) {
            // Stop screen share, revert to camera
            screenStreamRef.current?.getTracks().forEach(t => t.stop());
            const cameraTrack = localStreamRef.current?.getVideoTracks()[0];
            const sender = peerConnectionRef.current?.getSenders().find(s => s.track?.kind === 'video');
            if (sender && cameraTrack) await sender.replaceTrack(cameraTrack);
            if (localVideoRef.current) localVideoRef.current.srcObject = localStreamRef.current;
            setScreenSharing(false);
        } else {
            try {
                const screenStream = await navigator.mediaDevices.getDisplayMedia({ video: true });
                screenStreamRef.current = screenStream;
                const screenTrack = screenStream.getVideoTracks()[0];
                const sender = peerConnectionRef.current?.getSenders().find(s => s.track?.kind === 'video');
                if (sender) await sender.replaceTrack(screenTrack);
                if (localVideoRef.current) localVideoRef.current.srcObject = screenStream;
                setScreenSharing(true);
                screenTrack.onended = () => toggleScreenShare();
            } catch (e) {
                toast.error('Could not share screen');
            }
        }
    };

    const endCall = async () => {
        cleanup();
        // Mark as completed on server
        try {
            await axios.put(`${serverAPI}/interviews/update-status/${interview._id}`,
                { status: 'Completed' }, { withCredentials: true });
        } catch (e) { }
        const dashPath = user?.role === 'Client' ? '/client/interviews' : '/seeker/interviews';
        navigate(dashPath);
    };

    const sendMessage = () => {
        if (!newMessage.trim()) return;
        socketRef.current?.emit('chat-message', {
            roomId, message: newMessage,
            senderName: user.fullName, senderId: user._id
        });
        setNewMessage('');
    };

    // Auto-scroll chat
    useEffect(() => {
        chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
        if (chatOpen) setUnreadCount(0);
    }, [messages, chatOpen]);

    // Network quality simulation
    useEffect(() => {
        const interval = setInterval(() => {
            setNetworkQuality(q => Math.min(5, Math.max(1, q + (Math.random() > 0.7 ? -1 : 1))));
        }, 5000);
        return () => clearInterval(interval);
    }, []);

    const getNetworkColor = (q) => {
        if (q >= 4) return 'text-emerald-400';
        if (q >= 2) return 'text-amber-400';
        return 'text-red-400';
    };

    if (loading) return (
        <div className="h-screen bg-slate-950 flex items-center justify-center">
            <div className="text-center text-white">
                <div className="w-16 h-16 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                <p className="text-lg font-bold">Joining Room...</p>
            </div>
        </div>
    );

    return (
        <div className="h-screen bg-slate-950 flex flex-col overflow-hidden font-sans">
            {/* ── Top Bar ─────────────────────────────────────────────────── */}
            <div className="h-16 bg-slate-900/80 backdrop-blur-sm border-b border-white/5 flex items-center justify-between px-6 shrink-0">
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${phase === 'live' ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
                        <span className="text-white font-black text-sm">
                            {phase === 'live' ? 'LIVE' : 'WAITING'}
                        </span>
                    </div>
                    <span className="text-slate-400 text-sm font-medium">
                        {interview?.title || 'Virtual Interview'}
                    </span>
                </div>

                <div className="flex items-center gap-4">
                    {/* Timer */}
                    {phase === 'live' && (
                        <div className="flex items-center gap-2 px-4 py-2 bg-red-500/10 border border-red-500/20 rounded-full">
                            <FiClock className="text-red-400 text-xs" />
                            <span className="text-red-400 font-black text-sm font-mono">{formatTime(elapsed)}</span>
                        </div>
                    )}
                    {/* Network quality */}
                    <div className={`flex items-center gap-1 ${getNetworkColor(networkQuality)}`}>
                        <FiWifi className="text-sm" />
                        <span className="text-xs font-bold">
                            {networkQuality >= 4 ? 'Good' : networkQuality >= 2 ? 'Fair' : 'Poor'}
                        </span>
                    </div>
                    {/* Participants count */}
                    <div className="flex items-center gap-1 text-slate-400">
                        <FiUsers className="text-sm" />
                        <span className="text-xs font-bold">{participants.length + 1}</span>
                    </div>
                </div>
            </div>

            {/* ── Main Content ─────────────────────────────────────────────── */}
            <div className="flex-1 flex overflow-hidden">
                {/* Video Grid */}
                <div className="flex-1 flex flex-col p-4 gap-4 min-w-0">
                    {/* Waiting Room Banner */}
                    {phase === 'waiting' && (
                        <div className="flex items-center gap-3 p-4 bg-amber-500/10 border border-amber-500/20 rounded-2xl">
                            <div className="w-8 h-8 rounded-full bg-amber-500/20 flex items-center justify-center">
                                <FiUsers className="text-amber-400 text-sm" />
                            </div>
                            <div>
                                <p className="text-amber-300 font-bold text-sm">Waiting for other participant...</p>
                                <p className="text-amber-400/60 text-xs">Share your room link or wait for them to join</p>
                            </div>
                        </div>
                    )}

                    {/* Videos */}
                    <div className={`flex-1 grid gap-4 ${phase === 'live' ? 'grid-cols-2' : 'grid-cols-1'}`}>
                        {/* Remote Video */}
                        {phase === 'live' && (
                            <div className="relative bg-slate-900 rounded-3xl overflow-hidden border border-white/5 group">
                                <video
                                    ref={remoteVideoRef}
                                    autoPlay
                                    playsInline
                                    className="w-full h-full object-cover"
                                />
                                <div className="absolute bottom-4 left-4 px-3 py-1.5 bg-black/60 backdrop-blur-sm rounded-xl">
                                    <span className="text-white text-xs font-bold">
                                        {user.role === 'Client' ? interview?.seekerId?.fullName : interview?.clientId?.fullName}
                                    </span>
                                </div>
                            </div>
                        )}

                        {/* Local Video */}
                        <div className="relative bg-slate-900 rounded-3xl overflow-hidden border border-white/5">
                            <video
                                ref={localVideoRef}
                                autoPlay
                                muted
                                playsInline
                                className="w-full h-full object-cover mirror"
                                style={{ transform: 'scaleX(-1)' }}
                            />
                            {!videoOn && (
                                <div className="absolute inset-0 flex items-center justify-center bg-slate-800">
                                    <div className="w-20 h-20 rounded-full bg-slate-700 flex items-center justify-center">
                                        <FiUser className="text-4xl text-slate-400" />
                                    </div>
                                </div>
                            )}
                            <div className="absolute bottom-4 left-4 flex items-center gap-2">
                                <span className="px-3 py-1.5 bg-black/60 backdrop-blur-sm rounded-xl text-white text-xs font-bold">
                                    You {screenSharing ? '(Screen)' : ''}
                                </span>
                                {!audioOn && <span className="p-1.5 bg-red-500/80 rounded-lg"><FiMicOff className="text-white text-xs" /></span>}
                            </div>
                        </div>
                    </div>

                    {/* Interview Questions Panel (Client Only) */}
                    {user.role === 'Client' && interview?.questions?.length > 0 && (
                        <div className="p-4 bg-slate-900/50 border border-white/5 rounded-2xl">
                            <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest mb-2">Interview Questions</p>
                            <div className="flex gap-2 flex-wrap">
                                {interview.questions.map((q, i) => (
                                    <span key={i} className="px-3 py-1.5 bg-indigo-600/20 border border-indigo-500/20 rounded-xl text-indigo-300 text-xs font-medium">
                                        {i + 1}. {q}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* ── Side Panel (Chat / Participants) ──────────────────────── */}
                {(chatOpen || participantsOpen) && (
                    <div className="w-80 border-l border-white/5 bg-slate-900/50 flex flex-col shrink-0">
                        <div className="flex border-b border-white/5">
                            <button
                                onClick={() => { setChatOpen(true); setParticipantsOpen(false); setUnreadCount(0); }}
                                className={`flex-1 py-3 text-xs font-black uppercase tracking-widest transition-all ${chatOpen ? 'text-indigo-400 border-b-2 border-indigo-400' : 'text-slate-500'}`}
                            >
                                Chat {unreadCount > 0 && <span className="ml-1 px-1.5 py-0.5 bg-red-500 text-white rounded-full text-[9px]">{unreadCount}</span>}
                            </button>
                            <button
                                onClick={() => { setParticipantsOpen(true); setChatOpen(false); }}
                                className={`flex-1 py-3 text-xs font-black uppercase tracking-widest transition-all ${participantsOpen ? 'text-indigo-400 border-b-2 border-indigo-400' : 'text-slate-500'}`}
                            >
                                People
                            </button>
                            <button onClick={() => { setChatOpen(false); setParticipantsOpen(false); }} className="px-3 text-slate-600 hover:text-slate-400 transition-all">
                                <FiX />
                            </button>
                        </div>

                        {chatOpen && (
                            <>
                                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                                    {messages.length === 0 && (
                                        <p className="text-slate-600 text-xs text-center mt-8">No messages yet...</p>
                                    )}
                                    {messages.map((msg, i) => (
                                        <div key={i} className={`flex flex-col ${msg.senderId === user._id ? 'items-end' : 'items-start'}`}>
                                            <span className="text-[10px] text-slate-500 mb-1">{msg.senderName}</span>
                                            <div className={`max-w-[85%] px-3 py-2 rounded-2xl text-sm font-medium ${msg.senderId === user._id
                                                ? 'bg-indigo-600 text-white rounded-br-sm'
                                                : 'bg-slate-700 text-slate-200 rounded-bl-sm'}`}>
                                                {msg.message}
                                            </div>
                                            <span className="text-[9px] text-slate-600 mt-1">
                                                {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                        </div>
                                    ))}
                                    <div ref={chatBottomRef} />
                                </div>
                                <div className="p-4 border-t border-white/5">
                                    <div className="flex gap-2">
                                        <input
                                            type="text"
                                            value={newMessage}
                                            onChange={(e) => setNewMessage(e.target.value)}
                                            onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                                            className="flex-1 p-3 bg-slate-800 rounded-xl outline-none text-white text-sm font-medium placeholder:text-slate-600"
                                            placeholder="Type a message..."
                                        />
                                        <button onClick={sendMessage} className="p-3 bg-indigo-600 rounded-xl text-white hover:bg-indigo-500 transition-all">
                                            <FiSend className="text-sm" />
                                        </button>
                                    </div>
                                </div>
                            </>
                        )}

                        {participantsOpen && (
                            <div className="flex-1 overflow-y-auto p-4 space-y-3">
                                {/* Self */}
                                <div className="flex items-center gap-3 p-3 bg-slate-800/50 rounded-2xl">
                                    <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-white text-xs font-black">
                                        {user.fullName?.[0]}
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-white text-xs font-bold">{user.fullName} (You)</p>
                                        <p className="text-slate-500 text-[10px]">{user.role}</p>
                                    </div>
                                    <div className="flex gap-1">
                                        {audioOn ? <FiMic className="text-emerald-400 text-xs" /> : <FiMicOff className="text-red-400 text-xs" />}
                                        {videoOn ? <FiVideo className="text-emerald-400 text-xs" /> : <FiVideoOff className="text-red-400 text-xs" />}
                                    </div>
                                </div>
                                {participants.map((p, i) => (
                                    <div key={i} className="flex items-center gap-3 p-3 bg-slate-800/50 rounded-2xl">
                                        <div className="w-8 h-8 rounded-full bg-emerald-600 flex items-center justify-center text-white text-xs font-black">
                                            {p.userName?.[0]}
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-white text-xs font-bold">{p.userName}</p>
                                            <p className="text-slate-500 text-[10px]">{p.role}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* ── Controls Bar ─────────────────────────────────────────────── */}
            <div className="h-24 bg-slate-900/80 backdrop-blur-sm border-t border-white/5 flex items-center justify-center gap-4 shrink-0">
                {/* Audio */}
                <button
                    onClick={toggleAudio}
                    className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all active:scale-95 ${audioOn ? 'bg-slate-700 text-white hover:bg-slate-600' : 'bg-red-500 text-white hover:bg-red-600'}`}
                >
                    {audioOn ? <FiMic className="text-xl" /> : <FiMicOff className="text-xl" />}
                </button>

                {/* Video */}
                <button
                    onClick={toggleVideo}
                    className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all active:scale-95 ${videoOn ? 'bg-slate-700 text-white hover:bg-slate-600' : 'bg-red-500 text-white hover:bg-red-600'}`}
                >
                    {videoOn ? <FiVideo className="text-xl" /> : <FiVideoOff className="text-xl" />}
                </button>

                {/* Screen Share */}
                <button
                    onClick={toggleScreenShare}
                    className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all active:scale-95 ${screenSharing ? 'bg-indigo-600 text-white' : 'bg-slate-700 text-white hover:bg-slate-600'}`}
                >
                    <FiMonitor className="text-xl" />
                </button>

                {/* Chat */}
                <button
                    onClick={() => { setChatOpen(!chatOpen); setParticipantsOpen(false); if (!chatOpen) setUnreadCount(0); }}
                    className={`w-14 h-14 rounded-2xl flex items-center justify-center relative transition-all active:scale-95 ${chatOpen ? 'bg-indigo-600 text-white' : 'bg-slate-700 text-white hover:bg-slate-600'}`}
                >
                    <FiMessageSquare className="text-xl" />
                    {unreadCount > 0 && (
                        <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-[9px] font-black rounded-full flex items-center justify-center">
                            {unreadCount}
                        </span>
                    )}
                </button>

                {/* Participants */}
                <button
                    onClick={() => { setParticipantsOpen(!participantsOpen); setChatOpen(false); }}
                    className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all active:scale-95 ${participantsOpen ? 'bg-indigo-600 text-white' : 'bg-slate-700 text-white hover:bg-slate-600'}`}
                >
                    <FiUsers className="text-xl" />
                </button>

                {/* End Call */}
                <button
                    onClick={endCall}
                    className="w-16 h-14 bg-red-600 hover:bg-red-500 text-white rounded-2xl flex items-center justify-center transition-all active:scale-95 shadow-2xl shadow-red-600/40"
                >
                    <FiPhone className="text-xl rotate-[135deg]" />
                </button>
            </div>
        </div>
    );
};

export default InterviewRoom;
