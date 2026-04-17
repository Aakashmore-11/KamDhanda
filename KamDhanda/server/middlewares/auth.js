const { getPayloadByToken } = require("../libs/auth");

const checkAuthentication = (req, res, next) => {
    try {
        req.user = null;
        const token = req.cookies?.plrC__r92qv98;
        if (!token) return res.status(401).json({ message: "Please Login First!" });

        const userPayload = getPayloadByToken(token);
        if (!userPayload) return res.status(401).json({ message: "Invalid or expired token!" });
        req.user = userPayload;
        next();
    } catch (err) {
        res.status(500).json({ message: `Authentication Failed : ${err.message} ` })
    }

}

const checkOptionalAuthentication = (req, res, next) => {
    try {
        req.user = null;
        const token = req.cookies?.plrC__r92qv98;
        if (token) {
            const userPayload = getPayloadByToken(token);
            if (userPayload) {
                req.user = userPayload;
            }
        }
        next();
    } catch (err) {
        // Ignore auth errors for optional auth, just proceed as guest
        next();
    }
}

const isAdmin = (req, res, next) => {
    if (!req.user || req.user.role?.toLowerCase() !== "admin") {
        return res.status(403).json({ message: "Access Denied. Admins only." });
    }
    next();
};

const isClient = (req, res, next) => {
    if (!req.user || req.user.role?.toLowerCase() !== "client") {
        return res.status(403).json({ message: "Access Denied. For Clients only." });
    }
    next();
};

const isSeeker = (req, res, next) => {
    if (!req.user || req.user.role?.toLowerCase() !== "seeker") {
        return res.status(403).json({ message: "Access Denied. For Seekers only." });
    }
    next();
};

module.exports = { checkAuthentication, checkOptionalAuthentication, isAdmin, isClient, isSeeker };