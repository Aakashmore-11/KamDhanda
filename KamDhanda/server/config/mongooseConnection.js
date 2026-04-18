const mongoose = require('mongoose');

const connectMongoDB = async (uri) => {
    try {
        await mongoose.connect(uri);
        console.log("✅ MongoDB Connected Successfully!");
    } catch (err) {
        console.log("❌ MongoDB Connection Error:", err.message);
        process.exit(1); // stop server if DB fails
    }
};

module.exports = connectMongoDB;