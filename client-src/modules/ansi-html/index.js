/**
 * Copied and adapted from the unmaintained and vulnerable ansi-html package.
 *
 * Original license: Apache-2.0. Please refer to the separate LICENSE file in this directory.
 * Original author: https://github.com/Tjatse
 * Original code: https://github.com/Tjatse/ansi-html/blob/master/index.js
 */

module.exports = ansiHTML;

// Reference to https://github.com/sindresorhus/ansi-regex
const _regANSI =
  // eslint-disable-next-line no-control-regex
  /(?:(?:\u001b\[)|\u009b)(?:(?:[0-9]{1,3})?(?:(?:;[0-9]{0,3})*)?[A-M|f-m])|\u001b[A-M]/;

const _styles = {
  30: "black",
  31: "red",
  32: "green",
  33: "yellow",
  34: "blue",
  35: "magenta",
  36: "cyan",
  37: "lightgrey",
};
const _openTags = {
  // bold
  1: "font-weight:bold",
  // dim
  2: "opacity:0.5",
  // italic
  3: "<i>",
  // underscore
  4: "<u>",
  // hidden
  8: "display:none",
  // delete
  9: "<del>",
};
const _closeTags = {
  // reset italic
  23: "</i>",
  // reset underscore
  24: "</u>",
  // reset delete
  29: "</del>",
};

[0, 21, 22, 27, 28, 39, 49].forEach((n) => {
  _closeTags[n] = "</span>";
});

/**
 * Converts text with ANSI color codes to HTML markup.
 * @param {String} text
 * @returns {*}
 */
function ansiHTML(text) {
  // Returns the text if the string has no ANSI escape code.
  if (!_regANSI.test(text)) {
    return text;
  }

  // Cache opened sequence.
  const ansiCodes = [];
  // Replace with markup.
  let ret = text.replace(/\033\[(\d+)m/g, (match, seq) => {
    const ot = _openTags[seq];
    if (ot) {
      // If current sequence has been opened, close it.
      // eslint-disable-next-line no-extra-boolean-cast, no-bitwise
      if (!!~ansiCodes.indexOf(seq)) {
        ansiCodes.pop();
        return "</span>";
      }
      // Open tag.
      ansiCodes.push(seq);
      return ot[0] === "<" ? ot : `<span style="${ot};">`;
    }

    const ct = _closeTags[seq];
    if (ct) {
      // Pop sequence
      ansiCodes.pop();
      return ct;
    }
    return "";
  });

  // Make sure tags are closed.
  const l = ansiCodes.length;
  if (l > 0) {
    ret += Array(l + 1).join("</span>");
  }

  return ret;
}

/**
 * Customize colors.
 * @param {Object} colors reference to _defColors
 */
ansiHTML.setColors = function setColors(colors) {
  // reset all
  _openTags[
    "0"
  ] = `font-weight:normal;opacity:1;color:#${colors.reset[0]};background:#${colors.reset[1]}`;
  // inverse
  _openTags["7"] = `color:#${colors.reset[1]};background:#${colors.reset[0]}`;
  // dark grey
  _openTags["90"] = `color:#${colors.darkgrey}`;

  for (let code in _styles) {
    if (Object.prototype.hasOwnProperty.call(_styles, code)) {
      const color = _styles[code];
      const oriColor = colors[color] || "000";
      _openTags[code] = `color:#${oriColor}`;
      code = parseInt(code, 10);
      _openTags[(code + 10).toString()] = `background:#${oriColor}`;
    }
  }
};
