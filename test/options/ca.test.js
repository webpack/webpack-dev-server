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

  describe('ca', () => {
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

    it('should allow ca to be a string', () => {
      let error = null;
      try {
        const ca = '';
        server = new Server(compiler, { ca });
      } catch (err) {
        error = err;
      }
      expect(error).toBe(null);
    });

    it('should allow ca to be a Buffer', () => {
      let error = null;
      try {
        const ca = Buffer.from('');
        server = new Server(compiler, { ca });
      } catch (err) {
        error = err;
      }
      expect(error).toBe(null);
    });

    it('should not allow ca to be the wrong type', () => {
      let error = null;
      try {
        server = new Server(compiler, { ca: false });
      } catch (err) {
        error = err;
      }
      expect(error).toBeInstanceOf(ValidationError);
    });
  });
});
