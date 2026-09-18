import http from "node:http";
import { describe, it } from "node:test";
import { expect } from "expect";
import webpack from "webpack";
import Server from "../../lib/Server.js";
import config from "../fixtures/client-config/webpack.config.js";
import runBrowser from "../helpers/run-browser.js";
import portsMap from "../ports-map.js";

const port = portsMap.host;

const ipv4 = Server.findIp("v4", false);
const ipv6 = Server.findIp("v6", false);
const unbracketedIpv6 = ipv6?.slice(1, -1);

function getRequestHostname(host) {
  if (host === "<not-specified>" || typeof host === "undefined") {
    return ipv6 ? "[::1]" : ipv4 || "localhost";
  } else if (host === "0.0.0.0") {
    return "127.0.0.1";
  } else if (host === "::") {
    return "[::1]";
  } else if (host === "::1") {
    return "[::1]";
  } else if (host === "local-ip") {
    return ipv4 || ipv6 || "127.0.0.1";
  } else if (host === "local-ipv4") {
    return ipv4 || "127.0.0.1";
  } else if (host === "local-ipv6") {
    return ipv6 || "[::1]";
  }

  return host;
}

function isLocalNetworkHost(host) {
  return host === "local-ip" || host === "local-ipv4" || host === "local-ipv6";
}

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
  } else if (host === "local-ip") {
    address = ipv4 || unbracketedIpv6 || "0.0.0.0";
  } else if (host === "local-ipv4") {
    address = ipv4 || "0.0.0.0";
  } else if (host === "local-ipv6") {
    address = unbracketedIpv6 || "::";
  } else {
    address = hostname;
  }

  return { address };
}

describe("host", () => {
  const hosts = [
    "<not-specified>",

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
    it(`should work using "${host}" host and port as number`, async (t) => {
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

      const hostname = getRequestHostname(host);

      await server.start();

      expect(server.server.address()).toMatchObject(
        await getAddress(host, hostname),
      );

      // Binding is the behavior under test for discovered network addresses.
      // VPN and container interfaces are not necessarily browser-routable.
      if (isLocalNetworkHost(host)) {
        await server.stop();
        return;
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

        await page.goto(`http://${hostname}:${port}/`, {
          waitUntil: "networkidle0",
        });

        t.assert.snapshot(consoleMessages.map((message) => message.text()));

        t.assert.snapshot(pageErrors);
      } finally {
        await browser.close();
        await server.stop();
      }
    });

    it(`should work using "${host}" host and port as string`, async (t) => {
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

      const hostname = getRequestHostname(host);

      await server.start();

      expect(server.server.address()).toMatchObject(
        await getAddress(host, hostname),
      );

      if (isLocalNetworkHost(host)) {
        await server.stop();
        return;
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

        await page.goto(`http://${hostname}:${port}/`, {
          waitUntil: "networkidle0",
        });

        t.assert.snapshot(consoleMessages.map((message) => message.text()));

        t.assert.snapshot(pageErrors);
      } finally {
        await browser.close();
        await server.stop();
      }
    });

    it(`should work using "${host}" host and "auto" port`, async (t) => {
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

      const hostname = getRequestHostname(host);

      await server.start();

      expect(server.server.address()).toMatchObject(
        await getAddress(host, hostname),
      );

      const address = server.server.address();

      if (isLocalNetworkHost(host)) {
        delete process.env.WEBPACK_DEV_SERVER_BASE_PORT;
        await server.stop();
        return;
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

        await page.goto(`http://${hostname}:${address.port}/`, {
          waitUntil: "networkidle0",
        });

        t.assert.snapshot(consoleMessages.map((message) => message.text()));

        t.assert.snapshot(pageErrors);
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
