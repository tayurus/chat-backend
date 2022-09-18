import { clearDB, connectToDB, disconnectFromDB } from 'src/config/database';
import { WebSocketModule } from 'src/utils/websocketModule';
import { registerUserForTest } from 'src/tests/helpersForTests/registerUserForTest';
import { REGISTER_SUCCESS_INPUT_DATA, REGISTER_SUCCESS_INPUT_DATA2 } from 'src/tests/constantsForTests';
import { getTokenForCookieForTest } from 'src/tests/helpersForTests/getTokenForCookieForTest';
import { describe } from '@jest/globals';
import request from 'supertest';
import { app } from 'src/app';
import { BASE_ROUTES, USER_ROUTES } from 'src/types/backendAndFrontendCommonTypes/routes';
import { RegisteredUserForTest } from 'src/tests/typesForTests';

let registeredUsers: Record<string, RegisteredUserForTest> = {};

beforeAll(async () => await connectToDB());
beforeEach(done => {
  registerUserForTest([REGISTER_SUCCESS_INPUT_DATA, REGISTER_SUCCESS_INPUT_DATA2]).then(authTokensFromBackend => {
    registeredUsers = Object.assign({}, authTokensFromBackend);
    WebSocketModule.server.close(() => done());
  });
});
afterEach(async () => await clearDB());
afterAll(async () => {
  await disconnectFromDB();
});

describe('Загрузка файла', () => {
  test('Успешный сценарий', done => {
    request(app)
      .post(`${BASE_ROUTES.USER}${USER_ROUTES.SEARCH_USERS}?query=${REGISTER_SUCCESS_INPUT_DATA.first_name}`)
      .set('Cookie', getTokenForCookieForTest({ registeredUsers, email: REGISTER_SUCCESS_INPUT_DATA.email }))
      .attach('file', 'C:\\Users\\y.tatarintsev\\Desktop\\shit\\376on376.png')
      .send()
      .expect(200)
      .end((err, res) => {
        if (err) {
          console.log('err = ', err);
        }
        done();
      });
  });
});

// успешный сценарий
