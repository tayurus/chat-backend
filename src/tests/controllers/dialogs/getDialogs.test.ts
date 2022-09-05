import { clearDB, connectToDB, disconnectFromDB } from '../../../config/database';
import { WebSocketModule } from '../../../utils/websocketModule';
import { REGISTER_SUCCESS_INPUT_DATA, REGISTER_SUCCESS_INPUT_DATA2, registerUserForTest } from '../../helpers';
import { describe } from '@jest/globals';
import request from 'supertest';
import { app } from '../../../app';
import { BASE_ROUTES, USER_ROUTES } from '../../../types/backendAndFrontendCommonTypes/routes';

let authTokens: Record<string, string> = {};

beforeAll(async () => await connectToDB());
beforeEach(done => {
  registerUserForTest([REGISTER_SUCCESS_INPUT_DATA, REGISTER_SUCCESS_INPUT_DATA2]).then(authTokensFromBackend => {
    authTokens = Object.assign({}, authTokensFromBackend);
    WebSocketModule.server.close(() => done());
  });
});
afterEach(async () => await clearDB());
afterAll(async () => {
  await disconnectFromDB();
});

describe('Пример теста', () => {
  test('Выполняет поиск пользователей', done => {
    request(app)
      .get(`${BASE_ROUTES.USER}${USER_ROUTES.SEARCH_USERS}?query=${REGISTER_SUCCESS_INPUT_DATA.first_name}`)
      .set('Cookie', [`token=${authTokens[REGISTER_SUCCESS_INPUT_DATA.email]}`])
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
