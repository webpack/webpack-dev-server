"use strict";

const webpack = require("webpack");
const request = require("supertest");
const Server = require("../../lib/Server");
const config = require("../fixtures/client-config/webpack.config");
const multiCompilerConfig = require("../fixtures/multi-compiler-one-configuration/webpack.config");
const port = require("../ports-map")["hot-option"];

describe("hot option", () => {
  let server;
  let req;

  describe("simple hot config entries", () => {
    beforeAll(async () => {
      const compiler = webpack(config);

      server = new Server({ port }, compiler);

      await server.start();

      req = request(server.app);
    });

    afterAll(async () => {
      await server.stop();
    });

    it("should include hot script in the bundle", async () => {
      const response = await req.get("/main.js");

      expect(response.status).toEqual(200);
      expect(response.text).toContain("webpack/hot/dev-server.js");
    });
  });

  describe("simple hot-only config entries", () => {
    beforeAll(async () => {
      const compiler = webpack(config);

      server = new Server(
        {
          port,
          hot: "only",
        },
        compiler
      );

      await server.start();

      req = request(server.app);
    });

    afterAll(async () => {
      await server.stop();
    });

    it("should include hot-only script in the bundle", async () => {
      const response = await req.get("/main.js");

      expect(response.status).toEqual(200);
      expect(response.text).toContain("webpack/hot/only-dev-server.js");
    });
  });

  describe("multi compiler hot config entries", () => {
    beforeAll(async () => {
      const compiler = webpack(multiCompilerConfig);

      server = new Server({ port }, compiler);

      await server.start();

      req = request(server.app);
    });

    afterAll(async () => {
      await server.stop();
    });

    it("should include hot script in the bundle", async () => {
      const response = await req.get("/main.js");

      expect(response.status).toEqual(200);
      expect(response.text).toContain("webpack/hot/dev-server.js");
    });
  });

  describe("hot disabled entries", () => {
    beforeAll(async () => {
      const compiler = webpack(multiCompilerConfig);

      server = new Server({ port, hot: false }, compiler);

      await server.start();

      req = request(server.app);
    });

    afterAll(async () => {
      await server.stop();
    });

    it("should NOT include hot script in the bundle", async () => {
      const response = await req.get("/main.js");

      expect(response.status).toEqual(200);
      expect(response.text).not.toMatch(/webpack\/hot\/dev-server\.js/);
    });
  });

  // the following cases check to make sure that the HMR
  // plugin is actually added

  describe("simple hot config HMR plugin", () => {
    it("should register the HMR plugin before compilation is complete", async () => {
      let pluginFound = false;
      const compiler = webpack(config);

      compiler.hooks.compilation.intercept({
        register: (tapInfo) => {
          if (tapInfo.name === "HotModuleReplacementPlugin") {
            pluginFound = true;
          }

          return tapInfo;
        },
      });

      server = new Server({ port }, compiler);

      await server.start();

      expect(pluginFound).toBe(true);

      await server.stop();
    });
  });

  describe("simple hot config HMR plugin with already added HMR plugin", () => {
    it("should register the HMR plugin before compilation is complete", async () => {
      let pluginFound = false;
      const compiler = webpack({
        ...config,
        plugins: [...config.plugins, new webpack.HotModuleReplacementPlugin()],
      });

      compiler.hooks.compilation.intercept({
        register: (tapInfo) => {
          if (tapInfo.name === "HotModuleReplacementPlugin") {
            pluginFound = true;
          }

          return tapInfo;
        },
      });

      server = new Server({ port }, compiler);

      await server.start();

      expect(compiler.options.plugins).toHaveLength(2);
      expect(pluginFound).toBe(true);

      await server.stop();
    });
  });

  describe("simple config with already added HMR plugin", () => {
    let loggerWarnSpy;
    let getInfrastructureLoggerSpy;
    let compiler;

    beforeEach(() => {
      compiler = webpack({
        ...config,
        devServer: { hot: false },
        plugins: [...config.plugins, new webpack.HotModuleReplacementPlugin()],
      });

      loggerWarnSpy = jest.fn();

      getInfrastructureLoggerSpy = jest
        .spyOn(compiler, "getInfrastructureLogger")
        .mockImplementation(() => {
          return {
            warn: loggerWarnSpy,
            info: () => {},
            log: () => {},
          };
        });
    });

    afterEach(() => {
      getInfrastructureLoggerSpy.mockRestore();
      loggerWarnSpy.mockRestore();
    });

    it("should show warning with hot normalized as true", async () => {
      server = new Server({ port }, compiler);

      await server.start();

      expect(loggerWarnSpy).toHaveBeenCalledWith(
        `"hot: true" automatically applies HMR plugin, you don't have to add it manually to your webpack configuration.`
      );

      await server.stop();
    });

    it(`should show warning with "hot: true"`, async () => {
      server = new Server({ port, hot: true }, compiler);

      await server.start();

      expect(loggerWarnSpy).toHaveBeenCalledWith(
        `"hot: true" automatically applies HMR plugin, you don't have to add it manually to your webpack configuration.`
      );

      await server.stop();
    });

    it(`should not show warning with "hot: false"`, async () => {
      server = new Server({ port, hot: false }, compiler);

      await server.start();

      expect(loggerWarnSpy).not.toHaveBeenCalledWith(
        `"hot: true" automatically applies HMR plugin, you don't have to add it manually to your webpack configuration.`
      );

      await server.stop();
    });
  });

  describe("multi compiler hot config HMR plugin", () => {
    it("should register the HMR plugin before compilation is complete", async () => {
      let pluginFound = false;
      const compiler = webpack(multiCompilerConfig);

      compiler.compilers[0].hooks.compilation.intercept({
        register: (tapInfo) => {
          if (tapInfo.name === "HotModuleReplacementPlugin") {
            pluginFound = true;
          }

          return tapInfo;
        },
      });

      server = new Server({ port }, compiler);

      await server.start();

      expect(pluginFound).toBe(true);

      await server.stop();
    });
  });

  describe("hot disabled HMR plugin", () => {
    it("should NOT register the HMR plugin before compilation is complete", async () => {
      let pluginFound = false;
      const compiler = webpack(config);

      compiler.hooks.compilation.intercept({
        register: (tapInfo) => {
          if (tapInfo.name === "HotModuleReplacementPlugin") {
            pluginFound = true;
          }

          return tapInfo;
        },
      });

      server = new Server({ port, hot: false }, compiler);

      await server.start();

      expect(pluginFound).toBe(false);

      await server.stop();
    });
  });
});
