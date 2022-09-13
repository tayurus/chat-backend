import { SendMessageBodyParams } from 'src/types/backendParams';
import request from 'supertest';
import { app } from 'src/app';
import { BASE_ROUTES, MESSAGE_ROUTES } from 'src/types/backendAndFrontendCommonTypes/routes';
import { getTokenForCookieForTest, RegisteredUsersForTest } from './getTokenForCookieForTest';
import { RegisteredUserForTest } from 'src/tests/typesForTests';

export async function writeMessageForTest(params: {
  registeredUsers: RegisteredUsersForTest;
  fromUser: RegisteredUserForTest;
  toUser?: RegisteredUserForTest;
  message: string;
  dialogId?: string;
  expectedStatus?: number;
}): Promise<request.Response> {
  const { registeredUsers, fromUser, toUser, message, dialogId, expectedStatus = 200 } = params;
  const messageForSend: SendMessageBodyParams = {
    message,
    toUserId: toUser?.id,
    dialogId,
  };
  return await request(app)
    .post(`${BASE_ROUTES.MESSAGE}${MESSAGE_ROUTES.SEND}`)
    .set('Cookie', getTokenForCookieForTest({ registeredUsers, email: fromUser.email }))
    // отправляем сообщение
    .send(messageForSend)
    .expect(expectedStatus)
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
