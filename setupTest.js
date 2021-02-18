'use strict';

process.env.CHOKIDAR_USEPOLLING = true;
jest.setTimeout(180000);

// retry 3 times for flaky tests
jest.retryTimes(3);
