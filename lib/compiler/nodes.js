function len$(a){
	return a && (a.len instanceof Function ? a.len() : a.length) || 0;
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

function idx$(a,b){
	return (b && b.indexOf) ? b.indexOf(a) : [].indexOf.call(a,b);
};
function iter$(a){ return a ? (a.toArray ? a.toArray() : a) : []; };
var self = {};
// imba$inlineHelpers=1
// imba$v2=0
// TODO Create Expression - make all expressions inherit from these?

var helpers = require('./helpers');
var constants = require('./constants');
var csscompiler = require('./css');
var NODE_MAJOR_VERSION = null;

var ImbaParseError = require('./errors').ImbaParseError;
var Token = require('./token').Token;
var SourceMap = require('./sourcemap').SourceMap;

if (true) {
	var v = (process.version || 'v0').match(/^v?(\d+)/);
	NODE_MAJOR_VERSION = parseInt(v[1]);
	if (NODE_MAJOR_VERSION < 5) {
		console.log(("Imba compiles to es5 due to old version of node(" + (process.version) + ")"));
	};
};

var AST = exports.AST = {};

var TREE_TYPE = {
	DYNAMIC: 1,
	STATIC: 2,
	SINGLE: 3,
	OPTLOOP: 4,
	LOOP: 5
};


// Helpers for operators
var OP = exports.OP = function(op,l,r) {
	var o = String(op);
	switch (o) {
		case '.': {
			if ((typeof r=='string'||r instanceof String)) { r = new Identifier(r) };
			// r = r.value if r isa VarOrAccess
			return new Access(op,l,r);
			break;
		}
		case '=': {
			if (l instanceof Tuple) { return new TupleAssign(op,l,r) };
			return new Assign(op,l,r);
			break;
		}
		case '?=': 
		case '||=': 
		case '&&=': {
			return new ConditionalAssign(op,l,r);
			break;
		}
		case '+=': 
		case '-=': 
		case '*=': 
		case '/=': 
		case '^=': 
		case '%=': 
		case '**=': {
			return new CompoundAssign(op,l,r);
			break;
		}
		case '?.': {
			if (r instanceof VarOrAccess) {
				r = r.value();
			};
			
			// depends on the right side - this is wrong
			return new PropertyAccess(op,l,r);
			break;
		}
		case 'instanceof': 
		case 'isa': {
			return new InstanceOf(op,l,r);
			break;
		}
		case 'in': {
			return new In(op,l,r);
			break;
		}
		case 'typeof': {
			return new TypeOf(op,l,r);
			break;
		}
		case 'delete': {
			return new Delete(op,l,r);
			break;
		}
		case '--': 
		case '++': 
		case '!': 
		case '√': 
		case 'not': { // alias
			return new UnaryOp(op,l,r);
			break;
		}
		case '>': 
		case '<': 
		case '>=': 
		case '<=': 
		case '==': 
		case '===': 
		case '!=': 
		case '!==': {
			return new ComparisonOp(op,l,r);
			break;
		}
		case '∩': 
		case '∪': {
			return new MathOp(op,l,r);
			break;
		}
		case '..': 
		case '...': {
			return new Range(op,l,r);
			break;
		}
		default:
		
			return new Op(op,l,r);
	
	};
};

var OP_COMPOUND = exports.OP_COMPOUND = function(sym,op,l,r) {
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
var ROOT = null;

var NODES = exports.NODES = [];

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

var SPLAT = exports.SPLAT = function(value) {
	if (value instanceof Assign) {
		value.setLeft(new Splat(value.left()));
		return value;
	} else {
		return new Splat(value);
	};
};

var SEMICOLON_TEST = /;(\s*\/\/.*)?[\n\s\t]*$/;
var RESERVED_TEST = /^(default|char|for)$/;

// captures error from parser
exports.parseError = self.parseError = function (str,o){
	// find nearest token
	var err;
	
	if (o.lexer) {
		var token = o.lexer.yytext;
		// console.log o:lexer:pos,token.@loc
		err = new ImbaParseError({message: str},{
			pos: o.lexer.pos,
			tokens: o.lexer.tokens,
			token: o.lexer.yytext,
			meta: o
		});
		
		throw err;
		
		// should find the closest token with actual position
		// str = "[{token.@loc}:{token.@len || String(token):length}] {str}"
	};
	var e = new Error(str);
	e.lexer = o.lexer;
	e.options = o;
	throw e;
};

AST.c = function (obj){
	return (typeof obj == 'string') ? obj : obj.c();
};

AST.mark = function (tok){
	if (tok && (OPTS.sourceMapInline || OPTS.sourceMap) && tok.sourceMapMarker) {
		return tok.sourceMapMarker();
	} else {
		return '';
	};
};

AST.blk = function (obj){
	return (obj instanceof Array) ? Block.wrap(obj) : obj;
};

AST.sym = function (obj){
	// console.log "sym {obj}"
	return helpers.symbolize(String(obj));
};

AST.cary = function (ary){
	return ary.map(function(v) { return (typeof v == 'string') ? v : v.c(); });
};

AST.dump = function (obj,key){
	if (obj instanceof Array) {
		return obj.map(function(v) { return (v && v.dump) ? v.dump(key) : v; });
	} else if (obj && obj.dump) {
		return obj.dump();
	};
};

AST.compact = function (ary){
	if (ary instanceof ListNode) {
		return ary.compact();
	};
	
	
	return ary.filter(function(v) { return v != undefined && v != null; });
};

AST.reduce = function (res,ary){
	for (var i = 0, items = iter$(ary), len = items.length, v1; i < len; i++) {
		v1 = items[i];
		(v1 instanceof Array) ? AST.reduce(res,v1) : res.push(v1);
	};
	return;
};

AST.flatten = function (ary,compact){
	if(compact === undefined) compact = false;
	var out = [];
	for (var i = 0, items = iter$(ary), len = items.length, v1; i < len; i++) {
		v1 = items[i];
		(v1 instanceof Array) ? AST.reduce(out,v1) : out.push(v1);
	};
	return out;
};

AST.loc = function (item){
	if (!item) {
		return [0,0];
	} else if (item instanceof Token) {
		return item.region();
	} else if (item instanceof Node) {
		return item.loc();
	};
};

AST.parse = function (str,opts){
	if(opts === undefined) opts = {};
	var indent = str.match(/\t+/)[0];
	// really? Require the compiler, not this
	return Imbac.parse(str,opts);
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


var shortRefCache = [];

AST.counterToShortRef = function (nr){
	var base = "A".charCodeAt(0);
	
	while (shortRefCache.length <= nr){
		var num = shortRefCache.length + 1;
		var str = "";
		
		while (true){
			num -= 1;
			str = String.fromCharCode(base + (num % 26)) + str;
			num = Math.floor(num / 26);
			if (num <= 0) { break; };
		};
		
		shortRefCache.push(str);
	};
	return shortRefCache[nr];
};

AST.truthy = function (node){
	
	if (node instanceof True) {
		return true;
	};
	
	if (node instanceof False) {
		return false;
	};
	
	if (node.isTruthy) {
		return node.isTruthy();
	};
	
	return undefined;
};

function Indentation(a,b){
	this._open = a;
	this._close = b;
	this;
};

exports.Indentation = Indentation; // export class 
Indentation.prototype.open = function(v){ return this._open; }
Indentation.prototype.setOpen = function(v){ this._open = v; return this; };
Indentation.prototype.close = function(v){ return this._close; }
Indentation.prototype.setClose = function(v){ this._close = v; return this; };

Indentation.prototype.isGenerated = function (){
	return this._open && this._open.generated;
};

Indentation.prototype.aloc = function (){
	return this._open && this._open._loc || 0;
};

Indentation.prototype.bloc = function (){
	return this._close && this._close._loc || 0;
};

Indentation.prototype.wrap = function (str){
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

function Stash(){
	this._entities = [];
};

Stash.prototype.add = function (item){
	this._entities.unshift(item);
	return this;
};

Stash.prototype.pluck = function (item){
	var match = null;
	for (var i = 0, items = iter$(this._entities), len = items.length, entity; i < len; i++) {
		entity = items[i];
		if (entity == item || (entity instanceof item)) {
			match = entity;
			this._entities.splice(i,1);
			return match;
		};
	};
	return null;
};


function Stack(){
	this.reset();
};

exports.Stack = Stack; // export class 
Stack.prototype.loglevel = function(v){ return this._loglevel; }
Stack.prototype.setLoglevel = function(v){ this._loglevel = v; return this; };
Stack.prototype.nodes = function(v){ return this._nodes; }
Stack.prototype.setNodes = function(v){ this._nodes = v; return this; };
Stack.prototype.scopes = function(v){ return this._scopes; }
Stack.prototype.setScopes = function(v){ this._scopes = v; return this; };

Stack.prototype.reset = function (){
	this._nodes = [];
	this._scoping = [];
	this._scopes = [];
	this._stash = new Stash(this);
	this._loglevel = 3;
	this._counter = 0;
	this._counters = {};
	this._options = {};
	this._es6 = null;
	this._es5 = null;
	this._optlevel = null;
	this._tag = null;
	
	if (NODE_MAJOR_VERSION && NODE_MAJOR_VERSION < 5) {
		this._es5 = true;
	};
	return this;
};

Stack.prototype.incr = function (name){
	this._counters[name] || (this._counters[name] = 0);
	return this._counters[name] += 1;
};

Stack.prototype.decr = function (name){
	this._counters[name] || (this._counters[name] = 0);
	return this._counters[name] -= 1;
};

Stack.prototype.stash = function (){
	return this._stash;
};

Stack.prototype.option = function (key){
	return this._options && this._options[key];
};

Stack.prototype.platform = function (){
	return this._options.target;
};

Stack.prototype.filename = function (){
	return this._options.filename;
};

Stack.prototype.sourcePath = function (){
	return this._options.sourcePath;
};

Stack.prototype.es6 = function (){
	return (this._es6 == null) ? (this._es6 = !(!(this._options.es6 || this._options.es2015 || this.env('IMBA_ES6')))) : this._es6;
};

Stack.prototype.es5 = function (){
	return (this._es5 == null) ? (this._es5 = !(!(this._options.es5 || this.env('IMBA_ES5')))) : this._es5;
};

Stack.prototype.autocall = function (){
	return !this.option('explicitParens');
	// !@options:explicitParens
};

Stack.prototype.optlevel = function (){
	return (this._optlevel == null) ? (this._optlevel = ((this._options.conservative || this.env('IMBA_CONSERVATIVE')) ? 0 : ((this._options.optlevel || 9)))) : this._optlevel; // stack.option(:conservative)
};

Stack.prototype.env = function (key){
	var e;
	var val = this._options[("ENV_" + key)];
	if (val != undefined) { return val };
	
	var lowercased = key.toLowerCase();
	
	if (this._options[lowercased] != undefined) {
		return this._options[lowercased];
	};
	
	// temporary shorthand
	if (lowercased == 'es6') {
		return this.es6();
	};
	
	if (lowercased == 'es5') {
		return this.es5();
	};
	
	if (this.platform() && idx$(key,['WEB','NODE','WEBWORKER']) >= 0) {
		return this.platform().toUpperCase() == key;
	};
	
	// console.log 'lookup env var',key,@options:env
	
	if (e = this._options.env) {
		if (e.hasOwnProperty(key)) {
			return e[key];
		} else if (e.hasOwnProperty(key.toLowerCase())) {
			return e[key.toLowerCase()];
		};
	};
	
	if (true && typeof process != 'undefined' && process.env) {
		val = process.env[key.toUpperCase()];
		if (val != undefined) {
			return val;
		};
		return null;
	};
	
	return undefined;
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
	return (idx >= 0) ? this._nodes[idx + offset] : null;
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

Stack.prototype.block = function (){
	return this.up(Block);
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
	return ("Stack(" + this._nodes.join(" -> ") + ")");
};

Stack.prototype.isAnalyzing = function (){
	return this._analyzing;
};

Stack.prototype.scoping = function (){
	return this._nodes.filter(function(n) { return n._scope; }).map(function(n) { return n._scope; });
};

// Lots of globals -- really need to deal with one stack per file / context
var STACK = exports.STACK = new Stack();

// use a bitmask for these

function Node(){
	this.setup();
	this;
};

exports.Node = Node; // export class 
Node.prototype.o = function(v){ return this._o; }
Node.prototype.setO = function(v){ this._o = v; return this; };
Node.prototype.options = function(v){ return this._options; }
Node.prototype.setOptions = function(v){ this._options = v; return this; };
Node.prototype.traversed = function(v){ return this._traversed; }
Node.prototype.setTraversed = function(v){ this._traversed = v; return this; };

Node.prototype.safechain = function (){
	return false;
};

Node.prototype.p = function (){
	// allow controlling this from CLI
	if (STACK.loglevel() > 0) {
		console.log.apply(console,arguments);
	};
	return this;
};

Node.prototype.typeName = function (){
	return this.constructor.name;
};

Node.prototype.namepath = function (){
	return this.typeName();
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
	this._options || (this._options = {});
	for (var v1, i = 0, keys = Object.keys(obj), l = keys.length, k; i < l; i++){
		k = keys[i];v1 = obj[k];this._options[k] = v1;
	};
	return this;
};

// get and set
Node.prototype.option = function (key,val){
	if (val != undefined) {
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

Node.prototype.token = function (){
	return null;
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
	return ("" + (this.constructor.name));
};

// swallow might be better name
Node.prototype.consume = function (node){
	if (node instanceof PushAssign) {
		node.register(this);
		return new PushAssign(node.op(),node.left(),this);
	};
	
	if (node instanceof Assign) {
		// node.right = self
		return OP(node.op(),node.left(),this);
	} else if (node instanceof Op) {
		return OP(node.op(),node.left(),this);
	} else if (node instanceof Return) {
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

Node.prototype.shouldParenthesizeInTernary = function (){
	return true;
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
	this._indentation || (this._indentation = (a && b) ? new Indentation(a,b) : INDENT);
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
	o.var = (o.scope || this.scope__()).temporary(this,o);
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
		if (!ch.manual) { out = ("" + (ch.var.c()) + " = " + out) };
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
ValueNode.prototype.value = function(v){ return this._value; }
ValueNode.prototype.setValue = function(v){ this._value = v; return this; };

ValueNode.prototype.load = function (value){
	return value;
};

ValueNode.prototype.js = function (o){
	return (typeof this._value == 'string') ? this._value : this._value.c();
};

ValueNode.prototype.visit = function (){
	
	if (this._value instanceof Node) { this._value.traverse() }; //  && @value:traverse
	return this;
};

ValueNode.prototype.region = function (){
	return [this._value._loc,this._value._loc + this._value._len];
};


function Statement(){ return ValueNode.apply(this,arguments) };

subclass$(Statement,ValueNode);
exports.Statement = Statement; // export class 
Statement.prototype.isExpressable = function (){
	return false;
};


function Meta(){ return ValueNode.apply(this,arguments) };

subclass$(Meta,ValueNode);
exports.Meta = Meta; // export class 
Meta.prototype.isPrimitive = function (deep){
	return true;
};

function Comment(){ return Meta.apply(this,arguments) };

subclass$(Comment,Meta);
exports.Comment = Comment; // export class 
Comment.prototype.visit = function (){
	var m, block, next;
	if (this._value.type() == 'HERECOMMENT') {
		
		var raw = this._value._value;
		var line = raw.slice(0,raw.indexOf('\n')).trim();
		
		if (m = line.match(/^(css|less|stylus|sass|scss)( scoped)?/)) {
			var style = {
				content: raw.slice(raw.indexOf('\n')),
				scoped: !(!m[2]),
				type: m[1],
				attrs: {}
			};
			this.scope__().root().styles().push(style);
		};
	};
	
	if (block = this.up()) {
		var idx = block.indexOf(this) + 1;
		if (block.index(idx) instanceof Terminator) { idx += 1 };
		if (next = block.index(idx)) {
			next._desc = this;
		};
	};
	
	return this;
};

Comment.prototype.toDoc = function (){
	return helpers.normalizeIndentation("" + this._value._value);
};

Comment.prototype.toJSON = function (){
	return helpers.normalizeIndentation("" + this._value._value);
};

Comment.prototype.c = function (o){
	if (STACK.option('comments') == false) { return "" };
	var v = this._value._value;
	if (o && o.expression || v.match(/\n/) || this._value.type() == 'HERECOMMENT') { // multiline?
		return ("/*" + v + "*/");
	} else {
		return ("// " + v);
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

Terminator.prototype.loc = function (){
	return [this._value._loc,this._value._loc + this._value._value.length];
};

Terminator.prototype.c = function (){
	var val = this._value.c();
	if (STACK.option('comments') == false) {
		val = val.replace(/\/\/.*$/gm,'');
	};
	return val;
};

function Newline(v){
	this._traversed = false;
	this._value = v || '\n';
};

subclass$(Newline,Terminator);
exports.Newline = Newline; // export class 
Newline.prototype.c = function (){
	return AST.c(this._value);
};


// weird place?
function Index(){ return ValueNode.apply(this,arguments) };

subclass$(Index,ValueNode);
exports.Index = Index; // export class 
Index.prototype.cache = function (o){
	if(o === undefined) o = {};
	return this._value.cache(o);
};

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
ListNode.prototype.nodes = function(v){ return this._nodes; }
ListNode.prototype.setNodes = function(v){ this._nodes = v; return this; };

ListNode.prototype.list = function (){
	return this._nodes;
};

ListNode.prototype.compact = function (){
	this._nodes = AST.compact(this._nodes);
	return this;
};

ListNode.prototype.load = function (list){
	return list;
};

ListNode.prototype.concat = function (other){
	// need to store indented content as well?
	this._nodes = this.nodes().concat((other instanceof Array) ? other : other.nodes());
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
	pre ? this.unshift(br) : this.push(br);
	return this;
};

ListNode.prototype.some = function (cb){
	for (var i = 0, items = iter$(this._nodes), len = items.length, node; i < len; i++) {
		node = items[i];
		if (cb(node)) { return true };
	};
	return false;
};

ListNode.prototype.every = function (cb){
	for (var i = 0, items = iter$(this._nodes), len = items.length, node; i < len; i++) {
		node = items[i];
		if (!cb(node)) { return false };
	};
	return true;
};

// filtered list of items
ListNode.prototype.values = function (){
	return this._nodes.filter(function(item) { return !(item instanceof Meta); });
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
			this._nodes.splice.apply(this._nodes,[].concat([idx,1], Array.from(replacement)));
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
	for (var i = 0, items = iter$(this._nodes), len = items.length, node; i < len; i++) {
		node = items[i];
		if (node && !(node instanceof Meta)) { k++ };
	};
	return k;
};

ListNode.prototype.visit = function (){
	for (var i = 0, items = iter$(this._nodes), len = items.length, node; i < len; i++) {
		node = items[i];
		node && node.traverse();
	};
	return this;
};

ListNode.prototype.isExpressable = function (){
	for (var i = 0, items = iter$(this.nodes()), len = items.length, node; i < len; i++) {
		node = items[i];
		if (node && !node.isExpressable()) { return false };
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
	var nodes = pars.nodes !== undefined ? pars.nodes : this._nodes;
	var delim = ',';
	var express = delim != ';';
	var last = this.last();
	
	var i = 0;
	var l = nodes.length;
	var str = "";
	
	for (var j = 0, items = iter$(nodes), len = items.length, arg; j < len; j++) {
		arg = items[j];
		var part = (typeof arg == 'string') ? arg : ((arg ? arg.c({expression: express}) : ''));
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
	
	this._indentation || (this._indentation = (a && b) ? new Indentation(a,b) : INDENT);
	return this;
};


function ArgList(){ return ListNode.apply(this,arguments) };

subclass$(ArgList,ListNode);
exports.ArgList = ArgList; // export class 


function AssignList(){ return ArgList.apply(this,arguments) };

subclass$(AssignList,ArgList);
exports.AssignList = AssignList; // export class 
AssignList.prototype.concat = function (other){
	if (this._nodes.length == 0 && (other instanceof AssignList)) {
		return other;
	} else {
		AssignList.prototype.__super__.concat.call(this,other);
	};
	// need to store indented content as well?
	// @nodes = nodes.concat(other isa Array ? other : other.nodes)
	return this;
};


function Block(list){
	this.setup();
	this._nodes = list || [];
	this._head = null;
	this._indentation = null;
};

subclass$(Block,ListNode);
exports.Block = Block; // export class 
Block.prototype.head = function(v){ return this._head; }
Block.prototype.setHead = function(v){ this._head = v; return this; };

Block.wrap = function (ary){
	if (!((ary instanceof Array))) {
		throw new SyntaxError("what");
	};
	return (ary.length == 1 && (ary[0] instanceof Block)) ? ary[0] : new Block(ary);
};

Block.prototype.visit = function (stack){
	if (this._scope) { this._scope.visit() };
	
	for (var i = 0, items = iter$(this._nodes), len = items.length, node; i < len; i++) {
		node = items[i];
		node && node.traverse();
	};
	
	if (stack && stack._tag && !stack._tag._tagLoop) {
		this._tag = stack._tag;
		var real = this.expressions();
		// we need to compare the real length
		if (real.length > 1) {
			var nr = this._tag.childCacher().nextBlock(); //  @tag.blocks.push(self)
			var arr = new Arr(new ArgList(this._nodes));
			arr.indented(this._indentation);
			var isStatic = real.every(function(item) { return item instanceof Tag; });
			var typ = isStatic ? 2 : 1;
			this.set({treeType: typ});
			this._indentation = null;
			if (true) {
				this._nodes = [Util.callImba(this.scope__(),"static",[arr,new Num(typ),nr])];
			};
		};
	};
	return this;
};

Block.prototype.block = function (){
	return this;
};

Block.prototype.collectDecorators = function (){
	var decorators;
	if (decorators = this._decorators) {
		this._decorators = null;
		return decorators;
	};
};

Block.prototype.loc = function (){
	// rather indents, no?
	var opt, ind;
	if (opt = this.option('ends')) {
		var a = opt[0].loc();
		var b = opt[1].loc();
		
		if (!a) { this.p(("no loc for " + (opt[0]))) };
		if (!b) { this.p(("no loc for " + (opt[1]))) };
		
		return [a[0],b[1]];
	};
	
	if (ind = this._indentation) {
		if (ind.aloc() != -1) {
			return [ind.aloc(),ind.bloc()];
		};
	};
	
	a = this._nodes[0];
	b = this._nodes[this._nodes.length - 1];
	
	return [a && a.loc()[0] || 0,b && b.loc()[1] || 0];
};

// go through children and unwrap inner nodes
Block.prototype.unwrap = function (){
	var ary = [];
	for (var i = 0, items = iter$(this.nodes()), len = items.length, node; i < len; i++) {
		node = items[i];
		if (node instanceof Block) {
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
	if(o === undefined) o = {};
	return this;
};

Block.prototype.cpart = function (node){
	var out = (typeof node == 'string') ? node : ((node ? node.c() : ""));
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
	if (ast.length == 0) { return '' };
	
	if (express) {
		return Block.prototype.__super__.js.call(this,o,{nodes: ast});
	};
	
	var str = "";
	
	for (var i = 0, items = iter$(ast), len = items.length; i < len; i++) {
		str += this.cpart(items[i]);
	};
	
	// now add the head items as well
	if (this._head && this._head.length > 0) {
		var prefix = "";
		for (var j = 0, ary = iter$(this._head), len_ = ary.length; j < len_; j++) {
			var hv = this.cpart(ary[j]);
			if (hv) { prefix += hv + '\n' };
		};
		str = prefix + str;
	};
	
	if (this.option('strict')) {
		str = this.cpart('"use strict";\n') + str;
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
	for (var i = 0, items = iter$(this.nodes()), len = items.length, node; i < len; i++) {
		node = items[i];
		if (!((node instanceof Terminator))) { expressions.push(node) };
	};
	return expressions;
};


Block.prototype.consume = function (node){
	var before;
	if (node instanceof TagPushAssign) {
		var real = this.expressions();
		
		this._nodes = this._nodes.map(function(child) {
			if (idx$(child,real) >= 0 && !(child instanceof Assign)) {
				return child.consume(node);
			} else {
				return child;
			};
		});
		
		return this;
	};
	
	// can also return super if it is expressable, but should we really?
	if (before = this.last()) {
		var after = before.consume(node);
		if (after != before) {
			if (after instanceof Block) {
				after = after.nodes();
			};
			
			this.replace(before,after);
		};
	};
	
	return this;
};


Block.prototype.isExpressable = function (){
	if (!this._nodes.every(function(v) { return v.isExpressable(); })) { return false };
	return true;
};

Block.prototype.isExpression = function (){
	
	return this.option('express') || this._expression;
};

Block.prototype.shouldParenthesizeInTernary = function (){
	if (this.count() == 1) {
		return this.first().shouldParenthesizeInTernary();
	};
	
	return true;
};


// this is almost like the old VarDeclarations but without the values
function VarBlock(){ return ListNode.apply(this,arguments) };

subclass$(VarBlock,ListNode);
exports.VarBlock = VarBlock; // export class 
VarBlock.prototype.load = function (list){
	var first = list[0];
	
	if (first instanceof Assign) {
		this._type = first.left()._type;
	} else if (first instanceof VarReference) {
		this._type = first._type;
	};
	// @type = list[0] and list[0].type
	return list;
};

// TODO All these inner items should rather be straight up literals
// or basic localvars - without any care whatsoever about adding var to the
// beginning etc.
VarBlock.prototype.addExpression = function (expr){
	
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
	var code = AST.compact(AST.flatten(AST.cary(this.nodes())));
	code = code.filter(function(n) { return n != null && n != undefined && n != EMPTY; });
	var out = code.join(",");
	
	// are we sure?
	var keyword = o.es5() ? 'var' : ((this._type || 'var'));
	// we just need to trust that the variables have been autodeclared beforehand
	// if we are inside an expression
	if (!o.isExpression()) { out = ("" + keyword + " ") + out };
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
	return ((value instanceof Block) && value.count() == 1) ? value.first() : value;
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
	
	if (par instanceof Block) {
		// is it worth it?
		if (!o.isExpression()) { this._noparen = true };
		str = (v instanceof Array) ? AST.cary(v) : v.c({expression: o.isExpression()});
	} else {
		str = (v instanceof Array) ? AST.cary(v) : v.c({expression: true});
	};
	
	// check if we really need parens here?
	return str;
};

Parens.prototype.set = function (obj){
	console.log(("Parens set " + JSON.stringify(obj)));
	return Parens.prototype.__super__.set.call(this,obj);
};


Parens.prototype.shouldParenthesize = function (){
	// no need to parenthesize if this is a line in a block
	if (this._noparen) { return false }; //  or par isa ArgList
	return true;
};


Parens.prototype.prebreak = function (br){
	Parens.prototype.__super__.prebreak.call(this,br);
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
function ExpressionBlock(){ return ListNode.apply(this,arguments) };

subclass$(ExpressionBlock,ListNode);
exports.ExpressionBlock = ExpressionBlock; // export class 
ExpressionBlock.prototype.c = function (o){
	return this.map(function(item) { return item.c(o); }).join(",");
};

ExpressionBlock.prototype.consume = function (node){
	return this.value().consume(node);
};

ExpressionBlock.prototype.addExpression = function (expr){
	// Need to take care of the splat here to.. hazzle
	if (expr.node() instanceof Assign) {
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
	this._value = ((v instanceof ArgList) && v.count() == 1) ? v.last() : v;
	return this;
};

subclass$(Return,Statement);
exports.Return = Return; // export class 
Return.prototype.value = function(v){ return this._value; }
Return.prototype.setValue = function(v){ this._value = v; return this; };

Return.prototype.visit = function (){
	if (this._value && this._value.traverse) { return this._value.traverse() };
};

Return.prototype.js = function (o){
	var v = this._value;
	
	if (v instanceof ArgList) {
		return ("return [" + v.c({expression: true}) + "]");
	} else if (v) {
		return ("return " + v.c({expression: true}));
	} else {
		return "return";
	};
};

Return.prototype.c = function (){
	if (!(this.value()) || this.value().isExpressable()) { return Return.prototype.__super__.c.apply(this,arguments) };
	return this.value().consume(this).c();
};

Return.prototype.consume = function (node){
	return this;
};

function ImplicitReturn(){ return Return.apply(this,arguments) };

subclass$(ImplicitReturn,Return);
exports.ImplicitReturn = ImplicitReturn; // export class 


function GreedyReturn(){ return ImplicitReturn.apply(this,arguments) };

subclass$(GreedyReturn,ImplicitReturn);
exports.GreedyReturn = GreedyReturn; // export class 


// cannot live inside an expression(!)
function Throw(){ return Statement.apply(this,arguments) };

subclass$(Throw,Statement);
exports.Throw = Throw; // export class 
Throw.prototype.js = function (o){
	return ("throw " + (this.value().c()));
};

Throw.prototype.consume = function (node){
	// ROADMAP should possibly consume to the value of throw and then throw?
	return this;
};


function LoopFlowStatement(lit,expr){
	this.setLiteral(lit);
	this.setExpression(expr);
};

subclass$(LoopFlowStatement,Statement);
exports.LoopFlowStatement = LoopFlowStatement; // export class 
LoopFlowStatement.prototype.literal = function(v){ return this._literal; }
LoopFlowStatement.prototype.setLiteral = function(v){ this._literal = v; return this; };
LoopFlowStatement.prototype.expression = function(v){ return this._expression; }
LoopFlowStatement.prototype.setExpression = function(v){ this._expression = v; return this; };

LoopFlowStatement.prototype.visit = function (){
	if (this.expression()) { return this.expression().traverse() };
};

LoopFlowStatement.prototype.consume = function (node){
	return this;
};

LoopFlowStatement.prototype.c = function (){
	if (!(this.expression())) { return LoopFlowStatement.prototype.__super__.c.apply(this,arguments) };
	// get up to the outer loop
	var _loop = STACK.up(Loop);
	
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
		return LoopFlowStatement.prototype.__super__.c.apply(this,arguments);
	};
	// return "loopflow"
};


function BreakStatement(){ return LoopFlowStatement.apply(this,arguments) };

subclass$(BreakStatement,LoopFlowStatement);
exports.BreakStatement = BreakStatement; // export class 
BreakStatement.prototype.js = function (o){
	return "break";
};

function ContinueStatement(){ return LoopFlowStatement.apply(this,arguments) };

subclass$(ContinueStatement,LoopFlowStatement);
exports.ContinueStatement = ContinueStatement; // export class 
ContinueStatement.prototype.js = function (o){
	return "continue";
};

function DebuggerStatement(){ return Statement.apply(this,arguments) };

subclass$(DebuggerStatement,Statement);
exports.DebuggerStatement = DebuggerStatement; // export class 



// PARAMS

function Param(name,defaults,typ){
	// could have introduced bugs by moving back to identifier here
	this._traversed = false;
	this._name = name;
	this._defaults = defaults;
	this._typ = typ;
	this._variable = null;
};

subclass$(Param,Node);
exports.Param = Param; // export class 
Param.prototype.name = function(v){ return this._name; }
Param.prototype.setName = function(v){ this._name = v; return this; };
Param.prototype.index = function(v){ return this._index; }
Param.prototype.setIndex = function(v){ this._index = v; return this; };
Param.prototype.defaults = function(v){ return this._defaults; }
Param.prototype.setDefaults = function(v){ this._defaults = v; return this; };
Param.prototype.splat = function(v){ return this._splat; }
Param.prototype.setSplat = function(v){ this._splat = v; return this; };
Param.prototype.variable = function(v){ return this._variable; }
Param.prototype.setVariable = function(v){ this._variable = v; return this; };

Param.prototype.varname = function (){
	return this._variable ? this._variable.c() : this.name();
};

Param.prototype.js = function (o){
	if (this._variable) { return this._variable.c() };
	
	if (this.defaults()) {
		// should not include any source-mapping here?
		return ("if(" + (this.name().c()) + " == null) " + (this.name().c()) + " = " + (this.defaults().c()));
	};
	// see if this is the initial declarator?
};

Param.prototype.visit = function (){
	var variable_, v_;
	if (this._defaults) { this._defaults.traverse() };
	(variable_ = this.variable()) || ((this.setVariable(v_ = this.scope__().register(this.name(),this)),v_));
	
	if (this._name instanceof Identifier) {
		// change type here?
		if (this._name._value) { this._name._value._type = "PARAMVAR" };
		this._name.references(this._variable);
		this._variable.addReference(this._name);
	};
	
	return this;
};

Param.prototype.assignment = function (){
	return OP('=',this.variable().accessor(),this.defaults());
};

Param.prototype.isExpressable = function (){
	return !(this.defaults()) || this.defaults().isExpressable();
};

Param.prototype.dump = function (){
	return {loc: this.loc()};
};

Param.prototype.loc = function (){
	return this._name && this._name.region();
};

Param.prototype.toJSON = function (){
	return {
		type: this.typeName(),
		name: this.name(),
		defaults: this.defaults()
	};
};


function SplatParam(){ return Param.apply(this,arguments) };

subclass$(SplatParam,Param);
exports.SplatParam = SplatParam; // export class 
SplatParam.prototype.loc = function (){
	// hacky.. cannot know for sure that this is right?
	var r = this.name().region();
	return [r[0] - 1,r[1]];
};

function BlockParam(){ return Param.apply(this,arguments) };

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


function OptionalParam(){ return Param.apply(this,arguments) };

subclass$(OptionalParam,Param);
exports.OptionalParam = OptionalParam; // export class 


function NamedParam(){ return Param.apply(this,arguments) };

subclass$(NamedParam,Param);
exports.NamedParam = NamedParam; // export class 


function RequiredParam(){ return Param.apply(this,arguments) };

subclass$(RequiredParam,Param);
exports.RequiredParam = RequiredParam; // export class 


function NamedParams(){ return ListNode.apply(this,arguments) };

subclass$(NamedParams,ListNode);
exports.NamedParams = NamedParams; // export class 
NamedParams.prototype.index = function(v){ return this._index; }
NamedParams.prototype.setIndex = function(v){ this._index = v; return this; };
NamedParams.prototype.variable = function(v){ return this._variable; }
NamedParams.prototype.setVariable = function(v){ this._variable = v; return this; };

NamedParams.prototype.load = function (list){
	var load = function(k) { return new NamedParam(k.key(),k.value()); };
	return (list instanceof Obj) ? list.value().map(load) : list;
};

NamedParams.prototype.visit = function (){
	var s = this.scope__();
	this._variable || (this._variable = s.temporary(this,{pool: 'keypars'}));
	this._variable.predeclared();
	
	// this is a listnode, which will automatically traverse
	// and visit all children
	NamedParams.prototype.__super__.visit.apply(this,arguments);
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

NamedParams.prototype.toJSON = function (){
	return {
		type: this.typeName(),
		nodes: this.filter(function(v) { return v instanceof NamedParam; })
	};
};


function IndexedParam(){ return Param.apply(this,arguments) };

subclass$(IndexedParam,Param);
exports.IndexedParam = IndexedParam; // export class 
IndexedParam.prototype.parent = function(v){ return this._parent; }
IndexedParam.prototype.setParent = function(v){ this._parent = v; return this; };
IndexedParam.prototype.subindex = function(v){ return this._subindex; }
IndexedParam.prototype.setSubindex = function(v){ this._subindex = v; return this; };

IndexedParam.prototype.visit = function (){
	// BUG The defaults should probably be looked up like vars
	var variable_, v_;
	(variable_ = this.variable()) || ((this.setVariable(v_ = this.scope__().register(this.name(),this)),v_));
	this.variable().proxy(this.parent().variable(),this.subindex());
	return this;
};


function ArrayParams(){ return ListNode.apply(this,arguments) };

subclass$(ArrayParams,ListNode);
exports.ArrayParams = ArrayParams; // export class 
ArrayParams.prototype.index = function(v){ return this._index; }
ArrayParams.prototype.setIndex = function(v){ this._index = v; return this; };
ArrayParams.prototype.variable = function(v){ return this._variable; }
ArrayParams.prototype.setVariable = function(v){ this._variable = v; return this; };

ArrayParams.prototype.visit = function (){
	var s = this.scope__();
	this._variable || (this._variable = s.temporary(this,{pool: 'keypars'}));
	this._variable.predeclared();
	
	// now when we loop through these inner params - we create the pars
	// with the correct name, but bind them to the parent
	return ArrayParams.prototype.__super__.visit.apply(this,arguments);
};

ArrayParams.prototype.name = function (){
	return this.variable().c();
};

ArrayParams.prototype.load = function (list){
	var self = this;
	if (!((list instanceof Arr))) { return null };
	// try the basic first
	if (!list.splat()) {
		return list.value().map(function(v,i) {
			// must make sure the params are supported here
			// should really not parse any array at all(!)
			var name = v;
			if (v instanceof VarOrAccess) {
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
	return this;
};

function ParamList(){ return ListNode.apply(this,arguments) };

subclass$(ParamList,ListNode);
exports.ParamList = ParamList; // export class 
ParamList.prototype.splat = function(v){ return this._splat; }
ParamList.prototype.setSplat = function(v){ this._splat = v; return this; };
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

ParamList.prototype.metadata = function (){
	return this.filter(function(par) { return !(par instanceof Meta); });
};

ParamList.prototype.toJSON = function (){
	return this.metadata();
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
	return ParamList.prototype.__super__.visit.apply(this,arguments);
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
		return AST.compact(pars.map(function(arg) { return AST.c(arg.varname()); })).join(",");
	} else {
		throw "not implemented paramlist js";
		return "ta" + AST.compact(this.map(function(arg) { return arg.c(); })).join(",");
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
	var isFunc = function(js) { return ("typeof " + js + " == 'function'"); };
	
	// This is broken when dealing with iframes anc XSS scripting
	// but for now it is the best test for actual arguments
	// can also do constructor.name == 'Object'
	var isObj = function(js) { return ("" + js + ".constructor === Object"); };
	var isntObj = function(js) { return ("" + js + ".constructor !== Object"); };
	// should handle some common cases in a cleaner (less verbose) manner
	// does this work with default params after optional ones? Is that even worth anything?
	// this only works in one direction now, unlike TupleAssign
	
	// we dont really check the length etc now -- so it is buggy for lots of arguments
	
	// if we have optional params in the regular order etc we can go the easy route
	// slightly hacky now. Should refactor all of these to use the signature?
	if (!named && !splat && !blk && opt.length > 0 && signature.join(" ").match(/opt$/)) {
		for (var i = 0, len_ = opt.length, par; i < len_; i++) {
			par = opt[i];
			ast.push(("if(" + (par.name().c()) + " === undefined) " + (par.name().c()) + " = " + (par.defaults().c())));
		};
	} else if (named && !splat && !blk && opt.length == 0) { // and no block?!
		// different shorthands
		// if named
		ast.push(("if(!" + (namedvar.c()) + "||" + isntObj(namedvar.c()) + ") " + (namedvar.c()) + " = \{\}"));
	} else if (blk && opt.length == 1 && !splat && !named) {
		var op = opt[0];
		var opn = op.name().c();
		var bn = blk.name().c();
		ast.push(("if(" + bn + "==undefined && " + isFunc(opn) + ") " + bn + " = " + opn + "," + opn + " = " + (op.defaults().c())));
		ast.push(("if(" + opn + "==undefined) " + opn + " = " + (op.defaults().c())));
	} else if (blk && named && opt.length == 0 && !splat) {
		bn = blk.name().c();
		ast.push(("if(" + bn + "==undefined && " + isFunc(namedvar.c()) + ") " + bn + " = " + (namedvar.c()) + "," + (namedvar.c()) + " = \{\}"));
		ast.push(("else if(!" + (namedvar.c()) + "||" + isntObj(namedvar.c()) + ") " + (namedvar.c()) + " = \{\}"));
	} else if (opt.length > 0 || splat) { // && blk  # && !splat
		
		var argvar = this.scope__().temporary(this,{pool: 'arguments'}).predeclared().c();
		var len = this.scope__().temporary(this,{pool: 'counter'}).predeclared().c();
		
		var last = ("" + argvar + "[" + len + "-1]");
		var pop = ("" + argvar + "[--" + len + "]");
		ast.push(("var " + argvar + " = arguments, " + len + " = " + argvar + ".length"));
		
		if (blk) {
			bn = blk.name().c();
			if (splat) {
				ast.push(("var " + bn + " = " + isFunc(last) + " ? " + pop + " : null"));
			} else if (reg.length > 0) {
				// ast.push "// several regs really?"
				ast.push(("var " + bn + " = " + len + " > " + (reg.length) + " && " + isFunc(last) + " ? " + pop + " : null"));
			} else {
				ast.push(("var " + bn + " = " + isFunc(last) + " ? " + pop + " : null"));
			};
		};
		
		// if we have named params - look for them before splat
		// should probably loop through pars in the same order they were added
		// should it be prioritized above optional objects??
		if (named) {
			// should not include it when there is a splat?
			ast.push(("var " + (namedvar.c()) + " = " + last + "&&" + isObj(last) + " ? " + pop + " : \{\}"));
		};
		
		for (var i1 = 0, len__ = opt.length, par1; i1 < len__; i1++) {
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
		for (var i2 = 0, len1 = opt.length, par2; i2 < len1; i2++) {
			par2 = opt[i2];
			ast.push(("if(" + (par2.name().c()) + " === undefined) " + (par2.name().c()) + " = " + (par2.defaults().c())));
		};
	};
	
	// now set stuff if named params(!)
	
	if (named) {
		for (var i3 = 0, items = iter$(named.nodes()), len2 = items.length, k; i3 < len2; i3++) {
			// console.log "named var {k.c}"
			k = items[i3];
			op = OP('.',namedvar,k.c()).c();
			ast.push(("var " + (k.c()) + " = " + op + " !== undefined ? " + op + " : " + (k.defaults().c())));
		};
	};
	
	if (arys.length) {
		for (var i4 = 0, len3 = arys.length; i4 < len3; i4++) {
			// create tuples
			arys[i4].head(o,ast,this);
			// ast.push v.c
		};
	};
	
	
	
	// if opt:length == 0
	return (ast.length > 0) ? ((ast.join(";\n") + ";")) : EMPTY;
};


// Legacy. Should move away from this?
function VariableDeclaration(){ return ListNode.apply(this,arguments) };

subclass$(VariableDeclaration,ListNode);
exports.VariableDeclaration = VariableDeclaration; // export class 
VariableDeclaration.prototype.kind = function(v){ return this._kind; }
VariableDeclaration.prototype.setKind = function(v){ this._kind = v; return this; };

// we want to register these variables in
VariableDeclaration.prototype.add = function (name,init,pos){
	if(pos === undefined) pos = -1;
	var vardec = new VariableDeclarator(name,init);
	if (name instanceof Variable) { (vardec.setVariable(name),name) };
	(pos == 0) ? this.unshift(vardec) : this.push(vardec);
	return vardec;
};

VariableDeclaration.prototype.load = function (list){
	// temporary solution!!!
	return list.map(function(par) { return new VariableDeclarator(par.name(),par.defaults(),par.splat()); });
};

VariableDeclaration.prototype.isExpressable = function (){
	return this.nodes().every(function(item) { return item.isExpressable(); });
};

VariableDeclaration.prototype.js = function (o){
	if (this.count() == 0) { return EMPTY };
	
	// When is this needed?
	if (this.count() == 1 && !(this.isExpressable())) {
		this.first().variable().autodeclare();
		var node = this.first().assignment();
		return node.c();
	};
	
	
	var keyword = 'var';
	var groups = {};
	
	this.nodes().forEach(function(item) {
		var typ = item._variable && item._variable.type();
		groups[typ] || (groups[typ] = []);
		return groups[typ].push(item._variable);
	});
	
	if (groups.let && (groups.var || groups.const)) {
		// console.warn "VariableDeclaration with both var and let",nodes.map(|v| v.@variable and v.@variable.c )
		groups.let.forEach(function(item) { return item._virtual = true; });
	} else if (groups.let && !o.es5()) {
		keyword = 'let';
	};
	
	// FIX PERFORMANCE
	var out = AST.compact(AST.cary(this.nodes())).join(", ");
	return out ? (("" + keyword + " " + out)) : "";
};

function VariableDeclarator(){ return Param.apply(this,arguments) };

subclass$(VariableDeclarator,Param);
exports.VariableDeclarator = VariableDeclarator; // export class 
VariableDeclarator.prototype.type = function(v){ return this._type; }
VariableDeclarator.prototype.setType = function(v){ this._type = v; return this; };
// can possibly create the variable immediately but wait with scope-declaring
// What if this is merely the declaration of a system/temporary variable?
VariableDeclarator.prototype.visit = function (){
	// even if we should traverse the defaults as if this variable does not exist
	// we need to preregister it and then activate it later
	var variable_, v_;
	(variable_ = this.variable()) || ((this.setVariable(v_ = this.scope__().register(this.name(),null,{type: this._type || 'var'})),v_));
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
		
		return ("" + (this.variable().c()) + " = " + defs);
	} else {
		return ("" + (this.variable().c()));
	};
};

VariableDeclarator.prototype.accessor = function (){
	return this;
};


// TODO clean up and refactor all the different representations of vars
// VarName, VarReference, LocalVarAccess?
function VarName(a,b){
	VarName.prototype.__super__.constructor.apply(this,arguments);
	this._splat = b;
};

subclass$(VarName,ValueNode);
exports.VarName = VarName; // export class 
VarName.prototype.variable = function(v){ return this._variable; }
VarName.prototype.setVariable = function(v){ this._variable = v; return this; };
VarName.prototype.splat = function(v){ return this._splat; }
VarName.prototype.setSplat = function(v){ this._splat = v; return this; };

VarName.prototype.visit = function (){
	// should we not lookup instead?
	// FIXME p "register value {value.c}"
	var variable_, v_;
	(variable_ = this.variable()) || ((this.setVariable(v_ = this.scope__().register(this.value().c(),null)),v_));
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
VarList.prototype.type = function(v){ return this._type; }
VarList.prototype.setType = function(v){ this._type = v; return this; }; // let / var / const
VarList.prototype.left = function(v){ return this._left; }
VarList.prototype.setLeft = function(v){ this._left = v; return this; };
VarList.prototype.right = function(v){ return this._right; }
VarList.prototype.setRight = function(v){ this._right = v; return this; };

// format :type, :left, :right

// should throw error if there are more values on right than left

VarList.prototype.visit = function (){
	
	// we need to carefully traverse children in the right order
	// since we should be able to reference
	var r;
	for (var i = 0, items = iter$(this.left()), len = items.length; i < len; i++) {
		items[i].traverse(); // this should really be a var-declaration
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
		for (var i = 0, items = iter$(this.left()), len = items.length, l; i < len; i++) {
			l = items[i];
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
				v = OP('.',r,new Num(i));
			};
			
			pairs.push(OP('=',l,v));
		};
	} else {
		for (var i1 = 0, ary = iter$(this.left()), len_ = ary.length, l1; i1 < len_; i1++) {
			l1 = ary[i1];
			r = this.right()[i1];
			pairs.push(r ? OP('=',l1.variable().accessor(),r) : l1);
		};
	};
	
	return ("var " + (pairs.c()));
};


// CODE

function Code(){ return Node.apply(this,arguments) };

subclass$(Code,Node);
exports.Code = Code; // export class 
Code.prototype.head = function(v){ return this._head; }
Code.prototype.setHead = function(v){ this._head = v; return this; };
Code.prototype.body = function(v){ return this._body; }
Code.prototype.setBody = function(v){ this._body = v; return this; };
Code.prototype.scope = function(v){ return this._scope; }
Code.prototype.setScope = function(v){ this._scope = v; return this; };
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
	this._traversed = false;
	this._body = AST.blk(body);
	this._scope = new RootScope(this,null);
	this._options = {};
};

subclass$(Root,Code);
exports.Root = Root; // export class 
Root.prototype.loc = function (){
	return this._body.loc();
};

Root.prototype.visit = function (){
	ROOT = STACK.ROOT = this._scope;
	this.scope().visit();
	return this.body().traverse();
};

Root.prototype.compile = function (o){
	STACK.reset(); // -- nested compilation does not work now
	OPTS = STACK._options = this._options = o || {};
	this.traverse();
	
	var out = this.c();
	var result = {
		js: out,
		ast: this,
		source: o._source,
		warnings: this.scope().warnings(),
		options: o,
		toString: function() { return this.js; },
		styles: this.scope().styles()
	};
	
	result.fileScopeId = o.sourcePath && helpers.identifierForPath(o.sourcePath);
	
	var stylebody = "";
	for (var i = 0, items = iter$(result.styles), len = items.length, style; i < len; i++) {
		style = items[i];
		if (style.type == 'css') {
			var scoping = style.scoped ? ('_' + result.fileScopeId) : null;
			style.processed = csscompiler.compile(style.content,{scope: scoping});
			stylebody += style.processed + '\n';
		};
	};
	
	if (stylebody && (o.inlineCss || (!STACK.env('WEBPACK') && o.target == 'web'))) {
		result.js = ("var styles = document.createElement('style');\nstyles.textContent = " + JSON.stringify(stylebody) + ";\ndocument.head.appendChild(styles);\n") + out;
		result.js = result.js.replace(/\/\*SCOPEID\*\//g,'"' + result.fileScopeId + '"');
	};
	
	if (o.sourceMapInline || o.sourceMap) {
		result.sourcemap = new SourceMap(result).generate();
	};
	
	return result;
};

Root.prototype.js = function (o){
	var out;
	if (!this._options.wrap) {
		out = this.scope().c();
	} else {
		this.body().consume(new ImplicitReturn());
		out = this.scope().c({indent: true});
		out = out.replace(/^\n?/,'\n');
		out = out.replace(/\n?$/,'\n\n');
		out = '(function(){' + out + '})();';
	};
	
	// find and replace shebangs
	var shebangs = [];
	out = out.replace(/^[ \t]*\/\/(\!.+)$/mg,function(m,shebang) {
		shebang = shebang.replace(/\bimba\b/g,'node');
		shebangs.push(("#" + shebang + "\n"));
		return "";
	});
	
	out = shebangs.join('') + out;
	
	return out;
};


Root.prototype.analyze = function (o){
	// loglevel: 0, entities: no, scopes: yes
	if(o === undefined) o = {};
	STACK.setLoglevel(o.loglevel || 0);
	STACK._analyzing = true;
	ROOT = STACK.ROOT = this._scope;
	OPTS = STACK._options = {
		target: o.target,
		loglevel: o.loglevel || 0,
		analysis: {
			entities: (o.entities || false),
			scopes: ((o.scopes == null) ? (o.scopes = true) : o.scopes)
		}
	};
	
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
	this._body = AST.blk(body);
	this._entities = {}; // items should register the entities as they come
	this;
};

subclass$(ClassDeclaration,Code);
exports.ClassDeclaration = ClassDeclaration; // export class 
ClassDeclaration.prototype.name = function(v){ return this._name; }
ClassDeclaration.prototype.setName = function(v){ this._name = v; return this; };
ClassDeclaration.prototype.superclass = function(v){ return this._superclass; }
ClassDeclaration.prototype.setSuperclass = function(v){ this._superclass = v; return this; };
ClassDeclaration.prototype.initor = function(v){ return this._initor; }
ClassDeclaration.prototype.setInitor = function(v){ this._initor = v; return this; };

ClassDeclaration.prototype.consume = function (node){
	if (node instanceof Return) {
		this.option('return',true);
		return this;
	};
	return ClassDeclaration.prototype.__super__.consume.apply(this,arguments);
};

ClassDeclaration.prototype.namepath = function (){
	return this._namepath || (this._namepath = ("" + (this.name().c())));
};

ClassDeclaration.prototype.metadata = function (){
	var superclass_;
	return {
		type: 'class',
		namepath: this.namepath(),
		inherits: (superclass_ = this.superclass()) && superclass_.namepath  &&  superclass_.namepath(),
		path: this.name().c().toString(),
		desc: this._desc,
		loc: this.loc(),
		symbols: this._scope.entities()
	};
};

ClassDeclaration.prototype.loc = function (){
	var d;
	if (d = this.option('keyword')) {
		return [d._loc,this.body().loc()[1]];
	} else {
		return ClassDeclaration.prototype.__super__.loc.apply(this,arguments);
	};
};

ClassDeclaration.prototype.toJSON = function (){
	return this.metadata();
};

ClassDeclaration.prototype.visit = function (){
	// replace with some advanced lookup?
	ROOT.entities().add(this.namepath(),this);
	this.scope().visit();
	this.body().traverse();
	return this;
};

ClassDeclaration.prototype.js = function (o){
	this.scope().virtualize(); // is this always needed?
	this.scope().context().setValue(this.name());
	this.scope().context().setReference(this.name());
	// should probably also warn about stuff etc
	if (this.option('extension')) {
		return this.body().c();
	};
	
	var head = [];
	var o = this._options || {};
	var cname = (this.name() instanceof Access) ? this.name().right() : this.name();
	var namespaced = this.name() != cname;
	var initor = null;
	var sup = this.superclass();
	
	var bodyindex = -1;
	var spaces = this.body().filter(function(item) { return item instanceof Terminator; });
	var mark = AST.mark(this.option('keyword'));
	
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
	
	var cpath = (typeof this.name() == 'string') ? this.name() : this.name().c();
	
	this._cname = cname;
	this._cpath = cpath;
	
	if (!initor) {
		if (sup) {
			initor = ("" + mark + "function " + cname + "()\{ return " + (sup.c()) + ".apply(this,arguments) \};\n\n");
		} else {
			initor = ("" + mark + "function " + cname + "()") + '{ };\n\n';
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
	};
	
	if (sup) {
		// console.log "deal with superclass!"
		// head.push("// extending the superclass\nimba$class({name.c},{sup.c});\n\n")
		head.push(new Util.Subclass([this.name(),sup]));
	};
	
	// now create a reference
	// let protoref = scope__.parent.temporary(self, pool: 'proto')
	// head.push("var {protoref} = {scope__.prototype.c}")
	// scope__.prototype.@value = protoref
	
	// only if it is not namespaced
	if (o.global && !namespaced) { // option(:global)
		var globalName = (STACK.platform() == 'web') ? "window" : "global";
		head.push(("" + globalName + "." + cname + " = " + cpath + "; // global class \n"))
	};
	
	if (o.export && !namespaced) {
		head.push(("exports." + (o.default ? 'default' : cname) + " = " + cpath + "; // export class \n"))
	};
	
	// FIXME
	// if namespaced and (o:local or o:export)
	// 	console.log "namespaced classes are implicitly local/global depending on the namespace"
	
	if (this.option('return')) {
		this.body().push(("return " + cpath + ";"));
	};
	
	for (var i = 0, items = iter$(head.reverse()), len = items.length; i < len; i++) {
		this.body().unshift(items[i]);
	};
	
	this.body()._indentation = null;
	var end = this.body().index(this.body().count() - 1);
	if ((end instanceof Terminator) && end.c().length == 1) { this.body().pop() };
	
	var out = this.body().c();
	
	return out;
};

function ModuleDeclaration(name,body){
	// what about the namespace?
	this._traversed = false;
	this._name = name;
	this._scope = new ModuleScope(this);
	this._body = AST.blk(body || []);
	this;
};

subclass$(ModuleDeclaration,Code);
exports.ModuleDeclaration = ModuleDeclaration; // export class 
ModuleDeclaration.prototype.name = function(v){ return this._name; }
ModuleDeclaration.prototype.setName = function(v){ this._name = v; return this; };

ModuleDeclaration.prototype.visit = function (){
	ROOT.entities().register(this); // what if this is not local?
	// replace with some advanced lookup?
	
	this.scope().visit();
	
	if (this._name) {
		var modname = String(this.name()._value || this.name());
		this.scope().parent().register(modname,this,{type: 'module'});
		// set the context of this here already?
		// scope.parent.declare(@name,null,system: yes)		
	};
	this.scope().context().setValue(this.scope().context()._reference = this._ctx = this.scope().declare('$mod$',null,{system: true}));
	return this.body().traverse();
};

ModuleDeclaration.prototype.js = function (o){
	var mark = AST.mark(this.option('keyword'));
	
	this.body().add(new ImplicitReturn(this._ctx));
	
	var cbody = this.body().c();
	
	var js = ("(function(" + (this._ctx.c()) + ")\{" + cbody + "\})(\{\})");
	
	var cname = this.name().c();
	// declare variable
	js = ("var " + cname + " = " + js);
	// only if it is not namespaced
	// if o:global and !namespaced # option(:global)
	//	js.push("global.{cname} = {cpath}; // global class \n")
	if (this.option('export')) {
		js = ("" + js + "\nexports." + (this.option('default') ? 'default' : cname) + " = " + cname + ";");
	};
	
	if (this.option('return')) {
		js += ("\nreturn " + cname + ";");
	};
	
	return js;
};


function TagDeclaration(name,superclass,body){
	this._traversed = false;
	this._name = name;
	this._superclass = superclass;
	this._scope = new TagScope(this);
	this._body = AST.blk(body || []);
};

subclass$(TagDeclaration,Code);
exports.TagDeclaration = TagDeclaration; // export class 
TagDeclaration.prototype.name = function(v){ return this._name; }
TagDeclaration.prototype.setName = function(v){ this._name = v; return this; };
TagDeclaration.prototype.superclass = function(v){ return this._superclass; }
TagDeclaration.prototype.setSuperclass = function(v){ this._superclass = v; return this; };
TagDeclaration.prototype.initor = function(v){ return this._initor; }
TagDeclaration.prototype.setInitor = function(v){ this._initor = v; return this; };

TagDeclaration.prototype.namepath = function (){
	return ("<" + this.name() + ">");
};

TagDeclaration.prototype.toJSON = function (){
	return {
		type: 'tag',
		namepath: this.namepath(),
		inherits: this.superclass() ? (("<" + (this.superclass().name()) + ">")) : null,
		symbols: this._scope.entities(),
		loc: this.loc(),
		desc: this._desc
	};
};

TagDeclaration.prototype.consume = function (node){
	if (node instanceof Return) {
		this.option('return',true);
		return this;
	};
	return TagDeclaration.prototype.__super__.consume.apply(this,arguments);
};

TagDeclaration.prototype.loc = function (){
	var d;
	if (d = this.option('keyword')) {
		return [d._loc,this.body().loc()[1]];
	} else {
		return TagDeclaration.prototype.__super__.loc.apply(this,arguments);
	};
};

TagDeclaration.prototype.visit = function (){
	if (String(this.name()).match(/^[A-Z]/)) {
		this.set({isClass: true});
	};
	
	ROOT.entities().register(this); // what if this is not local?
	
	// replace with some advanced lookup?
	this.scope().visit();
	return this.body().traverse();
};

TagDeclaration.prototype.id = function (){
	return this.name().id();
};

TagDeclaration.prototype.js = function (o){
	this.scope().context().setValue(this._ctx = this.scope().declare('tag',null,{system: true}));
	
	// var ns = name.ns
	var mark = AST.mark(this.option('keyword'));
	var params = [];
	
	params.push(this.name().c());
	var cbody = this.body().c();
	
	if (this.superclass()) {
		// WARN what if the superclass has a namespace?
		// what if it is a regular class?
		var supname = this.superclass().name();
		if (!supname[0].match(/[A-Z]/)) {
			params.push(this.superclass().c());
			// supname = helpers.singlequote(supname)
		} else {
			params.push(supname);
		};
	};
	
	if (this.body().count()) {
		params.push(("function(" + (this._ctx.c()) + ")\{" + cbody + "\}"));
	};
	
	var meth = this.option('extension') ? 'extendTag' : 'defineTag';
	// var js = "{mark}{scope__.imba.c}.{meth}({params.join(', ')})"
	var caller = this.scope__().imbaRef('tagscope'); // scope__.imba.c
	var js = ("" + mark + caller + "." + meth + "(" + params.join(', ') + ")");
	
	if (this.name().isClass()) {
		var cname = this.name().name();
		// declare variable
		js = ("var " + cname + " = " + js);
		// only if it is not namespaced
		// if o:global and !namespaced # option(:global)
		//	js.push("global.{cname} = {cpath}; // global class \n")
		if (this.option('export')) {
			js = ("" + js + "\nexports." + (this.option('default') ? 'default' : cname) + " = " + cname + ";");
		};
		
		if (this.option('return')) {
			js += ("\nreturn " + cname + ";");
		};
	} else {
		if (this.option('return')) {
			js = "return " + js;
		};
	};
	
	
	return js;
	
	// return out
};

function Func(params,body,name,target,o){
	this._options = o;
	var typ = this.scopetype();
	this._traversed = false;
	this._body = AST.blk(body);
	this._scope || (this._scope = (o && o.scope) || new typ(this));
	this._scope.setParams(this._params = new ParamList(params));
	this._name = name || '';
	this._target = target;
	this._type = 'function';
	this._variable = null;
	this;
};

subclass$(Func,Code);
exports.Func = Func; // export class 
Func.prototype.name = function(v){ return this._name; }
Func.prototype.setName = function(v){ this._name = v; return this; };
Func.prototype.params = function(v){ return this._params; }
Func.prototype.setParams = function(v){ this._params = v; return this; };
Func.prototype.target = function(v){ return this._target; }
Func.prototype.setTarget = function(v){ this._target = v; return this; };
Func.prototype.options = function(v){ return this._options; }
Func.prototype.setOptions = function(v){ this._options = v; return this; };
Func.prototype.type = function(v){ return this._type; }
Func.prototype.setType = function(v){ this._type = v; return this; };
Func.prototype.context = function(v){ return this._context; }
Func.prototype.setContext = function(v){ this._context = v; return this; };

Func.prototype.scopetype = function (){
	return FunctionScope;
};

Func.prototype.nonlocals = function (){
	return this._scope._nonlocals;
};

Func.prototype.visit = function (){
	this.scope().visit();
	this._context = this.scope().parent();
	this._params.traverse();
	return this._body.traverse(); // so soon?
};

Func.prototype.funcKeyword = function (){
	var str = "function";
	if (this.option('async')) { str = ("async " + str) };
	return str;
};

Func.prototype.js = function (o){
	if (!this.option('noreturn')) { this.body().consume(new ImplicitReturn()) };
	var ind = this.body()._indentation;
	// var s = ind and ind.@open
	if (ind && ind.isGenerated()) { this.body()._indentation = null };
	var code = this.scope().c({indent: (!ind || !ind.isGenerated()),braces: true});
	
	// args = params.map do |par| par.name
	// head = params.map do |par| par.c
	// code = [head,body.c(expression: no)].AST.flatten.compact.join("\n").wrap
	// FIXME creating the function-name this way is prone to create naming-collisions
	// will need to wrap the value in a FunctionName which takes care of looking up scope
	// and possibly dealing with it
	var name = (typeof this._name == 'string') ? this._name : this._name.c();
	name = name ? (' ' + name.replace(/\./g,'_')) : '';
	var out = ("" + this.funcKeyword() + name + "(" + (this.params().c()) + ") ") + code;
	// out = "async {out}" if option(:async)
	if (this.option('eval')) { out = ("(" + out + ")()") };
	return out;
};

Func.prototype.shouldParenthesize = function (par){
	if(par === undefined) par = this.up();
	return (par instanceof Call) && par.callee() == this;
	// if up as a call? Only if we are
};


function Lambda(){ return Func.apply(this,arguments) };

subclass$(Lambda,Func);
exports.Lambda = Lambda; // export class 
Lambda.prototype.scopetype = function (){
	var k = this.option('keyword');
	return (k && k._value == 'ƒ') ? ((MethodScope)) : ((LambdaScope));
};


function TagFragmentFunc(){ return Func.apply(this,arguments) };

subclass$(TagFragmentFunc,Func);
exports.TagFragmentFunc = TagFragmentFunc; // export class 
TagFragmentFunc.prototype.scopetype = function (){
	// caching still needs to be local no matter what?
	return this.option('closed') ? ((MethodScope)) : ((LambdaScope));
};

function TagLoopFunc(){ return Func.apply(this,arguments) };

subclass$(TagLoopFunc,Func);
exports.TagLoopFunc = TagLoopFunc; // export class 
TagLoopFunc.prototype.scopetype = function (){
	// caching still needs to be local no matter what?
	return this.option('closed') ? ((MethodScope)) : ((LambdaScope));
};

TagLoopFunc.prototype.visit = function (stack){
	this._loop = this._body.first();
	this._tag = stack._tag;
	this._tags = [];
	this._args = [];
	
	var prevLoop = this._tag._tagLoop;
	
	if (prevLoop) {
		this._parentLoop = prevLoop;
	};
	
	this._tag._tagLoop = this;
	
	this._isFast = prevLoop ? false : true;
	
	if (this._loop) {
		this._loop.body().values().every(function(v) { return v instanceof Tag; });
	};
	
	TagLoopFunc.prototype.__super__.visit.apply(this,arguments);
	
	this._tag._tagLoop = prevLoop;
	// see if we are optimized
	var lo = this._loop.options();
	var single = this._tags[0];
	// as long as there is only a single item to push
	if (lo.step || lo.diff || lo.guard || !this._loop.body().values().every(function(v) { return v instanceof Tag; })) {
		this._isFast = false;
	};
	
	for (var i = 0, items = iter$(this._params), len = items.length; i < len; i++) {
		items[i].visit(stack);
	};
	
	// we must be certain that we are only consuming one tag?
	
	if (len$(this._tags) == 1 && !single.option('key')) {
		this._name = 'nonkeyedTagLoop';
		
		if (this._isFast) {
			var len1 = this._loop.options().vars.len;
			if (len1 && len1.declarator) {
				var defs = len1.declarator().defaults();
				len1.declarator().setDefaults(OP('=',OP('.',this._params.at(0),'taglen'),defs));
			};
			this._body.push(new Return(this._params.at(0)));
			this.set({treeType: 4});
			return this;
		};
	};
	
	if (!this._isFast) {
		for (var j = 0, ary = iter$(this._tags), len_ = ary.length; j < len_; j++) {
			ary[j]._loopCache._callee = this.scope__().imbaRef('createTagMap');
		};
	};
	
	if (!this._parentLoop) {
		var collectInto = new ValueNode("val");
		var collector = new TagPushAssign("push",collectInto,null);
		this._loop.body().consume(collector);
		var collected = collector.consumed();
		var treeType = 3;
		
		if (len$(collected) == 1 && (collected[0] instanceof Tag)) {
			var op = CALL(OP('.',this._params.at(0),'$iter'),[]);
			this._resultVar = this.scope().declare('$$',op,{system: true});
			treeType = 5;
			this._name = 'keyedTagLoop';
			var len2 = this._loop.options().vars.len;
			if (len2 && len2.declarator) {
				var defs1 = len2.declarator().defaults();
				len2.declarator().setDefaults(OP('=',OP('.',this._resultVar,'taglen'),defs1));
			};
		} else {
			this._resultVar = this._params.at(this._params.count(),true,'$$'); // visiting?
			this._resultVar.visit(stack);
			if (collected.every(function(item) { return item instanceof Tag; })) {
				// let op = CALL(scope__.imbaRef('createTagLoopResult'),[])
				treeType = 5;
				this._args.push(CALL(this.scope__().imbaRef('createTagLoopResult'),[]));
			} else {
				this._args.push(new Arr([]));
			};
		};
		
		collectInto.setValue(this._resultVar);
		this._body.push(new Return(collectInto));
		this.set({treeType: treeType});
	} else {
		this.set({noreturn: true});
	};
	return this;
};

TagLoopFunc.prototype.consume = function (other){
	if (other instanceof TagPushAssign) {
		this._loop.body().consume(other);
	};
	return this;
};

TagLoopFunc.prototype.capture = function (node){
	var o = node._options;
	
	o.loop || (o.loop = this);
	o.parRef || (o.parRef = o.rootRef = this._tag.childCacher().nextRef());
	o.par = null;
	
	if (this._parentLoop) {
		this._parentLoop.capture(node);
	};
	
	if (o.loop == this) {
		
		var gen = o.loopCacher || this._tag.childCacher();
		var oref = o.parRef || this._tag.childCacher().nextRef();
		
		var nr = this._tags.push(node) - 1;
		var ref = this._loop.option('vars').index;
		var param = this._params.at(this._params.count(),true,("$" + (this._params.count())));
		
		node.set({cacher: new TagCache(this,param)});
		
		if (o.key) {
			node.set({treeRef: o.key});
			o.key.cache();
		} else {
			node.set({treeRef: ref});
		};
		
		var fn = o.key ? 'createTagMap' : 'createTagList';
		var parentRef = this._tag.cachePath(); // will be correct even if nested loops
		
		var get = CALL(this.scope__().imbaRef(fn),parentRef ? [gen,oref,parentRef] : [gen,oref]);
		node._loopCache = get;
		var op = OP('||',OP('.',gen,oref),get);
		this._args.push(op);
	} else {
		var ref1 = this._loop.option('vars').index;
		var param1 = this._params.at(this._params.count(),true,("$" + (this._params.count())));
		param1.setVariable(this.scope__().register(("$" + (this._params.count())),this,{system: true}));
		
		if (this._parentLoop) {
			this._args.push(OP('||=',OP('.',o.loopCacher,o.parRef),new Arr([])));
			// @args.push( OP('||=',OP('.',@tag.childCacher,o:parRef),Arr.new([])) )
		} else {
			this._args.push(OP('||=',OP('.',this._tag.childCacher(),o.parRef),new Arr([])));
		};
		
		
		o.loopCacher = param1;
		o.parRef = ref1;
		
		// if this is the first time we are registering this loop
	};
	
	return this;
};

TagLoopFunc.prototype.js = function (o){
	this._name || (this._name = 'tagLoop');
	var out = TagLoopFunc.prototype.__super__.js.apply(this,arguments);
	return "(" + out + (")(" + AST.cary(this._args) + ")");
};

function MethodDeclaration(){ return Func.apply(this,arguments) };

subclass$(MethodDeclaration,Func);
exports.MethodDeclaration = MethodDeclaration; // export class 
MethodDeclaration.prototype.variable = function(v){ return this._variable; }
MethodDeclaration.prototype.setVariable = function(v){ this._variable = v; return this; };

MethodDeclaration.prototype.scopetype = function (){
	return MethodScope;
};

MethodDeclaration.prototype.consume = function (node){
	if (node instanceof Return) {
		this.option('return',true);
		return this;
	};
	return MethodDeclaration.prototype.__super__.consume.apply(this,arguments);
};

MethodDeclaration.prototype.metadata = function (){
	return {
		type: "method",
		name: "" + this.name(),
		namepath: this.namepath(),
		params: this._params.metadata(),
		desc: this._desc,
		scopenr: this.scope()._nr,
		loc: this.loc()
	};
};

MethodDeclaration.prototype.loc = function (){
	var d;
	if (d = this.option('def')) {
		var end = this.body().option('end') || this.body().loc()[1];
		return [d._loc,end];
	} else {
		return [0,0];
	};
};

MethodDeclaration.prototype.isGetter = function (){
	return this._type == 'get';
};

MethodDeclaration.prototype.isSetter = function (){
	return this._type == 'set';
};

MethodDeclaration.prototype.toJSON = function (){
	return this.metadata();
};

MethodDeclaration.prototype.namepath = function (){
	if (this._namepath) { return this._namepath };
	
	var name = String(this.name());
	var sep = (this.option('static') ? '.' : '#');
	if (this.target()) {
		var ctx = this.target();
		// console.log "target?? {@target.@parent} {@context.node}"
		if (ctx.namepath() == "ValueNode") {
			ctx = this._context.node();
		};
		
		return this._namepath = ctx.namepath() + sep + name;
	} else {
		return this._namepath = '&' + name;
	};
};

MethodDeclaration.prototype.visit = function (){
	var $1, up_, variable;
	this._type = ($1 = this.option('def')) && $1._value || 'def';
	
	this._decorators = (up_ = this.up()) && up_.collectDecorators  &&  up_.collectDecorators();
	var o = this._options;
	this.scope().visit();
	
	// setters should always return self
	if (String(this.name()).match(/\=$/)) {
		this.set({chainable: true});
	};
	
	var closure = this._context = this.scope().parent().closure();
	
	this._params.traverse();
	
	if (this.option('inObject')) {
		this._body.traverse();
		return this;
	};
	
	if (this.target() instanceof Identifier) {
		if (variable = this.scope().lookup(this.target().toString())) {
			this.setTarget(variable);
		};
		// should be changed to VarOrAccess?!
	};
	
	if (String(this.name()) == 'initialize' && (closure instanceof ClassScope) && !(closure instanceof TagScope)) { // and not ModuleScope?
		this.setType('constructor');
	};
	
	// instance-method / member
	if ((closure instanceof ClassScope) && !(this.target())) {
		this._target = closure.prototype();
		
		this.set({prototype: this._target});
		closure.annotate(this);
	};
	
	if (this.target() instanceof Self) {
		this._target = closure.context();
		closure.annotate(this);
		this.set({static: true});
	} else if (o.variable) {
		this._variable = this.scope().parent().register(this.name(),this,{type: String(o.variable)});
		if (this.target()) { this.warn(("" + String(o.variable) + " def cannot have a target")) };
	} else if (!(this.target())) {
		this._target = closure.context();
		
		if (closure instanceof ModuleScope) {
			closure.annotate(this);
			this.body().set({strict: true});
			this.scope().context()._reference = this.scope().declare("self",OP('||',new This(),this._target));
		} else {
			// what if scope context has already been triggered?
			// method should pre-inherit the outer self?
			this.scope()._selfless = true;
			// @context = @target
		};
	};
	
	if (o.export && !(closure instanceof RootScope)) {
		this.warn("cannot export non-root method",{loc: o.export.loc()});
	};
	
	ROOT.entities().add(this.namepath(),this);
	this._body.traverse();
	return this;
};

MethodDeclaration.prototype.supername = function (){
	return (this.type() == 'constructor') ? this.type() : this.name();
};


// FIXME export global etc are NOT valid for methods inside any other scope than
// the outermost scope (root)

MethodDeclaration.prototype.js = function (o){
	var o = this._options;
	// FIXME Do this in the grammar - remnants of old implementation
	if (!(this.type() == 'constructor' || this.option('noreturn'))) {
		if (this.option('chainable')) {
			this.body().add(new ImplicitReturn(this.scope().context()));
		} else if (this.option('greedy')) {
			// haaack
			this.body().consume(new GreedyReturn());
		} else {
			this.body().consume(new ImplicitReturn());
		};
	};
	
	var code = this.scope().c({indent: true,braces: true});
	
	// same for Func -- should generalize
	var name = (typeof this._name == 'string') ? this._name : this._name.c();
	name = name.replace(/\./g,'_'); // not used?!
	
	
	var out = "";
	var mark = AST.mark(this.option('def'));
	var fname = AST.sym(this.name());
	
	if (this.option('inClassBody')) {
		var prefix = this.isGetter() ? 'get ' : ((this.isSetter() ? 'set ' : ''));
		out = ("" + prefix + " " + fname + ": " + mark + "(" + (this.params().c()) + ")" + code);
		return out;
	};
	
	var func = ("(" + (this.params().c()) + ")") + code;
	var ctx = this.context();
	
	if (this.option('inObject')) {
		out = ("" + fname + ": " + mark + this.funcKeyword() + func);
	} else if (this.type() == 'constructor') {
		out = ("" + mark + this.funcKeyword() + " " + fname + func);
		// add shorthand for prototype now
	} else if (this.target()) {
		if (this.isGetter()) {
			out = ("Object.defineProperty(" + (this.target().c()) + ",'" + fname + "',\{get: " + this.funcKeyword() + func + ", configurable: true\})");
		} else if (this.isSetter()) {
			out = ("Object.defineProperty(" + (this.target().c()) + ",'" + fname + "',\{set: " + this.funcKeyword() + func + ", configurable: true\})");
		} else {
			out = ("" + mark + (this.target().c()) + "." + fname + " = " + this.funcKeyword() + " " + func);
		};
		if (o.export) {
			out = ("exports." + (o.default ? 'default' : fname) + " = " + out);
		};
	} else {
		out = ("" + mark + this.funcKeyword() + " " + fname + func);
		if (o.export) {
			out = ("" + out + "; exports." + (o.default ? 'default' : fname) + " = " + fname + ";");
		};
	};
	
	if (o.global) {
		this.warn("global def is deprecated",{loc: o.global.region()});
		out = ("" + fname + " = " + out);
	};
	
	if (this.option('return')) {
		out = ("return " + out);
	};
	
	return out;
};


function TagFragmentDeclaration(){ return MethodDeclaration.apply(this,arguments) };

subclass$(TagFragmentDeclaration,MethodDeclaration);
exports.TagFragmentDeclaration = TagFragmentDeclaration; // export class 



function PropertyDeclaration(name,options,token){
	this._token = token;
	this._traversed = false;
	this._name = name;
	this._options = options || new Obj(new AssignList());
};

subclass$(PropertyDeclaration,Node);
exports.PropertyDeclaration = PropertyDeclaration; // export class 
var propTemplate = '${headers}\n${path}${getterKey} = function(v){ return ${get}; }\n${path}.${setter} = function(v){ ${set}; return this; }\n${init}';

var propWatchTemplate = '${headers}\n${path}${getterKey} = function(v){ return ${get}; }\n${path}.${setter} = function(v){\n	var a = this.${getter}();\n	if(v != a) { ${set}; }\n	if(v != a) { ${ondirty} }\n	return this;\n}\n${init}';

var propTemplateNext = '${headers}\nObject.defineProperty(${path},\'${getter}\',{\n	configurable: true,\n	get: function(){ return ${get}; },\n	set: function(v){ ${set}; }\n});\n${init}';

var propWatchTemplateNext = '${headers}\nObject.defineProperty(${path},\'${getter}\',{\n	configurable: true,\n	get: function(){ return ${get}; },\n	set: function(v){\n		var a = ${get};\n		if(v != a) { ${set}; }\n		if(v != a) { ${ondirty} }\n	}\n});\n${init}';

PropertyDeclaration.prototype.name = function(v){ return this._name; }
PropertyDeclaration.prototype.setName = function(v){ this._name = v; return this; };
PropertyDeclaration.prototype.options = function(v){ return this._options; }
PropertyDeclaration.prototype.setOptions = function(v){ this._options = v; return this; };

PropertyDeclaration.prototype.visit = function (){
	this._options.traverse();
	this.scope__().entities().add(this.name(),this);
	// ROOT.entities.add(name,self)
	return this;
};

PropertyDeclaration.prototype.toJSON = function (){
	return {
		type: "prop",
		name: "" + this.name(),
		desc: this._desc,
		loc: this.loc()
	};
};

PropertyDeclaration.prototype.loc = function (){
	return [this._token._loc,this._name.region()[1]];
};

// This will soon support bindings / listeners etc, much more
// advanced generated code based on options passed in.
PropertyDeclaration.prototype.c = function (){
	var o = this.options();
	var ast = "";
	var key = this.name().js();
	var scope = STACK.scope();
	
	var addDesc = o.keys().length;
	
	var pars = o.hash();
	
	var isAttr = (this._token && String(this._token) == 'attr') || o.key('attr');
	var isNative = (pars.native instanceof Bool) ? pars.native.isTruthy() : undefined;
	
	var js = {
		key: key,
		getter: key,
		getterKey: RESERVED_TEST.test(key) ? (("['" + key + "']")) : (("." + key)),
		setter: AST.sym(("set-" + key)),
		scope: ("" + (scope.context().c())),
		path: '${scope}.prototype',
		set: ("this._" + key + " = v"),
		get: ("this._" + key),
		init: "",
		headers: "",
		ondirty: ""
	};
	
	
	if (pars.inline) {
		if ((pars.inline instanceof Bool) && !pars.inline.isTruthy()) {
			o.remove('inline');
			return ("" + (this.scope__().imba().c()) + "." + (this._token) + "(" + (js.scope) + ",'" + (this.name().value()) + "'," + (o.c()) + ")").replace(',{})',')');
		};
	};
	
	var tpl = propTemplate;
	
	if (scope instanceof ModuleScope) {
		js.path = js.scope;
	};
	
	o.add('name',new Symbol(key));
	
	if (pars.watch) {
		if (!((pars.watch instanceof Bool) && !pars.watch.isTruthy())) { tpl = propWatchTemplate };
		var wfn = ("" + key + "DidSet");
		
		if (pars.watch instanceof Symbol) {
			wfn = pars.watch;
		} else if (pars.watch instanceof Str) {
			wfn = pars.watch;
		} else if (pars.watch instanceof Bool) {
			o.key('watch').setValue(new Symbol(("" + key + "DidSet")));
		} else {
			wfn = null;
		};
		
		if (wfn) {
			var fn = OP('.',new This(),wfn);
			js.ondirty = OP('&&',fn,CALL(fn,['v','a',("this.__" + key)])).c();
		} else {
			js.ondirty = ("" + (this.scope__().imba().c()) + ".propDidSet(this,this.__" + key + ",v,a)");
		};
	};
	
	
	if (pars.observe) {
		if (pars.observe instanceof Bool) {
			o.key('observe').setValue(new Symbol(("" + key + "DidEmit")));
		};
		
		tpl = propWatchTemplate;
		js.ondirty = ("" + (this.scope__().imba().c()) + ".observeProperty(this,'" + key + "'," + (o.key('observe').value().c()) + ",v,a);") + (js.ondirty || '');
		// OP('&&',fn,CALL(fn,['v','a',"this.__{key}"])).c
	};
	
	if (!isAttr && o.key('dom')) {
		js.set = ("if (v != this._dom." + (this.name().value()) + ") \{ this._dom." + (this.name().value()) + " = v \}");
		js.get = ("this._dom." + (this.name().value()));
	};
	
	if (isAttr) { // (@token and String(@token) == 'attr') or o.key(:dom) or o.key(:attr)
		var attrKey = (o.key('dom') instanceof Str) ? o.key('dom') : this.name().value();
		// need to make sure o has a key for attr then - so that the delegate can know?
		js.set = ("this.setAttribute('" + attrKey + "',v)");
		js.get = ("this.getAttribute('" + attrKey + "')");
	} else if (o.key('delegate')) {
		// if we have a delegate
		js.set = ("v = this.__" + key + ".delegate.set(this,'" + key + "',v,this.__" + key + ")");
		js.get = ("this.__" + key + ".delegate.get(this,'" + key + "',this.__" + key + ")");
	};
	
	
	
	if (pars.default) {
		if (o.key('dom')) {
			// FIXME go through class-method setAttribute instead
			js.init = ("" + (js.scope) + "._dom.setAttribute('" + key + "'," + (pars.default.c()) + ");");
		} else {
			// if this is not a primitive - it MUST be included in the
			// getter / setter instead
			// FIXME throw warning if the default is not a primitive object
			js.init = ("" + (js.path) + "._" + key + " = " + (pars.default.c()) + ";");
		};
	};
	
	if (o.key('chainable')) {
		js.get = ("v !== undefined ? (this." + (js.setter) + "(v),this) : " + (js.get));
	};
	
	
	if ((isNative !== false)) {
		if (tpl == propWatchTemplate) {
			tpl = propWatchTemplateNext;
		} else {
			tpl = propTemplateNext;
		};
	};
	
	
	js.options = o.c();
	
	if (addDesc) {
		js.headers = ("" + (js.path) + ".__" + (js.getter) + " = " + (js.options) + ";");
	};
	
	var reg = /\$\{(\w+)\}/gm;
	// var tpl = o.key(:watch) ? propWatchTemplate : propTemplate
	var out = tpl.replace(reg,function(m,a) { return js[a]; });
	// run another time for nesting. hacky
	out = out.replace(reg,function(m,a) { return js[a]; });
	// out = out.replace(/\n\s*$/,'')
	out = out.replace(/^\s+|\s+$/g,'');
	
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
	this._value = this.load(v);
};

subclass$(Literal,ValueNode);
exports.Literal = Literal; // export class 
Literal.prototype.load = function (value){
	return value;
};


Literal.prototype.toString = function (){
	return "" + this.value();
};

Literal.prototype.hasSideEffects = function (){
	return false;
};

Literal.prototype.shouldParenthesizeInTernary = function (){
	return false;
};


function Bool(v){
	this._value = v;
	this._raw = (String(v) == "true") ? true : false;
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

Bool.prototype.toJSON = function (){
	return {type: 'Bool',value: this._value};
};

Bool.prototype.loc = function (){
	return this._value.region ? this._value.region() : [0,0];
};

function Undefined(){ return Literal.apply(this,arguments) };

subclass$(Undefined,Literal);
exports.Undefined = Undefined; // export class 
Undefined.prototype.isPrimitive = function (){
	return true;
};

Undefined.prototype.isTruthy = function (){
	return false;
};

Undefined.prototype.c = function (){
	return AST.mark(this._value) + "undefined";
};

function Nil(){ return Literal.apply(this,arguments) };

subclass$(Nil,Literal);
exports.Nil = Nil; // export class 
Nil.prototype.isPrimitive = function (){
	return true;
};

Nil.prototype.isTruthy = function (){
	return false;
};

Nil.prototype.c = function (){
	return AST.mark(this._value) + "null";
};

function True(){ return Bool.apply(this,arguments) };

subclass$(True,Bool);
exports.True = True; // export class 
True.prototype.raw = function (){
	return true;
};

True.prototype.isTruthy = function (){
	return true;
};

True.prototype.c = function (){
	return AST.mark(this._value) + "true";
};

function False(){ return Bool.apply(this,arguments) };

subclass$(False,Bool);
exports.False = False; // export class 
False.prototype.raw = function (){
	return false;
};

False.prototype.isTruthy = function (){
	return false;
};

False.prototype.c = function (){
	return AST.mark(this._value) + "false";
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

Num.prototype.isTruthy = function (){
	return String(this._value) != "0";
};

Num.prototype.shouldParenthesize = function (par){
	if(par === undefined) par = this.up();
	return (par instanceof Access) && par.left() == this;
};

Num.prototype.js = function (o){
	var num = String(this._value);
	return num;
};

Num.prototype.c = function (o){
	if (this._cache) { return Num.prototype.__super__.c.call(this,o) };
	var js = String(this._value);
	var par = STACK.current();
	var paren = (par instanceof Access) && par.left() == this;
	// only if this is the right part of teh acces
	return paren ? (("(" + AST.mark(this._value)) + js + ")") : ((AST.mark(this._value) + js));
	// @cache ? super(o) : String(@value)
};

Num.prototype.cache = function (o){
	if (!(o && (o.cache || o.pool))) { return this };
	return Num.prototype.__super__.cache.call(this,o);
};

Num.prototype.raw = function (){
	// really?
	return JSON.parse(String(this.value()));
};

Num.prototype.toJSON = function (){
	return {type: this.typeName(),value: this.raw()};
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
	return this.raw().match(/^[a-zA-Z\$\_]+[\d\w\$\_]*$/) ? true : false;
};

Str.prototype.js = function (o){
	return String(this._value);
};

Str.prototype.c = function (o){
	return this._cache ? Str.prototype.__super__.c.call(this,o) : String(this._value);
};


function Interpolation(){ return ValueNode.apply(this,arguments) };

subclass$(Interpolation,ValueNode);
exports.Interpolation = Interpolation; // export class 


// Currently not used - it would be better to use this
// for real interpolated strings though, than to break
// them up into their parts before parsing
function InterpolatedString(nodes,o){
	if(o === undefined) o = {};
	this._nodes = nodes;
	this._options = o;
	this;
};

subclass$(InterpolatedString,Node);
exports.InterpolatedString = InterpolatedString; // export class 
InterpolatedString.prototype.add = function (part){
	if (part) { this._nodes.push(part) };
	return this;
};

InterpolatedString.prototype.visit = function (){
	for (var i = 0, items = iter$(this._nodes), len = items.length; i < len; i++) {
		items[i].traverse();
	};
	return this;
};

InterpolatedString.prototype.isString = function (){
	return true;
};

InterpolatedString.prototype.escapeString = function (str){
	return str = str.replace(/\n/g,'\\\n');
};

InterpolatedString.prototype.js = function (o){
	// creating the string
	var self = this;
	var parts = [];
	var str = self._noparen ? '' : '(';
	
	self._nodes.map(function(part,i) {
		if ((part instanceof Token) && part._type == 'NEOSTRING') {
			// esca
			return parts.push('"' + self.escapeString(part._value) + '"');
		} else if (part) {
			if (i == 0) {
				// force first part to be string
				parts.push('""');
			};
			part._parens = true;
			return parts.push(part.c({expression: true}));
		};
	});
	
	str += parts.join(" + ");
	if (!self._noparen) { str += ')' };
	return str;
};


function Tuple(){ return ListNode.apply(this,arguments) };

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
function Symbol(){ return Literal.apply(this,arguments) };

subclass$(Symbol,Literal);
exports.Symbol = Symbol; // export class 
Symbol.prototype.isValidIdentifier = function (){
	return this.raw().match(/^[a-zA-Z\$\_]+[\d\w\$\_]*$/) ? true : false;
};

Symbol.prototype.isPrimitive = function (deep){
	return true;
};

Symbol.prototype.raw = function (){
	return this._raw || (this._raw = AST.sym(this.value().toString().replace(/^\:/,'')));
};

Symbol.prototype.js = function (o){
	return ("'" + AST.sym(this.raw()) + "'");
};

function RegExp(){ return Literal.apply(this,arguments) };

subclass$(RegExp,Literal);
exports.RegExp = RegExp; // export class 
RegExp.prototype.isPrimitive = function (){
	return true;
};

RegExp.prototype.js = function (){
	var m;
	var v = RegExp.prototype.__super__.js.apply(this,arguments);
	
	// special casing heregex
	if (m = constants.HEREGEX.exec(v)) {
		// console.log 'matxhed heregex',m
		var re = m[1].replace(constants.HEREGEX_OMIT,'').replace(/\//g,'\\/');
		return '/' + (re || '(?:)') + '/' + m[2];
	};
	
	return (v == '//') ? '/(?:)/' : v;
};

// Should inherit from ListNode - would simplify
function Arr(){ return Literal.apply(this,arguments) };

subclass$(Arr,Literal);
exports.Arr = Arr; // export class 
Arr.prototype.load = function (value){
	return (value instanceof Array) ? new ArgList(value) : value;
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
	return (val instanceof Array) ? val : val.nodes();
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
	var nodes = (val instanceof Array) ? val : val.nodes();
	
	// for v in @value
	// 	break splat = yes if v isa Splat
	// var splat = value.some(|v| v isa Splat)
	
	if (splat) {
		// "SPLATTED ARRAY!"
		// if we know for certain that the splats are arrays we can drop the slice?
		var slices = [];
		var group = null;
		
		for (var i = 0, items = iter$(nodes), len = items.length, v1; i < len; i++) {
			v1 = items[i];
			if (v1 instanceof Splat) {
				slices.push(v1);
				group = null;
			} else {
				if (!group) { slices.push(group = new Arr([])) };
				group.push(v1);
			};
		};
		
		return ("[].concat(" + AST.cary(slices).join(", ") + ")");
	} else {
		// very temporary. need a more generic way to prettify code
		// should depend on the length of the inner items etc
		// if @indented or option(:indent) or value.@indented
		//	"[\n{value.c.join(",\n").indent}\n]"
		var out = (val instanceof Array) ? AST.cary(val) : val.c();
		return ("[" + out + "]");
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
function Obj(){ return Literal.apply(this,arguments) };

subclass$(Obj,Literal);
exports.Obj = Obj; // export class 
Obj.prototype.load = function (value){
	return (value instanceof Array) ? new AssignList(value) : value;
};

Obj.prototype.visit = function (){
	if (this._value) { this._value.traverse() };
	// for v in value
	// 	v.traverse
	return this;
};

Obj.prototype.js = function (o){
	var dyn = this.value().filter(function(v) { return (v instanceof ObjAttr) && ((v.key() instanceof Op) || (v.key() instanceof InterpolatedString)); });
	
	if (dyn.length > 0) {
		var idx = this.value().indexOf(dyn[0]);
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

Obj.prototype.remove = function (key){
	for (var i = 0, items = iter$(this.value()), len = items.length, k; i < len; i++) {
		k = items[i];
		if (k.key().symbol() == key) { this.value().remove(k) };
	};
	return this;
};

Obj.prototype.keys = function (){
	return Object.keys(this.hash());
};

Obj.prototype.hash = function (){
	var hash = {};
	for (var i = 0, items = iter$(this.value()), len = items.length, k; i < len; i++) {
		k = items[i];
		if (k instanceof ObjAttr) { hash[k.key().symbol()] = k.value() };
	};
	return hash;
	// return k if k.key.symbol == key
};

// add method for finding properties etc?
Obj.prototype.key = function (key){
	for (var i = 0, items = iter$(this.value()), len = items.length, k; i < len; i++) {
		k = items[i];
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
	for (var v1, i = 0, keys = Object.keys(obj), l = keys.length, k; i < l; i++){
		k = keys[i];v1 = obj[k];if (v1 instanceof Array) {
			v1 = Arr.wrap(v1);
		} else if (v1.constructor == Object) {
			v1 = Obj.wrap(v1);
		};
		// if k isa String
		//	k = LIT(k)
		attrs.push(new ObjAttr(k,v1));
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
ObjAttr.prototype.key = function(v){ return this._key; }
ObjAttr.prototype.setKey = function(v){ this._key = v; return this; };
ObjAttr.prototype.value = function(v){ return this._value; }
ObjAttr.prototype.setValue = function(v){ this._value = v; return this; };
ObjAttr.prototype.options = function(v){ return this._options; }
ObjAttr.prototype.setOptions = function(v){ this._options = v; return this; };

ObjAttr.prototype.visit = function (){
	// should probably traverse key as well, unless it is a dead simple identifier
	this.key().traverse();
	return this.value().traverse();
};

ObjAttr.prototype.js = function (o){
	var key = this.key();
	
	if ((key instanceof Identifier) && String(key._value)[0] == '@') {
		key = new Ivar(key);
	};
	
	var k = key.isReserved() ? (("'" + (key.c()) + "'")) : key.c();
	
	return ("" + k + ": " + (this.value().c()));
};

ObjAttr.prototype.hasSideEffects = function (){
	return true;
};



function ArgsReference(){ return Node.apply(this,arguments) };

subclass$(ArgsReference,Node);
exports.ArgsReference = ArgsReference; // export class 
ArgsReference.prototype.c = function (){
	return "arguments";
};

// should be a separate Context or something
function Self(value){
	this._value = value;
};

subclass$(Self,Literal);
exports.Self = Self; // export class 
Self.prototype.cache = function (){
	return this;
};

Self.prototype.reference = function (){
	return this;
};

Self.prototype.visit = function (){
	this.scope__().context();
	return this;
};

Self.prototype.c = function (){
	var s = this.scope__();
	return s ? s.context().c() : "this";
};

function ImplicitSelf(){ return Self.apply(this,arguments) };

subclass$(ImplicitSelf,Self);
exports.ImplicitSelf = ImplicitSelf; // export class 


function This(){ return Self.apply(this,arguments) };

subclass$(This,Self);
exports.This = This; // export class 
This.prototype.cache = function (){
	return this;
};

This.prototype.reference = function (){
	return this;
};

This.prototype.visit = function (){
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
	this._opToken = o;
	this._op = o && o._value || o;
	
	if (this._op == 'and') {
		this._op = '&&';
	} else if (this._op == 'or') {
		this._op = '||';
	} else if (this._op == 'is') {
		this._op = '===';
	} else if (this._op == 'isnt') {
		this._op = '!==';
	} else if (this._op == 'not') {
		this._op = '!';
	};
	
	this._left = l;
	this._right = r;
	return this;
};

subclass$(Op,Node);
exports.Op = Op; // export class 
Op.prototype.op = function(v){ return this._op; }
Op.prototype.setOp = function(v){ this._op = v; return this; };
Op.prototype.left = function(v){ return this._left; }
Op.prototype.setLeft = function(v){ this._left = v; return this; };
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
		out = ("" + l + " " + AST.mark(this._opToken) + op + " " + r);
	} else if (l) {
		out = ("" + AST.mark(this._opToken) + op + l);
	};
	// out = out.parenthesize if up isa Op # really?
	return out;
};

Op.prototype.isString = function (){
	return this._op == '+' && this._left && this._left.isString();
};

Op.prototype.shouldParenthesize = function (){
	return this._parens;
	// option(:parens)
};

Op.prototype.precedence = function (){
	return 10;
};

Op.prototype.consume = function (node){
	if (this.isExpressable()) { return Op.prototype.__super__.consume.apply(this,arguments) };
	
	// TODO can rather use global caching?
	var tmpvar = this.scope__().declare('tmp',null,{system: true});
	var clone = OP(this.op(),this.left(),null);
	var ast = this.right().consume(clone);
	if (node) { ast.consume(node) };
	return ast;
};

function ComparisonOp(){ return Op.apply(this,arguments) };

subclass$(ComparisonOp,Op);
exports.ComparisonOp = ComparisonOp; // export class 
ComparisonOp.prototype.invert = function (){
	// are there other comparison ops?
	// what about a chain?
	var op = this._op;
	var pairs = ["==","!=","===","!==",">","<=","<",">="];
	var idx = pairs.indexOf(op);
	idx += ((idx % 2) ? (-1) : 1);
	this.setOp(pairs[idx]);
	this._invert = !this._invert;
	return this;
};

ComparisonOp.prototype.c = function (){
	if (this.left() instanceof ComparisonOp) {
		this.left().right().cache();
		return OP('&&',this.left(),OP(this.op(),this.left().right(),this.right())).c();
	} else {
		return ComparisonOp.prototype.__super__.c.apply(this,arguments);
	};
};

ComparisonOp.prototype.js = function (o){
	var op = this._op;
	var l = this._left;
	var r = this._right;
	
	if (l instanceof Node) { l = l.c() };
	if (r instanceof Node) { r = r.c() };
	return ("" + l + " " + AST.mark(this._opToken) + op + " " + r);
};


function MathOp(){ return Op.apply(this,arguments) };

subclass$(MathOp,Op);
exports.MathOp = MathOp; // export class 
MathOp.prototype.c = function (){
	if (this.op() == '∪') {
		return this.util().union(this.left(),this.right()).c();
	} else if (this.op() == '∩') {
		return this.util().intersect(this.left(),this.right()).c();
	};
};


function UnaryOp(){ return Op.apply(this,arguments) };

subclass$(UnaryOp,Op);
exports.UnaryOp = UnaryOp; // export class 
UnaryOp.prototype.invert = function (){
	if (this.op() == '!') {
		return this.left();
	} else {
		return UnaryOp.prototype.__super__.invert.apply(this,arguments); // regular invert
	};
};

UnaryOp.prototype.isTruthy = function (){
	var val = AST.truthy(this.left());
	return (val !== undefined) ? ((!val)) : ((undefined));
};

UnaryOp.prototype.js = function (o){
	var l = this._left;
	var r = this._right;
	var op = this.op();
	
	if (op == 'not') {
		op = '!';
	};
	
	if (op == '!') {
		// l.@parens = yes
		var str = l.c();
		var paren = l.shouldParenthesize(this);
		// FIXME this is a very hacky workaround. Need to handle all this
		// in the child instead, problems arise due to automatic caching
		if (!(str.match(/^\!?([\w\.]+)$/) || (l instanceof Parens) || paren || (l instanceof Access) || (l instanceof Call))) { str = '(' + str + ')' };
		// l.set(parens: yes) # sure?
		return ("" + op + str);
	} else if (op == '√') {
		return ("Math.sqrt(" + (l.c()) + ")");
	} else if (this.left()) {
		return ("" + (l.c()) + op);
	} else {
		return ("" + op + (r.c()));
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
	if (this.left()) { ast = OP((this.op()[0] == '-') ? '+' : '-',ast,num) };
	
	return ast;
};

UnaryOp.prototype.consume = function (node){
	var norm = this.normalize();
	return (norm == this) ? (UnaryOp.prototype.__super__.consume.apply(this,arguments)) : norm.consume(node);
};

UnaryOp.prototype.c = function (){
	var norm = this.normalize();
	return (norm == this) ? (UnaryOp.prototype.__super__.c.apply(this,arguments)) : norm.c();
};

function InstanceOf(){ return Op.apply(this,arguments) };

subclass$(InstanceOf,Op);
exports.InstanceOf = InstanceOf; // export class 
InstanceOf.prototype.js = function (o){
	// fix checks for String and Number
	
	if (this.right() instanceof Const) {
		// WARN otherwise - what do we do? does not work with dynamic
		// classes etc? Should probably send to utility function isa$
		var name = AST.c(this.right().value());
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
	var out = ("" + (this.left().c()) + " instanceof " + (this.right().c()));
	
	// should this not happen in #c?
	if (o.parent() instanceof Op) { out = helpers.parenthesize(out) };
	return out;
};

function TypeOf(){ return Op.apply(this,arguments) };

subclass$(TypeOf,Op);
exports.TypeOf = TypeOf; // export class 
TypeOf.prototype.js = function (o){
	return ("typeof " + (this.left().c()));
};

function Delete(){ return Op.apply(this,arguments) };

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

function In(){ return Op.apply(this,arguments) };

subclass$(In,Op);
exports.In = In; // export class 
In.prototype.invert = function (){
	this._invert = !this._invert;
	return this;
};

In.prototype.js = function (o){
	var cond = this._invert ? "== -1" : ">= 0";
	var idx = Util.indexOf(this.left(),this.right());
	return ("" + (idx.c()) + " " + cond);
};



// ACCESS

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
	var mark = '';
	
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
		mark = AST.mark(rgt._value);
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
		ctx ? (("" + (ctx.c()) + "." + mark + raw)) : raw
	) : (
		r = (rgt instanceof Node) ? rgt.c({expression: true}) : rgt,
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
	return (this.right() instanceof Identifier) ? this.right().alias() : Access.prototype.__super__.alias.call(this);
};

Access.prototype.safechain = function (){
	// right.safechain
	return String(this._op) == '?.' || String(this._op) == '?:';
};

Access.prototype.cache = function (o){
	return ((this.right() instanceof Ivar) && !(this.left())) ? this : Access.prototype.__super__.cache.call(this,o);
};

Access.prototype.shouldParenthesizeInTernary = function (){
	return this._parens || this._cache;
};


// Should change this to just refer directly to the variable? Or VarReference
function LocalVarAccess(){ return Access.apply(this,arguments) };

subclass$(LocalVarAccess,Access);
exports.LocalVarAccess = LocalVarAccess; // export class 
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
	if (o.force) { LocalVarAccess.prototype.__super__.cache.call(this,o) };
	return this;
};

LocalVarAccess.prototype.alias = function (){
	return this.variable()._alias || LocalVarAccess.prototype.__super__.alias.call(this);
};


function GlobalVarAccess(){ return ValueNode.apply(this,arguments) };

subclass$(GlobalVarAccess,ValueNode);
exports.GlobalVarAccess = GlobalVarAccess; // export class 
GlobalVarAccess.prototype.js = function (o){
	return this.value().c();
};


function ObjectAccess(){ return Access.apply(this,arguments) };

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
		var ast = CALL(OP('.',this.left(),this.right()),[]); // convert to ArgList or null
		ast.setReceiver(rec);
		return ast.c();
	};
	
	var up = this.up();
	// really need to fix this - for sure
	// should be possible for the function to remove this this instead?
	var js = ("" + PropertyAccess.prototype.__super__.js.call(this,o));
	return js;
};


PropertyAccess.prototype.receiver = function (){
	if ((this.left() instanceof SuperAccess) || (this.left() instanceof Super)) {
		return SELF;
	} else {
		return null;
	};
};


function IvarAccess(){ return Access.apply(this,arguments) };

subclass$(IvarAccess,Access);
exports.IvarAccess = IvarAccess; // export class 
IvarAccess.prototype.visit = function (){
	if (this._right) { this._right.traverse() };
	this._left ? this._left.traverse() : this.scope__().context();
	return this;
};

IvarAccess.prototype.cache = function (){
	// WARN hmm, this is not right... when accessing on another object it will need to be cached
	return this;
};


function ConstAccess(){ return Access.apply(this,arguments) };

subclass$(ConstAccess,Access);
exports.ConstAccess = ConstAccess; // export class 



function IndexAccess(){ return Access.apply(this,arguments) };

subclass$(IndexAccess,Access);
exports.IndexAccess = IndexAccess; // export class 
IndexAccess.prototype.cache = function (o){
	if(o === undefined) o = {};
	if (o.force) { return IndexAccess.prototype.__super__.cache.apply(this,arguments) };
	this.right().cache();
	return this;
};


function SuperAccess(){ return Access.apply(this,arguments) };

subclass$(SuperAccess,Access);
exports.SuperAccess = SuperAccess; // export class 
SuperAccess.prototype.js = function (o){
	var m = o.method();
	var up = o.parent();
	var deep = (o.parent() instanceof Access);
	
	var out = ("" + (this.left().c()) + ".__super__");
	
	if (!((up instanceof Access))) {
		out += ("." + (m.supername().c()));
		if (!((up instanceof Call))) {
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
	
	
	var scope = this.scope__();
	
	var variable = scope.lookup(this.value());
	
	// does not really need to have a declarator already? -- tricky
	if (variable && variable.declarator()) {
		// var decl = variable.declarator
		var vscope = variable.scope();
		
		// if the variable is not initialized just yet and we are
		// in the same scope - we should not treat this as a var-lookup
		// ie.  var x = x would resolve to var x = this.x() if x
		// was not previously defined
		if (vscope == scope && !variable._initialized) {
			// here we need to check if the variable exists outside
			// if it does - we need to ensure that the inner variable does not collide
			var outerVar = scope.parent().lookup(this.value());
			if (outerVar) {
				variable._virtual = true;
				variable._shadowing = outerVar;
				variable = outerVar;
			};
		};
		
		// should do this even if we are not in the same scope?
		// we only need to be in the same closure(!)
		
		if (variable && variable._initialized || (scope.closure() != vscope.closure())) {
			this._variable = variable;
			variable.addReference(this);
			this._value = variable; // variable.accessor(self)
			this._token._variable = variable;
			
			// if vscope isa RootScope and vscope.context != scope.context and variable.type == 'meth'
			// 	warn "calling method from root scope {value} is deprecated - see issue #112"
			
			return this;
		};
		
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
	scope.root()._implicitAccessors.push(this);
	this._value = new PropertyAccess(".",scope.context(),this.value());
	// mark the scope / context -- so we can show correct implicit
	this._token._meta = {type: 'ACCESS'};
	// @value.traverse # nah
	return this;
};

VarOrAccess.prototype.c = function (){
	return AST.mark(this._token) + (this._variable ? VarOrAccess.prototype.__super__.c.call(this) : this.value().c());
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
	return this._variable ? this : this.value();
};

VarOrAccess.prototype.symbol = function (){
	return this._identifier.symbol();
	// value and value.symbol
};

VarOrAccess.prototype.cache = function (o){
	if(o === undefined) o = {};
	return this._variable ? ((o.force && VarOrAccess.prototype.__super__.cache.call(this,o))) : this.value().cache(o);
};

VarOrAccess.prototype.decache = function (){
	this._variable ? VarOrAccess.prototype.__super__.decache.call(this) : this.value().decache();
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

VarOrAccess.prototype.shouldParenthesizeInTernary = function (){
	return this._cache || (this._value && this._value._cache) || this._parens;
};

VarOrAccess.prototype.toString = function (){
	return ("VarOrAccess(" + this.value() + ")");
};

VarOrAccess.prototype.toJSON = function (){
	return {type: this.typeName(),value: this._identifier.toString()};
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
	if (value instanceof VarOrAccess) {
		value = value.value();
		this._variable = null;
	} else if (value instanceof Variable) {
		this._variable = value;
		value = "";
	};
	
	// for now - this can happen
	VarReference.prototype.__super__.constructor.call(this,value);
	this._export = false;
	this._type = type && String(type);
	this._declared = true; // just testing now
};


subclass$(VarReference,ValueNode);
exports.VarReference = VarReference; // export class 
VarReference.prototype.variable = function(v){ return this._variable; }
VarReference.prototype.setVariable = function(v){ this._variable = v; return this; };
VarReference.prototype.declared = function(v){ return this._declared; }
VarReference.prototype.setDeclared = function(v){ this._declared = v; return this; };
VarReference.prototype.type = function(v){ return this._type; }
VarReference.prototype.setType = function(v){ this._type = v; return this; };

VarReference.prototype.loc = function (){
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
	var out = ("" + AST.mark(this._value) + (ref.c()));
	var keyword = o.es5() ? 'var' : ((this._type || 'var'));
	// let might still not work perfectly
	// keyword = 'var' if keyword == 'let'
	
	if (ref && !ref._declared) { // .option(:declared)
		if (o.up(VarBlock)) { // up varblock??
			ref._declared = true;
			
			// ref.set(declared: yes)
		} else if (o.isExpression() || this._export) { // why?
			ref.autodeclare();
		} else {
			out = ("" + keyword + " " + out);
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
	// should be possible to have a VarReference without a name as well? for a system-variable
	// name should not set this way.
	var v = this._variable || (this._variable = this.scope__().register(this.value().toString(),this,{type: this._type}));
	
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
		// converting all nodes to var-references ?
		// do we need to keep it in a varblock at all?
		var vars = l.value().nodes().map(function(v) {
			// what about inner tuples etc?
			// keep the splats -- clumsy but true
			var v_;
			if (v instanceof Splat) {
				if (!((v.value() instanceof VarReference))) { (v.setValue(v_ = new VarReference(v.value(),l.type())),v_) };
			} else if (v instanceof VarReference) {
				true;
			} else {
				// what about retaining location?
				// v = v.value if v isa VarOrAccess
				v = new VarReference(v,l.type());
			};
			
			return v;
			
			// v isa VarReference ? v : VarReference.new(v)
		});
		
		return new TupleAssign(o,new Tuple(vars),r);
	};
	
	if (l instanceof Arr) {
		return new TupleAssign(o,new Tuple(l.nodes()),r);
	};
	
	// set expression yes, no?
	this._expression = false;
	this._traversed = false;
	this._parens = false;
	this._cache = null;
	this._invert = false;
	this._opToken = o;
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
	
	// how does this work with constants that are really var references?
	// should work when things are not described as well - but this is for testing
	// but if it refers to something else
	if (!lvar && this._desc) {
		// entities should be able to extract the needed info instead
		ROOT.entities().add(l.namepath(),{namepath: l.namepath(),type: r.typeName(),desc: this._desc});
	};
	
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
		if ((this.left() instanceof VarReference) && this.left().type() == 'let') {
			return new Block([this.left(),BR,this.right().consume(this)]).c(o);
		};
		
		return this.right().consume(this).c(o);
	};
	// testing this
	return Assign.prototype.__super__.c.call(this,o);
};

Assign.prototype.js = function (o){
	if (!this.right().isExpressable()) {
		this.p("Assign#js right is not expressable ");
		// here this should be go out of the stack(!)
		// it should already be consumed?
		return this.right().consume(this).c();
	};
	var l = this.left().node();
	var r = this.right();
	
	// We are setting self(!)
	// TODO document functionality
	if (l instanceof Self) {
		var ctx = this.scope__().context();
		l = ctx.reference();
	};
	
	
	// should add optional check that wraps this 
	if ((l instanceof PropertyAccess) && false) { // STACK.v1
		var ast = CALL(OP('.',l.left(),l.right().setter()),[this.right()]);
		ast.setReceiver(l.receiver());
		
		if (this.isUsed()) {
			// dont cache it again if it is already cached(!)
			if (!this.right().cachevar()) { this.right().cache({pool: 'val',uses: 1}) }; //
			// this is only when used.. should be more clever about it
			ast = new Parens(AST.blk([ast,this.right()]));
		};
		
		// should check the up-value no?
		return ast.c({expression: true});
	};
	
	// if l isa VarReference
	// 	p "assign var-ref"
	// 	l.@variable.assigned(r)
	
	// FIXME -- does not always need to be an expression?
	var lc = l.c();
	
	if (this.option('export')) {
		var ename = (l instanceof VarReference) ? l.variable().c() : lc;
		return ("" + lc + " " + AST.mark(this._opToken) + this.op() + " exports." + ename + " = " + this.right().c({expression: true}));
	} else {
		return ("" + lc + " " + AST.mark(this._opToken) + this.op() + " " + this.right().c({expression: true}));
	};
	// return out
};

// FIXME op is a token? _FIX_
// this (and similar cases) is broken when called from
// another position in the stack, since 'up' is dynamic
// should maybe freeze up?
Assign.prototype.shouldParenthesize = function (par){
	if(par === undefined) par = this.up();
	return this._parens || (par instanceof Op) && par.op() != '=';
};

Assign.prototype.consume = function (node){
	if (this.isExpressable()) {
		this.forceExpression();
		return Assign.prototype.__super__.consume.call(this,node);
	};
	
	var ast = this.right().consume(this);
	return ast.consume(node);
};

// more workaround during transition away from a,b,c = 1,2,3 style assign
Assign.prototype.addExpression = function (expr){
	// p "addExpression {expr}"
	var typ = ExpressionBlock;
	if (this._left && (this._left instanceof VarReference)) {
		typ = VarBlock;
	};
	// might be better to nest this up after parsing is done?
	var node = new typ([this]);
	return node.addExpression(expr);
};


function PushAssign(){ return Assign.apply(this,arguments) };

subclass$(PushAssign,Assign);
exports.PushAssign = PushAssign; // export class 
PushAssign.prototype.consumed = function(v){ return this._consumed; }
PushAssign.prototype.setConsumed = function(v){ this._consumed = v; return this; };

PushAssign.prototype.register = function (node){
	this._consumed || (this._consumed = []);
	this._consumed.push(node);
	return this;
};

PushAssign.prototype.js = function (o){
	return ("" + (this.left().c()) + ".push(" + (this.right().c()) + ")");
};

PushAssign.prototype.consume = function (node){
	return this;
};

function TagPushAssign(){ return PushAssign.apply(this,arguments) };

subclass$(TagPushAssign,PushAssign);
exports.TagPushAssign = TagPushAssign; // export class 
TagPushAssign.prototype.js = function (o){
	return ("" + (this.left().c()) + ".push(" + (this.right().c()) + ")");
};

TagPushAssign.prototype.consume = function (node){
	return this;
};


function ConditionalAssign(){ return Assign.apply(this,arguments) };

subclass$(ConditionalAssign,Assign);
exports.ConditionalAssign = ConditionalAssign; // export class 
ConditionalAssign.prototype.consume = function (node){
	return this.normalize().consume(node);
};

ConditionalAssign.prototype.normalize = function (){
	var l = this.left().node();
	var ls = l;
	
	if (l instanceof Access) {
		if (l.left()) {
			l.left().cache();
		};
		ls = l.clone(l.left(),l.right()); // this should still be cached?
		if (l instanceof PropertyAccess) { l.cache() }; // correct now, to a certain degree
		if (l instanceof IndexAccess) {
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
	var ast = IF(this.condition(),OP('=',this.left(),this.right()),this.left());
	ast.setScope(null); // not sure about this
	if (ast.isExpressable()) { ast.toExpression() }; // forced expression already
	return ast.c();
};

function CompoundAssign(){ return Assign.apply(this,arguments) };

subclass$(CompoundAssign,Assign);
exports.CompoundAssign = CompoundAssign; // export class 
CompoundAssign.prototype.consume = function (node){
	if (this.isExpressable()) { return CompoundAssign.prototype.__super__.consume.apply(this,arguments) };
	
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
	var ast = OP('=',this.left(),OP(this.op()[0],this.left(),this.right()));
	if (ast.isExpressable()) { ast.toExpression() };
	
	return ast;
};

CompoundAssign.prototype.c = function (){
	var ast = this.normalize();
	if (ast == this) { return CompoundAssign.prototype.__super__.c.apply(this,arguments) };
	
	// otherwise it is important that we actually replace this node in the outer block
	// whenever we normalize and override c it is important that we can pass on caching
	// etc -- otherwise there WILL be issues.
	var up = STACK.current();
	if (up instanceof Block) {
		// an alternative would be to just pass
		up.replace(this,ast);
	};
	return ast.c();
};


function AsyncAssign(){ return Assign.apply(this,arguments) };

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
TupleAssign.prototype.op = function(v){ return this._op; }
TupleAssign.prototype.setOp = function(v){ this._op = v; return this; };
TupleAssign.prototype.left = function(v){ return this._left; }
TupleAssign.prototype.setLeft = function(v){ this._left = v; return this; };
TupleAssign.prototype.right = function(v){ return this._right; }
TupleAssign.prototype.setRight = function(v){ this._right = v; return this; };
TupleAssign.prototype.type = function(v){ return this._type; }
TupleAssign.prototype.setType = function(v){ this._type = v; return this; };

TupleAssign.prototype.isExpressable = function (){
	return this.right().isExpressable();
};

TupleAssign.prototype.addExpression = function (expr){
	if (this.right() instanceof Tuple) {
		this.right().push(expr);
	} else {
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
		this.setType(this.left().first().node().type() || 'var'); // what about let?
		// should possibly allow real vars as well, no?
		this._vars = this.left().nodes().filter(function(n) { return n instanceof VarReference; });
		// collect the vars for tuple for easy access
		
		// NOTE can improve.. should rather make the whole left be a VarBlock or TupleVarBlock
	};
	
	this.right().traverse();
	this.left().traverse();
	return this;
};

TupleAssign.prototype.js = function (o){
	// only for actual inner expressions, otherwise cache the whole array, no?
	var self = this;
	if (!self.right().isExpressable()) {
		
		return self.right().consume(self).c();
	};
	
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
	var vartype = typ;
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
	var rlen = (rgt instanceof Tuple) ? rgt.count() : null;
	
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
		// forcing the arguments to be named
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
					pairs.slice(i).map(function(part) {
						if (part[1].hasSideEffects()) {
							self._temporary.push(part[1]); // need a generalized way to do this type of thing
							return ast.push(part[1].cache({force: true,pool: 'swap',declared: typ == 'var'}));
						};
					});
				};
			};
			
			// if the previous value in ast is a reference to our value - the caching was not needed
			if (ast.last() == r) {
				r.decache();
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
		// FIXME iter will now be explicitly declared in ast AND in scope?
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
		
		var blktype = (vartype) ? VarBlock : Block;
		var blk = new blktype([]);
		
		if (vartype) {
			blk._type = vartype;
		};
		
		// blk = top if typ == 'var'
		ast.push(blk);
		
		// if the lvals are not variables - we need to preassign
		// can also use slice here for simplicity, but try with while now
		lft.map(function(l,i) {
			if (l == lsplat) {
				var lvar = l.node();
				var rem = llen - i - 1; // remaining after splat
				
				if (!vartype) {
					var arr = self.util().array(OP('-',len,new Num(i + rem)),true);
					top.push(arr);
					lvar = arr.cachevar();
				} else {
					if (!blk) { ast.push(blk = new blktype()) };
					arr = self.util().array(OP('-',len,new Num(i + rem)));
					blk.push(OP('=',lvar,arr));
				};
				
				// if !lvar:variable || !lvar.variable # lvar =
				// 	top.push()
				//	p "has variable - no need to create a temp"
				// blk.push(OP('=',lvar,Arr.new([]))) # dont precalculate size now
				// max = to = (rlen - (llen - i))
				
				
				var test = rem ? OP('-',len,rem) : len;
				
				var set = OP('=',OP('.',lvar,OP('-',idx,new Num(i))),
				OP('.',iter,OP('++',idx)));
				
				ast.push(WHILE(OP('<',idx,test),set));
				
				if (!vartype) {
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
				return blk.push(OP('=',l,OP('.',iter,new Num(i))));
			};
		});
	};
	
	// if we are in an expression we need to autodecare vars
	if (o.isExpression() && self._vars) {
		for (var i = 0, items = iter$(self._vars), len_ = items.length; i < len_; i++) {
			items[i].variable().autodeclare();
		};
	} else if (self._vars) {
		for (var j = 0, ary = iter$(self._vars), len__ = ary.length; j < len__; j++) {
			ary[j].variable().predeclared();
		};
	};
	
	// is there any reason to make it into an expression?
	if (ast.isExpressable()) { // NO!
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
	var out = TupleAssign.prototype.__super__.c.call(this,o);
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
Identifier.prototype.safechain = function(v){ return this._safechain; }
Identifier.prototype.setSafechain = function(v){ this._safechain = v; return this; };
Identifier.prototype.value = function(v){ return this._value; }
Identifier.prototype.setValue = function(v){ this._value = v; return this; };

Identifier.prototype.references = function (variable){
	if (this._value) { this._value._variable = variable };
	return this;
};

Identifier.prototype.sourceMapMarker = function (){
	return this._value.sourceMapMarker();
};

Identifier.prototype.load = function (v){
	return ((v instanceof Identifier) ? v.value() : v);
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
	return this._symbol || (this._symbol = AST.sym(this.value()));
};

Identifier.prototype.setter = function (){
	// console.log "Identifier#setter"
	var tok;
	return this._setter || (this._setter = true && (
		tok = new Token('IDENTIFIER',AST.sym('set-' + this._value),this._value._loc || -1),
		new Identifier(tok)
		// Identifier.new("set-{symbol}")
	));
};

Identifier.prototype.toString = function (){
	return String(this._value);
};

Identifier.prototype.toJSON = function (){
	return this.toString();
};

Identifier.prototype.alias = function (){
	return AST.sym(this._value);
};

Identifier.prototype.js = function (o){
	return this.symbol();
};

Identifier.prototype.c = function (){
	return '' + this.symbol(); // AST.mark(@value) +
};

Identifier.prototype.dump = function (){
	return {loc: this.region()};
};

Identifier.prototype.namepath = function (){
	return this.toString();
};

Identifier.prototype.shouldParenthesizeInTernary = function (){
	return this._parens || this._cache;
};

function TagIdRef(v){
	this._value = (v instanceof Identifier) ? v.value() : v;
	this;
};

subclass$(TagIdRef,Identifier);
exports.TagIdRef = TagIdRef; // export class 
TagIdRef.prototype.c = function (){
	return ("" + (this.scope__().imba().c()) + ".getTagSingleton('" + this.value().c().substr(1) + "')");
};


// This is not an identifier - it is really a string
// Is this not a literal?

// FIXME Rename to IvarLiteral? or simply Literal with type Ivar
function Ivar(v){
	this._value = (v instanceof Identifier) ? v.value() : v;
	this._private = String(this._value)[0] == '#';
	this;
};

subclass$(Ivar,Identifier);
exports.Ivar = Ivar; // export class 
var prefix = '_'; // '_'

Ivar.prototype.isPrivate = function (){
	return !!this._private;
};

Ivar.prototype.name = function (){
	return (this._private ? '__' : '') + helpers.dashToCamelCase(this._value).replace(/^[@\#]/,'');
	// value.c.camelCase.replace(/^@/,'')
};

Ivar.prototype.prefixed = function (){
	return this.name(); // (@private ? '__' : '') + name
};

Ivar.prototype.alias = function (){
	return this.prefixed();
};

// the @ should possibly be gone from the start?
Ivar.prototype.js = function (o){
	return this.prefixed();
};

Ivar.prototype.c = function (){
	return this.prefixed();
};

function Decorator(){ return ValueNode.apply(this,arguments) };

subclass$(Decorator,ValueNode);
exports.Decorator = Decorator; // export class 
Decorator.prototype.visit = function (){
	var block;
	if (this._call) { this._call.traverse() };
	
	if (block = this.up()) {
		block._decorators || (block._decorators = []);
		return block._decorators.push(this);
	};
};

// Ambiguous - We need to be consistent about Const vs ConstAccess
// Becomes more important when we implement typeinference and code-analysis
function Const(){ return Identifier.apply(this,arguments) };

subclass$(Const,Identifier);
exports.Const = Const; // export class 
Const.prototype.symbol = function (){
	// console.log "Identifier#symbol {value}"
	return this._symbol || (this._symbol = AST.sym(this.value()));
};

Const.prototype.js = function (o){
	return this._variable ? this._variable.c() : this.symbol();
};

Const.prototype.traverse = function (){
	if (this._traversed) {
		return;
	};
	
	this._traversed = true;
	var curr = STACK.current();
	if (!(curr instanceof Access) || curr.left() == this) {
		if (this.symbol() == "Imba") {
			this._variable = this.scope__().imba();
		} else {
			this._variable = this.scope__().lookup(this.value());
		};
	};
	return this;
};

Const.prototype.c = function (){
	if (this.option('export')) {
		return ("exports." + (this._value) + " = ") + AST.mark(this._value) + this.js();
	} else {
		return AST.mark(this._value) + this.js();
	};
};


function TagTypeIdentifier(value){
	this._token = value;
	this._value = this.load(value);
	this;
};

subclass$(TagTypeIdentifier,Identifier);
exports.TagTypeIdentifier = TagTypeIdentifier; // export class 
TagTypeIdentifier.prototype.name = function(v){ return this._name; }
TagTypeIdentifier.prototype.setName = function(v){ this._name = v; return this; };
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
	return "'" + this._str + "'";
};

TagTypeIdentifier.prototype.c = function (){
	return this.js();
};

TagTypeIdentifier.prototype.func = function (){
	var name = this._name.replace(/-/g,'_').replace(/\#/,'');
	if (this._ns) { name += ("$" + (this._ns.toLowerCase())) };
	return name;
};

TagTypeIdentifier.prototype.isClass = function (){
	return !(!this._str.match(/^[A-Z]/));
	// @name[0] == @name[0].toUpperCase and 
};

TagTypeIdentifier.prototype.isNative = function (){
	return !this._ns && TAG_TYPES.HTML.indexOf(this._str) >= 0;
};

TagTypeIdentifier.prototype.isSimpleNative = function (){
	return this.isNative() && !(/input|textarea|select|form|iframe/).test(this._str);
};

TagTypeIdentifier.prototype.spawner = function (){
	console.log("TagTypeIdentifier shuold never be used");
	if (this._ns) {
		return ("_" + (this._ns.toUpperCase()) + "." + (this._name.replace(/-/g,'_').toUpperCase()));
	} else {
		return ("" + (this._name.replace(/-/g,'_').toUpperCase()));
	};
};

TagTypeIdentifier.prototype.id = function (){
	var m = this._str.match(/\#([\w\-\d\_]+)\b/);
	return m ? m[1] : null;
};


TagTypeIdentifier.prototype.flag = function (){
	return "_" + this.name().replace(/--/g,'_').toLowerCase();
};

TagTypeIdentifier.prototype.sel = function (){
	return ("." + this.flag()); // + name.replace(/-/g,'_').toLowerCase
};

TagTypeIdentifier.prototype.string = function (){
	return this.value();
};


function Argvar(){ return ValueNode.apply(this,arguments) };

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
	return ("" + AST.c(par.name())); // c
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
		if (str == 'extern') {
			callee.value().value()._type = 'EXTERN';
			return new ExternDeclaration(args);
		};
		if (str == 'tag') {
			// console.log "ERROR - access args by some method"
			return new TagWrapper((args && args.index) ? args.index(0) : args[0]);
		};
		if (str == 'export') {
			return new Export(args);
		};
	};
	
	this._callee = callee;
	this._args = args || new ArgList([]);
	
	if (args instanceof Array) {
		this._args = new ArgList(args);
	};
	
	if (callee instanceof Decorator) {
		callee._call = this;
		return callee;
	};
	
	return this;
};

subclass$(Call,Node);
exports.Call = Call; // export class 
Call.prototype.callee = function(v){ return this._callee; }
Call.prototype.setCallee = function(v){ this._callee = v; return this; };
Call.prototype.receiver = function(v){ return this._receiver; }
Call.prototype.setReceiver = function(v){ this._receiver = v; return this; };
Call.prototype.args = function(v){ return this._args; }
Call.prototype.setArgs = function(v){ this._args = v; return this; };
Call.prototype.block = function(v){ return this._block; }
Call.prototype.setBlock = function(v){ this._block = v; return this; };

Call.prototype.loc = function (){
	return this._callee.loc();
};

Call.prototype.visit = function (){
	this.args().traverse();
	this.callee().traverse();
	// if the callee is a PropertyAccess - better to immediately change it
	
	return this._block && this._block.traverse();
};

Call.prototype.addBlock = function (block){
	var pos = this._args.filter(function(n,i) { return n == '&'; })[0]; // WOULD BE TOKEN - CAREFUL
	pos ? this.args().replace(pos,block) : this.args().push(block);
	return this;
};

Call.prototype.receiver = function (){
	return this._receiver || (this._receiver = ((this.callee() instanceof Access) && this.callee().left() || NULL));
};

// check if all arguments are expressions - otherwise we have an issue

Call.prototype.safechain = function (){
	return this.callee().safechain(); // really?
};

Call.prototype.shouldParenthesizeInTernary = function (){
	return this._parens || this.safechain() || this._cache;
};

Call.prototype.js = function (o){
	var opt = {expression: true};
	var rec = null;
	// var args = AST.compact(args) # really?
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
		this._receiver = callee.receiver();
		callee = this._callee = new Access(callee.op(),callee.left(),callee.right());
		// console.log "unwrapping the propertyAccess"
	};
	
	if ((rgt instanceof Identifier) && rgt.value() == 'len' && args.count() == 0) {
		return new Util.Len([lft || callee]).c();
		
		// rewrite a.len(..) to len$(a)
	};
	
	if (callee.safechain()) {
		// Does this affect shouldParenthesizeInTernary?
		// if lft isa Call
		// if lft isa Call # could be a property access as well - it is the same?
		// if it is a local var access we simply check if it is a function, then call
		// but it should be safechained outside as well?
		// lft.cache if lft
		// the outer safechain should not cache the whole call - only ask to cache
		// the result? -- chain onto
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
		var rec1 = this.receiver();
		var ary = ((args.count() == 1) ? new ValueNode(args.first().value()) : new Arr(args.list()));
		
		rec1.cache(); // need to cache the context as it will be referenced in apply
		out = ("" + callee.c({expression: true}) + ".apply(" + (rec1.c()) + "," + ary.c({expression: true}) + ")");
	} else if (this._receiver) {
		// quick workaround
		if (!((this._receiver instanceof ScopeContext))) { this._receiver.cache() };
		args.unshift(this.receiver());
		// should rather rewrite to a new call?
		out = ("" + callee.c({expression: true}) + ".call(" + args.c({expression: true}) + ")");
	} else {
		out = ("" + callee.c({expression: true}) + "(" + args.c({expression: true}) + ")");
	};
	
	if (wrap) {
		// we set the cachevar inside
		if (this._cache) {
			this._cache.manual = true;
			out = ("(" + (this.cachevar().c()) + "=" + out + ")");
		};
		
		out = [wrap[0],out,wrap[1]].join("");
	};
	
	return out;
};




function ImplicitCall(){ return Call.apply(this,arguments) };

subclass$(ImplicitCall,Call);
exports.ImplicitCall = ImplicitCall; // export class 
ImplicitCall.prototype.js = function (o){
	return ("" + (this.callee().c()) + "()");
};

function New(){ return Call.apply(this,arguments) };

subclass$(New,Call);
exports.New = New; // export class 
New.prototype.js = function (o){
	var target = this.callee();
	
	while (target instanceof Access){
		var left = target.left();
		
		if ((left instanceof PropertyAccess) || (left instanceof VarOrAccess)) {
			this.callee()._parens = true;
			break;
		};
		
		target = left;
	};
	
	var out = ("new " + (this.callee().c()));
	if (!((o.parent() instanceof Call))) { out += '()' };
	return out;
};

function SuperCall(){ return Call.apply(this,arguments) };

subclass$(SuperCall,Call);
exports.SuperCall = SuperCall; // export class 
SuperCall.prototype.js = function (o){
	var m = o.method();
	this.setReceiver(SELF);
	this.setCallee(("" + (m.target().c()) + ".super$.prototype." + (m.name().c())));
	return SuperCall.prototype.__super__.js.apply(this,arguments);
};



function ExternDeclaration(){ return ListNode.apply(this,arguments) };

subclass$(ExternDeclaration,ListNode);
exports.ExternDeclaration = ExternDeclaration; // export class 
ExternDeclaration.prototype.visit = function (){
	this.setNodes(this.map(function(item) { return item.node(); })); // drop var or access really
	// only in global scope?
	var root = this.scope__();
	for (var i = 0, items = iter$(this.nodes()), len = items.length, item; i < len; i++) {
		item = items[i];
		var variable = root.register(item.symbol(),item,{type: 'global'});
		variable.addReference(item);
	};
	return this;
};

ExternDeclaration.prototype.c = function (){
	return "// externs";
};


// FLOW

function ControlFlow(){ return Node.apply(this,arguments) };

subclass$(ControlFlow,Node);
exports.ControlFlow = ControlFlow; // export class 
ControlFlow.prototype.loc = function (){
	return this._body ? this._body.loc() : [0,0];
};

function ControlFlowStatement(){ return ControlFlow.apply(this,arguments) };

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
If.prototype.test = function(v){ return this._test; }
If.prototype.setTest = function(v){ this._test = v; return this; };
If.prototype.body = function(v){ return this._body; }
If.prototype.setBody = function(v){ this._body = v; return this; };
If.prototype.alt = function(v){ return this._alt; }
If.prototype.setAlt = function(v){ this._alt = v; return this; };
If.prototype.scope = function(v){ return this._scope; }
If.prototype.setScope = function(v){ this._scope = v; return this; };
If.prototype.prevIf = function(v){ return this._prevIf; }
If.prototype.setPrevIf = function(v){ this._prevIf = v; return this; };

If.ternary = function (cond,body,alt){
	// prefer to compile it this way as well
	var obj = new If(cond,new Block([body]),{type: '?'});
	obj.addElse(new Block([alt]));
	return obj;
};

If.prototype.addElse = function (add){
	if (this.alt() && (this.alt() instanceof If)) {
		this.alt().addElse(add);
	} else {
		this.setAlt(add);
		if (add instanceof If) {
			add.setPrevIf(this);
		};
	};
	return this;
};

If.prototype.loc = function (){
	return this._loc || (this._loc = [this._type ? this._type._loc : 0,this.body().loc()[1]]);
};

If.prototype.invert = function (){
	if (this._test instanceof ComparisonOp) {
		return this._test = this._test.invert();
	} else {
		return this._test = new UnaryOp('!',this._test,null);
	};
};

If.prototype.visit = function (stack){
	var alt = this.alt();
	
	if (this._scope) { this._scope.visit() };
	if (this.test()) { this.test().traverse() };
	
	this._tag = stack._tag;
	
	if (this._tag) {
		this._tag.set({hasConditionals: true});
	};
	
	// console.log "vars in if",Object.keys(@scope.varmap)
	for (var o = this._scope.varmap(), variable, i = 0, keys = Object.keys(o), l = keys.length, name; i < l; i++){
		name = keys[i];variable = o[name];if (variable.type() == 'let') {
			variable._virtual = true;
		};
	};
	
	// the let-variables declared in if(*test*) should be
	// local to the inner scope, but will technically be
	// declared in the outer scope. Must get unique name
	
	if (!stack.isAnalyzing()) {
		this._pretest = AST.truthy(this.test());
		
		if (this._pretest === true) {
			alt = this._alt = null;
		} else if (this._pretest === false) {
			this.loc(); // cache location before removing body
			this.setBody(null);
		};
	};
	
	if (this.body()) { this.body().traverse() };
	
	// should skip the scope in alt.
	if (alt) {
		STACK.pop(this);
		alt._scope || (alt._scope = new BlockScope(alt));
		alt.traverse();
		STACK.push(this);
	};
	
	// force it as expression?
	if (this._type == '?' && this.isExpressable()) this.toExpression();
	return this;
};


If.prototype.js = function (o){
	var v_, test_;
	var body = this.body();
	// would possibly want to look up / out
	var brace = {braces: true,indent: true};
	
	if (this._pretest === true && false) {
		// what if it is inside expression?
		var js = body ? body.c({braces: !(!(this.prevIf()))}) : 'true';
		
		if (!(this.prevIf())) {
			js = helpers.normalizeIndentation(js);
		};
		
		if (o.isExpression()) {
			js = '(' + js + ')';
		};
		
		return js;
	} else if (this._pretest === false && false) {
		if (this.alt() instanceof If) { (this.alt().setPrevIf(v_ = this.prevIf()),v_) };
		var js1 = this.alt() ? this.alt().c({braces: !(!(this.prevIf()))}) : '';
		
		if (!(this.prevIf())) {
			js1 = helpers.normalizeIndentation(js1);
		};
		
		return js1;
	};
	
	
	if (o.isExpression()) {
		
		if ((test_ = this.test()) && test_.shouldParenthesizeInTernary  &&  test_.shouldParenthesizeInTernary()) {
			this.test()._parens = true;
		};
		
		var cond = this.test().c({expression: true}); // the condition is always an expression
		
		var code = body ? body.c() : 'true'; // (braces: yes)
		
		if (body && body.shouldParenthesizeInTernary()) {
			code = '(' + code + ')'; // if code.indexOf(',') >= 0
		};
		
		if (this.alt()) {
			var altbody = this.alt().c();
			if (this.alt().shouldParenthesizeInTernary()) {
				altbody = '(' + altbody + ')';
			};
			
			return ("" + cond + " ? " + code + " : " + altbody);
		} else {
			// again - we need a better way to decide what needs parens
			// maybe better if we rewrite this to an OP('&&'), and put
			// the parens logic there
			// cond should possibly have parens - but where do we decide?
			if (this._tag) {
				return ("" + cond + " ? " + code + " : void(0)");
			} else {
				return ("" + cond + " && " + code);
			};
		};
	} else {
		// if there is only a single item - and it is an expression?
		code = null;
		cond = this.test().c({expression: true}); // the condition is always an expression
		
		// if body.count == 1 # dont indent by ourselves?
		
		if ((body instanceof Block) && body.count() == 1 && !(body.first() instanceof LoopFlowStatement)) {
			body = body.first();
		};
		
		// if body.count == 1
		//	p "one item only!"
		//	body = body.first
		
		code = body ? body.c({braces: true}) : '{}'; // (braces: yes)
		
		// don't wrap if it is only a single expression?
		var out = ("" + AST.mark(this._type) + "if (" + cond + ") ") + code; // ' {' + code + '}' # '{' + code + '}'
		if (this.alt()) { out += (" else " + this.alt().c((this.alt() instanceof If) ? {} : brace)) };
		return out;
	};
};

If.prototype.sourceMapMarker = function (){
	return this;
};

If.prototype.shouldParenthesize = function (){
	return !!this._parens;
};

If.prototype.consume = function (node){
	if (node instanceof TagPushAssign) {
		if (this._body) { this._body = this._body.consume(node) };
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
		return If.prototype.__super__.consume.call(this,node);
	} else {
		if (this._body) { this._body = this._body.consume(node) };
		if (this._alt) { this._alt = this._alt.consume(node) };
	};
	return this;
};


If.prototype.isExpressable = function (){
	// process:stdout.write 'x'
	var exp = (!(this.body()) || this.body().isExpressable()) && (!(this.alt()) || this.alt().isExpressable());
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
Loop.prototype.scope = function(v){ return this._scope; }
Loop.prototype.setScope = function(v){ this._scope = v; return this; };
Loop.prototype.options = function(v){ return this._options; }
Loop.prototype.setOptions = function(v){ this._options = v; return this; };
Loop.prototype.body = function(v){ return this._body; }
Loop.prototype.setBody = function(v){ this._body = v; return this; };
Loop.prototype.catcher = function(v){ return this._catcher; }
Loop.prototype.setCatcher = function(v){ this._catcher = v; return this; };

Loop.prototype.loc = function (){
	var a = this._options.keyword;
	var b = this._body;
	
	if (a && b) {
		// FIXME does not support POST_ variants yet
		return [a._loc,b.loc()[1]];
	} else {
		return [0,0];
	};
};

Loop.prototype.set = function (obj){
	this._options || (this._options = {});
	var keys = Object.keys(obj);
	for (var i = 0, items = iter$(keys), len = items.length, k; i < len; i++) {
		k = items[i];
		this._options[k] = obj[k];
	};
	return this;
};


Loop.prototype.addBody = function (body){
	this.setBody(AST.blk(body));
	return this;
};


Loop.prototype.c = function (o){
	
	var s = this.stack();
	var curr = s.current();
	
	
	
	if (this.stack().isExpression() || this.isExpression()) {
		// what the inner one should not be an expression though?
		// this will resut in an infinite loop, no?!?
		this.scope().closeScope();
		var ast = CALL(FN([],[this]),[]);
		return ast.c(o);
	} else if ((this.stack().current() instanceof Block) || ((s.up() instanceof Block) && s.current()._consumer == this)) {
		return Loop.prototype.__super__.c.call(this,o);
	} else {
		this.scope().closeScope();
		ast = CALL(FN([],[this]),[]);
		// scope.context.reference
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
	if (this.option('invert')) {
		// "invert test for while {@test}"
		this._test = test.invert();
	};
	// invert the test
};


subclass$(While,Loop);
exports.While = While; // export class 
While.prototype.test = function(v){ return this._test; }
While.prototype.setTest = function(v){ this._test = v; return this; };

While.prototype.visit = function (){
	this.scope().visit();
	if (this.test()) { this.test().traverse() };
	if (this.body()) { return this.body().traverse() };
};

While.prototype.loc = function (){
	var o = this._options;
	return helpers.unionOfLocations(o.keyword,this._body,o.guard,this._test);
};

// TODO BUG -- when we declare a var like: while var y = ...
// the variable will be declared in the WhileScope which never
// force-declares the inner variables in the scope

While.prototype.consume = function (node){
	// This is never expressable, but at some point
	// we might want to wrap it in a function (like CS)
	if (this.isExpressable()) { return While.prototype.__super__.consume.apply(this,arguments) };
	
	if (node instanceof TagTree) {
		console.log("While.consume TagTree");
		// WARN this is a hack to allow references coming through the wrapping scope
		// will result in unneeded self-declarations and other oddities
		this.scope().closeScope();
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
	var out = ("while (" + this.test().c({expression: true}) + ")") + this.body().c({braces: true,indent: true}); // .wrap
	
	if (this.scope().vars().count() > 0) {
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
For.prototype.loc = function (){
	var o = this._options;
	return helpers.unionOfLocations(o.keyword,this._body,o.guard,o.step,o.source);
};

For.prototype.traverse = function (){
	var stack = STACK;
	if (stack._tag && !this._scope._tagLoop) {
		stack._tag.set({hasLoops: true});
		var fn = this._scope._tagLoop = new TagLoopFunc([],[this]);
		stack.current().swap(this,fn);
		return fn.traverse();
	} else {
		return For.prototype.__super__.traverse.apply(this,arguments);
	};
};


For.prototype.visit = function (stack){
	this.scope().visit();
	
	this.options().source.traverse(); // what about awakening the vars here?
	this.declare();
	
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
	
	// what about a range where we also include an index?
	if (src instanceof Range) {
		
		var from = src.left();
		var to = src.right();
		var dynamic = !((from instanceof Num)) || !((to instanceof Num));
		
		if (to instanceof Num) {
			vars.len = to;
		} else {
			// vars:len = scope.vars.push(vars:index.assignment(src.left))
			// vars:len = to.cache(force: yes, pool: 'len').predeclare
			vars.len = scope.declare('len',to,{type: 'let'});
			// to.cache(force: yes, pool: 'len').predeclare
		};
		
		// scope.vars.push(vars:index.assignment(src.left))
		vars.value = scope.declare(o.name,from,{type: 'let'});
		if (o.name) { vars.value.addReference(o.name) };
		
		if (o.index) {
			vars.index = scope.declare(o.index,0,{type: 'let'});
			vars.index.addReference(o.index);
		} else {
			vars.index = vars.value;
		};
		
		if (dynamic) {
			vars.diff = scope.declare('rd',OP('-',vars.len,vars.value),{type: 'let'});
		};
	} else {
		if (oi) {
			vars.index = scope.declare(oi,0,{type: 'let'});
		} else {
			vars.index = scope.declare('i',new Num(0),{system: true,type: 'let',pool: 'counter'});
		};
		
		vars.source = bare ? src : scope.declare('items',this.util().iterable(src),{system: true,type: 'let',pool: 'iter'});
		vars.len = scope.declare('len',this.util().len(vars.source),{type: 'let',pool: 'len',system: true});
		
		vars.value = scope.declare(o.name,null,{type: 'let'});
		vars.value.addReference(o.name); // adding reference!
		if (oi) { vars.index.addReference(oi) };
	};
	
	return this;
};

For.prototype.consume = function (node){
	
	var receiver;
	if (this.isExpressable()) {
		return For.prototype.__super__.consume.apply(this,arguments);
	};
	
	if (this._resvar) {
		var ast = new Block([this,BR,this._resvar.accessor()]);
		ast.consume(node);
		return ast;
	};
	
	var resvar = null;
	var reuseable = false; // node isa Assign && node.left.node isa LocalVarAccess
	var assignee = null;
	// might only work for locals?
	if (node instanceof Assign) {
		if (receiver = node.left()) {
			if (assignee = receiver._variable) {
				// we can only pull the var reference into the scope
				// if we know that the variable is declared in this scope
				reuseable = (receiver instanceof VarReference);
			};
		};
	};
	
	resvar = this._resvar || (this._resvar = this.scope().register('res',null,{system: true,type: 'var'}));
	
	this._catcher = new PushAssign("push",resvar,null); // the value is not preset
	var resval = new Arr([]);
	this.body().consume(this._catcher); // should still return the same body
	
	if (node) {
		var block = [this,BR,resvar.accessor().consume(node)];
		
		if (this._resvar) {
			block.unshift(BR);
			block.unshift(OP('=',new VarReference(this._resvar,'let'),resval));
		};
		
		ast = new Block(block);
		return ast;
	};
	
	return this;
};

For.prototype.js = function (o){
	var vars = this.options().vars;
	var idx = vars.index;
	var val = vars.value;
	var src = this.options().source;
	
	var cond;
	var final;
	
	if (src instanceof Range) {
		var a = src.left();
		var b = src.right();
		var inc = src.inclusive();
		
		cond = OP(inc ? '<=' : '<',val,vars.len);
		final = OP('++',val);
		
		if (vars.diff) {
			cond = If.ternary(OP('>',vars.diff,new Num(0)),cond,OP(inc ? '>=' : '>',val,vars.len));
			final = If.ternary(OP('>',vars.diff,new Num(0)),OP('++',val),OP('--',val));
		};
		
		if (idx && idx != val) {
			final = new ExpressionBlock([final,OP('++',idx)]);
		};
	} else {
		cond = OP('<',idx,vars.len);
		
		if (val.refcount() < 3 && val.assignments().length == 0 && !val._noproxy) {
			val.proxy(vars.source,idx);
		} else {
			this.body().unshift(OP('=',val,OP('.',vars.source,idx)),BR);
		};
		
		if (this.options().step) {
			final = OP('=',idx,OP('+',idx,this.options().step));
		} else {
			final = OP('++',idx);
		};
	};
	
	var code = this.body().c({braces: true,indent: true});
	var head = ("" + AST.mark(this.options().keyword) + "for (" + (this.scope().vars().c()) + "; " + cond.c({expression: true}) + "; " + final.c({expression: true}) + ") ");
	return head + code;
};



function ForIn(){ return For.apply(this,arguments) };

subclass$(ForIn,For);
exports.ForIn = ForIn; // export class 




function ForOf(){ return For.apply(this,arguments) };

subclass$(ForOf,For);
exports.ForOf = ForOf; // export class 
ForOf.prototype.declare = function (){
	var o = this.options();
	var vars = o.vars = {};
	var k;
	var v;
	
	// possibly proxy the index-variable?
	
	if (o.own) {
		vars.source = o.source._variable || this.scope().declare('o',o.source,{system: true,type: 'let'});
		if (o.index) { v = vars.value = this.scope().declare(o.index,null,{let: true,type: 'let'}) };
		var i = vars.index = this.scope().declare('i',new Num(0),{system: true,type: 'let',pool: 'counter'});
		
		// systemvariable -- should not really be added to the map
		var keys = vars.keys = this.scope().declare('keys',Util.keys(vars.source.accessor()),{system: true,type: 'let'}); // the outer one should resolve first
		var l = vars.len = this.scope().declare('l',Util.len(keys.accessor()),{system: true,type: 'let'});
		k = vars.key = this.scope().declare(o.name,null,{type: 'let'}); // scope.declare(o:name,null,system: yes)
	} else {
		// we set the var -- why even declare it
		// no need to declare -- it will declare itself in the loop - no?
		vars.source = o.source._variable || this.scope().temporary(o.source,{system: true,pool: 'dict',type: 'let'});
		if (o.index) { v = vars.value = this.scope().declare(o.index,null,{let: true,type: 'let'}) };
		k = vars.key = this.scope().register(o.name,o.name,{type: 'let'});
	};
	
	// TODO use util - why add references already? Ah -- this is for the highlighting
	if (v && o.index) { v.addReference(o.index) };
	if (k && o.name) { k.addReference(o.name) };
	
	return this;
};

ForOf.prototype.js = function (o){
	var vars = this.options().vars;
	var osrc = this.options().source;
	var src = vars.source;
	var k = vars.key;
	var v = vars.value;
	var i = vars.index;
	
	var code;
	
	if (this.options().own) {
		if (v && v.refcount() > 0) {
			this.body().unshift(OP('=',v,OP('.',src,k)));
		};
		
		// if k.refcount < 3 # should probably adjust these
		//	k.proxy(vars:keys,i)
		// else
		this.body().unshift(OP('=',k,OP('.',vars.keys,i)));
		code = this.body().c({indent: true,braces: true}); // .wrap
		var head = ("" + AST.mark(this.options().keyword) + "for (" + (this.scope().vars().c()) + "; " + (OP('<',i,vars.len).c()) + "; " + (OP('++',i).c()) + ")");
		return head + code;
	} else {
		if (v && v.refcount() > 0) {
			this.body().unshift(OP('=',v,OP('.',src,k)));
		};
		
		code = this.scope().c({braces: true,indent: true});
		var inCode = osrc._variable ? src : ((OP('=',src,osrc)));
		// it is really important that this is a treated as a statement
		return ("" + AST.mark(this.options().keyword) + "for (" + (o.es5() ? 'var' : 'let') + " " + (k.c()) + " in " + inCode.c({expression: true}) + ")") + code;
	};
};

ForOf.prototype.head = function (){
	var v = this.options().vars;
	
	return [
		OP('=',v.key,OP('.',v.keys,v.index)),
		v.value && OP('=',v.value,OP('.',v.source,v.key))
	];
};

// NO NEED?
function Begin(body){
	this._nodes = AST.blk(body).nodes();
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
Switch.prototype.source = function(v){ return this._source; }
Switch.prototype.setSource = function(v){ this._source = v; return this; };
Switch.prototype.cases = function(v){ return this._cases; }
Switch.prototype.setCases = function(v){ this._cases = v; return this; };
Switch.prototype.fallback = function(v){ return this._fallback; }
Switch.prototype.setFallback = function(v){ this._fallback = v; return this; };


Switch.prototype.visit = function (){
	for (var i = 0, items = iter$(this.cases()), len = items.length; i < len; i++) {
		items[i].traverse();
	};
	if (this.fallback()) { this.fallback().visit() };
	if (this.source()) { this.source().visit() };
	return;
};


Switch.prototype.consume = function (node){
	// TODO work inside tags (like loops)
	this._cases = this._cases.map(function(item) { return item.consume(node); });
	if (this._fallback) { this._fallback = this._fallback.consume(node) };
	return this;
};

Switch.prototype.c = function (o){
	if (this.stack().isExpression() || this.isExpression()) {
		var ast = CALL(FN([],[this]),[]);
		return ast.c(o);
	};
	
	return Switch.prototype.__super__.c.call(this,o);
};


Switch.prototype.js = function (o){
	var body = [];
	
	for (var i = 0, items = iter$(this.cases()), len = items.length, part; i < len; i++) {
		part = items[i];
		part.autobreak();
		body.push(part);
	};
	
	if (this.fallback()) {
		body.push("default:\n" + this.fallback().c({indent: true}));
	};
	
	return ("switch (" + (this.source().c()) + ") ") + helpers.bracketize(AST.cary(body).join("\n"),true);
};



function SwitchCase(test,body){
	this._traversed = false;
	this._test = test;
	this._body = AST.blk(body);
	this._scope = new BlockScope(this);
};

subclass$(SwitchCase,ControlFlowStatement);
exports.SwitchCase = SwitchCase; // export class 
SwitchCase.prototype.test = function(v){ return this._test; }
SwitchCase.prototype.setTest = function(v){ this._test = v; return this; };
SwitchCase.prototype.body = function(v){ return this._body; }
SwitchCase.prototype.setBody = function(v){ this._body = v; return this; };


SwitchCase.prototype.visit = function (){
	this.scope__().visit();
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
	var cases = this._test.map(function(item) { return ("case " + (item.c()) + ": "); });
	return cases.join("\n") + this.body().c({indent: true,braces: true});
};



function Try(body,c,f){
	this._traversed = false;
	this._body = AST.blk(body);
	this._catch = c;
	this._finally = f;
};


subclass$(Try,ControlFlowStatement);
exports.Try = Try; // export class 
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
		out += (" catch (e) \{ \}");
	};
	out += ";";
	return out;
};



function Catch(body,varname){
	this._traversed = false;
	this._body = AST.blk(body || []);
	this._scope = new CatchScope(this);
	this._varname = varname;
	this;
};

subclass$(Catch,ControlFlowStatement);
exports.Catch = Catch; // export class 
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
	this._body = AST.blk(body || []);
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

function Range(){ return Op.apply(this,arguments) };

subclass$(Range,Op);
exports.Range = Range; // export class 
Range.prototype.inclusive = function (){
	return this.op() == '..';
};

Range.prototype.c = function (){
	return "range";
};


function Splat(){ return ValueNode.apply(this,arguments) };

subclass$(Splat,ValueNode);
exports.Splat = Splat; // export class 
Splat.prototype.js = function (o){
	var par = this.stack().parent();
	if ((par instanceof ArgList) || (par instanceof Arr)) {
		return ("Array.from(" + (this.value().c()) + ")");
	} else {
		this.p(("what is the parent? " + par));
		return "SPLAT";
	};
};

Splat.prototype.node = function (){
	return this.value();
};





// TAGS

var TAG_TYPES = {};
var TAG_ATTRS = {};

TAG_TYPES.HTML = "a abbr address area article aside audio b base bdi bdo big blockquote body br button canvas caption cite code col colgroup data datalist dd del details dfn div dl dt em embed fieldset figcaption figure footer form h1 h2 h3 h4 h5 h6 head header hr html i iframe img input ins kbd keygen label legend li link main map mark menu menuitem meta meter nav noscript object ol optgroup option output p param pre progress q rp rt ruby s samp script section select small source span strong style sub summary sup table tbody td textarea tfoot th thead time title tr track u ul var video wbr".split(" ");

TAG_TYPES.HTML_OPT = "abbr address area article aside audio b base bdi bdo big blockquote body br button canvas caption cite code col colgroup dd del details dfn div dl dt em embed fieldset figcaption figure footer form h1 h2 h3 h4 h5 h6 head header hr html i img ins kbd keygen label legend li link main mark meta meter nav noscript object ol optgroup option output p param pre q rp rt ruby s samp script section small source span strong style sub summary sup table tbody td tfoot th thead time title tr track u ul wbr".split(" ");

TAG_TYPES.SVG = "circle defs ellipse g line linearGradient mask path pattern polygon polylineradialGradient rect stop svg text tspan".split(" ");

TAG_ATTRS.HTML = "accept accessKey action allowFullScreen allowTransparency alt async autoComplete autoFocus autoPlay cellPadding cellSpacing charSet checked className cols colSpan content contentEditable contextMenu controls coords crossOrigin data dateTime defer dir disabled download draggable encType form formNoValidate frameBorder height hidden href hrefLang htmlFor httpEquiv icon id label lang list loop max maxLength mediaGroup method min multiple muted name noValidate pattern placeholder poster preload radioGroup readOnly rel required role rows rowSpan sandbox scope scrollLeft scrolling scrollTop seamless selected shape size span spellCheck src srcDoc srcSet start step style tabIndex target title type useMap value width wmode";

TAG_ATTRS.SVG = "cx cy d dx dy fill fillOpacity fontFamily fontSize fx fy gradientTransform gradientUnits markerEnd markerMid markerStart offset opacity patternContentUnits patternUnits points preserveAspectRatio r rx ry spreadMethod stopColor stopOpacity stroke strokeDasharray strokeLinecap strokeOpacity strokeWidth textAnchor transform version viewBox x1 x2 x y1 y2 y";

function TagCache(root,value,o){
	if(o === undefined) o = {};
	this._options = o;
	this._root = root;
	this._value = value;
	this._counter = 0;
	this._index = 0;
	this._blocks = 1;
	this._refs = [];
};

subclass$(TagCache,Node);
exports.TagCache = TagCache; // export class 
TagCache.prototype.nextRef = function (node){
	var item = new TagCacheKey(this,node);
	this._refs.push(item);
	return item;
};

TagCache.prototype.nextValue = function (){
	var ref = AST.counterToShortRef(this._counter++);
	return this.option('lowercase') ? ref.toLowerCase() : ref;
};

TagCache.prototype.nextSlot = function (){
	this._index++;
	if (this._options.keys) {
		return new Str("'" + AST.counterToShortRef(this._index - 1) + "'");
	} else {
		return new Num(this._index - 1);
	};
};

TagCache.prototype.nextBlock = function (){
	this._blocks++;
	return new Num(this._blocks - 1);
};

TagCache.prototype.c = function (){
	return ("" + (this._value.c()));
};

function TagCacheKey(cache,node){
	this._owner = cache;
	this._value = cache.nextSlot();
	this._node = node;
	this._type = null;
	this;
};

subclass$(TagCacheKey,Node);
exports.TagCacheKey = TagCacheKey; // export class 
TagCacheKey.prototype.node = function(v){ return this._node; }
TagCacheKey.prototype.setNode = function(v){ this._node = v; return this; };
TagCacheKey.prototype.value = function(v){ return this._value; }
TagCacheKey.prototype.setValue = function(v){ this._value = v; return this; };

TagCacheKey.prototype.cache = function (){
	return this;
};

TagCacheKey.prototype.c = function (){
	this._value || (this._value = this._owner.nextSlot());
	return this._value;
};

TagCacheKey.prototype.arg = function (){
	return this._arg || (this._arg = OP('||',OP('.',this._owner,this._value),CALL(OP('.',this._owner,'$' + this._type),[])));
};


function TagPart(value,owner){
	this._name = value;
	this._tag = owner;
	this._chain = [];
	this._special = false;
	this;
};

subclass$(TagPart,Node);
exports.TagPart = TagPart; // export class 
TagPart.prototype.name = function(v){ return this._name; }
TagPart.prototype.setName = function(v){ this._name = v; return this; };
TagPart.prototype.value = function(v){ return this._value; }
TagPart.prototype.setValue = function(v){ this._value = v; return this; };

TagPart.prototype.isSpecial = function (){
	return this._special;
};

TagPart.prototype.visit = function (){
	this._chain.map(function(v) { return v.traverse(); });
	if (this._value) { this._value.traverse() };
	if (this._name.traverse) { this._name.traverse() };
	return this;
};

TagPart.prototype.quoted = function (){
	return this._quoted || (this._quoted = helpers.singlequote(this._name));
};

TagPart.prototype.isStatic = function (){
	return !(this.value()) || this.value().isPrimitive();
};

TagPart.prototype.add = function (item,type){
	if (type == TagArgList) {
		this._last.setParams(item);
	} else {
		this._chain.push(this._last = new TagModifier(item));
	};
	return this;
};

TagPart.prototype.js = function (){
	return "";
};

function TagId(){ return TagPart.apply(this,arguments) };

subclass$(TagId,TagPart);
exports.TagId = TagId; // export class 
TagId.prototype.js = function (){
	return ("set('id'," + this.quoted() + ")");
};

function TagFlag(){ return TagPart.apply(this,arguments) };

subclass$(TagFlag,TagPart);
exports.TagFlag = TagFlag; // export class 
TagFlag.prototype.js = function (){
	return this.value() ? (("flagIf(" + this.quoted() + "," + (this.value().c()) + ")")) : (("flag(" + this.quoted() + ")"));
};

function TagFlagExpr(){ return TagFlag.apply(this,arguments) };

subclass$(TagFlagExpr,TagFlag);
exports.TagFlagExpr = TagFlagExpr; // export class 
TagFlagExpr.prototype.slot = function (){
	return (this._slot == null) ? (this._slot = this._tag.nextSlot('flag')) : this._slot;
};

TagFlagExpr.prototype.visit = function (){
	return this._name.traverse();
};

TagFlagExpr.prototype.isStatic = function (){
	return !this._name || this._name.isPrimitive();
};

TagFlagExpr.prototype.js = function (){
	return ("setFlag(" + this.slot() + "," + (this.name().c()) + ")");
};

function TagSep(){ return TagPart.apply(this,arguments) };

subclass$(TagSep,TagPart);
exports.TagSep = TagSep; // export class 


function TagArgList(){ return TagPart.apply(this,arguments) };

subclass$(TagArgList,TagPart);
exports.TagArgList = TagArgList; // export class 


function TagAttr(){ return TagPart.apply(this,arguments) };

subclass$(TagAttr,TagPart);
exports.TagAttr = TagAttr; // export class 
TagAttr.prototype.isSpecial = function (){
	return String(this._name) == 'value';
};

TagAttr.prototype.js = function (){
	var ns = null;
	var key = String(this._name);
	var i = key.indexOf(':');
	
	if (i >= 0) {
		ns = key.slice(0,i);
		key = key.slice(i + 1);
	};
	
	var dyn = this._chain.length || this._tag.type()._ns;
	var val = this.value() ? this.value().js() : this.quoted();
	var add = '';
	
	if (this._chain.length) {
		add = ',{' + this._chain.map(function(mod) { return ("" + (mod.name()) + ":1"); }).join(',') + '}';
	};
	
	if (key == 'value' && !ns) {
		add += ',1';
	};
	
	if (ns == 'css') {
		return ("css('" + key + "'," + val + add + ")");
	} else if (ns) {
		// should be setPath instead?
		return ("setNestedAttr('" + ns + "','" + key + "'," + val + add + ")");
	} else if (key.indexOf("data-") == 0) {
		return ("dataset('" + key.slice(5) + "'," + val + ")");
	} else if (key.indexOf("aria-") == 0) {
		return ("set(" + this.quoted() + "," + val + add + ")");
	} else if (dyn || true) {
		return ("set(" + this.quoted() + "," + val + add + ")");
	} else {
		return ("" + helpers.setterSym(this.name()) + "(" + val + add + ")");
	};
};

function TagAttrValue(){ return TagPart.apply(this,arguments) };

subclass$(TagAttrValue,TagPart);
exports.TagAttrValue = TagAttrValue; // export class 
TagAttrValue.prototype.isPrimitive = function (){
	return this.value().isPrimitive();
};

TagAttrValue.prototype.value = function (){
	return this.name();
};

TagAttrValue.prototype.js = function (){
	return this.value().c();
};

function TagHandlerSpecialArg(){ return ValueNode.apply(this,arguments) };

subclass$(TagHandlerSpecialArg,ValueNode);
exports.TagHandlerSpecialArg = TagHandlerSpecialArg; // export class 
TagHandlerSpecialArg.prototype.isPrimitive = function (){
	return true;
};

TagHandlerSpecialArg.prototype.c = function (){
	return ("'~" + this.value() + "'");
};

function TagModifier(){ return TagPart.apply(this,arguments) };

subclass$(TagModifier,TagPart);
exports.TagModifier = TagModifier; // export class 
TagModifier.prototype.params = function(v){ return this._params; }
TagModifier.prototype.setParams = function(v){ this._params = v; return this; };

TagModifier.prototype.isPrimitive = function (){
	return !(this.params()) || this.params().every(function(param) { return param.isPrimitive(); });
};

TagModifier.prototype.visit = function (){
	if (this._params) { this._params.traverse() };
	
	for (var i = 0, items = iter$(this._params), len = items.length, param; i < len; i++) {
		param = items[i];
		if (!((param instanceof VarOrAccess))) { continue; };
		if (param.value() instanceof GlobalVarAccess) {
			var special = new TagHandlerSpecialArg(param.value().c());
			this._params.swap(param,special);
		};
	};
	return this;
};

TagModifier.prototype.js = function (){
	if (this.params() && this.params().count() > 0) {
		return ("[" + this.quoted() + "," + (this.params().c()) + "]");
	} else if (this.params()) {
		return ("[" + this.quoted() + "]");
	} else {
		return this.quoted();
	};
};

function TagData(){ return TagPart.apply(this,arguments) };

subclass$(TagData,TagPart);
exports.TagData = TagData; // export class 
TagData.prototype.value = function (){
	return this.name();
};

TagData.prototype.isStatic = function (){
	return !(this.value()) || this.value().isPrimitive();
};

TagData.prototype.isSpecial = function (){
	return true;
};

TagData.prototype.js = function (){
	var val = this.value();
	
	if (val instanceof ArgList) {
		val = val.values()[0];
	};
	
	if (val instanceof Parens) {
		val = val.value();
	};
	
	if (val instanceof VarOrAccess) {
		val = val._variable || val.value();
	};
	// console.log "TagData value {val}"
	
	if (val instanceof Access) {
		var left = val.left();
		var right = (val.right() instanceof Index) ? val.right().value() : val.right();
		
		if (val instanceof IvarAccess) {
			left || (left = val.scope__().context());
		};
		
		var pars = [left.c(),right.c()];
		
		if (right instanceof Identifier) {
			pars[1] = "'" + pars[1] + "'";
		};
		
		return ("bindData(" + pars.join(',') + ")");
	} else {
		return ("data=(" + (val.c()) + ")");
	};
};

function TagHandler(){ return TagPart.apply(this,arguments) };

subclass$(TagHandler,TagPart);
exports.TagHandler = TagHandler; // export class 
TagHandler.prototype.slot = function (){
	return (this._slot == null) ? (this._slot = this._tag.nextSlot('handler')) : this._slot;
};

TagHandler.prototype.isStatic = function (){
	var valStatic = !(this.value()) || this.value().isPrimitive() || ((this.value() instanceof Func) && !this.value().nonlocals());
	return valStatic && this._chain.every(function(item) {
		var val = (item instanceof Parens) ? item.value() : item;
		return (val instanceof Func) ? (!val.nonlocals()) : val.isPrimitive();
	});
};

TagHandler.prototype.add = function (item,type){
	if (type == TagArgList) {
		// could be dynamic
		this._last.setParams(item || new ListNode([]));
		// unless @last.isPrimitive
		// 	@dyn ||= []
		// 	@dyn.push(@chain:length)
	} else if (type == TagAttrValue) {
		// really?
		if (item instanceof Parens) {
			item = item.value();
		};
		
		this.setValue(item);
		// value.@isStatic = value.isPrimitive or (value isa Func and !value.nonlocals)
		// console.log "push Value to chain {item} {item.isPrimitive}"
		// @chain.push(item)
		this._last = null;
	} else {
		// console.log "TagHandler add",item
		this._chain.push(this._last = new TagModifier(item));
	};
	return this;
};

TagHandler.prototype.js = function (o){
	var parts = [this.quoted()].concat(this._chain);
	if (this.value()) { parts.push(this.value()) };
	// if !value.isPrimitive and !(value isa Func and !value.nonlocals)
	// 	@dyn ||= []
	// 	@dyn.push(parts:length)
	// find the context
	
	return ("on$(" + this.slot() + ",[" + AST.cary(parts) + "]," + (this.scope__().context().c()) + ")");
	
	//		let dl = @dyn and @dyn:length
	//
	//		if dl == 1
	//			"on$({slot},[{AST.cary(parts)}],{@dyn[0]})"
	//		elif dl > 1
	//			"on$({slot},[{AST.cary(parts)}],-1)"
	//		else
	//			"on$({slot},[{AST.cary(parts)}],0)"
};

function Tag(o){
	if(o === undefined) o = {};
	this._traversed = false;
	this._options = o;
	this._reference = null;
	this._attributes = o.attributes || [];
	this._attrmap = {};
	this._children = [];
	this._slots = {
		flag: this.isSelf() ? (-1) : 0,
		handler: this.isSelf() ? (-1) : 0
	};
	this;
};

subclass$(Tag,Node);
exports.Tag = Tag; // export class 
Tag.prototype.tree = function(v){ return this._tree; }
Tag.prototype.setTree = function(v){ this._tree = v; return this; };

Tag.prototype.nextSlot = function (type){
	var slot = this._slots[type];
	this._slots[type] += (this.isSelf() ? (-1) : 1);
	return slot;
};

Tag.prototype.addPart = function (part,type){
	var curr = this._attributes.CURRENT;
	
	if (type == TagId) {
		this.set({id: part});
	};
	
	if (type == TagSep) {
		this._attributes.CURRENT = null;
	} else if (curr instanceof TagHandler) {
		curr.add(part,type);
	} else if (type == TagAttrValue) {
		if (curr) {
			curr.setValue(new type(part,this._self));
		};
	} else if (curr instanceof TagAttr) {
		curr.add(part,type);
	} else {
		this._attributes.push(this._attributes.CURRENT = new type(part,this));
		
		if (type == TagAttr) {
			this._attrmap[String(part)] = this._attributes.CURRENT;
		};
	};
	return this;
};

Tag.prototype.addChild = function (child){
	this._children.push(child);
	return this;
};

Tag.prototype.enclosing = function (){
	return this._options.close && this._options.close.value();
};

Tag.prototype.type = function (){
	return this._options.type || 'div';
};

Tag.prototype.parent = function (){
	return this._options.par;
};

Tag.prototype.isSelf = function (){
	return (this.type() instanceof Self) || (this.type() instanceof This);
};

Tag.prototype.isNative = function (){
	return (this.type() instanceof TagTypeIdentifier) && this.type().isSimpleNative();
};

Tag.prototype.isStatic = function (){
	var o = this._options;
	return !o.hasConditionals && !o.hasLoops && !o.ivar && !o.key;
};

Tag.prototype.visit = function (stack){
	
	var o = this._options;
	var scope = this._tagScope = this.scope__();
	var prevTag = o.par = stack._tag;
	var po = prevTag && prevTag._options;
	var typ = this.enclosing();
	
	this._level = stack._nodes.filter(function(el) { return el instanceof Tag; }).length;
	this._tempvar = scope.closure().temporary(this,{reuse: true},("_t" + (this._level)));
	this._valvar = scope.closure().temporary(this,{reuse: true},"_v");
	
	if (o.par) {
		o.optim = po.optim;
	} else if (o.template) {
		o.optim = false;
	} else {
		o.optim = this;
	};
	
	if (typ == '->' || typ == '=>') {
		var body = Block.wrap(o.body._nodes || [o.body]);
		this._fragment = o.body = o.template = new TagFragmentFunc([],body,null,null,{closed: typ == '->'});
		// could insert generated <self> inside to simplify and optimize this?
		// template uses wrong cache as well
		this._tagScope = this._fragment.scope();
		o.optim = this;
	};
	
	if (o.par) {
		o.par.addChild(this);
		
		if (o.par._tagLoop) {
			o.loop || (o.loop = o.par._tagLoop); // scope.@tagLoop
			o.loop.capture(this);
			o.ownCache = true;
			o.optim = this;
		};
		
		if (po.template) {
			o.optim = this;
		};
	};
	
	if (o.key && !o.par) {
		o.treeRef = o.key;
		o.key.cache();
	};
	
	stack._tag = null;
	
	for (var i = 0, items = iter$(this._attributes), len = items.length; i < len; i++) {
		items[i].traverse();
	};
	
	stack._tag = this;
	
	this.cacheRef();
	
	if (o.key) { o.key.traverse() };
	if (o.body) { o.body.traverse() };
	
	// see if we are dynamic
	if ((o.body instanceof ListNode) && stack.optlevel() > 1) { // and stack.env('TAG_OPTIM')
		var canOptimize = o.body.values().every(function(item) {
			return (item instanceof Tag) && item.isStatic();
		});
		
		if (o.canOptimize = canOptimize) {
			o.optim = this;
		};
		// should not happen to items inside the loop
		// optimizations should be gone over at the very end.
		// for all tags connected to this?
		for (var j = 0, ary = iter$(this._children), len_ = ary.length, child; j < len_; j++) {
			child = ary[j];
			var co = child._options;
			if (o.hasConditionals && co.optim) {
				// console.log "optim child special?"
				co.optim = child;
			} else if (!co.loop) {
				co.optim = this;
			};
		};
	};
	
	if (stack.optlevel() < 2) {
		o.optim = false;
	};
	stack._tag = prevTag;
	return this;
};

Tag.prototype.reference = function (){
	return this._reference || (this._reference = this._tagScope.closure().temporary(this,{pool: 'tag'}).resolve());
};

Tag.prototype.tagfactory = function (){
	return this.scope__().imbaRef('createElementFactory(/*SCOPEID*/)');
};

// reference to the cache-object this tag will try to register with
Tag.prototype.cacher = function (){
	var op;
	var o = this._options;
	return (o.cacher == null) ? (o.cacher = this.parent() ? (
		this.parent().childCacher()
	) : ((o.ivar || o.key) ? (
		op = OP('||=',OP('.',new This(),'$$'),LIT('{}')),
		// MAKE SURE WE REFER TO THE OUTER
		new TagCache(this,this._tagScope.closure().declare("$",op,{system: true,type: 'let'}))
	) : (
		null
	))) : o.cacher;
};

Tag.prototype.childCacher = function (){
	var scop, scop1, op, meth, key, ctor;
	return this._options.childCacher || (this._options.childCacher = this._fragment ? (
		scop = this._tagScope.closure(),
		// TagCache.new(self,@tagScope.closure.declare("$",op,system: yes))
		new TagCache(this,scop.declare("$",OP('.',new This(),'$'),{system: true}))
	) : (this.isSelf() ? (
		scop1 = this._tagScope.closure(),
		op = OP('.',new This(),'$'),
		// let nr = scop.incr('selfTag')
		meth = (scop1 instanceof MethodScope) ? scop1.node().name() : '',
		// let key = "${nr}"
		(meth && meth != 'render') && (
			key = '$' + meth + '$',
			ctor = this.scope__().imbaRef('createTagCache'),
			op = OP('||=',OP('.',op,key),CALL(ctor,[new This()]))
		),
		
		scop1._tagCache || (scop1._tagCache = new TagCache(this,scop1.declare("$",op,{system: true})))
	) : ((!(this.parent()) || this._options.ownCache) ? (
		// difference between this and cacher?
		new TagCache(this,OP('.',this.reference(),'$'),{keys: true}) // .set(keys: yes)
	) : (
		this.parent().childCacher()
	))));
};

Tag.prototype.cacheRef = function (){
	if (this.isSelf() || !(this.cacher())) {
		return null;
	};
	
	var o = this._options;
	
	if (o.treeRef) {
		return o.treeRef;
	};
	
	if (o.par) {
		o.par.cacheRef();
	};
	
	if (o.ivar) {
		return o.treeRef = new Str("'" + o.ivar.c() + "'"); // OP('.',scope.context,o:ivar)
	};
	
	// cacher.nextRef(self) # 
	return o.treeRef = this.cacher().nextRef(this);
};

Tag.prototype.generateCacheSlot = function (){
	var v = this.childCacher().nextValue();
	return ("" + (this.childCacher().c()) + "." + v);
};

Tag.prototype.cachePath = function (){
	var o = this._options;
	return (o.cachePath == null) ? (o.cachePath = o.ivar ? (
		OP('.',this._tagScope.context(),o.ivar)
	) : (this.cacheRef() && (
		OP('.',this.cacher(),this.cacheRef()._value || this.cacheRef())
	))) : o.cachePath;
	
	// var ref = cacheRef
};

Tag.prototype.js = function (jso){
	var o = this._options;
	var po = o.par ? o.par._options : {};
	var scope = this.scope__();
	var calls = [];
	var statics = [];
	
	var parent = o.par; // self.parent
	var content = o.body;
	var bodySetter = this.isSelf() ? "setChildren" : "setContent";
	
	var contentType = 0;
	var parentType = parent && parent.option('treeType');
	
	var out = "";
	var ctor = "";
	var pre = "";
	var typ = this.isSelf() ? "self" : ((this.type().isClass() ? this.type().name() : ("'" + this.type()._value + "'")));
	
	var tvar = this._tempvar.c();
	var vvar = this._valvar.c();
	
	if (this.isSelf()) {
		var closure = scope.closure();
		this._reference = scope.context();
		out = scope.context().c();
		var nr = closure.incr('selfTag');
		var meth = (closure instanceof MethodScope) ? closure.node().name() : '';
		var key = new Num(nr);
		if (meth && meth != 'render') {
			key = new Str("'" + meth + nr + "'");
		};
		
		statics.push(("" + tvar + ".$open(" + (key.c()) + ")"));
		calls = statics;
		// not always?
	} else {
		var cacher = this.cacher();
		var ref = this.cacheRef();
		var pars = [typ];
		var varRef = null;
		var path = this.cachePath();
		
		if (o.ivar) {
			o.path = path.c(); // OP('.',scope.context,o:ivar).c
			pre = o.path + ' = ' + o.path + '||';
		} else if (ref) {
			o.path = path.c(); // OP('.',cacher,ref.@value or ref).c
			
			// if we have a dynamic key we need to change the path
			if (o.key && !o.loop) {
				o.cachePath = scope.temporary(this,{});
				var str = ("'" + (ref._value) + "$'");
				o.path = OP('.',cacher,OP('=',o.cachePath,OP('+',new Str(str),o.key))).c();
				ref = o.cacheRef = o.cachePath;
			};
			
			// o:path = "{cacher.c}[{ref.c}]"
			if (!o.optim || o.optim == this || parentType != 2 || len$(parent._children) == 1) {
				pre = ("" + (o.path) + " || ");
			};
			
			if (o.key && !o.loop) {
				o.path = o.cachePath.c();
			};
		};
		
		if (o.ivar) {
			pars.push(parent ? parent.reference().c() : scope.context().c());
			var flag = String(o.ivar._value).substr(1);
			statics.push(("" + tvar + ".flag('" + flag + "')"));
		} else if (cacher) {
			pars.push(cacher.c());
			if (ref) { pars.push(ref.c()) };
			if (parent && parent._reference) {
				pars.push(varRef = parent.reference().c());
			} else if (parent && po.ivar) {
				pars.push(po.path);
			} else if (parent && parent.cacher() == cacher) {
				pars.push(parent.cacheRef().c());
			} else if (parent) {
				pars.push(parent.reference().c());
			} else if (o.ivar || (o.key && !o.loop)) {
				pars.push(scope.context().c());
			};
		};
		
		ctor = ("" + (this.tagfactory().c()) + "(" + pars.join(',') + ")");
	};
	
	if (o.body instanceof Func) {
		bodySetter = "setTemplate";
	} else if (o.body instanceof ArgList) {
		var children = o.body.values();
		
		if (len$(children) == 1) {
			contentType = 3;
			var body1 = children[0];
			if (body1.isString()) {
				content = body1;
				content._noparen = true;
				bodySetter = "setText";
				contentType = 6;
			} else if (body1 instanceof TagLoopFunc) {
				contentType = body1.option('treeType') || 3;
			} else if ((body1 instanceof Tag) && !body1.option('key')) {
				// single tag which is always the same should default to 2
				// never needs to be set
				contentType = 2;
			};
		} else {
			contentType = children.every(function(item) {
				return ((item instanceof Tag) && !item.option('key')) || item.option('treeType') == 2 || item.isPrimitive();
			}) ? 2 : 1;
			content = new TagTree(this,o.body);
		};
	};
	
	this.set({treeType: contentType});
	
	// dont compile these just yet
	for (var i = 0, items = iter$(this._attributes), len = items.length, part; i < len; i++) {
		part = items[i];
		if (part.isStatic() || (part instanceof TagData)) {
			var out1 = part.js(jso);
			out1 = ("" + tvar + "." + AST.mark(part.name())) + out1;
			statics.push(out1);
		} else {
			var val = part.value();
			var out2 = ("" + this._valvar.c() + "=" + val.c());
			var cachekey = this.generateCacheSlot(); // "{tvar}.$.v{i}"
			part.setValue(OP('=',LIT(cachekey),this._valvar));
			out2 = out2 + ("," + vvar + "===" + cachekey + " || " + tvar + ".") + part.js(jso);
			// out = ".{AST.mark(part.name)}" + out
			calls.push(out2);
		};
	};
	
	var body = content && content.c({expression: true});
	
	if (body) {
		var optim = o.optim && contentType == 2;
		var target = optim ? statics : calls;
		
		// cache the body setter itself
		if (this.isSelf() && optim && (content instanceof TagTree)) {
			var k = this.childCacher().c();
			// can skip body-type as well
			// body = "{k}.$ = {body}"
			target.push(("" + k + ".$ || " + tvar + ".setChildren(" + k + ".$=" + body + "," + contentType + ")"));
		} else if (bodySetter == 'setText') {
			if (content instanceof Str) {
				statics.push(("" + tvar + ".setText(" + body + ")"));
			} else {
				var k1 = this.generateCacheSlot();
				calls.push(("" + vvar + "=(" + body + ")," + vvar + "===" + k1 + "||" + tvar + ".setText(" + k1 + "=" + vvar + ")"));
			};
		} else if (bodySetter == 'setTemplate') {
			if (o.body.nonlocals()) {
				target.push(("" + tvar + ".setTemplate(" + body + ")"));
			} else {
				statics.push(("" + tvar + ".setTemplate(" + body + ")"));
			};
		} else if (o.optim && contentType == 3) {
			var k2 = this.generateCacheSlot();
			target.push(("" + vvar + "=(" + body + ")," + vvar + "===" + k2 + "||" + tvar + "." + bodySetter + "(" + k2 + "=" + vvar + "," + contentType + ")"));
		} else {
			target.push(("" + tvar + "." + bodySetter + "(" + body + "," + contentType + ")"));
		};
	};
	
	var shouldEnd = !(this.isNative()) || o.template || calls.length > 0;
	var hasAttrs = Object.keys(this._attrmap).length;
	
	if (hasAttrs) {
		shouldEnd = true;
	};
	
	// @children:length
	if (shouldEnd || this._children.length) {
		
		var commits = [];
		
		for (var i1 = 0, ary = iter$(this._children), len_ = ary.length; i1 < len_; i1++) {
			var c = ary[i1].option('commit');
			if (c instanceof Array) {
				commits.push.apply(commits,c);
			} else if (c) {
				commits.push(c);
			};
		};
		
		var patches = INDENT.wrap(commits.join(',\n'));
		var args = (o.optim && commits.length) ? ('(' + patches + ',true)') : '';
		
		// if optim == self we need to fix
		if (!shouldEnd && o.optim && o.optim != this) {
			this.set({commit: len$(commits) ? commits : ''});
		} else {
			if ((len$(commits) && o.optim) || !(this.isNative()) || hasAttrs || o.template) {
				calls.push(("" + tvar + "." + (this.isSelf() ? "synced" : "end") + "(" + args + ")"));
			};
		};
	};
	
	
	
	if (this._reference && !(this.isSelf())) {
		out = ("" + (this.reference().c()) + " = " + pre + "(" + (this.reference().c()) + "=" + ctor + ")");
	} else {
		out || (out = ("" + pre + ctor));
	};
	
	if (statics.length) {
		// out = out + statics.join("")
		// To drop chaining params
		out = ("(" + tvar + " = " + out + "," + statics.join(",") + "," + tvar + ")");
	};
	
	if (calls != statics) {
		if (o.optim && o.optim != this) {
			// let commit = "{o:path}{calls.join("")}"
			var commit = ("(" + tvar + "=" + (o.path) + ",\n" + calls.join(",\n") + ",\n" + tvar + ")");
			if (calls.length && o.commit == undefined) { this.set({commit: commit}) };
		} else {
			// out = "({out},{tvar}{calls.join(",{tvar}")},{tvar})"
			out = ("(" + tvar + " = (" + out + "),\n") + calls.join(",\n") + (",\n" + tvar + ")");
		};
	};
	
	if (this._typeNum) {
		this._typeNum.setValue(contentType);
	};
	
	this.set({treeType: contentType});
	
	return out;
};

// This is a helper-node
// Should probably use the same type of listnode everywhere
// and simply flag the type as TagTree instead
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
TagTree.prototype.counter = function(v){ return this._counter; }
TagTree.prototype.setCounter = function(v){ this._counter = v; return this; };
TagTree.prototype.conditions = function(v){ return this._conditions; }
TagTree.prototype.setConditions = function(v){ this._conditions = v; return this; };
TagTree.prototype.blocks = function(v){ return this._blocks; }
TagTree.prototype.setBlocks = function(v){ this._blocks = v; return this; };
TagTree.prototype.cacher = function(v){ return this._cacher; }
TagTree.prototype.setCacher = function(v){ this._cacher = v; return this; };

TagTree.prototype.parent = function (){
	return this._parent || (this._parent = this._owner.parent());
};

TagTree.prototype.load = function (list){
	if (list instanceof ListNode) {
		this._indentation || (this._indentation = list._indentation); // if list.count > 1
		return list.nodes();
	} else {
		return AST.compact((list instanceof Array) ? list : [list]);
	};
};

TagTree.prototype.root = function (){
	return this.option('root');
};

TagTree.prototype.resolve = function (){
	var self = this;
	self.remap(function(c) { return c.consume(self); });
	return self;
};

TagTree.prototype.static = function (){
	// every real node
	return (this._static == null) ? (this._static = this.every(function(c) { return (c instanceof Tag) || (c instanceof Str) || (c instanceof Meta); })) : this._static;
};

TagTree.prototype.single = function (){
	return (this._single == null) ? (this._single = ((this.realCount() == 1) ? this.last() : false)) : this._single;
};

TagTree.prototype.hasTags = function (){
	return this.some(function(c) { return c instanceof Tag; });
};

TagTree.prototype.c = function (o){
	var single = this.single();
	// no indentation if this should return
	if (single && (STACK.current() instanceof Return)) {
		this._indentation = null;
	};
	
	var out = TagTree.prototype.__super__.c.call(this,o);
	
	if (!single || (single instanceof If)) {
		return ("[" + out + "]");
	} else {
		return out;
	};
};

function TagWrapper(){ return ValueNode.apply(this,arguments) };

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
	return ("" + (this.scope__().imba().c()) + ".getTagForDom(" + this.value().c({expression: true}) + ")");
};


// SELECTORS


function Selector(list,options){
	this._nodes = list || [];
	this._options = options;
};

subclass$(Selector,ListNode);
exports.Selector = Selector; // export class 
Selector.prototype.add = function (part,typ){
	this.push(part);
	return this;
};

Selector.prototype.group = function (){
	// for now we simply add a comma
	// how would this work for dst?
	this._nodes.push(new SelectorGroup(","));
	return this;
};

Selector.prototype.visit = function (){
	console.warn(("" + (STACK.sourcePath()) + ": " + this.option('type') + " selectors deprecated"));
	return Selector.prototype.__super__.visit.apply(this,arguments);
};

Selector.prototype.query = function (){
	var str = "";
	var ary = [];
	
	for (var i = 0, items = iter$(this.nodes()), len = items.length; i < len; i++) {
		var val = items[i].c();
		if ((typeof val=='string'||val instanceof String)) {
			str = ("" + str + val);
		};
	};
	
	return ("'" + str + "'");
};


Selector.prototype.js = function (o){
	var typ = this.option('type');
	var q = AST.c(this.query());
	var imba = this.scope__().imba().c();
	
	if (typ == '%') {
		return ("" + imba + ".q$(" + q + "," + o.scope().context().c({explicit: true}) + ")"); // explicit context
	} else if (typ == '%%') {
		return ("" + imba + ".q$$(" + q + "," + o.scope().context().c({explicit: true}) + ")");
	} else {
		return ("" + imba + ".q" + typ + "(" + q + ")");
	};
	
	// return "{typ} {scoped} - {all}"
};


function SelectorPart(){ return ValueNode.apply(this,arguments) };

subclass$(SelectorPart,ValueNode);
exports.SelectorPart = SelectorPart; // export class 
SelectorPart.prototype.c = function (){
	return AST.c(this._value);
};

function SelectorGroup(){ return SelectorPart.apply(this,arguments) };

subclass$(SelectorGroup,SelectorPart);
exports.SelectorGroup = SelectorGroup; // export class 
SelectorGroup.prototype.c = function (){
	return ",";
};

function SelectorType(){ return SelectorPart.apply(this,arguments) };

subclass$(SelectorType,SelectorPart);
exports.SelectorType = SelectorType; // export class 
SelectorType.prototype.c = function (){
	var name = this.value().name();
	
	// at least be very conservative about which tags we
	// can drop the tag for?
	// out in TAG_TYPES.HTML ?
	return (idx$(name,TAG_TYPES.HTML) >= 0) ? name : this.value().sel();
};


function SelectorUniversal(){ return SelectorPart.apply(this,arguments) };

subclass$(SelectorUniversal,SelectorPart);
exports.SelectorUniversal = SelectorUniversal; // export class 


function SelectorNamespace(){ return SelectorPart.apply(this,arguments) };

subclass$(SelectorNamespace,SelectorPart);
exports.SelectorNamespace = SelectorNamespace; // export class 


function SelectorClass(){ return SelectorPart.apply(this,arguments) };

subclass$(SelectorClass,SelectorPart);
exports.SelectorClass = SelectorClass; // export class 
SelectorClass.prototype.c = function (){
	if (this._value instanceof Node) {
		return (".'+" + (this._value.c()) + "+'");
	} else {
		return ("." + AST.c(this._value));
	};
};

function SelectorId(){ return SelectorPart.apply(this,arguments) };

subclass$(SelectorId,SelectorPart);
exports.SelectorId = SelectorId; // export class 
SelectorId.prototype.c = function (){
	if (this._value instanceof Node) {
		return ("#'+" + (this._value.c()) + "+'");
	} else {
		return ("#" + AST.c(this._value));
	};
};

function SelectorCombinator(){ return SelectorPart.apply(this,arguments) };

subclass$(SelectorCombinator,SelectorPart);
exports.SelectorCombinator = SelectorCombinator; // export class 
SelectorCombinator.prototype.c = function (){
	return ("" + AST.c(this._value));
};

function SelectorPseudoClass(){ return SelectorPart.apply(this,arguments) };

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
		return ("[" + (this._left.c()) + (this._op) + (this._right.c()) + "]");
	} else if (this._right) {
		// this is not at all good
		return ("[" + (this._left.c()) + (this._op) + "\"'+" + AST.c(this._right) + "+'\"]");
	} else {
		return ("[" + (this._left.c()) + "]");
		
		// ...
	};
};




// DEFER

function Await(){ return ValueNode.apply(this,arguments) };

subclass$(Await,ValueNode);
exports.Await = Await; // export class 
Await.prototype.func = function(v){ return this._func; }
Await.prototype.setFunc = function(v){ this._func = v; return this; };

Await.prototype.js = function (o){
	if (this.option('native')) { return ("await " + (this.value().c())) };
	// introduce a util here, no?
	return CALL(OP('.',new Util.Promisify([this.value()]),'then'),[this.func()]).c();
};

Await.prototype.visit = function (o){
	// things are now traversed in a somewhat chaotic order. Need to tighten
	// Create await function - push this value up to block, take the outer
	var self = this;
	self.value().traverse();
	
	var fnscope = o.up(Func); // do |item| item isa MethodDeclaration or item isa Fun
	
	if (!o.es5()) {
		if (fnscope) {
			self.set({native: true});
			fnscope.set({async: true});
			return self;
		} else {
			// add warning
			// should add as diagnostics - no?
			self.warn("toplevel await not allowed");
		};
	};
	
	var block = o.up(Block); // or up to the closest FUNCTION?
	var outer = o.relative(block,1);
	var par = o.relative(self,-1);
	
	self.setFunc(new AsyncFunc([],[]));
	// now we move this node up to the block
	self.func().body().setNodes(block.defers(outer,self));
	self.func().scope().visit();
	
	// if the outer is a var-assignment, we can simply set the params
	if (par instanceof Assign) {
		par.left().traverse();
		var lft = par.left().node();
		// Can be a tuple as well, no?
		if (lft instanceof VarReference) {
			// the param is already registered?
			// should not force the name already??
			// beware of bugs
			self.func().params().at(0,true,lft.variable().name());
		} else if (lft instanceof Tuple) {
			// if this an unfancy tuple, with only vars
			// we can just use arguments
			
			if ((par.type() == 'var' || par.type() == 'let') && !lft.hasSplat()) {
				lft.map(function(el,i) {
					return self.func().params().at(i,true,el.value());
				});
			} else {
				// otherwise, do the whole tuple
				// make sure it is a var assignment?
				par.setRight(ARGUMENTS);
				self.func().body().unshift(par);
				self.func().scope().context();
			};
		} else {
			// regular setters
			par.setRight(self.func().params().at(0,true));
			self.func().body().unshift(par);
			self.func().scope().context();
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
	AsyncFunc.prototype.__super__.constructor.call(this,params,body,name,target,options);
};

subclass$(AsyncFunc,Func);
exports.AsyncFunc = AsyncFunc; // export class 
AsyncFunc.prototype.scopetype = function (){
	return LambdaScope;
};


// IMPORTS

function ImportStatement(imports,source,ns){
	this._traversed = false;
	this._imports = imports;
	this._source = source;
	this._ns = ns;
	
	if (imports && imports._type == 'IMPORTS') {
		this._imports = ImportStatement.parse(imports._value,imports._loc);
		// console.log "parsed imports",imports.@value,imports.@loc
	} else if (imports instanceof Array) {
		this._imports = imports.map(function(item) { return [item]; });
	};
	this;
};

subclass$(ImportStatement,Statement);
exports.ImportStatement = ImportStatement; // export class 
ImportStatement.prototype.ns = function(v){ return this._ns; }
ImportStatement.prototype.setNs = function(v){ this._ns = v; return this; };
ImportStatement.prototype.imports = function(v){ return this._imports; }
ImportStatement.prototype.setImports = function(v){ this._imports = v; return this; };
ImportStatement.prototype.source = function(v){ return this._source; }
ImportStatement.prototype.setSource = function(v){ this._source = v; return this; };

ImportStatement.parse = function (str,startPos){
	var ary;
	if(startPos === undefined) startPos = 0;
	var named = [];
	
	var pos = startPos;
	if (str[0] == '{') {
		pos += 1;
		str = str.slice(1,-1);
	};
	
	var parts = str.trim().split(","); // /\s*,\s*/
	
	
	
	var id = function(name,loc) {
		// slow
		if(loc === undefined) loc = 0;
		while (name[0] == ' '){
			loc++;
			name = name.substr(1);
		};
		name = name.trim();
		return new Identifier(new Token('IDENTIFIER',name,loc,name.length));
	};
	
	for (var i = 0, items = iter$(parts), len = items.length, part; i < len; i++) {
		part = items[i];
		var asIdx = part.indexOf(" as ");
		if (asIdx > 0) {
			var ary = iter$(part.split(" as "));var name = ary[0],value = ary[1];
			named.push([id(name,pos),id(value,pos + asIdx + 4)]);
		} else {
			named.push([id(part,pos)]);
		};
		pos += part.length + 1;
	};
	return named;
};


ImportStatement.prototype.visit = function (){
	if (this._ns) {
		this._nsvar || (this._nsvar = this.scope__().register(this._ns,this));
	} else {
		var src = this.source().c();
		var m = src.match(/(\w+)(\.js|imba)?[\"\']$/);
		this._alias = m ? (m[1] + '$') : 'mod$';
	};
	
	// should also register the imported items, no?
	if (this._imports) {
		var dec = this._declarations = new VariableDeclaration([]);
		
		if (this._imports.length == 1) {
			var extName = this._imports[0][0];
			this._alias = this._imports[0][1] || extName;
			dec.add(this._alias,OP('.',new Require(this.source()),extName)).setType('import');
			dec.traverse();
			return this;
		};
		
		// @declarations = VariableDeclaration.new([])
		this._moduledecl = dec.add(this._alias,new Require(this.source()));
		this._moduledecl.traverse();
		
		
		if (this._imports.length > 1) {
			for (var i = 0, items = iter$(this._imports), len = items.length, imp; i < len; i++) {
				imp = items[i];
				var name = imp[1] || imp[0];
				dec.add(name,OP('.',this._moduledecl.variable(),imp[0])).setType('import');
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
	
	var req = new Require(this.source());
	
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
		// create a require for the source, with a temporary name?
		var out = [req.cache({names: alias}).c()];
		
		for (var i = 0, items = iter$(this._imports), len = items.length, imp; i < len; i++) {
			// we also need to register these imports as variables, no?
			imp = items[i];
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

function ExportStatement(){ return ValueNode.apply(this,arguments) };

subclass$(ExportStatement,ValueNode);
exports.ExportStatement = ExportStatement; // export class 
ExportStatement.prototype.js = function (o){
	var nodes = this._value.map(function(arg) { return ("module.exports." + (arg.c()) + " = " + (arg.c())); });
	
	if (nodes.length > 1 && (this.up() instanceof Return)) {
		return '[' + nodes.join(',') + ']';
	} else {
		return nodes.join(';\n') + ';';
	};
};

function Export(){ return ValueNode.apply(this,arguments) };

subclass$(Export,ValueNode);
exports.Export = Export; // export class 
Export.prototype.addExpression = function (expr){
	this.setValue(this.value().addExpression(expr));
	return this;
};

Export.prototype.loc = function (){
	var kw = this.option('keyword');
	return (kw && kw.region) ? kw.region() : (Export.prototype.__super__.loc.apply(this,arguments));
};

Export.prototype.consume = function (node){
	if (node instanceof Return) {
		this.option('return',true);
		return this;
	};
	return Export.prototype.__super__.consume.apply(this,arguments);
};

Export.prototype.visit = function (){
	this.value().set({export: this,return: this.option('return'),'default': this.option('default')});
	return Export.prototype.__super__.visit.apply(this,arguments);
};

Export.prototype.js = function (o){
	// p "Export {value}"
	// value.set export: self, return: option(:return), default: option(:default)
	
	var self = this;
	if (self.value() instanceof VarOrAccess) {
		return ("exports." + (self.value().c()) + " = " + (self.value().c()) + ";");
	};
	
	if (self.value() instanceof ListNode) {
		self.value().map(function(item) { return item.set({export: self}); });
	};
	
	return self.value().c();
};

function Require(){ return ValueNode.apply(this,arguments) };

subclass$(Require,ValueNode);
exports.Require = Require; // export class 
Require.prototype.js = function (o){
	var out = (this.value() instanceof Parens) ? this.value().value().c() : this.value().c();
	return (out == 'require') ? 'require' : (("require(" + out + ")"));
};

function EnvFlag(){ return ValueNode.apply(this,arguments) };

subclass$(EnvFlag,ValueNode);
exports.EnvFlag = EnvFlag; // export class 
EnvFlag.prototype.raw = function (){
	return (this._raw == null) ? (this._raw = STACK.env("" + this._value)) : this._raw;
};

EnvFlag.prototype.isTruthy = function (){
	var val = this.raw();
	if (val !== undefined) { return !!val };
	return undefined;
};

EnvFlag.prototype.loc = function (){
	return [0,0];
};

EnvFlag.prototype.c = function (){
	var val = this.raw();
	if (val !== undefined) {
		if ((typeof val=='string'||val instanceof String)) {
			if (val.match(/^\d+(\.\d+)?$/)) {
				return parseFloat(val);
			} else {
				return ("'" + val + "'");
			};
		} else {
			return ("" + val);
		};
	} else {
		return ("ENV_" + (this._value));
	};
};


// UTILS

function Util(args){
	this._args = args;
};

// this is how we deal with it now
subclass$(Util,Node);
exports.Util = Util; // export class 
Util.prototype.args = function(v){ return this._args; }
Util.prototype.setArgs = function(v){ this._args = v; return this; };

Util.extend = function (a,b){
	return new Util.Extend([a,b]);
};

Util.callImba = function (scope,meth,args){
	return CALL(OP('.',scope.imba(),new Identifier(meth)),args);
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
	return CALL(OP('.',obj,slice),AST.compact([a,b]));
};

Util.iterable = function (obj,cache){
	var node = new Util.Iterable([obj]);
	if (cache) { node.cache({force: true,pool: 'iter'}) };
	return node;
};



Util.union = function (a,b){
	return new Util.Union([a,b]);
};

Util.intersect = function (a,b){
	return new Util.Intersect([a,b]);
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

Util.prototype.inlineHelpers = function (){
	return !!OPTS.inlineHelpers;
};

Util.prototype.js = function (o){
	return "helper";
};

// TODO Deprecate and remove
Util.Union = function Union(){ return Util.apply(this,arguments) };

subclass$(Util.Union,Util);
Util.Union.prototype.helper = function (){
	return 'function union$(a,b){\n	if(a && a.__union) return a.__union(b);\n\n	var u = a.slice(0);\n	for(var i=0,l=b.length;i<l;i++) if(u.indexOf(b[i]) == -1) u.push(b[i]);\n	return u;\n};\n';
};

Util.Union.prototype.js = function (o){
	this.scope__().root().helper(this,this.helper());
	// When this is triggered, we need to add it to the top of file?
	return ("union$(" + this.args().map(function(v) { return v.c(); }).join(',') + ")");
};

// TODO Deprecate and remove
Util.Intersect = function Intersect(){ return Util.apply(this,arguments) };

subclass$(Util.Intersect,Util);
Util.Intersect.prototype.helper = function (){
	return 'function intersect$(a,b){\n	if(a && a.__intersect) return a.__intersect(b);\n	var res = [];\n	for(var i=0, l=a.length; i<l; i++) {\n		var v = a[i];\n		if(b.indexOf(v) != -1) res.push(v);\n	}\n	return res;\n};\n';
};

Util.Intersect.prototype.js = function (o){
	// When this is triggered, we need to add it to the top of file?
	this.scope__().root().helper(this,this.helper());
	return ("intersect$(" + this.args().map(function(v) { return v.c(); }).join(',') + ")");
};

Util.Extend = function Extend(){ return Util.apply(this,arguments) };

subclass$(Util.Extend,Util);
Util.Extend.prototype.js = function (o){
	// When this is triggered, we need to add it to the top of file?
	return ("extend$(" + AST.compact(AST.cary(this.args())).join(',') + ")");
};

Util.IndexOf = function IndexOf(){ return Util.apply(this,arguments) };

subclass$(Util.IndexOf,Util);
Util.IndexOf.prototype.helper = function (){
	return 'function idx$(a,b){\n	return (b && b.indexOf) ? b.indexOf(a) : [].indexOf.call(a,b);\n};';
};

Util.IndexOf.prototype.js = function (o){
	if (this.inlineHelpers()) {
		this.scope__().root().helper(this,this.helper());
		// When this is triggered, we need to add it to the top of file?
		return ("idx$(" + this.args().map(function(v) { return v.c(); }).join(',') + ")");
	} else {
		return ("" + (this.scope__().imba().c()) + ".indexOf(" + this.args().map(function(v) { return v.c(); }).join(',') + ")");
	};
};

Util.Len = function Len(){ return Util.apply(this,arguments) };

subclass$(Util.Len,Util);
Util.Len.prototype.helper = function (){
	return 'function len$(a){\n	return a && (a.len instanceof Function ? a.len() : a.length) || 0;\n};';
};

Util.Len.prototype.js = function (o){
	// 
	if (true) { // isStandalone
		this.scope__().root().helper(this,this.helper());
		// When this is triggered, we need to add it to the top of file?
		return ("len$(" + this.args().map(function(v) { return v.c(); }).join(',') + ")");
	};
};


Util.Subclass = function Subclass(){ return Util.apply(this,arguments) };

subclass$(Util.Subclass,Util);
Util.Subclass.prototype.helper = function (){
	// should also check if it is a real promise
	return '// helper for subclassing\nfunction subclass$(obj,sup) {\n	for (var k in sup) {\n		if (sup.hasOwnProperty(k)) obj[k] = sup[k];\n	};\n	// obj.__super__ = sup;\n	obj.prototype = Object.create(sup.prototype);\n	obj.__super__ = obj.prototype.__super__ = sup.prototype;\n	obj.prototype.initialize = obj.prototype.constructor = obj;\n};\n';
};

Util.Subclass.prototype.js = function (o){
	if (this.inlineHelpers()) {
		// When this is triggered, we need to add it to the top of file?
		this.scope__().root().helper(this,this.helper());
		return ("subclass$(" + this.args().map(function(v) { return v.c(); }).join(',') + ");\n");
	} else {
		return ("" + (this.scope__().imba().c()) + ".subclass(" + this.args().map(function(v) { return v.c(); }).join(',') + ");\n");
	};
};

Util.Promisify = function Promisify(){ return Util.apply(this,arguments) };

subclass$(Util.Promisify,Util);
Util.Promisify.prototype.helper = function (){
	// should also check if it is a real promise
	return 'function promise$(a){\n	if(a instanceof Array){\n		console.warn("await (Array) is deprecated - use await Promise.all(Array)");\n		return Promise.all(a);\n	} else {\n		return (a && a.then ? a : Promise.resolve(a));\n	}\n}';
};

Util.Promisify.prototype.js = function (o){
	if (this.inlineHelpers()) {
		// When this is triggered, we need to add it to the top of file?
		this.scope__().root().helper(this,this.helper());
		return ("promise$(" + this.args().map(function(v) { return v.c(); }).join(',') + ")");
	} else {
		return ("" + (this.scope__().imba().c()) + ".await(" + this.args().map(function(v) { return v.c(); }).join(',') + ")");
	};
};

// TODO deprecated: can remove
Util.Class = function Class(){ return Util.apply(this,arguments) };

subclass$(Util.Class,Util);
Util.Class.prototype.js = function (o){
	// When this is triggered, we need to add it to the top of file?
	return ("class$(" + this.args().map(function(v) { return v.c(); }).join(',') + ")");
};

Util.Iterable = function Iterable(){ return Util.apply(this,arguments) };

subclass$(Util.Iterable,Util);
Util.Iterable.prototype.helper = function (){
	// now we want to allow null values as well - just return as empty collection
	// should be the same for for own of I guess
	return ("function iter$(a)\{ return a ? (a.toArray ? a.toArray() : a) : []; \};");
};

Util.Iterable.prototype.js = function (o){
	if (this.args()[0] instanceof Arr) { return this.args()[0].c() }; // or if we know for sure that it is an array
	
	if (true) { // isStandalone
		this.scope__().root().helper(this,this.helper());
		return ("iter$(" + (this.args()[0].c()) + ")");
	};
};

Util.IsFunction = function IsFunction(){ return Util.apply(this,arguments) };

subclass$(Util.IsFunction,Util);
Util.IsFunction.prototype.js = function (o){
	return ("" + (this.args()[0].c()));
};

Util.Array = function Array(){ return Util.apply(this,arguments) };

subclass$(Util.Array,Util);
Util.Array.prototype.js = function (o){
	// When this is triggered, we need to add it to the top of file?
	return ("new Array(" + this.args().map(function(v) { return v.c(); }) + ")");
};




function Entities(root){
	this._root = root;
	this._map = [];
	return this;
};

Entities.prototype.add = function (path,object){
	this._map[path] = object;
	if (this._map.indexOf(object) < 0) {
		this._map.push(object);
	};
	return this;
};

Entities.prototype.lookup = function (path){
	return this._map[path];
};

// def register entity
// 	var path = entity.namepath
// 	@map[path] ||= entity
// 	self

Entities.prototype.plain = function (){
	return JSON.parse(JSON.stringify(this._map));
};

Entities.prototype.toJSON = function (){
	return this._map;
};

function RootEntities(root){
	this._root = root;
	this._map = {};
	return this;
};

RootEntities.prototype.add = function (path,object){
	this._map[path] = object;
	return this;
};

RootEntities.prototype.register = function (entity){
	var path = entity.namepath();
	this._map[path] || (this._map[path] = entity);
	return this;
};

RootEntities.prototype.plain = function (){
	return JSON.parse(JSON.stringify(this._map));
};

RootEntities.prototype.toJSON = function (){
	return this._map;
};

// SCOPES

// handles local variables, self etc. Should create references to outer scopes
// when needed etc.

// add class for annotations / registering methods, etc?
// class Interface

// should move the whole context-thingie right into scope
function Scope(node,parent){
	this._nr = STACK.incr('scopes');
	this._head = [];
	this._node = node;
	this._parent = parent;
	this._vars = new VariableDeclaration([]);
	this._entities = new Entities(this);
	this._meta = {};
	this._annotations = [];
	this._closure = this;
	this._virtual = false;
	this._counter = 0;
	this._varmap = {};
	this._counters = {};
	this._varpool = [];
	this.setup();
};

exports.Scope = Scope; // export class 
Scope.prototype.level = function(v){ return this._level; }
Scope.prototype.setLevel = function(v){ this._level = v; return this; };
Scope.prototype.context = function(v){ return this._context; }
Scope.prototype.setContext = function(v){ this._context = v; return this; };
Scope.prototype.node = function(v){ return this._node; }
Scope.prototype.setNode = function(v){ this._node = v; return this; };
Scope.prototype.parent = function(v){ return this._parent; }
Scope.prototype.setParent = function(v){ this._parent = v; return this; };
Scope.prototype.varmap = function(v){ return this._varmap; }
Scope.prototype.setVarmap = function(v){ this._varmap = v; return this; };
Scope.prototype.varpool = function(v){ return this._varpool; }
Scope.prototype.setVarpool = function(v){ this._varpool = v; return this; };
Scope.prototype.params = function(v){ return this._params; }
Scope.prototype.setParams = function(v){ this._params = v; return this; };
Scope.prototype.head = function(v){ return this._head; }
Scope.prototype.setHead = function(v){ this._head = v; return this; };
Scope.prototype.vars = function(v){ return this._vars; }
Scope.prototype.setVars = function(v){ this._vars = v; return this; };
Scope.prototype.counter = function(v){ return this._counter; }
Scope.prototype.setCounter = function(v){ this._counter = v; return this; };
Scope.prototype.entities = function(v){ return this._entities; }
Scope.prototype.setEntities = function(v){ this._entities = v; return this; };

Scope.prototype.p = function (){
	if (STACK.loglevel() > 0) {
		console.log.apply(console,arguments);
	};
	return this;
};

Scope.prototype.stack = function (){
	return STACK;
};

Scope.prototype.setup = function (){
	return this._selfless = true;
};

Scope.prototype.incr = function (name){
	if(name === undefined) name = 'i';
	var val = this._counters[name] || (this._counters[name] = 0);
	this._counters[name]++;
	return val;
};

Scope.prototype.meta = function (key,value){
	if (value != undefined) {
		this._meta[key] = value;
		return this;
	};
	return this._meta[key];
};

Scope.prototype.namepath = function (){
	return '?';
};

Scope.prototype.tagContext = function (){
	return this._tagContext || (this._tagContext = (this.context().reference())); // @parent ? @parent.tagContext : {})
};

// def context
// 	@context ||= ScopeContext.new(self)

Scope.prototype.context = function (){
	// why do we need to make sure it is referenced?
	if (!this._context) {
		if (this.selfless()) {
			this._context = this.parent().context();
			this._context.reference(this);
		} else {
			this._context = new ScopeContext(this);
		};
	};
	return this._context;
};

Scope.prototype.traverse = function (){
	return this;
};

Scope.prototype.visit = function (){
	if (this._parent) { return this };
	this._parent = STACK.scope(1); // the parent scope
	this._level = STACK.scopes().length - 1;
	
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
	return STACK.ROOT;
	
	var scope = this;
	while (scope){
		if (scope instanceof RootScope) { return scope };
		scope = scope.parent();
	};
	return null;
};

Scope.prototype.register = function (name,decl,o){
	// FIXME re-registering a variable should really return the existing one
	// Again, here we should not really have to deal with system-generated vars
	// But again, it is important
	
	if(decl === undefined) decl = null;
	if(o === undefined) o = {};
	if (!name) {
		o.system = true;
	};
	
	if (o.system) {
		return new SystemVariable(this,name,decl,o);
	};
	
	name = helpers.symbolize(name);
	
	// also look at outer scopes if this is not closed?
	var existing = this._varmap.hasOwnProperty(name) && this._varmap[name];
	// FIXME check if existing is required to be unique as well?
	if (existing && !o.unique) { return existing };
	// var type = o:system ? SystemVariable : Variable
	var item = new Variable(this,name,decl,o);
	
	// register 
	// if o:type == 'meth' and self isa RootScope
	// 	console.log "add to object",name
	// 	@object.add(name,item)
	// var item = Variable.new(self,name,decl,o)
	// need to check for duplicates, and handle this gracefully -
	// going to refactor later
	if (!o.system && !existing) { this._varmap[name] = item };
	return item;
};

Scope.prototype.annotate = function (obj){
	this._annotations.push(obj);
	return this;
};

// just like register, but we automatically
Scope.prototype.declare = function (name,init,o){
	var declarator_;
	if(init === undefined) init = null;
	if(o === undefined) o = {};
	var variable = (name instanceof Variable) ? name : this.register(name,null,o);
	// TODO create the variabledeclaration here instead?
	// if this is a sysvar we need it to be renameable
	var dec = this._vars.add(variable,init);
	(declarator_ = variable.declarator()) || ((variable.setDeclarator(dec),dec));
	return variable;
};

// what are the differences here? omj
// we only need a temporary thing with defaults -- that is all
// change these values, no?
Scope.prototype.temporary = function (decl,o,name){
	if(o === undefined) o = {};
	if(name === undefined) name = null;
	if (name && o.reuse && this._vars[("_temp_" + name)]) {
		return this._vars[("_temp_" + name)];
	};
	
	if (o.pool) {
		for (var i = 0, items = iter$(this._varpool), len = items.length, v1; i < len; i++) {
			v1 = items[i];
			if (v1.pool() == o.pool && v1.declarator() == null) {
				return v1.reuse(decl);
			};
		};
	};
	
	var item = new SystemVariable(this,name,decl,o);
	
	this._varpool.push(item); // It should not be in the pool unless explicitly put there?
	this._vars.push(item); // WARN variables should not go directly into a declaration-list
	if (name && o.reuse) {
		this._vars[("_temp_" + name)] = item;
	};
	return item;
};

Scope.prototype.lookup = function (name){
	this._lookups || (this._lookups = {});
	var ret = null;
	name = helpers.symbolize(name);
	if (this._varmap.hasOwnProperty(name)) {
		ret = this._varmap[name];
	} else {
		ret = this.parent() && this.parent().lookup(name);
		
		if (ret) {
			this._nonlocals || (this._nonlocals = {});
			this._nonlocals[name] = ret;
		};
	};
	return ret;
};

Scope.prototype.requires = function (path,name){
	if(name === undefined) name = '';
	return this.root().requires(path,name);
};

Scope.prototype.imba = function (){
	return this.root().requires('imba2','Imba');
};

Scope.prototype.imbaTags = function (){
	return this.root().imbaTags();
};

Scope.prototype.imbaRef = function (name,shorthand){
	if(shorthand === undefined) shorthand = '_';
	return this.root().imbaRef(name,shorthand);
};

Scope.prototype.autodeclare = function (variable){
	return this.vars().push(variable); // only if it does not exist here!!!
};

Scope.prototype.free = function (variable){
	variable.free(); // :owner = null
	// @varpool.push(variable)
	return this;
};

Scope.prototype.selfless = function (){
	return !!this._selfless;
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
};

Scope.prototype.region = function (){
	return this.node().body().region();
};

Scope.prototype.loc = function (){
	return this.node().loc();
};

Scope.prototype.dump = function (){
	var self = this;
	var vars = Object.keys(self._varmap).map(function(k) {
		var v = self._varmap[k];
		// unless v.@declarator isa Scope
		// 	console.log v.name, v.@declarator:constructor:name
		// AST.dump(v)
		return v.references().length ? AST.dump(v) : null;
	});
	
	var desc = {
		nr: self._nr,
		type: self.constructor.name,
		level: (self.level() || 0),
		vars: AST.compact(vars),
		loc: self.loc()
	};
	
	return desc;
};

Scope.prototype.toJSON = function (){
	return this.dump();
};

Scope.prototype.toString = function (){
	return ("" + (this.constructor.name));
};

Scope.prototype.closeScope = function (){
	return this;
};


// RootScope is wrong? Rather TopScope or ProgramScope
function RootScope(){
	RootScope.prototype.__super__.constructor.apply(this,arguments);
	
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
	this.register('setImmediate',this,{type: 'global'});
	this.register('clearTimeout',this,{type: 'global'});
	this.register('clearInterval',this,{type: 'global'});
	this.register('clearImmediate',this,{type: 'global'});
	this.register('isNaN',this,{type: 'global'});
	this.register('isFinite',this,{type: 'global'});
	this.register('__dirname',this,{type: 'global'});
	this.register('__filename',this,{type: 'global'});
	this.register('_',this,{type: 'global'});
	
	// preregister global special variables here
	this._requires = {};
	this._warnings = [];
	this._scopes = [];
	this._helpers = [];
	this._styles = [];
	this._selfless = false;
	this._implicitAccessors = [];
	this._entities = new RootEntities(this);
	this._object = Obj.wrap({});
	this._head = [this._vars];
};


subclass$(RootScope,Scope);
exports.RootScope = RootScope; // export class 
RootScope.prototype.warnings = function(v){ return this._warnings; }
RootScope.prototype.setWarnings = function(v){ this._warnings = v; return this; };
RootScope.prototype.scopes = function(v){ return this._scopes; }
RootScope.prototype.setScopes = function(v){ this._scopes = v; return this; };
RootScope.prototype.entities = function(v){ return this._entities; }
RootScope.prototype.setEntities = function(v){ this._entities = v; return this; };
RootScope.prototype.object = function(v){ return this._object; }
RootScope.prototype.setObject = function(v){ this._object = v; return this; };
RootScope.prototype.styles = function(v){ return this._styles; }
RootScope.prototype.setStyles = function(v){ this._styles = v; return this; };

RootScope.prototype.context = function (){
	return this._context || (this._context = new RootScopeContext(this));
};

RootScope.prototype.lookup = function (name){
	name = helpers.symbolize(name);
	if (this._varmap.hasOwnProperty(name)) { return this._varmap[name] };
};

RootScope.prototype.visit = function (){
	STACK.addScope(this);
	return this;
};

RootScope.prototype.helper = function (typ,value){
	// log "add helper",typ,value
	if (this._helpers.indexOf(value) == -1) {
		this._helpers.push(value);
		this._head.unshift(value);
	};
	
	return this;
};

RootScope.prototype.head = function (){
	return this._head;
};

RootScope.prototype.warn = function (data){
	// hacky
	data.node = null;
	this._warnings.push(data);
	return this;
};

RootScope.prototype.dump = function (){
	var obj = {
		warnings: AST.dump(this._warnings),
		autoself: this._implicitAccessors.map(function(s) { return s.dump(); })
	};
	
	if (OPTS.analysis.scopes) {
		var scopes = this._scopes.map(function(s) { return s.dump(); });
		scopes.unshift(RootScope.prototype.__super__.dump.call(this));
		obj.scopes = scopes;
	};
	
	if (OPTS.analysis.entities) {
		obj.entities = this._entities;
	};
	
	return obj;
};

// not yet used
RootScope.prototype.requires = function (path,name){
	var variable, declarator_;
	if (variable = this.lookup(name)) {
		return variable;
	};
	
	if (variable = this._requires[name]) {
		if (variable._requirePath != path) {
			throw new Error(("" + name + " is already defined as require('" + (variable._requirePath) + "')"));
		};
		return variable;
	};
	
	var req = new Require(new Str("'" + path + "'"));
	variable = new Variable(this,name,null,{system: true});
	var dec = this._vars.add(variable,req);
	(declarator_ = variable.declarator()) || ((variable.setDeclarator(dec),dec));
	variable._requirePath = path;
	this._requires[name] = variable;
	return variable;
};

RootScope.prototype.imbaTags = function (){
	if (this._imbaTags) { return this._imbaTags };
	var imbaRef = this.imba();
	// don't add if we cannot be certain that imba is required on top
	if (this._requires.Imba) {
		return this._imbaTags = this.declare('_T',OP('.',imbaRef,'TAGS'));
	} else {
		return this._imbaTags = ("" + (imbaRef.c()) + ".TAGS");
	};
};

RootScope.prototype.imbaRef = function (name,shorthand){
	if(shorthand === undefined) shorthand = '_';
	if (name == 'tagscope') {
		name = 'createTagScope(/*SCOPEID*/)';
	} else if (name == 'tagfactory') {
		name = 'createElementFactory(/*SCOPEID*/)';
	};
	
	var map = this._imbaRefs || (this._imbaRefs = {});
	if (map[name]) { return map[name] };
	
	var imbaRef = this.imba();
	
	if (this._requires.Imba) {
		return map[name] = this.declare(shorthand,OP('.',this.imba(),name),{system: true});
	} else {
		return map[name] = ("" + (imbaRef.c()) + "." + name);
	};
};


RootScope.prototype.c = function (o){
	if(o === undefined) o = {};
	o.expression = false;
	// need to fix this
	this.node().body().setHead(this.head());
	var body = this.node().body().c(o);
	
	return body;
};

function ModuleScope(){ return Scope.apply(this,arguments) };

subclass$(ModuleScope,Scope);
exports.ModuleScope = ModuleScope; // export class 
ModuleScope.prototype.setup = function (){
	return this._selfless = false;
};

ModuleScope.prototype.namepath = function (){
	return this._node.namepath();
};

function ClassScope(){ return Scope.apply(this,arguments) };

subclass$(ClassScope,Scope);
exports.ClassScope = ClassScope; // export class 
ClassScope.prototype.setup = function (){
	return this._selfless = false;
};

ClassScope.prototype.namepath = function (){
	return this._node.namepath();
};

// called for scopes that are not real scopes in js
// must ensure that the local variables inside of the scopes do not
// collide with variables in outer scopes -- rename if needed
ClassScope.prototype.virtualize = function (){
	// console.log "virtualizing ClassScope"
	var up = this.parent();
	for (var o = this._varmap, v1, i = 0, keys = Object.keys(o), l = keys.length, k; i < l; i++){
		k = keys[i];v1 = o[k];v1.resolve(up,true); // force new resolve
	};
	return this;
};

ClassScope.prototype.prototype = function (){
	return this._prototype || (this._prototype = new ValueNode(OP('.',this.context(),'prototype')));
};

function TagScope(){ return ClassScope.apply(this,arguments) };

subclass$(TagScope,ClassScope);
exports.TagScope = TagScope; // export class 


function ClosureScope(){ return Scope.apply(this,arguments) };

subclass$(ClosureScope,Scope);
exports.ClosureScope = ClosureScope; // export class 


function FunctionScope(){ return Scope.apply(this,arguments) };

subclass$(FunctionScope,Scope);
exports.FunctionScope = FunctionScope; // export class 


function MethodScope(){ return Scope.apply(this,arguments) };

subclass$(MethodScope,Scope);
exports.MethodScope = MethodScope; // export class 
MethodScope.prototype.setup = function (){
	return this._selfless = false;
};

function LambdaScope(){ return Scope.apply(this,arguments) };

subclass$(LambdaScope,Scope);
exports.LambdaScope = LambdaScope; // export class 
LambdaScope.prototype.context = function (){
	// why do we need to make sure it is referenced?
	if (!this._context) {
		this._context = this.parent().context();
		this._context.reference(this);
	};
	return this._context;
};


function FlowScope(){ return Scope.apply(this,arguments) };

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
			if (found.type() == 'let') {
				// p "{name} already exists as a block-variable {decl}"
				// TODO should throw error instead
				if (decl) { decl.warn("Variable already exists in block") };
				// root.warn message: "Holy shit"
			};
		};
		return this.closure().register(name,decl,o);
	} else {
		return FlowScope.prototype.__super__.register.call(this,name,decl,o);
	};
};

// FIXME should override temporary as well

FlowScope.prototype.autodeclare = function (variable){
	return this.parent().autodeclare(variable);
};

FlowScope.prototype.closure = function (){
	return this._parent.closure(); // this is important?
};

FlowScope.prototype.context = function (){
	return this._context || (this._context = this.parent().context());
};

FlowScope.prototype.closeScope = function (){
	if (this._context) { this._context.reference() };
	return this;
};

function CatchScope(){ return FlowScope.apply(this,arguments) };

subclass$(CatchScope,FlowScope);
exports.CatchScope = CatchScope; // export class 


function WhileScope(){ return FlowScope.apply(this,arguments) };

subclass$(WhileScope,FlowScope);
exports.WhileScope = WhileScope; // export class 
WhileScope.prototype.autodeclare = function (variable){
	return this.vars().push(variable);
};

function ForScope(){ return FlowScope.apply(this,arguments) };

subclass$(ForScope,FlowScope);
exports.ForScope = ForScope; // export class 
ForScope.prototype.autodeclare = function (variable){
	return this.vars().push(variable);
};

ForScope.prototype.temporary = function (refnode,o,name){
	if(o === undefined) o = {};
	if(name === undefined) name = null;
	return this.parent().temporary(refnode,o,name);
};

function IfScope(){ return FlowScope.apply(this,arguments) };

subclass$(IfScope,FlowScope);
exports.IfScope = IfScope; // export class 
IfScope.prototype.temporary = function (refnode,o,name){
	if(o === undefined) o = {};
	if(name === undefined) name = null;
	return this.parent().temporary(refnode,o,name);
};

function BlockScope(){ return FlowScope.apply(this,arguments) };

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
Variable.prototype.scope = function(v){ return this._scope; }
Variable.prototype.setScope = function(v){ this._scope = v; return this; };
Variable.prototype.name = function(v){ return this._name; }
Variable.prototype.setName = function(v){ this._name = v; return this; };
Variable.prototype.alias = function(v){ return this._alias; }
Variable.prototype.setAlias = function(v){ this._alias = v; return this; };
Variable.prototype.type = function(v){ return this._type; }
Variable.prototype.setType = function(v){ this._type = v; return this; };
Variable.prototype.options = function(v){ return this._options; }
Variable.prototype.setOptions = function(v){ this._options = v; return this; };
Variable.prototype.initialized = function(v){ return this._initialized; }
Variable.prototype.setInitialized = function(v){ this._initialized = v; return this; };
Variable.prototype.declared = function(v){ return this._declared; }
Variable.prototype.setDeclared = function(v){ this._declared = v; return this; };
Variable.prototype.declarator = function(v){ return this._declarator; }
Variable.prototype.setDeclarator = function(v){ this._declarator = v; return this; };
Variable.prototype.autodeclare = function(v){ return this._autodeclare; }
Variable.prototype.setAutodeclare = function(v){ this._autodeclare = v; return this; };
Variable.prototype.references = function(v){ return this._references; }
Variable.prototype.setReferences = function(v){ this._references = v; return this; };
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
	var es5 = STACK.es5();
	var closure = this._scope.closure();
	var item = this._shadowing || scope.lookup(this._name);
	
	// if this is a let-definition inside a virtual scope we do need
	//
	if (this._scope != closure && this._type == 'let' && (es5 || this._virtual)) { // or if it is a system-variable
		item = closure.lookup(this._name);
		
		// we now need to ensure that this variable is unique inside
		// the whole closure.
		scope = closure;
	};
	
	if (item == this) {
		scope.varmap()[this._name] = this;
		return this;
	} else if (item) {
		// possibly redefine this inside, use it only in this scope
		// if the item is defined in an outer scope - we reserve the
		if (item.scope() != scope && (this.options().let || this._type == 'let')) {
			scope.varmap()[this._name] = this;
			// if we allow native let we dont need to rewrite scope?
			if ((!es5 && !this._virtual && !this._shadowing)) { return this };
		};
		
		
		// different rules for different variables?
		if (this._options.proxy) {
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
	
	scope.varmap()[this._name] = this;
	closure.varmap()[this._name] = this;
	return this;
};

Variable.prototype.reference = function (){
	return this;
};

Variable.prototype.node = function (){
	return this;
};

Variable.prototype.cache = function (){
	return this;
};

Variable.prototype.traverse = function (){
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
	if (this._c) { return this._c };
	// options - proxy??
	if (this._proxy) {
		this._c = this._proxy[0].c();
		if (this._proxy[1]) {
			this._c += '[' + this._proxy[1].c() + ']';
		};
	} else {
		if (!this._resolved) this.resolve();
		var v = (this.alias() || this.name());
		this._c = (typeof v == 'string') ? v : v.c();
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

Variable.prototype.js = function (){
	return this.c();
};

// variables should probably inherit from node(!)
Variable.prototype.consume = function (node){
	return this;
};

// this should only generate the accessors - not dael with references
Variable.prototype.accessor = function (ref){
	var node = new LocalVarAccess(".",null,this);
	// this is just wrong .. should not be a regular accessor
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
		if (ref.scope__() != this._scope) {
			this._noproxy = true;
		};
	};
	
	return this;
};

Variable.prototype.autodeclare = function (){
	if (this._declared) { return this };
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
	
	return {
		type: this.type(),
		name: name,
		refs: AST.dump(this._references,typ)
	};
};


function SystemVariable(){ return Variable.apply(this,arguments) };

subclass$(SystemVariable,Variable);
exports.SystemVariable = SystemVariable; // export class 
SystemVariable.prototype.pool = function (){
	return this._options.pool;
};

// weird name for this
SystemVariable.prototype.predeclared = function (){
	this.scope().vars().remove(this);
	return this;
};

SystemVariable.prototype.resolve = function (){
	var nodealias, v_;
	if (this._resolved) { return this };
	this._resolved = true;
	
	// unless @name
	// adds a very random initial name
	// the auto-magical goes last, or at least, possibly reuse other names
	// "${Math.floor(Math.random * 1000)}"
	var alias = this._name;
	var typ = this._options.pool;
	var names = [].concat(this._options.names);
	var alt = null;
	var node = null;
	
	this._name = null;
	
	var scope = this.scope();
	
	if (typ == 'tag') {
		var i = 0;
		while (!this._name){
			alt = ("t" + (i++));
			if (!scope.lookup(alt)) { this._name = alt };
		};
	} else if (typ == 'iter') {
		names = ['ary__','ary_','coll','array','items','ary'];
	} else if (typ == 'dict') {
		names = ['dict'];
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
	
	if (alias) {
		names.push(alias);
	};
	
	while (!this._name && (alt = names.pop())){
		var foundAlt = scope.lookup(alt);
		// check if higher level?
		if (!foundAlt) { // or (foundAlt.scope != scope and type == 'let' and !STACK.es5)
			this._name = alt; // unless scope.lookup(alt)
		};
	};
	
	if (!this._name && this._declarator) {
		if (node = this.declarator().node()) {
			if (nodealias = node.alias()) {
				names.push(nodealias + "_");
			};
		};
	};
	
	while (!this._name && (alt = names.pop())){
		if (!scope.lookup(alt)) { this._name = alt };
	};
	
	// go through alias proxies
	if (alias && !this._name) {
		i = 0;
		this._name = alias;
		// it is the closure that we should use
		while (scope.lookup(this._name)){
			this._name = ("" + alias + (i += 1));
		};
	};
	
	this._name || (this._name = ("$" + (scope.setCounter(v_ = scope.counter() + 1),v_)));
	
	scope.varmap()[this._name] = this;
	
	if (this.type() != 'let' || STACK.es5() || this._virtual) {
		this.closure().varmap()[this._name] = this;
	};
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

subclass$(ScopeContext,Node);
exports.ScopeContext = ScopeContext; // export class 
ScopeContext.prototype.scope = function(v){ return this._scope; }
ScopeContext.prototype.setScope = function(v){ this._scope = v; return this; };
ScopeContext.prototype.value = function(v){ return this._value; }
ScopeContext.prototype.setValue = function(v){ this._value = v; return this; };
ScopeContext.prototype.reference = function(v){ return this._reference; }
ScopeContext.prototype.setReference = function(v){ this._reference = v; return this; };

ScopeContext.prototype.namepath = function (){
	return this._scope.namepath();
};

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
	return val ? val.c() : "this";
};

ScopeContext.prototype.cache = function (){
	return this;
};

ScopeContext.prototype.proto = function (){
	return ("" + (this.c()) + ".prototype");
};

function RootScopeContext(){ return ScopeContext.apply(this,arguments) };

subclass$(RootScopeContext,ScopeContext);
exports.RootScopeContext = RootScopeContext; // export class 
RootScopeContext.prototype.reference = function (){
	// should be a 
	return this._reference || (this._reference = this.scope().declare("self",this.scope().object(),{type: 'global'}));
};

RootScopeContext.prototype.c = function (o){
	// @reference ||= scope.declare("self",scope.object, type: 'global')
	// return "" if o and o:explicit
	var val = this.reference(); // @value || @reference
	return (val && val != this) ? val.c() : "this";
	// should be the other way around, no?
	// o and o:explicit ? super : ""
};

function Super(){ return Node.apply(this,arguments) };

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
			out += ("." + AST.c(m.supername()));
			if (!((up instanceof Call))) { // autocall?
				out += (".apply(" + (m.scope().context().c()) + ",arguments)");
			};
		};
	};
	return out;
};

// constants

var BR = exports.BR = new Newline('\n');
var BR2 = exports.BR2 = new Newline('\n\n');
var SELF = exports.SELF = new Self();
var SUPER = exports.SUPER = new Super();

var TRUE = exports.TRUE = new True('true');
var FALSE = exports.FALSE = new False('false');
var UNDEFINED = exports.UNDEFINED = new Undefined();
var NIL = exports.NIL = new Nil();

var ARGUMENTS = exports.ARGUMENTS = new ArgsReference('arguments');
var EMPTY = exports.EMPTY = '';
var NULL = exports.NULL = 'null';

var RESERVED = exports.RESERVED = ['default','native','enum','with'];
var RESERVED_REGEX = exports.RESERVED_REGEX = /^(default|native|enum|with|new|char)$/;

var UNION = exports.UNION = new Const('union$');
var INTERSECT = exports.INTERSECT = new Const('intersect$');
var CLASSDEF = exports.CLASSDEF = new Const('imba$class');
var TAGDEF = exports.TAGDEF = new Const('Imba.TAGS.define');










