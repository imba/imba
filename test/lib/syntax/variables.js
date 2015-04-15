(function(){


	// self = SPEC
	
	describe("Syntax - Variables",function (){
		test("allow predeclaring variables",function (){
			var b;
			var a;
			b;
		});
		
		test("allow predeclaring multiple variables",function (){
			var a, b, c;
			var a = 1,b = 2,c = 3;
			var x,y,z;
		});
		
		
		return test("allow implicit returns from var declaration",function (){
			var hey = (10) ? (5) : (3);
			var blank = function (){
				return true;
			};
			
			var fn = function (a){
				var z, b, res;
				blank(a,z = 10);
				if(b = a + 1) {
					var x = b * 2;
				};
				return res = x + 4;
			};
			
			return eq(fn(1),8);
		});
	});


}())