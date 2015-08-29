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
		// var writer = fs.createWriteStream("{dest}/main.js")
		var browserify = require('browserify');
		var uglify = require('uglifyify');
		
		var lib = browserify({basedir: ("" + __dirname + "/../imba"),standalone: "imba"});
		lib.add('./browser.js');
		lib.bundle().pipe(fs.createWriteStream(("" + dest + "/imba.js")));
		
		var min = browserify({basedir: ("" + __dirname + "/../imba"),standalone: "imba"});
		min.add('./browser.js');
		min.transform({sourcemap: false},'uglifyify');
		min.bundle().pipe(fs.createWriteStream(("" + dest + "/imba.min.js")));
		
		var b = browserify({basedir: ("" + __dirname + "/"),standalone: "Imbac"});
		b.add('./index.js');
		b.bundle().pipe(fs.createWriteStream(("" + dest + "/compiler.js")));
		
		var bmin = browserify({basedir: ("" + __dirname + "/"),standalone: "Imbac"});
		bmin.add('./index.js');
		bmin.transform({sourcemap: false},'uglifyify');
		return bmin.bundle().pipe(fs.createWriteStream(("" + dest + "/compiler.min.js")));
	}; exports.dist = dist;

})()