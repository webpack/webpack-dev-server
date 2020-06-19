'use strict';

jest.setMock('../../../client/entry/bundle.js', jest.fn());

const acorn = require('acorn');
const request = require('supertest');
const testServer = require('../../helpers/test-server');
const config = require('../../fixtures/simple-config/webpack.config');
const port = require('../../ports-map').entry;
const bundle = require('../../../client/entry/bundle');

describe('entry', () => {
  describe('module', () => {
    it('should pass resource query to bundle', () => {
      global.__resourceQuery = 'test';
      require('../../../client/entry');
      expect(bundle.mock.calls.length).toEqual(1);
      expect(bundle.mock.calls[0][0]).toEqual('test');
    });
  });

  describe('bundled output', () => {
    let server;
    let req;

    beforeAll((done) => {
      server = testServer.start(config, { port }, done);
      req = request(server.app);
    });

    afterAll(testServer.close);

    it('should get full user bundle and parse with ES5', async () => {
      const { text } = await req
        .get('/main.js')
        .expect('Content-Type', 'application/javascript; charset=UTF-8')
        .expect(200);

      expect(() => {
        acorn.parse(text, {
          ecmaVersion: 5,
        });
      }).not.toThrow();
    });
  });
});
