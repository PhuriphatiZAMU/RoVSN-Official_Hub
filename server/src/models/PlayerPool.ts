import mongoose, { Schema, Document } from 'mongoose';

export interface IPlayerPool extends Document {
    name: string;
    grade?: string;
    team?: string;
    inGameName?: string;
    previousIGNs: string[];
    openId?: string;
    createdAt: Date;
}

const PlayerPoolSchema: Schema = new Schema({
    name: String,           // Real Name
    grade: String,
    team: String,
    inGameName: String,     // Current IGN
    previousIGNs: [String], // Old IGNs
    openId: String,
    createdAt: { type: Date, default: Date.now }
});

export default mongoose.model<IPlayerPool>('PlayerPool', PlayerPoolSchema, 'playerpool');
