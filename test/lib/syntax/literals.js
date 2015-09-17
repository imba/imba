(function(){
	var self=this;
	self.describe("Syntax - Literals",function() {
		
		
		return self.test("hashes with dynamic keys",function() {
			var key = "b";
			var obj = {a: 1,("" + key): 2,c: 3};
			self.eq(obj.a,1);
			self.eq(obj.b,2);
			return self.eq(obj.c,3);
		});
	});

})()