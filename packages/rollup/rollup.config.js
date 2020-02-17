import imba from 'imba/rollup.js';
import resolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';

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
        imba({target: 'node'}),
        resolve({extensions: ['.imba', '.mjs','.js','.json'],preferBuiltins: true}),
        commonjs()
    ]
}