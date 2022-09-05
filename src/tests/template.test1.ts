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

describe('sum module', () => {
  // @ts-ignore
  test('should return Hello Test', async () => {
    await connectToDB();
    const users = await User.find({});
    console.log('users = ', users);
    const res = await request(app).get('/');
    expect(res.text).toBe('Hello Test');
  });
});

// успешный сценарий

// неуспешный сценарий - не передали токен
