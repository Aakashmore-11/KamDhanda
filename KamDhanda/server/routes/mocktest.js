// server/routes/mocktest.js
const { Router } = require('express');
const router = Router();
const {
    handleCreateTest,
    handleAddQuestions,
    handleGetTestsByJob,
    handleGetTestDetails,
    handleSubmitTest,
    handleGetResult,
    handleGetAnalytics
} = require('../controllers/mock_test_controller');
const { checkAuthentication, isClient, isSeeker } = require('../middlewares/auth');

// Create test - Only for Clients
router.post('/create-test', checkAuthentication, isClient, handleCreateTest);

// Add questions - Only for Clients
router.post('/add-questions', checkAuthentication, isClient, handleAddQuestions);

// Get tests by jobId - Guest/Seeker/Client
router.get('/get-tests/:jobId', handleGetTestsByJob);

// Get test details & questions - Authenticated (Seeker to attempt, Client to preview)
router.get('/test-details/:testId', checkAuthentication, handleGetTestDetails);

// Submit test - Only for Seekers
router.post('/submit-test', checkAuthentication, isSeeker, handleSubmitTest);

// Get results/analytics - For Client viewing candidates or Seeker viewing their own result
router.get('/result/:testId', checkAuthentication, handleGetResult);

// Detailed Analytics - Only for Clients
router.get('/analytics/:testId', checkAuthentication, isClient, handleGetAnalytics);

module.exports = router;
