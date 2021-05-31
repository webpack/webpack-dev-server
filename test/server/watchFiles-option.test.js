'use strict';

const path = require('path');
const fs = require('graceful-fs');
const chokidar = require('chokidar');
const testServer = require('../helpers/test-server');
const config = require('../fixtures/contentbase-config/webpack.config');
const port = require('../ports-map')['watchFiles-option'];

const watchDir = path.resolve(
  __dirname,
  '../fixtures/contentbase-config/public'
);

describe("'watchFiles' option", () => {
  let server;

  describe('should work with string and path to file', () => {
    const file = path.join(watchDir, 'assets/example.txt');

    beforeAll((done) => {
      server = testServer.start(
        config,
        {
          watchFiles: file,
          port,
        },
        done
      );
    });

    afterAll((done) => {
      testServer.close(done);
      fs.truncateSync(file);
    });

    it('should reload on file content changed', (done) => {
      server.staticWatchers[0].on('change', (changedPath) => {
        expect(changedPath).toBe(file);

        done();
      });

      // change file content
      setTimeout(() => {
        fs.writeFileSync(file, 'Kurosaki Ichigo', 'utf8');
      }, 1000);
    });
  });

  describe('should work with string and path to dir', () => {
    const file = path.join(watchDir, 'assets/example.txt');

    beforeAll((done) => {
      server = testServer.start(
        config,
        {
          watchFiles: watchDir,
          port,
        },
        done
      );
    });

    afterAll((done) => {
      testServer.close(done);
      fs.truncateSync(file);
    });

    it('should reload on file content changed', (done) => {
      server.staticWatchers[0].on('change', (changedPath) => {
        expect(changedPath).toBe(file);

        done();
      });

      // change file content
      setTimeout(() => {
        fs.writeFileSync(file, 'Kurosaki Ichigo', 'utf8');
      }, 1000);
    });
  });

  describe('should work with string and glob', () => {
    const file = path.join(watchDir, 'assets/example.txt');

    beforeAll((done) => {
      server = testServer.start(
        config,
        {
          watchFiles: `${watchDir}/**/*`,
          port,
        },
        done
      );
    });

    afterAll((done) => {
      testServer.close(done);
      fs.truncateSync(file);
    });

    it('should reload on file content changed', (done) => {
      server.staticWatchers[0].on('change', (changedPath) => {
        expect(changedPath).toBe(file);

        done();
      });

      // change file content
      setTimeout(() => {
        fs.writeFileSync(file, 'Kurosaki Ichigo', 'utf8');
      }, 1000);
    });
  });

  describe('should work not crash on non exist file', () => {
    const nonExistFile = path.join(watchDir, 'assets/non-exist.txt');

    beforeAll((done) => {
      server = testServer.start(
        config,
        {
          watchFiles: nonExistFile,
          port,
        },
        done
      );
    });

    afterAll((done) => {
      testServer.close(done);
      fs.truncateSync(nonExistFile);
    });

    it('should reload on file content changed', (done) => {
      server.staticWatchers[0].on('change', (changedPath) => {
        expect(changedPath).toBe(nonExistFile);

        done();
      });

      // change file content
      setTimeout(() => {
        fs.writeFileSync(nonExistFile, 'Kurosaki Ichigo', 'utf8');
      }, 1000);
    });
  });

  describe('should work with object with single path', () => {
    const file = path.join(watchDir, 'assets/example.txt');

    beforeAll((done) => {
      server = testServer.start(
        config,
        {
          watchFiles: { paths: file },
          port,
        },
        done
      );
    });

    afterAll((done) => {
      testServer.close(done);
      fs.truncateSync(file);
    });

    it('should reload on file content channge', (done) => {
      server.staticWatchers[0].on('change', (changedPath) => {
        expect(changedPath).toBe(file);

        done();
      });

      // change file content
      setTimeout(() => {
        fs.writeFileSync(file, 'Kurosaki Ichigo', 'utf8');
      }, 1000);
    });
  });

  describe('should work with object with multiple paths', () => {
    const file = path.join(watchDir, 'assets/example.txt');
    const other = path.join(watchDir, 'assets/other.txt');

    beforeAll((done) => {
      server = testServer.start(
        config,
        {
          watchFiles: { paths: [file, other] },
          port,
        },
        done
      );
    });

    afterAll((done) => {
      testServer.close(done);
      fs.truncateSync(file);
    });

    it('should reload on file content channge', (done) => {
      const expected = [file, other];

      let changed = 0;

      server.staticWatchers[0].on('change', (changedPath) => {
        expect(expected.includes(changedPath)).toBeTruthy();

        changed += 1;

        if (changed === 2) {
          done();
        }
      });

      // change file content
      setTimeout(() => {
        fs.writeFileSync(file, 'Kurosaki Ichigo', 'utf8');
        fs.writeFileSync(other, 'Kurosaki Ichigo', 'utf8');
      }, 1000);
    });
  });

  describe('should work with array config', () => {
    const file = path.join(watchDir, 'assets/example.txt');
    const other = path.join(watchDir, 'assets/other.txt');

    beforeAll((done) => {
      server = testServer.start(
        config,
        {
          watchFiles: [{ paths: [file] }, other],
          port,
        },
        done
      );
    });

    afterAll((done) => {
      testServer.close(done);
      fs.truncateSync(file);
      fs.truncateSync(other);
    });

    it('should reload on file content change', (done) => {
      let changed = 0;

      server.staticWatchers[0].on('change', (changedPath) => {
        expect(changedPath).toBe(file);

        changed += 1;

        if (changed === 2) {
          done();
        }
      });

      server.staticWatchers[1].on('change', (changedPath) => {
        expect(changedPath).toBe(other);

        changed += 1;

        if (changed === 2) {
          done();
        }
      });

      // change file content
      setTimeout(() => {
        fs.writeFileSync(file, 'Kurosaki Ichigo', 'utf8');
        fs.writeFileSync(other, 'Kurosaki Ichigo', 'utf8');
      }, 1000);
    });
  });

  describe('should work with options', () => {
    const file = path.join(watchDir, 'assets/example.txt');

    const chokidarMock = jest.spyOn(chokidar, 'watch');

    const optionCases = [
      {
        poll: true,
      },
      {
        poll: 200,
      },
      {
        usePolling: true,
      },
      {
        usePolling: false,
      },
      {
        usePolling: false,
        poll: true,
      },
      {
        usePolling: true,
        interval: 200,
        poll: 400,
      },
    ];

    optionCases.forEach((optionCase) => {
      describe(JSON.stringify(optionCase), () => {
        beforeAll((done) => {
          chokidarMock.mockClear();
          server = testServer.start(
            config,
            {
              watchFiles: {
                paths: file,
                options: optionCase,
              },
              port,
            },
            done
          );
        });

        afterAll((done) => {
          testServer.close(done);
          fs.truncateSync(file);
        });

        it('should pass correct options to chokidar config', () => {
          expect(chokidarMock.mock.calls[0][1]).toMatchSnapshot();
        });

        it('should reload on file content changed', (done) => {
          server.staticWatchers[0].on('change', (changedPath) => {
            expect(changedPath).toBe(file);

            done();
          });

          // change file content
          setTimeout(() => {
            fs.writeFileSync(file, 'Kurosaki Ichigo', 'utf8');
          }, 1000);
        });
      });
    });
  });
});
