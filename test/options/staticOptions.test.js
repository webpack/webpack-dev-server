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

  describe('staticOptions', () => {
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

    it('should allow staticOptions to be an object', () => {
      let error = null;
      try {
        const staticOptions = {};
        server = new Server(compiler, { staticOptions });
      } catch (err) {
        error = err;
      }
      expect(error).toBe(null);
    });

    it('should not allow staticOptions to be the wrong type', () => {
      let error = null;
      try {
        server = new Server(compiler, { staticOptions: false });
      } catch (err) {
        error = err;
      }
      expect(error).toBeInstanceOf(ValidationError);
    });
  });
});
