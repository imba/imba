(function(){


	var snip = require('./snippets');
	var code = snip.NODES;
	var compiler = require("../../../lib/compiler");
	// var compiler  = require "/repos/imba/lib/compiler"
	var rawtokens = compiler.tokenize(code,{rewrite: false});
	var tokens = compiler.tokenize(code,{filename: "a"});
	var ast = compiler.parse(tokens,{filename: "a"});
	
	var arg = process.argv[2];
	// console.log compiler:ast
	// compiler:ast.compile(ast)
	
	// fs.writeFileSync("{__dirname}/snippets.imba","¨`LONG_SAMPLE = {JSON.stringify(code)};`")
	
	// class Token
	// 
	// 	def initialize value, spaced
	// 		@value = value
	// 		@spaced = spaced
	
	var helper = require('./helper');
	var b = new helper.Benchmark("tokenize",{maxTime: 1});
	
	(!arg || arg == 'lex') && b.add('lex',function (){
		return compiler.tokenize(code,{rewrite: false});// hmm
	});
	
	(!arg || arg == 'rewrite') && b.add('rewrite',function (){
		var arr = rawtokens.slice();
		return compiler.rewrite(arr);// hmm
	});
	
	// add tests
	// b.add('tokenize') do
	// 	compiler.tokenize(code) # hmm
	
	(!arg || arg == 'parse') && b.add('parse',function (){
		return compiler.parse(tokens,{filename: "a"});// hmm
	});
	
	
	(!arg || arg == 'compile') && b.add('compile',function (){
		var ast = compiler.parse(tokens);
		return ast.compile(ast);// hmm
	});
	
	(!arg || arg == 'full') && b.add('full',function (){
		compiler.compile(code,{filename: "a"});
		return;
	});
	
	
	// b.add('Token') do
	// 	var arr = []
	// 
	// 	var count = 200
	// 	while --count
	// 		var str = "mystring"
	// 		var val = Token.new(str,yes)
	// 		arr.push(val)
	// 	true
	
	// run async
	console.log(process.argv);
	b.run();


}())