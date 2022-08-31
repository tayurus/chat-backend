import request from 'supertest';
import { app } from '../app';

import { describe, test } from '@jest/globals';
import { clearDB, connectToDB, disconnectFromDB } from '../config/database';
import { User } from '../model/user';

beforeAll(async () => await connectToDB());
afterEach(async () => await clearDB());
afterAll(async () => await disconnectFromDB());

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
