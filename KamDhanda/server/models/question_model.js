const { Schema, model, default: mongoose } = require('mongoose');

const questionSchema = new Schema({
    testId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'MockTest',
        required: true
    },
    questionText: {
        type: String,
        required: true
    },
    type: {
        type: String,
        enum: ["MCQ-Single", "MCQ-Multiple", "Coding", "Subjective"],
        required: true
    },
    difficulty: {
        type: String,
        enum: ["Easy", "Medium", "Hard"],
        default: "Medium"
    },
    marks: {
        type: Number,
        required: true
    },
    // For MCQs
    options: [
        {
            text: String,
            isCorrect: Boolean
        }
    ],
    // Single field for direct answer matching
    correctAnswer: String,
    // For Coding
    codeSnippet: String,
    testCases: [
        {
            input: String,
            output: String,
            isPublic: { type: Boolean, default: true }
        }
    ],
    // For subjective evaluation guidance (if needed)
    keywords: [String],
    aiEvaluationPrompt: String
}, { timestamps: true });

const Question = model('Question', questionSchema);

module.exports = Question;
