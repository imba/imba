(function(){


	var lex, rewrite, tokenize, parse, astify, compile;
	// externs;
	// var compiler = require '/repos/imba/lib/compiler'
	var compiler = imbalang;
	var snippets = require('./snippets');
	
	// var html = fs.readFileSync(__dirname + '/robot.html', 'utf8')
	// console.log(html)
	
	function bench(name,o,blk){
		if(blk==undefined && typeof o == 'function') blk = o,o = {};
		console.time(name);
		if(!(o.profile == false)) {
			console.profile();
		};
		blk();
		console.timeEnd(name);
		if(!(o.profile == false)) {
			console.profileEnd();
		};
		return;
	};
	
	module.exports.lex = lex = function (num,o){
		if(o === undefined) o = {};
		num = num || 1;
		var snippet = new Array(num + 1).join(snippets.NODES + "\n");
		bench("lex",o,function (){
			compiler.tokenize(snippet,{rewrite: false});
			return;
		});
		
		return;
	};
	
	module.exports.rewrite = rewrite = function (num,o){
		if(o === undefined) o = {};
		num = num || 1;
		var snippet = new Array(num + 1).join(snippets.NODES + "\n");
		var tokens = compiler.tokenize(snippet,{rewrite: false});
		bench("rewrite",o,function (){
			compiler.rewrite(tokens);
			return;
		});
		return;
	};
	
	module.exports.tokenize = tokenize = function (num,o){
		if(o === undefined) o = {};
		num = num || 1;
		var snippet = new Array(num + 1).join(snippets.NODES + "\n");
		bench("tokenize",o,function (){
			compiler.tokenize(snippet);
			return;
		});
		return;
	};
	
	module.exports.parse = parse = function (num,o){
		if(o === undefined) o = {};
		num = num || 1;
		var snippet = new Array(num + 1).join(snippets.NODES + "\n");
		bench("parse",o,function (){
			compiler.parse(snippet);
			return;
		});
		return;
	};
	
	
	module.exports.astify = astify = function (num,o){
		if(o === undefined) o = {};
		num = num || 1;
		var snippet = new Array(num + 1).join(snippets.NODES + "\n");
		var tokens = compiler.tokenize(snippet,{filename: "stdin"});
		bench("parse",o,function (){
			compiler.parse(tokens);
			tokens = undefined;
			return;
		});
		return;
	};
	
	module.exports.compile = compile = function (num,o){
		if(o === undefined) o = {};
		num = num || 1;
		var snippet = new Array(num + 1).join(snippets.NODES + "\n");
		bench("compile",o,function (){
			compiler.compile(snippet);
			return;
		});
		return;
	};


}())