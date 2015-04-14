(function(){
function iter$(a){ return a ? (a.toArray ? a.toArray() : a) : []; }
// externs;


var helpers = require('./helpers');

AST = {};
OP = function (op,left,right,opts){
	if(op == '.') {
		if((typeof right=='string'||right instanceof String)) {
			right = new AST.Identifier(right);
		};
		return new AST.Access(op,left,right);
	} else {
		if(op == '=') {
			if(left instanceof AST.Tuple) {
				return new AST.TupleAssign(op,left,right);
			};
			return new AST.Assign(op,left,right);
		} else {
			return (idx$(op,['?=', '||=', '&&=']) >= 0) ? (new AST.ConditionalAssign(op,left,right)) : ((idx$(op,['=<']) >= 0) ? (new AST.AsyncAssign('=',left,new AST.Await(right))) : ((idx$(op,['+=', '-=', '*=', '/=', '^=', '%=']) >= 0) ? (new AST.CompoundAssign(op,left,right)) : ((op == 'instanceof') ? (new AST.InstanceOf(op,left,right)) : ((op == 'in') ? (new AST.In(op,left,right)) : ((op == 'typeof') ? (new AST.TypeOf(op,left,right)) : ((op == 'delete') ? (new AST.Delete(op,left,right)) : ((idx$(op,['--', '++', '!', '√']) >= 0) ? (new AST.UnaryOp(op,left,right)) : ((idx$(op,['>', '<', '>=', '<=', '==', '===', '!=', '!==']) >= 0) ? (new AST.ComparisonOp(op,left,right)) : ((idx$(op,['∩', '∪']) >= 0) ? (new AST.MathOp(op,left,right)) : ((idx$(op,['..', '...']) >= 0) ? (new AST.Range(op,left,right)) : (new AST.Op(op,left,right))))))))))))
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
		value.setLeft(new AST.Splat(value.left()));
		return value;
	} else {
		return new AST.Splat(value);
	};
};
OP.ASSIGNMENT = ["=", "+=", "-=", "*=", "/=", "%=", "<<=", ">>=", ">>>=", "|=", "^=", "&="];
OP.LOGICAL = ["||", "&&"];
OP.UNARY = ["++", "--"];

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
	return (typ == 'call') && ((pars[0].c() == 'return') && (pars[0] = 'tata'), new AST.Call(pars[0],pars[1],pars[2]));
};
AST.escapeComments = function (str){
	if(!str) {
		return '';
	};
	return str;
};
AST.Indentation = imba$class(function Indentation(a,b){
	this._open = a || 1;
	this._close = b || 1;
	this;
});

AST.Indentation.prototype.__open = {};
AST.Indentation.prototype.open = function(v){ return this._open; }
AST.Indentation.prototype.setOpen = function(v){ this._open = v; return this; }
;

AST.Indentation.prototype.__close = {};
AST.Indentation.prototype.close = function(v){ return this._close; }
AST.Indentation.prototype.setClose = function(v){ this._close = v; return this; }
;

AST.Indentation.prototype.wrap = function (str,o){
	var pre = this._open.pre;
	var post = this._open.post;
	var esc = AST.escapeComments;
	str = esc(post).replace(/^\n/,'') + str;
	str = str.replace(/^/g,"\t").replace(/\n/g,"\n\t").replace(/\n\t$/g,"\n");
	
	str = esc(pre) + '\n' + str;
	if(!(str[str.length - 1] == '\n')) {
		str = str + '\n';
	};
	
	return str;
};
AST.INDENT = new AST.Indentation();

AST.Stack = imba$class(function Stack(){
	this._nodes = [];
	this._scoping = [];
	this._scopes = [];
	this._loglevel = 3;
});

AST.Stack.prototype.__loglevel = {};
AST.Stack.prototype.loglevel = function(v){ return this._loglevel; }
AST.Stack.prototype.setLoglevel = function(v){ this._loglevel = v; return this; }
;

AST.Stack.prototype.__nodes = {};
AST.Stack.prototype.nodes = function(v){ return this._nodes; }
AST.Stack.prototype.setNodes = function(v){ this._nodes = v; return this; }
;

AST.Stack.prototype.__scopes = {};
AST.Stack.prototype.scopes = function(v){ return this._scopes; }
AST.Stack.prototype.setScopes = function(v){ this._scopes = v; return this; }
;

AST.Stack.prototype.addScope = function (scope){
	this._scopes.push(scope);
	return this;
};
AST.Stack.prototype.traverse = function (node){
	return this;
};
AST.Stack.prototype.push = function (node){
	this._nodes.push(node);
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
		if((node instanceof AST.Code) || (node instanceof AST.Loop)) {
			return false;
		};
		if(node.isExpression()) {
			return true;
		};
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
STACK = new AST.Stack();

AST.Node = imba$class(function Node(){
	this;
});

AST.Node.prototype.__o = {};
AST.Node.prototype.o = function(v){ return this._o; }
AST.Node.prototype.setO = function(v){ this._o = v; return this; }
;

AST.Node.prototype.__options = {};
AST.Node.prototype.options = function(v){ return this._options; }
AST.Node.prototype.setOptions = function(v){ this._options = v; return this; }
;

AST.Node.prototype.__traversed = {};
AST.Node.prototype.traversed = function(v){ return this._traversed; }
AST.Node.prototype.setTraversed = function(v){ this._traversed = v; return this; }
;

AST.Node.prototype.__statement = {};
AST.Node.prototype.statement = function(v){ return this._statement; }
AST.Node.prototype.setStatement = function(v){ this._statement = v; return this; }
;

AST.Node.prototype.safechain = function (){
	return false;
};
AST.Node.prototype.dom = function (){
	var name = "ast_" + this.constructor.name.replace(/([a-z])([A-Z])/g,"$1_$2").toLowerCase();
	if(Imba.TAGS[name]) {
		var node = Imba.tag(name);
		node.bind(this).build();
		return node;
	} else {
		return ("[" + name + "]");
	};
};
AST.Node.prototype.p = function (){
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
AST.Node.prototype.consume = function (node){
	if(node instanceof AST.PushAssign) {
		return new AST.PushAssign(node.op(),node.left(),this);
	};
	if(node instanceof AST.Assign) {
		return OP(node.op(),node.left(),this);
	} else {
		if(node instanceof AST.Op) {
			return OP(node.op(),node.left(),this);
		} else {
			if(node instanceof AST.Return) {
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
	var node = new AST.ExpressionBlock([this]);
	return node.addExpression(expr);
};
AST.Node.prototype.addComment = function (comment){
	this._comment = comment;
	return this;
};
AST.Node.prototype.indented = function (a,b){
	if(b instanceof Array) {
		this.add(b[0]);
		b = b[1];
	};
	this._indented = [a, b];
	this._indentation || (this._indentation = (a && b) ? (new AST.Indentation(a,b)) : (AST.INDENT));
	return this;
};
AST.Node.prototype.prebreak = function (term){
	if(term === undefined) term = '\n';
	console.log("prebreak!!!!");
	this._prebreak = this._prebreak || term;
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
	return this;
};
AST.Node.prototype.cachevar = function (){
	return this._cache && this._cache.var;
};
AST.Node.prototype.decache = function (){
	if(this._cache) {
		this.cachevar().free();
		this._cache = null;
	};
	return this;
};
AST.Node.prototype.predeclare = function (){
	if(this._cache) {
		this.scope__().vars().swap(this._cache.var,this);
	};
	return this;
};
AST.Node.prototype.alias = function (){
	return null;
};
AST.Node.prototype.warn = function (text,opts){
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
		};
		return this._cache.var.c();
	};
	STACK.push(this);
	if(o && o.expression) {
		this.forceExpression();
	};
	
	if(o && o.indent) {
		this._indentation || (this._indentation = AST.INDENT);
	};
	var out = this.js(STACK,o);
	
	var paren = this.shouldParenthesize();
	
	if(indent = this._indentation) {
		out = indent.wrap(out,o);
	};
	if(paren) {
		if(out instanceof Array) {
			out = ("(" + out + ")");
		} else {
			out = out.parenthesize();
		};
	};
	if(o && o.braces) {
		out = '{' + out + '}';
	};
	STACK.pop(this);
	
	if(this._cache) {
		if(!(this._cache.manual)) {
			out = ("" + (this._cache.var.c()) + "=" + out);
		};
		var par = STACK.current();
		if((par instanceof AST.Access) || (par instanceof AST.Op)) {
			out = out.parenthesize();
		};
		this._cache.cached = true;
	};
	if(this._temporary && this._temporary.length) {
		this._temporary.map(function (temp){
			return temp.decache();
		});
	};
	return out;
};
AST.Expression = imba$class(function Expression(){
	AST.Node.apply(this,arguments);
},AST.Node);

AST.ValueNode = imba$class(function ValueNode(value){
	this._value = this.load(value);
},AST.Node);

AST.ValueNode.prototype.__value = {};
AST.ValueNode.prototype.value = function(v){ return this._value; }
AST.ValueNode.prototype.setValue = function(v){ this._value = v; return this; }
;

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
AST.Statement = imba$class(function Statement(){
	AST.ValueNode.apply(this,arguments);
},AST.ValueNode);
AST.Statement.prototype.isExpressable = function (){
	return false;
};
AST.Statement.prototype.statement = function (){
	return true;
};
AST.Meta = imba$class(function Meta(){
	AST.ValueNode.apply(this,arguments);
},AST.ValueNode);

AST.Comment = imba$class(function Comment(){
	AST.Meta.apply(this,arguments);
},AST.Meta);
AST.Comment.prototype.c = function (o){
	return (o && o.expression || this._value.match(/\n/)) ? (("/*" + (this.value().c()) + "*/")) : (("// " + (this.value().c())));
};
AST.Terminator = imba$class(function Terminator(){
	AST.Meta.apply(this,arguments);
},AST.Meta);
AST.Terminator.prototype.c = function (){
	return this._value;
	return this.v();
};
AST.Newline = imba$class(function Newline(v){
	this._value = v || '\n';
},AST.Terminator);
AST.Newline.prototype.c = function (){
	return this._value;
};
AST.Index = imba$class(function Index(){
	AST.ValueNode.apply(this,arguments);
},AST.ValueNode);
AST.Index.prototype.js = function (){
	return this._value.c();
};
AST.NewLines = imba$class(function NewLines(){
	AST.ValueNode.apply(this,arguments);
},AST.ValueNode);
AST.NewLines.prototype.js = function (){
	return this._value;
};
AST.NewLines.prototype.isExpressable = function (){
	return true;
};
AST.ListNode = imba$class(function ListNode(list,options){
	if(list === undefined) list = [];
	if(options === undefined) options = {};
	this._nodes = this.load(list);
	this._options = options;
},AST.Node);

AST.ListNode.prototype.__nodes = {};
AST.ListNode.prototype.nodes = function(v){ return this._nodes; }
AST.ListNode.prototype.setNodes = function(v){ this._nodes = v; return this; }
;

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
AST.ListNode.prototype.slice = function (a,b){
	return new this.constructor(this._nodes.slice(a,b));
};
AST.ListNode.prototype.add = function (item){
	this.push(item);
	return this;
};
AST.ListNode.prototype.break = function (br,pre){
	if(pre === undefined) pre = false;
	if(typeof br == 'string') {
		br = new AST.Terminator(br);
	};
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
	if(!pars||pars.constructor !== Object) pars = {};
	var delim = pars.delim !== undefined ? pars.delim : this.delimiter();
	var indent = pars.indent !== undefined ? pars.indent : this._indentation;
	var nodes = pars.nodes !== undefined ? pars.nodes : this.nodes();
	var express = delim != ';';
	var shouldDelim = false;
	var nodes = nodes.compact();
	var last = this.last();
	var realLast = nodes[nodes.length - 1];
	
	var parts = nodes.map(function (arg){
		var out = arg.c({expression: express});
		
		if(arg instanceof AST.Meta) {
			true;
		} else {
			if(!express || arg != last) {
				out = out + delim;
			};
		};
		return out;
	});
	return parts.join("");
};
AST.ArgList = imba$class(function ArgList(){
	AST.ListNode.apply(this,arguments);
},AST.ListNode);
AST.ArgList.prototype.hasSplat = function (){
	return this.list().some(function (v){
		return v instanceof AST.Splat;
	});
};
AST.ArgList.prototype.delimiter = function (){
	return ",";
};
AST.AssignList = imba$class(function AssignList(){
	AST.ArgList.apply(this,arguments);
},AST.ArgList);
AST.AssignList.prototype.concat = function (other){
	if(this._nodes.length == 0 && (other instanceof AST.AssignList)) {
		return other;
	} else {
		AST.AssignList.prototype.__super.concat.apply(this,arguments);
	};
	return this;
};
AST.Block = imba$class(function Block(expr){
	var v_;
	if(expr === undefined) expr = [];
	(this.setNodes(v_=expr.flatten().compact() || []), v_);
},AST.ListNode);

AST.Block.prototype.__head = {};
AST.Block.prototype.head = function(v){ return this._head; }
AST.Block.prototype.setHead = function(v){ this._head = v; return this; }
;

AST.Block.wrap = function (ary){
	return (ary.length == 1 && (ary[0] instanceof AST.Block)) ? (ary[0]) : (new AST.Block(ary));
};
AST.Block.prototype.visit = function (){
	if(this._prebreak) {
		console.log("PREBREAK IN AST.BLOCK SHOULD THROW");
		this.first() && this.first().prebreak(this._prebreak);
	};
	return AST.Block.prototype.__super.visit.apply(this,arguments);
};
AST.Block.prototype.push = function (item,sep){
	this.nodes().push(item);
	return this;
};
AST.Block.prototype.block = function (){
	return this;
};
AST.Block.prototype.loc = function (){
	var opt, a, b;
	return (opt = this.option('ends')) ? (a = opt[0].loc(), b = opt[1].loc(), (!a) && (this.p(("no loc for " + (opt[0])))), (!b) && (this.p(("no loc for " + (opt[1])))), [a[0], b[1]]) : ([0, 0]);
};
AST.Block.prototype.unwrap = function (){
	var ary = [];
	for(var i=0, items=iter$(this.nodes()), len=items.length, node; i < len; i++){
		node = items[i];
		if(node instanceof AST.Block) {
			ary.push.apply(ary,node.unwrap());
		} else {
			ary.push(node);
		};
	};
	return ary;
};
AST.Block.prototype.compile = function (o){
	if(o === undefined) o = {};
	var root = new AST.Root(this,o);
	return root.compile(o);
};
AST.Block.prototype.analyze = function (o){
	if(o === undefined) o = {};
	return this;
};
AST.Block.prototype.js = function (o,opts){
	var $1;
	var l = this.nodes().length;
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
	
	if(express) {
		return AST.Block.prototype.__super.js.call(this,o,{delim: ',',nodes: ast});
	};
	var compile = function (node,i){
		var out = (node) ? (node.c()) : ("");
		if(out == "") {
			return null;
		};
		if(out instanceof Array) {
			out = out.flatten().compact().filter(filter).join(";\n");
		};
		var hasSemiColon = out.match(/;(\s*\/\/.*)?[\n\s\t]*$/);
		
		if(!(hasSemiColon || (node instanceof AST.Meta))) {
			out += ";";
		};
		return out;
	};
	ast = ast.map(compile);
	if(this._head) {
		var prefix = [];
		this._head.forEach(function (item){
			var out = compile(item);
			return (out) && (prefix.push(out + '\n'));
		});
		ast = prefix.concat(ast);
	};
	return ast = ast.compact().filter(filter).join("");
};
AST.Block.prototype.defers = function (original,replacement){
	var idx = this.nodes().indexOf(original);
	if(idx >= 0) {
		this.nodes()[idx] = replacement;
	};
	replacement._prebreak || (replacement._prebreak = original._prebreak);
	var rest = this.nodes().splice(idx + 1);
	return rest;
};
AST.Block.prototype.consume = function (node){
	var v_, before;
	if(node instanceof AST.TagTree) {
		this.setNodes(this.nodes().map(function (child){
			return child.consume(node);
		}));
		if(this.nodes().length > 1) {
			(this.setNodes(v_=[new AST.Arr(this.nodes())]), v_);
		};
		return this;
	};
	if(before = this.last()) {
		var after = before.consume(node);
		if(after != before) {
			this.replace(before,after);
		};
	};
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
	return this.option('express') || AST.Block.prototype.__super.isExpression.call(this);
};
AST.VarBlock = imba$class(function VarBlock(){
	AST.ListNode.apply(this,arguments);
},AST.ListNode);
AST.VarBlock.prototype.addExpression = function (expr){
	if(expr instanceof AST.Assign) {
		this.addExpression(expr.left());
		return new AST.TupleAssign('=',new AST.Tuple(this.nodes()),expr.right());
	} else {
		if(expr instanceof AST.VarOrAccess) {
			this.push(new AST.VarReference(expr.value()));
		} else {
			if((expr instanceof AST.Splat) && (expr.node() instanceof AST.VarOrAccess)) {
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
	return this;
};
AST.Parens = imba$class(function Parens(){
	AST.ValueNode.apply(this,arguments);
},AST.ValueNode);
AST.Parens.prototype.js = function (o){
	var par = this.up();
	
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
	if(this._noparen) {
		return false;
	};
	return true;
};
AST.Parens.prototype.prebreak = function (br){
	var $1;
	AST.Parens.prototype.__super.prebreak.call(this,br);
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
AST.ExpressionBlock = imba$class(function ExpressionBlock(){
	AST.ListNode.apply(this,arguments);
},AST.ListNode);
AST.ExpressionBlock.prototype.visit = function (){
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
	if(expr.node() instanceof AST.Assign) {
		this.push(expr.left());
		return new AST.TupleAssign('=',new AST.Tuple(this.nodes()),expr.right());
	} else {
		this.push(expr);
	};
	return this;
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
	return (typ == 'call') && ((pars[0].c() == 'return') && (pars[0] = 'tata'), new AST.Call(pars[0],pars[1],pars[2]));
};
AST.escapeComments = function (str){
	if(!str) {
		return '';
	};
	return str;
};
AST.Indentation = imba$class(function Indentation(a,b){
	this._open = a || 1;
	this._close = b || 1;
	this;
});

AST.Indentation.prototype.__open = {};
AST.Indentation.prototype.open = function(v){ return this._open; }
AST.Indentation.prototype.setOpen = function(v){ this._open = v; return this; }
;

AST.Indentation.prototype.__close = {};
AST.Indentation.prototype.close = function(v){ return this._close; }
AST.Indentation.prototype.setClose = function(v){ this._close = v; return this; }
;

AST.Indentation.prototype.wrap = function (str,o){
	var pre = this._open.pre;
	var post = this._open.post;
	var esc = AST.escapeComments;
	str = esc(post).replace(/^\n/,'') + str;
	str = str.replace(/^/g,"\t").replace(/\n/g,"\n\t").replace(/\n\t$/g,"\n");
	
	str = esc(pre) + '\n' + str;
	if(!(str[str.length - 1] == '\n')) {
		str = str + '\n';
	};
	
	return str;
};
AST.INDENT = new AST.Indentation();

AST.Stack = imba$class(function Stack(){
	this._nodes = [];
	this._scoping = [];
	this._scopes = [];
	this._loglevel = 3;
});

AST.Stack.prototype.__loglevel = {};
AST.Stack.prototype.loglevel = function(v){ return this._loglevel; }
AST.Stack.prototype.setLoglevel = function(v){ this._loglevel = v; return this; }
;

AST.Stack.prototype.__nodes = {};
AST.Stack.prototype.nodes = function(v){ return this._nodes; }
AST.Stack.prototype.setNodes = function(v){ this._nodes = v; return this; }
;

AST.Stack.prototype.__scopes = {};
AST.Stack.prototype.scopes = function(v){ return this._scopes; }
AST.Stack.prototype.setScopes = function(v){ this._scopes = v; return this; }
;

AST.Stack.prototype.addScope = function (scope){
	this._scopes.push(scope);
	return this;
};
AST.Stack.prototype.traverse = function (node){
	return this;
};
AST.Stack.prototype.push = function (node){
	this._nodes.push(node);
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
		if((node instanceof AST.Code) || (node instanceof AST.Loop)) {
			return false;
		};
		if(node.isExpression()) {
			return true;
		};
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
STACK = new AST.Stack();

AST.Node = imba$class(function Node(){
	this;
});

AST.Node.prototype.__o = {};
AST.Node.prototype.o = function(v){ return this._o; }
AST.Node.prototype.setO = function(v){ this._o = v; return this; }
;

AST.Node.prototype.__options = {};
AST.Node.prototype.options = function(v){ return this._options; }
AST.Node.prototype.setOptions = function(v){ this._options = v; return this; }
;

AST.Node.prototype.__traversed = {};
AST.Node.prototype.traversed = function(v){ return this._traversed; }
AST.Node.prototype.setTraversed = function(v){ this._traversed = v; return this; }
;

AST.Node.prototype.__statement = {};
AST.Node.prototype.statement = function(v){ return this._statement; }
AST.Node.prototype.setStatement = function(v){ this._statement = v; return this; }
;

AST.Node.prototype.safechain = function (){
	return false;
};
AST.Node.prototype.dom = function (){
	var name = "ast_" + this.constructor.name.replace(/([a-z])([A-Z])/g,"$1_$2").toLowerCase();
	if(Imba.TAGS[name]) {
		var node = Imba.tag(name);
		node.bind(this).build();
		return node;
	} else {
		return ("[" + name + "]");
	};
};
AST.Node.prototype.p = function (){
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
AST.Node.prototype.consume = function (node){
	if(node instanceof AST.PushAssign) {
		return new AST.PushAssign(node.op(),node.left(),this);
	};
	if(node instanceof AST.Assign) {
		return OP(node.op(),node.left(),this);
	} else {
		if(node instanceof AST.Op) {
			return OP(node.op(),node.left(),this);
		} else {
			if(node instanceof AST.Return) {
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
	var node = new AST.ExpressionBlock([this]);
	return node.addExpression(expr);
};
AST.Node.prototype.addComment = function (comment){
	this._comment = comment;
	return this;
};
AST.Node.prototype.indented = function (a,b){
	if(b instanceof Array) {
		this.add(b[0]);
		b = b[1];
	};
	this._indented = [a, b];
	this._indentation || (this._indentation = (a && b) ? (new AST.Indentation(a,b)) : (AST.INDENT));
	return this;
};
AST.Node.prototype.prebreak = function (term){
	if(term === undefined) term = '\n';
	console.log("prebreak!!!!");
	this._prebreak = this._prebreak || term;
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
	return this;
};
AST.Node.prototype.cachevar = function (){
	return this._cache && this._cache.var;
};
AST.Node.prototype.decache = function (){
	if(this._cache) {
		this.cachevar().free();
		this._cache = null;
	};
	return this;
};
AST.Node.prototype.predeclare = function (){
	if(this._cache) {
		this.scope__().vars().swap(this._cache.var,this);
	};
	return this;
};
AST.Node.prototype.alias = function (){
	return null;
};
AST.Node.prototype.warn = function (text,opts){
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
		};
		return this._cache.var.c();
	};
	STACK.push(this);
	if(o && o.expression) {
		this.forceExpression();
	};
	
	if(o && o.indent) {
		this._indentation || (this._indentation = AST.INDENT);
	};
	var out = this.js(STACK,o);
	
	var paren = this.shouldParenthesize();
	
	if(indent = this._indentation) {
		out = indent.wrap(out,o);
	};
	if(paren) {
		if(out instanceof Array) {
			out = ("(" + out + ")");
		} else {
			out = out.parenthesize();
		};
	};
	if(o && o.braces) {
		out = '{' + out + '}';
	};
	STACK.pop(this);
	
	if(this._cache) {
		if(!(this._cache.manual)) {
			out = ("" + (this._cache.var.c()) + "=" + out);
		};
		var par = STACK.current();
		if((par instanceof AST.Access) || (par instanceof AST.Op)) {
			out = out.parenthesize();
		};
		this._cache.cached = true;
	};
	if(this._temporary && this._temporary.length) {
		this._temporary.map(function (temp){
			return temp.decache();
		});
	};
	return out;
};
AST.Expression = imba$class(function Expression(){
	AST.Node.apply(this,arguments);
},AST.Node);

AST.ValueNode = imba$class(function ValueNode(value){
	this._value = this.load(value);
},AST.Node);

AST.ValueNode.prototype.__value = {};
AST.ValueNode.prototype.value = function(v){ return this._value; }
AST.ValueNode.prototype.setValue = function(v){ this._value = v; return this; }
;

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
AST.Statement = imba$class(function Statement(){
	AST.ValueNode.apply(this,arguments);
},AST.ValueNode);
AST.Statement.prototype.isExpressable = function (){
	return false;
};
AST.Statement.prototype.statement = function (){
	return true;
};
AST.Meta = imba$class(function Meta(){
	AST.ValueNode.apply(this,arguments);
},AST.ValueNode);

AST.Comment = imba$class(function Comment(){
	AST.Meta.apply(this,arguments);
},AST.Meta);
AST.Comment.prototype.c = function (o){
	return (o && o.expression || this._value.match(/\n/)) ? (("/*" + (this.value().c()) + "*/")) : (("// " + (this.value().c())));
};
AST.Terminator = imba$class(function Terminator(){
	AST.Meta.apply(this,arguments);
},AST.Meta);
AST.Terminator.prototype.c = function (){
	return this._value;
	return this.v();
};
AST.Newline = imba$class(function Newline(v){
	this._value = v || '\n';
},AST.Terminator);
AST.Newline.prototype.c = function (){
	return this._value;
};
AST.Index = imba$class(function Index(){
	AST.ValueNode.apply(this,arguments);
},AST.ValueNode);
AST.Index.prototype.js = function (){
	return this._value.c();
};
AST.NewLines = imba$class(function NewLines(){
	AST.ValueNode.apply(this,arguments);
},AST.ValueNode);
AST.NewLines.prototype.js = function (){
	return this._value;
};
AST.NewLines.prototype.isExpressable = function (){
	return true;
};
AST.ListNode = imba$class(function ListNode(list,options){
	if(list === undefined) list = [];
	if(options === undefined) options = {};
	this._nodes = this.load(list);
	this._options = options;
},AST.Node);

AST.ListNode.prototype.__nodes = {};
AST.ListNode.prototype.nodes = function(v){ return this._nodes; }
AST.ListNode.prototype.setNodes = function(v){ this._nodes = v; return this; }
;

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
AST.ListNode.prototype.slice = function (a,b){
	return new this.constructor(this._nodes.slice(a,b));
};
AST.ListNode.prototype.add = function (item){
	this.push(item);
	return this;
};
AST.ListNode.prototype.break = function (br,pre){
	if(pre === undefined) pre = false;
	if(typeof br == 'string') {
		br = new AST.Terminator(br);
	};
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
	if(!pars||pars.constructor !== Object) pars = {};
	var delim = pars.delim !== undefined ? pars.delim : this.delimiter();
	var indent = pars.indent !== undefined ? pars.indent : this._indentation;
	var nodes = pars.nodes !== undefined ? pars.nodes : this.nodes();
	var express = delim != ';';
	var shouldDelim = false;
	var nodes = nodes.compact();
	var last = this.last();
	var realLast = nodes[nodes.length - 1];
	
	var parts = nodes.map(function (arg){
		var out = arg.c({expression: express});
		
		if(arg instanceof AST.Meta) {
			true;
		} else {
			if(!express || arg != last) {
				out = out + delim;
			};
		};
		return out;
	});
	return parts.join("");
};
AST.ArgList = imba$class(function ArgList(){
	AST.ListNode.apply(this,arguments);
},AST.ListNode);
AST.ArgList.prototype.hasSplat = function (){
	return this.list().some(function (v){
		return v instanceof AST.Splat;
	});
};
AST.ArgList.prototype.delimiter = function (){
	return ",";
};
AST.AssignList = imba$class(function AssignList(){
	AST.ArgList.apply(this,arguments);
},AST.ArgList);
AST.AssignList.prototype.concat = function (other){
	if(this._nodes.length == 0 && (other instanceof AST.AssignList)) {
		return other;
	} else {
		AST.AssignList.prototype.__super.concat.apply(this,arguments);
	};
	return this;
};
AST.Block = imba$class(function Block(expr){
	var v_;
	if(expr === undefined) expr = [];
	(this.setNodes(v_=expr.flatten().compact() || []), v_);
},AST.ListNode);

AST.Block.prototype.__head = {};
AST.Block.prototype.head = function(v){ return this._head; }
AST.Block.prototype.setHead = function(v){ this._head = v; return this; }
;

AST.Block.wrap = function (ary){
	return (ary.length == 1 && (ary[0] instanceof AST.Block)) ? (ary[0]) : (new AST.Block(ary));
};
AST.Block.prototype.visit = function (){
	if(this._prebreak) {
		console.log("PREBREAK IN AST.BLOCK SHOULD THROW");
		this.first() && this.first().prebreak(this._prebreak);
	};
	return AST.Block.prototype.__super.visit.apply(this,arguments);
};
AST.Block.prototype.push = function (item,sep){
	this.nodes().push(item);
	return this;
};
AST.Block.prototype.block = function (){
	return this;
};
AST.Block.prototype.loc = function (){
	var opt, a, b;
	return (opt = this.option('ends')) ? (a = opt[0].loc(), b = opt[1].loc(), (!a) && (this.p(("no loc for " + (opt[0])))), (!b) && (this.p(("no loc for " + (opt[1])))), [a[0], b[1]]) : ([0, 0]);
};
AST.Block.prototype.unwrap = function (){
	var ary = [];
	for(var i=0, items=iter$(this.nodes()), len=items.length, node; i < len; i++){
		node = items[i];
		if(node instanceof AST.Block) {
			ary.push.apply(ary,node.unwrap());
		} else {
			ary.push(node);
		};
	};
	return ary;
};
AST.Block.prototype.compile = function (o){
	if(o === undefined) o = {};
	var root = new AST.Root(this,o);
	return root.compile(o);
};
AST.Block.prototype.analyze = function (o){
	if(o === undefined) o = {};
	return this;
};
AST.Block.prototype.js = function (o,opts){
	var $1;
	var l = this.nodes().length;
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
	
	if(express) {
		return AST.Block.prototype.__super.js.call(this,o,{delim: ',',nodes: ast});
	};
	var compile = function (node,i){
		var out = (node) ? (node.c()) : ("");
		if(out == "") {
			return null;
		};
		if(out instanceof Array) {
			out = out.flatten().compact().filter(filter).join(";\n");
		};
		var hasSemiColon = out.match(/;(\s*\/\/.*)?[\n\s\t]*$/);
		
		if(!(hasSemiColon || (node instanceof AST.Meta))) {
			out += ";";
		};
		return out;
	};
	ast = ast.map(compile);
	if(this._head) {
		var prefix = [];
		this._head.forEach(function (item){
			var out = compile(item);
			return (out) && (prefix.push(out + '\n'));
		});
		ast = prefix.concat(ast);
	};
	return ast = ast.compact().filter(filter).join("");
};
AST.Block.prototype.defers = function (original,replacement){
	var idx = this.nodes().indexOf(original);
	if(idx >= 0) {
		this.nodes()[idx] = replacement;
	};
	replacement._prebreak || (replacement._prebreak = original._prebreak);
	var rest = this.nodes().splice(idx + 1);
	return rest;
};
AST.Block.prototype.consume = function (node){
	var v_, before;
	if(node instanceof AST.TagTree) {
		this.setNodes(this.nodes().map(function (child){
			return child.consume(node);
		}));
		if(this.nodes().length > 1) {
			(this.setNodes(v_=[new AST.Arr(this.nodes())]), v_);
		};
		return this;
	};
	if(before = this.last()) {
		var after = before.consume(node);
		if(after != before) {
			this.replace(before,after);
		};
	};
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
	return this.option('express') || AST.Block.prototype.__super.isExpression.call(this);
};
AST.VarBlock = imba$class(function VarBlock(){
	AST.ListNode.apply(this,arguments);
},AST.ListNode);
AST.VarBlock.prototype.addExpression = function (expr){
	if(expr instanceof AST.Assign) {
		this.addExpression(expr.left());
		return new AST.TupleAssign('=',new AST.Tuple(this.nodes()),expr.right());
	} else {
		if(expr instanceof AST.VarOrAccess) {
			this.push(new AST.VarReference(expr.value()));
		} else {
			if((expr instanceof AST.Splat) && (expr.node() instanceof AST.VarOrAccess)) {
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
	return this;
};
AST.Parens = imba$class(function Parens(){
	AST.ValueNode.apply(this,arguments);
},AST.ValueNode);
AST.Parens.prototype.js = function (o){
	var par = this.up();
	
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
	if(this._noparen) {
		return false;
	};
	return true;
};
AST.Parens.prototype.prebreak = function (br){
	var $1;
	AST.Parens.prototype.__super.prebreak.call(this,br);
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
AST.ExpressionBlock = imba$class(function ExpressionBlock(){
	AST.ListNode.apply(this,arguments);
},AST.ListNode);
AST.ExpressionBlock.prototype.visit = function (){
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
	if(expr.node() instanceof AST.Assign) {
		this.push(expr.left());
		return new AST.TupleAssign('=',new AST.Tuple(this.nodes()),expr.right());
	} else {
		this.push(expr);
	};
	return this;
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
	return (typ == 'call') && ((pars[0].c() == 'return') && (pars[0] = 'tata'), new AST.Call(pars[0],pars[1],pars[2]));
};
AST.escapeComments = function (str){
	if(!str) {
		return '';
	};
	return str;
};
AST.Indentation = imba$class(function Indentation(a,b){
	this._open = a || 1;
	this._close = b || 1;
	this;
});

AST.Indentation.prototype.__open = {};
AST.Indentation.prototype.open = function(v){ return this._open; }
AST.Indentation.prototype.setOpen = function(v){ this._open = v; return this; }
;

AST.Indentation.prototype.__close = {};
AST.Indentation.prototype.close = function(v){ return this._close; }
AST.Indentation.prototype.setClose = function(v){ this._close = v; return this; }
;

AST.Indentation.prototype.wrap = function (str,o){
	var pre = this._open.pre;
	var post = this._open.post;
	var esc = AST.escapeComments;
	str = esc(post).replace(/^\n/,'') + str;
	str = str.replace(/^/g,"\t").replace(/\n/g,"\n\t").replace(/\n\t$/g,"\n");
	
	str = esc(pre) + '\n' + str;
	if(!(str[str.length - 1] == '\n')) {
		str = str + '\n';
	};
	
	return str;
};
AST.INDENT = new AST.Indentation();

AST.Stack = imba$class(function Stack(){
	this._nodes = [];
	this._scoping = [];
	this._scopes = [];
	this._loglevel = 3;
});

AST.Stack.prototype.__loglevel = {};
AST.Stack.prototype.loglevel = function(v){ return this._loglevel; }
AST.Stack.prototype.setLoglevel = function(v){ this._loglevel = v; return this; }
;

AST.Stack.prototype.__nodes = {};
AST.Stack.prototype.nodes = function(v){ return this._nodes; }
AST.Stack.prototype.setNodes = function(v){ this._nodes = v; return this; }
;

AST.Stack.prototype.__scopes = {};
AST.Stack.prototype.scopes = function(v){ return this._scopes; }
AST.Stack.prototype.setScopes = function(v){ this._scopes = v; return this; }
;

AST.Stack.prototype.addScope = function (scope){
	this._scopes.push(scope);
	return this;
};
AST.Stack.prototype.traverse = function (node){
	return this;
};
AST.Stack.prototype.push = function (node){
	this._nodes.push(node);
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
		if((node instanceof AST.Code) || (node instanceof AST.Loop)) {
			return false;
		};
		if(node.isExpression()) {
			return true;
		};
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
STACK = new AST.Stack();

AST.Node = imba$class(function Node(){
	this;
});

AST.Node.prototype.__o = {};
AST.Node.prototype.o = function(v){ return this._o; }
AST.Node.prototype.setO = function(v){ this._o = v; return this; }
;

AST.Node.prototype.__options = {};
AST.Node.prototype.options = function(v){ return this._options; }
AST.Node.prototype.setOptions = function(v){ this._options = v; return this; }
;

AST.Node.prototype.__traversed = {};
AST.Node.prototype.traversed = function(v){ return this._traversed; }
AST.Node.prototype.setTraversed = function(v){ this._traversed = v; return this; }
;

AST.Node.prototype.__statement = {};
AST.Node.prototype.statement = function(v){ return this._statement; }
AST.Node.prototype.setStatement = function(v){ this._statement = v; return this; }
;

AST.Node.prototype.safechain = function (){
	return false;
};
AST.Node.prototype.dom = function (){
	var name = "ast_" + this.constructor.name.replace(/([a-z])([A-Z])/g,"$1_$2").toLowerCase();
	if(Imba.TAGS[name]) {
		var node = Imba.tag(name);
		node.bind(this).build();
		return node;
	} else {
		return ("[" + name + "]");
	};
};
AST.Node.prototype.p = function (){
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
AST.Node.prototype.consume = function (node){
	if(node instanceof AST.PushAssign) {
		return new AST.PushAssign(node.op(),node.left(),this);
	};
	if(node instanceof AST.Assign) {
		return OP(node.op(),node.left(),this);
	} else {
		if(node instanceof AST.Op) {
			return OP(node.op(),node.left(),this);
		} else {
			if(node instanceof AST.Return) {
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
	var node = new AST.ExpressionBlock([this]);
	return node.addExpression(expr);
};
AST.Node.prototype.addComment = function (comment){
	this._comment = comment;
	return this;
};
AST.Node.prototype.indented = function (a,b){
	if(b instanceof Array) {
		this.add(b[0]);
		b = b[1];
	};
	this._indented = [a, b];
	this._indentation || (this._indentation = (a && b) ? (new AST.Indentation(a,b)) : (AST.INDENT));
	return this;
};
AST.Node.prototype.prebreak = function (term){
	if(term === undefined) term = '\n';
	console.log("prebreak!!!!");
	this._prebreak = this._prebreak || term;
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
	return this;
};
AST.Node.prototype.cachevar = function (){
	return this._cache && this._cache.var;
};
AST.Node.prototype.decache = function (){
	if(this._cache) {
		this.cachevar().free();
		this._cache = null;
	};
	return this;
};
AST.Node.prototype.predeclare = function (){
	if(this._cache) {
		this.scope__().vars().swap(this._cache.var,this);
	};
	return this;
};
AST.Node.prototype.alias = function (){
	return null;
};
AST.Node.prototype.warn = function (text,opts){
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
		};
		return this._cache.var.c();
	};
	STACK.push(this);
	if(o && o.expression) {
		this.forceExpression();
	};
	
	if(o && o.indent) {
		this._indentation || (this._indentation = AST.INDENT);
	};
	var out = this.js(STACK,o);
	
	var paren = this.shouldParenthesize();
	
	if(indent = this._indentation) {
		out = indent.wrap(out,o);
	};
	if(paren) {
		if(out instanceof Array) {
			out = ("(" + out + ")");
		} else {
			out = out.parenthesize();
		};
	};
	if(o && o.braces) {
		out = '{' + out + '}';
	};
	STACK.pop(this);
	
	if(this._cache) {
		if(!(this._cache.manual)) {
			out = ("" + (this._cache.var.c()) + "=" + out);
		};
		var par = STACK.current();
		if((par instanceof AST.Access) || (par instanceof AST.Op)) {
			out = out.parenthesize();
		};
		this._cache.cached = true;
	};
	if(this._temporary && this._temporary.length) {
		this._temporary.map(function (temp){
			return temp.decache();
		});
	};
	return out;
};
AST.Expression = imba$class(function Expression(){
	AST.Node.apply(this,arguments);
},AST.Node);

AST.ValueNode = imba$class(function ValueNode(value){
	this._value = this.load(value);
},AST.Node);

AST.ValueNode.prototype.__value = {};
AST.ValueNode.prototype.value = function(v){ return this._value; }
AST.ValueNode.prototype.setValue = function(v){ this._value = v; return this; }
;

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
AST.Statement = imba$class(function Statement(){
	AST.ValueNode.apply(this,arguments);
},AST.ValueNode);
AST.Statement.prototype.isExpressable = function (){
	return false;
};
AST.Statement.prototype.statement = function (){
	return true;
};
AST.Meta = imba$class(function Meta(){
	AST.ValueNode.apply(this,arguments);
},AST.ValueNode);

AST.Comment = imba$class(function Comment(){
	AST.Meta.apply(this,arguments);
},AST.Meta);
AST.Comment.prototype.c = function (o){
	return (o && o.expression || this._value.match(/\n/)) ? (("/*" + (this.value().c()) + "*/")) : (("// " + (this.value().c())));
};
AST.Terminator = imba$class(function Terminator(){
	AST.Meta.apply(this,arguments);
},AST.Meta);
AST.Terminator.prototype.c = function (){
	return this._value;
	return this.v();
};
AST.Newline = imba$class(function Newline(v){
	this._value = v || '\n';
},AST.Terminator);
AST.Newline.prototype.c = function (){
	return this._value;
};
AST.Index = imba$class(function Index(){
	AST.ValueNode.apply(this,arguments);
},AST.ValueNode);
AST.Index.prototype.js = function (){
	return this._value.c();
};
AST.NewLines = imba$class(function NewLines(){
	AST.ValueNode.apply(this,arguments);
},AST.ValueNode);
AST.NewLines.prototype.js = function (){
	return this._value;
};
AST.NewLines.prototype.isExpressable = function (){
	return true;
};
AST.ListNode = imba$class(function ListNode(list,options){
	if(list === undefined) list = [];
	if(options === undefined) options = {};
	this._nodes = this.load(list);
	this._options = options;
},AST.Node);

AST.ListNode.prototype.__nodes = {};
AST.ListNode.prototype.nodes = function(v){ return this._nodes; }
AST.ListNode.prototype.setNodes = function(v){ this._nodes = v; return this; }
;

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
AST.ListNode.prototype.slice = function (a,b){
	return new this.constructor(this._nodes.slice(a,b));
};
AST.ListNode.prototype.add = function (item){
	this.push(item);
	return this;
};
AST.ListNode.prototype.break = function (br,pre){
	if(pre === undefined) pre = false;
	if(typeof br == 'string') {
		br = new AST.Terminator(br);
	};
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
	if(!pars||pars.constructor !== Object) pars = {};
	var delim = pars.delim !== undefined ? pars.delim : this.delimiter();
	var indent = pars.indent !== undefined ? pars.indent : this._indentation;
	var nodes = pars.nodes !== undefined ? pars.nodes : this.nodes();
	var express = delim != ';';
	var shouldDelim = false;
	var nodes = nodes.compact();
	var last = this.last();
	var realLast = nodes[nodes.length - 1];
	
	var parts = nodes.map(function (arg){
		var out = arg.c({expression: express});
		
		if(arg instanceof AST.Meta) {
			true;
		} else {
			if(!express || arg != last) {
				out = out + delim;
			};
		};
		return out;
	});
	return parts.join("");
};
AST.ArgList = imba$class(function ArgList(){
	AST.ListNode.apply(this,arguments);
},AST.ListNode);
AST.ArgList.prototype.hasSplat = function (){
	return this.list().some(function (v){
		return v instanceof AST.Splat;
	});
};
AST.ArgList.prototype.delimiter = function (){
	return ",";
};
AST.AssignList = imba$class(function AssignList(){
	AST.ArgList.apply(this,arguments);
},AST.ArgList);
AST.AssignList.prototype.concat = function (other){
	if(this._nodes.length == 0 && (other instanceof AST.AssignList)) {
		return other;
	} else {
		AST.AssignList.prototype.__super.concat.apply(this,arguments);
	};
	return this;
};
AST.Block = imba$class(function Block(expr){
	var v_;
	if(expr === undefined) expr = [];
	(this.setNodes(v_=expr.flatten().compact() || []), v_);
},AST.ListNode);

AST.Block.prototype.__head = {};
AST.Block.prototype.head = function(v){ return this._head; }
AST.Block.prototype.setHead = function(v){ this._head = v; return this; }
;

AST.Block.wrap = function (ary){
	return (ary.length == 1 && (ary[0] instanceof AST.Block)) ? (ary[0]) : (new AST.Block(ary));
};
AST.Block.prototype.visit = function (){
	if(this._prebreak) {
		console.log("PREBREAK IN AST.BLOCK SHOULD THROW");
		this.first() && this.first().prebreak(this._prebreak);
	};
	return AST.Block.prototype.__super.visit.apply(this,arguments);
};
AST.Block.prototype.push = function (item,sep){
	this.nodes().push(item);
	return this;
};
AST.Block.prototype.block = function (){
	return this;
};
AST.Block.prototype.loc = function (){
	var opt, a, b;
	return (opt = this.option('ends')) ? (a = opt[0].loc(), b = opt[1].loc(), (!a) && (this.p(("no loc for " + (opt[0])))), (!b) && (this.p(("no loc for " + (opt[1])))), [a[0], b[1]]) : ([0, 0]);
};
AST.Block.prototype.unwrap = function (){
	var ary = [];
	for(var i=0, items=iter$(this.nodes()), len=items.length, node; i < len; i++){
		node = items[i];
		if(node instanceof AST.Block) {
			ary.push.apply(ary,node.unwrap());
		} else {
			ary.push(node);
		};
	};
	return ary;
};
AST.Block.prototype.compile = function (o){
	if(o === undefined) o = {};
	var root = new AST.Root(this,o);
	return root.compile(o);
};
AST.Block.prototype.analyze = function (o){
	if(o === undefined) o = {};
	return this;
};
AST.Block.prototype.js = function (o,opts){
	var $1;
	var l = this.nodes().length;
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
	
	if(express) {
		return AST.Block.prototype.__super.js.call(this,o,{delim: ',',nodes: ast});
	};
	var compile = function (node,i){
		var out = (node) ? (node.c()) : ("");
		if(out == "") {
			return null;
		};
		if(out instanceof Array) {
			out = out.flatten().compact().filter(filter).join(";\n");
		};
		var hasSemiColon = out.match(/;(\s*\/\/.*)?[\n\s\t]*$/);
		
		if(!(hasSemiColon || (node instanceof AST.Meta))) {
			out += ";";
		};
		return out;
	};
	ast = ast.map(compile);
	if(this._head) {
		var prefix = [];
		this._head.forEach(function (item){
			var out = compile(item);
			return (out) && (prefix.push(out + '\n'));
		});
		ast = prefix.concat(ast);
	};
	return ast = ast.compact().filter(filter).join("");
};
AST.Block.prototype.defers = function (original,replacement){
	var idx = this.nodes().indexOf(original);
	if(idx >= 0) {
		this.nodes()[idx] = replacement;
	};
	replacement._prebreak || (replacement._prebreak = original._prebreak);
	var rest = this.nodes().splice(idx + 1);
	return rest;
};
AST.Block.prototype.consume = function (node){
	var v_, before;
	if(node instanceof AST.TagTree) {
		this.setNodes(this.nodes().map(function (child){
			return child.consume(node);
		}));
		if(this.nodes().length > 1) {
			(this.setNodes(v_=[new AST.Arr(this.nodes())]), v_);
		};
		return this;
	};
	if(before = this.last()) {
		var after = before.consume(node);
		if(after != before) {
			this.replace(before,after);
		};
	};
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
	return this.option('express') || AST.Block.prototype.__super.isExpression.call(this);
};
AST.VarBlock = imba$class(function VarBlock(){
	AST.ListNode.apply(this,arguments);
},AST.ListNode);
AST.VarBlock.prototype.addExpression = function (expr){
	if(expr instanceof AST.Assign) {
		this.addExpression(expr.left());
		return new AST.TupleAssign('=',new AST.Tuple(this.nodes()),expr.right());
	} else {
		if(expr instanceof AST.VarOrAccess) {
			this.push(new AST.VarReference(expr.value()));
		} else {
			if((expr instanceof AST.Splat) && (expr.node() instanceof AST.VarOrAccess)) {
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
	return this;
};
AST.Parens = imba$class(function Parens(){
	AST.ValueNode.apply(this,arguments);
},AST.ValueNode);
AST.Parens.prototype.js = function (o){
	var par = this.up();
	
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
	if(this._noparen) {
		return false;
	};
	return true;
};
AST.Parens.prototype.prebreak = function (br){
	var $1;
	AST.Parens.prototype.__super.prebreak.call(this,br);
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
AST.ExpressionBlock = imba$class(function ExpressionBlock(){
	AST.ListNode.apply(this,arguments);
},AST.ListNode);
AST.ExpressionBlock.prototype.visit = function (){
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
	if(expr.node() instanceof AST.Assign) {
		this.push(expr.left());
		return new AST.TupleAssign('=',new AST.Tuple(this.nodes()),expr.right());
	} else {
		this.push(expr);
	};
	return this;
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
	return (typ == 'call') && ((pars[0].c() == 'return') && (pars[0] = 'tata'), new AST.Call(pars[0],pars[1],pars[2]));
};
AST.escapeComments = function (str){
	if(!str) {
		return '';
	};
	return str;
};
AST.Indentation = imba$class(function Indentation(a,b){
	this._open = a || 1;
	this._close = b || 1;
	this;
});

AST.Indentation.prototype.__open = {};
AST.Indentation.prototype.open = function(v){ return this._open; }
AST.Indentation.prototype.setOpen = function(v){ this._open = v; return this; }
;

AST.Indentation.prototype.__close = {};
AST.Indentation.prototype.close = function(v){ return this._close; }
AST.Indentation.prototype.setClose = function(v){ this._close = v; return this; }
;

AST.Indentation.prototype.wrap = function (str,o){
	var pre = this._open.pre;
	var post = this._open.post;
	var esc = AST.escapeComments;
	str = esc(post).replace(/^\n/,'') + str;
	str = str.replace(/^/g,"\t").replace(/\n/g,"\n\t").replace(/\n\t$/g,"\n");
	
	str = esc(pre) + '\n' + str;
	if(!(str[str.length - 1] == '\n')) {
		str = str + '\n';
	};
	
	return str;
};
AST.INDENT = new AST.Indentation();

AST.Stack = imba$class(function Stack(){
	this._nodes = [];
	this._scoping = [];
	this._scopes = [];
	this._loglevel = 3;
});

AST.Stack.prototype.__loglevel = {};
AST.Stack.prototype.loglevel = function(v){ return this._loglevel; }
AST.Stack.prototype.setLoglevel = function(v){ this._loglevel = v; return this; }
;

AST.Stack.prototype.__nodes = {};
AST.Stack.prototype.nodes = function(v){ return this._nodes; }
AST.Stack.prototype.setNodes = function(v){ this._nodes = v; return this; }
;

AST.Stack.prototype.__scopes = {};
AST.Stack.prototype.scopes = function(v){ return this._scopes; }
AST.Stack.prototype.setScopes = function(v){ this._scopes = v; return this; }
;

AST.Stack.prototype.addScope = function (scope){
	this._scopes.push(scope);
	return this;
};
AST.Stack.prototype.traverse = function (node){
	return this;
};
AST.Stack.prototype.push = function (node){
	this._nodes.push(node);
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
		if((node instanceof AST.Code) || (node instanceof AST.Loop)) {
			return false;
		};
		if(node.isExpression()) {
			return true;
		};
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
STACK = new AST.Stack();

AST.Node = imba$class(function Node(){
	this;
});

AST.Node.prototype.__o = {};
AST.Node.prototype.o = function(v){ return this._o; }
AST.Node.prototype.setO = function(v){ this._o = v; return this; }
;

AST.Node.prototype.__options = {};
AST.Node.prototype.options = function(v){ return this._options; }
AST.Node.prototype.setOptions = function(v){ this._options = v; return this; }
;

AST.Node.prototype.__traversed = {};
AST.Node.prototype.traversed = function(v){ return this._traversed; }
AST.Node.prototype.setTraversed = function(v){ this._traversed = v; return this; }
;

AST.Node.prototype.__statement = {};
AST.Node.prototype.statement = function(v){ return this._statement; }
AST.Node.prototype.setStatement = function(v){ this._statement = v; return this; }
;

AST.Node.prototype.safechain = function (){
	return false;
};
AST.Node.prototype.dom = function (){
	var name = "ast_" + this.constructor.name.replace(/([a-z])([A-Z])/g,"$1_$2").toLowerCase();
	if(Imba.TAGS[name]) {
		var node = Imba.tag(name);
		node.bind(this).build();
		return node;
	} else {
		return ("[" + name + "]");
	};
};
AST.Node.prototype.p = function (){
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
AST.Node.prototype.consume = function (node){
	if(node instanceof AST.PushAssign) {
		return new AST.PushAssign(node.op(),node.left(),this);
	};
	if(node instanceof AST.Assign) {
		return OP(node.op(),node.left(),this);
	} else {
		if(node instanceof AST.Op) {
			return OP(node.op(),node.left(),this);
		} else {
			if(node instanceof AST.Return) {
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
	var node = new AST.ExpressionBlock([this]);
	return node.addExpression(expr);
};
AST.Node.prototype.addComment = function (comment){
	this._comment = comment;
	return this;
};
AST.Node.prototype.indented = function (a,b){
	if(b instanceof Array) {
		this.add(b[0]);
		b = b[1];
	};
	this._indented = [a, b];
	this._indentation || (this._indentation = (a && b) ? (new AST.Indentation(a,b)) : (AST.INDENT));
	return this;
};
AST.Node.prototype.prebreak = function (term){
	if(term === undefined) term = '\n';
	console.log("prebreak!!!!");
	this._prebreak = this._prebreak || term;
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
	return this;
};
AST.Node.prototype.cachevar = function (){
	return this._cache && this._cache.var;
};
AST.Node.prototype.decache = function (){
	if(this._cache) {
		this.cachevar().free();
		this._cache = null;
	};
	return this;
};
AST.Node.prototype.predeclare = function (){
	if(this._cache) {
		this.scope__().vars().swap(this._cache.var,this);
	};
	return this;
};
AST.Node.prototype.alias = function (){
	return null;
};
AST.Node.prototype.warn = function (text,opts){
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
		};
		return this._cache.var.c();
	};
	STACK.push(this);
	if(o && o.expression) {
		this.forceExpression();
	};
	
	if(o && o.indent) {
		this._indentation || (this._indentation = AST.INDENT);
	};
	var out = this.js(STACK,o);
	
	var paren = this.shouldParenthesize();
	
	if(indent = this._indentation) {
		out = indent.wrap(out,o);
	};
	if(paren) {
		if(out instanceof Array) {
			out = ("(" + out + ")");
		} else {
			out = out.parenthesize();
		};
	};
	if(o && o.braces) {
		out = '{' + out + '}';
	};
	STACK.pop(this);
	
	if(this._cache) {
		if(!(this._cache.manual)) {
			out = ("" + (this._cache.var.c()) + "=" + out);
		};
		var par = STACK.current();
		if((par instanceof AST.Access) || (par instanceof AST.Op)) {
			out = out.parenthesize();
		};
		this._cache.cached = true;
	};
	if(this._temporary && this._temporary.length) {
		this._temporary.map(function (temp){
			return temp.decache();
		});
	};
	return out;
};
AST.Expression = imba$class(function Expression(){
	AST.Node.apply(this,arguments);
},AST.Node);

AST.ValueNode = imba$class(function ValueNode(value){
	this._value = this.load(value);
},AST.Node);

AST.ValueNode.prototype.__value = {};
AST.ValueNode.prototype.value = function(v){ return this._value; }
AST.ValueNode.prototype.setValue = function(v){ this._value = v; return this; }
;

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
AST.Statement = imba$class(function Statement(){
	AST.ValueNode.apply(this,arguments);
},AST.ValueNode);
AST.Statement.prototype.isExpressable = function (){
	return false;
};
AST.Statement.prototype.statement = function (){
	return true;
};
AST.Meta = imba$class(function Meta(){
	AST.ValueNode.apply(this,arguments);
},AST.ValueNode);

AST.Comment = imba$class(function Comment(){
	AST.Meta.apply(this,arguments);
},AST.Meta);
AST.Comment.prototype.c = function (o){
	return (o && o.expression || this._value.match(/\n/)) ? (("/*" + (this.value().c()) + "*/")) : (("// " + (this.value().c())));
};
AST.Terminator = imba$class(function Terminator(){
	AST.Meta.apply(this,arguments);
},AST.Meta);
AST.Terminator.prototype.c = function (){
	return this._value;
	return this.v();
};
AST.Newline = imba$class(function Newline(v){
	this._value = v || '\n';
},AST.Terminator);
AST.Newline.prototype.c = function (){
	return this._value;
};
AST.Index = imba$class(function Index(){
	AST.ValueNode.apply(this,arguments);
},AST.ValueNode);
AST.Index.prototype.js = function (){
	return this._value.c();
};
AST.NewLines = imba$class(function NewLines(){
	AST.ValueNode.apply(this,arguments);
},AST.ValueNode);
AST.NewLines.prototype.js = function (){
	return this._value;
};
AST.NewLines.prototype.isExpressable = function (){
	return true;
};
AST.ListNode = imba$class(function ListNode(list,options){
	if(list === undefined) list = [];
	if(options === undefined) options = {};
	this._nodes = this.load(list);
	this._options = options;
},AST.Node);

AST.ListNode.prototype.__nodes = {};
AST.ListNode.prototype.nodes = function(v){ return this._nodes; }
AST.ListNode.prototype.setNodes = function(v){ this._nodes = v; return this; }
;

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
AST.ListNode.prototype.slice = function (a,b){
	return new this.constructor(this._nodes.slice(a,b));
};
AST.ListNode.prototype.add = function (item){
	this.push(item);
	return this;
};
AST.ListNode.prototype.break = function (br,pre){
	if(pre === undefined) pre = false;
	if(typeof br == 'string') {
		br = new AST.Terminator(br);
	};
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
	if(!pars||pars.constructor !== Object) pars = {};
	var delim = pars.delim !== undefined ? pars.delim : this.delimiter();
	var indent = pars.indent !== undefined ? pars.indent : this._indentation;
	var nodes = pars.nodes !== undefined ? pars.nodes : this.nodes();
	var express = delim != ';';
	var shouldDelim = false;
	var nodes = nodes.compact();
	var last = this.last();
	var realLast = nodes[nodes.length - 1];
	
	var parts = nodes.map(function (arg){
		var out = arg.c({expression: express});
		
		if(arg instanceof AST.Meta) {
			true;
		} else {
			if(!express || arg != last) {
				out = out + delim;
			};
		};
		return out;
	});
	return parts.join("");
};
AST.ArgList = imba$class(function ArgList(){
	AST.ListNode.apply(this,arguments);
},AST.ListNode);
AST.ArgList.prototype.hasSplat = function (){
	return this.list().some(function (v){
		return v instanceof AST.Splat;
	});
};
AST.ArgList.prototype.delimiter = function (){
	return ",";
};
AST.AssignList = imba$class(function AssignList(){
	AST.ArgList.apply(this,arguments);
},AST.ArgList);
AST.AssignList.prototype.concat = function (other){
	if(this._nodes.length == 0 && (other instanceof AST.AssignList)) {
		return other;
	} else {
		AST.AssignList.prototype.__super.concat.apply(this,arguments);
	};
	return this;
};
AST.Block = imba$class(function Block(expr){
	var v_;
	if(expr === undefined) expr = [];
	(this.setNodes(v_=expr.flatten().compact() || []), v_);
},AST.ListNode);

AST.Block.prototype.__head = {};
AST.Block.prototype.head = function(v){ return this._head; }
AST.Block.prototype.setHead = function(v){ this._head = v; return this; }
;

AST.Block.wrap = function (ary){
	return (ary.length == 1 && (ary[0] instanceof AST.Block)) ? (ary[0]) : (new AST.Block(ary));
};
AST.Block.prototype.visit = function (){
	if(this._prebreak) {
		console.log("PREBREAK IN AST.BLOCK SHOULD THROW");
		this.first() && this.first().prebreak(this._prebreak);
	};
	return AST.Block.prototype.__super.visit.apply(this,arguments);
};
AST.Block.prototype.push = function (item,sep){
	this.nodes().push(item);
	return this;
};
AST.Block.prototype.block = function (){
	return this;
};
AST.Block.prototype.loc = function (){
	var opt, a, b;
	return (opt = this.option('ends')) ? (a = opt[0].loc(), b = opt[1].loc(), (!a) && (this.p(("no loc for " + (opt[0])))), (!b) && (this.p(("no loc for " + (opt[1])))), [a[0], b[1]]) : ([0, 0]);
};
AST.Block.prototype.unwrap = function (){
	var ary = [];
	for(var i=0, items=iter$(this.nodes()), len=items.length, node; i < len; i++){
		node = items[i];
		if(node instanceof AST.Block) {
			ary.push.apply(ary,node.unwrap());
		} else {
			ary.push(node);
		};
	};
	return ary;
};
AST.Block.prototype.compile = function (o){
	if(o === undefined) o = {};
	var root = new AST.Root(this,o);
	return root.compile(o);
};
AST.Block.prototype.analyze = function (o){
	if(o === undefined) o = {};
	return this;
};
AST.Block.prototype.js = function (o,opts){
	var $1;
	var l = this.nodes().length;
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
	
	if(express) {
		return AST.Block.prototype.__super.js.call(this,o,{delim: ',',nodes: ast});
	};
	var compile = function (node,i){
		var out = (node) ? (node.c()) : ("");
		if(out == "") {
			return null;
		};
		if(out instanceof Array) {
			out = out.flatten().compact().filter(filter).join(";\n");
		};
		var hasSemiColon = out.match(/;(\s*\/\/.*)?[\n\s\t]*$/);
		
		if(!(hasSemiColon || (node instanceof AST.Meta))) {
			out += ";";
		};
		return out;
	};
	ast = ast.map(compile);
	if(this._head) {
		var prefix = [];
		this._head.forEach(function (item){
			var out = compile(item);
			return (out) && (prefix.push(out + '\n'));
		});
		ast = prefix.concat(ast);
	};
	return ast = ast.compact().filter(filter).join("");
};
AST.Block.prototype.defers = function (original,replacement){
	var idx = this.nodes().indexOf(original);
	if(idx >= 0) {
		this.nodes()[idx] = replacement;
	};
	replacement._prebreak || (replacement._prebreak = original._prebreak);
	var rest = this.nodes().splice(idx + 1);
	return rest;
};
AST.Block.prototype.consume = function (node){
	var v_, before;
	if(node instanceof AST.TagTree) {
		this.setNodes(this.nodes().map(function (child){
			return child.consume(node);
		}));
		if(this.nodes().length > 1) {
			(this.setNodes(v_=[new AST.Arr(this.nodes())]), v_);
		};
		return this;
	};
	if(before = this.last()) {
		var after = before.consume(node);
		if(after != before) {
			this.replace(before,after);
		};
	};
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
	return this.option('express') || AST.Block.prototype.__super.isExpression.call(this);
};
AST.VarBlock = imba$class(function VarBlock(){
	AST.ListNode.apply(this,arguments);
},AST.ListNode);
AST.VarBlock.prototype.addExpression = function (expr){
	if(expr instanceof AST.Assign) {
		this.addExpression(expr.left());
		return new AST.TupleAssign('=',new AST.Tuple(this.nodes()),expr.right());
	} else {
		if(expr instanceof AST.VarOrAccess) {
			this.push(new AST.VarReference(expr.value()));
		} else {
			if((expr instanceof AST.Splat) && (expr.node() instanceof AST.VarOrAccess)) {
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
	return this;
};
AST.Parens = imba$class(function Parens(){
	AST.ValueNode.apply(this,arguments);
},AST.ValueNode);
AST.Parens.prototype.js = function (o){
	var par = this.up();
	
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
	if(this._noparen) {
		return false;
	};
	return true;
};
AST.Parens.prototype.prebreak = function (br){
	var $1;
	AST.Parens.prototype.__super.prebreak.call(this,br);
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
AST.ExpressionBlock = imba$class(function ExpressionBlock(){
	AST.ListNode.apply(this,arguments);
},AST.ListNode);
AST.ExpressionBlock.prototype.visit = function (){
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
	if(expr.node() instanceof AST.Assign) {
		this.push(expr.left());
		return new AST.TupleAssign('=',new AST.Tuple(this.nodes()),expr.right());
	} else {
		this.push(expr);
	};
	return this;
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
	return (typ == 'call') && ((pars[0].c() == 'return') && (pars[0] = 'tata'), new AST.Call(pars[0],pars[1],pars[2]));
};
AST.escapeComments = function (str){
	if(!str) {
		return '';
	};
	return str;
};
AST.Indentation = imba$class(function Indentation(a,b){
	this._open = a || 1;
	this._close = b || 1;
	this;
});

AST.Indentation.prototype.__open = {};
AST.Indentation.prototype.open = function(v){ return this._open; }
AST.Indentation.prototype.setOpen = function(v){ this._open = v; return this; }
;

AST.Indentation.prototype.__close = {};
AST.Indentation.prototype.close = function(v){ return this._close; }
AST.Indentation.prototype.setClose = function(v){ this._close = v; return this; }
;

AST.Indentation.prototype.wrap = function (str,o){
	var pre = this._open.pre;
	var post = this._open.post;
	var esc = AST.escapeComments;
	str = esc(post).replace(/^\n/,'') + str;
	str = str.replace(/^/g,"\t").replace(/\n/g,"\n\t").replace(/\n\t$/g,"\n");
	
	str = esc(pre) + '\n' + str;
	if(!(str[str.length - 1] == '\n')) {
		str = str + '\n';
	};
	
	return str;
};
AST.INDENT = new AST.Indentation();

AST.Stack = imba$class(function Stack(){
	this._nodes = [];
	this._scoping = [];
	this._scopes = [];
	this._loglevel = 3;
});

AST.Stack.prototype.__loglevel = {};
AST.Stack.prototype.loglevel = function(v){ return this._loglevel; }
AST.Stack.prototype.setLoglevel = function(v){ this._loglevel = v; return this; }
;

AST.Stack.prototype.__nodes = {};
AST.Stack.prototype.nodes = function(v){ return this._nodes; }
AST.Stack.prototype.setNodes = function(v){ this._nodes = v; return this; }
;

AST.Stack.prototype.__scopes = {};
AST.Stack.prototype.scopes = function(v){ return this._scopes; }
AST.Stack.prototype.setScopes = function(v){ this._scopes = v; return this; }
;

AST.Stack.prototype.addScope = function (scope){
	this._scopes.push(scope);
	return this;
};
AST.Stack.prototype.traverse = function (node){
	return this;
};
AST.Stack.prototype.push = function (node){
	this._nodes.push(node);
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
		if((node instanceof AST.Code) || (node instanceof AST.Loop)) {
			return false;
		};
		if(node.isExpression()) {
			return true;
		};
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
STACK = new AST.Stack();

AST.Node = imba$class(function Node(){
	this;
});

AST.Node.prototype.__o = {};
AST.Node.prototype.o = function(v){ return this._o; }
AST.Node.prototype.setO = function(v){ this._o = v; return this; }
;

AST.Node.prototype.__options = {};
AST.Node.prototype.options = function(v){ return this._options; }
AST.Node.prototype.setOptions = function(v){ this._options = v; return this; }
;

AST.Node.prototype.__traversed = {};
AST.Node.prototype.traversed = function(v){ return this._traversed; }
AST.Node.prototype.setTraversed = function(v){ this._traversed = v; return this; }
;

AST.Node.prototype.__statement = {};
AST.Node.prototype.statement = function(v){ return this._statement; }
AST.Node.prototype.setStatement = function(v){ this._statement = v; return this; }
;

AST.Node.prototype.safechain = function (){
	return false;
};
AST.Node.prototype.dom = function (){
	var name = "ast_" + this.constructor.name.replace(/([a-z])([A-Z])/g,"$1_$2").toLowerCase();
	if(Imba.TAGS[name]) {
		var node = Imba.tag(name);
		node.bind(this).build();
		return node;
	} else {
		return ("[" + name + "]");
	};
};
AST.Node.prototype.p = function (){
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
AST.Node.prototype.consume = function (node){
	if(node instanceof AST.PushAssign) {
		return new AST.PushAssign(node.op(),node.left(),this);
	};
	if(node instanceof AST.Assign) {
		return OP(node.op(),node.left(),this);
	} else {
		if(node instanceof AST.Op) {
			return OP(node.op(),node.left(),this);
		} else {
			if(node instanceof AST.Return) {
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
	var node = new AST.ExpressionBlock([this]);
	return node.addExpression(expr);
};
AST.Node.prototype.addComment = function (comment){
	this._comment = comment;
	return this;
};
AST.Node.prototype.indented = function (a,b){
	if(b instanceof Array) {
		this.add(b[0]);
		b = b[1];
	};
	this._indented = [a, b];
	this._indentation || (this._indentation = (a && b) ? (new AST.Indentation(a,b)) : (AST.INDENT));
	return this;
};
AST.Node.prototype.prebreak = function (term){
	if(term === undefined) term = '\n';
	console.log("prebreak!!!!");
	this._prebreak = this._prebreak || term;
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
	return this;
};
AST.Node.prototype.cachevar = function (){
	return this._cache && this._cache.var;
};
AST.Node.prototype.decache = function (){
	if(this._cache) {
		this.cachevar().free();
		this._cache = null;
	};
	return this;
};
AST.Node.prototype.predeclare = function (){
	if(this._cache) {
		this.scope__().vars().swap(this._cache.var,this);
	};
	return this;
};
AST.Node.prototype.alias = function (){
	return null;
};
AST.Node.prototype.warn = function (text,opts){
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
		};
		return this._cache.var.c();
	};
	STACK.push(this);
	if(o && o.expression) {
		this.forceExpression();
	};
	
	if(o && o.indent) {
		this._indentation || (this._indentation = AST.INDENT);
	};
	var out = this.js(STACK,o);
	
	var paren = this.shouldParenthesize();
	
	if(indent = this._indentation) {
		out = indent.wrap(out,o);
	};
	if(paren) {
		if(out instanceof Array) {
			out = ("(" + out + ")");
		} else {
			out = out.parenthesize();
		};
	};
	if(o && o.braces) {
		out = '{' + out + '}';
	};
	STACK.pop(this);
	
	if(this._cache) {
		if(!(this._cache.manual)) {
			out = ("" + (this._cache.var.c()) + "=" + out);
		};
		var par = STACK.current();
		if((par instanceof AST.Access) || (par instanceof AST.Op)) {
			out = out.parenthesize();
		};
		this._cache.cached = true;
	};
	if(this._temporary && this._temporary.length) {
		this._temporary.map(function (temp){
			return temp.decache();
		});
	};
	return out;
};
AST.Expression = imba$class(function Expression(){
	AST.Node.apply(this,arguments);
},AST.Node);

AST.ValueNode = imba$class(function ValueNode(value){
	this._value = this.load(value);
},AST.Node);

AST.ValueNode.prototype.__value = {};
AST.ValueNode.prototype.value = function(v){ return this._value; }
AST.ValueNode.prototype.setValue = function(v){ this._value = v; return this; }
;

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
AST.Statement = imba$class(function Statement(){
	AST.ValueNode.apply(this,arguments);
},AST.ValueNode);
AST.Statement.prototype.isExpressable = function (){
	return false;
};
AST.Statement.prototype.statement = function (){
	return true;
};
AST.Meta = imba$class(function Meta(){
	AST.ValueNode.apply(this,arguments);
},AST.ValueNode);

AST.Comment = imba$class(function Comment(){
	AST.Meta.apply(this,arguments);
},AST.Meta);
AST.Comment.prototype.c = function (o){
	return (o && o.expression || this._value.match(/\n/)) ? (("/*" + (this.value().c()) + "*/")) : (("// " + (this.value().c())));
};
AST.Terminator = imba$class(function Terminator(){
	AST.Meta.apply(this,arguments);
},AST.Meta);
AST.Terminator.prototype.c = function (){
	return this._value;
	return this.v();
};
AST.Newline = imba$class(function Newline(v){
	this._value = v || '\n';
},AST.Terminator);
AST.Newline.prototype.c = function (){
	return this._value;
};
AST.Index = imba$class(function Index(){
	AST.ValueNode.apply(this,arguments);
},AST.ValueNode);
AST.Index.prototype.js = function (){
	return this._value.c();
};
AST.NewLines = imba$class(function NewLines(){
	AST.ValueNode.apply(this,arguments);
},AST.ValueNode);
AST.NewLines.prototype.js = function (){
	return this._value;
};
AST.NewLines.prototype.isExpressable = function (){
	return true;
};
AST.ListNode = imba$class(function ListNode(list,options){
	if(list === undefined) list = [];
	if(options === undefined) options = {};
	this._nodes = this.load(list);
	this._options = options;
},AST.Node);

AST.ListNode.prototype.__nodes = {};
AST.ListNode.prototype.nodes = function(v){ return this._nodes; }
AST.ListNode.prototype.setNodes = function(v){ this._nodes = v; return this; }
;

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
AST.ListNode.prototype.slice = function (a,b){
	return new this.constructor(this._nodes.slice(a,b));
};
AST.ListNode.prototype.add = function (item){
	this.push(item);
	return this;
};
AST.ListNode.prototype.break = function (br,pre){
	if(pre === undefined) pre = false;
	if(typeof br == 'string') {
		br = new AST.Terminator(br);
	};
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
	if(!pars||pars.constructor !== Object) pars = {};
	var delim = pars.delim !== undefined ? pars.delim : this.delimiter();
	var indent = pars.indent !== undefined ? pars.indent : this._indentation;
	var nodes = pars.nodes !== undefined ? pars.nodes : this.nodes();
	var express = delim != ';';
	var shouldDelim = false;
	var nodes = nodes.compact();
	var last = this.last();
	var realLast = nodes[nodes.length - 1];
	
	var parts = nodes.map(function (arg){
		var out = arg.c({expression: express});
		
		if(arg instanceof AST.Meta) {
			true;
		} else {
			if(!express || arg != last) {
				out = out + delim;
			};
		};
		return out;
	});
	return parts.join("");
};
AST.ArgList = imba$class(function ArgList(){
	AST.ListNode.apply(this,arguments);
},AST.ListNode);
AST.ArgList.prototype.hasSplat = function (){
	return this.list().some(function (v){
		return v instanceof AST.Splat;
	});
};
AST.ArgList.prototype.delimiter = function (){
	return ",";
};
AST.AssignList = imba$class(function AssignList(){
	AST.ArgList.apply(this,arguments);
},AST.ArgList);
AST.AssignList.prototype.concat = function (other){
	if(this._nodes.length == 0 && (other instanceof AST.AssignList)) {
		return other;
	} else {
		AST.AssignList.prototype.__super.concat.apply(this,arguments);
	};
	return this;
};
AST.Block = imba$class(function Block(expr){
	var v_;
	if(expr === undefined) expr = [];
	(this.setNodes(v_=expr.flatten().compact() || []), v_);
},AST.ListNode);

AST.Block.prototype.__head = {};
AST.Block.prototype.head = function(v){ return this._head; }
AST.Block.prototype.setHead = function(v){ this._head = v; return this; }
;

AST.Block.wrap = function (ary){
	return (ary.length == 1 && (ary[0] instanceof AST.Block)) ? (ary[0]) : (new AST.Block(ary));
};
AST.Block.prototype.visit = function (){
	if(this._prebreak) {
		console.log("PREBREAK IN AST.BLOCK SHOULD THROW");
		this.first() && this.first().prebreak(this._prebreak);
	};
	return AST.Block.prototype.__super.visit.apply(this,arguments);
};
AST.Block.prototype.push = function (item,sep){
	this.nodes().push(item);
	return this;
};
AST.Block.prototype.block = function (){
	return this;
};
AST.Block.prototype.loc = function (){
	var opt, a, b;
	return (opt = this.option('ends')) ? (a = opt[0].loc(), b = opt[1].loc(), (!a) && (this.p(("no loc for " + (opt[0])))), (!b) && (this.p(("no loc for " + (opt[1])))), [a[0], b[1]]) : ([0, 0]);
};
AST.Block.prototype.unwrap = function (){
	var ary = [];
	for(var i=0, items=iter$(this.nodes()), len=items.length, node; i < len; i++){
		node = items[i];
		if(node instanceof AST.Block) {
			ary.push.apply(ary,node.unwrap());
		} else {
			ary.push(node);
		};
	};
	return ary;
};
AST.Block.prototype.compile = function (o){
	if(o === undefined) o = {};
	var root = new AST.Root(this,o);
	return root.compile(o);
};
AST.Block.prototype.analyze = function (o){
	if(o === undefined) o = {};
	return this;
};
AST.Block.prototype.js = function (o,opts){
	var $1;
	var l = this.nodes().length;
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
	
	if(express) {
		return AST.Block.prototype.__super.js.call(this,o,{delim: ',',nodes: ast});
	};
	var compile = function (node,i){
		var out = (node) ? (node.c()) : ("");
		if(out == "") {
			return null;
		};
		if(out instanceof Array) {
			out = out.flatten().compact().filter(filter).join(";\n");
		};
		var hasSemiColon = out.match(/;(\s*\/\/.*)?[\n\s\t]*$/);
		
		if(!(hasSemiColon || (node instanceof AST.Meta))) {
			out += ";";
		};
		return out;
	};
	ast = ast.map(compile);
	if(this._head) {
		var prefix = [];
		this._head.forEach(function (item){
			var out = compile(item);
			return (out) && (prefix.push(out + '\n'));
		});
		ast = prefix.concat(ast);
	};
	return ast = ast.compact().filter(filter).join("");
};
AST.Block.prototype.defers = function (original,replacement){
	var idx = this.nodes().indexOf(original);
	if(idx >= 0) {
		this.nodes()[idx] = replacement;
	};
	replacement._prebreak || (replacement._prebreak = original._prebreak);
	var rest = this.nodes().splice(idx + 1);
	return rest;
};
AST.Block.prototype.consume = function (node){
	var v_, before;
	if(node instanceof AST.TagTree) {
		this.setNodes(this.nodes().map(function (child){
			return child.consume(node);
		}));
		if(this.nodes().length > 1) {
			(this.setNodes(v_=[new AST.Arr(this.nodes())]), v_);
		};
		return this;
	};
	if(before = this.last()) {
		var after = before.consume(node);
		if(after != before) {
			this.replace(before,after);
		};
	};
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
	return this.option('express') || AST.Block.prototype.__super.isExpression.call(this);
};
AST.VarBlock = imba$class(function VarBlock(){
	AST.ListNode.apply(this,arguments);
},AST.ListNode);
AST.VarBlock.prototype.addExpression = function (expr){
	if(expr instanceof AST.Assign) {
		this.addExpression(expr.left());
		return new AST.TupleAssign('=',new AST.Tuple(this.nodes()),expr.right());
	} else {
		if(expr instanceof AST.VarOrAccess) {
			this.push(new AST.VarReference(expr.value()));
		} else {
			if((expr instanceof AST.Splat) && (expr.node() instanceof AST.VarOrAccess)) {
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
	return this;
};
AST.Parens = imba$class(function Parens(){
	AST.ValueNode.apply(this,arguments);
},AST.ValueNode);
AST.Parens.prototype.js = function (o){
	var par = this.up();
	
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
	if(this._noparen) {
		return false;
	};
	return true;
};
AST.Parens.prototype.prebreak = function (br){
	var $1;
	AST.Parens.prototype.__super.prebreak.call(this,br);
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
AST.ExpressionBlock = imba$class(function ExpressionBlock(){
	AST.ListNode.apply(this,arguments);
},AST.ListNode);
AST.ExpressionBlock.prototype.visit = function (){
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
	if(expr.node() instanceof AST.Assign) {
		this.push(expr.left());
		return new AST.TupleAssign('=',new AST.Tuple(this.nodes()),expr.right());
	} else {
		this.push(expr);
	};
	return this;
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
	return (typ == 'call') && ((pars[0].c() == 'return') && (pars[0] = 'tata'), new AST.Call(pars[0],pars[1],pars[2]));
};
AST.escapeComments = function (str){
	if(!str) {
		return '';
	};
	return str;
};
AST.Indentation = imba$class(function Indentation(a,b){
	this._open = a || 1;
	this._close = b || 1;
	this;
});

AST.Indentation.prototype.__open = {};
AST.Indentation.prototype.open = function(v){ return this._open; }
AST.Indentation.prototype.setOpen = function(v){ this._open = v; return this; }
;

AST.Indentation.prototype.__close = {};
AST.Indentation.prototype.close = function(v){ return this._close; }
AST.Indentation.prototype.setClose = function(v){ this._close = v; return this; }
;

AST.Indentation.prototype.wrap = function (str,o){
	var pre = this._open.pre;
	var post = this._open.post;
	var esc = AST.escapeComments;
	str = esc(post).replace(/^\n/,'') + str;
	str = str.replace(/^/g,"\t").replace(/\n/g,"\n\t").replace(/\n\t$/g,"\n");
	
	str = esc(pre) + '\n' + str;
	if(!(str[str.length - 1] == '\n')) {
		str = str + '\n';
	};
	
	return str;
};
AST.INDENT = new AST.Indentation();

AST.Stack = imba$class(function Stack(){
	this._nodes = [];
	this._scoping = [];
	this._scopes = [];
	this._loglevel = 3;
});

AST.Stack.prototype.__loglevel = {};
AST.Stack.prototype.loglevel = function(v){ return this._loglevel; }
AST.Stack.prototype.setLoglevel = function(v){ this._loglevel = v; return this; }
;

AST.Stack.prototype.__nodes = {};
AST.Stack.prototype.nodes = function(v){ return this._nodes; }
AST.Stack.prototype.setNodes = function(v){ this._nodes = v; return this; }
;

AST.Stack.prototype.__scopes = {};
AST.Stack.prototype.scopes = function(v){ return this._scopes; }
AST.Stack.prototype.setScopes = function(v){ this._scopes = v; return this; }
;

AST.Stack.prototype.addScope = function (scope){
	this._scopes.push(scope);
	return this;
};
AST.Stack.prototype.traverse = function (node){
	return this;
};
AST.Stack.prototype.push = function (node){
	this._nodes.push(node);
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
		if((node instanceof AST.Code) || (node instanceof AST.Loop)) {
			return false;
		};
		if(node.isExpression()) {
			return true;
		};
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
STACK = new AST.Stack();

AST.Node = imba$class(function Node(){
	this;
});

AST.Node.prototype.__o = {};
AST.Node.prototype.o = function(v){ return this._o; }
AST.Node.prototype.setO = function(v){ this._o = v; return this; }
;

AST.Node.prototype.__options = {};
AST.Node.prototype.options = function(v){ return this._options; }
AST.Node.prototype.setOptions = function(v){ this._options = v; return this; }
;

AST.Node.prototype.__traversed = {};
AST.Node.prototype.traversed = function(v){ return this._traversed; }
AST.Node.prototype.setTraversed = function(v){ this._traversed = v; return this; }
;

AST.Node.prototype.__statement = {};
AST.Node.prototype.statement = function(v){ return this._statement; }
AST.Node.prototype.setStatement = function(v){ this._statement = v; return this; }
;

AST.Node.prototype.safechain = function (){
	return false;
};
AST.Node.prototype.dom = function (){
	var name = "ast_" + this.constructor.name.replace(/([a-z])([A-Z])/g,"$1_$2").toLowerCase();
	if(Imba.TAGS[name]) {
		var node = Imba.tag(name);
		node.bind(this).build();
		return node;
	} else {
		return ("[" + name + "]");
	};
};
AST.Node.prototype.p = function (){
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
AST.Node.prototype.consume = function (node){
	if(node instanceof AST.PushAssign) {
		return new AST.PushAssign(node.op(),node.left(),this);
	};
	if(node instanceof AST.Assign) {
		return OP(node.op(),node.left(),this);
	} else {
		if(node instanceof AST.Op) {
			return OP(node.op(),node.left(),this);
		} else {
			if(node instanceof AST.Return) {
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
	var node = new AST.ExpressionBlock([this]);
	return node.addExpression(expr);
};
AST.Node.prototype.addComment = function (comment){
	this._comment = comment;
	return this;
};
AST.Node.prototype.indented = function (a,b){
	if(b instanceof Array) {
		this.add(b[0]);
		b = b[1];
	};
	this._indented = [a, b];
	this._indentation || (this._indentation = (a && b) ? (new AST.Indentation(a,b)) : (AST.INDENT));
	return this;
};
AST.Node.prototype.prebreak = function (term){
	if(term === undefined) term = '\n';
	console.log("prebreak!!!!");
	this._prebreak = this._prebreak || term;
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
	return this;
};
AST.Node.prototype.cachevar = function (){
	return this._cache && this._cache.var;
};
AST.Node.prototype.decache = function (){
	if(this._cache) {
		this.cachevar().free();
		this._cache = null;
	};
	return this;
};
AST.Node.prototype.predeclare = function (){
	if(this._cache) {
		this.scope__().vars().swap(this._cache.var,this);
	};
	return this;
};
AST.Node.prototype.alias = function (){
	return null;
};
AST.Node.prototype.warn = function (text,opts){
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
		};
		return this._cache.var.c();
	};
	STACK.push(this);
	if(o && o.expression) {
		this.forceExpression();
	};
	
	if(o && o.indent) {
		this._indentation || (this._indentation = AST.INDENT);
	};
	var out = this.js(STACK,o);
	
	var paren = this.shouldParenthesize();
	
	if(indent = this._indentation) {
		out = indent.wrap(out,o);
	};
	if(paren) {
		if(out instanceof Array) {
			out = ("(" + out + ")");
		} else {
			out = out.parenthesize();
		};
	};
	if(o && o.braces) {
		out = '{' + out + '}';
	};
	STACK.pop(this);
	
	if(this._cache) {
		if(!(this._cache.manual)) {
			out = ("" + (this._cache.var.c()) + "=" + out);
		};
		var par = STACK.current();
		if((par instanceof AST.Access) || (par instanceof AST.Op)) {
			out = out.parenthesize();
		};
		this._cache.cached = true;
	};
	if(this._temporary && this._temporary.length) {
		this._temporary.map(function (temp){
			return temp.decache();
		});
	};
	return out;
};
AST.Expression = imba$class(function Expression(){
	AST.Node.apply(this,arguments);
},AST.Node);

AST.ValueNode = imba$class(function ValueNode(value){
	this._value = this.load(value);
},AST.Node);

AST.ValueNode.prototype.__value = {};
AST.ValueNode.prototype.value = function(v){ return this._value; }
AST.ValueNode.prototype.setValue = function(v){ this._value = v; return this; }
;

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
AST.Statement = imba$class(function Statement(){
	AST.ValueNode.apply(this,arguments);
},AST.ValueNode);
AST.Statement.prototype.isExpressable = function (){
	return false;
};
AST.Statement.prototype.statement = function (){
	return true;
};
AST.Meta = imba$class(function Meta(){
	AST.ValueNode.apply(this,arguments);
},AST.ValueNode);

AST.Comment = imba$class(function Comment(){
	AST.Meta.apply(this,arguments);
},AST.Meta);
AST.Comment.prototype.c = function (o){
	return (o && o.expression || this._value.match(/\n/)) ? (("/*" + (this.value().c()) + "*/")) : (("// " + (this.value().c())));
};
AST.Terminator = imba$class(function Terminator(){
	AST.Meta.apply(this,arguments);
},AST.Meta);
AST.Terminator.prototype.c = function (){
	return this._value;
	return this.v();
};
AST.Newline = imba$class(function Newline(v){
	this._value = v || '\n';
},AST.Terminator);
AST.Newline.prototype.c = function (){
	return this._value;
};
AST.Index = imba$class(function Index(){
	AST.ValueNode.apply(this,arguments);
},AST.ValueNode);
AST.Index.prototype.js = function (){
	return this._value.c();
};
AST.NewLines = imba$class(function NewLines(){
	AST.ValueNode.apply(this,arguments);
},AST.ValueNode);
AST.NewLines.prototype.js = function (){
	return this._value;
};
AST.NewLines.prototype.isExpressable = function (){
	return true;
};
AST.ListNode = imba$class(function ListNode(list,options){
	if(list === undefined) list = [];
	if(options === undefined) options = {};
	this._nodes = this.load(list);
	this._options = options;
},AST.Node);

AST.ListNode.prototype.__nodes = {};
AST.ListNode.prototype.nodes = function(v){ return this._nodes; }
AST.ListNode.prototype.setNodes = function(v){ this._nodes = v; return this; }
;

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
AST.ListNode.prototype.slice = function (a,b){
	return new this.constructor(this._nodes.slice(a,b));
};
AST.ListNode.prototype.add = function (item){
	this.push(item);
	return this;
};
AST.ListNode.prototype.break = function (br,pre){
	if(pre === undefined) pre = false;
	if(typeof br == 'string') {
		br = new AST.Terminator(br);
	};
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
	if(!pars||pars.constructor !== Object) pars = {};
	var delim = pars.delim !== undefined ? pars.delim : this.delimiter();
	var indent = pars.indent !== undefined ? pars.indent : this._indentation;
	var nodes = pars.nodes !== undefined ? pars.nodes : this.nodes();
	var express = delim != ';';
	var shouldDelim = false;
	var nodes = nodes.compact();
	var last = this.last();
	var realLast = nodes[nodes.length - 1];
	
	var parts = nodes.map(function (arg){
		var out = arg.c({expression: express});
		
		if(arg instanceof AST.Meta) {
			true;
		} else {
			if(!express || arg != last) {
				out = out + delim;
			};
		};
		return out;
	});
	return parts.join("");
};
AST.ArgList = imba$class(function ArgList(){
	AST.ListNode.apply(this,arguments);
},AST.ListNode);
AST.ArgList.prototype.hasSplat = function (){
	return this.list().some(function (v){
		return v instanceof AST.Splat;
	});
};
AST.ArgList.prototype.delimiter = function (){
	return ",";
};
AST.AssignList = imba$class(function AssignList(){
	AST.ArgList.apply(this,arguments);
},AST.ArgList);
AST.AssignList.prototype.concat = function (other){
	if(this._nodes.length == 0 && (other instanceof AST.AssignList)) {
		return other;
	} else {
		AST.AssignList.prototype.__super.concat.apply(this,arguments);
	};
	return this;
};
AST.Block = imba$class(function Block(expr){
	var v_;
	if(expr === undefined) expr = [];
	(this.setNodes(v_=expr.flatten().compact() || []), v_);
},AST.ListNode);

AST.Block.prototype.__head = {};
AST.Block.prototype.head = function(v){ return this._head; }
AST.Block.prototype.setHead = function(v){ this._head = v; return this; }
;

AST.Block.wrap = function (ary){
	return (ary.length == 1 && (ary[0] instanceof AST.Block)) ? (ary[0]) : (new AST.Block(ary));
};
AST.Block.prototype.visit = function (){
	if(this._prebreak) {
		console.log("PREBREAK IN AST.BLOCK SHOULD THROW");
		this.first() && this.first().prebreak(this._prebreak);
	};
	return AST.Block.prototype.__super.visit.apply(this,arguments);
};
AST.Block.prototype.push = function (item,sep){
	this.nodes().push(item);
	return this;
};
AST.Block.prototype.block = function (){
	return this;
};
AST.Block.prototype.loc = function (){
	var opt, a, b;
	return (opt = this.option('ends')) ? (a = opt[0].loc(), b = opt[1].loc(), (!a) && (this.p(("no loc for " + (opt[0])))), (!b) && (this.p(("no loc for " + (opt[1])))), [a[0], b[1]]) : ([0, 0]);
};
AST.Block.prototype.unwrap = function (){
	var ary = [];
	for(var i=0, items=iter$(this.nodes()), len=items.length, node; i < len; i++){
		node = items[i];
		if(node instanceof AST.Block) {
			ary.push.apply(ary,node.unwrap());
		} else {
			ary.push(node);
		};
	};
	return ary;
};
AST.Block.prototype.compile = function (o){
	if(o === undefined) o = {};
	var root = new AST.Root(this,o);
	return root.compile(o);
};
AST.Block.prototype.analyze = function (o){
	if(o === undefined) o = {};
	return this;
};
AST.Block.prototype.js = function (o,opts){
	var $1;
	var l = this.nodes().length;
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
	
	if(express) {
		return AST.Block.prototype.__super.js.call(this,o,{delim: ',',nodes: ast});
	};
	var compile = function (node,i){
		var out = (node) ? (node.c()) : ("");
		if(out == "") {
			return null;
		};
		if(out instanceof Array) {
			out = out.flatten().compact().filter(filter).join(";\n");
		};
		var hasSemiColon = out.match(/;(\s*\/\/.*)?[\n\s\t]*$/);
		
		if(!(hasSemiColon || (node instanceof AST.Meta))) {
			out += ";";
		};
		return out;
	};
	ast = ast.map(compile);
	if(this._head) {
		var prefix = [];
		this._head.forEach(function (item){
			var out = compile(item);
			return (out) && (prefix.push(out + '\n'));
		});
		ast = prefix.concat(ast);
	};
	return ast = ast.compact().filter(filter).join("");
};
AST.Block.prototype.defers = function (original,replacement){
	var idx = this.nodes().indexOf(original);
	if(idx >= 0) {
		this.nodes()[idx] = replacement;
	};
	replacement._prebreak || (replacement._prebreak = original._prebreak);
	var rest = this.nodes().splice(idx + 1);
	return rest;
};
AST.Block.prototype.consume = function (node){
	var v_, before;
	if(node instanceof AST.TagTree) {
		this.setNodes(this.nodes().map(function (child){
			return child.consume(node);
		}));
		if(this.nodes().length > 1) {
			(this.setNodes(v_=[new AST.Arr(this.nodes())]), v_);
		};
		return this;
	};
	if(before = this.last()) {
		var after = before.consume(node);
		if(after != before) {
			this.replace(before,after);
		};
	};
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
	return this.option('express') || AST.Block.prototype.__super.isExpression.call(this);
};
AST.VarBlock = imba$class(function VarBlock(){
	AST.ListNode.apply(this,arguments);
},AST.ListNode);
AST.VarBlock.prototype.addExpression = function (expr){
	if(expr instanceof AST.Assign) {
		this.addExpression(expr.left());
		return new AST.TupleAssign('=',new AST.Tuple(this.nodes()),expr.right());
	} else {
		if(expr instanceof AST.VarOrAccess) {
			this.push(new AST.VarReference(expr.value()));
		} else {
			if((expr instanceof AST.Splat) && (expr.node() instanceof AST.VarOrAccess)) {
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
	return this;
};
AST.Parens = imba$class(function Parens(){
	AST.ValueNode.apply(this,arguments);
},AST.ValueNode);
AST.Parens.prototype.js = function (o){
	var par = this.up();
	
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
	if(this._noparen) {
		return false;
	};
	return true;
};
AST.Parens.prototype.prebreak = function (br){
	var $1;
	AST.Parens.prototype.__super.prebreak.call(this,br);
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
AST.ExpressionBlock = imba$class(function ExpressionBlock(){
	AST.ListNode.apply(this,arguments);
},AST.ListNode);
AST.ExpressionBlock.prototype.visit = function (){
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
	if(expr.node() instanceof AST.Assign) {
		this.push(expr.left());
		return new AST.TupleAssign('=',new AST.Tuple(this.nodes()),expr.right());
	} else {
		this.push(expr);
	};
	return this;
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
	return (typ == 'call') && ((pars[0].c() == 'return') && (pars[0] = 'tata'), new AST.Call(pars[0],pars[1],pars[2]));
};
AST.escapeComments = function (str){
	if(!str) {
		return '';
	};
	return str;
};
AST.Indentation = imba$class(function Indentation(a,b){
	this._open = a || 1;
	this._close = b || 1;
	this;
});

AST.Indentation.prototype.__open = {};
AST.Indentation.prototype.open = function(v){ return this._open; }
AST.Indentation.prototype.setOpen = function(v){ this._open = v; return this; }
;

AST.Indentation.prototype.__close = {};
AST.Indentation.prototype.close = function(v){ return this._close; }
AST.Indentation.prototype.setClose = function(v){ this._close = v; return this; }
;

AST.Indentation.prototype.wrap = function (str,o){
	var pre = this._open.pre;
	var post = this._open.post;
	var esc = AST.escapeComments;
	str = esc(post).replace(/^\n/,'') + str;
	str = str.replace(/^/g,"\t").replace(/\n/g,"\n\t").replace(/\n\t$/g,"\n");
	
	str = esc(pre) + '\n' + str;
	if(!(str[str.length - 1] == '\n')) {
		str = str + '\n';
	};
	
	return str;
};
AST.INDENT = new AST.Indentation();

AST.Stack = imba$class(function Stack(){
	this._nodes = [];
	this._scoping = [];
	this._scopes = [];
	this._loglevel = 3;
});

AST.Stack.prototype.__loglevel = {};
AST.Stack.prototype.loglevel = function(v){ return this._loglevel; }
AST.Stack.prototype.setLoglevel = function(v){ this._loglevel = v; return this; }
;

AST.Stack.prototype.__nodes = {};
AST.Stack.prototype.nodes = function(v){ return this._nodes; }
AST.Stack.prototype.setNodes = function(v){ this._nodes = v; return this; }
;

AST.Stack.prototype.__scopes = {};
AST.Stack.prototype.scopes = function(v){ return this._scopes; }
AST.Stack.prototype.setScopes = function(v){ this._scopes = v; return this; }
;

AST.Stack.prototype.addScope = function (scope){
	this._scopes.push(scope);
	return this;
};
AST.Stack.prototype.traverse = function (node){
	return this;
};
AST.Stack.prototype.push = function (node){
	this._nodes.push(node);
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
		if((node instanceof AST.Code) || (node instanceof AST.Loop)) {
			return false;
		};
		if(node.isExpression()) {
			return true;
		};
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
STACK = new AST.Stack();

AST.Node = imba$class(function Node(){
	this;
});

AST.Node.prototype.__o = {};
AST.Node.prototype.o = function(v){ return this._o; }
AST.Node.prototype.setO = function(v){ this._o = v; return this; }
;

AST.Node.prototype.__options = {};
AST.Node.prototype.options = function(v){ return this._options; }
AST.Node.prototype.setOptions = function(v){ this._options = v; return this; }
;

AST.Node.prototype.__traversed = {};
AST.Node.prototype.traversed = function(v){ return this._traversed; }
AST.Node.prototype.setTraversed = function(v){ this._traversed = v; return this; }
;

AST.Node.prototype.__statement = {};
AST.Node.prototype.statement = function(v){ return this._statement; }
AST.Node.prototype.setStatement = function(v){ this._statement = v; return this; }
;

AST.Node.prototype.safechain = function (){
	return false;
};
AST.Node.prototype.dom = function (){
	var name = "ast_" + this.constructor.name.replace(/([a-z])([A-Z])/g,"$1_$2").toLowerCase();
	if(Imba.TAGS[name]) {
		var node = Imba.tag(name);
		node.bind(this).build();
		return node;
	} else {
		return ("[" + name + "]");
	};
};
AST.Node.prototype.p = function (){
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
AST.Node.prototype.consume = function (node){
	if(node instanceof AST.PushAssign) {
		return new AST.PushAssign(node.op(),node.left(),this);
	};
	if(node instanceof AST.Assign) {
		return OP(node.op(),node.left(),this);
	} else {
		if(node instanceof AST.Op) {
			return OP(node.op(),node.left(),this);
		} else {
			if(node instanceof AST.Return) {
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
	var node = new AST.ExpressionBlock([this]);
	return node.addExpression(expr);
};
AST.Node.prototype.addComment = function (comment){
	this._comment = comment;
	return this;
};
AST.Node.prototype.indented = function (a,b){
	if(b instanceof Array) {
		this.add(b[0]);
		b = b[1];
	};
	this._indented = [a, b];
	this._indentation || (this._indentation = (a && b) ? (new AST.Indentation(a,b)) : (AST.INDENT));
	return this;
};
AST.Node.prototype.prebreak = function (term){
	if(term === undefined) term = '\n';
	console.log("prebreak!!!!");
	this._prebreak = this._prebreak || term;
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
	return this;
};
AST.Node.prototype.cachevar = function (){
	return this._cache && this._cache.var;
};
AST.Node.prototype.decache = function (){
	if(this._cache) {
		this.cachevar().free();
		this._cache = null;
	};
	return this;
};
AST.Node.prototype.predeclare = function (){
	if(this._cache) {
		this.scope__().vars().swap(this._cache.var,this);
	};
	return this;
};
AST.Node.prototype.alias = function (){
	return null;
};
AST.Node.prototype.warn = function (text,opts){
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
		};
		return this._cache.var.c();
	};
	STACK.push(this);
	if(o && o.expression) {
		this.forceExpression();
	};
	
	if(o && o.indent) {
		this._indentation || (this._indentation = AST.INDENT);
	};
	var out = this.js(STACK,o);
	
	var paren = this.shouldParenthesize();
	
	if(indent = this._indentation) {
		out = indent.wrap(out,o);
	};
	if(paren) {
		if(out instanceof Array) {
			out = ("(" + out + ")");
		} else {
			out = out.parenthesize();
		};
	};
	if(o && o.braces) {
		out = '{' + out + '}';
	};
	STACK.pop(this);
	
	if(this._cache) {
		if(!(this._cache.manual)) {
			out = ("" + (this._cache.var.c()) + "=" + out);
		};
		var par = STACK.current();
		if((par instanceof AST.Access) || (par instanceof AST.Op)) {
			out = out.parenthesize();
		};
		this._cache.cached = true;
	};
	if(this._temporary && this._temporary.length) {
		this._temporary.map(function (temp){
			return temp.decache();
		});
	};
	return out;
};
AST.Expression = imba$class(function Expression(){
	AST.Node.apply(this,arguments);
},AST.Node);

AST.ValueNode = imba$class(function ValueNode(value){
	this._value = this.load(value);
},AST.Node);

AST.ValueNode.prototype.__value = {};
AST.ValueNode.prototype.value = function(v){ return this._value; }
AST.ValueNode.prototype.setValue = function(v){ this._value = v; return this; }
;

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
AST.Statement = imba$class(function Statement(){
	AST.ValueNode.apply(this,arguments);
},AST.ValueNode);
AST.Statement.prototype.isExpressable = function (){
	return false;
};
AST.Statement.prototype.statement = function (){
	return true;
};
AST.Meta = imba$class(function Meta(){
	AST.ValueNode.apply(this,arguments);
},AST.ValueNode);

AST.Comment = imba$class(function Comment(){
	AST.Meta.apply(this,arguments);
},AST.Meta);
AST.Comment.prototype.c = function (o){
	return (o && o.expression || this._value.match(/\n/)) ? (("/*" + (this.value().c()) + "*/")) : (("// " + (this.value().c())));
};
AST.Terminator = imba$class(function Terminator(){
	AST.Meta.apply(this,arguments);
},AST.Meta);
AST.Terminator.prototype.c = function (){
	return this._value;
	return this.v();
};
AST.Newline = imba$class(function Newline(v){
	this._value = v || '\n';
},AST.Terminator);
AST.Newline.prototype.c = function (){
	return this._value;
};
AST.Index = imba$class(function Index(){
	AST.ValueNode.apply(this,arguments);
},AST.ValueNode);
AST.Index.prototype.js = function (){
	return this._value.c();
};
AST.NewLines = imba$class(function NewLines(){
	AST.ValueNode.apply(this,arguments);
},AST.ValueNode);
AST.NewLines.prototype.js = function (){
	return this._value;
};
AST.NewLines.prototype.isExpressable = function (){
	return true;
};
AST.ListNode = imba$class(function ListNode(list,options){
	if(list === undefined) list = [];
	if(options === undefined) options = {};
	this._nodes = this.load(list);
	this._options = options;
},AST.Node);

AST.ListNode.prototype.__nodes = {};
AST.ListNode.prototype.nodes = function(v){ return this._nodes; }
AST.ListNode.prototype.setNodes = function(v){ this._nodes = v; return this; }
;

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
AST.ListNode.prototype.slice = function (a,b){
	return new this.constructor(this._nodes.slice(a,b));
};
AST.ListNode.prototype.add = function (item){
	this.push(item);
	return this;
};
AST.ListNode.prototype.break = function (br,pre){
	if(pre === undefined) pre = false;
	if(typeof br == 'string') {
		br = new AST.Terminator(br);
	};
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
	if(!pars||pars.constructor !== Object) pars = {};
	var delim = pars.delim !== undefined ? pars.delim : this.delimiter();
	var indent = pars.indent !== undefined ? pars.indent : this._indentation;
	var nodes = pars.nodes !== undefined ? pars.nodes : this.nodes();
	var express = delim != ';';
	var shouldDelim = false;
	var nodes = nodes.compact();
	var last = this.last();
	var realLast = nodes[nodes.length - 1];
	
	var parts = nodes.map(function (arg){
		var out = arg.c({expression: express});
		
		if(arg instanceof AST.Meta) {
			true;
		} else {
			if(!express || arg != last) {
				out = out + delim;
			};
		};
		return out;
	});
	return parts.join("");
};
AST.ArgList = imba$class(function ArgList(){
	AST.ListNode.apply(this,arguments);
},AST.ListNode);
AST.ArgList.prototype.hasSplat = function (){
	return this.list().some(function (v){
		return v instanceof AST.Splat;
	});
};
AST.ArgList.prototype.delimiter = function (){
	return ",";
};
AST.AssignList = imba$class(function AssignList(){
	AST.ArgList.apply(this,arguments);
},AST.ArgList);
AST.AssignList.prototype.concat = function (other){
	if(this._nodes.length == 0 && (other instanceof AST.AssignList)) {
		return other;
	} else {
		AST.AssignList.prototype.__super.concat.apply(this,arguments);
	};
	return this;
};
AST.Block = imba$class(function Block(expr){
	var v_;
	if(expr === undefined) expr = [];
	(this.setNodes(v_=expr.flatten().compact() || []), v_);
},AST.ListNode);

AST.Block.prototype.__head = {};
AST.Block.prototype.head = function(v){ return this._head; }
AST.Block.prototype.setHead = function(v){ this._head = v; return this; }
;

AST.Block.wrap = function (ary){
	return (ary.length == 1 && (ary[0] instanceof AST.Block)) ? (ary[0]) : (new AST.Block(ary));
};
AST.Block.prototype.visit = function (){
	if(this._prebreak) {
		console.log("PREBREAK IN AST.BLOCK SHOULD THROW");
		this.first() && this.first().prebreak(this._prebreak);
	};
	return AST.Block.prototype.__super.visit.apply(this,arguments);
};
AST.Block.prototype.push = function (item,sep){
	this.nodes().push(item);
	return this;
};
AST.Block.prototype.block = function (){
	return this;
};
AST.Block.prototype.loc = function (){
	var opt, a, b;
	return (opt = this.option('ends')) ? (a = opt[0].loc(), b = opt[1].loc(), (!a) && (this.p(("no loc for " + (opt[0])))), (!b) && (this.p(("no loc for " + (opt[1])))), [a[0], b[1]]) : ([0, 0]);
};
AST.Block.prototype.unwrap = function (){
	var ary = [];
	for(var i=0, items=iter$(this.nodes()), len=items.length, node; i < len; i++){
		node = items[i];
		if(node instanceof AST.Block) {
			ary.push.apply(ary,node.unwrap());
		} else {
			ary.push(node);
		};
	};
	return ary;
};
AST.Block.prototype.compile = function (o){
	if(o === undefined) o = {};
	var root = new AST.Root(this,o);
	return root.compile(o);
};
AST.Block.prototype.analyze = function (o){
	if(o === undefined) o = {};
	return this;
};
AST.Block.prototype.js = function (o,opts){
	var $1;
	var l = this.nodes().length;
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
	
	if(express) {
		return AST.Block.prototype.__super.js.call(this,o,{delim: ',',nodes: ast});
	};
	var compile = function (node,i){
		var out = (node) ? (node.c()) : ("");
		if(out == "") {
			return null;
		};
		if(out instanceof Array) {
			out = out.flatten().compact().filter(filter).join(";\n");
		};
		var hasSemiColon = out.match(/;(\s*\/\/.*)?[\n\s\t]*$/);
		
		if(!(hasSemiColon || (node instanceof AST.Meta))) {
			out += ";";
		};
		return out;
	};
	ast = ast.map(compile);
	if(this._head) {
		var prefix = [];
		this._head.forEach(function (item){
			var out = compile(item);
			return (out) && (prefix.push(out + '\n'));
		});
		ast = prefix.concat(ast);
	};
	return ast = ast.compact().filter(filter).join("");
};
AST.Block.prototype.defers = function (original,replacement){
	var idx = this.nodes().indexOf(original);
	if(idx >= 0) {
		this.nodes()[idx] = replacement;
	};
	replacement._prebreak || (replacement._prebreak = original._prebreak);
	var rest = this.nodes().splice(idx + 1);
	return rest;
};
AST.Block.prototype.consume = function (node){
	var v_, before;
	if(node instanceof AST.TagTree) {
		this.setNodes(this.nodes().map(function (child){
			return child.consume(node);
		}));
		if(this.nodes().length > 1) {
			(this.setNodes(v_=[new AST.Arr(this.nodes())]), v_);
		};
		return this;
	};
	if(before = this.last()) {
		var after = before.consume(node);
		if(after != before) {
			this.replace(before,after);
		};
	};
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
	return this.option('express') || AST.Block.prototype.__super.isExpression.call(this);
};
AST.VarBlock = imba$class(function VarBlock(){
	AST.ListNode.apply(this,arguments);
},AST.ListNode);
AST.VarBlock.prototype.addExpression = function (expr){
	if(expr instanceof AST.Assign) {
		this.addExpression(expr.left());
		return new AST.TupleAssign('=',new AST.Tuple(this.nodes()),expr.right());
	} else {
		if(expr instanceof AST.VarOrAccess) {
			this.push(new AST.VarReference(expr.value()));
		} else {
			if((expr instanceof AST.Splat) && (expr.node() instanceof AST.VarOrAccess)) {
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
	return this;
};
AST.Parens = imba$class(function Parens(){
	AST.ValueNode.apply(this,arguments);
},AST.ValueNode);
AST.Parens.prototype.js = function (o){
	var par = this.up();
	
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
	if(this._noparen) {
		return false;
	};
	return true;
};
AST.Parens.prototype.prebreak = function (br){
	var $1;
	AST.Parens.prototype.__super.prebreak.call(this,br);
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
AST.ExpressionBlock = imba$class(function ExpressionBlock(){
	AST.ListNode.apply(this,arguments);
},AST.ListNode);
AST.ExpressionBlock.prototype.visit = function (){
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
	if(expr.node() instanceof AST.Assign) {
		this.push(expr.left());
		return new AST.TupleAssign('=',new AST.Tuple(this.nodes()),expr.right());
	} else {
		this.push(expr);
	};
	return this;
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
	return (typ == 'call') && ((pars[0].c() == 'return') && (pars[0] = 'tata'), new AST.Call(pars[0],pars[1],pars[2]));
};
AST.escapeComments = function (str){
	if(!str) {
		return '';
	};
	return str;
};
AST.Indentation = imba$class(function Indentation(a,b){
	this._open = a || 1;
	this._close = b || 1;
	this;
});

AST.Indentation.prototype.__open = {};
AST.Indentation.prototype.open = function(v){ return this._open; }
AST.Indentation.prototype.setOpen = function(v){ this._open = v; return this; }
;

AST.Indentation.prototype.__close = {};
AST.Indentation.prototype.close = function(v){ return this._close; }
AST.Indentation.prototype.setClose = function(v){ this._close = v; return this; }
;

AST.Indentation.prototype.wrap = function (str,o){
	var pre = this._open.pre;
	var post = this._open.post;
	var esc = AST.escapeComments;
	str = esc(post).replace(/^\n/,'') + str;
	str = str.replace(/^/g,"\t").replace(/\n/g,"\n\t").replace(/\n\t$/g,"\n");
	
	str = esc(pre) + '\n' + str;
	if(!(str[str.length - 1] == '\n')) {
		str = str + '\n';
	};
	
	return str;
};
AST.INDENT = new AST.Indentation();

AST.Stack = imba$class(function Stack(){
	this._nodes = [];
	this._scoping = [];
	this._scopes = [];
	this._loglevel = 3;
});

AST.Stack.prototype.__loglevel = {};
AST.Stack.prototype.loglevel = function(v){ return this._loglevel; }
AST.Stack.prototype.setLoglevel = function(v){ this._loglevel = v; return this; }
;

AST.Stack.prototype.__nodes = {};
AST.Stack.prototype.nodes = function(v){ return this._nodes; }
AST.Stack.prototype.setNodes = function(v){ this._nodes = v; return this; }
;

AST.Stack.prototype.__scopes = {};
AST.Stack.prototype.scopes = function(v){ return this._scopes; }
AST.Stack.prototype.setScopes = function(v){ this._scopes = v; return this; }
;

AST.Stack.prototype.addScope = function (scope){
	this._scopes.push(scope);
	return this;
};
AST.Stack.prototype.traverse = function (node){
	return this;
};
AST.Stack.prototype.push = function (node){
	this._nodes.push(node);
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
		if((node instanceof AST.Code) || (node instanceof AST.Loop)) {
			return false;
		};
		if(node.isExpression()) {
			return true;
		};
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
STACK = new AST.Stack();

AST.Node = imba$class(function Node(){
	this;
});

AST.Node.prototype.__o = {};
AST.Node.prototype.o = function(v){ return this._o; }
AST.Node.prototype.setO = function(v){ this._o = v; return this; }
;

AST.Node.prototype.__options = {};
AST.Node.prototype.options = function(v){ return this._options; }
AST.Node.prototype.setOptions = function(v){ this._options = v; return this; }
;

AST.Node.prototype.__traversed = {};
AST.Node.prototype.traversed = function(v){ return this._traversed; }
AST.Node.prototype.setTraversed = function(v){ this._traversed = v; return this; }
;

AST.Node.prototype.__statement = {};
AST.Node.prototype.statement = function(v){ return this._statement; }
AST.Node.prototype.setStatement = function(v){ this._statement = v; return this; }
;

AST.Node.prototype.safechain = function (){
	return false;
};
AST.Node.prototype.dom = function (){
	var name = "ast_" + this.constructor.name.replace(/([a-z])([A-Z])/g,"$1_$2").toLowerCase();
	if(Imba.TAGS[name]) {
		var node = Imba.tag(name);
		node.bind(this).build();
		return node;
	} else {
		return ("[" + name + "]");
	};
};
AST.Node.prototype.p = function (){
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
AST.Node.prototype.consume = function (node){
	if(node instanceof AST.PushAssign) {
		return new AST.PushAssign(node.op(),node.left(),this);
	};
	if(node instanceof AST.Assign) {
		return OP(node.op(),node.left(),this);
	} else {
		if(node instanceof AST.Op) {
			return OP(node.op(),node.left(),this);
		} else {
			if(node instanceof AST.Return) {
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
	var node = new AST.ExpressionBlock([this]);
	return node.addExpression(expr);
};
AST.Node.prototype.addComment = function (comment){
	this._comment = comment;
	return this;
};
AST.Node.prototype.indented = function (a,b){
	if(b instanceof Array) {
		this.add(b[0]);
		b = b[1];
	};
	this._indented = [a, b];
	this._indentation || (this._indentation = (a && b) ? (new AST.Indentation(a,b)) : (AST.INDENT));
	return this;
};
AST.Node.prototype.prebreak = function (term){
	if(term === undefined) term = '\n';
	console.log("prebreak!!!!");
	this._prebreak = this._prebreak || term;
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
	return this;
};
AST.Node.prototype.cachevar = function (){
	return this._cache && this._cache.var;
};
AST.Node.prototype.decache = function (){
	if(this._cache) {
		this.cachevar().free();
		this._cache = null;
	};
	return this;
};
AST.Node.prototype.predeclare = function (){
	if(this._cache) {
		this.scope__().vars().swap(this._cache.var,this);
	};
	return this;
};
AST.Node.prototype.alias = function (){
	return null;
};
AST.Node.prototype.warn = function (text,opts){
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
		};
		return this._cache.var.c();
	};
	STACK.push(this);
	if(o && o.expression) {
		this.forceExpression();
	};
	
	if(o && o.indent) {
		this._indentation || (this._indentation = AST.INDENT);
	};
	var out = this.js(STACK,o);
	
	var paren = this.shouldParenthesize();
	
	if(indent = this._indentation) {
		out = indent.wrap(out,o);
	};
	if(paren) {
		if(out instanceof Array) {
			out = ("(" + out + ")");
		} else {
			out = out.parenthesize();
		};
	};
	if(o && o.braces) {
		out = '{' + out + '}';
	};
	STACK.pop(this);
	
	if(this._cache) {
		if(!(this._cache.manual)) {
			out = ("" + (this._cache.var.c()) + "=" + out);
		};
		var par = STACK.current();
		if((par instanceof AST.Access) || (par instanceof AST.Op)) {
			out = out.parenthesize();
		};
		this._cache.cached = true;
	};
	if(this._temporary && this._temporary.length) {
		this._temporary.map(function (temp){
			return temp.decache();
		});
	};
	return out;
};
AST.Expression = imba$class(function Expression(){
	AST.Node.apply(this,arguments);
},AST.Node);

AST.ValueNode = imba$class(function ValueNode(value){
	this._value = this.load(value);
},AST.Node);

AST.ValueNode.prototype.__value = {};
AST.ValueNode.prototype.value = function(v){ return this._value; }
AST.ValueNode.prototype.setValue = function(v){ this._value = v; return this; }
;

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
AST.Statement = imba$class(function Statement(){
	AST.ValueNode.apply(this,arguments);
},AST.ValueNode);
AST.Statement.prototype.isExpressable = function (){
	return false;
};
AST.Statement.prototype.statement = function (){
	return true;
};
AST.Meta = imba$class(function Meta(){
	AST.ValueNode.apply(this,arguments);
},AST.ValueNode);

AST.Comment = imba$class(function Comment(){
	AST.Meta.apply(this,arguments);
},AST.Meta);
AST.Comment.prototype.c = function (o){
	return (o && o.expression || this._value.match(/\n/)) ? (("/*" + (this.value().c()) + "*/")) : (("// " + (this.value().c())));
};
AST.Terminator = imba$class(function Terminator(){
	AST.Meta.apply(this,arguments);
},AST.Meta);
AST.Terminator.prototype.c = function (){
	return this._value;
	return this.v();
};
AST.Newline = imba$class(function Newline(v){
	this._value = v || '\n';
},AST.Terminator);
AST.Newline.prototype.c = function (){
	return this._value;
};
AST.Index = imba$class(function Index(){
	AST.ValueNode.apply(this,arguments);
},AST.ValueNode);
AST.Index.prototype.js = function (){
	return this._value.c();
};
AST.NewLines = imba$class(function NewLines(){
	AST.ValueNode.apply(this,arguments);
},AST.ValueNode);
AST.NewLines.prototype.js = function (){
	return this._value;
};
AST.NewLines.prototype.isExpressable = function (){
	return true;
};
AST.ListNode = imba$class(function ListNode(list,options){
	if(list === undefined) list = [];
	if(options === undefined) options = {};
	this._nodes = this.load(list);
	this._options = options;
},AST.Node);

AST.ListNode.prototype.__nodes = {};
AST.ListNode.prototype.nodes = function(v){ return this._nodes; }
AST.ListNode.prototype.setNodes = function(v){ this._nodes = v; return this; }
;

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
AST.ListNode.prototype.slice = function (a,b){
	return new this.constructor(this._nodes.slice(a,b));
};
AST.ListNode.prototype.add = function (item){
	this.push(item);
	return this;
};
AST.ListNode.prototype.break = function (br,pre){
	if(pre === undefined) pre = false;
	if(typeof br == 'string') {
		br = new AST.Terminator(br);
	};
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
	if(!pars||pars.constructor !== Object) pars = {};
	var delim = pars.delim !== undefined ? pars.delim : this.delimiter();
	var indent = pars.indent !== undefined ? pars.indent : this._indentation;
	var nodes = pars.nodes !== undefined ? pars.nodes : this.nodes();
	var express = delim != ';';
	var shouldDelim = false;
	var nodes = nodes.compact();
	var last = this.last();
	var realLast = nodes[nodes.length - 1];
	
	var parts = nodes.map(function (arg){
		var out = arg.c({expression: express});
		
		if(arg instanceof AST.Meta) {
			true;
		} else {
			if(!express || arg != last) {
				out = out + delim;
			};
		};
		return out;
	});
	return parts.join("");
};
AST.ArgList = imba$class(function ArgList(){
	AST.ListNode.apply(this,arguments);
},AST.ListNode);
AST.ArgList.prototype.hasSplat = function (){
	return this.list().some(function (v){
		return v instanceof AST.Splat;
	});
};
AST.ArgList.prototype.delimiter = function (){
	return ",";
};
AST.AssignList = imba$class(function AssignList(){
	AST.ArgList.apply(this,arguments);
},AST.ArgList);
AST.AssignList.prototype.concat = function (other){
	if(this._nodes.length == 0 && (other instanceof AST.AssignList)) {
		return other;
	} else {
		AST.AssignList.prototype.__super.concat.apply(this,arguments);
	};
	return this;
};
AST.Block = imba$class(function Block(expr){
	var v_;
	if(expr === undefined) expr = [];
	(this.setNodes(v_=expr.flatten().compact() || []), v_);
},AST.ListNode);

AST.Block.prototype.__head = {};
AST.Block.prototype.head = function(v){ return this._head; }
AST.Block.prototype.setHead = function(v){ this._head = v; return this; }
;

AST.Block.wrap = function (ary){
	return (ary.length == 1 && (ary[0] instanceof AST.Block)) ? (ary[0]) : (new AST.Block(ary));
};
AST.Block.prototype.visit = function (){
	if(this._prebreak) {
		console.log("PREBREAK IN AST.BLOCK SHOULD THROW");
		this.first() && this.first().prebreak(this._prebreak);
	};
	return AST.Block.prototype.__super.visit.apply(this,arguments);
};
AST.Block.prototype.push = function (item,sep){
	this.nodes().push(item);
	return this;
};
AST.Block.prototype.block = function (){
	return this;
};
AST.Block.prototype.loc = function (){
	var opt, a, b;
	return (opt = this.option('ends')) ? (a = opt[0].loc(), b = opt[1].loc(), (!a) && (this.p(("no loc for " + (opt[0])))), (!b) && (this.p(("no loc for " + (opt[1])))), [a[0], b[1]]) : ([0, 0]);
};
AST.Block.prototype.unwrap = function (){
	var ary = [];
	for(var i=0, items=iter$(this.nodes()), len=items.length, node; i < len; i++){
		node = items[i];
		if(node instanceof AST.Block) {
			ary.push.apply(ary,node.unwrap());
		} else {
			ary.push(node);
		};
	};
	return ary;
};
AST.Block.prototype.compile = function (o){
	if(o === undefined) o = {};
	var root = new AST.Root(this,o);
	return root.compile(o);
};
AST.Block.prototype.analyze = function (o){
	if(o === undefined) o = {};
	return this;
};
AST.Block.prototype.js = function (o,opts){
	var $1;
	var l = this.nodes().length;
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
	
	if(express) {
		return AST.Block.prototype.__super.js.call(this,o,{delim: ',',nodes: ast});
	};
	var compile = function (node,i){
		var out = (node) ? (node.c()) : ("");
		if(out == "") {
			return null;
		};
		if(out instanceof Array) {
			out = out.flatten().compact().filter(filter).join(";\n");
		};
		var hasSemiColon = out.match(/;(\s*\/\/.*)?[\n\s\t]*$/);
		
		if(!(hasSemiColon || (node instanceof AST.Meta))) {
			out += ";";
		};
		return out;
	};
	ast = ast.map(compile);
	if(this._head) {
		var prefix = [];
		this._head.forEach(function (item){
			var out = compile(item);
			return (out) && (prefix.push(out + '\n'));
		});
		ast = prefix.concat(ast);
	};
	return ast = ast.compact().filter(filter).join("");
};
AST.Block.prototype.defers = function (original,replacement){
	var idx = this.nodes().indexOf(original);
	if(idx >= 0) {
		this.nodes()[idx] = replacement;
	};
	replacement._prebreak || (replacement._prebreak = original._prebreak);
	var rest = this.nodes().splice(idx + 1);
	return rest;
};
AST.Block.prototype.consume = function (node){
	var v_, before;
	if(node instanceof AST.TagTree) {
		this.setNodes(this.nodes().map(function (child){
			return child.consume(node);
		}));
		if(this.nodes().length > 1) {
			(this.setNodes(v_=[new AST.Arr(this.nodes())]), v_);
		};
		return this;
	};
	if(before = this.last()) {
		var after = before.consume(node);
		if(after != before) {
			this.replace(before,after);
		};
	};
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
	return this.option('express') || AST.Block.prototype.__super.isExpression.call(this);
};
AST.VarBlock = imba$class(function VarBlock(){
	AST.ListNode.apply(this,arguments);
},AST.ListNode);
AST.VarBlock.prototype.addExpression = function (expr){
	if(expr instanceof AST.Assign) {
		this.addExpression(expr.left());
		return new AST.TupleAssign('=',new AST.Tuple(this.nodes()),expr.right());
	} else {
		if(expr instanceof AST.VarOrAccess) {
			this.push(new AST.VarReference(expr.value()));
		} else {
			if((expr instanceof AST.Splat) && (expr.node() instanceof AST.VarOrAccess)) {
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
	return this;
};
AST.Parens = imba$class(function Parens(){
	AST.ValueNode.apply(this,arguments);
},AST.ValueNode);
AST.Parens.prototype.js = function (o){
	var par = this.up();
	
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
	if(this._noparen) {
		return false;
	};
	return true;
};
AST.Parens.prototype.prebreak = function (br){
	var $1;
	AST.Parens.prototype.__super.prebreak.call(this,br);
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
AST.ExpressionBlock = imba$class(function ExpressionBlock(){
	AST.ListNode.apply(this,arguments);
},AST.ListNode);
AST.ExpressionBlock.prototype.visit = function (){
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
	if(expr.node() instanceof AST.Assign) {
		this.push(expr.left());
		return new AST.TupleAssign('=',new AST.Tuple(this.nodes()),expr.right());
	} else {
		this.push(expr);
	};
	return this;
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
	return (typ == 'call') && ((pars[0].c() == 'return') && (pars[0] = 'tata'), new AST.Call(pars[0],pars[1],pars[2]));
};
AST.escapeComments = function (str){
	if(!str) {
		return '';
	};
	return str;
};
AST.Indentation = imba$class(function Indentation(a,b){
	this._open = a || 1;
	this._close = b || 1;
	this;
});

AST.Indentation.prototype.__open = {};
AST.Indentation.prototype.open = function(v){ return this._open; }
AST.Indentation.prototype.setOpen = function(v){ this._open = v; return this; }
;

AST.Indentation.prototype.__close = {};
AST.Indentation.prototype.close = function(v){ return this._close; }
AST.Indentation.prototype.setClose = function(v){ this._close = v; return this; }
;

AST.Indentation.prototype.wrap = function (str,o){
	var pre = this._open.pre;
	var post = this._open.post;
	var esc = AST.escapeComments;
	str = esc(post).replace(/^\n/,'') + str;
	str = str.replace(/^/g,"\t").replace(/\n/g,"\n\t").replace(/\n\t$/g,"\n");
	
	str = esc(pre) + '\n' + str;
	if(!(str[str.length - 1] == '\n')) {
		str = str + '\n';
	};
	
	return str;
};
AST.INDENT = new AST.Indentation();

AST.Stack = imba$class(function Stack(){
	this._nodes = [];
	this._scoping = [];
	this._scopes = [];
	this._loglevel = 3;
});

AST.Stack.prototype.__loglevel = {};
AST.Stack.prototype.loglevel = function(v){ return this._loglevel; }
AST.Stack.prototype.setLoglevel = function(v){ this._loglevel = v; return this; }
;

AST.Stack.prototype.__nodes = {};
AST.Stack.prototype.nodes = function(v){ return this._nodes; }
AST.Stack.prototype.setNodes = function(v){ this._nodes = v; return this; }
;

AST.Stack.prototype.__scopes = {};
AST.Stack.prototype.scopes = function(v){ return this._scopes; }
AST.Stack.prototype.setScopes = function(v){ this._scopes = v; return this; }
;

AST.Stack.prototype.addScope = function (scope){
	this._scopes.push(scope);
	return this;
};
AST.Stack.prototype.traverse = function (node){
	return this;
};
AST.Stack.prototype.push = function (node){
	this._nodes.push(node);
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
		if((node instanceof AST.Code) || (node instanceof AST.Loop)) {
			return false;
		};
		if(node.isExpression()) {
			return true;
		};
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
STACK = new AST.Stack();

AST.Node = imba$class(function Node(){
	this;
});

AST.Node.prototype.__o = {};
AST.Node.prototype.o = function(v){ return this._o; }
AST.Node.prototype.setO = function(v){ this._o = v; return this; }
;

AST.Node.prototype.__options = {};
AST.Node.prototype.options = function(v){ return this._options; }
AST.Node.prototype.setOptions = function(v){ this._options = v; return this; }
;

AST.Node.prototype.__traversed = {};
AST.Node.prototype.traversed = function(v){ return this._traversed; }
AST.Node.prototype.setTraversed = function(v){ this._traversed = v; return this; }
;

AST.Node.prototype.__statement = {};
AST.Node.prototype.statement = function(v){ return this._statement; }
AST.Node.prototype.setStatement = function(v){ this._statement = v; return this; }
;

AST.Node.prototype.safechain = function (){
	return false;
};
AST.Node.prototype.dom = function (){
	var name = "ast_" + this.constructor.name.replace(/([a-z])([A-Z])/g,"$1_$2").toLowerCase();
	if(Imba.TAGS[name]) {
		var node = Imba.tag(name);
		node.bind(this).build();
		return node;
	} else {
		return ("[" + name + "]");
	};
};
AST.Node.prototype.p = function (){
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
AST.Node.prototype.consume = function (node){
	if(node instanceof AST.PushAssign) {
		return new AST.PushAssign(node.op(),node.left(),this);
	};
	if(node instanceof AST.Assign) {
		return OP(node.op(),node.left(),this);
	} else {
		if(node instanceof AST.Op) {
			return OP(node.op(),node.left(),this);
		} else {
			if(node instanceof AST.Return) {
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
	var node = new AST.ExpressionBlock([this]);
	return node.addExpression(expr);
};
AST.Node.prototype.addComment = function (comment){
	this._comment = comment;
	return this;
};
AST.Node.prototype.indented = function (a,b){
	if(b instanceof Array) {
		this.add(b[0]);
		b = b[1];
	};
	this._indented = [a, b];
	this._indentation || (this._indentation = (a && b) ? (new AST.Indentation(a,b)) : (AST.INDENT));
	return this;
};
AST.Node.prototype.prebreak = function (term){
	if(term === undefined) term = '\n';
	console.log("prebreak!!!!");
	this._prebreak = this._prebreak || term;
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
	return this;
};
AST.Node.prototype.cachevar = function (){
	return this._cache && this._cache.var;
};
AST.Node.prototype.decache = function (){
	if(this._cache) {
		this.cachevar().free();
		this._cache = null;
	};
	return this;
};
AST.Node.prototype.predeclare = function (){
	if(this._cache) {
		this.scope__().vars().swap(this._cache.var,this);
	};
	return this;
};
AST.Node.prototype.alias = function (){
	return null;
};
AST.Node.prototype.warn = function (text,opts){
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
		};
		return this._cache.var.c();
	};
	STACK.push(this);
	if(o && o.expression) {
		this.forceExpression();
	};
	
	if(o && o.indent) {
		this._indentation || (this._indentation = AST.INDENT);
	};
	var out = this.js(STACK,o);
	
	var paren = this.shouldParenthesize();
	
	if(indent = this._indentation) {
		out = indent.wrap(out,o);
	};
	if(paren) {
		if(out instanceof Array) {
			out = ("(" + out + ")");
		} else {
			out = out.parenthesize();
		};
	};
	if(o && o.braces) {
		out = '{' + out + '}';
	};
	STACK.pop(this);
	
	if(this._cache) {
		if(!(this._cache.manual)) {
			out = ("" + (this._cache.var.c()) + "=" + out);
		};
		var par = STACK.current();
		if((par instanceof AST.Access) || (par instanceof AST.Op)) {
			out = out.parenthesize();
		};
		this._cache.cached = true;
	};
	if(this._temporary && this._temporary.length) {
		this._temporary.map(function (temp){
			return temp.decache();
		});
	};
	return out;
};
AST.Expression = imba$class(function Expression(){
	AST.Node.apply(this,arguments);
},AST.Node);

AST.ValueNode = imba$class(function ValueNode(value){
	this._value = this.load(value);
},AST.Node);

AST.ValueNode.prototype.__value = {};
AST.ValueNode.prototype.value = function(v){ return this._value; }
AST.ValueNode.prototype.setValue = function(v){ this._value = v; return this; }
;

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
AST.Statement = imba$class(function Statement(){
	AST.ValueNode.apply(this,arguments);
},AST.ValueNode);
AST.Statement.prototype.isExpressable = function (){
	return false;
};
AST.Statement.prototype.statement = function (){
	return true;
};
AST.Meta = imba$class(function Meta(){
	AST.ValueNode.apply(this,arguments);
},AST.ValueNode);

AST.Comment = imba$class(function Comment(){
	AST.Meta.apply(this,arguments);
},AST.Meta);
AST.Comment.prototype.c = function (o){
	return (o && o.expression || this._value.match(/\n/)) ? (("/*" + (this.value().c()) + "*/")) : (("// " + (this.value().c())));
};
AST.Terminator = imba$class(function Terminator(){
	AST.Meta.apply(this,arguments);
},AST.Meta);
AST.Terminator.prototype.c = function (){
	return this._value;
	return this.v();
};
AST.Newline = imba$class(function Newline(v){
	this._value = v || '\n';
},AST.Terminator);
AST.Newline.prototype.c = function (){
	return this._value;
};
AST.Index = imba$class(function Index(){
	AST.ValueNode.apply(this,arguments);
},AST.ValueNode);
AST.Index.prototype.js = function (){
	return this._value.c();
};
AST.NewLines = imba$class(function NewLines(){
	AST.ValueNode.apply(this,arguments);
},AST.ValueNode);
AST.NewLines.prototype.js = function (){
	return this._value;
};
AST.NewLines.prototype.isExpressable = function (){
	return true;
};
AST.ListNode = imba$class(function ListNode(list,options){
	if(list === undefined) list = [];
	if(options === undefined) options = {};
	this._nodes = this.load(list);
	this._options = options;
},AST.Node);

AST.ListNode.prototype.__nodes = {};
AST.ListNode.prototype.nodes = function(v){ return this._nodes; }
AST.ListNode.prototype.setNodes = function(v){ this._nodes = v; return this; }
;

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
AST.ListNode.prototype.slice = function (a,b){
	return new this.constructor(this._nodes.slice(a,b));
};
AST.ListNode.prototype.add = function (item){
	this.push(item);
	return this;
};
AST.ListNode.prototype.break = function (br,pre){
	if(pre === undefined) pre = false;
	if(typeof br == 'string') {
		br = new AST.Terminator(br);
	};
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
	if(!pars||pars.constructor !== Object) pars = {};
	var delim = pars.delim !== undefined ? pars.delim : this.delimiter();
	var indent = pars.indent !== undefined ? pars.indent : this._indentation;
	var nodes = pars.nodes !== undefined ? pars.nodes : this.nodes();
	var express = delim != ';';
	var shouldDelim = false;
	var nodes = nodes.compact();
	var last = this.last();
	var realLast = nodes[nodes.length - 1];
	
	var parts = nodes.map(function (arg){
		var out = arg.c({expression: express});
		
		if(arg instanceof AST.Meta) {
			true;
		} else {
			if(!express || arg != last) {
				out = out + delim;
			};
		};
		return out;
	});
	return parts.join("");
};
AST.ArgList = imba$class(function ArgList(){
	AST.ListNode.apply(this,arguments);
},AST.ListNode);
AST.ArgList.prototype.hasSplat = function (){
	return this.list().some(function (v){
		return v instanceof AST.Splat;
	});
};
AST.ArgList.prototype.delimiter = function (){
	return ",";
};
AST.AssignList = imba$class(function AssignList(){
	AST.ArgList.apply(this,arguments);
},AST.ArgList);
AST.AssignList.prototype.concat = function (other){
	if(this._nodes.length == 0 && (other instanceof AST.AssignList)) {
		return other;
	} else {
		AST.AssignList.prototype.__super.concat.apply(this,arguments);
	};
	return this;
};
AST.Block = imba$class(function Block(expr){
	var v_;
	if(expr === undefined) expr = [];
	(this.setNodes(v_=expr.flatten().compact() || []), v_);
},AST.ListNode);

AST.Block.prototype.__head = {};
AST.Block.prototype.head = function(v){ return this._head; }
AST.Block.prototype.setHead = function(v){ this._head = v; return this; }
;

AST.Block.wrap = function (ary){
	return (ary.length == 1 && (ary[0] instanceof AST.Block)) ? (ary[0]) : (new AST.Block(ary));
};
AST.Block.prototype.visit = function (){
	if(this._prebreak) {
		console.log("PREBREAK IN AST.BLOCK SHOULD THROW");
		this.first() && this.first().prebreak(this._prebreak);
	};
	return AST.Block.prototype.__super.visit.apply(this,arguments);
};
AST.Block.prototype.push = function (item,sep){
	this.nodes().push(item);
	return this;
};
AST.Block.prototype.block = function (){
	return this;
};
AST.Block.prototype.loc = function (){
	var opt, a, b;
	return (opt = this.option('ends')) ? (a = opt[0].loc(), b = opt[1].loc(), (!a) && (this.p(("no loc for " + (opt[0])))), (!b) && (this.p(("no loc for " + (opt[1])))), [a[0], b[1]]) : ([0, 0]);
};
AST.Block.prototype.unwrap = function (){
	var ary = [];
	for(var i=0, items=iter$(this.nodes()), len=items.length, node; i < len; i++){
		node = items[i];
		if(node instanceof AST.Block) {
			ary.push.apply(ary,node.unwrap());
		} else {
			ary.push(node);
		};
	};
	return ary;
};
AST.Block.prototype.compile = function (o){
	if(o === undefined) o = {};
	var root = new AST.Root(this,o);
	return root.compile(o);
};
AST.Block.prototype.analyze = function (o){
	if(o === undefined) o = {};
	return this;
};
AST.Block.prototype.js = function (o,opts){
	var $1;
	var l = this.nodes().length;
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
	
	if(express) {
		return AST.Block.prototype.__super.js.call(this,o,{delim: ',',nodes: ast});
	};
	var compile = function (node,i){
		var out = (node) ? (node.c()) : ("");
		if(out == "") {
			return null;
		};
		if(out instanceof Array) {
			out = out.flatten().compact().filter(filter).join(";\n");
		};
		var hasSemiColon = out.match(/;(\s*\/\/.*)?[\n\s\t]*$/);
		
		if(!(hasSemiColon || (node instanceof AST.Meta))) {
			out += ";";
		};
		return out;
	};
	ast = ast.map(compile);
	if(this._head) {
		var prefix = [];
		this._head.forEach(function (item){
			var out = compile(item);
			return (out) && (prefix.push(out + '\n'));
		});
		ast = prefix.concat(ast);
	};
	return ast = ast.compact().filter(filter).join("");
};
AST.Block.prototype.defers = function (original,replacement){
	var idx = this.nodes().indexOf(original);
	if(idx >= 0) {
		this.nodes()[idx] = replacement;
	};
	replacement._prebreak || (replacement._prebreak = original._prebreak);
	var rest = this.nodes().splice(idx + 1);
	return rest;
};
AST.Block.prototype.consume = function (node){
	var v_, before;
	if(node instanceof AST.TagTree) {
		this.setNodes(this.nodes().map(function (child){
			return child.consume(node);
		}));
		if(this.nodes().length > 1) {
			(this.setNodes(v_=[new AST.Arr(this.nodes())]), v_);
		};
		return this;
	};
	if(before = this.last()) {
		var after = before.consume(node);
		if(after != before) {
			this.replace(before,after);
		};
	};
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
	return this.option('express') || AST.Block.prototype.__super.isExpression.call(this);
};
AST.VarBlock = imba$class(function VarBlock(){
	AST.ListNode.apply(this,arguments);
},AST.ListNode);
AST.VarBlock.prototype.addExpression = function (expr){
	if(expr instanceof AST.Assign) {
		this.addExpression(expr.left());
		return new AST.TupleAssign('=',new AST.Tuple(this.nodes()),expr.right());
	} else {
		if(expr instanceof AST.VarOrAccess) {
			this.push(new AST.VarReference(expr.value()));
		} else {
			if((expr instanceof AST.Splat) && (expr.node() instanceof AST.VarOrAccess)) {
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
	return this;
};
AST.Parens = imba$class(function Parens(){
	AST.ValueNode.apply(this,arguments);
},AST.ValueNode);
AST.Parens.prototype.js = function (o){
	var par = this.up();
	
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
	if(this._noparen) {
		return false;
	};
	return true;
};
AST.Parens.prototype.prebreak = function (br){
	var $1;
	AST.Parens.prototype.__super.prebreak.call(this,br);
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
AST.ExpressionBlock = imba$class(function ExpressionBlock(){
	AST.ListNode.apply(this,arguments);
},AST.ListNode);
AST.ExpressionBlock.prototype.visit = function (){
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
	if(expr.node() instanceof AST.Assign) {
		this.push(expr.left());
		return new AST.TupleAssign('=',new AST.Tuple(this.nodes()),expr.right());
	} else {
		this.push(expr);
	};
	return this;
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
	return (typ == 'call') && ((pars[0].c() == 'return') && (pars[0] = 'tata'), new AST.Call(pars[0],pars[1],pars[2]));
};
AST.escapeComments = function (str){
	if(!str) {
		return '';
	};
	return str;
};
AST.Indentation = imba$class(function Indentation(a,b){
	this._open = a || 1;
	this._close = b || 1;
	this;
});

AST.Indentation.prototype.__open = {};
AST.Indentation.prototype.open = function(v){ return this._open; }
AST.Indentation.prototype.setOpen = function(v){ this._open = v; return this; }
;

AST.Indentation.prototype.__close = {};
AST.Indentation.prototype.close = function(v){ return this._close; }
AST.Indentation.prototype.setClose = function(v){ this._close = v; return this; }
;

AST.Indentation.prototype.wrap = function (str,o){
	var pre = this._open.pre;
	var post = this._open.post;
	var esc = AST.escapeComments;
	str = esc(post).replace(/^\n/,'') + str;
	str = str.replace(/^/g,"\t").replace(/\n/g,"\n\t").replace(/\n\t$/g,"\n");
	
	str = esc(pre) + '\n' + str;
	if(!(str[str.length - 1] == '\n')) {
		str = str + '\n';
	};
	
	return str;
};
AST.INDENT = new AST.Indentation();

AST.Stack = imba$class(function Stack(){
	this._nodes = [];
	this._scoping = [];
	this._scopes = [];
	this._loglevel = 3;
});

AST.Stack.prototype.__loglevel = {};
AST.Stack.prototype.loglevel = function(v){ return this._loglevel; }
AST.Stack.prototype.setLoglevel = function(v){ this._loglevel = v; return this; }
;

AST.Stack.prototype.__nodes = {};
AST.Stack.prototype.nodes = function(v){ return this._nodes; }
AST.Stack.prototype.setNodes = function(v){ this._nodes = v; return this; }
;

AST.Stack.prototype.__scopes = {};
AST.Stack.prototype.scopes = function(v){ return this._scopes; }
AST.Stack.prototype.setScopes = function(v){ this._scopes = v; return this; }
;

AST.Stack.prototype.addScope = function (scope){
	this._scopes.push(scope);
	return this;
};
AST.Stack.prototype.traverse = function (node){
	return this;
};
AST.Stack.prototype.push = function (node){
	this._nodes.push(node);
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
		if((node instanceof AST.Code) || (node instanceof AST.Loop)) {
			return false;
		};
		if(node.isExpression()) {
			return true;
		};
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
STACK = new AST.Stack();

AST.Node = imba$class(function Node(){
	this;
});

AST.Node.prototype.__o = {};
AST.Node.prototype.o = function(v){ return this._o; }
AST.Node.prototype.setO = function(v){ this._o = v; return this; }
;

AST.Node.prototype.__options = {};
AST.Node.prototype.options = function(v){ return this._options; }
AST.Node.prototype.setOptions = function(v){ this._options = v; return this; }
;

AST.Node.prototype.__traversed = {};
AST.Node.prototype.traversed = function(v){ return this._traversed; }
AST.Node.prototype.setTraversed = function(v){ this._traversed = v; return this; }
;

AST.Node.prototype.__statement = {};
AST.Node.prototype.statement = function(v){ return this._statement; }
AST.Node.prototype.setStatement = function(v){ this._statement = v; return this; }
;

AST.Node.prototype.safechain = function (){
	return false;
};
AST.Node.prototype.dom = function (){
	var name = "ast_" + this.constructor.name.replace(/([a-z])([A-Z])/g,"$1_$2").toLowerCase();
	if(Imba.TAGS[name]) {
		var node = Imba.tag(name);
		node.bind(this).build();
		return node;
	} else {
		return ("[" + name + "]");
	};
};
AST.Node.prototype.p = function (){
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
AST.Node.prototype.consume = function (node){
	if(node instanceof AST.PushAssign) {
		return new AST.PushAssign(node.op(),node.left(),this);
	};
	if(node instanceof AST.Assign) {
		return OP(node.op(),node.left(),this);
	} else {
		if(node instanceof AST.Op) {
			return OP(node.op(),node.left(),this);
		} else {
			if(node instanceof AST.Return) {
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
	var node = new AST.ExpressionBlock([this]);
	return node.addExpression(expr);
};
AST.Node.prototype.addComment = function (comment){
	this._comment = comment;
	return this;
};
AST.Node.prototype.indented = function (a,b){
	if(b instanceof Array) {
		this.add(b[0]);
		b = b[1];
	};
	this._indented = [a, b];
	this._indentation || (this._indentation = (a && b) ? (new AST.Indentation(a,b)) : (AST.INDENT));
	return this;
};
AST.Node.prototype.prebreak = function (term){
	if(term === undefined) term = '\n';
	console.log("prebreak!!!!");
	this._prebreak = this._prebreak || term;
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
	return this;
};
AST.Node.prototype.cachevar = function (){
	return this._cache && this._cache.var;
};
AST.Node.prototype.decache = function (){
	if(this._cache) {
		this.cachevar().free();
		this._cache = null;
	};
	return this;
};
AST.Node.prototype.predeclare = function (){
	if(this._cache) {
		this.scope__().vars().swap(this._cache.var,this);
	};
	return this;
};
AST.Node.prototype.alias = function (){
	return null;
};
AST.Node.prototype.warn = function (text,opts){
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
		};
		return this._cache.var.c();
	};
	STACK.push(this);
	if(o && o.expression) {
		this.forceExpression();
	};
	
	if(o && o.indent) {
		this._indentation || (this._indentation = AST.INDENT);
	};
	var out = this.js(STACK,o);
	
	var paren = this.shouldParenthesize();
	
	if(indent = this._indentation) {
		out = indent.wrap(out,o);
	};
	if(paren) {
		if(out instanceof Array) {
			out = ("(" + out + ")");
		} else {
			out = out.parenthesize();
		};
	};
	if(o && o.braces) {
		out = '{' + out + '}';
	};
	STACK.pop(this);
	
	if(this._cache) {
		if(!(this._cache.manual)) {
			out = ("" + (this._cache.var.c()) + "=" + out);
		};
		var par = STACK.current();
		if((par instanceof AST.Access) || (par instanceof AST.Op)) {
			out = out.parenthesize();
		};
		this._cache.cached = true;
	};
	if(this._temporary && this._temporary.length) {
		this._temporary.map(function (temp){
			return temp.decache();
		});
	};
	return out;
};
AST.Expression = imba$class(function Expression(){
	AST.Node.apply(this,arguments);
},AST.Node);

AST.ValueNode = imba$class(function ValueNode(value){
	this._value = this.load(value);
},AST.Node);

AST.ValueNode.prototype.__value = {};
AST.ValueNode.prototype.value = function(v){ return this._value; }
AST.ValueNode.prototype.setValue = function(v){ this._value = v; return this; }
;

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
AST.Statement = imba$class(function Statement(){
	AST.ValueNode.apply(this,arguments);
},AST.ValueNode);
AST.Statement.prototype.isExpressable = function (){
	return false;
};
AST.Statement.prototype.statement = function (){
	return true;
};
AST.Meta = imba$class(function Meta(){
	AST.ValueNode.apply(this,arguments);
},AST.ValueNode);

AST.Comment = imba$class(function Comment(){
	AST.Meta.apply(this,arguments);
},AST.Meta);
AST.Comment.prototype.c = function (o){
	return (o && o.expression || this._value.match(/\n/)) ? (("/*" + (this.value().c()) + "*/")) : (("// " + (this.value().c())));
};
AST.Terminator = imba$class(function Terminator(){
	AST.Meta.apply(this,arguments);
},AST.Meta);
AST.Terminator.prototype.c = function (){
	return this._value;
	return this.v();
};
AST.Newline = imba$class(function Newline(v){
	this._value = v || '\n';
},AST.Terminator);
AST.Newline.prototype.c = function (){
	return this._value;
};
AST.Index = imba$class(function Index(){
	AST.ValueNode.apply(this,arguments);
},AST.ValueNode);
AST.Index.prototype.js = function (){
	return this._value.c();
};
AST.NewLines = imba$class(function NewLines(){
	AST.ValueNode.apply(this,arguments);
},AST.ValueNode);
AST.NewLines.prototype.js = function (){
	return this._value;
};
AST.NewLines.prototype.isExpressable = function (){
	return true;
};
AST.ListNode = imba$class(function ListNode(list,options){
	if(list === undefined) list = [];
	if(options === undefined) options = {};
	this._nodes = this.load(list);
	this._options = options;
},AST.Node);

AST.ListNode.prototype.__nodes = {};
AST.ListNode.prototype.nodes = function(v){ return this._nodes; }
AST.ListNode.prototype.setNodes = function(v){ this._nodes = v; return this; }
;

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
AST.ListNode.prototype.slice = function (a,b){
	return new this.constructor(this._nodes.slice(a,b));
};
AST.ListNode.prototype.add = function (item){
	this.push(item);
	return this;
};
AST.ListNode.prototype.break = function (br,pre){
	if(pre === undefined) pre = false;
	if(typeof br == 'string') {
		br = new AST.Terminator(br);
	};
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
	if(!pars||pars.constructor !== Object) pars = {};
	var delim = pars.delim !== undefined ? pars.delim : this.delimiter();
	var indent = pars.indent !== undefined ? pars.indent : this._indentation;
	var nodes = pars.nodes !== undefined ? pars.nodes : this.nodes();
	var express = delim != ';';
	var shouldDelim = false;
	var nodes = nodes.compact();
	var last = this.last();
	var realLast = nodes[nodes.length - 1];
	
	var parts = nodes.map(function (arg){
		var out = arg.c({expression: express});
		
		if(arg instanceof AST.Meta) {
			true;
		} else {
			if(!express || arg != last) {
				out = out + delim;
			};
		};
		return out;
	});
	return parts.join("");
};
AST.ArgList = imba$class(function ArgList(){
	AST.ListNode.apply(this,arguments);
},AST.ListNode);
AST.ArgList.prototype.hasSplat = function (){
	return this.list().some(function (v){
		return v instanceof AST.Splat;
	});
};
AST.ArgList.prototype.delimiter = function (){
	return ",";
};
AST.AssignList = imba$class(function AssignList(){
	AST.ArgList.apply(this,arguments);
},AST.ArgList);
AST.AssignList.prototype.concat = function (other){
	if(this._nodes.length == 0 && (other instanceof AST.AssignList)) {
		return other;
	} else {
		AST.AssignList.prototype.__super.concat.apply(this,arguments);
	};
	return this;
};
AST.Block = imba$class(function Block(expr){
	var v_;
	if(expr === undefined) expr = [];
	(this.setNodes(v_=expr.flatten().compact() || []), v_);
},AST.ListNode);

AST.Block.prototype.__head = {};
AST.Block.prototype.head = function(v){ return this._head; }
AST.Block.prototype.setHead = function(v){ this._head = v; return this; }
;

AST.Block.wrap = function (ary){
	return (ary.length == 1 && (ary[0] instanceof AST.Block)) ? (ary[0]) : (new AST.Block(ary));
};
AST.Block.prototype.visit = function (){
	if(this._prebreak) {
		console.log("PREBREAK IN AST.BLOCK SHOULD THROW");
		this.first() && this.first().prebreak(this._prebreak);
	};
	return AST.Block.prototype.__super.visit.apply(this,arguments);
};
AST.Block.prototype.push = function (item,sep){
	this.nodes().push(item);
	return this;
};
AST.Block.prototype.block = function (){
	return this;
};
AST.Block.prototype.loc = function (){
	var opt, a, b;
	return (opt = this.option('ends')) ? (a = opt[0].loc(), b = opt[1].loc(), (!a) && (this.p(("no loc for " + (opt[0])))), (!b) && (this.p(("no loc for " + (opt[1])))), [a[0], b[1]]) : ([0, 0]);
};
AST.Block.prototype.unwrap = function (){
	var ary = [];
	for(var i=0, items=iter$(this.nodes()), len=items.length, node; i < len; i++){
		node = items[i];
		if(node instanceof AST.Block) {
			ary.push.apply(ary,node.unwrap());
		} else {
			ary.push(node);
		};
	};
	return ary;
};
AST.Block.prototype.compile = function (o){
	if(o === undefined) o = {};
	var root = new AST.Root(this,o);
	return root.compile(o);
};
AST.Block.prototype.analyze = function (o){
	if(o === undefined) o = {};
	return this;
};
AST.Block.prototype.js = function (o,opts){
	var $1;
	var l = this.nodes().length;
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
	
	if(express) {
		return AST.Block.prototype.__super.js.call(this,o,{delim: ',',nodes: ast});
	};
	var compile = function (node,i){
		var out = (node) ? (node.c()) : ("");
		if(out == "") {
			return null;
		};
		if(out instanceof Array) {
			out = out.flatten().compact().filter(filter).join(";\n");
		};
		var hasSemiColon = out.match(/;(\s*\/\/.*)?[\n\s\t]*$/);
		
		if(!(hasSemiColon || (node instanceof AST.Meta))) {
			out += ";";
		};
		return out;
	};
	ast = ast.map(compile);
	if(this._head) {
		var prefix = [];
		this._head.forEach(function (item){
			var out = compile(item);
			return (out) && (prefix.push(out + '\n'));
		});
		ast = prefix.concat(ast);
	};
	return ast = ast.compact().filter(filter).join("");
};
AST.Block.prototype.defers = function (original,replacement){
	var idx = this.nodes().indexOf(original);
	if(idx >= 0) {
		this.nodes()[idx] = replacement;
	};
	replacement._prebreak || (replacement._prebreak = original._prebreak);
	var rest = this.nodes().splice(idx + 1);
	return rest;
};
AST.Block.prototype.consume = function (node){
	var v_, before;
	if(node instanceof AST.TagTree) {
		this.setNodes(this.nodes().map(function (child){
			return child.consume(node);
		}));
		if(this.nodes().length > 1) {
			(this.setNodes(v_=[new AST.Arr(this.nodes())]), v_);
		};
		return this;
	};
	if(before = this.last()) {
		var after = before.consume(node);
		if(after != before) {
			this.replace(before,after);
		};
	};
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
	return this.option('express') || AST.Block.prototype.__super.isExpression.call(this);
};
AST.VarBlock = imba$class(function VarBlock(){
	AST.ListNode.apply(this,arguments);
},AST.ListNode);
AST.VarBlock.prototype.addExpression = function (expr){
	if(expr instanceof AST.Assign) {
		this.addExpression(expr.left());
		return new AST.TupleAssign('=',new AST.Tuple(this.nodes()),expr.right());
	} else {
		if(expr instanceof AST.VarOrAccess) {
			this.push(new AST.VarReference(expr.value()));
		} else {
			if((expr instanceof AST.Splat) && (expr.node() instanceof AST.VarOrAccess)) {
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
	return this;
};
AST.Parens = imba$class(function Parens(){
	AST.ValueNode.apply(this,arguments);
},AST.ValueNode);
AST.Parens.prototype.js = function (o){
	var par = this.up();
	
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
	if(this._noparen) {
		return false;
	};
	return true;
};
AST.Parens.prototype.prebreak = function (br){
	var $1;
	AST.Parens.prototype.__super.prebreak.call(this,br);
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
AST.ExpressionBlock = imba$class(function ExpressionBlock(){
	AST.ListNode.apply(this,arguments);
},AST.ListNode);
AST.ExpressionBlock.prototype.visit = function (){
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
	if(expr.node() instanceof AST.Assign) {
		this.push(expr.left());
		return new AST.TupleAssign('=',new AST.Tuple(this.nodes()),expr.right());
	} else {
		this.push(expr);
	};
	return this;
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
	return (typ == 'call') && ((pars[0].c() == 'return') && (pars[0] = 'tata'), new AST.Call(pars[0],pars[1],pars[2]));
};
AST.escapeComments = function (str){
	if(!str) {
		return '';
	};
	return str;
};
AST.Indentation = imba$class(function Indentation(a,b){
	this._open = a || 1;
	this._close = b || 1;
	this;
});

AST.Indentation.prototype.__open = {};
AST.Indentation.prototype.open = function(v){ return this._open; }
AST.Indentation.prototype.setOpen = function(v){ this._open = v; return this; }
;

AST.Indentation.prototype.__close = {};
AST.Indentation.prototype.close = function(v){ return this._close; }
AST.Indentation.prototype.setClose = function(v){ this._close = v; return this; }
;

AST.Indentation.prototype.wrap = function (str,o){
	var pre = this._open.pre;
	var post = this._open.post;
	var esc = AST.escapeComments;
	str = esc(post).replace(/^\n/,'') + str;
	str = str.replace(/^/g,"\t").replace(/\n/g,"\n\t").replace(/\n\t$/g,"\n");
	
	str = esc(pre) + '\n' + str;
	if(!(str[str.length - 1] == '\n')) {
		str = str + '\n';
	};
	
	return str;
};
AST.INDENT = new AST.Indentation();

AST.Stack = imba$class(function Stack(){
	this._nodes = [];
	this._scoping = [];
	this._scopes = [];
	this._loglevel = 3;
});

AST.Stack.prototype.__loglevel = {};
AST.Stack.prototype.loglevel = function(v){ return this._loglevel; }
AST.Stack.prototype.setLoglevel = function(v){ this._loglevel = v; return this; }
;

AST.Stack.prototype.__nodes = {};
AST.Stack.prototype.nodes = function(v){ return this._nodes; }
AST.Stack.prototype.setNodes = function(v){ this._nodes = v; return this; }
;

AST.Stack.prototype.__scopes = {};
AST.Stack.prototype.scopes = function(v){ return this._scopes; }
AST.Stack.prototype.setScopes = function(v){ this._scopes = v; return this; }
;

AST.Stack.prototype.addScope = function (scope){
	this._scopes.push(scope);
	return this;
};
AST.Stack.prototype.traverse = function (node){
	return this;
};
AST.Stack.prototype.push = function (node){
	this._nodes.push(node);
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
		if((node instanceof AST.Code) || (node instanceof AST.Loop)) {
			return false;
		};
		if(node.isExpression()) {
			return true;
		};
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
STACK = new AST.Stack();

AST.Node = imba$class(function Node(){
	this;
});

AST.Node.prototype.__o = {};
AST.Node.prototype.o = function(v){ return this._o; }
AST.Node.prototype.setO = function(v){ this._o = v; return this; }
;

AST.Node.prototype.__options = {};
AST.Node.prototype.options = function(v){ return this._options; }
AST.Node.prototype.setOptions = function(v){ this._options = v; return this; }
;

AST.Node.prototype.__traversed = {};
AST.Node.prototype.traversed = function(v){ return this._traversed; }
AST.Node.prototype.setTraversed = function(v){ this._traversed = v; return this; }
;

AST.Node.prototype.__statement = {};
AST.Node.prototype.statement = function(v){ return this._statement; }
AST.Node.prototype.setStatement = function(v){ this._statement = v; return this; }
;

AST.Node.prototype.safechain = function (){
	return false;
};
AST.Node.prototype.dom = function (){
	var name = "ast_" + this.constructor.name.replace(/([a-z])([A-Z])/g,"$1_$2").toLowerCase();
	if(Imba.TAGS[name]) {
		var node = Imba.tag(name);
		node.bind(this).build();
		return node;
	} else {
		return ("[" + name + "]");
	};
};
AST.Node.prototype.p = function (){
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
AST.Node.prototype.consume = function (node){
	if(node instanceof AST.PushAssign) {
		return new AST.PushAssign(node.op(),node.left(),this);
	};
	if(node instanceof AST.Assign) {
		return OP(node.op(),node.left(),this);
	} else {
		if(node instanceof AST.Op) {
			return OP(node.op(),node.left(),this);
		} else {
			if(node instanceof AST.Return) {
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
	var node = new AST.ExpressionBlock([this]);
	return node.addExpression(expr);
};
AST.Node.prototype.addComment = function (comment){
	this._comment = comment;
	return this;
};
AST.Node.prototype.indented = function (a,b){
	if(b instanceof Array) {
		this.add(b[0]);
		b = b[1];
	};
	this._indented = [a, b];
	this._indentation || (this._indentation = (a && b) ? (new AST.Indentation(a,b)) : (AST.INDENT));
	return this;
};
AST.Node.prototype.prebreak = function (term){
	if(term === undefined) term = '\n';
	console.log("prebreak!!!!");
	this._prebreak = this._prebreak || term;
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
	return this;
};
AST.Node.prototype.cachevar = function (){
	return this._cache && this._cache.var;
};
AST.Node.prototype.decache = function (){
	if(this._cache) {
		this.cachevar().free();
		this._cache = null;
	};
	return this;
};
AST.Node.prototype.predeclare = function (){
	if(this._cache) {
		this.scope__().vars().swap(this._cache.var,this);
	};
	return this;
};
AST.Node.prototype.alias = function (){
	return null;
};
AST.Node.prototype.warn = function (text,opts){
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
		};
		return this._cache.var.c();
	};
	STACK.push(this);
	if(o && o.expression) {
		this.forceExpression();
	};
	
	if(o && o.indent) {
		this._indentation || (this._indentation = AST.INDENT);
	};
	var out = this.js(STACK,o);
	
	var paren = this.shouldParenthesize();
	
	if(indent = this._indentation) {
		out = indent.wrap(out,o);
	};
	if(paren) {
		if(out instanceof Array) {
			out = ("(" + out + ")");
		} else {
			out = out.parenthesize();
		};
	};
	if(o && o.braces) {
		out = '{' + out + '}';
	};
	STACK.pop(this);
	
	if(this._cache) {
		if(!(this._cache.manual)) {
			out = ("" + (this._cache.var.c()) + "=" + out);
		};
		var par = STACK.current();
		if((par instanceof AST.Access) || (par instanceof AST.Op)) {
			out = out.parenthesize();
		};
		this._cache.cached = true;
	};
	if(this._temporary && this._temporary.length) {
		this._temporary.map(function (temp){
			return temp.decache();
		});
	};
	return out;
};
AST.Expression = imba$class(function Expression(){
	AST.Node.apply(this,arguments);
},AST.Node);

AST.ValueNode = imba$class(function ValueNode(value){
	this._value = this.load(value);
},AST.Node);

AST.ValueNode.prototype.__value = {};
AST.ValueNode.prototype.value = function(v){ return this._value; }
AST.ValueNode.prototype.setValue = function(v){ this._value = v; return this; }
;

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
AST.Statement = imba$class(function Statement(){
	AST.ValueNode.apply(this,arguments);
},AST.ValueNode);
AST.Statement.prototype.isExpressable = function (){
	return false;
};
AST.Statement.prototype.statement = function (){
	return true;
};
AST.Meta = imba$class(function Meta(){
	AST.ValueNode.apply(this,arguments);
},AST.ValueNode);

AST.Comment = imba$class(function Comment(){
	AST.Meta.apply(this,arguments);
},AST.Meta);
AST.Comment.prototype.c = function (o){
	return (o && o.expression || this._value.match(/\n/)) ? (("/*" + (this.value().c()) + "*/")) : (("// " + (this.value().c())));
};
AST.Terminator = imba$class(function Terminator(){
	AST.Meta.apply(this,arguments);
},AST.Meta);
AST.Terminator.prototype.c = function (){
	return this._value;
	return this.v();
};
AST.Newline = imba$class(function Newline(v){
	this._value = v || '\n';
},AST.Terminator);
AST.Newline.prototype.c = function (){
	return this._value;
};
AST.Index = imba$class(function Index(){
	AST.ValueNode.apply(this,arguments);
},AST.ValueNode);
AST.Index.prototype.js = function (){
	return this._value.c();
};
AST.NewLines = imba$class(function NewLines(){
	AST.ValueNode.apply(this,arguments);
},AST.ValueNode);
AST.NewLines.prototype.js = function (){
	return this._value;
};
AST.NewLines.prototype.isExpressable = function (){
	return true;
};
AST.ListNode = imba$class(function ListNode(list,options){
	if(list === undefined) list = [];
	if(options === undefined) options = {};
	this._nodes = this.load(list);
	this._options = options;
},AST.Node);

AST.ListNode.prototype.__nodes = {};
AST.ListNode.prototype.nodes = function(v){ return this._nodes; }
AST.ListNode.prototype.setNodes = function(v){ this._nodes = v; return this; }
;

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
AST.ListNode.prototype.slice = function (a,b){
	return new this.constructor(this._nodes.slice(a,b));
};
AST.ListNode.prototype.add = function (item){
	this.push(item);
	return this;
};
AST.ListNode.prototype.break = function (br,pre){
	if(pre === undefined) pre = false;
	if(typeof br == 'string') {
		br = new AST.Terminator(br);
	};
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
	if(!pars||pars.constructor !== Object) pars = {};
	var delim = pars.delim !== undefined ? pars.delim : this.delimiter();
	var indent = pars.indent !== undefined ? pars.indent : this._indentation;
	var nodes = pars.nodes !== undefined ? pars.nodes : this.nodes();
	var express = delim != ';';
	var shouldDelim = false;
	var nodes = nodes.compact();
	var last = this.last();
	var realLast = nodes[nodes.length - 1];
	
	var parts = nodes.map(function (arg){
		var out = arg.c({expression: express});
		
		if(arg instanceof AST.Meta) {
			true;
		} else {
			if(!express || arg != last) {
				out = out + delim;
			};
		};
		return out;
	});
	return parts.join("");
};
AST.ArgList = imba$class(function ArgList(){
	AST.ListNode.apply(this,arguments);
},AST.ListNode);
AST.ArgList.prototype.hasSplat = function (){
	return this.list().some(function (v){
		return v instanceof AST.Splat;
	});
};
AST.ArgList.prototype.delimiter = function (){
	return ",";
};
AST.AssignList = imba$class(function AssignList(){
	AST.ArgList.apply(this,arguments);
},AST.ArgList);
AST.AssignList.prototype.concat = function (other){
	if(this._nodes.length == 0 && (other instanceof AST.AssignList)) {
		return other;
	} else {
		AST.AssignList.prototype.__super.concat.apply(this,arguments);
	};
	return this;
};
AST.Block = imba$class(function Block(expr){
	var v_;
	if(expr === undefined) expr = [];
	(this.setNodes(v_=expr.flatten().compact() || []), v_);
},AST.ListNode);

AST.Block.prototype.__head = {};
AST.Block.prototype.head = function(v){ return this._head; }
AST.Block.prototype.setHead = function(v){ this._head = v; return this; }
;

AST.Block.wrap = function (ary){
	return (ary.length == 1 && (ary[0] instanceof AST.Block)) ? (ary[0]) : (new AST.Block(ary));
};
AST.Block.prototype.visit = function (){
	if(this._prebreak) {
		console.log("PREBREAK IN AST.BLOCK SHOULD THROW");
		this.first() && this.first().prebreak(this._prebreak);
	};
	return AST.Block.prototype.__super.visit.apply(this,arguments);
};
AST.Block.prototype.push = function (item,sep){
	this.nodes().push(item);
	return this;
};
AST.Block.prototype.block = function (){
	return this;
};
AST.Block.prototype.loc = function (){
	var opt, a, b;
	return (opt = this.option('ends')) ? (a = opt[0].loc(), b = opt[1].loc(), (!a) && (this.p(("no loc for " + (opt[0])))), (!b) && (this.p(("no loc for " + (opt[1])))), [a[0], b[1]]) : ([0, 0]);
};
AST.Block.prototype.unwrap = function (){
	var ary = [];
	for(var i=0, items=iter$(this.nodes()), len=items.length, node; i < len; i++){
		node = items[i];
		if(node instanceof AST.Block) {
			ary.push.apply(ary,node.unwrap());
		} else {
			ary.push(node);
		};
	};
	return ary;
};
AST.Block.prototype.compile = function (o){
	if(o === undefined) o = {};
	var root = new AST.Root(this,o);
	return root.compile(o);
};
AST.Block.prototype.analyze = function (o){
	if(o === undefined) o = {};
	return this;
};
AST.Block.prototype.js = function (o,opts){
	var $1;
	var l = this.nodes().length;
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
	
	if(express) {
		return AST.Block.prototype.__super.js.call(this,o,{delim: ',',nodes: ast});
	};
	var compile = function (node,i){
		var out = (node) ? (node.c()) : ("");
		if(out == "") {
			return null;
		};
		if(out instanceof Array) {
			out = out.flatten().compact().filter(filter).join(";\n");
		};
		var hasSemiColon = out.match(/;(\s*\/\/.*)?[\n\s\t]*$/);
		
		if(!(hasSemiColon || (node instanceof AST.Meta))) {
			out += ";";
		};
		return out;
	};
	ast = ast.map(compile);
	if(this._head) {
		var prefix = [];
		this._head.forEach(function (item){
			var out = compile(item);
			return (out) && (prefix.push(out + '\n'));
		});
		ast = prefix.concat(ast);
	};
	return ast = ast.compact().filter(filter).join("");
};
AST.Block.prototype.defers = function (original,replacement){
	var idx = this.nodes().indexOf(original);
	if(idx >= 0) {
		this.nodes()[idx] = replacement;
	};
	replacement._prebreak || (replacement._prebreak = original._prebreak);
	var rest = this.nodes().splice(idx + 1);
	return rest;
};
AST.Block.prototype.consume = function (node){
	var v_, before;
	if(node instanceof AST.TagTree) {
		this.setNodes(this.nodes().map(function (child){
			return child.consume(node);
		}));
		if(this.nodes().length > 1) {
			(this.setNodes(v_=[new AST.Arr(this.nodes())]), v_);
		};
		return this;
	};
	if(before = this.last()) {
		var after = before.consume(node);
		if(after != before) {
			this.replace(before,after);
		};
	};
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
	return this.option('express') || AST.Block.prototype.__super.isExpression.call(this);
};
AST.VarBlock = imba$class(function VarBlock(){
	AST.ListNode.apply(this,arguments);
},AST.ListNode);
AST.VarBlock.prototype.addExpression = function (expr){
	if(expr instanceof AST.Assign) {
		this.addExpression(expr.left());
		return new AST.TupleAssign('=',new AST.Tuple(this.nodes()),expr.right());
	} else {
		if(expr instanceof AST.VarOrAccess) {
			this.push(new AST.VarReference(expr.value()));
		} else {
			if((expr instanceof AST.Splat) && (expr.node() instanceof AST.VarOrAccess)) {
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
	return this;
};
AST.Parens = imba$class(function Parens(){
	AST.ValueNode.apply(this,arguments);
},AST.ValueNode);
AST.Parens.prototype.js = function (o){
	var par = this.up();
	
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
	if(this._noparen) {
		return false;
	};
	return true;
};
AST.Parens.prototype.prebreak = function (br){
	var $1;
	AST.Parens.prototype.__super.prebreak.call(this,br);
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
AST.ExpressionBlock = imba$class(function ExpressionBlock(){
	AST.ListNode.apply(this,arguments);
},AST.ListNode);
AST.ExpressionBlock.prototype.visit = function (){
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
	if(expr.node() instanceof AST.Assign) {
		this.push(expr.left());
		return new AST.TupleAssign('=',new AST.Tuple(this.nodes()),expr.right());
	} else {
		this.push(expr);
	};
	return this;
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
	return (typ == 'call') && ((pars[0].c() == 'return') && (pars[0] = 'tata'), new AST.Call(pars[0],pars[1],pars[2]));
};
AST.escapeComments = function (str){
	if(!str) {
		return '';
	};
	return str;
};
AST.Indentation = imba$class(function Indentation(a,b){
	this._open = a || 1;
	this._close = b || 1;
	this;
});

AST.Indentation.prototype.__open = {};
AST.Indentation.prototype.open = function(v){ return this._open; }
AST.Indentation.prototype.setOpen = function(v){ this._open = v; return this; }
;

AST.Indentation.prototype.__close = {};
AST.Indentation.prototype.close = function(v){ return this._close; }
AST.Indentation.prototype.setClose = function(v){ this._close = v; return this; }
;

AST.Indentation.prototype.wrap = function (str,o){
	var pre = this._open.pre;
	var post = this._open.post;
	var esc = AST.escapeComments;
	str = esc(post).replace(/^\n/,'') + str;
	str = str.replace(/^/g,"\t").replace(/\n/g,"\n\t").replace(/\n\t$/g,"\n");
	
	str = esc(pre) + '\n' + str;
	if(!(str[str.length - 1] == '\n')) {
		str = str + '\n';
	};
	
	return str;
};
AST.INDENT = new AST.Indentation();

AST.Stack = imba$class(function Stack(){
	this._nodes = [];
	this._scoping = [];
	this._scopes = [];
	this._loglevel = 3;
});

AST.Stack.prototype.__loglevel = {};
AST.Stack.prototype.loglevel = function(v){ return this._loglevel; }
AST.Stack.prototype.setLoglevel = function(v){ this._loglevel = v; return this; }
;

AST.Stack.prototype.__nodes = {};
AST.Stack.prototype.nodes = function(v){ return this._nodes; }
AST.Stack.prototype.setNodes = function(v){ this._nodes = v; return this; }
;

AST.Stack.prototype.__scopes = {};
AST.Stack.prototype.scopes = function(v){ return this._scopes; }
AST.Stack.prototype.setScopes = function(v){ this._scopes = v; return this; }
;

AST.Stack.prototype.addScope = function (scope){
	this._scopes.push(scope);
	return this;
};
AST.Stack.prototype.traverse = function (node){
	return this;
};
AST.Stack.prototype.push = function (node){
	this._nodes.push(node);
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
		if((node instanceof AST.Code) || (node instanceof AST.Loop)) {
			return false;
		};
		if(node.isExpression()) {
			return true;
		};
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
STACK = new AST.Stack();

AST.Node = imba$class(function Node(){
	this;
});

AST.Node.prototype.__o = {};
AST.Node.prototype.o = function(v){ return this._o; }
AST.Node.prototype.setO = function(v){ this._o = v; return this; }
;

AST.Node.prototype.__options = {};
AST.Node.prototype.options = function(v){ return this._options; }
AST.Node.prototype.setOptions = function(v){ this._options = v; return this; }
;

AST.Node.prototype.__traversed = {};
AST.Node.prototype.traversed = function(v){ return this._traversed; }
AST.Node.prototype.setTraversed = function(v){ this._traversed = v; return this; }
;

AST.Node.prototype.__statement = {};
AST.Node.prototype.statement = function(v){ return this._statement; }
AST.Node.prototype.setStatement = function(v){ this._statement = v; return this; }
;

AST.Node.prototype.safechain = function (){
	return false;
};
AST.Node.prototype.dom = function (){
	var name = "ast_" + this.constructor.name.replace(/([a-z])([A-Z])/g,"$1_$2").toLowerCase();
	if(Imba.TAGS[name]) {
		var node = Imba.tag(name);
		node.bind(this).build();
		return node;
	} else {
		return ("[" + name + "]");
	};
};
AST.Node.prototype.p = function (){
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
AST.Node.prototype.consume = function (node){
	if(node instanceof AST.PushAssign) {
		return new AST.PushAssign(node.op(),node.left(),this);
	};
	if(node instanceof AST.Assign) {
		return OP(node.op(),node.left(),this);
	} else {
		if(node instanceof AST.Op) {
			return OP(node.op(),node.left(),this);
		} else {
			if(node instanceof AST.Return) {
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
	var node = new AST.ExpressionBlock([this]);
	return node.addExpression(expr);
};
AST.Node.prototype.addComment = function (comment){
	this._comment = comment;
	return this;
};
AST.Node.prototype.indented = function (a,b){
	if(b instanceof Array) {
		this.add(b[0]);
		b = b[1];
	};
	this._indented = [a, b];
	this._indentation || (this._indentation = (a && b) ? (new AST.Indentation(a,b)) : (AST.INDENT));
	return this;
};
AST.Node.prototype.prebreak = function (term){
	if(term === undefined) term = '\n';
	console.log("prebreak!!!!");
	this._prebreak = this._prebreak || term;
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
	return this;
};
AST.Node.prototype.cachevar = function (){
	return this._cache && this._cache.var;
};
AST.Node.prototype.decache = function (){
	if(this._cache) {
		this.cachevar().free();
		this._cache = null;
	};
	return this;
};
AST.Node.prototype.predeclare = function (){
	if(this._cache) {
		this.scope__().vars().swap(this._cache.var,this);
	};
	return this;
};
AST.Node.prototype.alias = function (){
	return null;
};
AST.Node.prototype.warn = function (text,opts){
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
		};
		return this._cache.var.c();
	};
	STACK.push(this);
	if(o && o.expression) {
		this.forceExpression();
	};
	
	if(o && o.indent) {
		this._indentation || (this._indentation = AST.INDENT);
	};
	var out = this.js(STACK,o);
	
	var paren = this.shouldParenthesize();
	
	if(indent = this._indentation) {
		out = indent.wrap(out,o);
	};
	if(paren) {
		if(out instanceof Array) {
			out = ("(" + out + ")");
		} else {
			out = out.parenthesize();
		};
	};
	if(o && o.braces) {
		out = '{' + out + '}';
	};
	STACK.pop(this);
	
	if(this._cache) {
		if(!(this._cache.manual)) {
			out = ("" + (this._cache.var.c()) + "=" + out);
		};
		var par = STACK.current();
		if((par instanceof AST.Access) || (par instanceof AST.Op)) {
			out = out.parenthesize();
		};
		this._cache.cached = true;
	};
	if(this._temporary && this._temporary.length) {
		this._temporary.map(function (temp){
			return temp.decache();
		});
	};
	return out;
};
AST.Expression = imba$class(function Expression(){
	AST.Node.apply(this,arguments);
},AST.Node);

AST.ValueNode = imba$class(function ValueNode(value){
	this._value = this.load(value);
},AST.Node);

AST.ValueNode.prototype.__value = {};
AST.ValueNode.prototype.value = function(v){ return this._value; }
AST.ValueNode.prototype.setValue = function(v){ this._value = v; return this; }
;

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
AST.Statement = imba$class(function Statement(){
	AST.ValueNode.apply(this,arguments);
},AST.ValueNode);
AST.Statement.prototype.isExpressable = function (){
	return false;
};
AST.Statement.prototype.statement = function (){
	return true;
};
AST.Meta = imba$class(function Meta(){
	AST.ValueNode.apply(this,arguments);
},AST.ValueNode);

AST.Comment = imba$class(function Comment(){
	AST.Meta.apply(this,arguments);
},AST.Meta);
AST.Comment.prototype.c = function (o){
	return (o && o.expression || this._value.match(/\n/)) ? (("/*" + (this.value().c()) + "*/")) : (("// " + (this.value().c())));
};
AST.Terminator = imba$class(function Terminator(){
	AST.Meta.apply(this,arguments);
},AST.Meta);
AST.Terminator.prototype.c = function (){
	return this._value;
	return this.v();
};
AST.Newline = imba$class(function Newline(v){
	this._value = v || '\n';
},AST.Terminator);
AST.Newline.prototype.c = function (){
	return this._value;
};
AST.Index = imba$class(function Index(){
	AST.ValueNode.apply(this,arguments);
},AST.ValueNode);
AST.Index.prototype.js = function (){
	return this._value.c();
};
AST.NewLines = imba$class(function NewLines(){
	AST.ValueNode.apply(this,arguments);
},AST.ValueNode);
AST.NewLines.prototype.js = function (){
	return this._value;
};
AST.NewLines.prototype.isExpressable = function (){
	return true;
};
AST.ListNode = imba$class(function ListNode(list,options){
	if(list === undefined) list = [];
	if(options === undefined) options = {};
	this._nodes = this.load(list);
	this._options = options;
},AST.Node);

AST.ListNode.prototype.__nodes = {};
AST.ListNode.prototype.nodes = function(v){ return this._nodes; }
AST.ListNode.prototype.setNodes = function(v){ this._nodes = v; return this; }
;

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
AST.ListNode.prototype.slice = function (a,b){
	return new this.constructor(this._nodes.slice(a,b));
};
AST.ListNode.prototype.add = function (item){
	this.push(item);
	return this;
};
AST.ListNode.prototype.break = function (br,pre){
	if(pre === undefined) pre = false;
	if(typeof br == 'string') {
		br = new AST.Terminator(br);
	};
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
	if(!pars||pars.constructor !== Object) pars = {};
	var delim = pars.delim !== undefined ? pars.delim : this.delimiter();
	var indent = pars.indent !== undefined ? pars.indent : this._indentation;
	var nodes = pars.nodes !== undefined ? pars.nodes : this.nodes();
	var express = delim != ';';
	var shouldDelim = false;
	var nodes = nodes.compact();
	var last = this.last();
	var realLast = nodes[nodes.length - 1];
	
	var parts = nodes.map(function (arg){
		var out = arg.c({expression: express});
		
		if(arg instanceof AST.Meta) {
			true;
		} else {
			if(!express || arg != last) {
				out = out + delim;
			};
		};
		return out;
	});
	return parts.join("");
};
AST.ArgList = imba$class(function ArgList(){
	AST.ListNode.apply(this,arguments);
},AST.ListNode);
AST.ArgList.prototype.hasSplat = function (){
	return this.list().some(function (v){
		return v instanceof AST.Splat;
	});
};
AST.ArgList.prototype.delimiter = function (){
	return ",";
};
AST.AssignList = imba$class(function AssignList(){
	AST.ArgList.apply(this,arguments);
},AST.ArgList);
AST.AssignList.prototype.concat = function (other){
	if(this._nodes.length == 0 && (other instanceof AST.AssignList)) {
		return other;
	} else {
		AST.AssignList.prototype.__super.concat.apply(this,arguments);
	};
	return this;
};
AST.Block = imba$class(function Block(expr){
	var v_;
	if(expr === undefined) expr = [];
	(this.setNodes(v_=expr.flatten().compact() || []), v_);
},AST.ListNode);

AST.Block.prototype.__head = {};
AST.Block.prototype.head = function(v){ return this._head; }
AST.Block.prototype.setHead = function(v){ this._head = v; return this; }
;

AST.Block.wrap = function (ary){
	return (ary.length == 1 && (ary[0] instanceof AST.Block)) ? (ary[0]) : (new AST.Block(ary));
};
AST.Block.prototype.visit = function (){
	if(this._prebreak) {
		console.log("PREBREAK IN AST.BLOCK SHOULD THROW");
		this.first() && this.first().prebreak(this._prebreak);
	};
	return AST.Block.prototype.__super.visit.apply(this,arguments);
};
AST.Block.prototype.push = function (item,sep){
	this.nodes().push(item);
	return this;
};
AST.Block.prototype.block = function (){
	return this;
};
AST.Block.prototype.loc = function (){
	var opt, a, b;
	return (opt = this.option('ends')) ? (a = opt[0].loc(), b = opt[1].loc(), (!a) && (this.p(("no loc for " + (opt[0])))), (!b) && (this.p(("no loc for " + (opt[1])))), [a[0], b[1]]) : ([0, 0]);
};
AST.Block.prototype.unwrap = function (){
	var ary = [];
	for(var i=0, items=iter$(this.nodes()), len=items.length, node; i < len; i++){
		node = items[i];
		if(node instanceof AST.Block) {
			ary.push.apply(ary,node.unwrap());
		} else {
			ary.push(node);
		};
	};
	return ary;
};
AST.Block.prototype.compile = function (o){
	if(o === undefined) o = {};
	var root = new AST.Root(this,o);
	return root.compile(o);
};
AST.Block.prototype.analyze = function (o){
	if(o === undefined) o = {};
	return this;
};
AST.Block.prototype.js = function (o,opts){
	var $1;
	var l = this.nodes().length;
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
	
	if(express) {
		return AST.Block.prototype.__super.js.call(this,o,{delim: ',',nodes: ast});
	};
	var compile = function (node,i){
		var out = (node) ? (node.c()) : ("");
		if(out == "") {
			return null;
		};
		if(out instanceof Array) {
			out = out.flatten().compact().filter(filter).join(";\n");
		};
		var hasSemiColon = out.match(/;(\s*\/\/.*)?[\n\s\t]*$/);
		
		if(!(hasSemiColon || (node instanceof AST.Meta))) {
			out += ";";
		};
		return out;
	};
	ast = ast.map(compile);
	if(this._head) {
		var prefix = [];
		this._head.forEach(function (item){
			var out = compile(item);
			return (out) && (prefix.push(out + '\n'));
		});
		ast = prefix.concat(ast);
	};
	return ast = ast.compact().filter(filter).join("");
};
AST.Block.prototype.defers = function (original,replacement){
	var idx = this.nodes().indexOf(original);
	if(idx >= 0) {
		this.nodes()[idx] = replacement;
	};
	replacement._prebreak || (replacement._prebreak = original._prebreak);
	var rest = this.nodes().splice(idx + 1);
	return rest;
};
AST.Block.prototype.consume = function (node){
	var v_, before;
	if(node instanceof AST.TagTree) {
		this.setNodes(this.nodes().map(function (child){
			return child.consume(node);
		}));
		if(this.nodes().length > 1) {
			(this.setNodes(v_=[new AST.Arr(this.nodes())]), v_);
		};
		return this;
	};
	if(before = this.last()) {
		var after = before.consume(node);
		if(after != before) {
			this.replace(before,after);
		};
	};
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
	return this.option('express') || AST.Block.prototype.__super.isExpression.call(this);
};
AST.VarBlock = imba$class(function VarBlock(){
	AST.ListNode.apply(this,arguments);
},AST.ListNode);
AST.VarBlock.prototype.addExpression = function (expr){
	if(expr instanceof AST.Assign) {
		this.addExpression(expr.left());
		return new AST.TupleAssign('=',new AST.Tuple(this.nodes()),expr.right());
	} else {
		if(expr instanceof AST.VarOrAccess) {
			this.push(new AST.VarReference(expr.value()));
		} else {
			if((expr instanceof AST.Splat) && (expr.node() instanceof AST.VarOrAccess)) {
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
	return this;
};
AST.Parens = imba$class(function Parens(){
	AST.ValueNode.apply(this,arguments);
},AST.ValueNode);
AST.Parens.prototype.js = function (o){
	var par = this.up();
	
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
	if(this._noparen) {
		return false;
	};
	return true;
};
AST.Parens.prototype.prebreak = function (br){
	var $1;
	AST.Parens.prototype.__super.prebreak.call(this,br);
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
AST.ExpressionBlock = imba$class(function ExpressionBlock(){
	AST.ListNode.apply(this,arguments);
},AST.ListNode);
AST.ExpressionBlock.prototype.visit = function (){
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
	if(expr.node() instanceof AST.Assign) {
		this.push(expr.left());
		return new AST.TupleAssign('=',new AST.Tuple(this.nodes()),expr.right());
	} else {
		this.push(expr);
	};
	return this;
};
}())