const express = require('express');
const router = express.Router();
const { sendNotification, getMyNotifications, markAsRead, getConversations, getChatHistory, markChatAsRead, addReaction, editMessage, deleteMessage } = require('../controllers/notification');
const { checkAuthentication } = require('../middlewares/auth');
const upload = require('../config/cloudinaryConfig');

router.post('/send', checkAuthentication, (req, res, next) => {
    upload.array('attachments', 5)(req, res, (err) => {
        if (err) {
            console.error("Multer/Cloudinary Error:", err);
            return res.status(400).json({
                message: `Upload failed: ${err.message}. Check your Cloudinary credentials.`
            });
        }
        next();
    });
}, sendNotification);
router.get('/my-notifications', checkAuthentication, getMyNotifications);
router.get('/conversations', checkAuthentication, getConversations);
router.get('/history/:otherUserId', checkAuthentication, getChatHistory);
router.patch('/mark-read/:id', checkAuthentication, markAsRead);
router.patch('/mark-chat-read/:senderId', checkAuthentication, markChatAsRead);
router.post('/react/:messageId', checkAuthentication, addReaction);
router.patch('/edit/:messageId', checkAuthentication, editMessage);
router.delete('/delete/:messageId', checkAuthentication, deleteMessage);

module.exports = router;
