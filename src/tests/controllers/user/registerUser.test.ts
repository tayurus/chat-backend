import { describe } from '@jest/globals';
import { clearDB, connectToDB, disconnectFromDB } from 'src/config/database';
import request from 'supertest';
import { app } from 'src/app';
import { BASE_ROUTES, USER_ROUTES } from 'src/types/backendAndFrontendCommonTypes/routes';
import { RegisterUserBodyParams } from 'src/types/backendParams';
import { ERROR_MESSAGES } from 'src/utils/errorMessages';
import { User } from 'src/model/user';
import { WebSocketModule } from 'src/utils/websocketModule';
import { REGISTER_SUCCESS_INPUT_DATA } from 'src/tests/constantsForTests';
import { responseHasTokenCookieForTest } from 'src/tests/helpersForTests/responseHasTokenCookieForTest';

beforeAll(async () => await connectToDB());
afterEach(done => {
  clearDB().then(() => {
    WebSocketModule.server.close(() => done());
  });
});
afterAll(async () => {
  await disconnectFromDB();
});

const REGISTER_FAILED_INPUT_DATA: Partial<RegisterUserBodyParams> = Object.assign({}, REGISTER_SUCCESS_INPUT_DATA);
delete REGISTER_FAILED_INPUT_DATA.first_name;

// тест регистрации пользователя
describe('Регистрация', () => {
  test('---- успешный сценарий ----', done => {
    // отправить запрос на регистрацию
    request(app)
      .post(`${BASE_ROUTES.USER}${USER_ROUTES.REGISTER}`)
      .send(REGISTER_SUCCESS_INPUT_DATA)
      .expect(201)
      .end(async function (err, res) {
        if (err) {
          return done(err);
        }
        // проверить, что в ответе есть объект с нужными полями
        expect(res.body.first_name).toBe(REGISTER_SUCCESS_INPUT_DATA.first_name);
        expect(res.body.last_name).toBe(REGISTER_SUCCESS_INPUT_DATA.last_name);
        expect(res.body.email).toBe(REGISTER_SUCCESS_INPUT_DATA.email);
        expect(res.body.id).not.toBe(undefined);

        // проверить, что в БД появился пользователя с таким же id
        const registeredUserInDb = await User.findById(res.body.id);
        expect(registeredUserInDb!._id.toString()).toBe(res.body.id);

        // проверить, что в куках пришел токен
        expect(responseHasTokenCookieForTest(res)).toBe(true);

        done();
      });
  });

  test('---- неуспешный сценарий (не все поля переданы) ----', done => {
    // отправить запрос на регистрацию
    request(app)
      .post(`${BASE_ROUTES.USER}${USER_ROUTES.REGISTER}`)
      .send(REGISTER_FAILED_INPUT_DATA)
      .expect(400)
      .end(async function (err, res) {
        if (err) {
          return done(err);
        }
        // проверить, что в ответе есть текст ошибки
        expect(res.text).toBe(ERROR_MESSAGES.ALL_INPUT_IS_REQUIRED);

        // в бд нет пользователя с таким email
        const registeredUserInDb = await User.find({ email: REGISTER_SUCCESS_INPUT_DATA.email });
        expect(registeredUserInDb.length).toBe(0);
        done();
      });
  });

  test('---- неуспешный сценарий (пользователь уже зареган) ----', done => {
    // отправить запрос на регистрацию
    request(app)
      .post(`${BASE_ROUTES.USER}${USER_ROUTES.REGISTER}`)
      .send(REGISTER_SUCCESS_INPUT_DATA)
      .expect(201)
      .end(function (err, res) {
        if (err) {
          return done(err);
        }
        request(app)
          .post(`${BASE_ROUTES.USER}${USER_ROUTES.REGISTER}`)
          .send(REGISTER_SUCCESS_INPUT_DATA)
          .expect(409)
          .end(async function (err, res) {
            if (err) {
              return done(err);
            }
            // проверить, что в ответе ошибка, что пользователь уже зареган
            expect(res.text).toBe(ERROR_MESSAGES.USER_ALREADY_EXISTS);

            // проверить, что в БД НЕ ПОЯВИЛСЯ ВТОРОЙ пользователь с таким же email
            const registeredUserInDb = await User.find({ email: REGISTER_SUCCESS_INPUT_DATA.email });
            expect(registeredUserInDb.length).toBe(1);

            done();
          });
      });
  });
});
