"use strict";

const path = require("path");
const webpack = require("webpack");
const execa = require("execa");
const stripAnsi = require("strip-ansi-v6");
const schema = require("../../lib/options.json");
const cliOptions = require("../../bin/cli-flags");
const { testBin, normalizeStderr } = require("../helpers/test-bin");
const isWebpack5 = require("../helpers/isWebpack5");
const port = require("../ports-map")["cli-basic"];

const isMacOS = process.platform === "darwin";
const webpack5Test = isWebpack5 ? it : it.skip;

describe("basic", () => {
  describe("should validate CLI options", () => {
    webpack5Test("should be same as in schema", () => {
      const cliOptionsFromWebpack = webpack.cli.getArguments(schema);

      const normalizedCliOptions = {};

      for (const [name, options] of Object.entries(cliOptions)) {
        // Only webpack-cli supports it
        // TODO send PR to webpack
        delete options.negatedDescription;

        normalizedCliOptions[name] = options;
      }

      expect(normalizedCliOptions).toStrictEqual(cliOptionsFromWebpack);
    });
  });

  describe("should output help", () => {
    (isMacOS ? it.skip : it)("should generate correct cli flags", async () => {
      const { exitCode, stdout } = await testBin(["--help"]);

      expect(exitCode).toBe(0);
      expect(stripAnsi(stdout)).toMatchSnapshot();
    });
  });

  describe("basic", () => {
    it("should work", async () => {
      const { exitCode, stderr } = await testBin([
        // Ideally it should be empty to test without arguments, unfortunately it takes 8080 port and other test can failed
        "--port",
        port,
      ]);

      expect(exitCode).toEqual(0);
      expect(normalizeStderr(stderr, { ipv6: true })).toMatchSnapshot("stderr");
    });

    it('should work using "--host localhost --port <port>"', async () => {
      const { exitCode, stderr } = await testBin([
        "--port",
        port,
        "--host",
        "localhost",
      ]);

      expect(exitCode).toEqual(0);
      expect(normalizeStderr(stderr)).toMatchSnapshot("stderr");
    });

    it("should accept the promise function of webpack.config.js", async () => {
      const { exitCode, stderr } = await testBin([
        "--config",
        path.resolve(
          __dirname,
          "../fixtures/cli-promise-config/webpack.config.js"
        ),
        "--port",
        port,
      ]);

      expect(exitCode).toEqual(0);
      expect(normalizeStderr(stderr, { ipv6: true })).toMatchSnapshot("stderr");
    });

    it("should work using multi compiler mode", async () => {
      const { exitCode, stderr } = await testBin([
        "--config",
        path.resolve(
          __dirname,
          "../fixtures/cli-universal-compiler-config/webpack.config.js"
        ),
        "--port",
        port,
      ]);

      expect(exitCode).toEqual(0);
      expect(normalizeStderr(stderr, { ipv6: true })).toMatchSnapshot("stderr");
    });

    it("should exit the process when SIGINT is detected", (done) => {
      const cliPath = path.resolve(
        __dirname,
        "../../bin/webpack-dev-server.js"
      );
      const examplePath = path.resolve(
        __dirname,
        "../../examples/client/web-socket-url"
      );
      const cp = execa("node", ["--port", port, cliPath], { cwd: examplePath });

      cp.stdout.on("data", (data) => {
        const bits = data.toString();

        if (/main.js/.test(bits)) {
          expect(cp.pid !== 0).toBe(true);

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
        "../../bin/webpack-dev-server.js"
      );
      const cwd = path.resolve(__dirname, "../fixtures/cli");
      const cp = execa("node", ["--port", port, cliPath], { cwd });

      let killed = false;

      cp.stdout.on("data", () => {
        if (!killed) {
          expect(cp.pid !== 0).toBe(true);

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
        "../../bin/webpack-dev-server.js"
      );
      const examplePath = path.resolve(
        __dirname,
        "../../examples/client/web-socket-url"
      );
      const cp = execa(
        "node",
        [cliPath, "--port", port, "--watch-options-stdin"],
        {
          cwd: examplePath,
        }
      );

      cp.stdout.on("data", (data) => {
        const bits = data.toString();

        if (/main.js/.test(bits)) {
          expect(cp.pid !== 0).toBe(true);

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
        "../../bin/webpack-dev-server.js"
      );
      const cwd = path.resolve(__dirname, "../fixtures/cli");
      const cp = execa(
        "node",
        [cliPath, "--port", port, "--watch-options-stdin"],
        { cwd }
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
          expect(cp.pid !== 0).toBe(true);

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
      const { exitCode, stdout } = await testBin([
        "--port",
        port,
        "--config",
        "./test/fixtures/cli-single-entry/webpack.config.js",
      ]);

      expect(exitCode).toEqual(0);
      expect(stdout).toContain("client/index.js?");
    });

    webpack5Test(
      "should add dev server entry points to a multi entry point object",
      async () => {
        const { exitCode, stdout } = await testBin([
          "--port",
          port,
          "--config",
          "./test/fixtures/cli-multi-entry/webpack.config.js",
          "--stats",
          "verbose",
        ]);

        expect(exitCode).toEqual(0);
        expect(stdout).toContain("client/index.js?");
        expect(stdout).toContain("foo.js");
      }
    );

    webpack5Test(
      "should add dev server entry points to an empty entry object",
      async () => {
        const { exitCode, stdout } = await testBin([
          "--port",
          port,
          "--config",
          "./test/fixtures/cli-empty-entry/webpack.config.js",
        ]);

        expect(exitCode).toEqual(0);
        expect(stdout).toContain("client/index.js?");
      }
    );

    webpack5Test("should supports entry as descriptor", async () => {
      const { exitCode, stdout } = await testBin([
        "--port",
        port,
        "--config",
        "./test/fixtures/cli-entry-as-descriptor/webpack.config",
        "--stats",
        "detailed",
      ]);

      expect(exitCode).toEqual(0);
      expect(stdout).toContain("foo.js");
    });

    it('should only prepends dev server entry points to "web" target', async () => {
      const { exitCode, stdout } = await testBin([
        "--port",
        port,
        "--target",
        "web",
      ]);

      expect(exitCode).toEqual(0);
      expect(stdout).toContain("client/index.js?");
      expect(stdout).toContain("foo.js");
    });

    it('should not prepend dev server entry points to "node" target', async () => {
      const { exitCode, stdout } = await testBin([
        "--port",
        port,
        "--target",
        "node",
      ]);

      expect(exitCode).toEqual(0);
      expect(stdout).not.toContain("client/index.js?");
      expect(stdout).toContain("foo.js");
    });

    it('should prepends the hot runtime to "node" target as well', async () => {
      const { exitCode, stdout } = await testBin([
        "--port",
        port,
        "--target",
        "node",
        "--hot",
      ]);

      expect(exitCode).toEqual(0);
      expect(stdout).toContain("webpack/hot/dev-server");
    });

    webpack5Test(
      "should prepend dev server entry points depending on targetProperties",
      async () => {
        const { exitCode, stdout } = await testBin([
          "--port",
          port,
          "--config",
          "./test/fixtures/cli-target-config/webpack.config.js",
        ]);

        expect(exitCode).toEqual(0);
        expect(stdout).toContain("client/index.js");
      }
    );

    it.skip("should use different random port when multiple instances are started on different processes", async () => {
      const cliPath = path.resolve(
        __dirname,
        "../../bin/webpack-dev-server.js"
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
          runtime.cp.port = portMatch[1];
        }

        if (/Compiled successfully/.test(bits)) {
          expect(cp.pid !== 0).toBe(true);
          cp.kill("SIGINT");
        }
      });

      cp2.stderr.on("data", (data) => {
        const bits = data.toString();
        const portMatch =
          /Project is running at http:\/\/localhost:(\d*)\//.exec(bits);

        if (portMatch) {
          runtime.cp2.port = portMatch[1];
        }

        if (/Compiled successfully/.test(bits)) {
          expect(cp.pid !== 0).toBe(true);
          cp2.kill("SIGINT");
        }
      });

      cp.on("exit", () => {
        runtime.cp.done = true;
        if (runtime.cp2.done) {
          expect(runtime.cp.port !== runtime.cp2.port).toBe(true);
        }
      });

      cp2.on("exit", () => {
        runtime.cp2.done = true;

        if (runtime.cp.done) {
          expect(runtime.cp.port !== runtime.cp2.port).toBe(true);
        }
      });
    });
  });
});
