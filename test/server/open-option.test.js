'use strict';

const internalIp = require('internal-ip');
const webpack = require('webpack');
const open = require('open');
const Server = require('../../lib/Server');
const config = require('../fixtures/simple-config/webpack.config');
const port = require('../ports-map')['open-option'];

jest.mock('open');

open.mockImplementation(() => {
  return {
    catch: jest.fn(),
  };
});

const internalIPv4 = internalIp.v4.sync();
// const internalIPv6 = internalIp.v6.sync();

describe('"open" option', () => {
  afterEach(() => {
    open.mockClear();
  });

  it('should work with unspecified host', (done) => {
    const compiler = webpack(config);
    const server = new Server(compiler, {
      open: true,
      port,
      static: false,
    });

    compiler.hooks.done.tap('webpack-dev-server', () => {
      server.close(() => {
        expect(open).toHaveBeenCalledWith('http://localhost:8117/', {
          wait: false,
        });

        done();
      });
    });

    compiler.run(() => {});
    server.listen(port);
  });

  it('should work with "0.0.0.0" host', (done) => {
    const compiler = webpack(config);
    const server = new Server(compiler, {
      open: true,
      port,
      static: false,
    });

    compiler.hooks.done.tap('webpack-dev-server', () => {
      server.close(() => {
        expect(open).toHaveBeenCalledWith('http://0.0.0.0:8117/', {
          wait: false,
        });

        done();
      });
    });

    compiler.run(() => {});
    server.listen(port, '0.0.0.0');
  });

  it('should work with "::" host', (done) => {
    const compiler = webpack(config);
    const server = new Server(compiler, {
      open: true,
      port,
      static: false,
    });

    compiler.hooks.done.tap('webpack-dev-server', () => {
      server.close(() => {
        expect(open).toHaveBeenCalledWith('http://[::]:8117/', {
          wait: false,
        });

        done();
      });
    });

    compiler.run(() => {});
    server.listen(port, '::');
  });

  it('should work with "localhost" host', (done) => {
    const compiler = webpack(config);
    const server = new Server(compiler, {
      open: true,
      port,
      static: false,
    });

    compiler.hooks.done.tap('webpack-dev-server', () => {
      server.close(() => {
        expect(open).toHaveBeenCalledWith('http://localhost:8117/', {
          wait: false,
        });

        done();
      });
    });

    compiler.run(() => {});
    server.listen(port, 'localhost');
  });

  it('should work with "127.0.0.1" host', (done) => {
    const compiler = webpack(config);
    const server = new Server(compiler, {
      open: true,
      port,
      static: false,
    });

    compiler.hooks.done.tap('webpack-dev-server', () => {
      server.close(() => {
        expect(open).toHaveBeenCalledWith('http://127.0.0.1:8117/', {
          wait: false,
        });

        done();
      });
    });

    compiler.run(() => {});
    server.listen(port, '127.0.0.1');
  });

  it('should work with "::1" host', (done) => {
    const compiler = webpack(config);
    const server = new Server(compiler, {
      open: true,
      port,
      static: false,
    });

    compiler.hooks.done.tap('webpack-dev-server', () => {
      server.close(() => {
        expect(open).toHaveBeenCalledWith('http://[::1]:8117/', {
          wait: false,
        });

        done();
      });
    });

    compiler.run(() => {});
    server.listen(port, '::1');
  });

  it(`should work with "${internalIPv4}" host`, (done) => {
    const compiler = webpack(config);
    const server = new Server(compiler, {
      open: true,
      port,
      static: false,
    });

    compiler.hooks.done.tap('webpack-dev-server', () => {
      server.close(() => {
        expect(open).toHaveBeenCalledWith(`http://${internalIPv4}:8117/`, {
          wait: false,
        });

        done();
      });
    });

    compiler.run(() => {});
    server.listen(port, internalIPv4);
  });

  // TODO need improve
  // if (internalIPv6) {
  //   it(`should work with "${internalIPv6}" host`, (done) => {
  //     const compiler = webpack(config);
  //     const server = new Server(compiler, {
  //       open: true,
  //       port,
  //       static: false,
  //     });
  //
  //     compiler.hooks.done.tap('webpack-dev-server', () => {
  //       server.close(() => {
  //         expect(open).toHaveBeenCalledWith(`http://[${internalIPv6}]:8117/`, {
  //           wait: false,
  //         });
  //
  //         done();
  //       });
  //     });
  //
  //     compiler.run(() => {});
  //     server.listen(port, internalIPv6);
  //   });
  // }

  it.only('should work with unspecified the `open` option and specified the `openTarget` option', (done) => {
    const compiler = webpack(config);
    const server = new Server(compiler, {
      open: {
        target: 'index.html'
      },
      port,
      static: false,
    });

    compiler.hooks.done.tap('webpack-dev-server', () => {
      server.close(() => {
        expect(open).toHaveBeenCalledWith('http://localhost:8117/index.html', {
          wait: false,
        });

        done();
      });
    });

    compiler.run(() => {});
    server.listen(port, 'localhost');
  });
});
