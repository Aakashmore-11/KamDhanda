const { Router } = require('express');
const router = Router();
const {
    handleUserSignup,
    handleUserNormalLogin,
    handleLoginSendOtp,
    handleGetCurrentUser,
    handleLogoutUser,
    handleChangePassword,
    handleSendOtp,
    handleAddProjectId,
    handlGetAllAppliedForm,
    handleGoogleAuth,
    handleUpdateProfile,
    handleUpdateProfilePic,
    handleUpdateResume,
    handleUpdatePublicKey,
    handleUpdateStatus
} = require('../controllers/user');
const { checkAuthentication } = require('../middlewares/auth');
const upload = require('../config/cloudinaryConfig')

router.post('/send-otp', handleSendOtp)

router.post('/signUp', handleUserSignup)

router.post('/login-send-otp', handleLoginSendOtp)

router.post('/normalLogin', handleUserNormalLogin)

router.post('/google-auth', handleGoogleAuth)

router.get('/getCurrentUser', checkAuthentication, handleGetCurrentUser);

router.get('/logoutUser', checkAuthentication, handleLogoutUser);

router.patch('/change-password', checkAuthentication, handleChangePassword);

router.patch('/add-projectId', checkAuthentication, handleAddProjectId)

router.get('/get-allAppliedForm', checkAuthentication, handlGetAllAppliedForm)
router.patch('/update-profile', checkAuthentication, handleUpdateProfile);
router.patch('/update-profile-pic', checkAuthentication, upload.single('profilePic'), handleUpdateProfilePic);
router.patch('/update-resume', checkAuthentication, upload.single('resumePdf'), handleUpdateResume);
router.patch('/update-public-key', checkAuthentication, handleUpdatePublicKey);
router.patch('/status', checkAuthentication, handleUpdateStatus);

module.exports = router;