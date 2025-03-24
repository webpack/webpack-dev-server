"use strict";

module.exports = {
  /**
   * @param {string[] | string} _watchPaths
   * @param {import("./Server").WatchOptions} watchOptions
   * @returns {[string[], import("chokidar").MatchFunction | null]}*/
  getGlobbedWatcherPaths(_watchPaths, { disableGlobbing, cwd }) {
    const watchPaths = Array.isArray(_watchPaths) ? _watchPaths : [_watchPaths];

    if (disableGlobbing === true) {
      return [watchPaths, null];
    }

    const picomatch = require("picomatch");
    const isGlob = require("is-glob");
    const watchPathGlobs = watchPaths.filter((p) => isGlob(p));

    if (watchPathGlobs.length === 0) {
      return [watchPaths, null];
    }

    const globParent = require("glob-parent");

    watchPathGlobs.forEach((p) => {
      watchPaths[watchPaths.indexOf(p)] = globParent(p);
    });

    const matcher = picomatch(watchPathGlobs, { cwd, dot: true });

    /** @type {import("chokidar").MatchFunction} */
    const ignoreFunction = (p) => !watchPaths.includes(p) && !matcher(p);

    // Ignore all paths that don't match any of the globs
    return [watchPaths, ignoreFunction];
  },

  /**
   *
   * @param {import("./Server").WatchOptions} watchOptions
   * @param {import("chokidar").MatchFunction | null } ignoreFunction
   * @returns {import("chokidar").Matcher[]}
   */
  getIgnoreMatchers({ disableGlobbing, ignored, cwd }, ignoreFunction) {
    const _ignored = /** @type {import("chokidar").Matcher[]}**/ (
      typeof ignored === "undefined" ? [] : [ignored]
    );
    const matchers = Array.isArray(ignored) ? ignored : _ignored;

    if (disableGlobbing === true) {
      return matchers;
    }

    if (ignoreFunction) {
      matchers.push(ignoreFunction);
    }

    const picomatch = require("picomatch");
    const isGlob = require("is-glob");

    // Double filter to satisfy typescript. Otherwise nasty casting is required
    const ignoredGlobs = matchers
      .filter((s) => typeof s === "string")
      .filter((s) => isGlob(s));

    if (ignoredGlobs.length === 0) {
      return matchers;
    }

    const matcher = picomatch(ignoredGlobs, { cwd, dot: true });

    matchers.push(matcher);

    return matchers.filter((s) => typeof s !== "string" || !isGlob(s));
  },
};
