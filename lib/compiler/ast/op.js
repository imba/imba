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
	idx$ = function(a,b){
		return (b && b.indexOf) ? b.indexOf(a) : [].indexOf.call(a,b);
	};
	
	/* @class Op */
	AST.Op = function Op(o,l,r){
		this._invert = false;
		this.setOp(o);
		this.setLeft(l);
		(this.setRight(r),r);
	};
	
	subclass$(AST.Op,AST.Node);
	
	AST.Op.prototype.__op = {};
	AST.Op.prototype.op = function(v){ return this._op; }
	AST.Op.prototype.setOp = function(v){ this._op = v; return this; };
	
	AST.Op.prototype.__left = {};
	AST.Op.prototype.left = function(v){ return this._left; }
	AST.Op.prototype.setLeft = function(v){ this._left = v; return this; };
	
	AST.Op.prototype.__right = {};
	AST.Op.prototype.right = function(v){ return this._right; }
	AST.Op.prototype.setRight = function(v){ this._right = v; return this; };
	
	
	
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
		
		// if @invert
		// p "op is inverted!!!"
		
		if(this.left() && this.right()) {
			out = ("" + (this.left().c()) + " " + op + " " + (this.right().c()));
		} else if(this.left()) {
			out = ("" + op + (this.left().c()));
		};
		// out = out.parenthesize if up isa AST.Op # really?
		return out;
	};
	
	AST.Op.prototype.shouldParenthesize = function (){
		return this.option('parens');
	};
	
	AST.Op.prototype.precedence = function (){
		return 10;
	};
	
	AST.Op.prototype.consume = function (node){
		// p "Op.consume {node}".cyan
		if(this.isExpressable()) {
			return AST.Op.__super__.consume.apply(this,arguments);
		};
		
		// TODO can rather use global caching?
		var tmpvar = this.scope__().declare('tmp',null,{system: true});
		var clone = OP(this.op(),this.left(),null);
		var ast = this.right().consume(clone);
		if(node) {
			ast.consume(node);
		};
		return ast;
	};
	
	
	/* @class ComparisonOp */
	AST.ComparisonOp = function ComparisonOp(){ AST.Op.apply(this,arguments) };
	
	subclass$(AST.ComparisonOp,AST.Op);
	AST.ComparisonOp.prototype.invert = function (){
		var op = this.op();
		var pairs = ["==","!=","===","!==",">","<=","<",">="];
		var idx = pairs.indexOf(op);
		idx += ((idx % 2) ? (-1) : (1));
		
		// p "inverted comparison(!) {idx} {op} -> {pairs[idx]}"
		this.setOp(pairs[idx]);
		this._invert = !(this._invert);
		return this;
	};
	
	AST.ComparisonOp.prototype.c = function (){
		return (this.left() instanceof AST.ComparisonOp) ? (
			this.left().right().cache(),
			OP('&&',this.left(),OP(this.op(),this.left().right(),this.right())).c()
		) : (
			AST.ComparisonOp.__super__.c.apply(this,arguments)
		);
	};
	
	
	
	/* @class MathOp */
	AST.MathOp = function MathOp(){ AST.Op.apply(this,arguments) };
	
	subclass$(AST.MathOp,AST.Op);
	AST.MathOp.prototype.c = function (){
		if(this.op() == '∪') {
			return this.util().union(this.left(),this.right()).c();
		} else if(this.op() == '∩') {
			return this.util().intersect(this.left(),this.right()).c();
		};
	};
	
	
	
	/* @class UnaryOp */
	AST.UnaryOp = function UnaryOp(){ AST.Op.apply(this,arguments) };
	
	subclass$(AST.UnaryOp,AST.Op);
	AST.UnaryOp.prototype.invert = function (){
		if(this.op() == '!') {
			return this.left();
		} else {
			return AST.UnaryOp.__super__.invert.apply(this,arguments);// regular invert
		};
	};
	
	AST.UnaryOp.prototype.js = function (){
		// all of this could really be done i a much
		// cleaner way.
		if(this.left()) {
			this.left().set({parens: true});
		};
		if(this.right()) {
			this.right().set({parens: true});
		};
		
		return (this.op() == '!') ? (
			this.left().set({parens: true}),
			("" + this.op() + (this.left().c()))
		) : ((this.op() == '√') ? (
			("Math.sqrt(" + (this.left().c()) + ")")
		) : ((this.left()) ? (
			("" + (this.left().c()) + this.op())
		) : (
			("" + this.op() + (this.right().c()))
		)));
	};
	
	AST.UnaryOp.prototype.normalize = function (){
		if(this.op() == '!' || this.op() == '√') {
			return this;
		};
		var node = (this.left() || this.right()).node();
		// for property-accessors we need to rewrite the ast
		if(!((node instanceof AST.PropertyAccess))) {
			return this;
		};
		
		// ask to cache the path
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
		return (norm == this) ? (AST.UnaryOp.__super__.consume.apply(this,arguments)) : (norm.consume(node));
	};
	
	AST.UnaryOp.prototype.c = function (){
		var norm = this.normalize();
		return (norm == this) ? (AST.UnaryOp.__super__.c.apply(this,arguments)) : (norm.c());
	};
	
	
	/* @class InstanceOf */
	AST.InstanceOf = function InstanceOf(){ AST.Op.apply(this,arguments) };
	
	subclass$(AST.InstanceOf,AST.Op);
	AST.InstanceOf.prototype.js = function (o){
		// fix checks for String and Number
		// p right.inspect
		
		if(this.right() instanceof AST.Const) {
			// WARN otherwise - what do we do? does not work with dynamic
			// classes etc? Should probably send to utility function isa$
			var name = this.right().value();
			var obj = this.left().node();
			// TODO also check for primitive-constructor
			if(idx$(name,['String','Number','Boolean']) >= 0) {
				if(!((obj instanceof AST.LocalVarAccess))) {
					obj.cache();
				};
				// need a double check for these (cache left) - possibly
				return ("(typeof " + (obj.c()) + "=='" + (name.toLowerCase()) + "'||" + (obj.c()) + " instanceof " + name + ")");
				
				// convert
			};
		};
		var out = ("" + (this.left().c()) + " " + this.op() + " " + (this.right().c()));
		if(o.parent() instanceof AST.Op) {
			out = out.parenthesize();
		};
		return out;
	};
	
	
	/* @class TypeOf */
	AST.TypeOf = function TypeOf(){ AST.Op.apply(this,arguments) };
	
	subclass$(AST.TypeOf,AST.Op);
	AST.TypeOf.prototype.js = function (){
		return "typeof " + (this.left().c());
	};
	
	
	/* @class Delete */
	AST.Delete = function Delete(){ AST.Op.apply(this,arguments) };
	
	subclass$(AST.Delete,AST.Op);
	AST.Delete.prototype.js = function (){
		// TODO this will execute calls several times if the path is not directly to an object
		// need to cache the receiver
		var tmp = this.scope__().temporary(this,{type: 'val'});
		var ast = [OP('=',tmp,this.left()),("delete " + (this.left().c())),tmp];
		return ast.c();// .parenthesize # should really force parenthesis here, no?
		// left.cache # first deleting the value?
		// "({left.c},delete {left.c}"
	};
	
	AST.Delete.prototype.shouldParenthesize = function (){
		return true;
	};
	
	
	/* @class In */
	AST.In = function In(){ AST.Op.apply(this,arguments) };
	
	subclass$(AST.In,AST.Op);
	AST.In.prototype.invert = function (){
		this._invert = !(this._invert);
		return this;
	};
	
	AST.In.prototype.js = function (){
		var cond = (this._invert) ? ("== -1") : (">= 0");
		var idx = AST.Util.indexOf(this.left(),this.right());
		return "" + (idx.c()) + " " + cond;
	};
	


}())