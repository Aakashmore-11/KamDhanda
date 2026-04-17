const { Router } = require('express');
const router = Router();
const {
    scheduleInterview,
    getMyInterviews,
    getInterviewById,
    getInterviewByRoom,
    updateInterviewStatus,
    rescheduleInterview,
    cancelInterview,
    submitEvaluation
} = require('../controllers/interview_controller');
const { checkAuthentication, isClient } = require('../middlewares/auth');

router.post('/schedule', checkAuthentication, isClient, scheduleInterview);
router.get('/my-interviews', checkAuthentication, getMyInterviews);
router.get('/room/:roomId', checkAuthentication, getInterviewByRoom);
router.get('/:id', checkAuthentication, getInterviewById);
router.put('/update-status/:id', checkAuthentication, updateInterviewStatus);
router.put('/reschedule/:id', checkAuthentication, isClient, rescheduleInterview);
router.put('/cancel/:id', checkAuthentication, cancelInterview);
router.post('/evaluate/:id', checkAuthentication, isClient, submitEvaluation);

module.exports = router;
