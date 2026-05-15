#!/usr/bin/env node
/* Based on webpack/bin/webpack.js */
/* eslint-disable no-console */

import cp from "node:child_process";
import { createRequire } from "node:module";
import path from "node:path";
import readLine from "node:readline";
import { fileURLToPath, pathToFileURL } from "node:url";
import fs from "graceful-fs";

const require = createRequire(import.meta.url);

/**
 * @param {string} command process to run
 * @param {string[]} args command line arguments
 * @returns {Promise<void>} promise
 */
const runCommand = (command, args) =>
  new Promise((resolve, reject) => {
    const executedCommand = cp.spawn(command, args, {
      stdio: "inherit",
      shell: true,
    });

    executedCommand.on("error", (error) => {
      reject(error);
    });

    executedCommand.on("exit", (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject();
      }
    });
  });

/**
 * @param {string} packageName name of the package
 * @returns {boolean} is the package installed?
 */
const isInstalled = (packageName) => {
  if (process.versions.pnp) {
    return true;
  }

  try {
    require.resolve(packageName);
    return true;
  } catch {
    return false;
  }
};

/**
 * @param {CliOption} cli options
 * @returns {Promise<void>}
 */
const runCli = async (cli) => {
  if (cli.preprocess) {
    cli.preprocess();
  }

  const pkgUrl = import.meta.resolve(`${cli.package}/package.json`);
  const pkgPath = fileURLToPath(pkgUrl);
  const pkg = (await import(pkgUrl, { with: { type: "json" } })).default;

  const binPath = path.resolve(path.dirname(pkgPath), pkg.bin[cli.binName]);

  await import(pathToFileURL(binPath).href);
};

/**
 * @typedef {object} CliOption
 * @property {string} name display name
 * @property {string} package npm package name
 * @property {string} binName name of the executable file
 * @property {boolean} installed currently installed?
 * @property {string} url homepage
 * @property {() => void} preprocess preprocessor
 */

/** @type {CliOption} */
const cli = {
  name: "webpack-cli",
  package: "webpack-cli",
  binName: "webpack-cli",
  installed: isInstalled("webpack-cli"),
  url: "https://github.com/webpack/webpack-cli",
  preprocess() {
    process.argv.splice(2, 0, "serve");
  },
};

if (!cli.installed) {
  const notify = `CLI for webpack must be installed.\n  ${cli.name} (${cli.url})\n`;

  console.error(notify);

  /**
   * @type {string}
   */
  let packageManager;

  if (fs.existsSync(path.resolve(process.cwd(), "yarn.lock"))) {
    packageManager = "yarn";
  } else if (fs.existsSync(path.resolve(process.cwd(), "pnpm-lock.yaml"))) {
    packageManager = "pnpm";
  } else {
    packageManager = "npm";
  }

  const installOptions = [packageManager === "yarn" ? "add" : "install", "-D"];

  console.error(
    `We will use "${packageManager}" to install the CLI via "${packageManager} ${installOptions.join(
      " ",
    )} ${cli.package}".`,
  );

  const question = "Do you want to install 'webpack-cli' (yes/no): ";

  const questionInterface = readLine.createInterface({
    input: process.stdin,
    output: process.stderr,
  });

  // In certain scenarios (e.g. when STDIN is not in terminal mode), the callback function will not be
  // executed. Setting the exit code here to ensure the script exits correctly in those cases. The callback
  // function is responsible for clearing the exit code if the user wishes to install webpack-cli.
  process.exitCode = 1;
  questionInterface.question(question, (answer) => {
    questionInterface.close();

    const normalizedAnswer = answer.toLowerCase().startsWith("y");

    if (!normalizedAnswer) {
      console.error(
        "You need to install 'webpack-cli' to use webpack via CLI.\n" +
          "You can also install the CLI manually.",
      );

      return;
    }
    process.exitCode = 0;

    console.log(
      `Installing '${
        cli.package
      }' (running '${packageManager} ${installOptions.join(" ")} ${
        cli.package
      }')...`,
    );

    runCommand(packageManager, [...installOptions, cli.package])
      .then(() => runCli(cli))
      .catch((error) => {
        console.error(error);
        process.exitCode = 1;
      });
  });
} else {
  try {
    await runCli(cli);
  } catch (error) {
    console.error(error);
    process.exitCode = 1;
  }
}
