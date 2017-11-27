'use strict';

/* eslint import/no-extraneous-dependencies: off */
const assert = require('assert');
const fs = require('fs');
const https = require('https');
const path = require('path');
const fetch = require('node-fetch');
const helper = require('../helper');
const config = require('../fixtures/simple-config/webpack.config');

describe('https', () => {
  describe('`https` option', () => {
    let server;

    const agent = new https.Agent({
      rejectUnauthorized: false
    });

    before((done) => {
      server = helper.start(config, {
        https: true
      }, done);
    });

    after((done) => {
      helper.close(server, done);
    });

    it('should successfully GET', (done) => {
      fetch('https://localhost:8080/webpack-dev-server.js', { agent })
        .then((res) => {
          assert(res.status, 200);
          done();
        });
    });
  });

  describe('`pfx` option', () => {
    let server;

    const agent = new https.Agent({
      rejectUnauthorized: false
    });

    before((done) => {
      server = helper.start(config, {
        https: true,
        pfx: fs.readFileSync(path.join(__dirname, '../fixtures/https-cert.pfx')),
        pfxPassphrase: 'sample'
      }, done);
    });

    after((done) => {
      helper.close(server, done);
    });

    it('should successfully GET', (done) => {
      fetch('https://localhost:8080/webpack-dev-server.js', { agent })
        .then((res) => {
          assert(res.status, 200);
          done();
        });
    });
  });
});
