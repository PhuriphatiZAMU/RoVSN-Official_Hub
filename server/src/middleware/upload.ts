import multer from 'multer';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import cloudinary from '../config/cloudinary';
import path from 'path';
import fs from 'fs';
import dotenv from 'dotenv';

dotenv.config();

const useCloudinary = process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY;

// Local Storage Configuration
const localUploadDir = path.join(__dirname, '../../uploads'); // Adjust path relative to src/middleware
if (!fs.existsSync(localUploadDir)) {
    fs.mkdirSync(localUploadDir, { recursive: true });
}

const localStorage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, localUploadDir),
    filename: (req, file, cb) => cb(null, 'hero-' + Date.now() + '-' + Math.round(Math.random() * 1E9) + path.extname(file.originalname))
});

// Cloudinary Storage Configuration
const cloudinaryStorage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'rov-heroes',
        allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
        transformation: [{ width: 200, height: 200, crop: 'fill' }]
    } as any // Cast to any to avoid strict typing issues with the library if types are missing
});

const upload = multer({
    storage: useCloudinary ? cloudinaryStorage : localStorage,
    limits: { fileSize: 10 * 1024 * 1024 }
});

console.log(`📁 Image Storage: ${useCloudinary ? 'Cloudinary ☁️' : 'Local Disk 💾'}`);

export default upload;
