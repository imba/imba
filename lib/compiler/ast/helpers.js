(function(){
TERMINAL_COLOR_CODES = {bold: 1,underline: 4,reverse: 7,black: 30,red: 31,green: 32,yellow: 33,blue: 34,magenta: 35,cyan: 36,white: 37};
String.prototype.color = function (code){
	var code = TERMINAL_COLOR_CODES[code];
	var resetStr = "\x1B[0m";
	var resetRegex = /\x1B\[0m/g;
	var codeRegex = /\x1B\[\d+m/g;
	var tagRegex = /(<\w+>|<A\d+>)|(<\/\w+>|<A\d+>)/i;
	var numRegex = /\d+/;
	var str = ('' + this).replace(resetRegex,("" + resetStr + "\x1B[" + code + "m"));
	str = ("\x1B[" + code + "m" + str + resetStr);
	return str;
};
String.prototype.red = function (){
	return this.color('red');
};
String.prototype.green = function (){
	return this.color('green');
};
String.prototype.yellow = function (){
	return this.color('yellow');
};
String.prototype.blue = function (){
	return this.color('blue');
};
String.prototype.magenta = function (){
	return this.color('magenta');
};
String.prototype.cyan = function (){
	return this.color('cyan');
};
String.prototype.white = function (){
	return this.color('white');
};

String.prototype.pascalCase = function (){
	return this.replace(/(^|[\-\_\s])(\w)/g,function (m,v,l){
		return l.toUpperCase();
	});
};
String.prototype.camelCase = function (){
	return this.replace(/([\-\_\s])(\w)/g,function (m,v,l){
		return l.toUpperCase();
	});
};
String.prototype.snakeCase = function (){
	var str = this.replace(/([\-\s])(\w)/g,'_');
	return str.replace(/()([A-Z])/g,"_$1",function (m,v,l){
		return l.toUpperCase();
	});
};
String.prototype.toSymbol = function (){
	var sym = this.replace(/(.+)\=$/,"set-$1");
	sym = sym.replace(/(.+)\?$/,"is-$1");
	return sym.replace(/([\-\s])(\w)/g,function (m,v,l){
		return l.toUpperCase();
	});
};
String.prototype.toSetter = function (){
	return ("set-" + this).camelCase();
};
String.prototype.brackets = function (){
	return '{' + this.toString() + '}';
};
String.prototype.wrap = function (typ){
	return '{' + "\n" + this.indent() + "\n" + '}';
};
String.prototype.indent = function (){
	return this.replace(/^/g,"\t").replace(/\n/g,"\n\t");
};
String.prototype.c = function (){
	return "" + this;
};
String.prototype.quoted = function (){
	return '"' + this + '"';
};
String.prototype.parenthesize = function (){
	return '(' + this + ')';
};
String.prototype.identifier = function (){
	return new AST.Identifier(this);
};
String.prototype.traverse = function (){
	return this;
};
String.prototype.region = function (){
	return this._region;
};
String.prototype.loc = function (){
	return this._region;
};
String.prototype.toAST = function (deep){
	if(deep === undefined) deep = false;
	return new AST.Str(JSON.stringify(this));
};
String.prototype.node = function (){
	return this;
};
Array.prototype.flatten = function (){
	var a = [];
	this.forEach(function (v){
		return (v instanceof Array) ? (a.push.apply(a,v.flatten())) : (a.push(v));
	});
	return a;
};
Array.prototype.inspect = function (){
	return this.map(function (v){
		return (v && v.inspect) ? (v.inspect()) : (v);
	});
};
Array.prototype.compact = function (){
	return this.filter(function (v){
		return v != undefined && v != null;
	});
};
Array.prototype.unique = function (){
	var a = [];
	this.forEach(function (v){
		return (a.indexOf(v) == -1) && (a.push(v));
	});
	return a;
};
Array.prototype.last = function (){
	return this[this.length - 1];
};
Array.prototype.c = function (){
	return this.map(function (v){
		return v.c();
	});
};
Array.prototype.indent = function (){
	return this.c().join("\n");
};
Array.prototype.dump = function (key){
	return this.map(function (v){
		return (v && v.dump) ? (v.dump(key)) : (v);
	});
};
Array.prototype.block = function (){
	return AST.Block.wrap(this);
};
Array.prototype.count = function (){
	return this.length;
};
Array.prototype.toAST = function (deep){
	if(deep === undefined) deep = false;
	var items = this;
	if(deep) {
		items = this.map(function (v){
			return (v.toAST) ? (v.toAST(deep)) : (v);
		});
	};
	return new AST.Arr(items);
};
Number.prototype.traverse = function (){
	return this.p("string should not be traversed".red());
};
Number.prototype.c = function (){
	return "" + this;
};
Number.prototype.toAST = function (){
	return new AST.Num(this);
};
Number.prototype.loc = function (){
	return this._region || [0, 0];
};
}())