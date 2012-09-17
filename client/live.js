var $ = require("jquery");
var io = require("socket.io");
require("./style.css");

$(function() {
	var body = $("body").html(require("./page.jade")());
	var status = $("#status");
	var okness = $("#okness");
	var $errors = $("#errors");
	var iframe = $("#iframe");

	status.text("Connecting to socket.io server...");
	$errors.hide(); iframe.hide();
	body.css({background: "#066"});
	io = io.connect();

	io.on("invalid", function() {
		okness.text("");
		status.text("App updated. Recompiling...");
		body.css({background: "#088"});
		$errors.hide(); iframe.hide();
	});

	io.on("ok", function() {
		okness.text("");
		$errors.hide(); iframe.show();
		reloadApp();
	});

	io.on("warnings", function(warnings) {
		okness.text("Warnings while compiling.");
		$errors.hide(); iframe.show();
		reloadApp();
	});

	io.on("errors", function(errors) {
		status.text("App updated with errors. No reload!");
		okness.text("Errors while compiling.");
		$errors.text("\n" + errors.join("\n\n\n") + "\n\n");
		body.css({background: ""});
		$errors.show(); iframe.hide();
	});

	iframe.load(function() {
		status.text("App ready.");
		body.css({background: ""});
	});

	function reloadApp() {
		status.text("App updated. Reloading app...");
		body.css({background: "red"});
		iframe.attr("src", "/content.html");
	}

});
