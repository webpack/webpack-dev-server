'use strict';

const request = require('supertest');
const requireFromString = require('require-from-string');
const testServer = require('../helpers/test-server');
const simpleConfig = require('../fixtures/module-federation-config/webpack.config');
const objectEntryConfig = require('../fixtures/module-federation-config/webpack.object-entry.config');
const multiConfig = require('../fixtures/module-federation-config/webpack.multi.config');
const port = require('../ports-map').ModuleFederation;

describe('module federation', () => {
  const configs = [
    {
      config: simpleConfig,
      title: 'simple multi-entry config',
    },
    {
      config: objectEntryConfig,
      title: 'object multi-entry config',
    },
    {
      config: multiConfig,
      title: 'multi compiler config',
    },
  ];

  configs.forEach(({ config, title }) => {
    describe(title, () => {
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
    });
  });
});
