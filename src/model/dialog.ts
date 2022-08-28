import mongoose, { Schema } from 'mongoose';

export type DialogType = { participants: string[]; lastMessage: string };

const dialogSchema = new mongoose.Schema<DialogType>({
  participants: [Schema.Types.ObjectId],
  lastMessage: Schema.Types.ObjectId,
});

export const Dialog = mongoose.model('dialog', dialogSchema);
