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

  describe('watchOptions', () => {
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

    it('should allow watchOptions to be an object', () => {
      let error = null;
      try {
        const watchOptions = {};
        server = new Server(compiler, { watchOptions });
      } catch (err) {
        error = err;
      }
      expect(error).toBe(null);
    });

    it('should not allow watchOptions to be the wrong type', () => {
      let error = null;
      try {
        server = new Server(compiler, { watchOptions: '' });
      } catch (err) {
        error = err;
      }
      expect(error).toBeInstanceOf(ValidationError);
    });
  });
});
