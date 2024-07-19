"use strict";

const webpack = require("webpack");
const { describe, test } = require("@playwright/test");
const Server = require("../../lib/Server");
const { expect } = require("../helpers/playwright-custom-expects");
const config = require("../fixtures/client-config/webpack.config");
const port = require("../ports-map").host;

const ipv4 = Server.internalIPSync("v4");
const ipv6 = Server.internalIPSync("v6");
// macos requires root for using ip v6
const isMacOS = process.platform === "darwin";

function getAddress(host, hostname) {
  let address;

  if (
    typeof host === "undefined" ||
    (typeof host === "string" && host === "<not-specified>")
  ) {
    address = "::";
  } else if (typeof host === "string" && host === "0.0.0.0") {
    address = "0.0.0.0";
  } else if (typeof host === "string" && host === "localhost") {
    address = parseFloat(process.versions.node) >= 18 ? "::1" : "127.0.0.1";
  } else {
    address = hostname;
  }

  return { address };
}

describe("host", { tag: "@flaky" }, () => {
  const hosts = [
    "<not-specified>",
    // eslint-disable-next-line no-undefined
    undefined,
    "0.0.0.0",
    "::",
    "localhost",
    "::1",
    "127.0.0.1",
    "local-ip",
    "local-ipv4",
    "local-ipv6",
  ];

  for (let host of hosts) {
    test(`should work using "${host}" host and port as number`, { tag: "@fails" }, async ({
      page,
    }) => {
      const compiler = webpack(config);

      if (!ipv6 || isMacOS) {
        if (host === "::") {
          host = "127.0.0.1";
        } else if (host === "::1") {
          host = "127.0.0.1";
        } else if (host === "local-ipv6") {
          host = "127.0.0.1";
        }
      }

      const devServerOptions = { port };

      if (host !== "<not-specified>") {
        devServerOptions.host = host;
      }

      const server = new Server(devServerOptions, compiler);

      let hostname = host;

      if (hostname === "0.0.0.0") {
        hostname = "127.0.0.1";
      } else if (
        hostname === "<not-specified>" ||
        typeof hostname === "undefined" ||
        hostname === "::" ||
        hostname === "::1"
      ) {
        hostname = "[::1]";
      } else if (hostname === "local-ip" || hostname === "local-ipv4") {
        hostname = ipv4;
      } else if (hostname === "local-ipv6") {
        hostname = `[${ipv6}]`;
      }

      await server.start();

      expect(server.server.address()).toMatchObject(getAddress(host, hostname));

      try {
        const pageErrors = [];
        const consoleMessages = [];

        page
          .on("console", (message) => {
            consoleMessages.push(message);
          })
          .on("pageerror", (error) => {
            pageErrors.push(error);
          });

        await page.goto(`http://${hostname}:${port}/`, {
          waitUntil: "networkidle0",
        });

        expect(
          consoleMessages.map((message) => message.text()))
        .toMatchSnapshotWithArray();

        expect(pageErrors).toMatchSnapshotWithArray();
      } catch (error) {
        throw error;
      } finally {
        await server.stop();
      }
    });

    test(`should work using "${host}" host and port as string`, async ({
      page,
    }) => {
      const compiler = webpack(config);

      if (!ipv6 || isMacOS) {
        if (host === "::") {
          host = "127.0.0.1";
        } else if (host === "::1") {
          host = "127.0.0.1";
        } else if (host === "local-ipv6") {
          host = "127.0.0.1";
        }
      }

      const devServerOptions = { port: `${port}` };

      if (host !== "<not-specified>") {
        devServerOptions.host = host;
      }

      const server = new Server(devServerOptions, compiler);

      let hostname = host;

      if (hostname === "0.0.0.0") {
        hostname = "127.0.0.1";
      } else if (
        hostname === "<not-specified>" ||
        typeof hostname === "undefined" ||
        hostname === "::" ||
        hostname === "::1"
      ) {
        hostname = "[::1]";
      } else if (hostname === "local-ip" || hostname === "local-ipv4") {
        hostname = ipv4;
      } else if (hostname === "local-ipv6") {
        hostname = `[${ipv6}]`;
      }

      await server.start();

      expect(server.server.address()).toMatchObject(getAddress(host, hostname));

      try {
        const pageErrors = [];
        const consoleMessages = [];

        page
          .on("console", (message) => {
            consoleMessages.push(message);
          })
          .on("pageerror", (error) => {
            pageErrors.push(error);
          });

        await page.goto(`http://${hostname}:${port}/`, {
          waitUntil: "networkidle0",
        });

        expect(
          consoleMessages.map((message) => message.text()))
        .toMatchSnapshotWithArray();

        expect(pageErrors).toMatchSnapshotWithArray();
      } catch (error) {
        throw error;
      } finally {
        await server.stop();
      }
    });

    test(`should work using "${host}" host and "auto" port`, async ({
      page,
    }) => {
      const compiler = webpack(config);

      process.env.WEBPACK_DEV_SERVER_BASE_PORT = port;

      if (!ipv6 || isMacOS) {
        if (host === "::") {
          host = "127.0.0.1";
        } else if (host === "::1") {
          host = "127.0.0.1";
        } else if (host === "local-ipv6") {
          host = "127.0.0.1";
        }
      }

      const devServerOptions = { port: "auto" };

      if (host !== "<not-specified>") {
        devServerOptions.host = host;
      }

      const server = new Server(devServerOptions, compiler);

      let hostname = host;

      if (hostname === "0.0.0.0") {
        hostname = "127.0.0.1";
      } else if (
        hostname === "<not-specified>" ||
        typeof hostname === "undefined" ||
        hostname === "::" ||
        hostname === "::1"
      ) {
        hostname = "[::1]";
      } else if (hostname === "local-ip" || hostname === "local-ipv4") {
        hostname = ipv4;
      } else if (hostname === "local-ipv6") {
        hostname = `[${ipv6}]`;
      }

      await server.start();

      expect(server.server.address()).toMatchObject(getAddress(host, hostname));

      const address = server.server.address();

      try {
        const pageErrors = [];
        const consoleMessages = [];

        page
          .on("console", (message) => {
            consoleMessages.push(message);
          })
          .on("pageerror", (error) => {
            pageErrors.push(error);
          });

        await page.goto(`http://${hostname}:${address.port}/`, {
          waitUntil: "networkidle0",
        });

        expect(
          consoleMessages.map((message) => message.text()))
        .toMatchSnapshotWithArray();

        expect(pageErrors).toMatchSnapshotWithArray();
      } catch (error) {
        throw error;
      } finally {
        delete process.env.WEBPACK_DEV_SERVER_BASE_PORT;

        await server.stop();
      }
    });
  }

  // TODO need test on error
  // it(`should throw an error on invalid host`, async () => {
  //   const compiler = webpack(config);
  //   const server = new Server({ port, host: "unknown.unknown" }, compiler);
  //   const runDevServer = async () => {
  //     await server.start();
  //   };
  //
  //   return expect(runDevServer()).toBeDefined();
  // });
});
