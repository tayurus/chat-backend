import request from 'supertest';
import { app } from '../app';

import { describe, test } from '@jest/globals';
import { connectToDB } from '../config/database';
import { User } from '../model/user';

describe('sum module', () => {
  // @ts-ignore
  test('should return Hello Test', async () => {
    await connectToDB();
    const users = await User.find({});
    console.log('users = ', users);
    // request(app).get('/').expect('Hello Test');
    const res = await request(app).get('/');
    expect(res.text).toBe('Hello Test');
  });
});
