require("./example");

if(module.hot) {
	module.hot.accept(function(err) {
		if(err) {
			console.error("Cannot apply hot update", err);
		}
	});
}
