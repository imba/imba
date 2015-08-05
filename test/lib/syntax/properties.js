(function(){
	
	function Model(nestings){
		if(nestings === undefined) nestings = 0;
		this._gets = 0;
		this._sets = 0;
		this._calls = 0;
		this;
	};
	
	
	Model.prototype.__a = {name: 'a'};
	Model.prototype.a = function(v){ return this._a; }
	Model.prototype.setA = function(v){ this._a = v; return this; };
	
	Model.prototype.__b = {default: 10,name: 'b'};
	Model.prototype.b = function(v){ return this._b; }
	Model.prototype.setB = function(v){ this._b = v; return this; }
	Model.prototype._b = 10;
	
	Model.prototype.setIvar = function (val){
		this._sets = this._sets + 1;
		return this._ivar = val;
	};
	
	Model.prototype.ivar = function (){
		this._gets = this._gets + 1;
		return this._ivar;
	};
	
	Model.prototype.child = function (){
		this._calls = this._calls + 1;
		return this._child;
	};
	
	Model.prototype.gets = function (){
		return this._gets;
	};
	
	Model.prototype.sets = function (){
		return this._sets;
	};
	
	Model.prototype.calls = function (){
		return this._calls;
	};
	
	Model.prototype.reset = function (){
		this._gets = 0;
		this._sets = 0;
		this._calls = 0;
		if (this._child) { this._child.reset() };
		return this;
	};
	
	Model.prototype.testmeth1 = function (){
		this.reset();
		this._ivar = 10;
		var ivar = this.ivar();
		ivar;
		return this;
	};
	
	
	
	// Assignment
	// ----------
	
	// * Assignment
	// * Compound Assignment
	// * Destructuring Assignment
	// * Context Property (@) Assignment
	// * Existential Assignment (?=)
	describe('Syntax - Properties',function() {
		
		return test("default values",function() {
			var object = new Model();
			eq(object.a(),undefined);
			return eq(object.b(),10);
		});
	});

})()