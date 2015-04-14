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
		} else if(typ == 'iter') {
			names = ['ary__','ary_','coll','array','items','ary'];
		} else if(typ == 'val') {
			names = ['v_'];
		} else if(typ == 'arguments') {
			names = ['$_','$0'];
		} else if(typ == 'keypars') {
			names = ['opts','options','pars'];
		} else if(typ == 'counter') {
			names = ['i__','i_','k','j','i'];
		} else if(typ == 'len') {
			names = ['len__','len_','len'];
		} else if(typ == 'list') {
			names = ['tmplist_','tmplist','tmp'];
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