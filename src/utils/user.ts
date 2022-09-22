import Mongoose from 'mongoose';
import { UserType } from 'src/model/user';
import jwt from 'jsonwebtoken';
import { Dialog } from 'src/model/dialog';
import { WebSocketModule } from 'src/utils/websocketModule';
import {
  FoundedUser,
  UserInfoInDialog,
  WebSocketMessage,
  WebSocketsEvents,
  WsUserTypingResponse,
  WsUserUpdatedResponse,
} from 'src/types/backendResponses';
import WebSocket from 'ws';
import { PING_PONG_DATA, PING_PONG_WAIT_TIMEOUT } from 'src/utils/webSocketsConstants';
import { WsUserTypingParams } from 'src/types/backendParams';
import { getAllDialogParticipantsExceptCurrentUser } from 'src/utils/dialog';

/**
 * авторизовывает пользователя
 */
export function signUser(params: { id: string; email: string; first_name: string; last_name: string }) {
  const { id, email, first_name, last_name } = params;
  // @ts-ignore
  const token = jwt.sign({ user_id: id, email, first_name, last_name }, process.env.TOKEN_KEY, {
    expiresIn: '2h',
  });
  return token;
}

/**
 * Извлекает данные о пользователе из ячейки базы данных
 * */
export function extractUserInfoFromDbEntity(userData: Mongoose.Document<unknown, any, UserType> & UserType & { _id: Mongoose.Types.ObjectId }) {
  return {
    first_name: userData.first_name,
    last_name: userData.last_name,
    email: userData.email,
    profilePhoto: userData.profilePhoto,
    id: userData._id.toString(),
  };
}

/**
 * Отправляет сообщение, что данные пользователя изменились, всем его собеседникам, которые сейчас онлайн
 * */
export async function notifyThatUserUpdatedToAllHisDialogsParticipants(params: { userId: string; changes: Partial<UserInfoInDialog> }) {
  const { userId, changes } = params;
  // найти все диалоги, в которых участвует данный пользователь
  const allUsersDialogs = await Dialog.find({ participants: userId });
  // извлечь всех участников данных диалогов, которые сейчас в сети
  const onlineDialogsParticipants = allUsersDialogs.reduce((acc: string[], dlg) => {
    const onlineDialogParticipants = dlg.participants.filter(participant => WebSocketModule.isClientOnline(participant));
    return [...acc, ...onlineDialogParticipants];
  }, []);
  // отправить им всем обновление, что данный пользователь в сети
  onlineDialogsParticipants.forEach(onlineParticipant => {
    const userIsNowOnlineUpdate: WebSocketMessage<WsUserUpdatedResponse> = { type: WebSocketsEvents.USER_UPDATE, data: { userId, changes } };
    WebSocketModule.clients[onlineParticipant]?.send(JSON.stringify(userIsNowOnlineUpdate));
  });
}

/**
 * Начинает опрашивать клиента по страткгии "пинг-понг", чтобы понять, онлайн он, или нет
 * */
export function startPingPongPoolingForUserOnlineStatus(params: { ws: WebSocket; userId: string }) {
  const { ws, userId } = params;

  let pingPongTimeoutDescriptor = updateIsAliveUserStatusWithPingPongStrategy();

  function updateIsAliveUserStatusWithPingPongStrategy() {
    ws.ping(PING_PONG_DATA);
    return setTimeout(() => {
      WebSocketModule.removeClient(userId);
      notifyThatUserUpdatedToAllHisDialogsParticipants({ userId, changes: { online: false } });
    }, PING_PONG_WAIT_TIMEOUT);
  }

  ws.on('pong', data => {
    const response = data.toString();
    if (response === PING_PONG_DATA) {
      clearTimeout(pingPongTimeoutDescriptor);
      // вот тут еще один setTimeout
      setTimeout(() => {
        pingPongTimeoutDescriptor = updateIsAliveUserStatusWithPingPongStrategy();
      }, PING_PONG_WAIT_TIMEOUT);
    }
  });
}

/**
 * уведомляет всех пользователей диалога, что кто-то пишет в этом диалоге
 * @param params.dialogId - айди диалога
 * @param params.typingType - тип "печатанья"
 * @param params.typingUserId - айди пользователя, который пишет
 * */
export async function notifyThatUserTypingToDialogParticipants(params: WsUserTypingParams & { typingUserId: string }) {
  const { typingType, typingUserId, dialogId } = params;

  // берем в диалог, в котором печатает пользователь
  const dialog = await Dialog.findById(dialogId);
  if (!dialog) {
    return;
  }

  // извлекаем оттуда всех участников, кроме самого печатаюищего пользователя
  const dialogParticipantsExceptTypingUser = getAllDialogParticipantsExceptCurrentUser(dialog.participants, typingUserId);

  // оправляем им всем по сокетам сообщение, что пользователь печатает
  const data: WebSocketMessage<WsUserTypingResponse> = { type: WebSocketsEvents.USER_TYPING, data: { typingType, userId: typingUserId, dialogId } };

  WebSocketModule.clients[dialogParticipantsExceptTypingUser]?.send(JSON.stringify(data));
}

/**
 * нормализует данные о пользователе из БД
 * @param userFromDb - данные о пользователе из БД
 * @return - нормализованные данные (вместо _id будет id)
 * */
export function normalizeFoundedUser(
  userFromDb: Mongoose.Document<Mongoose.Types.ObjectId, any, UserType> & UserType & { _id: Mongoose.Types.ObjectId },
): FoundedUser {
  const res = { ...userFromDb, id: userFromDb._id.toString() };
  // @ts-ignore
  delete res._id;
  return res;
}
