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
	;
	function iter$(a){ return a ? (a.toArray ? a.toArray() : a) : []; };;
	idx$ = function(a,b){
		return (b && b.indexOf) ? b.indexOf(a) : [].indexOf.call(a,b);
	};
	
	/* @class Selector */
	AST.Selector = function Selector(){ AST.ListNode.apply(this,arguments) };
	
	subclass$(AST.Selector,AST.ListNode);
	AST.Selector.prototype.add = function (part,typ){
		// p "select add!",part,typ
		this.push(part);
		return this;
	};
	
	AST.Selector.prototype.query = function (){
		var str = "";
		var ary = [];
		
		for(var i=0, items=iter$(this.nodes()), len=items.length; i < len; i++) {
			var val = items[i].c();
			if((typeof val=='string'||val instanceof String)) {
				str = ("" + str + val);
			};
			// else
			// 	p "is not a string(!)"
		};
		
		return "'" + str + "'";
		// ary.push(str.quoted)
		// ary.c.join("+")
	};
	
	AST.Selector.prototype.js = function (o){
		var typ = this.option('type');
		// var scoped = typ == '%' or typ == '%%'
		// var all = typ == '$' or typ == '%'
		
		return (typ == '%') ? (
			("q$(" + (this.query().c()) + "," + (o.scope().context().c({explicit: true})) + ")")// explicit context
		) : ((typ == '%%') ? (
			("q$$(" + (this.query().c()) + "," + (o.scope().context().c()) + ")")
		) : (
			("q" + typ + "(" + (this.query().c()) + ")")
		));
		
		// return "{typ} {scoped} - {all}"
	};
	
	
	
	/* @class SelectorPart */
	AST.SelectorPart = function SelectorPart(){ AST.ValueNode.apply(this,arguments) };
	
	subclass$(AST.SelectorPart,AST.ValueNode);
	AST.SelectorPart.prototype.c = function (){
		return "" + (this.value().c());
	};
	
	
	/* @class SelectorType */
	AST.SelectorType = function SelectorType(){ AST.SelectorPart.apply(this,arguments) };
	
	subclass$(AST.SelectorType,AST.SelectorPart);
	AST.SelectorType.prototype.c = function (){
		// support
		// p "selectortype {value}"
		// var out = value.c
		var name = this.value().name();
		// hmm - what about svg? do need to think this through.
		// at least be very conservative about which tags we
		// can drop the tag for?
		// out in TAG_TYPES.HTML ? 
		return (idx$(name,TAG_TYPES.HTML) >= 0) ? (name) : (this.value().sel());
	};
	
	
	
	/* @class SelectorUniversal */
	AST.SelectorUniversal = function SelectorUniversal(){ AST.SelectorPart.apply(this,arguments) };
	
	subclass$(AST.SelectorUniversal,AST.SelectorPart);
	
	
	/* @class SelectorNamespace */
	AST.SelectorNamespace = function SelectorNamespace(){ AST.SelectorPart.apply(this,arguments) };
	
	subclass$(AST.SelectorNamespace,AST.SelectorPart);
	
	
	/* @class SelectorClass */
	AST.SelectorClass = function SelectorClass(){ AST.SelectorPart.apply(this,arguments) };
	
	subclass$(AST.SelectorClass,AST.SelectorPart);
	AST.SelectorClass.prototype.c = function (){
		return "." + (this.value().c());
	};
	
	
	/* @class SelectorId */
	AST.SelectorId = function SelectorId(){ AST.SelectorPart.apply(this,arguments) };
	
	subclass$(AST.SelectorId,AST.SelectorPart);
	AST.SelectorId.prototype.c = function (){
		return "#" + (this.value().c());
	};
	
	
	/* @class SelectorCombinator */
	AST.SelectorCombinator = function SelectorCombinator(){ AST.SelectorPart.apply(this,arguments) };
	
	subclass$(AST.SelectorCombinator,AST.SelectorPart);
	AST.SelectorCombinator.prototype.c = function (){
		return "" + this.value();
	};
	
	
	/* @class SelectorPseudoClass */
	AST.SelectorPseudoClass = function SelectorPseudoClass(){ AST.SelectorPart.apply(this,arguments) };
	
	subclass$(AST.SelectorPseudoClass,AST.SelectorPart);
	
	
	/* @class SelectorAttribute */
	AST.SelectorAttribute = function SelectorAttribute(left,op,right){
		this._left = left;
		this._op = op;
		this._right = this._value = right;
	};
	
	subclass$(AST.SelectorAttribute,AST.SelectorPart);
	
	
	AST.SelectorAttribute.prototype.c = function (){
		// TODO possibly support .toSel or sel$(v) for items inside query
		// could easily do it with a helper-function that is added to the top of the filescope
		return (this._right instanceof AST.Str) ? (
			("[" + (this._left.c()) + this._op + (this._right.c()) + "]")
		) : ((this._right) ? (
			// this is not at all good
			("[" + (this._left.c()) + this._op + "\"'+" + (this._right.c()) + "+'\"]")
		) : (
			("[" + (this._left.c()) + "]")
			
			// ...
		));
	};
	


}())