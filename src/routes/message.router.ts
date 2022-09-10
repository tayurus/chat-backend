import express from 'express';
import { sendMessage } from 'src/controllers/message/sendMessage';
import { MESSAGE_ROUTES } from 'src/types/backendAndFrontendCommonTypes/routes';
import { verifyToken } from 'src/middleware/auth';

const messageRouter = express.Router();

// @ts-ignore
messageRouter.post(MESSAGE_ROUTES.SEND, verifyToken, sendMessage);

export { messageRouter };
