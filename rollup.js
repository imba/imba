  
var imbac = require('./dist/compiler.js');
var extname = require('path').extname;

exports.default = function imba(options) {
  options = Object.assign({
    sourceMap: {},
    bare: true,
    extensions: ['.imba', '.imba2'],
    ENV_ROLLUP: true
  }, options || {});

  var extensions = options.extensions;
  delete options.extensions;
  delete options.include;
  delete options.exclude;

  return {
    transform: function(code, id) {
      var opts = Object.assign({},options,{
        sourcePath: id
      })

      if (extensions.indexOf(extname(id)) === -1) return null;
      var output = imbac.compile(code, opts);
      return { code: output.js, map: output.sourcemap };
    }
  };
};