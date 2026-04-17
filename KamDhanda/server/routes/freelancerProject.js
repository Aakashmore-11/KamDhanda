const { Router } = require('express');
const router = Router();
const Freelancer = require('../models/freelance_project_model');
const { checkAuthentication } = require('../middlewares/auth');


router.post('/create-project', checkAuthentication, async (req, res) => {
    try {
        const { title, description, budgetType, minBudget, maxBudget, category, skills } = req.body;
        const min = Number(minBudget.replace(/,/g, ''));
        const max = Number(maxBudget.replace(/,/g, ''));

        const project = await Freelancer.create({ title, description, client_id: req.user._id, budgetType, minBudget: min, maxBudget: max, category, skills });
        res.status(201).json({ message: "Project Created Successfully!", project })
    } catch (err) {
        // console.log(err)
        res.status(500).json({ message: err })
    }
})

router.get('/get-projects', checkAuthentication, async (req, res) => {
    try {
        const projects = await Freelancer.find({ client_id: req.user._id })
        res.status(201).json(projects)
    } catch (err) {
        console.log(err.message)
        res.status(500).json({ message: err })
    }
})

router.get('/get-allProjects', async (req, res) => {
    try {
        const projects = await Freelancer.find().populate('client_id')
        res.status(201).json(projects)
    } catch (err) {
        console.log(err.message)
        res.status(500).json({ message: err })
    }
})

router.patch('/add-seeker-proposal', checkAuthentication, async (req, res) => {
    try {

        const { mobile, coverLetter, bidAmount, deliveryTime, currentStatus, projectId } = req.body;
        const project = await Freelancer.findById(projectId);
        
        const existingProposal = project.proposals.find((p) => p.seeker_id.toString() == req.user._id.toString());
        
        if (!existingProposal) {
            project.proposals.push({ 
                seeker_id: req.user._id, 
                seeker_phoneno: mobile, 
                seeker_currentStatus: currentStatus, 
                coverLetter, 
                bidAmount, 
                deliveryTime 
            });
            await project.save();
            return res.status(200).json({ message: "Applied Successfully!", projectId: project._id });
        } else if (existingProposal.status === "Pending") {
            // Allow update if still pending
            existingProposal.seeker_phoneno = mobile;
            existingProposal.seeker_currentStatus = currentStatus;
            existingProposal.coverLetter = coverLetter;
            existingProposal.bidAmount = bidAmount;
            existingProposal.deliveryTime = deliveryTime;
            existingProposal.appliedAt = new Date();
            
            await project.save();
            return res.status(200).json({ message: "Proposal Updated Successfully!", projectId: project._id });
        }
        
        return res.status(200).json({ error: "Your proposal is already under review or accepted and cannot be changed." });

    } catch (err) {
        // console.log(err)
        res.status(500).json({ message: err })
    }
})



router.get('/get-allProposals', checkAuthentication, async (req, res) => {
    try {
        const { projectid } = req.headers;
        const project = await Freelancer.findOne({ _id: projectid }).populate('proposals.seeker_id');
        res.status(200).json(project)
    } catch (err) {
        console.log(err.message)
        res.status(500).json({ message: err })
    }
})


router.patch('/accept-proposal', checkAuthentication, async (req, res) => {
    try {
        const { _id, proposalId, modules } = req.body
        const project = await Freelancer.findById(_id);

        if (!project) return res.status(404).json({ message: "Project not found" });

        // 🛡️ AUTHORIZATION CHECK: Only the client who created the project can accept proposals
        if (project.client_id.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: "Unauthorized: You do not own this project." });
        }

        if (project.status === "Assigned" || project.status === "Paid") {
            return res.status(400).json({ message: "Project is already assigned or paid" });
        }

        const seeker = project.proposals.find((proposal) => proposal._id.toString() === proposalId);
        if (!seeker) {
            return res.status(404).json({ message: "Proposal not found in this project." });
        }
        seeker.status = "Accepted";
        project.status = "Assigned";
        project.assignedFreelancerId = seeker.seeker_id;
        project.assignedAt = new Date();
        project.finalAmount = seeker.bidAmount; // Set final Amount
        project.proposals.forEach((proposal) => {
            if (proposal._id.toString() !== proposalId) {
                proposal.status = "Rejected";
            }
        });

        const ProjectTracking = require('../models/project_tracking_model');
        // Handle Modules creation if provided
        if (modules && modules.length > 0) {
            let tracking = await ProjectTracking.findOne({ projectId: _id });
            if (!tracking) {
                await ProjectTracking.create({ 
                    projectId: _id, 
                    modules: modules,
                    progress: 0 
                });
            } else {
                tracking.modules = modules;
                await tracking.save();
            }
        }

        await project.save();
        res.status(200).json(project)
    } catch (err) {
        console.log(err.message)
        res.status(500).json({ message: err })
    }
})

router.patch('/reject-proposal', checkAuthentication, async (req, res) => {
    try {
        const { _id, proposalId } = req.body
        const project = await Freelancer.findById(_id);

        if (!project) return res.status(404).json({ message: "Project not found" });

        // 🛡️ AUTHORIZATION CHECK: Only the client who created the project can reject proposals
        if (project.client_id.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: "Unauthorized: You do not own this project." });
        }

        const seeker = project.proposals.find((proposal) => proposal._id.toString() === proposalId);
        if (!seeker) {
            return res.status(404).json({ message: "Proposal not found in this project." });
        }
        seeker.status = "Rejected";
        await project.save();
        res.status(200).json(project)
    } catch (err) {
        console.log(err.message)
        res.status(500).json({ message: err })
    }
})

router.delete('/close-project', checkAuthentication, async (req, res) => {
    try {
        const { projectid } = req.headers;
        const project = await Freelancer.findById(projectid);
        
        if (!project) return res.status(404).json({ message: "Project not found" });

        // 🛡️ AUTHORIZATION CHECK: Only the client who created the project can delete it
        if (project.client_id.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: "Unauthorized: You do not own this project." });
        }

        await Freelancer.findByIdAndDelete(projectid);
        res.status(200).json({ message: "Project Successfully Closed!" })
    } catch (err) {
        console.log(err.message)
        res.status(500).json({ message: err })
    }
})

router.get('/recommendations', checkAuthentication, async (req, res) => {
    try {
        const { getRecommendedJobsForSeeker } = require('../controllers/freelancerProject');
        await getRecommendedJobsForSeeker(req, res);
    } catch (err) {
        console.log("Error in /recommendations:", err);
        res.status(500).json({ message: err.message || err });
    }
})

router.get('/:id', checkAuthentication, async (req, res) => {
    try {
        const id = req.params.id;
        const project = await Freelancer.findById(id).populate('client_id');
        res.status(200).json(project)
    } catch (err) {
        console.log(err.message)
        res.status(500).json({ message: err })
    }
});

router.get('/:id/recommended-freelancers', checkAuthentication, async (req, res) => {
    try {
        const { getRecommendedFreelancersForProject } = require('../controllers/freelancerProject');
        await getRecommendedFreelancersForProject(req, res);
    } catch (err) {
        console.log("Error in /recommended-freelancers:", err);
        res.status(500).json({ message: err.message || err });
    }
});

const ProjectTracking = require('../models/project_tracking_model');

router.post('/pay', checkAuthentication, async (req, res) => {
    try {
        const { projectId } = req.body;
        const project = await Freelancer.findById(projectId);
        if (!project) return res.status(404).json({ message: "Project not found" });

        // Check if user is the client
        if (project.client_id.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: "Unauthorized: Only the client can pay" });
        }

        // Check progress
        const tracking = await ProjectTracking.findOne({ projectId });
        if (!tracking || tracking.progress < 100) {
            return res.status(400).json({ message: "Payment allowed only when progress is 100%" });
        }

        // CRITICAL RULE: FIXED PAYMENT AMOUNT
        // Ignore any 'amount' sent from frontend. Use finalAmount from DB.
        const amountToPay = project.finalAmount;

        // Simulate payment success
        project.isPaid = true;
        project.status = "Paid";
        
        await project.save();

        res.status(200).json({ success: true, message: `Payment of ${amountToPay} successful`, project });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

router.post('/pay-module', checkAuthentication, async (req, res) => {
    try {
        const { projectId, moduleId } = req.body;
        const project = await Freelancer.findById(projectId);
        if (!project) return res.status(404).json({ message: "Project not found" });

        // Check if user is the client
        if (project.client_id.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: "Unauthorized: Only the client can pay" });
        }

        const tracking = await ProjectTracking.findOne({ projectId });
        if (!tracking) return res.status(404).json({ message: "Tracking not found" });

        const module = tracking.modules.id(moduleId);
        if (!module || module.status !== 'Approved') {
            return res.status(400).json({ message: "Module not ready for payment" });
        }

        // Processing payment simulator for module
        const amountToPay = module.amount;
        module.paymentStatus = "Paid";
        module.paymentDetails = {
            orderId: "MOD_" + Date.now(),
            paymentId: "PAY_" + Date.now(),
            paidAt: new Date()
        };

        // Check if all modules are paid
        const allPaid = tracking.modules.every(m => m.paymentStatus === 'Paid');
        if (allPaid) {
            project.isPaid = true;
            project.status = "Paid";
            await project.save();
        }

        await tracking.save();

        res.status(200).json({ success: true, message: `Payment of ${amountToPay} for module successful`, tracking });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
