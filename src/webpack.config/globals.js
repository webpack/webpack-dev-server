const {ProvidePlugin} = require('webpack')

module.exports = ({
  globals={},
  packagejson={dependencies:{}, devDependencies:{}}
}) => (function (config) {

  let  {dependencies, devDependencies} = packagejson
  if (Object.keys(dependencies || {}).indexOf("react") > -1 ||
      Object.keys(devDependencies || {}).indexOf("react")) {
    globals = Object.assign(globals,
      {React:'react', ReactDom:'react-dom', ReactRouter:'react-router'})
  }

  var libs = new ProvidePlugin(globals)
  config.plugins.push(libs)
  // config.jshint.globals = Object.assign(config.jshint.globals, globals)

  return config
})
