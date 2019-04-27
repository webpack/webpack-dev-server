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

  describe('clientLogLevel', () => {
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

    it('should allow clientLogLevel to be a "silent"', () => {
      let error = null;
      try {
        const clientLogLevel = 'silent';
        server = new Server(compiler, { clientLogLevel });
      } catch (err) {
        error = err;
      }
      expect(error).toBe(null);
    });

    it('should allow clientLogLevel to be a "info"', () => {
      let error = null;
      try {
        const clientLogLevel = 'info';
        server = new Server(compiler, { clientLogLevel });
      } catch (err) {
        error = err;
      }
      expect(error).toBe(null);
    });

    it('should allow clientLogLevel to be a "error"', () => {
      let error = null;
      try {
        const clientLogLevel = 'error';
        server = new Server(compiler, { clientLogLevel });
      } catch (err) {
        error = err;
      }
      expect(error).toBe(null);
    });

    it('should allow clientLogLevel to be a "warn"', () => {
      let error = null;
      try {
        const clientLogLevel = 'warn';
        server = new Server(compiler, { clientLogLevel });
      } catch (err) {
        error = err;
      }
      expect(error).toBe(null);
    });

    it('should allow clientLogLevel to be a "trace"', () => {
      let error = null;
      try {
        const clientLogLevel = 'trace';
        server = new Server(compiler, { clientLogLevel });
      } catch (err) {
        error = err;
      }
      expect(error).toBe(null);
    });

    it('should allow clientLogLevel to be a "debug"', () => {
      let error = null;
      try {
        const clientLogLevel = 'debug';
        server = new Server(compiler, { clientLogLevel });
      } catch (err) {
        error = err;
      }
      expect(error).toBe(null);
    });

    it('should not allow clientLogLevel to be the wrong string', () => {
      let error = null;
      try {
        const clientLogLevel = 'whoops!';
        server = new Server(compiler, { clientLogLevel });
      } catch (err) {
        error = err;
      }
      expect(error).toBeInstanceOf(ValidationError);
    });

    it('should not allow clientLogLevel to be the wrong type', () => {
      let error = null;
      try {
        server = new Server(compiler, { clientLogLevel: false });
      } catch (err) {
        error = err;
      }
      expect(error).toBeInstanceOf(ValidationError);
    });
  });
});
