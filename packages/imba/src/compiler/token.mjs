var self = {};
// imba$inlineHelpers=1
// imba$v2=0

var TOK = {};
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
	this._len = (len != null) ? len : ((this._value.length)); // or 0
	this._meta = null;
	this.generated = false;
	this.newLine = false;
	this.spaced = false;
	this.call = false;
	return this;
};


Token.prototype.type = function (){
	return this._type;
};

Token.prototype.value = function (){
	return this._value;
};

Token.prototype.traverse = function (){
	return;
};

Token.prototype.match = function (regex){
	return this._value.match(regex);
};

Token.prototype.c = function (){
	return "" + this._value;
};

Token.prototype.prepend = function (str){
	this._value = str + this._value;
	return this;
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

Token.prototype.cloneSlice = function (i,type){
	return new Token((type || this._type),this.slice(i),this._loc + i,this._len - i);
};

Token.prototype.region = function (){
	return [this._loc,this._loc + this._len]; //  or @value:length)
};

Token.prototype.startLoc = function (){
	return this._loc;
};

Token.prototype.endLoc = function (){
	return this._loc + this._len; // or @value:length)
};

Token.prototype.loc = function (){
	return [this._loc,this.endLoc()];
};

var lex = self.lex = function (){
	var token = this.tokens[this.pos++];
	var ttag;
	
	if (token) {
		ttag = token._type;
		this.yytext = token;
	} else {
		ttag = '';
	};
	
	return ttag;
};

// export def token typ, val, line, col, len do Token.new(typ,val,line, col or 0, len or 0) # [null,typ,val,loc]
var token = self.token = function (typ,val){
	return new Token(typ,val,-1,0);
};

var typ = self.typ = function (tok){
	return tok._type;
};
var val = self.val = function (tok){
	return tok._value;
}; // tok[offset + 1]
var line = self.line = function (tok){
	return tok._line;
}; // tok[offset + 2]
var loc = self.loc = function (tok){
	return tok._loc;
}; // tok[offset + 2]

var setTyp = self.setTyp = function (tok,v){
	return tok._type = v;
};
var setVal = self.setVal = function (tok,v){
	return tok._value = v;
};
var setLine = self.setLine = function (tok,v){
	return tok._line = v;
};
var setLoc = self.setLoc = function (tok,v){
	return tok._loc = v;
};

var LBRACKET = new Token('{','{',0,0,0);
var RBRACKET = new Token('}','}',0,0,0);

var LPAREN = new Token('(','(',0,0,0);
var RPAREN = new Token(')',')',0,0,0);

LBRACKET.generated = true;
RBRACKET.generated = true;
LPAREN.generated = true;
RPAREN.generated = true;

var INDENT = new Token('INDENT','2',0,0,0);
var OUTDENT = new Token('OUTDENT','2',0,0,0);

export { INDENT, LBRACKET, LPAREN, OUTDENT, RBRACKET, RPAREN, TOK, Token, lex, line, loc, setLine, setLoc, setTyp, setVal, token, typ, val };
