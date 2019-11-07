var self = {};
// imba$v2=0
// everything should be moved to this file instead
var fs = require('fs');
var path = require('path');

var compiler = require('./compiler');
var parser = compiler.parser;

exports.tokenize = self.tokenize = function (code,o){
	if(o === undefined) o = {};
	return compiler.tokenize(code,o);
};

exports.rewrite = self.rewrite = function (code,o){
	if(o === undefined) o = {};
	return compiler.rewrite(code,o);
};

exports.parse = self.parse = function (code,o){
	return compiler.parse(code,o);
};

exports.compile = self.compile = function (code,o){
	if(o === undefined) o = {};
	return compiler.compile(code,o);
};

exports.analyze = self.analyze = function (code,o){
	if(o === undefined) o = {};
	return compiler.analyze(code,o);
};

exports.run = self.run = function (code,pars){
	var $1, $2;
	if(!pars||pars.constructor !== Object) pars = {};
	var filename = pars.filename !== undefined ? pars.filename : null;
	var main = require.main;
	main.filename = process.argv[1] = (filename ? fs.realpathSync(filename) : '.');
	main.moduleCache && (main.moduleCache = {});
	
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
};

if (require.extensions) {
	require.extensions['.imba'] = function(mod,filename) {
		var options = {filename: filename,target: 'node'};
		
		var body = fs.readFileSync(filename,'utf8');
		var content = self.compile(body,options);
		return mod._compile((content.js),filename);
	};
};
