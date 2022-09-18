import { getTokenForCookieForTest, RegisteredUsersForTest } from 'src/tests/helpersForTests/getTokenForCookieForTest';
import request from 'supertest';
import { app } from 'src/app';
import { BASE_ROUTES, FILE_ROUTES } from 'src/types/backendAndFrontendCommonTypes/routes';
import { UploadFileQueryParams } from 'src/types/backendParams';
import * as queryString from 'querystring';

export async function uploadFileForTest(params: {
  data: { pathToFile: string };
  queryParams: UploadFileQueryParams;
  expectedStatus?: number;
  requesterEmail: string;
  registeredUsers: RegisteredUsersForTest;
}) {
  const { registeredUsers, data, expectedStatus = 200, requesterEmail, queryParams } = params;

  return request(app)
    .post(`${BASE_ROUTES.FILE}${FILE_ROUTES.UPLOAD}?${queryString.stringify(queryParams)}`)
    .set('Cookie', getTokenForCookieForTest({ registeredUsers, email: requesterEmail }))
    .attach('file', data.pathToFile)
    .expect(expectedStatus)
    .then(res => {
      return res;
    })
    .catch(err => {
      if (err) {
        console.log('uploadFileForTest err = ', err);
      }
      return err;
    });
}
