const express = require('express');
const router = express.Router();
const { checkAuthentication, isAdmin } = require('../middlewares/auth');
const adminController = require('../controllers/admin');

// All routes here are protected by both checkAuthentication and isAdmin middlewares
router.use(checkAuthentication, isAdmin);

// ==========================================
// Dashboard Stats
// ==========================================
router.get('/stats', adminController.getDashboardStats);

// ==========================================
// User Management
// ==========================================
router.get('/users', adminController.getAllUsers);
router.get('/users/:userId/activities', adminController.getUserActivities);
router.patch('/users/:userId/toggle-block', adminController.toggleBlockUser);
router.delete('/users/:userId', adminController.deleteUser);

// ==========================================
// Project Management
// ==========================================
router.get('/projects', adminController.getAllProjects);
router.delete('/projects/:projectId', adminController.deleteProject);

// ==========================================
// Skill Management
// ==========================================
router.get('/skills', adminController.getAllSkills);
router.post('/skills', adminController.addSkill);
router.delete('/skills/:skillId', adminController.deleteSkill);

// ==========================================
// Job Management
// ==========================================
router.get('/jobs', adminController.getAllJobs);
router.delete('/jobs/:jobId', adminController.deleteJob);

module.exports = router;
