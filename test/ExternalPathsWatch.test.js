'use strict';

/* eslint-disable
  no-unused-vars
*/
const path = require('path');
const webpack = require('webpack');
const Server = require('../lib/Server');
const config = require('./fixtures/simple-config/webpack.config');

const contentBasePublic = path.join(
  __dirname,
  'fixtures/contentbase-config/public'
);
const contentBaseOther = path.join(
  __dirname,
  'fixtures/contentbase-config/other'
);
const compiler = webpack(config);

describe('Watching external files', () => {
  let server;

  describe('testing single & multiple external paths', () => {
    it('Should throw exception (single line)', (done) => {
      try {
        // eslint-disable-next-line no-unused-vars
        server = new Server(compiler, {
          contentBase: 'https://example.com/',
          watchContentBase: true,
        });

        expect(true).toBe(false);
      } catch (e) {
        expect(e.message).toBe('Watching remote files is not supported.');
        compiler.run(() => {
          done();
        });
      }
    });
    it('Should throw exception (array)', (done) => {
      try {
        // eslint-disable-next-line no-unused-vars
        server = new Server(compiler, {
          contentBase: [contentBasePublic, 'https://example.com/'],
          watchContentBase: true,
        });

        expect(true).toBe(false);
      } catch (e) {
        expect(e.message).toBe('Watching remote files is not supported.');
        compiler.run(() => {
          done();
        });
      }
    });
  });

  describe('testing single & multiple internal paths', () => {
    it('Should not throw exception (single line)', (done) => {
      try {
        // eslint-disable-next-line no-unused-vars
        server = new Server(compiler, {
          contentBase: contentBasePublic,
          watchContentBase: true,
        });

        compiler.run(() => {
          done();
        });
      } catch (e) {
        expect(true).toBe(false);
      }
    });
    it('Should not throw exception (array)', (done) => {
      try {
        // eslint-disable-next-line no-unused-vars
        server = new Server(compiler, {
          contentBase: [contentBasePublic, contentBaseOther],
          watchContentBase: true,
        });

        compiler.run(() => {
          done();
        });
      } catch (e) {
        expect(true).toBe(false);
      }
    });
  });
});
