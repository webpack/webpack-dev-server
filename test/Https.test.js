'use strict';

const path = require('path');
const fs = require('fs');
const request = require('supertest');
const helper = require('./helper');
const config = require('./fixtures/contentbase-config/webpack.config');
require('mocha-sinon');

const httpsCertificateDirectory = path.join(
  __dirname,
  'fixtures/https-certificate'
);
const contentBasePublic = path.join(
  __dirname,
  'fixtures/contentbase-config/public'
);

describe('HTTPS', function testHttps() {
  let server;
  let req;
  afterEach(helper.close);

  // Increase the timeout to 20 seconds to allow time for key generation.
  this.timeout(20000);

  describe('to directory', () => {
    before((done) => {
      server = helper.start(
        config,
        {
          contentBase: contentBasePublic,
          https: true,
        },
        done
      );
      req = request(server.app);
    });

    it('Request to index', (done) => {
      req.get('/').expect(200, /Heyo/, done);
    });
  });

  describe('ca, pfx, key and cert are buffer', () => {
    before((done) => {
      server = helper.start(
        config,
        {
          contentBase: contentBasePublic,
          https: {
            ca: fs.readFileSync(path.join(httpsCertificateDirectory, 'ca.pem')),
            pfx: fs.readFileSync(
              path.join(httpsCertificateDirectory, 'server.pfx')
            ),
            key: fs.readFileSync(
              path.join(httpsCertificateDirectory, 'server.key')
            ),
            cert: fs.readFileSync(
              path.join(httpsCertificateDirectory, 'server.crt')
            ),
            passphrase: 'webpack-dev-server',
          },
        },
        done
      );
      req = request(server.app);
    });

    it('Request to index', (done) => {
      req.get('/').expect(200, /Heyo/, done);
    });
  });

  describe('ca, pfx, key and cert are string', () => {
    before((done) => {
      server = helper.start(
        config,
        {
          contentBase: contentBasePublic,
          https: {
            ca: path.join(httpsCertificateDirectory, 'ca.pem'),
            pfx: path.join(httpsCertificateDirectory, 'server.pfx'),
            key: path.join(httpsCertificateDirectory, 'server.key'),
            cert: path.join(httpsCertificateDirectory, 'server.crt'),
            passphrase: 'webpack-dev-server',
          },
        },
        done
      );
      req = request(server.app);
    });

    it('Request to index', (done) => {
      req.get('/').expect(200, /Heyo/, done);
    });
  });
});
