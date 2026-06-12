import path from "node:path";
import { describe, it } from "node:test";
import { fileURLToPath } from "node:url";
import { expect } from "expect";
import fs from "graceful-fs";
import webpack from "webpack";
import Server from "../../lib/Server.js";
import reloadConfig from "../fixtures/reload-config-2/webpack.config.js";
import runBrowser from "../helpers/run-browser.js";
import portsMap from "../ports-map.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const port = portsMap.progress;

const cssFilePath = path.resolve(
  __dirname,
  "../fixtures/reload-config-2/main.css",
);

describe("progress", () => {
  it("should work and log progress in a browser console", async () => {
    fs.writeFileSync(cssFilePath, "body { background-color: rgb(0, 0, 255); }");

    const compiler = webpack(reloadConfig);
    const devServerOptions = {
      port,
      client: {
        progress: true,
      },
    };
    const server = new Server(devServerOptions, compiler);

    await server.start();

    try {
      const { page, browser } = await runBrowser();

      const consoleMessages = [];

      try {
        let doHotUpdate = false;

        page
          .on("console", (message) => {
            consoleMessages.push(message);
          })
          .on("request", (interceptedRequest) => {
            if (interceptedRequest.isInterceptResolutionHandled()) return;

            if (/\.hot-update\.(json|js)$/.test(interceptedRequest.url())) {
              doHotUpdate = true;
            }
          });

        await page.goto(`http://localhost:${port}/`, {
          waitUntil: "networkidle0",
        });

        fs.writeFileSync(
          cssFilePath,
          "body { background-color: rgb(255, 0, 0); }",
        );

        await new Promise((resolve) => {
          const timer = setInterval(() => {
            if (doHotUpdate) {
              clearInterval(timer);

              resolve();
            }
          }, 100);
        });
      } finally {
        await browser.close();
      }

      const progressConsoleMessage = consoleMessages.filter((message) =>
        /^\[webpack-dev-server\] (\[[a-zA-Z]+\] )?[0-9]{1,3}% - /.test(
          message.text(),
        ),
      );

      expect(progressConsoleMessage.length).toBeGreaterThan(0);
    } finally {
      fs.unlinkSync(cssFilePath);

      await server.stop();
    }
  });
});
