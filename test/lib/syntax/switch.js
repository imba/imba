(function(){
	var self=this;
	
	self.describe('Syntax - Switch',function() {
		
		return self.test("general",function() {
			var type = 1;
			switch (type) {
				case 1:
					value = 'A';
					break;
				
				default:
				
					var value = 'B';
			
			};
			self.eq(value,'A');
			
			// compact
			switch (type) {
				case 1:
					value = 'A';break;
				
				default:
				
					value = 'B';
			
			};
			return self.eq(value,'A');
		});
	});

})()