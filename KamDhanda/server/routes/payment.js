const { Router } = require('express');
const router = Router();
const Razorpay = require('razorpay');
const crypto = require('crypto');
const Freelancer = require('../models/freelance_project_model');
const ProjectTracking = require('../models/project_tracking_model');
const Transaction = require('../models/transaction_model');
const { checkAuthentication } = require('../middlewares/auth');
const Notification = require('../models/notification_model');

// Razorpay instance initialization
const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY,
    key_secret: process.env.RAZORPAY_SECRET,
});

// 💳 Create Payment Order API
router.post('/create-order', checkAuthentication, async (req, res) => {
    try {
        const { projectId } = req.body;
        const project = await Freelancer.findById(projectId);

        if (!project) return res.status(404).json({ message: "Project not found" });

        // Validate Progress and Client Authorization
        if (project.client_id.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: "Unauthorized: Only the client can initiate payment" });
        }

        const tracking = await ProjectTracking.findOne({ projectId });
        if (!tracking || tracking.progress < 100) {
            return res.status(400).json({ message: "Payment allowed only when progress is 100%" });
        }

        if (project.paymentStatus === "paid") {
            return res.status(400).json({ message: "Project is already paid" });
        }

        const amount = project.finalAmount * 100; // Razorpay expects amount in paise
        const options = {
            amount,
            currency: "INR",
            receipt: `receipt_${projectId}`,
            payment_capture: 1
        };

        const order = await razorpay.orders.create(options);

        // Save orderId in project temporarily
        project.paymentDetails = { 
            ...project.paymentDetails,
            orderId: order.id,
            amount: project.finalAmount
        };
        await project.save();

        res.status(200).json({ order, key_id: razorpay.key_id });

    } catch (err) {
        console.error("Razorpay Order Creation Error:", err);
        res.status(500).json({ message: err.message });
    }
});

// 💳 Verify Payment API
router.post('/verify', checkAuthentication, async (req, res) => {
    try {
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature, projectId } = req.body;

        const body = razorpay_order_id + "|" + razorpay_payment_id;
        const expectedSignature = crypto
            .createHmac("sha256", razorpay.key_secret)
            .update(body.toString())
            .digest("hex");

        const isSignatureValid = expectedSignature === razorpay_signature;

        if (isSignatureValid) {
            const project = await Freelancer.findById(projectId);
            if (!project) return res.status(404).json({ message: "Project not found" });

            // 🛡️ SECURITY FIX: Verify that the razorpay_order_id matches the one generated for this project
            if (project.paymentDetails?.orderId !== razorpay_order_id) {
                return res.status(400).json({ message: "Invalid payment mapping: Order ID mismatch." });
            }

            // Update project details
            project.isPaid = true;
            project.paymentStatus = "paid";
            project.status = "Paid";
            project.paymentDetails = {
                orderId: razorpay_order_id,
                paymentId: razorpay_payment_id,
                signature: razorpay_signature,
                amount: project.finalAmount,
                paidAt: new Date()
            };

            await project.save();

            // Log Transaction
            await Transaction.create({
                project_id: project._id,
                client_id: project.client_id,
                freelancer_id: project.assignedFreelancerId,
                title: `${project.title} (Full Settlement)`,
                category: project.category || "Project",
                finalAmount: project.finalAmount,
                paymentDetails: project.paymentDetails
            });

            // Notify Seeker
            await Notification.create({
                sender_id: project.client_id,
                recipient_id: project.assignedFreelancerId,
                message: `Payment Successful! You got paid ₹${project.finalAmount} for "${project.title}".`,
                project_id: project._id,
                type: 'system'
            });

            // Notify Client
            await Notification.create({
                sender_id: project.client_id, 
                recipient_id: project.client_id,
                message: `Payment successful for project "${project.title}". Amount: ₹${project.finalAmount}.`,
                project_id: project._id,
                type: 'system'
            });

            res.status(200).json({ success: true, message: "Payment Verified Successfully!", project });
        } else {
            res.status(400).json({ success: false, message: "Invalid Signature" });
        }

    } catch (err) {
        console.error("Verification Error:", err);
        res.status(500).json({ message: err.message });
    }
});

// 💳 Create Module Payment Order API
router.post('/create-module-order', checkAuthentication, async (req, res) => {
    try {
        const { projectId, moduleId } = req.body;
        const project = await Freelancer.findById(projectId);
        if (!project) return res.status(404).json({ message: "Project not found" });

        // Validate Client Authorization
        if (project.client_id.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: "Unauthorized: Only the client can initiate payment" });
        }

        const tracking = await ProjectTracking.findOne({ projectId });
        if (!tracking) return res.status(404).json({ message: "Tracking not found" });

        const module = tracking.modules.id(moduleId);
        if (!module || module.status !== 'Approved') {
            return res.status(400).json({ message: "Module not ready for payment" });
        }

        const amount = module.amount * 100; // Razorpay expects amount in paise
        const options = {
            amount,
            currency: "INR",
            receipt: `receipt_mod_${moduleId}`,
            payment_capture: 1
        };

        const order = await razorpay.orders.create(options);
        
        // Save orderId in module temporarily
        module.paymentDetails = { 
            orderId: order.id,
            amount: module.amount
        };
        await tracking.save();

        res.status(200).json({ order, key_id: razorpay.key_id });

    } catch (err) {
        console.error("Razorpay Module Order Creation Error:", err);
        res.status(500).json({ message: err.message });
    }
});

// 💳 Verify Module Payment API
router.post('/verify-module', checkAuthentication, async (req, res) => {
    try {
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature, projectId, moduleId } = req.body;

        const body = razorpay_order_id + "|" + razorpay_payment_id;
        const expectedSignature = crypto
            .createHmac("sha256", razorpay.key_secret)
            .update(body.toString())
            .digest("hex");

        const isSignatureValid = expectedSignature === razorpay_signature;

        if (isSignatureValid) {
            const project = await Freelancer.findById(projectId);
            const tracking = await ProjectTracking.findOne({ projectId });
            
            if (!project || !tracking) return res.status(404).json({ message: "Project or tracking not found" });

            const module = tracking.modules.id(moduleId);
            if (!module) return res.status(404).json({ message: "Module not found" });

            // 🛡️ SECURITY FIX: Verify module-level order mapping
            if (module.paymentDetails?.orderId !== razorpay_order_id) {
                return res.status(400).json({ message: "Invalid payment mapping: Milestone Order ID mismatch." });
            }

            // Update module details
            module.paymentStatus = "Paid";
            module.paymentDetails = {
                orderId: razorpay_order_id,
                paymentId: razorpay_payment_id,
                signature: razorpay_signature,
                amount: module.amount,
                paidAt: new Date()
            };

            // Check if all modules are paid
            const allPaid = tracking.modules.every(m => m.paymentStatus === 'Paid');
            if (allPaid) {
                project.isPaid = true;
                project.status = "Paid";
                project.paymentStatus = "paid";
                // Optionally sum up the amounts or leave as it is
                project.paymentDetails = {
                    ...module.paymentDetails, // store last module's detail or an aggregated version
                    amount: project.finalAmount
                };
            }

            await project.save();
            await tracking.save();

            // Log Transaction
            await Transaction.create({
                project_id: project._id,
                client_id: project.client_id,
                freelancer_id: project.assignedFreelancerId,
                title: `${project.title} - ${module.title}`,
                category: "Milestone",
                finalAmount: module.amount,
                paymentDetails: module.paymentDetails
            });

            // Notify Seeker
            await Notification.create({
                sender_id: project.client_id,
                recipient_id: project.assignedFreelancerId,
                message: `Milestone Payment Successful! You got paid ₹${module.amount} for milestone "${module.title}".`,
                project_id: project._id,
                type: 'system'
            });

            // Notify Client
            await Notification.create({
                sender_id: project.client_id, 
                recipient_id: project.client_id,
                message: `Milestone payment successful. Amount: ₹${module.amount} for "${module.title}".`,
                project_id: project._id,
                type: 'system'
            });

            res.status(200).json({ success: true, message: "Module Payment Verified Successfully!", project, tracking });
        } else {
            res.status(400).json({ success: false, message: "Invalid Signature" });
        }

    } catch (err) {
        console.error("Module Verification Error:", err);
        res.status(500).json({ message: err.message });
    }
});

// 📋 Transaction History — for Seeker or Client (own paid projects)
router.get('/history', checkAuthentication, async (req, res) => {
    try {
        const userId = req.user._id;
        const role = req.user.role;

        // Query new granular Transaction model
        let newQuery = { 
            [role === 'Client' ? 'client_id' : 'freelancer_id']: userId 
        };
        const newTransactions = await Transaction.find(newQuery).sort({ 'paymentDetails.paidAt': -1 }).lean();

        // Query legacy Freelancer projects (for backwards compatibility if they aren't in Transaction table)
        let legacyQuery = { 
            [role === 'Client' ? 'client_id' : 'assignedFreelancerId']: userId, 
            paymentStatus: 'paid' 
        };
        const legacyProjects = await Freelancer.find(legacyQuery)
            .select('title category finalAmount paymentDetails paymentStatus client_id assignedFreelancerId')
            .lean();

        // Combine and sort by date
        const seenOrders = new Set(newTransactions.map(t => t.paymentDetails?.orderId));
        
        legacyProjects.forEach(proj => {
            if (proj.paymentDetails?.orderId && !seenOrders.has(proj.paymentDetails.orderId)) {
                newTransactions.push({
                    _id: proj._id,
                    title: proj.title,
                    category: proj.category,
                    finalAmount: proj.finalAmount,
                    paymentDetails: proj.paymentDetails
                });
            }
        });

        newTransactions.sort((a, b) => new Date(b.paymentDetails?.paidAt || 0) - new Date(a.paymentDetails?.paidAt || 0));

        res.status(200).json({ transactions: newTransactions });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// 🛡️ Admin — All Payments
router.get('/admin/all', checkAuthentication, async (req, res) => {
    try {
        if (req.user.role !== 'Admin') {
            return res.status(403).json({ message: 'Unauthorized' });
        }

        const payments = await Freelancer.find({ paymentStatus: 'paid' })
            .select('title category finalAmount paymentDetails client_id assignedFreelancerId')
            .populate('client_id', 'fullName email')
            .populate('assignedFreelancerId', 'fullName email')
            .sort({ 'paymentDetails.paidAt': -1 });

        res.status(200).json({ payments });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
