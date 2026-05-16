import { afterEach, beforeEach, describe, it } from "node:test";
import { expect } from "expect";
import { spyOn } from "jest-mock";
import webpack from "webpack";
import Server from "../../lib/Server.js";
import config from "../fixtures/simple-config/webpack.config.js";
import runBrowser from "../helpers/run-browser.js";
import portsMap from "../ports-map.js";

const port = portsMap["setup-exit-signals-option"];

describe("setupExitSignals option", () => {
  describe("should handle 'SIGINT' and 'SIGTERM' signals", () => {
    let compiler;
    let server;
    let page;
    let browser;
    let pageErrors;
    let consoleMessages;
    let doExit;
    let exitSpy;
    let stopCallbackSpy;
    let stdinResumeSpy;
    let closeCallbackSpy;

    const signals = ["SIGINT", "SIGTERM"];

    beforeEach(async () => {
      compiler = webpack(config);

      server = new Server(
        {
          setupExitSignals: true,
          port,
        },
        compiler,
      );

      await server.start();

      ({ page, browser } = await runBrowser());

      pageErrors = [];
      consoleMessages = [];
      doExit = false;

      exitSpy = spyOn(process, "exit").mockImplementation(() => {
        doExit = true;
      });

      stdinResumeSpy = spyOn(process.stdin, "resume").mockImplementation(
        () => {},
      );

      stopCallbackSpy = spyOn(server, "stopCallback");

      if (server.compiler.close) {
        closeCallbackSpy = spyOn(server.compiler, "close");
      }
    });

    afterEach(async () => {
      exitSpy.mockReset();
      stdinResumeSpy.mockReset();
      for (const signal of signals) {
        process.removeAllListeners(signal);
      }
      process.stdin.removeAllListeners("end");
      await browser.close();
      await server.stop();
    });

    for (const signal of signals) {
      // eslint-disable-next-line no-loop-func
      it(`should close and exit on ${signal}`, async (t) => {
        page
          .on("console", (message) => {
            consoleMessages.push(message);
          })
          .on("pageerror", (error) => {
            pageErrors.push(error);
          });

        const response = await page.goto(`http://localhost:${port}/`, {
          waitUntil: "networkidle0",
        });

        t.assert.snapshot(response.status());

        process.emit(signal);

        await new Promise((resolve) => {
          const interval = setInterval(() => {
            if (doExit) {
              expect(stopCallbackSpy.mock.calls).toHaveLength(1);

              if (server.compiler.close) {
                expect(closeCallbackSpy.mock.calls).toHaveLength(1);
              }

              clearInterval(interval);

              resolve();
            }
          }, 100);
        });

        consoleMessages = consoleMessages.filter(
          (message) =>
            !(
              message.text().includes("Trying to reconnect...") ||
              message.text().includes("Disconnected")
            ),
        );

        t.assert.snapshot(consoleMessages.map((message) => message.text()));

        t.assert.snapshot(pageErrors);
      });
    }
  });
});
