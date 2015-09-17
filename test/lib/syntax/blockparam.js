(function(){
	var self=this;
	function fn(blk,time){
		return blk(time);
	};
	
	self.describe('Syntax - Blockparam',function() {
		self.test('specify position',function() {
			var res = fn(function(mult) { return 10 * mult; },2);
			return self.eq(res,20);
		});
		
		return self.test('specify position using &',function() {
			var res = fn(function(mult) { return 10 * mult; },2);
			return self.eq(res,20);
		});
	});
	
	

})()