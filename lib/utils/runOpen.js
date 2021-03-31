'use strict';

const open = require('open');
const isAbsoluteUrl = require('is-absolute-url');

function runOpen(uri, options, logger) {
  // https://github.com/webpack/webpack-dev-server/issues/1990
  const defaultOpenOptions = { wait: false };
  const openTasks = [];

  if (typeof options === 'boolean') {
    openTasks.push({ target: uri, options: defaultOpenOptions });
  } else if (typeof options === 'string') {
    openTasks.push({ target: options, options: defaultOpenOptions });
  } else if (Array.isArray(options)) {
    options.forEach((item) => {
      if (typeof item === 'string') {
        openTasks.push({ target: item, options: defaultOpenOptions });
      } else {
        openTasks.push({
          target: item.target,
          options: { ...defaultOpenOptions, app: item.app },
        });
      }
    });
  } else {
    openTasks.push({
      target: options.target,
      options: { ...defaultOpenOptions, app: options.app },
    });
  }

  return Promise.all(
    openTasks.map((openTask) => {
      const openTarget =
        openTask.target && isAbsoluteUrl(openTask.target)
          ? openTask.target
          : new URL(openTask.target, uri).toString();

      return open(openTarget, openTask.options).catch(() => {
        logger.warn(
          `Unable to open "${openTarget}" page${
            // eslint-disable-next-line no-nested-ternary
            openTask.app
              ? Array.isArray(openTask.app)
                ? ` in "${openTask.app.join(', ')}" apps`
                : ` in "${openTask.app}" app`
              : ''
          }. If you are running in a headless environment, please do not use the '--open' flag or the 'open' option.`
        );
      });
    })
  );
}

module.exports = runOpen;
