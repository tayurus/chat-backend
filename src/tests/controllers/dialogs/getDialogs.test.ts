import { clearDB, connectToDB, disconnectFromDB } from '../../../config/database';
import { WebSocketModule } from '../../../utils/websocketModule';
import { describe } from '@jest/globals';
import { GetDialogsSuccessResponse } from '../../../types/backendResponses';
import { registerUserForTest } from '../../helpersForTests/registerUserForTest';
import { REGISTER_SUCCESS_INPUT_DATA, REGISTER_SUCCESS_INPUT_DATA2, SEND_MESSAGE_BODY_PARAMS_WITHOUT_DIALOG_ID } from '../../constantsForTests';
import { RegisteredUsersForTest } from '../../helpersForTests/getTokenForCookieForTest';
import { writeMessageForTest } from '../../helpersForTests/writeMessageForTest';
import { getDialogsForTest } from '../../helpersForTests/getDialogsForTest';

let registeredUsers: RegisteredUsersForTest = {};

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
