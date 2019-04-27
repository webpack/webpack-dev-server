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

  describe('watchContentBase', () => {
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

    it('should allow watchContentBase to be a boolean', () => {
      let error = null;
      try {
        const watchContentBase = true;
        server = new Server(compiler, { watchContentBase });
      } catch (err) {
        error = err;
      }
      expect(error).toBe(null);
    });

    it('should not allow watchContentBase to be the wrong type', () => {
      let error = null;
      try {
        server = new Server(compiler, { watchContentBase: '' });
      } catch (err) {
        error = err;
      }
      expect(error).toBeInstanceOf(ValidationError);
    });
  });
});
