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
	
	/* @class Access */
	AST.Access = function Access(){ AST.Op.apply(this,arguments) };
	
	subclass$(AST.Access,AST.Op);
	AST.Access.prototype.clone = function (left,right){
		var ctor = this.constructor;
		return new ctor(this.op(),left,right);
	};
	
	AST.Access.prototype.js = function (){
		var raw = null;
		var rgt = this.right();
		
		// is this right? Should not the index compile the brackets
		// or value is a symbol -- should be the same, no?
		if((rgt instanceof AST.Index) && ((rgt.value() instanceof AST.Str) || (rgt.value() instanceof AST.Symbol))) {
			rgt = rgt.value();
		};
		
		// TODO do the identifier-validation in a central place instead
		if((rgt instanceof AST.Str) && rgt.isValidIdentifier()) {
			raw = rgt.raw();
		} else if((rgt instanceof AST.Symbol) && rgt.isValidIdentifier()) {
			raw = rgt.raw();
		} else if((rgt instanceof AST.Identifier) && rgt.isValidIdentifier()) {
			raw = rgt.c();
		};
		
		// really?
		var ctx = (this.left() || this.scope__().context());
		
		if(ctx instanceof AST.RootScopeContext) {
			// this is a hacky workaround
			return ((raw) ? (raw) : (("global[" + (rgt.c()) + "]")));
		};
		
		// see if it needs quoting
		if(raw) {
			// need to check to see if it is legal
			return (ctx) ? (("" + (ctx.c()) + "." + raw)) : (raw);
		} else {
			return ("" + (ctx.c()) + "[" + (rgt.c({expression: true})) + "]");
		};
	};
	
	AST.Access.prototype.visit = function (){
		if(this.left()) {
			this.left().traverse();
		};
		if(this.right()) {
			this.right().traverse();
		};
		return;
	};
	
	AST.Access.prototype.isExpressable = function (){
		return true;// ?
	};
	
	AST.Access.prototype.isExpressable = function (){
		return true;
	};
	
	AST.Access.prototype.alias = function (){
		return (this.right() instanceof AST.Identifier) ? (this.right().toSymbol()) : (AST.Access.__super__.alias.apply(this,arguments));
	};
	
	AST.Access.prototype.safechain = function (){
		return this.right().safechain();
	};
	
	
	
	// Should change this to just refer directly to the variable? Or VarReference
	/* @class LocalVarAccess */
	AST.LocalVarAccess = function LocalVarAccess(){ AST.Access.apply(this,arguments) };
	
	subclass$(AST.LocalVarAccess,AST.Access);
	
	AST.LocalVarAccess.prototype.__safechain = {};
	AST.LocalVarAccess.prototype.safechain = function(v){ return this._safechain; }
	AST.LocalVarAccess.prototype.setSafechain = function(v){ this._safechain = v; return this; };
	
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
			AST.LocalVarAccess.__super__.cache.apply(this,arguments);
		};// hmm
		return this;
	};
	
	AST.LocalVarAccess.prototype.alias = function (){
		return this.variable()._alias || AST.LocalVarAccess.__super__.alias.apply(this,arguments);// if resolved?
	};
	
	
	
	/* @class GlobalVarAccess */
	AST.GlobalVarAccess = function GlobalVarAccess(){ AST.ValueNode.apply(this,arguments) };
	
	subclass$(AST.GlobalVarAccess,AST.ValueNode);
	AST.GlobalVarAccess.prototype.js = function (){
		return this.value().c();
	};
	
	
	
	/* @class ObjectAccess */
	AST.ObjectAccess = function ObjectAccess(){ AST.Access.apply(this,arguments) };
	
	subclass$(AST.ObjectAccess,AST.Access);
	
	
	
	/* @class PropertyAccess */
	AST.PropertyAccess = function PropertyAccess(){ AST.Access.apply(this,arguments) };
	
	subclass$(AST.PropertyAccess,AST.Access);
	AST.PropertyAccess.prototype.js = function (o){
		var rec;
		if(rec = this.receiver()) {
			var ast = CALL(OP('.',this.left(),this.right()),[]);
			ast.setReceiver(rec);
			return ast.c();
		};
		
		// really need to fix this - for sure
		var js = ("" + AST.PropertyAccess.__super__.js.apply(this,arguments));
		if(!((this.up() instanceof AST.Call) || (this.up() instanceof AST.Util.IsFunction))) {
			js += "()";
		};
		return js;
	};
	
	AST.PropertyAccess.prototype.receiver = function (){
		return ((this.left() instanceof AST.SuperAccess) || (this.left() instanceof AST.Super)) ? (
			AST.SELF
		) : (
			null
		);
	};
	
	
	
	/* @class IvarAccess */
	AST.IvarAccess = function IvarAccess(){ AST.Access.apply(this,arguments) };
	
	subclass$(AST.IvarAccess,AST.Access);
	AST.IvarAccess.prototype.cache = function (){
		// WARN hmm, this is not right... when accessing on another object it will need to be cached
		return this;
	};
	
	
	
	/* @class ConstAccess */
	AST.ConstAccess = function ConstAccess(){ AST.Access.apply(this,arguments) };
	
	subclass$(AST.ConstAccess,AST.Access);
	
	
	
	/* @class IndexAccess */
	AST.IndexAccess = function IndexAccess(){ AST.Access.apply(this,arguments) };
	
	subclass$(AST.IndexAccess,AST.Access);
	AST.IndexAccess.prototype.cache = function (o){
		if(o === undefined) o = {};
		if(o.force) {
			return AST.IndexAccess.__super__.cache.apply(this,arguments);
		};
		this.right().cache();
		return this;
	};
	
	
	
	/* @class SuperAccess */
	AST.SuperAccess = function SuperAccess(){ AST.Access.apply(this,arguments) };
	
	subclass$(AST.SuperAccess,AST.Access);
	AST.SuperAccess.prototype.js = function (o){
		var m = o.method();
		var up = o.parent();
		var deep = (o.parent() instanceof AST.Access);
		
		var out = ("" + (this.left().c()) + ".__super__");
		
		if(!((up instanceof AST.Access))) {
			out += ("." + (m.supername().c()));
			if(!((up instanceof AST.Call))) {// autocall?
				out += (".apply(" + (m.scope().context().c()) + ",arguments)");
			};
		};
		
		return out;
	};
	
	AST.SuperAccess.prototype.receiver = function (){
		return AST.SELF;
	};
	
	
	
	/* @class VarOrAccess */
	AST.VarOrAccess = function VarOrAccess(){ AST.ValueNode.apply(this,arguments) };
	
	subclass$(AST.VarOrAccess,AST.ValueNode);
	AST.VarOrAccess.prototype.visit = function (){
		
		var v_;
		this._identifier = this.value();
		
		var scope = this.scope__();
		var variable = scope.lookup(this.value());
		
		if(variable && variable.declarator()) {
			
			variable.addReference(this);// hmm
			
			this.setValue(variable.accessor(this));
			(this.value().setSafechain(v_=this.safechain()),v_);// hmm
		} else if(this.value().symbol().indexOf('$') >= 0) {
			(this.setValue(v_=new AST.GlobalVarAccess(this.value())),v_);
		} else {
			(this.setValue(v_=new AST.PropertyAccess(".",scope.context(),this.value())),v_);
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
		return this._identifier.safechain();// hmm
	};
	
	AST.VarOrAccess.prototype.dump = function (){
		return {loc: this.loc()};
	};
	
	AST.VarOrAccess.prototype.loc = function (){
		var loc = this._identifier.region();
		return loc || [0,0];
	};
	
	AST.VarOrAccess.prototype.toString = function (){
		return "VarOrAccess(" + this.value() + ")";
	};
	
	
	
	/* @class VarReference */
	AST.VarReference = function VarReference(){ AST.ValueNode.apply(this,arguments) };
	
	subclass$(AST.VarReference,AST.ValueNode);
	
	AST.VarReference.prototype.__variable = {};
	AST.VarReference.prototype.variable = function(v){ return this._variable; }
	AST.VarReference.prototype.setVariable = function(v){ this._variable = v; return this; };
	
	AST.VarReference.prototype.js = function (o){
		// experimental fix
		
		var ref = this._variable;
		var out = ref.c();
		
		if(ref && !ref.option('declared')) {
			if(o.up(AST.VarBlock)) {
				ref.set({declared: true});
			} else if(o.isExpression() || this.option('export')) {// why?
				ref.autodeclare();
			} else {
				out = ("var " + out);
				ref.set({declared: true});
			};
		};
		
		// need to think the export through -- like registering somehow
		// should register in scope - export on analysis++
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
		// what about looking up? - on register we want to mark
		(variable_=this.variable()) || ((this.setVariable(v_=this.scope__().register(name,null)),v_));
		// FIXME -- should not simply override the declarator here(!)
		this.variable().setDeclarator(this);// hmm, cannot be certain, but ok for now
		this.variable().addReference(this.value());// is this the first reference?
		
		// implement
		// if option(:export)
		
		return this;
	};
	
	AST.VarReference.prototype.refnr = function (){
		return this.variable().references().indexOf(this.value());
	};
	
	// convert this into a list of references
	AST.VarReference.prototype.addExpression = function (expr){
		return new AST.VarBlock([this]).addExpression(expr);
	};
	


}())