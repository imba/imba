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
	var AST, OP, OP_COMPOUND, NODES, SPLAT, STACK, K_IVAR, K_SYM, K_STR, K_PROP, BR, BR2, SELF, SUPER, TRUE, FALSE, UNDEFINED, NIL, ARGUMENTS, EMPTY, NULL, RESERVED, RESERVED_REGEX, UNION, INTERSECT, CLASSDEF, TAGDEF, NEWTAG;
	// TODO Create Expression - make all expressions inherit from these?
	
	// externs;
	
	var helpers = require('./helpers');
	var v8 = null; // require 'v8-natives'
	
	var T = require('./token');
	var Token = T.Token;
	
	
	module.exports.AST = AST = {};
	
	// Helpers for operators
	module.exports.OP = OP = function(op,l,r) {
		var o = String(op);
		// console.log "operator",o
		switch (o) {
			case '.':
				if ((typeof r=='string'||r instanceof String)) { r = new Identifier(r) };
				// r = r.value if r isa VarOrAccess
				return new Access(op,l,r);
				break;
			
			case '=':
				if (l instanceof Tuple) { return new TupleAssign(op,l,r) };
				return new Assign(op,l,r);
				break;
			
			case '?=':
			case '||=':
			case '&&=':
				return new ConditionalAssign(op,l,r);
				break;
			
			case '+=':
			case '-=':
			case '*=':
			case '/=':
			case '^=':
			case '%=':
				return new CompoundAssign(op,l,r);
				break;
			
			case '?.':
				if (r instanceof VarOrAccess) {
					// console.log "is var or access"
					r = r.value();
				};
				// depends on the right side - this is wrong
				return new PropertyAccess(op,l,r);
				break;
			
			case 'instanceof':
				return new InstanceOf(op,l,r);
				break;
			
			case 'in':
				return new In(op,l,r);
				break;
			
			case 'typeof':
				return new TypeOf(op,l,r);
				break;
			
			case 'delete':
				return new Delete(op,l,r);
				break;
			
			case '--':
			case '++':
			case '!':
			case '√':
				return new UnaryOp(op,l,r);
				break;
			
			case '>':
			case '<':
			case '>=':
			case '<=':
			case '==':
			case '===':
			case '!=':
			case '!==':
				return new ComparisonOp(op,l,r);
				break;
			
			case '∩':
			case '∪':
				return new MathOp(op,l,r);
				break;
			
			case '..':
			case '...':
				return new Range(op,l,r);
				break;
			
			default:
			
				return new Op(op,l,r);
		
		};
	};
	
	module.exports.OP_COMPOUND = OP_COMPOUND = function(sym,op,l,r) {
		// console.log "?. soak operator",sym
		if (sym == '?.') {
			console.log("?. soak operator");
			return null;
		};
		if (sym == '?=' || sym == '||=' || sym == '&&=') {
			return new ConditionalAssign(op,l,r);
		} else {
			return new CompoundAssign(op,l,r);
		};
	};
	
	var OPTS = {};
	
	module.exports.NODES = NODES = [];
	
	var LIT = function(val) {
		return new Literal(val);
	};
	
	var SYM = function(val) {
		return new Symbol(val);
	};
	
	var IF = function(cond,body,alt) {
		var node = new If(cond,body);
		if (alt) { node.addElse(alt) };
		return node;
	};
	
	var FN = function(pars,body) {
		return new Func(pars,body);
	};
	
	var CALL = function(callee,pars) {
		// possibly return instead(!)
		if(pars === undefined) pars = [];
		return new Call(callee,pars);
	};
	
	var CALLSELF = function(name,pars) {
		if(pars === undefined) pars = [];
		var ref = new Identifier(name);
		return new Call(OP('.',SELF,ref),pars);
	};
	
	var BLOCK = function() {
		return Block.wrap([].slice.call(arguments));
	};
	
	var WHILE = function(test,code) {
		return new While(test).addBody(code);
	};
	
	module.exports.SPLAT = SPLAT = function(value) {
		if (value instanceof Assign) {
			// p "WARN"
			value.setLeft(new Splat(value.left()));
			return value;
		} else {
			return new Splat(value);
			// not sure about this
		};
	};
	
	// OP.ASSIGNMENT = [ "=" , "+=" , "-=" , "*=" , "/=" , "%=", "<<=" , ">>=" , ">>>=", "|=" , "^=" , "&=" ]
	// OP.LOGICAL = [ "||" , "&&" ]
	// OP.UNARY = [ "++" , "--" ]
	
	var SEMICOLON_TEST = /;(\s*\/\/.*)?[\n\s\t]*$/;
	var RESERVED_TEST = /^(default|char)$/;
	
	
	function parseError(str,o){
		// console.log "parseError {str}"
		if (o.lexer) {
			var token = o.lexer.yytext;
			// console.log token.@col
			str = ("[" + (token._loc) + ":" + (token._len || String(token).length) + "] " + str);
		};
		var e = new Error(str);
		e.lexer = o.lexer;
		throw e;
	}; exports.parseError = parseError;
	
	function c__(obj){
		return typeof obj == 'string' ? (obj) : (obj.c());
	};
	
	function num__(num){
		return new Num(num);
	};
	
	function str__(str){
		// should pack in token?!?
		return new Str(str);
	};
	
	function blk__(obj){
		return obj instanceof Array ? (Block.wrap(obj)) : (obj);
	};
	
	function sym__(obj){
		// console.log "sym {obj}"
		return helpers.symbolize(String(obj));
	};
	
	function cary__(ary){
		return ary.map(function(v) { return typeof v == 'string' ? (v) : (v.c()); });
	};
	
	function dump__(obj,key){
		if (obj instanceof Array) {
			return obj.map(function(v) { return v && v.dump ? (v.dump(key)) : (v); });
		} else if (obj && obj.dump) {
			return obj.dump();
		};
	};
	
	function compact__(ary){
		if (ary instanceof ListNode) {
			return ary.compact();
		};
		
		return ary.filter(function(v) { return v != undefined && v != null; });
	};
	
	function reduce__(res,ary){
		for (var i=0, items=iter$(ary), len=items.length, v; i < len; i++) {
			v = items[i];
			v instanceof Array ? (reduce__(res,v)) : (res.push(v));
		};
		return;
	};
	
	function flatten__(ary,compact){
		if(compact === undefined) compact = false;
		var out = [];
		for (var i=0, items=iter$(ary), len=items.length, v; i < len; i++) {
			v = items[i];
			v instanceof Array ? (reduce__(out,v)) : (out.push(v));
		};
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
		if (typ == 'call') {
			if (pars[0].c() == 'return') {
				pars[0] = 'tata';
			};
			return new Call(pars[0],pars[1],pars[2]);
		};
	};
	
	
	AST.escapeComments = function (str){
		if (!str) { return '' };
		return str;
	};
	
	function Indentation(a,b){
		this._open = a;
		this._close = b;
		this;
	};
	
	exports.Indentation = Indentation; // export class 
	
	Indentation.prototype.__open = {name: 'open'};
	Indentation.prototype.open = function(v){ return this._open; }
	Indentation.prototype.setOpen = function(v){ this._open = v; return this; };
	
	Indentation.prototype.__close = {name: 'close'};
	Indentation.prototype.close = function(v){ return this._close; }
	Indentation.prototype.setClose = function(v){ this._close = v; return this; };
	
	Indentation.prototype.isGenerated = function (){
		return this._open && this._open.generated;
	};
	
	// should rather parse and extract the comments, no?
	Indentation.prototype.wrap = function (str){
		// var pre, post
		
		// console.log "INDENT {@open and JSON.stringify(@open.@meta)}"
		// console.log "OUTDENT {@close}"
		// var ov = @open and @open.@value
		// if ov and ov:length > 1
		// 	console.log "value for indent",ov
		// 	if ov.indexOf('%|%')
		// 		pre = ov.substr
		var om = this._open && this._open._meta;
		var pre = om && om.pre || '';
		var post = om && om.post || '';
		var esc = AST.escapeComments;
		var out = this._close;
		
		// the first newline should not be indented?
		str = post.replace(/^\n/,'') + str;
		str = str.replace(/^/g,"\t").replace(/\n/g,"\n\t").replace(/\n\t$/g,"\n");
		
		str = pre + '\n' + str;
		if (out instanceof Terminator) { str += out.c() };
		if (str[str.length - 1] != '\n') { str = str + '\n' };
		return str;
	};
	
	var INDENT = new Indentation({},{});
	
	function Stack(){
		this.reset();
	};
	
	exports.Stack = Stack; // export class 
	
	Stack.prototype.__loglevel = {name: 'loglevel'};
	Stack.prototype.loglevel = function(v){ return this._loglevel; }
	Stack.prototype.setLoglevel = function(v){ this._loglevel = v; return this; };
	
	Stack.prototype.__nodes = {name: 'nodes'};
	Stack.prototype.nodes = function(v){ return this._nodes; }
	Stack.prototype.setNodes = function(v){ this._nodes = v; return this; };
	
	Stack.prototype.__scopes = {name: 'scopes'};
	Stack.prototype.scopes = function(v){ return this._scopes; }
	Stack.prototype.setScopes = function(v){ this._scopes = v; return this; };
	
	Stack.prototype.reset = function (){
		this._nodes = [];
		this._scoping = [];
		this._scopes = []; // for analysis - should rename
		this._loglevel = 3;
		this._counter = 0;
		return this;
	};
	
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
		this._nodes.pop(); // (node)
		return this;
	};
	
	Stack.prototype.parent = function (){
		return this._nodes[this._nodes.length - 2];
	};
	
	Stack.prototype.current = function (){
		return this._nodes[this._nodes.length - 1];
	};
	
	Stack.prototype.up = function (test){
		test || (test = function(v) { return !(v instanceof VarOrAccess); });
		
		if (test.prototype instanceof Node) {
			var typ = test;
			test = function(v) { return v instanceof typ; };
		};
		
		var i = this._nodes.length - 2; // key
		while (i >= 0){
			var node = this._nodes[i];
			if (test(node)) { return node };
			i -= 1;
		};
		return null;
	};
	
	Stack.prototype.relative = function (node,offset){
		if(offset === undefined) offset = 0;
		var idx = this._nodes.indexOf(node);
		return idx >= 0 ? (this._nodes[idx + offset]) : (null);
	};
	
	Stack.prototype.scope = function (lvl){
		if(lvl === undefined) lvl = 0;
		var i = this._nodes.length - 1 - lvl;
		while (i >= 0){
			var node = this._nodes[i];
			if (node._scope) { return node._scope };
			i -= 1;
		};
		return null;
	};
	
	Stack.prototype.scopes = function (){
		// include deeper scopes as well?
		var scopes = [];
		var i = this._nodes.length - 1;
		while (i >= 0){
			var node = this._nodes[i];
			if (node._scope) { scopes.push(node._scope) };
			i -= 1;
		};
		return scopes;
	};
	
	Stack.prototype.method = function (){
		return this.up(MethodDeclaration);
	};
	
	Stack.prototype.isExpression = function (){
		var i = this._nodes.length - 1;
		while (i >= 0){
			var node = this._nodes[i];
			// why are we not using isExpression here as well?
			if ((node instanceof Code) || (node instanceof Loop)) {
				return false;
			};
			if (node.isExpression()) {
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
		return this._nodes.filter(function(n) { return n._scope; }).map(function(n) { return n._scope; });
	};
	
	// Lots of globals -- really need to deal with one stack per file / context
	module.exports.STACK = STACK = new Stack();
	
	GLOBSTACK = STACK;
	
	// use a bitmask for these
	
	function Node(){
		this.setup();
		this;
	};
	
	exports.Node = Node; // export class 
	
	Node.prototype.__o = {name: 'o'};
	Node.prototype.o = function(v){ return this._o; }
	Node.prototype.setO = function(v){ this._o = v; return this; };
	
	Node.prototype.__options = {name: 'options'};
	Node.prototype.options = function(v){ return this._options; }
	Node.prototype.setOptions = function(v){ this._options = v; return this; };
	
	Node.prototype.__traversed = {name: 'traversed'};
	Node.prototype.traversed = function(v){ return this._traversed; }
	Node.prototype.setTraversed = function(v){ this._traversed = v; return this; };
	
	Node.prototype.safechain = function (){
		return false;
	};
	
	Node.prototype.dom = function (){
		var name = "ast_" + this.constructor.name.replace(/([a-z])([A-Z])/g,"$1_$2").toLowerCase();
		// p "try to get the dom-node for this ast-node",name
		if (Imba.TAGS[name]) {
			var node = Imba.tag(name);
			node.bind(this).build();
			return node;
		} else {
			return ("[" + name + "]");
		};
	};
	
	Node.prototype.p = function (){
		
		// allow controlling this from commandline
		if (STACK.loglevel() > 0) {
			console.log.apply(console,arguments);
		};
		return this;
	};
	
	Node.prototype.setup = function (){
		this._expression = false;
		this._traversed = false;
		this._parens = false;
		this._cache = null;
		this._value = null;
		return this;
	};
	
	Node.prototype.set = function (obj){
		// console.log "setting options {JSON.stringify(obj)}"
		this._options || (this._options = {});
		for (var i=0, keys=Object.keys(obj), l=keys.length; i < l; i++){
			this._options[keys[i]] = obj[keys[i]];
		};
		return this;
	};
	
	// get and set
	Node.prototype.option = function (key,val){
		if (val != undefined) {
			// console.log "setting option {key} {val}"
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
		return [0,0];
	};
	
	Node.prototype.loc = function (){
		return [0,0];
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
	
	Node.prototype.isString = function (){
		return false;
	};
	
	Node.prototype.isPrimitive = function (deep){
		return false;
	};
	
	Node.prototype.isReserved = function (){
		return false;
	};
	
	
	// should rather do traversals
	// o = {}, up, key, index
	Node.prototype.traverse = function (){
		if (this._traversed) {
			return this;
		};
		// NODES.push(self)
		this._traversed = true;
		STACK.push(this);
		this.visit(STACK);
		STACK.pop(this);
		return this;
	};
	
	Node.prototype.inspect = function (){
		return {type: this.constructor.toString()};
	};
	
	Node.prototype.js = function (o){
		return "NODE";
	};
	
	Node.prototype.toString = function (){
		return "" + (this.constructor.name);
	};
	
	// swallow might be better name
	Node.prototype.consume = function (node){
		if (node instanceof PushAssign) {
			return new PushAssign(node.op(),node.left(),this);
		};
		
		if (node instanceof Assign) {
			// p "consume assignment".cyan
			// node.right = self
			return OP(node.op(),node.left(),this);
		} else if (node instanceof Op) {
			return OP(node.op(),node.left(),this);
		} else if (node instanceof Return) {
			// p "consume return".cyan
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
		// might be better to nest this up after parsing is done?
		// p "addExpression {self} <- {expr}"
		var node = new ExpressionBlock([this]);
		return node.addExpression(expr);
	};
	
	
	Node.prototype.indented = function (a,b){
		
		if (a instanceof Indentation) {
			this._indentation = a;
			return this;
		};
		
		// this is a _BIG_ hack
		if (b instanceof Array) {
			this.add(b[0]);
			b = b[1];
		};
		
		// if indent and indent.match(/\:/)
		this._indentation || (this._indentation = a && b ? (new Indentation(a,b)) : (INDENT));
		return this;
	};
	
	Node.prototype.prebreak = function (term){
		// in options instead?
		// console.log "prebreak!!!!"
		// @prebreak = @prebreak or term
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
		return this;
	};
	
	Node.prototype.cachevar = function (){
		return this._cache && this._cache.var;
	};
	
	Node.prototype.decache = function (){
		if (this._cache) {
			this.cachevar().free();
			this._cache = null;
		};
		return this;
	};
	
	// is this without side-effects? hmm - what does it even do?
	Node.prototype.predeclare = function (){
		if (this._cache) {
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
		if (ch && ch.cached) { return this.c_cached(ch) };
		
		s.push(this);
		if (o && o.expression) this.forceExpression();
		
		v8 && console.log(v8.hasFastObjectElements(this));
		
		if (o && o.indent) {
			this._indentation || (this._indentation = INDENT);
		};
		
		var out = this.js(s,o);
		
		// really? why not call this somewhere else?
		var paren = this.shouldParenthesize();
		
		if (indent = this._indentation) {
			out = indent.wrap(out,o);
		};
		
		// should move this somewhere else really
		if (paren) { out = ("(" + out + ")") };
		if (o && o.braces) {
			if (indent) {
				out = '{' + out + '}';
			} else {
				out = '{ ' + out + ' }';
			};
		};
		
		s.pop(this);
		
		if (ch = this._cache) {
			if (!ch.manual) { out = ("" + (ch.var.c()) + "=" + out) };
			var par = s.current();
			if ((par instanceof Access) || (par instanceof Op)) { out = '(' + out + ')' }; // others? # 
			ch.cached = true;
		};
		return out;
	};
	
	Node.prototype.c_cached = function (cache){
		cache.lookups++;
		if (cache.uses == cache.lookups) { cache.var.free() };
		return cache.var.c(); // recompile every time??
	};
	
	function ValueNode(value){
		this.setup();
		this._value = this.load(value);
	};
	
	subclass$(ValueNode,Node);
	exports.ValueNode = ValueNode; // export class 
	
	ValueNode.prototype.__value = {name: 'value'};
	ValueNode.prototype.value = function(v){ return this._value; }
	ValueNode.prototype.setValue = function(v){ this._value = v; return this; };
	
	ValueNode.prototype.load = function (value){
		return value;
	};
	
	ValueNode.prototype.js = function (o){
		return typeof this._value == 'string' ? (this._value) : (this._value.c());
	};
	
	ValueNode.prototype.visit = function (){
		
		if (this._value instanceof Node) { this._value.traverse() }; //  && @value:traverse
		return this;
	};
	
	ValueNode.prototype.region = function (){
		return [this._value._loc,this._value._loc + this._value._len];
	};
	
	
	function Statement(){ ValueNode.apply(this,arguments) };
	
	subclass$(Statement,ValueNode);
	exports.Statement = Statement; // export class 
	Statement.prototype.isExpressable = function (){
		return false;
	};
	
	
	function Meta(){ ValueNode.apply(this,arguments) };
	
	subclass$(Meta,ValueNode);
	exports.Meta = Meta; // export class 
	Meta.prototype.isPrimitive = function (deep){
		return true;
	};
	
	function Comment(){ Meta.apply(this,arguments) };
	
	subclass$(Comment,Meta);
	exports.Comment = Comment; // export class 
	Comment.prototype.c = function (o){
		var v = this._value._value;
		// p @value.type
		if (o && o.expression || v.match(/\n/) || this._value.type() == 'HERECOMMENT') { // multiline?
			return "/*" + v + "*/";
		} else {
			return "// " + v;
		};
	};
	
	function Terminator(v){
		this._value = v;
		this;
	};
	
	subclass$(Terminator,Meta);
	exports.Terminator = Terminator; // export class 
	Terminator.prototype.traverse = function (){
		return this;
	};
	
	
	
	Terminator.prototype.c = function (){
		return this._value.c();
		// var v = value.replace(/\\n/g,'\n')
		return this.v(); // .split()
		// v.split("\n").map(|v| v ? " // {v}" : v).join("\n")
	};
	
	function Newline(v){
		this._traversed = false;
		this._value = v || '\n';
	};
	
	subclass$(Newline,Terminator);
	exports.Newline = Newline; // export class 
	Newline.prototype.c = function (){
		return c__(this._value);
	};
	
	
	// weird place?
	function Index(){ ValueNode.apply(this,arguments) };
	
	subclass$(Index,ValueNode);
	exports.Index = Index; // export class 
	Index.prototype.js = function (o){
		return this._value.c();
	};
	
	function ListNode(list){
		this.setup();
		this._nodes = this.load(list || []);
		this._indentation = null;
	};
	
	// PERF acces @nodes directly?
	subclass$(ListNode,Node);
	exports.ListNode = ListNode; // export class 
	
	ListNode.prototype.__nodes = {name: 'nodes'};
	ListNode.prototype.nodes = function(v){ return this._nodes; }
	ListNode.prototype.setNodes = function(v){ this._nodes = v; return this; };
	
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
		// need to store indented content as well?
		this._nodes = this.nodes().concat(other instanceof Array ? (other) : (other.nodes()));
		return this;
	};
	
	ListNode.prototype.swap = function (item,other){
		var idx = this.indexOf(item);
		if (idx >= 0) { this.nodes()[idx] = other };
		return this;
	};
	
	ListNode.prototype.push = function (item){
		this._nodes.push(item);
		return this;
	};
	
	ListNode.prototype.pop = function (){
		var end = this._nodes.pop();
		return end;
	};
	
	ListNode.prototype.add = function (item){
		this._nodes.push(item);
		return this;
	};
	
	ListNode.prototype.unshift = function (item,br){
		if (br) { this._nodes.unshift(BR) };
		this._nodes.unshift(item);
		return this;
	};
	
	// test
	ListNode.prototype.slice = function (a,b){
		return new this.constructor(this._nodes.slice(a,b));
	};
	
	
	
	ListNode.prototype.break = function (br,pre){
		if(pre === undefined) pre = false;
		if (typeof br == 'string') { br = new Terminator(br) };
		pre ? (this.unshift(br)) : (this.push(br));
		return this;
	};
	
	ListNode.prototype.some = function (cb){
		for (var i=0, ary=iter$(this._nodes), len=ary.length; i < len; i++) {
			if (cb(ary[i])) { return true };
		};
		return false;
	};
	
	ListNode.prototype.every = function (cb){
		for (var i=0, ary=iter$(this._nodes), len=ary.length; i < len; i++) {
			if (!cb(ary[i])) { return false };
		};
		return true;
	};
	
	ListNode.prototype.filter = function (cb){
		return this._nodes.filter(cb);
	};
	
	ListNode.prototype.pluck = function (cb){
		var item = this.filter(cb)[0];
		if (item) { this.remove(item) };
		return item;
	};
	
	ListNode.prototype.indexOf = function (item){
		return this._nodes.indexOf(item);
	};
	
	ListNode.prototype.index = function (i){
		return this._nodes[i];
	};
	
	ListNode.prototype.remove = function (item){
		var idx = this._nodes.indexOf(item);
		if (idx >= 0) { this._nodes.splice(idx,1) };
		return this;
	};
	
	ListNode.prototype.removeAt = function (idx){
		var item = this._nodes[idx];
		if (idx >= 0) { this._nodes.splice(idx,1) };
		return item;
	};
	
	
	ListNode.prototype.replace = function (original,replacement){
		var idx = this._nodes.indexOf(original);
		if (idx >= 0) {
			if (replacement instanceof Array) {
				// p "replaceing with array of items"
				this._nodes.splice.apply(this._nodes,[].concat([idx,1], [].slice.call(replacement)));
			} else {
				this._nodes[idx] = replacement;
			};
		};
		return this;
	};
	
	ListNode.prototype.first = function (){
		return this._nodes[0];
	};
	
	ListNode.prototype.last = function (){
		var i = this._nodes.length;
		while (i){
			i = i - 1;
			var v = this._nodes[i];
			if (!((v instanceof Meta))) { return v };
		};
		return null;
	};
	
	ListNode.prototype.map = function (fn){
		return this._nodes.map(fn);
	};
	
	ListNode.prototype.forEach = function (fn){
		return this._nodes.forEach(fn);
	};
	
	ListNode.prototype.remap = function (fn){
		this._nodes = this.map(fn);
		return this;
	};
	
	ListNode.prototype.count = function (){
		return this._nodes.length;
	};
	
	ListNode.prototype.realCount = function (){
		var k = 0;
		for (var i=0, ary=iter$(this._nodes), len=ary.length, node; i < len; i++) {
			node = ary[i];
			if (node && !(node instanceof Meta)) { k++ };
		};
		return k;
	};
	
	ListNode.prototype.visit = function (){
		for (var i=0, ary=iter$(this._nodes), len=ary.length, node; i < len; i++) {
			node = ary[i];
			node && node.traverse();
		};
		return this;
	};
	
	ListNode.prototype.isExpressable = function (){
		for (var i=0, ary=iter$(this.nodes()), len=ary.length, node; i < len; i++) {
			node = ary[i];
			if (node && !node.isExpressable()) { return false };
		};
		// return no unless nodes.every(|v| v.isExpressable )
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
		var nodes = pars.nodes !== undefined ? pars.nodes : this._nodes;
		var delim = ',';
		var express = delim != ';';
		var last = this.last();
		
		var i = 0;
		var l = nodes.length;
		var str = "";
		
		for (var j=0, ary=iter$(nodes), len=ary.length, arg; j < len; j++) {
			arg = ary[j];
			var part = typeof arg == 'string' ? (arg) : ((arg ? (arg.c({expression: express})) : ('')));
			str += part;
			if (part && (!express || arg != last) && !(arg instanceof Meta)) { str += delim };
		};
		
		return str;
	};
	
	ListNode.prototype.indented = function (a,b){
		if (a instanceof Indentation) {
			this._indentation = a;
			return this;
		};
		
		this._indentation || (this._indentation = a && b ? (new Indentation(a,b)) : (INDENT));
		return this;
	};
	
	
	function ArgList(){ ListNode.apply(this,arguments) };
	
	subclass$(ArgList,ListNode);
	exports.ArgList = ArgList; // export class 
	
	
	//	def indented a,b
	//		if a isa Indentation
	//			@indentation = a
	//			return self
	//
	//		@indentation ||= a and b ? Indentation.new(a,b) : INDENT
	//		self
	
	// def hasSplat
	// 	@nodes.some do |v| v isa Splat
	// def delimiter
	// 	","
	
	
	function AssignList(){ ArgList.apply(this,arguments) };
	
	subclass$(AssignList,ArgList);
	exports.AssignList = AssignList; // export class 
	AssignList.prototype.concat = function (other){
		if (this._nodes.length == 0 && (other instanceof AssignList)) {
			return other;
		} else {
			AssignList.__super__.concat.call(this,other);
		};
		// need to store indented content as well?
		// @nodes = nodes.concat(other isa Array ? other : other.nodes)
		return this;
	};
	
	
	function Block(list){
		this.setup();
		// @nodes = compact__(flatten__(list)) or []
		this._nodes = list || [];
		this._head = null;
		this._indentation = null;
	};
	
	subclass$(Block,ListNode);
	exports.Block = Block; // export class 
	
	Block.prototype.__head = {name: 'head'};
	Block.prototype.head = function(v){ return this._head; }
	Block.prototype.setHead = function(v){ this._head = v; return this; };
	
	Block.wrap = function (ary){
		if (!((ary instanceof Array))) {
			throw new SyntaxError("what");
		};
		return ary.length == 1 && (ary[0] instanceof Block) ? (ary[0]) : (new Block(ary));
	};
	
	Block.prototype.visit = function (){
		if (this._scope) { this._scope.visit() };
		
		for (var i=0, ary=iter$(this._nodes), len=ary.length, node; i < len; i++) {
			node = ary[i];
			node && node.traverse();
		};
		return this;
	};
	
	Block.prototype.block = function (){
		return this;
	};
	
	// def indented a,b
	// 	@indentation ||= a and b ? Indentation.new(a,b) : INDENT
	// 	self
	
	Block.prototype.loc = function (){
		// rather indents, no?
		var opt;
		if (opt = this.option('ends')) {
			// p "location is",opt
			var a = opt[0].loc();
			var b = opt[1].loc();
			
			if (!a) { this.p(("no loc for " + (opt[0]))) };
			if (!b) { this.p(("no loc for " + (opt[1]))) };
			
			return [a[0],b[1]];
		} else {
			return [0,0];
		};
	};
	
	// go through children and unwrap inner nodes
	Block.prototype.unwrap = function (){
		var ary = [];
		for (var i=0, items=iter$(this.nodes()), len=items.length, node; i < len; i++) {
			node = items[i];
			if (node instanceof Block) {
				// p "unwrapping inner block"
				ary.push.apply(ary,node.unwrap());
			} else {
				ary.push(node);
			};
		};
		return ary;
	};
	
	Block.prototype.push = function (item){
		this._nodes.push(item);
		return this;
	};
	
	Block.prototype.add = function (item){
		this._nodes.push(item);
		return this;
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
		// p "analyzing block!!!",o
		if(o === undefined) o = {};
		return this;
	};
	
	Block.prototype.cpart = function (node){
		var out = typeof node == 'string' ? (node) : ((node ? (node.c()) : ("")));
		if (out == null || out == undefined || out == "") { return "" };
		
		if (out instanceof Array) {
			var str = "";
			var l = out.length;
			var i = 0;
			while (i < l){
				str += this.cpart(out[i++]);
			};
			return str;
		};
		
		var hasSemiColon = SEMICOLON_TEST.test(out);
		if (!(hasSemiColon || (node instanceof Meta))) { out += ";" };
		return out;
	};
	
	Block.prototype.js = function (o,opts){
		var ast = this._nodes;
		var l = ast.length;
		// really?
		var express = this.isExpression() || o.isExpression() || (this.option('express') && this.isExpressable());
		if (ast.length == 0) { return null };
		
		if (express) {
			return Block.__super__.js.call(this,o,{nodes: ast});
		};
		
		var str = "";
		for (var i=0, ary=iter$(ast), len=ary.length; i < len; i++) {
			str += this.cpart(ary[i]);
		};
		
		// now add the head items as well
		if (this._head && this._head.length > 0) {
			var prefix = "";
			for (var i=0, ary=iter$(this._head), len=ary.length; i < len; i++) {
				var hv = this.cpart(ary[i]);
				if (hv) { prefix += hv + '\n' };
			};
			str = prefix + str;
		};
		return str;
	};
	
	
	// Should this create the function as well?
	Block.prototype.defers = function (original,replacement){
		var idx = this._nodes.indexOf(original);
		if (idx >= 0) { this._nodes[idx] = replacement };
		var rest = this._nodes.splice(idx + 1);
		return rest;
	};
	
	Block.prototype.expressions = function (){
		var expressions = [];
		for (var i=0, ary=iter$(this.nodes()), len=ary.length, node; i < len; i++) {
			node = ary[i];
			if (!((node instanceof Terminator))) { expressions.push(node) };
		};
		return expressions;
	};
	
	
	Block.prototype.consume = function (node){
		var before;
		if (node instanceof TagTree) { // special case?!?
			this._nodes = this._nodes.map(function(child) {
				return child.consume(node);
			});
			
			var real = this.expressions();
			// FIXME should not include terminators and comments when counting
			// should only wrap the content in array (returning all parts)
			// for if/else blocks -- not loops
			
			// we need to compare the real length
			if (!node._loop && real.length > 1) {
				// p "lengths",@nodes:length,expressions:length
				var nr = node.blocks().push(this);
				var arr = new Arr(new ArgList(this._nodes));
				arr.indented(this._indentation);
				this._indentation = null;
				
				if (node.reactive()) {
					this._nodes = [Util.callImba("static",[arr,new Num(nr)])];
				} else {
					this._nodes = [arr];
				};
			};
			
			
			
			return this;
		};
		
		// can also return super if it is expressable, but should we really?
		if (before = this.last()) {
			var after = before.consume(node);
			if (after != before) {
				// p "replace node in block {before} -> {after}"
				if (after instanceof Block) {
					// p "replaced with block -- should basically add it instead?"
					after = after.nodes();
				};
				
				this.replace(before,after);
			};
		};
		// really?
		return this;
	};
	
	
	Block.prototype.isExpressable = function (){
		if (!this._nodes.every(function(v) { return v.isExpressable(); })) { return false };
		return true;
	};
	
	Block.prototype.isExpression = function (){
		
		return this.option('express') || this._expression;
	};
	
	
	// this is almost like the old VarDeclarations but without the values
	function VarBlock(){ ListNode.apply(this,arguments) };
	
	subclass$(VarBlock,ListNode);
	exports.VarBlock = VarBlock; // export class 
	VarBlock.prototype.load = function (list){
		var first = list[0];
		
		if (first instanceof Assign) {
			this._type = first.left()._type;
		} else if (first instanceof VarReference) {
			this._type = first._type;
		};
		// p "here {list[0]} - {@type}"
		// @type = list[0] and list[0].type
		return list;
	};
	
	// TODO All these inner items should rather be straight up literals
	// or basic localvars - without any care whatsoever about adding var to the
	// beginning etc. 
	VarBlock.prototype.addExpression = function (expr){
		// p "VarBlock.addExpression {self} <- {expr}"
		
		if (expr instanceof Assign) {
			// make sure the left-side is a var-reference
			// this should be a different type of assign, no?
			if (expr.left() instanceof VarOrAccess) {
				expr.setLeft(new VarReference(expr.left().value(),this._type));
			};
			
			this.push(expr);
		} else if (expr instanceof Assign) {
			this.addExpression(expr.left()); // make sure this is a valid thing?
			// make this into a tuple instead
			// does not need to be a tuple?
			return new TupleAssign('=',new Tuple(this.nodes()),expr.right());
		} else if (expr instanceof VarOrAccess) {
			// this is really a VarReference
			this.push(new VarReference(expr.value(),this._type));
		} else if ((expr instanceof Splat) && (expr.node() instanceof VarOrAccess)) {
			// p "is a splat - only allowed in tuple-assignment"
			// what?
			expr.setValue(new VarReference(expr.node().value(),this._type));
			this.push(expr);
		} else {
			this.p(("VarBlock.addExpression " + this + " <- " + expr));
			throw "VarBlock does not allow non-variable expressions";
		};
		return this;
	};
	
	
	VarBlock.prototype.isExpressable = function (){
		// we would need to force-drop the variables, makes little sense
		// but, it could be, could just push the variables out?
		return false;
	};
	
	VarBlock.prototype.js = function (o){
		// p "VarBlock"
		// for n in @nodes
		// 	p "VarBlock child {n}"
		var code = compact__(flatten__(cary__(this.nodes())));
		code = code.filter(function(n) { return n != null && n != undefined && n != EMPTY; });
		var out = code.join(",");
		// we just need to trust that the variables have been autodeclared beforehand
		// if we are inside an expression
		if (!o.isExpression()) { out = "var " + out };
		return out;
	};
	
	
	VarBlock.prototype.consume = function (node){
		// It doesnt make much sense for a VarBlock to consume anything
		// it should probably return void for methods
		return this;
	};
	
	
	// Could inherit from valueNode
	function Parens(value,open,close){
		this.setup();
		this._open = open;
		this._close = close;
		this._value = this.load(value);
	};
	
	subclass$(Parens,ValueNode);
	exports.Parens = Parens; // export class 
	Parens.prototype.load = function (value){
		this._noparen = false;
		return (value instanceof Block) && value.count() == 1 ? (value.first()) : (value);
	};
	
	Parens.prototype.isString = function (){
		// checking if this is an interpolated string
		return this._open && String(this._open) == '("' || this.value().isString();
	};
	
	Parens.prototype.js = function (o){
		
		var par = this.up();
		var v = this._value;
		var str = null;
		
		if (v instanceof Func) { this._noparen = true };
		// p "compile parens {v} {v isa Block and v.count}"
		// p "Parens up {par} {o.isExpression}"
		if (par instanceof Block) {
			// is it worth it?
			if (!o.isExpression()) { this._noparen = true };
			str = v instanceof Array ? (cary__(v)) : (v.c({expression: o.isExpression()}));
		} else {
			str = v instanceof Array ? (cary__(v)) : (v.c({expression: true}));
		};
		
		// check if we really need parens here?
		return str;
	};
	
	Parens.prototype.set = function (obj){
		console.log(("Parens set " + (JSON.stringify(obj))));
		return Parens.__super__.set.call(this,obj);
	};
	
	
	Parens.prototype.shouldParenthesize = function (){
		// no need to parenthesize if this is a line in a block
		if (this._noparen) { return false }; //  or par isa ArgList
		return true;
	};
	
	
	Parens.prototype.prebreak = function (br){
		Parens.__super__.prebreak.call(this,br);
		console.log("PREBREAK");
		if (this._value) { this._value.prebreak(br) };
		return this;
	};
	
	
	Parens.prototype.isExpressable = function (){
		return this._value.isExpressable();
	};
	
	Parens.prototype.consume = function (node){
		return this._value.consume(node);
	};
	
	
	// Could inherit from valueNode
	// an explicit expression-block (with parens) is somewhat different
	// can be used to return after an expression
	function ExpressionBlock(){ ListNode.apply(this,arguments) };
	
	subclass$(ExpressionBlock,ListNode);
	exports.ExpressionBlock = ExpressionBlock; // export class 
	ExpressionBlock.prototype.c = function (){
		return this.map(function(item) { return item.c(); }).join(",");
	};
	
	ExpressionBlock.prototype.consume = function (node){
		return this.value().consume(node);
	};
	
	ExpressionBlock.prototype.addExpression = function (expr){
		// Need to take care of the splat here to.. hazzle
		if (expr.node() instanceof Assign) {
			// p "is assignment!"
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
	
	function Return(v){
		this._traversed = false;
		this._value = (v instanceof ArgList) && v.count() == 1 ? (v.last()) : (v);
		// @prebreak = v and v.@prebreak
		// console.log "return?!? {v}",@prebreak
		// if v isa ArgList and v.count == 1
		return this;
	};
	
	subclass$(Return,Statement);
	exports.Return = Return; // export class 
	
	Return.prototype.__value = {name: 'value'};
	Return.prototype.value = function(v){ return this._value; }
	Return.prototype.setValue = function(v){ this._value = v; return this; };
	
	Return.prototype.visit = function (){
		if (this._value && this._value.traverse) { return this._value.traverse() };
	};
	
	Return.prototype.js = function (o){
		var v = this._value;
		
		if (v instanceof ArgList) {
			return ("return [" + (v.c({expression: true})) + "]");
		} else if (v) {
			return ("return " + (v.c({expression: true})));
		} else {
			return "return";
		};
	};
	
	Return.prototype.c = function (){
		if (!(this.value()) || this.value().isExpressable()) { return Return.__super__.c.apply(this,arguments) };
		// p "return must cascade into value".red
		return this.value().consume(this).c();
	};
	
	Return.prototype.consume = function (node){
		return this;
	};
	
	function ImplicitReturn(){ Return.apply(this,arguments) };
	
	subclass$(ImplicitReturn,Return);
	exports.ImplicitReturn = ImplicitReturn; // export class 
	
	
	function GreedyReturn(){ ImplicitReturn.apply(this,arguments) };
	
	subclass$(GreedyReturn,ImplicitReturn);
	exports.GreedyReturn = GreedyReturn; // export class 
	
	
	// cannot live inside an expression(!)
	function Throw(){ Statement.apply(this,arguments) };
	
	subclass$(Throw,Statement);
	exports.Throw = Throw; // export class 
	Throw.prototype.js = function (o){
		return "throw " + (this.value().c());
	};
	
	Throw.prototype.consume = function (node){
		// ROADMAP should possibly consume to the value of throw and then throw?
		return this;
	};
	
	
	function LoopFlowStatement(lit,expr){
		this.setLiteral(lit);
		this.setExpression(expr); // && ArgList.new(expr) # really?
	};
	
	subclass$(LoopFlowStatement,Statement);
	exports.LoopFlowStatement = LoopFlowStatement; // export class 
	
	LoopFlowStatement.prototype.__literal = {name: 'literal'};
	LoopFlowStatement.prototype.literal = function(v){ return this._literal; }
	LoopFlowStatement.prototype.setLiteral = function(v){ this._literal = v; return this; };
	
	LoopFlowStatement.prototype.__expression = {name: 'expression'};
	LoopFlowStatement.prototype.expression = function(v){ return this._expression; }
	LoopFlowStatement.prototype.setExpression = function(v){ this._expression = v; return this; };
	
	LoopFlowStatement.prototype.visit = function (){
		if (this.expression()) { return this.expression().traverse() };
	};
	
	LoopFlowStatement.prototype.consume = function (node){
		// p "break/continue should consume?!"
		return this;
	};
	
	LoopFlowStatement.prototype.c = function (){
		if (!(this.expression())) { return LoopFlowStatement.__super__.c.apply(this,arguments) };
		// get up to the outer loop
		var _loop = STACK.up(Loop);
		// p "found loop?",_loop
		
		// need to fix the grammar for this. Right now it 
		// is like a fake call, but should only care about the first argument
		var expr = this.expression();
		
		if (_loop.catcher()) {
			expr = expr.consume(_loop.catcher());
			var copy = new this.constructor(this.literal());
			return new Block([expr,copy]).c();
		} else if (expr) {
			copy = new this.constructor(this.literal());
			return new Block([expr,copy]).c();
		} else {
			return LoopFlowStatement.__super__.c.apply(this,arguments);
		};
		// return "loopflow"
	};
	
	
	function BreakStatement(){ LoopFlowStatement.apply(this,arguments) };
	
	subclass$(BreakStatement,LoopFlowStatement);
	exports.BreakStatement = BreakStatement; // export class 
	BreakStatement.prototype.js = function (o){
		return "break";
	};
	
	function ContinueStatement(){ LoopFlowStatement.apply(this,arguments) };
	
	subclass$(ContinueStatement,LoopFlowStatement);
	exports.ContinueStatement = ContinueStatement; // export class 
	ContinueStatement.prototype.js = function (o){
		return "continue";
	};
	
	function DebuggerStatement(){ Statement.apply(this,arguments) };
	
	subclass$(DebuggerStatement,Statement);
	exports.DebuggerStatement = DebuggerStatement; // export class 
	
	
	
	// PARAMS
	
	function Param(name,defaults,typ){
		// could have introduced bugs by moving back to identifier here
		this._traversed = false;
		this._name = name; // .value # this is an identifier(!)
		this._defaults = defaults;
		this._typ = typ;
		this._variable = null;
	};
	
	subclass$(Param,Node);
	exports.Param = Param; // export class 
	
	Param.prototype.__name = {name: 'name'};
	Param.prototype.name = function(v){ return this._name; }
	Param.prototype.setName = function(v){ this._name = v; return this; };
	
	Param.prototype.__index = {name: 'index'};
	Param.prototype.index = function(v){ return this._index; }
	Param.prototype.setIndex = function(v){ this._index = v; return this; };
	
	Param.prototype.__defaults = {name: 'defaults'};
	Param.prototype.defaults = function(v){ return this._defaults; }
	Param.prototype.setDefaults = function(v){ this._defaults = v; return this; };
	
	Param.prototype.__splat = {name: 'splat'};
	Param.prototype.splat = function(v){ return this._splat; }
	Param.prototype.setSplat = function(v){ this._splat = v; return this; };
	
	Param.prototype.__variable = {name: 'variable'};
	Param.prototype.variable = function(v){ return this._variable; }
	Param.prototype.setVariable = function(v){ this._variable = v; return this; };
	
	// what about object-params?
	
	Param.prototype.varname = function (){
		return this._variable ? (this._variable.c()) : (this.name());
	};
	
	Param.prototype.js = function (o){
		if (this._variable) { return this._variable.c() };
		
		if (this.defaults()) {
			return "if(" + (this.name().c()) + " == null) " + (this.name().c()) + " = " + (this.defaults().c());
		};
		// see if this is the initial declarator?
	};
	
	Param.prototype.visit = function (){
		var variable_, v_;
		if (this._defaults) { this._defaults.traverse() };
		(variable_=this.variable()) || ((this.setVariable(v_=this.scope__().register(this.name(),this)),v_));
		
		if (this._name instanceof Identifier) {
			// change type here?
			if (this._name._value) { this._name._value._type = "PARAMVAR" };
			this._name.references(this._variable);
			// console.log "got here!! {@name:constructor}"
			// @name.@token.@variable = @variable if @name.@token
		};
		
		return this;
	};
	
	Param.prototype.assignment = function (){
		return OP('=',this.variable().accessor(),this.defaults());
	};
	
	Param.prototype.isExpressable = function (){
		return !(this.defaults()) || this.defaults().isExpressable();
		// p "visiting param!!!"
	};
	
	Param.prototype.dump = function (){
		return {loc: this.loc()};
	};
	
	Param.prototype.loc = function (){
		return this._name && this._name.region();
	};
	
	
	function SplatParam(){ Param.apply(this,arguments) };
	
	subclass$(SplatParam,Param);
	exports.SplatParam = SplatParam; // export class 
	SplatParam.prototype.loc = function (){
		// hacky.. cannot know for sure that this is right?
		var r = this.name().region();
		return [r[0] - 1,r[1]];
	};
	
	function BlockParam(){ Param.apply(this,arguments) };
	
	subclass$(BlockParam,Param);
	exports.BlockParam = BlockParam; // export class 
	BlockParam.prototype.c = function (){
		return "blockparam";
	};
	
	BlockParam.prototype.loc = function (){
		// hacky.. cannot know for sure that this is right?
		var r = this.name().region();
		return [r[0] - 1,r[1]];
	};
	
	
	function OptionalParam(){ Param.apply(this,arguments) };
	
	subclass$(OptionalParam,Param);
	exports.OptionalParam = OptionalParam; // export class 
	
	
	function NamedParam(){ Param.apply(this,arguments) };
	
	subclass$(NamedParam,Param);
	exports.NamedParam = NamedParam; // export class 
	
	
	function RequiredParam(){ Param.apply(this,arguments) };
	
	subclass$(RequiredParam,Param);
	exports.RequiredParam = RequiredParam; // export class 
	
	
	function NamedParams(){ ListNode.apply(this,arguments) };
	
	subclass$(NamedParams,ListNode);
	exports.NamedParams = NamedParams; // export class 
	
	NamedParams.prototype.__index = {name: 'index'};
	NamedParams.prototype.index = function(v){ return this._index; }
	NamedParams.prototype.setIndex = function(v){ this._index = v; return this; };
	
	NamedParams.prototype.__variable = {name: 'variable'};
	NamedParams.prototype.variable = function(v){ return this._variable; }
	NamedParams.prototype.setVariable = function(v){ this._variable = v; return this; };
	
	NamedParams.prototype.load = function (list){
		var load = function(k) { return new NamedParam(k.key(),k.value()); };
		return list instanceof Obj ? (list.value().map(load)) : (list);
	};
	
	NamedParams.prototype.visit = function (){
		var s = this.scope__();
		this._variable || (this._variable = s.temporary(this,{pool: 'keypars'}));
		this._variable.predeclared();
		
		// this is a listnode, which will automatically traverse
		// and visit all children
		NamedParams.__super__.visit.apply(this,arguments);
		// register the inner variables as well(!)
		return this;
	};
	
	
	NamedParams.prototype.varname = function (){
		return this.variable().c();
	};
	
	NamedParams.prototype.name = function (){
		return this.varname();
	};
	
	NamedParams.prototype.js = function (o){
		return "namedpar";
	};
	
	function IndexedParam(){ Param.apply(this,arguments) };
	
	subclass$(IndexedParam,Param);
	exports.IndexedParam = IndexedParam; // export class 
	
	IndexedParam.prototype.__parent = {name: 'parent'};
	IndexedParam.prototype.parent = function(v){ return this._parent; }
	IndexedParam.prototype.setParent = function(v){ this._parent = v; return this; };
	
	IndexedParam.prototype.__subindex = {name: 'subindex'};
	IndexedParam.prototype.subindex = function(v){ return this._subindex; }
	IndexedParam.prototype.setSubindex = function(v){ this._subindex = v; return this; };
	
	IndexedParam.prototype.visit = function (){
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
	
	
	function ArrayParams(){ ListNode.apply(this,arguments) };
	
	subclass$(ArrayParams,ListNode);
	exports.ArrayParams = ArrayParams; // export class 
	
	ArrayParams.prototype.__index = {name: 'index'};
	ArrayParams.prototype.index = function(v){ return this._index; }
	ArrayParams.prototype.setIndex = function(v){ this._index = v; return this; };
	
	ArrayParams.prototype.__variable = {name: 'variable'};
	ArrayParams.prototype.variable = function(v){ return this._variable; }
	ArrayParams.prototype.setVariable = function(v){ this._variable = v; return this; };
	
	ArrayParams.prototype.visit = function (){
		var s = this.scope__();
		this._variable || (this._variable = s.temporary(this,{pool: 'keypars'}));
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
		if (!((list instanceof Arr))) { return null };
		// p "loading arrayparams"
		// try the basic first
		if (!list.splat()) {
			return list.value().map(function(v,i) {
				// must make sure the params are supported here
				// should really not parse any array at all(!)
				var name = v;
				if (v instanceof VarOrAccess) {
					// p "varoraccess {v.value}"
					// FIX?
					name = v.value().value();
					// this is accepted
				};
				return self.parse(name,v,i);
			});
		};
	};
	
	ArrayParams.prototype.parse = function (name,child,i){
		var param = new IndexedParam(name,null);
		
		param.setParent(this);
		param.setSubindex(i);
		return param;
	};
	
	ArrayParams.prototype.head = function (ast){
		// "arrayparams"
		return this;
	};
	
	function ParamList(){ ListNode.apply(this,arguments) };
	
	subclass$(ParamList,ListNode);
	exports.ParamList = ParamList; // export class 
	
	ParamList.prototype.__splat = {name: 'splat'};
	ParamList.prototype.splat = function(v){ return this._splat; }
	ParamList.prototype.setSplat = function(v){ this._splat = v; return this; };
	
	ParamList.prototype.__block = {name: 'block'};
	ParamList.prototype.block = function(v){ return this._block; }
	ParamList.prototype.setBlock = function(v){ this._block = v; return this; };
	
	ParamList.prototype.at = function (index,force,name){
		if(force === undefined) force = false;
		if(name === undefined) name = null;
		if (force) {
			while (this.count() <= index){
				this.add(new Param(this.count() == index && name || ("_" + this.count())));
			};
			// need to visit at the same time, no?
		};
		return this.list()[index];
	};
	
	ParamList.prototype.visit = function (){
		this._splat = this.filter(function(par) { return par instanceof SplatParam; })[0];
		var blk = this.filter(function(par) { return par instanceof BlockParam; });
		
		if (blk.length > 1) {
			blk[1].warn("a method can only have one &block parameter");
		} else if (blk[0] && blk[0] != this.last()) {
			blk[0].warn("&block must be the last parameter of a method");
			// warn "&block must be the last parameter of a method", blk[0]
		};
		
		// add more warnings later(!)
		// should probably throw error as well to stop compilation
		
		// need to register the required-pars as variables
		return ParamList.__super__.visit.apply(this,arguments);
	};
	
	ParamList.prototype.js = function (o){
		if (this.count() == 0) { return EMPTY };
		if (o.parent() instanceof Block) { return this.head(o) };
		
		// items = map(|arg| arg.name.c ).compact
		// return null unless items[0]
		
		if (o.parent() instanceof Code) {
			// remove the splat, for sure.. need to handle the other items as well
			// this is messy with references to argvars etc etc. Fix
			var pars = this.nodes();
			// pars = filter(|arg| arg != @splat && !(arg isa BlockParam)) if @splat
			if (this._splat) { pars = this.filter(function(arg) { return (arg instanceof RequiredParam) || (arg instanceof OptionalParam); }) };
			return compact__(pars.map(function(arg) { return c__(arg.varname()); })).join(",");
		} else {
			throw "not implemented paramlist js";
			return "ta" + compact__(this.map(function(arg) { return arg.c(); })).join(",");
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
		
		this.nodes().forEach(function(par,i) {
			par.setIndex(idx);
			if (par instanceof NamedParams) {
				signature.push('named');
				named = par;
			} else if (par instanceof OptionalParam) {
				signature.push('opt');
				opt.push(par);
			} else if (par instanceof BlockParam) {
				signature.push('blk');
				blk = par;
			} else if (par instanceof SplatParam) {
				signature.push('splat');
				splat = par;
				idx -= 1; // this should really be removed from the list, no?
			} else if (par instanceof ArrayParams) {
				arys.push(par);
				signature.push('ary');
			} else {
				signature.push('reg');
				reg.push(par);
			};
			return idx++;
		});
		
		if (named) {
			var namedvar = named.variable();
		};
		
		// var opt = nodes.filter(|n| n isa OptionalParam)
		// var blk = nodes.filter(|n| n isa BlockParam)[0]
		// var splat = nodes.filter(|n| n isa SplatParam)[0]
		
		// simple situation where we simply switch
		// can probably optimize by not looking at arguments at all
		var ast = [];
		var isFunc = function(js) { return "typeof " + js + " == 'function'"; };
		
		// This is broken when dealing with iframes anc XSS scripting
		// but for now it is the best test for actual arguments
		// can also do constructor.name == 'Object'
		var isObj = function(js) { return "" + js + ".constructor === Object"; };
		var isntObj = function(js) { return "" + js + ".constructor !== Object"; };
		// should handle some common cases in a cleaner (less verbose) manner
		// does this work with default params after optional ones? Is that even worth anything?
		// this only works in one direction now, unlike TupleAssign
		
		// we dont really check the length etc now -- so it is buggy for lots of arguments
		
		// if we have optional params in the regular order etc we can go the easy route
		// slightly hacky now. Should refactor all of these to use the signature?
		if (!named && !splat && !blk && opt.length > 0 && signature.join(" ").match(/opt$/)) {
			for (var i=0, len_=opt.length, par; i < len_; i++) {
				par = opt[i];
				ast.push(("if(" + (par.name().c()) + " === undefined) " + (par.name().c()) + " = " + (par.defaults().c())));
			};
		} else if (named && !splat && !blk && opt.length == 0) { // and no block?!
			// different shorthands
			// if named
			ast.push(("if(!" + (namedvar.c()) + "||" + (isntObj(namedvar.c())) + ") " + (namedvar.c()) + " = \{\}"));
		} else if (blk && opt.length == 1 && !splat && !named) {
			var op = opt[0];
			var opn = op.name().c();
			var bn = blk.name().c();
			ast.push(("if(" + bn + "==undefined && " + (isFunc(opn)) + ") " + bn + " = " + opn + "," + opn + " = " + (op.defaults().c())));
		} else if (blk && named && opt.length == 0 && !splat) {
			bn = blk.name().c();
			ast.push(("if(" + bn + "==undefined && " + (isFunc(namedvar.c())) + ") " + bn + " = " + (namedvar.c()) + "," + (namedvar.c()) + " = \{\}"));
			ast.push(("else if(!" + (namedvar.c()) + "||" + (isntObj(namedvar.c())) + ") " + (namedvar.c()) + " = \{\}"));
		} else if (opt.length > 0 || splat) { // && blk  # && !splat
			
			var argvar = this.scope__().temporary(this,{pool: 'arguments'}).predeclared().c();
			var len = this.scope__().temporary(this,{pool: 'counter'}).predeclared().c();
			
			var last = ("" + argvar + "[" + len + "-1]");
			var pop = ("" + argvar + "[--" + len + "]");
			ast.push(("var " + argvar + " = arguments, " + len + " = " + argvar + ".length"));
			
			if (blk) {
				bn = blk.name().c();
				if (splat) {
					ast.push(("var " + bn + " = " + (isFunc(last)) + " ? " + pop + " : null"));
				} else if (reg.length > 0) {
					// ast.push "// several regs really?"
					ast.push(("var " + bn + " = " + len + " > " + (reg.length) + " && " + (isFunc(last)) + " ? " + pop + " : null"));
				} else {
					ast.push(("var " + bn + " = " + (isFunc(last)) + " ? " + pop + " : null"));
				};
			};
			
			// if we have named params - look for them before splat
			// should probably loop through pars in the same order they were added
			// should it be prioritized above optional objects??
			if (named) {
				// should not include it when there is a splat?
				ast.push(("var " + (namedvar.c()) + " = " + last + "&&" + (isObj(last)) + " ? " + pop + " : \{\}"));
			};
			
			for (var i1=0, len_=opt.length, par1; i1 < len_; i1++) {
				par1 = opt[i1];
				ast.push(("if(" + len + " < " + (par1.index() + 1) + ") " + (par1.name().c()) + " = " + (par1.defaults().c())));
			};
			
			// add the splat
			if (splat) {
				var sn = splat.name().c();
				var si = splat.index();
				
				if (si == 0) {
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
		} else if (opt.length > 0) {
			for (var i2=0, len_=opt.length, par2; i2 < len_; i2++) {
				par2 = opt[i2];
				ast.push(("if(" + (par2.name().c()) + " === undefined) " + (par2.name().c()) + " = " + (par2.defaults().c())));
			};
		};
		
		// now set stuff if named params(!)
		
		if (named) {
			for (var i3=0, ary=iter$(named.nodes()), len_=ary.length, k; i3 < len_; i3++) {
				// console.log "named var {k.c}"
				k = ary[i3];
				op = OP('.',namedvar,k.c()).c();
				ast.push(("var " + (k.c()) + " = " + op + " !== undefined ? " + op + " : " + (k.defaults().c())));
			};
		};
		
		if (arys.length) {
			for (var i4=0, len_=arys.length; i4 < len_; i4++) {
				// create tuples
				this.p("adding arrayparams");
				arys[i4].head(o,ast,this);
				// ast.push v.c
			};
		};
		
		
		
		// if opt:length == 0
		return ast.length > 0 ? ((ast.join(";\n") + ";")) : (EMPTY);
	};
	
	
	// Legacy. Should move away from this?
	function VariableDeclaration(){ ListNode.apply(this,arguments) };
	
	subclass$(VariableDeclaration,ListNode);
	exports.VariableDeclaration = VariableDeclaration; // export class 
	
	VariableDeclaration.prototype.__kind = {name: 'kind'};
	VariableDeclaration.prototype.kind = function(v){ return this._kind; }
	VariableDeclaration.prototype.setKind = function(v){ this._kind = v; return this; };
	
	// we want to register these variables in
	VariableDeclaration.prototype.add = function (name,init,pos){
		if(pos === undefined) pos = -1;
		var vardec = new VariableDeclarator(name,init);
		if (name instanceof Variable) { (vardec.setVariable(name),name) };
		pos == 0 ? (this.unshift(vardec)) : (this.push(vardec));
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
		// temporary solution!!!
		return list.map(function(par) { return new VariableDeclarator(par.name(),par.defaults(),par.splat()); });
	};
	
	VariableDeclaration.prototype.isExpressable = function (){
		return this.nodes().every(function(item) { return item.isExpressable(); });
	};
	
	VariableDeclaration.prototype.js = function (o){
		if (this.count() == 0) { return EMPTY };
		
		if (this.count() == 1 && !(this.isExpressable())) {
			// p "SHOULD ALTER VARDEC!!!".cyan
			this.first().variable().autodeclare();
			var node = this.first().assignment();
			return node.c();
		};
		
		// FIX PERFORMANCE
		var out = compact__(cary__(this.nodes())).join(", ");
		return out ? (("var " + out)) : ("");
		// "var " + compact__(cary__(nodes)).join(", ") + ""
	};
	
	function VariableDeclarator(){ Param.apply(this,arguments) };
	
	subclass$(VariableDeclarator,Param);
	exports.VariableDeclarator = VariableDeclarator; // export class 
	VariableDeclarator.prototype.visit = function (){
		// even if we should traverse the defaults as if this variable does not exist
		// we need to preregister it and then activate it later
		var variable_, v_;
		(variable_=this.variable()) || ((this.setVariable(v_=this.scope__().register(this.name(),null)),v_));
		if (this.defaults()) { this.defaults().traverse() };
		// WARN what if it is already declared?
		this.variable().setDeclarator(this);
		this.variable().addReference(this.name());
		return this;
	};
	
	// needs to be linked up to the actual scoped variables, no?
	VariableDeclarator.prototype.js = function (o){
		if (this.variable()._proxy) { return null };
		
		var defs = this.defaults();
		// FIXME need to deal with var-defines within other statements etc
		// FIXME need better syntax for this
		if (defs != null && defs != undefined) {
			// console.log "defaults is {defaults}"
			if (defs instanceof Node) { defs = defs.c({expression: true}) };
			
			return "" + (this.variable().c()) + "=" + defs;
		} else {
			return "" + (this.variable().c());
		};
	};
	
	VariableDeclarator.prototype.accessor = function (){
		return this;
	};
	
	
	// TODO clean up and refactor all the different representations of vars
	// VarName, VarReference, LocalVarAccess?
	function VarName(a,b){
		VarName.__super__.constructor.apply(this,arguments);
		this._splat = b;
	};
	
	subclass$(VarName,ValueNode);
	exports.VarName = VarName; // export class 
	
	VarName.prototype.__variable = {name: 'variable'};
	VarName.prototype.variable = function(v){ return this._variable; }
	VarName.prototype.setVariable = function(v){ this._variable = v; return this; };
	
	VarName.prototype.__splat = {name: 'splat'};
	VarName.prototype.splat = function(v){ return this._splat; }
	VarName.prototype.setSplat = function(v){ this._splat = v; return this; };
	
	VarName.prototype.visit = function (){
		// p "visiting varname(!)", value.c
		// should we not lookup instead?
		var variable_, v_;
		(variable_=this.variable()) || ((this.setVariable(v_=this.scope__().register(this.value().c(),null)),v_));
		this.variable().setDeclarator(this);
		this.variable().addReference(this.value());
		return this;
	};
	
	VarName.prototype.js = function (o){
		return this.variable().c();
	};
	
	VarName.prototype.c = function (){
		return this.variable().c();
	};
	
	
	function VarList(t,l,r){
		this._traversed = false;
		this._type = this.type();
		this._left = l;
		this._right = r;
	};
	
	subclass$(VarList,Node);
	exports.VarList = VarList; // export class 
	
	VarList.prototype.__type = {name: 'type'};
	VarList.prototype.type = function(v){ return this._type; }
	VarList.prototype.setType = function(v){ this._type = v; return this; }; // let / var / const
	
	VarList.prototype.__left = {name: 'left'};
	VarList.prototype.left = function(v){ return this._left; }
	VarList.prototype.setLeft = function(v){ this._left = v; return this; };
	
	VarList.prototype.__right = {name: 'right'};
	VarList.prototype.right = function(v){ return this._right; }
	VarList.prototype.setRight = function(v){ this._right = v; return this; };
	
	// format :type, :left, :right
	
	// should throw error if there are more values on right than left
	
	VarList.prototype.visit = function (){
		
		// we need to carefully traverse children in the right order
		// since we should be able to reference
		var r;
		for (var i=0, ary=iter$(this.left()), len=ary.length; i < len; i++) {
			ary[i].traverse(); // this should really be a var-declaration
			if (r = this.right()[i]) { r.traverse() };
		};
		return this;
	};
	
	VarList.prototype.js = function (o){
		// for the regular items 
		var pairs = [];
		var ll = this.left().length;
		var rl = this.right().length;
		var v = null;
		
		// splatting here we come
		if (ll > 1 && rl == 1) {
			this.p("multiassign!");
			var r = this.right()[0];
			r.cache();
			for (var i=0, ary=iter$(this.left()), len=ary.length, l; i < len; i++) {
				l = ary[i];
				if (l.splat()) {
					throw "not supported?";
					this.p("splat"); // FIX reimplement slice?
					if (i == ll - 1) {
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
			for (var i1=0, ary=iter$(this.left()), len=ary.length, l1; i1 < len; i1++) {
				l1 = ary[i1];
				r = this.right()[i1];
				pairs.push(r ? (OP('=',l1.variable().accessor(),r)) : (l1));
			};
		};
		
		return ("var " + (pairs.c()));
	};
	
	
	// CODE
	
	function Code(){ Node.apply(this,arguments) };
	
	subclass$(Code,Node);
	exports.Code = Code; // export class 
	
	Code.prototype.__head = {name: 'head'};
	Code.prototype.head = function(v){ return this._head; }
	Code.prototype.setHead = function(v){ this._head = v; return this; };
	
	Code.prototype.__body = {name: 'body'};
	Code.prototype.body = function(v){ return this._body; }
	Code.prototype.setBody = function(v){ this._body = v; return this; };
	
	Code.prototype.__scope = {name: 'scope'};
	Code.prototype.scope = function(v){ return this._scope; }
	Code.prototype.setScope = function(v){ this._scope = v; return this; };
	
	Code.prototype.__params = {name: 'params'};
	Code.prototype.params = function(v){ return this._params; }
	Code.prototype.setParams = function(v){ this._params = v; return this; };
	
	Code.prototype.scopetype = function (){
		return Scope;
	};
	
	Code.prototype.visit = function (){
		if (this._scope) { this._scope.visit() };
		// @scope.parent = STACK.scope(1) if @scope
		return this;
	};
	
	// Rename to Program?
	function Root(body,opts){
		// p "create root!"
		this._traversed = false;
		this._body = blk__(body);
		this._scope = new FileScope(this,null);
		this._options = {};
	};
	
	subclass$(Root,Code);
	exports.Root = Root; // export class 
	Root.prototype.visit = function (){
		this.scope().visit();
		return this.body().traverse();
	};
	
	Root.prototype.compile = function (o){
		STACK.reset(); // -- nested compilation does not work now
		STACK._options = o;
		this._options = o || {};
		OPTS = o;
		this.traverse();
		var out = this.c();
		var result = {js: out,warnings: this.scope().warnings(),options: o,toString: function() { return this.js; }};
		return result;
	};
	
	Root.prototype.js = function (o){
		var out;
		if (this._options.bare) {
			out = this.scope().c();
		} else {
			out = this.scope().c({indent: true});
			out = out.replace(/^\n?/,'\n');
			out = out.replace(/\n?$/,'\n\n');
			out = '(function(){' + out + '})()';
		};
		
		// find and replace shebangs
		var shebangs = [];
		out = out.replace(/^[ \t]*\/\/(\!.+)$/mg,function(m,shebang) {
			// p "found shebang {shebang}"
			shebang = shebang.replace(/\bimba\b/g,'node');
			shebangs.push(("#" + shebang + "\n"));
			return "";
		});
		
		out = shebangs.join('') + out;
		
		return out;
	};
	
	
	Root.prototype.analyze = function (pars){
		if(!pars||pars.constructor !== Object) pars = {};
		var loglevel = pars.loglevel !== undefined ? pars.loglevel : 0;
		STACK.setLoglevel(loglevel);
		STACK._analyzing = true;
		this.traverse();
		STACK._analyzing = false;
		return this.scope().dump();
	};
	
	Root.prototype.inspect = function (){
		return true;
	};
	
	function ClassDeclaration(name,superclass,body){
		// what about the namespace?
		this._traversed = false;
		this._name = name;
		this._superclass = superclass;
		this._scope = new ClassScope(this);
		this._body = blk__(body);
		this;
	};
	
	subclass$(ClassDeclaration,Code);
	exports.ClassDeclaration = ClassDeclaration; // export class 
	
	ClassDeclaration.prototype.__name = {name: 'name'};
	ClassDeclaration.prototype.name = function(v){ return this._name; }
	ClassDeclaration.prototype.setName = function(v){ this._name = v; return this; };
	
	ClassDeclaration.prototype.__superclass = {name: 'superclass'};
	ClassDeclaration.prototype.superclass = function(v){ return this._superclass; }
	ClassDeclaration.prototype.setSuperclass = function(v){ this._superclass = v; return this; };
	
	ClassDeclaration.prototype.__initor = {name: 'initor'};
	ClassDeclaration.prototype.initor = function(v){ return this._initor; }
	ClassDeclaration.prototype.setInitor = function(v){ this._initor = v; return this; };
	
	ClassDeclaration.prototype.visit = function (){
		// replace with some advanced lookup?
		this.scope().visit();
		this.body().traverse();
		return this;
	};
	
	ClassDeclaration.prototype.js = function (o){
		this.scope().virtualize(); // is this always needed?
		this.scope().context().setValue(this.name());
		
		// should probably also warn about stuff etc
		if (this.option('extension')) {
			return this.body().c();
		};
		
		var head = [];
		var o = this._options || {};
		var cname = this.name() instanceof Access ? (this.name().right()) : (this.name());
		var namespaced = this.name() != cname;
		var initor = null;
		var sup = this.superclass();
		
		var bodyindex = -1;
		var spaces = this.body().filter(function(item) { return item instanceof Terminator; });
		
		this.body().map(function(c,i) {
			if ((c instanceof MethodDeclaration) && c.type() == 'constructor') {
				return bodyindex = i;
			};
		});
		
		if (bodyindex >= 0) {
			initor = this.body().removeAt(bodyindex);
		};
		
		// var initor = body.pluck do |c| c isa MethodDeclaration && c.type == :constructor
		// compile the cname
		if (typeof cname != 'string') { cname = cname.c() };
		
		var cpath = typeof this.name() == 'string' ? (this.name()) : (this.name().c());
		
		if (!initor) {
			if (sup) {
				initor = ("function " + cname + "()\{ " + (sup.c()) + ".apply(this,arguments) \};\n\n");
			} else {
				initor = ("function " + cname + "()") + '{ };\n\n';
			};
		} else {
			initor.setName(cname);
			initor = initor.c() + ';';
		};
		
		// if we are defining a class inside a namespace etc -- how should we set up the class?
		
		if (namespaced) {
			// should use Nodes to build this instead
			initor = ("" + cpath + " = " + initor); // OP('=',name,initor)
		};
		
		head.push(initor); // // @class {cname}\n
		
		if (bodyindex >= 0) {
			// add the space after initor?
			if (this.body().index(bodyindex) instanceof Terminator) {
				head.push(this.body().removeAt(bodyindex));
			};
		} else {
			// head.push(Terminator.new('\n\n'))
			true;
		};
		
		
		
		if (sup) {
			// console.log "deal with superclass!"
			// head.push("// extending the superclass\nimba$class({name.c},{sup.c});\n\n")
			head.push(new Util.Subclass([this.name(),sup]));
		};
		
		// only if it is not namespaced
		if (o.global && !namespaced) { // option(:global)
			head.push(("global." + cname + " = " + cpath + "; // global class \n"))
		};
		
		if (o.export && !namespaced) {
			head.push(("exports." + cname + " = " + cpath + "; // export class \n"))
		};
		
		// FIXME
		// if namespaced and (o:local or o:export)
		// 	console.log "namespaced classes are implicitly local/global depending on the namespace"
		
		
		for (var i=0, ary=iter$(head.reverse()), len=ary.length; i < len; i++) {
			this.body().unshift(ary[i]);
		};
		this.body()._indentation = null;
		var end = this.body().index(this.body().count() - 1);
		if ((end instanceof Terminator) && end.c().length == 1) { this.body().pop() };
		var out = this.body().c();
		
		return out;
	};
	
	
	function TagDeclaration(name,superclass,body){
		// what about the namespace?
		// @name = TagTypeRef.new(name)
		this._traversed = false;
		this._name = name;
		this._superclass = superclass;
		this._scope = new TagScope(this);
		this._body = blk__(body || []);
	};
	
	subclass$(TagDeclaration,Code);
	exports.TagDeclaration = TagDeclaration; // export class 
	
	TagDeclaration.prototype.__name = {name: 'name'};
	TagDeclaration.prototype.name = function(v){ return this._name; }
	TagDeclaration.prototype.setName = function(v){ this._name = v; return this; };
	
	TagDeclaration.prototype.__superclass = {name: 'superclass'};
	TagDeclaration.prototype.superclass = function(v){ return this._superclass; }
	TagDeclaration.prototype.setSuperclass = function(v){ this._superclass = v; return this; };
	
	TagDeclaration.prototype.__initor = {name: 'initor'};
	TagDeclaration.prototype.initor = function(v){ return this._initor; }
	TagDeclaration.prototype.setInitor = function(v){ this._initor = v; return this; };
	
	TagDeclaration.prototype.visit = function (){
		// replace with some advanced lookup?
		this.scope().visit();
		return this.body().traverse();
	};
	
	TagDeclaration.prototype.id = function (){
		return this.name().id();
	};
	
	TagDeclaration.prototype.js = function (o){
		this.scope().context().setValue(this._ctx = this.scope().declare('tag',null,{system: true}));
		
		var cbody = this.body().c();
		var outbody = this.body().count() ? ((", function(" + (this._ctx.c()) + ")\{" + cbody + "\}")) : ('');
		
		if (this.option('extension')) {
			return ("Imba.extendTag('" + (this.name().id() || this.name().func()) + "'" + outbody + ")");
		};
		
		var sup = this.superclass() && "," + helpers.singlequote(this.superclass().func()) || "";
		
		var out = this.name().id() ? (
			("Imba.defineSingletonTag('" + (this.name().id()) + "'" + sup + outbody + ")")
		) : (
			("Imba.defineTag('" + (this.name().func()) + "'" + sup + outbody + ")")
		);
		
		return out;
	};
	
	function Func(params,body,name,target,o){
		// p "INIT Function!!",params,body,name
		var typ = this.scopetype();
		this._traversed = false;
		this._body = blk__(body);
		this._scope || (this._scope = (o && o.scope) || new typ(this));
		this._scope.setParams(this._params = new ParamList(params));
		this._name = name || '';
		this._target = target;
		this._options = o;
		this._type = 'function';
		this._variable = null;
		this;
	};
	
	subclass$(Func,Code);
	exports.Func = Func; // export class 
	
	Func.prototype.__name = {name: 'name'};
	Func.prototype.name = function(v){ return this._name; }
	Func.prototype.setName = function(v){ this._name = v; return this; };
	
	Func.prototype.__params = {name: 'params'};
	Func.prototype.params = function(v){ return this._params; }
	Func.prototype.setParams = function(v){ this._params = v; return this; };
	
	Func.prototype.__target = {name: 'target'};
	Func.prototype.target = function(v){ return this._target; }
	Func.prototype.setTarget = function(v){ this._target = v; return this; };
	
	Func.prototype.__options = {name: 'options'};
	Func.prototype.options = function(v){ return this._options; }
	Func.prototype.setOptions = function(v){ this._options = v; return this; };
	
	Func.prototype.__type = {name: 'type'};
	Func.prototype.type = function(v){ return this._type; }
	Func.prototype.setType = function(v){ this._type = v; return this; };
	
	Func.prototype.__context = {name: 'context'};
	Func.prototype.context = function(v){ return this._context; }
	Func.prototype.setContext = function(v){ this._context = v; return this; };
	
	Func.prototype.scopetype = function (){
		return FunctionScope;
	};
	
	Func.prototype.visit = function (){
		this.scope().visit();
		this._context = this.scope().parent();
		this._params.traverse();
		return this._body.traverse(); // so soon?
	};
	
	
	Func.prototype.js = function (o){
		if (!this.option('noreturn')) { this.body().consume(new ImplicitReturn()) };
		var ind = this.body()._indentation;
		// var s = ind and ind.@open
		// p "indent function? {body.@indentation} {s} {s:generated} {body.count}"
		if (ind && ind.isGenerated()) { this.body()._indentation = null };
		var code = this.scope().c({indent: (!ind || !ind.isGenerated()),braces: true});
		
		// args = params.map do |par| par.name
		// head = params.map do |par| par.c
		// code = [head,body.c(expression: no)].flatten__.compact.join("\n").wrap
		// FIXME creating the function-name this way is prone to create naming-collisions
		// will need to wrap the value in a FunctionName which takes care of looking up scope
		// and possibly dealing with it
		var name = typeof this._name == 'string' ? (this._name) : (this._name.c());
		name = name ? (' ' + name.replace(/\./g,'_')) : ('');
		var out = ("function" + name + "(" + (this.params().c()) + ") ") + code;
		if (this.option('eval')) { out = ("(" + out + ")()") };
		return out;
	};
	
	Func.prototype.shouldParenthesize = function (par){
		if(par === undefined) par = this.up();
		return (par instanceof Call) && par.callee() == this;
		// if up as a call? Only if we are 
	};
	
	function Lambda(){ Func.apply(this,arguments) };
	
	subclass$(Lambda,Func);
	exports.Lambda = Lambda; // export class 
	Lambda.prototype.scopetype = function (){
		return LambdaScope;
	};
	
	function TagFragmentFunc(){ Func.apply(this,arguments) };
	
	subclass$(TagFragmentFunc,Func);
	exports.TagFragmentFunc = TagFragmentFunc; // export class 
	
	
	// MethodDeclaration
	// Create a shared body?
	
	function MethodDeclaration(){ Func.apply(this,arguments) };
	
	subclass$(MethodDeclaration,Func);
	exports.MethodDeclaration = MethodDeclaration; // export class 
	
	MethodDeclaration.prototype.__variable = {name: 'variable'};
	MethodDeclaration.prototype.variable = function(v){ return this._variable; }
	MethodDeclaration.prototype.setVariable = function(v){ this._variable = v; return this; };
	
	MethodDeclaration.prototype.scopetype = function (){
		return MethodScope;
	};
	
	MethodDeclaration.prototype.visit = function (){
		// prebreak # make sure this has a break?
		this.scope().visit();
		
		if (String(this.name()) == 'initialize') {
			this.setType('constructor');
		};
		
		if (this.option('greedy')) {
			this.warn("deprecated");
			// set(greedy: true)
			// p "BODY EXPRESSIONS!! This is a fragment"
			var tree = new TagTree();
			this._body = this.body().consume(tree);
			// body.nodes = [Arr.new(body.nodes)]
		};
		
		
		this._context = this.scope().parent().closure();
		this._params.traverse();
		
		if (this.target() instanceof Self) {
			this._target = this._context.context();
			this.set({static: true});
		};
		
		if (this.context() instanceof ClassScope) {
			this._target || (this._target = this.context().context());
			// register as class-method?
			// should register for this
			// console.log "context is classscope {@name}"
		};
		
		if (!this._target) {
			// should not be registered on the outermost closure?
			this._variable = this.context().register(this.name(),this,{type: 'meth'});
		};
		
		this._body.traverse(); // so soon?
		
		return this;
	};
	
	MethodDeclaration.prototype.supername = function (){
		return this.type() == 'constructor' ? (this.type()) : (this.name());
	};
	
	
	// FIXME export global etc are NOT valid for methods inside any other scope than
	// the outermost scope (root)
	
	MethodDeclaration.prototype.js = function (o){
		// FIXME Do this in the grammar - remnants of old implementation
		if (!(this.type() == 'constructor' || this.option('noreturn'))) {
			if (this.option('greedy')) {
				// haaack
				this.body().consume(new GreedyReturn());
			} else {
				this.body().consume(new ImplicitReturn());
			};
		};
		var code = this.scope().c({indent: true,braces: true});
		
		// same for Func -- should generalize
		var name = typeof this._name == 'string' ? (this._name) : (this._name.c());
		name = name.replace(/\./g,'_');
		
		// var name = self.name.c.replace(/\./g,'_') # WHAT?
		var foot = [];
		
		var left = "";
		var func = ("(" + (this.params().c()) + ")") + code; // .wrap
		var target = this.target();
		var decl = !this.option('global') && !this.option('export');
		
		if (target instanceof ScopeContext) {
			// the target is a scope context
			target = null;
		};
		
		var ctx = this.context();
		var out = "";
		// if ctx 
		
		
		
		var fname = sym__(this.name());
		// console.log "symbolize {self.name} -- {fname}"
		var fdecl = fname; // decl ? fname : ''
		
		if ((ctx instanceof ClassScope) && !target) {
			if (this.type() == 'constructor') {
				out = ("function " + fname + func);
			} else if (this.option('static')) {
				out = ("" + (ctx.context().c()) + "." + fname + " = function " + func);
			} else {
				out = ("" + (ctx.context().c()) + ".prototype." + fname + " = function " + func);
			};
		} else if ((ctx instanceof FileScope) && !target) {
			// register method as a root-function, but with auto-call? hmm
			// should probably set using variable directly instead, no?
			out = ("function " + fdecl + func);
		} else if (target && this.option('static')) {
			out = ("" + (target.c()) + "." + fname + " = function " + func);
		} else if (target) {
			out = ("" + (target.c()) + ".prototype." + fname + " = function " + func);
		} else {
			out = ("function " + fdecl + func);
		};
		
		if (this.option('global')) {
			out = ("" + fname + " = " + out);
		};
		
		if (this.option('export')) {
			out = ("" + out + "; exports." + fname + " = " + fname + ";");
		};
		
		return out;
	};
	
	
	function TagFragmentDeclaration(){ MethodDeclaration.apply(this,arguments) };
	
	subclass$(TagFragmentDeclaration,MethodDeclaration);
	exports.TagFragmentDeclaration = TagFragmentDeclaration; // export class 
	
	
	
	var propTemplate = '${headers}\n${path}.__${getter} = ${options};\n${path}.${getter} = function(v){ return ${get}; }\n${path}.${setter} = function(v){ ${set}; return this; }\n${init}';
	
	var propWatchTemplate = '${headers}\n${path}.__${getter} = ${options};\n${path}.${getter} = function(v){ return ${get}; }\n${path}.${setter} = function(v){\n	var a = this.${getter}();\n	if(v != a) { v = ${set}; }\n	if(v != a) { ${ondirty} }\n	return this;\n}\n${init}';
	
	function PropertyDeclaration(name,options,token){
		this._token = token;
		this._traversed = false;
		this._name = name;
		this._options = options || new Obj(new AssignList());
	};
	
	subclass$(PropertyDeclaration,Node);
	exports.PropertyDeclaration = PropertyDeclaration; // export class 
	
	PropertyDeclaration.prototype.__name = {name: 'name'};
	PropertyDeclaration.prototype.name = function(v){ return this._name; }
	PropertyDeclaration.prototype.setName = function(v){ this._name = v; return this; };
	
	PropertyDeclaration.prototype.__options = {name: 'options'};
	PropertyDeclaration.prototype.options = function(v){ return this._options; }
	PropertyDeclaration.prototype.setOptions = function(v){ this._options = v; return this; };
	
	PropertyDeclaration.prototype.visit = function (){
		this._options.traverse();
		return this;
	};
	
	// This will soon support bindings / listeners etc, much more
	// advanced generated code based on options passed in.
	PropertyDeclaration.prototype.c = function (){
		var o = this.options();
		var ast = "";
		var key = this.name().c();
		var gets = ("@" + key);
		var sets = ("@" + key + " = v");
		var scope = STACK.scope();
		
		var deflt = this.options().key('default');
		var init = deflt ? (("self:prototype.@" + key + " = " + (deflt.value().c()))) : ("");
		
		// var pars =
		// 	watch: o.key(:watch)
		// 	delegate: o.key(:delegate)
		
		var pars = o.hash();
		
		var isAttr = (this._token && String(this._token) == 'attr') || o.key('attr');
		
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
		
		o.add('name',new Symbol(key));
		
		if (pars.watch) {
			// p "watch is a property {pars:watch}"
			if (!((pars.watch instanceof Bool) && !pars.watch.truthy())) { tpl = propWatchTemplate };
			var wfn = ("" + key + "DidSet");
			
			if (pars.watch instanceof Symbol) {
				wfn = pars.watch;
			} else if (pars.watch instanceof Bool) {
				o.key('watch').setValue(new Symbol(("" + key + "DidSet")));
			};
			
			// should check for the function first, no?
			// HACK
			// o.key(:watch).value = Symbol
			var fn = OP('.',new This(),wfn);
			js.ondirty = OP('&&',fn,CALL(fn,['v','a',("this.__" + key)])).c(); // CALLSELF(wfn,[]).c
			// js:ondirty = "if(this.{wfn}) this.{wfn}(v,a,this.__{key});"
		};
		
		if (pars.observe) {
			if (pars.observe instanceof Bool) {
				o.key('observe').setValue(new Symbol(("" + key + "DidEmit")));
			};
			
			tpl = propWatchTemplate;
			js.ondirty = ("Imba.observeProperty(this,'" + key + "'," + (o.key('observe').value().c()) + ",v,a);") + (js.ondirty || '');
			// OP('&&',fn,CALL(fn,['v','a',"this.__{key}"])).c
		};
		
		if ((this._token && String(this._token) == 'attr') || o.key('dom') || o.key('attr')) {
			// need to make sure o has a key for attr then - so that the delegate can know?
			js.set = ("this.setAttribute('" + key + "',v)");
			js.get = ("this.getAttribute('" + key + "')");
		} else if (o.key('delegate')) {
			// if we have a delegate
			js.set = ("this.__" + key + ".delegate.set(this,'" + key + "',v,this.__" + key + ")");
			js.get = ("this.__" + key + ".delegate.get(this,'" + key + "',this.__" + key + ")");
		};
		
		
		
		if (deflt) {
			// add better default-support here - go through class-method setAttribute instead
			if (o.key('dom')) {
				js.init = ("" + (js.scope) + ".dom().setAttribute('" + key + "'," + (deflt.value().c()) + ");");
			} else {
				js.init = ("" + (js.scope) + ".prototype._" + key + " = " + (deflt.value().c()) + ";");
			};
		};
		
		if (o.key('chainable')) {
			js.get = ("v !== undefined ? (this." + (js.setter) + "(v),this) : " + (js.get));
		};
		
		js.options = o.c();
		
		var reg = /\$\{(\w+)\}/gm;
		// var tpl = o.key(:watch) ? propWatchTemplate : propTemplate
		var out = tpl.replace(reg,function(m,a) { return js[a]; });
		// run another time for nesting. hacky
		out = out.replace(reg,function(m,a) { return js[a]; });
		out = out.replace(/\n\s*$/,'');
		
		// if o.key(:v)
		return out;
	};
	
	
	
	// Literals should probably not inherit from the same parent
	// as arrays, tuples, objects would be better off inheriting
	// from listnode.
	
	function Literal(v){
		this._traversed = false;
		this._expression = true;
		this._cache = null;
		this._raw = null;
		this._value = v;
	};
	
	subclass$(Literal,ValueNode);
	exports.Literal = Literal; // export class 
	Literal.prototype.toString = function (){
		return "" + this.value();
	};
	
	Literal.prototype.hasSideEffects = function (){
		return false;
	};
	
	
	function Bool(v){
		this._value = v;
		this._raw = String(v) == "true" ? (true) : (false);
	};
	
	subclass$(Bool,Literal);
	exports.Bool = Bool; // export class 
	Bool.prototype.cache = function (){
		return this;
	};
	
	Bool.prototype.isPrimitive = function (){
		return true;
	};
	
	Bool.prototype.truthy = function (){
		// p "bool is truthy? {value}"
		return String(this.value()) == "true";
		// yes
	};
	
	Bool.prototype.js = function (o){
		return String(this._value);
	};
	
	Bool.prototype.c = function (){
		STACK._counter += 1;
		// undefined should not be a bool
		return String(this._value);
		// @raw ? "true" : "false"
	};
	
	function Undefined(){ Literal.apply(this,arguments) };
	
	subclass$(Undefined,Literal);
	exports.Undefined = Undefined; // export class 
	Undefined.prototype.isPrimitive = function (){
		return true;
	};
	
	Undefined.prototype.c = function (){
		return "undefined";
	};
	
	function Nil(){ Literal.apply(this,arguments) };
	
	subclass$(Nil,Literal);
	exports.Nil = Nil; // export class 
	Nil.prototype.isPrimitive = function (){
		return true;
	};
	
	Nil.prototype.c = function (){
		return "null";
	};
	
	function True(){ Bool.apply(this,arguments) };
	
	subclass$(True,Bool);
	exports.True = True; // export class 
	True.prototype.raw = function (){
		return true;
	};
	
	True.prototype.c = function (){
		return "true";
	};
	
	function False(){ Bool.apply(this,arguments) };
	
	subclass$(False,Bool);
	exports.False = False; // export class 
	False.prototype.raw = function (){
		return false;
	};
	
	False.prototype.c = function (){
		return "false";
	};
	
	function Num(v){
		this._traversed = false;
		this._value = v;
	};
	
	subclass$(Num,Literal);
	exports.Num = Num; // export class 
	Num.prototype.toString = function (){
		return String(this._value);
	};
	
	Num.prototype.isPrimitive = function (deep){
		return true;
	};
	
	Num.prototype.shouldParenthesize = function (par){
		if(par === undefined) par = this.up();
		return (par instanceof Access) && par.left() == this;
	};
	
	Num.prototype.js = function (o){
		var num = String(this._value);
		// console.log "compiled num to {num}"
		return num;
	};
	
	Num.prototype.c = function (o){
		if (this._cache) { return Num.__super__.c.call(this,o) };
		var js = String(this._value);
		var par = STACK.current();
		var paren = (par instanceof Access) && par.left() == this;
		// only if this is the right part of teh acces
		// console.log "should paren?? {shouldParenthesize}"
		return paren ? ("(" + js + ")") : (js);
		// @cache ? super(o) : String(@value)
	};
	
	Num.prototype.cache = function (o){
		// p "cache num",o
		if (!(o && (o.cache || o.pool))) { return this };
		return Num.__super__.cache.call(this,o);
	};
	
	Num.prototype.raw = function (){
		// really?
		return JSON.parse(String(this.value()));
	};
	
	// should be quoted no?
	// what about strings in object-literals?
	// we want to be able to see if the values are allowed
	function Str(v){
		this._traversed = false;
		this._expression = true;
		this._cache = null;
		this._value = v;
		// should grab the actual value immediately?
	};
	
	subclass$(Str,Literal);
	exports.Str = Str; // export class 
	Str.prototype.isString = function (){
		return true;
	};
	
	Str.prototype.isPrimitive = function (deep){
		return true;
	};
	
	Str.prototype.raw = function (){
		// JSON.parse requires double-quoted strings,
		// while eval also allows single quotes. 
		// NEXT eval is not accessible like this
		// WARNING TODO be careful! - should clean up
		
		return this._raw || (this._raw = String(this.value()).slice(1,-1)); // incredibly stupid solution
	};
	
	Str.prototype.isValidIdentifier = function (){
		// there are also some values we cannot use
		return this.raw().match(/^[a-zA-Z\$\_]+[\d\w\$\_]*$/) ? (true) : (false);
	};
	
	Str.prototype.js = function (o){
		return String(this._value);
	};
	
	Str.prototype.c = function (o){
		return this._cache ? (Str.__super__.c.call(this,o)) : (String(this._value));
	};
	
	// Currently not used - it would be better to use this
	// for real interpolated strings though, than to break
	// them up into their parts before parsing
	function InterpolatedString(){ ListNode.apply(this,arguments) };
	
	subclass$(InterpolatedString,ListNode);
	exports.InterpolatedString = InterpolatedString; // export class 
	InterpolatedString.prototype.js = function (o){
		return "interpolated string";
	};
	
	
	function Tuple(){ ListNode.apply(this,arguments) };
	
	subclass$(Tuple,ListNode);
	exports.Tuple = Tuple; // export class 
	Tuple.prototype.c = function (){
		// compiles as an array
		return new Arr(this.nodes()).c();
	};
	
	Tuple.prototype.hasSplat = function (){
		return this.filter(function(v) { return v instanceof Splat; })[0];
	};
	
	Tuple.prototype.consume = function (node){
		if (this.count() == 1) {
			return this.first().consume(node);
		} else {
			throw "multituple cannot consume";
		};
	};
	
	
	// Because we've dropped the Str-wrapper it is kinda difficult
	function Symbol(){ Literal.apply(this,arguments) };
	
	subclass$(Symbol,Literal);
	exports.Symbol = Symbol; // export class 
	Symbol.prototype.isValidIdentifier = function (){
		return this.raw().match(/^[a-zA-Z\$\_]+[\d\w\$\_]*$/) ? (true) : (false);
	};
	
	Symbol.prototype.isPrimitive = function (deep){
		return true;
	};
	
	Symbol.prototype.raw = function (){
		return this._raw || (this._raw = sym__(this.value()));
	};
	
	Symbol.prototype.js = function (o){
		return "'" + (sym__(this.value())) + "'";
	};
	
	function RegExp(){ Literal.apply(this,arguments) };
	
	subclass$(RegExp,Literal);
	exports.RegExp = RegExp; // export class 
	RegExp.prototype.isPrimitive = function (){
		return true;
	};
	
	// def toString
	// 	"" + value
	;
	
	// Should inherit from ListNode - would simplify
	function Arr(){ Literal.apply(this,arguments) };
	
	subclass$(Arr,Literal);
	exports.Arr = Arr; // export class 
	Arr.prototype.load = function (value){
		return value instanceof Array ? (new ArgList(value)) : (value);
	};
	
	Arr.prototype.push = function (item){
		this.value().push(item);
		return this;
	};
	
	Arr.prototype.count = function (){
		return this.value().length;
	};
	
	Arr.prototype.nodes = function (){
		var val = this.value();
		return val instanceof Array ? (val) : (val.nodes());
	};
	
	Arr.prototype.splat = function (){
		return this.value().some(function(v) { return v instanceof Splat; });
	};
	
	Arr.prototype.visit = function (){
		if (this._value && this._value.traverse) { this._value.traverse() };
		return this;
	};
	
	Arr.prototype.isPrimitive = function (deep){
		return !this.value().some(function(v) { return !v.isPrimitive(true); });
	};
	
	Arr.prototype.js = function (o){
		
		var val = this._value;
		if (!val) { return "[]" };
		
		var splat = this.splat();
		var nodes = val instanceof Array ? (val) : (val.nodes());
		// p "value of array isa {@value}"
		
		// for v in @value
		// 	break splat = yes if v isa Splat
		// var splat = value.some(|v| v isa Splat)
		
		if (splat) {
			// "SPLATTED ARRAY!"
			// if we know for certain that the splats are arrays we can drop the slice?
			// p "array is splat?!?"
			var slices = [];
			var group = null;
			
			for (var i=0, ary=iter$(nodes), len=ary.length, v; i < len; i++) {
				v = ary[i];
				if (v instanceof Splat) {
					slices.push(v);
					group = null;
				} else {
					if (!group) { slices.push(group = new Arr([])) };
					group.push(v);
				};
			};
			
			return "[].concat(" + (cary__(slices).join(", ")) + ")";
		} else {
			// very temporary. need a more generic way to prettify code
			// should depend on the length of the inner items etc
			// if @indented or option(:indent) or value.@indented
			//	"[\n{value.c.join(",\n").indent}\n]"
			var out = val instanceof Array ? (cary__(val)) : (val.c());
			return "[" + out + "]";
		};
	};
	
	Arr.prototype.hasSideEffects = function (){
		return this.value().some(function(v) { return v.hasSideEffects(); });
	};
	
	Arr.prototype.toString = function (){
		return "Arr";
	};
	
	Arr.prototype.indented = function (a,b){
		this._value.indented(a,b);
		return this;
	};
	
	Arr.wrap = function (val){
		return new Arr(val);
	};
	
	// should not be cklassified as a literal?
	function Obj(){ Literal.apply(this,arguments) };
	
	subclass$(Obj,Literal);
	exports.Obj = Obj; // export class 
	Obj.prototype.load = function (value){
		return value instanceof Array ? (new AssignList(value)) : (value);
	};
	
	Obj.prototype.visit = function (){
		if (this._value) { this._value.traverse() };
		// for v in value
		// 	v.traverse
		return this;
	};
	
	Obj.prototype.js = function (o){
		var dyn = this.value().filter(function(v) { return (v instanceof ObjAttr) && (v.key() instanceof Op); });
		
		if (dyn.length > 0) {
			var idx = this.value().indexOf(dyn[0]);
			// p "dynamic keys! {dyn}"
			// create a temp variable
			
			var tmp = this.scope__().temporary(this);
			// set the temporary object to the same
			var first = this.value().slice(0,idx);
			var obj = new Obj(first);
			var ast = [OP('=',tmp,obj)];
			
			this.value().slice(idx).forEach(function(atr) {
				return ast.push(OP('=',OP('.',tmp,atr.key()),atr.value()));
			});
			ast.push(tmp); // access the tmp at in the last part
			return new Parens(ast).c();
		};
		
		// for objects with expression-keys we need to think differently
		return '{' + this.value().c() + '}';
	};
	
	Obj.prototype.add = function (k,v){
		if ((typeof k=='string'||k instanceof String)) { k = new Identifier(k) };
		var kv = new ObjAttr(k,v);
		this.value().push(kv);
		return kv;
	};
	
	Obj.prototype.hash = function (){
		var hash = {};
		for (var i=0, ary=iter$(this.value()), len=ary.length, k; i < len; i++) {
			k = ary[i];
			if (k instanceof ObjAttr) { hash[k.key().symbol()] = k.value() };
		};
		return hash;
		// return k if k.key.symbol == key
	};
	
	// add method for finding properties etc?
	Obj.prototype.key = function (key){
		for (var i=0, ary=iter$(this.value()), len=ary.length, k; i < len; i++) {
			k = ary[i];
			if ((k instanceof ObjAttr) && k.key().symbol() == key) { return k };
		};
		return null;
	};
	
	Obj.prototype.indented = function (a,b){
		this._value.indented(a,b);
		return this;
	};
	
	Obj.prototype.hasSideEffects = function (){
		return this.value().some(function(v) { return v.hasSideEffects(); });
	};
	
	// for converting a real object into an ast-representation
	Obj.wrap = function (obj){
		var attrs = [];
		for (var v, i=0, keys=Object.keys(obj), l=keys.length; i < l; i++){
			v = obj[keys[i]];if (v instanceof Array) {
				v = Arr.wrap(v);
			} else if (v.constructor == Object) {
				v = Obj.wrap(v);
			};
			attrs.push(new ObjAttr(keys[i],v));
		};
		return new Obj(attrs);
	};
	
	Obj.prototype.toString = function (){
		return "Obj";
	};
	
	function ObjAttr(key,value){
		this._traversed = false;
		this._key = key;
		this._value = value;
		this._dynamic = (key instanceof Op);
		this;
	};
	
	subclass$(ObjAttr,Node);
	exports.ObjAttr = ObjAttr; // export class 
	
	ObjAttr.prototype.__key = {name: 'key'};
	ObjAttr.prototype.key = function(v){ return this._key; }
	ObjAttr.prototype.setKey = function(v){ this._key = v; return this; };
	
	ObjAttr.prototype.__value = {name: 'value'};
	ObjAttr.prototype.value = function(v){ return this._value; }
	ObjAttr.prototype.setValue = function(v){ this._value = v; return this; };
	
	ObjAttr.prototype.__options = {name: 'options'};
	ObjAttr.prototype.options = function(v){ return this._options; }
	ObjAttr.prototype.setOptions = function(v){ this._options = v; return this; };
	
	ObjAttr.prototype.visit = function (){
		// should probably traverse key as well, unless it is a dead simple identifier
		this.key().traverse();
		return this.value().traverse();
	};
	
	ObjAttr.prototype.js = function (o){
		var k = this.key().isReserved() ? (("'" + (this.key().c()) + "'")) : (this.key().c());
		return "" + k + ": " + (this.value().c());
	};
	
	ObjAttr.prototype.hasSideEffects = function (){
		return true;
	};
	
	
	
	function ArgsReference(){ Node.apply(this,arguments) };
	
	subclass$(ArgsReference,Node);
	exports.ArgsReference = ArgsReference; // export class 
	ArgsReference.prototype.c = function (){
		return "arguments";
	};
	
	// should be a separate Context or something
	function Self(scope){
		this._scope = scope;
	};
	
	subclass$(Self,Literal);
	exports.Self = Self; // export class 
	
	Self.prototype.__scope = {name: 'scope'};
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
		return s ? (s.context().c()) : ("this");
	};
	
	function ImplicitSelf(){ Self.apply(this,arguments) };
	
	subclass$(ImplicitSelf,Self);
	exports.ImplicitSelf = ImplicitSelf; // export class 
	
	
	function This(){ Self.apply(this,arguments) };
	
	subclass$(This,Self);
	exports.This = This; // export class 
	This.prototype.cache = function (){
		return this;
	};
	
	This.prototype.reference = function (){
		// p "referencing this"
		return this;
	};
	
	This.prototype.c = function (){
		return "this";
	};
	
	
	
	
	// OPERATORS
	
	function Op(o,l,r){
		// set expression yes, no?
		this._expression = false;
		this._traversed = false;
		this._parens = false;
		this._cache = null;
		this._invert = false;
		this._op = o && o._value || o;
		this._left = l;
		this._right = r;
		return this;
	};
	
	subclass$(Op,Node);
	exports.Op = Op; // export class 
	
	Op.prototype.__op = {name: 'op'};
	Op.prototype.op = function(v){ return this._op; }
	Op.prototype.setOp = function(v){ this._op = v; return this; };
	
	Op.prototype.__left = {name: 'left'};
	Op.prototype.left = function(v){ return this._left; }
	Op.prototype.setLeft = function(v){ this._left = v; return this; };
	
	Op.prototype.__right = {name: 'right'};
	Op.prototype.right = function(v){ return this._right; }
	Op.prototype.setRight = function(v){ this._right = v; return this; };
	
	Op.prototype.visit = function (){
		if (this._right) { this._right.traverse() };
		if (this._left) { this._left.traverse() };
		return this;
	};
	
	Op.prototype.isExpressable = function (){
		// what if right is a string?!?
		return !(this.right()) || this.right().isExpressable();
	};
	
	Op.prototype.js = function (o){
		var out = null;
		var op = this._op;
		
		var l = this._left;
		var r = this._right;
		
		if (l instanceof Node) { l = l.c() };
		if (r instanceof Node) { r = r.c() };
		
		if (l && r) {
			out = ("" + l + " " + op + " " + r);
		} else if (l) {
			out = ("" + op + l);
		};
		// out = out.parenthesize if up isa Op # really?
		return out;
	};
	
	Op.prototype.shouldParenthesize = function (){
		return this._parens;
		// option(:parens)
	};
	
	Op.prototype.precedence = function (){
		return 10;
	};
	
	Op.prototype.consume = function (node){
		// p "Op.consume {node}".cyan
		if (this.isExpressable()) { return Op.__super__.consume.apply(this,arguments) };
		
		// TODO can rather use global caching?
		var tmpvar = this.scope__().declare('tmp',null,{system: true});
		var clone = OP(this.op(),this.left(),null);
		var ast = this.right().consume(clone);
		if (node) { ast.consume(node) };
		return ast;
	};
	
	function ComparisonOp(){ Op.apply(this,arguments) };
	
	subclass$(ComparisonOp,Op);
	exports.ComparisonOp = ComparisonOp; // export class 
	ComparisonOp.prototype.invert = function (){
		// are there other comparison ops?
		// what about a chain?
		var op = this._op;
		var pairs = ["==","!=","===","!==",">","<=","<",">="];
		var idx = pairs.indexOf(op);
		idx += (idx % 2 ? (-1) : (1));
		
		// p "invert {@op}"
		// p "inverted comparison(!) {idx} {op} -> {pairs[idx]}"
		this.setOp(pairs[idx]);
		this._invert = !this._invert;
		return this;
	};
	
	ComparisonOp.prototype.c = function (){
		if (this.left() instanceof ComparisonOp) {
			this.left().right().cache();
			return OP('&&',this.left(),OP(this.op(),this.left().right(),this.right())).c();
		} else {
			return ComparisonOp.__super__.c.apply(this,arguments);
		};
	};
	
	ComparisonOp.prototype.js = function (o){
		var op = this._op;
		var l = this._left;
		var r = this._right;
		
		if (l instanceof Node) { l = l.c() };
		if (r instanceof Node) { r = r.c() };
		return ("" + l + " " + op + " " + r);
	};
	
	
	function MathOp(){ Op.apply(this,arguments) };
	
	subclass$(MathOp,Op);
	exports.MathOp = MathOp; // export class 
	MathOp.prototype.c = function (){
		if (this.op() == '∪') {
			return this.util().union(this.left(),this.right()).c();
		} else if (this.op() == '∩') {
			return this.util().intersect(this.left(),this.right()).c();
		};
	};
	
	
	function UnaryOp(){ Op.apply(this,arguments) };
	
	subclass$(UnaryOp,Op);
	exports.UnaryOp = UnaryOp; // export class 
	UnaryOp.prototype.invert = function (){
		if (this.op() == '!') {
			return this.left();
		} else {
			return UnaryOp.__super__.invert.apply(this,arguments); // regular invert
		};
	};
	
	UnaryOp.prototype.js = function (o){
		var l = this._left;
		var r = this._right;
		// all of this could really be done i a much
		// cleaner way.
		// l.set(parens: yes) if l # are we really sure about this?
		// r.set(parens: yes) if r
		
		if (this.op() == '!') {
			// l.@parens = yes
			var str = l.c();
			var paren = l.shouldParenthesize(this);
			// p "check for parens in !: {str} {l} {l.@parens} {l.shouldParenthesize(self)}"
			// FIXME this is a very hacky workaround. Need to handle all this
			// in the child instead, problems arise due to automatic caching
			if (!(str.match(/^\!?([\w\.]+)$/) || (l instanceof Parens) || paren || (l instanceof Access) || (l instanceof Call))) { str = '(' + str + ')' };
			// l.set(parens: yes) # sure?
			return "" + this.op() + str;
		} else if (this.op() == '√') {
			return "Math.sqrt(" + (l.c()) + ")";
		} else if (this.left()) {
			return "" + (l.c()) + this.op();
		} else {
			return "" + this.op() + (r.c());
		};
	};
	
	UnaryOp.prototype.normalize = function (){
		if (this.op() == '!' || this.op() == '√') { return this };
		var node = (this.left() || this.right()).node();
		// for property-accessors we need to rewrite the ast
		if (!((node instanceof PropertyAccess))) { return this };
		
		// ask to cache the path
		if ((node instanceof Access) && node.left()) { node.left().cache() };
		
		var num = new Num(1);
		var ast = OP('=',node,OP(this.op()[0],node,num));
		if (this.left()) { ast = OP(this.op()[0] == '-' ? ('+') : ('-'),ast,num) };
		
		return ast;
	};
	
	UnaryOp.prototype.consume = function (node){
		var norm = this.normalize();
		return norm == this ? (UnaryOp.__super__.consume.apply(this,arguments)) : (norm.consume(node));
	};
	
	UnaryOp.prototype.c = function (){
		var norm = this.normalize();
		return norm == this ? (UnaryOp.__super__.c.apply(this,arguments)) : (norm.c());
	};
	
	function InstanceOf(){ Op.apply(this,arguments) };
	
	subclass$(InstanceOf,Op);
	exports.InstanceOf = InstanceOf; // export class 
	InstanceOf.prototype.js = function (o){
		// fix checks for String and Number
		// p right.inspect
		
		if (this.right() instanceof Const) {
			// WARN otherwise - what do we do? does not work with dynamic
			// classes etc? Should probably send to utility function isa$
			var name = c__(this.right().value());
			var obj = this.left().node();
			// TODO also check for primitive-constructor
			if (idx$(name,['String','Number','Boolean']) >= 0) {
				if (!((obj instanceof LocalVarAccess))) {
					obj.cache();
				};
				// need a double check for these (cache left) - possibly
				return ("(typeof " + (obj.c()) + "=='" + (name.toLowerCase()) + "'||" + (obj.c()) + " instanceof " + name + ")");
				
				// convert
			};
		};
		var out = ("" + (this.left().c()) + " " + this.op() + " " + (this.right().c()));
		
		// should this not happen in #c?
		if (o.parent() instanceof Op) { out = helpers.parenthesize(out) };
		return out;
	};
	
	function TypeOf(){ Op.apply(this,arguments) };
	
	subclass$(TypeOf,Op);
	exports.TypeOf = TypeOf; // export class 
	TypeOf.prototype.js = function (o){
		return "typeof " + (this.left().c());
	};
	
	function Delete(){ Op.apply(this,arguments) };
	
	subclass$(Delete,Op);
	exports.Delete = Delete; // export class 
	Delete.prototype.js = function (o){
		// TODO this will execute calls several times if the path is not directly to an object
		// need to cache the receiver
		var l = this.left();
		var tmp = this.scope__().temporary(this,{pool: 'val'});
		var o = OP('=',tmp,l);
		// FIXME
		return ("(" + (o.c()) + ",delete " + (l.c()) + ", " + (tmp.c()) + ")"); // oh well
		// var ast = [OP('=',tmp,left),"delete {left.c}",tmp]
		// should parenthesize directly no?
		// ast.c
	};
	
	Delete.prototype.shouldParenthesize = function (){
		return true;
	};
	
	function In(){ Op.apply(this,arguments) };
	
	subclass$(In,Op);
	exports.In = In; // export class 
	In.prototype.invert = function (){
		this._invert = !this._invert;
		return this;
	};
	
	In.prototype.js = function (o){
		var cond = this._invert ? ("== -1") : (">= 0");
		var idx = Util.indexOf(this.left(),this.right());
		return "" + (idx.c()) + " " + cond;
	};
	
	
	
	
	
	
	
	// ACCESS
	
	module.exports.K_IVAR = K_IVAR = 1;
	module.exports.K_SYM = K_SYM = 2;
	module.exports.K_STR = K_STR = 3;
	module.exports.K_PROP = K_PROP = 4;
	
	function Access(o,l,r){
		// set expression yes, no?
		this._expression = false;
		this._traversed = false;
		this._parens = false;
		this._cache = null;
		this._invert = false;
		this._op = o && o._value || o;
		this._left = l;
		this._right = r;
		return this;
	};
	
	subclass$(Access,Op);
	exports.Access = Access; // export class 
	Access.prototype.clone = function (left,right){
		var ctor = this.constructor;
		return new ctor(this.op(),left,right);
	};
	
	Access.prototype.js = function (o){
		var r;
		var raw = null;
		var rgt = this.right();
		var ctx = (this.left() || this.scope__().context());
		var pre = "";
		
		// if safechain
		//	p "Access is safechained {rgt.c}"
		
		
		if (rgt instanceof Num) {
			return ctx.c() + "[" + rgt.c() + "]";
		};
		
		// is this right? Should not the index compile the brackets
		// or value is a symbol -- should be the same, no?
		if ((rgt instanceof Index) && ((rgt.value() instanceof Str) || (rgt.value() instanceof Symbol))) {
			rgt = rgt.value();
		};
		
		// TODO do the identifier-validation in a central place instead
		if ((rgt instanceof Str) && rgt.isValidIdentifier()) {
			raw = rgt.raw();
		} else if ((rgt instanceof Symbol) && rgt.isValidIdentifier()) {
			raw = rgt.raw();
		} else if ((rgt instanceof Identifier) && rgt.isValidIdentifier()) {
			raw = rgt.c();
		};
		
		if (this.safechain() && ctx) {
			ctx.cache({force: true});
			pre = ctx.c() + " && ";
		};
		
		// really?
		// var ctx = (left || scope__.context)
		var out = raw ? (
			// see if it needs quoting
			// need to check to see if it is legal
			ctx ? (("" + (ctx.c()) + "." + raw)) : (raw)
		) : (
			r = rgt instanceof Node ? (rgt.c({expression: true})) : (rgt),
			("" + (ctx.c()) + "[" + r + "]")
		);
		
		// if safechain and ctx
		// 	out = "{ctx.c} && {out}"
		
		return pre + out;
	};
	
	Access.prototype.visit = function (){
		if (this.left()) { this.left().traverse() };
		if (this.right()) { this.right().traverse() };
		return;
	};
	
	Access.prototype.isExpressable = function (){
		return true;
	};
	
	Access.prototype.alias = function (){
		return this.right() instanceof Identifier ? (this.right().alias()) : (Access.__super__.alias.call(this));
	};
	
	Access.prototype.safechain = function (){
		// right.safechain
		return String(this._op) == '?.' || String(this._op) == '?:';
	};
	
	Access.prototype.cache = function (o){
		return ((this.right() instanceof Ivar) && !(this.left())) ? (this) : (Access.__super__.cache.call(this,o));
	};
	
	
	
	// Should change this to just refer directly to the variable? Or VarReference
	function LocalVarAccess(){ Access.apply(this,arguments) };
	
	subclass$(LocalVarAccess,Access);
	exports.LocalVarAccess = LocalVarAccess; // export class 
	
	LocalVarAccess.prototype.__safechain = {name: 'safechain'};
	LocalVarAccess.prototype.safechain = function(v){ return this._safechain; }
	LocalVarAccess.prototype.setSafechain = function(v){ this._safechain = v; return this; };
	
	LocalVarAccess.prototype.js = function (o){
		if ((this.right() instanceof Variable) && this.right().type() == 'meth') {
			if (!((this.up() instanceof Call))) { return ("" + (this.right().c()) + "()") };
		};
		
		return this.right().c();
	};
	
	LocalVarAccess.prototype.variable = function (){
		return this.right();
	};
	
	LocalVarAccess.prototype.cache = function (o){
		if(o === undefined) o = {};
		if (o.force) { LocalVarAccess.__super__.cache.call(this,o) };
		return this;
	};
	
	LocalVarAccess.prototype.alias = function (){
		return this.variable()._alias || LocalVarAccess.__super__.alias.call(this);
	};
	
	
	function GlobalVarAccess(){ ValueNode.apply(this,arguments) };
	
	subclass$(GlobalVarAccess,ValueNode);
	exports.GlobalVarAccess = GlobalVarAccess; // export class 
	GlobalVarAccess.prototype.js = function (o){
		return this.value().c();
	};
	
	
	function ObjectAccess(){ Access.apply(this,arguments) };
	
	subclass$(ObjectAccess,Access);
	exports.ObjectAccess = ObjectAccess; // export class 
	
	
	
	function PropertyAccess(o,l,r){
		this._traversed = false;
		this._invert = false;
		this._parens = false;
		this._expression = false; // yes?
		this._cache = null;
		this._op = o;
		this._left = l;
		this._right = r;
		return this;
	};
	
	subclass$(PropertyAccess,Access);
	exports.PropertyAccess = PropertyAccess; // export class 
	PropertyAccess.prototype.visit = function (){
		if (this._right) { this._right.traverse() };
		if (this._left) { this._left.traverse() };
		return this;
	};
	
	// right in c we should possibly override
	// to create a call and regular access instead
	
	PropertyAccess.prototype.js = function (o){
		
		var rec;
		if (rec = this.receiver()) {
			// p "converting to call"
			var ast = CALL(OP('.',this.left(),this.right()),[]); // convert to ArgList or null
			ast.setReceiver(rec);
			return ast.c();
		};
		
		var up = this.up();
		
		if (!((up instanceof Call))) {
			// p "convert to call instead"
			ast = CALL(new Access(this.op(),this.left(),this.right()),[]);
			return ast.c();
		};
		
		// really need to fix this - for sure
		// should be possible for the function to remove this this instead?
		var js = ("" + (PropertyAccess.__super__.js.call(this,o)));
		
		if (!((up instanceof Call) || (up instanceof Util.IsFunction))) {
			// p "Called"
			js += "()";
		};
		
		return js;
	};
	
	
	PropertyAccess.prototype.receiver = function (){
		if ((this.left() instanceof SuperAccess) || (this.left() instanceof Super)) {
			return SELF;
		} else {
			return null;
		};
	};
	
	
	function IvarAccess(){ Access.apply(this,arguments) };
	
	subclass$(IvarAccess,Access);
	exports.IvarAccess = IvarAccess; // export class 
	IvarAccess.prototype.cache = function (){
		// WARN hmm, this is not right... when accessing on another object it will need to be cached
		return this;
	};
	
	
	function ConstAccess(){ Access.apply(this,arguments) };
	
	subclass$(ConstAccess,Access);
	exports.ConstAccess = ConstAccess; // export class 
	
	
	
	function IndexAccess(){ Access.apply(this,arguments) };
	
	subclass$(IndexAccess,Access);
	exports.IndexAccess = IndexAccess; // export class 
	IndexAccess.prototype.cache = function (o){
		if(o === undefined) o = {};
		if (o.force) { return IndexAccess.__super__.cache.apply(this,arguments) };
		this.right().cache();
		return this;
	};
	
	
	function SuperAccess(){ Access.apply(this,arguments) };
	
	subclass$(SuperAccess,Access);
	exports.SuperAccess = SuperAccess; // export class 
	SuperAccess.prototype.js = function (o){
		var m = o.method();
		var up = o.parent();
		var deep = (o.parent() instanceof Access);
		
		var out = ("" + (this.left().c()) + ".__super__");
		
		if (!((up instanceof Access))) {
			out += ("." + (m.supername().c()));
			if (!((up instanceof Call))) { // autocall?
				out += (".apply(" + (m.scope().context().c()) + ",arguments)");
			};
		};
		
		return out;
	};
	
	SuperAccess.prototype.receiver = function (){
		return SELF;
	};
	
	
	function VarOrAccess(value){
		// should rather call up to valuenode?
		this._traversed = false;
		this._parens = false;
		this._value = value;
		this._identifier = value;
		this._token = value._value;
		this._variable = null;
		this;
	};
	
	// Shortcircuit traverse so that it is not added to the stack?!
	subclass$(VarOrAccess,ValueNode);
	exports.VarOrAccess = VarOrAccess; // export class 
	VarOrAccess.prototype.visit = function (){
		// @identifier = value # this is not a real identifier?
		// console.log "VarOrAccess {@identifier}"
		// p "visit {self}"
		
		
		var scope = this.scope__();
		
		// p "look for variable named {value} in {scope}"
		
		var variable = scope.lookup(this.value());
		
		// does not really need to have a declarator already? -- tricky
		if (variable && variable.declarator()) {
			// var decl = variable.declarator
			
			// if the variable is not initialized just yet and we are
			// in the same scope - we should not treat this as a var-lookup
			// ie.  var x = x would resolve to var x = this.x() if x
			// was not previously defined
			
			// should do this even if we are not in the same scope?
			// we only need to be in the same closure(!)
			
			if (variable._initialized || (scope.closure() != variable.scope().closure())) {
				this._variable = variable;
				variable.addReference(this);
				this._value = variable; // variable.accessor(self)
				this._token._variable = variable;
				return this;
			};
			
			// p "var is not yet initialized!"
			// p "declarator for var {decl.@declared}"
			// FIX
			// @value.safechain = safechain
		};
		
		// TODO deprecate and remove
		if (this.value().symbol().indexOf('$') >= 0) {
			// big hack - should disable
			// major hack here, no?
			// console.log "GlobalVarAccess"
			this._value = new GlobalVarAccess(this.value());
			return this;
		};
		
		// really? what about just mimicking the two diffrent instead?
		// Should we not return a call directly instead?
		this._value = new PropertyAccess(".",scope.context(),this.value());
		// mark the scope / context -- so we can show correct implicit
		this._token._meta = {type: 'ACCESS'};
		// @value.traverse # nah
		return this;
	};
	
	VarOrAccess.prototype.c = function (){
		return this._variable ? (VarOrAccess.__super__.c.call(this)) : (this.value().c());
	};
	
	VarOrAccess.prototype.js = function (o){
		
		var v;
		if (v = this._variable) {
			var out = v.c();
			if (v._type == 'meth' && !(o.up() instanceof Call)) { out += "()" };
			return out;
		};
		return "NONO";
	};
	
	VarOrAccess.prototype.node = function (){
		return this._variable ? (this) : (this.value());
	};
	
	VarOrAccess.prototype.symbol = function (){
		return this._identifier.symbol();
		// value and value.symbol
	};
	
	VarOrAccess.prototype.cache = function (o){
		if(o === undefined) o = {};
		return this._variable ? ((o.force && VarOrAccess.__super__.cache.call(this,o))) : (this.value().cache(o));
		// should we really cache this?
		// value.cache(o)
	};
	
	VarOrAccess.prototype.decache = function (){
		this._variable ? (VarOrAccess.__super__.decache.call(this)) : (this.value().decache());
		return this;
	};
	
	VarOrAccess.prototype.dom = function (){
		return this.value().dom();
	};
	
	VarOrAccess.prototype.safechain = function (){
		return this._identifier.safechain();
	};
	
	VarOrAccess.prototype.dump = function (){
		return {loc: this.loc()};
	};
	
	VarOrAccess.prototype.loc = function (){
		var loc = this._identifier.region();
		return loc || [0,0];
	};
	
	VarOrAccess.prototype.region = function (){
		return this._identifier.region();
	};
	
	VarOrAccess.prototype.toString = function (){
		return "VarOrAccess(" + this.value() + ")";
	};
	
	//	def js
	//		if right isa Variable and right.type == 'meth'
	//			return "{right.c}()" unless up isa Call
	//
	//		right.c
	//
	//	def variable
	//		right
	//
	//	def cache o = {}
	//		super if o:force
	//		self
	//
	//	def alias
	//		variable.@alias or super # if resolved?
	//
	
	function VarReference(value,type){
		
		// for now - this can happen
		// if value isa Arr
		
		VarReference.__super__.constructor.call(this,value);
		this._export = false;
		this._type = type && String(type);
		this._variable = null;
		this._declared = true; // just testing now
	};
	
	subclass$(VarReference,ValueNode);
	exports.VarReference = VarReference; // export class 
	
	VarReference.prototype.__variable = {name: 'variable'};
	VarReference.prototype.variable = function(v){ return this._variable; }
	VarReference.prototype.setVariable = function(v){ this._variable = v; return this; };
	
	VarReference.prototype.__declared = {name: 'declared'};
	VarReference.prototype.declared = function(v){ return this._declared; }
	VarReference.prototype.setDeclared = function(v){ this._declared = v; return this; };
	
	VarReference.prototype.__type = {name: 'type'};
	VarReference.prototype.type = function(v){ return this._type; }
	VarReference.prototype.setType = function(v){ this._type = v; return this; };
	
	VarReference.prototype.loc = function (){
		// p "loc for VarReference {@value:constructor} {@value.@value:constructor} {@value.region}"
		return this._value.region();
	};
	
	VarReference.prototype.set = function (o){
		// hack - workaround for hidden classes perf
		if (o.export) { this._export = true };
		return this;
	};
	
	VarReference.prototype.js = function (o){
		// experimental fix
		
		// what about resolving?
		var ref = this._variable;
		var out = ref.c();
		
		// p "VarReference {out} - {o.up} {o.up == self}\n{o}"
		
		if (ref && !ref._declared) { // .option(:declared)
			if (o.up(VarBlock)) { // up varblock??
				ref._declared = true;
				
				// ref.set(declared: yes)
			} else if (o.isExpression() || this._export) { // why?
				// p "autodeclare"
				ref.autodeclare();
			} else {
				// 
				out = ("var " + out);
				ref._declared = true;
				// ref.set(declared: yes)
			};
		};
		
		// need to think the export through -- like registering somehow
		// should register in scope - export on analysis++
		if (this._export) {
			out = ("module.exports." + (ref.c()) + " = " + (ref.c()));
		};
		
		return out;
	};
	
	VarReference.prototype.declare = function (){
		return this;
	};
	
	VarReference.prototype.consume = function (node){
		// really? the consumed node dissappear?
		this._variable && this._variable.autodeclare();
		return this;
	};
	
	VarReference.prototype.visit = function (){
		// p "visit vardecl"
		// console.log "value type for VarReference {@value} {@value.@loc} {@value:constructor}"
		
		// should be possible to have a VarReference without a name as well? for a system-variable
		var name = this.value().c();
		
		// what about looking up? - on register we want to mark
		var v = this._variable || (this._variable = this.scope__().register(name,this,{type: this._type}));
		// FIXME -- should not simply override the declarator here(!)
		
		if (!v.declarator()) {
			v.setDeclarator(this);
		};
		
		if (this._value) { v.addReference(this._value) }; // is this the first reference?
		
		// only needed when analyzing?
		this._value._value._variable = v;
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
	
	function Assign(o,l,r){
		
		// workaround until we complete transition from lua-style assignments
		// to always use explicit tuples - then we can move assignments out etc
		// this will not be needed after we remove support for var a,b,c = 1,2,3
		if ((l instanceof VarReference) && (l.value() instanceof Arr)) {
			// p "case with var!!"
			// converting all nodes to var-references ?
			// do we need to keep it in a varblock at all?
			var vars = l.value().nodes().map(function(v) {
				// what about inner tuples etc?
				// keep the splats -- clumsy but true
				var v_;
				if (v instanceof Splat) {
					// p "value is a splat!!"
					if (!((v.value() instanceof VarReference))) { (v.setValue(v_=new VarReference(v.value(),l.type())),v_) };
				} else if (v instanceof VarReference) {
					true;
				} else {
					v = new VarReference(v,l.type());
				};
				
				return v;
				
				// v isa VarReference ? v : VarReference.new(v)
			});
			return new TupleAssign(o,new Tuple(vars),r);
		};
		
		if (l instanceof Arr) {
			return new TupleAssign(o,new Tuple(l.nodes()),r);
			// p "left is array in assign - in init"
		};
		
		
		// set expression yes, no?
		this._expression = false;
		this._traversed = false;
		this._parens = false;
		this._cache = null;
		this._invert = false;
		this._op = o && o._value || o;
		this._left = l;
		this._right = r;
		return this;
	};
	
	subclass$(Assign,Op);
	exports.Assign = Assign; // export class 
	Assign.prototype.isExpressable = function (){
		return !(this.right()) || this.right().isExpressable();
	};
	
	Assign.prototype.isUsed = function (){
		// really?
		// if up is a block in general this should not be used -- since it should already have received implicit self?
		if (this.up() instanceof Block) { // && up.last != self
			return false;
		};
		return true;
	};
	
	// FIXME optimize
	Assign.prototype.visit = function (){
		var l = this._left;
		var r = this._right;
		
		// WARNING - slightly undefined
		// MARK THE STACK
		if (l) { l.traverse() };
		
		var lvar = (l instanceof VarReference) && l.variable();
		
		// p "assign {l} {r} {l.value}"
		
		
		
		// this should probably be done in a different manner
		if (lvar && lvar.declarator() == l) {
			lvar._initialized = false;
			if (r) { r.traverse() };
			lvar._initialized = true;
		} else {
			if (r) { r.traverse() };
		};
		
		if ((l instanceof VarReference) || l._variable) {
			l._variable.assigned(r,this);
		};
		
		return this;
	};
	
	Assign.prototype.c = function (o){
		if (!this.right().isExpressable()) {
			// p "Assign#c right is not expressable "
			return this.right().consume(this).c(o);
		};
		// testing this
		return Assign.__super__.c.call(this,o);
	};
	
	Assign.prototype.js = function (o){
		if (!this.right().isExpressable()) {
			this.p("Assign#js right is not expressable ");
			// here this should be go out of the stack(!)
			// it should already be consumed?
			return this.right().consume(this).c();
		};
		
		// p "assign left {left:contrstru}"
		var l = this.left().node();
		var r = this.right();
		
		// We are setting self(!)
		// TODO document functionality
		if (l instanceof Self) {
			var ctx = this.scope__().context();
			l = ctx.reference();
		};
		
		
		if (l instanceof PropertyAccess) {
			var ast = CALL(OP('.',l.left(),l.right().setter()),[this.right()]);
			ast.setReceiver(l.receiver());
			
			if (this.isUsed()) {
				// p "Assign is used {stack}"
				// dont cache it again if it is already cached(!)
				if (!this.right().cachevar()) { this.right().cache({pool: 'val',uses: 1}) }; // 
				// this is only when used.. should be more clever about it
				ast = new Parens(blk__([ast,this.right()]));
			};
			
			// should check the up-value no?
			return ast.c({expression: true});
		};
		
		// if l isa VarReference
		// 	p "assign var-ref"
		// 	l.@variable.assigned(r)
		
		// FIXME -- does not always need to be an expression?
		var out = ("" + (l.c()) + " " + this.op() + " " + (this.right().c({expression: true})));
		
		return out;
	};
	
	// FIXME op is a token? _FIX_
	// this (and similar cases) is broken when called from
	// another position in the stack, since 'up' is dynamic
	// should maybe freeze up?
	Assign.prototype.shouldParenthesize = function (par){
		if(par === undefined) par = this.up();
		return (par instanceof Op) && par.op() != '=';
	};
	
	Assign.prototype.consume = function (node){
		if (this.isExpressable()) {
			this.forceExpression();
			return Assign.__super__.consume.call(this,node);
		};
		
		var ast = this.right().consume(this);
		return ast.consume(node);
	};
	
	// more workaround during transition away from a,b,c = 1,2,3 style assign
	Assign.prototype.addExpression = function (expr){
		var typ = ExpressionBlock;
		if (this._left && (this._left instanceof VarReference)) {
			typ = VarBlock;
		};
		// might be better to nest this up after parsing is done?
		// p "Assign.addExpression {self} <- {expr}"
		var node = new typ([this]);
		return node.addExpression(expr);
	};
	
	
	function PushAssign(){ Assign.apply(this,arguments) };
	
	subclass$(PushAssign,Assign);
	exports.PushAssign = PushAssign; // export class 
	PushAssign.prototype.js = function (o){
		return "" + (this.left().c()) + ".push(" + (this.right().c()) + ")";
	};
	
	PushAssign.prototype.consume = function (node){
		return this;
	};
	
	
	function ConditionalAssign(){ Assign.apply(this,arguments) };
	
	subclass$(ConditionalAssign,Assign);
	exports.ConditionalAssign = ConditionalAssign; // export class 
	ConditionalAssign.prototype.consume = function (node){
		return this.normalize().consume(node);
	};
	
	ConditionalAssign.prototype.normalize = function (){
		var l = this.left().node();
		var ls = l;
		
		if (l instanceof Access) {
			// p "conditional-assign {l} {l.left} {l.right}"
			if (l.left()) {
				// p "cache l.left {l.left:constructor}̋"
				l.left().cache();
			};
			ls = l.clone(l.left(),l.right()); // this should still be cached?
			if (l instanceof PropertyAccess) { l.cache() }; // correct now, to a certain degree
			if (l instanceof IndexAccess) {
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
		if (expr && this.op() == '||=') {
			ast = OP('||',l,OP('=',ls,this.right()));
		} else if (expr && this.op() == '&&=') {
			ast = OP('&&',l,OP('=',ls,this.right()));
		} else {
			ast = IF(this.condition(),OP('=',ls,this.right()),l); // do we need a scope for these?
			ast.setScope(null);
			// drop the scope
			// touch scope -- should probably visit the whole thing?
			// ast.scope.visit
		};
		if (ast.isExpressable()) { ast.toExpression() };
		return ast;
	};
	
	
	ConditionalAssign.prototype.c = function (){
		// WARN what if we return the same?
		return this.normalize().c();
	};
	
	ConditionalAssign.prototype.condition = function (){
		
		// use switch instead to cache op access
		if (this.op() == '?=') {
			return OP('==',this.left(),NULL);
		} else if (this.op() == '||=') {
			return OP('!',this.left());
		} else if (this.op() == '&&=') {
			return this.left();
		} else if (this.op() == '!?=') {
			return OP('!=',this.left(),NULL);
		} else {
			return this.left();
		};
	};
	
	ConditionalAssign.prototype.js = function (o){
		// p "ConditionalAssign.js".red
		var ast = IF(this.condition(),OP('=',this.left(),this.right()),this.left());
		ast.setScope(null); // not sure about this
		if (ast.isExpressable()) { ast.toExpression() }; // forced expression already
		return ast.c();
	};
	
	function CompoundAssign(){ Assign.apply(this,arguments) };
	
	subclass$(CompoundAssign,Assign);
	exports.CompoundAssign = CompoundAssign; // export class 
	CompoundAssign.prototype.consume = function (node){
		if (this.isExpressable()) { return CompoundAssign.__super__.consume.apply(this,arguments) };
		
		var ast = this.normalize();
		if (ast != this) { return ast.consume(node) };
		
		ast = this.right().consume(this);
		return ast.consume(node);
	};
	
	CompoundAssign.prototype.normalize = function (){
		var ln = this.left().node();
		// we dont need to change this at all
		if (!((ln instanceof PropertyAccess))) {
			return this;
		};
		
		if (ln instanceof Access) {
			// left might be zero?!?!
			if (ln.left()) { ln.left().cache() };
		};
		// TODO FIXME we want to cache the context of the assignment
		// p "normalize compound assign {left}"
		var ast = OP('=',this.left(),OP(this.op()[0],this.left(),this.right()));
		if (ast.isExpressable()) { ast.toExpression() };
		
		return ast;
	};
	
	CompoundAssign.prototype.c = function (){
		var ast = this.normalize();
		if (ast == this) { return CompoundAssign.__super__.c.apply(this,arguments) };
		
		// otherwise it is important that we actually replace this node in the outer block
		// whenever we normalize and override c it is important that we can pass on caching
		// etc -- otherwise there WILL be issues.
		var up = STACK.current();
		if (up instanceof Block) {
			// p "parent is block, should replace!"
			// an alternative would be to just pass
			up.replace(this,ast);
		};
		return ast.c();
	};
	
	
	function AsyncAssign(){ Assign.apply(this,arguments) };
	
	subclass$(AsyncAssign,Assign);
	exports.AsyncAssign = AsyncAssign; // export class 
	
	
	
	function TupleAssign(a,b,c){
		this._traversed = false;
		this._op = a;
		this._left = b;
		this._right = c;
		this._temporary = [];
	};
	
	subclass$(TupleAssign,Assign);
	exports.TupleAssign = TupleAssign; // export class 
	
	TupleAssign.prototype.__op = {name: 'op'};
	TupleAssign.prototype.op = function(v){ return this._op; }
	TupleAssign.prototype.setOp = function(v){ this._op = v; return this; };
	
	TupleAssign.prototype.__left = {name: 'left'};
	TupleAssign.prototype.left = function(v){ return this._left; }
	TupleAssign.prototype.setLeft = function(v){ this._left = v; return this; };
	
	TupleAssign.prototype.__right = {name: 'right'};
	TupleAssign.prototype.right = function(v){ return this._right; }
	TupleAssign.prototype.setRight = function(v){ this._right = v; return this; };
	
	TupleAssign.prototype.__type = {name: 'type'};
	TupleAssign.prototype.type = function(v){ return this._type; }
	TupleAssign.prototype.setType = function(v){ this._type = v; return this; };
	
	TupleAssign.prototype.isExpressable = function (){
		return this.right().isExpressable();
	};
	
	TupleAssign.prototype.addExpression = function (expr){
		if (this.right() instanceof Tuple) {
			this.right().push(expr);
		} else {
			// p "making child become a tuple?"
			this.setRight(new Tuple([this.right(),expr]));
		};
		
		return this;
	};
	
	TupleAssign.prototype.visit = function (){
		// if the first left-value is a var-reference, then
		// all the variables should be declared as variables.
		// but if we have complex items in the other list - it does become much harder
		
		// if the first is a var-reference, they should all be(!) .. or splats?
		// this is really a hacky wao to do it though
		if (this.left().first().node() instanceof VarReference) {
			this.setType('var');
			// should possibly allow real vars as well, no?
			this._vars = this.left().nodes().filter(function(n) { return n instanceof VarReference; });
			// collect the vars for tuple for easy access
			
			// NOTE can improve.. should rather make the whole left be a VarBlock or TupleVarBlock
			// p "type is var -- skip the rest"
		};
		
		this.right().traverse();
		this.left().traverse();
		return this;
	};
	
	TupleAssign.prototype.js = function (o){
		// only for actual inner expressions, otherwise cache the whole array, no?
		var self=this;
		if (!self.right().isExpressable()) {
			// p "TupleAssign.consume! {right}".blue
			
			return self.right().consume(self).c();
		};
		
		// p "TUPLE {type}"
		
		/* a,b,c = arguments */
		
		// - direct. no matter if lvalues are variables or not. Make fake arguments up to the same count as tuple
		
		/* a,*b,b = arguments */
		
		// Need to convert arguments to an array. IF arguments is not referenced anywhere else in scope, 
		// we can do the assignment directly while rolling through arguments
		
		/* a,b = b,a */
		
		// ideally we only need to cache the first value (or n - 1), assign directly when possible.
		
		/* a,b,c = (method | expression) */
		
		// convert res into array, assign from array. Can cache the variable when assigning first value
		
		// First we need to find out whether we are required to store the result in an array before assigning
		// If this needs to be an expression (returns?, we need to fall back to the CS-wa)
		
		var ast = new Block([]);
		var lft = self.left();
		var rgt = self.right();
		var typ = self.type();
		var via = null;
		
		var li = 0;
		var ri = lft.count();
		var llen = ri;
		
		
		// if @vars
		// 	p "tuple has {@vars:length} vars"
		
		// if we have a splat on the left it is much more likely that we need to store right
		// in a temporary array, but if the right side has a known length, it should still not be needed
		var lsplat = lft.filter(function(v) { return v instanceof Splat; })[0];
		
		// if right is an array without any splats (or inner tuples?), normalize it to tuple
		if ((rgt instanceof Arr) && !rgt.splat()) { rgt = new Tuple(rgt.nodes()) };
		var rlen = rgt instanceof Tuple ? (rgt.count()) : (null);
		
		// if any values are statements we need to handle this before continuing
		
		/* a,b,c = 10,20,ary */
		
		// ideally we only need to cache the first value (or n - 1), assign directly when possible.
		// only if the variables are not predefined or predeclared can be we certain that we can do it without caching
		// if rlen && typ == 'var' && !lsplat
		// 	# this can be dangerous in edgecases that are very hard to detect
		// 	# if it becomes an issue, fall back to simpler versions
		// 	# does not even matter if there is a splat?
		
		// special case for arguments(!)
		if (!lsplat && rgt == ARGUMENTS) {
			
			var pars = self.scope__().params();
			// p "special case with arguments {pars}"
			// forcing the arguments to be named
			// p "got here??? {pars}"
			lft.map(function(l,i) { return ast.push(OP('=',l.node(),pars.at(i,true).visit().variable())); }); // s.params.at(value - 1,yes)
		} else if (rlen) {
			// we have several items in the right part. what about splats here?
			
			// pre-evaluate rvalues that might be reference from other assignments
			// we need to check if the rightside values has no side-effects. Cause if
			// they dont, we really do not need temporary variables.
			
			// some of these optimizations are quite petty - makes things more complicated
			// in the compiler only to get around adding a few temp-variables here and there
			
			// var firstUnsafe = 0
			// lft.map do |v,i|
			// 	if v isa VarReference
			// 		p "left side {i} {v} {v.refnr}"
			
			// rgt.map do |v,i|
			// 	if v.hasSideEffects
			// 		# return if i == 0 or !v.hasSideEffects
			// 		# return if v isa Num || v isa Str || i == 0
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
			
			var pairs = lft.map(function(l,i) {
				var v = null;
				// determine if this needs to be precached?
				// if l isa VarReference
				// 	# this is the first time the variable is referenced
				// 	# should also count even if it is predeclared at the top
				// 	if l.refnr == 0
				
				if (l == lsplat) {
					v = new ArgList([]);
					var to = (rlen - (ri - i));
					// p "assing splat at index {i} to slice {li} - {to}".cyan
					while (li <= to){
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
			
			pairs.map(function(v,i) {
				var l = v[0];
				var r = v[1];
				
				if (clean) {
					if ((l instanceof VarReference) && l.refnr() == 0) {
						// still clean
						clean = true;
					} else {
						clean = false;
						// p "now cache"
						pairs.slice(i).map(function(part) {
							if (part[1].hasSideEffects()) {
								self._temporary.push(part[1]); // need a generalized way to do this type of thing
								return ast.push(part[1].cache({force: true,pool: 'swap',declared: typ == 'var'}));
							};
						});
						// p "from {i} - cache all remaining with side-effects"
					};
				};
				
				// if the previous value in ast is a reference to our value - the caching was not needed
				if (ast.last() == r) {
					r.decache();
					// p "was cached - not needed"
					// simple assign
					return ast.replace(r,OP('=',l,r));
				} else {
					return ast.push(OP('=',l,r));
				};
			});
			
			// WARN FIXME Is there not an issue with VarBlock vs not here?
		} else {
			// this is where we need to cache the right side before assigning
			// if the right side is a for loop, we COULD try to be extra clever, but
			// for now it is not worth the added compiler complexity
			
			// iter.cache(force: yes, type: 'iter')
			var top = new VarBlock();
			var iter = self.util().iterable(rgt,true);
			// could set the vars inside -- most likely
			ast.push(top);
			top.push(iter);
			
			if (lsplat) {
				var len = self.util().len(iter,true);
				var idx = self.util().counter(0,true);
				// cache the length of the array
				top.push(len); // preassign the length
				// cache counter to loop through
				top.push(idx);
			};
			
			// only if the block is variable based, no?
			// ast.push(blk = VarBlock.new)
			// blk = null
			
			var blktype = typ == 'var' ? (VarBlock) : (Block);
			var blk = new blktype([]);
			// blk = top if typ == 'var'
			ast.push(blk);
			
			// if the lvals are not variables - we need to preassign
			// can also use slice here for simplicity, but try with while now			
			lft.map(function(l,i) {
				if (l == lsplat) {
					var lvar = l.node();
					var rem = llen - i - 1; // remaining after splat
					
					if (typ != 'var') {
						var arr = self.util().array(OP('-',len,num__(i + rem)),true);
						top.push(arr);
						lvar = arr.cachevar();
					} else {
						if (!blk) { ast.push(blk = new blktype()) };
						arr = self.util().array(OP('-',len,num__(i + rem)));
						blk.push(OP('=',lvar,arr));
					};
					
					// if !lvar:variable || !lvar.variable # lvar = 
					// 	top.push()
					//	p "has variable - no need to create a temp"
					// blk.push(OP('=',lvar,Arr.new([]))) # dont precalculate size now
					// max = to = (rlen - (llen - i))
					
					
					var test = rem ? (OP('-',len,rem)) : (len);
					
					var set = OP('=',OP('.',lvar,OP('-',idx,num__(i))),
					OP('.',iter,OP('++',idx)));
					
					ast.push(WHILE(OP('<',idx,test),set));
					
					if (typ != 'var') {
						ast.push(blk = new Block());
						return blk.push(OP('=',l.node(),lvar));
					} else {
						return blk = null;
					};
					
					// not if splat was last?
					// ast.push(blk = VarBlock.new)
				} else if (lsplat) {
					if (!blk) { ast.push(blk = new blktype()) };
					// we could cache the raw code of this node for better performance
					return blk.push(OP('=',l,OP('.',iter,OP('++',idx))));
				} else {
					if (!blk) { ast.push(blk = new blktype()) };
					return blk.push(OP('=',l,OP('.',iter,num__(i))));
				};
			});
		};
		
		// if we are in an expression we really need to 
		if (o.isExpression() && self._vars) {
			// p "tuple is expression" # variables MUST be autodeclared outside of the expression
			for (var i=0, ary=iter$(self._vars), len_=ary.length; i < len_; i++) {
				ary[i].variable().autodeclare();
			};
		} else if (self._vars) {
			for (var i=0, ary=iter$(self._vars), len_=ary.length; i < len_; i++) {
				// p "predeclare variable before compilation"
				ary[i].variable().predeclared();
			};
		};
		
		// is there any reason to make it into an expression?
		if (ast.isExpressable()) { // NO!
			// p "express"
			// if this is an expression
			var out = ast.c({expression: true});
			if (typ && !o.isExpression()) { out = ("" + typ + " " + out) }; // not in expression
			return out;
		} else {
			out = ast.c();
			// if this is a varblock 
			return out;
		};
	};
	
	
	TupleAssign.prototype.c = function (o){
		var out = TupleAssign.__super__.c.call(this,o);
		// this is only used in tuple -- better to let the tuple hav a separate #c
		if (this._temporary && this._temporary.length) {
			this._temporary.map(function(temp) { return temp.decache(); });
		};
		return out;
	};
	
	
	
	// IDENTIFIERS
	
	// really need to clean this up
	// Drop the token?
	function Identifier(value){
		this._value = this.load(value);
		this._symbol = null;
		this._setter = null;
		
		if (("" + value).indexOf("?") >= 0) {
			this._safechain = true;
		};
		// @safechain = ("" + value).indexOf("?") >= 0
		this;
	};
	
	subclass$(Identifier,Node);
	exports.Identifier = Identifier; // export class 
	
	Identifier.prototype.__safechain = {name: 'safechain'};
	Identifier.prototype.safechain = function(v){ return this._safechain; }
	Identifier.prototype.setSafechain = function(v){ this._safechain = v; return this; };
	
	Identifier.prototype.__value = {name: 'value'};
	Identifier.prototype.value = function(v){ return this._value; }
	Identifier.prototype.setValue = function(v){ this._value = v; return this; };
	
	Identifier.prototype.references = function (variable){
		if (this._value) { this._value._variable = variable };
		return this;
	};
	
	Identifier.prototype.load = function (v){
		return (v instanceof Identifier ? (v.value()) : (v));
	};
	
	Identifier.prototype.traverse = function (){
		// NODES.push(self)
		return this;
	};
	
	Identifier.prototype.visit = function (){
		
		if (this._value instanceof Node) {
			// console.log "IDENTIFIER VALUE IS NODE"
			this._value.traverse();
		};
		return this;
	};
	
	Identifier.prototype.region = function (){
		return [this._value._loc,this._value._loc + this._value._len];
	};
	
	Identifier.prototype.isValidIdentifier = function (){
		return true;
	};
	
	Identifier.prototype.isReserved = function (){
		return this._value.reserved || RESERVED_TEST.test(String(this._value));
	};
	
	Identifier.prototype.symbol = function (){
		// console.log "Identifier#symbol {value}"
		return this._symbol || (this._symbol = sym__(this.value()));
	};
	
	Identifier.prototype.setter = function (){
		// console.log "Identifier#setter"
		return this._setter || (this._setter = new Identifier(("set-" + (this.value().c()))));
	};
	
	Identifier.prototype.toString = function (){
		return String(this._value);
	};
	
	Identifier.prototype.alias = function (){
		return sym__(this._value);
	};
	
	Identifier.prototype.js = function (o){
		return this.symbol();
	};
	
	Identifier.prototype.c = function (){
		return this.symbol();
	};
	
	Identifier.prototype.dump = function (){
		return {loc: this.region()};
	};
	
	
	function TagId(v){
		this._value = v instanceof Identifier ? (v.value()) : (v);
		this;
	};
	
	subclass$(TagId,Identifier);
	exports.TagId = TagId; // export class 
	TagId.prototype.c = function (){
		return "id$('" + (this.value().c()) + "')";
	};
	
	// This is not an identifier - it is really a string
	// Is this not a literal?
	
	// FIXME Rename to IvarLiteral? or simply Literal with type Ivar
	function Ivar(v){
		this._value = v instanceof Identifier ? (v.value()) : (v);
		this;
	};
	
	subclass$(Ivar,Identifier);
	exports.Ivar = Ivar; // export class 
	Ivar.prototype.name = function (){
		return helpers.camelCase(this._value).replace(/^@/,'');
		// value.c.camelCase.replace(/^@/,'')
	};
	
	Ivar.prototype.alias = function (){
		return '_' + this.name();
	};
	
	// the @ should possibly be gone from the start?
	Ivar.prototype.js = function (o){
		return '_' + this.name();
	};
	
	Ivar.prototype.c = function (){
		return '_' + helpers.camelCase(this._value).slice(1); // .replace(/^@/,'')
	};
	
	// Ambiguous - We need to be consistent about Const vs ConstAccess
	// Becomes more important when we implement typeinference and code-analysis
	function Const(){ Identifier.apply(this,arguments) };
	
	subclass$(Const,Identifier);
	exports.Const = Const; // export class 
	Const.prototype.symbol = function (){
		// console.log "Identifier#symbol {value}"
		return this._symbol || (this._symbol = sym__(this.value()));
	};
	
	Const.prototype.js = function (o){
		return this.symbol();
	};
	
	Const.prototype.c = function (){
		return this.symbol();
	};
	
	function TagTypeIdentifier(value){
		this._value = this.load(value);
		this;
	};
	
	subclass$(TagTypeIdentifier,Identifier);
	exports.TagTypeIdentifier = TagTypeIdentifier; // export class 
	
	TagTypeIdentifier.prototype.__name = {name: 'name'};
	TagTypeIdentifier.prototype.name = function(v){ return this._name; }
	TagTypeIdentifier.prototype.setName = function(v){ this._name = v; return this; };
	
	TagTypeIdentifier.prototype.__ns = {name: 'ns'};
	TagTypeIdentifier.prototype.ns = function(v){ return this._ns; }
	TagTypeIdentifier.prototype.setNs = function(v){ this._ns = v; return this; };
	
	TagTypeIdentifier.prototype.load = function (val){
		this._str = ("" + val);
		var parts = this._str.split(":");
		this._raw = val;
		this._name = parts.pop();
		this._ns = parts.shift(); // if any?
		return this._str;
	};
	
	TagTypeIdentifier.prototype.js = function (o){
		// p "tagtypeidentifier.js {self}"
		return ("IMBA_TAGS." + (this._str.replace(":","$")));
	};
	
	TagTypeIdentifier.prototype.c = function (){
		return this.js();
	};
	
	TagTypeIdentifier.prototype.func = function (){
		var name = this._name.replace(/-/g,'_').replace(/\#/,'');
		if (this._ns) { name += ("$" + (this._ns.toLowerCase())) };
		return name;
	};
	
	TagTypeIdentifier.prototype.id = function (){
		var m = this._str.match(/\#([\w\-\d\_]+)\b/);
		return m ? (m[1]) : (null);
	};
	
	
	TagTypeIdentifier.prototype.flag = function (){
		return "_" + this.name().replace(/--/g,'_').toLowerCase();
	};
	
	TagTypeIdentifier.prototype.sel = function (){
		return "." + this.flag(); // + name.replace(/-/g,'_').toLowerCase
	};
	
	TagTypeIdentifier.prototype.string = function (){
		return this.value();
	};
	
	
	function Argvar(){ ValueNode.apply(this,arguments) };
	
	subclass$(Argvar,ValueNode);
	exports.Argvar = Argvar; // export class 
	Argvar.prototype.c = function (){
		// NEXT -- global.parseInt or Number.parseInt (better)
		var v = parseInt(String(this.value()));
		// FIXME Not needed anymore? I think the lexer handles this
		if (v == 0) { return "arguments" };
		
		var s = this.scope__();
		// params need to go up to the closeste method-scope
		var par = s.params().at(v - 1,true);
		return "" + (c__(par.name())); // c
	};
	
	
	// CALL
	
	function Call(callee,args,opexists){
		this._traversed = false;
		this._expression = false;
		this._parens = false;
		this._cache = null;
		this._receiver = null;
		this._opexists = opexists;
		// some axioms that share the same syntax as calls will be redirected from here
		
		if (callee instanceof VarOrAccess) {
			var str = callee.value().symbol();
			// p "Call callee {callee} - {str}"
			if (str == 'extern') {
				// p "returning extern instead!"
				callee.value().value()._type = 'EXTERN';
				return new ExternDeclaration(args);
			};
			if (str == 'tag') {
				// console.log "ERROR - access args by some method"
				return new TagWrapper(args && args.index ? (args.index(0)) : (args[0]));
			};
			if (str == 'export') {
				return new ExportStatement(args);
			};
		};
		
		this._callee = callee;
		this._args = args || new ArgList([]);
		
		if (args instanceof Array) {
			this._args = new ArgList(args);
			// console.log "ARGUMENTS IS ARRAY - error {args}"
		};
		// p "call opexists {opexists}"
		this;
	};
	
	subclass$(Call,Node);
	exports.Call = Call; // export class 
	
	Call.prototype.__callee = {name: 'callee'};
	Call.prototype.callee = function(v){ return this._callee; }
	Call.prototype.setCallee = function(v){ this._callee = v; return this; };
	
	Call.prototype.__receiver = {name: 'receiver'};
	Call.prototype.receiver = function(v){ return this._receiver; }
	Call.prototype.setReceiver = function(v){ this._receiver = v; return this; };
	
	Call.prototype.__args = {name: 'args'};
	Call.prototype.args = function(v){ return this._args; }
	Call.prototype.setArgs = function(v){ this._args = v; return this; };
	
	Call.prototype.__block = {name: 'block'};
	Call.prototype.block = function(v){ return this._block; }
	Call.prototype.setBlock = function(v){ this._block = v; return this; };
	
	Call.prototype.visit = function (){
		// console.log "visit args {args}"
		this.args().traverse();
		this.callee().traverse();
		
		// if the callee is a PropertyAccess - better to immediately change it
		
		return this._block && this._block.traverse();
	};
	
	Call.prototype.addBlock = function (block){
		var pos = this._args.filter(function(n,i) { return n == '&'; })[0]; // WOULD BE TOKEN - CAREFUL
		pos ? (this.args().replace(pos,block)) : (this.args().push(block));
		return this;
	};
	
	Call.prototype.receiver = function (){
		return this._receiver || (this._receiver = ((this.callee() instanceof Access) && this.callee().left() || NULL));
	};
	
	// check if all arguments are expressions - otherwise we have an issue
	
	Call.prototype.safechain = function (){
		return this.callee().safechain(); // really?
	};
	
	Call.prototype.js = function (o){
		var opt = {expression: true};
		var rec = null;
		// var args = compact__(args) # really?
		var args = this.args();
		
		// drop this?
		
		var splat = args.some(function(v) { return v instanceof Splat; });
		
		var out = null;
		var lft = null;
		var rgt = null;
		var wrap = null;
		
		var callee = this._callee = this._callee.node(); // drop the var or access?
		
		// if callee isa Call && callee.safechain
		//	yes
		
		if (callee instanceof Access) {
			lft = callee.left();
			rgt = callee.right();
		};
		
		if ((callee instanceof Super) || (callee instanceof SuperAccess)) {
			this._receiver = this.scope__().context();
			// return "supercall"
		};
		
		// never call the property-access directly?
		if (callee instanceof PropertyAccess) { // && rec = callee.receiver
			// p "unwrapping property-access in call"
			this._receiver = callee.receiver();
			callee = this._callee = new Access(callee.op(),callee.left(),callee.right());
			// p "got here? {callee}"
			// console.log "unwrapping the propertyAccess"
		};
		
		if (callee.safechain()) {
			// p "callee is safechained?!?"
			// if lft isa Call
			// if lft isa Call # could be a property access as well - it is the same?
			// if it is a local var access we simply check if it is a function, then call
			// but it should be safechained outside as well?
			// lft.cache if lft
			// the outer safechain should not cache the whole call - only ask to cache
			// the result? -- chain onto
			// p "Call safechain {callee} {lft}.{rgt}"
			var isfn = new Util.IsFunction([callee]);
			wrap = [("" + (isfn.c()) + "  &&  "),""];
			callee = OP('.',callee.left(),callee.right());
			// callee should already be cached now - 
		};
		
		// should just force expression from the start, no?
		if (splat) {
			// important to wrap the single value in a value, to keep implicit call
			// this is due to the way we check for an outer Call without checking if
			// we are the receiver (in PropertyAccess). Should rather wrap in CallArguments
			var ary = (args.count() == 1 ? (new ValueNode(args.first().value())) : (new Arr(args.list())));
			this.receiver().cache(); // need to cache the target
			out = ("" + (callee.c({expression: true})) + ".apply(" + (this.receiver().c()) + "," + (ary.c({expression: true})) + ")");
		} else if (this._receiver) {
			// quick workaround
			if (!((this._receiver instanceof ScopeContext))) { this._receiver.cache() };
			args.unshift(this.receiver());
			// should rather rewrite to a new call?
			out = ("" + (callee.c({expression: true})) + ".call(" + (args.c({expression: true})) + ")");
		} else {
			out = ("" + (callee.c({expression: true})) + "(" + (args.c({expression: true})) + ")");
		};
		
		if (wrap) {
			// we set the cachevar inside
			// p "special caching for call"
			if (this._cache) {
				this._cache.manual = true;
				out = ("(" + (this.cachevar().c()) + "=" + out + ")");
			};
			
			out = [wrap[0],out,wrap[1]].join("");
		};
		
		return out;
	};
	
	
	
	
	function ImplicitCall(){ Call.apply(this,arguments) };
	
	subclass$(ImplicitCall,Call);
	exports.ImplicitCall = ImplicitCall; // export class 
	ImplicitCall.prototype.js = function (o){
		return "" + (this.callee().c()) + "()";
	};
	
	function New(){ Call.apply(this,arguments) };
	
	subclass$(New,Call);
	exports.New = New; // export class 
	New.prototype.js = function (o){
		// 
		var out = ("new " + (this.callee().c()));
		if (!((o.parent() instanceof Call))) { out += '()' };
		return out;
	};
	
	function SuperCall(){ Call.apply(this,arguments) };
	
	subclass$(SuperCall,Call);
	exports.SuperCall = SuperCall; // export class 
	SuperCall.prototype.js = function (o){
		var m = o.method();
		this.setReceiver(SELF);
		this.setCallee(("" + (m.target().c()) + ".super$.prototype." + (m.name().c())));
		return SuperCall.__super__.js.apply(this,arguments);
	};
	
	
	
	function ExternDeclaration(){ ListNode.apply(this,arguments) };
	
	subclass$(ExternDeclaration,ListNode);
	exports.ExternDeclaration = ExternDeclaration; // export class 
	ExternDeclaration.prototype.visit = function (){
		
		// p "visiting externdeclaration"
		this.setNodes(this.map(function(item) { return item.node(); })); // drop var or access really
		// only in global scope?
		var root = this.scope__();
		for (var i=0, ary=iter$(this.nodes()), len=ary.length, item; i < len; i++) {
			item = ary[i];
			var variable = root.register(item.symbol(),item,{type: 'global'});
			variable.addReference(item);
		};
		return this;
	};
	
	ExternDeclaration.prototype.c = function (){
		return "// externs";
	};
	
	
	// FLOW
	
	function ControlFlow(){ Node.apply(this,arguments) };
	
	subclass$(ControlFlow,Node);
	exports.ControlFlow = ControlFlow; // export class 
	
	
	
	
	function ControlFlowStatement(){ ControlFlow.apply(this,arguments) };
	
	subclass$(ControlFlowStatement,ControlFlow);
	exports.ControlFlowStatement = ControlFlowStatement; // export class 
	ControlFlowStatement.prototype.isExpressable = function (){
		return false;
	};
	
	
	
	function If(cond,body,o){
		if(o === undefined) o = {};
		this.setup();
		this._test = cond; // (o:type == 'unless' ? UnaryOp.new('!',cond,null) : cond)
		this._body = body;
		this._alt = null;
		this._type = o.type;
		if (this._type == 'unless') this.invert();
		this._scope = new IfScope(this);
		this;
	};
	
	subclass$(If,ControlFlow);
	exports.If = If; // export class 
	
	If.prototype.__test = {name: 'test'};
	If.prototype.test = function(v){ return this._test; }
	If.prototype.setTest = function(v){ this._test = v; return this; };
	
	If.prototype.__body = {name: 'body'};
	If.prototype.body = function(v){ return this._body; }
	If.prototype.setBody = function(v){ this._body = v; return this; };
	
	If.prototype.__alt = {name: 'alt'};
	If.prototype.alt = function(v){ return this._alt; }
	If.prototype.setAlt = function(v){ this._alt = v; return this; };
	
	If.prototype.__scope = {name: 'scope'};
	If.prototype.scope = function(v){ return this._scope; }
	If.prototype.setScope = function(v){ this._scope = v; return this; };
	
	If.ternary = function (cond,body,alt){
		// prefer to compile it this way as well
		var obj = new If(cond,new Block([body]),{type: '?'});
		obj.addElse(new Block([alt]));
		return obj;
	};
	
	If.prototype.addElse = function (add){
		// p "add else!",add
		if (this.alt() && (this.alt() instanceof If)) {
			// p 'add to the inner else(!)',add
			this.alt().addElse(add);
		} else {
			this.setAlt(add);
		};
		return this;
	};
	
	
	If.prototype.invert = function (){
		if (this._test instanceof ComparisonOp) {
			return this._test = this._test.invert();
		} else {
			return this._test = new UnaryOp('!',this._test,null);
		};
	};
	
	If.prototype.visit = function (){
		var alt = this.alt();
		
		if (this._scope) { this._scope.visit() };
		if (this.test()) { this.test().traverse() };
		if (this.body()) { this.body().traverse() };
		
		// should skip the scope in alt.
		if (alt) {
			// p "scoping {STACK.scopes:length}"
			STACK.pop(this);
			alt._scope || (alt._scope = new BlockScope(alt));
			alt.traverse();
			STACK.push(this);
			
			// if alt isa If
			// 	# alt.@scope.visit if alt.@scope
			// 	true
			// else
			// 	
			// 	p "else-block isa {alt}"
			
			// popping ourselves from stack while we
			// traverse the alternate route
		};
		
		// force it as expression?
		if (this._type == '?' && this.isExpressable()) this.toExpression();
		return this;
	};
	
	
	If.prototype.js = function (o){
		var body = this.body();
		// would possibly want to look up / out 
		var brace = {braces: true,indent: true};
		
		var cond = this.test().c({expression: true}); // the condition is always an expression
		
		if (o.isExpression()) {
			var code = body.c(); // (braces: yes)
			code = '(' + code + ')'; // if code.indexOf(',') >= 0
			// is expression!
			if (this.alt()) {
				// console.log "type of ternary {test}"
				// be safe - wrap condition as well
				// ask for parens
				return ("" + cond + " ? " + code + " : (" + (this.alt().c()) + ")");
			} else {
				// again - we need a better way to decide what needs parens
				// maybe better if we rewrite this to an OP('&&'), and put
				// the parens logic there
				// cond should possibly have parens - but where do we decide?
				return ("(" + cond + ") && " + code);
			};
		} else {
			// if there is only a single item - and it is an expression?
			code = null;
			// if body.count == 1 # dont indent by ourselves?
			
			if ((body instanceof Block) && body.count() == 1) {
				body = body.first();
			};
			
			// if body.count == 1
			//	p "one item only!"
			//	body = body.first
			
			code = body.c({braces: true}); // (braces: yes)
			// don't wrap if it is only a single expression?
			var out = ("if (" + cond + ") ") + code; // ' {' + code + '}' # '{' + code + '}'
			if (this.alt()) { out += (" else " + (this.alt().c(this.alt() instanceof If ? ({}) : (brace)))) };
			return out;
		};
	};
	
	
	If.prototype.consume = function (node){
		// p 'assignify if?!'
		// if it is possible, convert into expression
		if (node instanceof TagTree) {
			this._body = this._body.consume(node);
			if (this._alt) { this._alt = this._alt.consume(node) };
			return this;
		};
		
		// special case for If created from conditional assign as well?
		// @type == '?' and 
		// ideally we dont really want to make any expression like this by default
		var isRet = (node instanceof Return);
		
		// might have been forced to expression already
		// if it was originally a ternary - why not
		if (this._expression || ((!isRet || this._type == '?') && this.isExpressable())) {
			this.toExpression(); // mark as expression(!) - is this needed?
			return If.__super__.consume.call(this,node);
		} else {
			this._body = this._body.consume(node);
			if (this._alt) { this._alt = this._alt.consume(node) };
		};
		return this;
	};
	
	
	If.prototype.isExpressable = function (){
		// process:stdout.write 'x'
		var exp = this.body().isExpressable() && (!(this.alt()) || this.alt().isExpressable());
		return exp;
	};
	
	
	
	function Loop(options){
		if(options === undefined) options = {};
		this._traversed = false;
		this._options = options;
		this._body = null;
		this;
	};
	
	
	subclass$(Loop,Statement);
	exports.Loop = Loop; // export class 
	
	Loop.prototype.__scope = {name: 'scope'};
	Loop.prototype.scope = function(v){ return this._scope; }
	Loop.prototype.setScope = function(v){ this._scope = v; return this; };
	
	Loop.prototype.__options = {name: 'options'};
	Loop.prototype.options = function(v){ return this._options; }
	Loop.prototype.setOptions = function(v){ this._options = v; return this; };
	
	Loop.prototype.__body = {name: 'body'};
	Loop.prototype.body = function(v){ return this._body; }
	Loop.prototype.setBody = function(v){ this._body = v; return this; };
	
	Loop.prototype.__catcher = {name: 'catcher'};
	Loop.prototype.catcher = function(v){ return this._catcher; }
	Loop.prototype.setCatcher = function(v){ this._catcher = v; return this; };
	
	
	Loop.prototype.set = function (obj){
		// p "configure for!"
		this._options || (this._options = {});
		var keys = Object.keys(obj);
		for (var i=0, ary=iter$(keys), len=ary.length, k; i < len; i++) {
			k = ary[i];
			this._options[k] = obj[k];
		};
		return this;
	};
	
	
	Loop.prototype.addBody = function (body){
		this.setBody(blk__(body));
		return this;
	};
	
	
	Loop.prototype.c = function (o){
		
		var s = this.stack();
		var curr = s.current();
		// p "Loop.c - {isExpressable} {stack} {stack.isExpression}"
		// p "stack is expression? {o} {isExpression}"
		
		
		
		if (this.stack().isExpression() || this.isExpression()) {
			// p "the stack is an expression for loop now(!)"
			// what the inner one should not be an expression though?
			// this will resut in an infinite loop, no?!?
			var ast = CALL(FN([],[this]),[]);
			return ast.c(o);
		} else if ((this.stack().current() instanceof Block) || ((s.up() instanceof Block) && s.current()._consumer == this)) {
			
			// p "what is the current stack of loop? {stack.current}"
			return Loop.__super__.c.call(this,o);
		} else {
			// p "Should never get here?!?"
			ast = CALL(FN([],[this]),[]);
			return ast.c(o);
			// need to wrap in function
		};
	};
	
	
	
	function While(test,opts){
		this._traversed = false;
		this._test = test;
		this._options = opts || {};
		this._scope = new WhileScope(this);
		// set(opts) if opts
		// p "invert test for while? {@test}"
		if (this.option('invert')) {
			// "invert test for while {@test}"
			this._test = test.invert();
		};
		// invert the test
	};
	
	
	subclass$(While,Loop);
	exports.While = While; // export class 
	
	While.prototype.__test = {name: 'test'};
	While.prototype.test = function(v){ return this._test; }
	While.prototype.setTest = function(v){ this._test = v; return this; };
	
	
	While.prototype.visit = function (){
		this.scope().visit();
		if (this.test()) { this.test().traverse() };
		if (this.body()) { return this.body().traverse() };
	};
	
	
	// TODO BUG -- when we declare a var like: while var y = ...
	// the variable will be declared in the WhileScope which never
	// force-declares the inner variables in the scope
	
	While.prototype.consume = function (node){
		// p "While.consume {node}".cyan
		// This is never expressable, but at some point
		// we might want to wrap it in a function (like CS)
		if (this.isExpressable()) { return While.__super__.consume.apply(this,arguments) };
		
		if (node instanceof TagTree) {
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
		// 	resvar = scope.declare(node.left.node.variable,Arr.new([]),proxy: yes)
		// 	node = null
		// 	p "consume variable declarator!?".cyan
		// else
		// declare the variable we will use to soak up results
		// p "Creating value to store the result of loop".cyan
		// TODO Use a special vartype for this?
		var resvar = this.scope().declare('res',new Arr([]),{system: true});
		// WHAT -- fix this --
		this._catcher = new PushAssign("push",resvar,null); // the value is not preset # what
		this.body().consume(this._catcher); // should still return the same body
		
		// scope vars must not be compiled before this -- this is important
		var ast = new Block([this,resvar.accessor()]); // should be varaccess instead?
		return ast.consume(node);
		// NOTE Here we can find a way to know wheter or not we even need to 
		// return the resvar. Often it will not be needed
		// FIXME what happens if there is no node?!?
	};
	
	
	While.prototype.js = function (o){
		var out = ("while (" + (this.test().c({expression: true})) + ")") + this.body().c({braces: true,indent: true}); // .wrap
		
		if (this.scope().vars().count() > 0) {
			// p "while-block has declared variables(!)"
			return [this.scope().vars().c(),out];
		};
		return out;
	};
	
	
	
	// This should define an open scope
	// should rather 
	function For(o){
		if(o === undefined) o = {};
		this._traversed = false;
		this._options = o;
		this._scope = new ForScope(this);
		this._catcher = null;
	};
	
	subclass$(For,Loop);
	exports.For = For; // export class 
	For.prototype.visit = function (){
		this.scope().visit();
		this.options().source.traverse(); // what about awakening the vars here?
		this.declare();
		// should be able to toggle whether to keep the results here already(!)
		
		// add guard to body
		if (this.options().guard) {
			var op = IF(this.options().guard.invert(),Block.wrap([new ContinueStatement("continue")]));
			this.body().unshift(op,BR);
		};
		
		return this.body().traverse();
	};
	
	For.prototype.isBare = function (src){
		return src && src._variable && src._variable._isArray;
	};
	
	For.prototype.declare = function (){
		var o = this.options();
		var scope = this.scope();
		var src = o.source;
		var vars = o.vars = {};
		var oi = o.index;
		
		var bare = this.isBare(src);
		// p "source is a {src} - {bare}"
		// var i = vars:index = oi ? scope.declare(oi,0) : util.counter(0,yes).predeclare
		
		// what about a range where we also include an index?
		if (src instanceof Range) {
			// p "range for-loop"
			
			// really? declare? 
			// are we sure? _really_?
			vars.len = scope.declare('len',src.right()); // util.len(o,yes).predeclare
			// make the scope be the declarator
			vars.index = scope.register(o.name,scope,{type: 'let',declared: true});
			// p "registered {vars:index:constructor}"
			// p "index-var is declareod?!?! {vars:index.@declared}"
			scope.vars().push(vars.index.assignment(src.left()));
			// scope.declare(options:name,src.left)
			vars.value = vars.index;
		} else {
			// vars:value = scope.declare(options:name,null,let: yes)
			// we are using automatic caching far too much here
			
			// we should simply change how declare works
			var i = vars.index = oi ? (scope.declare(oi,0,{type: 'let'})) : (this.util().counter(0,true,scope).predeclare());
			
			vars.source = bare ? (src) : (this.util().iterable(src,true).predeclare());
			vars.len = this.util().len(vars.source,true).predeclare();
			
			vars.value = scope.declare(o.name,null,{type: 'let'});
			vars.value.addReference(o.name); // adding reference!
			if (oi) { i.addReference(oi) };
		};
		
		return this;
	};
	
	
	For.prototype.consume = function (node){
		
		var receiver;
		if (this.isExpressable()) {
			return For.__super__.consume.apply(this,arguments);
		};
		
		// other cases as well, no?
		if (node instanceof TagTree) {
			this.scope().context().reference();
			var ref = node.root().reference();
			node._loop = this;
			
			// Should not be consumed the same way
			this.body().consume(node);
			node._loop = null;
			var fn = new Lambda([new Param(ref)],[this]);
			fn.scope().wrap(this.scope());
			// TODO Scope of generated lambda should be added into stack for
			// variable naming / resolution
			return CALL(fn,[ref]);
		};
		
		
		if (this._resvar) {
			// p "already have a resvar -- change consume? {node}"
			var ast = new Block([this,BR,this._resvar.accessor()]);
			ast.consume(node);
			return ast;
		};
		
		// if node isa return -- do something else
		
		var resvar = null;
		var reuseable = false; // node isa Assign && node.left.node isa LocalVarAccess
		var assignee = null;
		// might only work for locals?
		if (node instanceof Assign) {
			if (receiver = node.left()) {
				assignee = receiver._variable;
				if (receiver._variable) {
					// assignee
					reuseable = true;
				};
			};
		};
		
		// p "reusable?!?! {node} {node}"
		
		// WARN Optimization - might have untended side-effects
		// if we are assigning directly to a local variable, we simply
		// use said variable for the inner res
		if (reuseable && assignee) {
			// instead of declaring it in the scope - why not declare it outside?
			// it might already exist in the outer scope no?
			// p "reuseable {assignee} {scope} {scope.parent.lookup(assignee)}"
			// assignee.resolve
			// should probably instead alter the assign-node to set value to a blank array
			// resvar = scope.parent.declare(assignee,Arr.new([]),proxy: yes,pos: 0)
			
			// this variable should really not be redeclared inside here at all
			assignee.resolve();
			// resvar = @resvar = scope.declare(assignee,Arr.new([]),proxy: yes)
			
			// dont declare it - simply push an assign into the vardecl of scope
			this.scope().vars().unshift(OP('=',assignee,new Arr([])));
			resvar = this._resvar = assignee;
			
			node._consumer = this;
			node = null;
			
			// p "consume variable declarator!?".cyan
		} else {
			// declare the variable we will use to soak up results
			// p "Creating value to store the result of loop".cyan
			// what about a pool here?
			resvar = this._resvar = this.scope().declare('res',new Arr([]),{system: true});
		};
		
		this._catcher = new PushAssign("push",resvar,null); // the value is not preset
		this.body().consume(this._catcher); // should still return the same body
		
		
		
		if (node) {
			// p "returning new ast where Loop is first"
			ast = new Block([this,BR,resvar.accessor().consume(node)]);
			return ast;
		};
		// var ast = Block.new([self,BR,resvar.accessor])
		// ast.consume(node) if node
		// return ast
		// p "Loop did consume successfully"
		return this;
		
		// this is never an expression (for now -- but still)
		// return ast
	};
	
	
	For.prototype.js = function (o){
		var v_;
		var vars = this.options().vars;
		var i = vars.index;
		var val = vars.value;
		var cond = OP('<',i,vars.len);
		var src = this.options().source;
		
		// p "references for value",val.references:length
		
		var final = this.options().step ? (
			OP('=',i,OP('+',i,this.options().step))
		) : (
			OP('++',i)
		);
		
		// if there are few references to the value - we can drop
		// the actual variable and instead make it proxy through the index
		if (src instanceof Range) {
			if (src.inclusive()) { (cond.setOp(v_='<='),v_) };
		} else if (val.refcount() < 3 && val.assignments().length == 0) {
			// p "proxy the value {val.assignments:length}"
			// p "should proxy value-variable instead"
			val.proxy(vars.source,i);
		} else {
			this.body().unshift(OP('=',val,OP('.',vars.source,i)),BR);
			// body.unshift(head)
			// TODO check lengths - intelligently decide whether to brace and indent
		};
		var head = ("for (" + (this.scope().vars().c()) + "; " + (cond.c()) + "; " + (final.c()) + ") ");
		return head + this.body().c({braces: true,indent: true}); // .wrap
	};
	
	
	For.prototype.head = function (){
		var vars = this.options().vars;
		return OP('=',vars.value,OP('.',vars.source,vars.index));
	};
	
	
	
	function ForIn(){ For.apply(this,arguments) };
	
	subclass$(ForIn,For);
	exports.ForIn = ForIn; // export class 
	
	
	
	
	function ForOf(){ For.apply(this,arguments) };
	
	subclass$(ForOf,For);
	exports.ForOf = ForOf; // export class 
	ForOf.prototype.declare = function (){
		var o = this.options();
		var vars = o.vars = {};
		
		// see if 
		
		// p "ForOf source isa {o:source}"
		
		// if o:source is a variable -- refer directly # variable? is this the issue?
		// p scope.@varmap['o'], scope.parent.@varmap['o']
		
		var src = vars.source = o.source._variable || this.scope().declare('o',o.source,{system: true,type: 'let'});
		if (o.index) { var v = vars.value = this.scope().declare(o.index,null,{let: true}) };
		
		// p "ForOf o:index {o:index} o:name {o:name}"
		// if o:index
		
		// possibly proxy the index-variable?
		
		if (o.own) {
			var i = vars.index = this.scope().declare('i',0,{system: true,type: 'let'}); // mark as a counter?
			// systemvariable -- should not really be added to the map
			var keys = vars.keys = this.scope().declare('keys',Util.keys(src.accessor()),{system: true,type: 'let'}); // the outer one should resolve first
			var l = vars.len = this.scope().declare('l',Util.len(keys.accessor()),{system: true,type: 'let'});
			var k = vars.key = this.scope().register(o.name,o.name,{type: 'let'}); // scope.declare(o:name,null,system: yes)
		} else {
			// we set the var -- why even declare it
			// no need to declare -- it will declare itself in the loop - no?
			k = vars.key = this.scope().register(o.name,o.name,{type: 'let'});
		};
		
		// TODO use util - why add references already? Ah -- this is for the highlighting
		if (v && o.index) { v.addReference(o.index) };
		if (k && o.name) { k.addReference(o.name) };
		
		return this;
	};
	
	ForOf.prototype.js = function (o){
		var vars = this.options().vars;
		
		var o = vars.source;
		var k = vars.key;
		var v = vars.value;
		var i = vars.index;
		
		
		if (v) {
			// set value as proxy of object[key]
			// possibly make it a ref? what is happening?
			v.refcount() < 3 ? (v.proxy(o,k)) : (this.body().unshift(OP('=',v,OP('.',o,k))));
		};
		
		if (this.options().own) {
			
			if (k.refcount() < 3) { // should probably adjust these
				k.proxy(vars.keys,i);
			} else {
				this.body().unshift(OP('=',k,OP('.',vars.keys,i)));
			};
			
			var head = ("for (" + (this.scope().vars().c()) + "; " + (OP('<',i,vars.len).c()) + "; " + (OP('++',i).c()) + ")");
			return head + this.body().c({indent: true,braces: true}); // .wrap
		};
		
		var code = this.body().c({braces: true,indent: true});
		// it is really important that this is a treated as a statement
		return this.scope().vars().c() + (";\nfor (var " + (k.c()) + " in " + (o.c()) + ")") + code;
	};
	
	ForOf.prototype.head = function (){
		var v = this.options().vars;
		
		return [
			OP('=',v.key,OP('.',v.keys,v.index)),
			(v.value) && (OP('=',v.value,OP('.',v.source,v.key)))
		];
	};
	
	// NO NEED?
	function Begin(body){
		this._nodes = blk__(body).nodes();
	};
	
	
	subclass$(Begin,Block);
	exports.Begin = Begin; // export class 
	Begin.prototype.shouldParenthesize = function (){
		return this.isExpression();
	};
	
	
	
	function Switch(a,b,c){
		this._traversed = false;
		this._source = a;
		this._cases = b;
		this._fallback = c;
	};
	
	
	subclass$(Switch,ControlFlowStatement);
	exports.Switch = Switch; // export class 
	
	Switch.prototype.__source = {name: 'source'};
	Switch.prototype.source = function(v){ return this._source; }
	Switch.prototype.setSource = function(v){ this._source = v; return this; };
	
	Switch.prototype.__cases = {name: 'cases'};
	Switch.prototype.cases = function(v){ return this._cases; }
	Switch.prototype.setCases = function(v){ this._cases = v; return this; };
	
	Switch.prototype.__fallback = {name: 'fallback'};
	Switch.prototype.fallback = function(v){ return this._fallback; }
	Switch.prototype.setFallback = function(v){ this._fallback = v; return this; };
	
	
	Switch.prototype.visit = function (){
		for (var i=0, ary=iter$(this.cases()), len=ary.length; i < len; i++) {
			ary[i].traverse();
		};
		if (this.fallback()) { this.fallback().visit() };
		if (this.source()) { this.source().visit() };
		return;
	};
	
	
	Switch.prototype.consume = function (node){
		this._cases = this._cases.map(function(item) { return item.consume(node); });
		if (this._fallback) { this._fallback = this._fallback.consume(node) };
		return this;
	};
	
	
	Switch.prototype.js = function (o){
		var body = [];
		
		for (var i=0, ary=iter$(this.cases()), len=ary.length, part; i < len; i++) {
			part = ary[i];
			part.autobreak();
			body.push(part);
		};
		
		if (this.fallback()) {
			body.push("default:\n" + this.fallback().c({indent: true}));
		};
		
		return ("switch (" + (this.source().c()) + ") ") + helpers.bracketize(cary__(body).join("\n"),true);
	};
	
	
	
	function SwitchCase(test,body){
		this._traversed = false;
		this._test = test;
		this._body = blk__(body);
	};
	
	subclass$(SwitchCase,ControlFlowStatement);
	exports.SwitchCase = SwitchCase; // export class 
	
	SwitchCase.prototype.__test = {name: 'test'};
	SwitchCase.prototype.test = function(v){ return this._test; }
	SwitchCase.prototype.setTest = function(v){ this._test = v; return this; };
	
	SwitchCase.prototype.__body = {name: 'body'};
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
		if (!((this.body().last() instanceof BreakStatement))) { this.body().push(new BreakStatement()) };
		return this;
	};
	
	
	SwitchCase.prototype.js = function (o){
		if (!((this._test instanceof Array))) { this._test = [this._test] };
		var cases = this._test.map(function(item) { return "case " + (item.c()) + ":"; });
		return cases.join("\n") + this.body().c({indent: true}); // .indent
	};
	
	
	
	function Try(body,c,f){
		this._traversed = false;
		this._body = blk__(body);
		this._catch = c;
		this._finally = f;
	};
	
	
	subclass$(Try,ControlFlowStatement);
	exports.Try = Try; // export class 
	
	Try.prototype.__body = {name: 'body'};
	Try.prototype.body = function(v){ return this._body; }
	Try.prototype.setBody = function(v){ this._body = v; return this; };
	// prop ncatch
	// prop nfinally
	
	Try.prototype.consume = function (node){
		this._body = this._body.consume(node);
		if (this._catch) { this._catch = this._catch.consume(node) };
		if (this._finally) { this._finally = this._finally.consume(node) };
		return this;
	};
	
	
	Try.prototype.visit = function (){
		this._body.traverse();
		if (this._catch) { this._catch.traverse() };
		if (this._finally) { return this._finally.traverse() };
		// no blocks - add an empty catch
	};
	
	
	Try.prototype.js = function (o){
		var out = "try " + this.body().c({braces: true,indent: true});
		if (this._catch) { out += " " + this._catch.c() };
		if (this._finally) { out += " " + this._finally.c() };
		
		if (!(this._catch || this._finally)) {
			out += " catch (e) \{ \}";
		};
		out += ";";
		return out;
	};
	
	
	
	function Catch(body,varname){
		this._traversed = false;
		this._body = blk__(body || []);
		this._scope = new CatchScope(this);
		this._varname = varname;
		this;
	};
	
	subclass$(Catch,ControlFlowStatement);
	exports.Catch = Catch; // export class 
	
	Catch.prototype.__body = {name: 'body'};
	Catch.prototype.body = function(v){ return this._body; }
	Catch.prototype.setBody = function(v){ this._body = v; return this; };
	
	Catch.prototype.consume = function (node){
		this._body = this._body.consume(node);
		return this;
	};
	
	
	Catch.prototype.visit = function (){
		this._scope.visit();
		this._variable = this._scope.register(this._varname,this,{pool: 'catchvar'});
		return this._body.traverse();
	};
	
	
	Catch.prototype.js = function (o){
		// only indent if indented by default?
		return ("catch (" + (this._variable.c()) + ") ") + this._body.c({braces: true,indent: true});
	};
	
	
	// repeating myself.. don't deal with it until we move to compact tuple-args
	// for all astnodes
	
	
	function Finally(body){
		this._traversed = false;
		this._body = blk__(body || []);
	};
	
	
	subclass$(Finally,ControlFlowStatement);
	exports.Finally = Finally; // export class 
	Finally.prototype.visit = function (){
		return this._body.traverse();
	};
	
	
	Finally.prototype.consume = function (node){
		// swallow silently
		return this;
	};
	
	
	Finally.prototype.js = function (o){
		return "finally " + this._body.c({braces: true,indent: true});
	};
	
	
	// RANGE
	
	function Range(){ Op.apply(this,arguments) };
	
	subclass$(Range,Op);
	exports.Range = Range; // export class 
	Range.prototype.inclusive = function (){
		return this.op() == '..';
	};
	
	Range.prototype.c = function (){
		return "range";
	};
	
	
	function Splat(){ ValueNode.apply(this,arguments) };
	
	subclass$(Splat,ValueNode);
	exports.Splat = Splat; // export class 
	Splat.prototype.js = function (o){
		var par = this.stack().parent();
		if ((par instanceof ArgList) || (par instanceof Arr)) {
			return "[].slice.call(" + (this.value().c()) + ")";
		} else {
			this.p(("what is the parent? " + par));
			return "SPLAT";
		};
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
	
	
	function TagDesc(){
		this.p('TagDesc!!!',arguments);
		this;
	};
	
	subclass$(TagDesc,Node);
	exports.TagDesc = TagDesc; // export class 
	TagDesc.prototype.classes = function (){
		this.p('TagDescClasses',arguments);
		return this;
	};
	
	function Tag(o){
		if(o === undefined) o = {};
		this._traversed = false;
		this._parts = [];
		o.classes || (o.classes = []);
		o.attributes || (o.attributes = []);
		o.classes || (o.classes = []);
		this._options = o;
		this._reference = null;
		this._object = null;
		this._tree = null;
		this;
	};
	
	subclass$(Tag,Node);
	exports.Tag = Tag; // export class 
	
	Tag.prototype.__parts = {name: 'parts'};
	Tag.prototype.parts = function(v){ return this._parts; }
	Tag.prototype.setParts = function(v){ this._parts = v; return this; };
	
	Tag.prototype.__object = {name: 'object'};
	Tag.prototype.object = function(v){ return this._object; }
	Tag.prototype.setObject = function(v){ this._object = v; return this; };
	
	Tag.prototype.__reactive = {name: 'reactive'};
	Tag.prototype.reactive = function(v){ return this._reactive; }
	Tag.prototype.setReactive = function(v){ this._reactive = v; return this; };
	
	Tag.prototype.__parent = {name: 'parent'};
	Tag.prototype.parent = function(v){ return this._parent; }
	Tag.prototype.setParent = function(v){ this._parent = v; return this; };
	
	Tag.prototype.__tree = {name: 'tree'};
	Tag.prototype.tree = function(v){ return this._tree; }
	Tag.prototype.setTree = function(v){ this._tree = v; return this; };
	
	Tag.prototype.set = function (obj){
		for (var v, i=0, keys=Object.keys(obj), l=keys.length; i < l; i++){
			k = keys[i];v = obj[k];if (k == 'attributes') {
				// p "attributs!"
				for (var j=0, ary=iter$(v), len=ary.length; j < len; j++) {
					this.addAttribute(ary[j]);
				};
				continue;
			};
			
			this._options[k] = v;
		};
		return this;
	};
	
	Tag.prototype.addClass = function (node){
		if (!((node instanceof TagFlag))) {
			node = new TagFlag(node);
		};
		this._options.classes.push(node);
		this._parts.push(node);
		
		// p "add class!!!"
		return this;
	};
	
	Tag.prototype.addIndex = function (node){
		this._parts.push(node);
		this._object = node;
		return this;
	};
	
	Tag.prototype.addSymbol = function (node){
		// p "addSymbol to the tag",node
		if (this._parts.length == 0) {
			this._parts.push(node);
			this._options.ns = node;
		};
		return this;
	};
	
	
	Tag.prototype.addAttribute = function (atr){
		// p "add attribute!!!", key, value
		this._parts.push(atr); // what?
		this._options.attributes.push(atr);
		return this;
	};
	
	Tag.prototype.enclosing = function (){
		return this._options.close && this._options.close.value();
	};
	
	Tag.prototype.type = function (){
		return this._options.type || 'div';
	};
	
	Tag.prototype.consume = function (node){
		var o = this._options;
		
		
		if (node instanceof TagTree) {
			// p "tag consume tagtree? {node.reactive}"
			this.setParent(node.root());
			// o:treeRef = node.nextCacheKey
			
			if (node._loop) {
				this.setReactive(!(!this.option('key')));
				
				if (this.option('ivar')) {
					this.warn(("Tag inside loop can not have a static reference " + (this.option('ivar'))),{type: 'error',token: this.option('ivar').value()});
				};
			} else {
				this.setReactive(node.reactive() || !(!this.option('ivar')));
			};
			
			return this;
		};
		
		return Tag.__super__.consume.apply(this,arguments);
	};
	
	
	Tag.prototype.visit = function (){
		
		var o = this._options;
		
		if (o.ivar || o.key) {
			this.setReactive(true);
		};
		
		var typ = this.enclosing();
		
		// look for outer tag here?
		
		if (typ == '->' || typ == '=>') {
			// console.log "tag is template?!? {typ}"
			this._tree = new TagTree(this,o.body,{root: this,reactive: this.reactive()});
			o.body = new TagFragmentFunc([],Block.wrap([this._tree]));
			// console.log "made o body a function?"
		};
		
		if (o.key) { o.key.traverse() };
		
		if (o.body) {
			o.body.traverse();
		};
		
		// id should also be a regular part
		
		if (o.id) { o.id.traverse() };
		
		
		for (var i=0, ary=iter$(this._parts), len=ary.length; i < len; i++) {
			ary[i].traverse();
		};
		
		// for atr in @options:attributes
		// 	atr.traverse
		
		return this;
	};
	
	Tag.prototype.reference = function (){
		return this._reference || (this._reference = this.scope__().temporary(this,{pool: 'tag'}).resolve());
	};
	
	// should this not happen in js?
	// should this not happen in js?
	Tag.prototype.js = function (o){
		// p JSON.stringify(@options)
		// var attrs = TagAttributes.new(o:attributes)
		// p "got here?"
		var body;
		var o = this._options;
		var a = {};
		var enc = this.enclosing();
		
		var setup = [];
		var calls = [];
		var statics = [];
		
		var scope = this.scope__();
		var commit = "end";
		var content = o.body;
		
		var isSelf = (this.type() instanceof Self);
		var bodySetter = isSelf ? ("setChildren") : ("setContent");
		
		// should not cache statics if the node itself is not cached
		// that would only mangle the order in which we set the properties
		var cacheStatics = true;
		
		for (var i=0, ary=iter$(o.attributes), len=ary.length, atr; i < len; i++) {
			atr = ary[i];
			a[atr.key()] = atr.value(); // .populate(obj)
		};
		
		var quote = function(str) { return helpers.singlequote(str); };
		var id = o.id instanceof Node ? (o.id.c()) : ((o.id && quote(o.id.c())));
		var tree = this._tree || null;
		var parent = this.parent();
		// var parTree = parent and parent.tree
		
		
		//  "scope is", !!scope
		// p "type is {type}"
		var out = isSelf ? (
			commit = "synced",
			// p "got here"
			// setting correct context directly
			this.setReactive(true),
			this._reference = scope.context(),
			scope.context().c()
		) : (o.id ? (
			("ti$('" + (this.type().func()) + "'," + id + ")")
		) : (
			("t$('" + (this.type().func()) + "')")
		));
		
		// this is reactive if it has an ivar
		if (o.ivar) {
			this.setReactive(true);
			statics.push((".setRef(" + (quote(o.ivar.name())) + "," + (scope.context().c()) + ")"));
		};
		
		if (o.body instanceof Func) {
			// console.log "o:body isa function!"
			bodySetter = "setTemplate";
		} else if (o.body) {
			if ((o.body instanceof ArgList) && o.body.count() == 1 && o.body.first().isString()) {
				bodySetter = "setText";
			} else {
				// would probably be better to convert to a tagtree during the initial visit
				tree = new TagTree(this,o.body,{root: this,reactive: this.reactive()});
				content = tree;
				this.setTree(tree);
			};
		};
		
		if (tree) {
			// this is the point where we traverse the inner nodes with our tree
			// should rather happen in visit - long before.
			tree.resolve();
		};
		
		for (var i=0, ary=iter$(this._parts), len=ary.length, part; i < len; i++) {
			part = ary[i];
			var pjs;
			var pcache = false;
			
			if (part instanceof TagAttr) {
				var akey = String(part.key());
				var aval = part.value();
				// p "part value {aval} {aval.isPrimitive(yes)}"
				
				// the attr should compile itself instead -- really
				pcache = aval.isPrimitive();
				
				if (akey[0] == '.') { // should check in a better way
					pcache = false;
					pjs = (".flag(" + (quote(akey.substr(1))) + "," + (aval.c()) + ")");
				} else if (akey[0] == ':') {
					// need to analyze whether this is static or not
					pjs = (".setHandler(" + (quote(akey.substr(1))) + "," + (aval.c()) + "," + (scope.context().c()) + ")");
				} else {
					pjs = ("." + (helpers.setterSym(akey)) + "(" + (aval.c()) + ")");
				};
			} else if (part instanceof TagFlag) {
				pjs = part.c();
				pcache = true;
			};
			
			if (pjs) {
				cacheStatics && pcache ? (statics.push(pjs)) : (calls.push(pjs));
			};
		};
		
		
		
		if (this.object()) {
			calls.push((".setObject(" + (this.object().c()) + ")"));
		};
		
		// p "tagtree is static? {tree.static}"
		
		// we need to trigger our own reference before the body does
		// but we do not need a reference if we have no body (no nodes will refer it)
		if (this.reactive() && tree && tree.hasTags()) {
			this.reference();
		};
		
		if (this.reactive() && parent && parent.tree()) {
			o.treeRef = parent.tree().nextCacheKey(this);
		};
		
		if (body = content && content.c({expression: true})) { // force it to be an expression, no?
			calls.push(("." + bodySetter + "(" + body + ")"));
			
			// out += ".body({body})"
		};
		
		// if o:attributes:length # or -- always?
		// adds lots of extra calls - but okay for now
		calls.push(("." + commit + "()"));
		
		if (statics.length) {
			out = out + statics.join("");
		};
		
		
		if ((o.ivar || o.key || this.reactive()) && !(this.type() instanceof Self)) {
			// if this is an ivar, we should set the reference relative
			// to the outer reference, or possibly right on context?
			var ctx,key;
			var partree = parent && parent.tree();
			// ctx = !o:ivar and par and par.reference or scope.context
			// key = o:ivar or tree and tree.nextCacheKey
			
			if (o.key) {
				// closest tag
				// TODO if the dynamic key starts with a static string we should
				// just prepend _ to the string instead of wrapping in OP
				ctx = parent && parent.reference();
				key = OP('+',new Str("'_'"),o.key);
			} else if (o.ivar) {
				ctx = scope.context();
				key = o.ivar;
			} else {
				ctx = parent && parent.reference();
				// ctx = partree.cacher
				key = o.treeRef || partree && partree.nextCacheKey();
				// key = tree and tree.nextCacheKey
			};
			
			
			// need the context -- might be better to rewrite it for real?
			// parse the whole thing into calls etc
			var acc = OP('.',ctx,key).c();
			
			if (this._reference) {
				out = ("(" + (this.reference().c()) + " = " + acc + " || (" + acc + " = " + out + "))");
			} else {
				out = ("(" + acc + " = " + acc + " || " + out + ")");
			};
		};
		
		
		// should we not add references to the outer ones first?
		
		// now work on the refereces?
		
		// free variable
		if (this._reference instanceof Variable) { this._reference.free() };
		// if setup:length
		//	out += ".setup({setup.join(",")})"
		
		return out + calls.join("");
	};
	
	// This is a helper-node
	// Should probably use the same type of listnode everywhere - and simply flag the type as TagTree instead
	function TagTree(owner,list,options){
		if(options === undefined) options = {};
		this._owner = owner;
		this._nodes = this.load(list);
		this._options = options;
		this._conditions = [];
		this._blocks = [this];
		this._counter = 0;
		this;
	};
	
	subclass$(TagTree,ListNode);
	exports.TagTree = TagTree; // export class 
	
	TagTree.prototype.__counter = {name: 'counter'};
	TagTree.prototype.counter = function(v){ return this._counter; }
	TagTree.prototype.setCounter = function(v){ this._counter = v; return this; };
	
	TagTree.prototype.__conditions = {name: 'conditions'};
	TagTree.prototype.conditions = function(v){ return this._conditions; }
	TagTree.prototype.setConditions = function(v){ this._conditions = v; return this; };
	
	TagTree.prototype.__blocks = {name: 'blocks'};
	TagTree.prototype.blocks = function(v){ return this._blocks; }
	TagTree.prototype.setBlocks = function(v){ this._blocks = v; return this; };
	
	TagTree.prototype.__cacher = {name: 'cacher'};
	TagTree.prototype.cacher = function(v){ return this._cacher; }
	TagTree.prototype.setCacher = function(v){ this._cacher = v; return this; };
	
	TagTree.prototype.parent = function (){
		return this._parent || (this._parent = this._owner.parent());
	};
	
	// def cacher
	// 	@cacher ||= if true
	// 		if parent and parent.tree
	// 			parent.tree.cacher
	// 		else
	// 			@owner.reference
	
	TagTree.prototype.nextCacheKey = function (){
		var root = this._owner;
		
		// if parent and parent.tree # parent tree?
		// 	return parent.tree.nextCacheKey
		
		
		// if we want to cache everything on root
		var num = ++this._counter;
		var base = "A".charCodeAt(0);
		var str = "";
		
		while (true){
			num -= 1;
			str = String.fromCharCode(base + (num % 26)) + str;
			num = Math.floor(num / 26);
			if (num <= 0) { break };
		};
		
		str = (this._owner.type() instanceof Self ? ("$") : ("$$")) + str.toLowerCase();
		return str;
		return num;
	};
	
	TagTree.prototype.load = function (list){
		if (list instanceof ListNode) {
			// p "is a list node!! {list.count}"
			// we still want the indentation if we are not in a template
			// or, rather - we want the block to get the indentation - not the tree
			if (list.count() > 1) this._indentation || (this._indentation = list._indentation);
			return list.nodes();
		} else {
			return compact__(list instanceof Array ? (list) : ([list]));
		};
	};
	
	TagTree.prototype.root = function (){
		return this.option('root');
	};
	
	TagTree.prototype.reactive = function (){
		return this.option('reactive');
	};
	
	TagTree.prototype.resolve = function (){
		var self=this;
		this.remap(function(c) { return c.consume(self); });
		return self;
	};
	
	TagTree.prototype.static = function (){
		return this._static == null ? (this._static = this.every(function(c) { return c instanceof Tag; })) : (this._static);
	};
	
	TagTree.prototype.hasTags = function (){
		return this.some(function(c) { return c instanceof Tag; });
	};
	
	TagTree.prototype.c = function (o){
		// FIXME TEST what about comments???
		var len = this.realCount();
		var single = len == 1;
		var out = TagTree.__super__.c.call(this,o);
		
		if (single) {
			out;
		} else if (this.reactive() || this._owner.reactive()) {
			out = ("Imba.static([" + out + "],1)");
		} else {
			out = "[" + out + "]"; // unless single
		};
		
		return out;
	};
	
	function TagWrapper(){ ValueNode.apply(this,arguments) };
	
	subclass$(TagWrapper,ValueNode);
	exports.TagWrapper = TagWrapper; // export class 
	TagWrapper.prototype.visit = function (){
		if (this.value() instanceof Array) {
			this.value().map(function(v) { return v.traverse(); });
		} else {
			this.value().traverse();
		};
		return this;
	};
	
	TagWrapper.prototype.c = function (){
		return "tag$wrap(" + (this.value().c({expression: true})) + ")";
	};
	
	
	function TagAttributes(){ ListNode.apply(this,arguments) };
	
	subclass$(TagAttributes,ListNode);
	exports.TagAttributes = TagAttributes; // export class 
	TagAttributes.prototype.get = function (name){
		for (var i=0, ary=iter$(this.nodes()), len=ary.length, node, res=[]; i < len; i++) {
			node = ary[i];
			if (node.key() == name) { return node };
		};
		return res;
	};
	
	
	function TagAttr(k,v){
		// p "init TagAttribute", $0
		this._traversed = false;
		this._key = k;
		this._value = v;
	};
	
	subclass$(TagAttr,Node);
	exports.TagAttr = TagAttr; // export class 
	
	TagAttr.prototype.__key = {name: 'key'};
	TagAttr.prototype.key = function(v){ return this._key; }
	TagAttr.prototype.setKey = function(v){ this._key = v; return this; };
	
	TagAttr.prototype.__value = {name: 'value'};
	TagAttr.prototype.value = function(v){ return this._value; }
	TagAttr.prototype.setValue = function(v){ this._value = v; return this; };
	
	TagAttr.prototype.visit = function (){
		if (this.value()) { this.value().traverse() };
		return this;
	};
	
	TagAttr.prototype.populate = function (obj){
		obj.add(this.key(),this.value());
		return this;
	};
	
	TagAttr.prototype.c = function (){
		return "attribute";
	};
	
	
	function TagFlag(value){
		this._traversed = false;
		this._value = value;
		this;
	};
	
	subclass$(TagFlag,Node);
	exports.TagFlag = TagFlag; // export class 
	
	TagFlag.prototype.__value = {name: 'value'};
	TagFlag.prototype.value = function(v){ return this._value; }
	TagFlag.prototype.setValue = function(v){ this._value = v; return this; };
	
	TagFlag.prototype.__toggler = {name: 'toggler'};
	TagFlag.prototype.toggler = function(v){ return this._toggler; }
	TagFlag.prototype.setToggler = function(v){ this._toggler = v; return this; };
	
	TagFlag.prototype.visit = function (){
		if (!((typeof this._value=='string'||this._value instanceof String))) {
			this._value.traverse();
		};
		return this;
	};
	
	TagFlag.prototype.c = function (){
		if (this.value() instanceof Node) {
			return ".flag(" + (this.value().c()) + ")";
		} else {
			return ".flag(" + (helpers.singlequote(this.value())) + ")";
		};
	};
	
	
	
	
	
	
	// SELECTORS
	
	
	function Selector(list,options){
		this._nodes = list || [];
		this._options = options;
	};
	
	subclass$(Selector,ListNode);
	exports.Selector = Selector; // export class 
	Selector.prototype.add = function (part,typ){
		// p "select add!",part,typ
		// mark if special?
		this.push(part);
		return this;
	};
	
	Selector.prototype.group = function (){
		// console.log "grouped!"
		// for now we simply add a comma
		// how would this work for dst?
		this._nodes.push(new SelectorGroup(","));
		return this;
	};
	
	Selector.prototype.query = function (){
		var str = "";
		var ary = [];
		
		for (var i=0, items=iter$(this.nodes()), len=items.length; i < len; i++) {
			var val = items[i].c();
			if ((typeof val=='string'||val instanceof String)) {
				str = ("" + str + val);
			};
		};
		
		return "'" + str + "'";
	};
	
	
	Selector.prototype.js = function (o){
		var typ = this.option('type');
		var q = c__(this.query());
		
		if (typ == '%') {
			return "q$(" + q + "," + (o.scope().context().c({explicit: true})) + ")"; // explicit context
		} else if (typ == '%%') {
			return "q$$(" + q + "," + (o.scope().context().c({explicit: true})) + ")";
		} else {
			return "q" + typ + "(" + q + ")";
		};
		
		// return "{typ} {scoped} - {all}"
	};
	
	
	function SelectorPart(){ ValueNode.apply(this,arguments) };
	
	subclass$(SelectorPart,ValueNode);
	exports.SelectorPart = SelectorPart; // export class 
	SelectorPart.prototype.c = function (){
		return c__(this._value);
		// "{value.c}"
	};
	
	function SelectorGroup(){ SelectorPart.apply(this,arguments) };
	
	subclass$(SelectorGroup,SelectorPart);
	exports.SelectorGroup = SelectorGroup; // export class 
	SelectorGroup.prototype.c = function (){
		return ",";
	};
	
	function SelectorType(){ SelectorPart.apply(this,arguments) };
	
	subclass$(SelectorType,SelectorPart);
	exports.SelectorType = SelectorType; // export class 
	SelectorType.prototype.c = function (){
		// support
		// p "selectortype {value}"
		// var out = value.c
		var name = this.value().name();
		
		// at least be very conservative about which tags we
		// can drop the tag for?
		// out in TAG_TYPES.HTML ? 
		return idx$(name,TAG_TYPES.HTML) >= 0 ? (name) : (this.value().sel());
	};
	
	
	function SelectorUniversal(){ SelectorPart.apply(this,arguments) };
	
	subclass$(SelectorUniversal,SelectorPart);
	exports.SelectorUniversal = SelectorUniversal; // export class 
	
	
	function SelectorNamespace(){ SelectorPart.apply(this,arguments) };
	
	subclass$(SelectorNamespace,SelectorPart);
	exports.SelectorNamespace = SelectorNamespace; // export class 
	
	
	function SelectorClass(){ SelectorPart.apply(this,arguments) };
	
	subclass$(SelectorClass,SelectorPart);
	exports.SelectorClass = SelectorClass; // export class 
	SelectorClass.prototype.c = function (){
		if (this._value instanceof Node) {
			return ".'+" + (this._value.c()) + "+'";
		} else {
			return "." + (c__(this._value));
		};
	};
	
	function SelectorId(){ SelectorPart.apply(this,arguments) };
	
	subclass$(SelectorId,SelectorPart);
	exports.SelectorId = SelectorId; // export class 
	SelectorId.prototype.c = function (){
		if (this._value instanceof Node) {
			return "#'+" + (this._value.c()) + "+'";
		} else {
			return "#" + (c__(this._value));
		};
	};
	
	function SelectorCombinator(){ SelectorPart.apply(this,arguments) };
	
	subclass$(SelectorCombinator,SelectorPart);
	exports.SelectorCombinator = SelectorCombinator; // export class 
	SelectorCombinator.prototype.c = function (){
		return "" + (c__(this._value));
	};
	
	function SelectorPseudoClass(){ SelectorPart.apply(this,arguments) };
	
	subclass$(SelectorPseudoClass,SelectorPart);
	exports.SelectorPseudoClass = SelectorPseudoClass; // export class 
	
	
	function SelectorAttribute(left,op,right){
		this._left = left;
		this._op = op;
		this._right = this._value = right;
	};
	
	subclass$(SelectorAttribute,SelectorPart);
	exports.SelectorAttribute = SelectorAttribute; // export class 
	SelectorAttribute.prototype.c = function (){
		// TODO possibly support .toSel or sel$(v) for items inside query
		// could easily do it with a helper-function that is added to the top of the filescope
		if (this._right instanceof Str) {
			return "[" + (this._left.c()) + this._op + (this._right.c()) + "]";
		} else if (this._right) {
			// this is not at all good
			return "[" + (this._left.c()) + this._op + "\"'+" + (c__(this._right)) + "+'\"]";
		} else {
			return "[" + (this._left.c()) + "]";
			
			// ...
		};
	};
	
	
	
	
	// DEFER
	
	function Await(){ ValueNode.apply(this,arguments) };
	
	subclass$(Await,ValueNode);
	exports.Await = Await; // export class 
	
	Await.prototype.__func = {name: 'func'};
	Await.prototype.func = function(v){ return this._func; }
	Await.prototype.setFunc = function(v){ this._func = v; return this; };
	
	Await.prototype.js = function (o){
		// introduce a util here, no?
		return CALL(OP('.',new Util.Promisify([this.value()]),'then'),[this.func()]).c();
		// value.c
	};
	
	Await.prototype.visit = function (o){
		// things are now traversed in a somewhat chaotic order. Need to tighten
		// Create await function - push this value up to block, take the outer
		var self=this;
		self.value().traverse();
		
		var block = o.up(Block); // or up to the closest FUNCTION?
		var outer = o.relative(block,1);
		var par = o.relative(self,-1);
		
		// p "Block {block} {outer} {par}"
		
		self.setFunc(new AsyncFunc([],[]));
		// now we move this node up to the block
		self.func().body().setNodes(block.defers(outer,self));
		
		// if the outer is a var-assignment, we can simply set the params
		if (par instanceof Assign) {
			par.left().traverse();
			var lft = par.left().node();
			// p "Async assignment {par} {lft}"
			// Can be a tuple as well, no?
			if (lft instanceof VarReference) {
				// the param is already registered?
				// should not force the name already??
				// beware of bugs
				self.func().params().at(0,true,lft.variable().name());
			} else if (lft instanceof Tuple) {
				// if this an unfancy tuple, with only vars
				// we can just use arguments
				
				if (par.type() == 'var' && !lft.hasSplat()) {
					// p "SIMPLIFY! {lft.nodes[0]}"
					lft.map(function(el,i) {
						return self.func().params().at(i,true,el.value());
					});
				} else {
					// otherwise, do the whole tuple
					// make sure it is a var assignment?
					par.setRight(ARGUMENTS);
					self.func().body().unshift(par);
				};
			} else {
				// regular setters
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
	
	function AsyncFunc(params,body,name,target,options){
		AsyncFunc.__super__.constructor.call(this,params,body,name,target,options);
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
	
	function ImportStatement(imports,source,ns){
		this._traversed = false;
		this._imports = imports;
		this._source = source;
		this._ns = ns;
		this;
	};
	
	subclass$(ImportStatement,Statement);
	exports.ImportStatement = ImportStatement; // export class 
	
	ImportStatement.prototype.__ns = {name: 'ns'};
	ImportStatement.prototype.ns = function(v){ return this._ns; }
	ImportStatement.prototype.setNs = function(v){ this._ns = v; return this; };
	
	ImportStatement.prototype.__imports = {name: 'imports'};
	ImportStatement.prototype.imports = function(v){ return this._imports; }
	ImportStatement.prototype.setImports = function(v){ this._imports = v; return this; };
	
	ImportStatement.prototype.__source = {name: 'source'};
	ImportStatement.prototype.source = function(v){ return this._source; }
	ImportStatement.prototype.setSource = function(v){ this._source = v; return this; };
	
	
	ImportStatement.prototype.visit = function (){
		if (this._ns) {
			this._nsvar || (this._nsvar = this.scope__().register(this._ns,this));
		} else {
			var src = this.source().c();
			var m = src.match(/(\w+)(\.js|imba)?[\"\']$/);
			this._alias = m ? (m[1] + '$') : ('mod$');
		};
		
		// should also register the imported items, no?
		if (this._imports) {
			var dec = this._declarations = new VariableDeclaration([]);
			
			if (this._imports.length == 1) {
				this._alias = this._imports[0];
				dec.add(this._alias,OP('.',CALL(new Identifier("require"),[this.source()]),this._alias));
				dec.traverse();
				return this;
				
				// dec.add(@alias,CALL(Identifier.new("require"),[source]))
			};
			
			// p "ImportStatement has imports {@imports:length}"
			// @declarations = VariableDeclaration.new([])
			this._moduledecl = dec.add(this._alias,CALL(new Identifier("require"),[this.source()]));
			this._moduledecl.traverse();
			
			
			if (this._imports.length > 1) {
				for (var i=0, ary=iter$(this._imports), len=ary.length, imp; i < len; i++) {
					imp = ary[i];
					this._declarations.add(imp,OP('.',this._moduledecl.variable(),imp));
				};
			};
			
			dec.traverse();
		};
		return this;
	};
	
	
	ImportStatement.prototype.js = function (o){
		
		var fname;
		if (this._declarations) {
			return this._declarations.c();
		};
		
		var req = CALL(new Identifier("require"),[this.source()]);
		
		if (this._ns) {
			// must register ns as a real variable
			return ("var " + (this._nsvar.c()) + " = " + (req.c()));
		};
		
		if (this._imports) {
			
			var src = this.source().c();
			var alias = [];
			var vars = new VarBlock([]);
			
			if (fname = src.match(/(\w+)(\.js|imba)?[\"\']$/)) {
				alias.push(fname[1]);
			};
			
			// var alias = src.match(/(\w+)(\.js|imba)?[\"\']$/)
			// p "source type {source}"
			// create a require for the source, with a temporary name?
			var out = [req.cache({names: alias}).c()];
			
			for (var i=0, ary=iter$(this._imports), len=ary.length, imp; i < len; i++) {
				// we also need to register these imports as variables, no?
				imp = ary[i];
				var o = OP('=',imp,OP('.',req,imp));
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
	
	function ExportStatement(){ ValueNode.apply(this,arguments) };
	
	subclass$(ExportStatement,ValueNode);
	exports.ExportStatement = ExportStatement; // export class 
	ExportStatement.prototype.js = function (o){
		true;
		var nodes = this._value.map(function(arg) {
			return "module.exports." + (arg.c()) + " = " + (arg.c()) + ";\n";
		});
		return nodes.join("");
	};
	
	
	// UTILS
	
	function Util(args){
		this._args = args;
	};
	
	// this is how we deal with it now
	subclass$(Util,Node);
	exports.Util = Util; // export class 
	
	Util.prototype.__args = {name: 'args'};
	Util.prototype.args = function(v){ return this._args; }
	Util.prototype.setArgs = function(v){ this._args = v; return this; };
	
	Util.extend = function (a,b){
		return new Util.Extend([a,b]);
	};
	
	Util.callImba = function (meth,args){
		return CALL(OP('.',new Const("Imba"),new Identifier(meth)),args);
	};
	
	Util.repeat = function (str,times){
		var res = '';
		while (times > 0){
			if (times % 2 == 1) {
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
		// p "LEN HELPER".green
		var r = new Identifier("length");
		var node = OP('.',obj,r);
		if (cache) { node.cache({force: true,pool: 'len'}) };
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
		if (cache) { node.cache({force: true,pool: 'iter'}) };
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
		// should it not rather be a variable?!?
		var node = new Num(start); // make sure it really is a number
		if (cache) { node.cache({force: true,pool: 'counter'}) };
		return node;
	};
	
	Util.array = function (size,cache){
		var node = new Util.Array([size]);
		if (cache) { node.cache({force: true,pool: 'list'}) };
		return node;
	};
	
	Util.defineTag = function (type,ctor,supr){
		return CALL(TAGDEF,[type,ctor,supr]);
	};
	
	
	Util.defineClass = function (name,supr,initor){
		return CALL(CLASSDEF,[name || initor,this.sup()]);
	};
	
	Util.prototype.js = function (o){
		return "helper";
	};
	
	Util.Union = function Union(){ Util.apply(this,arguments) };
	
	subclass$(Util.Union,Util);
	Util.Union.prototype.helper = function (){
		return 'function union$(a,b){\n	if(a && a.__union) return a.__union(b);\n\n	var u = a.slice(0);\n	for(var i=0,l=b.length;i<l;i++) if(u.indexOf(b[i]) == -1) u.push(b[i]);\n	return u;\n};\n';
	};
	
	
	Util.Union.prototype.js = function (o){
		this.scope__().root().helper(this,this.helper());
		// When this is triggered, we need to add it to the top of file?
		return "union$(" + (this.args().map(function(v) { return v.c(); }).join(',')) + ")";
	};
	
	Util.Intersect = function Intersect(){ Util.apply(this,arguments) };
	
	subclass$(Util.Intersect,Util);
	Util.Intersect.prototype.helper = function (){
		return 'function intersect$(a,b){\n	if(a && a.__intersect) return a.__intersect(b);\n	var res = [];\n	for(var i=0, l=a.length; i<l; i++) {\n		var v = a[i];\n		if(b.indexOf(v) != -1) res.push(v);\n	}\n	return res;\n};\n';
	};
	
	Util.Intersect.prototype.js = function (o){
		// When this is triggered, we need to add it to the top of file?
		this.scope__().root().helper(this,this.helper());
		return "intersect$(" + (this.args().map(function(v) { return v.c(); }).join(',')) + ")";
	};
	
	Util.Extend = function Extend(){ Util.apply(this,arguments) };
	
	subclass$(Util.Extend,Util);
	Util.Extend.prototype.js = function (o){
		// When this is triggered, we need to add it to the top of file?
		return "extend$(" + (compact__(cary__(this.args())).join(',')) + ")";
	};
	
	Util.IndexOf = function IndexOf(){ Util.apply(this,arguments) };
	
	subclass$(Util.IndexOf,Util);
	Util.IndexOf.prototype.helper = function (){
		return 'function idx$(a,b){\n	return (b && b.indexOf) ? b.indexOf(a) : [].indexOf.call(a,b);\n};\n';
	};
	
	
	Util.IndexOf.prototype.js = function (o){
		this.scope__().root().helper(this,this.helper());
		// When this is triggered, we need to add it to the top of file?
		return "idx$(" + (this.args().map(function(v) { return v.c(); }).join(',')) + ")";
	};
	
	Util.Subclass = function Subclass(){ Util.apply(this,arguments) };
	
	subclass$(Util.Subclass,Util);
	Util.Subclass.prototype.helper = function (){
		// should also check if it is a real promise
		return '// helper for subclassing\nfunction subclass$(obj,sup) {\n	for (var k in sup) {\n		if (sup.hasOwnProperty(k)) obj[k] = sup[k];\n	};\n	// obj.__super__ = sup;\n	obj.prototype = Object.create(sup.prototype);\n	obj.__super__ = obj.prototype.__super__ = sup.prototype;\n	obj.prototype.initialize = obj.prototype.constructor = obj;\n};\n';
	};
	
	Util.Subclass.prototype.js = function (o){
		// When this is triggered, we need to add it to the top of file?
		this.scope__().root().helper(this,this.helper());
		return "subclass$(" + (this.args().map(function(v) { return v.c(); }).join(',')) + ");\n";
	};
	
	Util.Promisify = function Promisify(){ Util.apply(this,arguments) };
	
	subclass$(Util.Promisify,Util);
	Util.Promisify.prototype.helper = function (){
		// should also check if it is a real promise
		return "function promise$(a)\{ return a instanceof Array ? Promise.all(a) : (a && a.then ? a : Promise.resolve(a)); \}";
	};
	
	Util.Promisify.prototype.js = function (o){
		// When this is triggered, we need to add it to the top of file?
		this.scope__().root().helper(this,this.helper());
		return "promise$(" + (this.args().map(function(v) { return v.c(); }).join(',')) + ")";
	};
	
	Util.Class = function Class(){ Util.apply(this,arguments) };
	
	subclass$(Util.Class,Util);
	Util.Class.prototype.js = function (o){
		// When this is triggered, we need to add it to the top of file?
		return "class$(" + (this.args().map(function(v) { return v.c(); }).join(',')) + ")";
	};
	
	Util.Iterable = function Iterable(){ Util.apply(this,arguments) };
	
	subclass$(Util.Iterable,Util);
	Util.Iterable.prototype.helper = function (){
		// now we want to allow null values as well - just return as empty collection
		// should be the same for for own of I guess
		return "function iter$(a)\{ return a ? (a.toArray ? a.toArray() : a) : []; \};";
	};
	
	Util.Iterable.prototype.js = function (o){
		if (this.args()[0] instanceof Arr) { return this.args()[0].c() }; // or if we know for sure that it is an array
		// only wrap if it is not clear that this is an array?
		this.scope__().root().helper(this,this.helper());
		return ("iter$(" + (this.args()[0].c()) + ")");
	};
	
	Util.IsFunction = function IsFunction(){ Util.apply(this,arguments) };
	
	subclass$(Util.IsFunction,Util);
	Util.IsFunction.prototype.js = function (o){
		// p "IS FUNCTION {args[0]}"
		// just plain check for now
		return "" + (this.args()[0].c());
		// "isfn$({args[0].c})"
		// "typeof {args[0].c} == 'function'"
	};
	
	
	Util.Array = function Array(){ Util.apply(this,arguments) };
	
	subclass$(Util.Array,Util);
	Util.Array.prototype.js = function (o){
		// When this is triggered, we need to add it to the top of file?
		return "new Array(" + (this.args().map(function(v) { return v.c(); })) + ")";
	};
	
	
	
	
	
	
	
	// SCOPES
	
	// handles local variables, self etc. Should create references to outer scopes
	// when needed etc.
	
	// should move the whole context-thingie right into scope
	function Scope(node,parent){
		this._head = [];
		this._node = node;
		this._parent = parent;
		this._vars = new VariableDeclaration([]);
		this._closure = this;
		this._virtual = false;
		this._counter = 0;
		this._varmap = {};
		this._varpool = [];
	};
	
	exports.Scope = Scope; // export class 
	
	Scope.prototype.__level = {name: 'level'};
	Scope.prototype.level = function(v){ return this._level; }
	Scope.prototype.setLevel = function(v){ this._level = v; return this; };
	
	Scope.prototype.__context = {name: 'context'};
	Scope.prototype.context = function(v){ return this._context; }
	Scope.prototype.setContext = function(v){ this._context = v; return this; };
	
	Scope.prototype.__node = {name: 'node'};
	Scope.prototype.node = function(v){ return this._node; }
	Scope.prototype.setNode = function(v){ this._node = v; return this; };
	
	Scope.prototype.__parent = {name: 'parent'};
	Scope.prototype.parent = function(v){ return this._parent; }
	Scope.prototype.setParent = function(v){ this._parent = v; return this; };
	
	Scope.prototype.__varmap = {name: 'varmap'};
	Scope.prototype.varmap = function(v){ return this._varmap; }
	Scope.prototype.setVarmap = function(v){ this._varmap = v; return this; };
	
	Scope.prototype.__varpool = {name: 'varpool'};
	Scope.prototype.varpool = function(v){ return this._varpool; }
	Scope.prototype.setVarpool = function(v){ this._varpool = v; return this; };
	
	Scope.prototype.__params = {name: 'params'};
	Scope.prototype.params = function(v){ return this._params; }
	Scope.prototype.setParams = function(v){ this._params = v; return this; };
	
	Scope.prototype.__head = {name: 'head'};
	Scope.prototype.head = function(v){ return this._head; }
	Scope.prototype.setHead = function(v){ this._head = v; return this; };
	
	Scope.prototype.__vars = {name: 'vars'};
	Scope.prototype.vars = function(v){ return this._vars; }
	Scope.prototype.setVars = function(v){ this._vars = v; return this; };
	
	Scope.prototype.__counter = {name: 'counter'};
	Scope.prototype.counter = function(v){ return this._counter; }
	Scope.prototype.setCounter = function(v){ this._counter = v; return this; };
	
	Scope.prototype.p = function (){
		if (STACK.loglevel() > 0) {
			console.log.apply(console,arguments);
		};
		return this;
	};
	
	Scope.prototype.context = function (){
		return this._context || (this._context = new ScopeContext(this));
	};
	
	Scope.prototype.traverse = function (){
		return this;
	};
	
	Scope.prototype.visit = function (){
		if (this._parent) { return this };
		// p "visited scope!"
		this._parent = STACK.scope(1); // the parent scope
		this._level = STACK.scopes().length - 1;
		
		// p "parent is",@parent
		
		STACK.addScope(this);
		this.root().scopes().push(this);
		return this;
	};
	
	Scope.prototype.wrap = function (scope){
		this._parent = scope._parent;
		scope._parent = this;
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
		while (scope){
			if (scope instanceof FileScope) { return scope };
			scope = scope.parent();
		};
		return null;
	};
	
	Scope.prototype.register = function (name,decl,o){
		
		// FIXME re-registering a variable should really return the existing one
		// Again, here we should not really have to deal with system-generated vars
		// But again, it is important
		
		// p "registering {name}"
		if(decl === undefined) decl = null;
		if(o === undefined) o = {};
		name = helpers.symbolize(name);
		
		// also look at outer scopes if this is not closed?
		var existing = this._varmap.hasOwnProperty(name) && this._varmap[name];
		if (existing) { return existing };
		
		var item = new Variable(this,name,decl,o);
		// need to check for duplicates, and handle this gracefully -
		// going to refactor later
		if (!o.system) { this._varmap[name] = item }; // dont even add to the varmap if it is a sysvar
		return item;
	};
	
	// just like register, but we automatically 
	Scope.prototype.declare = function (name,init,o){
		
		var declarator_;
		if(init === undefined) init = null;
		if(o === undefined) o = {};
		var variable = this.register(name,null,o);
		// TODO create the variabledeclaration here instead?
		// if this is a sysvar we need it to be renameable
		var dec = this._vars.add(variable,init);
		(declarator_=variable.declarator()) || ((variable.setDeclarator(dec),dec));
		return variable;
		
		// p "declare variable {name} {o}"
		// if name isa Variable
		// p "SCOPE declare var".green
		name = helpers.symbolize(name);
		// we will see here
		this._vars.add(name,init); // .last -- 
		var decl = this._vars.last(); // bug(!)
		var item;
		// item = Variable.new(self,name,decl)
		
		// if o:system
		// 	item = SystemVariable.new(self,name,decl,o)
		// 	decl.variable = item
		// else
		item = new Variable(this,name,decl,o);
		decl.setVariable(item);
		item.resolve(); // why on earth should it resolve immediately?
		
		// decl.variable = item
		// item.resolve # why on earth should it resolve immediately?
		return item;
		
		// should be possible to force-declare for this scope, no?
		// if this is a system-variable 
	};
	
	// declares a variable (has no real declaration beforehand)
	
	
	// what are the differences here? omj
	// we only need a temporary thing with defaults -- that is all
	// change these values, no?
	Scope.prototype.temporary = function (refnode,o,name){
		
		// p "registering temporary {refnode} {name}"
		// reuse variables -- hmm
		if(o === undefined) o = {};
		if(name === undefined) name = null;
		if (o.pool) {
			for (var i=0, ary=iter$(this._varpool), len=ary.length, v; i < len; i++) {
				v = ary[i];
				if (v.pool() == o.pool && v.declarator() == null) {
					return v.reuse(refnode);
				};
			};
		};
		
		// should only 'register' as ahidden variable, no?
		// if there are real nodes inside that tries to refer to vars
		// defined in outer scopes, we need to make sure they are not named after this
		var item = new SystemVariable(this,name,refnode,o);
		this._varpool.push(item); // WHAT? It should not be in the pool unless explicitly put there?
		this._vars.push(item); // WARN variables should not go directly into a declaration-list
		return item;
		// return register(name || "__",null,system: yes, temporary: yes)
	};
	
	
	
	Scope.prototype.lookup = function (name){
		var ret = null;
		name = helpers.symbolize(name);
		if (this._varmap.hasOwnProperty(name)) {
			ret = this._varmap[name];
		} else {
			// look up any parent scope ?? seems okay
			// !isClosed && 
			ret = this.parent() && this.parent().lookup(name);
			// or -- not all scopes have a parent?
		};
		
		// should this not happen by itself?
		// if !ret and 
		//	ret = 
		// ret ||= (g.lookup(name) if var g = root)
		// g = root
		return ret;
	};
	
	Scope.prototype.autodeclare = function (variable){
		return this.vars().push(variable); // only if it does not exist here!!!
	};
	
	Scope.prototype.free = function (variable){
		// p "free variable"
		variable.free(); // :owner = null
		// @varpool.push(variable)
		return this;
	};
	
	Scope.prototype.isClosed = function (){
		return false;
	};
	
	Scope.prototype.closure = function (){
		return this._closure;
	};
	
	Scope.prototype.finalize = function (){
		return this;
	};
	
	Scope.prototype.klass = function (){
		var scope = this;
		while (scope){
			scope = scope.parent();
			if (scope instanceof ClassScope) { return scope };
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
		// var out = [head or null,body].flatten__.compact.join("\n")
		// out
		// out = '{' + out + 
	};
	
	Scope.prototype.region = function (){
		return this.node().body().region();
	};
	
	Scope.prototype.dump = function (){
		var self=this;
		var vars = Object.keys(this._varmap).map(function(k) {
			var v = self._varmap[k];
			return v.references().length ? (dump__(v)) : (null);
		});
		
		return {type: self.constructor.name,
		level: (self.level() || 0),
		vars: compact__(vars),
		loc: self.region()};
	};
	
	Scope.prototype.toString = function (){
		return "" + (this.constructor.name);
	};
	
	
	// FileScope is wrong? Rather TopScope or ProgramScope
	function FileScope(){
		FileScope.__super__.constructor.apply(this,arguments);
		
		this.register('global',this,{type: 'global'});
		this.register('module',this,{type: 'global'});
		this.register('window',this,{type: 'global'});
		this.register('document',this,{type: 'global'});
		this.register('exports',this,{type: 'global'});
		this.register('console',this,{type: 'global'});
		this.register('process',this,{type: 'global'});
		this.register('parseInt',this,{type: 'global'});
		this.register('parseFloat',this,{type: 'global'});
		this.register('setTimeout',this,{type: 'global'});
		this.register('setInterval',this,{type: 'global'});
		this.register('clearTimeout',this,{type: 'global'});
		this.register('clearInterval',this,{type: 'global'});
		this.register('__dirname',this,{type: 'global'});
		
		// preregister global special variables here
		this._warnings = [];
		this._scopes = [];
		this._helpers = [];
		this._head = [this._vars];
	};
	
	subclass$(FileScope,Scope);
	exports.FileScope = FileScope; // export class 
	
	FileScope.prototype.__warnings = {name: 'warnings'};
	FileScope.prototype.warnings = function(v){ return this._warnings; }
	FileScope.prototype.setWarnings = function(v){ this._warnings = v; return this; };
	
	FileScope.prototype.__scopes = {name: 'scopes'};
	FileScope.prototype.scopes = function(v){ return this._scopes; }
	FileScope.prototype.setScopes = function(v){ this._scopes = v; return this; };
	
	FileScope.prototype.context = function (){
		return this._context || (this._context = new RootScopeContext(this));
	};
	
	FileScope.prototype.lookup = function (name){
		// p "lookup filescope"
		name = helpers.symbolize(name);
		if (this._varmap.hasOwnProperty(name)) { return this._varmap[name] };
	};
	
	FileScope.prototype.visit = function (){
		STACK.addScope(this);
		return this;
	};
	
	FileScope.prototype.helper = function (typ,value){
		// log "add helper",typ,value
		if (this._helpers.indexOf(value) == -1) {
			this._helpers.push(value);
			this._head.unshift(value);
		};
		
		return this;
	};
	
	FileScope.prototype.head = function (){
		return this._head;
	};
	
	FileScope.prototype.warn = function (data){
		// hacky
		data.node = null;
		// p "warning",JSON.stringify(data)
		this._warnings.push(data);
		return this;
	};
	
	FileScope.prototype.dump = function (){
		var scopes = this._scopes.map(function(s) { return s.dump(); });
		scopes.unshift(FileScope.__super__.dump.call(this));
		
		var obj = {
			warnings: dump__(this._warnings),
			scopes: scopes
		};
		
		return obj;
	};
	
	
	function ClassScope(){ Scope.apply(this,arguments) };
	
	subclass$(ClassScope,Scope);
	exports.ClassScope = ClassScope; // export class 
	ClassScope.prototype.virtualize = function (){
		// console.log "virtualizing ClassScope"
		var up = this.parent();
		for (var o=this._varmap, i=0, keys=Object.keys(o), l=keys.length; i < l; i++){
			true;
			o[keys[i]].resolve(up,true); // force new resolve
		};
		return this;
	};
	
	ClassScope.prototype.isClosed = function (){
		return true;
	};
	
	function TagScope(){ ClassScope.apply(this,arguments) };
	
	subclass$(TagScope,ClassScope);
	exports.TagScope = TagScope; // export class 
	
	
	function ClosureScope(){ Scope.apply(this,arguments) };
	
	subclass$(ClosureScope,Scope);
	exports.ClosureScope = ClosureScope; // export class 
	
	
	function FunctionScope(){ Scope.apply(this,arguments) };
	
	subclass$(FunctionScope,Scope);
	exports.FunctionScope = FunctionScope; // export class 
	
	
	function MethodScope(){ Scope.apply(this,arguments) };
	
	subclass$(MethodScope,Scope);
	exports.MethodScope = MethodScope; // export class 
	MethodScope.prototype.isClosed = function (){
		return true;
	};
	
	function LambdaScope(){ Scope.apply(this,arguments) };
	
	subclass$(LambdaScope,Scope);
	exports.LambdaScope = LambdaScope; // export class 
	LambdaScope.prototype.context = function (){
		
		// when accessing the outer context we need to make sure that it is cached
		// so this is wrong - but temp okay
		return this._context || (this._context = this.parent().context().reference(this));
	};
	
	function FlowScope(){ Scope.apply(this,arguments) };
	
	subclass$(FlowScope,Scope);
	exports.FlowScope = FlowScope; // export class 
	FlowScope.prototype.params = function (){
		if (this._parent) { return this._parent.params() };
	};
	
	FlowScope.prototype.register = function (name,decl,o){
		var found;
		if(decl === undefined) decl = null;
		if(o === undefined) o = {};
		if (o.type != 'let' && (this.closure() != this)) {
			if (found = this.lookup(name)) {
				// p "already found variable {found.type}"
				if (found.type() == 'let') {
					this.p(("" + name + " already exists as a block-variable " + decl));
					// TODO should throw error instead
					if (decl) { decl.warn("Variable already exists in block") };
					// root.warn message: "Holy shit"
				};
				// if found.
			};
			// p "FlowScope register var -- do it right in the outer scope"
			return this.closure().register(name,decl,o);
		} else {
			// p "Register local variable for FlowScope {name}"
			// o:closure = parent
			// p "FlowScope register", arguments
			return FlowScope.__super__.register.call(this,name,decl,o);
		};
	};
	
	FlowScope.prototype.autodeclare = function (variable){
		return this.parent().autodeclare(variable);
	};
	
	FlowScope.prototype.closure = function (){
		// rather all the way?
		return this._parent.closure(); // this is important?
	};
	
	FlowScope.prototype.context = function (){
		// if we are wrapping in an expression - we do need to add a reference
		// @referenced = yes
		return this.parent().context();
		// usually - if the parent scope is a closed scope we dont really need
		// to force a reference
		// @context ||= parent.context.reference(self)
	};
	
	function CatchScope(){ FlowScope.apply(this,arguments) };
	
	subclass$(CatchScope,FlowScope);
	exports.CatchScope = CatchScope; // export class 
	
	
	function WhileScope(){ FlowScope.apply(this,arguments) };
	
	subclass$(WhileScope,FlowScope);
	exports.WhileScope = WhileScope; // export class 
	WhileScope.prototype.autodeclare = function (variable){
		return this.vars().push(variable);
	};
	
	function ForScope(){ FlowScope.apply(this,arguments) };
	
	subclass$(ForScope,FlowScope);
	exports.ForScope = ForScope; // export class 
	ForScope.prototype.autodeclare = function (variable){
		return this.vars().push(variable);
		// parent.autodeclare(variable)
	};
	
	// def closure
	// 	self
	;
	
	function IfScope(){ FlowScope.apply(this,arguments) };
	
	subclass$(IfScope,FlowScope);
	exports.IfScope = IfScope; // export class 
	IfScope.prototype.temporary = function (refnode,o,name){
		if(o === undefined) o = {};
		if(name === undefined) name = null;
		return this.parent().temporary(refnode,o,name);
	};
	
	function BlockScope(){ FlowScope.apply(this,arguments) };
	
	subclass$(BlockScope,FlowScope);
	exports.BlockScope = BlockScope; // export class 
	BlockScope.prototype.temporary = function (refnode,o,name){
		if(o === undefined) o = {};
		if(name === undefined) name = null;
		return this.parent().temporary(refnode,o,name);
	};
	
	BlockScope.prototype.region = function (){
		return this.node().region();
	};
	
	// lives in scope -- really a node???
	function Variable(scope,name,decl,o){
		this._ref = STACK._counter++;
		this._c = null;
		this._scope = scope;
		this._name = name;
		this._alias = null;
		this._initialized = true;
		this._declarator = decl;
		this._autodeclare = false;
		this._declared = o && o.declared || false;
		this._resolved = false;
		this._options = o || {};
		this._type = o && o.type || 'var'; // what about let here=
		this._export = false;
		this._references = []; // only needed when profiling
		this._assignments = [];
		this;
	};
	
	subclass$(Variable,Node);
	exports.Variable = Variable; // export class 
	
	Variable.prototype.__scope = {name: 'scope'};
	Variable.prototype.scope = function(v){ return this._scope; }
	Variable.prototype.setScope = function(v){ this._scope = v; return this; };
	
	Variable.prototype.__name = {name: 'name'};
	Variable.prototype.name = function(v){ return this._name; }
	Variable.prototype.setName = function(v){ this._name = v; return this; };
	
	Variable.prototype.__alias = {name: 'alias'};
	Variable.prototype.alias = function(v){ return this._alias; }
	Variable.prototype.setAlias = function(v){ this._alias = v; return this; };
	
	Variable.prototype.__type = {name: 'type'};
	Variable.prototype.type = function(v){ return this._type; }
	Variable.prototype.setType = function(v){ this._type = v; return this; };
	
	Variable.prototype.__options = {name: 'options'};
	Variable.prototype.options = function(v){ return this._options; }
	Variable.prototype.setOptions = function(v){ this._options = v; return this; };
	
	Variable.prototype.__initialized = {name: 'initialized'};
	Variable.prototype.initialized = function(v){ return this._initialized; }
	Variable.prototype.setInitialized = function(v){ this._initialized = v; return this; };
	
	Variable.prototype.__declared = {name: 'declared'};
	Variable.prototype.declared = function(v){ return this._declared; }
	Variable.prototype.setDeclared = function(v){ this._declared = v; return this; };
	
	Variable.prototype.__declarator = {name: 'declarator'};
	Variable.prototype.declarator = function(v){ return this._declarator; }
	Variable.prototype.setDeclarator = function(v){ this._declarator = v; return this; };
	
	Variable.prototype.__autodeclare = {name: 'autodeclare'};
	Variable.prototype.autodeclare = function(v){ return this._autodeclare; }
	Variable.prototype.setAutodeclare = function(v){ this._autodeclare = v; return this; };
	
	Variable.prototype.__references = {name: 'references'};
	Variable.prototype.references = function(v){ return this._references; }
	Variable.prototype.setReferences = function(v){ this._references = v; return this; };
	
	Variable.prototype.__export = {name: 'export'};
	Variable.prototype.export = function(v){ return this._export; }
	Variable.prototype.setExport = function(v){ this._export = v; return this; };
	
	Variable.prototype.pool = function (){
		return null;
	};
	
	Variable.prototype.closure = function (){
		return this._scope.closure();
	};
	
	Variable.prototype.assignments = function (){
		return this._assignments;
	};
	
	// Here we can collect lots of type-info about variables
	// and show warnings / give advice if variables are ambiguous etc
	Variable.prototype.assigned = function (val,source){
		this._assignments.push(val);
		// p "Variable was assigned {val}"
		if (val instanceof Arr) {
			// just for testing really
			this._isArray = true;
		} else {
			this._isArray = false;
		};
		return this;
	};
	
	Variable.prototype.resolve = function (scope,force){
		if(scope === undefined) scope = this.scope();
		if(force === undefined) force = false;
		if (this._resolved && !force) { return this };
		
		this._resolved = true;
		var closure = this._scope.closure();
		var item = scope.lookup(this._name);
		
		// if this is a let-definition inside a virtual scope we do need
		// 
		if (this._scope != closure && this._type == 'let') { // or if it is a system-variable
			// p "scope is not the closure -- need to resolve {@name}"
			item = closure.lookup(this._name);
			
			// we now need to ensure that this variable is unique inside
			// the whole closure.
			scope = closure;
		};
		
		// p "scope is not the closure -- need to resolve {@name} {@type}"
		
		if (item == this) {
			scope.varmap()[this._name] = this;
			return this;
		} else if (item) {
			// p "variable already exists {@name}"
			
			// possibly redefine this inside, use it only in this scope
			// if the item is defined in an outer scope - we reserve the
			if (item.scope() != scope && (this.options().let || this._type == 'let')) {
				// p "override variable inside this scope {@name}"
				scope.varmap()[this._name] = this;
			};
			
			// different rules for different variables?
			if (this._options.proxy) {
				// p "is proxy -- no need to change name!!! {name}".cyan
				true;
			} else {
				var i = 0;
				var orig = this._name;
				// it is the closure that we should use
				while (scope.lookup(this._name)){
					this._name = ("" + orig + (i += 1));
				};
			};
		};
		
		// inefficient double setting
		scope.varmap()[this._name] = this;
		closure.varmap()[this._name] = this;
		return this;
		// p "resolve variable".cyan
	};
	
	Variable.prototype.reference = function (){
		return this;
	};
	
	Variable.prototype.node = function (){
		return this;
	};
	
	Variable.prototype.traverse = function (){
		// NODES.push(self)
		return this;
	};
	
	Variable.prototype.free = function (ref){
		// p "free variable!"
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
		if (this._c) { return this._c };
		// options - proxy??
		if (this._proxy) {
			// p "var is proxied!",@proxy
			this._c = this._proxy[0].c() + '[' + this._proxy[1].c() + ']';
		} else {
			if (!this._resolved) this.resolve();
			var v = (this.alias() || this.name());
			this._c = typeof v == 'string' ? (v) : (v.c());
			// allow certain reserved words
			// should warn on others though (!!!)
			// if @c == 'new'
			// 	@c = '_new'
			// 	# should happen at earlier stage to
			// 	# get around naming conventions
			if (RESERVED_REGEX.test(this._c)) { this._c = ("" + this.c() + "$") }; // @c.match(/^(default)$/)
		};
		return this._c;
	};
	
	// variables should probably inherit from node(!)
	Variable.prototype.consume = function (node){
		// p "variable assignify!!!"
		return this;
	};
	
	// this should only generate the accessors - not dael with references
	Variable.prototype.accessor = function (ref){
		var node = new LocalVarAccess(".",null,this); // this is just wrong .. should not be a regular accessor
		// @references.push([ref,el]) if ref # weird temp format
		return node;
	};
	
	Variable.prototype.assignment = function (val){
		return new Assign('=',this,val);
	};
	
	Variable.prototype.addReference = function (ref){
		if (ref instanceof Identifier) {
			ref.references(this);
		};
		
		if (ref.region && ref.region()) {
			this._references.push(ref);
		};
		
		// p "reference is {ref:region and ref.region}"
		return this;
	};
	
	Variable.prototype.autodeclare = function (){
		if (this._declared) { return this };
		// p "variable should autodeclare(!) {name}"
		this._autodeclare = true;
		this.scope().autodeclare(this);
		this._declared = true;
		return this;
	};
	
	Variable.prototype.predeclared = function (){
		this._declared = true;
		return this;
	};
	
	
	Variable.prototype.toString = function (){
		return String(this.name());
	};
	
	Variable.prototype.dump = function (typ){
		var name = this.name();
		if (name[0].match(/[A-Z]/)) { return null };
		// console.log "dump variable of type {type} - {name}"
		return {
			type: this.type(),
			name: name,
			refs: dump__(this._references,typ)
		};
	};
	
	
	function SystemVariable(){ Variable.apply(this,arguments) };
	
	subclass$(SystemVariable,Variable);
	exports.SystemVariable = SystemVariable; // export class 
	SystemVariable.prototype.pool = function (){
		return this._options.pool;
	};
	
	// weird name for this
	SystemVariable.prototype.predeclared = function (){
		// p "remove var from scope(!)"
		this.scope().vars().remove(this);
		return this;
	};
	
	SystemVariable.prototype.resolve = function (){
		var alias, v_;
		if (this._resolved || this._name) { return this };
		// p "RESOLVE SYSTEM VARIABLE".red
		this._resolved = true;
		// unless @name
		// adds a very random initial name
		// the auto-magical goes last, or at least, possibly reuse other names
		// "${Math.floor(Math.random * 1000)}"
		
		var typ = this._options.pool;
		var names = [].concat(this._options.names);
		var alt = null;
		var node = null;
		
		var scope = this.scope();
		
		if (typ == 'tag') {
			var i = 0;
			while (!this._name){
				alt = ("t" + (i++));
				if (!scope.lookup(alt)) { this._name = alt };
			};
		} else if (typ == 'iter') {
			names = ['ary__','ary_','coll','array','items','ary'];
		} else if (typ == 'val') {
			names = ['v_'];
		} else if (typ == 'arguments') {
			names = ['$_','$0'];
		} else if (typ == 'keypars') {
			names = ['opts','options','pars'];
		} else if (typ == 'counter') {
			names = ['i__','i_','k','j','i'];
		} else if (typ == 'len') {
			names = ['len__','len_','len'];
		} else if (typ == 'list') {
			names = ['tmplist_','tmplist','tmp'];
		};
		// or if type placeholder / cacher (add 0)
		
		while (!this._name && (alt = names.pop())){
			if (!scope.lookup(alt)) { this._name = alt };
		};
		
		if (!this._name && this._declarator) {
			if (node = this.declarator().node()) {
				if (alias = node.alias()) { names.push(alias + "_") };
			};
		};
		
		while (!this._name && (alt = names.pop())){
			if (!scope.lookup(alt)) { this._name = alt };
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
	
	
	function ScopeContext(scope,value){
		this._scope = scope;
		this._value = value;
		this._reference = null;
		this;
	};
	
	// instead of all these references we should probably
	// just register when it is accessed / looked up from
	// a deeper function-scope, and when it is, we should
	// register the variable in scope, and then start to
	// use that for further references. Might clean things
	// up for the cases where we have yet to decide the
	// name of the variable etc?
	
	subclass$(ScopeContext,Node);
	exports.ScopeContext = ScopeContext; // export class 
	
	ScopeContext.prototype.__scope = {name: 'scope'};
	ScopeContext.prototype.scope = function(v){ return this._scope; }
	ScopeContext.prototype.setScope = function(v){ this._scope = v; return this; };
	
	ScopeContext.prototype.__value = {name: 'value'};
	ScopeContext.prototype.value = function(v){ return this._value; }
	ScopeContext.prototype.setValue = function(v){ this._value = v; return this; };
	
	ScopeContext.prototype.reference = function (){
		// p "p reference {STACK.scoping}"
		// should be a special context-variable!!!
		return this._reference || (this._reference = this.scope().declare("self",new This()));
	};
	
	ScopeContext.prototype.c = function (){
		var val = this._value || this._reference;
		return val ? (val.c()) : ("this");
	};
	
	function RootScopeContext(){ ScopeContext.apply(this,arguments) };
	
	subclass$(RootScopeContext,ScopeContext);
	exports.RootScopeContext = RootScopeContext; // export class 
	RootScopeContext.prototype.c = function (o){
		// return "" if o and o:explicit
		var val = this._value || this._reference;
		return (val && val != this) ? (val.c()) : ("this");
		// should be the other way around, no?
		// o and o:explicit ? super : ""
	};
	
	function Super(){ Node.apply(this,arguments) };
	
	subclass$(Super,Node);
	exports.Super = Super; // export class 
	Super.prototype.c = function (){
		// need to find the stuff here
		// this is really not that good8
		var m = STACK.method();
		var out = null;
		var up = STACK.current();
		var deep = (up instanceof Access);
		
		// TODO optimization for later - problematic if there is a different reference in the end
		if (false && m && m.type() == 'constructor') {
			out = ("" + (m.target().c()) + ".superclass");
			if (!deep) { out += (".apply(" + (m.scope().context().c()) + ",arguments)") };
		} else {
			out = ("" + (m.target().c()) + ".__super__");
			if (!((up instanceof Access))) {
				out += ("." + (c__(m.supername())));
				if (!((up instanceof Call))) { // autocall?
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
	module.exports.UNDEFINED = UNDEFINED = new Undefined();
	module.exports.NIL = NIL = new Nil();
	
	module.exports.ARGUMENTS = ARGUMENTS = new ArgsReference('arguments');
	module.exports.EMPTY = EMPTY = '';
	module.exports.NULL = NULL = 'null';
	
	module.exports.RESERVED = RESERVED = ['default','native','enum','with'];
	module.exports.RESERVED_REGEX = RESERVED_REGEX = /^(default|native|enum|with|new|char)$/;
	
	module.exports.UNION = UNION = new Const('union$');
	module.exports.INTERSECT = INTERSECT = new Const('intersect$');
	module.exports.CLASSDEF = CLASSDEF = new Const('imba$class');
	module.exports.TAGDEF = TAGDEF = new Const('Imba.Tag.define');
	module.exports.NEWTAG = NEWTAG = new Identifier("tag$");

})()