'use strict';

const path = require('path');
const fs = require('graceful-fs');
const request = require('supertest');
const testServer = require('../helpers/test-server');
const config = require('../fixtures/contentbase-config/webpack.config');
const { skipTestOnWindows } = require('../helpers/conditional-test');
const port = require('../ports-map')['https-option'];

const httpsCertificateDirectory = path.resolve(
  __dirname,
  '../fixtures/https-certificate'
);
const contentBasePublic = path.resolve(
  __dirname,
  '../fixtures/contentbase-config/public'
);

describe('https option', () => {
  let server;
  let req;

  describe('as a boolean', () => {
    beforeAll((done) => {
      server = testServer.start(
        config,
        {
          static: {
            directory: contentBasePublic,
            watch: false,
          },
          https: true,
          port,
        },
        done
      );
      req = request(server.app);
    });

    it('Request to index', async () => {
      const res = await req.get('/');
      expect(res.status).toEqual(200);
      expect(res.text).toContain('Heyo');
    });

    afterAll(testServer.close);
  });

  describe('as an object when cacert, pfx, key and cert are buffer', () => {
    beforeAll((done) => {
      server = testServer.start(
        config,
        {
          static: {
            directory: contentBasePublic,
            watch: false,
          },
          https: {
            cacert: fs.readFileSync(
              path.join(httpsCertificateDirectory, 'ca.pem')
            ),
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
          port,
        },
        done
      );
      req = request(server.app);
    });

    it('Request to index', async () => {
      const res = await req.get('/');
      expect(res.status).toEqual(200);
      expect(res.text).toContain('Heyo');
    });
  });

  describe('as an object when cacert, pfx, key and cert are paths', () => {
    beforeAll((done) => {
      server = testServer.start(
        config,
        {
          static: contentBasePublic,
          https: {
            cacert: path.join(httpsCertificateDirectory, 'ca.pem'),
            pfx: path.join(httpsCertificateDirectory, 'server.pfx'),
            key: path.join(httpsCertificateDirectory, 'server.key'),
            cert: path.join(httpsCertificateDirectory, 'server.crt'),
            passphrase: 'webpack-dev-server',
          },
          port,
        },
        done
      );
      req = request(server.app);
    });

    it('Request to index', async () => {
      const res = await req.get('/');
      expect(res.status).toEqual(200);
      expect(res.text).toContain('Heyo');
    });
  });

  describe('as an object when cacert, pfx, key and cert are symlinks', () => {
    if (skipTestOnWindows('Symlinks are not supported on Windows')) {
      return;
    }

    beforeAll((done) => {
      server = testServer.start(
        config,
        {
          static: {
            directory: contentBasePublic,
            watch: false,
          },
          https: {
            cacert: path.join(httpsCertificateDirectory, 'ca-symlink.pem'),
            pfx: path.join(httpsCertificateDirectory, 'server-symlink.pfx'),
            key: path.join(httpsCertificateDirectory, 'server-symlink.key'),
            cert: path.join(httpsCertificateDirectory, 'server-symlink.crt'),
            passphrase: 'webpack-dev-server',
          },
          port,
        },
        done
      );
      req = request(server.app);
    });

    it('Request to index', async () => {
      const res = await req.get('/');
      expect(res.status).toEqual(200);
      expect(res.text).toContain('Heyo');
    });

    afterAll(testServer.close);
  });

  describe('as an object when cacert, pfx, key and cert are raw strings', () => {
    beforeAll((done) => {
      server = testServer.start(
        config,
        {
          static: {
            directory: contentBasePublic,
            watch: false,
          },
          https: {
            cacert: fs
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
          port,
        },
        done
      );
      req = request(server.app);
    });

    it('Request to index', async () => {
      const res = await req.get('/');
      expect(res.status).toEqual(200);
      expect(res.text).toContain('Heyo');
    });
  });

  describe('should support the "requestCert" option', () => {
    beforeAll((done) => {
      server = testServer.start(
        config,
        {
          static: {
            directory: contentBasePublic,
            watch: false,
          },
          https: {
            requestCert: true,
            cacert: fs.readFileSync(
              path.join(httpsCertificateDirectory, 'ca.pem')
            ),
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
          port,
        },
        done
      );
      req = request(server.app);
    });

    it('Request to index', async () => {
      const res = await req.get('/');
      expect(res.status).toEqual(200);
      expect(res.text).toContain('Heyo');
    });
  });

  afterEach(testServer.close);
});
