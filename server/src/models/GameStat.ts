import mongoose, { Schema, Document } from 'mongoose';

export interface IGameStat extends Document {
    matchId: string;
    gameNumber: number;
    teamName: string;
    playerName: string;
    heroName: string;
    kills: number;
    deaths: number;
    assists: number;
    mvp: boolean;
    gameDuration: number;
    win: boolean;
    createdAt: Date;
}

const GameStatSchema: Schema = new Schema({
    matchId: String,
    gameNumber: Number,
    teamName: String,
    playerName: String,
    heroName: String,
    kills: Number,
    deaths: Number,
    assists: Number,
    // gold: Number, // Deprecated
    mvp: Boolean,
    gameDuration: Number,
    win: Boolean,
    createdAt: { type: Date, default: Date.now }
});

export default mongoose.model<IGameStat>('GameStat', GameStatSchema, 'gamestats');
