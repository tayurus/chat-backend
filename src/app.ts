import { BASE_ROUTES } from '@/types/backendAndFrontendCommonTypes/routes';

require('dotenv').config();
import { connectToDB } from '@/config/database';
import express from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import { verifyToken } from '@/middleware/auth';
import { userRouter } from '@routes/user.router';
import { messageRouter } from '@routes/message.router';
import { dialogRouter } from '@routes/dialog.router';
import { WebSocketModule } from '@utils/websocketModule';
import {
  notifyThatUserTypingToDialogParticipants,
  notifyThatUserUpdatedToAllHisDialogsParticipants,
  startPingPongPoolingForUserOnlineStatus,
} from '@utils/user';
import { WebSocketMessage, WebSocketsEvents } from '@/types/backendResponses';
import { WsUserTypingParams } from '@/types/backendParams';

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

app.use(express.json());
app.use(cors(corsConfig));
app.use(cookieParser());
app.use(BASE_ROUTES.USER, userRouter);
app.use(BASE_ROUTES.MESSAGE, verifyToken, messageRouter);
app.use(BASE_ROUTES.DIALOG, verifyToken, dialogRouter);

app.get('/', function (request, response) {
  response.send('Hello Test');
});

export { app };
