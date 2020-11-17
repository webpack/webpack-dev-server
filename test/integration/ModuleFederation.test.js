'use strict';

const request = require('supertest');
const requireFromString = require('require-from-string');
const testServer = require('../helpers/test-server');
const simpleConfig = require('../fixtures/module-federation-config/webpack.config');
const objectEntryConfig = require('../fixtures/module-federation-config/webpack.object-entry.config');
const multiConfig = require('../fixtures/module-federation-config/webpack.multi.config');
const port = require('../ports-map').ModuleFederation;

describe('module federation', () => {
  describe.each([
    ['simple multi-entry config', simpleConfig],
    ['object multi-entry config', objectEntryConfig],
    ['multi compiler config', multiConfig],
  ])('%s', (title, config) => {
    let server;
    let req;

    beforeAll((done) => {
      server = testServer.start(config, { port }, done);
      req = request(server.app);
    });

    afterAll(testServer.close);

    it('should use the last entry export', async () => {
      const { text, statusCode } = await req.get('/main.js');
      expect(statusCode).toEqual(200);
      expect(text).toContain('entry1');

      let exports;
      expect(() => {
        exports = requireFromString(text);
      }).not.toThrow();

      expect(exports).toEqual('entry2');
    });

    if (title === 'object multi-entry config') {
      it('should support the named entry export', async () => {
        const { text, statusCode } = await req.get('/foo.js');
        expect(statusCode).toEqual(200);
        expect(text).not.toContain('entry2');

        let exports;
        expect(() => {
          exports = requireFromString(text);
        }).not.toThrow();

        expect(exports).toEqual('entry1');
      });
    }
  });
});
