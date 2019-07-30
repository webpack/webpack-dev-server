'use strict';

const { join, resolve } = require('path');
const execa = require('execa');
const { unlinkAsync } = require('../helpers/fs');
const testBin = require('../helpers/test-bin');

const httpsCertificateDirectory = resolve(
  __dirname,
  '../fixtures/https-certificate'
);
const caPath = resolve(httpsCertificateDirectory, 'ca.pem');
const pfxPath = resolve(httpsCertificateDirectory, 'server.pfx');
const keyPath = resolve(httpsCertificateDirectory, 'server.key');
const certPath = resolve(httpsCertificateDirectory, 'server.crt');

describe('CLI', () => {
  it('--progress', (done) => {
    testBin('--progress')
      .then((output) => {
        expect(output.code).toEqual(0);
        expect(output.stderr.includes('0% compiling')).toBe(true);
        // should not profile
        expect(
          output.stderr.includes('ms after chunk modules optimization')
        ).toBe(false);
        done();
      })
      .catch(done);
  });

  it('--progress --profile', (done) => {
    testBin('--progress --profile')
      .then((output) => {
        expect(output.code).toEqual(0);
        // should profile
        expect(
          output.stderr.includes('ms after chunk modules optimization')
        ).toBe(true);
        done();
      })
      .catch(done);
  });

  it('--bonjour', async () => {
    const { code, stdout } = await testBin('--bonjour');
    expect(code).toEqual(0);
    expect(stdout.includes('Bonjour')).toBe(true);
  });

  it('--https', async () => {
    const { code, stdout } = await testBin('--https');
    expect(code).toEqual(0);
    expect(stdout.includes('Project is running at')).toBe(true);
  });

  it('--https --cacert --pfx --key --cert --pfx-passphrase', async () => {
    const { code, stdout } = await testBin(
      `--https --cacert ${caPath} --pfx ${pfxPath} --key ${keyPath} --cert ${certPath} --pfx-passphrase webpack-dev-server`
    );
    expect(code).toEqual(0);
    expect(stdout.includes('Project is running at')).toBe(true);
  });

  it('--sockPath', (done) => {
    testBin('--sockPath /mysockPath')
      .then((output) => {
        expect(
          /http:\/\/localhost:[0-9]+&sockPath=\/mysockPath/.test(output.stdout)
        ).toEqual(true);
        done();
      })
      .catch(done);
  });

  it('unspecified port', (done) => {
    testBin('')
      .then((output) => {
        expect(/http:\/\/localhost:[0-9]+/.test(output.stdout)).toEqual(true);
        done();
      })
      .catch(done);
  });

  it('--color', (done) => {
    testBin('--color')
      .then((output) => {
        // https://github.com/webpack/webpack-dev-server/blob/master/lib/utils/colors.js
        expect(
          output.stdout.includes('\u001b[39m \u001b[90m｢wds｣\u001b[39m:')
        ).toEqual(true);
        done();
      })
      .catch(done);
  });

  // The Unix socket to listen to (instead of a host).
  it('--socket', async () => {
    const socketPath = join('.', 'webpack.sock');
    const { code, stdout } = await testBin(`--socket ${socketPath}`);
    expect(code).toEqual(0);

    if (process.platform !== 'win32') {
      expect(stdout.includes(socketPath)).toBe(true);

      await unlinkAsync(socketPath);
    }
  });

  it('should accept the promise function of webpack.config.js', async () => {
    try {
      const { code } = await testBin(
        false,
        resolve(__dirname, '../fixtures/promise-config/webpack.config.js')
      );
      expect(code).toEqual(0);
    } catch (err) {
      // for windows
      if (process.platform === 'win32') {
        expect(err.stdout.includes('Compiled successfully.')).toBe(true);
      } else {
        throw err;
      }
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
