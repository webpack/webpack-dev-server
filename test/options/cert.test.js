'use strict';

const ValidationError = require('schema-utils/src/ValidationError');
const webpack = require('webpack');
const Server = require('../../lib/Server');
const config = require('../fixtures/simple-config/webpack.config');

describe('Validation', () => {
  let compiler;
  let server;

  beforeAll(() => {
    compiler = webpack(config);
  });

  describe('cert', () => {
    beforeEach(() => {
      server = null;
    });
    afterEach((done) => {
      if (server) {
        server.close(() => {
          done();
        });
      } else {
        done();
      }
    });

    it('should allow cert to be a string', () => {
      let error = null;
      try {
        const cert = '';
        server = new Server(compiler, { cert });
      } catch (err) {
        error = err;
      }
      expect(error).toBe(null);
    });

    it('should allow cert to be a Buffer', () => {
      let error = null;
      try {
        const cert = Buffer.from('');
        server = new Server(compiler, { cert });
      } catch (err) {
        error = err;
      }
      expect(error).toBe(null);
    });

    it('should not allow cert to be the wrong type', () => {
      let error = null;
      try {
        server = new Server(compiler, { cert: false });
      } catch (err) {
        error = err;
      }
      expect(error).toBeInstanceOf(ValidationError);
    });
  });
});
