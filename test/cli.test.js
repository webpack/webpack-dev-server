'use strict';

/* eslint-disable
  array-bracket-spacing,
*/
const path = require('path');
const execa = require('execa');
const runDevServer = require('./helpers/run-webpack-dev-server');

const httpsCertificateDirectory = path.join(
  __dirname,
  'fixtures/https-certificate'
);
const caPath = path.join(httpsCertificateDirectory, 'ca.pem');
const pfxPath = path.join(httpsCertificateDirectory, 'server.pfx');
const keyPath = path.join(httpsCertificateDirectory, 'server.key');
const certPath = path.join(httpsCertificateDirectory, 'server.crt');

describe('CLI', () => {
  it('--progress', (done) => {
    runDevServer('--progress')
      .then((output) => {
        expect(output.code).toEqual(0);
        expect(output.stderr.indexOf('0% compiling') >= 0).toBe(true);
        done();
      })
      .catch(done);
  });

  it('--bonjour', (done) => {
    runDevServer('--bonjour')
      .then((output) => {
        expect(output.code).toEqual(0);
        expect(output.stdout.indexOf('Bonjour') >= 0).toBe(true);
        done();
      })
      .catch(done);
  });

  it('--https', (done) => {
    runDevServer('--https')
      .then((output) => {
        expect(output.code).toEqual(0);
        expect(output.stdout.indexOf('Project is running at') >= 0).toBe(true);
        done();
      })
      .catch(done);
  });

  it('--https --cacert --pfx --key --cert --pfx-passphrase', (done) => {
    runDevServer(
      `--https --cacert ${caPath} --pfx ${pfxPath} --key ${keyPath} --cert ${certPath} --pfx-passphrase webpack-dev-server`
    )
      .then((output) => {
        expect(output.code).toEqual(0);
        expect(output.stdout.indexOf('Project is running at') >= 0).toBe(true);
        done();
      })
      .catch(done);
  });

  it('should exit the process when SIGINT is detected', (done) => {
    const cliPath = path.resolve(__dirname, '../bin/webpack-dev-server.js');
    const examplePath = path.resolve(__dirname, '../examples/cli/public');
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
    const cliPath = path.resolve(__dirname, '../bin/webpack-dev-server.js');
    const examplePath = path.resolve(__dirname, '../examples/cli/public');
    const cp = execa('node', [cliPath], { cwd: examplePath });
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
});
