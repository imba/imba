(function(){
	
	describe('Syntax - Switch',function() {
		
		return test("general",function() {
			var type = 1;
			switch (type) {
				case 1:
					value = 'A';
					break;
				
				default:
				
					var value = 'B';
			
			};
			eq(value,'A');
			
			// compact
			switch (type) {
				case 1:
					value = 'A';break;
				
				default:
				
					value = 'B';
			
			};
			return eq(value,'A');
		});
	});

})()