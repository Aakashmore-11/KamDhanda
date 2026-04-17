const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
    recipient_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "users",
        required: true
    },
    sender_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "users",
        required: true
    },
    project_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "freelancerProject",
        // This is optional; a client can message without linking a project technically, but good for context
    },
    message: {
        type: String,
        required: false
    },
    isRead: {
        type: Boolean,
        default: false
    },
    type: {
        type: String,
        enum: ['message', 'invite', 'system'],
        default: 'message'
    },
    attachments: [{
        url: String,
        fileType: String,
        fileName: String
    }],
    isEncrypted: {
        type: Boolean,
        default: false
    },
    encryptedKey: {
        type: String, // AES key encrypted with recipient's public key
        default: null
    },
    senderEncryptedKey: {
        type: String, // AES key encrypted with sender's public key
        default: null
    },
    iv: {
        type: String, // Initialization Vector for AES
        default: null
    },
    replyTo: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Notification',
        default: null
    },
    reactions: [{
        user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'users' },
        emoji: String
    }],
    isEdited: {
        type: Boolean,
        default: false
    },
    isDeletedForEveryone: {
        type: Boolean,
        default: false
    },
    deletedBy: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'users'
    }],
    deletedContent: {
        type: String,
        default: null
    }
}, { timestamps: true });

const Notification = mongoose.model('Notification', notificationSchema);

module.exports = Notification;
