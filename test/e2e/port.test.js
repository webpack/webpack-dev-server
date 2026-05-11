import { describe, it } from "node:test";
import { expect } from "expect";
import webpack from "webpack";
import Server from "../../lib/Server.js";
import config from "../fixtures/client-config/webpack.config.js";
import runBrowser from "../helpers/run-browser.js";
import portsMap from "../ports-map.js";

const { port } = portsMap;

describe("port", () => {
  const ports = [
    "<not-specified>",

    undefined,
    "auto",
    port,
    `${port}`,
    0,
    "-1",
    "99999",
  ];

  for (const testedPort of ports) {
    it(`should work using "${testedPort}" port `, async (t) => {
      const compiler = webpack(config);
      const devServerOptions = {};

      let usedPort;

      if (
        testedPort === "<not-specified>" ||
        typeof testedPort === "undefined"
      ) {
        process.env.WEBPACK_DEV_SERVER_BASE_PORT = port;
        usedPort = port;
      } else if (testedPort === "auto") {
        process.env.WEBPACK_DEV_SERVER_BASE_PORT = port;
        devServerOptions.port = testedPort;
        usedPort = port;
      } else {
        devServerOptions.port = testedPort;
        usedPort = testedPort;
      }

      const server = new Server(devServerOptions, compiler);

      let errored;

      try {
        await server.start();
      } catch (error) {
        errored = error;
      }

      if (testedPort === "-1" || testedPort === "99999") {
        const errorMessageRegExp = /options.port should be >= 0 and < 65536/;

        try {
          expect(errored.message).toMatch(errorMessageRegExp);
        } finally {
          await server.stop();
        }

        return;
      }

      const address = server.server.address();

      if (testedPort === 0) {
        expect(typeof address.port).toBe("number");
      } else {
        expect(address.port).toBe(Number(usedPort));
      }

      const { page, browser } = await runBrowser();

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

        await page.goto(`http://localhost:${address.port}/`, {
          waitUntil: "networkidle0",
        });

        t.assert.snapshot(consoleMessages.map((message) => message.text()));
        t.assert.snapshot(pageErrors);
      } finally {
        await browser.close();
        await server.stop();
      }

      if (
        testedPort === "<not-specified>" ||
        typeof testedPort === "undefined"
      ) {
        delete process.env.WEBPACK_DEV_SERVER_BASE_PORT;
      }
    });
  }
});
