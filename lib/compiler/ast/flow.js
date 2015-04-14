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
	var helpers = require('./helpers');
	
	/* @class ControlFlow */
	AST.ControlFlow = function ControlFlow(){ AST.Node.apply(this,arguments) };
	
	subclass$(AST.ControlFlow,AST.Node);
	
	
	
	
	/* @class ControlFlowStatement */
	AST.ControlFlowStatement = function ControlFlowStatement(){ AST.ControlFlow.apply(this,arguments) };
	
	subclass$(AST.ControlFlowStatement,AST.ControlFlow);
	AST.ControlFlowStatement.prototype.isExpressable = function (){
		return false;
	};
	
	
	
	
	/* @class If */
	AST.If = function If(cond,body,o){
		// p "IF options",o && o:type
		if(o === undefined) o = {};
		this._test = ((o.type == 'unless') ? (OP('!',cond)) : (cond));
		this._body = body;
	};
	
	subclass$(AST.If,AST.ControlFlow);
	
	AST.If.prototype.__test = {};
	AST.If.prototype.test = function(v){ return this._test; }
	AST.If.prototype.setTest = function(v){ this._test = v; return this; };
	
	AST.If.prototype.__body = {};
	AST.If.prototype.body = function(v){ return this._body; }
	AST.If.prototype.setBody = function(v){ this._body = v; return this; };
	
	AST.If.prototype.__alt = {};
	AST.If.prototype.alt = function(v){ return this._alt; }
	AST.If.prototype.setAlt = function(v){ this._alt = v; return this; };
	
	
	AST.If.prototype.addElse = function (add){
		// p "add else!",add
		if(this.alt() && (this.alt() instanceof AST.If)) {
			// p 'add to the inner else(!)',add
			this.alt().addElse(add);
		} else {
			(this.setAlt(add),add);
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
		// would possibly want to look up / out 
		var brace = {braces: true,indent: true};
		
		var cond = this.test().c({expression: true});// the condition is always an expression
		
		
		if(o.isExpression()) {
			var code = this.body().c();// (braces: yes)
			// is expression!
			if(this.alt()) {
				// be safe - wrap condition as well
				return ("(" + cond + ") ? (" + code + ") : (" + (this.alt().c()) + ")");
			} else {
				// again - we need a better way to decide what needs parens
				// maybe better if we rewrite this to an OP('&&'), and put
				// the parens logic there
				return ("(" + cond + ") && (" + code + ")");
			};
		} else {
			code = this.body().c(brace);// (braces: yes)
			// don't wrap if it is only a single expression?
			var out = ("if(" + cond + ") ") + code;// ' {' + code + '}' # '{' + code + '}'
			if(this.alt()) {
				out += (" else " + (this.alt().c((this.alt() instanceof AST.If) ? ({}) : (brace))));
			};
			return out;
		};
	};
	
	
	AST.If.prototype.consume = function (node){
		// p 'assignify if?!'
		// if it is possible, convert into expression
		if(node instanceof AST.TagTree) {
			// p "TAG TREEEEEE"
			// hmmm
			this._body = this.body().consume(node);
			if(this.alt()) {
				this._alt = this.alt().consume(node);
			};
			return this;
		};
		
		if(this.isExpressable()) {
			this.toExpression();// mark as expression(!)
			return AST.If.__super__.consume.apply(this,arguments);
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
		// if exp
		// 	p "if is expressable".green
		// else
		// 	p "if is not expressable".red
		return exp;
	};
	
	
	
	
	/* @class Loop */
	AST.Loop = function Loop(options){
		if(options === undefined) options = {};
		this.setOptions(options);
		this;
	};
	
	subclass$(AST.Loop,AST.Statement);
	
	AST.Loop.prototype.__scope = {};
	AST.Loop.prototype.scope = function(v){ return this._scope; }
	AST.Loop.prototype.setScope = function(v){ this._scope = v; return this; };
	
	AST.Loop.prototype.__options = {};
	AST.Loop.prototype.options = function(v){ return this._options; }
	AST.Loop.prototype.setOptions = function(v){ this._options = v; return this; };
	
	AST.Loop.prototype.__body = {};
	AST.Loop.prototype.body = function(v){ return this._body; }
	AST.Loop.prototype.setBody = function(v){ this._body = v; return this; };
	
	AST.Loop.prototype.__catcher = {};
	AST.Loop.prototype.catcher = function(v){ return this._catcher; }
	AST.Loop.prototype.setCatcher = function(v){ this._catcher = v; return this; };
	
	
	
	
	
	AST.Loop.prototype.set = function (obj){
		// p "configure for!"
		this._options || (this._options = {});
		var keys = Object.keys(obj);
		for(var i=0, ary=iter$(keys), len=ary.length, k; i < len; i++) {
			k = ary[i];this._options[k] = obj[k];
		};
		return this;
	};
	
	
	AST.Loop.prototype.addBody = function (body){
		this.setBody(body.block());
		return this;
	};
	
	
	AST.Loop.prototype.c = function (o){
		// p "Loop.c - {isExpressable} {stack} {stack.isExpression}"
		// p "stack is expression? {o} {isExpression}"
		
		if(this.stack().isExpression() || this.isExpression()) {
			// what the inner one should not be an expression though?
			// this will resut in an infinite loop, no?!?
			var ast = CALL(FN([],[this]),[]);
			return ast.c(o);
		} else if(this.stack().current() instanceof AST.Block) {
			// hmm - need to check more thoroughly
			// p "parent is a block!"
			return AST.Loop.__super__.c.call(this,o);
		} else {
			// p "Should never get here?!?"
			ast = CALL(FN([],[this]),[]);
			return ast.c(o);
			// need to wrap in function
		};
	};
	
	
	
	
	/* @class While */
	AST.While = function While(test,opts){
		this._test = test;
		this._scope = new AST.WhileScope(this);
		if(opts) {
			this.set(opts);
		};
		// p "invert test for while? {@test}"
		if(this.option('invert')) {
			// "invert test for while {@test}"
			this._test = test.invert();
		};
		// invert the test
	};
	
	subclass$(AST.While,AST.Loop);
	
	AST.While.prototype.__test = {};
	AST.While.prototype.test = function(v){ return this._test; }
	AST.While.prototype.setTest = function(v){ this._test = v; return this; };
	
	
	
	
	
	AST.While.prototype.visit = function (){
		this.scope().visit();
		if(this.test()) {
			this.test().traverse();
		};
		return (this.body()) && (this.body().traverse());
	};
	
	
	// TODO BUG -- when we declare a var like: while var y = ...
	// the variable will be declared in the WhileScope which never
	// force-declares the inner variables in the scope
	
	AST.While.prototype.consume = function (node){
		// p "While.consume {node}".cyan
		// This is never expressable, but at some point
		// we might want to wrap it in a function (like CS)
		if(this.isExpressable()) {
			return AST.While.__super__.consume.apply(this,arguments);
		};
		
		if(node instanceof AST.TagTree) {
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
		// 	resvar = scope.declare(node.left.node.variable,AST.Arr.new([]),proxy: yes)
		// 	node = null
		// 	p "consume variable declarator!?".cyan
		// else
		// declare the variable we will use to soak up results
		// p "Creating value to store the result of loop".cyan
		// TODO Use a special vartype for this?
		var resvar = this.scope().declare('res',new AST.Arr([]),{system: true});
		// WHAT -- fix this --
		this._catcher = new AST.PushAssign("push",resvar,null);// the value is not preset # what
		this.body().consume(this._catcher);// should still return the same body
		
		// scope vars must not be compiled before this -- this is important
		var ast = BLOCK(this,resvar.accessor());// should be varaccess instead? # hmmm?
		return ast.consume(node);
		// NOTE Here we can find a way to know wheter or not we even need to 
		// return the resvar. Often it will not be needed
		// FIXME what happens if there is no node?!?
	};
	
	
	AST.While.prototype.js = function (){
		var out = ("while(" + (this.test().c({expression: true})) + ")") + this.body().c({braces: true,indent: true});// .wrap
		
		if(this.scope().vars().count() > 0) {
			// p "while-block has declared variables(!)"
			return [this.scope().vars().c(),out];
		};
		return out;
	};
	
	
	
	
	// This should define an open scope
	// should rather 
	/* @class For */
	AST.For = function For(o){
		if(o === undefined) o = {};
		this._options = o;
		this._scope = new AST.ForScope(this);
	};
	
	subclass$(AST.For,AST.Loop);
	
	
	
	AST.For.prototype.visit = function (){
		this.scope().visit();
		this.declare();
		// should be able to toggle whether to keep the results here already(!)
		this.body().traverse();
		return this.options().source.traverse();// what about awakening the vars here?
	};
	
	
	AST.For.prototype.declare = function (){
		
		var src = this.options().source;
		var vars = this.options().vars = {};
		var oi = this.options().index;
		
		
		// var i = vars:index = oi ? scope.declare(oi,0) : util.counter(0,yes).predeclare
		
		if(src instanceof AST.Range) {
			// p "range for-loop"
			vars.len = this.scope().declare('len',src.right());// util.len(o,yes).predeclare
			vars.index = this.scope().declare(this.options().name,src.left());
			vars.value = vars.index;
		} else {
			// vars:value = scope.declare(options:name,null,let: yes)
			var i = vars.index = (oi) ? (this.scope().declare(oi,0,{let: true})) : (this.util().counter(0,true).predeclare());
			vars.source = this.util().iterable(src,true).predeclare();
			vars.len = this.util().len(vars.source,true).predeclare();
			vars.value = this.scope().declare(this.options().name,null,{let: true});
			vars.value.addReference(this.options().name);// adding reference!
			if(oi) {
				i.addReference(oi);
			};
		};
		
		return this;
	};
	
	
	AST.For.prototype.consume = function (node){
		// p "Loop consume? {node}"
		// p "For.consume {node}".cyan
		if(this.isExpressable()) {
			return AST.For.__super__.consume.apply(this,arguments);
		};
		
		// other cases as well, no?
		if(node instanceof AST.TagTree) {
			// WARN this is a hack to allow references coming through the wrapping scope 
			// will result in unneeded self-declarations and other oddities
			// scope.parent.context.reference
			this.scope().context().reference();
			return CALL(new AST.Lambda([],[this]),[]);
		};
		
		
		var resvar = null;
		var reuseable = (node instanceof AST.Assign) && (node.left().node() instanceof AST.LocalVarAccess);
		
		// WARN Optimization - might have untended side-effects
		// if we are assigning directly to a local variable, we simply
		// use said variable for the inner res
		if(reuseable) {
			resvar = this.scope().declare(node.left().node().variable(),new AST.Arr([]),{proxy: true});
			node = null;
			// p "consume variable declarator!?".cyan
		} else {
			// declare the variable we will use to soak up results
			// p "Creating value to store the result of loop".cyan
			resvar = this.scope().declare('res',new AST.Arr([]),{system: true});
		};
		
		// p "GOT HERE TO PUSH ASSIGN",AST.PushAssign
		this._catcher = new AST.PushAssign("push",resvar,null);// the value is not preset
		this.body().consume(this._catcher);// should still return the same body
		
		var ast = BLOCK(this,resvar.accessor());// should be varaccess instead?
		if(node) {
			ast.consume(node);
		};
		// this is never an expression (for now -- but still)
		return ast;
	};
	
	
	AST.For.prototype.js = function (){
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
		if(src instanceof AST.Range) {
			if(src.inclusive()) {
				(cond.setOp(v_='<='),v_);
			};
		} else if(val.refcount() < 3) {
			// p "should proxy value-variable instead"
			val.proxy(vars.source,i);
		} else {
			this.body().unshift(OP('=',val,OP('.',vars.source,i)));
			// body.unshift(head)
			// TODO check lengths - intelligently decide whether to brace and indent
		};
		var head = ("for(" + (this.scope().vars().c()) + "; " + (cond.c()) + "; " + (final.c()) + ") ");
		return head + this.body().c({braces: true,indent: true});// .wrap
	};
	
	
	AST.For.prototype.head = function (){
		var vars = this.options().vars;
		return OP('=',vars.value,OP('.',vars.source,vars.index));
	};
	
	
	
	
	/* @class ForIn */
	AST.ForIn = function ForIn(){ AST.For.apply(this,arguments) };
	
	subclass$(AST.ForIn,AST.For);
	
	
	
	
	/* @class ForOf */
	AST.ForOf = function ForOf(){ AST.For.apply(this,arguments) };
	
	subclass$(AST.ForOf,AST.For);
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
			// we set the var
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
	
	AST.ForOf.prototype.js = function (){
		var vars = this.options().vars;
		
		var o = vars.source;
		var k = vars.key;
		var v = vars.value;
		var i = vars.index;
		
		
		if(v) {
			// set value as proxy of object[key]
			if(v.refcount() < 3) {
				v.proxy(o,k);
			} else {
				this.body().unshift(OP('=',v,OP('.',o,k)));
			};
		};
		
		if(this.options().own) {
			
			if(k.refcount() < 3) {// should probably adjust these
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
	
	AST.ForOf.prototype.head = function (){
		var v = this.options().vars;
		
		return [
			OP('=',v.key,OP('.',v.keys,v.index)),
			(v.value) && (OP('=',v.value,OP('.',v.source,v.key)))
		];
	};
	
	
	
	
	/* @class Begin */
	AST.Begin = function Begin(body){
		this._nodes = body.block().nodes();
	};
	
	subclass$(AST.Begin,AST.Block);
	
	
	
	AST.Begin.prototype.shouldParenthesize = function (){
		return this.isExpression();// hmmm
	};
	
	
	
	
	/* @class Switch */
	AST.Switch = function Switch(a,b,c){
		this._source = a;
		this._cases = b;
		this._fallback = c;
	};
	
	subclass$(AST.Switch,AST.ControlFlowStatement);
	
	AST.Switch.prototype.__source = {};
	AST.Switch.prototype.source = function(v){ return this._source; }
	AST.Switch.prototype.setSource = function(v){ this._source = v; return this; };
	
	AST.Switch.prototype.__cases = {};
	AST.Switch.prototype.cases = function(v){ return this._cases; }
	AST.Switch.prototype.setCases = function(v){ this._cases = v; return this; };
	
	AST.Switch.prototype.__fallback = {};
	AST.Switch.prototype.fallback = function(v){ return this._fallback; }
	AST.Switch.prototype.setFallback = function(v){ this._fallback = v; return this; };
	
	
	
	
	
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
		
		for(var i=0, ary=iter$(this.cases()), len=ary.length, part; i < len; i++) {
			part = ary[i];part.autobreak();
			body.push(part);
		};
		
		if(this.fallback()) {
			body.push("default:\n" + this.fallback().c({indent: true}));
		};
		
		return ("switch(" + (this.source().c()) + ") ") + body.c().join("\n").wrap();
	};
	
	
	
	
	/* @class SwitchCase */
	AST.SwitchCase = function SwitchCase(test,body){
		this._test = test;
		this._body = body.block();
	};
	
	subclass$(AST.SwitchCase,AST.ControlFlowStatement);
	
	AST.SwitchCase.prototype.__test = {};
	AST.SwitchCase.prototype.test = function(v){ return this._test; }
	AST.SwitchCase.prototype.setTest = function(v){ this._test = v; return this; };
	
	AST.SwitchCase.prototype.__body = {};
	AST.SwitchCase.prototype.body = function(v){ return this._body; }
	AST.SwitchCase.prototype.setBody = function(v){ this._body = v; return this; };
	
	
	
	
	
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
		return cases.join("\n") + this.body().c({indent: true});// .indent
	};
	
	
	
	
	/* @class Try */
	AST.Try = function Try(body,c,f){
		this._body = body.block();
		this._catch = c;
		this._finally = f;
	};
	
	subclass$(AST.Try,AST.ControlFlowStatement);
	
	AST.Try.prototype.__body = {};
	AST.Try.prototype.body = function(v){ return this._body; }
	AST.Try.prototype.setBody = function(v){ this._body = v; return this; };
	// prop ncatch
	// prop nfinally
	
	
	
	
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
		// no blocks - add an empty catch
	};
	
	
	AST.Try.prototype.js = function (){
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
	AST.Catch = function Catch(body,varname){
		this._body = body.block();
		this._scope = new AST.CatchScope(this);
		this._varname = varname;
	};
	
	subclass$(AST.Catch,AST.ControlFlowStatement);
	
	
	
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
		return ("catch (" + (this._variable.c()) + ") ") + this._body.c({braces: true,indent: true}) + "\n";
	};
	
	
	
	// repeating myself.. don't deal with it until we move to compact tuple-args
	// for all astnodes
	
	
	/* @class Finally */
	AST.Finally = function Finally(body){
		this._body = body.block();
	};
	
	subclass$(AST.Finally,AST.ControlFlowStatement);
	
	
	
	AST.Finally.prototype.visit = function (){
		return this._body.traverse();
	};
	
	
	AST.Finally.prototype.consume = function (node){
		// swallow silently
		return this;
	};
	
	
	AST.Finally.prototype.js = function (){
		return "finally " + this._body.c({braces: true,indent: true});
	};
	


}())