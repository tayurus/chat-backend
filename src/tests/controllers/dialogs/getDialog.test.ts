import { clearDB, connectToDB, disconnectFromDB } from '../../../config/database';
import { registerUserForTest } from '../../helpersForTests/registerUserForTest';
import { REGISTER_SUCCESS_INPUT_DATA, REGISTER_SUCCESS_INPUT_DATA2, SEND_MESSAGE_BODY_PARAMS_WITHOUT_DIALOG_ID } from '../../constantsForTests';
import { WebSocketModule } from '../../../utils/websocketModule';
import { RegisteredUsersForTest } from '../../helpersForTests/getTokenForCookieForTest';
import { describe } from '@jest/globals';
import { writeMessageForTest } from '../../helpersForTests/writeMessageForTest';
import { SendMessageSuccessResponse } from '../../../types/backendResponses';
import { SendMessageBodyParams } from '../../../types/backendParams';

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
      writeMessageForTest({
        fromUser: registeredUsers[REGISTER_SUCCESS_INPUT_DATA.email],
        message: SECOND_MESSAGE_TEXT,
        dialogId,
      }).then(async res => {});
    });
  });
});

// успешный сценарий - диалог есть
// пишем сообщение
// и еще одно
// запрашиваем диалог с этим кеком с отступом 0 и кол-вом 1
// должно придти первое сообщение
// запрашиваем диалог с этим кеком уже с отступом 1 и кол-вом 1
// должно придти второе сообщение

// неуспешный сценарий - диалога нет
// запрашиваем несуществующий диалог
// придет ошибка
