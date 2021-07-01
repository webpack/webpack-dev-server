'use strict';

const os = require('os');
const path = require('path');
const execa = require('execa');
const stripAnsi = require('strip-ansi');
const internalIp = require('internal-ip');

const webpackDevServerPath = path.resolve(
  __dirname,
  '../../bin/webpack-dev-server.js'
);
const basicConfigPath = path.resolve(
  __dirname,
  '../fixtures/cli/webpack.config.js'
);

const testBin = (testArgs = []) => {
  const cwd = process.cwd();
  const env = {
    WEBPACK_CLI_HELP_WIDTH: 2048,
    NODE_ENV: process.env.NODE_ENV,
  };

  if (typeof testArgs === 'string') {
    testArgs = testArgs.split(' ');
  }

  let args;

  if (testArgs.includes('--help')) {
    args = [webpackDevServerPath, ...testArgs];
  } else {
    const configOptions = testArgs.includes('--config')
      ? []
      : ['--config', basicConfigPath];

    args = [webpackDevServerPath, ...configOptions, ...testArgs];
  }

  return execa('node', args, { cwd, env, timeout: 10000 });
};

const normalizeStderr = (stderr, options = {}) => {
  let normalizedStderr = stripAnsi(stderr);

  normalizedStderr = normalizedStderr
    .replace(/\\/g, '/')
    .replace(new RegExp(process.cwd().replace(/\\/g, '/'), 'g'), '<cwd>')
    .replace(new RegExp(os.tmpdir().replace(/\\/g, '/'), 'g'), '<tmp>')
    .replace(new RegExp('\\\\.\\pipe'.replace(/\\/g, '/'), 'g'), '<tmp>');

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

  normalizedStderr = normalizedStderr.split('\n');
  normalizedStderr = normalizedStderr.filter(
    (item) => !/.+wait until bundle finished.*(\n)?/g.test(item)
  );

  normalizedStderr = normalizedStderr.join('\n');

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
};

module.exports = { normalizeStderr, testBin };
