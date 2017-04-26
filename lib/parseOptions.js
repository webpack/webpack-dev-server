const webpack = require("webpack");
const OptionsValidationError = require("./OptionsValidationError");
const optionsSchema = require("./optionsSchema.json");

function parseOptions(options) {
	// Default options
	if(!options) options = {};

	const validationErrors = webpack.validateSchema(optionsSchema, options);
	if(validationErrors.length) {
		throw new OptionsValidationError(validationErrors);
	}

	if(options.lazy && !options.filename) {
		throw new Error("'filename' option must be set in lazy mode.");
	}

	return options;
}

module.exports = parseOptions;
