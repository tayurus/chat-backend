import request from 'supertest';
import { app } from '../app';
import { BASE_ROUTES, MESSAGE_ROUTES, USER_ROUTES } from '../types/backendAndFrontendCommonTypes/routes';
import { LoginUserBodyParams, RegisterUserBodyParams, SendMessageBodyParams } from '../types/backendParams';
import setCookierParser from 'set-cookie-parser';
import { RegisterUserSuccessResponse } from '../types/backendResponses';

export const REGISTER_SUCCESS_INPUT_DATA: RegisterUserBodyParams = { first_name: 'Yuriy', last_name: 'Tatar', email: 'sooqa@mail.ru', password: '1' };
export const REGISTER_SUCCESS_INPUT_DATA2: RegisterUserBodyParams = {
  first_name: 'Sergio',
  last_name: 'Koval',
  email: 'serg@zerg.ru',
  password: '2',
};

export const LOGIN_SUCCESS_INPUT_DATA: LoginUserBodyParams = {
  email: REGISTER_SUCCESS_INPUT_DATA.email,
  password: REGISTER_SUCCESS_INPUT_DATA.password,
};

export type RegisteredUserForTest = RegisterUserSuccessResponse & { token: string };

export const SEND_MESSAGE_BODY_PARAMS_WITHOUT_DIALOG_ID: SendMessageBodyParams = {
  message: 'hello!',
  dialogId: undefined,
  toUserId: '1',
};

export async function registerUserForTest(users = [REGISTER_SUCCESS_INPUT_DATA]) {
  const registeredUsers: Record<string, RegisteredUserForTest> = {};
  for (let i = 0; i < users.length; i++) {
    await request(app)
      .post(`${BASE_ROUTES.USER}${USER_ROUTES.REGISTER}`)
      .send(users[i])
      .then(function (res) {
        registeredUsers[users[i].email] = Object.assign({}, res.body);
        registeredUsers[users[i].email]['token'] = setCookierParser.parse(res.headers['set-cookie'][0])[0].value;
      })
      .catch(err => {
        console.error('err while register = ', err);
      });
  }

  return registeredUsers;
}

export async function writeMessageForTest(params: {
  fromUser: RegisteredUserForTest;
  toUser: RegisteredUserForTest;
  message: string;
  dialogId?: string;
}) {
  const { fromUser, toUser, message, dialogId } = params;
  const messageForSend: SendMessageBodyParams = {
    message,
    toUserId: toUser.id,
    dialogId,
  };
  await request(app)
    .post(`${BASE_ROUTES.MESSAGE}${MESSAGE_ROUTES.SEND}`)
    .set('Cookie', getTokenForCookie({ registeredUsers: { [fromUser.email]: fromUser }, email: REGISTER_SUCCESS_INPUT_DATA.email }))
    // отправляем сообщение
    .send(messageForSend)
    .expect(200)
    .then(async function (res) {
      return true;
    })
    .catch(err => {
      if (err) {
        console.log('writeMessageForTest err = ', err);
      }
    });
}

export function getTokenForCookie({ registeredUsers, email }: { registeredUsers: Record<string, RegisteredUserForTest>; email: string }) {
  return [`token=${registeredUsers[email].token}`];
}
