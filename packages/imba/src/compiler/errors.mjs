import * as util from './helpers.mjs';
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

// imba$inlineHelpers=1
// create separate error-types with all the logic

const meta = new WeakMap();

function ImbaParseError(e,o){
	var m;
	this.error = e;
	
	this._options = o || {};
	
	this.severity = this._options.severity || 'error';
	
	let msg = e.message;
	
	if (m = msg.match(/Unexpected '([\w\-]+)'/)) {
		if (m[1] == 'TERMINATOR') {
			msg = 'Unexpected newline';
		};
	};
	
	this.message = msg;
	this.sourcePath = e.sourcePath;
	this.line = e.line;
	this;
};

subclass$(ImbaParseError,Error);

ImbaParseError.wrap = function (err){
	// what about the stacktrace?
	return new this(err);
};

Object.defineProperty(ImbaParseError.prototype,'_options',{get: function(){
	return meta.get(this);
}, configurable: true});

Object.defineProperty(ImbaParseError.prototype,'_options',{set: function(value){
	return meta.set(this,value);
}, configurable: true});

ImbaParseError.prototype.set = function (opts){
	this._options || (this._options = {});
	for (let v, i = 0, keys = Object.keys(opts), l = keys.length, k; i < l; i++){
		k = keys[i];v = opts[k];this._options[k] = v;
	};
	return this;
};

ImbaParseError.prototype.start = function (){
	var o = this._options;
	var idx = o.pos - 1;
	var tok = o.tokens && o.tokens[idx];
	while (tok && (tok._loc == -1 || tok._loc == 0 || tok._len == 0)){
		tok = o.tokens[--idx];
	};
	return tok;
};

Object.defineProperty(ImbaParseError.prototype,'token',{get: function(){
	if (this._token) { return this._token };
	var o = this._options;
	var idx = o.pos - 1;
	var tok = o.tokens && o.tokens[idx];
	while (tok && (tok._loc == -1 || tok._loc == 0 || tok._len == 0)){
		tok = o.tokens[--idx];
	};
	return this._token = tok;
}, configurable: true});

ImbaParseError.prototype.desc = function (){
	var o = this._options;
	let msg = this.message;
	if (o.token && o.token._loc == -1) {
		return 'Syntax Error';
	} else {
		return msg;
	};
};

ImbaParseError.prototype.loc = function (){
	var start_;
	return this._loc || (start_ = this.start()) && start_.region  &&  start_.region();
};

ImbaParseError.prototype.toJSON = function (){
	var o = this._options;
	var tok = this.start();
	return {warn: true,message: this.desc(),loc: this.loc()};
};

ImbaParseError.prototype.toNativeError = function (){
	let err = new SyntaxError("hello");
	err.fileName = this._sourcePath;
	err.message = this.message;
	err.stack = this.excerpt({colors: false,details: true});
	err.lineNumber = this.lineNumber;
	err.columnNumber = this.columnNumber;
	return err;
};

ImbaParseError.prototype.excerpt = function (pars){
	if(!pars||pars.constructor !== Object) pars = {};
	var gutter = pars.gutter !== undefined ? pars.gutter : true;
	var colors = pars.colors !== undefined ? pars.colors : false;
	var details = pars.details !== undefined ? pars.details : true;
	try {
		var code = this._code;
		var loc = this.loc();
		var lines = code.split(/\n/g);
		var locmap = util.locationToLineColMap(code);
		var lc = locmap[loc[0]] || [0,0];
		var ln = lc[0];
		var col = lc[1];
		var line = lines[ln];
		
		this.lineNumber = ln + 1;
		this.columnNumber = col;
		
		var ln0 = Math.max(0,ln - 2);
		var ln1 = Math.min(ln0 + 5,lines.length);
		let lni = ln - ln0;
		var l = ln0;
		var colorize = function(_0) { return _0; };
		
		if (colors) {
			let color = (this.severity == 'warn') ? 'yellow' : 'red';
			if ((typeof colors=='string'||colors instanceof String)) { color = colors };
			colorize = function(_0) { return util.ansi[color](util.ansi.bold(_0)); };
		};
		
		var res = [];while (l < ln1){
			res.push((line = lines[l++]));
		};var out = res;
		
		if (gutter) {
			out = out.map(function(line,i) {
				let prefix = ("" + (ln0 + i + 1));
				while (prefix.length < String(ln1).length){
					prefix = (" " + prefix);
				};
				if (i == lni) {
					return ("   -> " + prefix + " | " + line);
				} else {
					return ("      " + prefix + " | " + line);
				};
			});
		};
		
		out[lni] = colorize(out[lni]);
		
		if (details) {
			out.unshift(colorize(this.message));
		};
		
		return out.join('\n') + '\n';
	} catch (e) {
		return "";
	};
};

ImbaParseError.prototype.prettyMessage = function (){
	var excerpt;
	return excerpt = this.excerpt();
};

function ImbaTraverseError(){ return ImbaParseError.apply(this,arguments) };

subclass$(ImbaTraverseError,ImbaParseError);

ImbaTraverseError.prototype.loc = function (){
	return this._loc;
};

ImbaTraverseError.prototype.excerpt = function (){
	var excerpt = ImbaTraverseError.prototype.__super__.excerpt.apply(this,arguments);
	return excerpt + '\n---\n' + this.error.stack;
};

export { ImbaParseError, ImbaTraverseError };
