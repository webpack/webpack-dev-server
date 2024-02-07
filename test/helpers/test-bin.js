"use strict";

const os = require("os");
const path = require("path");
const { exec } = require("child_process");
const execa = require("execa");
const stripAnsi = require("strip-ansi-v6");
const { Writable } = require("readable-stream");

const webpackDevServerPath = path.resolve(
  __dirname,
  "../../bin/webpack-dev-server.js",
);
const basicConfigPath = path.resolve(
  __dirname,
  "../fixtures/cli/webpack.config.js",
);

const isWindows = process.platform === "win32";

const processKill = (process) => {
  if (isWindows) {
    exec(`taskkill /pid ${process.pid} /T /F`);
  } else {
    process.kill();
  }
};

const testBin = (testArgs = [], options = {}) => {
  const cwd = process.cwd();
  const env = {
    WEBPACK_CLI_HELP_WIDTH: 2048,
    NODE_ENV: process.env.NODE_ENV,
  };

  if (typeof testArgs === "string") {
    testArgs = testArgs.split(" ");
  }

  let args;

  if (testArgs.includes("--help")) {
    args = [webpackDevServerPath, ...testArgs];
  } else {
    const configOptions = testArgs.includes("--config")
      ? []
      : ["--config", basicConfigPath];

    args = [webpackDevServerPath, ...configOptions, ...testArgs];
  }

  return new Promise((resolve, reject) => {
    const outputKillStr =
      options.outputKillStr ||
      /Content not from webpack is served|For using 'serve' command you need to install/;
    const subprocess = execa("node", args, {
      cwd,
      env,
      stdio: "pipe",
      maxBuffer: Infinity,
      reject: false,
      ...options,
    });

    subprocess.stdout.pipe(
      new Writable({
        write(chunk, encoding, callback) {
          const str = chunk.toString();
          const output = options.raw ? str : stripAnsi(str);

          if (outputKillStr.test(output)) {
            processKill(subprocess);
          }

          callback();
        },
      }),
    );

    subprocess.stderr.pipe(
      new Writable({
        write(chunk, encoding, callback) {
          const str = chunk.toString();
          const output = options.raw ? str : stripAnsi(str);

          if (outputKillStr.test(output)) {
            processKill(subprocess);
          }

          callback();
        },
      }),
    );

    subprocess
      .then((result) => {
        resolve(result);
      })
      .catch((error) => {
        reject(error);
      });
  });
};

const ipV4 =
  "(?:25[0-5]|2[0-4]\\d|1\\d\\d|[1-9]\\d|\\d)(?:\\.(?:25[0-5]|2[0-4]\\d|1\\d\\d|[1-9]\\d|\\d)){3}";
const ipV6Seg = "[a-fA-F\\d]{1,4}";
const ipV6 = `
(?:
(?:${ipV6Seg}:){7}(?:${ipV6Seg}|:)|                                        // 1:2:3:4:5:6:7::  1:2:3:4:5:6:7:8
(?:${ipV6Seg}:){6}(?:${ipV4}|:${ipV6Seg}|:)|                               // 1:2:3:4:5:6::    1:2:3:4:5:6::8   1:2:3:4:5:6::8  1:2:3:4:5:6::1.2.3.4
(?:${ipV6Seg}:){5}(?::${ipV4}|(?::${ipV6Seg}){1,2}|:)|                     // 1:2:3:4:5::      1:2:3:4:5::7:8   1:2:3:4:5::8    1:2:3:4:5::7:1.2.3.4
(?:${ipV6Seg}:){4}(?:(?::${ipV6Seg}){0,1}:${ipV4}|(?::${ipV6Seg}){1,3}|:)| // 1:2:3:4::        1:2:3:4::6:7:8   1:2:3:4::8      1:2:3:4::6:7:1.2.3.4
(?:${ipV6Seg}:){3}(?:(?::${ipV6Seg}){0,2}:${ipV4}|(?::${ipV6Seg}){1,4}|:)| // 1:2:3::          1:2:3::5:6:7:8   1:2:3::8        1:2:3::5:6:7:1.2.3.4
(?:${ipV6Seg}:){2}(?:(?::${ipV6Seg}){0,3}:${ipV4}|(?::${ipV6Seg}){1,5}|:)| // 1:2::            1:2::4:5:6:7:8   1:2::8          1:2::4:5:6:7:1.2.3.4
(?:${ipV6Seg}:){1}(?:(?::${ipV6Seg}){0,4}:${ipV4}|(?::${ipV6Seg}){1,6}|:)| // 1::              1::3:4:5:6:7:8   1::8            1::3:4:5:6:7:1.2.3.4
(?::(?:(?::${ipV6Seg}){0,5}:${ipV4}|(?::${ipV6Seg}){1,7}|:))               // ::2:3:4:5:6:7:8  ::2:3:4:5:6:7:8  ::8             ::1.2.3.4
)(?:%[0-9a-zA-Z]{1,})?                                                     // %eth0            %1
`
  .replace(/\s*\/\/.*$/gm, "")
  .replace(/\n/g, "")
  .trim();

const normalizeStderr = (stderr, options = {}) => {
  let normalizedStderr = stripAnsi(stderr);

  normalizedStderr = normalizedStderr
    .replace(/\\/g, "/")
    .replace(new RegExp(process.cwd().replace(/\\/g, "/"), "g"), "<cwd>")
    .replace(new RegExp(os.tmpdir().replace(/\\/g, "/"), "g"), "<tmp>")
    .replace(new RegExp("\\\\.\\pipe".replace(/\\/g, "/"), "g"), "<tmp>")
    .replace(new RegExp(ipV4, "g"), "<ip-v4>")
    .replace(new RegExp(ipV6, "g"), "<ip-v6>");

  // normalize node warnings
  normalizedStderr = normalizedStderr.replace(
    /.*DeprecationWarning.*(\n)*/gm,
    "",
  );
  normalizedStderr = normalizedStderr.replace(
    /.*Use `node --trace-deprecation ...` to show where the warning was created.*(\n)*/gm,
    "",
  );

  normalizedStderr = normalizedStderr.split("\n");
  normalizedStderr = normalizedStderr.filter(
    (item) => !/.+wait until bundle finished.*(\n)?/g.test(item),
  );
  normalizedStderr = normalizedStderr.join("\n");
  normalizedStderr = normalizedStderr.replace(/:[0-9]+\//g, ":<port>/");

  if (options.https) {
    // We have deprecation warning on windows in some cases
    normalizedStderr = normalizedStderr.split("\n");
    normalizedStderr = normalizedStderr.filter(
      (item) => !/Generating SSL Certificate/g.test(item),
    );
    normalizedStderr = normalizedStderr.filter(
      (item) =>
        !/DeprecationWarning: The legacy HTTP parser is deprecated/g.test(item),
    );
    normalizedStderr = normalizedStderr.join("\n");
  }

  if (normalizedStderr.includes("Loopback:")) {
    normalizedStderr = normalizedStderr.split("\n");

    const loopbackIndex = normalizedStderr.findIndex((item) =>
      /Loopback:/.test(item),
    );

    const protocol = options.https ? "https" : "http";

    normalizedStderr[loopbackIndex] =
      `<i> Loopback: ${protocol}://localhost:<port>/, ${protocol}://<ip-v4>:<port>/, ${protocol}://[<ip-v6>]:<port>/`;
    normalizedStderr = normalizedStderr.join("\n");
  }

  if (options.ipv6 && !normalizedStderr.includes("On Your Network (IPv6):")) {
    // Github Actions doesn't support IPv6 on ubuntu in some cases
    normalizedStderr = normalizedStderr.split("\n");

    const ipv4MessageIndex = normalizedStderr.findIndex((item) =>
      /On Your Network \(IPv4\)/.test(item),
    );

    const protocol = options.https ? "https" : "http";

    normalizedStderr.splice(
      ipv4MessageIndex + 1,
      0,
      `<i> [webpack-dev-server] On Your Network (IPv6): ${protocol}://[<ip-v6>]:<port>/`,
    );

    normalizedStderr = normalizedStderr.join("\n");
  }

  if (/Gracefully shutting down/.test(normalizedStderr)) {
    normalizedStderr = normalizedStderr.split("\n").slice(0, -1).join("\n");
  }

  return normalizedStderr;
};

module.exports = { normalizeStderr, testBin };
