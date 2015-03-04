(function(){
AST.Access = imba$class(function Access(){
	AST.Op.apply(this,arguments);
},AST.Op);
AST.Access.prototype.clone = function (left,right){
	var ctor = this.constructor;
	return new ctor(this.op(),left,right);
};
AST.Access.prototype.js = function (){
	var raw = null;
	var rgt = this.right();
	if((rgt instanceof AST.Index) && ((rgt.value() instanceof AST.Str) || (rgt.value() instanceof AST.Symbol))) {
		rgt = rgt.value();
	};
	if((rgt instanceof AST.Str) && rgt.isValidIdentifier()) {
		raw = rgt.raw();
	} else {
		if((rgt instanceof AST.Symbol) && rgt.isValidIdentifier()) {
			raw = rgt.raw();
		} else {
			if((rgt instanceof AST.Identifier) && rgt.isValidIdentifier()) {
				raw = rgt.c();
			}
		}
	};
	var ctx = (this.left() || this.scope__().context());
	
	if(ctx instanceof AST.RootScopeContext) {
		return ((raw) ? (raw) : (("global[" + (rgt.c()) + "]")));
	};
	if(raw) {
		return (ctx) ? (("" + (ctx.c()) + "." + raw)) : (raw);
	} else {
		return ("" + (ctx.c()) + "[" + (rgt.c()) + "]");
	};
};
AST.Access.prototype.visit = function (){
	if(this.left()) {
		this.left().traverse();
	};
	return (this.right()) && (this.right().traverse());
};
AST.Access.prototype.isExpressable = function (){
	return true;
};
AST.Access.prototype.isExpressable = function (){
	return true;
};
AST.Access.prototype.alias = function (){
	return (this.right() instanceof AST.Identifier) ? (this.right().toSymbol()) : (AST.Access.prototype.__super.alias.apply(this,arguments));
};
AST.Access.prototype.safechain = function (){
	return this.right().safechain();
};
AST.LocalVarAccess = imba$class(function LocalVarAccess(){
	AST.Access.apply(this,arguments);
},AST.Access);

AST.LocalVarAccess.prototype.__safechain = {};
AST.LocalVarAccess.prototype.safechain = function(v){ return this._safechain; }
AST.LocalVarAccess.prototype.setSafechain = function(v){ this._safechain = v; return this; }
;

AST.LocalVarAccess.prototype.js = function (){
	if((this.right() instanceof AST.Variable) && this.right().type() == 'meth') {
		if(!((this.up() instanceof AST.Call))) {
			return ("" + (this.right().c()) + "()");
		};
	};
	return this.right().c();
};
AST.LocalVarAccess.prototype.variable = function (){
	return this.right();
};
AST.LocalVarAccess.prototype.cache = function (o){
	if(o === undefined) o = {};
	if(o.force) {
		AST.LocalVarAccess.prototype.__super.cache.apply(this,arguments);
	};
	return this;
};
AST.LocalVarAccess.prototype.alias = function (){
	return this.variable()._alias || AST.LocalVarAccess.prototype.__super.alias.apply(this,arguments);
};
AST.GlobalVarAccess = imba$class(function GlobalVarAccess(){
	AST.ValueNode.apply(this,arguments);
},AST.ValueNode);
AST.GlobalVarAccess.prototype.js = function (){
	return this.value().c();
};
AST.ObjectAccess = imba$class(function ObjectAccess(){
	AST.Access.apply(this,arguments);
},AST.Access);

AST.PropertyAccess = imba$class(function PropertyAccess(){
	AST.Access.apply(this,arguments);
},AST.Access);
AST.PropertyAccess.prototype.js = function (o){
	var rec;
	if(rec = this.receiver()) {
		var ast = CALL(OP('.',this.left(),this.right()),[]);
		ast.setReceiver(rec);
		return ast.c();
	};
	var js = ("" + AST.PropertyAccess.prototype.__super.js.apply(this,arguments));
	if(!((this.up() instanceof AST.Call) || (this.up() instanceof AST.Util.IsFunction))) {
		js += "()";
	};
	return js;
};
AST.PropertyAccess.prototype.receiver = function (){
	return ((this.left() instanceof AST.SuperAccess) || (this.left() instanceof AST.Super)) ? (AST.SELF) : (null);
};
AST.IvarAccess = imba$class(function IvarAccess(){
	AST.Access.apply(this,arguments);
},AST.Access);
AST.IvarAccess.prototype.cache = function (){
	return this;
};
AST.ConstAccess = imba$class(function ConstAccess(){
	AST.Access.apply(this,arguments);
},AST.Access);

AST.IndexAccess = imba$class(function IndexAccess(){
	AST.Access.apply(this,arguments);
},AST.Access);
AST.IndexAccess.prototype.cache = function (o){
	if(o === undefined) o = {};
	if(o.force) {
		return AST.IndexAccess.prototype.__super.cache.apply(this,arguments);
	};
	this.right().cache();
	return this;
};
AST.SuperAccess = imba$class(function SuperAccess(){
	AST.Access.apply(this,arguments);
},AST.Access);
AST.SuperAccess.prototype.js = function (o){
	var m = o.method();
	var out = null;
	var up = o.parent();
	var deep = (o.parent() instanceof AST.Access);
	if(false && m && m.type() == 'constructor') {
		out = ("" + (this.left().c()) + ".superclass");
		if(!deep) {
			out += (".apply(" + (m.scope().context().c()) + ",arguments)");
		};
		throw "not implemented!!";
	} else {
		out = ("" + (this.left().c()) + ".__super");
		if(!((up instanceof AST.Access))) {
			out += ("." + (m.supername().c()));
			if(!((up instanceof AST.Call))) {
				out += (".apply(" + (m.scope().context().c()) + ",arguments)");
			};
		};
	};
	return out;
};
AST.SuperAccess.prototype.receiver = function (){
	return AST.SELF;
};
AST.VarOrAccess = imba$class(function VarOrAccess(){
	AST.ValueNode.apply(this,arguments);
},AST.ValueNode);
AST.VarOrAccess.prototype.visit = function (){
	var v_;
	this._identifier = this.value();
	
	var scope = this.scope__();
	var variable = scope.lookup(this.value());
	
	if(variable && variable.declarator()) {
		variable.addReference(this);
		this.setValue(variable.accessor(this));
		(this.value().setSafechain(v_=this.safechain()), v_);
	} else {
		if(this.value().symbol().indexOf('$') >= 0) {
			(this.setValue(v_=new AST.GlobalVarAccess(this.value())), v_);
		} else {
			(this.setValue(v_=new AST.PropertyAccess(".",scope.context(),this.value())), v_);
		}
	};
	return this._value.traverse();
};
AST.VarOrAccess.prototype.c = function (){
	return this.value().c();
};
AST.VarOrAccess.prototype.node = function (){
	return this.value();
};
AST.VarOrAccess.prototype.symbol = function (){
	return this.value() && this.value().symbol();
};
AST.VarOrAccess.prototype.cache = function (o){
	if(o === undefined) o = {};
	return this.value().cache(o);
};
AST.VarOrAccess.prototype.decache = function (){
	this.value().decache();
	return this;
};
AST.VarOrAccess.prototype.dom = function (){
	return this.value().dom();
};
AST.VarOrAccess.prototype.safechain = function (){
	return this._identifier.safechain();
};
AST.VarOrAccess.prototype.dump = function (){
	return {loc: this.loc()};
};
AST.VarOrAccess.prototype.loc = function (){
	var loc = this._identifier.region();
	return loc || [0, 0];
};
AST.VarOrAccess.prototype.toString = function (){
	return "VarOrAccess(" + this.value() + ")";
};
AST.VarReference = imba$class(function VarReference(){
	AST.ValueNode.apply(this,arguments);
},AST.ValueNode);

AST.VarReference.prototype.__variable = {};
AST.VarReference.prototype.variable = function(v){ return this._variable; }
AST.VarReference.prototype.setVariable = function(v){ this._variable = v; return this; }
;

AST.VarReference.prototype.js = function (o){
	var ref = this._variable;
	var out = ref.c();
	
	if(ref && !ref.option('declared')) {
		if(o.up(AST.VarBlock)) {
			ref.set({declared: true});
		} else {
			if(o.isExpression() || this.option('export')) {
				ref.autodeclare();
			} else {
				out = ("var " + out);
				ref.set({declared: true});
			}
		};
	};
	if(this.option('export')) {
		out = ("module.exports." + (ref.c()) + " = " + (ref.c()));
	};
	return out;
};
AST.VarReference.prototype.declare = function (){
	return this;
};
AST.VarReference.prototype.consume = function (node){
	this._variable && this._variable.autodeclare();
	return this;
};
AST.VarReference.prototype.visit = function (){
	var variable_, v_;
	var name = this.value().c();
	(variable_=this.variable()) || ((this.setVariable(v_=this.scope__().register(name,null)), v_));
	this.variable().setDeclarator(this);
	this.variable().addReference(this.value());
	
	if(this.option('export')) {
		this;
	};
	return this;
};
AST.VarReference.prototype.refnr = function (){
	return this.variable().references().indexOf(this.value());
};
AST.VarReference.prototype.addExpression = function (expr){
	return new AST.VarBlock([this]).addExpression(expr);
};
}())