(function(){
	
	var helpers = require("../compiler/helpers");
	var imbac = require("../compiler/index");
	
	var path = require("path");
	var fs = require("fs");
	var package = require('../../package.json');
	
	var parseOpts = {
		alias: {h: 'help',v: 'version'},
		schema: {target: {type: 'string'}}
	};
	
	var help = "\nUsage: imba [options] path/to/script.imba\n\n  -h, --help             display this help message\n  -v, --version          display the version number\n";
	
	function lookup(src){
		src = path.resolve(process.cwd(),src);
		
		if (fs.statSync(src).isDirectory()) {
			var f = path.join(src,'index.imba');
			if (fs.existsSync(f)) {
				src = f;
			} else {
				return;
			};
		};
		
		return src;
	};
	
	function run(){
		var args = process.argv;
		var o = helpers.parseArgs(args.slice(2),parseOpts);
		var src = o.main;
		if (src instanceof Array) { src = src[0] };
		
		if (o.version) {
			return console.log(package.version);
		} else if (!o.main || o.help) {
			return console.log(help);
		};
		
		src = lookup(src);
		src = path.resolve(process.cwd(),src);
		var body = fs.readFileSync(src,'utf8');
		process.argv.shift();
		process.argv[0] = 'imba';
		
		return imbac.run(body,{filename: src,target: 'node'});
	}; exports.run = run;; return run;
	
	
	

})();