const { Schema, model, default: mongoose } = require('mongoose');

const interviewSchema = new Schema({
    jobId: { type: mongoose.Schema.Types.ObjectId, ref: 'Job', required: true },
    applicationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Application', required: true },
    clientId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    seekerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true },
    date: { type: Date, required: true },
    time: { type: String, required: true },
    duration: { type: Number, default: 45 },
    timezone: { type: String, default: 'Asia/Kolkata' },
    roomId: { type: String, unique: true },
    status: {
        type: String,
        enum: ['Scheduled', 'Waiting', 'Live', 'Completed', 'Cancelled', 'Missed', 'Rescheduled'],
        default: 'Scheduled'
    },
    notes: { type: String },
    // Evaluation by client
    evaluation: {
        communication: { type: Number, min: 1, max: 5 },
        technical: { type: Number, min: 1, max: 5 },
        confidence: { type: Number, min: 1, max: 5 },
        problemSolving: { type: Number, min: 1, max: 5 },
        overallRating: { type: Number, min: 1, max: 5 },
        feedback: { type: String },
        decision: { type: String, enum: ['Selected', 'Rejected', 'Hold', ''], default: '' },
        evaluatedAt: { type: Date }
    },
    // Recording consent
    recordingConsent: { type: Boolean, default: false },
    // Interview questions prepared by client
    questions: [{ type: String }],
    // Reschedule tracking
    rescheduleHistory: [{
        previousDate: Date,
        previousTime: String,
        rescheduledAt: { type: Date, default: Date.now },
        reason: String
    }],
    // Timing
    actualStartTime: { type: Date },
    actualEndTime: { type: Date },
}, { timestamps: true });

const Interview = model('Interview', interviewSchema);
module.exports = Interview;
