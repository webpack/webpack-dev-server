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

  describe('port', () => {
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

    it('should allow port to be a string', () => {
      let error = null;
      try {
        const port = '';
        server = new Server(compiler, { port });
      } catch (err) {
        error = err;
      }
      expect(error).toBe(null);
    });

    it('should allow port to be a number', () => {
      let error = null;
      try {
        const port = 0;
        server = new Server(compiler, { port });
      } catch (err) {
        error = err;
      }
      expect(error).toBe(null);
    });

    it('should allow port to be null', () => {
      let error = null;
      try {
        const port = null;
        server = new Server(compiler, { port });
      } catch (err) {
        error = err;
      }
      expect(error).toBe(null);
    });

    it('should not allow port to be the wrong type', () => {
      let error = null;
      try {
        server = new Server(compiler, { port: false });
      } catch (err) {
        error = err;
      }
      expect(error).toBeInstanceOf(ValidationError);
    });
  });
});
