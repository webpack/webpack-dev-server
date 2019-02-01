'use strict';

/* eslint-disable
  array-bracket-spacing,
*/
const assert = require('assert');
const path = require('path');
const execa = require('execa');
const runDevServer = require('./helpers/run-webpack-dev-server');

const httpsCertificateDirectory = path.join(__dirname, 'fixtures/https-certificate');
const caPath = path.join(httpsCertificateDirectory, 'ca.pem');
const pfxPath = path.join(httpsCertificateDirectory, 'server.pfx');
const keyPath = path.join(httpsCertificateDirectory, 'server.key');
const certPath = path.join(httpsCertificateDirectory, 'server.crt');

describe('CLI', () => {
  it('--progress', (done) => {
    runDevServer('--progress')
      .then((output) => {
        assert(output.code === 0);
        assert(output.stderr.indexOf('0% compiling') >= 0);
        done();
      })
      .catch(done);
  }).timeout(18000);

  it('--https', (done) => {
    runDevServer('--https')
      .then((output) => {
        assert(output.code === 0);
        assert(output.stdout.indexOf('Project is running at') >= 0);
        done();
      })
      .catch(done);
  }).timeout(18000);

  it('--https --cacert --pfx --key --cert --pfx-passphrase', (done) => {
    runDevServer(`--https --cacert ${caPath} --pfx ${pfxPath} --key ${keyPath} --cert ${certPath} --pfx-passphrase webpack-dev-server`)
      .then((output) => {
        assert(output.code === 0);
        assert(output.stdout.indexOf('Project is running at') >= 0);
        done();
      })
      .catch(done);
  }).timeout(18000);

  it('should exit the process when SIGINT is detected', (done) => {
    const cliPath = path.resolve(__dirname, '../bin/webpack-dev-server.js');
    const examplePath = path.resolve(__dirname, '../examples/cli/public');

    const cp = execa('node', [ cliPath ], { cwd: examplePath });

    cp.stdout.on('data', (data) => {
      const bits = data.toString();

      if (/Compiled successfully/.test(bits)) {
        assert(cp.pid !== 0);
        cp.kill('SIGINT');
      }
    });

    cp.on('exit', () => {
      done();
    });
  }).timeout(18000);

  it('should exit the process when SIGINT is detected, even before the compilation is done', (done) => {
    const cliPath = path.resolve(__dirname, '../bin/webpack-dev-server.js');
    const examplePath = path.resolve(__dirname, '../examples/cli/public');

    const cp = execa('node', [ cliPath ], { cwd: examplePath });

    let killed = false;

    cp.stdout.on('data', () => {
      if (!killed) {
        assert(cp.pid !== 0);
        cp.kill('SIGINT');
      }
      killed = true;
    });

    cp.on('exit', () => {
      done();
    });
  }).timeout(18000);

  it('should use different random port when multiple instances are started on different processes', (done) => {
    const cliPath = path.resolve(__dirname, '../bin/webpack-dev-server.js');
    const examplePath = path.resolve(__dirname, '../examples/cli/public');

    const cp = execa('node', [ cliPath ], { cwd: examplePath });
    const cp2 = execa('node', [ cliPath ], { cwd: examplePath });

    const runtime = {
      cp: {
        port: null,
        done: false
      },
      cp2: {
        port: null,
        done: false
      }
    };

    cp.stdout.on('data', (data) => {
      const bits = data.toString();
      const portMatch = /Project is running at http:\/\/localhost:(\d*)\//.exec(bits);
      if (portMatch) {
        runtime.cp.port = portMatch[1];
      }
      if (/Compiled successfully/.test(bits)) {
        assert(cp.pid !== 0);
        cp.kill('SIGINT');
      }
    });
    cp2.stdout.on('data', (data) => {
      const bits = data.toString();
      const portMatch = /Project is running at http:\/\/localhost:(\d*)\//.exec(bits);
      if (portMatch) {
        runtime.cp2.port = portMatch[1];
      }
      if (/Compiled successfully/.test(bits)) {
        assert(cp.pid !== 0);
        cp2.kill('SIGINT');
      }
    });

    cp.on('exit', () => {
      runtime.cp.done = true;
      if (runtime.cp2.done) {
        assert(runtime.cp.port !== runtime.cp2.port);
        done();
      }
    });
    cp2.on('exit', () => {
      runtime.cp2.done = true;
      if (runtime.cp.done) {
        assert(runtime.cp.port !== runtime.cp2.port);
        done();
      }
    });
  }).timeout(18000);
});
