require("./style.less");

document.write("It's working.");

// This results in a warning:
// if(!window) require.abc();

// This results in an error:
// if(!window) require("test");