import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { Bell, Info, CheckCircle2, MessageSquare } from 'lucide-react';
import { serverObj } from '../../config/serverConfig';
import useAuth from '../../customHooks/useAuth';
import { decryptMessage } from '../../utils/encryptionUtils';

const NotificationsDropdown = () => {
    const [notifications, setNotifications] = useState([]);
    const [isOpen, setIsOpen] = useState(false);
    const [replyTo, setReplyTo] = useState(null);
    const [replyMessage, setReplyMessage] = useState("");
    const [decryptedMessages, setDecryptedMessages] = useState({});
    const privateKeyRef = useRef(null);
    const dropdownRef = useRef(null);
    const navigate = useNavigate();
    const { user } = useAuth();
    const serverAPI = serverObj.serverAPI;

    const fetchNotifications = async () => {
        try {
            const res = await axios.get(`${serverAPI}/notification/my-notifications`, {
                withCredentials: true
            });
            setNotifications(res.data);
        } catch (error) {
            console.error("Error fetching notifications", error);
        }
    };

    useEffect(() => {
        if (user) {
            fetchNotifications();
            // Get private key from localStorage
            const privKey = localStorage.getItem(`chat_priv_${user._id}`);
            if (privKey) privateKeyRef.current = privKey;

            const interval = setInterval(fetchNotifications, 60000);
            return () => clearInterval(interval);
        }
    }, [user]);

    // Decrypt notifications
    useEffect(() => {
        const decryptAll = async () => {
            if (!user || !privateKeyRef.current || notifications.length === 0) return;

            const newDecrypted = { ...decryptedMessages };
            let hasChanges = false;

            for (const n of notifications) {
                if (n.isEncrypted && !newDecrypted[n._id]) {
                    const isOwnMessage = n.sender_id?._id === user._id;
                    const encryptedKey = isOwnMessage ? n.senderEncryptedKey : n.encryptedKey;

                    if (encryptedKey && n.iv) {
                        try {
                            const decrypted = await decryptMessage(n.message, encryptedKey, n.iv, privateKeyRef.current);
                            newDecrypted[n._id] = decrypted;
                            hasChanges = true;
                        } catch (err) {
                            console.error("Decryption error for notification:", n._id, err);
                        }
                    }
                }
            }

            if (hasChanges) {
                setDecryptedMessages(newDecrypted);
            }
        };

        decryptAll();
    }, [notifications, user]);

    // Handle outside click to close dropdown
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const markAsRead = async (id) => {
        try {
            await axios.patch(`${serverAPI}/notification/mark-read/${id}`, {}, {
                withCredentials: true
            });
            // Update local state
            setNotifications(prev =>
                prev.map(n => n._id === id ? { ...n, isRead: true } : n)
            );
        } catch (error) {
            console.error("Error marking as read", error);
        }
    };

    const handleSendReply = async (notification) => {
        if (!replyMessage.trim()) return;

        try {
            await axios.post(
                `${serverAPI}/notification/send`,
                {
                    recipientId: notification.sender_id._id,
                    message: replyMessage,
                    projectId: notification.project_id?._id
                },
                { withCredentials: true }
            );

            // On success, reset state
            setReplyTo(null);
            setReplyMessage("");

            // Fetch notifications again optionally to show sent, but the backend doesn't return "sent" messages yet. 
            // So we just clear the input box.
        } catch (error) {
            console.error("Error sending reply:", error);
        }
    };

    const unreadCount = notifications.filter(n => !n.isRead).length;

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="relative p-2 text-gray-600 hover:text-indigo-600 transition-colors rounded-full hover:bg-indigo-50"
            >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                    <span className="absolute top-1 right-1.5 flex h-2.5 w-2.5">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500"></span>
                    </span>
                )}
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden z-50">
                    <div className="bg-gradient-to-r from-indigo-50 to-purple-50 p-4 border-b border-indigo-100 flex justify-between items-center">
                        <h3 className="font-semibold text-gray-900">Notifications</h3>
                        {unreadCount > 0 && (
                            <span className="bg-indigo-600 text-white text-xs font-medium px-2 py-0.5 rounded-full">
                                {unreadCount} New
                            </span>
                        )}
                    </div>

                    <div className="max-h-96 overflow-y-auto">
                        {notifications.length === 0 ? (
                            <div className="p-8 text-center">
                                <div className="mx-auto w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center mb-3">
                                    <Bell className="w-5 h-5 text-gray-400" />
                                </div>
                                <p className="text-gray-500 text-sm">You have no notifications right now.</p>
                            </div>
                        ) : (
                            <div className="divide-y divide-gray-100">
                                {notifications.map((notification) => (
                                    <div
                                        key={notification._id}
                                        className={`p-4 transition-colors hover:bg-gray-50 ${!notification.isRead ? 'bg-indigo-50/30' : 'bg-white'}`}
                                    >
                                        <div className="flex gap-3">
                                            {/* Sender Avatar */}
                                            <div className="flex-shrink-0">
                                                {notification.sender_id?.profilePic ? (
                                                    <img
                                                        src={notification.sender_id.profilePic}
                                                        alt={notification.sender_id.fullName}
                                                        className="w-10 h-10 rounded-full object-cover border border-gray-200"
                                                        onError={(e) => {
                                                            e.target.onerror = null;
                                                            e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(notification.sender_id?.fullName || "User")}&background=random`;
                                                        }}
                                                    />
                                                ) : (
                                                    <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center">
                                                        <span className="text-indigo-600 font-bold text-sm">
                                                            {notification.sender_id?.fullName?.charAt(0) || '?'}
                                                        </span>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Content */}
                                            <div className="flex-1 min-w-0">
                                                <div className="flex justify-between items-start mb-1">
                                                    <p className="text-sm font-semibold text-gray-900 truncate">
                                                        {notification.sender_id?.fullName || "User"}
                                                    </p>
                                                    <span className="text-xs text-gray-500 whitespace-nowrap ml-2">
                                                        {new Date(notification.createdAt).toLocaleDateString()}
                                                    </span>
                                                </div>

                                                {/* If it's linked to a project, show banner */}
                                                {notification.project_id && (
                                                    <div className="mb-2">
                                                        <span className="text-[10px] font-medium text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100">
                                                            Re: {notification.project_id.title}
                                                        </span>
                                                    </div>
                                                )}

                                                <div className="bg-gray-50 rounded-lg p-3 text-sm text-gray-700 italic border border-gray-100 relative">
                                                    <MessageSquare className="w-3 h-3 text-gray-400 absolute top-3 left-3" />
                                                    <p className="pl-5 line-clamp-3">
                                                        {notification.isEncrypted
                                                            ? (decryptedMessages[notification._id] || "Decrypting...")
                                                            : notification.message}
                                                    </p>
                                                </div>

                                                {/* Actions */}
                                                <div className="mt-3 flex justify-between items-center">
                                                    <button
                                                        onClick={() => {
                                                            setIsOpen(false);
                                                            navigate(`/messages?user_id=${notification.sender_id._id}`);
                                                        }}
                                                        className="text-xs font-medium text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
                                                    >
                                                        Reply in Chat
                                                    </button>

                                                    {!notification.isRead && (
                                                        <button
                                                            onClick={() => markAsRead(notification._id)}
                                                            className="text-xs font-medium text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
                                                        >
                                                            <CheckCircle2 className="w-3.5 h-3.5" /> Mark as read
                                                        </button>
                                                    )}
                                                </div>

                                                {/* Inline Reply Form */}
                                                {replyTo === notification._id && (
                                                    <div className="mt-3 pt-3 border-t border-gray-100 animate-slideDown">
                                                        <textarea
                                                            autoFocus
                                                            value={replyMessage}
                                                            onChange={(e) => setReplyMessage(e.target.value)}
                                                            placeholder={`Reply to ${notification.sender_id?.fullName?.split(' ')[0]}...`}
                                                            className="w-full text-sm p-2 border border-gray-200 rounded-lg focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 outline-none resize-none h-16"
                                                        />
                                                        <div className="flex justify-end gap-2 mt-2">
                                                            <button
                                                                onClick={() => setReplyTo(null)}
                                                                className="px-3 py-1 text-xs text-gray-500 hover:bg-gray-100 rounded-md transition"
                                                            >
                                                                Cancel
                                                            </button>
                                                            <button
                                                                disabled={!replyMessage.trim()}
                                                                onClick={() => handleSendReply(notification)}
                                                                className="px-3 py-1 text-xs bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition disabled:opacity-50"
                                                            >
                                                                Send
                                                            </button>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="p-3 bg-gray-50 border-t border-gray-100 flex flex-col gap-2">
                        <Link
                            to="/messages"
                            onClick={() => setIsOpen(false)}
                            className="text-sm text-indigo-600 hover:text-indigo-800 font-bold py-1"
                        >
                            View All Messages
                        </Link>
                        <button
                            onClick={() => setIsOpen(false)}
                            className="text-xs text-gray-500 hover:text-gray-700 font-medium"
                        >
                            Close Menu
                        </button>
                    </div>
                </div>
            )}

            <style>{`
               @keyframes slideDown {
                 from { opacity: 0; transform: translateY(-5px); }
                 to { opacity: 1; transform: translateY(0); }
               }
               .animate-slideDown {
                 animation: slideDown 0.2s ease-out forwards;
               }
            `}</style>
        </div>
    );
};

export default NotificationsDropdown;
