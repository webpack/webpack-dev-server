'use strict';

const path = require('path');
const fs = require('fs');
const request = require('supertest');
const addEntries = require('../lib/utils/addEntries');
const helper = require('./helper');
const config = require('./fixtures/contentbase-config/webpack.config');
const runBrowser = require('./helpers/run-browser');

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
  afterEach(helper.close);

  describe('to directory', () => {
    beforeAll((done) => {
      const options = {
        port: 9001,
        host: '0.0.0.0',
        disableHostCheck: true,
      };
      addEntries(config, options);
      server = helper.start(
        config,
        {
          contentBase: contentBasePublic,
          watchContentBase: true,
        },
        done
      );
      req = request(server.app);
    });

    it('Request to index', (done) => {
      req.get('/').expect(200, /Heyo/, done);
    });

    it('Request to other file', (done) => {
      req.get('/other.html').expect(200, /Other html/, done);
    });

    it('Watches recursively', (done) => {
      const nestedFile = path.join(contentBasePublic, 'assets/example.txt');

      runBrowser().then(({ page, browser }) => {
        // wait for first load
        page.goto('http://localhost:9001').then(() => {
          // page reloaded after the first load,
          // meaning it watched the file correctly
          page.on('load', () => {
            browser.close();
            done();
          });

          // trigger chokidar's file change event
          fs.truncateSync(nestedFile);
          fs.writeFileSync(nestedFile, 'Heyo', 'utf8');
        });
      });
    });
  });

  describe('to directories', () => {
    beforeAll((done) => {
      server = helper.start(
        config,
        {
          contentBase: [contentBasePublic, contentBaseOther],
        },
        done
      );
      req = request(server.app);
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
      server = helper.start(
        config,
        {
          contentBase: 9099999,
        },
        done
      );
      req = request(server.app);
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
      server = helper.start(
        config,
        {
          contentBase: 'http://example.com/',
        },
        done
      );
      req = request(server.app);
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
      server = helper.start(config, {}, done);
      req = request(server.app);
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
      server = helper.start(
        config,
        {
          contentBase: false,
        },
        done
      );
      req = request(server.app);
    });

    it('Request to page', (done) => {
      req.get('/other.html').expect(404, done);
    });
  });

  describe('Content type', () => {
    beforeAll((done) => {
      server = helper.start(
        config,
        {
          contentBase: [contentBasePublic],
        },
        done
      );
      req = request(server.app);
    });

    it('Request foo.wasm', (done) => {
      req.get('/foo.wasm').expect('Content-Type', 'application/wasm', done);
    });
  });
});
