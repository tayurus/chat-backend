import { Dialog } from 'src/model/dialog';
import { User } from 'src/model/user';
import { Message } from 'src/model/message';
import { GetDialogsResponse } from 'src/types/backendResponses';
import { TypedRequestBody, TypedResponse } from 'src/types/express';
import { GetDialogsParams } from 'src/types/backendParams';
import { ERROR_MESSAGES } from 'src/utils/errorMessages';
import { normalizeMessage } from 'src/utils/message';
import { extractUserInfoFromDbEntity } from 'src/utils/user';
import { WebSocketModule } from 'src/utils/websocketModule';

export const getDialogs = async (req: TypedRequestBody<GetDialogsParams>, res: TypedResponse<GetDialogsResponse>) => {
  // @ts-ignore
  const { user } = req;

  const userId = user.user_id;

  const userFromDb = await User.findById(userId);

  if (!userFromDb) {
    return res.status(400).send(ERROR_MESSAGES.USER_NOT_FOUND);
  }

  // достаем диалоги данного пользователя
  const userDialogs = await Dialog.find({ _id: { $in: userFromDb.dialogs } });

  const dialogsForFrontend: GetDialogsResponse = [];
  for (let i = 0; i < userDialogs.length; i++) {
    const currentDialog = userDialogs[i];
    dialogsForFrontend.push({ participants: [], messages: [], id: currentDialog._id.toString() });
    // достаем последнее сообщение диалога
    const lastMessage = await Message.findById(userDialogs[i]['lastMessage']);

    if (!lastMessage) {
      return res.status(400).send(ERROR_MESSAGES.MESSAGES_NOT_FOUND);
    }

    dialogsForFrontend[i]['messages'] = [normalizeMessage(lastMessage)];

    // достаем ФИО собеседника и записываем туда же
    const toUserId = currentDialog.participants.filter(it => it.toString() !== userFromDb._id.toString())[0];

    const toUser = await User.findById(toUserId);

    if (!toUser) {
      return res.status(400).send(ERROR_MESSAGES.RECEIVER_NOT_FOUND);
    }

    dialogsForFrontend[i]['participants'].push({
      ...extractUserInfoFromDbEntity(toUser),
      online: WebSocketModule.isClientOnline(toUser._id.toString()),
    });
  }

  return res.status(200).send(dialogsForFrontend);
};
