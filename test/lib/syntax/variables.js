(function(){
	// self = SPEC
	
	describe("Syntax - Variables",function() {
		
		test("allow in expression",function() {
			
			function x(){
				if (true) {
					var a = 1;
					var b = 2;
					return 3;
				};
			};
			
			try {
				var res = x();
			} catch (e) {
				res = 0;
			};
			
			return eq(x(),3);
		});
		
		
		
		test("allow predeclaring variables",function() {
			var b;
			var a;
			b;
		});
		
		test("allow predeclaring multiple variables",function() {
			var a = 1,b = 2,c = 3;
			var x,y,z;
			
			eq(a,1);
			eq(b,2);
			return eq(c,3);
		});
		
		
		return test("allow implicit returns from var declaration",function() {
			// var hey, ho
			
			var hey = 10 ? (5) : (3);
			var blank = function() {
				return true;
			};
			
			var fn = function(a) {
				var z, b, res;
				blank(a,z = 10);
				if (b = a + 1) { var x = b * 2 };
				return res = x + 4;
			};
			
			return eq(fn(1),8);
		});
	});

})()