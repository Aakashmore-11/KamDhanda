const { Schema, model } = require('mongoose');
const bcrypt = require('bcrypt');

const otpSchema = new Schema({
    email: {
        type: String,
        sparse: true,
        index: true,
    },
    phoneNumber: {
        type: String,
        sparse: true,
        index: true,
    },
    otp: {
        type: String,
        required: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
        expires: 600, // Auto-delete after 10 minutes (MongoDB TTL)
    },
});

// Hash the OTP before saving
otpSchema.pre('save', async function (next) {
    if (!this.isModified('otp')) return next();
    this.otp = await bcrypt.hash(this.otp, 10);
    next();
});

otpSchema.methods.verifyOtp = async function (enteredOtp) {
    return await bcrypt.compare(enteredOtp, this.otp);
};

const OTP = model('OTP', otpSchema);
module.exports = OTP;
