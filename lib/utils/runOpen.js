'use strict';

const open = require('open');
const isAbsoluteUrl = require('is-absolute-url');

function runOpen(uri, options, logger) {
  // https://github.com/webpack/webpack-dev-server/issues/1990
  const defaultOpenOptions = { wait: false };
  const openTasks = [];

  const getOpenTask = (item) => {
    if (typeof item === 'boolean') {
      return [{ target: uri, options: defaultOpenOptions }];
    }

    if (typeof item === 'string') {
      return [{ target: item, options: defaultOpenOptions }];
    }

    let targets;

    if (item.target) {
      targets = Array.isArray(item.target) ? item.target : [item.target];
    } else {
      targets = [uri];
    }

    return targets.map((target) => {
      const openOptions = defaultOpenOptions;

      if (item.app) {
        openOptions.app = item.app;
      }

      return { target, options: openOptions };
    });
  };

  if (Array.isArray(options)) {
    options.forEach((item) => {
      openTasks.push(...getOpenTask(item));
    });
  } else {
    openTasks.push(...getOpenTask(options));
  }

  return Promise.all(
    openTasks.map((openTask) => {
      let openTarget;

      if (openTask.target) {
        if (typeof openTask.target === 'boolean') {
          openTarget = uri;
        } else {
          openTarget = isAbsoluteUrl(openTask.target)
            ? openTask.target
            : new URL(openTask.target, uri).toString();
        }
      } else {
        openTarget = uri;
      }

      return open(openTarget, openTask.options).catch(() => {
        logger.warn(
          `Unable to open "${openTarget}" page${
            // eslint-disable-next-line no-nested-ternary
            openTask.options.app
              ? Array.isArray(openTask.options.app)
                ? ` in "${
                    openTask.options.app[0]
                  }" app with "${openTask.options.app
                    .slice(1)
                    .join(' ')}" arguments`
                : ` in "${openTask.options.app}" app`
              : ''
          }. If you are running in a headless environment, please do not use the "--open" flag or the "open" option.`
        );
      });
    })
  );
}

module.exports = runOpen;
