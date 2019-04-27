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

  describe('allowedHosts', () => {
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

    it('should allow allowedHosts to be an array', () => {
      let error = null;
      try {
        const allowedHosts = [];

        server = new Server(compiler, { allowedHosts });
      } catch (err) {
        error = err;
      }
      expect(error).toBe(null);
    });

    it('should allow allowedHosts to be an array of strings', () => {
      let error = null;
      try {
        const allowedHosts = [''];

        server = new Server(compiler, { allowedHosts });
      } catch (err) {
        error = err;
      }
      expect(error).toBe(null);
    });

    it('should not allow allowedHosts to be an array of wrong type', () => {
      let error = null;
      try {
        const allowedHosts = [false];

        server = new Server(compiler, { allowedHosts });
      } catch (err) {
        error = err;
      }
      expect(error).toBeInstanceOf(ValidationError);
    });

    it('should not allow allowedHosts to be the wrong type', () => {
      let error = null;
      try {
        server = new Server(compiler, { allowedHosts: false });
      } catch (err) {
        error = err;
      }
      expect(error).toBeInstanceOf(ValidationError);
    });
  });
});
