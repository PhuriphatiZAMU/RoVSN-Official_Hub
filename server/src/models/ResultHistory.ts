import mongoose, { Schema, Document } from 'mongoose';

export interface IResultHistory extends Document {
    matchId: string;
    action: 'create' | 'update' | 'delete';
    previousData?: any;
    newData?: any;
    changedBy: string;
    changedAt: Date;
    reason?: string;
}

const ResultHistorySchema: Schema = new Schema({
    matchId: { type: String, required: true, index: true },
    action: { type: String, enum: ['create', 'update', 'delete'], required: true },
    previousData: { type: Schema.Types.Mixed },
    newData: { type: Schema.Types.Mixed },
    changedBy: { type: String, required: true },
    changedAt: { type: Date, default: Date.now },
    reason: { type: String }
});

// Index for quick queries
ResultHistorySchema.index({ matchId: 1, changedAt: -1 });
ResultHistorySchema.index({ changedAt: -1 });

export default mongoose.model<IResultHistory>('ResultHistory', ResultHistorySchema, 'resulthistory');
