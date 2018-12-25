'use strict';

require('./style.less');
require('./iconfont.less');

const target = document.querySelector('#target');

target.classList.add('pass');
target.innerHTML = 'Success!';
target.classList.add('anticon');
target.classList.add('icon-checkcircle');

// This results in a warning:
// if(!window) require("./" + window + "parseable.js");

// This results in an error:
// if(!window) require("test");
