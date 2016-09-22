var path = document.location.pathname;
document.write("It's working from path <b>" + path + "</b>");

document.addEventListener("DOMContentLoaded", function() {
	var tests = [
		{ url: "/", name: "index", re: /^<!DOCTYPE html>/ },
		{ url: "/test", name: "unexisting path", re: /^<!DOCTYPE html>/ },
		{ url: "/file.txt", name: "existing path", re: /^file/ },
	];

	var table = document.createElement("table");
	var tbody = document.createElement("tbody");
	table.appendChild(tbody);
	document.body.appendChild(table);

	tests.forEach(function(test) {
		var tr = document.createElement("tr");
		tbody.appendChild(tr);
		check(test.url, test.re, function(res) {
			tr.innerHTML = "<td>" + test.name + "</td>";
			tr.innerHTML += "<td><a href=\"" + test.url + "\">" + test.url + "</a></td>";
			tr.innerHTML += "<td class=\"" + res + "\">" + res + "</td>";
		});
	});
});

function check(url, re, cb) {
	var xhr = new XMLHttpRequest();
	xhr.addEventListener("load", function() {
		cb(re.test(xhr.responseText) ? "ok" : "error");
	});
	xhr.open("GET", url);
	xhr.send();
}
