const Job = require('../models/jobs_model');

const createJob = async (req, res) => {
    try {
        const { title, description, location, minSalary, maxSalary, jobType, requiredSkills } = req.body;
        const employerId = req.user._id;

        const newJob = await Job.create({
            employerId,
            title,
            description,
            location,
            salaryRange: { min: minSalary, max: maxSalary },
            jobType,
            requiredSkills
        });

        res.status(201).json({ success: true, message: 'Job created successfully', job: newJob });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error creating job', error: error.message });
    }
};

const getAllJobs = async (req, res) => {
    try {
        const jobs = await Job.find({ status: 'Open' }).populate('employerId', 'fullName email profilePic').sort({ createdAt: -1 });
        res.status(200).json({ success: true, jobs });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error fetching jobs', error: error.message });
    }
};

const getEmployerJobs = async (req, res) => {
    try {
        const employerId = req.user._id;
        const jobs = await Job.find({ employerId }).sort({ createdAt: -1 });
        res.status(200).json({ success: true, jobs });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error fetching employer jobs', error: error.message });
    }
};

const getJobById = async (req, res) => {
    try {
        const job = await Job.findById(req.params.id).populate('employerId', 'fullName email profilePic');
        if (!job) {
            return res.status(404).json({ success: false, message: 'Job not found' });
        }
        res.status(200).json({ success: true, job });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error fetching job', error: error.message });
    }
};

const deleteJob = async (req, res) => {
    try {
        const { id } = req.params;
        const employerId = req.user._id;

        const job = await Job.findById(id);
        if (!job) {
            return res.status(404).json({ success: false, message: 'Job not found' });
        }

        if (job.employerId.toString() !== employerId.toString()) {
            return res.status(403).json({ success: false, message: 'Unauthorized: You can only delete your own jobs' });
        }

        await Job.findByIdAndDelete(id);
        res.status(200).json({ success: true, message: 'Job deleted successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error deleting job', error: error.message });
    }
};

module.exports = {
    createJob,
    getAllJobs,
    getEmployerJobs,
    getJobById,
    deleteJob
};
