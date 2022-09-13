import request from 'supertest';
import { app } from 'src/app';
import { BASE_ROUTES, DIALOG_ROUTES } from 'src/types/backendAndFrontendCommonTypes/routes';
import { getTokenForCookieForTest, RegisteredUsersForTest } from 'src/tests/helpersForTests/getTokenForCookieForTest';

/**
 * Запрашивает список диалогов для тестирования
 * @param registeredUsers - список уже зареганных пользователей
 * @return - список диалогов
 * */
export async function getDialogsForTest(params: {
  registeredUsers: RegisteredUsersForTest;
  requesterEmail: string;
  expectedStatus?: request.Response['status'];
}): Promise<request.Response> {
  const { registeredUsers, requesterEmail, expectedStatus = 200 } = params;
  return (
    request(app)
      // сразу запрашиваем список диалогов, никому ничего не написав
      .get(`${BASE_ROUTES.DIALOG}${DIALOG_ROUTES.GET_DIALOGS}`)
      .set('Cookie', getTokenForCookieForTest({ registeredUsers, email: requesterEmail }))
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
