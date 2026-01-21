import mongoose, { Schema, Document } from 'mongoose';

export interface ITeamLogo extends Document {
    teamName: string;
    logoUrl: string;
    createdAt: Date;
}

const TeamLogoSchema: Schema = new Schema({
    teamName: String,
    logoUrl: String,
    createdAt: { type: Date, default: Date.now }
});

export default mongoose.model<ITeamLogo>('TeamLogo', TeamLogoSchema, 'teamlogo');
