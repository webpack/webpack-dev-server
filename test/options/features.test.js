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

  describe('features', () => {
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

    it('should allow features to be an array of strings', () => {
      let error = null;
      try {
        const features = ['before'];
        server = new Server(compiler, { features });
      } catch (err) {
        error = err;
      }
      expect(error).toBe(null);
    });

    it('should allow features to be an empty array', () => {
      let error = null;
      try {
        const features = [];
        server = new Server(compiler, { features });
      } catch (err) {
        error = err;
      }
      expect(error).toBe(null);
    });

    it('should not allow features to be an array of wrong types', () => {
      let error = null;
      try {
        const features = [true];
        server = new Server(compiler, { features });
      } catch (err) {
        error = err;
      }
      expect(error).toBeInstanceOf(Error);
    });

    it('should not allow features to be the wrong type', () => {
      let error = null;
      try {
        server = new Server(compiler, { features: false });
      } catch (err) {
        error = err;
      }
      expect(error).toBeInstanceOf(ValidationError);
    });
  });
});
