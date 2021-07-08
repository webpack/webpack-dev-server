'use strict';

const target = document.querySelector('#target');

if (window.location.href.endsWith('example2.html')) {
  target.classList.add('pass');
  target.innerHTML = 'Success!';
} else {
  target.classList.add('fail');
  target.innerHTML = 'Houston, we have a problem.';
}
