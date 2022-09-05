import request from 'supertest';
import { app } from '../app';

import { describe, test } from '@jest/globals';
import { clearDB, connectToDB, disconnectFromDB } from '../config/database';
import { User } from '../model/user';
import { registerUserForTest } from './helpers';
import { WebSocketModule } from '../utils/websocketModule';

beforeAll(async () => await connectToDB());
beforeEach(done => {
  registerUserForTest().then(() => {
    WebSocketModule.server.close(() => done());
  });
});
afterEach(async () => await clearDB());
afterAll(async () => {
  await disconnectFromDB();
});

describe('Отправка сообщения', () => {
  test('should return Hello Test', async () => {
    await connectToDB();
    const users = await User.find({});
    console.log('users = ', users);
    const res = await request(app).get('/');
    expect(res.text).toBe('Hello Test');
  });
});

// успешный сценарий - диалога еще нет
// отправляем сообщение
// в ответ придет id диалога
// проверим, что в базе такой диалог есть
// проверим, что в базе есть сообщение с таким dialogId

// успешный сценарий - диалог есть
// отправляем сообщение
// в ответ придет id диалога
// проверим, что в базе есть как минимум 2 сообщения с таким dialogId

// неуспешный сценарий - пустое сообщение (для нового диалога)
// отправляем сообщение
// в ответ придет ошибка
// в базе нет диалогов
// в базе нет сообщений


// неуспешный сценарий - не передали токен
// отправляем сообщение, не указав токен
// в ответ придет ошибка
// в базе нет диалогов
// в базе нет сообщений

// неуспешный сценарий - получатель не найден
// отправляем сообщение несуществующему получателю
// в ответ придет ошибка
// в базе нет диалогов
// в базе нет сообщений
