import request from 'supertest';
import { app } from 'src/app';
import { BASE_ROUTES } from 'src/types/backendAndFrontendCommonTypes/routes';
import { getTokenForCookieForTest, RegisteredUsersForTest } from './getTokenForCookieForTest';
import { GetDialogQueryParams, GetDialogUrlParams } from 'src/types/backendParams';
import * as queryString from 'querystring';

/**
 * Запрашивает сообщения диалога для теста
 * @param registeredUsers - список уже зареганных пользователей
 * @param requesterEmail - емейл пользователя, от лица которого совершаем запрос
 * @return - список диалогов
 * */
export async function getDialogForTest(params: {
  registeredUsers: RegisteredUsersForTest;
  requesterEmail: string;
  expectedStatus?: request.Response['status'];
  requestQueryParams: GetDialogQueryParams;
  requestUrlParams: GetDialogUrlParams;
}): Promise<request.Response> {
  const { registeredUsers, requesterEmail, expectedStatus = 200, requestUrlParams, requestQueryParams } = params;
  return (
    request(app)
      // сразу запрашиваем список диалогов, никому ничего не написав
      .get(`${BASE_ROUTES.DIALOG}/${requestUrlParams.dialogId}?${queryString.stringify(requestQueryParams)}`)
      .set('Cookie', getTokenForCookieForTest({ registeredUsers, email: requesterEmail }))
      .send()
      .expect(expectedStatus)
      .then(res => {
        return res;
      })
      .catch(err => {
        if (err) {
          console.log('getDialog err = ', err);
          return err;
        }
      })
  );
}
