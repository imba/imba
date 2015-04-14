!function(e){if("object"==typeof exports&&"undefined"!=typeof module)module.exports=e();else if("function"==typeof define&&define.amd)define([],e);else{var f;"undefined"!=typeof window?f=window:"undefined"!=typeof global?f=global:"undefined"!=typeof self&&(f=self),f.imbacompile=e()}}(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
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
		} else {
			if((rgt instanceof AST.Symbol) && rgt.isValidIdentifier()) {
				raw = rgt.raw();
			} else {
				if((rgt instanceof AST.Identifier) && rgt.isValidIdentifier()) {
					raw = rgt.c();
				}
			}
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
		} else {
			if(this.value().symbol().indexOf('$') >= 0) {
				(this.setValue(v_=new AST.GlobalVarAccess(this.value())),v_);
			} else {
				(this.setValue(v_=new AST.PropertyAccess(".",scope.context(),this.value())),v_);
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
			} else {
				if(o.isExpression() || this.option('export')) {// why?
					ref.autodeclare();
				} else {
					out = ("var " + out);
					ref.set({declared: true});
				}
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
},{}],2:[function(require,module,exports){
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
	
	/* @class Assign */
	AST.Assign = function Assign(){ AST.Op.apply(this,arguments) };
	
	subclass$(AST.Assign,AST.Op);
	AST.Assign.prototype.isExpressable = function (){
		return !this.right() || this.right().isExpressable();
	};
	
	AST.Assign.prototype.isUsed = function (){
		if((this.up() instanceof AST.Block) && this.up().last() != this) {// hmm
			return false;
		};
		return true;
	};
	
	AST.Assign.prototype.js = function (o){
		
		if(!(this.right().isExpressable())) {
			return this.right().consume(this).c();
		};
		
		// p "assign left {left:contrstru}"
		var l = this.left().node();
		
		// We are setting self(!)
		// TODO document functionality
		if(l instanceof AST.Self) {
			var ctx = this.scope__().context();
			l = ctx.reference();
		};
		
		
		if(l instanceof AST.PropertyAccess) {
			var ast = CALL(OP('.',l.left(),l.right().setter()),[this.right()]);
			ast.setReceiver(l.receiver());
			
			if(this.isUsed()) {
				// dont cache it again if it is already cached(!)
				if(!(this.right().cachevar())) {
					this.right().cache({type: 'val',uses: 1});
				};// 
				ast = new AST.Parens([ast,this.right()].block());
			};
			
			// should check the up-value no?
			return ast.c({expression: true});
		};
		
		// FIXME -- does not always need to be an expression?
		var out = ("" + (l.c()) + " " + this.op() + " " + (this.right().c({expression: true})));
		
		return out;
	};
	
	AST.Assign.prototype.shouldParenthesize = function (){
		return (this.up() instanceof AST.Op) && this.up().op() != '=';
	};
	
	
	AST.Assign.prototype.consume = function (node){
		if(this.isExpressable()) {
			this.forceExpression();
			return AST.Assign.__super__.consume.apply(this,arguments);
		};
		
		var ast = this.right().consume(this);
		return ast.consume(node);
	};
	
	
	
	/* @class PushAssign */
	AST.PushAssign = function PushAssign(){ AST.Assign.apply(this,arguments) };
	
	subclass$(AST.PushAssign,AST.Assign);
	AST.PushAssign.prototype.js = function (){
		return "" + (this.left().c()) + ".push(" + (this.right().c()) + ")";
	};
	
	AST.PushAssign.prototype.consume = function (node){
		return this;
	};
	
	
	
	/* @class ConditionalAssign */
	AST.ConditionalAssign = function ConditionalAssign(){ AST.Assign.apply(this,arguments) };
	
	subclass$(AST.ConditionalAssign,AST.Assign);
	AST.ConditionalAssign.prototype.consume = function (node){
		return this.normalize().consume(node);
	};
	
	AST.ConditionalAssign.prototype.normalize = function (){
		var l = this.left().node();
		var ls = l;
		
		if(l instanceof AST.Access) {
			// p "conditional-assign {l} {l.left} {l.right}"
			if(l.left()) {// hmm
				// p "cache l.left {l.left:constructor}̋"
				l.left().cache();
			};
			ls = l.clone(l.left(),l.right());// this should still be cached?
			if(l instanceof AST.PropertyAccess) {
				l.cache();
			};// correct now, to a certain degree
			if(l instanceof AST.IndexAccess) {
				// p "cache the right side of indexAccess!!! {l.right}"
				l.right().cache();
			};
			
			// we should only cache the value itself if it is dynamic?
			// l.cache # cache the value as well -- we cannot use this in assigns them
		};
		
		// some ops are less messy
		// need op to support consume then?
		var expr = this.right().isExpressable();
		var ast = null;
		// here we should use ast = if ...
		if(expr && this.op() == '||=') {
			ast = OP('||',l,OP('=',ls,this.right()));
		} else {
			if(expr && this.op() == '&&=') {
				ast = OP('&&',l,OP('=',ls,this.right()));
			} else {
				ast = IF(this.condition(),OP('=',ls,this.right()),l);
			}
		};
		if(ast.isExpressable()) {
			ast.toExpression();
		};// hmm
		return ast;
	};
	
	
	AST.ConditionalAssign.prototype.c = function (){
		// WARN what if we return the same?
		return this.normalize().c();
	};
	
	AST.ConditionalAssign.prototype.condition = function (){
		// use switch instead to cache op access
		return (this.op() == '?=') ? (
			OP('==',this.left(),AST.NULL)
		) : ((this.op() == '||=') ? (
			OP('!',this.left())
		) : ((this.op() == '&&=') ? (
			this.left()
		) : ((this.op() == '!?=') ? (
			OP('!=',this.left(),AST.NULL)
		) : (
			this.left()
		))));
	};
	
	AST.ConditionalAssign.prototype.js = function (){
		// p "ConditionalAssign.js".red
		var ast = IF(this.condition(),OP('=',this.left(),this.right()),this.left());
		if(ast.isExpressable()) {
			ast.toExpression();
		};
		return ast.c();
	};
	
	
	/* @class CompoundAssign */
	AST.CompoundAssign = function CompoundAssign(){ AST.Assign.apply(this,arguments) };
	
	subclass$(AST.CompoundAssign,AST.Assign);
	AST.CompoundAssign.prototype.consume = function (node){
		if(this.isExpressable()) {
			return AST.CompoundAssign.__super__.consume.apply(this,arguments);
		};
		
		var ast = this.normalize();
		if(!(ast == this)) {
			return ast.consume(node);
		};
		
		ast = this.right().consume(this);
		return ast.consume(node);
	};
	
	AST.CompoundAssign.prototype.normalize = function (){
		var ln = this.left().node();
		// we dont need to change this at all
		if(!((ln instanceof AST.PropertyAccess))) {
			return this;
		};
		
		if(ln instanceof AST.Access) {
			// left might be zero?!?!
			if(ln.left()) {
				ln.left().cache();
			};
		};
		// TODO FIXME we want to cache the context of the assignment
		// p "normalize compound assign {left}"
		var ast = OP('=',this.left(),OP(this.op()[0],this.left(),this.right()));
		if(ast.isExpressable()) {
			ast.toExpression();
		};
		
		return ast;
	};
	
	AST.CompoundAssign.prototype.c = function (){
		var ast = this.normalize();
		if(ast == this) {
			return AST.CompoundAssign.__super__.c.apply(this,arguments);
		};
		
		// otherwise it is important that we actually replace this node in the outer block
		// whenever we normalize and override c it is important that we can pass on caching
		// etc -- otherwise there WILL be issues.
		var up = STACK.current();
		if(up instanceof AST.Block) {
			// p "parent is block, should replace!"
			// an alternative would be to just pass
			up.replace(this,ast);
		};
		return ast.c();
	};
	
	
	
	/* @class AsyncAssign */
	AST.AsyncAssign = function AsyncAssign(){ AST.Assign.apply(this,arguments) };
	
	subclass$(AST.AsyncAssign,AST.Assign);
	
	
	
	/* @class TupleAssign */
	AST.TupleAssign = function TupleAssign(a,b,c){
		this._op = a;
		this._left = b;
		this._right = c;
		this._temporary = [];
	};
	
	subclass$(AST.TupleAssign,AST.Assign);
	
	AST.TupleAssign.prototype.__op = {};
	AST.TupleAssign.prototype.op = function(v){ return this._op; }
	AST.TupleAssign.prototype.setOp = function(v){ this._op = v; return this; };
	
	AST.TupleAssign.prototype.__left = {};
	AST.TupleAssign.prototype.left = function(v){ return this._left; }
	AST.TupleAssign.prototype.setLeft = function(v){ this._left = v; return this; };
	
	AST.TupleAssign.prototype.__right = {};
	AST.TupleAssign.prototype.right = function(v){ return this._right; }
	AST.TupleAssign.prototype.setRight = function(v){ this._right = v; return this; };
	
	AST.TupleAssign.prototype.__type = {};
	AST.TupleAssign.prototype.type = function(v){ return this._type; }
	AST.TupleAssign.prototype.setType = function(v){ this._type = v; return this; };
	
	
	
	AST.TupleAssign.prototype.isExpressable = function (){
		return this.right().isExpressable();
	};
	
	AST.TupleAssign.prototype.addExpression = function (expr){
		var v_;
		if(this.right() instanceof AST.Tuple) {
			this.right().push(expr);
		} else {
			// p "making child become a tuple?"
			(this.setRight(v_=new AST.Tuple([this.right(),expr])),v_);
		};
		
		return this;
	};
	
	AST.TupleAssign.prototype.visit = function (){
		// if the first left-value is a var-reference, then
		// all the variables should be declared as variables.
		// but if we have complex items in the other list - it does become much harder
		
		// if the first is a var-reference, they should all be(!) .. or splats?
		// this is really a hacky wao to do it though
		var v_;
		if(this.left().first().node() instanceof AST.VarReference) {
			(this.setType(v_='var'),v_);
			// NOTE can improve.. should rather make the whole left be a VarBlock or TupleVarBlock
			// p "type is var -- skip the rest"
		};
		
		this.right().traverse();
		this.left().traverse();
		return this;
	};
	
	AST.TupleAssign.prototype.js = function (){
		// only for actual inner expressions, otherwise cache the whole array, no?
		var self=this;
		if(!(self.right().isExpressable())) {
			// p "TupleAssign.consume! {right}".blue
			return self.right().consume(self).c();
		};
		
		//  a,b,c = arguments 
		
		// - direct. no matter if lvalues are variables or not. Make fake arguments up to the same count as tuple
		
		//  a,*b,b = arguments 
		
		// Need to convert arguments to an array. IF arguments is not referenced anywhere else in scope, 
		// we can do the assignment directly while rolling through arguments
		
		//  a,b = b,a 
		
		// ideally we only need to cache the first value (or n - 1), assign directly when possible.
		
		//  a,b,c = (method | expression) 
		
		// convert res into array, assign from array. Can cache the variable when assigning first value
		
		// First we need to find out whether we are required to store the result in an array before assigning
		// If this needs to be an expression (returns?, we need to fall back to the CS-wa)
		
		var ast = new AST.Block();
		var lft = self.left();
		var rgt = self.right();
		var typ = self.type();
		var via = null;
		
		var li = 0;
		var ri = lft.count();
		var llen = ri;
		
		
		
		// if we have a splat on the left it is much more likely that we need to store right
		// in a temporary array, but if the right side has a known length, it should still not be needed
		var lsplat = lft.filter(function (v){
			return v instanceof AST.Splat;
		})[0];
		
		// if right is an array without any splats (or inner tuples?), normalize it to tuple
		if((rgt instanceof AST.Arr) && !(rgt.splat())) {
			rgt = new AST.Tuple(rgt.nodes());
		};
		var rlen = (rgt instanceof AST.Tuple) ? (rgt.count()) : (null);
		
		// if any values are statements we need to handle this before continuing
		
		//  a,b,c = 10,20,ary 
		
		// ideally we only need to cache the first value (or n - 1), assign directly when possible.
		// only if the variables are not predefined or predeclared can be we certain that we can do it without caching
		// if rlen && typ == 'var' && !lsplat
		// 	# this can be dangerous in edgecases that are very hard to detect
		// 	# if it becomes an issue, fall back to simpler versions
		// 	# does not even matter if there is a splat?
		
		// special case for arguments(!)
		if(!lsplat && rgt == AST.ARGUMENTS) {
			
			var pars = self.scope__().params();
			// p "special case with arguments {pars}"
			// forcing the arguments to be named
			// p "got here??? {pars}"
			lft.map(function (l,i){
				return ast.push(OP('=',l.node(),pars.at(i,true).visit().variable()));
			});// s.params.at(value - 1,yes)
		} else {
			if(rlen) {
				// we have several items in the right part. what about splats here?
				
				// pre-evaluate rvalues that might be reference from other assignments
				// we need to check if the rightside values has no side-effects. Cause if
				// they dont, we really do not need temporary variables.
				
				// some of these optimizations are quite petty - makes things more complicated
				// in the compiler only to get around adding a few temp-variables here and there
				
				// var firstUnsafe = 0
				// lft.map do |v,i|
				// 	if v isa AST.VarReference
				// 		p "left side {i} {v} {v.refnr}"
				
				// rgt.map do |v,i|
				// 	if v.hasSideEffects
				// 		# return if i == 0 or !v.hasSideEffects
				// 		# return if v isa AST.Num || v isa AST.Str || i == 0
				// 		# we could explicitly create a temporary variable and adding nodes for accessing etc
				// 		# but the builtin caching should really take care of this for us
				// 		# we need to really force the caching though -- since we need a copy of it even if it is a local
				// 		# we need to predeclare the variables at the top of scope if this does not take care of it
				// 		
				// 		# these are the declarations -- we need to add them somewhere smart
				// 		@temporary.push(v) # need a generalized way to do this type of thing
				// 		ast.push(v.cache(force: yes, type: 'swap', declared: typ == 'var'))
				// 		# they do need to be declared, no?
				
				// now we can free the cached variables
				// ast.map do |n| n.decache
				
				var pre = [];
				var rest = [];
				
				var pairs = lft.map(function (l,i){
					var v = null;
					// determine if this needs to be precached?
					// if l isa AST.VarReference
					// 	# this is the first time the variable is referenced
					// 	# should also count even if it is predeclared at the top
					// 	if l.refnr == 0
					
					if(l == lsplat) {
						v = [];
						var to = (rlen - (ri - i));
						// p "assing splat at index {i} to slice {li} - {to}".cyan
						while(li <= to){
							v.push(rgt.index(li++));
						};
						v = new AST.Arr(v);
						// ast.push OP('=',l.node,AST.Arr.new(v))
					} else {
						v = rgt.index(li++);// OP('.',rgt.index(li++),idx.toAST)
					};
					return [l.node(),v];
					
					// if l isa AST.VarReference && l.refnr 
				});
				var clean = true;
				
				pairs.map(function (v,i){
					var l = v[0];
					var r = v[1];
					
					if(clean) {
						if((l instanceof AST.VarReference) && l.refnr() == 0) {
							// still clean
							clean = true;
						} else {
							clean = false;
							// p "now cache"
							pairs.slice(i).map(function (part){
								return (part[1].hasSideEffects()) && (
									self._temporary.push(part[1]),// need a generalized way to do this type of thing
									ast.push(part[1].cache({force: true,type: 'swap',declared: typ == 'var'}))
								);
							});
							// p "from {i} - cache all remaining with side-effects"
						};
					};
					
					// if the previous value in ast is a reference to our value - the caching was not needed
					return (ast.last() == r) ? (
						r.decache(),
						// p "was cached - not needed"
						ast.replace(r,OP('=',l,r))
					) : (
						ast.push(OP('=',l,r))
					);
				});
				
				// WARN FIXME Is there not an issue with VarBlock vs not here?
			} else {
				// this is where we need to cache the right side before assigning
				// if the right side is a for loop, we COULD try to be extra clever, but
				// for now it is not worth the added compiler complexity
				
				// iter.cache(force: yes, type: 'iter')
				var top = new AST.VarBlock();
				var iter = self.util().iterable(rgt,true);
				// could set the vars inside -- most likely
				ast.push(top);
				top.push(iter);
				
				if(lsplat) {
					var len = self.util().len(iter,true);
					var idx = self.util().counter(0,true);
					// cache the length of the array
					top.push(len);// preassign the length
					// cache counter to loop through
					top.push(idx);
				};
				
				// only if the block is variable based, no?
				// ast.push(blk = AST.VarBlock.new)
				// blk = nil
				
				var blktype = (typ == 'var') ? (AST.VarBlock) : (AST.Block);
				var blk = new blktype();
				// blk = top if typ == 'var'
				ast.push(blk);
				
				// if the lvals are not variables - we need to preassign
				// can also use slice here for simplicity, but try with while now			
				lft.map(function (l,i){
					var lvar, rem, arr, test, set;
					return (l == lsplat) ? (
						lvar = l.node(),
						rem = llen - i - 1,// remaining after splat
						
						(typ != 'var') ? (
							arr = self.util().array(OP('-',len,(i + rem).toAST()),true),
							top.push(arr),
							lvar = arr.cachevar()
						) : (
							(!blk) && (ast.push(blk = new blktype())),
							arr = self.util().array(OP('-',len,(i + rem).toAST())),
							blk.push(OP('=',lvar,arr))
						),
						
						// if !lvar:variable || !lvar.variable # lvar = 
						// 	top.push()
						// p "has variable - no need to create a temp"
						// blk.push(OP('=',lvar,AST.Arr.new([]))) # dont precalculate size now
						// max = to = (rlen - (llen - i))
						
						
						test = (rem) ? (OP('-',len,rem)) : (len),
						// get = OP('.',lvar,OP('-',idx,i.toAST))
						set = OP('=',OP('.',lvar,OP('-',idx,i.toAST())),
						OP('.',iter,OP('++',idx))),
						
						ast.push(WHILE(OP('<',idx,test),set)),
						
						(typ != 'var') ? (
							ast.push(blk = new AST.Block()),
							blk.push(OP('=',l.node(),lvar))
						) : (
							blk = null
						)
						
						// not if splat was last?
						// ast.push(blk = AST.VarBlock.new)
					) : ((lsplat) ? (
						(!blk) && (ast.push(blk = new blktype())),
						// we could cache the raw code of this node for better performance
						blk.push(OP('=',l,OP('.',iter,OP('++',idx))))
					) : (
						(!blk) && (ast.push(blk = new blktype())),
						blk.push(OP('=',l,OP('.',iter,i.toAST())))
					));
				});
			}
		};
		
		
		if(ast.isExpressable()) {// NO!
			var out = ast.c({expression: true});
			if(typ) {
				out = ("" + typ + " " + out);
			};
			return out;
		} else {
			return ast.c();
		};
	};
	


}())
},{}],3:[function(require,module,exports){
(function(){


	require('./helpers');
	require('./base');
	require('./statements');
	require('./params');
	require('./code');
	require('./literal');
	require('./identifier');
	
	require('./op');
	require('./access');
	require('./assign');
	require('./call');
	require('./flow');
	require('./range');
	require('./splat');
	require('./tag');
	require('./selector');
	require('./defer');
	require('./import');
	require('./export');
	
	require('./utils');
	require('./scope');
	
	AST.BR = new AST.Newline('\n');
	AST.BR2 = new AST.Newline('\n\n');
	AST.SELF = new AST.Self();
	AST.SUPER = new AST.Super();
	AST.TRUE = new AST.True('true');
	AST.FALSE = new AST.False('false');
	AST.ARGUMENTS = new AST.ArgsReference('arguments');
	AST.EMPTY = '';
	AST.NULL = 'null';
	
	AST.RESERVED = ['default','native','enum','with'];
	AST.RESERVED_REGEX = /^(default|native|enum|with)$/;
	
	AST.UNION = new AST.Const('union$');
	AST.INTERSECT = new AST.Const('intersect$');
	AST.CLASSDEF = new AST.Const('imba$class');
	AST.TAGDEF = new AST.Const('Imba.Tag.define');
	AST.NEWTAG = new AST.Identifier("tag$");
	
	// require the parser itself?
	// Are we sure?
	// AST.Imba = require('../compiler') # what?


}())
},{"./access":1,"./assign":2,"./base":4,"./call":5,"./code":6,"./defer":7,"./export":8,"./flow":9,"./helpers":10,"./identifier":11,"./import":12,"./literal":14,"./op":15,"./params":16,"./range":17,"./scope":18,"./selector":19,"./splat":20,"./statements":21,"./tag":22,"./utils":23}],4:[function(require,module,exports){
(function(){


	idx$ = function(a,b){
		return (b && b.indexOf) ? b.indexOf(a) : [].indexOf.call(a,b);
	};
	;
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
	function iter$(a){ return a ? (a.toArray ? a.toArray() : a) : []; };
	// TODO Create AST.Expression - make all expressions inherit from these?
	
	// externs;
	
	
	var helpers = require('./helpers');
	
	AST = {};
	
	// Helpers for operators
	OP = function (op,left,right,opts){
		if(op == '.') {
			// Be careful
			if((typeof right=='string'||right instanceof String)) {
				right = new AST.Identifier(right);
			};
			
			return new AST.Access(op,left,right);
		} else {
			if(op == '=') {
				if(left instanceof AST.Tuple) {
					// p "catching tuple-assign OP"
					return new AST.TupleAssign(op,left,right);
				};
				return new AST.Assign(op,left,right);
			} else {
				return (idx$(op,['?=','||=','&&=']) >= 0) ? (
					new AST.ConditionalAssign(op,left,right)
				) : ((idx$(op,['=<']) >= 0) ? (
					new AST.AsyncAssign('=',left,new AST.Await(right))
					// AST.AsyncAssign.new(op,left,right)
				) : ((idx$(op,['+=','-=','*=','/=','^=','%=']) >= 0) ? (
					new AST.CompoundAssign(op,left,right)
					// elif op == '<<'
					// AST.PushAssign.new(op,left,right)
				) : ((op == 'instanceof') ? (
					new AST.InstanceOf(op,left,right)
				) : ((op == 'in') ? (
					new AST.In(op,left,right)
				) : ((op == 'typeof') ? (
					new AST.TypeOf(op,left,right)
				) : ((op == 'delete') ? (
					new AST.Delete(op,left,right)
				) : ((idx$(op,['--','++','!','√']) >= 0) ? (// hmm
					new AST.UnaryOp(op,left,right)
				) : ((idx$(op,['>','<','>=','<=','==','===','!=','!==']) >= 0) ? (
					new AST.ComparisonOp(op,left,right)
				) : ((idx$(op,['∩','∪']) >= 0) ? (
					new AST.MathOp(op,left,right)
				) : ((idx$(op,['..','...']) >= 0) ? (
					new AST.Range(op,left,right)
				) : (
					new AST.Op(op,left,right)
				)))))))))))
			}
		};
	};
	
	LIT = function (val){
		return new AST.Literal(val);
	};
	
	SYM = function (val){
		return new AST.Symbol(val);
	};
	
	IF = function (cond,body,alt){
		var node = new AST.If(cond,body);
		if(alt) {
			node.addElse(alt);
		};
		return node;
	};
	
	FN = function (pars,body){
		return new AST.Func(pars,body);
	};
	
	CALL = function (callee,pars){
		// possibly return instead(!)
		if(pars === undefined) pars = [];
		return new AST.Call(callee,pars);
	};
	
	CALLSELF = function (name,pars){
		if(pars === undefined) pars = [];
		var ref = new AST.Identifier(name);
		return new AST.Call(OP('.',AST.SELF,ref),pars);
	};
	
	BLOCK = function (){
		return AST.Block.wrap([].slice.call(arguments));
	};
	
	WHILE = function (test,code){
		return new AST.While(test).addBody(code);
	};
	
	SPLAT = function (value){
		if(value instanceof AST.Assign) {
			// p "WARN"
			value.setLeft(new AST.Splat(value.left()));
			return value;
		} else {
			return new AST.Splat(value);
			// not sure about this
		};
	};
	
	OP.ASSIGNMENT = ["=","+=","-=","*=","/=","%=","<<=",">>=",">>>=","|=","^=","&="];
	OP.LOGICAL = ["||","&&"];
	OP.UNARY = ["++","--"];
	
	AST.LOC = function (loc){
		return ;
	};
	
	AST.parse = function (str,opts){
		if(opts === undefined) opts = {};
		var indent = str.match(/\t+/)[0];
		return AST.Imba.parse(str,opts);
	};
	
	AST.inline = function (str,opts){
		if(opts === undefined) opts = {};
		return AST.parse(str,opts).body();
	};
	
	AST.node = function (typ,pars){
		return (typ == 'call') && (
			(pars[0].c() == 'return') && (
				pars[0] = 'tata'
			),
			new AST.Call(pars[0],pars[1],pars[2])
		);
	};
	
	
	AST.escapeComments = function (str){
		if(!str) {
			return '';
		};
		return str;
		// var v = str.replace(/\\n/g,'\n')
		// v.split("\n").join("\n")
		// v.split("\n").map(|v| v ? "// {v}" : v).join("\n")
	};
	
	/* @class Indentation */
	AST.Indentation = function Indentation(a,b){
		this._open = a || 1;
		this._close = b || 1;
		this;
	};
	
	
	AST.Indentation.prototype.__open = {};
	AST.Indentation.prototype.open = function(v){ return this._open; }
	AST.Indentation.prototype.setOpen = function(v){ this._open = v; return this; };
	
	AST.Indentation.prototype.__close = {};
	AST.Indentation.prototype.close = function(v){ return this._close; }
	AST.Indentation.prototype.setClose = function(v){ this._close = v; return this; };
	
	
	
	// should rather parse and extract the comments, no?
	AST.Indentation.prototype.wrap = function (str,o){
		var pre = this._open.pre;
		var post = this._open.post;
		var esc = AST.escapeComments;
		
		// the first newline should not be indented?
		str = esc(post).replace(/^\n/,'') + str;
		str = str.replace(/^/g,"\t").replace(/\n/g,"\n\t").replace(/\n\t$/g,"\n");
		
		str = esc(pre) + '\n' + str;
		// only add br if needed
		if(!(str[str.length - 1] == '\n')) {
			str = str + '\n';
		};
		// if o and o:braces
		// 	str = '{' + str + '}'
		
		return str;
	};
	
	
	AST.INDENT = new AST.Indentation();
	
	/* @class Stack */
	AST.Stack = function Stack(){
		this._nodes = [];
		this._scoping = [];
		this._scopes = [];// for analysis - should rename
		this._loglevel = 3;
	};
	
	
	AST.Stack.prototype.__loglevel = {};
	AST.Stack.prototype.loglevel = function(v){ return this._loglevel; }
	AST.Stack.prototype.setLoglevel = function(v){ this._loglevel = v; return this; };
	
	AST.Stack.prototype.__nodes = {};
	AST.Stack.prototype.nodes = function(v){ return this._nodes; }
	AST.Stack.prototype.setNodes = function(v){ this._nodes = v; return this; };
	
	AST.Stack.prototype.__scopes = {};
	AST.Stack.prototype.scopes = function(v){ return this._scopes; }
	AST.Stack.prototype.setScopes = function(v){ this._scopes = v; return this; };
	
	
	
	AST.Stack.prototype.addScope = function (scope){
		this._scopes.push(scope);
		return this;
	};
	
	AST.Stack.prototype.traverse = function (node){
		return this;
	};
	
	AST.Stack.prototype.push = function (node){
		this._nodes.push(node);
		// not sure if we have already defined a scope?
		return this;
	};
	
	AST.Stack.prototype.pop = function (node){
		this._nodes.pop(node);
		return this;
	};
	
	AST.Stack.prototype.parent = function (){
		return this._nodes[this._nodes.length - 2];
	};
	
	AST.Stack.prototype.current = function (){
		return this._nodes[this._nodes.length - 1];
	};
	
	AST.Stack.prototype.up = function (test){
		test || (test = function (v){
			return !(v instanceof AST.VarOrAccess);
		});
		
		if(test.prototype instanceof AST.Node) {
			var typ = test;
			test = function (v){
				return v instanceof typ;
			};
		};
		
		var i = this._nodes.length - 1;
		while(i >= 0){
			var node = this._nodes[i];
			if(test(node)) {
				return node;
			};
			i -= 1;
		};
		return null;
	};
	
	AST.Stack.prototype.relative = function (node,offset){
		if(offset === undefined) offset = 0;
		var idx = this._nodes.indexOf(node);
		return (idx >= 0) ? (this._nodes[idx + offset]) : (null);
	};
	
	AST.Stack.prototype.scope = function (lvl){
		if(lvl === undefined) lvl = 0;
		var i = this._nodes.length - 1 - lvl;
		while(i >= 0){
			var node = this._nodes[i];
			if(node._scope) {
				return node._scope;
			};
			i -= 1;
		};
		return null;
	};
	
	AST.Stack.prototype.scopes = function (){
		// include deeper scopes as well?
		var scopes = [];
		var i = this._nodes.length - 1;
		while(i >= 0){
			var node = this._nodes[i];
			if(node._scope) {
				scopes.push(node._scope);
			};
			i -= 1;
		};
		return scopes;
	};
	
	AST.Stack.prototype.method = function (){
		return this.up(AST.MethodDeclaration);
	};
	
	AST.Stack.prototype.isExpression = function (){
		var i = this._nodes.length - 1;
		while(i >= 0){
			var node = this._nodes[i];
			// why are we not using isExpression here as well?
			if((node instanceof AST.Code) || (node instanceof AST.Loop)) {
				return false;
			};
			if(node.isExpression()) {
				return true;
			};
			// probably not the right test - need to be more explicit
			i -= 1;
		};
		return false;
	};
	
	AST.Stack.prototype.toString = function (){
		return "Stack(" + (this._nodes.join(" -> ")) + ")";
	};
	
	AST.Stack.prototype.scoping = function (){
		return this._nodes.filter(function (n){
			return n._scope;
		}).map(function (n){
			return n._scope;
		});
	};
	
	
	// Lots of globals -- really need to deal with one stack per file / context
	STACK = new AST.Stack();
	
	/* @class Node */
	AST.Node = function Node(){
		this;
	};
	
	
	AST.Node.prototype.__o = {};
	AST.Node.prototype.o = function(v){ return this._o; }
	AST.Node.prototype.setO = function(v){ this._o = v; return this; };
	
	AST.Node.prototype.__options = {};
	AST.Node.prototype.options = function(v){ return this._options; }
	AST.Node.prototype.setOptions = function(v){ this._options = v; return this; };
	
	AST.Node.prototype.__traversed = {};
	AST.Node.prototype.traversed = function(v){ return this._traversed; }
	AST.Node.prototype.setTraversed = function(v){ this._traversed = v; return this; };
	
	AST.Node.prototype.__statement = {};
	AST.Node.prototype.statement = function(v){ return this._statement; }
	AST.Node.prototype.setStatement = function(v){ this._statement = v; return this; };
	
	AST.Node.prototype.safechain = function (){
		return false;
	};
	
	AST.Node.prototype.dom = function (){
		var name = "ast_" + this.constructor.name.replace(/([a-z])([A-Z])/g,"$1_$2").toLowerCase();
		// p "try to get the dom-node for this ast-node",name
		if(Imba.TAGS[name]) {
			var node = Imba.tag(name);
			node.bind(this).build();
			return node;
		} else {
			return ("[" + name + "]");
		};
	};
	
	AST.Node.prototype.p = function (){
		// hmm
		// allow controlling this from commandline
		if(STACK.loglevel() > 0) {
			console.log.apply(console,arguments);
		};
		return this;
	};
	
	
	
	AST.Node.prototype.set = function (obj){
		this._options || (this._options = {});
		for(var o=obj, i=0, keys=Object.keys(o), l=keys.length; i < l; i++){
			this._options[keys[i]] = o[keys[i]];
		};
		return this;
	};
	
	// get and set
	AST.Node.prototype.option = function (key,val){
		if(val != undefined) {
			this._options || (this._options = {});
			this._options[key] = val;
			return this;
		};
		
		return this._options && this._options[key];
	};
	
	AST.Node.prototype.configure = function (obj){
		return this.set(obj);
	};
	
	AST.Node.prototype.region = function (){
		return [];
	};
	
	AST.Node.prototype.loc = function (){
		return [];
	};
	
	AST.Node.prototype.toAST = function (){
		return this;
	};
	
	AST.Node.prototype.compile = function (){
		return this;
	};
	
	AST.Node.prototype.visit = function (){
		return this;
	};
	
	AST.Node.prototype.stack = function (){
		return STACK;
	};
	
	AST.Node.prototype.traverse = function (o,up,key,index){
		var $0 = arguments, i = $0.length;
		if(i < 1) o = {};
		if(this._traversed) {
			return this;
		};
		this._traversed = true;
		STACK.push(this);
		this.visit(STACK);
		STACK.pop(this);
		return this;
	};
	
	AST.Node.prototype.inspect = function (){
		return {type: this.constructor.toString()};
	};
	
	AST.Node.prototype.js = function (){
		return "NODE";
	};
	
	AST.Node.prototype.toString = function (){
		return "" + (this.constructor.name);
	};
	
	// swallow might be better name
	AST.Node.prototype.consume = function (node){
		if(node instanceof AST.PushAssign) {
			return new AST.PushAssign(node.op(),node.left(),this);
		};
		
		if(node instanceof AST.Assign) {
			// p "consume assignment".cyan
			// node.right = self
			return OP(node.op(),node.left(),this);
		} else {
			if(node instanceof AST.Op) {
				return OP(node.op(),node.left(),this);
			} else {
				if(node instanceof AST.Return) {
					// p "consume return".cyan
					return new AST.Return(this);
				}
			}
		};
		return this;
	};
	
	AST.Node.prototype.toExpression = function (){
		this._expression = true;
		return this;
	};
	
	AST.Node.prototype.forceExpression = function (){
		this._expression = true;
		return this;
	};
	
	AST.Node.prototype.isExpressable = function (){
		return true;
	};
	
	AST.Node.prototype.isExpression = function (){
		return this._expression || false;
	};
	
	AST.Node.prototype.hasSideEffects = function (){
		return true;
	};
	
	AST.Node.prototype.isUsed = function (){
		return true;
	};
	
	AST.Node.prototype.shouldParenthesize = function (){
		return false;
	};
	
	AST.Node.prototype.block = function (){
		return AST.Block.wrap([this]);
	};
	
	AST.Node.prototype.node = function (){
		return this;
	};
	
	AST.Node.prototype.scope__ = function (){
		return STACK.scope();
	};
	
	AST.Node.prototype.up = function (){
		return STACK.parent();
	};
	
	AST.Node.prototype.util = function (){
		return AST.Util;
	};
	
	AST.Node.prototype.receiver = function (){
		return this;
	};
	
	AST.Node.prototype.addExpression = function (expr){
		// might be better to nest this up after parsing is done?
		// p "addExpression {self} <- {expr}"
		var node = new AST.ExpressionBlock([this]);
		return node.addExpression(expr);
	};
	
	AST.Node.prototype.addComment = function (comment){
		// console.log "adding comment"
		this._comment = comment;
		return this;
	};
	
	AST.Node.prototype.indented = function (a,b){
		// this is a _BIG_ hack
		if(b instanceof Array) {
			// console.log "indented array?", b[0]
			this.add(b[0]);
			b = b[1];
		};
		
		// if indent and indent.match(/\:/)
		this._indented = [a,b];
		this._indentation || (this._indentation = (a && b) ? (new AST.Indentation(a,b)) : (AST.INDENT));
		return this;
	};
	
	AST.Node.prototype.prebreak = function (term){
		// in options instead?
		// console.log "prebreak!!!!"
		// @prebreak = @prebreak or term
		if(term === undefined) term = '\n';
		return this;
	};
	
	AST.Node.prototype.invert = function (){
		return OP('!',this);
	};
	
	AST.Node.prototype.cache = function (o){
		if(o === undefined) o = {};
		this._cache = o;
		o.var = this.scope__().temporary(this,o);
		o.lookups = 0;
		// o:lookups = 0
		return this;
	};
	
	AST.Node.prototype.cachevar = function (){
		return this._cache && this._cache.var;
	};
	
	AST.Node.prototype.decache = function (){
		if(this._cache) {
			this.cachevar().free();
			this._cache = null;// hmm, removing the cache WARN
		};
		return this;
	};
	
	// is this without side-effects? hmm - what does it even do?
	AST.Node.prototype.predeclare = function (){
		if(this._cache) {
			this.scope__().vars().swap(this._cache.var,this);
		};
		return this;
	};
	
	// the "name-suggestion" for nodes if they need to be cached
	AST.Node.prototype.alias = function (){
		return null;
	};
	
	AST.Node.prototype.warn = function (text,opts){
		// opts:node = self
		// p "AST.warn {text} {opts}"
		if(opts === undefined) opts = {};
		opts.message = text;
		opts.loc || (opts.loc = this.loc());
		this.scope__().root().warn(opts);
		return this;
	};
	
	AST.Node.prototype.c = function (o){
		var indent;
		if(this._cache && this._cache.cached) {
			(this._cache.lookups)++;
			if(this._cache.uses == this._cache.lookups) {
				this._cache.var.free();
				//  "free variable(!) {@cache:var.c}"
			};
			// p "getting cache {self}"
			// free it after the cached usage?
			// possibly premark how many times it need to be used before it is freed?
			return this._cache.var.c();
		};
		
		STACK.push(this);
		if(o && o.expression) {
			this.forceExpression();
		};
		
		if(o && o.indent) {
			// console.log "set indentation"
			this._indentation || (this._indentation = AST.INDENT);
			// self.indented()
		};
		
		var out = this.js(STACK,o);
		
		var paren = this.shouldParenthesize();
		
		if(indent = this._indentation) {
			out = indent.wrap(out,o);
		};
		
		if(paren) {
			// this is not a good way to do it
			if(out instanceof Array) {
				out = ("(" + out + ")");
			} else {
				out = out.parenthesize();
			};
		};
		
		if(o && o.braces) {
			out = '{' + out + '}';
		};
		
		
		// what about if we should indent?!?
		
		STACK.pop(this);
		
		if(this._cache) {
			
			// FIXME possibly double parenthesizing?
			if(!(this._cache.manual)) {
				out = ("" + (this._cache.var.c()) + "=" + out);
			};
			var par = STACK.current();
			if((par instanceof AST.Access) || (par instanceof AST.Op)) {
				out = out.parenthesize();
			};// others?
			this._cache.cached = true;
		};
		
		if(this._temporary && this._temporary.length) {
			this._temporary.map(function (temp){
				// p "decache temp!!! {temp}"
				return temp.decache();
			});
		};
		
		// if @newlines && @newlines.value:length > 2
		// 	out = "{out}\n"
		
		return out;
	};
	
	
	/* @class Expression */
	AST.Expression = function Expression(){ AST.Node.apply(this,arguments) };
	
	subclass$(AST.Expression,AST.Node);
	
	
	/* @class ValueNode */
	AST.ValueNode = function ValueNode(value){
		this._value = this.load(value);
	};
	
	subclass$(AST.ValueNode,AST.Node);
	
	AST.ValueNode.prototype.__value = {};
	AST.ValueNode.prototype.value = function(v){ return this._value; }
	AST.ValueNode.prototype.setValue = function(v){ this._value = v; return this; };
	
	
	
	AST.ValueNode.prototype.load = function (value){
		return value;
	};
	
	AST.ValueNode.prototype.js = function (){
		return this.value().c();
	};
	
	AST.ValueNode.prototype.visit = function (){
		if(this._value && this._value.traverse) {
			this._value.traverse();
		};
		return this;
	};
	
	AST.ValueNode.prototype.region = function (){
		return this._value._region;
	};
	
	
	/* @class Statement */
	AST.Statement = function Statement(){ AST.ValueNode.apply(this,arguments) };
	
	subclass$(AST.Statement,AST.ValueNode);
	AST.Statement.prototype.isExpressable = function (){
		return false;
	};
	
	AST.Statement.prototype.statement = function (){
		return true;
	};
	
	
	
	/* @class Meta */
	AST.Meta = function Meta(){ AST.ValueNode.apply(this,arguments) };
	
	subclass$(AST.Meta,AST.ValueNode);
	
	
	/* @class Comment */
	AST.Comment = function Comment(){ AST.Meta.apply(this,arguments) };
	
	subclass$(AST.Comment,AST.Meta);
	AST.Comment.prototype.c = function (o){
		return (o && o.expression || this._value.match(/\n/)) ? (// multiline?
			("/*" + (this.value().c()) + "*/")
		) : (
			("// " + (this.value().c()))
		);
	};
	
	
	
	/* @class Terminator */
	AST.Terminator = function Terminator(){ AST.Meta.apply(this,arguments) };
	
	subclass$(AST.Terminator,AST.Meta);
	AST.Terminator.prototype.c = function (){
		return this._value;
		// var v = value.replace(/\\n/g,'\n')
		return this.v();// .split()
		// v.split("\n").map(|v| v ? " // {v}" : v).join("\n")
	};
	
	
	/* @class Newline */
	AST.Newline = function Newline(v){
		this._value = v || '\n';
	};
	
	subclass$(AST.Newline,AST.Terminator);
	
	
	AST.Newline.prototype.c = function (){
		return this._value;
	};
	
	
	
	// weird place?
	/* @class Index */
	AST.Index = function Index(){ AST.ValueNode.apply(this,arguments) };
	
	subclass$(AST.Index,AST.ValueNode);
	AST.Index.prototype.js = function (){
		return this._value.c();
	};
	
	
	/* @class NewLines */
	AST.NewLines = function NewLines(){ AST.ValueNode.apply(this,arguments) };
	
	subclass$(AST.NewLines,AST.ValueNode);
	AST.NewLines.prototype.js = function (){
		return this._value;
	};
	
	AST.NewLines.prototype.isExpressable = function (){
		return true;
	};
	
	
	/* @class ListNode */
	AST.ListNode = function ListNode(list,options){
		if(list === undefined) list = [];
		if(options === undefined) options = {};
		this._nodes = this.load(list);
		this._options = options;
	};
	
	subclass$(AST.ListNode,AST.Node);
	
	AST.ListNode.prototype.__nodes = {};
	AST.ListNode.prototype.nodes = function(v){ return this._nodes; }
	AST.ListNode.prototype.setNodes = function(v){ this._nodes = v; return this; };
	
	
	
	// PERF acces @nodes directly?
	AST.ListNode.prototype.list = function (){
		return this._nodes;
	};
	
	AST.ListNode.prototype.compact = function (){
		this._nodes = this._nodes.compact();
		return this;
	};
	
	AST.ListNode.prototype.load = function (list){
		return list;
	};
	
	AST.ListNode.prototype.concat = function (other){
		// need to store indented content as well?
		this._nodes = this.nodes().concat((other instanceof Array) ? (other) : (other.nodes()));
		return this;
	};
	
	AST.ListNode.prototype.swap = function (item,other){
		var idx = this.indexOf(item);
		if(idx >= 0) {
			this.nodes()[idx] = other;
		};
		return this;
	};
	
	AST.ListNode.prototype.push = function (item){
		this.nodes().push(item);
		return this;
	};
	
	AST.ListNode.prototype.unshift = function (item,br){
		if(br) {
			this.nodes().unshift(AST.BR);
		};
		this.nodes().unshift(item);
		return this;
	};
	
	// test
	AST.ListNode.prototype.slice = function (a,b){
		return new this.constructor(this._nodes.slice(a,b));
	};
	
	AST.ListNode.prototype.add = function (item){
		this.push(item);
		return this;
	};
	
	AST.ListNode.prototype.break = function (br,pre){
		// console.log "breaking block! ({br})"
		// should just accept regular terminators no?
		// console.log "BREAKING {br}"
		if(pre === undefined) pre = false;
		if(typeof br == 'string') {
			br = new AST.Terminator(br);
		};// hmmm?
		if(pre) {
			this.unshift(br);
		} else {
			this.push(br);
		};
		return this;
	};
	
	AST.ListNode.prototype.some = function (cb){
		return this.nodes().some(cb);
	};
	
	AST.ListNode.prototype.every = function (cb){
		return this.nodes().every(cb);
	};
	
	AST.ListNode.prototype.filter = function (cb){
		if(cb.prototype instanceof AST.Node) {
			var ary = [];
			this.nodes().forEach(function (n){
				return (n instanceof cb) && (ary.push(n));
			});
			return ary;
		};
		
		return this.nodes().filter(cb);
	};
	
	AST.ListNode.prototype.pluck = function (cb){
		var item = this.filter(cb)[0];
		if(item) {
			this.remove(item);
		};
		return item;
	};
	
	AST.ListNode.prototype.indexOf = function (item){
		return this.nodes().indexOf(item);
	};
	
	AST.ListNode.prototype.index = function (i){
		return this.nodes()[i];
	};
	
	AST.ListNode.prototype.remove = function (item){
		var idx = this.list().indexOf(item);
		if(idx >= 0) {
			this.list().splice(idx,1);
		};
		return this;
	};
	
	AST.ListNode.prototype.first = function (){
		return this.list()[0];
	};
	
	// def last
	// list[list:length - 1]
	
	AST.ListNode.prototype.last = function (){
		var i = this._nodes.length;
		while(i){
			i = i - 1;
			var v = this._nodes[i];
			if(!((v instanceof AST.Meta))) {
				return v;
			};
		};
		return null;
	};
	
	AST.ListNode.prototype.map = function (fn){
		return this.list().map(fn);
	};
	
	AST.ListNode.prototype.forEach = function (fn){
		return this.list().forEach(fn);
	};
	
	AST.ListNode.prototype.remap = function (fn){
		this._nodes = this.map(fn);
		return this;
	};
	
	AST.ListNode.prototype.count = function (){
		return this.list().length;
	};
	
	AST.ListNode.prototype.replace = function (original,replacement){
		var idx = this.nodes().indexOf(original);
		if(idx >= 0) {
			this.nodes()[idx] = replacement;
		};
		return this;
	};
	
	
	AST.ListNode.prototype.visit = function (){
		this._nodes.forEach(function (node){
			// console.log "traverse node {node}"
			return node.traverse();
		});
		return this;
	};
	
	AST.ListNode.prototype.isExpressable = function (){
		if(!this.nodes().every(function (v){
			return v.isExpressable();
		})) {
			return false;
		};
		return true;
	};
	
	AST.ListNode.prototype.toArray = function (){
		return this._nodes;
	};
	
	AST.ListNode.prototype.delimiter = function (){
		return this._delimiter || ",";
	};
	
	AST.ListNode.prototype.js = function (o,pars){
		// var delim = delimiter
		if(!pars||pars.constructor !== Object) pars = {};
		var delim = pars.delim !== undefined ? pars.delim : this.delimiter();
		var indent = pars.indent !== undefined ? pars.indent : this._indentation;
		var nodes = pars.nodes !== undefined ? pars.nodes : this.nodes();
		var express = delim != ';';
		var shouldDelim = false;
		var nodes = nodes.compact();
		var last = this.last();
		var realLast = nodes[nodes.length - 1];
		// need to find the last node that is not a comment or newline?
		
		var parts = nodes.map(function (arg){
			var out = arg.c({expression: express});
			// if var br = arg.@prebreak
			// 	indent = yes # force indentation if one item is indented for now
			// 	out = br.replace(/\\n/g,"\n") + out #  '\n' + arg.@prebreak + out 
			// 	console.log "prebreak!!"
			// out = delim + out if shouldDelim
			// else
			// out = delim + " " + out if shouldDelim
			
			if(arg instanceof AST.Meta) {
				true;
				// console.log "argument is a comment!"
				// shouldDelim = no
			} else {
				// comment as well?
				// shouldDelim = yes
				if(!express || arg != last) {
					out = out + delim;
				};
			};
			return out;
		});
		
		return parts.join("");
	};
	
	
	
	/* @class ArgList */
	AST.ArgList = function ArgList(){ AST.ListNode.apply(this,arguments) };
	
	subclass$(AST.ArgList,AST.ListNode);
	AST.ArgList.prototype.hasSplat = function (){
		return this.list().some(function (v){
			return v instanceof AST.Splat;
		});
	};
	
	AST.ArgList.prototype.delimiter = function (){
		return ",";
	};
	
	
	
	/* @class AssignList */
	AST.AssignList = function AssignList(){ AST.ArgList.apply(this,arguments) };
	
	subclass$(AST.AssignList,AST.ArgList);
	AST.AssignList.prototype.concat = function (other){
		if(this._nodes.length == 0 && (other instanceof AST.AssignList)) {
			// console.log "return the other one(!)",other.@indented[0]
			return other;
		} else {
			AST.AssignList.__super__.concat.apply(this,arguments);
		};
		// need to store indented content as well?
		// @nodes = nodes.concat(other isa Array ? other : other.nodes)
		return this;
	};
	
	
	
	/* @class Block */
	AST.Block = function Block(expr){
		var v_;
		if(expr === undefined) expr = [];
		(this.setNodes(v_=expr.flatten().compact() || []),v_);
	};
	
	subclass$(AST.Block,AST.ListNode);
	
	AST.Block.prototype.__head = {};
	AST.Block.prototype.head = function(v){ return this._head; }
	AST.Block.prototype.setHead = function(v){ this._head = v; return this; };
	
	
	AST.Block.wrap = function (ary){
		return (ary.length == 1 && (ary[0] instanceof AST.Block)) ? (ary[0]) : (new AST.Block(ary));
	};
	
	
	AST.Block.prototype.visit = function (){
		// @indentation ||= AST.INDENT
		
		if(this._prebreak) {// hmm
			// are we sure?
			console.log("PREBREAK IN AST.BLOCK SHOULD THROW");
			this.first() && this.first().prebreak(this._prebreak);
		};
		return AST.Block.__super__.visit.apply(this,arguments);
	};
	
	
	AST.Block.prototype.push = function (item){
		this.nodes().push(item);
		return this;
	};
	
	
	AST.Block.prototype.block = function (){
		return this;
	};
	
	
	AST.Block.prototype.loc = function (){
		var opt, a, b;
		return (opt = this.option('ends')) ? (
			// p "location is",opt
			a = opt[0].loc(),
			b = opt[1].loc(),
			
			(!a) && (this.p(("no loc for " + (opt[0])))),
			(!b) && (this.p(("no loc for " + (opt[1])))),
			
			[a[0],b[1]]
		) : (
			[0,0]
		);
	};
	
	
	
	
	
	// go through children and unwrap inner nodes
	AST.Block.prototype.unwrap = function (){
		var ary = [];
		for(var i=0, items=iter$(this.nodes()), len=items.length, node; i < len; i++) {
			node = items[i];if(node instanceof AST.Block) {
				// p "unwrapping inner block"
				ary.push.apply(ary,node.unwrap());
			} else {
				ary.push(node);
			};
		};
		return ary;
	};
	
	
	// This is just to work as an inplace replacement of nodes.coffee
	// After things are working okay we'll do bigger refactorings
	AST.Block.prototype.compile = function (o){
		if(o === undefined) o = {};
		var root = new AST.Root(this,o);
		return root.compile(o);
	};
	
	
	// Not sure if we should create a separate block?
	AST.Block.prototype.analyze = function (o){
		// p "analyzing block!!!",o
		if(o === undefined) o = {};
		return this;
	};
	
	
	AST.Block.prototype.js = function (o,opts){
		var $1;
		var l = this.nodes().length;
		// var filter = 
		var filter = (function (n){
			return n != null && n != undefined && n != AST.EMPTY;
		});
		var ast = this.nodes().flatten().compact().filter(function (n){
			return n != null && n != undefined && n != AST.EMPTY;
		});
		var express = this.isExpression() || o.isExpression() || (this.option('express') && this.isExpressable());
		if(ast.length == 0) {
			return null;
		};
		
		// return super(o, delim: ';', indent: no)
		
		if(express) {
			return AST.Block.__super__.js.call(this,o,{delim: ',',nodes: ast});
		};
		
		// should probably delegate to super for ; as well
		// else
		// 	return super(o,delim: ';', nodes: ast)
		// return ast.c.flatten.compact.join(", ")
		
		var compile = function (node,i){
			var out = (node) ? (node.c()) : ("");
			if(out == "") {
				return null;
			};
			
			// hmm -- are we sure?
			if(out instanceof Array) {
				// really??
				out = out.flatten().compact().filter(filter).join(";\n");
			};
			
			var hasSemiColon = out.match(/;(\s*\/\/.*)?[\n\s\t]*$/);// out[out:length - 1] == ";"
			
			if(!(hasSemiColon || (node instanceof AST.Meta))) {
				out += ";";
			};
			
			// if var br = node.@prebreak
			// 	console.log "br prebreak"
			// 	out = br.replace(/\\n/g,"\n") + out
			// hmm
			return out;
		};
		
		ast = ast.map(compile);
		
		// now add the head items as well
		if(this._head) {
			var prefix = [];
			this._head.forEach(function (item){
				var out = compile(item);
				return (out) && (prefix.push(out + '\n'));
			});
			
			ast = prefix.concat(ast);
			// var ln = node.@newlines or 1
			// c += Array(ln + 1).join("\n") # "\n"
		};
		
		return ast = ast.compact().filter(filter).join("");// .replace(/[\s\n]+$/,'')  # hmm really?
		
		// @indentation ? @indentation.wrap(ast,opts) : ast
	};
	
	
	// Should this create the function as well?
	AST.Block.prototype.defers = function (original,replacement){
		var idx = this.nodes().indexOf(original);
		if(idx >= 0) {
			this.nodes()[idx] = replacement;
		};
		// now return the nodes after this
		replacement._prebreak || (replacement._prebreak = original._prebreak);// hacky
		var rest = this.nodes().splice(idx + 1);
		return rest;
	};
	
	
	AST.Block.prototype.consume = function (node){
		var v_, before;
		if(node instanceof AST.TagTree) {// special case?!?
			// what if there is only one node?
			// let all the inner nodes consume this
			this.setNodes(this.nodes().map(function (child){
				return child.consume(node);
			}));
			// then wrap ourselves in an array as well(!)
			if(this.nodes().length > 1) {
				(this.setNodes(v_=[new AST.Arr(this.nodes())]),v_);
			};
			
			// hmmm
			return this;
		};
		
		// can also return super if it is expressable, but should we really?
		if(before = this.last()) {
			var after = before.consume(node);
			if(after != before) {
				
				// p "replace node in block"
				this.replace(before,after);
			};
		};
		// really?
		return this;
	};
	
	
	AST.Block.prototype.isExpressable = function (){
		if(!this.nodes().every(function (v){
			return v.isExpressable();
		})) {
			return false;
		};
		return true;
	};
	
	
	AST.Block.prototype.isExpression = function (){
		return this.option('express') || AST.Block.__super__.isExpression.call(this);
	};
	
	
	
	// this is almost like the old VarDeclarations but without the values
	/* @class VarBlock */
	AST.VarBlock = function VarBlock(){ AST.ListNode.apply(this,arguments) };
	
	subclass$(AST.VarBlock,AST.ListNode);
	AST.VarBlock.prototype.addExpression = function (expr){
		// p "addExpression {self} <- {expr}"
		
		if(expr instanceof AST.Assign) {
			this.addExpression(expr.left());// make sure this is a valid thing?
			// make this into a tuple instead
			// possibly fix this as well?!?
			// does not need to be a tuple?
			return new AST.TupleAssign('=',new AST.Tuple(this.nodes()),expr.right());
		} else {
			if(expr instanceof AST.VarOrAccess) {
				// this is really a VarReference
				this.push(new AST.VarReference(expr.value()));
			} else {
				if((expr instanceof AST.Splat) && (expr.node() instanceof AST.VarOrAccess)) {
					// p "is a splat - only allowed in tuple-assignment"
					expr.setValue(new AST.VarReference(expr.node().value()));
					this.push(expr);
				} else {
					throw "VarBlock does not allow non-variable expressions";
				}
			}
		};
		return this;
	};
	
	
	AST.VarBlock.prototype.isExpressable = function (){
		// hmm, we would need to force-drop the variables, makes little sense
		// but, it could be, could just push the variables out?
		return false;
	};
	
	
	AST.VarBlock.prototype.js = function (o){
		var code = this.nodes().map(function (node){
			return node.c();
		});
		code = code.flatten().compact().filter(function (n){
			return n != null && n != undefined && n != AST.EMPTY;
		});
		return ("var " + (code.join(",")));
	};
	
	
	AST.VarBlock.prototype.consume = function (node){
		// It doesnt make much sense for a VarBlock to consume anything
		// it should probably return void for methods
		return this;
	};
	
	
	
	// Could inherit from valueNode
	/* @class Parens */
	AST.Parens = function Parens(){ AST.ValueNode.apply(this,arguments) };
	
	subclass$(AST.Parens,AST.ValueNode);
	AST.Parens.prototype.js = function (o){
		var par = this.up();
		// p "Parens up {par} {o.isExpression}"
		
		if(par instanceof AST.Block) {
			if(!(o.isExpression())) {
				this._noparen = true;
			};
			return this.value().c({expression: o.isExpression()});
		} else {
			return this.value().c({expression: true});
		};
	};
	
	
	AST.Parens.prototype.shouldParenthesize = function (){
		// no need to parenthesize if this is a line in a block
		if(this._noparen) {
			return false;
		};//  or par isa AST.ArgList
		return true;
	};
	
	
	AST.Parens.prototype.prebreak = function (br){
		var $1;
		AST.Parens.__super__.prebreak.call(this,br);
		// hmm
		if(this._value) {
			this._value.prebreak(br);
		};
		return this;
	};
	
	
	AST.Parens.prototype.isExpressable = function (){
		return this.value().isExpressable();
	};
	
	
	AST.Parens.prototype.consume = function (node){
		return this.value().consume(node);
	};
	
	
	
	
	// Could inherit from valueNode
	// an explicit expression-block (with parens) is somewhat different
	// can be used to return after an expression
	/* @class ExpressionBlock */
	AST.ExpressionBlock = function ExpressionBlock(){ AST.ListNode.apply(this,arguments) };
	
	subclass$(AST.ExpressionBlock,AST.ListNode);
	AST.ExpressionBlock.prototype.visit = function (){
		// we need to see if this
		this.map(function (item){
			return item.traverse();
		});
		return this;
	};
	
	
	AST.ExpressionBlock.prototype.c = function (){
		return this.map(function (item){
			return item.c();
		}).join(",");
	};
	
	
	AST.ExpressionBlock.prototype.consume = function (node){
		return this.value().consume(node);
	};
	
	
	AST.ExpressionBlock.prototype.addExpression = function (expr){
		// Need to take care of the splat here to.. hazzle
		if(expr.node() instanceof AST.Assign) {
			// p "is assignment!"
			this.push(expr.left());
			// make this into a tuple instead
			// possibly fix this as well?!?
			return new AST.TupleAssign('=',new AST.Tuple(this.nodes()),expr.right());
		} else {
			this.push(expr);
		};
		return this;
	};
	


}())
},{"./helpers":10}],5:[function(require,module,exports){
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
	
	/* @class Call */
	AST.Call = function Call(callee,args,opexists){
		// some axioms that share the same syntax as calls will be redirected from here
		
		if(callee instanceof AST.VarOrAccess) {
			var str = callee.value().symbol();
			// p "AST.Call callee {callee} - {str}"
			if(str == 'extern') {
				// p "returning extern instead!"
				return new AST.ExternDeclaration(args);
			};
			if(str == 'tag') {
				// console.log "ERROR - access args by some method"
				return new AST.TagWrapper((args && args.index) ? (args.index(0)) : (args[0]));// hmmm
			};
			if(str == 'export') {
				return new AST.ExportStatement(args);// hmmm
			};
		};
		
		this._callee = callee;
		this._args = args || new AST.ArgList([]);// hmmm
		
		if(args instanceof Array) {
			this._args = new AST.ArgList(args);
			// console.log "ARGUMENTS IS ARRAY - error {args}"
		};
		// p "call opexists {opexists}"
		this;
	};
	
	subclass$(AST.Call,AST.Expression);
	
	AST.Call.prototype.__callee = {};
	AST.Call.prototype.callee = function(v){ return this._callee; }
	AST.Call.prototype.setCallee = function(v){ this._callee = v; return this; };
	
	AST.Call.prototype.__receiver = {};
	AST.Call.prototype.receiver = function(v){ return this._receiver; }
	AST.Call.prototype.setReceiver = function(v){ this._receiver = v; return this; };
	
	AST.Call.prototype.__args = {};
	AST.Call.prototype.args = function(v){ return this._args; }
	AST.Call.prototype.setArgs = function(v){ this._args = v; return this; };
	
	AST.Call.prototype.__block = {};
	AST.Call.prototype.block = function(v){ return this._block; }
	AST.Call.prototype.setBlock = function(v){ this._block = v; return this; };
	
	
	
	AST.Call.prototype.visit = function (){
		// console.log "visit args {args}"
		this.args().traverse();
		this.callee().traverse();
		
		return this._block && this._block.traverse();
	};
	
	AST.Call.prototype.addBlock = function (block){
		// if args.names
		// p "addBlock to call!"
		// var idx = -1
		var pos = this._args.filter(function (n,i){
			return n == '&';
		})[0];
		// idx = i if n == '&'
		// p "FOUND LOGIC"
		// p "node in args {i} {n}"
		if(pos) {
			this.args().replace(pos,block);
		} else {
			this.args().push(block);
		};
		// args.push(block)
		return this;
	};
	
	AST.Call.prototype.receiver = function (){
		return this._receiver || (this._receiver = ((this.callee() instanceof AST.Access) && this.callee().left() || AST.NULL));
	};
	
	// check if all arguments are expressions - otherwise we have an issue
	
	AST.Call.prototype.safechain = function (){
		return this.callee().safechain();// really?
	};
	
	AST.Call.prototype.c = function (){
		return AST.Call.__super__.c.apply(this,arguments);
	};
	
	AST.Call.prototype.js = function (){
		var opt = {expression: true};
		var rec = null;
		var args = this.args().compact();
		var splat = args.some(function (v){
			return v instanceof AST.Splat;
		});
		var out = null;
		var lft = null;
		var rgt = null;
		var wrap = null;
		
		var callee = this._callee = this._callee.node();// drop the var or access?
		
		// p "{self} - {@callee}"
		
		if((callee instanceof AST.Call) && callee.safechain()) {
			// p "the outer call is safechained"
			true;
			// we need to specify that the _result_ of
		};
		
		if(callee instanceof AST.Access) {
			lft = callee.left();
			rgt = callee.right();
		};
		
		if((callee instanceof AST.Super) || (callee instanceof AST.SuperAccess)) {
			this._receiver = this.scope__().context();
			// return "supercall"
		};
		
		// never call the property-access directly?
		if(callee instanceof AST.PropertyAccess) {// && rec = callee.receiver
			// p "unwrapping property-access in call"
			this._receiver = callee.receiver();
			callee = this._callee = OP('.',callee.left(),callee.right());
			// console.log "unwrapping the propertyAccess"
		};
		
		
		if(lft && lft.safechain()) {
			// p "Call[left] is safechain {lft}".blue
			lft.cache();
			// we want to 
			// wrap = ["{}"]
			// p "Call should not cache whole result - only the result of the call".red
		};
		
		
		if(callee.safechain()) {
			// 
			// if lft isa AST.Call
			// if lft isa AST.Call # could be a property access as well - it is the same?
			// if it is a local var access we simply check if it is a function, then call
			// but it should be safechained outside as well?
			if(lft) {
				lft.cache();
			};
			// the outer safechain should not cache the whole call - only ask to cache
			// the result? -- chain onto
			// p "Call safechain {callee} {lft}.{rgt}"
			var isfn = new AST.Util.IsFunction([callee]);
			wrap = [("" + (isfn.c()) + " && "),""];
		};
		
		// if callee.right
		// if calle is PropertyAccess we should convert it first
		// to keep the logic in call? 
		// 
		
		// if 
		
		// should just force expression from the start, no?
		if(splat) {
			// important to wrap the single value in a value, to keep implicit call
			// this is due to the way we check for an outer AST.Call without checking if
			// we are the receiver (in PropertyAccess). Should rather wrap in CallArguments
			var ary = ((args.count() == 1) ? (new AST.ValueNode(args.first().value())) : (new AST.Arr(args.list())));
			this.receiver().cache();// need to cache the target
			out = ("" + (callee.c({expression: true})) + ".apply(" + (this.receiver().c()) + "," + (ary.c({expression: true})) + ")");
		} else {
			if(this._receiver) {
				this._receiver.cache();
				args.unshift(this.receiver());
				// should rather rewrite to a new call?
				out = ("" + (callee.c({expression: true})) + ".call(" + (args.c({expression: true})) + ")");
			} else {
				out = ("" + (callee.c({expression: true})) + "(" + (args.c({expression: true})) + ")");
			}
		};
		
		if(wrap) {
			// we set the cachevar inside
			// p "special caching for call"
			if(this._cache) {
				this._cache.manual = true;
				out = ("(" + (this.cachevar().c()) + "=" + out + ")");
			};
			
			out = [wrap[0],out,wrap[1]].join("");
		};
		
		return out;
	};
	
	
	
	
	
	/* @class ImplicitCall */
	AST.ImplicitCall = function ImplicitCall(){ AST.Call.apply(this,arguments) };
	
	subclass$(AST.ImplicitCall,AST.Call);
	AST.ImplicitCall.prototype.js = function (){
		return "" + (this.callee().c()) + "()";
	};
	
	
	
	
	/* @class New */
	AST.New = function New(){ AST.Call.apply(this,arguments) };
	
	subclass$(AST.New,AST.Call);
	AST.New.prototype.js = function (o){
		// 
		var out = ("new " + (this.callee().c()));
		// out = out.parenthesize if o.parent isa AST.Access # hmm?
		if(!((o.parent() instanceof AST.Call))) {
			out += '()';
		};
		return out;
		// "{callee.c}()"
	};
	
	
	
	
	/* @class SuperCall */
	AST.SuperCall = function SuperCall(){ AST.Call.apply(this,arguments) };
	
	subclass$(AST.SuperCall,AST.Call);
	AST.SuperCall.prototype.js = function (o){
		var m = o.method();
		this.setReceiver(AST.SELF);
		this.setCallee(("" + (m.target().c()) + ".super$.prototype." + (m.name().c())));
		return AST.SuperCall.__super__.js.apply(this,arguments);
	};
	
	
	
	
	/* @class ExternDeclaration */
	AST.ExternDeclaration = function ExternDeclaration(){ AST.ListNode.apply(this,arguments) };
	
	subclass$(AST.ExternDeclaration,AST.ListNode);
	AST.ExternDeclaration.prototype.visit = function (){
		// p "visiting externdeclaration"
		this.setNodes(this.map(function (item){
			return item.node();
		}));// drop var or access really
		// only in global scope?
		var root = this.scope__();
		this.nodes().map(function (item){
			var variable = root.register(item.symbol(),item,{type: 'global'});// hmmmm
			return variable.addReference(item);
		});
		return this;
	};
	
	AST.ExternDeclaration.prototype.c = function (){
		return "// externs";
		// register :global, self, type: 'global'
	};
	


}())
},{}],6:[function(require,module,exports){
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
	function iter$(a){ return a ? (a.toArray ? a.toArray() : a) : []; };
	//  Code 
	
	// A function definition. This is the only node that creates a new real Scope.
	// When for the purposes of walking the contents of a function body, the Code
	// has no *children* -- they're within the inner scope.
	
	/* @class Code */
	AST.Code = function Code(){ AST.Node.apply(this,arguments) };
	
	subclass$(AST.Code,AST.Node);
	
	AST.Code.prototype.__head = {};
	AST.Code.prototype.head = function(v){ return this._head; }
	AST.Code.prototype.setHead = function(v){ this._head = v; return this; };
	
	AST.Code.prototype.__body = {};
	AST.Code.prototype.body = function(v){ return this._body; }
	AST.Code.prototype.setBody = function(v){ this._body = v; return this; };
	
	AST.Code.prototype.__scope = {};
	AST.Code.prototype.scope = function(v){ return this._scope; }
	AST.Code.prototype.setScope = function(v){ this._scope = v; return this; };
	
	AST.Code.prototype.__params = {};
	AST.Code.prototype.params = function(v){ return this._params; }
	AST.Code.prototype.setParams = function(v){ this._params = v; return this; };
	
	AST.Code.prototype.scopetype = function (){
		return AST.Scope;
	};
	
	AST.Code.prototype.visit = function (){
		if(this._scope) {
			this._scope.visit();
		};
		// @scope.parent = STACK.scope(1) if @scope
		return this;
	};
	
	
	// Rename to Program?
	/* @class Root */
	AST.Root = function Root(body,opts){
		// p "create root!"
		var v_;
		this.setBody(body.block());
		(this.setScope(v_=new AST.FileScope(this,null)),v_);
	};
	
	subclass$(AST.Root,AST.Code);
	
	
	AST.Root.prototype.visit = function (){
		this.scope().visit();
		return this.body().traverse();
	};
	
	AST.Root.prototype.compile = function (){
		this.traverse();
		return this.c();
	};
	
	AST.Root.prototype.js = function (){
		return '(function(){\n\n' + this.scope().c({indent: true}) + '\n\n}())';
	};
	
	AST.Root.prototype.analyze = function (){
		// STACK.loglevel = 0
		this.traverse();
		return this.scope().dump();
	};
	
	AST.Root.prototype.inspect = function (){
		return true;
	};
	
	
	/* @class ClassDeclaration */
	AST.ClassDeclaration = function ClassDeclaration(name,superclass,body){
		// what about the namespace?
		this._name = name;
		this._superclass = superclass;
		this._scope = new AST.ClassScope(this);
		this._body = body.block();
	};
	
	subclass$(AST.ClassDeclaration,AST.Code);
	
	AST.ClassDeclaration.prototype.__name = {};
	AST.ClassDeclaration.prototype.name = function(v){ return this._name; }
	AST.ClassDeclaration.prototype.setName = function(v){ this._name = v; return this; };
	
	AST.ClassDeclaration.prototype.__superclass = {};
	AST.ClassDeclaration.prototype.superclass = function(v){ return this._superclass; }
	AST.ClassDeclaration.prototype.setSuperclass = function(v){ this._superclass = v; return this; };
	
	AST.ClassDeclaration.prototype.__initor = {};
	AST.ClassDeclaration.prototype.initor = function(v){ return this._initor; }
	AST.ClassDeclaration.prototype.setInitor = function(v){ this._initor = v; return this; };
	
	
	
	AST.ClassDeclaration.prototype.visit = function (){
		// replace with some advanced lookup?
		this.scope().visit();
		
		// local is the default -- should it really be referenced?
		// if option(:local)
		// self.name = scope.parent.register(name,self)
		
		return this.body().traverse();
	};
	
	AST.ClassDeclaration.prototype.js = function (){
		this.scope().virtualize();
		this.scope().context().setValue(this.name());
		
		// should probably also warn about stuff etc
		if(this.option('extension')) {
			return this.body().c();
		};
		
		var o = this._options || {};
		var cname = (this.name() instanceof AST.Access) ? (this.name().right()) : (this.name());
		var namespaced = this.name() != cname;
		var sup = this.superclass();
		var initor = this.body().pluck(function (c){
			return (c instanceof AST.MethodDeclaration) && c.type() == 'constructor';
		});
		
		if(!initor) {
			if(sup) {
				initor = ("function " + (cname.c()) + "()\{ " + (sup.c()) + ".apply(this,arguments) \}");
			} else {
				initor = ("function " + (cname.c()) + "()") + '{ }';
			};
		} else {
			(initor.setName(cname),cname);
		};
		
		// if we are defining a class inside a namespace etc -- how should we set up the class?
		var head = [];
		
		if(namespaced) {
			initor = ("" + (this.name().c()) + " = " + (initor.c()));// OP('=',name,initor) # hmm
		};
		
		head.push(("/* @class " + (cname.c()) + " */\n" + (initor.c()) + ";\n\n"));
		
		if(sup) {
			// console.log "deal with superclass!"
			// head.push("// extending the superclass\nimba$class({name.c},{sup.c});\n\n")
			head.push(new AST.Util.Subclass([this.name(),sup]));
		};
		
		// only if it is not namespaced
		if(o.global && !namespaced) {// option(:global)
			head.push(("global." + (cname.c()) + " = " + (this.name().c()) + "; // global class \n"))
		};
		
		if(o.export && !namespaced) {
			head.push(("exports." + (cname.c()) + " = " + (this.name().c()) + "; // export class \n"))
		};
		
		// FIXME
		// if namespaced and (o:local or o:export)
		// 	console.log "namespaced classes are implicitly local/global depending on the namespace"
		
		
		for(var i=0, ary=iter$(head.reverse()), len=ary.length; i < len; i++) {
			this.body().unshift(ary[i]);
		};
		this.body()._indentation = null;
		var out = this.body().c();
		
		return out;
	};
	
	
	// class AST.TagTypeRef < AST.ValueNode
	// 
	// 	def toConst
	// 		@const ||= value.c.replace(/\:/g,'_').toSymbol
	
	
	/* @class TagDeclaration */
	AST.TagDeclaration = function TagDeclaration(name,superclass,body){
		// what about the namespace?
		// @name = AST.TagTypeRef.new(name)
		this._name = name;
		this._superclass = superclass;
		this._scope = new AST.TagScope(this);
		this._body = (body || []).block();
	};
	
	subclass$(AST.TagDeclaration,AST.Code);
	
	AST.TagDeclaration.prototype.__name = {};
	AST.TagDeclaration.prototype.name = function(v){ return this._name; }
	AST.TagDeclaration.prototype.setName = function(v){ this._name = v; return this; };
	
	AST.TagDeclaration.prototype.__superclass = {};
	AST.TagDeclaration.prototype.superclass = function(v){ return this._superclass; }
	AST.TagDeclaration.prototype.setSuperclass = function(v){ this._superclass = v; return this; };
	
	AST.TagDeclaration.prototype.__initor = {};
	AST.TagDeclaration.prototype.initor = function(v){ return this._initor; }
	AST.TagDeclaration.prototype.setInitor = function(v){ this._initor = v; return this; };
	
	
	
	AST.TagDeclaration.prototype.visit = function (){
		// replace with some advanced lookup?
		this.scope().visit();
		return this.body().traverse();
	};
	
	AST.TagDeclaration.prototype.id = function (){
		return this.name().id();
	};
	
	AST.TagDeclaration.prototype.js = function (){
		
		if(this.option('extension')) {
			// check if we have an initialize etc - not allowed?
			this.scope().context().setValue(this.name());
			return this.body().c();
		};
		
		// should disallow initialize for tags?
		var sup = this.superclass() && "," + this.superclass().func().quoted() || "";
		
		var out = (this.name().id()) ? (
			("Imba.defineSingletonTag('" + (this.name().id()) + "',function " + (this.name().func()) + "(d)\{this.setDom(d)\}" + sup + ")")
		) : (
			("Imba.defineTag('" + (this.name().func()) + "',function " + (this.name().func()) + "(d)\{this.setDom(d)\}" + sup + ")")
		);
		
		// if the body is empty we can return this directly
		if(this.body().count() == 0) {
			return out;
		};
		
		// create closure etc
		// again, we should really use the included system
		// FIXME should consolidate the way we generate all code - this
		// is going down a route of more direct conversion, which is less
		// flexible.
		
		// WARN should fix
		this.body()._indentation = null;
		
		out = ("var tag = " + out + ";");
		this.scope().context().setValue(new AST.Const('tag'));
		out += ("\n" + (this.body().c()));
		
		
		
		return '(function()' + out.wrap() + ')()';
	};
	
	
	/* @class Func */
	AST.Func = function Func(params,body,name,target,o){
		// p "INIT Function!!",params,body,name
		var typ = this.scopetype();
		this._scope || (this._scope = (o && o.scope) || new typ(this));
		this._scope.setParams(this._params = new AST.ParamList(params));
		this._body = body.block();
		this._name = name || '';
		this._target = target;
		this._options = o;
		this._type = 'function';
		this;
	};
	
	subclass$(AST.Func,AST.Code);
	
	AST.Func.prototype.__name = {};
	AST.Func.prototype.name = function(v){ return this._name; }
	AST.Func.prototype.setName = function(v){ this._name = v; return this; };
	
	AST.Func.prototype.__params = {};
	AST.Func.prototype.params = function(v){ return this._params; }
	AST.Func.prototype.setParams = function(v){ this._params = v; return this; };
	
	AST.Func.prototype.__target = {};
	AST.Func.prototype.target = function(v){ return this._target; }
	AST.Func.prototype.setTarget = function(v){ this._target = v; return this; };
	
	AST.Func.prototype.__options = {};
	AST.Func.prototype.options = function(v){ return this._options; }
	AST.Func.prototype.setOptions = function(v){ this._options = v; return this; };
	
	AST.Func.prototype.__type = {};
	AST.Func.prototype.type = function(v){ return this._type; }
	AST.Func.prototype.setType = function(v){ this._type = v; return this; };
	
	AST.Func.prototype.__context = {};
	AST.Func.prototype.context = function(v){ return this._context; }
	AST.Func.prototype.setContext = function(v){ this._context = v; return this; };
	
	AST.Func.prototype.scopetype = function (){
		return AST.FunctionScope;
	};
	
	
	
	AST.Func.prototype.visit = function (){
		this.scope().visit();
		this._context = this.scope().parent();
		this._params.traverse();
		return this._body.traverse();// so soon?
	};
	
	
	AST.Func.prototype.js = function (o){
		if(!this.option('noreturn')) {
			this.body().consume(new AST.ImplicitReturn());
		};
		var code = this.scope().c({indent: true,braces: true});
		// args = params.map do |par| par.name
		// head = params.map do |par| par.c
		// code = [head,body.c(expression: no)].flatten.compact.join("\n").wrap
		// FIXME creating the function-name this way is prone to create naming-collisions
		// will need to wrap the value in a FunctionName which takes care of looking up scope
		// and possibly dealing with it
		var name = this.name().c().replace(/\./g,'_');
		var out = ("function " + name + "(" + (this.params().c()) + ")") + code;
		if(this.option('eval')) {
			out = ("(" + out + ")()");
		};
		// out = out.parenthesize if isExpression
		return out;
	};
	
	AST.Func.prototype.shouldParenthesize = function (){
		return (this.up() instanceof AST.Call) && this.up().callee() == this;
		// if up as a call? Only if we are 
	};
	
	
	/* @class Lambda */
	AST.Lambda = function Lambda(){ AST.Func.apply(this,arguments) };
	
	subclass$(AST.Lambda,AST.Func);
	AST.Lambda.prototype.scopetype = function (){
		return AST.LambdaScope;
	};
	// MethodDeclaration
	// Create a shared body?
	;
	
	/* @class MethodDeclaration */
	AST.MethodDeclaration = function MethodDeclaration(){ AST.Func.apply(this,arguments) };
	
	subclass$(AST.MethodDeclaration,AST.Func);
	
	AST.MethodDeclaration.prototype.__variable = {};
	AST.MethodDeclaration.prototype.variable = function(v){ return this._variable; }
	AST.MethodDeclaration.prototype.setVariable = function(v){ this._variable = v; return this; };
	
	AST.MethodDeclaration.prototype.scopetype = function (){
		return AST.MethodScope;
	};
	
	AST.MethodDeclaration.prototype.visit = function (){
		// prebreak # make sure this has a break?
		
		var v_;
		if(this.name().toSymbol() == 'initialize') {
			(this.setType(v_='constructor'),v_);
		};
		
		if(this.body().expressions) {
			this.set({greedy: true});
			// p "BODY EXPRESSIONS!! This is a fragment"
			var tree = new AST.TagTree();
			this._body = this.body().consume(tree);
			// body.nodes = [AST.Arr.new(body.nodes)] # hmm
		};
		
		this.scope().visit();
		this._context = this.scope().parent();
		this._params.traverse();
		
		if(this.target() instanceof AST.Self) {
			this._target = this._scope.parent().context();
			this.set({static: true});
		};
		
		if(this.context() instanceof AST.ClassScope) {
			// register as class-method?
			true;
		} else {
			if(!(this._target)) {
				(this.setVariable(v_=this.context().register(this.name(),this,{type: 'meth'})),v_);
			}
		};
		
		// hmm?
		this._target || (this._target = this._scope.parent().context());
		
		this._body.traverse();// so soon?
		
		// p "method target {@target} {@context}"
		return this;
	};
	
	AST.MethodDeclaration.prototype.supername = function (){
		return (this.type() == 'constructor') ? (this.type()) : (this.name());
	};
	
	
	// FIXME export global etc are NOT valid for methods inside any other scope than
	// the outermost scope (root)
	
	AST.MethodDeclaration.prototype.js = function (){
		// FIXME Do this in the grammar - remnants of old implementation
		if(!(this.type() == 'constructor' || this.option('noreturn'))) {
			if(this.option('greedy')) {
				// haaack
				this.body().consume(new AST.GreedyReturn());
			} else {
				this.body().consume(new AST.ImplicitReturn());
			};
		};
		var code = this.scope().c({indent: true,braces: true});
		
		var name = this.name().c().replace(/\./g,'_');// WHAT?
		var foot = [];
		
		var left = "";
		var func = ("(" + (this.params().c()) + ")") + code;// .wrap
		var target = this.target();
		var decl = !this.option('global') && !this.option('export');
		
		if(target instanceof AST.ScopeContext) {
			// the target is a scope context
			target = null;// hmm -- 
		};
		
		var ctx = this.context();
		var out = "";
		// if ctx 
		
		
		
		var fname = this.name().toSymbol();
		var fdecl = fname;// decl ? fname : ''
		
		if((ctx instanceof AST.ClassScope) && !target) {
			if(this.type() == 'constructor') {
				out = ("function " + fname + func);
			} else {
				if(this.option('static')) {
					out = ("" + (ctx.context().c()) + "." + fname + " = function " + func);
				} else {
					out = ("" + (ctx.context().c()) + ".prototype." + fname + " = function " + func);
				}
			};
		} else {
			if((ctx instanceof AST.FileScope) && !target) {
				// register method as a root-function, but with auto-call? hmm
				// should probably set using variable directly instead, no?
				out = ("function " + fdecl + func);
			} else {
				if(target && this.option('static')) {
					out = ("" + (target.c()) + "." + fname + " = function " + func);
				} else {
					if(target) {
						// hmm
						out = ("" + (target.c()) + ".prototype." + fname + " = function " + func);
					} else {
						out = ("function " + fdecl + func);
					}
				}
			}
		};
		
		if(this.option('global')) {
			out = ("" + fname + " = " + out);
		};
		
		if(this.option('export')) {
			out = ("" + out + "; exports." + fname + " = " + fname + ";");
		};
		
		return out;
	};
	
	
	
	/* @class TagFragmentDeclaration */
	AST.TagFragmentDeclaration = function TagFragmentDeclaration(){ AST.MethodDeclaration.apply(this,arguments) };
	
	subclass$(AST.TagFragmentDeclaration,AST.MethodDeclaration);
	
	
	
	var propTemplate = '${headers}\n${path}.__${getter} = ${options};\n${path}.${getter} = function(v){ return ${get}; }\n${path}.${setter} = function(v){ ${set}; return this; }\n${init}';
	
	var propWatchTemplate = '${headers}\n${path}.__${getter} = ${options};\n${path}.${getter} = function(v){ return ${get}; }\n${path}.${setter} = function(v){\n	var a = this.${getter}();\n	if(v != a) { v = ${set}; }\n	if(v != a) { ${ondirty} }\n	return this;\n}\n${init}';
	
	/* @class PropertyDeclaration */
	AST.PropertyDeclaration = function PropertyDeclaration(name,options){
		this._name = name;
		this._options = options || new AST.Obj(new AST.AssignList());
	};
	
	subclass$(AST.PropertyDeclaration,AST.Expression);
	
	AST.PropertyDeclaration.prototype.__name = {};
	AST.PropertyDeclaration.prototype.name = function(v){ return this._name; }
	AST.PropertyDeclaration.prototype.setName = function(v){ this._name = v; return this; };
	
	AST.PropertyDeclaration.prototype.__options = {};
	AST.PropertyDeclaration.prototype.options = function(v){ return this._options; }
	AST.PropertyDeclaration.prototype.setOptions = function(v){ this._options = v; return this; };
	
	
	
	AST.PropertyDeclaration.prototype.visit = function (){
		this._options.traverse();
		return this;
	};
	
	// This will soon support bindings / listeners etc, much more
	// advanced generated code based on options passed in.
	AST.PropertyDeclaration.prototype.c = function (){
		var v_;
		var o = this.options();
		var ast = "";
		var key = this.name().c();
		var gets = ("@" + key);
		var sets = ("@" + key + " = v");
		var scope = STACK.scope();
		
		var deflt = this.options().key('default');
		var init = (deflt) ? (("self:prototype.@" + key + " = " + (deflt.value().c()))) : ("");
		
		// var pars =
		// 	watch: o.key(:watch)
		// 	delegate: o.key(:delegate)
		
		var pars = o.hash();
		
		var js = {
			key: key,
			getter: key,
			setter: ("set-" + key).toSymbol(),
			scope: ("" + (scope.context().c())),
			path: '${scope}.prototype',
			set: ("this._" + key + " = v"),
			get: ("this._" + key),
			init: "",
			headers: "",
			ondirty: ""
		};
		
		var tpl = propTemplate;
		
		if(pars.watch) {
			// p "watch is a property {pars:watch}"
			if(!((pars.watch instanceof AST.Bool) && !(pars.watch.truthy()))) {
				tpl = propWatchTemplate;
			};
			var wfn = ("" + key + "DidSet");
			
			if(pars.watch instanceof AST.Symbol) {
				wfn = pars.watch;
			} else {
				if(pars.watch instanceof AST.Bool) {
					(o.key('watch').setValue(v_=new AST.Symbol(("" + key + "DidSet"))),v_);
				}
			};
			
			// should check for the function first, no?
			// HACK
			// o.key(:watch).value = AST.Symbol
			var fn = OP('.',new AST.This(),wfn);
			js.ondirty = OP('&&',fn,CALL(fn,['v','a',("this.__" + key)])).c();// CALLSELF(wfn,[]).c
			// js:ondirty = "if(this.{wfn}) this.{wfn}(v,a,this.__{key});"
		};
		
		if(o.key('dom') || o.key('attr')) {
			js.set = ("this.setAttribute('" + key + "',v)");
			js.get = ("this.getAttribute('" + key + "')");
		} else {
			if(o.key('delegate')) {
				// if we have a delegate
				js.set = ("this.__" + key + ".delegate.set(this,'" + key + "',v,this.__" + key + ")");
				js.get = ("this.__" + key + ".delegate.get(this,'" + key + "',this.__" + key + ")");
			}
		};
		
		if(deflt) {
			if(o.key('dom')) {
				js.init = ("" + (js.scope) + ".dom().setAttribute('" + key + "'," + (deflt.value().c()) + ");");
			} else {
				js.init = ("" + (js.scope) + ".prototype._" + key + " = " + (deflt.value().c()) + ";");
			};
		};
		
		if(o.key('chainable')) {
			js.get = ("v !== undefined ? (this." + (js.setter) + "(v),this) : " + (js.get));
		};
		
		js.options = o.c();
		
		var reg = /\$\{(\w+)\}/gm;
		// var tpl = o.key(:watch) ? propWatchTemplate : propTemplate
		var out = tpl.replace(reg,function (m,a){
			return js[a];
		});
		// run another time for nesting. hacky
		out = out.replace(reg,function (m,a){
			return js[a];
		});
		out = out.replace(/\n\s*$/,'');
		
		// if o.key(:v)
		return out;
	};
	


}())
},{}],7:[function(require,module,exports){
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
	
	/* @class Await */
	AST.Await = function Await(){ AST.ValueNode.apply(this,arguments) };
	
	subclass$(AST.Await,AST.ValueNode);
	
	AST.Await.prototype.__func = {};
	AST.Await.prototype.func = function(v){ return this._func; }
	AST.Await.prototype.setFunc = function(v){ this._func = v; return this; };
	
	AST.Await.prototype.js = function (){
		// introduce a util here, no?
		return CALL(OP('.',new AST.Util.Promisify([this.value()]),'then').prebreak(),[this.func()]).c();
		// value.c
	};
	
	AST.Await.prototype.visit = function (o){
		// things are now traversed in a somewhat chaotic order. Need to tighten
		// Create await function - push this value up to block, take the outer
		var self=this;
		self.value().traverse();
		
		var block = o.up(AST.Block);// or up to the closest FUNCTION?
		var outer = o.relative(block,1);
		var par = o.relative(self,-1);
		
		// p "Block {block} {outer} {par}"
		
		self.setFunc(new AST.AsyncFunc([],[]));
		// now we move this node up to the block
		self.func().body().setNodes(block.defers(outer,self));
		
		// if the outer is a var-assignment, we can simply set the params
		if(par instanceof AST.Assign) {
			par.left().traverse();
			var lft = par.left().node();
			// p "Async assignment {par} {lft}"
			// Can be a tuple as well, no?
			if(lft instanceof AST.VarReference) {
				// the param is already registered?
				// should not force the name already??
				// beware of bugs
				self.func().params().at(0,true,lft.variable().name());
			} else {
				if(lft instanceof AST.Tuple) {
					// if this an unfancy tuple, with only vars
					// we can just use arguments
					
					if(par.type() == 'var' && !(lft.hasSplat())) {
						// p "SIMPLIFY! {lft.nodes[0]}"
						lft.map(function (el,i){
							return self.func().params().at(i,true,el.value());
						});
					} else {
						// otherwise, do the whole tuple
						// make sure it is a var assignment?
						par.setRight(AST.ARGUMENTS);
						self.func().body().unshift(par);
					};
				} else {
					// regular setters
					par.setRight(self.func().params().at(0,true));
					self.func().body().unshift(par);
				}
			};
		};
		
		
		
		// If it is an advance tuple or something, it should be possible to
		// feed in the paramlist, and let the tuple handle it as if it was any
		// other value
		
		// CASE If this is a tuple / multiset with more than one async value
		// we need to think differently.
		
		// now we need to visit the function as well
		self.func().traverse();
		// pull the outer in
		return self;
	};
	
	
	/* @class AsyncFunc */
	AST.AsyncFunc = function AsyncFunc(params,body,name,target,options){
		AST.AsyncFunc.__super__.constructor.apply(this,arguments);
	};
	
	subclass$(AST.AsyncFunc,AST.Func);
	
	
	AST.AsyncFunc.prototype.scopetype = function (){
		return AST.LambdaScope;
	};
	
	// need to override, since we wont do implicit returns
	// def js
	// 	var code = scope.c
	// 	return "function ({params.c})" + code.wrap
	;


}())
},{}],8:[function(require,module,exports){
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
},{}],9:[function(require,module,exports){
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
	function iter$(a){ return a ? (a.toArray ? a.toArray() : a) : []; };
	var helpers = require('./helpers');
	
	/* @class ControlFlow */
	AST.ControlFlow = function ControlFlow(){ AST.Node.apply(this,arguments) };
	
	subclass$(AST.ControlFlow,AST.Node);
	
	
	
	
	/* @class ControlFlowStatement */
	AST.ControlFlowStatement = function ControlFlowStatement(){ AST.ControlFlow.apply(this,arguments) };
	
	subclass$(AST.ControlFlowStatement,AST.ControlFlow);
	AST.ControlFlowStatement.prototype.isExpressable = function (){
		return false;
	};
	
	
	
	
	/* @class If */
	AST.If = function If(cond,body,o){
		// p "IF options",o && o:type
		if(o === undefined) o = {};
		this._test = ((o.type == 'unless') ? (OP('!',cond)) : (cond));
		this._body = body;
	};
	
	subclass$(AST.If,AST.ControlFlow);
	
	AST.If.prototype.__test = {};
	AST.If.prototype.test = function(v){ return this._test; }
	AST.If.prototype.setTest = function(v){ this._test = v; return this; };
	
	AST.If.prototype.__body = {};
	AST.If.prototype.body = function(v){ return this._body; }
	AST.If.prototype.setBody = function(v){ this._body = v; return this; };
	
	AST.If.prototype.__alt = {};
	AST.If.prototype.alt = function(v){ return this._alt; }
	AST.If.prototype.setAlt = function(v){ this._alt = v; return this; };
	
	
	AST.If.prototype.addElse = function (add){
		// p "add else!",add
		if(this.alt() && (this.alt() instanceof AST.If)) {
			// p 'add to the inner else(!)',add
			this.alt().addElse(add);
		} else {
			(this.setAlt(add),add);
		};
		return this;
	};
	
	
	
	
	
	AST.If.prototype.visit = function (){
		if(this.test()) {
			this.test().traverse();
		};
		if(this.body()) {
			this.body().traverse();
		};
		return (this.alt()) && (this.alt().traverse());
	};
	
	
	AST.If.prototype.js = function (o){
		// would possibly want to look up / out 
		var brace = {braces: true,indent: true};
		
		var cond = this.test().c({expression: true});// the condition is always an expression
		
		
		if(o.isExpression()) {
			var code = this.body().c();// (braces: yes)
			// is expression!
			if(this.alt()) {
				// be safe - wrap condition as well
				return ("(" + cond + ") ? (" + code + ") : (" + (this.alt().c()) + ")");
			} else {
				// again - we need a better way to decide what needs parens
				// maybe better if we rewrite this to an OP('&&'), and put
				// the parens logic there
				return ("(" + cond + ") && (" + code + ")");
			};
		} else {
			code = this.body().c(brace);// (braces: yes)
			// don't wrap if it is only a single expression?
			var out = ("if(" + cond + ") ") + code;// ' {' + code + '}' # '{' + code + '}'
			if(this.alt()) {
				out += (" else " + (this.alt().c((this.alt() instanceof AST.If) ? ({}) : (brace))));
			};
			return out;
		};
	};
	
	
	AST.If.prototype.consume = function (node){
		// p 'assignify if?!'
		// if it is possible, convert into expression
		if(node instanceof AST.TagTree) {
			// p "TAG TREEEEEE"
			// hmmm
			this._body = this.body().consume(node);
			if(this.alt()) {
				this._alt = this.alt().consume(node);
			};
			return this;
		};
		
		if(this.isExpressable()) {
			this.toExpression();// mark as expression(!)
			return AST.If.__super__.consume.apply(this,arguments);
		} else {
			this._body = this.body().consume(node);
			if(this.alt()) {
				this._alt = this.alt().consume(node);
			};
		};
		return this;
	};
	
	
	AST.If.prototype.isExpressable = function (){
		var exp = this.body().isExpressable() && (!this.alt() || this.alt().isExpressable());
		// if exp
		// 	p "if is expressable".green
		// else
		// 	p "if is not expressable".red
		return exp;
	};
	
	
	
	
	/* @class Loop */
	AST.Loop = function Loop(options){
		if(options === undefined) options = {};
		this.setOptions(options);
		this;
	};
	
	subclass$(AST.Loop,AST.Statement);
	
	AST.Loop.prototype.__scope = {};
	AST.Loop.prototype.scope = function(v){ return this._scope; }
	AST.Loop.prototype.setScope = function(v){ this._scope = v; return this; };
	
	AST.Loop.prototype.__options = {};
	AST.Loop.prototype.options = function(v){ return this._options; }
	AST.Loop.prototype.setOptions = function(v){ this._options = v; return this; };
	
	AST.Loop.prototype.__body = {};
	AST.Loop.prototype.body = function(v){ return this._body; }
	AST.Loop.prototype.setBody = function(v){ this._body = v; return this; };
	
	AST.Loop.prototype.__catcher = {};
	AST.Loop.prototype.catcher = function(v){ return this._catcher; }
	AST.Loop.prototype.setCatcher = function(v){ this._catcher = v; return this; };
	
	
	
	
	
	AST.Loop.prototype.set = function (obj){
		// p "configure for!"
		this._options || (this._options = {});
		var keys = Object.keys(obj);
		for(var i=0, ary=iter$(keys), len=ary.length, k; i < len; i++) {
			k = ary[i];this._options[k] = obj[k];
		};
		return this;
	};
	
	
	AST.Loop.prototype.addBody = function (body){
		this.setBody(body.block());
		return this;
	};
	
	
	AST.Loop.prototype.c = function (o){
		// p "Loop.c - {isExpressable} {stack} {stack.isExpression}"
		// p "stack is expression? {o} {isExpression}"
		
		if(this.stack().isExpression() || this.isExpression()) {
			// what the inner one should not be an expression though?
			// this will resut in an infinite loop, no?!?
			var ast = CALL(FN([],[this]),[]);
			return ast.c(o);
		} else {
			if(this.stack().current() instanceof AST.Block) {
				// hmm - need to check more thoroughly
				// p "parent is a block!"
				return AST.Loop.__super__.c.call(this,o);
			} else {
				// p "Should never get here?!?"
				ast = CALL(FN([],[this]),[]);
				return ast.c(o);
				// need to wrap in function
			}
		};
	};
	
	
	
	
	/* @class While */
	AST.While = function While(test,opts){
		this._test = test;
		this._scope = new AST.WhileScope(this);
		if(opts) {
			this.set(opts);
		};
		// p "invert test for while? {@test}"
		if(this.option('invert')) {
			// "invert test for while {@test}"
			this._test = test.invert();
		};
		// invert the test
	};
	
	subclass$(AST.While,AST.Loop);
	
	AST.While.prototype.__test = {};
	AST.While.prototype.test = function(v){ return this._test; }
	AST.While.prototype.setTest = function(v){ this._test = v; return this; };
	
	
	
	
	
	AST.While.prototype.visit = function (){
		this.scope().visit();
		if(this.test()) {
			this.test().traverse();
		};
		return (this.body()) && (this.body().traverse());
	};
	
	
	// TODO BUG -- when we declare a var like: while var y = ...
	// the variable will be declared in the WhileScope which never
	// force-declares the inner variables in the scope
	
	AST.While.prototype.consume = function (node){
		// p "While.consume {node}".cyan
		// This is never expressable, but at some point
		// we might want to wrap it in a function (like CS)
		if(this.isExpressable()) {
			return AST.While.__super__.consume.apply(this,arguments);
		};
		
		if(node instanceof AST.TagTree) {
			// WARN this is a hack to allow references coming through the wrapping scope 
			// will result in unneeded self-declarations and other oddities
			this.scope().context().reference();
			return CALL(FN([],[this]),[]);
		};
		
		var reuse = false;
		// WARN Optimization - might have untended side-effects
		// if we are assigning directly to a local variable, we simply
		// use said variable for the inner res
		// if reuse
		// 	resvar = scope.declare(node.left.node.variable,AST.Arr.new([]),proxy: yes)
		// 	node = null
		// 	p "consume variable declarator!?".cyan
		// else
		// declare the variable we will use to soak up results
		// p "Creating value to store the result of loop".cyan
		// TODO Use a special vartype for this?
		var resvar = this.scope().declare('res',new AST.Arr([]),{system: true});
		// WHAT -- fix this --
		this._catcher = new AST.PushAssign("push",resvar,null);// the value is not preset # what
		this.body().consume(this._catcher);// should still return the same body
		
		// scope vars must not be compiled before this -- this is important
		var ast = BLOCK(this,resvar.accessor());// should be varaccess instead? # hmmm?
		return ast.consume(node);
		// NOTE Here we can find a way to know wheter or not we even need to 
		// return the resvar. Often it will not be needed
		// FIXME what happens if there is no node?!?
	};
	
	
	AST.While.prototype.js = function (){
		var out = ("while(" + (this.test().c({expression: true})) + ")") + this.body().c({braces: true,indent: true});// .wrap
		
		if(this.scope().vars().count() > 0) {
			// p "while-block has declared variables(!)"
			return [this.scope().vars().c(),out];
		};
		return out;
	};
	
	
	
	
	// This should define an open scope
	// should rather 
	/* @class For */
	AST.For = function For(o){
		if(o === undefined) o = {};
		this._options = o;
		this._scope = new AST.ForScope(this);
	};
	
	subclass$(AST.For,AST.Loop);
	
	
	
	AST.For.prototype.visit = function (){
		this.scope().visit();
		this.declare();
		// should be able to toggle whether to keep the results here already(!)
		this.body().traverse();
		return this.options().source.traverse();// what about awakening the vars here?
	};
	
	
	AST.For.prototype.declare = function (){
		
		var src = this.options().source;
		var vars = this.options().vars = {};
		var oi = this.options().index;
		
		
		// var i = vars:index = oi ? scope.declare(oi,0) : util.counter(0,yes).predeclare
		
		if(src instanceof AST.Range) {
			// p "range for-loop"
			vars.len = this.scope().declare('len',src.right());// util.len(o,yes).predeclare
			vars.index = this.scope().declare(this.options().name,src.left());
			vars.value = vars.index;
		} else {
			// vars:value = scope.declare(options:name,null,let: yes)
			var i = vars.index = (oi) ? (this.scope().declare(oi,0,{let: true})) : (this.util().counter(0,true).predeclare());
			vars.source = this.util().iterable(src,true).predeclare();
			vars.len = this.util().len(vars.source,true).predeclare();
			vars.value = this.scope().declare(this.options().name,null,{let: true});
			vars.value.addReference(this.options().name);// adding reference!
			if(oi) {
				i.addReference(oi);
			};
		};
		
		return this;
	};
	
	
	AST.For.prototype.consume = function (node){
		// p "Loop consume? {node}"
		// p "For.consume {node}".cyan
		if(this.isExpressable()) {
			return AST.For.__super__.consume.apply(this,arguments);
		};
		
		// other cases as well, no?
		if(node instanceof AST.TagTree) {
			// WARN this is a hack to allow references coming through the wrapping scope 
			// will result in unneeded self-declarations and other oddities
			// scope.parent.context.reference
			this.scope().context().reference();
			return CALL(new AST.Lambda([],[this]),[]);
		};
		
		
		var resvar = null;
		var reuseable = (node instanceof AST.Assign) && (node.left().node() instanceof AST.LocalVarAccess);
		
		// WARN Optimization - might have untended side-effects
		// if we are assigning directly to a local variable, we simply
		// use said variable for the inner res
		if(reuseable) {
			resvar = this.scope().declare(node.left().node().variable(),new AST.Arr([]),{proxy: true});
			node = null;
			// p "consume variable declarator!?".cyan
		} else {
			// declare the variable we will use to soak up results
			// p "Creating value to store the result of loop".cyan
			resvar = this.scope().declare('res',new AST.Arr([]),{system: true});
		};
		
		// p "GOT HERE TO PUSH ASSIGN",AST.PushAssign
		this._catcher = new AST.PushAssign("push",resvar,null);// the value is not preset
		this.body().consume(this._catcher);// should still return the same body
		
		var ast = BLOCK(this,resvar.accessor());// should be varaccess instead?
		if(node) {
			ast.consume(node);
		};
		// this is never an expression (for now -- but still)
		return ast;
	};
	
	
	AST.For.prototype.js = function (){
		var v_;
		var vars = this.options().vars;
		var i = vars.index;
		var val = vars.value;
		var cond = OP('<',i,vars.len);
		var src = this.options().source;
		
		// p "references for value",val.references:length
		
		var final = (this.options().step) ? (
			OP('=',i,OP('+',i,this.options().step))
		) : (
			OP('++',i)
		);
		
		// if there are few references to the value - we can drop
		// the actual variable and instead make it proxy through the index
		if(src instanceof AST.Range) {
			if(src.inclusive()) {
				(cond.setOp(v_='<='),v_);
			};
		} else {
			if(val.refcount() < 3) {
				// p "should proxy value-variable instead"
				val.proxy(vars.source,i);
			} else {
				this.body().unshift(OP('=',val,OP('.',vars.source,i)));
				// body.unshift(head)
				// TODO check lengths - intelligently decide whether to brace and indent
			}
		};
		var head = ("for(" + (this.scope().vars().c()) + "; " + (cond.c()) + "; " + (final.c()) + ") ");
		return head + this.body().c({braces: true,indent: true});// .wrap
	};
	
	
	AST.For.prototype.head = function (){
		var vars = this.options().vars;
		return OP('=',vars.value,OP('.',vars.source,vars.index));
	};
	
	
	
	
	/* @class ForIn */
	AST.ForIn = function ForIn(){ AST.For.apply(this,arguments) };
	
	subclass$(AST.ForIn,AST.For);
	
	
	
	
	/* @class ForOf */
	AST.ForOf = function ForOf(){ AST.For.apply(this,arguments) };
	
	subclass$(AST.ForOf,AST.For);
	AST.ForOf.prototype.declare = function (){
		var vars = this.options().vars = {};
		
		var o = vars.source = this.scope().declare('o',this.options().source,{system: true});
		if(this.options().index) {
			var v = vars.value = this.scope().declare(this.options().index,null,{let: true});
		};
		
		if(this.options().own) {
			var i = vars.index = this.scope().declare('i',0,{system: true});
			var keys = vars.keys = this.scope().declare('keys',AST.Util.keys(o.accessor()),{system: true});
			var l = vars.len = this.scope().declare('l',AST.Util.len(keys.accessor()),{system: true});
			var k = vars.key = this.scope().declare(this.options().name,null,{system: true});
		} else {
			// we set the var
			k = vars.key = this.scope().declare(this.options().name,null,{system: true});
		};
		
		// TODO use util - why add references already? Ah -- this is for the highlighting
		if(v && this.options().index) {
			v.addReference(this.options().index);
		};
		if(k && this.options().name) {
			k.addReference(this.options().name);
		};
		
		return this;
	};
	
	AST.ForOf.prototype.js = function (){
		var vars = this.options().vars;
		
		var o = vars.source;
		var k = vars.key;
		var v = vars.value;
		var i = vars.index;
		
		
		if(v) {
			// set value as proxy of object[key]
			if(v.refcount() < 3) {
				v.proxy(o,k);
			} else {
				this.body().unshift(OP('=',v,OP('.',o,k)));
			};
		};
		
		if(this.options().own) {
			
			if(k.refcount() < 3) {// should probably adjust these
				k.proxy(vars.keys,i);
			} else {
				this.body().unshift(OP('=',k,OP('.',vars.keys,i)));
			};
			
			var head = ("for(" + (this.scope().vars().c()) + "; " + (OP('<',i,vars.len).c()) + "; " + (OP('++',i).c()) + ")");
			return head + this.body().c({indent: true,braces: true});// .wrap
		};
		
		var code = this.body().c({braces: true,indent: true});
		// it is really important that this is a treated as a statement
		return [this.scope().vars().c(),("for(var " + (k.c()) + " in " + (o.c()) + ")") + code];
	};
	
	AST.ForOf.prototype.head = function (){
		var v = this.options().vars;
		
		return [
			OP('=',v.key,OP('.',v.keys,v.index)),
			(v.value) && (OP('=',v.value,OP('.',v.source,v.key)))
		];
	};
	
	
	
	
	/* @class Begin */
	AST.Begin = function Begin(body){
		this._nodes = body.block().nodes();
	};
	
	subclass$(AST.Begin,AST.Block);
	
	
	
	AST.Begin.prototype.shouldParenthesize = function (){
		return this.isExpression();// hmmm
	};
	
	
	
	
	/* @class Switch */
	AST.Switch = function Switch(a,b,c){
		this._source = a;
		this._cases = b;
		this._fallback = c;
	};
	
	subclass$(AST.Switch,AST.ControlFlowStatement);
	
	AST.Switch.prototype.__source = {};
	AST.Switch.prototype.source = function(v){ return this._source; }
	AST.Switch.prototype.setSource = function(v){ this._source = v; return this; };
	
	AST.Switch.prototype.__cases = {};
	AST.Switch.prototype.cases = function(v){ return this._cases; }
	AST.Switch.prototype.setCases = function(v){ this._cases = v; return this; };
	
	AST.Switch.prototype.__fallback = {};
	AST.Switch.prototype.fallback = function(v){ return this._fallback; }
	AST.Switch.prototype.setFallback = function(v){ this._fallback = v; return this; };
	
	
	
	
	
	AST.Switch.prototype.visit = function (){
		this.cases().map(function (item){
			return item.traverse();
		});
		if(this.fallback()) {
			this.fallback().visit();
		};
		return (this.source()) && (this.source().visit());
	};
	
	
	AST.Switch.prototype.consume = function (node){
		this._cases = this._cases.map(function (item){
			return item.consume(node);
		});
		if(this._fallback) {
			this._fallback = this._fallback.consume(node);
		};
		return this;
	};
	
	
	AST.Switch.prototype.js = function (){
		var body = [];
		
		for(var i=0, ary=iter$(this.cases()), len=ary.length, part; i < len; i++) {
			part = ary[i];part.autobreak();
			body.push(part);
		};
		
		if(this.fallback()) {
			body.push("default:\n" + this.fallback().c({indent: true}));
		};
		
		return ("switch(" + (this.source().c()) + ") ") + body.c().join("\n").wrap();
	};
	
	
	
	
	/* @class SwitchCase */
	AST.SwitchCase = function SwitchCase(test,body){
		this._test = test;
		this._body = body.block();
	};
	
	subclass$(AST.SwitchCase,AST.ControlFlowStatement);
	
	AST.SwitchCase.prototype.__test = {};
	AST.SwitchCase.prototype.test = function(v){ return this._test; }
	AST.SwitchCase.prototype.setTest = function(v){ this._test = v; return this; };
	
	AST.SwitchCase.prototype.__body = {};
	AST.SwitchCase.prototype.body = function(v){ return this._body; }
	AST.SwitchCase.prototype.setBody = function(v){ this._body = v; return this; };
	
	
	
	
	
	AST.SwitchCase.prototype.visit = function (){
		return this.body().traverse();
	};
	
	
	AST.SwitchCase.prototype.consume = function (node){
		this.body().consume(node);
		return this;
	};
	
	
	AST.SwitchCase.prototype.autobreak = function (){
		if(!((this.body().last() instanceof AST.BreakStatement))) {
			this.body().push(new AST.BreakStatement());
		};
		return this;
	};
	
	
	AST.SwitchCase.prototype.js = function (){
		if(!((this._test instanceof Array))) {
			this._test = [this._test];
		};
		var cases = this._test.map(function (item){
			return "case " + (item.c()) + ":";
		});
		return cases.join("\n") + this.body().c({indent: true});// .indent
	};
	
	
	
	
	/* @class Try */
	AST.Try = function Try(body,c,f){
		this._body = body.block();
		this._catch = c;
		this._finally = f;
	};
	
	subclass$(AST.Try,AST.ControlFlowStatement);
	
	AST.Try.prototype.__body = {};
	AST.Try.prototype.body = function(v){ return this._body; }
	AST.Try.prototype.setBody = function(v){ this._body = v; return this; };
	// prop ncatch
	// prop nfinally
	
	
	
	
	AST.Try.prototype.consume = function (node){
		this._body = this._body.consume(node);
		if(this._catch) {
			this._catch = this._catch.consume(node);
		};
		if(this._finally) {
			this._finally = this._finally.consume(node);
		};
		return this;
	};
	
	
	AST.Try.prototype.visit = function (){
		this._body.traverse();
		if(this._catch) {
			this._catch.traverse();
		};
		return (this._finally) && (this._finally.traverse());
		// no blocks - add an empty catch
	};
	
	
	AST.Try.prototype.js = function (){
		var out = "try " + this.body().c({braces: true,indent: true}) + "\n";
		if(this._catch) {
			out += this._catch.c();
		};
		if(this._finally) {
			out += this._finally.c();
		};
		
		if(!(this._catch || this._finally)) {
			out += "catch(e)\{\}";
		};
		return out;
	};
	
	
	
	
	/* @class Catch */
	AST.Catch = function Catch(body,varname){
		this._body = body.block();
		this._scope = new AST.CatchScope(this);
		this._varname = varname;
	};
	
	subclass$(AST.Catch,AST.ControlFlowStatement);
	
	
	
	AST.Catch.prototype.consume = function (node){
		this._body = this._body.consume(node);
		return this;
	};
	
	
	AST.Catch.prototype.visit = function (){
		this._scope.visit();
		this._variable = this._scope.register(this._varname,this,{type: 'catchvar'});
		return this._body.traverse();
	};
	
	
	AST.Catch.prototype.js = function (){
		return ("catch (" + (this._variable.c()) + ") ") + this._body.c({braces: true,indent: true}) + "\n";
	};
	
	
	
	// repeating myself.. don't deal with it until we move to compact tuple-args
	// for all astnodes
	
	
	/* @class Finally */
	AST.Finally = function Finally(body){
		this._body = body.block();
	};
	
	subclass$(AST.Finally,AST.ControlFlowStatement);
	
	
	
	AST.Finally.prototype.visit = function (){
		return this._body.traverse();
	};
	
	
	AST.Finally.prototype.consume = function (node){
		// swallow silently
		return this;
	};
	
	
	AST.Finally.prototype.js = function (){
		return "finally " + this._body.c({braces: true,indent: true});
	};
	


}())
},{"./helpers":10}],10:[function(require,module,exports){
(function(){


	TERMINAL_COLOR_CODES = {
		bold: 1,
		underline: 4,
		reverse: 7,
		black: 30,
		red: 31,
		green: 32,
		yellow: 33,
		blue: 34,
		magenta: 35,
		cyan: 36,
		white: 37
	};
	
	
	function brace(str){
		var lines = str.match(/\n/);
		// what about indentation?
		
		return (lines) ? (
			'{' + str + '\n}'
		) : (
			'{\n' + str + '\n}'
		);
	}; exports.brace = brace;
	
	
	
	// NEXT extend class is needed for ast
	
		String.prototype.color = function (code){
			var code = TERMINAL_COLOR_CODES[code];
			var resetStr = "\x1B[0m";
			var resetRegex = /\x1B\[0m/g;
			var codeRegex = /\x1B\[\d+m/g;
			var tagRegex = /(<\w+>|<A\d+>)|(<\/\w+>|<A\d+>)/i;
			var numRegex = /\d+/;
			var str = ('' + this).replace(resetRegex,("" + resetStr + "\x1B[" + code + "m"));// allow nesting
			str = ("\x1B[" + code + "m" + str + resetStr);
			return str;
		};
		
		String.prototype.red = function (){
			return this.color('red');
		};
		String.prototype.green = function (){
			return this.color('green');
		};
		String.prototype.yellow = function (){
			return this.color('yellow');
		};
		String.prototype.blue = function (){
			return this.color('blue');
		};
		String.prototype.magenta = function (){
			return this.color('magenta');
		};
		String.prototype.cyan = function (){
			return this.color('cyan');
		};
		String.prototype.white = function (){
			return this.color('white');
		};
		
		String.prototype.pascalCase = function (){
			return this.replace(/(^|[\-\_\s])(\w)/g,function (m,v,l){
				return l.toUpperCase();
			});
		};
		
		String.prototype.camelCase = function (){
			return this.replace(/([\-\_\s])(\w)/g,function (m,v,l){
				return l.toUpperCase();
			});
		};
		
		String.prototype.snakeCase = function (){
			var str = this.replace(/([\-\s])(\w)/g,'_');
			return str.replace(/()([A-Z])/g,"_$1",function (m,v,l){
				return l.toUpperCase();
			});
		};
		
		String.prototype.toSymbol = function (){
			var sym = this.replace(/(.+)\=$/,"set-$1");
			sym = sym.replace(/(.+)\?$/,"is-$1");
			return sym.replace(/([\-\s])(\w)/g,function (m,v,l){
				return l.toUpperCase();
			});
		};
		
		String.prototype.toSetter = function (){
			return ("set-" + this).camelCase();
		};
		
		String.prototype.brackets = function (){
			return '{' + this.toString() + '}';
		};
		
		String.prototype.wrap = function (typ){
			return '{' + "\n" + this.indent() + "\n" + '}';
		};
		
		String.prototype.indent = function (){
			// hmm
			return this.replace(/^/g,"\t").replace(/\n/g,"\n\t").replace(/\n\t$/g,"\n");
		};
		
		String.prototype.c = function (){
			return "" + this;
		};
		
		// def value
		// 	self
		
		String.prototype.quoted = function (){
			return '"' + this + '"';
		};
		
		String.prototype.parenthesize = function (){
			return '(' + this + ')';
		};
		
		
		String.prototype.identifier = function (){
			return new AST.Identifier(this);
		};
		
		String.prototype.traverse = function (){
			// p "string should not be traversed".red
			return this;
		};
		
		String.prototype.region = function (){
			return this._region;
		};
		
		String.prototype.loc = function (){
			return this._region;
		};
		
		String.prototype.toAST = function (deep){
			if(deep === undefined) deep = false;
			return new AST.Str(JSON.stringify(this));
		};
		
		String.prototype.node = function (){
			return this;
		};
	
	
	// Extensions to make compiler more compact etc
	
		
		Array.prototype.flatten = function (){
			var a = [];
			this.forEach(function (v){
				return (v instanceof Array) ? (a.push.apply(a,v.flatten())) : (a.push(v));
			});
			return a;
		};
		
		// def inspect
		// 	map do |v| v && v:inspect ? v.inspect : v
		
		Array.prototype.compact = function (){
			return this.filter(function (v){
				return v != undefined && v != null;
			});
		};
		
		Array.prototype.unique = function (){
			var a = [];
			this.forEach(function (v){
				return (a.indexOf(v) == -1) && (a.push(v));
			});
			return a;
		};
		
		Array.prototype.last = function (){
			return this[this.length - 1];
		};
		
		Array.prototype.c = function (){
			return this.map(function (v){
				return v.c();
			});
		};
		
		Array.prototype.indent = function (){
			return this.c().join("\n");
		};
		
		Array.prototype.dump = function (key){
			return this.map(function (v){
				return (v && v.dump) ? (v.dump(key)) : (v);
			});
		};
		
		Array.prototype.block = function (){
			return AST.Block.wrap(this);
		};
		
		Array.prototype.count = function (){
			return this.length;
		};
		
		Array.prototype.toAST = function (deep){
			if(deep === undefined) deep = false;
			var items = this;
			if(deep) {
				items = this.map(function (v){
					return (v.toAST) ? (v.toAST(deep)) : (v);
				});
			};
			return new AST.Arr(items);
		};
	
	
	
		
		Number.prototype.traverse = function (){
			return this.p("string should not be traversed".red());
		};
		
		Number.prototype.c = function (){
			return "" + this;
		};
		
		Number.prototype.toAST = function (){
			return new AST.Num(this);
		};
		
		Number.prototype.loc = function (){
			return this._region || [0,0];
		};
	


}())
},{}],11:[function(require,module,exports){
(function (global){
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
	
	/* @class Identifier */
	AST.Identifier = function Identifier(){ AST.ValueNode.apply(this,arguments) };
	
	subclass$(AST.Identifier,AST.ValueNode);
	
	AST.Identifier.prototype.__safechain = {};
	AST.Identifier.prototype.safechain = function(v){ return this._safechain; }
	AST.Identifier.prototype.setSafechain = function(v){ this._safechain = v; return this; };
	
	AST.Identifier.prototype.region = function (){
		return this.value()._region;
	};
	
	AST.Identifier.prototype.load = function (v){
		var val = ((v instanceof AST.Identifier) ? (v.value()) : (v));
		var len = val.length;
		// experimental way to include reserved-info
		// if v.match()
		if(val[len - 1] == '?') {
			// p "safechain identifier?!"
			this.setSafechain(true);
			val = val.substr(0,len - 1);
		};
		
		return val;
	};
	
	AST.Identifier.prototype.isValidIdentifier = function (){
		return true;
	};
	
	AST.Identifier.prototype.isReserved = function (){
		return this.value().reserved;
	};
	
	AST.Identifier.prototype.symbol = function (){
		return this._symbol || (this._symbol = this.value().c().toSymbol());
	};
	
	AST.Identifier.prototype.setter = function (){
		return this._setter || (this._setter = new AST.Identifier(("set-" + (this.value().c()))));
	};
	
	AST.Identifier.prototype.toSymbol = function (){
		return this.symbol();
	};
	
	AST.Identifier.prototype.toSetter = function (){
		return new AST.Symbol(("" + (this.value().c()) + "="));
	};
	
	AST.Identifier.prototype.js = function (){
		return this.symbol();
	};
	
	AST.Identifier.prototype.dump = function (){
		return {loc: this.region(),value: this.value()};
	};
	
	
	
	
	/* @class TagId */
	AST.TagId = function TagId(){ AST.Identifier.apply(this,arguments) };
	
	subclass$(AST.TagId,AST.Identifier);
	AST.TagId.prototype.js = function (){
		return "id$('" + (this.value().c()) + "')";
	};
	
	
	// This is not an identifier - it is really a string
	// Is this not a literal?
	
	// FIXME Rename to IvarLiteral? or simply Literal with type Ivar
	/* @class Ivar */
	AST.Ivar = function Ivar(){ AST.Identifier.apply(this,arguments) };
	
	subclass$(AST.Ivar,AST.Identifier);
	AST.Ivar.prototype.name = function (){
		return this.value().c().camelCase().replace(/^@/,'');
	};
	// the @ should possibly be gone from the start?
	AST.Ivar.prototype.js = function (){
		return this.value().c().camelCase().replace(/^@/,'_');
	};
	
	
	// Ambiguous - We need to be consistent about Const vs ConstAccess
	// Becomes more important when we implement typeinference and code-analysis
	/* @class Const */
	AST.Const = function Const(){ AST.Identifier.apply(this,arguments) };
	
	subclass$(AST.Const,AST.Identifier);
	
	
	
	/* @class TagTypeIdentifier */
	AST.TagTypeIdentifier = function TagTypeIdentifier(){ AST.Identifier.apply(this,arguments) };
	
	subclass$(AST.TagTypeIdentifier,AST.Identifier);
	
	AST.TagTypeIdentifier.prototype.__name = {};
	AST.TagTypeIdentifier.prototype.name = function(v){ return this._name; }
	AST.TagTypeIdentifier.prototype.setName = function(v){ this._name = v; return this; };
	
	AST.TagTypeIdentifier.prototype.__ns = {};
	AST.TagTypeIdentifier.prototype.ns = function(v){ return this._ns; }
	AST.TagTypeIdentifier.prototype.setNs = function(v){ this._ns = v; return this; };
	
	AST.TagTypeIdentifier.prototype.load = function (val){
		var parts = val.split(":");
		this._raw = val;
		this._name = parts.pop();
		this._ns = parts.shift();// if any?
		return val.toLowerCase();
	};
	
	AST.TagTypeIdentifier.prototype.js = function (){
		// p "tagtypeidentifier.js {self}"
		return ("IMBA_TAGS." + (this._raw.replace(":","$")));
	};
	
	AST.TagTypeIdentifier.prototype.func = function (){
		var name = this._name.replace(/-/g,'_').replace(/\#/,'');// hmm
		if(this._ns) {
			name += ("$" + (this._ns.toLowerCase()));
		};
		return name;
	};
	
	AST.TagTypeIdentifier.prototype.id = function (){
		var m = this._raw.match(/\#([\w\-\d\_]+)\b/);
		return (m) ? (m[1]) : (null);
	};
	
	
	AST.TagTypeIdentifier.prototype.flag = function (){
		return "_" + this.name().replace(/--/g,'_').toLowerCase();
	};
	
	AST.TagTypeIdentifier.prototype.sel = function (){
		return "." + this.flag();// + name.replace(/-/g,'_').toLowerCase
	};
	
	AST.TagTypeIdentifier.prototype.string = function (){
		return this.value();
	};
	
	
	
	/* @class Argvar */
	AST.Argvar = function Argvar(){ AST.ValueNode.apply(this,arguments) };
	
	subclass$(AST.Argvar,AST.ValueNode);
	AST.Argvar.prototype.c = function (){
		// NEXT -- global.parseInt or Number.parseInt (better)
		var v = global.parseInt(this.value());
		
		// FIXME Not needed anymore? I think the lexer handles this
		if(v == 0) {
			return "arguments";
		};
		
		var s = this.scope__();
		// params need to go up to the closeste method-scope
		var par = s.params().at(this.value() - 1,true);
		return "" + (par.name().c());
	};
	


}())
}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],12:[function(require,module,exports){
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
	function iter$(a){ return a ? (a.toArray ? a.toArray() : a) : []; };
	/* @class ImportStatement */
	AST.ImportStatement = function ImportStatement(imports,source,ns){
		this._imports = imports;
		this._source = source;
		this._ns = ns;
		this;
	};
	
	subclass$(AST.ImportStatement,AST.Statement);
	
	AST.ImportStatement.prototype.__ns = {};
	AST.ImportStatement.prototype.ns = function(v){ return this._ns; }
	AST.ImportStatement.prototype.setNs = function(v){ this._ns = v; return this; };
	
	AST.ImportStatement.prototype.__imports = {};
	AST.ImportStatement.prototype.imports = function(v){ return this._imports; }
	AST.ImportStatement.prototype.setImports = function(v){ this._imports = v; return this; };
	
	AST.ImportStatement.prototype.__source = {};
	AST.ImportStatement.prototype.source = function(v){ return this._source; }
	AST.ImportStatement.prototype.setSource = function(v){ this._source = v; return this; };
	
	
	
	
	
	AST.ImportStatement.prototype.visit = function (){
		if(this._ns) {
			this._nsvar || (this._nsvar = this.scope__().register(this._ns,this));
		};
		return this;
	};
	
	
	AST.ImportStatement.prototype.js = function (){
		var req = CALL(new AST.Identifier("require"),[this.source()]);
		
		if(this._ns) {
			// must register ns as a real variable
			return ("var " + (this._nsvar.c()) + " = " + (req.c()));
		} else {
			if(this._imports) {
				
				// create a require for the source, with a temporary name?
				var out = [req.cache().c()];
				
				for(var i=0, ary=iter$(this._imports), len=ary.length, imp; i < len; i++) {
					// we also need to register these imports as variables, no?
					imp = ary[i];var o = OP('=',imp,OP('.',req,imp));
					out.push(("var " + (o.c())));
				};
				
				return out;
			} else {
				return req.c();
			}
		};
	};
	
	
	
	AST.ImportStatement.prototype.consume = function (node){
		return this;
	};
	


}())
},{}],13:[function(require,module,exports){
(function(){


	require('./ast');
	
	module.exports.AST = AST;
	


}())
},{"./ast":3}],14:[function(require,module,exports){
(function (global){
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
	function iter$(a){ return a ? (a.toArray ? a.toArray() : a) : []; };
	// Literals should probably not inherit from the same parent
	// as arrays, tuples, objects would be better off inheriting
	// from listnode.
	
	/* @class Literal */
	AST.Literal = function Literal(){ AST.ValueNode.apply(this,arguments) };
	
	subclass$(AST.Literal,AST.ValueNode);
	AST.Literal.prototype.toString = function (){
		return "" + this.value();
	};
	
	AST.Literal.prototype.hasSideEffects = function (){
		return false;
	};
	
	
	
	/* @class Bool */
	AST.Bool = function Bool(){ AST.Literal.apply(this,arguments) };
	
	subclass$(AST.Bool,AST.Literal);
	AST.Bool.prototype.cache = function (){
		return this;
	};
	
	AST.Bool.prototype.truthy = function (){
		// p "bool is truthy? {value}"
		return this.value() == "true";
		// yes
	};
	
	
	/* @class True */
	AST.True = function True(){ AST.Bool.apply(this,arguments) };
	
	subclass$(AST.True,AST.Bool);
	AST.True.prototype.raw = function (){
		return true;
	};
	
	
	/* @class False */
	AST.False = function False(){ AST.Bool.apply(this,arguments) };
	
	subclass$(AST.False,AST.Bool);
	AST.False.prototype.raw = function (){
		return false;
	};
	
	
	/* @class Num */
	AST.Num = function Num(){ AST.Literal.apply(this,arguments) };
	
	subclass$(AST.Num,AST.Literal);
	AST.Num.prototype.toString = function (){
		return "" + this.value();
	};
	
	AST.Num.prototype.shouldParenthesize = function (){
		return this.up() instanceof AST.Access;
	};
	
	// def cache
	// 	p "cache num"
	// 	self
	
	AST.Num.prototype.raw = function (){
		return JSON.parse(this.value());
	};
	
	
	// should be quoted no?
	// what about strings in object-literals?
	// we want to be able to see if the values are allowed
	/* @class Str */
	AST.Str = function Str(){ AST.Literal.apply(this,arguments) };
	
	subclass$(AST.Str,AST.Literal);
	AST.Str.prototype.raw = function (){
		// JSON.parse requires double-quoted strings,
		// while eval also allows single quotes. 
		// NEXT eval is not accessible like this
		// WARNING TODO be careful! - should clean up
		return this._raw || (this._raw = global.eval(this.value()));// incredibly stupid solution
	};
	
	AST.Str.prototype.isValidIdentifier = function (){
		// there are also some values we cannot use
		return (this.raw().match(/^[a-zA-Z\$\_]+[\d\w\$\_]*$/)) ? (true) : (false);
	};
	
	
	
	// Currently not used - it would be better to use this
	// for real interpolated strings though, than to break
	// them up into their parts before parsing
	/* @class InterpolatedString */
	AST.InterpolatedString = function InterpolatedString(){ AST.ListNode.apply(this,arguments) };
	
	subclass$(AST.InterpolatedString,AST.ListNode);
	AST.InterpolatedString.prototype.js = function (){
		return "interpolated string";
	};
	
	
	
	/* @class Tuple */
	AST.Tuple = function Tuple(){ AST.ListNode.apply(this,arguments) };
	
	subclass$(AST.Tuple,AST.ListNode);
	AST.Tuple.prototype.c = function (){
		// compiles as an array
		return new AST.Arr(this.nodes()).c();
	};
	
	AST.Tuple.prototype.hasSplat = function (){
		return this.filter(function (v){
			return v instanceof AST.Splat;
		})[0];
	};
	
	AST.Tuple.prototype.consume = function (node){
		if(this.count() == 1) {
			return this.first().consume(node);
		} else {
			throw "multituple cannot consume";
		};
	};
	
	
	
	// Because we've dropped the Str-wrapper it is kinda difficult
	/* @class Symbol */
	AST.Symbol = function Symbol(){ AST.Literal.apply(this,arguments) };
	
	subclass$(AST.Symbol,AST.Literal);
	AST.Symbol.prototype.isValidIdentifier = function (){
		return (this.raw().match(/^[a-zA-Z\$\_]+[\d\w\$\_]*$/)) ? (true) : (false);
	};
	
	AST.Symbol.prototype.raw = function (){
		return this._raw || (this._raw = this.value().c().toSymbol());
	};
	
	AST.Symbol.prototype.js = function (){
		return "'" + (this.value().c().toSymbol()) + "'";
	};
	
	
	/* @class RegExp */
	AST.RegExp = function RegExp(){ AST.Literal.apply(this,arguments) };
	
	subclass$(AST.RegExp,AST.Literal);
	
	
	// Should inherit from ListNode - would simplify
	/* @class Arr */
	AST.Arr = function Arr(){ AST.Literal.apply(this,arguments) };
	
	subclass$(AST.Arr,AST.Literal);
	AST.Arr.prototype.load = function (value){
		return (value instanceof Array) ? (new AST.ArgList(value)) : (value);
	};
	
	AST.Arr.prototype.push = function (item){
		this.value().push(item);
		return this;
	};
	
	AST.Arr.prototype.count = function (){
		return this.value().length;
	};
	
	AST.Arr.prototype.nodes = function (){
		return this.value();
	};
	
	AST.Arr.prototype.splat = function (){
		return this.value().some(function (v){
			return v instanceof AST.Splat;
		});
	};
	
	AST.Arr.prototype.visit = function (){
		if(this._value) {
			this._value.traverse();
		};
		// for v in value
		// 	v.traverse
		return this;
	};
	
	AST.Arr.prototype.js = function (){
		var slices, group;
		var splat = this.value().some(function (v){
			return v instanceof AST.Splat;
		});
		
		return (splat) ? (
			"SPLATTED ARRAY!",
			// if we know for certain that the splats are arrays we can drop the slice?
			slices = [],
			group = null,
			this.value().forEach(function (v){
				return (v instanceof AST.Splat) ? (
					slices.push(v),
					group = null
				) : (
					(!group) && (slices.push(group = new AST.Arr([]))),
					group.push(v)
				);
			}),
			
			("[].concat(" + (slices.c().join(", ")) + ")")
		) : (
			// very temporary. need a more generic way to prettify code
			// should depend on the length of the inner items etc
			// if @indented or option(:indent) or value.@indented
			// "[\n{value.c.join(",\n").indent}\n]"
			// else
			("[" + (this.value().c()) + "]")
		);
	};
	
	// def indented
	// 	var o = @options ||= {}
	// 	o:indent = yes
	// 	self
	
	AST.Arr.prototype.hasSideEffects = function (){
		return this.value().some(function (v){
			return v.hasSideEffects();
		});
	};
	
	AST.Arr.prototype.toString = function (){
		return "Arr";
	};
	
	
	AST.Arr.wrap = function (val){
		return new AST.Arr(val);
	};
	
	
	// should not be cklassified as a literal?
	/* @class Obj */
	AST.Obj = function Obj(){ AST.Literal.apply(this,arguments) };
	
	subclass$(AST.Obj,AST.Literal);
	AST.Obj.prototype.load = function (value){
		return (value instanceof Array) ? (new AST.AssignList(value)) : (value);
	};
	
	AST.Obj.prototype.visit = function (){
		if(this._value) {
			this._value.traverse();
		};
		// for v in value
		// 	v.traverse
		return this;
	};
	
	AST.Obj.prototype.js = function (){
		var dyn = this.value().filter(function (v){
			return (v instanceof AST.ObjAttr) && (v.key() instanceof AST.Op);
		});
		
		if(dyn.length > 0) {
			var idx = this.value().indexOf(dyn[0]);
			// p "dynamic keys! {dyn}"
			// create a temp variable
			
			var tmp = this.scope__().temporary(this);
			// set the temporary object to the same
			var first = this.value().slice(0,idx);
			var obj = new AST.Obj(first);
			var ast = [OP('=',tmp,obj)];
			
			this.value().slice(idx).forEach(function (atr){
				return ast.push(OP('=',OP('.',tmp,atr.key()),atr.value()));
			});
			ast.push(tmp);// access the tmp at in the last part
			return new AST.Parens(ast).c();
		};
		
		
		// var body = value.map do |v|
		// 	var out = v.c
		// 	out = '\n' + out if v.@pbr # hmmm 
		// 	out
		
		// if @indented
		// 	# should be more generalized?
		// 	body = '\n' + body.join(',').indent + '\n' # hmmm
		// else
		// 	body.join(',')
		
		// for objects with expression-keys we need to think differently
		return '{' + this.value().c() + '}';
	};
	
	AST.Obj.prototype.add = function (k,v){
		var kv = new AST.ObjAttr(k,v);
		this.value().push(kv);
		return kv;
	};
	
	AST.Obj.prototype.hash = function (){
		var hash = {};
		for(var i=0, ary=iter$(this.value()), len=ary.length, k; i < len; i++) {
			k = ary[i];if(k instanceof AST.ObjAttr) {
				hash[k.key().symbol()] = k.value();
			};
		};
		return hash;
		// return k if k.key.symbol == key
	};
	
	// add method for finding properties etc?
	AST.Obj.prototype.key = function (key){
		for(var i=0, ary=iter$(this.value()), len=ary.length, k; i < len; i++) {
			k = ary[i];if((k instanceof AST.ObjAttr) && k.key().symbol() == key) {
				return k;
			};
		};
		return null;
	};
	
	AST.Obj.prototype.indented = function (a,b){
		this._value.indented(a,b);
		return this;
	};
	
	AST.Obj.prototype.hasSideEffects = function (){
		return this.value().some(function (v){
			return v.hasSideEffects();
		});
	};
	
	// for converting a real object into an ast-representation
	AST.Obj.wrap = function (obj){
		var attrs = [];
		for(var o=obj, v, i=0, keys=Object.keys(o), l=keys.length; i < l; i++){
			v = o[keys[i]];if(v instanceof Array) {
				v = AST.Arr.wrap(v);
			} else {
				if(v.constructor == Object) {
					v = AST.Obj.wrap(v);
				}
			};
			attrs.push(new AST.ObjAttr(keys[i],v));
		};
		return new AST.Obj(attrs);
	};
	
	AST.Obj.prototype.toString = function (){
		return "Obj";
	};
	
	
	/* @class ObjAttr */
	AST.ObjAttr = function ObjAttr(key,value){
		this._key = key;
		this._value = value;
		this._dynamic = (key instanceof AST.Op);
	};
	
	subclass$(AST.ObjAttr,AST.Node);
	
	AST.ObjAttr.prototype.__key = {};
	AST.ObjAttr.prototype.key = function(v){ return this._key; }
	AST.ObjAttr.prototype.setKey = function(v){ this._key = v; return this; };
	
	AST.ObjAttr.prototype.__value = {};
	AST.ObjAttr.prototype.value = function(v){ return this._value; }
	AST.ObjAttr.prototype.setValue = function(v){ this._value = v; return this; };
	
	AST.ObjAttr.prototype.__options = {};
	AST.ObjAttr.prototype.options = function(v){ return this._options; }
	AST.ObjAttr.prototype.setOptions = function(v){ this._options = v; return this; };
	
	
	
	AST.ObjAttr.prototype.visit = function (){
		// should probably traverse key as well, unless it is a dead simple identifier
		this.key().traverse();
		return this.value().traverse();
	};
	
	AST.ObjAttr.prototype.js = function (){
		return "" + (this.key().c()) + ": " + (this.value().c());
	};
	
	AST.ObjAttr.prototype.hasSideEffects = function (){
		return true;
	};
	
	
	
	
	/* @class ArgsReference */
	AST.ArgsReference = function ArgsReference(){ AST.Node.apply(this,arguments) };
	
	subclass$(AST.ArgsReference,AST.Node);
	AST.ArgsReference.prototype.c = function (){
		return "arguments";
	};
	
	
	// should be a separate Context or something
	/* @class Self */
	AST.Self = function Self(scope){
		this._scope = scope;
	};
	
	subclass$(AST.Self,AST.Literal);
	
	AST.Self.prototype.__scope = {};
	AST.Self.prototype.scope = function(v){ return this._scope; }
	AST.Self.prototype.setScope = function(v){ this._scope = v; return this; };
	
	
	
	AST.Self.prototype.cache = function (){
		return this;
	};
	
	AST.Self.prototype.reference = function (){
		return this;
	};
	
	AST.Self.prototype.c = function (){
		var s = this.scope__();
		return (s) ? (s.context().c()) : ("this");
	};
	
	
	/* @class ImplicitSelf */
	AST.ImplicitSelf = function ImplicitSelf(){ AST.Self.apply(this,arguments) };
	
	subclass$(AST.ImplicitSelf,AST.Self);
	
	
	/* @class This */
	AST.This = function This(){ AST.Self.apply(this,arguments) };
	
	subclass$(AST.This,AST.Self);
	AST.This.prototype.cache = function (){
		return this;
	};
	
	AST.This.prototype.reference = function (){
		// p "referencing this"
		return this;
	};
	
	AST.This.prototype.c = function (){
		return "this";
	};
	


}())
}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],15:[function(require,module,exports){
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
		} else {
			if(this.left()) {
				out = ("" + op + (this.left().c()));
			}
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
		} else {
			if(this.op() == '∩') {
				return this.util().intersect(this.left(),this.right()).c();
			}
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
},{}],16:[function(require,module,exports){
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
	function iter$(a){ return a ? (a.toArray ? a.toArray() : a) : []; };
	/* @class Param */
	AST.Param = function Param(name,defaults,typ){
		// could have introduced bugs by moving back to identifier here
		this._name = name;// .value # this is an identifier(!)
		this._defaults = defaults;
		this._typ = typ;
		this._variable = null;
	};
	
	subclass$(AST.Param,AST.Node);
	
	AST.Param.prototype.__name = {};
	AST.Param.prototype.name = function(v){ return this._name; }
	AST.Param.prototype.setName = function(v){ this._name = v; return this; };
	
	AST.Param.prototype.__index = {};
	AST.Param.prototype.index = function(v){ return this._index; }
	AST.Param.prototype.setIndex = function(v){ this._index = v; return this; };
	
	AST.Param.prototype.__defaults = {};
	AST.Param.prototype.defaults = function(v){ return this._defaults; }
	AST.Param.prototype.setDefaults = function(v){ this._defaults = v; return this; };
	
	AST.Param.prototype.__splat = {};
	AST.Param.prototype.splat = function(v){ return this._splat; }
	AST.Param.prototype.setSplat = function(v){ this._splat = v; return this; };
	
	AST.Param.prototype.__variable = {};
	AST.Param.prototype.variable = function(v){ return this._variable; }
	AST.Param.prototype.setVariable = function(v){ this._variable = v; return this; };
	
	// what about object-params?
	
	
	
	AST.Param.prototype.js = function (){
		// hmmz
		if(this._variable) {
			return this._variable.c();
		};
		
		return (this.defaults()) && (
			("if(" + (this.name().c()) + " == null) " + (this.name().c()) + " = " + (this.defaults().c()))
		);
		// see if this is the initial declarator?
	};
	
	AST.Param.prototype.visit = function (){
		// p "VISIT PARAM {name}!"
		// ary.[-1] # possible
		// ary.(-1) # possible
		// str(/ok/,-1)
		// scope.register(@name,self)
		// BUG The defaults should probably be looked up like vars
		var variable_, v_;
		if(this._defaults) {
			this._defaults.traverse();
		};
		(variable_=this.variable()) || ((this.setVariable(v_=this.scope__().register(this.name(),this)),v_));
		return this;
	};
	
	AST.Param.prototype.assignment = function (){
		return OP('=',this.variable().accessor(),this.defaults());
	};
	
	AST.Param.prototype.isExpressable = function (){
		return !this.defaults() || this.defaults().isExpressable();
		// p "visiting param!!!"
	};
	
	AST.Param.prototype.dump = function (){
		return {loc: this.loc()};
	};
	
	AST.Param.prototype.loc = function (){
		return this._name && this._name.region();
	};
	
	
	
	/* @class SplatParam */
	AST.SplatParam = function SplatParam(){ AST.Param.apply(this,arguments) };
	
	subclass$(AST.SplatParam,AST.Param);
	AST.SplatParam.prototype.loc = function (){
		// hacky.. cannot know for sure that this is right?
		var r = this.name().region();
		return [r[0] - 1,r[1]];
	};
	
	
	/* @class BlockParam */
	AST.BlockParam = function BlockParam(){ AST.Param.apply(this,arguments) };
	
	subclass$(AST.BlockParam,AST.Param);
	AST.BlockParam.prototype.c = function (){
		return "blockparam";
	};
	
	AST.BlockParam.prototype.loc = function (){
		// hacky.. cannot know for sure that this is right?
		var r = this.name().region();
		return [r[0] - 1,r[1]];
	};
	
	
	
	/* @class OptionalParam */
	AST.OptionalParam = function OptionalParam(){ AST.Param.apply(this,arguments) };
	
	subclass$(AST.OptionalParam,AST.Param);
	
	
	/* @class NamedParam */
	AST.NamedParam = function NamedParam(){ AST.Param.apply(this,arguments) };
	
	subclass$(AST.NamedParam,AST.Param);
	
	
	
	
	/* @class RequiredParam */
	AST.RequiredParam = function RequiredParam(){ AST.Param.apply(this,arguments) };
	
	subclass$(AST.RequiredParam,AST.Param);
	
	
	
	/* @class NamedParams */
	AST.NamedParams = function NamedParams(){ AST.ListNode.apply(this,arguments) };
	
	subclass$(AST.NamedParams,AST.ListNode);
	
	AST.NamedParams.prototype.__index = {};
	AST.NamedParams.prototype.index = function(v){ return this._index; }
	AST.NamedParams.prototype.setIndex = function(v){ this._index = v; return this; };
	
	AST.NamedParams.prototype.__variable = {};
	AST.NamedParams.prototype.variable = function(v){ return this._variable; }
	AST.NamedParams.prototype.setVariable = function(v){ this._variable = v; return this; };
	
	AST.NamedParams.prototype.load = function (list){
		var load = (function (k){
			return new AST.NamedParam(k.key(),k.value());
		});
		return (list instanceof AST.Obj) ? (list.value().map(load)) : (list);
	};
	
	AST.NamedParams.prototype.visit = function (){
		var s = this.scope__();
		this._variable || (this._variable = s.temporary(this,{type: 'keypars'}));
		this._variable.predeclared();
		
		// this is a listnode, which will automatically traverse
		// and visit all children
		AST.NamedParams.__super__.visit.apply(this,arguments);
		// register the inner variables as well(!)
		return this;
	};
	
	AST.NamedParams.prototype.name = function (){
		return this.variable().c();
	};
	
	AST.NamedParams.prototype.js = function (){
		return "namedpar";
	};
	
	
	/* @class IndexedParam */
	AST.IndexedParam = function IndexedParam(){ AST.Param.apply(this,arguments) };
	
	subclass$(AST.IndexedParam,AST.Param);
	
	AST.IndexedParam.prototype.__parent = {};
	AST.IndexedParam.prototype.parent = function(v){ return this._parent; }
	AST.IndexedParam.prototype.setParent = function(v){ this._parent = v; return this; };
	
	AST.IndexedParam.prototype.__subindex = {};
	AST.IndexedParam.prototype.subindex = function(v){ return this._subindex; }
	AST.IndexedParam.prototype.setSubindex = function(v){ this._subindex = v; return this; };
	
	AST.IndexedParam.prototype.visit = function (){
		// p "VISIT PARAM {name}!"
		// ary.[-1] # possible
		// ary.(-1) # possible
		// str(/ok/,-1)
		// scope.register(@name,self)
		// BUG The defaults should probably be looked up like vars
		var variable_, v_;
		(variable_=this.variable()) || ((this.setVariable(v_=this.scope__().register(this.name(),this)),v_));
		this.variable().proxy(this.parent().variable(),this.subindex());
		return this;
	};
	
	
	
	/* @class ArrayParams */
	AST.ArrayParams = function ArrayParams(){ AST.ListNode.apply(this,arguments) };
	
	subclass$(AST.ArrayParams,AST.ListNode);
	
	AST.ArrayParams.prototype.__index = {};
	AST.ArrayParams.prototype.index = function(v){ return this._index; }
	AST.ArrayParams.prototype.setIndex = function(v){ this._index = v; return this; };
	
	AST.ArrayParams.prototype.__variable = {};
	AST.ArrayParams.prototype.variable = function(v){ return this._variable; }
	AST.ArrayParams.prototype.setVariable = function(v){ this._variable = v; return this; };
	
	AST.ArrayParams.prototype.visit = function (){
		var s = this.scope__();
		this._variable || (this._variable = s.temporary(this,{type: 'keypars'}));
		this._variable.predeclared();
		
		// now when we loop through these inner params - we create the pars
		// with the correct name, but bind them to the parent
		return AST.ArrayParams.__super__.visit.apply(this,arguments);
	};
	
	AST.ArrayParams.prototype.name = function (){
		return this.variable().c();
	};
	
	AST.ArrayParams.prototype.load = function (list){
		var self=this;
		if(!((list instanceof AST.Arr))) {
			return null;
		};
		// p "loading arrayparams"
		// try the basic first
		return (!(list.splat())) && (
			list.value().map(function (v,i){
				// must make sure the params are supported here
				// should really not parse any array at all(!)
				var name = v;
				if(v instanceof AST.VarOrAccess) {
					// p "varoraccess {v.value}"
					name = v.value().value();
					// this is accepted
				};
				return self.parse(name,v,i);
			})
		);
	};
	
	AST.ArrayParams.prototype.parse = function (name,child,i){
		var param = new AST.IndexedParam(name,null);
		
		param.setParent(this);
		param.setSubindex(i);
		return param;
	};
	
	AST.ArrayParams.prototype.head = function (ast){
		// "arrayparams"
		return this;
	};
	
	
	/* @class ParamList */
	AST.ParamList = function ParamList(){ AST.ListNode.apply(this,arguments) };
	
	subclass$(AST.ParamList,AST.ListNode);
	
	AST.ParamList.prototype.__splat = {};
	AST.ParamList.prototype.splat = function(v){ return this._splat; }
	AST.ParamList.prototype.setSplat = function(v){ this._splat = v; return this; };
	
	AST.ParamList.prototype.__block = {};
	AST.ParamList.prototype.block = function(v){ return this._block; }
	AST.ParamList.prototype.setBlock = function(v){ this._block = v; return this; };
	
	AST.ParamList.prototype.at = function (index,force,name){
		if(force === undefined) force = false;
		if(name === undefined) name = null;
		if(force) {
			while(this.count() <= index){
				this.add(new AST.Param(this.count() == index && name || ("_" + this.count())));
			};
			// need to visit at the same time, no?
		};
		return this.list()[index];
	};
	
	AST.ParamList.prototype.visit = function (){
		this._splat = this.filter(function (par){
			return par instanceof AST.SplatParam;
		})[0];
		var blk = this.filter(AST.BlockParam);
		
		if(blk.count() > 1) {
			blk[1].warn("a method can only have one &block parameter");
		} else {
			if(blk[0] && blk[0] != this.last()) {
				blk[0].warn("&block must be the last parameter of a method");
				// warn "&block must be the last parameter of a method", blk[0]
			}
		};
		
		// add more warnings later(!)
		// should probably throw error as well to stop compilation
		
		// need to register the required-pars as variables
		return AST.ParamList.__super__.visit.apply(this,arguments);
	};
	
	AST.ParamList.prototype.js = function (o){
		if(this.count() == 0) {
			return AST.EMPTY;
		};
		if(o.parent() instanceof AST.Block) {
			return this.head(o);
		};
		
		// items = map(|arg| arg.name.c ).compact
		// return null unless items[0]
		
		if(o.parent() instanceof AST.Code) {
			// remove the splat, for sure.. need to handle the other items as well
			// this is messy with references to argvars etc etc. Fix
			var pars = this.nodes();
			// pars = filter(|arg| arg != @splat && !(arg isa AST.BlockParam)) if @splat
			if(this._splat) {
				pars = this.filter(function (arg){
					return (arg instanceof AST.RequiredParam) || (arg instanceof AST.OptionalParam);
				});
			};
			return pars.map(function (arg){
				return arg.name().c();
			}).compact().join(",");
		} else {
			throw "not implemented paramlist js";
			return "ta" + this.map(function (arg){
				return arg.c();
			}).compact().join(",");
		};
	};
	
	AST.ParamList.prototype.head = function (o){
		var reg = [];
		var opt = [];
		var blk = null;
		var splat = null;
		var named = null;
		var arys = [];
		var signature = [];
		var idx = 0;
		
		this.nodes().forEach(function (par,i){
			par.setIndex(idx);
			if(par instanceof AST.NamedParams) {
				signature.push('named');
				named = par;
			} else {
				if(par instanceof AST.OptionalParam) {
					signature.push('opt');
					opt.push(par);
				} else {
					if(par instanceof AST.BlockParam) {
						signature.push('blk');
						blk = par;
					} else {
						if(par instanceof AST.SplatParam) {
							signature.push('splat');
							splat = par;
							idx -= 1;// this should really be removed from the list, no?
						} else {
							if(par instanceof AST.ArrayParams) {
								arys.push(par);
								signature.push('ary');
							} else {
								signature.push('reg');
								reg.push(par);
							}
						}
					}
				}
			};
			return idx++;
		});
		
		if(named) {
			var namedvar = named.variable();
		};
		
		// var opt = nodes.filter(|n| n isa AST.OptionalParam)
		// var blk = nodes.filter(|n| n isa AST.BlockParam)[0]
		// var splat = nodes.filter(|n| n isa AST.SplatParam)[0]
		
		// simple situation where we simply switch
		// can probably optimize by not looking at arguments at all
		var ast = [];
		var isFunc = function (js){
			return "typeof " + js + " == 'function'";
		};
		
		// This is broken when dealing with iframes anc XSS scripting
		// but for now it is the best test for actual arguments
		// can also do constructor.name == 'Object'
		var isObj = function (js){
			return "" + js + ".constructor === Object";
		};
		var isntObj = function (js){
			return "" + js + ".constructor !== Object";
		};
		// should handle some common cases in a cleaner (less verbose) manner
		// does this work with default params after optional ones? Is that even worth anything?
		// this only works in one direction now, unlike TupleAssign
		
		// we dont really check the length etc now -- so it is buggy for lots of arguments
		
		// if we have optional params in the regular order etc we can go the easy route
		// slightly hacky now. Should refactor all of these to use the signature?
		if(!named && !splat && !blk && opt.count() > 0 && signature.join(" ").match(/opt$/)) {
			for(var i=0, ary=iter$(opt), len_=ary.length, par; i < len_; i++) {
				par = ary[i];ast.push(("if(" + (par.name().c()) + " === undefined) " + (par.name().c()) + " = " + (par.defaults().c())));
			};
		} else {
			if(named && !splat && !blk && opt.count() == 0) {// and no block?!
				// different shorthands
				// if named
				ast.push(("if(!" + (namedvar.c()) + "||" + (isntObj(namedvar.c())) + ") " + (namedvar.c()) + " = \{\}"));
			} else {
				if(blk && opt.count() == 1 && !splat && !named) {
					var op = opt[0];
					var opn = op.name().c();
					var bn = blk.name().c();
					ast.push(("if(" + bn + "==undefined && " + (isFunc(opn)) + ") " + bn + " = " + opn + "," + opn + " = " + (op.defaults().c())));
				} else {
					if(blk && named && opt.count() == 0 && !splat) {
						bn = blk.name().c();
						ast.push(("if(" + bn + "==undefined && " + (isFunc(namedvar.c())) + ") " + bn + " = " + (namedvar.c()) + "," + (namedvar.c()) + " = \{\}"));
						ast.push(("else if(!" + (namedvar.c()) + "||" + (isntObj(namedvar.c())) + ") " + (namedvar.c()) + " = \{\}"));
					} else {
						if(opt.count() > 0 || splat) {// && blk  # && !splat
							
							var argvar = this.scope__().temporary(this,{type: 'arguments'}).predeclared().c();
							var len = this.scope__().temporary(this,{type: 'counter'}).predeclared().c();
							
							var last = ("" + argvar + "[" + len + "-1]");
							var pop = ("" + argvar + "[--" + len + "]");
							ast.push(("var " + argvar + " = arguments, " + len + " = " + argvar + ".length"));
							
							if(blk) {
								bn = blk.name().c();
								if(splat) {
									ast.push(("var " + bn + " = " + (isFunc(last)) + " ? " + pop + " : null"));
								} else {
									if(reg.count() > 0) {
										// ast.push "// several regs really?"
										ast.push(("var " + bn + " = " + len + " > " + (reg.count()) + " && " + (isFunc(last)) + " ? " + pop + " : null"));
									} else {
										ast.push(("var " + bn + " = " + (isFunc(last)) + " ? " + pop + " : null"));
									}
								};
							};
							
							// if we have named params - look for them before splat
							// should probably loop through pars in the same order they were added
							// should it be prioritized above optional objects??
							if(named) {
								// should not include it when there is a splat?
								ast.push(("var " + (namedvar.c()) + " = " + last + "&&" + (isObj(last)) + " ? " + pop + " : \{\}"));
							};
							
							for(var i=0, ary=iter$(opt), len_=ary.length, par; i < len_; i++) {
								par = ary[i];ast.push(("if(" + len + " < " + (par.index() + 1) + ") " + (par.name().c()) + " = " + (par.defaults().c())));
							};
							
							// add the splat
							if(splat) {
								var sn = splat.name().c();
								var si = splat.index();
								
								if(si == 0) {
									ast.push(("var " + sn + " = new Array(" + len + ">" + si + " ? " + len + " : 0)"));
									ast.push(("while(" + len + ">" + si + ") " + sn + "[" + len + "-1] = " + pop));
								} else {
									ast.push(("var " + sn + " = new Array(" + len + ">" + si + " ? " + len + "-" + si + " : 0)"));
									ast.push(("while(" + len + ">" + si + ") " + sn + "[--" + len + " - " + si + "] = " + argvar + "[" + len + "]"));
								};
							};
							
							// if named
							// 	for k,i in named.nodes
							// 		# OP('.',namedvar) <- this is the right way, with invalid names etc
							// 		var op = OP('.',namedvar,k.key).c
							// 		ast.push "var {k.key.c} = {op} !== undefined ? {op} : {k.value.c}"
							
							// if named
							
							// return ast.join(";\n") + ";"
							// return "if({opt[0].name.c} instanceof Function) {blk.c} = {opt[0].c};"
						} else {
							if(opt.count() > 0) {
								for(var i=0, ary=iter$(opt), len_=ary.length, par; i < len_; i++) {
									par = ary[i];ast.push(("if(" + (par.name().c()) + " === undefined) " + (par.name().c()) + " = " + (par.defaults().c())));
								};
							}
						}
					}
				}
			}
		};
		
		// now set stuff if named params(!)
		
		if(named) {
			for(var i=0, ary=iter$(named.nodes()), len_=ary.length, k; i < len_; i++) {
				k = ary[i];var op = OP('.',namedvar,k.c().toAST()).c();
				ast.push(("var " + (k.c()) + " = " + op + " !== undefined ? " + op + " : " + (k.defaults().c())));
			};
		};
		
		if(arys.length) {
			for(var i=0, ary=iter$(arys), len_=ary.length; i < len_; i++) {
				// create tuples
				this.p("adding arrayparams");
				ary[i].head(o,ast,this);
				// ast.push v.c
			};
		};
		
		
		
		// if opt:length == 0
		return (ast.count() > 0) ? ((ast.join(";\n") + ";")) : (AST.EMPTY);
	};
	
	
	
	// Legacy. Should move away from this?
	/* @class VariableDeclaration */
	AST.VariableDeclaration = function VariableDeclaration(){ AST.ListNode.apply(this,arguments) };
	
	subclass$(AST.VariableDeclaration,AST.ListNode);
	
	AST.VariableDeclaration.prototype.__kind = {};
	AST.VariableDeclaration.prototype.kind = function(v){ return this._kind; }
	AST.VariableDeclaration.prototype.setKind = function(v){ this._kind = v; return this; };
	
	AST.VariableDeclaration.prototype.visit = function (){
		// for now we just deal with this if it only has one declaration
		// if any inner assignment is an expression
		
		// the declarators might be predeclared, in which case we don't need
		// to act like a regular one
		return this.map(function (item){
			return item.traverse();
		});
	};
	
	// we want to register these variables in
	AST.VariableDeclaration.prototype.add = function (name,init){
		var vardec = new AST.VariableDeclarator(name,init);
		this.push(vardec);
		return vardec;
		// TODO (target) << (node) rewrites to a caching push which returns node
	};
	
	// def remove item
	// 	if item isa AST.Variable
	// 		map do |v,i|
	// 			if v.variable == item
	// 				p "found variable to remove"
	// 				super.remove(v)
	// 	else
	// 		super.remove(item)
	// 	self
	
	
	AST.VariableDeclaration.prototype.load = function (list){
		// temporary solution!!!
		return list.map(function (par){
			return new AST.VariableDeclarator(par.name(),par.defaults(),par.splat());
		});
	};
	
	AST.VariableDeclaration.prototype.isExpressable = function (){
		return this.list().every(function (item){
			return item.isExpressable();
		});
	};
	
	AST.VariableDeclaration.prototype.js = function (){
		if(this.count() == 0) {
			return AST.EMPTY;
		};
		
		if(this.count() == 1 && !this.isExpressable()) {
			this.p("SHOULD ALTER VARDEC!!!".cyan());
			this.first().variable().autodeclare();
			var node = this.first().assignment();
			return node.c();
		};
		
		// unless right.isExpressable
		// 	p "Assign.consume!".blue
		// ast = right.consume(self)
		// return ast.c
		// vars = map|arg| arg.c )
		// single declarations should be useable as/in expressions
		// when they are - we need to declare the variables at the top of scope
		// should do more generic check to find out if variable should be listed
		// var args = filter(|arg| !arg.variable.@proxy )
		return "var " + this.map(function (arg){
			return arg.c();
		}).compact().join(", ") + "";
	};
	
	
	/* @class VariableDeclarator */
	AST.VariableDeclarator = function VariableDeclarator(){ AST.Param.apply(this,arguments) };
	
	subclass$(AST.VariableDeclarator,AST.Param);
	AST.VariableDeclarator.prototype.visit = function (){
		// even if we should traverse the defaults as if this variable does not exist
		// we need to preregister it and then activate it later
		var variable_, v_;
		(variable_=this.variable()) || ((this.setVariable(v_=this.scope__().register(this.name(),null)),v_));
		if(this.defaults()) {
			this.defaults().traverse();
		};
		this.variable().setDeclarator(this);
		this.variable().addReference(this.name());
		return this;
	};
	
	// needs to be linked up to the actual scoped variables, no?
	AST.VariableDeclarator.prototype.js = function (){
		if(this.variable()._proxy) {
			return null;
		};
		// FIXME need to deal with var-defines within other statements etc
		// FIXME need better syntax for this
		return (this.defaults() != null && this.defaults() != undefined) ? (
			("" + (this.variable().c()) + "=" + (this.defaults().c({expression: true})))
		) : (
			("" + (this.variable().c()))
		);
	};
	
	AST.VariableDeclarator.prototype.accessor = function (){
		return this;
	};
	
	
	
	// TODO clean up and refactor all the different representations of vars
	// VarName, VarReference, LocalVarAccess?
	/* @class VarName */
	AST.VarName = function VarName(a,b){
		AST.VarName.__super__.constructor.apply(this,arguments);
		this._splat = b;
	};
	
	subclass$(AST.VarName,AST.ValueNode);
	
	AST.VarName.prototype.__variable = {};
	AST.VarName.prototype.variable = function(v){ return this._variable; }
	AST.VarName.prototype.setVariable = function(v){ this._variable = v; return this; };
	
	AST.VarName.prototype.__splat = {};
	AST.VarName.prototype.splat = function(v){ return this._splat; }
	AST.VarName.prototype.setSplat = function(v){ this._splat = v; return this; };
	
	
	
	AST.VarName.prototype.visit = function (){
		var variable_, v_;
		this.p("visiting varname(!)",this.value().c());
		// should we not lookup instead?
		(variable_=this.variable()) || ((this.setVariable(v_=this.scope__().register(this.value().c(),null)),v_));
		this.variable().setDeclarator(this);
		this.variable().addReference(this.value());
		return this;
	};
	
	AST.VarName.prototype.js = function (){
		return this.variable().c();
	};
	
	
	
	/* @class VarList */
	AST.VarList = function VarList(t,l,r){
		this._type = this.type();
		this._left = l;
		this._right = r;
	};
	
	subclass$(AST.VarList,AST.Node);
	
	AST.VarList.prototype.__type = {};
	AST.VarList.prototype.type = function(v){ return this._type; }
	AST.VarList.prototype.setType = function(v){ this._type = v; return this; };// let / var / const
	
	AST.VarList.prototype.__left = {};
	AST.VarList.prototype.left = function(v){ return this._left; }
	AST.VarList.prototype.setLeft = function(v){ this._left = v; return this; };
	
	AST.VarList.prototype.__right = {};
	AST.VarList.prototype.right = function(v){ return this._right; }
	AST.VarList.prototype.setRight = function(v){ this._right = v; return this; };
	
	// format :type, :left, :right
	
	// should throw error if there are more values on right than left
	
	
	
	AST.VarList.prototype.visit = function (){
		
		// we need to carefully traverse children in the right order
		// since we should be able to reference
		for(var i=0, ary=iter$(this.left()), len=ary.length; i < len; i++) {
			ary[i].traverse();// this should really be a var-declaration
			if((this.setR(this.right()[($1=i)]),this.right()[$1])) {
				this.r().traverse();
			};
		};
		return this;
	};
	
	AST.VarList.prototype.js = function (){
		// for the regular items 
		var pairs = [];
		var ll = this.left().length;
		var rl = this.right().length;
		var v = null;
		
		// splatting here we come
		if(ll > 1 && rl == 1) {
			this.p("multiassign!");
			var r = this.right()[0];
			r.cache();
			for(var i=0, ary=iter$(this.left()), len=ary.length, l; i < len; i++) {
				l = ary[i];if(l.splat()) {
					throw "not supported?";
					this.p("splat");
					if(i == ll - 1) {
						v = this.util().slice(r,i);
						// v = CALL(OP('.',r,SYM('slice'.toAST),[i.toAST])
						this.p("last");
					} else {
						v = this.util().slice(r,i,-(ll - i) + 1);
						// v = CALL(OP('.',r,'slice'.toAST),[i.toAST,-(ll - i)])
					};
					// v = OP('.',r,i.toAST)
				} else {
					v = OP('.',r,i.toAST());
				};
				
				pairs.push(OP('=',l,v));
			};
		} else {
			for(var i=0, ary=iter$(this.left()), len=ary.length, l; i < len; i++) {
				l = ary[i];var r = this.right()[i];
				pairs.push((r) ? (OP('=',l.variable().accessor(),r)) : (l));
			};
		};
		
		return ("var " + (pairs.c()));
	};
	


}())
},{}],17:[function(require,module,exports){
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
},{}],18:[function(require,module,exports){
(function(){


	function iter$(a){ return a ? (a.toArray ? a.toArray() : a) : []; };;
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
	
	/* @class Scope */
	AST.Scope = function Scope(node,parent){
		this._head = [];
		this._node = node;
		this._parent = parent;
		this._vars = new AST.VariableDeclaration([]);
		this._virtual = false;
		this._counter = 0;
		this._varmap = {};
		this._varpool = [];
	};
	
	
	AST.Scope.prototype.__level = {};
	AST.Scope.prototype.level = function(v){ return this._level; }
	AST.Scope.prototype.setLevel = function(v){ this._level = v; return this; };
	
	AST.Scope.prototype.__context = {};
	AST.Scope.prototype.context = function(v){ return this._context; }
	AST.Scope.prototype.setContext = function(v){ this._context = v; return this; };
	
	AST.Scope.prototype.__node = {};
	AST.Scope.prototype.node = function(v){ return this._node; }
	AST.Scope.prototype.setNode = function(v){ this._node = v; return this; };
	
	AST.Scope.prototype.__parent = {};
	AST.Scope.prototype.parent = function(v){ return this._parent; }
	AST.Scope.prototype.setParent = function(v){ this._parent = v; return this; };
	
	AST.Scope.prototype.__varmap = {};
	AST.Scope.prototype.varmap = function(v){ return this._varmap; }
	AST.Scope.prototype.setVarmap = function(v){ this._varmap = v; return this; };
	
	AST.Scope.prototype.__varpool = {};
	AST.Scope.prototype.varpool = function(v){ return this._varpool; }
	AST.Scope.prototype.setVarpool = function(v){ this._varpool = v; return this; };
	
	AST.Scope.prototype.__params = {};
	AST.Scope.prototype.params = function(v){ return this._params; }
	AST.Scope.prototype.setParams = function(v){ this._params = v; return this; };
	
	AST.Scope.prototype.__head = {};
	AST.Scope.prototype.head = function(v){ return this._head; }
	AST.Scope.prototype.setHead = function(v){ this._head = v; return this; };
	
	AST.Scope.prototype.__vars = {};
	AST.Scope.prototype.vars = function(v){ return this._vars; }
	AST.Scope.prototype.setVars = function(v){ this._vars = v; return this; };
	
	AST.Scope.prototype.__counter = {};
	AST.Scope.prototype.counter = function(v){ return this._counter; }
	AST.Scope.prototype.setCounter = function(v){ this._counter = v; return this; };
	
	
	
	AST.Scope.prototype.context = function (){
		return this._context || (this._context = new AST.ScopeContext(this));
	};
	
	AST.Scope.prototype.traverse = function (){
		return this;
	};
	
	AST.Scope.prototype.visit = function (){
		// p "visited scope!"
		this._parent = STACK.scope(1);// the parent scope
		this._level = STACK.scopes().length - 1;// hmm
		
		// p "parent is",@parent
		
		STACK.addScope(this);
		this.root().scopes().push(this);
		return this;
	};
	
	// called for scopes that are not real scopes in js
	// must ensure that the local variables inside of the scopes do not
	// collide with variables in outer scopes -- rename if needed
	AST.Scope.prototype.virtualize = function (){
		return this;
	};
	
	
	AST.Scope.prototype.root = function (){
		var scope = this;
		while(scope){
			if(scope instanceof AST.FileScope) {
				return scope;
			};
			scope = scope.parent();
		};
		return null;
	};
	
	AST.Scope.prototype.register = function (name,decl,o){
		
		// FIXME re-registering a variable should really return the existing one
		// Again, here we should not really have to deal with system-generated vars
		// But again, it is important
		
		// p "registering {name}"
		if(decl === undefined) decl = null;
		if(o === undefined) o = {};
		name = name.toSymbol();// hmm?
		
		// also look at outer scopes if this is not closed?
		var existing = this._varmap.hasOwnProperty(name) && this._varmap[name];
		if(existing) {
			return existing;
		};
		
		var item = new AST.Variable(this,name,decl,o);
		// need to check for duplicates, and handle this gracefully -
		// going to refactor later
		this._varmap[name] = item;
		return item;
	};
	// declares a variable (has no real declaration beforehand)
	
	// change these values, no?
	AST.Scope.prototype.temporary = function (refnode,o,name){
		
		// p "registering temporary {refnode} {name}"
		// reuse variables
		if(o === undefined) o = {};
		if(name === undefined) name = null;
		if(o.type) {
			for(var i=0, ary=iter$(this._varpool), len=ary.length, v; i < len; i++) {
				v = ary[i];if(v.type() == o.type && v.declarator() == null) {
					return v.reuse(refnode);
				};
			};
		};
		
		// should only 'register' as ahidden variable, no?
		// if there are real nodes inside that tries to refer to vars
		// defined in outer scopes, we need to make sure they are not named after this
		var item = new AST.SystemVariable(this,name,refnode,o);
		this._varpool.push(item);// WHAT? It should not be in the pool unless explicitly put there?
		this._vars.push(item);// WARN variables should not go directly into a declaration-list
		return item;
		// return register(name || "__",nil,system: yes, temporary: yes)
	};
	
	AST.Scope.prototype.declare = function (name,init,options){
		// if name isa AST.Variable
		// p "SCOPE declare var".green
		if(init === undefined) init = null;
		if(options === undefined) options = {};
		name = name.toSymbol();
		this._vars.add(name,init);// .last
		var decl = this._vars.last();
		// item = AST.Variable.new(self,name,decl)
		var item = new AST.Variable(this,name,decl,options);
		decl.setVariable(item);
		return item.resolve();
		// should be possible to force-declare for this scope, no?
		// if this is a system-variable 
	};
	
	AST.Scope.prototype.lookup = function (name){
		var g;
		var ret = null;
		// p 'lookup variable!',name.toSymbol
		if(this._varmap.hasOwnProperty(name.toSymbol())) {
			ret = this._varmap[name.toSymbol()];
		} else {
			// look up any parent scope ?? seems okay
			// !isClosed && 
			ret = this.parent() && this.parent().lookup(name);
		};
		ret || (ret = ((g = this.root()) && (g.lookup(name))));
		// g = root
		return ret;
	};
	
	AST.Scope.prototype.free = function (variable){
		// p "free variable"
		variable.free();// :owner = nil
		// @varpool.push(variable)
		return this;
	};
	
	AST.Scope.prototype.isClosed = function (){
		return false;
	};
	
	AST.Scope.prototype.finalize = function (){
		return this;
	};
	
	AST.Scope.prototype.klass = function (){
		var scope = this;
		while(scope){
			scope = scope.parent();
			if(scope instanceof AST.ClassScope) {
				return scope;
			};
		};
		return null;
	};
	
	AST.Scope.prototype.head = function (){
		return [this._vars,this._params];
	};
	
	AST.Scope.prototype.c = function (o){
		var body;
		if(o === undefined) o = {};
		o.expression = false;
		// need to fix this
		this.node().body().setHead(this.head());
		return body = this.node().body().c(o);
		
		// var head = [@vars,@params].block.c(expression: no)
		// p "head from scope is ({head})"
		// var out = [head or nil,body].flatten.compact.join("\n")
		// out
		// out = '{' + out + 
	};
	
	AST.Scope.prototype.dump = function (){
		var self=this;
		var vars = Object.keys(this._varmap).map(function (k){
			var v = self._varmap[k];
			return (v.references().count()) ? (v.dump()) : (null);
		});
		
		return {type: self.constructor.name,
		level: (self.level() || 0),
		vars: vars.compact(),
		loc: self.node().body().loc()};
	};
	
	AST.Scope.prototype.toString = function (){
		return "" + (this.constructor.name);
	};
	
	
	// FileScope is wrong? Rather TopScope or ProgramScope
	/* @class FileScope */
	AST.FileScope = function FileScope(){
		AST.FileScope.__super__.constructor.apply(this,arguments);
		// really? makes little sense
		this.register('global',this,{type: 'global'});
		this.register('exports',this,{type: 'global'});
		this.register('console',this,{type: 'global'});
		this.register('process',this,{type: 'global'});
		this.register('setTimeout',this,{type: 'global'});
		this.register('setInterval',this,{type: 'global'});
		this.register('clearTimeout',this,{type: 'global'});
		this.register('clearInterval',this,{type: 'global'});
		this.register('__dirname',this,{type: 'global'});
		// preregister global special variables here
		this._warnings = [];
		this._scopes = [];
		this._helpers = [];
	};
	
	subclass$(AST.FileScope,AST.Scope);
	
	AST.FileScope.prototype.__warnings = {};
	AST.FileScope.prototype.warnings = function(v){ return this._warnings; }
	AST.FileScope.prototype.setWarnings = function(v){ this._warnings = v; return this; };
	
	AST.FileScope.prototype.__scopes = {};
	AST.FileScope.prototype.scopes = function(v){ return this._scopes; }
	AST.FileScope.prototype.setScopes = function(v){ this._scopes = v; return this; };
	
	
	
	AST.FileScope.prototype.context = function (){
		return this._context || (this._context = new AST.RootScopeContext(this));
	};
	
	AST.FileScope.prototype.lookup = function (name){
		// p "lookup filescope"
		return (this._varmap.hasOwnProperty(name.toSymbol())) && (this._varmap[name.toSymbol()]);
	};
	
	AST.FileScope.prototype.visit = function (){
		STACK.addScope(this);
		return this;
	};
	
	AST.FileScope.prototype.helper = function (typ,value){
		// log "add helper",typ,value
		if(this._helpers.indexOf(value) == -1) {
			this._helpers.push(value);
		};
		return this;
	};
	
	AST.FileScope.prototype.head = function (){
		return [this._helpers,this._params,this._vars];
	};
	
	// def c
	// 	# need to fix this
	// 	# var helpers = helpers.c(expression: no)
	// 	var body = node.body.c(expression: no)
	// 	var head = [@params,@vars].block.c(expression: no)
	// 	# var foot = []
	// 
	// 	# p "head from scope is {head}"
	// 	[head or nil,@helpers or nil,body].flatten.compact.join("\n")
	
	AST.FileScope.prototype.warn = function (data){
		// hacky
		data.node = null;
		// p "warning",JSON.stringify(data)
		this._warnings.push(data);
		return this;
	};
	
	AST.FileScope.prototype.dump = function (){
		var scopes = this._scopes.map(function (s){
			return s.dump();
		});
		scopes.unshift(AST.FileScope.__super__.dump.call(this));
		
		var obj = {
			warnings: this._warnings.dump(),
			scopes: scopes
		};
		
		return obj;
	};
	
	
	
	
	/* @class ClassScope */
	AST.ClassScope = function ClassScope(){ AST.Scope.apply(this,arguments) };
	
	subclass$(AST.ClassScope,AST.Scope);
	AST.ClassScope.prototype.virtualize = function (){
		// console.log "virtualizing ClassScope"
		var up = this.parent();
		for(var o=this._varmap, i=0, keys=Object.keys(o), l=keys.length; i < l; i++){
			true;
			o[keys[i]].resolve(up,true);// force new resolve
		};
		return this;
	};
	
	
	/* @class TagScope */
	AST.TagScope = function TagScope(){ AST.ClassScope.apply(this,arguments) };
	
	subclass$(AST.TagScope,AST.ClassScope);
	
	
	/* @class ClosureScope */
	AST.ClosureScope = function ClosureScope(){ AST.Scope.apply(this,arguments) };
	
	subclass$(AST.ClosureScope,AST.Scope);
	
	
	/* @class FunctionScope */
	AST.FunctionScope = function FunctionScope(){ AST.Scope.apply(this,arguments) };
	
	subclass$(AST.FunctionScope,AST.Scope);
	
	
	/* @class MethodScope */
	AST.MethodScope = function MethodScope(){ AST.Scope.apply(this,arguments) };
	
	subclass$(AST.MethodScope,AST.Scope);
	AST.MethodScope.prototype.isClosed = function (){
		return true;
	};
	
	
	/* @class LambdaScope */
	AST.LambdaScope = function LambdaScope(){ AST.Scope.apply(this,arguments) };
	
	subclass$(AST.LambdaScope,AST.Scope);
	AST.LambdaScope.prototype.context = function (){
		
		// when accessing the outer context we need to make sure that it is cached
		// so this is wrong - but temp okay
		return this._context || (this._context = this.parent().context().reference(this));
	};
	
	
	/* @class FlowScope */
	AST.FlowScope = function FlowScope(){ AST.Scope.apply(this,arguments) };
	
	subclass$(AST.FlowScope,AST.Scope);
	AST.FlowScope.prototype.params = function (){
		return (this._parent) && (this._parent.params());
	};
	
	AST.FlowScope.prototype.context = function (){
		// if we are wrapping in an expression - we do need to add a reference
		// @referenced = yes
		return this.parent().context();
	};
	// 	# usually - if the parent scope is a closed scope we dont really need
	// 	# to force a reference
	// 	# @context ||= parent.context.reference(self)
	;
	
	/* @class CatchScope */
	AST.CatchScope = function CatchScope(){ AST.FlowScope.apply(this,arguments) };
	
	subclass$(AST.CatchScope,AST.FlowScope);
	
	
	/* @class WhileScope */
	AST.WhileScope = function WhileScope(){ AST.FlowScope.apply(this,arguments) };
	
	subclass$(AST.WhileScope,AST.FlowScope);
	
	
	/* @class ForScope */
	AST.ForScope = function ForScope(){ AST.FlowScope.apply(this,arguments) };
	
	subclass$(AST.ForScope,AST.FlowScope);
	
	
	// lives in scope
	/* @class Variable */
	AST.Variable = function Variable(scope,name,decl,options){
		this._scope = scope;
		this._name = name;
		this._alias = null;
		this._declarator = decl;
		this._autodeclare = false;
		this._declared = true;
		this._resolved = false;
		this._options = options || {};
		this._type = this._options.type || 'var';
		this._export = false;// hmmmm
		// @declarators = [] # not used now
		this._references = [];// should probably be somewhere else, no?
	};
	
	subclass$(AST.Variable,AST.Node);
	
	AST.Variable.prototype.__scope = {};
	AST.Variable.prototype.scope = function(v){ return this._scope; }
	AST.Variable.prototype.setScope = function(v){ this._scope = v; return this; };
	
	AST.Variable.prototype.__name = {};
	AST.Variable.prototype.name = function(v){ return this._name; }
	AST.Variable.prototype.setName = function(v){ this._name = v; return this; };
	
	AST.Variable.prototype.__alias = {};
	AST.Variable.prototype.alias = function(v){ return this._alias; }
	AST.Variable.prototype.setAlias = function(v){ this._alias = v; return this; };
	
	AST.Variable.prototype.__type = {};
	AST.Variable.prototype.type = function(v){ return this._type; }
	AST.Variable.prototype.setType = function(v){ this._type = v; return this; };
	
	AST.Variable.prototype.__options = {};
	AST.Variable.prototype.options = function(v){ return this._options; }
	AST.Variable.prototype.setOptions = function(v){ this._options = v; return this; };
	
	AST.Variable.prototype.__declarator = {};
	AST.Variable.prototype.declarator = function(v){ return this._declarator; }
	AST.Variable.prototype.setDeclarator = function(v){ this._declarator = v; return this; };
	
	AST.Variable.prototype.__autodeclare = {};
	AST.Variable.prototype.autodeclare = function(v){ return this._autodeclare; }
	AST.Variable.prototype.setAutodeclare = function(v){ this._autodeclare = v; return this; };
	
	AST.Variable.prototype.__references = {};
	AST.Variable.prototype.references = function(v){ return this._references; }
	AST.Variable.prototype.setReferences = function(v){ this._references = v; return this; };
	
	AST.Variable.prototype.__export = {};
	AST.Variable.prototype.export = function(v){ return this._export; }
	AST.Variable.prototype.setExport = function(v){ this._export = v; return this; };
	
	
	
	
	AST.Variable.prototype.resolve = function (scope,force){
		var item;
		if(scope === undefined) scope = this.scope();
		if(force === undefined) force = false;
		if(this._resolved && !force) {
			return this;
		};
		
		this._resolved = true;
		// p "need to resolve!".cyan
		if(item = scope.lookup(this.name())) {
			// p "variable already exists {name}".red
			// possibly redefine this inside, use it only in this scope
			if(item.scope() != scope && this.options().let) {
				// p "override variable inside this scope".red
				scope.varmap()[this.name()] = this;
			};
			
			// different rules for different variables?
			if(this._options.proxy) {
				// p "is proxy -- no need to change name!!! {name}".cyan
				true;
			} else {
				var i = 0;
				var orig = this._name;
				while(scope.lookup(this._name)){
					this._name = ("" + orig + (i += 1));
				};
			};
		};
		
		scope.varmap()[this.name()] = this;
		return this;
		// p "resolve variable".cyan
	};
	
	AST.Variable.prototype.reference = function (){
		return this;
	};
	
	AST.Variable.prototype.free = function (ref){
		// p "free variable!"
		this._declarator = null;
		return this;
	};
	
	AST.Variable.prototype.reuse = function (ref){
		this._declarator = ref;
		return this;
	};
	
	AST.Variable.prototype.proxy = function (par,index){
		this._proxy = [par,index];
		return this;
	};
	
	AST.Variable.prototype.refcount = function (){
		return this._references.length;
	};
	
	AST.Variable.prototype.c = function (){
		if(this._c) {
			return this._c;
		};
		
		if(this._proxy) {
			// p "var is proxied!",@proxy
			this._c = ("" + (this._proxy[0].c()) + "[" + (this._proxy[1].c()) + "]");
		} else {
			this._c = (this.alias() || this.name()).c();
			// allow certain reserved words
			// should warn on others though (!!!)
			if(AST.RESERVED_REGEX.test(this._c)) {
				this._c = ("" + this.c() + "$");
			};// @c.match(/^(default)$/)
		};
		return this._c;
	};
	
	// variables should probably inherit from node(!)
	AST.Variable.prototype.consume = function (node){
		// p "variable assignify!!!"
		return this;
	};
	
	// this should only generate the accessors - not dael with references
	AST.Variable.prototype.accessor = function (ref){
		var node = new AST.LocalVarAccess(".",null,this);// this is just wrong .. should not be a regular accessor
		// @references.push([ref,el]) if ref # weird temp format
		return node;
	};
	
	AST.Variable.prototype.addReference = function (ref){
		this._references.push(ref);
		return this;
	};
	
	AST.Variable.prototype.autodeclare = function (){
		if(this.option('declared')) {
			return this;
		};
		// p "variable should autodeclare(!)"
		this._autodeclare = true;
		
		// WARN
		// if scope isa AST.WhileScope
		// 	p "should do different autodeclare!!"
		// 	# or we should simply add them
		
		this.scope().vars().push(this);// only if it does not exist here!!!
		this.set({declared: true});
		return this;
	};
	
	AST.Variable.prototype.toSymbol = function (){
		return this.name();
	};
	
	
	AST.Variable.prototype.dump = function (typ){
		return {
			type: this.type(),
			name: this.name(),
			refs: this._references.dump(typ)
		};
	};
	
	
	/* @class SystemVariable */
	AST.SystemVariable = function SystemVariable(){ AST.Variable.apply(this,arguments) };
	
	subclass$(AST.SystemVariable,AST.Variable);
	AST.SystemVariable.prototype.predeclared = function (){
		// p "remove var from scope(!)"
		this.scope().vars().remove(this);
		return this;
	};
	
	AST.SystemVariable.prototype.resolve = function (){
		var alias, v_;
		if(this._resolved || this._name) {
			return this;
		};
		// p "RESOLVE SYSTEM VARIABLE".red
		this._resolved = true;
		// unless @name
		// adds a very random initial name
		// the auto-magical goes last, or at least, possibly reuse other names
		// "${Math.floor(Math.random * 1000)}"
		
		var typ = this._options.type;
		var names = [].concat(this._options.names);
		var alt = null;
		var node = null;
		
		var scope = this.scope();
		
		if(typ == 'tag') {
			var i = 0;
			while(!(this._name)){
				var alt = ("t" + (i++));
				if(!scope.lookup(alt)) {
					this._name = alt;
				};
			};
		} else {
			if(typ == 'iter') {
				names = ['ary__','ary_','coll','array','items','ary'];
			} else {
				if(typ == 'val') {
					names = ['v_'];
				} else {
					if(typ == 'arguments') {
						names = ['$_','$0'];
					} else {
						if(typ == 'keypars') {
							names = ['opts','options','pars'];
						} else {
							if(typ == 'counter') {
								names = ['i__','i_','k','j','i'];
							} else {
								if(typ == 'len') {
									names = ['len__','len_','len'];
								} else {
									if(typ == 'list') {
										names = ['tmplist_','tmplist','tmp'];
									}
								}
							}
						}
					}
				}
			}
		};
		// or if type placeholder / cacher (add 0)
		
		while(!(this._name) && (alt = names.pop())){
			if(!scope.lookup(alt)) {
				this._name = alt;
			};
		};
		
		if(!(this._name)) {
			if(node = this.declarator().node()) {
				if(alias = node.alias()) {
					names.push(alias + "_");
				};
			};
		};
		
		while(!(this._name) && (alt = names.pop())){
			if(!scope.lookup(alt)) {
				this._name = alt;
			};
		};
		
		// p "suggested names {names.join(" , ")} {node}".cyan
		//  Math.floor(Math.random * 1000)
		this._name || (this._name = ("$" + ((scope.setCounter(v_=scope.counter() + 1),v_))));
		// p "name for variable is {@name}"
		scope.varmap()[this._name] = this;
		return this;
	};
	
	AST.SystemVariable.prototype.name = function (){
		this.resolve();
		return this._name;
	};
	
	
	
	/* @class ScopeContext */
	AST.ScopeContext = function ScopeContext(scope,value){
		this._scope = scope;
		this._value = value;
		this;
	};
	
	subclass$(AST.ScopeContext,AST.Node);
	
	AST.ScopeContext.prototype.__scope = {};
	AST.ScopeContext.prototype.scope = function(v){ return this._scope; }
	AST.ScopeContext.prototype.setScope = function(v){ this._scope = v; return this; };
	
	AST.ScopeContext.prototype.__value = {};
	AST.ScopeContext.prototype.value = function(v){ return this._value; }
	AST.ScopeContext.prototype.setValue = function(v){ this._value = v; return this; };
	
	
	
	// instead of all these references we should probably
	// just register when it is accessed / looked up from
	// a deeper function-scope, and when it is, we should
	// register the variable in scope, and then start to
	// use that for further references. Might clean things
	// up for the cases where we have yet to decide the
	// name of the variable etc?
	
	AST.ScopeContext.prototype.reference = function (){
		// p "p reference {STACK.scoping}"
		// should be a special context-variable!!!
		return this._reference || (this._reference = this.scope().declare("self",new AST.This()));
	};
	
	AST.ScopeContext.prototype.c = function (){
		var val = this._value || this._reference;
		return (val) ? (val.c()) : ("this");
	};
	
	
	/* @class RootScopeContext */
	AST.RootScopeContext = function RootScopeContext(){ AST.ScopeContext.apply(this,arguments) };
	
	subclass$(AST.RootScopeContext,AST.ScopeContext);
	AST.RootScopeContext.prototype.reference = function (scope){
		return this;
	};
	
	AST.RootScopeContext.prototype.c = function (o){
		// should be the other way around, no?
		return (o && o.explicit) ? (AST.RootScopeContext.__super__.c.apply(this,arguments)) : ("");
	};
	
	
	/* @class Super */
	AST.Super = function Super(){ AST.Node.apply(this,arguments) };
	
	subclass$(AST.Super,AST.Node);
	AST.Super.prototype.c = function (){
		// need to find the stuff here
		// this is really not that good8
		var m = STACK.method();
		var out = null;
		var up = STACK.current();
		var deep = (up instanceof AST.Access);
		
		// TODO optimization for later - problematic if there is a different reference in the end
		if(false && m && m.type() == 'constructor') {
			out = ("" + (m.target().c()) + ".superclass");
			if(!deep) {
				out += (".apply(" + (m.scope().context().c()) + ",arguments)");
			};
		} else {
			out = ("" + (m.target().c()) + ".__super__");
			if(!((up instanceof AST.Access))) {
				out += ("." + (m.supername().c()));
				if(!((up instanceof AST.Call))) {// autocall?
					out += (".apply(" + (m.scope().context().c()) + ",arguments)");
				};
			};
		};
		return out;
	};
	


}())
},{}],19:[function(require,module,exports){
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
},{}],20:[function(require,module,exports){
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
	
	/* @class Splat */
	AST.Splat = function Splat(){ AST.ValueNode.apply(this,arguments) };
	
	subclass$(AST.Splat,AST.ValueNode);
	AST.Splat.prototype.js = function (){
		var par = this.stack().parent();
		return (par instanceof AST.Arr) ? (
			("[].slice.call(" + (this.value().c()) + ")")
		) : (
			"SPLAT"
		);
	};
	
	
	AST.Splat.prototype.node = function (){
		return this.value();
	};
	


}())
},{}],21:[function(require,module,exports){
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
	
	/* @class Return */
	AST.Return = function Return(v){
		this._value = v;
		this._prebreak = v && v._prebreak;// hmmm
		// console.log "return?!? {v}",@prebreak
		
		if(v instanceof AST.ArgList) {
			v = v.nodes();
			// @value = v:length > 1 ? AST.Arr.new(v) : v[0]
		};
		
		if(v instanceof Array) {
			this._value = (v.length > 1) ? (new AST.Arr(v)) : (v[0]);
		};
	};
	
	subclass$(AST.Return,AST.Statement);
	
	AST.Return.prototype.__value = {};
	AST.Return.prototype.value = function(v){ return this._value; }
	AST.Return.prototype.setValue = function(v){ this._value = v; return this; };
	
	
	
	AST.Return.prototype.visit = function (){
		return (this._value && this._value.traverse) && (this._value.traverse());
	};
	
	AST.Return.prototype.js = function (){
		return (this.value()) ? (("return " + (this.value().c({expression: true})))) : ("return");
	};
	
	AST.Return.prototype.c = function (){
		if(!this.value() || this.value().isExpressable()) {
			return AST.Return.__super__.c.apply(this,arguments);
		};
		// p "return must cascade into value".red
		return this.value().consume(this).c();
	};
	
	AST.Return.prototype.consume = function (node){
		return this;
	};
	
	
	/* @class ImplicitReturn */
	AST.ImplicitReturn = function ImplicitReturn(){ AST.Return.apply(this,arguments) };
	
	subclass$(AST.ImplicitReturn,AST.Return);
	AST.ImplicitReturn.prototype.c = function (){
		// hmm?
		return (this.value()) ? (("return " + (this.value().c({expression: true})))) : ("return");
	};
	
	
	/* @class GreedyReturn */
	AST.GreedyReturn = function GreedyReturn(){ AST.ImplicitReturn.apply(this,arguments) };
	
	subclass$(AST.GreedyReturn,AST.ImplicitReturn);
	AST.GreedyReturn.prototype.c = function (){
		// hmm?
		return (this.value()) ? (("return " + (this.value().c({expression: true})))) : ("return");
	};
	
	
	// cannot live inside an expression(!)
	/* @class Throw */
	AST.Throw = function Throw(){ AST.Statement.apply(this,arguments) };
	
	subclass$(AST.Throw,AST.Statement);
	AST.Throw.prototype.js = function (){
		return "throw " + (this.value().c());
	};
	
	AST.Throw.prototype.consume = function (node){
		// ROADMAP should possibly consume to the value of throw and then throw?
		return this;
	};
	
	
	
	/* @class LoopFlowStatement */
	AST.LoopFlowStatement = function LoopFlowStatement(lit,expr){
		this.setLiteral(lit);
		(this.setExpression(expr),expr);// && AST.ArgList.new(expr) # really?
	};
	
	subclass$(AST.LoopFlowStatement,AST.Statement);
	
	AST.LoopFlowStatement.prototype.__literal = {};
	AST.LoopFlowStatement.prototype.literal = function(v){ return this._literal; }
	AST.LoopFlowStatement.prototype.setLiteral = function(v){ this._literal = v; return this; };
	
	AST.LoopFlowStatement.prototype.__expression = {};
	AST.LoopFlowStatement.prototype.expression = function(v){ return this._expression; }
	AST.LoopFlowStatement.prototype.setExpression = function(v){ this._expression = v; return this; };
	
	
	
	AST.LoopFlowStatement.prototype.visit = function (){
		return (this.expression()) && (this.expression().traverse());
	};
	
	AST.LoopFlowStatement.prototype.consume = function (node){
		// p "break/continue should consume?!"
		return this;
	};
	
	AST.LoopFlowStatement.prototype.c = function (){
		var copy;
		if(!this.expression()) {
			return AST.LoopFlowStatement.__super__.c.apply(this,arguments);
		};
		// get up to the outer loop
		var _loop = STACK.up(AST.Loop);
		// p "found loop?",_loop
		
		// need to fix the grammar for this. Right now it 
		// is like a fake call, but should only care about the first argument
		var expr = this.expression();
		
		return (_loop.catcher()) ? (
			expr = expr.consume(_loop.catcher()),
			copy = new this.constructor(this.literal()),
			BLOCK(expr,copy).c()
		) : ((expr) ? (
			copy = new this.constructor(this.literal()),
			BLOCK(expr,copy).c()
		) : (
			AST.LoopFlowStatement.__super__.c.apply(this,arguments)
		));
		// return "loopflow"
	};
	
	
	
	/* @class BreakStatement */
	AST.BreakStatement = function BreakStatement(){ AST.LoopFlowStatement.apply(this,arguments) };
	
	subclass$(AST.BreakStatement,AST.LoopFlowStatement);
	AST.BreakStatement.prototype.js = function (){
		return "break";
	};
	
	
	/* @class ContinueStatement */
	AST.ContinueStatement = function ContinueStatement(){ AST.LoopFlowStatement.apply(this,arguments) };
	
	subclass$(AST.ContinueStatement,AST.LoopFlowStatement);
	AST.ContinueStatement.prototype.js = function (){
		return "continue";
	};
	
	
	/* @class DebuggerStatement */
	AST.DebuggerStatement = function DebuggerStatement(){ AST.Statement.apply(this,arguments) };
	
	subclass$(AST.DebuggerStatement,AST.Statement);
	


}())
},{}],22:[function(require,module,exports){
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
	function iter$(a){ return a ? (a.toArray ? a.toArray() : a) : []; };
	TAG_TYPES = {};
	TAG_ATTRS = {};
	
	
	TAG_TYPES.HTML = "a abbr address area article aside audio b base bdi bdo big blockquote body br button canvas caption cite code col colgroup data datalist dd del details dfn div dl dt em embed fieldset figcaption figure footer form h1 h2 h3 h4 h5 h6 head header hr html i iframe img input ins kbd keygen label legend li link main map mark menu menuitem meta meter nav noscript object ol optgroup option output p param pre progress q rp rt ruby s samp script section select small source span strong style sub summary sup table tbody td textarea tfoot th thead time title tr track u ul var video wbr".split(" ");
	
	TAG_TYPES.SVG = "circle defs ellipse g line linearGradient mask path pattern polygon polyline radialGradient rect stop svg text tspan".split(" ");
	
	TAG_ATTRS.HTML = "accept accessKey action allowFullScreen allowTransparency alt async autoComplete autoFocus autoPlay cellPadding cellSpacing charSet checked className cols colSpan content contentEditable contextMenu controls coords crossOrigin data dateTime defer dir disabled download draggable encType form formNoValidate frameBorder height hidden href hrefLang htmlFor httpEquiv icon id label lang list loop max maxLength mediaGroup method min multiple muted name noValidate pattern placeholder poster preload radioGroup readOnly rel required role rows rowSpan sandbox scope scrollLeft scrolling scrollTop seamless selected shape size span spellCheck src srcDoc srcSet start step style tabIndex target title type useMap value width wmode";
	
	TAG_ATTRS.SVG = "cx cy d dx dy fill fillOpacity fontFamily fontSize fx fy gradientTransform gradientUnits markerEnd markerMid markerStart offset opacity patternContentUnits patternUnits points preserveAspectRatio r rx ry spreadMethod stopColor stopOpacity stroke strokeDasharray strokeLinecap strokeOpacity strokeWidth textAnchor transform version viewBox x1 x2 x y1 y2 y";
	
	
	/* @class TagDesc */
	AST.TagDesc = function TagDesc(){
		this.p('TagDesc!!!',arguments);
	};
	
	subclass$(AST.TagDesc,AST.Node);
	
	
	AST.TagDesc.prototype.classes = function (){
		this.p('TagDescClasses',arguments);
		return this;
	};
	
	
	/* @class Tag */
	AST.Tag = function Tag(o){
		// p "init tag",$0
		if(o === undefined) o = {};
		this._parts = [];
		o.classes || (o.classes = []);
		o.attributes || (o.attributes = []);
		o.classes || (o.classes = []);
		this._options = o;
	};
	
	subclass$(AST.Tag,AST.Expression);
	
	AST.Tag.prototype.__parts = {};
	AST.Tag.prototype.parts = function(v){ return this._parts; }
	AST.Tag.prototype.setParts = function(v){ this._parts = v; return this; };
	
	AST.Tag.prototype.__object = {};
	AST.Tag.prototype.object = function(v){ return this._object; }
	AST.Tag.prototype.setObject = function(v){ this._object = v; return this; };
	
	AST.Tag.prototype.__reactive = {};
	AST.Tag.prototype.reactive = function(v){ return this._reactive; }
	AST.Tag.prototype.setReactive = function(v){ this._reactive = v; return this; };
	
	AST.Tag.prototype.__parent = {};
	AST.Tag.prototype.parent = function(v){ return this._parent; }
	AST.Tag.prototype.setParent = function(v){ this._parent = v; return this; };
	
	AST.Tag.prototype.__tree = {};
	AST.Tag.prototype.tree = function(v){ return this._tree; }
	AST.Tag.prototype.setTree = function(v){ this._tree = v; return this; };
	
	
	
	AST.Tag.prototype.set = function (obj){
		for(var o=obj, v, i=0, keys=Object.keys(o), l=keys.length, k; i < l; i++){
			
			k = keys[i];v = o[k];if(k == 'attributes') {
				// p "attributs!"
				for(var j=0, ary=iter$(v), len=ary.length; j < len; j++) {
					this.addAttribute(ary[j]);
				};
				continue;
			};
			
			this._options[k] = v;
		};
		return this;
	};
	
	AST.Tag.prototype.addClass = function (node){
		if(!((node instanceof AST.TagFlag))) {
			node = new AST.TagFlag(node);
		};
		this._options.classes.push(node);
		this._parts.push(node);
		
		// p "add class!!!"
		return this;
	};
	
	AST.Tag.prototype.addIndex = function (node){
		this._parts.push(node);
		// hmm
		this._object = node;
		// must be the first part?
		return this;
	};
	
	AST.Tag.prototype.addSymbol = function (node){
		// p "addSymbol to the tag",node
		if(this._parts.length == 0) {
			this._parts.push(node);
			this._options.ns = node;
		};
		return this;
	};
	
	
	AST.Tag.prototype.addAttribute = function (atr){
		// p "add attribute!!!", key, value
		this._parts.push(atr);// what?
		this._options.attributes.push(atr);
		return this;
	};
	
	AST.Tag.prototype.type = function (){
		return this._options.type || 'div';
	};
	
	AST.Tag.prototype.consume = function (node){
		if(node instanceof AST.TagTree) {
			// p "tag consume tagtree? {node.reactive}"
			this.setReactive(node.reactive() || !(!this.option('ivar')));// hmm
			this.setParent(node.root());// hmm
			return this;
		} else {
			return AST.Tag.__super__.consume.apply(this,arguments);
		};
	};
	
	AST.Tag.prototype.visit = function (){
		var o = this._options;
		if(o.body) {
			// force expression(!)
			o.body.map(function (v){
				return v.traverse();
			});
		};
		
		// id should also be a regular part
		// hmm?
		if(o.id) {
			o.id.traverse();
		};
		
		for(var i=0, ary=iter$(this._parts), len=ary.length; i < len; i++) {
			ary[i].traverse();
		};
		
		// for atr in @options:attributes
		// 	atr.traverse
		
		return this;
	};
	
	AST.Tag.prototype.reference = function (){
		// should resolve immediately to get the correct naming-structure that
		// reflects the nesting-level of the tag
		return this._reference || (this._reference = this.scope__().temporary(this,{type: 'tag'}).resolve());
	};
	
	// should this not happen in js?
	AST.Tag.prototype.js = function (){
		// p JSON.stringify(@options)
		// var attrs = AST.TagAttributes.new(o:attributes)
		// p "got here?"
		var body;
		var o = this._options;
		var a = {};
		
		var setup = [];
		var calls = [];
		var statics = [];
		
		var scope = this.scope__();
		var commit = "end";
		
		var isSelf = (this.type() instanceof AST.Self);
		
		for(var i=0, ary=iter$(o.attributes), len=ary.length, atr; i < len; i++) {
			atr = ary[i];a[atr.key()] = atr.value();// .populate(obj)
		};
		
		var id = (o.id instanceof AST.Node) ? (o.id.c()) : ((o.id && o.id.c().quoted()));
		
		//  "scope is", !!scope
		// p "type is {type}"
		var out = (isSelf) ? (
			commit = "synced",
			// p "got here"
			// setting correct context directly
			this.setReactive(true),
			this._reference = scope.context(),
			// hmm, not sure about this
			scope.context().c()
		) : ((o.id) ? (
			("ti$('" + (this.type().func()) + "'," + id + ")")
		) : (
			("t$('" + (this.type().func()) + "')")
		));
		
		// this is reactive if it has an ivar
		if(o.ivar) {
			this.setReactive(true);
			statics.push((".setRef(" + (o.ivar.name().quoted()) + "," + (scope.context().c()) + ")"));
		};
		
		// hmmm
		var tree = new AST.TagTree(o.body,{root: this,reactive: this.reactive()}).resolve();
		this.setTree(tree);
		
		// should it not happen through parts instead?
		// for flag in o:classes
		// 	calls.push(flag.c)
		// 	# calls.push ".flag({flag isa String ? flag.c.quoted : flag.c})"
		
		for(var i=0, ary=iter$(this._parts), len=ary.length, part; i < len; i++) {
			part = ary[i];if(part instanceof AST.TagAttr) {
				var akey = part.key();
				
				// the attr should compile itself instead -- really
				
				if(akey[0] == '.') {// should check in a better way
					calls.push((".flag(" + (akey.substr(1).quoted()) + "," + (part.value().c()) + ")"));
				} else {
					calls.push(("." + (part.key().toSetter()) + "(" + (part.value().c()) + ")"));
				};
			} else {
				if(part instanceof AST.TagFlag) {
					calls.push(part.c());
				}
			};
		};
		
		
		// for atr in o:attributes
		// 	# continue if atr.key.match /tst/ # whatt??!
		// 	# only force-set the standard attributes?
		// 	# what about values that are not legal?
		// 	# can easily happen - we need to compile them?
		// 	# or always proxy through set
		// 	var akey = atr.key
		// 
		// 	# TODO FIXME what if the key is dashed?
		// 	# p "attribute {akey}"
		// 	
		// 	if akey[0] == '.' # should check in a better way
		// 		# aint good?
		// 		# out += ".flag({akey.substr(1).quoted},{atr.value.c})"
		// 		calls.push ".flag({akey.substr(1).quoted},{atr.value.c})"
		// 	else
		// 		# should check for standard-attributes, consider setter instead?
		// 		# out += ".{atr.key}({atr.value.c})"
		// 		calls.push ".{atr.key.toSetter}({atr.value.c})"
		
		if(this.object()) {
			calls.push((".setObject(" + (this.object().c()) + ")"));
		};
		
		// p "tagtree is static? {tree.static}"
		
		// we need to trigger our own reference before the body does
		if(this.reactive()) {
			this.reference();// hmm
		};
		
		if(body = tree.c({expression: true})) {// force it to be an expression, no?
			calls.push(((isSelf) ? ((".setChildren([" + body + "])")) : ((".setContent([" + body + "])"))));
			// out += ".body({body})"
		};
		
		// if o:attributes:length # or -- always?
		// adds lots of extra calls - but okay for now
		calls.push(("." + commit + "()"));
		
		if(statics.length) {
			out = out + statics.join("");
		};
		
		// hmm - hack much
		if((o.ivar || this.reactive()) && !(this.type() instanceof AST.Self)) {
			// if this is an ivar, we should set the reference relative
			// to the outer reference, or possibly right on context?
			var par = this.parent();
			var ctx = !(o.ivar) && par && par.reference() || scope.context();
			var key = o.ivar || par && par.tree().indexOf(this);
			
			// need the context -- might be better to rewrite it for real?
			// parse the whole thing into calls etc
			var acc = OP('.',ctx,key).c();
			
			out = ("(" + (this.reference().c()) + " = " + acc + " || (" + acc + " = " + out + "))");
		};
		
		// should we not add references to the outer ones first?
		
		// now work on the refereces?
		
		// free variable
		if(this._reference instanceof AST.Variable) {
			this._reference.free();
		};
		// if setup:length
		// out += ".setup({setup.join(",")})"
		
		return out + calls.join("");
	};
	
	
	// This is a helper-node
	/* @class TagTree */
	AST.TagTree = function TagTree(){ AST.ListNode.apply(this,arguments) };
	
	subclass$(AST.TagTree,AST.ListNode);
	AST.TagTree.prototype.load = function (list){
		return (list instanceof AST.ListNode) ? (
			this._indentation || (this._indentation = list._indentation),
			list.nodes()
		) : (
			((list instanceof Array) ? (list) : ([list])).compact()
		);
	};
	
	AST.TagTree.prototype.root = function (){
		return this.option('root');
	};
	
	AST.TagTree.prototype.reactive = function (){
		return this.option('reactive');
	};
	
	AST.TagTree.prototype.resolve = function (){
		var self=this;
		this.remap(function (c){
			return c.consume(self);
		});
		return self;
	};
	
	AST.TagTree.prototype.static = function (){
		return (this._static == null) ? (this._static = this.every(function (c){
			return c instanceof AST.Tag;
		})) : (this._static);
	};
	
	AST.TagTree.prototype.c = function (){
		return AST.TagTree.__super__.c.apply(this,arguments);
		
		// p "TagTree.c {nodes}"	
		var l = this.nodes().length;
		return (l == 1) ? (
			// p "TagTree.c {nodes}"
			this.map(function (v){
				return v.c({expression: true});
			})
			// nodes.c(expression: yes)
		) : ((l > 1) && (
			this.nodes().c({expression: true})
		));
	};
	
	
	
	/* @class TagWrapper */
	AST.TagWrapper = function TagWrapper(){ AST.ValueNode.apply(this,arguments) };
	
	subclass$(AST.TagWrapper,AST.ValueNode);
	AST.TagWrapper.prototype.visit = function (){
		if(this.value() instanceof Array) {
			this.value().map(function (v){
				return v.traverse();
			});
		} else {
			this.value().traverse();
		};
		return this;
	};
	
	AST.TagWrapper.prototype.c = function (){
		return "tag$wrap(" + (this.value().c({expression: true})) + ")";
	};
	
	
	
	/* @class TagAttributes */
	AST.TagAttributes = function TagAttributes(){ AST.ListNode.apply(this,arguments) };
	
	subclass$(AST.TagAttributes,AST.ListNode);
	AST.TagAttributes.prototype.get = function (name){
		for(var i=0, ary=iter$(this.nodes()), len=ary.length, node, res=[]; i < len; i++) {
			node = ary[i];if(node.key() == name) {
				return node;
			};
		};return res;
	};
	
	
	
	/* @class TagAttr */
	AST.TagAttr = function TagAttr(k,v){
		// p "init TagAttribute", $0
		this._key = k;
		this._value = v;
	};
	
	subclass$(AST.TagAttr,AST.Node);
	
	AST.TagAttr.prototype.__key = {};
	AST.TagAttr.prototype.key = function(v){ return this._key; }
	AST.TagAttr.prototype.setKey = function(v){ this._key = v; return this; };
	
	AST.TagAttr.prototype.__value = {};
	AST.TagAttr.prototype.value = function(v){ return this._value; }
	AST.TagAttr.prototype.setValue = function(v){ this._value = v; return this; };
	
	AST.TagAttr.prototype.visit = function (){
		if(this.value()) {
			this.value().traverse();
		};
		return this;
	};
	
	
	
	AST.TagAttr.prototype.populate = function (obj){
		obj.add(this.key(),this.value());
		return this;
	};
	
	AST.TagAttr.prototype.c = function (){
		return "attribute";
	};
	
	
	
	/* @class TagFlag */
	AST.TagFlag = function TagFlag(value){
		this._value = value;
		this;
	};
	
	subclass$(AST.TagFlag,AST.Node);
	
	AST.TagFlag.prototype.__value = {};
	AST.TagFlag.prototype.value = function(v){ return this._value; }
	AST.TagFlag.prototype.setValue = function(v){ this._value = v; return this; };
	
	AST.TagFlag.prototype.__toggler = {};
	AST.TagFlag.prototype.toggler = function(v){ return this._toggler; }
	AST.TagFlag.prototype.setToggler = function(v){ this._toggler = v; return this; };
	
	
	
	AST.TagFlag.prototype.visit = function (){
		if(!((typeof this._value=='string'||this._value instanceof String))) {
			this._value.traverse();
		};
		return this;
	};
	
	AST.TagFlag.prototype.c = function (){
		var value_;
		return ((typeof (value_=this.value())=='string'||value_ instanceof String)) ? (
			(".flag(" + (this.value().quoted()) + ")")
		) : (
			(".flag(" + (this.value().c()) + ")")
		);
	};
	


}())
},{}],23:[function(require,module,exports){
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
	
	/* @class Util */
	AST.Util = function Util(args){
		this._args = args;
	};
	
	subclass$(AST.Util,AST.Node);
	
	AST.Util.prototype.__args = {};
	AST.Util.prototype.args = function(v){ return this._args; }
	AST.Util.prototype.setArgs = function(v){ this._args = v; return this; };
	
	
	
	// this is how we deal with it now
	AST.Util.extend = function (a,b){
		return new AST.Util.Extend([a,b]);
	};
	
	AST.Util.repeat = function (str,times){
		var res = '';
		while(times > 0){
			if(times % 2 == 1) {
				res += str;
			};
			str += str;
			times >>= 1;
		};
		return res;
	};
	
	
	
	AST.Util.keys = function (obj){
		var l = new AST.Const("Object");
		var r = new AST.Identifier("keys");
		return CALL(OP('.',l,r),[obj]);
	};
	
	AST.Util.len = function (obj,cache){
		// p "LEN HELPER".green
		var r = new AST.Identifier("length");
		var node = OP('.',obj,r);
		if(cache) {
			node.cache({force: true,type: 'len'});
		};
		return node;
	};
	
	AST.Util.indexOf = function (lft,rgt){
		var node = new AST.Util.IndexOf([lft,rgt]);
		// node.cache(force: yes, type: 'iter') if cache
		return node;
	};
	
	AST.Util.slice = function (obj,a,b){
		var slice = new AST.Identifier("slice");
		return CALL(OP('.',obj,slice),[a.toAST(),b && b.toAST()].compact());
	};
	
	AST.Util.iterable = function (obj,cache){
		var node = new AST.Util.Iterable([obj]);
		if(cache) {
			node.cache({force: true,type: 'iter'});
		};
		return node;
	};
	
	
	
	AST.Util.union = function (a,b){
		return new AST.Util.Union([a,b]);
		// CALL(AST.UNION,[a,b])
	};
	
	AST.Util.intersect = function (a,b){
		return new AST.Util.Intersect([a,b]);
		// CALL(AST.INTERSECT,[a,b])
	};
	
	AST.Util.counter = function (start,cache){
		var node = new AST.Num(start);
		if(cache) {
			node.cache({force: true,type: 'counter'});
		};
		return node;
	};
	
	AST.Util.array = function (size,cache){
		var node = new AST.Util.Array([size]);
		if(cache) {
			node.cache({force: true,type: 'list'});
		};
		return node;
	};
	
	AST.Util.defineTag = function (type,ctor,supr){
		return CALL(AST.TAGDEF,[type,ctor,supr]);
	};
	
	// hmm
	AST.Util.defineClass = function (name,supr,initor){
		return CALL(AST.CLASSDEF,[name || initor,this.sup()]);
	};
	
	
	AST.Util.toAST = function (obj){
		// deep converter that takes arrays etc and converts into ast
		return this;
	};
	
	AST.Util.prototype.js = function (){
		return "helper";
	};
	
	
	/* @class Union */
	AST.Util.Union = function Union(){ AST.Util.apply(this,arguments) };
	
	subclass$(AST.Util.Union,AST.Util);
	AST.Util.Union.prototype.helper = function (){
		return 'union$ = function(a,b){\n	if(a && a.__union) return a.__union(b);\n\n	var u = a.slice(0);\n	for(var i=0,l=b.length;i<l;i++) if(u.indexOf(b[i]) == -1) u.push(b[i]);\n	return u;\n};\n';
	};
	
	
	AST.Util.Union.prototype.js = function (){
		this.scope__().root().helper(this,this.helper());
		// When this is triggered, we need to add it to the top of file?
		return "union$(" + (this.args().compact().c().join(',')) + ")";
	};
	
	
	/* @class Intersect */
	AST.Util.Intersect = function Intersect(){ AST.Util.apply(this,arguments) };
	
	subclass$(AST.Util.Intersect,AST.Util);
	AST.Util.Intersect.prototype.helper = function (){
		return 'intersect$ = function(a,b){\n	if(a && a.__intersect) return a.__intersect(b);\n	var res = [];\n	for(var i=0, l=a.length; i<l; i++) {\n		var v = a[i];\n		if(b.indexOf(v) != -1) res.push(v);\n	}\n	return res;\n};\n';
	};
	
	AST.Util.Intersect.prototype.js = function (){
		// When this is triggered, we need to add it to the top of file?
		this.scope__().root().helper(this,this.helper());
		return "intersect$(" + (this.args().compact().c().join(',')) + ")";
	};
	
	
	/* @class Extend */
	AST.Util.Extend = function Extend(){ AST.Util.apply(this,arguments) };
	
	subclass$(AST.Util.Extend,AST.Util);
	AST.Util.Extend.prototype.js = function (){
		// When this is triggered, we need to add it to the top of file?
		return "extend$(" + (this.args().compact().c().join(',')) + ")";
	};
	
	
	/* @class IndexOf */
	AST.Util.IndexOf = function IndexOf(){ AST.Util.apply(this,arguments) };
	
	subclass$(AST.Util.IndexOf,AST.Util);
	AST.Util.IndexOf.prototype.helper = function (){
		return 'idx$ = function(a,b){\n	return (b && b.indexOf) ? b.indexOf(a) : [].indexOf.call(a,b);\n};\n';
	};
	
	
	AST.Util.IndexOf.prototype.js = function (){
		this.scope__().root().helper(this,this.helper());
		// When this is triggered, we need to add it to the top of file?
		return "idx$(" + (this.args().compact().c().join(',')) + ")";
	};
	
	
	/* @class Subclass */
	AST.Util.Subclass = function Subclass(){ AST.Util.apply(this,arguments) };
	
	subclass$(AST.Util.Subclass,AST.Util);
	AST.Util.Subclass.prototype.helper = function (){
		// should also check if it is a real promise
		return '// helper for subclassing\nfunction subclass$(obj,sup) {\n	for (var k in sup) {\n		if (sup.hasOwnProperty(k)) obj[k] = sup[k];\n	};\n	// obj.__super__ = sup;\n	obj.prototype = Object.create(sup.prototype);\n	obj.__super__ = obj.prototype.__super__ = sup.prototype;\n	obj.prototype.initialize = obj.prototype.constructor = obj;\n};\n';
	};
	
	AST.Util.Subclass.prototype.js = function (){
		// When this is triggered, we need to add it to the top of file?
		this.scope__().root().helper(this,this.helper());
		return "subclass$(" + (this.args().compact().c().join(',')) + ");\n";
	};
	
	
	/* @class Promisify */
	AST.Util.Promisify = function Promisify(){ AST.Util.apply(this,arguments) };
	
	subclass$(AST.Util.Promisify,AST.Util);
	AST.Util.Promisify.prototype.helper = function (){
		// should also check if it is a real promise
		return "function promise$(a)\{ return a instanceof Array ? Promise.all(a) : (a && a.then ? a : Promise.resolve(a)); \}";
	};
	
	AST.Util.Promisify.prototype.js = function (){
		// When this is triggered, we need to add it to the top of file?
		this.scope__().root().helper(this,this.helper());
		return "promise$(" + (this.args().compact().c().join(',')) + ")";
	};
	
	
	/* @class Class */
	AST.Util.Class = function Class(){ AST.Util.apply(this,arguments) };
	
	subclass$(AST.Util.Class,AST.Util);
	AST.Util.Class.prototype.js = function (){
		// When this is triggered, we need to add it to the top of file?
		return "class$(" + (this.args().compact().c().join(',')) + ")";
	};
	
	
	/* @class Iterable */
	AST.Util.Iterable = function Iterable(){ AST.Util.apply(this,arguments) };
	
	subclass$(AST.Util.Iterable,AST.Util);
	AST.Util.Iterable.prototype.helper = function (){
		// now we want to allow nil values as well - just return as empty collection
		// should be the same for for own of I guess
		return "function iter$(a)\{ return a ? (a.toArray ? a.toArray() : a) : []; \};";
	};
	
	AST.Util.Iterable.prototype.js = function (){
		if(this.args()[0] instanceof AST.Arr) {
			return this.args()[0].c();
		};// or if we know for sure that it is an array
		// only wrap if it is not clear that this is an array?
		this.scope__().root().helper(this,this.helper());
		return ("iter$(" + (this.args()[0].c()) + ")");
	};
	
	
	/* @class IsFunction */
	AST.Util.IsFunction = function IsFunction(){ AST.Util.apply(this,arguments) };
	
	subclass$(AST.Util.IsFunction,AST.Util);
	AST.Util.IsFunction.prototype.js = function (){
		// p "IS FUNCTION {args[0]}"
		// just plain check for now
		return "" + (this.args()[0].c());
		// "isfn$({args[0].c})"
		// "typeof {args[0].c} == 'function'"
	};
	
	
	
	/* @class Array */
	AST.Util.Array = function Array(){ AST.Util.apply(this,arguments) };
	
	subclass$(AST.Util.Array,AST.Util);
	AST.Util.Array.prototype.js = function (){
		// When this is triggered, we need to add it to the top of file?
		return "new Array(" + (this.args().compact().c()) + ")";
	};
	


}())
},{}],24:[function(require,module,exports){
(function(){


	function iter$(a){ return a ? (a.toArray ? a.toArray() : a) : []; };
	var lex;
	require('../imba');
	
	var lexer = require('./lexer');
	var parser = require('./parser').parser;
	var ast = require('./ast');
	// var vm = require 'vm'
	// require files needed to run imba
	// whole runtime - no?
	
	// should this really happen up here?
	
	// require '../imba/node'
	
	
	// setting up the actual compiler
	
	
	// Instantiate a Lexer for our use here.
	module.exports.lex = lex = new lexer.Lexer();
	
	// The real Lexer produces a generic stream of tokens. This object provides a
	// thin wrapper around it, compatible with the Jison API. We can then pass it
	// directly as a "Jison lexer".
	
	parser.lexer = {
		options: {
			ranges: true
		},
		
		lex: function (){
			var ary;
			var token = this.tokens[(this.pos)++];
			var ttag;
			
			if(token) {
				var ary=iter$(token);ttag = ary[(0)];this.yytext = ary[(1)];this.yylloc = ary[(2)];
				
				if(this.yylloc) {
					this.currloc = this.yylloc;
				} else {
					this.yylloc = this.currloc;
				};
				this.yylineno = this.yylloc && this.yylloc.first_line;
			} else {
				ttag = '';
			};
			
			return ttag;
		},
		
		setInput: function (tokens){
			this.tokens = tokens;
			return this.pos = 0;
		},
		
		upcomingInput: function (){
			return "";
		}
	};
	
	parser.yy = AST;// require './../nodes'
	
	function tokenize(code,o){
		if(o === undefined) o = {};
		try {
			// console.log("tokenize code",code)
			return lex.tokenize(code,o);
		}
		catch (err) {
			console.log("ERROR1",err);
			throw err;
		}
		;
	}; exports.tokenize = tokenize;
	
	
	function parse(code,o){
		try {
			// hmmm
			var tokens = (code instanceof Array) ? (code) : (tokenize(code));
			// console.log("Tokens",tokens)
			return parser.parse(tokens);
		}
		catch (err) {
			// console.log("ERROR",err)
			if(o.filename) {
				err.message = ("In " + (o.filename) + ", " + (err.message));
			};
			throw err;
		}
		;
	}; exports.parse = parse;
	
	
	function compile(code,o){
		if(o === undefined) o = {};
		try {
			var ast = parse(code,o);
			return ast.compile(o);
		}
		catch (err) {
			if(o.filename) {
				err.message = ("In " + (o.filename) + ", " + (err.message));
			};
			throw err;
		}
		;
	}; exports.compile = compile;


}())
},{"../imba":32,"./ast":13,"./lexer":25,"./parser":26}],25:[function(require,module,exports){
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
	
	// The Imba Lexer. Uses a series of token-matching regexes to attempt
	// matches against the beginning of the source code. When a match is found,
	// a token is produced, we consume the match, and start again. Tokens are in the
	// form:
	// #     [tokid, value, lineNumber]
	// # Which is a format that can be fed directly into [Jison](http://github.com/zaach/jison).
	
	// externs;
	
	ALLOW_HYPHENS_IN_IDENTIFIERS = true;
	CONVERT_HYPHENS_TO_CAMEL_CASE = true;
	
	var rw = require('./rewriter');
	var Rewriter = rw.Rewriter;
	INVERSES = rw.INVERSES;
	
	/* @class LexerError */
	function LexerError(message,file,line){
		this.message = message;
		this.file = file;
		this.line = line;
		return this;
	};
	
	subclass$(LexerError,SyntaxError);
	exports.LexerError = LexerError; // export class 
	
	
	
	// {Rewriter, INVERSES} = require './rewriter'
	
	// Import the helpers we need.
	// {starts, last} = require './helpers'
	
	function starts(string,literal,start){
		return string.substr(start,literal.length) == literal;
		// could rather write as string.indexOf(literal) == 0
	};
	
	function last(array,back){
		if(back === undefined) back = 0;
		return array[array.length - back - 1];
	};
	
	function count(str,substr){
		var num = 0;
		var pos = 0;
		if(!(substr.length)) {
			return 1 / 0;
		};
		
		while(pos = 1 + str.indexOf(substr,pos)){
			num++;
		};
		return num;
	};
	
	
	// The Lexer Class
	// ---------------
	
	// The Lexer class reads a stream of Imba and divvies it up into tokidged
	// tokens. Some potential ambiguity in the grammar has been avoided by
	// pushing some extra smarts into the Lexer.
	/* @class Lexer */
	function Lexer(){ };
	
	exports.Lexer = Lexer; // export class 
	Lexer.prototype.tokenize = function (code,o){
		var tok;
		if(o === undefined) o = {};
		if(WHITESPACE.test(code)) {
			code = ("\n" + code);
		};
		
		// this makes us lose the loc-info, no?
		code = code.replace(/\r/g,'').replace(TRAILING_SPACES,'');
		
		this._last = null;
		this._lastTyp = null;
		this._lastVal = null;
		
		this._code = code;// The remainder of the source code.
		this._opts = o;
		this._line = o.line || 0;// The current line.
		this._indent = 0;// The current indentation level.
		this._indebt = 0;// The over-indentation at the current level.
		this._outdebt = 0;// The under-outdentation at the current level.
		this._indents = [];// The stack of all current indentation levels.
		this._ends = [];// The stack for pairing up tokens.
		this._tokens = [];// Stream of parsed tokens in the form `['TYPE', value, line]`.
		this._char = null;
		this._locOffset = o.loc || 0;
		
		
		// console.log("options for parse",opts)
		
		// At every position, run through this list of attempted matches,
		// short-circuiting if any of them succeed. Their order determines precedence:
		// `@literalToken` is the fallback catch-all.
		
		if(o.profile) {
			console.time("tokenize:lexer");
		};
		
		var contexts = {
			TAG: this.tagContextToken
		};
		
		var fn = null;
		var i = 0;
		
		while(this._chunk = code.slice(i)){
			this._loc = this._locOffset + i;
			this._end = this._ends[this._ends.length - 1];
			var chr = this._char = this._chunk[0];
			// add context-specific parsing here?
			// var token = @tokens[@tokens:length - 1]
			fn = contexts[this._end];
			
			if(chr == '@') {
				i += this.identifierToken() || this.literalToken();
			} else {
				i += fn && fn.call(this) || this.basicContext();// selectorToken || symbolToken || methodNameToken || identifierToken || whitespaceToken || lineToken || commentToken || heredocToken || tagToken || stringToken || numberToken || regexToken || jsToken || literalToken
			};
		};
		
		this.closeIndentation();
		if(tok = this._ends.pop()) {
			this.error(("missing " + tok));
		};
		if(o.profile) {
			console.timeEnd("tokenize:lexer");
		};
		
		// compatibility
		this.tokens = this._tokens;
		
		if(o.rewrite == false || o.norewrite) {
			return this._tokens;
		};
		this._tokens;
		
		return new Rewriter().rewrite(this._tokens,o);
	};
	
	Lexer.prototype.basicContext = function (){
		return this.selectorToken() || this.symbolToken() || this.methodNameToken() || this.identifierToken() || this.whitespaceToken() || this.lineToken() || this.commentToken() || this.heredocToken() || this.tagToken() || this.stringToken() || this.numberToken() || this.regexToken() || this.jsToken() || this.literalToken();
	};
	
	
	Lexer.prototype.context = function (opt){
		var o;
		var i = this._ends.length - 1;
		return (opt) ? (
			o = this._ends["_" + i],// hmm?
			// console.log 'found options?',o,opt
			o && o[opt]
		) : (
			this._ends[i]
		);
	};
	
	Lexer.prototype.pushEnd = function (val){
		// console.log "pushing end",val
		this._ends.push(val);
		return this;
	};
	
	Lexer.prototype.scope = function (sym,opts){
		// need to rewrite the whole ends to not use characters
		var len = this._ends.push(sym);
		// console.log "scoping",sym,opts,@ends,len
		
		if(opts) {
			this._ends["_" + (len - 1)] = opts;
		};
		
		return sym;
	};
	
	Lexer.prototype.closeSelector = function (){
		return (this.context() == '%') && (this.pair('%'));
	};
	
	Lexer.prototype.openDef = function (){
		return this._ends.push('DEF');
	};
	
	Lexer.prototype.closeDef = function (){
		if(this.context() == 'DEF') {
			var prev = last(this._tokens);
			// console.log('closeDef with last>',prev)
			if(prev[0] == 'DEF_FRAGMENT') {
				true;
			} else {
				if(prev[0] == 'TERMINATOR') {
					var pop = this._tokens.pop();
				};
				
				this.token('DEF_BODY','DEF_BODY');
				if(pop) {
					this._tokens.push(pop);
				};
			};
			
			this.pair('DEF');
		};
		return;
	};
	
	
	
	// Tokenizers
	// ----------
	
	Lexer.prototype.tagContextToken = function (){
		var match;
		if(match = TAG_TYPE.exec(this._chunk)) {
			this.token('TAG_TYPE',match[0]);
			return match[0].length;
		};
		
		if(match = TAG_ID.exec(this._chunk)) {
			var input = match[0];
			this.token('TAG_ID',input);
			return input.length;
		};
		
		return 0;
	};
	
	
	Lexer.prototype.tagToken = function (){
		var match, ary;
		if(!(match = TAG.exec(this._chunk))) {
			return 0;
		};
		var ary=iter$(match);var input = ary[(0)],type = ary[(1)],identifier = ary[(2)];
		
		if(type == '<') {
			this.token('TAG_START','<');
			this._ends.push(INVERSES.TAG_START);
			
			if(identifier) {
				if(identifier.substr(0,1) == '{') {
					return type.length;
				} else {
					this.token('TAG_NAME',input.substr(1));
				};
			};
		};
		
		return input.length;
	};
	
	Lexer.prototype.selectorToken = function (){
		var ary, string;
		var match;
		
		// special handling if we are in this context
		if(this.context() == '%') {
			var chr = this._chunk.charAt(0);
			
			if(match = SELECTOR_COMBINATOR.exec(this._chunk)) {
				// console.log 'selector match', match
				if(this.context('open')) {
					// console.log 'should close the scope!!!'
					this.pair('%');
					return 0;
				};
				this.token('SELECTOR_COMBINATOR',match[1] || " ");
				return match[0].length;
			} else {
				if(match = SELECTOR_PART.exec(this._chunk)) {
					var type = match[1];
					var id = match[2];
					
					switch(type) {
						case '.':
							tokid = 'SELECTOR_CLASS';break;
						
						case '#':
							tokid = 'SELECTOR_ID';break;
						
						case ':':
							tokid = 'SELECTOR_PSEUDO_CLASS';break;
						
						case '::':
							tokid = 'SELECTOR_PSEUDO_CLASS';break;
						
						default:
						
							var tokid = 'SELECTOR_TAG';
					
					};
					
					this.token(tokid,match[2]);
					return match[0].length;
				} else {
					if(chr == '[') {
						this.token('[','[');
						this._ends.push(']');
						if(match = SELECTOR_ATTR.exec(this._chunk)) {
							this.token('IDENTIFIER',match[1]);
							this.token('SELECTOR_ATTR_OP',match[2]);
							return match[0].length;
						};
						return 1;
					} else {
						if(chr == '|') {
							var tok = this._tokens[this._tokens.length - 1];
							tok[0] = 'SELECTOR_NS';
							return 1;
						} else {
							if(chr == ',') {
								if(this.context('open')) {
									this.pair('%');
									return 0;
								};
								
								this.token('SELECTOR_GROUP',',');
								return 1;
							} else {
								if(chr == '*') {
									this.token('UNIVERSAL_SELECTOR','*');
									return 1;
								} else {
									if(idx$(chr,[')','}',']','']) >= 0) {
										this.pair('%');
										return 0;
									}
								}
							}
						}
					}
				}
			};
			
			// how to get out of the scope?
		};
		
		
		if(!(match = SELECTOR.exec(this._chunk))) {
			return 0;
		};
		var ary=iter$(match);var input = ary[(0)],id = ary[(1)],kind = ary[(2)];
		
		// this is a closed selector
		if(kind == '(') {
			this.token('(','(');
			this.token('SELECTOR_START',id);
			this._ends.push(')');
			this._ends.push('%');
			return id.length + 1;
		} else {
			if(id == '%') {
				// we are already scoped in on a selector
				if(this.context() == '%') {
					return 1;
				};
				this.token('SELECTOR_START',id);
				// get into the selector-scope
				this.scope('%',{open: true});
				// @ends.push '%'
				// make sure a terminator breaks out
				return id.length;
			} else {
				return 0;
			}
		};
		
		if(idx$(id,['%','$']) >= 0 && idx$(chr,['%','$','@','(','[']) >= 0) {
			var idx = 2;
			
			
			// VERY temporary way of solving this
			if(idx$(chr,['%','$','@']) >= 0) {
				id += chr;
				idx = 3;
				chr = this._chunk.charAt(2);
			};
			
			
			if(chr == '(') {
				if(!(string = this.balancedSelector(this._chunk,')'))) {
					return 0;
				};
				if(0 < string.indexOf('{',1)) {
					this.token('SELECTOR',id);
					this.interpolateSelector(string.slice(idx,-1));
					return string.length;
				} else {
					this.token('SELECTOR',id);
					this.token('(','(');
					this.token('STRING','"' + string.slice(idx,-1) + '"');
					this.token(')',')');
					return string.length;
				};
			} else {
				if(chr == '[') {
					this.token('SELECTOR',id);
					return 1;
					// token '[','['
					// @ends.push ''
				}
			};
		} else {
			return 0;
		};
	};
	
	// is this really needed? Should be possible to
	// parse the identifiers and = etc i jison?
	// what is special about methodNameToken? really?
	Lexer.prototype.methodNameToken = function (){
		if(this._char == ' ') {
			return 0;
		};
		
		var match;
		
		var outerctx = this._ends[this._ends.length - 2];
		var innerctx = this._ends[this._ends.length - 1];
		
		if(outerctx == '%' && innerctx == ')') {
			// console.log 'context is inside!!!'
			if(match = TAG_ATTR.exec(this._chunk)) {
				this.token('TAG_ATTR_SET',match[1]);
				return match[0].length;
			};
		};
		
		if(!(match = METHOD_IDENTIFIER.exec(this._chunk))) {
			return 0;
		};
		// var prev = last @tokens
		var length = match[0].length;
		
		var id = match[0];
		var typ = 'IDENTIFIER';
		var pre = id.substr(0,1);
		var space = false;
		
		if(!(idx$(this._lastTyp,['.','DEF']) >= 0 || idx$(match[4],['!','?']) >= 0 || match[5])) {
			return 0;
		};
		
		if(idx$(id.toUpperCase(),['SELF','THIS']) >= 0) {
			return 0;
		};
		
		if(id == 'super') {
			return 0;
		};
		
		if(id == 'new') {
			typ = 'NEW';
		};
		
		if(id == '...' && idx$(this._lastTyp,[',','(','CALL_START','BLOCK_PARAM_START','PARAM_START']) >= 0) {
			return 0;
		};
		
		if(id == '|') {
			// hacky way to implement this
			// with new lexer we'll use { ... } instead, and assume object-context,
			// then go back and correct when we see the context is invalid
			if(idx$(this._lastTyp,['(','CALL_START']) >= 0) {
				this.token('DO','DO');
				this._ends.push('|');
				this.token('BLOCK_PARAM_START',id);
				return length;
			} else {
				if(idx$(this._lastTyp,['DO','{']) >= 0) {
					this._ends.push('|');
					this.token('BLOCK_PARAM_START',id);
					return length;
				} else {
					if(this._ends[this._ends.length - 1] == '|') {
						this.token('BLOCK_PARAM_END','|');
						this.pair('|');
						return length;
					} else {
						return 0;
					}
				}
			};
		};
		
		// whaat?
		// console.log("method identifier",id)
		if((idx$(id,['&','^','<<','<<<','>>']) >= 0 || (id == '|' && this.context() != '|'))) {
			return 0;
		};
		
		if(idx$(id,OP_METHODS) >= 0) {
			space = true;
		};
		
		if(pre == '@') {
			typ = 'IVAR';
			id = new String(id);
			id.wrap = true;
		} else {
			if(pre == '$') {
				typ = 'GVAR';
			} else {
				if(pre == '#') {
					typ = 'TAGID';
				} else {
					if(CONST_IDENTIFIER.test(pre) || idx$(id,GLOBAL_IDENTIFIERS) >= 0) {
						// console.log('global!!',typ,id)
						typ = 'CONST';
					}
				}
			}
		};
		
		if(match[4] || match[5] || id == 'eval' || id == 'arguments' || idx$(id,JS_FORBIDDEN) >= 0) {
			// console.log('got here')
			id = new String(id);
			id.wrap = true;
		};
		
		if(match[5] && idx$(this._lastTyp,['IDENTIFIER','CONST','GVAR','CVAR','IVAR','SELF','THIS',']','}',')','NUMBER','STRING','IDREF']) >= 0) {
			this.token('.','.');
		};
		
		this.token(typ,id);
		
		if(space) {
			// console.log("add space here")
			last(this._tokens).spaced = true;
			// token ' ', ' '
		};
		
		return length;
	};
	
	
	Lexer.prototype.inTag = function (){
		var ctx1 = this._ends[this._ends.length - 2];
		var ctx0 = this._ends[this._ends.length - 1];
		return ctx0 == 'TAG_END' || (ctx1 == 'TAG_END' && ctx0 == 'OUTDENT');
	};
	
	// Matches identifying literals: variables, keywords, method names, etc.
	// Check to ensure that JavaScript reserved words aren't being used as
	// identifiers. Because Imba reserves a handful of keywords that are
	// allowed in JavaScript, we're careful not to tokid them as keywords when
	// referenced as property names here, so you can still do `jQuery.is()` even
	// though `is` means `===` otherwise.
	Lexer.prototype.identifierToken = function (){
		var ary;
		var match;
		
		var ctx1 = this._ends[this._ends.length - 2];
		var ctx0 = this._ends[this._ends.length - 1];
		var innerctx = ctx0;
		var typ;
		
		var addLoc = false;
		var inTag = ctx0 == 'TAG_END' || (ctx1 == 'TAG_END' && ctx0 == 'OUTDENT');
		
		// console.log ctx1,ctx0
		
		if(inTag && (match = TAG_ATTR.exec(this._chunk))) {
			// console.log 'TAG_ATTR IN tokid'
			// var prev = last @tokens
			// if the prev is a terminator, we dont really need to care?
			if(this._lastTyp != 'TAG_NAME') {// hmm - it will never be tokidname now?
				if(this._lastTyp == 'TERMINATOR') {
					// console.log('prev was terminator -- drop it?')
					true;
				} else {
					this.token(",",",");
				};
			};
			
			this.token('TAG_ATTR',match[1]);
			this.token('=','=');
			return match[0].length;
		};
		
		// see if this is a plain object-key
		// way too much logic going on here?
		// the ast should normalize whether keys
		// are accessable as keys or strings etc
		if(match = OBJECT_KEY.exec(this._chunk)) {
			var id = match[1];
			typ = 'IDENTIFIER';
			
			this.token(typ,id);
			this.token(':',':');
			
			return match[0].length;
		};
		
		if(!(match = IDENTIFIER.exec(this._chunk))) {
			return 0;
		};
		
		var ary=iter$(match);var input = ary[(0)],id = ary[(1)],typ = ary[(2)],m3 = ary[(3)],m4 = ary[(4)],colon = ary[(5)];
		
		// What is the logic here?
		if(id == 'own' && this.tokid() == 'FOR') {
			this.token('OWN',id);
			return id.length;
		};
		
		var prev = last(this._tokens);
		var lastTyp = this._lastTyp;
		// should we force this to be an identifier even if it is a reserved word?
		// this should only happen for when part of object etc
		// will prev ever be @???
		var forcedIdentifier;
		
		forcedIdentifier = colon || lastTyp == '.' || lastTyp == '?.';// in ['.', '?.'
		
		
		// temp hack! need to solve for other keywords etc as well
		// problem appears with ternary conditions.
		
		// well -- it should still be an indentifier if in object?
		// forcedIdentifier = no if id in ['undefined','break']
		
		if(colon && lastTyp == '?') {
			forcedIdentifier = false;
		};// for ternary
		
		// if we are not at the top level? -- hacky
		if(id == 'tag' && this._chunk.indexOf("tag(") == 0) {// @chunk.match(/^tokid\(/)
			forcedIdentifier = true;
		};
		
		// little reason to check for this right here? but I guess it is only a simple check
		if(typ == '$' && ARGVAR.test(id)) {// id.match(/^\$\d$/)
			if(id == '$0') {
				typ = 'ARGUMENTS';
			} else {
				typ = 'ARGVAR';
				id = id.substr(1);
			};
		} else {
			if(typ == '@') {
				typ = 'IVAR';
				id = new String(id);
				id.wrap = true;
				
				// id:reserved = yes if colon
			} else {
				if(typ == '#') {
					// we are trying to move to generic tokens,
					// so we are starting to splitting up the symbols and the items
					// we'll see if that works
					typ = 'IDENTIFIER';
					this.token('#','#');
					id = id.substr(1);
				} else {
					if(typ == '@@') {
						id = new String(id);
						id.wrap = true;
						typ = 'CVAR';
					} else {
						if(typ == '$' && !colon) {
							typ = 'GVAR';
						} else {
							if(CONST_IDENTIFIER.test(id) || idx$(id,GLOBAL_IDENTIFIERS) >= 0) {
								typ = 'CONST';
							} else {
								if(id == 'elif') {
									this.token('ELSE','else');
									this.token('IF','if');
									return id.length;
								} else {
									typ = 'IDENTIFIER';
								}
							}
						}
					}
				}
			}
		};
		
		if(!forcedIdentifier && (idx$(id,JS_KEYWORDS) >= 0 || idx$(id,IMBA_KEYWORDS) >= 0)) {
			typ = id.toUpperCase();
			addLoc = true;
			
			if(typ == 'TAG') {
				
				this._ends.push('TAG');
			};
			// FIXME @ends is not used the way it is supposed to..
			// what we want is a context-stack
			if(typ == 'DEF') {
				this.openDef();
			} else {
				if(typ == 'DO') {
					if(this.context() == 'DEF') {
						this.closeDef();
					};
				} else {
					if(typ == 'WHEN' && idx$(this.tokid(),LINE_BREAK) >= 0) {
						typ = 'LEADING_WHEN';
					} else {
						if(typ == 'FOR') {
							this._seenFor = true;
						} else {
							if(typ == 'UNLESS') {
								typ = 'IF';// WARN
							} else {
								if(idx$(typ,UNARY) >= 0) {
									typ = 'UNARY';
								} else {
									if(idx$(typ,RELATION) >= 0) {
										if(idx$(typ,['INSTANCEOF','ISA']) == -1 && this._seenFor) {
											typ = 'FOR' + typ;// ?
											this._seenFor = false;
										} else {
											typ = 'RELATION';
											if(this.value().toString() == '!') {
												this._tokens.pop();// is fucked up??!
												// WARN we need to keep the loc, no?
												id = '!' + id;
											};
										};
									}
								}
							}
						}
					}
				}
			};
		};
		
		if(id == 'super') {
			typ = 'SUPER';
		} else {
			if(id == 'eval' || id == 'arguments' || idx$(id,JS_FORBIDDEN) >= 0) {
				
				if(forcedIdentifier) {
					typ = 'IDENTIFIER';
					// console.log('got here')
					// wrapping strings do create problems
					// it might actually be better to append some special info
					// directly to the string -- and then parse that in the ast
					id = new String(id);
					id.reserved = true;
				} else {
					if(idx$(id,RESERVED) >= 0) {
						
						// if id in STRICT_RESERVED
						// 	error "reserved word \"{id}\"", id:length
						
						id = new String(id);
						id.reserved = true;
					}
				};
			}
		};
		
		if(!forcedIdentifier) {
			if(idx$(id,IMBA_ALIASES) >= 0) {
				id = IMBA_ALIAS_MAP[id];
			};
			switch(id) {
				case '√':
					typ = 'SQRT';break;
				
				case 'ƒ':
					typ = 'FUNC';break;
				
				case '!':
					typ = 'UNARY';break;
				
				case '==':
				case '!=':
				case '===':
				case '!==':
					typ = 'COMPARE';break;
				
				case '&&':
				case '||':
					typ = 'LOGIC';break;
				
				case '∪':
				case '∩':
					typ = 'MATH';break;
				
				case 'true':
				case 'false':
				case 'null':
				case 'nil':
				case 'undefined':
					typ = 'BOOL';break;
				
				case 'break':
				case 'continue':
				case 'debugger':
				case 'arguments':
					typ = id.toUpperCase();break;
			
			};
		};
		
		// prev = last @tokens
		var len = input.length;
		
		// should be strict about the order, check this manually instead
		if(typ == 'CLASS' || typ == 'DEF' || typ == 'TAG' || typ == 'VAR') {
			var i = this._tokens.length;
			// console.log("FOUND CLASS/DEF",i)
			while(i){
				var prev = this._tokens[--i];
				var ctrl = prev && ("" + prev[1]);
				// need to coerce to string because of stupid CS ===
				// console.log("prev is",prev[0],prev[1])
				if(idx$(ctrl,IMBA_CONTEXTUAL_KEYWORDS) >= 0) {
					prev[0] = ctrl.toUpperCase();// what?
				} else {
					break;
				};
			};
		};
		
		if(typ == 'IMPORT') {
			this._ends.push('IMPORT');
		} else {
			if(id == 'from' && ctx0 == 'IMPORT') {
				typ = 'FROM';
				this.pair('IMPORT');
			} else {
				if(id == 'as' && ctx0 == 'IMPORT') {
					typ = 'AS';
					this.pair('IMPORT');
				}
			}
		};
		
		if(typ == 'IDENTIFIER') {
			// see if previous was catch -- belongs in rewriter?
			if(lastTyp == 'CATCH') {
				typ = 'CATCH_VAR';
			};
			this.token(typ,id,len);// hmm
		} else {
			if(addLoc) {
				this.token(typ,id,len,true);
			} else {
				this.token(typ,id);
			}
		};
		
		if(colon) {
			this.token(':',':');
		};// _what_?
		return len;
	};
	
	// Matches numbers, including decimals, hex, and exponential notation.
	// Be careful not to interfere with ranges-in-progress.
	Lexer.prototype.numberToken = function (){
		var binaryLiteral;
		var match,number,lexedLength;
		
		if(!(match = NUMBER.exec(this._chunk))) {
			return 0;
		};
		
		number = match[0];
		lexedLength = number.length;
		
		if(binaryLiteral = /0b([01]+)/.exec(number)) {
			number = (parseInt(binaryLiteral[1],2)).toString();
		};
		
		var prev = last(this._tokens);
		
		if(match[0][0] == '.' && prev && !(prev.spaced) && idx$(prev[0],['IDENTIFIER',')','}',']','NUMBER']) >= 0) {
			// console.log('FIX NUM')
			this.token(".",".");
			number = number.substr(1);
		};
		
		this.token('NUMBER',number);
		return lexedLength;
	};
	
	Lexer.prototype.symbolToken = function (){
		var match,symbol,prev;
		
		if(!(match = SYMBOL.exec(this._chunk))) {
			return 0;
		};
		symbol = match[0].substr(1);
		prev = last(this._tokens);
		
		// is this a property-access?
		// should invert this -- only allow when prev IS .. 
		// hmm, symbols not be quoted initially
		// : should be a token itself, with a specification of spacing (LR,R,L,NONE)
		if(prev && !(prev.spaced) && idx$(prev[0],['(','{','[','.','RAW_INDEX_START','CALL_START','INDEX_START',',','=','INDENT','TERMINATOR']) == -1) {
			this.token('.','.');
			symbol = symbol.split(/[\:\\\/]/)[0];// really?
			// token 'SYMBOL', "'#{symbol}'"
			this.token('SYMBOL',symbol);
			return symbol.length + 1;
		} else {
			// token 'SYMBOL', "'#{symbol}'"
			this.token('SYMBOL',symbol);
			return match[0].length;
		};
	};
	
	// Matches strings, including multi-line strings. Ensures that quotation marks
	// are balanced within the string's contents, and within nested interpolations.
	Lexer.prototype.stringToken = function (){
		var match,string;
		
		switch(this._chunk.charAt(0)) {
			case "'":
				if(!(match = SIMPLESTR.exec(this._chunk))) {
					return 0;
				};
				this.token('STRING',(string = match[0]).replace(MULTILINER,'\\\n'));
				break;
			
			case '"':
				if(!(string = this.balancedString(this._chunk,'"'))) {
					return 0;
				};
				if(string.indexOf('{') >= 0) {
					this.interpolateString(string.slice(1,-1));
				} else {
					this.token('STRING',this.escapeLines(string));
				};
				break;
			
			default:
			
				return 0;
		
		};
		this._line += count(string,'\n');
		
		return string.length;
	};
	
	// Matches heredocs, adjusting indentation to the correct level, as heredocs
	// preserve whitespace, but ignore indentation to the left.
	Lexer.prototype.heredocToken = function (){
		var match,heredoc,quote,doc;
		
		if(!(match = HEREDOC.exec(this._chunk))) {
			return 0;
		};
		
		heredoc = match[0];
		quote = heredoc.charAt(0);
		doc = this.sanitizeHeredoc(match[2],{quote: quote,indent: null});
		
		if(quote == '"' && 0 <= doc.indexOf('{')) {
			this.interpolateString(doc,{heredoc: true});
		} else {
			this.token('STRING',this.makeString(doc,quote,true));
		};
		
		this._line += count(heredoc,'\n');
		
		return heredoc.length;
	};
	
	// Matches and consumes comments.
	Lexer.prototype.commentToken = function (){
		var match,length,comment,indent,prev;
		
		var typ = 'HERECOMMENT';
		
		if(match = this._chunk.match(INLINE_COMMENT)) {
			length = match[0].length;
			comment = match[2];
			indent = match[1];
			// console.log "match inline token (#{indent}) indent",comment,@indent,indent:length
			// ADD / FIX INDENTATION? 
			prev = last(this._tokens);
			var pt = prev && prev[0];
			var note = '// ' + comment.substr(2);
			
			if(pt && idx$(pt,['INDENT','TERMINATOR']) == -1) {
				// console.log "skip comment"
				// token 'INLINECOMMENT', comment.substr(2)
				this.token('TERMINATOR',note);// + '\n' # hmmm // hmmm
				// not sure about this
				return length;
			} else {
				if(pt == 'TERMINATOR') {
					prev[1] += note;
				} else {
					if(pt == 'INDENT') {
						this.addLinebreaks(1,note);
					} else {
						// console.log "comment here"
						this.token(typ,comment.substr(2));// are we sure?
					}
				};
				// addLinebreaks(5)
				false;
				// maybe add a linebreak here?
				// addLinebreaks(0)
				// token 'TERMINATOR', '\\n' # hmm
			};
			
			return length;// disable now while compiling
		};
		
		// should use exec?
		if(!(match = this._chunk.match(COMMENT))) {
			return 0;
		};
		
		comment = match[0];
		var here = match[1];
		
		if(here) {
			this.token('HERECOMMENT',this.sanitizeHeredoc(here,{herecomment: true,indent: Array(this._indent + 1).join(' ')}));
			this.token('TERMINATOR','\n');
		} else {
			// console.log "FOUND COMMENT",comment
			this.token('HERECOMMENT',comment);
			this.token('TERMINATOR','\n');
		};
		
		this._line += count(comment,'\n');
		
		return comment.length;
	};
	
	// Matches JavaScript interpolated directly into the source via backticks.
	Lexer.prototype.jsToken = function (){
		var match,script;
		
		if(!(this._chunk.charAt(0) == '`' && (match = JSTOKEN.exec(this._chunk)))) {
			return 0;
		};
		this.token('JS',(script = match[0]).slice(1,-1));
		return script.length;
	};
	
	// Matches regular expression literals. Lexing regular expressions is difficult
	// to distinguish from division, so we borrow some basic heuristics from
	// JavaScript and Ruby.
	Lexer.prototype.regexToken = function (){
		var ary;
		var match,length,prev;
		
		if(this._chunk.charAt(0) != '/') {
			return 0;
		};
		if(match = HEREGEX.exec(this._chunk)) {
			length = this.heregexToken(match);
			this._line += count(match[0],'\n');
			return length;
		};
		
		prev = last(this._tokens);
		if(prev && (idx$(prev[0],((prev.spaced) ? (
			NOT_REGEX
		) : (
			NOT_SPACED_REGEX
		))) >= 0)) {
			return 0;
		};
		if(!(match = REGEX.exec(this._chunk))) {
			return 0;
		};
		var ary=iter$(match);var m = ary[(0)],regex = ary[(1)],flags = ary[(2)];
		
		// FIXME
		// if regex[..1] is '/*'
		// error 'regular expressions cannot begin with `*`'
		
		if(regex == '//') {
			regex = '/(?:)/';
		};
		
		this.token('REGEX',("" + regex + flags));
		return m.length;
	};
	
	// Matches multiline extended regular expressions.
	Lexer.prototype.heregexToken = function (match){
		var ary;
		var ary=iter$(match);var heregex = ary[(0)],body = ary[(1)],flags = ary[(2)];
		
		if(0 > body.indexOf('#{')) {
			
			var re = body.replace(HEREGEX_OMIT,'').replace(/\//g,'\\/');
			
			if(re.match(/^\*/)) {
				this.error('regular expressions cannot begin with `*`');
			};
			
			this.token('REGEX',("/" + (re || '(?:)'
			) + "/" + flags));
			return heregex.length;
		};
		
		this.token('CONST','RegExp');
		this._tokens.push(['CALL_START','(']);
		var tokens = [];
		
		for(var i=0, items=iter$(this.interpolateString(body,{regex: true})), len=items.length, pair; i < len; i++) {
			pair = items[i];var tokid = pair[0];
			var value = pair[1];
			
			if(tokid == 'TOKENS') {
				// FIXME what is this?
				tokens.push.apply(tokens,value);
			} else {
				if(!(value = value.replace(HEREGEX_OMIT,''))) {
					continue;
				};
				
				value = value.replace(/\\/g,'\\\\');
				tokens.push(['STRING',this.makeString(value,'"',true)]);
			};
			tokens.push(['+','+']);
		};
		
		tokens.pop();
		
		if(!(tokens[0] && tokens[0][0] == 'STRING')) {
			this._tokens.push(['STRING','""'],['+','+']);
		};
		
		this._tokens.push.apply(this._tokens,tokens);// what is this?
		if(flags) {
			this._tokens.push([',',','],['STRING','"' + flags + '"']);
		};
		this.token(')',')');
		
		return heregex.length;
	};
	
	// Matches newlines, indents, and outdents, and determines which is which.
	// If we can detect that the current line is continued onto the the next line,
	// then the newline is suppressed:
	// 	#     elements
	//       .each( ... )
	//       .map( ... )
	// 	# Keeps track of the level of indentation, because a single outdent token
	// can close multiple indents, so we need to know how far in we happen to be.
	Lexer.prototype.lineToken = function (){
		var match;
		
		if(!(match = MULTI_DENT.exec(this._chunk))) {
			return 0;
		};
		
		if(this._ends[this._ends.length - 1] == '%') {
			this.pair('%');
		};
		
		var indent = match[0];
		var brCount = count(indent,'\n');
		
		this._line += brCount;
		this._seenFor = false;
		
		var prev = last(this._tokens,1);
		var size = indent.length - 1 - indent.lastIndexOf('\n');
		var noNewlines = this.unfinished();
		
		// console.log "noNewlines",noNewlines
		// console.log "lineToken -- ",@chunk.substr(0,10),"--"
		if(this._chunk.match(/^\n#\s/)) {
			//  console.log "comment on outermost line"
			// token 'TERMINATOR','\\n'
			this.addLinebreaks(1);
			// console.log "add terminator"
			return 0;
		};
		
		if(size - this._indebt == this._indent) {
			if(noNewlines) {
				this.suppressNewlines();
			} else {
				this.newlineToken(indent);
			};
			return indent.length;
		};
		
		if(size > this._indent) {
			if(noNewlines) {
				this._indebt = size - this._indent;
				this.suppressNewlines();
				return indent.length;
			};
			
			if(this.inTag()) {
				// console.log "indent inside tokid?!?"
				// @indebt = size - @indent
				// suppressNewlines()
				return indent.length;
			};
			
			
			var diff = size - this._indent + this._outdebt;
			this.closeDef();
			
			var immediate = last(this._tokens);
			
			if(immediate && immediate[0] == 'TERMINATOR') {
				// console.log "terminator before indent??"
				var node = new Number(diff);
				node.pre = immediate[1];
				immediate[0] = 'INDENT';
				immediate[1] = node;// {count: diff, pre: immediate[0]}
			} else {
				this.token('INDENT',diff);
			};
			
			// console.log "indenting", prev, last(@tokens,1)
			// if prev and prev[0] == 'TERMINATOR'
			//   console.log "terminator before indent??"
			
			// check for comments as well ?
			
			this._indents.push(diff);
			this._ends.push('OUTDENT');
			this._outdebt = this._indebt = 0;
			this.addLinebreaks(brCount);
		} else {
			this._indebt = 0;
			this.outdentToken(this._indent - size,noNewlines,brCount);
			this.addLinebreaks(brCount - 1);
			// console.log "outdent",noNewlines,tokid()
		};
		
		this._indent = size;
		return indent.length;
	};
	
	// Record an outdent token or multiple tokens, if we happen to be moving back
	// inwards past several recorded indents.
	Lexer.prototype.outdentToken = function (moveOut,noNewlines,newlineCount){
		var dent = 0;
		while(moveOut > 0){
			var len = this._indents.length - 1;
			if(this._indents[len] == undefined) {
				moveOut = 0;
			} else {
				if(this._indents[len] == this._outdebt) {
					moveOut -= this._outdebt;
					this._outdebt = 0;
				} else {
					if(this._indents[len] < this._outdebt) {
						this._outdebt -= this._indents[len];
						moveOut -= this._indents[len];
					} else {
						dent = this._indents.pop() - this._outdebt;
						moveOut -= dent;
						this._outdebt = 0;
						
						if(!noNewlines) {
							this.addLinebreaks(1);
						};// hmm
						
						this.pair('OUTDENT');
						this.token('OUTDENT',dent);
					}
				}
			};
		};
		
		if(dent) {
			this._outdebt -= moveOut;
		};
		while(this.value() == ';'){
			this._tokens.pop();
		};
		// console.log "outdenting",tokid() 
		
		// addLinebreaks(1) unless noNewlines
		// really?
		if(!(this.tokid() == 'TERMINATOR' || noNewlines)) {
			this.token('TERMINATOR','\n');
		};
		
		
		var ctx = this.context();
		if(idx$(ctx,['%','TAG']) >= 0) {
			this.pair(ctx);
		};
		this.closeDef();
		return this;
	};
	
	// Matches and consumes non-meaningful whitespace. tokid the previous token
	// as being "spaced", because there are some cases where it makes a difference.
	Lexer.prototype.whitespaceToken = function (){
		var match,nline,prev;
		if(!((match = WHITESPACE.exec(this._chunk)) || (nline = this._chunk.charAt(0) == '\n'))) {
			return 0;
		};
		prev = last(this._tokens);
		
		// console.log('whitespace?',match,nline,prev && prev[0])
		// if nline
		//  console.log('whitespace newline',prev)
		// else
		
		// PERF
		if(prev) {
			prev[(match) ? ('spaced') : ('newLine')] = true;
		};
		return (match) ? (match[0].length) : (0);
	};
	
	Lexer.prototype.addNewline = function (){
		return this.token('TERMINATOR','\n');
	};
	
	Lexer.prototype.addLinebreaks = function (count,raw){
		var prev,br;
		
		if(!raw && count == 0) {
			return this;
		};// no terminators?
		
		prev = last(this._tokens);
		br = new Array(count + 1).join('\n');
		
		if(prev && prev[0] == 'INDENT') {
			if(typeof prev[1] == 'object') {// hmmm
				// console.log 'add to indent directly'
				prev[1].post = (prev[1].post || "") + (raw || br);
				// console.log "adding terminator after indent"
			} else {
				prev[1] = ("" + (prev[1]) + "_" + count);// br
			};
			return this;
		};
		
		if(prev && prev[0] == 'TERMINATOR') {
			// console.log "already exists terminator"
			prev[1] = prev[1] + br;
			return this;
		};
		
		this.token('TERMINATOR',br);
		return this;
	};
	
	// Generate a newline token. Consecutive newlines get merged together.
	Lexer.prototype.newlineToken = function (chunk){
		// console.log "newlineToken"
		while(this.value() == ';'){
			this._tokens.pop();
		};// hmm
		var prev = last(this._tokens);
		
		// console.log "newline token"
		
		// if prev and prev[0] is 'TERMINATOR'
		//   console.log('multiple newlines?')
		// console.log('newline',tokid())
		// console.log('newline!')
		var t = this.tokid();
		// arr = ['\\n']
		
		// i = 0
		// arr.push('\\n') until (++i) == lines
		var lines = count(chunk,'\n');
		
		this.addLinebreaks(lines);
		
		// if false
		//   unless t is 'TERMINATOR'
		//     token 'TERMINATOR', arr.join("") 
		//   else
		//     console.log "already a terminator!!"
		
		// pair('%') if context is '%'
		// pair('%') if context is '%'
		var ctx = this.context();
		// Ghost?
		// WARN now import cannot go over multiple lines
		if(idx$(ctx,['%','TAG','IMPORT']) >= 0) {
			this.pair(ctx);
		};
		
		this.closeDef();
		
		return this;
	};
	
	// Use a `\` at a line-ending to suppress the newline.
	// The slash is removed here once its job is done.
	Lexer.prototype.suppressNewlines = function (){
		if(this.value() == '\\') {
			this._tokens.pop();
		};
		return this;
	};
	
	// We treat all other single characters as a token. E.g.: `( ) , . !`
	// Multi-character operators are also literal tokens, so that Jison can assign
	// the proper order of operations. There are some symbols that we tokid specially
	// here. `;` and newlines are both treated as a `TERMINATOR`, we distinguish
	// parentheses that indicate a method call from regular parentheses, and so on.
	Lexer.prototype.literalToken = function (){
		var match,value;
		if(match = OPERATOR.exec(this._chunk)) {
			value = match[0];
			if(CODE.test(value)) {
				this.tagParameters();
			};
		} else {
			value = this._chunk.charAt(0);
		};
		
		var end1 = this._ends[this._ends.length - 1];
		var end2 = this._ends[this._ends.length - 2];
		
		var inTag = end1 == 'TAG_END' || end1 == 'OUTDENT' && end2 == 'TAG_END';
		
		var tokid = value;
		var prev = last(this._tokens);
		var length = value.length;
		
		// is this needed?
		if(value == '=' && prev) {
			
			if(!(prev[1].reserved) && idx$(prev[1],JS_FORBIDDEN) >= 0) {
				this._error(("reserved word \"#" + (value()) + "\" can't be assigned"));
			};
			
			if(idx$(prev[1],['||','&&']) >= 0) {
				prev[0] = 'COMPOUND_ASSIGN';
				prev[1] += '=';
				return value.length;
			};
		};
		
		if(value == ';') {
			this._seenFor = false;
			tokid = 'TERMINATOR';
		} else {
			if(value == '(' && inTag && prev[0] != '=' && prev.spaced) {
				// console.log 'spaced before ( in tokid'
				// FIXME - should rather add a special token like TAG_PARAMS_START
				this.token(',',',');
			} else {
				if(value == '->' && inTag) {
					tokid = 'TAG_END';
					this.pair('TAG_END');
				} else {
					if(value == '/>' && inTag) {
						tokid = 'TAG_END';
						this.pair('TAG_END');
					} else {
						if(value == '>' && inTag) {
							tokid = 'TAG_END';
							this.pair('TAG_END');
						} else {
							if(value == '>' && this.context() == 'DEF') {
								// console.log('picked up >!!')
								tokid = 'DEF_FRAGMENT';
							} else {
								if(value == 'TERMINATOR' && end1 == '%') {
									this.closeSelector();
								} else {
									if(value == 'TERMINATOR' && end1 == 'DEF') {
										this.closeDef();
									} else {
										if(value == '&' && this.context() == 'DEF') {
											// console.log("okay!")
											tokid = 'BLOCK_ARG';
											// change the next identifier instead?
										} else {
											if(value == '*' && this._chunk.charAt(1).match(/[A-Za-z\_\@\[]/) && (prev.spaced || idx$(prev[1],[',','(','[','{','|','\n','\t']) >= 0)) {
												tokid = "SPLAT";
											} else {
												if(value == '√') {
													tokid = 'SQRT';
												} else {
													if(value == 'ƒ') {
														tokid = 'FUNC';
													} else {
														if(idx$(value,MATH) >= 0) {
															tokid = 'MATH';
														} else {
															if(idx$(value,COMPARE) >= 0) {
																tokid = 'COMPARE';
															} else {
																if(idx$(value,COMPOUND_ASSIGN) >= 0) {
																	tokid = 'COMPOUND_ASSIGN';
																} else {
																	if(idx$(value,UNARY) >= 0) {
																		tokid = 'UNARY';
																	} else {
																		if(idx$(value,SHIFT) >= 0) {
																			tokid = 'SHIFT';
																		} else {
																			if(idx$(value,LOGIC) >= 0) {
																				tokid = 'LOGIC';// or value is '?' and prev?:spaced 
																			} else {
																				if(prev && !(prev.spaced)) {
																					// need a better way to do these
																					if(value == '(' && end1 == '%') {
																						tokid = 'TAG_ATTRS_START';
																					} else {
																						if(value == '(' && idx$(prev[0],CALLABLE) >= 0) {
																							// not using this ???
																							// prev[0] = 'FUNC_EXIST' if prev[0] is '?'
																							tokid = 'CALL_START';
																						} else {
																							if(value == '[' && idx$(prev[0],INDEXABLE) >= 0) {
																								tokid = 'INDEX_START';
																								if(prev[0] == '?') {
																									prev[0] = 'INDEX_SOAK';
																								};
																							} else {
																								if(value == '{' && idx$(prev[0],INDEXABLE) >= 0) {
																									tokid = 'RAW_INDEX_START';
																								}
																							}
																						}
																					};
																				}
																			}
																		}
																	}
																}
															}
														}
													}
												}
											}
										}
									}
								}
							}
						}
					}
				}
			}
		};
		
		switch(value) {
			case '(':
			case '{':
			case '[':
				this._ends.push(INVERSES[value]);break;
			
			case ')':
			case '}':
			case ']':
				this.pair(value);break;
		
		};
		
		// hacky rule to try to allow for tuple-assignments in blocks
		// if value is ',' and prev[0] is 'IDENTIFIER' and @tokens[@tokens:length - 2][0] in ['TERMINATOR','INDENT']
		//   # token "TUPLE", "tuple" # should rather insert it somewhere else, no?
		//   console.log("found comma")
		
		this.token(tokid,value);
		return value.length;
	};
	
	// Token Manipulators
	// ------------------
	
	// Sanitize a heredoc or herecomment by
	// erasing all external indentation on the left-hand side.
	Lexer.prototype.sanitizeHeredoc = function (doc,options){
		var match;
		var indent = options.indent;
		var herecomment = options.herecomment;
		
		if(herecomment) {
			if(HEREDOC_ILLEGAL.test(doc)) {
				this.error("block comment cannot contain \"*/\", starting");
			};
			if(doc.indexOf('\n') <= 0) {
				return doc;
			};
		} else {
			var length_;
			while(match = HEREDOC_INDENT.exec(doc)){
				var attempt = match[1];
				if(indent == null || 0 < (length_=attempt.length) && length_ < indent.length) {
					indent = attempt;
				};
			};
		};
		
		if(indent) {
			doc = doc.replace(RegExp("\\n" + indent,"g"),'\n');
		};
		if(!herecomment) {
			doc = doc.replace(/^\n/,'');
		};
		return doc;
	};
	
	// A source of ambiguity in our grammar used to be parameter lists in function
	// definitions versus argument lists in function calls. Walk backwards, tokidging
	// parameters specially in order to make things easier for the parser.
	Lexer.prototype.tagParameters = function (){
		if(this.tokid() != ')') {
			return this;
		};
		var stack = [];
		var tokens = this._tokens;
		var i = tokens.length;
		
		tokens[--i][0] = 'PARAM_END';
		
		var tok;
		while(tok = tokens[--i]){
			switch(tok[0]) {
				case ')':
					stack.push(tok);
					break;
				
				case '(':
				case 'CALL_START':
					if(stack.length) {
						stack.pop();
					} else {
						if(tok[0] == '(') {
							tok[0] = 'PARAM_START';
							return this;
						} else {
							return this;
						}
					};
					break;
			
			};
		};
		
		return this;
	};
	
	// Close up all remaining open blocks at the end of the file.
	Lexer.prototype.closeIndentation = function (){
		// ctx = context
		// pair(ctx) if ctx in ['%','DEF']
		this.closeDef();
		this.closeSelector();
		return this.outdentToken(this._indent);
	};
	
	// Matches a balanced group such as a single or double-quoted string. Pass in
	// a series of delimiters, all of which must be nested correctly within the
	// contents of the string. This method allows us to have strings within
	// interpolations within strings, ad infinitum.
	Lexer.prototype.balancedString = function (str,end){
		var match,letter,prev;
		
		// console.log 'balancing string!', str, end
		var stack = [end];
		var i = 0;
		
		
		// had to fix issue after later versions of coffee-script broke old loop type
		// should submit bugreport to coffee-script
		while(i < (str.length - 1)){
			i++;
			var letter = str.charAt(i);
			switch(letter) {
				case '\\':
					i++;
					continue;
					break;
				
				case end:
					stack.pop();
					if(!(stack.length)) {
						var v = str.slice(0,i + 1);
						return v;
					};
					end = stack[stack.length - 1];
					continue;
					break;
			
			};
			
			
			if(end == '}' && idx$(letter,['"',"'"]) >= 0) {
				stack.push(end = letter);
			} else {
				if(end == '}' && letter == '/' && (match = (HEREGEX.exec(str.slice(i)) || REGEX.exec(str.slice(i))))) {
					i += match[0].length - 1;
				} else {
					if(end == '}' && letter == '{') {
						stack.push(end = '}');
					} else {
						if(end == '"' && letter == '{') {
							stack.push(end = '}');
						}
					}
				}
			};
			prev = letter;
		};
		
		return this.error(("missing " + (stack.pop()
		) + ", starting"));
	};
	
	// Expand variables and expressions inside double-quoted strings using
	// Ruby-like notation for substitution of arbitrary expressions.
	// 	#     "Hello #{name.capitalize()}."
	// 	# If it encounters an interpolation, this method will recursively create a
	// new Lexer, tokenize the interpolated contents, and merge them into the
	// token stream.
	Lexer.prototype.interpolateString = function (str,options){
		
		var interpolated;
		if(options === undefined) options = {};
		var heredoc = options.heredoc;
		var regex = options.regex;
		var prefix = options.prefix;
		
		
		var tokens = [];
		var pi = 0;
		var i = -1;
		
		var letter;
		var expr;
		
		var len;
		while(letter = str.charAt(i += 1)){
			if(letter == '\\') {
				i += 1;
				continue;
			};
			if(!(str.charAt(i) == '{' && (expr = this.balancedString(str.slice(i),'}')))) {
				continue;
			};
			
			if(pi < i) {
				tokens.push(['NEOSTRING',str.slice(pi,i)]);
			};
			var inner = expr.slice(1,-1);
			// console.log 'inner is',inner
			
			if(inner.length) {
				// we need to remember the loc we start at
				// console.log('interpolate from loc',@loc,i)
				var nested = new Lexer().tokenize(inner,{line: this._line,rewrite: false,loc: this._loc + i + 2});
				nested.pop();
				
				if(nested[0] && nested[0][0] == 'TERMINATOR') {
					nested.shift();
				};
				
				if(len = nested.length) {
					if(len > 1) {
						nested.unshift(['(','(']);
						nested.push([')',')']);
					};
					tokens.push(['TOKENS',nested]);
				};
			};
			i += expr.length - 1;
			pi = i + 1;
		};
		
		if(i > pi && pi < str.length) {
			tokens.push(['NEOSTRING',str.slice(pi)]);
		};
		
		if(regex) {
			return tokens;
		};
		
		if(!(tokens.length)) {
			return this.token('STRING','""');
		};
		
		if(!(tokens[0][0] == 'NEOSTRING')) {
			tokens.unshift(['','']);
		};
		
		if(interpolated = tokens.length > 1) {
			this.token('(','(');
		};
		
		for(var k=0, ary=iter$(tokens), len=ary.length, v; k < len; k++) {
			v = ary[k];var typ = v[0];
			var value = v[1];
			
			if(k) {
				this.token('+','+');
			};
			
			if(typ == 'TOKENS') {
				this._tokens.push.apply(this._tokens,value);
			} else {
				this.token('STRING',this.makeString(value,'"',heredoc));
			};
		};
		
		if(interpolated) {
			this.token(')',')');
		};
		return tokens;
	};
	
	// Matches a balanced group such as a single or double-quoted string. Pass in
	// a series of delimiters, all of which must be nested correctly within the
	// contents of the string. This method allows us to have strings within
	// interpolations within strings, ad infinitum.
	Lexer.prototype.balancedSelector = function (str,end){
		var prev;
		var letter;
		var stack = [end];
		// FIXME
		for(var len=str.length, i=1; i < len; i++) {
			switch(letter = str.charAt(i)) {
				case '\\':
					i++;
					continue;
					break;
				
				case end:
					stack.pop();
					if(!(stack.length)) {
						return str.slice(0,i + 1);
					};
					
					end = stack[stack.length - 1];
					continue;
					break;
			
			};
			if(end == '}' && letter == [')']) {
				stack.push(end = letter);
			} else {
				if(end == '}' && letter == '{') {
					stack.push(end = '}');
				} else {
					if(end == ')' && letter == '{') {
						stack.push(end = '}');
					}
				}
			};
			prev = letter;// what, why?
		};
		
		return this.error(("missing " + (stack.pop()
		) + ", starting"));
	};
	
	// Expand variables and expressions inside double-quoted strings using
	// Ruby-like notation for substitution of arbitrary expressions.
	// 	#     "Hello #{name.capitalize()}."
	// 	# If it encounters an interpolation, this method will recursively create a
	// new Lexer, tokenize the interpolated contents, and merge them into the
	// token stream.
	Lexer.prototype.interpolateSelector = function (str,options){
		
		var interpolated;
		if(options === undefined) options = {};
		var heredoc = options.heredoc;
		var regex = options.regex;
		var prefix = options.prefix;
		
		var tokens = [];
		var pi = 0;
		var i = -1;
		
		var letter,expr,nested;
		
		var len;
		while(letter = str.charAt(i += 1)){
			if(!(letter == '{' && (expr = this.balancedSelector(str.slice(i),'}')))) {
				continue;
			};
			
			if(pi < i) {
				tokens.push(['NEOSTRING',str.slice(pi,i)]);
			};
			var inner = expr.slice(1,-1);
			
			if(inner.length) {
				nested = new Lexer().tokenize(inner,{line: this._line,rewrite: false});
				nested.pop();
				if(nested[0] && nested[0][0] == 'TERMINATOR') {
					nested.shift();
				};
				
				if(len = nested.length) {
					if(len > 1) {
						nested.unshift(['(','(']);
						nested.push([')',')']);
					};
					tokens.push(['TOKENS',nested]);
				};
			};
			i += expr.length - 1;
			pi = i + 1;
		};
		
		if(i > pi && pi < str.length) {
			tokens.push(['NEOSTRING',str.slice(pi)]);
		};
		if(regex) {
			return tokens;
		};
		if(!(tokens.length)) {
			return this.token('STRING','""');
		};
		
		if(!(tokens[0][0] == 'NEOSTRING')) {
			tokens.unshift(['','']);
		};
		if(interpolated = tokens.length > 1) {
			this.token('(','(');
		};
		
		for(var i1=0, ary=iter$(tokens), len=ary.length, v; i1 < len; i1++) {
			v = ary[i1];var tokid = v[0];
			var value = v[1];
			
			if(i) {
				this.token(',',',');
			};
			
			if(tokid == 'TOKENS') {
				this._tokens.push.apply(this._tokens,value);
			} else {
				this.token('STRING',this.makeString(value,'"',heredoc));
			};
		};
		if(interpolated) {
			this.token(')',')');
		};
		return tokens;
	};
	
	// Pairs up a closing token, ensuring that all listed pairs of tokens are
	// correctly balanced throughout the course of the token stream.
	Lexer.prototype.pair = function (tokid){
		var wanted = last(this._ends);
		if(!(tokid == wanted)) {
			if(!('OUTDENT' == wanted)) {
				this.error(("unmatched " + tokid));
			};
			// Auto-close INDENT to support syntax like this:
			// 			#     el.click((event) ->
			//       el.hide())
			// 			var size = last(@indents)
			this._indent -= this.size();
			this.outdentToken(this.size(),true);
			return this.pair(tokid);
		};
		// FIXME move into endSelector
		if(tokid == '%') {
			this.token('SELECTOR_END','%');
		};
		
		// remove possible options for context. hack
		// console.log "pairing tokid",tokid,@ends:length - 1,@ends["_" + (@ends:length - 1)]
		this._ends["_" + (this._ends.length - 1)] = undefined;
		return this._ends.pop();
	};
	
	// Helpers
	// -------
	
	// Add a token to the results, taking note of the line number.
	Lexer.prototype.token = function (id,value,len,addLoc){
		// console.log(@line)
		var loc = {first_line: this._line,first_column: 2,last_line: this._line,last_column: 2,range: [this._loc,1000]};
		
		// if len and addLoc
		//   # console.log('addLoc',value)
		//   if typeof value == 'string'
		//     value = value + "$#{@loc}$$#{len}"
		//   else
		//     value:_region = [@loc, @loc + len]
		
		if(len && addLoc) {
			// console.log('no loc')
			true;
		} else {
			if(len) {
				// value = value + "_" + len
				// POC - not optimized at all
				// Might be better to just use jison for this
				if(typeof value == 'string') {
					value = new String(value);// are we so sure about this?
				};
				value._region = [this._loc,this._loc + len];
			}
		};
		
		if(id == 'INDENT' || id == 'OUTDENT') {
			// console.log(value)
			value = new Number(value);// real
			value._region = [this._loc,this._loc];
		};
		// loc = {range: [10,1000]}
		
		this._lastTyp = id;
		this._lastVal = value;
		this._last = [id,value,loc];
		return this._tokens.push(this._last);
	};
	
	
	// Peek at a tokid in the current token stream.
	Lexer.prototype.tokid = function (index,tokid){
		var tok;
		return (tok = last(this._tokens,index)) ? (
			(tokid) && (tok[0] = tokid),// why?
			tok[0]
		) : (
			null
		);
	};
	
	// Peek at a value in the current token stream.
	Lexer.prototype.value = function (index,val){
		var tok;
		return (tok = last(this._tokens,index)) ? (
			(val) && (tok[1] = val),// why?
			tok[1]
		) : (
			null
		);
	};
	
	
	// Are we in the midst of an unfinished expression?
	Lexer.prototype.unfinished = function (){
		// only if indented -- possibly not even
		// console.log("is unfinished?!?",tokid());
		if(LINE_CONTINUER.test(this._chunk)) {
			return true;
		};
		
		// no, no, no -- should never be possible to continue a statement without an indent
		// return false
		// this is _really_ messy.. it should possibly work if there is indentation after the initial
		// part of this, but not for the regular cases. Still, removing it breaks too much stuff.
		// Fix when we replace the lexer and rewriter
		// return false
		var tokens = ['\\','.','?.','UNARY','MATH','+','-','SHIFT','RELATION','COMPARE','LOGIC','COMPOUND_ASSIGN','THROW','EXTENDS'];
		return idx$(this.tokid(),tokens) >= 0;
	};
	
	
	// Converts newlines for string literals.
	Lexer.prototype.escapeLines = function (str,heredoc){
		return str.replace(MULTILINER,((heredoc) ? ('\\n') : ('')));
	};
	
	// Constructs a string token by escaping quotes and newlines.
	Lexer.prototype.makeString = function (body,quote,heredoc){
		if(!body) {
			return quote + quote;
		};
		body = body.replace(/\\([\s\S])/g,function (match,contents){
			return (idx$(contents,['\n',quote]) >= 0) ? (contents) : (match);
		});
		body = body.replace(RegExp("" + quote,"g"),'\\$&');
		return quote + this.escapeLines(body,heredoc) + quote;
	};
	
	// Throws a syntax error on the current `@line`.
	Lexer.prototype.error = function (message,len){
		var msg = ("" + message + " on line " + this._line);
		
		if(len) {
			msg += (" [" + this._loc + ":" + (this._loc + len) + "]");
		};
		
		var err = new SyntaxError(msg);
		err.line = this._line;
		throw err;
	};
	
	
	// Constants
	// ---------
	
	// Keywords that Imba shares in common with JavaScript.
	JS_KEYWORDS = [
		'true','false','null','this',
		'new','delete','typeof','in','instanceof',
		'throw','break','continue','debugger',
		'if','else','switch','for','while','do','try','catch','finally',
		'class','extends','super','module','return'
	];
	
	// We want to treat return like any regular call for now
	// Must be careful to throw the exceptions in AST, since the parser
	// wont
	
	// Imba-only keywords. var should move to JS_Keywords
	// some words (like tokid) should be context-specific
	IMBA_KEYWORDS = [
		'undefined','then','unless','until','loop','of','by',
		'when','def','tag','do','elif','begin','prop','var','let','self','await','import'
	];
	
	IMBA_CONTEXTUAL_KEYWORDS = ['extend','static','local','export','global'];
	
	IMBA_ALIAS_MAP = {
		'and': '&&',
		'or': '||',
		'is': '==',
		'isnt': '!=',
		'not': '!',
		'yes': 'true',
		'no': 'false',
		'isa': 'instanceof',
		'case': 'switch',
		'nil': 'null'
	};
	
	var o=IMBA_ALIAS_MAP, key, res=[];
	for(var key in o){
		res.push(key);
	};IMBA_ALIASES = res;
	IMBA_KEYWORDS = IMBA_KEYWORDS.concat(IMBA_ALIASES);// .concat(IMBA_CONTEXTUAL_KEYWORDS)
	
	
	// The list of keywords that are reserved by JavaScript, but not used, or are
	// used by Imba internally. We throw an error when these are encountered,
	// to avoid having a JavaScript error at runtime.  # 'var', 'let', - not inside here
	RESERVED = ['case','default','function','void','with','const','enum','native'];
	STRICT_RESERVED = ['case','function','void','const'];
	
	// 'export', 'import', 
	// '__hasProp', '__extends', '__slice', '__bind', '__indexOf','__scope'
	// RESERVED = [
	//   'case', 'default', 'function', 'var', 'void', 'with', 'const', 'let', 'enum'
	//   'export', 'import', 'native', '__hasProp', '__extends', '__slice', '__bind'
	//   '__indexOf', 'implements', 'interface', 'package', 'private', 'protected'
	//   'public', 'static', 'yield'
	// ]
	
	// The superset of both JavaScript keywords and reserved words, none of which may
	// be used as identifiers or properties.
	JS_FORBIDDEN = JS_KEYWORDS.concat(RESERVED);
	
	exports.RESERVED = RESERVED.concat(JS_KEYWORDS).concat(IMBA_KEYWORDS);
	
	
	METHOD_IDENTIFIER = /^((([\x23]?[\$A-Za-z_\x7f-\uffff][$\-\w\x7f-\uffff]*)([\=\?\!]?))|(<=>|\|(?![\|=])))/;
	// removed ~=|~| |&(?![&=])
	
	// Token matching regexes.
	// added hyphens to identifiers now - to test
	IDENTIFIER = /^((\$|@@|@|\#)[A-Za-z_\-\x7f-\uffff][$\w\x7f-\uffff]*(\-[$\w\x7f-\uffff]+)*|[$A-Za-z_][$\w\x7f-\uffff]*(\-[$\w\x7f-\uffff]+)*)([^\n\S]*:(?![\*\=:$\w\x7f-\uffff]))?/;
	
	OBJECT_KEY = /^((\$|@@|@|)[$A-Za-z_\x7f-\uffff\-][$\w\x7f-\uffff\-]*)([^\n\S\s]*:(?![\*\=:$\w\x7f-\uffff]))/;
	
	OBJECT_KEY_ESCAPE = /[\-\@\$]/;
	
	
	
	PROPERTY = /^((set|get|on)\s+)?([$A-Za-z_\x7f-\uffff][$\w\x7f-\uffff\:]*)([^\n\S]*:\s)/;
	
	
	TAG = /^(\<|%)(?=[A-Za-z\#\.\{\@])/;
	
	TAG_TYPE = /^(\w[\w\d]*:)?(\w[\w\d]*)(-[\w\d]+)*/;
	TAG_ID = /^#((\w[\w\d]*)(-[\w\d]+)*)/;
	
	TAG_ATTR = /^([\.]?[\w\_]+([\-\:][\w]+)*)(\s)*\=/;
	
	
	SELECTOR = /^([%\$]{1,2})([\(\w\#\.\[])/;
	SELECTOR_PART = /^(\#|\.|:|::)?([\w]+(\-[\w]+)*)/;
	SELECTOR_COMBINATOR = /^ (\+|\>|\~)*\s*(?=[\w\.\#\:\{\*\[])/;
	
	SELECTOR_PSEUDO_CLASS = /^(::?)([\w]+(\-[\w]+)*)/;
	SELECTOR_ATTR_OP = /^(\$=|\~=|\^=|\*=|\|=|=|\!=)/;
	SELECTOR_ATTR = /^\[([\w\_\-]+)(\$=|\~=|\^=|\*=|\|=|=|\!=)/;
	
	SYMBOL = /^\:((([\*\@$\w\x7f-\uffff]+)+([\-\\/\\\:][\w\x7f-\uffff]+)*[!\?\=]?)|==|\<=\>|\[\]|\[\]\=|\*|[\\/,\\])/;
	
	
	NUMBER = /^0x[\da-f]+|^0b[01]+|^\d*\.?\d+(?:e[+-]?\d+)?/i;
	
	HEREDOC = /^("""|''')([\s\S]*?)(?:\n[^\n\S]*)?\1/;
	
	OPERATOR = /^(?:[-=]=>|===|!==|[-+*\/%<>&|^!?=]=|=<|>>>=?|([-+:])\1|([&|<>])\2=?|\?\.|\.{2,3}|\*(?=[a-zA-Z\_]))/;
	
	// FIXME splat should only be allowed when the previous thing is spaced or inside call?
	
	WHITESPACE = /^[^\n\S]+/;
	
	COMMENT = /^###([^#][\s\S]*?)(?:###[^\n\S]*|(?:###)?$)/;
	// COMMENT    = /^###([^#][\s\S]*?)(?:###[^\n\S]*|(?:###)?$)|^(?:\s*(#\s.*|#\s*$))+/
	INLINE_COMMENT = /^(\s*)(#\s(.*)|#\s?$)+/;// hmm
	
	CODE = /^[-=]=>/;
	
	MULTI_DENT = /^(?:\n[^\n\S]*)+/;
	
	SIMPLESTR = /^'[^\\']*(?:\\.[^\\']*)*'/;
	
	
	JSTOKEN = /^`[^\\`]*(?:\\.[^\\`]*)*`/;
	
	// Regex-matching-regexes.
	REGEX = /^(\/(?![\s=])[^[\/\n\\]*(?:(?:\\[\s\S]|\[[^\]\n\\]*(?:\\[\s\S][^\]\n\\]*)*])[^[\/\n\\]*)*\/)([imgy]{0,4})(?!\w)/;
	
	HEREGEX = /^\/{3}([\s\S]+?)\/{3}([imgy]{0,4})(?!\w)/;
	
	HEREGEX_OMIT = /\s+(?:#.*)?/g;
	
	// Token cleaning regexes.
	MULTILINER = /\n/g;
	
	HEREDOC_INDENT = /\n+([^\n\S]*)/g;
	
	HEREDOC_ILLEGAL = /\*\//;
	
	LINE_CONTINUER = /^\s*(?:,|\??\.(?![.\d])|::)/;
	
	TRAILING_SPACES = /\s+$/;
	
	CONST_IDENTIFIER = /^[A-Z]/;
	
	ARGVAR = /^\$\d$/;
	
	// CONDITIONAL_ASSIGN = ['||=', '&&=', '?=', '&=', '|=', '!?=']
	
	// Compound assignment tokens.
	COMPOUND_ASSIGN = ['-=','+=','/=','*=','%=','||=','&&=','?=','<<=','>>=','>>>=','&=','^=','|=','=<'];
	
	// Unary tokens.
	UNARY = ['!','~','NEW','TYPEOF','DELETE'];
	
	// Logical tokens.
	LOGIC = ['&&','||','&','|','^'];
	
	// Bit-shifting tokens.
	SHIFT = ['<<','>>','>>>'];
	
	// Comparison tokens.
	COMPARE = ['===','!==','==','!=','<','>','<=','>=','===','!=='];
	
	// Overideable methods
	OP_METHODS = ['<=>','<<','..'];// hmmm
	
	// Mathematical tokens.
	MATH = ['*','/','%','∪','∩','√'];
	
	// Relational tokens that are negatable with `not` prefix.
	RELATION = ['IN','OF','INSTANCEOF','ISA'];
	
	// Boolean tokens.
	BOOL = ['TRUE','FALSE','NULL','UNDEFINED'];
	
	// Tokens which a regular expression will never immediately follow, but which
	// a division operator might.
	// # See: http://www.mozilla.org/js/language/js20-2002-04/rationale/syntax.html#regular-expressions
	// # Our list is shorter, due to sans-parentheses method calls.
	NOT_REGEX = ['NUMBER','REGEX','BOOL','++','--',']'];
	
	// If the previous token is not spaced, there are more preceding tokens that
	// force a division parse:
	NOT_SPACED_REGEX = NOT_REGEX.concat(')','}','THIS','SELF','IDENTIFIER','STRING');
	
	// Tokens which could legitimately be invoked or indexed. An opening
	// parentheses or bracket following these tokens will be recorded as the start
	// of a function invocation or indexing operation.
	// really?!
	
	// } should not be callable anymore!!! '}', '::',
	CALLABLE = ['IDENTIFIER','STRING','REGEX',')',']','THIS','SUPER','TAG_END','IVAR','GVAR','SELF','CONST','NEW','ARGVAR','SYMBOL','RETURN'];
	INDEXABLE = CALLABLE.concat('NUMBER','BOOL','TAG_SELECTOR','IDREF','ARGUMENTS','}');
	
	GLOBAL_IDENTIFIERS = ['global','exports','require'];
	
	// STARTS = [']',')','}','TAG_ATTRS_END']
	// ENDS = [']',')','}','TAG_ATTRS_END']
	
	// Tokens that, when immediately preceding a `WHEN`, indicate that the `WHEN`
	// occurs at the start of a line. We disambiguate these from trailing whens to
	// avoid an ambiguity in the grammar.
	LINE_BREAK = ['INDENT','OUTDENT','TERMINATOR'];


}())
},{"./rewriter":27}],26:[function(require,module,exports){
(function (process){
/* parser generated by jison 0.4.13 */
/*
  Returns a Parser object of the following structure:

  Parser: {
    yy: {}
  }

  Parser.prototype: {
    yy: {},
    trace: function(),
    symbols_: {associative list: name ==> number},
    terminals_: {associative list: number ==> name},
    productions_: [...],
    performAction: function anonymous(yytext, yyleng, yylineno, yy, yystate, $$, _$),
    table: [...],
    defaultActions: {...},
    parseError: function(str, hash),
    parse: function(input),

    lexer: {
        EOF: 1,
        parseError: function(str, hash),
        setInput: function(input),
        input: function(),
        unput: function(str),
        more: function(),
        less: function(n),
        pastInput: function(),
        upcomingInput: function(),
        showPosition: function(),
        test_match: function(regex_match_array, rule_index),
        next: function(),
        lex: function(),
        begin: function(condition),
        popState: function(),
        _currentRules: function(),
        topState: function(),
        pushState: function(condition),

        options: {
            ranges: boolean           (optional: true ==> token location info will include a .range[] member)
            flex: boolean             (optional: true ==> flex-like lexing behaviour where the rules are tested exhaustively to find the longest match)
            backtrack_lexer: boolean  (optional: true ==> lexer regexes are tested in order and for each matching regex the action code is invoked; the lexer terminates the scan when a token is returned by the action code)
        },

        performAction: function(yy, yy_, $avoiding_name_collisions, YY_START),
        rules: [...],
        conditions: {associative list: name ==> set},
    }
  }


  token location info (@$, _$, etc.): {
    first_line: n,
    last_line: n,
    first_column: n,
    last_column: n,
    range: [start_number, end_number]       (where the numbers are indexes into the input string, regular zero-based)
  }


  the parseError function receives a 'hash' object with these members for lexer and parser errors: {
    text:        (matched text)
    token:       (the produced terminal token, if any)
    line:        (yylineno)
  }
  while parser (grammar) errors will also provide these members, i.e. parser errors deliver a superset of attributes: {
    loc:         (yylloc)
    expected:    (string describing the set of expected tokens)
    recoverable: (boolean: TRUE when the parser has a error recovery rule available for this particular error)
  }
*/
var parser = (function(){
var parser = {trace: function trace() { },
yy: {},
symbols_: {"error":2,"Root":3,"Body":4,"Block":5,"TERMINATOR":6,"Line":7,"Terminator":8,"INDENT":9,"OUTDENT":10,"Splat":11,"Expression":12,",":13,"Comment":14,"Statement":15,"Return":16,"Throw":17,"STATEMENT":18,"BREAK":19,"CALL_START":20,"CALL_END":21,"CONTINUE":22,"DEBUGGER":23,"ImportStatement":24,"IMPORT":25,"ImportArgList":26,"FROM":27,"ImportFrom":28,"AS":29,"ImportArg":30,"STRING":31,"VarIdentifier":32,"Await":33,"Value":34,"Invocation":35,"Code":36,"Operation":37,"Assign":38,"If":39,"Ternary":40,"Try":41,"While":42,"For":43,"Switch":44,"Class":45,"Module":46,"TagDeclaration":47,"Tag":48,"Property":49,"TagSelector":50,"SELECTOR_START":51,"TagSelectorType":52,"SELECTOR_NS":53,"SELECTOR_ID":54,"SELECTOR_CLASS":55,".":56,"{":57,"}":58,"#":59,"SELECTOR_COMBINATOR":60,"SELECTOR_PSEUDO_CLASS":61,"SELECTOR_GROUP":62,"UNIVERSAL_SELECTOR":63,"[":64,"Identifier":65,"]":66,"SELECTOR_ATTR_OP":67,"TagSelectorAttrValue":68,"SELECTOR_TAG":69,"Selector":70,"SELECTOR_END":71,"IDENTIFIER":72,"AlphaNumeric":73,"TAG_START":74,"TagOptions":75,"TagAttributes":76,"TAG_END":77,"TagBody":78,"TagTypeName":79,"Self":80,"SYMBOL":81,"INDEX_START":82,"INDEX_END":83,"Ivar":84,"TagAttr":85,"OptComma":86,"TAG_ATTR":87,"=":88,"TagAttrValue":89,"ArgList":90,"TagTypeDef":91,"TagDeclarationBlock":92,"EXTEND":93,"TAG":94,"TagType":95,"COMPARE":96,"TagDeclKeywords":97,"TAG_TYPE":98,"TAG_ID":99,"TagId":100,"IDREF":101,"Symbol":102,"IVAR":103,"CVAR":104,"Gvar":105,"GVAR":106,"Const":107,"CONST":108,"Argvar":109,"ARGVAR":110,"NUMBER":111,"Literal":112,"JS":113,"REGEX":114,"BOOL":115,"Assignable":116,"Outdent":117,"AssignObj":118,"ObjAssignable":119,":":120,"(":121,")":122,"RETURN":123,"Arguments":124,"HERECOMMENT":125,"COMMENT":126,"Method":127,"Do":128,"Begin":129,"BEGIN":130,"DO":131,"BLOCK_PARAM_START":132,"ParamList":133,"BLOCK_PARAM_END":134,"PROP":135,"PropertyIdentifier":136,"Object":137,"TupleAssign":138,"VAR":139,"SingleAssignmentValue":140,"IfBlock":141,"ForBlock":142,"MethodDeclaration":143,"GLOBAL":144,"EXPORT":145,"DEF":146,"MethodScope":147,"MethodScopeType":148,"MethodIdentifier":149,"DEF_BODY":150,"MethodBody":151,"DEF_FRAGMENT":152,"MethodReceiver":153,"This":154,"FuncGlyph":155,"Param":156,"Array":157,"ParamVar":158,"SPLAT":159,"LOGIC":160,"BLOCK_ARG":161,"Reference":162,"VarReference":163,"LET":164,"SimpleAssignable":165,"NEW":166,"Super":167,"IndexValue":168,"SUPER":169,"AWAIT":170,"Parenthetical":171,"Range":172,"ARGUMENTS":173,"IndexArgList":174,"Arg":175,"Slice":176,"AssignList":177,"ClassStart":178,"LOCAL":179,"CLASS":180,"MODULE":181,"OptFuncExist":182,"SuperCall":183,"SuperAccess":184,"FUNC_EXIST":185,"THIS":186,"SELF":187,"RangeDots":188,"..":189,"...":190,"SimpleArgs":191,"TRY":192,"Catch":193,"Finally":194,"FINALLY":195,"CATCH":196,"CATCH_VAR":197,"THROW":198,"WhileSource":199,"WHILE":200,"WHEN":201,"UNTIL":202,"Loop":203,"LOOP":204,"ForBody":205,"FOR":206,"ForStart":207,"ForSource":208,"ForVariables":209,"OWN":210,"ForValue":211,"FORIN":212,"FOROF":213,"BY":214,"SWITCH":215,"Whens":216,"ELSE":217,"When":218,"LEADING_WHEN":219,"IF":220,"ELIF":221,"POST_IF":222,"?":223,"UNARY":224,"SQRT":225,"-":226,"+":227,"--":228,"++":229,"MATH":230,"SHIFT":231,"RELATION":232,"COMPOUND_ASSIGN":233,"$accept":0,"$end":1},
terminals_: {2:"error",6:"TERMINATOR",9:"INDENT",10:"OUTDENT",13:",",18:"STATEMENT",19:"BREAK",20:"CALL_START",21:"CALL_END",22:"CONTINUE",23:"DEBUGGER",25:"IMPORT",27:"FROM",29:"AS",31:"STRING",51:"SELECTOR_START",53:"SELECTOR_NS",54:"SELECTOR_ID",55:"SELECTOR_CLASS",56:".",57:"{",58:"}",59:"#",60:"SELECTOR_COMBINATOR",61:"SELECTOR_PSEUDO_CLASS",62:"SELECTOR_GROUP",63:"UNIVERSAL_SELECTOR",64:"[",66:"]",67:"SELECTOR_ATTR_OP",69:"SELECTOR_TAG",71:"SELECTOR_END",72:"IDENTIFIER",74:"TAG_START",77:"TAG_END",81:"SYMBOL",82:"INDEX_START",83:"INDEX_END",87:"TAG_ATTR",88:"=",93:"EXTEND",94:"TAG",96:"COMPARE",98:"TAG_TYPE",99:"TAG_ID",101:"IDREF",103:"IVAR",104:"CVAR",106:"GVAR",108:"CONST",110:"ARGVAR",111:"NUMBER",113:"JS",114:"REGEX",115:"BOOL",120:":",121:"(",122:")",123:"RETURN",125:"HERECOMMENT",126:"COMMENT",130:"BEGIN",131:"DO",132:"BLOCK_PARAM_START",134:"BLOCK_PARAM_END",135:"PROP",139:"VAR",144:"GLOBAL",145:"EXPORT",146:"DEF",150:"DEF_BODY",152:"DEF_FRAGMENT",159:"SPLAT",160:"LOGIC",161:"BLOCK_ARG",164:"LET",166:"NEW",169:"SUPER",170:"AWAIT",173:"ARGUMENTS",179:"LOCAL",180:"CLASS",181:"MODULE",185:"FUNC_EXIST",186:"THIS",187:"SELF",189:"..",190:"...",192:"TRY",195:"FINALLY",196:"CATCH",197:"CATCH_VAR",198:"THROW",200:"WHILE",201:"WHEN",202:"UNTIL",204:"LOOP",206:"FOR",210:"OWN",212:"FORIN",213:"FOROF",214:"BY",215:"SWITCH",217:"ELSE",219:"LEADING_WHEN",220:"IF",221:"ELIF",222:"POST_IF",223:"?",224:"UNARY",225:"SQRT",226:"-",227:"+",228:"--",229:"++",230:"MATH",231:"SHIFT",232:"RELATION",233:"COMPOUND_ASSIGN"},
productions_: [0,[3,0],[3,1],[3,2],[4,1],[4,3],[4,2],[8,1],[5,2],[5,3],[5,4],[7,1],[7,1],[7,3],[7,3],[7,1],[7,1],[15,1],[15,1],[15,1],[15,1],[15,4],[15,1],[15,4],[15,1],[15,1],[24,4],[24,4],[24,2],[28,1],[26,1],[26,3],[30,1],[12,1],[12,1],[12,1],[12,1],[12,1],[12,1],[12,1],[12,1],[12,1],[12,1],[12,1],[12,1],[12,1],[12,1],[12,1],[12,1],[12,1],[50,1],[50,2],[50,2],[50,2],[50,2],[50,5],[50,5],[50,2],[50,2],[50,2],[50,2],[50,4],[50,6],[52,1],[70,2],[68,1],[68,1],[68,3],[48,4],[48,5],[48,5],[79,1],[79,1],[79,0],[75,1],[75,3],[75,4],[75,3],[75,5],[75,3],[75,2],[75,5],[76,0],[76,1],[76,3],[76,4],[85,1],[85,3],[89,1],[78,3],[78,3],[91,1],[91,3],[47,1],[47,2],[92,2],[92,3],[92,4],[92,5],[97,0],[97,1],[95,1],[95,1],[65,1],[100,1],[100,2],[102,1],[84,1],[84,1],[105,1],[107,1],[109,1],[73,1],[73,1],[73,1],[112,1],[112,1],[112,1],[112,1],[38,3],[38,5],[118,1],[118,3],[118,5],[118,1],[119,1],[119,1],[119,1],[119,1],[119,1],[119,3],[16,2],[16,2],[16,1],[14,1],[14,1],[36,1],[36,1],[36,1],[129,2],[128,2],[128,5],[128,6],[49,3],[49,5],[49,2],[136,1],[136,3],[138,4],[140,1],[140,1],[140,1],[127,1],[127,2],[127,2],[143,9],[143,6],[143,7],[143,4],[143,9],[143,6],[143,7],[143,4],[148,1],[148,1],[149,1],[149,1],[149,3],[151,1],[151,1],[147,1],[147,1],[147,1],[147,1],[86,0],[86,1],[133,0],[133,1],[133,3],[156,1],[156,1],[156,1],[156,2],[156,2],[156,2],[156,3],[158,1],[11,2],[162,2],[163,3],[163,2],[163,2],[163,3],[163,2],[32,1],[32,1],[165,1],[165,1],[165,1],[165,1],[165,1],[165,1],[165,1],[165,1],[165,3],[165,3],[165,3],[165,3],[165,3],[165,3],[165,3],[165,3],[165,3],[165,3],[165,3],[165,4],[165,4],[167,1],[116,1],[116,1],[116,1],[33,2],[34,1],[34,1],[34,1],[34,1],[34,1],[34,1],[34,1],[34,1],[34,1],[174,3],[174,3],[174,4],[174,4],[174,6],[168,1],[168,1],[137,4],[177,0],[177,1],[177,3],[177,4],[177,6],[45,1],[45,2],[45,2],[45,2],[45,2],[45,3],[178,2],[178,3],[178,4],[178,5],[46,2],[46,3],[35,3],[35,3],[35,2],[183,1],[183,2],[184,2],[182,0],[182,1],[124,2],[124,4],[154,1],[80,1],[157,2],[157,4],[188,1],[188,1],[172,5],[176,3],[176,2],[176,2],[90,1],[90,3],[90,4],[90,4],[90,6],[117,2],[117,1],[175,1],[175,1],[175,1],[175,1],[191,1],[191,3],[41,2],[41,3],[41,3],[41,4],[194,2],[193,3],[17,2],[171,3],[171,5],[199,2],[199,4],[199,2],[199,4],[42,2],[42,2],[42,2],[42,1],[203,2],[203,2],[43,2],[43,2],[43,2],[142,2],[205,2],[205,2],[207,2],[207,3],[211,1],[211,1],[211,1],[209,1],[209,3],[208,2],[208,2],[208,4],[208,4],[208,4],[208,6],[208,6],[44,5],[44,7],[44,4],[44,6],[216,1],[216,2],[218,3],[218,4],[141,3],[141,5],[141,4],[141,3],[39,1],[39,3],[39,3],[40,5],[37,2],[37,2],[37,2],[37,2],[37,2],[37,2],[37,2],[37,2],[37,2],[37,3],[37,3],[37,3],[37,3],[37,3],[37,3],[37,3],[37,3],[37,5]],
performAction: function anonymous(yytext, yyleng, yylineno, yy, yystate /* action[1] */, $$ /* vstack */, _$ /* lstack */) {
/* this == yyval */

var $0 = $$.length - 1;
switch (yystate) {
case 1:return this.$ = new yy.Root([]);
break;
case 2:return this.$ = new yy.Root($$[$0]);
break;
case 3:return this.$ = $$[$0-1];
break;
case 4:this.$ = yy.Block.wrap([$$[$0]]);
break;
case 5:this.$ = $$[$0-2].break($$[$0-1]).add($$[$0]);
break;
case 6:this.$ = $$[$0-1].break($$[$0]);
break;
case 7:this.$ = new yy.Terminator($$[$0]);
break;
case 8:this.$ = new yy.Block([]).indented($$[$0-1],$$[$0]).set({ends: [$$[$0-1],$$[$0]]});
break;
case 9:this.$ = $$[$0-1].indented($$[$0-2],$$[$0]).set({ends: [$$[$0-2],$$[$0]]});
break;
case 10:this.$ = $$[$0-1].prebreak($$[$0-2]).indented($$[$0-3],$$[$0]).set({ends: [$$[$0-3],$$[$0]]});
break;
case 11:this.$ = $$[$0];
break;
case 12:this.$ = $$[$0];
break;
case 13:this.$ = $$[$0-2].addExpression($$[$0]);
break;
case 14:this.$ = $$[$0-2].addExpression($$[$0]);
break;
case 15:this.$ = $$[$0];
break;
case 16:this.$ = $$[$0];
break;
case 17:this.$ = $$[$0];
break;
case 18:this.$ = $$[$0];
break;
case 19:this.$ = new yy.Literal($$[$0]);
break;
case 20:this.$ = new yy.BreakStatement($$[$0]);
break;
case 21:this.$ = new yy.BreakStatement($$[$0-3],$$[$0-1]);
break;
case 22:this.$ = new yy.ContinueStatement($$[$0]);
break;
case 23:this.$ = new yy.ContinueStatement($$[$0-3],$$[$0-1]);
break;
case 24:this.$ = new yy.DebuggerStatement($$[$0]);
break;
case 25:this.$ = $$[$0];
break;
case 26:this.$ = new yy.ImportStatement($$[$0-2],$$[$0]);
break;
case 27:this.$ = new yy.ImportStatement(null,$$[$0-2],$$[$0]);
break;
case 28:this.$ = new yy.ImportStatement(null,$$[$0]);
break;
case 29:this.$ = $$[$0];
break;
case 30:this.$ = [$$[$0]];
break;
case 31:this.$ = $$[$0-2].concat($$[$0]);
break;
case 32:this.$ = $$[$0];
break;
case 33:this.$ = $$[$0];
break;
case 34:this.$ = $$[$0];
break;
case 35:this.$ = $$[$0];
break;
case 36:this.$ = $$[$0];
break;
case 37:this.$ = $$[$0];
break;
case 38:this.$ = $$[$0];
break;
case 39:this.$ = $$[$0];
break;
case 40:this.$ = $$[$0];
break;
case 41:this.$ = $$[$0];
break;
case 42:this.$ = $$[$0];
break;
case 43:this.$ = $$[$0];
break;
case 44:this.$ = $$[$0];
break;
case 45:this.$ = $$[$0];
break;
case 46:this.$ = $$[$0];
break;
case 47:this.$ = $$[$0];
break;
case 48:this.$ = $$[$0];
break;
case 49:this.$ = $$[$0];
break;
case 50:this.$ = new yy.Selector([],{type: $$[$0]});
break;
case 51:this.$ = $$[$0-1].add(new yy.SelectorType($$[$0]),'tag');
break;
case 52:this.$ = $$[$0-1].add(new yy.SelectorNamespace($$[$0]),'ns');
break;
case 53:this.$ = $$[$0-1].add(new yy.SelectorId($$[$0]),'id');
break;
case 54:this.$ = $$[$0-1].add(new yy.SelectorClass($$[$0]),'class');
break;
case 55:this.$ = $$[$0-4].add(new yy.SelectorClass($$[$0-1]),'class');
break;
case 56:this.$ = $$[$0-4].add(new yy.SelectorId($$[$0-1]),'id');
break;
case 57:this.$ = $$[$0-1].add(new yy.SelectorCombinator($$[$0]),'sep');
break;
case 58:this.$ = $$[$0-1].add(new yy.SelectorPseudoClass($$[$0]),'pseudoclass');
break;
case 59:this.$ = $$[$0-1].group();
break;
case 60:this.$ = $$[$0-1].add(new yy.SelectorUniversal($$[$0]),'universal');
break;
case 61:this.$ = $$[$0-3].add(new yy.SelectorAttribute($$[$0-1]),'attr');
break;
case 62:this.$ = $$[$0-5].add(new yy.SelectorAttribute($$[$0-3],$$[$0-2],$$[$0-1]),'attr');
break;
case 63:this.$ = new yy.TagTypeIdentifier($$[$0]);
break;
case 64:this.$ = $$[$0-1];
break;
case 65:this.$ = $$[$0];
break;
case 66:this.$ = $$[$0];
break;
case 67:this.$ = $$[$0-1];
break;
case 68:this.$ = $$[$0-2].set({attributes: $$[$0-1]});
break;
case 69:this.$ = $$[$0-3].set({attributes: $$[$0-2],body: $$[$0]});
break;
case 70:this.$ = new yy.TagWrapper($$[$0-2],$$[$0-4],$$[$0]);
break;
case 71:this.$ = $$[$0];
break;
case 72:this.$ = new yy.TagTypeIdentifier($$[$0]);
break;
case 73:this.$ = new yy.TagTypeIdentifier('div');
break;
case 74:this.$ = new yy.Tag({type: $$[$0]});
break;
case 75:this.$ = $$[$0-2].addSymbol($$[$0]);
break;
case 76:this.$ = $$[$0-3].addIndex($$[$0-1]);
break;
case 77:this.$ = $$[$0-2].addClass($$[$0]);
break;
case 78:this.$ = $$[$0-4].addClass($$[$0-1]);
break;
case 79:this.$ = $$[$0-2].set({id: $$[$0]});
break;
case 80:this.$ = $$[$0-1].set({ivar: $$[$0]});
break;
case 81:this.$ = $$[$0-4].set({id: $$[$0-1]});
break;
case 82:this.$ = [];
break;
case 83:this.$ = [$$[$0]];
break;
case 84:this.$ = $$[$0-2].concat($$[$0]);
break;
case 85:this.$ = $$[$0-3].concat($$[$0]);
break;
case 86:this.$ = new yy.TagAttr($$[$0],$$[$0]);
break;
case 87:this.$ = new yy.TagAttr($$[$0-2],$$[$0]);
break;
case 88:this.$ = $$[$0];
break;
case 89:this.$ = $$[$0-1].indented($$[$0-2],$$[$0]);
break;
case 90:this.$ = $$[$0-1];
break;
case 91:this.$ = new yy.TagDesc($$[$0]);
break;
case 92:this.$ = $$[$0-2].classes($$[$0]);
break;
case 93:this.$ = $$[$0];
break;
case 94:this.$ = $$[$0].set({extension: true});
break;
case 95:this.$ = new yy.TagDeclaration($$[$0]);
break;
case 96:this.$ = new yy.TagDeclaration($$[$0-1],null,$$[$0]);
break;
case 97:this.$ = new yy.TagDeclaration($$[$0-2],$$[$0]);
break;
case 98:this.$ = new yy.TagDeclaration($$[$0-3],$$[$0-1],$$[$0]);
break;
case 99:this.$ = $$[$0];
break;
case 100:this.$ = ['yy.extend'];
break;
case 101:this.$ = new yy.TagTypeIdentifier($$[$0]);
break;
case 102:this.$ = new yy.TagTypeIdentifier($$[$0]);
break;
case 103:this.$ = new yy.Identifier($$[$0]);
break;
case 104:this.$ = new yy.TagId($$[$0]);
break;
case 105:this.$ = new yy.TagId($$[$0]);
break;
case 106:this.$ = new yy.Symbol($$[$0]);
break;
case 107:this.$ = new yy.Ivar($$[$0]);
break;
case 108:this.$ = new yy.Ivar($$[$0]);
break;
case 109:this.$ = new yy.Gvar($$[$0]);
break;
case 110:this.$ = new yy.Const($$[$0]);
break;
case 111:this.$ = new yy.Argvar($$[$0]);
break;
case 112:this.$ = new yy.Num($$[$0]);
break;
case 113:this.$ = new yy.Str($$[$0]);
break;
case 114:this.$ = $$[$0];
break;
case 115:this.$ = $$[$0];
break;
case 116:this.$ = new yy.Literal($$[$0]);
break;
case 117:this.$ = new yy.RegExp($$[$0]);
break;
case 118:this.$ = new yy.Bool($$[$0]);
break;
case 119:this.$ = new yy.Assign("=",$$[$0-2],$$[$0]);
break;
case 120:this.$ = new yy.Assign("=",$$[$0-4],$$[$0-1].indented($$[$0-2],$$[$0]));
break;
case 121:this.$ = new yy.ObjAttr($$[$0]);
break;
case 122:this.$ = new yy.ObjAttr($$[$0-2],$$[$0],'object');
break;
case 123:this.$ = new yy.ObjAttr($$[$0-4],$$[$0-1].indented($$[$0-2],$$[$0]),'object');
break;
case 124:this.$ = $$[$0];
break;
case 125:this.$ = $$[$0];
break;
case 126:this.$ = $$[$0];
break;
case 127:this.$ = $$[$0];
break;
case 128:this.$ = $$[$0];
break;
case 129:this.$ = $$[$0];
break;
case 130:this.$ = $$[$0-1];
break;
case 131:this.$ = new yy.Return($$[$0]);
break;
case 132:this.$ = new yy.Return($$[$0]);
break;
case 133:this.$ = new yy.Return();
break;
case 134:this.$ = new yy.Comment($$[$0],true);
break;
case 135:this.$ = new yy.Comment($$[$0],false);
break;
case 136:this.$ = $$[$0];
break;
case 137:this.$ = $$[$0];
break;
case 138:this.$ = $$[$0];
break;
case 139:this.$ = new yy.Begin($$[$0]);
break;
case 140:this.$ = new yy.Lambda([],$$[$0],null,null,{bound: true});
break;
case 141:this.$ = new yy.Lambda($$[$0-2],$$[$0],null,null,{bound: true});
break;
case 142:this.$ = new yy.Lambda($$[$0-3],$$[$0-1],null,null,{bound: true});
break;
case 143:this.$ = new yy.PropertyDeclaration($$[$0-1],$$[$0],$$[$0-2]);
break;
case 144:this.$ = (function (_0){
				return new yy.PropertyDeclaration($$[$0-3],$$[$0-1],_0);
			}());
break;
case 145:this.$ = new yy.PropertyDeclaration($$[$0],null,$$[$0-1]);
break;
case 146:this.$ = $$[$0];
break;
case 147:this.$ = $$[$0-1];
break;
case 148:this.$ = $$[$0-3];
break;
case 149:this.$ = $$[$0];
break;
case 150:this.$ = $$[$0];
break;
case 151:this.$ = $$[$0];
break;
case 152:this.$ = $$[$0];
break;
case 153:this.$ = $$[$0].set({global: $$[$0-1]});
break;
case 154:this.$ = $$[$0].set({export: $$[$0-1]});
break;
case 155:this.$ = new yy.MethodDeclaration($$[$0-3],$$[$0],$$[$0-5],$$[$0-7],$$[$0-6]);
break;
case 156:this.$ = new yy.MethodDeclaration([],$$[$0],$$[$0-2],$$[$0-4],$$[$0-3]);
break;
case 157:this.$ = new yy.MethodDeclaration($$[$0-3],$$[$0],$$[$0-5],null);
break;
case 158:this.$ = new yy.MethodDeclaration([],$$[$0],$$[$0-2],null);
break;
case 159:this.$ = (function (){
				$$[$0].expressions = [new yy.Arr($$[$0].expressions)];
				return new yy.MethodDeclaration($$[$0-3],$$[$0],$$[$0-5],$$[$0-7],$$[$0-6]);
			}());
break;
case 160:this.$ = (function (){
				$$[$0].expressions = [new yy.Arr($$[$0].expressions)];
				return new yy.MethodDeclaration([],$$[$0],$$[$0-2],$$[$0-4],$$[$0-3]);
			}());
break;
case 161:this.$ = (function (){
				$$[$0].expressions = [new yy.Arr($$[$0].expressions)];
				return new yy.MethodDeclaration($$[$0-3],$$[$0],$$[$0-5],null);
			}());
break;
case 162:this.$ = (function (){
				$$[$0].expressions = [new yy.Arr($$[$0].expressions)];
				return new yy.MethodDeclaration([],$$[$0],$$[$0-2],null);
			}());
break;
case 163:this.$ = {static: true};
break;
case 164:this.$ = {};
break;
case 165:this.$ = $$[$0];
break;
case 166:this.$ = $$[$0];
break;
case 167:this.$ = $$[$0-1];
break;
case 168:this.$ = $$[$0];
break;
case 169:this.$ = $$[$0].body();
break;
case 170:this.$ = $$[$0];
break;
case 171:this.$ = $$[$0];
break;
case 172:this.$ = $$[$0];
break;
case 173:this.$ = $$[$0];
break;
case 174:this.$ = $$[$0];
break;
case 175:this.$ = $$[$0];
break;
case 176:this.$ = [];
break;
case 177:this.$ = [$$[$0]];
break;
case 178:this.$ = $$[$0-2].concat($$[$0]);
break;
case 179:this.$ = new yy.NamedParams($$[$0]);
break;
case 180:this.$ = new yy.ArrayParams($$[$0]);
break;
case 181:this.$ = new yy.RequiredParam($$[$0]);
break;
case 182:this.$ = new yy.SplatParam($$[$0],null,$$[$0-1]);
break;
case 183:this.$ = new yy.BlockParam($$[$0],null,$$[$0-1]);
break;
case 184:this.$ = new yy.BlockParam($$[$0],null,$$[$0-1]);
break;
case 185:this.$ = new yy.OptionalParam($$[$0-2],$$[$0],$$[$0-1]);
break;
case 186:this.$ = $$[$0];
break;
case 187:this.$ = SPLAT($$[$0]);
break;
case 188:this.$ = new yy.Reference($$[$0-1],$$[$0]);
break;
case 189:this.$ = SPLAT(new yy.VarReference($$[$0],$$[$0-2]),$$[$0-1]);
break;
case 190:this.$ = new yy.VarReference($$[$0],$$[$0-1]);
break;
case 191:this.$ = new yy.VarReference($$[$0],$$[$0-1]);
break;
case 192:this.$ = SPLAT(new yy.VarReference($$[$0],$$[$0-2]),$$[$0-1]);
break;
case 193:this.$ = $$[$0].set({export: $$[$0-1]});
break;
case 194:this.$ = $$[$0];
break;
case 195:this.$ = $$[$0];
break;
case 196:this.$ = $$[$0];
break;
case 197:this.$ = new yy.IvarAccess('.',null,$$[$0]);
break;
case 198:this.$ = $$[$0];
break;
case 199:this.$ = $$[$0];
break;
case 200:this.$ = $$[$0];
break;
case 201:this.$ = new yy.VarOrAccess($$[$0]);
break;
case 202:this.$ = $$[$0];
break;
case 203:this.$ = $$[$0];
break;
case 204:this.$ = new yy.New($$[$0-2]);
break;
case 205:this.$ = new yy.SuperAccess('.',$$[$0-2],$$[$0]);
break;
case 206:this.$ = new yy.PropertyAccess('.',$$[$0-2],$$[$0]);
break;
case 207:this.$ = new yy.IvarAccess('.',$$[$0-2],$$[$0]);
break;
case 208:this.$ = new yy.ObjectAccess('.',$$[$0-2],new yy.Identifier($$[$0].value()));
break;
case 209:this.$ = new yy.ConstAccess('.',$$[$0-2],$$[$0]);
break;
case 210:this.$ = OP('.',$$[$0-2],new yy.Num($$[$0]));
break;
case 211:this.$ = new yy.PropertyAccess('.',$$[$0-2],$$[$0]);
break;
case 212:this.$ = new yy.ObjectAccess('.',$$[$0-2],new yy.Identifier($$[$0].value()));
break;
case 213:this.$ = new yy.ConstAccess('.',$$[$0-2],$$[$0]);
break;
case 214:this.$ = new yy.IvarAccess('.',$$[$0-2],$$[$0]);
break;
case 215:this.$ = new yy.IndexAccess('.',$$[$0-3],$$[$0-1]);
break;
case 216:this.$ = new yy.IndexAccess('.',$$[$0-3],$$[$0-1]);
break;
case 217:this.$ = AST.SUPER;
break;
case 218:this.$ = $$[$0];
break;
case 219:this.$ = $$[$0];
break;
case 220:this.$ = $$[$0];
break;
case 221:this.$ = new yy.Await($$[$0]);
break;
case 222:this.$ = $$[$0];
break;
case 223:this.$ = $$[$0];
break;
case 224:this.$ = $$[$0];
break;
case 225:this.$ = $$[$0];
break;
case 226:this.$ = $$[$0];
break;
case 227:this.$ = AST.ARGUMENTS;
break;
case 228:this.$ = $$[$0];
break;
case 229:this.$ = $$[$0];
break;
case 230:this.$ = $$[$0];
break;
case 231:this.$ = new yy.ArgList([$$[$0-2],$$[$0]]);
break;
case 232:this.$ = $$[$0-2].add($$[$0]);
break;
case 233:this.$ = $$[$0-3].add($$[$0-1]).add($$[$0]);
break;
case 234:this.$ = $$[$0-2].indented($$[$0-3],$$[$0]);
break;
case 235:this.$ = $$[$0-5].concat($$[$0-2]);
break;
case 236:this.$ = new yy.Index($$[$0]);
break;
case 237:this.$ = new yy.Slice($$[$0]);
break;
case 238:this.$ = new yy.Obj($$[$0-2],$$[$0-3].generated);
break;
case 239:this.$ = new yy.AssignList([]);
break;
case 240:this.$ = new yy.AssignList([$$[$0]]);
break;
case 241:this.$ = $$[$0-2].add($$[$0]);
break;
case 242:this.$ = $$[$0-3].add($$[$0-1]).add($$[$0]);
break;
case 243:this.$ = (function (){
				return $$[$0-5].concat($$[$0-2].indented($$[$0-3],$$[$0])); // hmmm
			}());
break;
case 244:this.$ = $$[$0];
break;
case 245:this.$ = $$[$0].set({extension: $$[$0-1]});
break;
case 246:this.$ = $$[$0].set({local: $$[$0-1]});
break;
case 247:this.$ = $$[$0].set({global: $$[$0-1]});
break;
case 248:this.$ = $$[$0].set({export: $$[$0-1]});
break;
case 249:this.$ = $$[$0].set({export: $$[$0-2],local: $$[$0-1]});
break;
case 250:this.$ = new yy.ClassDeclaration($$[$0],null,[]);
break;
case 251:this.$ = new yy.ClassDeclaration($$[$0-1],null,$$[$0]);
break;
case 252:this.$ = new yy.ClassDeclaration($$[$0-2],$$[$0],[]);
break;
case 253:this.$ = new yy.ClassDeclaration($$[$0-3],$$[$0-1],$$[$0]);
break;
case 254:this.$ = new yy.Module($$[$0]);
break;
case 255:this.$ = new yy.Module($$[$0-1],null,$$[$0]);
break;
case 256:this.$ = new yy.Call($$[$0-2],$$[$0],$$[$0-1]);
break;
case 257:this.$ = new yy.Call($$[$0-2],$$[$0],$$[$0-1]);
break;
case 258:this.$ = (function (){
				$$[$0-1].addBlock($$[$0]);
				return $$[$0-1];
			}());
break;
case 259:this.$ = new yy.SuperReference(AST.SUPER);
break;
case 260:this.$ = $$[$0-1].access($$[$01]);
break;
case 261:this.$ = $$[$0];
break;
case 262:this.$ = false;
break;
case 263:this.$ = true;
break;
case 264:this.$ = new yy.ArgList([]);
break;
case 265:this.$ = $$[$0-2];
break;
case 266:this.$ = new yy.This($$[$0]);
break;
case 267:this.$ = new yy.Self($$[$0]);
break;
case 268:this.$ = new yy.Arr(new yy.ArgList([]));
break;
case 269:this.$ = new yy.Arr($$[$0-2]);
break;
case 270:this.$ = '..';
break;
case 271:this.$ = '...';
break;
case 272:this.$ = OP($$[$0-2],$$[$0-3],$$[$0-1]);
break;
case 273:this.$ = new yy.Range($$[$0-2],$$[$0],$$[$0-1]);
break;
case 274:this.$ = new yy.Range($$[$0-1],null,$$[$0]);
break;
case 275:this.$ = new yy.Range(null,$$[$0],$$[$0-1]);
break;
case 276:this.$ = new yy.ArgList([$$[$0]]);
break;
case 277:this.$ = $$[$0-2].add($$[$0]);
break;
case 278:this.$ = $$[$0-3].add($$[$0-1]).add($$[$0]);
break;
case 279:this.$ = (function (){
				// not good -- arglist should be a separate node-type -- really
				return $$[$0-2].indented($$[$0-3],$$[$0]);
			}());
break;
case 280:this.$ = $$[$0-5].concat($$[$0-2]);
break;
case 281:this.$ = [$$[$0-1],$$[$0]];
break;
case 282:this.$ = $$[$0];
break;
case 283:this.$ = $$[$0];
break;
case 284:this.$ = $$[$0];
break;
case 285:this.$ = $$[$0];
break;
case 286:this.$ = $$[$0];
break;
case 287:this.$ = $$[$0];
break;
case 288:this.$ = [].concat($$[$0-2],$$[$0]);
break;
case 289:this.$ = new yy.Try($$[$0]);
break;
case 290:this.$ = new yy.Try($$[$0-1],$$[$0]);
break;
case 291:this.$ = new yy.Try($$[$0-1],null,$$[$0]);
break;
case 292:this.$ = new yy.Try($$[$0-2],$$[$0-1],$$[$0]);
break;
case 293:this.$ = new yy.Finally($$[$0]);
break;
case 294:this.$ = new yy.Catch($$[$0],$$[$0-1]);
break;
case 295:this.$ = new yy.Throw($$[$0]);
break;
case 296:this.$ = new yy.Parens($$[$0-1]);
break;
case 297:this.$ = new yy.Parens($$[$0-2]);
break;
case 298:this.$ = new yy.While($$[$0]);
break;
case 299:this.$ = new yy.While($$[$0-2],{guard: $$[$0]});
break;
case 300:this.$ = new yy.While($$[$0],{invert: true});
break;
case 301:this.$ = new yy.While($$[$0-2],{invert: true,guard: $$[$0]});
break;
case 302:this.$ = $$[$0-1].addBody($$[$0]);
break;
case 303:this.$ = $$[$0].addBody(yy.Block.wrap([$$[$0-1]]));
break;
case 304:this.$ = $$[$0].addBody(yy.Block.wrap([$$[$0-1]]));
break;
case 305:this.$ = $$[$0];
break;
case 306:this.$ = new yy.While(new yy.Literal('true')).addBody($$[$0]);
break;
case 307:this.$ = new yy.While(new yy.Literal('true')).addBody(yy.Block.wrap([$$[$0]]));
break;
case 308:this.$ = $$[$0].addBody([$$[$0-1]]);
break;
case 309:this.$ = $$[$0].addBody([$$[$0-1]]);
break;
case 310:this.$ = $$[$0-1].addBody($$[$0]);
break;
case 311:this.$ = $$[$0-1].addBody($$[$0]);
break;
case 312:this.$ = {source: new yy.ValueNode($$[$0])};
break;
case 313:this.$ = $$[$0].configure({own: $$[$0-1].own,name: $$[$0-1][0],index: $$[$0-1][1]});
break;
case 314:this.$ = $$[$0];
break;
case 315:this.$ = (function (){
				$$[$0].own = true;
				return $$[$0];
			}());
break;
case 316:this.$ = $$[$0];
break;
case 317:this.$ = new yy.ValueNode($$[$0]);
break;
case 318:this.$ = new yy.ValueNode($$[$0]);
break;
case 319:this.$ = [$$[$0]];
break;
case 320:this.$ = [$$[$0-2],$$[$0]];
break;
case 321:this.$ = new yy.ForIn({source: $$[$0]});
break;
case 322:this.$ = new yy.ForOf({source: $$[$0],object: true});
break;
case 323:this.$ = new yy.ForIn({source: $$[$0-2],guard: $$[$0]});
break;
case 324:this.$ = new yy.ForOf({source: $$[$0-2],guard: $$[$0],object: true});
break;
case 325:this.$ = new yy.ForIn({source: $$[$0-2],step: $$[$0]});
break;
case 326:this.$ = new yy.ForIn({source: $$[$0-4],guard: $$[$0-2],step: $$[$0]});
break;
case 327:this.$ = new yy.ForIn({source: $$[$0-4],step: $$[$0-2],guard: $$[$0]});
break;
case 328:this.$ = new yy.Switch($$[$0-3],$$[$0-1]);
break;
case 329:this.$ = new yy.Switch($$[$0-5],$$[$0-3],$$[$0-1]);
break;
case 330:this.$ = new yy.Switch(null,$$[$0-1]);
break;
case 331:this.$ = new yy.Switch(null,$$[$0-3],$$[$0-1]);
break;
case 332:this.$ = $$[$0];
break;
case 333:this.$ = $$[$0-1].concat($$[$0]);
break;
case 334:this.$ = [new yy.SwitchCase($$[$0-1],$$[$0])];
break;
case 335:this.$ = [new yy.SwitchCase($$[$0-2],$$[$0-1])];
break;
case 336:this.$ = new yy.If($$[$0-1],$$[$0],{type: $$[$0-2]});
break;
case 337:this.$ = $$[$0-4].addElse(new yy.If($$[$0-1],$$[$0],{type: $$[$0-2]}));
break;
case 338:this.$ = $$[$0-3].addElse(new yy.If($$[$0-1],$$[$0],{type: $$[$0-2]}));
break;
case 339:this.$ = $$[$0-2].addElse($$[$0]);
break;
case 340:this.$ = $$[$0];
break;
case 341:this.$ = new yy.If($$[$0],yy.Block.wrap([$$[$0-2]]),{type: $$[$0-1],statement: true});
break;
case 342:this.$ = new yy.If($$[$0],yy.Block.wrap([$$[$0-2]]),{type: $$[$0-1],statement: true});
break;
case 343:this.$ = (function (){
				var ifblock = new yy.If($$[$0-4],yy.Block.wrap([$$[$0-2]]),{type: 'if'});
				ifblock.addElse(yy.Block.wrap([$$[$0]]));
				return ifblock;
			}());
break;
case 344:this.$ = OP($$[$0-1],$$[$0]);
break;
case 345:this.$ = OP($$[$0-1],$$[$0]);
break;
case 346:this.$ = (function (v){
				return new yy.Op('-',$$[$0]);
			}());
break;
case 347:this.$ = (function (v){
				return new yy.Op('+',$$[$0]);
			}());
break;
case 348:this.$ = OP('--',null,$$[$0]);
break;
case 349:this.$ = OP('++',null,$$[$0]);
break;
case 350:this.$ = OP('--',$$[$0-1],null,true);
break;
case 351:this.$ = OP('++',$$[$0-1],null,true);
break;
case 352:this.$ = new yy.Existence($$[$0-1]);
break;
case 353:this.$ = OP('+',$$[$0-2],$$[$0]);
break;
case 354:this.$ = OP('-',$$[$0-2],$$[$0]);
break;
case 355:this.$ = OP($$[$0-1],$$[$0-2],$$[$0]);
break;
case 356:this.$ = OP($$[$0-1],$$[$0-2],$$[$0]);
break;
case 357:this.$ = OP($$[$0-1],$$[$0-2],$$[$0]);
break;
case 358:this.$ = OP($$[$0-1],$$[$0-2],$$[$0]);
break;
case 359:this.$ = ($$[$0-1].charAt(0) == '!') ? (
					OP($$[$0-1].slice(1),$$[$0-2],$$[$0]).invert() // hmm, really?
				
				) : (
					OP($$[$0-1],$$[$0-2],$$[$0])
				
				);
break;
case 360:this.$ = OP($$[$0-1],$$[$0-2],$$[$0]);
break;
case 361:this.$ = OP($$[$0-3],$$[$0-4],$$[$0-1].indented($$[$0-2],$$[$0]));
break;
}
},
table: [{1:[2,1],3:1,4:2,5:3,7:4,9:[1,5],11:6,12:7,14:8,15:9,16:30,17:31,18:[1,32],19:[1,33],22:[1,34],23:[1,35],24:36,25:[1,74],31:[1,109],33:11,34:12,35:13,36:14,37:15,38:16,39:17,40:18,41:19,42:20,43:21,44:22,45:23,46:24,47:25,48:26,49:27,50:87,51:[1,111],57:[1,90],59:[1,86],64:[1,83],65:97,70:46,72:[1,119],73:78,74:[1,70],80:96,81:[1,122],84:93,92:69,93:[1,64],94:[1,107],100:45,101:[1,85],102:110,103:[1,114],104:[1,115],105:94,106:[1,116],107:92,108:[1,113],109:95,110:[1,117],111:[1,108],112:40,113:[1,79],114:[1,80],115:[1,81],116:38,121:[1,82],123:[1,72],125:[1,28],126:[1,29],127:47,128:48,129:49,130:[1,91],131:[1,89],135:[1,71],137:76,139:[1,120],141:57,143:88,144:[1,66],145:[1,67],146:[1,112],154:44,157:75,159:[1,10],162:99,163:98,164:[1,121],165:56,167:39,169:[1,77],170:[1,37],171:41,172:42,173:[1,43],178:63,179:[1,65],180:[1,106],181:[1,68],186:[1,84],187:[1,118],192:[1,58],198:[1,73],199:59,200:[1,101],202:[1,102],203:60,204:[1,103],205:61,206:[1,104],207:105,215:[1,62],220:[1,100],224:[1,50],225:[1,51],226:[1,52],227:[1,53],228:[1,54],229:[1,55]},{1:[3]},{1:[2,2],6:[1,124],8:123},{6:[1,125]},{1:[2,4],6:[2,4],10:[2,4],13:[1,126],122:[2,4]},{4:128,6:[1,129],7:4,10:[1,127],11:6,12:7,14:8,15:9,16:30,17:31,18:[1,32],19:[1,33],22:[1,34],23:[1,35],24:36,25:[1,74],31:[1,109],33:11,34:12,35:13,36:14,37:15,38:16,39:17,40:18,41:19,42:20,43:21,44:22,45:23,46:24,47:25,48:26,49:27,50:87,51:[1,111],57:[1,90],59:[1,86],64:[1,83],65:97,70:46,72:[1,119],73:78,74:[1,70],80:96,81:[1,122],84:93,92:69,93:[1,64],94:[1,107],100:45,101:[1,85],102:110,103:[1,114],104:[1,115],105:94,106:[1,116],107:92,108:[1,113],109:95,110:[1,117],111:[1,108],112:40,113:[1,79],114:[1,80],115:[1,81],116:38,121:[1,82],123:[1,72],125:[1,28],126:[1,29],127:47,128:48,129:49,130:[1,91],131:[1,89],135:[1,71],137:76,139:[1,120],141:57,143:88,144:[1,66],145:[1,67],146:[1,112],154:44,157:75,159:[1,10],162:99,163:98,164:[1,121],165:56,167:39,169:[1,77],170:[1,37],171:41,172:42,173:[1,43],178:63,179:[1,65],180:[1,106],181:[1,68],186:[1,84],187:[1,118],192:[1,58],198:[1,73],199:59,200:[1,101],202:[1,102],203:60,204:[1,103],205:61,206:[1,104],207:105,215:[1,62],220:[1,100],224:[1,50],225:[1,51],226:[1,52],227:[1,53],228:[1,54],229:[1,55]},{1:[2,11],6:[2,11],10:[2,11],13:[2,11],122:[2,11]},{1:[2,12],6:[2,12],10:[2,12],13:[2,12],96:[1,135],122:[2,12],160:[1,136],199:139,200:[1,101],202:[1,102],205:140,206:[1,104],207:105,222:[1,138],223:[1,130],226:[1,132],227:[1,131],230:[1,133],231:[1,134],232:[1,137]},{1:[2,15],6:[2,15],10:[2,15],13:[2,15],122:[2,15]},{1:[2,16],6:[2,16],10:[2,16],13:[2,16],122:[2,16],199:142,200:[1,101],202:[1,102],205:143,206:[1,104],207:105,222:[1,141]},{12:144,15:145,16:30,17:31,18:[1,32],19:[1,33],22:[1,34],23:[1,35],24:36,25:[1,74],31:[1,109],33:11,34:12,35:13,36:14,37:15,38:16,39:17,40:18,41:19,42:20,43:21,44:22,45:23,46:24,47:25,48:26,49:27,50:87,51:[1,111],57:[1,90],59:[1,86],64:[1,83],65:97,70:46,72:[1,119],73:78,74:[1,70],80:96,81:[1,122],84:93,92:69,93:[1,64],94:[1,107],100:45,101:[1,85],102:110,103:[1,114],104:[1,115],105:94,106:[1,116],107:92,108:[1,113],109:95,110:[1,117],111:[1,108],112:40,113:[1,79],114:[1,80],115:[1,81],116:38,121:[1,82],123:[1,72],127:47,128:48,129:49,130:[1,91],131:[1,89],135:[1,71],137:76,139:[1,120],141:57,143:88,144:[1,66],145:[1,67],146:[1,112],154:44,157:75,162:99,163:98,164:[1,121],165:56,167:39,169:[1,77],170:[1,37],171:41,172:42,173:[1,43],178:63,179:[1,65],180:[1,106],181:[1,68],186:[1,84],187:[1,118],192:[1,58],198:[1,73],199:59,200:[1,101],202:[1,102],203:60,204:[1,103],205:61,206:[1,104],207:105,215:[1,62],220:[1,100],224:[1,50],225:[1,51],226:[1,52],227:[1,53],228:[1,54],229:[1,55]},{1:[2,33],6:[2,33],9:[2,33],10:[2,33],13:[2,33],21:[2,33],58:[2,33],66:[2,33],77:[2,33],83:[2,33],96:[2,33],120:[2,33],122:[2,33],134:[2,33],160:[2,33],189:[2,33],190:[2,33],200:[2,33],201:[2,33],202:[2,33],206:[2,33],214:[2,33],222:[2,33],223:[2,33],226:[2,33],227:[2,33],230:[2,33],231:[2,33],232:[2,33]},{1:[2,34],6:[2,34],9:[2,34],10:[2,34],13:[2,34],20:[2,262],21:[2,34],56:[1,147],58:[2,34],66:[2,34],77:[2,34],81:[1,122],82:[1,148],83:[2,34],96:[2,34],102:149,120:[2,34],122:[2,34],134:[2,34],160:[2,34],182:146,185:[1,150],189:[2,34],190:[2,34],200:[2,34],201:[2,34],202:[2,34],206:[2,34],214:[2,34],222:[2,34],223:[2,34],226:[2,34],227:[2,34],230:[2,34],231:[2,34],232:[2,34]},{1:[2,35],6:[2,35],9:[2,35],10:[2,35],13:[2,35],20:[2,262],21:[2,35],56:[1,153],57:[1,155],58:[2,35],66:[2,35],77:[2,35],82:[1,154],83:[2,35],96:[2,35],120:[2,35],122:[2,35],128:152,131:[1,89],134:[2,35],160:[2,35],182:151,185:[1,150],189:[2,35],190:[2,35],200:[2,35],201:[2,35],202:[2,35],206:[2,35],214:[2,35],222:[2,35],223:[2,35],226:[2,35],227:[2,35],230:[2,35],231:[2,35],232:[2,35]},{1:[2,36],6:[2,36],9:[2,36],10:[2,36],13:[2,36],21:[2,36],58:[2,36],66:[2,36],77:[2,36],83:[2,36],96:[2,36],120:[2,36],122:[2,36],134:[2,36],160:[2,36],189:[2,36],190:[2,36],200:[2,36],201:[2,36],202:[2,36],206:[2,36],214:[2,36],222:[2,36],223:[2,36],226:[2,36],227:[2,36],230:[2,36],231:[2,36],232:[2,36]},{1:[2,37],6:[2,37],9:[2,37],10:[2,37],13:[2,37],21:[2,37],58:[2,37],66:[2,37],77:[2,37],83:[2,37],96:[2,37],120:[2,37],122:[2,37],134:[2,37],160:[2,37],189:[2,37],190:[2,37],200:[2,37],201:[2,37],202:[2,37],206:[2,37],214:[2,37],222:[2,37],223:[2,37],226:[2,37],227:[2,37],230:[2,37],231:[2,37],232:[2,37]},{1:[2,38],6:[2,38],9:[2,38],10:[2,38],13:[2,38],21:[2,38],58:[2,38],66:[2,38],77:[2,38],83:[2,38],96:[2,38],120:[2,38],122:[2,38],134:[2,38],160:[2,38],189:[2,38],190:[2,38],200:[2,38],201:[2,38],202:[2,38],206:[2,38],214:[2,38],222:[2,38],223:[2,38],226:[2,38],227:[2,38],230:[2,38],231:[2,38],232:[2,38]},{1:[2,39],6:[2,39],9:[2,39],10:[2,39],13:[2,39],21:[2,39],58:[2,39],66:[2,39],77:[2,39],83:[2,39],96:[2,39],120:[2,39],122:[2,39],134:[2,39],160:[2,39],189:[2,39],190:[2,39],200:[2,39],201:[2,39],202:[2,39],206:[2,39],214:[2,39],222:[2,39],223:[2,39],226:[2,39],227:[2,39],230:[2,39],231:[2,39],232:[2,39]},{1:[2,40],6:[2,40],9:[2,40],10:[2,40],13:[2,40],21:[2,40],58:[2,40],66:[2,40],77:[2,40],83:[2,40],96:[2,40],120:[2,40],122:[2,40],134:[2,40],160:[2,40],189:[2,40],190:[2,40],200:[2,40],201:[2,40],202:[2,40],206:[2,40],214:[2,40],222:[2,40],223:[2,40],226:[2,40],227:[2,40],230:[2,40],231:[2,40],232:[2,40]},{1:[2,41],6:[2,41],9:[2,41],10:[2,41],13:[2,41],21:[2,41],58:[2,41],66:[2,41],77:[2,41],83:[2,41],96:[2,41],120:[2,41],122:[2,41],134:[2,41],160:[2,41],189:[2,41],190:[2,41],200:[2,41],201:[2,41],202:[2,41],206:[2,41],214:[2,41],222:[2,41],223:[2,41],226:[2,41],227:[2,41],230:[2,41],231:[2,41],232:[2,41]},{1:[2,42],6:[2,42],9:[2,42],10:[2,42],13:[2,42],21:[2,42],58:[2,42],66:[2,42],77:[2,42],83:[2,42],96:[2,42],120:[2,42],122:[2,42],134:[2,42],160:[2,42],189:[2,42],190:[2,42],200:[2,42],201:[2,42],202:[2,42],206:[2,42],214:[2,42],222:[2,42],223:[2,42],226:[2,42],227:[2,42],230:[2,42],231:[2,42],232:[2,42]},{1:[2,43],6:[2,43],9:[2,43],10:[2,43],13:[2,43],21:[2,43],58:[2,43],66:[2,43],77:[2,43],83:[2,43],96:[2,43],120:[2,43],122:[2,43],134:[2,43],160:[2,43],189:[2,43],190:[2,43],200:[2,43],201:[2,43],202:[2,43],206:[2,43],214:[2,43],222:[2,43],223:[2,43],226:[2,43],227:[2,43],230:[2,43],231:[2,43],232:[2,43]},{1:[2,44],6:[2,44],9:[2,44],10:[2,44],13:[2,44],21:[2,44],58:[2,44],66:[2,44],77:[2,44],83:[2,44],96:[2,44],120:[2,44],122:[2,44],134:[2,44],160:[2,44],189:[2,44],190:[2,44],200:[2,44],201:[2,44],202:[2,44],206:[2,44],214:[2,44],222:[2,44],223:[2,44],226:[2,44],227:[2,44],230:[2,44],231:[2,44],232:[2,44]},{1:[2,45],6:[2,45],9:[2,45],10:[2,45],13:[2,45],21:[2,45],58:[2,45],66:[2,45],77:[2,45],83:[2,45],96:[2,45],120:[2,45],122:[2,45],134:[2,45],160:[2,45],189:[2,45],190:[2,45],200:[2,45],201:[2,45],202:[2,45],206:[2,45],214:[2,45],222:[2,45],223:[2,45],226:[2,45],227:[2,45],230:[2,45],231:[2,45],232:[2,45]},{1:[2,46],6:[2,46],9:[2,46],10:[2,46],13:[2,46],21:[2,46],58:[2,46],66:[2,46],77:[2,46],83:[2,46],96:[2,46],120:[2,46],122:[2,46],134:[2,46],160:[2,46],189:[2,46],190:[2,46],200:[2,46],201:[2,46],202:[2,46],206:[2,46],214:[2,46],222:[2,46],223:[2,46],226:[2,46],227:[2,46],230:[2,46],231:[2,46],232:[2,46]},{1:[2,47],6:[2,47],9:[2,47],10:[2,47],13:[2,47],21:[2,47],58:[2,47],66:[2,47],77:[2,47],83:[2,47],96:[2,47],120:[2,47],122:[2,47],134:[2,47],160:[2,47],189:[2,47],190:[2,47],200:[2,47],201:[2,47],202:[2,47],206:[2,47],214:[2,47],222:[2,47],223:[2,47],226:[2,47],227:[2,47],230:[2,47],231:[2,47],232:[2,47]},{1:[2,48],6:[2,48],9:[2,48],10:[2,48],13:[2,48],21:[2,48],58:[2,48],66:[2,48],77:[2,48],83:[2,48],96:[2,48],120:[2,48],122:[2,48],134:[2,48],160:[2,48],189:[2,48],190:[2,48],200:[2,48],201:[2,48],202:[2,48],206:[2,48],214:[2,48],222:[2,48],223:[2,48],226:[2,48],227:[2,48],230:[2,48],231:[2,48],232:[2,48]},{1:[2,49],6:[2,49],9:[2,49],10:[2,49],13:[2,49],21:[2,49],58:[2,49],66:[2,49],77:[2,49],83:[2,49],96:[2,49],120:[2,49],122:[2,49],134:[2,49],160:[2,49],189:[2,49],190:[2,49],200:[2,49],201:[2,49],202:[2,49],206:[2,49],214:[2,49],222:[2,49],223:[2,49],226:[2,49],227:[2,49],230:[2,49],231:[2,49],232:[2,49]},{1:[2,134],6:[2,134],9:[2,134],10:[2,134],13:[2,134],21:[2,134],58:[2,134],66:[2,134],122:[2,134]},{1:[2,135],6:[2,135],9:[2,135],10:[2,135],13:[2,135],21:[2,135],58:[2,135],66:[2,135],122:[2,135]},{1:[2,17],6:[2,17],10:[2,17],13:[2,17],122:[2,17],200:[2,17],202:[2,17],206:[2,17],222:[2,17]},{1:[2,18],6:[2,18],10:[2,18],13:[2,18],122:[2,18],200:[2,18],202:[2,18],206:[2,18],222:[2,18]},{1:[2,19],6:[2,19],10:[2,19],13:[2,19],122:[2,19],200:[2,19],202:[2,19],206:[2,19],222:[2,19]},{1:[2,20],6:[2,20],10:[2,20],13:[2,20],20:[1,156],122:[2,20],200:[2,20],202:[2,20],206:[2,20],222:[2,20]},{1:[2,22],6:[2,22],10:[2,22],13:[2,22],20:[1,157],122:[2,22],200:[2,22],202:[2,22],206:[2,22],222:[2,22]},{1:[2,24],6:[2,24],10:[2,24],13:[2,24],122:[2,24],200:[2,24],202:[2,24],206:[2,24],222:[2,24]},{1:[2,25],6:[2,25],10:[2,25],13:[2,25],122:[2,25],200:[2,25],202:[2,25],206:[2,25],222:[2,25]},{12:158,15:145,16:30,17:31,18:[1,32],19:[1,33],22:[1,34],23:[1,35],24:36,25:[1,74],31:[1,109],33:11,34:12,35:13,36:14,37:15,38:16,39:17,40:18,41:19,42:20,43:21,44:22,45:23,46:24,47:25,48:26,49:27,50:87,51:[1,111],57:[1,90],59:[1,86],64:[1,83],65:97,70:46,72:[1,119],73:78,74:[1,70],80:96,81:[1,122],84:93,92:69,93:[1,64],94:[1,107],100:45,101:[1,85],102:110,103:[1,114],104:[1,115],105:94,106:[1,116],107:92,108:[1,113],109:95,110:[1,117],111:[1,108],112:40,113:[1,79],114:[1,80],115:[1,81],116:38,121:[1,82],123:[1,72],127:47,128:48,129:49,130:[1,91],131:[1,89],135:[1,71],137:76,139:[1,120],141:57,143:88,144:[1,66],145:[1,67],146:[1,112],154:44,157:75,162:99,163:98,164:[1,121],165:56,167:39,169:[1,77],170:[1,37],171:41,172:42,173:[1,43],178:63,179:[1,65],180:[1,106],181:[1,68],186:[1,84],187:[1,118],192:[1,58],198:[1,73],199:59,200:[1,101],202:[1,102],203:60,204:[1,103],205:61,206:[1,104],207:105,215:[1,62],220:[1,100],224:[1,50],225:[1,51],226:[1,52],227:[1,53],228:[1,54],229:[1,55]},{1:[2,222],6:[2,222],9:[2,222],10:[2,222],13:[2,222],20:[2,222],21:[2,222],56:[2,222],58:[2,222],66:[2,222],77:[2,222],81:[2,222],82:[2,222],83:[2,222],88:[1,159],96:[2,222],120:[2,222],122:[2,222],134:[2,222],160:[2,222],185:[2,222],189:[2,222],190:[2,222],200:[2,222],201:[2,222],202:[2,222],206:[2,222],214:[2,222],222:[2,222],223:[2,222],226:[2,222],227:[2,222],230:[2,222],231:[2,222],232:[2,222]},{1:[2,223],6:[2,223],9:[2,223],10:[2,223],13:[2,223],20:[2,223],21:[2,223],56:[2,223],58:[2,223],66:[2,223],77:[2,223],81:[2,223],82:[2,223],83:[2,223],96:[2,223],120:[2,223],122:[2,223],134:[2,223],160:[2,223],185:[2,223],189:[2,223],190:[2,223],200:[2,223],201:[2,223],202:[2,223],206:[2,223],214:[2,223],222:[2,223],223:[2,223],226:[2,223],227:[2,223],230:[2,223],231:[2,223],232:[2,223]},{1:[2,224],6:[2,224],9:[2,224],10:[2,224],13:[2,224],20:[2,224],21:[2,224],56:[2,224],58:[2,224],66:[2,224],77:[2,224],81:[2,224],82:[2,224],83:[2,224],96:[2,224],120:[2,224],122:[2,224],134:[2,224],160:[2,224],185:[2,224],189:[2,224],190:[2,224],200:[2,224],201:[2,224],202:[2,224],206:[2,224],214:[2,224],222:[2,224],223:[2,224],226:[2,224],227:[2,224],230:[2,224],231:[2,224],232:[2,224]},{1:[2,225],6:[2,225],9:[2,225],10:[2,225],13:[2,225],20:[2,225],21:[2,225],56:[2,225],58:[2,225],66:[2,225],77:[2,225],81:[2,225],82:[2,225],83:[2,225],96:[2,225],120:[2,225],122:[2,225],134:[2,225],160:[2,225],185:[2,225],189:[2,225],190:[2,225],200:[2,225],201:[2,225],202:[2,225],206:[2,225],214:[2,225],222:[2,225],223:[2,225],226:[2,225],227:[2,225],230:[2,225],231:[2,225],232:[2,225]},{1:[2,226],6:[2,226],9:[2,226],10:[2,226],13:[2,226],20:[2,226],21:[2,226],56:[2,226],58:[2,226],66:[2,226],77:[2,226],81:[2,226],82:[2,226],83:[2,226],96:[2,226],120:[2,226],122:[2,226],134:[2,226],160:[2,226],185:[2,226],189:[2,226],190:[2,226],200:[2,226],201:[2,226],202:[2,226],206:[2,226],214:[2,226],222:[2,226],223:[2,226],226:[2,226],227:[2,226],230:[2,226],231:[2,226],232:[2,226]},{1:[2,227],6:[2,227],9:[2,227],10:[2,227],13:[2,227],20:[2,227],21:[2,227],56:[2,227],58:[2,227],66:[2,227],77:[2,227],81:[2,227],82:[2,227],83:[2,227],96:[2,227],120:[2,227],122:[2,227],134:[2,227],160:[2,227],185:[2,227],189:[2,227],190:[2,227],200:[2,227],201:[2,227],202:[2,227],206:[2,227],214:[2,227],222:[2,227],223:[2,227],226:[2,227],227:[2,227],230:[2,227],231:[2,227],232:[2,227]},{1:[2,228],6:[2,228],9:[2,228],10:[2,228],13:[2,228],20:[2,228],21:[2,228],56:[2,228],58:[2,228],66:[2,228],77:[2,228],81:[2,228],82:[2,228],83:[2,228],96:[2,228],120:[2,228],122:[2,228],134:[2,228],160:[2,228],185:[2,228],189:[2,228],190:[2,228],200:[2,228],201:[2,228],202:[2,228],206:[2,228],214:[2,228],222:[2,228],223:[2,228],226:[2,228],227:[2,228],230:[2,228],231:[2,228],232:[2,228]},{1:[2,229],6:[2,229],9:[2,229],10:[2,229],13:[2,229],20:[2,229],21:[2,229],56:[2,229],58:[2,229],66:[2,229],77:[2,229],81:[2,229],82:[2,229],83:[2,229],96:[2,229],120:[2,229],122:[2,229],134:[2,229],160:[2,229],185:[2,229],189:[2,229],190:[2,229],200:[2,229],201:[2,229],202:[2,229],206:[2,229],214:[2,229],222:[2,229],223:[2,229],226:[2,229],227:[2,229],230:[2,229],231:[2,229],232:[2,229]},{1:[2,230],6:[2,230],9:[2,230],10:[2,230],13:[2,230],20:[2,230],21:[2,230],56:[2,230],58:[2,230],66:[2,230],77:[2,230],81:[2,230],82:[2,230],83:[2,230],96:[2,230],120:[2,230],122:[2,230],134:[2,230],160:[2,230],185:[2,230],189:[2,230],190:[2,230],200:[2,230],201:[2,230],202:[2,230],206:[2,230],214:[2,230],222:[2,230],223:[2,230],226:[2,230],227:[2,230],230:[2,230],231:[2,230],232:[2,230]},{1:[2,136],6:[2,136],9:[2,136],10:[2,136],13:[2,136],21:[2,136],58:[2,136],66:[2,136],77:[2,136],83:[2,136],96:[2,136],120:[2,136],122:[2,136],134:[2,136],160:[2,136],189:[2,136],190:[2,136],200:[2,136],201:[2,136],202:[2,136],206:[2,136],214:[2,136],222:[2,136],223:[2,136],226:[2,136],227:[2,136],230:[2,136],231:[2,136],232:[2,136]},{1:[2,137],6:[2,137],9:[2,137],10:[2,137],13:[2,137],21:[2,137],58:[2,137],66:[2,137],77:[2,137],83:[2,137],96:[2,137],120:[2,137],122:[2,137],134:[2,137],160:[2,137],189:[2,137],190:[2,137],200:[2,137],201:[2,137],202:[2,137],206:[2,137],214:[2,137],222:[2,137],223:[2,137],226:[2,137],227:[2,137],230:[2,137],231:[2,137],232:[2,137]},{1:[2,138],6:[2,138],9:[2,138],10:[2,138],13:[2,138],21:[2,138],58:[2,138],66:[2,138],77:[2,138],83:[2,138],96:[2,138],120:[2,138],122:[2,138],134:[2,138],160:[2,138],189:[2,138],190:[2,138],200:[2,138],201:[2,138],202:[2,138],206:[2,138],214:[2,138],222:[2,138],223:[2,138],226:[2,138],227:[2,138],230:[2,138],231:[2,138],232:[2,138]},{12:160,15:145,16:30,17:31,18:[1,32],19:[1,33],22:[1,34],23:[1,35],24:36,25:[1,74],31:[1,109],33:11,34:12,35:13,36:14,37:15,38:16,39:17,40:18,41:19,42:20,43:21,44:22,45:23,46:24,47:25,48:26,49:27,50:87,51:[1,111],57:[1,90],59:[1,86],64:[1,83],65:97,70:46,72:[1,119],73:78,74:[1,70],80:96,81:[1,122],84:93,92:69,93:[1,64],94:[1,107],100:45,101:[1,85],102:110,103:[1,114],104:[1,115],105:94,106:[1,116],107:92,108:[1,113],109:95,110:[1,117],111:[1,108],112:40,113:[1,79],114:[1,80],115:[1,81],116:38,121:[1,82],123:[1,72],127:47,128:48,129:49,130:[1,91],131:[1,89],135:[1,71],137:76,139:[1,120],141:57,143:88,144:[1,66],145:[1,67],146:[1,112],154:44,157:75,162:99,163:98,164:[1,121],165:56,167:39,169:[1,77],170:[1,37],171:41,172:42,173:[1,43],178:63,179:[1,65],180:[1,106],181:[1,68],186:[1,84],187:[1,118],192:[1,58],198:[1,73],199:59,200:[1,101],202:[1,102],203:60,204:[1,103],205:61,206:[1,104],207:105,215:[1,62],220:[1,100],224:[1,50],225:[1,51],226:[1,52],227:[1,53],228:[1,54],229:[1,55]},{12:161,15:145,16:30,17:31,18:[1,32],19:[1,33],22:[1,34],23:[1,35],24:36,25:[1,74],31:[1,109],33:11,34:12,35:13,36:14,37:15,38:16,39:17,40:18,41:19,42:20,43:21,44:22,45:23,46:24,47:25,48:26,49:27,50:87,51:[1,111],57:[1,90],59:[1,86],64:[1,83],65:97,70:46,72:[1,119],73:78,74:[1,70],80:96,81:[1,122],84:93,92:69,93:[1,64],94:[1,107],100:45,101:[1,85],102:110,103:[1,114],104:[1,115],105:94,106:[1,116],107:92,108:[1,113],109:95,110:[1,117],111:[1,108],112:40,113:[1,79],114:[1,80],115:[1,81],116:38,121:[1,82],123:[1,72],127:47,128:48,129:49,130:[1,91],131:[1,89],135:[1,71],137:76,139:[1,120],141:57,143:88,144:[1,66],145:[1,67],146:[1,112],154:44,157:75,162:99,163:98,164:[1,121],165:56,167:39,169:[1,77],170:[1,37],171:41,172:42,173:[1,43],178:63,179:[1,65],180:[1,106],181:[1,68],186:[1,84],187:[1,118],192:[1,58],198:[1,73],199:59,200:[1,101],202:[1,102],203:60,204:[1,103],205:61,206:[1,104],207:105,215:[1,62],220:[1,100],224:[1,50],225:[1,51],226:[1,52],227:[1,53],228:[1,54],229:[1,55]},{12:162,15:145,16:30,17:31,18:[1,32],19:[1,33],22:[1,34],23:[1,35],24:36,25:[1,74],31:[1,109],33:11,34:12,35:13,36:14,37:15,38:16,39:17,40:18,41:19,42:20,43:21,44:22,45:23,46:24,47:25,48:26,49:27,50:87,51:[1,111],57:[1,90],59:[1,86],64:[1,83],65:97,70:46,72:[1,119],73:78,74:[1,70],80:96,81:[1,122],84:93,92:69,93:[1,64],94:[1,107],100:45,101:[1,85],102:110,103:[1,114],104:[1,115],105:94,106:[1,116],107:92,108:[1,113],109:95,110:[1,117],111:[1,108],112:40,113:[1,79],114:[1,80],115:[1,81],116:38,121:[1,82],123:[1,72],127:47,128:48,129:49,130:[1,91],131:[1,89],135:[1,71],137:76,139:[1,120],141:57,143:88,144:[1,66],145:[1,67],146:[1,112],154:44,157:75,162:99,163:98,164:[1,121],165:56,167:39,169:[1,77],170:[1,37],171:41,172:42,173:[1,43],178:63,179:[1,65],180:[1,106],181:[1,68],186:[1,84],187:[1,118],192:[1,58],198:[1,73],199:59,200:[1,101],202:[1,102],203:60,204:[1,103],205:61,206:[1,104],207:105,215:[1,62],220:[1,100],224:[1,50],225:[1,51],226:[1,52],227:[1,53],228:[1,54],229:[1,55]},{12:163,15:145,16:30,17:31,18:[1,32],19:[1,33],22:[1,34],23:[1,35],24:36,25:[1,74],31:[1,109],33:11,34:12,35:13,36:14,37:15,38:16,39:17,40:18,41:19,42:20,43:21,44:22,45:23,46:24,47:25,48:26,49:27,50:87,51:[1,111],57:[1,90],59:[1,86],64:[1,83],65:97,70:46,72:[1,119],73:78,74:[1,70],80:96,81:[1,122],84:93,92:69,93:[1,64],94:[1,107],100:45,101:[1,85],102:110,103:[1,114],104:[1,115],105:94,106:[1,116],107:92,108:[1,113],109:95,110:[1,117],111:[1,108],112:40,113:[1,79],114:[1,80],115:[1,81],116:38,121:[1,82],123:[1,72],127:47,128:48,129:49,130:[1,91],131:[1,89],135:[1,71],137:76,139:[1,120],141:57,143:88,144:[1,66],145:[1,67],146:[1,112],154:44,157:75,162:99,163:98,164:[1,121],165:56,167:39,169:[1,77],170:[1,37],171:41,172:42,173:[1,43],178:63,179:[1,65],180:[1,106],181:[1,68],186:[1,84],187:[1,118],192:[1,58],198:[1,73],199:59,200:[1,101],202:[1,102],203:60,204:[1,103],205:61,206:[1,104],207:105,215:[1,62],220:[1,100],224:[1,50],225:[1,51],226:[1,52],227:[1,53],228:[1,54],229:[1,55]},{31:[1,109],34:165,35:166,50:87,51:[1,111],57:[1,169],59:[1,86],64:[1,83],65:97,70:46,72:[1,119],73:78,80:96,81:[1,122],84:93,100:45,101:[1,85],102:110,103:[1,114],104:[1,115],105:94,106:[1,116],107:92,108:[1,113],109:95,110:[1,117],111:[1,108],112:40,113:[1,79],114:[1,80],115:[1,81],116:168,121:[1,82],137:76,139:[1,120],145:[1,167],154:44,157:75,162:99,163:98,164:[1,121],165:164,167:39,169:[1,77],171:41,172:42,173:[1,43],186:[1,84],187:[1,118]},{31:[1,109],34:165,35:166,50:87,51:[1,111],57:[1,169],59:[1,86],64:[1,83],65:97,70:46,72:[1,119],73:78,80:96,81:[1,122],84:93,100:45,101:[1,85],102:110,103:[1,114],104:[1,115],105:94,106:[1,116],107:92,108:[1,113],109:95,110:[1,117],111:[1,108],112:40,113:[1,79],114:[1,80],115:[1,81],116:168,121:[1,82],137:76,139:[1,120],145:[1,167],154:44,157:75,162:99,163:98,164:[1,121],165:170,167:39,169:[1,77],171:41,172:42,173:[1,43],186:[1,84],187:[1,118]},{1:[2,218],6:[2,218],9:[2,218],10:[2,218],13:[2,218],20:[2,218],21:[2,218],56:[2,218],58:[2,218],66:[2,218],77:[2,218],81:[2,218],82:[2,218],83:[2,218],88:[2,218],96:[2,218],120:[2,218],122:[2,218],134:[2,218],160:[2,218],185:[2,218],189:[2,218],190:[2,218],200:[2,218],201:[2,218],202:[2,218],206:[2,218],214:[2,218],222:[2,218],223:[2,218],226:[2,218],227:[2,218],228:[1,171],229:[1,172],230:[2,218],231:[2,218],232:[2,218],233:[1,173]},{1:[2,340],6:[2,340],9:[2,340],10:[2,340],13:[2,340],21:[2,340],58:[2,340],66:[2,340],77:[2,340],83:[2,340],96:[2,340],120:[2,340],122:[2,340],134:[2,340],160:[2,340],189:[2,340],190:[2,340],200:[2,340],201:[2,340],202:[2,340],206:[2,340],214:[2,340],217:[1,174],221:[1,175],222:[2,340],223:[2,340],226:[2,340],227:[2,340],230:[2,340],231:[2,340],232:[2,340]},{5:176,9:[1,5]},{5:177,9:[1,5]},{1:[2,305],6:[2,305],9:[2,305],10:[2,305],13:[2,305],21:[2,305],58:[2,305],66:[2,305],77:[2,305],83:[2,305],96:[2,305],120:[2,305],122:[2,305],134:[2,305],160:[2,305],189:[2,305],190:[2,305],200:[2,305],201:[2,305],202:[2,305],206:[2,305],214:[2,305],222:[2,305],223:[2,305],226:[2,305],227:[2,305],230:[2,305],231:[2,305],232:[2,305]},{5:178,9:[1,5]},{9:[1,180],12:179,15:145,16:30,17:31,18:[1,32],19:[1,33],22:[1,34],23:[1,35],24:36,25:[1,74],31:[1,109],33:11,34:12,35:13,36:14,37:15,38:16,39:17,40:18,41:19,42:20,43:21,44:22,45:23,46:24,47:25,48:26,49:27,50:87,51:[1,111],57:[1,90],59:[1,86],64:[1,83],65:97,70:46,72:[1,119],73:78,74:[1,70],80:96,81:[1,122],84:93,92:69,93:[1,64],94:[1,107],100:45,101:[1,85],102:110,103:[1,114],104:[1,115],105:94,106:[1,116],107:92,108:[1,113],109:95,110:[1,117],111:[1,108],112:40,113:[1,79],114:[1,80],115:[1,81],116:38,121:[1,82],123:[1,72],127:47,128:48,129:49,130:[1,91],131:[1,89],135:[1,71],137:76,139:[1,120],141:57,143:88,144:[1,66],145:[1,67],146:[1,112],154:44,157:75,162:99,163:98,164:[1,121],165:56,167:39,169:[1,77],170:[1,37],171:41,172:42,173:[1,43],178:63,179:[1,65],180:[1,106],181:[1,68],186:[1,84],187:[1,118],192:[1,58],198:[1,73],199:59,200:[1,101],202:[1,102],203:60,204:[1,103],205:61,206:[1,104],207:105,215:[1,62],220:[1,100],224:[1,50],225:[1,51],226:[1,52],227:[1,53],228:[1,54],229:[1,55]},{1:[2,244],6:[2,244],9:[2,244],10:[2,244],13:[2,244],21:[2,244],58:[2,244],66:[2,244],77:[2,244],83:[2,244],96:[2,244],120:[2,244],122:[2,244],134:[2,244],160:[2,244],189:[2,244],190:[2,244],200:[2,244],201:[2,244],202:[2,244],206:[2,244],214:[2,244],222:[2,244],223:[2,244],226:[2,244],227:[2,244],230:[2,244],231:[2,244],232:[2,244]},{92:182,94:[1,107],178:181,180:[1,106]},{178:183,180:[1,106]},{143:185,146:[1,112],178:184,180:[1,106]},{139:[1,120],143:188,145:[1,167],146:[1,112],163:189,164:[1,121],178:186,179:[1,187],180:[1,106]},{31:[1,109],34:165,35:166,50:87,51:[1,111],57:[1,169],59:[1,86],64:[1,83],65:97,70:46,72:[1,119],73:78,80:96,81:[1,122],84:93,100:45,101:[1,85],102:110,103:[1,114],104:[1,115],105:94,106:[1,116],107:92,108:[1,113],109:95,110:[1,117],111:[1,108],112:40,113:[1,79],114:[1,80],115:[1,81],116:168,121:[1,82],137:76,139:[1,120],145:[1,167],154:44,157:75,162:99,163:98,164:[1,121],165:190,167:39,169:[1,77],171:41,172:42,173:[1,43],186:[1,84],187:[1,118]},{1:[2,93],6:[2,93],9:[2,93],10:[2,93],13:[2,93],21:[2,93],58:[2,93],66:[2,93],77:[2,93],83:[2,93],96:[2,93],120:[2,93],122:[2,93],134:[2,93],160:[2,93],189:[2,93],190:[2,93],200:[2,93],201:[2,93],202:[2,93],206:[2,93],214:[2,93],222:[2,93],223:[2,93],226:[2,93],227:[2,93],230:[2,93],231:[2,93],232:[2,93]},{6:[2,73],13:[2,73],56:[2,73],57:[1,192],59:[2,73],72:[1,195],75:191,77:[2,73],79:193,80:194,82:[2,73],87:[2,73],103:[2,73],104:[2,73],187:[1,118]},{57:[1,198],65:197,72:[1,119],136:196},{1:[2,133],6:[2,133],10:[2,133],12:199,13:[2,133],15:145,16:30,17:31,18:[1,32],19:[1,33],20:[1,201],22:[1,34],23:[1,35],24:36,25:[1,74],31:[1,109],33:11,34:12,35:13,36:14,37:15,38:16,39:17,40:18,41:19,42:20,43:21,44:22,45:23,46:24,47:25,48:26,49:27,50:87,51:[1,111],57:[1,90],59:[1,86],64:[1,83],65:97,70:46,72:[1,119],73:78,74:[1,70],80:96,81:[1,122],84:93,92:69,93:[1,64],94:[1,107],100:45,101:[1,85],102:110,103:[1,114],104:[1,115],105:94,106:[1,116],107:92,108:[1,113],109:95,110:[1,117],111:[1,108],112:40,113:[1,79],114:[1,80],115:[1,81],116:38,121:[1,82],122:[2,133],123:[1,72],124:200,127:47,128:48,129:49,130:[1,91],131:[1,89],135:[1,71],137:76,139:[1,120],141:57,143:88,144:[1,66],145:[1,67],146:[1,112],154:44,157:75,162:99,163:98,164:[1,121],165:56,167:39,169:[1,77],170:[1,37],171:41,172:42,173:[1,43],178:63,179:[1,65],180:[1,106],181:[1,68],186:[1,84],187:[1,118],192:[1,58],198:[1,73],199:59,200:[2,133],202:[2,133],203:60,204:[1,103],205:61,206:[2,133],207:105,215:[1,62],220:[1,100],222:[2,133],224:[1,50],225:[1,51],226:[1,52],227:[1,53],228:[1,54],229:[1,55]},{12:202,15:145,16:30,17:31,18:[1,32],19:[1,33],22:[1,34],23:[1,35],24:36,25:[1,74],31:[1,109],33:11,34:12,35:13,36:14,37:15,38:16,39:17,40:18,41:19,42:20,43:21,44:22,45:23,46:24,47:25,48:26,49:27,50:87,51:[1,111],57:[1,90],59:[1,86],64:[1,83],65:97,70:46,72:[1,119],73:78,74:[1,70],80:96,81:[1,122],84:93,92:69,93:[1,64],94:[1,107],100:45,101:[1,85],102:110,103:[1,114],104:[1,115],105:94,106:[1,116],107:92,108:[1,113],109:95,110:[1,117],111:[1,108],112:40,113:[1,79],114:[1,80],115:[1,81],116:38,121:[1,82],123:[1,72],127:47,128:48,129:49,130:[1,91],131:[1,89],135:[1,71],137:76,139:[1,120],141:57,143:88,144:[1,66],145:[1,67],146:[1,112],154:44,157:75,162:99,163:98,164:[1,121],165:56,167:39,169:[1,77],170:[1,37],171:41,172:42,173:[1,43],178:63,179:[1,65],180:[1,106],181:[1,68],186:[1,84],187:[1,118],192:[1,58],198:[1,73],199:59,200:[1,101],202:[1,102],203:60,204:[1,103],205:61,206:[1,104],207:105,215:[1,62],220:[1,100],224:[1,50],225:[1,51],226:[1,52],227:[1,53],228:[1,54],229:[1,55]},{26:203,28:204,30:205,31:[1,206],32:207,65:209,72:[1,119],107:208,108:[1,113]},{1:[2,219],6:[2,219],9:[2,219],10:[2,219],13:[2,219],20:[2,219],21:[2,219],56:[2,219],58:[2,219],66:[2,219],77:[2,219],81:[2,219],82:[2,219],83:[2,219],88:[2,219],96:[2,219],120:[2,219],122:[2,219],134:[2,219],160:[2,219],185:[2,219],189:[2,219],190:[2,219],200:[2,219],201:[2,219],202:[2,219],206:[2,219],214:[2,219],222:[2,219],223:[2,219],226:[2,219],227:[2,219],230:[2,219],231:[2,219],232:[2,219]},{1:[2,220],6:[2,220],9:[2,220],10:[2,220],13:[2,220],20:[2,220],21:[2,220],56:[2,220],58:[2,220],66:[2,220],77:[2,220],81:[2,220],82:[2,220],83:[2,220],88:[2,220],96:[2,220],120:[2,220],122:[2,220],134:[2,220],160:[2,220],185:[2,220],189:[2,220],190:[2,220],200:[2,220],201:[2,220],202:[2,220],206:[2,220],214:[2,220],222:[2,220],223:[2,220],226:[2,220],227:[2,220],230:[2,220],231:[2,220],232:[2,220]},{1:[2,217],6:[2,217],9:[2,217],10:[2,217],13:[2,217],20:[2,217],21:[2,217],56:[2,217],58:[2,217],66:[2,217],77:[2,217],81:[2,217],82:[2,217],83:[2,217],88:[2,217],96:[2,217],120:[2,217],122:[2,217],134:[2,217],160:[2,217],185:[2,217],189:[2,217],190:[2,217],200:[2,217],201:[2,217],202:[2,217],206:[2,217],214:[2,217],222:[2,217],223:[2,217],226:[2,217],227:[2,217],228:[2,217],229:[2,217],230:[2,217],231:[2,217],232:[2,217],233:[2,217]},{1:[2,115],6:[2,115],9:[2,115],10:[2,115],13:[2,115],20:[2,115],21:[2,115],56:[2,115],58:[2,115],66:[2,115],77:[2,115],81:[2,115],82:[2,115],83:[2,115],96:[2,115],120:[2,115],122:[2,115],134:[2,115],160:[2,115],185:[2,115],189:[2,115],190:[2,115],200:[2,115],201:[2,115],202:[2,115],206:[2,115],214:[2,115],222:[2,115],223:[2,115],226:[2,115],227:[2,115],230:[2,115],231:[2,115],232:[2,115]},{1:[2,116],6:[2,116],9:[2,116],10:[2,116],13:[2,116],20:[2,116],21:[2,116],56:[2,116],58:[2,116],66:[2,116],77:[2,116],81:[2,116],82:[2,116],83:[2,116],96:[2,116],120:[2,116],122:[2,116],134:[2,116],160:[2,116],185:[2,116],189:[2,116],190:[2,116],200:[2,116],201:[2,116],202:[2,116],206:[2,116],214:[2,116],222:[2,116],223:[2,116],226:[2,116],227:[2,116],230:[2,116],231:[2,116],232:[2,116]},{1:[2,117],6:[2,117],9:[2,117],10:[2,117],13:[2,117],20:[2,117],21:[2,117],56:[2,117],58:[2,117],66:[2,117],77:[2,117],81:[2,117],82:[2,117],83:[2,117],96:[2,117],120:[2,117],122:[2,117],134:[2,117],160:[2,117],185:[2,117],189:[2,117],190:[2,117],200:[2,117],201:[2,117],202:[2,117],206:[2,117],214:[2,117],222:[2,117],223:[2,117],226:[2,117],227:[2,117],230:[2,117],231:[2,117],232:[2,117]},{1:[2,118],6:[2,118],9:[2,118],10:[2,118],13:[2,118],20:[2,118],21:[2,118],56:[2,118],58:[2,118],66:[2,118],77:[2,118],81:[2,118],82:[2,118],83:[2,118],96:[2,118],120:[2,118],122:[2,118],134:[2,118],160:[2,118],185:[2,118],189:[2,118],190:[2,118],200:[2,118],201:[2,118],202:[2,118],206:[2,118],214:[2,118],222:[2,118],223:[2,118],226:[2,118],227:[2,118],230:[2,118],231:[2,118],232:[2,118]},{4:210,7:4,9:[1,211],11:6,12:7,14:8,15:9,16:30,17:31,18:[1,32],19:[1,33],22:[1,34],23:[1,35],24:36,25:[1,74],31:[1,109],33:11,34:12,35:13,36:14,37:15,38:16,39:17,40:18,41:19,42:20,43:21,44:22,45:23,46:24,47:25,48:26,49:27,50:87,51:[1,111],57:[1,90],59:[1,86],64:[1,83],65:97,70:46,72:[1,119],73:78,74:[1,70],80:96,81:[1,122],84:93,92:69,93:[1,64],94:[1,107],100:45,101:[1,85],102:110,103:[1,114],104:[1,115],105:94,106:[1,116],107:92,108:[1,113],109:95,110:[1,117],111:[1,108],112:40,113:[1,79],114:[1,80],115:[1,81],116:38,121:[1,82],123:[1,72],125:[1,28],126:[1,29],127:47,128:48,129:49,130:[1,91],131:[1,89],135:[1,71],137:76,139:[1,120],141:57,143:88,144:[1,66],145:[1,67],146:[1,112],154:44,157:75,159:[1,10],162:99,163:98,164:[1,121],165:56,167:39,169:[1,77],170:[1,37],171:41,172:42,173:[1,43],178:63,179:[1,65],180:[1,106],181:[1,68],186:[1,84],187:[1,118],192:[1,58],198:[1,73],199:59,200:[1,101],202:[1,102],203:60,204:[1,103],205:61,206:[1,104],207:105,215:[1,62],220:[1,100],224:[1,50],225:[1,51],226:[1,52],227:[1,53],228:[1,54],229:[1,55]},{9:[1,216],11:217,12:212,14:219,15:145,16:30,17:31,18:[1,32],19:[1,33],22:[1,34],23:[1,35],24:36,25:[1,74],31:[1,109],33:11,34:12,35:13,36:14,37:15,38:16,39:17,40:18,41:19,42:20,43:21,44:22,45:23,46:24,47:25,48:26,49:27,50:87,51:[1,111],57:[1,90],59:[1,86],64:[1,83],65:97,66:[1,213],70:46,72:[1,119],73:78,74:[1,70],80:96,81:[1,122],84:93,90:214,92:69,93:[1,64],94:[1,107],100:45,101:[1,85],102:110,103:[1,114],104:[1,115],105:94,106:[1,116],107:92,108:[1,113],109:95,110:[1,117],111:[1,108],112:40,113:[1,79],114:[1,80],115:[1,81],116:38,121:[1,82],123:[1,72],125:[1,28],126:[1,29],127:47,128:48,129:49,130:[1,91],131:[1,89],135:[1,71],137:76,139:[1,120],141:57,143:88,144:[1,66],145:[1,67],146:[1,112],154:44,157:75,159:[1,10],160:[1,218],162:99,163:98,164:[1,121],165:56,167:39,169:[1,77],170:[1,37],171:41,172:42,173:[1,43],175:215,178:63,179:[1,65],180:[1,106],181:[1,68],186:[1,84],187:[1,118],192:[1,58],198:[1,73],199:59,200:[1,101],202:[1,102],203:60,204:[1,103],205:61,206:[1,104],207:105,215:[1,62],220:[1,100],224:[1,50],225:[1,51],226:[1,52],227:[1,53],228:[1,54],229:[1,55]},{1:[2,266],6:[2,266],9:[2,266],10:[2,266],13:[2,266],20:[2,266],21:[2,266],56:[2,266],58:[2,266],59:[2,266],66:[2,266],77:[2,266],81:[2,266],82:[2,266],83:[2,266],96:[2,266],120:[2,266],122:[2,266],134:[2,266],160:[2,266],185:[2,266],189:[2,266],190:[2,266],200:[2,266],201:[2,266],202:[2,266],206:[2,266],214:[2,266],222:[2,266],223:[2,266],226:[2,266],227:[2,266],230:[2,266],231:[2,266],232:[2,266]},{1:[2,104],6:[2,104],9:[2,104],10:[2,104],13:[2,104],20:[2,104],21:[2,104],56:[2,104],58:[2,104],66:[2,104],77:[2,104],81:[2,104],82:[2,104],83:[2,104],96:[2,104],120:[2,104],122:[2,104],134:[2,104],160:[2,104],185:[2,104],189:[2,104],190:[2,104],200:[2,104],201:[2,104],202:[2,104],206:[2,104],214:[2,104],222:[2,104],223:[2,104],226:[2,104],227:[2,104],230:[2,104],231:[2,104],232:[2,104]},{65:220,72:[1,119]},{52:222,53:[1,223],54:[1,224],55:[1,225],56:[1,226],59:[1,227],60:[1,228],61:[1,229],62:[1,230],63:[1,231],64:[1,232],69:[1,233],71:[1,221]},{1:[2,152],6:[2,152],9:[2,152],10:[2,152],13:[2,152],21:[2,152],58:[2,152],66:[2,152],77:[2,152],83:[2,152],96:[2,152],120:[2,152],122:[2,152],134:[2,152],160:[2,152],189:[2,152],190:[2,152],200:[2,152],201:[2,152],202:[2,152],206:[2,152],214:[2,152],222:[2,152],223:[2,152],226:[2,152],227:[2,152],230:[2,152],231:[2,152],232:[2,152]},{5:234,9:[1,5],132:[1,235]},{6:[2,239],9:[2,239],13:[2,239],14:240,31:[1,109],58:[2,239],65:241,72:[1,119],73:243,81:[1,122],84:244,102:110,103:[1,114],104:[1,115],105:245,106:[1,116],107:242,108:[1,113],111:[1,108],118:238,119:239,121:[1,246],125:[1,28],126:[1,29],132:[1,236],177:237},{5:247,9:[1,5]},{1:[2,196],6:[2,196],9:[2,196],10:[2,196],13:[2,196],20:[2,196],21:[2,196],56:[2,196],58:[2,196],66:[2,196],77:[2,196],81:[2,196],82:[2,196],83:[2,196],88:[2,196],96:[2,196],120:[2,196],122:[2,196],134:[2,196],160:[2,196],185:[2,196],189:[2,196],190:[2,196],200:[2,196],201:[2,196],202:[2,196],206:[2,196],214:[2,196],222:[2,196],223:[2,196],226:[2,196],227:[2,196],228:[2,196],229:[2,196],230:[2,196],231:[2,196],232:[2,196],233:[2,196]},{1:[2,197],6:[2,197],9:[2,197],10:[2,197],13:[2,197],20:[2,197],21:[2,197],56:[2,197],58:[2,197],66:[2,197],77:[2,197],81:[2,197],82:[2,197],83:[2,197],88:[2,197],96:[2,197],120:[2,197],122:[2,197],134:[2,197],160:[2,197],185:[2,197],189:[2,197],190:[2,197],200:[2,197],201:[2,197],202:[2,197],206:[2,197],214:[2,197],222:[2,197],223:[2,197],226:[2,197],227:[2,197],228:[2,197],229:[2,197],230:[2,197],231:[2,197],232:[2,197],233:[2,197]},{1:[2,198],6:[2,198],9:[2,198],10:[2,198],13:[2,198],20:[2,198],21:[2,198],56:[2,198],58:[2,198],66:[2,198],77:[2,198],81:[2,198],82:[2,198],83:[2,198],88:[2,198],96:[2,198],120:[2,198],122:[2,198],134:[2,198],160:[2,198],185:[2,198],189:[2,198],190:[2,198],200:[2,198],201:[2,198],202:[2,198],206:[2,198],214:[2,198],222:[2,198],223:[2,198],226:[2,198],227:[2,198],228:[2,198],229:[2,198],230:[2,198],231:[2,198],232:[2,198],233:[2,198]},{1:[2,199],6:[2,199],9:[2,199],10:[2,199],13:[2,199],20:[2,199],21:[2,199],56:[2,199],58:[2,199],66:[2,199],77:[2,199],81:[2,199],82:[2,199],83:[2,199],88:[2,199],96:[2,199],120:[2,199],122:[2,199],134:[2,199],160:[2,199],185:[2,199],189:[2,199],190:[2,199],200:[2,199],201:[2,199],202:[2,199],206:[2,199],214:[2,199],222:[2,199],223:[2,199],226:[2,199],227:[2,199],228:[2,199],229:[2,199],230:[2,199],231:[2,199],232:[2,199],233:[2,199]},{1:[2,200],6:[2,200],9:[2,200],10:[2,200],13:[2,200],20:[2,200],21:[2,200],56:[2,200],58:[2,200],66:[2,200],77:[2,200],81:[2,200],82:[2,200],83:[2,200],88:[2,200],96:[2,200],120:[2,200],122:[2,200],134:[2,200],160:[2,200],185:[2,200],189:[2,200],190:[2,200],200:[2,200],201:[2,200],202:[2,200],206:[2,200],214:[2,200],222:[2,200],223:[2,200],226:[2,200],227:[2,200],228:[2,200],229:[2,200],230:[2,200],231:[2,200],232:[2,200],233:[2,200]},{1:[2,201],6:[2,201],9:[2,201],10:[2,201],13:[2,201],20:[2,201],21:[2,201],56:[2,201],58:[2,201],66:[2,201],77:[2,201],81:[2,201],82:[2,201],83:[2,201],88:[2,201],96:[2,201],120:[2,201],122:[2,201],134:[2,201],160:[2,201],185:[2,201],189:[2,201],190:[2,201],200:[2,201],201:[2,201],202:[2,201],206:[2,201],214:[2,201],222:[2,201],223:[2,201],226:[2,201],227:[2,201],228:[2,201],229:[2,201],230:[2,201],231:[2,201],232:[2,201],233:[2,201]},{1:[2,202],6:[2,202],9:[2,202],10:[2,202],13:[2,202],20:[2,202],21:[2,202],56:[2,202],58:[2,202],66:[2,202],77:[2,202],81:[2,202],82:[2,202],83:[2,202],88:[2,202],96:[2,202],120:[2,202],122:[2,202],134:[2,202],160:[2,202],185:[2,202],189:[2,202],190:[2,202],200:[2,202],201:[2,202],202:[2,202],206:[2,202],214:[2,202],222:[2,202],223:[2,202],226:[2,202],227:[2,202],228:[2,202],229:[2,202],230:[2,202],231:[2,202],232:[2,202],233:[2,202]},{1:[2,203],6:[2,203],9:[2,203],10:[2,203],13:[2,203],20:[2,203],21:[2,203],56:[2,203],58:[2,203],66:[2,203],77:[2,203],81:[2,203],82:[2,203],83:[2,203],88:[2,203],96:[2,203],120:[2,203],122:[2,203],134:[2,203],160:[2,203],185:[2,203],189:[2,203],190:[2,203],200:[2,203],201:[2,203],202:[2,203],206:[2,203],214:[2,203],222:[2,203],223:[2,203],226:[2,203],227:[2,203],228:[2,203],229:[2,203],230:[2,203],231:[2,203],232:[2,203],233:[2,203]},{12:248,15:145,16:30,17:31,18:[1,32],19:[1,33],22:[1,34],23:[1,35],24:36,25:[1,74],31:[1,109],33:11,34:12,35:13,36:14,37:15,38:16,39:17,40:18,41:19,42:20,43:21,44:22,45:23,46:24,47:25,48:26,49:27,50:87,51:[1,111],57:[1,90],59:[1,86],64:[1,83],65:97,70:46,72:[1,119],73:78,74:[1,70],80:96,81:[1,122],84:93,92:69,93:[1,64],94:[1,107],100:45,101:[1,85],102:110,103:[1,114],104:[1,115],105:94,106:[1,116],107:92,108:[1,113],109:95,110:[1,117],111:[1,108],112:40,113:[1,79],114:[1,80],115:[1,81],116:38,121:[1,82],123:[1,72],127:47,128:48,129:49,130:[1,91],131:[1,89],135:[1,71],137:76,139:[1,120],141:57,143:88,144:[1,66],145:[1,67],146:[1,112],154:44,157:75,162:99,163:98,164:[1,121],165:56,167:39,169:[1,77],170:[1,37],171:41,172:42,173:[1,43],178:63,179:[1,65],180:[1,106],181:[1,68],186:[1,84],187:[1,118],192:[1,58],198:[1,73],199:59,200:[1,101],202:[1,102],203:60,204:[1,103],205:61,206:[1,104],207:105,215:[1,62],220:[1,100],224:[1,50],225:[1,51],226:[1,52],227:[1,53],228:[1,54],229:[1,55]},{12:249,15:145,16:30,17:31,18:[1,32],19:[1,33],22:[1,34],23:[1,35],24:36,25:[1,74],31:[1,109],33:11,34:12,35:13,36:14,37:15,38:16,39:17,40:18,41:19,42:20,43:21,44:22,45:23,46:24,47:25,48:26,49:27,50:87,51:[1,111],57:[1,90],59:[1,86],64:[1,83],65:97,70:46,72:[1,119],73:78,74:[1,70],80:96,81:[1,122],84:93,92:69,93:[1,64],94:[1,107],100:45,101:[1,85],102:110,103:[1,114],104:[1,115],105:94,106:[1,116],107:92,108:[1,113],109:95,110:[1,117],111:[1,108],112:40,113:[1,79],114:[1,80],115:[1,81],116:38,121:[1,82],123:[1,72],127:47,128:48,129:49,130:[1,91],131:[1,89],135:[1,71],137:76,139:[1,120],141:57,143:88,144:[1,66],145:[1,67],146:[1,112],154:44,157:75,162:99,163:98,164:[1,121],165:56,167:39,169:[1,77],170:[1,37],171:41,172:42,173:[1,43],178:63,179:[1,65],180:[1,106],181:[1,68],186:[1,84],187:[1,118],192:[1,58],198:[1,73],199:59,200:[1,101],202:[1,102],203:60,204:[1,103],205:61,206:[1,104],207:105,215:[1,62],220:[1,100],224:[1,50],225:[1,51],226:[1,52],227:[1,53],228:[1,54],229:[1,55]},{12:250,15:145,16:30,17:31,18:[1,32],19:[1,33],22:[1,34],23:[1,35],24:36,25:[1,74],31:[1,109],33:11,34:12,35:13,36:14,37:15,38:16,39:17,40:18,41:19,42:20,43:21,44:22,45:23,46:24,47:25,48:26,49:27,50:87,51:[1,111],57:[1,90],59:[1,86],64:[1,83],65:97,70:46,72:[1,119],73:78,74:[1,70],80:96,81:[1,122],84:93,92:69,93:[1,64],94:[1,107],100:45,101:[1,85],102:110,103:[1,114],104:[1,115],105:94,106:[1,116],107:92,108:[1,113],109:95,110:[1,117],111:[1,108],112:40,113:[1,79],114:[1,80],115:[1,81],116:38,121:[1,82],123:[1,72],127:47,128:48,129:49,130:[1,91],131:[1,89],135:[1,71],137:76,139:[1,120],141:57,143:88,144:[1,66],145:[1,67],146:[1,112],154:44,157:75,162:99,163:98,164:[1,121],165:56,167:39,169:[1,77],170:[1,37],171:41,172:42,173:[1,43],178:63,179:[1,65],180:[1,106],181:[1,68],186:[1,84],187:[1,118],192:[1,58],198:[1,73],199:59,200:[1,101],202:[1,102],203:60,204:[1,103],205:61,206:[1,104],207:105,215:[1,62],220:[1,100],224:[1,50],225:[1,51],226:[1,52],227:[1,53],228:[1,54],229:[1,55]},{5:251,9:[1,5],12:252,15:145,16:30,17:31,18:[1,32],19:[1,33],22:[1,34],23:[1,35],24:36,25:[1,74],31:[1,109],33:11,34:12,35:13,36:14,37:15,38:16,39:17,40:18,41:19,42:20,43:21,44:22,45:23,46:24,47:25,48:26,49:27,50:87,51:[1,111],57:[1,90],59:[1,86],64:[1,83],65:97,70:46,72:[1,119],73:78,74:[1,70],80:96,81:[1,122],84:93,92:69,93:[1,64],94:[1,107],100:45,101:[1,85],102:110,103:[1,114],104:[1,115],105:94,106:[1,116],107:92,108:[1,113],109:95,110:[1,117],111:[1,108],112:40,113:[1,79],114:[1,80],115:[1,81],116:38,121:[1,82],123:[1,72],127:47,128:48,129:49,130:[1,91],131:[1,89],135:[1,71],137:76,139:[1,120],141:57,143:88,144:[1,66],145:[1,67],146:[1,112],154:44,157:75,162:99,163:98,164:[1,121],165:56,167:39,169:[1,77],170:[1,37],171:41,172:42,173:[1,43],178:63,179:[1,65],180:[1,106],181:[1,68],186:[1,84],187:[1,118],192:[1,58],198:[1,73],199:59,200:[1,101],202:[1,102],203:60,204:[1,103],205:61,206:[1,104],207:105,215:[1,62],220:[1,100],224:[1,50],225:[1,51],226:[1,52],227:[1,53],228:[1,54],229:[1,55]},{57:[1,169],64:[1,83],65:257,72:[1,119],137:259,157:258,172:253,209:254,210:[1,255],211:256},{208:260,212:[1,261],213:[1,262]},{31:[1,109],34:165,35:166,50:87,51:[1,111],57:[1,169],59:[1,86],64:[1,83],65:97,70:46,72:[1,119],73:78,80:96,81:[1,122],84:93,100:45,101:[1,85],102:110,103:[1,114],104:[1,115],105:94,106:[1,116],107:92,108:[1,113],109:95,110:[1,117],111:[1,108],112:40,113:[1,79],114:[1,80],115:[1,81],116:168,121:[1,82],137:76,139:[1,120],145:[1,167],154:44,157:75,162:99,163:98,164:[1,121],165:263,167:39,169:[1,77],171:41,172:42,173:[1,43],186:[1,84],187:[1,118]},{95:264,98:[1,265],99:[1,266]},{1:[2,112],6:[2,112],9:[2,112],10:[2,112],13:[2,112],20:[2,112],21:[2,112],56:[2,112],58:[2,112],66:[2,112],77:[2,112],81:[2,112],82:[2,112],83:[2,112],96:[2,112],120:[2,112],122:[2,112],134:[2,112],160:[2,112],185:[2,112],189:[2,112],190:[2,112],200:[2,112],201:[2,112],202:[2,112],206:[2,112],214:[2,112],222:[2,112],223:[2,112],226:[2,112],227:[2,112],230:[2,112],231:[2,112],232:[2,112]},{1:[2,113],6:[2,113],9:[2,113],10:[2,113],13:[2,113],20:[2,113],21:[2,113],56:[2,113],58:[2,113],66:[2,113],77:[2,113],81:[2,113],82:[2,113],83:[2,113],96:[2,113],120:[2,113],122:[2,113],134:[2,113],160:[2,113],185:[2,113],189:[2,113],190:[2,113],200:[2,113],201:[2,113],202:[2,113],206:[2,113],214:[2,113],222:[2,113],223:[2,113],226:[2,113],227:[2,113],230:[2,113],231:[2,113],232:[2,113]},{1:[2,114],6:[2,114],9:[2,114],10:[2,114],13:[2,114],20:[2,114],21:[2,114],56:[2,114],58:[2,114],66:[2,114],77:[2,114],81:[2,114],82:[2,114],83:[2,114],96:[2,114],120:[2,114],122:[2,114],134:[2,114],160:[2,114],185:[2,114],189:[2,114],190:[2,114],200:[2,114],201:[2,114],202:[2,114],206:[2,114],214:[2,114],222:[2,114],223:[2,114],226:[2,114],227:[2,114],230:[2,114],231:[2,114],232:[2,114]},{53:[2,50],54:[2,50],55:[2,50],56:[2,50],59:[2,50],60:[2,50],61:[2,50],62:[2,50],63:[2,50],64:[2,50],69:[2,50],71:[2,50]},{57:[1,274],65:272,72:[1,119],80:270,105:271,106:[1,116],107:273,108:[1,113],147:267,149:268,154:269,186:[1,84],187:[1,118]},{1:[2,110],6:[2,110],9:[2,110],10:[2,110],13:[2,110],20:[2,110],21:[2,110],27:[2,110],56:[2,110],58:[2,110],59:[2,110],66:[2,110],77:[2,110],81:[2,110],82:[2,110],83:[2,110],88:[2,110],96:[2,110],120:[2,110],122:[2,110],134:[2,110],150:[2,110],152:[2,110],160:[2,110],185:[2,110],189:[2,110],190:[2,110],200:[2,110],201:[2,110],202:[2,110],206:[2,110],214:[2,110],222:[2,110],223:[2,110],226:[2,110],227:[2,110],228:[2,110],229:[2,110],230:[2,110],231:[2,110],232:[2,110],233:[2,110]},{1:[2,107],6:[2,107],9:[2,107],10:[2,107],13:[2,107],20:[2,107],21:[2,107],56:[2,107],58:[2,107],59:[2,107],66:[2,107],77:[2,107],81:[2,107],82:[2,107],83:[2,107],87:[2,107],88:[2,107],96:[2,107],103:[2,107],104:[2,107],120:[2,107],122:[2,107],134:[2,107],160:[2,107],185:[2,107],189:[2,107],190:[2,107],200:[2,107],201:[2,107],202:[2,107],206:[2,107],214:[2,107],222:[2,107],223:[2,107],226:[2,107],227:[2,107],228:[2,107],229:[2,107],230:[2,107],231:[2,107],232:[2,107],233:[2,107]},{1:[2,108],6:[2,108],9:[2,108],10:[2,108],13:[2,108],20:[2,108],21:[2,108],56:[2,108],58:[2,108],59:[2,108],66:[2,108],77:[2,108],81:[2,108],82:[2,108],83:[2,108],87:[2,108],88:[2,108],96:[2,108],103:[2,108],104:[2,108],120:[2,108],122:[2,108],134:[2,108],160:[2,108],185:[2,108],189:[2,108],190:[2,108],200:[2,108],201:[2,108],202:[2,108],206:[2,108],214:[2,108],222:[2,108],223:[2,108],226:[2,108],227:[2,108],228:[2,108],229:[2,108],230:[2,108],231:[2,108],232:[2,108],233:[2,108]},{1:[2,109],6:[2,109],9:[2,109],10:[2,109],13:[2,109],20:[2,109],21:[2,109],56:[2,109],58:[2,109],59:[2,109],66:[2,109],77:[2,109],81:[2,109],82:[2,109],83:[2,109],88:[2,109],96:[2,109],120:[2,109],122:[2,109],134:[2,109],160:[2,109],185:[2,109],189:[2,109],190:[2,109],200:[2,109],201:[2,109],202:[2,109],206:[2,109],214:[2,109],222:[2,109],223:[2,109],226:[2,109],227:[2,109],228:[2,109],229:[2,109],230:[2,109],231:[2,109],232:[2,109],233:[2,109]},{1:[2,111],6:[2,111],9:[2,111],10:[2,111],13:[2,111],20:[2,111],21:[2,111],56:[2,111],58:[2,111],66:[2,111],77:[2,111],81:[2,111],82:[2,111],83:[2,111],88:[2,111],96:[2,111],120:[2,111],122:[2,111],134:[2,111],160:[2,111],185:[2,111],189:[2,111],190:[2,111],200:[2,111],201:[2,111],202:[2,111],206:[2,111],214:[2,111],222:[2,111],223:[2,111],226:[2,111],227:[2,111],228:[2,111],229:[2,111],230:[2,111],231:[2,111],232:[2,111],233:[2,111]},{1:[2,267],6:[2,267],9:[2,267],10:[2,267],13:[2,267],20:[2,267],21:[2,267],56:[2,267],58:[2,267],59:[2,267],66:[2,267],77:[2,267],81:[2,267],82:[2,267],83:[2,267],87:[2,267],88:[2,267],96:[2,267],103:[2,267],104:[2,267],120:[2,267],122:[2,267],134:[2,267],160:[2,267],185:[2,267],189:[2,267],190:[2,267],200:[2,267],201:[2,267],202:[2,267],206:[2,267],214:[2,267],222:[2,267],223:[2,267],226:[2,267],227:[2,267],228:[2,267],229:[2,267],230:[2,267],231:[2,267],232:[2,267],233:[2,267]},{1:[2,103],6:[2,103],9:[2,103],10:[2,103],13:[2,103],20:[2,103],21:[2,103],27:[2,103],56:[2,103],57:[2,103],58:[2,103],59:[2,103],66:[2,103],67:[2,103],77:[2,103],81:[2,103],82:[2,103],83:[2,103],88:[2,103],96:[2,103],120:[2,103],122:[2,103],134:[2,103],150:[2,103],152:[2,103],160:[2,103],185:[2,103],189:[2,103],190:[2,103],200:[2,103],201:[2,103],202:[2,103],206:[2,103],212:[2,103],213:[2,103],214:[2,103],222:[2,103],223:[2,103],226:[2,103],227:[2,103],228:[2,103],229:[2,103],230:[2,103],231:[2,103],232:[2,103],233:[2,103]},{32:276,65:209,72:[1,119],107:208,108:[1,113],159:[1,275]},{32:277,65:209,72:[1,119],107:208,108:[1,113],159:[1,278]},{1:[2,106],6:[2,106],9:[2,106],10:[2,106],13:[2,106],20:[2,106],21:[2,106],56:[2,106],58:[2,106],66:[2,106],77:[2,106],81:[2,106],82:[2,106],83:[2,106],88:[2,106],96:[2,106],120:[2,106],122:[2,106],134:[2,106],160:[2,106],185:[2,106],189:[2,106],190:[2,106],200:[2,106],201:[2,106],202:[2,106],206:[2,106],214:[2,106],222:[2,106],223:[2,106],226:[2,106],227:[2,106],228:[2,106],229:[2,106],230:[2,106],231:[2,106],232:[2,106],233:[2,106]},{1:[2,6],6:[2,6],7:279,10:[2,6],11:6,12:7,14:8,15:9,16:30,17:31,18:[1,32],19:[1,33],22:[1,34],23:[1,35],24:36,25:[1,74],31:[1,109],33:11,34:12,35:13,36:14,37:15,38:16,39:17,40:18,41:19,42:20,43:21,44:22,45:23,46:24,47:25,48:26,49:27,50:87,51:[1,111],57:[1,90],59:[1,86],64:[1,83],65:97,70:46,72:[1,119],73:78,74:[1,70],80:96,81:[1,122],84:93,92:69,93:[1,64],94:[1,107],100:45,101:[1,85],102:110,103:[1,114],104:[1,115],105:94,106:[1,116],107:92,108:[1,113],109:95,110:[1,117],111:[1,108],112:40,113:[1,79],114:[1,80],115:[1,81],116:38,121:[1,82],122:[2,6],123:[1,72],125:[1,28],126:[1,29],127:47,128:48,129:49,130:[1,91],131:[1,89],135:[1,71],137:76,139:[1,120],141:57,143:88,144:[1,66],145:[1,67],146:[1,112],154:44,157:75,159:[1,10],162:99,163:98,164:[1,121],165:56,167:39,169:[1,77],170:[1,37],171:41,172:42,173:[1,43],178:63,179:[1,65],180:[1,106],181:[1,68],186:[1,84],187:[1,118],192:[1,58],198:[1,73],199:59,200:[1,101],202:[1,102],203:60,204:[1,103],205:61,206:[1,104],207:105,215:[1,62],220:[1,100],224:[1,50],225:[1,51],226:[1,52],227:[1,53],228:[1,54],229:[1,55]},{1:[2,7],6:[2,7],10:[2,7],18:[2,7],19:[2,7],22:[2,7],23:[2,7],25:[2,7],31:[2,7],51:[2,7],57:[2,7],59:[2,7],64:[2,7],72:[2,7],74:[2,7],81:[2,7],93:[2,7],94:[2,7],101:[2,7],103:[2,7],104:[2,7],106:[2,7],108:[2,7],110:[2,7],111:[2,7],113:[2,7],114:[2,7],115:[2,7],121:[2,7],122:[2,7],123:[2,7],125:[2,7],126:[2,7],130:[2,7],131:[2,7],135:[2,7],139:[2,7],144:[2,7],145:[2,7],146:[2,7],159:[2,7],160:[2,7],164:[2,7],169:[2,7],170:[2,7],173:[2,7],179:[2,7],180:[2,7],181:[2,7],186:[2,7],187:[2,7],192:[2,7],198:[2,7],200:[2,7],202:[2,7],204:[2,7],206:[2,7],215:[2,7],220:[2,7],224:[2,7],225:[2,7],226:[2,7],227:[2,7],228:[2,7],229:[2,7]},{1:[2,3]},{11:281,12:280,15:145,16:30,17:31,18:[1,32],19:[1,33],22:[1,34],23:[1,35],24:36,25:[1,74],31:[1,109],33:11,34:12,35:13,36:14,37:15,38:16,39:17,40:18,41:19,42:20,43:21,44:22,45:23,46:24,47:25,48:26,49:27,50:87,51:[1,111],57:[1,90],59:[1,86],64:[1,83],65:97,70:46,72:[1,119],73:78,74:[1,70],80:96,81:[1,122],84:93,92:69,93:[1,64],94:[1,107],100:45,101:[1,85],102:110,103:[1,114],104:[1,115],105:94,106:[1,116],107:92,108:[1,113],109:95,110:[1,117],111:[1,108],112:40,113:[1,79],114:[1,80],115:[1,81],116:38,121:[1,82],123:[1,72],127:47,128:48,129:49,130:[1,91],131:[1,89],135:[1,71],137:76,139:[1,120],141:57,143:88,144:[1,66],145:[1,67],146:[1,112],154:44,157:75,159:[1,10],162:99,163:98,164:[1,121],165:56,167:39,169:[1,77],170:[1,37],171:41,172:42,173:[1,43],178:63,179:[1,65],180:[1,106],181:[1,68],186:[1,84],187:[1,118],192:[1,58],198:[1,73],199:59,200:[1,101],202:[1,102],203:60,204:[1,103],205:61,206:[1,104],207:105,215:[1,62],220:[1,100],224:[1,50],225:[1,51],226:[1,52],227:[1,53],228:[1,54],229:[1,55]},{1:[2,8],6:[2,8],9:[2,8],10:[2,8],13:[2,8],20:[2,8],21:[2,8],56:[2,8],57:[2,8],58:[2,8],66:[2,8],77:[2,8],82:[2,8],83:[2,8],96:[2,8],120:[2,8],122:[2,8],131:[2,8],134:[2,8],160:[2,8],185:[2,8],189:[2,8],190:[2,8],195:[2,8],196:[2,8],200:[2,8],201:[2,8],202:[2,8],206:[2,8],214:[2,8],217:[2,8],219:[2,8],221:[2,8],222:[2,8],223:[2,8],226:[2,8],227:[2,8],230:[2,8],231:[2,8],232:[2,8]},{6:[1,124],8:123,10:[1,282]},{4:283,7:4,11:6,12:7,14:8,15:9,16:30,17:31,18:[1,32],19:[1,33],22:[1,34],23:[1,35],24:36,25:[1,74],31:[1,109],33:11,34:12,35:13,36:14,37:15,38:16,39:17,40:18,41:19,42:20,43:21,44:22,45:23,46:24,47:25,48:26,49:27,50:87,51:[1,111],57:[1,90],59:[1,86],64:[1,83],65:97,70:46,72:[1,119],73:78,74:[1,70],80:96,81:[1,122],84:93,92:69,93:[1,64],94:[1,107],100:45,101:[1,85],102:110,103:[1,114],104:[1,115],105:94,106:[1,116],107:92,108:[1,113],109:95,110:[1,117],111:[1,108],112:40,113:[1,79],114:[1,80],115:[1,81],116:38,121:[1,82],123:[1,72],125:[1,28],126:[1,29],127:47,128:48,129:49,130:[1,91],131:[1,89],135:[1,71],137:76,139:[1,120],141:57,143:88,144:[1,66],145:[1,67],146:[1,112],154:44,157:75,159:[1,10],162:99,163:98,164:[1,121],165:56,167:39,169:[1,77],170:[1,37],171:41,172:42,173:[1,43],178:63,179:[1,65],180:[1,106],181:[1,68],186:[1,84],187:[1,118],192:[1,58],198:[1,73],199:59,200:[1,101],202:[1,102],203:60,204:[1,103],205:61,206:[1,104],207:105,215:[1,62],220:[1,100],224:[1,50],225:[1,51],226:[1,52],227:[1,53],228:[1,54],229:[1,55]},{1:[2,352],6:[2,352],9:[2,352],10:[2,352],12:284,13:[2,352],15:145,16:30,17:31,18:[1,32],19:[1,33],21:[2,352],22:[1,34],23:[1,35],24:36,25:[1,74],31:[1,109],33:11,34:12,35:13,36:14,37:15,38:16,39:17,40:18,41:19,42:20,43:21,44:22,45:23,46:24,47:25,48:26,49:27,50:87,51:[1,111],57:[1,90],58:[2,352],59:[1,86],64:[1,83],65:97,66:[2,352],70:46,72:[1,119],73:78,74:[1,70],77:[2,352],80:96,81:[1,122],83:[2,352],84:93,92:69,93:[1,64],94:[1,107],96:[2,352],100:45,101:[1,85],102:110,103:[1,114],104:[1,115],105:94,106:[1,116],107:92,108:[1,113],109:95,110:[1,117],111:[1,108],112:40,113:[1,79],114:[1,80],115:[1,81],116:38,120:[2,352],121:[1,82],122:[2,352],123:[1,72],127:47,128:48,129:49,130:[1,91],131:[1,89],134:[2,352],135:[1,71],137:76,139:[1,120],141:57,143:88,144:[1,66],145:[1,67],146:[1,112],154:44,157:75,160:[2,352],162:99,163:98,164:[1,121],165:56,167:39,169:[1,77],170:[1,37],171:41,172:42,173:[1,43],178:63,179:[1,65],180:[1,106],181:[1,68],186:[1,84],187:[1,118],189:[2,352],190:[2,352],192:[1,58],198:[1,73],199:59,200:[2,352],201:[2,352],202:[2,352],203:60,204:[1,103],205:61,206:[2,352],207:105,214:[2,352],215:[1,62],220:[1,100],222:[2,352],223:[2,352],224:[1,50],225:[1,51],226:[1,52],227:[1,53],228:[1,54],229:[1,55],230:[2,352],231:[2,352],232:[2,352]},{12:285,15:145,16:30,17:31,18:[1,32],19:[1,33],22:[1,34],23:[1,35],24:36,25:[1,74],31:[1,109],33:11,34:12,35:13,36:14,37:15,38:16,39:17,40:18,41:19,42:20,43:21,44:22,45:23,46:24,47:25,48:26,49:27,50:87,51:[1,111],57:[1,90],59:[1,86],64:[1,83],65:97,70:46,72:[1,119],73:78,74:[1,70],80:96,81:[1,122],84:93,92:69,93:[1,64],94:[1,107],100:45,101:[1,85],102:110,103:[1,114],104:[1,115],105:94,106:[1,116],107:92,108:[1,113],109:95,110:[1,117],111:[1,108],112:40,113:[1,79],114:[1,80],115:[1,81],116:38,121:[1,82],123:[1,72],127:47,128:48,129:49,130:[1,91],131:[1,89],135:[1,71],137:76,139:[1,120],141:57,143:88,144:[1,66],145:[1,67],146:[1,112],154:44,157:75,162:99,163:98,164:[1,121],165:56,167:39,169:[1,77],170:[1,37],171:41,172:42,173:[1,43],178:63,179:[1,65],180:[1,106],181:[1,68],186:[1,84],187:[1,118],192:[1,58],198:[1,73],199:59,200:[1,101],202:[1,102],203:60,204:[1,103],205:61,206:[1,104],207:105,215:[1,62],220:[1,100],224:[1,50],225:[1,51],226:[1,52],227:[1,53],228:[1,54],229:[1,55]},{12:286,15:145,16:30,17:31,18:[1,32],19:[1,33],22:[1,34],23:[1,35],24:36,25:[1,74],31:[1,109],33:11,34:12,35:13,36:14,37:15,38:16,39:17,40:18,41:19,42:20,43:21,44:22,45:23,46:24,47:25,48:26,49:27,50:87,51:[1,111],57:[1,90],59:[1,86],64:[1,83],65:97,70:46,72:[1,119],73:78,74:[1,70],80:96,81:[1,122],84:93,92:69,93:[1,64],94:[1,107],100:45,101:[1,85],102:110,103:[1,114],104:[1,115],105:94,106:[1,116],107:92,108:[1,113],109:95,110:[1,117],111:[1,108],112:40,113:[1,79],114:[1,80],115:[1,81],116:38,121:[1,82],123:[1,72],127:47,128:48,129:49,130:[1,91],131:[1,89],135:[1,71],137:76,139:[1,120],141:57,143:88,144:[1,66],145:[1,67],146:[1,112],154:44,157:75,162:99,163:98,164:[1,121],165:56,167:39,169:[1,77],170:[1,37],171:41,172:42,173:[1,43],178:63,179:[1,65],180:[1,106],181:[1,68],186:[1,84],187:[1,118],192:[1,58],198:[1,73],199:59,200:[1,101],202:[1,102],203:60,204:[1,103],205:61,206:[1,104],207:105,215:[1,62],220:[1,100],224:[1,50],225:[1,51],226:[1,52],227:[1,53],228:[1,54],229:[1,55]},{12:287,15:145,16:30,17:31,18:[1,32],19:[1,33],22:[1,34],23:[1,35],24:36,25:[1,74],31:[1,109],33:11,34:12,35:13,36:14,37:15,38:16,39:17,40:18,41:19,42:20,43:21,44:22,45:23,46:24,47:25,48:26,49:27,50:87,51:[1,111],57:[1,90],59:[1,86],64:[1,83],65:97,70:46,72:[1,119],73:78,74:[1,70],80:96,81:[1,122],84:93,92:69,93:[1,64],94:[1,107],100:45,101:[1,85],102:110,103:[1,114],104:[1,115],105:94,106:[1,116],107:92,108:[1,113],109:95,110:[1,117],111:[1,108],112:40,113:[1,79],114:[1,80],115:[1,81],116:38,121:[1,82],123:[1,72],127:47,128:48,129:49,130:[1,91],131:[1,89],135:[1,71],137:76,139:[1,120],141:57,143:88,144:[1,66],145:[1,67],146:[1,112],154:44,157:75,162:99,163:98,164:[1,121],165:56,167:39,169:[1,77],170:[1,37],171:41,172:42,173:[1,43],178:63,179:[1,65],180:[1,106],181:[1,68],186:[1,84],187:[1,118],192:[1,58],198:[1,73],199:59,200:[1,101],202:[1,102],203:60,204:[1,103],205:61,206:[1,104],207:105,215:[1,62],220:[1,100],224:[1,50],225:[1,51],226:[1,52],227:[1,53],228:[1,54],229:[1,55]},{12:288,15:145,16:30,17:31,18:[1,32],19:[1,33],22:[1,34],23:[1,35],24:36,25:[1,74],31:[1,109],33:11,34:12,35:13,36:14,37:15,38:16,39:17,40:18,41:19,42:20,43:21,44:22,45:23,46:24,47:25,48:26,49:27,50:87,51:[1,111],57:[1,90],59:[1,86],64:[1,83],65:97,70:46,72:[1,119],73:78,74:[1,70],80:96,81:[1,122],84:93,92:69,93:[1,64],94:[1,107],100:45,101:[1,85],102:110,103:[1,114],104:[1,115],105:94,106:[1,116],107:92,108:[1,113],109:95,110:[1,117],111:[1,108],112:40,113:[1,79],114:[1,80],115:[1,81],116:38,121:[1,82],123:[1,72],127:47,128:48,129:49,130:[1,91],131:[1,89],135:[1,71],137:76,139:[1,120],141:57,143:88,144:[1,66],145:[1,67],146:[1,112],154:44,157:75,162:99,163:98,164:[1,121],165:56,167:39,169:[1,77],170:[1,37],171:41,172:42,173:[1,43],178:63,179:[1,65],180:[1,106],181:[1,68],186:[1,84],187:[1,118],192:[1,58],198:[1,73],199:59,200:[1,101],202:[1,102],203:60,204:[1,103],205:61,206:[1,104],207:105,215:[1,62],220:[1,100],224:[1,50],225:[1,51],226:[1,52],227:[1,53],228:[1,54],229:[1,55]},{12:289,15:145,16:30,17:31,18:[1,32],19:[1,33],22:[1,34],23:[1,35],24:36,25:[1,74],31:[1,109],33:11,34:12,35:13,36:14,37:15,38:16,39:17,40:18,41:19,42:20,43:21,44:22,45:23,46:24,47:25,48:26,49:27,50:87,51:[1,111],57:[1,90],59:[1,86],64:[1,83],65:97,70:46,72:[1,119],73:78,74:[1,70],80:96,81:[1,122],84:93,92:69,93:[1,64],94:[1,107],100:45,101:[1,85],102:110,103:[1,114],104:[1,115],105:94,106:[1,116],107:92,108:[1,113],109:95,110:[1,117],111:[1,108],112:40,113:[1,79],114:[1,80],115:[1,81],116:38,121:[1,82],123:[1,72],127:47,128:48,129:49,130:[1,91],131:[1,89],135:[1,71],137:76,139:[1,120],141:57,143:88,144:[1,66],145:[1,67],146:[1,112],154:44,157:75,162:99,163:98,164:[1,121],165:56,167:39,169:[1,77],170:[1,37],171:41,172:42,173:[1,43],178:63,179:[1,65],180:[1,106],181:[1,68],186:[1,84],187:[1,118],192:[1,58],198:[1,73],199:59,200:[1,101],202:[1,102],203:60,204:[1,103],205:61,206:[1,104],207:105,215:[1,62],220:[1,100],224:[1,50],225:[1,51],226:[1,52],227:[1,53],228:[1,54],229:[1,55]},{12:290,15:145,16:30,17:31,18:[1,32],19:[1,33],22:[1,34],23:[1,35],24:36,25:[1,74],31:[1,109],33:11,34:12,35:13,36:14,37:15,38:16,39:17,40:18,41:19,42:20,43:21,44:22,45:23,46:24,47:25,48:26,49:27,50:87,51:[1,111],57:[1,90],59:[1,86],64:[1,83],65:97,70:46,72:[1,119],73:78,74:[1,70],80:96,81:[1,122],84:93,92:69,93:[1,64],94:[1,107],100:45,101:[1,85],102:110,103:[1,114],104:[1,115],105:94,106:[1,116],107:92,108:[1,113],109:95,110:[1,117],111:[1,108],112:40,113:[1,79],114:[1,80],115:[1,81],116:38,121:[1,82],123:[1,72],127:47,128:48,129:49,130:[1,91],131:[1,89],135:[1,71],137:76,139:[1,120],141:57,143:88,144:[1,66],145:[1,67],146:[1,112],154:44,157:75,162:99,163:98,164:[1,121],165:56,167:39,169:[1,77],170:[1,37],171:41,172:42,173:[1,43],178:63,179:[1,65],180:[1,106],181:[1,68],186:[1,84],187:[1,118],192:[1,58],198:[1,73],199:59,200:[1,101],202:[1,102],203:60,204:[1,103],205:61,206:[1,104],207:105,215:[1,62],220:[1,100],224:[1,50],225:[1,51],226:[1,52],227:[1,53],228:[1,54],229:[1,55]},{12:291,15:145,16:30,17:31,18:[1,32],19:[1,33],22:[1,34],23:[1,35],24:36,25:[1,74],31:[1,109],33:11,34:12,35:13,36:14,37:15,38:16,39:17,40:18,41:19,42:20,43:21,44:22,45:23,46:24,47:25,48:26,49:27,50:87,51:[1,111],57:[1,90],59:[1,86],64:[1,83],65:97,70:46,72:[1,119],73:78,74:[1,70],80:96,81:[1,122],84:93,92:69,93:[1,64],94:[1,107],100:45,101:[1,85],102:110,103:[1,114],104:[1,115],105:94,106:[1,116],107:92,108:[1,113],109:95,110:[1,117],111:[1,108],112:40,113:[1,79],114:[1,80],115:[1,81],116:38,121:[1,82],123:[1,72],127:47,128:48,129:49,130:[1,91],131:[1,89],135:[1,71],137:76,139:[1,120],141:57,143:88,144:[1,66],145:[1,67],146:[1,112],154:44,157:75,162:99,163:98,164:[1,121],165:56,167:39,169:[1,77],170:[1,37],171:41,172:42,173:[1,43],178:63,179:[1,65],180:[1,106],181:[1,68],186:[1,84],187:[1,118],192:[1,58],198:[1,73],199:59,200:[1,101],202:[1,102],203:60,204:[1,103],205:61,206:[1,104],207:105,215:[1,62],220:[1,100],224:[1,50],225:[1,51],226:[1,52],227:[1,53],228:[1,54],229:[1,55]},{12:292,15:145,16:30,17:31,18:[1,32],19:[1,33],22:[1,34],23:[1,35],24:36,25:[1,74],31:[1,109],33:11,34:12,35:13,36:14,37:15,38:16,39:17,40:18,41:19,42:20,43:21,44:22,45:23,46:24,47:25,48:26,49:27,50:87,51:[1,111],57:[1,90],59:[1,86],64:[1,83],65:97,70:46,72:[1,119],73:78,74:[1,70],80:96,81:[1,122],84:93,92:69,93:[1,64],94:[1,107],100:45,101:[1,85],102:110,103:[1,114],104:[1,115],105:94,106:[1,116],107:92,108:[1,113],109:95,110:[1,117],111:[1,108],112:40,113:[1,79],114:[1,80],115:[1,81],116:38,121:[1,82],123:[1,72],127:47,128:48,129:49,130:[1,91],131:[1,89],135:[1,71],137:76,139:[1,120],141:57,143:88,144:[1,66],145:[1,67],146:[1,112],154:44,157:75,162:99,163:98,164:[1,121],165:56,167:39,169:[1,77],170:[1,37],171:41,172:42,173:[1,43],178:63,179:[1,65],180:[1,106],181:[1,68],186:[1,84],187:[1,118],192:[1,58],198:[1,73],199:59,200:[1,101],202:[1,102],203:60,204:[1,103],205:61,206:[1,104],207:105,215:[1,62],220:[1,100],224:[1,50],225:[1,51],226:[1,52],227:[1,53],228:[1,54],229:[1,55]},{1:[2,304],6:[2,304],9:[2,304],10:[2,304],13:[2,304],21:[2,304],58:[2,304],66:[2,304],77:[2,304],83:[2,304],96:[2,304],120:[2,304],122:[2,304],134:[2,304],160:[2,304],189:[2,304],190:[2,304],200:[2,304],201:[2,304],202:[2,304],206:[2,304],214:[2,304],222:[2,304],223:[2,304],226:[2,304],227:[2,304],230:[2,304],231:[2,304],232:[2,304]},{1:[2,309],6:[2,309],9:[2,309],10:[2,309],13:[2,309],21:[2,309],58:[2,309],66:[2,309],77:[2,309],83:[2,309],96:[2,309],120:[2,309],122:[2,309],134:[2,309],160:[2,309],189:[2,309],190:[2,309],200:[2,309],201:[2,309],202:[2,309],206:[2,309],214:[2,309],222:[2,309],223:[2,309],226:[2,309],227:[2,309],230:[2,309],231:[2,309],232:[2,309]},{12:293,15:145,16:30,17:31,18:[1,32],19:[1,33],22:[1,34],23:[1,35],24:36,25:[1,74],31:[1,109],33:11,34:12,35:13,36:14,37:15,38:16,39:17,40:18,41:19,42:20,43:21,44:22,45:23,46:24,47:25,48:26,49:27,50:87,51:[1,111],57:[1,90],59:[1,86],64:[1,83],65:97,70:46,72:[1,119],73:78,74:[1,70],80:96,81:[1,122],84:93,92:69,93:[1,64],94:[1,107],100:45,101:[1,85],102:110,103:[1,114],104:[1,115],105:94,106:[1,116],107:92,108:[1,113],109:95,110:[1,117],111:[1,108],112:40,113:[1,79],114:[1,80],115:[1,81],116:38,121:[1,82],123:[1,72],127:47,128:48,129:49,130:[1,91],131:[1,89],135:[1,71],137:76,139:[1,120],141:57,143:88,144:[1,66],145:[1,67],146:[1,112],154:44,157:75,162:99,163:98,164:[1,121],165:56,167:39,169:[1,77],170:[1,37],171:41,172:42,173:[1,43],178:63,179:[1,65],180:[1,106],181:[1,68],186:[1,84],187:[1,118],192:[1,58],198:[1,73],199:59,200:[1,101],202:[1,102],203:60,204:[1,103],205:61,206:[1,104],207:105,215:[1,62],220:[1,100],224:[1,50],225:[1,51],226:[1,52],227:[1,53],228:[1,54],229:[1,55]},{1:[2,303],6:[2,303],9:[2,303],10:[2,303],13:[2,303],21:[2,303],58:[2,303],66:[2,303],77:[2,303],83:[2,303],96:[2,303],120:[2,303],122:[2,303],134:[2,303],160:[2,303],189:[2,303],190:[2,303],200:[2,303],201:[2,303],202:[2,303],206:[2,303],214:[2,303],222:[2,303],223:[2,303],226:[2,303],227:[2,303],230:[2,303],231:[2,303],232:[2,303]},{1:[2,308],6:[2,308],9:[2,308],10:[2,308],13:[2,308],21:[2,308],58:[2,308],66:[2,308],77:[2,308],83:[2,308],96:[2,308],120:[2,308],122:[2,308],134:[2,308],160:[2,308],189:[2,308],190:[2,308],200:[2,308],201:[2,308],202:[2,308],206:[2,308],214:[2,308],222:[2,308],223:[2,308],226:[2,308],227:[2,308],230:[2,308],231:[2,308],232:[2,308]},{1:[2,187],6:[2,187],9:[2,187],10:[2,187],13:[2,187],21:[2,187],66:[2,187],96:[1,135],122:[2,187],160:[1,136],199:139,200:[1,101],202:[1,102],205:140,206:[1,104],207:105,222:[1,138],223:[1,130],226:[1,132],227:[1,131],230:[1,133],231:[1,134],232:[1,137]},{199:142,200:[1,101],202:[1,102],205:143,206:[1,104],207:105,222:[1,141]},{20:[1,201],124:294},{65:297,72:[1,119],81:[1,122],84:298,102:299,103:[1,114],104:[1,115],107:300,108:[1,113],111:[1,301],166:[1,295],167:296,169:[1,77]},{12:303,15:145,16:30,17:31,18:[1,32],19:[1,33],22:[1,34],23:[1,35],24:36,25:[1,74],31:[1,109],33:11,34:12,35:13,36:14,37:15,38:16,39:17,40:18,41:19,42:20,43:21,44:22,45:23,46:24,47:25,48:26,49:27,50:87,51:[1,111],57:[1,90],59:[1,86],64:[1,83],65:97,70:46,72:[1,119],73:78,74:[1,70],80:96,81:[1,122],84:93,92:69,93:[1,64],94:[1,107],100:45,101:[1,85],102:110,103:[1,114],104:[1,115],105:94,106:[1,116],107:92,108:[1,113],109:95,110:[1,117],111:[1,108],112:40,113:[1,79],114:[1,80],115:[1,81],116:38,121:[1,82],123:[1,72],127:47,128:48,129:49,130:[1,91],131:[1,89],135:[1,71],137:76,139:[1,120],141:57,143:88,144:[1,66],145:[1,67],146:[1,112],154:44,157:75,162:99,163:98,164:[1,121],165:56,167:39,168:302,169:[1,77],170:[1,37],171:41,172:42,173:[1,43],176:304,178:63,179:[1,65],180:[1,106],181:[1,68],186:[1,84],187:[1,118],188:305,189:[1,306],190:[1,307],192:[1,58],198:[1,73],199:59,200:[1,101],202:[1,102],203:60,204:[1,103],205:61,206:[1,104],207:105,215:[1,62],220:[1,100],224:[1,50],225:[1,51],226:[1,52],227:[1,53],228:[1,54],229:[1,55]},{1:[2,188],6:[2,188],9:[2,188],10:[2,188],13:[2,188],20:[2,188],21:[2,188],56:[2,188],58:[2,188],66:[2,188],77:[2,188],81:[2,188],82:[2,188],83:[2,188],88:[2,188],96:[2,188],120:[2,188],122:[2,188],134:[2,188],160:[2,188],185:[2,188],189:[2,188],190:[2,188],200:[2,188],201:[2,188],202:[2,188],206:[2,188],214:[2,188],222:[2,188],223:[2,188],226:[2,188],227:[2,188],228:[2,188],229:[2,188],230:[2,188],231:[2,188],232:[2,188],233:[2,188]},{20:[2,263]},{20:[1,201],124:308},{1:[2,258],6:[2,258],9:[2,258],10:[2,258],13:[2,258],20:[2,258],21:[2,258],56:[2,258],57:[2,258],58:[2,258],66:[2,258],77:[2,258],82:[2,258],83:[2,258],96:[2,258],120:[2,258],122:[2,258],131:[2,258],134:[2,258],160:[2,258],185:[2,258],189:[2,258],190:[2,258],200:[2,258],201:[2,258],202:[2,258],206:[2,258],214:[2,258],222:[2,258],223:[2,258],226:[2,258],227:[2,258],230:[2,258],231:[2,258],232:[2,258]},{65:309,72:[1,119],81:[1,122],84:312,102:310,103:[1,114],104:[1,115],107:311,108:[1,113]},{12:303,15:145,16:30,17:31,18:[1,32],19:[1,33],22:[1,34],23:[1,35],24:36,25:[1,74],31:[1,109],33:11,34:12,35:13,36:14,37:15,38:16,39:17,40:18,41:19,42:20,43:21,44:22,45:23,46:24,47:25,48:26,49:27,50:87,51:[1,111],57:[1,90],59:[1,86],64:[1,83],65:97,70:46,72:[1,119],73:78,74:[1,70],80:96,81:[1,122],84:93,92:69,93:[1,64],94:[1,107],100:45,101:[1,85],102:110,103:[1,114],104:[1,115],105:94,106:[1,116],107:92,108:[1,113],109:95,110:[1,117],111:[1,108],112:40,113:[1,79],114:[1,80],115:[1,81],116:38,121:[1,82],123:[1,72],127:47,128:48,129:49,130:[1,91],131:[1,89],135:[1,71],137:76,139:[1,120],141:57,143:88,144:[1,66],145:[1,67],146:[1,112],154:44,157:75,162:99,163:98,164:[1,121],165:56,167:39,168:313,169:[1,77],170:[1,37],171:41,172:42,173:[1,43],176:304,178:63,179:[1,65],180:[1,106],181:[1,68],186:[1,84],187:[1,118],188:305,189:[1,306],190:[1,307],192:[1,58],198:[1,73],199:59,200:[1,101],202:[1,102],203:60,204:[1,103],205:61,206:[1,104],207:105,215:[1,62],220:[1,100],224:[1,50],225:[1,51],226:[1,52],227:[1,53],228:[1,54],229:[1,55]},{132:[1,236]},{12:314,15:145,16:30,17:31,18:[1,32],19:[1,33],22:[1,34],23:[1,35],24:36,25:[1,74],31:[1,109],33:11,34:12,35:13,36:14,37:15,38:16,39:17,40:18,41:19,42:20,43:21,44:22,45:23,46:24,47:25,48:26,49:27,50:87,51:[1,111],57:[1,90],59:[1,86],64:[1,83],65:97,70:46,72:[1,119],73:78,74:[1,70],80:96,81:[1,122],84:93,92:69,93:[1,64],94:[1,107],100:45,101:[1,85],102:110,103:[1,114],104:[1,115],105:94,106:[1,116],107:92,108:[1,113],109:95,110:[1,117],111:[1,108],112:40,113:[1,79],114:[1,80],115:[1,81],116:38,121:[1,82],123:[1,72],127:47,128:48,129:49,130:[1,91],131:[1,89],135:[1,71],137:76,139:[1,120],141:57,143:88,144:[1,66],145:[1,67],146:[1,112],154:44,157:75,162:99,163:98,164:[1,121],165:56,167:39,169:[1,77],170:[1,37],171:41,172:42,173:[1,43],178:63,179:[1,65],180:[1,106],181:[1,68],186:[1,84],187:[1,118],192:[1,58],198:[1,73],199:59,200:[1,101],202:[1,102],203:60,204:[1,103],205:61,206:[1,104],207:105,215:[1,62],220:[1,100],224:[1,50],225:[1,51],226:[1,52],227:[1,53],228:[1,54],229:[1,55]},{12:315,15:145,16:30,17:31,18:[1,32],19:[1,33],22:[1,34],23:[1,35],24:36,25:[1,74],31:[1,109],33:11,34:12,35:13,36:14,37:15,38:16,39:17,40:18,41:19,42:20,43:21,44:22,45:23,46:24,47:25,48:26,49:27,50:87,51:[1,111],57:[1,90],59:[1,86],64:[1,83],65:97,70:46,72:[1,119],73:78,74:[1,70],80:96,81:[1,122],84:93,92:69,93:[1,64],94:[1,107],100:45,101:[1,85],102:110,103:[1,114],104:[1,115],105:94,106:[1,116],107:92,108:[1,113],109:95,110:[1,117],111:[1,108],112:40,113:[1,79],114:[1,80],115:[1,81],116:38,121:[1,82],123:[1,72],127:47,128:48,129:49,130:[1,91],131:[1,89],135:[1,71],137:76,139:[1,120],141:57,143:88,144:[1,66],145:[1,67],146:[1,112],154:44,157:75,162:99,163:98,164:[1,121],165:56,167:39,169:[1,77],170:[1,37],171:41,172:42,173:[1,43],178:63,179:[1,65],180:[1,106],181:[1,68],186:[1,84],187:[1,118],192:[1,58],198:[1,73],199:59,200:[1,101],202:[1,102],203:60,204:[1,103],205:61,206:[1,104],207:105,215:[1,62],220:[1,100],224:[1,50],225:[1,51],226:[1,52],227:[1,53],228:[1,54],229:[1,55]},{1:[2,221],6:[2,221],9:[2,221],10:[2,221],13:[2,221],21:[2,221],58:[2,221],66:[2,221],77:[2,221],83:[2,221],96:[1,135],120:[2,221],122:[2,221],134:[2,221],160:[1,136],189:[2,221],190:[2,221],199:139,200:[2,221],201:[2,221],202:[2,221],205:140,206:[2,221],207:105,214:[2,221],222:[2,221],223:[1,130],226:[1,132],227:[1,131],230:[1,133],231:[1,134],232:[1,137]},{9:[1,317],12:316,15:145,16:30,17:31,18:[1,32],19:[1,33],22:[1,34],23:[1,35],24:36,25:[1,74],31:[1,109],33:11,34:12,35:13,36:14,37:15,38:16,39:17,40:18,41:19,42:20,43:21,44:22,45:23,46:24,47:25,48:26,49:27,50:87,51:[1,111],57:[1,90],59:[1,86],64:[1,83],65:97,70:46,72:[1,119],73:78,74:[1,70],80:96,81:[1,122],84:93,92:69,93:[1,64],94:[1,107],100:45,101:[1,85],102:110,103:[1,114],104:[1,115],105:94,106:[1,116],107:92,108:[1,113],109:95,110:[1,117],111:[1,108],112:40,113:[1,79],114:[1,80],115:[1,81],116:38,121:[1,82],123:[1,72],127:47,128:48,129:49,130:[1,91],131:[1,89],135:[1,71],137:76,139:[1,120],141:57,143:88,144:[1,66],145:[1,67],146:[1,112],154:44,157:75,162:99,163:98,164:[1,121],165:56,167:39,169:[1,77],170:[1,37],171:41,172:42,173:[1,43],178:63,179:[1,65],180:[1,106],181:[1,68],186:[1,84],187:[1,118],192:[1,58],198:[1,73],199:59,200:[1,101],202:[1,102],203:60,204:[1,103],205:61,206:[1,104],207:105,215:[1,62],220:[1,100],224:[1,50],225:[1,51],226:[1,52],227:[1,53],228:[1,54],229:[1,55]},{1:[2,344],6:[2,344],9:[2,344],10:[2,344],13:[2,344],21:[2,344],58:[2,344],66:[2,344],77:[2,344],83:[2,344],96:[2,344],120:[2,344],122:[2,344],134:[2,344],160:[2,344],189:[2,344],190:[2,344],199:139,200:[2,344],201:[2,344],202:[2,344],205:140,206:[2,344],207:105,214:[2,344],222:[2,344],223:[2,344],226:[2,344],227:[2,344],230:[2,344],231:[2,344],232:[2,344]},{1:[2,345],6:[2,345],9:[2,345],10:[2,345],13:[2,345],21:[2,345],58:[2,345],66:[2,345],77:[2,345],83:[2,345],96:[2,345],120:[2,345],122:[2,345],134:[2,345],160:[2,345],189:[2,345],190:[2,345],199:139,200:[2,345],201:[2,345],202:[2,345],205:140,206:[2,345],207:105,214:[2,345],222:[2,345],223:[2,345],226:[2,345],227:[2,345],230:[2,345],231:[2,345],232:[2,345]},{1:[2,346],6:[2,346],9:[2,346],10:[2,346],13:[2,346],21:[2,346],58:[2,346],66:[2,346],77:[2,346],83:[2,346],96:[2,346],120:[2,346],122:[2,346],134:[2,346],160:[2,346],189:[2,346],190:[2,346],199:139,200:[2,346],201:[2,346],202:[2,346],205:140,206:[2,346],207:105,214:[2,346],222:[2,346],223:[2,346],226:[2,346],227:[2,346],230:[2,346],231:[2,346],232:[2,346]},{1:[2,347],6:[2,347],9:[2,347],10:[2,347],13:[2,347],21:[2,347],58:[2,347],66:[2,347],77:[2,347],83:[2,347],96:[2,347],120:[2,347],122:[2,347],134:[2,347],160:[2,347],189:[2,347],190:[2,347],199:139,200:[2,347],201:[2,347],202:[2,347],205:140,206:[2,347],207:105,214:[2,347],222:[2,347],223:[2,347],226:[2,347],227:[2,347],230:[2,347],231:[2,347],232:[2,347]},{1:[2,348],6:[2,348],9:[2,348],10:[2,348],13:[2,348],20:[2,218],21:[2,348],56:[2,218],58:[2,348],66:[2,348],77:[2,348],81:[2,218],82:[2,218],83:[2,348],96:[2,348],120:[2,348],122:[2,348],134:[2,348],160:[2,348],185:[2,218],189:[2,348],190:[2,348],200:[2,348],201:[2,348],202:[2,348],206:[2,348],214:[2,348],222:[2,348],223:[2,348],226:[2,348],227:[2,348],230:[2,348],231:[2,348],232:[2,348]},{20:[2,262],56:[1,147],81:[1,122],82:[1,148],102:149,182:146,185:[1,150]},{20:[2,262],56:[1,153],57:[1,155],82:[1,154],128:152,131:[1,89],182:151,185:[1,150]},{139:[1,120],145:[1,167],163:189,164:[1,121]},{20:[2,222],56:[2,222],81:[2,222],82:[2,222],185:[2,222]},{6:[2,239],9:[2,239],13:[2,239],14:240,31:[1,109],58:[2,239],65:241,72:[1,119],73:243,81:[1,122],84:244,102:110,103:[1,114],104:[1,115],105:245,106:[1,116],107:242,108:[1,113],111:[1,108],118:238,119:239,121:[1,246],125:[1,28],126:[1,29],177:237},{1:[2,349],6:[2,349],9:[2,349],10:[2,349],13:[2,349],20:[2,218],21:[2,349],56:[2,218],58:[2,349],66:[2,349],77:[2,349],81:[2,218],82:[2,218],83:[2,349],96:[2,349],120:[2,349],122:[2,349],134:[2,349],160:[2,349],185:[2,218],189:[2,349],190:[2,349],200:[2,349],201:[2,349],202:[2,349],206:[2,349],214:[2,349],222:[2,349],223:[2,349],226:[2,349],227:[2,349],230:[2,349],231:[2,349],232:[2,349]},{1:[2,350],6:[2,350],9:[2,350],10:[2,350],13:[2,350],21:[2,350],58:[2,350],66:[2,350],77:[2,350],83:[2,350],96:[2,350],120:[2,350],122:[2,350],134:[2,350],160:[2,350],189:[2,350],190:[2,350],200:[2,350],201:[2,350],202:[2,350],206:[2,350],214:[2,350],222:[2,350],223:[2,350],226:[2,350],227:[2,350],230:[2,350],231:[2,350],232:[2,350]},{1:[2,351],6:[2,351],9:[2,351],10:[2,351],13:[2,351],21:[2,351],58:[2,351],66:[2,351],77:[2,351],83:[2,351],96:[2,351],120:[2,351],122:[2,351],134:[2,351],160:[2,351],189:[2,351],190:[2,351],200:[2,351],201:[2,351],202:[2,351],206:[2,351],214:[2,351],222:[2,351],223:[2,351],226:[2,351],227:[2,351],230:[2,351],231:[2,351],232:[2,351]},{9:[1,319],12:318,15:145,16:30,17:31,18:[1,32],19:[1,33],22:[1,34],23:[1,35],24:36,25:[1,74],31:[1,109],33:11,34:12,35:13,36:14,37:15,38:16,39:17,40:18,41:19,42:20,43:21,44:22,45:23,46:24,47:25,48:26,49:27,50:87,51:[1,111],57:[1,90],59:[1,86],64:[1,83],65:97,70:46,72:[1,119],73:78,74:[1,70],80:96,81:[1,122],84:93,92:69,93:[1,64],94:[1,107],100:45,101:[1,85],102:110,103:[1,114],104:[1,115],105:94,106:[1,116],107:92,108:[1,113],109:95,110:[1,117],111:[1,108],112:40,113:[1,79],114:[1,80],115:[1,81],116:38,121:[1,82],123:[1,72],127:47,128:48,129:49,130:[1,91],131:[1,89],135:[1,71],137:76,139:[1,120],141:57,143:88,144:[1,66],145:[1,67],146:[1,112],154:44,157:75,162:99,163:98,164:[1,121],165:56,167:39,169:[1,77],170:[1,37],171:41,172:42,173:[1,43],178:63,179:[1,65],180:[1,106],181:[1,68],186:[1,84],187:[1,118],192:[1,58],198:[1,73],199:59,200:[1,101],202:[1,102],203:60,204:[1,103],205:61,206:[1,104],207:105,215:[1,62],220:[1,100],224:[1,50],225:[1,51],226:[1,52],227:[1,53],228:[1,54],229:[1,55]},{5:321,9:[1,5],220:[1,320]},{12:322,15:145,16:30,17:31,18:[1,32],19:[1,33],22:[1,34],23:[1,35],24:36,25:[1,74],31:[1,109],33:11,34:12,35:13,36:14,37:15,38:16,39:17,40:18,41:19,42:20,43:21,44:22,45:23,46:24,47:25,48:26,49:27,50:87,51:[1,111],57:[1,90],59:[1,86],64:[1,83],65:97,70:46,72:[1,119],73:78,74:[1,70],80:96,81:[1,122],84:93,92:69,93:[1,64],94:[1,107],100:45,101:[1,85],102:110,103:[1,114],104:[1,115],105:94,106:[1,116],107:92,108:[1,113],109:95,110:[1,117],111:[1,108],112:40,113:[1,79],114:[1,80],115:[1,81],116:38,121:[1,82],123:[1,72],127:47,128:48,129:49,130:[1,91],131:[1,89],135:[1,71],137:76,139:[1,120],141:57,143:88,144:[1,66],145:[1,67],146:[1,112],154:44,157:75,162:99,163:98,164:[1,121],165:56,167:39,169:[1,77],170:[1,37],171:41,172:42,173:[1,43],178:63,179:[1,65],180:[1,106],181:[1,68],186:[1,84],187:[1,118],192:[1,58],198:[1,73],199:59,200:[1,101],202:[1,102],203:60,204:[1,103],205:61,206:[1,104],207:105,215:[1,62],220:[1,100],224:[1,50],225:[1,51],226:[1,52],227:[1,53],228:[1,54],229:[1,55]},{1:[2,289],6:[2,289],9:[2,289],10:[2,289],13:[2,289],21:[2,289],58:[2,289],66:[2,289],77:[2,289],83:[2,289],96:[2,289],120:[2,289],122:[2,289],134:[2,289],160:[2,289],189:[2,289],190:[2,289],193:323,194:324,195:[1,326],196:[1,325],200:[2,289],201:[2,289],202:[2,289],206:[2,289],214:[2,289],222:[2,289],223:[2,289],226:[2,289],227:[2,289],230:[2,289],231:[2,289],232:[2,289]},{1:[2,302],6:[2,302],9:[2,302],10:[2,302],13:[2,302],21:[2,302],58:[2,302],66:[2,302],77:[2,302],83:[2,302],96:[2,302],120:[2,302],122:[2,302],134:[2,302],160:[2,302],189:[2,302],190:[2,302],200:[2,302],201:[2,302],202:[2,302],206:[2,302],214:[2,302],222:[2,302],223:[2,302],226:[2,302],227:[2,302],230:[2,302],231:[2,302],232:[2,302]},{1:[2,310],6:[2,310],9:[2,310],10:[2,310],13:[2,310],21:[2,310],58:[2,310],66:[2,310],77:[2,310],83:[2,310],96:[2,310],120:[2,310],122:[2,310],134:[2,310],160:[2,310],189:[2,310],190:[2,310],200:[2,310],201:[2,310],202:[2,310],206:[2,310],214:[2,310],222:[2,310],223:[2,310],226:[2,310],227:[2,310],230:[2,310],231:[2,310],232:[2,310]},{9:[1,327],96:[1,135],160:[1,136],199:139,200:[1,101],202:[1,102],205:140,206:[1,104],207:105,222:[1,138],223:[1,130],226:[1,132],227:[1,131],230:[1,133],231:[1,134],232:[1,137]},{216:328,218:329,219:[1,330]},{1:[2,245],6:[2,245],9:[2,245],10:[2,245],13:[2,245],21:[2,245],58:[2,245],66:[2,245],77:[2,245],83:[2,245],96:[2,245],120:[2,245],122:[2,245],134:[2,245],160:[2,245],189:[2,245],190:[2,245],200:[2,245],201:[2,245],202:[2,245],206:[2,245],214:[2,245],222:[2,245],223:[2,245],226:[2,245],227:[2,245],230:[2,245],231:[2,245],232:[2,245]},{1:[2,94],6:[2,94],9:[2,94],10:[2,94],13:[2,94],21:[2,94],58:[2,94],66:[2,94],77:[2,94],83:[2,94],96:[2,94],120:[2,94],122:[2,94],134:[2,94],160:[2,94],189:[2,94],190:[2,94],200:[2,94],201:[2,94],202:[2,94],206:[2,94],214:[2,94],222:[2,94],223:[2,94],226:[2,94],227:[2,94],230:[2,94],231:[2,94],232:[2,94]},{1:[2,246],6:[2,246],9:[2,246],10:[2,246],13:[2,246],21:[2,246],58:[2,246],66:[2,246],77:[2,246],83:[2,246],96:[2,246],120:[2,246],122:[2,246],134:[2,246],160:[2,246],189:[2,246],190:[2,246],200:[2,246],201:[2,246],202:[2,246],206:[2,246],214:[2,246],222:[2,246],223:[2,246],226:[2,246],227:[2,246],230:[2,246],231:[2,246],232:[2,246]},{1:[2,247],6:[2,247],9:[2,247],10:[2,247],13:[2,247],21:[2,247],58:[2,247],66:[2,247],77:[2,247],83:[2,247],96:[2,247],120:[2,247],122:[2,247],134:[2,247],160:[2,247],189:[2,247],190:[2,247],200:[2,247],201:[2,247],202:[2,247],206:[2,247],214:[2,247],222:[2,247],223:[2,247],226:[2,247],227:[2,247],230:[2,247],231:[2,247],232:[2,247]},{1:[2,153],6:[2,153],9:[2,153],10:[2,153],13:[2,153],21:[2,153],58:[2,153],66:[2,153],77:[2,153],83:[2,153],96:[2,153],120:[2,153],122:[2,153],134:[2,153],160:[2,153],189:[2,153],190:[2,153],200:[2,153],201:[2,153],202:[2,153],206:[2,153],214:[2,153],222:[2,153],223:[2,153],226:[2,153],227:[2,153],230:[2,153],231:[2,153],232:[2,153]},{1:[2,248],6:[2,248],9:[2,248],10:[2,248],13:[2,248],21:[2,248],58:[2,248],66:[2,248],77:[2,248],83:[2,248],96:[2,248],120:[2,248],122:[2,248],134:[2,248],160:[2,248],189:[2,248],190:[2,248],200:[2,248],201:[2,248],202:[2,248],206:[2,248],214:[2,248],222:[2,248],223:[2,248],226:[2,248],227:[2,248],230:[2,248],231:[2,248],232:[2,248]},{178:331,180:[1,106]},{1:[2,154],6:[2,154],9:[2,154],10:[2,154],13:[2,154],21:[2,154],58:[2,154],66:[2,154],77:[2,154],83:[2,154],96:[2,154],120:[2,154],122:[2,154],134:[2,154],160:[2,154],189:[2,154],190:[2,154],200:[2,154],201:[2,154],202:[2,154],206:[2,154],214:[2,154],222:[2,154],223:[2,154],226:[2,154],227:[2,154],230:[2,154],231:[2,154],232:[2,154]},{1:[2,193],6:[2,193],9:[2,193],10:[2,193],13:[2,193],20:[2,193],21:[2,193],56:[2,193],58:[2,193],66:[2,193],77:[2,193],81:[2,193],82:[2,193],83:[2,193],88:[2,193],96:[2,193],120:[2,193],122:[2,193],134:[2,193],160:[2,193],185:[2,193],189:[2,193],190:[2,193],200:[2,193],201:[2,193],202:[2,193],206:[2,193],214:[2,193],222:[2,193],223:[2,193],226:[2,193],227:[2,193],228:[2,193],229:[2,193],230:[2,193],231:[2,193],232:[2,193],233:[2,193]},{1:[2,254],5:332,6:[2,254],9:[1,5],10:[2,254],13:[2,254],20:[2,218],21:[2,254],56:[2,218],58:[2,254],66:[2,254],77:[2,254],81:[2,218],82:[2,218],83:[2,254],96:[2,254],120:[2,254],122:[2,254],134:[2,254],160:[2,254],185:[2,218],189:[2,254],190:[2,254],200:[2,254],201:[2,254],202:[2,254],206:[2,254],214:[2,254],222:[2,254],223:[2,254],226:[2,254],227:[2,254],230:[2,254],231:[2,254],232:[2,254]},{6:[2,82],13:[2,82],56:[1,334],59:[1,336],76:333,77:[2,82],82:[1,335],84:337,85:338,87:[1,339],103:[1,114],104:[1,115]},{12:340,15:145,16:30,17:31,18:[1,32],19:[1,33],22:[1,34],23:[1,35],24:36,25:[1,74],31:[1,109],33:11,34:12,35:13,36:14,37:15,38:16,39:17,40:18,41:19,42:20,43:21,44:22,45:23,46:24,47:25,48:26,49:27,50:87,51:[1,111],57:[1,90],59:[1,86],64:[1,83],65:97,70:46,72:[1,119],73:78,74:[1,70],80:96,81:[1,122],84:93,92:69,93:[1,64],94:[1,107],100:45,101:[1,85],102:110,103:[1,114],104:[1,115],105:94,106:[1,116],107:92,108:[1,113],109:95,110:[1,117],111:[1,108],112:40,113:[1,79],114:[1,80],115:[1,81],116:38,121:[1,82],123:[1,72],127:47,128:48,129:49,130:[1,91],131:[1,89],135:[1,71],137:76,139:[1,120],141:57,143:88,144:[1,66],145:[1,67],146:[1,112],154:44,157:75,162:99,163:98,164:[1,121],165:56,167:39,169:[1,77],170:[1,37],171:41,172:42,173:[1,43],178:63,179:[1,65],180:[1,106],181:[1,68],186:[1,84],187:[1,118],192:[1,58],198:[1,73],199:59,200:[1,101],202:[1,102],203:60,204:[1,103],205:61,206:[1,104],207:105,215:[1,62],220:[1,100],224:[1,50],225:[1,51],226:[1,52],227:[1,53],228:[1,54],229:[1,55]},{6:[2,74],13:[2,74],56:[2,74],59:[2,74],77:[2,74],82:[2,74],87:[2,74],103:[2,74],104:[2,74]},{6:[2,71],13:[2,71],56:[2,71],59:[2,71],77:[2,71],82:[2,71],87:[2,71],103:[2,71],104:[2,71]},{6:[2,72],13:[2,72],56:[2,72],59:[2,72],77:[2,72],82:[2,72],87:[2,72],103:[2,72],104:[2,72]},{1:[2,145],6:[2,145],9:[2,145],10:[2,145],13:[2,145],20:[1,342],21:[2,145],57:[1,169],58:[2,145],66:[2,145],77:[2,145],83:[2,145],96:[2,145],120:[2,145],122:[2,145],134:[2,145],137:341,160:[2,145],189:[2,145],190:[2,145],200:[2,145],201:[2,145],202:[2,145],206:[2,145],214:[2,145],222:[2,145],223:[2,145],226:[2,145],227:[2,145],230:[2,145],231:[2,145],232:[2,145]},{1:[2,146],6:[2,146],9:[2,146],10:[2,146],13:[2,146],20:[2,146],21:[2,146],57:[2,146],58:[2,146],66:[2,146],77:[2,146],83:[2,146],96:[2,146],120:[2,146],122:[2,146],134:[2,146],160:[2,146],189:[2,146],190:[2,146],200:[2,146],201:[2,146],202:[2,146],206:[2,146],214:[2,146],222:[2,146],223:[2,146],226:[2,146],227:[2,146],230:[2,146],231:[2,146],232:[2,146]},{12:343,15:145,16:30,17:31,18:[1,32],19:[1,33],22:[1,34],23:[1,35],24:36,25:[1,74],31:[1,109],33:11,34:12,35:13,36:14,37:15,38:16,39:17,40:18,41:19,42:20,43:21,44:22,45:23,46:24,47:25,48:26,49:27,50:87,51:[1,111],57:[1,90],59:[1,86],64:[1,83],65:97,70:46,72:[1,119],73:78,74:[1,70],80:96,81:[1,122],84:93,92:69,93:[1,64],94:[1,107],100:45,101:[1,85],102:110,103:[1,114],104:[1,115],105:94,106:[1,116],107:92,108:[1,113],109:95,110:[1,117],111:[1,108],112:40,113:[1,79],114:[1,80],115:[1,81],116:38,121:[1,82],123:[1,72],127:47,128:48,129:49,130:[1,91],131:[1,89],135:[1,71],137:76,139:[1,120],141:57,143:88,144:[1,66],145:[1,67],146:[1,112],154:44,157:75,162:99,163:98,164:[1,121],165:56,167:39,169:[1,77],170:[1,37],171:41,172:42,173:[1,43],178:63,179:[1,65],180:[1,106],181:[1,68],186:[1,84],187:[1,118],192:[1,58],198:[1,73],199:59,200:[1,101],202:[1,102],203:60,204:[1,103],205:61,206:[1,104],207:105,215:[1,62],220:[1,100],224:[1,50],225:[1,51],226:[1,52],227:[1,53],228:[1,54],229:[1,55]},{1:[2,131],6:[2,131],10:[2,131],13:[2,131],96:[1,135],122:[2,131],160:[1,136],199:139,200:[2,131],202:[2,131],205:140,206:[2,131],207:105,222:[2,131],223:[1,130],226:[1,132],227:[1,131],230:[1,133],231:[1,134],232:[1,137]},{1:[2,132],6:[2,132],10:[2,132],13:[2,132],122:[2,132],200:[2,132],202:[2,132],206:[2,132],222:[2,132]},{9:[1,216],11:217,12:346,14:219,15:145,16:30,17:31,18:[1,32],19:[1,33],21:[1,344],22:[1,34],23:[1,35],24:36,25:[1,74],31:[1,109],33:11,34:12,35:13,36:14,37:15,38:16,39:17,40:18,41:19,42:20,43:21,44:22,45:23,46:24,47:25,48:26,49:27,50:87,51:[1,111],57:[1,90],59:[1,86],64:[1,83],65:97,70:46,72:[1,119],73:78,74:[1,70],80:96,81:[1,122],84:93,90:345,92:69,93:[1,64],94:[1,107],100:45,101:[1,85],102:110,103:[1,114],104:[1,115],105:94,106:[1,116],107:92,108:[1,113],109:95,110:[1,117],111:[1,108],112:40,113:[1,79],114:[1,80],115:[1,81],116:38,121:[1,82],123:[1,72],125:[1,28],126:[1,29],127:47,128:48,129:49,130:[1,91],131:[1,89],135:[1,71],137:76,139:[1,120],141:57,143:88,144:[1,66],145:[1,67],146:[1,112],154:44,157:75,159:[1,10],160:[1,218],162:99,163:98,164:[1,121],165:56,167:39,169:[1,77],170:[1,37],171:41,172:42,173:[1,43],175:215,178:63,179:[1,65],180:[1,106],181:[1,68],186:[1,84],187:[1,118],192:[1,58],198:[1,73],199:59,200:[1,101],202:[1,102],203:60,204:[1,103],205:61,206:[1,104],207:105,215:[1,62],220:[1,100],224:[1,50],225:[1,51],226:[1,52],227:[1,53],228:[1,54],229:[1,55]},{1:[2,295],6:[2,295],10:[2,295],13:[2,295],96:[1,135],122:[2,295],160:[1,136],199:139,200:[2,295],202:[2,295],205:140,206:[2,295],207:105,222:[2,295],223:[1,130],226:[1,132],227:[1,131],230:[1,133],231:[1,134],232:[1,137]},{13:[1,348],27:[1,347]},{1:[2,28],6:[2,28],10:[2,28],13:[2,28],29:[1,349],122:[2,28],200:[2,28],202:[2,28],206:[2,28],222:[2,28]},{13:[2,30],27:[2,30]},{1:[2,29],6:[2,29],10:[2,29],13:[2,29],29:[2,29],122:[2,29],200:[2,29],202:[2,29],206:[2,29],222:[2,29]},{1:[2,32],6:[2,32],10:[2,32],13:[2,32],27:[2,32],122:[2,32],200:[2,32],202:[2,32],206:[2,32],222:[2,32]},{1:[2,194],6:[2,194],9:[2,194],10:[2,194],13:[2,194],20:[2,194],21:[2,194],27:[2,194],56:[2,194],58:[2,194],66:[2,194],77:[2,194],81:[2,194],82:[2,194],83:[2,194],88:[2,194],96:[2,194],120:[2,194],122:[2,194],134:[2,194],160:[2,194],185:[2,194],189:[2,194],190:[2,194],200:[2,194],201:[2,194],202:[2,194],206:[2,194],214:[2,194],222:[2,194],223:[2,194],226:[2,194],227:[2,194],228:[2,194],229:[2,194],230:[2,194],231:[2,194],232:[2,194],233:[2,194]},{1:[2,195],6:[2,195],9:[2,195],10:[2,195],13:[2,195],20:[2,195],21:[2,195],27:[2,195],56:[2,195],58:[2,195],66:[2,195],77:[2,195],81:[2,195],82:[2,195],83:[2,195],88:[2,195],96:[2,195],120:[2,195],122:[2,195],134:[2,195],160:[2,195],185:[2,195],189:[2,195],190:[2,195],200:[2,195],201:[2,195],202:[2,195],206:[2,195],214:[2,195],222:[2,195],223:[2,195],226:[2,195],227:[2,195],228:[2,195],229:[2,195],230:[2,195],231:[2,195],232:[2,195],233:[2,195]},{6:[1,124],8:123,122:[1,350]},{4:351,7:4,11:6,12:7,14:8,15:9,16:30,17:31,18:[1,32],19:[1,33],22:[1,34],23:[1,35],24:36,25:[1,74],31:[1,109],33:11,34:12,35:13,36:14,37:15,38:16,39:17,40:18,41:19,42:20,43:21,44:22,45:23,46:24,47:25,48:26,49:27,50:87,51:[1,111],57:[1,90],59:[1,86],64:[1,83],65:97,70:46,72:[1,119],73:78,74:[1,70],80:96,81:[1,122],84:93,92:69,93:[1,64],94:[1,107],100:45,101:[1,85],102:110,103:[1,114],104:[1,115],105:94,106:[1,116],107:92,108:[1,113],109:95,110:[1,117],111:[1,108],112:40,113:[1,79],114:[1,80],115:[1,81],116:38,121:[1,82],123:[1,72],125:[1,28],126:[1,29],127:47,128:48,129:49,130:[1,91],131:[1,89],135:[1,71],137:76,139:[1,120],141:57,143:88,144:[1,66],145:[1,67],146:[1,112],154:44,157:75,159:[1,10],162:99,163:98,164:[1,121],165:56,167:39,169:[1,77],170:[1,37],171:41,172:42,173:[1,43],178:63,179:[1,65],180:[1,106],181:[1,68],186:[1,84],187:[1,118],192:[1,58],198:[1,73],199:59,200:[1,101],202:[1,102],203:60,204:[1,103],205:61,206:[1,104],207:105,215:[1,62],220:[1,100],224:[1,50],225:[1,51],226:[1,52],227:[1,53],228:[1,54],229:[1,55]},{6:[2,283],9:[2,283],13:[2,283],66:[2,283],96:[1,135],160:[1,136],188:352,189:[1,306],190:[1,307],199:139,200:[1,101],202:[1,102],205:140,206:[1,104],207:105,222:[1,138],223:[1,130],226:[1,132],227:[1,131],230:[1,133],231:[1,134],232:[1,137]},{1:[2,268],6:[2,268],9:[2,268],10:[2,268],13:[2,268],20:[2,268],21:[2,268],56:[2,268],58:[2,268],66:[2,268],77:[2,268],81:[2,268],82:[2,268],83:[2,268],88:[2,268],96:[2,268],120:[2,268],122:[2,268],134:[2,268],160:[2,268],185:[2,268],189:[2,268],190:[2,268],200:[2,268],201:[2,268],202:[2,268],206:[2,268],212:[2,268],213:[2,268],214:[2,268],222:[2,268],223:[2,268],226:[2,268],227:[2,268],230:[2,268],231:[2,268],232:[2,268]},{6:[2,174],9:[2,174],13:[1,354],66:[2,174],86:353},{6:[2,276],9:[2,276],10:[2,276],13:[2,276],21:[2,276],66:[2,276]},{9:[1,216],11:217,12:346,14:219,15:145,16:30,17:31,18:[1,32],19:[1,33],22:[1,34],23:[1,35],24:36,25:[1,74],31:[1,109],33:11,34:12,35:13,36:14,37:15,38:16,39:17,40:18,41:19,42:20,43:21,44:22,45:23,46:24,47:25,48:26,49:27,50:87,51:[1,111],57:[1,90],59:[1,86],64:[1,83],65:97,70:46,72:[1,119],73:78,74:[1,70],80:96,81:[1,122],84:93,90:355,92:69,93:[1,64],94:[1,107],100:45,101:[1,85],102:110,103:[1,114],104:[1,115],105:94,106:[1,116],107:92,108:[1,113],109:95,110:[1,117],111:[1,108],112:40,113:[1,79],114:[1,80],115:[1,81],116:38,121:[1,82],123:[1,72],125:[1,28],126:[1,29],127:47,128:48,129:49,130:[1,91],131:[1,89],135:[1,71],137:76,139:[1,120],141:57,143:88,144:[1,66],145:[1,67],146:[1,112],154:44,157:75,159:[1,10],160:[1,218],162:99,163:98,164:[1,121],165:56,167:39,169:[1,77],170:[1,37],171:41,172:42,173:[1,43],175:215,178:63,179:[1,65],180:[1,106],181:[1,68],186:[1,84],187:[1,118],192:[1,58],198:[1,73],199:59,200:[1,101],202:[1,102],203:60,204:[1,103],205:61,206:[1,104],207:105,215:[1,62],220:[1,100],224:[1,50],225:[1,51],226:[1,52],227:[1,53],228:[1,54],229:[1,55]},{6:[2,284],9:[2,284],10:[2,284],13:[2,284],21:[2,284],66:[2,284]},{6:[2,285],9:[2,285],10:[2,285],13:[2,285],21:[2,285],66:[2,285]},{6:[2,286],9:[2,286],10:[2,286],13:[2,286],21:[2,286],66:[2,286]},{1:[2,105],6:[2,105],9:[2,105],10:[2,105],13:[2,105],20:[2,105],21:[2,105],56:[2,105],58:[2,105],66:[2,105],77:[2,105],81:[2,105],82:[2,105],83:[2,105],96:[2,105],120:[2,105],122:[2,105],134:[2,105],160:[2,105],185:[2,105],189:[2,105],190:[2,105],200:[2,105],201:[2,105],202:[2,105],206:[2,105],214:[2,105],222:[2,105],223:[2,105],226:[2,105],227:[2,105],230:[2,105],231:[2,105],232:[2,105]},{1:[2,64],6:[2,64],9:[2,64],10:[2,64],13:[2,64],20:[2,64],21:[2,64],56:[2,64],58:[2,64],66:[2,64],77:[2,64],81:[2,64],82:[2,64],83:[2,64],96:[2,64],120:[2,64],122:[2,64],134:[2,64],160:[2,64],185:[2,64],189:[2,64],190:[2,64],200:[2,64],201:[2,64],202:[2,64],206:[2,64],214:[2,64],222:[2,64],223:[2,64],226:[2,64],227:[2,64],230:[2,64],231:[2,64],232:[2,64]},{53:[2,51],54:[2,51],55:[2,51],56:[2,51],59:[2,51],60:[2,51],61:[2,51],62:[2,51],63:[2,51],64:[2,51],69:[2,51],71:[2,51]},{53:[2,52],54:[2,52],55:[2,52],56:[2,52],59:[2,52],60:[2,52],61:[2,52],62:[2,52],63:[2,52],64:[2,52],69:[2,52],71:[2,52]},{53:[2,53],54:[2,53],55:[2,53],56:[2,53],59:[2,53],60:[2,53],61:[2,53],62:[2,53],63:[2,53],64:[2,53],69:[2,53],71:[2,53]},{53:[2,54],54:[2,54],55:[2,54],56:[2,54],59:[2,54],60:[2,54],61:[2,54],62:[2,54],63:[2,54],64:[2,54],69:[2,54],71:[2,54]},{57:[1,356]},{57:[1,357]},{53:[2,57],54:[2,57],55:[2,57],56:[2,57],59:[2,57],60:[2,57],61:[2,57],62:[2,57],63:[2,57],64:[2,57],69:[2,57],71:[2,57]},{53:[2,58],54:[2,58],55:[2,58],56:[2,58],59:[2,58],60:[2,58],61:[2,58],62:[2,58],63:[2,58],64:[2,58],69:[2,58],71:[2,58]},{53:[2,59],54:[2,59],55:[2,59],56:[2,59],59:[2,59],60:[2,59],61:[2,59],62:[2,59],63:[2,59],64:[2,59],69:[2,59],71:[2,59]},{53:[2,60],54:[2,60],55:[2,60],56:[2,60],59:[2,60],60:[2,60],61:[2,60],62:[2,60],63:[2,60],64:[2,60],69:[2,60],71:[2,60]},{65:358,72:[1,119]},{53:[2,63],54:[2,63],55:[2,63],56:[2,63],59:[2,63],60:[2,63],61:[2,63],62:[2,63],63:[2,63],64:[2,63],69:[2,63],71:[2,63]},{1:[2,140],6:[2,140],9:[2,140],10:[2,140],13:[2,140],20:[2,140],21:[2,140],56:[2,140],57:[2,140],58:[2,140],66:[2,140],77:[2,140],82:[2,140],83:[2,140],96:[2,140],120:[2,140],122:[2,140],131:[2,140],134:[2,140],160:[2,140],185:[2,140],189:[2,140],190:[2,140],200:[2,140],201:[2,140],202:[2,140],206:[2,140],214:[2,140],222:[2,140],223:[2,140],226:[2,140],227:[2,140],230:[2,140],231:[2,140],232:[2,140]},{13:[2,176],57:[1,169],64:[1,367],65:368,72:[1,119],133:359,134:[2,176],137:361,156:360,157:362,158:363,159:[1,364],160:[1,365],161:[1,366]},{13:[2,176],57:[1,169],64:[1,367],65:368,72:[1,119],133:369,134:[2,176],137:361,156:360,157:362,158:363,159:[1,364],160:[1,365],161:[1,366]},{6:[2,174],9:[2,174],13:[1,371],58:[2,174],86:370},{6:[2,240],9:[2,240],10:[2,240],13:[2,240],58:[2,240]},{6:[2,121],9:[2,121],10:[2,121],13:[2,121],58:[2,121],120:[1,372]},{6:[2,124],9:[2,124],10:[2,124],13:[2,124],58:[2,124]},{6:[2,125],9:[2,125],10:[2,125],13:[2,125],58:[2,125],120:[2,125]},{6:[2,126],9:[2,126],10:[2,126],13:[2,126],58:[2,126],120:[2,126]},{6:[2,127],9:[2,127],10:[2,127],13:[2,127],58:[2,127],120:[2,127]},{6:[2,128],9:[2,128],10:[2,128],13:[2,128],58:[2,128],120:[2,128]},{6:[2,129],9:[2,129],10:[2,129],13:[2,129],58:[2,129],120:[2,129]},{12:373,15:145,16:30,17:31,18:[1,32],19:[1,33],22:[1,34],23:[1,35],24:36,25:[1,74],31:[1,109],33:11,34:12,35:13,36:14,37:15,38:16,39:17,40:18,41:19,42:20,43:21,44:22,45:23,46:24,47:25,48:26,49:27,50:87,51:[1,111],57:[1,90],59:[1,86],64:[1,83],65:97,70:46,72:[1,119],73:78,74:[1,70],80:96,81:[1,122],84:93,92:69,93:[1,64],94:[1,107],100:45,101:[1,85],102:110,103:[1,114],104:[1,115],105:94,106:[1,116],107:92,108:[1,113],109:95,110:[1,117],111:[1,108],112:40,113:[1,79],114:[1,80],115:[1,81],116:38,121:[1,82],123:[1,72],127:47,128:48,129:49,130:[1,91],131:[1,89],135:[1,71],137:76,139:[1,120],141:57,143:88,144:[1,66],145:[1,67],146:[1,112],154:44,157:75,162:99,163:98,164:[1,121],165:56,167:39,169:[1,77],170:[1,37],171:41,172:42,173:[1,43],178:63,179:[1,65],180:[1,106],181:[1,68],186:[1,84],187:[1,118],192:[1,58],198:[1,73],199:59,200:[1,101],202:[1,102],203:60,204:[1,103],205:61,206:[1,104],207:105,215:[1,62],220:[1,100],224:[1,50],225:[1,51],226:[1,52],227:[1,53],228:[1,54],229:[1,55]},{1:[2,139],6:[2,139],9:[2,139],10:[2,139],13:[2,139],21:[2,139],58:[2,139],66:[2,139],77:[2,139],83:[2,139],96:[2,139],120:[2,139],122:[2,139],134:[2,139],160:[2,139],189:[2,139],190:[2,139],200:[2,139],201:[2,139],202:[2,139],206:[2,139],214:[2,139],222:[2,139],223:[2,139],226:[2,139],227:[2,139],230:[2,139],231:[2,139],232:[2,139]},{5:374,9:[1,5],96:[1,135],160:[1,136],199:139,200:[1,101],202:[1,102],205:140,206:[1,104],207:105,222:[1,138],223:[1,130],226:[1,132],227:[1,131],230:[1,133],231:[1,134],232:[1,137]},{1:[2,298],6:[2,298],9:[2,298],10:[2,298],13:[2,298],21:[2,298],58:[2,298],66:[2,298],77:[2,298],83:[2,298],96:[1,135],120:[2,298],122:[2,298],134:[2,298],160:[1,136],189:[2,298],190:[2,298],199:139,200:[1,101],201:[1,375],202:[1,102],205:140,206:[1,104],207:105,214:[2,298],222:[2,298],223:[1,130],226:[1,132],227:[1,131],230:[1,133],231:[1,134],232:[1,137]},{1:[2,300],6:[2,300],9:[2,300],10:[2,300],13:[2,300],21:[2,300],58:[2,300],66:[2,300],77:[2,300],83:[2,300],96:[1,135],120:[2,300],122:[2,300],134:[2,300],160:[1,136],189:[2,300],190:[2,300],199:139,200:[1,101],201:[1,376],202:[1,102],205:140,206:[1,104],207:105,214:[2,300],222:[2,300],223:[1,130],226:[1,132],227:[1,131],230:[1,133],231:[1,134],232:[1,137]},{1:[2,306],6:[2,306],9:[2,306],10:[2,306],13:[2,306],21:[2,306],58:[2,306],66:[2,306],77:[2,306],83:[2,306],96:[2,306],120:[2,306],122:[2,306],134:[2,306],160:[2,306],189:[2,306],190:[2,306],200:[2,306],201:[2,306],202:[2,306],206:[2,306],214:[2,306],222:[2,306],223:[2,306],226:[2,306],227:[2,306],230:[2,306],231:[2,306],232:[2,306]},{1:[2,307],6:[2,307],9:[2,307],10:[2,307],13:[2,307],21:[2,307],58:[2,307],66:[2,307],77:[2,307],83:[2,307],96:[1,135],120:[2,307],122:[2,307],134:[2,307],160:[1,136],189:[2,307],190:[2,307],199:139,200:[1,101],201:[2,307],202:[1,102],205:140,206:[1,104],207:105,214:[2,307],222:[2,307],223:[1,130],226:[1,132],227:[1,131],230:[1,133],231:[1,134],232:[1,137]},{1:[2,312],6:[2,312],9:[2,312],10:[2,312],13:[2,312],21:[2,312],58:[2,312],66:[2,312],77:[2,312],83:[2,312],96:[2,312],120:[2,312],122:[2,312],134:[2,312],160:[2,312],189:[2,312],190:[2,312],200:[2,312],201:[2,312],202:[2,312],206:[2,312],214:[2,312],222:[2,312],223:[2,312],226:[2,312],227:[2,312],230:[2,312],231:[2,312],232:[2,312]},{212:[2,314],213:[2,314]},{57:[1,169],64:[1,367],65:257,72:[1,119],137:259,157:258,209:377,211:256},{13:[1,378],212:[2,319],213:[2,319]},{13:[2,316],212:[2,316],213:[2,316]},{13:[2,317],212:[2,317],213:[2,317]},{13:[2,318],212:[2,318],213:[2,318]},{1:[2,313],6:[2,313],9:[2,313],10:[2,313],13:[2,313],21:[2,313],58:[2,313],66:[2,313],77:[2,313],83:[2,313],96:[2,313],120:[2,313],122:[2,313],134:[2,313],160:[2,313],189:[2,313],190:[2,313],200:[2,313],201:[2,313],202:[2,313],206:[2,313],214:[2,313],222:[2,313],223:[2,313],226:[2,313],227:[2,313],230:[2,313],231:[2,313],232:[2,313]},{12:379,15:145,16:30,17:31,18:[1,32],19:[1,33],22:[1,34],23:[1,35],24:36,25:[1,74],31:[1,109],33:11,34:12,35:13,36:14,37:15,38:16,39:17,40:18,41:19,42:20,43:21,44:22,45:23,46:24,47:25,48:26,49:27,50:87,51:[1,111],57:[1,90],59:[1,86],64:[1,83],65:97,70:46,72:[1,119],73:78,74:[1,70],80:96,81:[1,122],84:93,92:69,93:[1,64],94:[1,107],100:45,101:[1,85],102:110,103:[1,114],104:[1,115],105:94,106:[1,116],107:92,108:[1,113],109:95,110:[1,117],111:[1,108],112:40,113:[1,79],114:[1,80],115:[1,81],116:38,121:[1,82],123:[1,72],127:47,128:48,129:49,130:[1,91],131:[1,89],135:[1,71],137:76,139:[1,120],141:57,143:88,144:[1,66],145:[1,67],146:[1,112],154:44,157:75,162:99,163:98,164:[1,121],165:56,167:39,169:[1,77],170:[1,37],171:41,172:42,173:[1,43],178:63,179:[1,65],180:[1,106],181:[1,68],186:[1,84],187:[1,118],192:[1,58],198:[1,73],199:59,200:[1,101],202:[1,102],203:60,204:[1,103],205:61,206:[1,104],207:105,215:[1,62],220:[1,100],224:[1,50],225:[1,51],226:[1,52],227:[1,53],228:[1,54],229:[1,55]},{12:380,15:145,16:30,17:31,18:[1,32],19:[1,33],22:[1,34],23:[1,35],24:36,25:[1,74],31:[1,109],33:11,34:12,35:13,36:14,37:15,38:16,39:17,40:18,41:19,42:20,43:21,44:22,45:23,46:24,47:25,48:26,49:27,50:87,51:[1,111],57:[1,90],59:[1,86],64:[1,83],65:97,70:46,72:[1,119],73:78,74:[1,70],80:96,81:[1,122],84:93,92:69,93:[1,64],94:[1,107],100:45,101:[1,85],102:110,103:[1,114],104:[1,115],105:94,106:[1,116],107:92,108:[1,113],109:95,110:[1,117],111:[1,108],112:40,113:[1,79],114:[1,80],115:[1,81],116:38,121:[1,82],123:[1,72],127:47,128:48,129:49,130:[1,91],131:[1,89],135:[1,71],137:76,139:[1,120],141:57,143:88,144:[1,66],145:[1,67],146:[1,112],154:44,157:75,162:99,163:98,164:[1,121],165:56,167:39,169:[1,77],170:[1,37],171:41,172:42,173:[1,43],178:63,179:[1,65],180:[1,106],181:[1,68],186:[1,84],187:[1,118],192:[1,58],198:[1,73],199:59,200:[1,101],202:[1,102],203:60,204:[1,103],205:61,206:[1,104],207:105,215:[1,62],220:[1,100],224:[1,50],225:[1,51],226:[1,52],227:[1,53],228:[1,54],229:[1,55]},{1:[2,250],5:381,6:[2,250],9:[1,5],10:[2,250],13:[2,250],20:[2,218],21:[2,250],56:[2,218],58:[2,250],66:[2,250],77:[2,250],81:[2,218],82:[2,218],83:[2,250],96:[1,382],120:[2,250],122:[2,250],134:[2,250],160:[2,250],185:[2,218],189:[2,250],190:[2,250],200:[2,250],201:[2,250],202:[2,250],206:[2,250],214:[2,250],222:[2,250],223:[2,250],226:[2,250],227:[2,250],230:[2,250],231:[2,250],232:[2,250]},{1:[2,95],5:383,6:[2,95],9:[1,5],10:[2,95],13:[2,95],21:[2,95],58:[2,95],66:[2,95],77:[2,95],83:[2,95],96:[1,384],120:[2,95],122:[2,95],134:[2,95],160:[2,95],189:[2,95],190:[2,95],200:[2,95],201:[2,95],202:[2,95],206:[2,95],214:[2,95],222:[2,95],223:[2,95],226:[2,95],227:[2,95],230:[2,95],231:[2,95],232:[2,95]},{1:[2,101],6:[2,101],9:[2,101],10:[2,101],13:[2,101],21:[2,101],58:[2,101],66:[2,101],77:[2,101],83:[2,101],96:[2,101],120:[2,101],122:[2,101],134:[2,101],160:[2,101],189:[2,101],190:[2,101],200:[2,101],201:[2,101],202:[2,101],206:[2,101],214:[2,101],222:[2,101],223:[2,101],226:[2,101],227:[2,101],230:[2,101],231:[2,101],232:[2,101]},{1:[2,102],6:[2,102],9:[2,102],10:[2,102],13:[2,102],21:[2,102],58:[2,102],66:[2,102],77:[2,102],83:[2,102],96:[2,102],120:[2,102],122:[2,102],134:[2,102],160:[2,102],189:[2,102],190:[2,102],200:[2,102],201:[2,102],202:[2,102],206:[2,102],214:[2,102],222:[2,102],223:[2,102],226:[2,102],227:[2,102],230:[2,102],231:[2,102],232:[2,102]},{56:[1,386],59:[1,387],148:385},{20:[1,388],56:[2,170],59:[2,170],150:[1,389],152:[1,390]},{56:[2,171],59:[2,171]},{56:[2,172],59:[2,172]},{56:[2,173],59:[2,173]},{20:[2,165],56:[2,165],59:[2,165],150:[2,165],152:[2,165]},{20:[2,166],56:[2,166],59:[2,166],150:[2,166],152:[2,166]},{12:391,15:145,16:30,17:31,18:[1,32],19:[1,33],22:[1,34],23:[1,35],24:36,25:[1,74],31:[1,109],33:11,34:12,35:13,36:14,37:15,38:16,39:17,40:18,41:19,42:20,43:21,44:22,45:23,46:24,47:25,48:26,49:27,50:87,51:[1,111],57:[1,90],59:[1,86],64:[1,83],65:97,70:46,72:[1,119],73:78,74:[1,70],80:96,81:[1,122],84:93,92:69,93:[1,64],94:[1,107],100:45,101:[1,85],102:110,103:[1,114],104:[1,115],105:94,106:[1,116],107:92,108:[1,113],109:95,110:[1,117],111:[1,108],112:40,113:[1,79],114:[1,80],115:[1,81],116:38,121:[1,82],123:[1,72],127:47,128:48,129:49,130:[1,91],131:[1,89],135:[1,71],137:76,139:[1,120],141:57,143:88,144:[1,66],145:[1,67],146:[1,112],154:44,157:75,162:99,163:98,164:[1,121],165:56,167:39,169:[1,77],170:[1,37],171:41,172:42,173:[1,43],178:63,179:[1,65],180:[1,106],181:[1,68],186:[1,84],187:[1,118],192:[1,58],198:[1,73],199:59,200:[1,101],202:[1,102],203:60,204:[1,103],205:61,206:[1,104],207:105,215:[1,62],220:[1,100],224:[1,50],225:[1,51],226:[1,52],227:[1,53],228:[1,54],229:[1,55]},{32:392,65:209,72:[1,119],107:208,108:[1,113]},{1:[2,190],6:[2,190],9:[2,190],10:[2,190],13:[2,190],20:[2,190],21:[2,190],56:[2,190],58:[2,190],66:[2,190],77:[2,190],81:[2,190],82:[2,190],83:[2,190],88:[2,190],96:[2,190],120:[2,190],122:[2,190],134:[2,190],160:[2,190],185:[2,190],189:[2,190],190:[2,190],200:[2,190],201:[2,190],202:[2,190],206:[2,190],214:[2,190],222:[2,190],223:[2,190],226:[2,190],227:[2,190],228:[2,190],229:[2,190],230:[2,190],231:[2,190],232:[2,190],233:[2,190]},{1:[2,191],6:[2,191],9:[2,191],10:[2,191],13:[2,191],20:[2,191],21:[2,191],56:[2,191],58:[2,191],66:[2,191],77:[2,191],81:[2,191],82:[2,191],83:[2,191],88:[2,191],96:[2,191],120:[2,191],122:[2,191],134:[2,191],160:[2,191],185:[2,191],189:[2,191],190:[2,191],200:[2,191],201:[2,191],202:[2,191],206:[2,191],214:[2,191],222:[2,191],223:[2,191],226:[2,191],227:[2,191],228:[2,191],229:[2,191],230:[2,191],231:[2,191],232:[2,191],233:[2,191]},{32:393,65:209,72:[1,119],107:208,108:[1,113]},{1:[2,5],6:[2,5],10:[2,5],13:[1,126],122:[2,5]},{1:[2,13],6:[2,13],10:[2,13],13:[2,13],96:[1,135],122:[2,13],160:[1,136],199:139,200:[1,101],202:[1,102],205:140,206:[1,104],207:105,222:[1,138],223:[1,130],226:[1,132],227:[1,131],230:[1,133],231:[1,134],232:[1,137]},{1:[2,14],6:[2,14],10:[2,14],13:[2,14],122:[2,14]},{1:[2,9],6:[2,9],9:[2,9],10:[2,9],13:[2,9],20:[2,9],21:[2,9],56:[2,9],57:[2,9],58:[2,9],66:[2,9],77:[2,9],82:[2,9],83:[2,9],96:[2,9],120:[2,9],122:[2,9],131:[2,9],134:[2,9],160:[2,9],185:[2,9],189:[2,9],190:[2,9],195:[2,9],196:[2,9],200:[2,9],201:[2,9],202:[2,9],206:[2,9],214:[2,9],217:[2,9],219:[2,9],221:[2,9],222:[2,9],223:[2,9],226:[2,9],227:[2,9],230:[2,9],231:[2,9],232:[2,9]},{6:[1,124],8:123,10:[1,394]},{96:[1,135],120:[1,395],160:[1,136],199:139,200:[1,101],202:[1,102],205:140,206:[1,104],207:105,222:[1,138],223:[1,130],226:[1,132],227:[1,131],230:[1,133],231:[1,134],232:[1,137]},{1:[2,353],6:[2,353],9:[2,353],10:[2,353],13:[2,353],21:[2,353],58:[2,353],66:[2,353],77:[2,353],83:[2,353],96:[2,353],120:[2,353],122:[2,353],134:[2,353],160:[2,353],189:[2,353],190:[2,353],199:139,200:[2,353],201:[2,353],202:[2,353],205:140,206:[2,353],207:105,214:[2,353],222:[2,353],223:[2,353],226:[2,353],227:[2,353],230:[1,133],231:[2,353],232:[2,353]},{1:[2,354],6:[2,354],9:[2,354],10:[2,354],13:[2,354],21:[2,354],58:[2,354],66:[2,354],77:[2,354],83:[2,354],96:[2,354],120:[2,354],122:[2,354],134:[2,354],160:[2,354],189:[2,354],190:[2,354],199:139,200:[2,354],201:[2,354],202:[2,354],205:140,206:[2,354],207:105,214:[2,354],222:[2,354],223:[2,354],226:[2,354],227:[2,354],230:[1,133],231:[2,354],232:[2,354]},{1:[2,355],6:[2,355],9:[2,355],10:[2,355],13:[2,355],21:[2,355],58:[2,355],66:[2,355],77:[2,355],83:[2,355],96:[2,355],120:[2,355],122:[2,355],134:[2,355],160:[2,355],189:[2,355],190:[2,355],199:139,200:[2,355],201:[2,355],202:[2,355],205:140,206:[2,355],207:105,214:[2,355],222:[2,355],223:[2,355],226:[2,355],227:[2,355],230:[2,355],231:[2,355],232:[2,355]},{1:[2,356],6:[2,356],9:[2,356],10:[2,356],13:[2,356],21:[2,356],58:[2,356],66:[2,356],77:[2,356],83:[2,356],96:[2,356],120:[2,356],122:[2,356],134:[2,356],160:[2,356],189:[2,356],190:[2,356],199:139,200:[2,356],201:[2,356],202:[2,356],205:140,206:[2,356],207:105,214:[2,356],222:[2,356],223:[2,356],226:[1,132],227:[1,131],230:[1,133],231:[2,356],232:[2,356]},{1:[2,357],6:[2,357],9:[2,357],10:[2,357],13:[2,357],21:[2,357],58:[2,357],66:[2,357],77:[2,357],83:[2,357],96:[2,357],120:[2,357],122:[2,357],134:[2,357],160:[2,357],189:[2,357],190:[2,357],199:139,200:[2,357],201:[2,357],202:[2,357],205:140,206:[2,357],207:105,214:[2,357],222:[2,357],223:[2,357],226:[1,132],227:[1,131],230:[1,133],231:[1,134],232:[1,137]},{1:[2,358],6:[2,358],9:[2,358],10:[2,358],13:[2,358],21:[2,358],58:[2,358],66:[2,358],77:[2,358],83:[2,358],96:[1,135],120:[2,358],122:[2,358],134:[2,358],160:[2,358],189:[2,358],190:[2,358],199:139,200:[2,358],201:[2,358],202:[2,358],205:140,206:[2,358],207:105,214:[2,358],222:[2,358],223:[2,358],226:[1,132],227:[1,131],230:[1,133],231:[1,134],232:[1,137]},{1:[2,359],6:[2,359],9:[2,359],10:[2,359],13:[2,359],21:[2,359],58:[2,359],66:[2,359],77:[2,359],83:[2,359],96:[2,359],120:[2,359],122:[2,359],134:[2,359],160:[2,359],189:[2,359],190:[2,359],199:139,200:[2,359],201:[2,359],202:[2,359],205:140,206:[2,359],207:105,214:[2,359],222:[2,359],223:[2,359],226:[1,132],227:[1,131],230:[1,133],231:[1,134],232:[2,359]},{1:[2,342],6:[2,342],9:[2,342],10:[2,342],13:[2,342],21:[2,342],58:[2,342],66:[2,342],77:[2,342],83:[2,342],96:[1,135],120:[2,342],122:[2,342],134:[2,342],160:[1,136],189:[2,342],190:[2,342],199:139,200:[1,101],201:[2,342],202:[1,102],205:140,206:[1,104],207:105,214:[2,342],222:[1,138],223:[1,130],226:[1,132],227:[1,131],230:[1,133],231:[1,134],232:[1,137]},{1:[2,341],6:[2,341],9:[2,341],10:[2,341],13:[2,341],21:[2,341],58:[2,341],66:[2,341],77:[2,341],83:[2,341],96:[1,135],120:[2,341],122:[2,341],134:[2,341],160:[1,136],189:[2,341],190:[2,341],199:139,200:[1,101],201:[2,341],202:[1,102],205:140,206:[1,104],207:105,214:[2,341],222:[1,138],223:[1,130],226:[1,132],227:[1,131],230:[1,133],231:[1,134],232:[1,137]},{1:[2,256],6:[2,256],9:[2,256],10:[2,256],13:[2,256],20:[2,256],21:[2,256],56:[2,256],57:[2,256],58:[2,256],66:[2,256],77:[2,256],82:[2,256],83:[2,256],96:[2,256],120:[2,256],122:[2,256],131:[2,256],134:[2,256],160:[2,256],185:[2,256],189:[2,256],190:[2,256],200:[2,256],201:[2,256],202:[2,256],206:[2,256],214:[2,256],222:[2,256],223:[2,256],226:[2,256],227:[2,256],230:[2,256],231:[2,256],232:[2,256]},{1:[2,204],6:[2,204],9:[2,204],10:[2,204],13:[2,204],20:[2,204],21:[2,204],56:[2,204],58:[2,204],66:[2,204],77:[2,204],81:[2,204],82:[2,204],83:[2,204],88:[2,204],96:[2,204],120:[2,204],122:[2,204],134:[2,204],160:[2,204],185:[2,204],189:[2,204],190:[2,204],200:[2,204],201:[2,204],202:[2,204],206:[2,204],214:[2,204],222:[2,204],223:[2,204],226:[2,204],227:[2,204],228:[2,204],229:[2,204],230:[2,204],231:[2,204],232:[2,204],233:[2,204]},{1:[2,205],6:[2,205],9:[2,205],10:[2,205],13:[2,205],20:[2,205],21:[2,205],56:[2,205],58:[2,205],66:[2,205],77:[2,205],81:[2,205],82:[2,205],83:[2,205],88:[2,205],96:[2,205],120:[2,205],122:[2,205],134:[2,205],160:[2,205],185:[2,205],189:[2,205],190:[2,205],200:[2,205],201:[2,205],202:[2,205],206:[2,205],214:[2,205],222:[2,205],223:[2,205],226:[2,205],227:[2,205],228:[2,205],229:[2,205],230:[2,205],231:[2,205],232:[2,205],233:[2,205]},{1:[2,206],6:[2,206],9:[2,206],10:[2,206],13:[2,206],20:[2,206],21:[2,206],56:[2,206],58:[2,206],66:[2,206],77:[2,206],81:[2,206],82:[2,206],83:[2,206],88:[2,206],96:[2,206],120:[2,206],122:[2,206],134:[2,206],160:[2,206],185:[2,206],189:[2,206],190:[2,206],200:[2,206],201:[2,206],202:[2,206],206:[2,206],214:[2,206],222:[2,206],223:[2,206],226:[2,206],227:[2,206],228:[2,206],229:[2,206],230:[2,206],231:[2,206],232:[2,206],233:[2,206]},{1:[2,207],6:[2,207],9:[2,207],10:[2,207],13:[2,207],20:[2,207],21:[2,207],56:[2,207],58:[2,207],66:[2,207],77:[2,207],81:[2,207],82:[2,207],83:[2,207],88:[2,207],96:[2,207],120:[2,207],122:[2,207],134:[2,207],160:[2,207],185:[2,207],189:[2,207],190:[2,207],200:[2,207],201:[2,207],202:[2,207],206:[2,207],214:[2,207],222:[2,207],223:[2,207],226:[2,207],227:[2,207],228:[2,207],229:[2,207],230:[2,207],231:[2,207],232:[2,207],233:[2,207]},{1:[2,208],6:[2,208],9:[2,208],10:[2,208],13:[2,208],20:[2,208],21:[2,208],56:[2,208],58:[2,208],66:[2,208],77:[2,208],81:[2,208],82:[2,208],83:[2,208],88:[2,208],96:[2,208],120:[2,208],122:[2,208],134:[2,208],160:[2,208],185:[2,208],189:[2,208],190:[2,208],200:[2,208],201:[2,208],202:[2,208],206:[2,208],214:[2,208],222:[2,208],223:[2,208],226:[2,208],227:[2,208],228:[2,208],229:[2,208],230:[2,208],231:[2,208],232:[2,208],233:[2,208]},{1:[2,209],6:[2,209],9:[2,209],10:[2,209],13:[2,209],20:[2,209],21:[2,209],56:[2,209],58:[2,209],66:[2,209],77:[2,209],81:[2,209],82:[2,209],83:[2,209],88:[2,209],96:[2,209],120:[2,209],122:[2,209],134:[2,209],160:[2,209],185:[2,209],189:[2,209],190:[2,209],200:[2,209],201:[2,209],202:[2,209],206:[2,209],214:[2,209],222:[2,209],223:[2,209],226:[2,209],227:[2,209],228:[2,209],229:[2,209],230:[2,209],231:[2,209],232:[2,209],233:[2,209]},{1:[2,210],6:[2,210],9:[2,210],10:[2,210],13:[2,210],20:[2,210],21:[2,210],56:[2,210],58:[2,210],66:[2,210],77:[2,210],81:[2,210],82:[2,210],83:[2,210],88:[2,210],96:[2,210],120:[2,210],122:[2,210],134:[2,210],160:[2,210],185:[2,210],189:[2,210],190:[2,210],200:[2,210],201:[2,210],202:[2,210],206:[2,210],214:[2,210],222:[2,210],223:[2,210],226:[2,210],227:[2,210],228:[2,210],229:[2,210],230:[2,210],231:[2,210],232:[2,210],233:[2,210]},{83:[1,396]},{83:[2,236],96:[1,135],160:[1,136],188:397,189:[1,306],190:[1,307],199:139,200:[1,101],202:[1,102],205:140,206:[1,104],207:105,222:[1,138],223:[1,130],226:[1,132],227:[1,131],230:[1,133],231:[1,134],232:[1,137]},{83:[2,237]},{12:398,15:145,16:30,17:31,18:[1,32],19:[1,33],22:[1,34],23:[1,35],24:36,25:[1,74],31:[1,109],33:11,34:12,35:13,36:14,37:15,38:16,39:17,40:18,41:19,42:20,43:21,44:22,45:23,46:24,47:25,48:26,49:27,50:87,51:[1,111],57:[1,90],59:[1,86],64:[1,83],65:97,70:46,72:[1,119],73:78,74:[1,70],80:96,81:[1,122],84:93,92:69,93:[1,64],94:[1,107],100:45,101:[1,85],102:110,103:[1,114],104:[1,115],105:94,106:[1,116],107:92,108:[1,113],109:95,110:[1,117],111:[1,108],112:40,113:[1,79],114:[1,80],115:[1,81],116:38,121:[1,82],123:[1,72],127:47,128:48,129:49,130:[1,91],131:[1,89],135:[1,71],137:76,139:[1,120],141:57,143:88,144:[1,66],145:[1,67],146:[1,112],154:44,157:75,162:99,163:98,164:[1,121],165:56,167:39,169:[1,77],170:[1,37],171:41,172:42,173:[1,43],178:63,179:[1,65],180:[1,106],181:[1,68],186:[1,84],187:[1,118],192:[1,58],198:[1,73],199:59,200:[1,101],202:[1,102],203:60,204:[1,103],205:61,206:[1,104],207:105,215:[1,62],220:[1,100],224:[1,50],225:[1,51],226:[1,52],227:[1,53],228:[1,54],229:[1,55]},{18:[2,270],19:[2,270],22:[2,270],23:[2,270],25:[2,270],31:[2,270],51:[2,270],57:[2,270],59:[2,270],64:[2,270],72:[2,270],74:[2,270],81:[2,270],83:[2,270],93:[2,270],94:[2,270],101:[2,270],103:[2,270],104:[2,270],106:[2,270],108:[2,270],110:[2,270],111:[2,270],113:[2,270],114:[2,270],115:[2,270],121:[2,270],123:[2,270],130:[2,270],131:[2,270],135:[2,270],139:[2,270],144:[2,270],145:[2,270],146:[2,270],164:[2,270],169:[2,270],170:[2,270],173:[2,270],179:[2,270],180:[2,270],181:[2,270],186:[2,270],187:[2,270],192:[2,270],198:[2,270],200:[2,270],202:[2,270],204:[2,270],206:[2,270],215:[2,270],220:[2,270],224:[2,270],225:[2,270],226:[2,270],227:[2,270],228:[2,270],229:[2,270]},{18:[2,271],19:[2,271],22:[2,271],23:[2,271],25:[2,271],31:[2,271],51:[2,271],57:[2,271],59:[2,271],64:[2,271],72:[2,271],74:[2,271],81:[2,271],83:[2,271],93:[2,271],94:[2,271],101:[2,271],103:[2,271],104:[2,271],106:[2,271],108:[2,271],110:[2,271],111:[2,271],113:[2,271],114:[2,271],115:[2,271],121:[2,271],123:[2,271],130:[2,271],131:[2,271],135:[2,271],139:[2,271],144:[2,271],145:[2,271],146:[2,271],164:[2,271],169:[2,271],170:[2,271],173:[2,271],179:[2,271],180:[2,271],181:[2,271],186:[2,271],187:[2,271],192:[2,271],198:[2,271],200:[2,271],202:[2,271],204:[2,271],206:[2,271],215:[2,271],220:[2,271],224:[2,271],225:[2,271],226:[2,271],227:[2,271],228:[2,271],229:[2,271]},{1:[2,257],6:[2,257],9:[2,257],10:[2,257],13:[2,257],20:[2,257],21:[2,257],56:[2,257],57:[2,257],58:[2,257],66:[2,257],77:[2,257],82:[2,257],83:[2,257],96:[2,257],120:[2,257],122:[2,257],131:[2,257],134:[2,257],160:[2,257],185:[2,257],189:[2,257],190:[2,257],200:[2,257],201:[2,257],202:[2,257],206:[2,257],214:[2,257],222:[2,257],223:[2,257],226:[2,257],227:[2,257],230:[2,257],231:[2,257],232:[2,257]},{1:[2,211],6:[2,211],9:[2,211],10:[2,211],13:[2,211],20:[2,211],21:[2,211],56:[2,211],58:[2,211],66:[2,211],77:[2,211],81:[2,211],82:[2,211],83:[2,211],88:[2,211],96:[2,211],120:[2,211],122:[2,211],134:[2,211],160:[2,211],185:[2,211],189:[2,211],190:[2,211],200:[2,211],201:[2,211],202:[2,211],206:[2,211],214:[2,211],222:[2,211],223:[2,211],226:[2,211],227:[2,211],228:[2,211],229:[2,211],230:[2,211],231:[2,211],232:[2,211],233:[2,211]},{1:[2,212],6:[2,212],9:[2,212],10:[2,212],13:[2,212],20:[2,212],21:[2,212],56:[2,212],58:[2,212],66:[2,212],77:[2,212],81:[2,212],82:[2,212],83:[2,212],88:[2,212],96:[2,212],120:[2,212],122:[2,212],134:[2,212],160:[2,212],185:[2,212],189:[2,212],190:[2,212],200:[2,212],201:[2,212],202:[2,212],206:[2,212],214:[2,212],222:[2,212],223:[2,212],226:[2,212],227:[2,212],228:[2,212],229:[2,212],230:[2,212],231:[2,212],232:[2,212],233:[2,212]},{1:[2,213],6:[2,213],9:[2,213],10:[2,213],13:[2,213],20:[2,213],21:[2,213],56:[2,213],58:[2,213],66:[2,213],77:[2,213],81:[2,213],82:[2,213],83:[2,213],88:[2,213],96:[2,213],120:[2,213],122:[2,213],134:[2,213],160:[2,213],185:[2,213],189:[2,213],190:[2,213],200:[2,213],201:[2,213],202:[2,213],206:[2,213],214:[2,213],222:[2,213],223:[2,213],226:[2,213],227:[2,213],228:[2,213],229:[2,213],230:[2,213],231:[2,213],232:[2,213],233:[2,213]},{1:[2,214],6:[2,214],9:[2,214],10:[2,214],13:[2,214],20:[2,214],21:[2,214],56:[2,214],58:[2,214],66:[2,214],77:[2,214],81:[2,214],82:[2,214],83:[2,214],88:[2,214],96:[2,214],120:[2,214],122:[2,214],134:[2,214],160:[2,214],185:[2,214],189:[2,214],190:[2,214],200:[2,214],201:[2,214],202:[2,214],206:[2,214],214:[2,214],222:[2,214],223:[2,214],226:[2,214],227:[2,214],228:[2,214],229:[2,214],230:[2,214],231:[2,214],232:[2,214],233:[2,214]},{83:[1,399]},{21:[1,400],96:[1,135],160:[1,136],199:139,200:[1,101],202:[1,102],205:140,206:[1,104],207:105,222:[1,138],223:[1,130],226:[1,132],227:[1,131],230:[1,133],231:[1,134],232:[1,137]},{21:[1,401],96:[1,135],160:[1,136],199:139,200:[1,101],202:[1,102],205:140,206:[1,104],207:105,222:[1,138],223:[1,130],226:[1,132],227:[1,131],230:[1,133],231:[1,134],232:[1,137]},{1:[2,119],6:[2,119],9:[2,119],10:[2,119],13:[2,119],21:[2,119],58:[2,119],66:[2,119],77:[2,119],83:[2,119],96:[1,135],120:[2,119],122:[2,119],134:[2,119],160:[1,136],189:[2,119],190:[2,119],199:139,200:[2,119],201:[2,119],202:[2,119],205:140,206:[2,119],207:105,214:[2,119],222:[2,119],223:[1,130],226:[1,132],227:[1,131],230:[1,133],231:[1,134],232:[1,137]},{12:402,15:145,16:30,17:31,18:[1,32],19:[1,33],22:[1,34],23:[1,35],24:36,25:[1,74],31:[1,109],33:11,34:12,35:13,36:14,37:15,38:16,39:17,40:18,41:19,42:20,43:21,44:22,45:23,46:24,47:25,48:26,49:27,50:87,51:[1,111],57:[1,90],59:[1,86],64:[1,83],65:97,70:46,72:[1,119],73:78,74:[1,70],80:96,81:[1,122],84:93,92:69,93:[1,64],94:[1,107],100:45,101:[1,85],102:110,103:[1,114],104:[1,115],105:94,106:[1,116],107:92,108:[1,113],109:95,110:[1,117],111:[1,108],112:40,113:[1,79],114:[1,80],115:[1,81],116:38,121:[1,82],123:[1,72],127:47,128:48,129:49,130:[1,91],131:[1,89],135:[1,71],137:76,139:[1,120],141:57,143:88,144:[1,66],145:[1,67],146:[1,112],154:44,157:75,162:99,163:98,164:[1,121],165:56,167:39,169:[1,77],170:[1,37],171:41,172:42,173:[1,43],178:63,179:[1,65],180:[1,106],181:[1,68],186:[1,84],187:[1,118],192:[1,58],198:[1,73],199:59,200:[1,101],202:[1,102],203:60,204:[1,103],205:61,206:[1,104],207:105,215:[1,62],220:[1,100],224:[1,50],225:[1,51],226:[1,52],227:[1,53],228:[1,54],229:[1,55]},{1:[2,360],6:[2,360],9:[2,360],10:[2,360],13:[2,360],21:[2,360],58:[2,360],66:[2,360],77:[2,360],83:[2,360],96:[1,135],120:[2,360],122:[2,360],134:[2,360],160:[1,136],189:[2,360],190:[2,360],199:139,200:[2,360],201:[2,360],202:[2,360],205:140,206:[2,360],207:105,214:[2,360],222:[2,360],223:[1,130],226:[1,132],227:[1,131],230:[1,133],231:[1,134],232:[1,137]},{12:403,15:145,16:30,17:31,18:[1,32],19:[1,33],22:[1,34],23:[1,35],24:36,25:[1,74],31:[1,109],33:11,34:12,35:13,36:14,37:15,38:16,39:17,40:18,41:19,42:20,43:21,44:22,45:23,46:24,47:25,48:26,49:27,50:87,51:[1,111],57:[1,90],59:[1,86],64:[1,83],65:97,70:46,72:[1,119],73:78,74:[1,70],80:96,81:[1,122],84:93,92:69,93:[1,64],94:[1,107],100:45,101:[1,85],102:110,103:[1,114],104:[1,115],105:94,106:[1,116],107:92,108:[1,113],109:95,110:[1,117],111:[1,108],112:40,113:[1,79],114:[1,80],115:[1,81],116:38,121:[1,82],123:[1,72],127:47,128:48,129:49,130:[1,91],131:[1,89],135:[1,71],137:76,139:[1,120],141:57,143:88,144:[1,66],145:[1,67],146:[1,112],154:44,157:75,162:99,163:98,164:[1,121],165:56,167:39,169:[1,77],170:[1,37],171:41,172:42,173:[1,43],178:63,179:[1,65],180:[1,106],181:[1,68],186:[1,84],187:[1,118],192:[1,58],198:[1,73],199:59,200:[1,101],202:[1,102],203:60,204:[1,103],205:61,206:[1,104],207:105,215:[1,62],220:[1,100],224:[1,50],225:[1,51],226:[1,52],227:[1,53],228:[1,54],229:[1,55]},{12:404,15:145,16:30,17:31,18:[1,32],19:[1,33],22:[1,34],23:[1,35],24:36,25:[1,74],31:[1,109],33:11,34:12,35:13,36:14,37:15,38:16,39:17,40:18,41:19,42:20,43:21,44:22,45:23,46:24,47:25,48:26,49:27,50:87,51:[1,111],57:[1,90],59:[1,86],64:[1,83],65:97,70:46,72:[1,119],73:78,74:[1,70],80:96,81:[1,122],84:93,92:69,93:[1,64],94:[1,107],100:45,101:[1,85],102:110,103:[1,114],104:[1,115],105:94,106:[1,116],107:92,108:[1,113],109:95,110:[1,117],111:[1,108],112:40,113:[1,79],114:[1,80],115:[1,81],116:38,121:[1,82],123:[1,72],127:47,128:48,129:49,130:[1,91],131:[1,89],135:[1,71],137:76,139:[1,120],141:57,143:88,144:[1,66],145:[1,67],146:[1,112],154:44,157:75,162:99,163:98,164:[1,121],165:56,167:39,169:[1,77],170:[1,37],171:41,172:42,173:[1,43],178:63,179:[1,65],180:[1,106],181:[1,68],186:[1,84],187:[1,118],192:[1,58],198:[1,73],199:59,200:[1,101],202:[1,102],203:60,204:[1,103],205:61,206:[1,104],207:105,215:[1,62],220:[1,100],224:[1,50],225:[1,51],226:[1,52],227:[1,53],228:[1,54],229:[1,55]},{1:[2,339],6:[2,339],9:[2,339],10:[2,339],13:[2,339],21:[2,339],58:[2,339],66:[2,339],77:[2,339],83:[2,339],96:[2,339],120:[2,339],122:[2,339],134:[2,339],160:[2,339],189:[2,339],190:[2,339],200:[2,339],201:[2,339],202:[2,339],206:[2,339],214:[2,339],217:[2,339],221:[2,339],222:[2,339],223:[2,339],226:[2,339],227:[2,339],230:[2,339],231:[2,339],232:[2,339]},{5:405,9:[1,5],96:[1,135],160:[1,136],199:139,200:[1,101],202:[1,102],205:140,206:[1,104],207:105,222:[1,138],223:[1,130],226:[1,132],227:[1,131],230:[1,133],231:[1,134],232:[1,137]},{1:[2,290],6:[2,290],9:[2,290],10:[2,290],13:[2,290],21:[2,290],58:[2,290],66:[2,290],77:[2,290],83:[2,290],96:[2,290],120:[2,290],122:[2,290],134:[2,290],160:[2,290],189:[2,290],190:[2,290],194:406,195:[1,326],200:[2,290],201:[2,290],202:[2,290],206:[2,290],214:[2,290],222:[2,290],223:[2,290],226:[2,290],227:[2,290],230:[2,290],231:[2,290],232:[2,290]},{1:[2,291],6:[2,291],9:[2,291],10:[2,291],13:[2,291],21:[2,291],58:[2,291],66:[2,291],77:[2,291],83:[2,291],96:[2,291],120:[2,291],122:[2,291],134:[2,291],160:[2,291],189:[2,291],190:[2,291],200:[2,291],201:[2,291],202:[2,291],206:[2,291],214:[2,291],222:[2,291],223:[2,291],226:[2,291],227:[2,291],230:[2,291],231:[2,291],232:[2,291]},{197:[1,407]},{5:408,9:[1,5]},{216:409,218:329,219:[1,330]},{10:[1,410],217:[1,411],218:412,219:[1,330]},{10:[2,332],217:[2,332],219:[2,332]},{12:414,15:145,16:30,17:31,18:[1,32],19:[1,33],22:[1,34],23:[1,35],24:36,25:[1,74],31:[1,109],33:11,34:12,35:13,36:14,37:15,38:16,39:17,40:18,41:19,42:20,43:21,44:22,45:23,46:24,47:25,48:26,49:27,50:87,51:[1,111],57:[1,90],59:[1,86],64:[1,83],65:97,70:46,72:[1,119],73:78,74:[1,70],80:96,81:[1,122],84:93,92:69,93:[1,64],94:[1,107],100:45,101:[1,85],102:110,103:[1,114],104:[1,115],105:94,106:[1,116],107:92,108:[1,113],109:95,110:[1,117],111:[1,108],112:40,113:[1,79],114:[1,80],115:[1,81],116:38,121:[1,82],123:[1,72],127:47,128:48,129:49,130:[1,91],131:[1,89],135:[1,71],137:76,139:[1,120],141:57,143:88,144:[1,66],145:[1,67],146:[1,112],154:44,157:75,162:99,163:98,164:[1,121],165:56,167:39,169:[1,77],170:[1,37],171:41,172:42,173:[1,43],178:63,179:[1,65],180:[1,106],181:[1,68],186:[1,84],187:[1,118],191:413,192:[1,58],198:[1,73],199:59,200:[1,101],202:[1,102],203:60,204:[1,103],205:61,206:[1,104],207:105,215:[1,62],220:[1,100],224:[1,50],225:[1,51],226:[1,52],227:[1,53],228:[1,54],229:[1,55]},{1:[2,249],6:[2,249],9:[2,249],10:[2,249],13:[2,249],21:[2,249],58:[2,249],66:[2,249],77:[2,249],83:[2,249],96:[2,249],120:[2,249],122:[2,249],134:[2,249],160:[2,249],189:[2,249],190:[2,249],200:[2,249],201:[2,249],202:[2,249],206:[2,249],214:[2,249],222:[2,249],223:[2,249],226:[2,249],227:[2,249],230:[2,249],231:[2,249],232:[2,249]},{1:[2,255],6:[2,255],9:[2,255],10:[2,255],13:[2,255],21:[2,255],58:[2,255],66:[2,255],77:[2,255],83:[2,255],96:[2,255],120:[2,255],122:[2,255],134:[2,255],160:[2,255],189:[2,255],190:[2,255],200:[2,255],201:[2,255],202:[2,255],206:[2,255],214:[2,255],222:[2,255],223:[2,255],226:[2,255],227:[2,255],230:[2,255],231:[2,255],232:[2,255]},{6:[2,174],13:[1,416],77:[1,415],86:417},{57:[1,420],72:[1,419],81:[1,418]},{12:421,15:145,16:30,17:31,18:[1,32],19:[1,33],22:[1,34],23:[1,35],24:36,25:[1,74],31:[1,109],33:11,34:12,35:13,36:14,37:15,38:16,39:17,40:18,41:19,42:20,43:21,44:22,45:23,46:24,47:25,48:26,49:27,50:87,51:[1,111],57:[1,90],59:[1,86],64:[1,83],65:97,70:46,72:[1,119],73:78,74:[1,70],80:96,81:[1,122],84:93,92:69,93:[1,64],94:[1,107],100:45,101:[1,85],102:110,103:[1,114],104:[1,115],105:94,106:[1,116],107:92,108:[1,113],109:95,110:[1,117],111:[1,108],112:40,113:[1,79],114:[1,80],115:[1,81],116:38,121:[1,82],123:[1,72],127:47,128:48,129:49,130:[1,91],131:[1,89],135:[1,71],137:76,139:[1,120],141:57,143:88,144:[1,66],145:[1,67],146:[1,112],154:44,157:75,162:99,163:98,164:[1,121],165:56,167:39,169:[1,77],170:[1,37],171:41,172:42,173:[1,43],178:63,179:[1,65],180:[1,106],181:[1,68],186:[1,84],187:[1,118],192:[1,58],198:[1,73],199:59,200:[1,101],202:[1,102],203:60,204:[1,103],205:61,206:[1,104],207:105,215:[1,62],220:[1,100],224:[1,50],225:[1,51],226:[1,52],227:[1,53],228:[1,54],229:[1,55]},{57:[1,423],72:[1,422]},{6:[2,80],13:[2,80],56:[2,80],59:[2,80],77:[2,80],82:[2,80],87:[2,80],103:[2,80],104:[2,80]},{6:[2,83],13:[2,83],77:[2,83]},{6:[2,86],13:[2,86],77:[2,86],88:[1,424]},{58:[1,425],96:[1,135],160:[1,136],199:139,200:[1,101],202:[1,102],205:140,206:[1,104],207:105,222:[1,138],223:[1,130],226:[1,132],227:[1,131],230:[1,133],231:[1,134],232:[1,137]},{1:[2,143],6:[2,143],9:[2,143],10:[2,143],13:[2,143],21:[2,143],58:[2,143],66:[2,143],77:[2,143],83:[2,143],96:[2,143],120:[2,143],122:[2,143],134:[2,143],160:[2,143],189:[2,143],190:[2,143],200:[2,143],201:[2,143],202:[2,143],206:[2,143],214:[2,143],222:[2,143],223:[2,143],226:[2,143],227:[2,143],230:[2,143],231:[2,143],232:[2,143]},{57:[1,169],137:426},{58:[1,427],96:[1,135],160:[1,136],199:139,200:[1,101],202:[1,102],205:140,206:[1,104],207:105,222:[1,138],223:[1,130],226:[1,132],227:[1,131],230:[1,133],231:[1,134],232:[1,137]},{1:[2,264],6:[2,264],9:[2,264],10:[2,264],13:[2,264],20:[2,264],21:[2,264],56:[2,264],57:[2,264],58:[2,264],66:[2,264],77:[2,264],82:[2,264],83:[2,264],96:[2,264],120:[2,264],122:[2,264],131:[2,264],134:[2,264],160:[2,264],185:[2,264],189:[2,264],190:[2,264],200:[2,264],201:[2,264],202:[2,264],206:[2,264],214:[2,264],222:[2,264],223:[2,264],226:[2,264],227:[2,264],230:[2,264],231:[2,264],232:[2,264]},{6:[2,174],9:[2,174],13:[1,354],21:[2,174],86:428},{6:[2,283],9:[2,283],10:[2,283],13:[2,283],21:[2,283],66:[2,283],96:[1,135],160:[1,136],199:139,200:[1,101],202:[1,102],205:140,206:[1,104],207:105,222:[1,138],223:[1,130],226:[1,132],227:[1,131],230:[1,133],231:[1,134],232:[1,137]},{28:429,31:[1,206]},{30:430,32:207,65:209,72:[1,119],107:208,108:[1,113]},{30:431,32:207,65:209,72:[1,119],107:208,108:[1,113]},{1:[2,296],6:[2,296],9:[2,296],10:[2,296],13:[2,296],20:[2,296],21:[2,296],56:[2,296],58:[2,296],66:[2,296],77:[2,296],81:[2,296],82:[2,296],83:[2,296],96:[2,296],120:[2,296],122:[2,296],134:[2,296],160:[2,296],185:[2,296],189:[2,296],190:[2,296],200:[2,296],201:[2,296],202:[2,296],206:[2,296],214:[2,296],222:[2,296],223:[2,296],226:[2,296],227:[2,296],230:[2,296],231:[2,296],232:[2,296]},{6:[1,124],8:123,10:[1,432]},{12:433,15:145,16:30,17:31,18:[1,32],19:[1,33],22:[1,34],23:[1,35],24:36,25:[1,74],31:[1,109],33:11,34:12,35:13,36:14,37:15,38:16,39:17,40:18,41:19,42:20,43:21,44:22,45:23,46:24,47:25,48:26,49:27,50:87,51:[1,111],57:[1,90],59:[1,86],64:[1,83],65:97,70:46,72:[1,119],73:78,74:[1,70],80:96,81:[1,122],84:93,92:69,93:[1,64],94:[1,107],100:45,101:[1,85],102:110,103:[1,114],104:[1,115],105:94,106:[1,116],107:92,108:[1,113],109:95,110:[1,117],111:[1,108],112:40,113:[1,79],114:[1,80],115:[1,81],116:38,121:[1,82],123:[1,72],127:47,128:48,129:49,130:[1,91],131:[1,89],135:[1,71],137:76,139:[1,120],141:57,143:88,144:[1,66],145:[1,67],146:[1,112],154:44,157:75,162:99,163:98,164:[1,121],165:56,167:39,169:[1,77],170:[1,37],171:41,172:42,173:[1,43],178:63,179:[1,65],180:[1,106],181:[1,68],186:[1,84],187:[1,118],192:[1,58],198:[1,73],199:59,200:[1,101],202:[1,102],203:60,204:[1,103],205:61,206:[1,104],207:105,215:[1,62],220:[1,100],224:[1,50],225:[1,51],226:[1,52],227:[1,53],228:[1,54],229:[1,55]},{6:[1,124],8:435,9:[1,436],66:[1,434]},{6:[2,175],9:[2,175],10:[2,175],11:217,12:346,14:219,15:145,16:30,17:31,18:[1,32],19:[1,33],21:[2,175],22:[1,34],23:[1,35],24:36,25:[1,74],31:[1,109],33:11,34:12,35:13,36:14,37:15,38:16,39:17,40:18,41:19,42:20,43:21,44:22,45:23,46:24,47:25,48:26,49:27,50:87,51:[1,111],57:[1,90],59:[1,86],64:[1,83],65:97,66:[2,175],70:46,72:[1,119],73:78,74:[1,70],80:96,81:[1,122],84:93,92:69,93:[1,64],94:[1,107],100:45,101:[1,85],102:110,103:[1,114],104:[1,115],105:94,106:[1,116],107:92,108:[1,113],109:95,110:[1,117],111:[1,108],112:40,113:[1,79],114:[1,80],115:[1,81],116:38,121:[1,82],123:[1,72],125:[1,28],126:[1,29],127:47,128:48,129:49,130:[1,91],131:[1,89],135:[1,71],137:76,139:[1,120],141:57,143:88,144:[1,66],145:[1,67],146:[1,112],154:44,157:75,159:[1,10],160:[1,218],162:99,163:98,164:[1,121],165:56,167:39,169:[1,77],170:[1,37],171:41,172:42,173:[1,43],175:437,178:63,179:[1,65],180:[1,106],181:[1,68],186:[1,84],187:[1,118],192:[1,58],198:[1,73],199:59,200:[1,101],202:[1,102],203:60,204:[1,103],205:61,206:[1,104],207:105,215:[1,62],220:[1,100],224:[1,50],225:[1,51],226:[1,52],227:[1,53],228:[1,54],229:[1,55]},{6:[2,174],9:[2,174],10:[2,174],13:[1,354],86:438},{12:439,15:145,16:30,17:31,18:[1,32],19:[1,33],22:[1,34],23:[1,35],24:36,25:[1,74],31:[1,109],33:11,34:12,35:13,36:14,37:15,38:16,39:17,40:18,41:19,42:20,43:21,44:22,45:23,46:24,47:25,48:26,49:27,50:87,51:[1,111],57:[1,90],59:[1,86],64:[1,83],65:97,70:46,72:[1,119],73:78,74:[1,70],80:96,81:[1,122],84:93,92:69,93:[1,64],94:[1,107],100:45,101:[1,85],102:110,103:[1,114],104:[1,115],105:94,106:[1,116],107:92,108:[1,113],109:95,110:[1,117],111:[1,108],112:40,113:[1,79],114:[1,80],115:[1,81],116:38,121:[1,82],123:[1,72],127:47,128:48,129:49,130:[1,91],131:[1,89],135:[1,71],137:76,139:[1,120],141:57,143:88,144:[1,66],145:[1,67],146:[1,112],154:44,157:75,162:99,163:98,164:[1,121],165:56,167:39,169:[1,77],170:[1,37],171:41,172:42,173:[1,43],178:63,179:[1,65],180:[1,106],181:[1,68],186:[1,84],187:[1,118],192:[1,58],198:[1,73],199:59,200:[1,101],202:[1,102],203:60,204:[1,103],205:61,206:[1,104],207:105,215:[1,62],220:[1,100],224:[1,50],225:[1,51],226:[1,52],227:[1,53],228:[1,54],229:[1,55]},{12:440,15:145,16:30,17:31,18:[1,32],19:[1,33],22:[1,34],23:[1,35],24:36,25:[1,74],31:[1,109],33:11,34:12,35:13,36:14,37:15,38:16,39:17,40:18,41:19,42:20,43:21,44:22,45:23,46:24,47:25,48:26,49:27,50:87,51:[1,111],57:[1,90],59:[1,86],64:[1,83],65:97,70:46,72:[1,119],73:78,74:[1,70],80:96,81:[1,122],84:93,92:69,93:[1,64],94:[1,107],100:45,101:[1,85],102:110,103:[1,114],104:[1,115],105:94,106:[1,116],107:92,108:[1,113],109:95,110:[1,117],111:[1,108],112:40,113:[1,79],114:[1,80],115:[1,81],116:38,121:[1,82],123:[1,72],127:47,128:48,129:49,130:[1,91],131:[1,89],135:[1,71],137:76,139:[1,120],141:57,143:88,144:[1,66],145:[1,67],146:[1,112],154:44,157:75,162:99,163:98,164:[1,121],165:56,167:39,169:[1,77],170:[1,37],171:41,172:42,173:[1,43],178:63,179:[1,65],180:[1,106],181:[1,68],186:[1,84],187:[1,118],192:[1,58],198:[1,73],199:59,200:[1,101],202:[1,102],203:60,204:[1,103],205:61,206:[1,104],207:105,215:[1,62],220:[1,100],224:[1,50],225:[1,51],226:[1,52],227:[1,53],228:[1,54],229:[1,55]},{66:[1,441],67:[1,442]},{13:[1,444],134:[1,443]},{13:[2,177],21:[2,177],134:[2,177]},{13:[2,179],21:[2,179],134:[2,179]},{13:[2,180],21:[2,180],134:[2,180]},{13:[2,181],21:[2,181],88:[1,445],134:[2,181]},{65:368,72:[1,119],158:446},{65:368,72:[1,119],158:447},{65:368,72:[1,119],158:448},{9:[1,216],11:217,12:346,14:219,15:145,16:30,17:31,18:[1,32],19:[1,33],22:[1,34],23:[1,35],24:36,25:[1,74],31:[1,109],33:11,34:12,35:13,36:14,37:15,38:16,39:17,40:18,41:19,42:20,43:21,44:22,45:23,46:24,47:25,48:26,49:27,50:87,51:[1,111],57:[1,90],59:[1,86],64:[1,83],65:97,66:[1,213],70:46,72:[1,119],73:78,74:[1,70],80:96,81:[1,122],84:93,90:214,92:69,93:[1,64],94:[1,107],100:45,101:[1,85],102:110,103:[1,114],104:[1,115],105:94,106:[1,116],107:92,108:[1,113],109:95,110:[1,117],111:[1,108],112:40,113:[1,79],114:[1,80],115:[1,81],116:38,121:[1,82],123:[1,72],125:[1,28],126:[1,29],127:47,128:48,129:49,130:[1,91],131:[1,89],135:[1,71],137:76,139:[1,120],141:57,143:88,144:[1,66],145:[1,67],146:[1,112],154:44,157:75,159:[1,10],160:[1,218],162:99,163:98,164:[1,121],165:56,167:39,169:[1,77],170:[1,37],171:41,172:42,173:[1,43],175:215,178:63,179:[1,65],180:[1,106],181:[1,68],186:[1,84],187:[1,118],192:[1,58],198:[1,73],199:59,200:[1,101],202:[1,102],203:60,204:[1,103],205:61,206:[1,104],207:105,215:[1,62],220:[1,100],224:[1,50],225:[1,51],226:[1,52],227:[1,53],228:[1,54],229:[1,55]},{13:[2,186],21:[2,186],88:[2,186],134:[2,186]},{13:[1,444],134:[1,449]},{6:[1,124],8:451,9:[1,452],58:[1,450]},{6:[2,175],9:[2,175],10:[2,175],14:240,31:[1,109],58:[2,175],65:241,72:[1,119],73:243,81:[1,122],84:244,102:110,103:[1,114],104:[1,115],105:245,106:[1,116],107:242,108:[1,113],111:[1,108],118:453,119:239,121:[1,246],125:[1,28],126:[1,29]},{9:[1,455],12:454,15:145,16:30,17:31,18:[1,32],19:[1,33],22:[1,34],23:[1,35],24:36,25:[1,74],31:[1,109],33:11,34:12,35:13,36:14,37:15,38:16,39:17,40:18,41:19,42:20,43:21,44:22,45:23,46:24,47:25,48:26,49:27,50:87,51:[1,111],57:[1,90],59:[1,86],64:[1,83],65:97,70:46,72:[1,119],73:78,74:[1,70],80:96,81:[1,122],84:93,92:69,93:[1,64],94:[1,107],100:45,101:[1,85],102:110,103:[1,114],104:[1,115],105:94,106:[1,116],107:92,108:[1,113],109:95,110:[1,117],111:[1,108],112:40,113:[1,79],114:[1,80],115:[1,81],116:38,121:[1,82],123:[1,72],127:47,128:48,129:49,130:[1,91],131:[1,89],135:[1,71],137:76,139:[1,120],141:57,143:88,144:[1,66],145:[1,67],146:[1,112],154:44,157:75,162:99,163:98,164:[1,121],165:56,167:39,169:[1,77],170:[1,37],171:41,172:42,173:[1,43],178:63,179:[1,65],180:[1,106],181:[1,68],186:[1,84],187:[1,118],192:[1,58],198:[1,73],199:59,200:[1,101],202:[1,102],203:60,204:[1,103],205:61,206:[1,104],207:105,215:[1,62],220:[1,100],224:[1,50],225:[1,51],226:[1,52],227:[1,53],228:[1,54],229:[1,55]},{96:[1,135],122:[1,456],160:[1,136],199:139,200:[1,101],202:[1,102],205:140,206:[1,104],207:105,222:[1,138],223:[1,130],226:[1,132],227:[1,131],230:[1,133],231:[1,134],232:[1,137]},{1:[2,336],6:[2,336],9:[2,336],10:[2,336],13:[2,336],21:[2,336],58:[2,336],66:[2,336],77:[2,336],83:[2,336],96:[2,336],120:[2,336],122:[2,336],134:[2,336],160:[2,336],189:[2,336],190:[2,336],200:[2,336],201:[2,336],202:[2,336],206:[2,336],214:[2,336],217:[2,336],221:[2,336],222:[2,336],223:[2,336],226:[2,336],227:[2,336],230:[2,336],231:[2,336],232:[2,336]},{12:457,15:145,16:30,17:31,18:[1,32],19:[1,33],22:[1,34],23:[1,35],24:36,25:[1,74],31:[1,109],33:11,34:12,35:13,36:14,37:15,38:16,39:17,40:18,41:19,42:20,43:21,44:22,45:23,46:24,47:25,48:26,49:27,50:87,51:[1,111],57:[1,90],59:[1,86],64:[1,83],65:97,70:46,72:[1,119],73:78,74:[1,70],80:96,81:[1,122],84:93,92:69,93:[1,64],94:[1,107],100:45,101:[1,85],102:110,103:[1,114],104:[1,115],105:94,106:[1,116],107:92,108:[1,113],109:95,110:[1,117],111:[1,108],112:40,113:[1,79],114:[1,80],115:[1,81],116:38,121:[1,82],123:[1,72],127:47,128:48,129:49,130:[1,91],131:[1,89],135:[1,71],137:76,139:[1,120],141:57,143:88,144:[1,66],145:[1,67],146:[1,112],154:44,157:75,162:99,163:98,164:[1,121],165:56,167:39,169:[1,77],170:[1,37],171:41,172:42,173:[1,43],178:63,179:[1,65],180:[1,106],181:[1,68],186:[1,84],187:[1,118],192:[1,58],198:[1,73],199:59,200:[1,101],202:[1,102],203:60,204:[1,103],205:61,206:[1,104],207:105,215:[1,62],220:[1,100],224:[1,50],225:[1,51],226:[1,52],227:[1,53],228:[1,54],229:[1,55]},{12:458,15:145,16:30,17:31,18:[1,32],19:[1,33],22:[1,34],23:[1,35],24:36,25:[1,74],31:[1,109],33:11,34:12,35:13,36:14,37:15,38:16,39:17,40:18,41:19,42:20,43:21,44:22,45:23,46:24,47:25,48:26,49:27,50:87,51:[1,111],57:[1,90],59:[1,86],64:[1,83],65:97,70:46,72:[1,119],73:78,74:[1,70],80:96,81:[1,122],84:93,92:69,93:[1,64],94:[1,107],100:45,101:[1,85],102:110,103:[1,114],104:[1,115],105:94,106:[1,116],107:92,108:[1,113],109:95,110:[1,117],111:[1,108],112:40,113:[1,79],114:[1,80],115:[1,81],116:38,121:[1,82],123:[1,72],127:47,128:48,129:49,130:[1,91],131:[1,89],135:[1,71],137:76,139:[1,120],141:57,143:88,144:[1,66],145:[1,67],146:[1,112],154:44,157:75,162:99,163:98,164:[1,121],165:56,167:39,169:[1,77],170:[1,37],171:41,172:42,173:[1,43],178:63,179:[1,65],180:[1,106],181:[1,68],186:[1,84],187:[1,118],192:[1,58],198:[1,73],199:59,200:[1,101],202:[1,102],203:60,204:[1,103],205:61,206:[1,104],207:105,215:[1,62],220:[1,100],224:[1,50],225:[1,51],226:[1,52],227:[1,53],228:[1,54],229:[1,55]},{212:[2,315],213:[2,315]},{57:[1,169],64:[1,367],65:257,72:[1,119],137:259,157:258,211:459},{1:[2,321],6:[2,321],9:[2,321],10:[2,321],13:[2,321],21:[2,321],58:[2,321],66:[2,321],77:[2,321],83:[2,321],96:[1,135],120:[2,321],122:[2,321],134:[2,321],160:[1,136],189:[2,321],190:[2,321],199:139,200:[2,321],201:[1,460],202:[2,321],205:140,206:[2,321],207:105,214:[1,461],222:[2,321],223:[1,130],226:[1,132],227:[1,131],230:[1,133],231:[1,134],232:[1,137]},{1:[2,322],6:[2,322],9:[2,322],10:[2,322],13:[2,322],21:[2,322],58:[2,322],66:[2,322],77:[2,322],83:[2,322],96:[1,135],120:[2,322],122:[2,322],134:[2,322],160:[1,136],189:[2,322],190:[2,322],199:139,200:[2,322],201:[1,462],202:[2,322],205:140,206:[2,322],207:105,214:[2,322],222:[2,322],223:[1,130],226:[1,132],227:[1,131],230:[1,133],231:[1,134],232:[1,137]},{1:[2,251],6:[2,251],9:[2,251],10:[2,251],13:[2,251],21:[2,251],58:[2,251],66:[2,251],77:[2,251],83:[2,251],96:[2,251],120:[2,251],122:[2,251],134:[2,251],160:[2,251],189:[2,251],190:[2,251],200:[2,251],201:[2,251],202:[2,251],206:[2,251],214:[2,251],222:[2,251],223:[2,251],226:[2,251],227:[2,251],230:[2,251],231:[2,251],232:[2,251]},{12:463,15:145,16:30,17:31,18:[1,32],19:[1,33],22:[1,34],23:[1,35],24:36,25:[1,74],31:[1,109],33:11,34:12,35:13,36:14,37:15,38:16,39:17,40:18,41:19,42:20,43:21,44:22,45:23,46:24,47:25,48:26,49:27,50:87,51:[1,111],57:[1,90],59:[1,86],64:[1,83],65:97,70:46,72:[1,119],73:78,74:[1,70],80:96,81:[1,122],84:93,92:69,93:[1,64],94:[1,107],100:45,101:[1,85],102:110,103:[1,114],104:[1,115],105:94,106:[1,116],107:92,108:[1,113],109:95,110:[1,117],111:[1,108],112:40,113:[1,79],114:[1,80],115:[1,81],116:38,121:[1,82],123:[1,72],127:47,128:48,129:49,130:[1,91],131:[1,89],135:[1,71],137:76,139:[1,120],141:57,143:88,144:[1,66],145:[1,67],146:[1,112],154:44,157:75,162:99,163:98,164:[1,121],165:56,167:39,169:[1,77],170:[1,37],171:41,172:42,173:[1,43],178:63,179:[1,65],180:[1,106],181:[1,68],186:[1,84],187:[1,118],192:[1,58],198:[1,73],199:59,200:[1,101],202:[1,102],203:60,204:[1,103],205:61,206:[1,104],207:105,215:[1,62],220:[1,100],224:[1,50],225:[1,51],226:[1,52],227:[1,53],228:[1,54],229:[1,55]},{1:[2,96],6:[2,96],9:[2,96],10:[2,96],13:[2,96],21:[2,96],58:[2,96],66:[2,96],77:[2,96],83:[2,96],96:[2,96],120:[2,96],122:[2,96],134:[2,96],160:[2,96],189:[2,96],190:[2,96],200:[2,96],201:[2,96],202:[2,96],206:[2,96],214:[2,96],222:[2,96],223:[2,96],226:[2,96],227:[2,96],230:[2,96],231:[2,96],232:[2,96]},{95:464,98:[1,265],99:[1,266]},{57:[1,274],65:272,72:[1,119],107:273,108:[1,113],149:465},{57:[2,163],72:[2,163],108:[2,163]},{57:[2,164],72:[2,164],108:[2,164]},{13:[2,176],21:[2,176],57:[1,169],64:[1,367],65:368,72:[1,119],133:466,137:361,156:360,157:362,158:363,159:[1,364],160:[1,365],161:[1,366]},{5:468,9:[1,5],57:[1,155],128:469,131:[1,89],151:467},{5:468,9:[1,5],57:[1,155],128:469,131:[1,89],151:470},{58:[1,471],96:[1,135],160:[1,136],199:139,200:[1,101],202:[1,102],205:140,206:[1,104],207:105,222:[1,138],223:[1,130],226:[1,132],227:[1,131],230:[1,133],231:[1,134],232:[1,137]},{1:[2,189],6:[2,189],9:[2,189],10:[2,189],13:[2,189],20:[2,189],21:[2,189],56:[2,189],58:[2,189],66:[2,189],77:[2,189],81:[2,189],82:[2,189],83:[2,189],88:[2,189],96:[2,189],120:[2,189],122:[2,189],134:[2,189],160:[2,189],185:[2,189],189:[2,189],190:[2,189],200:[2,189],201:[2,189],202:[2,189],206:[2,189],214:[2,189],222:[2,189],223:[2,189],226:[2,189],227:[2,189],228:[2,189],229:[2,189],230:[2,189],231:[2,189],232:[2,189],233:[2,189]},{1:[2,192],6:[2,192],9:[2,192],10:[2,192],13:[2,192],20:[2,192],21:[2,192],56:[2,192],58:[2,192],66:[2,192],77:[2,192],81:[2,192],82:[2,192],83:[2,192],88:[2,192],96:[2,192],120:[2,192],122:[2,192],134:[2,192],160:[2,192],185:[2,192],189:[2,192],190:[2,192],200:[2,192],201:[2,192],202:[2,192],206:[2,192],214:[2,192],222:[2,192],223:[2,192],226:[2,192],227:[2,192],228:[2,192],229:[2,192],230:[2,192],231:[2,192],232:[2,192],233:[2,192]},{1:[2,10],6:[2,10],9:[2,10],10:[2,10],13:[2,10],20:[2,10],21:[2,10],56:[2,10],57:[2,10],58:[2,10],66:[2,10],77:[2,10],82:[2,10],83:[2,10],96:[2,10],120:[2,10],122:[2,10],131:[2,10],134:[2,10],160:[2,10],185:[2,10],189:[2,10],190:[2,10],195:[2,10],196:[2,10],200:[2,10],201:[2,10],202:[2,10],206:[2,10],214:[2,10],217:[2,10],219:[2,10],221:[2,10],222:[2,10],223:[2,10],226:[2,10],227:[2,10],230:[2,10],231:[2,10],232:[2,10]},{12:472,15:145,16:30,17:31,18:[1,32],19:[1,33],22:[1,34],23:[1,35],24:36,25:[1,74],31:[1,109],33:11,34:12,35:13,36:14,37:15,38:16,39:17,40:18,41:19,42:20,43:21,44:22,45:23,46:24,47:25,48:26,49:27,50:87,51:[1,111],57:[1,90],59:[1,86],64:[1,83],65:97,70:46,72:[1,119],73:78,74:[1,70],80:96,81:[1,122],84:93,92:69,93:[1,64],94:[1,107],100:45,101:[1,85],102:110,103:[1,114],104:[1,115],105:94,106:[1,116],107:92,108:[1,113],109:95,110:[1,117],111:[1,108],112:40,113:[1,79],114:[1,80],115:[1,81],116:38,121:[1,82],123:[1,72],127:47,128:48,129:49,130:[1,91],131:[1,89],135:[1,71],137:76,139:[1,120],141:57,143:88,144:[1,66],145:[1,67],146:[1,112],154:44,157:75,162:99,163:98,164:[1,121],165:56,167:39,169:[1,77],170:[1,37],171:41,172:42,173:[1,43],178:63,179:[1,65],180:[1,106],181:[1,68],186:[1,84],187:[1,118],192:[1,58],198:[1,73],199:59,200:[1,101],202:[1,102],203:60,204:[1,103],205:61,206:[1,104],207:105,215:[1,62],220:[1,100],224:[1,50],225:[1,51],226:[1,52],227:[1,53],228:[1,54],229:[1,55]},{1:[2,215],6:[2,215],9:[2,215],10:[2,215],13:[2,215],20:[2,215],21:[2,215],56:[2,215],58:[2,215],66:[2,215],77:[2,215],81:[2,215],82:[2,215],83:[2,215],88:[2,215],96:[2,215],120:[2,215],122:[2,215],134:[2,215],160:[2,215],185:[2,215],189:[2,215],190:[2,215],200:[2,215],201:[2,215],202:[2,215],206:[2,215],214:[2,215],222:[2,215],223:[2,215],226:[2,215],227:[2,215],228:[2,215],229:[2,215],230:[2,215],231:[2,215],232:[2,215],233:[2,215]},{12:473,15:145,16:30,17:31,18:[1,32],19:[1,33],22:[1,34],23:[1,35],24:36,25:[1,74],31:[1,109],33:11,34:12,35:13,36:14,37:15,38:16,39:17,40:18,41:19,42:20,43:21,44:22,45:23,46:24,47:25,48:26,49:27,50:87,51:[1,111],57:[1,90],59:[1,86],64:[1,83],65:97,70:46,72:[1,119],73:78,74:[1,70],80:96,81:[1,122],83:[2,274],84:93,92:69,93:[1,64],94:[1,107],100:45,101:[1,85],102:110,103:[1,114],104:[1,115],105:94,106:[1,116],107:92,108:[1,113],109:95,110:[1,117],111:[1,108],112:40,113:[1,79],114:[1,80],115:[1,81],116:38,121:[1,82],123:[1,72],127:47,128:48,129:49,130:[1,91],131:[1,89],135:[1,71],137:76,139:[1,120],141:57,143:88,144:[1,66],145:[1,67],146:[1,112],154:44,157:75,162:99,163:98,164:[1,121],165:56,167:39,169:[1,77],170:[1,37],171:41,172:42,173:[1,43],178:63,179:[1,65],180:[1,106],181:[1,68],186:[1,84],187:[1,118],192:[1,58],198:[1,73],199:59,200:[1,101],202:[1,102],203:60,204:[1,103],205:61,206:[1,104],207:105,215:[1,62],220:[1,100],224:[1,50],225:[1,51],226:[1,52],227:[1,53],228:[1,54],229:[1,55]},{83:[2,275],96:[1,135],160:[1,136],199:139,200:[1,101],202:[1,102],205:140,206:[1,104],207:105,222:[1,138],223:[1,130],226:[1,132],227:[1,131],230:[1,133],231:[1,134],232:[1,137]},{1:[2,216],6:[2,216],9:[2,216],10:[2,216],13:[2,216],20:[2,216],21:[2,216],56:[2,216],58:[2,216],66:[2,216],77:[2,216],81:[2,216],82:[2,216],83:[2,216],88:[2,216],96:[2,216],120:[2,216],122:[2,216],134:[2,216],160:[2,216],185:[2,216],189:[2,216],190:[2,216],200:[2,216],201:[2,216],202:[2,216],206:[2,216],214:[2,216],222:[2,216],223:[2,216],226:[2,216],227:[2,216],228:[2,216],229:[2,216],230:[2,216],231:[2,216],232:[2,216],233:[2,216]},{1:[2,21],6:[2,21],10:[2,21],13:[2,21],122:[2,21],200:[2,21],202:[2,21],206:[2,21],222:[2,21]},{1:[2,23],6:[2,23],10:[2,23],13:[2,23],122:[2,23],200:[2,23],202:[2,23],206:[2,23],222:[2,23]},{6:[1,124],8:475,10:[1,476],96:[1,135],117:474,160:[1,136],199:139,200:[1,101],202:[1,102],205:140,206:[1,104],207:105,222:[1,138],223:[1,130],226:[1,132],227:[1,131],230:[1,133],231:[1,134],232:[1,137]},{6:[1,124],8:475,10:[1,476],96:[1,135],117:477,160:[1,136],199:139,200:[1,101],202:[1,102],205:140,206:[1,104],207:105,222:[1,138],223:[1,130],226:[1,132],227:[1,131],230:[1,133],231:[1,134],232:[1,137]},{5:478,9:[1,5],96:[1,135],160:[1,136],199:139,200:[1,101],202:[1,102],205:140,206:[1,104],207:105,222:[1,138],223:[1,130],226:[1,132],227:[1,131],230:[1,133],231:[1,134],232:[1,137]},{1:[2,338],6:[2,338],9:[2,338],10:[2,338],13:[2,338],21:[2,338],58:[2,338],66:[2,338],77:[2,338],83:[2,338],96:[2,338],120:[2,338],122:[2,338],134:[2,338],160:[2,338],189:[2,338],190:[2,338],200:[2,338],201:[2,338],202:[2,338],206:[2,338],214:[2,338],217:[2,338],221:[2,338],222:[2,338],223:[2,338],226:[2,338],227:[2,338],230:[2,338],231:[2,338],232:[2,338]},{1:[2,292],6:[2,292],9:[2,292],10:[2,292],13:[2,292],21:[2,292],58:[2,292],66:[2,292],77:[2,292],83:[2,292],96:[2,292],120:[2,292],122:[2,292],134:[2,292],160:[2,292],189:[2,292],190:[2,292],200:[2,292],201:[2,292],202:[2,292],206:[2,292],214:[2,292],222:[2,292],223:[2,292],226:[2,292],227:[2,292],230:[2,292],231:[2,292],232:[2,292]},{5:479,9:[1,5]},{1:[2,293],6:[2,293],9:[2,293],10:[2,293],13:[2,293],21:[2,293],58:[2,293],66:[2,293],77:[2,293],83:[2,293],96:[2,293],120:[2,293],122:[2,293],134:[2,293],160:[2,293],189:[2,293],190:[2,293],200:[2,293],201:[2,293],202:[2,293],206:[2,293],214:[2,293],222:[2,293],223:[2,293],226:[2,293],227:[2,293],230:[2,293],231:[2,293],232:[2,293]},{10:[1,480],217:[1,481],218:412,219:[1,330]},{1:[2,330],6:[2,330],9:[2,330],10:[2,330],13:[2,330],21:[2,330],58:[2,330],66:[2,330],77:[2,330],83:[2,330],96:[2,330],120:[2,330],122:[2,330],134:[2,330],160:[2,330],189:[2,330],190:[2,330],200:[2,330],201:[2,330],202:[2,330],206:[2,330],214:[2,330],222:[2,330],223:[2,330],226:[2,330],227:[2,330],230:[2,330],231:[2,330],232:[2,330]},{5:482,9:[1,5]},{10:[2,333],217:[2,333],219:[2,333]},{5:483,9:[1,5],13:[1,484]},{9:[2,287],13:[2,287],96:[1,135],160:[1,136],199:139,200:[1,101],202:[1,102],205:140,206:[1,104],207:105,222:[1,138],223:[1,130],226:[1,132],227:[1,131],230:[1,133],231:[1,134],232:[1,137]},{1:[2,68],6:[2,68],9:[1,486],10:[2,68],13:[2,68],20:[1,487],21:[2,68],58:[2,68],66:[2,68],77:[2,68],78:485,83:[2,68],96:[2,68],120:[2,68],122:[2,68],134:[2,68],160:[2,68],189:[2,68],190:[2,68],200:[2,68],201:[2,68],202:[2,68],206:[2,68],214:[2,68],222:[2,68],223:[2,68],226:[2,68],227:[2,68],230:[2,68],231:[2,68],232:[2,68]},{6:[2,175],85:488,87:[1,339]},{6:[1,489]},{6:[2,75],13:[2,75],56:[2,75],59:[2,75],77:[2,75],82:[2,75],87:[2,75],103:[2,75],104:[2,75]},{6:[2,77],13:[2,77],56:[2,77],59:[2,77],77:[2,77],82:[2,77],87:[2,77],103:[2,77],104:[2,77]},{12:490,15:145,16:30,17:31,18:[1,32],19:[1,33],22:[1,34],23:[1,35],24:36,25:[1,74],31:[1,109],33:11,34:12,35:13,36:14,37:15,38:16,39:17,40:18,41:19,42:20,43:21,44:22,45:23,46:24,47:25,48:26,49:27,50:87,51:[1,111],57:[1,90],59:[1,86],64:[1,83],65:97,70:46,72:[1,119],73:78,74:[1,70],80:96,81:[1,122],84:93,92:69,93:[1,64],94:[1,107],100:45,101:[1,85],102:110,103:[1,114],104:[1,115],105:94,106:[1,116],107:92,108:[1,113],109:95,110:[1,117],111:[1,108],112:40,113:[1,79],114:[1,80],115:[1,81],116:38,121:[1,82],123:[1,72],127:47,128:48,129:49,130:[1,91],131:[1,89],135:[1,71],137:76,139:[1,120],141:57,143:88,144:[1,66],145:[1,67],146:[1,112],154:44,157:75,162:99,163:98,164:[1,121],165:56,167:39,169:[1,77],170:[1,37],171:41,172:42,173:[1,43],178:63,179:[1,65],180:[1,106],181:[1,68],186:[1,84],187:[1,118],192:[1,58],198:[1,73],199:59,200:[1,101],202:[1,102],203:60,204:[1,103],205:61,206:[1,104],207:105,215:[1,62],220:[1,100],224:[1,50],225:[1,51],226:[1,52],227:[1,53],228:[1,54],229:[1,55]},{83:[1,491],96:[1,135],160:[1,136],199:139,200:[1,101],202:[1,102],205:140,206:[1,104],207:105,222:[1,138],223:[1,130],226:[1,132],227:[1,131],230:[1,133],231:[1,134],232:[1,137]},{6:[2,79],13:[2,79],56:[2,79],59:[2,79],77:[2,79],82:[2,79],87:[2,79],103:[2,79],104:[2,79]},{12:492,15:145,16:30,17:31,18:[1,32],19:[1,33],22:[1,34],23:[1,35],24:36,25:[1,74],31:[1,109],33:11,34:12,35:13,36:14,37:15,38:16,39:17,40:18,41:19,42:20,43:21,44:22,45:23,46:24,47:25,48:26,49:27,50:87,51:[1,111],57:[1,90],59:[1,86],64:[1,83],65:97,70:46,72:[1,119],73:78,74:[1,70],80:96,81:[1,122],84:93,92:69,93:[1,64],94:[1,107],100:45,101:[1,85],102:110,103:[1,114],104:[1,115],105:94,106:[1,116],107:92,108:[1,113],109:95,110:[1,117],111:[1,108],112:40,113:[1,79],114:[1,80],115:[1,81],116:38,121:[1,82],123:[1,72],127:47,128:48,129:49,130:[1,91],131:[1,89],135:[1,71],137:76,139:[1,120],141:57,143:88,144:[1,66],145:[1,67],146:[1,112],154:44,157:75,162:99,163:98,164:[1,121],165:56,167:39,169:[1,77],170:[1,37],171:41,172:42,173:[1,43],178:63,179:[1,65],180:[1,106],181:[1,68],186:[1,84],187:[1,118],192:[1,58],198:[1,73],199:59,200:[1,101],202:[1,102],203:60,204:[1,103],205:61,206:[1,104],207:105,215:[1,62],220:[1,100],224:[1,50],225:[1,51],226:[1,52],227:[1,53],228:[1,54],229:[1,55]},{12:494,15:145,16:30,17:31,18:[1,32],19:[1,33],22:[1,34],23:[1,35],24:36,25:[1,74],31:[1,109],33:11,34:12,35:13,36:14,37:15,38:16,39:17,40:18,41:19,42:20,43:21,44:22,45:23,46:24,47:25,48:26,49:27,50:87,51:[1,111],57:[1,90],59:[1,86],64:[1,83],65:97,70:46,72:[1,119],73:78,74:[1,70],80:96,81:[1,122],84:93,89:493,92:69,93:[1,64],94:[1,107],100:45,101:[1,85],102:110,103:[1,114],104:[1,115],105:94,106:[1,116],107:92,108:[1,113],109:95,110:[1,117],111:[1,108],112:40,113:[1,79],114:[1,80],115:[1,81],116:38,121:[1,82],123:[1,72],127:47,128:48,129:49,130:[1,91],131:[1,89],135:[1,71],137:76,139:[1,120],141:57,143:88,144:[1,66],145:[1,67],146:[1,112],154:44,157:75,162:99,163:98,164:[1,121],165:56,167:39,169:[1,77],170:[1,37],171:41,172:42,173:[1,43],178:63,179:[1,65],180:[1,106],181:[1,68],186:[1,84],187:[1,118],192:[1,58],198:[1,73],199:59,200:[1,101],202:[1,102],203:60,204:[1,103],205:61,206:[1,104],207:105,215:[1,62],220:[1,100],224:[1,50],225:[1,51],226:[1,52],227:[1,53],228:[1,54],229:[1,55]},{77:[1,495]},{21:[1,496]},{1:[2,147],6:[2,147],9:[2,147],10:[2,147],13:[2,147],20:[2,147],21:[2,147],57:[2,147],58:[2,147],66:[2,147],77:[2,147],83:[2,147],96:[2,147],120:[2,147],122:[2,147],134:[2,147],160:[2,147],189:[2,147],190:[2,147],200:[2,147],201:[2,147],202:[2,147],206:[2,147],214:[2,147],222:[2,147],223:[2,147],226:[2,147],227:[2,147],230:[2,147],231:[2,147],232:[2,147]},{6:[1,124],8:435,9:[1,436],21:[1,497]},{1:[2,26],6:[2,26],10:[2,26],13:[2,26],122:[2,26],200:[2,26],202:[2,26],206:[2,26],222:[2,26]},{13:[2,31],27:[2,31]},{1:[2,27],6:[2,27],10:[2,27],13:[2,27],122:[2,27],200:[2,27],202:[2,27],206:[2,27],222:[2,27]},{122:[1,498]},{66:[1,499],96:[1,135],160:[1,136],199:139,200:[1,101],202:[1,102],205:140,206:[1,104],207:105,222:[1,138],223:[1,130],226:[1,132],227:[1,131],230:[1,133],231:[1,134],232:[1,137]},{1:[2,269],6:[2,269],9:[2,269],10:[2,269],13:[2,269],20:[2,269],21:[2,269],56:[2,269],58:[2,269],66:[2,269],77:[2,269],81:[2,269],82:[2,269],83:[2,269],88:[2,269],96:[2,269],120:[2,269],122:[2,269],134:[2,269],160:[2,269],185:[2,269],189:[2,269],190:[2,269],200:[2,269],201:[2,269],202:[2,269],206:[2,269],212:[2,269],213:[2,269],214:[2,269],222:[2,269],223:[2,269],226:[2,269],227:[2,269],230:[2,269],231:[2,269],232:[2,269]},{11:217,12:346,14:219,15:145,16:30,17:31,18:[1,32],19:[1,33],22:[1,34],23:[1,35],24:36,25:[1,74],31:[1,109],33:11,34:12,35:13,36:14,37:15,38:16,39:17,40:18,41:19,42:20,43:21,44:22,45:23,46:24,47:25,48:26,49:27,50:87,51:[1,111],57:[1,90],59:[1,86],64:[1,83],65:97,70:46,72:[1,119],73:78,74:[1,70],80:96,81:[1,122],84:93,92:69,93:[1,64],94:[1,107],100:45,101:[1,85],102:110,103:[1,114],104:[1,115],105:94,106:[1,116],107:92,108:[1,113],109:95,110:[1,117],111:[1,108],112:40,113:[1,79],114:[1,80],115:[1,81],116:38,121:[1,82],123:[1,72],125:[1,28],126:[1,29],127:47,128:48,129:49,130:[1,91],131:[1,89],135:[1,71],137:76,139:[1,120],141:57,143:88,144:[1,66],145:[1,67],146:[1,112],154:44,157:75,159:[1,10],160:[1,218],162:99,163:98,164:[1,121],165:56,167:39,169:[1,77],170:[1,37],171:41,172:42,173:[1,43],175:500,178:63,179:[1,65],180:[1,106],181:[1,68],186:[1,84],187:[1,118],192:[1,58],198:[1,73],199:59,200:[1,101],202:[1,102],203:60,204:[1,103],205:61,206:[1,104],207:105,215:[1,62],220:[1,100],224:[1,50],225:[1,51],226:[1,52],227:[1,53],228:[1,54],229:[1,55]},{9:[1,216],11:217,12:346,14:219,15:145,16:30,17:31,18:[1,32],19:[1,33],22:[1,34],23:[1,35],24:36,25:[1,74],31:[1,109],33:11,34:12,35:13,36:14,37:15,38:16,39:17,40:18,41:19,42:20,43:21,44:22,45:23,46:24,47:25,48:26,49:27,50:87,51:[1,111],57:[1,90],59:[1,86],64:[1,83],65:97,70:46,72:[1,119],73:78,74:[1,70],80:96,81:[1,122],84:93,90:501,92:69,93:[1,64],94:[1,107],100:45,101:[1,85],102:110,103:[1,114],104:[1,115],105:94,106:[1,116],107:92,108:[1,113],109:95,110:[1,117],111:[1,108],112:40,113:[1,79],114:[1,80],115:[1,81],116:38,121:[1,82],123:[1,72],125:[1,28],126:[1,29],127:47,128:48,129:49,130:[1,91],131:[1,89],135:[1,71],137:76,139:[1,120],141:57,143:88,144:[1,66],145:[1,67],146:[1,112],154:44,157:75,159:[1,10],160:[1,218],162:99,163:98,164:[1,121],165:56,167:39,169:[1,77],170:[1,37],171:41,172:42,173:[1,43],175:215,178:63,179:[1,65],180:[1,106],181:[1,68],186:[1,84],187:[1,118],192:[1,58],198:[1,73],199:59,200:[1,101],202:[1,102],203:60,204:[1,103],205:61,206:[1,104],207:105,215:[1,62],220:[1,100],224:[1,50],225:[1,51],226:[1,52],227:[1,53],228:[1,54],229:[1,55]},{6:[2,277],9:[2,277],10:[2,277],13:[2,277],21:[2,277],66:[2,277]},{6:[1,124],8:503,9:[1,436],10:[1,476],117:502},{58:[1,504],96:[1,135],160:[1,136],199:139,200:[1,101],202:[1,102],205:140,206:[1,104],207:105,222:[1,138],223:[1,130],226:[1,132],227:[1,131],230:[1,133],231:[1,134],232:[1,137]},{58:[1,505],96:[1,135],160:[1,136],199:139,200:[1,101],202:[1,102],205:140,206:[1,104],207:105,222:[1,138],223:[1,130],226:[1,132],227:[1,131],230:[1,133],231:[1,134],232:[1,137]},{53:[2,61],54:[2,61],55:[2,61],56:[2,61],59:[2,61],60:[2,61],61:[2,61],62:[2,61],63:[2,61],64:[2,61],69:[2,61],71:[2,61]},{31:[1,109],57:[1,509],68:506,72:[1,507],73:508,81:[1,122],102:110,111:[1,108]},{5:510,9:[1,5]},{57:[1,169],64:[1,367],65:368,72:[1,119],137:361,156:511,157:362,158:363,159:[1,364],160:[1,365],161:[1,366]},{12:512,15:145,16:30,17:31,18:[1,32],19:[1,33],22:[1,34],23:[1,35],24:36,25:[1,74],31:[1,109],33:11,34:12,35:13,36:14,37:15,38:16,39:17,40:18,41:19,42:20,43:21,44:22,45:23,46:24,47:25,48:26,49:27,50:87,51:[1,111],57:[1,90],59:[1,86],64:[1,83],65:97,70:46,72:[1,119],73:78,74:[1,70],80:96,81:[1,122],84:93,92:69,93:[1,64],94:[1,107],100:45,101:[1,85],102:110,103:[1,114],104:[1,115],105:94,106:[1,116],107:92,108:[1,113],109:95,110:[1,117],111:[1,108],112:40,113:[1,79],114:[1,80],115:[1,81],116:38,121:[1,82],123:[1,72],127:47,128:48,129:49,130:[1,91],131:[1,89],135:[1,71],137:76,139:[1,120],141:57,143:88,144:[1,66],145:[1,67],146:[1,112],154:44,157:75,162:99,163:98,164:[1,121],165:56,167:39,169:[1,77],170:[1,37],171:41,172:42,173:[1,43],178:63,179:[1,65],180:[1,106],181:[1,68],186:[1,84],187:[1,118],192:[1,58],198:[1,73],199:59,200:[1,101],202:[1,102],203:60,204:[1,103],205:61,206:[1,104],207:105,215:[1,62],220:[1,100],224:[1,50],225:[1,51],226:[1,52],227:[1,53],228:[1,54],229:[1,55]},{13:[2,182],21:[2,182],134:[2,182]},{13:[2,183],21:[2,183],134:[2,183]},{13:[2,184],21:[2,184],134:[2,184]},{5:513,9:[1,5]},{1:[2,238],6:[2,238],9:[2,238],10:[2,238],13:[2,238],20:[2,238],21:[2,238],56:[2,238],58:[2,238],66:[2,238],77:[2,238],81:[2,238],82:[2,238],83:[2,238],88:[2,238],96:[2,238],120:[2,238],122:[2,238],134:[2,238],160:[2,238],185:[2,238],189:[2,238],190:[2,238],200:[2,238],201:[2,238],202:[2,238],206:[2,238],212:[2,238],213:[2,238],214:[2,238],222:[2,238],223:[2,238],226:[2,238],227:[2,238],230:[2,238],231:[2,238],232:[2,238]},{14:240,31:[1,109],65:241,72:[1,119],73:243,81:[1,122],84:244,102:110,103:[1,114],104:[1,115],105:245,106:[1,116],107:242,108:[1,113],111:[1,108],118:514,119:239,121:[1,246],125:[1,28],126:[1,29]},{6:[2,239],9:[2,239],10:[2,239],13:[2,239],14:240,31:[1,109],65:241,72:[1,119],73:243,81:[1,122],84:244,102:110,103:[1,114],104:[1,115],105:245,106:[1,116],107:242,108:[1,113],111:[1,108],118:238,119:239,121:[1,246],125:[1,28],126:[1,29],177:515},{6:[2,241],9:[2,241],10:[2,241],13:[2,241],58:[2,241]},{6:[2,122],9:[2,122],10:[2,122],13:[2,122],58:[2,122],96:[1,135],160:[1,136],199:139,200:[1,101],202:[1,102],205:140,206:[1,104],207:105,222:[1,138],223:[1,130],226:[1,132],227:[1,131],230:[1,133],231:[1,134],232:[1,137]},{12:516,15:145,16:30,17:31,18:[1,32],19:[1,33],22:[1,34],23:[1,35],24:36,25:[1,74],31:[1,109],33:11,34:12,35:13,36:14,37:15,38:16,39:17,40:18,41:19,42:20,43:21,44:22,45:23,46:24,47:25,48:26,49:27,50:87,51:[1,111],57:[1,90],59:[1,86],64:[1,83],65:97,70:46,72:[1,119],73:78,74:[1,70],80:96,81:[1,122],84:93,92:69,93:[1,64],94:[1,107],100:45,101:[1,85],102:110,103:[1,114],104:[1,115],105:94,106:[1,116],107:92,108:[1,113],109:95,110:[1,117],111:[1,108],112:40,113:[1,79],114:[1,80],115:[1,81],116:38,121:[1,82],123:[1,72],127:47,128:48,129:49,130:[1,91],131:[1,89],135:[1,71],137:76,139:[1,120],141:57,143:88,144:[1,66],145:[1,67],146:[1,112],154:44,157:75,162:99,163:98,164:[1,121],165:56,167:39,169:[1,77],170:[1,37],171:41,172:42,173:[1,43],178:63,179:[1,65],180:[1,106],181:[1,68],186:[1,84],187:[1,118],192:[1,58],198:[1,73],199:59,200:[1,101],202:[1,102],203:60,204:[1,103],205:61,206:[1,104],207:105,215:[1,62],220:[1,100],224:[1,50],225:[1,51],226:[1,52],227:[1,53],228:[1,54],229:[1,55]},{6:[2,130],9:[2,130],10:[2,130],13:[2,130],58:[2,130],120:[2,130]},{1:[2,299],6:[2,299],9:[2,299],10:[2,299],13:[2,299],21:[2,299],58:[2,299],66:[2,299],77:[2,299],83:[2,299],96:[1,135],120:[2,299],122:[2,299],134:[2,299],160:[1,136],189:[2,299],190:[2,299],199:139,200:[1,101],201:[2,299],202:[1,102],205:140,206:[1,104],207:105,214:[2,299],222:[2,299],223:[1,130],226:[1,132],227:[1,131],230:[1,133],231:[1,134],232:[1,137]},{1:[2,301],6:[2,301],9:[2,301],10:[2,301],13:[2,301],21:[2,301],58:[2,301],66:[2,301],77:[2,301],83:[2,301],96:[1,135],120:[2,301],122:[2,301],134:[2,301],160:[1,136],189:[2,301],190:[2,301],199:139,200:[1,101],201:[2,301],202:[1,102],205:140,206:[1,104],207:105,214:[2,301],222:[2,301],223:[1,130],226:[1,132],227:[1,131],230:[1,133],231:[1,134],232:[1,137]},{212:[2,320],213:[2,320]},{12:517,15:145,16:30,17:31,18:[1,32],19:[1,33],22:[1,34],23:[1,35],24:36,25:[1,74],31:[1,109],33:11,34:12,35:13,36:14,37:15,38:16,39:17,40:18,41:19,42:20,43:21,44:22,45:23,46:24,47:25,48:26,49:27,50:87,51:[1,111],57:[1,90],59:[1,86],64:[1,83],65:97,70:46,72:[1,119],73:78,74:[1,70],80:96,81:[1,122],84:93,92:69,93:[1,64],94:[1,107],100:45,101:[1,85],102:110,103:[1,114],104:[1,115],105:94,106:[1,116],107:92,108:[1,113],109:95,110:[1,117],111:[1,108],112:40,113:[1,79],114:[1,80],115:[1,81],116:38,121:[1,82],123:[1,72],127:47,128:48,129:49,130:[1,91],131:[1,89],135:[1,71],137:76,139:[1,120],141:57,143:88,144:[1,66],145:[1,67],146:[1,112],154:44,157:75,162:99,163:98,164:[1,121],165:56,167:39,169:[1,77],170:[1,37],171:41,172:42,173:[1,43],178:63,179:[1,65],180:[1,106],181:[1,68],186:[1,84],187:[1,118],192:[1,58],198:[1,73],199:59,200:[1,101],202:[1,102],203:60,204:[1,103],205:61,206:[1,104],207:105,215:[1,62],220:[1,100],224:[1,50],225:[1,51],226:[1,52],227:[1,53],228:[1,54],229:[1,55]},{12:518,15:145,16:30,17:31,18:[1,32],19:[1,33],22:[1,34],23:[1,35],24:36,25:[1,74],31:[1,109],33:11,34:12,35:13,36:14,37:15,38:16,39:17,40:18,41:19,42:20,43:21,44:22,45:23,46:24,47:25,48:26,49:27,50:87,51:[1,111],57:[1,90],59:[1,86],64:[1,83],65:97,70:46,72:[1,119],73:78,74:[1,70],80:96,81:[1,122],84:93,92:69,93:[1,64],94:[1,107],100:45,101:[1,85],102:110,103:[1,114],104:[1,115],105:94,106:[1,116],107:92,108:[1,113],109:95,110:[1,117],111:[1,108],112:40,113:[1,79],114:[1,80],115:[1,81],116:38,121:[1,82],123:[1,72],127:47,128:48,129:49,130:[1,91],131:[1,89],135:[1,71],137:76,139:[1,120],141:57,143:88,144:[1,66],145:[1,67],146:[1,112],154:44,157:75,162:99,163:98,164:[1,121],165:56,167:39,169:[1,77],170:[1,37],171:41,172:42,173:[1,43],178:63,179:[1,65],180:[1,106],181:[1,68],186:[1,84],187:[1,118],192:[1,58],198:[1,73],199:59,200:[1,101],202:[1,102],203:60,204:[1,103],205:61,206:[1,104],207:105,215:[1,62],220:[1,100],224:[1,50],225:[1,51],226:[1,52],227:[1,53],228:[1,54],229:[1,55]},{12:519,15:145,16:30,17:31,18:[1,32],19:[1,33],22:[1,34],23:[1,35],24:36,25:[1,74],31:[1,109],33:11,34:12,35:13,36:14,37:15,38:16,39:17,40:18,41:19,42:20,43:21,44:22,45:23,46:24,47:25,48:26,49:27,50:87,51:[1,111],57:[1,90],59:[1,86],64:[1,83],65:97,70:46,72:[1,119],73:78,74:[1,70],80:96,81:[1,122],84:93,92:69,93:[1,64],94:[1,107],100:45,101:[1,85],102:110,103:[1,114],104:[1,115],105:94,106:[1,116],107:92,108:[1,113],109:95,110:[1,117],111:[1,108],112:40,113:[1,79],114:[1,80],115:[1,81],116:38,121:[1,82],123:[1,72],127:47,128:48,129:49,130:[1,91],131:[1,89],135:[1,71],137:76,139:[1,120],141:57,143:88,144:[1,66],145:[1,67],146:[1,112],154:44,157:75,162:99,163:98,164:[1,121],165:56,167:39,169:[1,77],170:[1,37],171:41,172:42,173:[1,43],178:63,179:[1,65],180:[1,106],181:[1,68],186:[1,84],187:[1,118],192:[1,58],198:[1,73],199:59,200:[1,101],202:[1,102],203:60,204:[1,103],205:61,206:[1,104],207:105,215:[1,62],220:[1,100],224:[1,50],225:[1,51],226:[1,52],227:[1,53],228:[1,54],229:[1,55]},{1:[2,252],5:520,6:[2,252],9:[1,5],10:[2,252],13:[2,252],21:[2,252],58:[2,252],66:[2,252],77:[2,252],83:[2,252],96:[1,135],120:[2,252],122:[2,252],134:[2,252],160:[1,136],189:[2,252],190:[2,252],199:139,200:[1,101],201:[2,252],202:[1,102],205:140,206:[1,104],207:105,214:[2,252],222:[2,252],223:[1,130],226:[1,132],227:[1,131],230:[1,133],231:[1,134],232:[1,137]},{1:[2,97],5:521,6:[2,97],9:[1,5],10:[2,97],13:[2,97],21:[2,97],58:[2,97],66:[2,97],77:[2,97],83:[2,97],96:[2,97],120:[2,97],122:[2,97],134:[2,97],160:[2,97],189:[2,97],190:[2,97],200:[2,97],201:[2,97],202:[2,97],206:[2,97],214:[2,97],222:[2,97],223:[2,97],226:[2,97],227:[2,97],230:[2,97],231:[2,97],232:[2,97]},{20:[1,522],150:[1,523],152:[1,524]},{13:[1,444],21:[1,525]},{1:[2,158],6:[2,158],9:[2,158],10:[2,158],13:[2,158],21:[2,158],58:[2,158],66:[2,158],77:[2,158],83:[2,158],96:[2,158],120:[2,158],122:[2,158],134:[2,158],160:[2,158],189:[2,158],190:[2,158],200:[2,158],201:[2,158],202:[2,158],206:[2,158],214:[2,158],222:[2,158],223:[2,158],226:[2,158],227:[2,158],230:[2,158],231:[2,158],232:[2,158]},{1:[2,168],6:[2,168],9:[2,168],10:[2,168],13:[2,168],21:[2,168],58:[2,168],66:[2,168],77:[2,168],83:[2,168],96:[2,168],120:[2,168],122:[2,168],134:[2,168],160:[2,168],189:[2,168],190:[2,168],200:[2,168],201:[2,168],202:[2,168],206:[2,168],214:[2,168],222:[2,168],223:[2,168],226:[2,168],227:[2,168],230:[2,168],231:[2,168],232:[2,168]},{1:[2,169],6:[2,169],9:[2,169],10:[2,169],13:[2,169],21:[2,169],58:[2,169],66:[2,169],77:[2,169],83:[2,169],96:[2,169],120:[2,169],122:[2,169],134:[2,169],160:[2,169],189:[2,169],190:[2,169],200:[2,169],201:[2,169],202:[2,169],206:[2,169],214:[2,169],222:[2,169],223:[2,169],226:[2,169],227:[2,169],230:[2,169],231:[2,169],232:[2,169]},{1:[2,162],6:[2,162],9:[2,162],10:[2,162],13:[2,162],21:[2,162],58:[2,162],66:[2,162],77:[2,162],83:[2,162],96:[2,162],120:[2,162],122:[2,162],134:[2,162],160:[2,162],189:[2,162],190:[2,162],200:[2,162],201:[2,162],202:[2,162],206:[2,162],214:[2,162],222:[2,162],223:[2,162],226:[2,162],227:[2,162],230:[2,162],231:[2,162],232:[2,162]},{20:[2,167],56:[2,167],59:[2,167],150:[2,167],152:[2,167]},{1:[2,343],6:[2,343],9:[2,343],10:[2,343],13:[2,343],21:[2,343],58:[2,343],66:[2,343],77:[2,343],83:[2,343],96:[1,135],120:[2,343],122:[2,343],134:[2,343],160:[1,136],189:[2,343],190:[2,343],199:139,200:[2,343],201:[2,343],202:[2,343],205:140,206:[2,343],207:105,214:[2,343],222:[2,343],223:[2,343],226:[1,132],227:[1,131],230:[1,133],231:[1,134],232:[1,137]},{83:[2,273],96:[1,135],160:[1,136],199:139,200:[1,101],202:[1,102],205:140,206:[1,104],207:105,222:[1,138],223:[1,130],226:[1,132],227:[1,131],230:[1,133],231:[1,134],232:[1,137]},{1:[2,120],6:[2,120],9:[2,120],10:[2,120],13:[2,120],21:[2,120],58:[2,120],66:[2,120],77:[2,120],83:[2,120],96:[2,120],120:[2,120],122:[2,120],134:[2,120],160:[2,120],189:[2,120],190:[2,120],200:[2,120],201:[2,120],202:[2,120],206:[2,120],214:[2,120],222:[2,120],223:[2,120],226:[2,120],227:[2,120],230:[2,120],231:[2,120],232:[2,120]},{10:[1,526]},{1:[2,282],6:[2,282],9:[2,282],10:[2,282],13:[2,282],21:[2,282],58:[2,282],66:[2,282],77:[2,282],83:[2,282],96:[2,282],120:[2,282],122:[2,282],134:[2,282],160:[2,282],189:[2,282],190:[2,282],200:[2,282],201:[2,282],202:[2,282],206:[2,282],214:[2,282],222:[2,282],223:[2,282],226:[2,282],227:[2,282],230:[2,282],231:[2,282],232:[2,282]},{1:[2,361],6:[2,361],9:[2,361],10:[2,361],13:[2,361],21:[2,361],58:[2,361],66:[2,361],77:[2,361],83:[2,361],96:[2,361],120:[2,361],122:[2,361],134:[2,361],160:[2,361],189:[2,361],190:[2,361],200:[2,361],201:[2,361],202:[2,361],206:[2,361],214:[2,361],222:[2,361],223:[2,361],226:[2,361],227:[2,361],230:[2,361],231:[2,361],232:[2,361]},{1:[2,337],6:[2,337],9:[2,337],10:[2,337],13:[2,337],21:[2,337],58:[2,337],66:[2,337],77:[2,337],83:[2,337],96:[2,337],120:[2,337],122:[2,337],134:[2,337],160:[2,337],189:[2,337],190:[2,337],200:[2,337],201:[2,337],202:[2,337],206:[2,337],214:[2,337],217:[2,337],221:[2,337],222:[2,337],223:[2,337],226:[2,337],227:[2,337],230:[2,337],231:[2,337],232:[2,337]},{1:[2,294],6:[2,294],9:[2,294],10:[2,294],13:[2,294],21:[2,294],58:[2,294],66:[2,294],77:[2,294],83:[2,294],96:[2,294],120:[2,294],122:[2,294],134:[2,294],160:[2,294],189:[2,294],190:[2,294],195:[2,294],200:[2,294],201:[2,294],202:[2,294],206:[2,294],214:[2,294],222:[2,294],223:[2,294],226:[2,294],227:[2,294],230:[2,294],231:[2,294],232:[2,294]},{1:[2,328],6:[2,328],9:[2,328],10:[2,328],13:[2,328],21:[2,328],58:[2,328],66:[2,328],77:[2,328],83:[2,328],96:[2,328],120:[2,328],122:[2,328],134:[2,328],160:[2,328],189:[2,328],190:[2,328],200:[2,328],201:[2,328],202:[2,328],206:[2,328],214:[2,328],222:[2,328],223:[2,328],226:[2,328],227:[2,328],230:[2,328],231:[2,328],232:[2,328]},{5:527,9:[1,5]},{10:[1,528]},{6:[1,529],10:[2,334],217:[2,334],219:[2,334]},{12:530,15:145,16:30,17:31,18:[1,32],19:[1,33],22:[1,34],23:[1,35],24:36,25:[1,74],31:[1,109],33:11,34:12,35:13,36:14,37:15,38:16,39:17,40:18,41:19,42:20,43:21,44:22,45:23,46:24,47:25,48:26,49:27,50:87,51:[1,111],57:[1,90],59:[1,86],64:[1,83],65:97,70:46,72:[1,119],73:78,74:[1,70],80:96,81:[1,122],84:93,92:69,93:[1,64],94:[1,107],100:45,101:[1,85],102:110,103:[1,114],104:[1,115],105:94,106:[1,116],107:92,108:[1,113],109:95,110:[1,117],111:[1,108],112:40,113:[1,79],114:[1,80],115:[1,81],116:38,121:[1,82],123:[1,72],127:47,128:48,129:49,130:[1,91],131:[1,89],135:[1,71],137:76,139:[1,120],141:57,143:88,144:[1,66],145:[1,67],146:[1,112],154:44,157:75,162:99,163:98,164:[1,121],165:56,167:39,169:[1,77],170:[1,37],171:41,172:42,173:[1,43],178:63,179:[1,65],180:[1,106],181:[1,68],186:[1,84],187:[1,118],192:[1,58],198:[1,73],199:59,200:[1,101],202:[1,102],203:60,204:[1,103],205:61,206:[1,104],207:105,215:[1,62],220:[1,100],224:[1,50],225:[1,51],226:[1,52],227:[1,53],228:[1,54],229:[1,55]},{1:[2,69],6:[2,69],9:[2,69],10:[2,69],13:[2,69],21:[2,69],58:[2,69],66:[2,69],77:[2,69],83:[2,69],96:[2,69],120:[2,69],122:[2,69],134:[2,69],160:[2,69],189:[2,69],190:[2,69],200:[2,69],201:[2,69],202:[2,69],206:[2,69],214:[2,69],222:[2,69],223:[2,69],226:[2,69],227:[2,69],230:[2,69],231:[2,69],232:[2,69]},{9:[1,216],11:217,12:346,14:219,15:145,16:30,17:31,18:[1,32],19:[1,33],22:[1,34],23:[1,35],24:36,25:[1,74],31:[1,109],33:11,34:12,35:13,36:14,37:15,38:16,39:17,40:18,41:19,42:20,43:21,44:22,45:23,46:24,47:25,48:26,49:27,50:87,51:[1,111],57:[1,90],59:[1,86],64:[1,83],65:97,70:46,72:[1,119],73:78,74:[1,70],80:96,81:[1,122],84:93,90:531,92:69,93:[1,64],94:[1,107],100:45,101:[1,85],102:110,103:[1,114],104:[1,115],105:94,106:[1,116],107:92,108:[1,113],109:95,110:[1,117],111:[1,108],112:40,113:[1,79],114:[1,80],115:[1,81],116:38,121:[1,82],123:[1,72],125:[1,28],126:[1,29],127:47,128:48,129:49,130:[1,91],131:[1,89],135:[1,71],137:76,139:[1,120],141:57,143:88,144:[1,66],145:[1,67],146:[1,112],154:44,157:75,159:[1,10],160:[1,218],162:99,163:98,164:[1,121],165:56,167:39,169:[1,77],170:[1,37],171:41,172:42,173:[1,43],175:215,178:63,179:[1,65],180:[1,106],181:[1,68],186:[1,84],187:[1,118],192:[1,58],198:[1,73],199:59,200:[1,101],202:[1,102],203:60,204:[1,103],205:61,206:[1,104],207:105,215:[1,62],220:[1,100],224:[1,50],225:[1,51],226:[1,52],227:[1,53],228:[1,54],229:[1,55]},{9:[1,216],11:217,12:346,14:219,15:145,16:30,17:31,18:[1,32],19:[1,33],22:[1,34],23:[1,35],24:36,25:[1,74],31:[1,109],33:11,34:12,35:13,36:14,37:15,38:16,39:17,40:18,41:19,42:20,43:21,44:22,45:23,46:24,47:25,48:26,49:27,50:87,51:[1,111],57:[1,90],59:[1,86],64:[1,83],65:97,70:46,72:[1,119],73:78,74:[1,70],80:96,81:[1,122],84:93,90:532,92:69,93:[1,64],94:[1,107],100:45,101:[1,85],102:110,103:[1,114],104:[1,115],105:94,106:[1,116],107:92,108:[1,113],109:95,110:[1,117],111:[1,108],112:40,113:[1,79],114:[1,80],115:[1,81],116:38,121:[1,82],123:[1,72],125:[1,28],126:[1,29],127:47,128:48,129:49,130:[1,91],131:[1,89],135:[1,71],137:76,139:[1,120],141:57,143:88,144:[1,66],145:[1,67],146:[1,112],154:44,157:75,159:[1,10],160:[1,218],162:99,163:98,164:[1,121],165:56,167:39,169:[1,77],170:[1,37],171:41,172:42,173:[1,43],175:215,178:63,179:[1,65],180:[1,106],181:[1,68],186:[1,84],187:[1,118],192:[1,58],198:[1,73],199:59,200:[1,101],202:[1,102],203:60,204:[1,103],205:61,206:[1,104],207:105,215:[1,62],220:[1,100],224:[1,50],225:[1,51],226:[1,52],227:[1,53],228:[1,54],229:[1,55]},{6:[2,84],13:[2,84],77:[2,84]},{85:533,87:[1,339]},{58:[1,534],96:[1,135],160:[1,136],199:139,200:[1,101],202:[1,102],205:140,206:[1,104],207:105,222:[1,138],223:[1,130],226:[1,132],227:[1,131],230:[1,133],231:[1,134],232:[1,137]},{6:[2,76],13:[2,76],56:[2,76],59:[2,76],77:[2,76],82:[2,76],87:[2,76],103:[2,76],104:[2,76]},{58:[1,535],96:[1,135],160:[1,136],199:139,200:[1,101],202:[1,102],205:140,206:[1,104],207:105,222:[1,138],223:[1,130],226:[1,132],227:[1,131],230:[1,133],231:[1,134],232:[1,137]},{6:[2,87],13:[2,87],77:[2,87]},{6:[2,88],13:[2,88],77:[2,88],96:[1,135],160:[1,136],199:139,200:[1,101],202:[1,102],205:140,206:[1,104],207:105,222:[1,138],223:[1,130],226:[1,132],227:[1,131],230:[1,133],231:[1,134],232:[1,137]},{1:[2,70],6:[2,70],9:[2,70],10:[2,70],13:[2,70],21:[2,70],58:[2,70],66:[2,70],77:[2,70],83:[2,70],96:[2,70],120:[2,70],122:[2,70],134:[2,70],160:[2,70],189:[2,70],190:[2,70],200:[2,70],201:[2,70],202:[2,70],206:[2,70],214:[2,70],222:[2,70],223:[2,70],226:[2,70],227:[2,70],230:[2,70],231:[2,70],232:[2,70]},{1:[2,144],6:[2,144],9:[2,144],10:[2,144],13:[2,144],21:[2,144],58:[2,144],66:[2,144],77:[2,144],83:[2,144],96:[2,144],120:[2,144],122:[2,144],134:[2,144],160:[2,144],189:[2,144],190:[2,144],200:[2,144],201:[2,144],202:[2,144],206:[2,144],214:[2,144],222:[2,144],223:[2,144],226:[2,144],227:[2,144],230:[2,144],231:[2,144],232:[2,144]},{1:[2,265],6:[2,265],9:[2,265],10:[2,265],13:[2,265],20:[2,265],21:[2,265],56:[2,265],57:[2,265],58:[2,265],66:[2,265],77:[2,265],82:[2,265],83:[2,265],96:[2,265],120:[2,265],122:[2,265],131:[2,265],134:[2,265],160:[2,265],185:[2,265],189:[2,265],190:[2,265],200:[2,265],201:[2,265],202:[2,265],206:[2,265],214:[2,265],222:[2,265],223:[2,265],226:[2,265],227:[2,265],230:[2,265],231:[2,265],232:[2,265]},{1:[2,297],6:[2,297],9:[2,297],10:[2,297],13:[2,297],20:[2,297],21:[2,297],56:[2,297],58:[2,297],66:[2,297],77:[2,297],81:[2,297],82:[2,297],83:[2,297],96:[2,297],120:[2,297],122:[2,297],134:[2,297],160:[2,297],185:[2,297],189:[2,297],190:[2,297],200:[2,297],201:[2,297],202:[2,297],206:[2,297],214:[2,297],222:[2,297],223:[2,297],226:[2,297],227:[2,297],230:[2,297],231:[2,297],232:[2,297]},{1:[2,272],6:[2,272],9:[2,272],10:[2,272],13:[2,272],20:[2,272],21:[2,272],56:[2,272],58:[2,272],66:[2,272],77:[2,272],81:[2,272],82:[2,272],83:[2,272],96:[2,272],120:[2,272],122:[2,272],134:[2,272],160:[2,272],185:[2,272],189:[2,272],190:[2,272],200:[2,272],201:[2,272],202:[2,272],206:[2,272],214:[2,272],222:[2,272],223:[2,272],226:[2,272],227:[2,272],230:[2,272],231:[2,272],232:[2,272]},{6:[2,278],9:[2,278],10:[2,278],13:[2,278],21:[2,278],66:[2,278]},{6:[2,174],9:[2,174],10:[2,174],13:[1,354],86:536},{6:[2,279],9:[2,279],10:[2,279],13:[2,279],21:[2,279],66:[2,279]},{10:[1,526],11:217,12:346,14:219,15:145,16:30,17:31,18:[1,32],19:[1,33],22:[1,34],23:[1,35],24:36,25:[1,74],31:[1,109],33:11,34:12,35:13,36:14,37:15,38:16,39:17,40:18,41:19,42:20,43:21,44:22,45:23,46:24,47:25,48:26,49:27,50:87,51:[1,111],57:[1,90],59:[1,86],64:[1,83],65:97,70:46,72:[1,119],73:78,74:[1,70],80:96,81:[1,122],84:93,92:69,93:[1,64],94:[1,107],100:45,101:[1,85],102:110,103:[1,114],104:[1,115],105:94,106:[1,116],107:92,108:[1,113],109:95,110:[1,117],111:[1,108],112:40,113:[1,79],114:[1,80],115:[1,81],116:38,121:[1,82],123:[1,72],125:[1,28],126:[1,29],127:47,128:48,129:49,130:[1,91],131:[1,89],135:[1,71],137:76,139:[1,120],141:57,143:88,144:[1,66],145:[1,67],146:[1,112],154:44,157:75,159:[1,10],160:[1,218],162:99,163:98,164:[1,121],165:56,167:39,169:[1,77],170:[1,37],171:41,172:42,173:[1,43],175:500,178:63,179:[1,65],180:[1,106],181:[1,68],186:[1,84],187:[1,118],192:[1,58],198:[1,73],199:59,200:[1,101],202:[1,102],203:60,204:[1,103],205:61,206:[1,104],207:105,215:[1,62],220:[1,100],224:[1,50],225:[1,51],226:[1,52],227:[1,53],228:[1,54],229:[1,55]},{53:[2,55],54:[2,55],55:[2,55],56:[2,55],59:[2,55],60:[2,55],61:[2,55],62:[2,55],63:[2,55],64:[2,55],69:[2,55],71:[2,55]},{53:[2,56],54:[2,56],55:[2,56],56:[2,56],59:[2,56],60:[2,56],61:[2,56],62:[2,56],63:[2,56],64:[2,56],69:[2,56],71:[2,56]},{66:[1,537]},{66:[2,65]},{66:[2,66]},{12:538,15:145,16:30,17:31,18:[1,32],19:[1,33],22:[1,34],23:[1,35],24:36,25:[1,74],31:[1,109],33:11,34:12,35:13,36:14,37:15,38:16,39:17,40:18,41:19,42:20,43:21,44:22,45:23,46:24,47:25,48:26,49:27,50:87,51:[1,111],57:[1,90],59:[1,86],64:[1,83],65:97,70:46,72:[1,119],73:78,74:[1,70],80:96,81:[1,122],84:93,92:69,93:[1,64],94:[1,107],100:45,101:[1,85],102:110,103:[1,114],104:[1,115],105:94,106:[1,116],107:92,108:[1,113],109:95,110:[1,117],111:[1,108],112:40,113:[1,79],114:[1,80],115:[1,81],116:38,121:[1,82],123:[1,72],127:47,128:48,129:49,130:[1,91],131:[1,89],135:[1,71],137:76,139:[1,120],141:57,143:88,144:[1,66],145:[1,67],146:[1,112],154:44,157:75,162:99,163:98,164:[1,121],165:56,167:39,169:[1,77],170:[1,37],171:41,172:42,173:[1,43],178:63,179:[1,65],180:[1,106],181:[1,68],186:[1,84],187:[1,118],192:[1,58],198:[1,73],199:59,200:[1,101],202:[1,102],203:60,204:[1,103],205:61,206:[1,104],207:105,215:[1,62],220:[1,100],224:[1,50],225:[1,51],226:[1,52],227:[1,53],228:[1,54],229:[1,55]},{1:[2,141],6:[2,141],9:[2,141],10:[2,141],13:[2,141],20:[2,141],21:[2,141],56:[2,141],57:[2,141],58:[2,141],66:[2,141],77:[2,141],82:[2,141],83:[2,141],96:[2,141],120:[2,141],122:[2,141],131:[2,141],134:[2,141],160:[2,141],185:[2,141],189:[2,141],190:[2,141],200:[2,141],201:[2,141],202:[2,141],206:[2,141],214:[2,141],222:[2,141],223:[2,141],226:[2,141],227:[2,141],230:[2,141],231:[2,141],232:[2,141]},{13:[2,178],21:[2,178],134:[2,178]},{13:[2,185],21:[2,185],96:[1,135],134:[2,185],160:[1,136],199:139,200:[1,101],202:[1,102],205:140,206:[1,104],207:105,222:[1,138],223:[1,130],226:[1,132],227:[1,131],230:[1,133],231:[1,134],232:[1,137]},{58:[1,539]},{6:[2,242],9:[2,242],10:[2,242],13:[2,242],58:[2,242]},{6:[2,174],9:[2,174],10:[2,174],13:[1,371],86:540},{6:[1,124],8:475,10:[1,476],96:[1,135],117:541,160:[1,136],199:139,200:[1,101],202:[1,102],205:140,206:[1,104],207:105,222:[1,138],223:[1,130],226:[1,132],227:[1,131],230:[1,133],231:[1,134],232:[1,137]},{1:[2,323],6:[2,323],9:[2,323],10:[2,323],13:[2,323],21:[2,323],58:[2,323],66:[2,323],77:[2,323],83:[2,323],96:[1,135],120:[2,323],122:[2,323],134:[2,323],160:[1,136],189:[2,323],190:[2,323],199:139,200:[2,323],201:[2,323],202:[2,323],205:140,206:[2,323],207:105,214:[1,542],222:[2,323],223:[1,130],226:[1,132],227:[1,131],230:[1,133],231:[1,134],232:[1,137]},{1:[2,325],6:[2,325],9:[2,325],10:[2,325],13:[2,325],21:[2,325],58:[2,325],66:[2,325],77:[2,325],83:[2,325],96:[1,135],120:[2,325],122:[2,325],134:[2,325],160:[1,136],189:[2,325],190:[2,325],199:139,200:[2,325],201:[1,543],202:[2,325],205:140,206:[2,325],207:105,214:[2,325],222:[2,325],223:[1,130],226:[1,132],227:[1,131],230:[1,133],231:[1,134],232:[1,137]},{1:[2,324],6:[2,324],9:[2,324],10:[2,324],13:[2,324],21:[2,324],58:[2,324],66:[2,324],77:[2,324],83:[2,324],96:[1,135],120:[2,324],122:[2,324],134:[2,324],160:[1,136],189:[2,324],190:[2,324],199:139,200:[2,324],201:[2,324],202:[2,324],205:140,206:[2,324],207:105,214:[2,324],222:[2,324],223:[1,130],226:[1,132],227:[1,131],230:[1,133],231:[1,134],232:[1,137]},{1:[2,253],6:[2,253],9:[2,253],10:[2,253],13:[2,253],21:[2,253],58:[2,253],66:[2,253],77:[2,253],83:[2,253],96:[2,253],120:[2,253],122:[2,253],134:[2,253],160:[2,253],189:[2,253],190:[2,253],200:[2,253],201:[2,253],202:[2,253],206:[2,253],214:[2,253],222:[2,253],223:[2,253],226:[2,253],227:[2,253],230:[2,253],231:[2,253],232:[2,253]},{1:[2,98],6:[2,98],9:[2,98],10:[2,98],13:[2,98],21:[2,98],58:[2,98],66:[2,98],77:[2,98],83:[2,98],96:[2,98],120:[2,98],122:[2,98],134:[2,98],160:[2,98],189:[2,98],190:[2,98],200:[2,98],201:[2,98],202:[2,98],206:[2,98],214:[2,98],222:[2,98],223:[2,98],226:[2,98],227:[2,98],230:[2,98],231:[2,98],232:[2,98]},{13:[2,176],21:[2,176],57:[1,169],64:[1,367],65:368,72:[1,119],133:544,137:361,156:360,157:362,158:363,159:[1,364],160:[1,365],161:[1,366]},{5:468,9:[1,5],57:[1,155],128:469,131:[1,89],151:545},{5:468,9:[1,5],57:[1,155],128:469,131:[1,89],151:546},{150:[1,547],152:[1,548]},{1:[2,281],6:[2,281],9:[2,281],10:[2,281],13:[2,281],21:[2,281],58:[2,281],66:[2,281],77:[2,281],83:[2,281],96:[2,281],120:[2,281],122:[2,281],134:[2,281],160:[2,281],189:[2,281],190:[2,281],200:[2,281],201:[2,281],202:[2,281],206:[2,281],214:[2,281],222:[2,281],223:[2,281],226:[2,281],227:[2,281],230:[2,281],231:[2,281],232:[2,281]},{6:[1,124],8:475,10:[1,476],117:549},{1:[2,331],6:[2,331],9:[2,331],10:[2,331],13:[2,331],21:[2,331],58:[2,331],66:[2,331],77:[2,331],83:[2,331],96:[2,331],120:[2,331],122:[2,331],134:[2,331],160:[2,331],189:[2,331],190:[2,331],200:[2,331],201:[2,331],202:[2,331],206:[2,331],214:[2,331],222:[2,331],223:[2,331],226:[2,331],227:[2,331],230:[2,331],231:[2,331],232:[2,331]},{10:[2,335],217:[2,335],219:[2,335]},{9:[2,288],13:[2,288],96:[1,135],160:[1,136],199:139,200:[1,101],202:[1,102],205:140,206:[1,104],207:105,222:[1,138],223:[1,130],226:[1,132],227:[1,131],230:[1,133],231:[1,134],232:[1,137]},{6:[2,174],9:[2,174],10:[1,550],13:[1,354],86:551},{6:[2,174],9:[2,174],13:[1,354],21:[1,552],86:551},{6:[2,85],13:[2,85],77:[2,85]},{6:[2,78],13:[2,78],56:[2,78],59:[2,78],77:[2,78],82:[2,78],87:[2,78],103:[2,78],104:[2,78]},{6:[2,81],13:[2,81],56:[2,81],59:[2,81],77:[2,81],82:[2,81],87:[2,81],103:[2,81],104:[2,81]},{6:[1,124],8:503,9:[1,436],10:[1,476],117:553},{53:[2,62],54:[2,62],55:[2,62],56:[2,62],59:[2,62],60:[2,62],61:[2,62],62:[2,62],63:[2,62],64:[2,62],69:[2,62],71:[2,62]},{58:[1,554],96:[1,135],160:[1,136],199:139,200:[1,101],202:[1,102],205:140,206:[1,104],207:105,222:[1,138],223:[1,130],226:[1,132],227:[1,131],230:[1,133],231:[1,134],232:[1,137]},{1:[2,142],6:[2,142],9:[2,142],10:[2,142],13:[2,142],20:[2,142],21:[2,142],56:[2,142],57:[2,142],58:[2,142],66:[2,142],77:[2,142],82:[2,142],83:[2,142],96:[2,142],120:[2,142],122:[2,142],131:[2,142],134:[2,142],160:[2,142],185:[2,142],189:[2,142],190:[2,142],200:[2,142],201:[2,142],202:[2,142],206:[2,142],214:[2,142],222:[2,142],223:[2,142],226:[2,142],227:[2,142],230:[2,142],231:[2,142],232:[2,142]},{6:[1,124],8:556,9:[1,452],10:[1,476],117:555},{6:[2,123],9:[2,123],10:[2,123],13:[2,123],58:[2,123]},{12:557,15:145,16:30,17:31,18:[1,32],19:[1,33],22:[1,34],23:[1,35],24:36,25:[1,74],31:[1,109],33:11,34:12,35:13,36:14,37:15,38:16,39:17,40:18,41:19,42:20,43:21,44:22,45:23,46:24,47:25,48:26,49:27,50:87,51:[1,111],57:[1,90],59:[1,86],64:[1,83],65:97,70:46,72:[1,119],73:78,74:[1,70],80:96,81:[1,122],84:93,92:69,93:[1,64],94:[1,107],100:45,101:[1,85],102:110,103:[1,114],104:[1,115],105:94,106:[1,116],107:92,108:[1,113],109:95,110:[1,117],111:[1,108],112:40,113:[1,79],114:[1,80],115:[1,81],116:38,121:[1,82],123:[1,72],127:47,128:48,129:49,130:[1,91],131:[1,89],135:[1,71],137:76,139:[1,120],141:57,143:88,144:[1,66],145:[1,67],146:[1,112],154:44,157:75,162:99,163:98,164:[1,121],165:56,167:39,169:[1,77],170:[1,37],171:41,172:42,173:[1,43],178:63,179:[1,65],180:[1,106],181:[1,68],186:[1,84],187:[1,118],192:[1,58],198:[1,73],199:59,200:[1,101],202:[1,102],203:60,204:[1,103],205:61,206:[1,104],207:105,215:[1,62],220:[1,100],224:[1,50],225:[1,51],226:[1,52],227:[1,53],228:[1,54],229:[1,55]},{12:558,15:145,16:30,17:31,18:[1,32],19:[1,33],22:[1,34],23:[1,35],24:36,25:[1,74],31:[1,109],33:11,34:12,35:13,36:14,37:15,38:16,39:17,40:18,41:19,42:20,43:21,44:22,45:23,46:24,47:25,48:26,49:27,50:87,51:[1,111],57:[1,90],59:[1,86],64:[1,83],65:97,70:46,72:[1,119],73:78,74:[1,70],80:96,81:[1,122],84:93,92:69,93:[1,64],94:[1,107],100:45,101:[1,85],102:110,103:[1,114],104:[1,115],105:94,106:[1,116],107:92,108:[1,113],109:95,110:[1,117],111:[1,108],112:40,113:[1,79],114:[1,80],115:[1,81],116:38,121:[1,82],123:[1,72],127:47,128:48,129:49,130:[1,91],131:[1,89],135:[1,71],137:76,139:[1,120],141:57,143:88,144:[1,66],145:[1,67],146:[1,112],154:44,157:75,162:99,163:98,164:[1,121],165:56,167:39,169:[1,77],170:[1,37],171:41,172:42,173:[1,43],178:63,179:[1,65],180:[1,106],181:[1,68],186:[1,84],187:[1,118],192:[1,58],198:[1,73],199:59,200:[1,101],202:[1,102],203:60,204:[1,103],205:61,206:[1,104],207:105,215:[1,62],220:[1,100],224:[1,50],225:[1,51],226:[1,52],227:[1,53],228:[1,54],229:[1,55]},{13:[1,444],21:[1,559]},{1:[2,156],6:[2,156],9:[2,156],10:[2,156],13:[2,156],21:[2,156],58:[2,156],66:[2,156],77:[2,156],83:[2,156],96:[2,156],120:[2,156],122:[2,156],134:[2,156],160:[2,156],189:[2,156],190:[2,156],200:[2,156],201:[2,156],202:[2,156],206:[2,156],214:[2,156],222:[2,156],223:[2,156],226:[2,156],227:[2,156],230:[2,156],231:[2,156],232:[2,156]},{1:[2,160],6:[2,160],9:[2,160],10:[2,160],13:[2,160],21:[2,160],58:[2,160],66:[2,160],77:[2,160],83:[2,160],96:[2,160],120:[2,160],122:[2,160],134:[2,160],160:[2,160],189:[2,160],190:[2,160],200:[2,160],201:[2,160],202:[2,160],206:[2,160],214:[2,160],222:[2,160],223:[2,160],226:[2,160],227:[2,160],230:[2,160],231:[2,160],232:[2,160]},{5:468,9:[1,5],57:[1,155],128:469,131:[1,89],151:560},{5:468,9:[1,5],57:[1,155],128:469,131:[1,89],151:561},{1:[2,329],6:[2,329],9:[2,329],10:[2,329],13:[2,329],21:[2,329],58:[2,329],66:[2,329],77:[2,329],83:[2,329],96:[2,329],120:[2,329],122:[2,329],134:[2,329],160:[2,329],189:[2,329],190:[2,329],200:[2,329],201:[2,329],202:[2,329],206:[2,329],214:[2,329],222:[2,329],223:[2,329],226:[2,329],227:[2,329],230:[2,329],231:[2,329],232:[2,329]},{1:[2,89],6:[2,89],9:[2,89],10:[2,89],13:[2,89],21:[2,89],58:[2,89],66:[2,89],77:[2,89],83:[2,89],96:[2,89],120:[2,89],122:[2,89],134:[2,89],160:[2,89],189:[2,89],190:[2,89],200:[2,89],201:[2,89],202:[2,89],206:[2,89],214:[2,89],222:[2,89],223:[2,89],226:[2,89],227:[2,89],230:[2,89],231:[2,89],232:[2,89]},{6:[1,124],8:435,9:[1,436]},{1:[2,90],6:[2,90],9:[2,90],10:[2,90],13:[2,90],21:[2,90],58:[2,90],66:[2,90],77:[2,90],83:[2,90],96:[2,90],120:[2,90],122:[2,90],134:[2,90],160:[2,90],189:[2,90],190:[2,90],200:[2,90],201:[2,90],202:[2,90],206:[2,90],214:[2,90],222:[2,90],223:[2,90],226:[2,90],227:[2,90],230:[2,90],231:[2,90],232:[2,90]},{6:[2,280],9:[2,280],10:[2,280],13:[2,280],21:[2,280],66:[2,280]},{66:[2,67]},{6:[2,243],9:[2,243],10:[2,243],13:[2,243],58:[2,243]},{10:[1,526],14:240,31:[1,109],65:241,72:[1,119],73:243,81:[1,122],84:244,102:110,103:[1,114],104:[1,115],105:245,106:[1,116],107:242,108:[1,113],111:[1,108],118:514,119:239,121:[1,246],125:[1,28],126:[1,29]},{1:[2,326],6:[2,326],9:[2,326],10:[2,326],13:[2,326],21:[2,326],58:[2,326],66:[2,326],77:[2,326],83:[2,326],96:[1,135],120:[2,326],122:[2,326],134:[2,326],160:[1,136],189:[2,326],190:[2,326],199:139,200:[2,326],201:[2,326],202:[2,326],205:140,206:[2,326],207:105,214:[2,326],222:[2,326],223:[1,130],226:[1,132],227:[1,131],230:[1,133],231:[1,134],232:[1,137]},{1:[2,327],6:[2,327],9:[2,327],10:[2,327],13:[2,327],21:[2,327],58:[2,327],66:[2,327],77:[2,327],83:[2,327],96:[1,135],120:[2,327],122:[2,327],134:[2,327],160:[1,136],189:[2,327],190:[2,327],199:139,200:[2,327],201:[2,327],202:[2,327],205:140,206:[2,327],207:105,214:[2,327],222:[2,327],223:[1,130],226:[1,132],227:[1,131],230:[1,133],231:[1,134],232:[1,137]},{150:[1,562],152:[1,563]},{1:[2,157],6:[2,157],9:[2,157],10:[2,157],13:[2,157],21:[2,157],58:[2,157],66:[2,157],77:[2,157],83:[2,157],96:[2,157],120:[2,157],122:[2,157],134:[2,157],160:[2,157],189:[2,157],190:[2,157],200:[2,157],201:[2,157],202:[2,157],206:[2,157],214:[2,157],222:[2,157],223:[2,157],226:[2,157],227:[2,157],230:[2,157],231:[2,157],232:[2,157]},{1:[2,161],6:[2,161],9:[2,161],10:[2,161],13:[2,161],21:[2,161],58:[2,161],66:[2,161],77:[2,161],83:[2,161],96:[2,161],120:[2,161],122:[2,161],134:[2,161],160:[2,161],189:[2,161],190:[2,161],200:[2,161],201:[2,161],202:[2,161],206:[2,161],214:[2,161],222:[2,161],223:[2,161],226:[2,161],227:[2,161],230:[2,161],231:[2,161],232:[2,161]},{5:468,9:[1,5],57:[1,155],128:469,131:[1,89],151:564},{5:468,9:[1,5],57:[1,155],128:469,131:[1,89],151:565},{1:[2,155],6:[2,155],9:[2,155],10:[2,155],13:[2,155],21:[2,155],58:[2,155],66:[2,155],77:[2,155],83:[2,155],96:[2,155],120:[2,155],122:[2,155],134:[2,155],160:[2,155],189:[2,155],190:[2,155],200:[2,155],201:[2,155],202:[2,155],206:[2,155],214:[2,155],222:[2,155],223:[2,155],226:[2,155],227:[2,155],230:[2,155],231:[2,155],232:[2,155]},{1:[2,159],6:[2,159],9:[2,159],10:[2,159],13:[2,159],21:[2,159],58:[2,159],66:[2,159],77:[2,159],83:[2,159],96:[2,159],120:[2,159],122:[2,159],134:[2,159],160:[2,159],189:[2,159],190:[2,159],200:[2,159],201:[2,159],202:[2,159],206:[2,159],214:[2,159],222:[2,159],223:[2,159],226:[2,159],227:[2,159],230:[2,159],231:[2,159],232:[2,159]}],
defaultActions: {125:[2,3],150:[2,263],304:[2,237],507:[2,65],508:[2,66],554:[2,67]},
parseError: function parseError(str, hash) {
    if (hash.recoverable) {
        this.trace(str);
    } else {
        throw new Error(str);
    }
},
parse: function parse(input) {
    var self = this, stack = [0], vstack = [null], lstack = [], table = this.table, yytext = '', yylineno = 0, yyleng = 0, recovering = 0, TERROR = 2, EOF = 1;
    var args = lstack.slice.call(arguments, 1);
    this.lexer.setInput(input);
    this.lexer.yy = this.yy;
    this.yy.lexer = this.lexer;
    this.yy.parser = this;
    if (typeof this.lexer.yylloc == 'undefined') {
        this.lexer.yylloc = {};
    }
    var yyloc = this.lexer.yylloc;
    lstack.push(yyloc);
    var ranges = this.lexer.options && this.lexer.options.ranges;
    if (typeof this.yy.parseError === 'function') {
        this.parseError = this.yy.parseError;
    } else {
        this.parseError = Object.getPrototypeOf(this).parseError;
    }
    function popStack(n) {
        stack.length = stack.length - 2 * n;
        vstack.length = vstack.length - n;
        lstack.length = lstack.length - n;
    }
    function lex() {
        var token;
        token = self.lexer.lex() || EOF;
        if (typeof token !== 'number') {
            token = self.symbols_[token] || token;
        }
        return token;
    }
    var symbol, preErrorSymbol, state, action, a, r, yyval = {}, p, len, newState, expected;
    while (true) {
        state = stack[stack.length - 1];
        if (this.defaultActions[state]) {
            action = this.defaultActions[state];
        } else {
            if (symbol === null || typeof symbol == 'undefined') {
                symbol = lex();
            }
            action = table[state] && table[state][symbol];
        }
                    if (typeof action === 'undefined' || !action.length || !action[0]) {
                var errStr = '';
                expected = [];
                for (p in table[state]) {
                    if (this.terminals_[p] && p > TERROR) {
                        expected.push('\'' + this.terminals_[p] + '\'');
                    }
                }
                if (this.lexer.showPosition) {
                    errStr = 'Parse error on line ' + (yylineno + 1) + ':\n' + this.lexer.showPosition() + '\nExpecting ' + expected.join(', ') + ', got \'' + (this.terminals_[symbol] || symbol) + '\'';
                } else {
                    errStr = 'Parse error on line ' + (yylineno + 1) + ': Unexpected ' + (symbol == EOF ? 'end of input' : '\'' + (this.terminals_[symbol] || symbol) + '\'');
                }
                this.parseError(errStr, {
                    text: this.lexer.match,
                    token: this.terminals_[symbol] || symbol,
                    line: this.lexer.yylineno,
                    loc: yyloc,
                    expected: expected
                });
            }
        if (action[0] instanceof Array && action.length > 1) {
            throw new Error('Parse Error: multiple actions possible at state: ' + state + ', token: ' + symbol);
        }
        switch (action[0]) {
        case 1:
            stack.push(symbol);
            vstack.push(this.lexer.yytext);
            lstack.push(this.lexer.yylloc);
            stack.push(action[1]);
            symbol = null;
            if (!preErrorSymbol) {
                yyleng = this.lexer.yyleng;
                yytext = this.lexer.yytext;
                yylineno = this.lexer.yylineno;
                yyloc = this.lexer.yylloc;
                if (recovering > 0) {
                    recovering--;
                }
            } else {
                symbol = preErrorSymbol;
                preErrorSymbol = null;
            }
            break;
        case 2:
            len = this.productions_[action[1]][1];
            yyval.$ = vstack[vstack.length - len];
            yyval._$ = {
                first_line: lstack[lstack.length - (len || 1)].first_line,
                last_line: lstack[lstack.length - 1].last_line,
                first_column: lstack[lstack.length - (len || 1)].first_column,
                last_column: lstack[lstack.length - 1].last_column
            };
            if (ranges) {
                yyval._$.range = [
                    lstack[lstack.length - (len || 1)].range[0],
                    lstack[lstack.length - 1].range[1]
                ];
            }
            r = this.performAction.apply(yyval, [
                yytext,
                yyleng,
                yylineno,
                this.yy,
                action[1],
                vstack,
                lstack
            ].concat(args));
            if (typeof r !== 'undefined') {
                return r;
            }
            if (len) {
                stack = stack.slice(0, -1 * len * 2);
                vstack = vstack.slice(0, -1 * len);
                lstack = lstack.slice(0, -1 * len);
            }
            stack.push(this.productions_[action[1]][0]);
            vstack.push(yyval.$);
            lstack.push(yyval._$);
            newState = table[stack[stack.length - 2]][stack[stack.length - 1]];
            stack.push(newState);
            break;
        case 3:
            return true;
        }
    }
    return true;
}};

function Parser () {
  this.yy = {};
}
Parser.prototype = parser;parser.Parser = Parser;
return new Parser;
})();


if (typeof require !== 'undefined' && typeof exports !== 'undefined') {
exports.parser = parser;
exports.Parser = parser.Parser;
exports.parse = function () { return parser.parse.apply(parser, arguments); };
exports.main = function commonjsMain(args) {
    if (!args[1]) {
        console.log('Usage: '+args[0]+' FILE');
        process.exit(1);
    }
    var source = require('fs').readFileSync(require('path').normalize(args[1]), "utf8");
    return exports.parser.parse(source);
};
if (typeof module !== 'undefined' && require.main === module) {
  exports.main(process.argv.slice(1));
}
}
}).call(this,require('_process'))
},{"_process":36,"fs":34,"path":35}],27:[function(require,module,exports){
(function(){


	idx$ = function(a,b){
		return (b && b.indexOf) ? b.indexOf(a) : [].indexOf.call(a,b);
	};
	;
	function iter$(a){ return a ? (a.toArray ? a.toArray() : a) : []; };
	var INVERSES;
	/* @class Rewriter */
	function Rewriter(){ };
	
	exports.Rewriter = Rewriter; // export class 
	Rewriter.prototype.tokens = function (){
		var x = 1000;
		return this._tokens;
	};
	
	// Helpful snippet for debugging:
	//     console.log (t[0] + '/' + t[1] for t in @tokens).join ' '
	// Rewrite the token stream in multiple passes, one logical filter at
	// a time. This could certainly be changed into a single pass through the
	// stream, with a big ol' efficient switch, but it's much nicer to work with
	// like this. The order of these passes matters -- indentation must be
	// corrected before implicit parentheses can be wrapped around blocks of code.
	Rewriter.prototype.rewrite = function (tokens,opts){
		if(opts === undefined) opts = {};
		this._tokens = tokens;
		this._options = opts;
		
		if(opts.profile) {
			console.time("tokenize:rewrite");
		};
		
		this.step("removeLeadingNewlines");
		this.step("removeMidExpressionNewlines");
		this.step("moveMidExpressionComments");
		this.step("tagDefArguments");
		this.step("closeOpenCalls");
		this.step("closeOpenIndexes");
		this.step("closeOpenTags");
		this.step("closeOpenRawIndexes");
		this.step("closeOpenTagAttrLists");
		this.step("addImplicitIndentation");
		this.step("tagPostfixConditionals");
		this.step("addImplicitBraces");
		this.step("addImplicitParentheses");
		
		if(opts.profile) {
			console.timeEnd("tokenize:rewrite");
		};
		
		return this._tokens;
	};
	
	Rewriter.prototype.step = function (fn){
		if(this._options.profile) {
			console.log(("---- starting " + fn + " ---- "));
			console.time(fn);
		};
		
		this[fn]();
		
		if(this._options.profile) {
			console.timeEnd(fn);
			console.log("\n\n");
		};
		return;
	};
	
	// Rewrite the token stream, looking one token ahead and behind.
	// Allow the return value of the block to tell us how many tokens to move
	// forwards (or backwards) in the stream, to make sure we don't miss anything
	// as tokens are inserted and removed, and the stream changes length under
	// our feet.
	Rewriter.prototype.scanTokens = function (block){
		var tokens = this._tokens;
		
		var i = 0;
		var token;
		while(token = tokens[i]){
			i += block.call(this,token,i,tokens);
		};
		
		return true;
	};
	
	Rewriter.prototype.detectEnd = function (i,condition,action){
		var tokens = this._tokens;
		var levels = 0;
		var starts = [];
		var token;
		
		while(token = tokens[i]){
			if(levels == 0 && condition.call(this,token,i,starts)) {
				return action.call(this,token,i);
			};
			if(!token || levels < 0) {
				return action.call(this,token,i - 1);
			};
			
			if(idx$(token[0],EXPRESSION_START) >= 0) {
				if(levels == 0) {
					starts.push(i);
				};
				levels += 1;
			} else {
				if(idx$(token[0],EXPRESSION_END) >= 0) {
					levels -= 1;
				}
			};
			i += 1;
		};
		return i - 1;
	};
	
	// Leading newlines would introduce an ambiguity in the grammar, so we
	// dispatch them here.
	Rewriter.prototype.removeLeadingNewlines = function (){
		var at = 0;
		for(var i=0, ary=iter$(this._tokens), len=ary.length; i < len; i++) {
			if(ary[i][0] != 'TERMINATOR') {
				at = i;break;
			};
		};
		
		return this._tokens.splice(0,at);
	};
	
	// Some blocks occur in the middle of expressions -- when we're expecting
	// this, remove their trailing newlines.
	Rewriter.prototype.removeMidExpressionNewlines = function (){
		var self=this;
		return self.scanTokens(function (token,i,tokens){// do |token,i,tokens|
			var next = self.tokenType(i + 1);
			if(!(token[0] == 'TERMINATOR' && idx$(next,EXPRESSION_CLOSE) >= 0)) {
				return 1;
			};
			if(next == 'OUTDENT') {
				return 1;
			};
			tokens.splice(i,1);
			return 0;
		});
	};
	
	Rewriter.prototype.moveMidExpressionComments = function (){
		// console.log "moveMidExpressionComments"
		var self=this;
		var terminator = -1;
		
		return this.scanTokens(function (token,i,tokens){
			// console.log(token[0])
			if(token[0] == 'TERMINATOR') {
				// console.log "found terminator at",i
				terminator = i;
				return 1;
			};
			if(token[0] == 'INLINECOMMENT') {
				self._tokens.splice(i,1);
				if(terminator == -1) {
					return 0;
				};// hmm
				self._tokens.splice(terminator + 1,0,['HERECOMMENT',token[1]],['TERMINATOR','\\n']);
				// console.log("found inline comment!",terminator)
				return 2;
			};
			return 1;
		});
	};
	
	Rewriter.prototype.tagDefArguments = function (){
		return true;
	};
	
	// The lexer has tagged the opening parenthesis of a method call. Match it with
	// its paired close. We have the mis-nested outdent case included here for
	// calls that close on the same line, just before their outdent.
	Rewriter.prototype.closeOpenCalls = function (){
		var self=this;
		var condition = function (token,i){
			return idx$(token[0],[')','CALL_END']) >= 0 || token[0] == 'OUTDENT' && self.tokenType(i - 1) == ')';
		};
		
		var action = function (token,i){
			return self._tokens[((token[0] == 'OUTDENT') ? (i - 1) : (i))][0] = 'CALL_END';
		};
		
		return self.scanTokens(function (token,i){
			if(token[0] == 'CALL_START') {
				self.detectEnd(i + 1,condition,action);
			};
			return 1;
		});
	};
	
	// The lexer has tagged the opening parenthesis of an indexing operation call.
	// Match it with its paired close.
	Rewriter.prototype.closeOpenIndexes = function (){
		var self=this;
		var condition = function (token,i){
			return idx$(token[0],[']','INDEX_END']) >= 0;
		};
		var action = function (token,i){
			return token[0] = 'INDEX_END';
		};
		
		return self.scanTokens(function (token,i){
			if(token[0] == 'INDEX_START') {
				self.detectEnd(i + 1,condition,action);
			};
			return 1;
		});
	};
	
	// The lexer has tagged the opening parenthesis of an indexing operation call.
	// Match it with its paired close.
	Rewriter.prototype.closeOpenRawIndexes = function (){
		var self=this;
		var condition = function (token,i){
			return idx$(token[0],['}','RAW_INDEX_END']) >= 0;
		};
		var action = function (token,i){
			return token[0] = 'RAW_INDEX_END';
		};
		
		return self.scanTokens(function (token,i){
			if(token[0] == 'RAW_INDEX_START') {
				self.detectEnd(i + 1,condition,action);
			};
			return 1;
		});
	};
	
	Rewriter.prototype.closeOpenTagAttrLists = function (){
		var self=this;
		var condition = function (token,i){
			return idx$(token[0],[')','TAG_ATTRS_END']) >= 0;
		};
		var action = function (token,i){
			return token[0] = 'TAG_ATTRS_END';
		};
		
		return self.scanTokens(function (token,i){
			if(token[0] == 'TAG_ATTRS_START') {
				self.detectEnd(i + 1,condition,action);
			};
			return 1;
		});
	};
	
	// The lexer has tagged the opening parenthesis of an indexing operation call.
	// Match it with its paired close.
	Rewriter.prototype.closeOpenTags = function (){
		var self=this;
		var condition = function (token,i){
			return idx$(token[0],['>','TAG_END']) >= 0;
		};
		var action = function (token,i){
			return token[0] = 'TAG_END';
		};
		
		return self.scanTokens(function (token,i){
			if(token[0] == 'TAG_START') {
				self.detectEnd(i + 1,condition,action);
			};
			return 1;
		});
	};
	
	Rewriter.prototype.addImplicitCommas = function (){
		return;
	};
	
	Rewriter.prototype.addImplicitBlockCalls = function (){
		return this.scanTokens(function (token,i,tokens){
			var prev = tokens[i - 1] || [];
			// next = tokens[i+1]
			
			if(token[0] == 'DO' && idx$(prev[0],['RAW_INDEX_END','INDEX_END','IDENTIFIER','NEW']) >= 0) {
				// if token[0] == 'DO' and prev and prev[0] not in ['CALL_END','=','DEF_BODY','(','CALL_START',',',':','RETURN']
				// console.log 'added implicit blocs!!'
				tokens.splice(i,0,['CALL_END',')']);
				tokens.splice(i,0,['CALL_START','(']);
				return 2;
			};
			return 1;
		});
	};
	
	// Object literals may be written with implicit braces, for simple cases.
	// Insert the missing braces here, so that the parser doesn't have to.
	Rewriter.prototype.addImplicitBraces = function (){
		var self=this;
		var stack = [];
		var start = null;
		var startIndent = 0;
		var startIdx = null;
		
		var scope = function (){
			return stack[stack.length - 1] || [];
		};
		
		var action = function (token,i){
			var tok = ['}','}',token[2]];
			tok.generated = true;
			return self._tokens.splice(i,0,tok);
		};
		
		var open = function (token,i){
			var value = new String('{');
			value.generated = true;
			var tok = ['{',value,token[2]];
			tok.generated = true;
			return self._tokens.splice(i,0,tok);
			
			// s = ["{",i]
			// s:generated = true
			// stack.push(s)
		};
		
		var close = function (token,i){
			var ctx;
			var tok = ['}','}',token[2]];
			tok.generated = true;
			self._tokens.splice(i,0,tok);
			return ctx = scope();//  hmmm??
			// this is cleaner - but fix later
			// if ctx[0] == '{' and ctx:generated
			//   stack.pop()
			// else
			//   console.log('should not pop, not inside:generated context!')
			// if ctx[0] == '{' and ctx:generated
			// should remove from scope as well?
			// true
		};
		
		var reopen = function (token,i){
			return true;
		};
		
		
		
		return self.scanTokens(function (token,i,tokens){
			var type = token[0];
			var ctx = stack[stack.length - 1] || [];
			var idx;
			
			if(token[1] == '?') {
				// console.log('TERNARY OPERATOR!')
				stack.push(['TERNARY',i]);
				return 1;
			};
			
			if(idx$(type,EXPRESSION_START) >= 0) {
				// console.log('expression start',type)
				if(type == 'INDENT' && self.tokenType(i - 1) == '{') {
					stack.push(['{',i]);// should not autogenerate another?
				} else {
					stack.push([type,i]);
				};
				return 1;
			};
			
			if(idx$(type,EXPRESSION_END) >= 0) {
				if(ctx[0] == 'TERNARY') {
					stack.pop();
				};
				
				start = stack.pop();
				start[2] = i;
				
				// console.log('the end-expression was',start[0])
				
				// if start[0] == 'INDENT'
				//   console.log('was indent?')
				
				if(start[0] == '{' && start.generated) {// type != '}' # and start:generated
					// console.log('inside curly-braces!')
					// console.log('the expression is',type)
					close(token,i);
					// hmm - are we sure that we should only return one here?
					return 1;
				};
				
				return 1;
			};
			
			
			if(ctx[0] == 'TERNARY' && idx$(type,['TERMINATOR','OUTDENT']) >= 0) {
				// really?
				stack.pop();
				return 1;
			};
			
			
			if(type == ',') {
				// automatically add an ending here if inside:generated scope?
				// it is important that this is:generated(!)
				if(scope()[0] == '{' && scope().generated) {
					action.call(this,token,i);
					stack.pop();
					// console.log('scope was curly braces')
					return 2;
				} else {
					return 1;
				};
				true;
			};
			
			// found a type
			if(type == ':' && idx$(ctx[0],['{','TERNARY']) == -1) {
				// could just check if the end was right before this?
				
				if(start && start[2] == i - 1) {
					console.log('this expression was just ending before colon!');
					idx = start[1] - 1;
				} else {
					// console.log "rewrite here? #{i}"
					idx = i - 2;// if start then start[1] - 1 else i - 2
					// idx = idx - 1 if tokenType(idx) is 'TERMINATOR'
				};
				
				while(self.tokenType(idx - 1) == 'HERECOMMENT'){
					idx -= 2;
				};
				
				// idx -= 1 if tokenType(idx - 1) is ','
				var t0 = self._tokens[idx - 1];
				// t1 = ago = @tokens[idx]
				// console.log(idx,t0,t1)
				// t = @tokens
				// console.log(t[i-4],t[i-3],t[i-2],t[i-1])
				
				if(t0 && t0[0] == '}' && t0.generated) {
					// console.log('already inside the:generated token!')
					// console.log(t0,t1,idx,i)
					// removing this
					self._tokens.splice(idx - 1,1);
					var s = ['{'];
					s.generated = true;
					stack.push(s);
					return 0;
				} else {
					if(t0 && t0[0] == ',' && self.tokenType(idx - 2) == '}') {
						self._tokens.splice(idx - 2,1);
						s = ['{'];
						s.generated = true;
						stack.push(s);
						return 0;
					} else {
						s = ['{'];
						s.generated = true;
						stack.push(s);
						open(token,idx + 1);
						return 2;
					}
				};
			};
			
			// we probably need to run through autocall first?!
			
			if(type == 'DO') {// and ctx:generated
				var prev = tokens[i - 1][0];
				if(idx$(prev,['NUMBER','STRING','REGEX','SYMBOL',']','}',')']) >= 0) {
					
					var tok = [',',','];
					tok.generated = true;
					self._tokens.splice(i,0,tok);
					
					if(ctx.generated) {
						close(token,i);
						stack.pop();
						return 2;
					};
				};
			};
			
			if(idx$(type,['TERMINATOR','OUTDENT','DEF_BODY']) >= 0 && ctx.generated) {
				close(token,i);
				stack.pop();
				return 2;
			};
			
			return 1;
		});
	};
	
	// Methods may be optionally called without parentheses, for simple cases.
	// Insert the implicit parentheses here, so that the parser doesn't have to
	// deal with them.
	// Practically everything will now be callable this way (every identifier)
	Rewriter.prototype.addImplicitParentheses = function (){
		var self=this;
		var noCall = false;
		var noCallTag = ['CLASS','IF','UNLESS','TAG','WHILE','FOR','UNTIL','CATCH','FINALLY','MODULE','LEADING_WHEN'];
		
		var action = function (token,i){
			return self._tokens.splice(i,0,['CALL_END',')',token[2]]);
		};
		
		// console.log "adding implicit parenthesis" # ,self:scanTokens
		
		return self.scanTokens(function (token,i,tokens){
			// console.log "detect end??"
			var type = token[0];
			
			// Never make these tags implicitly call
			if(idx$(type,noCallTag) >= 0) {
				noCall = true;
			};
			
			var prev = tokens[i - 1];
			var current = tokens[i];
			var next = tokens[i + 1];
			// [prev, current, next] = tokens[i - 1 .. i + 1]
			
			// check for comments
			// console.log "detect end??"
			var callObject = !noCall && type == 'INDENT' && next && ((next.generated && next[0] == '{') || (idx$(next[0],IMPLICIT_CALL) >= 0)) && prev && idx$(prev[0],IMPLICIT_FUNC) >= 0;
			// new test
			var callIndent = !noCall && type == 'INDENT' && next && idx$(next[0],IMPLICIT_CALL) >= 0 && prev && idx$(prev[0],IMPLICIT_FUNC) >= 0;
			
			var seenSingle = false;
			var seenControl = false;
			// Hmm ?
			// this is not correct if this is inside a block,no?
			if(idx$(type,['TERMINATOR','OUTDENT','INDENT']) >= 0) {
				noCall = false;
			};
			
			if(prev && !(prev.spaced) && type == '?') {
				token.call = true;
			};
			
			// where does fromThem come from?
			if(token.fromThen) {
				return 1;
			};
			
			if(!(callObject || callIndent || (prev && prev.spaced) && (prev.call || idx$(prev[0],IMPLICIT_FUNC) >= 0) && (idx$(type,IMPLICIT_CALL) >= 0 || !(token.spaced || token.newLine) && idx$(type,IMPLICIT_UNSPACED_CALL) >= 0))) {
				return 1;
			};
			
			tokens.splice(i,0,['CALL_START','(',token[2]]);
			
			var cond = function (token,i){
				var type = token[0];
				if(!seenSingle && token.fromThen) {
					return true;
				};
				if(idx$(type,['IF','UNLESS','ELSE','CATCH','->','=>']) >= 0) {
					seenSingle = true;
				};
				if(idx$(type,['IF','UNLESS','ELSE','SWITCH','TRY']) >= 0) {
					seenControl = true;
				};
				var prev = self.tokenType(i - 1);
				
				if(idx$(type,['.','?.','::']) >= 0 && prev == 'OUTDENT') {
					return true;
				};
				
				var post = self._tokens[i + 1];
				// WTF
				return !(token.generated) && prev != ',' && (idx$(type,IMPLICIT_END) >= 0 || (type == 'INDENT' && !seenControl) || (type == 'DOS' && idx$(prev,['=']) == -1)) && (type != 'INDENT' || (self.tokenType(i - 2) != 'CLASS' && idx$(prev,IMPLICIT_BLOCK) == -1 && !(post && ((post.generated && post[0] == '{') || idx$(post[0],IMPLICIT_CALL) >= 0))));
			};
			
			// The action for detecting when the call should end
			// console.log "detect end??"
			self.detectEnd(i + 1,cond,action);
			if(prev[0] == '?') {
				prev[0] = 'FUNC_EXIST';
			};
			return 2;
		});
	};
	
	// Because our grammar is LALR(1), it can't handle some single-line
	// expressions that lack ending delimiters. The **Rewriter** adds the implicit
	// blocks, so it doesn't need to. ')' can close a single-line block,
	// but we need to make sure it's balanced.
	Rewriter.prototype.addImplicitIndentation = function (){
		
		var self=this;
		return self.scanTokens(function (token,i,tokens){
			var ary;
			var type = token[0];
			var next = self.tokenType(i + 1);
			
			if(type == 'TERMINATOR' && next == 'THEN') {
				tokens.splice(i,1);
				return 0;
			};
			
			if(type == 'CATCH' && idx$(self.tokenType(i + 2),['OUTDENT','TERMINATOR','FINALLY']) >= 0) {
				tokens.splice.apply(tokens,[].concat([i + 2,0], [].slice.call(self.indentation(token))));// hmm ...
				return 4;
			};
			
			if(idx$(type,SINGLE_LINERS) >= 0 && idx$(next,['INDENT','BLOCK_PARAM_START']) == -1 && !(type == 'ELSE' && next == 'IF') && !(type == 'ELIF')) {
				
				var starter = type;
				
				var ary=iter$(self.indentation(token));var indent = ary[(0)],outdent = ary[(1)];
				if(starter == 'THEN') {
					indent.fromThen = true;
				};
				indent.generated = outdent.generated = true;
				tokens.splice(i + 1,0,indent);
				
				// outerStarter = starter
				// outerOutdent = outdent
				
				var condition = function (token,i){
					return token[1] != ';' && idx$(token[0],SINGLE_CLOSERS) >= 0 && !(token[0] == 'ELSE' && idx$(starter,['IF','THEN']) == -1);
				};
				
				var action = function (token,i){
					var idx = (self.tokenType(i - 1) == ',') ? (i - 1) : (i);
					return self._tokens.splice(idx,0,outdent);
				};
				
				self.detectEnd(i + 2,condition,action);
				if(type == 'THEN') {
					tokens.splice(i,1);
				};
				return 1;
			};
			return 1;
		});
	};
	
	// Tag postfix conditionals as such, so that we can parse them with a
	// different precedence.
	Rewriter.prototype.tagPostfixConditionals = function (){
		var self=this;
		var condition = function (token,i){
			return idx$(token[0],['TERMINATOR','INDENT']) >= 0;
		};
		
		return self.scanTokens(function (token,i){
			if(!(token[0] == 'IF')) {
				return 1;
			};
			var original = token;
			self.detectEnd(i + 1,condition,function (token,i){
				return (token[0] != 'INDENT') && (original[0] = 'POST_' + original[0]);
			});
			return 1;
		});
	};
	
	// Generate the indentation tokens, based on another token on the same line.
	Rewriter.prototype.indentation = function (token){
		return [['INDENT',2,token[2]],['OUTDENT',2,token[2]]];
	};
	
	// Look up a type by token index.
	Rewriter.prototype.type = function (i){
		if(i < 0) {
			return null;
		};
		var tok = this._tokens[i];
		return (tok) ? (
			tok[0]
		) : (
			null
		);
	};
	
	Rewriter.prototype.tokenType = function (i){
		var tok = this._tokens[i];
		return tok && tok[0];
	};
	
	
	// Constants
	// ---------
	
	// List of the token pairs that must be balanced.
	var BALANCED_PAIRS = [
		['(',')'],
		['[',']'],
		['{','}'],
		['INDENT','OUTDENT'],
		['CALL_START','CALL_END'],
		['PARAM_START','PARAM_END'],
		['INDEX_START','INDEX_END'],
		['RAW_INDEX_START','RAW_INDEX_END'],
		['TAG_START','TAG_END'],
		['TAG_PARAM_START','TAG_PARAM_END'],
		['TAG_ATTRS_START','TAG_ATTRS_END'],
		['BLOCK_PARAM_START','BLOCK_PARAM_END']
	];
	
	// The inverse mappings of `BALANCED_PAIRS` we're trying to fix up, so we can
	// look things up from either end.
	module.exports.INVERSES = INVERSES = {};
	
	// The tokens that signal the start/end of a balanced pair.
	EXPRESSION_START = [];
	EXPRESSION_END = [];
	
	for(var i=0, ary=iter$(BALANCED_PAIRS), len=ary.length, pair; i < len; i++) {
		pair = ary[i];var left = pair[0];
		var rite = pair[1];
		EXPRESSION_START.push(INVERSES[rite] = left);
		EXPRESSION_END.push(INVERSES[left] = rite);
	};
	
	var IDENTIFIERS = ['IDENTIFIER','GVAR','IVAR','CVAR','CONST','ARGVAR'];
	
	// Tokens that indicate the close of a clause of an expression.
	var EXPRESSION_CLOSE = ['CATCH','WHEN','ELSE','FINALLY'].concat(EXPRESSION_END);
	
	// Tokens that, if followed by an `IMPLICIT_CALL`, indicate a function invocation.
	var IMPLICIT_FUNC = ['IDENTIFIER','SUPER',')',']','INDEX_END','@','THIS','SELF','EVENT','TRIGGER','RAW_INDEX_END','TAG_END','IVAR',
	'GVAR','CONST','ARGVAR','NEW','BREAK','CONTINUE','RETURN'];
	
	// If preceded by an `IMPLICIT_FUNC`, indicates a function invocation.
	var IMPLICIT_CALL = [
		'SELECTOR','IDENTIFIER','NUMBER','STRING','SYMBOL','JS','REGEX','NEW','PARAM_START','CLASS',
		'IF','UNLESS','TRY','SWITCH','THIS','BOOL','UNARY','SUPER','IVAR','GVAR','CONST','ARGVAR','SELF',
		'NEW','@','[','(','{','--','++','SELECTOR','TAG_START','TAGID','#','SELECTOR_START','IDREF','SPLAT','DO','BLOCK_ARG'
	];// '->', '=>', why does it not work with symbol?
	// is not do an implicit call??
	
	var IMPLICIT_UNSPACED_CALL = ['+','-'];
	
	// Tokens indicating that the implicit call must enclose a block of expressions.
	var IMPLICIT_BLOCK = ['{','[',',','BLOCK_PARAM_END','DO'];// '->', '=>', 
	
	var CONDITIONAL_ASSIGN = ['||=','&&=','?=','&=','|='];
	var COMPOUND_ASSIGN = ['-=','+=','/=','*=','%=','||=','&&=','?=','<<=','>>=','>>>=','&=','^=','|='];
	var UNARY = ['!','~','NEW','TYPEOF','DELETE'];
	var LOGIC = ['&&','||','&','|','^'];
	
	var NO_IMPLICIT_BLOCK_CALL = ['CALL_END','=','DEF_BODY','(','CALL_START',',',':','RETURN'].concat(COMPOUND_ASSIGN);
	// NO_IMPLICIT_BLOCK_CALL
	// IMPLICIT_COMMA = ['->', '=>', '{', '[', 'NUMBER', 'STRING', 'SYMBOL', 'IDENTIFIER','DO']
	
	var IMPLICIT_COMMA = ['DO'];
	
	// Tokens that always mark the end of an implicit call for single-liners.
	var IMPLICIT_END = ['POST_IF','POST_UNLESS','FOR','WHILE','UNTIL','WHEN','BY','LOOP','TERMINATOR','DEF_BODY','DEF_FRAGMENT'];
	
	// Single-line flavors of block expressions that have unclosed endings.
	// The grammar can't disambiguate them, so we insert the implicit indentation.
	var SINGLE_LINERS = ['ELSE','TRY','FINALLY','THEN','BLOCK_PARAM_END','DO','BEGIN','CATCH_VAR'];// '->', '=>', really?
	var SINGLE_CLOSERS = ['TERMINATOR','CATCH','FINALLY','ELSE','OUTDENT','LEADING_WHEN'];
	
	// Tokens that end a line.
	var LINEBREAKS = ['TERMINATOR','INDENT','OUTDENT'];


}())
},{}],28:[function(require,module,exports){
(function(){
function emit(event,args,cbs){
	var node,prev,cb,ret;
	node = cbs[event];
	
	while((prev = node) && (node = node.next)){
		if(cb = node.callback) {
			ret = cb.apply(node,args);
		};
		if(node.times && --(node.times) <= 0) {
			prev.next = node.next;
			node.callback = null;
		};
	};
	return;
};
Imba.listen = function (obj,event,callback){
	var $1;
	var cbs,list,tail;
	cbs = obj.__callbacks__ || (obj.__callbacks__ = {});
	list = cbs[($1=event)] || (cbs[$1] = {});
	tail = list.tail || (list.tail = (list.next = {}));
	tail.callback = callback;
	list.tail = tail.next = {};
	return tail;
};
Imba.once = function (obj,event,callback){
	var tail = Imba.listen(obj,event,callback);
	tail.times = 1;
	return tail;
};
Imba.unlisten = function (obj,event,cb){
	var node,prev;
	var meta = obj.__callbacks__;
	if(!meta) {
		return;
	};
	
	if(node = meta[event]) {
		while((prev = node) && (node = node.next)){
			if(node == cb || node.callback == cb) {
				prev.next = node.next;
				node.callback = null;
				break;
			};
		};
	};
	return;
};
Imba.emit = function (obj,event,params){
	var cb = obj.__callbacks__;
	if(cb) {
		emit(event,params,cb);
	};
	if(cb) {
		emit('all',[event, params],cb);
	};
	return;
};
}())
},{}],29:[function(require,module,exports){
(function (global){
(function(){
	function idx$(a,b){
		if(b && b.indexOf) return b.indexOf(a);
		return [].indexOf.call(a,b);
	}


	function iter$(a){ return a ? (a.toArray ? a.toArray() : a) : []; };
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
	
	var doc;
	var svgSupport = true;
	// unless global:document
	// Imba:doc = ImbaServerDocument.new
	// var hasSVG = !!Imba:doc && !!document.createElementNS(ns.svg, 'svg').createSVGRect;
	// hmm - not a good way to detect client
	if(doc = global.document){
		Imba.doc = doc;
		svgSupport = doc.createElementNS && doc.createElementNS('http://www.w3.org/2000/svg',"svg").createSVGRect;
		// else
		// # introduce global document here.
		// global:document = Imba:doc
	};
	
	
	// This is VERY experimental. Using Imba for serverside templates
	// is not recommended unless you're ready for a rough ride. It is
	// a priority to get this fast and stable.
	
	// room for lots of optimization to serverside nodes. can be much more
	// clever when it comes to the classes etc
	
	/* @class ElementTag */
	function ElementTag(){
		return this;
	};
	
	
	ElementTag.prototype.__object = {};
	ElementTag.prototype.object = function(v){ return this._object; }
	ElementTag.prototype.setObject = function(v){ this._object = v; return this; };
	
	ElementTag.prototype.dom = function (){
		return this._dom;
	};
	
	ElementTag.prototype.setDom = function (dom){
		dom._tag = this;
		this._dom = dom;
		return this;
	};
	
	ElementTag.prototype.setRef = function (ref){
		this.flag(this._ref = ref);
		return this;
	};
	
	ElementTag.prototype.setAttribute = function (key,v){
		if(v != null && v !== false){
			this.dom().setAttribute(key,v);
		} else {
			this.removeAttribute(key);
		};
		return v; // non-obvious that we need to return the value here, no?
	};
	
	ElementTag.prototype.removeAttribute = function (key){
		return this.dom().removeAttribute(key);
	};
	
	ElementTag.prototype.getAttribute = function (key){
		var val = this.dom().getAttribute(key);
		return val;
	};
	
	ElementTag.prototype.object = function (v){
		if(arguments.length){
			return (this.setObject(v),this);
		};
		return this._object; // hmm
	};
	
	ElementTag.prototype.body = function (v){
		if(arguments.length){
			return (this.setBody(v),this);
		};
		return this;
	};
	
	ElementTag.prototype.setBody = function (body){
		if(this._empty){
			this.append(body);
		} else {
			this.empty().append(body);
		};
		return this;
	};
	
	ElementTag.prototype.setContent = function (content){
		this.setChildren(content); // override?
		return this;
	};
	
	ElementTag.prototype.setChildren = function (nodes){
		if(this._empty){
			this.append(nodes);
		} else {
			this.empty().append(nodes);
		};
		return this;
	};
	
	ElementTag.prototype.text = function (v){
		if(arguments.length){
			return (this.setText(v),this);
		};
		return this._dom.textContent;
	};
	
	ElementTag.prototype.setText = function (txt){
		this._empty = false;
		this._dom.textContent = (txt == null) ? (txt = "") : (txt);
		return this;
	};
	
	ElementTag.prototype.empty = function (){
		while(this._dom.firstChild){
			this._dom.removeChild(this._dom.firstChild);
		};
		this._empty = true;
		return this;
	};
	
	ElementTag.prototype.remove = function (node){
		var par = this.dom();
		var el = node && node.dom();
		if(el && el.parentNode == par){
			par.removeChild(el);
		};
		return this;
	};
	
	
	ElementTag.prototype.parent = function (){
		return tag$wrap(this.dom().parentNode);
	};
	
	// def first sel
	// 	# want to filter
	// 	var el = tag(dom:firstChild)
	// 	if sel and el and !el.matches(sel)
	// 		return el.next(sel)
	// 	return el
	
	ElementTag.prototype.log = function (){
		var $0 = arguments, i = $0.length;
		var args = new Array(i>0 ? i : 0);
		while(i>0) args[i-1] = $0[--i];
		// playing safe for ie
		args.unshift(console);
		Function.prototype.call.apply(console.log,args);
		// console.log(*arguments)
		return this;
	};
	
	
	// def emit name, data: nil, bubble: yes
	// 	ED.trigger name, self, data: data, bubble: bubble
	// 	return self
	
	ElementTag.prototype.css = function (key,val){
		if(key instanceof Object){
			for(var o=key, i=0, keys=Object.keys(o), l=keys.length; i < l; i++){
				this.css(keys[i],o[keys[i]]);
			};
		} else {
			if(val == null){
				this.dom().style.removeProperty(key);
			} else {
				if(val == undefined){
					return this.dom().style[key];
				} else {
					if((typeof val=='number'||val instanceof Number) && key.match(/width|height|left|right|top|bottom/)){
						val = val + "px";
					};
					this.dom().style[key] = val;
				}
			}
		};
		return this;
	};
	
	// selectors / traversal
	ElementTag.prototype.find = function (sel){
		return new ImbaSelector(sel,this);
	};
	
	ElementTag.prototype.first = function (sel){
		return (sel) ? (this.find(sel).first()) : (tag$wrap(this.dom().firstElementChild));
	};
	
	ElementTag.prototype.last = function (sel){
		return (sel) ? (this.find(sel).last()) : (tag$wrap(this.dom().lastElementChild));
	};
	
	ElementTag.prototype.child = function (i){
		return tag$wrap(this.dom().children[i || 0]);
	};
	
	ElementTag.prototype.children = function (sel){
		var nodes = new ImbaSelector(null,this,this._dom.children);
		return (sel) ? (nodes.filter(sel)) : (nodes);
	};
	
	ElementTag.prototype.orphanize = function (){
		var par;
		if(par = this.dom().parentNode){
			par.removeChild(this._dom);
		};
		return this;
	};
	
	ElementTag.prototype.matches = function (sel){
		var fn;
		if(sel instanceof Function){
			return sel(this);
		};
		
		if(sel.query){
			sel = sel.query();
		};
		if(fn = (this._dom.webkitMatchesSelector || this._dom.matches)){
			return fn.call(this._dom,sel);
		};
		// TODO support other browsers etc?
	};
	
	ElementTag.prototype.closest = function (sel){
		if(!sel){
			return this.parent();
		}; // should return self?!
		var node = this;
		if(sel.query){
			sel = sel.query();
		};
		
		while(node){
			
				if(node.matches(sel)){
					return node;
				};
				node = node.parent();
		
		};
		return null;
	};
	
	ElementTag.prototype.contains = function (node){
		return this.dom().contains(node && node._dom || node);
	};
	
	ElementTag.prototype.index = function (){
		var i = 0;
		var el = this.dom();
		while(el.previousSibling){
			
				el = el.previousSibling;
				i++;
		
		};
		
		return i;
	};
	
	ElementTag.prototype.up = function (sel){
		if(!sel){
			return this.parent();
		};
		return this.parent() && this.parent().closest(sel);
	};
	
	ElementTag.prototype.siblings = function (sel){
		var par, self=this;
		if(!(par = this.parent())){
			return [];
		}; // FIXME
		var ary = this.dom().parentNode.children;
		var nodes = new ImbaSelector(null,this,ary);
		return nodes.filter(function (n){
			return n != self && (!sel || n.matches(sel));
		});
	};
	
	ElementTag.prototype.next = function (sel){
		if(sel){
			var el = this;
			while(el = el.next()){
				
					if(el.matches(sel)){
						return el;
					};
			
			};
			return null;
		};
		return tag$wrap(this.dom().nextElementSibling);
	};
	
	ElementTag.prototype.prev = function (sel){
		if(sel){
			var el = this;
			while(el = el.prev()){
				
					if(el.matches(sel)){
						return el;
					};
			
			};
			return null;
		};
		return tag$wrap(this.dom().previousElementSibling);
	};
	
	ElementTag.prototype.insert = function (node,pars){
		if(!pars||pars.constructor !== Object) pars = {};
		var before = pars.before !== undefined ? pars.before : null;
		var after = pars.after !== undefined ? pars.after : null;
		if(after){
			before = after.next();
		};
		if(node instanceof Array){
			node = (t$('fragment').setContent([node]).end());
		};
		if(before){
			this.dom().insertBefore(node.dom(),before.dom());
		} else {
			this.append(node);
		};
		return this;
	};
	
	// bind / present
	ElementTag.prototype.bind = function (obj){
		this.setObject(obj);
		if(this._built){
			this.render(obj);
		}; // hmm
		return this;
	};
	
	ElementTag.prototype.build = function (){
		return this;
	};
	
	ElementTag.prototype.commit = function (){
		return this;
	};
	
	ElementTag.prototype.synced = function (){
		return this;
	};
	
	ElementTag.prototype.focus = function (){
		this.dom().focus();
		return this;
	};
	
	ElementTag.prototype.blur = function (){
		this.dom().blur();
		return this;
	};
	
	ElementTag.prototype.end = function (){
		if(this._built){
			this.commit();
		} else {
			this._built = true;
			this.build();
		};
		return this;
	};
	
	ElementTag.prototype.render = function (par){
		this.setBody(this.template(par || this._object));
		return this;
	};
	
	// called when the node is awakened in the dom - either automatically
	// upon attachment to the dom-tree, or the first time imba needs the
	// tag for a domnode that has been rendered on the server
	ElementTag.prototype.awake = function (){
		return this;
	};
	
	ElementTag.prototype.template = function (){
		return null;
	};
	
	ElementTag.prototype.prepend = function (item){
		return this.insert(item,{before: this.first()});
	};
	
	
	ElementTag.prototype.append = function (item){
		// possible to append blank
		// possible to simplify on server?
		if(!item){
			return this;
		};
		
		if(item instanceof Array){
			for(var i=0, ary=iter$(item), len=ary.length, member; i < len; i++) {
				member = ary[i];member && this.append(member);
			};
		} else {
			if((typeof item=='string'||item instanceof String) || (typeof item=='number'||item instanceof Number)){
				var node = Imba.doc.createTextNode(item);
				this._dom.appendChild(node);
				if(this._empty){
					this._empty = false;
				};
			} else {
				this._dom.appendChild(item._dom || item);
				if(this._empty){
					this._empty = false;
				};
			}
		};
		
		return this;
	};
	
	ElementTag.prototype.toString = function (){
		return this._dom.toString(); // really?
	};
	
	ElementTag.flag = function (flag){
		// hmm - this is not good enough
		// should redirect to the prototype with a dom-node already set?
		var dom = this.dom();
		dom.classList.add(flag);
		// dom:className += " " + flag
		return this;
	};
	
	ElementTag.unflag = function (flag){
		this.dom().classList.remove(flag);
		return this;
	};
	
	ElementTag.prototype.classes = function (){
		return this.dom().classList;
	};
	
	ElementTag.prototype.flag = function (ref,toggle){
		// it is most natural to treat a second undefined argument as a no-switch
		// so we need to check the arguments-length
		if(arguments.length == 2){
			if(toggle){
				this.classes().add(ref);
			} else {
				this.classes().remove(ref);
			};
		} else {
			this.classes().add(ref);
		};
		return this;
	};
	
	ElementTag.prototype.unflag = function (ref){
		this.classes().remove(ref);
		return this;
	};
	
	ElementTag.prototype.hasFlag = function (ref){
		return this.classes().contains(ref);
	};
	
	
	/* @class HTMLElementTag */
	function HTMLElementTag(){
		ElementTag.apply(this,arguments);
	};
	
	subclass$(HTMLElementTag,ElementTag);
	// most tags will have their flags set upon creation, and
	// since we do set some imba-specific class names to identify
	// tags, it is important to stick to a single className set, for
	// performance. Setting the classes on creation needs vastly less
	// logic than after the node is alive.
	
	HTMLElementTag.dom = function (){
		if(this._dom){
			return this._dom;
		};
		
		var dom;
		var sup = this.__super__.constructor;
		
		// should clone the parent no?
		if(this._isNative){
			dom = Imba.doc.createElement(this._nodeType);
		} else {
			if(this._nodeType != sup._nodeType){
				console.log("custom dom type(!)");
				dom = Imba.doc.createElement(this._nodeType);
				for(var i=0, ary=iter$(sup.dom()), len=ary.length, atr; i < len; i++) {
					atr = ary[i];dom.setAttribute(atr.name,atr.value);
				};
				// dom:className = sup.dom:className
				// what about default attributes?
			} else {
				dom = sup.dom().cloneNode(false);
			}
		};
		
		// should be a way to use a native domtype without precreating the doc
		// and still keeping the classes?
		
		if(this._domFlags){
			for(var i=0, ary=iter$(this._domFlags), len=ary.length; i < len; i++) {
				dom.classList.add(ary[i]);
			};
		};
		
		// include the super?!
		// dom:className = @nodeClass or ""
		return this._dom = dom;
	};
	
	// we really ought to optimize this
	HTMLElementTag.createNode = function (flags,id){
		var proto = this._dom || this.dom();
		var dom = proto.cloneNode(false);
		
		if(id){
			dom.id = id;
		};
		
		if(flags){
			this.p("SHOULD NEVER GET HERE?!");
			var nc = dom.className;
			dom.className = (nc && flags) ? ((nc + " " + flags)) : ((nc || flags));
		};
		
		// var dom = global:document.createElement(@nodeType)
		// var nc = @nodeClass
		// if nc or flags
		// 	dom:className = nc && flags ? (nc + " " + flags) : (nc or flags)
		// dom:id = id if id 
		return dom;
	};
	
	// are we sure
	// def setup body
	// 	append(body)
	
	// we need special dom-properties with unified getters and setters
	// def text text
	// 	if text !== undefined
	// 		@dom:innerText = text
	// 		return self
	// 	return @dom:innerText;
	
	// Imba.Tag.
	// Imba.Tag.TYPES_HTML = "a abbr address area article aside audio b base bdi bdo big blockquote body br button canvas caption cite code col colgroup data datalist dd del details dfn div dl dt em embed fieldset figcaption figure footer form h1 h2 h3 h4 h5 h6 head header hr html i iframe img input ins kbd keygen label legend li link main map mark menu menuitem meta meter nav noscript object ol optgroup option output p param pre progress q rp rt ruby s samp script section select small source span strong style sub summary sup table tbody td textarea tfoot th thead time title tr track u ul var video wbr".split(" ")
	
	HTML_TAGS = "a abbr address area article aside audio b base bdi bdo big blockquote body br button canvas caption cite code col colgroup data datalist dd del details dfn div dl dt em embed fieldset figcaption figure footer form h1 h2 h3 h4 h5 h6 head header hr html i iframe img input ins kbd keygen label legend li link main map mark menu menuitem meta meter nav noscript object ol optgroup option output p param pre progress q rp rt ruby s samp script section select small source span strong style sub summary sup table tbody td textarea tfoot th thead time title tr track u ul var video wbr".split(" ");
	HTML_TAGS_UNSAFE = "article aside header section".split(" ");
	
	SVG_TAGS = "circle defs ellipse g line linearGradient mask path pattern polygon polyline radialGradient rect stop svg text tspan".split(" ");
	
	IMBA_TAGS = {
		element: ElementTag,
		htmlelement: HTMLElementTag
	
	};
	
	Imba.SINGLETONS = {};
	Imba.TAGS = IMBA_TAGS;
	
	// IMBA_TAGS:htmlelement = HTMLElementTag
	
	// def Imba.p
	// 	console.log(*arguments)
	
	// TODO remove nodeClass? No need to have two representations of the same
	
	function extender(obj,sup){
		for(var o=sup, i=0, keys=Object.keys(o), l=keys.length; i < l; i++){
			obj[keys[i]] = o[keys[i]];
		};
		
		obj.prototype = Object.create(sup.prototype);
		obj.__super__ = obj.prototype.__super__ = sup.prototype;
		obj.prototype.initialize = obj.prototype.constructor = obj;
		return obj;
	};
	
	Imba.defineTag = function (name,func,supr){
		var ary;
		var ary=iter$(name.split("$"));var name = ary[(0)],ns = ary[(1)];
		supr || (supr = ((idx$(name,HTML_TAGS) >= 0)) ? ('htmlelement') : ('div'));
		
		var suprklass = IMBA_TAGS[supr];
		var klass = func; // imba$class(func,suprklass)
		
		extender(klass,suprklass);
		
		klass._nodeType = suprklass._nodeType || name;
		
		klass._name = name;
		klass._ns = ns;
		
		// add the classes -- if this is not a basic native node?
		if(klass._nodeType != name){
			klass._nodeFlag = "_" + name.replace(/_/g,'-');
			var nc = suprklass._nodeClass;
			nc = (nc) ? (nc.split(/\s+/g)) : ([]);
			var c = null;
			if(ns && idx$(c,nc) == -1){
				nc.push(c = ("" + ns + "_"));
			};
			if(!(idx$(c,nc) >= 0)){
				nc.push(c = klass._nodeFlag);
			};
			klass._nodeClass = nc.join(" ");
			klass._domFlags = nc;
			klass._isNative = false;
		} else {
			klass._isNative = true;
		};
		
		klass._dom = null;
		klass.prototype._dom = null;
		klass.prototype._built = false;
		klass.prototype._empty = true;
		
		tag$[name] = Imba.basicTagSpawner(klass,klass._nodeType);
		
		// add the default flags / classes for ns etc
		// if namespaced -- this is dangerous
		if(!ns){
			IMBA_TAGS[name] = klass;
		};
		IMBA_TAGS[("" + name + "$" + (ns || 'html'))] = klass;
		
		// create the global shortcut for tag init as well
		return klass;
	};
	
	Imba.defineSingletonTag = function (id,func,supr){
		var superklass = Imba.TAGS[supr || 'div'];
		// do we really want a class for singletons?
		// var klass = imba$class(func,superklass)
		var klass = extender(func,superklass);
		
		klass._id = id;
		klass._ns = superklass._ns;
		klass._nodeType = superklass._nodeType;
		klass._nodeClass = superklass._nodeClass;
		klass._domFlags = superklass._domFlags;
		klass._isNative = false;
		
		klass._dom = null;
		klass._instance = null;
		klass.prototype._dom = null;
		klass.prototype._built = false;
		klass.prototype._empty = true;
		
		// add the default flags / classes for ns etc
		// if namespaced -- this is dangerous
		// console.log('registered singleton')
		Imba.SINGLETONS[id] = klass;
		return klass;
	};
	
	Imba.tag = function (name){
		var typ = IMBA_TAGS[name];
		return new typ(typ.createNode());
	};
	
	// tags are a big and important part of Imba. It is critical to make this as
	// fast as possible. Since most engines really like functions they can optimize
	// we use several different functions for generating tags, depending on which
	// parts are supplied (classes, id, attributes, ...)
	Imba.basicTagSpawner = function (type){
		return function (){
			return new type(type.createNode());
		};
	};
	
	Imba.tagWithId = function (name,id){
		var typ = IMBA_TAGS[name];
		var dom = typ.createNode();
		dom.id = id;
		return new typ(dom);
	};
	
	tag$ = Imba.tag;
	
	t$ = Imba.tag;
	tc$ = Imba.tagWithFlags;
	ti$ = Imba.tagWithId;
	tic$ = Imba.tagWithIdAndFlags;
	
	
	Imba.getTagSingleton = function (id){
		var type,node,dom;
		
		if(type = Imba.SINGLETONS[id]){
			// return basic awakening if singleton does not exist?
			
			if(type && type.Instance){
				return type.Instance;
			};
			// no instance - check for element
			if(dom = Imba.doc.getElementById(id)){
				// we have a live instance - when finding it through a selector we should awake it, no?
				// hmm?
				// console.log('creating the singleton from existing node in dom?',id,type)
				node = type.Instance = new type(dom);
				node.awake(); // should only awaken
				return node;
			};
			
			dom = type.createNode();
			dom.id = id;
			// console.log('creating the singleton',id,type)
			node = type.Instance = new type(dom);
			node.end().awake();
			return node;
		} else {
			if(dom = Imba.doc.getElementById(id)){
				// console.log('found plain element with id')
				return Imba.getTagForDom(dom);
			}
		};
	};
	
	id$ = Imba.getTagSingleton;
	
	Imba.getTagForDom = function (dom){
		var m;
		// ugly checks
		if(!dom){
			return null;
		};
		if(dom._dom){
			return dom;
		}; // could use inheritance instead
		if(dom._tag){
			return dom._tag;
		};
		if(!(dom.nodeName)){
			return null;
		}; // better check?
		
		var ns = null;
		var id = dom.id;
		var type = dom.nodeName.toLowerCase();
		var cls = dom.className;
		
		if(id && Imba.SINGLETONS[id]){
			// FIXME control that it is the same singleton?
			// might collide -- not good?
			return Imba.getTagSingleton(id);
		};
		// look for id - singleton
		
		// need better test here
		if(svgSupport && (dom instanceof SVGElement)){
			ns = "svg";
			cls = dom.className.baseVal;
		};
		
		if(cls){
			// there can be several matches here - should choose the last
			// should fall back to less specific later? - otherwise things may fail
			// TODO rework this
			if(m = cls.match(/\b_([a-z\-]+)\b(?!\s*_[a-z\-]+)/)){
				type = m[1].replace(/-/g,'_'); // hmm -should not do that here?
			};
			
			if(m = cls.match(/\b([a-z]+)_\b/)){
				ns = m[1];
			};
		};
		
		var spawner = IMBA_TAGS[type];
		// console.log("tag for dom?!",ns,type,cls,spawner)
		return (spawner) ? (new spawner(dom)) : (null);
	};
	
	tag$wrap = Imba.getTagForDom;
	// predefine all supported html tags
	
	
	
		
		IMBA_TAGS.htmlelement.prototype.__id = {dom: true};
		IMBA_TAGS.htmlelement.prototype.id = function(v){ return this.getAttribute('id'); }
		IMBA_TAGS.htmlelement.prototype.setId = function(v){ this.setAttribute('id',v); return this; };
		
		IMBA_TAGS.htmlelement.prototype.__tabindex = {dom: true};
		IMBA_TAGS.htmlelement.prototype.tabindex = function(v){ return this.getAttribute('tabindex'); }
		IMBA_TAGS.htmlelement.prototype.setTabindex = function(v){ this.setAttribute('tabindex',v); return this; };
		
		IMBA_TAGS.htmlelement.prototype.__title = {dom: true};
		IMBA_TAGS.htmlelement.prototype.title = function(v){ return this.getAttribute('title'); }
		IMBA_TAGS.htmlelement.prototype.setTitle = function(v){ this.setAttribute('title',v); return this; };
		
		IMBA_TAGS.htmlelement.prototype.__role = {dom: true};
		IMBA_TAGS.htmlelement.prototype.role = function(v){ return this.getAttribute('role'); }
		IMBA_TAGS.htmlelement.prototype.setRole = function(v){ this.setAttribute('role',v); return this; };
		
		// def log *params
		// 	console.log(*params)
		// 	self
	;
	
	(function(){
		var tag = Imba.defineTag('fragment',function fragment(d){this.setDom(d)},"htmlelement");
		tag.createNode = function (){
			return global.document.createDocumentFragment();
		};
	})();
	
	(function(){
		var tag = Imba.defineTag('a',function a(d){this.setDom(d)});
		
		tag.prototype.__href = {dom: true};
		tag.prototype.href = function(v){ return this.getAttribute('href'); }
		tag.prototype.setHref = function(v){ this.setAttribute('href',v); return this; };
	})();
	
	Imba.defineTag('abbr',function abbr(d){this.setDom(d)});
	Imba.defineTag('address',function address(d){this.setDom(d)});
	Imba.defineTag('area',function area(d){this.setDom(d)});
	Imba.defineTag('article',function article(d){this.setDom(d)});
	Imba.defineTag('aside',function aside(d){this.setDom(d)});
	Imba.defineTag('audio',function audio(d){this.setDom(d)});
	Imba.defineTag('b',function b(d){this.setDom(d)});
	Imba.defineTag('base',function base(d){this.setDom(d)});
	Imba.defineTag('bdi',function bdi(d){this.setDom(d)});
	Imba.defineTag('bdo',function bdo(d){this.setDom(d)});
	Imba.defineTag('big',function big(d){this.setDom(d)});
	Imba.defineTag('blockquote',function blockquote(d){this.setDom(d)});
	Imba.defineTag('body',function body(d){this.setDom(d)});
	Imba.defineTag('br',function br(d){this.setDom(d)});
	(function(){
		var tag = Imba.defineTag('button',function button(d){this.setDom(d)});
		
		tag.prototype.__type = {dom: true};
		tag.prototype.type = function(v){ return this.getAttribute('type'); }
		tag.prototype.setType = function(v){ this.setAttribute('type',v); return this; };
		
		tag.prototype.__disabled = {dom: true};
		tag.prototype.disabled = function(v){ return this.getAttribute('disabled'); }
		tag.prototype.setDisabled = function(v){ this.setAttribute('disabled',v); return this; };
	})();
	
	Imba.defineTag('canvas',function canvas(d){this.setDom(d)});
	Imba.defineTag('caption',function caption(d){this.setDom(d)});
	Imba.defineTag('cite',function cite(d){this.setDom(d)});
	Imba.defineTag('code',function code(d){this.setDom(d)});
	Imba.defineTag('col',function col(d){this.setDom(d)});
	Imba.defineTag('colgroup',function colgroup(d){this.setDom(d)});
	Imba.defineTag('data',function data(d){this.setDom(d)});
	Imba.defineTag('datalist',function datalist(d){this.setDom(d)});
	Imba.defineTag('dd',function dd(d){this.setDom(d)});
	Imba.defineTag('del',function del(d){this.setDom(d)});
	Imba.defineTag('details',function details(d){this.setDom(d)});
	Imba.defineTag('dfn',function dfn(d){this.setDom(d)});
	Imba.defineTag('div',function div(d){this.setDom(d)});
	Imba.defineTag('dl',function dl(d){this.setDom(d)});
	Imba.defineTag('dt',function dt(d){this.setDom(d)});
	Imba.defineTag('em',function em(d){this.setDom(d)});
	Imba.defineTag('embed',function embed(d){this.setDom(d)});
	Imba.defineTag('fieldset',function fieldset(d){this.setDom(d)});
	Imba.defineTag('figcaption',function figcaption(d){this.setDom(d)});
	Imba.defineTag('figure',function figure(d){this.setDom(d)});
	Imba.defineTag('footer',function footer(d){this.setDom(d)});
	
	(function(){
		var tag = Imba.defineTag('form',function form(d){this.setDom(d)});
		
		tag.prototype.__method = {dom: true};
		tag.prototype.method = function(v){ return this.getAttribute('method'); }
		tag.prototype.setMethod = function(v){ this.setAttribute('method',v); return this; };
		
		tag.prototype.__action = {dom: true};
		tag.prototype.action = function(v){ return this.getAttribute('action'); }
		tag.prototype.setAction = function(v){ this.setAttribute('action',v); return this; };
	})();
	
	Imba.defineTag('h1',function h1(d){this.setDom(d)});
	Imba.defineTag('h2',function h2(d){this.setDom(d)});
	Imba.defineTag('h3',function h3(d){this.setDom(d)});
	Imba.defineTag('h4',function h4(d){this.setDom(d)});
	Imba.defineTag('h5',function h5(d){this.setDom(d)});
	Imba.defineTag('h6',function h6(d){this.setDom(d)});
	Imba.defineTag('head',function head(d){this.setDom(d)});
	Imba.defineTag('header',function header(d){this.setDom(d)});
	Imba.defineTag('hr',function hr(d){this.setDom(d)});
	Imba.defineTag('html',function html(d){this.setDom(d)});
	Imba.defineTag('i',function i(d){this.setDom(d)});
	Imba.defineTag('iframe',function iframe(d){this.setDom(d)});
	
	(function(){
		var tag = Imba.defineTag('img',function img(d){this.setDom(d)});
		
		tag.prototype.__src = {dom: true};
		tag.prototype.src = function(v){ return this.getAttribute('src'); }
		tag.prototype.setSrc = function(v){ this.setAttribute('src',v); return this; };
	})();
	
	(function(){
		var tag = Imba.defineTag('input',function input(d){this.setDom(d)});
		
		tag.prototype.__name = {dom: true};
		tag.prototype.name = function(v){ return this.getAttribute('name'); }
		tag.prototype.setName = function(v){ this.setAttribute('name',v); return this; };
		
		tag.prototype.__type = {dom: true};
		tag.prototype.type = function(v){ return this.getAttribute('type'); }
		tag.prototype.setType = function(v){ this.setAttribute('type',v); return this; };
		
		tag.prototype.__value = {dom: true};
		tag.prototype.value = function(v){ return this.getAttribute('value'); }
		tag.prototype.setValue = function(v){ this.setAttribute('value',v); return this; }; // dom property - NOT attribute -- hmm
		
		tag.prototype.__required = {dom: true};
		tag.prototype.required = function(v){ return this.getAttribute('required'); }
		tag.prototype.setRequired = function(v){ this.setAttribute('required',v); return this; };
		
		tag.prototype.__disabled = {dom: true};
		tag.prototype.disabled = function(v){ return this.getAttribute('disabled'); }
		tag.prototype.setDisabled = function(v){ this.setAttribute('disabled',v); return this; };
		
		tag.prototype.__placeholder = {dom: true};
		tag.prototype.placeholder = function(v){ return this.getAttribute('placeholder'); }
		tag.prototype.setPlaceholder = function(v){ this.setAttribute('placeholder',v); return this; };
		
		tag.prototype.value = function (){
			return this.dom().value;
		};
		
		tag.prototype.setValue = function (v){
			this.dom().value = v;
			return this;
		};
	})();
	
	Imba.defineTag('ins',function ins(d){this.setDom(d)});
	Imba.defineTag('kbd',function kbd(d){this.setDom(d)});
	Imba.defineTag('keygen',function keygen(d){this.setDom(d)});
	Imba.defineTag('label',function label(d){this.setDom(d)});
	Imba.defineTag('legend',function legend(d){this.setDom(d)});
	Imba.defineTag('li',function li(d){this.setDom(d)});
	
	(function(){
		var tag = Imba.defineTag('link',function link(d){this.setDom(d)});
		
		tag.prototype.__rel = {dom: true};
		tag.prototype.rel = function(v){ return this.getAttribute('rel'); }
		tag.prototype.setRel = function(v){ this.setAttribute('rel',v); return this; };
		
		tag.prototype.__type = {dom: true};
		tag.prototype.type = function(v){ return this.getAttribute('type'); }
		tag.prototype.setType = function(v){ this.setAttribute('type',v); return this; };
		
		tag.prototype.__href = {dom: true};
		tag.prototype.href = function(v){ return this.getAttribute('href'); }
		tag.prototype.setHref = function(v){ this.setAttribute('href',v); return this; };
		
		tag.prototype.__media = {dom: true};
		tag.prototype.media = function(v){ return this.getAttribute('media'); }
		tag.prototype.setMedia = function(v){ this.setAttribute('media',v); return this; };
	})();
	
	Imba.defineTag('main',function main(d){this.setDom(d)});
	Imba.defineTag('map',function map(d){this.setDom(d)});
	Imba.defineTag('mark',function mark(d){this.setDom(d)});
	Imba.defineTag('menu',function menu(d){this.setDom(d)});
	Imba.defineTag('menuitem',function menuitem(d){this.setDom(d)});
	
	(function(){
		var tag = Imba.defineTag('meta',function meta(d){this.setDom(d)});
		
		tag.prototype.__name = {dom: true};
		tag.prototype.name = function(v){ return this.getAttribute('name'); }
		tag.prototype.setName = function(v){ this.setAttribute('name',v); return this; };
		
		tag.prototype.__content = {dom: true};
		tag.prototype.content = function(v){ return this.getAttribute('content'); }
		tag.prototype.setContent = function(v){ this.setAttribute('content',v); return this; };
		
		tag.prototype.__charset = {dom: true};
		tag.prototype.charset = function(v){ return this.getAttribute('charset'); }
		tag.prototype.setCharset = function(v){ this.setAttribute('charset',v); return this; };
	})();
	
	Imba.defineTag('meter',function meter(d){this.setDom(d)});
	Imba.defineTag('nav',function nav(d){this.setDom(d)});
	Imba.defineTag('noscript',function noscript(d){this.setDom(d)});
	Imba.defineTag('object',function object(d){this.setDom(d)});
	Imba.defineTag('ol',function ol(d){this.setDom(d)});
	Imba.defineTag('optgroup',function optgroup(d){this.setDom(d)});
	
	(function(){
		var tag = Imba.defineTag('option',function option(d){this.setDom(d)});
		
		tag.prototype.__value = {dom: true};
		tag.prototype.value = function(v){ return this.getAttribute('value'); }
		tag.prototype.setValue = function(v){ this.setAttribute('value',v); return this; };
	})();
	
	Imba.defineTag('output',function output(d){this.setDom(d)});
	Imba.defineTag('p',function p(d){this.setDom(d)});
	Imba.defineTag('param',function param(d){this.setDom(d)});
	Imba.defineTag('pre',function pre(d){this.setDom(d)});
	Imba.defineTag('progress',function progress(d){this.setDom(d)});
	Imba.defineTag('q',function q(d){this.setDom(d)});
	Imba.defineTag('rp',function rp(d){this.setDom(d)});
	Imba.defineTag('rt',function rt(d){this.setDom(d)});
	Imba.defineTag('ruby',function ruby(d){this.setDom(d)});
	Imba.defineTag('s',function s(d){this.setDom(d)});
	Imba.defineTag('samp',function samp(d){this.setDom(d)});
	
	(function(){
		var tag = Imba.defineTag('script',function script(d){this.setDom(d)});
		
		tag.prototype.__src = {dom: true};
		tag.prototype.src = function(v){ return this.getAttribute('src'); }
		tag.prototype.setSrc = function(v){ this.setAttribute('src',v); return this; };
		
		tag.prototype.__type = {dom: true};
		tag.prototype.type = function(v){ return this.getAttribute('type'); }
		tag.prototype.setType = function(v){ this.setAttribute('type',v); return this; };
	})();
	
	Imba.defineTag('section',function section(d){this.setDom(d)});
	
	(function(){
		var tag = Imba.defineTag('select',function select(d){this.setDom(d)});
		
		tag.prototype.__multiple = {dom: true};
		tag.prototype.multiple = function(v){ return this.getAttribute('multiple'); }
		tag.prototype.setMultiple = function(v){ this.setAttribute('multiple',v); return this; };
	})();
	
	
	Imba.defineTag('small',function small(d){this.setDom(d)});
	Imba.defineTag('source',function source(d){this.setDom(d)});
	Imba.defineTag('span',function span(d){this.setDom(d)});
	Imba.defineTag('strong',function strong(d){this.setDom(d)});
	Imba.defineTag('style',function style(d){this.setDom(d)});
	Imba.defineTag('sub',function sub(d){this.setDom(d)});
	Imba.defineTag('summary',function summary(d){this.setDom(d)});
	Imba.defineTag('sup',function sup(d){this.setDom(d)});
	Imba.defineTag('table',function table(d){this.setDom(d)});
	Imba.defineTag('tbody',function tbody(d){this.setDom(d)});
	Imba.defineTag('td',function td(d){this.setDom(d)});
	
	(function(){
		var tag = Imba.defineTag('textarea',function textarea(d){this.setDom(d)});
		
		tag.prototype.__name = {dom: true};
		tag.prototype.name = function(v){ return this.getAttribute('name'); }
		tag.prototype.setName = function(v){ this.setAttribute('name',v); return this; };
		
		tag.prototype.__disabled = {dom: true};
		tag.prototype.disabled = function(v){ return this.getAttribute('disabled'); }
		tag.prototype.setDisabled = function(v){ this.setAttribute('disabled',v); return this; };
		
		tag.prototype.__required = {dom: true};
		tag.prototype.required = function(v){ return this.getAttribute('required'); }
		tag.prototype.setRequired = function(v){ this.setAttribute('required',v); return this; };
		
		tag.prototype.__placeholder = {dom: true};
		tag.prototype.placeholder = function(v){ return this.getAttribute('placeholder'); }
		tag.prototype.setPlaceholder = function(v){ this.setAttribute('placeholder',v); return this; };
		
		tag.prototype.__value = {dom: true};
		tag.prototype.value = function(v){ return this.getAttribute('value'); }
		tag.prototype.setValue = function(v){ this.setAttribute('value',v); return this; };
		
		tag.prototype.__rows = {dom: true};
		tag.prototype.rows = function(v){ return this.getAttribute('rows'); }
		tag.prototype.setRows = function(v){ this.setAttribute('rows',v); return this; };
		
		tag.prototype.__cols = {dom: true};
		tag.prototype.cols = function(v){ return this.getAttribute('cols'); }
		tag.prototype.setCols = function(v){ this.setAttribute('cols',v); return this; };
		
		tag.prototype.value = function (){
			return this.dom().value;
		};
		
		tag.prototype.setValue = function (v){
			this.dom().value = v;
			return this;
		};
	})();
	
	Imba.defineTag('tfoot',function tfoot(d){this.setDom(d)});
	Imba.defineTag('th',function th(d){this.setDom(d)});
	Imba.defineTag('thead',function thead(d){this.setDom(d)});
	Imba.defineTag('time',function time(d){this.setDom(d)});
	Imba.defineTag('title',function title(d){this.setDom(d)});
	Imba.defineTag('tr',function tr(d){this.setDom(d)});
	Imba.defineTag('track',function track(d){this.setDom(d)});
	Imba.defineTag('u',function u(d){this.setDom(d)});
	Imba.defineTag('ul',function ul(d){this.setDom(d)});
	Imba.defineTag('video',function video(d){this.setDom(d)});
	Imba.defineTag('wbr',function wbr(d){this.setDom(d)});
	
	// for type in Imba.Tag.TYPES_HTML
	// 	# create the tags
	// 	# really? is this the way to create the initializers?! dropping the namespace
	// 	Imba.Tag.NATIVE[type] = do |o,b|
	// 		this.setup(o,b)
	// 		# this.initialize(attrs,body)
	// 
	// for type in Imba.Tag.TYPES_SVG
	// 	# dont add method here? It is probably better to precreate all the types explicitly
	// 	Imba.Tag.NATIVE["svg:{type}"] = type
	// 
	// Should probably predefine the regular 'primitive' types here
	// tag a < htmlelement


}())
}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],30:[function(require,module,exports){
(function (global){
(function(){


	var $1;
	// could create a fake document 
	/* @class ImbaServerDocument */
	function ImbaServerDocument(){
		return this;
	};
	
	global.ImbaServerDocument = ImbaServerDocument; // global class 
	ImbaServerDocument.prototype.createElement = function (type){
		return new ImbaServerElement(type);
	};
	
	ImbaServerDocument.prototype.createElementNS = function (ns,type){
		return new ImbaServerElement(type);
	};
	
	ImbaServerDocument.prototype.createTextNode = function (value){
		return value; // hmm
	};
	
	
	// could optimize by using a dictionary in addition to keys
	// where we cache the indexes?
	/* @class ImbaNodeClassList */
	function ImbaNodeClassList(dom,classes){
		this._classes = classes || [];
		this._dom = dom;
	};
	
	global.ImbaNodeClassList = ImbaNodeClassList; // global class 
	
	
	ImbaNodeClassList.prototype.add = function (flag){
		if(!(this._classes.indexOf(flag) >= 0)){
			this._classes.push(flag);
		};
		return this;
	};
	
	ImbaNodeClassList.prototype.remove = function (flag){
		// TODO implement!
		// @classes.push(flag) unless @classes.indexOf(flag) >= 0
		var idx = this._classes.indexOf(flag);
		if(idx >= 0){
			this._classes[idx] = '';
		};
		return this;
	};
	
	ImbaNodeClassList.prototype.toggle = function (flag){
		return this;
	};
	
	ImbaNodeClassList.prototype.clone = function (dom){
		var clone = new ImbaNodeClassList(dom,this._classes.slice(0));
		return clone;
	};
	
	ImbaNodeClassList.prototype.toString = function (){
		return this._classes.join(" ");
	};
	
	
	/* @class ImbaServerElement */
	function ImbaServerElement(type){
		// slowing things down -- be careful
		// should only need to copy from the outer element
		// when we optimize - do it some other way
		
		// should somehow be linked to their owner, no?
		this._nodeType = type;
		this.nodeName = type;
		this.classList = new ImbaNodeClassList(this);
		this;
	};
	
	global.ImbaServerElement = ImbaServerElement; // global class 
	
	
	ImbaServerElement.prototype.cloneNode = function (deep){
		// need to include classes as well
		var el = new ImbaServerElement(this._nodeType);
		el.classList = this.classList.clone(this);
		// FIXME clone the attributes as well
		// el:className = self:className
		return el;
	};
	
	ImbaServerElement.prototype.appendChild = function (child){
		// again, could be optimized much more
		this.children || (this.children = []);
		return this.children.push(child); // hmmmm
	};
	
	// should implement at some point
	// should also use shortcut to wipe
	// def firstChild
	// 	nil
	// 
	// def removeChild
	// 	nil
	
	ImbaServerElement.prototype.setAttribute = function (key,value){
		this._attributes || (this._attributes = []);
		this._attributes.push(("" + key + "=\"" + value + "\""));
		this._attributes[key] = value;
		return this;
	};
	
	ImbaServerElement.prototype.getAttribute = function (key){
		// console.log "getAttribute not implemented on server"
		return (this._attributes) ? (this._attributes[key]) : (undefined);
	};
	
	ImbaServerElement.prototype.removeAttribute = function (key){
		console.log("removeAttribute not implemented on server");
		return true;
	};
	
	ImbaServerElement.prototype.__innerHTML = function (){
		var ary;
		return this.innerHTML || this.textContent || (this.children && this.children.join("")) || '';
		// hmmm
		var str = this.innerHTML || this.textContent || '';
		if(str){
			return str;
		};
		
		if(ary = this.children){
			var i = 0;
			var l = ary.length;
			var item;
			while(i < l){
				
					if(item = ary[i++]){
						str += item.toString();
					};
			
			};
		};
		
		return str;
	};
	
	ImbaServerElement.prototype.__outerHTML = function (){
		var v;
		var typ = this._nodeType;
		var sel = ("" + typ);
		// difficult with all the attributes etc?
		// iterating through keys is slow (as tested) -
		// the whole point is to not need this on the server either
		// but it can surely be fixed later
		// and what if we use classList etc?
		// we do instead want to make it happen directly
		// better to use setAttribute or something, so we can get the
		// order and everything. It might not even matter though - fast
		// no matter what.
		if(v = this.id){
			sel += (" id='" + v + "'");
		};
		if(v = this.classList.toString()){
			sel += (" class='" + v + "'");
		};
		if(v = this._attributes){
			sel += (" " + (this._attributes.join(" ")));
		};
		
		// var inner = self:innerHTML || self:textContent || (self:children and self:children.join("")) or ''
		return ("<" + sel + ">" + this.__innerHTML() + "</" + typ + ">"); // hmm
		// if self:innerHTML
		// 
		// if self:children
		// 	"<{sel}>{inner}</{typ}>"
		// elif self:textContent
		// 	"<{sel}>{self:textContent}</{typ}>"
		// # what about self-closing?
		// else
		// 	"<{sel}></{typ}>"
	};
	
	ImbaServerElement.prototype.toString = function (){
		if(this._tag && this._tag.toNodeString){
			// console.log "tag has custom string {@nodeType}" # ,self:children
			return this._tag.toNodeString();
			// return @tag.toNodeString
		};
		return this.__outerHTML();
	};
	
	
		IMBA_TAGS.htmlelement.prototype.toString = function (){
			return this.dom().toString(); // hmmm
		};
	
	
	
		IMBA_TAGS.html.prototype.doctype = function (){
			return this._doctype || "<!doctype html>";
		};
		
		IMBA_TAGS.html.prototype.toString = function (){
			return this.doctype() + IMBA_TAGS.html.__super__.toString.apply(this,arguments);
			// <!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Strict//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd">
		};
	
	
	
		IMBA_TAGS.style.prototype.toString = function (){
			return "<style/>";
		};
	
	
	// hmm
	Imba.doc = global.document || new ImbaServerDocument();
	($1=global).document || ($1.document = Imba.doc);


}())
}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],31:[function(require,module,exports){
(function(){
Imba = {};
}())
},{}],32:[function(require,module,exports){
(function(){


	require('./imba');
	// require './imba/node'
	require('./core.events');
	
	require('./dom');
	require('./dom.server');// hmm -- dont require events?
	// require './imba/dom.events' # hmm -- dont require events?
	require('./selector');


}())
},{"./core.events":28,"./dom":29,"./dom.server":30,"./imba":31,"./selector":33}],33:[function(require,module,exports){
(function (global){
(function(){


	function iter$(a){ return a ? (a.toArray ? a.toArray() : a) : []; };
	/* @class ImbaSelector */
	function ImbaSelector(sel,scope,nodes){
		this._query = (sel instanceof ImbaSelector) ? (sel.query()) : (sel);
		this._context = scope;
		
		if(nodes){
			for(var i=0, ary=iter$(nodes), len=ary.length, res=[]; i < len; i++) {
				res.push(tag$wrap(ary[i]));
			};this._nodes = res;
		};
		
		this._lazy = !nodes;
		return this;
	};
	
	global.ImbaSelector = ImbaSelector; // global class 
	// def self.first selector, scope
	// 	sel = self.new(selector,scope)
	// 	return sel.first
	
	
	ImbaSelector.prototype.__query = {};
	ImbaSelector.prototype.query = function(v){ return this._query; }
	ImbaSelector.prototype.setQuery = function(v){ this._query = v; return this; };
	
	
	
	ImbaSelector.prototype.reload = function (){
		this._nodes = null;
		return this;
	};
	
	ImbaSelector.prototype.scope = function (){
		var ctx;
		if(this._scope){
			return this._scope;
		};
		if(!(ctx = this._context)){
			return global.document;
		};
		return this._scope = (ctx.toScope) ? (ctx.toScope()) : (ctx);
	};
	
	ImbaSelector.prototype.first = function (){
		return (this._lazy) ? (
			tag$wrap((this._first || (this._first = this.scope().querySelector(this.query()))))
		) : (
			this.nodes()[0]
		);
	};
	
	ImbaSelector.prototype.last = function (){
		return this.nodes()[this._nodes.length - 1];
	};
	
	ImbaSelector.prototype.nodes = function (){
		if(this._nodes){
			return this._nodes;
		};
		var items = this.scope().querySelectorAll(this.query());
		for(var i=0, ary=iter$(items), len=ary.length, res=[]; i < len; i++) {
			res.push(tag$wrap(ary[i]));
		};this._nodes = res;
		this._lazy = false;
		return this._nodes;
	};
	
	ImbaSelector.prototype.count = function (){
		return this.nodes().length;
	};
	ImbaSelector.prototype.len = function (){
		return this.nodes().length;
	};
	ImbaSelector.prototype.any = function (){
		return this.count();
	};
	
	ImbaSelector.prototype.at = function (idx){
		return this.nodes()[idx];
	};
	
	ImbaSelector.prototype.forEach = function (block){
		this.nodes().forEach(block);
		return this;
	};
	
	ImbaSelector.prototype.map = function (block){
		return this.nodes().map(block);
	};
	
	ImbaSelector.prototype.toArray = function (){
		return this.nodes();
	};
	
	// Get the first element that matches the selector, 
	// beginning at the current element and progressing up through the DOM tree
	ImbaSelector.prototype.closest = function (sel){
		// seems strange that we alter this selector?
		this._nodes = this.map(function (node){
			return node.closest(sel);
		});
		return this;
	};
	
	// Get the siblings of each element in the set of matched elements, 
	// optionally filtered by a selector.
	// TODO remove duplicates?
	ImbaSelector.prototype.siblings = function (sel){
		this._nodes = this.map(function (node){
			return node.siblings(sel);
		});
		return this;
	};
	
	// Get the descendants of each element in the current set of matched 
	// elements, filtered by a selector.
	ImbaSelector.prototype.find = function (sel){
		this._nodes = this.__query__(sel.query(),this.nodes());
		return this;
	};
	
	// TODO IMPLEMENT
	// Get the children of each element in the set of matched elements, 
	// optionally filtered by a selector.
	ImbaSelector.prototype.children = function (sel){
		return true;
	};
	
	// TODO IMPLEMENT
	// Reduce the set of matched elements to those that have a descendant that
	// matches the selector or DOM element.
	ImbaSelector.prototype.has = function (){
		return true;
	};
	
	// TODO IMPLEMENT
	ImbaSelector.prototype.__union = function (){
		this.p("called ImbaSelector.__union");
		return this;
	};
	
	// TODO IMPLEMENT
	ImbaSelector.prototype.__intersect = function (){
		this.p("called ImbaSelector.__union");
		return this;
	};
	
	ImbaSelector.prototype.reject = function (blk){
		return this.filter(blk,false);
	};
	
	ImbaSelector.prototype.filter = function (blk,bool){
		if(bool === undefined) bool = true;
		var fn = (blk instanceof Function) && blk || (function (n){
			return n.matches(blk);
		});
		var ary = this.nodes().filter(function (n){
			return fn(n) == bool;
		}); // hmm -- not sure about this?
		// if we want to return a new selector for this, we should do that for
		// others as well
		return new ImbaSelector("",this._scope,ary);
	};
	
	// hmm - what is this even for?
	ImbaSelector.prototype.__query__ = function (query,contexts){
		var nodes, i, l;
		var nodes = [],i = 0,l = contexts.length;
		
		while(i < l){
			
				nodes.push.apply(nodes,contexts[i++].querySelectorAll(query));
		
		};
		return nodes;
	};
	
	ImbaSelector.prototype.__matches__ = function (){
		return true;
	};
	
	// Proxies
	ImbaSelector.prototype.flag = function (flag){
		return this.forEach(function (n){
			return n.flag(flag);
		});
	};
	
	ImbaSelector.prototype.unflag = function (flag){
		return this.forEach(function (n){
			return n.unflag(flag);
		});
	};
	
	ImbaSelector.prototype.call = function (meth,args){
		var self=this;
		if(args === undefined) args = [];
		return self.forEach(function (n){
			var $1;
			return ((self.setFn(n[($1=meth)]),n[$1])) && (self.fn().apply(n,args));
		});
	};
	
	q$ = function (sel,scope){
		return new ImbaSelector(sel,scope);
	};
	
	q$$ = function (sel,scope){
		var el = (scope || global.document).querySelector(sel);
		return el && tag$wrap(el) || null;
		// scope.querySelector(query)
		// ImbaSelector.first(sel, scope)
	};
	
	// $q$ = (sel,scope) -> Imba.DOM.Selector.new(sel, scope)
	// $q$$= (sel,scope) -> Imba.DOM.Selector.first(sel, scope)
	
	// extending tags with query-methods
	// must be a better way to reopen classes
	
		IMBA_TAGS.element.prototype.querySelectorAll = function (q){
			return this._dom.querySelectorAll(q);
		};
		IMBA_TAGS.element.prototype.querySelector = function (q){
			return this._dom.querySelector(q);
		};
		IMBA_TAGS.element.prototype.find = function (sel){
			return new ImbaSelector(sel,this);
		};


}())
}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],34:[function(require,module,exports){

},{}],35:[function(require,module,exports){
(function (process){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

// resolves . and .. elements in a path array with directory names there
// must be no slashes, empty elements, or device names (c:\) in the array
// (so also no leading and trailing slashes - it does not distinguish
// relative and absolute paths)
function normalizeArray(parts, allowAboveRoot) {
  // if the path tries to go above the root, `up` ends up > 0
  var up = 0;
  for (var i = parts.length - 1; i >= 0; i--) {
    var last = parts[i];
    if (last === '.') {
      parts.splice(i, 1);
    } else if (last === '..') {
      parts.splice(i, 1);
      up++;
    } else if (up) {
      parts.splice(i, 1);
      up--;
    }
  }

  // if the path is allowed to go above the root, restore leading ..s
  if (allowAboveRoot) {
    for (; up--; up) {
      parts.unshift('..');
    }
  }

  return parts;
}

// Split a filename into [root, dir, basename, ext], unix version
// 'root' is just a slash, or nothing.
var splitPathRe =
    /^(\/?|)([\s\S]*?)((?:\.{1,2}|[^\/]+?|)(\.[^.\/]*|))(?:[\/]*)$/;
var splitPath = function(filename) {
  return splitPathRe.exec(filename).slice(1);
};

// path.resolve([from ...], to)
// posix version
exports.resolve = function() {
  var resolvedPath = '',
      resolvedAbsolute = false;

  for (var i = arguments.length - 1; i >= -1 && !resolvedAbsolute; i--) {
    var path = (i >= 0) ? arguments[i] : process.cwd();

    // Skip empty and invalid entries
    if (typeof path !== 'string') {
      throw new TypeError('Arguments to path.resolve must be strings');
    } else if (!path) {
      continue;
    }

    resolvedPath = path + '/' + resolvedPath;
    resolvedAbsolute = path.charAt(0) === '/';
  }

  // At this point the path should be resolved to a full absolute path, but
  // handle relative paths to be safe (might happen when process.cwd() fails)

  // Normalize the path
  resolvedPath = normalizeArray(filter(resolvedPath.split('/'), function(p) {
    return !!p;
  }), !resolvedAbsolute).join('/');

  return ((resolvedAbsolute ? '/' : '') + resolvedPath) || '.';
};

// path.normalize(path)
// posix version
exports.normalize = function(path) {
  var isAbsolute = exports.isAbsolute(path),
      trailingSlash = substr(path, -1) === '/';

  // Normalize the path
  path = normalizeArray(filter(path.split('/'), function(p) {
    return !!p;
  }), !isAbsolute).join('/');

  if (!path && !isAbsolute) {
    path = '.';
  }
  if (path && trailingSlash) {
    path += '/';
  }

  return (isAbsolute ? '/' : '') + path;
};

// posix version
exports.isAbsolute = function(path) {
  return path.charAt(0) === '/';
};

// posix version
exports.join = function() {
  var paths = Array.prototype.slice.call(arguments, 0);
  return exports.normalize(filter(paths, function(p, index) {
    if (typeof p !== 'string') {
      throw new TypeError('Arguments to path.join must be strings');
    }
    return p;
  }).join('/'));
};


// path.relative(from, to)
// posix version
exports.relative = function(from, to) {
  from = exports.resolve(from).substr(1);
  to = exports.resolve(to).substr(1);

  function trim(arr) {
    var start = 0;
    for (; start < arr.length; start++) {
      if (arr[start] !== '') break;
    }

    var end = arr.length - 1;
    for (; end >= 0; end--) {
      if (arr[end] !== '') break;
    }

    if (start > end) return [];
    return arr.slice(start, end - start + 1);
  }

  var fromParts = trim(from.split('/'));
  var toParts = trim(to.split('/'));

  var length = Math.min(fromParts.length, toParts.length);
  var samePartsLength = length;
  for (var i = 0; i < length; i++) {
    if (fromParts[i] !== toParts[i]) {
      samePartsLength = i;
      break;
    }
  }

  var outputParts = [];
  for (var i = samePartsLength; i < fromParts.length; i++) {
    outputParts.push('..');
  }

  outputParts = outputParts.concat(toParts.slice(samePartsLength));

  return outputParts.join('/');
};

exports.sep = '/';
exports.delimiter = ':';

exports.dirname = function(path) {
  var result = splitPath(path),
      root = result[0],
      dir = result[1];

  if (!root && !dir) {
    // No dirname whatsoever
    return '.';
  }

  if (dir) {
    // It has a dirname, strip trailing slash
    dir = dir.substr(0, dir.length - 1);
  }

  return root + dir;
};


exports.basename = function(path, ext) {
  var f = splitPath(path)[2];
  // TODO: make this comparison case-insensitive on windows?
  if (ext && f.substr(-1 * ext.length) === ext) {
    f = f.substr(0, f.length - ext.length);
  }
  return f;
};


exports.extname = function(path) {
  return splitPath(path)[3];
};

function filter (xs, f) {
    if (xs.filter) return xs.filter(f);
    var res = [];
    for (var i = 0; i < xs.length; i++) {
        if (f(xs[i], i, xs)) res.push(xs[i]);
    }
    return res;
}

// String.prototype.substr - negative index don't work in IE8
var substr = 'ab'.substr(-1) === 'b'
    ? function (str, start, len) { return str.substr(start, len) }
    : function (str, start, len) {
        if (start < 0) start = str.length + start;
        return str.substr(start, len);
    }
;

}).call(this,require('_process'))
},{"_process":36}],36:[function(require,module,exports){
// shim for using process in browser

var process = module.exports = {};
var queue = [];
var draining = false;

function drainQueue() {
    if (draining) {
        return;
    }
    draining = true;
    var currentQueue;
    var len = queue.length;
    while(len) {
        currentQueue = queue;
        queue = [];
        var i = -1;
        while (++i < len) {
            currentQueue[i]();
        }
        len = queue.length;
    }
    draining = false;
}
process.nextTick = function (fun) {
    queue.push(fun);
    if (!draining) {
        setTimeout(drainQueue, 0);
    }
};

process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];
process.version = ''; // empty string to avoid regexp issues

function noop() {}

process.on = noop;
process.addListener = noop;
process.once = noop;
process.off = noop;
process.removeListener = noop;
process.removeAllListeners = noop;
process.emit = noop;

process.binding = function (name) {
    throw new Error('process.binding is not supported');
};

// TODO(shtylman)
process.cwd = function () { return '/' };
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};
process.umask = function() { return 0; };

},{}]},{},[24])(24)
});