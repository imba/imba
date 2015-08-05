(function(){
	// everything should be moved to this file instead
	var compiler = require('./compiler');
	var parser = compiler.parser;
	
	function tokenize(code,o){
		if(o === undefined) o = {};
		return compiler.tokenize(code,o);
	}; exports.tokenize = tokenize;
	
	function rewrite(code,o){
		if(o === undefined) o = {};
		return compiler.rewrite(code,o);
	}; exports.rewrite = rewrite;
	
	function parse(code,o){
		return compiler.parse(code,o);
	}; exports.parse = parse;
	
	function compile(code,o){
		if(o === undefined) o = {};
		return compiler.compile(code,o);
	}; exports.compile = compile;
	
	function highlight(code,o){
		if(o === undefined) o = {};
		return compiler.highlight(code,o);
	}; exports.highlight = highlight;

})()