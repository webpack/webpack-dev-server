'use strict';

const webpack = require('webpack');
const request = require('supertest');
const Server = require('../../lib/Server');
const config = require('../fixtures/simple-config/webpack.config');
const port = require('../ports-map')['port-option'];

describe('"port" option', () => {
  let server = null;
  let req = null;

  describe('is not be specified', () => {
    beforeAll(async () => {
      const compiler = webpack(config);

      server = new Server({ port }, compiler);

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
      // Random port
      expect(address.port).toBeDefined();
    });

    it('Request to index', async () => {
      const response = await req.get('/');

      expect(response.statusCode).toEqual(200);
    });
  });

  describe('is undefined', () => {
    beforeAll(async () => {
      const compiler = webpack(config);

      server = new Server(
        {
          // eslint-disable-next-line no-undefined
          port: undefined,
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
      // Random port
      expect(address.port).toBeDefined();
    });

    it('Request to index', async () => {
      const response = await req.get('/');

      expect(response.statusCode).toEqual(200);
    });
  });

  describe('is auto', () => {
    beforeAll(async () => {
      const compiler = webpack(config);

      server = new Server(
        {
          port: 'auto',
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
      // Random port
      expect(address.port).toBeDefined();
    });

    it('Request to index', async () => {
      const response = await req.get('/');

      expect(response.statusCode).toEqual(200);
    });
  });

  describe('is "33333"', () => {
    beforeAll(async () => {
      const compiler = webpack(config);

      server = new Server(
        {
          port: '33333',
        },
        compiler
      );

      await new Promise((resolve, reject) => {
        server.listen('33333', '127.0.0.1', (error) => {
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
      expect(address.port).toBe(33333);
    });

    it('Request to index', async () => {
      const response = await req.get('/');

      expect(response.statusCode).toEqual(200);
    });
  });

  describe('is 33333', () => {
    beforeAll(async () => {
      const compiler = webpack(config);

      server = new Server(
        {
          port: 33333,
        },
        compiler
      );

      await new Promise((resolve, reject) => {
        server.listen(33333, '127.0.0.1', (error) => {
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
      expect(address.port).toBe(33333);
    });

    it('Request to index', async () => {
      const response = await req.get('/');

      expect(response.statusCode).toEqual(200);
    });
  });
});
