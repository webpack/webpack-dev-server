"use strict";

const path = document.location.pathname;
const target = document.querySelector("#target");
const style = document.createElement("style");
const css = `table {
    border-radius: 0.3rem;
    border: 0.1rem solid #474747;
    border-spacing: 0;
    padding: 0;
    width: 50%;
  }

  table td {
    border-right: 0.1rem solid #474747;
    padding: 0.5rem 1rem;
  }

  table tr td:last-child {
    border-right: 0;
    text-align: center;
  }

  table td.pass {
    background: #f2f9f4;
    color: #4db277;
  }

  table td.fail {
    background: #f2dede;
    color: #a94442;
  }`;

style.appendChild(document.createTextNode(css));
document.head.appendChild(style);
target.innerHTML = `Current Path: <code>${path}</code>`;

document.addEventListener(
  "DOMContentLoaded",
  () => {
    if (document.querySelector("#files")) {
      return;
    }

    const tests = [
      { url: "/", name: "index", re: /^<!doctype html>/i },
      { url: "/test", name: "non-existent path", re: /^<!doctype html>/i },
      { url: "/file.txt", name: "existing path", re: /^file/ },
    ];
    const table = document.createElement("table");
    const tbody = document.createElement("tbody");

    table.id = "files";
    table.appendChild(tbody);
    target.parentNode.appendChild(table);

    tests.forEach((test) => {
      const tr = document.createElement("tr");
      tbody.appendChild(tr);
      check(test.url, test.re, (res) => {
        tr.innerHTML = `<td>${test.name}</td>`;
        tr.innerHTML += `<td><a href="${test.url}">${test.url}</a></td>`;
        tr.innerHTML += `<td class="${res}">${res}</td>`;
      });
    });
  },
  true,
);

function check(url, re, cb) {
  const xhr = new XMLHttpRequest();
  xhr.addEventListener("load", () => {
    cb(re.test(xhr.responseText) ? "pass" : "fail");
  });
  xhr.open("GET", url);
  xhr.send();
}
