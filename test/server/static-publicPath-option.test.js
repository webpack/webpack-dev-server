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

    it('Request to index', (done) => {
      req.get(`${staticPublicPath}/`).expect(200, /Heyo/, done);
    });

    it('Request to other file', (done) => {
      req.get(`${staticPublicPath}/other.html`).expect(200, /Other html/, done);
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

    it("shouldn't list the files inside the assets folder (404)", (done) => {
      req.get(`${staticPublicPath}/assets/`).expect(404, done);
    });

    it('should show Heyo. because bar has index.html inside it (200)', (done) => {
      req.get(`${staticPublicPath}/bar/`).expect(200, /Heyo/, done);
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

    it('should list the files inside the assets folder (200)', (done) => {
      req.get(`${staticPublicPath}/assets/`).expect(200, done);
    });

    it('should show Heyo. because bar has index.html inside it (200)', (done) => {
      req.get(`${staticPublicPath}/bar/`).expect(200, /Heyo/, done);
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

    it('should list the files inside the assets folder (200)', (done) => {
      req.get(`${staticPublicPath}/assets/`).expect(200, done);
    });

    it('should show Heyo. because bar has index.html inside it (200)', (done) => {
      req.get(`${staticPublicPath}/bar/`).expect(200, /Heyo/, done);
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

    it('Request to first directory', (done) => {
      req.get(`${staticPublicPath}/`).expect(200, /Heyo/, done);
    });

    it('Request to second directory', (done) => {
      req.get(`${staticPublicPath}/foo.html`).expect(200, /Foo!/, done);
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

    it('Request to page', (done) => {
      req.get(`${staticPublicPath}/index.html`).expect(200, done);
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

    it('GET request', (done) => {
      req.get(`${staticPublicPath}/`).expect(200, done);
    });

    it('HEAD request', (done) => {
      req.head(`${staticPublicPath}/`).expect(200, done);
    });

    it('POST request', (done) => {
      req.post(`${staticPublicPath}/`).expect(404, done);
    });

    it('PUT request', (done) => {
      req.put(`${staticPublicPath}/`).expect(404, done);
    });

    it('DELETE request', (done) => {
      req.delete(`${staticPublicPath}/`).expect(404, done);
    });

    it('PATCH request', (done) => {
      req.patch(`${staticPublicPath}/`).expect(404, done);
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

    it('Request the first path to index', (done) => {
      req.get(`${staticPublicPath}/`).expect(200, /Heyo/, done);
    });

    it('Request the first path to other file', (done) => {
      req.get(`${staticPublicPath}/other.html`).expect(200, /Other html/, done);
    });

    it('Request the second path to foo', (done) => {
      req.get(`${otherStaticPublicPath}/foo.html`).expect(200, /Foo!/, done);
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

    it('Request the first path to index', (done) => {
      req.get(`${staticPublicPath}/`).expect(200, /Heyo/, done);
    });

    it('Request the first path to other file', (done) => {
      req.get(`${staticPublicPath}/other.html`).expect(200, /Other html/, done);
    });

    it('Request the first path to foo', (done) => {
      req.get(`${staticPublicPath}/foo.html`).expect(200, /Foo!/, done);
    });

    it('Request the second path to foo', (done) => {
      req.get(`${otherStaticPublicPath}/foo.html`).expect(200, /Foo!/, done);
    });
  });
});
