import { getTokenForCookieForTest, RegisteredUsersForTest } from 'src/tests/helpersForTests/getTokenForCookieForTest';
import request from 'supertest';
import { app } from 'src/app';
import { BASE_ROUTES, USER_ROUTES } from 'src/types/backendAndFrontendCommonTypes/routes';

/**
 * Удаляет аватарку пользователя
 * */
export async function removeUserProfileForTest(params: { expectedStatus?: number; requesterEmail: string; registeredUsers: RegisteredUsersForTest }) {
  const { registeredUsers, expectedStatus = 200, requesterEmail } = params;

  return request(app)
    .delete(`${BASE_ROUTES.USER}${USER_ROUTES.REMOVE_PROFILE_PHOTO}`)
    .set('Cookie', getTokenForCookieForTest({ registeredUsers, email: requesterEmail }))
    .send({})
    .expect(expectedStatus)
    .then(res => {
      return res;
    })
    .catch(err => {
      if (err) {
        console.log('removeUserProfileForTest err = ', err);
        return err;
      }
    });
}
