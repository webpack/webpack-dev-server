'use strict';

/* eslint-disable
  space-before-function-paren
*/
const path = require('path');
const fs = require('fs');
const del = require('del');
const createCertificate = require('./createCertificate');

function getSSLCertificate (server) {
  // Use a self-signed certificate if no certificate was configured.
  // Cycle certs every 24 hours
  const certPath = path.join(__dirname, '../../ssl/server.pem');

  let certExists = fs.existsSync(certPath);

  if (certExists) {
    const certTtl = 1000 * 60 * 60 * 24;
    const certStat = fs.statSync(certPath);

    const now = new Date();

    // cert is more than 30 days old, kill it with fire
    if ((now - certStat.ctime) / certTtl > 30) {
      server.log.info('SSL Certificate is more than 30 days old. Removing.');

      del.sync([certPath], { force: true });

      certExists = false;
    }
  }

  if (!certExists) {
    server.log.info('Generating SSL Certificate');

    const attrs = [
      { name: 'commonName', value: 'localhost' }
    ];

    const pems = createCertificate(attrs);

    fs.writeFileSync(
      certPath,
      pems.private + pems.cert,
      { encoding: 'utf-8' }
    );
  }

  return fs.readFileSync(certPath);
}

module.exports = getSSLCertificate;
