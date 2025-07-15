"use strict";

const puppeteer = require("puppeteer");
const { puppeteerArgs } = require("./puppeteer-constants");

/** @typedef {import('puppeteer').Browser} Browser */
/** @typedef {import('puppeteer').Page} Page */
/** @typedef {import('puppeteer').Device} Device */

/**
 * @typedef {object} RunBrowserResult
 * @property {Page} page page
 * @property {Browser} browser browser
 */

/**
 * @param {Browser} browser browser
 * @param {Device} device config
 * @returns {Promise<Page>} page
 */
function runPage(browser, device) {
  /**
   * @type {Page}
   */
  let page;

  const options = {
    viewport: {
      width: 500,
      height: 500,
    },
    userAgent: "",
    ...device,
  };

  return Promise.resolve()
    .then(() => browser.newPage())
    .then((newPage) => {
      page = newPage;
      page.emulate(options);

      return page.setRequestInterception(true);
    })
    .then(() => {
      page.on("request", (interceptedRequest) => {
        if (interceptedRequest.isInterceptResolutionHandled()) return;
        if (interceptedRequest.url().includes("favicon.ico")) {
          interceptedRequest.respond({
            status: 200,
            contentType: "image/png",
            body: "Empty",
          });
        } else {
          interceptedRequest.continue(
            interceptedRequest.continueRequestOverrides(),
            10,
          );
        }
      });

      return page;
    });
}

/**
 * @param {Device} device device
 * @returns {Promise<RunBrowserResult>} browser result
 */
function runBrowser(device) {
  return new Promise((resolve, reject) => {
    /**
     * @type {import('puppeteer').Page}
     */
    let page;
    /**
     * @type {import('puppeteer').Browser}
     */
    let browser;

    puppeteer
      .launch({
        headless: "new",
        // because of invalid localhost certificate
        acceptInsecureCerts: true,
        // args come from: https://github.com/alixaxel/chrome-aws-lambda/blob/master/source/index.js
        args: puppeteerArgs,
      })
      .then((launchedBrowser) => {
        browser = launchedBrowser;

        return runPage(launchedBrowser, device);
      })
      .then((newPage) => {
        page = newPage;

        resolve({ page, browser });
      })
      .catch(reject);
  });
}

module.exports = runBrowser;
module.exports.runPage = runPage;
