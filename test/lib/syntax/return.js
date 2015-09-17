(function(){
	var self=this;
	self.describe('Syntax - Return',function() {
		
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
		
		return self.test("explicit",function() {
			self.eq(obj.single(),1);
			self.eq(obj.multi(),[1,2]);
			self.eq(obj.d(),undefined);
			
			var fn = function() {
				return [
					1,
					2
				];
			};
			return self.eq(fn(),[1,2]);
		});
	});

})()