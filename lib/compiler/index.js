var __root = {};
// everything should be moved to this file instead
var fs = require('fs');
var path = require('path');

var compiler = require('./compiler');
var parser = compiler.parser;

__root.tokenize = function (code,o){
	if(o === undefined) o = {};
	return compiler.tokenize(code,o);
}; exports.tokenize = __root.tokenize;

__root.rewrite = function (code,o){
	if(o === undefined) o = {};
	return compiler.rewrite(code,o);
}; exports.rewrite = __root.rewrite;

__root.parse = function (code,o){
	return compiler.parse(code,o);
}; exports.parse = __root.parse;

__root.compile = function (code,o){
	if(o === undefined) o = {};
	return compiler.compile(code,o);
}; exports.compile = __root.compile;

__root.analyze = function (code,o){
	if(o === undefined) o = {};
	return compiler.analyze(code,o);
}; exports.analyze = __root.analyze;

__root.run = function (code,pars){
	// console.log 'run code via run in index',filename
	var $1, $2;
	if(!pars||pars.constructor !== Object) pars = {};
	var filename = pars.filename !== undefined ? pars.filename : null;
	var main = require.main;
	main.filename = process.argv[1] = (filename ? fs.realpathSync(filename) : '.');
	main.moduleCache && (main.moduleCache = {}); // removing all cache?!?
	
	var Module = require('module').Module;
	main.paths = Module._nodeModulePaths(path.dirname(filename));
	
	if (path.extname(main.filename) != '.imba' || require.extensions) {
		arguments[1].target || (arguments[1].target = 'node');
		arguments[1].standalone || (arguments[1].standalone = true);
		var content = compiler.compile(code,arguments[1]);
		return main._compile((content.js || content),main.filename);
	} else {
		return main._compile(code,main.filename);
	};
}; exports.run = __root.run;

if (require.extensions) {
	require.extensions['.imba'] = function(mod,filename) {
		var body = fs.readFileSync(filename,'utf8');
		var content = compiler.compile(body,{filename: filename,target: 'node'});
		return mod._compile((content.js),filename);
	};
};
