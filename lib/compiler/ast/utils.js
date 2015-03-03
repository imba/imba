(function(){
AST.Util = imba$class(function Util(args){
	this._args = args;
},AST.Node);

AST.Util.prototype.__args = {};
AST.Util.prototype.args = function(v){ return this._args; }
AST.Util.prototype.setArgs = function(v){ this._args = v; return this; }
;

AST.Util.extend = function (a,b){
	return new AST.Util.Extend([a, b]);
};
AST.Util.keys = function (obj){
	var l = new AST.Const("Object");
	var r = new AST.Identifier("keys");
	return CALL(OP('.',l,r),[obj]);
};
AST.Util.len = function (obj,cache){
	var r = new AST.Identifier("length");
	var node = OP('.',obj,r);
	if(cache) {
		node.cache({force: true,type: 'len'});
	};
	return node;
};
AST.Util.slice = function (obj,a,b){
	var slice = new AST.Identifier("slice");
	return CALL(OP('.',obj,slice),[a.toAST(), b && b.toAST()].compact());
};
AST.Util.iterable = function (obj,cache){
	var node = new AST.Util.Iterable([obj]);
	if(cache) {
		node.cache({force: true,type: 'iter'});
	};
	return node;
};
AST.Util.union = function (a,b){
	return CALL(AST.UNION,[a, b]);
};
AST.Util.intersect = function (a,b){
	return CALL(AST.INTERSECT,[a, b]);
};
AST.Util.counter = function (start,cache){
	var node = new AST.Num(start);
	if(cache) {
		node.cache({force: true,type: 'counter'});
	};
	return node;
};
AST.Util.array = function (size,cache){
	var node = new AST.Util.Array([size]);
	if(cache) {
		node.cache({force: true,type: 'list'});
	};
	return node;
};
AST.Util.defineTag = function (type,ctor,supr){
	return CALL(AST.TAGDEF,[type, ctor, supr]);
};
AST.Util.toAST = function (obj){
	return this;
};
AST.Util.prototype.js = function (){
	return "helper";
};
AST.Util.Extend = imba$class(function Extend(){
	AST.Util.apply(this,arguments);
},AST.Util);
AST.Util.Extend.prototype.js = function (){
	return "extend$(" + (this.args().compact().c().join(',')) + ")";
};
AST.Util.Promisify = imba$class(function Promisify(){
	AST.Util.apply(this,arguments);
},AST.Util);
AST.Util.Promisify.prototype.helper = function (){
	return "function promise$(a)\{ return a instanceof Array ? Promise.all(a) : (a && a.then ? a : Promise.resolve(a)); \}";
};
AST.Util.Promisify.prototype.js = function (){
	this.scope__().root().helper(this,this.helper());
	return "promise$(" + (this.args().compact().c().join(',')) + ")";
};
AST.Util.Class = imba$class(function Class(){
	AST.Util.apply(this,arguments);
},AST.Util);
AST.Util.Class.prototype.js = function (){
	return "class$(" + (this.args().compact().c().join(',')) + ")";
};
AST.Util.Iterable = imba$class(function Iterable(){
	AST.Util.apply(this,arguments);
},AST.Util);
AST.Util.Iterable.prototype.helper = function (){
	return "function iter$(a)\{ return a ? (a.toArray ? a.toArray() : a) : []; \}";
};
AST.Util.Iterable.prototype.js = function (){
	if(this.args()[0] instanceof AST.Arr) {
		return this.args()[0].c();
	};
	this.scope__().root().helper(this,this.helper());
	return ("iter$(" + (this.args()[0].c()) + ")");
};
AST.Util.IsFunction = imba$class(function IsFunction(){
	AST.Util.apply(this,arguments);
},AST.Util);
AST.Util.IsFunction.prototype.js = function (){
	return "" + (this.args()[0].c());
};
AST.Util.Array = imba$class(function Array(){
	AST.Util.apply(this,arguments);
},AST.Util);
AST.Util.Array.prototype.js = function (){
	return "new Array(" + (this.args().compact().c()) + ")";
};
}())