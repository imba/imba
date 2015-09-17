(function(){
	var self=this;
	// self = SPEC
	
	function ThrowClass(){ };
	
	
	ThrowClass.prototype.__cleanup = {name: 'cleanup'};
	ThrowClass.prototype.cleanup = function(v){ return this._cleanup; }
	ThrowClass.prototype.setCleanup = function(v){ this._cleanup = v; return this; };
	
	ThrowClass.prototype.returnBeforeFinally = function (num){
		try {
			10;
			return num * 2;
		} finally {
			10;
			this.setCleanup(true);
		};
	};
	
	
	
	self.describe('Syntax - Catch',function() {
		
		return self.test("throw catch",function() {
			
			var res = false;
			var after = false;
			
			try {
				self.nometh() * 10;
			} catch (e) {
				res = 1;
			};
			self.ok(res);
			
			// also works with statements
			try {
				res = self.nometh();
			} catch (e) {
				res = 2;
			};
			self.eq(res,2);
			
			// finally is executed after the result of
			// expression is evaluated
			try {
				res = self.nometh();
			} catch (e) {
				res = 2;
			} finally {
				after = 3;
			};
			
			self.eq(res,2);
			self.eq(after,3);
			
			// check that throw works as expected
			try {
				2;
				throw 10;
			} catch (e) {
				res = e + 10;
			};
			
			self.eq(res,20);
			
			// try works alone - adds automatic catch
			try {
				res = 10;
			} catch (e) { };
			self.eq(res,10);
			
			var obj = new ThrowClass();
			self.eq(obj.returnBeforeFinally(2),4);
			return self.eq(obj.cleanup(),true);
		});
	});
	
	
	
	
	

})()