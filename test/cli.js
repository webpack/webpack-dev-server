'use strict';

/* eslint import/no-extraneous-dependencies: off */

const assert = require('assert');
const path = require('path');
const execa = require('execa');
// const wtf = require('wtfnode');

function exec(flags, done) {
  flags = flags || [];
  const cliPath = path.resolve(__dirname, '../cli.js');
  const examplePath = path.resolve(__dirname, '../examples/cli/public');
  const nodePath = execa.shellSync('which node').stdout;

  const proc = execa(nodePath, [cliPath].concat(flags), { cwd: examplePath });

  process.on('unhandledRejection', (reason, p) => {
    throw new Error(`Unhandled Rejection at: ${p}, 'reason: ${reason}`);
  });

  proc.on('exit', (code) => {
    if (code !== 0) {
      throw new Error(`Process exited with code: ${code}`);
    }
    done && done(); // eslint-disable-line no-unused-expressions
  });

  return proc;
}

// keeping here in case we need to debug a hung process
// setTimeout(() => {
//   wtf.dump();
// }, 10000);

describe('CLI', () => {
  // TODO - how do we test this?
  // describe('--allowed-hosts', () => {
  //
  // });

  describe('--bonjour', () => {
    const bonjour = require('bonjour')(); // eslint-disable-line global-require

    it('should detect a bonjour service', (done) => {
      const proc = exec(['--bonjour'], done);

      const browser = bonjour.find({ type: 'http' }, (service) => {
        assert(service.name, 'Webpack Dev Server');
        bonjour.destroy();
        browser.stop();
        proc.kill('SIGINT');
      });
    }).timeout(4000);
  });

  // describe('--cacert', () => {
  //
  // });
  //
  // describe('--cert', () => {
  //
  // });
  //
  // describe('--client-log-level', () => {
  //
  // });
  //
  // describe('--color', () => {
  //
  // });
  //
  // describe('--compress', () => {
  //
  // });
  //
  // describe('--content-base', () => {
  //
  // });
  //
  // describe('--disable-host-check', () => {
  //
  // });
  //
  // describe('--history-api-fallback', () => {
  //
  // });
  //
  // describe('--host', () => {
  //
  // });
  //
  // describe('--hot-only', () => {
  //
  // });
  //
  // describe('--https', () => {
  //
  // });
  //
  // describe('--info', () => {
  //
  // });
  //
  // describe('--inline', () => {
  //
  // });
  //
  // describe('--key', () => {
  //
  // });
  //
  // describe('--lazy', () => {
  //
  // });
  //
  // describe('--logLevel', () => {
  //
  // });
  //
  // describe('--open', () => {
  //
  // });
  //
  // describe('--open-page', () => {
  //
  // });
  //
  // describe('--pfx', () => {
  //
  // });
  //
  // describe('--pfx-passphrase', () => {
  //
  // });
  //
  // describe('--port', () => {
  //
  // });
  //
  // describe('--progress', () => {
  //
  // });
  //
  // describe('--public', () => {
  //
  // });
  //
  // describe('--quiet', () => {
  //
  // });
  //
  // describe('--socket', () => {
  //
  // });
  //
  // describe('--stdin', () => {
  //
  // });
  //
  // describe('--useLocalIp', () => {
  //
  // });
  //
  // describe('--watch-content-base', () => {
  //
  // });

  describe('SIGINT', () => {
    it('should exit the process when SIGINT is detected', (done) => {
      const cliPath = path.resolve(__dirname, '../cli.js');
      const examplePath = path.resolve(__dirname, '../examples/cli/default');
      const nodePath = execa.shellSync('which node').stdout;

      const proc = execa(nodePath, [cliPath], { cwd: examplePath });

      proc.stdout.on('data', (data) => {
        const bits = data.toString();

        if (/Compiled successfully/.test(bits)) {
          assert(proc.pid !== 0);
          proc.kill('SIGINT');
        }
      });

      process.on('unhandledRejection', (reason, p) => {
        throw new Error(`Unhandled Rejection at: ${p}, 'reason: ${reason}`);
      });

      proc.on('exit', (code) => {
        if (code !== 0) {
          throw new Error(`Process exited with code: ${code}`);
        }
        done();
      });
    }).timeout(4000);
  });
});
