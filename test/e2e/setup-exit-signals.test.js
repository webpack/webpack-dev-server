"use strict";

const webpack = require("webpack");
const sinon = require("sinon");
const { test } = require("../helpers/playwright-test");
const { expect } = require("../helpers/playwright-custom-expects");
const Server = require("../../lib/Server");
const config = require("../fixtures/simple-config/webpack.config");
const port = require("../ports-map")["setup-exit-signals-option"];

test.describe("setupExitSignals option", () => {
  test.describe("should handle 'SIGINT' and 'SIGTERM' signals", () => {
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

    test.beforeEach(async () => {
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

      exitSpy = sinon.stub(process, "exit").callsFake(() => {
        doExit = true;
      });

      stdinResumeSpy = sinon.stub(process.stdin, "resume").callsFake(() => {});

      stopCallbackSpy = sinon.spy(server, "stopCallback");

      if (server.compiler.close) {
        closeCallbackSpy = sinon.spy(server.compiler, "close");
      }
    });

    test.afterEach(async () => {
      exitSpy.restore();
      stdinResumeSpy.restore();
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

        expect(response.status()).toBe(200);

        process.emit(signal);

        await new Promise((resolve) => {
          const interval = setInterval(() => {
            if (doExit) {
              expect(stopCallbackSpy.getCalls().length).toEqual(1);

              if (server.compiler.close) {
                expect(closeCallbackSpy.getCalls().length).toEqual(1);
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
          consoleMessages.map((message) => message.text()),
        ).toMatchSnapshotWithArray("console messages");

        expect(pageErrors).toMatchSnapshotWithArray("page errors");
      });
    });
  });
});
