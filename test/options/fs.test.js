'use strict';

const path = require('path');
const { createFsFromVolume, Volume } = require('memfs');
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

  describe('fs', () => {
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

    it('should allow fs to be memfs', () => {
      let error = null;
      try {
        const memfs = createFsFromVolume(new Volume());
        // We need to patch memfs
        // https://github.com/webpack/webpack-dev-middleware#fs
        memfs.join = path.join;

        server = new Server(compiler, { fs: memfs });
      } catch (err) {
        error = err;
      }
      expect(error).toBe(null);
    });

    it('should not allow fs to be the wrong type', () => {
      let error = null;
      try {
        server = new Server(compiler, { fs: false });
      } catch (err) {
        error = err;
      }
      expect(error).toBeInstanceOf(ValidationError);
    });
  });
});
