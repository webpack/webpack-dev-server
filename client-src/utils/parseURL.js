'use strict';

const url = require('url');
const getCurrentScriptSource = require('./getCurrentScriptSource');

function parseURL(resourceQuery) {
  let options;

  if (typeof resourceQuery === 'string' && resourceQuery !== '') {
    // If this bundle is inlined, use the resource query to get the correct url.
    // for backward compatibility we supports:
    // - ?ws://0.0.0.0:8096&3Flogging=info
    // - ?ws%3A%2F%2F192.168.0.5%3A8080%2F%3Flogging%3Dinfo
    // Also we support `http` and `https` for backward compatibility too
    options = url.parse(
      decodeURIComponent(
        resourceQuery
          // strip leading `?` from query string to get a valid URL
          .substr(1)
          // replace first `&` with `?` to have a valid query string
          .replace('&', '?')
      ),
      true
    );
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
      }
    } else {
      options = url.parse(self.location.href, true, true);
    }
  }

  return options;
}

module.exports = parseURL;
