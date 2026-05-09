import path from "node:path";
import { snapshot } from "node:test";
import { format } from "pretty-format";
import webpack from "webpack";

process.env.CHOKIDAR_USEPOLLING = "true";

// Match Jest's snapshot serialization defaults so existing snapshots stay
// byte-for-byte compatible:
//   - jest-snapshot.serialize() hardcodes: escapeRegex: true, printFunctionName: false
//   - jest-config defaults snapshotFormat to: { escapeString: false, printBasicPrototype: false }
snapshot.setDefaultSnapshotSerializers([
  (value) =>
    format(value, {
      escapeRegex: true,
      escapeString: false,
      indent: 2,
      printBasicPrototype: false,
      printFunctionName: false,
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
