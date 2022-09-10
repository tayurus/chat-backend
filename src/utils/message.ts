import { MessageType } from 'src/model/message';
import { FoundedMessage } from 'src/types/backendResponses';
import Mongoose from 'mongoose';

export function normalizeMessage(
  messageFromDb: Mongoose.Document<Mongoose.Types.ObjectId, any, MessageType> & MessageType & { _id: Mongoose.Types.ObjectId },
): FoundedMessage {
  return { id: messageFromDb._id.toString(), from: messageFromDb.from, content: messageFromDb.content, datetime: messageFromDb.datetime };
}
