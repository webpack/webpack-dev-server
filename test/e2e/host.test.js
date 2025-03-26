"use strict";

const http = require("http");
const webpack = require("webpack");
const Server = require("../../lib/Server");
const config = require("../fixtures/client-config/webpack.config");
const runBrowser = require("../helpers/run-browser");
const port = require("../ports-map").host;

const ipv4 = Server.findIp("v4", false);
const ipv6 = Server.findIp("v6", false);

async function getAddress(host, hostname) {
  let address;

  if (
    typeof host === "undefined" ||
    (typeof host === "string" && (host === "<not-specified>" || host === "::"))
  ) {
    address = "::";
  } else if (host === "0.0.0.0") {
    address = "0.0.0.0";
  } else if (host === "::1") {
    address = "::1";
  } else if (host === "localhost") {
    // It can be `127.0.0.1` or `::1` on different OS
    const server = http.createServer((req, res) => {
      res.statusCode = 200;
      res.setHeader("Content-Type", "text/plain");
      res.end("Hello World\n");
    });

    await new Promise((resolve) => {
      server.listen({ host: "localhost", port: 23100 }, resolve);
    });

    address = server.address().address;

    await new Promise((resolve, reject) => {
      server.close((err) => {
        if (err) {
          reject(err);
          return;
        }

        resolve();
      });
    });
  } else if (host === "local-ipv6") {
    address = "::";
  } else {
    address = hostname;
  }

  return { address };
}

describe("host", () => {
  const hosts = [
    "<not-specified>",
    // eslint-disable-next-line no-undefined
    undefined,
    "0.0.0.0",
    "::",
    "::1",
    "localhost",
    "127.0.0.1",
    "local-ip",
    "local-ipv4",
    "local-ipv6",
  ];

  for (const host of hosts) {
    it(`should work using "${host}" host and port as number`, async () => {
      const compiler = webpack(config);
      const devServerOptions = { port };

      if (host !== "<not-specified>") {
        devServerOptions.host = host;
      }

      if (
        host === "<not-specified>" ||
        typeof host === "undefined" ||
        host === "0.0.0.0" ||
        host === "::" ||
        host === "local-ipv6"
      ) {
        devServerOptions.allowedHosts = "all";
      }

      const server = new Server(devServerOptions, compiler);

      let hostname = host;

      if (hostname === "<not-specified>" || typeof hostname === "undefined") {
        // If host is omitted, the server will accept connections on the unspecified IPv6 address (::) when IPv6 is available, or the unspecified IPv4 address (0.0.0.0) otherwise.
        hostname = ipv6 ? `[${ipv6}]` : ipv4;
      } else if (hostname === "0.0.0.0") {
        hostname = ipv4;
      } else if (hostname === "::") {
        // In most operating systems, listening to the unspecified IPv6 address (::) may cause the net.Server to also listen on the unspecified IPv4 address (0.0.0.0).
        hostname = ipv6 ? `[${ipv6}]` : ipv4;
      } else if (hostname === "::1") {
        hostname = "[::1]";
      } else if (hostname === "local-ip" || hostname === "local-ipv4") {
        hostname = ipv4;
      } else if (hostname === "local-ipv6") {
        // For test env where network ipv6 doesn't work
        hostname = ipv6 ? `[${ipv6}]` : "[::1]";
      }

      await server.start();

      expect(server.server.address()).toMatchObject(
        await getAddress(host, hostname),
      );

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

        await page.goto(`http://${hostname}:${port}/`, {
          waitUntil: "networkidle0",
        });

        expect(
          consoleMessages.map((message) => message.text()),
        ).toMatchSnapshot("console messages");

        expect(pageErrors).toMatchSnapshot("page errors");
      } catch (error) {
        throw error;
      } finally {
        await browser.close();
        await server.stop();
      }
    });

    it(`should work using "${host}" host and port as string`, async () => {
      const compiler = webpack(config);
      const devServerOptions = { port: `${port}` };

      if (host !== "<not-specified>") {
        devServerOptions.host = host;
      }

      if (
        host === "<not-specified>" ||
        typeof host === "undefined" ||
        host === "0.0.0.0" ||
        host === "::" ||
        host === "local-ipv6"
      ) {
        devServerOptions.allowedHosts = "all";
      }

      const server = new Server(devServerOptions, compiler);

      let hostname = host;

      if (hostname === "<not-specified>" || typeof hostname === "undefined") {
        // If host is omitted, the server will accept connections on the unspecified IPv6 address (::) when IPv6 is available, or the unspecified IPv4 address (0.0.0.0) otherwise.
        hostname = ipv6 ? `[${ipv6}]` : ipv4;
      } else if (hostname === "0.0.0.0") {
        hostname = ipv4;
      } else if (hostname === "::") {
        // In most operating systems, listening to the unspecified IPv6 address (::) may cause the net.Server to also listen on the unspecified IPv4 address (0.0.0.0).
        hostname = ipv6 ? `[${ipv6}]` : ipv4;
      } else if (hostname === "::1") {
        hostname = "[::1]";
      } else if (hostname === "local-ip" || hostname === "local-ipv4") {
        hostname = ipv4;
      } else if (hostname === "local-ipv6") {
        // For test env where network ipv6 doesn't work
        hostname = ipv6 ? `[${ipv6}]` : "[::1]";
      }

      await server.start();

      expect(server.server.address()).toMatchObject(
        await getAddress(host, hostname),
      );

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

        await page.goto(`http://${hostname}:${port}/`, {
          waitUntil: "networkidle0",
        });

        expect(
          consoleMessages.map((message) => message.text()),
        ).toMatchSnapshot("console messages");

        expect(pageErrors).toMatchSnapshot("page errors");
      } catch (error) {
        throw error;
      } finally {
        await browser.close();
        await server.stop();
      }
    });

    it(`should work using "${host}" host and "auto" port`, async () => {
      const compiler = webpack(config);

      process.env.WEBPACK_DEV_SERVER_BASE_PORT = port;

      const devServerOptions = { port: "auto" };

      if (host !== "<not-specified>") {
        devServerOptions.host = host;
      }

      if (
        host === "<not-specified>" ||
        typeof host === "undefined" ||
        host === "0.0.0.0" ||
        host === "::" ||
        host === "local-ipv6"
      ) {
        devServerOptions.allowedHosts = "all";
      }

      const server = new Server(devServerOptions, compiler);

      let hostname = host;

      if (hostname === "<not-specified>" || typeof hostname === "undefined") {
        // If host is omitted, the server will accept connections on the unspecified IPv6 address (::) when IPv6 is available, or the unspecified IPv4 address (0.0.0.0) otherwise.
        hostname = ipv6 ? `[${ipv6}]` : ipv4;
      } else if (hostname === "0.0.0.0") {
        hostname = ipv4;
      } else if (hostname === "::") {
        // In most operating systems, listening to the unspecified IPv6 address (::) may cause the net.Server to also listen on the unspecified IPv4 address (0.0.0.0).
        hostname = ipv6 ? `[${ipv6}]` : ipv4;
      } else if (hostname === "::1") {
        hostname = "[::1]";
      } else if (hostname === "local-ip" || hostname === "local-ipv4") {
        hostname = ipv4;
      } else if (hostname === "local-ipv6") {
        // For test env where network ipv6 doesn't work
        hostname = ipv6 ? `[${ipv6}]` : "[::1]";
      }

      await server.start();

      expect(server.server.address()).toMatchObject(
        await getAddress(host, hostname),
      );

      const address = server.server.address();
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

        await page.goto(`http://${hostname}:${address.port}/`, {
          waitUntil: "networkidle0",
        });

        expect(
          consoleMessages.map((message) => message.text()),
        ).toMatchSnapshot("console messages");

        expect(pageErrors).toMatchSnapshot("page errors");
      } catch (error) {
        throw error;
      } finally {
        delete process.env.WEBPACK_DEV_SERVER_BASE_PORT;

        await browser.close();
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
