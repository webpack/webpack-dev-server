"use strict";

const path = require("node:path");
const util = require("node:util");
const execa = require("execa");
const { normalizeStderr, testBin } = require("../helpers/test-bin");
const port = require("../ports-map")["cli-basic"];

const isMacOS = process.platform === "darwin";

describe("basic", () => {
  describe("should output help", () => {
    (isMacOS ? it.skip : it)("should generate correct cli flags", async () => {
      const { exitCode, stdout } = await testBin(["--help"]);

      // eslint-disable-next-line jest/no-standalone-expect
      expect(exitCode).toBe(0);
      // eslint-disable-next-line jest/no-standalone-expect
      expect(util.stripVTControlCharacters(stdout)).toMatchSnapshot();
    });
  });

  describe("basic", () => {
    it("should work", async () => {
      const { exitCode, stderr } = await testBin([
        // Ideally it should be empty to test without arguments, unfortunately it takes 8080 port and other test can failed
        "--port",
        port,
      ]);

      expect(exitCode).toBe(0);
      expect(normalizeStderr(stderr, { ipv6: true })).toMatchSnapshot("stderr");
    });

    it('should work using "--host localhost --port <port>"', async () => {
      const { exitCode, stderr } = await testBin([
        "--port",
        port,
        "--host",
        "localhost",
      ]);

      expect(exitCode).toBe(0);
      expect(normalizeStderr(stderr)).toMatchSnapshot("stderr");
    });

    it("should accept the promise function of webpack.config.js", async () => {
      const { exitCode, stderr } = await testBin([
        "--config",
        path.resolve(
          __dirname,
          "../fixtures/cli-promise-config/webpack.config.js",
        ),
        "--port",
        port,
      ]);

      expect(exitCode).toBe(0);
      expect(normalizeStderr(stderr, { ipv6: true })).toMatchSnapshot("stderr");
    });

    it("should work using multi compiler mode", async () => {
      const { exitCode, stderr } = await testBin([
        "--config",
        path.resolve(
          __dirname,
          "../fixtures/cli-universal-compiler-config/webpack.config.js",
        ),
        "--port",
        port,
      ]);

      expect(exitCode).toBe(0);
      expect(normalizeStderr(stderr, { ipv6: true })).toMatchSnapshot("stderr");
    });

    it("should exit the process when SIGINT is detected", (done) => {
      const cliPath = path.resolve(
        __dirname,
        "../../bin/webpack-dev-server.js",
      );
      const examplePath = path.resolve(
        __dirname,
        "../../examples/client/web-socket-url",
      );
      const cp = execa("node", ["--port", port, cliPath], { cwd: examplePath });

      cp.stdout.on("data", (data) => {
        const bits = data.toString();

        if (/main.js/.test(bits)) {
          expect(cp.pid).not.toBe(0);

          cp.kill("SIGINT");
        }
      });

      cp.on("exit", () => {
        done();
      });
    });

    it("should exit the process when SIGINT is detected, even before the compilation is done", (done) => {
      const cliPath = path.resolve(
        __dirname,
        "../../bin/webpack-dev-server.js",
      );
      const cwd = path.resolve(__dirname, "../fixtures/cli");
      const cp = execa("node", ["--port", port, cliPath], { cwd });

      let killed = false;

      cp.stdout.on("data", () => {
        if (!killed) {
          expect(cp.pid).not.toBe(0);

          cp.kill("SIGINT");
        }

        killed = true;
      });

      cp.on("exit", () => {
        done();
      });
    });

    it("should exit the process when stdin ends if --watch-options-stdin", (done) => {
      const cliPath = path.resolve(
        __dirname,
        "../../bin/webpack-dev-server.js",
      );
      const examplePath = path.resolve(
        __dirname,
        "../../examples/client/web-socket-url",
      );
      const cp = execa(
        "node",
        [cliPath, "--port", port, "--watch-options-stdin"],
        {
          cwd: examplePath,
        },
      );

      cp.stdout.on("data", (data) => {
        const bits = data.toString();

        if (/main.js/.test(bits)) {
          expect(cp.pid).not.toBe(0);

          cp.stdin.write("hello");
          cp.stdin.end("world");
        }
      });

      cp.on("exit", () => {
        done();
      });
    });

    it("should exit the process when stdin ends if --watch-options-stdin, even before the compilation is done", (done) => {
      const cliPath = path.resolve(
        __dirname,
        "../../bin/webpack-dev-server.js",
      );
      const cwd = path.resolve(__dirname, "../fixtures/cli");
      const cp = execa(
        "node",
        [cliPath, "--port", port, "--watch-options-stdin"],
        { cwd },
      );

      let killed = false;

      cp.on("error", (error) => {
        done(error);
      });

      cp.stdin.on("error", (error) => {
        done(error);
      });

      cp.stdout.on("data", () => {
        if (!killed) {
          expect(cp.pid).not.toBe(0);

          cp.stdin.write("hello");
          cp.stdin.end("world");
        }

        killed = true;
      });

      cp.on("exit", () => {
        done();
      });
    });

    it("should add dev server entry points to a single entry point", async () => {
      const { exitCode, stdout } = await testBin(
        [
          "--port",
          port,
          "--config",
          "./test/fixtures/cli-single-entry/webpack.config.js",
        ],
        {
          outputKillStr: /client\/index\.js\?/,
        },
      );

      expect(exitCode).toBe(0);
      expect(stdout).toContain("client/index.js?");
    });

    it("should add dev server entry points to a multi entry point object", async () => {
      const { exitCode, stdout } = await testBin(
        [
          "--port",
          port,
          "--config",
          "./test/fixtures/cli-multi-entry/webpack.config.js",
          "--stats",
          "verbose",
        ],
        {
          outputKillStr: /foo\.js/,
        },
      );

      expect(exitCode).toBe(0);
      expect(stdout).toContain("client/index.js?");
      expect(stdout).toContain("foo.js");
    });

    it("should add dev server entry points to an empty entry object", async () => {
      const { exitCode, stdout } = await testBin(
        [
          "--port",
          port,
          "--config",
          "./test/fixtures/cli-empty-entry/webpack.config.js",
        ],
        {
          outputKillStr: /client\/index\.js\?/,
        },
      );

      expect(exitCode).toBe(0);
      expect(stdout).toContain("client/index.js?");
    });

    it("should supports entry as descriptor", async () => {
      const { exitCode, stdout } = await testBin(
        [
          "--port",
          port,
          "--config",
          "./test/fixtures/cli-entry-as-descriptor/webpack.config",
          "--stats",
          "detailed",
        ],
        {
          outputKillStr: /foo\.js/,
        },
      );

      expect(exitCode).toBe(0);
      expect(stdout).toContain("foo.js");
    });

    it('should only prepends dev server entry points to "web" target', async () => {
      const { exitCode, stdout } = await testBin(
        ["--port", port, "--target", "web"],
        {
          outputKillStr: /foo\.js/,
        },
      );

      expect(exitCode).toBe(0);
      expect(stdout).toContain("client/index.js?");
      expect(stdout).toContain("foo.js");
    });

    it('should not prepend dev server entry points to "node" target', async () => {
      const { exitCode, stdout } = await testBin(
        ["--port", port, "--target", "node"],
        {
          outputKillStr: /foo\.js/,
        },
      );

      expect(exitCode).toBe(0);
      expect(stdout).not.toContain("client/index.js?");
      expect(stdout).toContain("foo.js");
    });

    it('should prepends the hot runtime to "node" target as well', async () => {
      const { exitCode, stdout } = await testBin(
        ["--port", port, "--target", "node", "--hot"],
        {
          outputKillStr: /webpack\/hot\/dev-server/,
        },
      );

      expect(exitCode).toBe(0);
      expect(stdout).toContain("webpack/hot/dev-server");
    });

    it("should prepend dev server entry points depending on targetProperties", async () => {
      const { exitCode, stdout } = await testBin(
        [
          "--port",
          port,
          "--config",
          "./test/fixtures/cli-target-config/webpack.config.js",
        ],
        {
          outputKillStr: /client\/index\.js/,
        },
      );

      expect(exitCode).toBe(0);
      expect(stdout).toContain("client/index.js");
    });

    // eslint-disable-next-line jest/no-disabled-tests
    it.skip("should use different random port when multiple instances are started on different processes", async () => {
      const cliPath = path.resolve(
        __dirname,
        "../../bin/webpack-dev-server.js",
      );
      const cwd = path.resolve(__dirname, "../fixtures/cli");

      const cp = execa("node", [cliPath, "--colors=false"], { cwd });
      const cp2 = execa("node", [cliPath, "--colors=false"], { cwd });

      const runtime = {
        cp: {
          port: null,
          done: false,
        },
        cp2: {
          port: null,
          done: false,
        },
      };

      cp.stderr.on("data", (data) => {
        const bits = data.toString();
        const portMatch =
          /Project is running at http:\/\/localhost:(\d*)\//.exec(bits);

        if (portMatch) {
          [, runtime.cp.port] = portMatch;
        }

        if (/Compiled successfully/.test(bits)) {
          expect(cp.pid).not.toBe(0);
          cp.kill("SIGINT");
        }
      });

      cp2.stderr.on("data", (data) => {
        const bits = data.toString();
        const portMatch =
          /Project is running at http:\/\/localhost:(\d*)\//.exec(bits);

        if (portMatch) {
          [, runtime.cp2.port] = portMatch;
        }

        if (/Compiled successfully/.test(bits)) {
          expect(cp.pid).not.toBe(0);
          cp2.kill("SIGINT");
        }
      });

      cp.on("exit", () => {
        runtime.cp.done = true;
        if (runtime.cp2.done) {
          expect(runtime.cp.port).not.toBe(runtime.cp2.port);
        }
      });

      cp2.on("exit", () => {
        runtime.cp2.done = true;

        if (runtime.cp.done) {
          expect(runtime.cp.port).not.toBe(runtime.cp2.port);
        }
      });
    });
  });
});
