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

  describe('open', () => {
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

    it('should allow open to be a boolean', () => {
      let error = null;
      try {
        const open = true;
        server = new Server(compiler, { open });
      } catch (err) {
        error = err;
      }
      expect(error).toBe(null);
    });

    it('should allow open to be a string', () => {
      let error = null;
      try {
        const open = '';
        server = new Server(compiler, { open });
      } catch (err) {
        error = err;
      }
      expect(error).toBe(null);
    });

    it('should not allow open to be the wrong type', () => {
      let error = null;
      try {
        server = new Server(compiler, { open: {} });
      } catch (err) {
        error = err;
      }
      expect(error).toBeInstanceOf(ValidationError);
    });
  });
});
