const { Schema, model } = require('mongoose');

const skillSchema = new Schema({
    name: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    category: {
        type: String,
        default: "General"
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, { timestamps: true });

const Skill = model('Skill', skillSchema);
module.exports = Skill;
