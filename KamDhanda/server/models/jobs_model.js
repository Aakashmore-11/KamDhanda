const { Schema, model, default: mongoose } = require('mongoose');

const jobSchema = new Schema({
    employerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    location: {
        type: String,
        required: true
    },
    salaryRange: {
        min: { type: Number },
        max: { type: Number }
    },
    jobType: {
        type: String,
        enum: ["Full-time", "Part-time", "Contract", "Internship"],
        required: true
    },
    requiredSkills: {
        type: [String],
        default: []
    },
    status: {
        type: String,
        enum: ["Open", "Closed"],
        default: "Open"
    }
}, { timestamps: true });

const Job = model('Job', jobSchema);

module.exports = Job;
