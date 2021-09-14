"use strict";

const webpack = require("webpack");
const internalIp = require("internal-ip");
const Server = require("../../lib/Server");
const config = require("../fixtures/client-config/webpack.config");
const runBrowser = require("../helpers/run-browser");
const port = require("../ports-map").host;

const ipv4 = internalIp.v4.sync();
const ipv6 = internalIp.v6.sync();
// macos requires root for using ip v6
const isMacOS = process.platform === "darwin";

describe("host", () => {
  const hosts = [
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
    it(`should work using "${host}" host and port as number`, async () => {
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

      const server = new Server({ host, port }, compiler);

      let hostname = host;

      if (hostname === "0.0.0.0") {
        hostname = "127.0.0.1";
      } else if (hostname === "::" || hostname === "::1") {
        hostname = "[::1]";
      } else if (hostname === "local-ip" || hostname === "local-ipv4") {
        hostname = ipv4;
      } else if (hostname === "local-ipv6") {
        hostname = `[${ipv6}]`;
      }

      await server.start();

      const { page, browser } = await runBrowser();

      const pageErrors = [];
      const consoleMessages = [];

      page
        .on("console", (message) => {
          consoleMessages.push(message);
        })
        .on("pageerror", (error) => {
          pageErrors.push(error);
        });

      await page.goto(`http://${hostname}:${port}/main`, {
        waitUntil: "networkidle0",
      });

      expect(consoleMessages.map((message) => message.text())).toMatchSnapshot(
        "console messages"
      );

      expect(pageErrors).toMatchSnapshot("page errors");

      await browser.close();
      await server.stop();
    });

    it(`should work using "${host}" host and port as string`, async () => {
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

      const server = new Server({ host, port: `${port}` }, compiler);

      let hostname = host;

      if (hostname === "0.0.0.0") {
        hostname = "127.0.0.1";
      } else if (hostname === "::" || hostname === "::1") {
        hostname = "[::1]";
      } else if (hostname === "local-ip" || hostname === "local-ipv4") {
        hostname = ipv4;
      } else if (hostname === "local-ipv6") {
        hostname = `[${ipv6}]`;
      }

      await server.start();

      const { page, browser } = await runBrowser();

      const pageErrors = [];
      const consoleMessages = [];

      page
        .on("console", (message) => {
          consoleMessages.push(message);
        })
        .on("pageerror", (error) => {
          pageErrors.push(error);
        });

      await page.goto(`http://${hostname}:${port}/main`, {
        waitUntil: "networkidle0",
      });

      expect(consoleMessages.map((message) => message.text())).toMatchSnapshot(
        "console messages"
      );

      expect(pageErrors).toMatchSnapshot("page errors");

      await browser.close();
      await server.stop();
    });

    it(`should work using "${host}" host and "auto" port`, async () => {
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

      const server = new Server({ host, port: "auto" }, compiler);

      let hostname = host;

      if (hostname === "0.0.0.0") {
        hostname = "127.0.0.1";
      } else if (hostname === "::" || hostname === "::1") {
        hostname = "[::1]";
      } else if (hostname === "local-ip" || hostname === "local-ipv4") {
        hostname = ipv4;
      } else if (hostname === "local-ipv6") {
        hostname = `[${ipv6}]`;
      }

      await server.start();

      const address = server.server.address();
      const { page, browser } = await runBrowser();

      const pageErrors = [];
      const consoleMessages = [];

      page
        .on("console", (message) => {
          consoleMessages.push(message);
        })
        .on("pageerror", (error) => {
          pageErrors.push(error);
        });

      await page.goto(`http://${hostname}:${address.port}/main`, {
        waitUntil: "networkidle0",
      });

      expect(consoleMessages.map((message) => message.text())).toMatchSnapshot(
        "console messages"
      );

      expect(pageErrors).toMatchSnapshot("page errors");

      delete process.env.WEBPACK_DEV_SERVER_BASE_PORT;

      await browser.close();
      await server.stop();
    });
  }
});
