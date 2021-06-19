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
      };
      server = testServer.startAwaitingCompilation(config, options, done);
      req = request(server.app);
    });

    afterAll(testServer.close);

    it('should include hot script in the bundle', (done) => {
      req.get('/main.js').expect(200, /webpack\/hot\/dev-server\.js/, done);
    });
  });

  describe('simple hot-only config entries', () => {
    beforeAll((done) => {
      const options = {
        port,
        hot: 'only',
      };
      server = testServer.startAwaitingCompilation(config, options, done);
      req = request(server.app);
    });

    afterAll(testServer.close);

    it('should include hot-only script in the bundle', (done) => {
      req
        .get('/main.js')
        .expect(200, /webpack\/hot\/only-dev-server\.js/, done);
    });
  });

  describe('multi compiler hot config entries', () => {
    beforeAll((done) => {
      const options = {
        port,
      };
      server = testServer.startAwaitingCompilation(
        multiCompilerConfig,
        options,
        done
      );
      req = request(server.app);
    });

    afterAll(testServer.close);

    it('should include hot script in the bundle', (done) => {
      req.get('/main.js').expect(200, /webpack\/hot\/dev-server\.js/, done);
    });
  });

  describe('hot disabled entries', () => {
    beforeAll((done) => {
      const options = {
        port,
        hot: false,
      };
      server = testServer.startAwaitingCompilation(config, options, done);
      req = request(server.app);
    });

    afterAll(testServer.close);

    it('should NOT include hot script in the bundle', async () => {
      const res = await req.get('/main.js');
      expect(res.status).toEqual(200);
      expect(res.text).not.toMatch(/webpack\/hot\/dev-server\.js/);
    });
  });

  // the following cases check to make sure that the HMR
  // plugin is actually added

  describe('simple hot config HMR plugin', () => {
    it('should register the HMR plugin before compilation is complete', (done) => {
      let pluginFound = false;
      const options = {
        port,
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
        hot: false,
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
