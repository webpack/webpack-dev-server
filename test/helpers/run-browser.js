'use strict';

const puppeteer = require('puppeteer');

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
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });
  const browser = launchedBrowser;
  const page = await browser.newPage();
  page.emulate(options);

  return { page, browser };
}

module.exports = runBrowser;
