'use strict';

const request = require('supertest');
const helper = require('./helper');
const config = require('./fixtures/client-config/webpack.config');
const multiCompilerConfig = require('./fixtures/multi-compiler-config/webpack.config');

describe('inline', () => {
  let server;
  let req;

  describe('simple inline config entries', () => {
    beforeAll((done) => {
      const options = {
        port: 9000,
        host: '0.0.0.0',
        inline: true,
        watchOptions: {
          poll: true,
        },
      };
      server = helper.startAwaitingCompilation(config, options, done);
      req = request(server.app);
    });

    afterAll(helper.close);

    it('should include inline client script in the bundle', (done) => {
      req
        .get('/main.js')
        .expect(200, /client\/index\.js\?http:\/\/0\.0\.0\.0:9000/, done);
    });
  });

  describe('multi compiler inline config entries', () => {
    beforeAll((done) => {
      const options = {
        port: 9000,
        host: '0.0.0.0',
        inline: true,
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

    it('should include inline client script in the bundle', (done) => {
      req
        .get('/main.js')
        .expect(200, /client\/index\.js\?http:\/\/0\.0\.0\.0:9000/, done);
    });
  });

  describe('inline disabled entries', () => {
    beforeAll((done) => {
      const options = {
        port: 9000,
        host: '0.0.0.0',
        inline: false,
        watchOptions: {
          poll: true,
        },
      };
      server = helper.startAwaitingCompilation(config, options, done);
      req = request(server.app);
    });

    afterAll(helper.close);

    it('should NOT include inline client script in the bundle', (done) => {
      req
        .get('/main.js')
        .expect(200)
        .then(({ text }) => {
          expect(text).not.toMatch(
            /client\/index\.js\?http:\/\/0\.0\.0\.0:9000/
          );
          done();
        });
    });
  });
});
