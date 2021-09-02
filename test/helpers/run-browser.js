"use strict";

const puppeteer = require("puppeteer");
const { puppeteerArgs } = require("./puppeteer-constants");

function runBrowser(config) {
  const options = {
    viewport: {
      width: 500,
      height: 500,
    },
    userAgent: "",
    ...config,
  };

  return new Promise((resolve, reject) => {
    let page;
    let browser;

    puppeteer
      .launch({
        headless: true,
        // because of invalid localhost certificate
        ignoreHTTPSErrors: true,
        // args come from: https://github.com/alixaxel/chrome-aws-lambda/blob/master/source/index.js
        args: puppeteerArgs,
      })
      .then((launchedBrowser) => {
        browser = launchedBrowser;

        return browser.newPage();
      })
      .then((newPage) => {
        page = newPage;
        page.emulate(options);

        resolve({ page, browser });
      })
      .catch(reject);
  });
}

module.exports = runBrowser;
