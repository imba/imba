(function(){


	function idx$(a,b){
		return (b && b.indexOf) ? b.indexOf(a) : [].indexOf.call(a,b);
	};
	
	var AST = require('/repos/imba/lib/compiler/nodes');
	var token = require('/repos/imba/lib/compiler/token');
	
	// var AST = ast.AST
	// var Identifier = ast.AST.Identifier
	// var Ivar = ast.AST.Ivar
	// var Const = ast.AST.Const
	// var Op = ast.AST.Op
	// var Num = ast.AST.Num
	
	function time(name,blk){
		console.time(name);
		blk();
		return console.timeEnd(name);
	};
	
	function block(blk){
		return blk();
	};
	
	
	var OP_GT = ">";
	var OP_LT = "<";
	
	var OP2 = function (op,l,r,opts){
		var s = String(op);
		
		if(s == '.') {
			if((typeof r=='string'||r instanceof String)) {
				r = new AST.Identifier(r);
			};
			
			return new AST.Access(op,l,r);
		} else if(s == '=') {
			if(l instanceof AST.Tuple) {
				return new AST.TupleAssign(op,l,r);
			};
			return new AST.Assign(op,l,r);
		} else {
			return (idx$(s,['?=','||=','&&=']) >= 0) ? (
				new AST.ConditionalAssign(op,l,r)
			) : (
				new AST.Op(op,l,r)
			)
		};
	};
	
	
	time("Literals",function (){
		var count = 1000000;
		
		var sum = 0;
		
		while(--count > 0){
			var n1 = new AST.Num("10");
			var n2 = new AST.Num("12");
			var id1 = new AST.Identifier("hello");
			var id2 = new AST.Identifier("other");
			var ivar = new AST.Ivar("hello");
			var cnst = new AST.Ivar("Hello");
			var op = OP2(OP_GT,n1,n2);
			var op2 = OP2(OP_LT,n1,n2);
			var op3 = OP2(OP_GT,n1,n2);
			var out = id1.c() + ivar.c() + id2.c() + cnst.c() + op.c() + op2.c() + op3.c();
			sum += out.length;
		};
		
		
		return console.log(sum);
	});
	
	// block do
	// console.time("b")
	// var count = 50000000
	// var a = A.new(1,2,3)
	// var sum = 0
	// 
	// while --count > 0
	// 	sum += a.invoke1
	// console.log sum
	// console.timeEnd("b")
	
	// time "b2" do
	// 
	// 	var count = 50000000
	// 	var a = A.new(1,2,3)
	// 	var sum = 0
	// 
	// 	while --count > 0
	// 		sum += a.invoke1
	// 	console.log sum
	// 
	// // Feed information into the ICs for each function
	// for (var i = 0; i < count; i++) {
	//   f1.invoke1(1);
	//   f2.invoke2(1);
	// 
	//   // The IC for invoke3 will get two different hidden class entries, which deoptimizes it
	//   if (i % 2 == 0)
	//     f1.invoke3(1);
	//   else
	//     f2.invoke3(1);
	// }
	// 
	// console.timeEnd("bench")


}())