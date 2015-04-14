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
	
	/* @class Range */
	AST.Range = function Range(){ AST.Op.apply(this,arguments) };
	
	subclass$(AST.Range,AST.Op);
	AST.Range.prototype.inclusive = function (){
		return this.op() == '..';
	};
	
	AST.Range.prototype.c = function (){
		return "range";
	};
	


}())