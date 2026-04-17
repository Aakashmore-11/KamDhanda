const User = require('../models/users_model');
const OTP = require('../models/otp_model');
const { generateTokenAndSendCookie } = require("../libs/auth");
const { sendOtpEmail } = require('../config/emailConfig');
const crypto = require('crypto');

// Step 1: Send OTP before signup
const handleSendOtp = async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) {
            return res.status(400).json({ message: "Email is required to send verification code." });
        }

        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser && existingUser.isGoogleVerified) {
            return res.status(400).json({ message: "An account with this email already exists. Please login." });
        }

        // Generate a 6-digit OTP using cryptographically secure method
        const otp = crypto.randomInt(100000, 999999).toString();

        // Delete any existing OTP for this email
        await OTP.deleteMany({ email });

        // Save new OTP (will be hashed by pre-save hook)
        await OTP.create({ email, otp });

        // Send the OTP email
        await sendOtpEmail(email, otp, "User");

        res.status(200).json({ message: `OTP sent to ${email}` });
    } catch (err) {
        console.error("OTP Send Error:", err);
        res.status(500).json({ message: "An error occurred while sending verification code." });
    }
};

// Step 2: Verify OTP and create account
const handleUserSignup = async (req, res) => {
    try {
        const { fullName, email, password, role, otp } = req.body;
        if (!otp) return res.status(400).json({ message: "OTP is required." });

        // Find the latest OTP record for this email
        const otpRecord = await OTP.findOne({ email }).sort({ createdAt: -1 });
        if (!otpRecord) return res.status(400).json({ message: "OTP expired or not found. Please request a new one." });

        // Verify the OTP
        const isOtpValid = await otpRecord.verifyOtp(otp);
        if (!isOtpValid) return res.status(401).json({ message: "Incorrect OTP! Please try again." });

        // OTP is valid — delete it and create the user
        await OTP.deleteMany({ email });

        const isAlreadyUser = await User.findOne({ email });
        if (isAlreadyUser) return res.status(400).json({ message: "User Already there! Please Login." });

        const user = await User.create({ fullName, email, password, role });
        generateTokenAndSendCookie(user, res);
        res.status(201).json({ message: "User Signup Successfully", user });
    } catch (err) {
        console.error("Signup Error:", err);
        res.status(500).json({ message: "An error occurred during signup." });
    }
};

// Login Step 1: Verify email + password, then send OTP
const handleLoginSendOtp = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: "Email and password are required." });
        }

        const user = await User.findOne({ email });
        if (!user) return res.status(404).json({ message: "No account found with this email!" });

        // Must be Google-verified
        if (!user.isGoogleVerified) {
            return res.status(403).json({ message: "This email is not verified with Google. Please login via Google Sign-In first." });
        }

        // Validate password matches
        const isPwdCorrect = await user.comparePwd(password);
        if (!isPwdCorrect) return res.status(401).json({ message: "Incorrect password!" });

        // Password OK — generate and send OTP
        const otp = crypto.randomInt(100000, 999999).toString();
        await OTP.deleteMany({ email });
        await OTP.create({ email, otp });
        await sendOtpEmail(email, otp, user.fullName);

        res.status(200).json({ message: `OTP sent to ${email}` });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: `Internal Server Error : ${err.message}` });
    }
};

// Login Step 2: Verify OTP and issue JWT
const handleUserNormalLogin = async (req, res) => {
    try {
        const { email, otp } = req.body;

        if (!email || !otp) {
            return res.status(400).json({ message: "Email and verification code are required." });
        }

        const user = await User.findOne({ email });
        if (!user) return res.status(404).json({ message: "No account found with this email!" });

        // Verify OTP
        const otpRecord = await OTP.findOne({ email }).sort({ createdAt: -1 });
        if (!otpRecord) return res.status(400).json({ message: "OTP expired or not found. Please request again." });

        const isOtpValid = await otpRecord.verifyOtp(otp);
        if (!isOtpValid) return res.status(401).json({ message: "Incorrect OTP! Please try again." });

        // OTP valid — delete it and issue JWT
        await OTP.deleteMany({ email });

        const { password: _, ...userWithoutPassword } = user.toObject();
        generateTokenAndSendCookie(user, res);
        res.status(200).json({ message: "Login Successful!", user: userWithoutPassword });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: `Internal Server Error : ${err.message}` });
    }
};

const handleGetCurrentUser = async (req, res) => {
    try {
        const user_id = req.user._id;
        const user = await User.findById({ _id: user_id }).select('-password')
        res.status(200).json({ message: "User is Authenticated", user });
    } catch (err) {
        res.status(500).json({ message: `Internal Server Error : ${err.message} ` })
    }
};

const handleLogoutUser = async (req, res) => {
    try {
        res.clearCookie('plrC__r92qv98', {
            httpOnly: true,      // 🔹 Prevents JS access (protects against XSS)
            secure: true,        // 🔹 Required for HTTPS in production
            sameSite: "None",    // 🔹 Required for cross-site cookies
            maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
        })
        res.status(200).json({ message: "Logout Successfully!" });
    } catch (err) {
        res.status(500).json({ message: `Internal Server Error : ${err} ` })
    }
}

const handleChangePassword = async (req, res) => {
    try {
        const { oldPassword, newPassword } = req.body;
        if (!oldPassword || !newPassword) {
            return res.status(400).json({ message: "Old and new passwords are required." });
        }

        const user_id = req.user._id;
        const user = await User.findById(user_id);

        if (!user) {
            return res.status(404).json({ message: "User not found!" });
        }

        // Compare using the schema method
        const isMatch = await user.comparePwd(oldPassword);
        if (!isMatch) {
            return res.status(401).json({ message: "Incorrect old password!" });
        }

        // Update the password field. The pre-save hook handles hashing
        user.password = newPassword;
        await user.save();

        res.status(200).json({ message: "Password updated successfully!" });
    } catch (err) {
        res.status(500).json({ message: `Internal Server Error : ${err.message}` });
    }
}


const handleAddProjectId = async (req, res) => {
    try {
        console.log(req.body)
        const { projectId } = req.body;
        const user_id = req.user._id;
        const user = await User.findById(user_id);
        console.log(user)
        user.appliedForm.push(projectId);
        await user.save()
        res.status(200).json({ message: "ProjectId Stored Successfully!", user });
    } catch (err) {
        res.status(500).json({ message: `Internal Server Error : ${err.message} ` })
    }
};

const handlGetAllAppliedForm = async (req, res) => {
    try {
        const user_id = req.user._id;

        const user = await User.findById(user_id)
            .populate({
                path: "appliedForm",
                populate: {
                    path: "client_id",
                    select: "fullName email role"
                }
            })
            .select("appliedForm -_id");

        const MockTest = require('../models/mocktest_model');
        const Result = require('../models/result_model');

        // Enrich each applied project with the seeker's test result
        const enrichedAppliedForm = await Promise.all(user.appliedForm.map(async (job) => {
            const test = await MockTest.findOne({ jobId: job._id }).sort({ createdAt: -1 });
            let testResult = null;
            if (test) {
                testResult = await Result.findOne({
                    userId: user_id,
                    testId: test._id
                });
            }
            return { ...job.toObject(), testResult };
        }));

        res.status(200).json({ appliedForm: enrichedAppliedForm });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: `Internal Server Error : ${err.message}` });
    }
};




const { OAuth2Client } = require('google-auth-library');
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const handleGoogleAuth = async (req, res) => {
    try {
        const { token, role } = req.body;

        // Verify the token with Google
        const ticket = await googleClient.verifyIdToken({
            idToken: token,
            audience: process.env.GOOGLE_CLIENT_ID,
        });

        const payload = ticket.getPayload();
        const { email, name, picture } = payload;

        let user = await User.findOne({ email });

        if (!user) {
            // New User: Use the provided role and manual password (if available)
            if (!role) {
                return res.status(400).json({ message: "Role is required for new users!" });
            }
            const { password: manualPassword } = req.body;
            user = await User.create({
                fullName: name,
                email,
                password: manualPassword || (Math.random().toString(36).slice(-8) + Math.random().toString(36).slice(-8)),
                role,
                profilePic: picture,
                isGoogleVerified: true  // Mark as Google-verified
            });
        } else {
            // Existing user — upgrade to Google-verified if they weren't
            if (!user.isGoogleVerified) {
                user.isGoogleVerified = true;
                await user.save();
            }
        }

        const { password: _, ...userWithoutPassword } = user.toObject();

        generateTokenAndSendCookie(user, res);
        res.status(200).json({ message: "Google Authentication Successful", user: userWithoutPassword });

    } catch (err) {
        console.error("Google Auth Error:", err);
        res.status(500).json({ message: `Internal Server Error : ${err.message}` });
    }
};

const handleUpdateProfile = async (req, res) => {
    try {
        const user_id = req.user._id;
        const updates = req.body;

        // Prevent non-editable fields from being updated through this route
        delete updates.password;
        delete updates.email;
        delete updates.role;

        const updatedUser = await User.findByIdAndUpdate(
            user_id,
            { $set: updates },
            { new: true, runValidators: true }
        ).select('-password');

        if (!updatedUser) {
            return res.status(404).json({ message: "User not found" });
        }

        res.status(200).json({ message: "Profile updated successfully", user: updatedUser });
    } catch (err) {
        console.error("Update Profile Error:", err);
        res.status(500).json({ message: `Internal Server Error : ${err.message}` });
    }
};

const handleUpdateProfilePic = async (req, res) => {
    console.log("=== updateProfilePic Request ===");
    console.log("req.file:", req.file);
    console.log("req.body:", req.body);
    try {
        if (!req.file) {
            return res.status(400).json({ message: "No file uploaded" });
        }

        const user_id = req.user._id;
        const profilePicUrl = req.file.path || req.file.secure_url || req.file.url;

        const updatedUser = await User.findByIdAndUpdate(
            user_id,
            { $set: { profilePic: profilePicUrl } },
            { new: true }
        ).select('-password');

        if (!updatedUser) {
            return res.status(404).json({ message: "User not found" });
        }

        res.status(200).json({ message: "Profile picture updated successfully", user: updatedUser });
    } catch (err) {
        console.error("Update Profile Pic Error:", err);
        res.status(500).json({ message: `Internal Server Error : ${err.message}` });
    }
};

const handleUpdateResume = async (req, res) => {
    console.log("=== updateResume Request ===");
    console.log("req.file:", req.file);
    console.log("req.body:", req.body);
    try {
        if (!req.file) {
            return res.status(400).json({ message: "No resume file uploaded" });
        }

        const user_id = req.user._id;
        const resumeUrl = req.file.secure_url || req.file.path || req.file.url;

        const updatedUser = await User.findByIdAndUpdate(
            user_id,
            { $set: { resume: resumeUrl } },
            { new: true }
        ).select('-password');

        if (!updatedUser) {
            return res.status(404).json({ message: "User not found" });
        }

        res.status(200).json({ message: "Resume updated successfully", user: updatedUser });
    } catch (err) {
        console.error("Update Resume Error:", err);
        res.status(500).json({ message: `Internal Server Error : ${err.message}` });
    }
};

const handleUpdatePublicKey = async (req, res) => {
    try {
        const user_id = req.user._id;
        const { publicKey } = req.body;

        if (!publicKey) {
            return res.status(400).json({ message: "Public key is required" });
        }

        const updatedUser = await User.findByIdAndUpdate(
            user_id,
            { $set: { publicKey: publicKey } },
            { new: true }
        ).select('-password');

        if (!updatedUser) {
            return res.status(404).json({ message: "User not found" });
        }

        res.status(200).json({ message: "Public key updated successfully", user: updatedUser });
    } catch (err) {
        console.error("Update Public Key Error:", err);
        res.status(500).json({ message: `Internal Server Error : ${err.message}` });
    }
};

const handleUpdateStatus = async (req, res) => {
    try {
        const user_id = req.user._id;
        const { typingTo } = req.body;
        await User.findByIdAndUpdate(user_id, {
            $set: {
                lastSeen: Date.now(),
                typingTo: typingTo || null
            }
        });
        res.status(200).json({ message: "Status updated" });
    } catch (err) {
        res.status(500).json({ message: `Status update failed : ${err.message}` });
    }
};

module.exports = {
    handleSendOtp,
    handleLoginSendOtp,
    handleUserSignup,
    handleUserNormalLogin,
    handleGetCurrentUser,
    handleLogoutUser,
    handleChangePassword,
    handleAddProjectId,
    handlGetAllAppliedForm,
    handleGoogleAuth,
    handleUpdateProfile,
    handleUpdateProfilePic,
    handleUpdateResume,
    handleUpdatePublicKey,
    handleUpdateStatus,
};