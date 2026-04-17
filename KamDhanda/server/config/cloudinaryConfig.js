const cloudinary = require('cloudinary').v2;
const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');

// Check if Cloudinary credentials are provided
const isCloudinaryConfigured = process.env.CLOUD_NAME && process.env.CLOUDINARY_KEY && process.env.CLOUDINARY_SECRET;

if (isCloudinaryConfigured) {
    cloudinary.config({
        cloud_name: process.env.CLOUD_NAME,
        api_key: process.env.CLOUDINARY_KEY,
        api_secret: process.env.CLOUDINARY_SECRET,
    });
} else {
    console.warn("WARNING: Cloudinary credentials are missing in server/.env. File uploads will fail.");
}

let storage;

if (isCloudinaryConfigured) {
    storage = new CloudinaryStorage({
        cloudinary: cloudinary,
        params: async (req, file) => {
            const isPdf = file.mimetype === 'application/pdf' || file.originalname.toLowerCase().endsWith('.pdf');
            const isImage = file.mimetype.startsWith('image/');
            const resourceType = file.mimetype.startsWith('image/') ? 'image' : 'raw';

            return {
                folder: 'KamDhanda',
                resource_type: resourceType,
                // For images, Cloudinary will auto-detect format.
                // For PDFs in 'raw' mode, we must include .pdf to serve correctly
                public_id: file.originalname.split('.')[0] + '_' + Date.now() + (isPdf ? '.pdf' : ''),
                access_mode: 'public'
            };
        }
    });
} else {
    // Fallback storage (or null) to prevent crash
    storage = multer.memoryStorage();
}

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 50 * 1024 * 1024, // 50MB
    },
});

module.exports = upload;




// =================================================================================

// const cloudinary = require('cloudinary').v2;
// const multer = require('multer');
// const { CloudinaryStorage } = require('multer-storage-cloudinary');

// const isCloudinaryConfigured =
//     process.env.CLOUD_NAME &&
//     process.env.CLOUDINARY_KEY &&
//     process.env.CLOUDINARY_SECRET;

// if (isCloudinaryConfigured) {
//     cloudinary.config({
//         cloud_name: process.env.CLOUD_NAME,
//         api_key: process.env.CLOUDINARY_KEY,
//         api_secret: process.env.CLOUDINARY_SECRET,
//     });
// }

// let storage;

// if (isCloudinaryConfigured) {
//     storage = new CloudinaryStorage({
//         cloudinary: cloudinary,
//         params: async (req, file) => {
//             const isPdf =
//                 file.mimetype === "application/pdf" ||
//                 file.originalname.toLowerCase().endsWith(".pdf");

//             return {
//                 folder: "KamDhanda",

//                 // 🔥 IMPORTANT FIX
//                 resource_type: isPdf ? "raw" : "image",

//                 format: isPdf ? "pdf" : undefined,

//                 // 🔥 ensure public delivery
//                 type: "upload",
//                 access_mode: "public",
//             };
//         },
//     });
// } else {
//     storage = multer.memoryStorage();
// }

// const upload = multer({
//     storage: storage,
//     limits: {
//         fileSize: 50 * 1024 * 1024,
//     },
// });

// module.exports = upload;