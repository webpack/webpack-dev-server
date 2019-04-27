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

  describe('logLevel', () => {
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

    it('should allow logLevel to be a "info"', () => {
      let error = null;
      try {
        const logLevel = 'info';
        server = new Server(compiler, { logLevel });
      } catch (err) {
        error = err;
      }
      expect(error).toBe(null);
    });

    it('should allow logLevel to be a "warn"', () => {
      let error = null;
      try {
        const logLevel = 'warn';
        server = new Server(compiler, { logLevel });
      } catch (err) {
        error = err;
      }
      expect(error).toBe(null);
    });

    it('should allow logLevel to be a "error"', () => {
      let error = null;
      try {
        const logLevel = 'error';
        server = new Server(compiler, { logLevel });
      } catch (err) {
        error = err;
      }
      expect(error).toBe(null);
    });

    it('should allow logLevel to be a "debug"', () => {
      let error = null;
      try {
        const logLevel = 'debug';
        server = new Server(compiler, { logLevel });
      } catch (err) {
        error = err;
      }
      expect(error).toBe(null);
    });

    it('should allow logLevel to be a "trace"', () => {
      let error = null;
      try {
        const logLevel = 'trace';
        server = new Server(compiler, { logLevel });
      } catch (err) {
        error = err;
      }
      expect(error).toBe(null);
    });

    it('should allow logLevel to be a "silent"', () => {
      let error = null;
      try {
        const logLevel = 'silent';
        server = new Server(compiler, { logLevel });
      } catch (err) {
        error = err;
      }
      expect(error).toBe(null);
    });

    it('should not allow logLevel to be the wrong string', () => {
      let error = null;
      try {
        const logLevel = 'whoops!';
        server = new Server(compiler, { logLevel });
      } catch (err) {
        error = err;
      }
      expect(error).toBeInstanceOf(Error);
    });

    it('should not allow logLevel to be the wrong type', () => {
      let error = null;
      try {
        server = new Server(compiler, { logLevel: false });
      } catch (err) {
        error = err;
      }
      expect(error).toBeInstanceOf(ValidationError);
    });
  });
});
