'use strict';

module.exports = function options(publicPath, schema) {
  const optionNames = Object.keys(schema.properties).map((name) => {
    if (schema.required.includes(name)) {
      return name;
    }

    return `${name}?`;
  });

  return [{
    name: 'invalid `hot` configuration',
    config: { hot: 'asdf', publicPath },
    message: [
      ' - configuration.hot should be a boolean.'
    ]
  },
  {
    name: 'invalid `public` configuration',
    config: { public: 1, publicPath },
    message: [
      ' - configuration.public should be a string.'
    ]
  },
  {
    name: 'invalid `allowedHosts` configuration',
    config: { allowedHosts: 1, publicPath },
    message: [
      ' - configuration.allowedHosts should be an array:',
      '   [string]',
      '   Specifies which hosts are allowed to access the dev server.'
    ]
  },
  {
    name: 'invalid `contentBase` configuration',
    config: { contentBase: [0], publicPath },
    message: [
      ' - configuration.contentBase should be one of these:',
      '   [string] | false | number | string',
      '   A directory to serve files non-webpack files from.',
      '   Details:',
      '    * configuration.contentBase[0] should be a string.',
      '    * configuration.contentBase should be false',
      '    * configuration.contentBase should be a number.',
      '    * configuration.contentBase should be a string.'
    ]
  },
  {
    name: 'non-existing key configuration',
    config: { asdf: true, publicPath },
    message: [
      // eslint-disable-next-line quotes
      ` - configuration has an unknown property 'asdf'. These properties are valid:`,
      `   object { ${optionNames.join(', ')} }`
    ]
  }];
};
