const admin = require("firebase-admin");
const dotenv = require("dotenv");

dotenv.config();

const fs = require('fs');
const path = require('path');

const defaultKeyPath = path.join(__dirname, '../serviceAccountKey.json');
const serviceAccountPath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH || defaultKeyPath;

try {
    if (fs.existsSync(serviceAccountPath)) {
        const serviceAccount = require(serviceAccountPath);
        admin.initializeApp({
            credential: admin.credential.cert(serviceAccount)
        });
        console.log(`Firebase Admin initialized via service account file: ${path.basename(serviceAccountPath)}`);
    } else if (process.env.FIREBASE_PROJECT_ID) {
        admin.initializeApp({
            credential: admin.credential.cert({
                projectId: process.env.FIREBASE_PROJECT_ID,
                clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
                privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
            })
        });
        console.log("Firebase Admin initialized via environment variables.");
    } else {
        console.warn("WARNING: Firebase Admin not initialized. Please provide serviceAccountKey.json or env vars.");
    }
} catch (error) {
    console.error("Firebase Admin initialization error:", error.message);
}

module.exports = admin;
