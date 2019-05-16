'use strict';

const path = require('path');
const fs = require('fs');
const helper = require('./helper');
const config = require('./fixtures/contentbase-config/webpack.config');

const contentBasePublic = path.join(
  __dirname,
  'fixtures/contentbase-config/public'
);

describe('liveReload', () => {
  let server;
  describe('Test disabling live reloading', () => {
    const nestedFile = path.join(contentBasePublic, 'assets/example.txt');

    jest.setTimeout(30000);

    beforeAll((done) => {
      server = helper.start(
        config,
        {
          contentBase: contentBasePublic,
          watchContentBase: true,
          liveReload: false,
        },
        done
      );
    });

    afterAll((done) => {
      helper.close(() => {
        done();
      });
      fs.truncateSync(nestedFile);
    });

    it('Should not reload on changing files', (done) => {
      let reloaded = false;

      server.contentBaseWatchers[0].on('change', () => {
        // it means that file has changed

        // simulating server behaviour
        if (server.options.liveReload !== false) {
          Object.defineProperty(window.location, 'reload', {
            configurable: true,
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

    jest.setTimeout(30000);

    beforeAll((done) => {
      server = helper.start(
        config,
        {
          contentBase: contentBasePublic,
          watchContentBase: true,
          liveReload: true,
        },
        done
      );
    });

    afterAll((done) => {
      helper.close(() => {
        done();
      });
      fs.truncateSync(nestedFile);
    });

    it('Should reload on changing files', (done) => {
      let reloaded = false;

      server.contentBaseWatchers[0].on('change', () => {
        // it means that files has changed

        // simulating server behaviour
        if (server.options.liveReload !== false) {
          Object.defineProperty(window.location, 'reload', {
            configurable: true,
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
