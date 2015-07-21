(function(){


	describe('Syntax - Return',function() {
		
		/* @class SyntaxReturn */
		function SyntaxReturn(){ };
		
		SyntaxReturn.prototype.none = function (){
			return;
		};
		
		SyntaxReturn.prototype.single = function (){
			return 1;
		};
		
		SyntaxReturn.prototype.multi = function (){
			return [1,2];
		};
		
		SyntaxReturn.prototype.d = function (){
			if (true) { return };
			return 1;
		};
		
		
		var obj = new SyntaxReturn();
		
		return test("explicit",function() {
			eq(obj.single(),1);
			eq(obj.multi(),[1,2]);
			eq(obj.d(),undefined);
			
			var fn = function() {
				return [
					1,
					2
				];
			};
			return eq(fn(),[1,2]);
		});
	});


}())