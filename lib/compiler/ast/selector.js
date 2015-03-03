(function(){
function iter$(a){ return a ? (a.toArray ? a.toArray() : a) : []; }
AST.Selector = imba$class(function Selector(){
	AST.ListNode.apply(this,arguments);
},AST.ListNode);
AST.Selector.prototype.add = function (part,typ){
	this.push(part);
	return this;
};
AST.Selector.prototype.query = function (){
	var str = "";
	var ary = [];
	
	for(var i=0, items=iter$(this.nodes()), len=items.length; i < len; i++){
		var val = items[i].c();
		if((typeof val=='string'||val instanceof String)) {
			str = ("" + str + val);
		};
	};
	return "'" + str + "'";
};
AST.Selector.prototype.js = function (o){
	var typ = this.option('type');
	
	return (typ == '%') ? (("q$(" + (this.query().c()) + "," + (o.scope().context().c({explicit: true})) + ")")) : ((typ == '%%') ? (("q$$(" + (this.query().c()) + "," + (o.scope().context().c()) + ")")) : (("q" + typ + "(" + (this.query().c()) + ")")));
};
AST.SelectorPart = imba$class(function SelectorPart(){
	AST.ValueNode.apply(this,arguments);
},AST.ValueNode);
AST.SelectorPart.prototype.c = function (){
	return "" + (this.value().c());
};
AST.SelectorType = imba$class(function SelectorType(){
	AST.SelectorPart.apply(this,arguments);
},AST.SelectorPart);
AST.SelectorType.prototype.c = function (){
	var name = this.value().name();
	return (idx$(name,TAG_TYPES.HTML) >= 0) ? (name) : (this.value().sel());
};
AST.SelectorUniversal = imba$class(function SelectorUniversal(){
	AST.SelectorPart.apply(this,arguments);
},AST.SelectorPart);

AST.SelectorNamespace = imba$class(function SelectorNamespace(){
	AST.SelectorPart.apply(this,arguments);
},AST.SelectorPart);

AST.SelectorClass = imba$class(function SelectorClass(){
	AST.SelectorPart.apply(this,arguments);
},AST.SelectorPart);
AST.SelectorClass.prototype.c = function (){
	return "." + (this.value().c());
};
AST.SelectorId = imba$class(function SelectorId(){
	AST.SelectorPart.apply(this,arguments);
},AST.SelectorPart);
AST.SelectorId.prototype.c = function (){
	return "#" + (this.value().c());
};
AST.SelectorCombinator = imba$class(function SelectorCombinator(){
	AST.SelectorPart.apply(this,arguments);
},AST.SelectorPart);
AST.SelectorCombinator.prototype.c = function (){
	return "" + this.value();
};
AST.SelectorPseudoClass = imba$class(function SelectorPseudoClass(){
	AST.SelectorPart.apply(this,arguments);
},AST.SelectorPart);

AST.SelectorAttribute = imba$class(function SelectorAttribute(left,op,right){
	this._left = left;
	this._op = op;
	this._right = this._value = right;
},AST.SelectorPart);
AST.SelectorAttribute.prototype.c = function (){
	return (this._right instanceof AST.Str) ? (("[" + (this._left.c()) + this._op + (this._right.c()) + "]")) : ((this._right) ? (("[" + (this._left.c()) + this._op + "\"'+" + (this._right.c()) + "+'\"]")) : (("[" + (this._left.c()) + "]")));
};
}())