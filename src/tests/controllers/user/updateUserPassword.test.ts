import { clearDB, connectToDB, disconnectFromDB } from 'src/config/database';
import { WebSocketModule } from 'src/utils/websocketModule';
import { REGISTER_SUCCESS_INPUT_DATA } from 'src/tests/constantsForTests';
import { describe } from '@jest/globals';
import { RegisteredUserForTest } from 'src/tests/typesForTests';
import { UpdateUserPasswordParams } from 'src/types/backendParams';
import { updateUserPasswordForTest } from 'src/tests/helpersForTests/updateUserPasswordForTest';
import { responseHasTokenCookieForTest } from 'src/tests/helpersForTests/responseHasTokenCookieForTest';
import { registerUserForTest } from 'src/tests/helpersForTests/registerUserForTest';
import { ERROR_MESSAGES } from 'src/utils/errorMessages';

let registeredUsers: Record<string, RegisteredUserForTest> = {};

const UPDATE_PASSWORD_SUCCESS_PARAMS: UpdateUserPasswordParams = {
  newPassword: REGISTER_SUCCESS_INPUT_DATA.password + 'someNewPassword',
  oldPassword: REGISTER_SUCCESS_INPUT_DATA.password,
};

const UPDATE_PASSWORD_INVALID_OLD_PASSWORD: UpdateUserPasswordParams = {
  newPassword: REGISTER_SUCCESS_INPUT_DATA.password + 'someNewPassword',
  oldPassword: REGISTER_SUCCESS_INPUT_DATA.password + '1488228',
};

const UPDATE_PASSWORD_INVALID_NEW_PASSWORD: UpdateUserPasswordParams = {
  newPassword: '',
  oldPassword: REGISTER_SUCCESS_INPUT_DATA.password,
};

const UPDATE_PASSWORD_PASSWORDS_EQUAL: UpdateUserPasswordParams = {
  newPassword: REGISTER_SUCCESS_INPUT_DATA.password,
  oldPassword: REGISTER_SUCCESS_INPUT_DATA.password,
};

beforeAll(async () => await connectToDB());
beforeEach(done => {
  registerUserForTest([REGISTER_SUCCESS_INPUT_DATA]).then(authTokensFromBackend => {
    registeredUsers = Object.assign({}, authTokensFromBackend);
    WebSocketModule.server.close(() => done());
  });
});
afterEach(async () => await clearDB());
afterAll(async () => {
  await disconnectFromDB();
});

describe('Изменение пароля пользователя', () => {
  test('успешный сценарий - старый пароль верен, новый пароль введен', done => {
    updateUserPasswordForTest({ registeredUsers, requesterEmail: REGISTER_SUCCESS_INPUT_DATA.email, data: UPDATE_PASSWORD_SUCCESS_PARAMS }).then(
      res => {
        // проверить, что в куках пришел токен
        expect(responseHasTokenCookieForTest(res)).toBe(true);
        done();
      },
    );
  });

  test('неуспешный сценарий - старый пароль неверен, новый пароль введен', done => {
    updateUserPasswordForTest({
      registeredUsers,
      requesterEmail: REGISTER_SUCCESS_INPUT_DATA.email,
      data: UPDATE_PASSWORD_INVALID_OLD_PASSWORD,
      expectedStatus: 400,
    }).then(res => {
      console.log('res.headers = ', res.headers);
      // проверить, что в куках не пришел токен
      expect(responseHasTokenCookieForTest(res)).toBe(false);

      expect(res.text).toBe(ERROR_MESSAGES.OLD_PASSWORD_INVALID);
      done();
    });
  });

  test('неуспешный сценарий - старый пароль верен, новый пароль неверен', done => {
    updateUserPasswordForTest({
      registeredUsers,
      requesterEmail: REGISTER_SUCCESS_INPUT_DATA.email,
      data: UPDATE_PASSWORD_INVALID_NEW_PASSWORD,
      expectedStatus: 400,
    }).then(res => {
      // проверить, что в куках не пришел токен
      expect(responseHasTokenCookieForTest(res)).toBe(false);

      expect(res.text).toBe(ERROR_MESSAGES.NEW_PASSWORD_IS_REQUIRED);
      done();
    });
  });

  test('неуспешный сценарий - старый пароль верен, новый пароль равен старому', done => {
    updateUserPasswordForTest({
      registeredUsers,
      requesterEmail: REGISTER_SUCCESS_INPUT_DATA.email,
      data: UPDATE_PASSWORD_PASSWORDS_EQUAL,
      expectedStatus: 400,
    }).then(res => {
      // проверить, что в куках не пришел токен
      expect(responseHasTokenCookieForTest(res)).toBe(false);

      expect(res.text).toBe(ERROR_MESSAGES.NEW_PASSWORD_MUST_BE_DIFFERENT_FROM_OLD);
      done();
    });
  });

  test('неуспешный сценарий - не прислали токен', done => {
    updateUserPasswordForTest({
      registeredUsers,
      requesterEmail: REGISTER_SUCCESS_INPUT_DATA.email,
      data: UPDATE_PASSWORD_SUCCESS_PARAMS,
      expectedStatus: 400,
      withAuthToken: false,
    }).then(res => {
      // проверить, что в куках не пришел токен
      expect(responseHasTokenCookieForTest(res)).toBe(false);

      expect(res.text).toBe(ERROR_MESSAGES.TOKEN_REQUIRED);
      done();
    });
  });
});
