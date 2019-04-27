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

  describe('filename', () => {
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

    it('should allow filename to be a string', () => {
      let error = null;
      try {
        const filename = '';
        server = new Server(compiler, { filename });
      } catch (err) {
        error = err;
      }
      expect(error).toBe(null);
    });

    it('should allow filename to be a RegExp', () => {
      let error = null;
      try {
        const filename = new RegExp('');
        server = new Server(compiler, { filename });
      } catch (err) {
        error = err;
      }
      expect(error).toBe(null);
    });

    it('should allow filename to be a Function', () => {
      let error = null;
      try {
        const filename = () => {};
        server = new Server(compiler, { filename });
      } catch (err) {
        error = err;
      }
      expect(error).toBe(null);
    });

    it('should not allow filename to be the wrong type', () => {
      let error = null;
      try {
        server = new Server(compiler, { filename: false });
      } catch (err) {
        error = err;
      }
      expect(error).toBeInstanceOf(ValidationError);
    });
  });
});
