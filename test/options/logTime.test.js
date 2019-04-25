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

  describe('logTime', () => {
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

    it('should allow logTime to be a boolean', () => {
      let error = null;
      try {
        const logTime = true;
        server = new Server(compiler, { logTime });
      } catch (err) {
        error = err;
      }
      expect(error).toBe(null);
    });

    it('should not allow logTime to be the wrong type', () => {
      let error = null;
      try {
        server = new Server(compiler, { logTime: '' });
      } catch (err) {
        error = err;
      }
      expect(error).toBeInstanceOf(ValidationError);
    });
  });
});
