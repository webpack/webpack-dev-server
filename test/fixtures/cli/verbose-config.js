'use strict';

module.exports = {
  context: __dirname,
  entry: './foo.js',
  mode: 'development',
  stats: {
		relatedAssets: true,
		chunkGroups: true,
		chunks: true,
  },
};
