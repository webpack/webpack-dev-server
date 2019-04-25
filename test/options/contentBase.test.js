'use strict';

const ValidationError = require('schema-utils/src/ValidationError');
const webpack = require('webpack');
const Server = require('../../lib/Server');
const config = require('../fixtures/simple-config/webpack.config');

const realWarn = console.warn;

describe('Validation', () => {
  let compiler;
  let server;

  beforeAll(() => {
    compiler = webpack(config);
  });

  describe('contentBase', () => {
    beforeEach(() => {
      server = null;
      console.warn = jest.fn();
    });
    afterEach((done) => {
      console.warn = realWarn;
      if (server) {
        server.close(() => {
          done();
        });
      } else {
        done();
      }
    });

    it('should allow contentBase to be a number', () => {
      let error = null;
      try {
        const contentBase = 0;
        server = new Server(compiler, { contentBase });
      } catch (err) {
        error = err;
      }
      expect(error).toBe(null);
    });

    it('should warn when contentBase is a number', () => {
      const contentBase = 0;
      server = new Server(compiler, { contentBase });
      expect(console.warn).toHaveBeenCalledTimes(2);
    });

    it('should allow contentBase to be a string', () => {
      let error = null;
      try {
        const contentBase = '.';
        server = new Server(compiler, { contentBase });
      } catch (err) {
        error = err;
      }
      expect(error).toBe(null);
    });

    it('should allow contentBase to be an array of strings', () => {
      let error = null;
      try {
        const contentBase = ['.'];
        server = new Server(compiler, { contentBase });
      } catch (err) {
        error = err;
      }
      expect(error).toBe(null);
    });

    it('should allow contentBase to be false', () => {
      let error = null;
      try {
        const contentBase = false;
        server = new Server(compiler, { contentBase });
      } catch (err) {
        error = err;
      }
      expect(error).toBe(null);
    });

    // NOTE: this crashes the server
    it.skip('should not allow contentBase to be an empty string', () => {
      let error = null;
      try {
        const contentBase = '';
        server = new Server(compiler, { contentBase });
      } catch (err) {
        error = err;
      }
      expect(error).toBeInstanceOf(ValidationError);
    });

    // NOTE: this crashes the server
    it.skip('should not allow contentBase to be an array of empty strings', () => {
      let error = null;
      try {
        const contentBase = [''];
        server = new Server(compiler, { contentBase });
      } catch (err) {
        error = err;
      }
      expect(error).toBeInstanceOf(ValidationError);
    });

    it('should not allow contentBase to be an empty array', () => {
      let error = null;
      try {
        const contentBase = [];
        server = new Server(compiler, { contentBase });
      } catch (err) {
        error = err;
      }
      expect(error).toBeInstanceOf(ValidationError);
    });

    it('should not allow contentBase to be an array of numbers', () => {
      let error = null;
      try {
        const contentBase = [1];
        server = new Server(compiler, { contentBase });
      } catch (err) {
        error = err;
      }
      expect(error).toBeInstanceOf(ValidationError);
    });

    it('should not allow contentBase to be an array of false', () => {
      let error = null;
      try {
        const contentBase = [false];
        server = new Server(compiler, { contentBase });
      } catch (err) {
        error = err;
      }
      expect(error).toBeInstanceOf(ValidationError);
    });

    it('should not allow contentBase to be true', () => {
      let error = null;
      try {
        server = new Server(compiler, { contentBase: true });
      } catch (err) {
        error = err;
      }
      expect(error).toBeInstanceOf(ValidationError);
    });

    it('should not allow contentBase to be the wrong type', () => {
      let error = null;
      try {
        server = new Server(compiler, { contentBase: {} });
      } catch (err) {
        error = err;
      }
      expect(error).toBeInstanceOf(ValidationError);
    });
  });
});
