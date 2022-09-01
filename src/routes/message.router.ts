import express from 'express';
import { sendMessage } from '@/controllers/message/sendMessage';
import { MESSAGE_ROUTES } from '@/types/backendAndFrontendCommonTypes/routes';

const messageRouter = express.Router();

messageRouter.post(MESSAGE_ROUTES.SEND, sendMessage);

export { messageRouter };
