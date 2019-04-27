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

  describe('pfxPassphrase', () => {
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

    it('should allow pfxPassphrase to be a string', () => {
      let error = null;
      try {
        const pfxPassphrase = '';
        server = new Server(compiler, { pfxPassphrase });
      } catch (err) {
        error = err;
      }
      expect(error).toBe(null);
    });

    it('should not allow pfxPassphrase to be the wrong type', () => {
      let error = null;
      try {
        server = new Server(compiler, { pfxPassphrase: false });
      } catch (err) {
        error = err;
      }
      expect(error).toBeInstanceOf(ValidationError);
    });
  });
});
