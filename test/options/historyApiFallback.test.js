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

  describe('historyApiFallback', () => {
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

    it('should allow historyApiFallback to be an object', () => {
      let error = null;
      try {
        const historyApiFallback = {};
        server = new Server(compiler, { historyApiFallback });
      } catch (err) {
        error = err;
      }
      expect(error).toBe(null);
    });

    it('should allow historyApiFallback to be an boolean', () => {
      let error = null;
      try {
        const historyApiFallback = true;
        server = new Server(compiler, { historyApiFallback });
      } catch (err) {
        error = err;
      }
      expect(error).toBe(null);
    });

    it('should not allow historyApiFallback to be the wrong type', () => {
      let error = null;
      try {
        server = new Server(compiler, { historyApiFallback: '' });
      } catch (err) {
        error = err;
      }
      expect(error).toBeInstanceOf(ValidationError);
    });
  });
});
