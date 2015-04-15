(function(){


	/* @class Token */
	function Token(type,value,line,region){
		this._type = type;
		this._value = value;
		this._line = line || 0;
		this._region = region;
		return this;
	};
	
	exports.Token = Token; // export class 
	Token.prototype.generated = false;
	Token.prototype.reserved = false;
	Token.prototype.newLine = false;
	Token.prototype.spaced = false;
	
	
	
	Token.prototype.type = function (){
		return this._type;
	};
	
	Token.prototype.value = function (){
		return this._value;
	};
	
	Token.prototype.loc = function (){
		return this._region;
	};
	
	Token.prototype.traverse = function (){
		return;
	};
	
	Token.prototype.c = function (){
		return "" + this._value;
	};
	
	Token.prototype.toString = function (){
		return "" + this._value;
	};
	
	// added for legacy reasons
	Token.prototype.charAt = function (i){
		return this._value.charAt(i);
	};
	
	Token.prototype.slice = function (i){
		return this._value.slice(i);
	};
	
	
	
	function lex(){
		var line;
		var token = this.tokens[(this.pos)++];
		var ttag,loc;
		
		if(token) {
			ttag = token._type;
			this.yytext = token;// .@value
			
			if(line = token._line) {
				this.yylineno = line;
				this.yylloc.first_line = line;
				this.yylloc.last_line = line;
			};
		} else {
			ttag = '';
		};
		
		return ttag;
	}; exports.lex = lex;
	
	
	function token(typ,val,line,region){
		return new Token(typ,val,line,region);
	}; exports.token = token;// [null,typ,val,loc]
	function typ(tok){
		return tok._type;
	}; exports.typ = typ;
	function val(tok){
		return tok._value;
	}; exports.val = val;// tok[offset + 1]
	function loc(tok){
		return tok._region;
	}; exports.loc = loc;// tok[offset + 2]
	
	function setTyp(tok,v){
		return tok._type = v;
	}; exports.setTyp = setTyp;
	function setVal(tok,v){
		return tok._value = v;
	}; exports.setVal = setVal;
	function setLoc(tok,v){
		return tok._region = v;
	}; exports.setLoc = setLoc;


}())