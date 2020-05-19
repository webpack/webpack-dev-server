'use strict';

const { unlink } = require('fs');
const { join, resolve } = require('path');
const execa = require('execa');
const testBin = require('../helpers/test-bin');

describe('CLI', () => {
  it('--progress', (done) => {
    testBin('--progress')
      .then((output) => {
        expect(output.exitCode).toEqual(0);
        expect(output.stderr).toContain('100%');
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
        expect(output.stderr).toContain('Project is running at \u001b');
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
        expect(err.stderr).toContain('Compiled successfully.');
        done();
      });
  });

  it('should exit the process when SIGINT is detected', (done) => {
    const cliPath = resolve(__dirname, '../../bin/webpack-dev-server.js');
    const examplePath = resolve(__dirname, '../../examples/cli/public');
    const cp = execa('node', [cliPath], { cwd: examplePath });

    cp.stderr.on('data', (data) => {
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
    const cwd = resolve(__dirname, '../fixtures/cli');
    const cp = execa('node', [cliPath], { cwd });

    let killed = false;

    cp.stderr.on('data', () => {
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
    const cwd = resolve(__dirname, '../fixtures/cli');

    const cp = execa('node', [cliPath, '--colors=false'], { cwd });
    const cp2 = execa('node', [cliPath, '--colors=false'], { cwd });

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

    cp.stderr.on('data', (data) => {
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

    cp2.stderr.on('data', (data) => {
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
