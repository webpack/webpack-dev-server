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

  describe('stats', () => {
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

    it('should allow stats to be a boolean', () => {
      let error = null;
      try {
        const stats = true;
        server = new Server(compiler, { stats });
      } catch (err) {
        error = err;
      }
      expect(error).toBe(null);
    });

    it('should allow stats to be an object', () => {
      let error = null;
      try {
        const stats = {};
        server = new Server(compiler, { stats });
      } catch (err) {
        error = err;
      }
      expect(error).toBe(null);
    });

    it('should allow stats to be "none"', () => {
      let error = null;
      try {
        const stats = 'none';
        server = new Server(compiler, { stats });
      } catch (err) {
        error = err;
      }
      expect(error).toBe(null);
    });

    it('should allow stats to be "errors-only"', () => {
      let error = null;
      try {
        const stats = 'errors-only';
        server = new Server(compiler, { stats });
      } catch (err) {
        error = err;
      }
      expect(error).toBe(null);
    });

    it('should allow stats to be "minimal"', () => {
      let error = null;
      try {
        const stats = 'minimal';
        server = new Server(compiler, { stats });
      } catch (err) {
        error = err;
      }
      expect(error).toBe(null);
    });

    it('should allow stats to be "normal"', () => {
      let error = null;
      try {
        const stats = 'normal';
        server = new Server(compiler, { stats });
      } catch (err) {
        error = err;
      }
      expect(error).toBe(null);
    });

    it('should allow stats to be "verbose"', () => {
      let error = null;
      try {
        const stats = 'verbose';
        server = new Server(compiler, { stats });
      } catch (err) {
        error = err;
      }
      expect(error).toBe(null);
    });

    it('should not allow stats to be the wrong string', () => {
      let error = null;
      try {
        server = new Server(compiler, { stats: 'whoops!' });
      } catch (err) {
        error = err;
      }
      expect(error).toBeInstanceOf(ValidationError);
    });

    it('should not allow stats to be the wrong type', () => {
      let error = null;
      try {
        server = new Server(compiler, { stats: null });
      } catch (err) {
        error = err;
      }
      expect(error).toBeInstanceOf(ValidationError);
    });
  });
});
