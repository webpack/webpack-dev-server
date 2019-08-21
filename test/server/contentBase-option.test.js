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
      testServer.close(() => {
        done();
      });

      fs.truncateSync(nestedFile);
    });

    it('Request to index', (done) => {
      req.get('/').expect(200, /Heyo/, done);
    });

    it('Request to other file', (done) => {
      req.get('/other.html').expect(200, /Other html/, done);
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

    it("shouldn't list the files inside the assets folder (404)", (done) => {
      req.get('/assets/').expect(404, done);
    });

    it('should show Heyo. because bar has index.html inside it (200)', (done) => {
      req.get('/bar/').expect(200, /Heyo/, done);
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
      testServer.close(() => {
        done();
      });
    });

    it('should list the files inside the assets folder (200)', (done) => {
      req.get('/assets/').expect(200, done);
    });

    it('should show Heyo. because bar has index.html inside it (200)', (done) => {
      req.get('/bar/').expect(200, /Heyo/, done);
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
      testServer.close(() => {
        done();
      });
    });

    it('should list the files inside the assets folder (200)', (done) => {
      req.get('/assets/').expect(200, done);
    });

    it('should show Heyo. because bar has index.html inside it (200)', (done) => {
      req.get('/bar/').expect(200, /Heyo/, done);
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
      testServer.close(() => {
        done();
      });
    });

    it('Request to first directory', (done) => {
      req.get('/').expect(200, /Heyo/, done);
    });

    it('Request to second directory', (done) => {
      req.get('/foo.html').expect(200, /Foo!/, done);
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
      testServer.close(() => {
        done();
      });
    });

    it('Request to page', (done) => {
      req
        .get('/other.html')
        .expect('Location', '//localhost:9099999/other.html')
        .expect(302, done);
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
      testServer.close(() => {
        done();
      });
    });

    it('Request to page', (done) => {
      req
        .get('/foo.html')
        // TODO: hmm, two slashes seems to be a bug?
        .expect('Location', 'http://example.com//foo.html')
        .expect(302, done);
    });

    it('Request to page with search params', (done) => {
      req
        .get('/foo.html?space=ship')
        // TODO: hmm, two slashes seems to be a bug?
        .expect('Location', 'http://example.com//foo.html?space=ship')
        .expect(302, done);
    });
  });

  describe('testing single & multiple external paths', () => {
    afterEach((done) => {
      testServer.close(() => {
        done();
      });
    });
    it('Should throw exception (string)', (done) => {
      try {
        // eslint-disable-next-line no-unused-vars
        server = testServer.start(config, {
          contentBase: 'https://example.com/',
          watchContentBase: true,
        });

        expect(true).toBe(false);
      } catch (e) {
        expect(e.message).toBe('Watching remote files is not supported.');
        done();
      }
    });
    it('Should throw exception (number)', (done) => {
      try {
        // eslint-disable-next-line no-unused-vars
        server = testServer.start(config, {
          contentBase: 2,
          watchContentBase: true,
        });

        expect(true).toBe(false);
      } catch (e) {
        expect(e.message).toBe('Watching remote files is not supported.');
        done();
      }
    });
    it('Should not throw exception (local path with lower case first character)', (done) => {
      testServer.start(
        config,
        {
          contentBase:
            contentBasePublic.charAt(0).toLowerCase() +
            contentBasePublic.substring(1),
          watchContentBase: true,
          port,
        },
        done
      );
    });
    it("Should not throw exception (local path with lower case first character & has '-')", (done) => {
      testServer.start(
        config,
        {
          contentBase: 'c:\\absolute\\path\\to\\content-base',
          watchContentBase: true,
          port,
        },
        done
      );
    });
    it("Should not throw exception (local path with upper case first character & has '-')", (done) => {
      testServer.start(
        config,
        {
          contentBase: 'C:\\absolute\\path\\to\\content-base',
          watchContentBase: true,
          port,
        },
        done
      );
    });

    it('Should throw exception (array)', (done) => {
      try {
        // eslint-disable-next-line no-unused-vars
        server = testServer.start(config, {
          contentBase: [contentBasePublic, 'https://example.com/'],
          watchContentBase: true,
        });

        expect(true).toBe(false);
      } catch (e) {
        expect(e.message).toBe('Watching remote files is not supported.');
        done();
      }
    });
  });

  describe('default to PWD', () => {
    beforeAll((done) => {
      jest.spyOn(process, 'cwd').mockImplementation(() => contentBasePublic);

      server = testServer.start(config, {}, done);
      req = request(server.app);
    });

    afterAll((done) => {
      testServer.close(() => {
        done();
      });
    });

    it('Request to page', (done) => {
      req.get('/other.html').expect(200, done);
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
      testServer.close(() => {
        done();
      });
    });

    it('Request to page', (done) => {
      req.get('/other.html').expect(404, done);
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
      testServer.close(() => {
        done();
      });
    });

    it('Request foo.wasm', (done) => {
      req.get('/foo.wasm').expect('Content-Type', 'application/wasm', done);
    });
  });
});
