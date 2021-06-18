'use strict';

const path = require('path');
const webpack = require('webpack');
const execa = require('execa');
const internalIp = require('internal-ip');
const stripAnsi = require('strip-ansi');
const schema = require('../../lib/options.json');
const cliOptions = require('../../bin/cli-flags');
const { testBin, normalizeStderr } = require('../helpers/test-bin');

const isMacOS = process.platform === 'darwin';
const localIPv4 = internalIp.v4.sync();
const localIPv6 = internalIp.v6.sync();

const httpsCertificateDirectory = path.resolve(
  __dirname,
  '../fixtures/https-certificate'
);

describe('CLI', () => {
  describe('options', () => {
    (webpack.version.startsWith('5') ? it : it.skip)(
      'should be same as in schema',
      () => {
        const cliOptionsFromWebpack = webpack.cli.getArguments(schema);

        const normalizedCliOptions = {};

        for (const [name, options] of Object.entries(cliOptions)) {
          // Only webpack-cli supports it
          // TODO send PR to webpack
          delete options.negatedDescription;

          normalizedCliOptions[name] = options;
        }

        expect(normalizedCliOptions).toStrictEqual(cliOptionsFromWebpack);
      }
    );
  });

  describe('help', () => {
    (isMacOS ? it.skip : it)('should generate correct cli flags', async () => {
      const { exitCode, stdout } = await testBin(['--help']);

      expect(exitCode).toBe(0);
      expect(stripAnsi(stdout)).toMatchSnapshot();
    });
  });

  describe('hot option', () => {
    it('--hot', async () => {
      const { exitCode, stdout } = await testBin(['--hot', '--stats=detailed']);

      expect(exitCode).toEqual(0);
      expect(stdout).toContain('webpack/hot/dev-server.js');
    });

    it('--no-hot', async () => {
      const { exitCode, stdout } = await testBin([
        '--no-hot',
        '--stats=detailed',
      ]);

      expect(exitCode).toEqual(0);
      expect(stdout).not.toContain('webpack/hot/dev-server.js');
    });

    it('--hot only', async () => {
      const { exitCode, stdout } = await testBin(['--hot', 'only']);

      expect(exitCode).toEqual(0);
      expect(stdout).toContain('/hot/only-dev-server.js');
    });
  });

  describe('allowedHosts option', () => {
    it('--allowed-hosts auto', async () => {
      const { exitCode } = await testBin(['--allowed-hosts', 'auto']);

      expect(exitCode).toEqual(0);
    });

    it('--allowed-hosts all', async () => {
      const { exitCode } = await testBin(['--allowed-hosts', 'all']);

      expect(exitCode).toEqual(0);
    });

    it('--allowed-hosts string', async () => {
      const { exitCode } = await testBin(['--allowed-hosts', 'testhouse.com']);

      expect(exitCode).toEqual(0);
    });

    it('--allowed-hosts multiple', async () => {
      const { exitCode } = await testBin([
        '--allowed-hosts',
        'testhost.com',
        '--allowed-hosts',
        'testhost1.com',
      ]);

      expect(exitCode).toEqual(0);
    });
  });

  describe('bonjour option', () => {
    it('--bonjour', async () => {
      const { exitCode, stderr } = await testBin(['--bonjour']);

      expect(exitCode).toEqual(0);
      expect(normalizeStderr(stderr, { ipv6: true })).toMatchSnapshot();
    });

    it('--bonjour and --https', async () => {
      const { exitCode, stderr } = await testBin(['--bonjour', '--https']);

      expect(exitCode).toEqual(0);
      expect(
        normalizeStderr(stderr, { ipv6: true, https: true })
      ).toMatchSnapshot();
    });

    it('--no-bonjour', async () => {
      const { exitCode, stderr } = await testBin(['--no-bonjour']);

      expect(exitCode).toEqual(0);
      expect(normalizeStderr(stderr, { ipv6: true })).toMatchSnapshot();
    });
  });

  describe('client option', () => {
    it('--client-transport sockjs', async () => {
      const { exitCode } = await testBin(['--client-transport', 'sockjs']);

      expect(exitCode).toEqual(0);
    });

    it('--client-transport ws', async () => {
      const { exitCode } = await testBin(['--client-transport', 'ws']);

      expect(exitCode).toEqual(0);
    });

    it('--client-overlay', async () => {
      const { exitCode } = await testBin(['--client-overlay']);

      expect(exitCode).toEqual(0);
    });

    it('--no-client-overlay', async () => {
      const { exitCode } = await testBin(['--no-client-overlay']);

      expect(exitCode).toEqual(0);
    });

    it('--client-overlay-errors', async () => {
      const { exitCode } = await testBin(['--client-overlay-errors']);

      expect(exitCode).toEqual(0);
    });

    it('--no-client-overlay-errors', async () => {
      const { exitCode } = await testBin(['--no-client-overlay-errors']);

      expect(exitCode).toEqual(0);
    });

    it('--client-overlay-warnings', async () => {
      const { exitCode } = await testBin(['--client-overlay-warnings']);

      expect(exitCode).toEqual(0);
    });

    it('--no-client-overlay-warnings', async () => {
      const { exitCode } = await testBin(['--no-client-overlay-warnings']);

      expect(exitCode).toEqual(0);
    });

    it('--client-need-client-entry', async () => {
      const { exitCode, stdout } = await testBin([
        '--client-need-client-entry',
        '--stats=detailed',
      ]);

      expect(exitCode).toEqual(0);
      expect(stdout).toContain('client/index.js');
    });

    it('--no-client-need-client-entry', async () => {
      const { exitCode, stdout } = await testBin([
        '--no-client-need-client-entry',
        '--stats=detailed',
      ]);

      expect(exitCode).toEqual(0);
      expect(stdout).not.toContain('client/index.js');
    });

    it('--client-logging', async () => {
      const { exitCode } = await testBin(['--client-logging', 'verbose']);

      expect(exitCode).toEqual(0);
    });

    it('--client-progress', async () => {
      const { exitCode } = await testBin(['--client-progress']);

      expect(exitCode).toEqual(0);
    });

    it('--no-client-progress', async () => {
      const { exitCode } = await testBin(['--no-client-progress']);

      expect(exitCode).toEqual(0);
    });

    it('--client-hot-entry', async () => {
      const { exitCode, stdout } = await testBin([
        '--client-hot-entry',
        '--stats=detailed',
      ]);

      expect(exitCode).toEqual(0);
      expect(stdout).toContain('webpack/hot/dev-server.js');
    });

    it('--no-client-hot-entry', async () => {
      const { exitCode, stdout } = await testBin([
        '--no-client-hot-entry',
        '--stats=detailed',
      ]);

      expect(exitCode).toEqual(0);
      expect(stdout).not.toContain('webpack/hot/dev-server.js');
    });

    it('should not inject HMR entry "--client-hot-entry" and "--no-hot"', async () => {
      const { exitCode, stdout } = await testBin([
        '--client-hot-entry',
        '--no-hot',
        '--stats=detailed',
      ]);

      expect(exitCode).toEqual(0);
      expect(stdout).not.toContain('webpack/hot/dev-server.js');
    });

    it('should not inject HMR entry with "--no-client-hot-entry" and "--hot"', async () => {
      const { exitCode, stdout } = await testBin([
        '--no-client-hot-entry',
        '--hot',
        '--stats=detailed',
      ]);

      expect(exitCode).toEqual(0);
      expect(stdout).not.toContain('webpack/hot/dev-server.js');
    });

    it('--client-web-socket-url', async () => {
      const { exitCode } = await testBin([
        '--client-web-socket-url',
        'ws://myhost.com:8080/foo/test',
      ]);

      expect(exitCode).toEqual(0);
    });

    it('--client-web-socket-url-protocol', async () => {
      const { exitCode } = await testBin([
        '--client-web-socket-url-protocol',
        'ws:',
      ]);

      expect(exitCode).toEqual(0);
    });

    it('--client-web-socket-url-host', async () => {
      const { exitCode } = await testBin([
        '--client-web-socket-url-host',
        '0.0.0.0',
      ]);

      expect(exitCode).toEqual(0);
    });

    it('--client-web-socket-url-path', async () => {
      const { exitCode } = await testBin([
        '--client-web-socket-url-path',
        '/ws',
      ]);

      expect(exitCode).toEqual(0);
    });

    it('--client-web-socket-url-port', async () => {
      const { exitCode } = await testBin([
        '--client-web-socket-url-port',
        8080,
      ]);

      expect(exitCode).toEqual(0);
    });
  });

  describe('webSocketServer option', () => {
    it('--web-socket-server sockjs', async () => {
      const { exitCode } = await testBin(['--web-socket-server', 'sockjs']);

      expect(exitCode).toEqual(0);
    });

    it('--web-socket-server ws', async () => {
      const { exitCode } = await testBin(['--web-socket-server', 'ws']);

      expect(exitCode).toEqual(0);
    });
  });

  describe('http2 option', () => {
    it('--http2', async () => {
      const { exitCode, stderr } = await testBin(['--http2']);

      expect(exitCode).toEqual(0);
      expect(
        normalizeStderr(stderr, { ipv6: true, https: true })
      ).toMatchSnapshot();
    });

    it('--no-http2', async () => {
      const { exitCode, stderr } = await testBin(['--no-http2']);

      expect(exitCode).toEqual(0);
      expect(normalizeStderr(stderr, { ipv6: true })).toMatchSnapshot();
    });
  });

  describe('https option', () => {
    it('--https', async () => {
      const { exitCode, stderr } = await testBin(['--https']);

      expect(exitCode).toEqual(0);
      expect(
        normalizeStderr(stderr, { ipv6: true, https: true })
      ).toMatchSnapshot();
    });

    it('https options', async () => {
      const pfxFile = path.join(httpsCertificateDirectory, 'server.pfx');
      const key = path.join(httpsCertificateDirectory, 'server.key');
      const cert = path.join(httpsCertificateDirectory, 'server.crt');
      const cacert = path.join(httpsCertificateDirectory, 'ca.pem');
      const passphrase = 'webpack-dev-server';

      const { exitCode, stderr } = await testBin(
        `--https-key ${key} --https-pfx ${pfxFile} --https-passphrase ${passphrase} --https-cert ${cert} --https-cacert ${cacert}`
      );

      expect(exitCode).toEqual(0);
      expect(
        normalizeStderr(stderr, { ipv6: true, https: true })
      ).toMatchSnapshot();
    });

    // For https://github.com/webpack/webpack-dev-server/issues/3306
    it('https and other related options', async () => {
      const pfxFile = path.join(httpsCertificateDirectory, 'server.pfx');
      const key = path.join(httpsCertificateDirectory, 'server.key');
      const cert = path.join(httpsCertificateDirectory, 'server.crt');
      const passphrase = 'webpack-dev-server';

      const { exitCode, stderr } = await testBin(
        `--https-key ${key} --https-pfx ${pfxFile} --https-passphrase ${passphrase} --https-cert ${cert}`
      );

      expect(exitCode).toEqual(0);
      expect(
        normalizeStderr(stderr, { ipv6: true, https: true })
      ).toMatchSnapshot();
    });

    it('--https-request-cert', async () => {
      const { exitCode, stderr } = await testBin(['--https-request-cert']);

      expect(exitCode).toEqual(0);
      expect(
        normalizeStderr(stderr, { ipv6: true, https: true })
      ).toMatchSnapshot();
    });

    it('--no-https-request-cert', async () => {
      const { exitCode, stderr } = await testBin(['--no-https-request-cert']);

      expect(exitCode).toEqual(0);
      expect(
        normalizeStderr(stderr, { ipv6: true, https: true })
      ).toMatchSnapshot();
    });

    it('--no-https', async () => {
      const { exitCode, stderr } = await testBin(['--no-https']);

      expect(exitCode).toEqual(0);
      expect(normalizeStderr(stderr, { ipv6: true })).toMatchSnapshot();
    });
  });

  describe('historyApiFallback option', () => {
    it('--history-api-fallback', async () => {
      const { exitCode, stderr } = await testBin(['--history-api-fallback']);

      expect(exitCode).toEqual(0);
      expect(normalizeStderr(stderr, { ipv6: true })).toMatchSnapshot();
    });

    it('--no-history-api-fallback', async () => {
      const { exitCode, stderr } = await testBin(['--no-history-api-fallback']);

      expect(exitCode).toEqual(0);
      expect(normalizeStderr(stderr, { ipv6: true })).toMatchSnapshot();
    });
  });

  describe('host option', () => {
    it('--host 0.0.0.0 (IPv4)', async () => {
      const { exitCode, stderr } = await testBin(['--host', '0.0.0.0']);

      expect(exitCode).toEqual(0);
      expect(normalizeStderr(stderr, { ipv6: true })).toMatchSnapshot('stderr');
    });

    it('--host :: (IPv6)', async () => {
      const { exitCode, stderr } = await testBin(['--host', '::']);

      expect(exitCode).toEqual(0);
      expect(normalizeStderr(stderr, { ipv6: true })).toMatchSnapshot('stderr');
    });

    it('--host ::1 (IPv6)', async () => {
      const { exitCode, stderr } = await testBin(['--host', '::1']);

      expect(exitCode).toEqual(0);
      expect(normalizeStderr(stderr)).toMatchSnapshot('stderr');
    });

    it('--host localhost', async () => {
      const { exitCode, stderr } = await testBin(['--host', 'localhost']);

      expect(exitCode).toEqual(0);
      expect(normalizeStderr(stderr)).toMatchSnapshot('stderr');
    });

    it('--host 127.0.0.1 (IPv4)', async () => {
      const { exitCode, stderr } = await testBin(['--host', '127.0.0.1']);

      expect(exitCode).toEqual(0);
      expect(normalizeStderr(stderr)).toMatchSnapshot('stderr');
    });

    it('--host 0:0:0:0:0:FFFF:7F00:0001 (IPv6)', async () => {
      const { exitCode, stderr } = await testBin([
        '--host',
        '0:0:0:0:0:FFFF:7F00:0001',
      ]);

      expect(exitCode).toEqual(0);
      expect(normalizeStderr(stderr)).toMatchSnapshot('stderr');
    });

    it(`--host <IPv4>`, async () => {
      const { exitCode, stderr } = await testBin(['--host', localIPv4]);

      expect(exitCode).toEqual(0);
      expect(normalizeStderr(stderr)).toMatchSnapshot('stderr');
    });

    it.skip(`--host <IPv6>`, async () => {
      const { exitCode, stderr } = await testBin(['--host', localIPv6]);

      expect(exitCode).toEqual(0);
      expect(normalizeStderr(stderr)).toMatchSnapshot('stderr');
    });

    it('--host <local-ip>', async () => {
      const { exitCode, stderr } = await testBin(['--host', 'local-ip']);

      expect(exitCode).toEqual(0);
      expect(normalizeStderr(stderr)).toMatchSnapshot('stderr');
    });

    it('--host <local-ipv4>', async () => {
      const { exitCode, stderr } = await testBin(['--host', 'local-ipv4']);

      expect(exitCode).toEqual(0);
      expect(normalizeStderr(stderr)).toMatchSnapshot('stderr');
    });
  });

  describe('port option', () => {
    it('--port is string', async () => {
      const { exitCode, stderr } = await testBin(['--port', '8080']);

      expect(exitCode).toEqual(0);
      expect(normalizeStderr(stderr, { ipv6: true })).toMatchSnapshot('stderr');
    });

    it(`--port is auto`, async () => {
      const { exitCode, stderr } = await testBin(['--port', 'auto']);

      expect(exitCode).toEqual(0);
      expect(normalizeStderr(stderr, { ipv6: true })).toMatchSnapshot('stderr');
    });
  });

  describe('host and port options', () => {
    it('--host and --port are unspecified', async () => {
      const { exitCode, stderr } = await testBin('');

      expect(exitCode).toEqual(0);
      expect(normalizeStderr(stderr, { ipv6: true })).toMatchSnapshot('stderr');
    });

    it('--host localhost --port 9999', async () => {
      const { exitCode, stderr } = await testBin([
        '--host',
        'localhost',
        '--port',
        9999,
      ]);

      expect(exitCode).toEqual(0);
      expect(normalizeStderr(stderr)).toMatchSnapshot('stderr');
    });
  });

  describe('liveReload option', () => {
    it('--live-reload', async () => {
      const { exitCode } = await testBin(['--live-reload']);

      expect(exitCode).toEqual(0);
    });

    it('--no-live-reload', async () => {
      const { exitCode } = await testBin(['--no-live-reload']);

      expect(exitCode).toEqual(0);
    });
  });

  describe('open option', () => {
    it('--open', async () => {
      const { exitCode } = await testBin(['--open']);

      expect(exitCode).toEqual(0);
    });

    it('--open /index.html', async () => {
      const { exitCode } = await testBin('--open /index.html');

      expect(exitCode).toEqual(0);
    });

    it('--open /first.html second.html', async () => {
      const { exitCode } = await testBin('--open /first.html second.html');

      expect(exitCode).toEqual(0);
    });

    it('--no-open', async () => {
      const { exitCode } = await testBin('--no-open');

      expect(exitCode).toEqual(0);
    });

    it('--open-reset', async () => {
      const { exitCode } = await testBin('--open-reset --open /third.html');

      expect(exitCode).toEqual(0);
    });

    it('--open-reset --open-target', async () => {
      const { exitCode } = await testBin('--open-reset --open-target');

      expect(exitCode).toEqual(0);
    });

    it('--open-reset --open-target <value>', async () => {
      const { exitCode } = await testBin(
        '--open-reset --open-target /third.html'
      );

      expect(exitCode).toEqual(0);
    });

    it('--open-app google-chrome', async () => {
      const { exitCode } = await testBin('--open-app google-chrome');

      expect(exitCode).toEqual(0);
    });

    it('--open-app-name google-chrome', async () => {
      const { exitCode } = await testBin('--open-app-name google-chrome');

      expect(exitCode).toEqual(0);
    });

    it('--open-app-name-reset', async () => {
      const { exitCode } = await testBin(
        '-open-app-name-reset --open-app-name firefox'
      );

      expect(exitCode).toEqual(0);
    });

    it('--open-target', async () => {
      const { exitCode } = await testBin('-open-target');

      expect(exitCode).toEqual(0);
    });

    it('--no-open-target', async () => {
      const { exitCode } = await testBin('--no-open-target');

      expect(exitCode).toEqual(0);
    });

    it('--open-target index.html', async () => {
      const { exitCode } = await testBin('--open-target index.html');

      expect(exitCode).toEqual(0);
    });

    it('--open-target-reset', async () => {
      const { exitCode } = await testBin(
        '--open-target-reset --open-target first.html'
      );

      expect(exitCode).toEqual(0);
    });

    it('--open-target /first.html second.html', async () => {
      const { exitCode } = await testBin(
        '--open-target /first.html second.html'
      );

      expect(exitCode).toEqual(0);
    });

    it('--open-target /index.html --open-app google-chrome', async () => {
      const { exitCode } = await testBin(
        '--open-target /index.html --open-app google-chrome'
      );

      expect(exitCode).toEqual(0);
    });

    it('--open-target /index.html --open-app-name google-chrome', async () => {
      const { exitCode } = await testBin(
        '--open-target /index.html --open-app-name google-chrome'
      );

      expect(exitCode).toEqual(0);
    });

    it('--open-target /index.html --open-app google-chrome --open-app-name google-chrome', async () => {
      const { exitCode } = await testBin(
        '--open-target /index.html --open-app google-chrome --open-app-name google-chrome'
      );

      expect(exitCode).toEqual(0);
    });
  });

  describe('compress option', () => {
    it('--compress', async () => {
      const { exitCode } = await testBin('--compress');

      expect(exitCode).toEqual(0);
    });

    it('--no-compress', async () => {
      const { exitCode } = await testBin('--no-compress');

      expect(exitCode).toEqual(0);
    });
  });

  describe('static option', () => {
    it('--static', async () => {
      const { exitCode, stderr } = await testBin('--static');

      expect(exitCode).toEqual(0);
      expect(normalizeStderr(stderr, { ipv6: true })).toMatchSnapshot('stderr');
    });

    it('--static <value>', async () => {
      const { exitCode, stderr } = await testBin('--static new-static');

      expect(exitCode).toEqual(0);
      expect(normalizeStderr(stderr, { ipv6: true })).toMatchSnapshot('stderr');
    });

    it('--static <value> --static <other-value>', async () => {
      const { exitCode, stderr } = await testBin(
        '--static new-static --static other-static'
      );

      expect(exitCode).toEqual(0);
      expect(normalizeStderr(stderr, { ipv6: true })).toMatchSnapshot('stderr');
    });

    it('--static-reset', async () => {
      const { exitCode, stderr } = await testBin(
        '--static-reset --static new-static-after-reset'
      );

      expect(exitCode).toEqual(0);
      expect(normalizeStderr(stderr, { ipv6: true })).toMatchSnapshot('stderr');
    });

    it('--static-reset --static-directory <value>', async () => {
      const { exitCode, stderr } = await testBin(
        '--static-reset --static-directory new-static-directory'
      );

      expect(exitCode).toEqual(0);
      expect(normalizeStderr(stderr, { ipv6: true })).toMatchSnapshot('stderr');
    });

    it('--static-directory', async () => {
      const { exitCode, stderr } = await testBin(
        '--static-directory static-dir'
      );

      expect(exitCode).toEqual(0);
      expect(normalizeStderr(stderr, { ipv6: true })).toMatchSnapshot('stderr');
    });

    it('--static-public-path', async () => {
      const { exitCode, stderr } = await testBin(
        '--static-public-path /public'
      );

      expect(exitCode).toEqual(0);
      expect(normalizeStderr(stderr, { ipv6: true })).toMatchSnapshot('stderr');
    });

    it('--static-public-path-reset', async () => {
      const { exitCode, stderr } = await testBin(
        '--static-public-path-reset --static-public-path /new-public'
      );

      expect(exitCode).toEqual(0);
      expect(normalizeStderr(stderr, { ipv6: true })).toMatchSnapshot('stderr');
    });

    it('--static-serve-index', async () => {
      const { exitCode, stderr } = await testBin('--static-serve-index');

      expect(exitCode).toEqual(0);
      expect(normalizeStderr(stderr, { ipv6: true })).toMatchSnapshot('stderr');
    });

    it('--no-static-serve-index', async () => {
      const { exitCode, stderr } = await testBin('--no-static-serve-index');

      expect(exitCode).toEqual(0);
      expect(normalizeStderr(stderr, { ipv6: true })).toMatchSnapshot('stderr');
    });

    it('--static-watch', async () => {
      const { exitCode, stderr } = await testBin('--static-watch');

      expect(exitCode).toEqual(0);
      expect(normalizeStderr(stderr, { ipv6: true })).toMatchSnapshot('stderr');
    });

    it('--no-static-watch', async () => {
      const { exitCode, stderr } = await testBin('--no-static-watch');

      expect(exitCode).toEqual(0);
      expect(normalizeStderr(stderr, { ipv6: true })).toMatchSnapshot('stderr');
    });
  });

  describe('watchFiles option', () => {
    it('--watch-files <value>', async () => {
      const watchDirectory = path.resolve(
        __dirname,
        '../fixtures/static/static'
      );

      const { exitCode, stderr } = await testBin([
        '--watch-files',
        watchDirectory,
      ]);

      expect(exitCode).toEqual(0);
      expect(normalizeStderr(stderr, { ipv6: true })).toMatchSnapshot('stderr');
    });

    it('--watch-files <value> --watch-files <other-value>', async () => {
      const watchDirectory = path.resolve(
        __dirname,
        '../fixtures/static/static'
      );
      const watchOtherDirectory = path.resolve(
        __dirname,
        '../fixtures/static/simple-config'
      );

      const { exitCode, stderr } = await testBin([
        '--watch-files',
        watchDirectory,
        '--watch-files',
        watchOtherDirectory,
      ]);

      expect(exitCode).toEqual(0);
      expect(normalizeStderr(stderr, { ipv6: true })).toMatchSnapshot('stderr');
    });

    it('--watch-files-reset', async () => {
      const watchDirectory = path.resolve(
        __dirname,
        '../fixtures/static/static'
      );

      const { exitCode, stderr } = await testBin([
        '--watch-files-reset',
        '--watch-files',
        watchDirectory,
      ]);

      expect(exitCode).toEqual(0);
      expect(normalizeStderr(stderr, { ipv6: true })).toMatchSnapshot('stderr');
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
    const examplePath = path.resolve(
      __dirname,
      '../../examples/cli/web-socket-url'
    );
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
    const examplePath = path.resolve(
      __dirname,
      '../../examples/cli/web-socket-url'
    );
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
    const cp = execa('node', [cliPath, '--watch-options-stdin'], { cwd });

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

  it.skip('should use different random port when multiple instances are started on different processes', async () => {
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
      }
    });

    cp2.on('exit', () => {
      runtime.cp2.done = true;

      if (runtime.cp.done) {
        expect(runtime.cp.port !== runtime.cp2.port).toBe(true);
      }
    });
  });
});
