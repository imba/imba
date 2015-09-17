(function(){
	var self=this;
	self.describe("Syntax - Literals",function() {
		
		
		self.test("hashes with dynamic keys",function() {
			var $1;
			var key = "b";
			var obj = ($1 = {a: 1},$1[("" + key)] = 2,$1.c = 3,$1);
			self.eq(obj.a,1);
			self.eq(obj.b,2);
			return self.eq(obj.c,3);
		});
		
		return self.test("strings",function() {
			var str = ("tester " + 1 + " ");
			self.eq(str,"tester 1 ");
			
			
			str = ("tester " + 2 + " 			dette");
			
			return self.eq(str,"tester 2 	dette");
			
			//		"basic{100}"
			//
			//		"tester {100} 
			//
			//		dette"
			//
			//		"tester
			//		dette
			//		her"
			//		 
			//		'tester
			//		dette
			//		her'
			//
			//		"""
			//		tester
			//			dette
			//			her
			//		"""
			//
			//		"""
			//		tester {10} 
			//			dettess
			//			her
			//		"""
			//
			//		var str = "hey"
			//		var reg = /// #{str} ///
			//		eq reg.test("hey"), true
		});
	});

})()