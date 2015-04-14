(function(){


	var fs = require('fs');
	
	function build(o){
		// console.log "run build! {__dirname}"
		if(o === undefined) o = {};
		require('jison');
		// return
		var parser = require('./grammar.js').parser;
		// console.log "found parser"
		return fs.writeFile(("" + __dirname + "/parser.js"),parser.generate());
	}; exports.build = build;
	
	// var cli = require 'commander'
	// 
	// 
	// cli.command('build')
	// 	.description('build the parser')
	// 	# .option('-v, --verbose', 'return detailed output', 0, verboser)
	// 	# .option('-f, --format <format>', 'format of output', 'json', /^(json|plain|html)$/i)	
	// 	.action do |path, opts|
	// 		console.log "got here?!?"
	// 		# var file = sourcefile-for-path(path)
	// 		# var meta = await file.analyze
	// 		# log JSON.stringify(meta)
	// 
	// # require 'jison'
	// # parser = require('./lib/compiler/grammar.js').parser
	// # fs.writeFile 'lib/compiler/parser.js', parser.generate()
	// # 
	// 
	// cli.parse(process:argv)


}())