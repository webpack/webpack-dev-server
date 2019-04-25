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

  describe('mimeTypes', () => {
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

    it('should allow mimeTypes to be an object', () => {
      let error = null;
      try {
        const mimeTypes = {};
        server = new Server(compiler, { mimeTypes });
      } catch (err) {
        error = err;
      }
      expect(error).toBe(null);
    });

    it('should not allow mimeTypes to be the wrong type', () => {
      let error = null;
      try {
        server = new Server(compiler, { mimeTypes: false });
      } catch (err) {
        error = err;
      }
      expect(error).toBeInstanceOf(ValidationError);
    });
  });
});
