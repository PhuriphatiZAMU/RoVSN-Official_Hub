import mongoose, { Schema, Document } from 'mongoose';

export interface IResult extends Document {
    matchId: string;
    matchDay: number | any; // Sometimes string in legacy?
    teamBlue: string;
    teamRed: string;
    scoreBlue: number;
    scoreRed: number;
    winner: string;
    loser: string;
    gameDetails: any[];
    isByeWin: boolean;
    createdAt: Date;
}

const ResultSchema: Schema = new Schema({
    matchId: { type: String, index: true },
    matchDay: { type: mongoose.Schema.Types.Mixed, index: 1 }, // Can be Number or String based on original code usage
    teamBlue: String,
    teamRed: String,
    scoreBlue: Number,
    scoreRed: Number,
    winner: String,
    loser: String,
    gameDetails: Array,
    isByeWin: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now }
});

export default mongoose.model<IResult>('Result', ResultSchema, 'results');
