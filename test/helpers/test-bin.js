'use strict';

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

function testBin(testArgs, configPath) {
  const cwd = process.cwd();
  const env = process.env.NODE_ENV;

  if (!configPath) {
    configPath = basicConfigPath;
  }

  if (!testArgs) {
    testArgs = [];
  } else if (typeof testArgs === 'string') {
    testArgs = testArgs.split(' ');
  }

  const args = [webpackDevServerPath, '--config', configPath].concat(testArgs);

  return execa('node', args, { cwd, env, timeout: 10000 });
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

  if (networkIPv6) {
    normalizedStderr = normalizedStderr.replace(
      new RegExp(networkIPv6, 'g'),
      '<network-ip-v6>'
    );
  }

  normalizedStderr = normalizedStderr.replace(/:[0-9]+\//g, ':<port>/');

  if (options.ipv6 && !networkIPv6) {
    // Github Actions doesnt' support IPv6 on ubuntu in some cases
    normalizedStderr = normalizedStderr.split('\n');

    const ipv4MessageIndex = normalizedStderr.findIndex((item) =>
      /On Your Network \(IPv4\)/.test(item)
    );

    normalizedStderr.splice(
      ipv4MessageIndex + 1,
      0,
      '<i> [webpack-dev-server] On Your Network (IPv6): http://[<network-ip-v6>]:<port>/'
    );

    normalizedStderr = normalizedStderr.join('\n');
  }

  return normalizedStderr;
}

module.exports = { normalizeStderr, testBin };
