'use strict';

const path = require('path');
const fs = require('fs');
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

describe('contentBase option', () => {
  let server;
  let req;

  describe('to directory', () => {
    const nestedFile = path.resolve(contentBasePublic, 'assets/example.txt');

    beforeAll((done) => {
      server = testServer.start(
        config,
        {
          contentBase: contentBasePublic,
          watchContentBase: true,
          port,
        },
        done
      );
      req = request(server.app);
    });

    afterAll((done) => {
      testServer.close(done);

      fs.truncateSync(nestedFile);
    });

    it('Request to index', async () => {
      await req.get('/').expect(200, /Heyo/);
    });

    it('Request to other file', async () => {
      await req.get('/other.html').expect(200, /Other html/);
    });

    it('Watches folder recursively', (done) => {
      // chokidar emitted a change,
      // meaning it watched the file correctly
      server.contentBaseWatchers[0].on('change', () => {
        done();
      });

      // change a file manually
      setTimeout(() => {
        fs.writeFileSync(nestedFile, 'Heyo', 'utf8');
      }, 1000);
    });

    it('watch node_modules', (done) => {
      const filePath = path.join(
        contentBasePublic,
        'node_modules',
        'index.html'
      );
      fs.writeFileSync(filePath, 'foo', 'utf8');

      // chokidar emitted a change,
      // meaning it watched the file correctly
      server.contentBaseWatchers[0].on('change', () => {
        fs.unlinkSync(filePath);
        done();
      });

      // change a file manually
      setTimeout(() => {
        fs.writeFileSync(filePath, 'bar', 'utf8');
      }, 1000);
    });
  });

  describe('test listing files in folders without index.html using the option serveIndex:false', () => {
    beforeAll((done) => {
      server = testServer.start(
        config,
        {
          contentBase: contentBasePublic,
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

    it("shouldn't list the files inside the assets folder (404)", async () => {
      await req.get('/assets/').expect(404);
    });

    it('should show Heyo. because bar has index.html inside it (200)', async () => {
      await req.get('/bar/').expect(200, /Heyo/);
    });
  });

  describe('test listing files in folders without index.html using the option serveIndex:true', () => {
    beforeAll((done) => {
      server = testServer.start(
        config,
        {
          contentBase: contentBasePublic,
          watchContentBase: true,
          serveIndex: true,
          port,
        },
        done
      );
      req = request(server.app);
    });

    afterAll((done) => {
      testServer.close(done);
    });

    it('should list the files inside the assets folder (200)', async () => {
      await req.get('/assets/').expect(200);
    });

    it('should show Heyo. because bar has index.html inside it (200)', async () => {
      await req.get('/bar/').expect(200, /Heyo/);
    });
  });

  describe('test listing files in folders without index.html using the option serveIndex default (true)', () => {
    beforeAll((done) => {
      server = testServer.start(
        config,
        {
          contentBase: contentBasePublic,
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

    it('should list the files inside the assets folder (200)', async () => {
      await req.get('/assets/').expect(200);
    });

    it('should show Heyo. because bar has index.html inside it (200)', async () => {
      await req.get('/bar/').expect(200, /Heyo/);
    });
  });

  describe('to directories', () => {
    beforeAll((done) => {
      server = testServer.start(
        config,
        {
          contentBase: [contentBasePublic, contentBaseOther],
          port,
        },
        done
      );
      req = request(server.app);
    });

    afterAll((done) => {
      testServer.close(done);
    });

    it('Request to first directory', async () => {
      await req.get('/').expect(200, /Heyo/);
    });

    it('Request to second directory', async () => {
      await req.get('/foo.html').expect(200, /Foo!/);
    });
  });

  describe('to port', () => {
    beforeAll((done) => {
      server = testServer.start(
        config,
        {
          contentBase: 9099999,
          port,
        },
        done
      );
      req = request(server.app);
    });

    afterAll((done) => {
      testServer.close(done);
    });

    it('Request to page', async () => {
      await req
        .get('/other.html')
        .expect('Location', '//localhost:9099999/other.html')
        .expect(302);
    });
  });

  describe('to external url', () => {
    beforeAll((done) => {
      server = testServer.start(
        config,
        {
          contentBase: 'http://example.com/',
          port,
        },
        done
      );
      req = request(server.app);
    });

    afterAll((done) => {
      testServer.close(done);
    });

    it('Request to page', async () => {
      await req
        .get('/foo.html')
        // TODO: hmm, two slashes seems to be a bug?
        .expect('Location', 'http://example.com//foo.html')
        .expect(302);
    });

    it('Request to page with search params', async () => {
      await req
        .get('/foo.html?space=ship')
        // TODO: hmm, two slashes seems to be a bug?
        .expect('Location', 'http://example.com//foo.html?space=ship')
        .expect(302);
    });
  });

  describe('default to PWD', () => {
    beforeAll((done) => {
      jest.spyOn(process, 'cwd').mockImplementation(() => contentBasePublic);

      server = testServer.start(config, { port }, done);
      req = request(server.app);
    });

    afterAll((done) => {
      testServer.close(done);
    });

    it('Request to page', async () => {
      await req.get('/other.html').expect(200);
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
          port,
        },
        done
      );
      req = request(server.app);
    });

    afterAll((done) => {
      testServer.close(done);
    });

    it('Request to page', async () => {
      await req.get('/other.html').expect(404);
    });
  });

  describe('Content type', () => {
    beforeAll((done) => {
      server = testServer.start(
        config,
        {
          contentBase: [contentBasePublic],
          port,
        },
        done
      );
      req = request(server.app);
    });

    afterAll((done) => {
      testServer.close(done);
    });

    it('Request foo.wasm', async () => {
      await req.get('/foo.wasm').expect('Content-Type', 'application/wasm');
    });
  });
});
