'use strict';

/* global XMLHttpRequest */
const path = document.location.pathname;
document.write(`It's working from path <b>${path}</b>`);

document.addEventListener('DOMContentLoaded', () => {
  const tests = [
    { url: '/', name: 'index', re: /^<!DOCTYPE html>/ },
    { url: '/test', name: 'unexisting path', re: /^<!DOCTYPE html>/ },
    { url: '/file.txt', name: 'existing path', re: /^file/ }
  ];

  const table = document.createElement('table');
  const tbody = document.createElement('tbody');
  table.appendChild(tbody);
  document.body.appendChild(table);

  tests.forEach((test) => {
    const tr = document.createElement('tr');
    tbody.appendChild(tr);
    check(test.url, test.re, (res) => {
      tr.innerHTML = `<td>${test.name}</td>`;
      tr.innerHTML += `<td><a href="${test.url}">${test.url}</a></td>`;
      tr.innerHTML += `<td class="${res}">${res}</td>`;
    });
  });
});

function check(url, re, cb) {
  const xhr = new XMLHttpRequest();
  xhr.addEventListener('load', () => {
    cb(re.test(xhr.responseText) ? 'ok' : 'error');
  });
  xhr.open('GET', url);
  xhr.send();
}
