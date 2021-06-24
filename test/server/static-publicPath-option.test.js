'use strict';

const path = require('path');
const request = require('supertest');
const webpack = require('webpack');
const Server = require('../../lib/Server');
const config = require('../fixtures/contentbase-config/webpack.config');
const port = require('../ports-map')['static-public-path-option'];

const staticDirectory = path.resolve(
  __dirname,
  '../fixtures/contentbase-config'
);
const publicDirectory = path.resolve(staticDirectory, 'public');
const otherPublicDirectory = path.resolve(staticDirectory, 'other');
const staticPublicPath = '/serve-content-base-at-this-url';
const otherStaticPublicPath = '/serve-other-content-at-this-url';

describe('static.publicPath option', () => {
  let server;
  let req;

  describe('to directory', () => {
    beforeAll(async () => {
      const compiler = webpack(config);

      server = new Server(
        {
          static: {
            directory: publicDirectory,
            publicPath: staticPublicPath,
            watch: true,
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

    it('Request to index', async () => {
      const response = await req.get(`${staticPublicPath}/`);

      expect(response.statusCode).toEqual(200);
      expect(response.text).toContain('Heyo');
    });

    it('Request to other file', async () => {
      const response = await req.get(`${staticPublicPath}/other.html`);

      expect(response.statusCode).toEqual(200);
      expect(response.text).toContain('Other html');
    });
  });

  describe('test listing files in folders without index.html using the option static.serveIndex:false', () => {
    beforeAll(async () => {
      const compiler = webpack(config);

      server = new Server(
        {
          static: {
            directory: publicDirectory,
            publicPath: staticPublicPath,
            watch: true,
            serveIndex: false,
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

    it("shouldn't list the files inside the assets folder (404)", async () => {
      const response = await req.get(`${staticPublicPath}/assets/`);

      expect(response.statusCode).toEqual(404);
    });

    it('should show Heyo. because bar has index.html inside it (200)', async () => {
      const response = await req.get(`${staticPublicPath}/bar/`);

      expect(response.statusCode).toEqual(200);
      expect(response.text).toContain('Heyo');
    });
  });

  describe('test listing files in folders without index.html using the option static.serveIndex:true', () => {
    beforeAll(async () => {
      const compiler = webpack(config);

      server = new Server(
        {
          static: {
            directory: publicDirectory,
            publicPath: staticPublicPath,
            watch: true,
            serveIndex: true,
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

    it('should list the files inside the assets folder (200)', async () => {
      const response = await req.get(`${staticPublicPath}/assets/`);

      expect(response.statusCode).toEqual(200);
    });

    it('should show Heyo. because bar has index.html inside it (200)', async () => {
      const response = await req.get(`${staticPublicPath}/bar/`);

      expect(response.statusCode).toEqual(200);
      expect(response.text).toContain('Heyo');
    });
  });

  describe('test listing files in folders without index.html using the option static.serveIndex default (true)', () => {
    beforeAll(async () => {
      const compiler = webpack(config);

      server = new Server(
        {
          static: {
            directory: publicDirectory,
            publicPath: staticPublicPath,
            watch: true,
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

    it('should list the files inside the assets folder (200)', async () => {
      const response = await req.get(`${staticPublicPath}/assets/`);

      expect(response.statusCode).toEqual(200);
    });

    it('should show Heyo. because bar has index.html inside it (200)', async () => {
      const response = await req.get(`${staticPublicPath}/bar/`);

      expect(response.statusCode).toEqual(200);
      expect(response.text).toContain('Heyo');
    });
  });

  describe('to directories', () => {
    beforeAll(async () => {
      const compiler = webpack(config);

      server = new Server(
        {
          static: [
            {
              directory: publicDirectory,
              publicPath: staticPublicPath,
            },
            {
              directory: otherPublicDirectory,
              publicPath: staticPublicPath,
            },
          ],
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

    it('Request to first directory', async () => {
      const response = await req.get(`${staticPublicPath}/`);

      expect(response.statusCode).toEqual(200);
      expect(response.text).toContain('Heyo');
    });

    it('Request to second directory', async () => {
      const response = await req.get(`${staticPublicPath}/foo.html`);

      expect(response.statusCode).toEqual(200);
      expect(response.text).toContain('Foo!');
    });
  });

  describe('default to PWD', () => {
    beforeAll(async () => {
      jest.spyOn(process, 'cwd').mockImplementation(() => staticDirectory);

      const compiler = webpack(config);

      server = new Server(
        {
          static: {
            publicPath: staticPublicPath,
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

    it('Request to page', async () => {
      const response = await req.get(`${staticPublicPath}/index.html`);

      expect(response.statusCode).toEqual(200);
    });
  });

  describe('Content type', () => {
    beforeAll(async () => {
      const compiler = webpack(config);

      server = new Server(
        {
          static: {
            directory: publicDirectory,
            publicPath: staticPublicPath,
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

    it('Request foo.wasm', async () => {
      const response = await req.get(`${staticPublicPath}/foo.wasm`);

      expect(response.headers['content-type']).toBe('application/wasm');
    });
  });

  describe('to ignore other methods than GET and HEAD', () => {
    beforeAll(async () => {
      const compiler = webpack(config);

      server = new Server(
        {
          static: {
            directory: publicDirectory,
            publicPath: staticPublicPath,
            watch: true,
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

    it('GET request', async () => {
      const response = await req.get(`${staticPublicPath}/`);

      expect(response.statusCode).toEqual(200);
    });

    it('HEAD request', async () => {
      const response = await req.head(`${staticPublicPath}/`);

      expect(response.statusCode).toEqual(200);
    });

    it('POST request', async () => {
      const response = await req.post(`${staticPublicPath}/`);

      expect(response.statusCode).toEqual(404);
    });

    it('PUT request', async () => {
      const response = await req.put(`${staticPublicPath}/`);

      expect(response.statusCode).toEqual(404);
    });

    it('DELETE request', async () => {
      const response = await req.delete(`${staticPublicPath}/`);

      expect(response.statusCode).toEqual(404);
    });

    it('PATCH request', async () => {
      const response = await req.patch(`${staticPublicPath}/`);

      expect(response.statusCode).toEqual(404);
    });
  });

  describe('multiple static.publicPath entries', () => {
    beforeAll(async () => {
      const compiler = webpack(config);

      server = new Server(
        {
          static: [
            {
              directory: publicDirectory,
              publicPath: staticPublicPath,
              watch: true,
            },
            {
              directory: otherPublicDirectory,
              publicPath: otherStaticPublicPath,
              watch: true,
            },
          ],
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

    it('Request the first path to index', async () => {
      const response = await req.get(`${staticPublicPath}/`);

      expect(response.statusCode).toEqual(200);
      expect(response.text).toContain('Heyo');
    });

    it('Request the first path to other file', async () => {
      const response = await req.get(`${staticPublicPath}/other.html`);

      expect(response.statusCode).toEqual(200);
      expect(response.text).toContain('Other html');
    });

    it('Request the second path to foo', async () => {
      const response = await req.get(`${otherStaticPublicPath}/foo.html`);

      expect(response.statusCode).toEqual(200);
      expect(response.text).toContain('Foo!');
    });
  });

  describe('multiple static.publicPath entries with publicPath array', () => {
    beforeAll(async () => {
      const compiler = webpack(config);

      server = new Server(
        {
          static: [
            {
              directory: publicDirectory,
              publicPath: staticPublicPath,
              watch: true,
            },
            {
              directory: otherPublicDirectory,
              publicPath: [staticPublicPath, otherStaticPublicPath],
              watch: true,
            },
          ],
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

    it('Request the first path to index', async () => {
      const response = await req.get(`${staticPublicPath}/`);

      expect(response.statusCode).toEqual(200);
      expect(response.text).toContain('Heyo');
    });

    it('Request the first path to other file', async () => {
      const response = await req.get(`${staticPublicPath}/other.html`);

      expect(response.statusCode).toEqual(200);
      expect(response.text).toContain('Other html');
    });

    it('Request the first path to foo', async () => {
      const response = await req.get(`${staticPublicPath}/foo.html`);

      expect(response.statusCode).toEqual(200);
      expect(response.text).toContain('Foo!');
    });

    it('Request the second path to foo', async () => {
      const response = await req.get(`${staticPublicPath}/foo.html`);

      expect(response.statusCode).toEqual(200);
      expect(response.text).toContain('Foo!');
    });
  });
});
