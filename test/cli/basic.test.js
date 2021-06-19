'use strict';

const path = require('path');
const webpack = require('webpack');
const execa = require('execa');
const stripAnsi = require('strip-ansi');
const schema = require('../../lib/options.json');
const cliOptions = require('../../bin/cli-flags');
const { testBin, normalizeStderr } = require('../helpers/test-bin');
const isWebpack5 = require('../helpers/isWebpack5');
const port = require('../ports-map')['cli-basic'];

const isMacOS = process.platform === 'darwin';
const webpack5Test = isWebpack5 ? it : it.skip;

describe('basic', () => {
  describe('should validate CLI options', () => {
    webpack5Test('should be same as in schema', () => {
      const cliOptionsFromWebpack = webpack.cli.getArguments(schema);

      const normalizedCliOptions = {};

      for (const [name, options] of Object.entries(cliOptions)) {
        // Only webpack-cli supports it
        // TODO send PR to webpack
        delete options.negatedDescription;

        normalizedCliOptions[name] = options;
      }

      expect(normalizedCliOptions).toStrictEqual(cliOptionsFromWebpack);
    });
  });

  describe('should output help', () => {
    (isMacOS ? it.skip : it)('should generate correct cli flags', async () => {
      const { exitCode, stdout } = await testBin(['--help']);

      expect(exitCode).toBe(0);
      expect(stripAnsi(stdout)).toMatchSnapshot();
    });
  });

  describe('basic', () => {
    it('should work', async () => {
      const { exitCode, stderr } = await testBin('');

      expect(exitCode).toEqual(0);
      expect(normalizeStderr(stderr, { ipv6: true })).toMatchSnapshot('stderr');
    });

    it('should work using "--host localhost --port <port>"', async () => {
      const { exitCode, stderr } = await testBin([
        '--host',
        'localhost',
        '--port',
        port,
      ]);

      expect(exitCode).toEqual(0);
      expect(normalizeStderr(stderr)).toMatchSnapshot('stderr');
    });

    it('should accept the promise function of webpack.config.js', async () => {
      try {
        const { exitCode } = await testBin(
          false,
          path.resolve(
            __dirname,
            '../fixtures/promise-config/webpack.config.js'
          )
        );
        expect(exitCode).toEqual(0);
      } catch (err) {
        // for windows
        expect(err.stdout).toContain('main.js');
      }
    });

    it('should exit the process when SIGINT is detected', (done) => {
      const cliPath = path.resolve(
        __dirname,
        '../../bin/webpack-dev-server.js'
      );
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
      const cliPath = path.resolve(
        __dirname,
        '../../bin/webpack-dev-server.js'
      );
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
      const cliPath = path.resolve(
        __dirname,
        '../../bin/webpack-dev-server.js'
      );
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
      const cliPath = path.resolve(
        __dirname,
        '../../bin/webpack-dev-server.js'
      );
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

    it('should add dev server entry points to a single entry point', async () => {
      const { exitCode, stdout } = await testBin(
        null,
        './test/fixtures/dev-server/default-config.js'
      );

      expect(exitCode).toEqual(0);
      expect(stdout).toContain('client/index.js?');
    });

    webpack5Test(
      'should add dev server entry points to a multi entry point object',
      async () => {
        const { exitCode, stdout } = await testBin(
          '--stats=verbose',
          './test/fixtures/dev-server/multi-entry.js'
        );

        expect(exitCode).toEqual(0);
        expect(stdout).toContain('client/index.js?');
        expect(stdout).toContain('foo.js');
      }
    );

    webpack5Test(
      'should add dev server entry points to an empty entry object',
      async () => {
        const { exitCode, stdout } = await testBin(
          null,
          './test/fixtures/dev-server/empty-entry.js'
        );

        expect(exitCode).toEqual(0);
        expect(stdout).toContain('client/index.js?');
      }
    );

    webpack5Test('should supports entry as descriptor', async () => {
      const { exitCode, stdout } = await testBin(
        '--stats=detailed',
        './test/fixtures/entry-as-descriptor/webpack.config'
      );

      expect(exitCode).toEqual(0);
      expect(stdout).toContain('foo.js');
    });

    it('should only prepends dev server entry points to "web" target', async () => {
      const { exitCode, stdout } = await testBin(
        '--target web',
        './test/fixtures/dev-server/default-config.js'
      );

      expect(exitCode).toEqual(0);
      expect(stdout).toContain('client/index.js?');
      expect(stdout).toContain('foo.js');
    });

    it('should not prepend dev server entry points to "node" target', async () => {
      const { exitCode, stdout } = await testBin(
        '--target node',
        './test/fixtures/dev-server/default-config.js'
      );

      expect(exitCode).toEqual(0);
      expect(stdout).not.toContain('client/index.js?');
      expect(stdout).toContain('foo.js');
    });

    it('should prepends the hot runtime to "node" target as well', async () => {
      const { exitCode, stdout } = await testBin(
        '--target node --hot',
        './test/fixtures/dev-server/default-config.js'
      );

      expect(exitCode).toEqual(0);
      expect(stdout).toContain('webpack/hot/dev-server');
    });

    webpack5Test(
      'should prepend dev server entry points depending on targetProperties',
      async () => {
        const { exitCode, stdout } = await testBin(
          null,
          './test/fixtures/dev-server/target-config.js'
        );

        expect(exitCode).toEqual(0);
        expect(stdout).toContain('client/index.js');
      }
    );

    it.skip('should use different random port when multiple instances are started on different processes', async () => {
      const cliPath = path.resolve(
        __dirname,
        '../../bin/webpack-dev-server.js'
      );
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
        const portMatch =
          /Project is running at http:\/\/localhost:(\d*)\//.exec(bits);

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
        const portMatch =
          /Project is running at http:\/\/localhost:(\d*)\//.exec(bits);

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
});
