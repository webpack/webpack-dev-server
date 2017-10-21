'use strict';

/* eslint import/no-extraneous-dependencies: off */

const webpack = require('webpack');
const should = require('should');
const DevServer = require('../../lib/DevServer');
const { createDomain } = require('../../lib/util');
const config = require('../fixtures/simple-config/webpack.config');
const tests = require('../fixtures/create-domain');

describe('check utility funcitons', () => {
  let compiler;

  before(() => {
    compiler = webpack(config);
  });

  for (const t of tests) {
    // can't use an arrow function or else this.timeout won't work
    it(`test createDomain '${t.name}'`, function i(done) { // eslint-disable-line
      if (t.timeout) {
        this.timeout(t.timeout);
      }

      const options = t.options;

      options.publicPath = '/';

      const devServer = new DevServer(compiler, options);
      const expected = t.expected;

      devServer.listen((err) => {
        if (err) {
          devServer.close();
          done(err);
        }

        const generatedDomain = createDomain(options, devServer.server);

        devServer.close();

        should(generatedDomain).equal(expected);
        done();
      });
    });
  }
});
