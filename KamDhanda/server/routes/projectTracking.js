const { Router } = require('express');
const router = Router();
const ProjectTracking = require('../models/project_tracking_model');
const Freelancer = require('../models/freelance_project_model');
const { checkAuthentication } = require('../middlewares/auth');
const upload = require('../config/cloudinaryConfig');

// Helper to check if user has access to project tracking
const verifyProjectAccess = async (projectId, userId) => {
    const project = await Freelancer.findById(projectId);
    if (!project) return { error: "Project not found", status: 404 };
    
    const isClient = project.client_id.toString() === userId.toString();
    const isFreelancer = project.assignedFreelancerId && project.assignedFreelancerId.toString() === userId.toString();
    
    if (!isClient && !isFreelancer) {
        return { error: "Unauthorized: You are not a participant in this project.", status: 403 };
    }
    
    return { project, isClient, isFreelancer };
};

// Get tracking details for a project
router.get('/:projectId', checkAuthentication, async (req, res) => {
    try {
        const { error, status, project } = await verifyProjectAccess(req.params.projectId, req.user._id);
        if (error) return res.status(status).json({ message: error });

        let tracking = await ProjectTracking.findOne({ projectId: req.params.projectId })
            .populate('files.uploadedBy', 'name email profileImage');

        if (!tracking) {
            // Create initial tracking if it doesn't exist
            tracking = await ProjectTracking.create({ projectId: req.params.projectId });
        }

        // Calculate remaining days
        let remainingDays = null;

        if (project && project.status === "Assigned") {
            const assignmentDate = project.assignedAt || project.updatedAt;
            const acceptedProposal = project.proposals.find(p => p.seeker_id.toString() === project.assignedFreelancerId.toString() && p.status === "Accepted");

            if (acceptedProposal && acceptedProposal.deliveryTime && assignmentDate) {
                const totalDaysMatch = acceptedProposal.deliveryTime.match(/\d+/);
                const totalDays = totalDaysMatch ? parseInt(totalDaysMatch[0]) : NaN;

                if (!isNaN(totalDays)) {
                    const assignedDate = new Date(assignmentDate);
                    const currentDate = new Date();
                    const diffTime = Math.abs(currentDate.getTime() - assignedDate.getTime());
                    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
                    remainingDays = Math.max(0, totalDays - diffDays);
                }
            }
        }

        const trackingData = tracking.toObject();
        trackingData.remainingDays = remainingDays;

        res.status(200).json(trackingData);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Add a task
router.post('/:projectId/tasks', checkAuthentication, async (req, res) => {
    try {
        const { error, status, project, isClient } = await verifyProjectAccess(req.params.projectId, req.user._id);
        if (error) return res.status(status).json({ message: error });

        // 🛡️ Only Client should ideally add tasks
        if (!isClient) return res.status(403).json({ message: "Only the client can add tasks." });

        if (project && project.status === "Paid") {
            return res.status(403).json({ message: "Project is paid and locked. Modifications are not allowed." });
        }

        const tracking = await ProjectTracking.findOne({ projectId: req.params.projectId });
        if (!tracking) return res.status(404).json({ message: "Tracking not found" });

        const { description, deadline } = req.body;
        tracking.tasks.push({ description, deadline });
        await tracking.save();
        res.status(201).json(tracking);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Update task status
router.patch('/:projectId/tasks/:taskId', checkAuthentication, async (req, res) => {
    try {
        const { error, status, project } = await verifyProjectAccess(req.params.projectId, req.user._id);
        if (error) return res.status(status).json({ message: error });

        if (project && project.status === "Paid") {
            return res.status(403).json({ message: "Project is paid and locked. Status cannot be changed." });
        }

        const tracking = await ProjectTracking.findOne({ projectId: req.params.projectId });
        if (!tracking) return res.status(404).json({ message: "Tracking not found" });

        const task = tracking.tasks.id(req.params.taskId);
        if (!task) return res.status(404).json({ message: "Task not found" });

        const { status: taskStatus } = req.body;
        task.status = taskStatus;

        const completedTasks = tracking.tasks.filter(t => t.status === "Completed").length;
        tracking.progress = tracking.tasks.length > 0 ? Math.round((completedTasks / tracking.tasks.length) * 100) : 0;

        await tracking.save();
        res.status(200).json(tracking);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Update module progress and status
router.patch('/:projectId/modules/:moduleId', checkAuthentication, async (req, res) => {
    try {
        const { error, status, project, isClient, isFreelancer } = await verifyProjectAccess(req.params.projectId, req.user._id);
        if (error) return res.status(status).json({ message: error });

        const { progress, action } = req.body;

        // 🛡️ Role-based actions
        if (action === 'approve' && !isClient) return res.status(403).json({ message: "Only clients can approve modules." });
        if (action === 'submit' && !isFreelancer) return res.status(403).json({ message: "Only freelancers can submit modules." });

        const tracking = await ProjectTracking.findOne({ projectId: req.params.projectId });
        if (!tracking) return res.status(404).json({ message: "Tracking not found" });

        const module = tracking.modules.id(req.params.moduleId);
        if (!module) return res.status(404).json({ message: "Module not found" });

        if (progress !== undefined) {
            module.progress = progress;
            if (progress === 100 && module.status === "Pending") {
                module.status = "In Progress";
            }
        }

        if (action === 'submit') {
            module.status = "Waiting for Client Approval";
            module.progress = 100;
        } else if (action === 'approve') {
            module.status = "Approved";
            module.paymentStatus = "Ready to Pay";
        } else if (action === 'reject') {
            module.status = "In Progress";
            module.progress = 90;
        }

        if (tracking.modules.length > 0) {
            const totalModProgress = tracking.modules.reduce((sum, m) => sum + m.progress, 0);
            tracking.progress = Math.round(totalModProgress / tracking.modules.length);
        }

        await tracking.save();
        res.status(200).json(tracking);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Submit a file
router.post('/:projectId/files', checkAuthentication, upload.single('deliverable'), async (req, res) => {
    try {
        const { error, status, project } = await verifyProjectAccess(req.params.projectId, req.user._id);
        if (error) return res.status(status).json({ message: error });

        if (project && project.status === "Paid") {
            return res.status(403).json({ message: "Project is paid and locked. Asset changes are not allowed." });
        }

        const { name } = req.body;
        const file = req.file;

        if (!file && !req.body.url) {
            return res.status(400).json({ message: "No file or URL provided" });
        }

        const url = file ? file.path : req.body.url;
        const tracking = await ProjectTracking.findOne({ projectId: req.params.projectId });
        if (!tracking) return res.status(404).json({ message: "Tracking not found" });

        tracking.files.push({ name, url, uploadedBy: req.user._id });
        await tracking.save();
        res.status(201).json(tracking);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Update metadata
router.patch('/:projectId/metadata', checkAuthentication, async (req, res) => {
    try {
        const { error, status, isClient } = await verifyProjectAccess(req.params.projectId, req.user._id);
        if (error) return res.status(status).json({ message: error });

        if (!isClient) return res.status(403).json({ message: "Only clients can update project metadata." });

        const { overallDeadline, progress } = req.body;
        const tracking = await ProjectTracking.findOne({ projectId: req.params.projectId });
        if (!tracking) return res.status(404).json({ message: "Tracking not found" });

        if (overallDeadline) tracking.overallDeadline = overallDeadline;
        if (progress !== undefined) tracking.progress = progress;

        await tracking.save();
        res.status(200).json(tracking);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
