'use strict';

const path = require('path');
const fs = require('fs');
const request = require('supertest');
const testServer = require('./helpers/test-server');
const config = require('./fixtures/contentbase-config/webpack.config');

const contentBasePublic = path.join(
  __dirname,
  'fixtures/contentbase-config/public'
);
const contentBaseOther = path.join(
  __dirname,
  'fixtures/contentbase-config/other'
);

describe('ContentBase', () => {
  let server;
  let req;

  describe('to directory', () => {
    const nestedFile = path.join(contentBasePublic, 'assets/example.txt');

    jest.setTimeout(30000);

    beforeAll((done) => {
      server = testServer.start(
        config,
        {
          contentBase: contentBasePublic,
          watchContentBase: true,
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
  });

  describe('test ignoring node_modules folder by Default', () => {
    jest.setTimeout(30000);

    beforeAll((done) => {
      server = testServer.start(config, {
        contentBase: contentBasePublic,
        watchContentBase: true,
      });
      // making sure that chokidar has read all the files
      server.contentBaseWatchers[0].on('ready', () => {
        done();
      });
      req = request(server.app);
    });

    afterAll((done) => {
      testServer.close(() => {
        done();
      });
    });

    it('Should ignore node_modules & watch bar', (done) => {
      const watchedPaths = server.contentBaseWatchers[0].getWatched();
      // check if node_modules folder is not in watched list
      const folderWatched = !!watchedPaths[
        path.join(contentBasePublic, 'node_modules')
      ];
      expect(folderWatched).toEqual(false);
      // check if bar folder is in watched list
      expect(watchedPaths[path.join(contentBasePublic, 'bar')]).toEqual([
        'index.html',
      ]);

      done();
    });
  });

  describe('test not ignoring node_modules folder', () => {
    jest.setTimeout(30000);

    beforeAll((done) => {
      server = testServer.start(config, {
        contentBase: contentBasePublic,
        watchContentBase: true,
        watchOptions: {
          ignored: /bar/,
        },
      });
      // making sure that chokidar has read all the files
      server.contentBaseWatchers[0].on('ready', () => {
        done();
      });
      req = request(server.app);
    });

    afterAll((done) => {
      testServer.close(() => {
        done();
      });
    });

    it('Should watch node_modules & ignore bar', (done) => {
      const watchedPaths = server.contentBaseWatchers[0].getWatched();
      // check if node_modules folder is in watched list
      expect(
        watchedPaths[path.join(contentBasePublic, 'node_modules')]
      ).toEqual(['index.html']);
      // check if bar folder is not in watched list
      const folderWatched = !!watchedPaths[path.join(contentBasePublic, 'bar')];
      expect(folderWatched).toEqual(false);
      done();
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
