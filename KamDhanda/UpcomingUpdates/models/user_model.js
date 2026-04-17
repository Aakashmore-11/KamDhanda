const { Schema, model, default: mongoose } = require('mongoose');
const bcrypt = require('bcrypt');

const userSchema = new Schema({
    fullName: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        index: true
    }
    ,
    password: {
        type: String,
        required: true,
    },
    role: {
        type: String,
        enum: ["Seeker", "Recruiter", "Company"],
        required: true
    },

    profilePic: {
        type: String,
        default: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQjNUOgjEhHpfUqnVk-Tp2uN1AhrrzXhwdX9A&s"
    },
    phoneNo: String,
    location: String,

    //Seeker Fields
    resume: String,
    skills: [String], //optional
    portfolioLink: String,
    experience: String,

    //Recruiters Fields
    recruiterPosition: String,
    recruiterBio: String,
    recruiterCompanyId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "companies"
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

module.exports = User;
