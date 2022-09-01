import { describe } from '@jest/globals';
import { clearDB, connectToDB, disconnectFromDB } from '../../../config/database';
import request from 'supertest';
import { app } from '../../../app';
import { BASE_ROUTES, USER_ROUTES } from '../../../types/backendAndFrontendCommonTypes/routes';
import { RegisterUserBodyParams } from '../../../types/backendParams';
import { ERROR_MESSAGES } from '../../../utils/errorMessages';
import { User } from '../../../model/user';

beforeAll(async () => await connectToDB());
afterEach(async () => await clearDB());
afterAll(async () => await disconnectFromDB());

const SUCCESS_INPUT_DATA: RegisterUserBodyParams = { first_name: 'Юрец', last_name: 'Татар', email: 'sooqa@mail.ru', password: '1' };

// тест регистрации пользователя
describe('Регистрация', () => {
  test('---- успешный сценарий ----', done => {
    // отправить запрос на регистрацию
    request(app)
      .post(`${BASE_ROUTES.USER}/${USER_ROUTES.REGISTER}`)
      .send(SUCCESS_INPUT_DATA)
      .expect(200)
      .end(async function (err, res) {
        // проверить, что в ответе есть объект с нужными полями
        expect(res.body.first_name).toBe(SUCCESS_INPUT_DATA.first_name);
        expect(res.body.last_name).toBe(SUCCESS_INPUT_DATA.last_name);
        expect(res.body.email).toBe(SUCCESS_INPUT_DATA.email);
        expect(res.body.id).not.toBe(undefined);

        // проверить, что в БД появился пользователя с таким же id
        const registeredUserInDb = await User.findById(res.body.id);
        expect(registeredUserInDb!._id.toString()).toBe(res.body.id);

        // проверить, что в куках пришел токен
        expect(res.headers['set-cookie'][0].startsWith('token=')).toBe(true);

        done();
      });
  });

  test('---- неуспешный сценарий (не все поля переданы) ----', done => {
    const partialRegisterData: Partial<RegisterUserBodyParams> = { first_name: 'Юрец', last_name: 'Татар', password: '1' };
    // отправить запрос на регистрацию
    request(app)
      .post(`${BASE_ROUTES.USER}/${USER_ROUTES.REGISTER}`)
      .send(partialRegisterData)
      .expect(200)
      .end(async function (err, res) {
        // проверить, что в ответе есть текст ошибки
        expect(res.text).toBe(ERROR_MESSAGES.ALL_INPUT_IS_REQUIRED);

        // в бд нет пользователя с таким email
        const registeredUserInDb = await User.find({ email: SUCCESS_INPUT_DATA.email });
        expect(registeredUserInDb.length).toBe(0);
        done();
      });
  });

  test('---- неуспешный сценарий (пользователь уже зареган) ----', done => {
    // отправить запрос на регистрацию
    request(app)
      .post(`${BASE_ROUTES.USER}/${USER_ROUTES.REGISTER}`)
      .send(SUCCESS_INPUT_DATA)
      .expect(200)
      .end(function (err, res) {
        request(app)
          .post(`${BASE_ROUTES.USER}/${USER_ROUTES.REGISTER}`)
          .send(SUCCESS_INPUT_DATA)
          .expect(400)
          .end(async function (err, res) {
            // проверить, что в ответе ошибка, что пользователь уже зареган
            expect(res.text).toBe(ERROR_MESSAGES.USER_ALREADY_EXISTS);

            // проверить, что в БД НЕ ПОЯВИЛСЯ ВТОРОЙ пользователь с таким же email
            const registeredUserInDb = await User.find({ email: SUCCESS_INPUT_DATA.email });
            expect(registeredUserInDb.length).toBe(1);

            done();
          });
      });
  });
});
