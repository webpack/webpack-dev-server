'use strict';

jest.setMock('../../../client-src/default/index.js', jest.fn());
jest.setMock('../../../client/entry/bundle.js', jest.fn());

global.__resourceQuery = 'test1';
global.__webpack_hot_emitter__ = 'test2';

const acorn = require('acorn');
const request = require('supertest');
const testServer = require('../../helpers/test-server');
const config = require('../../fixtures/simple-config/webpack.config');
const port = require('../../ports-map').entry;
const init = require('../../../client-src/default');
const bundle = require('../../../client/entry/bundle');

describe('entry', () => {
  describe('module', () => {
    it('should pass resource query and emitter to bundle', () => {
      require('../../../client/entry');
      expect(bundle.mock.calls.length).toEqual(1);
      expect(bundle.mock.calls[0]).toEqual(['test1', 'test2']);
    });
  });

  describe('bundle placeholder', () => {
    it('should call unbundled init function', () => {
      require('../../../client-src/entry');
      expect(init.mock.calls.length).toEqual(1);
      expect(init.mock.calls[0]).toEqual(['test1', 'test2']);
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
