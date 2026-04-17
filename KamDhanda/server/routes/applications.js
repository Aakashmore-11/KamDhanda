const { Router } = require('express');
const router = Router();
const { applyForJob, getSeekerApplications, getJobApplications, updateApplicationStatus } = require('../controllers/application_controller');
const { checkAuthentication } = require('../middlewares/auth');
const upload = require('../config/cloudinaryConfig');

router.post('/:jobId/apply', checkAuthentication, upload.single('resumePdf'), applyForJob);
router.get('/seeker', checkAuthentication, getSeekerApplications);
router.get('/job/:jobId', checkAuthentication, getJobApplications);
router.patch('/:id/status', checkAuthentication, updateApplicationStatus);

module.exports = router;
