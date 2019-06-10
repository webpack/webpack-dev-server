'use strict';

const puppeteer = require('puppeteer');
const { puppeteerArgs } = require('./puppeteer-constants');

async function runBrowser(config) {
  const options = {
    viewport: {
      width: 500,
      height: 500,
    },
    userAgent: '',
    ...config,
  };

  const launchedBrowser = await puppeteer.launch({
    headless: true,
    // args come from: https://github.com/alixaxel/chrome-aws-lambda/blob/master/source/index.js
    args: puppeteerArgs,
  });
  const browser = launchedBrowser;
  const page = await browser.newPage();
  page.emulate(options);

  return { page, browser };
}

module.exports = runBrowser;
