import { SendMessageBodyParams } from '../../types/backendParams';
import request from 'supertest';
import { app } from '../../app';
import { BASE_ROUTES, MESSAGE_ROUTES } from '../../types/backendAndFrontendCommonTypes/routes';
import { getTokenForCookieForTest } from './getTokenForCookieForTest';
import { RegisteredUserForTest } from '../typesForTests';
import { REGISTER_SUCCESS_INPUT_DATA } from '../constantsForTests';

export async function writeMessageForTest(params: {
  fromUser: RegisteredUserForTest;
  toUser?: RegisteredUserForTest;
  message: string;
  dialogId?: string;
}): Promise<request.Response> {
  const { fromUser, toUser, message, dialogId } = params;
  const messageForSend: SendMessageBodyParams = {
    message,
    toUserId: toUser?.id,
    dialogId,
  };
  return await request(app)
    .post(`${BASE_ROUTES.MESSAGE}${MESSAGE_ROUTES.SEND}`)
    .set('Cookie', getTokenForCookieForTest({ registeredUsers: { [fromUser.email]: fromUser }, email: REGISTER_SUCCESS_INPUT_DATA.email }))
    // отправляем сообщение
    .send(messageForSend)
    .expect(200)
    .then(async function (res) {
      return res;
    })
    .catch(err => {
      if (err) {
        console.log('writeMessageForTest err = ', err);
      }
      return err;
    });
}
