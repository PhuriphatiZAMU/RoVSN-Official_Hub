import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const connectDB = async (): Promise<void> => {
    try {
        const MONGO_URI = process.env.MONGO_URI;
        if (!MONGO_URI) {
            console.error('❌ MONGO_URI is not defined in environment variables!');
            process.exit(1);
        }
        console.log("🔄 Connecting to MongoDB...");
        await mongoose.connect(MONGO_URI);
        console.log(`✅ MongoDB Connected`);
    } catch (err) {
        console.error('❌ MongoDB Error:', err);
        process.exit(1);
    }
};

export default connectDB;
