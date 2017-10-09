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

// create separate error-types with all the logic

var util = require('./helpers');

function ImbaParseError(e,o){
	this.error = e;
	this.message = e.message;
	this.filename = e.filename;
	this.line = e.line;
	this._options = o || {};
	this;
};

subclass$(ImbaParseError,Error);
exports.ImbaParseError = ImbaParseError; // export class 
ImbaParseError.wrap = function (err){
	// what about the stacktrace?
	return new ImbaParseError(err);
};

ImbaParseError.prototype.set = function (opts){
	this._options || (this._options = {});
	for (var v, i = 0, keys = Object.keys(opts), l = keys.length, k; i < l; i++){
		k = keys[i];v = opts[k];this._options[k] = v;
	};
	return this;
};

ImbaParseError.prototype.start = function (){
	var o = this._options;
	var idx = o.pos - 1;
	var tok = o.tokens && o.tokens[idx];
	while (tok && tok._loc == -1){
		tok = o.tokens[--idx];
	};
	return tok;
};

ImbaParseError.prototype.desc = function (){
	var o = this._options;
	var msg = this.message;
	if (o.token && o.token._loc == -1) {
		return 'Syntax Error';
	} else {
		return msg;
	};
};

ImbaParseError.prototype.loc = function (){
	var start_;
	return (start_ = this.start()) && start_.region  &&  start_.region();
};

ImbaParseError.prototype.toJSON = function (){
	var o = this._options;
	var tok = this.start();
	return {warn: true,message: this.desc(),loc: this.loc()};
};

ImbaParseError.prototype.excerpt = function (pars){
	
	if(!pars||pars.constructor !== Object) pars = {};
	var gutter = pars.gutter !== undefined ? pars.gutter : true;
	var colors = pars.colors !== undefined ? pars.colors : false;
	var details = pars.details !== undefined ? pars.details : true;
	var code = this._code;
	var loc = this.loc();
	var lines = code.split(/\n/g);
	var locmap = util.locationToLineColMap(code);
	var lc = locmap[loc[0]] || [0,0];
	var ln = lc[0];
	var col = lc[1];
	var line = lines[ln];
	
	var ln0 = Math.max(0,ln - 2);
	var ln1 = Math.min(ln0 + 5,lines.length);
	var lni = ln - ln0;
	var l = ln0;
	
	var res = [];while (l < ln1){
		res.push((line = lines[l++]));
	};var out = res;
	
	if (gutter) {
		out = out.map(function(line,i) {
			var prefix = ("" + (ln0 + i + 1));
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
	
	if (colors) {
		out[lni] = util.ansi.red(util.ansi.bold(out[lni]));
	};
	
	if (details) {
		out.unshift(this.message);
	};
	
	return out.join('\n');
};

ImbaParseError.prototype.prettyMessage = function (){
	var excerpt;
	return excerpt = this.excerpt();
};
