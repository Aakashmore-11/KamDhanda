const { Router } = require('express');
const router = Router();
const { handleChat } = require('../controllers/aiController');
const { checkOptionalAuthentication } = require('../middlewares/auth');

// We apply optional authentication check so it works on the Landing page (Guest)
// while still picking up role context (Client/Seeker) if logged in.
router.post('/chat', checkOptionalAuthentication, handleChat);

module.exports = router;
