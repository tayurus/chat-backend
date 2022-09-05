import { clearDB, connectToDB, disconnectFromDB } from '../../../config/database';
import { LoginUserBodyParams } from '../../../types/backendParams';
import { describe } from '@jest/globals';
import request from 'supertest';
import { app } from '../../../app';
import { BASE_ROUTES, USER_ROUTES } from '../../../types/backendAndFrontendCommonTypes/routes';
import { ERROR_MESSAGES } from '../../../utils/errorMessages';
import { LOGIN_SUCCESS_INPUT_DATA, REGISTER_SUCCESS_INPUT_DATA, registerUserForTest } from '../../helpers';
import { WebSocketModule } from '../../../utils/websocketModule';

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
        expect(res.headers['set-cookie'][0].startsWith('token=')).toBe(true);

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
