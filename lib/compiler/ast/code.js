(function(){
function iter$(a){ return a ? (a.toArray ? a.toArray() : a) : []; }
/*  Code  */;
AST.Code = imba$class(function Code(){
	AST.Node.apply(this,arguments);
},AST.Node);

AST.Code.prototype.__head = {};
AST.Code.prototype.head = function(v){ return this._head; }
AST.Code.prototype.setHead = function(v){ this._head = v; return this; }
;

AST.Code.prototype.__body = {};
AST.Code.prototype.body = function(v){ return this._body; }
AST.Code.prototype.setBody = function(v){ this._body = v; return this; }
;

AST.Code.prototype.__scope = {};
AST.Code.prototype.scope = function(v){ return this._scope; }
AST.Code.prototype.setScope = function(v){ this._scope = v; return this; }
;

AST.Code.prototype.__params = {};
AST.Code.prototype.params = function(v){ return this._params; }
AST.Code.prototype.setParams = function(v){ this._params = v; return this; }
;

AST.Code.prototype.scopetype = function (){
	return AST.Scope;
};
AST.Code.prototype.visit = function (){
	if(this._scope) {
		this._scope.visit();
	};
	return this;
};
AST.Root = imba$class(function Root(body,opts){
	var v_;
	this.setBody(body.block());
	(this.setScope(v_=new AST.FileScope(this,null)), v_);
},AST.Code);
AST.Root.prototype.visit = function (){
	this.scope().visit();
	return this.body().traverse();
};
AST.Root.prototype.compile = function (){
	this.traverse();
	return this.c();
};
AST.Root.prototype.js = function (){
	return '(function(){\n' + this.scope().c() + '\n}())';
};
AST.Root.prototype.analyze = function (){
	this.traverse();
	return this.scope().dump();
};
AST.Root.prototype.inspect = function (){
	return true;
};
AST.ClassDeclaration = imba$class(function ClassDeclaration(name,superclass,body){
	this._name = name;
	this._superclass = superclass;
	this._scope = new AST.ClassScope(this);
	this._body = body.block();
},AST.Code);

AST.ClassDeclaration.prototype.__name = {};
AST.ClassDeclaration.prototype.name = function(v){ return this._name; }
AST.ClassDeclaration.prototype.setName = function(v){ this._name = v; return this; }
;

AST.ClassDeclaration.prototype.__superclass = {};
AST.ClassDeclaration.prototype.superclass = function(v){ return this._superclass; }
AST.ClassDeclaration.prototype.setSuperclass = function(v){ this._superclass = v; return this; }
;

AST.ClassDeclaration.prototype.__initor = {};
AST.ClassDeclaration.prototype.initor = function(v){ return this._initor; }
AST.ClassDeclaration.prototype.setInitor = function(v){ this._initor = v; return this; }
;

AST.ClassDeclaration.prototype.visit = function (){
	var v_;
	this.scope().visit();
	
	if(this.option('local')) {
		(this.setName(v_=this.scope().parent().register(this.name(),this)), v_);
	};
	return this.body().traverse();
};
AST.ClassDeclaration.prototype.js = function (){
	var v_;
	this.scope().context().setValue(this.name());
	if(this.option('extension')) {
		return this.body().c();
	};
	var initor = this.body().pluck(function (c){
		return (c instanceof AST.MethodDeclaration) && c.type() == 'constructor';
	});
	var sup = this.superclass();
	if(idx$(this.name().c(),['String', 'Array', 'Window']) >= 0) {
		initor = false;
	} else {
		if(sup && !initor) {
			initor = AST.inline(("def initialize\n	" + (sup.c()) + ".apply(this,arguments)")).first();
			(initor.setType(v_='constructor'), v_);
		} else {
			initor || (initor = FN([],[AST.SELF]));
		};
	};
	var head = [];
	if(initor) {
		var cname = (this.name() instanceof AST.Access) ? (this.name().right()) : (this.name());
		initor.setName(cname);
		if(this.option('local')) {
			head.push(initor);
			head.push(CALL(AST.CLASSDEF,[this.name(), sup]));
		} else {
			var decl = OP('=',this.name(),CALL(AST.CLASSDEF,[initor, sup]));
			head.push(decl);
		};
		if(this.option('export')) {
			head.push(("exports." + (this.name().c()) + " = " + (this.name().c())));
		};
	};
	for(var i=0, ary=iter$(head.reverse()), len=ary.length; i < len; i++){
		this.body().unshift(ary[i]);
	};
	
	return this.body().c();
};
AST.TagDeclaration = imba$class(function TagDeclaration(name,superclass,body){
	this._name = name;
	this._superclass = superclass;
	this._scope = new AST.TagScope(this);
	this._body = (body || []).block();
},AST.Code);

AST.TagDeclaration.prototype.__name = {};
AST.TagDeclaration.prototype.name = function(v){ return this._name; }
AST.TagDeclaration.prototype.setName = function(v){ this._name = v; return this; }
;

AST.TagDeclaration.prototype.__superclass = {};
AST.TagDeclaration.prototype.superclass = function(v){ return this._superclass; }
AST.TagDeclaration.prototype.setSuperclass = function(v){ this._superclass = v; return this; }
;

AST.TagDeclaration.prototype.__initor = {};
AST.TagDeclaration.prototype.initor = function(v){ return this._initor; }
AST.TagDeclaration.prototype.setInitor = function(v){ this._initor = v; return this; }
;

AST.TagDeclaration.prototype.visit = function (){
	this.scope().visit();
	return this.body().traverse();
};
AST.TagDeclaration.prototype.id = function (){
	return this.name().id();
};
AST.TagDeclaration.prototype.js = function (){
	if(this.option('extension')) {
		this.scope().context().setValue(this.name());
		return this.body().c();
	};
	var sup = this.superclass() && "," + this.superclass().func().quoted() || "";
	
	var out = (this.name().id()) ? (("Imba.defineSingletonTag('" + (this.name().id()) + "',function " + (this.name().func()) + "(d)\{this.setDom(d)\}" + sup + ")")) : (("Imba.defineTag('" + (this.name().func()) + "',function " + (this.name().func()) + "(d)\{this.setDom(d)\}" + sup + ")"));
	if(this.body().count() == 0) {
		return out;
	};
	out = ("var tag = " + out + ";");
	this.scope().context().setValue(new AST.Const('tag'));
	out += ("\n" + (this.body().c()));
	return '(function()' + out.wrap() + ')()';
};
AST.Func = imba$class(function Func(params,body,name,target,options){
	var typ = this.scopetype();
	this._scope || (this._scope = new typ(this));
	this._scope.setParams(this._params = new AST.ParamList(params));
	this._body = body.block();
	this._name = name || '';
	this._target = target;
	this._options = options;
	this._type = 'function';
	this;
},AST.Code);

AST.Func.prototype.__name = {};
AST.Func.prototype.name = function(v){ return this._name; }
AST.Func.prototype.setName = function(v){ this._name = v; return this; }
;

AST.Func.prototype.__params = {};
AST.Func.prototype.params = function(v){ return this._params; }
AST.Func.prototype.setParams = function(v){ this._params = v; return this; }
;

AST.Func.prototype.__target = {};
AST.Func.prototype.target = function(v){ return this._target; }
AST.Func.prototype.setTarget = function(v){ this._target = v; return this; }
;

AST.Func.prototype.__options = {};
AST.Func.prototype.options = function(v){ return this._options; }
AST.Func.prototype.setOptions = function(v){ this._options = v; return this; }
;

AST.Func.prototype.__type = {};
AST.Func.prototype.type = function(v){ return this._type; }
AST.Func.prototype.setType = function(v){ this._type = v; return this; }
;

AST.Func.prototype.__context = {};
AST.Func.prototype.context = function(v){ return this._context; }
AST.Func.prototype.setContext = function(v){ this._context = v; return this; }
;

AST.Func.prototype.scopetype = function (){
	return AST.FunctionScope;
};

AST.Func.prototype.visit = function (){
	this.scope().visit();
	this._context = this.scope().parent();
	this._params.traverse();
	return this._body.traverse();
};
AST.Func.prototype.js = function (o){
	this.body().consume(new AST.ImplicitReturn());
	var code = this.scope().c();
	var name = this.name().c().replace(/\./g,'_');
	var out = ("function " + name + "(" + (this.params().c()) + ")") + code.wrap();
	return out;
};
AST.Func.prototype.shouldParenthesize = function (){
	return (this.up() instanceof AST.Call) && this.up().callee() == this;
};
AST.Lambda = imba$class(function Lambda(){
	AST.Func.apply(this,arguments);
},AST.Func);
AST.Lambda.prototype.scopetype = function (){
	return AST.LambdaScope;
};
AST.MethodDeclaration = imba$class(function MethodDeclaration(){
	AST.Func.apply(this,arguments);
},AST.Func);

AST.MethodDeclaration.prototype.__variable = {};
AST.MethodDeclaration.prototype.variable = function(v){ return this._variable; }
AST.MethodDeclaration.prototype.setVariable = function(v){ this._variable = v; return this; }
;

AST.MethodDeclaration.prototype.scopetype = function (){
	return AST.MethodScope;
};

AST.MethodDeclaration.prototype.visit = function (){
	var v_;
	if(this.name().toSymbol() == 'initialize') {
		(this.setType(v_='constructor'), v_);
	};
	if(this.body().expressions) {
		this.set({greedy: true});
		var tree = new AST.TagTree();
		this._body = this.body().consume(tree);
	};
	this.scope().visit();
	this._context = this.scope().parent();
	this._params.traverse();
	
	if(this.target() instanceof AST.Self) {
		this._target = this._scope.parent().context();
		this.set({static: true});
	};
	if(this.context() instanceof AST.ClassScope) {
		true;
	} else {
		if(!(this._target)) {
			(this.setVariable(v_=this.context().register(this.name(),this,{type: 'meth'})), v_);
		}
	};
	this._target || (this._target = this._scope.parent().context());
	
	this._body.traverse();
	return this;
};
AST.MethodDeclaration.prototype.supername = function (){
	return (this.type() == 'constructor') ? (this.type()) : (this.name());
};
AST.MethodDeclaration.prototype.js = function (){
	if(!(this.type() == 'constructor')) {
		if(this.option('greedy')) {
			this.body().consume(new AST.GreedyReturn());
		} else {
			this.body().consume(new AST.ImplicitReturn());
		};
	};
	var code = this.scope().c();
	
	var name = this.name().c().replace(/\./g,'_');
	var foot = [];
	
	var left = "";
	var func = ("(" + (this.params().c()) + ")") + code.wrap();
	var target = this.target();
	var decl = !this.option('global') && !this.option('export');
	
	if(target instanceof AST.ScopeContext) {
		target = null;
	};
	var ctx = this.context();
	var out = "";
	
	
	
	var fname = this.name().toSymbol();
	var fdecl = fname;
	
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
			out = ("function " + fdecl + func);
		} else {
			if(target && this.option('static')) {
				out = ("" + (target.c()) + "." + fname + " = function " + func);
			} else {
				if(target) {
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
AST.TagFragmentDeclaration = imba$class(function TagFragmentDeclaration(){
	AST.MethodDeclaration.apply(this,arguments);
},AST.MethodDeclaration);


var propTemplate = '${headers}\n${path}.__${getter} = ${options};\n${path}.${getter} = function(v){ return ${get}; }\n${path}.${setter} = function(v){ ${set}; return this; }\n${init}';

var propWatchTemplate = '${headers}\n${path}.__${getter} = ${options};\n${path}.${getter} = function(v){ return ${get}; }\n${path}.${setter} = function(v){\n	var a = this.${getter}();\n	if(v != a) { v = ${set}; }\n	if(v != a) { ${ondirty} }\n	return this;\n}\n${init}';

AST.PropertyDeclaration = imba$class(function PropertyDeclaration(name,options){
	this._name = name;
	this._options = options || new AST.Obj([]);
},AST.Expression);

AST.PropertyDeclaration.prototype.__name = {};
AST.PropertyDeclaration.prototype.name = function(v){ return this._name; }
AST.PropertyDeclaration.prototype.setName = function(v){ this._name = v; return this; }
;

AST.PropertyDeclaration.prototype.__options = {};
AST.PropertyDeclaration.prototype.options = function(v){ return this._options; }
AST.PropertyDeclaration.prototype.setOptions = function(v){ this._options = v; return this; }
;

AST.PropertyDeclaration.prototype.visit = function (){
	this._options.traverse();
	return this;
};
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
	
	var pars = o.hash();
	
	var js = {key: key,getter: key,setter: ("set-" + key).toSymbol(),scope: ("" + (scope.context().c())),path: '${scope}.prototype',set: ("this._" + key + " = v"),get: ("this._" + key),init: "",headers: "",ondirty: ""};
	var tpl = propTemplate;
	
	if(pars.watch) {
		if(!((pars.watch instanceof AST.Bool) && !(pars.watch.truthy()))) {
			tpl = propWatchTemplate;
		};
		var wfn = ("" + key + "DidSet");
		
		if(pars.watch instanceof AST.Symbol) {
			wfn = pars.watch;
		} else {
			if(pars.watch instanceof AST.Bool) {
				(o.key('watch').setValue(v_=new AST.Symbol(("" + key + "DidSet"))), v_);
			}
		};
		var fn = OP('.',new AST.This(),wfn);
		js.ondirty = OP('&&',fn,CALL(fn,['v', 'a', ("this.__" + key)])).c();
	};
	if(o.key('dom') || o.key('attr')) {
		js.set = ("this.setAttribute('" + key + "',v)");
		js.get = ("this.getAttribute('" + key + "')");
	} else {
		if(o.key('delegate')) {
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
	var out = tpl.replace(reg,function (m,a){
		return js[a];
	});
	out = out.replace(reg,function (m,a){
		return js[a];
	});
	return out;
	
	
	return ast.traverse().c();
};
}())