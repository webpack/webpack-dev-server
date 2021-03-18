'use strict';

const path = require('path');
const execa = require('execa');
const internalIp = require('internal-ip');
const { testBin, normalizeStderr } = require('../helpers/test-bin');

const localIPv4 = internalIp.v4.sync();
const localIPv6 = internalIp.v6.sync();

describe('CLI', () => {
  it('--hot', (done) => {
    testBin('--hot --stats=detailed')
      .then((output) => {
        expect(output.exitCode).toEqual(0);
        expect(output.stdout).toContain('webpack/hot/dev-server.js');
        done();
      })
      .catch(done);
  });

  it('--no-hot', (done) => {
    testBin('--no-hot')
      .then((output) => {
        expect(output.exitCode).toEqual(0);
        expect(output.stdout).not.toContain('webpack/hot/dev-server.js');
        done();
      })
      .catch(done);
  });

  // Enable after new webpack-cli release
  it.skip('--hot only', (done) => {
    testBin('--hot only')
      .then((output) => {
        expect(output.exitCode).toEqual(0);
        expect(output.stdout).toContain('/hot/only-dev-server');
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
        expect(/https:\/\//.test(output.stderr)).toEqual(true);
        done();
      })
      .catch(done);
  });

  it('--no-https', (done) => {
    testBin('--no-https')
      .then((output) => {
        expect(output.exitCode).toEqual(0);
        expect(/https:\/\//.test(output.stderr)).toEqual(false);
        expect(/http:\/\/localhost:[0-9]+/.test(output.stderr)).toEqual(true);
        done();
      })
      .catch(done);
  });

  it('--history-api-fallback', (done) => {
    testBin('--history-api-fallback --no-color')
      .then((output) => {
        expect(output.exitCode).toEqual(0);
        expect(output.stderr).toContain(`404s will fallback to '/index.html'`);
        done();
      })
      .catch(done);
  });

  it('--no-history-api-fallback', (done) => {
    testBin('--no-history-api-fallback')
      .then((output) => {
        expect(output.exitCode).toEqual(0);
        expect(output.stderr).not.toContain(
          `404s will fallback to '/index.html'`
        );
        done();
      })
      .catch(done);
  });

  it('--host and --port are unspecified', (done) => {
    testBin('')
      .then((output) => {
        expect(normalizeStderr(output.stderr)).toMatchSnapshot('stderr');

        done();
      })
      .catch(done);
  });

  it('--host 0.0.0.0 (IPv4)', (done) => {
    testBin('--host 0.0.0.0')
      .then((output) => {
        expect(normalizeStderr(output.stderr)).toMatchSnapshot('stderr');

        done();
      })
      .catch(done);
  });

  it('--host :: (IPv6)', (done) => {
    testBin('--host ::')
      .then((output) => {
        expect(normalizeStderr(output.stderr)).toMatchSnapshot('stderr');

        done();
      })
      .catch(done);
  });

  it.skip('--host ::1 (IPv6)', (done) => {
    testBin('--host ::1')
      .then((output) => {
        expect(normalizeStderr(output.stderr)).toMatchSnapshot('stderr');

        done();
      })
      .catch(done);
  });

  it('--host localhost', (done) => {
    testBin('--host localhost')
      .then((output) => {
        expect(normalizeStderr(output.stderr)).toMatchSnapshot('stderr');

        done();
      })
      .catch(done);
  });

  it('--host 127.0.0.1 (IPv4)', (done) => {
    testBin('--host 127.0.0.1')
      .then((output) => {
        expect(normalizeStderr(output.stderr)).toMatchSnapshot('stderr');

        done();
      })
      .catch(done);
  });

  it('--host 0:0:0:0:0:FFFF:7F00:0001 (IPv6)', (done) => {
    testBin('--host 0:0:0:0:0:FFFF:7F00:0001')
      .then((output) => {
        expect(normalizeStderr(output.stderr)).toMatchSnapshot('stderr');

        done();
      })
      .catch(done);
  });

  it(`--host <IPv4>`, (done) => {
    testBin(`--host ${localIPv4}`)
      .then((output) => {
        expect(normalizeStderr(output.stderr)).toMatchSnapshot('stderr');

        done();
      })
      .catch(done);
  });

  it(`--host <IPv6>`, (done) => {
    testBin(`--host ${localIPv6}`)
      .then((output) => {
        expect(normalizeStderr(output.stderr)).toMatchSnapshot('stderr');

        done();
      })
      .catch(done);
  });

  it('--host localhost --port 9999', (done) => {
    testBin('--host localhost --port 9999')
      .then((output) => {
        expect(normalizeStderr(output.stderr)).toMatchSnapshot('stderr');

        done();
      })
      .catch(done);
  });

  it('should log public path', (done) => {
    testBin(
      '--no-color',
      path.resolve(__dirname, '../fixtures/dev-public-path/webpack.config.js')
    )
      .then((output) => {
        expect(output.exitCode).toEqual(0);
        done();
      })
      .catch((err) => {
        // for windows
        expect(err.stderr).toContain(
          "webpack output is served from '/foo/bar' URL"
        );
        expect(err.stdout).toContain('main.js');
        done();
      });
  });

  it('should log static', (done) => {
    testBin(
      '--no-color',
      path.resolve(__dirname, '../fixtures/static/webpack.config.js')
    )
      .then((output) => {
        console.log(output);
        expect(output.exitCode).toEqual(0);
        done();
      })
      .catch((err) => {
        const staticDirectory = path.resolve(
          __dirname,
          '../fixtures/static/static'
        );

        // for windows
        expect(err.stderr).toContain(
          `Content not from webpack is served from '${staticDirectory}' directory`
        );
        expect(err.stdout).toContain('main.js');
        done();
      });
  });

  it('should accept the promise function of webpack.config.js', (done) => {
    testBin(
      false,
      path.resolve(__dirname, '../fixtures/promise-config/webpack.config.js')
    )
      .then((output) => {
        expect(output.exitCode).toEqual(0);
        done();
      })
      .catch((err) => {
        // for windows
        expect(err.stdout).toContain('main.js');
        done();
      });
  });

  it('should exit the process when SIGINT is detected', (done) => {
    const cliPath = path.resolve(__dirname, '../../bin/webpack-dev-server.js');
    const examplePath = path.resolve(__dirname, '../../examples/cli/public');
    const cp = execa('node', [cliPath], { cwd: examplePath });

    cp.stdout.on('data', (data) => {
      const bits = data.toString();

      if (/main.js/.test(bits)) {
        expect(cp.pid !== 0).toBe(true);

        cp.kill('SIGINT');
      }
    });

    cp.on('exit', () => {
      done();
    });
  });

  it('should exit the process when SIGINT is detected, even before the compilation is done', (done) => {
    const cliPath = path.resolve(__dirname, '../../bin/webpack-dev-server.js');
    const cwd = path.resolve(__dirname, '../fixtures/cli');
    const cp = execa('node', [cliPath], { cwd });

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

  it('should exit the process when stdin ends if --stdin', (done) => {
    const cliPath = path.resolve(__dirname, '../../bin/webpack-dev-server.js');
    const examplePath = path.resolve(__dirname, '../../examples/cli/public');
    const cp = execa('node', [cliPath, '--stdin'], { cwd: examplePath });

    cp.stdout.on('data', (data) => {
      const bits = data.toString();

      if (/main.js/.test(bits)) {
        expect(cp.pid !== 0).toBe(true);

        cp.stdin.write('hello');
        cp.stdin.end('world');
      }
    });

    cp.on('exit', () => {
      done();
    });
  });

  it('should exit the process when stdin ends if --stdin, even before the compilation is done', (done) => {
    const cliPath = path.resolve(__dirname, '../../bin/webpack-dev-server.js');
    const cwd = path.resolve(__dirname, '../fixtures/cli');
    const cp = execa('node', [cliPath, '--stdin'], { cwd });

    let killed = false;

    cp.stdout.on('data', () => {
      if (!killed) {
        expect(cp.pid !== 0).toBe(true);

        cp.stdin.write('hello');
        cp.stdin.end('world');
      }

      killed = true;
    });

    cp.on('exit', () => {
      done();
    });
  });

  it.skip('should use different random port when multiple instances are started on different processes', (done) => {
    const cliPath = path.resolve(__dirname, '../../bin/webpack-dev-server.js');
    const cwd = path.resolve(__dirname, '../fixtures/cli');

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
