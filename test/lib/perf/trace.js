(function(){


	var lex, rewrite, tokenize, parse, compile;
	// externs;
	// var compiler = require '/repos/imba/lib/compiler'
	var compiler = imbalang;
	var snippets = require('./snippets');
	
	// var html = fs.readFileSync(__dirname + '/robot.html', 'utf8')
	// console.log(html)
	
	function bench(name,blk){
		console.time(name);
		console.profile();
		blk();
		console.timeEnd(name);
		return console.profileEnd();
	};
	
	module.exports.lex = lex = function (num,snippet){
		num = num || 1;
		snippet = snippet || snippets.NODES;
		snippet = new Array(num + 1).join(snippet + "\n");
		bench("lex",function (){
			return compiler.tokenize(snippet,{rewrite: false});
		});
		return;
	};
	
	module.exports.rewrite = rewrite = function (num,snippet){
		num = num || 1;
		
		snippet = snippet || snippets.NODES;
		snippet = new Array(num + 1).join(snippet + "\n");
		var tokens = compiler.tokenize(snippet,{rewrite: false});
		bench("rewrite",function (){
			return compiler.rewrite(tokens);
		});
		return;
	};
	
	module.exports.tokenize = tokenize = function (num,snippet){
		num = num || 1;
		snippet = snippet || snippets.NODES;
		snippet = new Array(num + 1).join(snippet + "\n");
		bench("tokenize",function (){
			return compiler.tokenize(snippet);
		});
		return;
	};
	
	module.exports.parse = parse = function (num,snippet){
		num = num || 1;
		snippet = snippet || snippets.NODES;
		snippet = new Array(num + 1).join(snippet + "\n");
		bench("parse",function (){
			return compiler.parse(snippet);
		});
		return;
	};
	
	
	module.exports.compile = compile = function (num,snippet){
		num = num || 1;
		snippet = snippet || snippets.NODES;
		snippet = new Array(num + 1).join(snippet + "\n");
		bench("compile",function (){
			return compiler.compile(snippet);
		});
		return;
	};


}())