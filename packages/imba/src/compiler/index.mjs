import * as fs from 'fs';
import * as path from 'path';
import * as compiler from './compiler.mjs';
import * as nodeModule from 'module';
const require = nodeModule.createRequire(import.meta.url);
var self = {};
// imba$v2=0
// everything should be moved to this file instead
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
	var Module = nodeModule.Module;
	main.filename = process.argv[1] = (filename ? fs.realpathSync(filename) : '.');
	main.moduleCache && (main.moduleCache = {});
	
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
