"use strict";

const webpack = require("webpack");
const { test } = require("@playwright/test");
const { describe } = require("@playwright/test");
const { expect } = require("@playwright/test");
const { beforeEach, afterEach } = require("@playwright/test");
const jestMock = require("jest-mock");
const Server = require("../../lib/Server");
const config = require("../fixtures/simple-config/webpack.config");
const port = require("../ports-map")["setup-exit-signals-option"];

describe("setupExitSignals option", () => {
  describe("should handle 'SIGINT' and 'SIGTERM' signals", () => {
    let compiler;
    let server;
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

      pageErrors = [];
      consoleMessages = [];
      doExit = false;

      exitSpy = jestMock.spyOn(process, "exit").mockImplementation(() => {
        doExit = true;
      });

      stdinResumeSpy = jestMock
        .spyOn(process.stdin, "resume")
        .mockImplementation(() => {});

      stopCallbackSpy = jestMock.spyOn(server, "stopCallback");

      if (server.compiler.close) {
        closeCallbackSpy = jestMock.spyOn(server.compiler, "close");
      }
    });

    afterEach(async () => {
      exitSpy.mockReset();
      stdinResumeSpy.mockReset();
      signals.forEach((signal) => {
        process.removeAllListeners(signal);
      });
      process.stdin.removeAllListeners("end");
      await server.stop();
    });

    signals.forEach((signal) => {
      test(`should close and exit on ${signal}`, async ({ page }) => {
        page
          .on("console", (message) => {
            consoleMessages.push(message);
          })
          .on("pageerror", (error) => {
            pageErrors.push(error);
          });

        const response = await page.goto(`http://127.0.0.1:${port}/`, {
          waitUntil: "networkidle0",
        });

        expect(JSON.stringify(response.status())).toMatchSnapshot();

        process.emit(signal);

        await new Promise((resolve) => {
          const interval = setInterval(() => {
            if (doExit) {
              expect(stopCallbackSpy.mock.calls.length).toEqual(1);

              if (server.compiler.close) {
                expect(closeCallbackSpy.mock.calls.length).toEqual(1);
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

        expect(
          JSON.stringify(consoleMessages.map((message) => message.text())),
        ).toMatchSnapshot();

        expect(JSON.stringify(pageErrors)).toMatchSnapshot();
      });
    });
  });
});
