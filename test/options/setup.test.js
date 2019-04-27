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

  describe('setup', () => {
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

    it('should allow setup to be a function', () => {
      let error = null;
      try {
        const setup = () => {};
        server = new Server(compiler, { setup });
      } catch (err) {
        error = err;
      }
      expect(error).toBe(null);
    });

    it('should warn when setup is defined', () => {
      const setup = () => {};
      server = new Server(compiler, { setup });
      expect(console.warn).toHaveBeenCalledTimes(1);
    });

    it('should not allow setup to be the wrong type', () => {
      let error = null;
      try {
        server = new Server(compiler, { setup: '' });
      } catch (err) {
        error = err;
      }
      expect(error).toBeInstanceOf(ValidationError);
    });
  });
});
