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
		} else if(!(this._target)) {
			(this.setVariable(v_=this.context().register(this.name(),this,{type: 'meth'})),v_);
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
			} else if(this.option('static')) {
				out = ("" + (ctx.context().c()) + "." + fname + " = function " + func);
			} else {
				out = ("" + (ctx.context().c()) + ".prototype." + fname + " = function " + func);
			};
		} else if((ctx instanceof AST.FileScope) && !target) {
			// register method as a root-function, but with auto-call? hmm
			// should probably set using variable directly instead, no?
			out = ("function " + fdecl + func);
		} else if(target && this.option('static')) {
			out = ("" + (target.c()) + "." + fname + " = function " + func);
		} else if(target) {
			// hmm
			out = ("" + (target.c()) + ".prototype." + fname + " = function " + func);
		} else {
			out = ("function " + fdecl + func);
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
			} else if(pars.watch instanceof AST.Bool) {
				(o.key('watch').setValue(v_=new AST.Symbol(("" + key + "DidSet"))),v_);
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
		} else if(o.key('delegate')) {
			// if we have a delegate
			js.set = ("this.__" + key + ".delegate.set(this,'" + key + "',v,this.__" + key + ")");
			js.get = ("this.__" + key + ".delegate.get(this,'" + key + "',this.__" + key + ")");
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