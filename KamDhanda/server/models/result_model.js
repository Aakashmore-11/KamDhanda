const { Schema, model, default: mongoose } = require('mongoose');

const resultSchema = new Schema({
    testId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'MockTest',
        required: true
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'users',
        required: true
    },
    score: {
        type: Number,
        default: 0
    },
    totalMarks: {
        type: Number,
        required: true
    },
    timeTaken: {
        type: Number, // In minutes
        default: 0
    },
    accuracy: {
        type: Number, // Percentage
        default: 0
    },
    status: {
        type: String,
        enum: ["Passed", "Failed", "Pending"],
        default: "Pending"
    },
    attemptDetails: [
        {
            questionId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Question'
            },
            userAnswer: Schema.Types.Mixed,
            isCorrect: Boolean,
            score: Number,
            timeSpentSec: Number
        }
    ],
    tabSwitchWarnings: {
        type: Number,
        default: 0
    },
    submittedAt: {
        type: Date,
        default: Date.now
    }
}, { timestamps: true });

const Result = model('Result', resultSchema);

module.exports = Result;
