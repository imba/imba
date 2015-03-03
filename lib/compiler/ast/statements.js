(function(){
AST.Return = imba$class(function Return(v){
	this._value = v;
	if(v instanceof Array) {
		this._value = (v.length > 1) ? (new AST.Arr(v)) : (v[0]);
	};
},AST.Statement);

AST.Return.prototype.__value = {};
AST.Return.prototype.value = function(v){ return this._value; }
AST.Return.prototype.setValue = function(v){ this._value = v; return this; }
;

AST.Return.prototype.visit = function (){
	return (this._value && this._value.traverse) && (this._value.traverse());
};
AST.Return.prototype.js = function (){
	return (this.value()) ? (("return " + (this.value().c({expression: true})))) : ("return");
};
AST.Return.prototype.c = function (){
	if(!this.value() || this.value().isExpressable()) {
		return AST.Return.prototype.__super.c.apply(this,arguments);
	};
	this.p("return must cascade into value".red());
	return this.value().consume(this).c();
};
AST.Return.prototype.consume = function (node){
	return this;
};
AST.ImplicitReturn = imba$class(function ImplicitReturn(){
	AST.Return.apply(this,arguments);
},AST.Return);
AST.ImplicitReturn.prototype.c = function (){
	return (this.value()) ? (("return " + (this.value().c({expression: true})))) : ("return");
};
AST.GreedyReturn = imba$class(function GreedyReturn(){
	AST.ImplicitReturn.apply(this,arguments);
},AST.ImplicitReturn);
AST.GreedyReturn.prototype.c = function (){
	return (this.value()) ? (("return " + (this.value().c({expression: true})))) : ("return");
};
AST.Throw = imba$class(function Throw(){
	AST.Statement.apply(this,arguments);
},AST.Statement);
AST.Throw.prototype.js = function (){
	return "throw " + (this.value().c());
};
AST.Throw.prototype.consume = function (node){
	return this;
};
AST.LoopFlowStatement = imba$class(function LoopFlowStatement(lit,expr){
	this.setLiteral(lit);
	(this.setExpression(expr), expr);
},AST.Statement);

AST.LoopFlowStatement.prototype.__literal = {};
AST.LoopFlowStatement.prototype.literal = function(v){ return this._literal; }
AST.LoopFlowStatement.prototype.setLiteral = function(v){ this._literal = v; return this; }
;

AST.LoopFlowStatement.prototype.__expression = {};
AST.LoopFlowStatement.prototype.expression = function(v){ return this._expression; }
AST.LoopFlowStatement.prototype.setExpression = function(v){ this._expression = v; return this; }
;

AST.LoopFlowStatement.prototype.visit = function (){
	return (this.expression()) && (this.expression().traverse());
};
AST.LoopFlowStatement.prototype.consume = function (node){
	this.p("break/continue should consume?!");
	return this;
};
AST.LoopFlowStatement.prototype.c = function (){
	var copy;
	if(!this.expression()) {
		return AST.LoopFlowStatement.prototype.__super.c.apply(this,arguments);
	};
	var _loop = STACK.up(AST.Loop);
	this.p("found loop?",_loop);
	var expr = this.expression();
	
	return (_loop.catcher()) ? (expr = expr.consume(_loop.catcher()), copy = new this.constructor(this.literal()), BLOCK(expr,copy).c()) : ((expr) ? (copy = new this.constructor(this.literal()), BLOCK(expr,copy).c()) : (AST.LoopFlowStatement.prototype.__super.c.apply(this,arguments)));
};
AST.BreakStatement = imba$class(function BreakStatement(){
	AST.LoopFlowStatement.apply(this,arguments);
},AST.LoopFlowStatement);
AST.BreakStatement.prototype.js = function (){
	return "break";
};
AST.ContinueStatement = imba$class(function ContinueStatement(){
	AST.LoopFlowStatement.apply(this,arguments);
},AST.LoopFlowStatement);
AST.ContinueStatement.prototype.js = function (){
	return "continue";
};
AST.DebuggerStatement = imba$class(function DebuggerStatement(){
	AST.Statement.apply(this,arguments);
},AST.Statement);
}())