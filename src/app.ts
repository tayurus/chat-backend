import { BASE_ROUTES } from 'src/types/backendAndFrontendCommonTypes/routes';

require('dotenv').config();
import { connectToDB } from 'src/config/database';
import express, { NextFunction } from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import { verifyToken } from 'src/middleware/auth';
import { userRouter } from 'src/routes/user.router';
import { messageRouter } from 'src/routes/message.router';
import { dialogRouter } from 'src/routes/dialog.router';
import { WebSocketModule } from 'src/utils/websocketModule';
import {
  notifyThatUserTypingToDialogParticipants,
  notifyThatUserUpdatedToAllHisDialogsParticipants,
  startPingPongPoolingForUserOnlineStatus,
} from 'src/utils/user';
import { WebSocketMessage, WebSocketsEvents } from 'src/types/backendResponses';
import { WsUserTypingParams } from 'src/types/backendParams';
import { fileRouter } from 'src/routes/file.router';

connectToDB();

const app = express();

WebSocketModule.server.on('connection', function (ws, req) {
  let userId = '';
  if (req.url) {
    userId = req.url.replace('/', '');
    if (userId) {
      WebSocketModule.addClient(userId, ws);
      notifyThatUserUpdatedToAllHisDialogsParticipants({ userId, changes: { online: true } });
    } else {
      console.error('USER ID FOR WEBSOCKET HAS NOT BEEN SENT');
    }
  } else {
    console.log('req url has not been sent');
  }

  startPingPongPoolingForUserOnlineStatus({ ws, userId });

  ws.on('message', function (data) {
    const formattedData: WebSocketMessage<any> = JSON.parse(data.toString());
    const { type } = formattedData;
    if (type === WebSocketsEvents.USER_TYPING) {
      const typedFormattedData: WebSocketMessage<WsUserTypingParams> = formattedData;
      const {
        data: { dialogId, typingType },
      } = typedFormattedData;
      notifyThatUserTypingToDialogParticipants({ typingType, dialogId, typingUserId: userId });
    }
  });
});

const corsConfig = {
  origin: true,
  credentials: true,
};

app.use(express.json() as NextFunction);
app.use(cors(corsConfig) as NextFunction);
app.use(cookieParser() as NextFunction);
app.use(BASE_ROUTES.USER, userRouter);
// @ts-ignore
app.use(BASE_ROUTES.MESSAGE, verifyToken, messageRouter);
// @ts-ignore
app.use(BASE_ROUTES.DIALOG, verifyToken, dialogRouter);
// @ts-ignore
app.use(BASE_ROUTES.FILE, verifyToken, fileRouter);

export { app };
