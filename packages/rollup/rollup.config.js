import resolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';

var imbac = require('../../dist/compiler.js');
var extname = require('path').extname;

function imba(options) {
  options = Object.assign({
    sourceMap: {},
    bare: true,
    format: 'esm',
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

export default {
    input: './src/bin.imba',
    output: {
        file: './dist/bin.js',
        format: 'cjs',
        name: 'imbaRollup',
        sourcemap: true
    },
    external: function(id){
        return id[0] != '.' && (id.indexOf('imba') != 0 || id.indexOf('imba/rollup') == 0)
    },
    plugins: [
        imba({target: 'node', format: 'esm'}),
        resolve({extensions: ['.imba', '.mjs','.js','.json'],preferBuiltins: true}),
        commonjs()
    ]
}