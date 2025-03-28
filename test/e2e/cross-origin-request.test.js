"use strict";

const webpack = require("webpack");
const Server = require("../../lib/Server");
const config = require("../fixtures/client-config/webpack.config");
const runBrowser = require("../helpers/run-browser");
const [port1, port2] = require("../ports-map")["cross-origin-request"];

describe("cross-origin requests", () => {
  const devServerPort = port1;
  const htmlServerPort = port2;
  const htmlServerHost = "127.0.0.1";

  it("should return 403 for cross-origin no-cors non-module script tag requests", async () => {
    const compiler = webpack(config);
    const devServerOptions = {
      port: devServerPort,
      allowedHosts: "auto",
    };
    const server = new Server(devServerOptions, compiler);

    await server.start();

    // Start a separate server for serving the HTML file
    const http = require("http");
    const htmlServer = http.createServer((req, res) => {
      res.writeHead(200, { "Content-Type": "text/html" });
      res.end(`
        <html>
          <head>
            <script src="http://localhost:${devServerPort}/main.js"></script>
          </head>
          <body></body>
        </html>
      `);
    });
    htmlServer.listen(htmlServerPort, htmlServerHost);

    const { page, browser } = await runBrowser();
    try {
      const pageErrors = [];

      page.on("pageerror", (error) => {
        pageErrors.push(error);
      });

      const scriptTagRequest = page.waitForResponse(
        `http://localhost:${devServerPort}/main.js`,
      );

      await page.goto(`http://${htmlServerHost}:${htmlServerPort}`);

      const response = await scriptTagRequest;

      expect(response.status()).toBe(403);
    } catch (error) {
      throw error;
    } finally {
      await browser.close();
      await server.stop();
      htmlServer.close();
    }
  });

  it("should return 200 for cross-origin cors non-module script tag requests", async () => {
    const compiler = webpack(config);
    const devServerOptions = {
      port: devServerPort,
      allowedHosts: "auto",
      headers: {
        "Access-Control-Allow-Origin": "*",
      },
    };
    const server = new Server(devServerOptions, compiler);

    await server.start();

    // Start a separate server for serving the HTML file
    const http = require("http");
    const htmlServer = http.createServer((req, res) => {
      res.writeHead(200, { "Content-Type": "text/html" });
      res.end(`
        <html>
          <head>
            <script src="http://localhost:${devServerPort}/main.js" crossorigin></script>
          </head>
          <body></body>
        </html>
      `);
    });
    htmlServer.listen(htmlServerPort, htmlServerHost);

    const { page, browser } = await runBrowser();
    try {
      const pageErrors = [];

      page.on("pageerror", (error) => {
        pageErrors.push(error);
      });

      const scriptTagRequest = page.waitForResponse(
        `http://localhost:${devServerPort}/main.js`,
      );

      await page.goto(`http://${htmlServerHost}:${htmlServerPort}`);

      const response = await scriptTagRequest;

      expect(response.status()).toBe(200);
    } catch (error) {
      throw error;
    } finally {
      await browser.close();
      await server.stop();
      htmlServer.close();
    }
  });
});
