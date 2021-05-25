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

const createServer = (compiler, options) => new Server(options, compiler);

describe('"open" option', () => {
  afterEach(() => {
    open.mockClear();
  });

  it('should work with unspecified host', (done) => {
    const compiler = webpack(config);
    const server = createServer(compiler, {
      open: true,
      port,
      static: false,
    });

    compiler.hooks.done.tap('webpack-dev-server', () => {
      server.close(() => {
        expect(open).toHaveBeenCalledWith(`http://localhost:${port}/`, {
          wait: false,
        });

        done();
      });
    });

    compiler.run(() => {});
    server.listen(port);
  });

  it("should work with the 'https' option", (done) => {
    const compiler = webpack(config);
    const server = createServer(compiler, {
      open: true,
      port,
      https: true,
      static: false,
    });

    compiler.hooks.done.tap('webpack-dev-server', () => {
      server.close(() => {
        expect(open).toHaveBeenCalledWith(`https://localhost:${port}/`, {
          wait: false,
        });

        done();
      });
    });

    compiler.run(() => {});
    server.listen(port);
  });

  it("should work with '0.0.0.0' host", (done) => {
    const compiler = webpack(config);
    const host = '0.0.0.0';
    const server = createServer(compiler, {
      host,
      port,
      open: true,
      static: false,
    });

    compiler.hooks.done.tap('webpack-dev-server', () => {
      server.close(() => {
        expect(open).toHaveBeenCalledWith(`http://${host}:${port}/`, {
          wait: false,
        });

        done();
      });
    });

    compiler.run(() => {});
    server.listen(port, host);
  });

  it("should work with '::' host", (done) => {
    const compiler = webpack(config);
    const host = '::';
    const server = createServer(compiler, {
      host,
      port,
      open: true,
      static: false,
    });

    compiler.hooks.done.tap('webpack-dev-server', () => {
      server.close(() => {
        expect(open).toHaveBeenCalledWith(`http://[${host}]:${port}/`, {
          wait: false,
        });

        done();
      });
    });

    compiler.run(() => {});
    server.listen(port, host);
  });

  it("should work with 'localhost' host", (done) => {
    const compiler = webpack(config);
    const host = 'localhost';
    const server = createServer(compiler, {
      host,
      port,
      open: true,
      static: false,
    });

    compiler.hooks.done.tap('webpack-dev-server', () => {
      server.close(() => {
        expect(open).toHaveBeenCalledWith(`http://${host}:${port}/`, {
          wait: false,
        });

        done();
      });
    });

    compiler.run(() => {});
    server.listen(port, host);
  });

  it("should work with '127.0.0.1' host", (done) => {
    const compiler = webpack(config);
    const host = '127.0.0.1';
    const server = createServer(compiler, {
      host,
      port,
      open: true,
      static: false,
    });

    compiler.hooks.done.tap('webpack-dev-server', () => {
      server.close(() => {
        expect(open).toHaveBeenCalledWith(`http://${host}:${port}/`, {
          wait: false,
        });

        done();
      });
    });

    compiler.run(() => {});
    server.listen(port, host);
  });

  it("should work with '::1' host", (done) => {
    const compiler = webpack(config);
    const host = '::1';
    const server = createServer(compiler, {
      host,
      port,
      open: true,
      static: false,
    });

    compiler.hooks.done.tap('webpack-dev-server', () => {
      server.close(() => {
        expect(open).toHaveBeenCalledWith(`http://[${host}]:${port}/`, {
          wait: false,
        });

        done();
      });
    });

    compiler.run(() => {});
    server.listen(port, host);
  });

  it(`should work with '${internalIPv4}' host`, (done) => {
    const compiler = webpack(config);
    const server = createServer(compiler, {
      host: internalIPv4,
      port,
      open: true,
      static: false,
    });

    compiler.hooks.done.tap('webpack-dev-server', () => {
      server.close(() => {
        expect(open).toHaveBeenCalledWith(`http://${internalIPv4}:${port}/`, {
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
  //   it(`should work with '${internalIPv6}' host`, (done) => {
  //     const compiler = webpack(config);
  //     const server = createServer(compiler, {
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

  it('should work with boolean', (done) => {
    const compiler = webpack(config);
    const host = 'localhost';
    const server = createServer(compiler, {
      host,
      port,
      open: true,
      static: false,
    });

    compiler.hooks.done.tap('webpack-dev-server', () => {
      server.close(() => {
        expect(open).toHaveBeenCalledWith(`http://${host}:${port}/`, {
          wait: false,
        });

        done();
      });
    });

    compiler.run(() => {});
    server.listen(port, host);
  });

  it("should work with boolean but don't close with 'false' value", (done) => {
    const compiler = webpack(config);
    const host = 'localhost';
    const server = createServer(compiler, {
      host,
      port,
      open: false,
      static: false,
    });

    compiler.hooks.done.tap('webpack-dev-server', () => {
      server.close(() => {
        expect(open).not.toHaveBeenCalled();

        done();
      });
    });

    compiler.run(() => {});
    server.listen(port, host);
  });

  it('should work with relative string', (done) => {
    const compiler = webpack(config);
    const host = 'localhost';
    const server = createServer(compiler, {
      host,
      port,
      open: 'index.html',
      static: false,
    });

    compiler.hooks.done.tap('webpack-dev-server', () => {
      server.close(() => {
        expect(open).toHaveBeenCalledWith(`http://${host}:${port}/index.html`, {
          wait: false,
        });

        done();
      });
    });

    compiler.run(() => {});
    server.listen(port, host);
  });

  it('should work with relative string starting with "/"', (done) => {
    const compiler = webpack(config);
    const host = 'localhost';
    const server = createServer(compiler, {
      host,
      port,
      open: '/index.html',
      static: false,
    });

    compiler.hooks.done.tap('webpack-dev-server', () => {
      server.close(() => {
        expect(open).toHaveBeenCalledWith(`http://${host}:${port}/index.html`, {
          wait: false,
        });

        done();
      });
    });

    compiler.run(() => {});
    server.listen(port, host);
  });

  it('should work with absolute string', (done) => {
    const compiler = webpack(config);
    const host = 'localhost';
    const server = createServer(compiler, {
      open: `http://${host}:${port}/index.html`,
      port,
      host: 'localhost',
      static: false,
    });

    compiler.hooks.done.tap('webpack-dev-server', () => {
      server.close(() => {
        expect(open).toHaveBeenCalledWith(`http://${host}:${port}/index.html`, {
          wait: false,
        });

        done();
      });
    });

    compiler.run(() => {});
    server.listen(port, host);
  });

  it('should work with multiple relative strings', (done) => {
    const compiler = webpack(config);
    const host = 'localhost';
    const server = createServer(compiler, {
      host: 'localhost',
      port,
      open: ['first.html', 'second.html'],
      static: false,
    });

    compiler.hooks.done.tap('webpack-dev-server', () => {
      server.close(() => {
        expect(open).toHaveBeenNthCalledWith(
          1,
          `http://${host}:${port}/first.html`,
          {
            wait: false,
          }
        );
        expect(open).toHaveBeenNthCalledWith(
          2,
          `http://${host}:${port}/second.html`,
          {
            wait: false,
          }
        );

        done();
      });
    });

    compiler.run(() => {});
    server.listen(port, host);
  });

  it('should work with multiple absolute strings', (done) => {
    const compiler = webpack(config);
    const host = 'localhost';
    const server = createServer(compiler, {
      host: 'localhost',
      port,
      open: [
        `http://${host}:${port}/first.html`,
        `http://${host}:${port}/second.html`,
      ],
      static: false,
    });

    compiler.hooks.done.tap('webpack-dev-server', () => {
      server.close(() => {
        expect(open).toHaveBeenNthCalledWith(
          1,
          `http://${host}:${port}/first.html`,
          {
            wait: false,
          }
        );
        expect(open).toHaveBeenNthCalledWith(
          2,
          `http://${host}:${port}/second.html`,
          {
            wait: false,
          }
        );

        done();
      });
    });

    compiler.run(() => {});
    server.listen(port, host);
  });

  it('should work with empty object', (done) => {
    const compiler = webpack(config);
    const host = 'localhost';
    const server = createServer(compiler, {
      host,
      port,
      open: {},
      static: false,
    });

    compiler.hooks.done.tap('webpack-dev-server', () => {
      server.close(() => {
        expect(open).toHaveBeenCalledWith(`http://${host}:${port}/`, {
          wait: false,
        });

        done();
      });
    });

    compiler.run(() => {});
    server.listen(port, host);
  });

  it("should work with object and with the boolean value of 'target' option", (done) => {
    const compiler = webpack(config);
    const host = 'localhost';
    const server = createServer(compiler, {
      host,
      port,
      open: {
        target: true,
      },
      static: false,
    });

    compiler.hooks.done.tap('webpack-dev-server', () => {
      server.close(() => {
        expect(open).toHaveBeenCalledWith(`http://${host}:${port}/`, {
          wait: false,
        });

        done();
      });
    });

    compiler.run(() => {});
    server.listen(port, host);
  });

  it("should work with object and with the 'target' option", (done) => {
    const compiler = webpack(config);
    const host = 'localhost';
    const server = createServer(compiler, {
      host,
      port,
      open: {
        target: 'index.html',
      },
      static: false,
    });

    compiler.hooks.done.tap('webpack-dev-server', () => {
      server.close(() => {
        expect(open).toHaveBeenCalledWith(`http://${host}:${port}/index.html`, {
          wait: false,
        });

        done();
      });
    });

    compiler.run(() => {});
    server.listen(port, host);
  });

  it("should work with object and with multiple values of the 'target' option", (done) => {
    const compiler = webpack(config);
    const host = 'localhost';
    const server = createServer(compiler, {
      host,
      port,
      open: {
        target: ['first.html', 'second.html'],
      },
      static: false,
    });

    compiler.hooks.done.tap('webpack-dev-server', () => {
      server.close(() => {
        expect(open).toHaveBeenNthCalledWith(
          1,
          `http://${host}:${port}/first.html`,
          {
            wait: false,
          }
        );
        expect(open).toHaveBeenNthCalledWith(
          2,
          `http://${host}:${port}/second.html`,
          {
            wait: false,
          }
        );

        done();
      });
    });

    compiler.run(() => {});
    server.listen(port, host);
  });

  it("should work with object and with the 'app' option", (done) => {
    const compiler = webpack(config);
    const host = 'localhost';
    const server = createServer(compiler, {
      host,
      port,
      open: {
        app: 'google-chrome',
      },
      static: false,
    });

    compiler.hooks.done.tap('webpack-dev-server', () => {
      server.close(() => {
        expect(open).toHaveBeenCalledWith(`http://${host}:${port}/`, {
          app: { name: 'google-chrome' },
          wait: false,
        });

        done();
      });
    });

    compiler.run(() => {});
    server.listen(port, host);
  });

  it("should work with object and with the 'app' and 'arguments' options", (done) => {
    const compiler = webpack(config);
    const host = 'localhost';
    const server = createServer(compiler, {
      host,
      port,
      open: {
        app: { name: 'google-chrome', arguments: ['--incognito'] },
      },
      static: false,
    });

    compiler.hooks.done.tap('webpack-dev-server', () => {
      server.close(() => {
        expect(open).toHaveBeenCalledWith(`http://${host}:${port}/`, {
          app: { name: 'google-chrome', arguments: ['--incognito'] },
          wait: false,
        });

        done();
      });
    });

    compiler.run(() => {});
    server.listen(port, host);
  });

  it('should work with object with "target" and "app" options', (done) => {
    const compiler = webpack(config);
    const host = 'localhost';
    const server = createServer(compiler, {
      host,
      port,
      open: {
        target: 'index.html',
        app: 'google-chrome',
      },
      static: false,
    });

    compiler.hooks.done.tap('webpack-dev-server', () => {
      server.close(() => {
        expect(open).toHaveBeenCalledWith(`http://${host}:${port}/index.html`, {
          app: { name: 'google-chrome' },
          wait: false,
        });

        done();
      });
    });

    compiler.run(() => {});
    server.listen(port, host);
  });

  it("should work with object, with multiple value of the 'target' option and with the 'app' and 'arguments' options", (done) => {
    const compiler = webpack(config);
    const host = 'localhost';
    const server = createServer(compiler, {
      host,
      port,
      open: {
        target: ['first.html', 'second.html'],
        app: { name: 'google-chrome', arguments: ['--incognito'] },
      },
      static: false,
    });

    compiler.hooks.done.tap('webpack-dev-server', () => {
      server.close(() => {
        expect(open).toHaveBeenNthCalledWith(
          1,
          `http://${host}:${port}/first.html`,
          {
            wait: false,
            app: { name: 'google-chrome', arguments: ['--incognito'] },
          }
        );
        expect(open).toHaveBeenNthCalledWith(
          2,
          `http://${host}:${port}/second.html`,
          {
            wait: false,
            app: { name: 'google-chrome', arguments: ['--incognito'] },
          }
        );

        done();
      });
    });

    compiler.run(() => {});
    server.listen(port, host);
  });

  it("should work with object, with multiple value of the 'target' option (relative and absolute URLs) and with the 'app' option with arguments", (done) => {
    const compiler = webpack(config);
    const host = 'localhost';
    const server = createServer(compiler, {
      host,
      port,
      open: {
        target: ['first.html', `http://${host}:${port}/second.html`],
        app: { name: 'google-chrome', arguments: ['--incognito'] },
      },
      static: false,
    });

    compiler.hooks.done.tap('webpack-dev-server', () => {
      server.close(() => {
        expect(open).toHaveBeenNthCalledWith(
          1,
          `http://${host}:${port}/first.html`,
          {
            wait: false,
            app: { name: 'google-chrome', arguments: ['--incognito'] },
          }
        );
        expect(open).toHaveBeenNthCalledWith(
          2,
          `http://${host}:${port}/second.html`,
          {
            wait: false,
            app: { name: 'google-chrome', arguments: ['--incognito'] },
          }
        );

        done();
      });
    });

    compiler.run(() => {});
    server.listen(port, host);
  });

  it("should log warning when can't open", (done) => {
    open.mockImplementation(() => Promise.reject());

    const compiler = webpack(config);
    const server = createServer(compiler, {
      port,
      open: true,
      static: false,
    });
    const loggerWarnSpy = jest.spyOn(server.logger, 'warn');

    compiler.hooks.done.tap('webpack-dev-server', () => {
      server.close(() => {
        expect(open).toHaveBeenCalledWith(`http://localhost:${port}/`, {
          wait: false,
        });
        expect(loggerWarnSpy).toHaveBeenCalledWith(
          `Unable to open "http://localhost:${port}/" page. If you are running in a headless environment, please do not use the "open" option or related flags like "--open", "--open-target", and "--open-app".`
        );

        loggerWarnSpy.mockRestore();
        done();
      });
    });

    compiler.run(() => {});
    server.listen(port);
  });

  it("should log warning when can't open with string", (done) => {
    open.mockImplementation(() => Promise.reject());

    const compiler = webpack(config);
    const server = createServer(compiler, {
      open: 'index.html',
      port,
      static: false,
    });
    const loggerWarnSpy = jest.spyOn(server.logger, 'warn');

    compiler.hooks.done.tap('webpack-dev-server', () => {
      server.close(() => {
        expect(open).toHaveBeenCalledWith(
          `http://localhost:${port}/index.html`,
          {
            wait: false,
          }
        );
        expect(loggerWarnSpy).toHaveBeenCalledWith(
          `Unable to open "http://localhost:${port}/index.html" page. If you are running in a headless environment, please do not use the "open" option or related flags like "--open", "--open-target", and "--open-app".`
        );

        loggerWarnSpy.mockRestore();
        done();
      });
    });

    compiler.run(() => {});
    server.listen(port);
  });

  it("should log warning when can't open with object", (done) => {
    open.mockImplementation(() => Promise.reject());

    const compiler = webpack(config);
    const server = createServer(compiler, {
      open: {
        target: 'index.html',
        app: 'google-chrome',
      },
      port,
      static: false,
    });
    const loggerWarnSpy = jest.spyOn(server.logger, 'warn');

    compiler.hooks.done.tap('webpack-dev-server', () => {
      server.close(() => {
        expect(open).toHaveBeenCalledWith(
          `http://localhost:${port}/index.html`,
          {
            app: { name: 'google-chrome' },
            wait: false,
          }
        );
        expect(loggerWarnSpy).toHaveBeenCalledWith(
          `Unable to open "http://localhost:${port}/index.html" page in "google-chrome" app. If you are running in a headless environment, please do not use the "open" option or related flags like "--open", "--open-target", and "--open-app".`
        );

        loggerWarnSpy.mockRestore();
        done();
      });
    });

    compiler.run(() => {});
    server.listen(port);
  });

  it("should log warning when can't open with object with the 'app' option with arguments", (done) => {
    open.mockImplementation(() => Promise.reject());

    const compiler = webpack(config);
    const server = createServer(compiler, {
      open: {
        target: 'index.html',
        app: {
          name: 'google-chrome',
          arguments: ['--incognito', '--new-window'],
        },
      },
      port,
      static: false,
    });
    const loggerWarnSpy = jest.spyOn(server.logger, 'warn');

    compiler.hooks.done.tap('webpack-dev-server', () => {
      server.close(() => {
        expect(open).toHaveBeenCalledWith(
          `http://localhost:${port}/index.html`,
          {
            app: {
              name: 'google-chrome',
              arguments: ['--incognito', '--new-window'],
            },
            wait: false,
          }
        );
        expect(loggerWarnSpy).toHaveBeenCalledWith(
          `Unable to open "http://localhost:${port}/index.html" page in "google-chrome" app with "--incognito --new-window" arguments. If you are running in a headless environment, please do not use the "open" option or related flags like "--open", "--open-target", and "--open-app".`
        );

        loggerWarnSpy.mockRestore();
        done();
      });
    });

    compiler.run(() => {});
    server.listen(port);
  });

  it("should log warning when can't open with object with the 'app' option with arguments", (done) => {
    open.mockImplementation(() => Promise.reject());

    const compiler = webpack(config);
    const server = createServer(compiler, {
      open: {
        target: ['first.html', `http://localhost:${port}/second.html`],
        app: {
          name: 'google-chrome',
          arguments: ['--incognito', '--new-window'],
        },
      },
      port,
      static: false,
    });
    const loggerWarnSpy = jest.spyOn(server.logger, 'warn');

    compiler.hooks.done.tap('webpack-dev-server', () => {
      server.close(() => {
        expect(open).toHaveBeenNthCalledWith(
          1,
          `http://localhost:${port}/first.html`,
          {
            wait: false,
            app: {
              name: 'google-chrome',
              arguments: ['--incognito', '--new-window'],
            },
          }
        );
        expect(open).toHaveBeenNthCalledWith(
          2,
          `http://localhost:${port}/second.html`,
          {
            wait: false,
            app: {
              name: 'google-chrome',
              arguments: ['--incognito', '--new-window'],
            },
          }
        );
        expect(loggerWarnSpy).toHaveBeenNthCalledWith(
          1,
          `Unable to open "http://localhost:${port}/first.html" page in "google-chrome" app with "--incognito --new-window" arguments. If you are running in a headless environment, please do not use the "open" option or related flags like "--open", "--open-target", and "--open-app".`
        );
        expect(loggerWarnSpy).toHaveBeenNthCalledWith(
          2,
          `Unable to open "http://localhost:${port}/second.html" page in "google-chrome" app with "--incognito --new-window" arguments. If you are running in a headless environment, please do not use the "open" option or related flags like "--open", "--open-target", and "--open-app".`
        );

        loggerWarnSpy.mockRestore();
        done();
      });
    });

    compiler.run(() => {});
    server.listen(port);
  });
});
