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
	
	/* @class Splat */
	AST.Splat = function Splat(){ AST.ValueNode.apply(this,arguments) };
	
	subclass$(AST.Splat,AST.ValueNode);
	AST.Splat.prototype.js = function (){
		var par = this.stack().parent();
		return (par instanceof AST.Arr) ? (
			("[].slice.call(" + (this.value().c()) + ")")
		) : (
			"SPLAT"
		);
	};
	
	
	AST.Splat.prototype.node = function (){
		return this.value();
	};
	


}())