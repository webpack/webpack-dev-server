"use strict";

import path from "node:path";
import { snapshot } from "node:test";
import { format } from "pretty-format";
import webpack from "webpack";

process.env.CHOKIDAR_USEPOLLING = "true";

snapshot.setDefaultSnapshotSerializers([
  (value) =>
    format(value, {
      escapeString: false,
      printBasicPrototype: false,
    }),
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
