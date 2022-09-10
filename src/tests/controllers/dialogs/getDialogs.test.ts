import { clearDB, connectToDB, disconnectFromDB } from 'src/config/database';
import { WebSocketModule } from 'src/utils/websocketModule';
import { describe } from '@jest/globals';
import { GetDialogsSuccessResponse } from 'src/types/backendResponses';
import { registerUserForTest } from '../../helpersForTests/registerUserForTest';
import { REGISTER_SUCCESS_INPUT_DATA, REGISTER_SUCCESS_INPUT_DATA2 } from '../../constantsForTests';
import { RegisteredUsersForTest } from '../../helpersForTests/getTokenForCookieForTest';
import { writeMessageForTest } from '../../helpersForTests/writeMessageForTest';
import { getDialogsForTest } from '../../helpersForTests/getDialogsForTest';
import { SendMessageBodyParams } from 'src/types/backendParams';

let registeredUsers: RegisteredUsersForTest = {};

const SEND_MESSAGE_BODY_PARAMS_WITHOUT_DIALOG_ID: SendMessageBodyParams = {
  message: 'hello!',
  dialogId: undefined,
  toUserId: '1',
};

beforeAll(async () => await connectToDB());
beforeEach(done => {
  registerUserForTest([REGISTER_SUCCESS_INPUT_DATA, REGISTER_SUCCESS_INPUT_DATA2]).then(authTokensFromBackend => {
    registeredUsers = Object.assign({}, authTokensFromBackend);
    SEND_MESSAGE_BODY_PARAMS_WITHOUT_DIALOG_ID.toUserId = registeredUsers[REGISTER_SUCCESS_INPUT_DATA2.email].id;
    WebSocketModule.server.close(() => done());
  });
});
afterEach(async () => await clearDB());
afterAll(async () => {
  await disconnectFromDB();
});

describe('Получение списка диалогов', () => {
  test('успешный сценарий - диалогов нет', done => {
    getDialogsForTest({ registeredUsers }).then(res => {
      const resBody: GetDialogsSuccessResponse = res.body;
      expect(resBody.length).toBe(0);
      done();
    });
  });
});

test('успешный сценарий - диалоги есть', done => {
  writeMessageForTest({
    fromUser: registeredUsers[REGISTER_SUCCESS_INPUT_DATA.email],
    toUser: registeredUsers[REGISTER_SUCCESS_INPUT_DATA2.email],
    message: 'test',
  }).then(() => {
    getDialogsForTest({ registeredUsers }).then(res => {
      const resBody: GetDialogsSuccessResponse = res.body;
      expect(resBody.length).toBe(1);
      done();
    });
  });
});
