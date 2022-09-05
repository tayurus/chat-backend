import request from 'supertest';
import { app } from '../../../app';
import { describe, test } from '@jest/globals';
import { clearDB, connectToDB, disconnectFromDB } from '../../../config/database';
import { RegisteredUserForTest, registerUserForTest } from '../../helpers';
import { WebSocketModule } from '../../../utils/websocketModule';
import { REGISTER_SUCCESS_INPUT_DATA, REGISTER_SUCCESS_INPUT_DATA2 } from '../../helpers';
import { BASE_ROUTES, MESSAGE_ROUTES } from '../../../types/backendAndFrontendCommonTypes/routes';
import { SendMessageBodyParams } from '../../../types/backendParams';
import { SendMessageSuccessResponse } from '../../../types/backendResponses';

let registeredUsers: Record<string, RegisteredUserForTest> = {};

beforeAll(async () => await connectToDB());
beforeEach(done => {
  registerUserForTest([REGISTER_SUCCESS_INPUT_DATA, REGISTER_SUCCESS_INPUT_DATA2]).then(authTokensFromBackend => {
    registeredUsers = Object.assign({}, authTokensFromBackend);
    WebSocketModule.server.close(() => done());
  });
});
afterEach(async () => await clearDB());
afterAll(async () => {
  await disconnectFromDB();
});

const SEND_MESSAGE_BODY_PARAMS_WITHOUT_DIALOG_ID: SendMessageBodyParams = {
  message: 'hello!',
  dialogId: undefined,
  toUserId: '1',
};

describe('Отправка сообщения', () => {
  test('успешный сценарий - диалога еще нет', done => {
    request(app)
      .post(`${BASE_ROUTES.MESSAGE}${MESSAGE_ROUTES.SEND}`)
      .set('Cookie', [`token=${registeredUsers[REGISTER_SUCCESS_INPUT_DATA.email]}`])
      // отправляем сообщение
      .send(SEND_MESSAGE_BODY_PARAMS_WITHOUT_DIALOG_ID)
      .expect(200)
      .end(function (err, res) {
        if (err) {
          console.log('err = ', err);
        }
        const bodyResponse: SendMessageSuccessResponse = res.body;
        console.log('registeredUsers = ', registeredUsers);
        console.log('bodyResponse = ', bodyResponse);
        // в ответ придет id диалога
        expect(bodyResponse.dialogId).not.toBe(undefined);

        done();
      });
  });
});

// успешный сценарий - диалога еще нет
// отправляем сообщение
// в ответ придет id диалога
// проверим, что в базе такой диалог есть
// проверим, что в базе есть сообщение с таким dialogId

// успешный сценарий - диалог есть
// отправляем сообщение
// в ответ придет id диалога
// проверим, что в базе есть как минимум 2 сообщения с таким dialogId

// неуспешный сценарий - пустое сообщение (для нового диалога)
// отправляем сообщение
// в ответ придет ошибка
// в базе нет диалогов
// в базе нет сообщений

// неуспешный сценарий - не передали токен
// отправляем сообщение, не указав токен
// в ответ придет ошибка
// в базе нет диалогов
// в базе нет сообщений

// неуспешный сценарий - получатель не найден
// отправляем сообщение несуществующему получателю
// в ответ придет ошибка
// в базе нет диалогов
// в базе нет сообщений
