import { spawn } from "node:child_process";
import { once } from "node:events";
import fs from "node:fs/promises";
import http from "node:http";
import net from "node:net";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import webpack from "webpack";
import WebSocket from "ws";
import Server from "../../lib/Server.js";

/**
 * @param {number} milliseconds delay
 * @returns {Promise<void>} delay
 */
const delay = (milliseconds) =>
  new Promise((resolve) => {
    setTimeout(resolve, milliseconds);
  });

/**
 * @param {Promise<unknown>} operation operation
 * @param {number} milliseconds timeout
 * @param {string} stage stage
 * @returns {Promise<unknown>} result
 */
async function bounded(operation, milliseconds, stage) {
  let timer;
  try {
    return await Promise.race([
      operation,
      new Promise((_, reject) => {
        timer = setTimeout(
          () => reject(new Error(`${stage} timed out`)),
          milliseconds,
        );
      }),
    ]);
  } finally {
    clearTimeout(timer);
  }
}

/** @returns {Promise<import("node:net").Server>} reserved loopback port */
async function reservePort() {
  const server = net.createServer();
  server.listen(0, "127.0.0.1");
  try {
    await bounded(once(server, "listening"), 1500, "port reservation");
  } catch (error) {
    server.close();
    throw error;
  }
  return server;
}

/**
 * @param {number} port owned port
 * @param {number=} milliseconds absolute deadline
 * @returns {Promise<{ status: number | undefined, body: string }>} response
 */
export function request(port, milliseconds = 1000) {
  return new Promise((resolve, reject) => {
    let settled = false;
    let response;
    let timer;
    let req;
    const finish = (error, value) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      if (error) {
        // Keep guarded error listeners until destruction finishes: destroying
        // either stream can schedule another error event.
        response?.destroy();
        req.destroy();
        reject(error);
      } else {
        resolve(value);
      }
    };
    const fail = (error) => finish(error);
    req = http.get(
      { host: "127.0.0.1", port, path: "/main.js", agent: false },
      (res) => {
        response = res;
        let body = "";
        res.on("data", (chunk) => {
          body += chunk;
        });
        res.once("error", fail);
        res.once("aborted", () => fail(new Error("HTTP response aborted")));
        res.once("end", () => {
          if (!res.complete) fail(new Error("HTTP response incomplete"));
          else finish(null, { status: res.statusCode, body });
        });
        res.once("close", () => {
          if (!res.readableEnded) {
            fail(new Error("HTTP response closed before completion"));
          }
        });
      },
    );
    req.on("error", fail);
    timer = setTimeout(
      () => fail(new Error(`HTTP request timed out after ${milliseconds}ms`)),
      milliseconds,
    );
  });
}

/**
 * Attempt independent cleanup stages without replacing the observation error.
 * @param {Record<string, unknown>} result observations
 * @param {[string, () => unknown][]} stages ordered cleanup stages
 * @returns {Promise<void>} completion
 */
export async function cleanup(result, stages) {
  result.cleanupErrors = [];
  for (const [stage, action] of stages) {
    try {
      await bounded(Promise.resolve().then(action), 3000, stage);
    } catch (error) {
      result.cleanupErrors.push({ stage, error: String(error) });
    }
  }
}

/**
 * @param {number} port owned port
 * @returns {Promise<boolean>} refusal
 */
async function refusesConnection(port) {
  const socket = net.connect({ host: "127.0.0.1", port });
  try {
    return await bounded(
      new Promise((resolve) => {
        socket.once("connect", () => resolve(false));
        socket.once("error", (error) => {
          resolve(error.code === "ECONNREFUSED");
        });
      }),
      1500,
      "connection probe",
    );
  } finally {
    socket.destroy();
  }
}

/**
 * Run without node-test-setup or forced exit: only the supervisor may recover
 * a leaking child, and that intervention is returned as a test failure.
 * @returns {Promise<Record<string, unknown>>} observations
 */
export default async function pluginTransportShutdown() {
  const directory = await fs.mkdtemp(
    path.join(os.tmpdir(), "wds-plugin-close-"),
  );
  const reservations = [];
  let child;
  let client;
  let exit;
  let forced = false;
  let stderr = "";
  let watchdog;
  let ports;
  const result = {};
  try {
    await fs.writeFile(
      path.join(directory, "entry.js"),
      'globalThis.SHUTDOWN_MARKER = "ready";\n',
    );
    reservations.push(await reservePort());
    reservations.push(await reservePort());
    ports = reservations.map((server) => server.address().port);
    await Promise.all(
      reservations.map(
        (server) =>
          new Promise((resolve) => {
            server.close(resolve);
          }),
      ),
    );
    child = spawn(
      process.execPath,
      [
        fileURLToPath(import.meta.url),
        "--child",
        directory,
        ...ports.map(String),
      ],
      {
        stdio: ["ignore", "ignore", "pipe", "ipc"],
      },
    );
    const exited = new Promise((resolve) => {
      child.once("exit", (code, signal) => {
        exit = { code, signal };
        resolve(exit);
      });
    });
    child.stderr.on("data", (chunk) => {
      stderr = (stderr + chunk).slice(-8000);
    });
    watchdog = setTimeout(() => {
      if (!exit) {
        forced = true;
        child.kill("SIGKILL");
      }
    }, 60000);
    const messages = new Map();
    child.on("message", (message) => {
      messages.set(message.stage, message);
    });
    child.on("error", (error) => {
      result.spawnError = String(error);
    });
    const waitMessage = async (stage, timeout) => {
      const deadline = Date.now() + timeout;
      while (!messages.has(stage)) {
        if (exit) throw new Error(`child exited before ${stage}`);
        if (Date.now() >= deadline) throw new Error(`${stage} timed out`);
        await delay(20);
      }
      return messages.get(stage);
    };
    result.ready = await waitMessage("ready", 30000);
    result.httpBefore = await request(ports[0]);
    client = new WebSocket(`ws://127.0.0.1:${ports[1]}/ws`, {
      origin: `http://127.0.0.1:${ports[0]}`,
      handshakeTimeout: 1500,
    });
    client.on("error", (error) => {
      result.clientError = String(error);
    });
    let pings = 0;
    client.on("ping", () => {
      pings += 1;
    });
    const clientClosed = new Promise((resolve) => {
      client.once("close", resolve);
    });
    await bounded(once(client, "open"), 3000, "WebSocket open");
    result.clientOpened = true;
    await bounded(once(client, "ping"), 3000, "initial heartbeat");
    child.send({ command: "close" });
    result.closed = await waitMessage("closed", 15000);
    const pingsAtClose = pings;
    // Wait for actual closure, not just a cleared server property. Broken
    // implementations finish this bounded observation with the client open.
    await bounded(clientClosed, 3000, "client closure").catch(() => {});
    result.clientClosed = client.readyState === WebSocket.CLOSED;
    result.postClosePings = pings - pingsAtClose;
    result.httpRefused = await refusesConnection(ports[0]);
    result.webSocketRefused = await refusesConnection(ports[1]);
    await bounded(exited, 1000, "natural exit").catch(() => {});
    result.naturalExit = exit;
  } catch (error) {
    result.error = String(error);
  } finally {
    const released = [];
    await cleanup(result, [
      ["watchdog", () => clearTimeout(watchdog)],
      ["client", () => client?.terminate()],
      [
        "child exit",
        async () => {
          if (child?.pid && !exit) {
            forced = true;
            child.kill("SIGTERM");
            await delay(500);
            if (!exit) child.kill("SIGKILL");
            if (!exit) {
              await bounded(once(child, "exit"), 2000, "emergency exit");
            }
          }
        },
      ],
      ...reservations.map((reservation, index) => [
        `reservation ${index}`,
        () =>
          new Promise((resolve, reject) => {
            if (!reservation.listening) {
              resolve();
            } else {
              reservation.close((error) => {
                if (error) reject(error);
                else resolve();
              });
            }
          }),
      ]),
      ...(ports || []).map((port) => [
        `port ${port}`,
        async () => {
          const refused = await refusesConnection(port);
          released.push(refused);
          if (!refused) {
            throw new Error(`Owned port ${port} is still accepting`);
          }
        },
      ]),
      // Only this mkdtemp directory belongs to this invocation.
      [
        "temporary directory",
        () => fs.rm(directory, { recursive: true, force: true }),
      ],
    ]);
    result.forced = forced;
    result.exit = exit;
    result.stderr = stderr;
    result.ports = ports;
    result.cleanupVerified =
      Boolean(exit) &&
      released.length === ports?.length &&
      released.every(Boolean) &&
      result.cleanupErrors.length === 0;
  }
  return result;
}

if (process.argv[2] === "--child") {
  const [, , , directory] = process.argv;
  const httpPort = Number(process.argv[4]);
  const socketPort = Number(process.argv[5]);
  let closeCalls = 0;
  let middlewareCloseCalls = 0;
  let hotCloseCalls = 0;
  let watchCloseCalls = 0;
  let hasErrors = true;
  const server = new Server({
    host: "127.0.0.1",
    port: httpPort,
    static: false,
    open: false,
    bonjour: false,
    setupExitSignals: false,
    client: false,
    webSocketServer: {
      type: "ws",
      options: { host: "127.0.0.1", port: socketPort },
    },
    onListening() {
      const { middleware } = server;
      const middlewareClose = middleware.close.bind(middleware);
      middleware.close = (...args) => {
        middlewareCloseCalls += 1;
        return middlewareClose(...args);
      };
      const { hot } = middleware.context;
      const hotClose = hot.close.bind(hot);
      hot.close = () => {
        hotCloseCalls += 1;
        return hotClose();
      };
      process.send({
        stage: "ready",
        hasErrors,
      });
    },
  });
  const compiler = webpack({
    mode: "development",
    context: directory,
    entry: "./entry.js",
    output: { path: path.join(directory, "output"), filename: "main.js" },
    cache: false,
    devtool: false,
    stats: "none",
    infrastructureLogging: { level: "error" },
    plugins: [server],
  });
  compiler.hooks.done.tap("plugin-transport-shutdown", (stats) => {
    hasErrors = stats.hasErrors();
  });
  const watching = compiler.watch({}, (error) => {
    if (error) process.send({ stage: "watch-error", error: String(error) });
  });
  const watchClose = watching.close.bind(watching);
  watching.close = (...args) => {
    watchCloseCalls += 1;
    return watchClose(...args);
  };
  process.on("message", (message) => {
    if (message.command !== "close" || closeCalls > 0) return;
    closeCalls += 1;
    compiler.close((error) => {
      process.send(
        {
          stage: "closed",
          error: error ? String(error) : null,
          closeCalls,
          middlewareCloseCalls,
          hotCloseCalls,
          watchCloseCalls,
        },
        () => process.disconnect(),
      );
    });
  });
}
