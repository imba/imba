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
	
	/* @class Return */
	AST.Return = function Return(v){
		this._value = v;
		this._prebreak = v && v._prebreak;// hmmm
		// console.log "return?!? {v}",@prebreak
		
		if(v instanceof AST.ArgList) {
			v = v.nodes();
			// @value = v:length > 1 ? AST.Arr.new(v) : v[0]
		};
		
		if(v instanceof Array) {
			this._value = (v.length > 1) ? (new AST.Arr(v)) : (v[0]);
		};
	};
	
	subclass$(AST.Return,AST.Statement);
	
	AST.Return.prototype.__value = {};
	AST.Return.prototype.value = function(v){ return this._value; }
	AST.Return.prototype.setValue = function(v){ this._value = v; return this; };
	
	
	
	AST.Return.prototype.visit = function (){
		return (this._value && this._value.traverse) && (this._value.traverse());
	};
	
	AST.Return.prototype.js = function (){
		return (this.value()) ? (("return " + (this.value().c({expression: true})))) : ("return");
	};
	
	AST.Return.prototype.c = function (){
		if(!this.value() || this.value().isExpressable()) {
			return AST.Return.__super__.c.apply(this,arguments);
		};
		// p "return must cascade into value".red
		return this.value().consume(this).c();
	};
	
	AST.Return.prototype.consume = function (node){
		return this;
	};
	
	
	/* @class ImplicitReturn */
	AST.ImplicitReturn = function ImplicitReturn(){ AST.Return.apply(this,arguments) };
	
	subclass$(AST.ImplicitReturn,AST.Return);
	AST.ImplicitReturn.prototype.c = function (){
		// hmm?
		return (this.value()) ? (("return " + (this.value().c({expression: true})))) : ("return");
	};
	
	
	/* @class GreedyReturn */
	AST.GreedyReturn = function GreedyReturn(){ AST.ImplicitReturn.apply(this,arguments) };
	
	subclass$(AST.GreedyReturn,AST.ImplicitReturn);
	AST.GreedyReturn.prototype.c = function (){
		// hmm?
		return (this.value()) ? (("return " + (this.value().c({expression: true})))) : ("return");
	};
	
	
	// cannot live inside an expression(!)
	/* @class Throw */
	AST.Throw = function Throw(){ AST.Statement.apply(this,arguments) };
	
	subclass$(AST.Throw,AST.Statement);
	AST.Throw.prototype.js = function (){
		return "throw " + (this.value().c());
	};
	
	AST.Throw.prototype.consume = function (node){
		// ROADMAP should possibly consume to the value of throw and then throw?
		return this;
	};
	
	
	
	/* @class LoopFlowStatement */
	AST.LoopFlowStatement = function LoopFlowStatement(lit,expr){
		this.setLiteral(lit);
		(this.setExpression(expr),expr);// && AST.ArgList.new(expr) # really?
	};
	
	subclass$(AST.LoopFlowStatement,AST.Statement);
	
	AST.LoopFlowStatement.prototype.__literal = {};
	AST.LoopFlowStatement.prototype.literal = function(v){ return this._literal; }
	AST.LoopFlowStatement.prototype.setLiteral = function(v){ this._literal = v; return this; };
	
	AST.LoopFlowStatement.prototype.__expression = {};
	AST.LoopFlowStatement.prototype.expression = function(v){ return this._expression; }
	AST.LoopFlowStatement.prototype.setExpression = function(v){ this._expression = v; return this; };
	
	
	
	AST.LoopFlowStatement.prototype.visit = function (){
		return (this.expression()) && (this.expression().traverse());
	};
	
	AST.LoopFlowStatement.prototype.consume = function (node){
		// p "break/continue should consume?!"
		return this;
	};
	
	AST.LoopFlowStatement.prototype.c = function (){
		var copy;
		if(!this.expression()) {
			return AST.LoopFlowStatement.__super__.c.apply(this,arguments);
		};
		// get up to the outer loop
		var _loop = STACK.up(AST.Loop);
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
			AST.LoopFlowStatement.__super__.c.apply(this,arguments)
		));
		// return "loopflow"
	};
	
	
	
	/* @class BreakStatement */
	AST.BreakStatement = function BreakStatement(){ AST.LoopFlowStatement.apply(this,arguments) };
	
	subclass$(AST.BreakStatement,AST.LoopFlowStatement);
	AST.BreakStatement.prototype.js = function (){
		return "break";
	};
	
	
	/* @class ContinueStatement */
	AST.ContinueStatement = function ContinueStatement(){ AST.LoopFlowStatement.apply(this,arguments) };
	
	subclass$(AST.ContinueStatement,AST.LoopFlowStatement);
	AST.ContinueStatement.prototype.js = function (){
		return "continue";
	};
	
	
	/* @class DebuggerStatement */
	AST.DebuggerStatement = function DebuggerStatement(){ AST.Statement.apply(this,arguments) };
	
	subclass$(AST.DebuggerStatement,AST.Statement);
	


}())