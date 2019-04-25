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

  describe('proxy', () => {
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

    it('should allow proxy to be an object', () => {
      let error = null;
      try {
        const proxy = { '/api': 'http://localhost:3000' };
        server = new Server(compiler, { proxy });
      } catch (err) {
        error = err;
      }
      expect(error).toBe(null);
    });

    it('should allow proxy to be an array of objects', () => {
      let error = null;
      try {
        const proxy = [{ '/api': 'http://localhost:3000' }];
        server = new Server(compiler, { proxy });
      } catch (err) {
        error = err;
      }
      expect(error).toBe(null);
    });

    // NOTE: this crashes the app
    it.skip('should allow proxy to be an array of functions', () => {
      let error = null;
      try {
        const proxy = [() => {}];
        server = new Server(compiler, { proxy });
      } catch (err) {
        error = err;
      }
      expect(error).toBe(null);
    });

    it('should not allow proxy to be an empty array', () => {
      let error = null;
      try {
        server = new Server(compiler, { proxy: [] });
      } catch (err) {
        error = err;
      }
      expect(error).toBeInstanceOf(ValidationError);
    });

    it('should not allow proxy to be a function', () => {
      let error = null;
      try {
        server = new Server(compiler, { proxy: () => {} });
      } catch (err) {
        error = err;
      }
      expect(error).toBeInstanceOf(ValidationError);
    });

    it('should not allow proxy to be the wrong type', () => {
      let error = null;
      try {
        server = new Server(compiler, { proxy: false });
      } catch (err) {
        error = err;
      }
      expect(error).toBeInstanceOf(ValidationError);
    });
  });
});
