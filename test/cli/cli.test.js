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
          delete options.processor;
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
    (isMacOS ? it.skip : it)('should generate correct cli flags', (done) => {
      testBin('--help')
        .then((output) => {
          expect(stripAnsi(output.stdout)).toMatchSnapshot();
          done();
        })
        .catch(done);
    });
  });

  describe('hot option', () => {
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
  });

  describe('allowedHosts option', () => {
    it('--allowed-hosts auto', (done) => {
      testBin(['--allowed-hosts', 'auto'])
        .then((output) => {
          expect(output.exitCode).toEqual(0);
          done();
        })
        .catch(done);
    });

    it('--allowed-hosts all', (done) => {
      testBin(['--allowed-hosts', 'all'])
        .then((output) => {
          expect(output.exitCode).toEqual(0);
          done();
        })
        .catch(done);
    });

    it('--allowed-hosts string', (done) => {
      testBin(['--allowed-hosts', 'testhost.com'])
        .then((output) => {
          expect(output.exitCode).toEqual(0);
          done();
        })
        .catch(done);
    });

    it('--allowed-hosts multiple', (done) => {
      testBin([
        '--allowed-hosts',
        'testhost.com',
        '--allowed-hosts',
        'testhost1.com',
      ])
        .then((output) => {
          expect(output.exitCode).toEqual(0);
          done();
        })
        .catch(done);
    });
  });

  describe('bonjour option', () => {
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
  });

  describe('client option', () => {
    it('--client-transport sockjs', (done) => {
      testBin('--client-transport sockjs')
        .then((output) => {
          expect(output.exitCode).toEqual(0);
          done();
        })
        .catch(done);
    });

    it('--client-transport ws', (done) => {
      testBin('--client-transport ws')
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

    it('--client-overlay-errors', (done) => {
      testBin('--client-overlay-errors')
        .then((output) => {
          expect(output.exitCode).toEqual(0);
          done();
        })
        .catch(done);
    });

    it('--no-client-overlay-errors', (done) => {
      testBin('--no-client-overlay-errors')
        .then((output) => {
          expect(output.exitCode).toEqual(0);
          done();
        })
        .catch(done);
    });

    it('--client-overlay-warnings', (done) => {
      testBin('--client-overlay-warnings')
        .then((output) => {
          expect(output.exitCode).toEqual(0);
          done();
        })
        .catch(done);
    });

    it('--no-client-overlay-warnings', (done) => {
      testBin('--no-client-overlay-warnings')
        .then((output) => {
          expect(output.exitCode).toEqual(0);
          done();
        })
        .catch(done);
    });

    it('--client-need-client-entry', (done) => {
      testBin('--client-need-client-entry --stats=detailed')
        .then((output) => {
          expect(output.exitCode).toEqual(0);
          expect(output.stdout).toContain('client/index.js');

          done();
        })
        .catch(done);
    });

    it('--no-client-need-client-entry', (done) => {
      testBin('--no-client-need-client-entry --stats=detailed')
        .then((output) => {
          expect(output.exitCode).toEqual(0);
          expect(output.stdout).not.toContain('client/index.js');

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

    it('--client-web-socket-url', (done) => {
      testBin('--client-web-socket-url ws://myhost.com:8080/foo/test')
        .then((output) => {
          expect(output.exitCode).toEqual(0);
          done();
        })
        .catch(done);
    });

    it('--client-web-socket-url-protocol', (done) => {
      testBin('--client-web-socket-url-protocol ws:')
        .then((output) => {
          expect(output.exitCode).toEqual(0);
          done();
        })
        .catch(done);
    });

    it('--client-web-socket-url-host', (done) => {
      testBin('--client-web-socket-url-host 0.0.0.0')
        .then((output) => {
          expect(output.exitCode).toEqual(0);
          done();
        })
        .catch(done);
    });

    it('--client-web-socket-url-path', (done) => {
      testBin('--client-web-socket-url-path /ws')
        .then((output) => {
          expect(output.exitCode).toEqual(0);
          done();
        })
        .catch(done);
    });

    it('--client-web-socket-url-port', (done) => {
      testBin('--client-web-socket-url-port 8080')
        .then((output) => {
          expect(output.exitCode).toEqual(0);
          done();
        })
        .catch(done);
    });
  });

  describe('webSocketServer option', () => {
    it('--web-socket-server sockjs', (done) => {
      testBin('--web-socket-server sockjs')
        .then((output) => {
          expect(output.exitCode).toEqual(0);
          done();
        })
        .catch(done);
    });

    it('--web-socket-server ws', (done) => {
      testBin('--web-socket-server ws')
        .then((output) => {
          expect(output.exitCode).toEqual(0);
          done();
        })
        .catch(done);
    });

    it('--web-socket-server-type sockjs', (done) => {
      testBin('--web-socket-server-type sockjs')
        .then((output) => {
          expect(output.exitCode).toEqual(0);
          done();
        })
        .catch(done);
    });

    it('--web-socket-server-type ws', (done) => {
      testBin('--web-socket-server-type ws')
        .then((output) => {
          expect(output.exitCode).toEqual(0);
          done();
        })
        .catch(done);
    });
  });

  describe('http2 option', () => {
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
  });

  describe('https option', () => {
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
  });

  describe('historyApiFallback option', () => {
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
  });

  describe('host option', () => {
    it('--host 0.0.0.0 (IPv4)', (done) => {
      testBin('--host 0.0.0.0')
        .then((output) => {
          expect(output.exitCode).toEqual(0);
          expect(
            normalizeStderr(output.stderr, { ipv6: true })
          ).toMatchSnapshot('stderr');

          done();
        })
        .catch(done);
    });

    it('--host :: (IPv6)', (done) => {
      testBin('--host ::')
        .then((output) => {
          expect(output.exitCode).toEqual(0);
          expect(
            normalizeStderr(output.stderr, { ipv6: true })
          ).toMatchSnapshot('stderr');

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
  });

  describe('port option', () => {
    it('--port is string', (done) => {
      testBin(`--port "8080"`)
        .then((output) => {
          expect(output.exitCode).toEqual(0);
          expect(
            normalizeStderr(output.stderr, { ipv6: true })
          ).toMatchSnapshot('stderr');

          done();
        })
        .catch(done);
    });

    it(`--port is auto`, (done) => {
      testBin(`--port auto`)
        .then((output) => {
          expect(output.exitCode).toEqual(0);
          expect(
            normalizeStderr(output.stderr, { ipv6: true })
          ).toMatchSnapshot('stderr');

          done();
        })
        .catch(done);
    });
  });

  describe('host and port options', () => {
    it('--host and --port are unspecified', (done) => {
      testBin('')
        .then((output) => {
          expect(output.exitCode).toEqual(0);
          expect(
            normalizeStderr(output.stderr, { ipv6: true })
          ).toMatchSnapshot('stderr');

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
  });

  describe('liveReload option', () => {
    it('--live-reload', (done) => {
      testBin('--live-reload')
        .then((output) => {
          expect(output.exitCode).toEqual(0);
          done();
        })
        .catch(done);
    });

    it('--no-live-reload', (done) => {
      testBin('--no-live-reload')
        .then((output) => {
          expect(output.exitCode).toEqual(0);
          done();
        })
        .catch(done);
    });
  });

  describe('open option', () => {
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

    it('--open-reset', (done) => {
      testBin('--open-reset --open /third.html')
        .then((output) => {
          expect(output.exitCode).toEqual(0);
          done();
        })
        .catch(done);
    });

    it('--open-reset --open-target', (done) => {
      testBin('--open-reset --open-target')
        .then((output) => {
          expect(output.exitCode).toEqual(0);
          done();
        })
        .catch(done);
    });

    it('--open-reset --open-target <value>', (done) => {
      testBin('--open-reset --open-target /third.html')
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

    it('--open-app-name google-chrome', (done) => {
      testBin('--open-app-name google-chrome')
        .then((output) => {
          expect(output.exitCode).toEqual(0);
          done();
        })
        .catch(done);
    });

    it('--open-app-name-reset', (done) => {
      testBin('--open-app-name-reset --open-app-name firefox')
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

    it('--open-target-reset', (done) => {
      testBin('--open-target-reset --open-target first.html')
        .then((output) => {
          expect(output.exitCode).toEqual(0);
          done();
        })
        .catch(done);
    });

    it(' --open --open-target index.html', (done) => {
      testBin('--open --open-target index.html')
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

    it('--open-target /index.html --open-app-name google-chrome', (done) => {
      testBin('--open-target /index.html --open-app-name google-chrome')
        .then((output) => {
          expect(output.exitCode).toEqual(0);
          done();
        })
        .catch(done);
    });

    it('--open --open-target /index.html --open-app google-chrome', (done) => {
      testBin('--open --open-target /index.html --open-app google-chrome')
        .then((output) => {
          expect(output.exitCode).toEqual(0);
          done();
        })
        .catch(done);
    });

    it('--open --open-target /index.html --open-app google-chrome --open-app-name google-chrome', (done) => {
      testBin(
        '--open --open-target /index.html --open-app google-chrome --open-app-name google-chrome'
      )
        .then((output) => {
          expect(output.exitCode).toEqual(0);
          done();
        })
        .catch(done);
    });
  });

  describe('compress option', () => {
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
  });

  describe('static option', () => {
    it('--static', (done) => {
      testBin('--static')
        .then((output) => {
          expect(output.exitCode).toEqual(0);
          expect(
            normalizeStderr(output.stderr, { ipv6: true })
          ).toMatchSnapshot('stderr');
          done();
        })
        .catch(done);
    });

    it('--static <value>', (done) => {
      testBin('--static new-static')
        .then((output) => {
          expect(output.exitCode).toEqual(0);
          expect(
            normalizeStderr(output.stderr, { ipv6: true })
          ).toMatchSnapshot('stderr');
          done();
        })
        .catch(done);
    });

    it('--static <value> --static <other-value>', (done) => {
      testBin('--static new-static --static other-static')
        .then((output) => {
          expect(output.exitCode).toEqual(0);
          expect(
            normalizeStderr(output.stderr, { ipv6: true })
          ).toMatchSnapshot('stderr');
          done();
        })
        .catch(done);
    });

    it('--static-reset', (done) => {
      testBin('--static-reset --static new-static-after-reset')
        .then((output) => {
          expect(output.exitCode).toEqual(0);
          expect(
            normalizeStderr(output.stderr, { ipv6: true })
          ).toMatchSnapshot('stderr');
          done();
        })
        .catch(done);
    });

    it('--static-reset --static-directory <value>', (done) => {
      testBin('--static-reset --static-directory new-static-directory')
        .then((output) => {
          expect(output.exitCode).toEqual(0);
          expect(
            normalizeStderr(output.stderr, { ipv6: true })
          ).toMatchSnapshot('stderr');
          done();
        })
        .catch(done);
    });

    it('--static-directory', (done) => {
      testBin('--static-directory static-dir')
        .then((output) => {
          expect(output.exitCode).toEqual(0);
          expect(
            normalizeStderr(output.stderr, { ipv6: true })
          ).toMatchSnapshot('stderr');
          done();
        })
        .catch(done);
    });

    it('--static --static-directory', (done) => {
      testBin('--static --static-directory static-dir')
        .then((output) => {
          expect(output.exitCode).toEqual(0);
          expect(
            normalizeStderr(output.stderr, { ipv6: true })
          ).toMatchSnapshot('stderr');
          done();
        })
        .catch(done);
    });

    it('--static-public-path', (done) => {
      testBin('--static-public-path /public')
        .then((output) => {
          expect(output.exitCode).toEqual(0);
          expect(
            normalizeStderr(output.stderr, { ipv6: true })
          ).toMatchSnapshot('stderr');
          done();
        })
        .catch(done);
    });

    it('--static-public-path-reset', (done) => {
      testBin('--static-public-path-reset --static-public-path /new-public')
        .then((output) => {
          expect(output.exitCode).toEqual(0);
          expect(
            normalizeStderr(output.stderr, { ipv6: true })
          ).toMatchSnapshot('stderr');
          done();
        })
        .catch(done);
    });

    it('--static-serve-index', (done) => {
      testBin('--static-serve-index')
        .then((output) => {
          expect(output.exitCode).toEqual(0);
          expect(
            normalizeStderr(output.stderr, { ipv6: true })
          ).toMatchSnapshot('stderr');
          done();
        })
        .catch(done);
    });

    it('--no-static-serve-index', (done) => {
      testBin('--no-static-serve-index')
        .then((output) => {
          expect(output.exitCode).toEqual(0);
          expect(
            normalizeStderr(output.stderr, { ipv6: true })
          ).toMatchSnapshot('stderr');
          done();
        })
        .catch(done);
    });

    it('--static-watch', (done) => {
      testBin('--static-watch')
        .then((output) => {
          expect(output.exitCode).toEqual(0);
          expect(
            normalizeStderr(output.stderr, { ipv6: true })
          ).toMatchSnapshot('stderr');
          done();
        })
        .catch(done);
    });

    it('--no-static-watch', (done) => {
      testBin('--static-watch')
        .then((output) => {
          expect(output.exitCode).toEqual(0);
          expect(
            normalizeStderr(output.stderr, { ipv6: true })
          ).toMatchSnapshot('stderr');
          done();
        })
        .catch(done);
    });
  });

  describe('watchFiles option', () => {
    it('--watch-files <value>', (done) => {
      const watchDirectory = path.resolve(
        __dirname,
        '../fixtures/static/static'
      );

      testBin(`--watch-files ${watchDirectory}`)
        .then((output) => {
          expect(output.exitCode).toEqual(0);
          expect(
            normalizeStderr(output.stderr, { ipv6: true })
          ).toMatchSnapshot('stderr');
          done();
        })
        .catch(done);
    });

    it('--watch-files <value> --watch-files <other-value>', (done) => {
      const watchDirectory = path.resolve(
        __dirname,
        '../fixtures/static/static'
      );
      const watchOtherDirectory = path.resolve(
        __dirname,
        '../fixtures/static/simple-config'
      );

      testBin(
        `--watch-files ${watchDirectory} --watch-files ${watchOtherDirectory}`
      )
        .then((output) => {
          expect(output.exitCode).toEqual(0);
          expect(
            normalizeStderr(output.stderr, { ipv6: true })
          ).toMatchSnapshot('stderr');
          done();
        })
        .catch(done);
    });

    it('--watch-files-reset', (done) => {
      const watchDirectory = path.resolve(
        __dirname,
        '../fixtures/static/static'
      );

      testBin(`--watch-files-reset --watch-files ${watchDirectory}`)
        .then((output) => {
          expect(output.exitCode).toEqual(0);
          expect(
            normalizeStderr(output.stderr, { ipv6: true })
          ).toMatchSnapshot('stderr');
          done();
        })
        .catch(done);
    });

    it('--watch-files-reset --watch-files-paths <value>', (done) => {
      const watchDirectory = path.resolve(
        __dirname,
        '../fixtures/static/static'
      );

      testBin(`--watch-files-reset --watch-files-paths ${watchDirectory}`)
        .then((output) => {
          expect(output.exitCode).toEqual(0);
          expect(
            normalizeStderr(output.stderr, { ipv6: true })
          ).toMatchSnapshot('stderr');
          done();
        })
        .catch(done);
    });

    it('--watch-files-paths', (done) => {
      const watchDirectory = path.resolve(
        __dirname,
        '../fixtures/static/static'
      );

      testBin(`--watch-files-paths ${watchDirectory}`)
        .then((output) => {
          expect(output.exitCode).toEqual(0);
          expect(
            normalizeStderr(output.stderr, { ipv6: true })
          ).toMatchSnapshot('stderr');
          done();
        })
        .catch(done);
    });

    it('--watch-files-paths-reset', (done) => {
      const watchDirectory = path.resolve(
        __dirname,
        '../fixtures/static/static'
      );

      testBin(`--watch-files-paths-reset --watch-files-paths ${watchDirectory}`)
        .then((output) => {
          expect(output.exitCode).toEqual(0);
          expect(
            normalizeStderr(output.stderr, { ipv6: true })
          ).toMatchSnapshot('stderr');
          done();
        })
        .catch(done);
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
