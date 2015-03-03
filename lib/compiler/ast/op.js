(function(){
AST.Op = imba$class(function Op(o,l,r){
	this._invert = false;
	this.setOp(o);
	this.setLeft(l);
	(this.setRight(r), r);
},AST.Node);

AST.Op.prototype.__op = {};
AST.Op.prototype.op = function(v){ return this._op; }
AST.Op.prototype.setOp = function(v){ this._op = v; return this; }
;

AST.Op.prototype.__left = {};
AST.Op.prototype.left = function(v){ return this._left; }
AST.Op.prototype.setLeft = function(v){ this._left = v; return this; }
;

AST.Op.prototype.__right = {};
AST.Op.prototype.right = function(v){ return this._right; }
AST.Op.prototype.setRight = function(v){ this._right = v; return this; }
;

AST.Op.prototype.visit = function (){
	if(this._right) {
		this._right.traverse();
	};
	return (this._left) && (this._left.traverse());
};
AST.Op.prototype.isExpressable = function (){
	return !this.right() || this.right().isExpressable();
};
AST.Op.prototype.js = function (){
	var out = null;
	var op = this.op();
	
	if(this.left() && this.right()) {
		out = ("" + (this.left().c()) + " " + op + " " + (this.right().c()));
	} else {
		if(this.left()) {
			out = ("" + op + (this.left().c()));
		}
	};
	return out;
};
AST.Op.prototype.shouldParenthesize = function (){
	return this.option('parens');
};
AST.Op.prototype.precedence = function (){
	return 10;
};
AST.Op.prototype.consume = function (node){
	if(this.isExpressable()) {
		return AST.Op.prototype.__super.consume.apply(this,arguments);
	};
	var tmpvar = this.scope__().declare('tmp',null,{system: true});
	var clone = OP(this.op(),this.left(),null);
	var ast = this.right().consume(clone);
	if(node) {
		ast.consume(node);
	};
	return ast;
};
AST.ComparisonOp = imba$class(function ComparisonOp(){
	AST.Op.apply(this,arguments);
},AST.Op);
AST.ComparisonOp.prototype.invert = function (){
	var op = this.op();
	var pairs = ["==", "!=", "===", "!==", ">", "<=", "<", ">="];
	var idx = pairs.indexOf(op);
	idx += ((idx % 2) ? (-1) : (1));
	this.setOp(pairs[idx]);
	this._invert = !(this._invert);
	return this;
};
AST.ComparisonOp.prototype.c = function (){
	return (this.left() instanceof AST.ComparisonOp) ? (this.left().right().cache(), OP('&&',this.left(),OP(this.op(),this.left().right(),this.right())).c()) : (AST.ComparisonOp.prototype.__super.c.apply(this,arguments));
};
AST.MathOp = imba$class(function MathOp(){
	AST.Op.apply(this,arguments);
},AST.Op);
AST.MathOp.prototype.c = function (){
	if(this.op() == '∪') {
		return this.util().union(this.left(),this.right()).c();
	} else {
		if(this.op() == '∩') {
			return this.util().intersect(this.left(),this.right()).c();
		}
	};
};
AST.UnaryOp = imba$class(function UnaryOp(){
	AST.Op.apply(this,arguments);
},AST.Op);
AST.UnaryOp.prototype.invert = function (){
	if(this.op() == '!') {
		return this.left();
	} else {
		return AST.UnaryOp.prototype.__super.invert.apply(this,arguments);
	};
};
AST.UnaryOp.prototype.js = function (){
	if(this.left()) {
		this.left().set({parens: true});
	};
	if(this.right()) {
		this.right().set({parens: true});
	};
	
	return (this.op() == '!') ? (this.left().set({parens: true}), ("" + this.op() + (this.left().c()))) : ((this.op() == '√') ? (("Math.sqrt(" + (this.left().c()) + ")")) : ((this.left()) ? (("" + (this.left().c()) + this.op())) : (("" + this.op() + (this.right().c())))));
};
AST.UnaryOp.prototype.normalize = function (){
	if(this.op() == '!' || this.op() == '√') {
		return this;
	};
	var node = (this.left() || this.right()).node();
	if(!((node instanceof AST.PropertyAccess))) {
		return this;
	};
	if((node instanceof AST.Access) && node.left()) {
		node.left().cache();
	};
	
	var num = new AST.Num(1);
	var ast = OP('=',node,OP(this.op()[0],node,num));
	if(this.left()) {
		ast = OP((this.op()[0] == '-') ? ('+') : ('-'),ast,num);
	};
	
	return ast;
};
AST.UnaryOp.prototype.consume = function (node){
	var norm = this.normalize();
	return (norm == this) ? (AST.UnaryOp.prototype.__super.consume.apply(this,arguments)) : (norm.consume(node));
};
AST.UnaryOp.prototype.c = function (){
	var norm = this.normalize();
	return (norm == this) ? (AST.UnaryOp.prototype.__super.c.apply(this,arguments)) : (norm.c());
};
AST.InstanceOf = imba$class(function InstanceOf(){
	AST.Op.apply(this,arguments);
},AST.Op);
AST.InstanceOf.prototype.js = function (o){
	if(this.right() instanceof AST.Const) {
		var name = this.right().value();
		var obj = this.left().node();
		if(idx$(name,['String', 'Number', 'Boolean']) >= 0) {
			if(!((obj instanceof AST.LocalVarAccess))) {
				obj.cache();
			};
			return ("(typeof " + (obj.c()) + "=='" + (name.toLowerCase()) + "'||" + (obj.c()) + " instanceof " + name + ")");
		};
	};
	var out = ("" + (this.left().c()) + " " + this.op() + " " + (this.right().c()));
	if(o.parent() instanceof AST.Op) {
		out = out.parenthesize();
	};
	return out;
};
AST.TypeOf = imba$class(function TypeOf(){
	AST.Op.apply(this,arguments);
},AST.Op);
AST.TypeOf.prototype.js = function (){
	return "typeof " + (this.left().c());
};
AST.Delete = imba$class(function Delete(){
	AST.Op.apply(this,arguments);
},AST.Op);
AST.Delete.prototype.js = function (){
	var tmp = this.scope__().temporary(this,{type: 'val'});
	var ast = [OP('=',tmp,this.left()), ("delete " + (this.left().c())), tmp];
	return ast.c();
};
AST.Delete.prototype.shouldParenthesize = function (){
	return true;
};
AST.In = imba$class(function In(){
	AST.Op.apply(this,arguments);
},AST.Op);
AST.In.prototype.invert = function (){
	this._invert = !(this._invert);
	return this;
};
AST.In.prototype.js = function (){
	var cond = (this._invert) ? ("== -1") : (">= 0");
	return "idx$(" + (this.left().c()) + "," + (this.right().c()) + ") " + cond;
};
}())