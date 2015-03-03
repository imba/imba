(function(){
AST.Splat = imba$class(function Splat(){
	AST.ValueNode.apply(this,arguments);
},AST.ValueNode);
AST.Splat.prototype.js = function (){
	var par = this.stack().parent();
	return (par instanceof AST.Arr) ? (("[].slice.call(" + (this.value().c()) + ")")) : ("SPLAT");
};
AST.Splat.prototype.node = function (){
	return this.value();
};
}())