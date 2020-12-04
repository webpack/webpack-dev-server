'use strict';

const path = require('path');
const fs = require('fs');
const request = require('supertest');
const testServer = require('../helpers/test-server');
const config = require('../fixtures/contentbase-config/webpack.config');
const port = require('../ports-map')['static-directory-option'];

const staticDirectory = path.resolve(
  __dirname,
  '../fixtures/contentbase-config'
);
const publicDirectory = path.resolve(staticDirectory, 'public');
const otherPublicDirectory = path.resolve(staticDirectory, 'other');

describe('static.directory option', () => {
  let server;
  let req;

  describe('to directory', () => {
    const nestedFile = path.resolve(publicDirectory, 'assets/example.txt');

    beforeAll((done) => {
      server = testServer.start(
        config,
        {
          static: {
            directory: publicDirectory,
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
      server.staticWatchers[0].on('change', () => {
        done();
      });

      // change a file manually
      setTimeout(() => {
        fs.writeFileSync(nestedFile, 'Heyo', 'utf8');
      }, 1000);
    });

    it('watch node_modules', (done) => {
      const filePath = path.join(publicDirectory, 'node_modules', 'index.html');
      fs.writeFileSync(filePath, 'foo', 'utf8');

      // chokidar emitted a change,
      // meaning it watched the file correctly
      server.staticWatchers[0].on('change', () => {
        fs.unlinkSync(filePath);
        done();
      });

      // change a file manually
      setTimeout(() => {
        fs.writeFileSync(filePath, 'bar', 'utf8');
      }, 1000);
    });
  });

  describe('test listing files in folders without index.html using the option static.serveIndex:false', () => {
    beforeAll((done) => {
      server = testServer.start(
        config,
        {
          static: {
            directory: publicDirectory,
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
      req.get('/assets/').expect(404, done);
    });

    it('should show Heyo. because bar has index.html inside it (200)', (done) => {
      req.get('/bar/').expect(200, /Heyo/, done);
    });
  });

  describe('test listing files in folders without index.html using the option static.serveIndex:true', () => {
    beforeAll((done) => {
      server = testServer.start(
        config,
        {
          static: {
            directory: publicDirectory,
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
      req.get('/assets/').expect(200, done);
    });

    it('should show Heyo. because bar has index.html inside it (200)', (done) => {
      req.get('/bar/').expect(200, /Heyo/, done);
    });
  });

  describe('test listing files in folders without index.html using the option static.serveIndex default (true)', () => {
    beforeAll((done) => {
      server = testServer.start(
        config,
        {
          static: {
            directory: publicDirectory,
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
          static: [publicDirectory, otherPublicDirectory],
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

  describe('testing single & multiple external paths', () => {
    afterEach((done) => {
      testServer.close(() => {
        done();
      });
    });
    it('Should throw exception (external url)', (done) => {
      try {
        // eslint-disable-next-line no-unused-vars
        server = testServer.start(config, {
          static: 'https://example.com/',
        });

        expect(true).toBe(false);
      } catch (e) {
        expect(e.message).toBe(
          'Using a URL as static.directory is not supported'
        );
        done();
      }
    });
    it('Should not throw exception (local path with lower case first character)', (done) => {
      testServer.start(
        config,
        {
          static: {
            directory:
              publicDirectory.charAt(0).toLowerCase() +
              publicDirectory.substring(1),
            watch: true,
          },
          port,
        },
        done
      );
    });
    it("Should not throw exception (local path with lower case first character & has '-')", (done) => {
      testServer.start(
        config,
        {
          static: {
            directory: 'c:\\absolute\\path\\to\\content-base',
            watch: true,
          },
          port,
        },
        done
      );
    });
    it("Should not throw exception (local path with upper case first character & has '-')", (done) => {
      testServer.start(
        config,
        {
          static: {
            directory: 'C:\\absolute\\path\\to\\content-base',
            watch: true,
          },
          port,
        },
        done
      );
    });

    it('Should throw exception (array with absolute url)', (done) => {
      try {
        // eslint-disable-next-line no-unused-vars
        server = testServer.start(config, {
          static: [publicDirectory, 'https://example.com/'],
        });

        expect(true).toBe(false);
      } catch (e) {
        expect(e.message).toBe(
          'Using a URL as static.directory is not supported'
        );
        done();
      }
    });
  });

  describe('default to PWD', () => {
    beforeAll((done) => {
      jest
        .spyOn(process, 'cwd')
        .mockImplementation(() => path.resolve(staticDirectory));

      server = testServer.start(
        config,
        {
          static: null,
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
      req.get('/index.html').expect(200, done);
    });
  });

  describe('disable', () => {
    beforeAll((done) => {
      // This is a somewhat weird test, but it is important that we mock
      // the PWD here, and test if /other.html in our "fake" PWD really is not requested.
      jest.spyOn(process, 'cwd').mockImplementation(() => publicDirectory);

      server = testServer.start(
        config,
        {
          static: false,
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
          static: [publicDirectory],
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
