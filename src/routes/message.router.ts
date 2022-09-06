import express from 'express';
import { sendMessage } from '@/controllers/message/sendMessage';
import { MESSAGE_ROUTES } from '@/types/backendAndFrontendCommonTypes/routes';
import { verifyToken } from '@/middleware/auth';

const messageRouter = express.Router();

// @ts-ignore
messageRouter.post(MESSAGE_ROUTES.SEND, verifyToken, sendMessage);

export { messageRouter };
