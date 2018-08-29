'use strict';

/* eslint-disable
  array-bracket-spacing,
*/
const assert = require('assert');
const path = require('path');
const execa = require('execa');
const runDevServer = require('./helpers/run-webpack-dev-server');

describe('CLI', () => {
  it('--progress', (done) => {
    runDevServer('--progress')
      .then((output) => {
        assert(output.code === 0);
        assert(output.stderr.indexOf('0% compiling') >= 0);
        done();
      })
      .catch(done);
  }).timeout(18000);

  it('should exit the process when SIGINT is detected', (done) => {
    const cliPath = path.resolve(__dirname, '../bin/webpack-dev-server.js');
    const examplePath = path.resolve(__dirname, '../examples/cli/public');

    const cp = execa('node', [ cliPath ], { cwd: examplePath });

    cp.stdout.on('data', (data) => {
      const bits = data.toString();

      if (/Compiled successfully/.test(bits)) {
        assert(cp.pid !== 0);
        cp.kill('SIGINT');
      }
    });

    cp.on('exit', () => {
      done();
    });
  }).timeout(18000);

  it('should exit the process when SIGINT is detected, even before the compilation is done', (done) => {
    const cliPath = path.resolve(__dirname, '../bin/webpack-dev-server.js');
    const examplePath = path.resolve(__dirname, '../examples/cli/public');

    const cp = execa('node', [ cliPath ], { cwd: examplePath });

    let killed = false;

    cp.stdout.on('data', () => {
      if (!killed) {
        assert(cp.pid !== 0);
        cp.kill('SIGINT');
      }
      killed = true;
    });

    cp.on('exit', () => {
      done();
    });
  }).timeout(18000);
});
