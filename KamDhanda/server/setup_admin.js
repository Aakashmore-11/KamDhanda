const mongoose = require('mongoose');
const User = require('./models/users_model');

const MONGO_URI = "mongodb://localhost:27017/KamDhanda";

async function makeAdmin(email) {
    try {
        await mongoose.connect(MONGO_URI);
        console.log("Connected to MongoDB...");

        let user = await User.findOne({ email });

        if (!user) {
            console.log(`Creating a NEW Admin record for: ${email}`);
            user = new User({
                fullName: "Platform Admin",
                email: email,
                role: "Admin",
                isGoogleVerified: true,
                password: "Admin@123" 
            });
        } else {
            console.log(`Promoting existing user to Admin: ${user.fullName}`);
            user.role = "Admin";
            user.isGoogleVerified = true;
            user.password = "Admin@123";
        }

        await user.save();
        console.log(`\n✅ SUCCESS: Account Ready!`);
        console.log(`📧 Email: ${email}`);
        console.log(`🔓 Password: Admin@123`);
        console.log(`-----------------------------------`);
    } catch (error) {
        console.error("Error setup_admin:", error);
    } finally {
        mongoose.connection.close();
    }
}

const targetEmail = "gamingwithsky48@gmail.com";
makeAdmin(targetEmail);
