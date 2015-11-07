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
	
	// create separate error-types with all the logic
	
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
		for (var i = 0, keys = Object.keys(opts), l = keys.length; i < l; i++){
			this._options[keys[i]] = opts[keys[i]];
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
		// var tok = o:tokens and o:tokens[o:pos - 1]
		// var loc = tok and [tok.@loc,tok.@loc + (tok.@len or tok.@value:length)] or [0,0]
		// , col: tok.@col, line: tok.@line
		// get the token itself?
		return {warn: true,message: this.desc(),loc: this.loc()};
	};
	return ImbaParseError;

})()