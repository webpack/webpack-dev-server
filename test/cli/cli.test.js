'use strict';

const path = require('path');
const execa = require('execa');
const internalIp = require('internal-ip');
const testBin = require('../helpers/test-bin');
const isWebpack5 = require('../helpers/isWebpack5');

// skip if webpack-dev-server is not linked
let runCLITest = describe;
let basePath;

try {
  basePath = path.join(require.resolve('webpack-dev-server'), '..', '..');
} catch {
  runCLITest = describe.skip;
}

runCLITest('CLI', () => {
  /* Based on webpack/test/StatsTestCases.test.js */
  /**
   * Escapes regular expression metacharacters
   * @param {string} str String to quote
   * @returns {string} Escaped string
   */
  const quotemeta = (str) => str.replace(/[-[\]\\/{}()*+?.^$|]/g, '\\$&');

  const normalizeOutput = (output) =>
    output
      // eslint-disable-next-line no-control-regex
      .replace(/\u001b\[[0-9;]*m/g, '')
      .replace(/[.0-9]+(\s?)(ms|KiB|bytes)/g, 'X$1$2')
      .replace(
        /(Built at:) (.*)$/gm,
        '$1 Thu Jan 01 1970 <CLR=BOLD>00:00:00</CLR> GMT'
      )
      .replace(/webpack [^ )]+/g, 'webpack x.x.x')
      .replace(new RegExp(quotemeta(basePath.replace(/\\/g, '/')), 'g'), 'Xdir')
      .replace(new RegExp(quotemeta(basePath), 'g'), 'Xdir')
      .replace(/[\\/]static/, '/static')
      .replace(/(Hash:) [a-z0-9]+/g, '$1 X')
      .replace(/ dependencies:Xms/g, '')
      .replace(/, additional resolving: X ms/g, '');

  const webpack4Test = isWebpack5 ? it.skip : it;
  const webpack5Test = isWebpack5 ? it : it.skip;

  webpack4Test('--hot webpack 4', (done) => {
    testBin('--hot')
      .then((output) => {
        expect(output.exitCode).toEqual(0);
        expect(normalizeOutput(output.stderr)).toMatchSnapshot();
        done();
      })
      .catch(done);
  });

  webpack4Test('--no-hot webpack 4', (done) => {
    testBin('--no-hot')
      .then((output) => {
        expect(output.exitCode).toEqual(0);
        expect(normalizeOutput(output.stderr)).toMatchSnapshot();
        done();
      })
      .catch(done);
  });

  webpack5Test('--hot webpack 5', (done) => {
    testBin('--hot')
      .then((output) => {
        expect(output.exitCode).toEqual(0);
        expect(normalizeOutput(output.stderr)).toMatchSnapshot();
        done();
      })
      .catch(done);
  });

  webpack5Test('--no-hot webpack 5', (done) => {
    testBin('--no-hot')
      .then((output) => {
        expect(output.exitCode).toEqual(0);
        expect(normalizeOutput(output.stderr)).toMatchSnapshot();
        done();
      })
      .catch(done);
  });

  // TODO: do not skip after the major version is bumped
  // https://github.com/webpack/webpack-cli/commit/7c5a2bae49625ee4982d7478b7e741968731cea2
  it.skip('--hot-only', (done) => {
    testBin('--hot-only')
      .then((output) => {
        expect(output.exitCode).toEqual(0);
        expect(output.stderr).toContain('/hot/only-dev-server');
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

  it('unspecified host and port', (done) => {
    testBin('')
      .then((output) => {
        expect(/http:\/\/localhost:[0-9]+/.test(output.stderr)).toEqual(true);
        done();
      })
      .catch(done);
  });

  it('--host 0.0.0.0 (IPv4)', (done) => {
    testBin('--host 0.0.0.0')
      .then((output) => {
        const localIP = internalIp.v4.sync();

        expect(/http:\/\/localhost:[0-9]+/.test(output.stderr)).toEqual(true);
        expect(
          new RegExp(`http://${localIP}:[0-9]+/`).test(output.stderr)
        ).toEqual(true);
        done();
      })
      .catch(done);
  });

  // TODO search way how to tests it on github actions
  it.skip('--host :: (IPv6)', (done) => {
    testBin('--host ::')
      .then((output) => {
        const localIP = internalIp.v4.sync();

        expect(/http:\/\/localhost:[0-9]+/.test(output.stderr)).toEqual(true);
        expect(
          new RegExp(`http://${localIP}:[0-9]+/`).test(output.stderr)
        ).toEqual(true);
        done();
      })
      .catch(done);
  });

  it('--host localhost', (done) => {
    testBin('--host localhost')
      .then((output) => {
        expect(/http:\/\/localhost:[0-9]+/.test(output.stderr)).toEqual(true);
        done();
      })
      .catch(done);
  });

  it('--port', (done) => {
    testBin('--port 9999')
      .then((output) => {
        expect(/http:\/\/localhost:9999/.test(output.stderr)).toEqual(true);
        done();
      })
      .catch(done);
  });

  it('should log public path', (done) => {
    testBin(
      false,
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
        expect(err.stderr).toContain('Compiled successfully.');
        done();
      });
  });

  it('should log static', (done) => {
    testBin(
      false,
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
        expect(err.stderr).toContain('Compiled successfully.');
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
        expect(err.stderr).toContain('Compiled successfully.');
        done();
      });
  });

  it('should exit the process when SIGINT is detected', (done) => {
    const cliPath = path.resolve(__dirname, '../../bin/webpack-dev-server.js');
    const examplePath = path.resolve(__dirname, '../../examples/cli/public');
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
    const cliPath = path.resolve(__dirname, '../../bin/webpack-dev-server.js');
    const cwd = path.resolve(__dirname, '../fixtures/cli');
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

  it('should exit the process when stdin ends if --stdin', (done) => {
    const cliPath = path.resolve(__dirname, '../../bin/webpack-dev-server.js');
    const examplePath = path.resolve(__dirname, '../../examples/cli/public');
    const cp = execa('node', [cliPath, '--stdin'], { cwd: examplePath });

    cp.stderr.on('data', (data) => {
      const bits = data.toString();

      if (/Compiled successfully/.test(bits)) {
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

    cp.stderr.on('data', () => {
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

  // TODO: do not skip after @webpack-cli/serve passes null port by default
  // https://github.com/webpack/webpack-cli/pull/2126
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
