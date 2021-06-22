'use strict';

const path = require('path');
const fs = require('graceful-fs');
const request = require('supertest');
const webpack = require('webpack');
const Server = require('../../lib/Server');
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
    beforeAll(async () => {
      const compiler = webpack(config);

      server = new Server(
        {
          static: {
            directory: contentBasePublic,
            watch: false,
          },
          https: true,
          port,
        },
        compiler
      );

      await new Promise((resolve, reject) => {
        server.listen(port, '::', (error) => {
          if (error) {
            reject(error);

            return;
          }

          resolve();
        });
      });

      req = request(server.app);
    });

    afterAll(async () => {
      await new Promise((resolve) => {
        server.close(() => {
          resolve();
        });
      });
    });

    it('Request to index', async () => {
      const response = await req.get('/');

      expect(response.status).toEqual(200);
      expect(response.text).toContain('Heyo');
    });
  });

  describe('as an object when cacert, pfx, key and cert are buffer', () => {
    beforeAll(async () => {
      const compiler = webpack(config);

      server = new Server(
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
        compiler
      );

      await new Promise((resolve, reject) => {
        server.listen(port, '::', (error) => {
          if (error) {
            reject(error);

            return;
          }

          resolve();
        });
      });

      req = request(server.app);
    });

    afterAll(async () => {
      await new Promise((resolve) => {
        server.close(() => {
          resolve();
        });
      });
    });

    it('Request to index', async () => {
      const response = await req.get('/');

      expect(response.status).toEqual(200);
      expect(response.text).toContain('Heyo');
    });
  });

  describe('as an object when cacert, pfx, key and cert are paths', () => {
    beforeAll(async () => {
      const compiler = webpack(config);

      server = new Server(
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
        compiler
      );

      await new Promise((resolve, reject) => {
        server.listen(port, '::', (error) => {
          if (error) {
            reject(error);

            return;
          }

          resolve();
        });
      });

      req = request(server.app);
    });

    afterAll(async () => {
      await new Promise((resolve) => {
        server.close(() => {
          resolve();
        });
      });
    });

    it('Request to index', async () => {
      const response = await req.get('/');

      expect(response.status).toEqual(200);
      expect(response.text).toContain('Heyo');
    });
  });

  describe('as an object when cacert, pfx, key and cert are symlinks', () => {
    if (skipTestOnWindows('Symlinks are not supported on Windows')) {
      return;
    }

    beforeAll(async () => {
      const compiler = webpack(config);

      server = new Server(
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
        compiler
      );

      await new Promise((resolve, reject) => {
        server.listen(port, '::', (error) => {
          if (error) {
            reject(error);

            return;
          }

          resolve();
        });
      });

      req = request(server.app);
    });

    afterAll(async () => {
      await new Promise((resolve) => {
        server.close(() => {
          resolve();
        });
      });
    });

    it('Request to index', async () => {
      const response = await req.get('/');

      expect(response.status).toEqual(200);
      expect(response.text).toContain('Heyo');
    });
  });

  describe('as an object when cacert, pfx, key and cert are raw strings', () => {
    beforeAll(async () => {
      const compiler = webpack(config);

      server = new Server(
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
        compiler
      );

      await new Promise((resolve, reject) => {
        server.listen(port, '::', (error) => {
          if (error) {
            reject(error);

            return;
          }

          resolve();
        });
      });

      req = request(server.app);
    });

    afterAll(async () => {
      await new Promise((resolve) => {
        server.close(() => {
          resolve();
        });
      });
    });

    it('Request to index', async () => {
      const response = await req.get('/');

      expect(response.status).toEqual(200);
      expect(response.text).toContain('Heyo');
    });
  });

  describe('should support the "requestCert" option', () => {
    beforeAll(async () => {
      const compiler = webpack(config);

      server = new Server(
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
        compiler
      );

      await new Promise((resolve, reject) => {
        server.listen(port, '::', (error) => {
          if (error) {
            reject(error);

            return;
          }

          resolve();
        });
      });

      req = request(server.app);
    });

    afterAll(async () => {
      await new Promise((resolve) => {
        server.close(() => {
          resolve();
        });
      });
    });

    it('Request to index', async () => {
      const response = await req.get('/');

      expect(response.status).toEqual(200);
      expect(response.text).toContain('Heyo');
    });
  });
});
