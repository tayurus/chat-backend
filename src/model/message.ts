import mongoose, { Schema } from 'mongoose';

export type MessageType = {
  datetime: number;
  content: string;
  dialogId: string;
  from: string;
};

const messageSchema = new mongoose.Schema<MessageType>({
  datetime: { type: Number, default: null },
  content: { type: String, default: null },
  dialogId: Schema.Types.ObjectId,
  from: Schema.Types.ObjectId,
});

export const Message = mongoose.model<MessageType>('message', messageSchema);
