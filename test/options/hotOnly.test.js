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

  describe('hotOnly', () => {
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

    it('should allow hotOnly to be a boolean', () => {
      let error = null;
      try {
        const hotOnly = true;
        server = new Server(compiler, { hotOnly });
      } catch (err) {
        error = err;
      }
      expect(error).toBe(null);
    });

    it('should not allow hotOnly to be the wrong type', () => {
      let error = null;
      try {
        server = new Server(compiler, { hotOnly: '' });
      } catch (err) {
        error = err;
      }
      expect(error).toBeInstanceOf(ValidationError);
    });
  });
});
