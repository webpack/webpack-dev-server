"use strict";

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

const internalIPv4 = Server.internalIPSync("v4");
// const internalIPv6 = Server.internalIPSync('v6');

describe('"open" option', () => {
  let compiler;

  beforeEach(() => {
    compiler = webpack(config);
  });

  afterEach(async () => {
    open.mockClear();
  });

  it("should work with unspecified host", async () => {
    const server = new Server(
      {
        open: true,
        port,
      },
      compiler
    );

    await server.start();
    await server.stop();

    expect(open).toHaveBeenCalledWith(`http://localhost:${port}/`, {
      wait: false,
    });
  });

  it("should work with the 'https' option", async () => {
    const server = new Server(
      {
        open: true,
        port,
        https: true,
      },
      compiler
    );

    await server.start();
    await server.stop();

    expect(open).toHaveBeenCalledWith(`https://localhost:${port}/`, {
      wait: false,
    });
  });

  it("should work with '0.0.0.0' host", async () => {
    const host = "0.0.0.0";

    const server = new Server(
      {
        host,
        port,
        open: true,
      },
      compiler
    );

    await server.start();
    await server.stop();

    expect(open).toHaveBeenCalledWith(`http://${host}:${port}/`, {
      wait: false,
    });
  });

  it("should work with '::' host", async () => {
    const host = "::";

    const server = new Server(
      {
        host,
        port,
        open: true,
      },
      compiler
    );

    await server.start();
    await server.stop();

    expect(open).toHaveBeenCalledWith(`http://[${host}]:${port}/`, {
      wait: false,
    });
  });

  it("should work with 'localhost' host", async () => {
    const host = "localhost";

    const server = new Server(
      {
        host,
        port,
        open: true,
      },
      compiler
    );

    await server.start();
    await server.stop();

    expect(open).toHaveBeenCalledWith(`http://${host}:${port}/`, {
      wait: false,
    });
  });

  it("should work with '127.0.0.1' host", async () => {
    const host = "127.0.0.1";

    const server = new Server(
      {
        host,
        port,
        open: true,
      },
      compiler
    );

    await server.start();
    await server.stop();

    expect(open).toHaveBeenCalledWith(`http://${host}:${port}/`, {
      wait: false,
    });
  });

  it("should work with '::1' host", async () => {
    const host = "::1";

    const server = new Server(
      {
        host,
        port,
        open: true,
      },
      compiler
    );

    await server.start();
    await server.stop();

    expect(open).toHaveBeenCalledWith(`http://[${host}]:${port}/`, {
      wait: false,
    });
  });

  it(`should work with '${internalIPv4}' host`, async () => {
    const server = new Server(
      {
        host: internalIPv4,
        port,
        open: true,
      },
      compiler
    );

    await server.start();
    await server.stop();

    expect(open).toHaveBeenCalledWith(`http://${internalIPv4}:${port}/`, {
      wait: false,
    });
  });

  it("should work with boolean", async () => {
    const host = "localhost";

    const server = new Server(
      {
        host,
        port,
        open: true,
      },
      compiler
    );

    await server.start();
    await server.stop();

    expect(open).toHaveBeenCalledWith(`http://${host}:${port}/`, {
      wait: false,
    });
  });

  it("should work with boolean but don't close with 'false' value", async () => {
    const host = "localhost";

    const server = new Server(
      {
        host,
        port,
        open: false,
      },
      compiler
    );

    await server.start();
    await server.stop();

    expect(open).not.toHaveBeenCalled();
  });

  it("should work with relative string", async () => {
    const host = "localhost";

    const server = new Server(
      {
        host,
        port,
        open: "index.html",
      },
      compiler
    );

    await server.start();
    await server.stop();

    expect(open).toHaveBeenCalledWith(`http://${host}:${port}/index.html`, {
      wait: false,
    });
  });

  it('should work with "<url>" pattern', async () => {
    const host = "localhost";

    const server = new Server(
      {
        host,
        port,
        open: "<url>",
      },
      compiler
    );

    await server.start();
    await server.stop();

    expect(open).toHaveBeenCalledWith(`http://${host}:${port}/`, {
      wait: false,
    });
  });

  it('should work with relative string starting with "/"', async () => {
    const host = "localhost";

    const server = new Server(
      {
        host,
        port,
        open: "/index.html",
      },
      compiler
    );

    await server.start();
    await server.stop();

    expect(open).toHaveBeenCalledWith(`http://${host}:${port}/index.html`, {
      wait: false,
    });
  });

  it("should work with absolute string", async () => {
    const host = "localhost";

    const server = new Server(
      {
        open: `http://${host}:${port}/index.html`,
        port,
        host: "localhost",
      },
      compiler
    );

    await server.start();
    await server.stop();

    expect(open).toHaveBeenCalledWith(`http://${host}:${port}/index.html`, {
      wait: false,
    });
  });

  it("should work with multiple relative strings", async () => {
    const host = "localhost";

    const server = new Server(
      {
        host: "localhost",
        port,
        open: ["first.html", "second.html"],
      },
      compiler
    );

    await server.start();
    await server.stop();

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
  });

  it("should work with multiple absolute strings", async () => {
    const host = "localhost";

    const server = new Server(
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

    await server.start();
    await server.stop();

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
  });

  it('should work with "<url>" pattern in multiple strings', async () => {
    const host = "localhost";

    const server = new Server(
      {
        host: "localhost",
        port,
        open: ["<url>", "second.html"],
      },
      compiler
    );

    await server.start();
    await server.stop();

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
  });

  it("should work with empty object", async () => {
    const host = "localhost";

    const server = new Server(
      {
        host,
        port,
        open: {},
      },
      compiler
    );

    await server.start();
    await server.stop();

    expect(open).toHaveBeenCalledWith(`http://${host}:${port}/`, {
      wait: false,
    });
  });

  it("should work with object and with the 'target' option", async () => {
    const host = "localhost";

    const server = new Server(
      {
        host,
        port,
        open: {
          target: "index.html",
        },
      },
      compiler
    );

    await server.start();
    await server.stop();

    expect(open).toHaveBeenCalledWith(`http://${host}:${port}/index.html`, {
      wait: false,
    });
  });

  it("should work with object and with multiple values of the 'target' option", async () => {
    const host = "localhost";

    const server = new Server(
      {
        host,
        port,
        open: {
          target: ["first.html", "second.html"],
        },
      },
      compiler
    );

    await server.start();
    await server.stop();

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
  });

  it("should work with object and with the 'app' option", async () => {
    const host = "localhost";

    const server = new Server(
      {
        host,
        port,
        open: {
          app: "google-chrome",
        },
      },
      compiler
    );

    await server.start();
    await server.stop();

    expect(open).toHaveBeenCalledWith(`http://${host}:${port}/`, {
      app: { name: "google-chrome" },
      wait: false,
    });
  });

  it("should work with object and with the 'app' and 'arguments' options", async () => {
    const host = "localhost";

    const server = new Server(
      {
        host,
        port,
        open: {
          app: { name: "google-chrome", arguments: ["--incognito"] },
        },
      },
      compiler
    );

    await server.start();
    await server.stop();

    expect(open).toHaveBeenCalledWith(`http://${host}:${port}/`, {
      app: { name: "google-chrome", arguments: ["--incognito"] },
      wait: false,
    });
  });

  it('should work with object with "target" and "app" options', async () => {
    const host = "localhost";

    const server = new Server(
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

    await server.start();
    await server.stop();

    expect(open).toHaveBeenCalledWith(`http://${host}:${port}/index.html`, {
      app: { name: "google-chrome" },
      wait: false,
    });
  });

  it('should work with <url> pattern in "target" and "app" options', async () => {
    const host = "localhost";

    const server = new Server(
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

    await server.start();
    await server.stop();

    expect(open).toHaveBeenCalledWith(`http://${host}:${port}/`, {
      app: { name: "google-chrome" },
      wait: false,
    });
  });

  it("should work with object, with multiple value of the 'target' option and with the 'app' and 'arguments' options", async () => {
    const host = "localhost";

    const server = new Server(
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

    await server.start();
    await server.stop();

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
  });

  it("should work with object, with multiple value of the 'target' option (relative and absolute URLs) and with the 'app' option with arguments", async () => {
    const host = "localhost";

    const server = new Server(
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

    await server.start();
    await server.stop();

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
  });

  it("should work with <url> pattern in multiple open options", async () => {
    const host = "localhost";

    const server = new Server(
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

    await server.start();
    await server.stop();

    expect(open).toHaveBeenCalledWith(`http://${host}:${port}/`, {
      app: { name: "google-chrome" },
      wait: false,
    });

    expect(open).toHaveBeenCalledWith(`http://${host}:${port}/`, {
      app: { name: "firefox" },
      wait: false,
    });
  });

  it("should work with multiple open options without target", async () => {
    const host = "localhost";

    const server = new Server(
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

    await server.start();
    await server.stop();

    expect(open).toHaveBeenCalledWith(`http://${host}:${port}/`, {
      app: { name: "google-chrome" },
      wait: false,
    });

    expect(open).toHaveBeenCalledWith(`http://${host}:${port}/`, {
      app: { name: "firefox" },
      wait: false,
    });
  });

  it("should log warning when can't open", async () => {
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

    const server = new Server(
      {
        port,
        open: true,
      },
      compiler
    );

    await server.start();
    await server.stop();

    expect(open).toHaveBeenCalledWith(`http://localhost:${port}/`, {
      wait: false,
    });
    expect(loggerWarnSpy).toHaveBeenCalledWith(
      `Unable to open "http://localhost:${port}/" page. If you are running in a headless environment, please do not use the "open" option or related flags like "--open", "--open-target", and "--open-app".`
    );

    getInfrastructureLoggerSpy.mockRestore();
    loggerWarnSpy.mockRestore();
  });

  it("should log warning when can't open with string", async () => {
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

    const server = new Server(
      {
        open: "index.html",
        port,
      },
      compiler
    );

    await server.start();
    await server.stop();

    expect(open).toHaveBeenCalledWith(`http://localhost:${port}/index.html`, {
      wait: false,
    });
    expect(loggerWarnSpy).toHaveBeenCalledWith(
      `Unable to open "http://localhost:${port}/index.html" page. If you are running in a headless environment, please do not use the "open" option or related flags like "--open", "--open-target", and "--open-app".`
    );

    getInfrastructureLoggerSpy.mockRestore();
    loggerWarnSpy.mockRestore();
  });

  it("should log warning when can't open with object", async () => {
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

    const server = new Server(
      {
        open: {
          target: "index.html",
          app: "google-chrome",
        },
        port,
      },
      compiler
    );

    await server.start();
    await server.stop();

    expect(open).toHaveBeenCalledWith(`http://localhost:${port}/index.html`, {
      app: { name: "google-chrome" },
      wait: false,
    });
    expect(loggerWarnSpy).toHaveBeenCalledWith(
      `Unable to open "http://localhost:${port}/index.html" page in "google-chrome" app. If you are running in a headless environment, please do not use the "open" option or related flags like "--open", "--open-target", and "--open-app".`
    );

    loggerWarnSpy.mockRestore();
    getInfrastructureLoggerSpy.mockRestore();
  });

  it("should log warning when can't open with object with the 'app' option with arguments", async () => {
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

    const server = new Server(
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

    await server.start();
    await server.stop();

    expect(open).toHaveBeenCalledWith(`http://localhost:${port}/index.html`, {
      app: {
        name: "google-chrome",
        arguments: ["--incognito", "--new-window"],
      },
      wait: false,
    });
    expect(loggerWarnSpy).toHaveBeenCalledWith(
      `Unable to open "http://localhost:${port}/index.html" page in "google-chrome" app with "--incognito --new-window" arguments. If you are running in a headless environment, please do not use the "open" option or related flags like "--open", "--open-target", and "--open-app".`
    );

    getInfrastructureLoggerSpy.mockRestore();
    loggerWarnSpy.mockRestore();
  });

  it("should log warning when can't open with object with the 'app' option with arguments", async () => {
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

    const server = new Server(
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

    await server.start();
    await server.stop();

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
  });
});
