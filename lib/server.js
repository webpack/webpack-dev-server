'use strict';

const fs = require('fs');
const http = require('http');
const path = require('path');
const del = require('del');
const selfsigned = require('selfsigned');
const spdy = require('spdy');
const log = require('./log');

// comment to override merge issue
module.exports = {
  http(app) {
    return http.createServer(app);
  },

  https(app, options) {
    if (typeof options.https === 'boolean') {
      options.https = {
        key: options.key,
        cert: options.cert,
        ca: options.ca,
        pfx: options.pfx,
        passphrase: options.pfxPassphrase,
        requestCert: options.requestCert || false
      };
    }

    let fakeCert;
    if (!options.https.key || !options.https.cert) {
      // Use a self-signed certificate if no certificate was configured.
      // Cycle certs every 24 hours
      const certPath = path.join(__dirname, '../ssl/server.pem');
      let certExists = fs.existsSync(certPath);

      if (certExists) {
        const certStat = fs.statSync(certPath);
        const certTtl = 1000 * 60 * 60 * 24;
        const now = new Date();

        // cert is more than 30 days old, kill it with fire
        if ((now - certStat.ctime) / certTtl > 30) {
          log('SSL Certificate is more than 30 days old. Removing.');
          del.sync([certPath], { force: true });
          certExists = false;
        }
      }

      if (!certExists) {
        log('Generating SSL Certificate');
        const attrs = [{ name: 'commonName', value: 'localhost' }];
        const pems = selfsigned.generate(attrs, {
          algorithm: 'sha256',
          days: 30,
          keySize: 2048,
          extensions: [{
            name: 'basicConstraints',
            cA: true
          }, {
            name: 'keyUsage',
            keyCertSign: true,
            digitalSignature: true,
            nonRepudiation: true,
            keyEncipherment: true,
            dataEncipherment: true
          }, {
            name: 'subjectAltName',
            altNames: [
              {
                // type 2 is DNS
                type: 2,
                value: 'localhost'
              },
              {
                type: 2,
                value: 'localhost.localdomain'
              },
              {
                type: 2,
                value: 'lvh.me'
              },
              {
                type: 2,
                value: '*.lvh.me'
              },
              {
                type: 2,
                value: '[::1]'
              },
              {
                // type 7 is IP
                type: 7,
                ip: '127.0.0.1'
              },
              {
                type: 7,
                ip: 'fe80::1'
              }
            ]
          }]
        });

        fs.writeFileSync(certPath, pems.private + pems.cert, { encoding: 'utf-8' });
      }
      fakeCert = fs.readFileSync(certPath);
    }

    options.https.key = options.https.key || fakeCert;
    options.https.cert = options.https.cert || fakeCert;

    if (!options.https.spdy) {
      options.https.spdy = {
        protocols: ['h2', 'http/1.1']
      };
    }

    return spdy.createServer(options.https, app);
  }
};
