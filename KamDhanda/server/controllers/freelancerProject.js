const Freelancer = require('../models/freelance_project_model');
const User = require('../models/users_model');
const { calculateMatchScore } = require('../libs/matchingAlgorithm');

const getRecommendedJobsForSeeker = async (req, res) => {
    try {
        const seekerId = req.user._id;
        const seeker = await User.findById(seekerId);

        if (!seeker) {
            return res.status(404).json({ message: "Seeker not found" });
        }

        // Fetch all open projects
        const openProjects = await Freelancer.find({ status: "Open" }).populate('client_id');

        // Calculate scores and attach to projects
        const projectsWithScores = openProjects.map(project => {
            const score = calculateMatchScore(seeker, project);
            return {
                ...project.toObject(),
                matchScore: score
            };
        });

        // Filter projects with a score >= 40 and sort descending
        const recommendedProjects = projectsWithScores
            .filter(p => p.matchScore >= 40)
            .sort((a, b) => b.matchScore - a.matchScore)
            .slice(0, 10); // Top 10 recommendations

        res.status(200).json(recommendedProjects);
    } catch (err) {
        console.error("Error getting recommended jobs:", err);
        res.status(500).json({ message: err.message });
    }
};

const getRecommendedFreelancersForProject = async (req, res) => {
    try {
        const projectId = req.params.id;
        const project = await Freelancer.findById(projectId);

        if (!project) {
            return res.status(404).json({ message: "Project not found" });
        }

        // Ensure only the client who created the project can see recommendations
        if (project.client_id.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: "Unauthorized to view recommendations for this project" });
        }

        // Fetch all users with the role 'Seeker'
        const seekers = await User.find({ role: "Seeker" });

        // Calculate scores and attach to seekers
        const seekersWithScores = seekers.map(seeker => {
            const score = calculateMatchScore(seeker, project);
            // Don't send passwords back
            const { password, ...seekerData } = seeker.toObject();
            return {
                ...seekerData,
                matchScore: score
            };
        });

        // Filter seekers with a score >= 40 and sort descending
        const recommendedSeekers = seekersWithScores
            .filter(s => s.matchScore >= 40)
            .sort((a, b) => b.matchScore - a.matchScore)
            .slice(0, 10); // Top 10 recommendations

        res.status(200).json(recommendedSeekers);
    } catch (err) {
        console.error("Error getting recommended freelancers:", err);
        res.status(500).json({ message: err.message });
    }
};

module.exports = {
    getRecommendedJobsForSeeker,
    getRecommendedFreelancersForProject
};
