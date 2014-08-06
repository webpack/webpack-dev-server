require("./style.less");

document.write("It's working.");

// This results in a warning:
// if(!window) require("./" + window + "parseable.js");

// This results in an error:
// if(!window) require("test");