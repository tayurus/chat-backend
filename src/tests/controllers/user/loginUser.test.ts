import { clearDB, connectToDB, disconnectFromDB } from 'src/config/database';
import { LoginUserBodyParams } from 'src/types/backendParams';
import { describe } from '@jest/globals';
import request from 'supertest';
import { app } from 'src/app';
import { BASE_ROUTES, USER_ROUTES } from 'src/types/backendAndFrontendCommonTypes/routes';
import { ERROR_MESSAGES } from 'src/utils/errorMessages';
import { WebSocketModule } from 'src/utils/websocketModule';
import { registerUserForTest } from 'src/tests/helpersForTests/registerUserForTest';
import { LOGIN_SUCCESS_INPUT_DATA, REGISTER_SUCCESS_INPUT_DATA } from 'src/tests/constantsForTests';
import { responseHasTokenCookieForTest } from 'src/tests/helpersForTests/responseHasTokenCookieForTest';

beforeAll(async () => await connectToDB());
beforeEach(done => {
  registerUserForTest().then(() => {
    WebSocketModule.server.close(() => done());
  });
});
afterEach(async () => await clearDB());
afterAll(async () => {
  await disconnectFromDB();
});

const LOGIN_PARTIAL_INPUT_DATA: Partial<LoginUserBodyParams> = { email: 'test@mail.ru' };
const LOGIN_INVALID_DATA: LoginUserBodyParams = { email: 'shit@mail.ru', password: '123' };

describe('Авторизация', () => {
  test('---- успешный сценарий ----', done => {
    request(app)
      .post(`${BASE_ROUTES.USER}${USER_ROUTES.LOGIN}`)
      .send(LOGIN_SUCCESS_INPUT_DATA)
      .expect(200)
      .end(function (err, res) {
        if (err) {
          return done(err);
        }

        // в ответе будет инфа о пользователе
        expect(res.body.email).toBe(REGISTER_SUCCESS_INPUT_DATA.email);
        expect(res.body.id).not.toBe(undefined);

        // проверить, что в куках пришел токен
        expect(responseHasTokenCookieForTest(res)).toBe(true);

        done();
      });
  });

  test('---- неуспешный сценарий - неверные данные ----', done => {
    // // логинимся с неправильными данными (мы не зарегались)
    request(app)
      .post(`${BASE_ROUTES.USER}${USER_ROUTES.LOGIN}`)
      .send(LOGIN_INVALID_DATA)
      .expect(404)
      .end(function (err, res) {
        if (err) {
          return done(err);
        }
        // в ответе будет текст ошибки
        expect(res.text).toBe(ERROR_MESSAGES.USER_NOT_FOUND);
        done();
      });
  });

  test('---- неуспешный сценарий - неполные данные ----', done => {
    // логинимся с неполными данными
    request(app)
      .post(`${BASE_ROUTES.USER}${USER_ROUTES.LOGIN}`)
      .send(LOGIN_PARTIAL_INPUT_DATA)
      .expect(400)
      .end(function (err, res) {
        if (err) {
          return done(err);
        }
        // в ответе будет текст ошибки
        expect(res.text).toBe(ERROR_MESSAGES.INVALID_DATA);
        done();
      });
  });
});
