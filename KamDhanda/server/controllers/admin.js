const User = require('../models/users_model');
const FreelancerProject = require('../models/freelance_project_model');
const Skill = require('../models/skills_model');
const Job = require('../models/jobs_model');
const Application = require('../models/applications_model');

// ==========================================
// Dashboard Stats
// ==========================================
exports.getDashboardStats = async (req, res) => {
    try {
        const totalUsers = await User.countDocuments();
        const totalClients = await User.countDocuments({ role: { $regex: /^Client$/i } });
        const totalSeekers = await User.countDocuments({ role: { $regex: /^Seeker$/i } });

        const totalProjects = await FreelancerProject.countDocuments();
        const activeProjects = await FreelancerProject.countDocuments({ status: "Open" });

        const totalJobs = await Job.countDocuments();
        const activeJobs = await Job.countDocuments({ status: "Open" });
        const totalJobApplications = await Application.countDocuments();

        // Calculate total proposals across all projects
        const projects = await FreelancerProject.find({}, 'proposals');
        const totalProposals = projects.reduce((acc, project) => acc + project.proposals.length, 0);

        const { range = 'week' } = req.query;
        
        // Calculate chart data dynamically based on range
        const chartData = [];
        const now = new Date();
        
        let steps = 7;
        let msPerStep = 24 * 60 * 60 * 1000; // 1 day
        let formatLabel = (d) => ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][d.getDay()];

        if (range === 'day') {
            steps = 6;
            msPerStep = 4 * 60 * 60 * 1000; // 4 hours
            formatLabel = (d) => {
                let h = d.getHours();
                return `${h}:00`;
            };
        } else if (range === 'month') {
            steps = 6;
            msPerStep = 5 * 24 * 60 * 60 * 1000; // 5 days
            formatLabel = (d) => `${d.getDate()}/${d.getMonth()+1}`;
        } else if (range === 'overall') {
            steps = 6;
            msPerStep = 60 * 24 * 60 * 60 * 1000; // ~2 months
            formatLabel = (d) => ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][d.getMonth()];
        }

        const rangeStartDate = new Date(now.getTime() - (steps * msPerStep));

        const rangeUsers = await User.countDocuments({ createdAt: { $gte: rangeStartDate } });
        const rangeProjects = await FreelancerProject.countDocuments({ createdAt: { $gte: rangeStartDate } });
        const rangeJobs = await Job.countDocuments({ createdAt: { $gte: rangeStartDate } });

        for (let i = steps - 1; i >= 0; i--) {
            const startDate = new Date(now.getTime() - ((i + 1) * msPerStep));
            const endDate = new Date(now.getTime() - (i * msPerStep));
            
            const usersOnDay = await User.countDocuments({
                createdAt: { $gte: startDate, $lt: endDate }
            });

            const projectsOnDay = await FreelancerProject.countDocuments({
                createdAt: { $gte: startDate, $lt: endDate }
            });

            const jobsOnDay = await Job.countDocuments({
                createdAt: { $gte: startDate, $lt: endDate }
            });

            chartData.push({
                name: formatLabel(startDate),
                users: usersOnDay,
                projects: projectsOnDay + jobsOnDay
            });
        }

        res.status(200).json({
            success: true,
            stats: {
                totalUsers,
                totalClients,
                totalSeekers,
                totalProjects,
                activeProjects,
                totalProposals,
                totalJobs,
                activeJobs,
                totalJobApplications,
                chartData,
                rangeStats: {
                    newUsers: rangeUsers,
                    newProjects: rangeProjects + rangeJobs
                }
            }
        });
    } catch (error) {
        console.error("Error fetching dashboard stats:", error);
        res.status(500).json({ message: "Failed to fetch dashboard statistics", error: error.message });
    }
};

// ==========================================
// User Management
// ==========================================
exports.getAllUsers = async (req, res) => {
    try {
        const users = await User.find().select('-password').sort({ createdAt: -1 });
        res.status(200).json({ success: true, users });
    } catch (error) {
        res.status(500).json({ message: "Failed to fetch users", error: error.message });
    }
};

exports.toggleBlockUser = async (req, res) => {
    try {
        const { userId } = req.params;
        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        if (user.role?.toLowerCase() === 'admin') {
            return res.status(403).json({ message: "Cannot block another Admin" });
        }

        user.isBlocked = !user.isBlocked;
        await user.save();

        res.status(200).json({
            success: true,
            message: `User ${user.isBlocked ? 'blocked' : 'unblocked'} successfully`,
            user
        });
    } catch (error) {
        res.status(500).json({ message: "Failed to update user status", error: error.message });
    }
};

exports.deleteUser = async (req, res) => {
    try {
        const { userId } = req.params;
        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        if (user.role?.toLowerCase() === 'admin') {
            return res.status(403).json({ message: "Cannot delete another Admin" });
        }

        // Optional: Also delete user's projects or proposals to keep DB clean
        // await FreelancerProject.deleteMany({ client_id: userId });

        await User.findByIdAndDelete(userId);
        res.status(200).json({ success: true, message: "User deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: "Failed to delete user", error: error.message });
    }
};

// ==========================================
// Project Management
// ==========================================
exports.getAllProjects = async (req, res) => {
    try {
        const projects = await FreelancerProject.find()
            .populate('client_id', 'fullName email isBlocked')
            .sort({ createdAt: -1 });
        res.status(200).json({ success: true, projects });
    } catch (error) {
        res.status(500).json({ message: "Failed to fetch projects", error: error.message });
    }
};

exports.deleteProject = async (req, res) => {
    try {
        const { projectId } = req.params;
        const project = await FreelancerProject.findByIdAndDelete(projectId);

        if (!project) {
            return res.status(404).json({ message: "Project not found" });
        }

        res.status(200).json({ success: true, message: "Project deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: "Failed to delete project", error: error.message });
    }
};

// ==========================================
// Skill Management
// ==========================================
exports.getAllSkills = async (req, res) => {
    try {
        const skills = await Skill.find().sort({ name: 1 });
        res.status(200).json({ success: true, skills });
    } catch (error) {
        res.status(500).json({ message: "Failed to fetch skills", error: error.message });
    }
};

exports.addSkill = async (req, res) => {
    try {
        const { name, category } = req.body;

        if (!name) {
            return res.status(400).json({ message: "Skill name is required" });
        }

        const existingSkill = await Skill.findOne({ name: { $regex: new RegExp(`^${name}$`, 'i') } });
        if (existingSkill) {
            return res.status(400).json({ message: "Skill already exists" });
        }

        const newSkill = await Skill.create({ name, category: category || 'General' });
        res.status(201).json({ success: true, message: "Skill added successfully", skill: newSkill });
    } catch (error) {
        res.status(500).json({ message: "Failed to add skill", error: error.message });
    }
};

exports.deleteSkill = async (req, res) => {
    try {
        const { skillId } = req.params;
        const skill = await Skill.findByIdAndDelete(skillId);

        if (!skill) {
            return res.status(404).json({ message: "Skill not found" });
        }

        res.status(200).json({ success: true, message: "Skill deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: "Failed to delete skill", error: error.message });
    }
};
// ==========================================
// Job Management
// ==========================================
exports.getAllJobs = async (req, res) => {
    try {
        const jobs = await Job.find()
            .populate('employerId', 'fullName email isBlocked')
            .sort({ createdAt: -1 });
        res.status(200).json({ success: true, jobs });
    } catch (error) {
        res.status(500).json({ message: "Failed to fetch jobs", error: error.message });
    }
};

exports.deleteJob = async (req, res) => {
    try {
        const { jobId } = req.params;

        // Deleting a job should also handle associated applications
        await Application.deleteMany({ jobId });

        const job = await Job.findByIdAndDelete(jobId);

        if (!job) {
            return res.status(404).json({ message: "Job not found" });
        }

        res.status(200).json({ success: true, message: "Job and its applications deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: "Failed to delete job", error: error.message });
    }
};

// ==========================================
// User Activity Tracking
// ==========================================
exports.getUserActivities = async (req, res) => {
    try {
        const { userId } = req.params;
        const user = await User.findById(userId).select('fullName email role');

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        let activities = {
            projects: [],
            jobs: [],
            applications: [],
            proposals: []
        };

        const role = user.role?.toLowerCase();

        if (role === 'seeker') {
            // Find job applications
            activities.applications = await Application.find({ seekerId: userId })
                .populate('jobId', 'title companyName status')
                .sort({ createdAt: -1 });

            // Find project proposals where the user is part of the proposals array
            activities.proposals = await FreelancerProject.find(
                { "proposals.seeker_id": userId },
                { "title": 1, "proposals.$": 1, "status": 1, "createdAt": 1 }
            ).sort({ createdAt: -1 });

        } else if (role === 'client' || role === 'employer') {
            // Find projects posted by client
            activities.projects = await FreelancerProject.find({ client_id: userId })
                .sort({ createdAt: -1 });

            // Find jobs posted by employer/client
            activities.jobs = await Job.find({ employerId: userId })
                .sort({ createdAt: -1 });
        }

        res.status(200).json({
            success: true,
            user,
            activities
        });
    } catch (error) {
        console.error("Error fetching user activities:", error);
        res.status(500).json({ message: "Failed to fetch user activities", error: error.message });
    }
};
