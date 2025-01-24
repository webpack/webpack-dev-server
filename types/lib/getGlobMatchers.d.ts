/**
 * @param {string[] | string} _watchPaths
 * @param {import("./Server").WatchOptions} watchOptions
 * @returns {[string[], import("chokidar").MatchFunction | null]}*/
export function getGlobbedWatcherPaths(
  _watchPaths: string[] | string,
  { disableGlobbing, cwd }: import("./Server").WatchOptions,
): [string[], import("chokidar").MatchFunction | null];
/**
 *
 * @param {import("./Server").WatchOptions} watchOptions
 * @param {import("chokidar").MatchFunction | null } ignoreFunction
 * @returns {import("chokidar").Matcher[]}
 */
export function getIgnoreMatchers(
  { disableGlobbing, ignored, cwd }: import("./Server").WatchOptions,
  ignoreFunction: import("chokidar").MatchFunction | null,
): import("chokidar").Matcher[];
