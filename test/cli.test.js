'use strict';

const assert = require('assert');
const path = require('path');
const execa = require('execa');

describe('SIGINT', () => {
  it('should exit the process when SIGINT is detected', (done) => {
    const cliPath = path.resolve(__dirname, '../bin/webpack-dev-server.js');
    const examplePath = path.resolve(__dirname, '../examples/cli/public');
    const nodePath = execa.shellSync('which node').stdout;

    const proc = execa(nodePath, [cliPath], { cwd: examplePath });

    proc.stdout.on('data', (data) => {
      const bits = data.toString();

      if (/webpack: Compiled successfully/.test(bits)) {
        assert(proc.pid !== 0);
        proc.kill('SIGINT');
      }
    });

    proc.on('exit', () => {
      done();
    });
  }).timeout(4000);
});
