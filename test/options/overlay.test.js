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

  describe('overlay', () => {
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

    it('should allow overlay to be a boolean', () => {
      let error = null;
      try {
        const overlay = true;
        server = new Server(compiler, { overlay });
      } catch (err) {
        error = err;
      }
      expect(error).toBe(null);
    });

    it('should allow overlay to be an empty object', () => {
      let error = null;
      try {
        const overlay = {};
        server = new Server(compiler, { overlay });
      } catch (err) {
        error = err;
      }
      expect(error).toBe(null);
    });

    it('should allow overlay to be an object with errors boolean', () => {
      let error = null;
      try {
        const overlay = { errors: true };
        server = new Server(compiler, { overlay });
      } catch (err) {
        error = err;
      }
      expect(error).toBe(null);
    });

    it('should allow overlay to be an object with warnings boolean', () => {
      let error = null;
      try {
        const overlay = { warnings: true };
        server = new Server(compiler, { overlay });
      } catch (err) {
        error = err;
      }
      expect(error).toBe(null);
    });

    it('should allow overlay to be an object with arbitrary property', () => {
      let error = null;
      try {
        const overlay = { arbitrary: '' };
        server = new Server(compiler, { overlay });
      } catch (err) {
        error = err;
      }
      expect(error).toBe(null);
    });

    it('should not allow overlay to be an object with errors string', () => {
      let error = null;
      try {
        const overlay = { errors: '' };
        server = new Server(compiler, { overlay });
      } catch (err) {
        error = err;
      }
      expect(error).toBeInstanceOf(ValidationError);
    });

    it('should not allow overlay to be an object with warnings string', () => {
      let error = null;
      try {
        const overlay = { warnings: '' };
        server = new Server(compiler, { overlay });
      } catch (err) {
        error = err;
      }
      expect(error).toBeInstanceOf(ValidationError);
    });

    it('should not allow overlay to be the wrong type', () => {
      let error = null;
      try {
        server = new Server(compiler, { overlay: '' });
      } catch (err) {
        error = err;
      }
      expect(error).toBeInstanceOf(ValidationError);
    });
  });
});
