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

  describe('headers', () => {
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

    it('should allow headers to be an object', () => {
      let error = null;
      try {
        const headers = {};
        server = new Server(compiler, { headers });
      } catch (err) {
        error = err;
      }
      expect(error).toBe(null);
    });

    it('should not allow headers to be the wrong type', () => {
      let error = null;
      try {
        server = new Server(compiler, { headers: false });
      } catch (err) {
        error = err;
      }
      expect(error).toBeInstanceOf(ValidationError);
    });
  });
});
