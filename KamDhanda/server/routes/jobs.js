const { Router } = require('express');
const router = Router();
const { createJob, getAllJobs, getEmployerJobs, getJobById, deleteJob } = require('../controllers/job_controller');
const { checkAuthentication, isClient } = require('../middlewares/auth');

router.post('/', checkAuthentication, isClient, createJob);
router.get('/', getAllJobs);
router.get('/employer', checkAuthentication, isClient, getEmployerJobs);
router.get('/:id', getJobById);
router.delete('/:id', checkAuthentication, isClient, deleteJob);

module.exports = router;
