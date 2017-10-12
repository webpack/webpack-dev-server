'use strict';

/* eslint import/no-extraneous-dependencies: off */

const webpack = require('webpack');
const should = require('should');
const Server = require('../../lib/DevServer');
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

      const server = new Server(compiler, options);
      const expected = t.expected;

      server.listen(options.port, options.host, (err) => {
        if (err) {
          done(err);
        }
        const generatedDomain = createDomain(options, server.listeningApp);
        server.close();
        should(generatedDomain).equal(expected);
        done();
      });
    });
  }
});
