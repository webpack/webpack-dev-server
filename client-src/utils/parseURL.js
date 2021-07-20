"use strict";

const url = require("url");
const getCurrentScriptSource = require("./getCurrentScriptSource");

function parseURL(resourceQuery) {
  let options = {};

  if (typeof resourceQuery === "string" && resourceQuery !== "") {
    const searchParams = resourceQuery.substr(1).split("&");

    for (let i = 0; i < searchParams.length; i++) {
      const pair = searchParams[i].split("=");

      options[pair[0]] = decodeURIComponent(pair[1]);
    }
  } else {
    // Else, get the url from the <script> this file was called with.
    const scriptSource = getCurrentScriptSource();

    if (scriptSource) {
      let scriptSourceURL;

      try {
        // The placeholder `baseURL` with `window.location.href`,
        // is to allow parsing of path-relative or protocol-relative URLs,
        // and will have no effect if `scriptSource` is a fully valid URL.
        scriptSourceURL = new URL(scriptSource, self.location.href);
      } catch (error) {
        // URL parsing failed, do nothing.
        // We will still proceed to see if we can recover using `resourceQuery`
      }

      if (scriptSourceURL) {
        options = scriptSourceURL;
        options.fromCurrentScript = true;
      }
    } else {
      options = url.parse(self.location.href, true, true);
      options.fromCurrentScript = true;
    }
  }

  return options;
}

module.exports = parseURL;
