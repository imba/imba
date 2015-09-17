(function(){
	var self=this;
	
	self.describe('Syntax - Existential operator',function() {
		
		return self.test('chained',function() {
			var chain;
			function Chainable(){ };
			
			Chainable.prototype.a = function (){
				return this;
			};
			Chainable.prototype.b = function (){
				return this;
			};
			Chainable.prototype.n = function (){
				return null;
			};
			
			
			return chain = new Chainable();
			
			// eq chain.a.b.a, chain
			// ok chain?.a?.n?.err or yes
		});
	});

})()