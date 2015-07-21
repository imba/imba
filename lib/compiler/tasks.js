(function(){


	var fs = require('fs');
	var path = require('path');
	
	
	
	function build(o){
		if(o === undefined) o = {};
		var parser = require('./grammar.js').parser;
		return fs.writeFile(("" + __dirname + "/parser.js"),parser.generate());
	}; exports.build = build;
	
	function dist(o){
		if(o === undefined) o = {};
		var dest = path.normalize(("" + __dirname + "/../browser/"));
		var writer = fs.createWriteStream(("" + dest + "/main.js"));
		var browserify = require('browserify');
		
		var b = browserify({basedir: ("" + __dirname + "/../imba"),standalone: "imba"});
		b.exclude('./dom.server.js');
		b.ignore('./dom.server');
		b.add('./index.js');
		b.bundle().pipe(fs.createWriteStream(("" + dest + "/main.js")));
		
		b = browserify({basedir: ("" + __dirname + "/"),standalone: "imbalang"});
		b.add('./index.js');
		return b.bundle().pipe(fs.createWriteStream(("" + dest + "/compiler.js")));
	}; exports.dist = dist;


}())