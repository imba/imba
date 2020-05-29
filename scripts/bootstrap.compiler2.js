(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory();
	else if(typeof define === 'function' && define.amd)
		define([], factory);
	else if(typeof exports === 'object')
		exports["imbac"] = factory();
	else
		root["imbac"] = factory();
})(typeof self !== 'undefined' ? self : this, function() {
return /******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, { enumerable: true, get: getter });
/******/ 		}
/******/ 	};
/******/
/******/ 	// define __esModule on exports
/******/ 	__webpack_require__.r = function(exports) {
/******/ 		if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 			Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 		}
/******/ 		Object.defineProperty(exports, '__esModule', { value: true });
/******/ 	};
/******/
/******/ 	// create a fake namespace object
/******/ 	// mode & 1: value is a module id, require it
/******/ 	// mode & 2: merge all properties of value into the ns
/******/ 	// mode & 4: return value when already ns object
/******/ 	// mode & 8|1: behave like require
/******/ 	__webpack_require__.t = function(value, mode) {
/******/ 		if(mode & 1) value = __webpack_require__(value);
/******/ 		if(mode & 8) return value;
/******/ 		if((mode & 4) && typeof value === 'object' && value && value.__esModule) return value;
/******/ 		var ns = Object.create(null);
/******/ 		__webpack_require__.r(ns);
/******/ 		Object.defineProperty(ns, 'default', { enumerable: true, value: value });
/******/ 		if(mode & 2 && typeof value != 'string') for(var key in value) __webpack_require__.d(ns, key, function(key) { return value[key]; }.bind(null, key));
/******/ 		return ns;
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports, __webpack_require__) {

var self = {};




var T = __webpack_require__(1);
var util = __webpack_require__(2);
var lexer = __webpack_require__(5);
var rewriter = __webpack_require__(8);
var parser = exports.parser = __webpack_require__(9).parser;
var ast = __webpack_require__(10);

var ImbaParseError = __webpack_require__(7).ImbaParseError;


var lex = exports.lex = new (lexer.Lexer)();
var css = exports.css = __webpack_require__(11);
var Rewriter = exports.Rewriter = rewriter.Rewriter;
var helpers = exports.helpers = util;
rewriter = new Rewriter();

parser.lexer = lex.jisonBridge();
parser.yy = ast; 


exports.tokenize = self.tokenize = function (code,o){
	if(o === undefined) o = {};
	try {
		// console.log('tokenize') if o:profile
		if (o.profile) { console.time('tokenize') };
		o._source = code;
		lex.reset();
		var tokens = lex.tokenize(code,o);
		if (o.profile) { console.timeEnd('tokenize') };
		
		if (o.rewrite !== false) {
			tokens = rewriter.rewrite(tokens,o);
		};
		return tokens;
	} catch (err) {
		throw err;
	};
};

exports.rewrite = self.rewrite = function (tokens,o){
	if(o === undefined) o = {};
	try {
		if (o.profile) { console.time('rewrite') };
		tokens = rewriter.rewrite(tokens,o);
		if (o.profile) { console.timeEnd('rewrite') };
	} catch (err) {
		throw err;
	};
	return tokens;
};


exports.parse = self.parse = function (code,o){
	if(o === undefined) o = {};
	var tokens = (code instanceof Array) ? code : self.tokenize(code,o);
	try {
		if (tokens != code) o._source || (o._source = code);
		o._tokens = tokens;
		return parser.parse(tokens);
	} catch (err) {
		err._code = code;
		if (o.filename) { err._filename = o.filename };
		throw err;
	};
};

exports.compile = self.compile = function (code,o){
	if(o === undefined) o = {};
	try {
		// check if code is completely blank
		if (!/\S/.test(code)) {
			return {
				js: "",
				toString: function() { return this.js; }
			};
		};
		var tokens = self.tokenize(code,o);
		var ast = self.parse(tokens,o);
		return ast.compile(o);
	} catch (err) {
		err._code = code;
		if (o.filename) { err._filename = o.filename };
		if (o.evaling) {
			console.log(("error compiling " + (o.filename)));
			if (err.excerpt) {
				console.log("   " + err.excerpt({colors: true}));
			} else {
				console.log("   " + err.message);
				console.log("   " + ("in file " + (err._filename)));
				if (err.stack) { console.log(err.stack) };
			};
			
		} else if (!o.silent) {
			console.log(("error compiling " + (o.filename)));
		};
		
		throw err;
	};
};

exports.analyze = self.analyze = function (code,o){
	if(o === undefined) o = {};
	var meta;
	try {
		var ast = self.parse(code,o);
		meta = ast.analyze(o);
	} catch (e) {
		if (!((e instanceof ImbaParseError))) {
			if (e.lexer) {
				e = new ImbaParseError(e,{tokens: e.lexer.tokens,pos: e.lexer.pos});
			} else {
				throw e;
			};
		};
		meta = {warnings: [e]};
	};
	return meta;
};


/***/ }),
/* 1 */
/***/ (function(module, exports) {

var self = {};



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
	this._len = (len != null) ? len : ((this._value.length)); 
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

Token.prototype.region = function (){
	return [this._loc,this._loc + this._len]; 
};

Token.prototype.startLoc = function (){
	return this._loc;
};

Token.prototype.endLoc = function (){
	return this._loc + this._len; 
};

exports.lex = self.lex = function (){
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



exports.token = self.token = function (typ,val){
	return new Token(typ,val,-1,0);
};

exports.typ = self.typ = function (tok){
	return tok._type;
};
exports.val = self.val = function (tok){
	return tok._value;
}; 
exports.line = self.line = function (tok){
	return tok._line;
}; 
exports.loc = self.loc = function (tok){
	return tok._loc;
}; 

exports.setTyp = self.setTyp = function (tok,v){
	return tok._type = v;
};
exports.setVal = self.setVal = function (tok,v){
	return tok._value = v;
};
exports.setLine = self.setLine = function (tok,v){
	return tok._line = v;
};
exports.setLoc = self.setLoc = function (tok,v){
	return tok._loc = v;
};


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


/***/ }),
/* 2 */
/***/ (function(module, exports, __webpack_require__) {

function iter$(a){ return a ? (a.toArray ? a.toArray() : a) : []; };
var self = {};


var sha1 = __webpack_require__(3);

var ansiMap = {
	reset: [0,0],
	bold: [1,22],
	dim: [2,22],
	italic: [3,23],
	underline: [4,24],
	inverse: [7,27],
	hidden: [8,28],
	strikethrough: [9,29],
	
	black: [30,39],
	red: [31,39],
	green: [32,39],
	yellow: [33,39],
	blue: [34,39],
	magenta: [35,39],
	cyan: [36,39],
	white: [37,39],
	gray: [90,39],
	
	redBright: [91,39],
	greenBright: [92,39],
	yellowBright: [93,39],
	blueBright: [94,39],
	magentaBright: [95,39],
	cyanBright: [96,39],
	whiteBright: [97,39]
};

var ansi = exports.ansi = {
	bold: function(text) { return '\u001b[1m' + text + '\u001b[22m'; },
	red: function(text) { return '\u001b[31m' + text + '\u001b[39m'; },
	green: function(text) { return '\u001b[32m' + text + '\u001b[39m'; },
	yellow: function(text) { return '\u001b[33m' + text + '\u001b[39m'; },
	gray: function(text) { return '\u001b[90m' + text + '\u001b[39m'; },
	white: function(text) { return '\u001b[37m' + text + '\u001b[39m'; },
	f: function(name,text) {
		let pair = ansiMap[name];
		return '\u001b[' + pair[0] + 'm' + text + '\u001b[' + pair[1] + 'm';
	}
};

ansi.warn = ansi.yellow;
ansi.error = ansi.red;

exports.brace = self.brace = function (str){
	var lines = str.match(/\n/);
	
	
	if (lines) {
		return '{' + str + '\n}';
	} else {
		return '{\n' + str + '\n}';
	};
};

exports.normalizeIndentation = self.normalizeIndentation = function (str){
	var m;
	var reg = /\n+([^\n\S]*)/g;
	var ind = null;
	
	var length_;while (m = reg.exec(str)){
		var attempt = m[1];
		if (ind === null || 0 < (length_ = attempt.length) && length_ < ind.length) {
			ind = attempt;
		};
	};
	
	if (ind) { str = str.replace(RegExp(("\\n" + ind),"g"),'\n') };
	return str;
};

exports.flatten = self.flatten = function (arr){
	var out = [];
	arr.forEach(function(v) { return (v instanceof Array) ? out.push.apply(out,self.flatten(v)) : out.push(v); });
	return out;
};

exports.clearLocationMarkers = self.clearLocationMarkers = function (str){
	return str.replace(/\/\*\%([\w\|]*)\$\*\//g,'');
};

exports.pascalCase = self.pascalCase = function (str){
	return str.replace(/(^|[\-\_\s])(\w)/g,function(m,v,l) { return l.toUpperCase(); });
};

exports.camelCase = self.camelCase = function (str){
	str = String(str);
	
	return str.replace(/([\-\_\s])(\w)/g,function(m,v,l) { return l.toUpperCase(); });
};

exports.dashToCamelCase = self.dashToCamelCase = function (str){
	str = String(str);
	if (str.indexOf('-') >= 0) {
		// should add shortcut out
		str = str.replace(/([\-\s])(\w)/g,function(m,v,l) { return l.toUpperCase(); });
	};
	return str;
};

exports.snakeCase = self.snakeCase = function (str){
	var str = str.replace(/([\-\s])(\w)/g,'_');
	return str.replace(/()([A-Z])/g,"_$1",function(m,v,l) { return l.toUpperCase(); });
};

exports.dasherize = self.dasherize = function (str){
	return str.replace(/([a-z\d])([A-Z])/g,"$1-$2").toLowerCase();
};

exports.setterSym = self.setterSym = function (sym){
	return self.dashToCamelCase(("set-" + sym));
};

exports.quote = self.quote = function (str){
	return '"' + str + '"';
};

exports.singlequote = self.singlequote = function (str){
	return "'" + str + "'";
};

exports.symbolize = self.symbolize = function (str){
	str = String(str);
	var end = str.charAt(str.length - 1);
	
	if (end == '=') {
		str = 'set' + str[0].toUpperCase() + str.slice(1,-1);
	} else if (end == '?') {
		str = 'is' + str[0].toUpperCase() + str.slice(1,-1);
	} else if (end == '!') {
		str = 'do' + str[0].toUpperCase() + str.slice(1,-1);
	};
	
	if (str.indexOf("-") >= 0) {
		str = str.replace(/([\-\s])(\w)/g,function(m,v,l) { return l.toUpperCase(); });
	};
	
	return str;
};


exports.indent = self.indent = function (str){
	return String(str).replace(/^/g,"\t").replace(/\n/g,"\n\t").replace(/\n\t$/g,"\n");
};

exports.bracketize = self.bracketize = function (str,ind){
	if(ind === undefined) ind = true;
	if (ind) { str = "\n" + self.indent(str) + "\n" };
	return '{' + str + '}';
};

exports.parenthesize = self.parenthesize = function (str){
	return '(' + String(str) + ')';
};

exports.unionOfLocations = self.unionOfLocations = function (){
	var $0 = arguments, i = $0.length;
	var locs = new Array(i>0 ? i : 0);
	while(i>0) locs[i-1] = $0[--i];
	var a = Infinity;
	var b = -Infinity;
	
	for (let i = 0, items = iter$(locs), len = items.length, loc; i < len; i++) {
		loc = items[i];
		if (loc && loc._loc != undefined) {
			loc = loc._loc;
		};
		
		if (loc && (loc.loc instanceof Function)) {
			loc = loc.loc();
		};
		
		if (loc instanceof Array) {
			if (a > loc[0]) { a = loc[0] };
			if (b < loc[0]) { b = loc[1] };
		} else if ((typeof loc=='number'||loc instanceof Number)) {
			if (a > loc) { a = loc };
			if (b < loc) { b = loc };
		};
	};
	
	return [a,b];
};



exports.locationToLineColMap = self.locationToLineColMap = function (code){
	var lines = code.split(/\n/g);
	var map = [];
	
	var chr;
	var loc = 0;
	var col = 0;
	var line = 0;
	
	while (chr = code[loc]){
		map[loc] = [line,col];
		
		if (chr == '\n') {
			line++;
			col = 0;
		} else {
			col++;
		};
		
		loc++;
	};
	
	map[loc] = [line,col];
	map[loc + 1] = [line,col];
	return map;
};

exports.markLineColForTokens = self.markLineColForTokens = function (tokens,code){
	return self;
};

exports.parseArgs = self.parseArgs = function (argv,o){
	var env_;
	if(o === undefined) o = {};
	var aliases = o.alias || (o.alias = {});
	var groups = o.group || (o.group = []);
	var schema = o.schema || {};
	
	schema.main = {};
	
	var options = {};
	var explicit = {};
	argv = argv || process.argv.slice(2);
	var curr = null;
	var i = 0;
	var m;
	
	while ((i < argv.length)){
		var arg = argv[i];
		i++;
		
		if (m = arg.match(/^\-([a-zA-Z]+)(\=\S+)?$/)) {
			curr = null;
			let chars = m[1].split('');
			
			for (let i = 0, items = iter$(chars), len = items.length, item; i < len; i++) {
				// console.log "parsing {item} at {i}",aliases
				item = items[i];
				var key = aliases[item] || item;
				chars[i] = key;
				options[key] = true;
			};
			
			if (chars.length == 1) {
				curr = chars;
			};
			
			continue;
		} else if (m = arg.match(/^\-\-([a-z0-9\-\_A-Z]+)(\=\S+)?$/)) {
			var val = true;
			key = m[1];
			
			if (key.indexOf('no-') == 0) {
				key = key.substr(3);
				val = false;
			};
			
			key = self.dashToCamelCase(key);
			
			if (m[2]) {
				val = m[2].slice(1);
			};
			
			options[key] = val;
			curr = key;
			continue;
		} else {
			var desc = schema[curr];
			
			if (!(curr && schema[curr])) {
				curr = 'main';
			};
			
			if (arg.match(/^\d+$/)) {
				arg = parseInt(arg);
			};
			
			val = options[curr];
			if (val == true || val == false) {
				options[curr] = arg;
			} else if ((typeof val=='string'||val instanceof String) || (typeof val=='number'||val instanceof Number)) {
				options[curr] = [val].concat(arg);
			} else if (val instanceof Array) {
				val.push(arg);
			} else {
				options[curr] = arg;
			};
			
			if (!(desc && desc.multi)) {
				curr = 'main';
			};
		};
	};
	
	for (let j = 0, items = iter$(groups), len = items.length; j < len; j++) {
		let name = self.dashToCamelCase(items[j]);
		for (let v, i_ = 0, keys = Object.keys(options), l = keys.length, k; i_ < l; i_++){
			k = keys[i_];v = options[k];if (k.indexOf(name) == 0) {
				let key = k.substr(name.length).replace(/^\w/,function(m) { return m.toLowerCase(); });
				if (key) {
					options[name] || (options[name] = {});
					options[name][key] = v;
				} else {
					options[name] || (options[name] = {});
				};
			};
		};
	};
	
	if ((typeof (env_ = options.env)=='string'||env_ instanceof String)) {
		options[("ENV_" + (options.env))] = true;
	};
	
	return options;
};

exports.printExcerpt = self.printExcerpt = function (code,loc,pars){
	if(!pars||pars.constructor !== Object) pars = {};
	var hl = pars.hl !== undefined ? pars.hl : false;
	var gutter = pars.gutter !== undefined ? pars.gutter : true;
	var type = pars.type !== undefined ? pars.type : 'warn';
	var pad = pars.pad !== undefined ? pars.pad : 2;
	var lines = code.split(/\n/g);
	var locmap = self.locationToLineColMap(code);
	var lc = locmap[loc[0]] || [0,0];
	var ln = lc[0];
	var col = lc[1];
	var line = lines[ln];
	
	var ln0 = Math.max(0,ln - pad);
	var ln1 = Math.min(ln0 + pad + 1 + pad,lines.length);
	let lni = ln - ln0;
	var l = ln0;
	
	var res1 = [];while (l < ln1){
		res1.push(lines[l++]);
	};var out = res1;
	
	if (gutter) {
		out = out.map(function(line,i) {
			let prefix = ("" + (ln0 + i + 1));
			let str;
			while (prefix.length < String(ln1).length){
				prefix = (" " + prefix);
			};
			if (i == lni) {
				str = ("   -> " + prefix + " | " + line);
				if (hl) { str = ansi.f(hl,str) };
			} else {
				str = ("      " + prefix + " | " + line);
				if (hl) { str = ansi.f('gray',str) };
			};
			return str;
		});
	};
	
	
	
	
	
	
	
	let res = out.join('\n');
	return res;
};

exports.printWarning = self.printWarning = function (code,warn){
	let msg = warn.message; 
	let excerpt = self.printExcerpt(code,warn.loc,{hl: 'whiteBright',type: 'warn',pad: 1});
	return msg + '\n' + excerpt;
};

exports.identifierForPath = self.identifierForPath = function (str){
	var hash = sha1.create();
	hash.update(str);
	var id = hash.b32().replace(/^\d+/,'');
	return id.slice(0,6);
};


/***/ }),
/* 3 */
/***/ (function(module, exports, __webpack_require__) {

var __WEBPACK_AMD_DEFINE_RESULT__;/*
 * [js-sha1]{@link https://github.com/emn178/js-sha1}
 *
 * @version 0.6.0
 * @author Chen, Yi-Cyuan [emn178@gmail.com]
 * @copyright Chen, Yi-Cyuan 2014-2017
 * @license MIT
 */
/*jslint bitwise: true */
(function() {
  'use strict';

  var root = typeof window === 'object' ? window : {};
  var NODE_JS = !root.JS_SHA1_NO_NODE_JS && typeof process === 'object' && process.versions && process.versions.node;
  if (NODE_JS) {
    root = global;
  }
  var COMMON_JS = !root.JS_SHA1_NO_COMMON_JS && typeof module === 'object' && module.exports;
  var AMD =  true && __webpack_require__(4);
  var HEX_CHARS = '0123456789abcdef'.split('');
  var EXTRA = [-2147483648, 8388608, 32768, 128];
  var SHIFT = [24, 16, 8, 0];
  var OUTPUT_TYPES = ['hex', 'array', 'digest', 'arrayBuffer'];

  var blocks = [];

  var createOutputMethod = function (outputType) {
    return function (message) {
      return new Sha1(true).update(message)[outputType]();
    };
  };

  var createMethod = function () {
    var method = createOutputMethod('hex');
    if (NODE_JS) {
      method = nodeWrap(method);
    }
    method.create = function () {
      return new Sha1();
    };
    method.update = function (message) {
      return method.create().update(message);
    };
    for (var i = 0; i < OUTPUT_TYPES.length; ++i) {
      var type = OUTPUT_TYPES[i];
      method[type] = createOutputMethod(type);
    }
    return method;
  };

  var nodeWrap = function (method) {
    var crypto = eval("require('crypto')");
    var Buffer = eval("require('buffer').Buffer");
    var nodeMethod = function (message) {
      if (typeof message === 'string') {
        return crypto.createHash('sha1').update(message, 'utf8').digest('hex');
      } else if (message.constructor === ArrayBuffer) {
        message = new Uint8Array(message);
      } else if (message.length === undefined) {
        return method(message);
      }
      return crypto.createHash('sha1').update(new Buffer(message)).digest('hex');
    };
    return nodeMethod;
  };

  function Sha1(sharedMemory) {
    if (sharedMemory) {
      blocks[0] = blocks[16] = blocks[1] = blocks[2] = blocks[3] =
      blocks[4] = blocks[5] = blocks[6] = blocks[7] =
      blocks[8] = blocks[9] = blocks[10] = blocks[11] =
      blocks[12] = blocks[13] = blocks[14] = blocks[15] = 0;
      this.blocks = blocks;
    } else {
      this.blocks = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
    }

    this.h0 = 0x67452301;
    this.h1 = 0xEFCDAB89;
    this.h2 = 0x98BADCFE;
    this.h3 = 0x10325476;
    this.h4 = 0xC3D2E1F0;

    this.block = this.start = this.bytes = this.hBytes = 0;
    this.finalized = this.hashed = false;
    this.first = true;
  }

  Sha1.prototype.update = function (message) {
    if (this.finalized) {
      return;
    }
    var notString = typeof(message) !== 'string';
    if (notString && message.constructor === root.ArrayBuffer) {
      message = new Uint8Array(message);
    }
    var code, index = 0, i, length = message.length || 0, blocks = this.blocks;

    while (index < length) {
      if (this.hashed) {
        this.hashed = false;
        blocks[0] = this.block;
        blocks[16] = blocks[1] = blocks[2] = blocks[3] =
        blocks[4] = blocks[5] = blocks[6] = blocks[7] =
        blocks[8] = blocks[9] = blocks[10] = blocks[11] =
        blocks[12] = blocks[13] = blocks[14] = blocks[15] = 0;
      }

      if(notString) {
        for (i = this.start; index < length && i < 64; ++index) {
          blocks[i >> 2] |= message[index] << SHIFT[i++ & 3];
        }
      } else {
        for (i = this.start; index < length && i < 64; ++index) {
          code = message.charCodeAt(index);
          if (code < 0x80) {
            blocks[i >> 2] |= code << SHIFT[i++ & 3];
          } else if (code < 0x800) {
            blocks[i >> 2] |= (0xc0 | (code >> 6)) << SHIFT[i++ & 3];
            blocks[i >> 2] |= (0x80 | (code & 0x3f)) << SHIFT[i++ & 3];
          } else if (code < 0xd800 || code >= 0xe000) {
            blocks[i >> 2] |= (0xe0 | (code >> 12)) << SHIFT[i++ & 3];
            blocks[i >> 2] |= (0x80 | ((code >> 6) & 0x3f)) << SHIFT[i++ & 3];
            blocks[i >> 2] |= (0x80 | (code & 0x3f)) << SHIFT[i++ & 3];
          } else {
            code = 0x10000 + (((code & 0x3ff) << 10) | (message.charCodeAt(++index) & 0x3ff));
            blocks[i >> 2] |= (0xf0 | (code >> 18)) << SHIFT[i++ & 3];
            blocks[i >> 2] |= (0x80 | ((code >> 12) & 0x3f)) << SHIFT[i++ & 3];
            blocks[i >> 2] |= (0x80 | ((code >> 6) & 0x3f)) << SHIFT[i++ & 3];
            blocks[i >> 2] |= (0x80 | (code & 0x3f)) << SHIFT[i++ & 3];
          }
        }
      }

      this.lastByteIndex = i;
      this.bytes += i - this.start;
      if (i >= 64) {
        this.block = blocks[16];
        this.start = i - 64;
        this.hash();
        this.hashed = true;
      } else {
        this.start = i;
      }
    }
    if (this.bytes > 4294967295) {
      this.hBytes += this.bytes / 4294967296 << 0;
      this.bytes = this.bytes % 4294967296;
    }
    return this;
  };

  Sha1.prototype.finalize = function () {
    if (this.finalized) {
      return;
    }
    this.finalized = true;
    var blocks = this.blocks, i = this.lastByteIndex;
    blocks[16] = this.block;
    blocks[i >> 2] |= EXTRA[i & 3];
    this.block = blocks[16];
    if (i >= 56) {
      if (!this.hashed) {
        this.hash();
      }
      blocks[0] = this.block;
      blocks[16] = blocks[1] = blocks[2] = blocks[3] =
      blocks[4] = blocks[5] = blocks[6] = blocks[7] =
      blocks[8] = blocks[9] = blocks[10] = blocks[11] =
      blocks[12] = blocks[13] = blocks[14] = blocks[15] = 0;
    }
    blocks[14] = this.hBytes << 3 | this.bytes >>> 29;
    blocks[15] = this.bytes << 3;
    this.hash();
  };

  Sha1.prototype.hash = function () {
    var a = this.h0, b = this.h1, c = this.h2, d = this.h3, e = this.h4;
    var f, j, t, blocks = this.blocks;

    for(j = 16; j < 80; ++j) {
      t = blocks[j - 3] ^ blocks[j - 8] ^ blocks[j - 14] ^ blocks[j - 16];
      blocks[j] =  (t << 1) | (t >>> 31);
    }

    for(j = 0; j < 20; j += 5) {
      f = (b & c) | ((~b) & d);
      t = (a << 5) | (a >>> 27);
      e = t + f + e + 1518500249 + blocks[j] << 0;
      b = (b << 30) | (b >>> 2);

      f = (a & b) | ((~a) & c);
      t = (e << 5) | (e >>> 27);
      d = t + f + d + 1518500249 + blocks[j + 1] << 0;
      a = (a << 30) | (a >>> 2);

      f = (e & a) | ((~e) & b);
      t = (d << 5) | (d >>> 27);
      c = t + f + c + 1518500249 + blocks[j + 2] << 0;
      e = (e << 30) | (e >>> 2);

      f = (d & e) | ((~d) & a);
      t = (c << 5) | (c >>> 27);
      b = t + f + b + 1518500249 + blocks[j + 3] << 0;
      d = (d << 30) | (d >>> 2);

      f = (c & d) | ((~c) & e);
      t = (b << 5) | (b >>> 27);
      a = t + f + a + 1518500249 + blocks[j + 4] << 0;
      c = (c << 30) | (c >>> 2);
    }

    for(; j < 40; j += 5) {
      f = b ^ c ^ d;
      t = (a << 5) | (a >>> 27);
      e = t + f + e + 1859775393 + blocks[j] << 0;
      b = (b << 30) | (b >>> 2);

      f = a ^ b ^ c;
      t = (e << 5) | (e >>> 27);
      d = t + f + d + 1859775393 + blocks[j + 1] << 0;
      a = (a << 30) | (a >>> 2);

      f = e ^ a ^ b;
      t = (d << 5) | (d >>> 27);
      c = t + f + c + 1859775393 + blocks[j + 2] << 0;
      e = (e << 30) | (e >>> 2);

      f = d ^ e ^ a;
      t = (c << 5) | (c >>> 27);
      b = t + f + b + 1859775393 + blocks[j + 3] << 0;
      d = (d << 30) | (d >>> 2);

      f = c ^ d ^ e;
      t = (b << 5) | (b >>> 27);
      a = t + f + a + 1859775393 + blocks[j + 4] << 0;
      c = (c << 30) | (c >>> 2);
    }

    for(; j < 60; j += 5) {
      f = (b & c) | (b & d) | (c & d);
      t = (a << 5) | (a >>> 27);
      e = t + f + e - 1894007588 + blocks[j] << 0;
      b = (b << 30) | (b >>> 2);

      f = (a & b) | (a & c) | (b & c);
      t = (e << 5) | (e >>> 27);
      d = t + f + d - 1894007588 + blocks[j + 1] << 0;
      a = (a << 30) | (a >>> 2);

      f = (e & a) | (e & b) | (a & b);
      t = (d << 5) | (d >>> 27);
      c = t + f + c - 1894007588 + blocks[j + 2] << 0;
      e = (e << 30) | (e >>> 2);

      f = (d & e) | (d & a) | (e & a);
      t = (c << 5) | (c >>> 27);
      b = t + f + b - 1894007588 + blocks[j + 3] << 0;
      d = (d << 30) | (d >>> 2);

      f = (c & d) | (c & e) | (d & e);
      t = (b << 5) | (b >>> 27);
      a = t + f + a - 1894007588 + blocks[j + 4] << 0;
      c = (c << 30) | (c >>> 2);
    }

    for(; j < 80; j += 5) {
      f = b ^ c ^ d;
      t = (a << 5) | (a >>> 27);
      e = t + f + e - 899497514 + blocks[j] << 0;
      b = (b << 30) | (b >>> 2);

      f = a ^ b ^ c;
      t = (e << 5) | (e >>> 27);
      d = t + f + d - 899497514 + blocks[j + 1] << 0;
      a = (a << 30) | (a >>> 2);

      f = e ^ a ^ b;
      t = (d << 5) | (d >>> 27);
      c = t + f + c - 899497514 + blocks[j + 2] << 0;
      e = (e << 30) | (e >>> 2);

      f = d ^ e ^ a;
      t = (c << 5) | (c >>> 27);
      b = t + f + b - 899497514 + blocks[j + 3] << 0;
      d = (d << 30) | (d >>> 2);

      f = c ^ d ^ e;
      t = (b << 5) | (b >>> 27);
      a = t + f + a - 899497514 + blocks[j + 4] << 0;
      c = (c << 30) | (c >>> 2);
    }

    this.h0 = this.h0 + a << 0;
    this.h1 = this.h1 + b << 0;
    this.h2 = this.h2 + c << 0;
    this.h3 = this.h3 + d << 0;
    this.h4 = this.h4 + e << 0;
  };

  Sha1.prototype.hex = function () {
    this.finalize();

    var h0 = this.h0, h1 = this.h1, h2 = this.h2, h3 = this.h3, h4 = this.h4;

    return HEX_CHARS[(h0 >> 28) & 0x0F] + HEX_CHARS[(h0 >> 24) & 0x0F] +
           HEX_CHARS[(h0 >> 20) & 0x0F] + HEX_CHARS[(h0 >> 16) & 0x0F] +
           HEX_CHARS[(h0 >> 12) & 0x0F] + HEX_CHARS[(h0 >> 8) & 0x0F] +
           HEX_CHARS[(h0 >> 4) & 0x0F] + HEX_CHARS[h0 & 0x0F] +
           HEX_CHARS[(h1 >> 28) & 0x0F] + HEX_CHARS[(h1 >> 24) & 0x0F] +
           HEX_CHARS[(h1 >> 20) & 0x0F] + HEX_CHARS[(h1 >> 16) & 0x0F] +
           HEX_CHARS[(h1 >> 12) & 0x0F] + HEX_CHARS[(h1 >> 8) & 0x0F] +
           HEX_CHARS[(h1 >> 4) & 0x0F] + HEX_CHARS[h1 & 0x0F] +
           HEX_CHARS[(h2 >> 28) & 0x0F] + HEX_CHARS[(h2 >> 24) & 0x0F] +
           HEX_CHARS[(h2 >> 20) & 0x0F] + HEX_CHARS[(h2 >> 16) & 0x0F] +
           HEX_CHARS[(h2 >> 12) & 0x0F] + HEX_CHARS[(h2 >> 8) & 0x0F] +
           HEX_CHARS[(h2 >> 4) & 0x0F] + HEX_CHARS[h2 & 0x0F] +
           HEX_CHARS[(h3 >> 28) & 0x0F] + HEX_CHARS[(h3 >> 24) & 0x0F] +
           HEX_CHARS[(h3 >> 20) & 0x0F] + HEX_CHARS[(h3 >> 16) & 0x0F] +
           HEX_CHARS[(h3 >> 12) & 0x0F] + HEX_CHARS[(h3 >> 8) & 0x0F] +
           HEX_CHARS[(h3 >> 4) & 0x0F] + HEX_CHARS[h3 & 0x0F] +
           HEX_CHARS[(h4 >> 28) & 0x0F] + HEX_CHARS[(h4 >> 24) & 0x0F] +
           HEX_CHARS[(h4 >> 20) & 0x0F] + HEX_CHARS[(h4 >> 16) & 0x0F] +
           HEX_CHARS[(h4 >> 12) & 0x0F] + HEX_CHARS[(h4 >> 8) & 0x0F] +
           HEX_CHARS[(h4 >> 4) & 0x0F] + HEX_CHARS[h4 & 0x0F];
  };

  Sha1.prototype.toString = Sha1.prototype.hex;

  Sha1.prototype.digest = function () {
    this.finalize();

    var h0 = this.h0, h1 = this.h1, h2 = this.h2, h3 = this.h3, h4 = this.h4;

    return [
      (h0 >> 24) & 0xFF, (h0 >> 16) & 0xFF, (h0 >> 8) & 0xFF, h0 & 0xFF,
      (h1 >> 24) & 0xFF, (h1 >> 16) & 0xFF, (h1 >> 8) & 0xFF, h1 & 0xFF,
      (h2 >> 24) & 0xFF, (h2 >> 16) & 0xFF, (h2 >> 8) & 0xFF, h2 & 0xFF,
      (h3 >> 24) & 0xFF, (h3 >> 16) & 0xFF, (h3 >> 8) & 0xFF, h3 & 0xFF,
      (h4 >> 24) & 0xFF, (h4 >> 16) & 0xFF, (h4 >> 8) & 0xFF, h4 & 0xFF
    ];
  };
  
  var alphabet = '0123456789abcdefghjkmnpqrtuvwxyz'
  var alias = { o:0, i:1, l:1, s:5 }

  Sha1.prototype.b32 = function () {
    var bytes = this.digest();
    
    var skip = 0 // how many bits we will skip from the first byte
    var bits = 0 // 5 high bits, carry from one byte to the next
    var out = ''
    
    for (var i = 0; i < bytes.length; ) {
        var byte = bytes[i];

        if (skip < 0) { // we have a carry from the previous byte
            bits |= (byte >> (-skip))
        } else { // no carry
            bits = (byte << skip) & 248
        }

        if (skip > 3) {
            // not enough data to produce a character, get us another one
            skip -= 8;
            i += 1;
            continue
        }

        if (skip < 4) {
            // produce a character
            out += alphabet[bits >> 3]
            skip += 5
        }
    }
    
    out = out + (skip < 0 ? alphabet[bits >> 3] : '')
      
    return out;
  };

  Sha1.prototype.array = Sha1.prototype.digest;

  Sha1.prototype.arrayBuffer = function () {
    this.finalize();

    var buffer = new ArrayBuffer(20);
    var dataView = new DataView(buffer);
    dataView.setUint32(0, this.h0);
    dataView.setUint32(4, this.h1);
    dataView.setUint32(8, this.h2);
    dataView.setUint32(12, this.h3);
    dataView.setUint32(16, this.h4);
    return buffer;
  };

  var exports = createMethod();

  if (COMMON_JS) {
    module.exports = exports;
  } else {
    root.sha1 = exports;
    if (AMD) {
      !(__WEBPACK_AMD_DEFINE_RESULT__ = (function () {
        return exports;
      }).call(exports, __webpack_require__, exports, module),
				__WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));
    }
  }
})();

/***/ }),
/* 4 */
/***/ (function(module, exports) {

/* WEBPACK VAR INJECTION */(function(__webpack_amd_options__) {/* globals __webpack_amd_options__ */
module.exports = __webpack_amd_options__;

/* WEBPACK VAR INJECTION */}.call(this, {}))

/***/ }),
/* 5 */
/***/ (function(module, exports, __webpack_require__) {

function idx$(a,b){
	return (b && b.indexOf) ? b.indexOf(a) : [].indexOf.call(a,b);
};
function iter$(a){ return a ? (a.toArray ? a.toArray() : a) : []; };
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




var T = __webpack_require__(1);
var Token = T.Token;

var INVERSES = __webpack_require__(6).INVERSES;

var K = 0;

var ERR = __webpack_require__(7);
var helpers = __webpack_require__(2);





var JS_KEYWORDS = [
	'true','false','null','this',
	'delete','typeof','in','instanceof',
	'throw','break','continue','debugger',
	'if','else','switch','for','while','do','try','catch','finally',
	'class','extends','super','return'
];










var IMBA_KEYWORDS = [
	'undefined','then','unless','until','loop','of','by',
	'when','def','tag','do','elif','begin','var','let','const','self','await','import','require','module','export','static'
];

var IMBA_CONTEXTUAL_KEYWORDS = ['extend','local','global','prop','lazy'];



var ALL_KEYWORDS = exports.ALL_KEYWORDS = [
	'true','false','null','this',
	'delete','typeof','in','instanceof',
	'throw','break','continue','debugger',
	'if','else','switch','for','while','do','try','catch','finally',
	'class','extends','super','return',
	'undefined','then','unless','until','loop','of','by',
	'when','def','tag','do','elif','begin','var','let','const','self','await','import',
	'and','or','is','isnt','not','yes','no','isa','case','nil','require','module','export','static'
];




var RESERVED = ['case','default','function','void','with','const','enum','native'];
var STRICT_RESERVED = ['case','function','void','const'];



var JS_FORBIDDEN = JS_KEYWORDS.concat(RESERVED);

var METHOD_IDENTIFIER = /^((([\x23]?[\$A-Za-z_\x7f-\uffff][$\-\w\x7f-\uffff]*)([\=]?))|(<=>|\|(?![\|=])))/;




var IDENTIFIER = /^((\$|@)[\$\wA-Za-z_\-\x7f-\uffff][$\w\x7f-\uffff]*(\-[$\w\x7f-\uffff]+)*[\?]?|[$A-Za-z_][$\w\x7f-\uffff]*(\-[$\w\x7f-\uffff]+)*[\?]?)([^\n\S]*:(?![\*\=:$\w\x7f-\uffff]))?/;

var IMPORTS = /^import\s+(\{?[^\"\'\}]+\}?)(?=\s+from\s+)/;

var OBJECT_KEY = /^((\$?)[$A-Za-z_\x7f-\uffff\-][$\w\x7f-\uffff\-]*)([^\n\S\s]*:(?![\*\=:$A-Za-z\_\x7f-\uffff]))/;

var TAG = /^(\<)(?=[A-Za-z\#\.\{\@\>])/;

var TAG_TYPE = /^(\w[\w\d]*:)?(\w[\w\d]*)(-[\w\d]+)*/;
var TAG_ID = /^#((\w[\w\d]*)(-[\w\d]+)*)/;
var TAG_PART = /^[\:\.\#]?([A-Za-z\_][\w\-]*)(\:[A-Za-z\_][\w\-]*)?/;
var TAG_ATTR = /^([\.\:]?[\w\_]+([\-\:\.][\w]+)*)(\s)*\=(?!\>)/;


var SELECTOR = /^([%\$]{1,2})([\(])/;
var SELECTOR_PART = /^(\#|\.|:|::)?([\w]+(\-[\w]+)*)/;
var SELECTOR_COMBINATOR = /^ (\+|\>|\~)*\s*(?=[\w\.\#\:\{\*\[])/;

var SELECTOR_PSEUDO_CLASS = /^(::?)([\w]+(\-[\w]+)*)/;
var SELECTOR_ATTR_OP = /^(\$=|\~=|\^=|\*=|\|=|=|\!=)/;
var SELECTOR_ATTR = /^\[([\w\_\-]+)(\$=|\~=|\^=|\*=|\|=|=|\!=)/;

var SYMBOL = /^\:((([\*\@$\w\x7f-\uffff]+)+([\-\\\:][\w\x7f-\uffff]+)*)|==|\<=\>)/;

var STYLE_HEX = /^\#[0-9a-fA-F]{3,6}/;

var STYLE_NUMERIC = /^(\-?\d*\.?\d+)([A-Za-z]+|\%)?(?![\d\w])/;

var STYLE_IDENTIFIER = /^[\w\-\$]*\w[\w\-\$]*/;

var STYLE_PROPERTY = /^([\w\-\$]*\w[\w\-\$]*)(\.[\w\-\$]*\w[\w\-\$]*)*(?=\:)/;

var NUMBER = /^0x[\da-f]+|^0b[01]+|^\d*\.?\d+(?:e[+-]?\d+)?/i;

var HEREDOC = /^("""|''')([\s\S]*?)(?:\n[^\n\S]*)?\1/;

var OPERATOR = /^(?:[-=]=>|===|---|->|=>|\/>|!==|\*\*=?|[-+*\/%<>&|^!?=]=|=<|>>>=?|([-+:])\1|([&|<>])\2=?|\?\.|\?\:|\.{2,3}|\*(?=[a-zA-Z\_]))/;



var WHITESPACE = /^[^\n\S]+/;

var COMMENT = /^###([^#][\s\S]*?)(?:###[^\n\S]*|(?:###)?$)/;
var JS_COMMENT = /^\/\*([\s\S]*?)\*\//;

var INLINE_COMMENT = /^(\s*)((#[ \t\!]|\/\/)(.*)|#[ \t]?(?=\n|$))+/;

var CODE = /^[-=]=>/;

var MULTI_DENT = /^(?:\n[^\n\S]*)+/;

var SIMPLESTR = /^'[^\\']*(?:\\.[^\\']*)*'/;

var JSTOKEN = /^`[^\\`]*(?:\\.[^\\`]*)*`/;


var REGEX = /^(\/(?![\s=])[^[\/\n\\]*(?:(?:\\[\s\S]|\[[^\]\n\\]*(?:\\[\s\S][^\]\n\\]*)*])[^[\/\n\\]*)*\/)([imgy]{0,4})(?!\w)/;

var HEREGEX = /^\/{3}([\s\S]+?)\/{3}([imgy]{0,4})(?!\w)/;

var HEREGEX_OMIT = /\s+(?:#.*)?/g;


var MULTILINER = /\n/g;

var HEREDOC_INDENT = /\n+([^\n\S]*)/g;

var HEREDOC_ILLEGAL = /\*\//;


var LINE_CONTINUER = /^\s*(?:,|\??\.(?![.\d]))/;

var TRAILING_SPACES = /\s+$/;

var ENV_FLAG = /^\$\w+\$/;

var ARGVAR = /^\$\d$/;


var COMPOUND_ASSIGN = ['-=','+=','/=','*=','%=','||=','&&=','?=','<<=','>>=','>>>=','&=','^=','|=','=<','**='];


var UNARY = ['!','~','NEW','TYPEOF','DELETE'];


var LOGIC = ['&&','||','&','|','^','and','or'];


var SHIFT = ['<<','>>','>>>'];


var COMPARE = ['===','!==','==','!=','<','>','<=','>=','===','!=='];

var MATH = ['*','/','%','∪','∩','√'];


var RELATION = ['IN','OF','INSTANCEOF','ISA'];


var BOOL = ['TRUE','FALSE','NULL','UNDEFINED'];


var NOT_REGEX = ['NUMBER','REGEX','BOOL','TRUE','FALSE','++','--',']'];



var NOT_SPACED_REGEX = ['NUMBER','REGEX','BOOL','TRUE','FALSE','++','--',']',')','}','THIS','SELF','IDENTIFIER','STRING'];






var UNFINISHED = ['\\','.','UNARY','MATH','EXP','+','-','SHIFT','RELATION','COMPARE','COMPOUND_ASSIGN','THROW','EXTENDS'];


var CALLABLE = ['IDENTIFIER','STRING','REGEX',')',']','INDEX_END','THIS','SUPER','TAG_END','IVAR','SELF','NEW','ARGVAR','SYMBOL','RETURN','INDEX_END','CALL_END'];


var INDEXABLE = [
	'IDENTIFIER','STRING','REGEX',')',']','THIS','SUPER','TAG_END','IVAR','SELF','NEW','ARGVAR','SYMBOL','RETURN',
	'NUMBER','BOOL','TAG_SELECTOR','ARGUMENTS','}','TAG_TYPE','TAG_REF','TAGID','INDEX_END','CALL_END'
];

var NOT_KEY_AFTER = ['.','?','?.','UNARY','?:','+','-','*'];

var GLOBAL_IDENTIFIERS = ['global','exports'];




var LINE_BREAK = ['INDENT','OUTDENT','TERMINATOR'];


function LexerError(message,file,line){
	this.message = message;
	this.file = file;
	this.line = line;
	return this;
};
subclass$(LexerError,SyntaxError);
exports.LexerError = LexerError; // export class 




var last = function(array,back) {
	if(back === undefined) back = 0;
	return array[array.length - back - 1];
};

var count = function(str,substr) {
	return str.split(substr).length - 1;
};

var repeatString = function(str,times) {
	var res = '';
	while (times > 0){
		if (times % 2 == 1) {
			res += str;
		};
		str += str;
		times >>= 1;
	};
	return res;
};

var tT = T.typ;
var tV = T.val;
var tTs = T.setTyp;
var tVs = T.setVal;






function Lexer(){
	this.reset();
	this;
};

exports.Lexer = Lexer; // export class 
Lexer.prototype.reset = function (){
	this._code = null;
	this._chunk = null; 
	this._opts = null;
	this._state = {};
	
	this._indent = 0; 
	this._indebt = 0; 
	this._outdebt = 0; 
	
	this._indents = []; 
	this._ends = []; 
	this._contexts = []; 
	this._scopes = [];
	this._nextScope = null; 
	this._context = null;
	
	
	
	this._indentStyle = '\t';
	this._inTag = false;
	this._inStyle = 0;
	
	this._tokens = []; 
	this._seenFor = false;
	this._loc = 0;
	this._locOffset = 0;
	
	this._end = null;
	this._char = null;
	this._bridge = null;
	
	this._last = null;
	this._lastTyp = '';
	this._lastVal = null;
	return this;
};

Lexer.prototype.jisonBridge = function (jison){
	return this._bridge = {
		lex: T.lex,
		setInput: function(tokens) {
			this.tokens = tokens;
			return this.pos = 0;
		},
		
		upcomingInput: function() { return ""; }
	};
};


Lexer.prototype.tokenize = function (code,o){
	
	var m;
	if(o === undefined) o = {};
	if (code.length == 0) {
		return [];
	};
	
	if (!o.inline) {
		if (WHITESPACE.test(code)) {
			code = ("\n" + code);
			if (code.match(/^\s*$/g)) { return [] };
		};
		
		code = code.replace(/\r/g,'').replace(/[\t ]+$/g,'');
	};
	
	this._last = null;
	this._lastTyp = null;
	this._lastVal = null;
	
	this._code = code;
	this._opts = o;
	this._locOffset = o.loc || 0;
	this._target = o.target;
	this._indentStyle = '\t';
	
	
	if (m = code.match(/^([\ \t]*)[^\n\s\t]/)) {
		this._state.gutter = m[1];
	};
	
	if (o.gutter !== undefined) {
		this._state.gutter = o.gutter;
	};
	
	o._tokens = this._tokens;
	
	this.parse(code);
	if (!o.inline) this.closeIndentation();
	
	if (!o.silent && this._ends.length) {
		console.log(this._ends);
		throw this.error(("missing " + (this._ends.pop())));
	};
	
	return this._tokens;
};

Lexer.prototype.parse = function (code){
	var i = 0;
	var pi = 0;
	this._loc = this._locOffset + i;
	
	while (this._chunk = code.slice(i)){
		let ctx = this._context;
		if (ctx && ctx.pop) {
			if (ctx.pop.test(this._chunk)) {
				this.popEnd();
			};
		};
		
		
		pi = (ctx && ctx.lexer && ctx.lexer.call(this)) || (this._end == 'TAG' && this.tagDefContextToken()) || (this._inTag && this.tagContextToken()) || (this._inStyle && this.lexStyleBody()) || this.basicContext();
		i += pi;
		this._loc = this._locOffset + i;
	};
	
	
	return;
};

Lexer.prototype.basicContext = function (){
	return this.selectorToken() || this.symbolToken() || this.identifierToken() || this.whitespaceToken() || this.lineToken() || this.commentToken() || this.heredocToken() || this.tagToken() || this.stringToken() || this.numberToken() || this.regexToken() || this.literalToken() || 0;
};

Lexer.prototype.moveCaret = function (i){
	return this._loc += i;
};

Lexer.prototype.context = function (){
	return this._ends[this._ends.length - 1];
};

Lexer.prototype.inContext = function (key){
	var o = this._contexts[this._contexts.length - 1];
	return o && o[key];
};

Lexer.prototype.pushEnd = function (val,ctx){
	this._ends.push(val);
	this._contexts.push(this._context = (ctx || {}));
	this._end = val;
	this.refreshScope();
	
	if (ctx && (ctx.closeType == 'STYLE_END' || ctx.style)) {
		this._inStyle++;
	};
	
	if (ctx && ctx.id) {
		ctx.start = new Token(ctx.id + '_START',val,this._last.region()[1],0);
		this._tokens.push(ctx.start);
	};
	return this;
};

Lexer.prototype.popEnd = function (val){
	var popped = this._ends.pop();
	this._end = this._ends[this._ends.length - 1];
	
	
	var ctx = this._context;
	if (ctx && ctx.start) {
		ctx.end = new Token(ctx.closeType || ctx.id + '_END',popped,this._last.region()[1],0);
		ctx.end._start = ctx.start;
		ctx.start._end = ctx.end;
		this._tokens.push(ctx.end);
	};
	
	if (ctx && (ctx.closeType == 'STYLE_END' || ctx.style)) {
		this._inStyle--;
	};
	
	this._contexts.pop();
	this._context = this._contexts[this._contexts.length - 1];
	
	this.refreshScope();
	return [popped,ctx];
};

Lexer.prototype.refreshScope = function (){
	var ctx0 = this._ends[this._ends.length - 1];
	var ctx1 = this._ends[this._ends.length - 2];
	return this._inTag = ctx0 == 'TAG_END' || (ctx1 == 'TAG_END' && ctx0 == 'OUTDENT');
};



Lexer.prototype.queueScope = function (val){
	this._scopes[this._indents.length] = val;
	return this;
};

Lexer.prototype.popScope = function (val){
	this._scopes.pop();
	return this;
};

Lexer.prototype.getScope = function (){
	return this._scopes[this._indents.length - 1];
};

Lexer.prototype.scope = function (sym,opts){
	var len = this._ends.push(this._end = sym);
	this._contexts.push(opts || null);
	return sym;
};


Lexer.prototype.closeSelector = function (){
	if (this._end == '%') {
		this.token('SELECTOR_END','%',0);
		return this.pair('%');
	};
};


Lexer.prototype.openDef = function (){
	return this.pushEnd('DEF');
};


Lexer.prototype.closeDef = function (){
	if (this.context() == 'DEF') {
		var prev = last(this._tokens);
		
		if (tT(prev) == 'TERMINATOR') {
			let n = this._tokens.pop();
			this.token('DEF_BODY','DEF_BODY',0);
			this._tokens.push(n);
		} else {
			this.token('DEF_BODY','DEF_BODY',0);
		};
		
		this.pair('DEF');
	};
	return;
};



Lexer.prototype.tagContextToken = function (){
	let chr = this._chunk[0];
	let chr2 = this._chunk[1];
	
	
	let m = /^([A-Za-z\_\-\$][\w\-\$]*(\:[A-Za-z\_\-\$]+)*)/.exec(this._chunk); 
	
	if (m) { // and false
		let tok = m[1];
		let typ = 'TAG_LITERAL';
		let len = m[0].length;
		
		if (tok == 'self' && this._lastVal == '<') {
			typ = 'SELF';
		};
		
		if (chr == '$' && this._lastTyp == 'TAG_TYPE') {
			typ = 'TAG_REF';
		};
		
		this.token(typ,tok,len);
		return len;
	};
	
	if (chr == '/' && chr2 == '>') {
		this.token("TAG_END",'/>',2);
		this.pair('TAG_END');
		return 2;
	};
	
	if (chr == '%' || chr == ':' || chr == '.' || chr == '@') {
		this.token(("T" + chr),chr,1);
		return 1;
	} else if (chr == ' ' || chr == '\n' || chr == '\t') {
		// add whitespace inside tag
		let m = /^[\n\s\t]+/.exec(this._chunk);
		this.token('TAG_WS',m[0],m[0].length);
		return m[0].length;
	} else if (chr == '=' && this._chunk[1] != '>') {
		this.token('=','=',1);
		this.pushEnd('TAG_ATTR',{id: 'VALUE',pop: /^([\s\n\>]|\/\>)/});
		return 1;
	};
	return 0;
};

Lexer.prototype.tagDefContextToken = function (){
	// console.log "tagContextToken"
	var match;
	if (match = TAG_TYPE.exec(this._chunk)) {
		this.token('TAG_TYPE',match[0],match[0].length);
		return match[0].length;
	};
	
	if (match = TAG_ID.exec(this._chunk)) {
		var input = match[0];
		this.token('TAG_ID',input,input.length);
		return input.length;
	};
	
	if (this._chunk[0] == '\n') {
		this.pair('TAG');
	};
	
	return 0;
};

Lexer.prototype.findBalancedSelector = function (str){
	var stack = [];
	var i = 0;
	
	
	while (i < (str.length - 1)){
		var letter = str.charAt(i);
		
		let end = stack[0];
		let instr = end == '"' || end == "'";
		
		if (letter && letter == end) {
			stack.shift();
		} else if (!instr && (letter == ')' || letter == ']' || letter == '}')) {
			console.log('out of balance!!');
			break;
		} else if (letter == '(' && !instr) {
			stack.unshift(')');
		} else if (letter == '[' && !instr) {
			stack.unshift(']');
		} else if (letter == '"') {
			stack.unshift('"');
		} else if (letter == "'") {
			stack.unshift("'");
		};
		
		if (!end && (letter == '=' || letter == '\n' || letter == '{')) {
			break;
		};
		
		i++;
	};
	
	return i ? str.slice(0,i) : null;
};


Lexer.prototype.lexStyleRule = function (offset){
	// when we meet = enter into style context?
	var sel;
	if(offset === undefined) offset = 0;
	let chunk = offset ? this._chunk.slice(offset) : this._chunk;
	
	if (sel = this.findBalancedSelector(chunk)) {
		let len = sel.length;
		this.token('CSS_SEL',sel,len,offset);
		let seltoken = this._last;
		let next = chunk[len];
		
		if (next == '=') {
			len++;
		};
		
		if (this._context) {
			this._context.lexer = null;
		};
		
		this._indents.push(1);
		this._outdebt = this._indebt = 0;
		this.token('INDENT',"1",0,1);
		this.pushEnd('OUTDENT',{lexer: this.lexStyleBody,opener: seltoken,style: true});
		this._indent++;
		return len;
	};
	
	return 0;
};

Lexer.prototype.lexStyleBody = function (){
	if (this._end == '%') { return 0 };
	
	let chr = this._chunk[0];
	var m;
	
	
	
	
	
	
	if (m = (/^[^\n]*\&/).exec(this._chunk)) {
		let sel = this.findBalancedSelector(this._chunk);
		if (sel && sel.indexOf('&') >= 0) {
			return this.lexStyleRule();
		};
	};
	
	if (m = STYLE_PROPERTY.exec(this._chunk)) {
		// what is the last one?
		this.token('CSSPROP',m[0],m[0].length);
		return m[0].length;
	};
	
	if (chr[0] == '#' && (m = STYLE_HEX.exec(this._chunk))) {
		this.token('COLOR',m[0],m[0].length);
		return m[0].length;
	};
	
	if (m = STYLE_NUMERIC.exec(this._chunk)) {
		let len = m[0].length;
		let typ = 'NUMBER';
		
		if (m[2] == '%') {
			typ = 'PERCENTAGE';
			
		} else if (m[2]) {
			typ = 'DIMENSION';
		};
		
		
		
		this.token(typ,m[0],len);
		return len;
	} else if (m = STYLE_IDENTIFIER.exec(this._chunk)) {
		if (m[0].match(/^\-\-/)) {
			this.token('CSSVAR',m[0],m[0].length);
		} else {
			this.token('IDENTIFIER',m[0],m[0].length);
		};
		
		return m[0].length;
	};
	
	return 0;
};


Lexer.prototype.importsToken = function (){
	var match;
	if (match = IMPORTS.exec(this._chunk)) {
		this.token('IMPORTS',match[1],match[1].length,7);
		return match[0].length;
	};
	return 0;
};

Lexer.prototype.tagToken = function (){
	var match, ary;
	if (!(match = TAG.exec(this._chunk))) { return 0 };
	var ary = iter$(match);var input = ary[0],type = ary[1],identifier = ary[2];
	
	if (type == '<') {
		this.token('TAG_START','<',1);
		this.pushEnd(INVERSES.TAG_START);
		
		if (match = TAG_TYPE.exec(this._chunk.substr(1,40))) {
			let next = this._chunk[match[0].length + 1];
			
			if (match[0] != 'self' && (next != '{' && next != '-')) {
				this.token('TAG_TYPE',match[0],match[0].length,1);
				return input.length + match[0].length;
			};
		} else if (this._chunk[1] == '>') {
			this.token('TAG_TYPE','fragment',0,0);
		};
		
		if (identifier) {
			if (identifier.substr(0,1) == '{') {
				return type.length;
			} else {
				this.token('TAG_NAME',input.substr(1),0);
			};
		};
	};
	
	return input.length;
};


Lexer.prototype.selectorToken = function (){
	var ary;
	var match;
	
	
	if (this._end == '%') {
		var chr = this._chunk[0];
		var ctx = this._context;
		
		var i = 0;
		var part = '';
		var ending = false;
		
		while (chr = this._chunk[i++]){
			if (chr == ')' && ctx.parens == 0) {
				ending = true;
				break;
			} else if (chr == '(') {
				ctx.parens++;
				part += '(';
			} else if (chr == ')') {
				ctx.parens--;
				part += ')';
			} else if (chr == '{') {
				break;
			} else {
				part += chr;
			};
		};
		
		
		if (part) {
			this.token('SELECTOR_PART',part,i - 1);
		};
		if (ending) {
			this.token('SELECTOR_END',')',1,i - 1);
			this.pair('%');
			return i;
		};
		return i - 1;
	};
	
	if (!(match = SELECTOR.exec(this._chunk))) { return 0 };
	
	var ary = iter$(match);var input = ary[0],id = ary[1],kind = ary[2];
	
	
	if (kind == '(') {
		// token '(','('
		this.token('SELECTOR_START',id,id.length + 1);
		this.pushEnd('%',{parens: 0});
		return id.length + 1;
	} else if (id == '%') {
		// we are already scoped in on a selector
		if (this.context() == '%') { return 1 };
		this.token('SELECTOR_START',id,id.length);
		
		
		this.pushEnd('%',{open: true});
		
		
		return id.length;
	} else {
		return 0;
	};
};


Lexer.prototype.inTag = function (){
	var len = this._ends.length;
	if (len > 0) {
		var ctx0 = this._ends[len - 1];
		var ctx1 = (len > 1) ? this._ends[len - 2] : ctx0;
		return ctx0 == 'TAG_END' || (ctx1 == 'TAG_END' && ctx0 == 'OUTDENT');
	};
	return false;
};

Lexer.prototype.isKeyword = function (id){
	var m;
	if (this._lastTyp == 'ATTR' || this._lastTyp == 'PROP' || this._lastTyp == 'DEF') {
		return false;
	};
	
	if (id == 'get' || id == 'set') {
		if (m = this._chunk.match(/^[gs]et ([\$\w\-]+)/)) { // ( (do)|\n(\t+))
			let ctx = this._contexts[this._contexts.length - 1] || {};
			let before = ctx.opener && this._tokens[this._tokens.indexOf(ctx.opener) - 1];
			
			if (idx$(this._lastTyp,['TERMINATOR','INDENT']) >= 0) {
				if (before && (before._type == '=' || before._type == '{')) {
					return true;
				};
			};
		};
	};
	
	if ((id == 'guard' || id == 'alter' || id == 'watch') && (this.getScope() == 'PROP')) {
		// console.log 'got here!'
		// only if we are on a newline? or something?
		return true;
	};
	
	if (id == 'struct' && this._indents == 0) {
		return true; 
	};
	
	if ((id == 'attr' || id == 'prop' || id == 'get' || id == 'set' || id == 'lazy' || id == 'css')) {
		var scop = this.getScope();
		var incls = scop == 'CLASS' || scop == 'TAG' || scop == 'STRUCT';
		
		if (id == 'css' && !this._context && (idx$(this._lastTyp,['TERMINATOR']) >= 0 || !this._lastTyp)) {
			return true;
		};
		
		if (id == 'css' && (idx$(this._lastVal,['global','local','export']) >= 0)) {
			return true;
		};
		
		if (id == 'lazy') {
			return incls && idx$(this._lastTyp,['INDENT','TERMINATOR','DECORATOR']) >= 0;
		};
		
		if (incls) { return true };
	};
	
	return ALL_KEYWORDS.indexOf(id) >= 0;
};







Lexer.prototype.identifierToken = function (){
	var ary;
	var match;
	
	var ctx0 = (this._ends.length > 0) ? this._ends[this._ends.length - 1] : null;
	var ctx1 = (this._ends.length > 1) ? this._ends[this._ends.length - 2] : null;
	var innerctx = ctx0;
	var typ;
	var reserved = false;
	
	var addLoc = false;
	var inTag = ctx0 == 'TAG_END' || (ctx1 == 'TAG_END' && ctx0 == 'OUTDENT');
	
	
	
	
	
	if (false) { var id; };
	
	if (!(match = IDENTIFIER.exec(this._chunk))) {
		return 0;
	};
	
	var ary = iter$(match);var input = ary[0],id = ary[1],typ = ary[2],m3 = ary[3],m4 = ary[4],colon = ary[5];
	var idlen = id.length;
	
	
	if (id === 'own' && this.lastTokenType() == 'FOR') {
		this.token('OWN',id,id.length);
		return id.length;
	};
	
	var prev = last(this._tokens);
	var lastTyp = this._lastTyp;
	
	if (lastTyp == '#') {
		this.token('IDENTIFIER',id,idlen);
		return idlen;
	};
	
	var forcedIdentifier = colon || lastTyp == '.' || lastTyp == '?.';
	
	if (colon && lastTyp == '?') { forcedIdentifier = false }; 
	
	
	if (id == 'tag' && this._chunk.indexOf("tag(") == 0) { // @chunk.match(/^tokid\(/)
		forcedIdentifier = true;
	};
	
	var isKeyword = false;
	
	
	if (typ == '$' && ARGVAR.test(id)) {
		// console.log "TYP $"
		if (id == '$0') {
			typ = 'ARGUMENTS';
		} else {
			typ = 'ARGVAR';
			id = id.substr(1);
		};
	} else if (typ == '$' && ENV_FLAG.test(id)) {
		typ = 'ENV_FLAG';
		id = id.toUpperCase(); 
	} else if (typ == '#') {
		typ = 'IVAR';
	} else if (typ == '@') {
		typ = 'DECORATOR';
	} else if (typ == '$' && !colon) {
		typ = 'IDENTIFIER';
	} else if (id == 'elif') {
		this.token('ELSE','elif',id.length);
		this.token('IF','if');
		return id.length;
	} else {
		typ = 'IDENTIFIER';
	};
	
	
	if (!forcedIdentifier && (isKeyword = this.isKeyword(id))) {
		// (id in JS_KEYWORDS or id in IMBA_KEYWORDS)
		
		if (typeof isKeyword == 'string') {
			typ = isKeyword;
		} else {
			typ = id.toUpperCase();
		};
		
		addLoc = true;
		
		if (typ == 'MODULE') {
			if (!(/^module [a-zA-Z]/).test(this._chunk) || ctx0 == 'TAG_ATTR') {
				typ = 'IDENTIFIER';
			};
		};
		
		
		if (typ == 'YES') {
			typ = 'TRUE';
		} else if (typ == 'NO') {
			typ = 'FALSE';
		} else if (typ == 'NIL') {
			typ = 'NULL';
		} else if (typ == 'VAR' || typ == 'CONST' || typ == 'LET') {
			let ltyp = this._lastTyp;
			
			if (ltyp != 'TERMINATOR' && ltyp != 'INDENT' && ltyp != 'EXPORT' && ltyp) {
				typ = ("INLINE_" + typ);
			};
			
			if (this._lastVal == 'export') {
				tTs(prev,'EXPORT_VAR');
			};
		} else if (typ == 'IF' || typ == 'ELSE' || typ == 'TRUE' || typ == 'FALSE' || typ == 'NULL') {
			true;
		} else if (typ == 'TAG') {
			this.pushEnd('TAG');
		} else if ((typ == 'DEF' || typ == 'GET' || typ == 'SET')) {
			typ = 'DEF';
			this.openDef();
		} else if (typ == 'DO') {
			if (this.context() == 'DEF') this.closeDef();
		} else if (typ === 'WHEN' && LINE_BREAK.indexOf(this.lastTokenType()) >= 0) {
			typ = 'LEADING_WHEN';
		} else if (typ === 'FOR') {
			this._seenFor = true;
		} else if (typ === 'UNLESS') {
			typ = 'IF'; 
		} else if (UNARY.indexOf(typ) >= 0) {
			typ = 'UNARY';
		} else if (RELATION.indexOf(typ) >= 0) {
			if (typ != 'INSTANCEOF' && typ != 'ISA' && this._seenFor) {
				typ = 'FOR' + typ; 
				this._seenFor = false;
			} else {
				typ = 'RELATION';
				
				if (prev._type == 'UNARY') {
					prev._type = 'NOT';
				};
			};
		};
	};
	
	if (id == 'super') {
		typ = 'SUPER';
	};
	
	
	if (!forcedIdentifier) {
		// should already have dealt with this
		
		if (this._lastVal == 'export' && id == 'default') {
			// console.log 'id is default!!!'
			tTs(prev,'EXPORT');
			typ = 'DEFAULT';
		};
		
		
		switch (id) {
			case '!': 
			case 'not': {
				typ = 'UNARY';break;
			}
			case '==': 
			case '!=': 
			case '===': 
			case '!==': 
			case 'is': 
			case 'isnt': {
				typ = 'COMPARE';break;
			}
			case '&&': 
			case '||': 
			case 'and': 
			case 'or': {
				typ = 'LOGIC';break;
			}
			case 'break': 
			case 'continue': 
			case 'debugger': 
			case 'arguments': {
				typ = id.toUpperCase();break;
			}
		};
	};
	
	
	var len = input.length;
	
	
	
	
	if (typ == 'CLASS' || typ == 'DEF' || typ == 'TAG' || typ == "PROP" || typ == 'CSS' || typ == 'STRUCT') {
		this.queueScope(typ);
		
		var i = this._tokens.length;
		
		while (i){
			prev = this._tokens[--i];
			var ctrl = "" + tV(prev);
			if (idx$(ctrl,IMBA_CONTEXTUAL_KEYWORDS) >= 0) {
				tTs(prev,ctrl.toUpperCase());
			} else {
				break;
			};
		};
	} else if (typ == 'IF') {
		this.queueScope(typ);
	} else if (typ == 'IMPORT') {
		// could manually parse the whole ting here?
		this.pushEnd('IMPORT');
		this.token(typ,id,idlen);
		
		return len;
	} else if (typ == 'EXPORT') {
		this.pushEnd('EXPORT');
		this.token(typ,id,idlen);
		return len;
	} else if (id == 'from' && ctx0 == 'IMPORT') {
		typ = 'FROM';
		this.pair('IMPORT');
	} else if (id == 'from' && ctx0 == 'EXPORT') {
		typ = 'FROM';
		this.pair('EXPORT');
	} else if (id == 'as' && (ctx0 == 'IMPORT' || this._lastTyp == 'IDENTIFIER' || ctx0 == 'EXPORT')) {
		typ = 'AS';
	};
	
	
	
	
	if (id == 'new' && (this._lastTyp != '.' && this._chunk.match(/^new\s+[\w\$\(]/))) {
		// console.log 'is new keyword!!'
		typ = 'NEW';
	};
	
	if (typ == 'IDENTIFIER') {
		// see if previous was catch -- belongs in rewriter?
		if (lastTyp == 'CATCH') {
			typ = 'CATCH_VAR';
		};
	};
	
	if (lastTyp == 'NUMBER' && !prev.spaced && (typ == 'IDENTIFIER' || id == '%')) {
		typ = 'UNIT';
	};
	
	if (colon) {
		this.token(typ,id,idlen);
		var colonOffset = colon.indexOf(':');
		
		this.moveCaret(idlen + colonOffset);
		
		this.token(':',':',1);
		this.moveCaret(-(idlen + colonOffset));
	} else {
		this.token(typ,id,idlen);
	};
	
	
	if (typ == 'CSS') {
		// if @context
		//	@context:lexer = self:lexStyleRule
		return len + this.lexStyleRule(len);
	};
	
	
	return len;
};



Lexer.prototype.numberToken = function (){
	var binaryLiteral;
	var match,number,lexedLength;
	
	if (!(match = NUMBER.exec(this._chunk))) { return 0 };
	
	number = match[0];
	lexedLength = number.length;
	
	if (binaryLiteral = /0b([01]+)/.exec(number)) {
		
		number = "" + parseInt(binaryLiteral[1],2);
	};
	
	var prev = last(this._tokens);
	
	if (match[0][0] == '.' && prev && !prev.spaced && ['IDENTIFIER',')','}',']','NUMBER'].indexOf(tT(prev)) >= 0) {
		// console.log "got here"
		this.token(".",".");
		number = number.substr(1);
	};
	
	
	this.token('NUMBER',number,lexedLength);
	return lexedLength;
};

Lexer.prototype.symbolToken = function (){
	var match,symbol,prev;
	if (!(match = SYMBOL.exec(this._chunk))) { return 0 };
	symbol = match[0];
	prev = last(this._tokens);
	
	if (!prev || prev.spaced || idx$(this._prevVal,['(','[','=']) >= 0) {
		let sym = helpers.dashToCamelCase(symbol.slice(1));
		this.token('STRING','"' + sym + '"',match[0].length);
		
		return match[0].length;
	};
	return 0;
};

Lexer.prototype.escapeStr = function (str,heredoc,q){
	str = str.replace(MULTILINER,(heredoc ? '\\n' : ''));
	if (q) {
		var r = RegExp(("\\\\[" + q + "]"),"g");
		str = str.replace(r,q);
		str = str.replace(RegExp(("" + q),"g"),'\\$&');
	};
	return str;
	
	
	
};


Lexer.prototype.stringToken = function (){
	var match,string;
	
	switch (this._chunk.charAt(0)) {
		case "'": {
			if (!(match = SIMPLESTR.exec(this._chunk))) { return 0 };
			string = match[0];
			this.token('STRING',this.escapeStr(string),string.length);
			
			break;
		}
		case '"': {
			if (!(string = this.balancedString(this._chunk,'"'))) { return 0 };
			
			
			if (string.indexOf('{') >= 0) {
				var len = string.length;
				
				
				this.token('STRING_START',string.charAt(0),1);
				this.interpolateString(string.slice(1,-1));
				this.token('STRING_END',string.charAt(len - 1),1,string.length - 1);
			} else {
				len = string.length;
				
				this.token('STRING',this.escapeStr(string),len);
			};
			break;
		}
		case '`': {
			if (!(string = this.balancedString(this._chunk,'`'))) { return 0 };
			
			if (string.indexOf('{') >= 0) {
				len = string.length;
				
				
				this.token('STRING_START',string.charAt(0),1);
				this.interpolateString(string.slice(1,-1),{heredoc: true});
				this.token('STRING_END',string.charAt(len - 1),1,string.length - 1);
			} else {
				len = string.length;
				
				this.token('STRING',this.escapeStr(string,true),len);
			};
			break;
		}
		default:
		
			return 0;
	
	};
	
	this.moveHead(string);
	return string.length;
};



Lexer.prototype.heredocToken = function (){
	var match,heredoc,quote,doc;
	
	if (!(match = HEREDOC.exec(this._chunk))) { return 0 };
	
	heredoc = match[0];
	quote = heredoc.charAt(0);
	var opts = {quote: quote,indent: null,offset: 0};
	doc = this.sanitizeHeredoc(match[2],opts);
	
	
	
	if (quote == '"' && doc.indexOf('{') >= 0) {
		var open = match[1];
		
		
		
		this.token('STRING_START',open,open.length);
		this.interpolateString(doc,{heredoc: true,offset: (open.length + opts.offset),quote: quote,indent: opts.realIndent});
		this.token('STRING_END',open,open.length,heredoc.length - open.length);
	} else {
		this.token('STRING',this.makeString(doc,quote,true),0);
	};
	
	this.moveHead(heredoc);
	return heredoc.length;
};

Lexer.prototype.parseMagicalOptions = function (str){
	var self = this;
	if (str.indexOf('imba$') >= 0) {
		str.replace(/imba\$(\w+)\=(\S*)\b/g,function(m,name,val) {
			if ((/^\d+$/).test(val)) {
				val = parseInt(val);
			};
			return self._opts[name] = val;
		});
	};
	return self;
};


Lexer.prototype.commentToken = function (){
	var match,length,comment,indent,prev;
	
	var typ = 'HERECOMMENT';
	
	if (match = JS_COMMENT.exec(this._chunk)) {
		this.token('HERECOMMENT',match[1],match[1].length);
		this.token('TERMINATOR','\n');
		return match[0].length;
	};
	
	if (match = INLINE_COMMENT.exec(this._chunk)) { // .match(INLINE_COMMENT)
		// console.log "match inline comment"
		length = match[0].length;
		indent = match[1];
		comment = match[2];
		let commentBody = (match[4] || '');
		if (comment[0] == '#') {
			commentBody = ' ' + commentBody;
		};
		
		prev = last(this._tokens);
		var pt = prev && tT(prev);
		var note = '//' + commentBody; 
		
		this.parseMagicalOptions(note);
		
		if (this._last && this._last.spaced) {
			note = ' ' + note;
			
		};
		
		if (note.match(/^\/\/ \@(type|param)/)) {
			note = '/**' + commentBody + '*/';
		} else if (note.match(/^\/\/ \<(reference)/)) {
			note = '///' + commentBody;
		};
		
		if ((pt && pt != 'INDENT' && pt != 'TERMINATOR') || !pt) {
			// console.log "skip comment"
			// token 'INLINECOMMENT', comment.substr(2)
			// console.log "adding as terminator"
			this.token('TERMINATOR',note,length); 
		} else {
			if (pt == 'TERMINATOR') {
				tVs(prev,tV(prev) + note);
				
			} else if (pt == 'INDENT') {
				this.addLinebreaks(1,note);
			} else {
				// console.log "comment here"
				// should we ever get here?
				this.token(typ,comment.substr(2),length); 
			};
		};
		
		return length; 
	};
	
	
	if (!(match = COMMENT.exec(this._chunk))) { return 0 };
	
	comment = match[0];
	var here = match[1];
	
	if (here) {
		this.token('HERECOMMENT',this.sanitizeHeredoc(here,{herecomment: true,indent: Array(this._indent + 1).join(' ')}),comment.length);
		this.token('TERMINATOR','\n');
	} else {
		this.token('HERECOMMENT',comment,comment.length);
		this.token('TERMINATOR','\n'); 
	};
	
	this.moveHead(comment);
	return comment.length;
};




Lexer.prototype.regexToken = function (){
	var ary;
	var match,length,prev;
	
	if (this._chunk.charAt(0) != '/') { return 0 };
	
	if (match = HEREGEX.exec(this._chunk)) {
		length = this.heregexToken(match);
		this.moveHead(match[0]);
		return length;
	};
	
	prev = last(this._tokens);
	
	if (prev && (idx$(tT(prev),(prev.spaced ? 
		NOT_REGEX
	 : 
		NOT_SPACED_REGEX
	)) >= 0)) { return 0 };
	if (!(match = REGEX.exec(this._chunk))) { return 0 };
	var ary = iter$(match);var m = ary[0],regex = ary[1],flags = ary[2];
	
	this.token('REGEX',("" + regex + flags),m.length);
	return m.length;
};



Lexer.prototype.heregexToken = function (match){
	var ary;
	var ary = iter$(match);var heregex = ary[0],body = ary[1],flags = ary[2];
	this.token('REGEX',heregex,heregex.length);
	return heregex.length;
};











Lexer.prototype.lineToken = function (){
	var gutter;
	var match;
	
	if (!(match = MULTI_DENT.exec(this._chunk))) { return 0 };
	
	var indent = match[0];
	var brCount = this.moveHead(indent);
	
	this._seenFor = false;
	
	var prev = last(this._tokens,1);
	let whitespace = indent.substr(indent.lastIndexOf('\n') + 1);
	var noNewlines = this.unfinished();
	
	if ((/^\n#\s/).test(this._chunk)) {
		this.addLinebreaks(1);
		return 0;
	};
	
	
	
	
	if (this._state.gutter == undefined) {
		this._state.gutter = whitespace;
	};
	
	
	if (gutter = this._state.gutter || this._opts.gutter) {
		if (whitespace.indexOf(gutter) == 0) {
			whitespace = whitespace.slice(gutter.length);
		} else if (this._chunk[indent.length] === undefined) {
			// if this is the end of code we're okay
			true;
		} else {
			this.warn('incorrect indentation');
			
		};
		
		
	};
	
	var size = whitespace.length;
	
	if (this._opts.dropIndentation) {
		return size;
	};
	
	if (size > 0) {
		// seen indent?
		
		if (!this._indentStyle) {
			this._opts.indent = this._indentStyle = whitespace;
			this._indentRegex = new RegExp(whitespace,'g');
		};
		
		let indentSize = 0;
		let offset = 0;
		
		while (true){
			let idx = whitespace.indexOf(this._indentStyle,offset);
			if (idx == offset) {
				indentSize++;
				offset += this._indentStyle.length;
			} else if (offset == whitespace.length) {
				break;
			} else if (this._opts.silent) {
				break;
			} else {
				// workaround to report correct location
				this._loc += indent.length - whitespace.length;
				this.token('INDENT',whitespace,whitespace.length);
				if (!this._opts.silent) {
					throw this.error("use tabs for indentation");
				};
			};
		};
		
		size = indentSize;
	};
	
	
	if ((size - this._indebt) == this._indent) {
		if (noNewlines) {
			this.suppressNewlines();
		} else {
			this.newlineToken(brCount,indent);
		};
		return indent.length;
	};
	
	if (size > this._indent) {
		if (noNewlines) {
			this._indebt = size - this._indent;
			this.suppressNewlines();
			return indent.length;
		};
		
		if (this.inTag()) {
			return indent.length;
		};
		
		var diff = size - this._indent + this._outdebt;
		this.closeDef();
		
		var expectScope = this._scopes[this._indents.length];
		var immediate = last(this._tokens);
		
		if (immediate && tT(immediate) == 'TERMINATOR') {
			tTs(immediate,'INDENT');
			
			immediate._meta || (immediate._meta = {pre: tV(immediate),post: ''});
			immediate.scope = expectScope;
		} else {
			// console.log "set indent {expectScope}"
			this.token('INDENT',"" + diff,0);
			this._last.scope = expectScope;
		};
		
		
		this._indents.push(diff);
		this.pushEnd('OUTDENT',{opener: this._last});
		this._outdebt = this._indebt = 0;
		this.addLinebreaks(brCount);
	} else if (true) {
		this._indebt = 0;
		
		let moveOut = this._indent - size;
		let currIndent = this._indent;
		let useTabs = this._indentStyle == '\t';
		let lines = indent.replace().split('\n');
		
		let levels = [];
		let k = lines.length;
		let lvl = 0;
		while (k > 0){
			let ln = lines[--k];
			let lnlvl = useTabs ? ln.length : ln.replace(this._indentRegex,'\t').length;
			if (lnlvl > lvl) {
				lvl = lnlvl;
			};
			
			levels[k] = lvl;
		};
		
		levels[0] = currIndent;
		
		
		
		let i = 0;
		let toks = [];
		let pre = "";
		for (let idx = 0, items = iter$(lines), len = items.length; idx < len; idx++) {
			let lvl = levels[idx];
			
			while (currIndent > lvl){
				if (pre) {
					this.terminatorToken(pre);
					pre = "";
				} else {
					this.terminatorToken('');
				};
				
				moveOut--;
				this.outdentToken(1,true);
				currIndent--;
			};
			
			pre += '\n' + items[idx];
		};
		
		if (pre) {
			this.terminatorToken(pre);
		};
		
		while (moveOut > 0){
			this.outdentToken(1,true);
			moveOut--;
		};
	};
	
	this._indent = size;
	return indent.length;
};



Lexer.prototype.outdentToken = function (moveOut,noNewlines,newlineCount){
	// here we should also take care to pop / reset the scope-body
	// or context-type for indentation 
	var dent = 0;
	while (moveOut > 0){
		var len = this._indents.length - 1;
		if (this._indents[len] == undefined) {
			moveOut = 0;
		} else if (this._indents[len] == this._outdebt) {
			moveOut -= this._outdebt;
			this._outdebt = 0;
		} else if (this._indents[len] < this._outdebt) {
			this._outdebt -= this._indents[len];
			moveOut -= this._indents[len];
		} else {
			dent = this._indents.pop() - this._outdebt;
			moveOut -= dent;
			this._outdebt = 0;
			
			if (!noNewlines) { this.addLinebreaks(1) };
			
			let paired = this.pair('OUTDENT');
			this.token('OUTDENT',"" + dent,0);
			if (paired[1] && paired[1].opener) {
				let opener = paired[1].opener;
				
				this._last._opener = opener;
				opener._closer = this._last;
				if (opener._type == 'CSS_SEL') {
					this.token('CSS_END',"",0);
				};
				
			};
		};
	};
	
	if (dent) { this._outdebt -= moveOut };
	
	while (this.lastTokenValue() == ';'){
		this._tokens.pop();
	};
	
	if (!(this.lastTokenType() == 'TERMINATOR' || noNewlines)) { this.token('TERMINATOR','\n',0) };
	
	this._scopes.length = this._indents.length;
	this.closeDef();
	var ctx = this.context();
	if (ctx == '%' || ctx == 'TAG' || ctx == 'IMPORT' || ctx == 'EXPORT') { this.pair(ctx) }; 
	return this;
};



Lexer.prototype.whitespaceToken = function (type){
	var match,nline,prev;
	if (!((match = WHITESPACE.exec(this._chunk)) || (nline = this._chunk.charAt(0) === '\n'))) { return 0 };
	prev = last(this._tokens);
	
	
	if (prev) {
		if (match) {
			prev.spaced = true;
			
			
			return match[0].length;
		} else {
			prev.newLine = true;
			return 0;
		};
	};
};

Lexer.prototype.moveHead = function (str){
	var br = count(str,'\n');
	return br;
};

Lexer.prototype.terminatorToken = function (content,loc){
	if (this._lastTyp == 'TERMINATOR') {
		return this._last._value += content;
		
	} else {
		return this.token('TERMINATOR',content,loc);
	};
};

Lexer.prototype.addLinebreaks = function (count,raw){
	var br;
	
	if (!raw && count == 0) { return this }; 
	
	var prev = this._last;
	
	if (!raw) {
		if (count == 1) {
			br = '\n';
		} else if (count == 2) {
			br = '\n\n';
		} else if (count == 3) {
			br = '\n\n\n';
		} else {
			br = repeatString('\n',count);
		};
	};
	
	if (prev) {
		var t = prev._type; 
		var v = tV(prev);
		
		
		if (t == 'INDENT') {
			// TODO we want to add to the indent
			// console.log "add the comment to the indent -- pre? {raw} {br}"
			
			var meta = prev._meta || (prev._meta = {pre: '',post: ''});
			meta.post += (raw || br);
			
			return this;
		} else if (t == 'TERMINATOR') {
			// console.log "already exists terminator {br} {raw}"
			tVs(prev,v + (raw || br));
			return this;
		};
	};
	
	this.token('TERMINATOR',(raw || br),0);
	return;
};


Lexer.prototype.newlineToken = function (lines,raw){
	
	// while lastTokenValue == ';'
	//	@tokens.pop
	
	this.addLinebreaks(lines,raw);
	
	this.closeDef(); 
	var ctx = this.context();
	if (ctx == 'TAG' || ctx == 'IMPORT' || ctx == 'EXPORT') { this.pair(ctx) };
	
	return this;
};



Lexer.prototype.suppressNewlines = function (){
	if (this.value() === '\\') { this._tokens.pop() };
	return this;
};






Lexer.prototype.literalToken = function (){
	var match,value;
	if (match = OPERATOR.exec(this._chunk)) {
		value = match[0];
		if (CODE.test(value)) this.tagParameters();
	} else {
		value = this._chunk.charAt(0);
	};
	
	var end1 = this._ends[this._ends.length - 1];
	var end2 = this._ends[this._ends.length - 2];
	
	var inTag = end1 == 'TAG_END' || end1 == 'OUTDENT' && end2 == 'TAG_END';
	
	var tokid = value;
	var prev = last(this._tokens);
	var pt = prev && tT(prev);
	var pv = prev && tV(prev);
	var length = value.length;
	
	
	if (value == '=' && prev) {
		
		if (pv == '||' || pv == '&&') { // in ['||', '&&']
			tTs(prev,'COMPOUND_ASSIGN');
			tVs(prev,pv + '='); 
			prev._len = this._loc - prev._loc + value.length;
			return value.length;
		};
	};
	
	if (value == 'ƒ') {
		tokid = 'DO';
	};
	
	
	if (value == '|') {
		// hacky way to implement this
		// with new lexer we'll use { ... } instead, and assume object-context,
		// then go back and correct when we see the context is invalid
		if (pv == '(') {
			this.token('DO','DO',0);
			this.pushEnd('|');
			this.token('BLOCK_PARAM_START',value,1);
			return length;
		} else if (pt == 'DO') {
			this.pushEnd('|');
			this.token('BLOCK_PARAM_START',value,1);
			return length;
		} else if (end1 == '|') {
			this.token('BLOCK_PARAM_END',value,1);
			this.pair('|');
			return length;
		};
	};
	
	if (value === ';') {
		this._seenFor = false;
		tokid = 'TERMINATOR';
	};
	
	if (value == '(' && pt == 'T.') {
		tokid = 'STYLE_START';
	} else if (pt == 'TAG_WS' && (value == '{')) {
		tokid = 'STYLE_START';
	} else if (pt == '.' && (value == '(' || value == '{')) {
		prev._type = 'STYLE_DECL';
		tokid = 'STYLE_START';
	} else if (pt == 'SELECTOR_END' && value == '{') {
		tokid = 'STYLE_START';
	} else if (value === '(' && inTag && pt != '=' && prev.spaced) { // FIXed
		// console.log 'spaced before ( in tokid'
		// FIXME - should rather add a special token like TAG_PARAMS_START
		this.token(',',',');
	} else if (value === '->' && inTag) {
		tokid = 'TAG_END';
		this.pair('TAG_END');
	} else if (value === '=>' && inTag) {
		tokid = 'TAG_END';
		this.pair('TAG_END');
	} else if (value === '/>' && inTag) {
		tokid = 'TAG_END';
		this.pair('TAG_END');
	} else if (value === '>' && inTag) {
		tokid = 'TAG_END';
		this.pair('TAG_END');
	} else if (value === 'TERMINATOR' && end1 === 'DEF') {
		this.closeDef();
	} else if (value === '&' && this.context() == 'DEF') {
		// console.log("okay!")
		tokid = 'BLOCK_ARG';
		
	} else if (value == '---') {
		tokid = 'SEPARATOR';
	} else if (value == '-' && pt == 'TERMINATOR' && this._chunk.match(/^\-\s*\n/)) {
		tokid = 'SEPARATOR';
	} else if (value == '*' && this._chunk.charAt(1).match(/[A-Za-z\_\@\[]/) && (prev.spaced || [',','(','[','{','|','\n','\t'].indexOf(pv) >= 0)) {
		tokid = "SPLAT";
	} else if (value == '*' && (this.context() == 'IMPORT' || this.context() == 'EXPORT')) {
		tokid = ("" + this.context() + "_ALL");
	} else if (value == ',' && this.context() == 'IMPORT') {
		tokid = "IMPORT_COMMA";
	} else if (value == '!' && prev && !prev.spaced && ([']',')'].indexOf(pv) >= 0 || pt == 'IDENTIFIER')) {
		tokid = 'BANG';
	} else if (value == '**') {
		tokid = 'EXP';
	} else if (value == '%' && pt == 'NUMBER' && !prev.spaced) {
		tokid = 'UNIT';
	} else if (idx$(value,MATH) >= 0) {
		tokid = 'MATH';
	} else if (idx$(value,COMPARE) >= 0) {
		tokid = 'COMPARE';
	} else if (idx$(value,COMPOUND_ASSIGN) >= 0) {
		tokid = 'COMPOUND_ASSIGN';
	} else if (idx$(value,UNARY) >= 0) {
		tokid = 'UNARY';
	} else if (idx$(value,SHIFT) >= 0) {
		tokid = 'SHIFT';
	} else if (idx$(value,LOGIC) >= 0) {
		tokid = 'LOGIC'; 
	} else if (prev && !prev.spaced) {
		if (value == '{' && pt == 'IDENTIFIER') {
			tokid = '{{';
		};
		
		if (value === '(' && idx$(pt,CALLABLE) >= 0) {
			tokid = 'CALL_START';
		} else if (value === '(' && pt == 'DO') {
			tokid = 'BLOCK_PARAM_START';
		} else if (value === '[' && idx$(pt,INDEXABLE) >= 0) {
			tokid = 'INDEX_START';
			if (pt == '?') { tTs(prev,'INDEX_SOAK') };
		};
	};
	
	let opener = null;
	
	switch (value) {
		case '(': 
		case '{': 
		case '[': {
			this.pushEnd(INVERSES[value],{closeType: INVERSES[tokid],i: this._tokens.length});
			break;
		}
		case ')': 
		case '}': 
		case ']': {
			let paired = this.pair(value);
			if (paired && paired[1].closeType) {
				tokid = paired[1].closeType;
				let other = this._tokens[paired[1].i];
				opener = this._tokens[paired[1].i];
			};
			break;
		}
	};
	
	
	if (value == '\\') {
		tokid = 'TYPE';
	};
	
	if (value == '..' && !prev.spaced) {
		tokid = '?.';
		value = '?.';
	};
	
	if (value == ':' && end1 == 'TAG_RULE') {
		tokid = 'T:';
	};
	
	this.token(tokid,value,value.length);
	
	if (opener) {
		opener._closer = this._last;
	};
	
	if (this._target == 'tsc') {
		let next = this._chunk[1] || '';
		if (value == '.' && (next == ' ' || next == '\n' || !next)) {
			this.token('IDENTIFIER','$CARET$',0,1);
		} else if (value == '@' && (!next || (/[^\$\@\-\.\w]/).test(next))) {
			this.token('IDENTIFIER','$CARET$',0,1);
		};
	};
	
	
	return value.length;
};






Lexer.prototype.sanitizeHeredoc = function (doc,options){
	var match;
	var indent = options.indent;
	var herecomment = options.herecomment;
	
	if (herecomment) {
		if (HEREDOC_ILLEGAL.test(doc)) {
			throw this.error("block comment cannot contain '*/' starting");
		};
		if (doc.indexOf('\n') <= 0) { return doc };
	} else {
		var length_;while (match = HEREDOC_INDENT.exec(doc)){
			var attempt = match[1];
			if (indent === null || 0 < (length_ = attempt.length) && length_ < indent.length) {
				indent = attempt;
			};
		};
	};
	
	if (indent) { doc = doc.replace(RegExp(("\\n" + indent),"g"),'\n') };
	if (!herecomment) {
		if (doc[0] == '\n') {
			options.offset = indent.length + 1;
		};
		doc = doc.replace(/^\n/,'');
	};
	options.realIndent = indent;
	return doc;
};




Lexer.prototype.tagParameters = function (){
	var tok;
	if (this.lastTokenType() != ')') { return this };
	var stack = [];
	var tokens = this._tokens;
	var i = tokens.length;
	
	tTs(tokens[--i],'PARAM_END');
	
	while (tok = tokens[--i]){
		var t = tT(tok);
		switch (t) {
			case ')': {
				stack.push(tok);
				break;
			}
			case '(': 
			case 'CALL_START': {
				if (stack.length) {
					stack.pop();
				} else if (t === '(') {
					tTs(tok,'PARAM_START');
					return this;
				} else {
					return this;
				};
				break;
			}
		};
	};
	
	return this;
};


Lexer.prototype.closeIndentation = function (){
	if (this.context() == 'IMPORT' || this.context() == 'EXPORT') { this.pair(this.context()) };
	this.closeDef();
	this.closeSelector();
	return this.outdentToken(this._indent,false,0);
};





Lexer.prototype.balancedString = function (str,end){
	var match,letter,prev;
	
	var stack = [end];
	var i = 0;
	
	
	while (i < (str.length - 1)){
		i++;
		letter = str.charAt(i);
		switch (letter) {
			case '\\': {
				i++;
				continue;
				break;
			}
			case end: {
				stack.pop();
				if (!stack.length) {
					var v = str.slice(0,i + 1);
					return v;
				};
				end = stack[stack.length - 1];
				continue;
				break;
			}
		};
		
		if (end === '}' && (letter == '"' || letter == "'")) {
			stack.push(end = letter);
		} else if (end === '}' && letter === '/' && (match = (HEREGEX.exec(str.slice(i)) || REGEX.exec(str.slice(i))))) {
			i += match[0].length - 1;
		} else if (end === '}' && letter === '{') {
			stack.push(end = '}');
		} else if (end === '"' && letter === '{') {
			stack.push(end = '}');
		};
		prev = letter;
	};
	
	if (!this._opts.silent) { throw this.error(("missing " + (stack.pop()) + ", starting")) };
};









Lexer.prototype.interpolateString = function (str,options){
	
	if(options === undefined) options = {};
	var heredoc = options.heredoc;
	var quote = options.quote;
	var regex = options.regex;
	var prefix = options.prefix;
	var indent = options.indent;
	
	var startLoc = this._loc;
	var tokens = [];
	var pi = 0;
	var i = -1;
	var locOffset = options.offset || 1;
	var strlen = str.length;
	var letter;
	var expr;
	
	var isInterpolated = false;
	
	
	while (letter = str[i += 1]){
		if (letter === '\\') {
			i += 1;
			continue;
		};
		
		if (letter === '\n' && indent) {
			locOffset += indent.length;
		};
		
		if (!(str[i] == '{' && (expr = this.balancedString(str.slice(i),'}')))) {
			continue;
		};
		
		isInterpolated = true;
		
		
		if (pi < i) {
			// this is the prefix-string - before any item
			var tok = new Token('NEOSTRING',this.escapeStr(str.slice(pi,i),heredoc,quote),this._loc + pi + locOffset,i - pi);
			
			
			tokens.push(tok);
		};
		
		tokens.push(new Token('{{','{',this._loc + i + locOffset,1));
		
		var inner = expr.slice(1,-1);
		
		
		
		inner = inner.replace(/^[^\n\S]+/,'');
		
		if (inner.length) {
			// we need to remember the loc we start at
			// console.log('interpolate from loc',@loc,i)
			// really? why not just add to the stack??
			// what about the added 
			// should share with the selector no?
			// console.log "tokenize inner parts of string",inner
			var spaces = 0;
			var offset = this._loc + i + (expr.length - inner.length) - 1;
			
			
			
			var nested = new Lexer().tokenize(inner,{inline: true,rewrite: false,loc: offset + locOffset});
			
			
			if (nested[0] && tT(nested[0]) == 'TERMINATOR') {
				nested.shift();
			};
			
			if (nested.length) {
				tokens.push.apply(tokens,nested); 
			};
		};
		
		
		i += expr.length - 1;
		tokens.push(new Token('}}','}',this._loc + i + locOffset,1));
		pi = i + 1;
	};
	
	
	if (i >= pi && pi < str.length) {
		// set the length as well - or?
		// the string after?
		// console.log 'push neostring'
		tokens.push(new Token('NEOSTRING',this.escapeStr(str.slice(pi),heredoc,quote),this._loc + pi + locOffset,str.length - pi));
	};
	
	
	if (regex) { return tokens };
	
	if (!tokens.length) { return this.token('NEOSTRING','""') };
	
	for (let j = 0, len = tokens.length; j < len; j++) {
		this._tokens.push(tokens[j]);
	};
	
	return tokens;
};





Lexer.prototype.balancedSelector = function (str,end){
	var prev;
	var letter;
	var stack = [end];
	
	for (let len = str.length, i = 1, rd = len - i; (rd > 0) ? (i < len) : (i > len); (rd > 0) ? (i++) : (i--)) {
		switch (letter = str.charAt(i)) {
			case '\\': {
				i++;
				continue;
				break;
			}
			case end: {
				stack.pop();
				if (!stack.length) {
					return str.slice(0,i + 1);
				};
				
				end = stack[stack.length - 1];
				continue;
				break;
			}
		};
		if (end === '}' && letter === [')']) {
			stack.push(end = letter);
		} else if (end === '}' && letter === '{') {
			stack.push(end = '}');
		} else if (end === ')' && letter === '{') {
			stack.push(end = '}');
		};
		prev = letter; 
	};
	
	throw this.error(("missing " + (stack.pop()) + ", starting"));
};



Lexer.prototype.pair = function (tok){
	var wanted = last(this._ends);
	if (tok != wanted) {
		if (!('OUTDENT' === wanted)) {
			throw this.error(("unmatched " + tok));
		};
		var size = last(this._indents);
		this._indent -= size;
		this.outdentToken(size,true,0);
		return this.pair(tok);
	};
	return this.popEnd();
};






Lexer.prototype.token = function (id,value,len,offset){
	this._lastTyp = id;
	this._lastVal = value;
	var tok = this._last = new Token(id,value,this._loc + (offset || 0),len || 0);
	this._tokens.push(tok);
	return;
};

Lexer.prototype.lastTokenType = function (){
	var token = this._tokens[this._tokens.length - 1];
	return token ? tT(token) : 'NONE';
};

Lexer.prototype.lastTokenValue = function (){
	var token = this._tokens[this._tokens.length - 1];
	return token ? token._value : '';
};


Lexer.prototype.tokid = function (index,val){
	var tok;
	if (tok = last(this._tokens,index)) {
		if (val) { tTs(tok,val) };
		return tT(tok);
	} else {
		return null;
	};
};


Lexer.prototype.value = function (index,val){
	var tok;
	if (tok = last(this._tokens,index)) {
		if (val) { tVs(tok,val) };
		return tV(tok);
	} else {
		return null;
	};
};



Lexer.prototype.unfinished = function (){
	if (LINE_CONTINUER.test(this._chunk)) { return true };
	return (UNFINISHED.indexOf(this._lastTyp) >= 0 && this._opts.target != 'tsc');
};


Lexer.prototype.escapeLines = function (str,heredoc){
	return str.replace(MULTILINER,(heredoc ? '\\n' : ''));
};


Lexer.prototype.makeString = function (body,quote,heredoc){
	if (!body) { return quote + quote };
	body = body.replace(/\\([\s\S])/g,function(match,contents) {
		return (contents == '\n' || contents == quote) ? contents : match;
	});
	
	body = body.replace(RegExp(("" + quote),"g"),'\\$&');
	return quote + this.escapeLines(body,heredoc) + quote;
};


Lexer.prototype.error = function (message,len){
	if ((typeof this._line=='number'||this._line instanceof Number)) { message = ("" + message + " on line " + (this._line)) };
	
	if (len) {
		message += (" [" + (this._loc) + ":" + (this._loc + len) + "]");
	};
	
	var err = new SyntaxError(message);
	err.line = this._line;
	err = new ERR.ImbaParseError(err,{tokens: this._tokens,pos: this._tokens.length});
	err._code = this._code;
	err.region = [this._loc,this._loc + (len || 0)];
	return err;
};

Lexer.prototype.warn = function (message){
	var ary = this._tokens.warnings || (this._tokens.warnings = []);
	ary.push(message);
	
	if (!this._opts.silent) {
		if (message instanceof ERR.ImbaParseError) {
			message = message.excerpt({colors: 'yellow'});
		};
	};
	
	console.warn(message);
	return this;
};



/***/ }),
/* 6 */
/***/ (function(module, exports) {

function iter$(a){ return a ? (a.toArray ? a.toArray() : a) : []; };


var BALANCED_PAIRS = exports.BALANCED_PAIRS = [
	['(',')'],
	['[',']'],
	['{','}'],
	['{{','}}'],
	['INDENT','OUTDENT'],
	['CALL_START','CALL_END'],
	['PARAM_START','PARAM_END'],
	['INDEX_START','INDEX_END'],
	['TAG_START','TAG_END'],
	['STYLE_START','STYLE_END'],
	['BLOCK_PARAM_START','BLOCK_PARAM_END']
];



var INVERSES = exports.INVERSES = {};





for (let i = 0, len = BALANCED_PAIRS.length, pair; i < len; i++) {
	pair = BALANCED_PAIRS[i];
	var left = pair[0];
	var rite = pair[1];
	INVERSES[rite] = left;
	INVERSES[left] = rite;
	BALANCED_PAIRS[left] = rite;
};


var ALL_KEYWORDS = exports.ALL_KEYWORDS = [
	'true','false','null','this',
	'delete','typeof','in','instanceof',
	'throw','break','continue','debugger',
	'if','else','switch','for','while','do','try','catch','finally',
	'class','extends','super','return',
	'undefined','then','unless','until','loop','of','by',
	'when','def','tag','do','elif','begin','var','let','self','await','import',
	'and','or','is','isnt','not','yes','no','isa','case','nil','require'
];

var TOK = exports.TOK = {
	TERMINATOR: 'TERMINATOR',
	INDENT: 'INDENT',
	OUTDENT: 'OUTDENT',
	DEF_BODY: 'DEF_BODY',
	THEN: 'THEN',
	CATCH: 'CATCH'
};

var OPERATOR_ALIASES = exports.OPERATOR_ALIASES = {
	and: '&&',
	or: '||',
	is: '==',
	isnt: '!=',
	isa: 'instanceof'
};

var HEREGEX_OMIT = exports.HEREGEX_OMIT = /\s+(?:#.*)?/g;
var HEREGEX = exports.HEREGEX = /^\/{3}([\s\S]+?)\/{3}([imgy]{0,4})(?!\w)/;

var TAG_TYPES = exports.TAG_TYPES = {
	"": [-1,{id: 1,className: 'class',slot: 1,part: 1,elementTiming: 'elementtiming'}],
	HTML: [-1,{title: 1,lang: 1,translate: 1,dir: 1,accessKey: 'accesskey',draggable: 1,spellcheck: 1,autocapitalize: 1,inputMode: 'inputmode',style: 1,tabIndex: 'tabindex',enterKeyHint: 'enterkeyhint'}],
	HTMLAnchor: [1,{target: 1,download: 1,ping: 1,rel: 1,relList: 'rel',hreflang: 1,type: 1,referrerPolicy: 'referrerpolicy',coords: 1,charset: 1,name: 1,rev: 1,shape: 1,href: 1}],
	HTMLArea: [1,{alt: 1,coords: 1,download: 1,shape: 1,target: 1,ping: 1,rel: 1,relList: 'rel',referrerPolicy: 'referrerpolicy',href: 1}],
	HTMLMedia: [1,{src: 1,crossOrigin: 'crossorigin',preload: 1,controlsList: 'controlslist'}],
	HTMLAudio: [4,{}],
	HTMLBase: [1,{href: 1,target: 1}],
	HTMLQuote: [1,{cite: 1}],
	HTMLBody: [1,{text: 1,link: 1,vLink: 'vlink',aLink: 'alink',bgColor: 'bgcolor',background: 1}],
	HTMLBR: [1,{clear: 1}],
	HTMLButton: [1,{formAction: 'formaction',formEnctype: 'formenctype',formMethod: 'formmethod',formTarget: 'formtarget',name: 1,type: 1,value: 1}],
	HTMLCanvas: [1,{width: 1,height: 1}],
	HTMLTableCaption: [1,{align: 1}],
	HTMLTableCol: [1,{span: 1,align: 1,ch: 'char',chOff: 'charoff',vAlign: 'valign',width: 1}],
	HTMLData: [1,{value: 1}],
	HTMLDataList: [1,{}],
	HTMLMod: [1,{cite: 1,dateTime: 'datetime'}],
	HTMLDetails: [1,{}],
	HTMLDialog: [1,{}],
	HTMLDiv: [1,{align: 1}],
	HTMLDList: [1,{}],
	HTMLEmbed: [1,{src: 1,type: 1,width: 1,height: 1,align: 1,name: 1}],
	HTMLFieldSet: [1,{name: 1}],
	HTMLForm: [1,{acceptCharset: 'accept-charset',action: 1,autocomplete: 1,enctype: 1,encoding: 'enctype',method: 1,name: 1,target: 1}],
	HTMLHeading: [1,{align: 1}],
	HTMLHead: [1,{}],
	HTMLHR: [1,{align: 1,color: 1,size: 1,width: 1}],
	HTMLHtml: [1,{version: 1}],
	HTMLIFrame: [1,{src: 1,srcdoc: 1,name: 1,sandbox: 1,width: 1,height: 1,referrerPolicy: 'referrerpolicy',csp: 1,allow: 1,align: 1,scrolling: 1,frameBorder: 'frameborder',longDesc: 'longdesc',marginHeight: 'marginheight',marginWidth: 'marginwidth',loading: 1}],
	HTMLImage: [1,{alt: 1,src: 1,srcset: 1,sizes: 1,crossOrigin: 'crossorigin',useMap: 'usemap',width: 1,height: 1,referrerPolicy: 'referrerpolicy',decoding: 1,name: 1,lowsrc: 1,align: 1,hspace: 1,vspace: 1,longDesc: 'longdesc',border: 1,loading: 1}],
	HTMLInput: [1,{accept: 1,alt: 1,autocomplete: 1,dirName: 'dirname',formAction: 'formaction',formEnctype: 'formenctype',formMethod: 'formmethod',formTarget: 'formtarget',height: 1,max: 1,maxLength: 'maxlength',min: 1,minLength: 'minlength',name: 1,pattern: 1,placeholder: 1,src: 1,step: 1,type: 1,defaultValue: 'value',width: 1,align: 1,useMap: 'usemap'}],
	HTMLLabel: [1,{htmlFor: 'for'}],
	HTMLLegend: [1,{align: 1}],
	HTMLLI: [1,{value: 1,type: 1}],
	HTMLLink: [1,{href: 1,crossOrigin: 'crossorigin',rel: 1,relList: 'rel',media: 1,hreflang: 1,type: 1,as: 1,referrerPolicy: 'referrerpolicy',sizes: 1,imageSrcset: 'imagesrcset',imageSizes: 'imagesizes',charset: 1,rev: 1,target: 1,integrity: 1}],
	HTMLMap: [1,{name: 1}],
	HTMLMenu: [1,{}],
	HTMLMeta: [1,{name: 1,httpEquiv: 'http-equiv',content: 1,scheme: 1}],
	HTMLMeter: [1,{value: 1,min: 1,max: 1,low: 1,high: 1,optimum: 1}],
	HTMLObject: [1,{data: 1,type: 1,name: 1,useMap: 'usemap',width: 1,height: 1,align: 1,archive: 1,code: 1,hspace: 1,standby: 1,vspace: 1,codeBase: 'codebase',codeType: 'codetype',border: 1}],
	HTMLOList: [1,{start: 1,type: 1}],
	HTMLOptGroup: [1,{label: 1}],
	HTMLOption: [1,{label: 1,value: 1}],
	HTMLOutput: [1,{htmlFor: 'for',name: 1}],
	HTMLParagraph: [1,{align: 1}],
	HTMLParam: [1,{name: 1,value: 1,type: 1,valueType: 'valuetype'}],
	HTMLPicture: [1,{}],
	HTMLPre: [1,{width: 1}],
	HTMLProgress: [1,{value: 1,max: 1}],
	HTMLScript: [1,{src: 1,type: 1,charset: 1,crossOrigin: 'crossorigin',referrerPolicy: 'referrerpolicy',event: 1,htmlFor: 'for',integrity: 1}],
	HTMLSelect: [1,{autocomplete: 1,name: 1,size: 1}],
	HTMLSlot: [1,{name: 1}],
	HTMLSource: [1,{src: 1,type: 1,srcset: 1,sizes: 1,media: 1}],
	HTMLSpan: [1,{}],
	HTMLStyle: [1,{media: 1,type: 1}],
	HTMLTable: [1,{align: 1,border: 1,frame: 1,rules: 1,summary: 1,width: 1,bgColor: 'bgcolor',cellPadding: 'cellpadding',cellSpacing: 'cellspacing'}],
	HTMLTableSection: [1,{align: 1,ch: 'char',chOff: 'charoff',vAlign: 'valign'}],
	HTMLTableCell: [1,{colSpan: 'colspan',rowSpan: 'rowspan',headers: 1,align: 1,axis: 1,height: 1,width: 1,ch: 'char',chOff: 'charoff',vAlign: 'valign',bgColor: 'bgcolor',abbr: 1,scope: 1}],
	HTMLTemplate: [1,{}],
	HTMLTextArea: [1,{autocomplete: 1,cols: 1,dirName: 'dirname',maxLength: 'maxlength',minLength: 'minlength',name: 1,placeholder: 1,rows: 1,wrap: 1}],
	HTMLTime: [1,{dateTime: 'datetime'}],
	HTMLTitle: [1,{}],
	HTMLTableRow: [1,{align: 1,ch: 'char',chOff: 'charoff',vAlign: 'valign',bgColor: 'bgcolor'}],
	HTMLTrack: [1,{kind: 1,src: 1,srclang: 1,label: 1}],
	HTMLUList: [1,{type: 1}],
	HTMLVideo: [4,{width: 1,height: 1,poster: 1}],
	SVG: [-1,{}],
	SVGGraphics: [66,{transform: 1}],
	SVGA: [67,{}],
	SVGAnimation: [66,{}],
	SVGAnimate: [69,{}],
	SVGAnimateMotion: [69,{}],
	SVGAnimateTransform: [69,{}],
	SVGGeometry: [67,{}],
	SVGCircle: [73,{cx: 1,cy: 1,r: 1}],
	SVGClipPath: [67,{clipPathUnits: 1}],
	SVGDefs: [67,{}],
	SVGDesc: [66,{}],
	SVGDiscard: [66,{}],
	SVGEllipse: [73,{cx: 1,cy: 1,rx: 1,ry: 1}],
	SVGFEBlend: [66,{mode: 1,x: 1,y: 1,width: 1,height: 1}],
	SVGFEColorMatrix: [66,{type: 1,values: 1,x: 1,y: 1,width: 1,height: 1}],
	SVGFEComponentTransfer: [66,{x: 1,y: 1,width: 1,height: 1}],
	SVGFEComposite: [66,{operator: 1,x: 1,y: 1,width: 1,height: 1}],
	SVGFEConvolveMatrix: [66,{orderX: 1,orderY: 1,kernelMatrix: 1,divisor: 1,edgeMode: 1,x: 1,y: 1,width: 1,height: 1}],
	SVGFEDiffuseLighting: [66,{surfaceScale: 1,diffuseConstant: 1,x: 1,y: 1,width: 1,height: 1}],
	SVGFEDisplacementMap: [66,{xChannelSelector: 1,yChannelSelector: 1,x: 1,y: 1,width: 1,height: 1}],
	SVGFEDistantLight: [66,{}],
	SVGFEDropShadow: [66,{dx: 1,dy: 1,stdDeviationX: 1,stdDeviationY: 1,x: 1,y: 1,width: 1,height: 1}],
	SVGFEFlood: [66,{x: 1,y: 1,width: 1,height: 1}],
	SVGComponentTransferFunction: [66,{type: 1,tableValues: 1,slope: 1,amplitude: 1,exponent: 1}],
	SVGFEFuncA: [90,{}],
	SVGFEFuncB: [90,{}],
	SVGFEFuncG: [90,{}],
	SVGFEFuncR: [90,{}],
	SVGFEGaussianBlur: [66,{x: 1,y: 1,width: 1,height: 1}],
	SVGFEImage: [66,{preserveAspectRatio: 1,x: 1,y: 1,width: 1,height: 1}],
	SVGFEMerge: [66,{x: 1,y: 1,width: 1,height: 1}],
	SVGFEMergeNode: [66,{}],
	SVGFEMorphology: [66,{operator: 1,x: 1,y: 1,width: 1,height: 1}],
	SVGFEOffset: [66,{x: 1,y: 1,width: 1,height: 1}],
	SVGFEPointLight: [66,{}],
	SVGFESpecularLighting: [66,{surfaceScale: 1,specularConstant: 1,specularExponent: 1,x: 1,y: 1,width: 1,height: 1}],
	SVGFESpotLight: [66,{specularExponent: 1}],
	SVGFETile: [66,{x: 1,y: 1,width: 1,height: 1}],
	SVGFETurbulence: [66,{numOctaves: 1,stitchTiles: 1,type: 1,x: 1,y: 1,width: 1,height: 1}],
	SVGFilter: [66,{filterUnits: 1,primitiveUnits: 1,x: 1,y: 1,width: 1,height: 1}],
	SVGForeignObject: [67,{x: 1,y: 1,width: 1,height: 1}],
	SVGG: [67,{}],
	SVGImage: [67,{x: 1,y: 1,width: 1,height: 1,preserveAspectRatio: 1}],
	SVGLine: [73,{x1: 1,y1: 1,x2: 1,y2: 1}],
	SVGGradient: [66,{gradientUnits: 1,gradientTransform: 1,spreadMethod: 1}],
	SVGLinearGradient: [111,{x1: 1,y1: 1,x2: 1,y2: 1}],
	SVGMarker: [66,{refX: 1,refY: 1,markerUnits: 1,markerWidth: 1,markerHeight: 1,orientType: 1,orientAngle: 1,viewBox: 1,preserveAspectRatio: 1}],
	SVGMask: [66,{maskUnits: 1,maskContentUnits: 1,x: 1,y: 1,width: 1,height: 1}],
	SVGMetadata: [66,{}],
	SVGMPath: [66,{}],
	SVGPath: [73,{}],
	SVGPattern: [66,{patternUnits: 1,patternContentUnits: 1,patternTransform: 1,x: 1,y: 1,width: 1,height: 1,viewBox: 1,preserveAspectRatio: 1}],
	SVGPolygon: [73,{}],
	SVGPolyline: [73,{}],
	SVGRadialGradient: [111,{cx: 1,cy: 1,r: 1,fx: 1,fy: 1,fr: 1}],
	SVGRect: [73,{x: 1,y: 1,width: 1,height: 1,rx: 1,ry: 1}],
	SVGScript: [66,{}],
	SVGSet: [69,{}],
	SVGStop: [66,{}],
	SVGStyle: [66,{}],
	SVGSVG: [67,{x: 1,y: 1,width: 1,height: 1,viewBox: 1,preserveAspectRatio: 1}],
	SVGSwitch: [67,{}],
	SVGSymbol: [66,{viewBox: 1,preserveAspectRatio: 1}],
	SVGTextContent: [67,{textLength: 1,lengthAdjust: 1}],
	SVGTextPositioning: [130,{x: 1,y: 1,dx: 1,dy: 1,rotate: 1}],
	SVGText: [131,{}],
	SVGTextPath: [130,{startOffset: 1,method: 1,spacing: 1}],
	SVGTitle: [66,{}],
	SVGTSpan: [131,{}],
	SVGUse: [67,{x: 1,y: 1,width: 1,height: 1}],
	SVGView: [66,{viewBox: 1,preserveAspectRatio: 1}]
};
var TAG_NAMES = exports.TAG_NAMES = {
	a: 2,
	abbr: 1,
	address: 1,
	area: 3,
	article: 1,
	aside: 1,
	audio: 5,
	b: 1,
	base: 6,
	bdi: 1,
	bdo: 1,
	blockquote: 7,
	body: 8,
	br: 9,
	button: 10,
	canvas: 11,
	caption: 12,
	cite: 1,
	code: 1,
	col: 13,
	colgroup: 13,
	data: 14,
	datalist: 15,
	dd: 1,
	del: 16,
	details: 17,
	dfn: 1,
	dialog: 18,
	div: 19,
	dl: 20,
	dt: 1,
	em: 1,
	embed: 21,
	fieldset: 22,
	figcaption: 1,
	figure: 1,
	footer: 1,
	form: 23,
	h1: 24,
	h2: 24,
	h3: 24,
	h4: 24,
	h5: 24,
	h6: 24,
	head: 25,
	header: 1,
	hgroup: 1,
	hr: 26,
	html: 27,
	i: 1,
	iframe: 28,
	img: 29,
	input: 30,
	ins: 16,
	kbd: 1,
	label: 31,
	legend: 32,
	li: 33,
	link: 34,
	main: 1,
	map: 35,
	mark: 1,
	menu: 36,
	meta: 37,
	meter: 38,
	nav: 1,
	noscript: 1,
	object: 39,
	ol: 40,
	optgroup: 41,
	option: 42,
	output: 43,
	p: 44,
	param: 45,
	picture: 46,
	pre: 47,
	progress: 48,
	q: 7,
	rp: 1,
	rt: 1,
	ruby: 1,
	s: 1,
	samp: 1,
	script: 49,
	section: 1,
	select: 50,
	slot: 51,
	small: 1,
	source: 52,
	span: 53,
	strong: 1,
	style: 54,
	sub: 1,
	summary: 1,
	sup: 1,
	table: 55,
	tbody: 56,
	td: 57,
	template: 58,
	textarea: 59,
	tfoot: 56,
	th: 57,
	thead: 56,
	time: 60,
	title: 61,
	tr: 62,
	track: 63,
	u: 1,
	ul: 64,
	'var': 1,
	video: 65,
	wbr: 1,
	svg_a: 68,
	svg_animate: 70,
	svg_animateMotion: 71,
	svg_animateTransform: 72,
	svg_audio: 66,
	svg_canvas: 66,
	svg_circle: 74,
	svg_clipPath: 75,
	svg_defs: 76,
	svg_desc: 77,
	svg_discard: 78,
	svg_ellipse: 79,
	svg_feBlend: 80,
	svg_feColorMatrix: 81,
	svg_feComponentTransfer: 82,
	svg_feComposite: 83,
	svg_feConvolveMatrix: 84,
	svg_feDiffuseLighting: 85,
	svg_feDisplacementMap: 86,
	svg_feDistantLight: 87,
	svg_feDropShadow: 88,
	svg_feFlood: 89,
	svg_feFuncA: 91,
	svg_feFuncB: 92,
	svg_feFuncG: 93,
	svg_feFuncR: 94,
	svg_feGaussianBlur: 95,
	svg_feImage: 96,
	svg_feMerge: 97,
	svg_feMergeNode: 98,
	svg_feMorphology: 99,
	svg_feOffset: 100,
	svg_fePointLight: 101,
	svg_feSpecularLighting: 102,
	svg_feSpotLight: 103,
	svg_feTile: 104,
	svg_feTurbulence: 105,
	svg_filter: 106,
	svg_foreignObject: 107,
	svg_g: 108,
	svg_iframe: 66,
	svg_image: 109,
	svg_line: 110,
	svg_linearGradient: 112,
	svg_marker: 113,
	svg_mask: 114,
	svg_metadata: 115,
	svg_mpath: 116,
	svg_path: 117,
	svg_pattern: 118,
	svg_polygon: 119,
	svg_polyline: 120,
	svg_radialGradient: 121,
	svg_rect: 122,
	svg_script: 123,
	svg_set: 124,
	svg_stop: 125,
	svg_style: 126,
	svg_svg: 127,
	svg_switch: 128,
	svg_symbol: 129,
	svg_text: 132,
	svg_textPath: 133,
	svg_title: 134,
	svg_tspan: 135,
	svg_unknown: 66,
	svg_use: 136,
	svg_video: 66,
	svg_view: 137
};
var keys = Object.keys(TAG_TYPES);
for (let i = 0, items = iter$(keys), len = items.length, typ; i < len; i++) {
	typ = items[i];
	let item = TAG_TYPES[typ];
	item.up = TAG_TYPES[keys[item[0]]];
	item.name = typ + 'Element';
};

for (let ref, i = 0, keys1 = Object.keys(TAG_NAMES), l = keys1.length, name; i < l; i++){
	name = keys1[i];ref = TAG_NAMES[name];TAG_NAMES[name] = TAG_TYPES[keys[ref]];
};


/***/ }),
/* 7 */
/***/ (function(module, exports, __webpack_require__) {

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




var util = __webpack_require__(2);

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
	this.filename = e.filename;
	this.line = e.line;
	this;
};

subclass$(ImbaParseError,Error);
exports.ImbaParseError = ImbaParseError; // export class 
ImbaParseError.wrap = function (err){
	// what about the stacktrace?
	return new this(err);
};

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
	
	return out.join('\n');
};

ImbaParseError.prototype.prettyMessage = function (){
	var excerpt;
	return excerpt = this.excerpt();
};

function ImbaTraverseError(){ return ImbaParseError.apply(this,arguments) };

subclass$(ImbaTraverseError,ImbaParseError);
exports.ImbaTraverseError = ImbaTraverseError; // export class 
ImbaTraverseError.prototype.loc = function (){
	return this._loc;
};

ImbaTraverseError.prototype.excerpt = function (){
	var excerpt = ImbaTraverseError.prototype.__super__.excerpt.apply(this,arguments);
	return excerpt + '\n---\n' + this.error.stack;
};


/***/ }),
/* 8 */
/***/ (function(module, exports, __webpack_require__) {

function idx$(a,b){
	return (b && b.indexOf) ? b.indexOf(a) : [].indexOf.call(a,b);
};
function iter$(a){ return a ? (a.toArray ? a.toArray() : a) : []; };










var T = __webpack_require__(1);
var Token = T.Token;

var constants$ = __webpack_require__(6), INVERSES = constants$.INVERSES, BALANCED_PAIRS = constants$.BALANCED_PAIRS, TOK = constants$.TOK;



var TERMINATOR = 'TERMINATOR';
var INDENT = 'INDENT';
var OUTDENT = 'OUTDENT';
var DEF_BODY = 'DEF_BODY';
var THEN = 'THEN';
var CATCH = 'CATCH';
var EOF = {_type: 'EOF',_value: ''};

var arrayToHash = function(ary) {
	var hash = {};
	for (let i = 0, items = iter$(ary), len = items.length; i < len; i++) {
		hash[items[i]] = 1;
	};
	return hash;
};




var EXPRESSION_CLOSE = [')',']','}','STYLE_END','OUTDENT','CALL_END','PARAM_END','INDEX_END','BLOCK_PARAM_END','STRING_END','}}','TAG_END','CATCH','WHEN','ELSE','FINALLY'];

var EXPRESSION_CLOSE_HASH = arrayToHash(EXPRESSION_CLOSE);

var EXPRESSION_START = {
	'(': 1,
	'[': 1,
	'{': 1,
	'{{': 1,
	'INDENT': 1,
	'CALL_START': 1,
	'PARAM_START': 1,
	'INDEX_START': 1,
	'BLOCK_PARAM_START': 1,
	'STRING_START': 1,
	'TAG_START': 1
};

var EXPRESSION_END = {
	')': 1,
	']': 1,
	'}': 1,
	'}}': 1,
	'OUTDENT': 1,
	'CALL_END': 1,
	'PARAM_END': 1,
	'INDEX_END': 1,
	'BLOCK_PARAM_END': 1,
	'STRING_END': 1,
	'TAG_END': 1
};

var NO_IMPLICIT_PARENS = ['STYLE_START'];
var NO_IMPLICIT_BRACES = ['STYLE_START'];

var SINGLE_LINERS = {
	ELSE: 1,
	TRY: 1,
	FINALLY: 1,
	THEN: 1,
	BLOCK_PARAM_END: 1,
	DO: 1,
	BEGIN: 1,
	CATCH_VAR: 1
};

var SINGLE_CLOSERS_MAP = {
	TERMINATOR: true,
	CATCH: true,
	FINALLY: true,
	ELSE: true,
	OUTDENT: true,
	LEADING_WHEN: true
};

var IMPLICIT_FUNC_MAP = {
	'IDENTIFIER': 1,
	'SUPER': 1,
	'@': 1,
	'THIS': 1,
	'SELF': 1,
	'TAG_END': 1,
	'IVAR': 1,
	'CVAR': 1,
	'ARGVAR': 1,
	'BREAK': 1,
	'CONTINUE': 1,
	'RETURN': 1,
	'INDEX_END': 1,
	']': 1,
	'BANG': 1
};

var IMPLICIT_CALL_MAP = {
	'SELECTOR': 1,
	'IDENTIFIER': 1,
	'NUMBER': 1,
	'STRING': 1,
	'SYMBOL': 1,
	'JS': 1,
	'REGEX': 1,
	'NEW': 1,
	'CLASS': 1,
	'IF': 1,
	'UNLESS': 1,
	'TRY': 1,
	'SWITCH': 1,
	'THIS': 1,
	'BOOL': 1,
	'TRUE': 1,
	'FALSE': 1,
	'NULL': 1,
	'UNDEFINED': 1,
	'UNARY': 1,
	'SUPER': 1,
	'IVAR': 1,
	'ARGVAR': 1,
	'SELF': 1,
	'@': 1,
	'[': 1,
	'(': 1,
	'{': 1,
	'--': 1,
	'++': 1,
	'TAGID': 1,
	'#': 1,
	'TAG_START': 1,
	'PARAM_START': 1,
	'SELECTOR_START': 1,
	'STRING_START': 1,
	'IDREF': 1,
	'SPLAT': 1,
	'DO': 1,
	'BLOCK_ARG': 1,
	'FOR': 1,
	'CONTINUE': 1,
	'BREAK': 1
};


var IDENTIFIERS = ['IDENTIFIER','IVAR','DECORATOR','ARGVAR'];




var IMPLICIT_FUNC = ['IDENTIFIER','SUPER','@','THIS','SELF','EVENT','TRIGGER','TAG_END','IVAR','CVAR',
'ARGVAR','BREAK','CONTINUE','RETURN','BANG'];


var IMPLICIT_CALL = [
	'SELECTOR','IDENTIFIER','NUMBER','STRING','SYMBOL','JS','REGEX','NEW','PARAM_START','CLASS',
	'IF','UNLESS','TRY','SWITCH','THIS','BOOL','TRUE','FALSE','NULL','UNDEFINED','UNARY','SUPER','IVAR','ARGVAR','SELF',
	'@','[','(','{','--','++','SELECTOR','TAG_START','TAGID','#','SELECTOR_START','IDREF','SPLAT','DO','BLOCK_ARG',
	'FOR','STRING_START','CONTINUE','BREAK'
]; 

var IMPLICIT_INDENT_CALL = [
	'FOR'
];


var IMPLICIT_UNSPACED_CALL = ['+','-'];


var IMPLICIT_BLOCK = ['{','[',',','BLOCK_PARAM_END','DO']; 

var IMPLICIT_BLOCK_MAP = arrayToHash(IMPLICIT_BLOCK);

var CONDITIONAL_ASSIGN = ['||=','&&=','?=','&=','|='];
var COMPOUND_ASSIGN = ['-=','+=','/=','*=','%=','||=','&&=','?=','<<=','>>=','>>>=','&=','^=','|=','**='];
var UNARY = ['!','~','NEW','TYPEOF','DELETE'];
var LOGIC = ['&&','||','&','|','^'];


var NO_IMPLICIT_BLOCK_CALL = [
	'CALL_END','=','DEF_BODY','(','CALL_START',',',':','RETURN',
	'-=','+=','/=','*=','%=','||=','&&=','?=','<<=','>>=','>>>=','&=','^=','|=','**='
]; 

var NO_CALL_TAG = ['CLASS','IF','UNLESS','TAG','WHILE','FOR','UNTIL','CATCH','FINALLY','MODULE','LEADING_WHEN','STRUCT'];

var NO_CALL_TAG_MAP = arrayToHash(NO_CALL_TAG);






var IMPLICIT_COMMA = ['DO'];


var IMPLICIT_END = ['POST_IF','POST_UNLESS','POST_FOR','WHILE','UNTIL','WHEN','BY','LOOP','TERMINATOR','DEF_BODY'];

var IMPLICIT_END_MAP = {
	POST_IF: true,
	POST_UNLESS: true,
	POST_FOR: true,
	WHILE: true,
	UNTIL: true,
	WHEN: true,
	BY: true,
	LOOP: true,
	TERMINATOR: true,
	DEF_BODY: true
};




var SINGLE_CLOSERS = ['TERMINATOR','CATCH','FINALLY','ELSE','OUTDENT','LEADING_WHEN'];
var LINEBREAKS = ['TERMINATOR','INDENT','OUTDENT']; 

var CALLCOUNT = 0;

function Rewriter(){
	this._tokens = [];
	this._options = {};
	this._len = 0;
	this._starter = null;
	this;
};

exports.Rewriter = Rewriter; // export class 
Rewriter.prototype.reset = function (){
	this._starter = null;
	this._len = 0;
	return this;
};

Rewriter.prototype.tokens = function (){
	return this._tokens;
};








Rewriter.prototype.rewrite = function (tokens,opts){
	if(opts === undefined) opts = {};
	this.reset();
	
	this._tokens = tokens;
	this._options = opts;
	
	var i = 0;
	var k = tokens.length;
	
	while (i < (k - 1)){
		var token = tokens[i];
		
		if (token._type == 'DEF_BODY') {
			var next = tokens[i + 1];
			if (next && next._type == TERMINATOR) {
				token._type = 'DEF_EMPTY';
			};
		};
		i++;
	};
	
	this.step("all");
	if (CALLCOUNT) { console.log(CALLCOUNT) };
	return this._tokens;
};

Rewriter.prototype.all = function (){
	this.step("ensureFirstLine");
	this.step("removeLeadingNewlines");
	if (this._options.target == 'tsc') {
		this.step("addPlaceholderIdentifiers");
	};
	
	this.step("removeMidExpressionNewlines");
	this.step("tagDefArguments");
	this.step("closeOpenTags");
	this.step("addImplicitIndentation");
	this.step("tagPostfixConditionals");
	this.step("addImplicitBraces");
	return this.step("addImplicitParentheses");
};

Rewriter.prototype.step = function (fn){
	this[fn]();
	return;
};






Rewriter.prototype.scanTokens = function (block){
	var tokens = this._tokens;
	
	var i = 0;
	while (i < tokens.length){
		i += block.call(this,tokens[i],i,tokens);
	};
	return true;
};

Rewriter.prototype.detectEnd = function (i,condition,action,state){
	
	if(state === undefined) state = {};
	var tokens = this._tokens;
	var levels = 0;
	var token;
	var t,v;
	
	while (i < tokens.length){
		token = tokens[i];
		
		if (levels == 0 && condition.call(this,token,i,tokens,state)) {
			return action.call(this,token,i,tokens,state);
		};
		
		if (!token || levels < 0) {
			return action.call(this,token,i - 1,tokens,state);
		};
		
		t = token._type;
		
		if (EXPRESSION_START[t]) {
			levels += 1;
		} else if (EXPRESSION_END[t]) {
			levels -= 1;
		};
		i += 1;
	};
	
	return i - 1;
};

Rewriter.prototype.ensureFirstLine = function (){
	var token = this._tokens[0];
	
	if (token._type === TERMINATOR) {
		this._tokens.unshift(T.token('BODYSTART','BODYSTART'));
		
	};
	return;
};

Rewriter.prototype.addPlaceholderIdentifiers = function (){
	let nextTest = /^([\,\]\)\}]|\}\})$/;
	return this.scanTokens(function(token,i,tokens) { // do |token,i,tokens|
		var prev = tokens[i - 1] || EOF;
		var next = tokens[i + 1] || EOF;
		
		if (prev._type == '=' || prev._type == ':') {
			if ((token._type === TERMINATOR && next._type != 'INDENT') || token._type == ',' || token._type == 'DEF_BODY') {
				tokens.splice(i,0,new Token('IDENTIFIER','$CARET$',token._loc,0));
				return 2;
			};
		} else if (prev._type == '.') {
			if ((token._type === TERMINATOR && next._type != 'INDENT') || nextTest.test(token._value)) {
				tokens.splice(i,0,new Token('IDENTIFIER','$CARET$',token._loc,0));
				return 2;
			};
		};
		
		return 1;
	});
};



Rewriter.prototype.removeLeadingNewlines = function (){
	var at = 0;
	
	var i = 0; 
	var tokens = this._tokens;
	var token;
	var l = tokens.length;
	
	while (i < l){
		token = tokens[i];
		if (token._type !== TERMINATOR) {
			at = i;break;
		};
		i++;
	};
	
	if (at) { tokens.splice(0,at) };
	return;
};



Rewriter.prototype.removeMidExpressionNewlines = function (){
	
	return this.scanTokens(function(token,i,tokens) { // do |token,i,tokens|
		var next = (tokens.length > (i + 1)) ? tokens[i + 1] : null;
		if (!(token._type === TERMINATOR && next && EXPRESSION_CLOSE_HASH[next._type])) { return 1 }; 
		if (next && next._type == OUTDENT) { return 1 };
		
		tokens.splice(i,1);
		return 0;
	});
};


Rewriter.prototype.tagDefArguments = function (){
	return true;
};



Rewriter.prototype.closeOpenTags = function (){
	var self = this;
	var condition = function(token,i) { return token._type == '>' || token._type == 'TAG_END'; };
	var action = function(token,i) { return token._type = 'TAG_END'; };
	
	return self.scanTokens(function(token,i,tokens) {
		if (token._type === 'TAG_START') { self.detectEnd(i + 1,condition,action) };
		return 1;
	});
};

Rewriter.prototype.addImplicitBlockCalls = function (){
	var i = 1;
	var tokens = this._tokens;
	
	
	while (i < tokens.length){
		
		var token = tokens[i];
		var t = token._type;
		var v = token._value;
		
		if (t == 'DO' && (v == 'INDEX_END' || v == 'IDENTIFIER' || v == 'NEW')) {
			tokens.splice(i + 1,0,T.token('CALL_END',')'));
			tokens.splice(i + 1,0,T.token('CALL_START','('));
			i++;
		};
		i++;
	};
	
	return;
};




Rewriter.prototype.addLeftBrace = function (){
	return this;
};

Rewriter.prototype.addImplicitBraces = function (){
	// Worst mess every written. Shuold be redone
	var self = this;
	var stack = [];
	var prevStack = null;
	var start = null;
	var startIndent = 0;
	var startIdx = null;
	var baseCtx = ['ROOT',0];
	
	var defType = 'DEF';
	var noBraceContext = ['IF','TERNARY','FOR',defType];
	
	var noBrace = false;
	
	var action = function(token,i) {
		return self._tokens.splice(i,0,T.RBRACKET);
	};
	
	var open = function(token,i,scope) {
		let tok = new Token('{','{',0,0,0); 
		tok.generated = true;
		tok.scope = scope;
		return self._tokens.splice(i,0,tok); 
	};
	
	var close = function(token,i,scope) {
		let tok = new Token('}','}',0,0,0); 
		tok.generated = true;
		tok.scope = scope;
		return self._tokens.splice(i,0,tok); 
	};
	
	var stackToken = function(a,b) {
		return [a,b];
	};
	
	var indents = [];
	var balancedStack = [];
	
	
	return self.scanTokens(function(token,i,tokens) {
		var type = token._type;
		var v = token._value;
		
		if (type == 'CSS_SEL' && token._closer) {
			let idx = tokens.indexOf(token._closer);
			
			return idx - i + 1;
		};
		
		if (type == 'STYLE_START' && token._closer) {
			return tokens.indexOf(token._closer) - i;
		};
		
		
		if (BALANCED_PAIRS[type]) {
			balancedStack.unshift(type);
		} else if (INVERSES[type] && INVERSES[type] == balancedStack[0]) {
			balancedStack.shift();
		};
		
		if (NO_IMPLICIT_BRACES.indexOf(balancedStack[0]) >= 0) {
			return 1;
		};
		
		var ctx = stack.length ? stack[stack.length - 1] : baseCtx;
		var idx;
		
		
		if (type == 'INDENT') {
			indents.unshift(token.scope);
		} else if (type == 'OUTDENT') {
			indents.shift();
		};
		
		if (noBraceContext.indexOf(type) >= 0 && type != defType) {
			stack.push(stackToken(type,i));
			return 1;
		};
		
		if (v == '?') {
			stack.push(stackToken('TERNARY',i));
			return 1;
		};
		
		
		
		
		
		
		
		if (EXPRESSION_START[type]) {
			if (type === INDENT && noBraceContext.indexOf(ctx[0]) >= 0) {
				stack.pop();
			};
			
			let tt = self.tokenType(i - 1);
			
			if (type === INDENT && (tt == '{' || tt == 'STYLE_START')) {
				stack.push(stackToken('{',i)); 
			} else {
				stack.push(stackToken(type,i));
			};
			return 1;
		};
		
		if (EXPRESSION_END[type]) {
			if (ctx[0] == 'TERNARY') {
				stack.pop();
			};
			
			start = stack.pop();
			start[2] = i;
			
			
			if (start[0] == '{' && start.generated) {
				close(token,i);
				return 1;
			};
			
			return 1;
		};
		
		
		if (ctx[0] == 'TERNARY' && (type === TERMINATOR || type === OUTDENT)) {
			stack.pop();
			return 1;
		};
		
		if (noBraceContext.indexOf(ctx[0]) >= 0 && type === INDENT) {
			stack.pop();
			return 1;
		};
		
		
		if (type == ',') {
			if (ctx[0] == '{' && ctx.generated) {
				close(token,i,stack.pop());
				return 2;
			} else {
				return 1;
			};
			true;
		};
		
		
		
		
		let isDefInObject = (type == defType) && idx$(indents[0],['CLASS','DEF','MODULE','TAG','STRUCT']) == -1;
		
		if ((type == ':' || isDefInObject) && ctx[0] != '{' && ctx[0] != 'TERNARY' && (noBraceContext.indexOf(ctx[0]) == -1 || ctx[0] == defType)) {
			// could just check if the end was right before this?
			
			var tprev = tokens[i - 2];
			let autoClose = false;
			
			if (type == defType) {
				idx = i - 1;
				tprev = tokens[idx];
			} else if (start && start[2] == i - 1) {
				idx = start[1] - 1; 
			} else {
				idx = i - 2; 
			};
			
			while (self.tokenType(idx - 1) === 'HERECOMMENT'){
				idx -= 2;
			};
			
			var t0 = tokens[idx - 1];
			var t1 = tokens[idx];
			
			
			
			
			
			if (!tprev || (idx$(tprev._type,['INDENT','TERMINATOR']) == -1)) {
				autoClose = true;
			};
			
			if (indents[0] && idx$(indents[0],['CLASS','DEF','MODULE','TAG','STRUCT']) >= 0) {
				autoClose = true;
			};
			
			if (t0 && T.typ(t0) == '}' && t0.generated && ((t1._type == ',' && !t1.generated) || !(t0.scope && t0.scope.autoClose))) { //  and !autoClose
				// console.log "merge with previous"
				// if we find a closing token inserted here -- move it
				tokens.splice(idx - 1,1);
				var s = stackToken('{',i - 1);
				s.generated = true;
				
				stack.push(s);
				if (type == defType) {
					stack.push(stackToken(defType,i));
					return 1;
				};
				return 0;
			} else if (t0 && T.typ(t0) == ',' && self.tokenType(idx - 2) == '}') {
				// console.log "comma",tokens[idx - 2]:scope
				tokens.splice(idx - 2,1);
				s = stackToken('{');
				s.generated = true;
				
				stack.push(s);
				
				if (type == defType) {
					stack.push(stackToken(defType,i));
					return 1;
				};
				
				return 0;
			} else {
				if (type == defType && (!t0 || t0._type != '=')) {
					stack.push(stackToken(defType,i));
					return 1;
				};
				
				s = stackToken('{');
				s.generated = true;
				s.autoClose = autoClose;
				stack.push(s);
				open(token,idx + 1); 
				
				if (type == defType) {
					stack.push(stackToken(defType,i));
					return 3;
				};
				
				return 2;
			};
		};
		
		
		
		if (type == 'DO') { // and ctx:generated"
			var prev = T.typ(tokens[i - 1]);
			if (['NUMBER','STRING','REGEX','SYMBOL',']','}',')','STRING_END'].indexOf(prev) >= 0) {
				
				var tok = T.token(',',',');
				tok.generated = true;
				tokens.splice(i,0,tok);
				
				if (ctx.generated) {
					close(token,i);
					stack.pop();
					return 2;
				};
			};
		};
		
		if (ctx.generated && (type === TERMINATOR || type === OUTDENT || type === 'DEF_BODY')) {
			prevStack = stack.pop();
			close(token,i,prevStack);
			return 2;
		};
		
		return 1;
	});
};





Rewriter.prototype.addImplicitParentheses = function (){
	var self = this;
	var tokens = self._tokens;
	
	var noCall = false;
	var seenFor = false;
	var endCallAtTerminator = false;
	
	var seenSingle = false;
	var seenControl = false;
	
	var callObject = false;
	var callIndent = false;
	
	var parensAction = function(token,i,tokens) {
		return tokens.splice(i,0,T.token('CALL_END',')'));
	};
	
	
	
	var parensCond = function(token,i,tokens) {
		
		var type = token._type;
		
		if (!seenSingle && token.fromThen) {
			return true;
		};
		
		var ifelse = type == 'IF' || type == 'UNLESS' || type == 'ELSE';
		
		if (ifelse || type === 'CATCH') {
			seenSingle = true;
		};
		
		if (ifelse || type === 'SWITCH' || type == 'TRY') {
			seenControl = true;
		};
		
		var prev = self.tokenType(i - 1);
		
		if ((type == '.' || type == '?.' || type == '::') && prev === OUTDENT) {
			return true;
		};
		
		if (endCallAtTerminator && (type === INDENT || type === TERMINATOR)) {
			return true;
		};
		
		if ((type == 'WHEN' || type == 'BY') && !seenFor) {
			// console.log "dont close implicit call outside for"
			return false;
		};
		
		var post = (tokens.length > (i + 1)) ? tokens[i + 1] : null;
		var postTyp = post && post._type;
		
		if (token.generated || prev === ',') {
			return false;
		};
		
		var cond1 = (IMPLICIT_END_MAP[type] || (type == INDENT && !seenControl) || (type == 'DOS' && prev != '='));
		
		if (!cond1) {
			return false;
		};
		
		if (type !== INDENT) {
			return true;
		};
		
		if (!IMPLICIT_BLOCK_MAP[prev] && self.tokenType(i - 2) != 'CLASS' && !(post && ((post.generated && postTyp == '{') || IMPLICIT_CALL_MAP[postTyp]))) {
			return true;
		};
		
		return false;
	};
	
	var i = 0;
	let stack = [];
	let currPair = null;
	
	while (tokens.length > (i + 1)){
		var token = tokens[i];
		var type = token._type;
		
		if ((type == 'STYLE_START' || type == 'CSS_SEL') && token._closer) {
			i = tokens.indexOf(token._closer) + 1;
			continue;
		};
		
		if (BALANCED_PAIRS[type]) {
			stack.push(currPair = type);
		} else if (INVERSES[type] && INVERSES[type] == currPair) {
			stack.pop();
			currPair = stack[stack.length - 1];
		};
		
		if (NO_IMPLICIT_PARENS.indexOf(currPair) >= 0) {
			i++;
			continue;
		};
		
		var prev = (i > 0) ? tokens[i - 1] : null;
		var next = tokens[i + 1];
		
		var pt = prev && prev._type;
		var nt = next && next._type;
		
		if (type === INDENT && (pt == ')' || pt == ']')) {
			noCall = true;
		};
		
		if (NO_CALL_TAG_MAP[pt]) { // .indexOf(pt) >= 0
			// CALLCOUNT++
			// console.log("seen nocall tag {pt} ({pt} {type} {nt})")
			endCallAtTerminator = true;
			noCall = true;
			if (pt == 'FOR') {
				seenFor = true;
			};
		};
		
		callObject = false;
		callIndent = false;
		
		if (!noCall && type == INDENT && next) {
			var prevImpFunc = pt && IMPLICIT_FUNC_MAP[pt];
			var nextImpCall = nt && IMPLICIT_CALL_MAP[nt];
			
			callObject = ((next.generated && nt == '{') || nextImpCall) && prevImpFunc;
			callIndent = nextImpCall && prevImpFunc;
		};
		
		seenSingle = false;
		seenControl = false;
		
		
		if ((type == TERMINATOR || type == OUTDENT || type == INDENT)) {
			endCallAtTerminator = false;
			noCall = false;
		};
		
		if (type == '?' && prev && !prev.spaced) {
			token.call = true;
		};
		
		
		if (token.fromThen) {
			i += 1;continue;
		};
		
		
		if (!(callObject || callIndent || (prev && prev.spaced) && (prev.call || IMPLICIT_FUNC_MAP[pt]) && (IMPLICIT_CALL_MAP[type] || !(token.spaced || token.newLine) && IMPLICIT_UNSPACED_CALL.indexOf(type) >= 0))) {
			i += 1;continue;
		};
		
		
		tokens.splice(i,0,T.token('CALL_START','('));
		
		
		self.detectEnd(i + 1,parensCond,parensAction);
		
		if (prev._type == '?') {
			prev._type = 'FUNC_EXIST';
		};
		
		i += 2;
		
		
		endCallAtTerminator = false;
		noCall = false;
		seenFor = false;
	};
	
	return;
};



Rewriter.prototype.indentCondition = function (token,i,tokens){
	var t = token._type;
	return SINGLE_CLOSERS_MAP[t] && token._value !== ';' && !(t == 'ELSE' && this._starter != 'IF' && this._starter != 'THEN');
};

Rewriter.prototype.indentAction = function (token,i,tokens){
	var idx = (this.tokenType(i - 1) === ',') ? ((i - 1)) : i;
	tokens.splice(idx,0,T.OUTDENT);
	return;
};






Rewriter.prototype.addImplicitIndentation = function (){
	
	var lookup1 = {
		OUTDENT: 1,
		TERMINATOR: 1,
		FINALLY: 1
	};
	
	var i = 0;
	var tokens = this._tokens;
	var starter;
	
	while (i < tokens.length){
		var token = tokens[i];
		var type = token._type;
		var next = this.tokenType(i + 1);
		
		
		if (type === TERMINATOR && next === THEN) {
			tokens.splice(i,1);
			continue;
		};
		
		if (type === CATCH && lookup1[this.tokenType(i + 2)]) {
			tokens.splice(i + 2,0,T.token(INDENT,'2'),T.token(OUTDENT,'2'));
			i += 4;
			continue;
		};
		
		if (SINGLE_LINERS[type] && (next != INDENT && next != 'BLOCK_PARAM_START') && !(type == 'ELSE' && next == 'IF') && type != 'ELIF') {
			this._starter = starter = type;
			
			var indent = T.token(INDENT,'2');
			if (starter === THEN) { indent.fromThen = true };
			indent.generated = true;
			tokens.splice(i + 1,0,indent);
			this.detectEnd(i + 2,this.indentCondition,this.indentAction);
			if (type === THEN) { tokens.splice(i,1) };
		};
		i++;
	};
	
	return;
};



Rewriter.prototype.tagPostfixConditionals = function (){
	var self = this;
	var condition = function(token,i,tokens) { return token._type === TERMINATOR || token._type === INDENT; };
	var action = function(token,i,tokens,s) {
		if (token._type != INDENT) {
			if (s.unfinished) {
				return tokens.splice(i,0,T.token('EMPTY_BLOCK',''));
				
			} else {
				return T.setTyp(s.original,'POST_' + s.original._type);
			};
		};
	};
	
	return self.scanTokens(function(token,i,tokens) {
		var typ = token._type;
		if (!(typ == 'IF' || typ == 'FOR')) { return 1 };
		let unfinished = tokens[i - 1] && condition(tokens[i - 1]);
		self.detectEnd(i + 1,condition,action,{original: token,unfinished: unfinished});
		return 1;
	});
};


Rewriter.prototype.type = function (i){
	// if i < 0 then return null
	throw "deprecated";
	var tok = this._tokens[i];
	return tok && tok._type;
};

Rewriter.prototype.injectToken = function (index,token){
	return this;
};

Rewriter.prototype.tokenType = function (i){
	if (i < 0 || i >= this._tokens.length) {
		// CALLCOUNT++
		return null;
	};
	
	var tok = this._tokens[i];
	return tok && tok._type;
};





/***/ }),
/* 9 */
/***/ (function(module, exports, __webpack_require__) {

/* parser generated by jison-fork */
var parser = (function(){
var o=function(k,v,o,l){for(o=o||{},l=k.length;l--;o[k[l]]=v);return o},$V0=[1,4],$V1=[1,132],$V2=[1,6],$V3=[1,7],$V4=[1,37],$V5=[1,38],$V6=[1,39],$V7=[1,40],$V8=[1,43],$V9=[1,123],$Va=[1,44],$Vb=[1,42],$Vc=[1,125],$Vd=[1,104],$Ve=[1,129],$Vf=[1,130],$Vg=[1,138],$Vh=[1,98],$Vi=[1,124],$Vj=[1,139],$Vk=[1,91],$Vl=[1,92],$Vm=[1,93],$Vn=[1,94],$Vo=[1,95],$Vp=[1,96],$Vq=[1,97],$Vr=[1,83],$Vs=[1,102],$Vt=[1,82],$Vu=[1,45],$Vv=[1,16],$Vw=[1,17],$Vx=[1,103],$Vy=[1,69],$Vz=[1,68],$VA=[1,99],$VB=[1,80],$VC=[1,121],$VD=[1,101],$VE=[1,33],$VF=[1,34],$VG=[1,108],$VH=[1,107],$VI=[1,106],$VJ=[1,128],$VK=[1,46],$VL=[1,47],$VM=[1,48],$VN=[1,135],$VO=[1,136],$VP=[1,137],$VQ=[1,109],$VR=[1,65],$VS=[1,89],$VT=[1,49],$VU=[1,55],$VV=[1,85],$VW=[1,120],$VX=[1,100],$VY=[1,131],$VZ=[1,74],$V_=[1,84],$V$=[1,115],$V01=[1,116],$V11=[1,117],$V21=[1,133],$V31=[1,134],$V41=[1,78],$V51=[1,114],$V61=[1,66],$V71=[1,67],$V81=[1,70],$V91=[1,71],$Va1=[1,141],$Vb1=[1,6,17],$Vc1=[1,6,13,14,15,16,17,29,30,37,58,81,91,140,144,145,146,165,172,176,178,184,199,202,210,211,212,241,248,264,268,274,275,279,280,281,285,287,288,296,300,303,304,305,310,311,312,313],$Vd1=[1,146],$Ve1=[1,150],$Vf1=[1,147],$Vg1=[1,148],$Vh1=[1,153],$Vi1=[1,152],$Vj1=[1,156],$Vk1=[1,157],$Vl1=[1,149],$Vm1=[1,151],$Vn1=[1,154],$Vo1=[1,155],$Vp1=[1,160],$Vq1=[1,167],$Vr1=[1,168],$Vs1=[1,177],$Vt1=[1,6,14,15,16,17,30,37,58,81,91,140,144,145,146,165,172,176,178,184,202,211,212,268,279,280,281,287,288,296,304,305,310,311,312,313],$Vu1=[1,183],$Vv1=[2,385],$Vw1=[1,181],$Vx1=[1,185],$Vy1=[1,178],$Vz1=[1,184],$VA1=[1,6,13,14,16,17,29,30,37,58,79,90,91,117,154,155,156,157,158,159,160,163,164,165,166,193,194],$VB1=[1,6,17,279,281,287,288,304],$VC1=[1,192],$VD1=[1,194],$VE1=[1,204],$VF1=[1,203],$VG1=[12,35,164],$VH1=[1,209],$VI1=[1,6,13,14,15,16,17,29,30,37,58,81,91,140,144,145,146,165,172,176,178,184,199,202,210,211,212,241,248,264,268,279,280,281,287,288,296,304,305,310,311,312,313],$VJ1=[2,322],$VK1=[1,212],$VL1=[1,6,11,13,14,15,16,17,29,30,37,58,81,91,140,144,145,146,165,166,172,176,178,184,199,202,210,211,212,241,248,264,268,279,280,281,287,288,296,304,305,310,311,312,313],$VM1=[2,317],$VN1=[6,13,29,79,90,117,153,154,155,156,157,158,159,160,163,164,166,193,194],$VO1=[1,244],$VP1=[1,243],$VQ1=[1,247],$VR1=[1,252],$VS1=[1,257],$VT1=[1,254],$VU1=[1,258],$VV1=[1,260],$VW1=[1,262],$VX1=[1,6,13,14,15,16,17,29,30,35,37,58,81,91,113,114,140,144,145,146,165,172,176,178,184,199,202,210,211,212,241,248,264,268,279,280,281,287,288,296,304,305,310,311,312,313],$VY1=[1,6,11,13,14,15,16,17,29,30,37,58,81,91,140,144,145,146,165,166,172,176,178,184,199,202,210,211,212,241,248,264,268,279,280,281,287,288,296,304,305,308,309,310,311,312,313,314],$VZ1=[1,271],$V_1=[1,290],$V$1=[1,292],$V02=[2,337],$V12=[1,309],$V22=[1,304],$V32=[1,303],$V42=[1,322],$V52=[1,321],$V62=[12,35,164,292],$V72=[1,6,13,14,15,16,17,29,30,37,58,80,81,91,99,101,140,144,145,146,165,172,176,178,184,199,202,210,211,212,241,248,264,268,279,280,281,287,288,296,304,305,310,311,312,313],$V82=[2,8],$V92=[1,6,17,58],$Va2=[1,6,17,58,166],$Vb2=[1,356],$Vc2=[1,359],$Vd2=[1,367],$Ve2=[1,369],$Vf2=[1,371],$Vg2=[1,6,14,15,16,17,30,37,58,81,91,140,144,145,146,165,172,176,178,184,202,211,212,268,279,280,281,287,288,296,304,305,310,311,313],$Vh2=[1,385],$Vi2=[1,390],$Vj2=[6,13,29,79,90,117,154,155,156,157,158,159,160,163,164,166,193,194],$Vk2=[1,410],$Vl2=[1,409],$Vm2=[6,13,29,35,79,90,117,153,154,155,156,157,158,159,160,162,163,164,166,193,194],$Vn2=[6,16],$Vo2=[2,262],$Vp2=[1,417],$Vq2=[6,16,17,58,91],$Vr2=[2,404],$Vs2=[1,6,11,13,14,15,16,17,29,30,37,58,81,91,140,144,145,146,165,166,172,176,178,184,199,202,210,211,212,241,248,264,268,279,280,281,287,288,294,295,296,304,305,310,311,312,313],$Vt2=[1,424],$Vu2=[6,14,16,17,30,58,91,165],$Vv2=[2,266],$Vw2=[1,434],$Vx2=[1,435],$Vy2=[1,6,14,15,16,17,30,37,58,81,91,140,165,172,176,202,211,212,268,288,296,304],$Vz2=[1,6,14,15,16,17,30,37,58,81,91,140,165,172,176,202,211,212,268,280,288,296,304],$VA2=[294,295],$VB2=[58,294,295],$VC2=[1,6,14,15,17,30,37,58,81,91,140,144,145,146,165,172,176,178,202,211,212,268,279,280,281,287,288,296,304,305,310,311,312,313],$VD2=[1,458],$VE2=[1,463],$VF2=[1,464],$VG2=[1,468],$VH2=[6,16,17,37,58],$VI2=[6,16,17,37,58,140],$VJ2=[6,16,17,37,58,140,166],$VK2=[58,211,212],$VL2=[1,480],$VM2=[2,259],$VN2=[79,210],$VO2=[12,29,35,58,79,164,176,210,211,212,222],$VP2=[1,6,11,13,14,15,16,17,29,30,37,58,80,81,91,140,144,145,146,165,166,172,176,178,184,199,202,210,211,212,241,248,264,268,279,280,281,287,288,296,304,305,308,309,310,311,312,313,314],$VQ2=[1,6,14,15,16,17,30,37,58,81,91,140,145,146,165,172,176,178,184,202,211,212,268,279,280,281,287,288,296,304,305,311,313],$VR2=[1,6,14,15,16,17,30,37,58,81,91,140,144,145,146,165,172,176,178,184,202,211,212,268,279,280,281,287,288,296,304,305,311,313],$VS2=[1,6,14,15,16,17,30,37,58,81,91,140,165,172,176,202,211,212,268,280,296],$VT2=[1,496],$VU2=[6,17,127,133,142],$VV2=[1,6,14,15,16,17,30,37,58,81,91,140,165,172,176,202,211,212,268,279,280,281,287,288,296,304],$VW2=[1,6,11,17,30,58,166,202,211,212],$VX2=[1,6,14,15,16,17,30,37,58,81,91,140,144,145,146,165,172,176,178,184,202,211,212,268,279,280,281,285,287,288,296,303,304,305,310,311,312,313],$VY2=[17,285,300],$VZ2=[1,6,14,15,17,30,37,58,81,91,140,144,145,146,165,172,176,178,184,202,211,212,268,279,280,281,287,288,296,304,305,310,311,312,313],$V_2=[30,58],$V$2=[6,16,17],$V03=[2,263],$V13=[1,555],$V23=[12,27,28,31,32,35,55,62,79,86,88,90,95,98,102,103,104,105,106,107,108,109,112,115,128,129,131,145,146,164,180,181,187,198,199,203,204,229,230,231,237,238,243,244,246,251,253,265,266,271,277,279,281,283,287,288,297,302,306,307,308,309],$V33=[1,560],$V43=[1,561],$V53=[1,566],$V63=[30,58,202,211,212],$V73=[30,58,166,202,211,212],$V83=[1,6,14,15,16,17,30,37,58,81,91,140,165,172,176,202,211,212,268,279,281,287,288,296,304],$V93=[6,17],$Va3=[6,12,17,82,203,204,259,260],$Vb3=[6,11,17,166],$Vc3=[1,596],$Vd3=[12,82,164],$Ve3=[1,607],$Vf3=[1,608],$Vg3=[211,212],$Vh3=[1,618],$Vi3=[1,619],$Vj3=[1,628],$Vk3=[1,640],$Vl3=[1,638],$Vm3=[1,634],$Vn3=[1,635],$Vo3=[1,636],$Vp3=[1,637],$Vq3=[15,16,58],$Vr3=[1,656],$Vs3=[1,658],$Vt3=[1,660],$Vu3=[12,17,27,28,31,32,35,55,62,79,86,88,90,95,98,102,103,104,105,106,107,108,109,112,115,128,129,131,145,146,164,176,178,180,181,187,193,194,198,199,203,204,223,229,230,231,237,238,243,244,246,251,253,265,266,271,277,279,281,283,287,288,297,302,306,307,308,309],$Vv3=[1,718],$Vw3=[1,6,14,15,16,17,30,37,58,81,91,127,133,140,142,144,145,146,165,172,176,178,184,202,211,212,268,279,280,281,287,288,296,304,305,310,311,312,313],$Vx3=[1,720],$Vy3=[6,17,30,58,127,133,142],$Vz3=[1,723],$VA3=[1,724],$VB3=[1,725],$VC3=[6,12,17,30,55,58,95,127,133,142,144,145,146,149,150,151,152],$VD3=[1,733],$VE3=[6,16,17,30,58],$VF3=[1,760],$VG3=[1,761];
var parser = {trace: function trace () { },
yy: {},
symbols_: {"error":2,"Root":3,"Body":4,"Block":5,"TERMINATOR":6,"BODYSTART":7,"Line":8,"Terminator":9,"TypeAnnotation":10,"TYPE":11,"IDENTIFIER":12,"INDEX_START":13,"INDEX_END":14,"EMPTY_BLOCK":15,"INDENT":16,"OUTDENT":17,"CSSDeclaration":18,"VarBlock":19,"Expression":20,"Comment":21,"Statement":22,"ImportDeclaration":23,"ExportDeclaration":24,"Return":25,"Throw":26,"STATEMENT":27,"BREAK":28,"CALL_START":29,"CALL_END":30,"CONTINUE":31,"DEBUGGER":32,"StructDeclaration":33,"EXPORT":34,"{":35,"ImportSpecifierList":36,"}":37,"FROM":38,"String":39,"EXPORT_ALL":40,"AS":41,"Identifier":42,"Exportable":43,"DEFAULT":44,"EXPORT_VAR":45,"MethodDeclaration":46,"Class":47,"TagDeclaration":48,"ImportOrExport":49,"IMPORT":50,"ImportDefaultSpecifier":51,"ImportNamespaceSpecifier":52,"IMPORT_COMMA":53,"ImportFrom":54,"STRING":55,"IMPORT_ALL":56,"ImportSpecifier":57,",":58,"OptComma":59,"DecoratorIdentifier":60,"Require":61,"REQUIRE":62,"RequireArg":63,"Literal":64,"Parenthetical":65,"Await":66,"Value":67,"Code":68,"Operation":69,"Assign":70,"If":71,"Ternary":72,"Try":73,"While":74,"For":75,"Switch":76,"Tag":77,"Private":78,"#":79,"{{":80,"}}":81,"DECORATOR":82,"Key":83,"KEY":84,"Argvar":85,"ARGVAR":86,"Symbol":87,"SYMBOL":88,"Decorator":89,"(":90,")":91,"ArgList":92,"Decorators":93,"AlphaNumeric":94,"NUMBER":95,"UNIT":96,"InterpolatedString":97,"STRING_START":98,"NEOSTRING":99,"Interpolation":100,"STRING_END":101,"JS":102,"REGEX":103,"BOOL":104,"TRUE":105,"FALSE":106,"NULL":107,"UNDEFINED":108,"RETURN":109,"Arguments":110,"Selector":111,"SELECTOR_START":112,"SELECTOR_PART":113,"SELECTOR_END":114,"TAG_START":115,"TagOptions":116,"TAG_END":117,"TagBody":118,"TagTypeName":119,"Self":120,"TAG_TYPE":121,"TagIdentifier":122,"StyleBlockDeclaration":123,"CSS":124,"CSS_SEL":125,"StyleBody":126,"CSS_END":127,"GLOBAL":128,"LOCAL":129,"StyleDefinition":130,"STYLE_DECL":131,"STYLE_START":132,"STYLE_END":133,"NestedStyleRule":134,"StyleBlockBody":135,"Outdent":136,"StyleNode":137,"StyleDeclaration":138,"StyleProperty":139,":":140,"StyleExpressions":141,"CSSPROP":142,"StyleOperator":143,"MATH":144,"+":145,"-":146,"StyleExpression":147,"StyleTerm":148,"CSSVAR":149,"DIMENSION":150,"COLOR":151,"PERCENTAGE":152,"TAG_REF":153,"TAG_ID":154,"TAG_FLAG":155,"TAG_ATTR":156,"TAG_ON":157,"T.":158,"T:":159,"T@":160,"@":161,"TAG_LITERAL":162,"TAG_WS":163,"[":164,"]":165,"=":166,"TagAttrValue":167,"TagFlag":168,"%":169,"TagPartIdentifier":170,"VALUE_START":171,"VALUE_END":172,"TagBodyList":173,"TagBodyItem":174,"SEPARATOR":175,"...":176,"Splat":177,"LOGIC":178,"TagDeclarationBlock":179,"EXTEND":180,"TAG":181,"TagType":182,"ClassBody":183,"COMPARE":184,"TagDeclKeywords":185,"TagId":186,"TAGID":187,"Assignable":188,"AssignObj":189,"ObjAssignable":190,"SimpleObjAssignable":191,"ObjRestValue":192,"HERECOMMENT":193,"COMMENT":194,"Method":195,"Do":196,"Begin":197,"BEGIN":198,"DO":199,"BLOCK_PARAM_START":200,"ParamList":201,"BLOCK_PARAM_END":202,"STATIC":203,"DEF":204,"MethodScope":205,"MethodScopeType":206,"MethodIdentifier":207,"MethodParams":208,"MethodBody":209,".":210,"DEF_BODY":211,"DEF_EMPTY":212,"This":213,"OptSemicolon":214,";":215,"Param":216,"ParamExpression":217,"ParamValue":218,"Object":219,"Array":220,"ParamVar":221,"BLOCK_ARG":222,"SPLAT":223,"VarKeyword":224,"VAR":225,"LET":226,"CONST":227,"InlineVarKeyword":228,"INLINE_VAR":229,"INLINE_LET":230,"INLINE_CONST":231,"VarAssignable":232,"InlineVarAssignable":233,"VarBlockAssign":234,"InlineVar":235,"SimpleAssignable":236,"ENV_FLAG":237,"NEW":238,"SoakableOp":239,"IndexValue":240,"?.":241,"Super":242,"SUPER":243,"AWAIT":244,"Range":245,"ARGUMENTS":246,"Invocation":247,"BANG":248,"AssignList":249,"ExpressionList":250,"STRUCT":251,"ClassStart":252,"CLASS":253,"ClassIdentifier":254,"ClassBodyBlock":255,"ClassBodyLine":256,"ClassDeclLine":257,"ClassField":258,"PROP":259,"ATTR":260,"ClassFieldBody":261,"WATCH":262,"OptFuncExist":263,"FUNC_EXIST":264,"THIS":265,"SELF":266,"RangeDots":267,"..":268,"Arg":269,"SimpleArgs":270,"TRY":271,"Catch":272,"Finally":273,"FINALLY":274,"CATCH":275,"CATCH_VAR":276,"THROW":277,"WhileSource":278,"WHILE":279,"WHEN":280,"UNTIL":281,"Loop":282,"LOOP":283,"ForBody":284,"ELSE":285,"ForKeyword":286,"FOR":287,"POST_FOR":288,"ForStart":289,"ForSource":290,"ForVariables":291,"OWN":292,"ForValue":293,"FORIN":294,"FOROF":295,"BY":296,"SWITCH":297,"Whens":298,"When":299,"LEADING_WHEN":300,"IfBlock":301,"IF":302,"ELIF":303,"POST_IF":304,"?":305,"UNARY":306,"SQRT":307,"--":308,"++":309,"EXP":310,"SHIFT":311,"NOT":312,"RELATION":313,"COMPOUND_ASSIGN":314,"$accept":0,"$end":1},
terminals_: {2:"error",6:"TERMINATOR",7:"BODYSTART",11:"TYPE",12:"IDENTIFIER",13:"INDEX_START",14:"INDEX_END",15:"EMPTY_BLOCK",16:"INDENT",17:"OUTDENT",27:"STATEMENT",28:"BREAK",29:"CALL_START",30:"CALL_END",31:"CONTINUE",32:"DEBUGGER",34:"EXPORT",35:"{",37:"}",38:"FROM",40:"EXPORT_ALL",41:"AS",44:"DEFAULT",45:"EXPORT_VAR",50:"IMPORT",53:"IMPORT_COMMA",55:"STRING",56:"IMPORT_ALL",58:",",62:"REQUIRE",79:"#",80:"{{",81:"}}",82:"DECORATOR",84:"KEY",86:"ARGVAR",88:"SYMBOL",90:"(",91:")",95:"NUMBER",96:"UNIT",98:"STRING_START",99:"NEOSTRING",101:"STRING_END",102:"JS",103:"REGEX",104:"BOOL",105:"TRUE",106:"FALSE",107:"NULL",108:"UNDEFINED",109:"RETURN",112:"SELECTOR_START",113:"SELECTOR_PART",114:"SELECTOR_END",115:"TAG_START",117:"TAG_END",121:"TAG_TYPE",124:"CSS",125:"CSS_SEL",127:"CSS_END",128:"GLOBAL",129:"LOCAL",131:"STYLE_DECL",132:"STYLE_START",133:"STYLE_END",140:":",142:"CSSPROP",144:"MATH",145:"+",146:"-",149:"CSSVAR",150:"DIMENSION",151:"COLOR",152:"PERCENTAGE",153:"TAG_REF",154:"TAG_ID",155:"TAG_FLAG",156:"TAG_ATTR",157:"TAG_ON",158:"T.",159:"T:",160:"T@",161:"@",162:"TAG_LITERAL",163:"TAG_WS",164:"[",165:"]",166:"=",169:"%",170:"TagPartIdentifier",171:"VALUE_START",172:"VALUE_END",175:"SEPARATOR",176:"...",178:"LOGIC",180:"EXTEND",181:"TAG",184:"COMPARE",187:"TAGID",193:"HERECOMMENT",194:"COMMENT",198:"BEGIN",199:"DO",200:"BLOCK_PARAM_START",202:"BLOCK_PARAM_END",203:"STATIC",204:"DEF",210:".",211:"DEF_BODY",212:"DEF_EMPTY",215:";",222:"BLOCK_ARG",223:"SPLAT",225:"VAR",226:"LET",227:"CONST",229:"INLINE_VAR",230:"INLINE_LET",231:"INLINE_CONST",237:"ENV_FLAG",238:"NEW",241:"?.",243:"SUPER",244:"AWAIT",246:"ARGUMENTS",248:"BANG",251:"STRUCT",253:"CLASS",259:"PROP",260:"ATTR",262:"WATCH",264:"FUNC_EXIST",265:"THIS",266:"SELF",268:"..",271:"TRY",274:"FINALLY",275:"CATCH",276:"CATCH_VAR",277:"THROW",279:"WHILE",280:"WHEN",281:"UNTIL",283:"LOOP",285:"ELSE",287:"FOR",288:"POST_FOR",292:"OWN",294:"FORIN",295:"FOROF",296:"BY",297:"SWITCH",300:"LEADING_WHEN",302:"IF",303:"ELIF",304:"POST_IF",305:"?",306:"UNARY",307:"SQRT",308:"--",309:"++",310:"EXP",311:"SHIFT",312:"NOT",313:"RELATION",314:"COMPOUND_ASSIGN"},
productions_: [0,[3,0],[3,1],[3,2],[4,1],[4,1],[4,3],[4,2],[9,1],[10,2],[10,4],[5,1],[5,2],[5,3],[5,4],[8,1],[8,1],[8,1],[8,1],[8,1],[8,1],[8,1],[22,1],[22,1],[22,1],[22,1],[22,4],[22,1],[22,4],[22,1],[22,1],[24,4],[24,6],[24,4],[24,6],[24,2],[24,3],[24,2],[43,1],[43,1],[43,1],[43,1],[49,1],[49,1],[51,1],[23,2],[23,4],[23,4],[23,5],[23,6],[23,6],[23,8],[54,1],[52,3],[36,1],[36,3],[36,4],[36,4],[36,5],[36,6],[57,1],[57,1],[57,3],[57,1],[57,3],[61,2],[63,1],[63,1],[63,0],[20,1],[20,1],[20,1],[20,1],[20,1],[20,1],[20,1],[20,1],[20,1],[20,1],[20,1],[20,1],[20,1],[20,1],[78,2],[78,4],[42,1],[60,1],[83,1],[85,1],[87,1],[89,1],[89,3],[89,4],[93,1],[93,2],[94,2],[94,1],[94,1],[94,1],[94,1],[39,1],[97,1],[97,2],[97,2],[97,2],[100,2],[100,3],[64,1],[64,1],[64,1],[64,1],[64,1],[64,1],[64,1],[64,1],[25,2],[25,2],[25,1],[111,1],[111,2],[111,4],[111,2],[77,3],[77,4],[119,1],[119,1],[119,1],[119,1],[119,0],[123,4],[18,1],[18,2],[18,2],[130,4],[134,4],[135,3],[126,1],[126,2],[126,3],[126,3],[137,1],[137,3],[138,3],[139,1],[143,1],[143,1],[143,1],[141,1],[141,3],[147,1],[147,2],[147,2],[148,1],[148,1],[148,1],[148,1],[148,1],[148,1],[148,4],[148,1],[116,2],[116,1],[116,4],[116,2],[116,2],[116,2],[116,2],[116,5],[116,3],[116,3],[116,4],[116,3],[116,3],[116,3],[116,3],[116,4],[116,3],[116,4],[116,4],[116,2],[116,2],[116,2],[116,3],[122,1],[122,3],[122,2],[122,4],[168,1],[168,2],[167,3],[118,2],[118,3],[118,3],[118,1],[173,1],[173,3],[173,4],[173,6],[173,4],[173,6],[174,1],[174,2],[174,1],[174,1],[174,1],[48,1],[48,2],[48,2],[48,2],[179,2],[179,3],[179,4],[179,5],[185,0],[185,1],[182,1],[186,1],[70,3],[70,4],[70,5],[70,6],[189,1],[189,1],[189,3],[189,5],[189,3],[189,5],[189,1],[191,1],[191,1],[191,1],[190,1],[190,3],[190,3],[190,1],[192,2],[21,1],[21,1],[68,1],[68,1],[68,1],[197,2],[196,2],[196,5],[195,1],[195,2],[195,2],[46,6],[46,4],[208,1],[208,3],[206,1],[206,1],[207,1],[207,1],[207,3],[209,2],[209,3],[209,1],[205,1],[205,1],[205,1],[59,0],[59,1],[214,0],[214,1],[201,0],[201,1],[201,3],[217,1],[217,1],[217,1],[217,1],[217,1],[217,1],[218,1],[216,1],[216,1],[216,1],[216,2],[216,2],[216,3],[216,3],[216,3],[221,1],[221,2],[177,2],[224,1],[224,1],[224,1],[228,1],[228,1],[228,1],[232,1],[232,2],[232,1],[232,1],[233,1],[233,1],[233,1],[234,1],[234,3],[234,5],[19,2],[19,3],[235,2],[236,1],[236,1],[236,1],[236,1],[236,1],[236,3],[236,3],[236,4],[239,1],[239,1],[242,1],[188,1],[188,1],[188,1],[188,1],[66,2],[67,1],[67,1],[67,1],[67,1],[67,1],[67,1],[67,1],[67,1],[67,1],[67,1],[67,1],[67,1],[67,2],[240,1],[219,4],[249,0],[249,1],[249,3],[249,4],[249,6],[250,1],[250,3],[250,4],[250,4],[250,6],[33,5],[33,6],[33,3],[47,1],[47,2],[47,2],[47,2],[252,2],[252,3],[252,2],[252,4],[252,5],[252,4],[254,0],[254,1],[183,2],[183,3],[183,4],[255,1],[255,3],[255,2],[256,1],[256,1],[256,2],[256,1],[256,1],[256,1],[257,2],[257,1],[257,3],[257,1],[258,1],[258,2],[258,2],[258,2],[261,3],[247,3],[247,2],[263,0],[263,1],[110,2],[110,4],[213,1],[120,1],[220,2],[220,4],[267,1],[267,1],[245,5],[92,1],[92,3],[92,4],[92,6],[92,4],[92,6],[136,2],[136,1],[269,1],[269,2],[269,1],[269,1],[269,1],[270,1],[270,3],[73,2],[73,3],[73,3],[73,4],[273,2],[272,3],[26,2],[65,3],[278,2],[278,4],[278,2],[278,4],[74,2],[74,2],[74,2],[74,1],[282,2],[282,2],[75,2],[75,2],[75,2],[75,4],[286,1],[286,1],[284,2],[284,2],[289,2],[289,3],[293,1],[293,1],[293,1],[291,1],[291,3],[290,2],[290,2],[290,4],[290,4],[290,4],[290,6],[290,6],[76,5],[76,7],[76,4],[76,6],[298,1],[298,2],[299,3],[299,4],[301,3],[301,5],[301,4],[301,3],[71,1],[71,3],[71,3],[72,5],[69,2],[69,2],[69,2],[69,2],[69,2],[69,2],[69,2],[69,2],[69,2],[69,3],[69,3],[69,3],[69,3],[69,3],[69,3],[69,3],[69,4],[69,3],[69,3],[69,5]],
performAction: function performAction(self, yytext, yy, yystate /* action[1] */, $$ /* vstack */) {
/* self == yyval */

var $0 = $$.length - 1;
switch (yystate) {
case 1:
return self.$ = new yy.Root([]);
break;
case 2:
return self.$ = new yy.Root($$[$0]);
break;
case 3:
return self.$ = $$[$0-1];
break;
case 4: case 11:
self.$ = new yy.Block([]);
break;
case 5:
self.$ = new yy.Block([$$[$0]]);
break;
case 6: case 366:
self.$ = $$[$0-2].break($$[$0-1]).add($$[$0]);
break;
case 7: case 367:
self.$ = $$[$0-1].break($$[$0]);
break;
case 8:
self.$ = new yy.Terminator($$[$0]);
break;
case 9:
self.$ = new yy.TypeAnnotation([$$[$0]]);
break;
case 10:
self.$ = new yy.TypeAnnotation([$$[$0-2],$$[$0-1],$$[$0]]);
break;
case 12:
self.$ = new yy.Block([]).indented($$[$0-1],$$[$0]);
break;
case 13: case 135: case 139: case 191: case 363:
self.$ = $$[$0-1].indented($$[$0-2],$$[$0]);
break;
case 14: case 364:
self.$ = $$[$0-1].prebreak($$[$0-2]).indented($$[$0-3],$$[$0]);
break;
case 15: case 16: case 17: case 18: case 19: case 20: case 21: case 22: case 23: case 30: case 38: case 39: case 40: case 41: case 42: case 43: case 52: case 66: case 67: case 68: case 69: case 70: case 71: case 72: case 73: case 74: case 75: case 76: case 77: case 78: case 79: case 80: case 81: case 82: case 98: case 99: case 107: case 124: case 140: case 144: case 145: case 146: case 157: case 200: case 202: case 203: case 204: case 205: case 213: case 227: case 228: case 229: case 230: case 231: case 234: case 238: case 239: case 240: case 244: case 249: case 253: case 254: case 256: case 257: case 259: case 260: case 261: case 262: case 263: case 264: case 265: case 269: case 270: case 271: case 272: case 273: case 274: case 275: case 278: case 287: case 288: case 289: case 290: case 291: case 292: case 293: case 295: case 296: case 297: case 298: case 299: case 308: case 309: case 317: case 318: case 319: case 320: case 322: case 323: case 324: case 325: case 326: case 328: case 329: case 330: case 331: case 332: case 333: case 350: case 361: case 368: case 369: case 371: case 372: case 373: case 375: case 377: case 403: case 404: case 406: case 407: case 408: case 409: case 426: case 433: case 434: case 439: case 440: case 441: case 455: case 463:
self.$ = $$[$0];
break;
case 24: case 108:
self.$ = new yy.Literal($$[$0]);
break;
case 25:
self.$ = new yy.BreakStatement($$[$0]);
break;
case 26:
self.$ = new yy.BreakStatement($$[$0-3],$$[$0-1]);
break;
case 27:
self.$ = new yy.ContinueStatement($$[$0]);
break;
case 28:
self.$ = new yy.ContinueStatement($$[$0-3],$$[$0-1]);
break;
case 29:
self.$ = new yy.DebuggerStatement($$[$0]);
break;
case 31:
self.$ = new yy.ExportNamedDeclaration($$[$0-3],[$$[$0-1]]);
break;
case 32:
self.$ = new yy.ExportNamedDeclaration($$[$0-5],[$$[$0-3]],$$[$0]);
break;
case 33:
self.$ = new yy.ExportAllDeclaration($$[$0-3],[new yy.ExportAllSpecifier($$[$0-2])],$$[$0]);
break;
case 34:
self.$ = new yy.ExportAllDeclaration($$[$0-5],[new yy.ExportAllSpecifier($$[$0-4],$$[$0-2])],$$[$0]);
break;
case 35: case 37:
self.$ = new yy.Export($$[$0]).set({keyword: $$[$0-1]});
break;
case 36:
self.$ = new yy.Export($$[$0]).set({keyword: $$[$0-2],'default': $$[$0-1]});
break;
case 44:
self.$ = new yy.ImportDefaultSpecifier($$[$0]);
break;
case 45:
self.$ = new yy.ImportDeclaration($$[$0-1],null,$$[$0]);
break;
case 46: case 47:
self.$ = new yy.ImportDeclaration($$[$0-3],[$$[$0-2]],$$[$0]);
break;
case 48:
self.$ = new yy.ImportDeclaration($$[$0-4],null,$$[$0]);
break;
case 49:
self.$ = new yy.ImportDeclaration($$[$0-5],[$$[$0-3]],$$[$0]);
break;
case 50:
self.$ = new yy.ImportDeclaration($$[$0-5],[$$[$0-4],$$[$0-2]],$$[$0]);
break;
case 51:
self.$ = new yy.ImportDeclaration($$[$0-7],[$$[$0-6],$$[$0-3]],$$[$0]);
break;
case 53:
self.$ = new yy.ImportNamespaceSpecifier(new yy.Literal($$[$0-2]),$$[$0]);
break;
case 54:
self.$ = new yy.ESMSpecifierList([]).add($$[$0]);
break;
case 55: case 138: case 148: case 195: case 304: case 339: case 343: case 397:
self.$ = $$[$0-2].add($$[$0]);
break;
case 56:
self.$ = $$[$0-3].add($$[$0]);
break;
case 57:
self.$ = $$[$0-2];
break;
case 58:
self.$ = $$[$0-3];
break;
case 59: case 199: case 346: case 401:
self.$ = $$[$0-5].concat($$[$0-2]);
break;
case 60: case 61:
self.$ = new yy.ImportSpecifier($$[$0]);
break;
case 62:
self.$ = new yy.ImportSpecifier($$[$0-2],$$[$0]);
break;
case 63:
self.$ = new yy.ImportSpecifier(new yy.Literal($$[$0]));
break;
case 64:
self.$ = new yy.ImportSpecifier(new yy.Literal($$[$0-2]),$$[$0]);
break;
case 65:
self.$ = new yy.Require($$[$0]).set({keyword: $$[$0-1]});
break;
case 83:
self.$ = new yy.Private($$[$0]);
break;
case 84: case 120: case 186:
self.$ = $$[$0-3].add($$[$0-1]);
break;
case 85: case 87:
self.$ = new yy.Identifier($$[$0]);
break;
case 86:
self.$ = new yy.DecoratorIdentifier($$[$0]);
break;
case 88:
self.$ = new yy.Argvar($$[$0]);
break;
case 89:
self.$ = new yy.Symbol($$[$0]);
break;
case 90:
self.$ = new yy.Decorator($$[$0]);
break;
case 91:
self.$ = new yy.Decorator($$[$0-2]);
break;
case 92:
self.$ = new yy.Decorator($$[$0-3]).set({params: $$[$0-1]});
break;
case 93: case 267: case 300: case 442:
self.$ = [$$[$0]];
break;
case 94: case 456:
self.$ = $$[$0-1].concat($$[$0]);
break;
case 95:
self.$ = new yy.NumWithUnit($$[$0-1],$$[$0]);
break;
case 96:
self.$ = new yy.Num($$[$0]);
break;
case 97: case 100:
self.$ = new yy.Str($$[$0]);
break;
case 101:
self.$ = new yy.InterpolatedString([],{open: $$[$0]});
break;
case 102: case 119: case 137: case 150: case 151: case 185: case 188:
self.$ = $$[$0-1].add($$[$0]);
break;
case 103:
self.$ = $$[$0] ? $$[$0-1].add($$[$0]) : $$[$0-1];
break;
case 104: case 121:
self.$ = $$[$0-1].option('close',$$[$0]);
break;
case 105: case 360:
self.$ = null;
break;
case 106: case 180: case 181: case 189: case 192: case 233: case 250: case 402:
self.$ = $$[$0-1];
break;
case 109:
self.$ = new yy.RegExp($$[$0]);
break;
case 110:
self.$ = new yy.Bool($$[$0]);
break;
case 111:
self.$ = new yy.True($$[$0]);
break;
case 112:
self.$ = new yy.False($$[$0]);
break;
case 113:
self.$ = new yy.Nil($$[$0]);
break;
case 114:
self.$ = new yy.Undefined($$[$0]);
break;
case 115: case 116:
self.$ = new yy.Return($$[$0]).set({keyword: $$[$0-1]});
break;
case 117:
self.$ = new yy.Return().set({keyword: $$[$0]});
break;
case 118:
self.$ = new yy.Selector([],{type: $$[$0],open: $$[$0]});
break;
case 122:
self.$ = $$[$0-1].set({open: $$[$0-2],close: $$[$0]});
break;
case 123:
self.$ = $$[$0-2].set({body: $$[$0],open: $$[$0-3],close: $$[$0-1]});
break;
case 125: case 126: case 215:
self.$ = new yy.TagTypeIdentifier($$[$0]);
break;
case 127:
self.$ = new yy.ExpressionNode($$[$0]);
break;
case 128:
self.$ = new yy.TagTypeIdentifier('div');
break;
case 129: case 141:
self.$ = new yy.StyleRuleSet($$[$0-2],$$[$0-1]);
break;
case 130:
self.$ = $$[$0].set({toplevel: true});
break;
case 131: case 208: case 245: case 353:
self.$ = $$[$0].set({global: $$[$0-1]});
break;
case 132: case 352:
self.$ = $$[$0].set({local: $$[$0-1]});
break;
case 133:
self.$ = new yy.StyleRuleSet(null,$$[$0-1]);
break;
case 134:
self.$ = new yy.StyleRuleSet($$[$0-3],$$[$0-1]);
break;
case 136:
self.$ = new yy.StyleBody([$$[$0]]);
break;
case 142:
self.$ = new yy.StyleDeclaration($$[$0-2],$$[$0]);
break;
case 143:
self.$ = new yy.StyleProperty([$$[$0]]);
break;
case 147:
self.$ = new yy.StyleExpressions([$$[$0]]);
break;
case 149:
self.$ = new yy.StyleExpression().add($$[$0]);
break;
case 152:
self.$ = new yy.StyleVar($$[$0]);
break;
case 153: case 155:
self.$ = new yy.StyleDimension($$[$0]);
break;
case 154:
self.$ = new yy.StyleColor($$[$0]);
break;
case 156:
self.$ = new yy.StyleNumber($$[$0]);
break;
case 158:
self.$ = new yy.StyleFunction($$[$0-3],$$[$0-1]);
break;
case 159:
self.$ = new yy.StyleIdentifier($$[$0]);
break;
case 160:
self.$ = new yy.Tag({type: $$[$0-1],reference: $$[$0]});
break;
case 161:
self.$ = new yy.Tag({type: $$[$0]});
break;
case 162: case 178:
self.$ = $$[$0-3].addPart($$[$0-1],yy.TagData);
break;
case 163:
self.$ = $$[$0-1].addPart($$[$0],yy.TagId);
break;
case 164:
self.$ = $$[$0-1].addPart($$[$0],yy.TagFlag);
break;
case 165:
self.$ = $$[$0-1].addPart($$[$0],yy.TagAttr);
break;
case 166:
self.$ = $$[$0-1].addPart($$[$0],yy.TagHandler);
break;
case 167:
self.$ = $$[$0-4].addPart(new yy.StyleRuleSet(null,$$[$0-1]),yy.TagFlag);
break;
case 168: case 169:
self.$ = $$[$0-2].addPart($$[$0],yy.TagHandler);
break;
case 170:
self.$ = $$[$0-3].addPart($$[$0].prepend('_'),yy.TagFlag);
break;
case 171:
self.$ = $$[$0-2].addPart($$[$0],yy.TagFlag);
break;
case 172:
self.$ = $$[$0-2].addPart($$[$0],yy.TagId);
break;
case 173:
self.$ = $$[$0-2].addPart($$[$0-1],yy.TagSep).addPart($$[$0],yy.TagAttr);
break;
case 174: case 176:
self.$ = $$[$0-2].addPart(null,yy.TagArgList);
break;
case 175: case 177:
self.$ = $$[$0-3].addPart($$[$0-1],yy.TagArgList);
break;
case 179:
self.$ = $$[$0-1].addPart($$[$0],yy.TagSep);
break;
case 182:
self.$ = $$[$0-2].addPart($$[$0],yy.TagAttrValue,$$[$0-1]);
break;
case 183:
self.$ = new yy.IdentifierExpression($$[$0]);
break;
case 184: case 232:
self.$ = new yy.IdentifierExpression($$[$0-1]);
break;
case 187:
self.$ = new yy.TagFlag();
break;
case 190:
self.$ = new yy.TagBody([]).indented($$[$0-1],$$[$0]);
break;
case 193:
self.$ = new yy.TagBody([$$[$0]]);
break;
case 194:
self.$ = new yy.TagBody([]).add($$[$0]);
break;
case 196: case 340: case 344: case 398:
self.$ = $$[$0-3].add($$[$0-1]).add($$[$0]);
break;
case 197: case 399:
self.$ = $$[$0-5].add($$[$0-1]).add($$[$0]);
break;
case 198: case 345: case 400:
self.$ = $$[$0-2].indented($$[$0-3],$$[$0]);
break;
case 201: case 235: case 405:
self.$ = new yy.Splat($$[$0]).set({keyword: $$[$0-1]});
break;
case 206:
self.$ = $$[$0].set({extension: true});
break;
case 207:
self.$ = $$[$0].set({local: true});
break;
case 209:
self.$ = new yy.TagDeclaration($$[$0]).set({keyword: $$[$0-1]});
break;
case 210:
self.$ = new yy.TagDeclaration($$[$0-1],null,$$[$0]).set({keyword: $$[$0-2]});
break;
case 211:
self.$ = new yy.TagDeclaration($$[$0-2],$$[$0]).set({keyword: $$[$0-3]});
break;
case 212:
self.$ = new yy.TagDeclaration($$[$0-3],$$[$0-1],$$[$0]).set({keyword: $$[$0-4]});
break;
case 214:
self.$ = ['yy.extend'];
break;
case 216:
self.$ = new yy.TagIdRef($$[$0]);
break;
case 217:
self.$ = new yy.Assign($$[$0-1],$$[$0-2],$$[$0]);
break;
case 218:
self.$ = new yy.Assign($$[$0-1],$$[$0-3],$$[$0]).set({datatype: $$[$0-2]});
break;
case 219:
self.$ = new yy.Assign($$[$0-3],$$[$0-4],$$[$0-1].indented($$[$0-2],$$[$0]));
break;
case 220:
self.$ = new yy.Assign($$[$0-3],$$[$0-5],$$[$0-1]).indented($$[$0-2],$$[$0]).set({datatype: $$[$0-4]});
break;
case 221:
self.$ = $$[$0].set({inObject: true});
break;
case 222:
self.$ = new yy.ObjAttr($$[$0]);
break;
case 223:
self.$ = new yy.ObjAttr($$[$0-2],$$[$0]);
break;
case 224:
self.$ = new yy.ObjAttr($$[$0-4],$$[$0-1].indented($$[$0-2],$$[$0]));
break;
case 225:
self.$ = new yy.ObjAttr($$[$0-2],null,$$[$0]);
break;
case 226:
self.$ = new yy.ObjAttr($$[$0-4],null,$$[$0-1].indented($$[$0-2],$$[$0]));
break;
case 236:
self.$ = new yy.Comment($$[$0],true);
break;
case 237:
self.$ = new yy.Comment($$[$0],false);
break;
case 241:
self.$ = new yy.Begin($$[$0]);
break;
case 242:
self.$ = new yy.Lambda([],$$[$0],null,null,{bound: true,keyword: $$[$0-1]});
break;
case 243:
self.$ = new yy.Lambda($$[$0-2],$$[$0],null,null,{bound: true,keyword: $$[$0-4]});
break;
case 246: case 374:
self.$ = $$[$0].set({static: $$[$0-1]});
break;
case 247:
self.$ = new yy.MethodDeclaration($$[$0-1],$$[$0],$$[$0-2],$$[$0-4],$$[$0-3]).set({def: $$[$0-5],keyword: $$[$0-5]});
break;
case 248:
self.$ = new yy.MethodDeclaration($$[$0-1],$$[$0],$$[$0-2],null).set({def: $$[$0-3],keyword: $$[$0-3]});
break;
case 251:
self.$ = {static: true};
break;
case 252:
self.$ = {};
break;
case 255:
self.$ = new yy.InterpolatedIdentifier($$[$0-1]);
break;
case 258:
self.$ = new yy.Block([]).set({end: $$[$0]._loc});
break;
case 266:
self.$ = [];
break;
case 268:
self.$ = $$[$0-2].concat($$[$0]);
break;
case 276: case 277: case 284:
self.$ = new yy.Param($$[$0]);
break;
case 279:
self.$ = $$[$0].set({splat: $$[$0-1]});
break;
case 280:
self.$ = $$[$0].set({blk: $$[$0-1]});
break;
case 281:
self.$ = new yy.Param($$[$0-2].value(),$$[$0]).set({datatype: $$[$0-2].option('datatype')});
break;
case 282: case 283:
self.$ = new yy.Param($$[$0-2],$$[$0]);
break;
case 285:
self.$ = new yy.Param($$[$0-1]).set({datatype: $$[$0]});
break;
case 286:
self.$ = yy.SPLAT($$[$0]);
break;
case 294: case 381:
self.$ = $$[$0-1].set({datatype: $$[$0]});
break;
case 301: case 443:
self.$ = [$$[$0-2],$$[$0]];
break;
case 302:
self.$ = [$$[$0-4],$$[$0-1].indented($$[$0-2],$$[$0])];
break;
case 303:
self.$ = new yy.VarDeclList([]).set({keyword: $$[$0-1],type: $$[$0-1].value()}).add($$[$0]);
break;
case 305:
self.$ = new yy.VarReference($$[$0],$$[$0-1]);
break;
case 306:
self.$ = new yy.EnvFlag($$[$0]);
break;
case 307:
self.$ = new yy.Access('.',null,$$[$0]);
break;
case 310:
self.$ = new yy.VarOrAccess($$[$0]);
break;
case 311:
self.$ = new yy.LegacyNew($$[$0-2]).set({keyword: $$[$0]});
break;
case 312: case 478: case 479: case 480: case 481: case 482: case 484:
self.$ = yy.OP($$[$0-1],$$[$0-2],$$[$0]);
break;
case 313:
self.$ = new yy.IndexAccess('.',$$[$0-3],$$[$0-1]);
break;
case 316:
self.$ = new yy.Super($$[$0]);
break;
case 321:
self.$ = new yy.Await($$[$0]).set({keyword: $$[$0-1]});
break;
case 327:
self.$ = yy.ARGUMENTS;
break;
case 334:
self.$ = new yy.BangCall($$[$0-1]).set({keyword: $$[$0]});
break;
case 335:
self.$ = new yy.Index($$[$0]);
break;
case 336:
self.$ = new yy.Obj($$[$0-2],$$[$0-3].generated).setEnds($$[$0-3],$$[$0]);
break;
case 337:
self.$ = new yy.AssignList([]);
break;
case 338:
self.$ = new yy.AssignList([$$[$0]]);
break;
case 341:
self.$ = $$[$0-5].concat($$[$0-2].indented($$[$0-3],$$[$0]));
break;
case 342:
self.$ = new yy.ExpressionList([]).add($$[$0]);
break;
case 347:
self.$ = new yy.StructDeclaration($$[$0-3],null,[]).set({params: $$[$0-1],keyword: $$[$0-4]});
break;
case 348:
self.$ = new yy.StructDeclaration($$[$0-4],null,$$[$0]).set({params: $$[$0-2],keyword: $$[$0-5]});
break;
case 349:
self.$ = new yy.StructDeclaration($$[$0-1],null,$$[$0]).set({keyword: $$[$0-2]});
break;
case 351:
self.$ = $$[$0].set({extension: $$[$0-1]});
break;
case 354:
self.$ = new yy.ClassDeclaration($$[$0],null,[]).set({keyword: $$[$0-1]});
break;
case 355:
self.$ = new yy.ClassDeclaration($$[$0-1],null,$$[$0]).set({keyword: $$[$0-2]});
break;
case 356:
self.$ = new yy.ClassDeclaration(null,null,$$[$0]).set({keyword: $$[$0-1]});
break;
case 357:
self.$ = new yy.ClassDeclaration($$[$0-2],$$[$0],[]).set({keyword: $$[$0-3]});
break;
case 358:
self.$ = new yy.ClassDeclaration($$[$0-3],$$[$0-1],$$[$0]).set({keyword: $$[$0-4]});
break;
case 359:
self.$ = new yy.ClassDeclaration(null,$$[$0-1],$$[$0]).set({keyword: $$[$0-3]});
break;
case 362:
self.$ = new yy.ClassBody([]).indented($$[$0-1],$$[$0]);
break;
case 365:
self.$ = new yy.ClassBody([]).add($$[$0]);
break;
case 370:
self.$ = $$[$0-1].concat([$$[$0]]);
break;
case 376:
self.$ = $$[$0-2].set({value: $$[$0]});
break;
case 378:
self.$ = new yy.ClassField($$[$0]);
break;
case 379:
self.$ = new yy.ClassField($$[$0]).set({keyword: $$[$0-1]});
break;
case 380:
self.$ = new yy.ClassAttribute($$[$0]).set({keyword: $$[$0-1]});
break;
case 382:
self.$ = [$$[$0-2],$$[$0-1]];
break;
case 383:
self.$ = new yy.Call($$[$0-2],$$[$0],$$[$0-1]);
break;
case 384:
self.$ = $$[$0-1].addBlock($$[$0]);
break;
case 385:
self.$ = false;
break;
case 386:
self.$ = true;
break;
case 387:
self.$ = new yy.ArgList([]).setEnds($$[$0-1],$$[$0]);
break;
case 388:
self.$ = $$[$0-2].setEnds($$[$0-3],$$[$0]);
break;
case 389:
self.$ = new yy.This($$[$0]);
break;
case 390:
self.$ = new yy.Self($$[$0]);
break;
case 391:
self.$ = new yy.Arr(new yy.ArgList([])).setEnds($$[$0-1],$$[$0]);
break;
case 392:
self.$ = new yy.Arr($$[$0-2]).setEnds($$[$0-3],$$[$0-2]);
break;
case 393:
self.$ = '..';
break;
case 394:
self.$ = '...';
break;
case 395:
self.$ = yy.OP($$[$0-2],$$[$0-3],$$[$0-1]);
break;
case 396:
self.$ = new yy.ArgList([$$[$0]]);
break;
case 410:
self.$ = [].concat($$[$0-2],$$[$0]);
break;
case 411:
self.$ = new yy.Try($$[$0]);
break;
case 412:
self.$ = new yy.Try($$[$0-1],$$[$0]);
break;
case 413:
self.$ = new yy.Try($$[$0-1],null,$$[$0]);
break;
case 414:
self.$ = new yy.Try($$[$0-2],$$[$0-1],$$[$0]);
break;
case 415:
self.$ = new yy.Finally($$[$0]);
break;
case 416:
self.$ = new yy.Catch($$[$0],$$[$0-1]);
break;
case 417:
self.$ = new yy.Throw($$[$0]);
break;
case 418:
self.$ = new yy.Parens($$[$0-1],$$[$0-2],$$[$0]);
break;
case 419:
self.$ = new yy.While($$[$0],{keyword: $$[$0-1]});
break;
case 420:
self.$ = new yy.While($$[$0-2],{guard: $$[$0],keyword: $$[$0-3]});
break;
case 421:
self.$ = new yy.While($$[$0],{invert: true,keyword: $$[$0-1]});
break;
case 422:
self.$ = new yy.While($$[$0-2],{invert: true,guard: $$[$0],keyword: $$[$0-3]});
break;
case 423: case 431:
self.$ = $$[$0-1].addBody($$[$0]);
break;
case 424: case 425:
self.$ = $$[$0].addBody(yy.Block.wrap([$$[$0-1]]));
break;
case 427:
self.$ = new yy.While(new yy.Literal('true',{keyword: $$[$0-1]})).addBody($$[$0]);
break;
case 428:
self.$ = new yy.While(new yy.Literal('true',{keyword: $$[$0-1]})).addBody(yy.Block.wrap([$$[$0]]));
break;
case 429: case 430:
self.$ = $$[$0].addBody([$$[$0-1]]);
break;
case 432:
self.$ = $$[$0-3].addBody($$[$0-2]).addElse($$[$0]);
break;
case 435:
self.$ = {source: new yy.ValueNode($$[$0])};
break;
case 436:
self.$ = $$[$0].configure({own: $$[$0-1].own,name: $$[$0-1][0],index: $$[$0-1][1],keyword: $$[$0-1].keyword});
break;
case 437:
self.$ = ($$[$0].keyword = $$[$0-1]) && $$[$0];
break;
case 438:
self.$ = ($$[$0].own = true) && ($$[$0].keyword = $$[$0-2]) && $$[$0];
break;
case 444:
self.$ = new yy.ForIn({source: $$[$0]});
break;
case 445:
self.$ = new yy.ForOf({source: $$[$0],object: true});
break;
case 446:
self.$ = new yy.ForIn({source: $$[$0-2],guard: $$[$0]});
break;
case 447:
self.$ = new yy.ForOf({source: $$[$0-2],guard: $$[$0],object: true});
break;
case 448:
self.$ = new yy.ForIn({source: $$[$0-2],step: $$[$0]});
break;
case 449:
self.$ = new yy.ForIn({source: $$[$0-4],guard: $$[$0-2],step: $$[$0]});
break;
case 450:
self.$ = new yy.ForIn({source: $$[$0-4],step: $$[$0-2],guard: $$[$0]});
break;
case 451:
self.$ = new yy.Switch($$[$0-3],$$[$0-1]);
break;
case 452:
self.$ = new yy.Switch($$[$0-5],$$[$0-3],$$[$0-1]);
break;
case 453:
self.$ = new yy.Switch(null,$$[$0-1]);
break;
case 454:
self.$ = new yy.Switch(null,$$[$0-3],$$[$0-1]);
break;
case 457:
self.$ = [new yy.SwitchCase($$[$0-1],$$[$0])];
break;
case 458:
self.$ = [new yy.SwitchCase($$[$0-2],$$[$0-1])];
break;
case 459:
self.$ = new yy.If($$[$0-1],$$[$0],{type: $$[$0-2]});
break;
case 460:
self.$ = $$[$0-4].addElse(new yy.If($$[$0-1],$$[$0],{type: $$[$0-2]}));
break;
case 461:
self.$ = $$[$0-3].addElse(new yy.If($$[$0-1],$$[$0],{type: $$[$0-2]}));
break;
case 462:
self.$ = $$[$0-2].addElse($$[$0].set({keyword: $$[$0-1]}));
break;
case 464:
self.$ = new yy.If($$[$0],new yy.Block([$$[$0-2]]),{type: $$[$0-1],statement: true});
break;
case 465:
self.$ = new yy.If($$[$0],new yy.Block([$$[$0-2]]),{type: $$[$0-1]});
break;
case 466:
self.$ = yy.If.ternary($$[$0-4],$$[$0-2],$$[$0]);
break;
case 467:
self.$ = new yy.Instantiation($$[$0]).set({keyword: $$[$0-1]});
break;
case 468: case 469: case 470: case 471:
self.$ = yy.OP($$[$0-1],$$[$0]);
break;
case 472: case 473:
self.$ = new yy.UnaryOp($$[$0-1],null,$$[$0]);
break;
case 474: case 475:
self.$ = new yy.UnaryOp($$[$0],$$[$0-1],null,true);
break;
case 476: case 477:
self.$ = new yy.Op($$[$0-1],$$[$0-2],$$[$0]);
break;
case 483:
self.$ = yy.OP($$[$0-1],$$[$0-3],$$[$0]).invert($$[$0-2]);
break;
case 485:
self.$ = yy.OP_COMPOUND($$[$0-1]._value,$$[$0-1],$$[$0-2],$$[$0]);
break;
case 486:
self.$ = yy.OP_COMPOUND($$[$0-3]._value,$$[$0-4],$$[$0-1].indented($$[$0-2],$$[$0]));
break;
}
},
table: [{1:[2,1],3:1,4:2,5:3,7:$V0,8:5,12:$V1,15:$V2,16:$V3,18:8,19:9,20:10,21:11,22:12,23:13,24:14,25:35,26:36,27:$V4,28:$V5,31:$V6,32:$V7,33:41,34:$V8,35:$V9,42:113,45:$Va,46:105,47:30,48:31,50:$Vb,55:$Vc,61:61,62:$Vd,64:52,65:53,66:19,67:20,68:21,69:22,70:23,71:24,72:25,73:26,74:27,75:28,76:29,77:32,78:110,79:$Ve,85:111,86:$Vf,87:126,88:$Vg,90:$Vh,94:90,95:$Vi,97:127,98:$Vj,102:$Vk,103:$Vl,104:$Vm,105:$Vn,106:$Vo,107:$Vp,108:$Vq,109:$Vr,111:58,112:$Vs,115:$Vt,120:112,123:15,124:$Vu,128:$Vv,129:$Vw,130:59,131:$Vx,145:$Vy,146:$Vz,164:$VA,179:81,180:$VB,181:$VC,186:57,187:$VD,188:50,193:$VE,194:$VF,195:62,196:63,197:64,198:$VG,199:$VH,203:$VI,204:$VJ,213:56,219:88,220:87,224:18,225:$VK,226:$VL,227:$VM,228:122,229:$VN,230:$VO,231:$VP,235:86,236:72,237:$VQ,238:$VR,242:51,243:$VS,244:$VT,245:54,246:$VU,247:60,251:$VV,252:79,253:$VW,265:$VX,266:$VY,271:$VZ,277:$V_,278:75,279:$V$,281:$V01,282:76,283:$V11,284:77,286:118,287:$V21,288:$V31,289:119,297:$V41,301:73,302:$V51,306:$V61,307:$V71,308:$V81,309:$V91},{1:[3]},{1:[2,2],6:$Va1,9:140},{6:[1,142]},o($Vb1,[2,4]),o($Vb1,[2,5]),o($Vc1,[2,11]),{4:144,6:[1,145],7:$V0,8:5,12:$V1,17:[1,143],18:8,19:9,20:10,21:11,22:12,23:13,24:14,25:35,26:36,27:$V4,28:$V5,31:$V6,32:$V7,33:41,34:$V8,35:$V9,42:113,45:$Va,46:105,47:30,48:31,50:$Vb,55:$Vc,61:61,62:$Vd,64:52,65:53,66:19,67:20,68:21,69:22,70:23,71:24,72:25,73:26,74:27,75:28,76:29,77:32,78:110,79:$Ve,85:111,86:$Vf,87:126,88:$Vg,90:$Vh,94:90,95:$Vi,97:127,98:$Vj,102:$Vk,103:$Vl,104:$Vm,105:$Vn,106:$Vo,107:$Vp,108:$Vq,109:$Vr,111:58,112:$Vs,115:$Vt,120:112,123:15,124:$Vu,128:$Vv,129:$Vw,130:59,131:$Vx,145:$Vy,146:$Vz,164:$VA,179:81,180:$VB,181:$VC,186:57,187:$VD,188:50,193:$VE,194:$VF,195:62,196:63,197:64,198:$VG,199:$VH,203:$VI,204:$VJ,213:56,219:88,220:87,224:18,225:$VK,226:$VL,227:$VM,228:122,229:$VN,230:$VO,231:$VP,235:86,236:72,237:$VQ,238:$VR,242:51,243:$VS,244:$VT,245:54,246:$VU,247:60,251:$VV,252:79,253:$VW,265:$VX,266:$VY,271:$VZ,277:$V_,278:75,279:$V$,281:$V01,282:76,283:$V11,284:77,286:118,287:$V21,288:$V31,289:119,297:$V41,301:73,302:$V51,306:$V61,307:$V71,308:$V81,309:$V91},o($Vb1,[2,15]),o($Vb1,[2,16],{58:$Vd1}),o($Vb1,[2,17],{286:118,289:119,278:158,284:159,144:$Ve1,145:$Vf1,146:$Vg1,178:$Vh1,184:$Vi1,279:$V$,281:$V01,287:$V21,288:$V31,304:$Vj1,305:$Vk1,310:$Vl1,311:$Vm1,312:$Vn1,313:$Vo1}),o($Vb1,[2,18]),o($Vb1,[2,19],{286:118,289:119,278:161,284:162,279:$V$,281:$V01,287:$V21,288:$V31,304:$Vp1}),o($Vb1,[2,20]),o($Vb1,[2,21]),o($Vb1,[2,130]),{18:163,46:166,123:15,124:$Vu,128:$Vq1,129:$Vr1,179:165,181:$VC,204:$VJ,252:164,253:$VW},{18:169,123:15,124:$Vu,128:$Vq1,129:$Vr1,179:171,181:$VC,252:170,253:$VW},{12:$V1,35:$V9,42:174,164:$Vs1,219:176,220:175,232:173,234:172},o($Vt1,[2,69]),o($Vt1,[2,70],{263:179,196:180,239:182,13:$Vu1,29:$Vv1,199:$VH,210:$Vw1,241:$Vx1,248:$Vy1,264:$Vz1}),o($Vt1,[2,71]),o($Vt1,[2,72]),o($Vt1,[2,73]),o($Vt1,[2,74]),o($Vt1,[2,75]),o($Vt1,[2,76]),o($Vt1,[2,77]),o($Vt1,[2,78]),o($Vt1,[2,79]),o($Vt1,[2,80]),o($Vt1,[2,81]),o($Vt1,[2,82]),o($VA1,[2,236]),o($VA1,[2,237]),o($VB1,[2,22]),o($VB1,[2,23]),o($VB1,[2,24]),o($VB1,[2,25],{29:[1,186]}),o($VB1,[2,27],{29:[1,187]}),o($VB1,[2,29]),o($VB1,[2,30]),{12:$V1,35:[1,191],39:188,42:193,51:189,52:190,55:$VC1,56:$VD1},{33:201,35:[1,195],40:[1,196],43:197,44:[1,198],46:199,47:200,48:202,128:$VE1,129:$VF1,179:81,180:$VB,181:$VC,204:$VJ,251:$VV,252:79,253:$VW},{19:205,224:18,225:$VK,226:$VL,227:$VM},{125:[1,206]},o($VG1,[2,287]),o($VG1,[2,288]),o($VG1,[2,289]),{12:$V1,20:207,22:208,25:35,26:36,27:$V4,28:$V5,31:$V6,32:$V7,33:41,35:$V9,42:113,46:105,47:30,48:31,55:$Vc,61:61,62:$Vd,64:52,65:53,66:19,67:20,68:21,69:22,70:23,71:24,72:25,73:26,74:27,75:28,76:29,77:32,78:110,79:$Ve,85:111,86:$Vf,87:126,88:$Vg,90:$Vh,94:90,95:$Vi,97:127,98:$Vj,102:$Vk,103:$Vl,104:$Vm,105:$Vn,106:$Vo,107:$Vp,108:$Vq,109:$Vr,111:58,112:$Vs,115:$Vt,120:112,128:$VH1,129:$VF1,130:59,131:$Vx,145:$Vy,146:$Vz,164:$VA,179:81,180:$VB,181:$VC,186:57,187:$VD,188:50,195:62,196:63,197:64,198:$VG,199:$VH,203:$VI,204:$VJ,213:56,219:88,220:87,228:122,229:$VN,230:$VO,231:$VP,235:86,236:72,237:$VQ,238:$VR,242:51,243:$VS,244:$VT,245:54,246:$VU,247:60,251:$VV,252:79,253:$VW,265:$VX,266:$VY,271:$VZ,277:$V_,278:75,279:$V$,281:$V01,282:76,283:$V11,284:77,286:118,287:$V21,288:$V31,289:119,297:$V41,301:73,302:$V51,306:$V61,307:$V71,308:$V81,309:$V91},o($VI1,$VJ1,{10:211,11:$VK1,166:[1,210]}),o($VI1,[2,323]),o($VI1,[2,324]),o($VI1,[2,325]),o($VI1,[2,326]),o($VI1,[2,327]),o($VI1,[2,328]),o($VI1,[2,329]),o($VI1,[2,330],{35:[1,214],113:[1,213],114:[1,215]}),o($VI1,[2,331]),o($VI1,[2,332]),o($VI1,[2,333]),o($Vt1,[2,238]),o($Vt1,[2,239]),o($Vt1,[2,240]),{12:$V1,20:216,22:208,25:35,26:36,27:$V4,28:$V5,31:$V6,32:$V7,33:41,35:$V9,42:113,46:105,47:30,48:31,55:$Vc,61:61,62:$Vd,64:52,65:53,66:19,67:20,68:21,69:22,70:23,71:24,72:25,73:26,74:27,75:28,76:29,77:32,78:110,79:$Ve,85:111,86:$Vf,87:126,88:$Vg,90:$Vh,94:90,95:$Vi,97:127,98:$Vj,102:$Vk,103:$Vl,104:$Vm,105:$Vn,106:$Vo,107:$Vp,108:$Vq,109:$Vr,111:58,112:$Vs,115:$Vt,120:112,128:$VH1,129:$VF1,130:59,131:$Vx,145:$Vy,146:$Vz,164:$VA,179:81,180:$VB,181:$VC,186:57,187:$VD,188:50,195:62,196:63,197:64,198:$VG,199:$VH,203:$VI,204:$VJ,213:56,219:88,220:87,228:122,229:$VN,230:$VO,231:$VP,235:86,236:72,237:$VQ,238:$VR,242:51,243:$VS,244:$VT,245:54,246:$VU,247:60,251:$VV,252:79,253:$VW,265:$VX,266:$VY,271:$VZ,277:$V_,278:75,279:$V$,281:$V01,282:76,283:$V11,284:77,286:118,287:$V21,288:$V31,289:119,297:$V41,301:73,302:$V51,306:$V61,307:$V71,308:$V81,309:$V91},{12:$V1,20:217,22:208,25:35,26:36,27:$V4,28:$V5,31:$V6,32:$V7,33:41,35:$V9,42:113,46:105,47:30,48:31,55:$Vc,61:61,62:$Vd,64:52,65:53,66:19,67:20,68:21,69:22,70:23,71:24,72:25,73:26,74:27,75:28,76:29,77:32,78:110,79:$Ve,85:111,86:$Vf,87:126,88:$Vg,90:$Vh,94:90,95:$Vi,97:127,98:$Vj,102:$Vk,103:$Vl,104:$Vm,105:$Vn,106:$Vo,107:$Vp,108:$Vq,109:$Vr,111:58,112:$Vs,115:$Vt,120:112,128:$VH1,129:$VF1,130:59,131:$Vx,145:$Vy,146:$Vz,164:$VA,179:81,180:$VB,181:$VC,186:57,187:$VD,188:50,195:62,196:63,197:64,198:$VG,199:$VH,203:$VI,204:$VJ,213:56,219:88,220:87,228:122,229:$VN,230:$VO,231:$VP,235:86,236:72,237:$VQ,238:$VR,242:51,243:$VS,244:$VT,245:54,246:$VU,247:60,251:$VV,252:79,253:$VW,265:$VX,266:$VY,271:$VZ,277:$V_,278:75,279:$V$,281:$V01,282:76,283:$V11,284:77,286:118,287:$V21,288:$V31,289:119,297:$V41,301:73,302:$V51,306:$V61,307:$V71,308:$V81,309:$V91},{12:$V1,20:218,22:208,25:35,26:36,27:$V4,28:$V5,31:$V6,32:$V7,33:41,35:$V9,42:113,46:105,47:30,48:31,55:$Vc,61:61,62:$Vd,64:52,65:53,66:19,67:20,68:21,69:22,70:23,71:24,72:25,73:26,74:27,75:28,76:29,77:32,78:110,79:$Ve,85:111,86:$Vf,87:126,88:$Vg,90:$Vh,94:90,95:$Vi,97:127,98:$Vj,102:$Vk,103:$Vl,104:$Vm,105:$Vn,106:$Vo,107:$Vp,108:$Vq,109:$Vr,111:58,112:$Vs,115:$Vt,120:112,128:$VH1,129:$VF1,130:59,131:$Vx,145:$Vy,146:$Vz,164:$VA,179:81,180:$VB,181:$VC,186:57,187:$VD,188:50,195:62,196:63,197:64,198:$VG,199:$VH,203:$VI,204:$VJ,213:56,219:88,220:87,228:122,229:$VN,230:$VO,231:$VP,235:86,236:72,237:$VQ,238:$VR,242:51,243:$VS,244:$VT,245:54,246:$VU,247:60,251:$VV,252:79,253:$VW,265:$VX,266:$VY,271:$VZ,277:$V_,278:75,279:$V$,281:$V01,282:76,283:$V11,284:77,286:118,287:$V21,288:$V31,289:119,297:$V41,301:73,302:$V51,306:$V61,307:$V71,308:$V81,309:$V91},{12:$V1,20:219,22:208,25:35,26:36,27:$V4,28:$V5,31:$V6,32:$V7,33:41,35:$V9,42:113,46:105,47:30,48:31,55:$Vc,61:61,62:$Vd,64:52,65:53,66:19,67:20,68:21,69:22,70:23,71:24,72:25,73:26,74:27,75:28,76:29,77:32,78:110,79:$Ve,85:111,86:$Vf,87:126,88:$Vg,90:$Vh,94:90,95:$Vi,97:127,98:$Vj,102:$Vk,103:$Vl,104:$Vm,105:$Vn,106:$Vo,107:$Vp,108:$Vq,109:$Vr,111:58,112:$Vs,115:$Vt,120:112,128:$VH1,129:$VF1,130:59,131:$Vx,145:$Vy,146:$Vz,164:$VA,179:81,180:$VB,181:$VC,186:57,187:$VD,188:50,195:62,196:63,197:64,198:$VG,199:$VH,203:$VI,204:$VJ,213:56,219:88,220:87,228:122,229:$VN,230:$VO,231:$VP,235:86,236:72,237:$VQ,238:$VR,242:51,243:$VS,244:$VT,245:54,246:$VU,247:60,251:$VV,252:79,253:$VW,265:$VX,266:$VY,271:$VZ,277:$V_,278:75,279:$V$,281:$V01,282:76,283:$V11,284:77,286:118,287:$V21,288:$V31,289:119,297:$V41,301:73,302:$V51,306:$V61,307:$V71,308:$V81,309:$V91},{12:$V1,20:220,22:208,25:35,26:36,27:$V4,28:$V5,31:$V6,32:$V7,33:41,35:$V9,42:113,46:105,47:30,48:31,55:$Vc,61:61,62:$Vd,64:52,65:53,66:19,67:20,68:21,69:22,70:23,71:24,72:25,73:26,74:27,75:28,76:29,77:32,78:110,79:$Ve,85:111,86:$Vf,87:126,88:$Vg,90:$Vh,94:90,95:$Vi,97:127,98:$Vj,102:$Vk,103:$Vl,104:$Vm,105:$Vn,106:$Vo,107:$Vp,108:$Vq,109:$Vr,111:58,112:$Vs,115:$Vt,120:112,128:$VH1,129:$VF1,130:59,131:$Vx,145:$Vy,146:$Vz,164:$VA,179:81,180:$VB,181:$VC,186:57,187:$VD,188:50,195:62,196:63,197:64,198:$VG,199:$VH,203:$VI,204:$VJ,213:56,219:88,220:87,228:122,229:$VN,230:$VO,231:$VP,235:86,236:72,237:$VQ,238:$VR,242:51,243:$VS,244:$VT,245:54,246:$VU,247:60,251:$VV,252:79,253:$VW,265:$VX,266:$VY,271:$VZ,277:$V_,278:75,279:$V$,281:$V01,282:76,283:$V11,284:77,286:118,287:$V21,288:$V31,289:119,297:$V41,301:73,302:$V51,306:$V61,307:$V71,308:$V81,309:$V91},{12:$V1,35:$V9,42:113,55:$Vc,61:61,62:$Vd,64:52,65:53,67:222,78:110,79:$Ve,85:111,86:$Vf,87:126,88:$Vg,90:$Vh,94:90,95:$Vi,97:127,98:$Vj,102:$Vk,103:$Vl,104:$Vm,105:$Vn,106:$Vo,107:$Vp,108:$Vq,111:58,112:$Vs,120:112,130:59,131:$Vx,164:$VA,186:57,187:$VD,188:223,213:56,219:88,220:87,228:122,229:$VN,230:$VO,231:$VP,235:86,236:221,237:$VQ,242:51,243:$VS,245:54,246:$VU,247:60,265:$VX,266:$VY},{12:$V1,35:$V9,42:113,55:$Vc,61:61,62:$Vd,64:52,65:53,67:222,78:110,79:$Ve,85:111,86:$Vf,87:126,88:$Vg,90:$Vh,94:90,95:$Vi,97:127,98:$Vj,102:$Vk,103:$Vl,104:$Vm,105:$Vn,106:$Vo,107:$Vp,108:$Vq,111:58,112:$Vs,120:112,130:59,131:$Vx,164:$VA,186:57,187:$VD,188:223,213:56,219:88,220:87,228:122,229:$VN,230:$VO,231:$VP,235:86,236:224,237:$VQ,242:51,243:$VS,245:54,246:$VU,247:60,265:$VX,266:$VY},o($VL1,$VM1,{308:[1,225],309:[1,226],314:[1,227]}),o($Vt1,[2,463],{285:[1,228],303:[1,229]}),{5:230,15:$V2,16:$V3},{5:231,15:$V2,16:$V3},o($Vt1,[2,426]),{5:232,15:$V2,16:$V3},{12:$V1,16:[1,234],20:233,22:208,25:35,26:36,27:$V4,28:$V5,31:$V6,32:$V7,33:41,35:$V9,42:113,46:105,47:30,48:31,55:$Vc,61:61,62:$Vd,64:52,65:53,66:19,67:20,68:21,69:22,70:23,71:24,72:25,73:26,74:27,75:28,76:29,77:32,78:110,79:$Ve,85:111,86:$Vf,87:126,88:$Vg,90:$Vh,94:90,95:$Vi,97:127,98:$Vj,102:$Vk,103:$Vl,104:$Vm,105:$Vn,106:$Vo,107:$Vp,108:$Vq,109:$Vr,111:58,112:$Vs,115:$Vt,120:112,128:$VH1,129:$VF1,130:59,131:$Vx,145:$Vy,146:$Vz,164:$VA,179:81,180:$VB,181:$VC,186:57,187:$VD,188:50,195:62,196:63,197:64,198:$VG,199:$VH,203:$VI,204:$VJ,213:56,219:88,220:87,228:122,229:$VN,230:$VO,231:$VP,235:86,236:72,237:$VQ,238:$VR,242:51,243:$VS,244:$VT,245:54,246:$VU,247:60,251:$VV,252:79,253:$VW,265:$VX,266:$VY,271:$VZ,277:$V_,278:75,279:$V$,281:$V01,282:76,283:$V11,284:77,286:118,287:$V21,288:$V31,289:119,297:$V41,301:73,302:$V51,306:$V61,307:$V71,308:$V81,309:$V91},o($Vt1,[2,350]),{179:236,181:$VC,252:235,253:$VW},o($Vt1,[2,205]),o($VN1,[2,128],{116:237,119:238,120:239,122:242,12:[1,240],35:$VO1,121:[1,241],162:$VP1,266:$VY}),o($VB1,[2,117],{66:19,67:20,68:21,69:22,70:23,71:24,72:25,73:26,74:27,75:28,76:29,47:30,48:31,77:32,25:35,26:36,33:41,188:50,242:51,64:52,65:53,245:54,213:56,186:57,111:58,130:59,247:60,61:61,195:62,196:63,197:64,236:72,301:73,278:75,282:76,284:77,252:79,179:81,235:86,220:87,219:88,94:90,46:105,78:110,85:111,120:112,42:113,286:118,289:119,228:122,87:126,97:127,22:208,20:245,110:246,12:$V1,27:$V4,28:$V5,29:$VQ1,31:$V6,32:$V7,35:$V9,55:$Vc,62:$Vd,79:$Ve,86:$Vf,88:$Vg,90:$Vh,95:$Vi,98:$Vj,102:$Vk,103:$Vl,104:$Vm,105:$Vn,106:$Vo,107:$Vp,108:$Vq,109:$Vr,112:$Vs,115:$Vt,128:$VH1,129:$VF1,131:$Vx,145:$Vy,146:$Vz,164:$VA,180:$VB,181:$VC,187:$VD,198:$VG,199:$VH,203:$VI,204:$VJ,229:$VN,230:$VO,231:$VP,237:$VQ,238:$VR,243:$VS,244:$VT,246:$VU,251:$VV,253:$VW,265:$VX,266:$VY,271:$VZ,277:$V_,283:$V11,297:$V41,302:$V51,306:$V61,307:$V71,308:$V81,309:$V91}),{12:$V1,20:248,22:208,25:35,26:36,27:$V4,28:$V5,31:$V6,32:$V7,33:41,35:$V9,42:113,46:105,47:30,48:31,55:$Vc,61:61,62:$Vd,64:52,65:53,66:19,67:20,68:21,69:22,70:23,71:24,72:25,73:26,74:27,75:28,76:29,77:32,78:110,79:$Ve,85:111,86:$Vf,87:126,88:$Vg,90:$Vh,94:90,95:$Vi,97:127,98:$Vj,102:$Vk,103:$Vl,104:$Vm,105:$Vn,106:$Vo,107:$Vp,108:$Vq,109:$Vr,111:58,112:$Vs,115:$Vt,120:112,128:$VH1,129:$VF1,130:59,131:$Vx,145:$Vy,146:$Vz,164:$VA,179:81,180:$VB,181:$VC,186:57,187:$VD,188:50,195:62,196:63,197:64,198:$VG,199:$VH,203:$VI,204:$VJ,213:56,219:88,220:87,228:122,229:$VN,230:$VO,231:$VP,235:86,236:72,237:$VQ,238:$VR,242:51,243:$VS,244:$VT,245:54,246:$VU,247:60,251:$VV,252:79,253:$VW,265:$VX,266:$VY,271:$VZ,277:$V_,278:75,279:$V$,281:$V01,282:76,283:$V11,284:77,286:118,287:$V21,288:$V31,289:119,297:$V41,301:73,302:$V51,306:$V61,307:$V71,308:$V81,309:$V91},{12:$V1,42:249},o($VL1,[2,318]),o($VL1,[2,319]),o($VL1,[2,320]),o($VI1,[2,316]),o($VI1,[2,107]),o($VI1,[2,108]),o($VI1,[2,109]),o($VI1,[2,110]),o($VI1,[2,111]),o($VI1,[2,112]),o($VI1,[2,113]),o($VI1,[2,114]),{12:$V1,16:$VR1,20:251,22:208,25:35,26:36,27:$V4,28:$V5,31:$V6,32:$V7,33:41,35:$V9,42:113,46:105,47:30,48:31,55:$Vc,61:61,62:$Vd,64:52,65:53,66:19,67:20,68:21,69:22,70:23,71:24,72:25,73:26,74:27,75:28,76:29,77:32,78:110,79:$Ve,85:111,86:$Vf,87:126,88:$Vg,90:$Vh,94:90,95:$Vi,97:127,98:$Vj,102:$Vk,103:$Vl,104:$Vm,105:$Vn,106:$Vo,107:$Vp,108:$Vq,109:$Vr,111:58,112:$Vs,115:$Vt,120:112,128:$VH1,129:$VF1,130:59,131:$Vx,145:$Vy,146:$Vz,164:$VA,179:81,180:$VB,181:$VC,186:57,187:$VD,188:50,195:62,196:63,197:64,198:$VG,199:$VH,203:$VI,204:$VJ,213:56,219:88,220:87,228:122,229:$VN,230:$VO,231:$VP,235:86,236:72,237:$VQ,238:$VR,242:51,243:$VS,244:$VT,245:54,246:$VU,247:60,250:250,251:$VV,252:79,253:$VW,265:$VX,266:$VY,271:$VZ,277:$V_,278:75,279:$V$,281:$V01,282:76,283:$V11,284:77,286:118,287:$V21,288:$V31,289:119,297:$V41,301:73,302:$V51,306:$V61,307:$V71,308:$V81,309:$V91},{12:$V1,16:$VS1,20:253,21:261,22:208,25:35,26:36,27:$V4,28:$V5,31:$V6,32:$V7,33:41,35:$V9,42:113,46:105,47:30,48:31,55:$Vc,61:61,62:$Vd,64:52,65:53,66:19,67:20,68:21,69:22,70:23,71:24,72:25,73:26,74:27,75:28,76:29,77:32,78:110,79:$Ve,85:111,86:$Vf,87:126,88:$Vg,90:$Vh,92:255,94:90,95:$Vi,97:127,98:$Vj,102:$Vk,103:$Vl,104:$Vm,105:$Vn,106:$Vo,107:$Vp,108:$Vq,109:$Vr,111:58,112:$Vs,115:$Vt,120:112,128:$VH1,129:$VF1,130:59,131:$Vx,145:$Vy,146:$Vz,164:$VA,165:$VT1,176:$VU1,177:259,178:$VV1,179:81,180:$VB,181:$VC,186:57,187:$VD,188:50,193:$VE,194:$VF,195:62,196:63,197:64,198:$VG,199:$VH,203:$VI,204:$VJ,213:56,219:88,220:87,223:$VW1,228:122,229:$VN,230:$VO,231:$VP,235:86,236:72,237:$VQ,238:$VR,242:51,243:$VS,244:$VT,245:54,246:$VU,247:60,251:$VV,252:79,253:$VW,265:$VX,266:$VY,269:256,271:$VZ,277:$V_,278:75,279:$V$,281:$V01,282:76,283:$V11,284:77,286:118,287:$V21,288:$V31,289:119,297:$V41,301:73,302:$V51,306:$V61,307:$V71,308:$V81,309:$V91},o([1,6,13,14,15,16,17,29,30,37,58,79,81,91,140,144,145,146,165,172,176,178,184,199,202,210,211,212,241,248,264,268,279,280,281,287,288,296,304,305,310,311,312,313],[2,389]),o($VI1,[2,216]),o($VX1,[2,118]),{132:[1,263]},o($VI1,[2,68],{94:90,87:126,97:127,63:264,64:265,65:266,55:$Vc,88:$Vg,90:$Vh,95:$Vi,98:$Vj,102:$Vk,103:$Vl,104:$Vm,105:$Vn,106:$Vo,107:$Vp,108:$Vq}),o($Vt1,[2,244]),{46:267,204:$VJ},{5:268,15:$V2,16:$V3,200:[1,269]},{5:270,15:$V2,16:$V3},o($VY1,[2,306]),o($VY1,[2,307],{80:$VZ1}),o($VY1,[2,308]),o($VY1,[2,309]),o($VY1,[2,310]),{12:$V1,20:272,22:208,25:35,26:36,27:$V4,28:$V5,31:$V6,32:$V7,33:41,35:$V9,42:113,46:105,47:30,48:31,55:$Vc,61:61,62:$Vd,64:52,65:53,66:19,67:20,68:21,69:22,70:23,71:24,72:25,73:26,74:27,75:28,76:29,77:32,78:110,79:$Ve,85:111,86:$Vf,87:126,88:$Vg,90:$Vh,94:90,95:$Vi,97:127,98:$Vj,102:$Vk,103:$Vl,104:$Vm,105:$Vn,106:$Vo,107:$Vp,108:$Vq,109:$Vr,111:58,112:$Vs,115:$Vt,120:112,128:$VH1,129:$VF1,130:59,131:$Vx,145:$Vy,146:$Vz,164:$VA,179:81,180:$VB,181:$VC,186:57,187:$VD,188:50,195:62,196:63,197:64,198:$VG,199:$VH,203:$VI,204:$VJ,213:56,219:88,220:87,228:122,229:$VN,230:$VO,231:$VP,235:86,236:72,237:$VQ,238:$VR,242:51,243:$VS,244:$VT,245:54,246:$VU,247:60,251:$VV,252:79,253:$VW,265:$VX,266:$VY,271:$VZ,277:$V_,278:75,279:$V$,281:$V01,282:76,283:$V11,284:77,286:118,287:$V21,288:$V31,289:119,297:$V41,301:73,302:$V51,306:$V61,307:$V71,308:$V81,309:$V91},{12:$V1,20:273,22:208,25:35,26:36,27:$V4,28:$V5,31:$V6,32:$V7,33:41,35:$V9,42:113,46:105,47:30,48:31,55:$Vc,61:61,62:$Vd,64:52,65:53,66:19,67:20,68:21,69:22,70:23,71:24,72:25,73:26,74:27,75:28,76:29,77:32,78:110,79:$Ve,85:111,86:$Vf,87:126,88:$Vg,90:$Vh,94:90,95:$Vi,97:127,98:$Vj,102:$Vk,103:$Vl,104:$Vm,105:$Vn,106:$Vo,107:$Vp,108:$Vq,109:$Vr,111:58,112:$Vs,115:$Vt,120:112,128:$VH1,129:$VF1,130:59,131:$Vx,145:$Vy,146:$Vz,164:$VA,179:81,180:$VB,181:$VC,186:57,187:$VD,188:50,195:62,196:63,197:64,198:$VG,199:$VH,203:$VI,204:$VJ,213:56,219:88,220:87,228:122,229:$VN,230:$VO,231:$VP,235:86,236:72,237:$VQ,238:$VR,242:51,243:$VS,244:$VT,245:54,246:$VU,247:60,251:$VV,252:79,253:$VW,265:$VX,266:$VY,271:$VZ,277:$V_,278:75,279:$V$,281:$V01,282:76,283:$V11,284:77,286:118,287:$V21,288:$V31,289:119,297:$V41,301:73,302:$V51,306:$V61,307:$V71,308:$V81,309:$V91},{12:$V1,20:274,22:208,25:35,26:36,27:$V4,28:$V5,31:$V6,32:$V7,33:41,35:$V9,42:113,46:105,47:30,48:31,55:$Vc,61:61,62:$Vd,64:52,65:53,66:19,67:20,68:21,69:22,70:23,71:24,72:25,73:26,74:27,75:28,76:29,77:32,78:110,79:$Ve,85:111,86:$Vf,87:126,88:$Vg,90:$Vh,94:90,95:$Vi,97:127,98:$Vj,102:$Vk,103:$Vl,104:$Vm,105:$Vn,106:$Vo,107:$Vp,108:$Vq,109:$Vr,111:58,112:$Vs,115:$Vt,120:112,128:$VH1,129:$VF1,130:59,131:$Vx,145:$Vy,146:$Vz,164:$VA,179:81,180:$VB,181:$VC,186:57,187:$VD,188:50,195:62,196:63,197:64,198:$VG,199:$VH,203:$VI,204:$VJ,213:56,219:88,220:87,228:122,229:$VN,230:$VO,231:$VP,235:86,236:72,237:$VQ,238:$VR,242:51,243:$VS,244:$VT,245:54,246:$VU,247:60,251:$VV,252:79,253:$VW,265:$VX,266:$VY,271:$VZ,277:$V_,278:75,279:$V$,281:$V01,282:76,283:$V11,284:77,286:118,287:$V21,288:$V31,289:119,297:$V41,301:73,302:$V51,306:$V61,307:$V71,308:$V81,309:$V91},{5:275,12:$V1,15:$V2,16:$V3,20:276,22:208,25:35,26:36,27:$V4,28:$V5,31:$V6,32:$V7,33:41,35:$V9,42:113,46:105,47:30,48:31,55:$Vc,61:61,62:$Vd,64:52,65:53,66:19,67:20,68:21,69:22,70:23,71:24,72:25,73:26,74:27,75:28,76:29,77:32,78:110,79:$Ve,85:111,86:$Vf,87:126,88:$Vg,90:$Vh,94:90,95:$Vi,97:127,98:$Vj,102:$Vk,103:$Vl,104:$Vm,105:$Vn,106:$Vo,107:$Vp,108:$Vq,109:$Vr,111:58,112:$Vs,115:$Vt,120:112,128:$VH1,129:$VF1,130:59,131:$Vx,145:$Vy,146:$Vz,164:$VA,179:81,180:$VB,181:$VC,186:57,187:$VD,188:50,195:62,196:63,197:64,198:$VG,199:$VH,203:$VI,204:$VJ,213:56,219:88,220:87,228:122,229:$VN,230:$VO,231:$VP,235:86,236:72,237:$VQ,238:$VR,242:51,243:$VS,244:$VT,245:54,246:$VU,247:60,251:$VV,252:79,253:$VW,265:$VX,266:$VY,271:$VZ,277:$V_,278:75,279:$V$,281:$V01,282:76,283:$V11,284:77,286:118,287:$V21,288:$V31,289:119,297:$V41,301:73,302:$V51,306:$V61,307:$V71,308:$V81,309:$V91},{12:$V1,35:$V9,42:281,164:$VA,219:283,220:282,245:277,291:278,292:[1,279],293:280},{290:284,294:[1,285],295:[1,286]},{12:$V1,16:$V_1,35:$V9,42:113,55:$Vc,61:61,62:$Vd,64:52,65:53,67:222,78:110,79:$Ve,85:111,86:$Vf,87:126,88:$Vg,90:$Vh,94:90,95:$Vi,97:127,98:$Vj,102:$Vk,103:$Vl,104:$Vm,105:$Vn,106:$Vo,107:$Vp,108:$Vq,111:58,112:$Vs,120:112,130:59,131:$Vx,164:$VA,183:288,184:[1,289],186:57,187:$VD,188:223,213:56,219:88,220:87,228:122,229:$VN,230:$VO,231:$VP,235:86,236:287,237:$VQ,242:51,243:$VS,245:54,246:$VU,247:60,265:$VX,266:$VY},{121:$V$1,182:291},{12:$V1,35:$V9,42:294,164:$Vs1,219:296,220:295,233:293},o([6,16,37,58],$V02,{87:126,97:127,249:297,189:298,46:299,190:300,191:301,21:302,94:305,42:306,83:307,78:308,12:$V1,55:$Vc,79:$Ve,84:$V12,88:$Vg,90:$V22,95:$Vi,98:$Vj,164:$V32,193:$VE,194:$VF,204:$VJ}),o($VI1,[2,96],{96:[1,310]}),o($VI1,[2,97]),o($VI1,[2,98]),o($VI1,[2,99],{100:312,80:[1,314],99:[1,311],101:[1,313]}),{12:$V1,42:319,60:320,82:$V42,120:318,164:$V52,205:315,207:316,213:317,265:$VX,266:$VY},{12:[1,323]},o($VY1,[2,88]),o([1,6,11,13,14,15,16,17,29,30,37,58,79,81,90,91,117,140,144,145,146,153,154,155,156,157,158,159,160,163,164,165,166,172,176,178,184,193,194,199,202,210,211,212,241,248,264,268,279,280,281,287,288,296,304,305,308,309,310,311,312,313,314],[2,390]),o([1,6,11,12,13,14,15,16,17,29,30,35,37,38,41,53,58,79,81,91,140,144,145,146,164,165,166,172,176,178,184,199,202,210,211,212,222,241,248,264,268,279,280,281,287,288,294,295,296,304,305,308,309,310,311,312,313,314],[2,85]),o($V62,[2,433]),o($V62,[2,434]),o($VG1,[2,290]),o($VG1,[2,291]),o($VG1,[2,292]),o($VI1,[2,89]),o($V72,[2,101]),o($Vb1,[2,7],{18:8,19:9,20:10,21:11,22:12,23:13,24:14,123:15,224:18,66:19,67:20,68:21,69:22,70:23,71:24,72:25,73:26,74:27,75:28,76:29,47:30,48:31,77:32,25:35,26:36,33:41,188:50,242:51,64:52,65:53,245:54,213:56,186:57,111:58,130:59,247:60,61:61,195:62,196:63,197:64,236:72,301:73,278:75,282:76,284:77,252:79,179:81,235:86,220:87,219:88,94:90,46:105,78:110,85:111,120:112,42:113,286:118,289:119,228:122,87:126,97:127,8:324,12:$V1,27:$V4,28:$V5,31:$V6,32:$V7,34:$V8,35:$V9,45:$Va,50:$Vb,55:$Vc,62:$Vd,79:$Ve,86:$Vf,88:$Vg,90:$Vh,95:$Vi,98:$Vj,102:$Vk,103:$Vl,104:$Vm,105:$Vn,106:$Vo,107:$Vp,108:$Vq,109:$Vr,112:$Vs,115:$Vt,124:$Vu,128:$Vv,129:$Vw,131:$Vx,145:$Vy,146:$Vz,164:$VA,180:$VB,181:$VC,187:$VD,193:$VE,194:$VF,198:$VG,199:$VH,203:$VI,204:$VJ,225:$VK,226:$VL,227:$VM,229:$VN,230:$VO,231:$VP,237:$VQ,238:$VR,243:$VS,244:$VT,246:$VU,251:$VV,253:$VW,265:$VX,266:$VY,271:$VZ,277:$V_,279:$V$,281:$V01,283:$V11,287:$V21,288:$V31,297:$V41,302:$V51,306:$V61,307:$V71,308:$V81,309:$V91}),o([1,6,12,17,27,28,31,32,34,35,45,50,55,62,79,82,84,86,88,90,95,98,102,103,104,105,106,107,108,109,112,115,124,125,128,129,131,142,145,146,164,176,178,180,181,187,193,194,198,199,203,204,223,225,226,227,229,230,231,237,238,243,244,246,251,253,259,260,265,266,271,277,279,281,283,287,288,297,302,306,307,308,309],$V82),{1:[2,3]},o($Vc1,[2,12]),{6:$Va1,9:140,17:[1,325]},{4:326,7:$V0,8:5,12:$V1,18:8,19:9,20:10,21:11,22:12,23:13,24:14,25:35,26:36,27:$V4,28:$V5,31:$V6,32:$V7,33:41,34:$V8,35:$V9,42:113,45:$Va,46:105,47:30,48:31,50:$Vb,55:$Vc,61:61,62:$Vd,64:52,65:53,66:19,67:20,68:21,69:22,70:23,71:24,72:25,73:26,74:27,75:28,76:29,77:32,78:110,79:$Ve,85:111,86:$Vf,87:126,88:$Vg,90:$Vh,94:90,95:$Vi,97:127,98:$Vj,102:$Vk,103:$Vl,104:$Vm,105:$Vn,106:$Vo,107:$Vp,108:$Vq,109:$Vr,111:58,112:$Vs,115:$Vt,120:112,123:15,124:$Vu,128:$Vv,129:$Vw,130:59,131:$Vx,145:$Vy,146:$Vz,164:$VA,179:81,180:$VB,181:$VC,186:57,187:$VD,188:50,193:$VE,194:$VF,195:62,196:63,197:64,198:$VG,199:$VH,203:$VI,204:$VJ,213:56,219:88,220:87,224:18,225:$VK,226:$VL,227:$VM,228:122,229:$VN,230:$VO,231:$VP,235:86,236:72,237:$VQ,238:$VR,242:51,243:$VS,244:$VT,245:54,246:$VU,247:60,251:$VV,252:79,253:$VW,265:$VX,266:$VY,271:$VZ,277:$V_,278:75,279:$V$,281:$V01,282:76,283:$V11,284:77,286:118,287:$V21,288:$V31,289:119,297:$V41,301:73,302:$V51,306:$V61,307:$V71,308:$V81,309:$V91},{12:$V1,35:$V9,42:174,164:$Vs1,219:176,220:175,232:173,234:327},{12:$V1,20:328,22:208,25:35,26:36,27:$V4,28:$V5,31:$V6,32:$V7,33:41,35:$V9,42:113,46:105,47:30,48:31,55:$Vc,61:61,62:$Vd,64:52,65:53,66:19,67:20,68:21,69:22,70:23,71:24,72:25,73:26,74:27,75:28,76:29,77:32,78:110,79:$Ve,85:111,86:$Vf,87:126,88:$Vg,90:$Vh,94:90,95:$Vi,97:127,98:$Vj,102:$Vk,103:$Vl,104:$Vm,105:$Vn,106:$Vo,107:$Vp,108:$Vq,109:$Vr,111:58,112:$Vs,115:$Vt,120:112,128:$VH1,129:$VF1,130:59,131:$Vx,145:$Vy,146:$Vz,164:$VA,179:81,180:$VB,181:$VC,186:57,187:$VD,188:50,195:62,196:63,197:64,198:$VG,199:$VH,203:$VI,204:$VJ,213:56,219:88,220:87,228:122,229:$VN,230:$VO,231:$VP,235:86,236:72,237:$VQ,238:$VR,242:51,243:$VS,244:$VT,245:54,246:$VU,247:60,251:$VV,252:79,253:$VW,265:$VX,266:$VY,271:$VZ,277:$V_,278:75,279:$V$,281:$V01,282:76,283:$V11,284:77,286:118,287:$V21,288:$V31,289:119,297:$V41,301:73,302:$V51,306:$V61,307:$V71,308:$V81,309:$V91},{12:$V1,20:329,22:208,25:35,26:36,27:$V4,28:$V5,31:$V6,32:$V7,33:41,35:$V9,42:113,46:105,47:30,48:31,55:$Vc,61:61,62:$Vd,64:52,65:53,66:19,67:20,68:21,69:22,70:23,71:24,72:25,73:26,74:27,75:28,76:29,77:32,78:110,79:$Ve,85:111,86:$Vf,87:126,88:$Vg,90:$Vh,94:90,95:$Vi,97:127,98:$Vj,102:$Vk,103:$Vl,104:$Vm,105:$Vn,106:$Vo,107:$Vp,108:$Vq,109:$Vr,111:58,112:$Vs,115:$Vt,120:112,128:$VH1,129:$VF1,130:59,131:$Vx,145:$Vy,146:$Vz,164:$VA,179:81,180:$VB,181:$VC,186:57,187:$VD,188:50,195:62,196:63,197:64,198:$VG,199:$VH,203:$VI,204:$VJ,213:56,219:88,220:87,228:122,229:$VN,230:$VO,231:$VP,235:86,236:72,237:$VQ,238:$VR,242:51,243:$VS,244:$VT,245:54,246:$VU,247:60,251:$VV,252:79,253:$VW,265:$VX,266:$VY,271:$VZ,277:$V_,278:75,279:$V$,281:$V01,282:76,283:$V11,284:77,286:118,287:$V21,288:$V31,289:119,297:$V41,301:73,302:$V51,306:$V61,307:$V71,308:$V81,309:$V91},{12:$V1,20:330,22:208,25:35,26:36,27:$V4,28:$V5,31:$V6,32:$V7,33:41,35:$V9,42:113,46:105,47:30,48:31,55:$Vc,61:61,62:$Vd,64:52,65:53,66:19,67:20,68:21,69:22,70:23,71:24,72:25,73:26,74:27,75:28,76:29,77:32,78:110,79:$Ve,85:111,86:$Vf,87:126,88:$Vg,90:$Vh,94:90,95:$Vi,97:127,98:$Vj,102:$Vk,103:$Vl,104:$Vm,105:$Vn,106:$Vo,107:$Vp,108:$Vq,109:$Vr,111:58,112:$Vs,115:$Vt,120:112,128:$VH1,129:$VF1,130:59,131:$Vx,145:$Vy,146:$Vz,164:$VA,179:81,180:$VB,181:$VC,186:57,187:$VD,188:50,195:62,196:63,197:64,198:$VG,199:$VH,203:$VI,204:$VJ,213:56,219:88,220:87,228:122,229:$VN,230:$VO,231:$VP,235:86,236:72,237:$VQ,238:$VR,242:51,243:$VS,244:$VT,245:54,246:$VU,247:60,251:$VV,252:79,253:$VW,265:$VX,266:$VY,271:$VZ,277:$V_,278:75,279:$V$,281:$V01,282:76,283:$V11,284:77,286:118,287:$V21,288:$V31,289:119,297:$V41,301:73,302:$V51,306:$V61,307:$V71,308:$V81,309:$V91},{12:$V1,20:331,22:208,25:35,26:36,27:$V4,28:$V5,31:$V6,32:$V7,33:41,35:$V9,42:113,46:105,47:30,48:31,55:$Vc,61:61,62:$Vd,64:52,65:53,66:19,67:20,68:21,69:22,70:23,71:24,72:25,73:26,74:27,75:28,76:29,77:32,78:110,79:$Ve,85:111,86:$Vf,87:126,88:$Vg,90:$Vh,94:90,95:$Vi,97:127,98:$Vj,102:$Vk,103:$Vl,104:$Vm,105:$Vn,106:$Vo,107:$Vp,108:$Vq,109:$Vr,111:58,112:$Vs,115:$Vt,120:112,128:$VH1,129:$VF1,130:59,131:$Vx,145:$Vy,146:$Vz,164:$VA,179:81,180:$VB,181:$VC,186:57,187:$VD,188:50,195:62,196:63,197:64,198:$VG,199:$VH,203:$VI,204:$VJ,213:56,219:88,220:87,228:122,229:$VN,230:$VO,231:$VP,235:86,236:72,237:$VQ,238:$VR,242:51,243:$VS,244:$VT,245:54,246:$VU,247:60,251:$VV,252:79,253:$VW,265:$VX,266:$VY,271:$VZ,277:$V_,278:75,279:$V$,281:$V01,282:76,283:$V11,284:77,286:118,287:$V21,288:$V31,289:119,297:$V41,301:73,302:$V51,306:$V61,307:$V71,308:$V81,309:$V91},{12:$V1,20:332,22:208,25:35,26:36,27:$V4,28:$V5,31:$V6,32:$V7,33:41,35:$V9,42:113,46:105,47:30,48:31,55:$Vc,61:61,62:$Vd,64:52,65:53,66:19,67:20,68:21,69:22,70:23,71:24,72:25,73:26,74:27,75:28,76:29,77:32,78:110,79:$Ve,85:111,86:$Vf,87:126,88:$Vg,90:$Vh,94:90,95:$Vi,97:127,98:$Vj,102:$Vk,103:$Vl,104:$Vm,105:$Vn,106:$Vo,107:$Vp,108:$Vq,109:$Vr,111:58,112:$Vs,115:$Vt,120:112,128:$VH1,129:$VF1,130:59,131:$Vx,145:$Vy,146:$Vz,164:$VA,179:81,180:$VB,181:$VC,186:57,187:$VD,188:50,195:62,196:63,197:64,198:$VG,199:$VH,203:$VI,204:$VJ,213:56,219:88,220:87,228:122,229:$VN,230:$VO,231:$VP,235:86,236:72,237:$VQ,238:$VR,242:51,243:$VS,244:$VT,245:54,246:$VU,247:60,251:$VV,252:79,253:$VW,265:$VX,266:$VY,271:$VZ,277:$V_,278:75,279:$V$,281:$V01,282:76,283:$V11,284:77,286:118,287:$V21,288:$V31,289:119,297:$V41,301:73,302:$V51,306:$V61,307:$V71,308:$V81,309:$V91},{12:$V1,20:333,22:208,25:35,26:36,27:$V4,28:$V5,31:$V6,32:$V7,33:41,35:$V9,42:113,46:105,47:30,48:31,55:$Vc,61:61,62:$Vd,64:52,65:53,66:19,67:20,68:21,69:22,70:23,71:24,72:25,73:26,74:27,75:28,76:29,77:32,78:110,79:$Ve,85:111,86:$Vf,87:126,88:$Vg,90:$Vh,94:90,95:$Vi,97:127,98:$Vj,102:$Vk,103:$Vl,104:$Vm,105:$Vn,106:$Vo,107:$Vp,108:$Vq,109:$Vr,111:58,112:$Vs,115:$Vt,120:112,128:$VH1,129:$VF1,130:59,131:$Vx,145:$Vy,146:$Vz,164:$VA,179:81,180:$VB,181:$VC,186:57,187:$VD,188:50,195:62,196:63,197:64,198:$VG,199:$VH,203:$VI,204:$VJ,213:56,219:88,220:87,228:122,229:$VN,230:$VO,231:$VP,235:86,236:72,237:$VQ,238:$VR,242:51,243:$VS,244:$VT,245:54,246:$VU,247:60,251:$VV,252:79,253:$VW,265:$VX,266:$VY,271:$VZ,277:$V_,278:75,279:$V$,281:$V01,282:76,283:$V11,284:77,286:118,287:$V21,288:$V31,289:119,297:$V41,301:73,302:$V51,306:$V61,307:$V71,308:$V81,309:$V91},{12:$V1,20:334,22:208,25:35,26:36,27:$V4,28:$V5,31:$V6,32:$V7,33:41,35:$V9,42:113,46:105,47:30,48:31,55:$Vc,61:61,62:$Vd,64:52,65:53,66:19,67:20,68:21,69:22,70:23,71:24,72:25,73:26,74:27,75:28,76:29,77:32,78:110,79:$Ve,85:111,86:$Vf,87:126,88:$Vg,90:$Vh,94:90,95:$Vi,97:127,98:$Vj,102:$Vk,103:$Vl,104:$Vm,105:$Vn,106:$Vo,107:$Vp,108:$Vq,109:$Vr,111:58,112:$Vs,115:$Vt,120:112,128:$VH1,129:$VF1,130:59,131:$Vx,145:$Vy,146:$Vz,164:$VA,179:81,180:$VB,181:$VC,186:57,187:$VD,188:50,195:62,196:63,197:64,198:$VG,199:$VH,203:$VI,204:$VJ,213:56,219:88,220:87,228:122,229:$VN,230:$VO,231:$VP,235:86,236:72,237:$VQ,238:$VR,242:51,243:$VS,244:$VT,245:54,246:$VU,247:60,251:$VV,252:79,253:$VW,265:$VX,266:$VY,271:$VZ,277:$V_,278:75,279:$V$,281:$V01,282:76,283:$V11,284:77,286:118,287:$V21,288:$V31,289:119,297:$V41,301:73,302:$V51,306:$V61,307:$V71,308:$V81,309:$V91},{313:[1,335]},{12:$V1,20:336,22:208,25:35,26:36,27:$V4,28:$V5,31:$V6,32:$V7,33:41,35:$V9,42:113,46:105,47:30,48:31,55:$Vc,61:61,62:$Vd,64:52,65:53,66:19,67:20,68:21,69:22,70:23,71:24,72:25,73:26,74:27,75:28,76:29,77:32,78:110,79:$Ve,85:111,86:$Vf,87:126,88:$Vg,90:$Vh,94:90,95:$Vi,97:127,98:$Vj,102:$Vk,103:$Vl,104:$Vm,105:$Vn,106:$Vo,107:$Vp,108:$Vq,109:$Vr,111:58,112:$Vs,115:$Vt,120:112,128:$VH1,129:$VF1,130:59,131:$Vx,145:$Vy,146:$Vz,164:$VA,179:81,180:$VB,181:$VC,186:57,187:$VD,188:50,195:62,196:63,197:64,198:$VG,199:$VH,203:$VI,204:$VJ,213:56,219:88,220:87,228:122,229:$VN,230:$VO,231:$VP,235:86,236:72,237:$VQ,238:$VR,242:51,243:$VS,244:$VT,245:54,246:$VU,247:60,251:$VV,252:79,253:$VW,265:$VX,266:$VY,271:$VZ,277:$V_,278:75,279:$V$,281:$V01,282:76,283:$V11,284:77,286:118,287:$V21,288:$V31,289:119,297:$V41,301:73,302:$V51,306:$V61,307:$V71,308:$V81,309:$V91},{12:$V1,20:337,22:208,25:35,26:36,27:$V4,28:$V5,31:$V6,32:$V7,33:41,35:$V9,42:113,46:105,47:30,48:31,55:$Vc,61:61,62:$Vd,64:52,65:53,66:19,67:20,68:21,69:22,70:23,71:24,72:25,73:26,74:27,75:28,76:29,77:32,78:110,79:$Ve,85:111,86:$Vf,87:126,88:$Vg,90:$Vh,94:90,95:$Vi,97:127,98:$Vj,102:$Vk,103:$Vl,104:$Vm,105:$Vn,106:$Vo,107:$Vp,108:$Vq,109:$Vr,111:58,112:$Vs,115:$Vt,120:112,128:$VH1,129:$VF1,130:59,131:$Vx,145:$Vy,146:$Vz,164:$VA,179:81,180:$VB,181:$VC,186:57,187:$VD,188:50,195:62,196:63,197:64,198:$VG,199:$VH,203:$VI,204:$VJ,213:56,219:88,220:87,228:122,229:$VN,230:$VO,231:$VP,235:86,236:72,237:$VQ,238:$VR,242:51,243:$VS,244:$VT,245:54,246:$VU,247:60,251:$VV,252:79,253:$VW,265:$VX,266:$VY,271:$VZ,277:$V_,278:75,279:$V$,281:$V01,282:76,283:$V11,284:77,286:118,287:$V21,288:$V31,289:119,297:$V41,301:73,302:$V51,306:$V61,307:$V71,308:$V81,309:$V91},{12:$V1,20:338,22:208,25:35,26:36,27:$V4,28:$V5,31:$V6,32:$V7,33:41,35:$V9,42:113,46:105,47:30,48:31,55:$Vc,61:61,62:$Vd,64:52,65:53,66:19,67:20,68:21,69:22,70:23,71:24,72:25,73:26,74:27,75:28,76:29,77:32,78:110,79:$Ve,85:111,86:$Vf,87:126,88:$Vg,90:$Vh,94:90,95:$Vi,97:127,98:$Vj,102:$Vk,103:$Vl,104:$Vm,105:$Vn,106:$Vo,107:$Vp,108:$Vq,109:$Vr,111:58,112:$Vs,115:$Vt,120:112,128:$VH1,129:$VF1,130:59,131:$Vx,145:$Vy,146:$Vz,164:$VA,179:81,180:$VB,181:$VC,186:57,187:$VD,188:50,195:62,196:63,197:64,198:$VG,199:$VH,203:$VI,204:$VJ,213:56,219:88,220:87,228:122,229:$VN,230:$VO,231:$VP,235:86,236:72,237:$VQ,238:$VR,242:51,243:$VS,244:$VT,245:54,246:$VU,247:60,251:$VV,252:79,253:$VW,265:$VX,266:$VY,271:$VZ,277:$V_,278:75,279:$V$,281:$V01,282:76,283:$V11,284:77,286:118,287:$V21,288:$V31,289:119,297:$V41,301:73,302:$V51,306:$V61,307:$V71,308:$V81,309:$V91},o($Vt1,[2,425]),o($Vt1,[2,430]),{12:$V1,20:339,22:208,25:35,26:36,27:$V4,28:$V5,31:$V6,32:$V7,33:41,35:$V9,42:113,46:105,47:30,48:31,55:$Vc,61:61,62:$Vd,64:52,65:53,66:19,67:20,68:21,69:22,70:23,71:24,72:25,73:26,74:27,75:28,76:29,77:32,78:110,79:$Ve,85:111,86:$Vf,87:126,88:$Vg,90:$Vh,94:90,95:$Vi,97:127,98:$Vj,102:$Vk,103:$Vl,104:$Vm,105:$Vn,106:$Vo,107:$Vp,108:$Vq,109:$Vr,111:58,112:$Vs,115:$Vt,120:112,128:$VH1,129:$VF1,130:59,131:$Vx,145:$Vy,146:$Vz,164:$VA,179:81,180:$VB,181:$VC,186:57,187:$VD,188:50,195:62,196:63,197:64,198:$VG,199:$VH,203:$VI,204:$VJ,213:56,219:88,220:87,228:122,229:$VN,230:$VO,231:$VP,235:86,236:72,237:$VQ,238:$VR,242:51,243:$VS,244:$VT,245:54,246:$VU,247:60,251:$VV,252:79,253:$VW,265:$VX,266:$VY,271:$VZ,277:$V_,278:75,279:$V$,281:$V01,282:76,283:$V11,284:77,286:118,287:$V21,288:$V31,289:119,297:$V41,301:73,302:$V51,306:$V61,307:$V71,308:$V81,309:$V91},o($Vt1,[2,424]),o($Vt1,[2,429]),o($Vb1,[2,131]),o($Vt1,[2,353]),o($Vt1,[2,208]),o($Vt1,[2,245]),{18:163,123:15,124:$Vu,128:$Vq1,129:$Vr1},{18:169,123:15,124:$Vu,128:$Vq1,129:$Vr1},o($Vb1,[2,132]),o($Vt1,[2,352]),o($Vt1,[2,207]),o($V92,[2,303]),o($V92,[2,300],{166:[1,340]}),o($Va2,[2,293],{10:341,11:$VK1}),o($Va2,[2,295]),o($Va2,[2,296]),{12:$V1,16:$VS1,20:342,21:261,22:208,25:35,26:36,27:$V4,28:$V5,31:$V6,32:$V7,33:41,35:$V9,42:113,46:105,47:30,48:31,55:$Vc,61:61,62:$Vd,64:52,65:53,66:19,67:20,68:21,69:22,70:23,71:24,72:25,73:26,74:27,75:28,76:29,77:32,78:110,79:$Ve,85:111,86:$Vf,87:126,88:$Vg,90:$Vh,92:255,94:90,95:$Vi,97:127,98:$Vj,102:$Vk,103:$Vl,104:$Vm,105:$Vn,106:$Vo,107:$Vp,108:$Vq,109:$Vr,111:58,112:$Vs,115:$Vt,120:112,128:$VH1,129:$VF1,130:59,131:$Vx,145:$Vy,146:$Vz,164:$VA,165:$VT1,176:$VU1,177:259,178:$VV1,179:81,180:$VB,181:$VC,186:57,187:$VD,188:50,193:$VE,194:$VF,195:62,196:63,197:64,198:$VG,199:$VH,203:$VI,204:$VJ,213:56,219:88,220:87,223:$VW1,228:122,229:$VN,230:$VO,231:$VP,235:86,236:72,237:$VQ,238:$VR,242:51,243:$VS,244:$VT,245:54,246:$VU,247:60,251:$VV,252:79,253:$VW,265:$VX,266:$VY,269:256,271:$VZ,277:$V_,278:75,279:$V$,281:$V01,282:76,283:$V11,284:77,286:118,287:$V21,288:$V31,289:119,297:$V41,301:73,302:$V51,306:$V61,307:$V71,308:$V81,309:$V91},o($VI1,[2,334]),{29:$VQ1,110:343},o($VI1,[2,384]),{12:[2,314],238:[1,344]},{12:$V1,42:345},{12:$V1,20:347,22:208,25:35,26:36,27:$V4,28:$V5,31:$V6,32:$V7,33:41,35:$V9,42:113,46:105,47:30,48:31,55:$Vc,61:61,62:$Vd,64:52,65:53,66:19,67:20,68:21,69:22,70:23,71:24,72:25,73:26,74:27,75:28,76:29,77:32,78:110,79:$Ve,85:111,86:$Vf,87:126,88:$Vg,90:$Vh,94:90,95:$Vi,97:127,98:$Vj,102:$Vk,103:$Vl,104:$Vm,105:$Vn,106:$Vo,107:$Vp,108:$Vq,109:$Vr,111:58,112:$Vs,115:$Vt,120:112,128:$VH1,129:$VF1,130:59,131:$Vx,145:$Vy,146:$Vz,164:$VA,179:81,180:$VB,181:$VC,186:57,187:$VD,188:50,195:62,196:63,197:64,198:$VG,199:$VH,203:$VI,204:$VJ,213:56,219:88,220:87,228:122,229:$VN,230:$VO,231:$VP,235:86,236:72,237:$VQ,238:$VR,240:346,242:51,243:$VS,244:$VT,245:54,246:$VU,247:60,251:$VV,252:79,253:$VW,265:$VX,266:$VY,271:$VZ,277:$V_,278:75,279:$V$,281:$V01,282:76,283:$V11,284:77,286:118,287:$V21,288:$V31,289:119,297:$V41,301:73,302:$V51,306:$V61,307:$V71,308:$V81,309:$V91},{29:[2,386]},{12:[2,315]},{12:$V1,20:348,22:208,25:35,26:36,27:$V4,28:$V5,31:$V6,32:$V7,33:41,35:$V9,42:113,46:105,47:30,48:31,55:$Vc,61:61,62:$Vd,64:52,65:53,66:19,67:20,68:21,69:22,70:23,71:24,72:25,73:26,74:27,75:28,76:29,77:32,78:110,79:$Ve,85:111,86:$Vf,87:126,88:$Vg,90:$Vh,94:90,95:$Vi,97:127,98:$Vj,102:$Vk,103:$Vl,104:$Vm,105:$Vn,106:$Vo,107:$Vp,108:$Vq,109:$Vr,111:58,112:$Vs,115:$Vt,120:112,128:$VH1,129:$VF1,130:59,131:$Vx,145:$Vy,146:$Vz,164:$VA,179:81,180:$VB,181:$VC,186:57,187:$VD,188:50,195:62,196:63,197:64,198:$VG,199:$VH,203:$VI,204:$VJ,213:56,219:88,220:87,228:122,229:$VN,230:$VO,231:$VP,235:86,236:72,237:$VQ,238:$VR,242:51,243:$VS,244:$VT,245:54,246:$VU,247:60,251:$VV,252:79,253:$VW,265:$VX,266:$VY,271:$VZ,277:$V_,278:75,279:$V$,281:$V01,282:76,283:$V11,284:77,286:118,287:$V21,288:$V31,289:119,297:$V41,301:73,302:$V51,306:$V61,307:$V71,308:$V81,309:$V91},{12:$V1,20:349,22:208,25:35,26:36,27:$V4,28:$V5,31:$V6,32:$V7,33:41,35:$V9,42:113,46:105,47:30,48:31,55:$Vc,61:61,62:$Vd,64:52,65:53,66:19,67:20,68:21,69:22,70:23,71:24,72:25,73:26,74:27,75:28,76:29,77:32,78:110,79:$Ve,85:111,86:$Vf,87:126,88:$Vg,90:$Vh,94:90,95:$Vi,97:127,98:$Vj,102:$Vk,103:$Vl,104:$Vm,105:$Vn,106:$Vo,107:$Vp,108:$Vq,109:$Vr,111:58,112:$Vs,115:$Vt,120:112,128:$VH1,129:$VF1,130:59,131:$Vx,145:$Vy,146:$Vz,164:$VA,179:81,180:$VB,181:$VC,186:57,187:$VD,188:50,195:62,196:63,197:64,198:$VG,199:$VH,203:$VI,204:$VJ,213:56,219:88,220:87,228:122,229:$VN,230:$VO,231:$VP,235:86,236:72,237:$VQ,238:$VR,242:51,243:$VS,244:$VT,245:54,246:$VU,247:60,251:$VV,252:79,253:$VW,265:$VX,266:$VY,271:$VZ,277:$V_,278:75,279:$V$,281:$V01,282:76,283:$V11,284:77,286:118,287:$V21,288:$V31,289:119,297:$V41,301:73,302:$V51,306:$V61,307:$V71,308:$V81,309:$V91},o($Vb1,[2,45]),{38:[1,350],53:[1,351]},{38:[1,352]},{12:$V1,16:$Vb2,36:354,37:[1,353],42:357,44:$Vc2,57:355,60:358,82:$V42},o([1,6,12,17,30,55,58,95,127,133,142,144,145,146,149,150,151,152],[2,100]),o([38,53],[2,44]),{41:[1,360]},{12:$V1,16:$Vb2,36:361,42:357,44:$Vc2,57:355,60:358,82:$V42},{38:[1,362],41:[1,363]},o($Vb1,[2,35]),{33:201,43:364,46:199,47:200,48:202,128:$VE1,129:$VF1,179:81,180:$VB,181:$VC,204:$VJ,251:$VV,252:79,253:$VW},o($Vb1,[2,38]),o($Vb1,[2,39]),o($Vb1,[2,40]),o($Vb1,[2,41]),{179:171,181:$VC,252:170,253:$VW},{179:165,181:$VC,252:164,253:$VW},o($Vb1,[2,37],{58:$Vd1}),{16:$Vd2,125:$Ve2,126:365,137:366,138:368,139:370,142:$Vf2},o($Vg2,[2,321],{286:118,289:119,278:158,284:159,312:$Vn1}),{278:161,279:$V$,281:$V01,284:162,286:118,287:$V21,288:$V31,289:119,304:$Vp1},{46:166,179:165,181:$VC,204:$VJ,252:164,253:$VW},{12:$V1,16:[1,373],20:372,22:208,25:35,26:36,27:$V4,28:$V5,31:$V6,32:$V7,33:41,35:$V9,42:113,46:105,47:30,48:31,55:$Vc,61:61,62:$Vd,64:52,65:53,66:19,67:20,68:21,69:22,70:23,71:24,72:25,73:26,74:27,75:28,76:29,77:32,78:110,79:$Ve,85:111,86:$Vf,87:126,88:$Vg,90:$Vh,94:90,95:$Vi,97:127,98:$Vj,102:$Vk,103:$Vl,104:$Vm,105:$Vn,106:$Vo,107:$Vp,108:$Vq,109:$Vr,111:58,112:$Vs,115:$Vt,120:112,128:$VH1,129:$VF1,130:59,131:$Vx,145:$Vy,146:$Vz,164:$VA,179:81,180:$VB,181:$VC,186:57,187:$VD,188:50,195:62,196:63,197:64,198:$VG,199:$VH,203:$VI,204:$VJ,213:56,219:88,220:87,228:122,229:$VN,230:$VO,231:$VP,235:86,236:72,237:$VQ,238:$VR,242:51,243:$VS,244:$VT,245:54,246:$VU,247:60,251:$VV,252:79,253:$VW,265:$VX,266:$VY,271:$VZ,277:$V_,278:75,279:$V$,281:$V01,282:76,283:$V11,284:77,286:118,287:$V21,288:$V31,289:119,297:$V41,301:73,302:$V51,306:$V61,307:$V71,308:$V81,309:$V91},{166:[1,374]},{12:[1,375]},o($VX1,[2,119]),{12:$V1,20:376,22:208,25:35,26:36,27:$V4,28:$V5,31:$V6,32:$V7,33:41,35:$V9,42:113,46:105,47:30,48:31,55:$Vc,61:61,62:$Vd,64:52,65:53,66:19,67:20,68:21,69:22,70:23,71:24,72:25,73:26,74:27,75:28,76:29,77:32,78:110,79:$Ve,85:111,86:$Vf,87:126,88:$Vg,90:$Vh,94:90,95:$Vi,97:127,98:$Vj,102:$Vk,103:$Vl,104:$Vm,105:$Vn,106:$Vo,107:$Vp,108:$Vq,109:$Vr,111:58,112:$Vs,115:$Vt,120:112,128:$VH1,129:$VF1,130:59,131:$Vx,145:$Vy,146:$Vz,164:$VA,179:81,180:$VB,181:$VC,186:57,187:$VD,188:50,195:62,196:63,197:64,198:$VG,199:$VH,203:$VI,204:$VJ,213:56,219:88,220:87,228:122,229:$VN,230:$VO,231:$VP,235:86,236:72,237:$VQ,238:$VR,242:51,243:$VS,244:$VT,245:54,246:$VU,247:60,251:$VV,252:79,253:$VW,265:$VX,266:$VY,271:$VZ,277:$V_,278:75,279:$V$,281:$V01,282:76,283:$V11,284:77,286:118,287:$V21,288:$V31,289:119,297:$V41,301:73,302:$V51,306:$V61,307:$V71,308:$V81,309:$V91},o($VX1,[2,121]),o($Vg2,[2,467],{286:118,289:119,278:158,284:159,312:$Vn1}),o($Vg2,[2,468],{286:118,289:119,278:158,284:159,312:$Vn1}),o($Vg2,[2,469],{286:118,289:119,278:158,284:159,312:$Vn1}),o($Vg2,[2,470],{286:118,289:119,278:158,284:159,312:$Vn1}),o($Vg2,[2,471],{286:118,289:119,278:158,284:159,312:$Vn1}),o($Vt1,[2,472],{13:$VM1,29:$VM1,199:$VM1,210:$VM1,241:$VM1,248:$VM1,264:$VM1}),{13:$Vu1,29:$Vv1,196:180,199:$VH,210:$Vw1,239:182,241:$Vx1,248:$Vy1,263:179,264:$Vz1},o([13,29,199,210,241,248,264],$VJ1),o($Vt1,[2,473],{13:$VM1,29:$VM1,199:$VM1,210:$VM1,241:$VM1,248:$VM1,264:$VM1}),o($Vt1,[2,474]),o($Vt1,[2,475]),{12:$V1,16:[1,378],20:377,22:208,25:35,26:36,27:$V4,28:$V5,31:$V6,32:$V7,33:41,35:$V9,42:113,46:105,47:30,48:31,55:$Vc,61:61,62:$Vd,64:52,65:53,66:19,67:20,68:21,69:22,70:23,71:24,72:25,73:26,74:27,75:28,76:29,77:32,78:110,79:$Ve,85:111,86:$Vf,87:126,88:$Vg,90:$Vh,94:90,95:$Vi,97:127,98:$Vj,102:$Vk,103:$Vl,104:$Vm,105:$Vn,106:$Vo,107:$Vp,108:$Vq,109:$Vr,111:58,112:$Vs,115:$Vt,120:112,128:$VH1,129:$VF1,130:59,131:$Vx,145:$Vy,146:$Vz,164:$VA,179:81,180:$VB,181:$VC,186:57,187:$VD,188:50,195:62,196:63,197:64,198:$VG,199:$VH,203:$VI,204:$VJ,213:56,219:88,220:87,228:122,229:$VN,230:$VO,231:$VP,235:86,236:72,237:$VQ,238:$VR,242:51,243:$VS,244:$VT,245:54,246:$VU,247:60,251:$VV,252:79,253:$VW,265:$VX,266:$VY,271:$VZ,277:$V_,278:75,279:$V$,281:$V01,282:76,283:$V11,284:77,286:118,287:$V21,288:$V31,289:119,297:$V41,301:73,302:$V51,306:$V61,307:$V71,308:$V81,309:$V91},{5:380,15:$V2,16:$V3,302:[1,379]},{12:$V1,20:381,22:208,25:35,26:36,27:$V4,28:$V5,31:$V6,32:$V7,33:41,35:$V9,42:113,46:105,47:30,48:31,55:$Vc,61:61,62:$Vd,64:52,65:53,66:19,67:20,68:21,69:22,70:23,71:24,72:25,73:26,74:27,75:28,76:29,77:32,78:110,79:$Ve,85:111,86:$Vf,87:126,88:$Vg,90:$Vh,94:90,95:$Vi,97:127,98:$Vj,102:$Vk,103:$Vl,104:$Vm,105:$Vn,106:$Vo,107:$Vp,108:$Vq,109:$Vr,111:58,112:$Vs,115:$Vt,120:112,128:$VH1,129:$VF1,130:59,131:$Vx,145:$Vy,146:$Vz,164:$VA,179:81,180:$VB,181:$VC,186:57,187:$VD,188:50,195:62,196:63,197:64,198:$VG,199:$VH,203:$VI,204:$VJ,213:56,219:88,220:87,228:122,229:$VN,230:$VO,231:$VP,235:86,236:72,237:$VQ,238:$VR,242:51,243:$VS,244:$VT,245:54,246:$VU,247:60,251:$VV,252:79,253:$VW,265:$VX,266:$VY,271:$VZ,277:$V_,278:75,279:$V$,281:$V01,282:76,283:$V11,284:77,286:118,287:$V21,288:$V31,289:119,297:$V41,301:73,302:$V51,306:$V61,307:$V71,308:$V81,309:$V91},o($Vt1,[2,411],{272:382,273:383,274:$Vh2,275:[1,384]}),o($Vt1,[2,423]),o($Vt1,[2,431],{285:[1,386]}),{16:[1,387],144:$Ve1,145:$Vf1,146:$Vg1,178:$Vh1,184:$Vi1,278:158,279:$V$,281:$V01,284:159,286:118,287:$V21,288:$V31,289:119,304:$Vj1,305:$Vk1,310:$Vl1,311:$Vm1,312:$Vn1,313:$Vo1},{298:388,299:389,300:$Vi2},o($Vt1,[2,351]),o($Vt1,[2,206]),{6:[1,406],13:[1,392],21:405,29:[1,403],79:[1,400],90:[1,402],117:[1,391],154:[1,393],155:[1,394],156:[1,395],157:[1,396],158:[1,397],159:[1,398],160:[1,399],163:[1,401],164:[1,404],166:[1,407],193:$VE,194:$VF},o($Vj2,[2,161],{153:[1,408]}),o($VN1,[2,124]),o($VN1,[2,125]),o($VN1,[2,126]),o($VN1,[2,127],{35:$Vk2,162:$Vl2}),o($Vm2,[2,183]),{12:$V1,20:411,22:208,25:35,26:36,27:$V4,28:$V5,31:$V6,32:$V7,33:41,35:$V9,42:113,46:105,47:30,48:31,55:$Vc,61:61,62:$Vd,64:52,65:53,66:19,67:20,68:21,69:22,70:23,71:24,72:25,73:26,74:27,75:28,76:29,77:32,78:110,79:$Ve,85:111,86:$Vf,87:126,88:$Vg,90:$Vh,94:90,95:$Vi,97:127,98:$Vj,102:$Vk,103:$Vl,104:$Vm,105:$Vn,106:$Vo,107:$Vp,108:$Vq,109:$Vr,111:58,112:$Vs,115:$Vt,120:112,128:$VH1,129:$VF1,130:59,131:$Vx,145:$Vy,146:$Vz,164:$VA,179:81,180:$VB,181:$VC,186:57,187:$VD,188:50,195:62,196:63,197:64,198:$VG,199:$VH,203:$VI,204:$VJ,213:56,219:88,220:87,228:122,229:$VN,230:$VO,231:$VP,235:86,236:72,237:$VQ,238:$VR,242:51,243:$VS,244:$VT,245:54,246:$VU,247:60,251:$VV,252:79,253:$VW,265:$VX,266:$VY,271:$VZ,277:$V_,278:75,279:$V$,281:$V01,282:76,283:$V11,284:77,286:118,287:$V21,288:$V31,289:119,297:$V41,301:73,302:$V51,306:$V61,307:$V71,308:$V81,309:$V91},o($VB1,[2,115],{286:118,289:119,278:158,284:159,144:$Ve1,145:$Vf1,146:$Vg1,178:$Vh1,184:$Vi1,305:$Vk1,310:$Vl1,311:$Vm1,312:$Vn1,313:$Vo1}),o($VB1,[2,116]),{12:$V1,16:$VS1,20:342,21:261,22:208,25:35,26:36,27:$V4,28:$V5,30:[1,412],31:$V6,32:$V7,33:41,35:$V9,42:113,46:105,47:30,48:31,55:$Vc,61:61,62:$Vd,64:52,65:53,66:19,67:20,68:21,69:22,70:23,71:24,72:25,73:26,74:27,75:28,76:29,77:32,78:110,79:$Ve,85:111,86:$Vf,87:126,88:$Vg,90:$Vh,92:413,94:90,95:$Vi,97:127,98:$Vj,102:$Vk,103:$Vl,104:$Vm,105:$Vn,106:$Vo,107:$Vp,108:$Vq,109:$Vr,111:58,112:$Vs,115:$Vt,120:112,128:$VH1,129:$VF1,130:59,131:$Vx,145:$Vy,146:$Vz,164:$VA,176:$VU1,177:259,178:$VV1,179:81,180:$VB,181:$VC,186:57,187:$VD,188:50,193:$VE,194:$VF,195:62,196:63,197:64,198:$VG,199:$VH,203:$VI,204:$VJ,213:56,219:88,220:87,223:$VW1,228:122,229:$VN,230:$VO,231:$VP,235:86,236:72,237:$VQ,238:$VR,242:51,243:$VS,244:$VT,245:54,246:$VU,247:60,251:$VV,252:79,253:$VW,265:$VX,266:$VY,269:256,271:$VZ,277:$V_,278:75,279:$V$,281:$V01,282:76,283:$V11,284:77,286:118,287:$V21,288:$V31,289:119,297:$V41,301:73,302:$V51,306:$V61,307:$V71,308:$V81,309:$V91},o($VB1,[2,417],{286:118,289:119,278:158,284:159,144:$Ve1,145:$Vf1,146:$Vg1,178:$Vh1,184:$Vi1,305:$Vk1,310:$Vl1,311:$Vm1,312:$Vn1,313:$Vo1}),{16:$V_1,29:[1,414],183:415},o($Vn2,$Vo2,{59:418,58:$Vp2,91:[1,416]}),o($Vq2,[2,342],{286:118,289:119,278:158,284:159,144:$Ve1,145:$Vf1,146:$Vg1,178:$Vh1,184:$Vi1,279:$V$,281:$V01,287:$V21,288:$V31,304:$Vj1,305:$Vk1,310:$Vl1,311:$Vm1,312:$Vn1,313:$Vo1}),{12:$V1,16:$VR1,20:251,22:208,25:35,26:36,27:$V4,28:$V5,31:$V6,32:$V7,33:41,35:$V9,42:113,46:105,47:30,48:31,55:$Vc,61:61,62:$Vd,64:52,65:53,66:19,67:20,68:21,69:22,70:23,71:24,72:25,73:26,74:27,75:28,76:29,77:32,78:110,79:$Ve,85:111,86:$Vf,87:126,88:$Vg,90:$Vh,94:90,95:$Vi,97:127,98:$Vj,102:$Vk,103:$Vl,104:$Vm,105:$Vn,106:$Vo,107:$Vp,108:$Vq,109:$Vr,111:58,112:$Vs,115:$Vt,120:112,128:$VH1,129:$VF1,130:59,131:$Vx,145:$Vy,146:$Vz,164:$VA,179:81,180:$VB,181:$VC,186:57,187:$VD,188:50,195:62,196:63,197:64,198:$VG,199:$VH,203:$VI,204:$VJ,213:56,219:88,220:87,228:122,229:$VN,230:$VO,231:$VP,235:86,236:72,237:$VQ,238:$VR,242:51,243:$VS,244:$VT,245:54,246:$VU,247:60,250:419,251:$VV,252:79,253:$VW,265:$VX,266:$VY,271:$VZ,277:$V_,278:75,279:$V$,281:$V01,282:76,283:$V11,284:77,286:118,287:$V21,288:$V31,289:119,297:$V41,301:73,302:$V51,306:$V61,307:$V71,308:$V81,309:$V91},o([6,16,58,165],$Vr2,{286:118,289:119,278:158,284:159,267:420,144:$Ve1,145:$Vf1,146:$Vg1,176:[1,422],178:$Vh1,184:$Vi1,268:[1,421],279:$V$,281:$V01,287:$V21,288:$V31,304:$Vj1,305:$Vk1,310:$Vl1,311:$Vm1,312:$Vn1,313:$Vo1}),o($Vs2,[2,391]),o([6,16,165],$Vo2,{59:423,58:$Vt2}),o($Vu2,[2,396]),{12:$V1,16:$VS1,20:342,21:261,22:208,25:35,26:36,27:$V4,28:$V5,31:$V6,32:$V7,33:41,35:$V9,42:113,46:105,47:30,48:31,55:$Vc,61:61,62:$Vd,64:52,65:53,66:19,67:20,68:21,69:22,70:23,71:24,72:25,73:26,74:27,75:28,76:29,77:32,78:110,79:$Ve,85:111,86:$Vf,87:126,88:$Vg,90:$Vh,92:425,94:90,95:$Vi,97:127,98:$Vj,102:$Vk,103:$Vl,104:$Vm,105:$Vn,106:$Vo,107:$Vp,108:$Vq,109:$Vr,111:58,112:$Vs,115:$Vt,120:112,128:$VH1,129:$VF1,130:59,131:$Vx,145:$Vy,146:$Vz,164:$VA,176:$VU1,177:259,178:$VV1,179:81,180:$VB,181:$VC,186:57,187:$VD,188:50,193:$VE,194:$VF,195:62,196:63,197:64,198:$VG,199:$VH,203:$VI,204:$VJ,213:56,219:88,220:87,223:$VW1,228:122,229:$VN,230:$VO,231:$VP,235:86,236:72,237:$VQ,238:$VR,242:51,243:$VS,244:$VT,245:54,246:$VU,247:60,251:$VV,252:79,253:$VW,265:$VX,266:$VY,269:256,271:$VZ,277:$V_,278:75,279:$V$,281:$V01,282:76,283:$V11,284:77,286:118,287:$V21,288:$V31,289:119,297:$V41,301:73,302:$V51,306:$V61,307:$V71,308:$V81,309:$V91},{12:$V1,20:426,22:208,25:35,26:36,27:$V4,28:$V5,31:$V6,32:$V7,33:41,35:$V9,42:113,46:105,47:30,48:31,55:$Vc,61:61,62:$Vd,64:52,65:53,66:19,67:20,68:21,69:22,70:23,71:24,72:25,73:26,74:27,75:28,76:29,77:32,78:110,79:$Ve,85:111,86:$Vf,87:126,88:$Vg,90:$Vh,94:90,95:$Vi,97:127,98:$Vj,102:$Vk,103:$Vl,104:$Vm,105:$Vn,106:$Vo,107:$Vp,108:$Vq,109:$Vr,111:58,112:$Vs,115:$Vt,120:112,128:$VH1,129:$VF1,130:59,131:$Vx,145:$Vy,146:$Vz,164:$VA,179:81,180:$VB,181:$VC,186:57,187:$VD,188:50,195:62,196:63,197:64,198:$VG,199:$VH,203:$VI,204:$VJ,213:56,219:88,220:87,228:122,229:$VN,230:$VO,231:$VP,235:86,236:72,237:$VQ,238:$VR,242:51,243:$VS,244:$VT,245:54,246:$VU,247:60,251:$VV,252:79,253:$VW,265:$VX,266:$VY,271:$VZ,277:$V_,278:75,279:$V$,281:$V01,282:76,283:$V11,284:77,286:118,287:$V21,288:$V31,289:119,297:$V41,301:73,302:$V51,306:$V61,307:$V71,308:$V81,309:$V91},o($Vu2,[2,406]),o($Vu2,[2,407]),o($Vu2,[2,408]),{12:$V1,20:427,22:208,25:35,26:36,27:$V4,28:$V5,31:$V6,32:$V7,33:41,35:$V9,42:113,46:105,47:30,48:31,55:$Vc,61:61,62:$Vd,64:52,65:53,66:19,67:20,68:21,69:22,70:23,71:24,72:25,73:26,74:27,75:28,76:29,77:32,78:110,79:$Ve,85:111,86:$Vf,87:126,88:$Vg,90:$Vh,94:90,95:$Vi,97:127,98:$Vj,102:$Vk,103:$Vl,104:$Vm,105:$Vn,106:$Vo,107:$Vp,108:$Vq,109:$Vr,111:58,112:$Vs,115:$Vt,120:112,128:$VH1,129:$VF1,130:59,131:$Vx,145:$Vy,146:$Vz,164:$VA,179:81,180:$VB,181:$VC,186:57,187:$VD,188:50,195:62,196:63,197:64,198:$VG,199:$VH,203:$VI,204:$VJ,213:56,219:88,220:87,228:122,229:$VN,230:$VO,231:$VP,235:86,236:72,237:$VQ,238:$VR,242:51,243:$VS,244:$VT,245:54,246:$VU,247:60,251:$VV,252:79,253:$VW,265:$VX,266:$VY,271:$VZ,277:$V_,278:75,279:$V$,281:$V01,282:76,283:$V11,284:77,286:118,287:$V21,288:$V31,289:119,297:$V41,301:73,302:$V51,306:$V61,307:$V71,308:$V81,309:$V91},{16:$Vd2,125:$Ve2,126:428,137:366,138:368,139:370,142:$Vf2},o($VI1,[2,65]),o($VI1,[2,66]),o($VI1,[2,67]),o($Vt1,[2,246]),o($VI1,[2,242]),o([58,202],$Vv2,{201:429,216:430,219:431,220:432,221:433,42:436,12:$V1,35:$V9,164:$Vs1,176:$Vw2,222:$Vx2}),o($Vt1,[2,241]),{12:$V1,20:437,22:208,25:35,26:36,27:$V4,28:$V5,31:$V6,32:$V7,33:41,35:$V9,42:113,46:105,47:30,48:31,55:$Vc,61:61,62:$Vd,64:52,65:53,66:19,67:20,68:21,69:22,70:23,71:24,72:25,73:26,74:27,75:28,76:29,77:32,78:110,79:$Ve,85:111,86:$Vf,87:126,88:$Vg,90:$Vh,94:90,95:$Vi,97:127,98:$Vj,102:$Vk,103:$Vl,104:$Vm,105:$Vn,106:$Vo,107:$Vp,108:$Vq,109:$Vr,111:58,112:$Vs,115:$Vt,120:112,128:$VH1,129:$VF1,130:59,131:$Vx,145:$Vy,146:$Vz,164:$VA,179:81,180:$VB,181:$VC,186:57,187:$VD,188:50,195:62,196:63,197:64,198:$VG,199:$VH,203:$VI,204:$VJ,213:56,219:88,220:87,228:122,229:$VN,230:$VO,231:$VP,235:86,236:72,237:$VQ,238:$VR,242:51,243:$VS,244:$VT,245:54,246:$VU,247:60,251:$VV,252:79,253:$VW,265:$VX,266:$VY,271:$VZ,277:$V_,278:75,279:$V$,281:$V01,282:76,283:$V11,284:77,286:118,287:$V21,288:$V31,289:119,297:$V41,301:73,302:$V51,306:$V61,307:$V71,308:$V81,309:$V91},{5:438,15:$V2,16:$V3,144:$Ve1,145:$Vf1,146:$Vg1,178:$Vh1,184:$Vi1,278:158,279:$V$,281:$V01,284:159,286:118,287:$V21,288:$V31,289:119,304:$Vj1,305:$Vk1,310:$Vl1,311:$Vm1,312:$Vn1,313:$Vo1},o($Vy2,[2,419],{286:118,289:119,278:158,284:159,144:$Ve1,145:$Vf1,146:$Vg1,178:$Vh1,184:$Vi1,279:$V$,280:[1,439],281:$V01,287:$V21,305:$Vk1,310:$Vl1,311:$Vm1,312:$Vn1,313:$Vo1}),o($Vy2,[2,421],{286:118,289:119,278:158,284:159,144:$Ve1,145:$Vf1,146:$Vg1,178:$Vh1,184:$Vi1,279:$V$,280:[1,440],281:$V01,287:$V21,305:$Vk1,310:$Vl1,311:$Vm1,312:$Vn1,313:$Vo1}),o($Vt1,[2,427]),o($Vz2,[2,428],{286:118,289:119,278:158,284:159,144:$Ve1,145:$Vf1,146:$Vg1,178:$Vh1,184:$Vi1,279:$V$,281:$V01,287:$V21,305:$Vk1,310:$Vl1,311:$Vm1,312:$Vn1,313:$Vo1}),o($Vt1,[2,435]),o($VA2,[2,437]),{12:$V1,35:$V9,42:281,164:$Vs1,219:283,220:282,291:441,293:280},o($VA2,[2,442],{58:[1,442]}),o($VB2,[2,439]),o($VB2,[2,440]),o($VB2,[2,441]),o($Vt1,[2,436]),{12:$V1,20:443,22:208,25:35,26:36,27:$V4,28:$V5,31:$V6,32:$V7,33:41,35:$V9,42:113,46:105,47:30,48:31,55:$Vc,61:61,62:$Vd,64:52,65:53,66:19,67:20,68:21,69:22,70:23,71:24,72:25,73:26,74:27,75:28,76:29,77:32,78:110,79:$Ve,85:111,86:$Vf,87:126,88:$Vg,90:$Vh,94:90,95:$Vi,97:127,98:$Vj,102:$Vk,103:$Vl,104:$Vm,105:$Vn,106:$Vo,107:$Vp,108:$Vq,109:$Vr,111:58,112:$Vs,115:$Vt,120:112,128:$VH1,129:$VF1,130:59,131:$Vx,145:$Vy,146:$Vz,164:$VA,179:81,180:$VB,181:$VC,186:57,187:$VD,188:50,195:62,196:63,197:64,198:$VG,199:$VH,203:$VI,204:$VJ,213:56,219:88,220:87,228:122,229:$VN,230:$VO,231:$VP,235:86,236:72,237:$VQ,238:$VR,242:51,243:$VS,244:$VT,245:54,246:$VU,247:60,251:$VV,252:79,253:$VW,265:$VX,266:$VY,271:$VZ,277:$V_,278:75,279:$V$,281:$V01,282:76,283:$V11,284:77,286:118,287:$V21,288:$V31,289:119,297:$V41,301:73,302:$V51,306:$V61,307:$V71,308:$V81,309:$V91},{12:$V1,20:444,22:208,25:35,26:36,27:$V4,28:$V5,31:$V6,32:$V7,33:41,35:$V9,42:113,46:105,47:30,48:31,55:$Vc,61:61,62:$Vd,64:52,65:53,66:19,67:20,68:21,69:22,70:23,71:24,72:25,73:26,74:27,75:28,76:29,77:32,78:110,79:$Ve,85:111,86:$Vf,87:126,88:$Vg,90:$Vh,94:90,95:$Vi,97:127,98:$Vj,102:$Vk,103:$Vl,104:$Vm,105:$Vn,106:$Vo,107:$Vp,108:$Vq,109:$Vr,111:58,112:$Vs,115:$Vt,120:112,128:$VH1,129:$VF1,130:59,131:$Vx,145:$Vy,146:$Vz,164:$VA,179:81,180:$VB,181:$VC,186:57,187:$VD,188:50,195:62,196:63,197:64,198:$VG,199:$VH,203:$VI,204:$VJ,213:56,219:88,220:87,228:122,229:$VN,230:$VO,231:$VP,235:86,236:72,237:$VQ,238:$VR,242:51,243:$VS,244:$VT,245:54,246:$VU,247:60,251:$VV,252:79,253:$VW,265:$VX,266:$VY,271:$VZ,277:$V_,278:75,279:$V$,281:$V01,282:76,283:$V11,284:77,286:118,287:$V21,288:$V31,289:119,297:$V41,301:73,302:$V51,306:$V61,307:$V71,308:$V81,309:$V91},o($VC2,[2,354],{183:445,13:$VM1,29:$VM1,199:$VM1,210:$VM1,241:$VM1,248:$VM1,264:$VM1,16:$V_1,184:[1,446]}),o($Vt1,[2,356]),{12:$V1,20:447,22:208,25:35,26:36,27:$V4,28:$V5,31:$V6,32:$V7,33:41,35:$V9,42:113,46:105,47:30,48:31,55:$Vc,61:61,62:$Vd,64:52,65:53,66:19,67:20,68:21,69:22,70:23,71:24,72:25,73:26,74:27,75:28,76:29,77:32,78:110,79:$Ve,85:111,86:$Vf,87:126,88:$Vg,90:$Vh,94:90,95:$Vi,97:127,98:$Vj,102:$Vk,103:$Vl,104:$Vm,105:$Vn,106:$Vo,107:$Vp,108:$Vq,109:$Vr,111:58,112:$Vs,115:$Vt,120:112,128:$VH1,129:$VF1,130:59,131:$Vx,145:$Vy,146:$Vz,164:$VA,179:81,180:$VB,181:$VC,186:57,187:$VD,188:50,195:62,196:63,197:64,198:$VG,199:$VH,203:$VI,204:$VJ,213:56,219:88,220:87,228:122,229:$VN,230:$VO,231:$VP,235:86,236:72,237:$VQ,238:$VR,242:51,243:$VS,244:$VT,245:54,246:$VU,247:60,251:$VV,252:79,253:$VW,265:$VX,266:$VY,271:$VZ,277:$V_,278:75,279:$V$,281:$V01,282:76,283:$V11,284:77,286:118,287:$V21,288:$V31,289:119,297:$V41,301:73,302:$V51,306:$V61,307:$V71,308:$V81,309:$V91},{6:[1,450],12:$V1,17:[1,448],21:455,42:462,46:459,60:461,77:456,82:$V42,89:457,93:452,115:$Vt,123:454,124:$Vu,193:$VE,194:$VF,203:$VD2,204:$VJ,255:449,256:451,257:453,258:460,259:$VE2,260:$VF2},o($VC2,[2,209],{183:465,16:$V_1,184:[1,466]}),o($Vt1,[2,215]),o($VL1,[2,305]),o($VL1,[2,297]),o($VL1,[2,298]),o($VL1,[2,299]),o([6,16,37],$Vo2,{59:467,58:$VG2}),o($VH2,[2,338]),o($VH2,[2,221]),o($VH2,[2,222],{140:[1,469]}),o($VI2,[2,231],{166:[1,470]}),o($VH2,[2,227]),{12:$V1,20:471,22:208,25:35,26:36,27:$V4,28:$V5,31:$V6,32:$V7,33:41,35:$V9,42:113,46:105,47:30,48:31,55:$Vc,61:61,62:$Vd,64:52,65:53,66:19,67:20,68:21,69:22,70:23,71:24,72:25,73:26,74:27,75:28,76:29,77:32,78:110,79:$Ve,85:111,86:$Vf,87:126,88:$Vg,90:$Vh,94:90,95:$Vi,97:127,98:$Vj,102:$Vk,103:$Vl,104:$Vm,105:$Vn,106:$Vo,107:$Vp,108:$Vq,109:$Vr,111:58,112:$Vs,115:$Vt,120:112,128:$VH1,129:$VF1,130:59,131:$Vx,145:$Vy,146:$Vz,164:$VA,179:81,180:$VB,181:$VC,186:57,187:$VD,188:50,195:62,196:63,197:64,198:$VG,199:$VH,203:$VI,204:$VJ,213:56,219:88,220:87,228:122,229:$VN,230:$VO,231:$VP,235:86,236:72,237:$VQ,238:$VR,242:51,243:$VS,244:$VT,245:54,246:$VU,247:60,251:$VV,252:79,253:$VW,265:$VX,266:$VY,271:$VZ,277:$V_,278:75,279:$V$,281:$V01,282:76,283:$V11,284:77,286:118,287:$V21,288:$V31,289:119,297:$V41,301:73,302:$V51,306:$V61,307:$V71,308:$V81,309:$V91},{12:$V1,20:472,22:208,25:35,26:36,27:$V4,28:$V5,31:$V6,32:$V7,33:41,35:$V9,42:113,46:105,47:30,48:31,55:$Vc,61:61,62:$Vd,64:52,65:53,66:19,67:20,68:21,69:22,70:23,71:24,72:25,73:26,74:27,75:28,76:29,77:32,78:110,79:$Ve,85:111,86:$Vf,87:126,88:$Vg,90:$Vh,94:90,95:$Vi,97:127,98:$Vj,102:$Vk,103:$Vl,104:$Vm,105:$Vn,106:$Vo,107:$Vp,108:$Vq,109:$Vr,111:58,112:$Vs,115:$Vt,120:112,128:$VH1,129:$VF1,130:59,131:$Vx,145:$Vy,146:$Vz,164:$VA,179:81,180:$VB,181:$VC,186:57,187:$VD,188:50,195:62,196:63,197:64,198:$VG,199:$VH,203:$VI,204:$VJ,213:56,219:88,220:87,228:122,229:$VN,230:$VO,231:$VP,235:86,236:72,237:$VQ,238:$VR,242:51,243:$VS,244:$VT,245:54,246:$VU,247:60,251:$VV,252:79,253:$VW,265:$VX,266:$VY,271:$VZ,277:$V_,278:75,279:$V$,281:$V01,282:76,283:$V11,284:77,286:118,287:$V21,288:$V31,289:119,297:$V41,301:73,302:$V51,306:$V61,307:$V71,308:$V81,309:$V91},o($VI2,[2,234]),o($VJ2,[2,228]),o($VJ2,[2,229]),o($VJ2,[2,230],{80:$VZ1}),o($VJ2,[2,87]),o($VI1,[2,95]),o($V72,[2,102]),o($V72,[2,103]),o($V72,[2,104]),{12:$V1,20:474,22:208,25:35,26:36,27:$V4,28:$V5,31:$V6,32:$V7,33:41,35:$V9,42:113,46:105,47:30,48:31,55:$Vc,61:61,62:$Vd,64:52,65:53,66:19,67:20,68:21,69:22,70:23,71:24,72:25,73:26,74:27,75:28,76:29,77:32,78:110,79:$Ve,81:[1,473],85:111,86:$Vf,87:126,88:$Vg,90:$Vh,94:90,95:$Vi,97:127,98:$Vj,102:$Vk,103:$Vl,104:$Vm,105:$Vn,106:$Vo,107:$Vp,108:$Vq,109:$Vr,111:58,112:$Vs,115:$Vt,120:112,128:$VH1,129:$VF1,130:59,131:$Vx,145:$Vy,146:$Vz,164:$VA,179:81,180:$VB,181:$VC,186:57,187:$VD,188:50,195:62,196:63,197:64,198:$VG,199:$VH,203:$VI,204:$VJ,213:56,219:88,220:87,228:122,229:$VN,230:$VO,231:$VP,235:86,236:72,237:$VQ,238:$VR,242:51,243:$VS,244:$VT,245:54,246:$VU,247:60,251:$VV,252:79,253:$VW,265:$VX,266:$VY,271:$VZ,277:$V_,278:75,279:$V$,281:$V01,282:76,283:$V11,284:77,286:118,287:$V21,288:$V31,289:119,297:$V41,301:73,302:$V51,306:$V61,307:$V71,308:$V81,309:$V91},{79:[1,477],206:475,210:[1,476]},o($VK2,$Vv2,{216:430,219:431,220:432,221:433,42:436,208:478,201:479,12:$V1,29:$VL2,35:$V9,79:$VM2,210:$VM2,164:$Vs1,176:$Vw2,222:$Vx2}),o($VN2,[2,260]),o($VN2,[2,261]),o($VO2,[2,253]),o($VO2,[2,254]),{12:$V1,20:481,22:208,25:35,26:36,27:$V4,28:$V5,31:$V6,32:$V7,33:41,35:$V9,42:113,46:105,47:30,48:31,55:$Vc,61:61,62:$Vd,64:52,65:53,66:19,67:20,68:21,69:22,70:23,71:24,72:25,73:26,74:27,75:28,76:29,77:32,78:110,79:$Ve,85:111,86:$Vf,87:126,88:$Vg,90:$Vh,94:90,95:$Vi,97:127,98:$Vj,102:$Vk,103:$Vl,104:$Vm,105:$Vn,106:$Vo,107:$Vp,108:$Vq,109:$Vr,111:58,112:$Vs,115:$Vt,120:112,128:$VH1,129:$VF1,130:59,131:$Vx,145:$Vy,146:$Vz,164:$VA,179:81,180:$VB,181:$VC,186:57,187:$VD,188:50,195:62,196:63,197:64,198:$VG,199:$VH,203:$VI,204:$VJ,213:56,219:88,220:87,228:122,229:$VN,230:$VO,231:$VP,235:86,236:72,237:$VQ,238:$VR,242:51,243:$VS,244:$VT,245:54,246:$VU,247:60,251:$VV,252:79,253:$VW,265:$VX,266:$VY,271:$VZ,277:$V_,278:75,279:$V$,281:$V01,282:76,283:$V11,284:77,286:118,287:$V21,288:$V31,289:119,297:$V41,301:73,302:$V51,306:$V61,307:$V71,308:$V81,309:$V91},o([6,12,16,17,29,35,37,58,79,82,90,164,176,203,204,210,211,212,222,259,260],[2,86]),o($VP2,[2,83]),o($Vb1,[2,6]),o($Vc1,[2,13]),{6:$Va1,9:140,17:[1,482]},o($V92,[2,304]),o($VQ2,[2,476],{286:118,289:119,278:158,284:159,144:$Ve1,310:$Vl1,312:$Vn1}),o($VQ2,[2,477],{286:118,289:119,278:158,284:159,144:$Ve1,310:$Vl1,312:$Vn1}),o($VR2,[2,478],{286:118,289:119,278:158,284:159,310:$Vl1,312:$Vn1}),o($VR2,[2,479],{286:118,289:119,278:158,284:159,310:$Vl1,312:$Vn1}),o([1,6,14,15,16,17,30,37,58,81,91,140,165,172,176,178,184,202,211,212,268,279,280,281,287,288,296,304,305,311,313],[2,480],{286:118,289:119,278:158,284:159,144:$Ve1,145:$Vf1,146:$Vg1,310:$Vl1,312:$Vn1}),o([1,6,14,15,16,17,30,37,58,81,91,140,165,172,176,178,184,202,211,212,268,279,280,281,287,288,296,304,305],[2,481],{286:118,289:119,278:158,284:159,144:$Ve1,145:$Vf1,146:$Vg1,310:$Vl1,311:$Vm1,312:$Vn1,313:$Vo1}),o([1,6,14,15,16,17,30,37,58,81,91,140,165,172,176,178,202,211,212,268,279,280,281,287,288,296,304,305],[2,482],{286:118,289:119,278:158,284:159,144:$Ve1,145:$Vf1,146:$Vg1,184:$Vi1,310:$Vl1,311:$Vm1,312:$Vn1,313:$Vo1}),{12:$V1,20:483,22:208,25:35,26:36,27:$V4,28:$V5,31:$V6,32:$V7,33:41,35:$V9,42:113,46:105,47:30,48:31,55:$Vc,61:61,62:$Vd,64:52,65:53,66:19,67:20,68:21,69:22,70:23,71:24,72:25,73:26,74:27,75:28,76:29,77:32,78:110,79:$Ve,85:111,86:$Vf,87:126,88:$Vg,90:$Vh,94:90,95:$Vi,97:127,98:$Vj,102:$Vk,103:$Vl,104:$Vm,105:$Vn,106:$Vo,107:$Vp,108:$Vq,109:$Vr,111:58,112:$Vs,115:$Vt,120:112,128:$VH1,129:$VF1,130:59,131:$Vx,145:$Vy,146:$Vz,164:$VA,179:81,180:$VB,181:$VC,186:57,187:$VD,188:50,195:62,196:63,197:64,198:$VG,199:$VH,203:$VI,204:$VJ,213:56,219:88,220:87,228:122,229:$VN,230:$VO,231:$VP,235:86,236:72,237:$VQ,238:$VR,242:51,243:$VS,244:$VT,245:54,246:$VU,247:60,251:$VV,252:79,253:$VW,265:$VX,266:$VY,271:$VZ,277:$V_,278:75,279:$V$,281:$V01,282:76,283:$V11,284:77,286:118,287:$V21,288:$V31,289:119,297:$V41,301:73,302:$V51,306:$V61,307:$V71,308:$V81,309:$V91},o([1,6,14,15,16,17,30,37,58,81,91,140,165,172,176,178,184,202,211,212,268,279,280,281,287,288,296,304,305,313],[2,484],{286:118,289:119,278:158,284:159,144:$Ve1,145:$Vf1,146:$Vg1,310:$Vl1,311:$Vm1,312:$Vn1}),o($VS2,[2,465],{286:118,289:119,278:158,284:159,144:$Ve1,145:$Vf1,146:$Vg1,178:$Vh1,184:$Vi1,279:$V$,281:$V01,287:$V21,288:$V31,304:$Vj1,305:$Vk1,310:$Vl1,311:$Vm1,312:$Vn1,313:$Vo1}),{140:[1,484],144:$Ve1,145:$Vf1,146:$Vg1,178:$Vh1,184:$Vi1,278:158,279:$V$,281:$V01,284:159,286:118,287:$V21,288:$V31,289:119,304:$Vj1,305:$Vk1,310:$Vl1,311:$Vm1,312:$Vn1,313:$Vo1},o($VS2,[2,464],{286:118,289:119,278:158,284:159,144:$Ve1,145:$Vf1,146:$Vg1,178:$Vh1,184:$Vi1,279:$V$,281:$V01,287:$V21,288:$V31,304:$Vj1,305:$Vk1,310:$Vl1,311:$Vm1,312:$Vn1,313:$Vo1}),{12:$V1,16:[1,486],20:485,22:208,25:35,26:36,27:$V4,28:$V5,31:$V6,32:$V7,33:41,35:$V9,42:113,46:105,47:30,48:31,55:$Vc,61:61,62:$Vd,64:52,65:53,66:19,67:20,68:21,69:22,70:23,71:24,72:25,73:26,74:27,75:28,76:29,77:32,78:110,79:$Ve,85:111,86:$Vf,87:126,88:$Vg,90:$Vh,94:90,95:$Vi,97:127,98:$Vj,102:$Vk,103:$Vl,104:$Vm,105:$Vn,106:$Vo,107:$Vp,108:$Vq,109:$Vr,111:58,112:$Vs,115:$Vt,120:112,128:$VH1,129:$VF1,130:59,131:$Vx,145:$Vy,146:$Vz,164:$VA,179:81,180:$VB,181:$VC,186:57,187:$VD,188:50,195:62,196:63,197:64,198:$VG,199:$VH,203:$VI,204:$VJ,213:56,219:88,220:87,228:122,229:$VN,230:$VO,231:$VP,235:86,236:72,237:$VQ,238:$VR,242:51,243:$VS,244:$VT,245:54,246:$VU,247:60,251:$VV,252:79,253:$VW,265:$VX,266:$VY,271:$VZ,277:$V_,278:75,279:$V$,281:$V01,282:76,283:$V11,284:77,286:118,287:$V21,288:$V31,289:119,297:$V41,301:73,302:$V51,306:$V61,307:$V71,308:$V81,309:$V91},o($Va2,[2,294]),o($Vu2,$Vr2,{286:118,289:119,278:158,284:159,144:$Ve1,145:$Vf1,146:$Vg1,178:$Vh1,184:$Vi1,279:$V$,281:$V01,287:$V21,288:$V31,304:$Vj1,305:$Vk1,310:$Vl1,311:$Vm1,312:$Vn1,313:$Vo1}),o($VI1,[2,383]),o($VY1,[2,311]),o($VY1,[2,312]),{14:[1,487]},{14:[2,335],144:$Ve1,145:$Vf1,146:$Vg1,178:$Vh1,184:$Vi1,278:158,279:$V$,281:$V01,284:159,286:118,287:$V21,288:$V31,289:119,304:$Vj1,305:$Vk1,310:$Vl1,311:$Vm1,312:$Vn1,313:$Vo1},{30:[1,488],144:$Ve1,145:$Vf1,146:$Vg1,178:$Vh1,184:$Vi1,278:158,279:$V$,281:$V01,284:159,286:118,287:$V21,288:$V31,289:119,304:$Vj1,305:$Vk1,310:$Vl1,311:$Vm1,312:$Vn1,313:$Vo1},{30:[1,489],144:$Ve1,145:$Vf1,146:$Vg1,178:$Vh1,184:$Vi1,278:158,279:$V$,281:$V01,284:159,286:118,287:$V21,288:$V31,289:119,304:$Vj1,305:$Vk1,310:$Vl1,311:$Vm1,312:$Vn1,313:$Vo1},{39:490,55:$VC1},{35:[1,492],52:491,56:$VD1},{39:493,55:$VC1},{38:[1,494]},o($Vn2,$Vo2,{59:497,37:[1,495],58:$VT2}),o($VH2,[2,54]),{12:$V1,16:$Vb2,36:498,42:357,44:$Vc2,57:355,60:358,82:$V42},o($VH2,[2,60],{41:[1,499]}),o($VH2,[2,61]),o($VH2,[2,63],{41:[1,500]}),{12:$V1,42:501},o($Vn2,$Vo2,{59:497,37:[1,502],58:$VT2}),{39:503,55:$VC1},{12:$V1,42:504},o($Vb1,[2,36]),{6:$Va1,9:507,127:[1,505],138:506,139:370,142:$Vf2},o($VU2,[2,136]),{16:$Vd2,125:$Ve2,126:508,137:366,138:368,139:370,142:$Vf2},o($VU2,[2,140]),{16:[1,510],135:509},{140:[1,511]},{140:[2,143]},o($VV2,[2,217],{286:118,289:119,278:158,284:159,144:$Ve1,145:$Vf1,146:$Vg1,178:$Vh1,184:$Vi1,305:$Vk1,310:$Vl1,311:$Vm1,312:$Vn1,313:$Vo1}),{12:$V1,20:512,22:208,25:35,26:36,27:$V4,28:$V5,31:$V6,32:$V7,33:41,35:$V9,42:113,46:105,47:30,48:31,55:$Vc,61:61,62:$Vd,64:52,65:53,66:19,67:20,68:21,69:22,70:23,71:24,72:25,73:26,74:27,75:28,76:29,77:32,78:110,79:$Ve,85:111,86:$Vf,87:126,88:$Vg,90:$Vh,94:90,95:$Vi,97:127,98:$Vj,102:$Vk,103:$Vl,104:$Vm,105:$Vn,106:$Vo,107:$Vp,108:$Vq,109:$Vr,111:58,112:$Vs,115:$Vt,120:112,128:$VH1,129:$VF1,130:59,131:$Vx,145:$Vy,146:$Vz,164:$VA,179:81,180:$VB,181:$VC,186:57,187:$VD,188:50,195:62,196:63,197:64,198:$VG,199:$VH,203:$VI,204:$VJ,213:56,219:88,220:87,228:122,229:$VN,230:$VO,231:$VP,235:86,236:72,237:$VQ,238:$VR,242:51,243:$VS,244:$VT,245:54,246:$VU,247:60,251:$VV,252:79,253:$VW,265:$VX,266:$VY,271:$VZ,277:$V_,278:75,279:$V$,281:$V01,282:76,283:$V11,284:77,286:118,287:$V21,288:$V31,289:119,297:$V41,301:73,302:$V51,306:$V61,307:$V71,308:$V81,309:$V91},{12:$V1,16:[1,514],20:513,22:208,25:35,26:36,27:$V4,28:$V5,31:$V6,32:$V7,33:41,35:$V9,42:113,46:105,47:30,48:31,55:$Vc,61:61,62:$Vd,64:52,65:53,66:19,67:20,68:21,69:22,70:23,71:24,72:25,73:26,74:27,75:28,76:29,77:32,78:110,79:$Ve,85:111,86:$Vf,87:126,88:$Vg,90:$Vh,94:90,95:$Vi,97:127,98:$Vj,102:$Vk,103:$Vl,104:$Vm,105:$Vn,106:$Vo,107:$Vp,108:$Vq,109:$Vr,111:58,112:$Vs,115:$Vt,120:112,128:$VH1,129:$VF1,130:59,131:$Vx,145:$Vy,146:$Vz,164:$VA,179:81,180:$VB,181:$VC,186:57,187:$VD,188:50,195:62,196:63,197:64,198:$VG,199:$VH,203:$VI,204:$VJ,213:56,219:88,220:87,228:122,229:$VN,230:$VO,231:$VP,235:86,236:72,237:$VQ,238:$VR,242:51,243:$VS,244:$VT,245:54,246:$VU,247:60,251:$VV,252:79,253:$VW,265:$VX,266:$VY,271:$VZ,277:$V_,278:75,279:$V$,281:$V01,282:76,283:$V11,284:77,286:118,287:$V21,288:$V31,289:119,297:$V41,301:73,302:$V51,306:$V61,307:$V71,308:$V81,309:$V91},o($VW2,[2,9],{13:[1,515]}),{37:[1,516],144:$Ve1,145:$Vf1,146:$Vg1,178:$Vh1,184:$Vi1,278:158,279:$V$,281:$V01,284:159,286:118,287:$V21,288:$V31,289:119,304:$Vj1,305:$Vk1,310:$Vl1,311:$Vm1,312:$Vn1,313:$Vo1},o($VV2,[2,485],{286:118,289:119,278:158,284:159,144:$Ve1,145:$Vf1,146:$Vg1,178:$Vh1,184:$Vi1,305:$Vk1,310:$Vl1,311:$Vm1,312:$Vn1,313:$Vo1}),{12:$V1,20:517,22:208,25:35,26:36,27:$V4,28:$V5,31:$V6,32:$V7,33:41,35:$V9,42:113,46:105,47:30,48:31,55:$Vc,61:61,62:$Vd,64:52,65:53,66:19,67:20,68:21,69:22,70:23,71:24,72:25,73:26,74:27,75:28,76:29,77:32,78:110,79:$Ve,85:111,86:$Vf,87:126,88:$Vg,90:$Vh,94:90,95:$Vi,97:127,98:$Vj,102:$Vk,103:$Vl,104:$Vm,105:$Vn,106:$Vo,107:$Vp,108:$Vq,109:$Vr,111:58,112:$Vs,115:$Vt,120:112,128:$VH1,129:$VF1,130:59,131:$Vx,145:$Vy,146:$Vz,164:$VA,179:81,180:$VB,181:$VC,186:57,187:$VD,188:50,195:62,196:63,197:64,198:$VG,199:$VH,203:$VI,204:$VJ,213:56,219:88,220:87,228:122,229:$VN,230:$VO,231:$VP,235:86,236:72,237:$VQ,238:$VR,242:51,243:$VS,244:$VT,245:54,246:$VU,247:60,251:$VV,252:79,253:$VW,265:$VX,266:$VY,271:$VZ,277:$V_,278:75,279:$V$,281:$V01,282:76,283:$V11,284:77,286:118,287:$V21,288:$V31,289:119,297:$V41,301:73,302:$V51,306:$V61,307:$V71,308:$V81,309:$V91},{12:$V1,20:518,22:208,25:35,26:36,27:$V4,28:$V5,31:$V6,32:$V7,33:41,35:$V9,42:113,46:105,47:30,48:31,55:$Vc,61:61,62:$Vd,64:52,65:53,66:19,67:20,68:21,69:22,70:23,71:24,72:25,73:26,74:27,75:28,76:29,77:32,78:110,79:$Ve,85:111,86:$Vf,87:126,88:$Vg,90:$Vh,94:90,95:$Vi,97:127,98:$Vj,102:$Vk,103:$Vl,104:$Vm,105:$Vn,106:$Vo,107:$Vp,108:$Vq,109:$Vr,111:58,112:$Vs,115:$Vt,120:112,128:$VH1,129:$VF1,130:59,131:$Vx,145:$Vy,146:$Vz,164:$VA,179:81,180:$VB,181:$VC,186:57,187:$VD,188:50,195:62,196:63,197:64,198:$VG,199:$VH,203:$VI,204:$VJ,213:56,219:88,220:87,228:122,229:$VN,230:$VO,231:$VP,235:86,236:72,237:$VQ,238:$VR,242:51,243:$VS,244:$VT,245:54,246:$VU,247:60,251:$VV,252:79,253:$VW,265:$VX,266:$VY,271:$VZ,277:$V_,278:75,279:$V$,281:$V01,282:76,283:$V11,284:77,286:118,287:$V21,288:$V31,289:119,297:$V41,301:73,302:$V51,306:$V61,307:$V71,308:$V81,309:$V91},o($VX2,[2,462]),{5:519,15:$V2,16:$V3,144:$Ve1,145:$Vf1,146:$Vg1,178:$Vh1,184:$Vi1,278:158,279:$V$,281:$V01,284:159,286:118,287:$V21,288:$V31,289:119,304:$Vj1,305:$Vk1,310:$Vl1,311:$Vm1,312:$Vn1,313:$Vo1},o($Vt1,[2,412],{273:520,274:$Vh2}),o($Vt1,[2,413]),{276:[1,521]},{5:522,15:$V2,16:$V3},{5:523,15:$V2,16:$V3},{298:524,299:389,300:$Vi2},{17:[1,525],285:[1,526],299:527,300:$Vi2},o($VY2,[2,455]),{12:$V1,20:529,22:208,25:35,26:36,27:$V4,28:$V5,31:$V6,32:$V7,33:41,35:$V9,42:113,46:105,47:30,48:31,55:$Vc,61:61,62:$Vd,64:52,65:53,66:19,67:20,68:21,69:22,70:23,71:24,72:25,73:26,74:27,75:28,76:29,77:32,78:110,79:$Ve,85:111,86:$Vf,87:126,88:$Vg,90:$Vh,94:90,95:$Vi,97:127,98:$Vj,102:$Vk,103:$Vl,104:$Vm,105:$Vn,106:$Vo,107:$Vp,108:$Vq,109:$Vr,111:58,112:$Vs,115:$Vt,120:112,128:$VH1,129:$VF1,130:59,131:$Vx,145:$Vy,146:$Vz,164:$VA,179:81,180:$VB,181:$VC,186:57,187:$VD,188:50,195:62,196:63,197:64,198:$VG,199:$VH,203:$VI,204:$VJ,213:56,219:88,220:87,228:122,229:$VN,230:$VO,231:$VP,235:86,236:72,237:$VQ,238:$VR,242:51,243:$VS,244:$VT,245:54,246:$VU,247:60,251:$VV,252:79,253:$VW,265:$VX,266:$VY,270:528,271:$VZ,277:$V_,278:75,279:$V$,281:$V01,282:76,283:$V11,284:77,286:118,287:$V21,288:$V31,289:119,297:$V41,301:73,302:$V51,306:$V61,307:$V71,308:$V81,309:$V91},o($VZ2,[2,122],{118:530,77:533,16:[1,531],29:[1,532],115:$Vt}),{12:$V1,16:$VS1,20:342,21:261,22:208,25:35,26:36,27:$V4,28:$V5,31:$V6,32:$V7,33:41,35:$V9,42:113,46:105,47:30,48:31,55:$Vc,61:61,62:$Vd,64:52,65:53,66:19,67:20,68:21,69:22,70:23,71:24,72:25,73:26,74:27,75:28,76:29,77:32,78:110,79:$Ve,85:111,86:$Vf,87:126,88:$Vg,90:$Vh,92:534,94:90,95:$Vi,97:127,98:$Vj,102:$Vk,103:$Vl,104:$Vm,105:$Vn,106:$Vo,107:$Vp,108:$Vq,109:$Vr,111:58,112:$Vs,115:$Vt,120:112,128:$VH1,129:$VF1,130:59,131:$Vx,145:$Vy,146:$Vz,164:$VA,176:$VU1,177:259,178:$VV1,179:81,180:$VB,181:$VC,186:57,187:$VD,188:50,193:$VE,194:$VF,195:62,196:63,197:64,198:$VG,199:$VH,203:$VI,204:$VJ,213:56,219:88,220:87,223:$VW1,228:122,229:$VN,230:$VO,231:$VP,235:86,236:72,237:$VQ,238:$VR,242:51,243:$VS,244:$VT,245:54,246:$VU,247:60,251:$VV,252:79,253:$VW,265:$VX,266:$VY,269:256,271:$VZ,277:$V_,278:75,279:$V$,281:$V01,282:76,283:$V11,284:77,286:118,287:$V21,288:$V31,289:119,297:$V41,301:73,302:$V51,306:$V61,307:$V71,308:$V81,309:$V91},o($Vj2,[2,163]),o($Vj2,[2,164]),o($Vj2,[2,165]),o($Vj2,[2,166]),{35:$VO1,122:537,132:[1,535],161:[1,536],162:$VP1},{35:$VO1,122:538,162:$VP1},{35:$VO1,122:539,162:$VP1},{35:$VO1,122:540,162:$VP1},o($Vj2,[2,179],{122:541,35:$VO1,162:$VP1}),{12:$V1,16:$VS1,20:342,21:261,22:208,25:35,26:36,27:$V4,28:$V5,31:$V6,32:$V7,33:41,35:$V9,42:113,46:105,47:30,48:31,55:$Vc,61:61,62:$Vd,64:52,65:53,66:19,67:20,68:21,69:22,70:23,71:24,72:25,73:26,74:27,75:28,76:29,77:32,78:110,79:$Ve,85:111,86:$Vf,87:126,88:$Vg,90:$Vh,91:[1,542],92:543,94:90,95:$Vi,97:127,98:$Vj,102:$Vk,103:$Vl,104:$Vm,105:$Vn,106:$Vo,107:$Vp,108:$Vq,109:$Vr,111:58,112:$Vs,115:$Vt,120:112,128:$VH1,129:$VF1,130:59,131:$Vx,145:$Vy,146:$Vz,164:$VA,176:$VU1,177:259,178:$VV1,179:81,180:$VB,181:$VC,186:57,187:$VD,188:50,193:$VE,194:$VF,195:62,196:63,197:64,198:$VG,199:$VH,203:$VI,204:$VJ,213:56,219:88,220:87,223:$VW1,228:122,229:$VN,230:$VO,231:$VP,235:86,236:72,237:$VQ,238:$VR,242:51,243:$VS,244:$VT,245:54,246:$VU,247:60,251:$VV,252:79,253:$VW,265:$VX,266:$VY,269:256,271:$VZ,277:$V_,278:75,279:$V$,281:$V01,282:76,283:$V11,284:77,286:118,287:$V21,288:$V31,289:119,297:$V41,301:73,302:$V51,306:$V61,307:$V71,308:$V81,309:$V91},{12:$V1,16:$VS1,20:342,21:261,22:208,25:35,26:36,27:$V4,28:$V5,30:[1,544],31:$V6,32:$V7,33:41,35:$V9,42:113,46:105,47:30,48:31,55:$Vc,61:61,62:$Vd,64:52,65:53,66:19,67:20,68:21,69:22,70:23,71:24,72:25,73:26,74:27,75:28,76:29,77:32,78:110,79:$Ve,85:111,86:$Vf,87:126,88:$Vg,90:$Vh,92:545,94:90,95:$Vi,97:127,98:$Vj,102:$Vk,103:$Vl,104:$Vm,105:$Vn,106:$Vo,107:$Vp,108:$Vq,109:$Vr,111:58,112:$Vs,115:$Vt,120:112,128:$VH1,129:$VF1,130:59,131:$Vx,145:$Vy,146:$Vz,164:$VA,176:$VU1,177:259,178:$VV1,179:81,180:$VB,181:$VC,186:57,187:$VD,188:50,193:$VE,194:$VF,195:62,196:63,197:64,198:$VG,199:$VH,203:$VI,204:$VJ,213:56,219:88,220:87,223:$VW1,228:122,229:$VN,230:$VO,231:$VP,235:86,236:72,237:$VQ,238:$VR,242:51,243:$VS,244:$VT,245:54,246:$VU,247:60,251:$VV,252:79,253:$VW,265:$VX,266:$VY,269:256,271:$VZ,277:$V_,278:75,279:$V$,281:$V01,282:76,283:$V11,284:77,286:118,287:$V21,288:$V31,289:119,297:$V41,301:73,302:$V51,306:$V61,307:$V71,308:$V81,309:$V91},{12:$V1,16:$VS1,20:342,21:261,22:208,25:35,26:36,27:$V4,28:$V5,31:$V6,32:$V7,33:41,35:$V9,42:113,46:105,47:30,48:31,55:$Vc,61:61,62:$Vd,64:52,65:53,66:19,67:20,68:21,69:22,70:23,71:24,72:25,73:26,74:27,75:28,76:29,77:32,78:110,79:$Ve,85:111,86:$Vf,87:126,88:$Vg,90:$Vh,92:546,94:90,95:$Vi,97:127,98:$Vj,102:$Vk,103:$Vl,104:$Vm,105:$Vn,106:$Vo,107:$Vp,108:$Vq,109:$Vr,111:58,112:$Vs,115:$Vt,120:112,128:$VH1,129:$VF1,130:59,131:$Vx,145:$Vy,146:$Vz,164:$VA,176:$VU1,177:259,178:$VV1,179:81,180:$VB,181:$VC,186:57,187:$VD,188:50,193:$VE,194:$VF,195:62,196:63,197:64,198:$VG,199:$VH,203:$VI,204:$VJ,213:56,219:88,220:87,223:$VW1,228:122,229:$VN,230:$VO,231:$VP,235:86,236:72,237:$VQ,238:$VR,242:51,243:$VS,244:$VT,245:54,246:$VU,247:60,251:$VV,252:79,253:$VW,265:$VX,266:$VY,269:256,271:$VZ,277:$V_,278:75,279:$V$,281:$V01,282:76,283:$V11,284:77,286:118,287:$V21,288:$V31,289:119,297:$V41,301:73,302:$V51,306:$V61,307:$V71,308:$V81,309:$V91},o($Vj2,[2,180]),o($Vj2,[2,181]),{167:547,171:[1,548]},o($Vj2,[2,160]),o($Vm2,[2,185]),{12:$V1,20:549,22:208,25:35,26:36,27:$V4,28:$V5,31:$V6,32:$V7,33:41,35:$V9,42:113,46:105,47:30,48:31,55:$Vc,61:61,62:$Vd,64:52,65:53,66:19,67:20,68:21,69:22,70:23,71:24,72:25,73:26,74:27,75:28,76:29,77:32,78:110,79:$Ve,85:111,86:$Vf,87:126,88:$Vg,90:$Vh,94:90,95:$Vi,97:127,98:$Vj,102:$Vk,103:$Vl,104:$Vm,105:$Vn,106:$Vo,107:$Vp,108:$Vq,109:$Vr,111:58,112:$Vs,115:$Vt,120:112,128:$VH1,129:$VF1,130:59,131:$Vx,145:$Vy,146:$Vz,164:$VA,179:81,180:$VB,181:$VC,186:57,187:$VD,188:50,195:62,196:63,197:64,198:$VG,199:$VH,203:$VI,204:$VJ,213:56,219:88,220:87,228:122,229:$VN,230:$VO,231:$VP,235:86,236:72,237:$VQ,238:$VR,242:51,243:$VS,244:$VT,245:54,246:$VU,247:60,251:$VV,252:79,253:$VW,265:$VX,266:$VY,271:$VZ,277:$V_,278:75,279:$V$,281:$V01,282:76,283:$V11,284:77,286:118,287:$V21,288:$V31,289:119,297:$V41,301:73,302:$V51,306:$V61,307:$V71,308:$V81,309:$V91},{37:[1,550],144:$Ve1,145:$Vf1,146:$Vg1,178:$Vh1,184:$Vi1,278:158,279:$V$,281:$V01,284:159,286:118,287:$V21,288:$V31,289:119,304:$Vj1,305:$Vk1,310:$Vl1,311:$Vm1,312:$Vn1,313:$Vo1},o($VI1,[2,387]),o([6,16,30],$Vo2,{59:551,58:$Vt2}),o($V_2,$Vv2,{216:430,219:431,220:432,221:433,42:436,201:552,12:$V1,35:$V9,164:$Vs1,176:$Vw2,222:$Vx2}),o($VB1,[2,349]),o($VI1,[2,418]),o($V$2,$V03,{66:19,67:20,68:21,69:22,70:23,71:24,72:25,73:26,74:27,75:28,76:29,47:30,48:31,77:32,25:35,26:36,33:41,188:50,242:51,64:52,65:53,245:54,213:56,186:57,111:58,130:59,247:60,61:61,195:62,196:63,197:64,236:72,301:73,278:75,282:76,284:77,252:79,179:81,235:86,220:87,219:88,94:90,46:105,78:110,85:111,120:112,42:113,286:118,289:119,228:122,87:126,97:127,22:208,20:553,12:$V1,27:$V4,28:$V5,31:$V6,32:$V7,35:$V9,55:$Vc,62:$Vd,79:$Ve,86:$Vf,88:$Vg,90:$Vh,95:$Vi,98:$Vj,102:$Vk,103:$Vl,104:$Vm,105:$Vn,106:$Vo,107:$Vp,108:$Vq,109:$Vr,112:$Vs,115:$Vt,128:$VH1,129:$VF1,131:$Vx,145:$Vy,146:$Vz,164:$VA,180:$VB,181:$VC,187:$VD,198:$VG,199:$VH,203:$VI,204:$VJ,229:$VN,230:$VO,231:$VP,237:$VQ,238:$VR,243:$VS,244:$VT,246:$VU,251:$VV,253:$VW,265:$VX,266:$VY,271:$VZ,277:$V_,279:$V$,281:$V01,283:$V11,287:$V21,288:$V31,297:$V41,302:$V51,306:$V61,307:$V71,308:$V81,309:$V91}),{6:$Va1,9:554,16:$V13},o($V$2,$Vo2,{59:556,58:$Vp2}),{12:$V1,20:557,22:208,25:35,26:36,27:$V4,28:$V5,31:$V6,32:$V7,33:41,35:$V9,42:113,46:105,47:30,48:31,55:$Vc,61:61,62:$Vd,64:52,65:53,66:19,67:20,68:21,69:22,70:23,71:24,72:25,73:26,74:27,75:28,76:29,77:32,78:110,79:$Ve,85:111,86:$Vf,87:126,88:$Vg,90:$Vh,94:90,95:$Vi,97:127,98:$Vj,102:$Vk,103:$Vl,104:$Vm,105:$Vn,106:$Vo,107:$Vp,108:$Vq,109:$Vr,111:58,112:$Vs,115:$Vt,120:112,128:$VH1,129:$VF1,130:59,131:$Vx,145:$Vy,146:$Vz,164:$VA,179:81,180:$VB,181:$VC,186:57,187:$VD,188:50,195:62,196:63,197:64,198:$VG,199:$VH,203:$VI,204:$VJ,213:56,219:88,220:87,228:122,229:$VN,230:$VO,231:$VP,235:86,236:72,237:$VQ,238:$VR,242:51,243:$VS,244:$VT,245:54,246:$VU,247:60,251:$VV,252:79,253:$VW,265:$VX,266:$VY,271:$VZ,277:$V_,278:75,279:$V$,281:$V01,282:76,283:$V11,284:77,286:118,287:$V21,288:$V31,289:119,297:$V41,301:73,302:$V51,306:$V61,307:$V71,308:$V81,309:$V91},o($V23,[2,393]),o($V23,[2,394]),{6:$V33,9:559,16:$V43,165:[1,558]},o([6,16,17,30,165],$V03,{66:19,67:20,68:21,69:22,70:23,71:24,72:25,73:26,74:27,75:28,76:29,47:30,48:31,77:32,25:35,26:36,33:41,188:50,242:51,64:52,65:53,245:54,213:56,186:57,111:58,130:59,247:60,61:61,195:62,196:63,197:64,236:72,301:73,278:75,282:76,284:77,252:79,179:81,235:86,220:87,219:88,94:90,46:105,78:110,85:111,120:112,42:113,286:118,289:119,228:122,87:126,97:127,22:208,177:259,21:261,20:342,269:562,12:$V1,27:$V4,28:$V5,31:$V6,32:$V7,35:$V9,55:$Vc,62:$Vd,79:$Ve,86:$Vf,88:$Vg,90:$Vh,95:$Vi,98:$Vj,102:$Vk,103:$Vl,104:$Vm,105:$Vn,106:$Vo,107:$Vp,108:$Vq,109:$Vr,112:$Vs,115:$Vt,128:$VH1,129:$VF1,131:$Vx,145:$Vy,146:$Vz,164:$VA,176:$VU1,178:$VV1,180:$VB,181:$VC,187:$VD,193:$VE,194:$VF,198:$VG,199:$VH,203:$VI,204:$VJ,223:$VW1,229:$VN,230:$VO,231:$VP,237:$VQ,238:$VR,243:$VS,244:$VT,246:$VU,251:$VV,253:$VW,265:$VX,266:$VY,271:$VZ,277:$V_,279:$V$,281:$V01,283:$V11,287:$V21,288:$V31,297:$V41,302:$V51,306:$V61,307:$V71,308:$V81,309:$V91}),o($V$2,$Vo2,{59:563,58:$Vt2}),o($Vu2,[2,405],{286:118,289:119,278:158,284:159,144:$Ve1,145:$Vf1,146:$Vg1,178:$Vh1,184:$Vi1,279:$V$,281:$V01,287:$V21,288:$V31,304:$Vj1,305:$Vk1,310:$Vl1,311:$Vm1,312:$Vn1,313:$Vo1}),o($Vu2,[2,286],{286:118,289:119,278:158,284:159,144:$Ve1,145:$Vf1,146:$Vg1,178:$Vh1,184:$Vi1,279:$V$,281:$V01,287:$V21,288:$V31,304:$Vj1,305:$Vk1,310:$Vl1,311:$Vm1,312:$Vn1,313:$Vo1}),{6:$Va1,9:507,133:[1,564],138:506,139:370,142:$Vf2},{58:$V53,202:[1,565]},o($V63,[2,267]),o($V63,[2,276],{166:[1,567]}),o($V63,[2,277],{166:[1,568]}),o($V63,[2,278],{166:[1,569]}),{12:$V1,42:436,221:570},{12:$V1,42:436,221:571},o($V73,[2,284],{10:572,11:$VK1}),{81:[1,573],144:$Ve1,145:$Vf1,146:$Vg1,178:$Vh1,184:$Vi1,278:158,279:$V$,281:$V01,284:159,286:118,287:$V21,288:$V31,289:119,304:$Vj1,305:$Vk1,310:$Vl1,311:$Vm1,312:$Vn1,313:$Vo1},o($VX2,[2,459]),{12:$V1,20:574,22:208,25:35,26:36,27:$V4,28:$V5,31:$V6,32:$V7,33:41,35:$V9,42:113,46:105,47:30,48:31,55:$Vc,61:61,62:$Vd,64:52,65:53,66:19,67:20,68:21,69:22,70:23,71:24,72:25,73:26,74:27,75:28,76:29,77:32,78:110,79:$Ve,85:111,86:$Vf,87:126,88:$Vg,90:$Vh,94:90,95:$Vi,97:127,98:$Vj,102:$Vk,103:$Vl,104:$Vm,105:$Vn,106:$Vo,107:$Vp,108:$Vq,109:$Vr,111:58,112:$Vs,115:$Vt,120:112,128:$VH1,129:$VF1,130:59,131:$Vx,145:$Vy,146:$Vz,164:$VA,179:81,180:$VB,181:$VC,186:57,187:$VD,188:50,195:62,196:63,197:64,198:$VG,199:$VH,203:$VI,204:$VJ,213:56,219:88,220:87,228:122,229:$VN,230:$VO,231:$VP,235:86,236:72,237:$VQ,238:$VR,242:51,243:$VS,244:$VT,245:54,246:$VU,247:60,251:$VV,252:79,253:$VW,265:$VX,266:$VY,271:$VZ,277:$V_,278:75,279:$V$,281:$V01,282:76,283:$V11,284:77,286:118,287:$V21,288:$V31,289:119,297:$V41,301:73,302:$V51,306:$V61,307:$V71,308:$V81,309:$V91},{12:$V1,20:575,22:208,25:35,26:36,27:$V4,28:$V5,31:$V6,32:$V7,33:41,35:$V9,42:113,46:105,47:30,48:31,55:$Vc,61:61,62:$Vd,64:52,65:53,66:19,67:20,68:21,69:22,70:23,71:24,72:25,73:26,74:27,75:28,76:29,77:32,78:110,79:$Ve,85:111,86:$Vf,87:126,88:$Vg,90:$Vh,94:90,95:$Vi,97:127,98:$Vj,102:$Vk,103:$Vl,104:$Vm,105:$Vn,106:$Vo,107:$Vp,108:$Vq,109:$Vr,111:58,112:$Vs,115:$Vt,120:112,128:$VH1,129:$VF1,130:59,131:$Vx,145:$Vy,146:$Vz,164:$VA,179:81,180:$VB,181:$VC,186:57,187:$VD,188:50,195:62,196:63,197:64,198:$VG,199:$VH,203:$VI,204:$VJ,213:56,219:88,220:87,228:122,229:$VN,230:$VO,231:$VP,235:86,236:72,237:$VQ,238:$VR,242:51,243:$VS,244:$VT,245:54,246:$VU,247:60,251:$VV,252:79,253:$VW,265:$VX,266:$VY,271:$VZ,277:$V_,278:75,279:$V$,281:$V01,282:76,283:$V11,284:77,286:118,287:$V21,288:$V31,289:119,297:$V41,301:73,302:$V51,306:$V61,307:$V71,308:$V81,309:$V91},o($VA2,[2,438]),{12:$V1,35:$V9,42:281,164:$Vs1,219:283,220:282,293:576},o([1,6,14,15,16,17,30,37,58,81,91,140,165,172,176,202,211,212,268,279,281,287,288,304],[2,444],{286:118,289:119,278:158,284:159,144:$Ve1,145:$Vf1,146:$Vg1,178:$Vh1,184:$Vi1,280:[1,577],296:[1,578],305:$Vk1,310:$Vl1,311:$Vm1,312:$Vn1,313:$Vo1}),o($V83,[2,445],{286:118,289:119,278:158,284:159,144:$Ve1,145:$Vf1,146:$Vg1,178:$Vh1,184:$Vi1,280:[1,579],305:$Vk1,310:$Vl1,311:$Vm1,312:$Vn1,313:$Vo1}),o($Vt1,[2,355]),{12:$V1,20:580,22:208,25:35,26:36,27:$V4,28:$V5,31:$V6,32:$V7,33:41,35:$V9,42:113,46:105,47:30,48:31,55:$Vc,61:61,62:$Vd,64:52,65:53,66:19,67:20,68:21,69:22,70:23,71:24,72:25,73:26,74:27,75:28,76:29,77:32,78:110,79:$Ve,85:111,86:$Vf,87:126,88:$Vg,90:$Vh,94:90,95:$Vi,97:127,98:$Vj,102:$Vk,103:$Vl,104:$Vm,105:$Vn,106:$Vo,107:$Vp,108:$Vq,109:$Vr,111:58,112:$Vs,115:$Vt,120:112,128:$VH1,129:$VF1,130:59,131:$Vx,145:$Vy,146:$Vz,164:$VA,179:81,180:$VB,181:$VC,186:57,187:$VD,188:50,195:62,196:63,197:64,198:$VG,199:$VH,203:$VI,204:$VJ,213:56,219:88,220:87,228:122,229:$VN,230:$VO,231:$VP,235:86,236:72,237:$VQ,238:$VR,242:51,243:$VS,244:$VT,245:54,246:$VU,247:60,251:$VV,252:79,253:$VW,265:$VX,266:$VY,271:$VZ,277:$V_,278:75,279:$V$,281:$V01,282:76,283:$V11,284:77,286:118,287:$V21,288:$V31,289:119,297:$V41,301:73,302:$V51,306:$V61,307:$V71,308:$V81,309:$V91},{16:$V_1,144:$Ve1,145:$Vf1,146:$Vg1,178:$Vh1,183:581,184:$Vi1,278:158,279:$V$,281:$V01,284:159,286:118,287:$V21,288:$V31,289:119,304:$Vj1,305:$Vk1,310:$Vl1,311:$Vm1,312:$Vn1,313:$Vo1},o($Vt1,[2,362]),{6:$Va1,9:583,17:[1,582]},{12:$V1,21:455,42:462,46:459,60:461,77:456,82:$V42,89:457,93:452,115:$Vt,123:454,124:$Vu,193:$VE,194:$VF,203:$VD2,204:$VJ,255:584,256:451,257:453,258:460,259:$VE2,260:$VF2},o($V93,[2,365]),o($V93,[2,368],{46:459,258:460,60:461,42:462,257:585,89:586,12:$V1,82:$V42,203:$VD2,204:$VJ,259:$VE2,260:$VF2}),o($V93,[2,369]),o($V93,[2,371]),o($V93,[2,372]),o($V93,[2,373]),o($Va3,[2,93]),{12:$V1,42:462,46:459,203:$VD2,204:$VJ,257:587,258:460,259:$VE2,260:$VF2},o($V93,[2,375]),o($V93,[2,377],{10:589,11:$VK1,166:[1,588]}),o($Va3,[2,90],{90:[1,590]}),o($Vb3,[2,378]),{12:$V1,42:591},{12:$V1,42:592},o($Vt1,[2,210]),{121:$V$1,182:593},{6:$Va1,9:595,16:$Vc3,37:[1,594]},o([6,16,17,37],$V03,{87:126,97:127,46:299,190:300,191:301,21:302,94:305,42:306,83:307,78:308,189:597,12:$V1,55:$Vc,79:$Ve,84:$V12,88:$Vg,90:$V22,95:$Vi,98:$Vj,164:$V32,193:$VE,194:$VF,204:$VJ}),{12:$V1,16:[1,599],20:598,22:208,25:35,26:36,27:$V4,28:$V5,31:$V6,32:$V7,33:41,35:$V9,42:113,46:105,47:30,48:31,55:$Vc,61:61,62:$Vd,64:52,65:53,66:19,67:20,68:21,69:22,70:23,71:24,72:25,73:26,74:27,75:28,76:29,77:32,78:110,79:$Ve,85:111,86:$Vf,87:126,88:$Vg,90:$Vh,94:90,95:$Vi,97:127,98:$Vj,102:$Vk,103:$Vl,104:$Vm,105:$Vn,106:$Vo,107:$Vp,108:$Vq,109:$Vr,111:58,112:$Vs,115:$Vt,120:112,128:$VH1,129:$VF1,130:59,131:$Vx,145:$Vy,146:$Vz,164:$VA,179:81,180:$VB,181:$VC,186:57,187:$VD,188:50,195:62,196:63,197:64,198:$VG,199:$VH,203:$VI,204:$VJ,213:56,219:88,220:87,228:122,229:$VN,230:$VO,231:$VP,235:86,236:72,237:$VQ,238:$VR,242:51,243:$VS,244:$VT,245:54,246:$VU,247:60,251:$VV,252:79,253:$VW,265:$VX,266:$VY,271:$VZ,277:$V_,278:75,279:$V$,281:$V01,282:76,283:$V11,284:77,286:118,287:$V21,288:$V31,289:119,297:$V41,301:73,302:$V51,306:$V61,307:$V71,308:$V81,309:$V91},{12:$V1,16:[1,601],20:600,22:208,25:35,26:36,27:$V4,28:$V5,31:$V6,32:$V7,33:41,35:$V9,42:113,46:105,47:30,48:31,55:$Vc,61:61,62:$Vd,64:52,65:53,66:19,67:20,68:21,69:22,70:23,71:24,72:25,73:26,74:27,75:28,76:29,77:32,78:110,79:$Ve,85:111,86:$Vf,87:126,88:$Vg,90:$Vh,94:90,95:$Vi,97:127,98:$Vj,102:$Vk,103:$Vl,104:$Vm,105:$Vn,106:$Vo,107:$Vp,108:$Vq,109:$Vr,111:58,112:$Vs,115:$Vt,120:112,128:$VH1,129:$VF1,130:59,131:$Vx,145:$Vy,146:$Vz,164:$VA,179:81,180:$VB,181:$VC,186:57,187:$VD,188:50,195:62,196:63,197:64,198:$VG,199:$VH,203:$VI,204:$VJ,213:56,219:88,220:87,228:122,229:$VN,230:$VO,231:$VP,235:86,236:72,237:$VQ,238:$VR,242:51,243:$VS,244:$VT,245:54,246:$VU,247:60,251:$VV,252:79,253:$VW,265:$VX,266:$VY,271:$VZ,277:$V_,278:75,279:$V$,281:$V01,282:76,283:$V11,284:77,286:118,287:$V21,288:$V31,289:119,297:$V41,301:73,302:$V51,306:$V61,307:$V71,308:$V81,309:$V91},{144:$Ve1,145:$Vf1,146:$Vg1,165:[1,602],178:$Vh1,184:$Vi1,278:158,279:$V$,281:$V01,284:159,286:118,287:$V21,288:$V31,289:119,304:$Vj1,305:$Vk1,310:$Vl1,311:$Vm1,312:$Vn1,313:$Vo1},{91:[1,603],144:$Ve1,145:$Vf1,146:$Vg1,178:$Vh1,184:$Vi1,278:158,279:$V$,281:$V01,284:159,286:118,287:$V21,288:$V31,289:119,304:$Vj1,305:$Vk1,310:$Vl1,311:$Vm1,312:$Vn1,313:$Vo1},o($V72,[2,105]),{81:[1,604],144:$Ve1,145:$Vf1,146:$Vg1,178:$Vh1,184:$Vi1,278:158,279:$V$,281:$V01,284:159,286:118,287:$V21,288:$V31,289:119,304:$Vj1,305:$Vk1,310:$Vl1,311:$Vm1,312:$Vn1,313:$Vo1},{12:$V1,42:319,60:320,82:$V42,164:$V52,207:605},o($Vd3,[2,251]),o($Vd3,[2,252]),{209:606,211:$Ve3,212:$Vf3},o($Vg3,[2,249],{58:$V53}),o($V_2,$Vv2,{216:430,219:431,220:432,221:433,42:436,201:609,12:$V1,35:$V9,164:$Vs1,176:$Vw2,222:$Vx2}),{144:$Ve1,145:$Vf1,146:$Vg1,165:[1,610],178:$Vh1,184:$Vi1,278:158,279:$V$,281:$V01,284:159,286:118,287:$V21,288:$V31,289:119,304:$Vj1,305:$Vk1,310:$Vl1,311:$Vm1,312:$Vn1,313:$Vo1},o($Vc1,[2,14]),o($Vg2,[2,483],{286:118,289:119,278:158,284:159,312:$Vn1}),{12:$V1,20:611,22:208,25:35,26:36,27:$V4,28:$V5,31:$V6,32:$V7,33:41,35:$V9,42:113,46:105,47:30,48:31,55:$Vc,61:61,62:$Vd,64:52,65:53,66:19,67:20,68:21,69:22,70:23,71:24,72:25,73:26,74:27,75:28,76:29,77:32,78:110,79:$Ve,85:111,86:$Vf,87:126,88:$Vg,90:$Vh,94:90,95:$Vi,97:127,98:$Vj,102:$Vk,103:$Vl,104:$Vm,105:$Vn,106:$Vo,107:$Vp,108:$Vq,109:$Vr,111:58,112:$Vs,115:$Vt,120:112,128:$VH1,129:$VF1,130:59,131:$Vx,145:$Vy,146:$Vz,164:$VA,179:81,180:$VB,181:$VC,186:57,187:$VD,188:50,195:62,196:63,197:64,198:$VG,199:$VH,203:$VI,204:$VJ,213:56,219:88,220:87,228:122,229:$VN,230:$VO,231:$VP,235:86,236:72,237:$VQ,238:$VR,242:51,243:$VS,244:$VT,245:54,246:$VU,247:60,251:$VV,252:79,253:$VW,265:$VX,266:$VY,271:$VZ,277:$V_,278:75,279:$V$,281:$V01,282:76,283:$V11,284:77,286:118,287:$V21,288:$V31,289:119,297:$V41,301:73,302:$V51,306:$V61,307:$V71,308:$V81,309:$V91},o($V92,[2,301],{286:118,289:119,278:158,284:159,144:$Ve1,145:$Vf1,146:$Vg1,178:$Vh1,184:$Vi1,279:$V$,281:$V01,287:$V21,288:$V31,304:$Vj1,305:$Vk1,310:$Vl1,311:$Vm1,312:$Vn1,313:$Vo1}),{12:$V1,20:612,22:208,25:35,26:36,27:$V4,28:$V5,31:$V6,32:$V7,33:41,35:$V9,42:113,46:105,47:30,48:31,55:$Vc,61:61,62:$Vd,64:52,65:53,66:19,67:20,68:21,69:22,70:23,71:24,72:25,73:26,74:27,75:28,76:29,77:32,78:110,79:$Ve,85:111,86:$Vf,87:126,88:$Vg,90:$Vh,94:90,95:$Vi,97:127,98:$Vj,102:$Vk,103:$Vl,104:$Vm,105:$Vn,106:$Vo,107:$Vp,108:$Vq,109:$Vr,111:58,112:$Vs,115:$Vt,120:112,128:$VH1,129:$VF1,130:59,131:$Vx,145:$Vy,146:$Vz,164:$VA,179:81,180:$VB,181:$VC,186:57,187:$VD,188:50,195:62,196:63,197:64,198:$VG,199:$VH,203:$VI,204:$VJ,213:56,219:88,220:87,228:122,229:$VN,230:$VO,231:$VP,235:86,236:72,237:$VQ,238:$VR,242:51,243:$VS,244:$VT,245:54,246:$VU,247:60,251:$VV,252:79,253:$VW,265:$VX,266:$VY,271:$VZ,277:$V_,278:75,279:$V$,281:$V01,282:76,283:$V11,284:77,286:118,287:$V21,288:$V31,289:119,297:$V41,301:73,302:$V51,306:$V61,307:$V71,308:$V81,309:$V91},o($VY1,[2,313]),o($VB1,[2,26]),o($VB1,[2,28]),o($Vb1,[2,46]),{38:[1,613]},{12:$V1,16:$Vb2,36:614,42:357,44:$Vc2,57:355,60:358,82:$V42},o($Vb1,[2,47]),{39:615,55:$VC1},{38:[1,616]},o($V$2,$V03,{42:357,60:358,57:617,12:$V1,44:$Vc2,82:$V42}),{6:$Vh3,16:$Vi3},o($V$2,$Vo2,{59:620,58:$VT2}),{12:$V1,42:621},{12:$V1,42:622},{38:[2,53]},o($Vb1,[2,31],{38:[1,623]}),o($Vb1,[2,33]),{38:[1,624]},o($Vb1,[2,129]),o($VU2,[2,137]),{125:$Ve2,137:625,138:368,139:370,142:$Vf2},{6:$Va1,9:627,17:$Vj3,136:626,138:506,139:370,142:$Vf2},{127:[1,629]},{16:$Vd2,125:$Ve2,126:630,137:366,138:368,139:370,142:$Vf2},{12:$Vk3,39:639,55:$VC1,95:$Vl3,141:631,147:632,148:633,149:$Vm3,150:$Vn3,151:$Vo3,152:$Vp3},{6:$Va1,9:642,17:$Vj3,136:641,144:$Ve1,145:$Vf1,146:$Vg1,178:$Vh1,184:$Vi1,278:158,279:$V$,281:$V01,284:159,286:118,287:$V21,288:$V31,289:119,304:$Vj1,305:$Vk1,310:$Vl1,311:$Vm1,312:$Vn1,313:$Vo1},o($VV2,[2,218],{286:118,289:119,278:158,284:159,144:$Ve1,145:$Vf1,146:$Vg1,178:$Vh1,184:$Vi1,305:$Vk1,310:$Vl1,311:$Vm1,312:$Vn1,313:$Vo1}),{12:$V1,20:643,22:208,25:35,26:36,27:$V4,28:$V5,31:$V6,32:$V7,33:41,35:$V9,42:113,46:105,47:30,48:31,55:$Vc,61:61,62:$Vd,64:52,65:53,66:19,67:20,68:21,69:22,70:23,71:24,72:25,73:26,74:27,75:28,76:29,77:32,78:110,79:$Ve,85:111,86:$Vf,87:126,88:$Vg,90:$Vh,94:90,95:$Vi,97:127,98:$Vj,102:$Vk,103:$Vl,104:$Vm,105:$Vn,106:$Vo,107:$Vp,108:$Vq,109:$Vr,111:58,112:$Vs,115:$Vt,120:112,128:$VH1,129:$VF1,130:59,131:$Vx,145:$Vy,146:$Vz,164:$VA,179:81,180:$VB,181:$VC,186:57,187:$VD,188:50,195:62,196:63,197:64,198:$VG,199:$VH,203:$VI,204:$VJ,213:56,219:88,220:87,228:122,229:$VN,230:$VO,231:$VP,235:86,236:72,237:$VQ,238:$VR,242:51,243:$VS,244:$VT,245:54,246:$VU,247:60,251:$VV,252:79,253:$VW,265:$VX,266:$VY,271:$VZ,277:$V_,278:75,279:$V$,281:$V01,282:76,283:$V11,284:77,286:118,287:$V21,288:$V31,289:119,297:$V41,301:73,302:$V51,306:$V61,307:$V71,308:$V81,309:$V91},{14:[1,644]},o($VX1,[2,120]),{6:$Va1,9:642,17:$Vj3,136:645,144:$Ve1,145:$Vf1,146:$Vg1,178:$Vh1,184:$Vi1,278:158,279:$V$,281:$V01,284:159,286:118,287:$V21,288:$V31,289:119,304:$Vj1,305:$Vk1,310:$Vl1,311:$Vm1,312:$Vn1,313:$Vo1},{5:646,15:$V2,16:$V3,144:$Ve1,145:$Vf1,146:$Vg1,178:$Vh1,184:$Vi1,278:158,279:$V$,281:$V01,284:159,286:118,287:$V21,288:$V31,289:119,304:$Vj1,305:$Vk1,310:$Vl1,311:$Vm1,312:$Vn1,313:$Vo1},o($VX2,[2,461]),o($Vt1,[2,414]),{5:647,15:$V2,16:$V3},o($Vt1,[2,415]),o($Vt1,[2,432]),{17:[1,648],285:[1,649],299:527,300:$Vi2},o($Vt1,[2,453]),{5:650,15:$V2,16:$V3},o($VY2,[2,456]),{5:651,15:$V2,16:$V3,58:[1,652]},o($Vq3,[2,409],{286:118,289:119,278:158,284:159,144:$Ve1,145:$Vf1,146:$Vg1,178:$Vh1,184:$Vi1,279:$V$,281:$V01,287:$V21,288:$V31,304:$Vj1,305:$Vk1,310:$Vl1,311:$Vm1,312:$Vn1,313:$Vo1}),o($Vt1,[2,123]),{12:$V1,16:$Vr3,17:[1,653],20:657,21:661,22:208,25:35,26:36,27:$V4,28:$V5,31:$V6,32:$V7,33:41,35:$V9,42:113,46:105,47:30,48:31,55:$Vc,61:61,62:$Vd,64:52,65:53,66:19,67:20,68:21,69:22,70:23,71:24,72:25,73:26,74:27,75:28,76:29,77:32,78:110,79:$Ve,85:111,86:$Vf,87:126,88:$Vg,90:$Vh,94:90,95:$Vi,97:127,98:$Vj,102:$Vk,103:$Vl,104:$Vm,105:$Vn,106:$Vo,107:$Vp,108:$Vq,109:$Vr,111:58,112:$Vs,115:$Vt,120:112,128:$VH1,129:$VF1,130:59,131:$Vx,145:$Vy,146:$Vz,164:$VA,173:654,174:655,176:$Vs3,177:659,178:$Vt3,179:81,180:$VB,181:$VC,186:57,187:$VD,188:50,193:$VE,194:$VF,195:62,196:63,197:64,198:$VG,199:$VH,203:$VI,204:$VJ,213:56,219:88,220:87,223:$VW1,228:122,229:$VN,230:$VO,231:$VP,235:86,236:72,237:$VQ,238:$VR,242:51,243:$VS,244:$VT,245:54,246:$VU,247:60,251:$VV,252:79,253:$VW,265:$VX,266:$VY,271:$VZ,277:$V_,278:75,279:$V$,281:$V01,282:76,283:$V11,284:77,286:118,287:$V21,288:$V31,289:119,297:$V41,301:73,302:$V51,306:$V61,307:$V71,308:$V81,309:$V91},{12:$V1,16:$Vr3,20:657,21:661,22:208,25:35,26:36,27:$V4,28:$V5,31:$V6,32:$V7,33:41,35:$V9,42:113,46:105,47:30,48:31,55:$Vc,61:61,62:$Vd,64:52,65:53,66:19,67:20,68:21,69:22,70:23,71:24,72:25,73:26,74:27,75:28,76:29,77:32,78:110,79:$Ve,85:111,86:$Vf,87:126,88:$Vg,90:$Vh,94:90,95:$Vi,97:127,98:$Vj,102:$Vk,103:$Vl,104:$Vm,105:$Vn,106:$Vo,107:$Vp,108:$Vq,109:$Vr,111:58,112:$Vs,115:$Vt,120:112,128:$VH1,129:$VF1,130:59,131:$Vx,145:$Vy,146:$Vz,164:$VA,173:662,174:655,176:$Vs3,177:659,178:$Vt3,179:81,180:$VB,181:$VC,186:57,187:$VD,188:50,193:$VE,194:$VF,195:62,196:63,197:64,198:$VG,199:$VH,203:$VI,204:$VJ,213:56,219:88,220:87,223:$VW1,228:122,229:$VN,230:$VO,231:$VP,235:86,236:72,237:$VQ,238:$VR,242:51,243:$VS,244:$VT,245:54,246:$VU,247:60,251:$VV,252:79,253:$VW,265:$VX,266:$VY,271:$VZ,277:$V_,278:75,279:$V$,281:$V01,282:76,283:$V11,284:77,286:118,287:$V21,288:$V31,289:119,297:$V41,301:73,302:$V51,306:$V61,307:$V71,308:$V81,309:$V91},o($Vt1,[2,193]),o($Vn2,$Vo2,{59:664,14:[1,663],58:$Vt2}),{16:$Vd2,125:$Ve2,126:665,137:366,138:368,139:370,142:$Vf2},{162:[1,666]},o($Vj2,[2,171],{35:$Vk2,162:$Vl2}),o($Vj2,[2,168],{35:$Vk2,162:$Vl2}),o($Vj2,[2,169],{35:$Vk2,162:$Vl2}),o($Vj2,[2,172],{35:$Vk2,162:$Vl2}),o($Vj2,[2,173],{35:$Vk2,162:$Vl2}),o($Vj2,[2,174]),o($Vn2,$Vo2,{59:664,58:$Vt2,91:[1,667]}),o($Vj2,[2,176]),o($Vn2,$Vo2,{59:664,30:[1,668],58:$Vt2}),o($Vn2,$Vo2,{59:664,58:$Vt2,165:[1,669]}),o($Vj2,[2,182]),{12:$V1,20:670,22:208,25:35,26:36,27:$V4,28:$V5,31:$V6,32:$V7,33:41,35:$V9,42:113,46:105,47:30,48:31,55:$Vc,61:61,62:$Vd,64:52,65:53,66:19,67:20,68:21,69:22,70:23,71:24,72:25,73:26,74:27,75:28,76:29,77:32,78:110,79:$Ve,85:111,86:$Vf,87:126,88:$Vg,90:$Vh,94:90,95:$Vi,97:127,98:$Vj,102:$Vk,103:$Vl,104:$Vm,105:$Vn,106:$Vo,107:$Vp,108:$Vq,109:$Vr,111:58,112:$Vs,115:$Vt,120:112,128:$VH1,129:$VF1,130:59,131:$Vx,145:$Vy,146:$Vz,164:$VA,179:81,180:$VB,181:$VC,186:57,187:$VD,188:50,195:62,196:63,197:64,198:$VG,199:$VH,203:$VI,204:$VJ,213:56,219:88,220:87,228:122,229:$VN,230:$VO,231:$VP,235:86,236:72,237:$VQ,238:$VR,242:51,243:$VS,244:$VT,245:54,246:$VU,247:60,251:$VV,252:79,253:$VW,265:$VX,266:$VY,271:$VZ,277:$V_,278:75,279:$V$,281:$V01,282:76,283:$V11,284:77,286:118,287:$V21,288:$V31,289:119,297:$V41,301:73,302:$V51,306:$V61,307:$V71,308:$V81,309:$V91},{37:[1,671],144:$Ve1,145:$Vf1,146:$Vg1,178:$Vh1,184:$Vi1,278:158,279:$V$,281:$V01,284:159,286:118,287:$V21,288:$V31,289:119,304:$Vj1,305:$Vk1,310:$Vl1,311:$Vm1,312:$Vn1,313:$Vo1},o($Vm2,[2,184]),{6:$V33,9:559,16:$V43,30:[1,672]},{30:[1,673],58:$V53},o($Vq2,[2,343],{286:118,289:119,278:158,284:159,144:$Ve1,145:$Vf1,146:$Vg1,178:$Vh1,184:$Vi1,279:$V$,281:$V01,287:$V21,288:$V31,304:$Vj1,305:$Vk1,310:$Vl1,311:$Vm1,312:$Vn1,313:$Vo1}),{12:$V1,20:674,22:208,25:35,26:36,27:$V4,28:$V5,31:$V6,32:$V7,33:41,35:$V9,42:113,46:105,47:30,48:31,55:$Vc,61:61,62:$Vd,64:52,65:53,66:19,67:20,68:21,69:22,70:23,71:24,72:25,73:26,74:27,75:28,76:29,77:32,78:110,79:$Ve,85:111,86:$Vf,87:126,88:$Vg,90:$Vh,94:90,95:$Vi,97:127,98:$Vj,102:$Vk,103:$Vl,104:$Vm,105:$Vn,106:$Vo,107:$Vp,108:$Vq,109:$Vr,111:58,112:$Vs,115:$Vt,120:112,128:$VH1,129:$VF1,130:59,131:$Vx,145:$Vy,146:$Vz,164:$VA,179:81,180:$VB,181:$VC,186:57,187:$VD,188:50,195:62,196:63,197:64,198:$VG,199:$VH,203:$VI,204:$VJ,213:56,219:88,220:87,228:122,229:$VN,230:$VO,231:$VP,235:86,236:72,237:$VQ,238:$VR,242:51,243:$VS,244:$VT,245:54,246:$VU,247:60,251:$VV,252:79,253:$VW,265:$VX,266:$VY,271:$VZ,277:$V_,278:75,279:$V$,281:$V01,282:76,283:$V11,284:77,286:118,287:$V21,288:$V31,289:119,297:$V41,301:73,302:$V51,306:$V61,307:$V71,308:$V81,309:$V91},{12:$V1,16:$VR1,20:251,22:208,25:35,26:36,27:$V4,28:$V5,31:$V6,32:$V7,33:41,35:$V9,42:113,46:105,47:30,48:31,55:$Vc,61:61,62:$Vd,64:52,65:53,66:19,67:20,68:21,69:22,70:23,71:24,72:25,73:26,74:27,75:28,76:29,77:32,78:110,79:$Ve,85:111,86:$Vf,87:126,88:$Vg,90:$Vh,94:90,95:$Vi,97:127,98:$Vj,102:$Vk,103:$Vl,104:$Vm,105:$Vn,106:$Vo,107:$Vp,108:$Vq,109:$Vr,111:58,112:$Vs,115:$Vt,120:112,128:$VH1,129:$VF1,130:59,131:$Vx,145:$Vy,146:$Vz,164:$VA,179:81,180:$VB,181:$VC,186:57,187:$VD,188:50,195:62,196:63,197:64,198:$VG,199:$VH,203:$VI,204:$VJ,213:56,219:88,220:87,228:122,229:$VN,230:$VO,231:$VP,235:86,236:72,237:$VQ,238:$VR,242:51,243:$VS,244:$VT,245:54,246:$VU,247:60,250:675,251:$VV,252:79,253:$VW,265:$VX,266:$VY,271:$VZ,277:$V_,278:75,279:$V$,281:$V01,282:76,283:$V11,284:77,286:118,287:$V21,288:$V31,289:119,297:$V41,301:73,302:$V51,306:$V61,307:$V71,308:$V81,309:$V91},{6:$Va1,9:677,16:$V13,17:$Vj3,136:676},{144:$Ve1,145:$Vf1,146:$Vg1,165:[1,678],178:$Vh1,184:$Vi1,278:158,279:$V$,281:$V01,284:159,286:118,287:$V21,288:$V31,289:119,304:$Vj1,305:$Vk1,310:$Vl1,311:$Vm1,312:$Vn1,313:$Vo1},o($Vs2,[2,392]),{12:$V1,20:342,21:261,22:208,25:35,26:36,27:$V4,28:$V5,31:$V6,32:$V7,33:41,35:$V9,42:113,46:105,47:30,48:31,55:$Vc,61:61,62:$Vd,64:52,65:53,66:19,67:20,68:21,69:22,70:23,71:24,72:25,73:26,74:27,75:28,76:29,77:32,78:110,79:$Ve,85:111,86:$Vf,87:126,88:$Vg,90:$Vh,94:90,95:$Vi,97:127,98:$Vj,102:$Vk,103:$Vl,104:$Vm,105:$Vn,106:$Vo,107:$Vp,108:$Vq,109:$Vr,111:58,112:$Vs,115:$Vt,120:112,128:$VH1,129:$VF1,130:59,131:$Vx,145:$Vy,146:$Vz,164:$VA,176:$VU1,177:259,178:$VV1,179:81,180:$VB,181:$VC,186:57,187:$VD,188:50,193:$VE,194:$VF,195:62,196:63,197:64,198:$VG,199:$VH,203:$VI,204:$VJ,213:56,219:88,220:87,223:$VW1,228:122,229:$VN,230:$VO,231:$VP,235:86,236:72,237:$VQ,238:$VR,242:51,243:$VS,244:$VT,245:54,246:$VU,247:60,251:$VV,252:79,253:$VW,265:$VX,266:$VY,269:679,271:$VZ,277:$V_,278:75,279:$V$,281:$V01,282:76,283:$V11,284:77,286:118,287:$V21,288:$V31,289:119,297:$V41,301:73,302:$V51,306:$V61,307:$V71,308:$V81,309:$V91},o($Vu3,$V82,{175:[1,680]}),{12:$V1,16:$VS1,20:342,21:261,22:208,25:35,26:36,27:$V4,28:$V5,31:$V6,32:$V7,33:41,35:$V9,42:113,46:105,47:30,48:31,55:$Vc,61:61,62:$Vd,64:52,65:53,66:19,67:20,68:21,69:22,70:23,71:24,72:25,73:26,74:27,75:28,76:29,77:32,78:110,79:$Ve,85:111,86:$Vf,87:126,88:$Vg,90:$Vh,92:681,94:90,95:$Vi,97:127,98:$Vj,102:$Vk,103:$Vl,104:$Vm,105:$Vn,106:$Vo,107:$Vp,108:$Vq,109:$Vr,111:58,112:$Vs,115:$Vt,120:112,128:$VH1,129:$VF1,130:59,131:$Vx,145:$Vy,146:$Vz,164:$VA,176:$VU1,177:259,178:$VV1,179:81,180:$VB,181:$VC,186:57,187:$VD,188:50,193:$VE,194:$VF,195:62,196:63,197:64,198:$VG,199:$VH,203:$VI,204:$VJ,213:56,219:88,220:87,223:$VW1,228:122,229:$VN,230:$VO,231:$VP,235:86,236:72,237:$VQ,238:$VR,242:51,243:$VS,244:$VT,245:54,246:$VU,247:60,251:$VV,252:79,253:$VW,265:$VX,266:$VY,269:256,271:$VZ,277:$V_,278:75,279:$V$,281:$V01,282:76,283:$V11,284:77,286:118,287:$V21,288:$V31,289:119,297:$V41,301:73,302:$V51,306:$V61,307:$V71,308:$V81,309:$V91},o($Vu2,[2,397]),{6:$V33,9:683,16:$V43,17:$Vj3,136:682},o($VI1,[2,133]),{5:684,15:$V2,16:$V3},{12:$V1,35:$V9,42:436,164:$Vs1,176:$Vw2,216:685,219:431,220:432,221:433,222:$Vx2},{12:$V1,20:687,22:208,25:35,26:36,27:$V4,28:$V5,31:$V6,32:$V7,33:41,35:$V9,42:113,46:105,47:30,48:31,55:$Vc,61:61,62:$Vd,64:52,65:53,66:19,67:20,68:21,69:22,70:23,71:24,72:25,73:26,74:27,75:28,76:29,77:32,78:110,79:$Ve,85:111,86:$Vf,87:126,88:$Vg,90:$Vh,94:90,95:$Vi,97:127,98:$Vj,102:$Vk,103:$Vl,104:$Vm,105:$Vn,106:$Vo,107:$Vp,108:$Vq,109:$Vr,111:58,112:$Vs,115:$Vt,120:112,128:$VH1,129:$VF1,130:59,131:$Vx,145:$Vy,146:$Vz,164:$VA,179:81,180:$VB,181:$VC,186:57,187:$VD,188:50,195:62,196:63,197:64,198:$VG,199:$VH,203:$VI,204:$VJ,213:56,218:686,219:88,220:87,228:122,229:$VN,230:$VO,231:$VP,235:86,236:72,237:$VQ,238:$VR,242:51,243:$VS,244:$VT,245:54,246:$VU,247:60,251:$VV,252:79,253:$VW,265:$VX,266:$VY,271:$VZ,277:$V_,278:75,279:$V$,281:$V01,282:76,283:$V11,284:77,286:118,287:$V21,288:$V31,289:119,297:$V41,301:73,302:$V51,306:$V61,307:$V71,308:$V81,309:$V91},{12:$V1,20:687,22:208,25:35,26:36,27:$V4,28:$V5,31:$V6,32:$V7,33:41,35:$V9,42:113,46:105,47:30,48:31,55:$Vc,61:61,62:$Vd,64:52,65:53,66:19,67:20,68:21,69:22,70:23,71:24,72:25,73:26,74:27,75:28,76:29,77:32,78:110,79:$Ve,85:111,86:$Vf,87:126,88:$Vg,90:$Vh,94:90,95:$Vi,97:127,98:$Vj,102:$Vk,103:$Vl,104:$Vm,105:$Vn,106:$Vo,107:$Vp,108:$Vq,109:$Vr,111:58,112:$Vs,115:$Vt,120:112,128:$VH1,129:$VF1,130:59,131:$Vx,145:$Vy,146:$Vz,164:$VA,179:81,180:$VB,181:$VC,186:57,187:$VD,188:50,195:62,196:63,197:64,198:$VG,199:$VH,203:$VI,204:$VJ,213:56,218:688,219:88,220:87,228:122,229:$VN,230:$VO,231:$VP,235:86,236:72,237:$VQ,238:$VR,242:51,243:$VS,244:$VT,245:54,246:$VU,247:60,251:$VV,252:79,253:$VW,265:$VX,266:$VY,271:$VZ,277:$V_,278:75,279:$V$,281:$V01,282:76,283:$V11,284:77,286:118,287:$V21,288:$V31,289:119,297:$V41,301:73,302:$V51,306:$V61,307:$V71,308:$V81,309:$V91},{12:$V1,20:687,22:208,25:35,26:36,27:$V4,28:$V5,31:$V6,32:$V7,33:41,35:$V9,42:113,46:105,47:30,48:31,55:$Vc,61:61,62:$Vd,64:52,65:53,66:19,67:20,68:21,69:22,70:23,71:24,72:25,73:26,74:27,75:28,76:29,77:32,78:110,79:$Ve,85:111,86:$Vf,87:126,88:$Vg,90:$Vh,94:90,95:$Vi,97:127,98:$Vj,102:$Vk,103:$Vl,104:$Vm,105:$Vn,106:$Vo,107:$Vp,108:$Vq,109:$Vr,111:58,112:$Vs,115:$Vt,120:112,128:$VH1,129:$VF1,130:59,131:$Vx,145:$Vy,146:$Vz,164:$VA,179:81,180:$VB,181:$VC,186:57,187:$VD,188:50,195:62,196:63,197:64,198:$VG,199:$VH,203:$VI,204:$VJ,213:56,218:689,219:88,220:87,228:122,229:$VN,230:$VO,231:$VP,235:86,236:72,237:$VQ,238:$VR,242:51,243:$VS,244:$VT,245:54,246:$VU,247:60,251:$VV,252:79,253:$VW,265:$VX,266:$VY,271:$VZ,277:$V_,278:75,279:$V$,281:$V01,282:76,283:$V11,284:77,286:118,287:$V21,288:$V31,289:119,297:$V41,301:73,302:$V51,306:$V61,307:$V71,308:$V81,309:$V91},o($V63,[2,279]),o($V63,[2,280]),o($V73,[2,285]),o($VP2,[2,84]),o($Vz2,[2,420],{286:118,289:119,278:158,284:159,144:$Ve1,145:$Vf1,146:$Vg1,178:$Vh1,184:$Vi1,279:$V$,281:$V01,287:$V21,305:$Vk1,310:$Vl1,311:$Vm1,312:$Vn1,313:$Vo1}),o($Vz2,[2,422],{286:118,289:119,278:158,284:159,144:$Ve1,145:$Vf1,146:$Vg1,178:$Vh1,184:$Vi1,279:$V$,281:$V01,287:$V21,305:$Vk1,310:$Vl1,311:$Vm1,312:$Vn1,313:$Vo1}),o($VA2,[2,443]),{12:$V1,20:690,22:208,25:35,26:36,27:$V4,28:$V5,31:$V6,32:$V7,33:41,35:$V9,42:113,46:105,47:30,48:31,55:$Vc,61:61,62:$Vd,64:52,65:53,66:19,67:20,68:21,69:22,70:23,71:24,72:25,73:26,74:27,75:28,76:29,77:32,78:110,79:$Ve,85:111,86:$Vf,87:126,88:$Vg,90:$Vh,94:90,95:$Vi,97:127,98:$Vj,102:$Vk,103:$Vl,104:$Vm,105:$Vn,106:$Vo,107:$Vp,108:$Vq,109:$Vr,111:58,112:$Vs,115:$Vt,120:112,128:$VH1,129:$VF1,130:59,131:$Vx,145:$Vy,146:$Vz,164:$VA,179:81,180:$VB,181:$VC,186:57,187:$VD,188:50,195:62,196:63,197:64,198:$VG,199:$VH,203:$VI,204:$VJ,213:56,219:88,220:87,228:122,229:$VN,230:$VO,231:$VP,235:86,236:72,237:$VQ,238:$VR,242:51,243:$VS,244:$VT,245:54,246:$VU,247:60,251:$VV,252:79,253:$VW,265:$VX,266:$VY,271:$VZ,277:$V_,278:75,279:$V$,281:$V01,282:76,283:$V11,284:77,286:118,287:$V21,288:$V31,289:119,297:$V41,301:73,302:$V51,306:$V61,307:$V71,308:$V81,309:$V91},{12:$V1,20:691,22:208,25:35,26:36,27:$V4,28:$V5,31:$V6,32:$V7,33:41,35:$V9,42:113,46:105,47:30,48:31,55:$Vc,61:61,62:$Vd,64:52,65:53,66:19,67:20,68:21,69:22,70:23,71:24,72:25,73:26,74:27,75:28,76:29,77:32,78:110,79:$Ve,85:111,86:$Vf,87:126,88:$Vg,90:$Vh,94:90,95:$Vi,97:127,98:$Vj,102:$Vk,103:$Vl,104:$Vm,105:$Vn,106:$Vo,107:$Vp,108:$Vq,109:$Vr,111:58,112:$Vs,115:$Vt,120:112,128:$VH1,129:$VF1,130:59,131:$Vx,145:$Vy,146:$Vz,164:$VA,179:81,180:$VB,181:$VC,186:57,187:$VD,188:50,195:62,196:63,197:64,198:$VG,199:$VH,203:$VI,204:$VJ,213:56,219:88,220:87,228:122,229:$VN,230:$VO,231:$VP,235:86,236:72,237:$VQ,238:$VR,242:51,243:$VS,244:$VT,245:54,246:$VU,247:60,251:$VV,252:79,253:$VW,265:$VX,266:$VY,271:$VZ,277:$V_,278:75,279:$V$,281:$V01,282:76,283:$V11,284:77,286:118,287:$V21,288:$V31,289:119,297:$V41,301:73,302:$V51,306:$V61,307:$V71,308:$V81,309:$V91},{12:$V1,20:692,22:208,25:35,26:36,27:$V4,28:$V5,31:$V6,32:$V7,33:41,35:$V9,42:113,46:105,47:30,48:31,55:$Vc,61:61,62:$Vd,64:52,65:53,66:19,67:20,68:21,69:22,70:23,71:24,72:25,73:26,74:27,75:28,76:29,77:32,78:110,79:$Ve,85:111,86:$Vf,87:126,88:$Vg,90:$Vh,94:90,95:$Vi,97:127,98:$Vj,102:$Vk,103:$Vl,104:$Vm,105:$Vn,106:$Vo,107:$Vp,108:$Vq,109:$Vr,111:58,112:$Vs,115:$Vt,120:112,128:$VH1,129:$VF1,130:59,131:$Vx,145:$Vy,146:$Vz,164:$VA,179:81,180:$VB,181:$VC,186:57,187:$VD,188:50,195:62,196:63,197:64,198:$VG,199:$VH,203:$VI,204:$VJ,213:56,219:88,220:87,228:122,229:$VN,230:$VO,231:$VP,235:86,236:72,237:$VQ,238:$VR,242:51,243:$VS,244:$VT,245:54,246:$VU,247:60,251:$VV,252:79,253:$VW,265:$VX,266:$VY,271:$VZ,277:$V_,278:75,279:$V$,281:$V01,282:76,283:$V11,284:77,286:118,287:$V21,288:$V31,289:119,297:$V41,301:73,302:$V51,306:$V61,307:$V71,308:$V81,309:$V91},o([1,6,14,15,17,30,37,58,81,91,140,165,172,176,202,211,212,268,280,288,296,304],[2,357],{286:118,289:119,278:158,284:159,183:693,16:$V_1,144:$Ve1,145:$Vf1,146:$Vg1,178:$Vh1,184:$Vi1,279:$V$,281:$V01,287:$V21,305:$Vk1,310:$Vl1,311:$Vm1,312:$Vn1,313:$Vo1}),o($Vt1,[2,359]),o($Vt1,[2,363]),o($V93,[2,367],{93:452,257:453,123:454,21:455,77:456,89:457,46:459,258:460,60:461,42:462,256:694,12:$V1,82:$V42,115:$Vt,124:$Vu,193:$VE,194:$VF,203:$VD2,204:$VJ,259:$VE2,260:$VF2}),{6:$Va1,9:583,17:[1,695]},o($V93,[2,370]),o($Va3,[2,94]),o($V93,[2,374]),{12:$V1,20:696,22:208,25:35,26:36,27:$V4,28:$V5,31:$V6,32:$V7,33:41,35:$V9,42:113,46:105,47:30,48:31,55:$Vc,61:61,62:$Vd,64:52,65:53,66:19,67:20,68:21,69:22,70:23,71:24,72:25,73:26,74:27,75:28,76:29,77:32,78:110,79:$Ve,85:111,86:$Vf,87:126,88:$Vg,90:$Vh,94:90,95:$Vi,97:127,98:$Vj,102:$Vk,103:$Vl,104:$Vm,105:$Vn,106:$Vo,107:$Vp,108:$Vq,109:$Vr,111:58,112:$Vs,115:$Vt,120:112,128:$VH1,129:$VF1,130:59,131:$Vx,145:$Vy,146:$Vz,164:$VA,179:81,180:$VB,181:$VC,186:57,187:$VD,188:50,195:62,196:63,197:64,198:$VG,199:$VH,203:$VI,204:$VJ,213:56,219:88,220:87,228:122,229:$VN,230:$VO,231:$VP,235:86,236:72,237:$VQ,238:$VR,242:51,243:$VS,244:$VT,245:54,246:$VU,247:60,251:$VV,252:79,253:$VW,265:$VX,266:$VY,271:$VZ,277:$V_,278:75,279:$V$,281:$V01,282:76,283:$V11,284:77,286:118,287:$V21,288:$V31,289:119,297:$V41,301:73,302:$V51,306:$V61,307:$V71,308:$V81,309:$V91},o($Vb3,[2,381]),{12:$V1,16:$VS1,20:342,21:261,22:208,25:35,26:36,27:$V4,28:$V5,31:$V6,32:$V7,33:41,35:$V9,42:113,46:105,47:30,48:31,55:$Vc,61:61,62:$Vd,64:52,65:53,66:19,67:20,68:21,69:22,70:23,71:24,72:25,73:26,74:27,75:28,76:29,77:32,78:110,79:$Ve,85:111,86:$Vf,87:126,88:$Vg,90:$Vh,91:[1,697],92:698,94:90,95:$Vi,97:127,98:$Vj,102:$Vk,103:$Vl,104:$Vm,105:$Vn,106:$Vo,107:$Vp,108:$Vq,109:$Vr,111:58,112:$Vs,115:$Vt,120:112,128:$VH1,129:$VF1,130:59,131:$Vx,145:$Vy,146:$Vz,164:$VA,176:$VU1,177:259,178:$VV1,179:81,180:$VB,181:$VC,186:57,187:$VD,188:50,193:$VE,194:$VF,195:62,196:63,197:64,198:$VG,199:$VH,203:$VI,204:$VJ,213:56,219:88,220:87,223:$VW1,228:122,229:$VN,230:$VO,231:$VP,235:86,236:72,237:$VQ,238:$VR,242:51,243:$VS,244:$VT,245:54,246:$VU,247:60,251:$VV,252:79,253:$VW,265:$VX,266:$VY,269:256,271:$VZ,277:$V_,278:75,279:$V$,281:$V01,282:76,283:$V11,284:77,286:118,287:$V21,288:$V31,289:119,297:$V41,301:73,302:$V51,306:$V61,307:$V71,308:$V81,309:$V91},o($Vb3,[2,379]),o($Vb3,[2,380]),o($VZ2,[2,211],{183:699,16:$V_1}),o($Vs2,[2,336]),{12:$V1,21:302,42:306,46:299,55:$Vc,78:308,79:$Ve,83:307,84:$V12,87:126,88:$Vg,90:$V22,94:305,95:$Vi,97:127,98:$Vj,164:$V32,189:700,190:300,191:301,193:$VE,194:$VF,204:$VJ},o([6,16,17,58],$V02,{87:126,97:127,189:298,46:299,190:300,191:301,21:302,94:305,42:306,83:307,78:308,249:701,12:$V1,55:$Vc,79:$Ve,84:$V12,88:$Vg,90:$V22,95:$Vi,98:$Vj,164:$V32,193:$VE,194:$VF,204:$VJ}),o($VH2,[2,339]),o($VH2,[2,223],{286:118,289:119,278:158,284:159,144:$Ve1,145:$Vf1,146:$Vg1,178:$Vh1,184:$Vi1,279:$V$,281:$V01,287:$V21,288:$V31,304:$Vj1,305:$Vk1,310:$Vl1,311:$Vm1,312:$Vn1,313:$Vo1}),{12:$V1,20:702,22:208,25:35,26:36,27:$V4,28:$V5,31:$V6,32:$V7,33:41,35:$V9,42:113,46:105,47:30,48:31,55:$Vc,61:61,62:$Vd,64:52,65:53,66:19,67:20,68:21,69:22,70:23,71:24,72:25,73:26,74:27,75:28,76:29,77:32,78:110,79:$Ve,85:111,86:$Vf,87:126,88:$Vg,90:$Vh,94:90,95:$Vi,97:127,98:$Vj,102:$Vk,103:$Vl,104:$Vm,105:$Vn,106:$Vo,107:$Vp,108:$Vq,109:$Vr,111:58,112:$Vs,115:$Vt,120:112,128:$VH1,129:$VF1,130:59,131:$Vx,145:$Vy,146:$Vz,164:$VA,179:81,180:$VB,181:$VC,186:57,187:$VD,188:50,195:62,196:63,197:64,198:$VG,199:$VH,203:$VI,204:$VJ,213:56,219:88,220:87,228:122,229:$VN,230:$VO,231:$VP,235:86,236:72,237:$VQ,238:$VR,242:51,243:$VS,244:$VT,245:54,246:$VU,247:60,251:$VV,252:79,253:$VW,265:$VX,266:$VY,271:$VZ,277:$V_,278:75,279:$V$,281:$V01,282:76,283:$V11,284:77,286:118,287:$V21,288:$V31,289:119,297:$V41,301:73,302:$V51,306:$V61,307:$V71,308:$V81,309:$V91},o($VH2,[2,225],{286:118,289:119,278:158,284:159,144:$Ve1,145:$Vf1,146:$Vg1,178:$Vh1,184:$Vi1,279:$V$,281:$V01,287:$V21,288:$V31,304:$Vj1,305:$Vk1,310:$Vl1,311:$Vm1,312:$Vn1,313:$Vo1}),{12:$V1,20:703,22:208,25:35,26:36,27:$V4,28:$V5,31:$V6,32:$V7,33:41,35:$V9,42:113,46:105,47:30,48:31,55:$Vc,61:61,62:$Vd,64:52,65:53,66:19,67:20,68:21,69:22,70:23,71:24,72:25,73:26,74:27,75:28,76:29,77:32,78:110,79:$Ve,85:111,86:$Vf,87:126,88:$Vg,90:$Vh,94:90,95:$Vi,97:127,98:$Vj,102:$Vk,103:$Vl,104:$Vm,105:$Vn,106:$Vo,107:$Vp,108:$Vq,109:$Vr,111:58,112:$Vs,115:$Vt,120:112,128:$VH1,129:$VF1,130:59,131:$Vx,145:$Vy,146:$Vz,164:$VA,179:81,180:$VB,181:$VC,186:57,187:$VD,188:50,195:62,196:63,197:64,198:$VG,199:$VH,203:$VI,204:$VJ,213:56,219:88,220:87,228:122,229:$VN,230:$VO,231:$VP,235:86,236:72,237:$VQ,238:$VR,242:51,243:$VS,244:$VT,245:54,246:$VU,247:60,251:$VV,252:79,253:$VW,265:$VX,266:$VY,271:$VZ,277:$V_,278:75,279:$V$,281:$V01,282:76,283:$V11,284:77,286:118,287:$V21,288:$V31,289:119,297:$V41,301:73,302:$V51,306:$V61,307:$V71,308:$V81,309:$V91},o($VI2,[2,232]),o($VI2,[2,233]),o($V72,[2,106]),o($VK2,$Vv2,{216:430,219:431,220:432,221:433,42:436,201:479,208:704,12:$V1,29:$VL2,35:$V9,164:$Vs1,176:$Vw2,222:$Vx2}),o($Vt1,[2,248]),{5:705,15:$V2,16:$V3,199:[1,706]},o($Vt1,[2,258]),{30:[1,707],58:$V53},o($VO2,[2,255]),o([1,6,14,15,16,17,30,37,58,81,91,140,165,172,176,202,211,212,268,279,280,281,287,288,296,304,305],[2,466],{286:118,289:119,278:158,284:159,144:$Ve1,145:$Vf1,146:$Vg1,178:$Vh1,184:$Vi1,310:$Vl1,311:$Vm1,312:$Vn1,313:$Vo1}),{6:$Va1,9:642,17:$Vj3,136:708,144:$Ve1,145:$Vf1,146:$Vg1,178:$Vh1,184:$Vi1,278:158,279:$V$,281:$V01,284:159,286:118,287:$V21,288:$V31,289:119,304:$Vj1,305:$Vk1,310:$Vl1,311:$Vm1,312:$Vn1,313:$Vo1},{39:709,55:$VC1},o($Vn2,$Vo2,{59:497,37:[1,710],58:$VT2}),o($Vb1,[2,48]),{39:711,55:$VC1},o($VH2,[2,55]),{12:$V1,42:357,44:$Vc2,57:712,60:358,82:$V42},{12:$V1,16:$Vb2,36:713,42:357,44:$Vc2,57:355,60:358,82:$V42},{6:[1,715],16:$Vi3,17:[1,714]},o($VH2,[2,62]),o($VH2,[2,64]),{39:716,55:$VC1},{39:717,55:$VC1},o($VU2,[2,138]),o($VU2,[2,139]),{17:$Vv3,125:$Ve2,137:625,138:368,139:370,142:$Vf2},o($Vw3,[2,403]),o($VU2,[2,141]),{6:$Va1,9:627,17:$Vj3,136:719,138:506,139:370,142:$Vf2},o($VU2,[2,142],{58:$Vx3}),o($Vy3,[2,147],{39:639,143:721,148:722,12:$Vk3,55:$VC1,95:$Vl3,144:$Vz3,145:$VA3,146:$VB3,149:$Vm3,150:$Vn3,151:$Vo3,152:$Vp3}),o($VC3,[2,149]),o($VC3,[2,152]),o($VC3,[2,153]),o($VC3,[2,154]),o($VC3,[2,155]),o($VC3,[2,156]),o($VC3,[2,157]),o($VC3,[2,159],{29:[1,726]}),o($Vt1,[2,219]),{17:$Vv3},{6:$Va1,9:642,17:$Vj3,136:727,144:$Ve1,145:$Vf1,146:$Vg1,178:$Vh1,184:$Vi1,278:158,279:$V$,281:$V01,284:159,286:118,287:$V21,288:$V31,289:119,304:$Vj1,305:$Vk1,310:$Vl1,311:$Vm1,312:$Vn1,313:$Vo1},o($VW2,[2,10]),o($Vt1,[2,486]),o($VX2,[2,460]),o([1,6,14,15,16,17,30,37,58,81,91,140,144,145,146,165,172,176,178,184,202,211,212,268,274,279,280,281,287,288,296,304,305,310,311,312,313],[2,416]),o($Vt1,[2,451]),{5:728,15:$V2,16:$V3},{17:[1,729]},o($VY2,[2,457],{6:[1,730]}),{12:$V1,20:731,22:208,25:35,26:36,27:$V4,28:$V5,31:$V6,32:$V7,33:41,35:$V9,42:113,46:105,47:30,48:31,55:$Vc,61:61,62:$Vd,64:52,65:53,66:19,67:20,68:21,69:22,70:23,71:24,72:25,73:26,74:27,75:28,76:29,77:32,78:110,79:$Ve,85:111,86:$Vf,87:126,88:$Vg,90:$Vh,94:90,95:$Vi,97:127,98:$Vj,102:$Vk,103:$Vl,104:$Vm,105:$Vn,106:$Vo,107:$Vp,108:$Vq,109:$Vr,111:58,112:$Vs,115:$Vt,120:112,128:$VH1,129:$VF1,130:59,131:$Vx,145:$Vy,146:$Vz,164:$VA,179:81,180:$VB,181:$VC,186:57,187:$VD,188:50,195:62,196:63,197:64,198:$VG,199:$VH,203:$VI,204:$VJ,213:56,219:88,220:87,228:122,229:$VN,230:$VO,231:$VP,235:86,236:72,237:$VQ,238:$VR,242:51,243:$VS,244:$VT,245:54,246:$VU,247:60,251:$VV,252:79,253:$VW,265:$VX,266:$VY,271:$VZ,277:$V_,278:75,279:$V$,281:$V01,282:76,283:$V11,284:77,286:118,287:$V21,288:$V31,289:119,297:$V41,301:73,302:$V51,306:$V61,307:$V71,308:$V81,309:$V91},o($Vt1,[2,190]),o($Vn2,$Vo2,{59:734,17:[1,732],58:$VD3}),o($VE3,[2,194]),{12:$V1,16:$Vr3,20:657,21:661,22:208,25:35,26:36,27:$V4,28:$V5,31:$V6,32:$V7,33:41,35:$V9,42:113,46:105,47:30,48:31,55:$Vc,61:61,62:$Vd,64:52,65:53,66:19,67:20,68:21,69:22,70:23,71:24,72:25,73:26,74:27,75:28,76:29,77:32,78:110,79:$Ve,85:111,86:$Vf,87:126,88:$Vg,90:$Vh,94:90,95:$Vi,97:127,98:$Vj,102:$Vk,103:$Vl,104:$Vm,105:$Vn,106:$Vo,107:$Vp,108:$Vq,109:$Vr,111:58,112:$Vs,115:$Vt,120:112,128:$VH1,129:$VF1,130:59,131:$Vx,145:$Vy,146:$Vz,164:$VA,173:735,174:655,176:$Vs3,177:659,178:$Vt3,179:81,180:$VB,181:$VC,186:57,187:$VD,188:50,193:$VE,194:$VF,195:62,196:63,197:64,198:$VG,199:$VH,203:$VI,204:$VJ,213:56,219:88,220:87,223:$VW1,228:122,229:$VN,230:$VO,231:$VP,235:86,236:72,237:$VQ,238:$VR,242:51,243:$VS,244:$VT,245:54,246:$VU,247:60,251:$VV,252:79,253:$VW,265:$VX,266:$VY,271:$VZ,277:$V_,278:75,279:$V$,281:$V01,282:76,283:$V11,284:77,286:118,287:$V21,288:$V31,289:119,297:$V41,301:73,302:$V51,306:$V61,307:$V71,308:$V81,309:$V91},o($VE3,[2,200],{286:118,289:119,278:158,284:159,144:$Ve1,145:$Vf1,146:$Vg1,178:$Vh1,184:$Vi1,279:$V$,281:$V01,287:$V21,288:$V31,304:$Vj1,305:$Vk1,310:$Vl1,311:$Vm1,312:$Vn1,313:$Vo1}),{12:$V1,20:736,22:208,25:35,26:36,27:$V4,28:$V5,31:$V6,32:$V7,33:41,35:$V9,42:113,46:105,47:30,48:31,55:$Vc,61:61,62:$Vd,64:52,65:53,66:19,67:20,68:21,69:22,70:23,71:24,72:25,73:26,74:27,75:28,76:29,77:32,78:110,79:$Ve,85:111,86:$Vf,87:126,88:$Vg,90:$Vh,94:90,95:$Vi,97:127,98:$Vj,102:$Vk,103:$Vl,104:$Vm,105:$Vn,106:$Vo,107:$Vp,108:$Vq,109:$Vr,111:58,112:$Vs,115:$Vt,120:112,128:$VH1,129:$VF1,130:59,131:$Vx,145:$Vy,146:$Vz,164:$VA,179:81,180:$VB,181:$VC,186:57,187:$VD,188:50,195:62,196:63,197:64,198:$VG,199:$VH,203:$VI,204:$VJ,213:56,219:88,220:87,228:122,229:$VN,230:$VO,231:$VP,235:86,236:72,237:$VQ,238:$VR,242:51,243:$VS,244:$VT,245:54,246:$VU,247:60,251:$VV,252:79,253:$VW,265:$VX,266:$VY,271:$VZ,277:$V_,278:75,279:$V$,281:$V01,282:76,283:$V11,284:77,286:118,287:$V21,288:$V31,289:119,297:$V41,301:73,302:$V51,306:$V61,307:$V71,308:$V81,309:$V91},o($VE3,[2,202]),o($VE3,[2,203]),o($VE3,[2,204]),o($Vn2,$Vo2,{59:734,30:[1,737],58:$VD3}),o($Vj2,[2,162]),{6:$V33,9:559,16:$V43},{6:$Va1,9:507,133:[1,738],138:506,139:370,142:$Vf2},o($Vj2,[2,170]),o($Vj2,[2,175]),o($Vj2,[2,177]),o($Vj2,[2,178]),{144:$Ve1,145:$Vf1,146:$Vg1,172:[1,739],178:$Vh1,184:$Vi1,278:158,279:$V$,281:$V01,284:159,286:118,287:$V21,288:$V31,289:119,304:$Vj1,305:$Vk1,310:$Vl1,311:$Vm1,312:$Vn1,313:$Vo1},o($Vm2,[2,186]),o($VI1,[2,388]),o($VB1,[2,347],{183:740,16:$V_1}),o($Vq2,[2,344],{286:118,289:119,278:158,284:159,144:$Ve1,145:$Vf1,146:$Vg1,178:$Vh1,184:$Vi1,279:$V$,281:$V01,287:$V21,288:$V31,304:$Vj1,305:$Vk1,310:$Vl1,311:$Vm1,312:$Vn1,313:$Vo1}),o($V$2,$Vo2,{59:741,58:$Vp2}),o($Vq2,[2,345]),{12:$V1,17:$Vv3,20:674,22:208,25:35,26:36,27:$V4,28:$V5,31:$V6,32:$V7,33:41,35:$V9,42:113,46:105,47:30,48:31,55:$Vc,61:61,62:$Vd,64:52,65:53,66:19,67:20,68:21,69:22,70:23,71:24,72:25,73:26,74:27,75:28,76:29,77:32,78:110,79:$Ve,85:111,86:$Vf,87:126,88:$Vg,90:$Vh,94:90,95:$Vi,97:127,98:$Vj,102:$Vk,103:$Vl,104:$Vm,105:$Vn,106:$Vo,107:$Vp,108:$Vq,109:$Vr,111:58,112:$Vs,115:$Vt,120:112,128:$VH1,129:$VF1,130:59,131:$Vx,145:$Vy,146:$Vz,164:$VA,179:81,180:$VB,181:$VC,186:57,187:$VD,188:50,195:62,196:63,197:64,198:$VG,199:$VH,203:$VI,204:$VJ,213:56,219:88,220:87,228:122,229:$VN,230:$VO,231:$VP,235:86,236:72,237:$VQ,238:$VR,242:51,243:$VS,244:$VT,245:54,246:$VU,247:60,251:$VV,252:79,253:$VW,265:$VX,266:$VY,271:$VZ,277:$V_,278:75,279:$V$,281:$V01,282:76,283:$V11,284:77,286:118,287:$V21,288:$V31,289:119,297:$V41,301:73,302:$V51,306:$V61,307:$V71,308:$V81,309:$V91},o($VI1,[2,395]),o($Vu2,[2,398]),{6:$Va1,9:742},o($V$2,$Vo2,{59:743,58:$Vt2}),o($Vu2,[2,400]),{12:$V1,17:$Vv3,20:342,21:261,22:208,25:35,26:36,27:$V4,28:$V5,31:$V6,32:$V7,33:41,35:$V9,42:113,46:105,47:30,48:31,55:$Vc,61:61,62:$Vd,64:52,65:53,66:19,67:20,68:21,69:22,70:23,71:24,72:25,73:26,74:27,75:28,76:29,77:32,78:110,79:$Ve,85:111,86:$Vf,87:126,88:$Vg,90:$Vh,94:90,95:$Vi,97:127,98:$Vj,102:$Vk,103:$Vl,104:$Vm,105:$Vn,106:$Vo,107:$Vp,108:$Vq,109:$Vr,111:58,112:$Vs,115:$Vt,120:112,128:$VH1,129:$VF1,130:59,131:$Vx,145:$Vy,146:$Vz,164:$VA,176:$VU1,177:259,178:$VV1,179:81,180:$VB,181:$VC,186:57,187:$VD,188:50,193:$VE,194:$VF,195:62,196:63,197:64,198:$VG,199:$VH,203:$VI,204:$VJ,213:56,219:88,220:87,223:$VW1,228:122,229:$VN,230:$VO,231:$VP,235:86,236:72,237:$VQ,238:$VR,242:51,243:$VS,244:$VT,245:54,246:$VU,247:60,251:$VV,252:79,253:$VW,265:$VX,266:$VY,269:679,271:$VZ,277:$V_,278:75,279:$V$,281:$V01,282:76,283:$V11,284:77,286:118,287:$V21,288:$V31,289:119,297:$V41,301:73,302:$V51,306:$V61,307:$V71,308:$V81,309:$V91},o($VI1,[2,243]),o($V63,[2,268]),o($V63,[2,282]),o($V63,[2,275],{286:118,289:119,278:158,284:159,144:$Ve1,145:$Vf1,146:$Vg1,178:$Vh1,184:$Vi1,279:$V$,281:$V01,287:$V21,288:$V31,304:$Vj1,305:$Vk1,310:$Vl1,311:$Vm1,312:$Vn1,313:$Vo1}),o($V63,[2,283]),o($V63,[2,281]),o([1,6,14,15,16,17,30,37,58,81,91,140,165,172,176,202,211,212,268,279,280,281,287,288,304],[2,446],{286:118,289:119,278:158,284:159,144:$Ve1,145:$Vf1,146:$Vg1,178:$Vh1,184:$Vi1,296:[1,744],305:$Vk1,310:$Vl1,311:$Vm1,312:$Vn1,313:$Vo1}),o($V83,[2,448],{286:118,289:119,278:158,284:159,144:$Ve1,145:$Vf1,146:$Vg1,178:$Vh1,184:$Vi1,280:[1,745],305:$Vk1,310:$Vl1,311:$Vm1,312:$Vn1,313:$Vo1}),o($VV2,[2,447],{286:118,289:119,278:158,284:159,144:$Ve1,145:$Vf1,146:$Vg1,178:$Vh1,184:$Vi1,305:$Vk1,310:$Vl1,311:$Vm1,312:$Vn1,313:$Vo1}),o($Vt1,[2,358]),o($V93,[2,366]),o($Vt1,[2,364]),o($V93,[2,376],{286:118,289:119,278:158,284:159,144:$Ve1,145:$Vf1,146:$Vg1,178:$Vh1,184:$Vi1,279:$V$,281:$V01,287:$V21,288:$V31,304:$Vj1,305:$Vk1,310:$Vl1,311:$Vm1,312:$Vn1,313:$Vo1}),o($Va3,[2,91]),o($Vn2,$Vo2,{59:664,58:$Vt2,91:[1,746]}),o($Vt1,[2,212]),o($VH2,[2,340]),o($V$2,$Vo2,{59:747,58:$VG2}),{6:$Va1,9:642,17:$Vj3,136:748,144:$Ve1,145:$Vf1,146:$Vg1,178:$Vh1,184:$Vi1,278:158,279:$V$,281:$V01,284:159,286:118,287:$V21,288:$V31,289:119,304:$Vj1,305:$Vk1,310:$Vl1,311:$Vm1,312:$Vn1,313:$Vo1},{6:$Va1,9:642,17:$Vj3,136:749,144:$Ve1,145:$Vf1,146:$Vg1,178:$Vh1,184:$Vi1,278:158,279:$V$,281:$V01,284:159,286:118,287:$V21,288:$V31,289:119,304:$Vj1,305:$Vk1,310:$Vl1,311:$Vm1,312:$Vn1,313:$Vo1},{209:750,211:$Ve3,212:$Vf3},o($Vt1,[2,256]),{5:751,15:$V2,16:$V3},o($Vg3,[2,250]),o($V92,[2,302]),o($Vb1,[2,50]),{38:[1,752]},o($Vb1,[2,49]),o($VH2,[2,56]),o($V$2,$Vo2,{59:753,58:$VT2}),o($VH2,[2,57]),{12:$V1,17:[1,754],42:357,44:$Vc2,57:712,60:358,82:$V42},o($Vb1,[2,32]),o($Vb1,[2,34]),o($Vw3,[2,402]),{127:[2,135]},{12:$Vk3,39:639,55:$VC1,95:$Vl3,147:755,148:633,149:$Vm3,150:$Vn3,151:$Vo3,152:$Vp3},o($VC3,[2,150]),o($VC3,[2,151]),o($VC3,[2,144]),o($VC3,[2,145]),o($VC3,[2,146]),{12:$Vk3,39:639,55:$VC1,95:$Vl3,141:756,147:632,148:633,149:$Vm3,150:$Vn3,151:$Vo3,152:$Vp3},o($Vt1,[2,220]),{6:$Va1,9:642,17:$Vj3,136:757},o($Vt1,[2,454]),o($VY2,[2,458]),o($Vq3,[2,410],{286:118,289:119,278:158,284:159,144:$Ve1,145:$Vf1,146:$Vg1,178:$Vh1,184:$Vi1,279:$V$,281:$V01,287:$V21,288:$V31,304:$Vj1,305:$Vk1,310:$Vl1,311:$Vm1,312:$Vn1,313:$Vo1}),o($Vt1,[2,191]),o($V$2,$V03,{66:19,67:20,68:21,69:22,70:23,71:24,72:25,73:26,74:27,75:28,76:29,47:30,48:31,77:32,25:35,26:36,33:41,188:50,242:51,64:52,65:53,245:54,213:56,186:57,111:58,130:59,247:60,61:61,195:62,196:63,197:64,236:72,301:73,278:75,282:76,284:77,252:79,179:81,235:86,220:87,219:88,94:90,46:105,78:110,85:111,120:112,42:113,286:118,289:119,228:122,87:126,97:127,22:208,20:657,177:659,21:661,174:758,12:$V1,27:$V4,28:$V5,31:$V6,32:$V7,35:$V9,55:$Vc,62:$Vd,79:$Ve,86:$Vf,88:$Vg,90:$Vh,95:$Vi,98:$Vj,102:$Vk,103:$Vl,104:$Vm,105:$Vn,106:$Vo,107:$Vp,108:$Vq,109:$Vr,112:$Vs,115:$Vt,128:$VH1,129:$VF1,131:$Vx,145:$Vy,146:$Vz,164:$VA,176:$Vs3,178:$Vt3,180:$VB,181:$VC,187:$VD,193:$VE,194:$VF,198:$VG,199:$VH,203:$VI,204:$VJ,223:$VW1,229:$VN,230:$VO,231:$VP,237:$VQ,238:$VR,243:$VS,244:$VT,246:$VU,251:$VV,253:$VW,265:$VX,266:$VY,271:$VZ,277:$V_,279:$V$,281:$V01,283:$V11,287:$V21,288:$V31,297:$V41,302:$V51,306:$V61,307:$V71,308:$V81,309:$V91}),{6:$VF3,9:759,16:$VG3},o($V$2,$Vo2,{59:762,58:$VD3}),o($VE3,[2,201],{286:118,289:119,278:158,284:159,144:$Ve1,145:$Vf1,146:$Vg1,178:$Vh1,184:$Vi1,279:$V$,281:$V01,287:$V21,288:$V31,304:$Vj1,305:$Vk1,310:$Vl1,311:$Vm1,312:$Vn1,313:$Vo1}),o($Vt1,[2,192]),o($Vj2,[2,167]),o($Vj2,[2,189]),o($VB1,[2,348]),{6:$Va1,9:677,16:$V13,17:$Vj3,136:763},{12:$V1,20:342,21:261,22:208,25:35,26:36,27:$V4,28:$V5,31:$V6,32:$V7,33:41,35:$V9,42:113,46:105,47:30,48:31,55:$Vc,61:61,62:$Vd,64:52,65:53,66:19,67:20,68:21,69:22,70:23,71:24,72:25,73:26,74:27,75:28,76:29,77:32,78:110,79:$Ve,85:111,86:$Vf,87:126,88:$Vg,90:$Vh,94:90,95:$Vi,97:127,98:$Vj,102:$Vk,103:$Vl,104:$Vm,105:$Vn,106:$Vo,107:$Vp,108:$Vq,109:$Vr,111:58,112:$Vs,115:$Vt,120:112,128:$VH1,129:$VF1,130:59,131:$Vx,145:$Vy,146:$Vz,164:$VA,176:$VU1,177:259,178:$VV1,179:81,180:$VB,181:$VC,186:57,187:$VD,188:50,193:$VE,194:$VF,195:62,196:63,197:64,198:$VG,199:$VH,203:$VI,204:$VJ,213:56,219:88,220:87,223:$VW1,228:122,229:$VN,230:$VO,231:$VP,235:86,236:72,237:$VQ,238:$VR,242:51,243:$VS,244:$VT,245:54,246:$VU,247:60,251:$VV,252:79,253:$VW,265:$VX,266:$VY,269:764,271:$VZ,277:$V_,278:75,279:$V$,281:$V01,282:76,283:$V11,284:77,286:118,287:$V21,288:$V31,289:119,297:$V41,301:73,302:$V51,306:$V61,307:$V71,308:$V81,309:$V91},{6:$V33,9:683,16:$V43,17:$Vj3,136:765},{12:$V1,20:766,22:208,25:35,26:36,27:$V4,28:$V5,31:$V6,32:$V7,33:41,35:$V9,42:113,46:105,47:30,48:31,55:$Vc,61:61,62:$Vd,64:52,65:53,66:19,67:20,68:21,69:22,70:23,71:24,72:25,73:26,74:27,75:28,76:29,77:32,78:110,79:$Ve,85:111,86:$Vf,87:126,88:$Vg,90:$Vh,94:90,95:$Vi,97:127,98:$Vj,102:$Vk,103:$Vl,104:$Vm,105:$Vn,106:$Vo,107:$Vp,108:$Vq,109:$Vr,111:58,112:$Vs,115:$Vt,120:112,128:$VH1,129:$VF1,130:59,131:$Vx,145:$Vy,146:$Vz,164:$VA,179:81,180:$VB,181:$VC,186:57,187:$VD,188:50,195:62,196:63,197:64,198:$VG,199:$VH,203:$VI,204:$VJ,213:56,219:88,220:87,228:122,229:$VN,230:$VO,231:$VP,235:86,236:72,237:$VQ,238:$VR,242:51,243:$VS,244:$VT,245:54,246:$VU,247:60,251:$VV,252:79,253:$VW,265:$VX,266:$VY,271:$VZ,277:$V_,278:75,279:$V$,281:$V01,282:76,283:$V11,284:77,286:118,287:$V21,288:$V31,289:119,297:$V41,301:73,302:$V51,306:$V61,307:$V71,308:$V81,309:$V91},{12:$V1,20:767,22:208,25:35,26:36,27:$V4,28:$V5,31:$V6,32:$V7,33:41,35:$V9,42:113,46:105,47:30,48:31,55:$Vc,61:61,62:$Vd,64:52,65:53,66:19,67:20,68:21,69:22,70:23,71:24,72:25,73:26,74:27,75:28,76:29,77:32,78:110,79:$Ve,85:111,86:$Vf,87:126,88:$Vg,90:$Vh,94:90,95:$Vi,97:127,98:$Vj,102:$Vk,103:$Vl,104:$Vm,105:$Vn,106:$Vo,107:$Vp,108:$Vq,109:$Vr,111:58,112:$Vs,115:$Vt,120:112,128:$VH1,129:$VF1,130:59,131:$Vx,145:$Vy,146:$Vz,164:$VA,179:81,180:$VB,181:$VC,186:57,187:$VD,188:50,195:62,196:63,197:64,198:$VG,199:$VH,203:$VI,204:$VJ,213:56,219:88,220:87,228:122,229:$VN,230:$VO,231:$VP,235:86,236:72,237:$VQ,238:$VR,242:51,243:$VS,244:$VT,245:54,246:$VU,247:60,251:$VV,252:79,253:$VW,265:$VX,266:$VY,271:$VZ,277:$V_,278:75,279:$V$,281:$V01,282:76,283:$V11,284:77,286:118,287:$V21,288:$V31,289:119,297:$V41,301:73,302:$V51,306:$V61,307:$V71,308:$V81,309:$V91},o($Va3,[2,92]),{6:$Va1,9:769,16:$Vc3,17:$Vj3,136:768},o($VH2,[2,224]),o($VH2,[2,226]),o($Vt1,[2,247]),o($Vt1,[2,257]),{39:770,55:$VC1},{6:$Vh3,16:$Vi3,17:[1,771]},o($VH2,[2,58]),o($Vy3,[2,148],{39:639,143:721,148:722,12:$Vk3,55:$VC1,95:$Vl3,144:$Vz3,145:$VA3,146:$VB3,149:$Vm3,150:$Vn3,151:$Vo3,152:$Vp3}),{30:[1,772],58:$Vx3},o($Vt1,[2,452]),o($VE3,[2,195]),{12:$V1,20:657,21:661,22:208,25:35,26:36,27:$V4,28:$V5,31:$V6,32:$V7,33:41,35:$V9,42:113,46:105,47:30,48:31,55:$Vc,61:61,62:$Vd,64:52,65:53,66:19,67:20,68:21,69:22,70:23,71:24,72:25,73:26,74:27,75:28,76:29,77:32,78:110,79:$Ve,85:111,86:$Vf,87:126,88:$Vg,90:$Vh,94:90,95:$Vi,97:127,98:$Vj,102:$Vk,103:$Vl,104:$Vm,105:$Vn,106:$Vo,107:$Vp,108:$Vq,109:$Vr,111:58,112:$Vs,115:$Vt,120:112,128:$VH1,129:$VF1,130:59,131:$Vx,145:$Vy,146:$Vz,164:$VA,174:773,176:$Vs3,177:659,178:$Vt3,179:81,180:$VB,181:$VC,186:57,187:$VD,188:50,193:$VE,194:$VF,195:62,196:63,197:64,198:$VG,199:$VH,203:$VI,204:$VJ,213:56,219:88,220:87,223:$VW1,228:122,229:$VN,230:$VO,231:$VP,235:86,236:72,237:$VQ,238:$VR,242:51,243:$VS,244:$VT,245:54,246:$VU,247:60,251:$VV,252:79,253:$VW,265:$VX,266:$VY,271:$VZ,277:$V_,278:75,279:$V$,281:$V01,282:76,283:$V11,284:77,286:118,287:$V21,288:$V31,289:119,297:$V41,301:73,302:$V51,306:$V61,307:$V71,308:$V81,309:$V91},o($Vu3,$V82,{175:[1,774]}),{12:$V1,16:$Vr3,20:657,21:661,22:208,25:35,26:36,27:$V4,28:$V5,31:$V6,32:$V7,33:41,35:$V9,42:113,46:105,47:30,48:31,55:$Vc,61:61,62:$Vd,64:52,65:53,66:19,67:20,68:21,69:22,70:23,71:24,72:25,73:26,74:27,75:28,76:29,77:32,78:110,79:$Ve,85:111,86:$Vf,87:126,88:$Vg,90:$Vh,94:90,95:$Vi,97:127,98:$Vj,102:$Vk,103:$Vl,104:$Vm,105:$Vn,106:$Vo,107:$Vp,108:$Vq,109:$Vr,111:58,112:$Vs,115:$Vt,120:112,128:$VH1,129:$VF1,130:59,131:$Vx,145:$Vy,146:$Vz,164:$VA,173:775,174:655,176:$Vs3,177:659,178:$Vt3,179:81,180:$VB,181:$VC,186:57,187:$VD,188:50,193:$VE,194:$VF,195:62,196:63,197:64,198:$VG,199:$VH,203:$VI,204:$VJ,213:56,219:88,220:87,223:$VW1,228:122,229:$VN,230:$VO,231:$VP,235:86,236:72,237:$VQ,238:$VR,242:51,243:$VS,244:$VT,245:54,246:$VU,247:60,251:$VV,252:79,253:$VW,265:$VX,266:$VY,271:$VZ,277:$V_,278:75,279:$V$,281:$V01,282:76,283:$V11,284:77,286:118,287:$V21,288:$V31,289:119,297:$V41,301:73,302:$V51,306:$V61,307:$V71,308:$V81,309:$V91},{6:$VF3,9:777,16:$VG3,17:$Vj3,136:776},o($Vq2,[2,346]),o($Vu2,[2,399]),o($Vu2,[2,401]),o($VV2,[2,449],{286:118,289:119,278:158,284:159,144:$Ve1,145:$Vf1,146:$Vg1,178:$Vh1,184:$Vi1,305:$Vk1,310:$Vl1,311:$Vm1,312:$Vn1,313:$Vo1}),o($VV2,[2,450],{286:118,289:119,278:158,284:159,144:$Ve1,145:$Vf1,146:$Vg1,178:$Vh1,184:$Vi1,305:$Vk1,310:$Vl1,311:$Vm1,312:$Vn1,313:$Vo1}),o($VH2,[2,341]),{12:$V1,17:$Vv3,21:302,42:306,46:299,55:$Vc,78:308,79:$Ve,83:307,84:$V12,87:126,88:$Vg,90:$V22,94:305,95:$Vi,97:127,98:$Vj,164:$V32,189:700,190:300,191:301,193:$VE,194:$VF,204:$VJ},o($Vb1,[2,51]),o($VH2,[2,59]),o($VC3,[2,158]),o($VE3,[2,196]),{6:$Va1,9:778},o($V$2,$Vo2,{59:779,58:$VD3}),o($VE3,[2,198]),{12:$V1,17:$Vv3,20:657,21:661,22:208,25:35,26:36,27:$V4,28:$V5,31:$V6,32:$V7,33:41,35:$V9,42:113,46:105,47:30,48:31,55:$Vc,61:61,62:$Vd,64:52,65:53,66:19,67:20,68:21,69:22,70:23,71:24,72:25,73:26,74:27,75:28,76:29,77:32,78:110,79:$Ve,85:111,86:$Vf,87:126,88:$Vg,90:$Vh,94:90,95:$Vi,97:127,98:$Vj,102:$Vk,103:$Vl,104:$Vm,105:$Vn,106:$Vo,107:$Vp,108:$Vq,109:$Vr,111:58,112:$Vs,115:$Vt,120:112,128:$VH1,129:$VF1,130:59,131:$Vx,145:$Vy,146:$Vz,164:$VA,174:773,176:$Vs3,177:659,178:$Vt3,179:81,180:$VB,181:$VC,186:57,187:$VD,188:50,193:$VE,194:$VF,195:62,196:63,197:64,198:$VG,199:$VH,203:$VI,204:$VJ,213:56,219:88,220:87,223:$VW1,228:122,229:$VN,230:$VO,231:$VP,235:86,236:72,237:$VQ,238:$VR,242:51,243:$VS,244:$VT,245:54,246:$VU,247:60,251:$VV,252:79,253:$VW,265:$VX,266:$VY,271:$VZ,277:$V_,278:75,279:$V$,281:$V01,282:76,283:$V11,284:77,286:118,287:$V21,288:$V31,289:119,297:$V41,301:73,302:$V51,306:$V61,307:$V71,308:$V81,309:$V91},{12:$V1,20:657,21:661,22:208,25:35,26:36,27:$V4,28:$V5,31:$V6,32:$V7,33:41,35:$V9,42:113,46:105,47:30,48:31,55:$Vc,61:61,62:$Vd,64:52,65:53,66:19,67:20,68:21,69:22,70:23,71:24,72:25,73:26,74:27,75:28,76:29,77:32,78:110,79:$Ve,85:111,86:$Vf,87:126,88:$Vg,90:$Vh,94:90,95:$Vi,97:127,98:$Vj,102:$Vk,103:$Vl,104:$Vm,105:$Vn,106:$Vo,107:$Vp,108:$Vq,109:$Vr,111:58,112:$Vs,115:$Vt,120:112,128:$VH1,129:$VF1,130:59,131:$Vx,145:$Vy,146:$Vz,164:$VA,174:780,176:$Vs3,177:659,178:$Vt3,179:81,180:$VB,181:$VC,186:57,187:$VD,188:50,193:$VE,194:$VF,195:62,196:63,197:64,198:$VG,199:$VH,203:$VI,204:$VJ,213:56,219:88,220:87,223:$VW1,228:122,229:$VN,230:$VO,231:$VP,235:86,236:72,237:$VQ,238:$VR,242:51,243:$VS,244:$VT,245:54,246:$VU,247:60,251:$VV,252:79,253:$VW,265:$VX,266:$VY,271:$VZ,277:$V_,278:75,279:$V$,281:$V01,282:76,283:$V11,284:77,286:118,287:$V21,288:$V31,289:119,297:$V41,301:73,302:$V51,306:$V61,307:$V71,308:$V81,309:$V91},{6:$VF3,9:777,16:$VG3,17:$Vj3,136:781},o($VE3,[2,197]),o($VE3,[2,199])],
defaultActions: {142:[2,3],184:[2,386],185:[2,315],371:[2,143],501:[2,53],719:[2,135]},
parseError: function parseError (str, hash) {
    if (hash.recoverable) {
        this.trace(str);
    } else {
        throw new Error(str);
    }
},
parse: function parse (input) {

    // For Imba we are going to drop most of the features that are not used
    // Locations are provided by the tokens from the lexer directly - so drop yylloc
    // We dont really need the shared state (it seems)

    var self = this,
        stack = [0],
        tstack = [], // token stack
        vstack = [null], // semantic value stack
        table = this.table,
        yytext = '',
        yylineno = 0,
        yyleng = 0,
        recovering = 0,
        TERROR = 2,
        EOF = 1;

    // var args = lstack.slice.call(arguments, 1);
    //this.reductionCount = this.shiftCount = 0;

    var lexer = Object.create(this.lexer);
    var yy = this.yy;

    lexer.setInput(input,yy);

    if (typeof yy.parseError === 'function') {
        this.parseError = yy.parseError;
    } else {
        this.parseError = Object.getPrototypeOf(this).parseError; // what?
    }

    function popStack (n) {
        stack.length = stack.length - 2 * n;
        vstack.length = vstack.length - n;
    }

    var symbol, preErrorSymbol, state, action, a, r, yyval = {}, p, len, newState, expected;

    function handleError(){
        var error_rule_depth;
        var errStr = '';

        // Return the rule stack depth where the nearest error rule can be found.
        // Return FALSE when no error recovery rule was found.
        // we have no rules now
        function locateNearestErrorRecoveryRule(state) {
            var stack_probe = stack.length - 1;
            var depth = 0;

            // try to recover from error
            for(;;) {
                // check for error recovery rule in this state
                if ((TERROR.toString()) in table[state]) {
                    return depth;
                }
                if (state === 0 || stack_probe < 2) {
                    return false; // No suitable error recovery rule available.
                }
                stack_probe -= 2; // popStack(1): [symbol, action]
                state = stack[stack_probe];
                ++depth;
            }
        }

        if (!recovering) {
            // first see if there's any chance at hitting an error recovery rule:
            error_rule_depth = locateNearestErrorRecoveryRule(state);

            // Report error
            expected = [];

            var tsym = lexer.yytext;
            var tok = self.terminals_[symbol] || symbol;
            var tloc = tsym ? tsym._loc : -1;
            var tpos = tloc != -1 ? "[" + tsym._loc + ":" + tsym._len + "]" : '[0:0]';

            if (lexer.showPosition) {
                errStr = 'Parse error at '+(tpos)+":\n"+lexer.showPosition()+"\nExpecting "+expected.join(', ') + ", got '" + (self.terminals_[symbol] || symbol)+ "'";
            } else {
                errStr = 'Parse error at '+(tpos)+": Unexpected " + (symbol == EOF ? "end of input" : ("'"+(tok)+"'"));
            }

            self.parseError(errStr, {
                lexer: lexer,
                text: lexer.match,
                token: tok,
                line: lexer.yylineno,
                expected: expected,
                recoverable: (error_rule_depth !== false)
            });
        } else if (preErrorSymbol !== EOF) {
            error_rule_depth = locateNearestErrorRecoveryRule(state);
        }

        // just recovered from another error
        if (recovering == 3) {
            if (symbol === EOF || preErrorSymbol === EOF) {
                throw new Error(errStr || 'Parsing halted while starting to recover from another error.');
            }

            // discard current lookahead and grab another
            yytext = lexer.yytext;
        }

        // try to recover from error
        if (error_rule_depth === false) {
            throw new Error(errStr || 'Parsing halted. No suitable error recovery rule available.');
        }
        popStack(error_rule_depth);
        preErrorSymbol = (symbol == TERROR ? null : symbol); // save the lookahead token
        symbol = TERROR;         // insert generic error symbol as new lookahead
        state = stack[stack.length-1];
        action = table[state] && table[state][TERROR];
        recovering = 3; // allow 3 real symbols to be shifted before reporting a new error
    }


    var __sym = this.symbols_;
    var __prod = this.productions_;

    while (true) {
        // retreive state number from top of stack
        state = stack[stack.length - 1];

        if (symbol === null || typeof symbol == 'undefined') {
            symbol = __sym[lexer.lex()] || EOF;
        }
        action = table[state] && table[state][symbol];

_handle_error:
        if (typeof action === 'undefined' || !action.length || !action[0]) {
            handleError();
        }

        switch (action[0]) {
            case 1: // shift
                stack.push(symbol);
                stack.push(action[1]); // push state
                vstack.push(lexer.yytext);
                
                symbol = null;
                if (!preErrorSymbol) { // normal execution/no error
                    yytext = lexer.yytext;
                    if (recovering > 0) {
                        recovering--;
                    }
                } else {
                    // error just occurred, resume old lookahead f/ before error
                    symbol = preErrorSymbol;
                    preErrorSymbol = null;
                }
                break;

            case 2:
                len = __prod[action[1]][1];
                // perform semantic action
                yyval.$ = vstack[vstack.length-len];
                r = this.performAction(yyval, yytext, yy, action[1], vstack);
                if (typeof r !== 'undefined') {
                    return r;
                }

                while(len > 0) {
                    stack.pop();
                    stack.pop();
                    vstack.pop();
                    len--;
                }

                stack.push(__prod[action[1]][0]);
                newState = table[stack[stack.length-2]][stack[stack.length-1]];
                stack.push(newState);
                vstack.push(yyval.$);
                break;

            case 3:
                return true;
        }
    }

    return true;
}};

function Parser () {
  this.yy = {};
}
Parser.prototype = parser;parser.Parser = Parser;
return new Parser;
})();


if (true) {
exports.parser = parser;
exports.Parser = parser.Parser;
exports.parse = function () { return parser.parse.apply(parser, arguments); };
}

/***/ }),
/* 10 */
/***/ (function(module, exports, __webpack_require__) {

function len$(a){
	return a && (a.len instanceof Function ? a.len() : a.length) || 0;
};
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

function idx$(a,b){
	return (b && b.indexOf) ? b.indexOf(a) : [].indexOf.call(a,b);
};
function iter$(a){ return a ? (a.toArray ? a.toArray() : a) : []; };
var self = {};




var helpers = __webpack_require__(2);
var constants = __webpack_require__(6);
var csscompiler = __webpack_require__(11);

var errors$ = __webpack_require__(7), ImbaParseError = errors$.ImbaParseError, ImbaTraverseError = errors$.ImbaTraverseError;
var Token = __webpack_require__(1).Token;
var SourceMap = __webpack_require__(14).SourceMap;

var imba$ = __webpack_require__(20), StyleRule = imba$.StyleRule, StyleTheme = imba$.StyleTheme, Color = imba$.Color;

var TSC_CLASS_HEAD = 'static $static$(){ this.prototype } $member$(){ this.constructor } ';
var TAG_NAMES = constants.TAG_NAMES;

var TAG_TYPES = {};
var TAG_ATTRS = {};

TAG_TYPES.HTML = "a abbr address area article aside audio b base bdi bdo big blockquote body br button canvas caption cite code col colgroup data datalist dd del details dfn div dl dt em embed fieldset figcaption figure footer form h1 h2 h3 h4 h5 h6 head header hr html i iframe img input ins kbd keygen label legend li link main map mark menu menuitem meta meter nav noscript object ol optgroup option output p param pre progress q rp rt ruby s samp script section select small source span strong style sub summary sup table tbody td textarea tfoot th thead time title tr track u ul var video wbr".split(" ");

TAG_TYPES.SVG = "circle defs ellipse g line linearGradient mask path pattern polygon polylineradialGradient rect stop svg text tspan".split(" ");

TAG_ATTRS.HTML = "accept accessKey action allowFullScreen allowTransparency alt async autoComplete autoFocus autoPlay cellPadding cellSpacing charSet checked className cols colSpan content contentEditable contextMenu controls coords crossOrigin data dateTime defer dir disabled download draggable encType form formNoValidate frameBorder height hidden href hrefLang htmlFor httpEquiv icon id label lang list loop max maxLength mediaGroup method min multiple muted name noValidate pattern placeholder poster preload radioGroup readOnly rel required role rows rowSpan sandbox scope scrollLeft scrolling scrollTop seamless selected shape size span spellCheck src srcDoc srcSet start step style tabIndex target title type useMap value width wmode";

TAG_ATTRS.SVG = "cx cy d dx dy fill fillOpacity fontFamily fontSize fx fy gradientTransform gradientUnits markerEnd markerMid markerStart offset opacity patternContentUnits patternUnits points preserveAspectRatio r rx ry spreadMethod stopColor stopOpacity stroke strokeDasharray strokeLinecap strokeOpacity strokeWidth textAnchor transform version viewBox x1 x2 x y1 y2 y";

var CUSTOM_EVENTS = {
	intersect: true,
	selection: true,
	resize: true
};

var AST = exports.AST = {};

var TREE_TYPE = {
	DYNAMIC: 1,
	STATIC: 2,
	SINGLE: 3,
	OPTLOOP: 4,
	LOOP: 5
};

var F = exports.F = {
	TAG_INITED: 2 ** 0,
	TAG_BUILT: 2 ** 1, 
	TAG_CUSTOM: 2 ** 2, 
	TAG_AWAKENED: 2 ** 3,
	TAG_MOUNTED: 2 ** 4,
	TAG_SCHEDULE: 2 ** 5, 
	TAG_SCHEDULED: 2 ** 6,
	TAG_FIRST_CHILD: 2 ** 7,
	TAG_LAST_CHILD: 2 ** 8,
	TAG_HAS_DYNAMIC_FLAGS: 2 ** 9,
	TAG_HAS_BRANCHES: 2 ** 10,
	TAG_HAS_LOOPS: 2 ** 11,
	TAG_HAS_DYNAMIC_CHILDREN: 2 ** 12,
	TAG_IN_BRANCH: 2 ** 13,
	TAG_BIND_MODEL: 2 ** 14,
	TAG_INDEXED: 2 ** 15, 
	TAG_KEYED: 2 ** 16, 
	
	
	EL_INITED: 2 ** 0,
	EL_HYDRATED: 2 ** 1,
	EL_DEHYDRATED: 2 ** 2,
	EL_AWAKENED: 2 ** 3,
	EL_MOUNTING: 2 ** 4,
	EL_MOUNTED: 2 ** 5,
	EL_SCHEDULE: 2 ** 6, 
	EL_SCHEDULED: 2 ** 7,
	EL_RENDERING: 2 ** 8,
	EL_RENDERED: 2 ** 9,
	
	
	DIFF_BUILT: 2 ** 0,
	DIFF_FLAGS: 2 ** 1,
	DIFF_ATTRS: 2 ** 2,
	DIFF_CHILDREN: 2 ** 3
};



var OP = exports.OP = function(op,l,r) {
	var o = String(op);
	if (o == '-' && !r && (l instanceof Num)) {
		l._value = -l.toNumber();
		return l;
	} else if (o == '+' && !r && (l instanceof Num)) {
		return l;
	};
	
	switch (o) {
		case '.': {
			
			if ((typeof r=='string'||r instanceof String)) { r = new Identifier(r) };
			
			
			if (r._value && r._value._value == 'new') {
				return new New(l).set({keyword: r});
			};
			
			return new Access(op,l,r);
			break;
		}
		case '=': {
			return new Assign(op,l,r);
			break;
		}
		case '?=': 
		case '||=': 
		case '&&=': {
			return new ConditionalAssign(op,l,r);
			break;
		}
		case '+=': 
		case '-=': 
		case '*=': 
		case '/=': 
		case '^=': 
		case '%=': 
		case '**=': {
			return new CompoundAssign(op,l,r);
			break;
		}
		case '?.': {
			if (r instanceof VarOrAccess) {
				r = r.value();
			};
			
			return new PropertyAccess(op,l,r);
			break;
		}
		case 'instanceof': 
		case 'isa': {
			return new InstanceOf(op,l,r);
			break;
		}
		case 'in': {
			return new In(op,l,r);
			break;
		}
		case 'typeof': {
			return new TypeOf(op,l,r);
			break;
		}
		case 'delete': {
			return new Delete(op,l,r);
			break;
		}
		case '--': 
		case '++': 
		case '!': 
		case '√': 
		case 'not': { // alias
			return new UnaryOp(op,l,r);
			break;
		}
		case '>': 
		case '<': 
		case '>=': 
		case '<=': 
		case '==': 
		case '===': 
		case '!=': 
		case '!==': {
			return new ComparisonOp(op,l,r);
			break;
		}
		case '..': 
		case '...': {
			return new Range(op,l,r);
			break;
		}
		default:
		
			return new Op(op,l,r);
	
	};
};

var OP_COMPOUND = exports.OP_COMPOUND = function(sym,op,l,r) {
	// console.log "?. soak operator",sym
	if (sym == '?.') {
		console.log("?. soak operator");
		return null;
	};
	if (sym == '?=' || sym == '||=' || sym == '&&=') {
		return new ConditionalAssign(op,l,r);
	} else {
		return new CompoundAssign(op,l,r);
	};
};

var PATHIFY = function(val) {
	if (val instanceof TagAttrValue) {
		val = val.value();
	};
	
	if (val instanceof ArgList) {
		val = val.values()[0];
	};
	
	while (val instanceof Parens){
		val = val.value();
	};
	
	if (val instanceof VarOrAccess) {
		val = val._variable || val.value();
	};
	
	
	if (val instanceof Access) {
		let left = val.left();
		let right = (val.right() instanceof Index) ? val.right().value() : val.right();
		
		if (left instanceof VarOrAccess) {
			left = left._variable || left.value();
		};
		
		if (right instanceof VarOrAccess) {
			right = right._variable || right.value();
		};
		
		if (val instanceof IvarAccess) {
			left || (left = val.scope__().context());
		};
		
		if (right instanceof Identifier) {
			right = helpers.singlequote(String(right.js()));
			right = new Str(right);
		};
		
		return [left,right];
	};
	
	return val;
};

var OPTS = {};
var ROOT = null;

var NODES = exports.NODES = [];

var C = function(node,opts) {
	return (typeof node == 'string') ? node : node.c(opts);
};

var M = function(val,mark,o) {
	if (mark == undefined) {
		mark = val;
	};
	
	if (mark && mark.startLoc) {
		val = C(val,o);
		let ref = STACK.incr('sourcePair');
		let start = mark.startLoc();
		let end = mark.endLoc();
		let m0 = '';
		let m1 = '';
		
		if (start == 0 || start > 0) {
			m0 = (end >= start) ? (("/*%" + start + "|" + ref + "$*/")) : (("/*%" + start + "$*/"));
		};
		
		if (end == 0 || end > 0) {
			m1 = (start >= 0) ? (("/*%" + end + "|" + ref + "$*/")) : (("/*%" + end + "$*/"));
		};
		return m0 + val + m1;
	};
	return C(val,o);
};

var MSTART = function() {
	var $0 = arguments, i = $0.length;
	var params = new Array(i>0 ? i : 0);
	while(i>0) params[i-1] = $0[--i];
	for (let i = 0, items = iter$(params), len = items.length, item; i < len; i++) {
		item = items[i];
		if ((typeof item=='number'||item instanceof Number)) {
			return item;
		};
		if (item && (item.startLoc instanceof Function)) {
			return item.startLoc();
		};
	};
	return null;
};

var MEND = function() {
	var $0 = arguments, i = $0.length;
	var params = new Array(i>0 ? i : 0);
	while(i>0) params[i-1] = $0[--i];
	for (let i = 0, items = iter$(params), len = items.length, item; i < len; i++) {
		item = items[i];
		if ((typeof item=='number'||item instanceof Number)) {
			return item;
		};
		if (item && (item.endLoc instanceof Function)) {
			return item.endLoc();
		};
	};
	return null;
};

var TYP = function(item,format) {
	let typ = item._options && item._options.datatype;
	if (typ) {
		if (format == 'jsdoc') {
			return ("/** @type \{" + M(typ,typ) + "\} */");
		} else {
			return (":" + M(typ,typ));
		};
	} else {
		return "";
	};
};

var LIT = function(val) {
	return new RawScript(val);
};

var SYM = function(val) {
	return new Symbol(val);
};

var KEY = function(val) {
	if (val instanceof Token) { val = val.value() };
	if ((typeof val=='string'||val instanceof String)) {
		if (val.match(/^[a-zA-Z\$\_]+[\d\w\$\_]*$/)) {
			val = new Identifier(val);
		} else {
			val = new Str(helpers.singlequote(String(val)));
		};
	};
	return val;
};



var STR = function(val) {
	if (val instanceof Str) { return val };
	return new Str(helpers.singlequote(String(val)));
};

var IF = function(cond,body,alt) {
	var node = new If(cond,body);
	if (alt) { node.addElse(alt) };
	return node;
};

var NODIFY = function(val) {
	if (val == null) {
		return new Nil();
	} else if (val == false) {
		return new False();
	} else if (val == true) {
		return new True();
	} else if ((typeof val=='string'||val instanceof String)) {
		return STR(val);
	} else if ((typeof val=='number'||val instanceof Number)) {
		return new Num(val);
	} else {
		return val;
	};
};

var FN = function(pars,body) {
	return new Func(pars,body);
};

var METH = function(pars,body) {
	return new ClosedFunc(pars,body);
};

var CALL = function(callee,pars) {
	// possibly return instead(!)
	if(pars === undefined) pars = [];
	return new Call(callee,pars);
};

var GET = function(left,right) { return OP('.',left,right); };

var CALLSELF = function(name,pars) {
	if(pars === undefined) pars = [];
	var ref = new Identifier(name);
	return new Call(OP('.',SELF,ref),pars);
};

var BLOCK = function() {
	return Block.wrap([].slice.call(arguments));
};

var WHILE = function(test,code) {
	return new While(test).addBody(code);
};



var SPLAT = exports.SPLAT = function(value) {
	return new Splat(value);
	
	
	
	
	
};

var SEMICOLON_TEST = /;(\s*\/\/.*)?[\n\s\t]*$/;
var RESERVED_TEST = /^(default|char|for)$/;


exports.parseError = self.parseError = function (str,o){
	// find nearest token
	var err;
	
	if (o.lexer) {
		var token = o.lexer.yytext;
		
		err = new ImbaParseError({message: str},{
			pos: o.lexer.pos,
			tokens: o.lexer.tokens,
			token: o.lexer.yytext,
			meta: o
		});
		
		throw err;
		
		
		
	};
	var e = new Error(str);
	e.lexer = o.lexer;
	e.options = o;
	throw e;
};

AST.c = function (obj){
	return (typeof obj == 'string') ? obj : obj.c();
};

AST.compileRaw = function (item){
	let o = '';
	if (item instanceof Array) {
		o = '[';
		for (let i = 0, items = iter$(item), len = items.length; i < len; i++) {
			o += AST.compileRaw(items[i]) + ',';
		};
		o = o.slice(0,-1) + ']';
	} else if (item instanceof Object) {
		o = '{';
		for (let v, i = 0, keys = Object.keys(item), l = keys.length, k; i < l; i++){
			// maybe quote?
			k = keys[i];v = item[k];o = +("" + k + ":" + AST.compileRaw(v) + ",");
		};
		o = o.slice(0,-1) + '}';
	} else {
		o = JSON.stringify(item);
	};
	return o;
};

AST.blk = function (obj){
	return (obj instanceof Array) ? Block.wrap(obj) : obj;
};

AST.sym = function (obj){
	// console.log "sym {obj}"
	return helpers.symbolize(String(obj));
};

AST.cary = function (ary){
	return ary.map(function(v) { return (typeof v == 'string') ? v : v.c(); });
};

AST.dump = function (obj,key){
	if (obj instanceof Array) {
		return obj.map(function(v) { return (v && v.dump) ? v.dump(key) : v; });
	} else if (obj && obj.dump) {
		return obj.dump();
	};
};

AST.compact = function (ary){
	if (ary instanceof ListNode) {
		return ary.compact();
	};
	
	
	return ary.filter(function(v) { return v != undefined && v != null; });
};

AST.reduce = function (res,ary){
	for (let i = 0, items = iter$(ary), len = items.length, v; i < len; i++) {
		v = items[i];
		(v instanceof Array) ? AST.reduce(res,v) : res.push(v);
	};
	return;
};

AST.flatten = function (ary,compact){
	if(compact === undefined) compact = false;
	var out = [];
	for (let i = 0, items = iter$(ary), len = items.length, v; i < len; i++) {
		v = items[i];
		(v instanceof Array) ? AST.reduce(out,v) : out.push(v);
	};
	return out;
};

AST.loc = function (item){
	if (!item) {
		return [0,0];
	} else if (item instanceof Token) {
		return item.region();
	} else if (item instanceof Node) {
		return item.loc();
	};
};

AST.parse = function (str,opts){
	if(opts === undefined) opts = {};
	var indent = str.match(/\t+/)[0];
	
	return Imbac.parse(str,opts);
};

AST.inline = function (str,opts){
	if(opts === undefined) opts = {};
	return this.parse(str,opts).body();
};

AST.node = function (typ,pars){
	if (typ == 'call') {
		if (pars[0].c() == 'return') {
			pars[0] = 'tata';
		};
		return new Call(pars[0],pars[1],pars[2]);
	};
};

AST.escapeComments = function (str){
	if (!str) { return '' };
	return str;
};


var shortRefCache = [];

AST.counterToShortRef = function (nr){
	var base = "A".charCodeAt(0);
	
	while (shortRefCache.length <= nr){
		var num = shortRefCache.length + 1;
		var str = "";
		
		while (true){
			num -= 1;
			str = String.fromCharCode(base + (num % 26)) + str;
			num = Math.floor(num / 26);
			if (num <= 0) { break; };
		};
		
		shortRefCache.push(str.toLowerCase());
	};
	
	return shortRefCache[nr];
};

AST.truthy = function (node){
	
	if (node instanceof True) {
		return true;
	};
	
	if (node instanceof False) {
		return false;
	};
	
	if (node.isTruthy) {
		return node.isTruthy();
	};
	
	return undefined;
};

function Indentation(a,b){
	this._open = a;
	this._close = b;
	this;
};

exports.Indentation = Indentation; // export class 
Indentation.prototype.open = function(v){ return this._open; }
Indentation.prototype.setOpen = function(v){ this._open = v; return this; };
Indentation.prototype.close = function(v){ return this._close; }
Indentation.prototype.setClose = function(v){ this._close = v; return this; };

Indentation.prototype.isGenerated = function (){
	return this._open && this._open.generated;
};

Indentation.prototype.aloc = function (){
	return this._open && this._open._loc || 0;
};

Indentation.prototype.bloc = function (){
	return this._close && this._close._loc || 0;
};

Indentation.prototype.startLoc = function (){
	return this.aloc();
};

Indentation.prototype.endLoc = function (){
	return this.bloc();
};


Indentation.prototype.wrap = function (str){
	var om = this._open && this._open._meta;
	var pre = om && om.pre || '';
	var post = om && om.post || '';
	var esc = AST.escapeComments;
	var out = this._close;
	
	
	
	str = post.replace(/^\n/,'') + str;
	
	str = str.replace(/^/g,"\t").replace(/\n/g,"\n\t").replace(/\n\t$/g,"\n");
	
	str = pre + '\n' + str;
	if (out instanceof Terminator) { str += out.c() };
	if (str[str.length - 1] != '\n') { str = str + '\n' };
	
	return str;
};

var INDENT = new Indentation({},{});

function Stash(){
	this._entities = [];
};

Stash.prototype.add = function (item){
	this._entities.unshift(item);
	return this;
};

Stash.prototype.pluck = function (item){
	var match = null;
	for (let i = 0, items = iter$(this._entities), len = items.length, entity; i < len; i++) {
		entity = items[i];
		if (entity == item || (entity instanceof item)) {
			match = entity;
			this._entities.splice(i,1);
			return match;
		};
	};
	return null;
};


function Stack(){
	this.reset();
};

exports.Stack = Stack; // export class 
Stack.prototype.loglevel = function(v){ return this._loglevel; }
Stack.prototype.setLoglevel = function(v){ this._loglevel = v; return this; };
Stack.prototype.nodes = function(v){ return this._nodes; }
Stack.prototype.setNodes = function(v){ this._nodes = v; return this; };
Stack.prototype.scopes = function(v){ return this._scopes; }
Stack.prototype.setScopes = function(v){ this._scopes = v; return this; };
Stack.prototype.root = function(v){ return this._root; }
Stack.prototype.setRoot = function(v){ this._root = v; return this; };
Stack.prototype.state = function(v){ return this._state; }
Stack.prototype.setState = function(v){ this._state = v; return this; };
Stack.prototype.semanticTokens = function(v){ return this._semanticTokens; }
Stack.prototype.setSemanticTokens = function(v){ this._semanticTokens = v; return this; };
Stack.prototype.theme = function(v){ return this._theme; }
Stack.prototype.setTheme = function(v){ this._theme = v; return this; };

Stack.prototype.reset = function (){
	this._nodes = [];
	this._scoping = [];
	this._scopes = [];
	this._stash = new Stash(this);
	this._loglevel = 3;
	this._counter = 0;
	this._counters = {};
	this._options = {};
	this._state = {};
	this._es6 = null;
	this._es5 = null;
	this._optlevel = null;
	this._tag = null;
	this._sfcid = null;
	this._semanticTokens = [];
	this._theme = new StyleTheme();
	return this;
};

Stack.prototype.registerSemanticToken = function (token,kind,modifiers){
	if (token instanceof Node) {
		kind || (kind = token._variable);
		token = token._value;
	};
	
	if (kind instanceof Variable) {
		token._kind = kind.type();
		token._level = kind.scope().level();
		token._scope = kind.scope().kind();
	} else {
		token._kind = kind;
	};
	return this._semanticTokens.push(token);
};


Stack.prototype.incr = function (name){
	this._counters[name] || (this._counters[name] = 0);
	return this._counters[name] += 1;
};

Stack.prototype.decr = function (name){
	this._counters[name] || (this._counters[name] = 0);
	return this._counters[name] -= 1;
};

Stack.prototype.generateId = function (ns){
	if(ns === undefined) ns = 'oid';
	return AST.counterToShortRef(STACK.incr('oid'));
};

Stack.prototype.sfcid = function (){
	return this._sfcid || (this._sfcid = this._options.sourcePath && helpers.identifierForPath(this._options.sourcePath));
};

Stack.prototype.fid = function (){
	return this.sfcid();
};

Stack.prototype.stash = function (){
	return this._stash;
};

Stack.prototype.set = function (obj){
	this._options || (this._options = {});
	for (let v, i = 0, keys = Object.keys(obj), l = keys.length, k; i < l; i++){
		k = keys[i];v = obj[k];this._options[k] = v;
	};
	return this;
};


Stack.prototype.option = function (key,val){
	if (val != undefined) {
		this._options || (this._options = {});
		this._options[key] = val;
		return this;
	};
	
	return this._options && this._options[key];
};

Stack.prototype.platform = function (){
	return this._options.target;
};

Stack.prototype.filename = function (){
	return this._options.filename;
};

Stack.prototype.sourcePath = function (){
	return this._options.sourcePath;
};


Stack.prototype.es6 = function (){
	return (this._es6 == null) ? (this._es6 = !(!(this._options.es6 || this._options.es2015 || this.env('IMBA_ES6')))) : this._es6;
};

Stack.prototype.es5 = function (){
	// TODO remove
	return (this._es5 == null) ? (this._es5 = !(!(this._options.es5 || this.env('IMBA_ES5')))) : this._es5;
};

Stack.prototype.hasImplicitSelf = function (){
	return true;
	
};

Stack.prototype.tsc = function (){
	return this.platform() == 'tsc';
};

Stack.prototype.format = function (){
	return this._options.format || 'esm';
};

Stack.prototype.cjs = function (){
	return this.format() == 'cjs' || (!this._options.format && this.platform() == 'node');
};

Stack.prototype.esm = function (){
	return this.format() == 'esm';
};

Stack.prototype.autocall = function (){
	return !this.option('explicitParens');
	
};

Stack.prototype.optlevel = function (){
	return (this._optlevel == null) ? (this._optlevel = ((this._options.conservative || this.env('IMBA_CONSERVATIVE')) ? 0 : ((this._options.optlevel || 9)))) : this._optlevel; 
};

Stack.prototype.env = function (key){
	var e;
	var val = this._options[("ENV_" + key)];
	if (val != undefined) { return val };
	
	
	if (F[key] !== undefined) {
		return F[key];
	};
	
	var lowercased = key.toLowerCase();
	
	if (this._options[lowercased] != undefined) {
		return this._options[lowercased];
	};
	
	
	if (lowercased == 'es6') {
		return this.es6();
	};
	
	if (lowercased == 'es5') {
		return this.es5();
	};
	
	if (this.platform() && idx$(key,['WEB','NODE','WEBWORKER']) >= 0) {
		return this.platform().toUpperCase() == key;
	};
	
	
	
	if (e = this._options.env) {
		if (e.hasOwnProperty(key)) {
			return e[key];
		} else if (e.hasOwnProperty(key.toLowerCase())) {
			return e[key.toLowerCase()];
		};
	};
	
	if (false) {};
	
	return undefined;
};


Stack.prototype.addScope = function (scope){
	this._scopes.push(scope);
	return this;
};

Stack.prototype.traverse = function (node){
	return this;
};

Stack.prototype.push = function (node){
	this._nodes.push(node);
	
	return this;
};

Stack.prototype.pop = function (node){
	this._nodes.pop(); 
	return this;
};

Stack.prototype.parent = function (){
	return this._nodes[this._nodes.length - 2];
};

Stack.prototype.current = function (){
	return this._nodes[this._nodes.length - 1];
};

Stack.prototype.up = function (test){
	test || (test = function(v) { return !(v instanceof VarOrAccess); });
	
	if (typeof test == 'number') {
		return this._nodes[this._nodes.length - (1 + test)];
	};
	
	var i = this._nodes.length - 2;
	
	if (test.prototype instanceof Node) {
		while (i >= 0){
			var node = this._nodes[i--];
			if (node instanceof test) { return node };
		};
		return null;
	};
	
	while (i >= 0){
		node = this._nodes[i];
		if (test(node)) { return node };
		i -= 1;
	};
	return null;
};

Stack.prototype.relative = function (node,offset){
	if(offset === undefined) offset = 0;
	var idx = this._nodes.indexOf(node);
	return (idx >= 0) ? this._nodes[idx + offset] : null;
};

Stack.prototype.scope = function (lvl){
	if(lvl === undefined) lvl = 0;
	var i = this._nodes.length - 1 - lvl;
	while (i >= 0){
		var node = this._nodes[i];
		if (node._scope) { return node._scope };
		i -= 1;
	};
	return null;
};

Stack.prototype.scopes = function (){
	// include deeper scopes as well?
	var scopes = [];
	var i = this._nodes.length - 1;
	while (i >= 0){
		var node = this._nodes[i];
		if (node._scope) { scopes.push(node._scope) };
		i -= 1;
	};
	return scopes;
};

Stack.prototype.method = function (){
	return this.up(MethodDeclaration);
};

Stack.prototype.block = function (){
	return this.up(Block);
};

Stack.prototype.blockpart = function (){
	let i = this._nodes.length - 1;
	while (i){
		if (this._nodes[i - 1] instanceof Block) {
			return this._nodes[i];
		};
		i--;
	};
	return;
};

Stack.prototype.isExpression = function (){
	var i = this._nodes.length - 1;
	while (i >= 0){
		var node = this._nodes[i];
		
		if ((node instanceof Code) || (node instanceof Loop)) {
			return false;
		};
		if (node.isExpression()) {
			return true;
		};
		
		i -= 1;
	};
	return false;
};

Stack.prototype.toString = function (){
	return ("Stack(" + this._nodes.join(" -> ") + ")");
};

Stack.prototype.isAnalyzing = function (){
	return this._analyzing;
};

Stack.prototype.scoping = function (){
	return this._nodes.filter(function(n) { return n._scope; }).map(function(n) { return n._scope; });
};

Stack.prototype.currentRegion = function (){
	let l = this._nodes.length;
	let node = this._nodes[--l];
	return node && [node.startLoc(),node.endLoc()];
};


var STACK = exports.STACK = new Stack();



function Node(){
	this.setup();
	this;
};

exports.Node = Node; // export class 
Node.prototype.o = function(v){ return this._o; }
Node.prototype.setO = function(v){ this._o = v; return this; };
Node.prototype.options = function(v){ return this._options; }
Node.prototype.setOptions = function(v){ this._options = v; return this; };
Node.prototype.traversed = function(v){ return this._traversed; }
Node.prototype.setTraversed = function(v){ this._traversed = v; return this; };

Node.prototype.safechain = function (){
	return false;
};

Node.prototype.oid = function (){
	return this._oid || (this._oid = STACK.generateId(''));
};

Node.prototype.fid = function (){
	return STACK.fid();
};


Node.prototype.slf = function (){
	return this.scope__().context();
};

Node.prototype.p = function (){
	// allow controlling this from CLI
	if (STACK.loglevel() > 0) {
		console.log.apply(console,arguments);
	};
	return this;
};

Node.prototype.typeName = function (){
	return this.constructor.name;
};

Node.prototype.namepath = function (){
	return this.typeName();
};

Node.prototype.setup = function (){
	this._expression = false;
	this._traversed = false;
	this._parens = false;
	this._cache = null;
	this._value = null;
	return this;
};

Node.prototype.setStartLoc = function (loc){
	this._startLoc = loc;
	return this;
};

Node.prototype.setEndLoc = function (loc){
	this._endLoc = loc;
	return this;
};

Node.prototype.setRegion = function (loc){
	if (loc instanceof Node) {
		loc = loc.region();
	};
	
	if (loc instanceof Array) {
		this._startLoc = loc[0];
		this._endLoc = loc[1];
	};
	return this;
};

Node.prototype.setEnds = function (start,end){
	if (end && end.endLoc) {
		this._endLoc = end.endLoc();
	};
	if (start && start.startLoc) {
		this._startLoc = start.startLoc();
	};
	return this;
};

Node.prototype.startLoc = function (){
	return this._startLoc;
};

Node.prototype.endLoc = function (){
	return this._endLoc;
};

Node.prototype.set = function (obj){
	this._options || (this._options = {});
	for (let v, i = 0, keys = Object.keys(obj), l = keys.length, k; i < l; i++){
		k = keys[i];v = obj[k];this._options[k] = v;
	};
	return this;
};


Node.prototype.option = function (key,val){
	if (val != undefined) {
		this._options || (this._options = {});
		this._options[key] = val;
		return this;
	};
	
	return this._options && this._options[key];
};

Node.prototype.o = function (){
	return this._options || (this._options = {});
};

Node.prototype.keyword = function (){
	return this._keyword || (this._options && this._options.keyword);
};

Node.prototype.datatype = function (){
	return this._options ? this._options.datatype : null;
};

Node.prototype.configure = function (obj){
	return this.set(obj);
};

Node.prototype.region = function (){
	return [0,0];
};

Node.prototype.loc = function (){
	return [0,0];
};

Node.prototype.token = function (){
	return null;
};

Node.prototype.compile = function (){
	return this;
};

Node.prototype.visit = function (){
	return this;
};

Node.prototype.stack = function (){
	return STACK;
};

Node.prototype.isString = function (){
	return false;
};

Node.prototype.isPrimitive = function (deep){
	return false;
};

Node.prototype.isReserved = function (){
	return false;
};



Node.prototype.traverse = function (o){
	if (this._traversed) {
		return this;
	};
	
	this._traversed = true;
	let prev;
	if (o) {
		prev = STACK.state();
		STACK.setState(o);
	};
	STACK.push(this);
	this.visit(STACK,STACK.state());
	STACK.pop(this);
	if (o) {
		STACK.setState(prev);
	};
	return this;
};

Node.prototype.inspect = function (){
	return {type: this.constructor.toString()};
};

Node.prototype.js = function (o){
	return "NODE";
};

Node.prototype.toString = function (){
	return ("" + (this.constructor.name));
};


Node.prototype.consume = function (node){
	if (node instanceof TagLike) {
		return node.register(this);
	};
	
	if (node instanceof PushAssign) {
		node.register(this);
		return new PushAssign(node.op(),node.left(),this);
	};
	
	if (node instanceof Assign) {
		// node.right = self
		return OP(node.op(),node.left(),this);
	} else if (node instanceof Op) {
		return OP(node.op(),node.left(),this);
	} else if (node instanceof Return) {
		return new Return(this);
	};
	return this;
};

Node.prototype.toExpression = function (){
	this._expression = true;
	return this;
};

Node.prototype.forceExpression = function (){
	this._expression = true;
	return this;
};

Node.prototype.isExpressable = function (){
	return true;
};

Node.prototype.isExpression = function (){
	return this._expression || false;
};

Node.prototype.hasSideEffects = function (){
	return true;
};

Node.prototype.isUsed = function (){
	return true;
};

Node.prototype.shouldParenthesize = function (){
	return false;
};

Node.prototype.shouldParenthesizeInTernary = function (){
	return true;
};

Node.prototype.block = function (){
	return Block.wrap([this]);
};

Node.prototype.node = function (){
	return this;
};

Node.prototype.scope__ = function (){
	return STACK.scope();
};

Node.prototype.up = function (){
	return STACK.parent();
};

Node.prototype.util = function (){
	return Util;
};

Node.prototype.receiver = function (){
	return this;
};

Node.prototype.indented = function (a,b){
	
	if (a instanceof Indentation) {
		this._indentation = a;
		return this;
	};
	
	
	if (b instanceof Array) {
		this.add(b[0]);
		b = b[1];
	};
	
	
	this._indentation || (this._indentation = (a && b) ? new Indentation(a,b) : INDENT);
	return this;
};

Node.prototype.prebreak = function (term){
	if(term === undefined) term = '\n';
	return this;
};

Node.prototype.invert = function (){
	return OP('!',this);
};

Node.prototype.cache = function (o){
	if(o === undefined) o = {};
	this._cache = o;
	o.var = (o.scope || this.scope__()).temporary(this,o);
	o.lookups = 0;
	return this;
};

Node.prototype.cachevar = function (){
	return this._cache && this._cache.var;
};

Node.prototype.decache = function (){
	if (this._cache) {
		this.cachevar().free();
		this._cache = null;
	};
	return this;
};


Node.prototype.alias = function (){
	return null;
};

Node.prototype.warn = function (text,opts){
	if(opts === undefined) opts = {};
	opts.message = text;
	opts.loc || (opts.loc = this.loc());
	this.scope__().root().warn(opts);
	return this;
};

Node.prototype.c = function (o){
	var indent;
	var s = STACK;
	var ch = this._cache;
	if (ch && ch.cached) { return this.c_cached(ch) };
	
	s.push(this);
	if (o && o.expression) this.forceExpression();
	
	if (o && o.indent) {
		this._indentation || (this._indentation = INDENT);
	};
	
	var out = this.js(s,o);
	
	var paren = this.shouldParenthesize();
	
	s.pop(this);
	
	if (out == undefined) {
		return out;
	};
	
	if (indent = this._indentation) {
		out = indent.wrap(out,o);
		this;
	};
	
	
	if (paren) { out = ("(" + out + ")") };
	if ((o && o.braces) || (this._options && this._options.braces)) {
		if (indent) {
			out = '{' + out + '}';
		} else {
			out = '{ ' + out + ' }';
		};
	};
	
	if (ch = this._cache) {
		if (!ch.manual) { out = ("" + (ch.var.c()) + " = " + out) };
		var par = s.current();
		if (par instanceof ValueNode) { par = par.node() };
		if ((par instanceof Access) || (par instanceof Op)) { out = '(' + out + ')' }; 
		ch.cached = true;
	};
	
	if (OPTS.sourceMap && (!o || o.mark !== false)) {
		out = M(out,this);
	};
	return out;
};

Node.prototype.c_cached = function (cache){
	cache.lookups++;
	if (cache.uses == cache.lookups) { cache.var.free() };
	return cache.var.c(); 
};

function ValueNode(value){
	this.setup();
	this._value = this.load(value);
};

subclass$(ValueNode,Node);
exports.ValueNode = ValueNode; // export class 
ValueNode.prototype.value = function(v){ return this._value; }
ValueNode.prototype.setValue = function(v){ this._value = v; return this; };

ValueNode.prototype.startLoc = function (){
	return this._value && this._value.startLoc  &&  this._value.startLoc();
};

ValueNode.prototype.endLoc = function (){
	return this._value && this._value.endLoc  &&  this._value.endLoc();
};

ValueNode.prototype.load = function (value){
	return value;
};

ValueNode.prototype.js = function (o){
	return (typeof this._value == 'string') ? this._value : this._value.c();
};

ValueNode.prototype.visit = function (){
	
	if (this._value instanceof Node) { this._value.traverse() }; 
	return this;
};

ValueNode.prototype.region = function (){
	return [this._value._loc,this._value._loc + this._value._len];
};

function ExpressionNode(){ return ValueNode.apply(this,arguments) };

subclass$(ExpressionNode,ValueNode);
exports.ExpressionNode = ExpressionNode; // export class 


function AssertionNode(){ return ValueNode.apply(this,arguments) };

subclass$(AssertionNode,ValueNode);
exports.AssertionNode = AssertionNode; // export class 
AssertionNode.prototype.js = function (o){
	let op = this._value;
	let out = [];
	
	if ((op instanceof Op) && !(op instanceof Access)) {
		let l = op.left();
		let r = op.right();
		
		out.push(l.cache().c(o));
		out.push(helpers.singlequote(op._op));
		out.push(r.cache().c(o));
		out = [("imba.$a=[" + out.join(',') + "]")];
		out.push(op.c(o));
		
		
		
	} else {
		out.push('imba.$a=null');
		out.push(op.c(o));
	};
	return '(' + out.join(',') + ")"; 
	
};

function Statement(){ return ValueNode.apply(this,arguments) };

subclass$(Statement,ValueNode);
exports.Statement = Statement; // export class 
Statement.prototype.isExpressable = function (){
	return false;
};


function Meta(){ return ValueNode.apply(this,arguments) };

subclass$(Meta,ValueNode);
exports.Meta = Meta; // export class 
Meta.prototype.isPrimitive = function (deep){
	return true;
};

function Comment(){ return Meta.apply(this,arguments) };

subclass$(Comment,Meta);
exports.Comment = Comment; // export class 
Comment.prototype.visit = function (){
	var m, block, next;
	if (this._value.type() == 'HERECOMMENT') {
		let raw = this._value._value;
		let line = raw.slice(0,raw.indexOf('\n')).trim();
		
		if (m = line.match(/^(css|less|stylus|sass|scss)( scoped)?/)) {
			var style = {
				content: raw.slice(raw.indexOf('\n')),
				scoped: !(!m[2]),
				type: m[1],
				attrs: {}
			};
			
			this.scope__().root().styles().push(style);
			if (m[2]) { this.stack().set({hasScopedStyles: true}) };
		};
	};
	
	if (block = this.up()) {
		var idx = block.indexOf(this) + 1;
		if (block.index(idx) instanceof Terminator) { idx += 1 };
		if (next = block.index(idx)) {
			next._desc = this;
		};
	};
	
	return this;
};

Comment.prototype.toDoc = function (){
	return helpers.normalizeIndentation("" + this._value._value);
};

Comment.prototype.toJSON = function (){
	return helpers.normalizeIndentation("" + this._value._value);
};

Comment.prototype.c = function (o){
	if (STACK.option('comments') == false) { return "" };
	
	var v = this._value._value;
	if (o && o.expression || v.match(/\n/) || this._value.type() == 'HERECOMMENT') { // multiline?
		var out = v.replace(/\*\//g,'\\*\\/').replace(/\/\*/g,'\\/\\*');
		return ("/*" + out + "*/");
	} else if (v.match(/\@(type|param)/)) {
		return ("/** " + v + " */");
	} else {
		return ("// " + v);
	};
};

function Terminator(v){
	this._value = v;
	this;
};

subclass$(Terminator,Meta);
exports.Terminator = Terminator; // export class 
Terminator.prototype.traverse = function (){
	return this;
};

Terminator.prototype.loc = function (){
	return [this._value._loc,this._value._loc + this._value._value.length];
};

Terminator.prototype.startLoc = function (){
	return this._value.startLoc ? this._value.startLoc() : (-1);
};

Terminator.prototype.endLoc = function (){
	return this._value._value ? ((this.startLoc() + this._value._value.length)) : (-1);
};

Terminator.prototype.c = function (){
	let val = this._value.c();
	if (STACK.option('comments') == false) {
		val = val.replace(/\/\/.*$/gm,'');
	};
	
	if (STACK.tsc() && (val.length > 1 || this._first)) {
		return M(val.replace(/^[\t ]+/gm,''),this);
	};
	
	return val.replace(/^[\t ]+/gm,'');
};

function Newline(v){
	this._traversed = false;
	this._value = v || '\n';
};

subclass$(Newline,Terminator);
exports.Newline = Newline; // export class 
Newline.prototype.c = function (){
	return this._value;
	
};



function Index(){ return ValueNode.apply(this,arguments) };

subclass$(Index,ValueNode);
exports.Index = Index; // export class 
Index.prototype.cache = function (o){
	if(o === undefined) o = {};
	return this._value.cache(o);
};

Index.prototype.js = function (o){
	return this._value.c();
};

function ListNode(list){
	this.setup();
	this._nodes = this.load(list || []);
	this._indentation = null;
};


subclass$(ListNode,Node);
exports.ListNode = ListNode; // export class 
ListNode.prototype.nodes = function(v){ return this._nodes; }
ListNode.prototype.setNodes = function(v){ this._nodes = v; return this; };

ListNode.prototype.list = function (){
	return this._nodes;
};

ListNode.prototype.compact = function (){
	this._nodes = AST.compact(this._nodes);
	return this;
};

ListNode.prototype.load = function (list){
	return list;
};

ListNode.prototype.concat = function (other){
	// need to store indented content as well?
	this._nodes = this.nodes().concat((other instanceof Array) ? other : other.nodes());
	return this;
};

ListNode.prototype.swap = function (item,other){
	var idx = this.indexOf(item);
	if (idx >= 0) { this.nodes()[idx] = other };
	return this;
};

ListNode.prototype.push = function (item){
	this._nodes.push(item);
	return this;
};

ListNode.prototype.pop = function (){
	var end = this._nodes.pop();
	return end;
};

ListNode.prototype.add = function (item,o){
	let idx = null;
	if (o && o.before) {
		idx = this._nodes.indexOf(o.before);
		if (idx == -1) { idx = null };
	} else if (o && o.after) {
		idx = this._nodes.indexOf(o.after) + 1;
		if (idx == 0) { idx = null };
		if (idx >= 1) {
			while (this._nodes[idx] instanceof Meta){
				idx++;
			};
		};
	} else if ((typeof o=='number'||o instanceof Number)) {
		idx = o;
	};
	
	if (idx !== null) {
		(item instanceof Array) ? this._nodes.splice.apply(this._nodes,[].concat([idx,0], Array.from(item))) : this._nodes.splice(idx,0,item);
	} else {
		(item instanceof Array) ? this._nodes.push.apply(this._nodes,item) : this._nodes.push(item);
	};
	return this;
};

ListNode.prototype.unshift = function (item,br){
	if (br) { this._nodes.unshift(BR) };
	this._nodes.unshift(item);
	return this;
};


ListNode.prototype.slice = function (a,b){
	return new this.constructor(this._nodes.slice(a,b));
};

ListNode.prototype.break = function (br,pre){
	if(pre === undefined) pre = false;
	if (typeof br == 'string') { br = new Terminator(br) };
	pre ? this.unshift(br) : this.push(br);
	return this;
};

ListNode.prototype.some = function (cb){
	for (let i = 0, items = iter$(this._nodes), len = items.length, node; i < len; i++) {
		node = items[i];
		if (cb(node)) { return true };
	};
	return false;
};

ListNode.prototype.every = function (cb){
	for (let i = 0, items = iter$(this._nodes), len = items.length, node; i < len; i++) {
		node = items[i];
		if (!cb(node)) { return false };
	};
	return true;
};


ListNode.prototype.values = function (){
	return this._nodes.filter(function(item) { return !(item instanceof Meta); });
};

ListNode.prototype.filter = function (cb){
	return this._nodes.filter(cb);
};

ListNode.prototype.pluck = function (cb){
	var item = this.filter(cb)[0];
	if (item) { this.remove(item) };
	return item;
};

ListNode.prototype.indexOf = function (item){
	return this._nodes.indexOf(item);
};

ListNode.prototype.index = function (i){
	return this._nodes[i];
};

ListNode.prototype.remove = function (item){
	var idx = this._nodes.indexOf(item);
	if (idx >= 0) { this._nodes.splice(idx,1) };
	return this;
};

ListNode.prototype.removeAt = function (idx){
	var item = this._nodes[idx];
	if (idx >= 0) { this._nodes.splice(idx,1) };
	return item;
};


ListNode.prototype.replace = function (original,replacement){
	var idx = this._nodes.indexOf(original);
	if (idx >= 0) {
		if (replacement instanceof Array) {
			this._nodes.splice.apply(this._nodes,[].concat([idx,1], Array.from(replacement)));
		} else {
			this._nodes[idx] = replacement;
		};
	};
	return this;
};

ListNode.prototype.first = function (){
	return this._nodes[0];
};

ListNode.prototype.last = function (){
	var i = this._nodes.length;
	while (i){
		i = i - 1;
		var v = this._nodes[i];
		if (!((v instanceof Meta))) { return v };
	};
	return null;
};

ListNode.prototype.map = function (fn){
	return this._nodes.map(fn);
};

ListNode.prototype.forEach = function (fn){
	return this._nodes.forEach(fn);
};

ListNode.prototype.remap = function (fn){
	this._nodes = this.map(fn);
	return this;
};

ListNode.prototype.count = function (){
	return this._nodes.length;
};

ListNode.prototype.len = function (){
	return this._nodes.length;
};

ListNode.prototype.realCount = function (){
	var k = 0;
	for (let i = 0, items = iter$(this._nodes), len = items.length, node; i < len; i++) {
		node = items[i];
		if (node && !(node instanceof Meta)) { k++ };
	};
	return k;
};

ListNode.prototype.isEmpty = function (){
	return this.realCount() == 0;
};

ListNode.prototype.visit = function (){
	let items = this._nodes;
	let i = 0;
	
	while (i < items.length){
		let item = items[i];
		if (item.traverse) {
			let res = item.traverse();
			if (res != item) {
				if (res instanceof Array) {
					items.splice.apply(items,[].concat([i,1], Array.from(res)));
					continue;
				};
			};
		};
		i++;
	};
	return this;
};

ListNode.prototype.isExpressable = function (){
	for (let i = 0, items = iter$(this.nodes()), len = items.length, node; i < len; i++) {
		node = items[i];
		if (node && !node.isExpressable()) { return false };
	};
	
	return true;
};

ListNode.prototype.toArray = function (){
	return this._nodes;
};

ListNode.prototype.delimiter = function (){
	return this._delimiter || ",";
};

ListNode.prototype.js = function (o,pars){
	if(!pars||pars.constructor !== Object) pars = {};
	var nodes = pars.nodes !== undefined ? pars.nodes : this._nodes;
	var delim = ',';
	var express = delim != ';';
	var last = this.last();
	
	var i = 0;
	var l = nodes.length;
	var str = "";
	
	for (let j = 0, items = iter$(nodes), len = items.length, arg; j < len; j++) {
		arg = items[j];
		var part = (typeof arg == 'string') ? arg : ((arg ? arg.c({expression: express}) : ''));
		
		str += part;
		if (part && (!express || arg != last) && !(arg instanceof Meta)) { str += delim };
	};
	
	return str;
};

ListNode.prototype.indented = function (a,b){
	if (a instanceof Indentation) {
		this._indentation = a;
		return this;
	};
	
	this._indentation || (this._indentation = (a && b) ? new Indentation(a,b) : INDENT);
	return this;
};

ListNode.prototype.endLoc = function (){
	var $1;
	if (this._endLoc) {
		return this._endLoc;
	};
	
	var i = this._nodes.length;
	let last = this._nodes[i - 1];
	return ($1 = last) && $1.endLoc  &&  $1.endLoc();
};


function ArgList(){ return ListNode.apply(this,arguments) };

subclass$(ArgList,ListNode);
exports.ArgList = ArgList; // export class 
ArgList.prototype.consume = function (node){
	if (node instanceof TagLike) {
		this._nodes = this._nodes.map(function(child) {
			if (!(child instanceof Meta)) { // and !(child isa Assign)
				return child.consume(node);
			} else {
				return child;
			};
		});
		return this;
	};
	return ArgList.prototype.__super__.consume.apply(this,arguments);
};

function AssignList(){ return ArgList.apply(this,arguments) };

subclass$(AssignList,ArgList);
exports.AssignList = AssignList; // export class 
AssignList.prototype.concat = function (other){
	if (this._nodes.length == 0 && (other instanceof AssignList)) {
		return other;
	} else {
		AssignList.prototype.__super__.concat.call(this,other);
	};
	
	
	return this;
};


function Block(list){
	this.setup();
	this._nodes = list || [];
	this._head = null;
	this._indentation = null;
};

subclass$(Block,ListNode);
exports.Block = Block; // export class 
Block.prototype.head = function(v){ return this._head; }
Block.prototype.setHead = function(v){ this._head = v; return this; };

Block.prototype.startLoc = function (){
	return this._indentation ? this._indentation.startLoc() : (Block.prototype.__super__.startLoc.apply(this,arguments));
};

Block.prototype.endLoc = function (){
	return this._indentation ? this._indentation.endLoc() : (Block.prototype.__super__.endLoc.apply(this,arguments));
};

Block.wrap = function (ary){
	if (!((ary instanceof Array))) {
		throw new SyntaxError("what");
	};
	return (ary.length == 1 && (ary[0] instanceof Block)) ? ary[0] : new Block(ary);
};

Block.prototype.visit = function (stack){
	if (this._scope) { this._scope.visit() };
	
	if (stack && stack._tag) {
		this._tag = stack._tag;
	};
	
	for (let i = 0, items = iter$(this._nodes), len = items.length, node; i < len; i++) {
		// allow replacing blocks?
		node = items[i];
		node && node.traverse();
	};
	
	return this;
};

Block.prototype.block = function (){
	return this;
};

Block.prototype.collectDecorators = function (){
	var decorators;
	if (decorators = this._decorators) {
		this._decorators = null;
		return decorators;
	};
};

Block.prototype.loc = function (){
	// rather indents, no?
	var opt, ind;
	if (opt = this.option('ends')) {
		var a = opt[0].loc();
		var b = opt[1].loc();
		
		if (!a) { this.p(("no loc for " + (opt[0]))) };
		if (!b) { this.p(("no loc for " + (opt[1]))) };
		
		return [a[0],b[1]];
	};
	
	if (ind = this._indentation) {
		if (ind.aloc() != -1) {
			return [ind.aloc(),ind.bloc()];
		};
	};
	
	a = this._nodes[0];
	b = this._nodes[this._nodes.length - 1];
	
	return [a && a.loc()[0] || 0,b && b.loc()[1] || 0];
};


Block.prototype.unwrap = function (){
	var ary = [];
	for (let i = 0, items = iter$(this.nodes()), len = items.length, node; i < len; i++) {
		node = items[i];
		if (node instanceof Block) {
			ary.push.apply(ary,node.unwrap());
		} else {
			ary.push(node);
		};
	};
	return ary;
};



Block.prototype.compile = function (o){
	if(o === undefined) o = {};
	var root = new Root(this,o);
	return root.compile(o);
};



Block.prototype.analyze = function (o){
	if(o === undefined) o = {};
	return this;
};

Block.prototype.cpart = function (node){
	if (node === BR0) { return "" };
	var out = (typeof node == 'string') ? node : ((node ? node.c() : ""));
	if (out == null || out == undefined || out == "") { return "" };
	
	if (out instanceof Array) {
		var str = "";
		var l = out.length;
		var i = 0;
		while (i < l){
			str += this.cpart(out[i++]);
		};
		return str;
	};
	
	var hasSemiColon = SEMICOLON_TEST.test(out);
	if (!(hasSemiColon || (node instanceof Meta))) { out += this.delimiter() };
	return out;
};

Block.prototype.delimiter = function (){
	return (this._delimiter == undefined) ? ';' : this._delimiter;
};

Block.prototype.js = function (o,opts){
	var ast = this._nodes;
	var l = ast.length;
	
	var express = this.isExpression() || o.isExpression() || (this.option('express') && this.isExpressable());
	if (ast.length == 0) { return '' };
	
	if (express) {
		return Block.prototype.__super__.js.call(this,o,{nodes: ast});
	};
	
	var str = "";
	
	for (let i = 0, items = iter$(ast), len = items.length; i < len; i++) {
		str += this.cpart(items[i]);
	};
	
	
	if (this._head && this._head.length > 0) {
		var prefix = "";
		for (let i = 0, items = iter$(this._head), len = items.length; i < len; i++) {
			var hv = this.cpart(items[i]);
			if (hv) { prefix += hv + '\n' };
		};
		str = prefix + str;
	};
	
	if (this.option('strict')) {
		str = this.cpart('"use strict";\n') + str;
	};
	
	return str;
};



Block.prototype.defers = function (original,replacement){
	var idx = this._nodes.indexOf(original);
	if (idx >= 0) { this._nodes[idx] = replacement };
	var rest = this._nodes.splice(idx + 1);
	return rest;
};

Block.prototype.expressions = function (){
	var expressions = [];
	for (let i = 0, items = iter$(this.nodes()), len = items.length, node; i < len; i++) {
		node = items[i];
		if (!((node instanceof Terminator))) { expressions.push(node) };
	};
	return expressions;
};


Block.prototype.consume = function (node){
	var before;
	if (node instanceof TagLike) {
		let real = this.expressions();
		
		this._nodes = this._nodes.map(function(child) {
			if (idx$(child,real) >= 0 && !(child instanceof Assign)) {
				return child.consume(node);
			} else {
				return child;
			};
		});
		return this;
	};
	
	
	if (before = this.last()) {
		var after = before.consume(node);
		if (after != before) {
			if (after instanceof Block) {
				after = after.nodes();
			};
			
			this.replace(before,after);
		};
	};
	
	return this;
};


Block.prototype.isExpressable = function (){
	if (!this._nodes.every(function(v) { return v.isExpressable(); })) { return false };
	return true;
};

Block.prototype.isExpression = function (){
	
	return this.option('express') || this._expression;
};

Block.prototype.shouldParenthesizeInTernary = function (){
	if (this.count() == 1) {
		return this.first().shouldParenthesizeInTernary();
	};
	
	return true;
};

Block.prototype.indented = function (a,b){
	var post;
	Block.prototype.__super__.indented.apply(this,arguments);
	if ((a instanceof Token) && a._type == 'INDENT') {
		if (post = (a._meta && a._meta.post)) {
			let br = new Token('TERMINATOR',post);
			this._nodes.unshift(new Terminator(br));
			a._meta.post = '';
		};
	};
	return this;
};

function ClassInitBlock(){ return Block.apply(this,arguments) };

subclass$(ClassInitBlock,Block);


function InstanceInitBlock(){ return Block.apply(this,arguments) };

subclass$(InstanceInitBlock,Block);


function ClassField(name){
	ClassField.prototype.__super__.constructor.apply(this,arguments);
	this._name = name;
};

subclass$(ClassField,Node);
exports.ClassField = ClassField; // export class 
ClassField.prototype.name = function(v){ return this._name; }
ClassField.prototype.setName = function(v){ this._name = v; return this; };

ClassField.prototype.visit = function (){
	var up_;
	this._decorators = (up_ = this.up()) && up_.collectDecorators  &&  up_.collectDecorators();
	if (this._name && this._name.traverse) { this._name.traverse() };
	
	if (this.value() && STACK.tsc()) {
		this.value()._scope = new MethodScope(this.value());
		this.value()._scope._parent = this.scope__();
		this.value().traverse(); 
	};
	
	if (!STACK.tsc() && !this.option('raw')) {
		this._storage = this.scope__().root().declare(null,LIT('new WeakMap()'));
	};
	
	
	return this;
};


ClassField.prototype.value = function (){
	return this.option('value');
};

ClassField.prototype.target = function (){
	return this.option('static') ? LIT('this') : LIT('this.prototype');
};

ClassField.prototype.storageKey = function (){
	return this._storageKey || (this._storageKey = STR(this.name().c() + '$$'));
};

ClassField.prototype.isPlain = function (){
	return !this._decorators && (!this._value || this._value.isPrimitive());
};

ClassField.prototype.isLazy = function (){
	return true;
};

ClassField.prototype.isStatic = function (){
	return this.option('static');
};

ClassField.prototype.loc = function (){
	return [this._name._loc,this._name.region()[1]];
};

ClassField.prototype.c = function (){
	var typ;
	if (this.option('struct')) { return };
	
	let up = STACK.current();
	let out;
	if (up instanceof ClassBody) {
		
		// return if isPlain
		let prefix = this.isStatic() ? (("" + M('static',this.option('static')) + " ")) : '';
		let name = (this.name() instanceof IdentifierExpression) ? this.name().asObjectKey() : this.name().c();
		
		if (STACK.tsc()) {
			out = ("" + prefix + M(name,this._name)); 
			if (this.value()) { out += (" = " + (this.value().c())) };
			if (typ = TYP(this._name,'jsdoc')) {
				out = ("" + typ + "\n" + out);
			};
		} else {
			out = ("" + prefix + "set " + name + this.setter().c({keyword: ''}) + "\n" + prefix + "get " + name + this.getter().c({keyword: ''}));
		};
	} else if ((up instanceof ClassInitBlock) && !STACK.tsc()) {
		if (!(this.isLazy()) && this.isPlain() && this.value()) {
			out = this.util().setField(this.target(),this.name(),this.value()).c() + ';\n';
		};
		
		
		
	} else if ((up instanceof InstanceInitBlock) && !(this.isStatic()) && !(this.isLazy()) && !STACK.tsc()) {
		if (this.value()) {
			// out = util.setField(THIS,name,value).c + ';\n'
			out = OP('.',THIS,this.name()).c() + ';\n';
		};
	};
	
	return out;
};


ClassField.prototype.getter = function (){
	if (!this._getter) { if (true) {
		// let op = OP('.',THIS,storageKey)
		let op = CALL(GET(this._storage,'get'),[THIS]);
		let getter = op;
		if (this.value()) { // and (!(value isa Str) and !(value isa Str) and !(value isa Bool) or @decorators)
			let inlined = (this.value() instanceof Num) || (this.value() instanceof Str) || (this.value() instanceof Bool);
			let has = CALL(GET(this._storage,'has'),[THIS]);
			if (inlined) {
				op = METH([],[If.ternary(has,op,this.value())]);
			} else {
				let setter = CALL(GET(this._storage,'set'),[THIS,this.value()]);
				op = IF(OP('!',has),setter);
				op = METH([],[op,BR,getter]);
			};
			op.traverse();
			return op;
		} else {
			return FN([],[op]);
		};
	} } else {
		return this._getter
	};
};

ClassField.prototype.setterForValue = function (value){
	return OP('=',OP('.',THIS,this.storageKey()),value);
};

ClassField.prototype.setter = function (){
	var op;
	return this._setter || (this._setter =  true && (
		op = CALL(GET(this._storage,'set'),[THIS,LIT('value')]),
		
		FN([LIT('value')],[op]).set({noreturn: true})
	));
};

ClassField.prototype.decorater = function (){
	return this._decorater || (this._decorater =  true && (
		// let target = option(:static) ? LIT('this') : LIT('this.prototype')
		this.util().decorate(new Arr(this._decorators),this.target(),this.name(),LIT('null'))
	));
};

function ClassAttribute(){ return ClassField.apply(this,arguments) };

subclass$(ClassAttribute,ClassField);
exports.ClassAttribute = ClassAttribute; // export class 
ClassAttribute.prototype.getter = function (){
	var op;
	return this._getter || (this._getter =  true && (
		op = CALL(GET(THIS,'getAttribute'),[this.name().toAttrString()]),
		FN([],[op])
	));
};

ClassAttribute.prototype.setter = function (){
	var op;
	return this._setter || (this._setter =  true && (
		op = CALL(GET(THIS,'setAttribute'),[this.name().toAttrString(),LIT('value')]),
		FN([LIT('value')],[op]).set({noreturn: true})
	));
};



function ClassBody(){ return Block.apply(this,arguments) };

subclass$(ClassBody,Block);
exports.ClassBody = ClassBody; // export class 
ClassBody.prototype.setup = function (){
	ClassBody.prototype.__super__.setup.apply(this,arguments);
	this._fields = [];
	return this._staticFields = [];
};

ClassBody.prototype.visit = function (stack){
	if (this._scope) { this._scope.visit() };
	
	if (stack && stack._tag) {
		this._tag = stack._tag;
	};
	
	for (let i = 0, items = iter$(this._nodes), len = items.length, node; i < len; i++) {
		node = items[i];
		if (node instanceof Tag) {
			// add as render method
			// console.log 'add as render method'
			let meth = new MethodDeclaration([],[node],new Identifier('render'),null,{});
			this._nodes[i] = node = meth;
		};
		
		node && node.traverse();
	};
	return this;
};

function ExpressionList(){ return Block.apply(this,arguments) };

subclass$(ExpressionList,Block);
exports.ExpressionList = ExpressionList; // export class 


function VarDeclList(){ return Block.apply(this,arguments) };

subclass$(VarDeclList,Block);
exports.VarDeclList = VarDeclList; // export class 
VarDeclList.prototype.type = function (){
	return this.option('type') || 'var';
};

VarDeclList.prototype.add = function (part){
	if (this._nodes.length) { this.push(BR) };
	
	if (true) {
		let node = new VarDeclaration(part[0],part[1],this.type()).set({decl: this,datatype: part[0].option('datatype')});
		if (!this._firstDeclaration) {
			this._firstDeclaration = node;
			node.set({keyword: this.keyword()});
		};
		
		this.push(node);
		return this;
	};
	
	let expr = new VarReference(part[0],this.type()).set({decl: this,datatype: part[0].option('datatype')});
	
	return this.push(part[1] ? new Assign('=',expr,part[1]) : expr);
};

VarDeclList.prototype.consume = function (node){
	return this;
};



function Parens(value,open,close){
	this.setup();
	this._open = open;
	this._close = close;
	this._value = this.load(value);
};

subclass$(Parens,ValueNode);
exports.Parens = Parens; // export class 
Parens.prototype.load = function (value){
	this._noparen = false;
	return ((value instanceof Block) && value.count() == 1) ? value.first() : value;
};

Parens.prototype.isString = function (){
	// checking if this is an interpolated string
	return this._open && String(this._open) == '("' || this.value().isString();
};

Parens.prototype.js = function (o){
	
	var par = this.up();
	var v = this._value;
	var str = null;
	
	if (v instanceof Func) { this._noparen = true };
	
	if (par instanceof Block) {
		// is it worth it?
		if (!o.isExpression()) { this._noparen = true };
		str = (v instanceof Array) ? AST.cary(v) : v.c({expression: o.isExpression()});
	} else {
		str = (v instanceof Array) ? AST.cary(v) : v.c({expression: true});
	};
	
	
	return str;
};

Parens.prototype.set = function (obj){
	console.log(("Parens set " + JSON.stringify(obj)));
	return Parens.prototype.__super__.set.call(this,obj);
};


Parens.prototype.shouldParenthesize = function (){
	// no need to parenthesize if this is a line in a block
	if (this._noparen) { return false }; 
	return true;
};


Parens.prototype.prebreak = function (br){
	Parens.prototype.__super__.prebreak.call(this,br);
	console.log("PREBREAK");
	if (this._value) { this._value.prebreak(br) };
	return this;
};


Parens.prototype.isExpressable = function (){
	return this._value.isExpressable();
};

Parens.prototype.consume = function (node){
	return this._value.consume(node);
};





function ExpressionBlock(){ return ListNode.apply(this,arguments) };

subclass$(ExpressionBlock,ListNode);
exports.ExpressionBlock = ExpressionBlock; // export class 
ExpressionBlock.prototype.c = function (o){
	return this.map(function(item) { return item.c(o); }).join(",");
};

ExpressionBlock.prototype.consume = function (node){
	return this.value().consume(node);
};




function Return(v){
	this._traversed = false;
	this._value = ((v instanceof ArgList) && v.count() == 1) ? v.last() : v;
	return this;
};

subclass$(Return,Statement);
exports.Return = Return; // export class 
Return.prototype.value = function(v){ return this._value; }
Return.prototype.setValue = function(v){ this._value = v; return this; };

Return.prototype.visit = function (){
	if (this._value && this._value.traverse) { return this._value.traverse() };
};

Return.prototype.startLoc = function (){
	let l = (this.keyword() || this._value);
	return l ? l.startLoc() : null;
};

Return.prototype.js = function (o){
	var v = this._value;
	let k = M('return',this.keyword());
	
	if (v instanceof ArgList) {
		return ("" + k + " [" + v.c({expression: true}) + "]");
	} else if (v) {
		return ("" + k + " " + v.c({expression: true}));
	} else {
		return k;
	};
};

Return.prototype.c = function (){
	if (!(this.value()) || this.value().isExpressable()) { return Return.prototype.__super__.c.apply(this,arguments) };
	return this.value().consume(this).c();
};

Return.prototype.consume = function (node){
	return this;
};

function ImplicitReturn(){ return Return.apply(this,arguments) };

subclass$(ImplicitReturn,Return);
exports.ImplicitReturn = ImplicitReturn; // export class 


function GreedyReturn(){ return ImplicitReturn.apply(this,arguments) };

subclass$(GreedyReturn,ImplicitReturn);
exports.GreedyReturn = GreedyReturn; // export class 



function Throw(){ return Statement.apply(this,arguments) };

subclass$(Throw,Statement);
exports.Throw = Throw; // export class 
Throw.prototype.js = function (o){
	return ("throw " + (this.value().c()));
};

Throw.prototype.consume = function (node){
	// ROADMAP should possibly consume to the value of throw and then throw?
	return this;
};


function LoopFlowStatement(lit,expr){
	this.setLiteral(lit);
	this.setExpression(expr);
};

subclass$(LoopFlowStatement,Statement);
exports.LoopFlowStatement = LoopFlowStatement; // export class 
LoopFlowStatement.prototype.literal = function(v){ return this._literal; }
LoopFlowStatement.prototype.setLiteral = function(v){ this._literal = v; return this; };
LoopFlowStatement.prototype.expression = function(v){ return this._expression; }
LoopFlowStatement.prototype.setExpression = function(v){ this._expression = v; return this; };

LoopFlowStatement.prototype.visit = function (){
	if (this.expression()) { return this.expression().traverse() };
};

LoopFlowStatement.prototype.consume = function (node){
	return this;
};

LoopFlowStatement.prototype.c = function (){
	if (!(this.expression())) { return LoopFlowStatement.prototype.__super__.c.apply(this,arguments) };
	
	var _loop = STACK.up(Loop);
	
	
	
	var expr = this.expression();
	
	if (_loop.catcher()) {
		expr = expr.consume(_loop.catcher());
		var copy = new this.constructor(this.literal());
		return new Block([expr,copy]).c();
	} else if (expr) {
		copy = new this.constructor(this.literal());
		return new Block([expr,copy]).c();
	} else {
		return LoopFlowStatement.prototype.__super__.c.apply(this,arguments);
	};
	
};


function BreakStatement(){ return LoopFlowStatement.apply(this,arguments) };

subclass$(BreakStatement,LoopFlowStatement);
exports.BreakStatement = BreakStatement; // export class 
BreakStatement.prototype.js = function (o){
	return "break";
};

function ContinueStatement(){ return LoopFlowStatement.apply(this,arguments) };

subclass$(ContinueStatement,LoopFlowStatement);
exports.ContinueStatement = ContinueStatement; // export class 
ContinueStatement.prototype.js = function (o){
	return "continue";
};

function DebuggerStatement(){ return Statement.apply(this,arguments) };

subclass$(DebuggerStatement,Statement);
exports.DebuggerStatement = DebuggerStatement; // export class 





function Param(value,defaults,typ){
	// could have introduced bugs by moving back to identifier here
	if (typeof value == 'string') {
		value = new Identifier(value);
	};
	
	this._traversed = false;
	this._name = value;
	this._value = value;
	this._defaults = defaults;
	this._typ = typ;
	this._variable = null;
};

subclass$(Param,Node);
exports.Param = Param; // export class 
Param.prototype.name = function(v){ return this._name; }
Param.prototype.setName = function(v){ this._name = v; return this; };
Param.prototype.index = function(v){ return this._index; }
Param.prototype.setIndex = function(v){ this._index = v; return this; };
Param.prototype.defaults = function(v){ return this._defaults; }
Param.prototype.setDefaults = function(v){ this._defaults = v; return this; };
Param.prototype.splat = function(v){ return this._splat; }
Param.prototype.setSplat = function(v){ this._splat = v; return this; };
Param.prototype.variable = function(v){ return this._variable; }
Param.prototype.setVariable = function(v){ this._variable = v; return this; };
Param.prototype.value = function(v){ return this._value; }
Param.prototype.setValue = function(v){ this._value = v; return this; };

Param.prototype.varname = function (){
	return this._variable ? this._variable.c() : this.name();
};

Param.prototype.type = function (){
	return 'param';
};

Param.prototype.jsdoc = function (){
	let typ = this.option('datatype');
	if (typ && this.name()) {
		return '@param {' + typ.c() + '} ' + this.name();
	} else {
		return '';
	};
};

Param.prototype.js = function (o){
	if (this._defaults) {
		return ("" + (this._value.c()) + " = " + (this._defaults.c()));
	} else if (this.option('splat')) {
		return "..." + this._value.c();
	} else {
		return this._value.c();
	};
};

Param.prototype.visit = function (stack){
	if (this._defaults) { this._defaults.traverse() };
	if (this._value) { this._value.traverse({declaring: 'param'}) };
	
	
	
	if (this._value instanceof Identifier) {
		this._value._variable || (this._value._variable = this.scope__().register(this._value.symbol(),this._value,{type: this.type()}));
		stack.registerSemanticToken(this._value);
		
		
		
		
	};
	
	return this;
};

Param.prototype.assignment = function (){
	return OP('=',this.variable().accessor(),this.defaults());
};

Param.prototype.isExpressable = function (){
	return !(this.defaults()) || this.defaults().isExpressable();
};

Param.prototype.dump = function (){
	return {loc: this.loc()};
};

Param.prototype.loc = function (){
	return this._name && this._name.region();
};

Param.prototype.toJSON = function (){
	return {
		type: this.typeName(),
		name: this.name(),
		defaults: this.defaults()
	};
};

function BlockParam(){ return Param.apply(this,arguments) };

subclass$(BlockParam,Param);
exports.BlockParam = BlockParam; // export class 
BlockParam.prototype.c = function (){
	return "blockparam";
};

BlockParam.prototype.loc = function (){
	// hacky.. cannot know for sure that this is right?
	var r = this.name().region();
	return [r[0] - 1,r[1]];
};


function OptionalParam(){ return Param.apply(this,arguments) };

subclass$(OptionalParam,Param);
exports.OptionalParam = OptionalParam; // export class 


function NamedParam(){ return Param.apply(this,arguments) };

subclass$(NamedParam,Param);
exports.NamedParam = NamedParam; // export class 


function RequiredParam(){ return Param.apply(this,arguments) };

subclass$(RequiredParam,Param);
exports.RequiredParam = RequiredParam; // export class 


function ParamList(){ return ListNode.apply(this,arguments) };

subclass$(ParamList,ListNode);
exports.ParamList = ParamList; // export class 
ParamList.prototype.splat = function(v){ return this._splat; }
ParamList.prototype.setSplat = function(v){ this._splat = v; return this; };
ParamList.prototype.block = function(v){ return this._block; }
ParamList.prototype.setBlock = function(v){ this._block = v; return this; };

ParamList.prototype.at = function (index,force,name){
	if(force === undefined) force = false;
	if(name === undefined) name = null;
	if (force) {
		while (this.count() <= index){
			this.add(new Param(this.count() == index && name || ("_" + this.count())));
		};
		
	};
	return this.list()[index];
};

ParamList.prototype.metadata = function (){
	return this.filter(function(par) { return !(par instanceof Meta); });
};

ParamList.prototype.toJSON = function (){
	return this.metadata();
};

ParamList.prototype.jsdoc = function (){
	let out = [];
	for (let i = 0, items = iter$(this.nodes()), len = items.length, item; i < len; i++) {
		item = items[i];
		if (!((item instanceof Param))) { continue; };
		if (item.option('datatype')) {
			out.push(item.jsdoc());
		};
	};
	let doc = out.join('\n');
	return (doc ? ('/**\n' + doc + '\n*/\n') : '');
};

ParamList.prototype.visit = function (){
	var blk = this.filter(function(par) { return par instanceof BlockParam; });
	
	if (blk.length > 1) {
		blk[1].warn("a method can only have one &block parameter");
	} else if (blk[0] && blk[0] != this.last()) {
		blk[0].warn("&block must be the last parameter of a method");
		
	};
	
	
	
	
	
	return ParamList.prototype.__super__.visit.apply(this,arguments);
};

ParamList.prototype.js = function (o){
	if (this.count() == 0) { return EMPTY };
	
	if (o.parent() instanceof Block) {
		return this.head(o);
	};
	
	
	
	
	if (o.parent() instanceof Code) {
		// return "params_here"
		// remove the splat, for sure.. need to handle the other items as well
		// this is messy with references to argvars etc etc. Fix
		var pars = this.nodes();
		
		
		return AST.compact(this.nodes().map(function(param) { return param.c(); })).join(",");
	} else {
		throw "not implemented paramlist js";
		return "ta" + AST.compact(this.map(function(arg) { return arg.c(); })).join(",");
	};
};

ParamList.prototype.head = function (o){
	var reg = [];
	var opt = [];
	var blk = null;
	var splat = null;
	var named = null;
	var arys = [];
	var signature = [];
	var idx = 0;
	
	this.nodes().forEach(function(par,i) {
		if (par instanceof RawScript) {
			return;
		};
		
		par.setIndex(idx);
		if (par instanceof OptionalParam) {
			signature.push('opt');
			opt.push(par);
		} else if (par instanceof BlockParam) {
			signature.push('blk');
			blk = par;
		} else {
			signature.push('reg');
			reg.push(par);
		};
		return idx++;
	});
	
	if (named) {
		var namedvar = named.variable();
	};
	
	
	
	
	
	
	
	var ast = [];
	var isFunc = function(js) { return ("typeof " + js + " == 'function'"); };
	
	
	
	
	var isObj = function(js) { return ("" + js + ".constructor === Object"); };
	var isntObj = function(js) { return ("" + js + ".constructor !== Object"); };
	
	
	
	
	
	
	
	
	if (!named && !splat && !blk && opt.length > 0 && signature.join(" ").match(/opt$/)) {
		for (let i = 0, len_ = opt.length, par; i < len_; i++) {
			par = opt[i];
			ast.push(("if(" + (par.name().c()) + " === undefined) " + (par.name().c()) + " = " + (par.defaults().c())));
		};
	} else if (named && !splat && !blk && opt.length == 0) { // and no block?!
		// different shorthands
		// if named
		ast.push(("if(!" + (namedvar.c()) + "||" + isntObj(namedvar.c()) + ") " + (namedvar.c()) + " = \{\}"));
	} else if (blk && opt.length == 1 && !splat && !named) {
		var op = opt[0];
		var opn = op.name().c();
		var bn = blk.name().c();
		ast.push(("if(" + bn + "==undefined && " + isFunc(opn) + ") " + bn + " = " + opn + "," + opn + " = " + (op.defaults().c())));
		ast.push(("if(" + opn + "==undefined) " + opn + " = " + (op.defaults().c())));
	} else if (blk && named && opt.length == 0 && !splat) {
		bn = blk.name().c();
		ast.push(("if(" + bn + "==undefined && " + isFunc(namedvar.c()) + ") " + bn + " = " + (namedvar.c()) + "," + (namedvar.c()) + " = \{\}"));
		ast.push(("else if(!" + (namedvar.c()) + "||" + isntObj(namedvar.c()) + ") " + (namedvar.c()) + " = \{\}"));
	} else if (opt.length > 0 || splat) { // && blk  # && !splat
		
		var argvar = this.scope__().temporary(this,{pool: 'arguments'}).predeclared().c();
		var len = this.scope__().temporary(this,{pool: 'counter'}).predeclared().c();
		
		var last = ("" + argvar + "[" + len + "-1]");
		var pop = ("" + argvar + "[--" + len + "]");
		ast.push(("var " + argvar + " = arguments, " + len + " = " + argvar + ".length"));
		
		if (blk) {
			bn = blk.name().c();
			if (splat) {
				ast.push(("var " + bn + " = " + isFunc(last) + " ? " + pop + " : null"));
			} else if (reg.length > 0) {
				// ast.push "// several regs really?"
				ast.push(("var " + bn + " = " + len + " > " + (reg.length) + " && " + isFunc(last) + " ? " + pop + " : null"));
			} else {
				ast.push(("var " + bn + " = " + isFunc(last) + " ? " + pop + " : null"));
			};
		};
		
		
		
		
		if (named) {
			// should not include it when there is a splat?
			ast.push(("var " + (namedvar.c()) + " = " + last + "&&" + isObj(last) + " ? " + pop + " : \{\}"));
		};
		
		for (let i = 0, len_ = opt.length, par; i < len_; i++) {
			par = opt[i];
			ast.push(("if(" + len + " < " + (par.index() + 1) + ") " + (par.name().c()) + " = " + (par.defaults().c())));
		};
		
		
		if (splat) {
			var sn = splat.name().c();
			var si = splat.index();
			
			if (si == 0) {
				ast.push(("var " + sn + " = new Array(" + len + ">" + si + " ? " + len + " : 0)"));
				ast.push(("while(" + len + ">" + si + ") " + sn + "[" + len + "-1] = " + pop));
			} else {
				ast.push(("var " + sn + " = new Array(" + len + ">" + si + " ? " + len + "-" + si + " : 0)"));
				ast.push(("while(" + len + ">" + si + ") " + sn + "[--" + len + " - " + si + "] = " + argvar + "[" + len + "]"));
			};
		};
		
		
		
		
		
		
		
		
		
		
		
	} else if (opt.length > 0) {
		for (let i = 0, len_ = opt.length, par; i < len_; i++) {
			par = opt[i];
			ast.push(("if(" + (par.name().c()) + " === undefined) " + (par.name().c()) + " = " + (par.defaults().c())));
		};
	};
	
	
	
	if (named) {
		for (let i = 0, items = iter$(named.nodes()), len_ = items.length, k; i < len_; i++) {
			// console.log "named var {k.c}"
			k = items[i];
			op = OP('.',namedvar,k.c()).c();
			ast.push(("var " + (k.c()) + " = " + op + " !== undefined ? " + op + " : " + (k.defaults().c())));
		};
	};
	
	if (arys.length) {
		for (let i = 0, len_ = arys.length; i < len_; i++) {
			// create tuples
			arys[i].head(o,ast,this);
			
		};
	};
	
	
	
	
	return (ast.length > 0) ? ((ast.join(";\n") + ";")) : EMPTY;
};



function ScopeVariables(){ return ListNode.apply(this,arguments) };

subclass$(ScopeVariables,ListNode);
exports.ScopeVariables = ScopeVariables; // export class 
ScopeVariables.prototype.kind = function(v){ return this._kind; }
ScopeVariables.prototype.setKind = function(v){ this._kind = v; return this; };


ScopeVariables.prototype.add = function (name,init,pos){
	if(pos === undefined) pos = -1;
	var vardec = new VariableDeclarator(name,init);
	if (name instanceof Variable) { (vardec.setVariable(name),name) };
	(pos == 0) ? this.unshift(vardec) : this.push(vardec);
	return vardec;
};

ScopeVariables.prototype.load = function (list){
	
	return list.map(function(par) { return new VariableDeclarator(par.name(),par.defaults(),par.splat()); });
};

ScopeVariables.prototype.isExpressable = function (){
	return this.nodes().every(function(item) { return item.isExpressable(); });
};

ScopeVariables.prototype.js = function (o){
	if (this.count() == 0) { return EMPTY };
	
	
	if (this.count() == 1 && !(this.isExpressable())) {
		this.first().variable().autodeclare();
		var node = this.first().assignment();
		return node.c();
	};
	
	
	var keyword = 'var';
	var groups = {};
	
	this.nodes().forEach(function(item) {
		let typ = item._variable && item._variable.type();
		groups[typ] || (groups[typ] = []);
		return groups[typ].push(item._variable);
	});
	
	if (groups.let && (groups.var || groups.const)) {
		groups.let.forEach(function(item) { return item._virtual = true; });
	} else if (groups.let && !o.es5()) {
		keyword = 'let';
	};
	
	
	var out = AST.compact(AST.cary(this.nodes())).join(", ");
	return out ? (("" + keyword + " " + out)) : "";
};

function VariableDeclarator(){ return Param.apply(this,arguments) };

subclass$(VariableDeclarator,Param);
exports.VariableDeclarator = VariableDeclarator; // export class 
VariableDeclarator.prototype.type = function(v){ return this._type; }
VariableDeclarator.prototype.setType = function(v){ this._type = v; return this; };


VariableDeclarator.prototype.visit = function (){
	// even if we should traverse the defaults as if this variable does not exist
	// we need to preregister it and then activate it later
	var variable_, v_;
	(variable_ = this.variable()) || ((this.setVariable(v_ = this.scope__().register(this.name(),null,{type: this._type || 'var'})),v_));
	if (this.defaults()) { this.defaults().traverse() };
	
	this.variable().setDeclarator(this);
	this.variable().addReference(this.name());
	return this;
};


VariableDeclarator.prototype.js = function (o){
	if (this.variable()._proxy) { return null };
	
	var defs = this.defaults();
	
	
	if (defs != null && defs != undefined) {
		// console.log "defaults is {defaults}"
		if (defs instanceof Node) { defs = defs.c({expression: true}) };
		
		return ("" + (this.variable().c()) + " = " + defs);
	} else {
		return ("" + (this.variable().c()));
	};
};

VariableDeclarator.prototype.accessor = function (){
	return this;
};


function VarDeclaration(left,right,kind){
	this._left = left;
	this._right = right;
	this._kind = kind;
};

subclass$(VarDeclaration,Node);
exports.VarDeclaration = VarDeclaration; // export class 
VarDeclaration.prototype.kind = function(v){ return this._kind; }
VarDeclaration.prototype.setKind = function(v){ this._kind = v; return this; };
VarDeclaration.prototype.left = function(v){ return this._left; }
VarDeclaration.prototype.setLeft = function(v){ this._left = v; return this; };
VarDeclaration.prototype.right = function(v){ return this._right; }
VarDeclaration.prototype.setRight = function(v){ this._right = v; return this; };

VarDeclaration.prototype.type = function (){
	return this._kind;
};

VarDeclaration.prototype.visit = function (stack){
	if (!((this._left instanceof Identifier) && (this._right instanceof Func))) {
		if (this._right) { this._right.traverse() };
	};
	
	if (this._left) { this._left.traverse({declaring: this.type()}) };
	
	
	
	if (this._left instanceof Identifier) {
		// TODO add an identifier.declare method for this
		this._left._variable || (this._left._variable = this.scope__().register(this._left.symbol(),this._left,{type: this.type()}));
		stack.registerSemanticToken(this._left);
	};
	
	if (this._right) { this._right.traverse() };
	
	
	
	
	
	return this;
};

VarDeclaration.prototype.consume = function (node){
	if (node instanceof TagLike) {
		return this;
	};
	
	return VarDeclaration.prototype.__super__.consume.call(this,node);
};

VarDeclaration.prototype.c = function (o){
	if (this.right() && !this.right().isExpressable()) {
		// TODO write failing tests and make them pass
		return this.right().consume(this).c(o);
	};
	
	return VarDeclaration.prototype.__super__.c.call(this,o);
};

VarDeclaration.prototype.js = function (){
	var typ;
	let out = ("" + M(this.kind(),this.keyword()) + " " + this.left().c());
	if (this.right()) {
		out += (" = " + this.right().c({expression: true}));
	};
	
	if (this.option('export')) {
		if (STACK.cjs()) {
			out = ("" + out + ";\nexports." + this.left().c() + " = " + this.left().c());
		} else {
			out = M('export',this.option('export')) + (" " + out);
		};
	};
	
	if (typ = this.datatype()) {
		out = '/** @type {' + typ.c() + '} */\n' + out;
	};
	
	return out;
};


function VarName(a,b){
	VarName.prototype.__super__.constructor.apply(this,arguments);
	this._splat = b;
};

subclass$(VarName,ValueNode);
exports.VarName = VarName; // export class 
VarName.prototype.variable = function(v){ return this._variable; }
VarName.prototype.setVariable = function(v){ this._variable = v; return this; };
VarName.prototype.splat = function(v){ return this._splat; }
VarName.prototype.setSplat = function(v){ this._splat = v; return this; };

VarName.prototype.visit = function (){
	// should we not lookup instead?
	// FIXME p "register value {value.c}"
	var variable_, v_;
	(variable_ = this.variable()) || ((this.setVariable(v_ = this.scope__().register(this.value().c(),null)),v_));
	this.variable().setDeclarator(this);
	this.variable().addReference(this.value());
	return this;
};

VarName.prototype.js = function (o){
	return this.variable().c();
};

VarName.prototype.c = function (){
	return this.variable().c();
};



function Code(){ return Node.apply(this,arguments) };

subclass$(Code,Node);
exports.Code = Code; // export class 
Code.prototype.head = function(v){ return this._head; }
Code.prototype.setHead = function(v){ this._head = v; return this; };
Code.prototype.body = function(v){ return this._body; }
Code.prototype.setBody = function(v){ this._body = v; return this; };
Code.prototype.scope = function(v){ return this._scope; }
Code.prototype.setScope = function(v){ this._scope = v; return this; };
Code.prototype.params = function(v){ return this._params; }
Code.prototype.setParams = function(v){ this._params = v; return this; };

Code.prototype.scopetype = function (){
	return Scope;
};

Code.prototype.visit = function (){
	if (this._scope) { this._scope.visit() };
	
	return this;
};



function Root(body,opts){
	this._traversed = false;
	this._body = AST.blk(body);
	this._scope = new RootScope(this,null);
	this._options = {};
};

subclass$(Root,Code);
exports.Root = Root; // export class 
Root.prototype.loc = function (){
	return this._body.loc();
};

Root.prototype.visit = function (){
	ROOT = STACK.ROOT = this._scope;
	try {
		this.scope().visit();
		this.body().traverse();
		if (this.body().first() instanceof Terminator) {
			return this.body().first()._first = true;
		};
	} catch (e) {
		let err = ImbaTraverseError.wrap(e);
		err._filename = OPTS.filename;
		err._loc = STACK.currentRegion();
		throw err;
	};
};


Root.prototype.compile = function (o){
	STACK.reset(); 
	this._scope.setOptions(OPTS = STACK._options = this._options = o || {});
	STACK.setRoot(this._scope);
	this.traverse();
	STACK.setRoot(this._scope);
	
	if (o.onTraversed instanceof Function) {
		o.onTraversed(this,STACK);
	};
	
	if (OPTS.debug) {
		// console.log "semantic tokens",STACK.semanticTokens
		for (let i = 0, items = iter$(STACK.semanticTokens()), len = items.length, tok; i < len; i++) {
			tok = items[i];
			console.log(("semantic " + (tok._value) + " - " + (tok._kind)));
		};
	};
	
	var out = this.c();
	
	if (STACK.tsc()) {
		out = ("import 'imba/index';\n" + out);
	};
	
	var result = {
		js: out,
		ast: this,
		source: o._source,
		tokens: o._tokens,
		warnings: this.scope().warnings(),
		options: o,
		toString: function() { return this.js; },
		styles: this.scope().styles(),
		sfcid: this._scope.sfcid()
	};
	
	if (!STACK.tsc()) {
		var stylebody = "";
		for (let i = 0, items = iter$(result.styles), len = items.length, style; i < len; i++) {
			style = items[i];
			if (style.type == 'css') {
				let scoping = style.scoped ? result.sfcid : null;
				style.processed || (style.processed = csscompiler.compile(style.content,{scope: scoping}));
				stylebody += style.processed + '\n\n';
			};
		};
		
		result.stylebody = stylebody;
		
		if (stylebody) {
			// and o:bundler != 'webpack'
			let css = {js: stylebody};
			
			
			result.js = ("" + (result.js) + "\nimba.inlineStyles(" + JSON.stringify(css.js) + ");");
			result.js += '\n/*\n' + css.js + '\n*/\n';
			result.styles.inlined = true;
		};
	};
	
	
	if (o.sourceMap) { // should handle sourcemap no matter what?
		let map = new SourceMap(result,o.sourceMap,o).generate();
		result.sourcemap = map.result();
	};
	
	
	result.js = result.js.replace(/\/\*\%([\w\|]*)\$\*\//g,'');
	
	return result;
};

Root.prototype.js = function (o){
	var out;
	if (!this._options.wrap) {
		out = this.scope().c();
	} else {
		this.body().consume(new ImplicitReturn());
		out = this.scope().c({indent: true});
		out = out.replace(/^\n?/,'\n');
		out = out.replace(/\n?$/,'\n\n');
		out = '(function(){' + out + '})();';
	};
	
	
	var shebangs = [];
	out = out.replace(/^[ \t]*\/\/(\!.+)$/mg,function(m,shebang) {
		shebang = shebang.replace(/\bimba\b/g,'node');
		shebangs.push(("#" + shebang + "\n"));
		return "";
	});
	
	out = shebangs.join('') + out;
	
	return out;
};


Root.prototype.analyze = function (o){
	// loglevel: 0, entities: no, scopes: yes
	if(o === undefined) o = {};
	STACK.setLoglevel(o.loglevel || 0);
	STACK._analyzing = true;
	ROOT = STACK.ROOT = this._scope;
	OPTS = STACK._options = {
		target: o.target,
		loglevel: o.loglevel || 0,
		analysis: {
			entities: (o.entities || false),
			scopes: ((o.scopes == null) ? (o.scopes = true) : o.scopes)
		}
	};
	
	this.traverse();
	STACK._analyzing = false;
	
	return this.scope().dump();
};

Root.prototype.inspect = function (){
	return true;
};

function ClassDeclaration(name,superclass,body){
	// what about the namespace?
	this._traversed = false;
	this._name = name || LIT('');
	this._superclass = superclass;
	this._scope = this.isTag() ? new TagScope(this) : new ClassScope(this);
	this._body = AST.blk(body) || new ClassBody([]);
	this._entities = {}; 
	this;
};

subclass$(ClassDeclaration,Code);
exports.ClassDeclaration = ClassDeclaration; // export class 
ClassDeclaration.prototype.name = function(v){ return this._name; }
ClassDeclaration.prototype.setName = function(v){ this._name = v; return this; };
ClassDeclaration.prototype.superclass = function(v){ return this._superclass; }
ClassDeclaration.prototype.setSuperclass = function(v){ this._superclass = v; return this; };
ClassDeclaration.prototype.initor = function(v){ return this._initor; }
ClassDeclaration.prototype.setInitor = function(v){ this._initor = v; return this; };

ClassDeclaration.prototype.consume = function (node){
	if (node instanceof Return) {
		this.option('return',node);
		return this;
	};
	return ClassDeclaration.prototype.__super__.consume.apply(this,arguments);
};

ClassDeclaration.prototype.namepath = function (){
	return this._namepath || (this._namepath = ("" + (this.name() ? this.name().c() : '--')));
};

ClassDeclaration.prototype.metadata = function (){
	var superclass_;
	return {
		type: 'class',
		namepath: this.namepath(),
		inherits: (superclass_ = this.superclass()) && superclass_.namepath  &&  superclass_.namepath(),
		path: this.name() && this.name().c().toString(),
		desc: this._desc,
		loc: this.loc(),
		symbols: this._scope.entities()
	};
};

ClassDeclaration.prototype.loc = function (){
	var d;
	if (d = this.option('keyword')) {
		return [d._loc,this.body().loc()[1]];
	} else {
		return ClassDeclaration.prototype.__super__.loc.apply(this,arguments);
	};
};

ClassDeclaration.prototype.startLoc = function (){
	return (this._startLoc == null) ? (this._startLoc = MSTART(this.option('export'),this.option('keyword'))) : this._startLoc;
};

ClassDeclaration.prototype.endLoc = function (){
	return (this._endLoc == null) ? (this._endLoc = MEND(this.body())) : this._endLoc;
};

ClassDeclaration.prototype.toJSON = function (){
	return this.metadata();
};

ClassDeclaration.prototype.isStruct = function (){
	return this.keyword() && String(this.keyword()) == 'struct';
};

ClassDeclaration.prototype.isTag = function (){
	return false;
};

ClassDeclaration.prototype.staticInit = function (){
	return this._staticInit || (this._staticInit = this.addMethod('init$',[],this._superclass ? 'super.inherited instanceof Function && super.inherited(this)' : 'this').set({static: true}));
};

ClassDeclaration.prototype.instanceInit = function (){
	return this._instanceInit || (this._instanceInit = this.addMethod('init$',[],this.isTag() ? 'super.init$()' : ''));
};

ClassDeclaration.prototype.visit = function (){
	// replace with some advanced lookup?
	this._body._delimiter = '';
	
	STACK.pop(this);
	
	if (this._superclass) {
		this._superclass.traverse();
		
	};
	
	if (this.option('extension')) {
		this._name.traverse();
	};
	
	STACK.push(this);
	
	ROOT.entities().add(this.namepath(),this);
	this.scope().visit();
	
	if (this._superclass && !this.option('extension') && !STACK.tsc()) {
		this.staticInit();
	};
	
	this.body().traverse();
	
	if (STACK.tsc()) {
		return this;
	};
	
	var inits = new InstanceInitBlock();
	var staticInits = new ClassInitBlock();
	var ctor = this.body().option('ctor');
	
	for (let i = 0, items = iter$(this.body()), len = items.length, node; i < len; i++) {
		node = items[i];
		if (!((node instanceof ClassField))) { continue; };
		staticInits.add(node);
		inits.add(node);
	};
	
	for (let i = 0, items = iter$(this.body()), len = items.length, node; i < len; i++) {
		node = items[i];
		if (node._decorators) {
			let target = node.option('static') ? THIS : PROTO;
			let desc = LIT('null');
			let op = this.util().decorate(new Arr(node._decorators),target,node.name(),desc);
			staticInits.add([op,BR]);
			
		};
	};
	
	if (!inits.isEmpty()) {
		if (this.isTag()) {
			ctor = this.instanceInit();
			ctor.inject(inits);
		} else if (ctor) {
			let after = ctor.option('injectInitAfter');
			
			ctor.inject(inits,after ? {after: after} : 0);
		} else {
			ctor = this.addMethod('constructor',[],this.superclass() ? 'super(...arguments)' : 'this');
			ctor.inject(BR);
			ctor.inject(inits);
		};
	};
	
	if (!staticInits.isEmpty()) {
		this.staticInit().inject(staticInits,0);
	};
	return this;
};

ClassDeclaration.prototype.addMethod = function (name,params,mbody,options){
	if ((typeof mbody=='string'||mbody instanceof String)) { mbody = [LIT(mbody)] };
	let func = new MethodDeclaration(params,mbody || [],new Identifier(name),null,options || {});
	this.body().unshift(func,true);
	func.traverse();
	return func;
};





ClassDeclaration.prototype.js = function (o){
	this.scope().virtualize(); 
	this.scope().context().setValue(this.name());
	this.scope().context().setReference(this.name());
	
	
	if (this.option('extension')) {
		// fields are not allowed in class extensions?
		this._body._delimiter = ',';
		this._body.set({braces: true});
		
		return this.util().extend(LIT(this.name().c()),this.body()).c();
		
	};
	
	
	
	
	
	var o = this._options || {};
	var cname = (this.name() instanceof Access) ? this.name().right() : this.name();
	
	var initor = null;
	var sup = this.superclass();
	
	if (typeof cname != 'string') {
		cname = cname.c({mark: true});
	};
	
	var cpath = (typeof this.name() == 'string') ? this.name() : this.name().c();
	
	this._cname = cname;
	this._cpath = cpath;
	
	if (STACK.tsc()) {
		this.body().unshift(LIT(TSC_CLASS_HEAD),true);
	};
	
	let jsbody = this.body().c();
	let jshead = M('class',this.keyword()); 
	if (this.name()) { jshead += (" " + M(cname,this.name())) };
	if (sup) { jshead += (" extends " + M(sup)) };
	
	if (this.option('export') && !STACK.cjs()) {
		if (this.option('default')) {
			jshead = ("" + M('export',this.option('export')) + " " + M('default',this.option('default')) + " " + jshead);
		} else {
			jshead = ("" + M('export',this.option('export')) + " " + jshead);
		};
	};
	
	let js = ("" + jshead + " \{" + jsbody + "\}");
	
	if (this.option('export') && STACK.cjs()) {
		let exportName = this.option('default') ? 'default' : cname;
		js = ("" + js + ";\n" + M('exports',o.export) + "." + exportName + " = " + cname);
	};
	
	if (this.option('global')) {
		js = ("" + js + "; " + (this.scope__().root().globalRef()) + "." + (this._cname) + " = " + (this._cname));
	};
	
	if (this._staticInit) {
		js = ("" + js + "; " + cname + ".init$();");
	};
	
	
	
	
	
	
	return js;
};

function StructInitBody(){ return Block.apply(this,arguments) };

subclass$(StructInitBody,Block);
exports.StructInitBody = StructInitBody; // export class 


function StructDeclaration(){ return ClassDeclaration.apply(this,arguments) };

subclass$(StructDeclaration,ClassDeclaration);
exports.StructDeclaration = StructDeclaration; // export class 
StructDeclaration.prototype.visit = function (){
	// replace with some advanced lookup?
	this._body._delimiter = '';
	ROOT.entities().add(this.namepath(),this);
	this.scope().visit();
	
	var fields = [];
	var signature = [];
	var params = [];
	
	if (this.option('params')) {
		for (let i = 0, items = iter$(this.option('params').reverse()), len = items.length, param; i < len; i++) {
			param = items[i];
			let name = String(param.name());
			
			let field = new ClassField(param.name()).set(
				{datatype: param.option('datatype'),
				value: param.defaults()}
			);
			field.set({param: param});
			
			this.body().unshift(field);
			params.unshift(param);
		};
	};
	
	params.push(LIT('$$={}'));
	
	let prevSignificant;
	for (let i = 0, items = iter$(this.body()), len = items.length, node; i < len; i++) {
		node = items[i];
		if (node instanceof Terminator) {
			if (prevSignificant instanceof ClassField) { this.body().replace(node,BR0) };
		} else {
			prevSignificant = node;
		};
		
		if (node instanceof ClassField) {
			let name = String(node.name());
			let field = node;
			if (fields[name]) {
				if (!fields[name].datatype()) {
					fields[name].set({datatype: node.datatype()});
				};
			} else {
				node.set({struct: this,raw: true});
				fields.push(fields[name] = node);
			};
			
			this.body().replace(node,BR0);
		};
	};
	
	this.body().traverse();
	
	if (STACK.tsc()) {
		return this;
	};
	
	var ctor = this.body().option('ctor');
	
	var inits = new StructInitBody([]);
	var setters = [];
	
	for (let i = 0, len = fields.length, field; i < len; i++) {
		// check if null?
		// let param = LIT('$$')
		field = fields[i];
		let access = OP('.',THIS,field.name());
		let setter = OP('.',LIT('$$'),field.name());
		
		if (field.option('param')) {
			setter = field.option('param').name();
		};
		
		if (field.value()) {
			setter = OP('||',setter,field.value());
			
		};
		
		let assign = OP('=',access,setter).set({datatype: field.datatype()});
		
		inits.add([assign,BR]);
		
	};
	
	
	
	
	this._ctor = this.addMethod('constructor',params,inits);
	
	return this;
};

StructDeclaration.prototype.js = function (o){
	// should probably also warn about stuff etc
	if (this.option('extension')) {
		// throw error!!
		// fields are not allowed in class extensions?
		this._body._delimiter = ',';
		this._body.set({braces: true});
		
		return this.util().extend(LIT(this.name().c()),this.body()).c();
		
	};
	
	var o = this._options || {};
	var cname = (this.name() instanceof Access) ? this.name().right() : this.name();
	
	var initor = null;
	var sup = this.superclass();
	
	if (typeof cname != 'string') {
		cname = cname.c({mark: true});
	};
	
	var cpath = (typeof this.name() == 'string') ? this.name() : this.name().c();
	
	this._cname = cname;
	this._cpath = cpath;
	
	if (STACK.tsc()) {
		this.body().unshift(LIT(TSC_CLASS_HEAD),true);
	};
	
	let jsbody = this.body().c();
	
	let jshead = M('function',this.keyword()); 
	if (this.name()) { jshead += (" " + M(cname,this.name())) };
	
	if (sup) { jshead += (" extends " + M(sup)) };
	
	if (this.option('export') && !STACK.cjs()) {
		if (this.option('default')) {
			jshead = ("" + M('export',this.option('export')) + " " + M('default',this.option('default')) + " " + jshead);
		} else {
			jshead = ("" + M('export',this.option('export')) + " " + jshead);
		};
	};
	
	let js = ("" + jshead + " \{" + jsbody + "\}");
	
	if (this.option('export') && STACK.cjs()) {
		let exportName = this.option('default') ? 'default' : cname;
		js = ("" + js + ";\n" + M('exports',o.export) + "." + exportName + " = " + cname);
	};
	
	if (this.option('global')) {
		js = ("" + js + "; " + (this.scope__().root().globalRef()) + "." + (this._cname) + " = " + (this._cname));
	};
	
	if (this._staticInit) {
		js = ("" + js + "; " + cname + ".init$();");
	};
	
	
	
	
	
	
	return js;
};

function TagDeclaration(){ return ClassDeclaration.apply(this,arguments) };

subclass$(TagDeclaration,ClassDeclaration);
exports.TagDeclaration = TagDeclaration; // export class 
TagDeclaration.prototype.isTag = function (){
	return true;
};

TagDeclaration.prototype.namepath = function (){
	return ("<" + this.name() + ">");
};

TagDeclaration.prototype.metadata = function (){
	return Object.assign(TagDeclaration.prototype.__super__.metadata.apply(this,arguments),{
		type: 'tag'
	});
};

TagDeclaration.prototype.selectorpath = function (){
	return this._selectorpath || (this._selectorpath = this.name().toSelector());
	
};

TagDeclaration.prototype.cssref = function (){
	return ("_" + (STACK.fid()) + this.oid());
};

TagDeclaration.prototype.visit = function (){
	this.scope__().imbaDependency('index');
	
	TagDeclaration.prototype.__super__.visit.apply(this,arguments);
	
	let sup = this.superclass();
	
	if (sup && (sup.isNative() || sup.isNativeSVG()) && !STACK.tsc()) {
		let op = sup.nativeCreateNode();
		op = this.util().extendTag(op,THIS);
		this.addMethod('create$',[],[op]).set({static: true});
		this.set({extends: Obj.wrap({extends: sup.name()})});
	};
	
	if (this._elementReferences) {
		for (let o = this._elementReferences, child, i = 0, keys = Object.keys(o), l = keys.length, ref; i < l; i++){
			ref = keys[i];child = o[ref];if (STACK.tsc()) {
				let val = child.option('reference');
				let typ = child.type();
				let op = ("" + M(AST.sym(val),val));
				if (typ && typ.toClassName) {
					op += (" = new " + (typ.toClassName()));
				};
				
				this.body().unshift(LIT(op + ';'),true);
				
			};
			
			
		};
	};
	
	
	
	return;
};

TagDeclaration.prototype.addElementReference = function (name,child){
	let refs = this._elementReferences || (this._elementReferences = {});
	return refs[name] = child;
};

TagDeclaration.prototype.js = function (s){
	this.scope().virtualize(); 
	this.scope().context().setValue(this.name());
	this.scope().context().setReference(this.name());
	
	let className = this.name().toClassName();
	
	
	let sup = CALL(LIT('imba.tags.get'),[
		this.superclass() || STR('component'),
		this.superclass() ? STR(this.superclass().toClassName()) : STR('ImbaElement')
	]);
	
	if (STACK.tsc()) {
		sup = this.superclass() ? this.superclass().toClassName() : LIT('HTMLElement');
		this.body().unshift(LIT(TSC_CLASS_HEAD),true);
		if (this.option('extension')) {
			className = ("Extended$" + className);
		};
		
		
		
		
		
		
	} else if (this.option('extension')) {
		this._body._delimiter = ',';
		this._body.set({braces: true});
		let cls = CALL(LIT('imba.tags.get'),[this.name(),STR(this.name().toClassName())]);
		let tagname = new TagTypeIdentifier(this.name());
		return this.util().extend(cls,this.body()).c();
	};
	
	
	let closure = this.scope__().parent();
	let jsbody = this.body().c();
	let jshead = ("" + M('class',this.keyword()) + " " + M(className,this.name()) + " extends " + M(sup,this.superclass()));
	
	if (this.option('export') && !STACK.cjs()) {
		if (this.option('default')) {
			jshead = ("" + M('export',this.option('export')) + " " + M('default',this.option('default')) + " " + jshead);
		} else {
			jshead = ("" + M('export',this.option('export')) + " " + jshead);
		};
	};
	
	let js = ("" + jshead + " \{" + jsbody + "\}");
	
	if (this.option('export') && STACK.cjs()) {
		let exportName = this.option('default') ? 'default' : this.cname();
		js = ("" + js + ";\n" + M('exports',this.o().export) + "." + exportName + " = " + this.cname());
	};
	
	
	if (!STACK.tsc()) {
		if (this._staticInit) {
			js += ("; " + className + ".init$()");
		};
		let ext = (this.option('extends') || LIT('{}')).c();
		js += ("; imba.tags.define(" + (this.name().c()) + "," + className + "," + ext + ")");
	} else {
		if (!this.option('extension')) {
			js += ("; globalThis." + M(className,this.name()) + " = " + className + ";");
		};
		
		
	};
	return js;
};

function Func(params,body,name,target,o){
	this._options = o;
	var typ = this.scopetype();
	this._traversed = false;
	this._body = AST.blk(body);
	this._scope || (this._scope = (o && o.scope) || new typ(this));
	this._scope.setParams(this._params = new ParamList(params));
	this._name = name || '';
	this._target = target;
	this._type = 'function';
	this._variable = null;
	this;
};

subclass$(Func,Code);
exports.Func = Func; // export class 
Func.prototype.name = function(v){ return this._name; }
Func.prototype.setName = function(v){ this._name = v; return this; };
Func.prototype.params = function(v){ return this._params; }
Func.prototype.setParams = function(v){ this._params = v; return this; };
Func.prototype.target = function(v){ return this._target; }
Func.prototype.setTarget = function(v){ this._target = v; return this; };
Func.prototype.options = function(v){ return this._options; }
Func.prototype.setOptions = function(v){ this._options = v; return this; };
Func.prototype.type = function(v){ return this._type; }
Func.prototype.setType = function(v){ this._type = v; return this; };
Func.prototype.context = function(v){ return this._context; }
Func.prototype.setContext = function(v){ this._context = v; return this; };

Func.prototype.scopetype = function (){
	return FunctionScope;
};

Func.prototype.inject = function (line,o){
	return this._body.add([line,BR],o);
};

Func.prototype.nonlocals = function (){
	return this._scope._nonlocals;
};

Func.prototype.visit = function (stack,o){
	this.scope().visit();
	this._context = this.scope().parent();
	this._params.traverse({declaring: 'arg'});
	return this._body.traverse(); 
};

Func.prototype.funcKeyword = function (){
	let str = "function";
	if (this.option('async')) { str = ("async " + str) };
	return str;
};

Func.prototype.js = function (s,o){
	if (!this.option('noreturn')) { this.body().consume(new ImplicitReturn()) };
	var ind = this.body()._indentation;
	
	if (ind && ind.isGenerated()) { this.body()._indentation = null };
	var code = this.scope().c({indent: (!ind || !ind.isGenerated()),braces: true});
	
	
	
	
	
	
	
	var name = (typeof this._name == 'string') ? this._name : this._name.c();
	name = name ? (' ' + name.replace(/\./g,'_')) : '';
	var keyword = (o && o.keyword != undefined) ? o.keyword : this.funcKeyword();
	var out = ("" + M(keyword,this.option('def') || this.option('keyword')) + name + "(" + (this.params().c()) + ") ") + code;
	
	if (this.option('eval')) { out = ("(" + out + ")()") };
	return out;
};

Func.prototype.shouldParenthesize = function (par){
	if(par === undefined) par = this.up();
	return (par instanceof Call) && par.callee() == this;
	
};

function IsolatedFunc(){ return Func.apply(this,arguments) };

subclass$(IsolatedFunc,Func);
exports.IsolatedFunc = IsolatedFunc; // export class 
IsolatedFunc.prototype.leaks = function(v){ return this._leaks; }
IsolatedFunc.prototype.setLeaks = function(v){ this._leaks = v; return this; };

IsolatedFunc.prototype.scopetype = function (){
	return IsolatedFunctionScope;
};

IsolatedFunc.prototype.isStatic = function (){
	return true;
};

IsolatedFunc.prototype.isPrimitive = function (){
	return true;
};

IsolatedFunc.prototype.visit = function (stack){
	var self = this, leaks;
	IsolatedFunc.prototype.__super__.visit.apply(self,arguments);
	
	if (stack.tsc()) { return };
	
	if (leaks = self._scope._leaks) {
		self._leaks = [];
		leaks.forEach(function(shadow,source) {
			shadow._proxy = self._params.at(self._params.count(),true);
			return self._leaks.push(source);
		});
	};
	return self;
};

function Lambda(){ return Func.apply(this,arguments) };

subclass$(Lambda,Func);
exports.Lambda = Lambda; // export class 
Lambda.prototype.scopetype = function (){
	var k = this.option('keyword');
	return (k && k._value == 'ƒ') ? ((MethodScope)) : ((LambdaScope));
};

function ClosedFunc(){ return Func.apply(this,arguments) };

subclass$(ClosedFunc,Func);
exports.ClosedFunc = ClosedFunc; // export class 
ClosedFunc.prototype.scopetype = function (){
	return MethodScope;
};

function TagFragmentFunc(){ return Func.apply(this,arguments) };

subclass$(TagFragmentFunc,Func);
exports.TagFragmentFunc = TagFragmentFunc; // export class 
TagFragmentFunc.prototype.scopetype = function (){
	// caching still needs to be local no matter what?
	return this.option('closed') ? ((MethodScope)) : ((LambdaScope));
};

function MethodDeclaration(){ return Func.apply(this,arguments) };

subclass$(MethodDeclaration,Func);
exports.MethodDeclaration = MethodDeclaration; // export class 
MethodDeclaration.prototype.variable = function(v){ return this._variable; }
MethodDeclaration.prototype.setVariable = function(v){ this._variable = v; return this; };
MethodDeclaration.prototype.decorators = function(v){ return this._decorators; }
MethodDeclaration.prototype.setDecorators = function(v){ this._decorators = v; return this; };

MethodDeclaration.prototype.scopetype = function (){
	return MethodScope;
};

MethodDeclaration.prototype.consume = function (node){
	if (node instanceof Return) {
		this.option('return',true);
		return this;
	};
	return MethodDeclaration.prototype.__super__.consume.apply(this,arguments);
};

MethodDeclaration.prototype.identifier = function (){
	return this._name;
};

MethodDeclaration.prototype.metadata = function (){
	return {
		type: "method",
		name: "" + this.name(),
		namepath: this.namepath(),
		params: this._params.metadata(),
		desc: this._desc,
		scopenr: this.scope()._nr,
		loc: this.loc()
	};
};

MethodDeclaration.prototype.loc = function (){
	var d;
	if (d = this.option('def')) {
		let end = this.body().option('end') || this.body().loc()[1];
		return [d._loc,end];
	} else {
		return [0,0];
	};
};

MethodDeclaration.prototype.isGetter = function (){
	return this._type == 'get';
};

MethodDeclaration.prototype.isSetter = function (){
	return this._type == 'set';
};

MethodDeclaration.prototype.isConstructor = function (){
	return String(this.name()) == 'constructor';
};

MethodDeclaration.prototype.toJSON = function (){
	return this.metadata();
};

MethodDeclaration.prototype.namepath = function (){
	if (this._namepath) { return this._namepath };
	
	var name = String(this.name().c());
	var sep = (this.option('static') ? '.' : '#');
	if (this.target()) {
		let ctx = this.target();
		
		if (ctx.namepath() == "ValueNode") {
			ctx = this._context.node();
		};
		
		return this._namepath = ctx.namepath() + sep + name;
	} else {
		return this._namepath = '&' + name;
	};
};

MethodDeclaration.prototype.visit = function (){
	var $1, up_, variable;
	this._type = this.option('type') || (($1 = this.option('def')) && $1._value || 'def');
	this._decorators = (up_ = this.up()) && up_.collectDecorators  &&  up_.collectDecorators();
	
	var o = this._options;
	this.scope().visit();
	
	if (this.option('inObject')) {
		this._params.traverse();
		this._body.traverse();
		return this;
	};
	
	var closure = this._context = this.scope().parent().closure();
	
	if ((closure instanceof RootScope) && !(this.target())) {
		this.scope()._context = closure.context();
	} else if ((closure instanceof MethodScope) && !(this.target())) {
		this.scope()._selfless = true;
	};
	
	this._params.traverse();
	
	if (this.target() instanceof Identifier) {
		if (variable = this.scope().lookup(this.target().toString())) {
			this.setTarget(variable);
		};
		
	};
	
	if (String(this.name()) == 'initialize' && (closure instanceof ClassScope) && !(closure instanceof TagScope)) {
		this.setType('constructor');
	};
	
	if (String(this.name()) == 'constructor' || this.isConstructor()) {
		this.up().set({ctor: this});
		this.set({noreturn: true});
	};
	
	
	if ((closure instanceof ClassScope) && !(this.target())) {
		this._target = closure.prototype();
		this.set(
			{prototype: this._target,
			inClassBody: true,
			inExtension: closure.node().option('extension')}
		);
		closure.annotate(this);
	};
	
	if (this.target() instanceof Self) {
		this._target = closure.context();
		closure.annotate(this);
		this.set({static: true});
	} else if (o.variable) {
		
		this._variable = this.scope().parent().register(this.name(),this,{type: String(o.variable)});
		if (this.target()) { this.warn(("" + String(o.variable) + " def cannot have a target")) };
	} else if (!(this.target())) {
		
		this._variable = this.scope().parent().register(this.name(),this,{type: 'const'});
		true;
	};
	
	if (o.export && !(closure instanceof RootScope)) {
		this.warn("cannot export non-root method",{loc: o.export.loc()});
	};
	
	ROOT.entities().add(this.namepath(),this);
	
	this._body.traverse();
	
	if (this.isConstructor() && this.option('supr')) {
		let ref = this.scope__().context()._reference;
		let supr = this.option('supr');
		let node = supr.node;
		let block = supr.block;
		
		if (ref) {
			ref.declarator()._defaults = null;
			let op = OP('=',ref,new This());
			block.replace(node,[node,op]);
		};
	};
	
	return this;
};

MethodDeclaration.prototype.supername = function (){
	return (this.type() == 'constructor') ? this.type() : this.name();
};





MethodDeclaration.prototype.js = function (o){
	var o = this._options;
	
	if (!(this.type() == 'constructor' || this.option('noreturn') || this.isSetter())) {
		if (this.option('chainable')) {
			this.body().add(new ImplicitReturn(this.scope().context()));
		} else if (this.option('greedy')) {
			// haaack
			this.body().consume(new GreedyReturn());
		} else {
			this.body().consume(new ImplicitReturn());
		};
	};
	
	var code = this.scope().c({indent: true,braces: true});
	var name = (typeof this._name == 'string') ? this._name : this._name.c();
	
	var out = "";
	var fname = AST.sym(this.name());
	
	if (this.option('inClassBody') || this.option('inObject')) {
		// what if this is async?
		let prefix = this.isGetter() ? 'get ' : ((this.isSetter() ? 'set ' : ''));
		if (this.option('static')) { prefix = ("" + M('static',this.option('static')) + " " + prefix) };
		if (this.option('async')) { prefix = ("async " + prefix) };
		out = ("" + prefix + M(name,this._name) + "(" + (this.params().c()) + ")" + code);
		
		out = this._params.jsdoc() + out;
		
		return out;
	};
	
	var func = ("(" + (this.params().c()) + ")") + code;
	var ctx = this.context();
	
	if (this.target()) {
		if (fname[0] == '[') {
			fname = fname.slice(1,-1);
		} else {
			fname = ("'" + fname + "'");
		};
		if (this.isGetter()) {
			out = ("Object.defineProperty(" + (this.target().c()) + ",'" + fname + "',\{get: " + this.funcKeyword() + func + ", configurable: true\})");
		} else if (this.isSetter()) {
			out = ("Object.defineProperty(" + (this.target().c()) + ",'" + fname + "',\{set: " + this.funcKeyword() + func + ", configurable: true\})");
		} else {
			let k = OP('.',this.target(),this._name);
			out = ("" + (k.c()) + " = " + this.funcKeyword() + " " + func);
		};
		
		if (o.export) {
			out = ("exports." + (o.default ? 'default' : fname) + " = " + out);
		};
	} else {
		out = ("" + M(this.funcKeyword(),this.keyword()) + " " + M(fname,this._name) + func);
		if (o.export) {
			if (STACK.cjs()) {
				let exportName = o.default ? 'default' : fname;
				out = ("" + out + ";\n" + M('exports',o.export) + "." + exportName + " = " + fname);
			} else {
				out = ("" + M('export',o.export) + " " + (o.default ? M('default ',o.default) : '') + out);
			};
		};
	};
	
	if (o.global) {
		out = ("" + out + "; " + (this.scope__().root().globalRef()) + "." + fname + " = " + fname + ";");
	};
	
	if (this.option('return')) {
		out = ("return " + out);
	};
	
	return out;
};





function Literal(v){
	this._traversed = false;
	this._expression = true;
	this._cache = null;
	this._raw = null;
	this._value = this.load(v);
};

subclass$(Literal,ValueNode);
exports.Literal = Literal; // export class 
Literal.prototype.load = function (value){
	return value;
};


Literal.prototype.toString = function (){
	return "" + this.value();
};

Literal.prototype.hasSideEffects = function (){
	return false;
};

Literal.prototype.shouldParenthesizeInTernary = function (){
	return false;
};

Literal.prototype.startLoc = function (){
	return this._startLoc || (this._value.startLoc && this._value.startLoc());
};

Literal.prototype.endLoc = function (){
	return this._endLoc || (this._value.endLoc && this._value.endLoc());
};

function RawScript(){ return Literal.apply(this,arguments) };

subclass$(RawScript,Literal);
exports.RawScript = RawScript; // export class 
RawScript.prototype.c = function (){
	return this._value;
};

function Bool(v){
	this._value = v;
	this._raw = (String(v) == "true") ? true : false;
};

subclass$(Bool,Literal);
exports.Bool = Bool; // export class 
Bool.prototype.cache = function (){
	return this;
};

Bool.prototype.isPrimitive = function (){
	return true;
};

Bool.prototype.truthy = function (){
	return String(this.value()) == "true";
	
};

Bool.prototype.js = function (o){
	return String(this._value);
};

Bool.prototype.c = function (){
	STACK._counter += 1;
	
	return String(this._value);
	
};

Bool.prototype.toJSON = function (){
	return {type: 'Bool',value: this._value};
};

Bool.prototype.loc = function (){
	return this._value.region ? this._value.region() : [0,0];
};

function Undefined(){ return Literal.apply(this,arguments) };

subclass$(Undefined,Literal);
exports.Undefined = Undefined; // export class 
Undefined.prototype.isPrimitive = function (){
	return true;
};

Undefined.prototype.isTruthy = function (){
	return false;
};

Undefined.prototype.c = function (){
	return M("undefined",this._value);
};

function Nil(){ return Literal.apply(this,arguments) };

subclass$(Nil,Literal);
exports.Nil = Nil; // export class 
Nil.prototype.isPrimitive = function (){
	return true;
};

Nil.prototype.isTruthy = function (){
	return false;
};

Nil.prototype.c = function (){
	return M("null",this._value);
};

function True(){ return Bool.apply(this,arguments) };

subclass$(True,Bool);
exports.True = True; // export class 
True.prototype.raw = function (){
	return true;
};

True.prototype.isTruthy = function (){
	return true;
};

True.prototype.c = function (){
	return M("true",this._value);
};

function False(){ return Bool.apply(this,arguments) };

subclass$(False,Bool);
exports.False = False; // export class 
False.prototype.raw = function (){
	return false;
};

False.prototype.isTruthy = function (){
	return false;
};

False.prototype.c = function (){
	return M("false",this._value);
};

function Num(v){
	this._traversed = false;
	this._value = v;
};

subclass$(Num,Literal);
exports.Num = Num; // export class 
Num.prototype.toString = function (){
	return String(this._value);
};

Num.prototype.toNumber = function (){
	return parseFloat(String(this._value));
};

Num.prototype.isPrimitive = function (deep){
	return true;
};

Num.prototype.isTruthy = function (){
	return String(this._value) != "0";
};

Num.prototype.shouldParenthesize = function (par){
	if(par === undefined) par = this.up();
	return (par instanceof Access) && par.left() == this;
};

Num.prototype.js = function (o){
	var num = String(this._value);
	return num;
};

Num.prototype.c = function (o){
	if (this._cache) { return Num.prototype.__super__.c.call(this,o) };
	var out = M(String(this._value),this._value);
	var par = STACK.current();
	var paren = (par instanceof Access) && par.left() == this;
	
	return paren ? (("(" + out + ")")) : out;
};

Num.prototype.cache = function (o){
	if (!(o && (o.cache || o.pool))) { return this };
	return Num.prototype.__super__.cache.call(this,o);
};

Num.prototype.raw = function (){
	// really?
	return JSON.parse(String(this.value()));
};

Num.prototype.toJSON = function (){
	return {type: this.typeName(),value: this.raw()};
};

function NumWithUnit(v,unit){
	this._traversed = false;
	this._value = v;
	this._unit = unit;
};



subclass$(NumWithUnit,Literal);
exports.NumWithUnit = NumWithUnit; // export class 
NumWithUnit.prototype.c = function (o){
	let raw = ("" + String(this._value) + String(this._unit));
	return o.css ? raw : (("'" + raw + "'"));
};




function Str(v){
	this._traversed = false;
	this._expression = true;
	this._cache = null;
	this._value = v;
	
};

subclass$(Str,Literal);
exports.Str = Str; // export class 
Str.prototype.isString = function (){
	return true;
};

Str.prototype.isPrimitive = function (deep){
	return true;
};

Str.prototype.raw = function (){
	// JSON.parse requires double-quoted strings,
	// while eval also allows single quotes.
	// NEXT eval is not accessible like this
	// WARNING TODO be careful! - should clean up
	
	return this._raw || (this._raw = String(this.value()).slice(1,-1)); 
};

Str.prototype.isValidIdentifier = function (){
	// there are also some values we cannot use
	return this.raw().match(/^[a-zA-Z\$\_]+[\d\w\$\_]*$/) ? true : false;
};

Str.prototype.js = function (o){
	return String(this._value);
};

Str.prototype.c = function (o){
	return this._cache ? Str.prototype.__super__.c.call(this,o) : ((M(this.js(),this._value)));
};

function TemplateString(){ return ListNode.apply(this,arguments) };

subclass$(TemplateString,ListNode);
exports.TemplateString = TemplateString; // export class 
TemplateString.prototype.js = function (){
	let parts = this._nodes.map(function(node) {
		return ((typeof node=='string'||node instanceof String)) ? node : node.c();
	});
	
	let out = '`' + parts.join('') + '`';
	return out;
};

function Interpolation(){ return ValueNode.apply(this,arguments) };

subclass$(Interpolation,ValueNode);
exports.Interpolation = Interpolation; // export class 





function InterpolatedString(nodes,o){
	if(o === undefined) o = {};
	this._nodes = nodes;
	this._options = o;
	this;
};

subclass$(InterpolatedString,Node);
exports.InterpolatedString = InterpolatedString; // export class 
InterpolatedString.prototype.add = function (part){
	if (part) { this._nodes.push(part) };
	return this;
};

InterpolatedString.prototype.visit = function (){
	for (let i = 0, items = iter$(this._nodes), len = items.length; i < len; i++) {
		items[i].traverse();
	};
	return this;
};

InterpolatedString.prototype.isString = function (){
	return true;
};

InterpolatedString.prototype.escapeString = function (str){
	return str = str.replace(/\n/g,'\\\n');
};

InterpolatedString.prototype.toArray = function (){
	let items = this._nodes.map(function(part,i) {
		if ((part instanceof Token) && part._type == 'NEOSTRING') {
			return new Str('"' + part._value + '"');
		} else {
			return part;
		};
	});
	
	return items;
};

InterpolatedString.prototype.js = function (o){
	var self = this;
	var kind = String(self.option("open") || '"');
	
	var parts = [];
	var str = self._noparen ? '' : '(';
	
	self._nodes.map(function(part,i) {
		if ((part instanceof Token) && part._type == 'NEOSTRING') {
			// esca
			return parts.push(kind + self.escapeString(part._value) + kind);
		} else if (part) {
			if (i == 0) {
				// force first part to be string
				parts.push('""');
			};
			part._parens = true;
			return parts.push(part.c({expression: true}));
		};
	});
	
	str += parts.join(" + ");
	if (!self._noparen) { str += ')' };
	return str;
};


function Symbol(){ return Literal.apply(this,arguments) };

subclass$(Symbol,Literal);
exports.Symbol = Symbol; // export class 
Symbol.prototype.isValidIdentifier = function (){
	return this.raw().match(/^[a-zA-Z\$\_]+[\d\w\$\_]*$/) ? true : false;
};

Symbol.prototype.isPrimitive = function (deep){
	return true;
};

Symbol.prototype.raw = function (){
	return this._raw || (this._raw = AST.sym(this.value().toString().replace(/^\:/,'')));
};

Symbol.prototype.js = function (o){
	return ("'" + AST.sym(this.raw()) + "'");
};

function RegExp(){ return Literal.apply(this,arguments) };

subclass$(RegExp,Literal);
exports.RegExp = RegExp; // export class 
RegExp.prototype.isPrimitive = function (){
	return true;
};

RegExp.prototype.js = function (){
	var m;
	var v = RegExp.prototype.__super__.js.apply(this,arguments);
	
	
	if (m = constants.HEREGEX.exec(v)) {
		// console.log 'matxhed heregex',m
		var re = m[1].replace(constants.HEREGEX_OMIT,'').replace(/\//g,'\\/');
		return '/' + (re || '(?:)') + '/' + m[2];
	};
	
	return (v == '//') ? '/(?:)/' : v;
};


function Arr(){ return Literal.apply(this,arguments) };

subclass$(Arr,Literal);
exports.Arr = Arr; // export class 
Arr.prototype.load = function (value){
	return (value instanceof Array) ? new ArgList(value) : value;
};

Arr.prototype.push = function (item){
	this.value().push(item);
	return this;
};

Arr.prototype.count = function (){
	return this.value().length;
};

Arr.prototype.nodes = function (){
	var val = this.value();
	return (val instanceof Array) ? val : val.nodes();
};

Arr.prototype.splat = function (){
	return this.value().some(function(v) { return v instanceof Splat; });
};

Arr.prototype.visit = function (){
	if (this._value && this._value.traverse) { this._value.traverse() };
	return this;
};

Arr.prototype.isPrimitive = function (deep){
	return !this.value().some(function(v) { return !v.isPrimitive(true); });
};

Arr.prototype.js = function (o){
	var val = this._value;
	if (!val) { return "[]" };
	var nodes = (val instanceof Array) ? val : val.nodes();
	var out = (val instanceof Array) ? AST.cary(val) : val.c();
	return ("[" + out + "]");
};

Arr.prototype.hasSideEffects = function (){
	return this.value().some(function(v) { return v.hasSideEffects(); });
};

Arr.prototype.toString = function (){
	return "Arr";
};

Arr.prototype.indented = function (a,b){
	this._value.indented(a,b);
	return this;
};

Arr.wrap = function (val){
	return new Arr(val);
};


function Obj(){ return Literal.apply(this,arguments) };

subclass$(Obj,Literal);
exports.Obj = Obj; // export class 
Obj.prototype.load = function (value){
	return (value instanceof Array) ? new AssignList(value) : value;
};

Obj.prototype.visit = function (){
	if (this._value) { this._value.traverse() };
	
	
	return this;
};

Obj.prototype.isPrimitive = function (deep){
	return !this.value().some(function(v) { return !v.isPrimitive(true); });
};

Obj.prototype.js = function (o){
	var dyn = this.value().filter(function(v) { return (v instanceof ObjAttr) && ((v.key() instanceof Op) || (v.key() instanceof InterpolatedString)); });
	
	if (dyn.length > 0) {
		var idx = this.value().indexOf(dyn[0]);
		
		
		var tmp = this.scope__().temporary(this);
		
		var first = this.value().slice(0,idx);
		var obj = new Obj(first);
		var ast = [OP('=',tmp,obj)];
		
		this.value().slice(idx).forEach(function(atr) {
			return ast.push(OP('=',OP('.',tmp,atr.key()),atr.value()));
		});
		ast.push(tmp); 
		return new Parens(ast).c();
	};
	
	
	return '{' + this.value().c() + '}';
};

Obj.prototype.add = function (k,v){
	if ((typeof k=='string'||k instanceof String) || (k instanceof Token)) { k = new Identifier(k) };
	var kv = new ObjAttr(k,v);
	this.value().push(kv);
	return kv;
};

Obj.prototype.remove = function (key){
	for (let i = 0, items = iter$(this.value()), len = items.length, k; i < len; i++) {
		k = items[i];
		if (k.key().symbol() == key) { this.value().remove(k) };
	};
	return this;
};

Obj.prototype.keys = function (){
	return Object.keys(this.hash());
};

Obj.prototype.hash = function (){
	var hash = {};
	for (let i = 0, items = iter$(this.value()), len = items.length, k; i < len; i++) {
		k = items[i];
		if (k instanceof ObjAttr) { hash[k.key().symbol()] = k.value() };
	};
	return hash;
	
};


Obj.prototype.key = function (key){
	for (let i = 0, items = iter$(this.value()), len = items.length, k; i < len; i++) {
		k = items[i];
		if ((k instanceof ObjAttr) && k.key().symbol() == key) { return k };
	};
	return null;
};

Obj.prototype.indented = function (a,b){
	this._value.indented(a,b);
	return this;
};

Obj.prototype.hasSideEffects = function (){
	return this.value().some(function(v) { return v.hasSideEffects(); });
};


Obj.wrap = function (obj){
	var attrs = [];
	for (let v, i = 0, keys = Object.keys(obj), l = keys.length, k; i < l; i++){
		k = keys[i];v = obj[k];if (v instanceof Array) {
			v = Arr.wrap(v);
		} else if (v.constructor == Object) {
			v = Obj.wrap(v);
		};
		
		
		v = NODIFY(v);
		
		if ((typeof k=='string'||k instanceof String)) {
			k = new Identifier(k);
		};
		
		attrs.push(new ObjAttr(k,v));
	};
	return new Obj(attrs);
};

Obj.prototype.toString = function (){
	return "Obj";
};

function ObjAttr(key,value,defaults){
	this._traversed = false;
	this._key = key;
	this._value = value;
	this._dynamic = (key instanceof Op);
	this._defaults = defaults;
	this;
};

subclass$(ObjAttr,Node);
exports.ObjAttr = ObjAttr; // export class 
ObjAttr.prototype.key = function(v){ return this._key; }
ObjAttr.prototype.setKey = function(v){ this._key = v; return this; };
ObjAttr.prototype.value = function(v){ return this._value; }
ObjAttr.prototype.setValue = function(v){ this._value = v; return this; };
ObjAttr.prototype.options = function(v){ return this._options; }
ObjAttr.prototype.setOptions = function(v){ this._options = v; return this; };

ObjAttr.prototype.visit = function (stack,state){
	// should probably traverse key as well, unless it is a dead simple identifier
	this.key().traverse();
	if (this.value()) { this.value().traverse() };
	if (this._defaults) { this._defaults.traverse() };
	
	let decl = state && state.declaring;
	
	if (this.key() instanceof Ivar) {
		if (!(this.value())) {
			this.setKey(new Identifier(this.key().value()));
			this.setValue(OP('.',this.scope__().context(),this.key()));
			if (this._defaults) {
				this.setValue(OP('=',this.value(),this._defaults));
				this._defaults = null;
			};
		};
	} else if (this.key() instanceof Private) {
		if (!(this.value())) {
			this.setValue(OP('.',this.scope__().context(),this.key()));
			this.setKey(new Identifier(this.key().value()));
		};
	} else if (this.key() instanceof Identifier) {
		// if state && state:declaring
		// 	key.variable = scope__.register(key.symbol,key)\
		// isnt this rather going to
		
		if (!(this.value())) {
			if (decl) {
				this.setValue(this.scope__().register(this.key().symbol(),this.key(),{type: decl}));
				stack.registerSemanticToken(this.key(),this.value());
				
				if (this._defaults) {
					this.setValue(OP('=',this.value(),this._defaults));
					this._defaults = null;
				};
			} else {
				this.setValue(this.scope__().lookup(this.key().symbol()));
			};
		};
	};
	
	
	
	return this;
};

ObjAttr.prototype.js = function (o){
	let key = this.key();
	let kjs;
	
	
	
	
	if (key instanceof IdentifierExpression) {
		// streamline this interface
		kjs = key.asObjectKey();
	} else if (key.isReserved()) {
		kjs = ("'" + (key.c()) + "'");
	} else if ((key instanceof Str) && key.isValidIdentifier()) {
		kjs = key.raw();
	} else {
		kjs = key.c();
	};
	
	
	
	if (this._defaults) {
		return ("" + kjs + " = " + (this._defaults.c()));
	} else if (this.value()) {
		return ("" + kjs + ": " + (this.value().c()));
	} else {
		return ("" + kjs);
	};
};

ObjAttr.prototype.hasSideEffects = function (){
	return true;
};

ObjAttr.prototype.isPrimitive = function (deep){
	return !this._value || this._value.isPrimitive(deep);
};


function ArgsReference(){ return Node.apply(this,arguments) };

subclass$(ArgsReference,Node);
exports.ArgsReference = ArgsReference; // export class 
ArgsReference.prototype.c = function (){
	return "arguments";
};


function Self(value){
	this._value = value;
};

subclass$(Self,Literal);
exports.Self = Self; // export class 
Self.prototype.cache = function (){
	return this;
};

Self.prototype.reference = function (){
	return this;
};

Self.prototype.visit = function (){
	this.scope__().context();
	return this;
};

Self.prototype.c = function (){
	var s = this.scope__();
	return M((s ? s.context().c() : "this"),this._value);
};

function This(){ return Self.apply(this,arguments) };

subclass$(This,Self);
exports.This = This; // export class 
This.prototype.cache = function (){
	return this;
};

This.prototype.reference = function (){
	return this;
};

This.prototype.visit = function (){
	return this;
};

This.prototype.c = function (){
	return M("this",this._value);
};



function Op(o,l,r){
	// set expression yes, no?
	this._expression = false;
	this._traversed = false;
	this._parens = false;
	this._cache = null;
	this._invert = false;
	this._opToken = o;
	this._op = o && o._value || o;
	
	if (this._op == 'and') {
		this._op = '&&';
	} else if (this._op == 'or') {
		this._op = '||';
	} else if (this._op == 'is') {
		this._op = '===';
	} else if (this._op == 'isnt') {
		this._op = '!==';
	} else if (this._op == 'not') {
		this._op = '!';
	};
	
	this._left = l;
	this._right = r;
	return this;
};

subclass$(Op,Node);
exports.Op = Op; // export class 
Op.prototype.op = function(v){ return this._op; }
Op.prototype.setOp = function(v){ this._op = v; return this; };
Op.prototype.left = function(v){ return this._left; }
Op.prototype.setLeft = function(v){ this._left = v; return this; };
Op.prototype.right = function(v){ return this._right; }
Op.prototype.setRight = function(v){ this._right = v; return this; };

Op.prototype.visit = function (){
	if (this._right) { this._right.traverse() };
	if (this._left) { this._left.traverse() };
	return this;
};

Op.prototype.isExpressable = function (){
	// what if right is a string?!?
	return !(this.right()) || this.right().isExpressable();
};

Op.prototype.startLoc = function (){
	let l = this._left;
	return (l && l.startLoc) ? l.startLoc() : (Op.prototype.__super__.startLoc.apply(this,arguments));
};

Op.prototype.js = function (o){
	var out = null;
	var op = this._op;
	
	var l = this._left;
	var r = this._right;
	
	if (l instanceof Node) { l = l.c() };
	if (r instanceof Node) { r = r.c() };
	
	if (l && r) {
		out = ("" + l + " " + M(op,this._opToken) + " " + r);
	} else if (l) {
		out = ("" + M(op,this._opToken) + l);
	};
	
	return out;
};

Op.prototype.isString = function (){
	return this._op == '+' && this._left && this._left.isString();
};

Op.prototype.shouldParenthesize = function (){
	return this._parens;
	
};

Op.prototype.precedence = function (){
	return 10;
};

Op.prototype.consume = function (node){
	if (this.isExpressable()) { return Op.prototype.__super__.consume.apply(this,arguments) };
	
	
	var tmpvar = this.scope__().declare('tmp',null,{system: true});
	var clone = OP(this.op(),this.left(),null);
	var ast = this.right().consume(clone);
	if (node) { ast.consume(node) };
	return ast;
};

function ComparisonOp(){ return Op.apply(this,arguments) };

subclass$(ComparisonOp,Op);
exports.ComparisonOp = ComparisonOp; // export class 
ComparisonOp.prototype.invert = function (){
	// are there other comparison ops?
	// what about a chain?
	var op = this._op;
	var pairs = ["==","!=","===","!==",">","<=","<",">="];
	var idx = pairs.indexOf(op);
	idx += ((idx % 2) ? (-1) : 1);
	this.setOp(pairs[idx]);
	this._invert = !this._invert;
	return this;
};

ComparisonOp.prototype.c = function (){
	if (this.left() instanceof ComparisonOp) {
		this.left().right().cache();
		return OP('&&',this.left(),OP(this.op(),this.left().right(),this.right())).c();
	} else {
		return ComparisonOp.prototype.__super__.c.apply(this,arguments);
	};
};

ComparisonOp.prototype.js = function (o){
	var op = this._op;
	var l = this._left;
	var r = this._right;
	
	if (l instanceof Node) { l = l.c() };
	if (r instanceof Node) { r = r.c() };
	return ("" + l + " " + M(op,this._opToken) + " " + r);
};


function UnaryOp(){ return Op.apply(this,arguments) };

subclass$(UnaryOp,Op);
exports.UnaryOp = UnaryOp; // export class 
UnaryOp.prototype.invert = function (){
	if (this.op() == '!') {
		return this.left();
	} else {
		return UnaryOp.prototype.__super__.invert.apply(this,arguments); 
	};
};

UnaryOp.prototype.isTruthy = function (){
	var val = AST.truthy(this.left());
	return (val !== undefined) ? ((!val)) : ((undefined));
};

UnaryOp.prototype.startLoc = function (){
	let l = (this._left || this._op);
	return (l && l.startLoc) ? l.startLoc() : this._startLoc;
};

UnaryOp.prototype.js = function (o){
	var l = this._left;
	var r = this._right;
	var op = this.op();
	
	if (op == 'not') {
		op = '!';
	};
	
	if (op == '!') {
		// l.@parens = yes
		var str = l.c();
		var paren = l.shouldParenthesize(this);
		
		
		if (!((str.match(/^\!?([\w\.]+)$/) || (l instanceof Parens) || paren || (l instanceof Access) || (l instanceof Call)) && !str.match(/[\s\&\|]/))) {
			str = '(' + str + ')';
		};
		
		return ("" + op + str);
	} else if (this.left()) {
		return ("" + (l.c()) + op);
	} else {
		return ("" + op + (r.c()));
	};
};

UnaryOp.prototype.normalize = function (){
	if (this.op() == '!') { return this };
	var node = (this.left() || this.right()).node();
	
	return this;
};

UnaryOp.prototype.consume = function (node){
	var norm = this.normalize();
	return (norm == this) ? (UnaryOp.prototype.__super__.consume.apply(this,arguments)) : norm.consume(node);
};

UnaryOp.prototype.c = function (){
	var norm = this.normalize();
	return (norm == this) ? (UnaryOp.prototype.__super__.c.apply(this,arguments)) : norm.c();
};

function InstanceOf(){ return Op.apply(this,arguments) };

subclass$(InstanceOf,Op);
exports.InstanceOf = InstanceOf; // export class 
InstanceOf.prototype.js = function (o){
	// fix checks for String and Number
	
	if ((this.right() instanceof Identifier) || (this.right() instanceof VarOrAccess)) {
		// WARN otherwise - what do we do? does not work with dynamic
		// classes etc? Should probably send to utility function isa$
		var name = AST.c(this.right().value());
		var obj = this.left().node();
		
		if (idx$(name,['String','Number','Boolean']) >= 0) {
			if (STACK.tsc()) {
				return ("(typeof " + (obj.c()) + "=='" + (name.toLowerCase()) + "')");
			};
			
			if (!((obj instanceof LocalVarAccess))) {
				obj.cache();
			};
			
			return ("(typeof " + (obj.c()) + "=='" + (name.toLowerCase()) + "'||" + (obj.c()) + " instanceof " + name + ")");
			
			
		};
	};
	var out = ("" + (this.left().c()) + " instanceof " + (this.right().c()));
	
	
	if (o.parent() instanceof Op) { out = helpers.parenthesize(out) };
	return out;
};

function TypeOf(){ return Op.apply(this,arguments) };

subclass$(TypeOf,Op);
exports.TypeOf = TypeOf; // export class 
TypeOf.prototype.js = function (o){
	return ("typeof " + (this.left().c()));
};

function Delete(){ return Op.apply(this,arguments) };

subclass$(Delete,Op);
exports.Delete = Delete; // export class 
Delete.prototype.js = function (o){
	// TODO this will execute calls several times if the path is not directly to an object
	// need to cache the receiver
	var l = this.left();
	var tmp = this.scope__().temporary(this,{pool: 'val'});
	var o = OP('=',tmp,l);
	
	return ("(" + (o.c()) + ",delete " + (l.c()) + ", " + (tmp.c()) + ")"); 
	
	
	
};

Delete.prototype.shouldParenthesize = function (){
	return true;
};

function In(){ return Op.apply(this,arguments) };

subclass$(In,Op);
exports.In = In; // export class 
In.prototype.invert = function (){
	this._invert = !this._invert;
	return this;
};

In.prototype.js = function (o){
	// var cond = @invert ? "== -1" : ">= 0"
	// var idx = Util.indexOf(left,right)
	var out = this.util().contains(this.left(),this.right());
	return ("" + (this._invert ? '!' : '') + (out.c()));
};





function Access(o,l,r){
	// set expression yes, no?
	this._expression = false;
	this._traversed = false;
	this._parens = false;
	this._cache = null;
	this._invert = false;
	this._op = o && o._value || o;
	this._left = l;
	this._right = r;
	return this;
};

subclass$(Access,Op);
exports.Access = Access; // export class 
Access.prototype.startLoc = function (){
	return (this._left || this._right).startLoc();
};

Access.prototype.endLoc = function (){
	return this._right && this._right.endLoc();
};

Access.prototype.clone = function (left,right){
	var ctor = this.constructor;
	return new ctor(this.op(),left,right);
};

Access.prototype.js = function (o){
	var r;
	var raw = null;
	var lft = this.left();
	var rgt = this.right();
	
	if (rgt instanceof Token) {
		rgt = new Identifier(rgt);
	};
	
	var ctx = (lft || this.scope__().context());
	var pre = "";
	var mark = '';
	
	if (!this._startLoc) {
		this._startLoc = (lft || rgt).startLoc();
	};
	
	if ((lft instanceof Super) && STACK.method() && STACK.method().option('inExtension')) {
		return CALL(
			OP('.',this.scope__().context(),'super$'),
			[(rgt instanceof Identifier) ? rgt.toStr() : rgt]
		).c();
	};
	
	if (rgt instanceof Num) {
		return ctx.c() + "[" + rgt.c() + "]";
	};
	
	
	
	if ((rgt instanceof Index) && ((rgt.value() instanceof Str) || (rgt.value() instanceof Symbol))) {
		rgt = rgt.value();
	};
	
	
	if ((rgt instanceof Str) && rgt.isValidIdentifier()) {
		raw = rgt.raw();
	} else if ((rgt instanceof Symbol) && rgt.isValidIdentifier()) {
		raw = rgt.raw();
	} else if ((rgt instanceof Identifier) && rgt.isValidIdentifier()) {
		// raw = M(rgt.c,rgt)
		raw = rgt.c();
	};
	
	if (this.safechain() && ctx) {
		ctx.cache({force: true});
		pre = ctx.c() + " && ";
	};
	
	
	
	
	
	
	
	var out = raw ? (
		// see if it needs quoting
		// need to check to see if it is legal
		ctx ? (("" + (ctx.c()) + "." + raw)) : raw
	) : (
		r = (rgt instanceof Node) ? rgt.c({expression: true}) : rgt,
		("" + (ctx.c()) + "[" + r + "]")
	);
	
	if ((rgt instanceof Identifier) && (rgt.isPredicate() || rgt.isDangerous())) {
		if (!((this.up() instanceof Call))) { out = ("" + out + "()") };
	};
	
	out = pre + out;
	return out;
};

Access.prototype.visit = function (){
	if (this.left()) { this.left().traverse() };
	if (this.right()) { this.right().traverse() };
	
	if ((this.right() instanceof Identifier) && this.right().toRaw() == 'new') {
		console.log('NEW access!!!');
	};
	
	return;
};

Access.prototype.isExpressable = function (){
	return true;
};

Access.prototype.alias = function (){
	return (this.right() instanceof Identifier) ? this.right().alias() : Access.prototype.__super__.alias.call(this);
};

Access.prototype.safechain = function (){
	// right.safechain
	return String(this._op) == '..' || String(this._op) == '?.';
};

Access.prototype.cache = function (o){
	return ((this.right() instanceof Ivar) && !(this.left())) ? this : Access.prototype.__super__.cache.call(this,o);
};

Access.prototype.shouldParenthesizeInTernary = function (){
	return this._parens || this._cache;
};



function LocalVarAccess(){ return Access.apply(this,arguments) };

subclass$(LocalVarAccess,Access);
exports.LocalVarAccess = LocalVarAccess; // export class 
LocalVarAccess.prototype.safechain = function(v){ return this._safechain; }
LocalVarAccess.prototype.setSafechain = function(v){ this._safechain = v; return this; };

LocalVarAccess.prototype.js = function (o){
	if ((this.right() instanceof Variable) && this.right().type() == 'meth') {
		if (!((this.up() instanceof Call))) { return ("" + (this.right().c()) + "()") };
	};
	
	return this.right().c();
};

LocalVarAccess.prototype.variable = function (){
	return this.right();
};

LocalVarAccess.prototype.cache = function (o){
	if(o === undefined) o = {};
	if (o.force) { LocalVarAccess.prototype.__super__.cache.call(this,o) };
	return this;
};

LocalVarAccess.prototype.alias = function (){
	return this.variable()._alias || LocalVarAccess.prototype.__super__.alias.call(this);
};



function PropertyAccess(o,l,r){
	this._traversed = false;
	this._invert = false;
	this._parens = false;
	this._expression = false; 
	this._cache = null;
	this._op = o;
	this._left = l;
	this._right = r;
	return this;
};

subclass$(PropertyAccess,Access);
exports.PropertyAccess = PropertyAccess; // export class 
PropertyAccess.prototype.visit = function (){
	if (this._right) { this._right.traverse() };
	if (this._left) { this._left.traverse() };
	return this;
};




PropertyAccess.prototype.js = function (o){
	// if var rec = receiver
	// 	var ast = CALL(OP('.',left,right),[]) # convert to ArgList or null
	// 	ast.receiver = rec
	// 	return ast.c
	
	var up = this.up();
	
	
	var js = ("" + PropertyAccess.prototype.__super__.js.call(this,o));
	return js;
};


PropertyAccess.prototype.receiver = function (){
	if (this.left() instanceof Super) {
		return SELF;
	} else {
		return null;
	};
};

function IvarAccess(){ return Access.apply(this,arguments) };

subclass$(IvarAccess,Access);
exports.IvarAccess = IvarAccess; // export class 
IvarAccess.prototype.visit = function (){
	if (this._right) { this._right.traverse() };
	this._left ? this._left.traverse() : this.scope__().context();
	return this;
};

IvarAccess.prototype.cache = function (){
	// WARN hmm, this is not right... when accessing on another object it will need to be cached
	return this;
};



function IndexAccess(){ return Access.apply(this,arguments) };

subclass$(IndexAccess,Access);
exports.IndexAccess = IndexAccess; // export class 
IndexAccess.prototype.cache = function (o){
	if(o === undefined) o = {};
	if (o.force) { return IndexAccess.prototype.__super__.cache.apply(this,arguments) };
	this.right().cache();
	return this;
};


function VarOrAccess(value){
	// should rather call up to valuenode?
	this._traversed = false;
	this._parens = false;
	this._value = value;
	this._identifier = value;
	this._token = value._value;
	this._variable = null;
	this;
};

subclass$(VarOrAccess,ValueNode);
exports.VarOrAccess = VarOrAccess; // export class 
VarOrAccess.prototype.startLoc = function (){
	return this._token.startLoc();
};

VarOrAccess.prototype.endLoc = function (){
	return this._token.endLoc();
};


VarOrAccess.prototype.visit = function (stack,state){
	// @identifier = value # this is not a real identifier?
	var variable;
	var scope = this.scope__();
	
	if (state && state.declaring) {
		// console.log "VarOrAccess {@identifier}"
		variable = scope.register(this.value(),this,{type: state.declaring});
	};
	
	variable || (variable = scope.lookup(this.value().symbol()));
	
	
	if (variable && variable.declarator()) {
		// var decl = variable.declarator
		let vscope = variable.scope();
		
		
		
		
		
		if (vscope == scope && !variable._initialized) {
			
			// here we need to check if the variable exists outside
			// if it does - we need to ensure that the inner variable does not collide
			let outerVar = scope.parent().lookup(this.value());
			if (outerVar) {
				variable._virtual = true;
				variable._shadowing = outerVar;
				variable = outerVar;
			};
		};
		
		
		
		
		if (variable && variable._initialized || (scope.closure() != vscope.closure())) {
			this._variable = variable;
			variable.addReference(this);
			this._value = variable; 
			this._token._variable = variable;
			stack.registerSemanticToken(this._token,variable);
			
			
			if (variable && this._identifier.isInternal()) {
				stack.registerSemanticToken(this._token,this._variable);
			};
			return this;
		};
		
		
	} else if (stack.hasImplicitSelf() && !this._identifier.isCapitalized()) {
		let ctx = scope.context();
		if ((ctx instanceof RootScopeContext) || ctx.isGlobalContext()) {
			true;
		} else {
			this._value = new Access(".",ctx,this._value);
			stack.registerSemanticToken(this._token,'accessor');
		};
	} else if (this._identifier.isInternal()) {
		this._value = new Access(".",scope.context(),this._value);
	};
	
	return this;
};





VarOrAccess.prototype.js = function (o){
	var v;
	return (this._variable || this._value).c();
	
	if (v = this._variable) {
		return v.c();
	};
	throw 'not implemented';
};

VarOrAccess.prototype.node = function (){
	return this._variable ? this : this.value();
};

VarOrAccess.prototype.symbol = function (){
	return this._identifier.symbol();
	
};

VarOrAccess.prototype.cache = function (o){
	if(o === undefined) o = {};
	return this._variable ? ((o.force && VarOrAccess.prototype.__super__.cache.call(this,o))) : this.value().cache(o);
};

VarOrAccess.prototype.decache = function (){
	this._variable ? VarOrAccess.prototype.__super__.decache.call(this) : this.value().decache();
	return this;
};

VarOrAccess.prototype.dom = function (){
	return this.value().dom();
};

VarOrAccess.prototype.safechain = function (){
	return this._identifier.safechain();
};

VarOrAccess.prototype.dump = function (){
	return {loc: this.loc()};
};

VarOrAccess.prototype.loc = function (){
	var loc = this._identifier.region();
	return loc || [0,0];
};

VarOrAccess.prototype.region = function (){
	return this._identifier.region();
};

VarOrAccess.prototype.shouldParenthesizeInTernary = function (){
	return this._cache || (this._value && this._value._cache) || this._parens;
};

VarOrAccess.prototype.toString = function (){
	return ("VarOrAccess(" + this.value() + ")");
};

VarOrAccess.prototype.toJSON = function (){
	return {type: this.typeName(),value: this._identifier.toString()};
};


function VarReference(value,type){
	if (value instanceof VarOrAccess) {
		value = value.value();
		this._variable = null;
	} else if (value instanceof Variable) {
		this._variable = value;
		value = "";
	};
	
	
	VarReference.prototype.__super__.constructor.call(this,value);
	this._export = false;
	this._type = type && String(type);
	this._declared = true; 
};


subclass$(VarReference,ValueNode);
exports.VarReference = VarReference; // export class 
VarReference.prototype.variable = function(v){ return this._variable; }
VarReference.prototype.setVariable = function(v){ this._variable = v; return this; };
VarReference.prototype.declared = function(v){ return this._declared; }
VarReference.prototype.setDeclared = function(v){ this._declared = v; return this; };
VarReference.prototype.type = function(v){ return this._type; }
VarReference.prototype.setType = function(v){ this._type = v; return this; };

VarReference.prototype.loc = function (){
	return this._value.region();
};

VarReference.prototype.declare = function (){
	return this;
};

VarReference.prototype.consume = function (node){
	// really? the consumed node dissappear?
	this._variable && this._variable.autodeclare();
	return this;
};

VarReference.prototype.visit = function (stack,state){
	var vars = [];
	
	this._value.traverse({declaring: this._type,variables: vars});
	
	if (this._value instanceof Identifier) {
		this._value._variable || (this._value._variable = this.scope__().register(this._value.symbol(),this,{type: this._type}));
		vars.push(this._value._variable);
		stack.registerSemanticToken(this._value,this._variable);
	};
	
	for (let i = 0, len = vars.length, variable; i < len; i++) {
		// should always be autodeclared?
		variable = vars[i];
		variable._virtual = true;
		variable.autodeclare();
	};
	
	return this;
};

VarReference.prototype.js = function (o){
	return this._value.c();
};




function Assign(o,l,r){
	// set expression yes, no?
	this._expression = false;
	this._traversed = false;
	this._parens = false;
	this._cache = null;
	this._invert = false;
	this._opToken = o;
	this._op = o && o._value || o;
	this._left = l;
	this._right = r;
	return this;
};

subclass$(Assign,Op);
exports.Assign = Assign; // export class 
Assign.prototype.isExpressable = function (){
	return !(this.right()) || this.right().isExpressable();
};

Assign.prototype.isUsed = function (){
	// really?
	// if up is a block in general this should not be used -- since it should already have received implicit self?
	if (this.up() instanceof Block) { // && up.last != self
		return false;
	};
	return true;
};


Assign.prototype.visit = function (){
	var l = this._left;
	var r = this._right;
	
	if ((l instanceof VarOrAccess) && (r instanceof VarOrAccess) && l._identifier.symbol() == r._identifier.symbol()) {
		this._left = l = new Access(".",this.scope__().context(),l._value);
	};
	
	if (r) {
		r.traverse({assignment: true});
	};
	
	if (l) {
		l.traverse();
	};
	
	return this;
};

Assign.prototype.c = function (o){
	if (!this.right().isExpressable()) {
		if ((this.left() instanceof VarReference) && this.left().type() == 'let') {
			// when does this occur?
			// console.log 'unexpressable let var assignment'
			return new Block([this.left(),BR,this.right().consume(this)]).c(o);
		};
		return this.right().consume(this).c(o);
	};
	
	return Assign.prototype.__super__.c.call(this,o);
};

Assign.prototype.js = function (o){
	var m, typ;
	if (!this.right().isExpressable()) {
		this.p("Assign#js right is not expressable ");
		
		
		return this.right().consume(this).c();
	};
	var l = this.left().node();
	var r = this.right();
	
	if ((l instanceof Access) && (l.left() instanceof Super)) {
		if (m = STACK.method()) {
			if (m.option('inExtension')) {
				let key = l.right();
				if (key instanceof Identifier) { key = key.toStr() };
				
				let op = CALL(
					OP('.',this.scope__().context(),'super$set'),
					[key,this.right()]
				);
				return op.c({expression: true});
			};
		};
	};
	
	
	if (l instanceof Self) {
		var ctx = this.scope__().context();
		l = ctx.reference();
	};
	
	var lc = l.c();
	var out = ("" + lc + " " + this.op() + " " + this.right().c({expression: true}));
	
	if (typ = (this.option('datatype') || l.option('datatype'))) {
		if (!(l instanceof VarReference)) {
			out = '/** @type {' + typ.c() + '} */\n' + out;
		};
	};
	
	
	if (l instanceof Obj) {
		out = ("(" + out + ")");
	};
	
	return out;
};





Assign.prototype.shouldParenthesize = function (par){
	if(par === undefined) par = this.up();
	return this._parens || (par instanceof Op) && par.op() != '=';
};

Assign.prototype.consume = function (node){
	if (node instanceof TagLike) {
		if (this.right() instanceof TagLike) {
			this.right().set({assign: this.left()});
			return this.right().consume(node);
		} else {
			return this;
		};
	};
	
	if (this.isExpressable()) {
		this.forceExpression();
		return Assign.prototype.__super__.consume.call(this,node);
	};
	
	var ast = this.right().consume(this);
	return ast.consume(node);
};


function PushAssign(){ return Assign.apply(this,arguments) };

subclass$(PushAssign,Assign);
exports.PushAssign = PushAssign; // export class 
PushAssign.prototype.consumed = function(v){ return this._consumed; }
PushAssign.prototype.setConsumed = function(v){ this._consumed = v; return this; };

PushAssign.prototype.register = function (node){
	this._consumed || (this._consumed = []);
	this._consumed.push(node);
	return this;
};

PushAssign.prototype.js = function (o){
	return ("" + (this.left().c()) + ".push(" + (this.right().c()) + ")");
};

PushAssign.prototype.consume = function (node){
	return this;
};

function TagPushAssign(){ return PushAssign.apply(this,arguments) };

subclass$(TagPushAssign,PushAssign);
exports.TagPushAssign = TagPushAssign; // export class 
TagPushAssign.prototype.js = function (o){
	return ("" + (this.left().c()) + ".push(" + (this.right().c()) + ")");
};

TagPushAssign.prototype.consume = function (node){
	return this;
};


function ConditionalAssign(){ return Assign.apply(this,arguments) };

subclass$(ConditionalAssign,Assign);
exports.ConditionalAssign = ConditionalAssign; // export class 
ConditionalAssign.prototype.consume = function (node){
	return this.normalize().consume(node);
};

ConditionalAssign.prototype.normalize = function (){
	var l = this.left().node();
	var ls = l;
	
	if (l instanceof Access) {
		
		if (l.left()) {
			l.left().cache();
		};
		ls = l.clone(l.left(),l.right()); 
		
		if (l instanceof PropertyAccess) { // correct now, to a certain degree
			l.cache();
		};
		
		if ((l instanceof IndexAccess) || (l.right() instanceof IdentifierExpression)) {
			l.right().cache();
		};
		
		
		
	};
	
	
	
	var expr = this.right().isExpressable();
	var ast = null;
	
	if (expr && this.op() == '||=') {
		ast = OP('||',l,OP('=',ls,this.right()));
	} else if (expr && this.op() == '&&=') {
		ast = OP('&&',l,OP('=',ls,this.right()));
	} else {
		ast = IF(this.condition(),OP('=',ls,this.right()),l); 
		ast.setScope(null);
		
		
		
	};
	if (ast.isExpressable()) { ast.toExpression() };
	return ast;
};


ConditionalAssign.prototype.c = function (){
	// WARN what if we return the same?
	return this.normalize().c();
};

ConditionalAssign.prototype.condition = function (){
	
	// use switch instead to cache op access
	if (this.op() == '?=') {
		return OP('==',this.left(),NULL);
	} else if (this.op() == '||=') {
		return OP('!',this.left());
	} else if (this.op() == '&&=') {
		return this.left();
	} else if (this.op() == '!?=') {
		return OP('!=',this.left(),NULL);
	} else {
		return this.left();
	};
};

ConditionalAssign.prototype.js = function (o){
	var ast = IF(this.condition(),OP('=',this.left(),this.right()),this.left());
	ast.setScope(null); 
	if (ast.isExpressable()) { ast.toExpression() }; 
	return ast.c();
};

function CompoundAssign(){ return Assign.apply(this,arguments) };

subclass$(CompoundAssign,Assign);
exports.CompoundAssign = CompoundAssign; // export class 
CompoundAssign.prototype.consume = function (node){
	if (this.isExpressable()) { return CompoundAssign.prototype.__super__.consume.apply(this,arguments) };
	
	var ast = this.normalize();
	if (ast != this) { return ast.consume(node) };
	
	ast = this.right().consume(this);
	return ast.consume(node);
};

CompoundAssign.prototype.normalize = function (){
	var ln = this.left().node();
	
	if (!((ln instanceof PropertyAccess))) {
		return this;
	};
	
	if (ln.left()) { ln.left().cache() };
	
	var ast = OP('=',this.left(),OP(this.op()[0],this.left(),this.right()));
	if (ast.isExpressable()) { ast.toExpression() };
	
	return ast;
};

CompoundAssign.prototype.c = function (){
	var ast = this.normalize();
	if (ast == this) { return CompoundAssign.prototype.__super__.c.apply(this,arguments) };
	
	
	
	
	var up = STACK.current();
	if (up instanceof Block) {
		// an alternative would be to just pass
		up.replace(this,ast);
	};
	return ast.c();
};


function TypeAnnotation(value){
	this._parts = value;
	
	this;
};

subclass$(TypeAnnotation,Node);
exports.TypeAnnotation = TypeAnnotation; // export class 
TypeAnnotation.prototype.add = function (item){
	return this._parts.push(item);
};

TypeAnnotation.prototype.startLoc = function (){
	return this._parts[0].startLoc();
};

TypeAnnotation.prototype.endLoc = function (){
	return this._parts[this._parts.length - 1].endLoc();
};

TypeAnnotation.prototype.c = function (){
	return M(this._parts.map(function(item) { return item._value; }).join(""),this);
};





function Identifier(value){
	if (value instanceof Token) {
		this._startLoc = value.startLoc();
	};
	this._value = this.load(value);
	this._symbol = null;
	
	if (("" + value).indexOf("?") >= 0) {
		this._safechain = true;
	};
	
	this;
};

subclass$(Identifier,Node);
exports.Identifier = Identifier; // export class 
Identifier.prototype.safechain = function(v){ return this._safechain; }
Identifier.prototype.setSafechain = function(v){ this._safechain = v; return this; };
Identifier.prototype.value = function(v){ return this._value; }
Identifier.prototype.setValue = function(v){ this._value = v; return this; };
Identifier.prototype.variable = function(v){ return this._variable; }
Identifier.prototype.setVariable = function(v){ this._variable = v; return this; };

Identifier.prototype.isStatic = function (){
	return true;
};

Identifier.prototype.toRaw = function (){
	return this._value._value || this._value;
};

Identifier.prototype.add = function (part){
	return new IdentifierExpression(this).add(part);
};

Identifier.prototype.references = function (variable){
	if (this._value) { this._value._variable = variable };
	if (this._value) { STACK.registerSemanticToken(this._value,variable) };
	return this;
};

Identifier.prototype.load = function (v){
	return ((v instanceof Identifier) ? v.value() : v);
};

Identifier.prototype.traverse = function (){
	// NODES.push(self)
	return this;
};

Identifier.prototype.visit = function (){
	
	if (this._value instanceof Node) {
		// console.log "IDENTIFIER VALUE IS NODE"
		this._value.traverse();
	};
	return this;
};

Identifier.prototype.region = function (){
	return [this._value._loc,this._value._loc + this._value._len];
};

Identifier.prototype.startLoc = function (){
	return (this._value && this._value.startLoc) ? this._value.startLoc() : null;
};

Identifier.prototype.endLoc = function (){
	return (this._value && this._value.endLoc) ? this._value.endLoc() : null;
};

Identifier.prototype.loc = function (){
	return [this.startLoc(),this.endLoc()];
};

Identifier.prototype.isValidIdentifier = function (){
	return true;
};

Identifier.prototype.isReserved = function (){
	return this._value.reserved || RESERVED_TEST.test(String(this._value));
};

Identifier.prototype.isPredicate = function (){
	return (/\?$/).test(String(this._value));
};

Identifier.prototype.isDangerous = function (){
	return (/\!$/).test(String(this._value));
};

Identifier.prototype.isCapitalized = function (){
	return (/^[A-Z]/).test(String(this._value));
};

Identifier.prototype.isInternal = function (){
	return (/^\$/).test(String(this._value));
};

Identifier.prototype.symbol = function (){
	return this._symbol || (this._symbol = AST.sym(this.value()));
};

Identifier.prototype.toString = function (){
	return String(this._value);
};

Identifier.prototype.toStr = function (){
	return new Str("'" + this.symbol() + "'");
};

Identifier.prototype.toAttrString = function (){
	return new Str("'" + String(this._value) + "'");
};

Identifier.prototype.toJSON = function (){
	return this.toString();
};

Identifier.prototype.alias = function (){
	return AST.sym(this._value);
};

Identifier.prototype.js = function (o){
	return this._variable ? this._variable.c() : this.symbol();
};

Identifier.prototype.c = function (o){
	let up = STACK.current();
	if (((up instanceof Util) && !(up instanceof Util.Iterable))) { return this.toStr().c() }; 
	let out = this.js();
	if (OPTS.sourceMap && (!o || o.mark !== false)) {
		out = M(out,this._token || this._value);
	};
	return out;
};

Identifier.prototype.dump = function (){
	return {loc: this.region()};
};

Identifier.prototype.namepath = function (){
	return this.toString();
};

Identifier.prototype.shouldParenthesizeInTernary = function (){
	return this._parens || this._cache;
};

Identifier.prototype.registerVariable = function (type,scope){
	if(scope === undefined) scope = this.scope__();
	this._variable = scope.register(this.symbol(),this,{type: type});
	this.stack().registerSemanticToken(this._value,this._variable);
	return this;
};

Identifier.prototype.resolveVariable = function (scope){
	if(scope === undefined) scope = this.scope__();
	let variable = this.scope__().lookup(this.symbol());
	this._variable = variable;
	this.stack().registerSemanticToken(this._value,this._variable);
	return this;
};

function DecoratorIdentifier(){ return Identifier.apply(this,arguments) };

subclass$(DecoratorIdentifier,Identifier);
exports.DecoratorIdentifier = DecoratorIdentifier; // export class 
DecoratorIdentifier.prototype.symbol = function (){
	return ("decorator$" + this._value.slice(1));
};

DecoratorIdentifier.prototype.toString = function (){
	return this.symbol();
};

function Private(){ return Identifier.apply(this,arguments) };

subclass$(Private,Identifier);
exports.Private = Private; // export class 
Private.prototype.symbol = function (){
	return this._symbol || (this._symbol = AST.sym('__' + this.value()));
};

Private.prototype.add = function (part){
	return new IdentifierExpression(this.value()).add(part).set({prefix: '__',private: true});
};








function TagIdRef(v){
	this._value = (v instanceof Identifier) ? v.value() : v;
	this;
};

subclass$(TagIdRef,Identifier);
exports.TagIdRef = TagIdRef; // export class 
TagIdRef.prototype.c = function (){
	return ("" + (this.scope__().imba().c()) + ".getTagSingleton('" + this.value().c().substr(1) + "')");
};






function Ivar(v){
	this._value = (v instanceof Identifier) ? v.value() : v;
	this;
};

subclass$(Ivar,Identifier);
exports.Ivar = Ivar; // export class 
Ivar.prototype.name = function (){
	return helpers.dashToCamelCase(this._value).replace(/^[\#]/,'');
	
};

Ivar.prototype.alias = function (){
	return this.name();
};


Ivar.prototype.js = function (o){
	return this.symbol();
};


function Decorator(){ return ValueNode.apply(this,arguments) };

subclass$(Decorator,ValueNode);
exports.Decorator = Decorator; // export class 
Decorator.prototype.name = function (){
	return this._name || (this._name = this._value.js());
};

Decorator.prototype.visit = function (){
	var block;
	this._variable = this.scope__().lookup(this.name());
	this._value._variable || (this._value._variable = this._variable);
	
	if (this._call) { this._call.traverse() };
	if (this.option('params')) {
		this._params = this.option('params');
		this._params.traverse();
	};
	
	if (block = this.up()) {
		block._decorators || (block._decorators = []);
		return block._decorators.push(this);
	};
};

Decorator.prototype.c = function (){
	// should return other places as well...
	if (STACK.current() instanceof ClassBody) { return };
	
	let out = this._value.c();
	
	if (this._params) {
		out += (".bind([" + this._params.c({expression: true}) + "])");
	} else {
		out += ".bind([])";
	};
	return out;
};



function Const(){ return Identifier.apply(this,arguments) };

subclass$(Const,Identifier);
exports.Const = Const; // export class 
Const.prototype.symbol = function (){
	// console.log "Identifier#symbol {value}"
	return this._symbol || (this._symbol = AST.sym(this.value()));
};

Const.prototype.js = function (o){
	return this._variable ? this._variable.c() : this.symbol();
};

Const.prototype.traverse = function (){
	if (this._traversed) {
		return this;
	};
	
	this._traversed = true;
	var curr = STACK.current();
	if (!(curr instanceof Access) || curr.left() == this) {
		if (this.symbol() == "Imba") {
			this._variable = this.scope__().imba();
		} else {
			this._variable = this.scope__().lookup(this.value());
		};
	};
	return this;
};

Const.prototype.c = function (){
	if (this.option('export')) {
		return ("exports." + (this._value) + " = ") + this.js();
	} else {
		return Const.prototype.__super__.c.apply(this,arguments);
	};
};


function TagTypeIdentifier(value){
	this._token = value;
	this._value = this.load(value);
	this;
};

subclass$(TagTypeIdentifier,Identifier);
exports.TagTypeIdentifier = TagTypeIdentifier; // export class 
TagTypeIdentifier.prototype.name = function(v){ return this._name; }
TagTypeIdentifier.prototype.setName = function(v){ this._name = v; return this; };
TagTypeIdentifier.prototype.ns = function(v){ return this._ns; }
TagTypeIdentifier.prototype.setNs = function(v){ this._ns = v; return this; };

TagTypeIdentifier.prototype.startLoc = function (){
	return this._token && this._token.startLoc  &&  this._token.startLoc();
};

TagTypeIdentifier.prototype.endLoc = function (){
	return this._token && this._token.endLoc  &&  this._token.endLoc();
};


TagTypeIdentifier.prototype.load = function (val){
	this._str = ("" + val);
	var parts = this._str.split(":");
	this._raw = val;
	this._name = parts.pop();
	this._ns = parts.shift(); 
	return this._str;
};

TagTypeIdentifier.prototype.js = function (o){
	return "'" + this.toNodeName() + "'";
};

TagTypeIdentifier.prototype.c = function (){
	return this.js();
};

TagTypeIdentifier.prototype.func = function (){
	var name = this._name.replace(/-/g,'_').replace(/\#/,'');
	if (this._ns) { name += ("$" + (this._ns.toLowerCase())) };
	return name;
};

TagTypeIdentifier.prototype.nativeCreateNode = function (){
	if (this.isSVG()) {
		return CALL(LIT('imba.document.createElementNS'),[STR("http://www.w3.org/2000/svg"),STR(this.name())]);
	} else {
		return CALL(LIT('imba.document.createElement'),[STR(this.name())]);
		
	};
};

TagTypeIdentifier.prototype.isClass = function (){
	return !(!this._str.match(/^[A-Z]/));
};

TagTypeIdentifier.prototype.isNative = function (){
	return !this._ns && TAG_TYPES.HTML.indexOf(this._str) >= 0;
};

TagTypeIdentifier.prototype.isNativeSVG = function (){
	return this._ns == 'svg' && TAG_TYPES.SVG.indexOf(this._str) >= 0;
};

TagTypeIdentifier.prototype.isSVG = function (){
	return this._ns == 'svg' || (!(this.isNative()) && !this._ns && TAG_TYPES.SVG.indexOf(this._str) >= 0);
};

TagTypeIdentifier.prototype.isCustom = function (){
	return !(this.isNative()) && !(this.isNativeSVG());
};

TagTypeIdentifier.prototype.isComponent = function (){
	return !(this.isNative()) && !(this.isNativeSVG());
};

TagTypeIdentifier.prototype.isSimpleNative = function (){
	return this.isNative() && !(/input|textarea|select|form|iframe/).test(this._str);
};

TagTypeIdentifier.prototype.toFunctionalType = function (){
	return LIT(this._str);
};

TagTypeIdentifier.prototype.toSelector = function (){
	return this.toNodeName();
};

TagTypeIdentifier.prototype.toClassName = function (){
	let str = this._str;
	if (str == 'element') {
		return 'Element';
	} else if (str == 'svg:element') {
		return 'SVGElement';
	} else if (str == 'htmlelement') {
		return 'HTMLElement';
	} else if (str == 'fragment') {
		return 'DocumentFragment';
	};
	
	let match = TAG_NAMES[this.isSVG() ? (("svg_" + (this._name))) : this._name];
	if (match) { return match.name };
	
	if (this._str == 'fragment') {
		return 'DocumentFragment';
	} else if (this.isClass()) {
		return this._str;
	} else {
		return helpers.pascalCase(this._str + '-component');
	};
};

TagTypeIdentifier.prototype.toNodeName = function (){
	if (this.isClass()) {
		return this._nodeName || (this._nodeName = helpers.dasherize(this._str + '-' + this.fid()));
	} else {
		return this._str;
	};
};

TagTypeIdentifier.prototype.id = function (){
	var m = this._str.match(/\#([\w\-\d\_]+)\b/);
	return m ? m[1] : null;
};


TagTypeIdentifier.prototype.flag = function (){
	return "_" + this.name().replace(/--/g,'_').toLowerCase();
};

TagTypeIdentifier.prototype.sel = function (){
	return ("." + this.flag()); 
};

TagTypeIdentifier.prototype.string = function (){
	return this.value();
};

TagTypeIdentifier.prototype.toString = function (){
	return this.value();
};

function InterpolatedIdentifier(){ return ValueNode.apply(this,arguments) };

subclass$(InterpolatedIdentifier,ValueNode);
exports.InterpolatedIdentifier = InterpolatedIdentifier; // export class 
InterpolatedIdentifier.prototype.js = function (){
	return ("[" + (this.value().c()) + "]");
};

function Argvar(){ return ValueNode.apply(this,arguments) };

subclass$(Argvar,ValueNode);
exports.Argvar = Argvar; // export class 
Argvar.prototype.c = function (){
	// NEXT -- global.parseInt or Number.parseInt (better)
	var v = parseInt(String(this.value()));
	
	if (v == 0) { return "arguments" };
	
	var s = this.scope__();
	
	var par = s.params().at(v - 1,true);
	return ("" + AST.c(par.name())); 
};




function BangCall(){ return ValueNode.apply(this,arguments) };

subclass$(BangCall,ValueNode);
exports.BangCall = BangCall; // export class 
BangCall.prototype.c = function (){
	return ("" + (this._value.c()) + "()");
};

function Call(callee,args,opexists){
	this._traversed = false;
	this._expression = false;
	this._parens = false;
	this._cache = null;
	this._receiver = null;
	this._opexists = opexists;
	
	if (callee instanceof BangCall) {
		callee = callee.value();
	};
	
	if (callee instanceof VarOrAccess) {
		var str = callee.value().symbol();
		if (str == 'new') {
			console.log('calling');
		};
		if (str == 'extern') {
			callee.value().value()._type = 'EXTERN';
			return new ExternDeclaration(args);
		};
		if (str == 'tag') {
			// console.log "ERROR - access args by some method"
			return new TagWrapper((args && args.index) ? args.index(0) : args[0]);
		};
		if (str == 'export') {
			return new Export(args);
		};
	};
	
	this._callee = callee;
	this._args = args || new ArgList([]);
	
	if (args instanceof Array) {
		this._args = new ArgList(args);
	};
	
	if (callee instanceof Decorator) {
		callee._call = this;
		return callee;
	};
	
	return this;
};

subclass$(Call,Node);
exports.Call = Call; // export class 
Call.prototype.callee = function(v){ return this._callee; }
Call.prototype.setCallee = function(v){ this._callee = v; return this; };
Call.prototype.receiver = function(v){ return this._receiver; }
Call.prototype.setReceiver = function(v){ this._receiver = v; return this; };
Call.prototype.args = function(v){ return this._args; }
Call.prototype.setArgs = function(v){ this._args = v; return this; };
Call.prototype.block = function(v){ return this._block; }
Call.prototype.setBlock = function(v){ this._block = v; return this; };





Call.prototype.loc = function (){
	return this._callee.loc();
};

Call.prototype.visit = function (){
	this.args().traverse();
	this.callee().traverse();
	
	
	return this._block && this._block.traverse();
};

Call.prototype.addBlock = function (block){
	var pos = this._args.filter(function(n,i) { return n == '&'; })[0]; 
	pos ? this.args().replace(pos,block) : this.args().push(block);
	return this;
};

Call.prototype.receiver = function (){
	return this._receiver || (this._receiver = ((this.callee() instanceof Access) && this.callee().left() || NULL));
};



Call.prototype.safechain = function (){
	return this.callee().safechain(); 
};

Call.prototype.shouldParenthesizeInTernary = function (){
	return this._parens || this.safechain() || this._cache;
};

Call.prototype.startLoc = function (){
	return (this._startLoc || this._callee && this._callee.startLoc) ? this._callee.startLoc() : 0;
};

Call.prototype.endLoc = function (){
	return this._endLoc || (this._args && this._args.endLoc()) || this._callee.endLoc();
};

Call.prototype.js = function (o){
	var m;
	var opt = {expression: true};
	var rec = null;
	
	var args = this.args();
	
	
	
	var splat = args.some(function(v) { return v instanceof Splat; });
	
	var out = null;
	var lft = null;
	var rgt = null;
	var wrap = null;
	
	var callee = this._callee = this._callee.node(); 
	
	
	
	
	if (callee instanceof Access) {
		lft = callee.left();
		rgt = callee.right();
	};
	
	if (callee instanceof Super) {
		if (m = STACK.method()) {
			// console.log "in method {m} {m.name} {m.option('inExtension')}"
			if (m.option('inExtension')) {
				callee = OP('.',callee,m.name());
				this._receiver = this.scope__().context();
				
				
			};
		};
		
		this;
		
	};
	
	
	if (callee instanceof PropertyAccess) { // && rec = callee.receiver
		this._receiver = callee.receiver();
		callee = this._callee = new Access(callee.op(),callee.left(),callee.right());
	};
	
	if ((rgt instanceof Identifier) && rgt.value() == 'assert' && !splat && false) {
		let arg = args.first();
		arg.option('assertion',true);
		args._nodes[0] = new AssertionNode(arg);
		
		
		
	};
	
	if (callee.safechain()) {
		var isfn = new Util.IsFunction([callee]);
		wrap = [("" + (isfn.c()) + "  &&  "),""];
		callee = OP('.',callee.left(),callee.right());
		
	};
	
	
	if (this._receiver) {
		// quick workaround
		if (!((this._receiver instanceof ScopeContext))) { this._receiver.cache() };
		args.unshift(this.receiver());
		
		out = ("" + callee.c({expression: true}) + ".call(" + args.c({expression: true,mark: false}) + ")");
	} else {
		out = ("" + callee.c({expression: true}) + "(" + args.c({expression: true,mark: false}) + ")");
	};
	
	if (wrap) {
		// we set the cachevar inside
		if (this._cache) {
			this._cache.manual = true;
			out = ("(" + (this.cachevar().c()) + "=" + out + ")");
		};
		
		out = [wrap[0],out,wrap[1]].join("");
	};
	
	return out;
};




function ImplicitCall(){ return Call.apply(this,arguments) };

subclass$(ImplicitCall,Call);
exports.ImplicitCall = ImplicitCall; // export class 
ImplicitCall.prototype.js = function (o){
	return ("" + (this.callee().c()) + "()");
};

function Instantiation(){ return ValueNode.apply(this,arguments) };

subclass$(Instantiation,ValueNode);
exports.Instantiation = Instantiation; // export class 
Instantiation.prototype.js = function (o){
	return ("" + M('new',this.keyword()) + " " + (this.value().c()));
};

function New(){ return Call.apply(this,arguments) };

subclass$(New,Call);
exports.New = New; // export class 
New.prototype.visit = function (){
	this.keyword().warn('Value.new is deprecated - use new Value');
	return New.prototype.__super__.visit.apply(this,arguments);
};

New.prototype.endLoc = function (){
	return this.keyword() && this.keyword().endLoc() || New.prototype.__super__.endLoc.apply(this,arguments);
};

New.prototype.startLoc = function (){
	return null;
};

New.prototype.js = function (o){
	var target = this.callee();
	
	while (target instanceof Access){
		let left = target.left();
		
		if ((left instanceof PropertyAccess) || (left instanceof VarOrAccess)) {
			this.callee()._parens = true;
			break;
		};
		
		target = left;
	};
	
	
	var out = ("" + M('new',this.keyword()) + " " + M(this.callee().c(),this.callee()));
	if (!((o.parent() instanceof Call))) { out += '()' };
	return out;
};


function ExternDeclaration(){ return ListNode.apply(this,arguments) };

subclass$(ExternDeclaration,ListNode);
exports.ExternDeclaration = ExternDeclaration; // export class 
ExternDeclaration.prototype.visit = function (){
	this.setNodes(this.map(function(item) { return item.node(); })); 
	
	var root = this.scope__();
	for (let i = 0, items = iter$(this.nodes()), len = items.length, item; i < len; i++) {
		item = items[i];
		var variable = root.register(item.symbol(),item,{type: 'global'});
		variable.addReference(item);
	};
	return this;
};

ExternDeclaration.prototype.c = function (){
	return "// externs";
};




function ControlFlow(){ return Node.apply(this,arguments) };

subclass$(ControlFlow,Node);
exports.ControlFlow = ControlFlow; // export class 
ControlFlow.prototype.loc = function (){
	return this._body ? this._body.loc() : [0,0];
};

function ControlFlowStatement(){ return ControlFlow.apply(this,arguments) };

subclass$(ControlFlowStatement,ControlFlow);
exports.ControlFlowStatement = ControlFlowStatement; // export class 
ControlFlowStatement.prototype.isExpressable = function (){
	return false;
};


function If(cond,body,o){
	if(o === undefined) o = {};
	this.setup();
	this._test = cond; 
	this._body = body;
	this._alt = null;
	this._type = o.type;
	if (this._type == 'unless') this.invert();
	this._scope = new IfScope(this);
	this;
};

subclass$(If,ControlFlow);
exports.If = If; // export class 
If.prototype.test = function(v){ return this._test; }
If.prototype.setTest = function(v){ this._test = v; return this; };
If.prototype.body = function(v){ return this._body; }
If.prototype.setBody = function(v){ this._body = v; return this; };
If.prototype.alt = function(v){ return this._alt; }
If.prototype.setAlt = function(v){ this._alt = v; return this; };
If.prototype.scope = function(v){ return this._scope; }
If.prototype.setScope = function(v){ this._scope = v; return this; };
If.prototype.prevIf = function(v){ return this._prevIf; }
If.prototype.setPrevIf = function(v){ this._prevIf = v; return this; };

If.ternary = function (cond,body,alt){
	// prefer to compile it this way as well
	var obj = new If(cond,new Block([body]),{type: '?'});
	obj.addElse(new Block([alt]));
	return obj;
};

If.prototype.addElse = function (add){
	if (this.alt() && (this.alt() instanceof If)) {
		this.alt().addElse(add);
	} else {
		this.setAlt(add);
		if (add instanceof If) {
			add.setPrevIf(this);
		};
	};
	return this;
};

If.prototype.loc = function (){
	return this._loc || (this._loc = [this._type ? this._type._loc : 0,this.body().loc()[1]]);
};

If.prototype.invert = function (){
	if (this._test instanceof ComparisonOp) {
		return this._test = this._test.invert();
	} else {
		return this._test = new UnaryOp('!',this._test,null);
	};
};

If.prototype.visit = function (stack){
	var alt = this.alt();
	
	if (this._scope) { this._scope.visit() };
	if (this.test()) { this.test().traverse() };
	
	this._tag = stack._tag;
	
	
	
	for (let o = this._scope.varmap(), variable, i = 0, keys = Object.keys(o), l = keys.length, name; i < l; i++){
		name = keys[i];variable = o[name];if (variable.type() == 'let') {
			// console.log "variable virtualize"
			variable._virtual = true;
			variable.autodeclare();
		};
	};
	
	
	
	
	
	if (!stack.isAnalyzing() && !stack.tsc()) {
		this._pretest = AST.truthy(this.test());
		
		if (this._pretest === true) {
			// only collapse if condition includes compiletime flags?
			alt = this._alt = null;
			if (this.test() instanceof EnvFlag) {
				this._preunwrap = true;
			};
		} else if (this._pretest === false) {
			this.loc(); 
			this.setBody(null);
		};
	};
	
	if (this.body()) { this.body().traverse() };
	
	
	if (alt) {
		STACK.pop(this);
		alt._scope || (alt._scope = new BlockScope(alt));
		alt.traverse();
		STACK.push(this);
	};
	
	
	if (this._type == '?' && this.isExpressable()) this.toExpression();
	return this;
};


If.prototype.js = function (o){
	var v_, test_;
	var body = this.body();
	
	var brace = {braces: true,indent: true};
	
	if (this._pretest === true && this._preunwrap) {
		// what if it is inside expression?
		let js = body ? body.c({braces: !(!(this.prevIf()))}) : 'true';
		
		if (!(this.prevIf())) {
			js = helpers.normalizeIndentation(js);
		};
		
		if (o.isExpression()) {
			js = '(' + js + ')';
		};
		
		return js;
	} else if (this._pretest === false && false) {
		if (this.alt() instanceof If) { (this.alt().setPrevIf(v_ = this.prevIf()),v_) };
		let js = this.alt() ? this.alt().c({braces: !(!(this.prevIf()))}) : '';
		
		if (!(this.prevIf())) {
			js = helpers.normalizeIndentation(js);
		};
		
		return js;
	};
	
	
	if (o.isExpression()) {
		
		if ((test_ = this.test()) && test_.shouldParenthesizeInTernary  &&  test_.shouldParenthesizeInTernary()) {
			this.test()._parens = true;
		};
		
		var cond = this.test().c({expression: true}); 
		
		var code = body ? body.c() : 'true'; 
		
		if (body && body.shouldParenthesizeInTernary()) {
			code = '(' + code + ')'; 
		};
		
		if (this.alt()) {
			var altbody = this.alt().c();
			if (this.alt().shouldParenthesizeInTernary()) {
				altbody = '(' + altbody + ')';
			};
			
			return ("" + cond + " ? " + code + " : " + altbody);
		} else {
			// again - we need a better way to decide what needs parens
			// maybe better if we rewrite this to an OP('&&'), and put
			// the parens logic there
			// cond should possibly have parens - but where do we decide?
			if (this._tag) {
				return ("" + cond + " ? " + code + " : void(0)");
			} else {
				return ("" + cond + " && " + code);
			};
		};
	} else {
		// if there is only a single item - and it is an expression?
		code = null;
		cond = this.test().c({expression: true}); 
		
		
		
		if ((body instanceof Block) && body.count() == 1 && !(body.first() instanceof LoopFlowStatement)) {
			body = body.first();
		};
		
		
		
		
		
		code = body ? body.c({braces: true}) : '{}'; 
		
		
		var out = ("" + M('if',this._type) + " (" + cond + ") ") + code; 
		if (this.alt()) { out += (" else " + this.alt().c((this.alt() instanceof If) ? {} : brace)) };
		return out;
	};
};


If.prototype.shouldParenthesize = function (){
	return !!this._parens;
};

If.prototype.consume = function (node){
	if (node instanceof TagLike) {
		// now we are reconsuming this
		node.flag(F.TAG_HAS_BRANCHES);
		
		if (node.body() == this) {
			let branches = [this._body];
			let alt = this._alt;
			
			while (alt instanceof If){
				branches.push(alt._body);
				alt = alt._alt;
			};
			
			if (alt) {
				branches.push(alt);
			};
			
			for (let i = 0, len = branches.length; i < len; i++) {
				node._branches.push([]);
				branches[i].consume(node);
			};
			
			return this;
		};
		
		if (node instanceof TagLoopFragment) {
			if (this._body) {
				this._body = this._body.consume(node);
			};
			
			if (this._alt) {
				this._alt = this._alt.consume(node);
			};
			return this;
		} else {
			return node.register(this);
		};
		
		return this;
	};
	
	if ((node instanceof TagPushAssign) || (node instanceof TagFragment)) {
		node.register(this);
		if (this._body) { this._body = this._body.consume(node) };
		if (this._alt) { this._alt = this._alt.consume(node) };
		return this;
	};
	
	
	
	
	var isRet = (node instanceof Return);
	
	
	
	if (this._expression || ((!isRet || this._type == '?') && this.isExpressable())) {
		this.toExpression(); 
		return If.prototype.__super__.consume.call(this,node);
	} else {
		if (this._body) { this._body = this._body.consume(node) };
		if (this._alt) { this._alt = this._alt.consume(node) };
	};
	return this;
};


If.prototype.isExpressable = function (){
	// process:stdout.write 'x'
	var exp = (!(this.body()) || this.body().isExpressable()) && (!(this.alt()) || this.alt().isExpressable());
	return exp;
};



function Loop(options){
	if(options === undefined) options = {};
	this._traversed = false;
	this._options = options;
	this._body = null;
	this;
};

subclass$(Loop,Statement);
exports.Loop = Loop; // export class 
Loop.prototype.scope = function(v){ return this._scope; }
Loop.prototype.setScope = function(v){ this._scope = v; return this; };
Loop.prototype.options = function(v){ return this._options; }
Loop.prototype.setOptions = function(v){ this._options = v; return this; };
Loop.prototype.body = function(v){ return this._body; }
Loop.prototype.setBody = function(v){ this._body = v; return this; };
Loop.prototype.catcher = function(v){ return this._catcher; }
Loop.prototype.setCatcher = function(v){ this._catcher = v; return this; };
Loop.prototype.elseBody = function(v){ return this._elseBody; }
Loop.prototype.setElseBody = function(v){ this._elseBody = v; return this; };

Loop.prototype.loc = function (){
	var a = this._options.keyword;
	var b = this._body;
	
	if (a && b) {
		// FIXME does not support POST_ variants yet
		return [a._loc,b.loc()[1]];
	} else {
		return [0,0];
	};
};

Loop.prototype.set = function (obj){
	this._options || (this._options = {});
	var keys = Object.keys(obj);
	for (let i = 0, items = iter$(keys), len = items.length, k; i < len; i++) {
		k = items[i];
		this._options[k] = obj[k];
	};
	return this;
};


Loop.prototype.addBody = function (body){
	this.setBody(AST.blk(body));
	return this;
};

Loop.prototype.addElse = function (block){
	this.setElseBody(block);
	return this;
};

Loop.prototype.isReactive = function (){
	return this._tag && this._tag.fragment().isReactive();
};

Loop.prototype.c = function (o){
	
	var s = this.stack();
	var curr = s.current();
	
	if (this.stack().isExpression() || this.isExpression()) {
		// what the inner one should not be an expression though?
		// this will resut in an infinite loop, no?!?
		this.scope().closeScope();
		
		var ast = CALL(FN([],[this]),[]);
		return ast.c(o);
	} else if ((this.stack().current() instanceof Block) || ((s.up() instanceof Block) && s.current()._consumer == this)) {
		return Loop.prototype.__super__.c.call(this,o);
	} else if (this._tag) {
		return Loop.prototype.__super__.c.call(this,0);
	} else {
		
		this.scope().closeScope();
		ast = CALL(FN([],[this]),[]);
		
		return ast.c(o);
		
	};
};



function While(test,opts){
	this._traversed = false;
	this._test = test;
	this._options = opts || {};
	this._scope = new WhileScope(this);
	
	if (this.option('invert')) {
		// "invert test for while {@test}"
		this._test = test.invert();
	};
	
};


subclass$(While,Loop);
exports.While = While; // export class 
While.prototype.test = function(v){ return this._test; }
While.prototype.setTest = function(v){ this._test = v; return this; };

While.prototype.visit = function (){
	this.scope().visit();
	if (this.test()) { this.test().traverse() };
	if (this.body()) { return this.body().traverse() };
};

While.prototype.loc = function (){
	var o = this._options;
	return helpers.unionOfLocations(o.keyword,this._body,o.guard,this._test);
};





While.prototype.consume = function (node){
	
	// This is never expressable, but at some point
	// we might want to wrap it in a function (like CS)
	if (this.isExpressable()) { return While.prototype.__super__.consume.apply(this,arguments) };
	var reuse = false;
	
	
	
	
	
	
	
	
	
	
	var resvar = this.scope().declare('res',new Arr([]),{system: true});
	
	this._catcher = new PushAssign("push",resvar,null); 
	this.body().consume(this._catcher); 
	
	
	var ast = new Block([this,resvar.accessor()]); 
	return ast.consume(node);
	
	
	
};


While.prototype.js = function (o){
	var out = ("while (" + this.test().c({expression: true}) + ")") + this.body().c({braces: true,indent: true}); 
	
	if (this.scope().vars().count() > 0) {
		
		out = this.scope().vars().c() + ';' + out;
		
	};
	return out;
};





function For(o){
	if(o === undefined) o = {};
	this._traversed = false;
	this._options = o;
	this._scope = new ForScope(this);
	this._catcher = null;
};

subclass$(For,Loop);
exports.For = For; // export class 
For.prototype.loc = function (){
	var o = this._options;
	return helpers.unionOfLocations(o.keyword,this._body,o.guard,o.step,o.source);
};

For.prototype.ref = function (){
	return this._ref || ("" + (this._tag.fragment().cvar()) + "." + this.oid());
};

For.prototype.visit = function (stack){
	this.scope().visit();
	
	var parent = stack._tag;
	
	this.options().source.traverse(); 
	
	
	if (this.options().guard) {
		var op = IF(this.options().guard.invert(),Block.wrap([new ContinueStatement("continue")]));
		this.body().unshift(op,BR);
	};
	
	this.declare();
	
	
	
	if (parent) {
		// TODO remove
		this._tag = parent;
		stack._tag = this;
		this._level = (this._tag && this._tag._level || 0) + 1;
	};
	
	this.body().traverse();
	stack._tag = parent;
	return this;
};

For.prototype.isBare = function (src){
	return src && src._variable && src._variable._isArray;
};

For.prototype.declare = function (){
	var o = this.options();
	var scope = this.scope();
	var src = o.source;
	var vars = o.vars = {};
	var oi = o.index;
	
	var bare = this.isBare(src);
	
	
	
	
	if (src instanceof Range) {
		
		let from = src.left();
		let to = src.right();
		let dynamic = !((from instanceof Num)) || !((to instanceof Num));
		
		if (to instanceof Num) {
			vars.len = to;
		} else {
			// vars:len = scope.vars.push(vars:index.assignment(src.left))
			// vars:len = to.cache(force: yes, pool: 'len').predeclare
			vars.len = scope.declare('len',to,{type: 'let'});
			
		};
		
		
		vars.value = scope.declare(o.name,from,{type: 'let'});
		if (o.name) { vars.value.addReference(o.name) };
		
		if (o.index) {
			vars.index = scope.declare(o.index,0,{type: 'let'});
			vars.index.addReference(o.index);
		} else {
			vars.index = vars.value;
		};
		
		if (dynamic) {
			vars.diff = scope.declare('rd',OP('-',vars.len,vars.value),{type: 'let'});
		};
	} else {
		if (oi) {
			vars.index = scope.declare(oi,0,{type: 'let'});
		} else {
			vars.index = scope.declare('i',new Num(0),{system: true,type: 'let',pool: 'counter'});
		};
		
		vars.source = bare ? src : scope.declare('items',this.util().iterable(src),{system: true,type: 'let',pool: 'iter'});
		vars.len = scope.declare('len',this.util().len(vars.source),{type: 'let',pool: 'len',system: true});
		
		if (o.name) {
			this.body().unshift(new VarDeclaration(o.name,OP('.',vars.source,vars.index),'let'),BR);
		};
		
		if (oi) { vars.index.addReference(oi) };
	};
	
	return this;
};

For.prototype.consume = function (node){
	if (node instanceof TagLike) {
		return node.register(this);
	};
	
	if (this.isExpressable()) {
		return For.prototype.__super__.consume.apply(this,arguments);
	};
	
	if (this._resvar) {
		var ast = new Block([this,BR,this._resvar.accessor()]);
		ast.consume(node);
		return ast;
	};
	
	var resvar = null;
	var reuseable = false;
	var assignee = null;
	
	
	resvar = this._resvar || (this._resvar = this.scope().register('res',null,{system: true,type: 'var'}));
	
	this._catcher = new PushAssign("push",resvar,null); 
	let resval = new Arr([]);
	this.body().consume(this._catcher); 
	resvar.autodeclare(); 
	
	if ((node instanceof VarDeclaration) || (node instanceof Assign)) {
		node.setRight(resvar.accessor());
		
		return new Block([
			OP('=',resvar,resval),
			BR,
			this,
			BR,
			node
		]);
	} else if (node) {
		let block = [OP('=',resvar,resval),BR,this,BR,resvar.accessor().consume(node)];
		return new Block(block);
	};
	
	return this;
};

For.prototype.js = function (o){
	var vars = this.options().vars;
	var idx = vars.index;
	var val = vars.value;
	var src = this.options().source;
	
	var cond;
	var final;
	
	if (src instanceof Range) {
		let a = src.left();
		let b = src.right();
		let inc = src.inclusive();
		
		cond = OP(inc ? '<=' : '<',val,vars.len);
		final = OP('++',val);
		
		if (vars.diff) {
			cond = If.ternary(OP('>',vars.diff,new Num(0)),cond,OP(inc ? '>=' : '>',val,vars.len));
			final = If.ternary(OP('>',vars.diff,new Num(0)),OP('++',val),OP('--',val));
		};
		
		if (idx && idx != val) {
			final = new ExpressionBlock([final,OP('++',idx)]);
		};
	} else {
		cond = OP('<',idx,vars.len);
		
		if (this.options().step) {
			final = OP('=',idx,OP('+',idx,this.options().step));
		} else {
			final = OP('++',idx);
		};
	};
	
	var before = "";
	var after = "";
	
	var code = this.body().c({braces: true,indent: true});
	var head = ("" + M('for',this.keyword()) + " (" + (this.scope().vars().c()) + "; " + cond.c({expression: true}) + "; " + final.c({expression: true}) + ") ");
	
	return before + head + code + after;
};



function ForIn(){ return For.apply(this,arguments) };

subclass$(ForIn,For);
exports.ForIn = ForIn; // export class 


function ForOf(){ return For.apply(this,arguments) };

subclass$(ForOf,For);
exports.ForOf = ForOf; // export class 
ForOf.prototype.source = function(v){ return this._source; }
ForOf.prototype.setSource = function(v){ this._source = v; return this; };

ForOf.prototype.declare = function (){
	var value_;
	var o = this.options();
	var vars = o.vars = {};
	var k;
	var v;
	
	
	
	if (o.own) {
		vars.source = o.source._variable || this.scope().declare('o',o.source,{system: true,type: 'let'});
		o.value = o.index;
		
		var i = vars.index = this.scope().declare('i',new Num(0),{system: true,type: 'let',pool: 'counter'});
		
		var keys = vars.keys = this.scope().declare('keys',Util.keys(vars.source.accessor()),{system: true,type: 'let'}); 
		var l = vars.len = this.scope().declare('l',Util.len(keys.accessor()),{system: true,type: 'let'});
		k = vars.key = this.scope().declare(o.name,null,{type: 'let'}); 
		
		if ((o.value instanceof Obj) || (o.value instanceof Arr)) {
			this.body().unshift(new VarDeclaration(o.value,OP('.',vars.source,k),'let'),BR);
			vars.value = null;
		} else if (o.value) {
			v = vars.value = this.scope().declare(o.value,null,{let: true,type: 'let'});
		};
	} else {
		this.setSource(vars.source = STACK.tsc() ? o.source : this.util().iterable(o.source));
		vars.value = o.value = o.name; 
		o.value.traverse({declaring: 'let'});
		
		if (o.value instanceof Identifier) {
			// v = vars:value = scope.declare(o:name,null,let: yes, type: 'let')
			(value_ = o.value)._variable || (value_._variable = this.scope__().register(o.value.symbol(),o.value,{type: 'let'}));
			STACK.registerSemanticToken(o.value);
		};
		
		
		if (o.index) {
			vars.counter = this.scope().parent().temporary(null,{},("" + (o.index) + "$"));
			this.body().unshift(new VarDeclaration(o.index,OP('++',vars.counter),'let'),BR);
			this;
		};
	};
	
	
	if (v && o.index) { v.addReference(o.index) };
	if (k && o.name) { k.addReference(o.name) };
	
	return this;
};

ForOf.prototype.js = function (o){
	var vars = this.options().vars;
	var osrc = this.options().source;
	var src = vars.source;
	var k = vars.key;
	var v = vars.value;
	var i = vars.index;
	
	var code;
	
	if (this.options().own) {
		// FIXME are we sure about this?
		if (v && v.refcount() > 0) {
			this.body().unshift(OP('=',v,OP('.',src,k)));
		};
		
		this.body().unshift(OP('=',k,OP('.',vars.keys,i)));
		code = this.body().c({indent: true,braces: true}); 
		var head = ("" + M('for',this.keyword()) + " (" + (this.scope().vars().c()) + "; " + (OP('<',i,vars.len).c()) + "; " + (OP('++',i).c()) + ")");
		return head + code;
	} else {
		// compile to a naive for of loop
		code = this.scope().c({braces: true,indent: true});
		
		
		let js = ("" + M('for',this.keyword()) + " (" + (o.es5() ? 'var' : 'let') + " " + (v.c()) + " of " + src.c({expression: true}) + ")") + code;
		if (vars.counter) {
			js = ("" + (vars.counter) + " = 0; " + js);
		};
		return js;
	};
};

ForOf.prototype.head = function (){
	var v = this.options().vars;
	
	return [
		OP('=',v.key,OP('.',v.keys,v.index)),
		v.value && OP('=',v.value,OP('.',v.source,v.key))
	];
};


function Begin(body){
	this._nodes = AST.blk(body).nodes();
};


subclass$(Begin,Block);
exports.Begin = Begin; // export class 
Begin.prototype.shouldParenthesize = function (){
	return this.isExpression();
};



function Switch(a,b,c){
	this._traversed = false;
	this._source = a;
	this._cases = b;
	this._fallback = c;
};


subclass$(Switch,ControlFlowStatement);
exports.Switch = Switch; // export class 
Switch.prototype.source = function(v){ return this._source; }
Switch.prototype.setSource = function(v){ this._source = v; return this; };
Switch.prototype.cases = function(v){ return this._cases; }
Switch.prototype.setCases = function(v){ this._cases = v; return this; };
Switch.prototype.fallback = function(v){ return this._fallback; }
Switch.prototype.setFallback = function(v){ this._fallback = v; return this; };


Switch.prototype.visit = function (){
	for (let i = 0, items = iter$(this.cases()), len = items.length; i < len; i++) {
		items[i].traverse();
	};
	if (this.fallback()) { this.fallback().traverse() };
	if (this.source()) { this.source().traverse() };
	return;
};


Switch.prototype.consume = function (node){
	if (node instanceof TagLike) {
		if (node.body() == this) {
			let branches = this._cases.slice(0).concat([this._fallback]);
			for (let i = 0, items = iter$(branches), len = items.length, block; i < len; i++) {
				block = items[i];
				if (!block) { continue; };
				node._branches.push([]);
				block.consume(node);
			};
			return this;
		};
		return node.register(this);
	};
	
	this._cases = this._cases.map(function(item) { return item.consume(node); });
	if (this._fallback) { this._fallback = this._fallback.consume(node) };
	return this;
};

Switch.prototype.c = function (o){
	if (this.stack().isExpression() || this.isExpression()) {
		var ast = CALL(FN([],[this]),[]);
		return ast.c(o);
	};
	
	return Switch.prototype.__super__.c.call(this,o);
};


Switch.prototype.js = function (o){
	var body = [];
	
	for (let i = 0, items = iter$(this.cases()), len = items.length, part; i < len; i++) {
		part = items[i];
		part.autobreak();
		body.push(part);
	};
	
	if (this.fallback()) {
		body.push("default:\n" + this.fallback().c({indent: true}));
	};
	
	return ("switch (" + (this.source().c()) + ") ") + helpers.bracketize(AST.cary(body).join("\n"),true);
};



function SwitchCase(test,body){
	this._traversed = false;
	this._test = test;
	this._body = AST.blk(body);
	this._scope = new BlockScope(this);
};

subclass$(SwitchCase,ControlFlowStatement);
exports.SwitchCase = SwitchCase; // export class 
SwitchCase.prototype.test = function(v){ return this._test; }
SwitchCase.prototype.setTest = function(v){ this._test = v; return this; };
SwitchCase.prototype.body = function(v){ return this._body; }
SwitchCase.prototype.setBody = function(v){ this._body = v; return this; };


SwitchCase.prototype.visit = function (){
	this.scope__().visit();
	return this.body().traverse();
};

SwitchCase.prototype.consume = function (node){
	this.body().consume(node);
	return this;
};


SwitchCase.prototype.autobreak = function (){
	if (!((this.body().last() instanceof BreakStatement))) { this.body().push(new BreakStatement()) };
	return this;
};


SwitchCase.prototype.js = function (o){
	if (!((this._test instanceof Array))) { this._test = [this._test] };
	var cases = this._test.map(function(item) { return ("case " + (item.c()) + ": "); });
	return cases.join("\n") + this.body().c({indent: true,braces: true});
};



function Try(body,c,f){
	this._traversed = false;
	this._body = AST.blk(body);
	this._catch = c;
	this._finally = f;
};


subclass$(Try,ControlFlowStatement);
exports.Try = Try; // export class 
Try.prototype.body = function(v){ return this._body; }
Try.prototype.setBody = function(v){ this._body = v; return this; };



Try.prototype.consume = function (node){
	this._body = this._body.consume(node);
	if (this._catch) { this._catch = this._catch.consume(node) };
	if (this._finally) { this._finally = this._finally.consume(node) };
	return this;
};


Try.prototype.visit = function (){
	this._body.traverse();
	if (this._catch) { this._catch.traverse() };
	if (this._finally) { return this._finally.traverse() };
	
};


Try.prototype.js = function (o){
	var out = "try " + this.body().c({braces: true,indent: true});
	if (this._catch) { out += " " + this._catch.c() };
	if (this._finally) { out += " " + this._finally.c() };
	
	if (!(this._catch || this._finally)) {
		out += (" catch (e) \{ \}");
	};
	out += ";";
	return out;
};



function Catch(body,varname){
	this._traversed = false;
	this._body = AST.blk(body || []);
	this._scope = new CatchScope(this);
	this._varname = varname;
	this;
};

subclass$(Catch,ControlFlowStatement);
exports.Catch = Catch; // export class 
Catch.prototype.body = function(v){ return this._body; }
Catch.prototype.setBody = function(v){ this._body = v; return this; };

Catch.prototype.consume = function (node){
	this._body = this._body.consume(node);
	return this;
};


Catch.prototype.visit = function (){
	this._scope.visit();
	this._variable = this._scope.register(this._varname,this,{pool: 'catchvar'});
	return this._body.traverse();
};


Catch.prototype.js = function (o){
	// only indent if indented by default?
	return ("catch (" + (this._variable.c()) + ") ") + this._body.c({braces: true,indent: true});
};






function Finally(body){
	this._traversed = false;
	this._body = AST.blk(body || []);
};


subclass$(Finally,ControlFlowStatement);
exports.Finally = Finally; // export class 
Finally.prototype.visit = function (){
	return this._body.traverse();
};


Finally.prototype.consume = function (node){
	// swallow silently
	return this;
};


Finally.prototype.js = function (o){
	return "finally " + this._body.c({braces: true,indent: true});
};




function Range(){ return Op.apply(this,arguments) };

subclass$(Range,Op);
exports.Range = Range; // export class 
Range.prototype.inclusive = function (){
	return this.op() == '..';
};

Range.prototype.c = function (){
	return "range";
};


function Splat(){ return ValueNode.apply(this,arguments) };

subclass$(Splat,ValueNode);
exports.Splat = Splat; // export class 
Splat.prototype.js = function (o){
	return ("..." + (this.value().c()));
	
	var par = this.stack().parent();
	if ((par instanceof ArgList) || (par instanceof Arr)) {
		return ("Array.from(" + (this.value().c()) + ")");
	} else {
		this.p(("what is the parent? " + par));
		return "SPLAT";
	};
};

Splat.prototype.node = function (){
	return this.value();
};





function IdentifierExpression(value){
	IdentifierExpression.prototype.__super__.constructor.apply(this,arguments);
	this._static = true;
	this._nodes = [this._single = value];
};

subclass$(IdentifierExpression,Node);
exports.IdentifierExpression = IdentifierExpression; // export class 
IdentifierExpression.prototype.single = function(v){ return this._single; }
IdentifierExpression.prototype.setSingle = function(v){ this._single = v; return this; };

IdentifierExpression.wrap = function (node){
	return node;
	return (node instanceof this) ? node : new this(node);
};

IdentifierExpression.prototype.add = function (part){
	this._nodes.push(part);
	this._single = null;
	return this;
};

IdentifierExpression.prototype.isPrimitive = function (){
	return this._single && (this._single instanceof Token);
};

IdentifierExpression.prototype.isStatic = function (){
	return this.isPrimitive();
};

IdentifierExpression.prototype.visit = function (){
	for (let i = 0, items = iter$(this._nodes), len = items.length, node; i < len; i++) {
		node = items[i];
		if (!((node instanceof Node))) { continue; };
		node.traverse();
	};
	return this;
};

IdentifierExpression.prototype.asObjectKey = function (){
	if (this.isPrimitive()) {
		return ("" + this._single.c());
	} else if (this._single) {
		return ("[" + this._single.c() + "]");
	} else {
		return ("[" + this.asString() + "]");
	};
};

IdentifierExpression.prototype.startLoc = function (){
	var $1;
	let n = this._nodes[0];
	return ($1 = n) && $1.startLoc  &&  $1.startLoc();
};

IdentifierExpression.prototype.endLoc = function (){
	var $1;
	let n = this._nodes[this._nodes.length - 1];
	return ($1 = n) && $1.endLoc  &&  $1.endLoc();
};

IdentifierExpression.prototype.asIdentifier = function (){
	return this._single ? (("[" + this._single.c() + "]")) : (("[" + this.asString() + "]"));
};

IdentifierExpression.prototype.asString = function (){
	// what if a part is a string?	
	let s = '`';
	if (this.option('prefix')) {
		s += this.option('prefix');
	};
	for (let i = 0, items = iter$(this._nodes), len = items.length, node; i < len; i++) {
		node = items[i];
		if (node instanceof Token) {
			s += node.value();
		} else {
			s += '${';
			s += node.c();
			s += '}';
		};
	};
	s += '`';
	return s;
};

IdentifierExpression.prototype.toRaw = function (){
	return this._single ? this._single.c() : '';
};

IdentifierExpression.prototype.toString = function (){
	return this.toRaw();
};

IdentifierExpression.prototype.js = function (s,o){
	if(o === undefined) o = {};
	if (o.as == 'string' || (s.parent() instanceof Util)) {
		return this.asString();
	} else if (o.as == 'key') {
		return this.asObjectKey();
	} else if (o.as == 'access') {
		return true;
	} else if (this._single && (this._single instanceof Node)) {
		return this._single.c(o);
	} else {
		return this.asString();
	};
};

function TagPart(value,owner){
	this._name = this.load(value);
	this._tag = owner;
	this._chain = [];
	this._special = false;
	this._params = null;
	this;
};

subclass$(TagPart,Node);
exports.TagPart = TagPart; // export class 
TagPart.prototype.name = function(v){ return this._name; }
TagPart.prototype.setName = function(v){ this._name = v; return this; };
TagPart.prototype.value = function(v){ return this._value; }
TagPart.prototype.setValue = function(v){ this._value = v; return this; };
TagPart.prototype.params = function(v){ return this._params; }
TagPart.prototype.setParams = function(v){ this._params = v; return this; };

TagPart.prototype.load = function (value){
	return value;
};

TagPart.prototype.isSpecial = function (){
	return this._special;
};

TagPart.prototype.visit = function (){
	this._chain.map(function(v) { return v.traverse(); });
	if (this._value) { this._value.traverse() };
	if (this._name.traverse) { this._name.traverse() };
	return this;
};

TagPart.prototype.quoted = function (){
	return this._quoted || (this._quoted = ((this._name instanceof IdentifierExpression) ? this._name.asString() : helpers.singlequote(this._name)));
};

TagPart.prototype.valueIsStatic = function (){
	return !(this.value()) || this.value().isPrimitive() || ((this.value() instanceof Func) && !this.value().nonlocals());
};

TagPart.prototype.isStatic = function (){
	return this.valueIsStatic();
};

TagPart.prototype.isProxy = function (){
	return false;
};

TagPart.prototype.add = function (item,type){
	if (type == TagArgList) {
		(this._last || this).setParams(item || new ListNode([]));
	} else {
		this._chain.push(this._last = new TagModifier(item));
	};
	return this;
};

TagPart.prototype.modifiers = function (){
	return this._modifiers || (this._modifiers = new TagModifiers(this._chain).traverse());
};

TagPart.prototype.js = function (){
	return "";
};

TagPart.prototype.ref = function (){
	return ("c$." + this.oid());
};

function TagId(){ return TagPart.apply(this,arguments) };

subclass$(TagId,TagPart);
exports.TagId = TagId; // export class 
TagId.prototype.js = function (){
	return ("id=" + this.quoted());
};

function TagFlag(){ return TagPart.apply(this,arguments) };

subclass$(TagFlag,TagPart);
exports.TagFlag = TagFlag; // export class 
TagFlag.prototype.condition = function(v){ return this._condition; }
TagFlag.prototype.setCondition = function(v){ this._condition = v; return this; };

TagFlag.prototype.rawClassName = function (){
	return this.name().toRaw();
};

TagFlag.prototype.value = function (){
	return this._name;
};

TagFlag.prototype.visit = function (){
	this._chain.map(function(v) { return v.traverse(); });
	
	if (this._condition) { this._condition.traverse() };
	if (this._name.traverse) { return this._name.traverse() };
};

TagFlag.prototype.isStatic = function (){
	return !(this.isConditional()) && ((this._name instanceof Token) || this._name.isStatic());
};

TagFlag.prototype.isConditional = function (){
	return !(!(this.condition()));
};

TagFlag.prototype.js = function (){
	// NOT used anymore
	let val = this.value().c({as: 'string'});
	return this.condition() ? (("flags.toggle(" + val + "," + (this.condition().c()) + ")")) : (("classList.add(" + val + ")"));
};

function TagSep(){ return TagPart.apply(this,arguments) };

subclass$(TagSep,TagPart);
exports.TagSep = TagSep; // export class 


function TagArgList(){ return TagPart.apply(this,arguments) };

subclass$(TagArgList,TagPart);
exports.TagArgList = TagArgList; // export class 


function TagAttr(){ return TagPart.apply(this,arguments) };

subclass$(TagAttr,TagPart);
exports.TagAttr = TagAttr; // export class 
TagAttr.prototype.isSpecial = function (){
	return String(this._name) == 'value';
};

TagAttr.prototype.startLoc = function (){
	return this._name && this._name.startLoc  &&  this._name.startLoc();
};

TagAttr.prototype.endLoc = function (){
	return this._value && this._value.endLoc  &&  this._value.endLoc();
};

TagAttr.prototype.isStatic = function (){
	return TagAttr.prototype.__super__.isStatic.apply(this,arguments) && this._chain.every(function(item) {
		let val = (item instanceof Parens) ? item.value() : item;
		return (val instanceof Func) ? (!val.nonlocals()) : val.isPrimitive();
	});
};

TagAttr.prototype.visit = function (){
	this._chain.map(function(v) { return v.traverse(); });
	if (this._value) { this._value.traverse() };
	if (this._name.traverse) { this._name.traverse() };
	
	let key = this._key = String(this._name);
	let i = key.indexOf(':');
	
	if (i >= 0) {
		this._ns = key.slice(0,i);
		this._key = key.slice(i + 1);
	};
	
	if (!this._value) {
		this._autovalue = true;
		this._value = STR(key);
	};
	
	if (this._chain.length) {
		this._mods = {};
		for (let j = 0, items = iter$(this._chain), len = items.length; j < len; j++) {
			this._mods[items[j].name()] = 1;
		};
	};
	
	if (this._ns == 'bind') {
		this.scope__().imbaDependency('internal/bind');
	};
	return this;
};

TagAttr.prototype.ns = function (){
	return this._ns;
};

TagAttr.prototype.key = function (){
	return this._key;
};

TagAttr.prototype.mods = function (){
	return this._mods;
};

TagAttr.prototype.nameIdentifier = function (){
	return this._nameIdentifier || (this._nameIdentifier = new Identifier(helpers.dashToCamelCase(this.key())));
};

TagAttr.prototype.modsIdentifier = function (){
	return this._modsIdentifier || (this._modsIdentifier = new Identifier(helpers.dashToCamelCase(this.key()) + '__'));
};

TagAttr.prototype.js = function (o){
	// let mods = AST.compileRaw(@mods or null)
	let val = this.value().c(o);
	let bval = val;
	let op = M('=',this.option('op'));
	let isAttr = this.key().match(/^(aria-|data-)/);
	
	if (isAttr) {
		if (STACK.tsc()) {
			return ("" + (this._tag.tvar()) + ".setAttribute('" + this.key() + "'," + val + ")");
		};
		if (STACK.platform() == 'node') {
			return ("setAttribute('" + this.key() + "'," + val + ")");
		};
	};
	
	if (STACK.tsc()) {
		// how do we remove attribute then?
		let path = this.nameIdentifier();
		let access = ("" + (this._tag.tvar()) + "." + M(path,this._name));
		
		return ("" + M(access,this._name) + op + (this._autovalue ? M('true',this._value) : val));
	};
	
	let key = this.key();
	
	if (key == 'value' && idx$(this._tag._tagName,['input','textarea','select','option','button']) >= 0) {
		key = 'richValue';
	};
	
	if (this.ns() == 'css') {
		return ("css$('" + key + "'," + val + ")");
	} else if (this.ns() == 'bind') {
		let path = PATHIFY(this.value());
		
		if (path instanceof Variable) {
			let getter = ("function()\{ return " + val + " \}");
			let setter = ("function(v$)\{ " + val + " = v$ \}");
			bval = ("\{get:" + getter + ",set:" + setter + "\}");
		} else if (path instanceof Array) {
			bval = ("[" + val[0].c(o) + "," + val[1].c(o) + "]");
		};
		
		return ("bind$('" + key + "'," + bval + ")");
	} else if (key.indexOf("aria-") == 0 || (this._tag && this._tag.isSVG()) || key == 'for') {
		// how do we remove attribute then?
		if (this.ns()) {
			return ("setns$('" + this.ns() + "','" + key + "'," + val + ")");
		} else {
			return ("set$('" + key + "'," + val + ")");
		};
	} else if (key.indexOf("data-") == 0) {
		return ("dataset." + key.slice(5) + op + val);
	} else if (key.indexOf('--') == 0) {
		return ("style.setProperty('" + key + "'," + val + ")");
	} else {
		return ("" + M(helpers.dashToCamelCase(key),this._name) + op + val);
	};
	
	
	
	
	
};

function TagAttrValue(){ return TagPart.apply(this,arguments) };

subclass$(TagAttrValue,TagPart);
exports.TagAttrValue = TagAttrValue; // export class 
TagAttrValue.prototype.isPrimitive = function (){
	return this.value().isPrimitive();
};

TagAttrValue.prototype.value = function (){
	return this.name();
};

TagAttrValue.prototype.js = function (){
	return this.value().c();
};

TagAttrValue.prototype.toRaw = function (){
	if (this.value() instanceof Str) {
		return this.value().raw();
	};
	return null;
};

function TagHandlerSpecialArg(){ return ValueNode.apply(this,arguments) };

subclass$(TagHandlerSpecialArg,ValueNode);
exports.TagHandlerSpecialArg = TagHandlerSpecialArg; // export class 
TagHandlerSpecialArg.prototype.isPrimitive = function (){
	return true;
};

TagHandlerSpecialArg.prototype.c = function (){
	return ("'~$" + this.value() + "'");
};

function TagModifiers(){ return ListNode.apply(this,arguments) };

subclass$(TagModifiers,ListNode);
exports.TagModifiers = TagModifiers; // export class 
TagModifiers.prototype.isStatic = function (){
	// the check should be for the params, no?
	return this._nodes.every(function(item) {
		let val = (item instanceof Parens) ? item.value() : item;
		return (val instanceof Func) ? (!val.nonlocals()) : val.isPrimitive();
	});
};

TagModifiers.prototype.visit = function (){
	var keys = {FUNC: 0};
	for (let i = 0, items = iter$(this.nodes()), len = items.length, node; i < len; i++) {
		node = items[i];
		let key = String(node.name());
		
		if (keys[key]) {
			node.setName(key + '~' + (keys[key]++));
		} else {
			keys[key] = 1;
		};
	};
	return this;
};

TagModifiers.prototype.extractDynamics = function (){
	if (this._dynamics) { return this._dynamics };
	this._dynamics = [];
	
	for (let i = 0, items = iter$(this.nodes()), len = items.length, part; i < len; i++) {
		
		part = items[i];
		if (!((part instanceof TagModifier))) { continue; };
		for (let k = 0, ary = iter$(part.params()), len = ary.length, param; k < len; k++) {
			
			param = ary[k];
			if (!param.isPrimitive()) {
				let ref = new TagDynamicArg(param).set(
					{key: KEY(part.name()),
					index: k}
				);
				part.params().swap(param,LIT('null'));
				this._dynamics.push(ref);
			};
		};
	};
	return this._dynamics;
};

TagModifiers.prototype.c = function (){
	if (STACK.tsc()) {
		return '[' + this.nodes().map(function(_0) { return _0.c(); }).join(',') + ']';
	};
	
	let obj = new Obj([]);
	for (let i = 0, items = iter$(this.nodes()), len = items.length, part; i < len; i++) {
		part = items[i];
		let val = part.params() ? new Arr(part.params()) : LIT('true');
		obj.add(KEY(part.name()),val);
	};
	return obj.c();
	
};


function TagModifier(){ return TagPart.apply(this,arguments) };

subclass$(TagModifier,TagPart);
exports.TagModifier = TagModifier; // export class 
TagModifier.prototype.params = function(v){ return this._params; }
TagModifier.prototype.setParams = function(v){ this._params = v; return this; };

TagModifier.prototype.load = function (value){
	if (value instanceof IdentifierExpression) {
		return value._single;
	};
	return value;
};

TagModifier.prototype.isPrimitive = function (){
	return !(this.params()) || this.params().every(function(param) { return param.isPrimitive(); });
};

TagModifier.prototype.visit = function (){
	if (this._name instanceof TagHandlerCallback) {
		this._name.traverse();
		this._name = this._name.value();
	};
	
	if (this._name instanceof IsolatedFunc) { // not to be isolated for tsc
		let evparam = this._name.params().at(0,true,'e');
		let stateparam = this._name.params().at(1,true,'$');
		this._name.traverse();
		
		this._value = this._name;
		this._name = STR('$_');
		this._params = new ListNode([this._value].concat(this._value.leaks() || []));
	};
	
	
	
	
	
	if (this._params) { this._params.traverse() };
	
	for (let i = 0, items = iter$(this._params), len = items.length, param; i < len; i++) {
		param = items[i];
		if (param instanceof VarOrAccess) {
			let sym = param._token.value();
			if (sym && sym[0] == '$') {
				let special = new TagHandlerSpecialArg(sym.slice(1));
				this._params.swap(param,special);
			};
		} else if (param instanceof PropertyAccess) {
			let out = helpers.clearLocationMarkers(param.js());
			if (out[0] == '$') {
				this._params.swap(param,new TagHandlerSpecialArg(out.slice(1)));
			};
		};
	};
	
	return this;
};

TagModifier.prototype.js = function (){
	if (STACK.tsc()) {
		return this.params() ? this.params().c() : this.quoted();
	};
	
	if (this.params() && this.params().count() > 0) {
		return ("[" + this.quoted() + "," + (this.params().c()) + "]");
	} else if (this.params()) {
		return ("[" + this.quoted() + "]");
	} else {
		return this.quoted();
	};
};

function TagData(){ return TagPart.apply(this,arguments) };

subclass$(TagData,TagPart);
exports.TagData = TagData; // export class 
TagData.prototype.value = function (){
	return this.name();
};

TagData.prototype.isStatic = function (){
	return !(this.value()) || this.value().isPrimitive();
};

TagData.prototype.isSpecial = function (){
	return true;
};

TagData.prototype.isProxy = function (){
	return this.proxyParts() instanceof Array;
};

TagData.prototype.proxyParts = function (){
	var val = this.value();
	
	if (val instanceof ArgList) {
		val = val.values()[0];
	};
	
	if (val instanceof Parens) {
		val = val.value();
	};
	
	if (val instanceof VarOrAccess) {
		val = val._variable || val.value();
	};
	
	
	if (val instanceof Access) {
		let left = val.left();
		let right = (val.right() instanceof Index) ? val.right().value() : val.right();
		
		if (val instanceof IvarAccess) {
			left || (left = val.scope__().context());
		};
		
		return [left,right];
	};
	return val;
};

TagData.prototype.js = function (){
	var val = this.value();
	
	if (val instanceof ArgList) {
		val = val.values()[0];
	};
	
	if (val instanceof Parens) {
		val = val.value();
	};
	
	if (val instanceof VarOrAccess) {
		val = val._variable || val.value();
	};
	
	
	if (val instanceof Access) {
		let left = val.left();
		let right = (val.right() instanceof Index) ? val.right().value() : val.right();
		
		if (val instanceof IvarAccess) {
			left || (left = val.scope__().context());
		};
		
		let pars = [left.c(),right.c()];
		
		if (right instanceof Identifier) {
			pars[1] = "'" + pars[1] + "'";
		};
		
		return ("bind$('data',[" + pars.join(',') + "])");
	} else {
		return ("data=(" + (val.c()) + ")");
	};
};

function TagDynamicArg(){ return ValueNode.apply(this,arguments) };

subclass$(TagDynamicArg,ValueNode);
exports.TagDynamicArg = TagDynamicArg; // export class 
TagDynamicArg.prototype.c = function (){
	return this.value().c();
};

function TagHandler(){ return TagPart.apply(this,arguments) };

subclass$(TagHandler,TagPart);
exports.TagHandler = TagHandler; // export class 
TagHandler.prototype.__params = {watch: 'paramsDidSet',name: 'params'};
TagHandler.prototype.params = function(v){ return this._params; }
TagHandler.prototype.setParams = function(v){
	var a = this.params();
	if(v != a) { this._params = v; }
	if(v != a) { this.paramsDidSet && this.paramsDidSet(v,a,this.__params) }
	return this;
};

TagHandler.prototype.paramsDidSet = function (params){
	this._chain.push(this._last = new TagModifier('options'));
	return (this._last.setParams(params),params);
};

TagHandler.prototype.visit = function (){
	TagHandler.prototype.__super__.visit.apply(this,arguments);
	
	if (this._name && CUSTOM_EVENTS[String(this._name)]) {
		return this.scope__().imbaDependency('events/' + String(this._name));
	};
};

TagHandler.prototype.isStatic = function (){
	let valStatic = !(this.value()) || this.value().isPrimitive() || ((this.value() instanceof Func) && !this.value().nonlocals());
	
	return valStatic && this._chain.every(function(item) {
		let val = (item instanceof Parens) ? item.value() : item;
		return (val instanceof Func) ? (!val.nonlocals()) : val.isPrimitive();
	});
};

TagHandler.prototype.modsIdentifier = function (){
	return null;
};

TagHandler.prototype.js = function (o){
	if (STACK.tsc()) {
		return ("[" + this.quoted() + "," + (this.modifiers().c()) + "]");
	};
	return ("on$(" + this.quoted() + "," + (this.modifiers().c()) + "," + (this.scope__().context().c()) + ")");
};

function TagHandlerCallback(){ return ValueNode.apply(this,arguments) };

subclass$(TagHandlerCallback,ValueNode);
TagHandlerCallback.prototype.visit = function (){
	let val = this.value();
	
	if (val instanceof Parens) {
		val = val.value();
	};
	
	if (val instanceof Func) {
		val = val.body();
	};
	
	
	
	if ((val instanceof Access) || (val instanceof VarOrAccess)) {
		// let e = Token.new('IDENTIFIER','e')
		val = CALL(val,[LIT('e')]);
	};
	
	
	
	
	
	
	this.setValue(new (STACK.tsc() ? Func : IsolatedFunc)([],[val],null,{}));
	
	if (this.value() instanceof IsolatedFunc) {
		let evparam = this.value().params().at(0,true,'e');
		let stateparam = this.value().params().at(1,true,'$');
	};
	
	this.value().traverse();
	return;
};


function TagStylePart(name,params){
	this._key = name;
	this._params = params || [];
	
};

subclass$(TagStylePart,Node);
exports.TagStylePart = TagStylePart; // export class 
TagStylePart.prototype.params = function(v){ return this._params; }
TagStylePart.prototype.setParams = function(v){ this._params = v; return this; };

TagStylePart.prototype.serialize = function (){
	let key = this._key.map(function(_0) { return _0.c(); }).join(':');
	return [key].concat(this.params().map(function(_0) { return _0.raw ? _0.raw() : _0.c({css: true}); }));
};

function TagStyleMixin(){ return TagStylePart.apply(this,arguments) };

subclass$(TagStyleMixin,TagStylePart);
exports.TagStyleMixin = TagStyleMixin; // export class 


function TagStyleScope(){ return TagStylePart.apply(this,arguments) };

subclass$(TagStyleScope,TagStylePart);
exports.TagStyleScope = TagStyleScope; // export class 


function TagStyle(scopes,mixins){
	// @name = load(value)
	// @tag = owner
	this._scopes = scopes;
	this._mixins = mixins;
	this._chain = [];
	this._special = false;
	this._params = [];
	this;
};

subclass$(TagStyle,TagPart);
exports.TagStyle = TagStyle; // export class 
TagStyle.prototype.name = function(v){ return this._name; }
TagStyle.prototype.setName = function(v){ this._name = v; return this; };
TagStyle.prototype.value = function(v){ return this._value; }
TagStyle.prototype.setValue = function(v){ this._value = v; return this; };
TagStyle.prototype.params = function(v){ return this._params; }
TagStyle.prototype.setParams = function(v){ this._params = v; return this; };

TagStyle.prototype.scopes = function(v){ return this._scopes; }
TagStyle.prototype.setScopes = function(v){ this._scopes = v; return this; };
TagStyle.prototype.mixins = function(v){ return this._mixins; }
TagStyle.prototype.setMixins = function(v){ this._mixins = v; return this; };

TagStyle.prototype.visit = function (){
	this._name = STACK.sfcid() + this.oid();
	this._sel = ("." + (this._name));
	
	
	
	
	
	this.scope__().root().styles().push({
		type: 'css',
		processed: this.toStyle()
	});
	return this;
};

TagStyle.prototype.toStyle = function (){
	let sel = ("" + (this._sel));
	let scopes = this.scopes().map(function(_0) { return _0.serialize(); });
	let mixins = this.mixins().map(function(_0) { return _0.serialize(); });
	
	let rule = new StyleRule(sel,scopes,mixins);
	return rule.toString();
};

TagStyle.prototype.toRaw = function (){
	return ("" + (this._name));
};

TagStyle.prototype.c = function (){
	return ("'" + (this._name) + "'");
};

function TagBody(){ return ListNode.apply(this,arguments) };

subclass$(TagBody,ListNode);
exports.TagBody = TagBody; // export class 
TagBody.prototype.add = function (item,o){
	if (item instanceof InterpolatedString) {
		item = item.toArray();
		if (item.length == 1) {
			item = new TagTextContent(item[0]);
		};
	};
	
	return TagBody.prototype.__super__.add.call(this,item,o);
};

TagBody.prototype.consume = function (node){
	if (node instanceof TagLike) {
		this._nodes = this._nodes.map(function(child) {
			if (!(child instanceof Meta)) { // and !(child isa Assign)
				return child.consume(node);
			} else {
				return child;
			};
		});
		return this;
	};
	return TagBody.prototype.__super__.consume.apply(this,arguments);
};

function TagLike(o){
	if(o === undefined) o = {};
	this._options = o;
	this._flags = 0;
	this._tagvars = {};
	this.setup(o);
	this;
};

subclass$(TagLike,Node);
TagLike.prototype.sfcid = function (){
	return this._sfcid || (this._sfcid = STACK.sfcid() + '-' + this.oid());
};

TagLike.prototype.uniqueSelector = function (){
	return this._uniqueSelector || (this._uniqueSelector = ("[data-" + this.sfcid() + "]"));
};

TagLike.prototype.body = function (){
	return this._body || this._options.body;
};

TagLike.prototype.value = function (){
	return this._options.value;
};

TagLike.prototype.isReactive = function (){
	return true;
};

TagLike.prototype.isSVG = function (){
	return (this._isSVG == null) ? (this._isSVG = (this._parent ? this._parent.isSVG() : false)) : this._isSVG;
};

TagLike.prototype.parentTag = function (){
	let el = this._parent;
	while (el && !(el instanceof Tag)){
		el = el._parent;
	};
	return el;
};

TagLike.prototype.setup = function (){
	this._traversed = false;
	this._consumed = [];
	return this;
};

TagLike.prototype.root = function (){
	return this._parent ? this._parent.root() : this;
};

TagLike.prototype.register = function (node){
	if ((node instanceof If) || (node instanceof Switch)) {
		this.flag(F.TAG_HAS_BRANCHES);
		node = new TagSwitchFragment({body: node});
	} else if (node instanceof Loop) {
		this.flag(F.TAG_HAS_LOOPS);
		node = new TagLoopFragment({body: node.body(),value: node});
	} else if (node instanceof Tag) {
		if (node.isSlot()) { this.flag(F.TAG_HAS_DYNAMIC_CHILDREN) };
	} else {
		if (!((node instanceof Str))) { this.flag(F.TAG_HAS_DYNAMIC_CHILDREN) };
		node = new TagContent({value: node});
	};
	
	this._consumed.push(node); 
	node._parent = this;
	return node;
};

TagLike.prototype.flag = function (key){
	return this._flags |= key;
};

TagLike.prototype.type = function (){
	return "frag";
};

TagLike.prototype.unflag = function (key){
	return this._flags = this._flags & ~key;
};

TagLike.prototype.hasFlag = function (key){
	return this._flags & key;
};

TagLike.prototype.isAbstract = function (){
	return true;
};

TagLike.prototype.isOnlyChild = function (){
	return this.isFirstChild() && this.isLastChild();
};

TagLike.prototype.isFirstChild = function (){
	return this.hasFlag(F.TAG_FIRST_CHILD);
};

TagLike.prototype.isLastChild = function (){
	return this.hasFlag(F.TAG_LAST_CHILD);
};

TagLike.prototype.isIndexed = function (){
	return this.option('indexed');
};

TagLike.prototype.isComponent = function (){
	return this._kind == 'component';
};

TagLike.prototype.isSelf = function (){
	return (this.type() instanceof Self) || (this.type() instanceof This);
};

TagLike.prototype.isShadowRoot = function (){
	return this._tagName && this._tagName == 'shadow-root';
};

TagLike.prototype.isSlot = function (){
	return this._kind == 'slot';
};

TagLike.prototype.isFragment = function (){
	return this._kind == 'fragment';
};

TagLike.prototype.hasLoops = function (){
	return this.hasFlag(F.TAG_HAS_LOOPS);
};

TagLike.prototype.hasBranches = function (){
	return this.hasFlag(F.TAG_HAS_BRANCHES);
};

TagLike.prototype.hasDynamicChildren = function (){
	return this.hasFlag(F.TAG_HAS_DYNAMIC_CHILDREN);
};

TagLike.prototype.hasDynamicFlags = function (){
	return this.hasFlag(F.TAG_HAS_DYNAMIC_FLAGS);
};

TagLike.prototype.hasNonTagChildren = function (){
	return this.hasLoops() || this.hasBranches() || this.hasDynamicChildren();
};

TagLike.prototype.hasChildren = function (){
	return this._consumed.length > 0;
};

TagLike.prototype.tagvar = function (name){
	return this._tagvars[name] || (this._tagvars[name] = this.scope__().closure().temporary(null,{reuse: true},("" + name + "$" + this.tagvarprefix())));
};

TagLike.prototype.tagvarprefix = function (){
	return ("" + this.level());
};

TagLike.prototype.level = function (){
	return this._level;
};

TagLike.prototype.parent = function (){
	return this._parent || (this._parent = this.option('parent'));
};

TagLike.prototype.fragment = function (){
	return this._fragment || this.parent();
};

TagLike.prototype.tvar = function (){
	return this._tvar || this.tagvar('t');
};


TagLike.prototype.bvar = function (){
	return this._bvar || (this._parent ? this._parent.bvar() : this.tagvar('b'));
};


TagLike.prototype.cvar = function (){
	return this._cvar || (this._parent ? this._parent.cvar() : this.tagvar('c'));
};

TagLike.prototype.vvar = function (){
	return this.tagvar('v');
}; 
TagLike.prototype.kvar = function (){
	return this.tagvar('k');
}; 



TagLike.prototype.dvar = function (){
	return this.tagvar('d');
}; 

TagLike.prototype.ref = function (){
	return this._ref || (this._cachedRef = ("" + (this.parent() ? this.parent().cvar() : '') + "." + this.oid()));
};

TagLike.prototype.visit = function (stack){
	var o = this._options;
	var scope = this._tagScope = this.scope__();
	let prevTag = this._parent = stack._tag;
	this._level = (this._parent && this._parent._level || 0) + 1;
	stack._tag = null;
	
	for (let i = 0, items = iter$(this._attributes), len = items.length; i < len; i++) {
		items[i].traverse();
	};
	
	stack._tag = this;
	
	if (o.key) {
		o.key.traverse();
	};
	
	this.visitBeforeBody(stack);
	
	if (this.body()) {
		this.body().traverse();
	};
	
	this.visitAfterBody(stack);
	
	stack._tag = this._parent;
	
	if (!this._parent) {
		this._level = 0;
		this.consumeChildren();
		this.visitAfterConsumed();
	};
	
	return this;
};

TagLike.prototype.visitBeforeBody = function (){
	return this;
};

TagLike.prototype.visitAfterBody = function (){
	return this;
};

TagLike.prototype.consumeChildren = function (){
	if (this._consumed.length) { return };
	this.body() && this.body().consume(this);
	let first = this._consumed[0];
	let last = this._consumed[this._consumed.length - 1];
	
	
	if (!(this.isAbstract())) {
		if (first instanceof TagLike) { first.flag(F.TAG_FIRST_CHILD) };
		if (last instanceof TagLike) { last.flag(F.TAG_LAST_CHILD) };
	};
	
	for (let i = 0, items = iter$(this._consumed), len = items.length, item; i < len; i++) {
		item = items[i];
		if (!((item instanceof TagLike))) { continue; };
		item._parent = this;
		item._level = (this._level + 1);
		item.visitAfterConsumed();
		item.consumeChildren();
	};
	
	this.visitAfterConsumedChildren();
	return this;
};

TagLike.prototype.visitAfterConsumedChildren = function (){
	return this;
};

TagLike.prototype.visitAfterConsumed = function (){
	return this;
};

TagLike.prototype.consume = function (node){
	if (node instanceof TagLike) {
		return node.register(this);
	};
	
	if (node instanceof Variable) {
		this.option('assignToVar',node);
		return this;
	};
	
	if (node instanceof Assign) {
		return OP(node.op(),node.left(),this);
	} else if (node instanceof Op) {
		return OP(node.op(),node.left(),this);
	} else if (node instanceof Return) {
		// console.log "return is consuming tag"
		this.option('return',true);
		return this;
	};
	return this;
};

function TagTextContent(){ return ValueNode.apply(this,arguments) };

subclass$(TagTextContent,ValueNode);
exports.TagTextContent = TagTextContent; // export class 


function TagContent(){ return TagLike.apply(this,arguments) };

subclass$(TagContent,TagLike);
exports.TagContent = TagContent; // export class 
TagContent.prototype.vvar = function (){
	return this.parent().vvar();
};

TagContent.prototype.bvar = function (){
	return this.parent().bvar(); 
};

TagContent.prototype.ref = function (){
	return this.fragment().tvar();
};

TagContent.prototype.key = function (){
	return this._key || (this._key = ("" + (this.parent().cvar()) + "." + this.oid()));
};

TagContent.prototype.isStatic = function (){
	return (this.value() instanceof Str) || (this.value() instanceof Num);
};

TagContent.prototype.js = function (){
	let value = this.value();
	let parts = [];
	let isText = ((value instanceof Str) || (value instanceof Num) || (value instanceof TagTextContent));
	let isStatic = this.isStatic();
	
	if (STACK.tsc()) {
		return value.c(this.o());
	};
	
	if ((this.parent() instanceof TagSwitchFragment) || (this._tvar && (this.parent() instanceof Tag) && this.parent().isSlot())) {
		// what if it is a call?
		parts.push(("" + (this._tvar) + "=" + value.c(this.o())));
		if (value instanceof Call) {
			// mark parent to reset imba.ctx at the end
			parts.unshift(("imba.ctx=(" + this.key() + "$ || (" + this.key() + "$=\{_:" + (this.fragment().tvar()) + "\}))"));
		};
	} else if (this.isOnlyChild() && ((value instanceof Str) || (value instanceof Num))) {
		return ("" + this.bvar() + " || " + this.ref() + ".text$(" + value.c(this.o()) + ")");
	} else if (isStatic) {
		return ("" + this.bvar() + " || " + this.ref() + ".insert$(" + value.c(this.o()) + ")");
	} else if ((value instanceof TagTextContent) && this.isOnlyChild() && !(this.parent() instanceof TagSwitchFragment)) {
		return ("(" + this.vvar() + "=" + value.c(this.o()) + "," + this.vvar() + "===" + this.key() + " || " + this.ref() + ".text$(String(" + this.key() + "=" + this.vvar() + ")))");
	} else {
		parts.push(("" + this.vvar() + "=" + value.c(this.o())));
		
		if (value instanceof Call) {
			// mark parent to reset imba.ctx at the end
			parts.unshift(("imba.ctx=(" + this.key() + "$ || (" + this.key() + "$=\{_:" + (this.fragment().tvar()) + "\}))"));
		};
		if (value instanceof TagTextContent) {
			parts.push(("" + this.vvar() + "===" + this.key() + " || (" + this.key() + "_ = " + this.ref() + ".insert$(String(" + this.key() + "=" + this.vvar() + ")," + (this._flags) + "," + this.key() + "_))"));
		} else {
			parts.push(("" + this.vvar() + "===" + this.key() + " || (" + this.key() + "_ = " + this.ref() + ".insert$(" + this.key() + "=" + this.vvar() + "," + (this._flags) + "," + this.key() + "_))"));
		};
	};
	
	return "(" + parts.join(',') + ')';
};

function TagFragment(){ return TagLike.apply(this,arguments) };

subclass$(TagFragment,TagLike);
exports.TagFragment = TagFragment; // export class 


function TagSwitchFragment(){ return TagLike.apply(this,arguments) };

subclass$(TagSwitchFragment,TagLike);
exports.TagSwitchFragment = TagSwitchFragment; // export class 
TagSwitchFragment.prototype.setup = function (){
	TagSwitchFragment.prototype.__super__.setup.apply(this,arguments);
	this._branches = [];
	return this._inserts = [];
};

TagSwitchFragment.prototype.getInsertVar = function (index){
	return this._inserts[index] || (this._inserts[index] = this.tagvar(this.oid() + '$' + index));
};

TagSwitchFragment.prototype.tvar = function (){
	return this.fragment().tvar();
};

TagSwitchFragment.prototype.register = function (node){
	let res = TagSwitchFragment.prototype.__super__.register.apply(this,arguments);
	if (this._branches) {
		let curr = this._branches[this._branches.length - 1];
		curr && curr.push(res);
	};
	return res;
};

TagSwitchFragment.prototype.visitAfterConsumedChildren = function (){
	
	if (!((this._parent instanceof TagSwitchFragment))) {
		let max = this.assignChildIndices(0,this);
	};
	return this;
};

TagSwitchFragment.prototype.assignChildIndices = function (start,root){
	let nr = start;
	let max = start;
	for (let i = 0, items = iter$(this._branches), len = items.length, branch; i < len; i++) {
		branch = items[i];
		nr = start;
		for (let j = 0, ary = iter$(branch), len = ary.length, item; j < len; j++) {
			item = ary[j];
			if (item instanceof TagSwitchFragment) {
				nr = item.assignChildIndices(nr,root);
			} else {
				item._tvar = root.getInsertVar(nr);
				item.set({detached: true});
				nr++;
			};
		};
		
		if (nr > max) {
			max = nr;
		};
	};
	return max;
};

TagSwitchFragment.prototype.js = function (o){
	var top = this._inserts.join(' = ') + ' = null;';
	var out = this.body().c(o);
	if (STACK.tsc()) { return out };
	
	out = top + out;
	
	for (let i = 0, items = iter$(this._inserts), len = items.length, item; i < len; i++) {
		item = items[i];
		let key = ("" + this.cvar() + "." + item);
		out += ("\n(" + key + "_ = " + this.tvar() + ".insert$(" + item + ",0," + key + "_));");
	};
	return out;
};

function TagLoopFragment(){ return TagLike.apply(this,arguments) };

subclass$(TagLoopFragment,TagLike);
exports.TagLoopFragment = TagLoopFragment; // export class 
TagLoopFragment.prototype.isKeyed = function (){
	return this.option('keyed') || this.hasFlag(F.TAG_HAS_BRANCHES);
};

TagLoopFragment.prototype.consumeChildren = function (){
	TagLoopFragment.prototype.__super__.consumeChildren.apply(this,arguments);
	
	
	if (this._consumed.every(function(_0) { return (_0 instanceof Tag) && !_0.option('key') && !_0.isDynamicType(); }) && !this.hasFlag(F.TAG_HAS_BRANCHES)) {
		return this.set({indexed: true});
		
	} else {
		return this.set({keyed: true});
		
	};
};

TagLoopFragment.prototype.cvar = function (){
	return this._cvar || this.tagvar('c');
};

TagLoopFragment.prototype.js = function (o){
	
	if (this.stack().isExpression()) {
		return CALL(FN([],[this]),[]).c();
	};
	
	if (STACK.tsc()) {
		return ("" + this.tvar() + " = new DocumentFragment;\n" + this.value().c(o));
	};
	
	
	let iref = this.option('indexed') ? LIT('imba.createIndexedFragment') : LIT('imba.createKeyedFragment');
	
	let cache = this.parent().cvar();
	let parentRef = (this.parent() instanceof TagSwitchFragment) ? LIT('null') : this.fragment().tvar();
	
	let out = "";
	out += ("" + this.tvar() + " = " + cache + "." + this.oid() + " || (" + cache + "." + this.oid() + " = " + this.tvar() + " = " + iref + "(" + (this._flags) + "," + parentRef + "));\n");
	this._ref = ("" + this.tvar());
	out += ("" + this.kvar() + " = 0;\n");
	out += ("" + this.cvar() + "=" + this.tvar() + ".$;\n");
	out += this.value().c(o);
	out += (";" + this.tvar() + ".end$(" + this.kvar() + ")");
	return out;
};

function TagIndexedFragment(){ return TagLike.apply(this,arguments) };

subclass$(TagIndexedFragment,TagLike);
exports.TagIndexedFragment = TagIndexedFragment; // export class 


function TagKeyedFragment(){ return TagLike.apply(this,arguments) };

subclass$(TagKeyedFragment,TagLike);
exports.TagKeyedFragment = TagKeyedFragment; // export class 


function TagSlotProxy(){ return TagLike.apply(this,arguments) };

subclass$(TagSlotProxy,TagLike);
exports.TagSlotProxy = TagSlotProxy; // export class 
TagSlotProxy.prototype.ref = function (){
	return this.tvar();
};

TagSlotProxy.prototype.tagvarprefix = function (){
	return this.oid() + 'S';
};


function Tag(){ return TagLike.apply(this,arguments) };

subclass$(Tag,TagLike);
exports.Tag = Tag; // export class 
Tag.prototype.attrmap = function(v){ return this._attrmap; }
Tag.prototype.setAttrmap = function(v){ this._attrmap = v; return this; };

Tag.prototype.setup = function (){
	Tag.prototype.__super__.setup.apply(this,arguments);
	this._attributes = this._options.attributes || [];
	this._attrmap = {};
	this._classNames = [];
	return this._className = null;
};

Tag.prototype.isAbstract = function (){
	return this.isSlot() || this.isFragment();
};

Tag.prototype.attrs = function (){
	return this._attributes;
};

Tag.prototype.uniqueSelector = function (){
	return this._uniqueSelector || (this._uniqueSelector = ("[data-" + this.sfcid() + "]"));
};

Tag.prototype.traverse = function (){
	if (this._traversed) { return this };
	this.scope__().imbaDependency('index');
	this._tagDeclaration = STACK.up(TagDeclaration);
	let close = this._options.close;
	let body = this._options.body || [];
	let returns = this;
	
	if (close && close._value == '/>' && len$(body)) {
		returns = [this].concat(body._nodes);
		this._options.body = new ArgList([]);
	};
	
	Tag.prototype.__super__.traverse.apply(this,arguments);
	
	return returns;
};

Tag.prototype.visitBeforeBody = function (stack){
	var self = this;
	let type = self._options.type;
	type && type.traverse();
	
	if (self.isSelf() || (self.tagName().indexOf('-') >= 0) || self.isDynamicType() || (type && type.isComponent())) {
		self._options.custom = true;
		self._kind = 'component';
	} else {
		self._kind = 'element';
	};
	
	if (self.attrs().length == 0 && !self._options.type) {
		self._options.type = 'fragment';
	};
	
	let tagName = self.tagName();
	
	if (tagName == 'slot') {
		self._kind = 'slot';
	} else if (tagName == 'fragment') {
		self._kind = 'fragment';
	};
	
	if (tagName == 'shadow-root') {
		self._kind = 'shadow-root';
	};
	
	if (self.isSelf()) {
		let decl = stack.up(TagDeclaration);
		if (decl) { decl.set({self: self,sfcid: self.sfcid()}) };
	};
	
	self._tagName = tagName;
	
	self._dynamics = [];
	
	self._attributes = self._attributes.filter(function(item) {
		
		if ((item instanceof TagFlag) && item.isStatic()) {
			self._classNames.push(item.rawClassName());
			return false;
		};
		
		if (item == self._attrmap.$key) {
			self.set({key: item.value()});
			return false;
		};
		
		if (!item.isStatic()) {
			self._dynamics.push(item);
		};
		
		return true;
	});
	
	
	
	
	if (self.isSlot()) {
		// @tvar = tagvar('t'+oid)
		let name = self._attrmap.name ? self._attrmap.name.value() : '__';
		if (name instanceof Str) { name = name.raw() };
		self.set({name: name});
		self._attributes = [];
	};
	
	if (self._options.reference) {
		let tagdef = stack.up(TagDeclaration);
		if (tagdef) {
			tagdef.addElementReference(self._options.reference,self);
		};
	};
	return Tag.prototype.__super__.visitBeforeBody.apply(self,arguments);
};

Tag.prototype.register = function (node){
	node = Tag.prototype.__super__.register.call(this,node);
	
	if ((node instanceof TagLike) && (this.isComponent() && !(this.isSelf()))) {
		let slotKey = (node instanceof Tag) ? node._attrmap.slot : null;
		let name = '__';
		if (slotKey) {
			if (slotKey.value() instanceof Str) {
				name = slotKey.value().raw();
			};
		};
		
		let slot = this.getSlot(name);
		node._fragment = slot;
	};
	return node;
};

Tag.prototype.visitAfterBody = function (stack){
	return this;
};

Tag.prototype.visitAfterConsumed = function (){
	if (this.isSVG()) {
		this._kind = 'svg';
	};
	
	if ((this._parent instanceof TagLoopFragment) && this.isDynamicType()) {
		if (this.option('key')) {
			this.set({key: OP('+',this.option('key'),OP('+',STR(' '),this.vvar()))});
		};
	};
	return this;
};

Tag.prototype.visitAfterConsumedChildren = function (){
	if (this.isSlot() && this._consumed.length > 1) {
		this.set({markWhenBuilt: true,reactive: true});
	};
	return;
};

Tag.prototype.getSlot = function (name){
	this._slots || (this._slots = {});
	return this._slots[name] || (this._slots[name] = new TagSlotProxy({parent: this,name: name}));
};

Tag.prototype.addPart = function (part,type,tok){
	let attrs = this._attributes;
	let curr = attrs.CURRENT;
	let next = curr;
	
	if (type == TagId) {
		this.set({id: part});
	};
	
	if (type == TagArgList) {
		if (attrs.length == 0) {
			this.set({args: part});
			return this;
		};
	};
	
	if (type == TagSep) {
		next = null;
	} else if (type == TagAttrValue) {
		if (part instanceof Parens) {
			part = part.value();
		};
		
		if (curr instanceof TagFlag) {
			curr.setCondition(part);
			this.flag(F.TAG_HAS_DYNAMIC_FLAGS);
			curr.set({op: tok});
		} else if (curr instanceof TagHandler) {
			
			if (part) {
				// if part isa Access or part isa VarOrAccess
				//	# let e = Token.new('IDENTIFIER','e')
				//	part = CALL(part,[LIT('e')])
				// console.log 'is stack tsc?'
				// TODO don't generate this until visiting the taghandler
				// part = (STACK.tsc ? Func : IsolatedFunc).new([],[part],null,{})
				curr.add(new TagHandlerCallback(part),type);
			};
		} else if (curr) {
			curr.setValue(part);
			curr.set({op: tok});
		};
	} else if (curr instanceof TagStyle) {
		curr.add(part,type);
	} else if (curr instanceof TagHandler) {
		if ((part instanceof IdentifierExpression) && part.single() && !part.isPrimitive()) {
			// console.log 'is stack tsc?'
			part = new (STACK.tsc() ? Func : IsolatedFunc)([],[part.single()],null,{});
		};
		
		curr.add(part,type);
	} else if (curr instanceof TagAttr) {
		curr.add(part,type);
	} else if (type == TagData) {
		let bind = idx$(String(this.type()),['input','textarea','select','button','option']) >= 0;
		bind = true;
		curr = new TagAttr(bind ? 'bind:data' : 'data',this);
		curr.setValue(part.first());
		attrs.push(curr);
		next = null;
	} else if (type == TagStyle) {
		next = part; 
		next._tag = this;
		
		attrs.push(next);
	} else {
		if (type == TagStyle && !(part instanceof TagStyle)) {
			part = new TagStyleScope(part);
		};
		
		if (type == TagFlag && (part instanceof IdentifierExpression) && !part.isPrimitive()) {
			this.flag(F.TAG_HAS_DYNAMIC_FLAGS);
		};
		
		if (part instanceof type) {
			part._tag = this;
		} else {
			part = new type(part,this);
		};
		
		attrs.push(next = part);
		
		if ((next instanceof TagAttr) && next.name().isPrimitive()) {
			let name = String(next.name().toRaw());
			this._attrmap[name] = next;
		};
	};
	
	if (next != curr) {
		attrs.CURRENT = next;
	};
	return this;
};

Tag.prototype.type = function (){
	return this._options.type || ((this._attributes.length == 0) ? 'fragment' : 'div');
};

Tag.prototype.tagName = function (){
	return this._tagName || String(this._options.type);
};

Tag.prototype.isDynamicType = function (){
	return this.type() instanceof ExpressionNode;
};

Tag.prototype.isSVG = function (){
	return (this._isSVG == null) ? (this._isSVG = (((this.type() instanceof TagTypeIdentifier) && this.type().isSVG()) || (this._parent && this._parent.isSVG()))) : this._isSVG;
};

Tag.prototype.create_ = function (){
	if (this.isFragment() || this.isSlot()) {
		return LIT('imba.createLiveFragment');
	} else if (this.isSVG()) {
		return LIT('imba.createSVGElement');
	} else if (this.isComponent()) {
		return LIT('imba.createComponent');
	} else {
		return LIT('imba.createElement');
	};
};

Tag.prototype.isReactive = function (){
	return this.option('reactive') || (this._parent ? this._parent.isReactive() : (!(this.scope__() instanceof RootScope)));
};



Tag.prototype.isDetached = function (){
	return this.option('detached');
};

Tag.prototype.js = function (o){
	var isExpression = STACK.isExpression();
	
	var head = [];
	var out = [];
	var foot = [];
	
	var add = function(val) {
		if (val instanceof Variable) {
			val = val.toString();
		};
		return out.push(val);
	};
	
	var parent = this.parent();
	var fragment = this.fragment();
	
	let typ = this.isSelf() ? "self" : ((this.isFragment() ? "'fragment'" : (((this.type().isClass && this.type().isClass()) ? this.type().name() : ("'" + this.type()._value + "'")))));
	
	var wasInline = o.inline;
	var isSVG = this.isSVG();
	var isReactive = this.isReactive();
	
	var canInline = false;
	var shouldEnd = this.isComponent() || this._attrmap.route || this._attrmap.routeTo || this._attrmap['route-to'];
	
	var dynamicKey = null;
	var ownCache = false;
	
	var slotPath = this.isSlot() ? OP('.',LIT(("" + (fragment.root().tvar()) + ".__slots")),STR(this.option('name'))).c() : "";
	
	if (STACK.tsc()) {
		// if tag is expression we want to suppress certain warnings
		if ((this.type() instanceof TagTypeIdentifier) && !(this.isSelf())) {
			add(("" + this.tvar() + " = new " + M(this.type().toClassName(),this.type())));
		} else if (this.isSelf()) {
			add(("" + this.tvar() + " = " + (this.type().c())));
		} else {
			add(("" + this.tvar() + " = new " + M('HTMLElement',this.type())));
			add(("" + (this.type().c()))); 
		};
		
		for (let i = 0, items = iter$(this._attributes), len = items.length, item; i < len; i++) {
			item = items[i];
			if ((item instanceof TagAttr) || (item instanceof TagHandler)) {
				add(item.c(o)); 
				
			};
			this;
		};
		for (let i = 0, items = iter$(this.body()), len = items.length; i < len; i++) {
			add(items[i].c());
		};
		
		return out.join(";\n");
	};
	
	
	
	
	var markWhenBuilt = shouldEnd || this.hasDynamicFlags() || this.attrs().length || this.option('markWhenBuilt') || this.isDetached();
	
	
	var inCondition = parent && parent.option('condition');
	
	if (this.type() instanceof ExpressionNode) {
		add(("" + this.vvar() + "=" + (this.type().c())));
		if (!(this.option('key') || (parent instanceof TagLoopFragment))) {
			add(("" + this.kvar() + "='" + this.oid() + "_'+" + this.vvar()));
		};
		
		typ = this.vvar();
		dynamicKey = this.kvar();
	};
	
	var addGlobalId = this._sfcid || this.stack().option('hasScopedStyles');
	
	if (this._tagDeclaration && (this._tagDeclaration.option('hasScopedStyles') || this.option('reference'))) {
		this._classNames.push(this._tagDeclaration.cssref());
	};
	
	if (this.option('reference')) {
		let str = String(this.option('reference')).slice(1);
		this._classNames.push(str);
	};
	
	if (this._classNames.length) {
		this._className = ("'" + this._classNames.join(' ') + "'");
	};
	
	var params = [
		typ,
		((fragment && !this.option('detached')) ? fragment.tvar() : 'null'),
		this._className || 'null',
		'null'
	];
	
	var nodes = this.body() ? this.body().values() : [];
	
	if (nodes.length == 1 && (nodes[0] instanceof TagContent) && nodes[0].isStatic() && !(this.isSelf()) && !(this.isSlot())) {
		params[3] = nodes[0].value().c();
		nodes = [];
	};
	
	
	
	if (this._dynamics.length == 0 && !(this.hasDynamicFlags()) && !dynamicKey) {
		if (nodes.every(function(v) { return (v instanceof Str) || ((v instanceof Tag) && !v.isDynamicType()); })) {
			if (!shouldEnd && !(this.hasNonTagChildren()) && (parent instanceof Tag) && !(this.isSlot()) && !this.option('dynamic')) {
				canInline = true;
			};
		};
	};
	
	if (this.isFragment() || this.isSlot()) {
		params = [this._flags].concat(params.slice(1,2)); 
	};
	
	if (this.isSlot()) {
		// the slot is not supposed to be inserted immediately
		params[1] = 'null';
	};
	
	var ctor = M(("" + this.create_() + "(" + params.join(',') + ")"),this.type());
	
	if (this.option('reference')) {
		// what if it is on root?
		// should also check if there is already an element like this
		// ctor = CALL(OP('.',LIT(ctor),'ref$'),[STR(option(:reference))])
		ctor = OP('=',OP('.',this.scope__().context(),this.option('reference')),LIT(ctor)).c();
	};
	
	ctor = ("" + this.tvar() + "=" + ctor);
	
	if (this.option('assign')) {
		// push it into ctor if it is not a variable assignment
		// otherwise we always want to assign it
		ctor = OP('=',this.option('assign'),LIT(ctor)).c();
	};
	
	if (!parent) {
		this._ref = ("" + this.tvar());
		
		if (this.isSelf()) {
			add(("" + this.tvar() + "=this"));
			add(("" + this.tvar() + ".open$()"));
			
			
			
			add(("" + this.cvar() + " = (" + this.bvar() + "=" + this.dvar() + "=1," + this.tvar() + ".$) || (" + this.bvar() + "=" + this.dvar() + "=0," + this.tvar() + ".$=\{\})"));
		} else if (isReactive) {
			let scop = this.scope__().closure();
			
			add(("" + this.tvar() + "=(" + this.bvar() + "=" + this.dvar() + "=1," + (scop.tagCache()) + "." + this.oid() + ") || (" + this.bvar() + "=" + this.dvar() + "=0," + (scop.tagCache()) + "." + this.oid() + "=" + ctor + ")"));
			add(("" + this.bvar() + "||(" + this.tvar() + ".up$=" + (scop.tagCache()) + "._)"));
			
			
			this._ref = this.tvar();
			if (isExpression) { o.inline = true };
			
			
			if (this._consumed.length || this._dynamics.length) {
				add(("" + this.cvar() + " = " + this.tvar() + ".$" + this.oid() + " || (" + this.tvar() + ".$" + this.oid() + "=\{\})"));
			};
		} else {
			this._cvar = this.tvar();
			add(("(" + ctor + ")"));
			this.option('inline',canInline = true);
			o.inline = true;
		};
	} else {
		if (this.isShadowRoot()) {
			let key = ("" + this.cvar() + "." + this.oid());
			add(("" + this.tvar() + "=" + key + " || (" + key + "=" + (fragment.tvar()) + ".attachShadow(\{mode:'open'\}))"));
		} else if (this.isSlot() && !(this.hasChildren())) {
			let key = ("" + this.cvar() + "." + this.oid());
			add(("" + this.tvar() + "=" + slotPath));
			add(("(" + key + " = " + (fragment.tvar()) + ".insert$(" + this.tvar() + "," + (this._flags) + "," + key + "))"));
		} else if (this.isSlot() && this._consumed.length == 1) {
			// single child can act as slot?
			// if it is a string we dont really want to insert it at all
			this._consumed[0].set({dynamic: true,detached: true});
			this._consumed[0]._tvar = this.tvar();
			
		} else if (this.option('args')) {
			let key = ("" + this.cvar() + "." + this.oid());
			add(("imba.ctx=(" + key + "$c || (" + key + "$c=\{\}))"));
			let call = CALL(this.option('type').toFunctionalType(),this.option('args'));
			add(("" + this.tvar() + "=" + call.c(o)));
			add(("" + this.tvar() + "===" + this.ref() + " || (" + key + "_ = " + (fragment.tvar()) + ".insert$(" + this.ref() + "=" + this.tvar() + "," + (this._flags) + "," + key + "_))"));
			
		} else if (parent instanceof TagLoopFragment) {
			// what if we are not reactive at all?
			if (parent.isKeyed() && !this.option('key')) {
				this.option('key',OP('+',LIT(("'" + this.oid() + "$'")),parent.kvar()));
				if (this.isDynamicType()) {
					this.set({key: OP('+',this.option('key'),this.vvar())});
				};
				
			};
			
			if (this.option('key')) {
				add(("" + this.kvar() + "=" + (this.option('key').c())));
				this._ref = ("" + (parent.cvar()) + "[" + this.kvar() + "]");
			} else if (parent.isIndexed()) {
				this._ref = ("" + (parent.cvar()) + "[" + (parent.kvar()) + "]");
			};
			
			
			this._bvar = this.tagvar('b');
			add(("" + this.tvar() + " = (" + this.bvar() + "=" + this.dvar() + "=1," + this.ref() + ") || (" + this.bvar() + "=" + this.dvar() + "=0," + this.ref() + " = " + ctor + ")"));
			this._ref = ("" + this.tvar());
			
			if (this.isDetached() || true) {
				add(("" + this.bvar() + "||(" + this.tvar() + ".up$=" + (fragment.tvar()) + ")"));
			};
			
			
			
			if (this._dynamics.length || (this._consumed.length && nodes.length)) {
				ownCache = true;
				
				
				
			};
		} else if (!isReactive) {
			add(("(" + ctor + ")"));
		} else if (canInline) {
			this._ref = this.tvar();
			this._bvar = parent.bvar();
			add(("" + (parent.bvar()) + " || (" + ctor + ")"));
		} else {
			let cref = this._cref = ("" + this.cvar() + "." + this.oid());
			let ref = dynamicKey ? (("" + this.cvar() + "[" + dynamicKey + "]")) : cref;
			
			if (markWhenBuilt) {
				this._bvar = this.tagvar('b');
				add(("" + this.tvar() + " = (" + this.bvar() + "=" + this.dvar() + "=1," + ref + ") || (" + this.bvar() + "=" + this.dvar() + "=0," + ref + "=" + ctor + ")"));
			} else {
				add(("" + this.tvar() + " = " + ref + " || (" + ref + " = " + ctor + ")"));
			};
			
			if (this.isDetached()) {
				add(("" + this.bvar() + "||(" + this.tvar() + ".up$=" + (fragment.tvar()) + ")"));
			};
			
			this._ref = this.tvar();
			
			if (dynamicKey) { // and cache
				ownCache = true;
			};
		};
		
		if (ownCache) {
			this._cvar = this.tagvar('c');
			add(("" + this.cvar() + "=" + this.ref() + ".$" + this.oid() + " || (" + this.ref() + ".$" + this.oid() + "=\{\})"));
		};
	};
	
	
	
	
	if (this._slots) {
		for (let o1 = this._slots, slot, i = 0, keys = Object.keys(o1), l = keys.length, name; i < l; i++){
			// TODO Make sure slot is not already used
			name = keys[i];slot = o1[name];add(("" + (slot.tvar()) + " = " + this.tvar() + ".slot$('" + name + "'," + this.cvar() + ")"));
		};
	};
	
	let flagsToConcat = [];
	
	for (let i = 0, items = iter$(this._attributes), len = items.length, item; i < len; i++) {
		item = items[i];
		if (item._chain && item._chain.length && !(item instanceof TagHandler) && !(item instanceof TagStyle)) {
			let mods = item.modifiers();
			let dyn = !mods.isStatic();
			
			let specials = mods.extractDynamics();
			let modid = item.modsIdentifier();
			let modpath = modid ? OP('.',this.tvar(),modid).c() : (("" + this.cvar() + "." + (mods.oid())));
			
			if (dyn) {
				add(("" + this.vvar() + " = " + modpath + " || (" + mods.c(o) + ")"));
				for (let j = 0, ary = iter$(specials), len = ary.length, special; j < len; j++) {
					special = ary[j];
					let k = special.option('key');
					let i = special.option('index');
					add(("" + (OP('.',this.vvar(),k).c()) + "[" + i + "]=" + special.c(o)));
				};
				add(("" + this.bvar() + " || (" + modpath + "=" + this.vvar() + ")"));
			} else {
				add(("" + this.bvar() + " || (" + modpath + "=" + mods.c(o) + ")"));
			};
		};
		
		if (item instanceof TagStyle) {
			// add "{bvar} // {item.c(o)}"
			true;
		} else if (!isReactive) {
			// buggy
			add(("" + this.tvar() + "." + item.c(o)));
		} else if (item.isStatic()) {
			add(("" + this.bvar() + " || (" + this.tvar() + "." + item.c(o) + ")"));
		} else {
			let iref = ("" + this.cvar() + "." + (item.oid()));
			
			if (item instanceof TagFlag) {
				let cond = item.condition();
				let val = item.name();
				let cref;
				let vref;
				
				if (cond && !cond.isPrimitive()) {
					cref = ("" + this.cvar() + "." + (cond.oid()));
					add(("(" + this.vvar() + "=(" + cond.c(o) + "||undefined)," + this.vvar() + "===" + cref + "||(" + this.dvar() + "|=" + (F.DIFF_FLAGS) + "," + cref + "=" + this.vvar() + "))"));
				};
				
				if (val && !(val instanceof Token) && !val.isPrimitive()) {
					vref = ("" + this.cvar() + "." + (val.oid()));
					add(("(" + this.vvar() + "=" + val.c(o) + "," + this.vvar() + "===" + vref + "||(" + this.dvar() + "|=" + (F.DIFF_FLAGS) + "," + vref + "=" + this.vvar() + "))"));
				};
				
				if (cref && vref) {
					flagsToConcat.push(("(" + cref + " ? (" + vref + "||'') : '')"));
				} else if (cref) {
					flagsToConcat.push(("(" + cref + " ? " + val.c({as: 'string'}) + " : '')"));
				} else if (vref) {
					flagsToConcat.push(("(" + vref + "||'')"));
				} else {
					flagsToConcat.push(("'" + (val.c()) + "'"));
				};
			} else if (item instanceof TagHandler) {
				let mods = item.modifiers();
				let specials = mods.extractDynamics();
				
				add(("" + this.vvar() + " = " + iref + " || (" + iref + "=" + mods.c(o) + ")"));
				for (let j = 0, ary = iter$(specials), len = ary.length, special; j < len; j++) {
					special = ary[j];
					let k = special.option('key');
					let i = special.option('index');
					add(("" + (OP('.',this.vvar(),k).c()) + "[" + i + "]=" + special.c(o)));
				};
				
				mods = this.vvar();
				add(("" + this.bvar() + " || " + this.ref() + ".on$(" + (item.quoted()) + "," + (mods.c()) + "," + (this.scope__().context().c()) + ")"));
			} else if ((item instanceof TagAttr) && item.ns() == 'bind') {
				
				let rawVal = item.value();
				let val = PATHIFY(rawVal);
				
				shouldEnd = true;
				if (val instanceof Array) {
					let target = val[0];
					let key = val[1];
					let bval = "[]";
					if ((target instanceof Literal) && (key instanceof Literal)) {
						bval = ("[" + target.c(o) + "," + key.c(o) + "]");
					} else if (key instanceof Literal) {
						bval = ("[null," + key.c(o) + "]");
					};
					
					add(("" + this.vvar() + "=" + iref + " || (" + iref + "=" + this.ref() + ".bind$('" + (item.key()) + "'," + bval + "))"));
					for (let i = 0, ary = iter$(val), len = ary.length, part; i < len; i++) {
						part = ary[i];
						if (!((part instanceof Literal))) {
							add(("" + this.vvar() + "[" + i + "]=" + part.c(o)));
						};
					};
					
				} else if (val instanceof Variable) {
					let getter = ("function()\{ return " + val.c(o) + " \}");
					let setter = ("function(v$)\{ " + val.c(o) + " = v$ \}");
					let bval = ("\{get:" + getter + ",set:" + setter + "\}");
					add(("" + this.bvar() + " || " + this.ref() + ".bind$('" + (item.key()) + "'," + bval + ")"));
				};
			} else {
				if (isSVG) { item.option({svg: true}) };
				let val = item.value();
				if (item.valueIsStatic()) {
					add(("" + this.bvar() + " || (" + this.ref() + "." + M(item.js(o),item) + ")"));
				} else if (val instanceof Func) {
					add(("(" + this.ref() + "." + item.js(o) + ")"));
				} else {
					item.setValue(LIT(("" + iref + "=" + this.vvar())));
					add(("(" + this.vvar() + "=" + val.c(o) + "," + this.vvar() + "===" + iref + " || (" + this.ref() + "." + M(item.js(o),item) + "))"));
				};
			};
		};
	};
	
	if (flagsToConcat.length || (this.isSelf() && this._className)) {
		if (this._className) { flagsToConcat.unshift(this._className) };
		let meth = this.isSelf() ? 'flagSelf$' : 'flag$';
		let cond = ("" + this.dvar() + "&" + (F.DIFF_FLAGS));
		if (this.isSelf()) { cond = ("(!" + this.bvar() + "||" + cond + ")") };
		add(("(" + cond + " && " + this.tvar() + "." + meth + "(" + flagsToConcat.join("+' '+") + "))"));
	};
	
	
	
	
	
	let count = nodes.length;
	
	for (let i = 0, len = nodes.length, item; i < len; i++) {
		item = nodes[i];
		if (item instanceof Str) { // static for sure
			// should this not go into a TagLike? Definitely
			if (isReactive) {
				add(("" + this.bvar() + " || " + this.tvar() + ".insert$(" + item.c(o) + ")"));
			} else {
				add(("" + this.tvar() + ".insert$(" + item.c(o) + ")"));
			};
		} else {
			add(item.c(o));
		};
	};
	
	
	if (shouldEnd) {
		if (!(this.isSelf())) { foot.push(("" + this.bvar() + " || !" + this.tvar() + ".setup || " + this.tvar() + ".setup(" + this.dvar() + ")")) };
		foot.push(this.isSelf() ? (("" + this.tvar() + ".close$(" + this.dvar() + ")")) : (("" + this.tvar() + ".end$(" + this.dvar() + ")")));
	};
	
	if (parent instanceof TagLoopFragment) {
		
		if (parent.isKeyed()) {
			foot.push(("" + (parent.ref()) + ".push(" + this.tvar() + "," + (parent.kvar()) + "++," + this.kvar() + ")"));
		} else if (parent.isIndexed()) {
			foot.push(("" + (parent.kvar()) + "++"));
		};
	} else if (this.isFragment() && parent && !(parent instanceof TagSwitchFragment)) {
		// not fragment.tvar?
		foot.push(("" + (fragment.ref()) + ".insert$(" + this.tvar() + "," + (this._flags) + ")"));
	} else if (parent && this.isComponent() && !(parent instanceof TagSwitchFragment)) {
		let pref = fragment.ref();
		let cref = this._cref;
		if (dynamicKey) {
			foot.push(("(" + this.tvar() + "==" + cref + ") || (!" + cref + " && (" + cref + "=" + this.tvar() + ").insertInto$(" + pref + ")) || " + cref + ".replaceWith$(" + cref + "=" + this.tvar() + ")"));
		} else {
			foot.push(("" + this.bvar() + " || " + this.tvar() + ".insertInto$(" + pref + ")"));
		};
	};
	
	if (this.option('fragmented')) {
		add("imba.ctx=null");
	};
	
	if (!parent) {
		if (this.option('return')) {
			foot.push(("return " + this.tvar()));
		} else if (!isReactive || o.inline) {
			foot.push(("" + this.tvar()));
		};
	};
	
	out = out.concat(foot);
	
	if (o.inline) {
		o.inline = wasInline;
		let js = '(' + out.join(',\n') + ')';
		if (this.isSlot() && this.hasChildren()) {
			let key = ("" + this.cvar() + "." + this.oid());
			let post = ("" + this.tvar() + "===" + key + "__ || (" + key + "_ = " + (fragment.tvar()) + ".insert$(" + key + "__=" + this.tvar() + "," + (this._flags) + "," + key + "_))");
			js = ("(" + this.tvar() + "=" + slotPath + "),(!" + this.tvar() + " || " + this.tvar() + ".isEmpty$() && " + js + "),(" + post + ")");
		};
		return js;
	} else {
		o.inline = wasInline;
		let js = out.join(";\n");
		if (this.isSlot() && this.hasChildren()) {
			let key = ("" + this.cvar() + "." + this.oid());
			let post = ("" + this.tvar() + "===" + key + "__ || (" + key + "_ = " + (fragment.tvar()) + ".insert$(" + key + "__=" + this.tvar() + "," + (this._flags) + "," + key + "_))");
			js = ("" + this.tvar() + "=" + slotPath + ";\nif(!" + this.tvar() + " || " + this.tvar() + ".isEmpty$())\{\n" + js + "\n\}\n" + post);
		};
		return js;
	};
};


function TagWrapper(){ return ValueNode.apply(this,arguments) };

subclass$(TagWrapper,ValueNode);
exports.TagWrapper = TagWrapper; // export class 
TagWrapper.prototype.visit = function (){
	if (this.value() instanceof Array) {
		this.value().map(function(v) { return v.traverse(); });
	} else {
		this.value().traverse();
	};
	return this;
};

TagWrapper.prototype.c = function (){
	return ("" + (this.scope__().imba().c()) + ".getTagForDom(" + this.value().c({expression: true}) + ")");
};





function Selector(list,options){
	this._nodes = list || [];
	this._options = options;
};

subclass$(Selector,ListNode);
exports.Selector = Selector; // export class 
Selector.prototype.add = function (part,typ){
	this.push(part);
	return this;
};

Selector.prototype.isExpressable = function (){
	return true;
};

Selector.prototype.visit = function (){
	let res = [];
	for (let i = 0, items = iter$(this._nodes), len = items.length, item; i < len; i++) {
		item = items[i];
		res.push((!((item instanceof Token))) && item.traverse());
	};
	return res;
};

Selector.prototype.query = function (){
	var str = "";
	var ary = [];
	
	for (let i = 0, items = iter$(this.nodes()), len = items.length, item; i < len; i++) {
		item = items[i];
		var val = item.c();
		if (item instanceof Token) {
			ary.push("'" + val.replace(/\'/g,'"') + "'");
		} else {
			ary.push(val);
		};
	};
	
	return ary.join(' + ');
};

Selector.prototype.toString = function (){
	return AST.cary(this.nodes()).join('');
};


Selector.prototype.js = function (o){
	var typ = this.option('type');
	var q = AST.c(this.query());
	var imba = this.scope__().imba().c();
	
	if (typ == '%') {
		return ("" + imba + ".q$(" + q + "," + o.scope().context().c({explicit: true}) + ")"); 
	} else if (typ == '%%') {
		return ("" + imba + ".q$$(" + q + "," + o.scope().context().c({explicit: true}) + ")");
	} else {
		return ("" + imba + ".q" + typ + "(" + q + ")");
	};
};

function SelectorPart(){ return ValueNode.apply(this,arguments) };

subclass$(SelectorPart,ValueNode);
exports.SelectorPart = SelectorPart; // export class 




function Await(){ return ValueNode.apply(this,arguments) };

subclass$(Await,ValueNode);
exports.Await = Await; // export class 
Await.prototype.func = function(v){ return this._func; }
Await.prototype.setFunc = function(v){ this._func = v; return this; };

Await.prototype.js = function (o){
	if (this.option('native')) { return ("await " + (this.value().c())) };
	
	return CALL(OP('.',new Util.Promisify([this.value()]),'then'),[this.func()]).c();
};

Await.prototype.visit = function (o){
	// things are now traversed in a somewhat chaotic order. Need to tighten
	// Create await function - push this value up to block, take the outer
	this.value().traverse();
	
	var fnscope = o.up(Func); 
	
	if (!o.es5()) {
		if (fnscope) {
			this.set({native: true});
			fnscope.set({async: true});
			return this;
		} else {
			// add warning
			// should add as diagnostics - no?
			this.warn("toplevel await not allowed");
		};
	};
	
	var block = o.up(Block); 
	var outer = o.relative(block,1);
	var par = o.relative(this,-1);
	
	this.setFunc(new AsyncFunc([],[]));
	
	this.func().body().setNodes(block.defers(outer,this));
	this.func().scope().visit();
	
	
	if (par instanceof Assign) {
		par.left().traverse();
		var lft = par.left().node();
		
		if (lft instanceof VarReference) {
			// the param is already registered?
			// should not force the name already??
			// beware of bugs
			this.func().params().at(0,true,lft.variable().name());
		} else {
			par.setRight(this.func().params().at(0,true));
			this.func().body().unshift(par);
			this.func().scope().context();
		};
	};
	
	
	
	
	
	
	
	
	
	this.func().traverse();
	
	return this;
};

function AsyncFunc(params,body,name,target,options){
	AsyncFunc.prototype.__super__.constructor.call(this,params,body,name,target,options);
};

subclass$(AsyncFunc,Func);
exports.AsyncFunc = AsyncFunc; // export class 
AsyncFunc.prototype.scopetype = function (){
	return LambdaScope;
};



function ESMSpecifier(name,alias){
	this._name = name;
	this._alias = alias;
};

subclass$(ESMSpecifier,Node);
exports.ESMSpecifier = ESMSpecifier; // export class 
ESMSpecifier.prototype.alias = function(v){ return this._alias; }
ESMSpecifier.prototype.setAlias = function(v){ this._alias = v; return this; };
ESMSpecifier.prototype.name = function(v){ return this._name; }
ESMSpecifier.prototype.setName = function(v){ this._name = v; return this; };

ESMSpecifier.prototype.visit = function (stack){
	this._declaration = stack.up(ESMDeclaration);
	if (this._declaration instanceof ImportDeclaration) {
		this._importer = this._declaration;
	} else {
		this._exporter = this._declaration;
	};
	this._cname = helpers.clearLocationMarkers(this._name.c());
	this._key = this._alias ? helpers.clearLocationMarkers(this._alias.c()) : this._cname;
	
	
	
	if (this._exporter) {
		// lookup variable
		if (!this._exporter.source()) {
			this._variable = this.scope__().root().lookup(this._cname);
		};
	} else {
		this._variable = this.scope__().root().register(this._key,this,{type: 'imported'});
		stack.registerSemanticToken((this._alias || this._name),this._variable);
	};
	return this;
};


ESMSpecifier.prototype.js = function (){
	if (this._alias) {
		return ("" + this._name.c() + " as " + this._alias.c());
	} else {
		return ("" + this._name.c());
	};
};


function ImportSpecifier(){ return ESMSpecifier.apply(this,arguments) };

subclass$(ImportSpecifier,ESMSpecifier);
exports.ImportSpecifier = ImportSpecifier; // export class 
ImportSpecifier.prototype.visit = function (){
	ImportSpecifier.prototype.__super__.visit.apply(this,arguments);
	if (this._importer && STACK.cjs()) {
		// FIXME will bug out if trying to set the variable
		return this._variable._c = OP('.',this._importer.variable(),this._name).c();
	};
};

function ImportNamespaceSpecifier(){ return ESMSpecifier.apply(this,arguments) };

subclass$(ImportNamespaceSpecifier,ESMSpecifier);
exports.ImportNamespaceSpecifier = ImportNamespaceSpecifier; // export class 
ImportNamespaceSpecifier.prototype.visit = function (){
	ImportNamespaceSpecifier.prototype.__super__.visit.apply(this,arguments);
	if (this._importer && STACK.cjs()) {
		// FIXME will bug out if trying to set the variable
		return this._variable._c = this._importer.variable().c();
	};
};


function ExportSpecifier(){ return ESMSpecifier.apply(this,arguments) };

subclass$(ExportSpecifier,ESMSpecifier);
exports.ExportSpecifier = ExportSpecifier; // export class 


function ExportAllSpecifier(){ return ESMSpecifier.apply(this,arguments) };

subclass$(ExportAllSpecifier,ESMSpecifier);
exports.ExportAllSpecifier = ExportAllSpecifier; // export class 


function ImportDefaultSpecifier(){ return ESMSpecifier.apply(this,arguments) };

subclass$(ImportDefaultSpecifier,ESMSpecifier);
exports.ImportDefaultSpecifier = ImportDefaultSpecifier; // export class 
ImportDefaultSpecifier.prototype.visit = function (){
	ImportDefaultSpecifier.prototype.__super__.visit.apply(this,arguments);
	if (STACK.cjs()) {
		if (this._importer) {
			return this._variable._c = ("" + (this._importer.variable().c()) + ".default");
		};
	};
};

function ESMSpecifierList(){ return ListNode.apply(this,arguments) };

subclass$(ESMSpecifierList,ListNode);
exports.ESMSpecifierList = ESMSpecifierList; // export class 
ESMSpecifierList.prototype.js = function (){
	return '{' + ESMSpecifierList.prototype.__super__.js.apply(this,arguments) + '}';
};


function ESMDeclaration(keyword,specifiers,source){
	this.setup();
	this._keyword = keyword;
	this._specifiers = specifiers;
	this._source = source;
	this._defaults = (specifiers && specifiers.find(function(_0) { return _0 instanceof ImportDefaultSpecifier; }));
};

subclass$(ESMDeclaration,Statement);
exports.ESMDeclaration = ESMDeclaration; // export class 
ESMDeclaration.prototype.variable = function(v){ return this._variable; }
ESMDeclaration.prototype.setVariable = function(v){ this._variable = v; return this; };
ESMDeclaration.prototype.source = function(v){ return this._source; }
ESMDeclaration.prototype.setSource = function(v){ this._source = v; return this; };

ESMDeclaration.prototype.isExport = function (){
	return String(this.keyword()) == 'export';
};

ESMDeclaration.prototype.js = function (){
	let kw = M(this.keyword().c(),this.keyword());
	if (this._specifiers && this._source) {
		return ("" + kw + " " + AST.cary(this._specifiers).join(',') + " from " + (this._source.c()));
	} else if (this._specifiers) {
		return ("" + kw + " " + AST.cary(this._specifiers).join(','));
	} else if (this._source) {
		return ("" + kw + " " + (this._source.c()));
	};
};

function ImportDeclaration(){ return ESMDeclaration.apply(this,arguments) };

subclass$(ImportDeclaration,ESMDeclaration);
exports.ImportDeclaration = ImportDeclaration; // export class 
ImportDeclaration.prototype.js = function (){
	if (STACK.cjs()) {
		var src = this._source.c();
		
		let reqjs = ("require(" + src + ")");
		if (!this._specifiers) {
			return reqjs;
		};
		
		
		if (this._defaults && this._specifiers.length == 1) {
			return ("var " + (this._variable.c()) + " = " + (this.util().requireDefault(LIT(reqjs)).c()));
		} else {
			return ("var " + (this._variable.c()) + " = " + reqjs);
		};
	};
	
	if (this._specifiers && this._source) {
		return ("" + M(this.keyword().c(),this.keyword()) + " " + AST.cary(this._specifiers).join(',') + " from " + (this._source.c()));
	} else {
		return ("" + M(this.keyword().c(),this.keyword()) + " " + (this._source.c()));
	};
};

ImportDeclaration.prototype.visit = function (){
	var $1;
	if (STACK.cjs() && this._specifiers) {
		var src = this._source.c();
		var m = helpers.clearLocationMarkers(src).match(/([\w\_\-]+)(\.js|imba)?[\"\']$/);
		this._alias = m ? ('_$' + m[1].replace(/[\/\-]/g,'_')) : 'mod$';
		this._variable = this.scope__().register(this._alias,null,{system: true});
	};
	
	for (let i = 0, items = iter$(this._specifiers), len = items.length; i < len; i++) {
		($1 = items[i]) && $1.traverse  &&  $1.traverse();
	};
	
	return;
};

function ExportDeclaration(){ return ESMDeclaration.apply(this,arguments) };

subclass$(ExportDeclaration,ESMDeclaration);
exports.ExportDeclaration = ExportDeclaration; // export class 
ExportDeclaration.prototype.visit = function (){
	var $1;
	this.scope__().root().activateExports();
	
	for (let i = 0, items = iter$(this._specifiers), len = items.length; i < len; i++) {
		($1 = items[i]) && $1.traverse  &&  $1.traverse();
	};
	return this;
};

ExportDeclaration.prototype.js = function (){
	let kw = M(this.keyword().c(),this.keyword());
	let cjs = STACK.cjs();
	
	if (cjs) {
		let out = [];
		
		if (this._source) {
			this._variable || (this._variable = this.scope__().register(null,null,{system: true}));
			let decl = ("var " + (this._variable.c()) + " = require(" + (this._source.c()) + ")");
			out.push(decl);
			
			let tpl = 'Object.defineProperty(exports, $name$, {\n	enumerable: true, get: function get() { return $path$; }\n});';
			
			for (let i = 0, items = iter$(this._specifiers[0]), len = items.length, item; i < len; i++) {
				item = items[i];
				let js = tpl.replace('$name$',(item.alias() || item.name()).toStr().c());
				js = js.replace('$path$',OP('.',this._variable,item.name()).c());
				out.push(js);
			};
		} else {
			for (let i = 0, items = iter$(this._specifiers[0]), len = items.length, item; i < len; i++) {
				item = items[i];
				let op = OP('=',OP('.',LIT('exports'),item.alias() || item.name()),item._variable);
				out.push(op.c());
			};
		};
		
		return out.join(';\n');
	};
	
	if (this._specifiers && this._source) {
		return ("" + kw + " " + AST.cary(this._specifiers).join(',') + " from " + (this._source.c()));
	} else if (this._specifiers) {
		return ("" + kw + " " + AST.cary(this._specifiers).join(','));
	} else if (this._source) {
		return ("" + kw + " " + (this._source.c()));
	};
};


function ExportAllDeclaration(){ return ExportDeclaration.apply(this,arguments) };

subclass$(ExportAllDeclaration,ExportDeclaration);
exports.ExportAllDeclaration = ExportAllDeclaration; // export class 

function ExportNamedDeclaration(){ return ExportDeclaration.apply(this,arguments) };

subclass$(ExportNamedDeclaration,ExportDeclaration);
exports.ExportNamedDeclaration = ExportNamedDeclaration; // export class 


function Export(){ return ValueNode.apply(this,arguments) };

subclass$(Export,ValueNode);
exports.Export = Export; // export class 
Export.prototype.loc = function (){
	let kw = this.option('keyword');
	return (kw && kw.region) ? kw.region() : (Export.prototype.__super__.loc.apply(this,arguments));
};

Export.prototype.consume = function (node){
	if (node instanceof Return) {
		this.option('return',true);
		return this;
	};
	return Export.prototype.__super__.consume.apply(this,arguments);
};

Export.prototype.visit = function (){
	this.scope__().root().activateExports();
	
	this.value().set(
		{export: (this.option('keyword') || this),
		return: this.option('return'),
		'default': this.option('default')}
	);
	return Export.prototype.__super__.visit.apply(this,arguments);
};

Export.prototype.js = function (o){
	// p "Export {value}"
	// value.set export: self, return: option(:return), default: option(:default)
	
	// if value isa VarOrAccess
	// 	return "exports.{value.c} = {value.c};"
	
	var self = this;
	if (self.value() instanceof ListNode) {
		self.value().map(function(item) { return item.set({export: self}); });
	};
	
	return self.value().c();
};

function Require(){ return ValueNode.apply(this,arguments) };

subclass$(Require,ValueNode);
exports.Require = Require; // export class 
Require.prototype.js = function (o){
	var out = (this.value() instanceof Parens) ? this.value().value().c() : this.value().c();
	return (out == 'require') ? 'require' : (("require(" + out + ")"));
};

function EnvFlag(){
	EnvFlag.prototype.__super__.constructor.apply(this,arguments);
	this._key = String(this._value).slice(1,-1);
};

subclass$(EnvFlag,ValueNode);
exports.EnvFlag = EnvFlag; // export class 
EnvFlag.prototype.raw = function (){
	return (this._raw == null) ? (this._raw = STACK.env("" + this._key)) : this._raw;
};

EnvFlag.prototype.isTruthy = function (){
	var val = this.raw();
	if (val !== undefined) { return !!val };
	return undefined;
};

EnvFlag.prototype.loc = function (){
	return [0,0];
};

EnvFlag.prototype.c = function (){
	var val = this.raw();
	var out = val;
	if (val !== undefined) {
		if ((typeof val=='string'||val instanceof String)) {
			if (val.match(/^\d+(\.\d+)?$/)) {
				out = String(parseFloat(val));
			} else {
				out = ("'" + val + "'");
			};
		} else {
			out = ("" + val);
		};
	} else {
		out = ("ENV_" + (this._key));
	};
	
	return M(out,this._value);
};


function StyleNode(){ return Node.apply(this,arguments) };

subclass$(StyleNode,Node);
exports.StyleNode = StyleNode; // export class 


function StyleSelector(){ return StyleNode.apply(this,arguments) };

subclass$(StyleSelector,StyleNode);
exports.StyleSelector = StyleSelector; // export class 




function StyleRuleSet(selectors,body){
	this._selectors = selectors;
	this._body = body;
};

subclass$(StyleRuleSet,StyleNode);
exports.StyleRuleSet = StyleRuleSet; // export class 
StyleRuleSet.prototype.isStatic = function (){
	return true;
};

StyleRuleSet.prototype.visit = function (stack,o){
	this._tagDeclaration = stack.up(TagDeclaration);
	
	if (stack.parent() instanceof ClassBody) {
		// console.log 'ruleset is inside of class!!'
		let owner = stack.up(2);
		if (owner instanceof TagDeclaration) {
			this._sel = String(this._selectors).trim() || '&';
			if (this._sel.indexOf('&') == -1) { this._sel = ("& " + (this._sel)) };
			this._sel = this._sel.replace('&',owner.selectorpath());
			
			this.set({inClassBody: true});
		} else {
			true; 
		};
		
		
	} else if (this.option('toplevel')) {
		this._sel = String(this._selectors).trim();
	} else if (o.rule) {
		this._sel = this._selectors && this._selectors.toString  &&  this._selectors.toString().trim();
		
		if (this._sel.indexOf('&') == -1) { this._sel = ("& " + (this._sel)) };
		
		
	} else {
		this._name = STACK.sfcid() + this.oid();
		this._sel = ("." + (this._name));
	};
	
	this._selectors && this._selectors.traverse  &&  this._selectors.traverse();
	
	this._styles = {};
	this._body && this._body.traverse  &&  this._body.traverse({rule: this,styles: this._styles});
	
	if (o.rule && o.styles) {
		o.styles[this._sel] = this._styles;
	} else {
		// need to
		let opts = {
			selectors: [],
			localid: this._tagDeclaration && this._tagDeclaration.cssref()
		};
		
		this._css = new StyleRule(null,this._sel,[],this._styles,opts).toString();
		
		if (opts.hasLocalRules && this._tagDeclaration) {
			this._tagDeclaration.set({hasScopedStyles: true});
		};
		
		this.scope__().root().styles().push({
			type: 'css',
			processed: this._css
		});
	};
	
	return this;
};

StyleRuleSet.prototype.toRaw = function (){
	return ("" + (this._name));
};

StyleRuleSet.prototype.c = function (){
	if (this.option('inClassBody') || this.option('toplevel')) { return '' };
	
	
	
	let out = ("'" + (this._name) + "'");
	out += '\n/*\n' + this._css + '\n*/';
	return out;
};




function StyleBody(){ return ListNode.apply(this,arguments) };

subclass$(StyleBody,ListNode);
exports.StyleBody = StyleBody; // export class 
StyleBody.prototype.visit = function (){
	let items = this._nodes;
	let i = 0;
	
	while (i < items.length){
		let item = items[i];
		let res = item.traverse();
		
		if (res != item) {
			if (res instanceof Array) {
				items.splice.apply(items,[].concat([i,1], Array.from(res)));
				continue;
			};
		};
		
		
		if (item == items[i]) {
			i++;
		};
	};
	return this;
};

StyleBody.prototype.toJSON = function (){
	return this.values();
};

function StyleDeclaration(property,expr){
	this._property = property;
	this._expr = (expr instanceof StyleExpressions) ? expr : new StyleExpressions(expr);
	this;
};

subclass$(StyleDeclaration,StyleNode);
exports.StyleDeclaration = StyleDeclaration; // export class 
StyleDeclaration.prototype.clone = function (name,params){
	if (!params) { params = this._expr.clone() };
	return new StyleDeclaration(this._property.clone(name),params);
};

StyleDeclaration.prototype.visit = function (stack,o){
	// see if property can be expanded
	var self = this;
	let theme = stack.theme();
	let list = stack.parent();
	let alias = theme.expandProperty(self._property.name());
	
	if (alias instanceof Array) {
		list.replace(self,alias.map(function(_0) { return self.clone(_0); }));
		return;
	} else if (alias) {
		self._property = self._property.clone(alias);
	};
	
	let name = String(self._property.name());
	let method = helpers.symbolize(name);
	
	if (theme[method] && !self.option('plain')) {
		let res = theme[method].apply(theme,self._expr.toArray());
		let expanded = [];
		
		if (res instanceof Array) {
			self._expr = new StyleExpressions(res);
		} else if (res instanceof Object) {
			// console.log 'theme has method',method,res
			for (let v, i = 0, keys = Object.keys(res), l = keys.length, k; i < l; i++){
				k = keys[i];v = res[k];if (k.indexOf('&') >= 0) {
					let body = new StyleBody([]);
					let rule = new StyleRuleSet(LIT(k),body);
					expanded.push(rule);
					for (let v2, j = 0, keys1 = Object.keys(v), l = keys1.length, k2; j < l; j++){
						k2 = keys1[j];v2 = v[k2];body.add(new StyleDeclaration(self._property.clone(k2),v2));
					};
				} else {
					expanded.push(new StyleDeclaration(self._property.clone(k),v).set({plain: k == name}));
				};
			};
			list.replace(self,expanded);
			return;
		};
	};
	
	if (self._expr) { self._expr.traverse({property: name}) };
	
	if (o.styles) {
		let key = self._property.toKey();
		if (o.selector) {
			key = JSON.stringify([o.selector,key]);
		};
		o.styles[key] = self._expr.c();
	};
	return self;
};

StyleDeclaration.prototype.toCSS = function (){
	return ("" + (this._property.c()) + ": " + AST.cary(this._expr).join(' '));
};

StyleDeclaration.prototype.toJSON = function (){
	return this.toCSS();
};


function StyleProperty(token){
	this._token = token;
	this._parts = String(this._token).replace(/(^|\b)\$/g,'--').split('.');
};

subclass$(StyleProperty,StyleNode);
exports.StyleProperty = StyleProperty; // export class 
StyleProperty.prototype.name = function(v){ return this._name; }
StyleProperty.prototype.setName = function(v){ this._name = v; return this; };


StyleProperty.prototype.name = function (){
	return this._name || (this._name = String(this._parts[0]));
};

StyleProperty.prototype.clone = function (newname){
	return new StyleProperty([newname || this.name()].concat(this.modifiers()).join("."));
};

StyleProperty.prototype.addModifier = function (modifier){
	this._parts.push(modifier);
	return this;
};

StyleProperty.prototype.modifiers = function (){
	return this._parts.slice(1);
};

StyleProperty.prototype.toJSON = function (){
	return this.name() + this.modifiers().join(".");
};

StyleProperty.prototype.toString = function (){
	return this.name() + this.modifiers().join(".");
};

StyleProperty.prototype.toKey = function (){
	return this._parts.join('.');
};

StyleProperty.prototype.c = function (){
	return this.toString();
};





function StylePropertyIdentifier(name){
	this._name = name;
	if (String(name)[0] == '$') {
		this._name = ("--" + String(name).slice(1));
	};
	
};

subclass$(StylePropertyIdentifier,StyleNode);
exports.StylePropertyIdentifier = StylePropertyIdentifier; // export class 
StylePropertyIdentifier.prototype.toJSON = function (){
	return String(this._name);
};

StylePropertyIdentifier.prototype.toString = function (){
	return String(this._name);
};

function StylePropertyModifier(name){
	this._name = name;
};

subclass$(StylePropertyModifier,StyleNode);
exports.StylePropertyModifier = StylePropertyModifier; // export class 
StylePropertyModifier.prototype.toJSON = function (){
	return String(this._name);
};

StylePropertyModifier.prototype.toString = function (){
	return String(this._name);
};

function StyleExpressions(){ return ListNode.apply(this,arguments) };

subclass$(StyleExpressions,ListNode);
exports.StyleExpressions = StyleExpressions; // export class 
StyleExpressions.prototype.load = function (list){
	if (list instanceof Array) {
		list = list.map(function(_0) { return (_0 instanceof StyleExpression) ? (_0) : new StyleExpression(_0); });
	};
	return [].concat(list);
};

StyleExpressions.prototype.c = function (){
	return AST.cary(this._nodes).join(', ');
};

StyleExpressions.prototype.clone = function (){
	return new StyleExpressions(this._nodes.slice(0));
};

StyleExpressions.prototype.toArray = function (){
	return this._nodes.filter(function(_0) { return _0 instanceof StyleExpression; }).map(function(_0) { return _0.toArray(); });
};

function StyleExpression(){ return ListNode.apply(this,arguments) };

subclass$(StyleExpression,ListNode);
exports.StyleExpression = StyleExpression; // export class 
StyleExpression.prototype.load = function (list){
	return [].concat(list);
};

StyleExpression.prototype.toString = function (){
	return AST.cary(this._nodes).join(' ');
};

StyleExpression.prototype.toArray = function (){
	return this._nodes.slice(0);
};

StyleExpression.prototype.clone = function (){
	return new StyleExpression(this._nodes.slice(0));
};

StyleExpression.prototype.c = function (){
	return this.toString();
};

StyleExpression.prototype.toJSON = function (){
	return this.toString();
};

StyleExpression.prototype.toArray = function (){
	return this._nodes;
};

StyleExpression.prototype.toIterable = function (){
	return this._nodes;
};

StyleExpression.prototype.visit2 = function (){
	let items = this._nodes;
	let i = 0;
	
	while (i < items.length){
		let item = items[i];
		let next = items[i + 1]; 
		let res = item.traverse();
		
		if (res != item) {
			if (res instanceof Array) {
				items.splice.apply(items,[].concat([i,1], Array.from(res)));
				continue;
			};
		};
		
		
		if (item == items[i]) {
			i++;
		};
	};
	return this;
};

function StyleTerm(){ return ValueNode.apply(this,arguments) };

subclass$(StyleTerm,ValueNode);
exports.StyleTerm = StyleTerm; // export class 
StyleTerm.prototype.valueOf = function (){
	return String(this._value);
};

StyleTerm.prototype.toString = function (){
	return String(this._value);
};

StyleTerm.prototype.visit = function (stack,o){
	this._token = this._value;
	let resolved = stack.theme().$value(this.valueOf(),0,o.property);
	
	this._resolvedValue = resolved;
	return this;
};

StyleTerm.prototype.kind = function (){
	return this._kind;
};

StyleTerm.prototype.c = function (){
	return (!(this._resolvedValue instanceof Node)) ? this._resolvedValue : this.valueOf();
	
};

function StyleFunction(value,params){
	this._name = value;
	this._params = params;
};

subclass$(StyleFunction,Node);
exports.StyleFunction = StyleFunction; // export class 
StyleFunction.prototype.kind = function (){
	return 'function';
};

StyleFunction.prototype.visit = function (stack,o){
	if (this._params && this._params.traverse) { this._params.traverse() };
	return this;
};

StyleFunction.prototype.toString = function (){
	return this.c();
};

StyleFunction.prototype.c = function (){
	return ("" + String(this._name) + "(" + (this._params.c()) + ")");
};

function StyleIdentifier(){ return StyleTerm.apply(this,arguments) };

subclass$(StyleIdentifier,StyleTerm);
exports.StyleIdentifier = StyleIdentifier; // export class 
StyleIdentifier.prototype.c = function (){
	let val = this.toString();
	return (val[0] == '$') ? (("var(--" + val.slice(1) + ")")) : (StyleIdentifier.prototype.__super__.c.apply(this,arguments));
};

function StyleString(){ return StyleTerm.apply(this,arguments) };

subclass$(StyleString,StyleTerm);
exports.StyleString = StyleString; // export class 


function StyleColor(){ return StyleTerm.apply(this,arguments) };

subclass$(StyleColor,StyleTerm);
exports.StyleColor = StyleColor; // export class 


function StyleVar(){ return StyleTerm.apply(this,arguments) };

subclass$(StyleVar,StyleTerm);
exports.StyleVar = StyleVar; // export class 
StyleVar.prototype.c = function (){
	return this.toString();
	
};

function StyleDimension(value){
	this._value = value;
	let m = String(value).match(/^(.+)([a-zA-Z]+|%)$/);
	this._number = parseFloat(m[1]);
	this._unit = m[2];
};

subclass$(StyleDimension,StyleTerm);
exports.StyleDimension = StyleDimension; // export class 
StyleDimension.prototype.unit = function(v){ return this._unit; }
StyleDimension.prototype.setUnit = function(v){ this._unit = v; return this; };
StyleDimension.prototype.number = function(v){ return this._number; }
StyleDimension.prototype.setNumber = function(v){ this._number = v; return this; };

StyleDimension.prototype.valueOf = function (){
	if (this.unit() == 'u') {
		return this.number() * 4 + 'px';
	};
	return String(this._value);
};

function StyleNumber(value,unit){
	StyleNumber.prototype.__super__.constructor.apply(this,arguments);
	this._number = parseFloat(String(value));
	this._unit = null;
};

subclass$(StyleNumber,StyleTerm);
exports.StyleNumber = StyleNumber; // export class 
StyleNumber.prototype.unit = function(v){ return this._unit; }
StyleNumber.prototype.setUnit = function(v){ this._unit = v; return this; };
StyleNumber.prototype.number = function(v){ return this._number; }
StyleNumber.prototype.setNumber = function(v){ this._number = v; return this; };

StyleNumber.prototype.valueOf = function (){
	return this.number();
};



function Util(args){
	this._args = args;
};


subclass$(Util,Node);
exports.Util = Util; // export class 
Util.prototype.args = function(v){ return this._args; }
Util.prototype.setArgs = function(v){ this._args = v; return this; };

Util.extend = function (a,b){
	return new Util.Extend([a,b]);
};

Util.callImba = function (scope,meth,args){
	return CALL(OP('.',scope.imba(),new Identifier(meth)),args);
};

Util.repeat = function (str,times){
	var res = '';
	while (times > 0){
		if (times % 2 == 1) {
			res += str;
		};
		str += str;
		times >>= 1;
	};
	return res;
};


Util.keys = function (obj){
	var l = new Const("Object");
	var r = new Identifier("keys");
	return CALL(OP('.',l,r),[obj]);
};

Util.len = function (obj,cache){
	var r = new Identifier("length");
	var node = OP('.',obj,r);
	if (cache) { node.cache({force: true,pool: 'len'}) };
	return node;
};

Util.indexOf = function (lft,rgt){
	var node = new Util.IndexOf([lft,rgt]);
	
	return node;
};

Util.slice = function (obj,a,b){
	var slice = new Identifier("slice");
	console.log(("slice " + a + " " + b));
	return CALL(OP('.',obj,slice),AST.compact([a,b]));
};

Util.iterable = function (obj,cache){
	if (STACK.tsc()) { return obj };
	var node = new Util.Iterable([obj]);
	if (cache) { node.cache({force: true,pool: 'iter'}) };
	return node;
};

Util.counter = function (start,cache){
	// should it not rather be a variable?!?
	var node = new Num(start); 
	if (cache) { node.cache({force: true,pool: 'counter'}) };
	return node;
};

Util.array = function (size,cache){
	var node = new Util.Array([size]);
	if (cache) { node.cache({force: true,pool: 'list'}) };
	return node;
};

Util.prototype.inlineHelpers = function (){
	return !!OPTS.inlineHelpers;
};

Util.prototype.name = function (){
	return 'requireDefault$';
};

Util.prototype.js = function (){
	this.scope__().root().helper(this,this.helper());
	return ("" + this.name() + "(" + this._args.map(function(v) { return v.c(); }).join(',') + ")");
};


var HELPERS = {
	setField: '(target,key,value,o){\n	Object.defineProperty(target,key,{value:value});\n};',
	
	extendTag: '(el,cls){\n	Object.defineProperties(el,Object.getOwnPropertyDescriptors(cls.prototype));\n	return el;\n};',
	
	initField: '(target,key,o){\n	Object.defineProperty(target,key,o);\n};',
	
	decorate: '(decorators,target,key,desc){\n	var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;\n	if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);\n	else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;\n	return c > 3 && r && Object.defineProperty(target, key, r), r;\n};',
	
	contains: '(a,b){\n	var res = (b && b.indexOf) ? b.indexOf(a) : [].indexOf.call(a,b);\n	return res >= 0;\n};',
	
	requireDefault: '(obj){\n	return obj && obj.__esModule ? obj : { default: obj };\n};'
};

Util.Helper = function Helper(){ return Util.apply(this,arguments) };

subclass$(Util.Helper,Util);
Util.Helper.prototype.name = function (){
	return this.option('name');
};

Util.Helper.prototype.helper = function (){
	return this.option('helper');
};

for (let v, i = 0, keys = Object.keys(HELPERS), l = keys.length, k; i < l; i++){
	k = keys[i];v = HELPERS[k];Util[k] = function() {
		var $0 = arguments, j = $0.length;
		var args = new Array(j>0 ? j : 0);
		while(j>0) args[j-1] = $0[--j];
		let helper = 'function ' + k + '$' + v;
		return new Util.Helper(args).set({name: k + '$',helper: helper});
	};
};


Util.Extend = function Extend(){ return Util.apply(this,arguments) };

subclass$(Util.Extend,Util);
Util.Extend.prototype.helper = function (){
	return 'function extend$(target,ext){\n	// @ts-ignore\n	var descriptors = Object.getOwnPropertyDescriptors(ext);\n	// @ts-ignore\n	Object.defineProperties(target.prototype,descriptors);\n	return target;\n};';
};

Util.Extend.prototype.js = function (o){
	// When this is triggered, we need to add it to the top of file?
	this.scope__().root().helper(this,this.helper());
	return ("extend$(" + AST.compact(AST.cary(this.args())).join(',') + ")");
};

Util.IndexOf = function IndexOf(){ return Util.apply(this,arguments) };

subclass$(Util.IndexOf,Util);
Util.IndexOf.prototype.helper = function (){
	return 'function idx$(a,b){\n	return (b && b.indexOf) ? b.indexOf(a) : [].indexOf.call(a,b);\n};';
};

Util.IndexOf.prototype.js = function (o){
	if (this.inlineHelpers()) {
		this.scope__().root().helper(this,this.helper());
		
		return ("idx$(" + this.args().map(function(v) { return v.c(); }).join(',') + ")");
	} else {
		return ("" + (this.scope__().imba().c()) + ".indexOf(" + this.args().map(function(v) { return v.c(); }).join(',') + ")");
	};
};

Util.Len = function Len(){ return Util.apply(this,arguments) };

subclass$(Util.Len,Util);
Util.Len.prototype.helper = function (){
	return 'function len$(a){\n	return a && (a.len instanceof Function ? a.len() : a.length) || 0;\n};';
};

Util.Len.prototype.js = function (o){
	// 
	if (true) { // isStandalone
		this.scope__().root().helper(this,this.helper());
		
		return ("len$(" + this.args().map(function(v) { return v.c(); }).join(',') + ")");
	};
};


Util.Promisify = function Promisify(){ return Util.apply(this,arguments) };

subclass$(Util.Promisify,Util);
Util.Promisify.prototype.helper = function (){
	// should also check if it is a real promise
	return 'function promise$(a){\n	if(a instanceof Array){\n		console.warn("await (Array) is deprecated - use await Promise.all(Array)");\n		return Promise.all(a);\n	} else {\n		return (a && a.then ? a : Promise.resolve(a));\n	}\n}';
};

Util.Promisify.prototype.js = function (o){
	if (this.inlineHelpers()) {
		// When this is triggered, we need to add it to the top of file?
		this.scope__().root().helper(this,this.helper());
		return ("promise$(" + this.args().map(function(v) { return v.c(); }).join(',') + ")");
	} else {
		return ("" + (this.scope__().imba().c()) + ".await(" + this.args().map(function(v) { return v.c(); }).join(',') + ")");
	};
};

Util.Iterable = function Iterable(){ return Util.apply(this,arguments) };

subclass$(Util.Iterable,Util);
Util.Iterable.prototype.helper = function (){
	// now we want to allow null values as well - just return as empty collection
	// should be the same for for own of I guess
	return ("function iter$(a)\{ return a ? (a.toIterable ? a.toIterable() : a) : []; \};");
};

Util.Iterable.prototype.js = function (o){
	if (this.args()[0] instanceof Arr) { return this.args()[0].c() }; 
	
	this.scope__().root().helper(this,this.helper());
	return ("iter$(" + (this.args()[0].c()) + ")");
};

Util.RequireDefault = function RequireDefault(){ return Util.apply(this,arguments) };

subclass$(Util.RequireDefault,Util);
Util.RequireDefault.prototype.helper = function (){
	// now we want to allow null values as well - just return as empty collection
	// should be the same for for own of I guess
	return 'function requireDefault$(obj){\n	return obj && obj.__esModule ? obj : { default: obj };\n};';
};




Util.IsFunction = function IsFunction(){ return Util.apply(this,arguments) };

subclass$(Util.IsFunction,Util);
Util.IsFunction.prototype.js = function (o){
	return ("" + (this.args()[0].c()));
};

Util.Array = function Array(){ return Util.apply(this,arguments) };

subclass$(Util.Array,Util);
Util.Array.prototype.js = function (o){
	// When this is triggered, we need to add it to the top of file?
	return ("new Array(" + this.args().map(function(v) { return v.c(); }) + ")");
};




function Entities(root){
	this._root = root;
	this._map = [];
	return this;
};

Entities.prototype.add = function (path,object){
	this._map[path] = object;
	if (this._map.indexOf(object) < 0) {
		this._map.push(object);
	};
	return this;
};

Entities.prototype.lookup = function (path){
	return this._map[path];
};






Entities.prototype.plain = function (){
	return JSON.parse(JSON.stringify(this._map));
};

Entities.prototype.toJSON = function (){
	return this._map;
};

function RootEntities(root){
	this._root = root;
	this._map = {};
	return this;
};

RootEntities.prototype.add = function (path,object){
	this._map[path] = object;
	return this;
};

RootEntities.prototype.register = function (entity){
	var path = entity.namepath();
	this._map[path] || (this._map[path] = entity);
	return this;
};

RootEntities.prototype.plain = function (){
	return JSON.parse(JSON.stringify(this._map));
};

RootEntities.prototype.toJSON = function (){
	return this._map;
};










function Scope(node,parent){
	this._nr = STACK.incr('scopes');
	this._head = [];
	this._node = node;
	this._parent = parent;
	this._vars = new ScopeVariables([]);
	this._entities = new Entities(this);
	this._meta = {};
	this._annotations = [];
	this._closure = this;
	this._virtual = false;
	this._counter = 0;
	this._varmap = {};
	this._counters = {};
	this._varpool = [];
	this._refcounter = 0;
	this._level = (parent ? parent._level : (-1)) + 1;
	this.setup();
};

exports.Scope = Scope; // export class 
Scope.prototype.level = function(v){ return this._level; }
Scope.prototype.setLevel = function(v){ this._level = v; return this; };
Scope.prototype.context = function(v){ return this._context; }
Scope.prototype.setContext = function(v){ this._context = v; return this; };
Scope.prototype.node = function(v){ return this._node; }
Scope.prototype.setNode = function(v){ this._node = v; return this; };
Scope.prototype.parent = function(v){ return this._parent; }
Scope.prototype.setParent = function(v){ this._parent = v; return this; };
Scope.prototype.varmap = function(v){ return this._varmap; }
Scope.prototype.setVarmap = function(v){ this._varmap = v; return this; };
Scope.prototype.varpool = function(v){ return this._varpool; }
Scope.prototype.setVarpool = function(v){ this._varpool = v; return this; };
Scope.prototype.params = function(v){ return this._params; }
Scope.prototype.setParams = function(v){ this._params = v; return this; };
Scope.prototype.head = function(v){ return this._head; }
Scope.prototype.setHead = function(v){ this._head = v; return this; };
Scope.prototype.vars = function(v){ return this._vars; }
Scope.prototype.setVars = function(v){ this._vars = v; return this; };
Scope.prototype.counter = function(v){ return this._counter; }
Scope.prototype.setCounter = function(v){ this._counter = v; return this; };
Scope.prototype.entities = function(v){ return this._entities; }
Scope.prototype.setEntities = function(v){ this._entities = v; return this; };

Scope.prototype.p = function (){
	if (STACK.loglevel() > 0) {
		console.log.apply(console,arguments);
	};
	return this;
};

Scope.prototype.oid = function (){
	return this._oid || (this._oid = STACK.generateId(''));
};

Scope.prototype.stack = function (){
	return STACK;
};

Scope.prototype.kind = function (){
	return this._kind || (this._kind = this.constructor.name.replace('Scope','').toLowerCase());
};

Scope.prototype.setup = function (){
	return this._selfless = true;
};

Scope.prototype.incr = function (name){
	if(name === undefined) name = 'i';
	var val = this._counters[name] || (this._counters[name] = 0);
	this._counters[name]++;
	return val;
};

Scope.prototype.nextShortRef = function (){
	return AST.counterToShortRef(this._refcounter++);
};

Scope.prototype.meta = function (key,value){
	if (value != undefined) {
		this._meta[key] = value;
		return this;
	};
	return this._meta[key];
};

Scope.prototype.namepath = function (){
	return '?';
};

Scope.prototype.tagCache = function (){
	// deal with root instead?
	return this._tagCache || (this._tagCache = this.declare('c$$',LIT('(imba.ctx||{})'),
	{system: true}));
};



Scope.prototype.context = function (){
	// why do we need to make sure it is referenced?
	if (!this._context) {
		if (this.selfless()) {
			this._context = this.parent().context().fromScope(this);
			
		} else {
			this._context = new ScopeContext(this);
		};
	};
	return this._context;
};

Scope.prototype.traverse = function (){
	return this;
};

Scope.prototype.visit = function (){
	if (this._parent) { return this };
	this._parent = STACK.scope(1); 
	this._level = STACK.scopes().length - 1;
	
	STACK.addScope(this);
	this.root().scopes().push(this);
	return this;
};

Scope.prototype.wrap = function (scope){
	this._parent = scope._parent;
	scope._parent = this;
	return this;
};




Scope.prototype.virtualize = function (){
	return this;
};

Scope.prototype.root = function (){
	return STACK.ROOT;
	
	var scope = this;
	while (scope){
		if (scope instanceof RootScope) { return scope };
		scope = scope.parent();
	};
	return null;
};

Scope.prototype.register = function (name,decl,o){
	// FIXME re-registering a variable should really return the existing one
	// Again, here we should not really have to deal with system-generated vars
	// But again, it is important
	
	if(decl === undefined) decl = null;
	if(o === undefined) o = {};
	if (!name) {
		o.system = true;
	};
	
	if (o.system) {
		return new SystemVariable(this,name,decl,o);
	};
	
	name = helpers.symbolize(name);
	
	
	var existing = this._varmap.hasOwnProperty(name) && this._varmap[name];
	
	if (existing) {
		if (decl && existing.type() != 'global') {
			decl.warn('Cannot redeclare variable');
		};
		
	};
	
	
	if (existing && !o.unique) {
		return existing;
	};
	
	
	var item = new Variable(this,name,decl,o);
	
	if (!o.system && !existing) {
		this._varmap[name] = item;
	};
	
	if (STACK.state() && (STACK.state().variables instanceof Array)) {
		STACK.state().variables.push(item);
	};
	return item;
};

Scope.prototype.annotate = function (obj){
	this._annotations.push(obj);
	return this;
};


Scope.prototype.declare = function (name,init,o){
	var declarator_;
	if(init === undefined) init = null;
	if(o === undefined) o = {};
	var variable = (name instanceof Variable) ? name : this.register(name,null,o);
	
	
	var dec = this._vars.add(variable,init);
	(declarator_ = variable.declarator()) || ((variable.setDeclarator(dec),dec));
	return variable;
};


Scope.prototype.reusevar = function (name){
	return this.temporary(null,{reuse: true},name);
};




Scope.prototype.temporary = function (decl,o,name){
	if(o === undefined) o = {};
	if(name === undefined) name = null;
	if (name && o.reuse && this._vars[("_temp_" + name)]) {
		return this._vars[("_temp_" + name)];
	};
	
	if (o.pool) {
		for (let i = 0, items = iter$(this._varpool), len = items.length, v; i < len; i++) {
			v = items[i];
			if (v.pool() == o.pool && v.declarator() == null) {
				return v.reuse(decl);
			};
		};
	};
	
	var item = new SystemVariable(this,name,decl,o);
	
	this._varpool.push(item); 
	this._vars.push(item); 
	if (name && o.reuse) {
		this._vars[("_temp_" + name)] = item;
	};
	return item;
};

Scope.prototype.lookup = function (name){
	this._lookups || (this._lookups = {});
	var ret = null;
	name = helpers.symbolize(name);
	if (this._varmap.hasOwnProperty(name)) {
		ret = this._varmap[name];
	} else {
		ret = this.parent() && this.parent().lookup(name);
		
		if (ret) {
			this._nonlocals || (this._nonlocals = {});
			this._nonlocals[name] = ret;
		};
	};
	return ret;
};

Scope.prototype.requires = function (path,name){
	if(name === undefined) name = '';
	return this.root().requires(path,name);
};

Scope.prototype.imba = function (){
	return this.root().imba(); 
};

Scope.prototype.imbaTags = function (){
	return this.root().imbaTags();
};

Scope.prototype.imbaRef = function (name,shorthand){
	if(shorthand === undefined) shorthand = '_';
	return this.root().imbaRef(name,shorthand);
};

Scope.prototype.imbaDependency = function (){
	var root_;
	var $0 = arguments, i = $0.length;
	var params = new Array(i>0 ? i : 0);
	while(i>0) params[i-1] = $0[--i];
	return (root_ = this.root()).imbaDependency.apply(root_,params);
};

Scope.prototype.autodeclare = function (variable){
	return this.vars().push(variable); 
};

Scope.prototype.free = function (variable){
	variable.free(); 
	
	return this;
};

Scope.prototype.selfless = function (){
	return !!this._selfless;
};

Scope.prototype.closure = function (){
	return this._closure;
};

Scope.prototype.finalize = function (){
	return this;
};

Scope.prototype.klass = function (){
	var scope = this;
	while (scope){
		scope = scope.parent();
		if (scope instanceof ClassScope) { return scope };
	};
	return null;
};

Scope.prototype.head = function (){
	return [this._vars,this._params];
};

Scope.prototype.c = function (o){
	var body;
	if(o === undefined) o = {};
	o.expression = false;
	
	this.node().body().setHead(this.head());
	return body = this.node().body().c(o);
};

Scope.prototype.region = function (){
	return this.node().body().region();
};

Scope.prototype.loc = function (){
	return this.node().loc();
};

Scope.prototype.dump = function (){
	var self = this;
	var vars = Object.keys(self._varmap).map(function(k) {
		var v = self._varmap[k];
		
		
		
		return v.references().length ? AST.dump(v) : null;
	});
	
	var desc = {
		nr: self._nr,
		type: self.constructor.name,
		level: (self.level() || 0),
		vars: AST.compact(vars),
		loc: self.loc()
	};
	
	return desc;
};

Scope.prototype.toJSON = function (){
	return this.dump();
};

Scope.prototype.toString = function (){
	return ("" + (this.constructor.name));
};

Scope.prototype.closeScope = function (){
	return this;
};



function RootScope(){
	RootScope.prototype.__super__.constructor.apply(this,arguments);
	
	this.register('global',this,{type: 'global'})._c = 'globalThis';
	
	this.register('imba',this,{type: 'global'});
	this.register('module',this,{type: 'global'});
	this.register('window',this,{type: 'global'});
	this.register('document',this,{type: 'global'});
	this.register('exports',this,{type: 'global'});
	this.register('console',this,{type: 'global'});
	this.register('process',this,{type: 'global'});
	this.register('parseInt',this,{type: 'global'});
	this.register('parseFloat',this,{type: 'global'});
	this.register('setTimeout',this,{type: 'global'});
	this.register('setInterval',this,{type: 'global'});
	this.register('setImmediate',this,{type: 'global'});
	this.register('clearTimeout',this,{type: 'global'});
	this.register('clearInterval',this,{type: 'global'});
	this.register('clearImmediate',this,{type: 'global'});
	this.register('globalThis',this,{type: 'global'});
	this.register('isNaN',this,{type: 'global'});
	this.register('isFinite',this,{type: 'global'});
	this.register('__dirname',this,{type: 'global'});
	this.register('__filename',this,{type: 'global'});
	this.register('_',this,{type: 'global'});
	
	
	this._requires = {};
	this._warnings = [];
	this._scopes = [];
	this._helpers = [];
	this._styles = [];
	this._selfless = true;
	this._implicitAccessors = [];
	this._entities = new RootEntities(this);
	this._object = Obj.wrap({});
	this._head = [this._vars];
	this._dependencies = {};
	this;
};

subclass$(RootScope,Scope);
exports.RootScope = RootScope; // export class 
RootScope.prototype.warnings = function(v){ return this._warnings; }
RootScope.prototype.setWarnings = function(v){ this._warnings = v; return this; };
RootScope.prototype.scopes = function(v){ return this._scopes; }
RootScope.prototype.setScopes = function(v){ this._scopes = v; return this; };
RootScope.prototype.entities = function(v){ return this._entities; }
RootScope.prototype.setEntities = function(v){ this._entities = v; return this; };
RootScope.prototype.object = function(v){ return this._object; }
RootScope.prototype.setObject = function(v){ this._object = v; return this; };
RootScope.prototype.styles = function(v){ return this._styles; }
RootScope.prototype.setStyles = function(v){ this._styles = v; return this; };
RootScope.prototype.options = function(v){ return this._options; }
RootScope.prototype.setOptions = function(v){ this._options = v; return this; };

RootScope.prototype.sfcid = function (){
	return this._sfcid || (this._sfcid = this._options.sourcePath && helpers.identifierForPath(this._options.sourcePath));
};

RootScope.prototype.sfco = function (){
	return this._sfco || (this._sfco = this.declare('sfc$',LIT('{/*$sfc$*/}')));
};

RootScope.prototype.context = function (){
	return this._context || (this._context = new RootScopeContext(this));
};

RootScope.prototype.globalRef = function (){
	let js = "(typeof window !== 'undefined' ? window : (typeof global !== 'undefined' ? global : null))";
	return this._globalRef || (this._globalRef = this.declare('global$',LIT(js)));
};

RootScope.prototype.activateExports = function (){
	if (STACK.cjs() && !this._hasExports) {
		this._hasExports = true;
		return this._head.push(LIT('Object.defineProperty(exports, "__esModule", {value: true});'));
	};
};

RootScope.prototype.lookup = function (name){
	name = helpers.symbolize(name);
	if (this._varmap.hasOwnProperty(name)) { return this._varmap[name] };
};

RootScope.prototype.visit = function (){
	STACK.addScope(this);
	return this;
};

RootScope.prototype.helper = function (typ,value){
	// log "add helper",typ,value
	if (this._helpers.indexOf(value) == -1) {
		this._helpers.push(value);
		this._head.unshift(value);
	};
	
	return this;
};

RootScope.prototype.head = function (){
	return this._head;
};

RootScope.prototype.warn = function (data){
	// hacky
	data.node = null;
	this._warnings.push(data);
	return this;
};

RootScope.prototype.dump = function (){
	var obj = {
		warnings: AST.dump(this._warnings),
		autoself: this._implicitAccessors.map(function(s) { return s.dump(); })
	};
	
	if (OPTS.analysis.scopes) {
		var scopes = this._scopes.map(function(s) { return s.dump(); });
		scopes.unshift(RootScope.prototype.__super__.dump.call(this));
		obj.scopes = scopes;
	};
	
	if (OPTS.analysis.entities) {
		obj.entities = this._entities;
	};
	
	return obj;
};




RootScope.prototype.requires = function (path,name){
	var variable, declarator_;
	if (variable = this.lookup(name)) {
		return variable;
	};
	
	if (variable = this._requires[name]) {
		if (variable._requirePath != path) {
			throw new Error(("" + name + " is already defined as require('" + (variable._requirePath) + "')"));
		};
		return variable;
	};
	
	var req = new Require(new Str("'" + path + "'"));
	variable = new Variable(this,name,null,{system: true});
	var dec = this._vars.add(variable,req);
	(declarator_ = variable.declarator()) || ((variable.setDeclarator(dec),dec));
	variable._requirePath = path;
	this._requires[name] = variable;
	return variable;
};

RootScope.prototype.imba = function (){
	return LIT('imba');
	
};

RootScope.prototype.imbaTags = function (){
	if (this._imbaTags) { return this._imbaTags };
	var imbaRef = this.imba();
	
	if (this._requires.Imba) {
		return this._imbaTags = this.declare('_T',OP('.',imbaRef,'TAGS'));
	} else {
		return this._imbaTags = ("" + (imbaRef.c()) + ".TAGS");
	};
};

RootScope.prototype.imbaDependency = function (path){
	var str, item;
	if (OPTS.imbaPath === null || OPTS.standalone || OPTS.target == 'tsc') { return };
	return this._dependencies[path] || (this._dependencies[path] =  true && (
		str = ("'" + (OPTS.imbaPath || 'imba') + "/src/imba/" + path + "'"),
		item = STACK.cjs() ? LIT(("require(" + str + ")")) : LIT(("import " + str)),
		this._head.push(item),
		item
	));
};

RootScope.prototype.imbaRef = function (name,shorthand){
	if(shorthand === undefined) shorthand = '_';
	if (name == 'tagscope') {
		name = 'createTagScope(/*SCOPEID*/)';
	} else if (name == 'tagfactory') {
		name = 'createElementFactory(/*SCOPEID*/)';
	};
	
	var map = this._imbaRefs || (this._imbaRefs = {});
	if (map[name]) { return map[name] };
	
	var imbaRef = this.imba();
	
	if (this._requires.Imba) {
		return map[name] = this.declare(shorthand,OP('.',this.imba(),name),{system: true});
	} else {
		return map[name] = ("" + (imbaRef.c()) + "." + name);
	};
};


RootScope.prototype.c = function (o){
	if(o === undefined) o = {};
	o.expression = false;
	
	this.node().body().setHead(this.head());
	var body = this.node().body().c(o);
	
	return body;
};

function ModuleScope(){ return Scope.apply(this,arguments) };

subclass$(ModuleScope,Scope);
exports.ModuleScope = ModuleScope; // export class 
ModuleScope.prototype.setup = function (){
	return this._selfless = false;
};

ModuleScope.prototype.namepath = function (){
	return this._node.namepath();
};

function ClassScope(){ return Scope.apply(this,arguments) };

subclass$(ClassScope,Scope);
exports.ClassScope = ClassScope; // export class 
ClassScope.prototype.setup = function (){
	return this._selfless = false;
};

ClassScope.prototype.namepath = function (){
	return this._node.namepath();
};




ClassScope.prototype.virtualize = function (){
	// console.log "virtualizing ClassScope"
	var up = this.parent();
	for (let o = this._varmap, v, i = 0, keys = Object.keys(o), l = keys.length, k; i < l; i++){
		k = keys[i];v = o[k];v.resolve(up,true); 
	};
	return this;
};

ClassScope.prototype.prototype = function (){
	return this._prototype || (this._prototype = new ValueNode(OP('.',this.context(),'prototype')));
};

function TagScope(){ return ClassScope.apply(this,arguments) };

subclass$(TagScope,ClassScope);
exports.TagScope = TagScope; // export class 


function ClosureScope(){ return Scope.apply(this,arguments) };

subclass$(ClosureScope,Scope);
exports.ClosureScope = ClosureScope; // export class 


function FunctionScope(){ return Scope.apply(this,arguments) };

subclass$(FunctionScope,Scope);
exports.FunctionScope = FunctionScope; // export class 


function IsolatedFunctionScope(){ return FunctionScope.apply(this,arguments) };

subclass$(IsolatedFunctionScope,FunctionScope);
exports.IsolatedFunctionScope = IsolatedFunctionScope; // export class 
IsolatedFunctionScope.prototype.lookup = function (name){
	this._lookups || (this._lookups = {});
	var ret = null;
	name = helpers.symbolize(name);
	if (this._varmap.hasOwnProperty(name)) {
		ret = this._varmap[name];
	} else {
		ret = this.parent() && this.parent().lookup(name);
		
		
		if (ret && ret.closure() == this.parent().closure()) {
			this._leaks || (this._leaks = new Map());
			this._nonlocals || (this._nonlocals = {});
			this._nonlocals[name] = ret;
			
			let shadow = this._leaks.get(ret);
			if (!shadow) {
				this._leaks.set(ret,shadow = new ShadowedVariable(this,name,ret));
			};
			ret = shadow;
		};
	};
	return ret;
};


function MethodScope(){ return Scope.apply(this,arguments) };

subclass$(MethodScope,Scope);
exports.MethodScope = MethodScope; // export class 
MethodScope.prototype.setup = function (){
	return this._selfless = false;
};

function LambdaScope(){ return Scope.apply(this,arguments) };

subclass$(LambdaScope,Scope);
exports.LambdaScope = LambdaScope; // export class 
LambdaScope.prototype.context = function (){
	// why do we need to make sure it is referenced?
	if (!this._context) {
		this._context = this.parent().context().fromScope(this);
	};
	return this._context;
};


function FlowScope(){ return Scope.apply(this,arguments) };

subclass$(FlowScope,Scope);
exports.FlowScope = FlowScope; // export class 
FlowScope.prototype.params = function (){
	if (this._parent) { return this._parent.params() };
};

FlowScope.prototype.register = function (name,decl,o){
	var found;
	if(decl === undefined) decl = null;
	if(o === undefined) o = {};
	if (o.type != 'let' && (this.closure() != this)) {
		if (found = this.lookup(name)) {
			if (found.type() == 'let') {
				// p "{name} already exists as a block-variable {decl}"
				// TODO should throw error instead
				if (decl) { decl.warn("Variable already exists in block") };
				
			};
		};
		return this.closure().register(name,decl,o);
	} else {
		return FlowScope.prototype.__super__.register.call(this,name,decl,o);
	};
};



FlowScope.prototype.autodeclare = function (variable){
	return this.parent().autodeclare(variable);
};

FlowScope.prototype.closure = function (){
	return this._parent.closure(); 
};

FlowScope.prototype.context = function (){
	return this._context || (this._context = this.parent().context());
};

FlowScope.prototype.closeScope = function (){
	// FIXME
	if (this._context) { this._context.reference() };
	return this;
};

function CatchScope(){ return FlowScope.apply(this,arguments) };

subclass$(CatchScope,FlowScope);
exports.CatchScope = CatchScope; // export class 


function WhileScope(){ return FlowScope.apply(this,arguments) };

subclass$(WhileScope,FlowScope);
exports.WhileScope = WhileScope; // export class 
WhileScope.prototype.autodeclare = function (variable){
	return this.vars().push(variable);
};

function ForScope(){ return FlowScope.apply(this,arguments) };

subclass$(ForScope,FlowScope);
exports.ForScope = ForScope; // export class 
ForScope.prototype.autodeclare = function (variable){
	return this.vars().push(variable);
};

ForScope.prototype.temporary = function (refnode,o,name){
	if(o === undefined) o = {};
	if(name === undefined) name = null;
	return this.parent().temporary(refnode,o,name);
};

function IfScope(){ return FlowScope.apply(this,arguments) };

subclass$(IfScope,FlowScope);
exports.IfScope = IfScope; // export class 
IfScope.prototype.temporary = function (refnode,o,name){
	if(o === undefined) o = {};
	if(name === undefined) name = null;
	return this.parent().temporary(refnode,o,name);
};



function BlockScope(){ return FlowScope.apply(this,arguments) };

subclass$(BlockScope,FlowScope);
exports.BlockScope = BlockScope; // export class 
BlockScope.prototype.temporary = function (refnode,o,name){
	if(o === undefined) o = {};
	if(name === undefined) name = null;
	return this.parent().temporary(refnode,o,name);
};

BlockScope.prototype.region = function (){
	return this.node().region();
};


function Variable(scope,name,decl,o){
	this._ref = STACK._counter++;
	this._c = null;
	this._scope = scope;
	this._name = name;
	this._alias = null;
	this._initialized = true;
	this._declarator = decl;
	this._autodeclare = false;
	this._declared = o && o.declared || false;
	this._resolved = false;
	this._options = o || {};
	this._type = o && o.type || 'var'; 
	this._export = false;
	this._references = []; 
	this._assignments = [];
	this;
};

subclass$(Variable,Node);
exports.Variable = Variable; // export class 
Variable.prototype.scope = function(v){ return this._scope; }
Variable.prototype.setScope = function(v){ this._scope = v; return this; };
Variable.prototype.name = function(v){ return this._name; }
Variable.prototype.setName = function(v){ this._name = v; return this; };
Variable.prototype.alias = function(v){ return this._alias; }
Variable.prototype.setAlias = function(v){ this._alias = v; return this; };
Variable.prototype.type = function(v){ return this._type; }
Variable.prototype.setType = function(v){ this._type = v; return this; };
Variable.prototype.options = function(v){ return this._options; }
Variable.prototype.setOptions = function(v){ this._options = v; return this; };
Variable.prototype.initialized = function(v){ return this._initialized; }
Variable.prototype.setInitialized = function(v){ this._initialized = v; return this; };
Variable.prototype.declared = function(v){ return this._declared; }
Variable.prototype.setDeclared = function(v){ this._declared = v; return this; };
Variable.prototype.declarator = function(v){ return this._declarator; }
Variable.prototype.setDeclarator = function(v){ this._declarator = v; return this; };
Variable.prototype.autodeclare = function(v){ return this._autodeclare; }
Variable.prototype.setAutodeclare = function(v){ this._autodeclare = v; return this; };
Variable.prototype.references = function(v){ return this._references; }
Variable.prototype.setReferences = function(v){ this._references = v; return this; };
Variable.prototype.export = function(v){ return this._export; }
Variable.prototype.setExport = function(v){ this._export = v; return this; };

Variable.prototype.pool = function (){
	return null;
};

Variable.prototype.closure = function (){
	return this._scope.closure();
};

Variable.prototype.assignments = function (){
	return this._assignments;
};



Variable.prototype.assigned = function (val,source){
	this._assignments.push(val);
	if (val instanceof Arr) {
		// just for testing really
		this._isArray = true;
	} else {
		this._isArray = false;
	};
	return this;
};


Variable.prototype.resolve = function (scope,force){
	if(scope === undefined) scope = this.scope();
	if(force === undefined) force = false;
	if (this._resolved && !force) { return this };
	
	
	this._resolved = true;
	var es5 = STACK.es5();
	var closure = this._scope.closure();
	var item = this._shadowing || scope.lookup(this._name);
	
	
	
	
	
	if (this._scope != closure && this._type == 'let' && (es5 || this._virtual)) { // or if it is a system-variable
		item = closure.lookup(this._name);
		
		
		
		scope = closure;
	};
	
	if (item == this) {
		scope.varmap()[this._name] = this;
		return this;
	} else if (item) {
		// possibly redefine this inside, use it only in this scope
		// if the item is defined in an outer scope - we reserve the
		if (item.scope() != scope && (this.options().let || this._type == 'let')) {
			scope.varmap()[this._name] = this;
			
			if ((!es5 && !this._virtual && !this._shadowing)) { return this };
		};
		
		
		
		if (this._options.proxy) {
			true;
		} else {
			var i = 0;
			var orig = this._name;
			
			while (scope.lookup(this._name)){
				this._name = ("" + orig + (i += 1));
			};
		};
	};
	
	scope.varmap()[this._name] = this;
	closure.varmap()[this._name] = this;
	return this;
};

Variable.prototype.reference = function (){
	return this;
};

Variable.prototype.node = function (){
	return this;
};

Variable.prototype.cache = function (){
	return this;
};

Variable.prototype.traverse = function (){
	return this;
};

Variable.prototype.free = function (ref){
	this._declarator = null;
	return this;
};

Variable.prototype.reuse = function (ref){
	this._declarator = ref;
	return this;
};

Variable.prototype.proxy = function (par,index){
	this._proxy = [par,index];
	return this;
};

Variable.prototype.refcount = function (){
	return this._references.length;
};

Variable.prototype.c = function (){
	if (this._c) { return this._c };
	
	if (this._proxy) {
		if (this._proxy instanceof Node) {
			this._c = this._proxy.c();
		} else {
			this._c = this._proxy[0].c();
			if (this._proxy[1]) {
				this._c += '[' + this._proxy[1].c() + ']';
			};
		};
	} else {
		if (!this._resolved) this.resolve();
		var v = (this.alias() || this.name());
		this._c = (typeof v == 'string') ? v : v.c();
		
		
		
		
		
		
		if (RESERVED_REGEX.test(this._c)) { this._c = ("" + this.c() + "$") }; 
		
	};
	return this._c;
};

Variable.prototype.js = function (){
	return this.c();
};


Variable.prototype.consume = function (node){
	return this;
};


Variable.prototype.accessor = function (ref){
	var node = new LocalVarAccess(".",null,this);
	
	
	return node;
};

Variable.prototype.assignment = function (val){
	return new Assign('=',this,val);
};

Variable.prototype.addReference = function (ref){
	if (ref instanceof Identifier) {
		ref.references(this);
	};
	
	if (ref.region && ref.region()) {
		this._references.push(ref);
		if (ref.scope__() != this._scope) {
			this._noproxy = true;
		};
	};
	
	return this;
};

Variable.prototype.autodeclare = function (){
	if (this._declared) { return this };
	this._autodeclare = true;
	this.scope().autodeclare(this);
	this._declared = true;
	return this;
};

Variable.prototype.predeclared = function (){
	this._declared = true;
	return this;
};


Variable.prototype.toString = function (){
	return String(this.name());
};

Variable.prototype.dump = function (typ){
	var name = this.name();
	if (name[0].match(/[A-Z]/)) { return null };
	
	return {
		type: this.type(),
		name: name,
		refs: AST.dump(this._references,typ)
	};
};


function SystemVariable(){ return Variable.apply(this,arguments) };

subclass$(SystemVariable,Variable);
exports.SystemVariable = SystemVariable; // export class 
SystemVariable.prototype.pool = function (){
	return this._options.pool;
};


SystemVariable.prototype.predeclared = function (){
	this.scope().vars().remove(this);
	return this;
};

SystemVariable.prototype.resolve = function (){
	var nodealias, v_;
	if (this._resolved) { return this };
	this._resolved = true;
	
	
	
	
	
	var alias = this._name;
	var typ = this._options.pool;
	var names = [].concat(this._options.names);
	var alt = null;
	var node = null;
	
	this._name = null;
	
	var scope = this.scope();
	
	if (typ == 'tag') {
		var i = 0;
		while (!this._name){
			alt = ("t" + (i++));
			if (!scope.lookup(alt)) { this._name = alt };
		};
	} else if (typ == 'iter') {
		names = ['ary__','ary_','coll','array','items','ary'];
	} else if (typ == 'dict') {
		names = ['dict'];
	} else if (typ == 'val') {
		names = ['v_'];
	} else if (typ == 'arguments') {
		names = ['$_','$0'];
	} else if (typ == 'keypars') {
		names = ['opts','options','pars'];
	} else if (typ == 'counter') {
		names = ['i__','i_','k','j','i'];
	} else if (typ == 'len') {
		names = ['len__','len_','len'];
	} else if (typ == 'list') {
		names = ['tmplist_','tmplist','tmp'];
	};
	
	
	if (alias) {
		names.push(alias);
	};
	
	while (!this._name && (alt = names.pop())){
		let foundAlt = scope.lookup('$' + alt);
		
		if (!foundAlt) { // or (foundAlt.scope != scope and type == 'let' and !STACK.es5)
			this._name = '$' + alt; 
		};
	};
	
	if (!this._name && this._declarator) {
		if (node = this.declarator().node()) {
			if (nodealias = node.alias()) {
				names.push(nodealias);
			};
		};
	};
	
	while (!this._name && (alt = names.pop())){
		if (!scope.lookup('$' + alt)) { this._name = '$' + alt };
	};
	
	
	if (alias && !this._name) {
		i = 0;
		this._name = '$' + alias;
		
		while (scope.lookup(this._name)){
			this._name = ("" + alias + (i += 1));
		};
	};
	
	this._name || (this._name = ("$" + (scope.setCounter(v_ = scope.counter() + 1),v_)));
	
	scope.varmap()[this._name] = this;
	
	if (this.type() != 'let' || STACK.es5() || this._virtual) {
		this.closure().varmap()[this._name] = this;
	};
	return this;
};

SystemVariable.prototype.name = function (){
	this.resolve();
	return this._name;
};

function ShadowedVariable(){ return Variable.apply(this,arguments) };

subclass$(ShadowedVariable,Variable);
exports.ShadowedVariable = ShadowedVariable; // export class 



function ScopeContext(scope,value){
	this._scope = scope;
	this._value = value;
	this._reference = null;
	this;
};

subclass$(ScopeContext,Node);
exports.ScopeContext = ScopeContext; // export class 
ScopeContext.prototype.scope = function(v){ return this._scope; }
ScopeContext.prototype.setScope = function(v){ this._scope = v; return this; };
ScopeContext.prototype.value = function(v){ return this._value; }
ScopeContext.prototype.setValue = function(v){ this._value = v; return this; };
ScopeContext.prototype.reference = function(v){ return this._reference; }
ScopeContext.prototype.setReference = function(v){ this._reference = v; return this; };

ScopeContext.prototype.namepath = function (){
	return this._scope.namepath();
};









ScopeContext.prototype.reference = function (){
	// if we are in  constructor we do want to declare it after super
	return this._reference || (this._reference = this.scope().declare("self",new This())); 
};

ScopeContext.prototype.fromScope = function (other){
	return new IndirectScopeContext(other,this);
};

ScopeContext.prototype.c = function (){
	var val = this._value; 
	return val ? val.c() : "this";
};

ScopeContext.prototype.cache = function (){
	return this;
};

ScopeContext.prototype.proto = function (){
	return ("" + (this.c()) + ".prototype");
};

ScopeContext.prototype.isGlobalContext = function (){
	return false;
};

function IndirectScopeContext(scope,parent){
	this._scope = scope;
	this._parent = parent;
	this._reference = parent.reference();
};

subclass$(IndirectScopeContext,ScopeContext);
exports.IndirectScopeContext = IndirectScopeContext; // export class 
IndirectScopeContext.prototype.reference = function (){
	return this._reference; 
};

IndirectScopeContext.prototype.c = function (){
	return this.reference().c();
};

IndirectScopeContext.prototype.isGlobalContext = function (){
	return this._parent.isGlobalContext();
};

function RootScopeContext(){ return ScopeContext.apply(this,arguments) };

subclass$(RootScopeContext,ScopeContext);
exports.RootScopeContext = RootScopeContext; // export class 
RootScopeContext.prototype.reference = function (){
	// should be a 
	return this._reference || (this._reference = this.scope().lookup('global')); 
};

RootScopeContext.prototype.c = function (o){
	// @reference ||= scope.declare("self",scope.object, type: 'global')
	// return "" if o and o:explicit
	return "globalThis";
	var val = this.reference(); 
	return (val && val != this) ? val.c() : "this";
	
	
};

RootScopeContext.prototype.isGlobalContext = function (){
	return true;
};

function Super(keyword){
	this._keyword = keyword;
	Super.prototype.__super__.constructor.apply(this,arguments);
};

subclass$(Super,Node);
exports.Super = Super; // export class 
Super.prototype.visit = function (){
	var m;
	this._method = STACK.method();
	this._up = STACK.parent();
	if (m = STACK.method()) {
		m.set({supr: {node: STACK.blockpart(),block: STACK.block()}});
		m.set({injectInitAfter: STACK.blockpart()});
	};
	return this;
};

Super.prototype.startLoc = function (){
	return this._keyword && this._keyword.startLoc();
};

Super.prototype.endLoc = function (){
	return this._keyword && this._keyword.endLoc();
};

Super.prototype.c = function (){
	let m = this._method;
	let up = this._up;
	let sup = LIT('super');
	let op;
	let virtual = m && m.option('inExtension');
	
	
	
	if (!((up instanceof Access) || (up instanceof Call))) {
		if (m && m.isConstructor()) {
			op = LIT('super(...arguments)');
		} else if (m && virtual) {
			op = CALL(OP('.',this.slf(),'super$'),[m.name().toStr()]);
			if (m.isSetter()) {
				op = CALL(OP('.',this.slf(),'super$set'),[m.name().toStr(),m.params().at(0)]);
			} else if (!m.isGetter()) {
				op = CALL(OP('.',op,'apply'),[this.slf(),LIT('arguments')]);
			};
		} else if (m) {
			op = OP('.',sup,m.name());
			if (m.isSetter()) {
				op = OP('=',op,m.params().at(0));
			} else if (!m.isGetter()) {
				op = CALL(op,[LIT('...arguments')]);
			};
		};
		
		return op ? ((M(op.c({mark: false}),this))) : '/**/';
	};
	
	if ((up instanceof Call) && m && !m.isConstructor()) {
		return OP('.',sup,m.name()).c();
	};
	
	return "super";
};



var BR0 = exports.BR0 = new Newline('\n');
var BR = exports.BR = new Newline('\n');
var BR2 = exports.BR2 = new Newline('\n\n');
var SELF = exports.SELF = new Self();
var THIS = exports.THIS = LIT('this');
var PROTO = exports.PROTO = LIT('this.prototype');


var TRUE = exports.TRUE = new True('true');
var FALSE = exports.FALSE = new False('false');
var UNDEFINED = exports.UNDEFINED = new Undefined();
var NIL = exports.NIL = new Nil();

var ARGUMENTS = exports.ARGUMENTS = new ArgsReference('arguments');
var EMPTY = exports.EMPTY = '';
var NULL = exports.NULL = 'null';

var RESERVED = exports.RESERVED = ['default','native','enum','with'];
var RESERVED_REGEX = exports.RESERVED_REGEX = /^(default|native|enum|with|new|char)$/;












/***/ }),
/* 11 */
/***/ (function(module, exports, __webpack_require__) {

function iter$(a){ return a ? (a.toArray ? a.toArray() : a) : []; };
var self = {};
var Stylis = __webpack_require__(12);
var selparser = __webpack_require__(13);
var cssparser = new Stylis({compress: false,semicolons: false});

var selScope = null;

function rewriteSelector(str){
	var sel = selparser.parse(str);
	
	var rule = sel.rule;
	while (rule){
		if (!rule.rule) { break; };
		
		if (rule.rule.nestingOperator == '>>>') {
			rule.rule.nestingOperator = null;
			break;
		};
		
		rule = rule.rule;
	};
	
	if (rule) {
		rule.attrs = [].concat(rule.attrs || []).concat({name: 'data-' + selScope});
		
	};
	
	return selparser.render(sel);
};

function plugin(context,content,selectors,parent,line,column,length){
	
	if (context == 2 && selScope) {
		for (let i = 0, items = iter$(selectors), len = items.length; i < len; i++) {
			selectors[i] = rewriteSelector(items[i]);
		};
		return content;
	};
	return content;
};

cssparser.use(plugin);


exports.compile = self.compile = function (css,o){
	if(o === undefined) o = {};
	selScope = o.scope;
	return cssparser('',css);
};


/***/ }),
/* 12 */
/***/ (function(module, exports, __webpack_require__) {

/*
MIT License

Copyright (c) 2016 Sultan Tarimo

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
*/
!function(e){ true?module.exports=e(null):undefined}(function e(a){"use strict";var r=/^\0+/g,c=/[\0\r\f]/g,s=/: */g,t=/zoo|gra/,i=/([,: ])(transform)/g,f=/,+\s*(?![^(]*[)])/g,n=/ +\s*(?![^(]*[)])/g,l=/ *[\0] */g,o=/,\r+?/g,h=/([\t\r\n ])*\f?&/g,u=/:global\(((?:[^\(\)\[\]]*|\[.*\]|\([^\(\)]*\))*)\)/g,d=/\W+/g,b=/@(k\w+)\s*(\S*)\s*/,p=/::(place)/g,k=/:(read-only)/g,g=/\s+(?=[{\];=:>])/g,A=/([[}=:>])\s+/g,C=/(\{[^{]+?);(?=\})/g,w=/\s{2,}/g,v=/([^\(])(:+) */g,m=/[svh]\w+-[tblr]{2}/,x=/\(\s*(.*)\s*\)/g,$=/([\s\S]*?);/g,y=/-self|flex-/g,O=/[^]*?(:[rp][el]a[\w-]+)[^]*/,j=/stretch|:\s*\w+\-(?:conte|avail)/,z=/([^-])(image-set\()/,N="-webkit-",S="-moz-",F="-ms-",W=59,q=125,B=123,D=40,E=41,G=91,H=93,I=10,J=13,K=9,L=64,M=32,P=38,Q=45,R=95,T=42,U=44,V=58,X=39,Y=34,Z=47,_=62,ee=43,ae=126,re=0,ce=12,se=11,te=107,ie=109,fe=115,ne=112,le=111,oe=105,he=99,ue=100,de=112,be=1,pe=1,ke=0,ge=1,Ae=1,Ce=1,we=0,ve=0,me=0,xe=[],$e=[],ye=0,Oe=null,je=-2,ze=-1,Ne=0,Se=1,Fe=2,We=3,qe=0,Be=1,De="",Ee="",Ge="";function He(e,a,s,t,i){for(var f,n,o=0,h=0,u=0,d=0,g=0,A=0,C=0,w=0,m=0,$=0,y=0,O=0,j=0,z=0,R=0,we=0,$e=0,Oe=0,je=0,ze=s.length,Je=ze-1,Re="",Te="",Ue="",Ve="",Xe="",Ye="";R<ze;){if(C=s.charCodeAt(R),R===Je)if(h+d+u+o!==0){if(0!==h)C=h===Z?I:Z;d=u=o=0,ze++,Je++}if(h+d+u+o===0){if(R===Je){if(we>0)Te=Te.replace(c,"");if(Te.trim().length>0){switch(C){case M:case K:case W:case J:case I:break;default:Te+=s.charAt(R)}C=W}}if(1===$e)switch(C){case B:case q:case W:case Y:case X:case D:case E:case U:$e=0;case K:case J:case I:case M:break;default:for($e=0,je=R,g=C,R--,C=W;je<ze;)switch(s.charCodeAt(je++)){case I:case J:case W:++R,C=g,je=ze;break;case V:if(we>0)++R,C=g;case B:je=ze}}switch(C){case B:for(g=(Te=Te.trim()).charCodeAt(0),y=1,je=++R;R<ze;){switch(C=s.charCodeAt(R)){case B:y++;break;case q:y--;break;case Z:switch(A=s.charCodeAt(R+1)){case T:case Z:R=Qe(A,R,Je,s)}break;case G:C++;case D:C++;case Y:case X:for(;R++<Je&&s.charCodeAt(R)!==C;);}if(0===y)break;R++}if(Ue=s.substring(je,R),g===re)g=(Te=Te.replace(r,"").trim()).charCodeAt(0);switch(g){case L:if(we>0)Te=Te.replace(c,"");switch(A=Te.charCodeAt(1)){case ue:case ie:case fe:case Q:f=a;break;default:f=xe}if(je=(Ue=He(a,f,Ue,A,i+1)).length,me>0&&0===je)je=Te.length;if(ye>0)if(f=Ie(xe,Te,Oe),n=Pe(We,Ue,f,a,pe,be,je,A,i,t),Te=f.join(""),void 0!==n)if(0===(je=(Ue=n.trim()).length))A=0,Ue="";if(je>0)switch(A){case fe:Te=Te.replace(x,Me);case ue:case ie:case Q:Ue=Te+"{"+Ue+"}";break;case te:if(Ue=(Te=Te.replace(b,"$1 $2"+(Be>0?De:"")))+"{"+Ue+"}",1===Ae||2===Ae&&Le("@"+Ue,3))Ue="@"+N+Ue+"@"+Ue;else Ue="@"+Ue;break;default:if(Ue=Te+Ue,t===de)Ve+=Ue,Ue=""}else Ue="";break;default:Ue=He(a,Ie(a,Te,Oe),Ue,t,i+1)}Xe+=Ue,O=0,$e=0,z=0,we=0,Oe=0,j=0,Te="",Ue="",C=s.charCodeAt(++R);break;case q:case W:if((je=(Te=(we>0?Te.replace(c,""):Te).trim()).length)>1){if(0===z)if((g=Te.charCodeAt(0))===Q||g>96&&g<123)je=(Te=Te.replace(" ",":")).length;if(ye>0)if(void 0!==(n=Pe(Se,Te,a,e,pe,be,Ve.length,t,i,t)))if(0===(je=(Te=n.trim()).length))Te="\0\0";switch(g=Te.charCodeAt(0),A=Te.charCodeAt(1),g){case re:break;case L:if(A===oe||A===he){Ye+=Te+s.charAt(R);break}default:if(Te.charCodeAt(je-1)===V)break;Ve+=Ke(Te,g,A,Te.charCodeAt(2))}}O=0,$e=0,z=0,we=0,Oe=0,Te="",C=s.charCodeAt(++R)}}switch(C){case J:case I:if(h+d+u+o+ve===0)switch($){case E:case X:case Y:case L:case ae:case _:case T:case ee:case Z:case Q:case V:case U:case W:case B:case q:break;default:if(z>0)$e=1}if(h===Z)h=0;else if(ge+O===0&&t!==te&&Te.length>0)we=1,Te+="\0";if(ye*qe>0)Pe(Ne,Te,a,e,pe,be,Ve.length,t,i,t);be=1,pe++;break;case W:case q:if(h+d+u+o===0){be++;break}default:switch(be++,Re=s.charAt(R),C){case K:case M:if(d+o+h===0)switch(w){case U:case V:case K:case M:Re="";break;default:if(C!==M)Re=" "}break;case re:Re="\\0";break;case ce:Re="\\f";break;case se:Re="\\v";break;case P:if(d+h+o===0&&ge>0)Oe=1,we=1,Re="\f"+Re;break;case 108:if(d+h+o+ke===0&&z>0)switch(R-z){case 2:if(w===ne&&s.charCodeAt(R-3)===V)ke=w;case 8:if(m===le)ke=m}break;case V:if(d+h+o===0)z=R;break;case U:if(h+u+d+o===0)we=1,Re+="\r";break;case Y:case X:if(0===h)d=d===C?0:0===d?C:d;break;case G:if(d+h+u===0)o++;break;case H:if(d+h+u===0)o--;break;case E:if(d+h+o===0)u--;break;case D:if(d+h+o===0){if(0===O)switch(2*w+3*m){case 533:break;default:y=0,O=1}u++}break;case L:if(h+u+d+o+z+j===0)j=1;break;case T:case Z:if(d+o+u>0)break;switch(h){case 0:switch(2*C+3*s.charCodeAt(R+1)){case 235:h=Z;break;case 220:je=R,h=T}break;case T:if(C===Z&&w===T&&je+2!==R){if(33===s.charCodeAt(je+2))Ve+=s.substring(je,R+1);Re="",h=0}}}if(0===h){if(ge+d+o+j===0&&t!==te&&C!==W)switch(C){case U:case ae:case _:case ee:case E:case D:if(0===O){switch(w){case K:case M:case I:case J:Re+="\0";break;default:Re="\0"+Re+(C===U?"":"\0")}we=1}else switch(C){case D:if(z+7===R&&108===w)z=0;O=++y;break;case E:if(0==(O=--y))we=1,Re+="\0"}break;case K:case M:switch(w){case re:case B:case q:case W:case U:case ce:case K:case M:case I:case J:break;default:if(0===O)we=1,Re+="\0"}}if(Te+=Re,C!==M&&C!==K)$=C}}m=w,w=C,R++}if(je=Ve.length,me>0)if(0===je&&0===Xe.length&&0===a[0].length==false)if(t!==ie||1===a.length&&(ge>0?Ee:Ge)===a[0])je=a.join(",").length+2;if(je>0){if(f=0===ge&&t!==te?function(e){for(var a,r,s=0,t=e.length,i=Array(t);s<t;++s){for(var f=e[s].split(l),n="",o=0,h=0,u=0,d=0,b=f.length;o<b;++o){if(0===(h=(r=f[o]).length)&&b>1)continue;if(u=n.charCodeAt(n.length-1),d=r.charCodeAt(0),a="",0!==o)switch(u){case T:case ae:case _:case ee:case M:case D:break;default:a=" "}switch(d){case P:r=a+Ee;case ae:case _:case ee:case M:case E:case D:break;case G:r=a+r+Ee;break;case V:switch(2*r.charCodeAt(1)+3*r.charCodeAt(2)){case 530:if(Ce>0){r=a+r.substring(8,h-1);break}default:if(o<1||f[o-1].length<1)r=a+Ee+r}break;case U:a="";default:if(h>1&&r.indexOf(":")>0)r=a+r.replace(v,"$1"+Ee+"$2");else r=a+r+Ee}n+=r}i[s]=n.replace(c,"").trim()}return i}(a):a,ye>0)if(void 0!==(n=Pe(Fe,Ve,f,e,pe,be,je,t,i,t))&&0===(Ve=n).length)return Ye+Ve+Xe;if(Ve=f.join(",")+"{"+Ve+"}",Ae*ke!=0){if(2===Ae&&!Le(Ve,2))ke=0;switch(ke){case le:Ve=Ve.replace(k,":"+S+"$1")+Ve;break;case ne:Ve=Ve.replace(p,"::"+N+"input-$1")+Ve.replace(p,"::"+S+"$1")+Ve.replace(p,":"+F+"input-$1")+Ve}ke=0}}return Ye+Ve+Xe}function Ie(e,a,r){var c=a.trim().split(o),s=c,t=c.length,i=e.length;switch(i){case 0:case 1:for(var f=0,n=0===i?"":e[0]+" ";f<t;++f)s[f]=Je(n,s[f],r,i).trim();break;default:f=0;var l=0;for(s=[];f<t;++f)for(var h=0;h<i;++h)s[l++]=Je(e[h]+" ",c[f],r,i).trim()}return s}function Je(e,a,r,c){var s=a,t=s.charCodeAt(0);if(t<33)t=(s=s.trim()).charCodeAt(0);switch(t){case P:switch(ge+c){case 0:case 1:if(0===e.trim().length)break;default:return s.replace(h,"$1"+e.trim())}break;case V:switch(s.charCodeAt(1)){case 103:if(Ce>0&&ge>0)return s.replace(u,"$1").replace(h,"$1"+Ge);break;default:return e.trim()+s.replace(h,"$1"+e.trim())}default:if(r*ge>0&&s.indexOf("\f")>0)return s.replace(h,(e.charCodeAt(0)===V?"":"$1")+e.trim())}return e+s}function Ke(e,a,r,c){var l,o=0,h=e+";",u=2*a+3*r+4*c;if(944===u)return function(e){var a=e.length,r=e.indexOf(":",9)+1,c=e.substring(0,r).trim(),s=e.substring(r,a-1).trim();switch(e.charCodeAt(9)*Be){case 0:break;case Q:if(110!==e.charCodeAt(10))break;default:for(var t=s.split((s="",f)),i=0,r=0,a=t.length;i<a;r=0,++i){for(var l=t[i],o=l.split(n);l=o[r];){var h=l.charCodeAt(0);if(1===Be&&(h>L&&h<90||h>96&&h<123||h===R||h===Q&&l.charCodeAt(1)!==Q))switch(isNaN(parseFloat(l))+(-1!==l.indexOf("("))){case 1:switch(l){case"infinite":case"alternate":case"backwards":case"running":case"normal":case"forwards":case"both":case"none":case"linear":case"ease":case"ease-in":case"ease-out":case"ease-in-out":case"paused":case"reverse":case"alternate-reverse":case"inherit":case"initial":case"unset":case"step-start":case"step-end":break;default:l+=De}}o[r++]=l}s+=(0===i?"":",")+o.join(" ")}}if(s=c+s+";",1===Ae||2===Ae&&Le(s,1))return N+s+s;return s}(h);else if(0===Ae||2===Ae&&!Le(h,1))return h;switch(u){case 1015:return 97===h.charCodeAt(10)?N+h+h:h;case 951:return 116===h.charCodeAt(3)?N+h+h:h;case 963:return 110===h.charCodeAt(5)?N+h+h:h;case 1009:if(100!==h.charCodeAt(4))break;case 969:case 942:return N+h+h;case 978:return N+h+S+h+h;case 1019:case 983:return N+h+S+h+F+h+h;case 883:if(h.charCodeAt(8)===Q)return N+h+h;if(h.indexOf("image-set(",11)>0)return h.replace(z,"$1"+N+"$2")+h;return h;case 932:if(h.charCodeAt(4)===Q)switch(h.charCodeAt(5)){case 103:return N+"box-"+h.replace("-grow","")+N+h+F+h.replace("grow","positive")+h;case 115:return N+h+F+h.replace("shrink","negative")+h;case 98:return N+h+F+h.replace("basis","preferred-size")+h}return N+h+F+h+h;case 964:return N+h+F+"flex-"+h+h;case 1023:if(99!==h.charCodeAt(8))break;return l=h.substring(h.indexOf(":",15)).replace("flex-","").replace("space-between","justify"),N+"box-pack"+l+N+h+F+"flex-pack"+l+h;case 1005:return t.test(h)?h.replace(s,":"+N)+h.replace(s,":"+S)+h:h;case 1e3:switch(o=(l=h.substring(13).trim()).indexOf("-")+1,l.charCodeAt(0)+l.charCodeAt(o)){case 226:l=h.replace(m,"tb");break;case 232:l=h.replace(m,"tb-rl");break;case 220:l=h.replace(m,"lr");break;default:return h}return N+h+F+l+h;case 1017:if(-1===h.indexOf("sticky",9))return h;case 975:switch(o=(h=e).length-10,u=(l=(33===h.charCodeAt(o)?h.substring(0,o):h).substring(e.indexOf(":",7)+1).trim()).charCodeAt(0)+(0|l.charCodeAt(7))){case 203:if(l.charCodeAt(8)<111)break;case 115:h=h.replace(l,N+l)+";"+h;break;case 207:case 102:h=h.replace(l,N+(u>102?"inline-":"")+"box")+";"+h.replace(l,N+l)+";"+h.replace(l,F+l+"box")+";"+h}return h+";";case 938:if(h.charCodeAt(5)===Q)switch(h.charCodeAt(6)){case 105:return l=h.replace("-items",""),N+h+N+"box-"+l+F+"flex-"+l+h;case 115:return N+h+F+"flex-item-"+h.replace(y,"")+h;default:return N+h+F+"flex-line-pack"+h.replace("align-content","").replace(y,"")+h}break;case 973:case 989:if(h.charCodeAt(3)!==Q||122===h.charCodeAt(4))break;case 931:case 953:if(true===j.test(e))if(115===(l=e.substring(e.indexOf(":")+1)).charCodeAt(0))return Ke(e.replace("stretch","fill-available"),a,r,c).replace(":fill-available",":stretch");else return h.replace(l,N+l)+h.replace(l,S+l.replace("fill-",""))+h;break;case 962:if(h=N+h+(102===h.charCodeAt(5)?F+h:"")+h,r+c===211&&105===h.charCodeAt(13)&&h.indexOf("transform",10)>0)return h.substring(0,h.indexOf(";",27)+1).replace(i,"$1"+N+"$2")+h}return h}function Le(e,a){var r=e.indexOf(1===a?":":"{"),c=e.substring(0,3!==a?r:10),s=e.substring(r+1,e.length-1);return Oe(2!==a?c:c.replace(O,"$1"),s,a)}function Me(e,a){var r=Ke(a,a.charCodeAt(0),a.charCodeAt(1),a.charCodeAt(2));return r!==a+";"?r.replace($," or ($1)").substring(4):"("+a+")"}function Pe(e,a,r,c,s,t,i,f,n,l){for(var o,h=0,u=a;h<ye;++h)switch(o=$e[h].call(Te,e,u,r,c,s,t,i,f,n,l)){case void 0:case false:case true:case null:break;default:u=o}if(u!==a)return u}function Qe(e,a,r,c){for(var s=a+1;s<r;++s)switch(c.charCodeAt(s)){case Z:if(e===T)if(c.charCodeAt(s-1)===T&&a+2!==s)return s+1;break;case I:if(e===Z)return s+1}return s}function Re(e){for(var a in e){var r=e[a];switch(a){case"keyframe":Be=0|r;break;case"global":Ce=0|r;break;case"cascade":ge=0|r;break;case"compress":we=0|r;break;case"semicolon":ve=0|r;break;case"preserve":me=0|r;break;case"prefix":if(Oe=null,!r)Ae=0;else if("function"!=typeof r)Ae=1;else Ae=2,Oe=r}}return Re}function Te(a,r){if(void 0!==this&&this.constructor===Te)return e(a);var s=a,t=s.charCodeAt(0);if(t<33)t=(s=s.trim()).charCodeAt(0);if(Be>0)De=s.replace(d,t===G?"":"-");if(t=1,1===ge)Ge=s;else Ee=s;var i,f=[Ge];if(ye>0)if(void 0!==(i=Pe(ze,r,f,f,pe,be,0,0,0,0))&&"string"==typeof i)r=i;var n=He(xe,f,r,0,0);if(ye>0)if(void 0!==(i=Pe(je,n,f,f,pe,be,n.length,0,0,0))&&"string"!=typeof(n=i))t=0;return De="",Ge="",Ee="",ke=0,pe=1,be=1,we*t==0?n:n.replace(c,"").replace(g,"").replace(A,"$1").replace(C,"$1").replace(w," ")}if(Te.use=function e(a){switch(a){case void 0:case null:ye=$e.length=0;break;default:if("function"==typeof a)$e[ye++]=a;else if("object"==typeof a)for(var r=0,c=a.length;r<c;++r)e(a[r]);else qe=0|!!a}return e},Te.set=Re,void 0!==a)Re(a);return Te});

/***/ }),
/* 13 */
/***/ (function(module, exports) {

/*
Copyright (c) 2013 Dulin Marat

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
*/
function CssSelectorParser() {
  this.pseudos = {};
  this.attrEqualityMods = {};
  this.ruleNestingOperators = {};
  this.substitutesEnabled = false;
}

CssSelectorParser.prototype.registerSelectorPseudos = function(name) {
  for (var j = 0, len = arguments.length; j < len; j++) {
    name = arguments[j];
    this.pseudos[name] = 'selector';
  }
  return this;
};

CssSelectorParser.prototype.unregisterSelectorPseudos = function(name) {
  for (var j = 0, len = arguments.length; j < len; j++) {
    name = arguments[j];
    delete this.pseudos[name];
  }
  return this;
};

CssSelectorParser.prototype.registerNumericPseudos = function(name) {
    for (var j = 0, len = arguments.length; j < len; j++) {
        name = arguments[j];
        this.pseudos[name] = 'numeric';
    }
    return this;
};

CssSelectorParser.prototype.unregisterNumericPseudos = function(name) {
    for (var j = 0, len = arguments.length; j < len; j++) {
        name = arguments[j];
        delete this.pseudos[name];
    }
    return this;
};

CssSelectorParser.prototype.registerNestingOperators = function(operator) {
  for (var j = 0, len = arguments.length; j < len; j++) {
    operator = arguments[j];
    this.ruleNestingOperators[operator] = true;
  }
  return this;
};

CssSelectorParser.prototype.unregisterNestingOperators = function(operator) {
  for (var j = 0, len = arguments.length; j < len; j++) {
    operator = arguments[j];
    delete this.ruleNestingOperators[operator];
  }
  return this;
};

CssSelectorParser.prototype.registerAttrEqualityMods = function(mod) {
  for (var j = 0, len = arguments.length; j < len; j++) {
    mod = arguments[j];
    this.attrEqualityMods[mod] = true;
  }
  return this;
};

CssSelectorParser.prototype.unregisterAttrEqualityMods = function(mod) {
  for (var j = 0, len = arguments.length; j < len; j++) {
    mod = arguments[j];
    delete this.attrEqualityMods[mod];
  }
  return this;
};

CssSelectorParser.prototype.enableSubstitutes = function() {
  this.substitutesEnabled = true;
  return this;
};

CssSelectorParser.prototype.disableSubstitutes = function() {
  this.substitutesEnabled = false;
  return this;
};

function isIdentStart(c) {
  return (c >= 'a' && c <= 'z') || (c >= 'A' && c <= 'Z') || (c === '-') || (c === '_');
}

function isIdent(c) {
  return (c >= 'a' && c <= 'z') || (c >= 'A' && c <= 'Z') || (c >= '0' && c <= '9') || c === '-' || c === '_';
}

function isHex(c) {
  return (c >= 'a' && c <= 'f') || (c >= 'A' && c <= 'F') || (c >= '0' && c <= '9');
}

function isDecimal(c) {
  return c >= '0' && c <= '9';
}

function isAttrMatchOperator(chr) {
  return chr === '=' || chr === '^' || chr === '$' || chr === '*' || chr === '~';
}

var identSpecialChars = {
  '!': true,
  '"': true,
  '#': true,
  '$': true,
  '%': true,
  '&': true,
  '\'': true,
  '(': true,
  ')': true,
  '*': true,
  '+': true,
  ',': true,
  '.': true,
  '/': true,
  ';': true,
  '<': true,
  '=': true,
  '>': true,
  '?': true,
  '@': true,
  '[': true,
  '\\': true,
  ']': true,
  '^': true,
  '`': true,
  '{': true,
  '|': true,
  '}': true,
  '~': true
};

var strReplacementsRev = {
  '\n': '\\n',
  '\r': '\\r',
  '\t': '\\t',
  '\f': '\\f',
  '\v': '\\v'
};

var singleQuoteEscapeChars = {
  n: '\n',
  r: '\r',
  t: '\t',
  f: '\f',
  '\\': '\\',
  '\'': '\''
};

var doubleQuotesEscapeChars = {
  n: '\n',
  r: '\r',
  t: '\t',
  f: '\f',
  '\\': '\\',
  '"': '"'
};

function ParseContext(str, pos, pseudos, attrEqualityMods, ruleNestingOperators, substitutesEnabled) {
  var chr, getIdent, getStr, l, skipWhitespace;
  l = str.length;
  chr = null;
  getStr = function(quote, escapeTable) {
    var esc, hex, result;
    result = '';
    pos++;
    chr = str.charAt(pos);
    while (pos < l) {
      if (chr === quote) {
        pos++;
        return result;
      } else if (chr === '\\') {
        pos++;
        chr = str.charAt(pos);
        if (chr === quote) {
          result += quote;
        } else if (esc = escapeTable[chr]) {
          result += esc;
        } else if (isHex(chr)) {
          hex = chr;
          pos++;
          chr = str.charAt(pos);
          while (isHex(chr)) {
            hex += chr;
            pos++;
            chr = str.charAt(pos);
          }
          if (chr === ' ') {
            pos++;
            chr = str.charAt(pos);
          }
          result += String.fromCharCode(parseInt(hex, 16));
          continue;
        } else {
          result += chr;
        }
      } else {
        result += chr;
      }
      pos++;
      chr = str.charAt(pos);
    }
    return result;
  };
  getIdent = function() {
    var result = '';
    chr = str.charAt(pos);
    while (pos < l) {
      if (isIdent(chr)) {
        result += chr;
      } else if (chr === '\\') {
        pos++;
        if (pos >= l) {
          throw Error('Expected symbol but end of file reached.');
        }
        chr = str.charAt(pos);
        if (identSpecialChars[chr]) {
          result += chr;
        } else if (isHex(chr)) {
          var hex = chr;
          pos++;
          chr = str.charAt(pos);
          while (isHex(chr)) {
            hex += chr;
            pos++;
            chr = str.charAt(pos);
          }
          if (chr === ' ') {
            pos++;
            chr = str.charAt(pos);
          }
          result += String.fromCharCode(parseInt(hex, 16));
          continue;
        } else {
          result += chr;
        }
      } else {
        return result;
      }
      pos++;
      chr = str.charAt(pos);
    }
    return result;
  };
  skipWhitespace = function() {
    chr = str.charAt(pos);
    var result = false;
    while (chr === ' ' || chr === "\t" || chr === "\n" || chr === "\r" || chr === "\f") {
      result = true;
      pos++;
      chr = str.charAt(pos);
    }
    return result;
  };
  this.parse = function() {
    var res = this.parseSelector();
    if (pos < l) {
      throw Error('Rule expected but "' + str.charAt(pos) + '" found.');
    }
    return res;
  };
  this.parseSelector = function() {
    var res;
    var selector = res = this.parseSingleSelector();
    chr = str.charAt(pos);
    while (chr === ',') {
      pos++;
      skipWhitespace();
      if (res.type !== 'selectors') {
        res = {
          type: 'selectors',
          selectors: [selector]
        };
      }
      selector = this.parseSingleSelector();
      if (!selector) {
        throw Error('Rule expected after ",".');
      }
      res.selectors.push(selector);
    }
    return res;
  };

  this.parseSingleSelector = function() {
    skipWhitespace();
    var selector = {
      type: 'ruleSet'
    };
    var rule = this.parseRule();
    if (!rule) {
      return null;
    }
    var currentRule = selector;
    while (rule) {
      rule.type = 'rule';
      currentRule.rule = rule;
      currentRule = rule;
      skipWhitespace();
      chr = str.charAt(pos);
      if (pos >= l || chr === ',' || chr === ')') {
        break;
      }
      if (ruleNestingOperators[chr]) {
        var op = chr;
        if(op == '>' && str.charAt(pos) == '>' && str.charAt(pos + 1) == '>'){
          op = '>>>';
          pos = pos + 3;
        } else {
          pos++;
        }
        skipWhitespace();
        rule = this.parseRule();
        if (!rule) {
          throw Error('Rule expected after "' + op + '".');
        }
        rule.nestingOperator = op;
      } else {
        rule = this.parseRule();
        if (rule) {
          rule.nestingOperator = null;
        }
      }
    }
    return selector;
  };

  this.parseRule = function() {
    var rule = null;
    while (pos < l) {
      chr = str.charAt(pos);
      if (chr === '*') {
        pos++;
        (rule = rule || {}).tagName = '*';
      } else if (isIdentStart(chr) || chr === '\\') {
        (rule = rule || {}).tagName = getIdent();
      } else if (chr === '.') {
        pos++;
        rule = rule || {};
        (rule.classNames = rule.classNames || []).push(getIdent());
      } else if (chr === '#') {
        pos++;
        (rule = rule || {}).id = getIdent();
      } else if (chr === '[') {
        pos++;
        skipWhitespace();
        var attr = {
          name: getIdent()
        };
        skipWhitespace();
        if (chr === ']') {
          pos++;
        } else {
          var operator = '';
          if (attrEqualityMods[chr]) {
            operator = chr;
            pos++;
            chr = str.charAt(pos);
          }
          if (pos >= l) {
            throw Error('Expected "=" but end of file reached.');
          }
          if (chr !== '=') {
            throw Error('Expected "=" but "' + chr + '" found.');
          }
          attr.operator = operator + '=';
          pos++;
          skipWhitespace();
          var attrValue = '';
          attr.valueType = 'string';
          if (chr === '"') {
            attrValue = getStr('"', doubleQuotesEscapeChars);
          } else if (chr === '\'') {
            attrValue = getStr('\'', singleQuoteEscapeChars);
          } else if (substitutesEnabled && chr === '$') {
            pos++;
            attrValue = getIdent();
            attr.valueType = 'substitute';
          } else {
            while (pos < l) {
              if (chr === ']') {
                break;
              }
              attrValue += chr;
              pos++;
              chr = str.charAt(pos);
            }
            attrValue = attrValue.trim();
          }
          skipWhitespace();
          if (pos >= l) {
            throw Error('Expected "]" but end of file reached.');
          }
          if (chr !== ']') {
            throw Error('Expected "]" but "' + chr + '" found.');
          }
          pos++;
          attr.value = attrValue;
        }
        rule = rule || {};
        (rule.attrs = rule.attrs || []).push(attr);
      } else if (chr === ':') {
        pos++;
        var pseudoName = getIdent();
        var pseudo = {
          name: pseudoName
        };
        if (chr === '(') {
          pos++;
          var value = '';
          skipWhitespace();
          if (pseudos[pseudoName] === 'selector') {
            pseudo.valueType = 'selector';
            value = this.parseSelector();
          } else {
            pseudo.valueType = pseudos[pseudoName] || 'string';
            if (chr === '"') {
              value = getStr('"', doubleQuotesEscapeChars);
            } else if (chr === '\'') {
              value = getStr('\'', singleQuoteEscapeChars);
            } else if (substitutesEnabled && chr === '$') {
              pos++;
              value = getIdent();
              pseudo.valueType = 'substitute';
            } else {
              while (pos < l) {
                if (chr === ')') {
                  break;
                }
                value += chr;
                pos++;
                chr = str.charAt(pos);
              }
              value = value.trim();
            }
            skipWhitespace();
          }
          if (pos >= l) {
            throw Error('Expected ")" but end of file reached.');
          }
          if (chr !== ')') {
            throw Error('Expected ")" but "' + chr + '" found.');
          }
          pos++;
          pseudo.value = value;
        }
        rule = rule || {};
        (rule.pseudos = rule.pseudos || []).push(pseudo);
      } else {
        break;
      }
    }
    return rule;
  };
  return this;
}

CssSelectorParser.prototype.parse = function(str) {
  var context = new ParseContext(
      str,
      0,
      this.pseudos,
      this.attrEqualityMods,
      this.ruleNestingOperators,
      this.substitutesEnabled
  );
  return context.parse();
};

CssSelectorParser.prototype.escapeIdentifier = function(s) {
  var result = '';
  var i = 0;
  var len = s.length;
  while (i < len) {
    var chr = s.charAt(i);
    if (identSpecialChars[chr]) {
      result += '\\' + chr;
    } else {
      if (
          !(
              chr === '_' || chr === '-' ||
              (chr >= 'A' && chr <= 'Z') ||
              (chr >= 'a' && chr <= 'z') ||
              (i !== 0 && chr >= '0' && chr <= '9')
          )
      ) {
        var charCode = chr.charCodeAt(0);
        if ((charCode & 0xF800) === 0xD800) {
          var extraCharCode = s.charCodeAt(i++);
          if ((charCode & 0xFC00) !== 0xD800 || (extraCharCode & 0xFC00) !== 0xDC00) {
            throw Error('UCS-2(decode): illegal sequence');
          }
          charCode = ((charCode & 0x3FF) << 10) + (extraCharCode & 0x3FF) + 0x10000;
        }
        result += '\\' + charCode.toString(16) + ' ';
      } else {
        result += chr;
      }
    }
    i++;
  }
  return result;
};

CssSelectorParser.prototype.escapeStr = function(s) {
  var result = '';
  var i = 0;
  var len = s.length;
  var chr, replacement;
  while (i < len) {
    chr = s.charAt(i);
    if (chr === '"') {
      chr = '\\"';
    } else if (chr === '\\') {
      chr = '\\\\';
    } else if (replacement = strReplacementsRev[chr]) {
      chr = replacement;
    }
    result += chr;
    i++;
  }
  return "\"" + result + "\"";
};

CssSelectorParser.prototype.render = function(path) {
  return this._renderEntity(path).trim();
};

CssSelectorParser.prototype._renderEntity = function(entity) {
  var currentEntity, parts, res;
  res = '';
  switch (entity.type) {
    case 'ruleSet':
      currentEntity = entity.rule;
      parts = [];
      while (currentEntity) {
        if (currentEntity.nestingOperator) {
          parts.push(currentEntity.nestingOperator);
        }
        parts.push(this._renderEntity(currentEntity));
        currentEntity = currentEntity.rule;
      }
      res = parts.join(' ');
      break;
    case 'selectors':
      res = entity.selectors.map(this._renderEntity, this).join(', ');
      break;
    case 'rule':
      if (entity.tagName) {
        if (entity.tagName === '*') {
          res = '*';
        } else {
          res = this.escapeIdentifier(entity.tagName);
        }
      }
      if (entity.id) {
        res += "#" + this.escapeIdentifier(entity.id);
      }
      if (entity.classNames) {
        res += entity.classNames.map(function(cn) {
          return "." + (this.escapeIdentifier(cn));
        }, this).join('');
      }
      if (entity.attrs) {
        res += entity.attrs.map(function(attr) {
          if (attr.operator) {
            if (attr.valueType === 'substitute') {
              return "[" + this.escapeIdentifier(attr.name) + attr.operator + "$" + attr.value + "]";
            } else {
              return "[" + this.escapeIdentifier(attr.name) + attr.operator + this.escapeStr(attr.value) + "]";
            }
          } else {
            return "[" + this.escapeIdentifier(attr.name) + "]";
          }
        }, this).join('');
      }
      if (entity.pseudos) {
        res += entity.pseudos.map(function(pseudo) {
          if (pseudo.valueType) {
            if (pseudo.valueType === 'selector') {
              return ":" + this.escapeIdentifier(pseudo.name) + "(" + this._renderEntity(pseudo.value) + ")";
            } else if (pseudo.valueType === 'substitute') {
              return ":" + this.escapeIdentifier(pseudo.name) + "($" + pseudo.value + ")";
            } else if (pseudo.valueType === 'numeric') {
              return ":" + this.escapeIdentifier(pseudo.name) + "(" + pseudo.value + ")";
            } else {
              return ":" + this.escapeIdentifier(pseudo.name) + "(" + this.escapeIdentifier(pseudo.value) + ")";
            }
          } else {
            return ":" + this.escapeIdentifier(pseudo.name);
          }
        }, this).join('');
      }
      break;
    default:
      throw Error('Unknown entity type: "' + entity.type(+'".'));
  }
  return res;
};

var parser = new CssSelectorParser();
parser.registerSelectorPseudos('has','not','is','matches','any')
parser.registerNestingOperators('>>>','>', '+', '~')
parser.registerAttrEqualityMods('^', '$', '*', '~')
parser.enableSubstitutes()

module.exports = parser;

/***/ }),
/* 14 */
/***/ (function(module, exports, __webpack_require__) {

/* WEBPACK VAR INJECTION */(function(Buffer) {function iter$(a){ return a ? (a.toArray ? a.toArray() : a) : []; };


// externs;

var path = __webpack_require__(19);
var util = __webpack_require__(2);

var VLQ_SHIFT = 5;
var VLQ_CONTINUATION_BIT = 1 << VLQ_SHIFT;
var VLQ_VALUE_MASK = VLQ_CONTINUATION_BIT - 1;
var BASE64_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';

function SourceMap(source,options,file){
	this._source = source;
	this._options = options;
	this._sourcePath = file.sourcePath;
	this._sourceRoot = file.sourceRoot;
	this._targetPath = file.targetPath;
	
	this._maps = [];
	this._map = "";
	this._js = "";
};

exports.SourceMap = SourceMap; // export class 
SourceMap.prototype.result = function(v){ return this._result; }
SourceMap.prototype.setResult = function(v){ this._result = v; return this; };

SourceMap.prototype.source = function (){
	return this._source;
};

SourceMap.prototype.options = function (){
	return this._options;
};

SourceMap.prototype.sourceCode = function (){
	return this._source.source;
};

SourceMap.prototype.sourceName = function (){
	return path.basename(this._sourcePath);
};

SourceMap.prototype.targetName = function (){
	return path.basename(this._targetPath);
};

SourceMap.prototype.sourceFiles = function (){
	return [this.sourceName()];
};

SourceMap.prototype.parse = function (){
	// var matcher = /\/\*\%\$(\d*)\$\%/
	var self = this;
	var matcher = /\/\*\%([\w\|]*)?\$\*\//;
	var replacer = /^(.*?)\/\*\%([\w\|]*)\$\*\//;
	var prejs = self._source.js;
	var lines = self._source.js.split(/\n/g); 
	var verbose = self._options.debug;
	
	var sourceCode = self.sourceCode();
	var locmap = util.locationToLineColMap(sourceCode);
	var append = "";
	self._locs = [];
	self._maps = [];
	
	var pairs = [];
	var groups = {};
	var uniqueGroups = {};
	var match;
	
	
	
	
	
	var jsloc = 0;
	
	for (let i = 0, items = iter$(lines), len = items.length, line; i < len; i++) {
		// console.log 'parse line',line
		// could split on these?
		line = items[i];
		var col = 0;
		var caret = -1;
		
		self._maps[i] = [];
		while (line.match(matcher)){
			line = line.replace(replacer,function(m,pre,meta) {
				var grp;
				if (meta == '') { return pre };
				let pars = meta.split('|');
				let loc = parseInt(pars[0]);
				let gid = pars[1] && parseInt(pars[1]);
				
				var lc = locmap[loc];
				
				if (!lc) {
					// console.log "not found in locmap",loc,locmap:length
					return pre;
				};
				
				let srcline = lc[0] + 1;
				let srccol = lc[1] + 1;
				
				if (caret != pre.length) {
					caret = pre.length;
					var mapping = [[srcline,srccol],[i + 1,caret + 1]]; 
					self._maps[i].push(mapping);
				};
				
				let locpair = [jsloc + caret,loc];
				self._locs.push(locpair);
				
				if (gid) {
					if (grp = groups[gid]) {
						// groups[gid].push(locpair[0],locpair[1])
						grp[1] = locpair[0];
						grp[3] = locpair[1];
						let gstr = grp.join('|');
						if (uniqueGroups[gstr]) {
							groups[gid] = [];
						} else {
							uniqueGroups[gstr] = true;
						};
						
					} else {
						groups[gid] = [locpair[0],null,locpair[1],null];
					};
					
				};
				return pre;
			});
		};
		
		jsloc += line.length + 1;
		lines[i] = line;
	};
	
	self.source().js = lines.join('\n');
	self.source().locs = {
		map: locmap,
		generated: self._locs,
		spans: Object.values(groups)
	};
	
	if (verbose) {
		for (let i = 0, items = iter$(self.source().locs.spans), len = items.length, pair; i < len; i++) {
			pair = items[i];
			if (pair[1] != null) {
				let jsstr = self.source().js.slice(pair[0],pair[1]).split("\n");
				let imbastr = sourceCode.slice(pair[2],pair[3]).split("\n");
				pair.push(jsstr[0]);
				pair.push(imbastr[0]);
			};
		};
		
		console.log(self.source().locs.spans);
		let superMap = {
			0: '\u2080',
			1: '\u2081',
			2: '\u2082',
			3: '\u2083',
			4: '\u2084',
			5: '\u2085',
			6: '\u2086',
			7: '\u2087',
			8: '\u2088',
			9: '\u2089',
			'|': '\u208C'
		};
		let repSuper = function(m,str) {
			return ("[" + str + "]");
			let o = '';
			let l = str.length;
			let i = 0;
			while (i < l){
				o += superMap[str[i++]];
			};
			return '\u208D' + o + '\u208E';
		};
		
		self.source().js = self.source().js + '\n/*\n' + prejs.replace(/\/\*\%([\w\|]*)?\$\*\//g,repSuper) + '\n*/';
	};
	return self;
};

SourceMap.prototype.generate = function (){
	this.parse();
	
	var lastColumn = 1;
	var lastSourceLine = 1;
	var lastSourceColumn = 1;
	var buffer = "";
	
	for (let lineNumber = 0, items = iter$(this._maps), len = items.length, line; lineNumber < len; lineNumber++) {
		line = items[lineNumber];
		lastColumn = 1;
		
		for (let nr = 0, ary = iter$(line), len = ary.length, map; nr < len; nr++) {
			map = ary[nr];
			if (nr != 0) { buffer += ',' };
			var src = map[0];
			var dest = map[1];
			
			buffer += this.encodeVlq(dest[1] - lastColumn);
			lastColumn = dest[1];
			
			buffer += this.encodeVlq(0);
			
			
			buffer += this.encodeVlq(src[0] - lastSourceLine);
			lastSourceLine = src[0];
			
			buffer += this.encodeVlq(src[1] - lastSourceColumn);
			lastSourceColumn = src[1];
		};
		
		buffer += ";";
	};
	
	
	var rel = this._targetPath && path.relative(path.dirname(this._targetPath),this._sourcePath);
	
	var map = {
		version: 3,
		file: this.sourceName().replace(/\.imba/,'.js') || '',
		sourceRoot: this._sourceRoot || '',
		sources: [rel || this._sourcePath],
		sourcesContent: [this.sourceCode()],
		names: [],
		mappings: buffer,
		maps: this._maps
	};
	
	
	
	
	this._result = map;
	return this;
};

SourceMap.prototype.inlined = function (){
	var str = JSON.stringify(this._result);
	if (typeof btoa == 'function') {
		str = btoa(str);
	} else {
		str = new Buffer(str).toString("base64");
	};
	return ("\n/*# sourceMappingURL=data:application/json;base64," + str + "*/");
};


SourceMap.prototype.encodeVlq = function (value){
	var answer = '';
	
	var signBit = (value < 0) ? 1 : 0;
	var nextChunk;
	
	var valueToEncode = (Math.abs(value) << 1) + signBit;
	
	while (valueToEncode || !answer){
		nextChunk = valueToEncode & VLQ_VALUE_MASK;
		valueToEncode = valueToEncode >> VLQ_SHIFT;
		if (valueToEncode) {
			nextChunk |= VLQ_CONTINUATION_BIT;
		};
		
		answer += this.encodeBase64(nextChunk);
	};
	
	return answer;
};

SourceMap.prototype.toJSON = function (){
	return this._result;
};

SourceMap.prototype.encodeBase64 = function (value){
	return BASE64_CHARS[value]; 
};



/* WEBPACK VAR INJECTION */}.call(this, __webpack_require__(15).Buffer))

/***/ }),
/* 15 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/*!
 * The buffer module from node.js, for the browser.
 *
 * @author   Feross Aboukhadijeh <http://feross.org>
 * @license  MIT
 */
/* eslint-disable no-proto */



var base64 = __webpack_require__(16)
var ieee754 = __webpack_require__(17)
var isArray = __webpack_require__(18)

exports.Buffer = Buffer
exports.SlowBuffer = SlowBuffer
exports.INSPECT_MAX_BYTES = 50

/**
 * If `Buffer.TYPED_ARRAY_SUPPORT`:
 *   === true    Use Uint8Array implementation (fastest)
 *   === false   Use Object implementation (most compatible, even IE6)
 *
 * Browsers that support typed arrays are IE 10+, Firefox 4+, Chrome 7+, Safari 5.1+,
 * Opera 11.6+, iOS 4.2+.
 *
 * Due to various browser bugs, sometimes the Object implementation will be used even
 * when the browser supports typed arrays.
 *
 * Note:
 *
 *   - Firefox 4-29 lacks support for adding new properties to `Uint8Array` instances,
 *     See: https://bugzilla.mozilla.org/show_bug.cgi?id=695438.
 *
 *   - Chrome 9-10 is missing the `TypedArray.prototype.subarray` function.
 *
 *   - IE10 has a broken `TypedArray.prototype.subarray` function which returns arrays of
 *     incorrect length in some situations.

 * We detect these buggy browsers and set `Buffer.TYPED_ARRAY_SUPPORT` to `false` so they
 * get the Object implementation, which is slower but behaves correctly.
 */
Buffer.TYPED_ARRAY_SUPPORT = global.TYPED_ARRAY_SUPPORT !== undefined
  ? global.TYPED_ARRAY_SUPPORT
  : typedArraySupport()

/*
 * Export kMaxLength after typed array support is determined.
 */
exports.kMaxLength = kMaxLength()

function typedArraySupport () {
  try {
    var arr = new Uint8Array(1)
    arr.__proto__ = {__proto__: Uint8Array.prototype, foo: function () { return 42 }}
    return arr.foo() === 42 && // typed array instances can be augmented
        typeof arr.subarray === 'function' && // chrome 9-10 lack `subarray`
        arr.subarray(1, 1).byteLength === 0 // ie10 has broken `subarray`
  } catch (e) {
    return false
  }
}

function kMaxLength () {
  return Buffer.TYPED_ARRAY_SUPPORT
    ? 0x7fffffff
    : 0x3fffffff
}

function createBuffer (that, length) {
  if (kMaxLength() < length) {
    throw new RangeError('Invalid typed array length')
  }
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    // Return an augmented `Uint8Array` instance, for best performance
    that = new Uint8Array(length)
    that.__proto__ = Buffer.prototype
  } else {
    // Fallback: Return an object instance of the Buffer class
    if (that === null) {
      that = new Buffer(length)
    }
    that.length = length
  }

  return that
}

/**
 * The Buffer constructor returns instances of `Uint8Array` that have their
 * prototype changed to `Buffer.prototype`. Furthermore, `Buffer` is a subclass of
 * `Uint8Array`, so the returned instances will have all the node `Buffer` methods
 * and the `Uint8Array` methods. Square bracket notation works as expected -- it
 * returns a single octet.
 *
 * The `Uint8Array` prototype remains unmodified.
 */

function Buffer (arg, encodingOrOffset, length) {
  if (!Buffer.TYPED_ARRAY_SUPPORT && !(this instanceof Buffer)) {
    return new Buffer(arg, encodingOrOffset, length)
  }

  // Common case.
  if (typeof arg === 'number') {
    if (typeof encodingOrOffset === 'string') {
      throw new Error(
        'If encoding is specified then the first argument must be a string'
      )
    }
    return allocUnsafe(this, arg)
  }
  return from(this, arg, encodingOrOffset, length)
}

Buffer.poolSize = 8192 // not used by this implementation

// TODO: Legacy, not needed anymore. Remove in next major version.
Buffer._augment = function (arr) {
  arr.__proto__ = Buffer.prototype
  return arr
}

function from (that, value, encodingOrOffset, length) {
  if (typeof value === 'number') {
    throw new TypeError('"value" argument must not be a number')
  }

  if (typeof ArrayBuffer !== 'undefined' && value instanceof ArrayBuffer) {
    return fromArrayBuffer(that, value, encodingOrOffset, length)
  }

  if (typeof value === 'string') {
    return fromString(that, value, encodingOrOffset)
  }

  return fromObject(that, value)
}

/**
 * Functionally equivalent to Buffer(arg, encoding) but throws a TypeError
 * if value is a number.
 * Buffer.from(str[, encoding])
 * Buffer.from(array)
 * Buffer.from(buffer)
 * Buffer.from(arrayBuffer[, byteOffset[, length]])
 **/
Buffer.from = function (value, encodingOrOffset, length) {
  return from(null, value, encodingOrOffset, length)
}

if (Buffer.TYPED_ARRAY_SUPPORT) {
  Buffer.prototype.__proto__ = Uint8Array.prototype
  Buffer.__proto__ = Uint8Array
  if (typeof Symbol !== 'undefined' && Symbol.species &&
      Buffer[Symbol.species] === Buffer) {
    // Fix subarray() in ES2016. See: https://github.com/feross/buffer/pull/97
    Object.defineProperty(Buffer, Symbol.species, {
      value: null,
      configurable: true
    })
  }
}

function assertSize (size) {
  if (typeof size !== 'number') {
    throw new TypeError('"size" argument must be a number')
  } else if (size < 0) {
    throw new RangeError('"size" argument must not be negative')
  }
}

function alloc (that, size, fill, encoding) {
  assertSize(size)
  if (size <= 0) {
    return createBuffer(that, size)
  }
  if (fill !== undefined) {
    // Only pay attention to encoding if it's a string. This
    // prevents accidentally sending in a number that would
    // be interpretted as a start offset.
    return typeof encoding === 'string'
      ? createBuffer(that, size).fill(fill, encoding)
      : createBuffer(that, size).fill(fill)
  }
  return createBuffer(that, size)
}

/**
 * Creates a new filled Buffer instance.
 * alloc(size[, fill[, encoding]])
 **/
Buffer.alloc = function (size, fill, encoding) {
  return alloc(null, size, fill, encoding)
}

function allocUnsafe (that, size) {
  assertSize(size)
  that = createBuffer(that, size < 0 ? 0 : checked(size) | 0)
  if (!Buffer.TYPED_ARRAY_SUPPORT) {
    for (var i = 0; i < size; ++i) {
      that[i] = 0
    }
  }
  return that
}

/**
 * Equivalent to Buffer(num), by default creates a non-zero-filled Buffer instance.
 * */
Buffer.allocUnsafe = function (size) {
  return allocUnsafe(null, size)
}
/**
 * Equivalent to SlowBuffer(num), by default creates a non-zero-filled Buffer instance.
 */
Buffer.allocUnsafeSlow = function (size) {
  return allocUnsafe(null, size)
}

function fromString (that, string, encoding) {
  if (typeof encoding !== 'string' || encoding === '') {
    encoding = 'utf8'
  }

  if (!Buffer.isEncoding(encoding)) {
    throw new TypeError('"encoding" must be a valid string encoding')
  }

  var length = byteLength(string, encoding) | 0
  that = createBuffer(that, length)

  var actual = that.write(string, encoding)

  if (actual !== length) {
    // Writing a hex string, for example, that contains invalid characters will
    // cause everything after the first invalid character to be ignored. (e.g.
    // 'abxxcd' will be treated as 'ab')
    that = that.slice(0, actual)
  }

  return that
}

function fromArrayLike (that, array) {
  var length = array.length < 0 ? 0 : checked(array.length) | 0
  that = createBuffer(that, length)
  for (var i = 0; i < length; i += 1) {
    that[i] = array[i] & 255
  }
  return that
}

function fromArrayBuffer (that, array, byteOffset, length) {
  array.byteLength // this throws if `array` is not a valid ArrayBuffer

  if (byteOffset < 0 || array.byteLength < byteOffset) {
    throw new RangeError('\'offset\' is out of bounds')
  }

  if (array.byteLength < byteOffset + (length || 0)) {
    throw new RangeError('\'length\' is out of bounds')
  }

  if (byteOffset === undefined && length === undefined) {
    array = new Uint8Array(array)
  } else if (length === undefined) {
    array = new Uint8Array(array, byteOffset)
  } else {
    array = new Uint8Array(array, byteOffset, length)
  }

  if (Buffer.TYPED_ARRAY_SUPPORT) {
    // Return an augmented `Uint8Array` instance, for best performance
    that = array
    that.__proto__ = Buffer.prototype
  } else {
    // Fallback: Return an object instance of the Buffer class
    that = fromArrayLike(that, array)
  }
  return that
}

function fromObject (that, obj) {
  if (Buffer.isBuffer(obj)) {
    var len = checked(obj.length) | 0
    that = createBuffer(that, len)

    if (that.length === 0) {
      return that
    }

    obj.copy(that, 0, 0, len)
    return that
  }

  if (obj) {
    if ((typeof ArrayBuffer !== 'undefined' &&
        obj.buffer instanceof ArrayBuffer) || 'length' in obj) {
      if (typeof obj.length !== 'number' || isnan(obj.length)) {
        return createBuffer(that, 0)
      }
      return fromArrayLike(that, obj)
    }

    if (obj.type === 'Buffer' && isArray(obj.data)) {
      return fromArrayLike(that, obj.data)
    }
  }

  throw new TypeError('First argument must be a string, Buffer, ArrayBuffer, Array, or array-like object.')
}

function checked (length) {
  // Note: cannot use `length < kMaxLength()` here because that fails when
  // length is NaN (which is otherwise coerced to zero.)
  if (length >= kMaxLength()) {
    throw new RangeError('Attempt to allocate Buffer larger than maximum ' +
                         'size: 0x' + kMaxLength().toString(16) + ' bytes')
  }
  return length | 0
}

function SlowBuffer (length) {
  if (+length != length) { // eslint-disable-line eqeqeq
    length = 0
  }
  return Buffer.alloc(+length)
}

Buffer.isBuffer = function isBuffer (b) {
  return !!(b != null && b._isBuffer)
}

Buffer.compare = function compare (a, b) {
  if (!Buffer.isBuffer(a) || !Buffer.isBuffer(b)) {
    throw new TypeError('Arguments must be Buffers')
  }

  if (a === b) return 0

  var x = a.length
  var y = b.length

  for (var i = 0, len = Math.min(x, y); i < len; ++i) {
    if (a[i] !== b[i]) {
      x = a[i]
      y = b[i]
      break
    }
  }

  if (x < y) return -1
  if (y < x) return 1
  return 0
}

Buffer.isEncoding = function isEncoding (encoding) {
  switch (String(encoding).toLowerCase()) {
    case 'hex':
    case 'utf8':
    case 'utf-8':
    case 'ascii':
    case 'latin1':
    case 'binary':
    case 'base64':
    case 'ucs2':
    case 'ucs-2':
    case 'utf16le':
    case 'utf-16le':
      return true
    default:
      return false
  }
}

Buffer.concat = function concat (list, length) {
  if (!isArray(list)) {
    throw new TypeError('"list" argument must be an Array of Buffers')
  }

  if (list.length === 0) {
    return Buffer.alloc(0)
  }

  var i
  if (length === undefined) {
    length = 0
    for (i = 0; i < list.length; ++i) {
      length += list[i].length
    }
  }

  var buffer = Buffer.allocUnsafe(length)
  var pos = 0
  for (i = 0; i < list.length; ++i) {
    var buf = list[i]
    if (!Buffer.isBuffer(buf)) {
      throw new TypeError('"list" argument must be an Array of Buffers')
    }
    buf.copy(buffer, pos)
    pos += buf.length
  }
  return buffer
}

function byteLength (string, encoding) {
  if (Buffer.isBuffer(string)) {
    return string.length
  }
  if (typeof ArrayBuffer !== 'undefined' && typeof ArrayBuffer.isView === 'function' &&
      (ArrayBuffer.isView(string) || string instanceof ArrayBuffer)) {
    return string.byteLength
  }
  if (typeof string !== 'string') {
    string = '' + string
  }

  var len = string.length
  if (len === 0) return 0

  // Use a for loop to avoid recursion
  var loweredCase = false
  for (;;) {
    switch (encoding) {
      case 'ascii':
      case 'latin1':
      case 'binary':
        return len
      case 'utf8':
      case 'utf-8':
      case undefined:
        return utf8ToBytes(string).length
      case 'ucs2':
      case 'ucs-2':
      case 'utf16le':
      case 'utf-16le':
        return len * 2
      case 'hex':
        return len >>> 1
      case 'base64':
        return base64ToBytes(string).length
      default:
        if (loweredCase) return utf8ToBytes(string).length // assume utf8
        encoding = ('' + encoding).toLowerCase()
        loweredCase = true
    }
  }
}
Buffer.byteLength = byteLength

function slowToString (encoding, start, end) {
  var loweredCase = false

  // No need to verify that "this.length <= MAX_UINT32" since it's a read-only
  // property of a typed array.

  // This behaves neither like String nor Uint8Array in that we set start/end
  // to their upper/lower bounds if the value passed is out of range.
  // undefined is handled specially as per ECMA-262 6th Edition,
  // Section 13.3.3.7 Runtime Semantics: KeyedBindingInitialization.
  if (start === undefined || start < 0) {
    start = 0
  }
  // Return early if start > this.length. Done here to prevent potential uint32
  // coercion fail below.
  if (start > this.length) {
    return ''
  }

  if (end === undefined || end > this.length) {
    end = this.length
  }

  if (end <= 0) {
    return ''
  }

  // Force coersion to uint32. This will also coerce falsey/NaN values to 0.
  end >>>= 0
  start >>>= 0

  if (end <= start) {
    return ''
  }

  if (!encoding) encoding = 'utf8'

  while (true) {
    switch (encoding) {
      case 'hex':
        return hexSlice(this, start, end)

      case 'utf8':
      case 'utf-8':
        return utf8Slice(this, start, end)

      case 'ascii':
        return asciiSlice(this, start, end)

      case 'latin1':
      case 'binary':
        return latin1Slice(this, start, end)

      case 'base64':
        return base64Slice(this, start, end)

      case 'ucs2':
      case 'ucs-2':
      case 'utf16le':
      case 'utf-16le':
        return utf16leSlice(this, start, end)

      default:
        if (loweredCase) throw new TypeError('Unknown encoding: ' + encoding)
        encoding = (encoding + '').toLowerCase()
        loweredCase = true
    }
  }
}

// The property is used by `Buffer.isBuffer` and `is-buffer` (in Safari 5-7) to detect
// Buffer instances.
Buffer.prototype._isBuffer = true

function swap (b, n, m) {
  var i = b[n]
  b[n] = b[m]
  b[m] = i
}

Buffer.prototype.swap16 = function swap16 () {
  var len = this.length
  if (len % 2 !== 0) {
    throw new RangeError('Buffer size must be a multiple of 16-bits')
  }
  for (var i = 0; i < len; i += 2) {
    swap(this, i, i + 1)
  }
  return this
}

Buffer.prototype.swap32 = function swap32 () {
  var len = this.length
  if (len % 4 !== 0) {
    throw new RangeError('Buffer size must be a multiple of 32-bits')
  }
  for (var i = 0; i < len; i += 4) {
    swap(this, i, i + 3)
    swap(this, i + 1, i + 2)
  }
  return this
}

Buffer.prototype.swap64 = function swap64 () {
  var len = this.length
  if (len % 8 !== 0) {
    throw new RangeError('Buffer size must be a multiple of 64-bits')
  }
  for (var i = 0; i < len; i += 8) {
    swap(this, i, i + 7)
    swap(this, i + 1, i + 6)
    swap(this, i + 2, i + 5)
    swap(this, i + 3, i + 4)
  }
  return this
}

Buffer.prototype.toString = function toString () {
  var length = this.length | 0
  if (length === 0) return ''
  if (arguments.length === 0) return utf8Slice(this, 0, length)
  return slowToString.apply(this, arguments)
}

Buffer.prototype.equals = function equals (b) {
  if (!Buffer.isBuffer(b)) throw new TypeError('Argument must be a Buffer')
  if (this === b) return true
  return Buffer.compare(this, b) === 0
}

Buffer.prototype.inspect = function inspect () {
  var str = ''
  var max = exports.INSPECT_MAX_BYTES
  if (this.length > 0) {
    str = this.toString('hex', 0, max).match(/.{2}/g).join(' ')
    if (this.length > max) str += ' ... '
  }
  return '<Buffer ' + str + '>'
}

Buffer.prototype.compare = function compare (target, start, end, thisStart, thisEnd) {
  if (!Buffer.isBuffer(target)) {
    throw new TypeError('Argument must be a Buffer')
  }

  if (start === undefined) {
    start = 0
  }
  if (end === undefined) {
    end = target ? target.length : 0
  }
  if (thisStart === undefined) {
    thisStart = 0
  }
  if (thisEnd === undefined) {
    thisEnd = this.length
  }

  if (start < 0 || end > target.length || thisStart < 0 || thisEnd > this.length) {
    throw new RangeError('out of range index')
  }

  if (thisStart >= thisEnd && start >= end) {
    return 0
  }
  if (thisStart >= thisEnd) {
    return -1
  }
  if (start >= end) {
    return 1
  }

  start >>>= 0
  end >>>= 0
  thisStart >>>= 0
  thisEnd >>>= 0

  if (this === target) return 0

  var x = thisEnd - thisStart
  var y = end - start
  var len = Math.min(x, y)

  var thisCopy = this.slice(thisStart, thisEnd)
  var targetCopy = target.slice(start, end)

  for (var i = 0; i < len; ++i) {
    if (thisCopy[i] !== targetCopy[i]) {
      x = thisCopy[i]
      y = targetCopy[i]
      break
    }
  }

  if (x < y) return -1
  if (y < x) return 1
  return 0
}

// Finds either the first index of `val` in `buffer` at offset >= `byteOffset`,
// OR the last index of `val` in `buffer` at offset <= `byteOffset`.
//
// Arguments:
// - buffer - a Buffer to search
// - val - a string, Buffer, or number
// - byteOffset - an index into `buffer`; will be clamped to an int32
// - encoding - an optional encoding, relevant is val is a string
// - dir - true for indexOf, false for lastIndexOf
function bidirectionalIndexOf (buffer, val, byteOffset, encoding, dir) {
  // Empty buffer means no match
  if (buffer.length === 0) return -1

  // Normalize byteOffset
  if (typeof byteOffset === 'string') {
    encoding = byteOffset
    byteOffset = 0
  } else if (byteOffset > 0x7fffffff) {
    byteOffset = 0x7fffffff
  } else if (byteOffset < -0x80000000) {
    byteOffset = -0x80000000
  }
  byteOffset = +byteOffset  // Coerce to Number.
  if (isNaN(byteOffset)) {
    // byteOffset: it it's undefined, null, NaN, "foo", etc, search whole buffer
    byteOffset = dir ? 0 : (buffer.length - 1)
  }

  // Normalize byteOffset: negative offsets start from the end of the buffer
  if (byteOffset < 0) byteOffset = buffer.length + byteOffset
  if (byteOffset >= buffer.length) {
    if (dir) return -1
    else byteOffset = buffer.length - 1
  } else if (byteOffset < 0) {
    if (dir) byteOffset = 0
    else return -1
  }

  // Normalize val
  if (typeof val === 'string') {
    val = Buffer.from(val, encoding)
  }

  // Finally, search either indexOf (if dir is true) or lastIndexOf
  if (Buffer.isBuffer(val)) {
    // Special case: looking for empty string/buffer always fails
    if (val.length === 0) {
      return -1
    }
    return arrayIndexOf(buffer, val, byteOffset, encoding, dir)
  } else if (typeof val === 'number') {
    val = val & 0xFF // Search for a byte value [0-255]
    if (Buffer.TYPED_ARRAY_SUPPORT &&
        typeof Uint8Array.prototype.indexOf === 'function') {
      if (dir) {
        return Uint8Array.prototype.indexOf.call(buffer, val, byteOffset)
      } else {
        return Uint8Array.prototype.lastIndexOf.call(buffer, val, byteOffset)
      }
    }
    return arrayIndexOf(buffer, [ val ], byteOffset, encoding, dir)
  }

  throw new TypeError('val must be string, number or Buffer')
}

function arrayIndexOf (arr, val, byteOffset, encoding, dir) {
  var indexSize = 1
  var arrLength = arr.length
  var valLength = val.length

  if (encoding !== undefined) {
    encoding = String(encoding).toLowerCase()
    if (encoding === 'ucs2' || encoding === 'ucs-2' ||
        encoding === 'utf16le' || encoding === 'utf-16le') {
      if (arr.length < 2 || val.length < 2) {
        return -1
      }
      indexSize = 2
      arrLength /= 2
      valLength /= 2
      byteOffset /= 2
    }
  }

  function read (buf, i) {
    if (indexSize === 1) {
      return buf[i]
    } else {
      return buf.readUInt16BE(i * indexSize)
    }
  }

  var i
  if (dir) {
    var foundIndex = -1
    for (i = byteOffset; i < arrLength; i++) {
      if (read(arr, i) === read(val, foundIndex === -1 ? 0 : i - foundIndex)) {
        if (foundIndex === -1) foundIndex = i
        if (i - foundIndex + 1 === valLength) return foundIndex * indexSize
      } else {
        if (foundIndex !== -1) i -= i - foundIndex
        foundIndex = -1
      }
    }
  } else {
    if (byteOffset + valLength > arrLength) byteOffset = arrLength - valLength
    for (i = byteOffset; i >= 0; i--) {
      var found = true
      for (var j = 0; j < valLength; j++) {
        if (read(arr, i + j) !== read(val, j)) {
          found = false
          break
        }
      }
      if (found) return i
    }
  }

  return -1
}

Buffer.prototype.includes = function includes (val, byteOffset, encoding) {
  return this.indexOf(val, byteOffset, encoding) !== -1
}

Buffer.prototype.indexOf = function indexOf (val, byteOffset, encoding) {
  return bidirectionalIndexOf(this, val, byteOffset, encoding, true)
}

Buffer.prototype.lastIndexOf = function lastIndexOf (val, byteOffset, encoding) {
  return bidirectionalIndexOf(this, val, byteOffset, encoding, false)
}

function hexWrite (buf, string, offset, length) {
  offset = Number(offset) || 0
  var remaining = buf.length - offset
  if (!length) {
    length = remaining
  } else {
    length = Number(length)
    if (length > remaining) {
      length = remaining
    }
  }

  // must be an even number of digits
  var strLen = string.length
  if (strLen % 2 !== 0) throw new TypeError('Invalid hex string')

  if (length > strLen / 2) {
    length = strLen / 2
  }
  for (var i = 0; i < length; ++i) {
    var parsed = parseInt(string.substr(i * 2, 2), 16)
    if (isNaN(parsed)) return i
    buf[offset + i] = parsed
  }
  return i
}

function utf8Write (buf, string, offset, length) {
  return blitBuffer(utf8ToBytes(string, buf.length - offset), buf, offset, length)
}

function asciiWrite (buf, string, offset, length) {
  return blitBuffer(asciiToBytes(string), buf, offset, length)
}

function latin1Write (buf, string, offset, length) {
  return asciiWrite(buf, string, offset, length)
}

function base64Write (buf, string, offset, length) {
  return blitBuffer(base64ToBytes(string), buf, offset, length)
}

function ucs2Write (buf, string, offset, length) {
  return blitBuffer(utf16leToBytes(string, buf.length - offset), buf, offset, length)
}

Buffer.prototype.write = function write (string, offset, length, encoding) {
  // Buffer#write(string)
  if (offset === undefined) {
    encoding = 'utf8'
    length = this.length
    offset = 0
  // Buffer#write(string, encoding)
  } else if (length === undefined && typeof offset === 'string') {
    encoding = offset
    length = this.length
    offset = 0
  // Buffer#write(string, offset[, length][, encoding])
  } else if (isFinite(offset)) {
    offset = offset | 0
    if (isFinite(length)) {
      length = length | 0
      if (encoding === undefined) encoding = 'utf8'
    } else {
      encoding = length
      length = undefined
    }
  // legacy write(string, encoding, offset, length) - remove in v0.13
  } else {
    throw new Error(
      'Buffer.write(string, encoding, offset[, length]) is no longer supported'
    )
  }

  var remaining = this.length - offset
  if (length === undefined || length > remaining) length = remaining

  if ((string.length > 0 && (length < 0 || offset < 0)) || offset > this.length) {
    throw new RangeError('Attempt to write outside buffer bounds')
  }

  if (!encoding) encoding = 'utf8'

  var loweredCase = false
  for (;;) {
    switch (encoding) {
      case 'hex':
        return hexWrite(this, string, offset, length)

      case 'utf8':
      case 'utf-8':
        return utf8Write(this, string, offset, length)

      case 'ascii':
        return asciiWrite(this, string, offset, length)

      case 'latin1':
      case 'binary':
        return latin1Write(this, string, offset, length)

      case 'base64':
        // Warning: maxLength not taken into account in base64Write
        return base64Write(this, string, offset, length)

      case 'ucs2':
      case 'ucs-2':
      case 'utf16le':
      case 'utf-16le':
        return ucs2Write(this, string, offset, length)

      default:
        if (loweredCase) throw new TypeError('Unknown encoding: ' + encoding)
        encoding = ('' + encoding).toLowerCase()
        loweredCase = true
    }
  }
}

Buffer.prototype.toJSON = function toJSON () {
  return {
    type: 'Buffer',
    data: Array.prototype.slice.call(this._arr || this, 0)
  }
}

function base64Slice (buf, start, end) {
  if (start === 0 && end === buf.length) {
    return base64.fromByteArray(buf)
  } else {
    return base64.fromByteArray(buf.slice(start, end))
  }
}

function utf8Slice (buf, start, end) {
  end = Math.min(buf.length, end)
  var res = []

  var i = start
  while (i < end) {
    var firstByte = buf[i]
    var codePoint = null
    var bytesPerSequence = (firstByte > 0xEF) ? 4
      : (firstByte > 0xDF) ? 3
      : (firstByte > 0xBF) ? 2
      : 1

    if (i + bytesPerSequence <= end) {
      var secondByte, thirdByte, fourthByte, tempCodePoint

      switch (bytesPerSequence) {
        case 1:
          if (firstByte < 0x80) {
            codePoint = firstByte
          }
          break
        case 2:
          secondByte = buf[i + 1]
          if ((secondByte & 0xC0) === 0x80) {
            tempCodePoint = (firstByte & 0x1F) << 0x6 | (secondByte & 0x3F)
            if (tempCodePoint > 0x7F) {
              codePoint = tempCodePoint
            }
          }
          break
        case 3:
          secondByte = buf[i + 1]
          thirdByte = buf[i + 2]
          if ((secondByte & 0xC0) === 0x80 && (thirdByte & 0xC0) === 0x80) {
            tempCodePoint = (firstByte & 0xF) << 0xC | (secondByte & 0x3F) << 0x6 | (thirdByte & 0x3F)
            if (tempCodePoint > 0x7FF && (tempCodePoint < 0xD800 || tempCodePoint > 0xDFFF)) {
              codePoint = tempCodePoint
            }
          }
          break
        case 4:
          secondByte = buf[i + 1]
          thirdByte = buf[i + 2]
          fourthByte = buf[i + 3]
          if ((secondByte & 0xC0) === 0x80 && (thirdByte & 0xC0) === 0x80 && (fourthByte & 0xC0) === 0x80) {
            tempCodePoint = (firstByte & 0xF) << 0x12 | (secondByte & 0x3F) << 0xC | (thirdByte & 0x3F) << 0x6 | (fourthByte & 0x3F)
            if (tempCodePoint > 0xFFFF && tempCodePoint < 0x110000) {
              codePoint = tempCodePoint
            }
          }
      }
    }

    if (codePoint === null) {
      // we did not generate a valid codePoint so insert a
      // replacement char (U+FFFD) and advance only 1 byte
      codePoint = 0xFFFD
      bytesPerSequence = 1
    } else if (codePoint > 0xFFFF) {
      // encode to utf16 (surrogate pair dance)
      codePoint -= 0x10000
      res.push(codePoint >>> 10 & 0x3FF | 0xD800)
      codePoint = 0xDC00 | codePoint & 0x3FF
    }

    res.push(codePoint)
    i += bytesPerSequence
  }

  return decodeCodePointsArray(res)
}

// Based on http://stackoverflow.com/a/22747272/680742, the browser with
// the lowest limit is Chrome, with 0x10000 args.
// We go 1 magnitude less, for safety
var MAX_ARGUMENTS_LENGTH = 0x1000

function decodeCodePointsArray (codePoints) {
  var len = codePoints.length
  if (len <= MAX_ARGUMENTS_LENGTH) {
    return String.fromCharCode.apply(String, codePoints) // avoid extra slice()
  }

  // Decode in chunks to avoid "call stack size exceeded".
  var res = ''
  var i = 0
  while (i < len) {
    res += String.fromCharCode.apply(
      String,
      codePoints.slice(i, i += MAX_ARGUMENTS_LENGTH)
    )
  }
  return res
}

function asciiSlice (buf, start, end) {
  var ret = ''
  end = Math.min(buf.length, end)

  for (var i = start; i < end; ++i) {
    ret += String.fromCharCode(buf[i] & 0x7F)
  }
  return ret
}

function latin1Slice (buf, start, end) {
  var ret = ''
  end = Math.min(buf.length, end)

  for (var i = start; i < end; ++i) {
    ret += String.fromCharCode(buf[i])
  }
  return ret
}

function hexSlice (buf, start, end) {
  var len = buf.length

  if (!start || start < 0) start = 0
  if (!end || end < 0 || end > len) end = len

  var out = ''
  for (var i = start; i < end; ++i) {
    out += toHex(buf[i])
  }
  return out
}

function utf16leSlice (buf, start, end) {
  var bytes = buf.slice(start, end)
  var res = ''
  for (var i = 0; i < bytes.length; i += 2) {
    res += String.fromCharCode(bytes[i] + bytes[i + 1] * 256)
  }
  return res
}

Buffer.prototype.slice = function slice (start, end) {
  var len = this.length
  start = ~~start
  end = end === undefined ? len : ~~end

  if (start < 0) {
    start += len
    if (start < 0) start = 0
  } else if (start > len) {
    start = len
  }

  if (end < 0) {
    end += len
    if (end < 0) end = 0
  } else if (end > len) {
    end = len
  }

  if (end < start) end = start

  var newBuf
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    newBuf = this.subarray(start, end)
    newBuf.__proto__ = Buffer.prototype
  } else {
    var sliceLen = end - start
    newBuf = new Buffer(sliceLen, undefined)
    for (var i = 0; i < sliceLen; ++i) {
      newBuf[i] = this[i + start]
    }
  }

  return newBuf
}

/*
 * Need to make sure that buffer isn't trying to write out of bounds.
 */
function checkOffset (offset, ext, length) {
  if ((offset % 1) !== 0 || offset < 0) throw new RangeError('offset is not uint')
  if (offset + ext > length) throw new RangeError('Trying to access beyond buffer length')
}

Buffer.prototype.readUIntLE = function readUIntLE (offset, byteLength, noAssert) {
  offset = offset | 0
  byteLength = byteLength | 0
  if (!noAssert) checkOffset(offset, byteLength, this.length)

  var val = this[offset]
  var mul = 1
  var i = 0
  while (++i < byteLength && (mul *= 0x100)) {
    val += this[offset + i] * mul
  }

  return val
}

Buffer.prototype.readUIntBE = function readUIntBE (offset, byteLength, noAssert) {
  offset = offset | 0
  byteLength = byteLength | 0
  if (!noAssert) {
    checkOffset(offset, byteLength, this.length)
  }

  var val = this[offset + --byteLength]
  var mul = 1
  while (byteLength > 0 && (mul *= 0x100)) {
    val += this[offset + --byteLength] * mul
  }

  return val
}

Buffer.prototype.readUInt8 = function readUInt8 (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 1, this.length)
  return this[offset]
}

Buffer.prototype.readUInt16LE = function readUInt16LE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 2, this.length)
  return this[offset] | (this[offset + 1] << 8)
}

Buffer.prototype.readUInt16BE = function readUInt16BE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 2, this.length)
  return (this[offset] << 8) | this[offset + 1]
}

Buffer.prototype.readUInt32LE = function readUInt32LE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 4, this.length)

  return ((this[offset]) |
      (this[offset + 1] << 8) |
      (this[offset + 2] << 16)) +
      (this[offset + 3] * 0x1000000)
}

Buffer.prototype.readUInt32BE = function readUInt32BE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 4, this.length)

  return (this[offset] * 0x1000000) +
    ((this[offset + 1] << 16) |
    (this[offset + 2] << 8) |
    this[offset + 3])
}

Buffer.prototype.readIntLE = function readIntLE (offset, byteLength, noAssert) {
  offset = offset | 0
  byteLength = byteLength | 0
  if (!noAssert) checkOffset(offset, byteLength, this.length)

  var val = this[offset]
  var mul = 1
  var i = 0
  while (++i < byteLength && (mul *= 0x100)) {
    val += this[offset + i] * mul
  }
  mul *= 0x80

  if (val >= mul) val -= Math.pow(2, 8 * byteLength)

  return val
}

Buffer.prototype.readIntBE = function readIntBE (offset, byteLength, noAssert) {
  offset = offset | 0
  byteLength = byteLength | 0
  if (!noAssert) checkOffset(offset, byteLength, this.length)

  var i = byteLength
  var mul = 1
  var val = this[offset + --i]
  while (i > 0 && (mul *= 0x100)) {
    val += this[offset + --i] * mul
  }
  mul *= 0x80

  if (val >= mul) val -= Math.pow(2, 8 * byteLength)

  return val
}

Buffer.prototype.readInt8 = function readInt8 (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 1, this.length)
  if (!(this[offset] & 0x80)) return (this[offset])
  return ((0xff - this[offset] + 1) * -1)
}

Buffer.prototype.readInt16LE = function readInt16LE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 2, this.length)
  var val = this[offset] | (this[offset + 1] << 8)
  return (val & 0x8000) ? val | 0xFFFF0000 : val
}

Buffer.prototype.readInt16BE = function readInt16BE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 2, this.length)
  var val = this[offset + 1] | (this[offset] << 8)
  return (val & 0x8000) ? val | 0xFFFF0000 : val
}

Buffer.prototype.readInt32LE = function readInt32LE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 4, this.length)

  return (this[offset]) |
    (this[offset + 1] << 8) |
    (this[offset + 2] << 16) |
    (this[offset + 3] << 24)
}

Buffer.prototype.readInt32BE = function readInt32BE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 4, this.length)

  return (this[offset] << 24) |
    (this[offset + 1] << 16) |
    (this[offset + 2] << 8) |
    (this[offset + 3])
}

Buffer.prototype.readFloatLE = function readFloatLE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 4, this.length)
  return ieee754.read(this, offset, true, 23, 4)
}

Buffer.prototype.readFloatBE = function readFloatBE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 4, this.length)
  return ieee754.read(this, offset, false, 23, 4)
}

Buffer.prototype.readDoubleLE = function readDoubleLE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 8, this.length)
  return ieee754.read(this, offset, true, 52, 8)
}

Buffer.prototype.readDoubleBE = function readDoubleBE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 8, this.length)
  return ieee754.read(this, offset, false, 52, 8)
}

function checkInt (buf, value, offset, ext, max, min) {
  if (!Buffer.isBuffer(buf)) throw new TypeError('"buffer" argument must be a Buffer instance')
  if (value > max || value < min) throw new RangeError('"value" argument is out of bounds')
  if (offset + ext > buf.length) throw new RangeError('Index out of range')
}

Buffer.prototype.writeUIntLE = function writeUIntLE (value, offset, byteLength, noAssert) {
  value = +value
  offset = offset | 0
  byteLength = byteLength | 0
  if (!noAssert) {
    var maxBytes = Math.pow(2, 8 * byteLength) - 1
    checkInt(this, value, offset, byteLength, maxBytes, 0)
  }

  var mul = 1
  var i = 0
  this[offset] = value & 0xFF
  while (++i < byteLength && (mul *= 0x100)) {
    this[offset + i] = (value / mul) & 0xFF
  }

  return offset + byteLength
}

Buffer.prototype.writeUIntBE = function writeUIntBE (value, offset, byteLength, noAssert) {
  value = +value
  offset = offset | 0
  byteLength = byteLength | 0
  if (!noAssert) {
    var maxBytes = Math.pow(2, 8 * byteLength) - 1
    checkInt(this, value, offset, byteLength, maxBytes, 0)
  }

  var i = byteLength - 1
  var mul = 1
  this[offset + i] = value & 0xFF
  while (--i >= 0 && (mul *= 0x100)) {
    this[offset + i] = (value / mul) & 0xFF
  }

  return offset + byteLength
}

Buffer.prototype.writeUInt8 = function writeUInt8 (value, offset, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) checkInt(this, value, offset, 1, 0xff, 0)
  if (!Buffer.TYPED_ARRAY_SUPPORT) value = Math.floor(value)
  this[offset] = (value & 0xff)
  return offset + 1
}

function objectWriteUInt16 (buf, value, offset, littleEndian) {
  if (value < 0) value = 0xffff + value + 1
  for (var i = 0, j = Math.min(buf.length - offset, 2); i < j; ++i) {
    buf[offset + i] = (value & (0xff << (8 * (littleEndian ? i : 1 - i)))) >>>
      (littleEndian ? i : 1 - i) * 8
  }
}

Buffer.prototype.writeUInt16LE = function writeUInt16LE (value, offset, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) checkInt(this, value, offset, 2, 0xffff, 0)
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset] = (value & 0xff)
    this[offset + 1] = (value >>> 8)
  } else {
    objectWriteUInt16(this, value, offset, true)
  }
  return offset + 2
}

Buffer.prototype.writeUInt16BE = function writeUInt16BE (value, offset, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) checkInt(this, value, offset, 2, 0xffff, 0)
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset] = (value >>> 8)
    this[offset + 1] = (value & 0xff)
  } else {
    objectWriteUInt16(this, value, offset, false)
  }
  return offset + 2
}

function objectWriteUInt32 (buf, value, offset, littleEndian) {
  if (value < 0) value = 0xffffffff + value + 1
  for (var i = 0, j = Math.min(buf.length - offset, 4); i < j; ++i) {
    buf[offset + i] = (value >>> (littleEndian ? i : 3 - i) * 8) & 0xff
  }
}

Buffer.prototype.writeUInt32LE = function writeUInt32LE (value, offset, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) checkInt(this, value, offset, 4, 0xffffffff, 0)
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset + 3] = (value >>> 24)
    this[offset + 2] = (value >>> 16)
    this[offset + 1] = (value >>> 8)
    this[offset] = (value & 0xff)
  } else {
    objectWriteUInt32(this, value, offset, true)
  }
  return offset + 4
}

Buffer.prototype.writeUInt32BE = function writeUInt32BE (value, offset, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) checkInt(this, value, offset, 4, 0xffffffff, 0)
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset] = (value >>> 24)
    this[offset + 1] = (value >>> 16)
    this[offset + 2] = (value >>> 8)
    this[offset + 3] = (value & 0xff)
  } else {
    objectWriteUInt32(this, value, offset, false)
  }
  return offset + 4
}

Buffer.prototype.writeIntLE = function writeIntLE (value, offset, byteLength, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) {
    var limit = Math.pow(2, 8 * byteLength - 1)

    checkInt(this, value, offset, byteLength, limit - 1, -limit)
  }

  var i = 0
  var mul = 1
  var sub = 0
  this[offset] = value & 0xFF
  while (++i < byteLength && (mul *= 0x100)) {
    if (value < 0 && sub === 0 && this[offset + i - 1] !== 0) {
      sub = 1
    }
    this[offset + i] = ((value / mul) >> 0) - sub & 0xFF
  }

  return offset + byteLength
}

Buffer.prototype.writeIntBE = function writeIntBE (value, offset, byteLength, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) {
    var limit = Math.pow(2, 8 * byteLength - 1)

    checkInt(this, value, offset, byteLength, limit - 1, -limit)
  }

  var i = byteLength - 1
  var mul = 1
  var sub = 0
  this[offset + i] = value & 0xFF
  while (--i >= 0 && (mul *= 0x100)) {
    if (value < 0 && sub === 0 && this[offset + i + 1] !== 0) {
      sub = 1
    }
    this[offset + i] = ((value / mul) >> 0) - sub & 0xFF
  }

  return offset + byteLength
}

Buffer.prototype.writeInt8 = function writeInt8 (value, offset, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) checkInt(this, value, offset, 1, 0x7f, -0x80)
  if (!Buffer.TYPED_ARRAY_SUPPORT) value = Math.floor(value)
  if (value < 0) value = 0xff + value + 1
  this[offset] = (value & 0xff)
  return offset + 1
}

Buffer.prototype.writeInt16LE = function writeInt16LE (value, offset, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) checkInt(this, value, offset, 2, 0x7fff, -0x8000)
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset] = (value & 0xff)
    this[offset + 1] = (value >>> 8)
  } else {
    objectWriteUInt16(this, value, offset, true)
  }
  return offset + 2
}

Buffer.prototype.writeInt16BE = function writeInt16BE (value, offset, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) checkInt(this, value, offset, 2, 0x7fff, -0x8000)
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset] = (value >>> 8)
    this[offset + 1] = (value & 0xff)
  } else {
    objectWriteUInt16(this, value, offset, false)
  }
  return offset + 2
}

Buffer.prototype.writeInt32LE = function writeInt32LE (value, offset, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) checkInt(this, value, offset, 4, 0x7fffffff, -0x80000000)
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset] = (value & 0xff)
    this[offset + 1] = (value >>> 8)
    this[offset + 2] = (value >>> 16)
    this[offset + 3] = (value >>> 24)
  } else {
    objectWriteUInt32(this, value, offset, true)
  }
  return offset + 4
}

Buffer.prototype.writeInt32BE = function writeInt32BE (value, offset, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) checkInt(this, value, offset, 4, 0x7fffffff, -0x80000000)
  if (value < 0) value = 0xffffffff + value + 1
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset] = (value >>> 24)
    this[offset + 1] = (value >>> 16)
    this[offset + 2] = (value >>> 8)
    this[offset + 3] = (value & 0xff)
  } else {
    objectWriteUInt32(this, value, offset, false)
  }
  return offset + 4
}

function checkIEEE754 (buf, value, offset, ext, max, min) {
  if (offset + ext > buf.length) throw new RangeError('Index out of range')
  if (offset < 0) throw new RangeError('Index out of range')
}

function writeFloat (buf, value, offset, littleEndian, noAssert) {
  if (!noAssert) {
    checkIEEE754(buf, value, offset, 4, 3.4028234663852886e+38, -3.4028234663852886e+38)
  }
  ieee754.write(buf, value, offset, littleEndian, 23, 4)
  return offset + 4
}

Buffer.prototype.writeFloatLE = function writeFloatLE (value, offset, noAssert) {
  return writeFloat(this, value, offset, true, noAssert)
}

Buffer.prototype.writeFloatBE = function writeFloatBE (value, offset, noAssert) {
  return writeFloat(this, value, offset, false, noAssert)
}

function writeDouble (buf, value, offset, littleEndian, noAssert) {
  if (!noAssert) {
    checkIEEE754(buf, value, offset, 8, 1.7976931348623157E+308, -1.7976931348623157E+308)
  }
  ieee754.write(buf, value, offset, littleEndian, 52, 8)
  return offset + 8
}

Buffer.prototype.writeDoubleLE = function writeDoubleLE (value, offset, noAssert) {
  return writeDouble(this, value, offset, true, noAssert)
}

Buffer.prototype.writeDoubleBE = function writeDoubleBE (value, offset, noAssert) {
  return writeDouble(this, value, offset, false, noAssert)
}

// copy(targetBuffer, targetStart=0, sourceStart=0, sourceEnd=buffer.length)
Buffer.prototype.copy = function copy (target, targetStart, start, end) {
  if (!start) start = 0
  if (!end && end !== 0) end = this.length
  if (targetStart >= target.length) targetStart = target.length
  if (!targetStart) targetStart = 0
  if (end > 0 && end < start) end = start

  // Copy 0 bytes; we're done
  if (end === start) return 0
  if (target.length === 0 || this.length === 0) return 0

  // Fatal error conditions
  if (targetStart < 0) {
    throw new RangeError('targetStart out of bounds')
  }
  if (start < 0 || start >= this.length) throw new RangeError('sourceStart out of bounds')
  if (end < 0) throw new RangeError('sourceEnd out of bounds')

  // Are we oob?
  if (end > this.length) end = this.length
  if (target.length - targetStart < end - start) {
    end = target.length - targetStart + start
  }

  var len = end - start
  var i

  if (this === target && start < targetStart && targetStart < end) {
    // descending copy from end
    for (i = len - 1; i >= 0; --i) {
      target[i + targetStart] = this[i + start]
    }
  } else if (len < 1000 || !Buffer.TYPED_ARRAY_SUPPORT) {
    // ascending copy from start
    for (i = 0; i < len; ++i) {
      target[i + targetStart] = this[i + start]
    }
  } else {
    Uint8Array.prototype.set.call(
      target,
      this.subarray(start, start + len),
      targetStart
    )
  }

  return len
}

// Usage:
//    buffer.fill(number[, offset[, end]])
//    buffer.fill(buffer[, offset[, end]])
//    buffer.fill(string[, offset[, end]][, encoding])
Buffer.prototype.fill = function fill (val, start, end, encoding) {
  // Handle string cases:
  if (typeof val === 'string') {
    if (typeof start === 'string') {
      encoding = start
      start = 0
      end = this.length
    } else if (typeof end === 'string') {
      encoding = end
      end = this.length
    }
    if (val.length === 1) {
      var code = val.charCodeAt(0)
      if (code < 256) {
        val = code
      }
    }
    if (encoding !== undefined && typeof encoding !== 'string') {
      throw new TypeError('encoding must be a string')
    }
    if (typeof encoding === 'string' && !Buffer.isEncoding(encoding)) {
      throw new TypeError('Unknown encoding: ' + encoding)
    }
  } else if (typeof val === 'number') {
    val = val & 255
  }

  // Invalid ranges are not set to a default, so can range check early.
  if (start < 0 || this.length < start || this.length < end) {
    throw new RangeError('Out of range index')
  }

  if (end <= start) {
    return this
  }

  start = start >>> 0
  end = end === undefined ? this.length : end >>> 0

  if (!val) val = 0

  var i
  if (typeof val === 'number') {
    for (i = start; i < end; ++i) {
      this[i] = val
    }
  } else {
    var bytes = Buffer.isBuffer(val)
      ? val
      : utf8ToBytes(new Buffer(val, encoding).toString())
    var len = bytes.length
    for (i = 0; i < end - start; ++i) {
      this[i + start] = bytes[i % len]
    }
  }

  return this
}

// HELPER FUNCTIONS
// ================

var INVALID_BASE64_RE = /[^+\/0-9A-Za-z-_]/g

function base64clean (str) {
  // Node strips out invalid characters like \n and \t from the string, base64-js does not
  str = stringtrim(str).replace(INVALID_BASE64_RE, '')
  // Node converts strings with length < 2 to ''
  if (str.length < 2) return ''
  // Node allows for non-padded base64 strings (missing trailing ===), base64-js does not
  while (str.length % 4 !== 0) {
    str = str + '='
  }
  return str
}

function stringtrim (str) {
  if (str.trim) return str.trim()
  return str.replace(/^\s+|\s+$/g, '')
}

function toHex (n) {
  if (n < 16) return '0' + n.toString(16)
  return n.toString(16)
}

function utf8ToBytes (string, units) {
  units = units || Infinity
  var codePoint
  var length = string.length
  var leadSurrogate = null
  var bytes = []

  for (var i = 0; i < length; ++i) {
    codePoint = string.charCodeAt(i)

    // is surrogate component
    if (codePoint > 0xD7FF && codePoint < 0xE000) {
      // last char was a lead
      if (!leadSurrogate) {
        // no lead yet
        if (codePoint > 0xDBFF) {
          // unexpected trail
          if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
          continue
        } else if (i + 1 === length) {
          // unpaired lead
          if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
          continue
        }

        // valid lead
        leadSurrogate = codePoint

        continue
      }

      // 2 leads in a row
      if (codePoint < 0xDC00) {
        if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
        leadSurrogate = codePoint
        continue
      }

      // valid surrogate pair
      codePoint = (leadSurrogate - 0xD800 << 10 | codePoint - 0xDC00) + 0x10000
    } else if (leadSurrogate) {
      // valid bmp char, but last char was a lead
      if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
    }

    leadSurrogate = null

    // encode utf8
    if (codePoint < 0x80) {
      if ((units -= 1) < 0) break
      bytes.push(codePoint)
    } else if (codePoint < 0x800) {
      if ((units -= 2) < 0) break
      bytes.push(
        codePoint >> 0x6 | 0xC0,
        codePoint & 0x3F | 0x80
      )
    } else if (codePoint < 0x10000) {
      if ((units -= 3) < 0) break
      bytes.push(
        codePoint >> 0xC | 0xE0,
        codePoint >> 0x6 & 0x3F | 0x80,
        codePoint & 0x3F | 0x80
      )
    } else if (codePoint < 0x110000) {
      if ((units -= 4) < 0) break
      bytes.push(
        codePoint >> 0x12 | 0xF0,
        codePoint >> 0xC & 0x3F | 0x80,
        codePoint >> 0x6 & 0x3F | 0x80,
        codePoint & 0x3F | 0x80
      )
    } else {
      throw new Error('Invalid code point')
    }
  }

  return bytes
}

function asciiToBytes (str) {
  var byteArray = []
  for (var i = 0; i < str.length; ++i) {
    // Node's code seems to be doing this and not & 0x7F..
    byteArray.push(str.charCodeAt(i) & 0xFF)
  }
  return byteArray
}

function utf16leToBytes (str, units) {
  var c, hi, lo
  var byteArray = []
  for (var i = 0; i < str.length; ++i) {
    if ((units -= 2) < 0) break

    c = str.charCodeAt(i)
    hi = c >> 8
    lo = c % 256
    byteArray.push(lo)
    byteArray.push(hi)
  }

  return byteArray
}

function base64ToBytes (str) {
  return base64.toByteArray(base64clean(str))
}

function blitBuffer (src, dst, offset, length) {
  for (var i = 0; i < length; ++i) {
    if ((i + offset >= dst.length) || (i >= src.length)) break
    dst[i + offset] = src[i]
  }
  return i
}

function isnan (val) {
  return val !== val // eslint-disable-line no-self-compare
}


/***/ }),
/* 16 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


exports.byteLength = byteLength
exports.toByteArray = toByteArray
exports.fromByteArray = fromByteArray

var lookup = []
var revLookup = []
var Arr = typeof Uint8Array !== 'undefined' ? Uint8Array : Array

var code = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/'
for (var i = 0, len = code.length; i < len; ++i) {
  lookup[i] = code[i]
  revLookup[code.charCodeAt(i)] = i
}

// Support decoding URL-safe base64 strings, as Node.js does.
// See: https://en.wikipedia.org/wiki/Base64#URL_applications
revLookup['-'.charCodeAt(0)] = 62
revLookup['_'.charCodeAt(0)] = 63

function getLens (b64) {
  var len = b64.length

  if (len % 4 > 0) {
    throw new Error('Invalid string. Length must be a multiple of 4')
  }

  // Trim off extra bytes after placeholder bytes are found
  // See: https://github.com/beatgammit/base64-js/issues/42
  var validLen = b64.indexOf('=')
  if (validLen === -1) validLen = len

  var placeHoldersLen = validLen === len
    ? 0
    : 4 - (validLen % 4)

  return [validLen, placeHoldersLen]
}

// base64 is 4/3 + up to two characters of the original data
function byteLength (b64) {
  var lens = getLens(b64)
  var validLen = lens[0]
  var placeHoldersLen = lens[1]
  return ((validLen + placeHoldersLen) * 3 / 4) - placeHoldersLen
}

function _byteLength (b64, validLen, placeHoldersLen) {
  return ((validLen + placeHoldersLen) * 3 / 4) - placeHoldersLen
}

function toByteArray (b64) {
  var tmp
  var lens = getLens(b64)
  var validLen = lens[0]
  var placeHoldersLen = lens[1]

  var arr = new Arr(_byteLength(b64, validLen, placeHoldersLen))

  var curByte = 0

  // if there are placeholders, only get up to the last complete 4 chars
  var len = placeHoldersLen > 0
    ? validLen - 4
    : validLen

  var i
  for (i = 0; i < len; i += 4) {
    tmp =
      (revLookup[b64.charCodeAt(i)] << 18) |
      (revLookup[b64.charCodeAt(i + 1)] << 12) |
      (revLookup[b64.charCodeAt(i + 2)] << 6) |
      revLookup[b64.charCodeAt(i + 3)]
    arr[curByte++] = (tmp >> 16) & 0xFF
    arr[curByte++] = (tmp >> 8) & 0xFF
    arr[curByte++] = tmp & 0xFF
  }

  if (placeHoldersLen === 2) {
    tmp =
      (revLookup[b64.charCodeAt(i)] << 2) |
      (revLookup[b64.charCodeAt(i + 1)] >> 4)
    arr[curByte++] = tmp & 0xFF
  }

  if (placeHoldersLen === 1) {
    tmp =
      (revLookup[b64.charCodeAt(i)] << 10) |
      (revLookup[b64.charCodeAt(i + 1)] << 4) |
      (revLookup[b64.charCodeAt(i + 2)] >> 2)
    arr[curByte++] = (tmp >> 8) & 0xFF
    arr[curByte++] = tmp & 0xFF
  }

  return arr
}

function tripletToBase64 (num) {
  return lookup[num >> 18 & 0x3F] +
    lookup[num >> 12 & 0x3F] +
    lookup[num >> 6 & 0x3F] +
    lookup[num & 0x3F]
}

function encodeChunk (uint8, start, end) {
  var tmp
  var output = []
  for (var i = start; i < end; i += 3) {
    tmp =
      ((uint8[i] << 16) & 0xFF0000) +
      ((uint8[i + 1] << 8) & 0xFF00) +
      (uint8[i + 2] & 0xFF)
    output.push(tripletToBase64(tmp))
  }
  return output.join('')
}

function fromByteArray (uint8) {
  var tmp
  var len = uint8.length
  var extraBytes = len % 3 // if we have 1 byte left, pad 2 bytes
  var parts = []
  var maxChunkLength = 16383 // must be multiple of 3

  // go through the array every three bytes, we'll deal with trailing stuff later
  for (var i = 0, len2 = len - extraBytes; i < len2; i += maxChunkLength) {
    parts.push(encodeChunk(
      uint8, i, (i + maxChunkLength) > len2 ? len2 : (i + maxChunkLength)
    ))
  }

  // pad the end with zeros, but make sure to not forget the extra bytes
  if (extraBytes === 1) {
    tmp = uint8[len - 1]
    parts.push(
      lookup[tmp >> 2] +
      lookup[(tmp << 4) & 0x3F] +
      '=='
    )
  } else if (extraBytes === 2) {
    tmp = (uint8[len - 2] << 8) + uint8[len - 1]
    parts.push(
      lookup[tmp >> 10] +
      lookup[(tmp >> 4) & 0x3F] +
      lookup[(tmp << 2) & 0x3F] +
      '='
    )
  }

  return parts.join('')
}


/***/ }),
/* 17 */
/***/ (function(module, exports) {

exports.read = function (buffer, offset, isLE, mLen, nBytes) {
  var e, m
  var eLen = (nBytes * 8) - mLen - 1
  var eMax = (1 << eLen) - 1
  var eBias = eMax >> 1
  var nBits = -7
  var i = isLE ? (nBytes - 1) : 0
  var d = isLE ? -1 : 1
  var s = buffer[offset + i]

  i += d

  e = s & ((1 << (-nBits)) - 1)
  s >>= (-nBits)
  nBits += eLen
  for (; nBits > 0; e = (e * 256) + buffer[offset + i], i += d, nBits -= 8) {}

  m = e & ((1 << (-nBits)) - 1)
  e >>= (-nBits)
  nBits += mLen
  for (; nBits > 0; m = (m * 256) + buffer[offset + i], i += d, nBits -= 8) {}

  if (e === 0) {
    e = 1 - eBias
  } else if (e === eMax) {
    return m ? NaN : ((s ? -1 : 1) * Infinity)
  } else {
    m = m + Math.pow(2, mLen)
    e = e - eBias
  }
  return (s ? -1 : 1) * m * Math.pow(2, e - mLen)
}

exports.write = function (buffer, value, offset, isLE, mLen, nBytes) {
  var e, m, c
  var eLen = (nBytes * 8) - mLen - 1
  var eMax = (1 << eLen) - 1
  var eBias = eMax >> 1
  var rt = (mLen === 23 ? Math.pow(2, -24) - Math.pow(2, -77) : 0)
  var i = isLE ? 0 : (nBytes - 1)
  var d = isLE ? 1 : -1
  var s = value < 0 || (value === 0 && 1 / value < 0) ? 1 : 0

  value = Math.abs(value)

  if (isNaN(value) || value === Infinity) {
    m = isNaN(value) ? 1 : 0
    e = eMax
  } else {
    e = Math.floor(Math.log(value) / Math.LN2)
    if (value * (c = Math.pow(2, -e)) < 1) {
      e--
      c *= 2
    }
    if (e + eBias >= 1) {
      value += rt / c
    } else {
      value += rt * Math.pow(2, 1 - eBias)
    }
    if (value * c >= 2) {
      e++
      c /= 2
    }

    if (e + eBias >= eMax) {
      m = 0
      e = eMax
    } else if (e + eBias >= 1) {
      m = ((value * c) - 1) * Math.pow(2, mLen)
      e = e + eBias
    } else {
      m = value * Math.pow(2, eBias - 1) * Math.pow(2, mLen)
      e = 0
    }
  }

  for (; mLen >= 8; buffer[offset + i] = m & 0xff, i += d, m /= 256, mLen -= 8) {}

  e = (e << mLen) | m
  eLen += mLen
  for (; eLen > 0; buffer[offset + i] = e & 0xff, i += d, e /= 256, eLen -= 8) {}

  buffer[offset + i - d] |= s * 128
}


/***/ }),
/* 18 */
/***/ (function(module, exports) {

var toString = {}.toString;

module.exports = Array.isArray || function (arr) {
  return toString.call(arr) == '[object Array]';
};


/***/ }),
/* 19 */
/***/ (function(module, exports) {

// .dirname, .basename, and .extname methods are extracted from Node.js v8.11.1,
// backported and transplited with Babel, with backwards-compat fixes

// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

// resolves . and .. elements in a path array with directory names there
// must be no slashes, empty elements, or device names (c:\) in the array
// (so also no leading and trailing slashes - it does not distinguish
// relative and absolute paths)
function normalizeArray(parts, allowAboveRoot) {
  // if the path tries to go above the root, `up` ends up > 0
  var up = 0;
  for (var i = parts.length - 1; i >= 0; i--) {
    var last = parts[i];
    if (last === '.') {
      parts.splice(i, 1);
    } else if (last === '..') {
      parts.splice(i, 1);
      up++;
    } else if (up) {
      parts.splice(i, 1);
      up--;
    }
  }

  // if the path is allowed to go above the root, restore leading ..s
  if (allowAboveRoot) {
    for (; up--; up) {
      parts.unshift('..');
    }
  }

  return parts;
}

// path.resolve([from ...], to)
// posix version
exports.resolve = function() {
  var resolvedPath = '',
      resolvedAbsolute = false;

  for (var i = arguments.length - 1; i >= -1 && !resolvedAbsolute; i--) {
    var path = (i >= 0) ? arguments[i] : process.cwd();

    // Skip empty and invalid entries
    if (typeof path !== 'string') {
      throw new TypeError('Arguments to path.resolve must be strings');
    } else if (!path) {
      continue;
    }

    resolvedPath = path + '/' + resolvedPath;
    resolvedAbsolute = path.charAt(0) === '/';
  }

  // At this point the path should be resolved to a full absolute path, but
  // handle relative paths to be safe (might happen when process.cwd() fails)

  // Normalize the path
  resolvedPath = normalizeArray(filter(resolvedPath.split('/'), function(p) {
    return !!p;
  }), !resolvedAbsolute).join('/');

  return ((resolvedAbsolute ? '/' : '') + resolvedPath) || '.';
};

// path.normalize(path)
// posix version
exports.normalize = function(path) {
  var isAbsolute = exports.isAbsolute(path),
      trailingSlash = substr(path, -1) === '/';

  // Normalize the path
  path = normalizeArray(filter(path.split('/'), function(p) {
    return !!p;
  }), !isAbsolute).join('/');

  if (!path && !isAbsolute) {
    path = '.';
  }
  if (path && trailingSlash) {
    path += '/';
  }

  return (isAbsolute ? '/' : '') + path;
};

// posix version
exports.isAbsolute = function(path) {
  return path.charAt(0) === '/';
};

// posix version
exports.join = function() {
  var paths = Array.prototype.slice.call(arguments, 0);
  return exports.normalize(filter(paths, function(p, index) {
    if (typeof p !== 'string') {
      throw new TypeError('Arguments to path.join must be strings');
    }
    return p;
  }).join('/'));
};


// path.relative(from, to)
// posix version
exports.relative = function(from, to) {
  from = exports.resolve(from).substr(1);
  to = exports.resolve(to).substr(1);

  function trim(arr) {
    var start = 0;
    for (; start < arr.length; start++) {
      if (arr[start] !== '') break;
    }

    var end = arr.length - 1;
    for (; end >= 0; end--) {
      if (arr[end] !== '') break;
    }

    if (start > end) return [];
    return arr.slice(start, end - start + 1);
  }

  var fromParts = trim(from.split('/'));
  var toParts = trim(to.split('/'));

  var length = Math.min(fromParts.length, toParts.length);
  var samePartsLength = length;
  for (var i = 0; i < length; i++) {
    if (fromParts[i] !== toParts[i]) {
      samePartsLength = i;
      break;
    }
  }

  var outputParts = [];
  for (var i = samePartsLength; i < fromParts.length; i++) {
    outputParts.push('..');
  }

  outputParts = outputParts.concat(toParts.slice(samePartsLength));

  return outputParts.join('/');
};

exports.sep = '/';
exports.delimiter = ':';

exports.dirname = function (path) {
  if (typeof path !== 'string') path = path + '';
  if (path.length === 0) return '.';
  var code = path.charCodeAt(0);
  var hasRoot = code === 47 /*/*/;
  var end = -1;
  var matchedSlash = true;
  for (var i = path.length - 1; i >= 1; --i) {
    code = path.charCodeAt(i);
    if (code === 47 /*/*/) {
        if (!matchedSlash) {
          end = i;
          break;
        }
      } else {
      // We saw the first non-path separator
      matchedSlash = false;
    }
  }

  if (end === -1) return hasRoot ? '/' : '.';
  if (hasRoot && end === 1) {
    // return '//';
    // Backwards-compat fix:
    return '/';
  }
  return path.slice(0, end);
};

function basename(path) {
  if (typeof path !== 'string') path = path + '';

  var start = 0;
  var end = -1;
  var matchedSlash = true;
  var i;

  for (i = path.length - 1; i >= 0; --i) {
    if (path.charCodeAt(i) === 47 /*/*/) {
        // If we reached a path separator that was not part of a set of path
        // separators at the end of the string, stop now
        if (!matchedSlash) {
          start = i + 1;
          break;
        }
      } else if (end === -1) {
      // We saw the first non-path separator, mark this as the end of our
      // path component
      matchedSlash = false;
      end = i + 1;
    }
  }

  if (end === -1) return '';
  return path.slice(start, end);
}

// Uses a mixed approach for backwards-compatibility, as ext behavior changed
// in new Node.js versions, so only basename() above is backported here
exports.basename = function (path, ext) {
  var f = basename(path);
  if (ext && f.substr(-1 * ext.length) === ext) {
    f = f.substr(0, f.length - ext.length);
  }
  return f;
};

exports.extname = function (path) {
  if (typeof path !== 'string') path = path + '';
  var startDot = -1;
  var startPart = 0;
  var end = -1;
  var matchedSlash = true;
  // Track the state of characters (if any) we see before our first dot and
  // after any path separator we find
  var preDotState = 0;
  for (var i = path.length - 1; i >= 0; --i) {
    var code = path.charCodeAt(i);
    if (code === 47 /*/*/) {
        // If we reached a path separator that was not part of a set of path
        // separators at the end of the string, stop now
        if (!matchedSlash) {
          startPart = i + 1;
          break;
        }
        continue;
      }
    if (end === -1) {
      // We saw the first non-path separator, mark this as the end of our
      // extension
      matchedSlash = false;
      end = i + 1;
    }
    if (code === 46 /*.*/) {
        // If this is our first dot, mark it as the start of our extension
        if (startDot === -1)
          startDot = i;
        else if (preDotState !== 1)
          preDotState = 1;
    } else if (startDot !== -1) {
      // We saw a non-dot and non-path separator before our dot, so we should
      // have a good chance at having a non-empty extension
      preDotState = -1;
    }
  }

  if (startDot === -1 || end === -1 ||
      // We saw a non-dot character immediately before the dot
      preDotState === 0 ||
      // The (right-most) trimmed path component is exactly '..'
      preDotState === 1 && startDot === end - 1 && startDot === startPart + 1) {
    return '';
  }
  return path.slice(startDot, end);
};

function filter (xs, f) {
    if (xs.filter) return xs.filter(f);
    var res = [];
    for (var i = 0; i < xs.length; i++) {
        if (f(xs[i], i, xs)) res.push(xs[i]);
    }
    return res;
}

// String.prototype.substr - negative index don't work in IE8
var substr = 'ab'.substr(-1) === 'b'
    ? function (str, start, len) { return str.substr(start, len) }
    : function (str, start, len) {
        if (start < 0) start = str.length + start;
        return str.substr(start, len);
    }
;


/***/ }),
/* 20 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "aliases", function() { return aliases; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "Color", function() { return Color; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "Length", function() { return Length; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "StyleTheme", function() { return StyleTheme; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "TransformMixin", function() { return TransformMixin; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "StyleRule", function() { return StyleRule; });
/* harmony import */ var _theme_imba__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(22);
function iter$(a){ return a ? (a.toIterable ? a.toIterable() : a) : []; };

var conv = __webpack_require__(21);




const extensions = {};
var ThemeInstance = null;




const aliases = {
	
	// padding
		p: 'padding',
	pl: 'padding-left',
	pr: 'padding-right',
	pt: 'padding-top',
	pb: 'padding-bottom',
	px: 'padding-x',
	py: 'padding-y',
	
	
	m: 'margin',
	ml: 'margin-left',
	mr: 'margin-right',
	mt: 'margin-top',
	mb: 'margin-bottom',
	mx: 'margin-x',
	my: 'margin-y',
	
	w: 'width',
	h: 'height',
	
	
	ai: 'align-items',
	as: 'align-self',
	ac: 'align-content',
	jc: 'justify-content',
	fd: 'flex-direction',
	fg: 'flex-grow',
	fs: 'flex-shrink',
	fb: 'flex-basis',
	
	
	d: 'display',
	l: 'display',
	layout: 'display',
	t: 'text',
	f: 'text',
	c: 'color',
	
	
	
	b: 'border',
	bt: 'border-top',
	br: 'border-right',
	bb: 'border-bottom',
	bl: 'border-left',
	
	bx: 'border-x',
	by: 'border-y',
	bc: 'border-color',
	bs: 'border-style',
	bw: 'border-width',
	
	btw: 'border-top-width',
	brw: 'border-right-width',
	bbw: 'border-bottom-width',
	blw: 'border-left-width',
	bxw: 'border-x-width',
	byw: 'border-y-width',
	
	btc: 'border-top-color',
	brc: 'border-right-color',
	bbc: 'border-bottom-color',
	blc: 'border-left-color',
	bxc: 'border-x-color',
	byc: 'border-y-color',
	
	bts: 'border-top-style',
	brs: 'border-right-style',
	bbs: 'border-bottom-style',
	bls: 'border-left-style',
	bxs: 'border-x-style',
	bys: 'border-y-style',
	
	
	bg: 'background',
	bgp: 'background-position',
	bgr: 'background-repeat',
	bgi: 'background-image',
	bga: 'background-attachment',
	
	
	round: 'border-radius',
	radius: 'border-radius',
	
	shadow: 'box-shadow',
	
	
	td: 'text-decoration',
	tt: 'text-transform',
	ta: 'text-align',
	
	va: 'vertical-align',
	ls: 'letter-spacing',
	
	prefix: 'content.before',
	suffix: 'content.after'
};

class Color {
	
	
	constructor(name,h,s,l,a = '100%'){
		
		this.name = name;
		this.h = h;
		this.s = s;
		this.l = l;
		this.a = a;
		
	}
	alpha(v){
		
		return new Color(this.name,this.h,this.s,this.l,v);
	}
	
	toString(){
		
		return ("hsla(" + this.h.toFixed(2) + "," + this.s.toFixed(2) + "%," + this.l.toFixed(2) + "%," + this.a + ")");
	}
};

class Length {
	
	
	static parse(value){
		
		let m = String(value).match(/^(\-?[\d\.]+)(\w+|%)?$/);
		if (!m) { return null };
		return new this(parseFloat(m[1]),m[2]);
	}
	
	constructor(number,unit){
		
		this.number = number;
		this.unit = unit;
	}
	
	valueOf(){
		
		return this.number;
		
	}
	toString(){
		
		return this.number + (this.unit || '');
		
	}
	clone(num = this.number,u = this.unit){
		
		return new Length(num,u);
		
	}
	rounded(){
		
		return this.clone(Math.round(this.number));
	}
};


var palette = {
	current: {string: "currentColor"},
	transparent: new Color('transparent',0,0,100,'0%'),
	black: new Color('black',0,0,0,'100%'),
	white: new Color('white',0,0,100,'100%')
};

for (let $i = 0, $keys = Object.keys(_theme_imba__WEBPACK_IMPORTED_MODULE_0__["colors"]), $l = $keys.length, name, variations; $i < $l; $i++){
	name = $keys[$i];variations = _theme_imba__WEBPACK_IMPORTED_MODULE_0__["colors"][name];
	for (let $j = 0, keys1 = Object.keys(variations), $l = keys1.length, subname, raw; $j < $l; $j++){
		subname = keys1[$j];raw = variations[subname];
		let path = name + subname;
		
		
		if (palette[raw]) {
			
			palette[path] = palette[raw];
		} else {
			
			let rgb = conv.hex.rgb(raw);
			let [h,s,l] = conv.rgb.hsl(rgb);
			let color = palette[path] = new Color(path,h,s,l,'100%');
			
		};
		if (subname.match(/^\d00$/)) {
			
			palette[name + subname[0]] = palette[path];
		};
	};
};

var colorRegex = new RegExp('\\b(' + Object.keys(palette).join('|') + ')\\b');

class StyleTheme {
	
	
	static instance(){
		
		return ThemeInstance || (ThemeInstance = new this);
		
	}
	constructor(){
		
		this.options = _theme_imba__WEBPACK_IMPORTED_MODULE_0__;
		
	}
	parseColors(){
		
		return this;
		
	}
	get colors(){
		
		return palette;
		
	}
	expandProperty(name){
		
		return aliases[name] || undefined;
		
	}
	expandValue(value,config){
		
		
		if (value == undefined) {
			
			value = config.default;
		};
		
		if (config.hasOwnProperty(value)) {
			
			value = config[value];
		};
		
		if (typeof value == 'number' && config.step) {
			
			let [step,num,unit] = config.step.match(/^(\-?[\d\.]+)(\w+|%)?$/);
			return value * parseFloat(num) + unit;
		};
		
		return value;
	}
	
	antialiazed(value){
		
		
		if (String(value) == 'subpixel') {
			
			return {
				'-webkit-font-smoothing': 'auto',
				'-moz-osx-font-smoothing': 'auto'
			};
		} else {
			
			return {
				'-webkit-font-smoothing': 'antialiased',
				'-moz-osx-font-smoothing': 'grayscale'
			};
			
		};
	}
	
	paddingX([l,r = l]){
		
		return {'padding-left': l,'padding-right': r};
	}
	
	paddingY([t,b = t]){
		
		return {'padding-top': t,'padding-bottom': b};
		
	}
	marginX([l,r = l]){
		
		return {'margin-left': l,'margin-right': r};
	}
	
	marginY([t,b = t]){
		
		return {'margin-top': t,'margin-bottom': b};
		
	}
	inset([t,r = t,b = t,l = r]){
		
		return {top: t,right: r,bottom: b,left: l};
		
	}
	size([w,h = w]){
		
		return {width: w,height: h};
		
	}
	space([length]){
		
		return {
			padding: length,
			"& > *": {margin: length}
		};
	}
	
	transition(...parts){
		
		let out = {};
		let add = {};
		
		let signatures = [
			'name | duration',
			'name | duration | delay',
			'name | duration | ease',
			'name | duration | ease | delay'
		];
		
		let groups = {
			styles: ['background-color','border-color','color','fill','stroke','opacity','box-shadow','transform'],
			sizes: ['width','height','left','top','right','bottom','margin','padding'],
			colors: ['background-color','border-color','color','fill','stroke']
		};
		
		let i = 0;
		while (i < parts.length){
			
			let part = parts[i];
			let name = String(part[0]);
			if (name.match(/^[\-\+]?\d?(\.?\d+)(s|ms)?$/)) {
				
				part.unshift(name = 'styles');
				
			};
			let ease = part[2];
			let group = groups[name];
			
			if (group && parts.length == 1) {
				
				part[0] = 'none';
				Object.assign(add,{'transition-property': group.join(',')});
			} else if (group && parts.length > 1) {
				
				
				
				
				let subparts = group.map(function(_0) { return [_0].concat(part.slice(1)); });
				parts.splice(i,1,...subparts);
				continue;
			};
			i++;
		};
		
		Object.assign(out,{transition: parts},add);
		return out;
	}
	
	text([...params]){
		
		let out = {};
		let fonts = this.options.fonts;
		let sizes = this.options.variants.fontSize;
		let size = null;
		let color = null;
		
		let i = 0;
		
		var mixin;while (i < params.length){
			
			let param = params[i++];
			
			let value = String(param);
			let length = /\d/.test(value) && Length.parse(value);
			
			if (this.options.fonts[value]) {
				
				out['font-family'] = this.options.fonts[value];
			} else if (value.match(/^(\d\d\d|bold|bolder|lighter|normal)$/)) {
				
				out['font-weight'] = value;
			} else if (!size && (sizes[value] || (length))) {
				
				if (!sizes[value] && !length.unit) {
					
					length.unit = 'px';
				};
				
				size = [].concat(sizes[value] || length);
				if (String(params[i]) == '/') {
					
					size[1] = params[i + 1];
					i += 2;
				};
			} else if (color = this.$parseColor(value)) {
				
				out.color = String(color);
			} else if (mixin = this.options.variants.text[value]) {
				
				if (typeof mixin == 'string') {
					
					mixin = mixin.replace(/\//g,' / ').split(/\s+/);
				};
				
				if (mixin instanceof Array) {
					
					let parts = this.text(mixin);
					out = Object.assign(parts,out);
					continue;
					
				};
				for (let $i = 0, $keys = Object.keys(mixin), $l = $keys.length, k, v; $i < $l; $i++){
					k = $keys[$i];v = mixin[k];
					if (out[k] && k == 'text-decoration' && v != 'undecorated') {
						
						out[k] = out[k] + " " + v;
					} else {
						
						out[k] = v;
					};
				};
				
			};
		};
		
		if (size) {
			
			let fs = Length.parse(size[0]);
			let lh = Length.parse(size[1] || '');
			out['font-size'] = String(fs);
			
			if (lh && !lh.unit) {
				
				let rounded = Math.round(fs.number * lh.number);
				if (rounded % 2 == 1) {
					
					rounded++;
				};
				
				out['line-height'] = (lh.number == 0) ? 'inherit' : String(fs.clone(rounded));
			} else if (lh) {
				
				out['line-height'] = String(lh);
			} else if (String(size[1]) == 'inherit') {
				
				out['line-height'] = 'inherit';
			};
			
			if (out['line-height'] && out['line-height'] != 'inherit') {
				
				out['--lh'] = out['line-height'];
			};
		};
		
		
		return out;
		
	}
	display([...params]){
		
		let out = {};
		let schema = this.options.variants.layout;
		for (let i = 0, $items = iter$(params), $len = $items.length; i < $len; i++) {
			let param = $items[i];
			
			let str = String(param);
			let val = schema[str];
			if (val) {
				
				Object.assign(out,val);
			} else {
				
				
				out.display = str;
			};
		};
		
		return out;
	}
	
	
	
	border([...params]){
		
		if (params.length == 1 && this.$parseColor(params[0])) {
			
			return [['1px','solid',params[0]]];
		};
		return;
	}
	
	borderLeft(params){
		
		return this.border(params);
		
	}
	borderRight(params){
		
		return this.border(params);
	}
	
	borderTop(params){
		
		return this.border(params);
		
	}
	borderBottom(params){
		
		return this.border(params);
		
	}
	borderX(params){
		
		return {'border-left': this.border(params) || params,'border-right': this.border(params) || params};
		
	}
	borderY(params){
		
		return {'border-top': this.border(params) || params,'border-bottom': this.border(params) || params};
		
	}
	borderXWidth([l,r = l]){
		
		return {'border-left-width': l,'border-right-width': r};
		
	}
	borderYWidth([t,b = t]){
		
		return {'border-top-width': t,'border-bottom-width': b};
		
	}
	borderXStyle([l,r = l]){
		
		return {'border-left-style': l,'border-right-style': r};
		
	}
	borderYStyle([t,b = t]){
		
		return {'border-top-style': t,'border-bottom-style': b};
	}
	
	
	
	
	$u(number,part){
		
		let [step,num,unit] = this.config.step.match(/^(\-?[\d\.]+)(\w+|%)?$/);
		
		return this.value * parseFloat(num) + unit;
	}
	
	$parseColor(identifier){
		var m;
		
		let key = String(identifier);
		
		if (m = key.match(colorRegex)) {
			
			let color = this.colors[m[1]];
			let rest = key.replace(colorRegex,'');
			if (m = rest.match(/^\-(\d+)$/)) {
				
				color = color.alpha(m[1] + '%');
			};
			
			return color;
		} else if (key.match(/^#[a-fA-F0-9]{3,8}/)) {
			
			return identifier;
			
		} else if (key.match(/^(rgb|hsl)/)) {
			
			return identifier;
		} else if (key == 'currentColor') {
			
			return identifier;
		};
		
		return null;
		
	}
	$value(value,index,config){
		var color;
		
		let key = config;
		if (typeof config == 'string') {
			
			if (config.match(/^((min-|max-)?(width|height)|top|left|bottom|right|padding|margin|sizing|inset)/)) {
				
				config = 'sizing';
			} else if (config.match(/^(border-radius)/)) {
				
				config = 'radius';
			} else if (config.match(/^tween|transition/) && this.options.variants.easings[String(value)]) {
				
				return this.options.variants.easings[String(value)];
			};
			
			config = this.options.variants[config] || {};
		};
		
		if (value == undefined) {
			
			value = config.default;
		};
		
		
		if (config.hasOwnProperty(String(value))) {
			
			
			value = config[value];
			
		};
		if (typeof value == 'number' && config.step) {
			
			
			let [step,num,unit] = config.step.match(/^(\-?[\d\.]+)(\w+|%)?$/);
			
			return value * parseFloat(num) + unit;
		};
		
		if (typeof value == 'string') {
			
			if (color = this.$parseColor(value)) {
				
				return color;
			};
			
			
		};
		
		return value;
		
	}
};


class Selectors {
	
	static parse(context,states,options){
		
		let parser = new this;
		return parser.$parse(context,states,options);
	}
	
	$parse(context,states,options){
		var self = this;
		
		let rule = '&';
		this.o = {context: context,media: []};
		
		
		
		for (let $i = 0, $items = iter$(states), $len = $items.length, media; $i < $len; $i++) {
			let state = $items[$i];
			
			let res;
			let params = [];
			
			if (state instanceof Array) {
				
				params = state.slice(1);
				state = state[0];
			};
			
			if (!(this[state]) && this[state.replace(/\-/g,'_')]) {
				
				state = state.replace(/\-/g,'_');
			};
			
			if (!(this[state])) {
				
				
				if (media = _theme_imba__WEBPACK_IMPORTED_MODULE_0__["breakpoints"][state]) {
					
					this.o.media.push(media);
					continue;
					
				} else if (state.indexOf('&') >= 0) {
					
					res = state;
				} else {
					
					let [prefix,...flags] = state.split('-');
					if (prefix == 'in' || prefix == 'is') { prefix = '_' + prefix };
					
					if (this[prefix] && flags.length) {
						
						params.unshift(("." + flags.join('.')));
						state = prefix;
					};
				};
			};
			
			if (this[state]) {
				
				res = this[state](...params);
			};
			
			
			if (typeof res == 'string') {
				
				rule = rule.replace('&',res);
			};
		};
		
		
		
		
		let sel = rule.replace(/\&/g,context);
		
		sel = sel.replace(/\$([\w\-]+)/g,function(m,ref) {
			
			return ("." + (options.localid) + "." + ref);
		});
		
		sel = sel.replace(/\:local/g,function(m) {
			
			options.hasLocalRules = true;
			return ("." + (options.localid));
		});
		
		sel = sel.replace(/@([\w\-]+)/g,function(m,breakpoint) {
			var match;
			
			if (match = _theme_imba__WEBPACK_IMPORTED_MODULE_0__["breakpoints"][breakpoint]) {
				
				self.o.media.push(match);
				return "";
			};
			return m;
		});
		
		this.o.selectors = [sel];
		if (this.o.media.length) {
			
			sel = '@media ' + this.o.media.join(' and ') + '{ ' + sel;
		};
		return sel;
	}
	
	any(){
		
		return '&';
		
	}
	pseudo(type,sel){
		
		return sel ? (("" + sel + type + " &")) : (("&" + type));
	}
	
	hover(sel){
		
		return this.pseudo(':hover',sel);
	}
	
	focus(sel){
		
		return this.pseudo(':focus',sel);
	}
	
	active(sel){
		
		return this.pseudo(':active',sel);
	}
	
	before(sel){
		
		return this.pseudo('::before',sel);
	}
	
	after(sel){
		
		return this.pseudo('::after',sel);
		
	}
	visited(sel){
		
		return this.pseudo(':visited',sel);
	}
	
	disabled(sel){
		
		return this.pseudo(':disabled',sel);
		
	}
	focus_within(sel){
		
		return this.pseudo(':focus-within',sel);
		
	}
	odd(sel){
		
		return this.pseudo(':nth-child(odd)',sel);
		
	}
	even(sel){
		
		return this.pseudo(':nth-child(even)',sel);
		
	}
	first(sel){
		
		return this.pseudo(':first-child',sel);
		
	}
	last(sel){
		
		return this.pseudo(':last-child',sel);
		
	}
	empty(sel){
		
		return this.pseudo(':empty',sel);
		
	}
	hocus(){
		
		return '&:matches(:focus,:hover)';
		
	}
	_in(sel){
		
		return (sel.indexOf('&') >= 0) ? sel : (("" + sel + " &"));
	}
	
	_is(sel){
		
		return (sel.indexOf('&') >= 0) ? sel : (("&" + sel));
	}
	
	up(sel){
		
		return (sel.indexOf('&') >= 0) ? sel : (("" + sel + " &"));
	}
	
	sel(sel){
		
		return (sel.indexOf('&') >= 0) ? sel : (("& " + sel));
	}
	
	
	scope(sel){
		
		return (sel.indexOf('&') >= 0) ? sel : (("" + sel + " &"));
	}
	
	
	
	
	
	
	
	
	
	
	
};
const TransformMixin = '--t_x:0;--t_y:0;--t_z:0;--t_rotate:0;--t_scale:1;--t_scale-x:1;--t_scale-y:1;--t_skew-x:0;--t_skew-y:0;\ntransform: translate3d(var(--t_x),var(--t_y),var(--t_z)) rotate(var(--t_rotate)) skewX(var(--t_skew-x)) skewY(var(--t_skew-y)) scaleX(var(--t_scale-x)) scaleY(var(--t_scale-y)) scale(var(--t_scale));';

class StyleRule {
	
	
	constructor(parent,context,states,modifiers,options = {}){
		
		this.parent = parent;
		this.context = context;
		this.states = states;
		this.selector = Selectors.parse(context,states,options);
		this.rules = modifiers;
		this.selectors = {};
		this.options = options;
		this.meta = {};
		
	}
	root(){
		
		return this.parent ? this.parent.root : this;
		
	}
	toString(){
		var $options;
		
		let sel = this.selector;
		let parts = [];
		let subrules = [];
		
		($options = this.options).selectors || ($options.selectors = []);
		this.options.selectors.push(sel);
		
		for (let $o = this.rules, $i = 0, $keys = Object.keys($o), $l = $keys.length, key, value; $i < $l; $i++){
			key = $keys[$i];value = $o[key];
			if (value == undefined) { continue; };
			
			let subsel = null;
			
			if (key.indexOf('&') >= 0) {
				
				
				let substates = ([[key]]).concat(this.states);
				subrules.push(new StyleRule(this,this.context,substates,value,this.options));
				continue;
			} else if (key.indexOf('.') >= 0) {
				
				let keys = key.split('.');
				
				
				let substates = keys.slice(1).concat(this.states);
				
				let obj = {};
				obj[keys[0]] = value;
				subrules.push(new StyleRule(this,this.context,substates,obj,this.options));
				continue;
			} else if (key[0] == '[') {
				
				
				
				let o = JSON.parse(key);
				let substates = this.states.concat(o);
				subrules.push(new StyleRule(this,this.context,substates,value,this.options));
				continue;
			} else if (key.match(/^(x|y|z|scale|scale-x|scale-y|skew-x|skew-y|rotate)$/)) {
				
				if (!this.meta.transform) {
					
					this.meta.transform = true;
					parts.unshift(TransformMixin);
				};
				parts.push(("--t_" + key + ": " + value + " !important;"));
			} else {
				
				parts.push(("" + key + ": " + value + ";"));
				
			};
		};
		let out = sel + ' {\n' + parts.join('\n') + '\n}';
		if (sel.indexOf('@media') >= 0) { out += '}' };
		
		for (let $i = 0, $items = iter$(subrules), $len = $items.length; $i < $len; $i++) {
			let subrule = $items[$i];
			
			out += '\n' + subrule.toString();
		};
		
		return out;
	}
};






/***/ }),
/* 21 */
/***/ (function(module, exports) {

/* MIT license */

const convert = {
	rgb: {channels: 3, labels: 'rgb'},
	hsl: {channels: 3, labels: 'hsl'},
	hsv: {channels: 3, labels: 'hsv'},
	hwb: {channels: 3, labels: 'hwb'},
	cmyk: {channels: 4, labels: 'cmyk'},
	xyz: {channels: 3, labels: 'xyz'},
	lab: {channels: 3, labels: 'lab'},
	lch: {channels: 3, labels: 'lch'},
	hex: {channels: 1, labels: ['hex']},
	ansi16: {channels: 1, labels: ['ansi16']},
	ansi256: {channels: 1, labels: ['ansi256']},
	hcg: {channels: 3, labels: ['h', 'c', 'g']},
	apple: {channels: 3, labels: ['r16', 'g16', 'b16']},
	gray: {channels: 1, labels: ['gray']}
};

module.exports = convert;

// Hide .channels and .labels properties
for (const model of Object.keys(convert)) {
	if (!('channels' in convert[model])) {
		throw new Error('missing channels property: ' + model);
	}

	if (!('labels' in convert[model])) {
		throw new Error('missing channel labels property: ' + model);
	}

	if (convert[model].labels.length !== convert[model].channels) {
		throw new Error('channel and label counts mismatch: ' + model);
	}

	const {channels, labels} = convert[model];
	delete convert[model].channels;
	delete convert[model].labels;
	Object.defineProperty(convert[model], 'channels', {value: channels});
	Object.defineProperty(convert[model], 'labels', {value: labels});
}

convert.rgb.hsl = function (rgb) {
	const r = rgb[0] / 255;
	const g = rgb[1] / 255;
	const b = rgb[2] / 255;
	const min = Math.min(r, g, b);
	const max = Math.max(r, g, b);
	const delta = max - min;
	let h;
	let s;

	if (max === min) {
		h = 0;
	} else if (r === max) {
		h = (g - b) / delta;
	} else if (g === max) {
		h = 2 + (b - r) / delta;
	} else if (b === max) {
		h = 4 + (r - g) / delta;
	}

	h = Math.min(h * 60, 360);

	if (h < 0) {
		h += 360;
	}

	const l = (min + max) / 2;

	if (max === min) {
		s = 0;
	} else if (l <= 0.5) {
		s = delta / (max + min);
	} else {
		s = delta / (2 - max - min);
	}

	return [h, s * 100, l * 100];
};

convert.rgb.hsv = function (rgb) {
	let rdif;
	let gdif;
	let bdif;
	let h;
	let s;

	const r = rgb[0] / 255;
	const g = rgb[1] / 255;
	const b = rgb[2] / 255;
	const v = Math.max(r, g, b);
	const diff = v - Math.min(r, g, b);
	const diffc = function (c) {
		return (v - c) / 6 / diff + 1 / 2;
	};

	if (diff === 0) {
		h = 0;
		s = 0;
	} else {
		s = diff / v;
		rdif = diffc(r);
		gdif = diffc(g);
		bdif = diffc(b);

		if (r === v) {
			h = bdif - gdif;
		} else if (g === v) {
			h = (1 / 3) + rdif - bdif;
		} else if (b === v) {
			h = (2 / 3) + gdif - rdif;
		}

		if (h < 0) {
			h += 1;
		} else if (h > 1) {
			h -= 1;
		}
	}

	return [
		h * 360,
		s * 100,
		v * 100
	];
};

convert.rgb.hwb = function (rgb) {
	const r = rgb[0];
	const g = rgb[1];
	let b = rgb[2];
	const h = convert.rgb.hsl(rgb)[0];
	const w = 1 / 255 * Math.min(r, Math.min(g, b));

	b = 1 - 1 / 255 * Math.max(r, Math.max(g, b));

	return [h, w * 100, b * 100];
};

convert.rgb.cmyk = function (rgb) {
	const r = rgb[0] / 255;
	const g = rgb[1] / 255;
	const b = rgb[2] / 255;

	const k = Math.min(1 - r, 1 - g, 1 - b);
	const c = (1 - r - k) / (1 - k) || 0;
	const m = (1 - g - k) / (1 - k) || 0;
	const y = (1 - b - k) / (1 - k) || 0;

	return [c * 100, m * 100, y * 100, k * 100];
};

function comparativeDistance(x, y) {
	/*
		See https://en.m.wikipedia.org/wiki/Euclidean_distance#Squared_Euclidean_distance
	*/
	return (
		((x[0] - y[0]) ** 2) +
		((x[1] - y[1]) ** 2) +
		((x[2] - y[2]) ** 2)
	);
}

convert.rgb.xyz = function (rgb) {
	let r = rgb[0] / 255;
	let g = rgb[1] / 255;
	let b = rgb[2] / 255;

	// Assume sRGB
	r = r > 0.04045 ? (((r + 0.055) / 1.055) ** 2.4) : (r / 12.92);
	g = g > 0.04045 ? (((g + 0.055) / 1.055) ** 2.4) : (g / 12.92);
	b = b > 0.04045 ? (((b + 0.055) / 1.055) ** 2.4) : (b / 12.92);

	const x = (r * 0.4124564) + (g * 0.3575761) + (b * 0.1804375);
	const y = (r * 0.2126729) + (g * 0.7151522) + (b * 0.072175);
	const z = (r * 0.0193339) + (g * 0.119192) + (b * 0.9503041);

	return [x * 100, y * 100, z * 100];
};

convert.rgb.lab = function (rgb) {
	const xyz = convert.rgb.xyz(rgb);
	let x = xyz[0];
	let y = xyz[1];
	let z = xyz[2];

	x /= 95.047;
	y /= 100;
	z /= 108.883;

	x = x > 0.008856 ? (x ** (1 / 3)) : (7.787 * x) + (16 / 116);
	y = y > 0.008856 ? (y ** (1 / 3)) : (7.787 * y) + (16 / 116);
	z = z > 0.008856 ? (z ** (1 / 3)) : (7.787 * z) + (16 / 116);

	const l = (116 * y) - 16;
	const a = 500 * (x - y);
	const b = 200 * (y - z);

	return [l, a, b];
};

convert.hsl.rgb = function (hsl) {
	const h = hsl[0] / 360;
	const s = hsl[1] / 100;
	const l = hsl[2] / 100;
	let t2;
	let t3;
	let val;

	if (s === 0) {
		val = l * 255;
		return [val, val, val];
	}

	if (l < 0.5) {
		t2 = l * (1 + s);
	} else {
		t2 = l + s - l * s;
	}

	const t1 = 2 * l - t2;

	const rgb = [0, 0, 0];
	for (let i = 0; i < 3; i++) {
		t3 = h + 1 / 3 * -(i - 1);
		if (t3 < 0) {
			t3++;
		}

		if (t3 > 1) {
			t3--;
		}

		if (6 * t3 < 1) {
			val = t1 + (t2 - t1) * 6 * t3;
		} else if (2 * t3 < 1) {
			val = t2;
		} else if (3 * t3 < 2) {
			val = t1 + (t2 - t1) * (2 / 3 - t3) * 6;
		} else {
			val = t1;
		}

		rgb[i] = val * 255;
	}

	return rgb;
};

convert.hsl.hsv = function (hsl) {
	const h = hsl[0];
	let s = hsl[1] / 100;
	let l = hsl[2] / 100;
	let smin = s;
	const lmin = Math.max(l, 0.01);

	l *= 2;
	s *= (l <= 1) ? l : 2 - l;
	smin *= lmin <= 1 ? lmin : 2 - lmin;
	const v = (l + s) / 2;
	const sv = l === 0 ? (2 * smin) / (lmin + smin) : (2 * s) / (l + s);

	return [h, sv * 100, v * 100];
};

convert.hsv.rgb = function (hsv) {
	const h = hsv[0] / 60;
	const s = hsv[1] / 100;
	let v = hsv[2] / 100;
	const hi = Math.floor(h) % 6;

	const f = h - Math.floor(h);
	const p = 255 * v * (1 - s);
	const q = 255 * v * (1 - (s * f));
	const t = 255 * v * (1 - (s * (1 - f)));
	v *= 255;

	switch (hi) {
		case 0:
			return [v, t, p];
		case 1:
			return [q, v, p];
		case 2:
			return [p, v, t];
		case 3:
			return [p, q, v];
		case 4:
			return [t, p, v];
		case 5:
			return [v, p, q];
	}
};

convert.hsv.hsl = function (hsv) {
	const h = hsv[0];
	const s = hsv[1] / 100;
	const v = hsv[2] / 100;
	const vmin = Math.max(v, 0.01);
	let sl;
	let l;

	l = (2 - s) * v;
	const lmin = (2 - s) * vmin;
	sl = s * vmin;
	sl /= (lmin <= 1) ? lmin : 2 - lmin;
	sl = sl || 0;
	l /= 2;

	return [h, sl * 100, l * 100];
};

// http://dev.w3.org/csswg/css-color/#hwb-to-rgb
convert.hwb.rgb = function (hwb) {
	const h = hwb[0] / 360;
	let wh = hwb[1] / 100;
	let bl = hwb[2] / 100;
	const ratio = wh + bl;
	let f;

	// Wh + bl cant be > 1
	if (ratio > 1) {
		wh /= ratio;
		bl /= ratio;
	}

	const i = Math.floor(6 * h);
	const v = 1 - bl;
	f = 6 * h - i;

	if ((i & 0x01) !== 0) {
		f = 1 - f;
	}

	const n = wh + f * (v - wh); // Linear interpolation

	let r;
	let g;
	let b;
	/* eslint-disable max-statements-per-line,no-multi-spaces */
	switch (i) {
		default:
		case 6:
		case 0: r = v;  g = n;  b = wh; break;
		case 1: r = n;  g = v;  b = wh; break;
		case 2: r = wh; g = v;  b = n; break;
		case 3: r = wh; g = n;  b = v; break;
		case 4: r = n;  g = wh; b = v; break;
		case 5: r = v;  g = wh; b = n; break;
	}
	/* eslint-enable max-statements-per-line,no-multi-spaces */

	return [r * 255, g * 255, b * 255];
};

convert.cmyk.rgb = function (cmyk) {
	const c = cmyk[0] / 100;
	const m = cmyk[1] / 100;
	const y = cmyk[2] / 100;
	const k = cmyk[3] / 100;

	const r = 1 - Math.min(1, c * (1 - k) + k);
	const g = 1 - Math.min(1, m * (1 - k) + k);
	const b = 1 - Math.min(1, y * (1 - k) + k);

	return [r * 255, g * 255, b * 255];
};

convert.xyz.rgb = function (xyz) {
	const x = xyz[0] / 100;
	const y = xyz[1] / 100;
	const z = xyz[2] / 100;
	let r;
	let g;
	let b;

	r = (x * 3.2404542) + (y * -1.5371385) + (z * -0.4985314);
	g = (x * -0.969266) + (y * 1.8760108) + (z * 0.041556);
	b = (x * 0.0556434) + (y * -0.2040259) + (z * 1.0572252);

	// Assume sRGB
	r = r > 0.0031308
		? ((1.055 * (r ** (1.0 / 2.4))) - 0.055)
		: r * 12.92;

	g = g > 0.0031308
		? ((1.055 * (g ** (1.0 / 2.4))) - 0.055)
		: g * 12.92;

	b = b > 0.0031308
		? ((1.055 * (b ** (1.0 / 2.4))) - 0.055)
		: b * 12.92;

	r = Math.min(Math.max(0, r), 1);
	g = Math.min(Math.max(0, g), 1);
	b = Math.min(Math.max(0, b), 1);

	return [r * 255, g * 255, b * 255];
};

convert.xyz.lab = function (xyz) {
	let x = xyz[0];
	let y = xyz[1];
	let z = xyz[2];

	x /= 95.047;
	y /= 100;
	z /= 108.883;

	x = x > 0.008856 ? (x ** (1 / 3)) : (7.787 * x) + (16 / 116);
	y = y > 0.008856 ? (y ** (1 / 3)) : (7.787 * y) + (16 / 116);
	z = z > 0.008856 ? (z ** (1 / 3)) : (7.787 * z) + (16 / 116);

	const l = (116 * y) - 16;
	const a = 500 * (x - y);
	const b = 200 * (y - z);

	return [l, a, b];
};

convert.lab.xyz = function (lab) {
	const l = lab[0];
	const a = lab[1];
	const b = lab[2];
	let x;
	let y;
	let z;

	y = (l + 16) / 116;
	x = a / 500 + y;
	z = y - b / 200;

	const y2 = y ** 3;
	const x2 = x ** 3;
	const z2 = z ** 3;
	y = y2 > 0.008856 ? y2 : (y - 16 / 116) / 7.787;
	x = x2 > 0.008856 ? x2 : (x - 16 / 116) / 7.787;
	z = z2 > 0.008856 ? z2 : (z - 16 / 116) / 7.787;

	x *= 95.047;
	y *= 100;
	z *= 108.883;

	return [x, y, z];
};

convert.lab.lch = function (lab) {
	const l = lab[0];
	const a = lab[1];
	const b = lab[2];
	let h;

	const hr = Math.atan2(b, a);
	h = hr * 360 / 2 / Math.PI;

	if (h < 0) {
		h += 360;
	}

	const c = Math.sqrt(a * a + b * b);

	return [l, c, h];
};

convert.lch.lab = function (lch) {
	const l = lch[0];
	const c = lch[1];
	const h = lch[2];

	const hr = h / 360 * 2 * Math.PI;
	const a = c * Math.cos(hr);
	const b = c * Math.sin(hr);

	return [l, a, b];
};

convert.rgb.ansi16 = function (args, saturation = null) {
	const [r, g, b] = args;
	let value = saturation === null ? convert.rgb.hsv(args)[2] : saturation; // Hsv -> ansi16 optimization

	value = Math.round(value / 50);

	if (value === 0) {
		return 30;
	}

	let ansi = 30
		+ ((Math.round(b / 255) << 2)
		| (Math.round(g / 255) << 1)
		| Math.round(r / 255));

	if (value === 2) {
		ansi += 60;
	}

	return ansi;
};

convert.hsv.ansi16 = function (args) {
	// Optimization here; we already know the value and don't need to get
	// it converted for us.
	return convert.rgb.ansi16(convert.hsv.rgb(args), args[2]);
};

convert.rgb.ansi256 = function (args) {
	const r = args[0];
	const g = args[1];
	const b = args[2];

	// We use the extended greyscale palette here, with the exception of
	// black and white. normal palette only has 4 greyscale shades.
	if (r === g && g === b) {
		if (r < 8) {
			return 16;
		}

		if (r > 248) {
			return 231;
		}

		return Math.round(((r - 8) / 247) * 24) + 232;
	}

	const ansi = 16
		+ (36 * Math.round(r / 255 * 5))
		+ (6 * Math.round(g / 255 * 5))
		+ Math.round(b / 255 * 5);

	return ansi;
};

convert.ansi16.rgb = function (args) {
	let color = args % 10;

	// Handle greyscale
	if (color === 0 || color === 7) {
		if (args > 50) {
			color += 3.5;
		}

		color = color / 10.5 * 255;

		return [color, color, color];
	}

	const mult = (~~(args > 50) + 1) * 0.5;
	const r = ((color & 1) * mult) * 255;
	const g = (((color >> 1) & 1) * mult) * 255;
	const b = (((color >> 2) & 1) * mult) * 255;

	return [r, g, b];
};

convert.ansi256.rgb = function (args) {
	// Handle greyscale
	if (args >= 232) {
		const c = (args - 232) * 10 + 8;
		return [c, c, c];
	}

	args -= 16;

	let rem;
	const r = Math.floor(args / 36) / 5 * 255;
	const g = Math.floor((rem = args % 36) / 6) / 5 * 255;
	const b = (rem % 6) / 5 * 255;

	return [r, g, b];
};

convert.rgb.hex = function (args) {
	const integer = ((Math.round(args[0]) & 0xFF) << 16)
		+ ((Math.round(args[1]) & 0xFF) << 8)
		+ (Math.round(args[2]) & 0xFF);

	const string = integer.toString(16).toUpperCase();
	return '000000'.substring(string.length) + string;
};

convert.hex.rgb = function (args) {
	const match = args.toString(16).match(/[a-f0-9]{6}|[a-f0-9]{3}/i);
	if (!match) {
		return [0, 0, 0];
	}

	let colorString = match[0];

	if (match[0].length === 3) {
		colorString = colorString.split('').map(char => {
			return char + char;
		}).join('');
	}

	const integer = parseInt(colorString, 16);
	const r = (integer >> 16) & 0xFF;
	const g = (integer >> 8) & 0xFF;
	const b = integer & 0xFF;

	return [r, g, b];
};

convert.hex.hsl = function(args){
	return convert.rgb.hsl(convert.hex.rgb(args));
}

convert.rgb.hcg = function (rgb) {
	const r = rgb[0] / 255;
	const g = rgb[1] / 255;
	const b = rgb[2] / 255;
	const max = Math.max(Math.max(r, g), b);
	const min = Math.min(Math.min(r, g), b);
	const chroma = (max - min);
	let grayscale;
	let hue;

	if (chroma < 1) {
		grayscale = min / (1 - chroma);
	} else {
		grayscale = 0;
	}

	if (chroma <= 0) {
		hue = 0;
	} else
	if (max === r) {
		hue = ((g - b) / chroma) % 6;
	} else
	if (max === g) {
		hue = 2 + (b - r) / chroma;
	} else {
		hue = 4 + (r - g) / chroma;
	}

	hue /= 6;
	hue %= 1;

	return [hue * 360, chroma * 100, grayscale * 100];
};

convert.hsl.hcg = function (hsl) {
	const s = hsl[1] / 100;
	const l = hsl[2] / 100;

	const c = l < 0.5 ? (2.0 * s * l) : (2.0 * s * (1.0 - l));

	let f = 0;
	if (c < 1.0) {
		f = (l - 0.5 * c) / (1.0 - c);
	}

	return [hsl[0], c * 100, f * 100];
};

convert.hsv.hcg = function (hsv) {
	const s = hsv[1] / 100;
	const v = hsv[2] / 100;

	const c = s * v;
	let f = 0;

	if (c < 1.0) {
		f = (v - c) / (1 - c);
	}

	return [hsv[0], c * 100, f * 100];
};

convert.hcg.rgb = function (hcg) {
	const h = hcg[0] / 360;
	const c = hcg[1] / 100;
	const g = hcg[2] / 100;

	if (c === 0.0) {
		return [g * 255, g * 255, g * 255];
	}

	const pure = [0, 0, 0];
	const hi = (h % 1) * 6;
	const v = hi % 1;
	const w = 1 - v;
	let mg = 0;

	/* eslint-disable max-statements-per-line */
	switch (Math.floor(hi)) {
		case 0:
			pure[0] = 1; pure[1] = v; pure[2] = 0; break;
		case 1:
			pure[0] = w; pure[1] = 1; pure[2] = 0; break;
		case 2:
			pure[0] = 0; pure[1] = 1; pure[2] = v; break;
		case 3:
			pure[0] = 0; pure[1] = w; pure[2] = 1; break;
		case 4:
			pure[0] = v; pure[1] = 0; pure[2] = 1; break;
		default:
			pure[0] = 1; pure[1] = 0; pure[2] = w;
	}
	/* eslint-enable max-statements-per-line */

	mg = (1.0 - c) * g;

	return [
		(c * pure[0] + mg) * 255,
		(c * pure[1] + mg) * 255,
		(c * pure[2] + mg) * 255
	];
};

convert.hcg.hsv = function (hcg) {
	const c = hcg[1] / 100;
	const g = hcg[2] / 100;

	const v = c + g * (1.0 - c);
	let f = 0;

	if (v > 0.0) {
		f = c / v;
	}

	return [hcg[0], f * 100, v * 100];
};

convert.hcg.hsl = function (hcg) {
	const c = hcg[1] / 100;
	const g = hcg[2] / 100;

	const l = g * (1.0 - c) + 0.5 * c;
	let s = 0;

	if (l > 0.0 && l < 0.5) {
		s = c / (2 * l);
	} else
	if (l >= 0.5 && l < 1.0) {
		s = c / (2 * (1 - l));
	}

	return [hcg[0], s * 100, l * 100];
};

convert.hcg.hwb = function (hcg) {
	const c = hcg[1] / 100;
	const g = hcg[2] / 100;
	const v = c + g * (1.0 - c);
	return [hcg[0], (v - c) * 100, (1 - v) * 100];
};

convert.hwb.hcg = function (hwb) {
	const w = hwb[1] / 100;
	const b = hwb[2] / 100;
	const v = 1 - b;
	const c = v - w;
	let g = 0;

	if (c < 1) {
		g = (v - c) / (1 - c);
	}

	return [hwb[0], c * 100, g * 100];
};

convert.apple.rgb = function (apple) {
	return [(apple[0] / 65535) * 255, (apple[1] / 65535) * 255, (apple[2] / 65535) * 255];
};

convert.rgb.apple = function (rgb) {
	return [(rgb[0] / 255) * 65535, (rgb[1] / 255) * 65535, (rgb[2] / 255) * 65535];
};

convert.gray.rgb = function (args) {
	return [args[0] / 100 * 255, args[0] / 100 * 255, args[0] / 100 * 255];
};

convert.gray.hsl = function (args) {
	return [0, 0, args[0]];
};

convert.gray.hsv = convert.gray.hsl;

convert.gray.hwb = function (gray) {
	return [0, 100, gray[0]];
};

convert.gray.cmyk = function (gray) {
	return [0, 0, 0, gray[0]];
};

convert.gray.lab = function (gray) {
	return [gray[0], 0, 0];
};

convert.gray.hex = function (gray) {
	const val = Math.round(gray[0] / 100 * 255) & 0xFF;
	const integer = (val << 16) + (val << 8) + val;

	const string = integer.toString(16).toUpperCase();
	return '000000'.substring(string.length) + string;
};

convert.rgb.gray = function (rgb) {
	const val = (rgb[0] + rgb[1] + rgb[2]) / 3;
	return [val / 255 * 100];
};

/***/ }),
/* 22 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "fonts", function() { return fonts; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "variants", function() { return variants; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "breakpoints", function() { return breakpoints; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "materialColors", function() { return materialColors; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "colors", function() { return colors; });
const fonts = {
	sans: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji"',
	serif: 'Georgia, Cambria, "Times New Roman", Times, serif',
	mono: 'Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace'
};


const variants = {
	radius: {
		full: '9999px',
		step: '2px'
	},
	
	sizing: {
		step: '0.25rem'
	
	},
	layout: {
		// display
				flex: {display: 'flex'},
		vflex: {display: 'flex','flex-direction': 'column'},
		hflex: {display: 'flex','flex-direction': 'row'},
		'inline-flex': {display: 'inline-flex'},
		'inline-vflex': {display: 'inline-flex','flex-direction': 'column'},
		'inline-hflex': {display: 'inline-flex','flex-direction': 'row'},
		inline: {display: 'inline'},
		block: {display: 'block'},
		'inline-block': {display: 'inline-block'},
		grid: {display: 'grid'},
		'inline-grid': {display: 'inline-grid'},
		table: {display: 'table'},
		'table-caption': {display: 'table-caption'},
		'table-cell': {display: 'table-cell'},
		'table-column': {display: 'table-column'},
		'table-column-group': {display: 'table-column-group'},
		'table-footer-group': {display: 'table-footer-group'},
		'table-header-group': {display: 'table-header-group'},
		'table-row-group': {display: 'table-row-group'},
		'table-row': {display: 'table-row'},
		contents: {display: 'contents'},
		hidden: {display: 'none'},
		none: {display: 'none'},
		
		
		static: {position: 'static'},
		relative: {position: 'relative'},
		absolute: {position: 'absolute'},
		rel: {position: 'relative'},
		abs: {position: 'absolute'},
		fixed: {position: 'fixed'},
		sticky: {position: 'sticky'},
		
		
		clip: {overflow: 'hidden'},
		noclip: {overflow: 'visible'},
		'clip-x': {'overflow-x': 'hidden'},
		'clip-y': {'overflow-y': 'hidden'},
		'scroll-x': {'overflow-x': 'auto'},
		'scroll-y': {'overflow-y': 'auto'},
		'noclip-x': {'overflow-x': 'visible'},
		'noclip-y': {'overflow-y': 'visible'},
		
		
		'border-box': {'box-sizing': 'border-box'},
		'content-box': {'box-sizing': 'content-box'},
		
		wrap: {'flex-wrap': 'wrap'},
		center: {'align-items': 'center','justify-content': 'center','align-content': 'center'},
		
		
		invisible: {visibility: 'hidden'},
		visible: {visibility: 'visible'}
	},
	
	fontSize: {
		xxs: ['10px',1.5],
		xs: ['12px',1.5],
		sm: ['14px',1.5],
		md: ['16px',1.5],
		lg: ['18px',1.5],
		xl: ['20px',1.5],
		'2xl': ['24px',1.5],
		'3xl': ['30px',1.5],
		'4xl': ['36px',1.5],
		'5xl': ['48px',1.5],
		'6xl': ['64px',1.5],
		
		'1': ['10px',1.5],
		'2': ['12px',1.5],
		'3': ['13px',1.5],
		'4': ['14px',1.5],
		'5': ['15px',1.5],
		'6': ['16px',1.5],
		'7': ['17px',1.5],
		'8': ['18px',1.5],
		'9': ['19px',1.5],
		'10': ['20px',1.5],
		'11': ['24px',1.4],
		'12': ['30px',1.3],
		'13': ['36px',1.3],
		'14': ['48px',1.2],
		'15': ['64px',1.2],
		'16': ['96px',1.2]
	
	},
	units: {
		u: '4px'
	
	},
	text: {
		italic: {'font-style': 'italic'},
		'non-italic': {'font-style': 'normal'},
		
		underline: {'text-decoration': 'underline'},
		overline: {'text-decoration': 'overline'},
		'no-underline': {'text-decoration': 'none'},
		'line-through': {'text-decoration': 'line-through'},
		undecorated: {'text-decoration': 'none'},
		
		uppercase: {'text-transform': 'uppercase'},
		lowercase: {'text-transform': 'lowercase'},
		capitalize: {'text-transform': 'capitalize'},
		untransformed: {'text-transform': 'none'},
		
		left: {'text-align': 'left'},
		center: {'text-align': 'center'},
		right: {'text-align': 'right'},
		justify: {'text-align': 'justify'},
		
		light: {'font-weight': '300'},
		medium: {'font-weight': '500'},
		semibold: {'font-weight': '600'},
		
		normal: {'letter-spacing': '0em','font-weight': 400,'font-style': 'normal'},
		
		reset: {
			'letter-spacing': '0em',
			'font-weight': 400,
			'text-transform': 'none',
			'text-decoration': 'none',
			'font-style': 'normal'
		},
		
		tighter: {'letter-spacing': '-0.05em'},
		tight: {'letter-spacing': '-0.025em'},
		wide: {'letter-spacing': '0.025em'},
		wider: {'letter-spacing': '0.05em'},
		widest: {'letter-spacing': '0.1em'},
		
		nowrap: {'white-space': 'nowrap'},
		pre: {'white-space': 'pre'},
		'pre-wrap': {'white-space': 'pre-wrap'},
		'pre-line': {'white-space': 'pre-line'},
		'break-spaces': {'white-space': 'break-spaces'},
		truncate: {overflow: 'hidden','text-overflow': 'ellipsis','white-space': 'nowrap'},
		
		antialiased: {'-webkit-font-smoothing': 'antialiased','-moz-osx-font-smoothing': 'grayscale'},
		'subpixel-antialiased': {'-webkit-font-smoothing': 'auto','-moz-osx-font-smoothing': 'auto'}
	
	},
	'box-shadow': {
		xs: '0 0 0 1px rgba(0, 0, 0, 0.05)',
		sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
		'default': '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
		md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
		lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
		xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
		'2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
		inner: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)',
		outline: '0 0 0 3px rgba(66, 153, 225, 0.5)',
		none: 'none'
	},
	
	easings: {
		"sine-in": "cubic-bezier(0.47, 0, 0.745, 0.715)",
		"sine-out": "cubic-bezier(0.39, 0.575, 0.565, 1)",
		"sine-out-in": "cubic-bezier(0.445, 0.05, 0.55, 0.95)",
		"quad-in": "cubic-bezier(0.55, 0.085, 0.68, 0.53)",
		"quad-out": "cubic-bezier(0.25, 0.46, 0.45, 0.94)",
		quad: "cubic-bezier(0.455, 0.03, 0.515, 0.955)",
		"cubic-in": "cubic-bezier(0.55, 0.055, 0.675, 0.19)",
		"cubic-out": "cubic-bezier(0.215, 0.61, 0.355, 1)",
		cubic: "cubic-bezier(0.645, 0.045, 0.355, 1)",
		"quart-in": "cubic-bezier(0.895, 0.03, 0.685, 0.22)",
		"quart-out": "cubic-bezier(0.165, 0.84, 0.44, 1)",
		quart: "cubic-bezier(0.77, 0, 0.175, 1)",
		"quint-in": "cubic-bezier(0.755, 0.05, 0.855, 0.06)",
		"quint-out": "cubic-bezier(0.23, 1, 0.32, 1)",
		quint: "cubic-bezier(0.86, 0, 0.07, 1)",
		"expo-in": "cubic-bezier(0.95, 0.05, 0.795, 0.035)",
		"expo-out": "cubic-bezier(0.19, 1, 0.22, 1)",
		expo: "cubic-bezier(1, 0, 0, 1)",
		"circ-in": "cubic-bezier(0.6, 0.04, 0.98, 0.335)",
		"circ-out": "cubic-bezier(0.075, 0.82, 0.165, 1)",
		circ: "cubic-bezier(0.785, 0.135, 0.15, 0.86)",
		"back-in": "cubic-bezier(0.6, -0.28, 0.735, 0.045)",
		"back-out": "cubic-bezier(0.175, 0.885, 0.32, 1.275)",
		back: "cubic-bezier(0.68, -0.55, 0.265, 1.55)"
	
	}
};
const breakpoints = {
	xs: '(min-width: 480px)',
	sm: '(min-width: 640px)',
	md: '(min-width: 768px)',
	lg: '(min-width: 1024px)',
	xl: '(min-width: 1280px)',
	
	'not-xs': '(max-width: 479px)',
	'not-sm': '(max-width: 639px)',
	'not-md': '(max-width: 767px)',
	'not-lg': '(max-width: 1023px)',
	'not-xl': '(max-width: 1279px)'
};

const materialColors = {
	red: {
		50: "#ffebee",
		100: "#ffcdd2",
		200: "#ef9a9a",
		300: "#e57373",
		400: "#ef5350",
		500: "#f44336",
		600: "#e53935",
		700: "#d32f2f",
		800: "#c62828",
		900: "#b71c1c",
		a100: "#ff8a80",
		a200: "#ff5252",
		a400: "#ff1744",
		a700: "#d50000"
	},
	pink: {
		50: "#fce4ec",
		100: "#f8bbd0",
		200: "#f48fb1",
		300: "#f06292",
		400: "#ec407a",
		500: "#e91e63",
		600: "#d81b60",
		700: "#c2185b",
		800: "#ad1457",
		900: "#880e4f",
		a100: "#ff80ab",
		a200: "#ff4081",
		a400: "#f50057",
		a700: "#c51162"
	},
	purple: {
		50: "#f3e5f5",
		100: "#e1bee7",
		200: "#ce93d8",
		300: "#ba68c8",
		400: "#ab47bc",
		500: "#9c27b0",
		600: "#8e24aa",
		700: "#7b1fa2",
		800: "#6a1b9a",
		900: "#4a148c",
		a100: "#ea80fc",
		a200: "#e040fb",
		a400: "#d500f9",
		a700: "#aa00ff"
	},
	deeppurple: {
		50: "#ede7f6",
		100: "#d1c4e9",
		200: "#b39ddb",
		300: "#9575cd",
		400: "#7e57c2",
		500: "#673ab7",
		600: "#5e35b1",
		700: "#512da8",
		800: "#4527a0",
		900: "#311b92",
		a100: "#b388ff",
		a200: "#7c4dff",
		a400: "#651fff",
		a700: "#6200ea"
	},
	indigo: {
		50: "#e8eaf6",
		100: "#c5cae9",
		200: "#9fa8da",
		300: "#7986cb",
		400: "#5c6bc0",
		500: "#3f51b5",
		600: "#3949ab",
		700: "#303f9f",
		800: "#283593",
		900: "#1a237e",
		a100: "#8c9eff",
		a200: "#536dfe",
		a400: "#3d5afe",
		a700: "#304ffe"
	},
	blue: {
		50: "#e3f2fd",
		100: "#bbdefb",
		200: "#90caf9",
		300: "#64b5f6",
		400: "#42a5f5",
		500: "#2196f3",
		600: "#1e88e5",
		700: "#1976d2",
		800: "#1565c0",
		900: "#0d47a1",
		a100: "#82b1ff",
		a200: "#448aff",
		a400: "#2979ff",
		a700: "#2962ff"
	},
	lightblue: {
		50: "#e1f5fe",
		100: "#b3e5fc",
		200: "#81d4fa",
		300: "#4fc3f7",
		400: "#29b6f6",
		500: "#03a9f4",
		600: "#039be5",
		700: "#0288d1",
		800: "#0277bd",
		900: "#01579b",
		a100: "#80d8ff",
		a200: "#40c4ff",
		a400: "#00b0ff",
		a700: "#0091ea"
	},
	cyan: {
		50: "#e0f7fa",
		100: "#b2ebf2",
		200: "#80deea",
		300: "#4dd0e1",
		400: "#26c6da",
		500: "#00bcd4",
		600: "#00acc1",
		700: "#0097a7",
		800: "#00838f",
		900: "#006064",
		a100: "#84ffff",
		a200: "#18ffff",
		a400: "#00e5ff",
		a700: "#00b8d4"
	},
	teal: {
		50: "#e0f2f1",
		100: "#b2dfdb",
		200: "#80cbc4",
		300: "#4db6ac",
		400: "#26a69a",
		500: "#009688",
		600: "#00897b",
		700: "#00796b",
		800: "#00695c",
		900: "#004d40",
		a100: "#a7ffeb",
		a200: "#64ffda",
		a400: "#1de9b6",
		a700: "#00bfa5"
	},
	green: {
		50: "#e8f5e9",
		100: "#c8e6c9",
		200: "#a5d6a7",
		300: "#81c784",
		400: "#66bb6a",
		500: "#4caf50",
		600: "#43a047",
		700: "#388e3c",
		800: "#2e7d32",
		900: "#1b5e20",
		a100: "#b9f6ca",
		a200: "#69f0ae",
		a400: "#00e676",
		a700: "#00c853"
	},
	lightgreen: {
		50: "#f1f8e9",
		100: "#dcedc8",
		200: "#c5e1a5",
		300: "#aed581",
		400: "#9ccc65",
		500: "#8bc34a",
		600: "#7cb342",
		700: "#689f38",
		800: "#558b2f",
		900: "#33691e",
		a100: "#ccff90",
		a200: "#b2ff59",
		a400: "#76ff03",
		a700: "#64dd17"
	},
	lime: {
		50: "#f9fbe7",
		100: "#f0f4c3",
		200: "#e6ee9c",
		300: "#dce775",
		400: "#d4e157",
		500: "#cddc39",
		600: "#c0ca33",
		700: "#afb42b",
		800: "#9e9d24",
		900: "#827717",
		a100: "#f4ff81",
		a200: "#eeff41",
		a400: "#c6ff00",
		a700: "#aeea00"
	},
	yellow: {
		50: "#fffde7",
		100: "#fff9c4",
		200: "#fff59d",
		300: "#fff176",
		400: "#ffee58",
		500: "#ffeb3b",
		600: "#fdd835",
		700: "#fbc02d",
		800: "#f9a825",
		900: "#f57f17",
		a100: "#ffff8d",
		a200: "#ffff00",
		a400: "#ffea00",
		a700: "#ffd600"
	},
	amber: {
		50: "#fff8e1",
		100: "#ffecb3",
		200: "#ffe082",
		300: "#ffd54f",
		400: "#ffca28",
		500: "#ffc107",
		600: "#ffb300",
		700: "#ffa000",
		800: "#ff8f00",
		900: "#ff6f00",
		a100: "#ffe57f",
		a200: "#ffd740",
		a400: "#ffc400",
		a700: "#ffab00"
	},
	orange: {
		50: "#fff3e0",
		100: "#ffe0b2",
		200: "#ffcc80",
		300: "#ffb74d",
		400: "#ffa726",
		500: "#ff9800",
		600: "#fb8c00",
		700: "#f57c00",
		800: "#ef6c00",
		900: "#e65100",
		a100: "#ffd180",
		a200: "#ffab40",
		a400: "#ff9100",
		a700: "#ff6d00"
	},
	deeporange: {
		50: "#fbe9e7",
		100: "#ffccbc",
		200: "#ffab91",
		300: "#ff8a65",
		400: "#ff7043",
		500: "#ff5722",
		600: "#f4511e",
		700: "#e64a19",
		800: "#d84315",
		900: "#bf360c",
		a100: "#ff9e80",
		a200: "#ff6e40",
		a400: "#ff3d00",
		a700: "#dd2c00"
	},
	brown: {
		50: "#efebe9",
		100: "#d7ccc8",
		200: "#bcaaa4",
		300: "#a1887f",
		400: "#8d6e63",
		500: "#795548",
		600: "#6d4c41",
		700: "#5d4037",
		800: "#4e342e",
		900: "#3e2723"
	},
	grey: {
		50: "#fafafa",
		100: "#f5f5f5",
		200: "#eeeeee",
		300: "#e0e0e0",
		400: "#bdbdbd",
		500: "#9e9e9e",
		600: "#757575",
		700: "#616161",
		800: "#424242",
		900: "#212121"
	},
	bluegrey: {
		50: "#eceff1",
		100: "#cfd8dc",
		200: "#b0bec5",
		300: "#90a4ae",
		400: "#78909c",
		500: "#607d8b",
		600: "#546e7a",
		700: "#455a64",
		800: "#37474f",
		900: "#263238"
	}
};

const colors = {
	gray: {
		100: '#f7fafc',
		200: '#edf2f7',
		300: '#e2e8f0',
		400: '#cbd5e0',
		500: '#a0aec0',
		600: '#718096',
		700: '#4a5568',
		800: '#2d3748',
		900: '#1a202c'
	},
	grey: {
		100: 'gray100',
		200: 'gray200',
		300: 'gray300',
		400: 'gray400',
		500: 'gray500',
		600: 'gray600',
		700: 'gray700',
		800: 'gray800',
		900: 'gray900'
	},
	red: {
		100: '#fff5f5',
		200: '#fed7d7',
		300: '#feb2b2',
		400: '#fc8181',
		500: '#f56565',
		600: '#e53e3e',
		700: '#c53030',
		800: '#9b2c2c',
		900: '#742a2a'
	},
	orange: {
		100: '#fffaf0',
		200: '#feebc8',
		300: '#fbd38d',
		400: '#f6ad55',
		500: '#ed8936',
		600: '#dd6b20',
		700: '#c05621',
		800: '#9c4221',
		900: '#7b341e'
	},
	yellow: {
		100: '#fffff0',
		200: '#fefcbf',
		300: '#faf089',
		400: '#f6e05e',
		500: '#ecc94b',
		600: '#d69e2e',
		700: '#b7791f',
		800: '#975a16',
		900: '#744210'
	},
	green: {
		100: '#f0fff4',
		200: '#c6f6d5',
		300: '#9ae6b4',
		400: '#68d391',
		500: '#48bb78',
		600: '#38a169',
		700: '#2f855a',
		800: '#276749',
		900: '#22543d'
	},
	teal: {
		100: '#e6fffa',
		200: '#b2f5ea',
		300: '#81e6d9',
		400: '#4fd1c5',
		500: '#38b2ac',
		600: '#319795',
		700: '#2c7a7b',
		800: '#285e61',
		900: '#234e52'
	},
	blue: {
		100: '#ebf8ff',
		200: '#bee3f8',
		300: '#90cdf4',
		400: '#63b3ed',
		500: '#4299e1',
		600: '#3182ce',
		700: '#2b6cb0',
		800: '#2c5282',
		900: '#2a4365'
	},
	indigo: {
		100: '#ebf4ff',
		200: '#c3dafe',
		300: '#a3bffa',
		400: '#7f9cf5',
		500: '#667eea',
		600: '#5a67d8',
		700: '#4c51bf',
		800: '#434190',
		900: '#3c366b'
	},
	purple: {
		100: '#faf5ff',
		200: '#e9d8fd',
		300: '#d6bcfa',
		400: '#b794f4',
		500: '#9f7aea',
		600: '#805ad5',
		700: '#6b46c1',
		800: '#553c9a',
		900: '#44337a'
	},
	pink: {
		100: '#fff5f7',
		200: '#fed7e2',
		300: '#fbb6ce',
		400: '#f687b3',
		500: '#ed64a6',
		600: '#d53f8c',
		700: '#b83280',
		800: '#97266d',
		900: '#702459'
	}
};


/***/ })
/******/ ]);
});