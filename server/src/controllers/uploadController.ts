import { Request, Response } from 'express';
import upload from '../middleware/upload';
import dotenv from 'dotenv';

dotenv.config();

const useCloudinary = process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY;

export const uploadFile = async (req: Request, res: Response) => {
    if (!req.file) {
        return res.status(400).send({ message: 'No file uploaded' });
    }
    const fileUrl = (useCloudinary && (req.file as Express.Multer.File & { path?: string }).path)
        ? (req.file as Express.Multer.File & { path?: string }).path
        : `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
    res.json({ url: fileUrl });
};
