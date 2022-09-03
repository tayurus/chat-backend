import request from 'supertest';
import { app } from '../app';
import { BASE_ROUTES, USER_ROUTES } from '../types/backendAndFrontendCommonTypes/routes';
import { LoginUserBodyParams, RegisterUserBodyParams } from '../types/backendParams';

export const REGISTER_SUCCESS_INPUT_DATA: RegisterUserBodyParams = { first_name: 'Юрец', last_name: 'Татар', email: 'sooqa@mail.ru', password: '1' };
export const LOGIN_SUCCESS_INPUT_DATA: LoginUserBodyParams = {
  email: REGISTER_SUCCESS_INPUT_DATA.email,
  password: REGISTER_SUCCESS_INPUT_DATA.password,
};
export async function registerUserForTest() {
  await request(app).post(`${BASE_ROUTES.USER}${USER_ROUTES.REGISTER}`).send(REGISTER_SUCCESS_INPUT_DATA);
}
