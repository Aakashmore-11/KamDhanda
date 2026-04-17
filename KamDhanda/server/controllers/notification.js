const Notification = require('../models/notification_model');
const User = require('../models/users_model'); // Ensure User model is registered for populate

// Client sending a message to a Seeker
const sendNotification = async (req, res) => {

    try {
        const { recipientId, message, projectId, isEncrypted, encryptedKey, senderEncryptedKey, iv, replyTo } = req.body;
        const senderId = req.user._id;

        if (!recipientId || (!message?.trim() && (!req.files || req.files.length === 0))) {
            return res.status(400).json({ message: "Recipient ID and message or attachment are required." });
        }

        const attachments = [];
        if (req.files && req.files.length > 0) {
            req.files.forEach(file => {
                const fileType = file.mimetype.startsWith('image/') ? 'image' :
                    file.mimetype === 'application/pdf' ? 'pdf' : 'document';

                attachments.push({
                    url: file.path, 
                    fileType: fileType,
                    fileName: file.originalname
                });
            });
        }

        const notification = await Notification.create({
            sender_id: senderId,
            recipient_id: recipientId,
            project_id: projectId || undefined,
            message: message?.trim() || (attachments.length > 0 ? "" : undefined),
            type: 'message',
            attachments: attachments,
            isEncrypted: isEncrypted === 'true' || isEncrypted === true,
            encryptedKey: encryptedKey || undefined,
            senderEncryptedKey: senderEncryptedKey || undefined,
            iv: iv || undefined,
            replyTo: replyTo || undefined
        });

        const populatedNotification = await Notification.findById(notification._id)
            .populate('sender_id', 'fullName profilePic role publicKey')
            .populate('recipient_id', 'fullName profilePic role publicKey')
            .populate('project_id', 'title');

        res.status(201).json({ message: "Message sent successfully!", notification: populatedNotification });
    } catch (error) {
        console.error("CRITICAL ERROR in sendNotification:", error);
        res.status(500).json({ message: error.message || "Internal server error" });
    }
};

// User (Seeker or Client) fetching their notifications
const getMyNotifications = async (req, res) => {
    try {
        const userId = req.user._id;

        // Fetch notifications where recipient is the current user.
        // Populate sender info for the UI (name, avatar, role)
        const notifications = await Notification.find({ recipient_id: userId })
            .populate('sender_id', 'fullName profilePic role publicKey')
            .populate('project_id', 'title')
            .sort({ createdAt: -1 }); // Newest first

        res.status(200).json(notifications);
    } catch (error) {
        console.error("Error fetching notifications:", error);
        res.status(500).json({ message: error.message || "Internal server error" });
    }
};

// User marks a notification as read
const markAsRead = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user._id;

        const notification = await Notification.findOneAndUpdate(
            { _id: id, recipient_id: userId }, // Ensure the user owns this notification
            { isRead: true },
            { new: true }
        );

        if (!notification) {
            return res.status(404).json({ message: "Notification not found or unauthorized." });
        }

        res.status(200).json({ message: "Marked as read.", notification });
    } catch (error) {
        console.error("Error marking notification as read:", error);
        res.status(500).json({ message: error.message || "Internal server error" });
    }
};

// Get list of unique conversations for the current user
const getConversations = async (req, res) => {
    try {
        const userId = req.user._id;

        // Find all notifications where the user is either sender or recipient
        const notifications = await Notification.find({
            $or: [{ sender_id: userId }, { recipient_id: userId }],
            deletedBy: { $ne: userId }
        })
            .populate('sender_id', 'fullName profilePic role publicKey lastSeen')
            .populate('recipient_id', 'fullName profilePic role publicKey lastSeen')
            .sort({ createdAt: -1 });

        const conversationsMap = new Map();

        notifications.forEach(n => {
            if (!n.sender_id || !n.recipient_id) return; // Skip if user missing

            const otherUser = n.sender_id._id.toString() === userId.toString() ? n.recipient_id : n.sender_id;
            if (!otherUser) return;

            const otherUserId = otherUser._id.toString();

            if (!conversationsMap.has(otherUserId)) {
                conversationsMap.set(otherUserId, {
                    otherUser: otherUser,
                    lastMessage: n.message,
                    lastMessageDate: n.createdAt,
                    unreadCount: (!n.isRead && n.recipient_id._id.toString() === userId.toString()) ? 1 : 0,
                    lastMessageId: n._id, // Add ID for decryption map
                    lastMessageSenderId: n.sender_id._id, // To know which key to use
                    isEncrypted: n.isEncrypted,
                    iv: n.iv,
                    encryptedKey: n.encryptedKey,
                    senderEncryptedKey: n.senderEncryptedKey,
                    lastMessageHasAttachments: n.attachments && n.attachments.length > 0
                });
            } else if (!n.isRead && n.recipient_id._id.toString() === userId.toString()) {
                const conv = conversationsMap.get(otherUserId);
                conv.unreadCount += 1;
            }
        });

        res.status(200).json(Array.from(conversationsMap.values()));
    } catch (error) {
        console.error("Error fetching conversations:", error);
        res.status(500).json({ message: error.message || "Internal server error" });
    }
};

// Get full message history between two users
const getChatHistory = async (req, res) => {
    try {
        const userId = req.user._id;
        const { otherUserId } = req.params;

        const messages = await Notification.find({
            $or: [
                { sender_id: userId, recipient_id: otherUserId },
                { sender_id: otherUserId, recipient_id: userId }
            ],
            deletedBy: { $ne: userId }
        })
            .populate('sender_id', 'fullName profilePic role publicKey')
            .populate('recipient_id', 'fullName profilePic role publicKey')
            .populate('project_id', 'title')
            .populate({
                path: 'replyTo',
                select: 'message isEncrypted attachments iv encryptedKey senderEncryptedKey',
                populate: { path: 'sender_id', select: '_id fullName' }
            })
            .sort({ createdAt: 1 }); // Oldest first for history

        // Mark these as read since the user is viewing the chat
        await Notification.updateMany(
            { sender_id: otherUserId, recipient_id: userId, isRead: false },
            { isRead: true }
        );

        res.status(200).json(messages);
    } catch (error) {
        console.error("Error fetching chat history:", error);
        res.status(500).json({ message: error.message || "Internal server error" });
    }
};

// Mark all messages from a specific sender as read
const markChatAsRead = async (req, res) => {
    try {
        const { senderId } = req.params;
        const userId = req.user._id;

        await Notification.updateMany(
            { sender_id: senderId, recipient_id: userId, isRead: false },
            { isRead: true }
        );

        res.status(200).json({ message: "Chat marked as read." });
    } catch (error) {
        console.error("Error marking chat as read:", error);
        res.status(500).json({ message: error.message || "Internal server error" });
    }
};

const addReaction = async (req, res) => {
    try {
        const { messageId } = req.params;
        const { emoji } = req.body;
        const userId = req.user._id;

        const message = await Notification.findById(messageId);
        if (!message) return res.status(404).json({ message: "Message not found" });

        const existingReactionIndex = message.reactions.findIndex(
            r => r.user_id && r.user_id.toString() === userId.toString()
        );

        if (existingReactionIndex > -1) {
            if (message.reactions[existingReactionIndex].emoji === emoji) {
                // Remove if same emoji is tapped again
                message.reactions.splice(existingReactionIndex, 1);
            } else {
                // Replace with new emoji if different
                message.reactions[existingReactionIndex].emoji = emoji;
            }
        } else {
            // Add new reaction
            message.reactions.push({ user_id: userId, emoji });
        }

        await message.save();
        res.status(200).json(message.reactions);
    } catch (error) {
        console.error("Error adding reaction:", error);
        res.status(500).json({ message: error.message || "Internal server error" });
    }
};

const editMessage = async (req, res) => {
    try {
        const { messageId } = req.params;
        const { message: newMessage, iv, encryptedKey, senderEncryptedKey } = req.body;
        const userId = req.user._id;

        const message = await Notification.findById(messageId);
        if (!message) return res.status(404).json({ message: "Message not found" });

        // Ownership check
        if (message.sender_id.toString() !== userId.toString()) {
            return res.status(403).json({ message: "Unauthorized to edit this message" });
        }

        // Time limit check (1 hour)
        const diff = Date.now() - new Date(message.createdAt).getTime();
        if (diff > 3600000) {
            return res.status(400).json({ message: "Editing time limit exceeded (1 hour)" });
        }

        // Update fields
        message.message = newMessage;
        if (iv) message.iv = iv;
        if (encryptedKey) message.encryptedKey = encryptedKey;
        if (senderEncryptedKey) message.senderEncryptedKey = senderEncryptedKey;
        message.isEdited = true;

        await message.save();
        res.status(200).json({ message: "Message edited successfully", notification: message });
    } catch (error) {
        console.error("Error editing message:", error);
        res.status(500).json({ message: error.message || "Internal server error" });
    }
};

const deleteMessage = async (req, res) => {
    try {
        const { messageId } = req.params;
        const { type } = req.query; // 'everyone' or 'me'
        const userId = req.user._id;

        const message = await Notification.findById(messageId);
        if (!message) return res.status(404).json({ message: "Message not found" });

        // Message existence check (already done above)

        const { decryptedMessage } = req.body; // Expecting decrypted content from client

        if (type === 'everyone') {
            // ONLY sender can delete for everyone
            if (message.sender_id.toString() !== userId.toString()) {
                return res.status(403).json({ message: "Unauthorized: Only the sender can delete for everyone" });
            }
            message.deletedContent = decryptedMessage || message.message; // Archive original
            message.message = "🚫 This message was deleted";
            message.isDeletedForEveryone = true;
            message.attachments = [];
            message.reactions = [];
            await message.save();
            return res.status(200).json({ message: "Message deleted for everyone", notification: message });
        } else {
            // Delete for me
            const alreadyDeleted = message.deletedBy.some(id => id.toString() === userId.toString());
            if (!alreadyDeleted) {
                message.deletedBy.push(userId);
                // Also store decrypted content even for 'delete for me' if provided
                if (decryptedMessage) {
                    message.deletedContent = decryptedMessage;
                }
                await message.save();
            }
            return res.status(200).json({ message: "Message deleted for you" });
        }
    } catch (error) {
        console.error("Error deleting message:", error);
        res.status(500).json({ message: error.message || "Internal server error" });
    }
};

module.exports = {
    sendNotification,
    getMyNotifications,
    markAsRead,
    getConversations,
    getChatHistory,
    markChatAsRead,
    addReaction,
    editMessage,
    deleteMessage
};
