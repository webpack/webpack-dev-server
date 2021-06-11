'use strict';

const path = require('path');
const fs = require('graceful-fs');
const testServer = require('../helpers/test-server');
const config = require('../fixtures/contentbase-config/webpack.config');
const port = require('../ports-map')['liveReload-option'];

const contentBasePublic = path.resolve(
  __dirname,
  '../fixtures/contentbase-config/public'
);

describe.skip('liveReload option', () => {
  let server;

  describe('Test disabling live reloading', () => {
    const nestedFile = path.join(contentBasePublic, 'assets/example.txt');

    beforeAll((done) => {
      server = testServer.start(
        config,
        {
          static: contentBasePublic,
          liveReload: false,
          port,
        },
        done
      );
    });

    afterAll((done) => {
      testServer.close(done);
      fs.truncateSync(nestedFile);
    });

    it('Should not reload on changing files', (done) => {
      let reloaded = false;

      server.staticWatchers[0].on('change', () => {
        // it means that file has changed

        // simulating server behaviour
        if (server.options.liveReload) {
          // issue: https://github.com/facebook/jest/issues/9471
          Object.defineProperty(window, 'location', {
            writable: true,
            value: { assign: jest.fn() },
          });

          Object.defineProperty(window.location, 'reload', {
            writable: true,
            value: { assign: jest.fn() },
          });
          window.location.reload = jest.fn();
          window.location.reload();
          reloaded = true;
        }
        expect(reloaded).toBe(false);

        done();
      });

      // change file content
      setTimeout(() => {
        fs.writeFileSync(nestedFile, 'Heyo', 'utf8');
      }, 1000);
    });
  });

  describe('Testing live reloading', () => {
    const nestedFile = path.join(contentBasePublic, 'assets/example.txt');

    beforeAll((done) => {
      server = testServer.start(
        config,
        {
          static: contentBasePublic,
          liveReload: true,
          port,
        },
        done
      );
    });

    afterAll((done) => {
      testServer.close(done);
      fs.truncateSync(nestedFile);
    });

    it('Should reload on changing files', (done) => {
      let reloaded = false;

      server.staticWatchers[0].on('change', () => {
        // it means that files has changed

        // simulating server behaviour
        if (server.options.liveReload) {
          Object.defineProperty(window, 'location', {
            writable: true,
            value: { assign: jest.fn() },
          });

          Object.defineProperty(window.location, 'reload', {
            writable: true,
            value: { assign: jest.fn() },
          });

          window.location.reload = jest.fn();
          window.location.reload();
          reloaded = true;
        }
        expect(reloaded).toBe(true);

        done();
      });

      // change file content
      setTimeout(() => {
        fs.writeFileSync(nestedFile, 'Heyo', 'utf8');
      }, 1000);
    });
  });
});
