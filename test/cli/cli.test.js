'use strict';

const { unlink } = require('fs');
const { join, resolve } = require('path');
const execa = require('execa');
const testBin = require('../helpers/test-bin');
const port1 = require('../ports-map').cli[0];

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
        expect(output.stderr).toContain('100%');
        // should not profile
        expect(output.stderr).not.toContain(
          'ms after chunk modules optimization'
        );
        done();
      })
      .catch(done);
  });

  it('--quiet', async (done) => {
    const output = await testBin(`--quiet --colors=false --port ${port1}`);
    expect(output.code).toEqual(0);
    expect(output.stdout.split('\n').length === 3).toBe(true);
    expect(output.stdout).toContain(
      `Project is running at http://localhost:${port1}/`
    );
    expect(output.stdout).toContain('webpack output is served from /');
    expect(output.stdout).toContain('Content not from webpack is served from');
    done();
  });

  it('--progress --profile', (done) => {
    testBin('--progress --profile')
      .then((output) => {
        expect(output.code).toEqual(0);
        // should profile
        expect(output.stderr).toContain('after chunk modules optimization');
        done();
      })
      .catch(done);
  });

  it('--bonjour', (done) => {
    testBin('--bonjour')
      .then((output) => {
        expect(output.code).toEqual(0);
        expect(output.stdout).toContain('Bonjour');
        done();
      })
      .catch(done);
  });

  it('--https', (done) => {
    testBin('--https')
      .then((output) => {
        expect(output.code).toEqual(0);
        expect(output.stdout).toContain('Project is running at');
        done();
      })
      .catch(done);
  });

  it('--https --cacert --pfx --key --cert --pfx-passphrase', (done) => {
    testBin(
      `--https --cacert ${caPath} --pfx ${pfxPath} --key ${keyPath} --cert ${certPath} --pfx-passphrase webpack-dev-server`
    )
      .then((output) => {
        expect(output.code).toEqual(0);
        expect(output.stdout).toContain('Project is running at');
        done();
      })
      .catch(done);
  });

  it.skip('--sockPath', (done) => {
    testBin('--sockPath /mysockPath')
      .then((output) => {
        expect(/sockPath=\/mysockPath/.test(output.stdout)).toEqual(true);
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
        expect(output.stdout).toContain(
          '\u001b[39m \u001b[90m｢wds｣\u001b[39m:'
        );
        done();
      })
      .catch(done);
  });

  // The Unix socket to listen to (instead of a host).
  it('--socket', (done) => {
    const socketPath = join('.', 'webpack.sock');

    testBin(`--socket ${socketPath}`)
      .then((output) => {
        expect(output.code).toEqual(0);

        if (process.platform === 'win32') {
          done();
        } else {
          expect(output.stdout).toContain(socketPath);

          unlink(socketPath, () => {
            done();
          });
        }
      })
      .catch(done);
  });

  it('should accept the promise function of webpack.config.js', (done) => {
    testBin(
      false,
      resolve(__dirname, '../fixtures/promise-config/webpack.config.js')
    )
      .then((output) => {
        expect(output.code).toEqual(0);
        done();
      })
      .catch((err) => {
        // for windows
        expect(err.stdout).toContain('Compiled successfully.');
        done();
      });
  });

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
    const simpleConfig = resolve(__dirname, '../fixtures/simple-config');
    const cp = execa('node', [cliPath], { cwd: simpleConfig });

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
    const simpleConfig = resolve(__dirname, '../fixtures/simple-config');

    const cp = execa('node', [cliPath, '--colors=false'], {
      cwd: simpleConfig,
    });
    const cp2 = execa('node', [cliPath, '--colors=false'], {
      cwd: simpleConfig,
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
