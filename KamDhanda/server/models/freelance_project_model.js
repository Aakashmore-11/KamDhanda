const { Schema, model, default: mongoose } = require('mongoose');

const freelanceProjectSchema = new Schema({
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    client_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "users",
        required: true
    },
    budgetType: {
        type: String,
        enum: ["Fixed", "Hourly"],
        default: "Fixed"
    },
    minBudget: {
        type: Number,
        required: true
    },
    maxBudget: {
        type: Number,
        required: true
    },
    skills: [
        { type: String, default: null }
    ],
    category: {
        type: String,
        required: true
    },


    proposals: [
        {
            seeker_id: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "users",
                required: true
            },
            seeker_phoneno: {
                type: Number,
                required: true
            },
            seeker_currentStatus: {
                type: String,
                required: true
            },
            coverLetter: {
                type: String,
                maxlength: 2000
            },
            bidAmount: Number,
            deliveryTime: String,
            status: {
                type: String,
                enum: ["Pending", "Accepted", "Rejected"],
                default: "Pending"
            },
            appliedAt: {
                type: Date,
                default: Date.now
            }
        }
    ],

    assignedFreelancerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "users",
        default: null
    },

    assignedAt: {
        type: Date,
        default: null
    },

    status: { type: String, enum: ["Open", "Assigned", "Completed", "Closed", "Paid"], default: "Open" },
    finalAmount: { type: Number, default: 0 },
    isPaid: { type: Boolean, default: false },
    paymentStatus: {
        type: String,
        enum: ["unpaid", "paid"],
        default: "unpaid"
    },
    paymentDetails: {
        orderId: String,
        paymentId: String,
        signature: String,
        amount: Number,
        paidAt: Date
    },





}, { timestamps: true })

const Freelancer = model('freelancerProject', freelanceProjectSchema);
module.exports = Freelancer