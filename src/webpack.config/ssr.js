
module.exports = ({
  serverSideRendering,
  sourcePath
}) => (function updateIsomorphic(config) {
  if (serverSideRendering) {

    config.target = "node";
    config.output.path = "static/";
    config.entry.app = "expose?renderRoute!./src/generate.js";
    // TODO: inject the generate script to do ssr

    // inline all the styles
    config.module.loaders.map(function(load) {
      if (load.loader.indexOf('style!') === 0) {
        load.loader = load.loader.replace('style!','');
      }
    });
  }

  return config
})

// var App = require('App'),
//   routes = require('routes')(App);
//
// var generate = function generate(path, props) {
//   var html = null;
//   Router.run(
//     routes,
//     path,
//     (Handler) =>
//       html = React.renderToString(React.createFactory(Handler)(props))
//   );
//   return html;
// };
//
// module.exports = generate;
