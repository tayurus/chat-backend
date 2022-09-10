import { clearDB, connectToDB, disconnectFromDB } from "src/config/database";
import { registerUserForTest } from "src/tests/helpersForTests/registerUserForTest";
import { REGISTER_SUCCESS_INPUT_DATA, REGISTER_SUCCESS_INPUT_DATA2 } from "src/tests/constantsForTests";
import { WebSocketModule } from "src/utils/websocketModule";
import { RegisteredUsersForTest } from "src/tests/helpersForTests/getTokenForCookieForTest";
import { describe } from "@jest/globals";
import { writeMessageForTest } from "src/tests/helpersForTests/writeMessageForTest";
import { GetDialogSuccessResponse, SendMessageSuccessResponse } from "src/types/backendResponses";
import { getDialogForTest } from "src/tests/helpersForTests/getDialogForTest";
import { SendMessageBodyParams } from "src/types/backendParams";
import { ERROR_MESSAGES } from "src/utils/errorMessages";

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

const FIRST_MESSAGE_TEXT = 'yo';
const SECOND_MESSAGE_TEXT = 'sup';
let dialogId = undefined;

describe('Получение диалога по id', () => {
  test('Успешный сценарий - диалог есть', done => {
    // пишем сообщение
    writeMessageForTest({
      fromUser: registeredUsers[REGISTER_SUCCESS_INPUT_DATA.email],
      message: FIRST_MESSAGE_TEXT,
      toUser: registeredUsers[REGISTER_SUCCESS_INPUT_DATA2.email],
    }).then(async res => {
      const bodyResponse: SendMessageSuccessResponse = res.body;
      dialogId = bodyResponse.dialogId;

      // и еще одно
      const writeMessageRes = await writeMessageForTest({
        fromUser: registeredUsers[REGISTER_SUCCESS_INPUT_DATA.email],
        message: SECOND_MESSAGE_TEXT,
        dialogId,
      });

      const writeMessageResBody: SendMessageSuccessResponse = writeMessageRes.body;

      // запрашиваем диалог с этим кеком с отступом 0 и кол-вом 1
      const getDialogRes = await getDialogForTest({
        registeredUsers,
        expectedStatus: 200,
        requestUrlParams: { dialogId: writeMessageResBody.dialogId },
        requestQueryParams: { limit: '1', offset: '0' },
      });

      const getDialogResBody: GetDialogSuccessResponse = getDialogRes.body;
      // должно придти первое сообщение
      expect(getDialogResBody.messages.length).toBe(1);
      expect(getDialogResBody.messages[0].content).toBe(FIRST_MESSAGE_TEXT);
      // запрашиваем диалог с этим кеком уже с отступом 1 и кол-вом 1
      const getDialogResSecond = await getDialogForTest({
        registeredUsers,
        expectedStatus: 200,
        requestUrlParams: { dialogId: writeMessageResBody.dialogId },
        requestQueryParams: { limit: '1', offset: '1' },
      });
      const getDialogResBodySecond: GetDialogSuccessResponse = getDialogResSecond.body;
      // должно придти второе сообщение
      expect(getDialogResBodySecond.messages.length).toBe(1);
      expect(getDialogResBodySecond.messages[0].content).toBe(SECOND_MESSAGE_TEXT);

      done();
    });
  });

  test('неуспешный сценарий - диалога нет', done => {
    getDialogForTest({
      registeredUsers,
      expectedStatus: 400,
      requestUrlParams: { dialogId: '1488228' },
      requestQueryParams: { limit: '1', offset: '0' },
    }).then(getDialogRes => {
      expect(getDialogRes.text).toBe(ERROR_MESSAGES.INVALID_DATA);

      done();
    });
  });
});
