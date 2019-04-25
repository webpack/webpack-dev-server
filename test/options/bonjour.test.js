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

  describe('bonjour', () => {
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

    it('should allow bonjour to be a boolean', () => {
      let error = null;
      try {
        const bonjour = true;
        server = new Server(compiler, { bonjour });
      } catch (err) {
        error = err;
      }
      expect(error).toBe(null);
    });

    it('should not allow bonjour to be the wrong type', () => {
      let error = null;
      try {
        server = new Server(compiler, { bonjour: '' });
      } catch (err) {
        error = err;
      }
      expect(error).toBeInstanceOf(ValidationError);
    });
  });
});
