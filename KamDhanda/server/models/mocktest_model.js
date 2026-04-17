const { Schema, model, default: mongoose } = require('mongoose');

const mockTestSchema = new Schema({
    jobId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Job',
        required: true
    },
    clientId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'users',
        required: true
    },
    title: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        required: true
    },
    duration: {
        type: Number, // In minutes
        required: true
    },
    totalMarks: {
        type: Number,
        required: true
    },
    passingCriteria: {
        type: Number, // Percentage or absolute marks
        required: true
    },
    testType: {
        type: String,
        enum: ["MCQ", "Coding", "Mixed"],
        required: true
    },
    startTime: {
        type: Date,
        required: true
    },
    endTime: {
        type: Date,
        required: true
    },
    rules: {
        negativeMarking: { type: Boolean, default: false },
        randomOrder: { type: Boolean, default: true },
        tabSwitchWarning: { type: Boolean, default: true },
        maxWarnings: { type: Number, default: 3 }
    }
}, { timestamps: true });

const MockTest = model('MockTest', mockTestSchema);

module.exports = MockTest;
