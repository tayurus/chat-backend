import { clearDB, connectToDB, disconnectFromDB } from '../../../config/database';
import { LoginUserBodyParams, RegisterUserBodyParams } from '../../../types/backendParams';
import { describe } from '@jest/globals';
import request from 'supertest';
import { app } from '../../../app';
import { BASE_ROUTES, USER_ROUTES } from '../../../types/backendAndFrontendCommonTypes/routes';
import { ERROR_MESSAGES } from '../../../utils/errorMessages';

beforeAll(async () => await connectToDB());
afterEach(async () => await clearDB());
afterAll(async () => {
  await disconnectFromDB();
});

const REGISTER_SUCCESS_INPUT_DATA: RegisterUserBodyParams = { first_name: 'Юрец', last_name: 'Татар', email: 'sooqa@mail.ru', password: '1' };
const LOGIN_SUCCESS_INPUT_DATA: LoginUserBodyParams = { email: REGISTER_SUCCESS_INPUT_DATA.email, password: REGISTER_SUCCESS_INPUT_DATA.password };
const LOGIN_PARTIAL_INPUT_DATA: Partial<LoginUserBodyParams> = { email: 'test@mail.ru' };

describe('Авторизация', () => {
  test('---- успешный сценарий ----', done => {
    // // регаемся
    request(app)
      .post(`${BASE_ROUTES.USER}${USER_ROUTES.REGISTER}`)
      .send(REGISTER_SUCCESS_INPUT_DATA)
      .expect(201)
      .end(async function (err, res) {
        if (err) {
          return done(err);
        }
        // логинимся
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
  });

  test('---- неуспешный сценарий - неверные данные ----', done => {
    // // логинимся с неправильными данными (мы не зарегались)
    request(app)
      .post(`${BASE_ROUTES.USER}${USER_ROUTES.LOGIN}`)
      .send(LOGIN_SUCCESS_INPUT_DATA)
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
