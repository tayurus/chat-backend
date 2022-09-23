import { clearDB, connectToDB, disconnectFromDB } from 'src/config/database';
import { WebSocketModule } from 'src/utils/websocketModule';
import { registerUserForTest } from 'src/tests/helpersForTests/registerUserForTest';
import { REGISTER_SUCCESS_INPUT_DATA, REGISTER_SUCCESS_INPUT_DATA2, TEST_FILE_PATH_FOR_UPLOAD } from 'src/tests/constantsForTests';
import { describe } from '@jest/globals';
import { RegisteredUserForTest } from 'src/tests/typesForTests';
import { removeUserProfileForTest } from 'src/tests/helpersForTests/removeUserProfilePhotoForTest';
import { User } from 'src/model/user';
import { uploadFileForTest } from 'src/tests/helpersForTests/uploadFileForTest';
import { FILE_UPLOAD } from 'src/types/backendAndFrontendCommonTypes/constants';
import { ERROR_MESSAGES } from 'src/utils/errorMessages';

let registeredUsers: Record<string, RegisteredUserForTest> = {};

beforeAll(async () => await connectToDB());
beforeEach(done => {
  registerUserForTest([REGISTER_SUCCESS_INPUT_DATA, REGISTER_SUCCESS_INPUT_DATA2]).then(async authTokensFromBackend => {
    registeredUsers = Object.assign({}, authTokensFromBackend);
    await uploadFileForTest({
      registeredUsers,
      queryParams: { type: FILE_UPLOAD.USER_PROFILE_PHOTO },
      requesterEmail: REGISTER_SUCCESS_INPUT_DATA.email,
      data: { pathToFile: TEST_FILE_PATH_FOR_UPLOAD },
    });
    WebSocketModule.server.close(() => done());
  });
});
afterEach(async () => await clearDB());
afterAll(async () => {
  await disconnectFromDB();
});

describe('Удаление аватарки пользователя', () => {
  test('Успешный сценарий', done => {
    removeUserProfileForTest({ registeredUsers, requesterEmail: REGISTER_SUCCESS_INPUT_DATA.email }).then(async res => {
      const userFromDb = await User.find({ email: REGISTER_SUCCESS_INPUT_DATA.email });
      expect(userFromDb[0].profilePhoto).toBe(null);

      done();
    });
  });

  test('неуспешный сценарий - у данного пользователя нет аватарки', done => {
    removeUserProfileForTest({ registeredUsers, requesterEmail: REGISTER_SUCCESS_INPUT_DATA2.email, expectedStatus: 400 }).then(async res => {
      expect(res.text).toBe(ERROR_MESSAGES.USER_HAS_NOT_PHOTO_PROFILE);
      const userFromDb = await User.find({ email: REGISTER_SUCCESS_INPUT_DATA2.email });
      expect(userFromDb[0].profilePhoto).toBe(null);

      done();
    });
  });
});
