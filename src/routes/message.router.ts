import express from 'express';
import { sendMessage } from '@/controllers/message/sendMessage';

const messageRouter = express.Router();

messageRouter.post('/send', sendMessage);

export { messageRouter };
