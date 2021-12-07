"use strict";

const path = require("path");
const chokidar = require("chokidar");
const fs = require("graceful-fs");
const webpack = require("webpack");
const Server = require("../../lib/Server");
const config = require("../fixtures/static-config/webpack.config");
const runBrowser = require("../helpers/run-browser");
const port = require("../ports-map")["watch-files-option"];

const watchDir = path.resolve(__dirname, "../fixtures/static-config/public");

describe("watchFiles option", () => {
  describe("should work with string and path to file", () => {
    const file = path.join(watchDir, "assets/example.txt");
    let compiler;
    let server;
    let page;
    let browser;
    let pageErrors;
    let consoleMessages;

    beforeEach(async () => {
      compiler = webpack(config);

      server = new Server(
        {
          watchFiles: file,
          port,
        },
        compiler
      );

      await server.start();

      ({ page, browser } = await runBrowser());

      pageErrors = [];
      consoleMessages = [];
    });

    afterEach(async () => {
      await browser.close();
      await server.stop();
      fs.truncateSync(file);
    });

    it("should handle GET request to bundle file", async () => {
      page
        .on("console", (message) => {
          consoleMessages.push(message);
        })
        .on("pageerror", (error) => {
          pageErrors.push(error);
        });

      const response = await page.goto(`http://127.0.0.1:${port}/main.js`, {
        waitUntil: "networkidle0",
      });

      expect(response.status()).toMatchSnapshot("response status");

      expect(consoleMessages.map((message) => message.text())).toMatchSnapshot(
        "console messages"
      );

      expect(pageErrors).toMatchSnapshot("page errors");
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

  describe("should work with string and path to directory", () => {
    const file = path.join(watchDir, "assets/example.txt");
    let compiler;
    let server;
    let page;
    let browser;
    let pageErrors;
    let consoleMessages;

    beforeEach(async () => {
      compiler = webpack(config);

      server = new Server(
        {
          watchFiles: watchDir,
          port,
        },
        compiler
      );

      await server.start();

      ({ page, browser } = await runBrowser());

      pageErrors = [];
      consoleMessages = [];
    });

    afterEach(async () => {
      await browser.close();
      await server.stop();
      fs.truncateSync(file);
    });

    it("should handle GET request to bundle file", async () => {
      page
        .on("console", (message) => {
          consoleMessages.push(message);
        })
        .on("pageerror", (error) => {
          pageErrors.push(error);
        });

      const response = await page.goto(`http://127.0.0.1:${port}/main.js`, {
        waitUntil: "networkidle0",
      });

      expect(response.status()).toMatchSnapshot("response status");

      expect(consoleMessages.map((message) => message.text())).toMatchSnapshot(
        "console messages"
      );

      expect(pageErrors).toMatchSnapshot("page errors");
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
    let compiler;
    let server;
    let page;
    let browser;
    let pageErrors;
    let consoleMessages;

    beforeEach(async () => {
      compiler = webpack(config);

      server = new Server(
        {
          watchFiles: `${watchDir}/**/*`,
          port,
        },
        compiler
      );

      await server.start();

      ({ page, browser } = await runBrowser());

      pageErrors = [];
      consoleMessages = [];
    });

    afterEach(async () => {
      await browser.close();
      await server.stop();
      fs.truncateSync(file);
    });

    it("should handle GET request to bundle file", async () => {
      page
        .on("console", (message) => {
          consoleMessages.push(message);
        })
        .on("pageerror", (error) => {
          pageErrors.push(error);
        });

      const response = await page.goto(`http://127.0.0.1:${port}/main.js`, {
        waitUntil: "networkidle0",
      });

      expect(response.status()).toMatchSnapshot("response status");

      expect(consoleMessages.map((message) => message.text())).toMatchSnapshot(
        "console messages"
      );

      expect(pageErrors).toMatchSnapshot("page errors");
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

  describe("should not crash if wile doesn't exist", () => {
    const nonExistFile = path.join(watchDir, "assets/non-exist.txt");
    let compiler;
    let server;
    let page;
    let browser;
    let pageErrors;
    let consoleMessages;

    beforeEach(async () => {
      try {
        fs.unlinkSync(nonExistFile);
      } catch (error) {
        // ignore
      }

      compiler = webpack(config);

      server = new Server(
        {
          watchFiles: nonExistFile,
          port,
        },
        compiler
      );

      await server.start();

      ({ page, browser } = await runBrowser());

      pageErrors = [];
      consoleMessages = [];
    });

    afterEach(async () => {
      await browser.close();
      await server.stop();
    });

    it("should handle GET request to bundle file", async () => {
      page
        .on("console", (message) => {
          consoleMessages.push(message);
        })
        .on("pageerror", (error) => {
          pageErrors.push(error);
        });

      const response = await page.goto(`http://127.0.0.1:${port}/main.js`, {
        waitUntil: "networkidle0",
      });

      expect(response.status()).toMatchSnapshot("response status");

      expect(consoleMessages.map((message) => message.text())).toMatchSnapshot(
        "console messages"
      );

      expect(pageErrors).toMatchSnapshot("page errors");
    });

    it("should reload on file content changed", (done) => {
      server.staticWatchers[0].on("change", (changedPath) => {
        expect(changedPath).toBe(nonExistFile);
        fs.truncateSync(nonExistFile);
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
    let compiler;
    let server;
    let page;
    let browser;
    let pageErrors;
    let consoleMessages;

    beforeEach(async () => {
      compiler = webpack(config);

      server = new Server(
        {
          watchFiles: { paths: file },
          port,
        },
        compiler
      );

      await server.start();

      ({ page, browser } = await runBrowser());

      pageErrors = [];
      consoleMessages = [];
    });

    afterEach(async () => {
      await browser.close();
      await server.stop();
      fs.truncateSync(file);
    });

    it("should handle GET request to bundle file", async () => {
      page
        .on("console", (message) => {
          consoleMessages.push(message);
        })
        .on("pageerror", (error) => {
          pageErrors.push(error);
        });

      const response = await page.goto(`http://127.0.0.1:${port}/main.js`, {
        waitUntil: "networkidle0",
      });

      expect(response.status()).toMatchSnapshot("response status");

      expect(consoleMessages.map((message) => message.text())).toMatchSnapshot(
        "console messages"
      );

      expect(pageErrors).toMatchSnapshot("page errors");
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

  describe("should work with object with multiple paths", () => {
    const file = path.join(watchDir, "assets/example.txt");
    const other = path.join(watchDir, "assets/other.txt");
    let compiler;
    let server;
    let page;
    let browser;
    let pageErrors;
    let consoleMessages;

    beforeEach(async () => {
      compiler = webpack(config);

      server = new Server(
        {
          watchFiles: { paths: [file, other] },
          port,
        },
        compiler
      );

      await server.start();

      ({ page, browser } = await runBrowser());

      pageErrors = [];
      consoleMessages = [];
    });

    afterEach(async () => {
      await browser.close();
      await server.stop();
      fs.truncateSync(file);
      fs.truncateSync(other);
    });

    it("should handle GET request to bundle file", async () => {
      page
        .on("console", (message) => {
          consoleMessages.push(message);
        })
        .on("pageerror", (error) => {
          pageErrors.push(error);
        });

      const response = await page.goto(`http://127.0.0.1:${port}/main.js`, {
        waitUntil: "networkidle0",
      });

      expect(response.status()).toMatchSnapshot("response status");

      expect(consoleMessages.map((message) => message.text())).toMatchSnapshot(
        "console messages"
      );

      expect(pageErrors).toMatchSnapshot("page errors");
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
        fs.writeFileSync(file, "foo", "utf8");
        fs.writeFileSync(other, "bar", "utf8");
      }, 1000);
    });
  });

  describe("should work with array config", () => {
    const file = path.join(watchDir, "assets/example.txt");
    const other = path.join(watchDir, "assets/other.txt");
    let compiler;
    let server;
    let page;
    let browser;
    let pageErrors;
    let consoleMessages;

    beforeEach(async () => {
      compiler = webpack(config);

      server = new Server(
        {
          watchFiles: [{ paths: [file] }, other],
          port,
        },
        compiler
      );

      await server.start();

      ({ page, browser } = await runBrowser());

      pageErrors = [];
      consoleMessages = [];
    });

    afterEach(async () => {
      await browser.close();
      await server.stop();
      fs.truncateSync(file);
      fs.truncateSync(other);
    });

    it("should handle GET request to bundle file", async () => {
      page
        .on("console", (message) => {
          consoleMessages.push(message);
        })
        .on("pageerror", (error) => {
          pageErrors.push(error);
        });

      const response = await page.goto(`http://127.0.0.1:${port}/main.js`, {
        waitUntil: "networkidle0",
      });

      expect(response.status()).toMatchSnapshot("response status");

      expect(consoleMessages.map((message) => message.text())).toMatchSnapshot(
        "console messages"
      );

      expect(pageErrors).toMatchSnapshot("page errors");
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
        let compiler;
        let server;
        let page;
        let browser;
        let pageErrors;
        let consoleMessages;

        beforeEach(async () => {
          chokidarMock.mockClear();

          compiler = webpack(config);

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

          ({ page, browser } = await runBrowser());

          pageErrors = [];
          consoleMessages = [];
        });

        afterEach(async () => {
          await server.stop();
          await browser.close();
          fs.truncateSync(file);
        });

        it("should handle GET request to bundle file", async () => {
          page
            .on("console", (message) => {
              consoleMessages.push(message);
            })
            .on("pageerror", (error) => {
              pageErrors.push(error);
            });

          const response = await page.goto(`http://127.0.0.1:${port}/main.js`, {
            waitUntil: "networkidle0",
          });

          // should pass correct options to chokidar config
          expect(chokidarMock.mock.calls[0][1]).toMatchSnapshot();

          expect(response.status()).toMatchSnapshot("response status");

          expect(
            consoleMessages.map((message) => message.text())
          ).toMatchSnapshot("console messages");

          expect(pageErrors).toMatchSnapshot("page errors");
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
