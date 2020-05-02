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
        expect(output.exitCode).toEqual(0);
        expect(output.stderr).toContain('0% compiling');
        // should not profile
        expect(output.stderr).not.toContain(
          'ms after chunk modules optimization'
        );
        done();
      })
      .catch(done);
  });

  it('--progress --profile', (done) => {
    testBin('--progress --profile')
      .then((output) => {
        expect(output.exitCode).toEqual(0);
        // should profile
        expect(output.stderr).toContain('after chunk modules optimization');
        done();
      })
      .catch(done);
  });

  it('--bonjour', (done) => {
    testBin('--bonjour')
      .then((output) => {
        expect(output.exitCode).toEqual(0);

        // use stderr
        // fyi: https://github.com/webpack/webpack/blob/0d4607c68e04a659fa58499e1332c97d5376368a/lib/node/nodeConsole.js#L58
        expect(output.stderr).toContain('Bonjour');
        done();
      })
      .catch(done);
  });

  it('--https', (done) => {
    testBin('--https')
      .then((output) => {
        expect(output.exitCode).toEqual(0);
        expect(output.stderr).toContain('Project is running at');
        done();
      })
      .catch(done);
  });

  it('--https --cacert --pfx --key --cert --pfx-passphrase', (done) => {
    testBin(
      `--https --cacert ${caPath} --pfx ${pfxPath} --key ${keyPath} --cert ${certPath} --pfx-passphrase webpack-dev-server`
    )
      .then((output) => {
        expect(output.exitCode).toEqual(0);
        expect(output.stderr).toContain('Project is running at');
        done();
      })
      .catch(done);
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
        expect(/http:\/\/localhost:[0-9]+/.test(output.stderr)).toEqual(true);
        done();
      })
      .catch(done);
  });

  it('--color', (done) => {
    testBin('--color')
      .then((output) => {
        const expected =
          '<i> [webpack-dev-server] Project is running at \u001b[1m\u001b[34mh';

        expect(output.stderr).toContain(expected);
        done();
      })
      .catch(done);
  });

  // The Unix socket to listen to (instead of a host).
  it('--socket', (done) => {
    const socketPath = join('.', 'webpack.sock');

    testBin(`--socket ${socketPath}`)
      .then((output) => {
        expect(output.exitCode).toEqual(0);

        if (process.platform === 'win32') {
          done();
        } else {
          expect(output.stderr).toContain(socketPath);

          unlink(socketPath, () => {
            done();
          });
        }
      })
      .catch(done);
  });

  it('--port', async () => {
    const output = await testBin(`--colors=false --port ${port1}`);

    expect(output.exitCode).toEqual(0);
    expect(output.stderr.split('\n').length === 3).toBe(true);
    expect(output.stderr).toContain(
      `Project is running at http://localhost:${port1}/`
    );
  });

  it('should accept the promise function of webpack.config.js', (done) => {
    testBin(
      false,
      resolve(__dirname, '../fixtures/promise-config/webpack.config.js')
    )
      .then((output) => {
        expect(output.exitCode).toEqual(0);
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
    const config = resolve(
      __dirname,
      '../fixtures/simple-config/webpack.config.js'
    );

    function getPort(str) {
      const portMatch = /Project is running at http:\/\/localhost:(\d*)\//.exec(
        str
      );

      if (portMatch) {
        return portMatch[1];
      }

      return null;
    }

    let portCp1;
    const { stderr: stderr1, pid: pid1, kill: kill1 } = testBin(false, config);

    stderr1.on('data', (data) => {
      const port = getPort(data.toString());

      if (port) {
        expect(pid1 !== 0).toBe(true);
        portCp1 = port;
      }
    });

    setTimeout(() => {
      const { stderr: stderr2, pid: pid2, kill: kill2 } = testBin(
        false,
        config
      );

      stderr2.on('data', (data) => {
        const portCp2 = getPort(data.toString());

        if (portCp2) {
          kill1('SIGINT');
          kill2('SIGINT');

          expect(pid2 !== 0).toBe(true);
          expect(portCp1).not.toBe(portCp2);
          done();
        }
      });
    }, 700);
  });
});
