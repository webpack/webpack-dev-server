"use strict";

process.env.CHOKIDAR_USEPOLLING = true;

jest.retryTimes(3);
jest.setTimeout(300000);
