'use strict';

const request = require('supertest');
const testServer = require('../helpers/test-server');
const config = require('../fixtures/client-config/webpack.config');
const multiCompilerConfig = require('../fixtures/multi-compiler-config/webpack.config');
const port = require('../ports-map')['hot-option'];

describe('hot option', () => {
  let server;
  let req;

  describe('simple hot config entries', () => {
    beforeAll((done) => {
      const options = {
        port,
        inline: true,
        hot: true,
        watchOptions: {
          poll: true,
        },
      };
      server = testServer.startAwaitingCompilation(config, options, done);
      req = request(server.app);
    });

    afterAll(testServer.close);

    it('should include hot script in the bundle', async () => {
      await req.get('/main.js').expect(200, /webpack\/hot\/dev-server\.js/);
    });
  });

  describe('multi compiler hot config entries', () => {
    beforeAll((done) => {
      const options = {
        port,
        inline: true,
        hot: true,
        watchOptions: {
          poll: true,
        },
      };
      server = testServer.startAwaitingCompilation(
        multiCompilerConfig,
        options,
        done
      );
      req = request(server.app);
    });

    afterAll(testServer.close);

    it('should include hot script in the bundle', async () => {
      await req.get('/main.js').expect(200, /webpack\/hot\/dev-server\.js/);
    });
  });

  describe('hot disabled entries', () => {
    beforeAll((done) => {
      const options = {
        port,
        inline: true,
        hot: false,
        watchOptions: {
          poll: true,
        },
      };
      server = testServer.startAwaitingCompilation(config, options, done);
      req = request(server.app);
    });

    afterAll(testServer.close);

    it('should NOT include hot script in the bundle', async () => {
      const { text } = await req.get('/main.js').expect(200);

      expect(text).not.toMatch(/webpack\/hot\/dev-server\.js/);
    });
  });

  // the following cases check to make sure that the HMR
  // plugin is actually added

  describe('simple hot config HMR plugin', () => {
    it('should register the HMR plugin before compilation is complete', (done) => {
      let pluginFound = false;
      const options = {
        port,
        inline: true,
        hot: true,
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

  describe('multi compiler hot config HMR plugin', () => {
    it('should register the HMR plugin before compilation is complete', (done) => {
      let pluginFound = false;
      const options = {
        port,
        inline: true,
        hot: true,
        watchOptions: {
          poll: true,
        },
      };
      const fullSetup = testServer.startAwaitingCompilationFullSetup(
        multiCompilerConfig,
        options,
        () => {
          expect(pluginFound).toBeTruthy();
          done();
        }
      );

      const compiler = fullSetup.compiler.compilers[0];
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

  describe('hot disabled HMR plugin', () => {
    it('should NOT register the HMR plugin before compilation is complete', (done) => {
      let pluginFound = false;
      const options = {
        port,
        inline: true,
        hot: false,
        watchOptions: {
          poll: true,
        },
      };
      const fullSetup = testServer.startAwaitingCompilationFullSetup(
        config,
        options,
        () => {
          expect(pluginFound).toBeFalsy();
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
