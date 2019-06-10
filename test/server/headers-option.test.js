'use strict';

const request = require('supertest');
const testServer = require('../helpers/test-server');
const config = require('../fixtures/simple-config/webpack.config');
const port = require('../ports-map')['headers-option'];

describe('headers option', () => {
  let server;
  let req;

  describe('as a string', () => {
    beforeAll((done) => {
      server = testServer.start(
        config,
        {
          headers: { 'X-Foo': '1' },
          port,
        },
        done
      );
      req = request(server.app);
    });

    afterAll(testServer.close);

    it('GET request with headers', async () => {
      await req
        .get('/main')
        .expect('X-Foo', '1')
        .expect(200);
    });
  });

  describe('as an array', () => {
    beforeAll((done) => {
      server = testServer.start(
        config,
        {
          headers: { 'X-Bar': ['key1=value1', 'key2=value2'] },
          port,
        },
        done
      );
      req = request(server.app);
    });

    afterAll(testServer.close);

    it('GET request with headers as an array', async () => {
      // https://github.com/webpack/webpack-dev-server/pull/1650#discussion_r254217027
      const expected = ['v7', 'v8', 'v9'].includes(
        process.version.split('.')[0]
      )
        ? 'key1=value1,key2=value2'
        : 'key1=value1, key2=value2';

      await req
        .get('/main')
        .expect('X-Bar', expected)
        .expect(200);
    });
  });
});
