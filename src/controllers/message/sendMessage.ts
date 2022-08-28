import { Dialog } from '@/model/dialog';
import { User } from '@/model/user';
import { Message } from '@/model/message';
import { TypedRequestBody, TypedResponse } from '@/types/express';
import { SendMessageBodyParams } from '@/types/backendParams';
import { FoundedMessage, SendMessageResponse, WebSocketMessage, WsNewMessageResponse } from '@/types/backendResponses';
import { ERROR_MESSAGES } from '@utils/errorMessages';
import { WebSocketModule } from '@utils/websocketModule';
import { WebSocketsEvents } from '@/types/backendResponses';
import { normalizeMessage } from '@utils/message';
import { extractUserInfoFromDbEntity } from '@utils/user';

export const sendMessage = async (req: TypedRequestBody<SendMessageBodyParams>, res: TypedResponse<SendMessageResponse>) => {
  try {
    const { message, toUserId, dialogId } = req.body;
    // @ts-ignore
    const { user: fromUser } = req;
    if (!message) {
      return res.status(400).send(ERROR_MESSAGES.TEXT_MESSAGE_NOT_FOUND);
    }

    const newMessageWsResponse: WebSocketMessage<WsNewMessageResponse> = {
      type: WebSocketsEvents.NEW_MESSAGE,
      data: { dialogId: dialogId || '', message: {} as FoundedMessage },
    };

    const createdMessage = await Message.create({
      from: fromUser.user_id,
      content: message,
      datetime: +new Date(),
      dialogId,
    });

    let dialog;

    // обновляем или создаем диалог
    // если dialogId отсутствует
    if (!dialogId) {
      // создаем новый диалог и записываем туда участников
      dialog = await Dialog.create({
        participants: [fromUser.user_id, toUserId],
        lastMessage: createdMessage,
      });

      const toUser = await User.findById(toUserId);

      // созданному сообщению записываем id диалога
      await Message.findOneAndUpdate({ _id: createdMessage._id }, { dialogId: dialog._id });
      // в сообщение для веб-сокетов записываем айди диалога
      newMessageWsResponse['data']['dialogId'] = dialog._id.toString();
      // в сообщение для веб-сокетов записываем информацию об участниках диалога
      newMessageWsResponse['data']['participants'] = [
        { id: fromUser.user_id, first_name: fromUser.first_name, last_name: fromUser.last_name },
        extractUserInfoFromDbEntity(toUser!),
      ];

      // всем участникам тоже добавляем в массив диалогов id данного диалога
      await User.updateOne({ _id: fromUser.user_id }, { $push: { dialogs: dialog._id } });
      await User.updateOne({ _id: toUserId }, { $push: { dialogs: dialog._id } });
    } else {
      // достаем имеющийся диалог и перезаписываем в него id последнего сообщения
      dialog = await Dialog.findOneAndUpdate({ _id: dialogId }, { lastMessage: createdMessage._id });
    }

    if (!dialog) {
      return res.status(400).send(ERROR_MESSAGES.DIALOG_NOT_FOUND);
    }

    /*!!!! берем всех participants, кроме fromUser.user_id, и отправялем им по сокетам сообщение и айди-диалога  !!!!*/
    const allDialogParticipantsExceptCurrentUser = dialog.participants.filter(it => it !== fromUser.user_id);
    newMessageWsResponse['data']['message'] = normalizeMessage(createdMessage);

    allDialogParticipantsExceptCurrentUser.forEach(it => {
      if (WebSocketModule.clients[it]) {
        WebSocketModule.clients[it]?.send(JSON.stringify(newMessageWsResponse));
      }
    });

    // возвращаем id-диалога
    return res.status(200).send({ dialogId: dialog._id.toString() });
  } catch (e) {
    console.error(`ERROR_MESSAGES.SEND_MESSAGE_ERROR - ${JSON.stringify(e)}`);
    return res.status(400).send(ERROR_MESSAGES.SEND_MESSAGE_ERROR);
  }
};

module.exports = { sendMessage };
