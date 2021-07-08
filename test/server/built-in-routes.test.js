'use strict';

const webpack = require('webpack');
const request = require('supertest');
const Server = require('../../lib/Server');
const config = require('../fixtures/simple-config/webpack.config');
const multiConfig = require('../fixtures/multi-public-path-config/webpack.config');
const port = require('../ports-map').routes;

describe('routes util', () => {
  let server;
  let req;

  describe('simple config', () => {
    beforeAll(async () => {
      const compiler = webpack(config);

      server = new Server(
        {
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

    it('should handles GET request to sockjs bundle', async () => {
      const response = await req.get(
        '/__webpack_dev_server__/sockjs.bundle.js'
      );

      expect(response.headers['content-type']).toEqual(
        'application/javascript'
      );
      expect(response.statusCode).toEqual(200);
    });

    it('should handle HEAD request to sockjs bundle', async () => {
      const response = await req.head(
        '/__webpack_dev_server__/sockjs.bundle.js'
      );

      expect(response.headers['content-type']).toEqual(
        'application/javascript'
      );
      expect(response.statusCode).toEqual(200);
    });

    it('should handle GET request to invalidate endpoint', async () => {
      const response = await req.get('/webpack-dev-server/invalidate');

      expect(response.headers['content-type']).not.toEqual('text/html');
      expect(response.statusCode).toEqual(200);
    });

    it('should handle GET request to live html', async () => {
      const response = await req.get('/webpack-dev-server/');

      expect(response.headers['content-type']).toEqual('text/html');
      expect(response.statusCode).toEqual(200);
    });

    it('should handle HEAD request to live html', async () => {
      const response = await req.head('/webpack-dev-server/');

      expect(response.headers['content-type']).toEqual('text/html');
      expect(response.statusCode).toEqual(200);
    });

    it('should handle GET request to directory index', async () => {
      const response = await req.get('/webpack-dev-server');

      expect(response.headers['content-type']).toEqual('text/html');
      expect(response.statusCode).toEqual(200);
      expect(response.text).toMatchSnapshot();
    });

    it('should handle HEAD request to directory index', async () => {
      const response = await req.head('/webpack-dev-server');

      expect(response.headers['content-type']).toEqual('text/html');
      expect(response.statusCode).toEqual(200);
    });

    it('should handle GET request to magic async html', async () => {
      const response = await req.get('/main');

      expect(response.statusCode).toEqual(200);
    });

    it('should handle HEAD request to magic async html', async () => {
      const response = await req.head('/main');

      expect(response.statusCode).toEqual(200);
    });

    it('should handle GET request to main async chunk', async () => {
      const response = await req.get('/main.js');

      expect(response.statusCode).toEqual(200);
    });

    it('should handle HEAD request to main async chunk', async () => {
      const response = await req.head('/main.js');

      expect(response.statusCode).toEqual(200);
    });
  });

  describe('multi config', () => {
    beforeAll(async () => {
      const compiler = webpack(multiConfig);

      server = new Server(
        {
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

    it('should handle GET request to directory index and list all middleware directories', async () => {
      const response = await req.get('/webpack-dev-server');

      expect(response.headers['content-type']).toEqual('text/html');
      expect(response.statusCode).toEqual(200);
      expect(response.text).toMatchSnapshot();
    });
  });
});
