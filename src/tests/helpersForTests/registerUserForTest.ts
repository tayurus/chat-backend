import request from 'supertest';
import { app } from '../../app';
import { BASE_ROUTES, USER_ROUTES } from '../../types/backendAndFrontendCommonTypes/routes';
import setCookierParser from 'set-cookie-parser';
import { REGISTER_SUCCESS_INPUT_DATA } from '../constantsForTests';
import { RegisteredUserForTest } from '../typesForTests';

export async function registerUserForTest(users = [REGISTER_SUCCESS_INPUT_DATA]) {
  const registeredUsers: Record<string, RegisteredUserForTest> = {};
  for (let i = 0; i < users.length; i++) {
    await request(app)
      .post(`${BASE_ROUTES.USER}${USER_ROUTES.REGISTER}`)
      .send(users[i])
      .then(function (res) {
        registeredUsers[users[i].email] = Object.assign({}, res.body);
        registeredUsers[users[i].email]['token'] = setCookierParser.parse(res.headers['set-cookie'][0])[0].value;
      })
      .catch(err => {
        console.error('err while register = ', err);
      });
  }

  return registeredUsers;
}
