'use strict';

/* eslint import/no-extraneous-dependencies: off */

const should = require('should');
const helper = require('../helper');
const config = require('../fixtures/simple-config/webpack.config');

describe('Lazy', () => {
  let server;

  afterEach((done) => {
    helper.close(server, done);
  });

  it('without filename option it should throw an error', () => {
    should.throws(() => {
      server = helper.start(config, {
        lazy: true
      });
    }, /'filename' option must be set/);
  });

  it('with filename option should not throw an error', (done) => {
    server = helper.start(config, {
      lazy: true,
      filename: 'bundle.js'
    }, done);
  });
});
