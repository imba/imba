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
	
	/* @class ExportStatement */
	AST.ExportStatement = function ExportStatement(){ AST.ValueNode.apply(this,arguments) };
	
	subclass$(AST.ExportStatement,AST.ValueNode);
	AST.ExportStatement.prototype.js = function (){
		true;
		var nodes = this._value.map(function (arg){
			return "module.exports." + (arg.c()) + " = " + (arg.c()) + ";\n";
		});
		return nodes.join("");
	};
	


}())