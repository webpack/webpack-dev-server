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

  describe('host', () => {
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

    it('should allow host to be a string', () => {
      let error = null;
      try {
        const host = '';
        server = new Server(compiler, { host });
      } catch (err) {
        error = err;
      }
      expect(error).toBe(null);
    });

    it('should allow host to be null', () => {
      let error = null;
      try {
        const host = null;
        server = new Server(compiler, { host });
      } catch (err) {
        error = err;
      }
      expect(error).toBe(null);
    });

    it('should not allow host to be the wrong type', () => {
      let error = null;
      try {
        server = new Server(compiler, { host: false });
      } catch (err) {
        error = err;
      }
      expect(error).toBeInstanceOf(ValidationError);
    });
  });
});
