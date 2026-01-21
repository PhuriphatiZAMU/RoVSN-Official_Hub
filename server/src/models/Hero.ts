import mongoose, { Schema, Document } from 'mongoose';

export interface IHero extends Document {
    name: string;
    imageUrl?: string;
    createdAt: Date;
}

const HeroSchema: Schema = new Schema({
    name: { type: String, required: true, unique: true },
    imageUrl: String,
    createdAt: { type: Date, default: Date.now }
});

export default mongoose.model<IHero>('Hero', HeroSchema, 'heroes');
