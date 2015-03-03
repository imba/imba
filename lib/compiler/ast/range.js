(function(){
AST.Range = imba$class(function Range(){
	AST.Op.apply(this,arguments);
},AST.Op);
AST.Range.prototype.inclusive = function (){
	return this.op() == '..';
};
AST.Range.prototype.c = function (){
	return "range";
};
}())