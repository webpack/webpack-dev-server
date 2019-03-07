'use strict';

const puppeteer = require('puppeteer');

function runBrowser(config) {
  const options = {
    viewport: {
      width: 500,
      height: 500,
    },
    userAgent: '',
    ...config,
  };

  return new Promise((resolve, reject) => {
    let page;
    let browser;

    puppeteer
      .launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
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
