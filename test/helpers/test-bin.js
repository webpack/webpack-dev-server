'use strict';

const path = require('path');
const internalIp = require('internal-ip');
const execa = require('execa');
// TODO Migrate on `import().then()` after update jest and migrate on ECMA modules in future
const stripAnsi = require('../../client/modules/strip-ansi/index');

const webpackDevServerPath = path.resolve(
  __dirname,
  '../../bin/webpack-dev-server.js'
);
const basicConfigPath = path.resolve(
  __dirname,
  '../fixtures/cli/webpack.config.js'
);

function testBin(testArgs, configPath) {
  const cwd = process.cwd();
  const env = {
    WEBPACK_CLI_HELP_WIDTH: 2048,
    NODE_ENV: process.env.NODE_ENV,
  };

  if (!configPath) {
    configPath = basicConfigPath;
  }

  if (!testArgs) {
    testArgs = [];
  } else if (typeof testArgs === 'string') {
    testArgs = testArgs.split(' ');
  }

  let args;
  if (testArgs.includes('--help')) {
    args = [webpackDevServerPath].concat(testArgs);
  } else {
    args = [webpackDevServerPath, '--config', configPath].concat(testArgs);
  }

  return execa('node', args, { cwd, env, timeout: 10000 });
}

function normalizeStdout(stdout) {
  const normalizedStderr = stripAnsi(stdout);

  return normalizedStderr;
}

function normalizeStderr(stderr, options = {}) {
  let normalizedStderr = stripAnsi(stderr);

  normalizedStderr = normalizedStderr
    .replace(/\\/g, '/')
    .replace(new RegExp(process.cwd().replace(/\\/g, '/'), 'g'), '<cwd>');

  const networkIPv4 = internalIp.v4.sync();

  if (networkIPv4) {
    normalizedStderr = normalizedStderr.replace(
      new RegExp(networkIPv4, 'g'),
      '<network-ip-v4>'
    );
  }

  const networkIPv6 = internalIp.v6.sync();

  // normalize node warnings
  normalizedStderr = normalizedStderr.replace(
    /.*DeprecationWarning.*(\n)*/gm,
    ''
  );
  normalizedStderr = normalizedStderr.replace(
    /.*Use `node --trace-deprecation ...` to show where the warning was created.*(\n)*/gm,
    ''
  );

  if (networkIPv6) {
    normalizedStderr = normalizedStderr.replace(
      new RegExp(networkIPv6, 'g'),
      '<network-ip-v6>'
    );
  }

  normalizedStderr = normalizedStderr.replace(/:[0-9]+\//g, ':<port>/');

  if (options.https) {
    // We have deprecation warning on windows in some cases
    normalizedStderr = normalizedStderr.split('\n');

    normalizedStderr = normalizedStderr.filter(
      (item) =>
        !/DeprecationWarning: The legacy HTTP parser is deprecated/g.test(item)
    );

    normalizedStderr = normalizedStderr.join('\n');
  }

  if (options.ipv6 && !networkIPv6) {
    // Github Actions doesnt' support IPv6 on ubuntu in some cases
    normalizedStderr = normalizedStderr.split('\n');

    const ipv4MessageIndex = normalizedStderr.findIndex((item) =>
      /On Your Network \(IPv4\)/.test(item)
    );

    const protocol = options.https ? 'https' : 'http';

    normalizedStderr.splice(
      ipv4MessageIndex + 1,
      0,
      `<i> [webpack-dev-server] On Your Network (IPv6): ${protocol}://[<network-ip-v6>]:<port>/`
    );

    normalizedStderr = normalizedStderr.join('\n');
  }

  return normalizedStderr;
}

module.exports = { testBin, normalizeStderr, normalizeStdout };
