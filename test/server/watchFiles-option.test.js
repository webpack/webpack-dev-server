"use strict";

const path = require("path");
const webpack = require("webpack");
const fs = require("graceful-fs");
const chokidar = require("chokidar");
const Server = require("../../lib/Server");
const config = require("../fixtures/static-config/webpack.config");
const port = require("../ports-map")["watch-files-option"];

const watchDir = path.resolve(__dirname, "../fixtures/static-config/public");

describe("'watchFiles' option", () => {
  let server;

  describe("should work with string and path to file", () => {
    const file = path.join(watchDir, "assets/example.txt");

    beforeAll(async () => {
      const compiler = webpack(config);

      server = new Server(
        {
          watchFiles: file,
          port,
        },
        compiler
      );

      await server.start();
    });

    afterAll(async () => {
      await server.stop();

      fs.truncateSync(file);
    });

    it("should reload on file content changed", (done) => {
      server.staticWatchers[0].on("change", (changedPath) => {
        expect(changedPath).toBe(file);

        done();
      });

      // change file content
      setTimeout(() => {
        fs.writeFileSync(file, "Kurosaki Ichigo", "utf8");
      }, 1000);
    });
  });

  describe("should work with string and path to dir", () => {
    const file = path.join(watchDir, "assets/example.txt");

    beforeAll(async () => {
      const compiler = webpack(config);

      server = new Server(
        {
          watchFiles: watchDir,
          port,
        },
        compiler
      );

      await server.start();
    });

    afterAll(async () => {
      await server.stop();

      fs.truncateSync(file);
    });

    it("should reload on file content changed", (done) => {
      server.staticWatchers[0].on("change", (changedPath) => {
        expect(changedPath).toBe(file);

        done();
      });

      // change file content
      setTimeout(() => {
        fs.writeFileSync(file, "Kurosaki Ichigo", "utf8");
      }, 1000);
    });
  });

  describe("should work with string and glob", () => {
    const file = path.join(watchDir, "assets/example.txt");

    beforeAll(async () => {
      const compiler = webpack(config);

      server = new Server(
        {
          watchFiles: `${watchDir}/**/*`,
          port,
        },
        compiler
      );

      await server.start();
    });

    afterAll(async () => {
      await server.stop();

      fs.truncateSync(file);
    });

    it("should reload on file content changed", (done) => {
      server.staticWatchers[0].on("change", (changedPath) => {
        expect(changedPath).toBe(file);

        done();
      });

      // change file content
      setTimeout(() => {
        fs.writeFileSync(file, "Kurosaki Ichigo", "utf8");
      }, 1000);
    });
  });

  describe("should work not crash on non exist file", () => {
    const nonExistFile = path.join(watchDir, "assets/non-exist.txt");

    beforeAll(async () => {
      try {
        fs.unlinkSync(nonExistFile);
      } catch (error) {
        // ignore
      }

      const compiler = webpack(config);

      server = new Server(
        {
          watchFiles: nonExistFile,
          port,
        },
        compiler
      );

      await server.start();
    });

    afterAll(async () => {
      await server.stop();

      fs.truncateSync(nonExistFile);
    });

    it("should reload on file content changed", (done) => {
      server.staticWatchers[0].once("change", (changedPath) => {
        expect(changedPath).toBe(nonExistFile);

        done();
      });

      // create file content
      setTimeout(() => {
        fs.writeFileSync(nonExistFile, "Kurosaki Ichigo", "utf8");

        // change file content
        setTimeout(() => {
          fs.writeFileSync(nonExistFile, "Kurosaki Ichigo", "utf8");
        }, 1000);
      }, 1000);
    });
  });

  describe("should work with object with single path", () => {
    const file = path.join(watchDir, "assets/example.txt");

    beforeAll(async () => {
      const compiler = webpack(config);

      server = new Server(
        {
          watchFiles: { paths: file },
          port,
        },
        compiler
      );

      await server.start();
    });

    afterAll(async () => {
      await server.stop();

      fs.truncateSync(file);
    });

    it("should reload on file content channge", (done) => {
      server.staticWatchers[0].on("change", (changedPath) => {
        expect(changedPath).toBe(file);

        done();
      });

      // change file content
      setTimeout(() => {
        fs.writeFileSync(file, "Kurosaki Ichigo", "utf8");
      }, 1000);
    });
  });

  describe("should work with object with multiple paths", () => {
    const file = path.join(watchDir, "assets/example.txt");
    const other = path.join(watchDir, "assets/other.txt");

    beforeAll(async () => {
      const compiler = webpack(config);

      server = new Server(
        {
          watchFiles: { paths: [file, other] },
          port,
        },
        compiler
      );

      await server.start();
    });

    afterAll(async () => {
      await server.stop();

      fs.truncateSync(file);
    });

    it("should reload on file content channge", (done) => {
      const expected = [file, other];

      let changed = 0;

      server.staticWatchers[0].on("change", (changedPath) => {
        expect(expected.includes(changedPath)).toBeTruthy();

        changed += 1;

        if (changed === 2) {
          done();
        }
      });

      // change file content
      setTimeout(() => {
        fs.writeFileSync(file, "Kurosaki Ichigo", "utf8");
        fs.writeFileSync(other, "Kurosaki Ichigo", "utf8");
      }, 1000);
    });
  });

  describe("should work with array config", () => {
    const file = path.join(watchDir, "assets/example.txt");
    const other = path.join(watchDir, "assets/other.txt");

    beforeAll(async () => {
      const compiler = webpack(config);

      server = new Server(
        {
          watchFiles: [{ paths: [file] }, other],
          port,
        },
        compiler
      );

      await server.start();
    });

    afterAll(async () => {
      await server.stop();

      fs.truncateSync(file);
      fs.truncateSync(other);
    });

    it("should reload on file content change", (done) => {
      let changed = 0;

      server.staticWatchers[0].on("change", (changedPath) => {
        expect(changedPath).toBe(file);

        changed += 1;

        if (changed === 2) {
          done();
        }
      });

      server.staticWatchers[1].on("change", (changedPath) => {
        expect(changedPath).toBe(other);

        changed += 1;

        if (changed === 2) {
          done();
        }
      });

      // change file content
      setTimeout(() => {
        fs.writeFileSync(file, "Kurosaki Ichigo", "utf8");
        fs.writeFileSync(other, "Kurosaki Ichigo", "utf8");
      }, 1000);
    });
  });

  describe("should work with options", () => {
    const file = path.join(watchDir, "assets/example.txt");

    const chokidarMock = jest.spyOn(chokidar, "watch");

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
        usePolling: true,
        poll: 200,
      },
      {
        usePolling: false,
      },
      {
        usePolling: false,
        poll: 200,
      },
      {
        usePolling: false,
        poll: true,
      },
      {
        interval: 400,
        poll: 200,
      },
      {
        usePolling: true,
        interval: 200,
        poll: 400,
      },
      {
        usePolling: false,
        interval: 200,
        poll: 400,
      },
    ];

    optionCases.forEach((optionCase) => {
      describe(JSON.stringify(optionCase), () => {
        beforeAll(async () => {
          chokidarMock.mockClear();

          const compiler = webpack(config);

          server = new Server(
            {
              watchFiles: {
                paths: file,
                options: optionCase,
              },
              port,
            },
            compiler
          );

          await server.start();
        });

        afterAll(async () => {
          await server.stop();

          fs.truncateSync(file);
        });

        it("should pass correct options to chokidar config", () => {
          expect(chokidarMock.mock.calls[0][1]).toMatchSnapshot();
        });

        it("should reload on file content changed", (done) => {
          server.staticWatchers[0].on("change", (changedPath) => {
            expect(changedPath).toBe(file);

            done();
          });

          // change file content
          setTimeout(() => {
            fs.writeFileSync(file, "Kurosaki Ichigo", "utf8");
          }, 1000);
        });
      });
    });
  });
});
