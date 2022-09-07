import { clearDB, connectToDB, disconnectFromDB } from '../../../config/database';
import { WebSocketModule } from '../../../utils/websocketModule';
import { describe } from '@jest/globals';
import request from 'supertest';
import { app } from '../../../app';
import { BASE_ROUTES, USER_ROUTES } from '../../../types/backendAndFrontendCommonTypes/routes';
import { ERROR_MESSAGES } from '../../../utils/errorMessages';
import { RegisteredUserForTest } from '../../typesForTests';
import { REGISTER_SUCCESS_INPUT_DATA, REGISTER_SUCCESS_INPUT_DATA2 } from '../../constantsForTests';
import { registerUserForTest } from '../../helpersForTests/registerUserForTest';
import { getTokenForCookieForTest } from '../../helpersForTests/getTokenForCookieForTest';

let registeredUsers: Record<string, RegisteredUserForTest> = {};

beforeAll(async () => await connectToDB());
beforeEach(done => {
  registerUserForTest([REGISTER_SUCCESS_INPUT_DATA, REGISTER_SUCCESS_INPUT_DATA2]).then(registeredUsersForTest => {
    registeredUsers = Object.assign({}, registeredUsersForTest);
    WebSocketModule.server.close(() => done());
  });
});
afterEach(async () => await clearDB());
afterAll(async () => {
  await disconnectFromDB();
});

describe('Поиск пользователей', () => {
  test('----- успешный сценарий - пользователь найден ------', done => {
    request(app)
      .get(`${BASE_ROUTES.USER}${USER_ROUTES.SEARCH_USERS}?query=${REGISTER_SUCCESS_INPUT_DATA.first_name}`)
      .set('Cookie', getTokenForCookieForTest({ registeredUsers, email: REGISTER_SUCCESS_INPUT_DATA.email }))
      .send()
      .expect(200)
      .end((err, res) => {
        if (err) {
          console.log('err = ', err);
        }

        expect(res.body.length).toBe(1);
        expect(res.body[0].last_name).toBe(REGISTER_SUCCESS_INPUT_DATA.last_name);

        done();
      });
  });

  test('----- успешный сценарий - пользователь не найден ------', done => {
    request(app)
      .get(`${BASE_ROUTES.USER}${USER_ROUTES.SEARCH_USERS}?query=${REGISTER_SUCCESS_INPUT_DATA.first_name + 'shit'}`)
      .set('Cookie', getTokenForCookieForTest({ registeredUsers, email: REGISTER_SUCCESS_INPUT_DATA.email }))
      .send()
      .expect(200)
      .end((err, res) => {
        if (err) {
          console.log('err = ', err);
        }

        expect(res.body.length).toBe(0);

        done();
      });
  });

  test('----- успешный сценарий - пользователь не найден ------', done => {
    request(app)
      .get(`${BASE_ROUTES.USER}${USER_ROUTES.SEARCH_USERS}?query=r`)
      .set('Cookie', getTokenForCookieForTest({ registeredUsers, email: REGISTER_SUCCESS_INPUT_DATA.email }))
      .send()
      .expect(200)
      .end((err, res) => {
        if (err) {
          console.log('err = ', err);
        }

        expect(res.body.length).toBe(2);

        done();
      });
  });

  test('----- неуспешный сценарий - отправили пустую строку ------', done => {
    request(app)
      .get(`${BASE_ROUTES.USER}${USER_ROUTES.SEARCH_USERS}?query=`)
      .set('Cookie', getTokenForCookieForTest({ registeredUsers, email: REGISTER_SUCCESS_INPUT_DATA.email }))
      .send()
      .expect(400)
      .end((err, res) => {
        if (err) {
          console.log('err = ', err);
        }

        expect(JSON.stringify(res.body)).toBe('{}');
        expect(res.text).toBe(ERROR_MESSAGES.QUERY_STRING_IS_EMTY);

        done();
      });
  });
  test('----- неуспешный сценарий - не передали токен ------', done => {
    request(app)
      .get(`${BASE_ROUTES.USER}${USER_ROUTES.SEARCH_USERS}?query=`)
      // НЕ ПЕРЕДАЕМ ТОКЕН
      // .set('Cookie', getTokenForCookie({ registeredUsers, email: REGISTER_SUCCESS_INPUT_DATA.email }))
      .send()
      .expect(403)
      .end((err, res) => {
        if (err) {
          console.log('err = ', err);
        }

        expect(JSON.stringify(res.body)).toBe('{}');
        expect(res.text).toBe(ERROR_MESSAGES.TOKEN_REQUIRED);

        done();
      });
  });
});
