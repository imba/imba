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
	// Literals should probably not inherit from the same parent
	// as arrays, tuples, objects would be better off inheriting
	// from listnode.
	
	/* @class Literal */
	AST.Literal = function Literal(){ AST.ValueNode.apply(this,arguments) };
	
	subclass$(AST.Literal,AST.ValueNode);
	AST.Literal.prototype.toString = function (){
		return "" + this.value();
	};
	
	AST.Literal.prototype.hasSideEffects = function (){
		return false;
	};
	
	
	
	/* @class Bool */
	AST.Bool = function Bool(){ AST.Literal.apply(this,arguments) };
	
	subclass$(AST.Bool,AST.Literal);
	AST.Bool.prototype.cache = function (){
		return this;
	};
	
	AST.Bool.prototype.truthy = function (){
		// p "bool is truthy? {value}"
		return this.value() == "true";
		// yes
	};
	
	
	/* @class True */
	AST.True = function True(){ AST.Bool.apply(this,arguments) };
	
	subclass$(AST.True,AST.Bool);
	AST.True.prototype.raw = function (){
		return true;
	};
	
	
	/* @class False */
	AST.False = function False(){ AST.Bool.apply(this,arguments) };
	
	subclass$(AST.False,AST.Bool);
	AST.False.prototype.raw = function (){
		return false;
	};
	
	
	/* @class Num */
	AST.Num = function Num(){ AST.Literal.apply(this,arguments) };
	
	subclass$(AST.Num,AST.Literal);
	AST.Num.prototype.toString = function (){
		return "" + this.value();
	};
	
	AST.Num.prototype.shouldParenthesize = function (){
		return this.up() instanceof AST.Access;
	};
	
	// def cache
	// 	p "cache num"
	// 	self
	
	AST.Num.prototype.raw = function (){
		return JSON.parse(this.value());
	};
	
	
	// should be quoted no?
	// what about strings in object-literals?
	// we want to be able to see if the values are allowed
	/* @class Str */
	AST.Str = function Str(){ AST.Literal.apply(this,arguments) };
	
	subclass$(AST.Str,AST.Literal);
	AST.Str.prototype.raw = function (){
		// JSON.parse requires double-quoted strings,
		// while eval also allows single quotes. 
		// NEXT eval is not accessible like this
		// WARNING TODO be careful! - should clean up
		return this._raw || (this._raw = global.eval(this.value()));// incredibly stupid solution
	};
	
	AST.Str.prototype.isValidIdentifier = function (){
		// there are also some values we cannot use
		return (this.raw().match(/^[a-zA-Z\$\_]+[\d\w\$\_]*$/)) ? (true) : (false);
	};
	
	
	
	// Currently not used - it would be better to use this
	// for real interpolated strings though, than to break
	// them up into their parts before parsing
	/* @class InterpolatedString */
	AST.InterpolatedString = function InterpolatedString(){ AST.ListNode.apply(this,arguments) };
	
	subclass$(AST.InterpolatedString,AST.ListNode);
	AST.InterpolatedString.prototype.js = function (){
		return "interpolated string";
	};
	
	
	
	/* @class Tuple */
	AST.Tuple = function Tuple(){ AST.ListNode.apply(this,arguments) };
	
	subclass$(AST.Tuple,AST.ListNode);
	AST.Tuple.prototype.c = function (){
		// compiles as an array
		return new AST.Arr(this.nodes()).c();
	};
	
	AST.Tuple.prototype.hasSplat = function (){
		return this.filter(function (v){
			return v instanceof AST.Splat;
		})[0];
	};
	
	AST.Tuple.prototype.consume = function (node){
		if(this.count() == 1) {
			return this.first().consume(node);
		} else {
			throw "multituple cannot consume";
		};
	};
	
	
	
	// Because we've dropped the Str-wrapper it is kinda difficult
	/* @class Symbol */
	AST.Symbol = function Symbol(){ AST.Literal.apply(this,arguments) };
	
	subclass$(AST.Symbol,AST.Literal);
	AST.Symbol.prototype.isValidIdentifier = function (){
		return (this.raw().match(/^[a-zA-Z\$\_]+[\d\w\$\_]*$/)) ? (true) : (false);
	};
	
	AST.Symbol.prototype.raw = function (){
		return this._raw || (this._raw = this.value().c().toSymbol());
	};
	
	AST.Symbol.prototype.js = function (){
		return "'" + (this.value().c().toSymbol()) + "'";
	};
	
	
	/* @class RegExp */
	AST.RegExp = function RegExp(){ AST.Literal.apply(this,arguments) };
	
	subclass$(AST.RegExp,AST.Literal);
	
	
	// Should inherit from ListNode - would simplify
	/* @class Arr */
	AST.Arr = function Arr(){ AST.Literal.apply(this,arguments) };
	
	subclass$(AST.Arr,AST.Literal);
	AST.Arr.prototype.load = function (value){
		return (value instanceof Array) ? (new AST.ArgList(value)) : (value);
	};
	
	AST.Arr.prototype.push = function (item){
		this.value().push(item);
		return this;
	};
	
	AST.Arr.prototype.count = function (){
		return this.value().length;
	};
	
	AST.Arr.prototype.nodes = function (){
		return this.value();
	};
	
	AST.Arr.prototype.splat = function (){
		return this.value().some(function (v){
			return v instanceof AST.Splat;
		});
	};
	
	AST.Arr.prototype.visit = function (){
		if(this._value) {
			this._value.traverse();
		};
		// for v in value
		// 	v.traverse
		return this;
	};
	
	AST.Arr.prototype.js = function (){
		var slices, group;
		var splat = this.value().some(function (v){
			return v instanceof AST.Splat;
		});
		
		return (splat) ? (
			"SPLATTED ARRAY!",
			// if we know for certain that the splats are arrays we can drop the slice?
			slices = [],
			group = null,
			this.value().forEach(function (v){
				return (v instanceof AST.Splat) ? (
					slices.push(v),
					group = null
				) : (
					(!group) && (slices.push(group = new AST.Arr([]))),
					group.push(v)
				);
			}),
			
			("[].concat(" + (slices.c().join(", ")) + ")")
		) : (
			// very temporary. need a more generic way to prettify code
			// should depend on the length of the inner items etc
			// if @indented or option(:indent) or value.@indented
			// "[\n{value.c.join(",\n").indent}\n]"
			// else
			("[" + (this.value().c()) + "]")
		);
	};
	
	// def indented
	// 	var o = @options ||= {}
	// 	o:indent = yes
	// 	self
	
	AST.Arr.prototype.hasSideEffects = function (){
		return this.value().some(function (v){
			return v.hasSideEffects();
		});
	};
	
	AST.Arr.prototype.toString = function (){
		return "Arr";
	};
	
	
	AST.Arr.wrap = function (val){
		return new AST.Arr(val);
	};
	
	
	// should not be cklassified as a literal?
	/* @class Obj */
	AST.Obj = function Obj(){ AST.Literal.apply(this,arguments) };
	
	subclass$(AST.Obj,AST.Literal);
	AST.Obj.prototype.load = function (value){
		return (value instanceof Array) ? (new AST.AssignList(value)) : (value);
	};
	
	AST.Obj.prototype.visit = function (){
		if(this._value) {
			this._value.traverse();
		};
		// for v in value
		// 	v.traverse
		return this;
	};
	
	AST.Obj.prototype.js = function (){
		var dyn = this.value().filter(function (v){
			return (v instanceof AST.ObjAttr) && (v.key() instanceof AST.Op);
		});
		
		if(dyn.length > 0) {
			var idx = this.value().indexOf(dyn[0]);
			// p "dynamic keys! {dyn}"
			// create a temp variable
			
			var tmp = this.scope__().temporary(this);
			// set the temporary object to the same
			var first = this.value().slice(0,idx);
			var obj = new AST.Obj(first);
			var ast = [OP('=',tmp,obj)];
			
			this.value().slice(idx).forEach(function (atr){
				return ast.push(OP('=',OP('.',tmp,atr.key()),atr.value()));
			});
			ast.push(tmp);// access the tmp at in the last part
			return new AST.Parens(ast).c();
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
	
	AST.Obj.prototype.add = function (k,v){
		var kv = new AST.ObjAttr(k,v);
		this.value().push(kv);
		return kv;
	};
	
	AST.Obj.prototype.hash = function (){
		var hash = {};
		for(var i=0, ary=iter$(this.value()), len=ary.length, k; i < len; i++) {
			k = ary[i];if(k instanceof AST.ObjAttr) {
				hash[k.key().symbol()] = k.value();
			};
		};
		return hash;
		// return k if k.key.symbol == key
	};
	
	// add method for finding properties etc?
	AST.Obj.prototype.key = function (key){
		for(var i=0, ary=iter$(this.value()), len=ary.length, k; i < len; i++) {
			k = ary[i];if((k instanceof AST.ObjAttr) && k.key().symbol() == key) {
				return k;
			};
		};
		return null;
	};
	
	AST.Obj.prototype.indented = function (a,b){
		this._value.indented(a,b);
		return this;
	};
	
	AST.Obj.prototype.hasSideEffects = function (){
		return this.value().some(function (v){
			return v.hasSideEffects();
		});
	};
	
	// for converting a real object into an ast-representation
	AST.Obj.wrap = function (obj){
		var attrs = [];
		for(var o=obj, v, i=0, keys=Object.keys(o), l=keys.length; i < l; i++){
			v = o[keys[i]];if(v instanceof Array) {
				v = AST.Arr.wrap(v);
			} else if(v.constructor == Object) {
				v = AST.Obj.wrap(v);
			};
			attrs.push(new AST.ObjAttr(keys[i],v));
		};
		return new AST.Obj(attrs);
	};
	
	AST.Obj.prototype.toString = function (){
		return "Obj";
	};
	
	
	/* @class ObjAttr */
	AST.ObjAttr = function ObjAttr(key,value){
		this._key = key;
		this._value = value;
		this._dynamic = (key instanceof AST.Op);
	};
	
	subclass$(AST.ObjAttr,AST.Node);
	
	AST.ObjAttr.prototype.__key = {};
	AST.ObjAttr.prototype.key = function(v){ return this._key; }
	AST.ObjAttr.prototype.setKey = function(v){ this._key = v; return this; };
	
	AST.ObjAttr.prototype.__value = {};
	AST.ObjAttr.prototype.value = function(v){ return this._value; }
	AST.ObjAttr.prototype.setValue = function(v){ this._value = v; return this; };
	
	AST.ObjAttr.prototype.__options = {};
	AST.ObjAttr.prototype.options = function(v){ return this._options; }
	AST.ObjAttr.prototype.setOptions = function(v){ this._options = v; return this; };
	
	
	
	AST.ObjAttr.prototype.visit = function (){
		// should probably traverse key as well, unless it is a dead simple identifier
		this.key().traverse();
		return this.value().traverse();
	};
	
	AST.ObjAttr.prototype.js = function (){
		return "" + (this.key().c()) + ": " + (this.value().c());
	};
	
	AST.ObjAttr.prototype.hasSideEffects = function (){
		return true;
	};
	
	
	
	
	/* @class ArgsReference */
	AST.ArgsReference = function ArgsReference(){ AST.Node.apply(this,arguments) };
	
	subclass$(AST.ArgsReference,AST.Node);
	AST.ArgsReference.prototype.c = function (){
		return "arguments";
	};
	
	
	// should be a separate Context or something
	/* @class Self */
	AST.Self = function Self(scope){
		this._scope = scope;
	};
	
	subclass$(AST.Self,AST.Literal);
	
	AST.Self.prototype.__scope = {};
	AST.Self.prototype.scope = function(v){ return this._scope; }
	AST.Self.prototype.setScope = function(v){ this._scope = v; return this; };
	
	
	
	AST.Self.prototype.cache = function (){
		return this;
	};
	
	AST.Self.prototype.reference = function (){
		return this;
	};
	
	AST.Self.prototype.c = function (){
		var s = this.scope__();
		return (s) ? (s.context().c()) : ("this");
	};
	
	
	/* @class ImplicitSelf */
	AST.ImplicitSelf = function ImplicitSelf(){ AST.Self.apply(this,arguments) };
	
	subclass$(AST.ImplicitSelf,AST.Self);
	
	
	/* @class This */
	AST.This = function This(){ AST.Self.apply(this,arguments) };
	
	subclass$(AST.This,AST.Self);
	AST.This.prototype.cache = function (){
		return this;
	};
	
	AST.This.prototype.reference = function (){
		// p "referencing this"
		return this;
	};
	
	AST.This.prototype.c = function (){
		return "this";
	};
	


}())