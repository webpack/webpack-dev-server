'use strict';

/* global self */

const url = require('url');
const getCurrentScriptSource = require('./getCurrentScriptSource');

function getUrlOptions(resourceQuery) {
  let options;

  if (typeof resourceQuery === 'string' && resourceQuery !== '') {
    // If this bundle is inlined, use the resource query to get the correct url.
    // format is like `?http://0.0.0.0:8096&port=8097&host=localhost`
    options = url.parse(
      resourceQuery
        // strip leading `?` from query string to get a valid URL
        .substr(1)
        // replace first `&` with `?` to have a valid query string
        .replace('&', '?'),
      true
    );
  } else {
    // Else, get the url from the <script> this file was called with.
    const scriptHost = getCurrentScriptSource();
    options = url.parse(scriptHost || '/', true, true);
  }

  return options;
}

module.exports = getUrlOptions;
