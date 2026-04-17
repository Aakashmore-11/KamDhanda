const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
    project_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Freelancer', required: true },
    client_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    freelancer_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true }, // "Project Name - Phase 1"
    category: { type: String, default: "Project Payment" },
    finalAmount: { type: Number, required: true }, // Maps naturally to frontend expectations
    paymentDetails: {
        orderId: { type: String },
        paymentId: { type: String },
        signature: { type: String },
        paidAt: { type: Date, default: Date.now }
    }
}, { timestamps: true });

module.exports = mongoose.model('Transaction', transactionSchema);
