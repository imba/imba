(function(){


	function idx$(a,b){
		return (b && b.indexOf) ? b.indexOf(a) : [].indexOf.call(a,b);
	};
	
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
	
	function iter$(a){ return a ? (a.toArray ? a.toArray() : a) : []; };
	var AST, OP, OP_COMPOUND, SPLAT, BR, BR2, SELF, SUPER, TRUE, FALSE, ARGUMENTS, EMPTY, NULL, RESERVED, RESERVED_REGEX, UNION, INTERSECT, CLASSDEF, TAGDEF, NEWTAG;
	// TODO Create Expression - make all expressions inherit from these?
	
	// externs;
	
	var helpers = require('./helpers');
	
	module.exports.AST = AST = {};
	
	// Helpers for operators
	module.exports.OP = OP = function (op,left,right,opts){
		var opstr = String(op);
		
		if(opstr == '.') {
			if((typeof right=='string'||right instanceof String)) {
				right = new Identifier(right);
			};
			
			return new Access(op,left,right);
		} else if(opstr == '=') {
			if(left instanceof Tuple) {
				return new TupleAssign(op,left,right);
			};
			return new Assign(op,left,right);
		} else {
			return (idx$(opstr,['?=','||=','&&=']) >= 0) ? (
				new ConditionalAssign(op,left,right)
			) : ((idx$(opstr,['+=','-=','*=','/=','^=','%=']) >= 0) ? (
				new CompoundAssign(op,left,right)
			) : ((opstr == 'instanceof') ? (
				new InstanceOf(op,left,right)
			) : ((opstr == 'in') ? (
				new In(op,left,right)
			) : ((opstr == 'typeof') ? (
				new TypeOf(op,left,right)
			) : ((opstr == 'delete') ? (
				new Delete(op,left,right)
			) : ((idx$(opstr,['--','++','!','√']) >= 0) ? (
				new UnaryOp(op,left,right)
			) : ((idx$(opstr,['>','<','>=','<=','==','===','!=','!==']) >= 0) ? (
				new ComparisonOp(op,left,right)
			) : ((idx$(opstr,['∩','∪']) >= 0) ? (
				new MathOp(op,left,right)
			) : ((idx$(opstr,['..','...']) >= 0) ? (
				new Range(op,left,right)
			) : (
				new Op(op,left,right)
			))))))))))
		};
	};
	
	module.exports.OP_COMPOUND = OP_COMPOUND = function (sym,op,l,r){
		if(sym == '?=' || sym == '||=' || sym == '&&=') {
			return new ConditionalAssign(op,l,r);
		} else {
			return new CompoundAssign(op,l,r);
		};
	};
	
	LIT = function (val){
		return new Literal(val);
	};
	
	SYM = function (val){
		return new Symbol(val);
	};
	
	IF = function (cond,body,alt){
		var node = new If(cond,body);
		if(alt) {
			node.addElse(alt);
		};
		return node;
	};
	
	FN = function (pars,body){
		return new Func(pars,body);
	};
	
	CALL = function (callee,pars){
		if(pars === undefined) pars = [];
		return new Call(callee,pars);
	};
	
	CALLSELF = function (name,pars){
		if(pars === undefined) pars = [];
		var ref = new Identifier(name);
		return new Call(OP('.',SELF,ref),pars);
	};
	
	BLOCK = function (){
		return Block.wrap([].slice.call(arguments));
	};
	
	WHILE = function (test,code){
		return new While(test).addBody(code);
	};
	
	module.exports.SPLAT = SPLAT = function (value){
		if(value instanceof Assign) {
			value.setLeft(new Splat(value.left()));
			return value;
		} else {
			return new Splat(value);
			// not sure about this
		};
	};
	
	OP.ASSIGNMENT = ["=","+=","-=","*=","/=","%=","<<=",">>=",">>>=","|=","^=","&="];
	OP.LOGICAL = ["||","&&"];
	OP.UNARY = ["++","--"];
	
	LOC = function (loc){
		return this;
	};
	
	// hmmm
	function c__(obj){
		return (typeof obj == 'string') ? (obj) : (obj.c());
	};
	
	function num__(num){
		return new Num(num);
	};
	
	function str__(str){
		return new Str(str);
	};
	
	function blk__(obj){
		return (obj instanceof Array) ? (Block.wrap(obj)) : (obj);
	};
	
	function sym__(obj){
		return helpers.symbolize(String(obj));
	};
	
	function cary__(ary){
		return ary.map(function (v){
			return (typeof v == 'string') ? (v) : (v.c());
		});
	};
	
	AST.dump = function (obj,key){
		return (obj instanceof Array) ? (
			obj.map(function (v){
				return (v && v.dump) ? (v.dump(key)) : (v);
			})
		) : ((obj && obj.dump) && (
			obj.dump()
		));
	};
	
	
	function compact__(ary){
		if(ary instanceof ListNode) {
			return ary.compact();
		};
		
		return ary.filter(function (v){
			return v != undefined && v != null;
		});
	};
	
	function flatten__(ary,compact){
		if(compact === undefined) compact = false;
		var out = [];
		ary.forEach(function (v){
			return (v instanceof Array) ? (out.push.apply(out,flatten__(v))) : (out.push(v));
		});
		return out;
	};
	
	AST.parse = function (str,opts){
		if(opts === undefined) opts = {};
		var indent = str.match(/\t+/)[0];
		return Imba.parse(str,opts);
	};
	
	AST.inline = function (str,opts){
		if(opts === undefined) opts = {};
		return this.parse(str,opts).body();
	};
	
	AST.node = function (typ,pars){
		return (typ == 'call') && (
			(pars[0].c() == 'return') && (
				pars[0] = 'tata'
			),
			new Call(pars[0],pars[1],pars[2])
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
	function Indentation(a,b){
		this._open = a || 1;
		this._close = b || 1;
		this;
	};
	
	exports.Indentation = Indentation; // export class 
	
	Indentation.prototype.__open = {};
	Indentation.prototype.open = function(v){ return this._open; }
	Indentation.prototype.setOpen = function(v){ this._open = v; return this; };
	
	Indentation.prototype.__close = {};
	Indentation.prototype.close = function(v){ return this._close; }
	Indentation.prototype.setClose = function(v){ this._close = v; return this; };
	
	
	
	// should rather parse and extract the comments, no?
	Indentation.prototype.wrap = function (str,o){
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
	
	
	INDENT = new Indentation();
	
	/* @class Stack */
	function Stack(){
		this._nodes = [];
		this._scoping = [];
		this._scopes = [];// for analysis - should rename
		this._loglevel = 3;
	};
	
	exports.Stack = Stack; // export class 
	
	Stack.prototype.__loglevel = {};
	Stack.prototype.loglevel = function(v){ return this._loglevel; }
	Stack.prototype.setLoglevel = function(v){ this._loglevel = v; return this; };
	
	Stack.prototype.__nodes = {};
	Stack.prototype.nodes = function(v){ return this._nodes; }
	Stack.prototype.setNodes = function(v){ this._nodes = v; return this; };
	
	Stack.prototype.__scopes = {};
	Stack.prototype.scopes = function(v){ return this._scopes; }
	Stack.prototype.setScopes = function(v){ this._scopes = v; return this; };
	
	
	
	Stack.prototype.addScope = function (scope){
		this._scopes.push(scope);
		return this;
	};
	
	Stack.prototype.traverse = function (node){
		return this;
	};
	
	Stack.prototype.push = function (node){
		this._nodes.push(node);
		// not sure if we have already defined a scope?
		return this;
	};
	
	Stack.prototype.pop = function (node){
		this._nodes.pop(node);
		return this;
	};
	
	Stack.prototype.parent = function (){
		return this._nodes[this._nodes.length - 2];
	};
	
	Stack.prototype.current = function (){
		return this._nodes[this._nodes.length - 1];
	};
	
	Stack.prototype.up = function (test){
		test || (test = function (v){
			return !(v instanceof VarOrAccess);
		});
		
		if(test.prototype instanceof Node) {
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
	
	Stack.prototype.relative = function (node,offset){
		if(offset === undefined) offset = 0;
		var idx = this._nodes.indexOf(node);
		return (idx >= 0) ? (this._nodes[idx + offset]) : (null);
	};
	
	Stack.prototype.scope = function (lvl){
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
	
	Stack.prototype.scopes = function (){
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
	
	Stack.prototype.method = function (){
		return this.up(MethodDeclaration);
	};
	
	Stack.prototype.isExpression = function (){
		var i = this._nodes.length - 1;
		while(i >= 0){
			var node = this._nodes[i];
			// why are we not using isExpression here as well?
			if((node instanceof Code) || (node instanceof Loop)) {
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
	
	Stack.prototype.toString = function (){
		return "Stack(" + (this._nodes.join(" -> ")) + ")";
	};
	
	Stack.prototype.scoping = function (){
		return this._nodes.filter(function (n){
			return n._scope;
		}).map(function (n){
			return n._scope;
		});
	};
	
	
	// Lots of globals -- really need to deal with one stack per file / context
	STACK = new Stack();
	
	/* @class Node */
	function Node(){
		this;
	};
	
	exports.Node = Node; // export class 
	
	Node.prototype.__o = {};
	Node.prototype.o = function(v){ return this._o; }
	Node.prototype.setO = function(v){ this._o = v; return this; };
	
	Node.prototype.__options = {};
	Node.prototype.options = function(v){ return this._options; }
	Node.prototype.setOptions = function(v){ this._options = v; return this; };
	
	Node.prototype.__traversed = {};
	Node.prototype.traversed = function(v){ return this._traversed; }
	Node.prototype.setTraversed = function(v){ this._traversed = v; return this; };
	
	Node.prototype.__statement = {};
	Node.prototype.statement = function(v){ return this._statement; }
	Node.prototype.setStatement = function(v){ this._statement = v; return this; };
	
	Node.prototype.safechain = function (){
		return false;
	};
	
	Node.prototype.dom = function (){
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
	
	Node.prototype.p = function (){
		if(STACK.loglevel() > 0) {
			console.log.apply(console,arguments);
		};
		return this;
	};
	
	
	
	Node.prototype.set = function (obj){
		this._options || (this._options = {});
		for(var o=obj, i=0, keys=Object.keys(o), l=keys.length; i < l; i++){
			this._options[keys[i]] = o[keys[i]];
		};
		return this;
	};
	
	// get and set
	Node.prototype.option = function (key,val){
		if(val != undefined) {
			this._options || (this._options = {});
			this._options[key] = val;
			return this;
		};
		
		return this._options && this._options[key];
	};
	
	Node.prototype.configure = function (obj){
		return this.set(obj);
	};
	
	Node.prototype.region = function (){
		return [];
	};
	
	Node.prototype.loc = function (){
		return [];
	};
	
	Node.prototype.toAST = function (){
		return this;
	};
	
	Node.prototype.compile = function (){
		return this;
	};
	
	Node.prototype.visit = function (){
		return this;
	};
	
	Node.prototype.stack = function (){
		return STACK;
	};
	
	Node.prototype.traverse = function (o,up,key,index){
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
	
	Node.prototype.inspect = function (){
		return {type: this.constructor.toString()};
	};
	
	Node.prototype.js = function (){
		return "NODE";
	};
	
	Node.prototype.toString = function (){
		return "" + (this.constructor.name);
	};
	
	// swallow might be better name
	Node.prototype.consume = function (node){
		if(node instanceof PushAssign) {
			return new PushAssign(node.op(),node.left(),this);
		};
		
		if(node instanceof Assign) {
			return OP(node.op(),node.left(),this);
		} else if(node instanceof Op) {
			return OP(node.op(),node.left(),this);
		} else if(node instanceof Return) {
			return new Return(this);
		};
		return this;
	};
	
	Node.prototype.toExpression = function (){
		this._expression = true;
		return this;
	};
	
	Node.prototype.forceExpression = function (){
		this._expression = true;
		return this;
	};
	
	Node.prototype.isExpressable = function (){
		return true;
	};
	
	Node.prototype.isExpression = function (){
		return this._expression || false;
	};
	
	Node.prototype.hasSideEffects = function (){
		return true;
	};
	
	Node.prototype.isUsed = function (){
		return true;
	};
	
	Node.prototype.shouldParenthesize = function (){
		return false;
	};
	
	Node.prototype.block = function (){
		throw new SyntaxError("dont call");
		return Block.wrap([this]);
	};
	
	Node.prototype.node = function (){
		return this;
	};
	
	Node.prototype.scope__ = function (){
		return STACK.scope();
	};
	
	Node.prototype.up = function (){
		return STACK.parent();
	};
	
	Node.prototype.util = function (){
		return Util;
	};
	
	Node.prototype.receiver = function (){
		return this;
	};
	
	Node.prototype.addExpression = function (expr){
		var node = new ExpressionBlock([this]);
		return node.addExpression(expr);
	};
	
	
	Node.prototype.indented = function (a,b){
		if(b instanceof Array) {
			this.add(b[0]);
			b = b[1];
		};
		
		// if indent and indent.match(/\:/)
		this._indented = [a,b];
		this._indentation || (this._indentation = (a && b) ? (new Indentation(a,b)) : (INDENT));
		return this;
	};
	
	Node.prototype.prebreak = function (term){
		if(term === undefined) term = '\n';
		return this;
	};
	
	Node.prototype.invert = function (){
		return OP('!',this);
	};
	
	Node.prototype.cache = function (o){
		if(o === undefined) o = {};
		this._cache = o;
		o.var = this.scope__().temporary(this,o);
		o.lookups = 0;
		// o:lookups = 0
		return this;
	};
	
	Node.prototype.cachevar = function (){
		return this._cache && this._cache.var;
	};
	
	Node.prototype.decache = function (){
		if(this._cache) {
			this.cachevar().free();
			this._cache = null;// hmm, removing the cache WARN
		};
		return this;
	};
	
	// is this without side-effects? hmm - what does it even do?
	Node.prototype.predeclare = function (){
		if(this._cache) {
			this.scope__().vars().swap(this._cache.var,this);
		};
		return this;
	};
	
	// the "name-suggestion" for nodes if they need to be cached
	Node.prototype.alias = function (){
		return null;
	};
	
	Node.prototype.warn = function (text,opts){
		if(opts === undefined) opts = {};
		opts.message = text;
		opts.loc || (opts.loc = this.loc());
		this.scope__().root().warn(opts);
		return this;
	};
	
	Node.prototype.c = function (o){
		var indent;
		var s = STACK;
		var ch = this._cache;
		if(ch && ch.cached) {
			return this.c_cached(ch);
		};
		
		s.push(this);
		if(o && o.expression) {
			this.forceExpression();
		};
		
		if(o && o.indent) {
			this._indentation || (this._indentation = INDENT);
		};
		
		var out = this.js(s,o);
		
		var paren = this.shouldParenthesize();
		
		if(indent = this._indentation) {
			out = indent.wrap(out,o);
		};
		
		if(paren) {
			out = ("(" + out + ")");
		};
		if(o && o.braces) {
			out = '{' + out + '}';
		};
		
		s.pop(this);
		
		if(ch = this._cache) {
			if(!(ch.manual)) {
				out = ("" + (ch.var.c()) + "=" + out);
			};
			var par = s.current();
			if((par instanceof Access) || (par instanceof Op)) {
				out = '(' + out + ')';
			};// others? # 
			ch.cached = true;
		};
		
		// most of these should never be needed?
		// where?!?
		if(this._temporary && this._temporary.length) {
			this._temporary.map(function (temp){
				return temp.decache();
			});
		};
		
		return out;
	};
	
	Node.prototype.c_cached = function (cache){
		(cache.lookups)++;
		if(cache.uses == cache.lookups) {
			cache.var.free();
		};
		return cache.var.c();// recompile every time??
	};
	
	
	
	/* @class Expression */
	function Expression(){ Node.apply(this,arguments) };
	
	subclass$(Expression,Node);
	exports.Expression = Expression; // export class 
	
	
	/* @class ValueNode */
	function ValueNode(value){
		this._value = this.load(value);
	};
	
	subclass$(ValueNode,Node);
	exports.ValueNode = ValueNode; // export class 
	
	ValueNode.prototype.__value = {};
	ValueNode.prototype.value = function(v){ return this._value; }
	ValueNode.prototype.setValue = function(v){ this._value = v; return this; };
	
	
	
	ValueNode.prototype.load = function (value){
		return value;
	};
	
	ValueNode.prototype.js = function (){
		return (typeof this._value == 'string') ? (this._value) : (this._value.c());
	};
	
	ValueNode.prototype.visit = function (){
		if(this._value instanceof Node) {
			this._value.traverse();
		};//  && @value:traverse
		return this;
	};
	
	ValueNode.prototype.region = function (){
		return this._value._region;
	};
	
	
	/* @class Statement */
	function Statement(){ ValueNode.apply(this,arguments) };
	
	subclass$(Statement,ValueNode);
	exports.Statement = Statement; // export class 
	Statement.prototype.isExpressable = function (){
		return false;
	};
	
	Statement.prototype.statement = function (){
		return true;
	};
	
	
	
	/* @class Meta */
	function Meta(){ ValueNode.apply(this,arguments) };
	
	subclass$(Meta,ValueNode);
	exports.Meta = Meta; // export class 
	
	
	/* @class Comment */
	function Comment(){ Meta.apply(this,arguments) };
	
	subclass$(Comment,Meta);
	exports.Comment = Comment; // export class 
	Comment.prototype.c = function (o){
		var v = this._value._value;// hmm 
		return (o && o.expression || v.match(/\n/)) ? (
			("/*" + v + "*/")
		) : (
			("// " + v)
		);
	};
	
	
	
	/* @class Terminator */
	function Terminator(){ Meta.apply(this,arguments) };
	
	subclass$(Terminator,Meta);
	exports.Terminator = Terminator; // export class 
	Terminator.prototype.c = function (){
		return this._value.c();
		// var v = value.replace(/\\n/g,'\n')
		return this.v();// .split()
		// v.split("\n").map(|v| v ? " // {v}" : v).join("\n")
	};
	
	
	/* @class Newline */
	function Newline(v){
		this._value = v || '\n';
	};
	
	subclass$(Newline,Terminator);
	exports.Newline = Newline; // export class 
	
	
	Newline.prototype.c = function (){
		return this._value.c();
	};
	
	
	
	// weird place?
	/* @class Index */
	function Index(){ ValueNode.apply(this,arguments) };
	
	subclass$(Index,ValueNode);
	exports.Index = Index; // export class 
	Index.prototype.js = function (){
		return this._value.c();
	};
	
	
	/* @class ListNode */
	function ListNode(list,options){
		if(list === undefined) list = [];
		if(options === undefined) options = {};
		this._nodes = this.load(list);
		this._options = options;
	};
	
	subclass$(ListNode,Node);
	exports.ListNode = ListNode; // export class 
	
	ListNode.prototype.__nodes = {};
	ListNode.prototype.nodes = function(v){ return this._nodes; }
	ListNode.prototype.setNodes = function(v){ this._nodes = v; return this; };
	
	
	
	// PERF acces @nodes directly?
	ListNode.prototype.list = function (){
		return this._nodes;
	};
	
	ListNode.prototype.compact = function (){
		this._nodes = compact__(this._nodes);
		return this;
	};
	
	ListNode.prototype.load = function (list){
		return list;
	};
	
	ListNode.prototype.concat = function (other){
		this._nodes = this.nodes().concat((other instanceof Array) ? (other) : (other.nodes()));
		return this;
	};
	
	ListNode.prototype.swap = function (item,other){
		var idx = this.indexOf(item);
		if(idx >= 0) {
			this.nodes()[idx] = other;
		};
		return this;
	};
	
	ListNode.prototype.push = function (item){
		this.nodes().push(item);
		return this;
	};
	
	ListNode.prototype.unshift = function (item,br){
		if(br) {
			this.nodes().unshift(BR);
		};
		this.nodes().unshift(item);
		return this;
	};
	
	// test
	ListNode.prototype.slice = function (a,b){
		return new this.constructor(this._nodes.slice(a,b));
	};
	
	ListNode.prototype.add = function (item){
		this.push(item);
		return this;
	};
	
	ListNode.prototype.break = function (br,pre){
		if(pre === undefined) pre = false;
		if(typeof br == 'string') {
			br = new Terminator(br);
		};// hmmm?
		if(pre) {
			this.unshift(br);
		} else {
			this.push(br);
		};
		return this;
	};
	
	ListNode.prototype.some = function (cb){
		return this.nodes().some(cb);
	};
	
	ListNode.prototype.every = function (cb){
		return this.nodes().every(cb);
	};
	
	ListNode.prototype.filter = function (cb){
		if(cb.prototype instanceof Node) {
			var ary = [];
			this.nodes().forEach(function (n){
				return (n instanceof cb) && (ary.push(n));
			});
			return ary;
		};
		
		return this.nodes().filter(cb);
	};
	
	ListNode.prototype.pluck = function (cb){
		var item = this.filter(cb)[0];
		if(item) {
			this.remove(item);
		};
		return item;
	};
	
	ListNode.prototype.indexOf = function (item){
		return this.nodes().indexOf(item);
	};
	
	ListNode.prototype.index = function (i){
		return this.nodes()[i];
	};
	
	ListNode.prototype.remove = function (item){
		var idx = this.list().indexOf(item);
		if(idx >= 0) {
			this.list().splice(idx,1);
		};
		return this;
	};
	
	ListNode.prototype.first = function (){
		return this.list()[0];
	};
	
	// def last
	// list[list:length - 1]
	
	ListNode.prototype.last = function (){
		var i = this._nodes.length;
		while(i){
			i = i - 1;
			var v = this._nodes[i];
			if(!((v instanceof Meta))) {
				return v;
			};
		};
		return null;
	};
	
	ListNode.prototype.map = function (fn){
		return this.list().map(fn);
	};
	
	ListNode.prototype.forEach = function (fn){
		return this.list().forEach(fn);
	};
	
	ListNode.prototype.remap = function (fn){
		this._nodes = this.map(fn);
		return this;
	};
	
	ListNode.prototype.count = function (){
		return this.list().length;
	};
	
	ListNode.prototype.replace = function (original,replacement){
		var idx = this.nodes().indexOf(original);
		if(idx >= 0) {
			this.nodes()[idx] = replacement;
		};
		return this;
	};
	
	
	ListNode.prototype.visit = function (){
		this._nodes.forEach(function (node){
			return node.traverse();
		});
		return this;
	};
	
	ListNode.prototype.isExpressable = function (){
		if(!this.nodes().every(function (v){
			return v.isExpressable();
		})) {
			return false;
		};
		return true;
	};
	
	ListNode.prototype.toArray = function (){
		return this._nodes;
	};
	
	ListNode.prototype.delimiter = function (){
		return this._delimiter || ",";
	};
	
	ListNode.prototype.js = function (o,pars){
		if(!pars||pars.constructor !== Object) pars = {};
		var delim = pars.delim !== undefined ? pars.delim : this.delimiter();
		var indent = pars.indent !== undefined ? pars.indent : this._indentation;
		var nodes = pars.nodes !== undefined ? pars.nodes : this.nodes();
		var express = delim != ';';
		var shouldDelim = false;
		var nodes = compact__(nodes);
		var last = this.last();
		var realLast = nodes[nodes.length - 1];
		// need to find the last node that is not a comment or newline?
		
		var parts = nodes.map(function (arg){
			var out = (typeof arg == 'string') ? (arg) : (arg.c({expression: express}));
			// if var br = arg.@prebreak
			// 	indent = yes # force indentation if one item is indented for now
			// 	out = br.replace(/\\n/g,"\n") + out #  '\n' + arg.@prebreak + out 
			// 	console.log "prebreak!!"
			// out = delim + out if shouldDelim
			// else
			// out = delim + " " + out if shouldDelim
			
			if(arg instanceof Meta) {
				true;
				// console.log "argument is a comment!"
				// shouldDelim = no
			} else {
				if(!express || arg != last) {
					out = out + delim;
				};
			};
			return out;
		});
		
		return parts.join("");
	};
	
	
	
	/* @class ArgList */
	function ArgList(){ ListNode.apply(this,arguments) };
	
	subclass$(ArgList,ListNode);
	exports.ArgList = ArgList; // export class 
	ArgList.prototype.hasSplat = function (){
		return this.list().some(function (v){
			return v instanceof Splat;
		});
	};
	
	ArgList.prototype.delimiter = function (){
		return ",";
	};
	
	
	
	/* @class AssignList */
	function AssignList(){ ArgList.apply(this,arguments) };
	
	subclass$(AssignList,ArgList);
	exports.AssignList = AssignList; // export class 
	AssignList.prototype.concat = function (other){
		if(this._nodes.length == 0 && (other instanceof AssignList)) {
			return other;
		} else {
			AssignList.__super__.concat.apply(this,arguments);
		};
		// need to store indented content as well?
		// @nodes = nodes.concat(other isa Array ? other : other.nodes)
		return this;
	};
	
	
	
	/* @class Block */
	function Block(expr){
		var v_;
		if(expr === undefined) expr = [];
		(this.setNodes(v_=compact__(flatten__(expr)) || []),v_);
	};
	
	subclass$(Block,ListNode);
	exports.Block = Block; // export class 
	
	Block.prototype.__head = {};
	Block.prototype.head = function(v){ return this._head; }
	Block.prototype.setHead = function(v){ this._head = v; return this; };
	
	
	Block.wrap = function (ary){
		if(!((ary instanceof Array))) {
			throw new SyntaxError("what");
		};
		return (ary.length == 1 && (ary[0] instanceof Block)) ? (ary[0]) : (new Block(ary));
	};
	
	
	// def visit
	// 	# @indentation ||= INDENT
	// 	
	// 	if @prebreak # hmm
	// 		# are we sure?
	// 		# console.log "PREBREAK IN BLOCK SHOULD THROW"
	// 		first and first.prebreak(@prebreak)
	// 	super
	
	
	Block.prototype.push = function (item){
		this.nodes().push(item);
		return this;
	};
	
	
	Block.prototype.block = function (){
		return this;
	};
	
	
	Block.prototype.loc = function (){
		var opt, a, b;
		return (opt = this.option('ends')) ? (
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
	Block.prototype.unwrap = function (){
		var ary = [];
		for(var i=0, items=iter$(this.nodes()), len=items.length, node; i < len; i++) {
			node = items[i];if(node instanceof Block) {
				ary.push.apply(ary,node.unwrap());
			} else {
				ary.push(node);
			};
		};
		return ary;
	};
	
	
	// This is just to work as an inplace replacement of nodes.coffee
	// After things are working okay we'll do bigger refactorings
	Block.prototype.compile = function (o){
		if(o === undefined) o = {};
		var root = new Root(this,o);
		return root.compile(o);
	};
	
	
	// Not sure if we should create a separate block?
	Block.prototype.analyze = function (o){
		if(o === undefined) o = {};
		return this;
	};
	
	
	Block.prototype.js = function (o,opts){
		var $1;
		var l = this.nodes().length;
		// var filter = 
		var filter = (function (n){
			return n != null && n != undefined && n != EMPTY;
		});
		var ast = compact__(flatten__(this.nodes())).filter(function (n){
			return n != null && n != undefined && n != EMPTY;
		});
		var express = this.isExpression() || o.isExpression() || (this.option('express') && this.isExpressable());
		if(ast.length == 0) {
			return null;
		};
		
		// return super(o, delim: ';', indent: no)
		
		if(express) {
			return Block.__super__.js.call(this,o,{delim: ',',nodes: ast});
		};
		
		// should probably delegate to super for ; as well
		// else
		// 	return super(o,delim: ';', nodes: ast)
		// return ast.c.flatten__.compact.join(", ")
		
		var compile = function (node,i){
			var out = (typeof node == 'string') ? (node) : (((node) ? (node.c()) : ("")));
			if(out == "") {
				return null;
			};
			
			// FIXME should never happen
			// we need to handle it in a better way - results in ugly output
			if(out instanceof Array) {
				out = compact__(flatten__(out)).filter(filter).join(";\n");
			};
			// console.log "compiled {node} {out}"
			var hasSemiColon = out.match(/;(\s*\/\/.*)?[\n\s\t]*$/);// out[out:length - 1] == ";"
			
			if(!(hasSemiColon || (node instanceof Meta))) {
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
			flatten__(this._head).forEach(function (item){
				var out = compile(item);
				return (out) && (prefix.push(out + '\n'));
			});
			
			ast = prefix.concat(ast);
			// var ln = node.@newlines or 1
			// c += Array(ln + 1).join("\n") # "\n"
		};
		
		return ast = compact__(ast).filter(filter).join("");// .replace(/[\s\n]+$/,'')  # hmm really?
		
		// @indentation ? @indentation.wrap(ast,opts) : ast
	};
	
	
	// Should this create the function as well?
	Block.prototype.defers = function (original,replacement){
		var idx = this.nodes().indexOf(original);
		if(idx >= 0) {
			this.nodes()[idx] = replacement;
		};
		// now return the nodes after this
		replacement._prebreak || (replacement._prebreak = original._prebreak);// hacky
		var rest = this.nodes().splice(idx + 1);
		return rest;
	};
	
	
	Block.prototype.consume = function (node){
		var v_, before;
		if(node instanceof TagTree) {
			this.setNodes(this.nodes().map(function (child){
				return child.consume(node);
			}));
			// then wrap ourselves in an array as well(!)
			// nodes = [Arr.new(nodes)] if nodes:length > 1
			if(this.nodes().length > 1) {
				(this.setNodes(v_=[new Arr(new ArgList(this.nodes()))]),v_);
			};
			
			// hmmm
			return this;
		};
		
		// can also return super if it is expressable, but should we really?
		if(before = this.last()) {
			var after = before.consume(node);
			if(after != before) {
				this.replace(before,after);
			};
		};
		// really?
		return this;
	};
	
	
	Block.prototype.isExpressable = function (){
		if(!this.nodes().every(function (v){
			return v.isExpressable();
		})) {
			return false;
		};
		return true;
	};
	
	
	Block.prototype.isExpression = function (){
		return this.option('express') || Block.__super__.isExpression.call(this);
	};
	
	
	
	// this is almost like the old VarDeclarations but without the values
	/* @class VarBlock */
	function VarBlock(){ ListNode.apply(this,arguments) };
	
	subclass$(VarBlock,ListNode);
	exports.VarBlock = VarBlock; // export class 
	VarBlock.prototype.addExpression = function (expr){
		if(expr instanceof Assign) {
			this.addExpression(expr.left());// make sure this is a valid thing?
			// make this into a tuple instead
			// possibly fix this as well?!?
			// does not need to be a tuple?
			return new TupleAssign('=',new Tuple(this.nodes()),expr.right());
		} else if(expr instanceof VarOrAccess) {
			this.push(new VarReference(expr.value()));
		} else if((expr instanceof Splat) && (expr.node() instanceof VarOrAccess)) {
			expr.setValue(new VarReference(expr.node().value()));
			this.push(expr);
		} else {
			throw "VarBlock does not allow non-variable expressions";
		};
		return this;
	};
	
	
	VarBlock.prototype.isExpressable = function (){
		return false;
	};
	
	
	VarBlock.prototype.js = function (o){
		var code = compact__(flatten__(cary__(this.nodes())));
		code = code.filter(function (n){
			return n != null && n != undefined && n != EMPTY;
		});
		return ("var " + (code.join(",")));
	};
	
	
	VarBlock.prototype.consume = function (node){
		return this;
	};
	
	
	
	// Could inherit from valueNode
	/* @class Parens */
	function Parens(){ ValueNode.apply(this,arguments) };
	
	subclass$(Parens,ValueNode);
	exports.Parens = Parens; // export class 
	Parens.prototype.js = function (o){
		var par = this.up();
		var v = this._value;
		// p "Parens up {par} {o.isExpression}"
		
		if(par instanceof Block) {
			if(!(o.isExpression())) {
				this._noparen = true;
			};
			return (v instanceof Array) ? (cary__(v)) : (v.c({expression: o.isExpression()}));
		} else {
			return (v instanceof Array) ? (cary__(v)) : (v.c({expression: true}));
		};
	};
	
	
	Parens.prototype.shouldParenthesize = function (){
		if(this._noparen) {
			return false;
		};//  or par isa ArgList
		return true;
	};
	
	
	Parens.prototype.prebreak = function (br){
		var $1;
		Parens.__super__.prebreak.call(this,br);
		// hmm
		if(this._value) {
			this._value.prebreak(br);
		};
		return this;
	};
	
	
	Parens.prototype.isExpressable = function (){
		return this.value().isExpressable();
	};
	
	
	Parens.prototype.consume = function (node){
		return this.value().consume(node);
	};
	
	
	
	
	// Could inherit from valueNode
	// an explicit expression-block (with parens) is somewhat different
	// can be used to return after an expression
	/* @class ExpressionBlock */
	function ExpressionBlock(){ ListNode.apply(this,arguments) };
	
	subclass$(ExpressionBlock,ListNode);
	exports.ExpressionBlock = ExpressionBlock; // export class 
	ExpressionBlock.prototype.visit = function (){
		this.map(function (item){
			return item.traverse();
		});
		return this;
	};
	
	
	ExpressionBlock.prototype.c = function (){
		return this.map(function (item){
			return item.c();
		}).join(",");
	};
	
	
	ExpressionBlock.prototype.consume = function (node){
		return this.value().consume(node);
	};
	
	
	ExpressionBlock.prototype.addExpression = function (expr){
		if(expr.node() instanceof Assign) {
			this.push(expr.left());
			// make this into a tuple instead
			// possibly fix this as well?!?
			return new TupleAssign('=',new Tuple(this.nodes()),expr.right());
		} else {
			this.push(expr);
		};
		return this;
	};
	
	
	
	
	// STATEMENTS
	
	/* @class Return */
	function Return(v){
		this._value = ((v instanceof ArgList) && v.count() == 1) ? (v.last()) : (v);
		// @prebreak = v and v.@prebreak # hmmm
		// console.log "return?!? {v}",@prebreak
		// if v isa ArgList and v.count == 1
		return this;
	};
	
	subclass$(Return,Statement);
	exports.Return = Return; // export class 
	
	Return.prototype.__value = {};
	Return.prototype.value = function(v){ return this._value; }
	Return.prototype.setValue = function(v){ this._value = v; return this; };
	
	
	
	Return.prototype.visit = function (){
		return (this._value && this._value.traverse) && (this._value.traverse());
	};
	
	Return.prototype.js = function (){
		var v = this._value;
		
		if(v instanceof ArgList) {
			return ("return [" + (v.c({expression: true})) + "]");
		} else if(v) {
			return ("return " + (v.c({expression: true})));
		} else {
			return "return";
		};
	};
	
	Return.prototype.c = function (){
		if(!this.value() || this.value().isExpressable()) {
			return Return.__super__.c.apply(this,arguments);
		};
		// p "return must cascade into value".red
		return this.value().consume(this).c();
	};
	
	Return.prototype.consume = function (node){
		return this;
	};
	
	
	/* @class ImplicitReturn */
	function ImplicitReturn(){ Return.apply(this,arguments) };
	
	subclass$(ImplicitReturn,Return);
	exports.ImplicitReturn = ImplicitReturn; // export class 
	
	
	/* @class GreedyReturn */
	function GreedyReturn(){ ImplicitReturn.apply(this,arguments) };
	
	subclass$(GreedyReturn,ImplicitReturn);
	exports.GreedyReturn = GreedyReturn; // export class 
	
	
	// cannot live inside an expression(!)
	/* @class Throw */
	function Throw(){ Statement.apply(this,arguments) };
	
	subclass$(Throw,Statement);
	exports.Throw = Throw; // export class 
	Throw.prototype.js = function (){
		return "throw " + (this.value().c());
	};
	
	Throw.prototype.consume = function (node){
		return this;
	};
	
	
	
	/* @class LoopFlowStatement */
	function LoopFlowStatement(lit,expr){
		this.setLiteral(lit);
		(this.setExpression(expr),expr);// && ArgList.new(expr) # really?
	};
	
	subclass$(LoopFlowStatement,Statement);
	exports.LoopFlowStatement = LoopFlowStatement; // export class 
	
	LoopFlowStatement.prototype.__literal = {};
	LoopFlowStatement.prototype.literal = function(v){ return this._literal; }
	LoopFlowStatement.prototype.setLiteral = function(v){ this._literal = v; return this; };
	
	LoopFlowStatement.prototype.__expression = {};
	LoopFlowStatement.prototype.expression = function(v){ return this._expression; }
	LoopFlowStatement.prototype.setExpression = function(v){ this._expression = v; return this; };
	
	
	
	LoopFlowStatement.prototype.visit = function (){
		return (this.expression()) && (this.expression().traverse());
	};
	
	LoopFlowStatement.prototype.consume = function (node){
		return this;
	};
	
	LoopFlowStatement.prototype.c = function (){
		var copy;
		if(!this.expression()) {
			return LoopFlowStatement.__super__.c.apply(this,arguments);
		};
		// get up to the outer loop
		var _loop = STACK.up(Loop);
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
			LoopFlowStatement.__super__.c.apply(this,arguments)
		));
		// return "loopflow"
	};
	
	
	
	/* @class BreakStatement */
	function BreakStatement(){ LoopFlowStatement.apply(this,arguments) };
	
	subclass$(BreakStatement,LoopFlowStatement);
	exports.BreakStatement = BreakStatement; // export class 
	BreakStatement.prototype.js = function (){
		return "break";
	};
	
	
	/* @class ContinueStatement */
	function ContinueStatement(){ LoopFlowStatement.apply(this,arguments) };
	
	subclass$(ContinueStatement,LoopFlowStatement);
	exports.ContinueStatement = ContinueStatement; // export class 
	ContinueStatement.prototype.js = function (){
		return "continue";
	};
	
	
	/* @class DebuggerStatement */
	function DebuggerStatement(){ Statement.apply(this,arguments) };
	
	subclass$(DebuggerStatement,Statement);
	exports.DebuggerStatement = DebuggerStatement; // export class 
	
	
	
	
	
	
	// PARAMS
	
	/* @class Param */
	function Param(name,defaults,typ){
		this._name = name;// .value # this is an identifier(!)
		this._defaults = defaults;
		this._typ = typ;
		this._variable = null;
	};
	
	subclass$(Param,Node);
	exports.Param = Param; // export class 
	
	Param.prototype.__name = {};
	Param.prototype.name = function(v){ return this._name; }
	Param.prototype.setName = function(v){ this._name = v; return this; };
	
	Param.prototype.__index = {};
	Param.prototype.index = function(v){ return this._index; }
	Param.prototype.setIndex = function(v){ this._index = v; return this; };
	
	Param.prototype.__defaults = {};
	Param.prototype.defaults = function(v){ return this._defaults; }
	Param.prototype.setDefaults = function(v){ this._defaults = v; return this; };
	
	Param.prototype.__splat = {};
	Param.prototype.splat = function(v){ return this._splat; }
	Param.prototype.setSplat = function(v){ this._splat = v; return this; };
	
	Param.prototype.__variable = {};
	Param.prototype.variable = function(v){ return this._variable; }
	Param.prototype.setVariable = function(v){ this._variable = v; return this; };
	
	// what about object-params?
	
	
	
	Param.prototype.js = function (){
		if(this._variable) {
			return this._variable.c();
		};
		
		return (this.defaults()) && (
			("if(" + (this.name().c()) + " == null) " + (this.name().c()) + " = " + (this.defaults().c()))
		);
		// see if this is the initial declarator?
	};
	
	Param.prototype.visit = function (){
		var variable_, v_;
		if(this._defaults) {
			this._defaults.traverse();
		};
		(variable_=this.variable()) || ((this.setVariable(v_=this.scope__().register(this.name(),this)),v_));
		return this;
	};
	
	Param.prototype.assignment = function (){
		return OP('=',this.variable().accessor(),this.defaults());
	};
	
	Param.prototype.isExpressable = function (){
		return !this.defaults() || this.defaults().isExpressable();
		// p "visiting param!!!"
	};
	
	Param.prototype.dump = function (){
		return {loc: this.loc()};
	};
	
	Param.prototype.loc = function (){
		return this._name && this._name.region();
	};
	
	
	
	/* @class SplatParam */
	function SplatParam(){ Param.apply(this,arguments) };
	
	subclass$(SplatParam,Param);
	exports.SplatParam = SplatParam; // export class 
	SplatParam.prototype.loc = function (){
		var r = this.name().region();
		return [r[0] - 1,r[1]];
	};
	
	
	/* @class BlockParam */
	function BlockParam(){ Param.apply(this,arguments) };
	
	subclass$(BlockParam,Param);
	exports.BlockParam = BlockParam; // export class 
	BlockParam.prototype.c = function (){
		return "blockparam";
	};
	
	BlockParam.prototype.loc = function (){
		var r = this.name().region();
		return [r[0] - 1,r[1]];
	};
	
	
	
	/* @class OptionalParam */
	function OptionalParam(){ Param.apply(this,arguments) };
	
	subclass$(OptionalParam,Param);
	exports.OptionalParam = OptionalParam; // export class 
	
	
	/* @class NamedParam */
	function NamedParam(){ Param.apply(this,arguments) };
	
	subclass$(NamedParam,Param);
	exports.NamedParam = NamedParam; // export class 
	
	
	/* @class RequiredParam */
	function RequiredParam(){ Param.apply(this,arguments) };
	
	subclass$(RequiredParam,Param);
	exports.RequiredParam = RequiredParam; // export class 
	
	
	/* @class NamedParams */
	function NamedParams(){ ListNode.apply(this,arguments) };
	
	subclass$(NamedParams,ListNode);
	exports.NamedParams = NamedParams; // export class 
	
	NamedParams.prototype.__index = {};
	NamedParams.prototype.index = function(v){ return this._index; }
	NamedParams.prototype.setIndex = function(v){ this._index = v; return this; };
	
	NamedParams.prototype.__variable = {};
	NamedParams.prototype.variable = function(v){ return this._variable; }
	NamedParams.prototype.setVariable = function(v){ this._variable = v; return this; };
	
	NamedParams.prototype.load = function (list){
		var load = (function (k){
			return new NamedParam(k.key(),k.value());
		});
		return (list instanceof Obj) ? (list.value().map(load)) : (list);
	};
	
	NamedParams.prototype.visit = function (){
		var s = this.scope__();
		this._variable || (this._variable = s.temporary(this,{type: 'keypars'}));
		this._variable.predeclared();
		
		// this is a listnode, which will automatically traverse
		// and visit all children
		NamedParams.__super__.visit.apply(this,arguments);
		// register the inner variables as well(!)
		return this;
	};
	
	NamedParams.prototype.name = function (){
		return this.variable().c();
	};
	
	NamedParams.prototype.js = function (){
		return "namedpar";
	};
	
	
	/* @class IndexedParam */
	function IndexedParam(){ Param.apply(this,arguments) };
	
	subclass$(IndexedParam,Param);
	exports.IndexedParam = IndexedParam; // export class 
	
	IndexedParam.prototype.__parent = {};
	IndexedParam.prototype.parent = function(v){ return this._parent; }
	IndexedParam.prototype.setParent = function(v){ this._parent = v; return this; };
	
	IndexedParam.prototype.__subindex = {};
	IndexedParam.prototype.subindex = function(v){ return this._subindex; }
	IndexedParam.prototype.setSubindex = function(v){ this._subindex = v; return this; };
	
	IndexedParam.prototype.visit = function (){
		var variable_, v_;
		(variable_=this.variable()) || ((this.setVariable(v_=this.scope__().register(this.name(),this)),v_));
		this.variable().proxy(this.parent().variable(),this.subindex());
		return this;
	};
	
	
	
	/* @class ArrayParams */
	function ArrayParams(){ ListNode.apply(this,arguments) };
	
	subclass$(ArrayParams,ListNode);
	exports.ArrayParams = ArrayParams; // export class 
	
	ArrayParams.prototype.__index = {};
	ArrayParams.prototype.index = function(v){ return this._index; }
	ArrayParams.prototype.setIndex = function(v){ this._index = v; return this; };
	
	ArrayParams.prototype.__variable = {};
	ArrayParams.prototype.variable = function(v){ return this._variable; }
	ArrayParams.prototype.setVariable = function(v){ this._variable = v; return this; };
	
	ArrayParams.prototype.visit = function (){
		var s = this.scope__();
		this._variable || (this._variable = s.temporary(this,{type: 'keypars'}));
		this._variable.predeclared();
		
		// now when we loop through these inner params - we create the pars
		// with the correct name, but bind them to the parent
		return ArrayParams.__super__.visit.apply(this,arguments);
	};
	
	ArrayParams.prototype.name = function (){
		return this.variable().c();
	};
	
	ArrayParams.prototype.load = function (list){
		var self=this;
		if(!((list instanceof Arr))) {
			return null;
		};
		// p "loading arrayparams"
		// try the basic first
		return (!(list.splat())) && (
			list.value().map(function (v,i){
				var name = v;
				if(v instanceof VarOrAccess) {
					name = v.value().value();
					// this is accepted
				};
				return self.parse(name,v,i);
			})
		);
	};
	
	ArrayParams.prototype.parse = function (name,child,i){
		var param = new IndexedParam(name,null);
		
		param.setParent(this);
		param.setSubindex(i);
		return param;
	};
	
	ArrayParams.prototype.head = function (ast){
		return this;
	};
	
	
	/* @class ParamList */
	function ParamList(){ ListNode.apply(this,arguments) };
	
	subclass$(ParamList,ListNode);
	exports.ParamList = ParamList; // export class 
	
	ParamList.prototype.__splat = {};
	ParamList.prototype.splat = function(v){ return this._splat; }
	ParamList.prototype.setSplat = function(v){ this._splat = v; return this; };
	
	ParamList.prototype.__block = {};
	ParamList.prototype.block = function(v){ return this._block; }
	ParamList.prototype.setBlock = function(v){ this._block = v; return this; };
	
	ParamList.prototype.at = function (index,force,name){
		if(force === undefined) force = false;
		if(name === undefined) name = null;
		if(force) {
			while(this.count() <= index){
				this.add(new Param(this.count() == index && name || ("_" + this.count())));
			};
			// need to visit at the same time, no?
		};
		return this.list()[index];
	};
	
	ParamList.prototype.visit = function (){
		this._splat = this.filter(function (par){
			return par instanceof SplatParam;
		})[0];
		var blk = this.filter(BlockParam);
		
		if(blk.length > 1) {
			blk[1].warn("a method can only have one &block parameter");
		} else if(blk[0] && blk[0] != this.last()) {
			blk[0].warn("&block must be the last parameter of a method");
			// warn "&block must be the last parameter of a method", blk[0]
		};
		
		// add more warnings later(!)
		// should probably throw error as well to stop compilation
		
		// need to register the required-pars as variables
		return ParamList.__super__.visit.apply(this,arguments);
	};
	
	ParamList.prototype.js = function (o){
		if(this.count() == 0) {
			return EMPTY;
		};
		if(o.parent() instanceof Block) {
			return this.head(o);
		};
		
		// items = map(|arg| arg.name.c ).compact
		// return null unless items[0]
		
		if(o.parent() instanceof Code) {
			var pars = this.nodes();
			// pars = filter(|arg| arg != @splat && !(arg isa BlockParam)) if @splat
			if(this._splat) {
				pars = this.filter(function (arg){
					return (arg instanceof RequiredParam) || (arg instanceof OptionalParam);
				});
			};
			return compact__(pars.map(function (arg){
				return c__(arg.name());
			})).join(",");
		} else {
			throw "not implemented paramlist js";
			return "ta" + compact__(this.map(function (arg){
				return arg.c();
			})).join(",");
		};
	};
	
	ParamList.prototype.head = function (o){
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
			if(par instanceof NamedParams) {
				signature.push('named');
				named = par;
			} else if(par instanceof OptionalParam) {
				signature.push('opt');
				opt.push(par);
			} else if(par instanceof BlockParam) {
				signature.push('blk');
				blk = par;
			} else if(par instanceof SplatParam) {
				signature.push('splat');
				splat = par;
				idx -= 1;// this should really be removed from the list, no?
			} else if(par instanceof ArrayParams) {
				arys.push(par);
				signature.push('ary');
			} else {
				signature.push('reg');
				reg.push(par);
			};
			return idx++;
		});
		
		if(named) {
			var namedvar = named.variable();
		};
		
		// var opt = nodes.filter(|n| n isa OptionalParam)
		// var blk = nodes.filter(|n| n isa BlockParam)[0]
		// var splat = nodes.filter(|n| n isa SplatParam)[0]
		
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
		if(!named && !splat && !blk && opt.length > 0 && signature.join(" ").match(/opt$/)) {
			for(var i=0, ary=iter$(opt), len_=ary.length, par; i < len_; i++) {
				par = ary[i];ast.push(("if(" + (par.name().c()) + " === undefined) " + (par.name().c()) + " = " + (par.defaults().c())));
			};
		} else if(named && !splat && !blk && opt.length == 0) {
			ast.push(("if(!" + (namedvar.c()) + "||" + (isntObj(namedvar.c())) + ") " + (namedvar.c()) + " = \{\}"));
		} else if(blk && opt.length == 1 && !splat && !named) {
			var op = opt[0];
			var opn = op.name().c();
			var bn = blk.name().c();
			ast.push(("if(" + bn + "==undefined && " + (isFunc(opn)) + ") " + bn + " = " + opn + "," + opn + " = " + (op.defaults().c())));
		} else if(blk && named && opt.length == 0 && !splat) {
			bn = blk.name().c();
			ast.push(("if(" + bn + "==undefined && " + (isFunc(namedvar.c())) + ") " + bn + " = " + (namedvar.c()) + "," + (namedvar.c()) + " = \{\}"));
			ast.push(("else if(!" + (namedvar.c()) + "||" + (isntObj(namedvar.c())) + ") " + (namedvar.c()) + " = \{\}"));
		} else if(opt.length > 0 || splat) {
			var argvar = this.scope__().temporary(this,{type: 'arguments'}).predeclared().c();
			var len = this.scope__().temporary(this,{type: 'counter'}).predeclared().c();
			
			var last = ("" + argvar + "[" + len + "-1]");
			var pop = ("" + argvar + "[--" + len + "]");
			ast.push(("var " + argvar + " = arguments, " + len + " = " + argvar + ".length"));
			
			if(blk) {
				bn = blk.name().c();
				if(splat) {
					ast.push(("var " + bn + " = " + (isFunc(last)) + " ? " + pop + " : null"));
				} else if(reg.length > 0) {
					ast.push(("var " + bn + " = " + len + " > " + (reg.length) + " && " + (isFunc(last)) + " ? " + pop + " : null"));
				} else {
					ast.push(("var " + bn + " = " + (isFunc(last)) + " ? " + pop + " : null"));
				};
			};
			
			// if we have named params - look for them before splat
			// should probably loop through pars in the same order they were added
			// should it be prioritized above optional objects??
			if(named) {
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
		} else if(opt.length > 0) {
			for(var i=0, ary=iter$(opt), len_=ary.length, par; i < len_; i++) {
				par = ary[i];ast.push(("if(" + (par.name().c()) + " === undefined) " + (par.name().c()) + " = " + (par.defaults().c())));
			};
		};
		
		// now set stuff if named params(!)
		
		if(named) {
			for(var i=0, ary=iter$(named.nodes()), len_=ary.length, k; i < len_; i++) {
				k = ary[i];var op = OP('.',namedvar,k.c()).c();
				ast.push(("var " + (k.c()) + " = " + op + " !== undefined ? " + op + " : " + (k.defaults().c())));
			};
		};
		
		if(arys.length) {
			for(var i=0, ary=iter$(arys), len_=ary.length; i < len_; i++) {
				this.p("adding arrayparams");
				ary[i].head(o,ast,this);
				// ast.push v.c
			};
		};
		
		
		
		// if opt:length == 0
		return (ast.length > 0) ? ((ast.join(";\n") + ";")) : (EMPTY);
	};
	
	
	
	// Legacy. Should move away from this?
	/* @class VariableDeclaration */
	function VariableDeclaration(){ ListNode.apply(this,arguments) };
	
	subclass$(VariableDeclaration,ListNode);
	exports.VariableDeclaration = VariableDeclaration; // export class 
	
	VariableDeclaration.prototype.__kind = {};
	VariableDeclaration.prototype.kind = function(v){ return this._kind; }
	VariableDeclaration.prototype.setKind = function(v){ this._kind = v; return this; };
	
	VariableDeclaration.prototype.visit = function (){
		return this.map(function (item){
			return item.traverse();
		});
	};
	
	// we want to register these variables in
	VariableDeclaration.prototype.add = function (name,init){
		var vardec = new VariableDeclarator(name,init);
		this.push(vardec);
		return vardec;
		// TODO (target) << (node) rewrites to a caching push which returns node
	};
	
	// def remove item
	// 	if item isa Variable
	// 		map do |v,i|
	// 			if v.variable == item
	// 				p "found variable to remove"
	// 				super.remove(v)
	// 	else
	// 		super.remove(item)
	// 	self
	
	
	VariableDeclaration.prototype.load = function (list){
		return list.map(function (par){
			return new VariableDeclarator(par.name(),par.defaults(),par.splat());
		});
	};
	
	VariableDeclaration.prototype.isExpressable = function (){
		return this.list().every(function (item){
			return item.isExpressable();
		});
	};
	
	VariableDeclaration.prototype.js = function (){
		if(this.count() == 0) {
			return EMPTY;
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
		return "var " + compact__(cary__(this.nodes())).join(", ") + "";
	};
	
	
	/* @class VariableDeclarator */
	function VariableDeclarator(){ Param.apply(this,arguments) };
	
	subclass$(VariableDeclarator,Param);
	exports.VariableDeclarator = VariableDeclarator; // export class 
	VariableDeclarator.prototype.visit = function (){
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
	VariableDeclarator.prototype.js = function (){
		if(this.variable()._proxy) {
			return null;
		};
		
		var defs = this.defaults();
		// FIXME need to deal with var-defines within other statements etc
		// FIXME need better syntax for this
		return (defs != null && defs != undefined) ? (
			(defs instanceof Node) && (defs = defs.c({expression: true})),// hmmm
			
			("" + (this.variable().c()) + "=" + defs)
		) : (
			("" + (this.variable().c()))
		);
	};
	
	VariableDeclarator.prototype.accessor = function (){
		return this;
	};
	
	
	
	// TODO clean up and refactor all the different representations of vars
	// VarName, VarReference, LocalVarAccess?
	/* @class VarName */
	function VarName(a,b){
		VarName.__super__.constructor.apply(this,arguments);
		this._splat = b;
	};
	
	subclass$(VarName,ValueNode);
	exports.VarName = VarName; // export class 
	
	VarName.prototype.__variable = {};
	VarName.prototype.variable = function(v){ return this._variable; }
	VarName.prototype.setVariable = function(v){ this._variable = v; return this; };
	
	VarName.prototype.__splat = {};
	VarName.prototype.splat = function(v){ return this._splat; }
	VarName.prototype.setSplat = function(v){ this._splat = v; return this; };
	
	
	
	VarName.prototype.visit = function (){
		var variable_, v_;
		(variable_=this.variable()) || ((this.setVariable(v_=this.scope__().register(this.value().c(),null)),v_));
		this.variable().setDeclarator(this);
		this.variable().addReference(this.value());
		return this;
	};
	
	VarName.prototype.js = function (){
		return this.variable().c();
	};
	
	VarName.prototype.c = function (){
		return this.variable().c();
	};
	
	
	
	/* @class VarList */
	function VarList(t,l,r){
		this._type = this.type();
		this._left = l;
		this._right = r;
	};
	
	subclass$(VarList,Node);
	exports.VarList = VarList; // export class 
	
	VarList.prototype.__type = {};
	VarList.prototype.type = function(v){ return this._type; }
	VarList.prototype.setType = function(v){ this._type = v; return this; };// let / var / const
	
	VarList.prototype.__left = {};
	VarList.prototype.left = function(v){ return this._left; }
	VarList.prototype.setLeft = function(v){ this._left = v; return this; };
	
	VarList.prototype.__right = {};
	VarList.prototype.right = function(v){ return this._right; }
	VarList.prototype.setRight = function(v){ this._right = v; return this; };
	
	// format :type, :left, :right
	
	// should throw error if there are more values on right than left
	
	
	
	VarList.prototype.visit = function (){
		for(var i=0, ary=iter$(this.left()), len=ary.length; i < len; i++) {
			ary[i].traverse();// this should really be a var-declaration
			if((this.setR(this.right()[($1=i)]),this.right()[$1])) {
				this.r().traverse();
			};
		};
		return this;
	};
	
	VarList.prototype.js = function (){
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
					this.p("splat");// FIX reimplement slice?
					if(i == ll - 1) {
						v = this.util().slice(r,i);
						this.p("last");
					} else {
						v = this.util().slice(r,i,-(ll - i) + 1);
					};
				} else {
					v = OP('.',r,num__(i));
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
	
	
	
	// CODE
	
	/* @class Code */
	function Code(){ Node.apply(this,arguments) };
	
	subclass$(Code,Node);
	exports.Code = Code; // export class 
	
	Code.prototype.__head = {};
	Code.prototype.head = function(v){ return this._head; }
	Code.prototype.setHead = function(v){ this._head = v; return this; };
	
	Code.prototype.__body = {};
	Code.prototype.body = function(v){ return this._body; }
	Code.prototype.setBody = function(v){ this._body = v; return this; };
	
	Code.prototype.__scope = {};
	Code.prototype.scope = function(v){ return this._scope; }
	Code.prototype.setScope = function(v){ this._scope = v; return this; };
	
	Code.prototype.__params = {};
	Code.prototype.params = function(v){ return this._params; }
	Code.prototype.setParams = function(v){ this._params = v; return this; };
	
	Code.prototype.scopetype = function (){
		return Scope;
	};
	
	Code.prototype.visit = function (){
		if(this._scope) {
			this._scope.visit();
		};
		// @scope.parent = STACK.scope(1) if @scope
		return this;
	};
	
	
	// Rename to Program?
	/* @class Root */
	function Root(body,opts){
		var v_;
		this.setBody(blk__(body));
		(this.setScope(v_=new FileScope(this,null)),v_);
	};
	
	subclass$(Root,Code);
	exports.Root = Root; // export class 
	
	
	Root.prototype.visit = function (){
		this.scope().visit();
		return this.body().traverse();
	};
	
	Root.prototype.compile = function (){
		this.traverse();
		return this.c();
	};
	
	Root.prototype.js = function (){
		return '(function(){\n\n' + this.scope().c({indent: true}) + '\n\n}())';
	};
	
	Root.prototype.analyze = function (){
		this.traverse();
		return this.scope().dump();
	};
	
	Root.prototype.inspect = function (){
		return true;
	};
	
	
	/* @class ClassDeclaration */
	function ClassDeclaration(name,superclass,body){
		this._name = name;
		this._superclass = superclass;
		this._scope = new ClassScope(this);
		this._body = blk__(body);
	};
	
	subclass$(ClassDeclaration,Code);
	exports.ClassDeclaration = ClassDeclaration; // export class 
	
	ClassDeclaration.prototype.__name = {};
	ClassDeclaration.prototype.name = function(v){ return this._name; }
	ClassDeclaration.prototype.setName = function(v){ this._name = v; return this; };
	
	ClassDeclaration.prototype.__superclass = {};
	ClassDeclaration.prototype.superclass = function(v){ return this._superclass; }
	ClassDeclaration.prototype.setSuperclass = function(v){ this._superclass = v; return this; };
	
	ClassDeclaration.prototype.__initor = {};
	ClassDeclaration.prototype.initor = function(v){ return this._initor; }
	ClassDeclaration.prototype.setInitor = function(v){ this._initor = v; return this; };
	
	
	
	ClassDeclaration.prototype.visit = function (){
		this.scope().visit();
		
		// local is the default -- should it really be referenced?
		// if option(:local)
		// self.name = scope.parent.register(name,self)
		
		return this.body().traverse();
	};
	
	ClassDeclaration.prototype.js = function (){
		this.scope().virtualize();
		this.scope().context().setValue(this.name());
		
		// should probably also warn about stuff etc
		if(this.option('extension')) {
			return this.body().c();
		};
		
		var o = this._options || {};
		var cname = (this.name() instanceof Access) ? (this.name().right()) : (this.name());
		var namespaced = this.name() != cname;
		
		var sup = this.superclass();
		var initor = this.body().pluck(function (c){
			return (c instanceof MethodDeclaration) && c.type() == 'constructor';
		});
		// compile the cname
		if(!(typeof cname == 'string')) {
			cname = cname.c();
		};
		
		var cpath = (typeof this.name() == 'string') ? (this.name()) : (this.name().c());
		
		if(!initor) {
			if(sup) {
				initor = ("function " + cname + "()\{ " + (sup.c()) + ".apply(this,arguments) \}");
			} else {
				initor = ("function " + cname + "()") + '{ }';
			};
		} else {
			initor.setName(cname);
			initor = initor.c();
		};
		
		// if we are defining a class inside a namespace etc -- how should we set up the class?
		var head = [];
		
		if(namespaced) {
			initor = ("" + cpath + " = " + initor);// OP('=',name,initor) # hmm
		};
		
		head.push(("/* @class " + cname + " */\n" + initor + ";\n\n"));
		
		if(sup) {
			head.push(new Util.Subclass([this.name(),sup]));
		};
		
		// only if it is not namespaced
		if(o.global && !namespaced) {
			head.push(("global." + cname + " = " + cpath + "; // global class \n"))
		};
		
		if(o.export && !namespaced) {
			head.push(("exports." + cname + " = " + cpath + "; // export class \n"))
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
	
	
	
	/* @class TagDeclaration */
	function TagDeclaration(name,superclass,body){
		this._name = name;
		this._superclass = superclass;
		this._scope = new TagScope(this);
		this._body = blk__(body || []);
	};
	
	subclass$(TagDeclaration,Code);
	exports.TagDeclaration = TagDeclaration; // export class 
	
	TagDeclaration.prototype.__name = {};
	TagDeclaration.prototype.name = function(v){ return this._name; }
	TagDeclaration.prototype.setName = function(v){ this._name = v; return this; };
	
	TagDeclaration.prototype.__superclass = {};
	TagDeclaration.prototype.superclass = function(v){ return this._superclass; }
	TagDeclaration.prototype.setSuperclass = function(v){ this._superclass = v; return this; };
	
	TagDeclaration.prototype.__initor = {};
	TagDeclaration.prototype.initor = function(v){ return this._initor; }
	TagDeclaration.prototype.setInitor = function(v){ this._initor = v; return this; };
	
	
	
	TagDeclaration.prototype.visit = function (){
		this.scope().visit();
		return this.body().traverse();
	};
	
	TagDeclaration.prototype.id = function (){
		return this.name().id();
	};
	
	TagDeclaration.prototype.js = function (){
		if(this.option('extension')) {
			this.scope().context().setValue(this.name());
			return this.body().c();
		};
		
		// should disallow initialize for tags?
		var sup = this.superclass() && "," + helpers.singlequote(this.superclass().func()) || "";
		
		var out = (this.name().id()) ? (
			("Imba.defineSingletonTag('" + (this.name().id()) + "',function " + (this.name().func()) + "(d)\{this.setDom(d)\}" + sup + ")")
		) : (
			("Imba.defineTag('" + (this.name().func()) + "',function " + (this.name().func()) + "(d)\{this.setDom(d)\}" + sup + ")")
		);
		
		// if the body is empty we can return this directly
		// console.log "here"
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
		this.scope().context().setValue(new Const('tag'));
		out += ("\n" + (this.body().c()));
		
		return '(function()' + helpers.bracketize(out,true) + ')()';
	};
	
	
	/* @class Func */
	function Func(params,body,name,target,o){
		var typ = this.scopetype();
		this._scope || (this._scope = (o && o.scope) || new typ(this));
		this._scope.setParams(this._params = new ParamList(params));
		this._body = blk__(body);
		this._name = name || '';
		this._target = target;
		this._options = o;
		this._type = 'function';
		this;
	};
	
	subclass$(Func,Code);
	exports.Func = Func; // export class 
	
	Func.prototype.__name = {};
	Func.prototype.name = function(v){ return this._name; }
	Func.prototype.setName = function(v){ this._name = v; return this; };
	
	Func.prototype.__params = {};
	Func.prototype.params = function(v){ return this._params; }
	Func.prototype.setParams = function(v){ this._params = v; return this; };
	
	Func.prototype.__target = {};
	Func.prototype.target = function(v){ return this._target; }
	Func.prototype.setTarget = function(v){ this._target = v; return this; };
	
	Func.prototype.__options = {};
	Func.prototype.options = function(v){ return this._options; }
	Func.prototype.setOptions = function(v){ this._options = v; return this; };
	
	Func.prototype.__type = {};
	Func.prototype.type = function(v){ return this._type; }
	Func.prototype.setType = function(v){ this._type = v; return this; };
	
	Func.prototype.__context = {};
	Func.prototype.context = function(v){ return this._context; }
	Func.prototype.setContext = function(v){ this._context = v; return this; };
	
	Func.prototype.scopetype = function (){
		return FunctionScope;
	};
	
	
	
	Func.prototype.visit = function (){
		this.scope().visit();
		this._context = this.scope().parent();
		this._params.traverse();
		return this._body.traverse();// so soon?
	};
	
	
	Func.prototype.js = function (o){
		if(!this.option('noreturn')) {
			this.body().consume(new ImplicitReturn());
		};
		var code = this.scope().c({indent: true,braces: true});
		// args = params.map do |par| par.name
		// head = params.map do |par| par.c
		// code = [head,body.c(expression: no)].flatten__.compact.join("\n").wrap
		// FIXME creating the function-name this way is prone to create naming-collisions
		// will need to wrap the value in a FunctionName which takes care of looking up scope
		// and possibly dealing with it
		var name = (typeof this._name == 'string') ? (this._name) : (this._name.c());
		name = name.replace(/\./g,'_');
		var out = ("function " + name + "(" + (this.params().c()) + ")") + code;
		if(this.option('eval')) {
			out = ("(" + out + ")()");
		};
		return out;
	};
	
	Func.prototype.shouldParenthesize = function (){
		return (this.up() instanceof Call) && this.up().callee() == this;
		// if up as a call? Only if we are 
	};
	
	
	/* @class Lambda */
	function Lambda(){ Func.apply(this,arguments) };
	
	subclass$(Lambda,Func);
	exports.Lambda = Lambda; // export class 
	Lambda.prototype.scopetype = function (){
		return LambdaScope;
	};
	// MethodDeclaration
	// Create a shared body?
	;
	
	/* @class MethodDeclaration */
	function MethodDeclaration(){ Func.apply(this,arguments) };
	
	subclass$(MethodDeclaration,Func);
	exports.MethodDeclaration = MethodDeclaration; // export class 
	
	MethodDeclaration.prototype.__variable = {};
	MethodDeclaration.prototype.variable = function(v){ return this._variable; }
	MethodDeclaration.prototype.setVariable = function(v){ this._variable = v; return this; };
	
	MethodDeclaration.prototype.scopetype = function (){
		return MethodScope;
	};
	
	MethodDeclaration.prototype.visit = function (){
		var v_;
		if(String(this.name()) == 'initialize') {
			(this.setType(v_='constructor'),v_);
		};
		
		if(this.body().expressions) {
			this.set({greedy: true});
			// p "BODY EXPRESSIONS!! This is a fragment"
			var tree = new TagTree();
			this._body = this.body().consume(tree);
			// body.nodes = [Arr.new(body.nodes)] # hmm
		};
		
		this.scope().visit();
		this._context = this.scope().parent();
		this._params.traverse();
		
		if(this.target() instanceof Self) {
			this._target = this._scope.parent().context();
			this.set({static: true});
		};
		
		if(this.context() instanceof ClassScope) {
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
	
	MethodDeclaration.prototype.supername = function (){
		return (this.type() == 'constructor') ? (this.type()) : (this.name());
	};
	
	
	// FIXME export global etc are NOT valid for methods inside any other scope than
	// the outermost scope (root)
	
	MethodDeclaration.prototype.js = function (){
		if(!(this.type() == 'constructor' || this.option('noreturn'))) {
			if(this.option('greedy')) {
				this.body().consume(new GreedyReturn());
			} else {
				this.body().consume(new ImplicitReturn());
			};
		};
		var code = this.scope().c({indent: true,braces: true});
		
		// same for Func -- should generalize
		var name = (typeof this._name == 'string') ? (this._name) : (this._name.c());
		name = name.replace(/\./g,'_');
		
		// var name = self.name.c.replace(/\./g,'_') # WHAT?
		var foot = [];
		
		var left = "";
		var func = ("(" + (this.params().c()) + ")") + code;// .wrap
		var target = this.target();
		var decl = !this.option('global') && !this.option('export');
		
		if(target instanceof ScopeContext) {
			target = null;// hmm -- 
		};
		
		var ctx = this.context();
		var out = "";
		// if ctx 
		
		
		
		var fname = sym__(this.name());
		// console.log "symbolize {self.name} -- {fname}"
		var fdecl = fname;// decl ? fname : ''
		
		if((ctx instanceof ClassScope) && !target) {
			if(this.type() == 'constructor') {
				out = ("function " + fname + func);
			} else if(this.option('static')) {
				out = ("" + (ctx.context().c()) + "." + fname + " = function " + func);
			} else {
				out = ("" + (ctx.context().c()) + ".prototype." + fname + " = function " + func);
			};
		} else if((ctx instanceof FileScope) && !target) {
			out = ("function " + fdecl + func);
		} else if(target && this.option('static')) {
			out = ("" + (target.c()) + "." + fname + " = function " + func);
		} else if(target) {
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
	function TagFragmentDeclaration(){ MethodDeclaration.apply(this,arguments) };
	
	subclass$(TagFragmentDeclaration,MethodDeclaration);
	exports.TagFragmentDeclaration = TagFragmentDeclaration; // export class 
	
	
	
	var propTemplate = '${headers}\n${path}.__${getter} = ${options};\n${path}.${getter} = function(v){ return ${get}; }\n${path}.${setter} = function(v){ ${set}; return this; }\n${init}';
	
	var propWatchTemplate = '${headers}\n${path}.__${getter} = ${options};\n${path}.${getter} = function(v){ return ${get}; }\n${path}.${setter} = function(v){\n	var a = this.${getter}();\n	if(v != a) { v = ${set}; }\n	if(v != a) { ${ondirty} }\n	return this;\n}\n${init}';
	
	/* @class PropertyDeclaration */
	function PropertyDeclaration(name,options){
		this._name = name;
		this._options = options || new Obj(new AssignList());
	};
	
	subclass$(PropertyDeclaration,Expression);
	exports.PropertyDeclaration = PropertyDeclaration; // export class 
	
	PropertyDeclaration.prototype.__name = {};
	PropertyDeclaration.prototype.name = function(v){ return this._name; }
	PropertyDeclaration.prototype.setName = function(v){ this._name = v; return this; };
	
	PropertyDeclaration.prototype.__options = {};
	PropertyDeclaration.prototype.options = function(v){ return this._options; }
	PropertyDeclaration.prototype.setOptions = function(v){ this._options = v; return this; };
	
	
	
	PropertyDeclaration.prototype.visit = function (){
		this._options.traverse();
		return this;
	};
	
	// This will soon support bindings / listeners etc, much more
	// advanced generated code based on options passed in.
	PropertyDeclaration.prototype.c = function (){
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
			setter: sym__(("set-" + key)),
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
			if(!((pars.watch instanceof Bool) && !(pars.watch.truthy()))) {
				tpl = propWatchTemplate;
			};
			var wfn = ("" + key + "DidSet");
			
			if(pars.watch instanceof Symbol) {
				wfn = pars.watch;
			} else if(pars.watch instanceof Bool) {
				(o.key('watch').setValue(v_=new Symbol(("" + key + "DidSet"))),v_);
			};
			
			// should check for the function first, no?
			// HACK
			// o.key(:watch).value = Symbol
			var fn = OP('.',new This(),wfn);
			js.ondirty = OP('&&',fn,CALL(fn,['v','a',("this.__" + key)])).c();// CALLSELF(wfn,[]).c
			// js:ondirty = "if(this.{wfn}) this.{wfn}(v,a,this.__{key});"
		};
		
		if(o.key('dom') || o.key('attr')) {
			js.set = ("this.setAttribute('" + key + "',v)");
			js.get = ("this.getAttribute('" + key + "')");
		} else if(o.key('delegate')) {
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
	
	
	
	
	
	// Literals should probably not inherit from the same parent
	// as arrays, tuples, objects would be better off inheriting
	// from listnode.
	
	/* @class Literal */
	function Literal(v){
		this._value = v;
	};
	
	subclass$(Literal,ValueNode);
	exports.Literal = Literal; // export class 
	
	
	// hmm
	Literal.prototype.toString = function (){
		return "" + this.value();
	};
	
	Literal.prototype.hasSideEffects = function (){
		return false;
	};
	
	
	
	/* @class Bool */
	function Bool(v){
		this._value = v;
		this._raw = (String(v) == "true") ? (true) : (false);
	};
	
	subclass$(Bool,Literal);
	exports.Bool = Bool; // export class 
	
	
	Bool.prototype.cache = function (){
		return this;
	};
	
	Bool.prototype.truthy = function (){
		return String(this.value()) == "true";
		// yes
	};
	
	Bool.prototype.js = function (){
		return String(this._value);
	};
	
	Bool.prototype.c = function (){
		return String(this._value);
		// @raw ? "true" : "false"
	};
	
	
	
	/* @class True */
	function True(){ Bool.apply(this,arguments) };
	
	subclass$(True,Bool);
	exports.True = True; // export class 
	True.prototype.raw = function (){
		return true;
	};
	
	True.prototype.c = function (){
		console.log("compile True");
		return "true";
	};
	
	
	/* @class False */
	function False(){ Bool.apply(this,arguments) };
	
	subclass$(False,Bool);
	exports.False = False; // export class 
	False.prototype.raw = function (){
		return false;
	};
	
	False.prototype.c = function (){
		return "false";
	};
	
	
	/* @class Num */
	function Num(v){
		this._value = v;
	};
	
	subclass$(Num,Literal);
	exports.Num = Num; // export class 
	
	
	Num.prototype.toString = function (){
		return String(this._value);
	};
	
	Num.prototype.shouldParenthesize = function (){
		return this.up() instanceof Access;
	};
	
	
	Num.prototype.js = function (){
		var num = String(this._value);
		// console.log "compiled num to {num}"
		return num;
	};
	
	Num.prototype.c = function (o){
		var $1;
		if(this._cache) {
			return Num.__super__.c.call(this,o);
		};
		var js = String(this._value);
		var paren = (STACK.current() instanceof Access);// hmmm
		// console.log "should paren?? {shouldParenthesize}"
		return (paren) ? ("(" + js + ")") : (js);
		// @cache ? super(o) : String(@value)
	};
	
	// def cache
	// 	p "cache num"
	// 	self
	
	Num.prototype.raw = function (){
		return JSON.parse(String(this.value()));
	};
	
	
	// should be quoted no?
	// what about strings in object-literals?
	// we want to be able to see if the values are allowed
	/* @class Str */
	function Str(v){
		this._value = v;
		// should grab the actual value immediately?
	};
	
	subclass$(Str,Literal);
	exports.Str = Str; // export class 
	
	
	Str.prototype.raw = function (){
		return this._raw || (this._raw = String(this.value()).slice(1,-1));// incredibly stupid solution
	};
	
	Str.prototype.isValidIdentifier = function (){
		return (this.raw().match(/^[a-zA-Z\$\_]+[\d\w\$\_]*$/)) ? (true) : (false);
	};
	
	Str.prototype.js = function (){
		return String(this._value);// hmm
	};
	
	Str.prototype.c = function (o){
		var $1;
		return (this._cache) ? (Str.__super__.c.call(this,o)) : (String(this._value));
	};
	
	
	// Currently not used - it would be better to use this
	// for real interpolated strings though, than to break
	// them up into their parts before parsing
	/* @class InterpolatedString */
	function InterpolatedString(){ ListNode.apply(this,arguments) };
	
	subclass$(InterpolatedString,ListNode);
	exports.InterpolatedString = InterpolatedString; // export class 
	InterpolatedString.prototype.js = function (){
		return "interpolated string";
	};
	
	
	
	/* @class Tuple */
	function Tuple(){ ListNode.apply(this,arguments) };
	
	subclass$(Tuple,ListNode);
	exports.Tuple = Tuple; // export class 
	Tuple.prototype.c = function (){
		return new Arr(this.nodes()).c();
	};
	
	Tuple.prototype.hasSplat = function (){
		return this.filter(function (v){
			return v instanceof Splat;
		})[0];
	};
	
	Tuple.prototype.consume = function (node){
		if(this.count() == 1) {
			return this.first().consume(node);
		} else {
			throw "multituple cannot consume";
		};
	};
	
	
	
	// Because we've dropped the Str-wrapper it is kinda difficult
	/* @class Symbol */
	function Symbol(){ Literal.apply(this,arguments) };
	
	subclass$(Symbol,Literal);
	exports.Symbol = Symbol; // export class 
	Symbol.prototype.isValidIdentifier = function (){
		return (this.raw().match(/^[a-zA-Z\$\_]+[\d\w\$\_]*$/)) ? (true) : (false);
	};
	
	Symbol.prototype.raw = function (){
		return this._raw || (this._raw = sym__(this.value()));
	};
	
	Symbol.prototype.js = function (){
		return "'" + (sym__(this.value())) + "'";
	};
	
	
	/* @class RegExp */
	function RegExp(){ Literal.apply(this,arguments) };
	
	subclass$(RegExp,Literal);
	exports.RegExp = RegExp; // export class 
	
	
	// Should inherit from ListNode - would simplify
	/* @class Arr */
	function Arr(){ Literal.apply(this,arguments) };
	
	subclass$(Arr,Literal);
	exports.Arr = Arr; // export class 
	Arr.prototype.load = function (value){
		return (value instanceof Array) ? (new ArgList(value)) : (value);
	};
	
	Arr.prototype.push = function (item){
		this.value().push(item);
		return this;
	};
	
	Arr.prototype.count = function (){
		return this.value().length;
	};
	
	Arr.prototype.nodes = function (){
		return this.value();
	};
	
	Arr.prototype.splat = function (){
		return this.value().some(function (v){
			return v instanceof Splat;
		});
	};
	
	Arr.prototype.visit = function (){
		if(this._value && this._value.traverse) {
			this._value.traverse();
		};
		return this;
	};
	
	Arr.prototype.js = function (){
		var slices, group, v;
		var splat = this.value().some(function (v){
			return v instanceof Splat;
		});
		
		return (splat) ? (
			"SPLATTED ARRAY!",
			// if we know for certain that the splats are arrays we can drop the slice?
			slices = [],
			group = null,
			this.value().forEach(function (v){
				return (v instanceof Splat) ? (
					slices.push(v),
					group = null
				) : (
					(!group) && (slices.push(group = new Arr([]))),
					group.push(v)
				);
			}),
			
			("[].concat(" + (cary__(slices).join(", ")) + ")")
		) : (
			v = this.value(),
			v = (v instanceof Array) ? (cary__(v)) : (v.c()),// hmmm
			("[" + v + "]")
		);
	};
	
	// def indented
	// 	var o = @options ||= {}
	// 	o:indent = yes
	// 	self
	
	Arr.prototype.hasSideEffects = function (){
		return this.value().some(function (v){
			return v.hasSideEffects();
		});
	};
	
	Arr.prototype.toString = function (){
		return "Arr";
	};
	
	
	Arr.wrap = function (val){
		return new Arr(val);
	};
	
	
	// should not be cklassified as a literal?
	/* @class Obj */
	function Obj(){ Literal.apply(this,arguments) };
	
	subclass$(Obj,Literal);
	exports.Obj = Obj; // export class 
	Obj.prototype.load = function (value){
		return (value instanceof Array) ? (new AssignList(value)) : (value);
	};
	
	Obj.prototype.visit = function (){
		if(this._value) {
			this._value.traverse();
		};
		// for v in value
		// 	v.traverse
		return this;
	};
	
	Obj.prototype.js = function (){
		var dyn = this.value().filter(function (v){
			return (v instanceof ObjAttr) && (v.key() instanceof Op);
		});
		
		if(dyn.length > 0) {
			var idx = this.value().indexOf(dyn[0]);
			// p "dynamic keys! {dyn}"
			// create a temp variable
			
			var tmp = this.scope__().temporary(this);
			// set the temporary object to the same
			var first = this.value().slice(0,idx);
			var obj = new Obj(first);
			var ast = [OP('=',tmp,obj)];
			
			this.value().slice(idx).forEach(function (atr){
				return ast.push(OP('=',OP('.',tmp,atr.key()),atr.value()));
			});
			ast.push(tmp);// access the tmp at in the last part
			return new Parens(ast).c();
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
	
	Obj.prototype.add = function (k,v){
		var kv = new ObjAttr(k,v);
		this.value().push(kv);
		return kv;
	};
	
	Obj.prototype.hash = function (){
		var hash = {};
		for(var i=0, ary=iter$(this.value()), len=ary.length, k; i < len; i++) {
			k = ary[i];if(k instanceof ObjAttr) {
				hash[k.key().symbol()] = k.value();
			};
		};
		return hash;
		// return k if k.key.symbol == key
	};
	
	// add method for finding properties etc?
	Obj.prototype.key = function (key){
		for(var i=0, ary=iter$(this.value()), len=ary.length, k; i < len; i++) {
			k = ary[i];if((k instanceof ObjAttr) && k.key().symbol() == key) {
				return k;
			};
		};
		return null;
	};
	
	Obj.prototype.indented = function (a,b){
		this._value.indented(a,b);
		return this;
	};
	
	Obj.prototype.hasSideEffects = function (){
		return this.value().some(function (v){
			return v.hasSideEffects();
		});
	};
	
	// for converting a real object into an ast-representation
	Obj.wrap = function (obj){
		var attrs = [];
		for(var o=obj, v, i=0, keys=Object.keys(o), l=keys.length; i < l; i++){
			v = o[keys[i]];if(v instanceof Array) {
				v = Arr.wrap(v);
			} else if(v.constructor == Object) {
				v = Obj.wrap(v);
			};
			attrs.push(new ObjAttr(keys[i],v));
		};
		return new Obj(attrs);
	};
	
	Obj.prototype.toString = function (){
		return "Obj";
	};
	
	
	/* @class ObjAttr */
	function ObjAttr(key,value){
		this._key = key;
		this._value = value;
		this._dynamic = (key instanceof Op);
	};
	
	subclass$(ObjAttr,Node);
	exports.ObjAttr = ObjAttr; // export class 
	
	ObjAttr.prototype.__key = {};
	ObjAttr.prototype.key = function(v){ return this._key; }
	ObjAttr.prototype.setKey = function(v){ this._key = v; return this; };
	
	ObjAttr.prototype.__value = {};
	ObjAttr.prototype.value = function(v){ return this._value; }
	ObjAttr.prototype.setValue = function(v){ this._value = v; return this; };
	
	ObjAttr.prototype.__options = {};
	ObjAttr.prototype.options = function(v){ return this._options; }
	ObjAttr.prototype.setOptions = function(v){ this._options = v; return this; };
	
	
	
	ObjAttr.prototype.visit = function (){
		this.key().traverse();
		return this.value().traverse();
	};
	
	ObjAttr.prototype.js = function (){
		return "" + (this.key().c()) + ": " + (this.value().c());
	};
	
	ObjAttr.prototype.hasSideEffects = function (){
		return true;
	};
	
	
	
	
	/* @class ArgsReference */
	function ArgsReference(){ Node.apply(this,arguments) };
	
	subclass$(ArgsReference,Node);
	exports.ArgsReference = ArgsReference; // export class 
	ArgsReference.prototype.c = function (){
		return "arguments";
	};
	
	
	// should be a separate Context or something
	/* @class Self */
	function Self(scope){
		this._scope = scope;
	};
	
	subclass$(Self,Literal);
	exports.Self = Self; // export class 
	
	Self.prototype.__scope = {};
	Self.prototype.scope = function(v){ return this._scope; }
	Self.prototype.setScope = function(v){ this._scope = v; return this; };
	
	
	
	Self.prototype.cache = function (){
		return this;
	};
	
	Self.prototype.reference = function (){
		return this;
	};
	
	Self.prototype.c = function (){
		var s = this.scope__();
		return (s) ? (s.context().c()) : ("this");
	};
	
	
	/* @class ImplicitSelf */
	function ImplicitSelf(){ Self.apply(this,arguments) };
	
	subclass$(ImplicitSelf,Self);
	exports.ImplicitSelf = ImplicitSelf; // export class 
	
	
	/* @class This */
	function This(){ Self.apply(this,arguments) };
	
	subclass$(This,Self);
	exports.This = This; // export class 
	This.prototype.cache = function (){
		return this;
	};
	
	This.prototype.reference = function (){
		return this;
	};
	
	This.prototype.c = function (){
		return "this";
	};
	
	
	
	
	
	// OPERATORS
	
	/* @class Op */
	function Op(o,l,r){
		this._invert = false;
		this._op = o && o._value || o;// hmmmm
		this._left = l;
		this._right = r;
		return this;
	};
	
	subclass$(Op,Node);
	exports.Op = Op; // export class 
	
	Op.prototype.__op = {};
	Op.prototype.op = function(v){ return this._op; }
	Op.prototype.setOp = function(v){ this._op = v; return this; };
	
	Op.prototype.__left = {};
	Op.prototype.left = function(v){ return this._left; }
	Op.prototype.setLeft = function(v){ this._left = v; return this; };
	
	Op.prototype.__right = {};
	Op.prototype.right = function(v){ return this._right; }
	Op.prototype.setRight = function(v){ this._right = v; return this; };
	
	
	
	Op.prototype.visit = function (){
		if(this._right) {
			this._right.traverse();
		};
		if(this._left) {
			this._left.traverse();
		};
		return this;
	};
	
	Op.prototype.isExpressable = function (){
		return !this.right() || this.right().isExpressable();
	};
	
	Op.prototype.js = function (){
		var out = null;
		var op = this._op;
		
		var l = this._left;
		var r = this._right;
		
		// hmmmm?
		if(l instanceof Node) {
			l = l.c();
		};// hmmm
		if(r instanceof Node) {
			r = r.c();
		};
		
		if(l && r) {
			out = ("" + l + " " + op + " " + r);
		} else if(l) {
			out = ("" + op + l);
		};
		// out = out.parenthesize if up isa Op # really?
		return out;
	};
	
	Op.prototype.shouldParenthesize = function (){
		return this.option('parens');
	};
	
	Op.prototype.precedence = function (){
		return 10;
	};
	
	Op.prototype.consume = function (node){
		if(this.isExpressable()) {
			return Op.__super__.consume.apply(this,arguments);
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
	function ComparisonOp(){ Op.apply(this,arguments) };
	
	subclass$(ComparisonOp,Op);
	exports.ComparisonOp = ComparisonOp; // export class 
	ComparisonOp.prototype.invert = function (){
		var op = this._op;
		var pairs = ["==","!=","===","!==",">","<=","<",">="];
		var idx = pairs.indexOf(op);
		idx += ((idx % 2) ? (-1) : (1));
		
		// p "inverted comparison(!) {idx} {op} -> {pairs[idx]}"
		this.setOp(pairs[idx]);
		this._invert = !(this._invert);
		return this;
	};
	
	ComparisonOp.prototype.c = function (){
		return (this.left() instanceof ComparisonOp) ? (
			this.left().right().cache(),
			OP('&&',this.left(),OP(this.op(),this.left().right(),this.right())).c()
		) : (
			ComparisonOp.__super__.c.apply(this,arguments)
		);
	};
	
	ComparisonOp.prototype.js = function (){
		var op = this._op;
		var l = this._left;
		var r = this._right;
		
		// hmmmm?
		if(l instanceof Node) {
			l = l.c();
		};// hmmm
		if(r instanceof Node) {
			r = r.c();
		};
		return ("" + l + " " + op + " " + r);
	};
	
	
	
	/* @class MathOp */
	function MathOp(){ Op.apply(this,arguments) };
	
	subclass$(MathOp,Op);
	exports.MathOp = MathOp; // export class 
	MathOp.prototype.c = function (){
		if(this.op() == '∪') {
			return this.util().union(this.left(),this.right()).c();
		} else if(this.op() == '∩') {
			return this.util().intersect(this.left(),this.right()).c();
		};
	};
	
	
	
	/* @class UnaryOp */
	function UnaryOp(){ Op.apply(this,arguments) };
	
	subclass$(UnaryOp,Op);
	exports.UnaryOp = UnaryOp; // export class 
	UnaryOp.prototype.invert = function (){
		if(this.op() == '!') {
			return this.left();
		} else {
			return UnaryOp.__super__.invert.apply(this,arguments);// regular invert
		};
	};
	
	UnaryOp.prototype.js = function (){
		var l = this._left;
		var r = this._right;
		// all of this could really be done i a much
		// cleaner way.
		if(l) {
			l.set({parens: true});
		};
		if(r) {
			r.set({parens: true});
		};
		
		return (this.op() == '!') ? (
			l.set({parens: true}),
			("" + this.op() + (l.c()))
		) : ((this.op() == '√') ? (
			("Math.sqrt(" + (l.c()) + ")")
		) : ((this.left()) ? (
			("" + (l.c()) + this.op())
		) : (
			("" + this.op() + (r.c()))
		)));
	};
	
	UnaryOp.prototype.normalize = function (){
		if(this.op() == '!' || this.op() == '√') {
			return this;
		};
		var node = (this.left() || this.right()).node();
		// for property-accessors we need to rewrite the ast
		if(!((node instanceof PropertyAccess))) {
			return this;
		};
		
		// ask to cache the path
		if((node instanceof Access) && node.left()) {
			node.left().cache();
		};
		
		var num = new Num(1);
		var ast = OP('=',node,OP(this.op()[0],node,num));
		if(this.left()) {
			ast = OP((this.op()[0] == '-') ? ('+') : ('-'),ast,num);
		};
		
		return ast;
	};
	
	UnaryOp.prototype.consume = function (node){
		var norm = this.normalize();
		return (norm == this) ? (UnaryOp.__super__.consume.apply(this,arguments)) : (norm.consume(node));
	};
	
	UnaryOp.prototype.c = function (){
		var norm = this.normalize();
		return (norm == this) ? (UnaryOp.__super__.c.apply(this,arguments)) : (norm.c());
	};
	
	
	/* @class InstanceOf */
	function InstanceOf(){ Op.apply(this,arguments) };
	
	subclass$(InstanceOf,Op);
	exports.InstanceOf = InstanceOf; // export class 
	InstanceOf.prototype.js = function (o){
		if(this.right() instanceof Const) {
			var name = c__(this.right().value());
			var obj = this.left().node();
			// TODO also check for primitive-constructor
			if(idx$(name,['String','Number','Boolean']) >= 0) {
				if(!((obj instanceof LocalVarAccess))) {
					obj.cache();
				};
				// need a double check for these (cache left) - possibly
				return ("(typeof " + (obj.c()) + "=='" + (name.toLowerCase()) + "'||" + (obj.c()) + " instanceof " + name + ")");
				
				// convert
			};
		};
		var out = ("" + (this.left().c()) + " " + this.op() + " " + (this.right().c()));
		
		// should this not happen in #c?
		if(o.parent() instanceof Op) {
			out = helpers.parenthesize(out);
		};
		return out;
	};
	
	
	/* @class TypeOf */
	function TypeOf(){ Op.apply(this,arguments) };
	
	subclass$(TypeOf,Op);
	exports.TypeOf = TypeOf; // export class 
	TypeOf.prototype.js = function (){
		return "typeof " + (this.left().c());
	};
	
	
	/* @class Delete */
	function Delete(){ Op.apply(this,arguments) };
	
	subclass$(Delete,Op);
	exports.Delete = Delete; // export class 
	Delete.prototype.js = function (){
		var l = this.left();
		var tmp = this.scope__().temporary(this,{type: 'val'});
		var o = OP('=',tmp,l);
		// FIXME
		return ("(" + (o.c()) + ",delete " + (l.c()) + ", " + (tmp.c()) + ")");// oh well
		// var ast = [OP('=',tmp,left),"delete {left.c}",tmp]
		// should parenthesize directly no?
		// ast.c
	};
	
	Delete.prototype.shouldParenthesize = function (){
		return true;
	};
	
	
	/* @class In */
	function In(){ Op.apply(this,arguments) };
	
	subclass$(In,Op);
	exports.In = In; // export class 
	In.prototype.invert = function (){
		this._invert = !(this._invert);
		return this;
	};
	
	In.prototype.js = function (){
		var cond = (this._invert) ? ("== -1") : (">= 0");
		var idx = Util.indexOf(this.left(),this.right());
		return "" + (idx.c()) + " " + cond;
	};
	
	
	
	
	
	// ACCESS
	
	/* @class Access */
	function Access(){ Op.apply(this,arguments) };
	
	subclass$(Access,Op);
	exports.Access = Access; // export class 
	Access.prototype.clone = function (left,right){
		var ctor = this.constructor;
		return new ctor(this.op(),left,right);
	};
	
	Access.prototype.js = function (){
		var raw = null;
		var rgt = this.right();
		
		// is this right? Should not the index compile the brackets
		// or value is a symbol -- should be the same, no?
		if((rgt instanceof Index) && ((rgt.value() instanceof Str) || (rgt.value() instanceof Symbol))) {
			rgt = rgt.value();
		};
		
		// TODO do the identifier-validation in a central place instead
		if((rgt instanceof Str) && rgt.isValidIdentifier()) {
			raw = rgt.raw();
		} else if((rgt instanceof Symbol) && rgt.isValidIdentifier()) {
			raw = rgt.raw();
		} else if((rgt instanceof Identifier) && rgt.isValidIdentifier()) {
			raw = rgt.c();
		};
		
		// really?
		var ctx = (this.left() || this.scope__().context());
		
		if(ctx instanceof RootScopeContext) {
			return ((raw) ? (raw) : (("global[" + (rgt.c()) + "]")));
		};
		
		// see if it needs quoting
		if(raw) {
			return (ctx) ? (("" + (ctx.c()) + "." + raw)) : (raw);
		} else {
			var r = (rgt instanceof Node) ? (rgt.c({expression: true})) : (rgt);
			return ("" + (ctx.c()) + "[" + r + "]");
		};
	};
	
	Access.prototype.visit = function (){
		if(this.left()) {
			this.left().traverse();
		};
		if(this.right()) {
			this.right().traverse();
		};
		return;
	};
	
	Access.prototype.isExpressable = function (){
		return true;// ?
	};
	
	Access.prototype.isExpressable = function (){
		return true;
	};
	
	Access.prototype.alias = function (){
		return (this.right() instanceof Identifier) ? (sym__(this.right())) : (Access.__super__.alias.apply(this,arguments));
	};
	
	Access.prototype.safechain = function (){
		return this.right().safechain();
	};
	
	
	
	// Should change this to just refer directly to the variable? Or VarReference
	/* @class LocalVarAccess */
	function LocalVarAccess(){ Access.apply(this,arguments) };
	
	subclass$(LocalVarAccess,Access);
	exports.LocalVarAccess = LocalVarAccess; // export class 
	
	LocalVarAccess.prototype.__safechain = {};
	LocalVarAccess.prototype.safechain = function(v){ return this._safechain; }
	LocalVarAccess.prototype.setSafechain = function(v){ this._safechain = v; return this; };
	
	LocalVarAccess.prototype.js = function (){
		if((this.right() instanceof Variable) && this.right().type() == 'meth') {
			if(!((this.up() instanceof Call))) {
				return ("" + (this.right().c()) + "()");
			};
		};
		
		return this.right().c();
	};
	
	LocalVarAccess.prototype.variable = function (){
		return this.right();
	};
	
	LocalVarAccess.prototype.cache = function (o){
		if(o === undefined) o = {};
		if(o.force) {
			LocalVarAccess.__super__.cache.apply(this,arguments);
		};// hmm
		return this;
	};
	
	LocalVarAccess.prototype.alias = function (){
		return this.variable()._alias || LocalVarAccess.__super__.alias.apply(this,arguments);// if resolved?
	};
	
	
	
	/* @class GlobalVarAccess */
	function GlobalVarAccess(){ ValueNode.apply(this,arguments) };
	
	subclass$(GlobalVarAccess,ValueNode);
	exports.GlobalVarAccess = GlobalVarAccess; // export class 
	GlobalVarAccess.prototype.js = function (){
		return this.value().c();
	};
	
	
	
	/* @class ObjectAccess */
	function ObjectAccess(){ Access.apply(this,arguments) };
	
	subclass$(ObjectAccess,Access);
	exports.ObjectAccess = ObjectAccess; // export class 
	
	
	
	/* @class PropertyAccess */
	function PropertyAccess(){ Access.apply(this,arguments) };
	
	subclass$(PropertyAccess,Access);
	exports.PropertyAccess = PropertyAccess; // export class 
	PropertyAccess.prototype.js = function (o){
		var rec;
		if(rec = this.receiver()) {
			var ast = CALL(OP('.',this.left(),this.right()),[]);
			ast.setReceiver(rec);
			return ast.c();
		};
		
		// really need to fix this - for sure
		var js = ("" + PropertyAccess.__super__.js.apply(this,arguments));
		if(!((this.up() instanceof Call) || (this.up() instanceof Util.IsFunction))) {
			js += "()";
		};
		return js;
	};
	
	PropertyAccess.prototype.receiver = function (){
		return ((this.left() instanceof SuperAccess) || (this.left() instanceof Super)) ? (
			SELF
		) : (
			null
		);
	};
	
	
	
	/* @class IvarAccess */
	function IvarAccess(){ Access.apply(this,arguments) };
	
	subclass$(IvarAccess,Access);
	exports.IvarAccess = IvarAccess; // export class 
	IvarAccess.prototype.cache = function (){
		return this;
	};
	
	
	
	/* @class ConstAccess */
	function ConstAccess(){ Access.apply(this,arguments) };
	
	subclass$(ConstAccess,Access);
	exports.ConstAccess = ConstAccess; // export class 
	
	
	
	/* @class IndexAccess */
	function IndexAccess(){ Access.apply(this,arguments) };
	
	subclass$(IndexAccess,Access);
	exports.IndexAccess = IndexAccess; // export class 
	IndexAccess.prototype.cache = function (o){
		if(o === undefined) o = {};
		if(o.force) {
			return IndexAccess.__super__.cache.apply(this,arguments);
		};
		this.right().cache();
		return this;
	};
	
	
	
	/* @class SuperAccess */
	function SuperAccess(){ Access.apply(this,arguments) };
	
	subclass$(SuperAccess,Access);
	exports.SuperAccess = SuperAccess; // export class 
	SuperAccess.prototype.js = function (o){
		var m = o.method();
		var up = o.parent();
		var deep = (o.parent() instanceof Access);
		
		var out = ("" + (this.left().c()) + ".__super__");
		
		if(!((up instanceof Access))) {
			out += ("." + (m.supername().c()));
			if(!((up instanceof Call))) {
				out += (".apply(" + (m.scope().context().c()) + ",arguments)");
			};
		};
		
		return out;
	};
	
	SuperAccess.prototype.receiver = function (){
		return SELF;
	};
	
	
	
	/* @class VarOrAccess */
	function VarOrAccess(){ ValueNode.apply(this,arguments) };
	
	subclass$(VarOrAccess,ValueNode);
	exports.VarOrAccess = VarOrAccess; // export class 
	VarOrAccess.prototype.visit = function (){
		var v_;
		this._identifier = this.value();// this is not a real identifier?
		// console.log "VarOrAccess {@identifier}"
		
		var scope = this.scope__();
		var variable = scope.lookup(this.value());
		
		if(variable && variable.declarator()) {
			variable.addReference(this);// hmm
			
			this.setValue(variable.accessor(this));
			(this.value().setSafechain(v_=this.safechain()),v_);// hmm
		} else if(this.value().symbol().indexOf('$') >= 0) {
			(this.setValue(v_=new GlobalVarAccess(this.value())),v_);
		} else {
			(this.setValue(v_=new PropertyAccess(".",scope.context(),this.value())),v_);
		};
		
		return this._value.traverse();
	};
	
	VarOrAccess.prototype.c = function (){
		return this.value().c();
	};
	
	VarOrAccess.prototype.node = function (){
		return this.value();
	};
	
	VarOrAccess.prototype.symbol = function (){
		return this.value() && this.value().symbol();
	};
	
	VarOrAccess.prototype.cache = function (o){
		if(o === undefined) o = {};
		return this.value().cache(o);
	};
	
	VarOrAccess.prototype.decache = function (){
		this.value().decache();
		return this;
	};
	
	VarOrAccess.prototype.dom = function (){
		return this.value().dom();
	};
	
	VarOrAccess.prototype.safechain = function (){
		return this._identifier.safechain();// hmm
	};
	
	VarOrAccess.prototype.dump = function (){
		return {loc: this.loc()};
	};
	
	VarOrAccess.prototype.loc = function (){
		var loc = this._identifier.region();
		return loc || [0,0];
	};
	
	VarOrAccess.prototype.toString = function (){
		return "VarOrAccess(" + this.value() + ")";
	};
	
	
	
	/* @class VarReference */
	function VarReference(){ ValueNode.apply(this,arguments) };
	
	subclass$(VarReference,ValueNode);
	exports.VarReference = VarReference; // export class 
	
	VarReference.prototype.__variable = {};
	VarReference.prototype.variable = function(v){ return this._variable; }
	VarReference.prototype.setVariable = function(v){ this._variable = v; return this; };
	
	VarReference.prototype.js = function (o){
		var ref = this._variable;
		var out = ref.c();
		
		if(ref && !ref.option('declared')) {
			if(o.up(VarBlock)) {
				ref.set({declared: true});
			} else if(o.isExpression() || this.option('export')) {
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
	
	VarReference.prototype.declare = function (){
		return this;
	};
	
	VarReference.prototype.consume = function (node){
		this._variable && this._variable.autodeclare();
		return this;
	};
	
	VarReference.prototype.visit = function (){
		var variable_, v_;
		var name = this.value().c();
		// what about looking up? - on register we want to mark
		(variable_=this.variable()) || ((this.setVariable(v_=this.scope__().register(name,null)),v_));
		// FIXME -- should not simply override the declarator here(!)
		this.variable().setDeclarator(this);// hmm, cannot be certain, but ok for now
		this.variable().addReference(this.value());// is this the first reference?
		return this;
	};
	
	VarReference.prototype.refnr = function (){
		return this.variable().references().indexOf(this.value());
	};
	
	// convert this into a list of references
	VarReference.prototype.addExpression = function (expr){
		return new VarBlock([this]).addExpression(expr);
	};
	
	
	
	
	
	// ASSIGN
	
	/* @class Assign */
	function Assign(){ Op.apply(this,arguments) };
	
	subclass$(Assign,Op);
	exports.Assign = Assign; // export class 
	Assign.prototype.isExpressable = function (){
		return !this.right() || this.right().isExpressable();
	};
	
	Assign.prototype.isUsed = function (){
		if((this.up() instanceof Block) && this.up().last() != this) {
			return false;
		};
		return true;
	};
	
	Assign.prototype.js = function (o){
		if(!(this.right().isExpressable())) {
			return this.right().consume(this).c();
		};
		
		// p "assign left {left:contrstru}"
		var l = this.left().node();
		
		// We are setting self(!)
		// TODO document functionality
		if(l instanceof Self) {
			var ctx = this.scope__().context();
			l = ctx.reference();
		};
		
		
		if(l instanceof PropertyAccess) {
			var ast = CALL(OP('.',l.left(),l.right().setter()),[this.right()]);
			ast.setReceiver(l.receiver());
			
			if(this.isUsed()) {
				if(!(this.right().cachevar())) {
					this.right().cache({type: 'val',uses: 1});
				};// 
				// this is only when used.. should be more clever about it
				ast = new Parens(blk__([ast,this.right()]));
			};
			
			// should check the up-value no?
			return ast.c({expression: true});
		};
		
		// FIXME -- does not always need to be an expression?
		var out = ("" + (l.c()) + " " + this.op() + " " + (this.right().c({expression: true})));
		
		return out;
	};
	
	Assign.prototype.shouldParenthesize = function (){
		return (this.up() instanceof Op) && this.up().op() != '=';
	};
	
	
	Assign.prototype.consume = function (node){
		if(this.isExpressable()) {
			this.forceExpression();
			return Assign.__super__.consume.apply(this,arguments);
		};
		
		var ast = this.right().consume(this);
		return ast.consume(node);
	};
	
	
	
	/* @class PushAssign */
	function PushAssign(){ Assign.apply(this,arguments) };
	
	subclass$(PushAssign,Assign);
	exports.PushAssign = PushAssign; // export class 
	PushAssign.prototype.js = function (){
		return "" + (this.left().c()) + ".push(" + (this.right().c()) + ")";
	};
	
	PushAssign.prototype.consume = function (node){
		return this;
	};
	
	
	
	/* @class ConditionalAssign */
	function ConditionalAssign(){ Assign.apply(this,arguments) };
	
	subclass$(ConditionalAssign,Assign);
	exports.ConditionalAssign = ConditionalAssign; // export class 
	ConditionalAssign.prototype.consume = function (node){
		return this.normalize().consume(node);
	};
	
	ConditionalAssign.prototype.normalize = function (){
		var l = this.left().node();
		var ls = l;
		
		if(l instanceof Access) {
			if(l.left()) {
				l.left().cache();
			};
			ls = l.clone(l.left(),l.right());// this should still be cached?
			if(l instanceof PropertyAccess) {
				l.cache();
			};// correct now, to a certain degree
			if(l instanceof IndexAccess) {
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
		} else if(expr && this.op() == '&&=') {
			ast = OP('&&',l,OP('=',ls,this.right()));
		} else {
			ast = IF(this.condition(),OP('=',ls,this.right()),l);
		};
		if(ast.isExpressable()) {
			ast.toExpression();
		};// hmm
		return ast;
	};
	
	
	ConditionalAssign.prototype.c = function (){
		return this.normalize().c();
	};
	
	ConditionalAssign.prototype.condition = function (){
		return (this.op() == '?=') ? (
			OP('==',this.left(),NULL)
		) : ((this.op() == '||=') ? (
			OP('!',this.left())
		) : ((this.op() == '&&=') ? (
			this.left()
		) : ((this.op() == '!?=') ? (
			OP('!=',this.left(),NULL)
		) : (
			this.left()
		))));
	};
	
	ConditionalAssign.prototype.js = function (){
		var ast = IF(this.condition(),OP('=',this.left(),this.right()),this.left());
		if(ast.isExpressable()) {
			ast.toExpression();
		};
		return ast.c();
	};
	
	
	/* @class CompoundAssign */
	function CompoundAssign(){ Assign.apply(this,arguments) };
	
	subclass$(CompoundAssign,Assign);
	exports.CompoundAssign = CompoundAssign; // export class 
	CompoundAssign.prototype.consume = function (node){
		if(this.isExpressable()) {
			return CompoundAssign.__super__.consume.apply(this,arguments);
		};
		
		var ast = this.normalize();
		if(!(ast == this)) {
			return ast.consume(node);
		};
		
		ast = this.right().consume(this);
		return ast.consume(node);
	};
	
	CompoundAssign.prototype.normalize = function (){
		var ln = this.left().node();
		// we dont need to change this at all
		if(!((ln instanceof PropertyAccess))) {
			return this;
		};
		
		if(ln instanceof Access) {
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
	
	CompoundAssign.prototype.c = function (){
		var ast = this.normalize();
		if(ast == this) {
			return CompoundAssign.__super__.c.apply(this,arguments);
		};
		
		// otherwise it is important that we actually replace this node in the outer block
		// whenever we normalize and override c it is important that we can pass on caching
		// etc -- otherwise there WILL be issues.
		var up = STACK.current();
		if(up instanceof Block) {
			up.replace(this,ast);
		};
		return ast.c();
	};
	
	
	
	/* @class AsyncAssign */
	function AsyncAssign(){ Assign.apply(this,arguments) };
	
	subclass$(AsyncAssign,Assign);
	exports.AsyncAssign = AsyncAssign; // export class 
	
	
	
	/* @class TupleAssign */
	function TupleAssign(a,b,c){
		this._op = a;
		this._left = b;
		this._right = c;
		this._temporary = [];
	};
	
	subclass$(TupleAssign,Assign);
	exports.TupleAssign = TupleAssign; // export class 
	
	TupleAssign.prototype.__op = {};
	TupleAssign.prototype.op = function(v){ return this._op; }
	TupleAssign.prototype.setOp = function(v){ this._op = v; return this; };
	
	TupleAssign.prototype.__left = {};
	TupleAssign.prototype.left = function(v){ return this._left; }
	TupleAssign.prototype.setLeft = function(v){ this._left = v; return this; };
	
	TupleAssign.prototype.__right = {};
	TupleAssign.prototype.right = function(v){ return this._right; }
	TupleAssign.prototype.setRight = function(v){ this._right = v; return this; };
	
	TupleAssign.prototype.__type = {};
	TupleAssign.prototype.type = function(v){ return this._type; }
	TupleAssign.prototype.setType = function(v){ this._type = v; return this; };
	
	
	
	TupleAssign.prototype.isExpressable = function (){
		return this.right().isExpressable();
	};
	
	TupleAssign.prototype.addExpression = function (expr){
		var v_;
		if(this.right() instanceof Tuple) {
			this.right().push(expr);
		} else {
			(this.setRight(v_=new Tuple([this.right(),expr])),v_);
		};
		
		return this;
	};
	
	TupleAssign.prototype.visit = function (){
		var v_;
		if(this.left().first().node() instanceof VarReference) {
			(this.setType(v_='var'),v_);
			// NOTE can improve.. should rather make the whole left be a VarBlock or TupleVarBlock
			// p "type is var -- skip the rest"
		};
		
		this.right().traverse();
		this.left().traverse();
		return this;
	};
	
	TupleAssign.prototype.js = function (){
		var self=this;
		if(!(self.right().isExpressable())) {
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
		
		var ast = new Block();
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
			return v instanceof Splat;
		})[0];
		
		// if right is an array without any splats (or inner tuples?), normalize it to tuple
		if((rgt instanceof Arr) && !(rgt.splat())) {
			rgt = new Tuple(rgt.nodes());
		};
		var rlen = (rgt instanceof Tuple) ? (rgt.count()) : (null);
		
		// if any values are statements we need to handle this before continuing
		
		//  a,b,c = 10,20,ary 
		
		// ideally we only need to cache the first value (or n - 1), assign directly when possible.
		// only if the variables are not predefined or predeclared can be we certain that we can do it without caching
		// if rlen && typ == 'var' && !lsplat
		// 	# this can be dangerous in edgecases that are very hard to detect
		// 	# if it becomes an issue, fall back to simpler versions
		// 	# does not even matter if there is a splat?
		
		// special case for arguments(!)
		if(!lsplat && rgt == ARGUMENTS) {
			var pars = self.scope__().params();
			// p "special case with arguments {pars}"
			// forcing the arguments to be named
			// p "got here??? {pars}"
			lft.map(function (l,i){
				return ast.push(OP('=',l.node(),pars.at(i,true).visit().variable()));
			});// s.params.at(value - 1,yes)
		} else if(rlen) {
			var pre = [];
			var rest = [];
			
			var pairs = lft.map(function (l,i){
				var v = null;
				// determine if this needs to be precached?
				// if l isa VarReference
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
					v = new Arr(v);
					// ast.push OP('=',l.node,Arr.new(v))
				} else {
					v = rgt.index(li++);
				};
				return [l.node(),v];
				
				// if l isa VarReference && l.refnr 
			});
			var clean = true;
			
			pairs.map(function (v,i){
				var l = v[0];
				var r = v[1];
				
				if(clean) {
					if((l instanceof VarReference) && l.refnr() == 0) {
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
			var top = new VarBlock();
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
			// ast.push(blk = VarBlock.new)
			// blk = nil
			
			var blktype = (typ == 'var') ? (VarBlock) : (Block);
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
						arr = self.util().array(OP('-',len,num__(i + rem)),true),
						top.push(arr),
						lvar = arr.cachevar()
					) : (
						(!blk) && (ast.push(blk = new blktype())),
						arr = self.util().array(OP('-',len,num__(i + rem))),
						blk.push(OP('=',lvar,arr))
					),
					
					// if !lvar:variable || !lvar.variable # lvar = 
					// 	top.push()
					// p "has variable - no need to create a temp"
					// blk.push(OP('=',lvar,Arr.new([]))) # dont precalculate size now
					// max = to = (rlen - (llen - i))
					
					
					test = (rem) ? (OP('-',len,rem)) : (len),
					
					set = OP('=',OP('.',lvar,OP('-',idx,num__(i))),
					OP('.',iter,OP('++',idx))),
					
					ast.push(WHILE(OP('<',idx,test),set)),
					
					(typ != 'var') ? (
						ast.push(blk = new Block()),
						blk.push(OP('=',l.node(),lvar))
					) : (
						blk = null
					)
					
					// not if splat was last?
					// ast.push(blk = VarBlock.new)
				) : ((lsplat) ? (
					(!blk) && (ast.push(blk = new blktype())),
					// we could cache the raw code of this node for better performance
					blk.push(OP('=',l,OP('.',iter,OP('++',idx))))
				) : (
					(!blk) && (ast.push(blk = new blktype())),
					blk.push(OP('=',l,OP('.',iter,num__(i))))
				));
			});
		};
		
		
		if(ast.isExpressable()) {
			var out = ast.c({expression: true});
			if(typ) {
				out = ("" + typ + " " + out);
			};
			return out;
		} else {
			return ast.c();
		};
	};
	
	
	
	// IDENTIFIERS
	
	// really need to clean this up
	/* @class Identifier */
	function Identifier(){ ValueNode.apply(this,arguments) };
	
	subclass$(Identifier,ValueNode);
	exports.Identifier = Identifier; // export class 
	
	Identifier.prototype.__safechain = {};
	Identifier.prototype.safechain = function(v){ return this._safechain; }
	Identifier.prototype.setSafechain = function(v){ this._safechain = v; return this; };
	
	Identifier.prototype.load = function (v){
		var val = ((v instanceof Identifier) ? (v.value()) : (v));
		var len = val.length;
		// experimental way to include reserved-info
		// if v.match()
		
		// no?
		if(val[len - 1] == '?') {
			throw "Identifier#load";
			// console.log "nonono --"
			// p "safechain identifier?!"
			this.setSafechain(true);
			val = val.substr(0,len - 1);
		};
		
		return val;
	};
	
	Identifier.prototype.isValidIdentifier = function (){
		return true;
	};
	
	Identifier.prototype.isReserved = function (){
		return this._value.reserved;
	};
	
	Identifier.prototype.symbol = function (){
		return this._symbol || (this._symbol = sym__(this.value()));
	};
	
	Identifier.prototype.setter = function (){
		return this._setter || (this._setter = new Identifier(("set-" + (this.value().c()))));
	};
	
	Identifier.prototype.toString = function (){
		return String(this._value);
	};
	
	Identifier.prototype.js = function (){
		return sym__(this._value);
	};
	
	Identifier.prototype.c = function (){
		return sym__(this._value);
	};
	
	Identifier.prototype.dump = function (){
		return {loc: this.region(),value: this.value()};
	};
	
	
	
	/* @class TagId */
	function TagId(){ Identifier.apply(this,arguments) };
	
	subclass$(TagId,Identifier);
	exports.TagId = TagId; // export class 
	TagId.prototype.c = function (){
		return "id$('" + (this.value().c()) + "')";
	};
	
	
	// This is not an identifier - it is really a string
	// Is this not a literal?
	
	// FIXME Rename to IvarLiteral? or simply Literal with type Ivar
	/* @class Ivar */
	function Ivar(){ Identifier.apply(this,arguments) };
	
	subclass$(Ivar,Identifier);
	exports.Ivar = Ivar; // export class 
	Ivar.prototype.name = function (){
		return helpers.camelCase(this._value).replace(/^@/,'');
		// value.c.camelCase.replace(/^@/,'')
	};
	
	// the @ should possibly be gone from the start?
	Ivar.prototype.js = function (){
		return '_' + this.name();
	};
	
	Ivar.prototype.c = function (){
		return '_' + helpers.camelCase(this._value).replace(/^@/,'');
	};
	
	
	// Ambiguous - We need to be consistent about Const vs ConstAccess
	// Becomes more important when we implement typeinference and code-analysis
	/* @class Const */
	function Const(){ Identifier.apply(this,arguments) };
	
	subclass$(Const,Identifier);
	exports.Const = Const; // export class 
	
	
	
	/* @class TagTypeIdentifier */
	function TagTypeIdentifier(){ Identifier.apply(this,arguments) };
	
	subclass$(TagTypeIdentifier,Identifier);
	exports.TagTypeIdentifier = TagTypeIdentifier; // export class 
	
	TagTypeIdentifier.prototype.__name = {};
	TagTypeIdentifier.prototype.name = function(v){ return this._name; }
	TagTypeIdentifier.prototype.setName = function(v){ this._name = v; return this; };
	
	TagTypeIdentifier.prototype.__ns = {};
	TagTypeIdentifier.prototype.ns = function(v){ return this._ns; }
	TagTypeIdentifier.prototype.setNs = function(v){ this._ns = v; return this; };
	
	TagTypeIdentifier.prototype.load = function (val){
		this._str = ("" + val);
		var parts = this._str.split(":");
		this._raw = val;
		this._name = parts.pop();
		this._ns = parts.shift();// if any?
		return this._str;
	};
	
	TagTypeIdentifier.prototype.js = function (){
		return ("IMBA_TAGS." + (this._str.replace(":","$")));
	};
	
	TagTypeIdentifier.prototype.c = function (){
		return this.js();
	};
	
	TagTypeIdentifier.prototype.func = function (){
		var name = this._name.replace(/-/g,'_').replace(/\#/,'');// hmm
		if(this._ns) {
			name += ("$" + (this._ns.toLowerCase()));
		};
		return name;
	};
	
	TagTypeIdentifier.prototype.id = function (){
		var m = this._str.match(/\#([\w\-\d\_]+)\b/);
		return (m) ? (m[1]) : (null);
	};
	
	
	TagTypeIdentifier.prototype.flag = function (){
		return "_" + this.name().replace(/--/g,'_').toLowerCase();
	};
	
	TagTypeIdentifier.prototype.sel = function (){
		return "." + this.flag();// + name.replace(/-/g,'_').toLowerCase
	};
	
	TagTypeIdentifier.prototype.string = function (){
		return this.value();
	};
	
	
	
	/* @class Argvar */
	function Argvar(){ ValueNode.apply(this,arguments) };
	
	subclass$(Argvar,ValueNode);
	exports.Argvar = Argvar; // export class 
	Argvar.prototype.c = function (){
		var v = parseInt(String(this.value()));
		// FIXME Not needed anymore? I think the lexer handles this
		if(v == 0) {
			return "arguments";
		};
		
		var s = this.scope__();
		// params need to go up to the closeste method-scope
		var par = s.params().at(v - 1,true);
		return "" + (c__(par.name()));// c
	};
	
	
	
	// CALL
	
	/* @class Call */
	function Call(callee,args,opexists){
		if(callee instanceof VarOrAccess) {
			var str = callee.value().symbol();
			// p "Call callee {callee} - {str}"
			if(str == 'extern') {
				return new ExternDeclaration(args);
			};
			if(str == 'tag') {
				return new TagWrapper((args && args.index) ? (args.index(0)) : (args[0]));// hmmm
			};
			if(str == 'export') {
				return new ExportStatement(args);// hmmm
			};
		};
		
		this._callee = callee;
		this._args = args || new ArgList([]);// hmmm
		
		if(args instanceof Array) {
			this._args = new ArgList(args);
			// console.log "ARGUMENTS IS ARRAY - error {args}"
		};
		// p "call opexists {opexists}"
		this;
	};
	
	subclass$(Call,Expression);
	exports.Call = Call; // export class 
	
	Call.prototype.__callee = {};
	Call.prototype.callee = function(v){ return this._callee; }
	Call.prototype.setCallee = function(v){ this._callee = v; return this; };
	
	Call.prototype.__receiver = {};
	Call.prototype.receiver = function(v){ return this._receiver; }
	Call.prototype.setReceiver = function(v){ this._receiver = v; return this; };
	
	Call.prototype.__args = {};
	Call.prototype.args = function(v){ return this._args; }
	Call.prototype.setArgs = function(v){ this._args = v; return this; };
	
	Call.prototype.__block = {};
	Call.prototype.block = function(v){ return this._block; }
	Call.prototype.setBlock = function(v){ this._block = v; return this; };
	
	
	
	Call.prototype.visit = function (){
		this.args().traverse();
		this.callee().traverse();
		
		return this._block && this._block.traverse();
	};
	
	Call.prototype.addBlock = function (block){
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
	
	Call.prototype.receiver = function (){
		return this._receiver || (this._receiver = ((this.callee() instanceof Access) && this.callee().left() || NULL));
	};
	
	// check if all arguments are expressions - otherwise we have an issue
	
	Call.prototype.safechain = function (){
		return this.callee().safechain();// really?
	};
	
	Call.prototype.c = function (){
		return Call.__super__.c.apply(this,arguments);
	};
	
	Call.prototype.js = function (){
		var opt = {expression: true};
		var rec = null;
		var args = compact__(this.args());
		var splat = args.some(function (v){
			return v instanceof Splat;
		});
		var out = null;
		var lft = null;
		var rgt = null;
		var wrap = null;
		
		var callee = this._callee = this._callee.node();// drop the var or access?
		
		// p "{self} - {@callee}"
		
		if((callee instanceof Call) && callee.safechain()) {
			true;
			// we need to specify that the _result_ of
		};
		
		if(callee instanceof Access) {
			lft = callee.left();
			rgt = callee.right();
		};
		
		if((callee instanceof Super) || (callee instanceof SuperAccess)) {
			this._receiver = this.scope__().context();
			// return "supercall"
		};
		
		// never call the property-access directly?
		if(callee instanceof PropertyAccess) {
			this._receiver = callee.receiver();
			callee = this._callee = OP('.',callee.left(),callee.right());
			// console.log "unwrapping the propertyAccess"
		};
		
		
		if(lft && lft.safechain()) {
			lft.cache();
			// we want to 
			// wrap = ["{}"]
			// p "Call should not cache whole result - only the result of the call".red
		};
		
		
		if(callee.safechain()) {
			if(lft) {
				lft.cache();
			};
			// the outer safechain should not cache the whole call - only ask to cache
			// the result? -- chain onto
			// p "Call safechain {callee} {lft}.{rgt}"
			var isfn = new Util.IsFunction([callee]);
			wrap = [("" + (isfn.c()) + " && "),""];
		};
		
		// if callee.right
		// if calle is PropertyAccess we should convert it first
		// to keep the logic in call? 
		// 
		
		// if 
		
		// should just force expression from the start, no?
		if(splat) {
			var ary = ((args.count() == 1) ? (new ValueNode(args.first().value())) : (new Arr(args.list())));
			this.receiver().cache();// need to cache the target
			out = ("" + (callee.c({expression: true})) + ".apply(" + (this.receiver().c()) + "," + (ary.c({expression: true})) + ")");
		} else if(this._receiver) {
			this._receiver.cache();
			args.unshift(this.receiver());
			// should rather rewrite to a new call?
			out = ("" + (callee.c({expression: true})) + ".call(" + (args.c({expression: true})) + ")");
		} else {
			out = ("" + (callee.c({expression: true})) + "(" + (args.c({expression: true})) + ")");
		};
		
		if(wrap) {
			if(this._cache) {
				this._cache.manual = true;
				out = ("(" + (this.cachevar().c()) + "=" + out + ")");
			};
			
			out = [wrap[0],out,wrap[1]].join("");
		};
		
		return out;
	};
	
	
	
	
	
	/* @class ImplicitCall */
	function ImplicitCall(){ Call.apply(this,arguments) };
	
	subclass$(ImplicitCall,Call);
	exports.ImplicitCall = ImplicitCall; // export class 
	ImplicitCall.prototype.js = function (){
		return "" + (this.callee().c()) + "()";
	};
	
	
	
	
	/* @class New */
	function New(){ Call.apply(this,arguments) };
	
	subclass$(New,Call);
	exports.New = New; // export class 
	New.prototype.js = function (o){
		var out = ("new " + (this.callee().c()));
		if(!((o.parent() instanceof Call))) {
			out += '()';
		};
		return out;
		// "{callee.c}()"
	};
	
	
	
	
	/* @class SuperCall */
	function SuperCall(){ Call.apply(this,arguments) };
	
	subclass$(SuperCall,Call);
	exports.SuperCall = SuperCall; // export class 
	SuperCall.prototype.js = function (o){
		var m = o.method();
		this.setReceiver(SELF);
		this.setCallee(("" + (m.target().c()) + ".super$.prototype." + (m.name().c())));
		return SuperCall.__super__.js.apply(this,arguments);
	};
	
	
	
	
	/* @class ExternDeclaration */
	function ExternDeclaration(){ ListNode.apply(this,arguments) };
	
	subclass$(ExternDeclaration,ListNode);
	exports.ExternDeclaration = ExternDeclaration; // export class 
	ExternDeclaration.prototype.visit = function (){
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
	
	ExternDeclaration.prototype.c = function (){
		return "// externs";
		// register :global, self, type: 'global'
	};
	
	
	
	
	// FLOW
	
	/* @class ControlFlow */
	function ControlFlow(){ Node.apply(this,arguments) };
	
	subclass$(ControlFlow,Node);
	exports.ControlFlow = ControlFlow; // export class 
	
	
	
	
	/* @class ControlFlowStatement */
	function ControlFlowStatement(){ ControlFlow.apply(this,arguments) };
	
	subclass$(ControlFlowStatement,ControlFlow);
	exports.ControlFlowStatement = ControlFlowStatement; // export class 
	ControlFlowStatement.prototype.isExpressable = function (){
		return false;
	};
	
	
	
	
	/* @class If */
	function If(cond,body,o){
		if(o === undefined) o = {};
		this._test = ((o.type == 'unless') ? (OP('!',cond)) : (cond));
		this._body = body;
	};
	
	subclass$(If,ControlFlow);
	exports.If = If; // export class 
	
	If.prototype.__test = {};
	If.prototype.test = function(v){ return this._test; }
	If.prototype.setTest = function(v){ this._test = v; return this; };
	
	If.prototype.__body = {};
	If.prototype.body = function(v){ return this._body; }
	If.prototype.setBody = function(v){ this._body = v; return this; };
	
	If.prototype.__alt = {};
	If.prototype.alt = function(v){ return this._alt; }
	If.prototype.setAlt = function(v){ this._alt = v; return this; };
	
	
	If.prototype.addElse = function (add){
		if(this.alt() && (this.alt() instanceof If)) {
			this.alt().addElse(add);
		} else {
			(this.setAlt(add),add);
		};
		return this;
	};
	
	
	
	
	
	If.prototype.visit = function (){
		if(this.test()) {
			this.test().traverse();
		};
		if(this.body()) {
			this.body().traverse();
		};
		return (this.alt()) && (this.alt().traverse());
	};
	
	
	If.prototype.js = function (o){
		var brace = {braces: true,indent: true};
		
		var cond = this.test().c({expression: true});// the condition is always an expression
		
		
		if(o.isExpression()) {
			var code = this.body().c();// (braces: yes)
			// is expression!
			if(this.alt()) {
				return ("(" + cond + ") ? (" + code + ") : (" + (this.alt().c()) + ")");
			} else {
				return ("(" + cond + ") && (" + code + ")");
			};
		} else {
			code = this.body().c(brace);// (braces: yes)
			// don't wrap if it is only a single expression?
			var out = ("if(" + cond + ") ") + code;// ' {' + code + '}' # '{' + code + '}'
			if(this.alt()) {
				out += (" else " + (this.alt().c((this.alt() instanceof If) ? ({}) : (brace))));
			};
			return out;
		};
	};
	
	
	If.prototype.consume = function (node){
		if(node instanceof TagTree) {
			this._body = this.body().consume(node);
			if(this.alt()) {
				this._alt = this.alt().consume(node);
			};
			return this;
		};
		
		if(this.isExpressable()) {
			this.toExpression();// mark as expression(!)
			return If.__super__.consume.apply(this,arguments);
		} else {
			this._body = this.body().consume(node);
			if(this.alt()) {
				this._alt = this.alt().consume(node);
			};
		};
		return this;
	};
	
	
	If.prototype.isExpressable = function (){
		var exp = this.body().isExpressable() && (!this.alt() || this.alt().isExpressable());
		// if exp
		// 	p "if is expressable".green
		// else
		// 	p "if is not expressable".red
		return exp;
	};
	
	
	
	
	/* @class Loop */
	function Loop(options){
		if(options === undefined) options = {};
		this.setOptions(options);
		this;
	};
	
	subclass$(Loop,Statement);
	exports.Loop = Loop; // export class 
	
	Loop.prototype.__scope = {};
	Loop.prototype.scope = function(v){ return this._scope; }
	Loop.prototype.setScope = function(v){ this._scope = v; return this; };
	
	Loop.prototype.__options = {};
	Loop.prototype.options = function(v){ return this._options; }
	Loop.prototype.setOptions = function(v){ this._options = v; return this; };
	
	Loop.prototype.__body = {};
	Loop.prototype.body = function(v){ return this._body; }
	Loop.prototype.setBody = function(v){ this._body = v; return this; };
	
	Loop.prototype.__catcher = {};
	Loop.prototype.catcher = function(v){ return this._catcher; }
	Loop.prototype.setCatcher = function(v){ this._catcher = v; return this; };
	
	
	
	
	
	Loop.prototype.set = function (obj){
		this._options || (this._options = {});
		var keys = Object.keys(obj);
		for(var i=0, ary=iter$(keys), len=ary.length, k; i < len; i++) {
			k = ary[i];this._options[k] = obj[k];
		};
		return this;
	};
	
	
	Loop.prototype.addBody = function (body){
		this.setBody(blk__(body));
		return this;
	};
	
	
	Loop.prototype.c = function (o){
		if(this.stack().isExpression() || this.isExpression()) {
			var ast = CALL(FN([],[this]),[]);
			return ast.c(o);
		} else if(this.stack().current() instanceof Block) {
			return Loop.__super__.c.call(this,o);
		} else {
			ast = CALL(FN([],[this]),[]);
			return ast.c(o);
			// need to wrap in function
		};
	};
	
	
	
	
	/* @class While */
	function While(test,opts){
		this._test = test;
		this._scope = new WhileScope(this);
		if(opts) {
			this.set(opts);
		};
		// p "invert test for while? {@test}"
		if(this.option('invert')) {
			this._test = test.invert();
		};
		// invert the test
	};
	
	subclass$(While,Loop);
	exports.While = While; // export class 
	
	While.prototype.__test = {};
	While.prototype.test = function(v){ return this._test; }
	While.prototype.setTest = function(v){ this._test = v; return this; };
	
	
	
	
	
	While.prototype.visit = function (){
		this.scope().visit();
		if(this.test()) {
			this.test().traverse();
		};
		return (this.body()) && (this.body().traverse());
	};
	
	
	// TODO BUG -- when we declare a var like: while var y = ...
	// the variable will be declared in the WhileScope which never
	// force-declares the inner variables in the scope
	
	While.prototype.consume = function (node){
		if(this.isExpressable()) {
			return While.__super__.consume.apply(this,arguments);
		};
		
		if(node instanceof TagTree) {
			this.scope().context().reference();
			return CALL(FN([],[this]),[]);
		};
		
		var reuse = false;
		// WARN Optimization - might have untended side-effects
		// if we are assigning directly to a local variable, we simply
		// use said variable for the inner res
		// if reuse
		// 	resvar = scope.declare(node.left.node.variable,Arr.new([]),proxy: yes)
		// 	node = null
		// 	p "consume variable declarator!?".cyan
		// else
		// declare the variable we will use to soak up results
		// p "Creating value to store the result of loop".cyan
		// TODO Use a special vartype for this?
		var resvar = this.scope().declare('res',new Arr([]),{system: true});
		// WHAT -- fix this --
		this._catcher = new PushAssign("push",resvar,null);// the value is not preset # what
		this.body().consume(this._catcher);// should still return the same body
		
		// scope vars must not be compiled before this -- this is important
		var ast = BLOCK(this,resvar.accessor());// should be varaccess instead? # hmmm?
		return ast.consume(node);
		// NOTE Here we can find a way to know wheter or not we even need to 
		// return the resvar. Often it will not be needed
		// FIXME what happens if there is no node?!?
	};
	
	
	While.prototype.js = function (){
		var out = ("while(" + (this.test().c({expression: true})) + ")") + this.body().c({braces: true,indent: true});// .wrap
		
		if(this.scope().vars().count() > 0) {
			return [this.scope().vars().c(),out];
		};
		return out;
	};
	
	
	
	
	// This should define an open scope
	// should rather 
	/* @class For */
	function For(o){
		if(o === undefined) o = {};
		this._options = o;
		this._scope = new ForScope(this);
	};
	
	subclass$(For,Loop);
	exports.For = For; // export class 
	
	
	
	For.prototype.visit = function (){
		this.scope().visit();
		this.declare();
		// should be able to toggle whether to keep the results here already(!)
		this.body().traverse();
		return this.options().source.traverse();// what about awakening the vars here?
	};
	
	
	For.prototype.declare = function (){
		var scope = this.scope();
		var src = this.options().source;
		var vars = this.options().vars = {};
		var oi = this.options().index;
		
		
		// var i = vars:index = oi ? scope.declare(oi,0) : util.counter(0,yes).predeclare
		
		if(src instanceof Range) {
			vars.len = scope.declare('len',src.right());// util.len(o,yes).predeclare
			vars.index = scope.declare(this.options().name,src.left());
			vars.value = vars.index;
		} else {
			var i = vars.index = (oi) ? (scope.declare(oi,0,{let: true})) : (this.util().counter(0,true,scope).predeclare());
			vars.source = this.util().iterable(src,true).predeclare();// hmm
			vars.len = this.util().len(vars.source,true).predeclare();// hmm
			vars.value = scope.declare(this.options().name,null,{let: true});
			vars.value.addReference(this.options().name);// adding reference!
			if(oi) {
				i.addReference(oi);
			};
		};
		
		return this;
	};
	
	
	For.prototype.consume = function (node){
		if(this.isExpressable()) {
			return For.__super__.consume.apply(this,arguments);
		};
		
		// other cases as well, no?
		if(node instanceof TagTree) {
			this.scope().context().reference();
			return CALL(new Lambda([],[this]),[]);
		};
		
		
		var resvar = null;
		var reuseable = (node instanceof Assign) && (node.left().node() instanceof LocalVarAccess);
		
		// WARN Optimization - might have untended side-effects
		// if we are assigning directly to a local variable, we simply
		// use said variable for the inner res
		if(reuseable) {
			resvar = this.scope().declare(node.left().node().variable(),new Arr([]),{proxy: true});
			node = null;
			// p "consume variable declarator!?".cyan
		} else {
			resvar = this.scope().declare('res',new Arr([]),{system: true});
		};
		
		// p "GOT HERE TO PUSH ASSIGN",PushAssign
		this._catcher = new PushAssign("push",resvar,null);// the value is not preset
		this.body().consume(this._catcher);// should still return the same body
		
		var ast = BLOCK(this,resvar.accessor());// should be varaccess instead?
		if(node) {
			ast.consume(node);
		};
		// this is never an expression (for now -- but still)
		return ast;
	};
	
	
	For.prototype.js = function (){
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
		if(src instanceof Range) {
			if(src.inclusive()) {
				(cond.setOp(v_='<='),v_);
			};
		} else if(val.refcount() < 3) {
			val.proxy(vars.source,i);
		} else {
			this.body().unshift(OP('=',val,OP('.',vars.source,i)));
			// body.unshift(head)
			// TODO check lengths - intelligently decide whether to brace and indent
		};
		var head = ("for(" + (this.scope().vars().c()) + "; " + (cond.c()) + "; " + (final.c()) + ") ");
		return head + this.body().c({braces: true,indent: true});// .wrap
	};
	
	
	For.prototype.head = function (){
		var vars = this.options().vars;
		return OP('=',vars.value,OP('.',vars.source,vars.index));
	};
	
	
	
	
	/* @class ForIn */
	function ForIn(){ For.apply(this,arguments) };
	
	subclass$(ForIn,For);
	exports.ForIn = ForIn; // export class 
	
	
	
	
	/* @class ForOf */
	function ForOf(){ For.apply(this,arguments) };
	
	subclass$(ForOf,For);
	exports.ForOf = ForOf; // export class 
	ForOf.prototype.declare = function (){
		var vars = this.options().vars = {};
		
		var o = vars.source = this.scope().declare('o',this.options().source,{system: true});
		if(this.options().index) {
			var v = vars.value = this.scope().declare(this.options().index,null,{let: true});
		};
		
		if(this.options().own) {
			var i = vars.index = this.scope().declare('i',0,{system: true});
			var keys = vars.keys = this.scope().declare('keys',Util.keys(o.accessor()),{system: true});
			var l = vars.len = this.scope().declare('l',Util.len(keys.accessor()),{system: true});
			var k = vars.key = this.scope().declare(this.options().name,null,{system: true});
		} else {
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
	
	ForOf.prototype.js = function (){
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
			
			var head = ("for(" + (this.scope().vars().c()) + "; " + (OP('<',i,vars.len).c()) + "; " + (OP('++',i).c()) + ")");
			return head + this.body().c({indent: true,braces: true});// .wrap
		};
		
		var code = this.body().c({braces: true,indent: true});
		// it is really important that this is a treated as a statement
		return [this.scope().vars().c(),("for(var " + (k.c()) + " in " + (o.c()) + ")") + code];
	};
	
	ForOf.prototype.head = function (){
		var v = this.options().vars;
		
		return [
			OP('=',v.key,OP('.',v.keys,v.index)),
			(v.value) && (OP('=',v.value,OP('.',v.source,v.key)))
		];
	};
	
	
	
	
	/* @class Begin */
	function Begin(body){
		this._nodes = blk__(body).nodes();
	};
	
	subclass$(Begin,Block);
	exports.Begin = Begin; // export class 
	
	
	
	Begin.prototype.shouldParenthesize = function (){
		return this.isExpression();// hmmm
	};
	
	
	
	
	/* @class Switch */
	function Switch(a,b,c){
		this._source = a;
		this._cases = b;
		this._fallback = c;
	};
	
	subclass$(Switch,ControlFlowStatement);
	exports.Switch = Switch; // export class 
	
	Switch.prototype.__source = {};
	Switch.prototype.source = function(v){ return this._source; }
	Switch.prototype.setSource = function(v){ this._source = v; return this; };
	
	Switch.prototype.__cases = {};
	Switch.prototype.cases = function(v){ return this._cases; }
	Switch.prototype.setCases = function(v){ this._cases = v; return this; };
	
	Switch.prototype.__fallback = {};
	Switch.prototype.fallback = function(v){ return this._fallback; }
	Switch.prototype.setFallback = function(v){ this._fallback = v; return this; };
	
	
	
	
	
	Switch.prototype.visit = function (){
		this.cases().map(function (item){
			return item.traverse();
		});
		if(this.fallback()) {
			this.fallback().visit();
		};
		return (this.source()) && (this.source().visit());
	};
	
	
	Switch.prototype.consume = function (node){
		this._cases = this._cases.map(function (item){
			return item.consume(node);
		});
		if(this._fallback) {
			this._fallback = this._fallback.consume(node);
		};
		return this;
	};
	
	
	Switch.prototype.js = function (){
		var body = [];
		
		for(var i=0, ary=iter$(this.cases()), len=ary.length, part; i < len; i++) {
			part = ary[i];part.autobreak();
			body.push(part);
		};
		
		if(this.fallback()) {
			body.push("default:\n" + this.fallback().c({indent: true}));
		};
		
		return ("switch(" + (this.source().c()) + ") ") + helpers.bracketize(cary__(body).join("\n"),true);
	};
	
	
	
	
	/* @class SwitchCase */
	function SwitchCase(test,body){
		this._test = test;
		this._body = blk__(body);
	};
	
	subclass$(SwitchCase,ControlFlowStatement);
	exports.SwitchCase = SwitchCase; // export class 
	
	SwitchCase.prototype.__test = {};
	SwitchCase.prototype.test = function(v){ return this._test; }
	SwitchCase.prototype.setTest = function(v){ this._test = v; return this; };
	
	SwitchCase.prototype.__body = {};
	SwitchCase.prototype.body = function(v){ return this._body; }
	SwitchCase.prototype.setBody = function(v){ this._body = v; return this; };
	
	
	
	
	SwitchCase.prototype.visit = function (){
		return this.body().traverse();
	};
	
	
	SwitchCase.prototype.consume = function (node){
		this.body().consume(node);
		return this;
	};
	
	
	SwitchCase.prototype.autobreak = function (){
		if(!((this.body().last() instanceof BreakStatement))) {
			this.body().push(new BreakStatement());
		};
		return this;
	};
	
	
	SwitchCase.prototype.js = function (){
		if(!((this._test instanceof Array))) {
			this._test = [this._test];
		};
		var cases = this._test.map(function (item){
			return "case " + (item.c()) + ":";
		});
		return cases.join("\n") + this.body().c({indent: true});// .indent
	};
	
	
	
	
	/* @class Try */
	function Try(body,c,f){
		this._body = blk__(body);
		this._catch = c;
		this._finally = f;
	};
	
	subclass$(Try,ControlFlowStatement);
	exports.Try = Try; // export class 
	
	Try.prototype.__body = {};
	Try.prototype.body = function(v){ return this._body; }
	Try.prototype.setBody = function(v){ this._body = v; return this; };
	// prop ncatch
	// prop nfinally
	
	
	
	
	Try.prototype.consume = function (node){
		this._body = this._body.consume(node);
		if(this._catch) {
			this._catch = this._catch.consume(node);
		};
		if(this._finally) {
			this._finally = this._finally.consume(node);
		};
		return this;
	};
	
	
	Try.prototype.visit = function (){
		this._body.traverse();
		if(this._catch) {
			this._catch.traverse();
		};
		return (this._finally) && (this._finally.traverse());
		// no blocks - add an empty catch
	};
	
	
	Try.prototype.js = function (){
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
	function Catch(body,varname){
		this._body = blk__(body);
		this._scope = new CatchScope(this);
		this._varname = varname;
	};
	
	subclass$(Catch,ControlFlowStatement);
	exports.Catch = Catch; // export class 
	
	
	
	Catch.prototype.consume = function (node){
		this._body = this._body.consume(node);
		return this;
	};
	
	
	Catch.prototype.visit = function (){
		this._scope.visit();
		this._variable = this._scope.register(this._varname,this,{type: 'catchvar'});
		return this._body.traverse();
	};
	
	
	Catch.prototype.js = function (){
		return ("catch (" + (this._variable.c()) + ") ") + this._body.c({braces: true,indent: true}) + "\n";
	};
	
	
	
	// repeating myself.. don't deal with it until we move to compact tuple-args
	// for all astnodes
	
	
	/* @class Finally */
	function Finally(body){
		this._body = blk__(body);
	};
	
	subclass$(Finally,ControlFlowStatement);
	exports.Finally = Finally; // export class 
	
	
	
	Finally.prototype.visit = function (){
		return this._body.traverse();
	};
	
	
	Finally.prototype.consume = function (node){
		return this;
	};
	
	
	Finally.prototype.js = function (){
		return "finally " + this._body.c({braces: true,indent: true});
	};
	
	
	
	// RANGE
	
	/* @class Range */
	function Range(){ Op.apply(this,arguments) };
	
	subclass$(Range,Op);
	exports.Range = Range; // export class 
	Range.prototype.inclusive = function (){
		return this.op() == '..';
	};
	
	Range.prototype.c = function (){
		return "range";
	};
	
	
	
	/* @class Splat */
	function Splat(){ ValueNode.apply(this,arguments) };
	
	subclass$(Splat,ValueNode);
	exports.Splat = Splat; // export class 
	Splat.prototype.js = function (){
		var par = this.stack().parent();
		return (par instanceof Arr) ? (
			("[].slice.call(" + (this.value().c()) + ")")
		) : (
			"SPLAT"
		);
	};
	
	Splat.prototype.node = function (){
		return this.value();
	};
	
	
	
	
	
	
	// TAGS
	
	
	TAG_TYPES = {};
	TAG_ATTRS = {};
	
	
	TAG_TYPES.HTML = "a abbr address area article aside audio b base bdi bdo big blockquote body br button canvas caption cite code col colgroup data datalist dd del details dfn div dl dt em embed fieldset figcaption figure footer form h1 h2 h3 h4 h5 h6 head header hr html i iframe img input ins kbd keygen label legend li link main map mark menu menuitem meta meter nav noscript object ol optgroup option output p param pre progress q rp rt ruby s samp script section select small source span strong style sub summary sup table tbody td textarea tfoot th thead time title tr track u ul var video wbr".split(" ");
	
	TAG_TYPES.SVG = "circle defs ellipse g line linearGradient mask path pattern polygon polyline radialGradient rect stop svg text tspan".split(" ");
	
	TAG_ATTRS.HTML = "accept accessKey action allowFullScreen allowTransparency alt async autoComplete autoFocus autoPlay cellPadding cellSpacing charSet checked className cols colSpan content contentEditable contextMenu controls coords crossOrigin data dateTime defer dir disabled download draggable encType form formNoValidate frameBorder height hidden href hrefLang htmlFor httpEquiv icon id label lang list loop max maxLength mediaGroup method min multiple muted name noValidate pattern placeholder poster preload radioGroup readOnly rel required role rows rowSpan sandbox scope scrollLeft scrolling scrollTop seamless selected shape size span spellCheck src srcDoc srcSet start step style tabIndex target title type useMap value width wmode";
	
	TAG_ATTRS.SVG = "cx cy d dx dy fill fillOpacity fontFamily fontSize fx fy gradientTransform gradientUnits markerEnd markerMid markerStart offset opacity patternContentUnits patternUnits points preserveAspectRatio r rx ry spreadMethod stopColor stopOpacity stroke strokeDasharray strokeLinecap strokeOpacity strokeWidth textAnchor transform version viewBox x1 x2 x y1 y2 y";
	
	
	/* @class TagDesc */
	function TagDesc(){
		this.p('TagDesc!!!',arguments);
	};
	
	subclass$(TagDesc,Node);
	exports.TagDesc = TagDesc; // export class 
	
	
	TagDesc.prototype.classes = function (){
		this.p('TagDescClasses',arguments);
		return this;
	};
	
	
	/* @class Tag */
	function Tag(o){
		if(o === undefined) o = {};
		this._parts = [];
		o.classes || (o.classes = []);
		o.attributes || (o.attributes = []);
		o.classes || (o.classes = []);
		this._options = o;
	};
	
	subclass$(Tag,Expression);
	exports.Tag = Tag; // export class 
	
	Tag.prototype.__parts = {};
	Tag.prototype.parts = function(v){ return this._parts; }
	Tag.prototype.setParts = function(v){ this._parts = v; return this; };
	
	Tag.prototype.__object = {};
	Tag.prototype.object = function(v){ return this._object; }
	Tag.prototype.setObject = function(v){ this._object = v; return this; };
	
	Tag.prototype.__reactive = {};
	Tag.prototype.reactive = function(v){ return this._reactive; }
	Tag.prototype.setReactive = function(v){ this._reactive = v; return this; };
	
	Tag.prototype.__parent = {};
	Tag.prototype.parent = function(v){ return this._parent; }
	Tag.prototype.setParent = function(v){ this._parent = v; return this; };
	
	Tag.prototype.__tree = {};
	Tag.prototype.tree = function(v){ return this._tree; }
	Tag.prototype.setTree = function(v){ this._tree = v; return this; };
	
	
	
	Tag.prototype.set = function (obj){
		for(var o=obj, v, i=0, keys=Object.keys(o), l=keys.length, k; i < l; i++){
			k = keys[i];v = o[k];if(k == 'attributes') {
				for(var j=0, ary=iter$(v), len=ary.length; j < len; j++) {
					this.addAttribute(ary[j]);
				};
				continue;
			};
			
			this._options[k] = v;
		};
		return this;
	};
	
	Tag.prototype.addClass = function (node){
		if(!((node instanceof TagFlag))) {
			node = new TagFlag(node);
		};
		this._options.classes.push(node);
		this._parts.push(node);
		
		// p "add class!!!"
		return this;
	};
	
	Tag.prototype.addIndex = function (node){
		this._parts.push(node);
		// hmm
		this._object = node;
		// must be the first part?
		return this;
	};
	
	Tag.prototype.addSymbol = function (node){
		if(this._parts.length == 0) {
			this._parts.push(node);
			this._options.ns = node;
		};
		return this;
	};
	
	
	Tag.prototype.addAttribute = function (atr){
		this._parts.push(atr);// what?
		this._options.attributes.push(atr);
		return this;
	};
	
	Tag.prototype.type = function (){
		return this._options.type || 'div';
	};
	
	Tag.prototype.consume = function (node){
		if(node instanceof TagTree) {
			this.setReactive(node.reactive() || !(!this.option('ivar')));// hmm
			this.setParent(node.root());// hmm
			return this;
		} else {
			return Tag.__super__.consume.apply(this,arguments);
		};
	};
	
	Tag.prototype.visit = function (){
		var o = this._options;
		if(o.body) {
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
	
	Tag.prototype.reference = function (){
		return this._reference || (this._reference = this.scope__().temporary(this,{type: 'tag'}).resolve());
	};
	
	// should this not happen in js?
	Tag.prototype.js = function (){
		var body;
		var o = this._options;
		var a = {};
		
		var setup = [];
		var calls = [];
		var statics = [];
		
		var scope = this.scope__();
		var commit = "end";
		
		var isSelf = (this.type() instanceof Self);
		
		for(var i=0, ary=iter$(o.attributes), len=ary.length, atr; i < len; i++) {
			atr = ary[i];a[atr.key()] = atr.value();// .populate(obj)
		};
		
		var quote = function (str){
			return helpers.singlequote(str);
		};
		
		var id = (o.id instanceof Node) ? (o.id.c()) : ((o.id && quote(o.id.c())));
		
		
		
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
			statics.push((".setRef(" + (quote(o.ivar.name())) + "," + (scope.context().c()) + ")"));
		};
		
		// hmmm
		var tree = new TagTree(o.body,{root: this,reactive: this.reactive()}).resolve();
		this.setTree(tree);
		
		
		for(var i=0, ary=iter$(this._parts), len=ary.length, part; i < len; i++) {
			part = ary[i];if(part instanceof TagAttr) {
				var akey = String(part.key());
				
				// the attr should compile itself instead -- really
				
				if(akey[0] == '.') {
					calls.push((".flag(" + (quote(akey.substr(1))) + "," + (part.value().c()) + ")"));
				} else {
					calls.push(("." + (helpers.setterSym(akey)) + "(" + (part.value().c()) + ")"));
				};
			} else if(part instanceof TagFlag) {
				calls.push(part.c());
			};
		};
		
		if(this.object()) {
			calls.push((".setObject(" + (this.object().c()) + ")"));
		};
		
		// p "tagtree is static? {tree.static}"
		
		// we need to trigger our own reference before the body does
		if(this.reactive()) {
			this.reference();// hmm
		};
		
		if(body = tree.c({expression: true})) {
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
		if((o.ivar || this.reactive()) && !(this.type() instanceof Self)) {
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
		if(this._reference instanceof Variable) {
			this._reference.free();
		};
		// if setup:length
		// out += ".setup({setup.join(",")})"
		
		return out + calls.join("");
	};
	
	
	// This is a helper-node
	/* @class TagTree */
	function TagTree(){ ListNode.apply(this,arguments) };
	
	subclass$(TagTree,ListNode);
	exports.TagTree = TagTree; // export class 
	TagTree.prototype.load = function (list){
		return (list instanceof ListNode) ? (
			this._indentation || (this._indentation = list._indentation),
			list.nodes()
		) : (
			compact__((list instanceof Array) ? (list) : ([list]))
		);
	};
	
	TagTree.prototype.root = function (){
		return this.option('root');
	};
	
	TagTree.prototype.reactive = function (){
		return this.option('reactive');
	};
	
	TagTree.prototype.resolve = function (){
		var self=this;
		this.remap(function (c){
			return c.consume(self);
		});
		return self;
	};
	
	TagTree.prototype.static = function (){
		return (this._static == null) ? (this._static = this.every(function (c){
			return c instanceof Tag;
		})) : (this._static);
	};
	
	TagTree.prototype.c = function (){
		return TagTree.__super__.c.apply(this,arguments);
		
		// p "TagTree.c {nodes}"	
		var l = this.nodes().length;
		return (l == 1) ? (
			this.map(function (v){
				return v.c({expression: true});
			})
			// nodes.c(expression: yes)
		) : ((l > 1) && (
			this.nodes().c({expression: true})
		));
	};
	
	
	
	/* @class TagWrapper */
	function TagWrapper(){ ValueNode.apply(this,arguments) };
	
	subclass$(TagWrapper,ValueNode);
	exports.TagWrapper = TagWrapper; // export class 
	TagWrapper.prototype.visit = function (){
		if(this.value() instanceof Array) {
			this.value().map(function (v){
				return v.traverse();
			});
		} else {
			this.value().traverse();
		};
		return this;
	};
	
	TagWrapper.prototype.c = function (){
		return "tag$wrap(" + (this.value().c({expression: true})) + ")";
	};
	
	
	
	/* @class TagAttributes */
	function TagAttributes(){ ListNode.apply(this,arguments) };
	
	subclass$(TagAttributes,ListNode);
	exports.TagAttributes = TagAttributes; // export class 
	TagAttributes.prototype.get = function (name){
		for(var i=0, ary=iter$(this.nodes()), len=ary.length, node, res=[]; i < len; i++) {
			node = ary[i];if(node.key() == name) {
				return node;
			};
		};return res;
	};
	
	
	
	/* @class TagAttr */
	function TagAttr(k,v){
		this._key = k;
		this._value = v;
	};
	
	subclass$(TagAttr,Node);
	exports.TagAttr = TagAttr; // export class 
	
	TagAttr.prototype.__key = {};
	TagAttr.prototype.key = function(v){ return this._key; }
	TagAttr.prototype.setKey = function(v){ this._key = v; return this; };
	
	TagAttr.prototype.__value = {};
	TagAttr.prototype.value = function(v){ return this._value; }
	TagAttr.prototype.setValue = function(v){ this._value = v; return this; };
	
	TagAttr.prototype.visit = function (){
		if(this.value()) {
			this.value().traverse();
		};
		return this;
	};
	
	
	
	TagAttr.prototype.populate = function (obj){
		obj.add(this.key(),this.value());
		return this;
	};
	
	TagAttr.prototype.c = function (){
		return "attribute";
	};
	
	
	
	/* @class TagFlag */
	function TagFlag(value){
		this._value = value;
		this;
	};
	
	subclass$(TagFlag,Node);
	exports.TagFlag = TagFlag; // export class 
	
	TagFlag.prototype.__value = {};
	TagFlag.prototype.value = function(v){ return this._value; }
	TagFlag.prototype.setValue = function(v){ this._value = v; return this; };
	
	TagFlag.prototype.__toggler = {};
	TagFlag.prototype.toggler = function(v){ return this._toggler; }
	TagFlag.prototype.setToggler = function(v){ this._toggler = v; return this; };
	
	
	
	TagFlag.prototype.visit = function (){
		if(!((typeof this._value=='string'||this._value instanceof String))) {
			this._value.traverse();
		};
		return this;
	};
	
	TagFlag.prototype.c = function (){
		return (this.value() instanceof Node) ? (
			(".flag(" + (this.value().c()) + ")")
		) : (
			(".flag(" + (helpers.singlequote(this.value())) + ")")
		);
	};
	
	
	
	
	
	
	
	// SELECTORS
	
	
	/* @class Selector */
	function Selector(){ ListNode.apply(this,arguments) };
	
	subclass$(Selector,ListNode);
	exports.Selector = Selector; // export class 
	Selector.prototype.add = function (part,typ){
		this.push(part);
		return this;
	};
	
	Selector.prototype.query = function (){
		var str = "";
		var ary = [];
		
		for(var i=0, items=iter$(this.nodes()), len=items.length; i < len; i++) {
			var val = items[i].c();
			if((typeof val=='string'||val instanceof String)) {
				str = ("" + str + val);
			};
		};
		
		return "'" + str + "'";
	};
	
	
	Selector.prototype.js = function (o){
		var typ = this.option('type');
		var q = c__(this.query());
		
		// var scoped = typ == '%' or typ == '%%'
		// var all = typ == '$' or typ == '%'
		
		return (typ == '%') ? (
			("q$(" + q + "," + (o.scope().context().c({explicit: true})) + ")")// explicit context
		) : ((typ == '%%') ? (
			("q$$(" + q + "," + (o.scope().context().c()) + ")")
		) : (
			("q" + typ + "(" + q + ")")
		));
		
		// return "{typ} {scoped} - {all}"
	};
	
	
	
	/* @class SelectorPart */
	function SelectorPart(){ ValueNode.apply(this,arguments) };
	
	subclass$(SelectorPart,ValueNode);
	exports.SelectorPart = SelectorPart; // export class 
	SelectorPart.prototype.c = function (){
		return c__(this._value);
		// "{value.c}"
	};
	
	
	/* @class SelectorType */
	function SelectorType(){ SelectorPart.apply(this,arguments) };
	
	subclass$(SelectorType,SelectorPart);
	exports.SelectorType = SelectorType; // export class 
	SelectorType.prototype.c = function (){
		var name = this.value().name();
		// hmm - what about svg? do need to think this through.
		// at least be very conservative about which tags we
		// can drop the tag for?
		// out in TAG_TYPES.HTML ? 
		return (idx$(name,TAG_TYPES.HTML) >= 0) ? (name) : (this.value().sel());
	};
	
	
	
	/* @class SelectorUniversal */
	function SelectorUniversal(){ SelectorPart.apply(this,arguments) };
	
	subclass$(SelectorUniversal,SelectorPart);
	exports.SelectorUniversal = SelectorUniversal; // export class 
	
	
	/* @class SelectorNamespace */
	function SelectorNamespace(){ SelectorPart.apply(this,arguments) };
	
	subclass$(SelectorNamespace,SelectorPart);
	exports.SelectorNamespace = SelectorNamespace; // export class 
	
	
	/* @class SelectorClass */
	function SelectorClass(){ SelectorPart.apply(this,arguments) };
	
	subclass$(SelectorClass,SelectorPart);
	exports.SelectorClass = SelectorClass; // export class 
	SelectorClass.prototype.c = function (){
		return "." + (c__(this._value));
	};
	
	
	/* @class SelectorId */
	function SelectorId(){ SelectorPart.apply(this,arguments) };
	
	subclass$(SelectorId,SelectorPart);
	exports.SelectorId = SelectorId; // export class 
	SelectorId.prototype.c = function (){
		return "#" + (c__(this._value));
	};
	
	
	/* @class SelectorCombinator */
	function SelectorCombinator(){ SelectorPart.apply(this,arguments) };
	
	subclass$(SelectorCombinator,SelectorPart);
	exports.SelectorCombinator = SelectorCombinator; // export class 
	SelectorCombinator.prototype.c = function (){
		return "" + (c__(this._value));
	};
	
	
	/* @class SelectorPseudoClass */
	function SelectorPseudoClass(){ SelectorPart.apply(this,arguments) };
	
	subclass$(SelectorPseudoClass,SelectorPart);
	exports.SelectorPseudoClass = SelectorPseudoClass; // export class 
	
	
	/* @class SelectorAttribute */
	function SelectorAttribute(left,op,right){
		this._left = left;
		this._op = op;
		this._right = this._value = right;
	};
	
	subclass$(SelectorAttribute,SelectorPart);
	exports.SelectorAttribute = SelectorAttribute; // export class 
	
	
	SelectorAttribute.prototype.c = function (){
		return (this._right instanceof Str) ? (
			("[" + (this._left.c()) + this._op + (this._right.c()) + "]")
		) : ((this._right) ? (
			("[" + (this._left.c()) + this._op + "\"'+" + (c__(this._right)) + "+'\"]")
		) : (
			("[" + (this._left.c()) + "]")
			
			// ...
		));
	};
	
	
	
	
	
	// DEFER
	
	/* @class Await */
	function Await(){ ValueNode.apply(this,arguments) };
	
	subclass$(Await,ValueNode);
	exports.Await = Await; // export class 
	
	Await.prototype.__func = {};
	Await.prototype.func = function(v){ return this._func; }
	Await.prototype.setFunc = function(v){ this._func = v; return this; };
	
	Await.prototype.js = function (){
		return CALL(OP('.',new Util.Promisify([this.value()]),'then').prebreak(),[this.func()]).c();
		// value.c
	};
	
	Await.prototype.visit = function (o){
		var self=this;
		self.value().traverse();
		
		var block = o.up(Block);// or up to the closest FUNCTION?
		var outer = o.relative(block,1);
		var par = o.relative(self,-1);
		
		// p "Block {block} {outer} {par}"
		
		self.setFunc(new AsyncFunc([],[]));
		// now we move this node up to the block
		self.func().body().setNodes(block.defers(outer,self));
		
		// if the outer is a var-assignment, we can simply set the params
		if(par instanceof Assign) {
			par.left().traverse();
			var lft = par.left().node();
			// p "Async assignment {par} {lft}"
			// Can be a tuple as well, no?
			if(lft instanceof VarReference) {
				self.func().params().at(0,true,lft.variable().name());
			} else if(lft instanceof Tuple) {
				if(par.type() == 'var' && !(lft.hasSplat())) {
					lft.map(function (el,i){
						return self.func().params().at(i,true,el.value());
					});
				} else {
					par.setRight(ARGUMENTS);
					self.func().body().unshift(par);
				};
			} else {
				par.setRight(self.func().params().at(0,true));
				self.func().body().unshift(par);
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
	function AsyncFunc(params,body,name,target,options){
		AsyncFunc.__super__.constructor.apply(this,arguments);
	};
	
	subclass$(AsyncFunc,Func);
	exports.AsyncFunc = AsyncFunc; // export class 
	
	
	AsyncFunc.prototype.scopetype = function (){
		return LambdaScope;
	};
	
	// need to override, since we wont do implicit returns
	// def js
	// 	var code = scope.c
	// 	return "function ({params.c})" + code.wrap
	;
	
	
	
	// IMPORTS
	
	/* @class ImportStatement */
	function ImportStatement(imports,source,ns){
		this._imports = imports;
		this._source = source;
		this._ns = ns;
		this;
	};
	
	subclass$(ImportStatement,Statement);
	exports.ImportStatement = ImportStatement; // export class 
	
	ImportStatement.prototype.__ns = {};
	ImportStatement.prototype.ns = function(v){ return this._ns; }
	ImportStatement.prototype.setNs = function(v){ this._ns = v; return this; };
	
	ImportStatement.prototype.__imports = {};
	ImportStatement.prototype.imports = function(v){ return this._imports; }
	ImportStatement.prototype.setImports = function(v){ this._imports = v; return this; };
	
	ImportStatement.prototype.__source = {};
	ImportStatement.prototype.source = function(v){ return this._source; }
	ImportStatement.prototype.setSource = function(v){ this._source = v; return this; };
	
	
	
	
	
	ImportStatement.prototype.visit = function (){
		if(this._ns) {
			this._nsvar || (this._nsvar = this.scope__().register(this._ns,this));
		};
		return this;
	};
	
	
	ImportStatement.prototype.js = function (){
		var req = CALL(new Identifier("require"),[this.source()]);
		
		if(this._ns) {
			return ("var " + (this._nsvar.c()) + " = " + (req.c()));
		} else if(this._imports) {
			var out = [req.cache().c()];
			
			for(var i=0, ary=iter$(this._imports), len=ary.length, imp; i < len; i++) {
				imp = ary[i];var o = OP('=',imp,OP('.',req,imp));
				out.push(("var " + (o.c())));
			};
			
			return out;
		} else {
			return req.c();
		};
	};
	
	
	
	ImportStatement.prototype.consume = function (node){
		return this;
	};
	
	
	
	// EXPORT 
	
	/* @class ExportStatement */
	function ExportStatement(){ ValueNode.apply(this,arguments) };
	
	subclass$(ExportStatement,ValueNode);
	exports.ExportStatement = ExportStatement; // export class 
	ExportStatement.prototype.js = function (){
		true;
		var nodes = this._value.map(function (arg){
			return "module.exports." + (arg.c()) + " = " + (arg.c()) + ";\n";
		});
		return nodes.join("");
	};
	
	
	
	// UTILS
	
	/* @class Util */
	function Util(args){
		this._args = args;
	};
	
	subclass$(Util,Node);
	exports.Util = Util; // export class 
	
	Util.prototype.__args = {};
	Util.prototype.args = function(v){ return this._args; }
	Util.prototype.setArgs = function(v){ this._args = v; return this; };
	
	
	
	// this is how we deal with it now
	Util.extend = function (a,b){
		return new Util.Extend([a,b]);
	};
	
	Util.repeat = function (str,times){
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
	
	
	
	Util.keys = function (obj){
		var l = new Const("Object");
		var r = new Identifier("keys");
		return CALL(OP('.',l,r),[obj]);
	};
	
	Util.len = function (obj,cache){
		var r = new Identifier("length");
		var node = OP('.',obj,r);
		if(cache) {
			node.cache({force: true,type: 'len'});
		};
		return node;
	};
	
	Util.indexOf = function (lft,rgt){
		var node = new Util.IndexOf([lft,rgt]);
		// node.cache(force: yes, type: 'iter') if cache
		return node;
	};
	
	Util.slice = function (obj,a,b){
		var slice = new Identifier("slice");
		console.log(("slice " + a + " " + b));
		return CALL(OP('.',obj,slice),compact__([a,b]));
	};
	
	Util.iterable = function (obj,cache){
		var node = new Util.Iterable([obj]);
		if(cache) {
			node.cache({force: true,type: 'iter'});
		};
		return node;
	};
	
	
	
	Util.union = function (a,b){
		return new Util.Union([a,b]);
		// CALL(UNION,[a,b])
	};
	
	Util.intersect = function (a,b){
		return new Util.Intersect([a,b]);
		// CALL(INTERSECT,[a,b])
	};
	
	Util.counter = function (start,cache){
		var node = new Num(start);// make sure it really is a number
		if(cache) {
			node.cache({force: true,type: 'counter'});
		};
		return node;
	};
	
	Util.array = function (size,cache){
		var node = new Util.Array([size]);
		if(cache) {
			node.cache({force: true,type: 'list'});
		};
		return node;
	};
	
	Util.defineTag = function (type,ctor,supr){
		return CALL(TAGDEF,[type,ctor,supr]);
	};
	
	// hmm
	Util.defineClass = function (name,supr,initor){
		return CALL(CLASSDEF,[name || initor,this.sup()]);
	};
	
	
	Util.toAST = function (obj){
		return this;
	};
	
	Util.prototype.js = function (){
		return "helper";
	};
	
	
	/* @class Union */
	Util.Union = function Union(){ Util.apply(this,arguments) };
	
	subclass$(Util.Union,Util);
	Util.Union.prototype.helper = function (){
		return 'function union$(a,b){\n	if(a && a.__union) return a.__union(b);\n\n	var u = a.slice(0);\n	for(var i=0,l=b.length;i<l;i++) if(u.indexOf(b[i]) == -1) u.push(b[i]);\n	return u;\n};\n';
	};
	
	
	Util.Union.prototype.js = function (){
		this.scope__().root().helper(this,this.helper());
		// When this is triggered, we need to add it to the top of file?
		return "union$(" + (this.args().map(function (v){
			return v.c();
		}).join(',')) + ")";
	};
	
	
	/* @class Intersect */
	Util.Intersect = function Intersect(){ Util.apply(this,arguments) };
	
	subclass$(Util.Intersect,Util);
	Util.Intersect.prototype.helper = function (){
		return 'function intersect$(a,b){\n	if(a && a.__intersect) return a.__intersect(b);\n	var res = [];\n	for(var i=0, l=a.length; i<l; i++) {\n		var v = a[i];\n		if(b.indexOf(v) != -1) res.push(v);\n	}\n	return res;\n};\n';
	};
	
	Util.Intersect.prototype.js = function (){
		this.scope__().root().helper(this,this.helper());
		return "intersect$(" + (this.args().map(function (v){
			return v.c();
		}).join(',')) + ")";
	};
	
	
	/* @class Extend */
	Util.Extend = function Extend(){ Util.apply(this,arguments) };
	
	subclass$(Util.Extend,Util);
	Util.Extend.prototype.js = function (){
		return "extend$(" + (compact__(cary__(this.args())).join(',')) + ")";
	};
	
	
	/* @class IndexOf */
	Util.IndexOf = function IndexOf(){ Util.apply(this,arguments) };
	
	subclass$(Util.IndexOf,Util);
	Util.IndexOf.prototype.helper = function (){
		return 'function idx$(a,b){\n	return (b && b.indexOf) ? b.indexOf(a) : [].indexOf.call(a,b);\n};\n';
	};
	
	
	Util.IndexOf.prototype.js = function (){
		this.scope__().root().helper(this,this.helper());
		// When this is triggered, we need to add it to the top of file?
		return "idx$(" + (this.args().map(function (v){
			return v.c();
		}).join(',')) + ")";
	};
	
	
	/* @class Subclass */
	Util.Subclass = function Subclass(){ Util.apply(this,arguments) };
	
	subclass$(Util.Subclass,Util);
	Util.Subclass.prototype.helper = function (){
		return '// helper for subclassing\nfunction subclass$(obj,sup) {\n	for (var k in sup) {\n		if (sup.hasOwnProperty(k)) obj[k] = sup[k];\n	};\n	// obj.__super__ = sup;\n	obj.prototype = Object.create(sup.prototype);\n	obj.__super__ = obj.prototype.__super__ = sup.prototype;\n	obj.prototype.initialize = obj.prototype.constructor = obj;\n};\n';
	};
	
	Util.Subclass.prototype.js = function (){
		this.scope__().root().helper(this,this.helper());
		return "subclass$(" + (this.args().map(function (v){
			return v.c();
		}).join(',')) + ");\n";
	};
	
	
	/* @class Promisify */
	Util.Promisify = function Promisify(){ Util.apply(this,arguments) };
	
	subclass$(Util.Promisify,Util);
	Util.Promisify.prototype.helper = function (){
		return "function promise$(a)\{ return a instanceof Array ? Promise.all(a) : (a && a.then ? a : Promise.resolve(a)); \}";
	};
	
	Util.Promisify.prototype.js = function (){
		this.scope__().root().helper(this,this.helper());
		return "promise$(" + (this.args().map(function (v){
			return v.c();
		}).join(',')) + ")";
	};
	
	
	/* @class Class */
	Util.Class = function Class(){ Util.apply(this,arguments) };
	
	subclass$(Util.Class,Util);
	Util.Class.prototype.js = function (){
		return "class$(" + (this.args().map(function (v){
			return v.c();
		}).join(',')) + ")";
	};
	
	
	/* @class Iterable */
	Util.Iterable = function Iterable(){ Util.apply(this,arguments) };
	
	subclass$(Util.Iterable,Util);
	Util.Iterable.prototype.helper = function (){
		return "function iter$(a)\{ return a ? (a.toArray ? a.toArray() : a) : []; \};";
	};
	
	Util.Iterable.prototype.js = function (){
		if(this.args()[0] instanceof Arr) {
			return this.args()[0].c();
		};// or if we know for sure that it is an array
		// only wrap if it is not clear that this is an array?
		this.scope__().root().helper(this,this.helper());
		return ("iter$(" + (this.args()[0].c()) + ")");
	};
	
	
	/* @class IsFunction */
	Util.IsFunction = function IsFunction(){ Util.apply(this,arguments) };
	
	subclass$(Util.IsFunction,Util);
	Util.IsFunction.prototype.js = function (){
		return "" + (this.args()[0].c());
		// "isfn$({args[0].c})"
		// "typeof {args[0].c} == 'function'"
	};
	
	
	
	/* @class Array */
	Util.Array = function Array(){ Util.apply(this,arguments) };
	
	subclass$(Util.Array,Util);
	Util.Array.prototype.js = function (){
		return "new Array(" + (this.args().map(function (v){
			return v.c();
		})) + ")";
	};
	
	
	
	
	
	
	
	// SCOPES
	
	// handles local variables, self etc. Should create references to outer scopes
	// when needed etc.
	
	// should move the whole context-thingie right into scope
	/* @class Scope */
	function Scope(node,parent){
		this._head = [];
		this._node = node;
		this._parent = parent;
		this._vars = new VariableDeclaration([]);
		this._virtual = false;
		this._counter = 0;
		this._varmap = {};
		this._varpool = [];
	};
	
	exports.Scope = Scope; // export class 
	
	Scope.prototype.__level = {};
	Scope.prototype.level = function(v){ return this._level; }
	Scope.prototype.setLevel = function(v){ this._level = v; return this; };
	
	Scope.prototype.__context = {};
	Scope.prototype.context = function(v){ return this._context; }
	Scope.prototype.setContext = function(v){ this._context = v; return this; };
	
	Scope.prototype.__node = {};
	Scope.prototype.node = function(v){ return this._node; }
	Scope.prototype.setNode = function(v){ this._node = v; return this; };
	
	Scope.prototype.__parent = {};
	Scope.prototype.parent = function(v){ return this._parent; }
	Scope.prototype.setParent = function(v){ this._parent = v; return this; };
	
	Scope.prototype.__varmap = {};
	Scope.prototype.varmap = function(v){ return this._varmap; }
	Scope.prototype.setVarmap = function(v){ this._varmap = v; return this; };
	
	Scope.prototype.__varpool = {};
	Scope.prototype.varpool = function(v){ return this._varpool; }
	Scope.prototype.setVarpool = function(v){ this._varpool = v; return this; };
	
	Scope.prototype.__params = {};
	Scope.prototype.params = function(v){ return this._params; }
	Scope.prototype.setParams = function(v){ this._params = v; return this; };
	
	Scope.prototype.__head = {};
	Scope.prototype.head = function(v){ return this._head; }
	Scope.prototype.setHead = function(v){ this._head = v; return this; };
	
	Scope.prototype.__vars = {};
	Scope.prototype.vars = function(v){ return this._vars; }
	Scope.prototype.setVars = function(v){ this._vars = v; return this; };
	
	Scope.prototype.__counter = {};
	Scope.prototype.counter = function(v){ return this._counter; }
	Scope.prototype.setCounter = function(v){ this._counter = v; return this; };
	
	
	
	Scope.prototype.context = function (){
		return this._context || (this._context = new ScopeContext(this));
	};
	
	Scope.prototype.traverse = function (){
		return this;
	};
	
	Scope.prototype.visit = function (){
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
	Scope.prototype.virtualize = function (){
		return this;
	};
	
	
	Scope.prototype.root = function (){
		var scope = this;
		while(scope){
			if(scope instanceof FileScope) {
				return scope;
			};
			scope = scope.parent();
		};
		return null;
	};
	
	Scope.prototype.register = function (name,decl,o){
		if(decl === undefined) decl = null;
		if(o === undefined) o = {};
		name = helpers.symbolize(name);
		
		// also look at outer scopes if this is not closed?
		var existing = this._varmap.hasOwnProperty(name) && this._varmap[name];
		if(existing) {
			return existing;
		};
		
		var item = new Variable(this,name,decl,o);
		// need to check for duplicates, and handle this gracefully -
		// going to refactor later
		this._varmap[name] = item;
		return item;
	};
	// declares a variable (has no real declaration beforehand)
	
	// change these values, no?
	Scope.prototype.temporary = function (refnode,o,name){
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
		var item = new SystemVariable(this,name,refnode,o);
		this._varpool.push(item);// WHAT? It should not be in the pool unless explicitly put there?
		this._vars.push(item);// WARN variables should not go directly into a declaration-list
		return item;
		// return register(name || "__",nil,system: yes, temporary: yes)
	};
	
	Scope.prototype.declare = function (name,init,options){
		if(init === undefined) init = null;
		if(options === undefined) options = {};
		name = helpers.symbolize(name);
		this._vars.add(name,init);// .last
		var decl = this._vars.last();
		// item = Variable.new(self,name,decl)
		var item = new Variable(this,name,decl,options);
		decl.setVariable(item);
		return item.resolve();
		// should be possible to force-declare for this scope, no?
		// if this is a system-variable 
	};
	
	Scope.prototype.lookup = function (name){
		var g;
		var ret = null;
		name = helpers.symbolize(name);
		if(this._varmap.hasOwnProperty(name)) {
			ret = this._varmap[name];
		} else {
			ret = this.parent() && this.parent().lookup(name);
		};
		ret || (ret = ((g = this.root()) && (g.lookup(name))));
		// g = root
		return ret;
	};
	
	Scope.prototype.free = function (variable){
		variable.free();// :owner = nil
		// @varpool.push(variable)
		return this;
	};
	
	Scope.prototype.isClosed = function (){
		return false;
	};
	
	Scope.prototype.finalize = function (){
		return this;
	};
	
	Scope.prototype.klass = function (){
		var scope = this;
		while(scope){
			scope = scope.parent();
			if(scope instanceof ClassScope) {
				return scope;
			};
		};
		return null;
	};
	
	Scope.prototype.head = function (){
		return [this._vars,this._params];
	};
	
	Scope.prototype.c = function (o){
		var body;
		if(o === undefined) o = {};
		o.expression = false;
		// need to fix this
		this.node().body().setHead(this.head());
		return body = this.node().body().c(o);
		
		// var head = [@vars,@params].block.c(expression: no)
		// p "head from scope is ({head})"
		// var out = [head or nil,body].flatten__.compact.join("\n")
		// out
		// out = '{' + out + 
	};
	
	Scope.prototype.dump = function (){
		var self=this;
		var vars = Object.keys(self._varmap).map(function (k){
			var v = self._varmap[k];
			return (v.references().length) ? (self.dump(v)) : (null);
		});
		
		return {type: self.constructor.name,
		level: (self.level() || 0),
		vars: compact__(vars),
		loc: self.node().body().region()};
	};
	
	Scope.prototype.toString = function (){
		return "" + (this.constructor.name);
	};
	
	
	// FileScope is wrong? Rather TopScope or ProgramScope
	/* @class FileScope */
	function FileScope(){
		FileScope.__super__.constructor.apply(this,arguments);
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
	
	subclass$(FileScope,Scope);
	exports.FileScope = FileScope; // export class 
	
	FileScope.prototype.__warnings = {};
	FileScope.prototype.warnings = function(v){ return this._warnings; }
	FileScope.prototype.setWarnings = function(v){ this._warnings = v; return this; };
	
	FileScope.prototype.__scopes = {};
	FileScope.prototype.scopes = function(v){ return this._scopes; }
	FileScope.prototype.setScopes = function(v){ this._scopes = v; return this; };
	
	
	
	FileScope.prototype.context = function (){
		return this._context || (this._context = new RootScopeContext(this));
	};
	
	FileScope.prototype.lookup = function (name){
		name = helpers.symbolize(name);
		return (this._varmap.hasOwnProperty(name)) && (this._varmap[name]);
	};
	
	FileScope.prototype.visit = function (){
		STACK.addScope(this);
		return this;
	};
	
	FileScope.prototype.helper = function (typ,value){
		if(this._helpers.indexOf(value) == -1) {
			this._helpers.push(value);
		};
		return this;
	};
	
	FileScope.prototype.head = function (){
		return [this._helpers,this._params,this._vars];
	};
	
	FileScope.prototype.warn = function (data){
		data.node = null;
		// p "warning",JSON.stringify(data)
		this._warnings.push(data);
		return this;
	};
	
	FileScope.prototype.dump = function (){
		var scopes = this._scopes.map(function (s){
			return s.dump();
		});
		scopes.unshift(FileScope.__super__.dump.call(this));
		
		var obj = {
			warnings: this.dump(this._warnings),
			scopes: scopes
		};
		
		return obj;
	};
	
	
	
	
	/* @class ClassScope */
	function ClassScope(){ Scope.apply(this,arguments) };
	
	subclass$(ClassScope,Scope);
	exports.ClassScope = ClassScope; // export class 
	ClassScope.prototype.virtualize = function (){
		var up = this.parent();
		for(var o=this._varmap, i=0, keys=Object.keys(o), l=keys.length; i < l; i++){
			true;
			o[keys[i]].resolve(up,true);// force new resolve
		};
		return this;
	};
	
	
	/* @class TagScope */
	function TagScope(){ ClassScope.apply(this,arguments) };
	
	subclass$(TagScope,ClassScope);
	exports.TagScope = TagScope; // export class 
	
	
	/* @class ClosureScope */
	function ClosureScope(){ Scope.apply(this,arguments) };
	
	subclass$(ClosureScope,Scope);
	exports.ClosureScope = ClosureScope; // export class 
	
	
	/* @class FunctionScope */
	function FunctionScope(){ Scope.apply(this,arguments) };
	
	subclass$(FunctionScope,Scope);
	exports.FunctionScope = FunctionScope; // export class 
	
	
	/* @class MethodScope */
	function MethodScope(){ Scope.apply(this,arguments) };
	
	subclass$(MethodScope,Scope);
	exports.MethodScope = MethodScope; // export class 
	MethodScope.prototype.isClosed = function (){
		return true;
	};
	
	
	/* @class LambdaScope */
	function LambdaScope(){ Scope.apply(this,arguments) };
	
	subclass$(LambdaScope,Scope);
	exports.LambdaScope = LambdaScope; // export class 
	LambdaScope.prototype.context = function (){
		return this._context || (this._context = this.parent().context().reference(this));
	};
	
	
	/* @class FlowScope */
	function FlowScope(){ Scope.apply(this,arguments) };
	
	subclass$(FlowScope,Scope);
	exports.FlowScope = FlowScope; // export class 
	FlowScope.prototype.params = function (){
		return (this._parent) && (this._parent.params());
	};
	
	FlowScope.prototype.context = function (){
		return this.parent().context();
	};
	// 	# usually - if the parent scope is a closed scope we dont really need
	// 	# to force a reference
	// 	# @context ||= parent.context.reference(self)
	;
	
	/* @class CatchScope */
	function CatchScope(){ FlowScope.apply(this,arguments) };
	
	subclass$(CatchScope,FlowScope);
	exports.CatchScope = CatchScope; // export class 
	
	
	/* @class WhileScope */
	function WhileScope(){ FlowScope.apply(this,arguments) };
	
	subclass$(WhileScope,FlowScope);
	exports.WhileScope = WhileScope; // export class 
	
	
	/* @class ForScope */
	function ForScope(){ FlowScope.apply(this,arguments) };
	
	subclass$(ForScope,FlowScope);
	exports.ForScope = ForScope; // export class 
	
	
	// lives in scope
	/* @class Variable */
	function Variable(scope,name,decl,options){
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
	
	subclass$(Variable,Node);
	exports.Variable = Variable; // export class 
	
	Variable.prototype.__scope = {};
	Variable.prototype.scope = function(v){ return this._scope; }
	Variable.prototype.setScope = function(v){ this._scope = v; return this; };
	
	Variable.prototype.__name = {};
	Variable.prototype.name = function(v){ return this._name; }
	Variable.prototype.setName = function(v){ this._name = v; return this; };
	
	Variable.prototype.__alias = {};
	Variable.prototype.alias = function(v){ return this._alias; }
	Variable.prototype.setAlias = function(v){ this._alias = v; return this; };
	
	Variable.prototype.__type = {};
	Variable.prototype.type = function(v){ return this._type; }
	Variable.prototype.setType = function(v){ this._type = v; return this; };
	
	Variable.prototype.__options = {};
	Variable.prototype.options = function(v){ return this._options; }
	Variable.prototype.setOptions = function(v){ this._options = v; return this; };
	
	Variable.prototype.__declarator = {};
	Variable.prototype.declarator = function(v){ return this._declarator; }
	Variable.prototype.setDeclarator = function(v){ this._declarator = v; return this; };
	
	Variable.prototype.__autodeclare = {};
	Variable.prototype.autodeclare = function(v){ return this._autodeclare; }
	Variable.prototype.setAutodeclare = function(v){ this._autodeclare = v; return this; };
	
	Variable.prototype.__references = {};
	Variable.prototype.references = function(v){ return this._references; }
	Variable.prototype.setReferences = function(v){ this._references = v; return this; };
	
	Variable.prototype.__export = {};
	Variable.prototype.export = function(v){ return this._export; }
	Variable.prototype.setExport = function(v){ this._export = v; return this; };
	
	
	
	
	Variable.prototype.resolve = function (scope,force){
		var item;
		if(scope === undefined) scope = this.scope();
		if(force === undefined) force = false;
		if(this._resolved && !force) {
			return this;
		};
		
		this._resolved = true;
		// p "need to resolve!".cyan
		if(item = scope.lookup(this.name())) {
			if(item.scope() != scope && this.options().let) {
				scope.varmap()[this.name()] = this;
			};
			
			// different rules for different variables?
			if(this._options.proxy) {
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
	
	Variable.prototype.reference = function (){
		return this;
	};
	
	Variable.prototype.free = function (ref){
		this._declarator = null;
		return this;
	};
	
	Variable.prototype.reuse = function (ref){
		this._declarator = ref;
		return this;
	};
	
	Variable.prototype.proxy = function (par,index){
		this._proxy = [par,index];
		return this;
	};
	
	Variable.prototype.refcount = function (){
		return this._references.length;
	};
	
	Variable.prototype.c = function (){
		if(this._c) {
			return this._c;
		};
		
		if(this._proxy) {
			this._c = ("" + (this._proxy[0].c()) + "[" + (this._proxy[1].c()) + "]");
		} else {
			var v = (this.alias() || this.name());
			this._c = (typeof v == 'string') ? (v) : (v.c());
			// allow certain reserved words
			// should warn on others though (!!!)
			if(RESERVED_REGEX.test(this._c)) {
				this._c = ("" + this.c() + "$");
			};// @c.match(/^(default)$/)
		};
		return this._c;
	};
	
	// variables should probably inherit from node(!)
	Variable.prototype.consume = function (node){
		return this;
	};
	
	// this should only generate the accessors - not dael with references
	Variable.prototype.accessor = function (ref){
		var node = new LocalVarAccess(".",null,this);// this is just wrong .. should not be a regular accessor
		// @references.push([ref,el]) if ref # weird temp format
		return node;
	};
	
	Variable.prototype.addReference = function (ref){
		this._references.push(ref);
		return this;
	};
	
	Variable.prototype.autodeclare = function (){
		if(this.option('declared')) {
			return this;
		};
		// p "variable should autodeclare(!)"
		this._autodeclare = true;
		
		// WARN
		// if scope isa WhileScope
		// 	p "should do different autodeclare!!"
		// 	# or we should simply add them
		
		this.scope().vars().push(this);// only if it does not exist here!!!
		this.set({declared: true});
		return this;
	};
	
	Variable.prototype.toString = function (){
		return String(this.name());
	};
	
	Variable.prototype.dump = function (typ){
		return {
			type: this.type(),
			name: this.name(),
			refs: this.dump(this._references,typ)
		};
	};
	
	
	/* @class SystemVariable */
	function SystemVariable(){ Variable.apply(this,arguments) };
	
	subclass$(SystemVariable,Variable);
	exports.SystemVariable = SystemVariable; // export class 
	SystemVariable.prototype.predeclared = function (){
		this.scope().vars().remove(this);
		return this;
	};
	
	SystemVariable.prototype.resolve = function (){
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
	
	SystemVariable.prototype.name = function (){
		this.resolve();
		return this._name;
	};
	
	
	
	/* @class ScopeContext */
	function ScopeContext(scope,value){
		this._scope = scope;
		this._value = value;
		this._reference = null;
		this;
	};
	
	subclass$(ScopeContext,Node);
	exports.ScopeContext = ScopeContext; // export class 
	
	ScopeContext.prototype.__scope = {};
	ScopeContext.prototype.scope = function(v){ return this._scope; }
	ScopeContext.prototype.setScope = function(v){ this._scope = v; return this; };
	
	ScopeContext.prototype.__value = {};
	ScopeContext.prototype.value = function(v){ return this._value; }
	ScopeContext.prototype.setValue = function(v){ this._value = v; return this; };
	
	
	
	// instead of all these references we should probably
	// just register when it is accessed / looked up from
	// a deeper function-scope, and when it is, we should
	// register the variable in scope, and then start to
	// use that for further references. Might clean things
	// up for the cases where we have yet to decide the
	// name of the variable etc?
	
	ScopeContext.prototype.reference = function (){
		return this._reference || (this._reference = this.scope().declare("self",new This()));
	};
	
	ScopeContext.prototype.c = function (){
		var val = this._value || this._reference;
		return (val) ? (val.c()) : ("this");
	};
	
	
	/* @class RootScopeContext */
	function RootScopeContext(){ ScopeContext.apply(this,arguments) };
	
	subclass$(RootScopeContext,ScopeContext);
	exports.RootScopeContext = RootScopeContext; // export class 
	RootScopeContext.prototype.reference = function (scope){
		return this;
	};
	
	RootScopeContext.prototype.c = function (o){
		if(o && o.explicit) {
			return "";
		};
		var val = this._value || this._reference;
		return (val) ? (val.c()) : ("this");
		// should be the other way around, no?
		// o and o:explicit ? super : ""
	};
	
	
	/* @class Super */
	function Super(){ Node.apply(this,arguments) };
	
	subclass$(Super,Node);
	exports.Super = Super; // export class 
	Super.prototype.c = function (){
		var m = STACK.method();
		var out = null;
		var up = STACK.current();
		var deep = (up instanceof Access);
		
		// TODO optimization for later - problematic if there is a different reference in the end
		if(false && m && m.type() == 'constructor') {
			out = ("" + (m.target().c()) + ".superclass");
			if(!deep) {
				out += (".apply(" + (m.scope().context().c()) + ",arguments)");
			};
		} else {
			out = ("" + (m.target().c()) + ".__super__");
			if(!((up instanceof Access))) {
				out += ("." + (c__(m.supername())));
				if(!((up instanceof Call))) {
					out += (".apply(" + (m.scope().context().c()) + ",arguments)");
				};
			};
		};
		return out;
	};
	
	
	// constants
	
	module.exports.BR = BR = new Newline('\n');
	module.exports.BR2 = BR2 = new Newline('\n\n');
	module.exports.SELF = SELF = new Self();
	module.exports.SUPER = SUPER = new Super();
	module.exports.TRUE = TRUE = new True('true');
	module.exports.FALSE = FALSE = new False('false');
	module.exports.ARGUMENTS = ARGUMENTS = new ArgsReference('arguments');
	module.exports.EMPTY = EMPTY = '';
	module.exports.NULL = NULL = 'null';
	
	module.exports.RESERVED = RESERVED = ['default','native','enum','with'];
	module.exports.RESERVED_REGEX = RESERVED_REGEX = /^(default|native|enum|with)$/;
	
	module.exports.UNION = UNION = new Const('union$');
	module.exports.INTERSECT = INTERSECT = new Const('intersect$');
	module.exports.CLASSDEF = CLASSDEF = new Const('imba$class');
	module.exports.TAGDEF = TAGDEF = new Const('Imba.Tag.define');
	module.exports.NEWTAG = NEWTAG = new Identifier("tag$");


}())