'use strict';

const path = require('path');
const fs = require('fs');
const request = require('supertest');
const helper = require('./helper');
const config = require('./fixtures/contentbase-config/webpack.config');
const skipTestOnWindows = require('./helpers/conditional-test')
  .skipTestOnWindows;

const httpsCertificateDirectory = path.join(
  __dirname,
  'fixtures/https-certificate'
);
const contentBasePublic = path.join(
  __dirname,
  'fixtures/contentbase-config/public'
);

describe('HTTPS', () => {
  let server;
  let req;

  describe('is boolean', () => {
    beforeAll((done) => {
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

    afterAll(() => {
      helper.close();
    });
  });

  describe('ca, pfx, key and cert are buffer', () => {
    beforeAll((done) => {
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

  describe('ca, pfx, key and cert are paths', () => {
    beforeAll((done) => {
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

  describe('ca, pfx, key and cert are symlinks', () => {
    if (skipTestOnWindows('Symlinks are not supported on Windows')) {
      return;
    }

    beforeAll((done) => {
      server = helper.start(
        config,
        {
          contentBase: contentBasePublic,
          https: {
            ca: path.join(httpsCertificateDirectory, 'ca-symlink.pem'),
            pfx: path.join(httpsCertificateDirectory, 'server-symlink.pfx'),
            key: path.join(httpsCertificateDirectory, 'server-symlink.key'),
            cert: path.join(httpsCertificateDirectory, 'server-symlink.crt'),
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

    afterAll(helper.close);
  });

  describe('ca, pfx, key and cert are raw strings', () => {
    beforeAll((done) => {
      server = helper.start(
        config,
        {
          contentBase: contentBasePublic,
          https: {
            ca: fs
              .readFileSync(path.join(httpsCertificateDirectory, 'ca.pem'))
              .toString(),
            // pfx can't be string because it is binary format
            pfx: fs.readFileSync(
              path.join(httpsCertificateDirectory, 'server.pfx')
            ),
            key: fs
              .readFileSync(path.join(httpsCertificateDirectory, 'server.key'))
              .toString(),
            cert: fs
              .readFileSync(path.join(httpsCertificateDirectory, 'server.crt'))
              .toString(),
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

  afterEach(helper.close);
});
