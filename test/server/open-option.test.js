"use strict";

const internalIp = require("internal-ip");
const webpack = require("webpack");
const open = require("open");
const Server = require("../../lib/Server");
const config = require("../fixtures/simple-config/webpack.config");
const port = require("../ports-map")["open-option"];

jest.mock("open");

open.mockImplementation(() => {
  return {
    catch: jest.fn(),
  };
});

const internalIPv4 = internalIp.v4.sync();
// const internalIPv6 = internalIp.v6.sync();

describe('"open" option', () => {
  let compiler;
  let server;

  beforeEach(() => {
    compiler = webpack(config);
  });

  afterEach(async () => {
    open.mockClear();

    await server.stop();
  });

  it("should work with unspecified host", (done) => {
    server = new Server(
      {
        open: true,
        port,
      },
      compiler
    );

    compiler.hooks.done.tap("webpack-dev-server", () => {
      server.close(() => {
        expect(open).toHaveBeenCalledWith(`http://localhost:${port}/`, {
          wait: false,
        });

        done();
      });
    });

    server.listen(port);
  });

  it("should work with the 'https' option", (done) => {
    server = new Server(
      {
        open: true,
        port,
        https: true,
      },
      compiler
    );

    compiler.hooks.done.tap("webpack-dev-server", () => {
      server.close(() => {
        expect(open).toHaveBeenCalledWith(`https://localhost:${port}/`, {
          wait: false,
        });

        done();
      });
    });

    server.listen(port);
  });

  it("should work with '0.0.0.0' host", (done) => {
    const host = "0.0.0.0";
    server = new Server(
      {
        host,
        port,
        open: true,
      },
      compiler
    );

    compiler.hooks.done.tap("webpack-dev-server", () => {
      server.close(() => {
        expect(open).toHaveBeenCalledWith(`http://${host}:${port}/`, {
          wait: false,
        });

        done();
      });
    });

    server.listen(port, host);
  });

  it("should work with '::' host", (done) => {
    const host = "::";
    server = new Server(
      {
        host,
        port,
        open: true,
      },
      compiler
    );

    compiler.hooks.done.tap("webpack-dev-server", () => {
      server.close(() => {
        expect(open).toHaveBeenCalledWith(`http://[${host}]:${port}/`, {
          wait: false,
        });

        done();
      });
    });

    server.listen(port, host);
  });

  it("should work with 'localhost' host", (done) => {
    const host = "localhost";
    server = new Server(
      {
        host,
        port,
        open: true,
      },
      compiler
    );

    compiler.hooks.done.tap("webpack-dev-server", () => {
      server.close(() => {
        expect(open).toHaveBeenCalledWith(`http://${host}:${port}/`, {
          wait: false,
        });

        done();
      });
    });

    server.listen(port, host);
  });

  it("should work with '127.0.0.1' host", (done) => {
    const host = "127.0.0.1";
    server = new Server(
      {
        host,
        port,
        open: true,
      },
      compiler
    );

    compiler.hooks.done.tap("webpack-dev-server", () => {
      server.close(() => {
        expect(open).toHaveBeenCalledWith(`http://${host}:${port}/`, {
          wait: false,
        });

        done();
      });
    });

    server.listen(port, host);
  });

  it("should work with '::1' host", (done) => {
    const host = "::1";
    server = new Server(
      {
        host,
        port,
        open: true,
      },
      compiler
    );

    compiler.hooks.done.tap("webpack-dev-server", () => {
      server.close(() => {
        expect(open).toHaveBeenCalledWith(`http://[${host}]:${port}/`, {
          wait: false,
        });

        done();
      });
    });
    server.listen(port, host);
  });

  it(`should work with '${internalIPv4}' host`, (done) => {
    server = new Server(
      {
        host: internalIPv4,
        port,
        open: true,
      },
      compiler
    );

    compiler.hooks.done.tap("webpack-dev-server", () => {
      server.close(() => {
        expect(open).toHaveBeenCalledWith(`http://${internalIPv4}:${port}/`, {
          wait: false,
        });

        done();
      });
    });

    server.listen(port, internalIPv4);
  });

  it("should work with boolean", (done) => {
    const host = "localhost";
    server = new Server(
      {
        host,
        port,
        open: true,
      },
      compiler
    );

    compiler.hooks.done.tap("webpack-dev-server", () => {
      server.close(() => {
        expect(open).toHaveBeenCalledWith(`http://${host}:${port}/`, {
          wait: false,
        });

        done();
      });
    });

    server.listen(port, host);
  });

  it("should work with boolean but don't close with 'false' value", (done) => {
    const host = "localhost";
    server = new Server(
      {
        host,
        port,
        open: false,
      },
      compiler
    );

    compiler.hooks.done.tap("webpack-dev-server", () => {
      server.close(() => {
        expect(open).not.toHaveBeenCalled();

        done();
      });
    });

    server.listen(port, host);
  });

  it("should work with relative string", (done) => {
    const host = "localhost";
    server = new Server(
      {
        host,
        port,
        open: "index.html",
      },
      compiler
    );

    compiler.hooks.done.tap("webpack-dev-server", () => {
      server.close(() => {
        expect(open).toHaveBeenCalledWith(`http://${host}:${port}/index.html`, {
          wait: false,
        });

        done();
      });
    });

    server.listen(port, host);
  });

  it('should work with "<url>" pattern', (done) => {
    const host = "localhost";
    server = new Server(
      {
        host,
        port,
        open: "<url>",
      },
      compiler
    );

    compiler.hooks.done.tap("webpack-dev-server", () => {
      server.close(() => {
        expect(open).toHaveBeenCalledWith(`http://${host}:${port}/`, {
          wait: false,
        });

        done();
      });
    });

    server.listen(port, host);
  });

  it('should work with relative string starting with "/"', (done) => {
    const host = "localhost";
    server = new Server(
      {
        host,
        port,
        open: "/index.html",
      },
      compiler
    );

    compiler.hooks.done.tap("webpack-dev-server", () => {
      server.close(() => {
        expect(open).toHaveBeenCalledWith(`http://${host}:${port}/index.html`, {
          wait: false,
        });

        done();
      });
    });

    server.listen(port, host);
  });

  it("should work with absolute string", (done) => {
    const host = "localhost";
    server = new Server(
      {
        open: `http://${host}:${port}/index.html`,
        port,
        host: "localhost",
      },
      compiler
    );

    compiler.hooks.done.tap("webpack-dev-server", () => {
      server.close(() => {
        expect(open).toHaveBeenCalledWith(`http://${host}:${port}/index.html`, {
          wait: false,
        });

        done();
      });
    });

    server.listen(port, host);
  });

  it("should work with multiple relative strings", (done) => {
    const host = "localhost";
    server = new Server(
      {
        host: "localhost",
        port,
        open: ["first.html", "second.html"],
      },
      compiler
    );

    compiler.hooks.done.tap("webpack-dev-server", () => {
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

    server.listen(port, host);
  });

  it("should work with multiple absolute strings", (done) => {
    const host = "localhost";
    server = new Server(
      {
        host: "localhost",
        port,
        open: [
          `http://${host}:${port}/first.html`,
          `http://${host}:${port}/second.html`,
        ],
      },
      compiler
    );

    compiler.hooks.done.tap("webpack-dev-server", () => {
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

    server.listen(port, host);
  });

  it('should work with "<url>" pattern in multiple strings', (done) => {
    const host = "localhost";
    server = new Server(
      {
        host: "localhost",
        port,
        open: ["<url>", "second.html"],
      },
      compiler
    );

    compiler.hooks.done.tap("webpack-dev-server", () => {
      server.close(() => {
        expect(open).toHaveBeenNthCalledWith(1, `http://${host}:${port}/`, {
          wait: false,
        });
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

    server.listen(port, host);
  });

  it("should work with empty object", (done) => {
    const host = "localhost";
    server = new Server(
      {
        host,
        port,
        open: {},
      },
      compiler
    );

    compiler.hooks.done.tap("webpack-dev-server", () => {
      server.close(() => {
        expect(open).toHaveBeenCalledWith(`http://${host}:${port}/`, {
          wait: false,
        });

        done();
      });
    });

    server.listen(port, host);
  });

  it("should work with object and with the 'target' option", (done) => {
    const host = "localhost";
    server = new Server(
      {
        host,
        port,
        open: {
          target: "index.html",
        },
      },
      compiler
    );

    compiler.hooks.done.tap("webpack-dev-server", () => {
      server.close(() => {
        expect(open).toHaveBeenCalledWith(`http://${host}:${port}/index.html`, {
          wait: false,
        });

        done();
      });
    });

    server.listen(port, host);
  });

  it("should work with object and with multiple values of the 'target' option", (done) => {
    const host = "localhost";
    server = new Server(
      {
        host,
        port,
        open: {
          target: ["first.html", "second.html"],
        },
      },
      compiler
    );

    compiler.hooks.done.tap("webpack-dev-server", () => {
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

    server.listen(port, host);
  });

  it("should work with object and with the 'app' option", (done) => {
    const host = "localhost";
    server = new Server(
      {
        host,
        port,
        open: {
          app: "google-chrome",
        },
      },
      compiler
    );

    compiler.hooks.done.tap("webpack-dev-server", () => {
      server.close(() => {
        expect(open).toHaveBeenCalledWith(`http://${host}:${port}/`, {
          app: { name: "google-chrome" },
          wait: false,
        });

        done();
      });
    });

    server.listen(port, host);
  });

  it("should work with object and with the 'app' and 'arguments' options", (done) => {
    const host = "localhost";
    server = new Server(
      {
        host,
        port,
        open: {
          app: { name: "google-chrome", arguments: ["--incognito"] },
        },
      },
      compiler
    );

    compiler.hooks.done.tap("webpack-dev-server", () => {
      server.close(() => {
        expect(open).toHaveBeenCalledWith(`http://${host}:${port}/`, {
          app: { name: "google-chrome", arguments: ["--incognito"] },
          wait: false,
        });

        done();
      });
    });

    server.listen(port, host);
  });

  it('should work with object with "target" and "app" options', (done) => {
    const host = "localhost";
    server = new Server(
      {
        host,
        port,
        open: {
          target: "index.html",
          app: "google-chrome",
        },
      },
      compiler
    );

    compiler.hooks.done.tap("webpack-dev-server", () => {
      server.close(() => {
        expect(open).toHaveBeenCalledWith(`http://${host}:${port}/index.html`, {
          app: { name: "google-chrome" },
          wait: false,
        });

        done();
      });
    });

    server.listen(port, host);
  });

  it('should work with <url> pattern in "target" and "app" options', (done) => {
    const host = "localhost";
    server = new Server(
      {
        host,
        port,
        open: {
          target: "<url>",
          app: "google-chrome",
        },
      },
      compiler
    );

    compiler.hooks.done.tap("webpack-dev-server", () => {
      server.close(() => {
        expect(open).toHaveBeenCalledWith(`http://${host}:${port}/`, {
          app: { name: "google-chrome" },
          wait: false,
        });

        done();
      });
    });

    server.listen(port, host);
  });

  it("should work with object, with multiple value of the 'target' option and with the 'app' and 'arguments' options", (done) => {
    const host = "localhost";
    server = new Server(
      {
        host,
        port,
        open: {
          target: ["first.html", "second.html"],
          app: { name: "google-chrome", arguments: ["--incognito"] },
        },
      },
      compiler
    );

    compiler.hooks.done.tap("webpack-dev-server", () => {
      server.close(() => {
        expect(open).toHaveBeenNthCalledWith(
          1,
          `http://${host}:${port}/first.html`,
          {
            wait: false,
            app: { name: "google-chrome", arguments: ["--incognito"] },
          }
        );
        expect(open).toHaveBeenNthCalledWith(
          2,
          `http://${host}:${port}/second.html`,
          {
            wait: false,
            app: { name: "google-chrome", arguments: ["--incognito"] },
          }
        );

        done();
      });
    });

    server.listen(port, host);
  });

  it("should work with object, with multiple value of the 'target' option (relative and absolute URLs) and with the 'app' option with arguments", (done) => {
    const host = "localhost";
    server = new Server(
      {
        host,
        port,
        open: {
          target: ["first.html", `http://${host}:${port}/second.html`],
          app: { name: "google-chrome", arguments: ["--incognito"] },
        },
      },
      compiler
    );

    compiler.hooks.done.tap("webpack-dev-server", () => {
      server.close(() => {
        expect(open).toHaveBeenNthCalledWith(
          1,
          `http://${host}:${port}/first.html`,
          {
            wait: false,
            app: { name: "google-chrome", arguments: ["--incognito"] },
          }
        );
        expect(open).toHaveBeenNthCalledWith(
          2,
          `http://${host}:${port}/second.html`,
          {
            wait: false,
            app: { name: "google-chrome", arguments: ["--incognito"] },
          }
        );

        done();
      });
    });

    server.listen(port, host);
  });

  it("should work with <url> pattern in multiple open options", (done) => {
    const host = "localhost";
    server = new Server(
      {
        host,
        port,
        open: [
          {
            target: "<url>",
            app: "google-chrome",
          },
          {
            target: "<url>",
            app: "firefox",
          },
        ],
      },
      compiler
    );

    compiler.hooks.done.tap("webpack-dev-server", () => {
      server.close(() => {
        expect(open).toHaveBeenCalledWith(`http://${host}:${port}/`, {
          app: { name: "google-chrome" },
          wait: false,
        });

        expect(open).toHaveBeenCalledWith(`http://${host}:${port}/`, {
          app: { name: "firefox" },
          wait: false,
        });

        done();
      });
    });

    server.listen(port, host);
  });

  it("should work with multiple open options without target", (done) => {
    const host = "localhost";
    server = new Server(
      {
        host,
        port,
        open: [
          {
            app: "google-chrome",
          },
          {
            app: "firefox",
          },
        ],
      },
      compiler
    );

    compiler.hooks.done.tap("webpack-dev-server", () => {
      server.close(() => {
        expect(open).toHaveBeenCalledWith(`http://${host}:${port}/`, {
          app: { name: "google-chrome" },
          wait: false,
        });

        expect(open).toHaveBeenCalledWith(`http://${host}:${port}/`, {
          app: { name: "firefox" },
          wait: false,
        });

        done();
      });
    });

    server.listen(port, host);
  });

  it("should log warning when can't open", (done) => {
    open.mockImplementation(() => Promise.reject());

    const loggerWarnSpy = jest.fn();
    const getInfrastructureLoggerSpy = jest
      .spyOn(compiler, "getInfrastructureLogger")
      .mockImplementation(() => {
        return {
          warn: loggerWarnSpy,
          info: () => {},
          log: () => {},
        };
      });

    server = new Server(
      {
        port,
        open: true,
      },
      compiler
    );

    compiler.hooks.done.tap("webpack-dev-server", () => {
      server.close(() => {
        expect(open).toHaveBeenCalledWith(`http://localhost:${port}/`, {
          wait: false,
        });
        expect(loggerWarnSpy).toHaveBeenCalledWith(
          `Unable to open "http://localhost:${port}/" page. If you are running in a headless environment, please do not use the "open" option or related flags like "--open", "--open-target", and "--open-app".`
        );

        getInfrastructureLoggerSpy.mockRestore();
        loggerWarnSpy.mockRestore();
        done();
      });
    });

    server.listen(port);
  });

  it("should log warning when can't open with string", (done) => {
    open.mockImplementation(() => Promise.reject());

    const loggerWarnSpy = jest.fn();
    const getInfrastructureLoggerSpy = jest
      .spyOn(compiler, "getInfrastructureLogger")
      .mockImplementation(() => {
        return {
          warn: loggerWarnSpy,
          info: () => {},
          log: () => {},
        };
      });

    server = new Server(
      {
        open: "index.html",
        port,
      },
      compiler
    );

    compiler.hooks.done.tap("webpack-dev-server", () => {
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

        getInfrastructureLoggerSpy.mockRestore();
        loggerWarnSpy.mockRestore();
        done();
      });
    });

    server.listen(port);
  });

  it("should log warning when can't open with object", (done) => {
    open.mockImplementation(() => Promise.reject());

    const loggerWarnSpy = jest.fn();
    const getInfrastructureLoggerSpy = jest
      .spyOn(compiler, "getInfrastructureLogger")
      .mockImplementation(() => {
        return {
          warn: loggerWarnSpy,
          info: () => {},
          log: () => {},
        };
      });

    server = new Server(
      {
        open: {
          target: "index.html",
          app: "google-chrome",
        },
        port,
      },
      compiler
    );

    compiler.hooks.done.tap("webpack-dev-server", () => {
      server.close(() => {
        expect(open).toHaveBeenCalledWith(
          `http://localhost:${port}/index.html`,
          {
            app: { name: "google-chrome" },
            wait: false,
          }
        );
        expect(loggerWarnSpy).toHaveBeenCalledWith(
          `Unable to open "http://localhost:${port}/index.html" page in "google-chrome" app. If you are running in a headless environment, please do not use the "open" option or related flags like "--open", "--open-target", and "--open-app".`
        );

        loggerWarnSpy.mockRestore();
        getInfrastructureLoggerSpy.mockRestore();
        done();
      });
    });

    server.listen(port);
  });

  it("should log warning when can't open with object with the 'app' option with arguments", (done) => {
    open.mockImplementation(() => Promise.reject());

    const loggerWarnSpy = jest.fn();
    const getInfrastructureLoggerSpy = jest
      .spyOn(compiler, "getInfrastructureLogger")
      .mockImplementation(() => {
        return {
          warn: loggerWarnSpy,
          info: () => {},
          log: () => {},
        };
      });

    server = new Server(
      {
        open: {
          target: "index.html",
          app: {
            name: "google-chrome",
            arguments: ["--incognito", "--new-window"],
          },
        },
        port,
      },
      compiler
    );

    compiler.hooks.done.tap("webpack-dev-server", () => {
      server.close(() => {
        expect(open).toHaveBeenCalledWith(
          `http://localhost:${port}/index.html`,
          {
            app: {
              name: "google-chrome",
              arguments: ["--incognito", "--new-window"],
            },
            wait: false,
          }
        );
        expect(loggerWarnSpy).toHaveBeenCalledWith(
          `Unable to open "http://localhost:${port}/index.html" page in "google-chrome" app with "--incognito --new-window" arguments. If you are running in a headless environment, please do not use the "open" option or related flags like "--open", "--open-target", and "--open-app".`
        );

        getInfrastructureLoggerSpy.mockRestore();
        loggerWarnSpy.mockRestore();
        done();
      });
    });

    server.listen(port);
  });

  it("should log warning when can't open with object with the 'app' option with arguments", (done) => {
    open.mockImplementation(() => Promise.reject());

    const loggerWarnSpy = jest.fn();
    const getInfrastructureLoggerSpy = jest
      .spyOn(compiler, "getInfrastructureLogger")
      .mockImplementation(() => {
        return {
          warn: loggerWarnSpy,
          info: () => {},
          log: () => {},
        };
      });

    server = new Server(
      {
        open: {
          target: ["first.html", `http://localhost:${port}/second.html`],
          app: {
            name: "google-chrome",
            arguments: ["--incognito", "--new-window"],
          },
        },
        port,
      },
      compiler
    );

    compiler.hooks.done.tap("webpack-dev-server", () => {
      server.close(() => {
        expect(open).toHaveBeenNthCalledWith(
          1,
          `http://localhost:${port}/first.html`,
          {
            wait: false,
            app: {
              name: "google-chrome",
              arguments: ["--incognito", "--new-window"],
            },
          }
        );
        expect(open).toHaveBeenNthCalledWith(
          2,
          `http://localhost:${port}/second.html`,
          {
            wait: false,
            app: {
              name: "google-chrome",
              arguments: ["--incognito", "--new-window"],
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

        getInfrastructureLoggerSpy.mockRestore();
        loggerWarnSpy.mockRestore();
        done();
      });
    });

    server.listen(port);
  });
});
