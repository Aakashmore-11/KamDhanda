const { Schema, model, default: mongoose } = require('mongoose');

const projectTrackingSchema = new Schema({
    projectId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "freelancerProject",
        required: true,
        unique: true
    },
    overallDeadline: {
        type: Date
    },
    progress: {
        type: Number,
        default: 0,
        min: 0,
        max: 100
    },
    tasks: [
        {
            description: { type: String, required: true },
            status: {
                type: String,
                enum: ["Pending", "In Progress", "Completed"],
                default: "Pending"
            },
            deadline: { type: Date },
            createdAt: { type: Date, default: Date.now }
        }
    ],
    files: [
        {
            name: { type: String, required: true },
            url: { type: String, required: true },
            uploadedBy: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "users",
                required: true
            },
            uploadedAt: { type: Date, default: Date.now }
        }
    ],
    modules: [
        {
            title: { type: String, required: true },
            description: { type: String },
            amount: { type: Number, required: true },
            status: { 
                type: String, 
                enum: ["Pending", "In Progress", "Completed", "Waiting for Client Approval", "Approved"], 
                default: "Pending" 
            },
            progress: { type: Number, default: 0, min: 0, max: 100 },
            paymentStatus: {
                type: String,
                enum: ["Pending", "Ready to Pay", "Paid"],
                default: "Pending"
            },
            paymentDetails: {
                 orderId: String,
                 paymentId: String,
                 signature: String,
                 paidAt: Date
            },
            createdAt: { type: Date, default: Date.now }
        }
    ]
}, { timestamps: true });

const ProjectTracking = model('projectTracking', projectTrackingSchema);
module.exports = ProjectTracking;
