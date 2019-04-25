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

  describe('lazy', () => {
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

    it('should require filename when lazy is a boolean', () => {
      let error = null;
      try {
        const lazy = true;
        server = new Server(compiler, { lazy });
      } catch (err) {
        error = err;
      }
      expect(error).toBeInstanceOf(Error);
    });

    it('should allow lazy to be a boolean', () => {
      let error = null;
      try {
        const lazy = true;
        server = new Server(compiler, { lazy, filename: '.' });
      } catch (err) {
        error = err;
      }
      expect(error).toBe(null);
    });

    it('should not allow lazy to be the wrong type', () => {
      let error = null;
      try {
        server = new Server(compiler, { lazy: '', filename: '.' });
      } catch (err) {
        error = err;
      }
      expect(error).toBeInstanceOf(ValidationError);
    });
  });
});
