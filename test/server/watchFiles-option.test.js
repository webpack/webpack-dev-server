'use strict';

const path = require('path');
const fs = require('fs');
const testServer = require('../helpers/test-server');
const config = require('../fixtures/contentbase-config/webpack.config');
const port = require('../ports-map')['watchFiles-option'];

const contentBasePublic = path.resolve(
  __dirname,
  '../fixtures/contentbase-config/public'
);

describe('watchFiles option', () => {
  let server;

  describe('Should work with string config', () => {
    const nestedFile = path.join(contentBasePublic, 'assets/example.txt');

    beforeAll((done) => {
      server = testServer.start(
        config,
        {
          watchFiles: nestedFile,
          port,
        },
        done
      );
    });

    afterAll((done) => {
      testServer.close(done);
      fs.truncateSync(nestedFile);
    });

    it('Should reload on file content channge', (done) => {
      server.staticWatchers[0].on('change', () => {
        done();
      });

      // change file content
      setTimeout(() => {
        fs.writeFileSync(nestedFile, 'Kurosaki Ichigo', 'utf8');
      }, 1000);
    });
  });

  describe('Should work with object config', () => {
    const nestedFile = path.join(contentBasePublic, 'assets/example.txt');

    beforeAll((done) => {
      server = testServer.start(
        config,
        {
          watchFiles: { paths: [nestedFile], options: { polls: 500 } },
          port,
        },
        done
      );
    });

    afterAll((done) => {
      testServer.close(done);
      fs.truncateSync(nestedFile);
    });

    it('Should reload on file content channge', (done) => {
      server.staticWatchers[0].on('change', () => {
        done();
      });

      // change file content
      setTimeout(() => {
        fs.writeFileSync(nestedFile, 'Kurosaki Ichigo', 'utf8');
      }, 1000);
    });
  });
});
