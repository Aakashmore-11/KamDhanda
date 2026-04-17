const { Schema, model, default: mongoose } = require('mongoose');

const applicationSchema = new Schema({
    jobId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Job',
        required: true
    },
    seekerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    coverLetter: {
        type: String
    },
    resumeUrl: {
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: ["Applied", "Accepted", "MockTest", "Interview", "Hired", "Rejected"],
        default: "Applied"
    }
}, { timestamps: true });

const Application = model('Application', applicationSchema);

module.exports = Application;
