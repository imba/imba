(function(){
function iter$(a){ return a ? (a.toArray ? a.toArray() : a) : []; }
AST.ControlFlow = imba$class(function ControlFlow(){
	AST.Node.apply(this,arguments);
},AST.Node);

AST.ControlFlowStatement = imba$class(function ControlFlowStatement(){
	AST.ControlFlow.apply(this,arguments);
},AST.ControlFlow);
AST.ControlFlowStatement.prototype.isExpressable = function (){
	return false;
};
AST.If = imba$class(function If(cond,body,o){
	if(o === undefined) o = {};
	this._test = ((o.type == 'unless') ? (OP('!',cond)) : (cond));
	this._body = body;
},AST.ControlFlow);

AST.If.prototype.__test = {};
AST.If.prototype.test = function(v){ return this._test; }
AST.If.prototype.setTest = function(v){ this._test = v; return this; }
;

AST.If.prototype.__body = {};
AST.If.prototype.body = function(v){ return this._body; }
AST.If.prototype.setBody = function(v){ this._body = v; return this; }
;

AST.If.prototype.__alt = {};
AST.If.prototype.alt = function(v){ return this._alt; }
AST.If.prototype.setAlt = function(v){ this._alt = v; return this; }
;

AST.If.prototype.addElse = function (add){
	if(this.alt() && (this.alt() instanceof AST.If)) {
		this.alt().addElse(add);
	} else {
		(this.setAlt(add), add);
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
	var cond = this.test().c({expression: true});
	var code = this.body().c();
	
	if(o.isExpression()) {
		if(this.alt()) {
			return ("(" + cond + ") ? (" + code + ") : (" + (this.alt().c()) + ")");
		} else {
			return ("(" + cond + ") && (" + code + ")");
		};
	};
	var out = ("if(" + cond + ") " + (code.wrap()));
	if(this.alt()) {
		out += (" else " + (this.alt().c().wrap()));
	};
	return out;
};
AST.If.prototype.consume = function (node){
	if(node instanceof AST.TagTree) {
		this._body = this.body().consume(node);
		if(this.alt()) {
			this._alt = this.alt().consume(node);
		};
		return this;
	};
	if(this.isExpressable()) {
		this.toExpression();
		return AST.If.prototype.__super.consume.apply(this,arguments);
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
	return exp;
};
AST.Loop = imba$class(function Loop(options){
	if(options === undefined) options = {};
	this.setOptions(options);
	this;
},AST.Statement);

AST.Loop.prototype.__scope = {};
AST.Loop.prototype.scope = function(v){ return this._scope; }
AST.Loop.prototype.setScope = function(v){ this._scope = v; return this; }
;

AST.Loop.prototype.__options = {};
AST.Loop.prototype.options = function(v){ return this._options; }
AST.Loop.prototype.setOptions = function(v){ this._options = v; return this; }
;

AST.Loop.prototype.__body = {};
AST.Loop.prototype.body = function(v){ return this._body; }
AST.Loop.prototype.setBody = function(v){ this._body = v; return this; }
;

AST.Loop.prototype.__catcher = {};
AST.Loop.prototype.catcher = function(v){ return this._catcher; }
AST.Loop.prototype.setCatcher = function(v){ this._catcher = v; return this; }
;

AST.Loop.prototype.set = function (obj){
	this._options || (this._options = {});
	var keys = Object.keys(obj);
	for(var i=0, ary=iter$(keys), len=ary.length, k; i < len; i++){
		k = ary[i];
		this._options[k] = obj[k];
	};
	return this;
};
AST.Loop.prototype.addBody = function (body){
	this.setBody(body.block());
	return this;
};
AST.Loop.prototype.c = function (o){
	if(this.stack().isExpression() || this.isExpression()) {
		var ast = CALL(FN([],[this]),[]);
		return ast.c(o);
	} else {
		if(this.stack().current() instanceof AST.Block) {
			return AST.Loop.prototype.__super.c.call(this,o);
		} else {
			ast = CALL(FN([],[this]),[]);
			return ast.c(o);
		}
	};
};
AST.While = imba$class(function While(test,opts){
	this._test = test;
	this._scope = new AST.WhileScope(this);
	if(opts) {
		this.set(opts);
	};
	if(this.option('invert')) {
		this._test = test.invert();
	};
},AST.Loop);

AST.While.prototype.__test = {};
AST.While.prototype.test = function(v){ return this._test; }
AST.While.prototype.setTest = function(v){ this._test = v; return this; }
;

AST.While.prototype.visit = function (){
	this.scope().visit();
	if(this.test()) {
		this.test().traverse();
	};
	return (this.body()) && (this.body().traverse());
};
AST.While.prototype.consume = function (node){
	if(this.isExpressable()) {
		return AST.While.prototype.__super.consume.apply(this,arguments);
	};
	
	if(node instanceof AST.TagTree) {
		this.scope().context().reference();
		return CALL(FN([],[this]),[]);
	};
	var reuse = false;
	var resvar = this.scope().declare('res',new AST.Arr([]),{system: true});
	this._catcher = new AST.PushAssign("push",resvar,null);
	this.body().consume(this._catcher);
	var ast = BLOCK(this,resvar.accessor());
	return ast.consume(node);
};
AST.While.prototype.js = function (){
	var out = ("while(" + (this.test().c({expression: true})) + ")") + this.body().c().wrap();
	
	if(this.scope().vars().count() > 0) {
		return [this.scope().vars().c(), out];
	};
	return out;
};
AST.For = imba$class(function For(o){
	if(o === undefined) o = {};
	this._options = o;
	this._scope = new AST.ForScope(this);
},AST.Loop);
AST.For.prototype.visit = function (){
	this.scope().visit();
	this.declare();
	this.body().traverse();
	return this.options().source.traverse();
};
AST.For.prototype.declare = function (){
	var src = this.options().source;
	var vars = this.options().vars = {};
	var oi = this.options().index;
	
	if(src instanceof AST.Range) {
		vars.len = this.scope().declare('len',src.right());
		vars.index = this.scope().declare(this.options().name,src.left());
		vars.value = vars.index;
	} else {
		var i = vars.index = (oi) ? (this.scope().declare(oi,0)) : (this.util().counter(0,true).predeclare());
		vars.source = this.util().iterable(src,true).predeclare();
		vars.len = this.util().len(vars.source,true).predeclare();
		vars.value = this.scope().declare(this.options().name,null,{let: true});
		vars.value.addReference(this.options().name);
		if(oi) {
			i.addReference(oi);
		};
	};
	return this;
};
AST.For.prototype.consume = function (node){
	if(this.isExpressable()) {
		return AST.For.prototype.__super.consume.apply(this,arguments);
	};
	if(node instanceof AST.TagTree) {
		this.scope().context().reference();
		return CALL(new AST.Lambda([],[this]),[]);
	};
	var resvar = null;
	var reuseable = (node instanceof AST.Assign) && (node.left().node() instanceof AST.LocalVarAccess);
	if(reuseable) {
		resvar = this.scope().declare(node.left().node().variable(),new AST.Arr([]),{proxy: true});
		node = null;
	} else {
		resvar = this.scope().declare('res',new AST.Arr([]),{system: true});
	};
	this._catcher = new AST.PushAssign("push",resvar,null);
	this.body().consume(this._catcher);
	
	var ast = BLOCK(this,resvar.accessor());
	if(node) {
		ast.consume(node);
	};
	return ast;
};
AST.For.prototype.js = function (){
	var v_;
	var vars = this.options().vars;
	var i = vars.index;
	var val = vars.value;
	var cond = OP('<',i,vars.len);
	var src = this.options().source;
	
	var final = (this.options().step) ? (OP('=',i,OP('+',i,this.options().step))) : (OP('++',i));
	if(src instanceof AST.Range) {
		if(src.inclusive()) {
			(cond.setOp(v_='<='), v_);
		};
	} else {
		if(val.refcount() < 3) {
			val.proxy(vars.source,i);
		} else {
			this.body().unshift(OP('=',val,OP('.',vars.source,i)));
		}
	};
	return ("for(" + (this.scope().vars().c()) + "; " + (cond.c()) + "; " + (final.c()) + ")") + this.body().c().wrap();
};
AST.For.prototype.head = function (){
	var vars = this.options().vars;
	return OP('=',vars.value,OP('.',vars.source,vars.index));
};
AST.ForIn = imba$class(function ForIn(){
	AST.For.apply(this,arguments);
},AST.For);

AST.ForOf = imba$class(function ForOf(){
	AST.For.apply(this,arguments);
},AST.For);
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
		k = vars.key = this.scope().declare(this.options().name,null,{system: true});
	};
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
		if(v.refcount() < 3) {
			v.proxy(o,k);
		} else {
			this.body().unshift(OP('=',v,OP('.',o,k)));
		};
	};
	if(this.options().own) {
		if(k.refcount() < 3) {
			k.proxy(vars.keys,i);
		} else {
			this.body().unshift(OP('=',k,OP('.',vars.keys,i)));
		};
		return ("for(" + (this.scope().vars().c()) + "; " + (OP('<',i,vars.len).c()) + "; " + (OP('++',i).c()) + ")") + this.body().c().wrap();
	};
	var code = this.body().c();
	return [this.scope().vars().c(), ("for(var " + (k.c()) + " in " + (o.c()) + ")") + code.wrap()];
};
AST.ForOf.prototype.head = function (){
	var v = this.options().vars;
	
	return [OP('=',v.key,OP('.',v.keys,v.index)), (v.value) && (OP('=',v.value,OP('.',v.source,v.key)))];
};
AST.Begin = imba$class(function Begin(body){
	this._nodes = body.block().nodes();
},AST.Block);
AST.Begin.prototype.shouldParenthesize = function (){
	return this.isExpression();
};
AST.Switch = imba$class(function Switch(a,b,c){
	this._source = a;
	this._cases = b;
	this._fallback = c;
},AST.ControlFlowStatement);

AST.Switch.prototype.__source = {};
AST.Switch.prototype.source = function(v){ return this._source; }
AST.Switch.prototype.setSource = function(v){ this._source = v; return this; }
;

AST.Switch.prototype.__cases = {};
AST.Switch.prototype.cases = function(v){ return this._cases; }
AST.Switch.prototype.setCases = function(v){ this._cases = v; return this; }
;

AST.Switch.prototype.__fallback = {};
AST.Switch.prototype.fallback = function(v){ return this._fallback; }
AST.Switch.prototype.setFallback = function(v){ this._fallback = v; return this; }
;

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
	
	for(var i=0, ary=iter$(this.cases()), len=ary.length, part; i < len; i++){
		part = ary[i];
		part.autobreak();
		body.push(part);
	};
	if(this.fallback()) {
		body.push("default:\n" + this.fallback().c().indent());
	};
	return ("switch(" + (this.source().c()) + ") ") + body.c().join("\n").wrap();
};
AST.SwitchCase = imba$class(function SwitchCase(test,body){
	this._test = test;
	this._body = body.block();
},AST.ControlFlowStatement);

AST.SwitchCase.prototype.__test = {};
AST.SwitchCase.prototype.test = function(v){ return this._test; }
AST.SwitchCase.prototype.setTest = function(v){ this._test = v; return this; }
;

AST.SwitchCase.prototype.__body = {};
AST.SwitchCase.prototype.body = function(v){ return this._body; }
AST.SwitchCase.prototype.setBody = function(v){ this._body = v; return this; }
;

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
	return cases.join("\n") + "\n" + this.body().c().indent();
};
AST.Try = imba$class(function Try(body,c,f){
	this._body = body.block();
	this._catch = c;
	this._finally = f;
},AST.ControlFlowStatement);

AST.Try.prototype.__body = {};
AST.Try.prototype.body = function(v){ return this._body; }
AST.Try.prototype.setBody = function(v){ this._body = v; return this; }
;
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
};
AST.Try.prototype.js = function (){
	var out = "try " + this.body().c().wrap() + "\n";
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
AST.Catch = imba$class(function Catch(body,varname){
	this._body = body.block();
	this._scope = new AST.CatchScope(this);
	this._varname = varname;
},AST.ControlFlowStatement);
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
	return ("catch (" + (this._variable.c()) + ") ") + this._body.c().wrap() + "\n";
};
AST.Finally = imba$class(function Finally(body){
	this._body = body.block();
},AST.ControlFlowStatement);
AST.Finally.prototype.visit = function (){
	return this._body.traverse();
};
AST.Finally.prototype.consume = function (node){
	return this;
};
AST.Finally.prototype.js = function (){
	return "finally " + this._body.c().wrap();
};
}())