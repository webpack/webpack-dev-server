'use strict';

const assert = require('assert');
const path = require('path');
const execa = require('execa'); // eslint-disable-line import/no-extraneous-dependencies

describe('SIGINT', () => {
  it('should exit the process when SIGINT is detected', (done) => {
    const cliPath = path.resolve(__dirname, '../cli.js');
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

    process.on('unhandledRejection', (reason, p) => {
      throw new Error(`Unhandled Rejection at: ${p}, 'reason: ${reason}`);
    });

    proc.on('exit', (code) => {
      if (code !== 0) {
        throw new Error(`Process exited with code: ${code}`);
      }
      done();
    });
  }).timeout(4000);
});
