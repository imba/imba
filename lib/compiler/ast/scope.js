(function(){
function iter$(a){ return a ? (a.toArray ? a.toArray() : a) : []; }
AST.Scope = imba$class(function Scope(node,parent){
	this._head = [];
	this._node = node;
	this._parent = parent;
	this._vars = new AST.VariableDeclaration([]);
	this._counter = 0;
	this._varmap = {};
	this._varpool = [];
});

AST.Scope.prototype.__level = {};
AST.Scope.prototype.level = function(v){ return this._level; }
AST.Scope.prototype.setLevel = function(v){ this._level = v; return this; }
;

AST.Scope.prototype.__context = {};
AST.Scope.prototype.context = function(v){ return this._context; }
AST.Scope.prototype.setContext = function(v){ this._context = v; return this; }
;

AST.Scope.prototype.__node = {};
AST.Scope.prototype.node = function(v){ return this._node; }
AST.Scope.prototype.setNode = function(v){ this._node = v; return this; }
;

AST.Scope.prototype.__parent = {};
AST.Scope.prototype.parent = function(v){ return this._parent; }
AST.Scope.prototype.setParent = function(v){ this._parent = v; return this; }
;

AST.Scope.prototype.__varmap = {};
AST.Scope.prototype.varmap = function(v){ return this._varmap; }
AST.Scope.prototype.setVarmap = function(v){ this._varmap = v; return this; }
;

AST.Scope.prototype.__varpool = {};
AST.Scope.prototype.varpool = function(v){ return this._varpool; }
AST.Scope.prototype.setVarpool = function(v){ this._varpool = v; return this; }
;

AST.Scope.prototype.__params = {};
AST.Scope.prototype.params = function(v){ return this._params; }
AST.Scope.prototype.setParams = function(v){ this._params = v; return this; }
;

AST.Scope.prototype.__head = {};
AST.Scope.prototype.head = function(v){ return this._head; }
AST.Scope.prototype.setHead = function(v){ this._head = v; return this; }
;

AST.Scope.prototype.__vars = {};
AST.Scope.prototype.vars = function(v){ return this._vars; }
AST.Scope.prototype.setVars = function(v){ this._vars = v; return this; }
;

AST.Scope.prototype.__counter = {};
AST.Scope.prototype.counter = function(v){ return this._counter; }
AST.Scope.prototype.setCounter = function(v){ this._counter = v; return this; }
;

AST.Scope.prototype.context = function (){
	return this._context || (this._context = new AST.ScopeContext(this));
};
AST.Scope.prototype.traverse = function (){
	return this;
};
AST.Scope.prototype.visit = function (){
	this._parent = STACK.scope(1);
	this._level = STACK.scopes().length - 1;
	
	STACK.addScope(this);
	this.root().scopes().push(this);
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
	if(decl === undefined) decl = null;
	if(o === undefined) o = {};
	name = name.toSymbol();
	var existing = this._varmap.hasOwnProperty(name) && this._varmap[name];
	if(existing) {
		return existing;
	};
	
	var item = new AST.Variable(this,name,decl,o);
	this._varmap[name] = item;
	return item;
};
AST.Scope.prototype.temporary = function (refnode,o,name){
	if(o === undefined) o = {};
	if(name === undefined) name = null;
	if(o.type) {
		for(var i=0, ary=iter$(this._varpool), len=ary.length, v; i < len; i++){
			v = ary[i];
			if(v.type() == o.type && v.declarator() == null) {
				return v.reuse(refnode);
			};
		};
	};
	var item = new AST.SystemVariable(this,name,refnode,o);
	this._varpool.push(item);
	this._vars.push(item);
	return item;
};
AST.Scope.prototype.declare = function (name,init,options){
	if(init === undefined) init = null;
	if(options === undefined) options = {};
	name = name.toSymbol();
	this._vars.add(name,init);
	var decl = this._vars.last();
	var item = new AST.Variable(this,name,decl,options);
	decl.setVariable(item);
	return item.resolve();
};
AST.Scope.prototype.lookup = function (name){
	var g;
	var ret = null;
	if(this._varmap.hasOwnProperty(name.toSymbol())) {
		ret = this._varmap[name.toSymbol()];
	} else {
		ret = this.parent() && this.parent().lookup(name);
	};
	ret || (ret = ((g = this.root()) && (g.lookup(name))));
	return ret;
};
AST.Scope.prototype.free = function (variable){
	variable.free();
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
AST.Scope.prototype.c = function (){
	var body = this.node().body().c({expression: false});
	var head = [this._vars, this._params].block().c({expression: false});
	return [head || null, body].flatten().compact().join("\n");
};
AST.Scope.prototype.dump = function (){
	var self=this;
	var vars = Object.keys(this._varmap).map(function (k){
		var v = self._varmap[k];
		return (v.references().count()) ? (v.dump()) : (null);
	});
	return {type: self.constructor.name,level: (self.level() || 0),vars: vars.compact(),loc: self.node().body().loc()};
};
AST.Scope.prototype.toString = function (){
	return "" + (this.constructor.name);
};
AST.FileScope = imba$class(function FileScope(){
	AST.FileScope.prototype.__super.constructor.apply(this,arguments);
	
	this.register('global',this,{type: 'global'});
	this.register('exports',this,{type: 'global'});
	this.register('console',this,{type: 'global'});
	this.register('process',this,{type: 'global'});
	this.register('setTimeout',this,{type: 'global'});
	this.register('setInterval',this,{type: 'global'});
	this.register('clearTimeout',this,{type: 'global'});
	this.register('clearInterval',this,{type: 'global'});
	this.register('__dirname',this,{type: 'global'});
	this._warnings = [];
	this._scopes = [];
	this._helpers = [];
},AST.Scope);

AST.FileScope.prototype.__warnings = {};
AST.FileScope.prototype.warnings = function(v){ return this._warnings; }
AST.FileScope.prototype.setWarnings = function(v){ this._warnings = v; return this; }
;

AST.FileScope.prototype.__scopes = {};
AST.FileScope.prototype.scopes = function(v){ return this._scopes; }
AST.FileScope.prototype.setScopes = function(v){ this._scopes = v; return this; }
;

AST.FileScope.prototype.context = function (){
	return this._context || (this._context = new AST.RootScopeContext(this));
};
AST.FileScope.prototype.lookup = function (name){
	return (this._varmap.hasOwnProperty(name.toSymbol())) && (this._varmap[name.toSymbol()]);
};
AST.FileScope.prototype.visit = function (){
	STACK.addScope(this);
	return this;
};
AST.FileScope.prototype.helper = function (typ,value){
	if(this._helpers.indexOf(value) == -1) {
		this._helpers.push(value);
	};
	return this;
};
AST.FileScope.prototype.c = function (){
	var body = this.node().body().c({expression: false});
	var head = [this._params, this._vars].block().c({expression: false});
	return [head || null, this._helpers || null, body].flatten().compact().join("\n");
};
AST.FileScope.prototype.warn = function (data){
	data.node = null;
	this._warnings.push(data);
	return this;
};
AST.FileScope.prototype.dump = function (){
	var scopes = this._scopes.map(function (s){
		return s.dump();
	});
	scopes.unshift(AST.FileScope.prototype.__super.dump.call(this));
	
	var obj = {warnings: this._warnings.dump(),scopes: scopes};
	return obj;
};
AST.ClassScope = imba$class(function ClassScope(){
	AST.Scope.apply(this,arguments);
},AST.Scope);

AST.TagScope = imba$class(function TagScope(){
	AST.ClassScope.apply(this,arguments);
},AST.ClassScope);

AST.ClosureScope = imba$class(function ClosureScope(){
	AST.Scope.apply(this,arguments);
},AST.Scope);

AST.FunctionScope = imba$class(function FunctionScope(){
	AST.Scope.apply(this,arguments);
},AST.Scope);

AST.MethodScope = imba$class(function MethodScope(){
	AST.Scope.apply(this,arguments);
},AST.Scope);
AST.MethodScope.prototype.isClosed = function (){
	return true;
};
AST.LambdaScope = imba$class(function LambdaScope(){
	AST.Scope.apply(this,arguments);
},AST.Scope);
AST.LambdaScope.prototype.context = function (){
	return this._context || (this._context = this.parent().context().reference(this));
};
AST.FlowScope = imba$class(function FlowScope(){
	AST.Scope.apply(this,arguments);
},AST.Scope);
AST.FlowScope.prototype.params = function (){
	return (this._parent) && (this._parent.params());
};
AST.FlowScope.prototype.context = function (){
	return this.parent().context();
};
AST.CatchScope = imba$class(function CatchScope(){
	AST.FlowScope.apply(this,arguments);
},AST.FlowScope);

AST.WhileScope = imba$class(function WhileScope(){
	AST.FlowScope.apply(this,arguments);
},AST.FlowScope);

AST.ForScope = imba$class(function ForScope(){
	AST.FlowScope.apply(this,arguments);
},AST.FlowScope);
AST.Variable = imba$class(function Variable(scope,name,decl,options){
	this._scope = scope;
	this._name = name;
	this._alias = null;
	this._declarator = decl;
	this._autodeclare = false;
	this._declared = true;
	this._resolved = false;
	this._options = options || {};
	this._type = this._options.type || 'var';
	this._references = [];
},AST.Node);

AST.Variable.prototype.__scope = {};
AST.Variable.prototype.scope = function(v){ return this._scope; }
AST.Variable.prototype.setScope = function(v){ this._scope = v; return this; }
;

AST.Variable.prototype.__name = {};
AST.Variable.prototype.name = function(v){ return this._name; }
AST.Variable.prototype.setName = function(v){ this._name = v; return this; }
;

AST.Variable.prototype.__alias = {};
AST.Variable.prototype.alias = function(v){ return this._alias; }
AST.Variable.prototype.setAlias = function(v){ this._alias = v; return this; }
;

AST.Variable.prototype.__type = {};
AST.Variable.prototype.type = function(v){ return this._type; }
AST.Variable.prototype.setType = function(v){ this._type = v; return this; }
;

AST.Variable.prototype.__options = {};
AST.Variable.prototype.options = function(v){ return this._options; }
AST.Variable.prototype.setOptions = function(v){ this._options = v; return this; }
;

AST.Variable.prototype.__declarator = {};
AST.Variable.prototype.declarator = function(v){ return this._declarator; }
AST.Variable.prototype.setDeclarator = function(v){ this._declarator = v; return this; }
;

AST.Variable.prototype.__autodeclare = {};
AST.Variable.prototype.autodeclare = function(v){ return this._autodeclare; }
AST.Variable.prototype.setAutodeclare = function(v){ this._autodeclare = v; return this; }
;

AST.Variable.prototype.__references = {};
AST.Variable.prototype.references = function(v){ return this._references; }
AST.Variable.prototype.setReferences = function(v){ this._references = v; return this; }
;

AST.Variable.prototype.resolve = function (){
	var item;
	if(this._resolved) {
		return this;
	};
	
	this._resolved = true;
	if(item = this.scope().lookup(this.name())) {
		if(item.scope() != this.scope() && this.options().let) {
			this.scope().varmap()[this.name()] = this;
		};
		if(this._options.proxy) {
			true;
		} else {
			var i = 0;
			var orig = this._name;
			while(this.scope().lookup(this._name)){
				this._name = ("" + orig + (i += 1));
			};
		};
	};
	this.scope().varmap()[this.name()] = this;
	return this;
};
AST.Variable.prototype.reference = function (){
	return this;
};
AST.Variable.prototype.free = function (ref){
	this._declarator = null;
	return this;
};
AST.Variable.prototype.reuse = function (ref){
	this._declarator = ref;
	return this;
};
AST.Variable.prototype.proxy = function (par,index){
	this._proxy = [par, index];
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
		this._c = ("" + (this._proxy[0].c()) + "[" + (this._proxy[1].c()) + "]");
	} else {
		this._c = (this.alias() || this.name()).c();
		if(AST.RESERVED_REGEX.test(this._c)) {
			this._c = ("" + this.c() + "$");
		};
	};
	return this._c;
};
AST.Variable.prototype.consume = function (node){
	return this;
};
AST.Variable.prototype.accessor = function (ref){
	var node = new AST.LocalVarAccess(".",null,this);
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
	this._autodeclare = true;
	
	this.scope().vars().push(this);
	this.set({declared: true});
	return this;
};
AST.Variable.prototype.toSymbol = function (){
	return this.name();
};
AST.Variable.prototype.dump = function (typ){
	return {type: this.type(),name: this.name(),refs: this._references.dump(typ)};
};
AST.SystemVariable = imba$class(function SystemVariable(){
	AST.Variable.apply(this,arguments);
},AST.Variable);
AST.SystemVariable.prototype.predeclared = function (){
	this.scope().vars().remove(this);
	return this;
};
AST.SystemVariable.prototype.resolve = function (){
	var alias, v_;
	if(this._resolved || this._name) {
		return this;
	};
	this._resolved = true;
	
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
			names = ['ary__', 'ary_', 'coll', 'array', 'items', 'ary'];
		} else {
			if(typ == 'val') {
				names = ['v_'];
			} else {
				if(typ == 'arguments') {
					names = ['$_', '$0'];
				} else {
					if(typ == 'keypars') {
						names = ['opts', 'options', 'pars'];
					} else {
						if(typ == 'counter') {
							names = ['i__', 'i_', 'k', 'j', 'i'];
						} else {
							if(typ == 'len') {
								names = ['len__', 'len_', 'len'];
							} else {
								if(typ == 'list') {
									names = ['tmplist_', 'tmplist', 'tmp'];
								}
							}
						}
					}
				}
			}
		}
	};
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
	this._name || (this._name = ("$" + ((scope.setCounter(v_=scope.counter() + 1), v_))));
	scope.varmap()[this._name] = this;
	return this;
};
AST.SystemVariable.prototype.name = function (){
	this.resolve();
	return this._name;
};
AST.ScopeContext = imba$class(function ScopeContext(scope,value){
	this._scope = scope;
	this._value = value;
	this;
},AST.Node);

AST.ScopeContext.prototype.__scope = {};
AST.ScopeContext.prototype.scope = function(v){ return this._scope; }
AST.ScopeContext.prototype.setScope = function(v){ this._scope = v; return this; }
;

AST.ScopeContext.prototype.__value = {};
AST.ScopeContext.prototype.value = function(v){ return this._value; }
AST.ScopeContext.prototype.setValue = function(v){ this._value = v; return this; }
;

AST.ScopeContext.prototype.reference = function (){
	return this._reference || (this._reference = this.scope().declare("self",new AST.This()));
};
AST.ScopeContext.prototype.c = function (){
	var val = this._value || this._reference;
	return (val) ? (val.c()) : ("this");
};
AST.RootScopeContext = imba$class(function RootScopeContext(){
	AST.ScopeContext.apply(this,arguments);
},AST.ScopeContext);
AST.RootScopeContext.prototype.reference = function (scope){
	return this;
};
AST.RootScopeContext.prototype.c = function (o){
	return (o && o.explicit) ? (AST.RootScopeContext.prototype.__super.c.apply(this,arguments)) : ("");
};
AST.Super = imba$class(function Super(){
	AST.Node.apply(this,arguments);
},AST.Node);
AST.Super.prototype.c = function (){
	var m = STACK.method();
	var out = null;
	var up = STACK.current();
	var deep = (up instanceof AST.Access);
	if(false && m && m.type() == 'constructor') {
		out = ("" + (m.target().c()) + ".superclass");
		if(!deep) {
			out += (".apply(" + (m.scope().context().c()) + ",arguments)");
		};
	} else {
		out = ("" + (m.target().c()) + ".prototype.__super");
		if(!((up instanceof AST.Access))) {
			out += ("." + (m.supername().c()));
			if(!((up instanceof AST.Call))) {
				out += (".apply(" + (m.scope().context().c()) + ",arguments)");
			};
		};
	};
	return out;
};
}())