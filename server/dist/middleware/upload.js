"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const multer_1 = __importDefault(require("multer"));
const multer_storage_cloudinary_1 = require("multer-storage-cloudinary");
const cloudinary_1 = __importDefault(require("../config/cloudinary"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const useCloudinary = process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY;
// Local Storage Configuration
const localUploadDir = path_1.default.join(__dirname, '../../uploads'); // Adjust path relative to src/middleware
if (!fs_1.default.existsSync(localUploadDir)) {
    fs_1.default.mkdirSync(localUploadDir, { recursive: true });
}
const localStorage = multer_1.default.diskStorage({
    destination: (req, file, cb) => cb(null, localUploadDir),
    filename: (req, file, cb) => cb(null, 'hero-' + Date.now() + '-' + Math.round(Math.random() * 1E9) + path_1.default.extname(file.originalname))
});
// Cloudinary Storage Configuration
const cloudinaryStorage = new multer_storage_cloudinary_1.CloudinaryStorage({
    cloudinary: cloudinary_1.default,
    params: {
        folder: 'rov-heroes',
        allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
        transformation: [{ width: 200, height: 200, crop: 'fill' }]
    } // Cast to any to avoid strict typing issues with the library if types are missing
});
const upload = (0, multer_1.default)({
    storage: useCloudinary ? cloudinaryStorage : localStorage,
    limits: { fileSize: 10 * 1024 * 1024 }
});
console.log(`📁 Image Storage: ${useCloudinary ? 'Cloudinary ☁️' : 'Local Disk 💾'}`);
exports.default = upload;
