var $ = require("jquery");
var io = require("socket.io");
require("./style.css");

$(function() {
	var body = $("body").html(require("./page.jade")());
	var status = $("#status");
	var okness = $("#okness");
	var $errors = $("#errors");
	var iframe = $("#iframe");
	var hot = false;

	status.text("Connecting to socket.io server...");
	$errors.hide(); iframe.hide();
	body.css({background: "#066"});
	io = io.connect();

	io.on("hot", function() {
		hot = true;
		iframe.attr("src", "/content.html");
	});

	io.on("invalid", function() {
		okness.text("");
		status.text("App updated. Recompiling...");
		body.css({background: "#088"});
		$errors.hide(); iframe.hide();
	});

	io.on("ok", function() {
		okness.text("");
		$errors.hide();
		reloadApp();
	});

	io.on("warnings", function(warnings) {
		okness.text("Warnings while compiling.");
		$errors.hide();
		reloadApp();
	});

	io.on("errors", function(errors) {
		status.text("App updated with errors. No reload!");
		okness.text("Errors while compiling.");
		$errors.text("\n" + errors.join("\n\n\n") + "\n\n");
		body.css({background: ""});
		$errors.show(); iframe.hide();
	});

	io.on("disconnect", function() {
		status.text("");
		okness.text("Disconnected.");
		$errors.text("\n\n\n  Lost connection to webpack-dev-server.\n  Please restart the server to reestablish connection...\n\n\n\n");
		body.css({background: ""});
		$errors.show(); iframe.hide();
	});

	iframe.load(function() {
		status.text("App ready.");
		body.css({background: ""});
		iframe.show();
	});

	function reloadApp() {
		if(hot) {
			status.text("App hot update.");
			body.css({background: ""});
			try {
				iframe[0].contentWindow.postMessage("webpackHotUpdate", "*");
			} catch(e) {
				console.warn(e);
			}
			iframe.show();
		} else {
			status.text("App updated. Reloading app...");
			body.css({background: "red"});
			try {
				var old = iframe[0].contentWindow.location + "";
				if(old.indexOf("about") == 0) old = null;
				iframe.attr("src", old || "/content.html");
			} catch(e) {
				iframe.attr("src", "/content.html");
			}
		}
	}

});
