import request from 'supertest';
import { app } from '../../app';
import { BASE_ROUTES, DIALOG_ROUTES } from '../../types/backendAndFrontendCommonTypes/routes';
import { getTokenForCookieForTest, RegisteredUsersForTest } from './getTokenForCookieForTest';
import { REGISTER_SUCCESS_INPUT_DATA } from '../constantsForTests';

/**
 * Запрашивает список диалогов для тестирования
 * @param registeredUsers - список уже зареганных пользователей
 * @return - список диалогов
 * */
export async function getDialogsForTest(params: {
  registeredUsers: RegisteredUsersForTest;
  expectedStatus?: request.Response['status'];
}): Promise<request.Response> {
  const { registeredUsers, expectedStatus = 200 } = params;
  return (
    request(app)
      // сразу запрашиваем список диалогов, никому ничего не написав
      .get(`${BASE_ROUTES.DIALOG}${DIALOG_ROUTES.GET_DIALOGS}`)
      .set('Cookie', getTokenForCookieForTest({ registeredUsers, email: REGISTER_SUCCESS_INPUT_DATA.email }))
      .send()
      .expect(expectedStatus)
      .then(res => {
        return res;
      })
      .catch(err => {
        if (err) {
          console.log('getDialogs err = ', err);
          return err;
        }
      })
  );
}
