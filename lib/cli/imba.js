
var helpers = require("../compiler/helpers");
var imbac = require("../compiler/index");

var path = require("path");
var fs = require("fs");
var package = require('../../package.json');

var parseOpts = {
	alias: {h: 'help',v: 'version',e: 'eval'},
	schema: {eval: {type: 'string'}}
};

var help = "\nUsage: imba [options] [ -e script | script.imba ] [arguments]\n\n  -e, --eval script      evaluate script\n      --es6              compile files for es6\n  -h, --help             display this help message\n  -v, --version          display the version number\n";

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
	
	process.argv.shift();
	process.argv[0] = 'imba';
	
	if (o.version) {
		return console.log(package.version);
	} else if ((!o.main && !o.eval) || o.help) {
		return console.log(help);
	};
	
	if (o.es6) {
		process.env.IMBA_ES6 = true;
	};
	
	if (o.eval) {
		o.target = 'node';
		return imbac.run(o.eval,o);
	};
	
	src = lookup(src);
	src = path.resolve(process.cwd(),src);
	var body = fs.readFileSync(src,'utf8');
	o.target = 'node';
	o.sourcePath = o.filename = src;
	return imbac.run(body,o);
}; exports.run = run;



