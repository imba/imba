var Module = require('module').Module;
var fallback = Module._resolveFilename;
module.exports = require('./dist/imba.node.js');

// To make sure that once this is loaded - calls to
// require imba will always return this version
Module._resolveFilename = function (name, from) {
  if (name == "imba") {
    return __filename;
  };
  return fallback.apply(Module, arguments);
};
