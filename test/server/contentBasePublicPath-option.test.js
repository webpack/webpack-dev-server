'use strict';

const path = require('path');
const request = require('supertest');
const testServer = require('../helpers/test-server');
const config = require('../fixtures/contentbase-config/webpack.config');
const port = require('../ports-map')['contentBase-option'];

const contentBasePublic = path.resolve(
  __dirname,
  '../fixtures/contentbase-config/public'
);
const contentBaseOther = path.resolve(
  __dirname,
  '../fixtures/contentbase-config/other'
);

const contentBasePublicPath = '/serve-content-base-at-this-url';
const contentBasePublicOtherPath = '/serve-other-content-at-this-url';

describe('contentBasePublicPath option', () => {
  let server;
  let req;

  describe('to directory', () => {
    beforeAll((done) => {
      server = testServer.start(
        config,
        {
          contentBase: contentBasePublic,
          contentBasePublicPath,
          watchContentBase: true,
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
      req.get(`${contentBasePublicPath}/`).expect(200, /Heyo/, done);
    });

    it('Request to other file', (done) => {
      req
        .get(`${contentBasePublicPath}/other.html`)
        .expect(200, /Other html/, done);
    });
  });

  describe('test listing files in folders without index.html using the option serveIndex:false', () => {
    beforeAll((done) => {
      server = testServer.start(
        config,
        {
          contentBase: contentBasePublic,
          contentBasePublicPath,
          watchContentBase: true,
          serveIndex: false,
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
      req.get(`${contentBasePublicPath}/assets/`).expect(404, done);
    });

    it('should show Heyo. because bar has index.html inside it (200)', (done) => {
      req.get(`${contentBasePublicPath}/bar/`).expect(200, /Heyo/, done);
    });
  });

  describe('test listing files in folders without index.html using the option serveIndex:true', () => {
    beforeAll((done) => {
      server = testServer.start(
        config,
        {
          contentBase: contentBasePublic,
          contentBasePublicPath,
          watchContentBase: true,
          serveIndex: true,
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
      req.get(`${contentBasePublicPath}/assets/`).expect(200, done);
    });

    it('should show Heyo. because bar has index.html inside it (200)', (done) => {
      req.get(`${contentBasePublicPath}/bar/`).expect(200, /Heyo/, done);
    });
  });

  describe('test listing files in folders without index.html using the option serveIndex default (true)', () => {
    beforeAll((done) => {
      server = testServer.start(
        config,
        {
          contentBase: contentBasePublic,
          contentBasePublicPath,
          watchContentBase: true,
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
      req.get(`${contentBasePublicPath}/assets/`).expect(200, done);
    });

    it('should show Heyo. because bar has index.html inside it (200)', (done) => {
      req.get(`${contentBasePublicPath}/bar/`).expect(200, /Heyo/, done);
    });
  });

  describe('to directories', () => {
    beforeAll((done) => {
      server = testServer.start(
        config,
        {
          contentBase: [contentBasePublic, contentBaseOther],
          contentBasePublicPath,
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
      req.get(`${contentBasePublicPath}/`).expect(200, /Heyo/, done);
    });

    it('Request to second directory', (done) => {
      req.get(`${contentBasePublicPath}/foo.html`).expect(200, /Foo!/, done);
    });
  });

  describe('default to PWD', () => {
    beforeAll((done) => {
      jest.spyOn(process, 'cwd').mockImplementation(() => contentBasePublic);

      server = testServer.start(config, { contentBasePublicPath }, done);
      req = request(server.app);
    });

    afterAll((done) => {
      testServer.close(() => {
        done();
      });
    });

    it('Request to page', (done) => {
      req.get(`${contentBasePublicPath}/other.html`).expect(200, done);
    });
  });

  describe('disable', () => {
    beforeAll((done) => {
      // This is a somewhat weird test, but it is important that we mock
      // the PWD here, and test if /other.html in our "fake" PWD really is not requested.
      jest.spyOn(process, 'cwd').mockImplementation(() => contentBasePublic);

      server = testServer.start(
        config,
        {
          contentBase: false,
          contentBasePublicPath,
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
      req.get(`${contentBasePublicPath}/other.html`).expect(404, done);
    });
  });

  describe('Content type', () => {
    beforeAll((done) => {
      server = testServer.start(
        config,
        {
          contentBase: [contentBasePublic],
          contentBasePublicPath,
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
        .get(`${contentBasePublicPath}/foo.wasm`)
        .expect('Content-Type', 'application/wasm', done);
    });
  });

  describe('to ignore other methods than GET and HEAD', () => {
    beforeAll((done) => {
      server = testServer.start(
        config,
        {
          contentBase: contentBasePublic,
          contentBasePublicPath,
          watchContentBase: true,
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
      req.get(`${contentBasePublicPath}/`).expect(200, done);
    });

    it('HEAD request', (done) => {
      req.head(`${contentBasePublicPath}/`).expect(200, done);
    });

    it('POST request', (done) => {
      req.post(`${contentBasePublicPath}/`).expect(404, done);
    });

    it('PUT request', (done) => {
      req.put(`${contentBasePublicPath}/`).expect(404, done);
    });

    it('DELETE request', (done) => {
      req.delete(`${contentBasePublicPath}/`).expect(404, done);
    });

    it('PATCH request', (done) => {
      req.patch(`${contentBasePublicPath}/`).expect(404, done);
    });
  });

  describe('multiple contentBasePublicPath entries', () => {
    beforeAll((done) => {
      server = testServer.start(
        config,
        {
          contentBase: [contentBasePublic, contentBaseOther],
          contentBasePublicPath: [
            contentBasePublicPath,
            contentBasePublicOtherPath,
          ],
          watchContentBase: true,
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
      req.get(`${contentBasePublicPath}/`).expect(200, /Heyo/, done);
    });

    it('Request the first path to other file', (done) => {
      req
        .get(`${contentBasePublicPath}/other.html`)
        .expect(200, /Other html/, done);
    });

    it('Request the second path to foo', (done) => {
      req
        .get(`${contentBasePublicOtherPath}/foo.html`)
        .expect(200, /Foo!/, done);
    });
  });
});
