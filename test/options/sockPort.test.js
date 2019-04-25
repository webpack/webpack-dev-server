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

  describe('sockPort', () => {
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

    it('should allow sockPort to be a string', () => {
      let error = null;
      try {
        const sockPort = '';
        server = new Server(compiler, { sockPort });
      } catch (err) {
        error = err;
      }
      expect(error).toBe(null);
    });

    it('should allow sockPort to be a number', () => {
      let error = null;
      try {
        const sockPort = 0;
        server = new Server(compiler, { sockPort });
      } catch (err) {
        error = err;
      }
      expect(error).toBe(null);
    });

    it('should allow sockPort to be null', () => {
      let error = null;
      try {
        const sockPort = null;
        server = new Server(compiler, { sockPort });
      } catch (err) {
        error = err;
      }
      expect(error).toBe(null);
    });

    it('should not allow sockPort to be the wrong type', () => {
      let error = null;
      try {
        server = new Server(compiler, { sockPort: false });
      } catch (err) {
        error = err;
      }
      expect(error).toBeInstanceOf(ValidationError);
    });
  });
});
