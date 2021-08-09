"use strict";

const webpack = require("webpack");
const internalIp = require("internal-ip");
const Server = require("../../lib/Server");
const config = require("../fixtures/client-config/webpack.config");
const runBrowser = require("../helpers/run-browser");
const port = require("../ports-map")["host-and-port"];

describe("host and port", () => {
  // TODO: add local-ipv6
  const hosts = ["0.0.0.0", "localhost", "127.0.0.1", "local-ip", "local-ipv4"];

  for (const host of hosts) {
    it(`should work using "${host}" host and port as number`, async () => {
      const compiler = webpack(config);
      const server = new Server({ host, port }, compiler);

      let hostname = host;

      if (hostname === "local-ip" || hostname === "local-ipv4") {
        hostname = internalIp.v4.sync();
      }

      await new Promise((resolve, reject) => {
        server.listen(port, host, (error) => {
          if (error) {
            reject(error);

            return;
          }

          resolve();
        });
      });

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
      await new Promise((resolve, reject) => {
        server.close((error) => {
          if (error) {
            reject(error);

            return;
          }

          resolve();
        });
      });
    });

    it(`should work using "${host}" host and port as string`, async () => {
      const compiler = webpack(config);
      const server = new Server({ host, port: `${port}` }, compiler);

      let hostname = host;

      if (hostname === "local-ip" || hostname === "local-ipv4") {
        hostname = internalIp.v4.sync();
      }

      await new Promise((resolve, reject) => {
        server.listen(port, host, (error) => {
          if (error) {
            reject(error);

            return;
          }

          resolve();
        });
      });

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
      await new Promise((resolve, reject) => {
        server.close((error) => {
          if (error) {
            reject(error);

            return;
          }

          resolve();
        });
      });
    });

    it(`should work using "${host}" host and "auto" port`, async () => {
      const compiler = webpack(config);

      process.env.WEBPACK_DEV_SERVER_BASE_PORT = port;

      const server = new Server({ host, port: "auto" }, compiler);

      let hostname = host;

      if (hostname === "local-ip" || hostname === "local-ipv4") {
        hostname = internalIp.v4.sync();
      }

      await new Promise((resolve, reject) => {
        server.listen("auto", host, (error) => {
          if (error) {
            reject(error);

            return;
          }

          resolve();
        });
      });

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
      await new Promise((resolve, reject) => {
        server.close((error) => {
          if (error) {
            reject(error);

            return;
          }

          resolve();
        });
      });
    });
  }
});
