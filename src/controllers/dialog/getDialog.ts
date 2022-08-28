import { TypedRequestBody, TypedResponse } from '@/types/express';
import { GetDialogQueryParams, GetDialogUrlParams } from '@/types/backendParams';
import { Message } from '@/model/message';
import { ERROR_MESSAGES } from '@utils/errorMessages';
import { FoundedMessage, GetDialogResponse, UserInfoInDialog } from '@/types/backendResponses';
import { normalizeMessage } from '@utils/message';
import { Dialog } from '@/model/dialog';
import { getAllDialogParticipantsExceptCurrentUser } from '@utils/dialog';
import { User } from '@/model/user';
import { extractUserInfoFromDbEntity } from '@utils/user';
import { WebSocketModule } from '@utils/websocketModule';

export const getDialog = async (req: TypedRequestBody<{}, GetDialogQueryParams, GetDialogUrlParams>, res: TypedResponse<GetDialogResponse>) => {
  // достаем id диалога, сдвиг и кол-во соообщений из query
  const { offset, limit } = req.query;
  const { dialogId } = req.params;

  if (!dialogId || !offset || !limit || isNaN(+offset) || isNaN(+limit)) {
    return res.status(400).send(ERROR_MESSAGES.INVALID_DATA);
  }

  // достаем нужное кол-во сообщений с нужным сдвигом
  const messages = await Message.find({ dialogId })
    .skip(+offset)
    .limit(+limit);

  const normalizedMessages: FoundedMessage[] = messages.map(normalizeMessage);

  // достанем диалог, чтобы достать из него ФИО, с кем общается данный пользователь
  const currentDialog = await Dialog.findById(dialogId);
  if (!currentDialog) {
    return res.status(400).send(ERROR_MESSAGES.DIALOG_NOT_FOUND);
  }

  const toUserId = getAllDialogParticipantsExceptCurrentUser(currentDialog.participants, req.user.user_id);
  const to = await User.findById(toUserId);

  const participantsInfo: UserInfoInDialog[] = [];
  for (let i = 0; i < currentDialog.participants.length; i++) {
    const participantDbInfo = await User.findById(currentDialog.participants[i]);
    if (participantDbInfo) {
      participantsInfo.push({
        ...extractUserInfoFromDbEntity(participantDbInfo),
        online: WebSocketModule.isClientOnline(participantDbInfo._id.toString()),
      });
    }
  }

  if (!to) {
    return res.status(400).send(ERROR_MESSAGES.RECEIVER_NOT_FOUND);
  }
  const response: GetDialogResponse = {
    id: dialogId,
    messages: normalizedMessages,
    participants: participantsInfo,
  };

  return res.status(200).send(response);
};
