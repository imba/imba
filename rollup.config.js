import { nodeResolve } from '@rollup/plugin-node-resolve';
import {terser} from 'rollup-plugin-terser';
var imbac = require('./dist/compiler.js');
var extname = require('path').extname;

function compile(options) {
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

function pack(input,outname,out = {},opts = {}){
    let mod = {
        input: input,
        output: Object.assign({
            file: './dist/' + outname +  '.js',
            format: 'esm',
            name: 'bundle'
        },out),
        external: function(id){
            return id[0] != '.' && id.indexOf('imba') != 0;
        },
        plugins: [
            compile(Object.assign({target: 'web'},opts)),
            nodeResolve({
                extensions: ['.imba','.js','.json'],
                preferBuiltins: true
            })
        ]
    }
    let name = mod.output.file;
    if(name.indexOf('.min') >= 0 || mod.output.compact){
        mod.plugins.push(terser());
    }
    return mod;
}

export default [
    pack('./src/imba/module','imba'),
    pack('./src/imba/module','imba.min', {compact: true}),
    pack('./src/imba/router/router','imba-router',{},{standalone: true, imbaFormat:'script'}),
]