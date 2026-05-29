import * as __fs_module_0 from 'fs';
import * as __path_module_1 from 'path';
import * as __compiler_module_2 from './compiler.mjs';
import * as __Module_module_3 from 'module';
var self = {};
// imba$v2=0
// everything should be moved to this file instead
var fs = __fs_module_0;
var path = __path_module_1;

var compiler = __compiler_module_2;
var parser = compiler.parser;

var tokenize = self.tokenize = function (code,o){
	if(o === undefined) o = {};
	return compiler.tokenize(code,o);
};

var rewrite = self.rewrite = function (code,o){
	if(o === undefined) o = {};
	return compiler.rewrite(code,o);
};

var parse = self.parse = function (code,o){
	return compiler.parse(code,o);
};

var compile = self.compile = function (code,o){
	if(o === undefined) o = {};
	return compiler.compile(code,o);
};

var analyze = self.analyze = function (code,o){
	if(o === undefined) o = {};
	return compiler.analyze(code,o);
};

var run = self.run = function (code,pars){
	var $1, $2;
	if(!pars||pars.constructor !== Object) pars = {};
	var filename = pars.filename !== undefined ? pars.filename : null;
	var main = require.main;
	main.filename = process.argv[1] = (filename ? fs.realpathSync(filename) : '.');
	main.moduleCache && (main.moduleCache = {});
	
	var Module = __Module_module_3.Module;
	main.paths = Module._nodeModulePaths(path.dirname(filename));
	
	if (path.extname(main.filename) != '.imba' || require.extensions) {
		arguments[1].platform || (arguments[1].platform = 'node');
		arguments[1].format || (arguments[1].format = 'cjs');
		arguments[1].raiseErrors = true;
		
		var content = compiler.compile(code,arguments[1]);
		return main._compile((content.js || content),main.filename);
	} else {
		return main._compile(code,main.filename);
	};
};

if (require.extensions) {
	require.extensions['.imba'] = function(mod,sourcePath) {
		var options = {sourcePath: sourcePath,platform: 'node'};
		
		var body = fs.readFileSync(sourcePath,'utf8');
		var content = self.compile(body,options);
		return mod._compile((content.js),sourcePath);
	};
};

export { analyze, compile, parse, rewrite, run, tokenize };
