'use strict';

const request = require('supertest');
const helper = require('./helper');
const config = require('./fixtures/client-config/webpack.config');
const multiCompilerConfig = require('./fixtures/multi-compiler-config/webpack.config');

describe('Hot Module Replacement (hot/hotOnly options)', () => {
  let server;
  let req;

  describe('simple hot config entries', () => {
    beforeAll((done) => {
      const options = {
        port: 9000,
        inline: true,
        hot: true,
        watchOptions: {
          poll: true,
        },
      };
      server = helper.startAwaitingCompilation(config, options, done);
      req = request(server.app);
    });

    afterAll(helper.close);

    it('should include hot script in the bundle', (done) => {
      req.get('/main.js').expect(200, /webpack\/hot\/dev-server\.js/, done);
    });
  });

  describe('simple hotOnly config entries', () => {
    beforeAll((done) => {
      const options = {
        port: 9000,
        inline: true,
        hotOnly: true,
        watchOptions: {
          poll: true,
        },
      };
      server = helper.startAwaitingCompilation(config, options, done);
      req = request(server.app);
    });

    afterAll(helper.close);

    it('should include hotOnly script in the bundle', (done) => {
      req
        .get('/main.js')
        .expect(200, /webpack\/hot\/only-dev-server\.js/, done);
    });
  });

  describe('multi compiler hot config entries', () => {
    beforeAll((done) => {
      const options = {
        port: 9000,
        inline: true,
        hot: true,
        watchOptions: {
          poll: true,
        },
      };
      server = helper.startAwaitingCompilation(
        multiCompilerConfig,
        options,
        done
      );
      req = request(server.app);
    });

    afterAll(helper.close);

    it('should include hot script in the bundle', (done) => {
      req.get('/main.js').expect(200, /webpack\/hot\/dev-server\.js/, done);
    });
  });

  describe('hot disabled entries', () => {
    beforeAll((done) => {
      const options = {
        port: 9000,
        inline: true,
        hot: false,
        watchOptions: {
          poll: true,
        },
      };
      server = helper.startAwaitingCompilation(config, options, done);
      req = request(server.app);
    });

    afterAll(helper.close);

    it('should NOT include hot script in the bundle', (done) => {
      req
        .get('/main.js')
        .expect(200)
        .then(({ text }) => {
          expect(text).not.toMatch(/webpack\/hot\/dev-server\.js/);
          done();
        });
    });
  });

  // the following cases check to make sure that the HMR
  // plugin is actually added

  describe('simple hot config HMR plugin', () => {
    it('should register the HMR plugin before compilation is complete', (done) => {
      let pluginFound = false;
      const options = {
        port: 9000,
        inline: true,
        hot: true,
        watchOptions: {
          poll: true,
        },
      };
      const fullSetup = helper.startAwaitingCompilationFullSetup(
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

    afterAll(helper.close);
  });

  describe('simple hotOnly config HMR plugin', () => {
    it('should register the HMR plugin before compilation is complete', (done) => {
      let pluginFound = false;
      const options = {
        port: 9000,
        inline: true,
        hotOnly: true,
        watchOptions: {
          poll: true,
        },
      };
      const fullSetup = helper.startAwaitingCompilationFullSetup(
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

    afterAll(helper.close);
  });

  describe('multi compiler hot config HMR plugin', () => {
    it('should register the HMR plugin before compilation is complete', (done) => {
      let pluginFound = false;
      const options = {
        port: 9000,
        inline: true,
        hot: true,
        watchOptions: {
          poll: true,
        },
      };
      const fullSetup = helper.startAwaitingCompilationFullSetup(
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

    afterAll(helper.close);
  });

  describe('hot disabled HMR plugin', () => {
    it('should NOT register the HMR plugin before compilation is complete', (done) => {
      let pluginFound = false;
      const options = {
        port: 9000,
        inline: true,
        hot: false,
        watchOptions: {
          poll: true,
        },
      };
      const fullSetup = helper.startAwaitingCompilationFullSetup(
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

    afterAll(helper.close);
  });
});
