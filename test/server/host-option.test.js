'use strict';

const path = require('path');
const webpack = require('webpack');
const request = require('supertest');
const internalIp = require('internal-ip');
const Server = require('../../lib/Server');
const config = require('../fixtures/simple-config/webpack.config');
const port = require('../ports-map')['host-option'];

const staticDirectory = path.resolve(
  __dirname,
  '../fixtures/contentbase-config'
);
const internalIPv4 = internalIp.v4.sync();

describe('host option', () => {
  let server = null;
  let req = null;

  describe('is not be specified', () => {
    beforeAll(async () => {
      const compiler = webpack(config);

      server = new Server(
        {
          static: {
            directory: staticDirectory,
            watch: false,
          },
          port,
        },
        compiler
      );

      await new Promise((resolve, reject) => {
        server.listen(port, '127.0.0.1', (error) => {
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

    it('server address', () => {
      const address = server.server.address();

      expect(address.address).toBe('127.0.0.1');
      expect(address.port).toBe(port);
    });

    it('Request to index', async () => {
      const response = await req.get('/');

      expect(response.status).toEqual(200);
    });
  });

  describe('is undefined', () => {
    beforeAll(async () => {
      const compiler = webpack(config);

      server = new Server(
        {
          static: {
            directory: staticDirectory,
            watch: false,
          },
          // eslint-disable-next-line no-undefined
          host: undefined,
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

    it('server address', () => {
      const address = server.server.address();

      expect(address.address).toBe('::');
      expect(address.port).toBe(port);
    });

    it('Request to index', async () => {
      const response = await req.get('/');

      expect(response.status).toEqual(200);
    });
  });

  describe('is 127.0.0.1 (IPv4)', () => {
    beforeAll(async () => {
      const compiler = webpack(config);

      server = new Server(
        {
          static: {
            directory: staticDirectory,
            watch: false,
          },
          host: '127.0.0.1',
          port,
        },
        compiler
      );

      await new Promise((resolve, reject) => {
        server.listen(port, '127.0.0.1', (error) => {
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

    it('server address', () => {
      const address = server.server.address();

      expect(address.address).toBe('127.0.0.1');
      expect(address.port).toBe(port);
    });

    it('Request to index', async () => {
      const response = await req.get('/');

      expect(response.status).toEqual(200);
    });
  });

  describe('is localhost', () => {
    beforeAll(async () => {
      const compiler = webpack(config);

      server = new Server(
        {
          static: {
            directory: staticDirectory,
            watch: false,
          },
          host: 'localhost',
          port,
        },
        compiler
      );

      await new Promise((resolve, reject) => {
        server.listen(port, '127.0.0.1', (error) => {
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

    it('server address', () => {
      const address = server.server.address();

      expect(address.address).toBe('127.0.0.1');
      expect(address.port).toBe(port);
    });

    it('Request to index', async () => {
      const response = await req.get('/');

      expect(response.status).toEqual(200);
    });
  });

  describe('is 0.0.0.0', () => {
    beforeAll(async () => {
      const compiler = webpack(config);

      server = new Server(
        {
          static: {
            directory: staticDirectory,
            watch: false,
          },
          host: '0.0.0.0',
          port,
        },
        compiler
      );

      await new Promise((resolve, reject) => {
        server.listen(port, '0.0.0.0', (error) => {
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

    it('server address', () => {
      const address = server.server.address();

      expect(address.address).toBe('0.0.0.0');
      expect(address.port).toBe(port);
    });

    it('Request to index', async () => {
      const response = await req.get('/');

      expect(response.status).toEqual(200);
    });
  });

  describe('is local-ip', () => {
    beforeAll(async () => {
      const compiler = webpack(config);

      server = new Server(
        {
          static: {
            directory: staticDirectory,
            watch: false,
          },
          host: 'local-ip',
          port,
        },
        compiler
      );

      await new Promise((resolve, reject) => {
        server.listen(port, internalIPv4, (error) => {
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

    it('server address', () => {
      const address = server.server.address();

      expect(address.address).toBe(internalIPv4);
      expect(address.port).toBe(port);
    });

    it('Request to index', async () => {
      const response = await req.get('/');

      expect(response.status).toEqual(200);
    });
  });

  describe('is local-ipv4', () => {
    beforeAll(async () => {
      const compiler = webpack(config);

      server = new Server(
        {
          static: {
            directory: staticDirectory,
            watch: false,
          },
          host: 'local-ipv4',
          port,
        },
        compiler
      );

      await new Promise((resolve, reject) => {
        server.listen(port, internalIPv4, (error) => {
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

    it('server address', () => {
      const address = server.server.address();

      expect(address.address).toBe(internalIPv4);
      expect(address.port).toBe(port);
    });

    it('Request to index', async () => {
      const response = await req.get('/');

      expect(response.status).toEqual(200);
    });
  });
});
