'use strict';

const request = require('supertest');
const testServer = require('../helpers/test-server');
const config = require('../fixtures/client-config/webpack.config');
const multiCompilerConfig = require('../fixtures/multi-compiler-config/webpack.config');
const port = require('../ports-map')['inline-option'];

describe('inline option', () => {
  let server;
  let req;

  describe('simple inline config entries', () => {
    beforeAll((done) => {
      const options = {
        port,
        host: '0.0.0.0',
        inline: true,
        watchOptions: {
          poll: true,
        },
      };
      server = testServer.startAwaitingCompilation(config, options, done);
      req = request(server.app);
    });

    afterAll(testServer.close);

    it('should include inline client script in the bundle', (done) => {
      const url = new RegExp(`client/index.js\\?http://0.0.0.0:${port}`);

      req.get('/main.js').expect(200, url, done);
    });
  });

  describe('multi compiler inline config entries', () => {
    beforeAll((done) => {
      const options = {
        port,
        host: '0.0.0.0',
        inline: true,
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

    it('should include inline client script in the bundle', (done) => {
      const url = new RegExp(`client/index.js\\?http://0.0.0.0:${port}`);

      req.get('/main.js').expect(200, url, done);
    });
  });

  describe('inline disabled entries', () => {
    beforeAll((done) => {
      const options = {
        port,
        host: '0.0.0.0',
        inline: false,
        watchOptions: {
          poll: true,
        },
      };
      server = testServer.startAwaitingCompilation(config, options, done);
      req = request(server.app);
    });

    afterAll(testServer.close);

    it('should NOT include inline client script in the bundle', (done) => {
      req
        .get('/main.js')
        .expect(200)
        .then(({ text }) => {
          expect(text.includes(`client/index.js?http://0.0.0.0:${port}`));
          done();
        });
    });
  });
});
