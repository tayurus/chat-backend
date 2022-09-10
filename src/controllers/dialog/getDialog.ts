import { TypedRequestBody, TypedResponse } from 'src/types/express';
import { GetDialogQueryParams, GetDialogUrlParams } from 'src/types/backendParams';
import { Message } from 'src/model/message';
import { ERROR_MESSAGES } from 'src/utils/errorMessages';
import { FoundedMessage, GetDialogResponse, UserInfoInDialog } from 'src/types/backendResponses';
import { normalizeMessage } from 'src/utils/message';
import { Dialog } from 'src/model/dialog';
import { getAllDialogParticipantsExceptCurrentUser } from 'src/utils/dialog';
import { User } from 'src/model/user';
import { extractUserInfoFromDbEntity } from 'src/utils/user';
import { WebSocketModule } from 'src/utils/websocketModule';
import mongoose from 'mongoose';

export const getDialog = async (req: TypedRequestBody<{}, GetDialogQueryParams, GetDialogUrlParams>, res: TypedResponse<GetDialogResponse>) => {
  // достаем id диалога, сдвиг и кол-во соообщений из query
  const { offset, limit } = req.query;
  const { dialogId } = req.params;

  if (!dialogId || !offset || !limit || isNaN(+offset) || isNaN(+limit) || !mongoose.Types.ObjectId.isValid(dialogId)) {
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
