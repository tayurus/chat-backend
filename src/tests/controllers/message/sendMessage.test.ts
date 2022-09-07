import request from 'supertest';
import { app } from '../../../app';
import { describe, test } from '@jest/globals';
import { clearDB, connectToDB, disconnectFromDB } from '../../../config/database';
import { WebSocketModule } from '../../../utils/websocketModule';
import { BASE_ROUTES, MESSAGE_ROUTES } from '../../../types/backendAndFrontendCommonTypes/routes';
import { SendMessageBodyParams } from '../../../types/backendParams';
import { SendMessageSuccessResponse } from '../../../types/backendResponses';
import { Dialog } from '../../../model/dialog';
import { Message } from '../../../model/message';
import { ERROR_MESSAGES } from '../../../utils/errorMessages';
import { RegisteredUserForTest } from '../../typesForTests';
import { registerUserForTest } from '../../helpersForTests/registerUserForTest';
import { REGISTER_SUCCESS_INPUT_DATA, REGISTER_SUCCESS_INPUT_DATA2, SEND_MESSAGE_BODY_PARAMS_WITHOUT_DIALOG_ID } from '../../constantsForTests';
import { getTokenForCookieForTest } from '../../helpersForTests/getTokenForCookieForTest';
import { writeMessageForTest } from '../../helpersForTests/writeMessageForTest';

let registeredUsers: Record<string, RegisteredUserForTest> = {};

const SEND_MESSAGE_BODY_PARAMS_WITH_DIALOG_ID: SendMessageBodyParams = {
  message: 'hello!',
  dialogId: undefined,
  toUserId: '1',
};

beforeAll(async () => await connectToDB());
beforeEach(done => {
  registerUserForTest([REGISTER_SUCCESS_INPUT_DATA, REGISTER_SUCCESS_INPUT_DATA2]).then(registeredUsersForTest => {
    registeredUsers = Object.assign({}, registeredUsersForTest);
    SEND_MESSAGE_BODY_PARAMS_WITHOUT_DIALOG_ID.toUserId = registeredUsers[REGISTER_SUCCESS_INPUT_DATA2.email].id;
    WebSocketModule.server.close(() => done());
  });
});
afterEach(async () => await clearDB());
afterAll(async () => {
  await disconnectFromDB();
});

describe('Отправка сообщения', () => {
  test('успешный сценарий - диалога еще нет', done => {
    writeMessageForTest({
      fromUser: registeredUsers[REGISTER_SUCCESS_INPUT_DATA.email],
      message: SEND_MESSAGE_BODY_PARAMS_WITHOUT_DIALOG_ID.message,
      toUser: registeredUsers[REGISTER_SUCCESS_INPUT_DATA2.email],
    }).then(async res => {
      const bodyResponse: SendMessageSuccessResponse = res.body;
      // в ответ придет id диалога
      expect(bodyResponse.dialogId).not.toBe(undefined);
      // проверим, что в базе такой диалог есть
      const createdDialog = await Dialog.findById(bodyResponse.dialogId);
      expect(createdDialog!._id).not.toBe(undefined);
      expect(createdDialog!.participants.length).toBe(2);

      // проверим, что в базе есть сообщение с таким dialogId
      const createdMessage = await Message.find({ dialogId: createdDialog!._id });
      expect(createdMessage[0].content).toBe(SEND_MESSAGE_BODY_PARAMS_WITHOUT_DIALOG_ID.message);
      done();
    });
  });

  test('успешный сценарий - диалог есть', done => {
    request(app)
      .post(`${BASE_ROUTES.MESSAGE}${MESSAGE_ROUTES.SEND}`)
      .set('Cookie', getTokenForCookieForTest({ registeredUsers, email: REGISTER_SUCCESS_INPUT_DATA.email }))
      // отправляем сообщение, чтобы создать диалог
      .send(SEND_MESSAGE_BODY_PARAMS_WITHOUT_DIALOG_ID)
      .expect(200)
      .end(async function (err, res) {
        if (err) {
          console.log('err = ', err);
        }

        const bodyResponse: SendMessageSuccessResponse = res.body;
        SEND_MESSAGE_BODY_PARAMS_WITH_DIALOG_ID.dialogId = bodyResponse.dialogId;

        // отправляем еще одно сообщение в этот диалог
        request(app)
          .post(`${BASE_ROUTES.MESSAGE}${MESSAGE_ROUTES.SEND}`)
          .set('Cookie', getTokenForCookieForTest({ registeredUsers, email: REGISTER_SUCCESS_INPUT_DATA.email }))
          // отправляем сообщение, чтобы создать диалог
          .send(SEND_MESSAGE_BODY_PARAMS_WITH_DIALOG_ID)
          .expect(200)
          .end(async function (err, res) {
            if (err) {
              console.log('err = ', err);
            }
            // в ответ придет id диалога
            expect(bodyResponse.dialogId).not.toBe(undefined);
            // проверим, что в базе такой диалог есть
            const createdDialog = await Dialog.findById(bodyResponse.dialogId);
            expect(createdDialog!._id).not.toBe(undefined);
            expect(createdDialog!.participants.length).toBe(2);

            // проверим, что в базе есть  2 сообщения с таким dialogId
            const createdMessage = await Message.find({ dialogId: createdDialog!._id });
            expect(createdMessage.length).toBe(2);
            done();
          });
      });
  });

  test('неуспешный сценарий - пустое сообщение (для нового диалога)', done => {
    request(app)
      .post(`${BASE_ROUTES.MESSAGE}${MESSAGE_ROUTES.SEND}`)
      .set('Cookie', getTokenForCookieForTest({ registeredUsers, email: REGISTER_SUCCESS_INPUT_DATA.email }))
      // отправляем сообщение
      .send({ ...SEND_MESSAGE_BODY_PARAMS_WITHOUT_DIALOG_ID, message: '' })
      .expect(400)
      .end(async function (err, res) {
        if (err) {
          console.log('err = ', err);
        }

        // в ответ придет ошибка
        expect(res.text).toBe(ERROR_MESSAGES.TEXT_MESSAGE_NOT_FOUND);

        // в базе нет диалогов
        const dialogs = await Dialog.find({});
        expect(dialogs.length).toBe(0);

        // в базе нет сообщений
        const messages = await Message.find({});
        expect(messages.length).toBe(0);
        done();
      });
  });

  test('неуспешный сценарий - получатель не найден', done => {
    request(app)
      .post(`${BASE_ROUTES.MESSAGE}${MESSAGE_ROUTES.SEND}`)
      .set('Cookie', getTokenForCookieForTest({ registeredUsers, email: REGISTER_SUCCESS_INPUT_DATA.email }))
      // // отправляем сообщение несуществующему получателю
      .send({ ...SEND_MESSAGE_BODY_PARAMS_WITHOUT_DIALOG_ID, toUserId: '1488228' })
      .expect(400)
      .end(async function (err, res) {
        if (err) {
          console.log('err = ', err);
        }

        // в ответ придет ошибка
        expect(res.text).toBe(ERROR_MESSAGES.SEND_MESSAGE_ERROR);

        // в базе нет диалогов
        const dialogs = await Dialog.find({});
        expect(dialogs.length).toBe(0);

        // в базе нет сообщений
        const messages = await Message.find({});
        expect(messages.length).toBe(0);
        done();
      });
  });

  test('неуспешный сценарий - диалог не найден', done => {
    request(app)
      .post(`${BASE_ROUTES.MESSAGE}${MESSAGE_ROUTES.SEND}`)
      .set('Cookie', getTokenForCookieForTest({ registeredUsers, email: REGISTER_SUCCESS_INPUT_DATA.email }))
      // // отправляем сообщение несуществующему получателю
      .send({ ...SEND_MESSAGE_BODY_PARAMS_WITHOUT_DIALOG_ID, dialogId: '1488228' })
      .expect(400)
      .end(async function (err, res) {
        if (err) {
          console.log('err = ', err);
        }

        // в ответ придет ошибка
        expect(res.text).toBe(ERROR_MESSAGES.SEND_MESSAGE_ERROR);

        // в базе нет диалогов
        const dialogs = await Dialog.find({});
        expect(dialogs.length).toBe(0);

        // в базе нет сообщений
        const messages = await Message.find({});
        expect(messages.length).toBe(0);
        done();
      });
  });
});
