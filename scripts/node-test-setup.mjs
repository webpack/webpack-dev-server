import path from "node:path";
import { afterEach, beforeEach, snapshot } from "node:test";
import { format } from "pretty-format";
import webpack from "webpack";
import Server from "../lib/Server.js";

process.env.CHOKIDAR_USEPOLLING = "true";
process.env.WATCHPACK_POLLING = "true";

// A test that throws between `start()` and `stop()` never reaches its own
// cleanup, so its server keeps the port and every later test in the file dies
// with `EADDRINUSE` — one real failure reported as dozens, differently each
// run. Track what is listening and stop whatever a test leaves behind.
const listening = new Set();
const shuttingDown = new Set();
const { start: realStart, stop: realStop } = Server.prototype;

Server.prototype.start = async function start(...args) {
  listening.add(this);
  return realStart.apply(this, args);
};

// A server stays tracked until its shutdown has actually resolved: one that
// rejected, or that a test never awaited, can still be holding the port.
Server.prototype.stop = async function stop(...args) {
  const shutdown = realStop.apply(this, args);

  shuttingDown.add(shutdown);

  try {
    const stopped = await shutdown;

    listening.delete(this);

    return stopped;
  } finally {
    shuttingDown.delete(shutdown);
  }
};

// Servers a `before` hook starts are shared by the whole suite and are already
// here when the first test begins, so taking the set now exempts them.
let inheritedServers = new Set();

beforeEach(() => {
  inheritedServers = new Set(listening);
});

afterEach(async () => {
  // A shutdown the test started but did not await decides whether its server
  // counts as leaked, so settle those first.
  if (shuttingDown.size > 0) {
    await Promise.allSettled(shuttingDown);
  }

  const leaked = [...listening].filter(
    (server) => !inheritedServers.has(server),
  );

  if (leaked.length === 0) {
    return;
  }

  for (const server of leaked) {
    listening.delete(server);
  }

  await Promise.allSettled(
    leaked.map(async (server) => {
      try {
        await realStop.call(server);
      } catch {
        // `stop()` can reject before it closes the listener, and the port it is
        // still holding is what the next test pays for, so close it directly.
        server.server?.close();
      }
    }),
  );
});

// Normalize "\r\n" and "\r" to "\n" so snapshots are platform-agnostic,
// and "[object Event]"-style console text (Puppeteer >= 25) to "JSHandle@object".
snapshot.setDefaultSnapshotSerializers([
  (value) =>
    format(value, {
      escapeRegex: true,
      escapeString: false,
      indent: 2,
      printBasicPrototype: false,
      printFunctionName: false,
    })
      .replaceAll(/\r\n|\r/g, "\n")
      .replaceAll(/\[object [A-Z]\w*\]/g, "JSHandle@object"),
]);

const [webpackVersion] = webpack.version;
const snapshotExtension = `.snap.webpack${webpackVersion}`;

snapshot.setResolveSnapshotPath((testPath) =>
  path.join(
    path.dirname(testPath),
    "__snapshots__",
    `${path.basename(testPath)}${snapshotExtension}`,
  ),
);
