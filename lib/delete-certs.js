'use strict';

/* eslint-disable
  no-shadow
*/
const fs = require('fs');
const path = require('path');

const certsDir = path.join(__dirname, '..', 'ssl');
fs.readdir(certsDir, (err, files) => {
  if (err) throw err;
  for (const file of files) {
    const filename = path.join(certsDir, file);
    if (path.extname(filename) === '.pem') {
      fs.unlink(filename, (err) => {
        if (err) throw err;
      });
    }
  }
});
