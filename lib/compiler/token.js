(function(){
	
	
	var TOK = exports.TOK = {};
	var TTERMINATOR = TOK.TERMINATOR = 1;
	var TIDENTIFIER = TOK.IDENTIFIER = TOK.IVAR = 2;
	var CONST = TOK.CONST = 3;
	var VAR = TOK.VAR = 4;
	var IF = TOK.IF = 5;
	var ELSE = TOK.ELSE = 6;
	var DEF = TOK.DEF = 7;
	
	function Token(type,value,loc,len){
		this._type = type;
		this._value = value;
		this._loc = (loc != null) ? loc : (-1);
		this._len = len || 0;
		this._meta = null;
		this.generated = false;
		this.newLine = false;
		this.spaced = false;
		this.call = false;
		return this;
	};
	
	exports.Token = Token; // export class 
	Token.prototype.type = function (){
		return this._type;
	};
	
	Token.prototype.value = function (){
		return this._value;
	};
	
	Token.prototype.traverse = function (){
		return;
	};
	
	Token.prototype.c = function (){
		return "" + this._value;
	};
	
	Token.prototype.toString = function (){
		return this._value;
	};
	
	Token.prototype.charAt = function (i){
		return this._value.charAt(i);
	};
	
	Token.prototype.slice = function (i){
		return this._value.slice(i);
	};
	
	Token.prototype.region = function (){
		return [this._loc,this._loc + (this._len || this._value.length)];
	};
	
	Token.prototype.sourceMapMarker = function (){
		return (this._loc == -1) ? ':' : (("%$" + (this._loc) + "$%"));
		// @col == -1 ? '' : "%%{@line}${@col}%%"
	};
	
	
	function lex(){
		var token = this.tokens[this.pos++];
		var ttag;
		
		if (token) {
			ttag = token._type;
			this.yytext = token;
		} else {
			ttag = '';
		};
		
		return ttag;
	}; exports.lex = lex;
	
	
	// export def token typ, val, line, col, len do Token.new(typ,val,line, col or 0, len or 0) # [null,typ,val,loc]
	function token(typ,val){
		return new Token(typ,val,-1,0);
	}; exports.token = token;
	
	function typ(tok){
		return tok._type;
	}; exports.typ = typ;
	function val(tok){
		return tok._value;
	}; exports.val = val; // tok[offset + 1]
	function line(tok){
		return tok._line;
	}; exports.line = line; // tok[offset + 2]
	function loc(tok){
		return tok._loc;
	}; exports.loc = loc; // tok[offset + 2]
	
	function setTyp(tok,v){
		return tok._type = v;
	}; exports.setTyp = setTyp;
	function setVal(tok,v){
		return tok._value = v;
	}; exports.setVal = setVal;
	function setLine(tok,v){
		return tok._line = v;
	}; exports.setLine = setLine;
	function setLoc(tok,v){
		return tok._loc = v;
	}; exports.setLoc = setLoc;
	
	
	var LBRACKET = exports.LBRACKET = new Token('{','{',0,0,0);
	var RBRACKET = exports.RBRACKET = new Token('}','}',0,0,0);
	
	var LPAREN = exports.LPAREN = new Token('(','(',0,0,0);
	var RPAREN = exports.RPAREN = new Token(')',')',0,0,0);
	
	LBRACKET.generated = true;
	RBRACKET.generated = true;
	LPAREN.generated = true;
	RPAREN.generated = true;
	
	var INDENT = exports.INDENT = new Token('INDENT','2',0,0,0);
	var OUTDENT = exports.OUTDENT = new Token('OUTDENT','2',0,0,0);

})();