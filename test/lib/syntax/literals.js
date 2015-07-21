(function(){


	describe("Syntax - Literals",function() {
		
		
		return test("hashes with dynamic keys",function() {
			var $1;
			var key = "b";
			var obj = ($1 = {a: 1},$1["" + key] = 2,$1.c = 3,$1);
			eq(obj.a,1);
			eq(obj.b,2);
			return eq(obj.c,3);
		});
	});


}())