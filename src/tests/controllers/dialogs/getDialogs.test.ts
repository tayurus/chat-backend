import { clearDB, connectToDB, disconnectFromDB } from '../../../config/database';
import { WebSocketModule } from '../../../utils/websocketModule';
import {
  getTokenForCookie,
  REGISTER_SUCCESS_INPUT_DATA,
  REGISTER_SUCCESS_INPUT_DATA2,
  RegisteredUserForTest,
  registerUserForTest,
  SEND_MESSAGE_BODY_PARAMS_WITHOUT_DIALOG_ID,
  writeMessageForTest,
} from '../../helpers';
import { describe } from '@jest/globals';
import request from 'supertest';
import { app } from '../../../app';
import { BASE_ROUTES, DIALOG_ROUTES } from '../../../types/backendAndFrontendCommonTypes/routes';

let registeredUsers: Record<string, RegisteredUserForTest> = {};

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
    request(app)
      // сразу запрашиваем список диалогов, никому ничего не написав
      .get(`${BASE_ROUTES.DIALOG}${DIALOG_ROUTES.GET_DIALOGS}`)
      .set('Cookie', getTokenForCookie({ registeredUsers, email: REGISTER_SUCCESS_INPUT_DATA.email }))
      .send()
      .expect(200)
      .end((err, res) => {
        if (err) {
          console.log('err = ', err);
        }

        //  должен быть один диалог
        expect(res.body.length).toBe(0);

        done();
      });
  });

  test('успешный сценарий - диалоги есть', done => {
    writeMessageForTest({
      fromUser: registeredUsers[REGISTER_SUCCESS_INPUT_DATA.email],
      toUser: registeredUsers[REGISTER_SUCCESS_INPUT_DATA2.email],
      message: 'test',
    }).then(() => {
      request(app)
        // сразу запрашиваем список диалогов, никому ничего не написав
        .get(`${BASE_ROUTES.DIALOG}${DIALOG_ROUTES.GET_DIALOGS}`)
        .set('Cookie', getTokenForCookie({ registeredUsers, email: REGISTER_SUCCESS_INPUT_DATA.email }))
        .send()
        .expect(200)
        .end((err, res) => {
          if (err) {
            console.log('err = ', err);
          }

          // список диалогов должен быть пустым
          expect(res.body.length).toBe(1);

          done();
        });
    });
  });
});

// успешный сценарий - диалоги есть
// пишем одному человеку
// запрашиваем список диалогов
// должен быть один диалог
// в его participants должнен быть данный пользователь, и тот, кому написали
