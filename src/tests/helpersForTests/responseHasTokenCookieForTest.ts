/**
 * Проверяет, что в ответе от бека есть кука с токеном
 * @param response - ответ с бека
 * @return - есть ли токен
 * */
import request from 'supertest';

export function responseHasTokenCookieForTest(res: request.Response) {
  if (res.headers && res.headers['set-cookie'] && Array.isArray(res.headers['set-cookie']) && typeof res.headers['set-cookie'][0] === 'string') {
    return res.headers['set-cookie'][0].startsWith('token=');
  }
  return false;
}
