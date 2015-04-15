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
	// TODO Create AST.Expression - make all expressions inherit from these?
	
	// externs;
	
	
	var helpers = require('./helpers');
	
	AST = {};
	
	// Helpers for operators
	OP = function (op,left,right,opts){
		if(op == '.') {
			if((typeof right=='string'||right instanceof String)) {
				right = new AST.Identifier(right);
			};
			
			return new AST.Access(op,left,right);
		} else if(op == '=') {
			if(left instanceof AST.Tuple) {
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
			) : ((idx$(op,['--','++','!','√']) >= 0) ? (
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
			// not sure about this
		};
	};
	
	OP.ASSIGNMENT = ["=","+=","-=","*=","/=","%=","<<=",">>=",">>>=","|=","^=","&="];
	OP.LOGICAL = ["||","&&"];
	OP.UNARY = ["++","--"];
	
	AST.LOC = function (loc){
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
			return OP(node.op(),node.left(),this);
		} else if(node instanceof AST.Op) {
			return OP(node.op(),node.left(),this);
		} else if(node instanceof AST.Return) {
			return new AST.Return(this);
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
		
		// if indent and indent.match(/\:/)
		this._indented = [a,b];
		this._indentation || (this._indentation = (a && b) ? (new AST.Indentation(a,b)) : (AST.INDENT));
		return this;
	};
	
	AST.Node.prototype.prebreak = function (term){
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
			this._indentation || (this._indentation = AST.INDENT);
			// self.indented()
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
		
		
		// what about if we should indent?!?
		
		STACK.pop(this);
		
		if(this._cache) {
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
		return (o && o.expression || this._value.match(/\n/)) ? (
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
				if(!express || arg != last) {
					out = out + delim;
				};
			};
			return out;
		});
		
		return parts.join("");
		
		// if indent
		// 	# console.log "{self} indented?"
		// 	# hmm
		// 	# var out = (@prebreak or '\n') +
		// 	return indent:wrap and indent.wrap(parts.join(""))
		// 
		// 	# var out = parts.join("").indent # + '\n' # hmmm
		// 	# out = '\n' + out unless nodes[0] isa AST.Terminator # hmmm
		// 	# out += '\n' unless realLast isa AST.Terminator # hmmm
		// 	# out
		// else
		// 	parts.join("")
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
	
	// def visit
	// 	# console.log "ArgList.visit {@indented}"
	// 	# if @prebreak # hmm
	// 	# 	console.log "adding prebreak inside {@prebreak} arglist"
	// 	# 	first and first.prebreak(@prebreak) 
	// 	super
	
	// def js
	// 	return super
	// 	
	// 	# ).join(",")
	
	// def c
	// 	js --- not good(!)
	;
	
	/* @class AssignList */
	AST.AssignList = function AssignList(){ AST.ArgList.apply(this,arguments) };
	
	subclass$(AST.AssignList,AST.ArgList);
	AST.AssignList.prototype.concat = function (other){
		if(this._nodes.length == 0 && (other instanceof AST.AssignList)) {
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
		// @indentation ||= AST.INDENT
	};
	
	subclass$(AST.Block,AST.ListNode);
	
	AST.Block.prototype.__head = {};
	AST.Block.prototype.head = function(v){ return this._head; }
	AST.Block.prototype.setHead = function(v){ this._head = v; return this; };
	
	AST.Block.wrap = function (ary){
		return (ary.length == 1 && (ary[0] instanceof AST.Block)) ? (ary[0]) : (new AST.Block(ary));
		// return nodes[0] if nodes.length is 1 and nodes[0] instanceof Block
		// new Block nodes
	};
	
	// def prebreak br
	// 	console.log "Block prebreak {br}"
	// 	super
	
	AST.Block.prototype.visit = function (){
		if(this._prebreak) {
			console.log("PREBREAK IN AST.BLOCK SHOULD THROW");
			this.first() && this.first().prebreak(this._prebreak);
		};
		return AST.Block.__super__.visit.apply(this,arguments);
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
	AST.Block.prototype.unwrap = function (){
		var ary = [];
		for(var i=0, items=iter$(this.nodes()), len=items.length, node; i < len; i++) {
			node = items[i];if(node instanceof AST.Block) {
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
		if(node instanceof AST.TagTree) {
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
		if(expr instanceof AST.Assign) {
			this.addExpression(expr.left());// make sure this is a valid thing?
			// make this into a tuple instead
			// possibly fix this as well?!?
			// does not need to be a tuple?
			return new AST.TupleAssign('=',new AST.Tuple(this.nodes()),expr.right());
		} else if(expr instanceof AST.VarOrAccess) {
			this.push(new AST.VarReference(expr.value()));
		} else if((expr instanceof AST.Splat) && (expr.node() instanceof AST.VarOrAccess)) {
			expr.setValue(new AST.VarReference(expr.node().value()));
			this.push(expr);
		} else {
			throw "VarBlock does not allow non-variable expressions";
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
		// if value isa AST.Block
		// 	# no need to pare
		// 	p "compile the parens {value} {value.count}"
		// p "compile the parens {value}"
		// should not force expression
		// p o.isExpression
		// value.c(expression: yes)
		// "({value.c(expression: o.isExpression)})"
	};
	
	AST.Parens.prototype.shouldParenthesize = function (){
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
	
	// def isExpressable
	// value.isExpressable
	
	AST.ExpressionBlock.prototype.consume = function (node){
		return this.value().consume(node);
	};
	
	AST.ExpressionBlock.prototype.addExpression = function (expr){
		if(expr.node() instanceof AST.Assign) {
			this.push(expr.left());
			// make this into a tuple instead
			// possibly fix this as well?!?
			return new AST.TupleAssign('=',new AST.Tuple(this.nodes()),expr.right());
		} else {
			this.push(expr);
		};
		return this;
	};
	
	
	// create a raw-block for compiled stuff?


}())