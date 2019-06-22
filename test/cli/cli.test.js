/**
 * @jest-environment node
 */

'use strict';

const { join, resolve } = require('path');
const execa = require('execa');
const { unlinkAsync } = require('../helpers/fs');
const testBin = require('../helpers/test-bin');
const timer = require('../helpers/timer');
const { skipTestOnWindows } = require('../helpers/conditional-test');

const httpsCertificateDirectory = resolve(
  __dirname,
  '../fixtures/https-certificate'
);
const caPath = resolve(httpsCertificateDirectory, 'ca.pem');
const pfxPath = resolve(httpsCertificateDirectory, 'server.pfx');
const keyPath = resolve(httpsCertificateDirectory, 'server.key');
const certPath = resolve(httpsCertificateDirectory, 'server.crt');

describe('CLI', () => {
  it('--progress', async () => {
    const { exitCode, stderr } = await testBin('--progress');
    expect(exitCode).toEqual(0);
    expect(stderr.includes('0% compiling')).toBe(true);
  });

  it('--progress --profile', async () => {
    const { exitCode, stderr } = await testBin('--progress --profile');
    expect(exitCode).toEqual(0);
    // should profile
    expect(stderr.includes('after chunk modules optimization')).toBe(true);
  });

  it('--bonjour', async () => {
    const { exitCode, stdout } = await testBin('--bonjour');
    expect(exitCode).toEqual(0);
    expect(stdout.includes('Bonjour')).toBe(true);
  });

  it('--https', async () => {
    const { exitCode, stdout } = await testBin('--https');
    expect(exitCode).toEqual(0);
    expect(stdout.includes('Project is running at')).toBe(true);
  });

  it('--https --cacert --pfx --key --cert --pfx-passphrase', async () => {
    const { exitCode, stdout } = await testBin(
      `--https --cacert ${caPath} --pfx ${pfxPath} --key ${keyPath} --cert ${certPath} --pfx-passphrase webpack-dev-server`
    );
    expect(exitCode).toEqual(0);
    expect(stdout.includes('Project is running at')).toBe(true);
  });

  it('--sockPath', async () => {
    const { stdout } = await testBin('--sockPath /mysockPath');
    expect(
      // the /mysockPath becomes %2FmysockPath from encodeURIComponent
      /http:\/\/localhost:[0-9]+?sockPath=%2FmysockPath/.test(stdout)
    ).toEqual(true);
  });

  it('unspecified port', async () => {
    const { stdout } = await testBin('');
    expect(/http:\/\/localhost:[0-9]+/.test(stdout)).toEqual(true);
  });

  it('--color', async () => {
    const { stdout } = await testBin('--color');
    // https://github.com/webpack/webpack-dev-server/blob/master/lib/utils/colors.js
    expect(stdout.includes('\u001b[39m \u001b[90m｢wds｣\u001b[39m:')).toBe(true);
  });

  describe('Unix socket', () => {
    if (skipTestOnWindows('Unix sockets are not supported on Windows')) {
      return;
    }

    // The Unix socket to listen to (instead of a host).
    it('--socket', async () => {
      const socketPath = join('.', 'webpack.sock');

      const { exitCode, stdout } = await testBin(`--socket ${socketPath}`);
      expect(exitCode).toEqual(0);

      if (process.platform !== 'win32') {
        expect(stdout.includes(socketPath)).toBe(true);

        await unlinkAsync(socketPath);
      }
    });
  });

  it('without --stdin, with stdin "end" event should time out', async (done) => {
    const configPath = resolve(
      __dirname,
      '../fixtures/simple-config/webpack.config.js'
    );
    const childProcess = testBin(false, configPath, true);

    childProcess.once('exit', () => {
      expect(childProcess.killed).toBeTruthy();
      done();
    });

    await timer(500);
    // this is meant to confirm that it does not have any effect on the running process
    // since options.stdin is not enabled
    childProcess.stdin.emit('end');
    childProcess.stdin.pause();

    await timer(500);

    childProcess.kill();
  });

  it('--stdin, with "end" event should exit without time out', async () => {
    const configPath = resolve(
      __dirname,
      '../fixtures/simple-config/webpack.config.js'
    );
    const childProcess = testBin('--stdin', configPath);

    await timer(500);

    childProcess.stdin.emit('end');
    childProcess.stdin.pause();

    const { exitCode, timedOut, killed } = await childProcess;
    expect(exitCode).toEqual(0);
    expect(timedOut).toBeFalsy();
    expect(killed).toBeFalsy();
  });

  it('should accept the promise function of webpack.config.js', async () => {
    try {
      const { exitCode } = await testBin(
        false,
        resolve(__dirname, '../fixtures/promise-config/webpack.config.js')
      );
      expect(exitCode).toEqual(0);
    } catch (err) {
      expect(err.stdout.includes('Compiled successfully.')).toBe(true);
    }
  });

  // TODO: hiroppy
  it('should exit the process when SIGINT is detected', (done) => {
    const cliPath = resolve(__dirname, '../../bin/webpack-dev-server.js');
    const examplePath = resolve(__dirname, '../../examples/cli/public');
    const cp = execa('node', [cliPath], { cwd: examplePath });

    cp.stdout.on('data', (data) => {
      const bits = data.toString();

      if (/Compiled successfully/.test(bits)) {
        expect(cp.pid !== 0).toBe(true);

        cp.kill('SIGINT');
      }
    });

    cp.on('exit', () => {
      done();
    });
  });

  it('should exit the process when SIGINT is detected, even before the compilation is done', (done) => {
    const cliPath = resolve(__dirname, '../../bin/webpack-dev-server.js');
    const examplePath = resolve(__dirname, '../../examples/cli/public');
    const cp = execa('node', [cliPath], { cwd: examplePath });
    let killed = false;

    cp.stdout.on('data', () => {
      if (!killed) {
        expect(cp.pid !== 0).toBe(true);

        cp.kill('SIGINT');
      }

      killed = true;
    });

    cp.on('exit', () => {
      done();
    });
  });

  it('should use different random port when multiple instances are started on different processes', (done) => {
    const cliPath = resolve(__dirname, '../../bin/webpack-dev-server.js');
    const examplePath = resolve(__dirname, '../../examples/cli/public');

    const cp = execa('node', [cliPath, '--colors=false'], { cwd: examplePath });
    const cp2 = execa('node', [cliPath, '--colors=false'], {
      cwd: examplePath,
    });

    const runtime = {
      cp: {
        port: null,
        done: false,
      },
      cp2: {
        port: null,
        done: false,
      },
    };

    cp.stdout.on('data', (data) => {
      const bits = data.toString();
      const portMatch = /Project is running at http:\/\/localhost:(\d*)\//.exec(
        bits
      );
      if (portMatch) {
        runtime.cp.port = portMatch[1];
      }
      if (/Compiled successfully/.test(bits)) {
        expect(cp.pid !== 0).toBe(true);
        cp.kill('SIGINT');
      }
    });
    cp2.stdout.on('data', (data) => {
      const bits = data.toString();
      const portMatch = /Project is running at http:\/\/localhost:(\d*)\//.exec(
        bits
      );
      if (portMatch) {
        runtime.cp2.port = portMatch[1];
      }
      if (/Compiled successfully/.test(bits)) {
        expect(cp.pid !== 0).toBe(true);
        cp2.kill('SIGINT');
      }
    });

    cp.on('exit', () => {
      runtime.cp.done = true;
      if (runtime.cp2.done) {
        expect(runtime.cp.port !== runtime.cp2.port).toBe(true);
        done();
      }
    });
    cp2.on('exit', () => {
      runtime.cp2.done = true;
      if (runtime.cp.done) {
        expect(runtime.cp.port !== runtime.cp2.port).toBe(true);
        done();
      }
    });
  });
});
