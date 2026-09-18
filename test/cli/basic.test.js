import path from "node:path";
import { describe, it } from "node:test";
import { fileURLToPath } from "node:url";
import util from "node:util";
import { execa } from "execa";
import { expect } from "expect";
import { normalizeStderr, testBin } from "../helpers/test-bin.js";
import portsMap from "../ports-map.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const port = portsMap["cli-basic"];

const isMacOS = process.platform === "darwin";
const isWindows = process.platform === "win32";

describe("basic", () => {
  describe("should output help", () => {
    (isMacOS ? it.skip : it)("should generate correct cli flags", async (t) => {
      const { exitCode, stdout } = await testBin(["--help"]);

      expect(exitCode).toBe(0);
      t.assert.snapshot(util.stripVTControlCharacters(stdout));
    });
  });

  describe("basic", () => {
    it("should work", async (t) => {
      const { exitCode, stderr } = await testBin([
        // Ideally it should be empty to test without arguments, unfortunately it takes 8080 port and other test can failed
        "--port",
        port,
      ]);

      expect(exitCode).toBe(0);
      t.assert.snapshot(normalizeStderr(stderr, { ipv6: true }));
    });

    it('should work using "--host localhost --port <port>"', async (t) => {
      const { exitCode, stderr } = await testBin([
        "--port",
        port,
        "--host",
        "localhost",
      ]);

      expect(exitCode).toBe(0);
      t.assert.snapshot(normalizeStderr(stderr));
    });

    it("should accept the promise function of webpack.config.js", async (t) => {
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
      t.assert.snapshot(normalizeStderr(stderr, { ipv6: true }));
    });

    it("should work using multi compiler mode", async (t) => {
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
      t.assert.snapshot(normalizeStderr(stderr, { ipv6: true }));
    });

    const examplePath = path.resolve(
      __dirname,
      "../../examples/client/web-socket-url",
    );
    const fixturePath = path.resolve(__dirname, "../fixtures/cli");

    // These four drive the CLI's own shutdown paths, so they spawn it directly
    // rather than through `testBin`. `reject: false` keeps a subprocess we
    // signal from rejecting, which also means one that never started settles
    // exactly like a healthy one — so each of them asserts that its trigger
    // fired and that the subprocess ended the way the path under test ends.
    function startCli(args, cwd) {
      const cliPath = path.resolve(
        __dirname,
        "../../bin/webpack-dev-server.js",
      );

      // `cliPath` goes first: after a node option like `--port`, node takes it
      // as one of its own and exits 9 with "bad option" before the CLI loads.
      return execa("node", [cliPath, ...args], { cwd, reject: false });
    }

    // Runs `action` on the first chunk of stdout matching `regexp`, and only
    // once. A `null` regexp fires on the first chunk, whatever it says, which
    // is how the "before the compilation is done" cases get in early.
    function onFirstOutput(subprocess, regexp, action) {
      const trigger = { fired: false };

      subprocess.stdout.on("data", (data) => {
        if (trigger.fired || (regexp && !regexp.test(data.toString()))) {
          return;
        }

        trigger.fired = true;
        action();
      });

      return trigger;
    }

    // The CLI traps SIGINT and shuts down gracefully, so a clean exit is the
    // evidence the trap ran. Windows has no POSIX signals — `kill("SIGINT")`
    // terminates the subprocess outright — so there the trap never runs and
    // the trigger having fired is all there is to assert.
    function expectGracefulExitAfterSignal(result) {
      if (isWindows) {
        return;
      }

      expect(result.exitCode).toBe(0);
    }

    it("should exit the process when SIGINT is detected", async () => {
      const cp = startCli(["--port", port], examplePath);
      const trigger = onFirstOutput(cp, /main\.js/, () => cp.kill("SIGINT"));
      const result = await cp;

      expect(trigger.fired).toBe(true);
      expectGracefulExitAfterSignal(result);
    });

    it("should exit the process when SIGINT is detected, even before the compilation is done", async () => {
      const cp = startCli(["--port", port], fixturePath);
      const trigger = onFirstOutput(cp, null, () => cp.kill("SIGINT"));
      const result = await cp;

      expect(trigger.fired).toBe(true);
      expectGracefulExitAfterSignal(result);
    });

    it("should exit the process when stdin ends if --watch-options-stdin", async () => {
      const cp = startCli(
        ["--port", port, "--watch-options-stdin"],
        examplePath,
      );

      // The subprocess can be gone before the write lands, and an unhandled
      // `error` on the stream would take this process down with it. Its result
      // is the verdict either way.
      cp.stdin.on("error", () => {});

      const trigger = onFirstOutput(cp, /main\.js/, () => {
        cp.stdin.write("hello");
        cp.stdin.end("world");
      });
      const result = await cp;

      expect(trigger.fired).toBe(true);
      expect(result.exitCode).toBe(0);
    });

    it("should exit the process when stdin ends if --watch-options-stdin, even before the compilation is done", async () => {
      const cp = startCli(
        ["--port", port, "--watch-options-stdin"],
        fixturePath,
      );

      cp.stdin.on("error", () => {});

      const trigger = onFirstOutput(cp, null, () => {
        cp.stdin.write("hello");
        cp.stdin.end("world");
      });
      const result = await cp;

      expect(trigger.fired).toBe(true);
      expect(result.exitCode).toBe(0);
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

    it.skip("should use different random port when multiple instances are started on different processes", async () => {
      const cliPath = path.resolve(
        __dirname,
        "../../bin/webpack-dev-server.js",
      );
      const cwd = path.resolve(__dirname, "../fixtures/cli");

      const cp = execa("node", [cliPath, "--colors=false"], {
        cwd,
        reject: false,
      });
      const cp2 = execa("node", [cliPath, "--colors=false"], {
        cwd,
        reject: false,
      });

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

      cp.then(() => {
        runtime.cp.done = true;
        if (runtime.cp2.done) {
          expect(runtime.cp.port).not.toBe(runtime.cp2.port);
        }
      });

      cp2.then(() => {
        runtime.cp2.done = true;

        if (runtime.cp.done) {
          expect(runtime.cp.port).not.toBe(runtime.cp2.port);
        }
      });
    });
  });
});
