'use strict';

const request = require('supertest');
const testServer = require('../helpers/test-server');
const config = require('../fixtures/client-config/webpack.config');
const port = require('../ports-map')['hotOnly-option'];

describe('hotOnly options', () => {
  let server;
  let req;

  describe('simple hotOnly config entries', () => {
    beforeAll((done) => {
      const options = {
        port,
        inline: true,
        hotOnly: true,
        watchOptions: {
          poll: true,
        },
      };
      server = testServer.startAwaitingCompilation(config, options, done);
      req = request(server.app);
    });

    afterAll(testServer.close);

    it('should include hotOnly script in the bundle', async () => {
      await req
        .get('/main.js')
        .expect(200, /webpack\/hot\/only-dev-server\.js/);
    });
  });

  describe('simple hotOnly config HMR plugin', () => {
    it('should register the HMR plugin before compilation is complete', (done) => {
      let pluginFound = false;
      const options = {
        port,
        inline: true,
        hotOnly: true,
        watchOptions: {
          poll: true,
        },
      };
      const fullSetup = testServer.startAwaitingCompilationFullSetup(
        config,
        options,
        () => {
          expect(pluginFound).toBeTruthy();
          done();
        }
      );

      const compiler = fullSetup.compiler;
      compiler.hooks.compilation.intercept({
        register: (tapInfo) => {
          if (tapInfo.name === 'HotModuleReplacementPlugin') {
            pluginFound = true;
          }
          return tapInfo;
        },
      });
    });

    afterAll(testServer.close);
  });
});
