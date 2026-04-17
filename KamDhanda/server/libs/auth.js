const jwt = require('jsonwebtoken');

const secret = process.env.JWT_SECRET || "aakashmore"; // Fallback for dev, but should be in .env

const generateTokenAndSendCookie = (user, res) => {
    const { _id, email, role } = user;
    const payload = {
        _id,
        email,
        role
    };

    const token = jwt.sign(payload, secret);
    res.cookie('plrC__r92qv98', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production", // 🛡️ Secure only in production
        sameSite: "Lax", // 🛠️ Better for development on localhost
        maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });
}

const getPayloadByToken = (token) => {
    try {
        return jwt.verify(token, secret);
    } catch (err) {
        return null;
    }
}

module.exports = {
    generateTokenAndSendCookie,
    getPayloadByToken
}