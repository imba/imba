var Module = require('module').Module;
var fallback = Module._resolveFilename;
module.exports = require('./index.imba.js');

Module._resolveFilename = function(name, from) {
    if (name == "imba") {
      return __filename;
    };
    return fallback.apply(Module, arguments);
  };
  