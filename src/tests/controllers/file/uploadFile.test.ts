import { clearDB, connectToDB, disconnectFromDB } from 'src/config/database';
import { WebSocketModule } from 'src/utils/websocketModule';
import { registerUserForTest } from 'src/tests/helpersForTests/registerUserForTest';
import {
  REGISTER_SUCCESS_INPUT_DATA,
  REGISTER_SUCCESS_INPUT_DATA2,
  TEST_FILE_PATH_FOR_UPLOAD,
  TEST_INVALID_FILE_PATH_FOR_UPLOAD,
  TEST_TOO_BIG_FILE_PATH_FOR_UPLOAD,
} from 'src/tests/constantsForTests';
import { describe } from '@jest/globals';
import { RegisteredUserForTest } from 'src/tests/typesForTests';
import { uploadFileForTest } from 'src/tests/helpersForTests/uploadFileForTest';
import { UploadFileResponse } from 'src/types/backendResponses';
import { User } from 'src/model/user';
import request from 'supertest';
import { app } from 'src/app';
import { ERROR_MESSAGES } from 'src/utils/errorMessages';
import { FILE_UPLOAD } from 'src/types/backendAndFrontendCommonTypes/constants';

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
  test('Успешный сценарий - грузим аватарку пользователя', done => {
    uploadFileForTest({
      registeredUsers,
      queryParams: { type: FILE_UPLOAD.USER_PROFILE_PHOTO },
      requesterEmail: REGISTER_SUCCESS_INPUT_DATA.email,
      data: { pathToFile: TEST_FILE_PATH_FOR_UPLOAD },
    }).then(async res => {
      const bodyResponse: UploadFileResponse = res.body;
      // в ответе придет ссылка на файл
      expect(bodyResponse.url).not.toBe(undefined);

      // в БД у пользователя будет аватарка с url, который пришел в ответе
      const userInDB = await User.find({ email: REGISTER_SUCCESS_INPUT_DATA.email });
      expect(userInDB[0].profilePhoto).toBe(bodyResponse.url);

      // при запросе файла он придет
      request(app)
        .get(bodyResponse.url)
        .send()
        .expect(200)
        .end((err, res) => {
          if (err) {
            console.log('get uploaded file error = ', err);
          }
          console.log('res = ', res);
          done();
        });
    });
  });

  test('неуспешный сценарий - не отправили файл', done => {
    uploadFileForTest({
      registeredUsers,
      queryParams: { type: FILE_UPLOAD.USER_PROFILE_PHOTO },
      requesterEmail: REGISTER_SUCCESS_INPUT_DATA.email,
      data: { pathToFile: '' },
      expectedStatus: 400,
    }).then(res => {
      expect(res.text).toBe(ERROR_MESSAGES.FILE_IS_REQUIRED);
      done();
    });
  });

  test('неуспешный сценарий - файл слишком большой', done => {
    uploadFileForTest({
      registeredUsers,
      queryParams: { type: FILE_UPLOAD.USER_PROFILE_PHOTO },
      requesterEmail: REGISTER_SUCCESS_INPUT_DATA.email,
      data: { pathToFile: TEST_TOO_BIG_FILE_PATH_FOR_UPLOAD },
      expectedStatus: 400,
    }).then(res => {
      expect(res.text).toBe(ERROR_MESSAGES.FILE_IS_TOO_BIG);
      done();
    });
  });

  test('неуспешный сценарий - в аватарку пользователя грузят неверный тип файла', done => {
    uploadFileForTest({
      registeredUsers,
      queryParams: { type: FILE_UPLOAD.USER_PROFILE_PHOTO },
      requesterEmail: REGISTER_SUCCESS_INPUT_DATA.email,
      data: { pathToFile: TEST_INVALID_FILE_PATH_FOR_UPLOAD },
      expectedStatus: 400,
    }).then(async res => {
      expect(res.text).toBe(ERROR_MESSAGES.INVALID_FILE_TYPE);

      // аватарка пользователя все еще будет пустой
      const userInDB = await User.find({ email: REGISTER_SUCCESS_INPUT_DATA.email });
      expect(userInDB[0].profilePhoto).toBe(undefined);
      done();
    });
  });
});
