'use strict';

document.write("It's working.");

// This results in a warning:
if (!window) {
  // eslint-disable-next-line
  require(`./${window}parseable.js`);
}

// This results in an error:
// if(!window) require("test");
