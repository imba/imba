(function(){


	var snip = require('./snippets');
	var code = snip.NODES;
	var compiler = require("../../../lib/compiler");
	// var compiler  = require "/repos/imba/lib/compiler"
	var rawtokens = compiler.tokenize(code,{rewrite: false});
	var tokens = compiler.tokenize(code);
	var ast = compiler.parse(tokens);
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
	
	b.add('lex',function (){
		return compiler.tokenize(code,{rewrite: false});// hmm
	});
	
	b.add('rewrite',function (){
		var arr = rawtokens.slice();
		return compiler.rewrite(arr);// hmm
	});
	
	// add tests
	b.add('tokenize',function (){
		return compiler.tokenize(code);// hmm
	});
	
	b.add('parse',function (){
		return compiler.parse(tokens);// hmm
	});
	
	b.add('compile',function (){
		var ast = compiler.parse(tokens);
		return ast.compile(ast);// hmm
		// try
		// 	compiler:ast.compile(ast) # hmm
		// catch e
		// 	console.log "ERROR {e:message}"
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
	b.run();


}())