(function(){
	// helper for subclassing
	function subclass$(obj,sup) {
		for (var k in sup) {
			if (sup.hasOwnProperty(k)) obj[k] = sup[k];
		};
		// obj.__super__ = sup;
		obj.prototype = Object.create(sup.prototype);
		obj.__super__ = obj.prototype.__super__ = sup.prototype;
		obj.prototype.initialize = obj.prototype.constructor = obj;
	};
	
	
	
	function hello(){
		return "world";
	}; exports.hello = hello;
	
	function Item(){ };
	
	exports.Item = Item; // export class 
	Item.prototype.name = function (){
		return "item";
	};
	
	
	
	function A(){ };
	
	A.prototype.name = function (){
		return "a";
	};
	
	
	function B(){ A.apply(this,arguments) };
	
	subclass$(B,A);
	B.prototype.name = function (){
		return "b";
	};
	
	
	
	module.exports.A = A;
	module.exports.B = B;
	

})()