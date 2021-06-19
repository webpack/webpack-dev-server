'use strict';

const path = require('path');
const request = require('supertest');
const testServer = require('../helpers/test-server');
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
    beforeAll((done) => {
      server = testServer.start(
        config,
        {
          static: {
            directory: publicDirectory,
            publicPath: staticPublicPath,
            watch: true,
          },
          port,
        },
        done
      );
      req = request(server.app);
    });

    afterAll((done) => {
      testServer.close(() => {
        done();
      });
    });

    it('Request to index', async () => {
      const { status, text } = await req.get(`${staticPublicPath}/`);
      expect(status).toEqual(200);
      expect(text).toContain('Heyo');
    });

    it('Request to other file', async () => {
      const { status, text } = await req.get(`${staticPublicPath}/other.html`);
      expect(status).toEqual(200);
      expect(text).toContain('Other html');
    });
  });

  describe('test listing files in folders without index.html using the option static.serveIndex:false', () => {
    beforeAll((done) => {
      server = testServer.start(
        config,
        {
          static: {
            directory: publicDirectory,
            publicPath: staticPublicPath,
            watch: true,
            serveIndex: false,
          },
          port,
        },
        done
      );
      req = request(server.app);
    });

    afterAll((done) => {
      testServer.close(() => {
        done();
      });
    });

    it("shouldn't list the files inside the assets folder (404)", async () => {
      const { status } = await req.get(`${staticPublicPath}/assets/`);
      expect(status).toEqual(404);
    });

    it('should show Heyo. because bar has index.html inside it (200)', async () => {
      const { status, text } = await req.get(`${staticPublicPath}/bar/`);
      expect(status).toEqual(200);
      expect(text).toContain('Heyo');
    });
  });

  describe('test listing files in folders without index.html using the option static.serveIndex:true', () => {
    beforeAll((done) => {
      server = testServer.start(
        config,
        {
          static: {
            directory: publicDirectory,
            publicPath: staticPublicPath,
            watch: true,
            serveIndex: true,
          },
          port,
        },
        done
      );
      req = request(server.app);
    });

    afterAll((done) => {
      testServer.close(() => {
        done();
      });
    });

    it('should list the files inside the assets folder (200)', async () => {
      const { status } = await req.get(`${staticPublicPath}/assets/`);
      expect(status).toEqual(200);
    });

    it('should show Heyo. because bar has index.html inside it (200)', async () => {
      const { status, text } = await req.get(`${staticPublicPath}/bar/`);
      expect(status).toEqual(200);
      expect(text).toContain('Heyo');
    });
  });

  describe('test listing files in folders without index.html using the option static.serveIndex default (true)', () => {
    beforeAll((done) => {
      server = testServer.start(
        config,
        {
          static: {
            directory: publicDirectory,
            publicPath: staticPublicPath,
            watch: true,
          },
          port,
        },
        done
      );
      req = request(server.app);
    });

    afterAll((done) => {
      testServer.close(() => {
        done();
      });
    });

    it('should list the files inside the assets folder (200)', async () => {
      const { status } = await req.get(`${staticPublicPath}/assets/`);
      expect(status).toEqual(200);
    });

    it('should show Heyo. because bar has index.html inside it (200)', async () => {
      const { status, text } = await req.get(`${staticPublicPath}/bar/`);
      expect(status).toEqual(200);
      expect(text).toContain('Heyo');
    });
  });

  describe('to directories', () => {
    beforeAll((done) => {
      server = testServer.start(
        config,
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
        done
      );
      req = request(server.app);
    });

    afterAll((done) => {
      testServer.close(() => {
        done();
      });
    });

    it('Request to first directory', async () => {
      const { status, text } = await req.get(`${staticPublicPath}/`);
      expect(status).toEqual(200);
      expect(text).toContain('Heyo');
    });

    it('Request to second directory', async () => {
      const { status, text } = await req.get(`${staticPublicPath}/foo.html`);
      expect(status).toEqual(200);
      expect(text).toContain('Foo!');
    });
  });

  describe('default to PWD', () => {
    beforeAll((done) => {
      jest.spyOn(process, 'cwd').mockImplementation(() => staticDirectory);

      server = testServer.start(
        config,
        {
          static: {
            publicPath: staticPublicPath,
          },
          port,
        },
        done
      );
      req = request(server.app);
    });

    afterAll((done) => {
      testServer.close(() => {
        done();
      });
    });

    it('Request to page', async () => {
      const { status } = await req.get(`${staticPublicPath}/index.html`);
      expect(status).toEqual(200);
    });
  });

  describe('Content type', () => {
    beforeAll((done) => {
      server = testServer.start(
        config,
        {
          static: {
            directory: publicDirectory,
            publicPath: staticPublicPath,
          },
          port,
        },
        done
      );
      req = request(server.app);
    });

    afterAll((done) => {
      testServer.close(() => {
        done();
      });
    });

    it('Request foo.wasm', (done) => {
      req
        .get(`${staticPublicPath}/foo.wasm`)
        .expect('Content-Type', 'application/wasm', done);
    });
  });

  describe('to ignore other methods than GET and HEAD', () => {
    beforeAll((done) => {
      server = testServer.start(
        config,
        {
          static: {
            directory: publicDirectory,
            publicPath: staticPublicPath,
            watch: true,
          },
          port,
        },
        done
      );
      req = request(server.app);
    });

    afterAll((done) => {
      testServer.close(done);
    });

    it('GET request', async () => {
      const { status } = await req.get(`${staticPublicPath}/`);
      expect(status).toEqual(200);
    });

    it('HEAD request', async () => {
      const { status } = await req.head(`${staticPublicPath}/`);
      expect(status).toEqual(200);
    });

    it('POST request', async () => {
      const { status } = await req.post(`${staticPublicPath}/`);
      expect(status).toEqual(404);
    });

    it('PUT request', async () => {
      const { status } = await req.put(`${staticPublicPath}/`);
      expect(status).toEqual(404);
    });

    it('DELETE request', async () => {
      const { status } = await req.delete(`${staticPublicPath}/`);
      expect(status).toEqual(404);
    });

    it('PATCH request', async () => {
      const { status } = await req.patch(`${staticPublicPath}/`);
      expect(status).toEqual(404);
    });
  });

  describe('multiple static.publicPath entries', () => {
    beforeAll((done) => {
      server = testServer.start(
        config,
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
        done
      );
      req = request(server.app);
    });

    afterAll((done) => {
      testServer.close(() => {
        done();
      });
    });

    it('Request the first path to index', async () => {
      const { status, text } = await req.get(`${staticPublicPath}/`);
      expect(status).toEqual(200);
      expect(text).toContain('Heyo');
    });

    it('Request the first path to other file', async () => {
      const { status, text } = await req.get(`${staticPublicPath}/other.html`);
      expect(status).toEqual(200);
      expect(text).toContain('Other html');
    });

    it('Request the second path to foo', async () => {
      const { status, text } = await req.get(
        `${otherStaticPublicPath}/foo.html`
      );
      expect(status).toEqual(200);
      expect(text).toContain('Foo!');
    });
  });

  describe('multiple static.publicPath entries with publicPath array', () => {
    beforeAll((done) => {
      server = testServer.start(
        config,
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
        done
      );
      req = request(server.app);
    });

    afterAll((done) => {
      testServer.close(() => {
        done();
      });
    });

    it('Request the first path to index', async () => {
      const { status, text } = await req.get(`${staticPublicPath}/`);
      expect(status).toEqual(200);
      expect(text).toContain('Heyo');
    });

    it('Request the first path to other file', async () => {
      const { status, text } = await req.get(`${staticPublicPath}/other.html`);
      expect(status).toEqual(200);
      expect(text).toContain('Other html');
    });

    it('Request the first path to foo', async () => {
      const { status, text } = await req.get(`${staticPublicPath}/foo.html`);
      expect(status).toEqual(200);
      expect(text).toContain('Foo!');
    });

    it('Request the second path to foo', async () => {
      const { status, text } = await req.get(`${staticPublicPath}/foo.html`);
      expect(status).toEqual(200);
      expect(text).toContain('Foo!');
    });
  });
});
