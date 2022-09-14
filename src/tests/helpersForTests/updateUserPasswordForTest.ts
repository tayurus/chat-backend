import { UpdateUserPasswordParams } from 'src/types/backendParams';
import { getTokenForCookieForTest, RegisteredUsersForTest } from 'src/tests/helpersForTests/getTokenForCookieForTest';
import request from 'supertest';
import { app } from 'src/app';
import { BASE_ROUTES, USER_ROUTES } from 'src/types/backendAndFrontendCommonTypes/routes';

/**
 * Менят пароль для теста
 * @param requesterEmail - емейл пользователя, от лица которого совершаем запрос
 * */
export async function updateUserPasswordForTest(params: {
  data: UpdateUserPasswordParams;
  withAuthToken?: boolean;
  expectedStatus?: number;
  requesterEmail: string;
  registeredUsers: RegisteredUsersForTest;
}) {
  const { registeredUsers, data, expectedStatus = 200, requesterEmail, withAuthToken = true } = params;

  return request(app)
    .post(`${BASE_ROUTES.USER}${USER_ROUTES.UPDATE_PASSWORD}`)
    .set('Cookie', withAuthToken ? getTokenForCookieForTest({ registeredUsers, email: requesterEmail }) : [])
    .send(data)
    .expect(expectedStatus)
    .then(res => {
      return res;
    })
    .catch(err => {
      if (err) {
        console.log('updateUserPasswordForTest err = ', err);
        return err;
      }
    });
}
