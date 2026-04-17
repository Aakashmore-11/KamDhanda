const { Schema, model, default: mongoose } = require('mongoose');
const bcrypt = require('bcrypt');

const userSchema = new Schema({
    fullName: {
        type: String,
        required: true
    },
    email: {
        type: String,
        unique: true,
        required: true, // Make email mandatory
        sparse: true,
        index: true
    },
    phoneNumber: {
        type: String,
        unique: true,
        sparse: true
    },
    isPhoneVerified: {
        type: Boolean,
        default: false
    },
    password: {
        type: String,
        required: true,
    },
    role: {
        type: String,
        enum: ["Seeker", "Client", "Admin"],
        required: true
    },
    isBlocked: {
        type: Boolean,
        default: false
    },
    isGoogleVerified: {
        type: Boolean,
        default: false
    },

    profilePic: {
        type: String,
        default: null
    },
    location: String,

    //Seeker Fields
    resume: String,
    bio: String,
    skills: [String],
    portfolioLink: String,
    github: String,
    linkedin: String,
    twitter: String,
    experience: String,
    availability: String,
    preferredRole: String,
    expectedSalary: String,
    appliedForm: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "freelancerProject"
        }
    ],
    publicKey: {
        type: String,
        default: null
    },
    lastSeen: {
        type: Date,
        default: Date.now
    },
    typingTo: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null
    }

}, { timestamps: true });

// Convert the userPwd into Hashed Pwd
userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();
    this.password = await bcrypt.hash(this.password, 10);
    next();
});


// Compare the enteredPwd with Hashed Pwd
userSchema.methods.comparePwd = async function (enteredPwd) {
    return await bcrypt.compare(enteredPwd, this.password);
};


const User = model('users', userSchema);
// Also register as 'User' to prevent MissingSchemaErrors if something references it incorrectly
mongoose.model('User', userSchema);

module.exports = User;
