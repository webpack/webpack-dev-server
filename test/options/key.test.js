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

  describe('key', () => {
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

    it('should allow key to be a string', () => {
      let error = null;
      try {
        const key = '';
        server = new Server(compiler, { key });
      } catch (err) {
        error = err;
      }
      expect(error).toBe(null);
    });

    it('should allow key to be a Buffer', () => {
      let error = null;
      try {
        const key = Buffer.from('');
        server = new Server(compiler, { key });
      } catch (err) {
        error = err;
      }
      expect(error).toBe(null);
    });

    it('should not allow key to be the wrong type', () => {
      let error = null;
      try {
        server = new Server(compiler, { key: false });
      } catch (err) {
        error = err;
      }
      expect(error).toBeInstanceOf(ValidationError);
    });
  });
});
