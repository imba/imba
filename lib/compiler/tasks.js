(function(){
var fs = require('fs');

function build(o){
	if(o === undefined) o = {};
	require('jison');
	var parser = require('./grammar.js').parser;
	return fs.writeFile(("" + __dirname + "/parser.js"),parser.generate());
}; exports.build = build;
}())