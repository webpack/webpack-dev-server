'use strict';

const path = require('path');
const execa = require('execa');
const internalIp = require('internal-ip');
const stripAnsi = require('strip-ansi');
const { testBin, normalizeStderr } = require('../helpers/test-bin');

const localIPv4 = internalIp.v4.sync();
const localIPv6 = internalIp.v6.sync();

const httpsCertificateDirectory = path.resolve(
  __dirname,
  '../fixtures/https-certificate'
);

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

  it('--hot only', (done) => {
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
        expect(
          normalizeStderr(output.stderr, { ipv6: true })
        ).toMatchSnapshot();

        done();
      })
      .catch(done);
  });

  it('--bonjour and --https', (done) => {
    testBin('--bonjour --https')
      .then((output) => {
        expect(output.exitCode).toEqual(0);
        expect(
          normalizeStderr(output.stderr, { ipv6: true, https: true })
        ).toMatchSnapshot();

        done();
      })
      .catch(done);
  });

  it('--no-bonjour', (done) => {
    testBin('--no-bonjour')
      .then((output) => {
        expect(output.exitCode).toEqual(0);
        expect(
          normalizeStderr(output.stderr, { ipv6: true })
        ).toMatchSnapshot();

        done();
      })
      .catch(done);
  });

  it('--client-progress', (done) => {
    testBin('--client-progress')
      .then((output) => {
        expect(output.exitCode).toEqual(0);
        done();
      })
      .catch(done);
  });

  it('--no-client-progress', (done) => {
    testBin('--no-client-progress')
      .then((output) => {
        expect(output.exitCode).toEqual(0);
        done();
      })
      .catch(done);
  });

  it('--client-hot-entry', (done) => {
    testBin('--client-hot-entry --stats=detailed')
      .then((output) => {
        expect(output.exitCode).toEqual(0);
        expect(output.stdout).toContain('webpack/hot/dev-server.js');

        done();
      })
      .catch(done);
  });

  it('--no-client-hot-entry', (done) => {
    testBin('--no-client-hot-entry --stats=detailed')
      .then((output) => {
        expect(output.exitCode).toEqual(0);
        expect(output.stdout).not.toContain('webpack/hot/dev-server.js');

        done();
      })
      .catch(done);
  });

  it('should not inject HMR entry "--client-hot-entry" and "--no-hot"', (done) => {
    testBin('--client-hot-entry --no-hot --stats=detailed')
      .then((output) => {
        expect(output.exitCode).toEqual(0);
        expect(output.stdout).not.toContain('webpack/hot/dev-server.js');

        done();
      })
      .catch(done);
  });

  it('should not inject HMR entry with "--no-client-hot-entry" and "--hot"', (done) => {
    testBin('--no-client-hot-entry --hot --stats=detailed')
      .then((output) => {
        expect(output.exitCode).toEqual(0);
        expect(output.stdout).not.toContain('webpack/hot/dev-server.js');

        done();
      })
      .catch(done);
  });

  it('--http2', (done) => {
    testBin('--http2')
      .then((output) => {
        expect(output.exitCode).toEqual(0);
        expect(
          normalizeStderr(output.stderr, { ipv6: true, https: true })
        ).toMatchSnapshot();

        done();
      })
      .catch(done);
  });

  it('--no-http2', (done) => {
    testBin('--no-http2')
      .then((output) => {
        expect(output.exitCode).toEqual(0);
        expect(
          normalizeStderr(output.stderr, { ipv6: true })
        ).toMatchSnapshot();

        done();
      })
      .catch(done);
  });

  it('--https', (done) => {
    testBin('--https')
      .then((output) => {
        expect(output.exitCode).toEqual(0);
        expect(
          normalizeStderr(output.stderr, { ipv6: true, https: true })
        ).toMatchSnapshot();

        done();
      })
      .catch(done);
  });

  it('https options', (done) => {
    const pfxFile = path.join(httpsCertificateDirectory, 'server.pfx');
    const key = path.join(httpsCertificateDirectory, 'server.key');
    const cert = path.join(httpsCertificateDirectory, 'server.crt');
    const cacert = path.join(httpsCertificateDirectory, 'ca.pem');
    const passphrase = 'webpack-dev-server';

    testBin(
      `--https-key ${key} --https-pfx ${pfxFile} --https-passphrase ${passphrase} --https-cert ${cert} --https-cacert ${cacert}`
    )
      .then((output) => {
        expect(output.exitCode).toEqual(0);
        expect(
          normalizeStderr(output.stderr, { ipv6: true, https: true })
        ).toMatchSnapshot();

        done();
      })
      .catch(done);
  });

  // For https://github.com/webpack/webpack-dev-server/issues/3306
  it('https and other related options', (done) => {
    const pfxFile = path.join(httpsCertificateDirectory, 'server.pfx');
    const key = path.join(httpsCertificateDirectory, 'server.key');
    const cert = path.join(httpsCertificateDirectory, 'server.crt');
    const passphrase = 'webpack-dev-server';

    testBin(
      `--https --https-key ${key} --https-pfx ${pfxFile} --https-passphrase ${passphrase} --https-cert ${cert}`
    )
      .then((output) => {
        expect(output.exitCode).toEqual(0);
        expect(
          normalizeStderr(output.stderr, { ipv6: true, https: true })
        ).toMatchSnapshot();
        done();
      })
      .catch(done);
  });

  it('--https-request-cert', (done) => {
    testBin('--https-request-cert')
      .then((output) => {
        expect(output.exitCode).toEqual(0);
        expect(
          normalizeStderr(output.stderr, { ipv6: true, https: true })
        ).toMatchSnapshot();

        done();
      })
      .catch(done);
  });

  it('--no-https-request-cert', (done) => {
    testBin('--no-https-request-cert')
      .then((output) => {
        expect(output.exitCode).toEqual(0);
        expect(
          normalizeStderr(output.stderr, { ipv6: true, https: true })
        ).toMatchSnapshot();

        done();
      })
      .catch(done);
  });

  it('--no-https', (done) => {
    testBin('--no-https')
      .then((output) => {
        expect(output.exitCode).toEqual(0);
        expect(
          normalizeStderr(output.stderr, { ipv6: true })
        ).toMatchSnapshot();

        done();
      })
      .catch(done);
  });

  it('--history-api-fallback', (done) => {
    testBin('--history-api-fallback --no-color')
      .then((output) => {
        expect(output.exitCode).toEqual(0);
        expect(
          normalizeStderr(output.stderr, { ipv6: true })
        ).toMatchSnapshot();

        done();
      })
      .catch(done);
  });

  it('--no-history-api-fallback', (done) => {
    testBin('--no-history-api-fallback')
      .then((output) => {
        expect(output.exitCode).toEqual(0);
        expect(
          normalizeStderr(output.stderr, { ipv6: true })
        ).toMatchSnapshot();

        done();
      })
      .catch(done);
  });

  it('--host and --port are unspecified', (done) => {
    testBin('')
      .then((output) => {
        expect(output.exitCode).toEqual(0);
        expect(normalizeStderr(output.stderr, { ipv6: true })).toMatchSnapshot(
          'stderr'
        );

        done();
      })
      .catch(done);
  });

  it('--host 0.0.0.0 (IPv4)', (done) => {
    testBin('--host 0.0.0.0')
      .then((output) => {
        expect(output.exitCode).toEqual(0);
        expect(normalizeStderr(output.stderr, { ipv6: true })).toMatchSnapshot(
          'stderr'
        );

        done();
      })
      .catch(done);
  });

  it('--host :: (IPv6)', (done) => {
    testBin('--host ::')
      .then((output) => {
        expect(output.exitCode).toEqual(0);
        expect(normalizeStderr(output.stderr, { ipv6: true })).toMatchSnapshot(
          'stderr'
        );

        done();
      })
      .catch(done);
  });

  it('--host ::1 (IPv6)', (done) => {
    testBin('--host ::1')
      .then((output) => {
        expect(output.exitCode).toEqual(0);
        expect(normalizeStderr(output.stderr)).toMatchSnapshot('stderr');

        done();
      })
      .catch(done);
  });

  it('--host localhost', (done) => {
    testBin('--host localhost')
      .then((output) => {
        expect(output.exitCode).toEqual(0);
        expect(normalizeStderr(output.stderr)).toMatchSnapshot('stderr');

        done();
      })
      .catch(done);
  });

  it('--host 127.0.0.1 (IPv4)', (done) => {
    testBin('--host 127.0.0.1')
      .then((output) => {
        expect(output.exitCode).toEqual(0);
        expect(normalizeStderr(output.stderr)).toMatchSnapshot('stderr');

        done();
      })
      .catch(done);
  });

  it('--host 0:0:0:0:0:FFFF:7F00:0001 (IPv6)', (done) => {
    testBin('--host 0:0:0:0:0:FFFF:7F00:0001')
      .then((output) => {
        expect(output.exitCode).toEqual(0);
        expect(normalizeStderr(output.stderr)).toMatchSnapshot('stderr');

        done();
      })
      .catch(done);
  });

  it(`--host <IPv4>`, (done) => {
    testBin(`--host ${localIPv4}`)
      .then((output) => {
        expect(output.exitCode).toEqual(0);
        expect(normalizeStderr(output.stderr)).toMatchSnapshot('stderr');

        done();
      })
      .catch(done);
  });

  it.skip(`--host <IPv6>`, (done) => {
    testBin(`--host ${localIPv6}`)
      .then((output) => {
        expect(output.exitCode).toEqual(0);
        expect(normalizeStderr(output.stderr)).toMatchSnapshot('stderr');

        done();
      })
      .catch(done);
  });

  it('--host <local-ip>', (done) => {
    testBin('--host local-ip')
      .then((output) => {
        expect(output.exitCode).toEqual(0);
        expect(normalizeStderr(output.stderr)).toMatchSnapshot('stderr');

        done();
      })
      .catch(done);
  });

  it('--host <local-ipv4>', (done) => {
    testBin('--host local-ipv4')
      .then((output) => {
        expect(output.exitCode).toEqual(0);
        expect(normalizeStderr(output.stderr)).toMatchSnapshot('stderr');

        done();
      })
      .catch(done);
  });

  it('--host localhost --port 9999', (done) => {
    testBin('--host localhost --port 9999')
      .then((output) => {
        expect(output.exitCode).toEqual(0);
        expect(normalizeStderr(output.stderr)).toMatchSnapshot('stderr');

        done();
      })
      .catch(done);
  });

  it('--open', (done) => {
    testBin('--open')
      .then((output) => {
        expect(output.exitCode).toEqual(0);
        done();
      })
      .catch(done);
  });

  it('--open /index.html', (done) => {
    testBin('--open /index.html')
      .then((output) => {
        expect(output.exitCode).toEqual(0);
        done();
      })
      .catch(done);
  });

  it('--open /first.html second.html', (done) => {
    testBin('--open /first.html second.html')
      .then((output) => {
        expect(output.exitCode).toEqual(0);
        done();
      })
      .catch(done);
  });

  it('--no-open', (done) => {
    testBin('--no-open')
      .then((output) => {
        expect(output.exitCode).toEqual(0);
        done();
      })
      .catch(done);
  });

  it('--open-app google-chrome', (done) => {
    testBin('--open-app google-chrome')
      .then((output) => {
        expect(output.exitCode).toEqual(0);
        done();
      })
      .catch(done);
  });

  it('--open-target', (done) => {
    testBin('--open-target')
      .then((output) => {
        expect(output.exitCode).toEqual(0);
        done();
      })
      .catch(done);
  });

  it('--no-open-target', (done) => {
    testBin('--no-open-target')
      .then((output) => {
        expect(output.exitCode).toEqual(0);
        done();
      })
      .catch(done);
  });

  it('--open-target index.html', (done) => {
    testBin('--open-target index.html')
      .then((output) => {
        expect(output.exitCode).toEqual(0);
        done();
      })
      .catch(done);
  });

  it('--open-target /first.html second.html', (done) => {
    testBin('--open-target /first.html second.html')
      .then((output) => {
        expect(output.exitCode).toEqual(0);
        done();
      })
      .catch(done);
  });

  it('--open-target /index.html --open-app google-chrome', (done) => {
    testBin('--open-target /index.html --open-app google-chrome')
      .then((output) => {
        expect(output.exitCode).toEqual(0);
        done();
      })
      .catch(done);
  });

  it('--client-overlay', (done) => {
    testBin('--client-overlay')
      .then((output) => {
        expect(output.exitCode).toEqual(0);
        done();
      })
      .catch(done);
  });

  it('--no-client-overlay', (done) => {
    testBin('--no-client-overlay')
      .then((output) => {
        expect(output.exitCode).toEqual(0);
        done();
      })
      .catch(done);
  });

  it('--client-logging', (done) => {
    testBin('--client-logging verbose')
      .then((output) => {
        expect(output.exitCode).toEqual(0);
        done();
      })
      .catch(done);
  });

  it('--compress', (done) => {
    testBin('--compress')
      .then((output) => {
        expect(output.exitCode).toEqual(0);
        done();
      })
      .catch(done);
  });

  it('--no-compress', (done) => {
    testBin('--compress')
      .then((output) => {
        expect(output.exitCode).toEqual(0);
        done();
      })
      .catch(done);
  });

  it('should generate correct cli flags', (done) => {
    testBin('--help')
      .then((output) => {
        expect(stripAnsi(output.stdout)).toMatchSnapshot();
        done();
      })
      .catch(done);
  });

  it('--static', (done) => {
    testBin('--static')
      .then((output) => {
        expect(output.exitCode).toEqual(0);
        done();
      })
      .catch(done);
  });

  it('--static <value>', (done) => {
    testBin(
      `--static ${path.resolve(
        __dirname,
        '../fixtures/static/webpack.config.js'
      )}`
    )
      .then((output) => {
        expect(output.exitCode).toEqual(0);
        done();
      })
      .catch(done);
  });

  it('--static-directory', (done) => {
    testBin(
      `--static-directory ${path.resolve(
        __dirname,
        '../fixtures/static/webpack.config.js'
      )}`
    )
      .then((output) => {
        expect(output.exitCode).toEqual(0);
        done();
      })
      .catch(done);
  });

  it('--static-serve-index', (done) => {
    testBin('--static-serve-index')
      .then((output) => {
        expect(output.exitCode).toEqual(0);
        done();
      })
      .catch(done);
  });

  it('--no-static-serve-index', (done) => {
    testBin('--no-static-serve-index')
      .then((output) => {
        expect(output.exitCode).toEqual(0);
        done();
      })
      .catch(done);
  });

  it('--static-watch', (done) => {
    testBin('--static-watch')
      .then((output) => {
        expect(output.exitCode).toEqual(0);
        done();
      })
      .catch(done);
  });

  it('--no-static-watch', (done) => {
    testBin('--static-watch')
      .then((output) => {
        expect(output.exitCode).toEqual(0);
        done();
      })
      .catch(done);
  });

  it('should log static', (done) => {
    testBin(
      '--no-color',
      path.resolve(__dirname, '../fixtures/static/webpack.config.js')
    )
      .then((output) => {
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

  it('should exit the process when stdin ends if --watch-options-stdin', (done) => {
    const cliPath = path.resolve(__dirname, '../../bin/webpack-dev-server.js');
    const examplePath = path.resolve(__dirname, '../../examples/cli/public');
    const cp = execa('node', [cliPath, '--watch-options-stdin'], {
      cwd: examplePath,
    });

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

  it('should exit the process when stdin ends if --watch-options-stdin, even before the compilation is done', (done) => {
    const cliPath = path.resolve(__dirname, '../../bin/webpack-dev-server.js');
    const cwd = path.resolve(__dirname, '../fixtures/cli');
    const cp = execa('node', [cliPath, '----watch-options-stdin'], { cwd });

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
