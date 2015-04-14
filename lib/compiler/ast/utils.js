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
	
	/* @class Util */
	AST.Util = function Util(args){
		this._args = args;
	};
	
	subclass$(AST.Util,AST.Node);
	
	AST.Util.prototype.__args = {};
	AST.Util.prototype.args = function(v){ return this._args; }
	AST.Util.prototype.setArgs = function(v){ this._args = v; return this; };
	
	
	
	// this is how we deal with it now
	AST.Util.extend = function (a,b){
		return new AST.Util.Extend([a,b]);
	};
	
	AST.Util.repeat = function (str,times){
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
	
	
	
	AST.Util.keys = function (obj){
		var l = new AST.Const("Object");
		var r = new AST.Identifier("keys");
		return CALL(OP('.',l,r),[obj]);
	};
	
	AST.Util.len = function (obj,cache){
		// p "LEN HELPER".green
		var r = new AST.Identifier("length");
		var node = OP('.',obj,r);
		if(cache) {
			node.cache({force: true,type: 'len'});
		};
		return node;
	};
	
	AST.Util.indexOf = function (lft,rgt){
		var node = new AST.Util.IndexOf([lft,rgt]);
		// node.cache(force: yes, type: 'iter') if cache
		return node;
	};
	
	AST.Util.slice = function (obj,a,b){
		var slice = new AST.Identifier("slice");
		return CALL(OP('.',obj,slice),[a.toAST(),b && b.toAST()].compact());
	};
	
	AST.Util.iterable = function (obj,cache){
		var node = new AST.Util.Iterable([obj]);
		if(cache) {
			node.cache({force: true,type: 'iter'});
		};
		return node;
	};
	
	
	
	AST.Util.union = function (a,b){
		return new AST.Util.Union([a,b]);
		// CALL(AST.UNION,[a,b])
	};
	
	AST.Util.intersect = function (a,b){
		return new AST.Util.Intersect([a,b]);
		// CALL(AST.INTERSECT,[a,b])
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
		return CALL(AST.TAGDEF,[type,ctor,supr]);
	};
	
	// hmm
	AST.Util.defineClass = function (name,supr,initor){
		return CALL(AST.CLASSDEF,[name || initor,this.sup()]);
	};
	
	
	AST.Util.toAST = function (obj){
		// deep converter that takes arrays etc and converts into ast
		return this;
	};
	
	AST.Util.prototype.js = function (){
		return "helper";
	};
	
	
	/* @class Union */
	AST.Util.Union = function Union(){ AST.Util.apply(this,arguments) };
	
	subclass$(AST.Util.Union,AST.Util);
	AST.Util.Union.prototype.helper = function (){
		return 'union$ = function(a,b){\n	if(a && a.__union) return a.__union(b);\n\n	var u = a.slice(0);\n	for(var i=0,l=b.length;i<l;i++) if(u.indexOf(b[i]) == -1) u.push(b[i]);\n	return u;\n};\n';
	};
	
	
	AST.Util.Union.prototype.js = function (){
		this.scope__().root().helper(this,this.helper());
		// When this is triggered, we need to add it to the top of file?
		return "union$(" + (this.args().compact().c().join(',')) + ")";
	};
	
	
	/* @class Intersect */
	AST.Util.Intersect = function Intersect(){ AST.Util.apply(this,arguments) };
	
	subclass$(AST.Util.Intersect,AST.Util);
	AST.Util.Intersect.prototype.helper = function (){
		return 'intersect$ = function(a,b){\n	if(a && a.__intersect) return a.__intersect(b);\n	var res = [];\n	for(var i=0, l=a.length; i<l; i++) {\n		var v = a[i];\n		if(b.indexOf(v) != -1) res.push(v);\n	}\n	return res;\n};\n';
	};
	
	AST.Util.Intersect.prototype.js = function (){
		// When this is triggered, we need to add it to the top of file?
		this.scope__().root().helper(this,this.helper());
		return "intersect$(" + (this.args().compact().c().join(',')) + ")";
	};
	
	
	/* @class Extend */
	AST.Util.Extend = function Extend(){ AST.Util.apply(this,arguments) };
	
	subclass$(AST.Util.Extend,AST.Util);
	AST.Util.Extend.prototype.js = function (){
		// When this is triggered, we need to add it to the top of file?
		return "extend$(" + (this.args().compact().c().join(',')) + ")";
	};
	
	
	/* @class IndexOf */
	AST.Util.IndexOf = function IndexOf(){ AST.Util.apply(this,arguments) };
	
	subclass$(AST.Util.IndexOf,AST.Util);
	AST.Util.IndexOf.prototype.helper = function (){
		return 'idx$ = function(a,b){\n	return (b && b.indexOf) ? b.indexOf(a) : [].indexOf.call(a,b);\n};\n';
	};
	
	
	AST.Util.IndexOf.prototype.js = function (){
		this.scope__().root().helper(this,this.helper());
		// When this is triggered, we need to add it to the top of file?
		return "idx$(" + (this.args().compact().c().join(',')) + ")";
	};
	
	
	/* @class Subclass */
	AST.Util.Subclass = function Subclass(){ AST.Util.apply(this,arguments) };
	
	subclass$(AST.Util.Subclass,AST.Util);
	AST.Util.Subclass.prototype.helper = function (){
		// should also check if it is a real promise
		return '// helper for subclassing\nfunction subclass$(obj,sup) {\n	for (var k in sup) {\n		if (sup.hasOwnProperty(k)) obj[k] = sup[k];\n	};\n	// obj.__super__ = sup;\n	obj.prototype = Object.create(sup.prototype);\n	obj.__super__ = obj.prototype.__super__ = sup.prototype;\n	obj.prototype.initialize = obj.prototype.constructor = obj;\n};\n';
	};
	
	AST.Util.Subclass.prototype.js = function (){
		// When this is triggered, we need to add it to the top of file?
		this.scope__().root().helper(this,this.helper());
		return "subclass$(" + (this.args().compact().c().join(',')) + ");\n";
	};
	
	
	/* @class Promisify */
	AST.Util.Promisify = function Promisify(){ AST.Util.apply(this,arguments) };
	
	subclass$(AST.Util.Promisify,AST.Util);
	AST.Util.Promisify.prototype.helper = function (){
		// should also check if it is a real promise
		return "function promise$(a)\{ return a instanceof Array ? Promise.all(a) : (a && a.then ? a : Promise.resolve(a)); \}";
	};
	
	AST.Util.Promisify.prototype.js = function (){
		// When this is triggered, we need to add it to the top of file?
		this.scope__().root().helper(this,this.helper());
		return "promise$(" + (this.args().compact().c().join(',')) + ")";
	};
	
	
	/* @class Class */
	AST.Util.Class = function Class(){ AST.Util.apply(this,arguments) };
	
	subclass$(AST.Util.Class,AST.Util);
	AST.Util.Class.prototype.js = function (){
		// When this is triggered, we need to add it to the top of file?
		return "class$(" + (this.args().compact().c().join(',')) + ")";
	};
	
	
	/* @class Iterable */
	AST.Util.Iterable = function Iterable(){ AST.Util.apply(this,arguments) };
	
	subclass$(AST.Util.Iterable,AST.Util);
	AST.Util.Iterable.prototype.helper = function (){
		// now we want to allow nil values as well - just return as empty collection
		// should be the same for for own of I guess
		return "function iter$(a)\{ return a ? (a.toArray ? a.toArray() : a) : []; \};";
	};
	
	AST.Util.Iterable.prototype.js = function (){
		if(this.args()[0] instanceof AST.Arr) {
			return this.args()[0].c();
		};// or if we know for sure that it is an array
		// only wrap if it is not clear that this is an array?
		this.scope__().root().helper(this,this.helper());
		return ("iter$(" + (this.args()[0].c()) + ")");
	};
	
	
	/* @class IsFunction */
	AST.Util.IsFunction = function IsFunction(){ AST.Util.apply(this,arguments) };
	
	subclass$(AST.Util.IsFunction,AST.Util);
	AST.Util.IsFunction.prototype.js = function (){
		// p "IS FUNCTION {args[0]}"
		// just plain check for now
		return "" + (this.args()[0].c());
		// "isfn$({args[0].c})"
		// "typeof {args[0].c} == 'function'"
	};
	
	
	
	/* @class Array */
	AST.Util.Array = function Array(){ AST.Util.apply(this,arguments) };
	
	subclass$(AST.Util.Array,AST.Util);
	AST.Util.Array.prototype.js = function (){
		// When this is triggered, we need to add it to the top of file?
		return "new Array(" + (this.args().compact().c()) + ")";
	};
	


}())