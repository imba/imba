(function(){
function iter$(a){ return a ? (a.toArray ? a.toArray() : a) : []; }
AST.Literal = imba$class(function Literal(){
	AST.ValueNode.apply(this,arguments);
},AST.ValueNode);
AST.Literal.prototype.toString = function (){
	return "" + this.value();
};
AST.Literal.prototype.hasSideEffects = function (){
	return false;
};
AST.Bool = imba$class(function Bool(){
	AST.Literal.apply(this,arguments);
},AST.Literal);
AST.Bool.prototype.cache = function (){
	return this;
};
AST.Bool.prototype.truthy = function (){
	return this.value() == "true";
};
AST.True = imba$class(function True(){
	AST.Bool.apply(this,arguments);
},AST.Bool);
AST.True.prototype.raw = function (){
	return true;
};
AST.False = imba$class(function False(){
	AST.Bool.apply(this,arguments);
},AST.Bool);
AST.False.prototype.raw = function (){
	return false;
};
AST.Num = imba$class(function Num(){
	AST.Literal.apply(this,arguments);
},AST.Literal);
AST.Num.prototype.toString = function (){
	return "" + this.value();
};
AST.Num.prototype.shouldParenthesize = function (){
	return this.up() instanceof AST.Access;
};
AST.Num.prototype.raw = function (){
	return JSON.parse(this.value());
};
AST.Str = imba$class(function Str(){
	AST.Literal.apply(this,arguments);
},AST.Literal);
AST.Str.prototype.raw = function (){
	return this._raw || (this._raw = global.eval(this.value()));
};
AST.Str.prototype.isValidIdentifier = function (){
	return (this.raw().match(/^[a-zA-Z\$\_]+[\d\w\$\_]*$/)) ? (true) : (false);
};
AST.InterpolatedString = imba$class(function InterpolatedString(){
	AST.ListNode.apply(this,arguments);
},AST.ListNode);
AST.InterpolatedString.prototype.js = function (){
	return "interpolated string";
};
AST.Tuple = imba$class(function Tuple(){
	AST.ListNode.apply(this,arguments);
},AST.ListNode);
AST.Tuple.prototype.c = function (){
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
AST.Symbol = imba$class(function Symbol(){
	AST.Literal.apply(this,arguments);
},AST.Literal);
AST.Symbol.prototype.isValidIdentifier = function (){
	return (this.raw().match(/^[a-zA-Z\$\_]+[\d\w\$\_]*$/)) ? (true) : (false);
};
AST.Symbol.prototype.raw = function (){
	return this._raw || (this._raw = this.value().c().toSymbol());
};
AST.Symbol.prototype.js = function (){
	return "'" + (this.value().c().toSymbol()) + "'";
};
AST.RegExp = imba$class(function RegExp(){
	AST.Literal.apply(this,arguments);
},AST.Literal);
AST.Arr = imba$class(function Arr(){
	AST.Literal.apply(this,arguments);
},AST.Literal);
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
	for(var i=0, ary=iter$(this.value()), len=ary.length; i < len; i++){
		ary[i].traverse();
	};
	return this;
};
AST.Arr.prototype.js = function (){
	var slices, group;
	var splat = this.value().some(function (v){
		return v instanceof AST.Splat;
	});
	
	return (splat) ? ("SPLATTED ARRAY!", slices = [], group = null, this.value().forEach(function (v){
		return (v instanceof AST.Splat) ? (slices.push(v), group = null) : ((!group) && (slices.push(group = new AST.Arr([]))), group.push(v));
	}), "[].concat(" + (slices.c().join(", ")) + ")") : ((this.option('indent')) ? ("[\n" + (this.value().c().join(",\n").indent()) + "\n]") : ("[" + (this.value().c().join(", ")) + "]"));
};
AST.Arr.prototype.indented = function (){
	var o = this._options || (this._options = {});
	o.indent = true;
	return this;
};
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
AST.Obj = imba$class(function Obj(){
	AST.Literal.apply(this,arguments);
},AST.Literal);
AST.Obj.prototype.visit = function (){
	for(var i=0, ary=iter$(this.value()), len=ary.length; i < len; i++){
		ary[i].traverse();
	};
	return this;
};
AST.Obj.prototype.js = function (){
	var dyn = this.value().filter(function (v){
		return v.key() instanceof AST.Op;
	});
	
	if(dyn.length > 0) {
		var idx = this.value().indexOf(dyn[0]);
		
		var tmp = this.scope__().temporary(this);
		var first = this.value().slice(0,idx);
		var obj = new AST.Obj(first);
		var ast = [OP('=',tmp,obj)];
		
		this.value().slice(idx).forEach(function (atr){
			return ast.push(OP('=',OP('.',tmp,atr.key()),atr.value()));
		});
		ast.push(tmp);
		return new AST.Parens(ast).c();
	};
	return '{' + this.value().map(function (v){
		return v.c();
	}).join(',') + '}';
};
AST.Obj.prototype.add = function (k,v){
	var kv = new AST.ObjAttr(k,v);
	this.value().push(kv);
	return kv;
};
AST.Obj.prototype.hash = function (){
	var hash = {};
	for(var i=0, ary=iter$(this.value()), len=ary.length, k; i < len; i++){
		k = ary[i];
		hash[k.key().symbol()] = k.value();
	};
	return hash;
};
AST.Obj.prototype.key = function (key){
	for(var i=0, ary=iter$(this.value()), len=ary.length, k; i < len; i++){
		k = ary[i];
		if(k.key().symbol() == key) {
			return k;
		};
	};
	return null;
};
AST.Obj.prototype.hasSideEffects = function (){
	return this.value().some(function (v){
		return v.hasSideEffects();
	});
};
AST.Obj.wrap = function (obj){
	var attrs = [];
	for(var o=obj, v, i=0, keys=Object.keys(o), l=keys.length; i < l; i++){
		v = o[keys[i]];
		if(v instanceof Array) {
			v = AST.Arr.wrap(v);
		} else {
			if(v.constructor == Object) {
				v = AST.Obj.wrap(v);
			}
		};
		attrs.push(new AST.ObjAttr(keys[i],v));
	};
	return new AST.Obj(attrs);
};
AST.Obj.prototype.toString = function (){
	return "Obj";
};
AST.ObjAttr = imba$class(function ObjAttr(key,value){
	this._key = key;
	this._value = value;
	this._dynamic = (key instanceof AST.Op);
},AST.Node);

AST.ObjAttr.prototype.__key = {};
AST.ObjAttr.prototype.key = function(v){ return this._key; }
AST.ObjAttr.prototype.setKey = function(v){ this._key = v; return this; }
;

AST.ObjAttr.prototype.__value = {};
AST.ObjAttr.prototype.value = function(v){ return this._value; }
AST.ObjAttr.prototype.setValue = function(v){ this._value = v; return this; }
;

AST.ObjAttr.prototype.__options = {};
AST.ObjAttr.prototype.options = function(v){ return this._options; }
AST.ObjAttr.prototype.setOptions = function(v){ this._options = v; return this; }
;

AST.ObjAttr.prototype.visit = function (){
	this.key().traverse();
	return this.value().traverse();
};
AST.ObjAttr.prototype.js = function (){
	return "" + (this.key().c()) + ": " + (this.value().c());
};
AST.ObjAttr.prototype.hasSideEffects = function (){
	return true;
};
AST.ArgsReference = imba$class(function ArgsReference(){
	AST.Node.apply(this,arguments);
},AST.Node);
AST.ArgsReference.prototype.c = function (){
	return "arguments";
};
AST.Self = imba$class(function Self(scope){
	this._scope = scope;
},AST.Literal);

AST.Self.prototype.__scope = {};
AST.Self.prototype.scope = function(v){ return this._scope; }
AST.Self.prototype.setScope = function(v){ this._scope = v; return this; }
;

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
AST.ImplicitSelf = imba$class(function ImplicitSelf(){
	AST.Self.apply(this,arguments);
},AST.Self);

AST.This = imba$class(function This(){
	AST.Self.apply(this,arguments);
},AST.Self);
AST.This.prototype.cache = function (){
	return this;
};
AST.This.prototype.reference = function (){
	return this;
};
AST.This.prototype.c = function (){
	return "this";
};
}())