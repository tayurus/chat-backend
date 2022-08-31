import request from 'supertest';
import { app } from '../app';

import { describe } from '@jest/globals';

describe('sum module', () => {
  it('should return Hello Test', function (done) {
    request(app).get('/').expect('Hello Test').end(done);
  });
});
