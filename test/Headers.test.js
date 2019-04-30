'use strict';

const request = require('supertest');
const helper = require('./helper');
const config = require('./fixtures/simple-config/webpack.config');

describe('Headers', () => {
  let server;
  let req;

  describe('as a string', () => {
    beforeAll((done) => {
      server = helper.start(
        config,
        {
          headers: { 'X-Foo': '1' },
        },
        done
      );
      req = request(server.app);
    });

    afterAll(helper.close);

    it('GET request with headers', (done) => {
      req
        .get('/main')
        .expect('X-Foo', '1')
        .expect(200, done);
    });
  });

  describe('as an array', () => {
    beforeAll((done) => {
      server = helper.start(
        config,
        {
          headers: { 'X-Bar': ['key1=value1', 'key2=value2'] },
        },
        done
      );
      req = request(server.app);
    });

    afterAll(helper.close);

    it('GET request with headers as an array', (done) => {
      // https://github.com/webpack/webpack-dev-server/pull/1650#discussion_r254217027
      const expected = ['v7', 'v8', 'v9'].includes(
        process.version.split('.')[0]
      )
        ? 'key1=value1,key2=value2'
        : 'key1=value1, key2=value2';
      req
        .get('/main')
        .expect('X-Bar', expected)
        .expect(200, done);
    });
  });
});
