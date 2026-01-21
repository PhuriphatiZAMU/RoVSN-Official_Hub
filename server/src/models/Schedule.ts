import mongoose, { Schema, Document } from 'mongoose';

export interface ISchedule extends Document {
    teams: string[];
    potA: string[];
    potB: string[];
    schedule: any[]; // You can define a stricter type for schedule items if known
    createdAt: Date;
}

const ScheduleSchema: Schema = new Schema({
    teams: [String],
    potA: [String],
    potB: [String],
    schedule: Array,
    createdAt: { type: Date, default: Date.now }
});

export default mongoose.model<ISchedule>('Schedule', ScheduleSchema, 'schedules');
