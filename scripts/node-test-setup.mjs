import path from "node:path";
import { snapshot } from "node:test";
import { format } from "pretty-format";
import webpack from "webpack";

process.env.CHOKIDAR_USEPOLLING = "true";
process.env.WATCHPACK_POLLING = "true";

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
