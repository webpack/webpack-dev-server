'use strict';

function getCompilerConfigArray(compiler) {
  const compilers = compiler.compilers ? compiler.compilers : [compiler];
  return compilers.map((comp) => comp.options);
}

module.exports = getCompilerConfigArray;
