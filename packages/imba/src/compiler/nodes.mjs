import * as __helpers_module_0 from './helpers.mjs';
import * as __constants_module_1 from './constants.mjs';
import * as __fspath_module_2 from 'path';
import * as __conv_module_3 from '../../vendor/colors.js';
import * as __colord_module_4 from './colord.imba';
import * as __errors$_module_5 from './errors.mjs';
import { Token as Token } from './token.mjs';
import { SourceMap as SourceMap } from './sourcemap.mjs';
import * as __imba$_module_6 from './styler.imba';
import * as __imba$_module_7 from '../utils/identifiers.imba';
import * as __Compilation_module_8 from './compilation.imba';
import * as __SourceMapper_module_9 from './sourcemapper.imba';
import { ClassFlags as ClassFlags } from '../imba/runtime.mjs';
import * as __extractGenericNames_module_10 from './utils.imba';
function len$(a){
	return a && (a.len instanceof Function ? a.len() : a.length) || 0;
};
function idx$(a,b){
	return (b && b.indexOf) ? b.indexOf(a) : [].indexOf.call(a,b);
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

function iter$(a){ return a ? (a.toArray ? a.toArray() : a) : []; };
var self = {};
// imba$inlineHelpers=1
// imba$v2=0
// TODO Create Expression - make all expressions inherit from these?

var helpers = __helpers_module_0;
var constants = __constants_module_1;
var fspath = __fspath_module_2;
var conv = __conv_module_3.conv;
var colord = __colord_module_4.colord;

var ImbaParseError = __errors$_module_5.ImbaParseError, ImbaTraverseError = __errors$_module_5.ImbaTraverseError;

var StyleRule = __imba$_module_6.StyleRule, StyleTheme = __imba$_module_6.StyleTheme, Color = __imba$_module_6.Color, StyleSheet = __imba$_module_6.StyleSheet, parseColorString = __imba$_module_6.parseColorString;
var ReservedIdentifierRegex = __imba$_module_7.ReservedIdentifierRegex, InternalPrefixes = __imba$_module_7.InternalPrefixes, toJSIdentifier = __imba$_module_7.toJSIdentifier, toCustomTagIdentifier = __imba$_module_7.toCustomTagIdentifier;
var Compilation = __Compilation_module_8.Compilation;

var SourceMapper = __SourceMapper_module_9.SourceMapper;


var extractGenericNames = __extractGenericNames_module_10.extractGenericNames;

function MappedString(value,source){
	this._value = value;
	this._source = source;
};

MappedString.prototype.startLoc = function (){
	return this._source.startLoc();
};

MappedString.prototype.endLoc = function (){
	return this._source.endLoc();
};

MappedString.prototype.toString = function (){
	return this._value;
};

MappedString.prototype.c = function (){
	return M(this._value,this);
};

function Templated(template,options,source){
	this._template = template;
	this._options = options;
	this._source = source;
};

Templated.prototype.c = function (){
	return TPL(this._options,this._template);
};

Templated.prototype.toString = function (){
	return this.c();
};

function InternalName(value,source){
	this._source = source || value;
	if (value.toClassName) {
		value = value.toClassName();
	};
	
	if (value.c instanceof Function) {
		value = value.c({mark: false});
	};
	
	
	value = "Ω" + SourceMapper.strip(value).split(".").join("__");
	let nr = STACK.incr(value);
	if (nr > 1) {
		value += "Ω" + nr;
	};
	this._value = value;
};

InternalName.prototype.startLoc = function (){
	return this._source.startLoc();
};

InternalName.prototype.endLoc = function (){
	return this._source.endLoc();
};

InternalName.prototype.toString = function (){
	return this._value;
};

InternalName.prototype.c = function (){
	return this._value;
};

var TAG_NAMES = constants.TAG_NAMES;
var TAG_GLOBAL_ATTRIBUTES = constants.TAG_GLOBAL_ATTRIBUTES;

var TAG_TYPES = {};
var TAG_ATTRS = {};
var TSC = false;

var USE_SAFE_RENDER_SELF = true;
var IMBA_FIELD_REGISTRY_ENABLED = true;
var IMBA_FIELD_REGISTRY_KEY_PREFIX = '_$INTERNAL$_imbaFieldRegistry';
var IMBA_FIELD_TARGET_KEY_PREFIX = '_$INTERNAL$_imbaFieldTarget';

var CONTEXT = {};

var GLOBAL_INTERFACES = {
	Array: {interface: 'ArrayConstructor'},
	Number: {interface: 'NumberConstructor',thistype: 'number'},
	String: {interface: 'StringConstructor',thistype: 'string'},
	Object: {interface: 'ObjectConstructor'},
	Math: {namespace: 'Math'},
	window: {global: true}
};

var EXT_LOADER_MAP = {
	svg: 'image',
	png: 'image',
	apng: 'image',
	jpg: 'image',
	jpeg: 'image',
	gif: 'image',
	tiff: 'image',
	bmp: 'image'
};

TAG_TYPES.HTML = "a abbr address area article aside audio b base bdi bdo big blockquote body br button canvas caption cite code col colgroup data datalist dd del details dfn div dl dt em embed fieldset figcaption figure footer form h1 h2 h3 h4 h5 h6 head header hr html i iframe img input ins kbd keygen label legend li link main map mark menu menuitem meta meter nav noscript object ol optgroup option output p param pre progress q rp rt ruby s samp script section select small source span strong strike style sub summary sup table tbody td textarea tfoot th thead time title tr track u ul var video wbr".split(" ");

TAG_TYPES.SVG = "circle defs ellipse g line linearGradient mask path pattern polygon polyline radialGradient rect stop svg text tspan".split(" ");

TAG_ATTRS.HTML = "accept accessKey action allowFullScreen allowTransparency alt async autoComplete autoFocus autoPlay cellPadding cellSpacing charSet checked className cols colSpan content contentEditable contextMenu controls coords crossOrigin data dateTime defer dir disabled download draggable encType form formNoValidate frameBorder height hidden href hrefLang htmlFor httpEquiv icon id label lang list loop max maxLength mediaGroup method min multiple muted name noValidate pattern placeholder poster preload radioGroup readOnly rel required role rows rowSpan sandbox scope scrollLeft scrolling scrollTop seamless selected shape size span spellCheck src srcDoc srcSet start step style tabIndex target title type useMap value width wmode";

TAG_ATTRS.SVG = "cx cy d dx dy fill fillOpacity fontFamily fontSize fx fy gradientTransform gradientUnits markerEnd markerMid markerStart offset opacity patternContentUnits patternUnits points preserveAspectRatio r rx ry spreadMethod stopColor stopOpacity stroke strokeDasharray strokeLinecap strokeOpacity strokeWidth textAnchor transform version viewBox x1 x2 x y1 y2 y";

var CUSTOM_EVENTS = {
	intersect: 'events_intersect',
	selection: 'events_selection',
	resize: 'events_resize',
	mutate: 'events_mutate',
	hotkey: 'events_hotkey',
	touch: 'events_touch',
	
	pointer: 'events_pointer',
	pointerdown: 'events_pointer',
	pointermove: 'events_pointer',
	pointerover: 'events_pointer',
	pointerout: 'events_pointer',
	pointerup: 'events_pointer',
	pointercancel: 'events_pointer',
	lostpointercapture: 'events_pointer',
	
	click: 'events_mouse',
	mousedown: 'events_mouse',
	mouseup: 'events_mouse',
	mouseenter: 'events_mouse',
	mouseleave: 'events_mouse',
	mousemove: 'events_mouse',
	mouseout: 'events_mouse',
	mouseover: 'events_mouse',
	mousewheel: 'events_mouse',
	
	keydown: 'events_keyboard',
	keyup: 'events_keyboard',
	keypress: 'events_keyboard'
};

var AST = {};

var TREE_TYPE = {
	DYNAMIC: 1,
	STATIC: 2,
	SINGLE: 3,
	OPTLOOP: 4,
	LOOP: 5
};

var F = {
	TAG_INITED: 2 ** 0,
	TAG_BUILT: 2 ** 1, // available
	TAG_CUSTOM: 2 ** 2, // available
	TAG_AWAKENED: 2 ** 3,
	TAG_MOUNTED: 2 ** 4,
	TAG_SCHEDULE: 2 ** 5, // available
	TAG_SCHEDULED: 2 ** 6,
	TAG_FIRST_CHILD: 2 ** 7,
	TAG_LAST_CHILD: 2 ** 8,
	TAG_HAS_DYNAMIC_FLAGS: 2 ** 9,
	TAG_HAS_BRANCHES: 2 ** 10,
	TAG_HAS_LOOPS: 2 ** 11,
	TAG_HAS_DYNAMIC_CHILDREN: 2 ** 12,
	TAG_IN_BRANCH: 2 ** 13,
	TAG_BIND_MODEL: 2 ** 14,
	TAG_INDEXED: 2 ** 15, // not used
	TAG_KEYED: 2 ** 16, // not used
	
	EL_INITED: 2 ** 0,
	EL_HYDRATED: 2 ** 1,
	EL_HYDRATING: 2 ** 2,
	EL_AWAKENED: 2 ** 3,
	EL_MOUNTING: 2 ** 4,
	EL_MOUNTED: 2 ** 5,
	EL_SCHEDULE: 2 ** 6, // available
	EL_SCHEDULED: 2 ** 7,
	EL_RENDERING: 2 ** 8,
	EL_RENDERED: 2 ** 9,
	EL_SSR: 2 ** 10,
	EL_TRACKED: 2 ** 11, // emit mount/unmount events
	EL_SUSPENDED: 2 ** 12, // block commit from rendering
	EL_UNRENDERED: 2 ** 13,
	EL_MOVING: 2 ** 14,
	
	// render marks
	DIFF_BUILT: 2 ** 0,
	DIFF_FLAGS: 2 ** 1,
	DIFF_ATTRS: 2 ** 2,
	DIFF_CHILDREN: 2 ** 3,
	DIFF_MODIFIERS: 2 ** 4,
	DIFF_INLINE: 2 ** 5
};

var NESTED_TPL_REGEX = /@\{(@(\!?\w+)\?)?([^{}]*(:?\{([^{}]*(:?\{[^{}]*\}[^{}]*)*)\}[^{}]*)*)\}/g;

var TPL = function(vars,string,o,d) {
	if(o === undefined) o = {};
	if(d === undefined) d = 0;
	return STACK.call({template: string},function() {
		string = string.replace(/\%/g,'@');
		
		// lazy to use regex but it works for these simple templates
		string = string.replace(NESTED_TPL_REGEX,function(m,g,cond,subtpl) {
			if (cond) {
				if (cond[0] == '!') {
					if (vars[cond.slice(1)]) { return 'εε' };
				} else {
					if (!vars[cond]) { return 'εε' };
				};
			};
			
			let o = {};
			let sub = TPL(vars,subtpl,o,d + 1);
			return (o.replaced || cond) ? sub : 'εε';
		});
		
		string = string.replace(/\@([\w\-]+)\|?/g,function(m,k) {
			if (k == 'ts-ignore') {
				return '@ts-ignore';
			};
			
			let v = vars[k];
			
			if (v === true) {
				o.replaced = true;
				return k;
			};
			
			if (v) { v = M(v) };
			if (v) { o.replaced = true };
			
			return v || 'εε';
		});
		
		string = string.replace(/(\n\s*)(εε)\s*(?=\n)/g,''); // .replace(/εε/g,'')
		string = string.replace(/(^|\s)(εε[ ]?)*/mg,'$1').replace(/εε/g,'');
		string = string.replace(/(^[ ]+)/mg,'');
		if (d == 0) { string = string.trim() };
		return string;
	});
};

var DECLARE = function(node,keyword) {
	if (!Compilation.current.tsc) {
		return LIT('');
	};
	
	return node.set({declareOnly: keyword});
};

var GLOBAL = function(node,keyword) {
	return node.set({'global': keyword});
};

var SETTYPE = function(node,type,ctx) {
	// dont even include any types when not in TSC mode
	if (!(!!Compilation.current.tsc)) {
		return node;
	};
	// console.log "set datatype {node} {type:constructor:name}",!!Compilation:current:tsc
	if (type instanceof Generics) {
		node.set({generics: type});
		return node;
		// return node.set(generics: type)
	};
	
	return node.set({datatype: type});
};


// Helpers for operators
var OP = function(op,l,r) {
	var o = String(op);
	
	switch (o) {
		case '.': 
		case '?.': {
			if ((l instanceof Super) && !l._member) {
				
				(l._member = r,l);
				return l;
			};
			
			if ((typeof r=='string'||r instanceof String)) { r = new Identifier(r) };
			// r = r.value if r isa VarOrAccess
			
			// if r.@value and r.@value.@value == 'new'
			//	# TODO remove support for this
			//	return New.new(l).set(keyword: r)
			
			return new Access(op,l,r);
			break;
		}
		case '=': {
			return new Assign(op,l,r);
			break;
		}
		case '~=': {
			return OP('&=',l,OP('~',r));
			break;
		}
		case '||=': 
		case '&&=': 
		case '??=': {
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
		case 'not': 
		case '!!': {
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

var PATHIFY = function(val) {
	// console.log "PATHIFY {val}"
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
		let left = val._left;
		let right = (val._right instanceof Index) ? val._right.value() : val._right;
		
		if (left instanceof VarOrAccess) {
			left = left._variable || left.value();
		};
		
		if (right instanceof VarOrAccess) {
			right = right._variable || right.value();
		};
		
		if (val instanceof IvarAccess) {
			left || (left = val.scope__().context());
		};
		
		if (right instanceof SymbolIdentifier) {
			true;
		} else if (right instanceof Identifier) {
			right = helpers.singlequote(String(right.js()));
			right = new Str(right);
		};
		
		return [left,right];
	};
	
	return val;
};

var OPTS = {};
var ROOT = null;

var NODES = [];

var C = function(node,opts) {
	return (typeof node == 'string' || typeof node == 'number') ? node : node.c(opts);
};

var MLOC = function(a,b) {
	if (b == undefined) { b = a };
	
	return {
		startLoc: function() { return a; },
		endLoc: function() { return b; }
	};
};

var MPREV = [-1,-1,-1];
var M = function(val,mark,o) {
	if (mark == undefined) {
		mark = val;
		o || (o = {mark: false});
	};
	
	if (mark && mark.startLoc) {
		val = C(val,o);
		
		// what if the value itself creates a location?
		let ref = STACK.incr('sourcePair');
		let start = mark.startLoc();
		let end = mark.endLoc();
		
		let m0 = '';
		let m1 = '';
		
		if (start === MPREV[0] && end === MPREV[1] && ref == (MPREV[2] + 1) && val.startsWith('/*%')) {
			if (true) { // val.indexOf("/*%{start}|{MPREV[2]}") >= 0 and false
				STACK.decr('sourcePair');
				// only if the value contains this, no?
				return val;
			};
		};
		
		if (start == 0 || start > 0) {
			m0 = (end >= start) ? (("/*%" + start + "|" + ref + "$*/")) : (("/*%" + start + "$*/"));
		};
		
		if (end == 0 || end > 0) {
			m1 = (start >= 0) ? (("/*%" + end + "|" + ref + "$*/")) : (("/*%" + end + "$*/"));
		};
		
		MPREV = [start,end,ref];
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
	typ || (typ = (item.datatype instanceof Function) && item.datatype());
	
	if (typ) {
		let str = C(typ);
		if (format == 'jsdoc') {
			return ("/** @type \{" + M(str,typ) + "\} */");
		} else {
			return (":" + M(str,typ));
		};
	} else {
		return "";
	};
};

var TYPED = function(item,typ) {
	if (typ) {
		return ("" + C(item) + ":" + C(typ));
	} else {
		return C(item);
	};
};


var LIT = function(val,src) {
	if (src) { return new MappedString(val,src) };
	return (val instanceof RawScript) ? val : new RawScript(val);
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

var IF = function(cond,body,alt,o) {
	if(o === undefined) o = {};
	var node = new If(cond,body,o);
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

var FN = function(pars,body,scope) {
	let fn = new Func(pars,body);
	if (scope) {
		fn._scope._systemscope = scope;
	};
	return fn;
};

var METH = function(pars,body) {
	return new ClosedFunc(pars,body);
};

var CALL = function(callee,pars) {
	// possibly return instead(!)
	if(pars === undefined) pars = [];
	return new Call(callee,pars);
};

var STDCALL = function(name,pars) {
	if(pars === undefined) pars = [];
	return CALL(STACK.corelib()[name],pars);
};

var IIFE = function(body) {
	// possibly return instead(!)
	return new IifeFunc([],body);
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

var SPLAT = function(value) {
	return new Splat(value);
	// if value isa Assign
	//	value.left = Splat.new(value.left)
	//	return value
	// else
	//	Splat.new(value)
};

var SEMICOLON_TEST = /;(\s*\/\/.*)?[\n\s\t]*$/;
var RESERVED_TEST = /^(default|char|for)$/;

// captures error from parser
var parseError = self.parseError = function (str,o){
	var err = Compilation.error({
		category: 'parser',
		severity: 'error',
		offset: o.offset,
		length: o.length,
		message: str
	});
	
	return err.raise();
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
		o = '{ ';
		for (let v, i = 0, keys = Object.keys(item), l = keys.length, k; i < l; i++){
			// maybe quote?
			k = keys[i];v = item[k];o += ("" + k + ": " + AST.compileRaw(v) + ",");
		};
		o = o.slice(0,-1) + ' }';
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
	return helpers.symbolize(String(obj),STACK);
};

AST.cary = function (ary,params){
	if(params === undefined) params = null;
	return ary.map(function(v) {
		if (typeof v == 'string') {
			return v;
		} else if (v && v.c) {
			return params ? v.c(params) : v.c();
		} else {
			// console.warn 'could not compile',v
			return String(v);
		};
	});
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
	// really? Require the compiler, not this
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
	
	nr += 30;
	
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
	
	// the first newline should not be indented?
	
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


Stack.prototype.nodes = function(v){ return this._nodes; }
Stack.prototype.root = function(v){ return this._root; }
Stack.prototype.meta = function(v){ return this._meta; }
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
	this._tag = null;
	this._sourceId = null;
	this._symbols = {};
	this._fieldRegistryEntries = [];
	this._css = new StyleSheet(this);
	this._theme = null;
	this._meta = {};
	// @css = ''
	this._runtime;
	MPREV = [-1,-1,-1];
	return this;
};

Stack.prototype.runtime = function (){
	return this._root.runtime();
};

Stack.prototype.corelib = function (){
	return this._root.importProxy('core','imba/runtime','').proxy();
};

Stack.prototype.cssns = function (){
	return this._root.cssns();
};

Stack.prototype.use = function (item){
	return this._root.use(item);
};

Stack.prototype.addFieldRegistryEntry = function (entry){
	this._fieldRegistryEntries || (this._fieldRegistryEntries = []);
	this._fieldRegistryEntries.push(entry);
	return this;
};

Stack.prototype.fieldRegistryDeclaration = function (){
	if (!IMBA_FIELD_REGISTRY_ENABLED) { return "" };
	if (!(this._fieldRegistryEntries && this._fieldRegistryEntries.length)) { return "" };
	
	let lines = [
		'declare global {',
		'\tinterface ImbaFieldRegistry {'
	];
	
	for (let i = 0, items = iter$(this._fieldRegistryEntries), len = items.length, entry; i < len; i++) {
		entry = items[i];
		lines.push("\t\t" + JSON.stringify(entry.key) + ': {');
		lines.push("\t\t\towner: " + entry.owner);
		lines.push("\t\t\townerType: typeof " + entry.ownerType);
		lines.push("\t\t\tfield: " + JSON.stringify(entry.field));
		lines.push("\t\t\tdecorator: " + JSON.stringify(entry.decorator));
		if (entry.firstArg) {
			lines.push("\t\t\tfirstArg: " + entry.firstArg);
			lines.push("\t\t\tfirstArgType: " + entry.firstArgType);
		};
		lines.push("\t\t\targs: [" + entry.args.join(', ') + ']');
		lines.push('\t\t}');
	};
	
	lines.push('\t}');
	lines.push('}');
	
	for (let i = 0, items = iter$(this._fieldRegistryEntries), len = items.length, entry; i < len; i++) {
		entry = items[i];
		if (entry.firstArgTarget) {
			lines.push(this.fieldRegistryTargetDeclaration(entry,entry.firstArgTarget));
		};
	};
	
	return lines.join("\n");
};

Stack.prototype.fieldRegistryTargetDeclaration = function (entry,target){
	let prop = JSON.stringify(target.key);
	let value = 'ImbaFieldRegistry[' + JSON.stringify(entry.key) + ']';
	let member = 'readonly ' + prop + '?: ' + value;
	
	if (target.module) {
		return [
			'declare module ' + target.module + ' {',
			'\tinterface ' + target.name + ' {',
			'\t\t' + member,
			'\t}',
			'}'
		].join("\n");
	} else if (target.global) {
		return [
			'declare global {',
			'\tinterface ' + target.name + ' {',
			'\t\t' + member,
			'\t}',
			'}'
		].join("\n");
	} else {
		let prefix = target.export ? 'export ' : '';
		return [
			prefix + 'interface ' + target.name + ' {',
			'\t' + member,
			'}'
		].join("\n");
	};
};

Stack.prototype.incr = function (name){
	this._counters[name] || (this._counters[name] = 0);
	return this._counters[name] += 1;
};

Stack.prototype.decr = function (name){
	this._counters[name] || (this._counters[name] = 0);
	return this._counters[name] -= 1;
};

Stack.prototype.strip = function (val){
	return SourceMapper.strip(val);
};

Stack.prototype.generateId = function (ns){
	if(ns === undefined) ns = 'oid';
	return AST.counterToShortRef(STACK.tsc() ? 1 : STACK.incr(ns));
	return AST.counterToShortRef(STACK.incr(ns));
};

Stack.prototype.getSymbol = function (ref,alias,name){
	if(alias === undefined) alias = null;
	if(name === undefined) name = '';
	let key = ref || (STACK.tsc() ? 1 : this.incr('symbols'));
	// ref ||= "" + incr('symbols')
	// Belongs in root
	return this._symbols[key] || (this._symbols[key] = this._root.declare((alias || ref),LIT(("Symbol(" + (name ? helpers.singlequote(name) : '') + ")")),{system: true,alias: (alias || ref)}).resolve().c());
};


Stack.prototype.symbolFor = function (name){
	return this._root.symbolRef(name);
};

Stack.prototype.imbaSymbol = function (name){
	return STACK.isStdLib() ? this.symbolFor('#' + name) : this.corelib()[name + '$'];
};

Stack.prototype.toInternalName = function (name){
	let base = name;
	if (name.c instanceof Function) {
		name = name.c();
	};
	
	let str = "Ω" + this.strip(name).split(".").join("__");
	let nr = this.incr(str);
	if (nr > 1) {
		str += "Ω" + nr;
	};
	
	
	// Include something for sourcemapping?
	return str;
};

Stack.prototype.toInternalClassName = function (name){
	
	if (name.toClassName) {
		name = name.toClassName();
	} else if (name.c instanceof Function) {
		name = name.c();
	};
	
	let stripped = this.strip(name);
	let str = "Ω" + this.strip(name).split(".").join("__");
	let nr = this.incr(str);
	if (nr > 1) {
		str += "Ω" + nr;
	};
	
	return str;
};

Stack.prototype.domCall = function (name){
	if (true) {
		name = {
			start: 'beforeVisit',
			end: 'afterVisit',
			open: 'beforeReconcile',
			close: 'afterReconcile',
			insert: 'placeChild'
		}[name] || name;
		
		return ("[" + this.symbolFor('#' + name) + "]");
	};
};

Stack.prototype.sourceId = function (){
	if ((this._sourceId || (this._sourceId = this._options.sourceId))) { return this._sourceId };
	let src = this.sourcePath();
	let cwd = this.cwd();
	// relativize the cwd thing
	// TODO rename+document this option. sourceBase or sourceRoot?
	if (this._options.path && cwd) {
		src = this._options.path.relative(cwd,src);
	};
	
	if (!src) {
		throw new Error("Include sourceId or sourcePath in options compile(code,options)");
	};
	
	this._sourceId = helpers.identifierForPath(src);
	return this._sourceId;
};

Stack.prototype.theme = function (){
	return this._theme || (this._theme = StyleTheme.wrap(this._options.config));
};

Stack.prototype.set = function (obj){
	this._options || (this._options = {});
	for (let v, i = 0, keys = Object.keys(obj), l = keys.length, k; i < l; i++){
		k = keys[i];v = obj[k];this._options[k] = v;
	};
	return this;
};

// get and set
Stack.prototype.option = function (key,val){
	if (val != undefined) {
		this._options || (this._options = {});
		this._options[key] = val;
		return this;
	};
	
	return this._options && this._options[key];
};

Stack.prototype.platform = function (){
	return this._options.platform || 'browser';
};

Stack.prototype.mode = function (){
	return this._options.mode || 'production';
};

Stack.prototype.format = function (){
	return this._options.format;
};

Stack.prototype.sourcePath = function (){
	return this._options.sourcePath;
};

Stack.prototype.imbaPath = function (){
	return this._options.imbaPath;
};

Stack.prototype.resolveColors = function (){
	return this._options.styles !== 'extern' || this._options.resolveColors;
};

Stack.prototype.config = function (){
	return this._options.config || {};
};

Stack.prototype.cwd = function (){
	return this.config() && this.config().cwd;
};

Stack.prototype.tsc = function (){
	return this.platform() == 'tsc' || this._options.tsc;
};

Stack.prototype.hmr = function (){
	return !!this._options.hmr;
};

Stack.prototype.isStdLib = function (){
	return !!this._options.stdlib;
};

Stack.prototype.isWeb = function (){
	return this.platform() == 'browser' || this.platform() == 'web';
};

Stack.prototype.isWorker = function (){
	return this.platform() == 'worker';
};

Stack.prototype.isNode = function (){
	return this.platform() == 'node';
};

Stack.prototype.isDev = function (){
	return this.mode() == 'development';
};

Stack.prototype.isProd = function (){
	return this.mode() == 'production';
};

Stack.prototype.isVite = function (){
	return !!this._options.vite;
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
	
	if (key == 'VITE') {
		this._meta.universal = false;
		return this.isVite();
	} else if (key == 'WEB' || key == 'BROWSER') {
		this._meta.universal = false;
		return this.isWeb();
	} else if (key == 'NODE') {
		this._meta.universal = false;
		return this.isNode();
	} else if (key == 'DEV') {
		return this.isDev();
	} else if (key == 'PROD') {
		return this.isProd();
	} else if (key == 'NODEISH') {
		this._meta.universal = false;
		return this.isNode() || !(!(this.tsc()));
	} else if (key == 'TSC') {
		return this.tsc();
	} else if (key == 'WORKER') {
		this._meta.universal = false;
		return this.platform() && this.platform().indexOf('worker') >= 0;
	} else if (key == 'WEBWORKER') {
		this._meta.universal = false;
		return this.platform() == 'webworker';
	} else if (key == 'HMR') {
		return !!this._options.hmr;
	};
	
	if (e = this._options.env) {
		if (e.hasOwnProperty(key)) {
			return e[key];
		} else if (e.hasOwnProperty(key.toLowerCase())) {
			return e[key.toLowerCase()];
		};
	};
	
	if (true && typeof process != 'undefined' && process.env) {
		val = process.env[key.toUpperCase()];
		if (val != undefined) {
			return val;
		};
		return null;
	};
	
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
	// not sure if we have already defined a scope?
	return this;
};

Stack.prototype.pop = function (node){
	this._nodes.pop(); // (node)
	return this;
};

Stack.prototype.call = function (ctx,cb){
	let prev = CONTEXT;
	CONTEXT = ctx;
	let res = cb();
	CONTEXT = prev;
	return res;
};

Object.defineProperty(Stack.prototype,'is_top_level',{get: function(){
	return this._nodes.length < 4;
}, configurable: true});

Stack.prototype.parent = function (){
	return this._nodes[this._nodes.length - 2];
};

Stack.prototype.current = function (){
	return this._nodes[this._nodes.length - 1];
};

Stack.prototype.indexOf = function (test){
	let res = this.up(test);
	return res ? this._nodes.indexOf(res) : (-1);
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

Stack.prototype.parents = function (test){
	test || (test = function(v) { return !(v instanceof VarOrAccess); });
	if (test.prototype instanceof Node) {
		let cls = test;
		test = function(v) { return v instanceof cls; };
	};
	
	return this._nodes.filter(test);
};

Stack.prototype.relative = function (node,offset){
	if(offset === undefined) offset = 0;
	var idx = this._nodes.indexOf(node);
	return (idx >= 0) ? this._nodes[idx + offset] : null;
};

Stack.prototype.scope = function (lvl){
	if(lvl === undefined) lvl = 0;
	if (this._withScope) { return this._withScope };
	var i = this._nodes.length - 1 - lvl;
	while (i >= 0){
		var node = this._nodes[i];
		if (node._scope) { return node._scope };
		i -= 1;
	};
	return null;
};

Stack.prototype.withScope = function (scop,cb){
	let prev = this._withScope;
	this._withScope = scop;
	cb();
	this._withScope = prev;
	return;
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

Stack.prototype.closure = function (){
	return this.scope().closure();
};

Stack.prototype.closures = function (){
	return this._scopes.filter(function(scope) { return scope.closure() == scope; });
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

Stack.prototype.prependInBlock = function (node){
	return this.block().add([node,BR],{before: this.blockpart()});
};

Stack.prototype.lastImport = function (){
	let scopes = this._scopes;
	for (let i = 0, items = iter$(scopes), len = items.length, scope; i < len; i++) {
		scope = items[i];
		if (scope._lastImport) {
			return scope._lastImport;
		};
	};
	return null;
};

Stack.prototype.isExpression = function (){
	var i = this._nodes.length - 1;
	while (i >= 0){
		var node = this._nodes[i];
		// why are we not using isExpression here as well?
		if ((node instanceof Code) || (node instanceof Loop) || node.isStatementLike()) {
			return false;
		};
		if (node.isExpression()) {
			return true;
		};
		// probably not the right test - need to be more explicit
		i -= 1;
	};
	return false;
};

Stack.prototype.toString = function (){
	return ("Stack(" + this._nodes.join(" -> ") + ")");
};

Stack.prototype.scoping = function (){
	return this._nodes.filter(function(n) { return n._scope; }).map(function(n) { return n._scope; });
};

Stack.prototype.currentRegion = function (){
	let l = this._nodes.length;
	let node = this._nodes[--l];
	return node && [node.startLoc(),node.endLoc()];
};

// Lots of globals -- really need to deal with one stack per file / context
var STACK = new Stack();

// use a bitmask for these

function Node(){
	this.setup();
	this;
};



// reference to the script object this node
// is part of
Node.prototype.script = function (){
	// TODO don't use global state for this
	return Compilation.current;
};

Node.prototype.safechain = function (){
	return false;
};

Node.prototype.addEnv = function (env){
	this._envs || (this._envs = []);
	this._envs.push(new EnvFlag(env));
	return this;
};

Node.prototype.isExcluded = function (){
	return false;
};

Node.prototype.sourcecode = function (){
	let src = STACK.SOURCECODE;
	let start = this._startLoc;
	let end = this._endLoc;
	return src.slice(start,end);
};

Node.prototype.oid = function (){
	return this._oid || (this._oid = STACK.generateId(''));
};

Node.prototype.tid = function (){
	return this._tid || (this._tid = STACK.generateId('tag'));
};

Node.prototype.osym = function (ns,name){
	if(ns === undefined) ns = '';
	if(name === undefined) name = '';
	return STACK.getSymbol(this.oid() + ns,null,name);
};

Node.prototype.symbolRef = function (name){
	return STACK.root().symbolRef(name);
};

Node.prototype.domCall = function (name){
	return STACK.domCall(name);
};

// get global symbol with name
Node.prototype.gsym = function (name){
	return STACK.root().symbolRef(name);
};

Node.prototype.sourceId = function (){
	return STACK.sourceId();
};

// shorthand for the self context for a node
Node.prototype.slf = function (){
	return this.scope__().context();
};

Node.prototype.p = function (){
	// allow controlling this from CLI
	if (STACK._loglevel > 0) {
		console.log.apply(console,arguments);
	};
	return this;
};

Node.prototype.runtime = function (){
	return STACK.runtime();
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

// get and set
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

Node.prototype.setDatatype = function (val){
	this.option('datatype',val);
	return this;
};

Node.prototype.configure = function (obj){
	return this.set(obj);
};

Node.prototype.region = function (){
	return [0,0];
};

Node.prototype.loc = function (){
	return [this._startLoc || 0,this._endLoc || 0];
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

Node.prototype.isGlobal = function (name){
	return false;
};

Node.prototype.isConstant = function (){
	return false;
};

// should rather do traversals
// o = {}, up, key, index
Node.prototype.traverse = function (o){
	if (this._traversed) {
		return this;
	};
	// NODES.push(self)
	this._traversed = true;
	let prev;
	if (o) {
		prev = STACK._state;
		(STACK._state = o,STACK);
	};
	STACK.push(this);
	this.visit(STACK,STACK._state);
	STACK.pop(this);
	if (o) {
		(STACK._state = prev,STACK);
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

// swallow might be better name
Node.prototype.consume = function (node){
	if (node instanceof TagLike) {
		return node.register(this);
	};
	
	if (node instanceof PushAssign) {
		node.register(this);
		return new PushAssign(node.op(),node._left,this);
	};
	
	if (node instanceof Assign) {
		// node.right = self
		return OP(node.op(),node._left,this);
	} else if (node instanceof VarDeclaration) {
		return OP('=',node._left,this);
	} else if (node instanceof Op) {
		return OP(node.op(),node._left,this);
	} else if (node instanceof Return) {
		return new Return(this);
	} else if (node == NumberLike) {
		return new NumberLike(this);
	} else if (node instanceof Util.Is) {
		return node.clone(this);
	} else if (node instanceof AmperWalker) {
		node.test(this);
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

Node.prototype.isStatementLike = function (){
	return false;
};

Node.prototype.isRuntimeReference = function (){
	return false;
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

Node.prototype.unwrappedNode = function (){
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
	
	// this is a _BIG_ hack
	if (b instanceof Array) {
		this.add(b[0]);
		b = b[1];
	};
	
	// if indent and indent.match(/\:/)
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

// the "name-suggestion" for nodes if they need to be cached
Node.prototype.alias = function (){
	return null;
};

// Shorthand for outputting sourcemapped keywords where it looks
// for an option with the same name in options
Node.prototype.mo = function (val,optional){
	if(optional === undefined) optional = false;
	let src = this._options && this._options[val];
	return (optional && !src) ? '' : M(val,src);
};

Node.prototype.warn = function (message,opts){
	if(opts === undefined) opts = {};
	let loc = opts.loc || this.loc() || [0,0];
	
	if (loc instanceof Node) {
		loc = [loc.startLoc(),loc.endLoc()];
	};
	
	if (loc instanceof Token) {
		loc = loc.loc();
	};
	
	// if loc[0] == 0 and loc[1] == 0
	
	// console.log 'loc warn',loc,script.rangeAt(loc[0],loc[1])
	return this.script().addDiagnostic(opts.severity || 'warning',{
		message: message,
		range: this.script().rangeAt(loc[0],loc[1])
	});
	
	// Compilation.warn(
	//	severity: opts:severity or 'warning'
	//	message: message
	//	offset: (loc ? loc[0] : 0)
	//	length: (loc ? (loc[1] - loc[0]) : 0)
	// )
};

Node.prototype.error = function (message,opts){
	if(opts === undefined) opts = {};
	opts.severity = 'error';
	return this.warn(message,opts);
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
	
	// should move this somewhere else really
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
		if ((par instanceof Access) || (par instanceof Op)) { out = '(' + out + ')' }; // others? #
		ch.cached = true;
	};
	
	if (OPTS.sourcemap && (!o || o.mark !== false)) {
		out = M(out,this);
	};
	return out;
};

Node.prototype.c_cached = function (cache){
	cache.lookups++;
	if (cache.uses == cache.lookups) { cache.var.free() };
	return cache.var.c(); // recompile every time??
};

function ValueNode(value){
	this.setup();
	this._value = this.load(value);
};

subclass$(ValueNode,Node);

ValueNode.prototype.value = function(v){ return this._value; }
ValueNode.prototype.setValue = function(v){ this._value = v; return this; };

ValueNode.prototype.startLoc = function (){
	let loc = this._startLoc;
	return (typeof loc == 'number') ? loc : (((this._value && this._value.startLoc) ? this._value.startLoc() : (-1)));
};

ValueNode.prototype.load = function (value){
	return value;
};

ValueNode.prototype.js = function (o){
	return (typeof this._value == 'string') ? this._value : this._value.c();
};

ValueNode.prototype.visit = function (){
	
	if (this._value instanceof Node) { this._value.traverse() }; //  && @value:traverse
	return this;
};

ValueNode.prototype.region = function (){
	return [this._value._loc,this._value._loc + this._value._len];
};

function ValueReferenceNode(value,orig){
	this.setup();
	this._value = value;
	this._orig = orig || value;
};

subclass$(ValueReferenceNode,Node);

ValueReferenceNode.prototype.value = function(v){ return this._value; }
ValueReferenceNode.prototype.setValue = function(v){ this._value = v; return this; };

ValueReferenceNode.prototype.startLoc = function (){
	return this._orig && this._orig.startLoc  &&  this._orig.startLoc();
};

ValueReferenceNode.prototype.endLoc = function (){
	return this._orig && this._orig.endLoc  &&  this._orig.endLoc();
};

ValueReferenceNode.prototype.load = function (value){
	return value;
};

ValueReferenceNode.prototype.js = function (o){
	let res = M(this._value.c({mark: false}),this);
	return res;
};

ValueReferenceNode.prototype.visit = function (){
	if (this._value instanceof Node) { this._value.traverse() }; //  && @value:traverse
	return this;
};

ValueReferenceNode.prototype.region = function (){
	return [this._orig._loc,this._orig._loc + this._orig._len];
};

function ExpressionNode(){ return ValueNode.apply(this,arguments) };

subclass$(ExpressionNode,ValueNode);



function AssertionNode(){ return ValueNode.apply(this,arguments) };

subclass$(AssertionNode,ValueNode);

AssertionNode.prototype.sourceFor = function (node){
	var ary;
	let src = STACK.SOURCECODE;
	var ary = iter$(node.loc());let start = ary[0],end = ary[1];
	return JSON.stringify(src.slice(start,end));
};

AssertionNode.prototype.isInspectableBinary = function (op){
	return (op instanceof Op) && !(op instanceof Access) && !(op instanceof UnaryOp) && !op.isLogical() && !op.isAssignment() && op._left && op._right;
};

AssertionNode.prototype.js = function (o){
	let op = this._value;
	let out = [];
	
	if (op instanceof Assign) {
		let osrc = this.sourceFor(op);
		out.push(("globalThis.IMBA_ASSERT=\{type:'assignment',source:" + osrc + "\}"));
		out.push(op.c(o));
	} else if (this.isInspectableBinary(op)) {
		let l = op._left;
		let r = op._right;
		let osrc = this.sourceFor(op);
		let lsrc = this.sourceFor(l);
		let rsrc = this.sourceFor(r);
		let oval = JSON.stringify(op._op);
		let lval = l.cache().c(o);
		let rval = r.cache().c(o);
		
		out = [
			("source:" + osrc),
			("operator:" + oval),
			("left:\{source:" + lsrc + ",value:" + lval + "\}"),
			("right:\{source:" + rsrc + ",value:" + rval + "\}")
		];
		let meta = out.join(',');
		out = [("globalThis.IMBA_ASSERT=\{type:'binary'," + meta + "\}")];
		out.push(op.c(o));
	} else {
		let osrc = this.sourceFor(op);
		let oval = op.cache().c(o);
		out.push(("globalThis.IMBA_ASSERT=\{type:'expression',source:" + osrc + ",value:" + oval + "\}"));
		out.push(op.c(o));
	};
	return '(' + out.join(',') + ")"; // ,{op.c(o)})
	// "('assert',{super})"
};

function Statement(){ return ValueNode.apply(this,arguments) };

subclass$(Statement,ValueNode);

Statement.prototype.isExpressable = function (){
	return false;
};

function Meta(){ return ValueNode.apply(this,arguments) };

subclass$(Meta,ValueNode);

Meta.prototype.isPrimitive = function (deep){
	return true;
};

function Comment(){ return Meta.apply(this,arguments) };

subclass$(Comment,Meta);

Comment.prototype.visit = function (){
	var block, next;
	if (block = this.up()) {
		var idx = block.indexOf(this) + 1;
		if (block.index(idx) instanceof Terminator) { idx += 1 };
		if (next = block.index(idx)) {
			if (!this.toString().match(/@(overload|ts)\b/)) { next._desc = this };
		};
	};
	return this;
};

Comment.prototype.isMultiline = function (){
	return this._value.type() == 'HERECOMMENT';
};

Comment.prototype.toDoc = function (){
	return helpers.normalizeIndentation("" + this._value._value);
};

Comment.prototype.toJSON = function (){
	return helpers.normalizeIndentation("" + this._value._value);
};

Comment.prototype.toString = function (){
	return this._value._value;
};

Comment.prototype.c = function (o){
	if (STACK.option('comments') == false || this._skip) { return "" };
	var v = this._value._value;
	var out = "";
	
	// Temporary way to support defining raw typescript types in comments.
	// Whenever a multiline comment starts with @ts - just let it through
	// to the output directly.
	if (STACK.tsc() && v.indexOf(' @ts\n') == 0) {
		return v.slice(5);
	};
	
	if (o && o.expression || v.match(/\n/) || this.isMultiline()) {
		v = v.replace(/\*\//g,'\\*\\/').replace(/\/\*/g,'\\/\\*');
		if (v.match(/\@(type|param|satisfies|template)/) || STACK.tsc()) { v = '*' + v };
		
		out += ("/*" + v + "*/");
	} else if (v.match(/\@(type|param|satisfies|template)/)) {
		out += ("/** " + v + " */");
	} else {
		out += ("// " + v);
	};
	
	return out;
};

function Terminator(v){
	this._value = v;
	this;
};

subclass$(Terminator,Meta);

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
	
	if (STACK.tsc()) {
		// make comments significant for tooling
		// temporary hack to work around parsing issue with reference path
		val = val.replace(/\/{3}/g,'~~/~~');
		val = val.replace(/\/\/\s(.*)$/gm,'/** $1 */ ');
		val = val.replace(/\~\~\/\~\~/g,'///');
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

Newline.prototype.c = function (){
	return this._value;
	// M(@value,@value)
};

// weird place?
function Index(){ return ValueNode.apply(this,arguments) };

subclass$(Index,ValueNode);

Index.prototype.startLoc = function (){
	return this._startLoc || this._value && this._value.startLoc  &&  this._value.startLoc();
};

Index.prototype.endLoc = function (){
	return this._endLoc || this._value && this._value.endLoc  &&  this._value.endLoc();
};

Index.prototype.cache = function (o){
	if(o === undefined) o = {};
	return this._value.cache(o);
};

Index.prototype.js = function (o){
	return this._value.c();
};

function ListNode(list){
	this.setup();
	this._nodes = this.load((list == null) ? [] : list);
	this._indentation = null;
};

// PERF acces @nodes directly?
subclass$(ListNode,Node);

ListNode.prototype.nodes = function(v){ return this._nodes; }
ListNode.prototype.consume = function (node){
	if (node instanceof Walker) {
		for (let i = 0, items = iter$(this._nodes), len = items.length; i < len; i++) {
			items[i].consume(node);
		};
		return this;
	};
	return ListNode.prototype.__super__.consume.apply(this,arguments);
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
	this._nodes = this._nodes.concat((other instanceof Array) ? other : other.nodes());
	return this;
};

ListNode.prototype.swap = function (item,other){
	var idx = this.indexOf(item);
	if (idx >= 0) { this._nodes[idx] = other };
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

// test
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

// filtered list of items
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
	for (let i = 0, items = iter$(this._nodes), len = items.length, node; i < len; i++) {
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

ArgList.prototype.startLoc = function (){
	var first_;
	if (typeof this._startLoc == 'number') {
		return this._startLoc;
	};
	return (first_ = this.first()) && first_.startLoc  &&  first_.startLoc();
};

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

ArgList.prototype.setEnds = function (start,end){
	this._generated = start && start.generated;
	if (end && end.endLoc && end.endLoc() != -1) {
		this._endLoc = end.endLoc();
	};
	if (start && start.startLoc && start.startLoc() != -1) {
		this._startLoc = start.startLoc();
	};
	return this;
};

function AssignList(){ return ArgList.apply(this,arguments) };

subclass$(AssignList,ArgList);

AssignList.prototype.concat = function (other){
	if (this._nodes.length == 0 && (other instanceof AssignList)) {
		return other;
	} else {
		AssignList.prototype.__super__.concat.call(this,other);
	};
	// need to store indented content as well?
	// @nodes = nodes.concat(other isa Array ? other : other.nodes)
	return this;
};

function Block(list){
	this.setup();
	this._nodes = list || [];
	this._head = null;
	this._indentation = null;
};

subclass$(Block,ListNode);

Block.prototype.head = function(v){ return this._head; }
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
	
	this._traversing = true;
	for (let i = 0, items = iter$(this._nodes.slice(0)), len = items.length, node; i < len; i++) {
		node = items[i];
		node && node.traverse();
	};
	this._traversing = false;
	
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
	return null;
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

// go through children and unwrap inner nodes
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

// This is just to work as an inplace replacement of nodes.coffee
// After things are working okay we'll do bigger refactorings
Block.prototype.compile = function (o){
	if(o === undefined) o = {};
	var root = new Root(this,o);
	return root.compile(o);
};

// Not sure if we should create a separate block?
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
	// really?
	var express = this.isExpression() || o.isExpression() || (this.option('express') && this.isExpressable());
	if (ast.length == 0 && (!this._head || this._head.length == 0)) { return '' };
	
	if (express) {
		return Block.prototype.__super__.js.call(this,o,{nodes: ast});
	};
	
	var str = "";
	let empty = false;
	for (let i = 0, items = iter$(ast), len = items.length; i < len; i++) {
		let vs = this.cpart(items[i]);
		// FIXME windows?
		if (vs[0] == '\n' && (/^\n+$/).test(vs)) {
			if (empty) { continue; };
			empty = true;
		} else if (vs) {
			empty = false;
		};
		// console.log 'add item?',JSON.stringify(vs)
		str += vs;
	};
	
	// now add the head items as well
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

// Should this create the function as well?
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
	
	// can also return super if it is expressable, but should we really?
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
			a._meta.post = post.trim() + '\n';
		};
	};
	
	return this;
};

function ClassInitBlock(){ return Block.apply(this,arguments) };

subclass$(ClassInitBlock,Block);
ClassInitBlock.prototype.c = function (o){
	let out = ClassInitBlock.prototype.__super__.c.apply(this,arguments);
	if (this._nodes.length > 1) {
		return 'static {\n' + helpers.indent(out) + '\n}';
	} else {
		return 'static { ' + out.replace(/\;$/,'') + ' }';
	};
};

function InstanceInitBlock(){ return Block.apply(this,arguments) };

subclass$(InstanceInitBlock,Block);


function InstancePatchBlock(){ return InstanceInitBlock.apply(this,arguments) };

subclass$(InstancePatchBlock,InstanceInitBlock);


function ClassField(name){
	ClassField.prototype.__super__.constructor.apply(this,arguments);
	this._name = name;
};

subclass$(ClassField,Node);

ClassField.prototype.name = function(v){ return this._name; }
ClassField.prototype.setName = function(v){ this._name = v; return this; };

ClassField.prototype.isExcluded = function (){
	if (STACK.tsc()) {
		return this._envs && this._envs.find(function(_0) { return _0._key == 'JS'; }) || false;
	};
	
	if (this._envs) {
		return !this._envs.find(function(_0) { return _0.isTruthy(); });
	};
	return false;
};

ClassField.prototype.visit = function (){
	var up_;
	if (this.isExcluded()) { return };
	this._decorators = (up_ = this.up()) && up_.collectDecorators  &&  up_.collectDecorators();
	this._classdecl = STACK.up(ClassDeclaration);
	if (this._name && this._name.traverse) { this._name.traverse() };
	
	if (this.value()) {
		this.value()._scope = this._vscope = new FieldScope(this.value());
		this.value()._scope._parent = this.scope__();
		
		this.value().traverse();
	};
	
	if (this.watchBody()) {
		this._descriptor = STACK.root().declare(("" + this.oid() + "$Prop"),this.util().watcher(this.storageSymbol(),this.watcherSymbol()),{type: 'const',system: true});
	};
	
	if (this.wrapper()) {
		// worth of a full function
		// dont add these in tsc?
		this._vslot = this.osym('slot',String(this._name));
		this._fslot = this.osym('meta');
		this._fname = this._name.metaIdentifier();
		
		this.wrapper()._scope = this._vscope = new FieldScope(this.wrapper());
		this.wrapper()._scope._parent = this.scope__();
		this.wrapper().traverse();
	};
	return this;
};

ClassField.prototype.value = function (){
	return this.option('value');
};

ClassField.prototype.target = function (){
	return this.option('static') ? LIT('this') : LIT('this.prototype');
};

ClassField.prototype.storageSymbol = function (){
	return this.symbolRef(("#" + this._name.c({as: 'symbolpart'})));
};

ClassField.prototype.watcherSymbol = function (){
	return this.symbolRef(("#" + this._name.c({as: 'symbolpart'}) + "DidSet"));
};

ClassField.prototype.storageKey = function (){
	return this._storageKey || (this._storageKey = STR(this._name.c() + '$$'));
};

ClassField.prototype.storageMap = function (){
	return this._storageMap || (this._storageMap = this.scope__().root().declare(null,LIT('new WeakMap()')));
};

ClassField.prototype.isPlain = function (){
	return !this._decorators && (!this._value || this._value.isPrimitive());
};

ClassField.prototype.isMember = function (){
	return !this.option('static');
};

ClassField.prototype.isLazy = function (){
	return false;
};

ClassField.prototype.hasStaticInits = function (){
	return this.isStatic() || this._decorators; // or watchBody
};

ClassField.prototype.hasConstructorInits = function (){
	return !(this.isStatic());
};

ClassField.prototype.isStatic = function (){
	return this.option('static');
};

ClassField.prototype.watchBody = function (){
	return this.option('watch');
};

ClassField.prototype.wrapper = function (){
	return this.option('wrapper');
};

ClassField.prototype.fieldRegistryEntry = function (owner){
	if (!IMBA_FIELD_REGISTRY_ENABLED) { return null };
	if (!STACK.tsc()) { return null };
	if (this.isStatic()) { return null };
	
	let desc = this.wrapper();
	if (!((desc instanceof Descriptor))) { return null };
	if (!((this._name instanceof Identifier))) { return null };
	if (this._name instanceof SymbolIdentifier) { return null };
	
	let decorator = desc.fieldRegistryDecoratorName();
	if (!decorator) { return null };
	
	let field = String(this._name);
	let start = this._name.startLoc() || 0;
	let end = this._name.endLoc() || start;
	let registryArgs = desc.fieldRegistryArgs();
	if (!registryArgs.length) { return null };
	
	let args = [];
	for (let i = 0, items = iter$(registryArgs), len = items.length; i < len; i++) {
		args.push(items[i].constructorType);
	};
	let firstArg = registryArgs[0];
	let key = ("" + IMBA_FIELD_REGISTRY_KEY_PREFIX + ":" + decorator + ":" + field + ":imba:" + this.sourceId() + ":" + owner + ":" + start + ":" + end);
	let targetKey = ("" + IMBA_FIELD_TARGET_KEY_PREFIX + ":" + decorator + ":" + field + ":imba:" + this.sourceId() + ":" + owner + ":" + start + ":" + end);
	
	return {
		key: key,
		owner: owner,
		ownerType: owner,
		field: field,
		decorator: decorator,
		firstArg: firstArg && firstArg.instanceType,
		firstArgType: firstArg && firstArg.constructorType,
		firstArgTarget: (firstArg && firstArg.target) ? Object.assign({key: targetKey},firstArg.target) : null,
		args: args
	};
};

ClassField.prototype.loc = function (){
	return [this._name._loc,this._name.region()[1]];
};

ClassField.prototype.c = function (){
	var fn, fn1;
	if (this.option('struct')) { return };
	if (this.isExcluded()) { return };
	
	let up = STACK.current();
	let tsc = STACK.tsc();
	let out;
	
	if (up instanceof ClassBody) {
		// return if isPlain
		let prefix = this.isStatic() ? (("" + M('static',this.option('static')) + " ")) : '';
		let name = (this._name instanceof IdentifierExpression) ? this._name.asObjectKey() : this._name.c({as: 'field'});
		let cls = STACK.up(ClassDeclaration);
		let typ = STACK.tsc() && this.datatype();
		
		if (this.wrapper()) {
			let meta = this._metaname = this._name.metaIdentifier();
			let slot = this._vslot;
			let metasym = this._fslot;
			let inner;
			let context = null;
			
			if (this.isStatic()) {
				context = cls.classReference().c();
			} else {
				context = ("" + (cls.classReference().c()) + ".prototype");
			};
			
			let op = OP('.',LIT('this'),meta);
			let args = ("this," + slot + "," + this._name.c({as: 'value'}));
			this._getter = LIT(("()\{ return " + (op.c()) + ".$get(" + args + ") \}"));
			this._setter = LIT(("(val)\{ " + (op.c()) + ".$set(val," + args + ") \}"));
			
			if (tsc) {
				this._getter = LIT(("():ReturnType<typeof " + (op.c()) + ".$get> \{ return " + (op.c()) + ".$get(" + args + ") \}"));
				this._setter = LIT(("(val:Parameters<typeof " + (op.c()) + ".$set>[0])\{ " + (op.c()) + ".$set(val," + args + ") \}"));
				
				let pars = [this.wrapper().c({expression: true}),args,metasym,context];
				let extending = cls.option('extension');
				
				let slf = "const self = this";
				
				if (extending) {
					let clsname = cls._className;
					let iface = null;
					if ((clsname instanceof Identifier) && !clsname._variable) {
						// Identifier should not have this much responsibility - it should be wrapped in an VarOrAccess?
						iface = GLOBAL_INTERFACES[clsname._value];
					};
					
					if (clsname) {
						
						let gen = clsname && clsname.option('generics');
						let suptyp = clsname.c();
						
						if (gen) {
							suptyp += String(gen);
						};
						
						// slf = (iface and iface:thistype ? LIT("const self = null as any as {iface:thistype}") : LIT("const self = this as (this & {suptyp})"))
						
						slf = ((iface && iface.thistype) ? LIT(("const self = null as any as " + (iface.thistype))) : LIT(("const self = this as unknown as (" + suptyp + ")")));
					};
				};
				// const slf = {context};
				inner = ("" + slf + ";return " + (this.runtime().accessor) + "(" + pars.join(',') + ")");
				
				if (this.wrapper()._callback) {
					// set self value for this?
					inner += '.$function(' + this.wrapper()._callback.c() + ')';
				};
			} else {
				inner = ("return this[" + metasym + "] || " + (this.runtime().accessor) + "(" + this.wrapper().c({expression: true}) + "," + args + "," + metasym + "," + context + ")");
				// inner = STACK.tsc ? "return {inner}" : "return this[{metasym}] || {inner}"
			};
			this._handler = LIT(("" + M(meta.c({as: 'field'}),this._name) + "()\{ " + inner + " \}"));
		};
		
		if (tsc) {
			let vars = {
				name: this._name,
				static: this.option('static'),
				declare: this.option('declareOnly'),
				protected: this.option('protected'),
				type: this.datatype(),
				value: this.value()
			};
			let tpl;
			if (this.wrapper()) {
				// vars:getter = self.getter.c(keyword: '')
				// vars:setter = self.setter.c(keyword: '')
				
				let getter = ("" + this.mo('protected',true) + " " + prefix + "get " + M(this._name) + this.getter().c({keyword: ''}));
				let setter = ("" + this.mo('protected',true) + " " + prefix + "set " + M(this._name) + this.setter().c({keyword: ''}));
				// console.log @name,setter,getter,name
				if (typ) {
					getter = ("" + getter + ":" + (typ.c()));
				};
				
				out = ("" + getter + "\n" + setter + "\n" + prefix + "get " + (this._handler.c()));
				
				// if !isStatic
				// 	# how would this fare with class extensions?
				// 	out += "\nstatic get {M(@metaname.c(as: 'field'),@name)}()\{ return {OP('.',LIT('this.prototype'),@metaname).c} \}"
				
				return out;
			} else if ((this instanceof ClassAttribute) || (this._decorators && this._decorators.length)) {
				let sym = this.osym();
				out = ("declare " + prefix + " " + M(name,this._name));
				if (typ) { out = ("" + out + ":" + C(typ)) };
				return out;
			} else {
				tpl = '@declare @protected @static @name@{:@type} @{ = @value}';
				out = ("" + prefix + M(name,this._name)); // the value scope?
				if (typ) { out += (":" + C(typ)) };
				if (this.value()) { out += (" = " + (this.value().c())) };
			};
			
			if (tpl) {
				return TPL(vars,tpl);
			};
		} else if ((this instanceof ClassAttribute) || (this._decorators && this._decorators.length > 0 && false) || this.wrapper()) {
			let setter = ("" + prefix + "set " + name + this.setter().c({keyword: ''}));
			let getter = ("" + prefix + "get " + name + this.getter().c({keyword: ''}));
			out = ("" + setter + "\n" + getter);
			
			if (this.wrapper()) {
				// let wr = "{runtime:property}({wrapper.c}).accessor()"
				out += ("\n" + prefix + "get " + (this._handler.c()));
			};
		};
		
		return out;
	};
	
	if (STACK.tsc()) { return };
	
	if (this.isStatic() && (up instanceof ClassInitBlock)) {
		if (this._vscope) {
			if (fn = STACK.up(Func)) {
				this._vscope.mergeScopeInto(fn._scope);
			};
		};
		out = OP('=',OP('.',THIS,this._name),this.value() || UNDEFINED).c() + ';\n';
	} else if (!(this.isStatic()) && (up instanceof ClassInitBlock)) {
		return "";
	} else if (!(this.isStatic()) && (up instanceof InstanceInitBlock)) {
		if (this._vscope) {
			if (fn1 = STACK.up(Func)) {
				this._vscope.mergeScopeInto(fn1._scope);
			};
		};
		
		let key = this._name;
		if (this._name instanceof Identifier) {
			key = this._name.toStr();
		};
		
		let ctor = up.option('ctor');
		let opts = up.option('opts');
		let val = this.value() || UNDEFINED;
		
		let paramIndex = this.option('paramIndex');
		let restIndex = this.option('restIndex');
		let access;
		let rest;
		
		if (up instanceof InstancePatchBlock) {
			// Dropped the patch block now
			rest = ctor._params.at(restIndex,true,'$$',LIT('{}'));
			access = OP('.',rest,this._name);
			access.cache({reuse: true,name: 'vsds',safe: true});
			
			let right = OP('=',OP('.',THIS,this._name),access);
			
			if (this.wrapper()) {
				right = CALL(
					OP('.',OP('.',THIS,this._fname),STR('$init')),
					[access,THIS,this._vslot,LIT(this._name.c({as: 'value'})),rest]
				);
			};
			out = OP('&&',OP('!==',access,UNDEFINED),right);
		} else if (paramIndex != undefined) {
			let name = this.option('paramName');
			access = ctor._params.at(paramIndex,true,name);
			if (this.value()) {
				val = If.ternary(OP('!==',access,UNDEFINED),access,val);
			} else {
				val = access;
			};
		} else if (restIndex != undefined) {
			rest = ctor._params.at(restIndex,true,'$$',LIT('null'));
			access = OP('.',rest,this._name);
			
			if (this.value()) {
				access.cache({reuse: true,name: 'v',safe: true});
				val = If.ternary(OP('&&',rest,OP('!==',access,UNDEFINED)),access,val);
			} else {
				val = If.ternary(rest,access,UNDEFINED);
			};
		};
		
		if ((this instanceof ClassAttribute) && !(this.value())) {
			return;
		};
		
		if (this.wrapper()) {
			if (!((up instanceof InstancePatchBlock))) {
				out = CALL(
					OP('.',OP('.',THIS,this._fname),STR('$init')),
					[val,THIS,this._vslot,LIT(this._name.c({as: 'value'})),rest]
				);
			};
			out = OP('&&',LIT('fields'),out);
		};
		
		out || (out = OP('=',OP('.',THIS,this._name),val));
		out = out.c() + ';\n';
		
		if (this.watchBody()) {
			this._descriptor || (this._descriptor = STACK.root().declare(("" + this.oid() + "$Prop"),this.util().watcher(this.storageSymbol(),this.watcherSymbol()),{type: 'const',system: true}));
			out = ("Object.defineProperty(this," + (key.c()) + "," + (this._descriptor.c()) + ");\n" + out);
		};
	};
	
	return out;
};

ClassField.prototype.getter = function (){
	return this._getter || (this._getter = true && (
		this.wrapper() ? (
			LIT(("()\{ return this.__" + (this._name.c()) + ".$get(this," + (this._name.toStr().c()) + "," + this.osym() + ") \}"))
		) : (
			this.parseTemplate('(){ return $get$; }')
		)
	));
};

ClassField.prototype.setterForValue = function (value){
	return OP('=',OP('.',THIS,this.storageKey()),value);
};

ClassField.prototype.parseTemplate = function (tpl){
	var self = this;
	tpl = tpl.replace(/\$(\w+)\$/g,function(m,key) {
		if (key == 'get') {
			return GET(THIS,self.storageSymbol()).c();
		} else if (key == 'name') {
			return self.name().c();
		} else if (key == 'set') {
			return OP('=',GET(THIS,self.storageSymbol()),LIT('value')).c();
		} else if (key == 'watcher') {
			return GET(THIS,self.watcherSymbol()).c();
		} else {
			return '';
		};
	});
	return LIT(tpl);
};

ClassField.prototype.setter = function (){
	return this._setter || (this._setter = this.parseTemplate('(value){ $set$; }'));
};

ClassField.prototype.decorater = function (){
	return this._decorater || (this._decorater = true && (
		this.util().decorate(new Arr(this._decorators),this.target(),this._name,LIT('null'))
	));
};

function ClassProperty(){ return ClassField.apply(this,arguments) };

subclass$(ClassProperty,ClassField);



function ClassAttribute(){ return ClassField.apply(this,arguments) };

subclass$(ClassAttribute,ClassField);

ClassAttribute.prototype.hasConstructorInits = function (){
	return !(this.isStatic()) && this.value();
};

ClassAttribute.prototype.getter = function (){
	var op;
	return this._getter || (this._getter = true && (
		op = CALL(GET(THIS,'getAttribute'),[this.name().toAttrString()]),
		FN([],[op])
	));
};

ClassAttribute.prototype.setter = function (){
	var op;
	return this._setter || (this._setter = true && (
		op = CALL(GET(THIS,'setAttribute'),[this.name().toAttrString(),LIT('value')]),
		FN([LIT('value')],[op]).set({noreturn: true})
	));
};

function ClassRelation(){ return ValueNode.apply(this,arguments) };

subclass$(ClassRelation,ValueNode);

ClassRelation.prototype.c = function (){
	return "";
};

ClassRelation.prototype.visit = function (){
	return this._classdecl = STACK.up(ClassDeclaration);
};


function ClassBody(){ return Block.apply(this,arguments) };

subclass$(ClassBody,Block);

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
			if (node.tagName() != 'self') {
				// console.log "cannot use non-self tagname in class"
				let ast = node._options.type || node;
				ast.error("only <self> tag allowed here");
			};
			
			let meth = new MethodDeclaration([],[node],new Identifier('render'),null,{});
			this._nodes[i] = node = meth;
		};
		
		node && node.traverse();
	};
	return this;
};

function ExpressionList(){ return Block.apply(this,arguments) };

subclass$(ExpressionList,Block);



function VarDeclList(){ return Block.apply(this,arguments) };

subclass$(VarDeclList,Block);

VarDeclList.prototype.type = function (){
	return this.option('type') || 'var';
};

VarDeclList.prototype.add = function (part){
	if (this._nodes.length) { this.push(BR) };
	
	let node = new VarDeclaration(part[0],part[1],this.type()).set({decl: this,datatype: part[0].option('datatype')});
	if (!this._firstDeclaration) {
		this._firstDeclaration = node;
		node.set({keyword: this.keyword()});
	};
	this.push(node);
	return this;
};

VarDeclList.prototype.consume = function (node){
	if (this._nodes.length == 1) {
		return this._nodes[0].consume(node);
	};
	return this;
};

// Could inherit from valueNode
function Parens(value,open,close){
	this.setup();
	this._open = open;
	this._close = close;
	this._value = this.load(value);
};

subclass$(Parens,ValueNode);

Parens.prototype.unwrappedNode = function (){
	return this._value.unwrappedNode();
};

Parens.prototype.loc = function (){
	try {
		let a = this._open.loc();
		let b = this._close.loc();
		return [a[0],b[1]];
	} catch (e) {
		return [0,0];
	};
};

Parens.prototype.endLoc = function (){
	return this._endLoc || ((this._close && this._close.endLoc) ? this._close.endLoc() : 0);
};

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
	
	// check if we really need parens here?
	if (this.datatype() && STACK.tsc()) {
		str = '(' + str + '):' + this.datatype().c();
	};
	return str;
};

Parens.prototype.set = function (obj){
	// console.log "Parens set {JSON.stringify(obj)}"
	return Parens.prototype.__super__.set.call(this,obj);
};

Parens.prototype.shouldParenthesize = function (){
	// no need to parenthesize if this is a line in a block
	if (this._noparen) { return false }; //  or par isa ArgList
	return true;
};

Parens.prototype.prebreak = function (br){
	Parens.prototype.__super__.prebreak.call(this,br);
	if (this._value) { this._value.prebreak(br) };
	return this;
};

Parens.prototype.isExpressable = function (){
	return this._value.isExpressable();
};

Parens.prototype.consume = function (node){
	return this._value.consume(node);
};

function PureExpression(){ return Parens.apply(this,arguments) };

subclass$(PureExpression,Parens);



// Could inherit from valueNode
// an explicit expression-block (with parens) is somewhat different
// can be used to return after an expression
function ExpressionBlock(){ return ListNode.apply(this,arguments) };

subclass$(ExpressionBlock,ListNode);

ExpressionBlock.prototype.c = function (o){
	return this.map(function(item) { return item.c(o); }).join(",");
};

ExpressionBlock.prototype.consume = function (node){
	return this.value().consume(node);
};

// STATEMENTS

function Return(v){
	this._traversed = false;
	this._value = ((v instanceof ArgList) && v.count() == 1) ? v.last() : v;
	return this;
};

subclass$(Return,Statement);

Return.prototype.value = function(v){ return this._value; }
Return.prototype.setValue = function(v){ this._value = v; return this; };

Return.prototype.replace = function (base,replacement){
	if (this._value == base) {
		return this._value = replacement;
	};
};

Return.prototype.visit = function (){
	if (this._value instanceof VarReference) {
		this._value.option('virtualize',true);
	};
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
	if (STACK.tsc() && (this._value instanceof This)) {
		return ("" + M('return',this.keyword()) + " " + M('this',this._value));
	};
	
	if (!(this._value) || this._value.isExpressable()) { return Return.prototype.__super__.c.apply(this,arguments) };
	
	return this._value.consume(this).c();
};

Return.prototype.consume = function (node){
	return this;
};

function ImplicitReturn(){ return Return.apply(this,arguments) };

subclass$(ImplicitReturn,Return);



function GreedyReturn(){ return ImplicitReturn.apply(this,arguments) };

subclass$(GreedyReturn,ImplicitReturn);



function Yield(){ return Statement.apply(this,arguments) };

subclass$(Yield,Statement);

Yield.prototype.visit = function (){
	this._method = STACK.method() || STACK.up(Func);
	return this._method.set({yield: true,noreturn: true});
};


Yield.prototype.startLoc = function (){
	let l = (this.keyword() || this._value);
	return l ? l.startLoc() : null;
};

Yield.prototype.js = function (){
	var v = this._value;
	let k = M('yield',this.keyword());
	return ("" + k + " " + v.c({expression: true}));
};

// cannot live inside an expression(!)
function Throw(){ return Statement.apply(this,arguments) };

subclass$(Throw,Statement);

Throw.prototype.js = function (o){
	return ("throw " + (this.value().c()));
};

Throw.prototype.consume = function (node){
	// ROADMAP should possibly consume to the value of throw and then throw?
	return this;
};

function LoopFlowStatement(lit,expr){
	(this._literal = lit,this);
	(this._expression = expr,this);
};

subclass$(LoopFlowStatement,Statement);


LoopFlowStatement.prototype.visit = function (){
	if (this._expression) { return this._expression.traverse() };
};

LoopFlowStatement.prototype.consume = function (node){
	return this;
};

LoopFlowStatement.prototype.c = function (){
	if (!(this._expression)) { return LoopFlowStatement.prototype.__super__.c.apply(this,arguments) };
	// get up to the outer loop
	var _loop = STACK.up(Loop);
	
	// need to fix the grammar for this. Right now it
	// is like a fake call, but should only care about the first argument
	var expr = this._expression;
	
	if (_loop._catcher) {
		expr = expr.consume(_loop._catcher);
		var copy = new this.constructor(this._literal);
		return new Block([expr,copy]).c();
	} else if (expr) {
		copy = new this.constructor(this._literal);
		return new Block([expr,copy]).c();
	} else {
		return LoopFlowStatement.prototype.__super__.c.apply(this,arguments);
	};
	// return "loopflow"
};

function BreakStatement(){ return LoopFlowStatement.apply(this,arguments) };

subclass$(BreakStatement,LoopFlowStatement);

BreakStatement.prototype.js = function (o){
	return "break";
};

function ContinueStatement(){ return LoopFlowStatement.apply(this,arguments) };

subclass$(ContinueStatement,LoopFlowStatement);

ContinueStatement.prototype.js = function (o){
	return "continue";
};

function DebuggerStatement(){ return Statement.apply(this,arguments) };

subclass$(DebuggerStatement,Statement);

DebuggerStatement.prototype.consume = function (node){
	return this;
};

// PARAMS

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

Param.prototype.name = function(v){ return this._name; }
Param.prototype.setName = function(v){ this._name = v; return this; };
Param.prototype.index = function(v){ return this._index; }
Param.prototype.splat = function(v){ return this._splat; }
Param.prototype.variable = function(v){ return this._variable; }
Param.prototype.value = function(v){ return this._value; }
Param.prototype.setValue = function(v){ this._value = v; return this; };

Param.prototype.varname = function (){
	return this._variable ? this._variable.c() : this._name;
};

Param.prototype.datatype = function (){
	return Param.prototype.__super__.datatype.apply(this,arguments) || this._value.datatype();
};

Param.prototype.type = function (){
	return 'param';
};

Param.prototype.jsdoc = function (){
	let typ = this.datatype();
	if (typ && this._name) {
		return typ.asParam(this._name);
		// '@param {' + typ.c() + '} ' + name
	} else {
		return '';
	};
};

Param.prototype.js = function (stack,params){
	let val = this._value.c();
	
	if (!params || params.as != 'declaration') {
		return val;
	};
	
	if (this.datatype() && STACK.tsc()) {
		let typ = C(this.datatype());
		if (this.datatype()._optional) { val += '?' };
		// now check if type is optional
		val += ':' + typ;
	};
	
	// include type??
	if (this._defaults) {
		return ("" + val + " = " + (this._defaults.c()));
	} else if (this.option('splat')) {
		return "..." + val;
	} else {
		return val;
	};
};

Param.prototype.visit = function (stack){
	if (this._defaults) { this._defaults.traverse() };
	if (this._value) { this._value.traverse({declaring: 'param'}) };
	
	// self.variable ||= scope__.register(name,self)
	
	if (this._value instanceof Identifier) {
		this._value._variable || (this._value._variable = this.scope__().register(this._value.symbol(),this._value,{type: this.type()}));
	};
	return this;
};

Param.prototype.assignment = function (){
	return OP('=',this._variable.accessor(),this._defaults);
};

Param.prototype.isExpressable = function (){
	return !(this._defaults) || this._defaults.isExpressable();
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
		name: this._name,
		defaults: this._defaults
	};
};

function RestParam(){ return Param.apply(this,arguments) };

subclass$(RestParam,Param);



function BlockParam(){ return Param.apply(this,arguments) };

subclass$(BlockParam,Param);

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



function NamedParam(){ return Param.apply(this,arguments) };

subclass$(NamedParam,Param);



function RequiredParam(){ return Param.apply(this,arguments) };

subclass$(RequiredParam,Param);



function ParamList(){ return ListNode.apply(this,arguments) };

subclass$(ParamList,ListNode);

ParamList.prototype.splat = function(v){ return this._splat; }
ParamList.prototype.block = function(v){ return this._block; }
ParamList.prototype.at = function (index,force,name,value){
	if(force === undefined) force = false;
	if(name === undefined) name = null;
	if(value === undefined) value = null;
	if (force) {
		while (index >= this.count()){
			let curr = this.count() == index;
			let val = curr ? value : null;
			this.add(new Param(curr && name || ("_" + this.count()),val));
			// is this ever traversed?
		};
		
		// need to visit at the same time, no?
	};
	return this._nodes[index];
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
		if (item.datatype()) { // option(:datatype)
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
		// warn "&block must be the last parameter of a method", blk[0]
	};
	
	// add more warnings later(!)
	// should probably throw error as well to stop compilation
	
	// need to register the required-pars as variables
	return ParamList.prototype.__super__.visit.apply(this,arguments);
};

ParamList.prototype.js = function (stack){
	if (this.count() == 0) { return EMPTY };
	
	// FIXME This can be removed for v2?
	if (stack.parent() instanceof Block) {
		return this.head(stack);
	};
	
	// items = map(|arg| arg.name.c ).compact
	// return null unless items[0]
	
	if (stack.parent() instanceof Code) {
		// return "params_here"
		// remove the splat, for sure.. need to handle the other items as well
		// this is messy with references to argvars etc etc. Fix
		let inline = !(stack.parent() instanceof MethodDeclaration);
		var pars = this.nodes();
		var opts = {as: 'declaration',typed: inline};
		// pars = filter(|arg| arg != @splat && !(arg isa BlockParam)) if @splat
		// pars = filter(|arg| arg isa RequiredParam or arg isa OptionalParam) if @splat
		return AST.compact(this.nodes().map(function(param) {
			let part = param.c(opts);
			// let typ = STACK.tsc and inline and param.datatype
			// part = part + ' as ' + typ.c if typ
			return part;
		})).join(",");
	} else {
		throw "not implemented paramlist js";
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
		
		par._index = idx;
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
	
	// var opt = nodes.filter(|n| n isa OptionalParam)
	// var blk = nodes.filter(|n| n isa BlockParam)[0]
	// var splat = nodes.filter(|n| n isa SplatParam)[0]
	
	// simple situation where we simply switch
	// can probably optimize by not looking at arguments at all
	var ast = [];
	var isFunc = function(js) { return ("typeof " + js + " == 'function'"); };
	
	// This is broken when dealing with iframes anc XSS scripting
	// but for now it is the best test for actual arguments
	// can also do constructor.name == 'Object'
	var isObj = function(js) { return ("" + js + ".constructor === Object"); };
	var isntObj = function(js) { return ("" + js + ".constructor !== Object"); };
	// should handle some common cases in a cleaner (less verbose) manner
	// does this work with default params after optional ones? Is that even worth anything?
	// this only works in one direction now, unlike TupleAssign
	
	// we dont really check the length etc now -- so it is buggy for lots of arguments
	
	// if we have optional params in the regular order etc we can go the easy route
	// slightly hacky now. Should refactor all of these to use the signature?
	if (!named && !splat && !blk && opt.length > 0 && signature.join(" ").match(/opt$/)) {
		for (let i = 0, len_ = opt.length, par; i < len_; i++) {
			par = opt[i];
			ast.push(("if(" + (par.name().c()) + " === undefined) " + (par.name().c()) + " = " + (par._defaults.c())));
		};
	} else if (named && !splat && !blk && opt.length == 0) { // and no block?!
		// different shorthands
		// if named
		ast.push(("if(!" + (namedvar.c()) + "||" + isntObj(namedvar.c()) + ") " + (namedvar.c()) + " = \{\}"));
	} else if (blk && opt.length == 1 && !splat && !named) {
		var op = opt[0];
		var opn = op.name().c();
		var bn = blk.name().c();
		ast.push(("if(" + bn + "==undefined && " + isFunc(opn) + ") " + bn + " = " + opn + "," + opn + " = " + (op._defaults.c())));
		ast.push(("if(" + opn + "==undefined) " + opn + " = " + (op._defaults.c())));
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
		
		// if we have named params - look for them before splat
		// should probably loop through pars in the same order they were added
		// should it be prioritized above optional objects??
		if (named) {
			// should not include it when there is a splat?
			ast.push(("var " + (namedvar.c()) + " = " + last + "&&" + isObj(last) + " ? " + pop + " : \{\}"));
		};
		
		for (let i = 0, len_ = opt.length, par; i < len_; i++) {
			par = opt[i];
			ast.push(("if(" + len + " < " + (par.index() + 1) + ") " + (par.name().c()) + " = " + (par._defaults.c())));
		};
		
		// add the splat
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
		
		// if named
		// 	for k,i in named.nodes
		// 		# OP('.',namedvar) <- this is the right way, with invalid names etc
		// 		var op = OP('.',namedvar,k.key).c
		// 		ast.push "var {k.key.c} = {op} !== undefined ? {op} : {k.value.c}"
		
		// if named
		
		// return ast.join(";\n") + ";"
		// return "if({opt[0].name.c} instanceof Function) {blk.c} = {opt[0].c};"
	} else if (opt.length > 0) {
		for (let i = 0, len_ = opt.length, par; i < len_; i++) {
			par = opt[i];
			ast.push(("if(" + (par.name().c()) + " === undefined) " + (par.name().c()) + " = " + (par._defaults.c())));
		};
	};
	
	// now set stuff if named params(!)
	
	if (named) {
		for (let i = 0, items = iter$(named.nodes()), len_ = items.length, k; i < len_; i++) {
			// console.log "named var {k.c}"
			k = items[i];
			op = OP('.',namedvar,k.c()).c();
			ast.push(("var " + (k.c()) + " = " + op + " !== undefined ? " + op + " : " + (k._defaults.c())));
		};
	};
	
	if (arys.length) {
		for (let i = 0, len_ = arys.length; i < len_; i++) {
			// create tuples
			arys[i].head(o,ast,this);
			// ast.push v.c
		};
	};
	
	// if opt:length == 0
	return (ast.length > 0) ? ((ast.join(";\n") + ";")) : EMPTY;
};

// Legacy. Should move away from this?
function ScopeVariables(){ return ListNode.apply(this,arguments) };

subclass$(ScopeVariables,ListNode);

// we want to register these variables in
ScopeVariables.prototype.add = function (name,init,pos){
	if(pos === undefined) pos = -1;
	var vardec = new VariableDeclarator(name,init);
	if (name instanceof Variable) { (vardec._variable = name,name) };
	(pos == 0) ? this.unshift(vardec) : this.push(vardec);
	return vardec;
};

ScopeVariables.prototype.load = function (list){
	
	return list.map(function(par) { return new VariableDeclarator(par.name(),par._defaults,par.splat()); });
};

ScopeVariables.prototype.isExpressable = function (){
	return this.nodes().every(function(item) { return item.isExpressable(); });
};

ScopeVariables.prototype.js = function (o){
	if (this.count() == 0) { return EMPTY };
	
	// When is this needed?
	if (this.count() == 1 && !(this.isExpressable())) {
		this.first().variable().autodeclare();
		return this.first().assignment().c();
	};
	
	var keyword = 'var';
	var groups = {};
	
	this.nodes().forEach(function(item) {
		let variable = item._variable || item;
		
		let typ = (variable instanceof Variable) && variable.type();
		if (typ) {
			groups[typ] || (groups[typ] = []);
			return groups[typ].push(item);
		};
		// elif item.@variable
		//	console.log 'variable without type'
		// else
		//	console.log "no variable type?? {item:constructor} {item.type}"
	});
	
	if (groups.let && (groups.var || groups.const)) {
		groups.let.forEach(function(item) {
			return (item._variable || item)._virtual = true;
		});
	} else if (groups.let) {
		keyword = 'let';
	};
	
	// FIX PERFORMANCE
	// This is used in let scope as well - inflexible
	// Is this used by
	if (this._split && true) {
		let out2 = [];
		for (let v, i = 0, keys = Object.keys(groups), l = keys.length, k; i < l; i++){
			k = keys[i];v = groups[k];out2.push(("" + k + " " + AST.cary(v,{as: 'declaration'}).join(', ') + ";"));
		};
		return out2.join("\n");
	};
	
	var out = AST.compact(AST.cary(this.nodes(),{as: 'declaration'})).join(", ");
	return out ? (("" + keyword + " " + out)) : "";
};

function VariableDeclarator(){ return Param.apply(this,arguments) };

subclass$(VariableDeclarator,Param);

VariableDeclarator.prototype.type = function(v){ return this._type; }
// can possibly create the variable immediately but wait with scope-declaring
// What if this is merely the declaration of a system/temporary variable?
VariableDeclarator.prototype.visit = function (){
	// even if we should traverse the defaults as if this variable does not exist
	// we need to preregister it and then activate it later
	var variable_, v_;
	(variable_ = this.variable()) || (((this._variable = v_ = this.scope__().register(this.name(),null,{type: this._type || 'var'}),this),v_));
	if (this._defaults) { this._defaults.traverse() };
	// WARN what if it is already declared?
	this.variable()._declarator = this;
	this.variable().addReference(this.name());
	return this;
};

// needs to be linked up to the actual scoped variables, no?
VariableDeclarator.prototype.js = function (o){
	if (this.variable()._proxy) { return null };
	
	var defs = this._defaults;
	let typ = STACK.tsc() && this.variable().datatype();
	
	// console.log 'compile variable!!'
	// FIXME need to deal with var-defines within other statements etc
	// FIXME need better syntax for this
	if (defs != null && defs != undefined) {
		if (defs instanceof Node) { defs = defs.c({expression: true}) };
		if (typ) {
			// ever used?
			defs = ("" + (typ.c()) + "(" + defs + ")");
		};
		
		return ("" + (this.variable().c()) + " = " + defs);
	} else if (typ) {
		// "{variable.c} = {typ.c}(undefined)"
		return ("" + (this.variable().c()) + ":" + (typ.c()));
	} else {
		return ("" + (this.variable().c()));
	};
};

VariableDeclarator.prototype.accessor = function (){
	return this;
};

function VarDeclaration(left,right,kind,op){
	if(op === undefined) op = '=';
	this._op = op;
	this._left = left;
	this._right = right;
	this._kind = kind;
};

subclass$(VarDeclaration,Node);

VarDeclaration.prototype.op = function (){
	return this._op;
};

VarDeclaration.prototype.type = function (){
	return this._kind;
};

VarDeclaration.prototype.visit = function (stack){
	// WARN not always correct
	var self = this;
	if (!((self._left instanceof Identifier) && (self._right instanceof Func))) {
		if (self._right) { self._right.traverse() };
	};
	
	self._variables = self.scope__().captureVariableDeclarations(function() {
		if (self._left) { self._left.traverse({declaring: self.type()}) };
		
		// replace directly
		// should the left side be wrapped in a VarDeclLeft node?
		if (self._left instanceof Identifier) {
			// TODO add an identifier.declare method for this
			return self._left._variable || (self._left._variable = self.scope__().register(self._left.symbol(),self._left,{type: self.type()}));
		};
	});
	
	if (self._right) { self._right.traverse() };
	
	// elif @left isa Obj
	// 	# need to traverse the object to register variables
	// 	# if it is a let we might also need to rename them though
	
	return self;
};

VarDeclaration.prototype.isExpressable = function (){
	return false;
};

VarDeclaration.prototype.consume = function (node){
	if (node instanceof TagLike) {
		return this;
	};
	
	if ((node instanceof PushAssign) || (node instanceof Return)) {
		let ast = this;
		if (this._right && !this._right.isExpressable()) {
			let temp = this.scope__().temporary(this);
			let ast = this._right.consume(OP('=',temp,NULL));
			(this._right = temp,this);
			return new Block([ast,BR,this.consume(node)]);
		};
		
		return new Block([ast,BR,this._left.consume(node)]);
	};
	
	if (node instanceof Return) {
		return new Block([this,BR,this._left.consume(node)]);
	};
	
	return VarDeclaration.prototype.__super__.consume.call(this,node);
};

VarDeclaration.prototype.c = function (o){
	if (this._right && !this._right.isExpressable()) {
		let temp = this.scope__().temporary(this);
		let ast = this._right.consume(OP('=',temp,NULL));
		(this._right = temp,this);
		return new Block([ast,BR,this]).c(o);
	};
	// testing this
	return VarDeclaration.prototype.__super__.c.call(this,o);
};

VarDeclaration.prototype.js = function (){
	let out = '';
	let kind = this._kind;
	let typ = (this.datatype() || (this._left && this._left.datatype()));
	if (STACK.tsc() && this._variables.length > 1 && this._variables.some(function(_0) { return _0.vartype(); })) {
		kind = 'let'; // or var?
		for (let i = 0, items = iter$(this._variables), len = items.length, item; i < len; i++) {
			item = items[i];
			let itemjs = item.c();
			if (item.vartype()) {
				// Rename to datatype?
				
				// out += item.vartype.c + ' '
				itemjs += ':' + item.vartype().c() + ' ';
			};
			
			out += ("" + M(kind,this.keyword()) + " " + itemjs + ";\n");
		};
		out += ("(" + this._left.c());
		if (this._right) {
			out += (" = " + this._right.c({expression: true}));
		};
		out += ")";
	} else {
		out += ("" + M(kind,this.keyword()) + " " + this._left.c());
		
		if (this._right) {
			
			out += (" = " + this._right.c({expression: true}));
		};
	};
	
	if (this.option('export')) {
		out = M('export',this.option('export')) + (" " + out);
	};
	
	if (typ) {
		true;
		// out = typ.c() + '\n' + out
	};
	
	return out;
};

// TODO clean up and refactor all the different representations of vars
function VarName(a,b){
	VarName.prototype.__super__.constructor.apply(this,arguments);
	this._splat = b;
};

subclass$(VarName,ValueNode);

VarName.prototype.variable = function(v){ return this._variable; }
VarName.prototype.splat = function(v){ return this._splat; }
VarName.prototype.visit = function (){
	// should we not lookup instead?
	// FIXME p "register value {value.c}"
	var variable_, v_;
	(variable_ = this._variable) || (((this._variable = v_ = this.scope__().register(this.value().c(),null),this),v_));
	this._variable._declarator = this;
	this._variable.addReference(this.value());
	return this;
};

VarName.prototype.js = function (o){
	return this._variable.c();
};

VarName.prototype.c = function (){
	return this._variable.c();
};

// CODE

function Code(){ return Node.apply(this,arguments) };

subclass$(Code,Node);

Code.prototype.head = function(v){ return this._head; }
Code.prototype.body = function(v){ return this._body; }
Code.prototype.scope = function(v){ return this._scope; }
Code.prototype.params = function(v){ return this._params; }
Code.prototype.setParams = function(v){ this._params = v; return this; };

Code.prototype.isStatementLike = function (){
	return true;
};

Code.prototype.scopetype = function (){
	return Scope;
};

Code.prototype.visit = function (){
	if (this._scope) { this._scope.visit() };
	// @scope.parent = STACK.scope(1) if @scope
	return this;
};

function CodeBlock(body,opts){
	this._traversed = false;
	this._body = AST.blk(body);
	this._scope = new FlowScope(this);
	this._body._head = this._scope.head();
	this._options = {};
};

subclass$(CodeBlock,Code);

CodeBlock.prototype.visit = function (){
	this._scope.visit();
	this._body.traverse();
	
	return this;
};

CodeBlock.prototype.c = function (){
	// add curly braces?
	return this._body.c();
};

// Rename to Program?
function Root(body,opts){
	this._traversed = false;
	this._body = AST.blk(body);
	this._scope = new RootScope(this,null);
	this._options = {};
};

subclass$(Root,Code);

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
		err._sourcePath = OPTS.sourcePath;
		err._loc = STACK.currentRegion();
		throw err;
	};
};

Root.prototype.compile = function (o,script){
	var registry;
	if(script === undefined) script = {};
	STACK.reset(); // -- nested compilation does not work now
	(this._scope._options = OPTS = STACK._options = this._options = o || {},this._scope);
	STACK.SOURCECODE = script.sourceCode;
	ROOT = (STACK._root = this._scope,this._scope);
	this._scope._imba.configure(o);
	this.traverse();
	
	STACK._root = this._scope;
	
	
	
	if (o.bundle) {
		if (o.cwd && STACK.isNode()) {
			let abs = fspath.resolve(o.cwd,o.sourcePath);
			let rel = fspath.relative(o.cwd,abs).split(fspath.sep).join('/');
			
			let np = this._scope.importProxy('path').proxy();
			// TODO Test this thoroughly - better to replace fater the fact?
			this._scope.lookup('__filename').c = function() { return LIT(("" + (np.resolve) + "(" + (STR(rel).c()) + ")")).c(); };
			this._scope.lookup('__dirname').c = function() { return LIT(("" + (np.dirname) + "(" + (np.resolve) + "(" + (STR(rel).c()) + "))")).c(); };
		} else {
			this._scope.lookup('__filename')._c = STR(o.sourcePath).c();
			this._scope.lookup('__dirname')._c = STR(fspath.dirname(o.sourcePath)).c();
		};
	};
	
	if (o.onTraversed instanceof Function) {
		o.onTraversed(this,STACK);
	};
	
	let sheet = STACK._css;
	let css = sheet.toString();
	
	if (sheet.transitions) {
		this.runtime().transitions;
	};
	
	if (css && (!o.styles || o.styles == 'inline')) {
		this.runtime().styles;
	};
	
	var out = this.c(o);
	
	if (STACK.tsc()) {
		if (registry = STACK.fieldRegistryDeclaration()) {
			if (registry) { out += ("\n" + registry + "\n") };
		};
		// out = "import 'imba/index.d.ts';\n{out}"
		out = ("export \{\};String();import * as imba from 'imba';\n" + out + "\n");
		
		if ((script.sourceCode && script.sourceCode.match(/(^|[\r\n])\# @nocheck[\n\r]/)) || o.nocheck) {
			out = ("// @ts-nocheck\n" + out);
		};
	};
	
	script.rawResult = {
		js: out,
		css: css
	};
	
	script.js = out;
	script.css = css || "";
	script.sourceId = this.sourceId();
	script.assets = this.scope()._assets;
	script.universal = STACK.meta().universal !== false;
	
	if (!STACK.tsc()) {
		if (script.css && (!o.styles || o.styles == 'inline')) {
			
			// let style = '`\n' + script:css + '\n`'
			// - we have to escape it - right?
			let style = JSON.stringify(script.css);
			
			script.js = ("" + (script.js) + "\n" + (this.runtime().styles) + ".register('" + (script.sourceId) + "'," + style + ");");
			if (o.debug || true) {
				script.js += '\n/*\n' + script.css + '\n*/\n'; // this we should only include when debugging
			};
		};
	};
	
	if (o.sourcemap || STACK.tsc()) {
		let map = new SourceMap(script,o);
		
		// sourcemap is not needed in tsc - only need to generate the ranges
		if (STACK.tsc()) {
			map.parse();
		} else {
			map.generate();
			script.sourcemap = map.result();
		};
		
		if (o.sourcemap == 'inline') {
			script.js += map.inlined();
		};
	};
	
	if (!o.raw) {
		script.css && (script.css = SourceMapper.strip(script.css));
		script.js = SourceMapper.strip(script.js);
		
		if (STACK.tsc()) {
			// now combine comments - keep whitespace to not mess up sourcemapping
			script.js = script.js.replace(/\*\/\s[\r\n]+(\t*)\/\*\*/gm,function(m) { return m.replace(/[^\n\t]/g,' '); });
		};
	};
	
	return script;
};

Root.prototype.js = function (o){
	var out = this.scope().c();
	
	// find and replace shebangs
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
	(STACK._loglevel = o.loglevel || 0,STACK);
	STACK._analyzing = true;
	ROOT = STACK.ROOT = this._scope;
	OPTS = STACK._options = {
		platform: o.platform,
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
	if (name instanceof VarOrAccess) {
		name._value._options = name._options;
		name = name._value;
	};
	
	
	this._name = name; // or LIT('')
	this._superclass = superclass;
	this._scope = this.isTag() ? new TagScope(this) : new ClassScope(this);
	this._body = AST.blk(body) || new ClassBody([]);
	this._entities = {}; // items should register the entities as they come
	this;
};

subclass$(ClassDeclaration,Code);

ClassDeclaration.prototype.name = function(v){ return this._name; }
ClassDeclaration.prototype.setName = function(v){ this._name = v; return this; };

ClassDeclaration.prototype.consume = function (node){
	if (node instanceof Return) {
		this.option('return',node);
		return this;
	};
	return ClassDeclaration.prototype.__super__.consume.apply(this,arguments);
};

ClassDeclaration.prototype.namepath = function (){
	return this._namepath || (this._namepath = ("" + (this._name ? this._name.c() : '--')));
};

ClassDeclaration.prototype.metadata = function (){
	var superclass_;
	return {
		type: 'class',
		namepath: this.namepath(),
		inherits: (superclass_ = this._superclass) && superclass_.namepath  &&  superclass_.namepath(),
		path: this._name && this._name.c().toString(),
		desc: this._desc,
		loc: this.loc(),
		symbols: this._scope._entities
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

ClassDeclaration.prototype.isMixin = function (){
	return this.keyword() && String(this.keyword()) == 'mixin';
};

ClassDeclaration.prototype.isInterface = function (){
	return this.keyword() && String(this.keyword()) == 'interface';
};

ClassDeclaration.prototype.hasMixins = function (){
	return this._mixins && this._mixins.length > 0;
};

ClassDeclaration.prototype.isExtension = function (){
	return this.option('extension');
};

ClassDeclaration.prototype.isExported = function (){
	return this.option('export');
};

ClassDeclaration.prototype.isGlobal = function (){
	return this.option('global');
};

ClassDeclaration.prototype.isStrict = function (){
	return this.option('strict');
};

ClassDeclaration.prototype.isLoose = function (){
	return !(this.isStrict());
};

ClassDeclaration.prototype.tsId = function (){
	return this._tsId || (this._tsId = '$$' + STACK.sourceId() + 'C' + STACK.incr('cls') + '$$');
};

ClassDeclaration.prototype.isNamespaced = function (){
	return this._name instanceof Access;
};

ClassDeclaration.prototype.exportForDts = function (){
	return false;
};

ClassDeclaration.prototype.isTag = function (){
	return false;
};

ClassDeclaration.prototype.staticInit = function (){
	// @superclass ? 'super.inherited instanceof Function && super.inherited(this)' : 'this'
	return this._staticInit || (this._staticInit = this.addMethod(this.initKey(),[],'this').set({static: true}));
	// add static block
};

ClassDeclaration.prototype.initKey = function (){
	return this._initKey || (this._initKey = (STACK.tsc() ? STACK.root().symbolRef('#__init__') : STACK.imbaSymbol('__init__'))); // SymbolIdentifier.new('#__init__')
};

ClassDeclaration.prototype.patchKey = function (){
	return this._patchKey || (this._patchKey = (STACK.tsc() ? STACK.root().symbolRef('#__patch__') : STACK.imbaSymbol('__patch__'))); // SymbolIdentifier.new('#__patch__')
};

ClassDeclaration.prototype.refSym = function (){
	return this._refSym || (this._refSym = STACK.getSymbol());
};

ClassDeclaration.prototype.initPath = function (){
	return this._initPath || (this._initPath = OP('.',LIT('super'),this.initKey()));
};

ClassDeclaration.prototype.virtualSuper = function (){
	return this._virtualSuper || (this._virtualSuper = this._scope.parent().declare('tmp',null,{system: true,type: 'let'}));
};

ClassDeclaration.prototype.classReference = function (){
	return this._name;
};

ClassDeclaration.prototype.fieldRegistryOwnerName = function (){
	if (!STACK.tsc()) { return null };
	if (this.option('notInRoot') || this.isExtension()) { return null };
	if (!((this._name instanceof Identifier))) { return null };
	if (this._name instanceof DecoratorIdentifier) { return null };
	if (this._name.option('generics')) { return null };
	return String(this._name.c({mark: false}));
};

ClassDeclaration.prototype.instanceInit = function (){
	if (this._instanceInit) { return this._instanceInit };
	let call = Super.callOp(this.initKey());
	if (this._superclass || this._mixins.length) {
		call = OP('&&',LIT('deep'),OP('&&',OP('.',LIT('super'),this.initKey()),call));
	};
	let fn = this.addMethod(this.initKey(),[],(this.isTag() || this._superclass) ? [call,BR] : '',{},function(fun) {
		return true;
	});
	fn.set({noreturn: true});
	fn.params().at(0,true,'$$',LIT('null'));
	fn.params().at(1,true,'deep',LIT('true'));
	fn.params().at(2,true,'fields',LIT('true'));
	return this._instanceInit = fn;
};

ClassDeclaration.prototype.instancePatch = function (){
	if (this._instancePatch) { return this._instancePatch };
	
	let body = [];
	let fn = this.addMethod(this.patchKey(),[],body,{},function(fun) {
		return true;
	});
	
	let param = fn._params.at(0,true,'$$',LIT('{}'));
	let fieldparam = fn._params.at(1,true,'fields',LIT('true'));
	
	if (this._superclass) {
		let call = Super.callOp(this.patchKey(),[param,fieldparam]);
		call = OP('&&',OP('.',LIT('super'),this.patchKey()),call);
		fn.inject(call);
	};
	
	fn.set({noreturn: true});
	return this._instancePatch = fn;
};

ClassDeclaration.prototype.isInitingFields = function (){
	return this._inits || (this._supernode && this._supernode.isInitingFields && this._supernode.isInitingFields());
};

ClassDeclaration.prototype.visit = function (){
	var owner;
	let upscope = STACK.scope(1);
	let up = STACK.up();
	
	
	if (!STACK.tsc()) {
		let refvar = new SystemVariable(upscope,null,null,{type: 'let',ns: 'c',safe: true});
		STACK.prependInBlock(new Templated('let @name = Symbol()',{name: refvar}));
		this._refSym = refvar;
	} else {
		if (!((upscope instanceof RootScope))) {
			this.set({notInRoot: true});
		};
	};
	
	this._body._delimiter = '';
	let blk = STACK.up(Block);
	this._decorators = blk && blk.collectDecorators();
	
	STACK.pop(this);
	let sup = this._superclass;
	
	this._path = this._name;
	this._ownName = this._name;
	this._realName = (this._name instanceof Access) ? this._name._right : this._name;
	
	if (sup) {
		sup.traverse();
		// also visit and possibly declare the class name?
		if (sup instanceof VarOrAccess) {
			if (sup._variable) {
				let val = sup._variable.value();
				if (val instanceof ClassDeclaration) {
					this._supernode = val;
				};
			} else if (sup.symbol() == 'Object') {
				this.set({implicitAny: true});
				sup = this._superclass = null;
			};
		};
	};
	
	if (this.isExtension() && this._name) {
		this._name.traverse();
		
		if (this._name instanceof Identifier) {
			this._name.resolveVariable();
		};
		
		if (!(this.isTag())) {
			let extname;
			this._className = this._name;
			this._ownName = STACK.toInternalClassName(this._name);
			this._mixinName = this.scope__().register(this._ownName,null);
		} else {
			this._className = LIT(this._name.toClassName());
			this._ownName = STACK.toInternalClassName(this._name);
			this._mixinName = this.scope__().register(this._ownName,null);
		};
	} else if (this._name instanceof Identifier) {
		if (!(this.isTag()) || this._name.isCapitalized()) {
			this._name.registerVariable('const');
			this._name._variable.setValue(this);
		};
	} else if (this._name && !(this._name instanceof Access)) {
		this._name.traverse({declaring: this});
	} else if (this._name) {
		this._name.traverse();
	};
	
	if (STACK.tsc()) {
		if ((this.isGlobal() || this.isExtension())) {
			this._ownName = STACK.toInternalClassName(this._name);
		} else if (this.isGlobal() && !(this.isExtension()) && !(this.isNamespaced()) && this.option('export')) {
			this._exportName = STACK.toInternalClassName(this._name);
		};
	};
	
	STACK.push(this);
	ROOT._entities.add(this.namepath(),this);
	this.scope().visit();
	this.set({iife: STACK.up() instanceof Instantiation});
	
	var separateInitChain = true;
	var fields = [];
	var mixins = this._mixins = [];
	var signature = [];
	var params = [];
	var declaredFields = {};
	var restIndex = undefined;
	var instanceMethodMap = {};
	
	this._instanceMethodMap = instanceMethodMap;
	this._declaredFields = declaredFields;
	
	for (let i = 0, items = iter$(this.body()), len = items.length, node; i < len; i++) {
		node = items[i];
		if (node instanceof ClassRelation) {
			mixins.push(node.value());
		};
		
		
		if (node instanceof ClassField) {
			if (!node.isStatic()) {
				let name = String(node.name());
				declaredFields[name] = node;
				if (separateInitChain) {
					node.set({restIndex: 0});
				};
				// if node.watchBody
				//	console.log 'has watcher??'
			};
		};
		if (node instanceof MethodDeclaration) {
			let name = node.rawName();
			if (node.isMember()) {
				instanceMethodMap[name] = node;
			};
		};
	};
	
	// TODO No longer used - remove
	if (this.option('params')) {
		// find the rest param
		let add = [];
		for (let index = 0, items = iter$(this.option('params')), len = items.length, param; index < len; index++) {
			
			param = items[index];
			if (param instanceof RestParam) {
				restIndex = index;
				continue;
			};
			
			let name = String(param.name());
			let field = declaredFields[name];
			let dtyp = param.option('datatype');
			
			if (!field) {
				field = fields[name] = new ClassField(param.name()).set(
					{datatype: dtyp,
					value: param._defaults}
				);
				// field.set(param: param)
				add.push(field);
				params.push(param);
			} else {
				if (dtyp && !field.datatype()) {
					field.set({datatype: dtyp});
				};
				if (param._defaults && !field.value()) {
					field.set({value: param._defaults});
				};
			};
			
			if (field) {
				field.set({paramIndex: index,paramName: name});
			};
		};
		
		for (let i = 0, items = iter$(add.reverse()), len = items.length; i < len; i++) {
			this.body().unshift(items[i]);
		};
	};
	
	// See if we called super anywhere
	this.body().traverse();
	// console.log "Called?",option(:calledSuper)
	var ctor = this.body().option('ctor');
	
	let tsc = STACK.tsc();
	var inits = new InstanceInitBlock();
	var staticInits = this._staticInits = new ClassInitBlock();
	var patches = new InstancePatchBlock();
	
	if (this._mixins[0] && !tsc && !(this.isExtension())) {
		inits.add(LIT(("this[" + this.refSym() + "]?.(...arguments)")));
	};
	
	ctor = this.body().option('ctor');
	
	let fieldNodes = this.body().filter(function(node) { return node instanceof ClassField; });
	let allDecorators = [];
	
	for (let i = 0, items = iter$(fieldNodes), len = items.length, node; i < len; i++) {
		node = items[i];
		if (node.isExcluded()) {
			continue;
		};
		
		if (node.watchBody()) {
			this.addMethod(node.watcherSymbol(),[],[node.watchBody()],{},function(fn) {
				node._watchMethod = fn;
				return node._watchParam = fn.params().at(0,true,'e');
			});
		};
		
		if (node.hasStaticInits() && !node.option('declareOnly')) {
			staticInits.add(node);
		};
		
		if (node.hasConstructorInits()) {
			if (this.isExtension()) {
				if (node.value()) {
					node._name.warn("field with value not supported in class extension");
				};
			} else if (!node.option('declareOnly')) {
				if (!node.option('wrapper') || (node instanceof ClassProperty)) {
					inits.add(node);
				};
				patches.add(node);
			};
		};
		
		if (!node.isStatic() && restIndex != null) {
			node.set({restIndex: restIndex});
		};
	};
	
	if (tsc) {
		if (owner = this.fieldRegistryOwnerName()) {
			for (let i = 0, items = iter$(fieldNodes), len = items.length, node, entry; i < len; i++) {
				node = items[i];
				if (entry = node.fieldRegistryEntry(owner)) {
					STACK.addFieldRegistryEntry(entry);
				};
			};
		};
	};
	
	if (!tsc && this._decorators) {
		let op = this.util().decorate(new Arr(this._decorators),THIS);
		staticInits.add([op,BR]);
		allDecorators.push(this._decorators);
	};
	
	for (let i = 0, items = iter$(this.body()), len = items.length, node; i < len; i++) {
		node = items[i];
		if (node._decorators && !node.isExcluded()) {
			
			let target = node.option('static') ? THIS : PROTO;
			let desc = LIT('null');
			let op = this.util().decorate(new Arr(node._decorators),target,node.name(),desc);
			allDecorators.push(node._decorators);
			staticInits.add([op,BR]);
		};
	};
	
	let supers = sup || this._mixins[0];
	
	if (!inits.isEmpty() && !tsc) {
		this._inits = inits;
		this.instanceInit();
		inits.set({ctor: this.instanceInit()});
		this.instanceInit().inject(inits);
		
		if (this.isTag()) {
			// tags always call init from outside the actual construction
			true;
		} else if (!this._superclass) {
			let initop = OP('.',THIS,this.initKey());
			if (!ctor) {
				ctor = this.addMethod('constructor',[],[],{});
				let param = ctor.params().at(0,true,'$$',LIT('null'));
				let callop = CALL(initop,[param]);
				if (!tsc) {
					ctor.body().add([callop,BR],0);
				};
			} else {
				let supr = ctor.option('supr');
				if (supr) {
					supr.real.set({target: initop,args: []});
				} else {
					ctor.body().add([CALL(initop,[]),BR],0);
				};
			};
		} else if (!this._supernode || !this._supernode.isInitingFields()) {
			// we don't have an explicit constructor
			// if we cannot know on compiletime that the superclass
			// has an initor - we do need to call it here
			let op = OP('||',this.initPath(),CALL(OP('.',THIS,this.initKey()),[]));
			if (!ctor) {
				ctor = this.addMethod('constructor',[],[new Super(),BR,op],{});
			} else {
				let after = ctor.option('injectInitAfter');
				ctor.inject(op,after ? {after: after} : 0);
			};
			true;
		};
	};
	
	// Not supporting patches for now
	if (!patches.isEmpty() && !tsc && false) {
		this.instancePatch();
		patches.set({ctor: this.instancePatch()});
		this.instancePatch().inject(patches);
	};
	
	if (tsc && ctor && this._autosuper) {
		ctor.body().add([LIT("super()"),BR],0);
	};
	
	let cflags = 0;
	
	if (this instanceof ExtendDeclaration) {
		cflags = cflags | ClassFlags.IsObjectExtension;
	};
	
	if (this.isMixin()) {
		cflags = cflags | ClassFlags.IsMixin;
	};
	
	if (this.isTag()) {
		cflags = cflags | ClassFlags.IsTag;
	};
	
	if (this.isExtension()) {
		cflags = cflags | ClassFlags.IsExtension;
	};
	
	if (this._mixins.length) {
		cflags = cflags | ClassFlags.HasMixins;
	};
	
	if (!tsc) {
		
		let hasInitedHook = !(!instanceMethodMap["#__inited__"]);
		let hasDecorators = allDecorators.length > 0;
		
		if (hasDecorators) {
			cflags = cflags | ClassFlags.HasDecorators;
			STACK.use('hooks');
			let decosym = STACK.imbaSymbol('__hooks__');
			staticInits.unshift(LIT(("this.prototype[" + decosym + "] = " + (this.runtime().hooks))),true);
		};
		
		if (!(this.isTag()) && !ctor && (hasInitedHook || hasDecorators)) { // or anything else
			let ops = sup ? [new Super(),BR] : [BR];
			ctor = this.addMethod('constructor',[],ops,{});
		};
		
		if (ctor && !(this.isTag()) && !STACK.isStdLib()) {
			ctor.inject(CALL(STACK.corelib().inited$,[THIS,this.refSym()]));
		};
		
		if (ctor) {
			cflags = cflags | ClassFlags.HasConstructor;
		};
		
		if (this.option('calledSuper')) {
			cflags = cflags | ClassFlags.HasSuperCalls;
		};
		
		let pars = [THIS,this.refSym(),(this._realName ? this._realName.toStr() : NULL),LIT(String(cflags))];
		if (this.isExtension()) {
			let clsname;
			if (this.isTag()) {
				let namevar = this._name._variable;
				clsname = namevar || CALL(this.runtime().getTagType,[this._name,STR(this._name.toClassName())]);
				// if className == 'ImbaElement' or className == 'imba.Component'
				//	cls = runtime:Component
				pars.push(clsname);
			} else {
				pars.push(clsname = this._className);
			};
			
			if (this._mixins.length) {
				for (let i = 0, items = iter$(this._mixins), len = items.length; i < len; i++) {
					staticInits.add(CALL(STACK.corelib().augment$,[clsname,items[i]]));
				};
				this._mixins.length = 0;
			};
		};
		
		staticInits.add(CALL(STACK.corelib().register$,pars));
	};
	
	if (!staticInits.isEmpty() && !tsc) {
		this.body().add([BR,staticInits]);
	};
	return this;
};

ClassDeclaration.prototype.addMethod = function (name,params,mbody,options,cb){
	if ((typeof mbody=='string'||mbody instanceof String)) { mbody = [LIT(mbody)] };
	if ((typeof name=='string'||name instanceof String)) { name = new Identifier(name) };
	let func = new MethodDeclaration(params,mbody || [],name,null,options || {});
	this.body().unshift(func,true);
	if (cb instanceof Function) {
		cb(func);
	};
	func.traverse();
	return func;
};

ClassDeclaration.prototype.js = function (o){
	this.scope().virtualize(); // is this always needed?
	this.scope().context().setValue(this._name);
	this.scope().context()._reference = this._name;
	
	var tsc = STACK.tsc();
	var up = STACK.up();
	var o = this._options || {};
	
	var cname = (this._ownName instanceof Access) ? this._ownName._right : this._ownName;
	var origName = (this._name instanceof Access) ? this._name._right : this._name;
	
	var initor = null;
	var sup = this._superclass;
	
	if (typeof cname != 'string' && cname) {
		cname = cname.c({mark: true});
	};
	
	this._cname = cname;
	
	var externalAccess = LIT(cname);
	
	let jsbody = this.body().c();
	let jshead = M('class',this.keyword());
	
	if (this._name) {
		jshead += (" " + M(cname,this._name));
	} else {
		if (up instanceof VarReference) {
			try {
				jshead += (" " + (up._value._symbol));
			} catch (e) { };
		};
	};
	
	if (tsc) {
		let up = STACK.parent();
		let tpl = {
			body: jsbody,
			name: this._cname,
			localName: this._cname,
			declareName: origName,
			'default': this.option('default'),
			abstract: this.option('abstract') || this.isMixin() || this.isInterface(),
			mixins: AST.cary(this._mixins).join(', ') || null,
			generics: this._name && this._name.option('generics'),
			supr: this._superclass,
			oid: this.tsId(),
			iife: ((up instanceof Instantiation) || this.option('notInRoot')),
			"return": this.option('return'),
			unsafe: this.option('implicitAny'),
			exportName: this.option('default') || origName
		};
		
		if (tpl.generics) {
			tpl.suprGenerics = tpl.generics.asGenericNames();
			tpl.mapped = false;
		} else if (!tpl.abstract) {
			tpl.mapped = true;
		};
		
		if ((/^[\t\n]+$/).test(jsbody)) {
			tpl.body = null;
		};
		
		let str;
		
		try {
			tpl.ref = this._name.variable()._value;
		} catch (e) { };
		try {
			tpl.export = this.option('export') || !(!this._name.variable()._value.isExported());
		} catch (e) { };
		try {
			tpl.global = this.option('global') || (this._name && !this._name.variable()) || !(!this._name.variable()._value.isGlobal());
		} catch (e) { };
		try {
			tpl.path = this.isExtension() && this._name.variable().importPath();
		} catch (e) { };
		
		// only if the target is originally global
		str = this.isInterface() ? (
			this.isGlobal() ? (
				'namespace Global {\nexport interface @declareName@generics @{extends @supr }{\n	@{@unsafe? [index:string]: any; }\n	@body\n}\n@{@mixins? export interface @declareName@generics @{extends @mixins }{ }}\n}\n\n@{@export? export import @declareName = Global.@declareName; }\n\ndeclare global {\n	namespace globalThis {\n		export import @declareName = Global.@declareName;\n	}\n}'
			) : (
				'interface @declareName@generics @{extends @supr }{@{@unsafe? \n	[index:string]: any;}@body\n}'
			)
		) : ((!this._name || tpl.iife) ? (
			'class @name@generics @{extends @supr }{@{@unsafe? \n	[index:string]: any;}@body\n}'
		) : ((this.isExtension() && tpl.path) ? (
			'@declareName\ndeclare module @path {\n	@{@body? interface @declareName@generics extends @localName@generics {} }\n	@{@mixins? interface @declareName@generics @{extends %mixins }{}}\n}\n@{@body? class @localName@generics { @body } }'
		) : ((this.isExtension() && tpl.global) ? (
			'declare global {\n	@{@body? interface @declareName@generics extends @localName@generics {} }\n	@{@mixins? interface @declareName@generics @{extends %mixins }{}}\n}\n@{@body? class @localName@generics { @body } }'
		) : (this.isExtension() ? (
			'\n@export @default interface @declareName@generics extends @localName@generics {}\nclass @localName@generics { %body }\n@{@mixins? interface @declareName@generics @{extends %mixins }{}}'
		) : ((this.isGlobal() && !STACK.option('noAnyTypes')) ? (
			'namespace Global {\ndeclare const @declareName$: unique symbol;\nexport class @declareName@generics @{extends @supr }{\n	declare [ImbaUnionType]: ImbaSubclassUnion<{[@declareName$]:true}>;\n	@{@unsafe? [index:string]: any; }\n	[@declareName$]:true;\n	@body\n}\n@{@mixins? export interface @declareName@generics @{extends @mixins }{ }}\n}\n\n@{@export? export import @declareName = Global.@declareName; }\n\ndeclare global {\n	namespace globalThis {\n		export import @declareName = Global.@declareName;\n	}\n	@{@mapped? interface GlobalClassMap {@declareName:@declareName}}\n}'
		) : (this.isGlobal() ? (
			'namespace Global {\nexport class @declareName@generics @{extends @supr }{\n	@{@unsafe? [index:string]: any; }\n	@body\n}\n@{@mixins? export interface @declareName@generics @{extends @mixins }{ }}\n}\n\n@{@export? export import @declareName = Global.@declareName; }\n\ndeclare global {\n	namespace globalThis {\n		export import @declareName = Global.@declareName;\n	}\n	// @{@mapped? interface GlobalClassMap {@declareName:@declareName}}\n}'
		) : (false ? true : (
			'@{@mixins? %export %default interface %localName@generics @{extends %mixins }{}}\n%export %default class %localName@generics @{extends %supr }{\n	@{@unsafe? [index:string]: any;}\n	@body\n}'
		))))))));
		
		return TPL(tpl,str);
	};
	
	if (this._mixins.length) {
		jshead += (" " + this.mo('extends') + " " + (CALL(STACK.corelib().multi$,[this.refSym(),sup || NULL].concat(this._mixins)).c()));
	} else if (sup) {
		jshead += (" " + this.mo('extends') + " " + M(sup));
	};
	
	if ((this._name instanceof Access) && !(this.exportForDts()) && !(this.isExtension())) {
		jshead = ("" + (this._name.c()) + " = " + jshead);
	};
	
	if (this.option('export')) { // or (tsc and (exportForDts or option(:global)))
		// beware of double export
		if (this.option('default')) {
			jshead = ("" + this.mo('export') + " " + this.mo('default') + " " + jshead);
		} else {
			jshead = ("" + this.mo('export') + " " + jshead);
		};
	};
	
	let js = ("" + jshead + " \{" + jsbody + "\}");
	
	if (this.option('global')) {
		let access = (this._name instanceof Access);
		let getter = (this._name instanceof Access) ? this._name.c() : this._cname;
		js = ("" + js + "; " + (this.scope__().root().globalRef()) + "." + (this._cname) + " = " + getter);
	};
	
	return js;
};

function ExtendDeclaration(){ return ClassDeclaration.apply(this,arguments) };

subclass$(ExtendDeclaration,ClassDeclaration);



function TagDeclaration(){ return ClassDeclaration.apply(this,arguments) };

subclass$(TagDeclaration,ClassDeclaration);

TagDeclaration.prototype.isTag = function (){
	return true;
};

TagDeclaration.prototype.isInitingFields = function (){
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

TagDeclaration.prototype.cssns = function (){
	return this._cssns || (this._cssns = this._scope.cssns());
};

TagDeclaration.prototype.cssid = function (){
	return this._cssid || (this._cssid = this._scope.cssid());
};

TagDeclaration.prototype.classReference = function (){
	return LIT(this._name.toClassName());
};

TagDeclaration.prototype.cssref = function (scope){
	if (this.isNeverExtended() && !(this._superclass)) {
		return this._cssns;
	};
	
	if (scope) {
		let s = scope.closure();
		return s.memovar('_ns_',OP('||',OP('.',s.context(),'_ns_'),STR('')));
	} else {
		return OP('||',OP('.',THIS,'_ns_'),STR(''));
	};
};

TagDeclaration.prototype.isNeverExtended = function (){
	if (this.name() && this.name().isClass()) {
		return !this.option('export') && !this.option('extended');
	} else {
		return false;
	};
};

TagDeclaration.prototype.visit = function (){
	if (STACK.hmr()) {
		this.cssid();
		this.cssns();
	};
	
	TagDeclaration.prototype.__super__.visit.apply(this,arguments);
	
	let sup = this._superclass;
	
	if (!this.name().isClass()) {
		this.set({global: true});
	};
	
	this._config = {};
	
	if (sup && !STACK.tsc()) {
		if ((sup.isNative() || sup.isNativeSVG())) {
			let op = sup.nativeCreateNode();
			op = this.util().extendTag(op,THIS);
			this.addMethod('create$',[],[op]).set({static: true});
			this.set({extends: Obj.wrap({extends: sup.name()})});
			this._config.extends = sup.name();
		} else if (sup.isClass()) {
			sup.resolveVariable(this.scope__().parent());
			let up = sup._variable && sup._variable.value();
			if (up) { up.set({extended: this}) };
		};
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
	
	// add some default css
	if (!STACK.tsc() && this.name() && this.name().toNodeName && !this.option('extension')) {
		// name.@nodeName ||= STACK.sourceId + '-' + STACK.generateId('')
		let name = this.name().toNodeName();
		if (name.indexOf('-') == -1) { name = name + '-tag' };
		STACK._css.add(name + ' { display:block; }');
	};
	
	if (this.option('export') && this.name() && this.name().isLowerCase && this.name().isLowerCase()) {
		this.warn("Lowercased tags are globally available - not exportable",{loc: this.option('export')});
	};
	return;
};

TagDeclaration.prototype.addElementReference = function (name,child){
	let refs = this._elementReferences || (this._elementReferences = {});
	
	if (refs[name] && refs[name] != child) {
		child.warn("Duplicate elements with same reference",{loc: name});
	} else {
		refs[name] = child;
		child.set({tagdeclbody: this._body});
	};
	return child;
};

TagDeclaration.prototype.js = function (s){
	this.scope().virtualize(); // is this always needed?
	this.scope().context().setValue(this.name());
	this.scope().context()._reference = this.name();
	
	let tsc = STACK.tsc();
	let className = this.name().toClassName();
	let sup = this._superclass;
	
	let anonGlobalTag = !this.option('extension') && (!this.name().isClass()) && tsc;
	
	let tpl = {
		name: this.name()._str,
		mixins: AST.cary(this._mixins).join(', ') || null
	};
	
	if (tsc) {
		tpl.declareName = tpl.localName = new MappedString(className,this.name());
		
		if (this.isGlobal() || this.isExtension()) {
			className = tpl.localName = new InternalName(this.name());
		};
	};
	
	if (sup && sup._variable) {
		sup = sup._variable;
	} else if (sup) {
		sup = CALL(this.runtime().getSuperTagType,[sup,STR(sup.toClassName()),this.runtime().Component]);
	} else {
		sup = this.runtime().Component;
	};
	
	if (tsc) {
		sup = this._superclass ? this._superclass.toClassName() : LIT('imba.Component');
		
		if (!(this.isExtension())) {
			// body.unshift(LIT("getTagName()\{ return '{tpl:name}' \}"),yes)
			// only if we do avoid the data thing
			// body.unshift(LIT("data = this.dataForTagName('{tpl:name}')"),yes)
			this.body().unshift(LIT('static $$TAG$$:true'),true);
			this.body().unshift(LIT('constructor(){ super() }',this._name),true);
		};
		
		tpl.body = this.body().c();
		
		if (!(this.isExtension()) && !this._declaredFields.data && !this._instanceMethodMap.data) {
			tpl.body = ("data = this.dataForTagName('" + (tpl.name) + "')\n") + tpl.body;
		};
		
		tpl.default = this.option('default');
		tpl.superName = this._superclass ? new MappedString(sup,this._superclass) : sup;
		
		try {
			tpl.export = this.option('export') || !(!this._name.variable()._value.isExported());
		} catch (e) { };
		
		if (this.isExtension() && this.isGlobal()) {
			return TPL(tpl,'class %localName { %body }\ndeclare global { interface %declareName extends %localName {} }');
		} else if (this.isExtension()) {
			try {
				tpl.path = this._name.variable().importPath();
			} catch (e) { };
			
			if (tpl.path) {
				return TPL(tpl,'%declareName\ndeclare module %path { interface %declareName extends %localName {} }\nclass %localName { %body }');
			};
			
			return TPL(tpl,'class %localName { %body }\n%export interface %declareName extends %localName {}');
		} else if (this.isGlobal()) {
			return TPL(tpl,'namespace Global {\nexport class %declareName extends %superName { %body }\n@{@mixins? export interface %declareName extends @mixins { }}\n}\ndeclare global {\n	namespace globalThis { export import %declareName = Global.%declareName }\n	interface HTMLElementTagNameMap { "%name": %declareName }\n}\n\n');
		} else {
			return TPL(tpl,'@{@mixins? %export %default interface %localName extends @mixins { }}\n%export %default class %localName extends %superName { %body }');
		};
	} else if (this.option('extension')) {
		let namevar = this._name._variable;
		let cls = namevar || CALL(this.runtime().getTagType,[this.name(),STR(this.name().toClassName())]);
		if (className == 'ImbaElement' || className == 'imba.Component') {
			cls = this.runtime().Component;
		};
		let tagname = new TagTypeIdentifier(this.name());
		// @className = LIT('1232')
		
		return ("(" + M('class',this.option('keyword')) + " \{" + (this.body().c()) + "\})");
	} else {
		if (this.name().isNative()) {
			this.name().error(("tag " + (this.name().symbol()) + " already exists"));
		};
	};
	
	let closure = this.scope__().parent();
	// console.log @cssns,@cssid
	if (this._cssns) { this._config.cssns = this.cssns() };
	if (this._cssid) { this._config.cssid = this.cssid() };
	if (this.name().isClass()) { this._config.name = this.name().symbol() };
	tpl.config = Obj.wrap(this._config);
	
	this._staticInits.add([BR,CALL(this.runtime().defineTag,[this.name(),THIS,tpl.config])]);
	
	if (this._staticInit) {
		this._staticInits.add([BR,CALL(OP('.',THIS,this.initKey()),[])]);
	};
	
	let jsbody = this.body().c();
	
	let jshead = ("" + M('class',this.keyword()) + " " + M(className,this.name()) + " " + this.mo('extends') + " ");
	
	if (this._mixins.length) {
		jshead += ("" + (CALL(STACK.corelib().multi$,[this.refSym(),sup || NULL].concat(this._mixins)).c()));
	} else if (sup) {
		jshead += ("" + M(sup));
	};
	
	if (this.option('export')) {
		if (this.option('default')) {
			jshead = ("" + this.mo('export') + " " + this.mo('default') + " " + jshead);
		} else {
			jshead = ("" + this.mo('export') + " " + jshead);
		};
	};
	
	return ("" + jshead + " \{" + jsbody + "\}");
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

Func.prototype.name = function(v){ return this._name; }
Func.prototype.setName = function(v){ this._name = v; return this; };
Func.prototype.params = function(v){ return this._params; }
Func.prototype.setParams = function(v){ this._params = v; return this; };
Func.prototype.target = function(v){ return this._target; }
Func.prototype.type = function(v){ return this._type; }
Func.prototype.context = function(v){ return this._context; }
Func.prototype.scopetype = function (){
	return FunctionScope;
};

Func.prototype.inject = function (line,o){
	return this._body.add([line,BR],o);
};

Func.prototype.nonlocals = function (){
	return this._scope._nonlocals;
};

Func.prototype.isGlobal = function (){
	return this.option('global');
};

Func.prototype.returnType = function (){
	return this.datatype();
};

Func.prototype.visit = function (stack,o){
	// any function inside descriptors should compile as strong scopes
	if (stack._descriptor && !stack.tsc()) {
		if (stack.indexOf(Func) <= stack.indexOf(Descriptor)) {
			this._scope = new MethodScope(this); // (o and o:scope) || typ.new(self)
			this._scope.setParams(this._params); // = ParamList.new([])
		};
	};
	
	this.scope().visit();
	
	if (this._desc) {
		this._desc._skip = true;
	};
	
	this._context = this.scope().parent();
	
	this._params.traverse({declaring: 'arg'});
	return this._body.traverse(); // so soon?
};

Func.prototype.funcKeyword = function (){
	let str = "function";
	if (this.option('async')) { str = ("async " + str) };
	return str;
};

Func.prototype.jsdoc = function (){
	return '';
};

Func.prototype.js = function (s,o){
	if (!this.option('noreturn')) { this.body().consume(new ImplicitReturn()) };
	var ind = this.body()._indentation;
	// var s = ind and ind.@open
	if (ind && ind.isGenerated()) { this.body()._indentation = null };
	var code = this.scope().c({indent: (!ind || !ind.isGenerated()),braces: true});
	
	var name = (typeof this._name == 'string') ? this._name : this._name.c();
	name = name ? (' ' + name.replace(/\./g,'_')) : '';
	var keyword = (o && o.keyword != undefined) ? o.keyword : this.funcKeyword();
	
	
	var out = ("" + M(keyword,this.option('def') || this.option('keyword')) + helpers.toValidIdentifier(name) + "(" + (this._params.c()) + ") ");
	
	if (STACK.tsc() && this.returnType()) {
		out += ':' + this.returnType().c();
	};
	
	
	out += code;
	// out = "async {out}" if option(:async)
	if (this.option('eval')) { out = ("(" + out + ")()") };
	return out;
};

Func.prototype.shouldParenthesize = function (par){
	if(par === undefined) par = this.up();
	return (par instanceof Call) && par._callee == this;
	// if up as a call? Only if we are
};

function IsolatedFunc(){ return Func.apply(this,arguments) };

subclass$(IsolatedFunc,Func);


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
			if (shadow._name == 'self' && USE_SAFE_RENDER_SELF) {
				return self._useSelf = shadow;
			} else {
				shadow._proxy = self._params.at(self._params.count(),true);
				return self._leaks.push(source);
			};
		});
	};
	return self;
};

function IifeFunc(){ return Func.apply(this,arguments) };

subclass$(IifeFunc,Func);

IifeFunc.prototype.js = function (s,o){
	if (!this.option('noreturn')) { this.body().consume(new ImplicitReturn()) };
	var ind = this.body()._indentation;
	var out = this.body().c({braces: true});
	return ("(()=>" + out + ")()");
};

function Walker(fn){
	this._func = fn;
	this._leaks = false;
	this._matches = [];
};


Walker.prototype.test = function (node){
	return false;
};

function Lambda(){ return Func.apply(this,arguments) };

subclass$(Lambda,Func);

Lambda.prototype.scopetype = function (){
	var k = this.option('keyword');
	return (k && k._value == 'ƒ') ? ((MethodScope)) : ((LambdaScope));
};

function AmperWalker(){ return Walker.apply(this,arguments) };

subclass$(AmperWalker,Walker);


AmperWalker.prototype.test = function (node){
	if (node instanceof Call) {
		node._args.consume(this);
		node._callee.consume(this);
		return;
	};
	
	if ((node instanceof VarOrAccess) && node._isSelf) {
		this._deopt = true;
	};
	
	let variable = node._variable;
	if (variable && !variable.isGlobal()) {
		this._deopt = true;
	};
	
	if ((node instanceof This) || (node instanceof Self)) {
		return this._self = node;
	};
};

function AmperFunc(){ return Lambda.apply(this,arguments) };

subclass$(AmperFunc,Lambda);

AmperFunc.prototype.scopetype = function (){
	return LambdaScope;
};

AmperFunc.prototype.js = function (s,o){
	// traverse into the function to see if it is dynamic
	let walker = new AmperWalker(this);
	this.body().consume(walker);
	
	// hash the output? Or the source? Maybe the source is enough?
	var out = this.body().c({braces: false});
	
	if (!walker._deopt && !STACK.tsc()) {
		let raw = this.body().sourcecode();
		let sym = raw.replace(/[\"]/g,"'");
		let that = walker._self;
		let pars = [LIT('"' + sym + '"'),walker._self || LIT('globalThis'),LIT(("(v$)=>" + out))];
		
		// moving scopeless amperfunctions out to the top of the file
		if (!that) {
			let scop = this.scope__().root();
			let lit = LIT(("" + (this.runtime().memofunc) + "(" + pars.map(function(_0) { return _0.c(); }).join(',') + ")"));
			let ref = scop._ampermap[sym];
			
			if (!ref) {
				let name = 'ƒ' + STACK.incr('ƒ'); // sym.replace('&.','ƒ')
				ref = scop._ampermap[sym] = scop.declare(name,lit);
			};
			
			return ref.c();
		};
		
		return ("" + (this.runtime().memofunc) + "(" + pars.map(function(_0) { return _0.c(); }).join(',') + ")");
	};
	
	return ("((v$)=>" + out + ")");
};

function RescueFunc(){ return Func.apply(this,arguments) };

subclass$(RescueFunc,Func);

RescueFunc.prototype.visit = function (o){
	this._scope = null;
	this.body().traverse();
	
	if (this.option('async')) {
		var fnscope = o.up(Func);
		fnscope && fnscope.set({async: true});
	};
	
	return this;
};

RescueFunc.prototype.js = function (s,o){
	let out;
	if (STACK.tsc()) {
		out = this.body().c({braces: false});
		return CALL(STACK.corelib().rescue$,[LIT(out)]).c();
	};
	
	this._body = this.body().consume(new ImplicitReturn());
	out = this.body().c({braces: false});
	
	let fn = '()=>{ try { ' + out + ' } catch(e) { return e; } }';
	
	if (this.option('async')) {
		return ("await (async " + fn + ")()");
	} else {
		return ("(" + fn + ")()");
	};
};



function ClosedFunc(){ return Func.apply(this,arguments) };

subclass$(ClosedFunc,Func);

ClosedFunc.prototype.scopetype = function (){
	return MethodScope;
};

function TagFragmentFunc(){ return Func.apply(this,arguments) };

subclass$(TagFragmentFunc,Func);

TagFragmentFunc.prototype.scopetype = function (){
	// caching still needs to be local no matter what?
	return this.option('closed') ? ((MethodScope)) : ((LambdaScope));
};

function MethodDeclaration(){ return Func.apply(this,arguments) };

subclass$(MethodDeclaration,Func);

MethodDeclaration.prototype.variable = function(v){ return this._variable; }
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

MethodDeclaration.prototype.isExcluded = function (){
	if (STACK.tsc()) {
		return this._envs && this._envs.find(function(_0) { return _0._key == 'JS'; }) || false;
	};
	
	if (this._envs) {
		return !this._envs.find(function(_0) { return _0.isTruthy(); });
	};
	return false;
};

MethodDeclaration.prototype.rawName = function (){
	return (this._name instanceof Identifier) ? ((this._name.toRaw())) : "";
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

MethodDeclaration.prototype.isMember = function (){
	return !this.option('static');
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
		// console.log "target?? {@target.@parent} {@context.node}"
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
	
	if (this.isExcluded()) { return };
	
	var o = this._options;
	this.scope().visit();
	let scop = this.scope();
	
	if (this.isSetter() && len$(this._params) > 1) {
		if (len$(this._params) > 2) {
			console.warn("setter with more than two params not allowed",this.name());
		};
		
		let prev = this._params.pop();
		// console.warn "setter with more than one param!!",name
		let op = OP('=',new VarReference(prev._value,'const'),OP('.',SELF,this.name()));
		this._body.add(op,0);
	};
	
	if (this.option('inObject')) {
		this._params.traverse();
		this._body.traverse();
		return this;
	};
	
	var closure = this._context = this.scope().parent().closure();
	
	if ((closure instanceof RootScope) && !(this.target()) && !(this._name instanceof DecoratorIdentifier)) {
		this.scope()._context = closure.context();
	} else if ((closure instanceof MethodScope) && !(this.target()) && !(this._name instanceof DecoratorIdentifier)) {
		this.scope()._selfless = true;
	};
	
	this._params.traverse();
	
	if (this._name.isPredicate && this._name.isPredicate() && !(this.isSetter()) && !(this.isGetter())) {
		this._name.warn("Only getters/setters should end with ?");
	};
	
	if (this.target() instanceof Identifier) {
		if (variable = this.scope().lookup(this.target().toString())) {
			this._target = variable;
		};
		// should be changed to VarOrAccess?!
	};
	
	if (String(this.name()) == 'initialize' && (closure instanceof ClassScope) && !(closure instanceof TagScope)) {
		this._type = 'constructor';
	};
	
	if (String(this.name()) == 'constructor' || this.isConstructor()) {
		this.up().set({ctor: this});
		this.set({noreturn: true});
	};
	
	// instance-method / member
	if ((closure instanceof ClassScope) && !(this.target())) {
		this._class = closure.node();
		this._target = closure.prototype();
		let inExt = closure.node().option('extension');
		this.set(
			{prototype: this._target,
			inClassBody: true,
			inExtension: inExt}
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
	
	ROOT._entities.add(this.namepath(),this);
	
	this._body.traverse();
	
	// traverse returnType
	if (this.returnType()) { this.returnType().traverse() };
	
	if (this.isConstructor()) {
		if (!this._class._superclass && this._class.hasMixins() && !STACK.tsc()) {
			this.scope().head().unshift(LIT('super()'));
		};
		
		let ref = this.scope__().context()._reference;
		let supr = this.option('supr');
		let node = supr && supr.node;
		let block = supr && supr.block;
		
		if (ref && node) {
			ref._declarator._defaults = null;
			let op = OP('=',ref,new This());
			block.replace(node,[node,op]);
		};
	};
	
	return this;
};

MethodDeclaration.prototype.supername = function (){
	return (this.type() == 'constructor') ? this.type() : this.name();
};

// FIXME export global etc are NOT valid for methods inside any other scope than
// the outermost scope (root)

MethodDeclaration.prototype.js = function (stack,co){
	var self = this;
	if(co === undefined) co = {};
	var o = self._options;
	var tsc = STACK.tsc();
	
	if (self.option('declareOnly') && !tsc) {
		return '';
	};
	
	if (self.isExcluded()) {
		return '';
	};
	
	// need to have collected them already?
	// if isConstructor and !option(:supr) and @class and @class.@mixins:length and !tsc
	// 	# Must happen above the potential first reference to this
	// 	body.add(LIT('super(...arguments)'),0)
	
	// FIXME Do this in the grammar - remnants of old implementation
	if (!(self.type() == 'constructor' || self.option('noreturn') || self.isSetter())) {
		if (self.option('chainable')) {
			self.body().add(new ImplicitReturn(self.scope().context()));
		} else if (self.option('greedy')) {
			// haaack
			self.body().consume(new GreedyReturn());
		} else {
			self.body().consume(new ImplicitReturn());
		};
	};
	
	var code = self.scope().c({indent: true,braces: true});
	var name = (typeof self._name == 'string') ? self._name : self._name.c({as: 'field'});
	var star = self.option('yield') ? '*' : '';
	var out = "";
	
	var tpl = tsc && {
		kind: self.option('keyword'),
		static: self.option('static'),
		export: self.option('export'),
		declare: self.option('declareOnly'),
		'default': self.option('default'),
		protected: self.option('protected'),
		async: self.option('async'),
		code: code, // with braces
		key: M(name,null,{as: 'field'}), // should not be precompiled
		name: self._name,
		get: self.isGetter() ? self.option('keyword') : null,
		set: self.isSetter() ? self.option('keyword') : null,
		returnType: self.returnType(),
		yield: self.option('yield') && LIT('*'),
		params: self.params(),
		generics: self._name && self._name.option('generics'),
		function: !self.option('inClassBody') && !self.option('inObject'),
		decorators: self._decorators
	};
	
	if (tsc) {
		if ((self._class && self._class.isInterface())) {
			tpl.code = ';';
		} else if (tpl.declare) {
			if (SourceMapper.strip(tpl.code).replace(/[\s\n\t]/g,'') == '{}') { tpl.code = '{ return }' };
		};
		
		
		let generics = {};
		let ret = self.returnType();
		let paramtypes = self.params().map(function(_0) { return _0.datatype(); });
		
		let all = [ret].concat(paramtypes.reverse());
		
		for (let i = 0, items = iter$(self.params()), len = items.length; i < len; i++) {
			let typ = items[i].datatype();
			if (typ) {
				typ.visit();
				if (typ._genericWrap) {
					let key = '$' + (i + 1);
					generics[key] = typ.makeGeneric(key);
				};
			};
		};
		
		for (let i = 0, items = iter$(all), len = items.length, typ; i < len; i++) {
			typ = items[i];
			if (!((typ instanceof TypeAnnotation))) { continue; };
			typ.visit();
			
			if (typ._generics) {
				
				typ._generics.forEach(function(_0) {
					let key = _0;
					let param = _0.match(/^\$\d+$/) ? self.params().at(parseInt(_0.slice(1)) - 1) : null;
					// dont push multiple times
					try {
						if (!param.datatype()) {
							param.setDatatype(new TypeAnnotation(key,LIT('')));
						};
						// if there is no data-type?
						return generics[key] = param.datatype().makeGeneric(key);
					} catch (e) {
						return console.log("error",e);
					};
				});
			};
		};
		
		let vals = Object.values(generics);
		if (vals.length) {
			tpl.generics || (tpl.generics = '<' + AST.cary(vals).join(',') + '>');
		};
		
		
		if (self._decorators) {
			tpl.decorators = AST.cary(self._decorators).join('\n');
		};
		
		let str = '@export @default @protected @static @async @get @set @function @yield@key@generics(@params)@{:@returnType} @code';
		
		if (tpl.static && self.returnType() && self.returnType().hasSelfReference()) {
			
			tpl.returnType = self.returnType().withReplacedThis('self');
			str = '// @ts-ignore\n@protected @static @async @function @yield@key<self extends abstract new (...args: any) => any>(this:self@{, @params})@{:@returnType};\n@protected @static @async @get @set @function @yield@key(@params) @code';
		};
		
		if (self._decorators) {
			tpl.decorators = AST.cary(self._decorators).join('\n');
			str = '@decorators\n' + str;
		};
		
		if (self.isGlobal()) {
			tpl.localName = new InternalName(self._name);
			str += '\ntype @localName = typeof @name;\ndeclare global { var @name : @localName }';
		};
		
		return TPL(tpl,str);
	};
	
	
	if ((self.option('inClassBody') || self.option('inObject')) && co.as != 'descriptor') {
		let prefix = '';
		if (self.isGetter()) {
			prefix = M('get',self.option('keyword')) + ' ';
		} else if (self.isSetter()) {
			prefix = M('set',self.option('keyword')) + ' ';
		};
		
		if (self.option('async')) { prefix = ("async " + prefix) };
		if (self.option('static')) { prefix = ("" + M('static',self.option('static')) + " " + prefix) };
		out = ("" + prefix + star + M(name,null,{as: 'field'}) + "(" + (self.params().c()) + ")");
		
		out += code;
		return out;
	};
	
	var func = ("(" + (self.params().c()) + ")") + code;
	var ctx = self.context();
	
	
	var fname = helpers.toValidIdentifier(AST.sym(self.name()));
	tpl = {
		localName: fname,
		declareName: fname
	};
	
	if (self.target()) {
		// TODO make this work with SymbolIdentifier
		if (fname[0] == '[') {
			fname = fname.slice(1,-1);
		} else {
			fname = ("'" + fname + "'");
		};
		
		if (self.isGetter()) {
			out = ("Object.defineProperty(" + (self.target().c()) + "," + fname + ",\{get: " + self.funcKeyword() + func + ", configurable: true\})");
			return out;
		} else if (self.isSetter()) {
			out = ("Object.defineProperty(" + (self.target().c()) + "," + fname + ",\{set: " + self.funcKeyword() + func + ", configurable: true\})");
			return out;
		} else {
			let k = OP('.',self.target(),self._name);
			out = ("" + (k.c()) + " = " + self.funcKeyword() + " " + func);
		};
		
		// should never use non es syntax anymore?
		if (o.export) {
			out = ("exports." + (o.default ? 'default' : fname) + " = " + out);
		};
	} else {
		// Should really use TPL for this too
		
		
		out = ("" + M(self.funcKeyword(),self.keyword()) + star + " " + M(fname,self._name) + func);
		if (o.export) {
			out = ("" + M('export',o.export) + " " + (o.default ? M('default ',o.default) : '') + out);
		};
	};
	
	if (o.global) {
		out = ("" + out + "; " + (self.scope__().root().globalRef()) + "." + fname + " = " + fname + ";");
	};
	
	if (self.option('return')) {
		out = ("return " + out);
	};
	
	out = self.jsdoc() + out;
	
	if (self.option('declareOnly') && !STACK.tsc()) {
		return '';
	};
	
	return out;
};

// Literals should probably not inherit from the same parent
// as arrays, tuples, objects would be better off inheriting
// from listnode.

function Literal(v){
	this._traversed = false;
	this._expression = true;
	this._cache = null;
	this._raw = null;
	this._value = this.load(v);
};

subclass$(Literal,ValueNode);

Literal.prototype.isConstant = function (){
	return true;
};

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
	return this._startLoc || (this._value && this._value.startLoc && this._value.startLoc());
};

Literal.prototype.endLoc = function (){
	return this._endLoc || (this._value && this._value.endLoc && this._value.endLoc());
};

function RawScript(){ return Literal.apply(this,arguments) };

subclass$(RawScript,Literal);

RawScript.prototype.c = function (){
	return this._value;
};

function Bool(v){
	this._value = v;
	this._raw = (String(v) == "true") ? true : false;
};

subclass$(Bool,Literal);

Bool.prototype.cache = function (){
	return this;
};

Bool.prototype.isPrimitive = function (){
	return true;
};

Bool.prototype.truthy = function (){
	return String(this.value()) == "true";
	// yes
};

Bool.prototype.js = function (o){
	return String(this._value);
};

Bool.prototype.c = function (){
	STACK._counter += 1;
	// undefined should not be a bool
	return String(this._value);
	// @raw ? "true" : "false"
};

Bool.prototype.toJSON = function (){
	return {type: 'Bool',value: this._value};
};

Bool.prototype.loc = function (){
	return this._value.region ? this._value.region() : [0,0];
};

function Undefined(){ return Literal.apply(this,arguments) };

subclass$(Undefined,Literal);

Undefined.prototype.isPrimitive = function (){
	return true;
};

Undefined.prototype.isTruthy = function (){
	return false;
};

Undefined.prototype.cache = function (){
	return this;
};

Undefined.prototype.c = function (){
	return M("undefined",this._value);
};

function Nil(){ return Literal.apply(this,arguments) };

subclass$(Nil,Literal);

Nil.prototype.isPrimitive = function (){
	return true;
};

Nil.prototype.isTruthy = function (){
	return false;
};

Nil.prototype.cache = function (){
	return this;
};

Nil.prototype.c = function (){
	let out = M("null",this._value);
	if (STACK.tsc() && this.datatype()) {
		out = out + ' as unknown as ' + this.datatype().c();
	};
	return out;
};

function True(){ return Bool.apply(this,arguments) };

subclass$(True,Bool);

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

Num.prototype.toString = function (){
	return String(this._value).replace(/\_/g,'');
};

Num.prototype.toNumber = function (){
	return (this._number == null) ? (this._number = parseFloat(this.toString())) : this._number;
};

Num.prototype.isPrimitive = function (deep){
	return true;
};

Num.prototype.isTruthy = function (){
	return this.toNumber() != 0;
};

Num.prototype.negate = function (){
	this._value = -this.toNumber();
	return this;
};

Num.prototype.shouldParenthesize = function (par){
	if(par === undefined) par = this.up();
	return (par instanceof Access) && par._left == this;
};

Num.prototype.js = function (o){
	return this.toString();
};

Num.prototype.c = function (o){
	if (this._cache) { return Num.prototype.__super__.c.call(this,o) };
	var out = M(this.toString(),this._value);
	var par = STACK.current();
	var paren = (par instanceof Access) && par._left == this;
	// only if this is the right part of the access
	return paren ? (("(" + out + ")")) : out;
};

Num.prototype.cache = function (o){
	if (!(o && (o.cache || o.pool))) { return this };
	return Num.prototype.__super__.cache.call(this,o);
};

Num.prototype.raw = function (){
	// really?
	return JSON.parse(this.toString());
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

NumWithUnit.prototype.negate = function (){
	this.set({negate: true});
	return this;
};

NumWithUnit.prototype.c = function (o){
	let unit = String(this._unit);
	let val = String(this._value);
	
	if (this.option('negate')) { val = ("-" + val) };
	
	if (unit == 'ms') {
		val = ("" + val);
	} else if (unit == 'kb') {
		val = ("(" + val + " * 1024)");
	} else if (unit == 'mb') {
		val = ("(" + val + " * 1024 * 1024)");
	} else if (unit == 'gb') {
		val = ("(" + val + " * 1024 * 1024 * 1024)");
	} else if (unit == 's') {
		val = ("(" + val + " * 1000)");
	} else if (unit == 'minutes') {
		val = ("(" + val + " * 60 * 1000)");
	} else if (unit == 'hours') {
		val = ("(" + val + " * 60 * 60 * 1000)");
	} else if (unit == 'days') {
		val = ("(" + val + " * 24 * 60 * 60 * 1000)");
	} else if (unit == 'n') {
		val = ("" + val + "n");
	} else if (unit == 'fps') {
		val = ("(1000 / " + val + ")");
	} else {
		val = ("" + val + unit);
		if (!(o && o.unqouted)) { val = ("'" + val + "'") };
	};
	
	if (OPTS.sourcemap && (!o || o.mark !== false)) {
		val = M(val,this);
	};
	return val;
};

NumWithUnit.prototype.endLoc = function (){
	return this._unit.endLoc();
};

function ExpressionWithUnit(value,unit){
	this._value = value;
	this._unit = unit;
};

subclass$(ExpressionWithUnit,ValueNode);

ExpressionWithUnit.prototype.js = function (o){
	let unit = String(this._unit);
	// util.unit(@value,STR(@unit)).c
	// let out = typeof @value == 'string' ? @value : @value.c
	return ("(" + (this.value().c()) + "+" + (STR(this._unit).c()) + ")");
};

// should be quoted no?
// what about strings in object-literals?
// we want to be able to see if the values are allowed
function Str(v){
	this._traversed = false;
	this._expression = true;
	this._cache = null;
	this._value = v;
	// should grab the actual value immediately?
};

subclass$(Str,Literal);

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
	
	return this._raw || (this._raw = String(this.value()).slice(1,-1)); // incredibly stupid solution
};

Str.prototype.isValidIdentifier = function (){
	// there are also some values we cannot use
	return this.raw().match(/^[a-zA-Z\$\_]+[\d\w\$\_]*$/) ? true : false;
};

Str.prototype.isTemplate = function (){
	return String(this._value)[0] == '`';
};

Str.prototype.js = function (o){
	return String(this._value);
};

Str.prototype.cache = function (o){
	// should never cache basic strings?
	if (this.raw().length > 20) {
		Str.prototype.__super__.cache.apply(this,arguments);
	};
	
	return this;
};

Str.prototype.c = function (o){
	return this._cache ? Str.prototype.__super__.c.call(this,o) : ((M(this.js(),this._value,o)));
};

function TemplateString(){ return ListNode.apply(this,arguments) };

subclass$(TemplateString,ListNode);

TemplateString.prototype.js = function (){
	let parts = this._nodes.map(function(node) {
		return ((typeof node=='string'||node instanceof String)) ? node : node.c();
	});
	
	let out = '`' + parts.join('') + '`';
	return out;
};

function Interpolation(){ return ValueNode.apply(this,arguments) };

subclass$(Interpolation,ValueNode);



// Currently not used - it would be better to use this
// for real interpolated strings though, than to break
// them up into their parts before parsing
function InterpolatedString(nodes,o){
	if(o === undefined) o = {};
	this._nodes = nodes;
	this._options = o;
	this;
};

subclass$(InterpolatedString,Node);

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

InterpolatedString.prototype.startLoc = function (){
	return this.option('open').startLoc();
};

InterpolatedString.prototype.endLoc = function (){
	return this.option('close').endLoc();
};

InterpolatedString.prototype.isString = function (){
	return true;
};

InterpolatedString.prototype.isTemplate = function (){
	return String(this.option('open')) == '`';
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

InterpolatedString.prototype.js = function (o,opts){
	
	var self = this;
	var kind = String(self.option("open") || '"');
	if (kind.length == 3) {
		kind = kind[0];
	};
	// creating the string
	if (opts && opts.as == 'template') {
		var parts = [];
		self._nodes.map(function(part,i) {
			if ((part instanceof Token) && part._type == 'NEOSTRING') {
				return parts.push(self.escapeString(part._value));
			} else if (part) {
				return parts.push('${',part.c({expression: true}),'}');
			};
		});
		return '`' + parts.join('') + '`';
	} else {
		var noparen = self._noparen;
		parts = [];
		var str = noparen ? '' : '(';
		self._nodes.map(function(part,i) {
			if ((part instanceof Token) && part._type == 'NEOSTRING') {
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
		if (!noparen) { str += ')' };
	};
	return str;
};

// Because we've dropped the Str-wrapper it is kinda difficult
function Symbol(){ return Literal.apply(this,arguments) };

subclass$(Symbol,Literal);

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

RegExp.prototype.isPrimitive = function (){
	return true;
};

RegExp.prototype.js = function (){
	var m;
	var v = RegExp.prototype.__super__.js.apply(this,arguments);
	
	// special casing heregex
	if (m = constants.HEREGEX.exec(v)) {
		// console.log 'matxhed heregex',m
		var re = m[1].replace(constants.HEREGEX_OMIT,'').replace(/\//g,'\\/');
		return '/' + (re || '(?:)') + '/' + m[2];
	};
	
	return (v == '//') ? '/(?:)/' : v;
};

// Should inherit from ListNode - would simplify
function Arr(){ return Literal.apply(this,arguments) };

subclass$(Arr,Literal);

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
	out = ("[" + out + "]");
	if (this.datatype() && STACK.tsc()) {
		out = out + ' as ' + this.datatype().c();
	};
	return out;
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

// should not be cklassified as a literal?
function Obj(){ return Literal.apply(this,arguments) };

subclass$(Obj,Literal);

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
	// return k if k.key.symbol == key
};

// add method for finding properties etc?
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

// for converting a real object into an ast-representation
Obj.wrap = function (obj){
	var attrs = [];
	for (let v, i = 0, keys = Object.keys(obj), l = keys.length, k; i < l; i++){
		k = keys[i];v = obj[k];if (v instanceof Array) {
			v = Arr.wrap(v);
		} else if (v.constructor == Object) {
			v = Obj.wrap(v);
		};
		// if k isa String
		//	k = LIT(k)
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

function NumberLike(){ return ValueNode.apply(this,arguments) };

subclass$(NumberLike,ValueNode);

NumberLike.prototype.consume = function (node){
	if (node == NumberLike || (node instanceof NumberLike)) {
		return this;
	};
	return NumberLike.prototype.__super__.consume.apply(this,arguments);
};

NumberLike.prototype.js = function (){
	return ("(" + (this._value.c()) + ").valueOf()");
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

ObjAttr.prototype.key = function(v){ return this._key; }
ObjAttr.prototype.value = function(v){ return this._value; }
ObjAttr.prototype.setValue = function(v){ this._value = v; return this; };

ObjAttr.prototype.visit = function (stack,state){
	// should probably traverse key as well, unless it is a dead simple identifier
	this._key.traverse();
	if (this._value) { this._value.traverse() };
	if (this._defaults) { this._defaults.traverse() };
	
	let decl = state && state.declaring;
	
	if (this._key instanceof Ivar) {
		if (!(this._value)) {
			(this._key = new Identifier(this._key.value()),this);
			(this._value = OP('.',this.scope__().context(),this._key),this);
			if (this._defaults) {
				(this._value = OP('=',this._value,this._defaults),this);
				this._defaults = null;
			};
		};
	} else if (this._key instanceof Private) {
		if (!(this._value)) {
			(this._value = OP('.',this.scope__().context(),this._key),this);
			(this._key = new Identifier(this._key.value()),this);
		};
	} else if (this._key instanceof Identifier) {
		// if state && state:declaring
		// 	key.variable = scope__.register(key.symbol,key)\
		// isnt this rather going to
		
		if (!(this._value)) {
			if (decl) {
				(this._value = this.scope__().register(this._key.symbol(),this._key,{type: decl}),this);
				(this._value = this._value.via(this._key),this);
				
				if (this._defaults) {
					(this._value = OP('=',this._value,this._defaults),this);
					this._defaults = null;
				};
			} else {
				(this._value = this.scope__().lookup(this._key.symbol()),this);
				if (!(this._value)) {
					(this._value = OP('.',this.scope__().context(),this._key),this);
				};
			};
		};
	};
	
	return this;
};

ObjAttr.prototype.js = function (o){
	let key = this._key;
	let kjs;
	
	// if key isa Identifier and String(key.@value)[0] == '@'
	// 	key = Ivar.new(key)
	
	if ((key instanceof IdentifierExpression) || (key instanceof SymbolIdentifier)) {
		// streamline this interface
		kjs = key.asObjectKey();
	} else if (key instanceof InterpolatedString) {
		kjs = ("[" + (key.c()) + "]");
	} else if ((key instanceof Num) || key.isReserved()) {
		kjs = ("'" + (key.c()) + "'");
	} else if ((key instanceof Str) && key.isValidIdentifier()) {
		kjs = key.raw();
	} else {
		kjs = key.c({as: 'key'});
	};
	
	// var k = key.isReserved ? "'{key.c}'" : key.c
	
	if (this._defaults) {
		return ("" + kjs + " = " + (this._defaults.c()));
	} else if (this._value) {
		return ("" + kjs + ": " + (this._value.c()));
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

function ObjRestAttr(){ return ObjAttr.apply(this,arguments) };

subclass$(ObjRestAttr,ObjAttr);

ObjRestAttr.prototype.js = function (o){
	
	let key = this.key();
	if (this.value()) {
		return ("..." + (this.value().c()));
	} else {
		return ("..." + (key.c()));
	};
};

function ArgsReference(){ return Node.apply(this,arguments) };

subclass$(ArgsReference,Node);

ArgsReference.prototype.c = function (){
	return "arguments";
};

// should be a separate Context or something
function Self(value){
	this._value = value;
};

subclass$(Self,Literal);

Self.prototype.cache = function (){
	return this;
};

Self.prototype.reference = function (){
	return this;
};

Self.prototype.visit = function (){
	this._scope__ = this.scope__();
	this._scope__.context();
	return this;
};

Self.prototype.js = function (){
	var s = this._scope__ || this.scope__();
	return s ? s.context().c() : "this";
};

Self.prototype.c = function (){
	let out = M(this.js(),this._value);
	let typ = STACK.tsc() && this.option('datatype');
	let gen = STACK.tsc() && this.option('generics');
	if (gen) {
		// TODO what about sourcemapping?
		out += String(gen);
	};
	
	if (typ) {
		out = ("" + out + " as any as (" + (typ.c()) + ")");
	};
	
	return out;
};

function This(){ return Self.apply(this,arguments) };

subclass$(This,Self);

This.prototype.cache = function (){
	return this;
};

This.prototype.reference = function (){
	return this;
};

This.prototype.visit = function (){
	return this;
};

This.prototype.js = function (){
	return "this";
};

// OPERATORS

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
	} else if (this._op == 'not') {
		this._op = '!';
	};
	this._left = l;
	this._right = r;
	return this;
};

subclass$(Op,Node);

Op.prototype.op = function(v){ return this._op; }
Op.prototype.visit = function (){
	if (this._right && this._right.traverse) { this._right.traverse() };
	if (this._left && this._left.traverse) { this._left.traverse() };
	return this;
};

Op.prototype.startLoc = function (){
	// what about ++test?
	return this._startLoc || this._left.startLoc();
};

Op.prototype.endLoc = function (){
	return this._endLoc || (this._right || this._left).endLoc();
};

Op.prototype.hasTagRight = function (){
	if (this.isLogical()) {
		let l = this._left.unwrappedNode();
		let r = this._right.unwrappedNode();
		
		if (r instanceof TagLike) {
			return true;
		};
		if ((r instanceof Op) && r.hasTagRight()) {
			return true;
		};
		if ((r instanceof Op) && r.hasTagRight()) {
			return true;
		};
	};
	return false;
};

Op.prototype.opToIfTree = function (){
	if (this.hasTagRight()) {
		let l = this._left.unwrappedNode();
		let r = this._right.unwrappedNode();
		
		if (this._op == '&&') {
			if ((l instanceof Op) && l.hasTagRight()) {
				this._left.warn("Tag not allowed here");
			};
			
			if (l instanceof Op) { l = l.opToIfTree() };
			if (r instanceof Op) { r = r.opToIfTree() };
			
			if (r instanceof If) {
				r._test = OP('&&',l,r.test());
				return r;
			};
			
			return new If(l,new Block([r])).traverse();
		} else if (this._op == '||') {
			if (l instanceof Op) { l = l.opToIfTree() };
			
			if (l instanceof If) {
				return l.addElse(new Block([r]));
			} else {
				return new If(l,new Block([])).addElse(new Block([r])).traverse();
			};
		};
	};
	return this;
};

Op.prototype.isExpressable = function (){
	// what if right is a string?!?
	return !(this._right) || this._right.isExpressable();
};

Op.prototype.js = function (o){
	var out = null;
	
	if (STACK.tsc() && this.isBitwise()) {
		if (this.isAssignment()) {
			let typ = String(this._op).split('=');
			this._op = '=';
			this._right = OP(typ[0],this._left,this._right);
		} else {
			if (this._right) { this._right = this._right.consume(NumberLike) };
			if (this._left) { this._left = this._left.consume(NumberLike) };
		};
	};
	
	var op = this._op;
	let opv = op;
	
	var l = this._left;
	var r = this._right;
	
	// make the left and right consume valueOf
	
	if (op == '!&') {
		return ("(" + C(l) + " " + M('&',this._opToken) + " " + C(r) + ")==0");
	} else if (op == '??') {
		return ("(" + C(l) + " " + M(op,this._opToken) + " " + C(r) + ")");
	} else if (op == '|=?') {
		return If.ternary(OP('==',new Parens([OP('&',l,r.cache())]),r),FALSE,new Parens([OP('|=',l,r),TRUE])).c();
	} else if (op == '~=?') {
		return If.ternary(OP('&',l,r.cache()),new Parens([OP('~=',l,r),TRUE]),
		FALSE).c();
	} else if (op == '^=?') {
		return OP('!!',OP('&',OP('^=',l,r.cache()),r)).c();
	} else if (op == '=?') {
		r.cache();
		return If.ternary(OP('!=',l,r),new Parens([OP('=',l,r),TRUE]),
		FALSE).c();
	};
	
	let neg = false;
	
	if (op == 'isnt') {
		neg = true;
		op = 'is';
	};
	
	if (op == 'is') {
		let res;
		if (r instanceof Parens) {
			l.cache();
			res = r.consume(new Util.Is([l,null]));
		} else {
			res = new Util.Is([l,r]);
		};
		
		if (neg) {
			return ("!(" + (res.c()) + ")");
		} else {
			return ("(" + (res.c()) + ")");
		};
	};
	
	if (l instanceof Node) { l = l.c() };
	if (r instanceof Node) { r = r.c() };
	
	if (l && r) {
		out || (out = ("" + l + " " + M(op,this._opToken) + " " + r));
	} else if (l) {
		let s = (this._opToken && this._opToken.spaced) ? ' ' : '';
		out || (out = ("" + M(op,this._opToken) + s + l));
	};
	
	return out;
};

Op.prototype.isString = function (){
	return this._op == '+' && this._left && this._left.isString();
};

Op.prototype.isLogical = function (){
	return this._op == '&&' || this._op == '||' || this._op == 'or' || this._op == 'and';
};

Op.prototype.isBitwise = function (){
	return !(!constants.BITWISE_OPERATORS[this._op]);
};

Op.prototype.isAssignment = function (){
	return !(!constants.ASSIGNMENT_OPERATORS[this._op]);
};

Op.prototype.shouldParenthesize = function (){
	return this._parens;
	// option(:parens)
};

Op.prototype.precedence = function (){
	return 10;
};

Op.prototype.consume = function (node){
	
	var v_;
	if (node == NumberLike) {
		if (this.isBitwise()) {
			return this;
		};
	} else if (node instanceof Walker) {
		if (this._left) { this._left.consume(node) };
		if (this._right) { this._right.consume(node) };
	};
	
	if (node instanceof Util.Is) {
		if (this._op == '!') {
			(this._left = this._left.consume(node),this);
		} else if (this.isLogical()) {
			if (this._left) { ((this._left = v_ = this._left.consume(node),this),v_) };
			if (this._right) { ((this._right = v_ = this._right.consume(node),this),v_) };
		} else if (this instanceof Access) {
			return node.clone(this);
		};
		
		return this;
	};
	
	if (this.isExpressable()) { return Op.prototype.__super__.consume.apply(this,arguments) };
	
	// TODO can rather use global caching?
	var tmpvar = this.scope__().declare('tmp',null,{system: true});
	var clone = OP(this._op,this._left,null);
	var ast = this._right.consume(clone);
	if (node) { ast.consume(node) };
	return ast;
};

function ComparisonOp(){ return Op.apply(this,arguments) };

subclass$(ComparisonOp,Op);

ComparisonOp.prototype.invert = function (){
	// are there other comparison ops?
	// what about a chain?
	var op = this._op;
	var pairs = ["==","!=","===","!==",">","<=","<",">="];
	var idx = pairs.indexOf(op);
	idx += ((idx % 2) ? (-1) : 1);
	this._op = pairs[idx];
	this._invert = !this._invert;
	return this;
};

ComparisonOp.prototype.c = function (){
	if (this._left instanceof ComparisonOp) {
		this._left._right.cache();
		return OP('&&',this._left,OP(this.op(),this._left._right,this._right)).c();
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

UnaryOp.prototype.invert = function (){
	if (this.op() == '!') {
		return this._left;
	} else {
		return UnaryOp.prototype.__super__.invert.apply(this,arguments); // regular invert
	};
};

UnaryOp.prototype.isTruthy = function (){
	var val = AST.truthy(this._left);
	return (val !== undefined) ? ((!val)) : ((undefined));
};

UnaryOp.prototype.js = function (o){
	var l = this._left;
	var r = this._right;
	var op = this.op();
	var s = (this._opToken && this._opToken.spaced) ? ' ' : '';
	
	if (op == 'not') {
		op = '!';
	};
	
	if (op == '!' || op == '!!') {
		// l.@parens = yes
		var str = l.c();
		var paren = l.shouldParenthesize(this);
		// FIXME this is a very hacky workaround. Need to handle all this
		// in the child instead, problems arise due to automatic caching
		if (!((str.match(/^\!?([\w\.]+)$/) || (l instanceof Parens) || paren || (l instanceof Access) || (l instanceof Call)) && !str.match(/[\s\&\|]/))) {
			str = '(' + str + ')';
		};
		// l.set(parens: yes) # sure?
		return ("" + op + str);
	} else if (this._left) {
		return ("" + (l.c()) + s + op);
	} else {
		return ("" + op + s + (r.c()));
	};
};

UnaryOp.prototype.normalize = function (){
	if (this.op() == '!') { return this };
	var node = (this._left || this._right).node();
	// for property-accessors we need to rewrite the ast
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

InstanceOf.prototype.js = function (s,o){
	
	if (this._right instanceof Str) {
		let out = ("typeof (" + (this._left.c()) + ")===" + (this._right.c()));
		if (s.parent() instanceof Op) { out = helpers.parenthesize(out) };
		return out;
	};
	
	// fix checks for String and Number
	if (this._right instanceof Parens) {
		let out = this._right.consume(new Util.Isa([STACK.tsc() ? this._left : this._left.cache(),null,this._op])).c();
		out = helpers.parenthesize(out); // if o.parent isa Op
		return out;
	};
	
	if (String(this._op) == 'instanceof' || STACK.tsc()) {
		let out = ("" + (this._left.c()) + " " + M('instanceof',this._opToken) + " " + (this._right.c()));
		if (s.parent() instanceof Op) { out = helpers.parenthesize(out) };
		return out;
	};
	
	return new Util.Isa([this._left,this._right,this._op]).js(s,o);
};

function TypeOf(){ return Op.apply(this,arguments) };

subclass$(TypeOf,Op);

TypeOf.prototype.js = function (o){
	return ("typeof " + (this._left.c()));
};

function Delete(){ return Op.apply(this,arguments) };

subclass$(Delete,Op);

Delete.prototype.js = function (o){
	// TODO this will execute calls several times if the path is not directly to an object
	// need to cache the receiver
	var l = this._left;
	var tmp = this.scope__().temporary(this,{pool: 'val'});
	var o = OP('=',tmp,l);
	// FIXME
	return ("(" + (o.c()) + ",delete " + (l.c()) + ", " + (tmp.c()) + ")"); // oh well
	// var ast = [OP('=',tmp,left),"delete {left.c}",tmp]
	// should parenthesize directly no?
	// ast.c
};

Delete.prototype.shouldParenthesize = function (){
	return true;
};

function In(){ return Op.apply(this,arguments) };

subclass$(In,Op);

In.prototype.js = function (s,o){
	
	if (this._right instanceof Parens) {
		let out = this._right.consume(new Util.In([STACK.tsc() ? this._left : this._left.cache(),null])).c();
		out = helpers.parenthesize(out);
		return out;
	};
	
	return new Util.In([this._left,this._right]).js(s,o);
};

// ACCESS

function Access(o,l,r){
	// set expression yes, no?
	this._expression = false;
	this._traversed = false;
	this._parens = false;
	this._cache = null;
	this._invert = false;
	this._op = o && o._value || o;
	this._optok = o;
	this._left = l;
	this._right = r;
	return this;
};

subclass$(Access,Op);

Object.defineProperty(Access.prototype,'is_namespace',{get: function(){
	return (this._left instanceof VarOrAccess) && this._left.is_namespace;
}, configurable: true});

Access.prototype.startLoc = function (){
	return (this._left instanceof ScopeContext) ? (this._right).startLoc() : (this._left || this._right).startLoc();
};

Access.prototype.endLoc = function (){
	return this._right && this._right.endLoc();
};

Access.prototype.clone = function (left,right){
	var ctor = this.constructor;
	return new ctor(this.op(),left,right);
};

Access.prototype.isRuntimeReference = function (){
	if ((this._left instanceof VarOrAccess) && (this._left._variable instanceof ImbaRuntime)) {
		if (this._right instanceof Identifier) {
			return this._right.toString();
		};
		return true;
	};
	return false;
};
// def datatype
//	right:datatype ? right.datatype : null

Access.prototype.js = function (stack){
	var opjs, r;
	var raw = null;
	var lft = this._left;
	var rgt = this._right;
	var rgtexpr = null;
	var tsc = STACK.tsc();
	
	if ((lft instanceof VarOrAccess) && (lft._variable instanceof ImportProxy)) {
		return lft._variable.access(rgt,lft).c();
	};
	
	if (rgt instanceof Token) {
		rgt = new Identifier(rgt);
	};
	
	var ctx = (lft || this.scope__().context());
	var pre = "";
	var mark = '';
	
	let safeop = this.safechain() ? '?' : '';
	
	if (!this._startLoc) {
		this._startLoc = (lft || rgt).startLoc();
	};
	
	if ((lft instanceof Super) && stack.method() && stack.method().option('inExtension') && false) {
		return CALL(
			OP('.',this.scope__().context(),'super$'),
			[(rgt instanceof Identifier) ? rgt.toStr() : rgt]
		).c();
	};
	
	if ((rgt instanceof Index) && (rgt.value() instanceof Num)) {
		rgt = rgt.value();
	};
	
	if (rgt instanceof Num) {
		// FIXME not adding type info
		if (rgt.toNumber() < 0 && !STACK.tsc()) {
			// TODO Make typescript check if it will viably work
			return safeop ? this.util().optNegIndex(ctx,rgt).c() : this.util().negIndex(ctx,rgt).c();
		};
		
		return ctx.c() + ("" + (safeop ? '?.' : '') + "[") + rgt.c() + "]";
	};
	
	// is this right? Should not the index compile the brackets
	// or value is a symbol -- should be the same, no?
	if ((rgt instanceof Index) && ((rgt.value() instanceof Str) || (rgt.value() instanceof Symbol))) {
		rgt = rgt.value();
	};
	
	// TODO do the identifier-validation in a central place instead
	if ((rgt instanceof Str) && rgt.isValidIdentifier()) {
		raw = rgt.raw();
	} else if ((rgt instanceof Symbol) && rgt.isValidIdentifier()) {
		raw = rgt.raw();
	} else if (rgt instanceof InterpolatedIdentifier) {
		rgt = rgt.value();
	} else if (rgt instanceof SymbolIdentifier) {
		true;
	} else if ((rgt instanceof Identifier) && rgt.isValidIdentifier()) {
		raw = rgt.c();
	};
	
	if (tsc) {
		let check = ("'" + rgt.c({mark: false}) + "' in " + (ctx.c()));
		if ((rgt instanceof Identifier) && rgt.isPredicate() && !(lft instanceof Self)) {
			let val = ("" + (ctx.c()) + "." + (rgt.c()));
			
			if (this._call) {
				return ("(" + check + " && " + val + " instanceof Function && " + val + ")");
			} else if (this._assigns) {
				return ("(" + check + " && " + (ctx.c()) + ")." + (rgt.c()));
			} else {
				return ("(" + check + " && " + val + ")");
			};
		} else if (safeop && (rgt instanceof Identifier)) {
			if (this._call) {
				return ("((" + check + ") && " + (ctx.c()) + "?." + (rgt.c()) + " instanceof Function && " + (ctx.c()) + "." + (rgt.c()) + ")");
			} else {
				return ("((" + check + ") && " + (ctx.c()) + "?." + (rgt.c()) + ")");
			};
		};
	};
	
	// really?
	// var ctx = (left || scope__.context)
	var out = raw ? (
		// see if it needs quoting
		// need to check to see if it is legal
		opjs = tsc ? M('.',this._optok) : '.',
		ctx ? (("" + safeop + opjs + raw)) : raw
	) : (
		r = (rgt instanceof Node) ? rgt.c({expression: true,as: 'value'}) : rgt,
		("" + (safeop ? '?.' : '') + "[" + r + "]")
	);
	
	// console.log "access up {stack.up}"
	
	// let typ = datatype
	let up = stack.up();
	let typ = tsc && this.option('datatype');
	
	if (ctx) {
		out = ctx.c() + out;
	};
	
	if (this instanceof ImplicitAccess) {
		out = M(out,rgt._token || rgt._value);
	};
	
	// tricky?
	if (typ && (!(up instanceof Assign) || up._right.node() == this)) {
		
		if ((up instanceof Block) && ((this instanceof ImplicitAccess) || (lft instanceof Self))) {
			out = out + ' as ' + typ.c();
		} else {
			out = out + ' as ' + typ.c();
		};
	};
	
	out = pre + out;
	
	if (pre) {
		out = ("(" + out + ")");
	};
	return out;
};

Access.prototype.visit = function (){
	let lft = this._left;
	if (this._left) { this._left.traverse() };
	
	if (this._right) { this._right.traverse() };
	this._left || (this._left = this.scope__().context());
	return;
};

Access.prototype.isExpressable = function (){
	return true;
};

Access.prototype.alias = function (){
	return (this._right instanceof Identifier) ? this._right.alias() : Access.prototype.__super__.alias.call(this);
};

Access.prototype.safechain = function (){
	return String(this._op) == '?.';
};

Access.prototype.cache = function (o){
	return ((this._right instanceof Ivar) && !(this._left)) ? this : Access.prototype.__super__.cache.call(this,o);
};

Access.prototype.shouldParenthesizeInTernary = function (){
	return this._parens || this._cache;
};

Access.prototype.datatype = function (){
	return Access.prototype.__super__.datatype.apply(this,arguments) || this._right.datatype();
};

function ImplicitAccess(){ return Access.apply(this,arguments) };

subclass$(ImplicitAccess,Access);



// Should change this to just refer directly to the variable? Or VarReference
function LocalVarAccess(){ return Access.apply(this,arguments) };

subclass$(LocalVarAccess,Access);

LocalVarAccess.prototype.safechain = function(v){ return this._safechain; }
LocalVarAccess.prototype.js = function (o){
	if ((this._right instanceof Variable) && this._right.type() == 'meth') {
		if (!((this.up() instanceof Call))) { return ("" + (this._right.c()) + "()") };
	};
	
	return this._right.c();
};

LocalVarAccess.prototype.variable = function (){
	return this._right;
};

LocalVarAccess.prototype.cache = function (o){
	if(o === undefined) o = {};
	if (o.force) { LocalVarAccess.prototype.__super__.cache.call(this,o) };
	return this;
};

LocalVarAccess.prototype.alias = function (){
	return this._right._alias || LocalVarAccess.prototype.__super__.alias.call(this);
};

function PropertyAccess(o,l,r){
	this._traversed = false;
	this._invert = false;
	this._parens = false;
	this._expression = false; // yes?
	this._cache = null;
	this._op = o;
	this._left = l;
	this._right = r;
	return this;
};

subclass$(PropertyAccess,Access);

PropertyAccess.prototype.visit = function (){
	if (this._right) { this._right.traverse() };
	if (this._left) { this._left.traverse() };
	return this;
};

// right in c we should possibly override
// to create a call and regular access instead

PropertyAccess.prototype.js = function (o){
	// if var rec = receiver
	// 	var ast = CALL(OP('.',left,right),[]) # convert to ArgList or null
	// 	ast.receiver = rec
	// 	return ast.c
	
	var up = this.up();
	// really need to fix this - for sure
	// should be possible for the function to remove this this instead?
	var js = ("" + PropertyAccess.prototype.__super__.js.call(this,o));
	return js;
};

PropertyAccess.prototype.receiver = function (){
	if (this._left instanceof Super) {
		return SELF;
	} else {
		return null;
	};
};

function IvarAccess(){ return Access.apply(this,arguments) };

subclass$(IvarAccess,Access);

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

IndexAccess.prototype.cache = function (o){
	if(o === undefined) o = {};
	if (o.force) { return IndexAccess.prototype.__super__.cache.apply(this,arguments) };
	this._right.cache();
	return this;
};

function VarAccess(){ return ValueNode.apply(this,arguments) };

subclass$(VarAccess,ValueNode);



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

VarOrAccess.prototype.isGlobal = function (name){
	return this._variable && this._variable.isGlobal(name);
};

Object.defineProperty(VarOrAccess.prototype,'is_global',{get: function(){
	return !this._variable || (this.is_class && this._variable._value.isGlobal());
}, configurable: true});

Object.defineProperty(VarOrAccess.prototype,'is_globalThis',{get: function(){
	return this._variable && this._variable == ROOT.GLOBAL;
}, configurable: true});

Object.defineProperty(VarOrAccess.prototype,'is_class',{get: function(){
	return this._variable && (this._variable._value instanceof ClassDeclaration);
}, configurable: true});

Object.defineProperty(VarOrAccess.prototype,'is_import',{get: function(){
	return this._variable && this._variable.is_import;
}, configurable: true});

Object.defineProperty(VarOrAccess.prototype,'global_interface',{get: function(){
	return !this._variable && GLOBAL_INTERFACES[this._token];
}, configurable: true});

Object.defineProperty(VarOrAccess.prototype,'is_namespace',{get: function(){
	// or is import?
	return (!this._variable && !this._isSelf) || this.is_class || this.is_import || this.is_globalThis;
}, configurable: true});

VarOrAccess.prototype.startLoc = function (){
	return this._token.startLoc();
};

VarOrAccess.prototype.endLoc = function (){
	return this._token.endLoc();
};

// Shortcircuit traverse so that it is not added to the stack?!
VarOrAccess.prototype.visit = function (stack,state){
	// @identifier = value # this is not a real identifier?
	var datatype_, v_;
	var variable;
	var scope = this.scope__();
	var name = this.value().symbol();
	
	if (state && state.declaring) {
		// console.log "VarOrAccess {@identifier}"
		variable = scope.register(this.value(),this,{type: state.declaring});
	};
	
	// if name == '$'
	//	if @tagref = stack.up(Tag)
	//		return self
	
	variable || (variable = scope.lookup(this.value().symbol()));
	
	if (variable && (variable instanceof GlobalReference)) {
		let name = variable.name();
		
		if ((variable instanceof ZonedVariable) && !stack.tsc()) {
			this._value = variable.forScope(scope);
		} else if (stack.tsc()) {
			this._value = LIT(name);
		} else if (stack.isNode()) {
			this._value = LIT(scope.imba().c());
			if (name != 'imba') {
				this._value = LIT(("" + (scope.imba().c()) + "." + name));
			};
		} else {
			this._value = LIT(name);
		};
	} else if (variable && variable._declarator) {
		// var decl = variable.declarator
		let vscope = variable.scope();
		
		// if the variable is not initialized just yet and we are
		// in the same scope - we should not treat this as a var-lookup
		// ie.  var x = x would resolve to var x = this.x() if x
		// was not previously defined
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
		
		// should do this even if we are not in the same scope?
		// we only need to be in the same closure(!)
		
		if (variable && variable._initialized || (scope.closure() != vscope.closure())) {
			this._variable = variable;
			variable.addReference(this);
			this._value = variable; // variable.accessor(self)
			this._token._variable = variable;
			// if vscope isa RootScope and vscope.context != scope.context and variable.type == 'meth'
			// 	warn "calling method from root scope {value} is deprecated - see issue #112"
			return this;
		};
		// FIX
		// @value.safechain = safechain
	} else if (this.value().symbol() == 'self') {
		this._value = scope.context();
		this._isSelf = true;
	} else if (!this._identifier.isCapitalized()) {
		let selfvar = scope.lookup('self');
		let ctx = scope.context();
		if (!selfvar && ctx.isGlobalContext()) {
			this._includeType = true;
		} else {
			this._isSelf = true;
			
			if (this.value().symbol() == 'constructor' && true) {
				let cls = STACK.up(ClassDeclaration);
				// console.log "Constructor reference!!",!!cls
				(datatype_ = this.datatype()) || ((this.setDatatype(v_ = new ConstructorType(cls)),v_));
				// are we really sending this datatype in here??
			};
			
			this._value = new ImplicitAccess(".",(new Self()).traverse(),this._value); // .set(datatype: datatype)
		};
	} else {
		this._isGlobal = true;
	};
	
	return this;
};

VarOrAccess.prototype.js = function (o){
	
	if (this._tagref) {
		return this._tagref.ref();
	};
	
	let val = this._variable || this._value;
	
	if (STACK.tsc()) {
		let typ = this.datatype();
		let generics = this.option('generics');
		let out = val.c();
		
		// console.log self,@options
		
		if (generics) {
			out += generics.c();
		};
		
		if (typ) {
			if (val.datatype() == typ) {
				val.setDatatype(null);
			};
			
			if (this.datatype().isGeneric()) {
				return out + this.datatype().c();
			} else {
				// parenthesize
				return helpers.parenthesize(out + ' as unknown as ' + this.datatype().c());
			};
		};
		
		return out;
	};
	
	return val.c();
};

VarOrAccess.prototype.node = function (){
	return this;
	// @variable ? self : value
};

VarOrAccess.prototype.datatype = function (){
	return VarOrAccess.prototype.__super__.datatype.apply(this,arguments) || this._identifier.datatype();
};

VarOrAccess.prototype.symbol = function (){
	return this._identifier.symbol();
};

VarOrAccess.prototype.cache = function (o){
	// @variable ? (o:force ? super(o) : self) : value.cache(o)
	// Dont cache global either
	if(o === undefined) o = {};
	return (this._variable || this._isGlobal) ? ((o.force ? VarOrAccess.prototype.__super__.cache.call(this,o) : this)) : VarOrAccess.prototype.__super__.cache.call(this,o);
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
	
	// for now - this can happen
	VarReference.prototype.__super__.constructor.call(this,value);
	this._export = false;
	this.set({type: type});
	this._type = type && String(type);
	this._declared = true; // just testing now
};

subclass$(VarReference,ValueNode);

VarReference.prototype.variable = function(v){ return this._variable; }
VarReference.prototype.type = function(v){ return this._type; }
Object.defineProperty(VarReference.prototype,'is_static',{get: function(){
	return this.option('static') && !STACK.tsc();
}, configurable: true});

VarReference.prototype.datatype = function (){
	return VarReference.prototype.__super__.datatype.apply(this,arguments) || (this._value.datatype ? this._value.datatype() : null);
};

VarReference.prototype.loc = function (){
	return this._value.region();
};

VarReference.prototype.declare = function (){
	return this;
};

VarReference.prototype.consume = function (node){
	// really? the consumed node dissappear?
	this.forceExpression();
	
	return this;
};

VarReference.prototype.forceExpression = function (){
	if (this._expression != true) {
		this._expression = true;
		for (let i = 0, items = iter$(this._variables), len = items.length, variable; i < len; i++) {
			variable = items[i];
			variable._type = 'let';
			variable._virtual = true;
			variable.autodeclare();
		};
	};
	return this;
};

VarReference.prototype.visit = function (stack,state){
	var self = this;
	var vars = [];
	var virtualize = stack;
	let scope = self.scope__();
	
	self._variables = scope.captureVariableDeclarations(function() {
		self._value.traverse({declaring: self._type,variables: vars});
		// should happen automatically when traversing via traverse(declaring:...)
		if (self._value instanceof Identifier) {
			return self._value._variable || (self._value._variable = scope.register(self._value.symbol(),self._value,{type: self._type,datatype: self.datatype()}));
		};
	});
	
	if (self.is_static) {
		
		if (self._variables.length > 1) {
			self.warn("Destructuring not supported for static variables",{loc: self.option('static')});
		};
		
		for (let i = 0, items = iter$(self._variables), len = items.length; i < len; i++) {
			items[i].proxy(scope.staticsRef(),LIT(STACK.getSymbol()));
		};
	};
	
	return self;
};

VarReference.prototype.js = function (stack,params,plain){
	let out = this._value.c();
	
	if (this.option('global') && !plain) {
		if (STACK.tsc()) {
			let pars = {
				js: this.js(stack,params,true),
				kind: this._type,
				name: out
			};
			return TPL(pars,'declare global { %js }');
		};
	};
	
	let typ = (STACK.tsc() && this.datatype());
	
	if (typ) {
		out = TYPED(out,typ);
	};
	
	if (this.is_static) {
		let rgt = this._right ? this._right.c({expression: true}) : 'null';
		return ("" + out + " ??= " + rgt);
	};
	
	
	if (this._right) {
		let rgt = this._right.c({expression: true});
		out += (" = " + rgt);
	};
	
	if (this._expression) {
		if (this._value instanceof Obj) {
			out = ("(" + out + ")");
		};
	} else {
		if (STACK.tsc() && this._variables.length > 1 && this._variables.some(function(_0) { return _0.vartype(); })) {
			let kind = this._type; // or var?
			let js = '';
			for (let i = 0, items = iter$(this._variables), len = items.length, item; i < len; i++) {
				// no longer supported
				item = items[i];
				js += ("" + M(kind,this._keyword) + " " + TYPED(item,item.vartype()) + ";\n");
			};
			
			if (this._value instanceof Obj) {
				out = ("(" + out + ")");
			};
			
			js += ("" + out);
			return js;
		};
		
		
		
		out = ("" + (this._type) + " " + out);
		if (this.option('export')) {
			out = ("" + M('export',this.option('export')) + " " + out);
		};
	};
	return out;
};

// ASSIGN

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

Assign.prototype.isExpressable = function (){
	return !(this._right) || this._right.isExpressable();
};

Assign.prototype.isUsed = function (){
	// really?
	// if up is a block in general this should not be used -- since it should already have received implicit self?
	if (this.up() instanceof Block) { // && up.last != self
		return false;
	};
	return true;
};

// FIXME optimize
Assign.prototype.visit = function (){
	var l = this._left;
	var r = this._right;
	
	
	// The special case where setting `item = item` should compile to `self.item = item`
	if ((l instanceof VarOrAccess) && (r instanceof VarOrAccess) && l._identifier.symbol() == r._identifier.symbol()) {
		this._left = l = new Access(".",this.scope__().context(),l._value);
	};
	
	l._assigns = r;
	// console.log "Assign {l} {r}"
	// Regularly, the var is declared after the right side, so `let item = item` resolves to
	// `let item = self.item`. In the case of `let item = do ...` however, the variable
	// must be declared before visiting the inner scope of the function
	if ((l instanceof VarReference) && (r instanceof Lambda)) {
		l.traverse();
	};
	
	if (r) {
		r.traverse({assignment: true});
	};
	
	if (l) {
		l.traverse();
	};
	
	if (l.datatype() && r && !r.datatype()) {
		r.setDatatype(l.datatype());
	};
	
	
	// needed for extending global type in tooling
	if ((l instanceof Access) && l._left && l._left._variable == ROOT.GLOBAL) {
		// warn about this?
		this._globalAssign = true;
	};
	
	// console.log String(STACK),String(l),String(l and l.@left)
	
	if (STACK.tsc()) {
		if ((l instanceof Access) && (l._left instanceof VarOrAccess)) {
			let variable = l._left._variable;
			// console.log variable,l.@left.@value
			// if it is not a var
		};
	};
	
	if (this.option('global') && (l instanceof VarReference) && !STACK.tsc()) {
		this._left = l = OP('.',ROOT.GLOBAL,l.value());
	};
	
	// if l isa VarOrAccess
	let up = STACK.up();
	if ((l instanceof VarReference) && !(up instanceof Block) && !(up instanceof Export) && !(up instanceof TagBody)) {
		l.forceExpression();
	};
	
	return this;
};

Assign.prototype.c = function (o){
	if (!this._right.isExpressable()) {
		// if left isa VarReference and !(right isa Loop) and false
		//	let ref = left
		//	@left = left.@value
		//	return Block.new([ref,BR,right.consume(self)]).c(o)
		if ((this._left instanceof VarReference) && (!(this._right instanceof Loop) || this._expression)) {
			this._left.forceExpression();
		};
		
		return this._right.consume(this).c(o);
	};
	
	// testing this
	return Assign.prototype.__super__.c.call(this,o);
};

Assign.prototype.js = function (o,plain){
	
	// return OP('.',ROOT.GLOBAL,)
	if (this.option('global') && !plain) {
		if (STACK.tsc()) {
			let orig = this.js(o,true);
			// if not expressable - force wrap in function?
			let id = this._left.value();
			let kind = this._left.type();
			let pars = {
				js: orig,
				kind: this._left.type(),
				name: id,
				localName: new InternalName(id)
			};
			
			let out = '%js\ntype %localName = typeof %name\ndeclare global { var %name : %localName }';
			
			return TPL(pars,out);
		};
	};
	
	if (!this._right.isExpressable()) {
		this.p("Assign#js right is not expressable ");
		// here this should be go out of the stack(!)
		// it should already be consumed?
		if (this._left instanceof VarReference) { this._left.forceExpression() };
		return this._right.consume(this).c();
	};
	
	if (this._expression) {
		this._left.forceExpression();
	};
	
	var l = this._left.node();
	var r = this._right;
	var lc = null;
	
	// FIXME Not supported anymore?
	if (l instanceof Self) {
		var ctx = this.scope__().context();
		l = ctx.reference();
	};
	
	if (l instanceof VarReference) {
		l._right = r;
		return l.c();
	};
	
	// test for typescript namespacing
	if (STACK.tsc() && (l instanceof Access) && l.is_namespace && String(this.op()) == '=' && STACK.is_top_level) {
		// console.log String(l.@left),String(l.@right),String(STACK) #  l.@left:is_class
		if (true) {
			let ns = l._left;
			let internal = new InternalName(l,l._right);
			let iface = ns.global_interface;
			
			let vars = {
				global: !ns._variable,
				sysname: internal,
				namespace: l._left,
				name: l._right,
				value: this._right.c({expression: true})
			};
			Object.assign(vars,iface || {});
			
			try {
				vars.export = this.option('export') || !(!ns._variable._value.isExported());
			} catch (e) { };
			try {
				vars.path = ns._variable.importPath();
			} catch (e) { };
			
			let str = vars.path ? (
				
				'var @sysname = @value\ndeclare module %path { namespace @namespace { var @name : typeof @sysname } }'
			) : (ns.is_globalThis ? (
				'var @sysname = @value\ndeclare global { var @name : typeof @sysname }'
			) : (vars.interface ? (
				// check if it is of the ArrayConstructor type etc
				'var @sysname = @value\ndeclare global { interface @interface { @name : typeof @sysname } }'
			) : (ns.is_global ? (
				// check if it is of the ArrayConstructor type etc
				'var @sysname = @value\ndeclare global { namespace @namespace { var @name : typeof @sysname } }'
			) : (
				'var @sysname = @value\n%export declare namespace @namespace { var @name : typeof @sysname }'
			))));
			
			return TPL(vars,str);
			// return js
			// lc = "globalThis.{M(helpers.toNamespacedIdentifier('OPS',String(l.@right)),l.@right)}"
		};
	};
	
	lc || (lc = l.c());
	
	if (STACK.tsc() && this.op() == '||=') {
		this._op = '  =';
	};
	var out = ("" + lc + " " + this.op() + " " + this._right.c({expression: true}));
	
	// if let typ = (STACK.tsc and (datatype or (l and !(l isa VarReference) and l.datatype)))
	// 	# The datatype should be passed in to the rigth value we are setting instead?
	// 	out = typ.c() + ' ' + out
	
	if (l instanceof Obj) {
		out = ("(" + out + ")");
	};
	
	return out;
};

// FIXME op is a token? _FIX_
// this (and similar cases) is broken when called from
// another position in the stack, since 'up' is dynamic
// should maybe freeze up?
Assign.prototype.shouldParenthesize = function (par){
	if(par === undefined) par = this.up();
	return this._parens || (par instanceof Op) && par.op() != '=';
};

Assign.prototype.consume = function (node){
	if (node instanceof TagLike) {
		if (this._right instanceof TagLike) {
			this._right.set({assign: this._left});
			return this._right.consume(node);
		} else {
			return this;
		};
	};
	
	if ((node instanceof Return) && (this._left instanceof VarReference)) {
		
		if (STACK.tsc()) {
			let rgt = this._right;
			let vars = this._left._variables;
			let after = vars[0] ? new VarAccess(vars[0]).consume(node) : node;
			return new Block([this,BR,after]);
			// return Block.new([OP('=',sysvar,@right),BR,VarAccess.new(@left.@variable).consume(node)])
		};
		this._left.forceExpression();
	};
	
	if (this.isExpressable()) {
		this.forceExpression();
		return Assign.prototype.__super__.consume.call(this,node);
	};
	
	var ast = this._right.consume(this);
	return ast.consume(node);
};

function PushAssign(){ return Assign.apply(this,arguments) };

subclass$(PushAssign,Assign);


PushAssign.prototype.register = function (node){
	this._consumed || (this._consumed = []);
	this._consumed.push(node);
	return this;
};

PushAssign.prototype.js = function (o){
	return ("" + (this._left.c()) + ".push(" + (this._right.c()) + ")");
};

PushAssign.prototype.consume = function (node){
	return this;
};

function TagPushAssign(){ return PushAssign.apply(this,arguments) };

subclass$(TagPushAssign,PushAssign);

TagPushAssign.prototype.js = function (o){
	return ("" + (this._left.c()) + ".push(" + (this._right.c()) + ")");
};

TagPushAssign.prototype.consume = function (node){
	return this;
};

function ConditionalAssign(){ return Assign.apply(this,arguments) };

subclass$(ConditionalAssign,Assign);



function CompoundAssign(){ return Assign.apply(this,arguments) };

subclass$(CompoundAssign,Assign);

CompoundAssign.prototype.consume = function (node){
	if (this.isExpressable()) { return CompoundAssign.prototype.__super__.consume.apply(this,arguments) };
	
	var ast = this.normalize();
	if (ast != this) { return ast.consume(node) };
	
	ast = this._right.consume(this);
	return ast.consume(node);
};

CompoundAssign.prototype.normalize = function (){
	var ln = this._left.node();
	// we dont need to change this at all
	if (!((ln instanceof PropertyAccess))) {
		return this;
	};
	
	if (ln._left) { ln._left.cache() };
	// TODO FIXME we want to cache the context of the assignment
	var ast = OP('=',this._left,OP(this.op()[0],this._left,this._right));
	if (ast.isExpressable()) { ast.toExpression() };
	
	return ast;
};

CompoundAssign.prototype.c = function (){
	var ast = this.normalize();
	if (ast == this) { return CompoundAssign.prototype.__super__.c.apply(this,arguments) };
	
	// otherwise it is important that we actually replace this node in the outer block
	// whenever we normalize and override c it is important that we can pass on caching
	// etc -- otherwise there WILL be issues.
	var up = STACK.current();
	if (up instanceof Block) {
		// an alternative would be to just pass
		up.replace(this,ast);
	};
	return ast.c();
};

/*
Started as aextremely limited jsdoc type annotations. Need to be properly parsed
and handled now that it has expanded to cover much more of TS.
*/

function TypeAnnotation(value,source){
	this._value = value;
	this._source = source;
	this._optional = false;
	this._replaced = null;
	this;
};

subclass$(TypeAnnotation,Node);

TypeAnnotation.prototype.add = function (item){
	return this._parts.push(item);
};

TypeAnnotation.prototype.startLoc = function (){
	return (this._source || this._value).startLoc();
};

TypeAnnotation.prototype.endLoc = function (){
	return (this._source || this._value).endLoc();
};

TypeAnnotation.prototype.asParam = function (name){
	return ("@param \{" + this.asRawType() + "\} " + name);
};

TypeAnnotation.prototype.isGeneric = function (){
	return String(this._value)[0] == '<';
};

TypeAnnotation.prototype.asGenericNames = function (){
	return this._genericNames || (this._genericNames = new MappedString(extractGenericNames(this.plain()),this));
};

TypeAnnotation.prototype.hasSelfReference = function (){
	return this._value.match(/(^|[\\\[\,\<\(])(typeof )?self([\[\<\]\,\)\>]|$)/g);
};

TypeAnnotation.prototype.withReplacedThis = function (val){
	return this.c().replace(/(^|[\[\,\<\\\/\(]|typeof )this([\\\/\[\]\,\)\>]|$)/g,"$1" + val + "$2");
};

TypeAnnotation.prototype.makeGeneric = function (name){
	if (!this._generic) {
		this.asRawType();
		this._generic = new TypeAnnotation(this._value,this._source);
		
		if (this._generics) {
			this._generic._replaced = name;
			if (this._genericWrap) {
				this._replaced = this._plain.replace('$$GENERIC$$',name);
			};
		} else if (!this._generics) {
			this._generic._replaced = this._genericWrap ? name : (name + ' extends (' + this._plain + ')');
			this._replaced = this._genericWrap ? this._plain.replace('$$GENERIC$$',name) : name;
		};
	};
	
	return this._generic;
};


TypeAnnotation.prototype.visit = function (){
	this.asRawType();
	return this;
};

TypeAnnotation.prototype.plain = function (){
	this.asRawType();
	return this._plain;
};

TypeAnnotation.prototype.asRawType = function (){
	var self = this;
	if (self._rawType) {
		return self._rawType;
	};
	
	let opt = false;
	let raw = String(self._value);
	
	if (raw[0] == '\\') { raw = raw.slice(1) };
	
	// unwrap the parens?
	if (raw[0] == '(' && raw[raw.length - 1] == ')') {
		raw = raw.slice(1,-1);
	};
	
	let end = raw.slice(-1);
	
	if (end == '?') {
		self._optional = true;
		raw = raw.slice(0,-1);
	};
	
	raw = raw.replace(/(^|[\[\,])\<([a-z\-\d]+)\>/g,function(m,pre,name) {
		if (self.isGeneric() && !pre) { return m };
		return pre + (new TagTypeIdentifier(name)).toClassName();
	});
	
	raw = raw.replace(/(^|[\[\,\<\\])self([\[\]\,\)\>]|$)/g,function(m,pre,post) {
		return pre + "this" + post;
	});
	
	raw = raw.replace(/(^|[\[\,\<\(\s])(\$\d*)(?=[\=\[\s\]\,\)\>]|$)/g,function(m,pre,ref,post) {
		if (ref == '$') {
			self._genericWrap = true;
			return pre + '$$GENERIC$$';
		};
		
		self._generics || (self._generics = new Set());
		self._generics.add(ref);
		return m;
	});
	
	self._plain = raw;
	
	return self._rawType = M(raw,self);
};

TypeAnnotation.prototype.asIteratorValue = function (){
	return this.wrapDoc(this.asRawType() + '[]');
};

TypeAnnotation.prototype.wrapDoc = function (inner){
	return '/**@type {' + inner + '}*/';
};

TypeAnnotation.prototype.toString = function (){
	return this.asRawType();
};

TypeAnnotation.prototype.c = function (){
	if (STACK.tsc()) {
		return this._replaced ? M(this._replaced,this) : this.asRawType();
	} else {
		console.warn(("Not supposed to compile TypeAnnotation when targeting " + (STACK.platform())),OPTS.sourcePath);
	};
	
	return '/**@type {' + this.asRawType() + '}*/';
	// M(String(@value).slice(1),self)
};

function ConstructorType(val){
	this._value = val;
	this._source = val._name;
};

subclass$(ConstructorType,TypeAnnotation);
ConstructorType.prototype.visit = function (){
	return this;
};

ConstructorType.prototype.c = function (){
	return ("(typeof " + (this._source.c()) + ")");
};

function Generics(){ return TypeAnnotation.apply(this,arguments) };

subclass$(Generics,TypeAnnotation);



// IDENTIFIERS

// really need to clean this up
// Drop the token?
function Identifier(value){
	if (value instanceof Token) {
		this._startLoc = value.startLoc();
	};
	this._value = this.load(value);
	this._symbol = null;
	
	if (("" + value).indexOf("?") >= 0) {
		this._safechain = true;
	};
	// @safechain = ("" + value).indexOf("?") >= 0
	this;
};

subclass$(Identifier,Node);

Identifier.prototype.safechain = function(v){ return this._safechain; }
Identifier.prototype.value = function(v){ return this._value; }
Identifier.prototype.setValue = function(v){ this._value = v; return this; };
Identifier.prototype.variable = function(v){ return this._variable; }
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
	return this;
};

Identifier.prototype.metaIdentifier = function (){
	return new Identifier('αα' + AST.sym(this._value));
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
	return (this._startLoc || this._value && this._value.startLoc) ? this._value.startLoc() : null;
};

Identifier.prototype.endLoc = function (){
	return (this._endLoc || this._value && this._value.endLoc) ? this._value.endLoc() : null;
};

Identifier.prototype.loc = function (){
	return [this.startLoc(),this.endLoc()];
};

Identifier.prototype.isValidIdentifier = function (){
	// !STACK.tsc or
	return helpers.isValidIdentifier(this.symbol());
};

Identifier.prototype.isReserved = function (){
	return this._value.reserved || RESERVED_TEST.test(String(this._value));
};

Identifier.prototype.isPredicate = function (){
	return (/\?$/).test(String(this._value));
};

Identifier.prototype.isCapitalized = function (){
	return (/^[A-Z]/).test(String(this._value));
};

Identifier.prototype.isInternal = function (){
	return (/^\$/).test(String(this._value));
};

Identifier.prototype.symbol = function (){
	return this._symbol || (this._symbol = AST.sym(this._value));
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
	// console.log 'compiling identifier as',o and o:as,symbol
	if (o) {
		if (o.as == 'value') {
			// console.log 'compiling identifier as',o:as,symbol
			return ("'" + this.symbol() + "'");
		};
		
		if (o.as == 'meta') {
			return ("'" + this.symbol() + "'");
		};
		
		if (o.as == 'namespaced' && o.ns) {
			return M(("Σ" + (o.ns) + "Σ" + this.symbol()),this._token || this._value);
		};
		
		if (o.as == 'field' && !(this.isValidIdentifier())) {
			return M(("['" + this.symbol() + "']"),this._token || this._value);
		};
		
		if (o.as == 'key' && !(this.isValidIdentifier())) {
			return ("'" + this.symbol() + "'");
		};
	};
	
	
	let up = STACK.current();
	// look into
	if (((up instanceof Util) && !(up instanceof Util.Iterable) && !(up instanceof Util.Is))) { // not all utils
		return this.toStr().c();
	};
	
	let out = this.js();
	// FIXME should it not always enable?
	if (OPTS.sourcemap && (!o || o.mark !== false)) {
		out = M(out,this._token || this._value);
	};
	
	// if @options and @options:generics and STACK.tsc
	// 	if !CONTEXT:template
	// 		out += M(@options:generics)
	// 		# console.log "Compile identifier with generics! {STACK}",!!CONTEXT:template
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
	return this;
};

Identifier.prototype.resolveVariable = function (scope){
	if(scope === undefined) scope = this.scope__();
	let variable = scope.lookup(this.symbol());
	this._variable = variable;
	return this;
};

function DecoratorIdentifier(){ return Identifier.apply(this,arguments) };

subclass$(DecoratorIdentifier,Identifier);

DecoratorIdentifier.prototype.symbol = function (){
	return helpers.toValidIdentifier(String(this._value));
	// "decorator${@value.slice(1)}"
};

DecoratorIdentifier.prototype.toString = function (){
	return this.symbol();
};

function ImportProxyAccess(value){
	this._value = value;
};

subclass$(ImportProxyAccess,Node);

ImportProxyAccess.prototype.toString = function (){
	return this._value;
};

ImportProxyAccess.prototype.asObjectKey = function (){
	return ("[" + this._value + "]");
};

ImportProxyAccess.prototype.c = function (o){
	// console.log 'compiling identifier as',o and o:as,symbol
	if(o === undefined) o = {};
	if (o.as == 'field') {
		return ("[" + (this._value) + "]");
	};
	
	return this._value;
};

function SymbolIdentifier(){ return Identifier.apply(this,arguments) };

subclass$(SymbolIdentifier,Identifier);

SymbolIdentifier.prototype.c = function (o){
	if(o === undefined) o = {};
	if (STACK.tsc()) {
		return this.variable().c();
		// return "{@value.slice(0)_$}"
	};
	let out = this.variable().c();
	if (o.as == 'field') {
		return ("[" + out + "]");
	} else {
		return out;
	};
};

SymbolIdentifier.prototype.variable = function (){
	return this._variable || (this._variable = this.scope__().root().symbolRef(this._value.slice(0)));
};

SymbolIdentifier.prototype.metaIdentifier = function (){
	return this.scope__().root().symbolRef("__" + this._value.slice(0));
};

SymbolIdentifier.prototype.isConstant = function (){
	return true;
};

SymbolIdentifier.prototype.asObjectKey = function (){
	return ("[" + this.c() + "]");
};

SymbolIdentifier.prototype.toString = function (){
	return this.c();
};

SymbolIdentifier.prototype.resolveVariable = function (){
	return this;
};

SymbolIdentifier.prototype.registerVariable = function (){
	return this;
};

function IdentifierExpression(value){
	IdentifierExpression.prototype.__super__.constructor.apply(this,arguments);
	this._static = true;
	this._nodes = [this._single = value];
};

subclass$(IdentifierExpression,Node);


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
	} else if ((this._single && !this.option('prefix'))) {
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
	return (this._single && !this.option('prefix')) ? (("[" + this._single.c() + "]")) : (("[" + this.asString() + "]"));
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
	} else if ((o.as == 'key' || this.option('as') == 'property')) {
		return this.asObjectKey();
	} else if (o.as == 'access') {
		return true;
	} else if (this._single && (this._single instanceof Node)) {
		return this._single.c(o);
	} else {
		return this.asString();
	};
};

function InterpolatedSymbolIdentifier(pre,value){
	InterpolatedSymbolIdentifier.prototype.__super__.constructor.call(this,value);
	this._single = null;
	this.set({prefix: pre._value});
};

subclass$(InterpolatedSymbolIdentifier,IdentifierExpression);

InterpolatedSymbolIdentifier.prototype.asString = function (){
	return ("Symbol.for(" + InterpolatedSymbolIdentifier.prototype.__super__.asString.apply(this,arguments) + ")");
};


function MixinIdentifier(){ return Identifier.apply(this,arguments) };

subclass$(MixinIdentifier,Identifier);

MixinIdentifier.prototype.symbol = function (){
	return ("mixin$" + this._value.slice(1));
};

MixinIdentifier.prototype.traverse = function (o){
	if (this._traversed) {
		return this;
	};
	// should not really look in the scope
	this._mixin = this.scope__().mixin(this._value.slice(1));
	// console.log 'found mixin?!',@mixin
	if (!this._variable) {
		this.resolveVariable();
	};
	return this._traversed = true;
};

MixinIdentifier.prototype.c = function (o){
	if (o && (o.as == 'string' || o.as == 'substr')) {
		let flags = this.toFlags().map(function(f) { return (f instanceof Variable) ? (("$\{" + (f.c()) + "\}")) : f.raw(); });
		let out = flags.join(' ');
		return (o.as == 'string') ? (("`" + out + "`")) : out;
	};
	
	let up = STACK.current();
	if (((up instanceof Util) && !(up instanceof Util.Iterable))) { return this.toStr().c() }; // not all utils
	let out = this.js();
	if (OPTS.sourcemap && (!o || o.mark !== false)) {
		out = M(out,this._token || this._value);
	};
	return out;
};

MixinIdentifier.prototype.toString = function (){
	return this.symbol();
};

MixinIdentifier.prototype.toFlagName = function (){
	// look for variable etc
	return this.symbol();
};

MixinIdentifier.prototype.toFlags = function (){
	if (this._parts) { return this._parts };
	this.traverse();
	let v = this._variable;
	let parts = [];
	let part = v;
	
	while (part){
		if (part._declarator instanceof StyleRuleSet) {
			parts.push(STR(part._declarator._name));
		} else {
			parts.push(part);
		};
		
		part = part._parent;
	};
	
	// for part in vars
	// 	if part.@declarator isa StyleRuleSet
	// 		parts.push(STR(v.@declarator.@name))
	// console.log 'resolvedFlagName',parts
	return this._parts = parts;
	
	if (v && (v._declarator instanceof StyleRuleSet)) {
		return v._declarator._name;
	};
	return null;
};

function Private(){ return Identifier.apply(this,arguments) };

subclass$(Private,Identifier);

Private.prototype.symbol = function (){
	return this._symbol || (this._symbol = AST.sym('__' + this.value()));
};

Private.prototype.add = function (part){
	return new IdentifierExpression(this.value()).add(part).set({prefix: '__',private: true});
};

// def c
// 	let up = STACK.current
// 	return toStr.c if up isa Util
// 	return '' + symbol
;

function TagIdRef(v){
	this._value = (v instanceof Identifier) ? v.value() : v;
	this;
};

subclass$(TagIdRef,ValueNode);

TagIdRef.prototype.js = function (){
	return ("" + (this.scope__().imba().c()) + ".getElementById('" + (this.value().c()) + "')");
};

// This is not an identifier - it is really a string
// Is this not a literal?

// FIXME Rename to IvarLiteral? or simply Literal with type Ivar
function Ivar(v){
	this._value = (v instanceof Identifier) ? v.value() : v;
	this;
};

subclass$(Ivar,Identifier);

Ivar.prototype.name = function (){
	return helpers.dashToCamelCase(this._value).replace(/^[\#]/,'');
	// value.c.camelCase.replace(/^@/,'')
};

Ivar.prototype.alias = function (){
	return this.name();
};

// the @ should possibly be gone from the start?
Ivar.prototype.js = function (o){
	return this.symbol();
};

function Decorator(){ return ValueNode.apply(this,arguments) };

subclass$(Decorator,ValueNode);

Decorator.prototype.name = function (){
	return this._name || (this._name = this._value.js());
};

Decorator.prototype.visit = function (){
	var block;
	this._token = this._value;
	this._variable = this.scope__().lookup(this.name());
	this._value._variable || (this._value._variable = this._variable);
	
	if (!this._variable) {
		this._value = this.runtime()[this.name()];
	};
	
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

Decorator.prototype.tscGetter = function (name,content){
	if(content === undefined) content = null;
	let out = this._value.c();
	
	if (this._params) {
		out += ("(" + this._params.c({expression: true}) + ")");
	} else {
		out += "()";
	};
	
	if (content) {
		out += (".wrap(" + content + ")");
	};
	
	return out;
};

Decorator.prototype.c = function (){
	// should return other places as well...
	if (STACK.current() instanceof ClassBody) { return };
	
	let out;
	
	if (STACK.tsc()) {
		out = '@' + M(this._value,this._token);
	} else {
		out = this._value.c();
	};
	
	if (this._params) {
		out += (".bind([" + this._params.c({expression: true}) + "])");
	} else {
		out += ".bind([])";
	};
	return out;
};

function DescriptorPart(value,owner){
	this._name = value;
};

subclass$(DescriptorPart,Node);

DescriptorPart.prototype.params = function(v){ return this._params; }
DescriptorPart.prototype.setParams = function(v){ this._params = v; return this; };
DescriptorPart.prototype.value = function(v){ return this._value; }
DescriptorPart.prototype.setValue = function(v){ this._value = v; return this; };
DescriptorPart.prototype.context = function(v){ return this._context; }
DescriptorPart.prototype.visit = function (stack){
	if (this._params) {
		this._params.traverse();
	};
	if (this._value) {
		this._value.traverse();
	};
	return this;
};

DescriptorPart.prototype.js = function (){
	if (this._context) {
		let op = OP('.',this._context,this._name);
		let path = op;
		
		if (this._value) {
			return OP('=',path,this._value).c();
		};
		
		let fn = OP('isa',path,LIT('Function'));
		let pars = this._params || (this._value ? [this._value] : []);
		let val = this._params && this._params.first() || this._value || TRUE;
		let call = CALL(path,pars);
		let setter = OP('=',path,val);
		
		if (STACK.tsc()) {
			if (pars.length == 0) { pars.push(LIT('true')) };
			return call.c();
		};
		
		return IF(fn,call,setter).c();
	};
};

function Descriptor(value,owner){
	if (value instanceof Token) {
		this._name = this._value = new DecoratorIdentifier(value);
	} else {
		this._value = value;
		this._value._parens = true;
	};
	
	this._chain = [];
	this._special = false;
	this._params = null;
	this;
};

subclass$(Descriptor,Node);

Descriptor.prototype.name = function(v){ return this._name; }
Descriptor.prototype.setName = function(v){ this._name = v; return this; };
Descriptor.prototype.value = function(v){ return this._value; }
Descriptor.prototype.setValue = function(v){ this._value = v; return this; };
Descriptor.prototype.params = function(v){ return this._params; }
Descriptor.prototype.setParams = function(v){ this._params = v; return this; };

Descriptor.prototype.visit = function (stack){
	let pre = stack._descriptor;
	stack._descriptor = this;
	if (this._name) {
		// console.log "Descriptor scope {scope__}"
		this._variable = this.scope__().lookup(this._name.js());
		this._value._variable || (this._value._variable = this._variable);
		
		if (!this._variable) {
			let cls = stack.up(ClassDeclaration);
			if (STACK.tsc() && cls && cls.isExtension()) {
				this._selfValue = LIT('self');
				this._value = OP('.',this._selfValue,this._name);
			} else {
				this._value = OP('.',THIS,this._name);
			};
		};
	} else {
		if (this._value) { this._value.traverse() };
	};
	
	// @call.traverse if @call
	if (this._params) { this._params.traverse() };
	this._chain.map(function(v) { return v.traverse(); });
	
	if (this._callback = this.option('callback')) {
		// make sure it is not bound to the actual target
		this._callback.traverse();
	};
	
	if (this.option('default')) {
		this._default = this.option('default');
		if (this._default instanceof Literal) {
			this._literal = this._default;
		};
		
		if (!((this._default instanceof Func))) {
			this._default = new Func([],[this._default],null,{});
		};
		this._default.traverse();
	};
	
	return stack._descriptor = pre;
};

Descriptor.prototype.valueIsStatic = function (){
	return !(this._value) || this._value.isPrimitive() || ((this._value instanceof Func) && !this._value.nonlocals());
};

Descriptor.prototype.isStatic = function (){
	return this.valueIsStatic();
};

Descriptor.prototype.isProxy = function (){
	return false;
};

Descriptor.prototype.add = function (item,type){
	if (item instanceof ArgList) {
		if (item._generated) {
			// extract options etc
			this.set({callback: item});
			// let part = DescriptorPart.new(KEY('callback'))
			// part.params = item
			// @chain.push(@last = part)
		} else {
			// console.log 'add',item.@generated
			if (type == '=') {
				// notify if multiple nodes?!
				(this._last || this).setValue(item._nodes[0]);
			} else {
				(this._last || this).setParams(item || new ListNode([]));
			};
		};
	} else {
		this._chain.push(this._last = new DescriptorPart(item));
	};
	return this;
};

Descriptor.prototype.fieldRegistryDecoratorName = function (){
	if (!this._name) { return null };
	if (this._chain && this._chain.length) { return null };
	
	let raw = String(this._name.toRaw()).replace(/^@/,'');
	if (!raw.match(/^[A-Za-z_$][0-9A-Za-z_$]*$/)) { return null };
	return raw;
};

Descriptor.prototype.fieldRegistryArgs = function (){
	let out = [];
	if (this._params) {
		for (let i = 0, items = iter$(this._params), len = items.length; i < len; i++) {
			out.push(this.fieldRegistryArgType(items[i]));
		};
	};
	return out;
};

Descriptor.prototype.fieldRegistryArgType = function (arg){
	var ref;
	if (ref = this.fieldRegistryArgReference(arg)) {
		return {
			instanceType: ref.name,
			constructorType: ("typeof " + (ref.name)),
			target: ref.target
		};
	};
	return {
		instanceType: "unknown",
		constructorType: "unknown",
		target: null
	};
};

Descriptor.prototype.fieldRegistryArgReference = function (arg){
	if (arg && arg.unwrappedNode) { arg = arg.unwrappedNode() };
	
	if (arg instanceof VarOrAccess) {
		let variable = arg._variable;
		let name = arg.c({mark: false});
		if (variable) {
			if (variable.value() instanceof ClassDeclaration) {
				let cls = variable.value();
				let target = null;
				if (!(cls._name && cls._name.option('generics'))) {
					target = {
						name: name,
						export: cls.isExported(),
						global: cls.isGlobal()
					};
				};
				return {name: name,target: target};
			} else if (variable.isImported()) {
				let spec = variable._declarator;
				let target = null;
				if (spec && spec._cname != 'default' && variable.importPath()) {
					target = {
						name: spec._cname,
						module: variable.importPath()
					};
				};
				return {name: name,target: target};
			} else if (variable.isGlobal(null)) {
				return {
					name: name,
					target: {name: name,global: true}
				};
			};
		} else if (arg._isGlobal) {
			return {
				name: name,
				target: {name: name,global: true}
			};
		};
	} else if (arg instanceof Access) {
		if (arg.is_namespace) { return {name: arg.c({mark: false}),target: null} };
	};
	
	return null;
};

Descriptor.prototype.js = function (){
	let ref = this.scope__().root().declare('desc',null,{system: true});
	let tsc = STACK.tsc();
	
	let val = this._variable ? new Instantiation(CALL(this._value,this._params || [])) : ((this._name ? CALL(this._value,this._params || []) : this._value));
	
	let parts = AST.blk([]);
	
	for (let i = 0, items = iter$(this._chain), len = items.length, item; i < len; i++) {
		item = items[i];
		item._context = ref;
		parts.push(item);
	};
	
	if (this._default) {
		parts.add(LIT(("" + (ref.c()) + ".default = " + (this._default.c()))));
	};
	if (this._literal) {
		// TODO rename to primitive instead
		parts.add(LIT(("" + (ref.c()) + ".default.literal = " + (this._literal.c()))));
	};
	
	if (this._callback && !tsc) {
		parts.add(LIT(("" + (ref.c()) + ".callback = " + (this._callback.c()))));
	};
	
	if (tsc) {
		parts.add(LIT(("$" + (ref.c()))));
		// if mixin?
		let slf = (this._selfValue || THIS);
		return ("((self,$" + (ref.c()) + "=" + val.c({mark: true}) + "," + (ref.c()) + "=imba.descriptor($" + (ref.c()) + "))=>(" + (parts.c()) + "))(" + (slf.c()) + ")");
	};
	
	parts.add(ref);
	parts.unshift(OP('=',ref,val));
	
	return '(' + parts.c({expression: true}) + ')';
};

// Ambiguous - We need to be consistent about Const vs ConstAccess
// Becomes more important when we implement typeinference and code-analysis
function Const(){ return Identifier.apply(this,arguments) };

subclass$(Const,Identifier);

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
	if (!(curr instanceof Access) || curr._left == this) {
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

TagTypeIdentifier.prototype.name = function(v){ return this._name; }
TagTypeIdentifier.prototype.setName = function(v){ this._name = v; return this; };
TagTypeIdentifier.prototype.startLoc = function (){
	return this._token && this._token.startLoc  &&  this._token.startLoc();
};

TagTypeIdentifier.prototype.endLoc = function (){
	return this._token && this._token.endLoc  &&  this._token.endLoc();
};

TagTypeIdentifier.prototype.toFunctionalType = function (){
	let sym = new Identifier(this._token);
	if (!(this.isClass())) { sym = new VarOrAccess(sym) };
	return sym;
};

TagTypeIdentifier.prototype.load = function (val){
	this._str = ("" + val);
	var parts = this._str.split(":");
	this._raw = val;
	this._name = parts.pop();
	this._ns = parts.shift(); // if any?
	return this._str;
};

TagTypeIdentifier.prototype.traverse = function (o){
	if (this._traversed) {
		return this;
	};
	// NODES.push(self)
	this._traversed = true;
	if (this.isClass()) {
		if (o && o.declaring) {
			this.registerVariable('const',o.declscope || STACK.scope());
			if (this._variable) {
				this._variable.setValue(o.declaring);
			};
		} else {
			this.resolveVariable();
		};
	};
	return this;
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
	let doc = this.scope__().root()._document.c();
	if (this.isSVG()) {
		return CALL(LIT(("" + doc + ".createElementNS")),[STR("http://www.w3.org/2000/svg"),STR(this._name)]);
	} else {
		return CALL(LIT(("" + doc + ".createElement")),[STR(this._name)]);
	};
};

TagTypeIdentifier.prototype.isClass = function (){
	return !(!this._str.match(/^[A-Z]/));
};

TagTypeIdentifier.prototype.isLowerCase = function (){
	return !this._name.match(/^[A-Z]/);
};

TagTypeIdentifier.prototype.isNative = function (){
	return !this._ns && TAG_TYPES.HTML.indexOf(this._str) >= 0;
};

TagTypeIdentifier.prototype.isNativeHTML = function (){
	return (!this._ns || this._ns == 'html') && TAG_TYPES.HTML.indexOf(this._name) >= 0;
};

TagTypeIdentifier.prototype.isNativeSVG = function (){
	return this._ns == 'svg' && TAG_TYPES.SVG.indexOf(this._str) >= 0;
};

TagTypeIdentifier.prototype.isSVG = function (){
	return this._ns == 'svg' || (!(this.isNative()) && !this._ns && TAG_NAMES[("svg_" + (this._str))]);
};

TagTypeIdentifier.prototype.isAsset = function (){
	return false;
};

TagTypeIdentifier.prototype.toAssetName = function (){
	return this.isAsset() ? this._str : null; // .slice(4)
};

TagTypeIdentifier.prototype.symbol = function (){
	return this._str;
};

TagTypeIdentifier.prototype.isCustom = function (){
	return !(this.isNative()) && !(this.isNativeSVG());
};

TagTypeIdentifier.prototype.isComponent = function (){
	return !(this.isNative()) && !(this.isNativeSVG());
};

TagTypeIdentifier.prototype.toSelector = function (){
	return this.toNodeName();
};

TagTypeIdentifier.prototype.resolveVariable = function (scope){
	if(scope === undefined) scope = this.scope__();
	let variable = this.scope__().lookup(this._str);
	this._variable = variable;
	return this;
};

TagTypeIdentifier.prototype.toVarPrefix = function (){
	let str = this._str;
	return str.replace(/[\:\-]/g,'');
};

TagTypeIdentifier.prototype.toExtensionName = function (){
	return ("Γ" + helpers.toValidIdentifier(this._str));
};

TagTypeIdentifier.prototype.toClassName = function (){
	let str = this._str;
	if (str == 'element') {
		return 'Element';
	} else if (str == 'component') {
		return 'imba.Component';
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
	} else if (STACK.tsc()) {
		return ("Γ" + helpers.toValidIdentifier(this._str));
		return helpers.pascalCase(this._str + '-custom-element');
		return this._str.replace(/\-/g,'_') + '$$TAG$$';
	} else {
		return helpers.pascalCase(this._str + '-component');
	};
};

TagTypeIdentifier.prototype.toTscName = function (){
	return this._str.replace(/\-/g,'_') + '$$TAG$$';
};

TagTypeIdentifier.prototype.sourceId = function (){
	return this._sourceId || (this._sourceId = STACK.sourceId() + '-' + STACK.generateId('tag'));
};

TagTypeIdentifier.prototype.toNodeName = function (){
	if (this.isClass()) {
		return this._nodeName || (this._nodeName = helpers.dasherize(this._str + '-' + this.sourceId()));
	} else {
		return this._str;
	};
};

TagTypeIdentifier.prototype.toTypeArgument = function (){
	if (this._variable) {
		return this._variable.c();
	} else {
		return this._name;
	};
};

TagTypeIdentifier.prototype.id = function (){
	var m = this._str.match(/\#([\w\-\d\_]+)\b/);
	return m ? m[1] : null;
};

TagTypeIdentifier.prototype.flag = function (){
	return "_" + this._name.replace(/--/g,'_').toLowerCase();
};

TagTypeIdentifier.prototype.sel = function (){
	return ("." + this.flag()); // + name.replace(/-/g,'_').toLowerCase
};

TagTypeIdentifier.prototype.string = function (){
	return this.value();
};

TagTypeIdentifier.prototype.toString = function (){
	return this.value();
};

function InterpolatedIdentifier(){ return ValueNode.apply(this,arguments) };

subclass$(InterpolatedIdentifier,ValueNode);

InterpolatedIdentifier.prototype.js = function (){
	return ("[" + (this.value().c()) + "]");
};

function Argvar(){ return ValueNode.apply(this,arguments) };

subclass$(Argvar,ValueNode);

Argvar.prototype.c = function (){
	// NEXT -- global.parseInt or Number.parseInt (better)
	var v = parseInt(String(this.value()));
	// FIXME Not needed anymore? I think the lexer handles this
	var out = "arguments";
	if (v > 0) {
		var s = this.scope__();
		// params need to go up to the closeste method-scope
		var par = s.params().at(v - 1,true);
		out = ("" + AST.c(par.name())); // c
	};
	
	return M(out,this._token || this._value);
};

// CALL

function DoPlaceholder(token){
	this._value = token;
};

subclass$(DoPlaceholder,Node);

DoPlaceholder.prototype.loc = function (){
	return this._value.loc();
};

DoPlaceholder.prototype.c = function (){
	return this.error("Function missing for & placeholder");
};

function AmperRef(){ return ValueNode.apply(this,arguments) };

subclass$(AmperRef,ValueNode);

AmperRef.prototype.visit = function (stack){
	
	var v_;
	let blk = stack.up(function(v) {
		return (v instanceof ArgList) || (v instanceof Block) || (v instanceof AmperFunc) || (v instanceof Return) || (v instanceof TagAttr);
	});
	
	let base = stack.relative(blk,1);
	let inner = stack.relative(base,1);
	
	if ((base instanceof Assign) && stack._nodes.indexOf(base._left) == -1) {
		if (!((base._right instanceof AmperFunc))) {
			let rgt = base._right;
			let wrapper = ((base._right = v_ = new AmperFunc([],rgt),base),v_);
		};
		return this;
	};
	
	if (!((base instanceof AmperFunc))) {
		let wrapper = new AmperFunc([],base);
		blk.replace(base,wrapper);
	};
	return this;
};

AmperRef.prototype.c = function (){
	return "v$";
};

function TaggedTemplate(value,string){
	this._value = value;
	this._string = string;
};

subclass$(TaggedTemplate,Node);

TaggedTemplate.prototype.value = function(v){ return this._value; }
TaggedTemplate.prototype.setValue = function(v){ this._value = v; return this; };
TaggedTemplate.prototype.visit = function (){
	if (this._value instanceof Node) { this._value.traverse() };
	this._string.traverse();
	
	if (!this._string.isTemplate()) {
		this._string.warn("Only `` strings allowed in template literals");
	};
	return this;
};

TaggedTemplate.prototype.js = function (){
	return this._value.c() + this._string.c({as: 'template'});
	// @value.c + TemplateString.new(@string.@nodes).c(as: 'template')
};

// def c
//	"HELLO"
;

function Call(callee,args,opexists){
	this._traversed = false;
	this._expression = false;
	this._parens = false;
	this._cache = null;
	this._receiver = null;
	this._opexists = opexists;
	// some axioms that share the same syntax as calls will be redirected from here
	if (callee instanceof BangCall) {
		callee = callee._callee;
	};
	
	if (callee instanceof Super) {
		(callee._args = (this instanceof BangCall) ? [] : args,callee);
		return callee;
	};
	
	if (callee instanceof VarOrAccess) {
		var str = callee.value().symbol();
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
		
		if (str == 'rescue') {
			return new RescueFunc([],args);
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

Call.prototype.block = function(v){ return this._block; }
Call.prototype.visit = function (){
	this._args.traverse();
	this._callee.traverse();
	// if the callee is a PropertyAccess - better to immediately change it
	
	let runref = this._callee.isRuntimeReference();
	
	if ((this._callee instanceof Access) && this._callee._left.isGlobal('import')) {
		let arg = this._args.first();
		let kind = this._callee._right.toString();
		
		if (arg instanceof Str) {
			// TODO remove need for ImbaAsset type
			// callee = runtime:asset
			(this._callee = LIT(''),this);
			let asset = STACK.root().registerAsset(arg.raw(),("" + kind),this,arg);
			this._args.replace(arg,asset.ref);
		};
	} else if (this._callee.isGlobal('import')) {
		
		// TODO support interpolated strings that can be globbed
		let arg = this._args.first();
		let path = (arg instanceof Str) && arg.raw();
		// console.log 'calling the global import!!',path
		if (path) {
			let ext = path.split('.').pop();
			// TODO only allow specific kinds after ?
			if (EXT_LOADER_MAP[ext] || path.indexOf('?') >= 0) {
				
				this._asset = STACK.root().registerAsset(path,'',this,arg);
				this._args.replace(arg,this._asset.ref);
			};
		};
	} else if (this._callee.isGlobal('require')) {
		let arg = this._args.first();
		let path = (arg instanceof Str) && arg.raw();
	};
	
	if (runref == 'asset') {
		
		let arg = this._args.first();
		
		if (arg instanceof Str) {
			let asset = STACK.root().registerAsset(arg.raw(),'asset',this);
			this._args.replace(arg,asset.ref);
		};
		// console.log 'visit Call asset',runref
	};
	
	this._block && this._block.traverse();
	
	if ((this instanceof BangCall) && (this._args.count() == 0) && this.option('keyword')) {
		let bang = this.option('keyword');
		this._args.setEnds(bang,bang);
	};
	return this;
};

Call.prototype.addBlock = function (block){
	var pos = this._args.filter(function(n,i) { return n instanceof DoPlaceholder; })[0];
	if (pos) {
		pos._block = block;
	};
	pos ? this._args.replace(pos,block) : this._args.push(block);
	return this;
};

Call.prototype.receiver = function (){
	return this._receiver || (this._receiver = ((this._callee instanceof Access) && this._callee._left || NULL));
};

// check if all arguments are expressions - otherwise we have an issue

Call.prototype.safechain = function (){
	return this._callee.safechain(); // really?
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
	var m, ary;
	if (this._asset) {
		return this._asset.ref.c();
	};
	
	var opt = {expression: true};
	var rec = null;
	// var args = AST.compact(args) # really?
	var args = this._args;
	
	// drop this?
	
	var splat = args.some(function(v) { return v instanceof Splat; });
	
	var out = null;
	var lft = null;
	var rgt = null;
	var wrap = null;
	
	var callee = this._callee = this._callee.node(); // drop the var or access?
	
	var variable = callee._variable;
	
	if (callee instanceof Access) {
		callee._call = this;
		lft = callee._left;
		rgt = callee._right;
	};
	
	if (callee instanceof Super) {
		if (m = STACK.method()) {
			if (m.option('inExtension')) {
				callee = OP('.',callee,m.name());
				this._receiver = this.scope__().context();
			};
		};
		
		this;
		// return "supercall"
	};
	
	// never call the property-access directly?
	if (callee instanceof PropertyAccess) { // && rec = callee.receiver
		this._receiver = callee.receiver();
		callee = this._callee = new Access(callee.op(),callee._left,callee._right);
	};
	
	if (variable === ROOT.ASSERT && !splat && args.first()) {
		args._nodes[0] = new AssertionNode(args.first());
	};
	
	if (variable === ROOT.EQ && !splat && args.count() >= 2) {
		let actual = args.index(0);
		let expected = args.index(1);
		let src = STACK.SOURCECODE;
		let loc = this.loc();
		let aloc = actual.loc();
		let eloc = expected.loc();
		let source = JSON.stringify(src.slice(loc[0],loc[1]));
		let asource = JSON.stringify(src.slice(aloc[0],aloc[1]));
		let esource = JSON.stringify(src.slice(eloc[0],eloc[1]));
		let actualValue = actual.cache().c(o);
		let expectedValue = expected.cache().c(o);
		let payload = [
			("source:" + source),
			("actual:\{source:" + asource + ",value:" + actualValue + "\}"),
			("expected:\{source:" + esource + ",value:" + expectedValue + "\}")
		].join(',');
		let callargs = [
			actual.c({expression: true,mark: false}),
			expected.c({expression: true,mark: false})
		];
		var i = 2;
		while (i < args.count()){
			let arg = args.index(i);
			if (arg) { callargs.push(arg.c({expression: true,mark: false})) };
			i++;
		};
		return ("(globalThis.IMBA_EQ=\{" + payload + "\}," + callee.c({expression: true}) + "(" + callargs.join(',') + "))");
	};
	
	// INFO DEVLOGS
	if (variable === ROOT.L) {
		let dim = '\x1b[90m';
		let bgBlue = '\x1b[44m';
		let bgGreen = '\x1b[42m';
		let bgGrey = '\x1b[100m';
		let bgBlack = '\x1b[40m';
		let white = '\x1b[97m';
		let green = '\x1b[32m';
		let black = '\x1b[30m';
		let reset = '\x1b[0m';
		
		callee = LIT("globalThis.DEBUG_IMBA && console.debug");
		let src = STACK.SOURCECODE;
		
		let web = STACK.isWeb();
		let fmts = [];
		let result = [];
		
		if (web) {
			fmts.push(LIT("%c%s%c"));
			result.push(LIT("'color:gray'"));
			result.push(LIT("'::'"));
			result.push(LIT("'color:white'"));
		} else {
			fmts.push(LIT("%s"));
			result.push(LIT(("'" + dim + "::" + reset + "'")));
		};
		
		let devargs = [];
		let devlog = STACK.option('devlog') || false;
		
		for (let j = 0, items = iter$(args), len = items.length, arg; j < len; j++) {
			arg = items[j];
			var ary = iter$(arg.loc());let start = ary[0],end = ary[1];
			let s = src.slice(start,end).replace(/\\/g,'\\\\').replace(/"/g,'\\"').replace(/'/g,"\\'").replace(/\n/g,"\\n").replace(/\r/g,"\\r").replace(/\t/g,"\\t");
			
			if (devlog) {
				// If it is a literal
				
				if ((arg instanceof Str) || (arg instanceof Num) || (arg instanceof Bool)) {
					devargs.push(LIT("''"));
				} else {
					devargs.push(STR(s));
				};
				
				devargs.push(arg);
			} else {
				if ((arg instanceof Literal) && !((arg instanceof Self) || (arg instanceof This) || (arg instanceof Arr))) {
					if (web) {
						fmts.push(LIT("%c%s%c"));
						result.push(LIT("'background-color:black;color:#56ff89'"));
						result.push(LIT(("'" + s + "'")));
						result.push(LIT("'background-color:none;color:white'"));
					} else {
						fmts.push(LIT("%s"));
						result.push(LIT(("'" + bgBlack + green + s + reset + "'")));
					};
				} else {
					if (web) {
						fmts.push(LIT("%c%s%c"));
						result.push(LIT("'background-color:#4c73e8;color:white'"));
						result.push(LIT(("'" + s + "'")));
						result.push(LIT("'background-color:none;color:white'"));
						fmts.push(LIT("%o"));
					} else {
						fmts.push(LIT("%s"));
						result.push(LIT(("'" + bgBlue + white + s + reset + "'")));
						fmts.push(LIT("%O"));
					};
					result.push(arg);
				};
			};
		};
		
		if (devlog) {
			let pars = [new Arr(devargs),this.scope__().context()];
			let meth = STACK.up(MethodDeclaration);
			if (meth) { pars.push(STR(meth.rawName())) };
			let l = this.scope__().root().l();
			STACK.use('devlog');
			return ("(globalThis.DEBUG_IMBA && (l$=" + (STDCALL('devlog$',pars).c()) + ",l$ && console.debug(...l$)))");
		} else {
			args = new ArgList([].concat([("\"" + fmts.join(' ') + "\"")], Array.from(result)));
		};
	};
	
	let safeop = '';
	if ((callee instanceof Access) && callee.op() == '?.') {
		safeop = '?.';
	};
	
	// should just force expression from the start, no?
	if (this._receiver) {
		// quick workaround
		if (!((this._receiver instanceof ScopeContext))) { this._receiver.cache() };
		args.unshift(this._receiver);
		// should rather rewrite to a new call?
		out = ("" + callee.c({expression: true}) + ".call(" + args.c({expression: true,mark: false}) + ")");
	} else {
		let outargs = ("(" + args.c({expression: true,mark: false}) + ")");
		out = ("" + callee.c({expression: true}) + safeop + M(outargs,this._args));
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

function BangCall(){ return Call.apply(this,arguments) };

subclass$(BangCall,Call);



function Instantiation(){ return ValueNode.apply(this,arguments) };

subclass$(Instantiation,ValueNode);

Instantiation.for = function (value,keyword){
	if (value instanceof Tag) {
		return value.set({unmemoized: keyword});
	} else {
		return new this(value).set({keyword: keyword});
	};
};

Instantiation.prototype.js = function (o){
	return ("" + M('new',this.keyword()) + " " + (this.value().c()));
};

function New(){ return Call.apply(this,arguments) };

subclass$(New,Call);

New.prototype.visit = function (){
	this.keyword().warn('Value.new is deprecated - use new Value');
	return New.prototype.__super__.visit.apply(this,arguments);
};

New.prototype.js = function (o){
	var target = this._callee;
	
	while (target instanceof Access){
		let left = target._left;
		
		if ((left instanceof PropertyAccess) || (left instanceof VarOrAccess)) {
			this._callee._parens = true;
			break;
		};
		
		target = left;
	};
	
	// var out = "{M(keyword or 'new',keyword)} {callee.c}"
	var out = ("" + M('new',this.keyword()) + " " + M(this._callee.c(),this._callee));
	if (!((o.parent() instanceof Call) || (o.parent() instanceof BangCall))) { out += '()' };
	return out;
};

function ExternDeclaration(){ return ListNode.apply(this,arguments) };

subclass$(ExternDeclaration,ListNode);

ExternDeclaration.prototype.visit = function (){
	this._nodes = this.map(function(item) { return item.node(); }); // drop var or access really
	// only in global scope?
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

// FLOW

function ControlFlow(){ return Node.apply(this,arguments) };

subclass$(ControlFlow,Node);

ControlFlow.prototype.loc = function (){
	return this._body ? this._body.loc() : [0,0];
};

function ControlFlowStatement(){ return ControlFlow.apply(this,arguments) };

subclass$(ControlFlowStatement,ControlFlow);

ControlFlowStatement.prototype.isExpressable = function (){
	return false;
};

function If(cond,body,o){
	if(o === undefined) o = {};
	this.setup();
	this._test = cond; // (o:type == 'unless' ? UnaryOp.new('!',cond,null) : cond)
	this._body = body;
	this._alt = null;
	this._type = o.type;
	if (this._type == 'unless') this.invert();
	this._scope = new IfScope(this);
	this;
};

subclass$(If,ControlFlow);

If.prototype.test = function(v){ return this._test; }
If.prototype.body = function(v){ return this._body; }
If.prototype.scope = function(v){ return this._scope; }
If.ternary = function (cond,body,alt){
	// prefer to compile it this way as well
	var obj = new If(cond,new Block([body]),{type: '?'});
	obj.addElse(new Block([alt]));
	return obj;
};

If.prototype.addElse = function (add){
	if (this._alt && (this._alt instanceof If)) {
		this._alt.addElse(add);
	} else {
		(this._alt = add,this);
		if (add instanceof If) {
			(add._prevIf = this,add);
		};
	};
	return this;
};

If.prototype.loc = function (){
	return this._loc || (this._loc = [this._type ? this._type._loc : 0,this._body.loc()[1]]);
};

If.prototype.invert = function (){
	if (this._test instanceof ComparisonOp) {
		return this._test = this._test.invert();
	} else {
		return this._test = new UnaryOp('!',this._test,null);
	};
};

If.prototype.visit = function (stack){
	var alt = this._alt;
	var scop = this._scope;
	if (scop) { scop.visit() };
	
	if (this._test) {
		// make sure variables are registered in outer scope
		this._scope = null;
		this._test.traverse();
		this._scope = scop;
	};
	
	this._tag = stack._tag;
	
	// console.log "vars in if",Object.keys(@scope.varmap)
	// TODO deal with variable scope
	for (let o = this._scope._varmap, variable, i = 0, keys = Object.keys(o), l = keys.length, name; i < l; i++){
		name = keys[i];variable = o[name];if (variable.type() == 'let') {
			// console.log "variable virtualize"
			variable._virtual = true;
			variable.autodeclare();
		};
	};
	
	// the let-variables declared in if(*test*) should be
	// local to the inner scope, but will technically be
	// declared in the outer scope. Must get unique name
	
	if (!stack._analyzing && !stack.tsc()) {
		this._pretest = AST.truthy(this._test);
		
		if (this._pretest === true) {
			// only collapse if condition includes compiletime flags?
			alt = this._alt = null;
			if (this._test instanceof EnvFlag) {
				this._preunwrap = true;
			};
		} else if (this._pretest === false) {
			this.loc(); // cache location before removing body
			(this._body = null,this);
		};
	};
	
	if (this._body) { this._body.traverse() };
	
	// should skip the scope in alt.
	if (alt) {
		STACK.pop(this);
		alt._scope || (alt._scope = new BlockScope(alt));
		alt.traverse();
		STACK.push(this);
	};
	
	// force it as expression?
	if (this._type == '?' && this.isExpressable()) this.toExpression();
	return this;
};

If.prototype.js = function (o){
	var v_, test_;
	var body = this._body;
	// would possibly want to look up / out
	var brace = {braces: true,indent: true};
	
	if (this._pretest === true && this._preunwrap) {
		// what if it is inside expression?
		let js = body ? body.c({braces: !(!(this._prevIf))}) : 'true';
		
		if (!(this._prevIf)) {
			js = helpers.normalizeIndentation(js);
		};
		
		if (o.isExpression()) {
			js = '(' + js + ')';
		};
		
		return js;
	} else if (this._pretest === false && false) {
		if (this._alt instanceof If) { ((this._alt._prevIf = v_ = this._prevIf,this._alt),v_) };
		let js = this._alt ? this._alt.c({braces: !(!(this._prevIf))}) : '';
		
		if (!(this._prevIf)) {
			js = helpers.normalizeIndentation(js);
		};
		
		return js;
	};
	
	if (o.isExpression()) {
		
		if ((test_ = this._test) && test_.shouldParenthesizeInTernary  &&  test_.shouldParenthesizeInTernary()) {
			this._test._parens = true;
		};
		
		var cond = this._test.c({expression: true}); // the condition is always an expression
		
		var code = body ? body.c() : 'true'; // (braces: yes)
		
		if (body && body.shouldParenthesizeInTernary()) {
			code = '(' + code + ')'; // if code.indexOf(',') >= 0
		};
		
		if (this._alt) {
			var altbody = this._alt.c();
			if (this._alt.shouldParenthesizeInTernary()) {
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
		cond = this._test.c({expression: true}); // the condition is always an expression
		
		// if body.count == 1 # dont indent by ourselves?
		
		if ((body instanceof Block) && body.count() == 1 && !(body.first() instanceof LoopFlowStatement)) {
			body = body.first();
		};
		
		// if body.count == 1
		//	p "one item only!"
		//	body = body.first
		
		code = body ? body.c({braces: true}) : '{}'; // (braces: yes)
		
		// don't wrap if it is only a single expression?
		var out = ("" + M('if',this._type) + " (" + cond + ") ") + code; // ' {' + code + '}' # '{' + code + '}'
		if (this._alt) { out += (" else " + this._alt.c((this._alt instanceof If) ? {} : brace)) };
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
			let branches = this._body ? [this._body] : [];
			let alt = this._alt;
			
			while (alt instanceof If){
				if (alt._body) { branches.push(alt._body) };
				alt = alt._alt;
			};
			
			if (alt) {
				branches.push(alt);
			};
			
			for (let i = 0, items = iter$(branches), len = items.length; i < len; i++) {
				node._branches.push([]);
				items[i].consume(node);
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
	
	// special case for If created from conditional assign as well?
	// @type == '?' and
	// ideally we dont really want to make any expression like this by default
	var isRet = (node instanceof Return);
	
	// might have been forced to expression already
	// if it was originally a ternary - why not
	if (this._expression || ((!isRet || this._type == '?') && this.isExpressable())) {
		this.toExpression(); // mark as expression(!) - is this needed?
		return If.prototype.__super__.consume.call(this,node);
	} else {
		if (this._body) { this._body = this._body.consume(node) };
		if (this._alt) { this._alt = this._alt.consume(node) };
	};
	return this;
};

If.prototype.isExpressable = function (){
	// process:stdout.write 'x'
	var exp = (!(this._body) || this._body.isExpressable()) && (!(this._alt) || this._alt.isExpressable());
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

Loop.prototype.scope = function(v){ return this._scope; }
Loop.prototype.body = function(v){ return this._body; }
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
	(this._body = AST.blk(body),this);
	return this;
};

Loop.prototype.addElse = function (block){
	(this._elseBody = block,this);
	return this;
};

Loop.prototype.isReactive = function (){
	return this._tag && this._tag.fragment().isReactive();
};

Loop.prototype.isStatementLike = function (){
	return true;
};

Loop.prototype.c = function (o){
	
	var s = this.stack();
	var curr = s.current();
	
	if (this.stack().isExpression() || this.isExpression()) {
		// what the inner one should not be an expression though?
		// this will resut in an infinite loop, no?!?
		this._scope.closeScope();
		
		var ast = CALL(FN([],[this]),[]);
		return ast.c(o);
	} else if ((this.stack().current() instanceof Block) || ((s.up() instanceof Block) && s.current()._consumer == this)) {
		return Loop.prototype.__super__.c.call(this,o);
	} else if (this._tag) {
		return Loop.prototype.__super__.c.call(this,0);
	} else {
		
		this._scope.closeScope();
		ast = CALL(FN([],[this]),[]);
		// scope.context.reference
		return ast.c(o);
		// need to wrap in function
	};
};

function While(test,opts){
	this._traversed = false;
	this._test = test;
	this._options = opts || {};
	this._scope = new WhileScope(this);
	// set(opts) if opts
	if (this.option('invert')) {
		// "invert test for while {@test}"
		this._test = test.invert();
	};
	// invert the test
};

subclass$(While,Loop);

While.prototype.test = function(v){ return this._test; }
While.prototype.visit = function (){
	this.scope().visit();
	if (this._test) { this._test.traverse() };
	if (this.body()) { return this.body().traverse() };
};

While.prototype.loc = function (){
	var o = this._options;
	return helpers.unionOfLocations(o.keyword,this._body,o.guard,this._test);
};

// TODO BUG -- when we declare a var like: while var y = ...
// the variable will be declared in the WhileScope which never
// force-declares the inner variables in the scope

While.prototype.consume = function (node){
	
	// This is never expressable, but at some point
	// we might want to wrap it in a function (like CS)
	if (this.isExpressable()) { return While.prototype.__super__.consume.apply(this,arguments) };
	var reuse = false;
	// WARN Optimization - might have untended side-effects
	// if we are assigning directly to a local variable, we simply
	// use said variable for the inner res
	// if reuse
	// 	resvar = scope.declare(node.left.node.variable,Arr.new([]),proxy: yes)
	// 	node = null
	// 	p "consume variable declarator!?".cyan
	// else
	// declare the variable we will use to soak up results
	// TODO Use a special vartype for this?
	var resvar = this.scope().declare('res',new Arr([]),{system: true});
	// WHAT -- fix this --
	this._catcher = new PushAssign("push",resvar,null); // the value is not preset # what
	this.body().consume(this._catcher); // should still return the same body
	
	// scope vars must not be compiled before this -- this is important
	var ast = new Block([this,resvar.accessor()]); // should be varaccess instead?
	return ast.consume(node);
	// NOTE Here we can find a way to know wheter or not we even need to
	// return the resvar. Often it will not be needed
	// FIXME what happens if there is no node?!?
};

While.prototype.js = function (o){
	var out = ("while (" + this._test.c({expression: true}) + ")") + this.body().c({braces: true,indent: true}); // .wrap
	
	if (this.scope()._vars.count() > 0) {
		
		out = this.scope()._vars.c() + ';' + out;
		// [scope.vars.c,out]
	};
	return out;
};

// This should define an open scope
// should rather
function For(o){
	if(o === undefined) o = {};
	this._traversed = false;
	this._options = o;
	this._scope = new ForScope(this);
	this._catcher = null;
};

subclass$(For,Loop);

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
	
	this._options.source.traverse(); // what about awakening the vars here?
	
	// add guard to body
	if (this._options.guard) {
		var op = IF(this._options.guard.invert(),Block.wrap([new ContinueStatement("continue")]));
		this.body().unshift(op,BR);
	};
	
	this.declare();
	
	if (this._options.await) {
		var fnscope = stack.up(Func); // do |item| item isa MethodDeclaration or item isa Fun
		
		if (fnscope) {
			this.set({native: true});
			fnscope.set({async: true});
		};
		
		// TODO Throw if for loop is not for of
		// TODO Throw if inside tag tree - await not supported there
	};
	
	// here add the things to declare
	
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
	var o = this._options;
	var scope = this.scope();
	var src = o.source;
	var vars = o.vars = {};
	var oi = o.index;
	var params = o.params;
	
	var bare = this.isBare(src);
	
	// if the name parameter is array or object we move this inside?
	
	// what about a range where we also include an index?
	if (src instanceof Range) {
		
		let from = src._left;
		let to = src._right;
		let dynamic = !((from instanceof Num)) || !((to instanceof Num));
		
		if (to instanceof Num) {
			vars.len = to;
		} else {
			// vars:len = scope.vars.push(vars:index.assignment(src.left))
			// vars:len = to.cache(force: yes, pool: 'len').predeclare
			vars.len = scope.declare('len',to,{type: 'let'});
			// to.cache(force: yes, pool: 'len').predeclare
		};
		
		// scope.vars.push(vars:index.assignment(src.left))
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
		
		if (params[2]) {
			vars.len = scope.declare(params[2],this.util().len(vars.source),{type: 'let'});
		} else {
			vars.len = scope.declare('len',this.util().len(vars.source),{type: 'let',pool: 'len',system: true});
		};
		
		if (o.name) {
			let op = OP('.',vars.source,vars.index).set({datatype: o.name.datatype()});
			o.name.set({datatype: undefined});
			let decl = new VarDeclaration(o.name,op,'let');
			this.body().unshift(decl,BR);
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
	
	// this should be autodeclared no?
	resvar = this._resvar || (this._resvar = this.scope().register('res',null,{system: true,type: 'var'}));
	
	this._catcher = new PushAssign("push",resvar,null); // the value is not preset
	let resval = new Arr([]);
	this.body().consume(this._catcher); // should still return the same body
	resvar.autodeclare(); // only if it is a system variable?
	
	if ((node instanceof VarDeclaration) || (node instanceof Assign)) {
		(node._right = resvar.accessor(),node);
		// let block = [self,BR,node]
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
	var vars = this._options.vars;
	var idx = vars.index;
	var val = vars.value;
	var src = this._options.source;
	
	var cond;
	var final;
	
	if (src instanceof Range) {
		let a = src._left;
		let b = src._right;
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
		
		if (this._options.step) {
			final = OP('=',idx,OP('+',idx,this._options.step));
		} else {
			final = OP('++',idx);
		};
	};
	
	var before = "";
	var after = "";
	
	var code = this.body().c({braces: true,indent: true});
	var head = ("" + M('for',this.keyword()) + " (" + (this.scope()._vars.c()) + "; " + cond.c({expression: true}) + "; " + final.c({expression: true}) + ") ");
	
	return before + head + code + after;
};

function ForIn(){ return For.apply(this,arguments) };

subclass$(ForIn,For);



function ForOf(){ return For.apply(this,arguments) };

subclass$(ForOf,For);


ForOf.prototype.declare = function (){
	var self = this;
	var o = self._options;
	var vars = o.vars = {};
	var params = o.params;
	var k;
	var v;
	
	// possibly proxy the index-variable?
	
	if (o.own) { // and !STACK.tsc
		
		if (STACK.tsc()) {
			o.value = o.index;
			let declvars = self.scope__().captureVariableDeclarations(function() {
				let res = [];
				for (let j = 0, items = iter$(o.params), len = items.length, par; j < len; j++) {
					par = items[j];
					par.traverse({declaring: 'let'});
					res.push((par instanceof Identifier) && (
						par._variable || (par._variable = self.scope__().register(par.symbol(),par,{type: 'let'}))
					));
				};
				return res;
			});
			self._declvars = declvars;
		} else {
			vars.source = o.source._variable || self.scope().declare('o',o.source,{system: true,type: 'let'});
			o.value = o.index;
			
			var i = vars.index = self.scope().declare('i',new Num(0),{system: true,type: 'let',pool: 'counter'});
			// systemvariable -- should not really be added to the map
			var keys = vars.keys = self.scope().declare('keys',Util.keys(vars.source.accessor()),{system: true,type: 'let'}); // the outer one should resolve first
			var l = vars.len = self.scope().declare('l',Util.len(keys.accessor()),{system: true,type: 'let'});
			k = vars.key = self.scope().declare(o.name,null,{type: 'let'}); // scope.declare(o:name,null,system: yes)
			
			if ((o.value instanceof Obj) || (o.value instanceof Arr)) {
				self.body().unshift(new VarDeclaration(o.value,OP('.',vars.source,k),'let'),BR);
				vars.value = null;
			} else if (o.value) {
				v = vars.value = self.scope().declare(o.value,null,{let: true,type: 'let'});
			};
		};
	} else {
		(self._source = vars.source = self.util().iterable(o.source),self); // STACK.tsc ? o:source : 
		vars.value = o.value = o.name; // need to visit these to declare them
		let declvars = self.scope__().captureVariableDeclarations(function() {
			var value_;
			o.value.traverse({declaring: 'let'});
			if (o.value instanceof Identifier) {
				return (value_ = o.value)._variable || (value_._variable = self.scope__().register(o.value.symbol(),o.value,{type: 'let'}));
			};
		});
		self._declvars = declvars;
		
		// need to declare this variable outside the for of
		if (o.index) {
			vars.counter = self.scope().parent().temporary(null,{},("" + (o.index) + "$"));
			self.body().unshift(new VarDeclaration(o.index,OP('++',vars.counter),'let'),BR);
			self;
		};
		
		if (params[2]) {
			params[2].warn("Length parameter only allowed on for-in loops");
		};
	};
	
	// TODO use util - why add references already? Ah -- this is for the highlighting
	if (v && o.index) { v.addReference(o.index) };
	if (k && o.name) { k.addReference(o.name) };
	
	return self;
};

ForOf.prototype.js = function (o){
	var vars = this._options.vars;
	var osrc = this._options.source;
	var params = this._options.params;
	var src = vars.source;
	var k = vars.key;
	var v = vars.value;
	var i = vars.index;
	
	var code;
	
	if (this._options.own) {
		if (STACK.tsc()) {
			let k = params[0];
			let v = params[1];
			let source = ("Object.entries(" + (this._options.source.c()) + ")");
			
			if (v && v.datatype()) {
				source = source + (" as unknown as [string," + M(v.datatype()) + "][]");
			};
			
			code = ("" + M('for',this.keyword()) + "(let " + (v ? (("[" + (k.c()) + "," + (v.c()) + "]")) : (("[" + (k.c()) + "]"))) + " of " + source + ")");
			// code = scope.c(braces: yes, indent: yes)
			return code + this.scope().c({braces: true,indent: true});
			// return code + body.c(indent: yes, braces: yes)
		};
		
		// FIXME are we sure about this?
		if (v && v.refcount() > 0) {
			this.body().unshift(OP('=',v,OP('.',src,k)));
		};
		
		this.body().unshift(OP('=',k,OP('.',vars.keys,i)));
		code = this.body().c({indent: true,braces: true}); // .wrap
		var head = ("" + M('for',this.keyword()) + " (" + (this.scope()._vars.c()) + "; " + (OP('<',i,vars.len).c()) + "; " + (OP('++',i).c()) + ")");
		return head + code;
	} else {
		
		if (STACK.tsc()) {
			let itertype = [];
			// get all the variables declared in the let
			// Doesnt work with the single item now
			for (let j = 0, items = iter$(this._declvars), len = items.length, item; j < len; j++) {
				// need to do it nested in arrays
				item = items[j];
				if (item.vartype()) {
					itertype.push(item.vartype());
					continue;
				};
			};
			
			if (itertype.length) {
				src.set({datatype: LIT(("Iterable<[" + AST.cary(itertype) + "]>"))});
			};
		};
		
		// compile to a naive for of loop
		code = this.scope().c({braces: true,indent: true});
		// let inCode = osrc.@variable ? src : (OP('=',src,osrc))
		// it is really important that this is a treated as a statement
		
		let ofjs = src.c({expression: true});
		let js = ("(let " + (v.c()) + " of " + ofjs + ")") + code;
		if (this._options.await) {
			js = ("" + M('await',this._options.await) + " " + js);
		};
		js = ("" + M('for',this.keyword()) + " " + js);
		
		if (vars.counter) {
			js = ("" + (vars.counter) + " = 0; " + js);
		};
		return js;
	};
};

ForOf.prototype.head = function (){
	var v = this._options.vars;
	// skipping head?
	return [
		OP('=',v.key,OP('.',v.keys,v.index)),
		v.value && OP('=',v.value,OP('.',v.source,v.key))
	];
};

// NO NEED?
function Begin(body){
	this._nodes = AST.blk(body).nodes();
};

subclass$(Begin,Block);

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


Switch.prototype.visit = function (){
	for (let i = 0, items = iter$(this._cases), len = items.length; i < len; i++) {
		items[i].traverse();
	};
	if (this._fallback) { this._fallback.traverse() };
	if (this._source) { this._source.traverse() };
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
	// TODO work inside tags (like loops)
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
	
	for (let i = 0, items = iter$(this._cases), len = items.length, part; i < len; i++) {
		part = items[i];
		part.autobreak();
		body.push(part);
	};
	
	if (this._fallback) {
		body.push("default:\n" + this._fallback.c({indent: true}));
	};
	
	return ("switch (" + (this._source.c()) + ") ") + helpers.bracketize(AST.cary(body).join("\n"),true);
};

function SwitchCase(test,body){
	this._traversed = false;
	this._test = test;
	this._body = AST.blk(body);
	this._scope = new BlockScope(this);
};

subclass$(SwitchCase,ControlFlowStatement);

SwitchCase.prototype.test = function(v){ return this._test; }
SwitchCase.prototype.body = function(v){ return this._body; }
SwitchCase.prototype.visit = function (){
	this.scope__().visit();
	return this._body.traverse();
};

SwitchCase.prototype.consume = function (node){
	this._body.consume(node);
	return this;
};

SwitchCase.prototype.autobreak = function (){
	if (!((this._body.last() instanceof BreakStatement))) { this._body.push(new BreakStatement()) };
	return this;
};

SwitchCase.prototype.js = function (o){
	if (!((this._test instanceof Array))) { this._test = [this._test] };
	var cases = this._test.map(function(item) { return ("case " + (item.c()) + ": "); });
	return cases.join("\n") + this._body.c({indent: true,braces: true});
};

function Try(body,c,f){
	this._traversed = false;
	this._body = AST.blk(body);
	this._catch = c;
	this._finally = f;
};

subclass$(Try,ControlFlowStatement);

Try.prototype.body = function(v){ return this._body; }
// prop ncatch
// prop nfinally

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
	// no blocks - add an empty catch
};

Try.prototype.c = function (o){
	if (this.stack().isExpression() || this.isExpression()) {
		var ast = IIFE([this]);
		return ast.c(o);
	};
	
	return Try.prototype.__super__.c.call(this,o);
};

Try.prototype.js = function (o){
	var out = "try " + this._body.c({braces: true,indent: true});
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

Catch.prototype.body = function(v){ return this._body; }
Catch.prototype.consume = function (node){
	this._body = this._body.consume(node);
	return this;
};

Catch.prototype.visit = function (){
	this._scope.visit();
	this._variable = this._scope.register(this._varname,this,{type: 'let',pool: 'catchvar'});
	
	if (len$(this._body) == 0) {
		// @variable.datatype = 'Something'
		let node = this._variable.accessor();
		let accessor = node;
		if (STACK.tsc()) {
			node = IF(LIT(("" + (node.c()) + " instanceof Error")),node);
		};
		
		this._body.push(node);
	};
	
	return this._body.traverse();
};

Catch.prototype.js = function (o){
	// only indent if indented by default?
	return ("catch (" + (this._variable.c()) + ") ") + this._body.c({braces: true,indent: true});
};

// repeating myself.. don't deal with it until we move to compact tuple-args
// for all astnodes

function Finally(body){
	this._traversed = false;
	this._body = AST.blk(body || []);
};

subclass$(Finally,ControlFlowStatement);

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

// RANGE

function Range(){ return Op.apply(this,arguments) };

subclass$(Range,Op);

Range.prototype.inclusive = function (){
	return this.op() == '..';
};

Range.prototype.c = function (){
	return "range";
};

function Splat(){ return ValueNode.apply(this,arguments) };

subclass$(Splat,ValueNode);

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

// TAGS



function TagPart(value,owner){
	this._name = this.load(value);
	this._tag = owner;
	this._chain = [];
	this._special = false;
	this._params = null;
	this;
};

subclass$(TagPart,Node);

TagPart.prototype.name = function(v){ return this._name; }
TagPart.prototype.setName = function(v){ this._name = v; return this; };
TagPart.prototype.value = function(v){ return this._value; }
TagPart.prototype.setValue = function(v){ this._value = v; return this; };
TagPart.prototype.params = function(v){ return this._params; }
TagPart.prototype.setParams = function(v){ this._params = v; return this; };

TagPart.prototype.load = function (value){
	return value;
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
	return !(this._value) || this._value.isPrimitive() || ((this._value instanceof Func) && !this._value.nonlocals());
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

TagPart.prototype.tagRef = function (){
	return this._tagRef || this._tag.ref();
};

function TagId(){ return TagPart.apply(this,arguments) };

subclass$(TagId,TagPart);

TagId.prototype.js = function (){
	return ("" + this.tagRef() + ".id=" + this.quoted());
};

function TagFlag(){ return TagPart.apply(this,arguments) };

subclass$(TagFlag,TagPart);


TagFlag.prototype.rawClassName = function (){
	return this.name().toRaw();
};

TagFlag.prototype.value = function (){
	return this._name;
};

TagFlag.prototype.visit = function (){
	this._chain.map(function(v) { return v.traverse(); });
	// @value.traverse if @value
	if (this._condition) { this._condition.traverse() };
	if (this._name.traverse) { return this._name.traverse() };
};

TagFlag.prototype.isStatic = function (){
	return !(this.isConditional()) && ((this._name instanceof Token) || this._name.isStatic() || (this._name instanceof MixinIdentifier));
};

TagFlag.prototype.isConditional = function (){
	return !(!(this._condition));
};

TagFlag.prototype.js = function (){
	if (STACK.tsc()) {
		let val = this._name.c();
		return this._condition ? (("[" + val + "," + (this._condition.c()) + "]")) : (("[" + val + "]"));
	};
	// NOT used anymore
	let val = this._name.c({as: 'string'});
	return this._condition ? (("" + this.tagRef() + ".flags.toggle(" + val + "," + (this._condition.c()) + ")")) : (("" + this.tagRef() + ".classList.add(" + val + ")"));
};

function TagSep(){ return TagPart.apply(this,arguments) };

subclass$(TagSep,TagPart);



function TagArgList(){ return TagPart.apply(this,arguments) };

subclass$(TagArgList,TagPart);



function TagAttr(){ return TagPart.apply(this,arguments) };

subclass$(TagAttr,TagPart);

TagAttr.prototype.isSpecial = function (){
	return String(this._name) == 'value';
};

TagAttr.prototype.startLoc = function (){
	return this._name && this._name.startLoc  &&  this._name.startLoc();
};

TagAttr.prototype.endLoc = function (){
	return this._value && this._value.endLoc  &&  this._value.endLoc();
};

TagAttr.prototype.replace = function (base,replacement){
	if (this._value == base) {
		return this._value = replacement;
	};
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
		STACK.use('dom_bind');
	};
	
	if (!this._ns && this._key == 'ease') {
		STACK.use('dom_transitions');
	};
	
	// console.log 'visit tag attr',@tag and @tag.tagName
	
	let isAsset = key == 'asset' || (key == 'src' && (this.value() instanceof Str) && (/^(style|img|script|svg)$/).test(this._tag.tagName()));
	
	if (isAsset) {
		let tagName = this._tag.tagName();
		
		let kind = 'asset';
		if (tagName == 'svg') {
			// kind = 'js' # no kind here?
			kind = '';
		} else if (tagName == 'img') {
			kind = 'img';
		} else if (tagName == 'script') {
			kind = STACK._options.vite ? 'url&entry' : 'web';
		} else if (tagName == 'style') {
			kind = 'css';
		};
		
		let path = (this.value() instanceof Str) && this.value().raw();
		if (path && !path.match(/^(\/|https?\:\/\/)/)) {
			this._asset = STACK.root().registerAsset(path,kind,this,this.value());
		};
	};
	
	return this;
};

TagAttr.prototype.key = function (){
	return this._key;
};

TagAttr.prototype.nameIdentifier = function (){
	return this._nameIdentifier || (this._nameIdentifier = new Identifier(this._key));
};

TagAttr.prototype.modsIdentifier = function (){
	return this._modsIdentifier || (this._modsIdentifier = new Identifier(this._key + '__'));
};

TagAttr.prototype.js = function (o){
	// let mods = AST.compileRaw(@mods or null)
	let val = this.value().c(o);
	let bval = val;
	let op = M('=',this.option('op'));
	let isAttr = (this._key.match(/^(aria-|data-)/) || this._key == 'style') || (this._tag && this._tag.isSVG()) || this._ns == 'html';
	let tagName = this._tag && this._tag._tagName;
	let tref = this._tag.ref();
	
	if (this._asset) {
		val = this._asset.ref.c();
	};
	
	if (STACK.tsc() && (isAttr || TAG_GLOBAL_ATTRIBUTES[this._key])) {
		return ("" + tref + ".setAttribute('" + this._key + "',String(" + val + "))");
	};
	
	if (isAttr) {
		if ((STACK.isNode() || this._ns == 'html') && !this._asset) {
			// TODO don't compile to setAttribute directly for node
			// mark compilation as being only for node?
			STACK.meta().universal = false;
			return ("" + tref + ".setAttribute('" + this._key + "'," + val + ")");
		};
	};
	
	if (STACK.tsc()) {
		// how do we remove attribute then?
		let path = this.nameIdentifier().c();
		if (path == 'value' && idx$(this._tag._tagName,['input','textarea','select','option','button']) >= 0) {
			// path = 'richValue'
			val = '/**@type {any}*/(' + val + ')';
		};
		
		let access = ("" + tref + "." + M(path,this._name));
		
		return ("" + M(access,this._name) + op + (this._autovalue ? M('true',this._value) : val));
	};
	
	let key = this._key;
	
	if (key == 'tabindex') {
		key = 'tabIndex';
	};
	
	// why delegate differently on node and web?
	// should rather always delegate value to '#value'?
	if (key == 'value' && idx$(this._tag._tagName,['input','textarea','select','option','button']) >= 0 && !STACK.isNode()) {
		key = 'richValue';
	};
	
	if (this._ns == 'css') {
		return ("" + tref + ".css$('" + key + "'," + val + ")");
	} else if (this._ns == 'bind') {
		let path = PATHIFY(this.value());
		
		if (path instanceof Variable) {
			let getter = ("function()\{ return " + val + " \}");
			let setter = ("function(v$)\{ " + val + " = v$ \}");
			bval = ("\{get:" + getter + ",set:" + setter + "\}");
		} else if (path instanceof Array) {
			bval = ("[" + val[0].c(o) + "," + val[1].c(o) + "]");
		};
		
		return ("" + tref + ".bind$('" + key + "'," + bval + ")");
	} else if (key.indexOf('--') == 0) {
		let pars = [("'" + key + "'"),val];
		let u = this.option('unit');
		let k = StyleTheme.propAbbr(this.option('propname'));
		if (u || k) {
			pars.push(u ? STR(u) : NULL);
			if (k) { pars.push(STR(k)) };
		};
		
		STACK.use('styles');
		let term = this.option('styleterm');
		if (term && term.param) {
			while (pars.length < 4){
				pars.push(NULL);
			};
			pars.push(term.param); // what if this is also a placeholder?
			// console.log term:param
		};
		
		return ("" + tref + ".css$var(" + AST.cary(pars,{as: 'js'}).join(',') + ")");
	} else if (key.indexOf("aria-") == 0 || (this._tag && this._tag.isSVG()) || key == 'for' || TAG_GLOBAL_ATTRIBUTES[key]) {
		if (this._ns) {
			return ("" + tref + ".setns$('" + this._ns + "','" + key + "'," + val + ")");
		} else {
			return ("" + tref + ".set$('" + key + "'," + val + ")");
		};
	} else if (key.indexOf("data-") == 0) {
		// "set('{key}',{val})"
		return ("" + tref + ".setAttribute('" + key + "'," + val + ")");
		// "dataset.{key.slice(5)}{op}{val}"
	} else if (this._ns) {
		return ("" + tref + ".setns$('" + this._ns + "','" + key + "'," + val + ")");
	} else {
		return OP('.',LIT(tref),key).c() + ("" + op + val);
	};
};

function TagStyleAttr(){ return TagAttr.apply(this,arguments) };

subclass$(TagStyleAttr,TagAttr);



function TagAttrValue(){ return TagPart.apply(this,arguments) };

subclass$(TagAttrValue,TagPart);

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

TagHandlerSpecialArg.prototype.isPrimitive = function (){
	return true;
};

TagHandlerSpecialArg.prototype.c = function (){
	return ("'~$" + this.value() + "'");
};

function TagModifiers(){ return ListNode.apply(this,arguments) };

subclass$(TagModifiers,ListNode);

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
	// Arr.new(@nodes).c
};

function TagModifier(){ return TagPart.apply(this,arguments) };

subclass$(TagModifier,TagPart);

TagModifier.prototype.params = function(v){ return this._params; }
TagModifier.prototype.setParams = function(v){ this._params = v; return this; };

TagModifier.prototype.load = function (value){
	if (value instanceof IdentifierExpression) {
		return value._single;
	};
	return value;
};

TagModifier.prototype.isPrimitive = function (){
	return !(this._params) || this._params.every(function(param) { return param.isPrimitive(); });
};

TagModifier.prototype.visit = function (){
	if (this._name instanceof TagHandlerCallback) {
		this._name.traverse();
		this._name = this._name.value();
	};
	
	if (this._name instanceof Func) { // not to be isolated for tsc
		let evparam = this._name.params().at(0,true,'e');
		let stateparam = this._name.params().at(1,true,'$');
		this._name.traverse();
	};
	
	if (this._name instanceof IsolatedFunc) {
		this._value = this._name;
		
		let root = STACK.parents(TagLike)[0];
		if (root && USE_SAFE_RENDER_SELF && !(root.isSelf && root.isSelf())) {
			root.set({memoSelf: true});
			// should only be needed _if_ self is referenced? But this is a micro optimization
			let op = this._value._scope._context = OP('.',root.parentCache(),STR('this'));
		};
		
		this._name = STR('$_');
		this._params = new ListNode([this._value].concat(this._value._leaks || []));
	};
	
	// @value.traverse if @value
	// console.log "visit modifier {@name}"
	
	if (this._params) { this._params.traverse() };
	
	return this;
};

TagModifier.prototype.js = function (){
	if (STACK.tsc()) {
		if (this._name instanceof Func) {
			return "(" + this._name.c() + (")(e,\{\})");
		};
		// let key =
		let key = this.quoted().slice(1,-1).split('-');
		let inv = false;
		
		if (key[0][0] == '!') {
			inv = true;
			key[0] = key[0].slice(1);
		};
		
		// if key[0] == 'options'
		// 	key[0] = '___setup'
		
		let path = key[0];
		
		if (key.length > 1) {
			if (path == 'emit' || path == 'flag' || path == 'css') {
				path = ("" + path + "-name");
			} else {
				path = key.join('-');
			};
		};
		
		path = helpers.toValidIdentifier('α' + path);
		let parjs = this._params ? this._params.c() : '';
		
		if (this._params && parjs == '') {
			if (path == 'αoptions') {
				parjs = M('',MLOC(this._handlerName.endLoc() + 1));
			} else {
				parjs = M('',MLOC(this._name.endLoc() + 1));
			};
		};
		
		let call = ("" + M(path,this._name) + "(" + parjs + ")");
		
		if (!(this._params) || this._params.count() == 0) {
			call = M(call,this._name);
		};
		
		if (inv) {
			let loc = MLOC(this._name.startLoc() - 1,this._name.startLoc());
			return M(("e." + call + "===true"),loc);
		};
		
		// return "e.MODIFIERS.{call}"
		return ("e." + call);
	};
	
	if (this._params && this._params.count() > 0) {
		return ("[" + this.quoted() + "," + (this._params.c()) + "]");
	} else if (this._params) {
		return ("[" + this.quoted() + "]");
	} else {
		return this.quoted();
	};
};

function TagData(){ return TagPart.apply(this,arguments) };

subclass$(TagData,TagPart);

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
		let left = val._left;
		let right = (val._right instanceof Index) ? val._right.value() : val._right;
		
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
		let left = val._left;
		let right = (val._right instanceof Index) ? val._right.value() : val._right;
		
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

TagDynamicArg.prototype.c = function (){
	return this.value().c();
};

function TagHandler(){ return TagPart.apply(this,arguments) };

subclass$(TagHandler,TagPart);

TagHandler.prototype.__params = {watch: 'paramsDidSet',name: 'params'};
TagHandler.prototype.params = function(v){ return this._params; }
TagHandler.prototype.setParams = function(v){
	var a = this._params;
	if(v != a) { this._params = v; }
	if(v != a) { this.paramsDidSet && this.paramsDidSet(v,a,this.__params) }
	return this;
};

TagHandler.prototype.paramsDidSet = function (params){
	this._chain.push(this._last = new TagModifier('options'));
	this._last._handlerName = this._name;
	return (this._last.setParams(params),params);
};

TagHandler.prototype.add = function (item,type,start,end){
	if (type == TagHandlerCallback) {
		if (item instanceof ArgList) { item = item.first() };
		item = new TagHandlerCallback(item);
	};
	
	return TagHandler.prototype.__super__.add.call(this,item,type);
};

TagHandler.prototype.visit = function (){
	TagHandler.prototype.__super__.visit.apply(this,arguments);
	STACK.use('events');
	// Replace with something better for debugging
	if (this._name && CUSTOM_EVENTS[String(this._name)] && STACK.isWeb()) {
		return STACK.use(CUSTOM_EVENTS[String(this._name)]);
	};
};

TagHandler.prototype.isStatic = function (){
	let valStatic = !(this.value()) || this.value().isPrimitive() || ((this.value() instanceof Func) && !this.value().nonlocals());
	// check modifiers directly?
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
		let out = ("" + this.tagRef() + ".addEventListener(" + this.quoted() + ",(e)=>") + '{\n';
		for (let i = 0, items = iter$(this.modifiers()), len = items.length; i < len; i++) {
			out += items[i].c() + ';\n';
		};
		out += '})';
		return out;
	};
	
	if (this._standalone) {
		let up = this._tag;
		let iref = ("" + (up.cvar()) + "[" + this.osym() + "]");
		let mods = this.modifiers();
		let specials = mods.extractDynamics();
		let visit = false;
		let out = [];
		let add = function(val) { return out.push(val); };
		let hvar = up.hvar();
		
		add(("" + (up.hvar()) + " = " + iref + " || (" + iref + "=" + mods.c(o) + ")"));
		for (let j = 0, items = iter$(specials), len = items.length, special; j < len; j++) {
			special = items[j];
			let k = special.option('key');
			let i = special.option('index');
			let path = ("" + (OP('.',hvar,k).c()) + "[" + i + "]");
			if (k == 'options') {
				visit = true;
				add(("(" + this.vvar() + "=" + special.c(o) + "," + this.vvar() + "===" + path + " || (" + path + "=" + this.vvar() + "," + this.dvar() + "|=" + (F.DIFF_MODIFIERS) + "|" + (F.DIFF_INLINE) + "))"));
			} else {
				add(("" + path + "=" + special.c(o)));
			};
		};
		
		add(("" + (up.bvar()) + " || " + (up.ref()) + ".on$(" + this.quoted() + "," + (hvar.c()) + "," + (this.scope__().context().c()) + ")"));
		if (visit) {
			add(("" + (up.dvar()) + "&" + (F.DIFF_INLINE) + " && (" + (up.dvar()) + "^=" + (F.DIFF_INLINE) + "," + hvar + "[" + this.gsym('#visit') + "]?.())"));
		};
		
		return "(" + out.join(",\n") + ")";
	};
	
	return ("" + this.tagRef() + ".on$(" + this.quoted() + "," + (this.modifiers().c()) + "," + (this.scope__().context().c()) + ")");
};

// swallow might be better name
TagHandler.prototype.consume = function (node){
	if (node instanceof TagLike) {
		this._tag = node;
		this._standalone = true;
	};
	return this;
	// return node.register(self)
};

function TagHandlerCallback(){ return ValueNode.apply(this,arguments) };

subclass$(TagHandlerCallback,ValueNode);

TagHandlerCallback.prototype.visit = function (){
	let val = this.value();
	
	if (val instanceof Parens) {
		val = val.value();
	};
	
	if (val instanceof Func) {
		// TODO Warn / error if func has arguments
		val = val.body();
	};
	
	// If the value is just a variable we can add it directly?
	
	if ((val instanceof Access) || (val instanceof VarOrAccess)) {
		// Need to potentially cache the self value here.
		let target = val;
		val = CALL(val,[LIT('e')]);
		val._args._startLoc = target.endLoc();
		val._args._endLoc = target.endLoc();
	};
	
	
	// TODO don't generate this until visiting the taghandler
	
	// if this is a plain access it should be enough to set a reference
	// to the function once?
	
	this.setValue(new (STACK.tsc() ? Func : IsolatedFunc)([],[val],null,{}));
	
	if (this.value() instanceof IsolatedFunc) {
		true;
	};
	
	if (this.value() instanceof Func) {
		let evparam = this.value().params().at(0,true,'e');
		let stateparam = this.value().params().at(1,true,'$$');
	};
	
	this.value().traverse();
	return;
};

function TagBody(){ return ListNode.apply(this,arguments) };

subclass$(TagBody,ListNode);

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
TagLike.prototype.isIndexableInLoop = function (){
	return false;
};

TagLike.prototype.sourceId = function (){
	return this._sourceId || (this._sourceId = STACK.sourceId() + '-' + this.tid());
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

TagLike.prototype.isDetached = function (){
	return this.option('detached');
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

TagLike.prototype.tagLikeParents = function (){
	let parents = [];
	let el = this._parent;
	while (el instanceof TagLike){
		parents.push(el);
		el = el.parent();
	};
	
	return parents;
};

TagLike.prototype.setup = function (){
	this._traversed = false;
	this._consumed = [];
	return this;
};

TagLike.prototype.osym = function (ns){
	if(ns === undefined) ns = '';
	return STACK.getSymbol(this.oid() + ns,InternalPrefixes.SYM + (this.tagvarprefix() || '') + ns);
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
	} else if (node instanceof Op) {
		node = node.opToIfTree();
		
		if (node instanceof If) {
			this.flag(F.TAG_HAS_BRANCHES);
			node = new TagSwitchFragment({body: node});
		} else {
			this.flag(F.TAG_HAS_DYNAMIC_CHILDREN);
			node = new TagContent({value: node});
		};
	} else if (node instanceof StyleRuleSet) {
		true;
	} else {
		if (!((node instanceof Str))) { this.flag(F.TAG_HAS_DYNAMIC_CHILDREN) };
		node = new TagContent({value: node});
	};
	
	this._consumed.push(node); // why consume if node isa String?
	node._consumedBy = this;
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

TagLike.prototype.isMemoized = function (){
	return !this.option('unmemoized');
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

TagLike.prototype.hasDynamicDescendants = function (){
	if (this.hasNonTagChildren()) { return true };
	for (let i = 0, items = iter$(this._consumed), len = items.length, el; i < len; i++) {
		el = items[i];
		if (el instanceof Tag) {
			if (el.hasDynamicDescendants()) { return true };
		};
	};
	return false;
};

TagLike.prototype.hasChildren = function (){
	return this._consumed.length > 0;
};

TagLike.prototype.tagvar = function (name){
	name = InternalPrefixes[name] || name;
	return this._tagvars[name] || (this._tagvars[name] = this.scope__().closure().temporary(null,{nodecl: STACK.tsc(),reuse: false,alias: ("" + name + this.tagvarprefix())},("" + name + this.tagvarprefix())));
};

TagLike.prototype.tagvarprefix = function (){
	return "";
};

TagLike.prototype.parent = function (){
	return this._parent || (this._parent = this.option('parent'));
};

TagLike.prototype.fragment = function (){
	return this._fragment || this.parent();
};

TagLike.prototype.tvar = function (){
	return this._tvar || this.tagvar('T');
};

TagLike.prototype.parentRef = function (){
	return this._parentRef || (this._parentRef = (this.parent() ? this.parent().ref() : (("" + this.parentCache() + "._"))));
};

TagLike.prototype.parentCache = function (){
	return this._parentCache || (this._parentCache = (this.parent() ? this.parent().cvar() : ((this.isMemoized() ? this.scope__().closure().tagCache() : this.scope__().closure().tagTempCache()))));
};

TagLike.prototype.renderContextFn = function (){
	return ("" + this.parentCache() + "[" + this.gsym('#getRenderContext') + "]");
};

TagLike.prototype.dynamicContextFn = function (){
	return ("" + this.parentCache() + "[" + this.gsym('#getDynamicContext') + "]");
};

// built variable
TagLike.prototype.bvar = function (){
	return this._bvar || (this._parent ? this._parent.bvar() : this.tagvar('B'));
};

// cache variable
TagLike.prototype.cvar = function (){
	return this._cvar || (this._parent ? this._parent.cvar() : this.tagvar('C'));
};

TagLike.prototype.owncvar = function (){
	return this.tagvar('C');
};

TagLike.prototype.vvar = function (){
	return this.tagvar('V');
}; // value variable
TagLike.prototype.hvar = function (){
	return this.tagvar('H');
}; // handler variable
TagLike.prototype.kvar = function (){
	return this.tagvar('K');
}; // key variable

// for tracking specific changes -- included in end
// shuold maybe link it with built
TagLike.prototype.dvar = function (){
	return this.tagvar('D');
}; // value variable

TagLike.prototype.ref = function (){
	return this._ref || (this._cachedRef = ("" + (this.parent() ? this.parent().cvar() : '') + "[" + this.osym() + "]"));
};

TagLike.prototype.visit = function (stack){
	var o = this._options;
	var scope = this._tagScope = this.scope__();
	
	if (this.up() instanceof Op) {
		this.set({detached: true});
	};
	
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
	
	// too many edgecases to really utilize this
	if (!(this.isAbstract())) {
		if (first instanceof TagLike) { first.flag(F.TAG_FIRST_CHILD) };
		if (last instanceof TagLike) { last.flag(F.TAG_LAST_CHILD) };
	};
	
	for (let i = 0, items = iter$(this._consumed), len = items.length, item; i < len; i++) {
		item = items[i];
		if (!((item instanceof TagLike))) { continue; };
		item._consumedBy = this;
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
		return OP(node.op(),node._left,this);
	} else if (node instanceof VarDeclaration) {
		return OP('=',node._left,this);
	} else if (node instanceof Op) {
		return OP(node.op(),node._left,this);
	} else if (node instanceof Return) {
		// console.log "return is consuming tag"
		this.option('return',true);
		return this;
	};
	return this;
};

function TagTextContent(){ return ValueNode.apply(this,arguments) };

subclass$(TagTextContent,ValueNode);



function TagContent(){ return TagLike.apply(this,arguments) };

subclass$(TagContent,TagLike);

TagContent.prototype.vvar = function (){
	return this.parent().vvar();
};

TagContent.prototype.bvar = function (){
	return this.parent().bvar(); // is this not the parent bvar?
};

TagContent.prototype.ref = function (){
	return this.fragment().tvar();
};

TagContent.prototype.key = function (){
	// @key ||= "{parent.cvar}.{oid}"
	return this._key || (this._key = ("" + (this.parent().cvar()) + "[" + this.osym() + "]"));
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
		return value.c(this._o);
	};
	
	if ((this.parent() instanceof TagSwitchFragment) || (this._tvar && (this.parent() instanceof Tag) && (this.parent().isSlot() || this.isDetached()))) {
		// what if it is a call?
		parts.push(("" + (this._tvar) + "=" + value.c(this._o)));
		
		if ((value instanceof Call) || (value instanceof BangCall)) {
			// mark parent to reset imba.ctx at the end
			let k = ("" + (this.parent().cvar()) + "[" + this.osym('$') + "]");
			parts.unshift(("" + (this.runtime().renderContext) + ".context=(" + k + " || (" + k + "=\{_:" + (this.fragment().tvar()) + "\}))"));
			parts.push(("" + (this.runtime().renderContext) + ".context=null"));
		};
	} else if (this.isOnlyChild() && ((value instanceof Str) || (value instanceof Num))) {
		return ("" + this.bvar() + " || " + this.ref() + ".text$(" + value.c(this._o) + ")");
	} else if (isStatic) {
		return ("" + this.bvar() + " || " + this.ref() + this.domCall('insert') + "(" + value.c(this._o) + ")");
	} else if ((value instanceof TagTextContent) && this.isOnlyChild() && !(this.parent() instanceof TagSwitchFragment)) {
		return ("(" + this.vvar() + "=" + value.c(this._o) + "," + this.vvar() + "===" + this.key() + " || " + this.ref() + ".text$(String(" + this.key() + "=" + this.vvar() + ")))");
	} else {
		parts.push(("" + this.vvar() + "=" + value.c(this._o)));
		
		let inskey = ("" + (this.parent().cvar()) + "[" + this.osym('i') + "]");
		// TODO rework to only introduce context with <( dynamic )> syntax (expecting tags)
		if ((value instanceof Call) || (value instanceof BangCall)) {
			// let k = "{parent.cvar}[{osym.c}]"
			let k = ("" + (this.parent().cvar()) + "[" + this.osym('$') + "]");
			// mark parent to reset imba.ctx at the end
			parts.unshift(("" + (this.runtime().renderContext) + ".context=(" + k + " || (" + k + "=\{_:" + (this.fragment().tvar()) + "\}))"));
			parts.push(("" + (this.runtime().renderContext) + ".context=null"));
		};
		
		if (value instanceof TagTextContent) {
			parts.push(("(" + this.vvar() + "===" + this.key() + "&&" + this.bvar() + ") || (" + inskey + " = " + this.ref() + this.domCall('insert') + "(String(" + this.key() + "=" + this.vvar() + ")," + (this._flags) + "," + inskey + "))"));
		} else {
			parts.push(("(" + this.vvar() + "===" + this.key() + "&&" + this.bvar() + ") || (" + inskey + " = " + this.ref() + this.domCall('insert') + "(" + this.key() + "=" + this.vvar() + "," + (this._flags) + "," + inskey + "))"));
		};
	};
	
	return "(" + parts.join(',') + ')';
};

function TagFragment(){ return TagLike.apply(this,arguments) };

subclass$(TagFragment,TagLike);



function TagSwitchFragment(){ return TagLike.apply(this,arguments) };

subclass$(TagSwitchFragment,TagLike);

TagSwitchFragment.prototype.setup = function (){
	TagSwitchFragment.prototype.__super__.setup.apply(this,arguments);
	this._branches = [];
	this._inserts = [];
	return this._styles = [];
};

TagSwitchFragment.prototype.getInsertVar = function (index){
	return this._inserts[index] || (this._inserts[index] = this.tagvar('τ' + index + 'if')); // tagvar(self.oid + '$' + index)
};

TagSwitchFragment.prototype.getStyleVar = function (index){
	return this._styles[index] || (this._styles[index] = this.tagvar('τ' + index + 'css')); // tagvar(self.oid + '$' + index)
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
		let max = this.assignChildIndices(0,0,this);
	};
	return this;
};

TagSwitchFragment.prototype.assignChildIndices = function (start,stylestart,root){
	// use different counters for flags?
	let nr = start;
	let max = start;
	
	let stylenr = stylestart;
	let stylemax = stylestart;
	
	for (let i = 0, items = iter$(this._branches), len = items.length, branch; i < len; i++) {
		branch = items[i];
		nr = start;
		// stylenr = stylestart
		for (let j = 0, ary = iter$(branch), len = ary.length, item; j < len; j++) {
			item = ary[j];
			if (item instanceof TagSwitchFragment) {
				let res = item.assignChildIndices(nr,stylenr,root);
				nr = res[0];
				stylenr = res[1];
			} else if (item instanceof StyleRuleSet) {
				item._tvar = root.getStyleVar(stylenr);
				item._tvar._stylerule = item;
				stylenr++;
			} else {
				if (!STACK.tsc()) {
					item._tvar = root.getInsertVar(nr);
				};
				item.set({detached: true});
				nr++;
			};
		};
		
		if (nr > max) {
			max = nr;
		};
		
		if (stylenr > stylemax) {
			stylemax = stylenr;
		};
	};
	
	return [max,stylemax];
};

TagSwitchFragment.prototype.js = function (o){
	var parts = [];
	
	var top = '';
	let vars = this._inserts.concat(this._styles);
	if (len$(vars)) {
		top = vars.join(' = ') + ' = null';
	};
	
	let wasInline = o.inline;
	if (this.body().isExpression()) {
		o.inline = true;
	};
	var out = this.body().c(o);
	o.inline = wasInline;
	
	if (STACK.tsc()) { return out };
	
	if (top) { parts.push(top) };
	parts.push(out);
	
	for (let i = 0, items = iter$(this._inserts), len = items.length; i < len; i++) {
		let key = ("" + this.cvar() + "[" + this.osym(i) + "]");
		parts.push(("(" + key + " = " + this.tvar() + this.domCall('insert') + "(" + items[i] + ",0," + key + "))"));
	};
	
	for (let i = 0, items = iter$(this._styles), len = items.length, item; i < len; i++) {
		item = items[i];
		let flag = item._stylerule._name;
		parts.push(("" + this.tvar() + ".flags.toggle('" + flag + "',!!" + item + ")"));
	};
	
	if (o.inline) {
		return parts.join(',');
	} else {
		return parts.join(';\n');
	};
};

function TagLoopFragment(){ return TagLike.apply(this,arguments) };

subclass$(TagLoopFragment,TagLike);

TagLoopFragment.prototype.isKeyed = function (){
	return this.option('keyed') || this.hasFlag(F.TAG_HAS_BRANCHES);
};

TagLoopFragment.prototype.isIndexableInLoop = function (){
	return true;
};

TagLoopFragment.prototype.consumeChildren = function (){
	TagLoopFragment.prototype.__super__.consumeChildren.apply(this,arguments);
	
	// determine if the order of elements will ever change inside loop
	if (this.hasFlag(F.TAG_HAS_BRANCHES)) {
		return this.set({keyed: true});
	} else if (this._consumed.every(function(_0) { return (_0 instanceof TagLike) && _0.isIndexableInLoop(); })) {
		return this.set({indexed: true});
	} else {
		return this.set({keyed: true});
	};
};

TagLoopFragment.prototype.cvar = function (){
	return this._cvar || this.tagvar('C');
};

TagLoopFragment.prototype.js = function (o){
	
	if (this.stack().isExpression()) {
		let fn = CALL(FN([],[this],this.stack().scope()),[]);
		// the inner tag loop has to get the opdated scope as well
		// fn.traverse
		return fn.c();
	};
	
	if (STACK.tsc()) {
		return ("" + this.tvar() + " = new DocumentFragment;\n" + this.value().c(o));
	};
	
	if ((this.parent() instanceof TagLoopFragment) && this.parent().isKeyed()) {
		this.set({detached: true});
	};
	
	if (this.parent() instanceof TagSwitchFragment) {
		this.set({detached: true});
	};
	
	if (this.parent() && !this._consumedBy) {
		this.set({detached: true});
	};
	
	// if @tag and @childTags
	let iref = this.option('indexed') ? ((this.runtime().createIndexedList)) : ((this.runtime().createKeyedList));
	// LIT('imba.createIndexedFragment') : LIT('imba.createKeyedFragment')
	// should know how many inner slots this fragment has?
	let cache = this.parent().cvar();
	let parentRef = this.isDetached() ? LIT('null') : this.fragment().tvar();
	
	let out = "";
	let refpath;
	
	if (this.parent() instanceof TagLoopFragment) {
		if (this.parent().isKeyed()) {
			this.option('key',OP('+',LIT(("'" + this.oid() + "$'")),this.parent().kvar()));
			out += ("" + this.hvar() + "=" + (this.option('key').c()) + ";\n");
			refpath = this._ref = ("" + (this.parent().cvar()) + "[" + this.hvar() + "]");
		} else {
			refpath = this._ref = ("" + (this.parent().cvar()) + "[" + (this.parent().kvar()) + "]");
		};
	} else {
		refpath = ("" + cache + "[" + this.osym() + "]");
	};
	
	out += ("(" + this.tvar() + " = " + refpath + ") || (" + refpath + "=" + this.tvar() + "=" + iref + "(" + (this._flags) + "," + parentRef + "));\n");
	this._ref = ("" + this.tvar());
	if (this.isDetached()) {
		out += ("" + this.tvar() + "[" + this.gsym('##up') + "] = " + (this.fragment().tvar()) + ";\n");
	};
	out += ("" + this.kvar() + " = 0;\n");
	out += ("" + this.cvar() + "=" + this.tvar() + ".$;\n");
	out += this.value().c(o);
	out += (";" + this.tvar() + this.domCall('end') + "(" + this.kvar() + ");");
	
	if (this.parent() instanceof TagLoopFragment) {
		if (this.parent().isKeyed()) {
			out += ("" + (this.parent().ref()) + ".push(" + this.tvar() + "," + (this.parent().kvar()) + "++," + this.hvar() + ");");
		} else if (this.parent().isIndexed()) {
			out += ("" + (this.parent().kvar()) + "++;");
		};
	};
	
	return out;
};

function TagIndexedFragment(){ return TagLike.apply(this,arguments) };

subclass$(TagIndexedFragment,TagLike);



function TagKeyedFragment(){ return TagLike.apply(this,arguments) };

subclass$(TagKeyedFragment,TagLike);



function TagSlotProxy(){ return TagLike.apply(this,arguments) };

subclass$(TagSlotProxy,TagLike);

TagSlotProxy.prototype.ref = function (){
	return this.tvar();
};

TagSlotProxy.prototype.tagvarprefix = function (){
	return this.oid() + 'S';
};

function TagNodeClass(){ };


function Tag(){ return TagLike.apply(this,arguments) };

subclass$(Tag,TagLike);


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

Tag.prototype.cssns = function (){
	return this._cssns || (this._cssns = ("" + this.sourceId()).replace('-','_'));
};

Tag.prototype.cssid = function (){
	return this._cssid || (this._cssid = ("" + this.sourceId()).replace('_','-'));
};

Tag.prototype.tagvarprefix = function (){
	return this.isSelf() ? 'SELF' : 'T';
	return this._tagvarprefix || (this._tagvarprefix = ((this.type() && this.type().toVarPrefix) ? this.type().toVarPrefix() : ((this.isSelf() ? 'self' : 'tag'))));
	return '';
};

Tag.prototype.isStatementLike = function (){
	return this.option('iife');
};

Tag.prototype.isIndexableInLoop = function (){
	return !this.option('key') && !(this.isDynamicType());
};

Tag.prototype.traverse = function (){
	if (this._traversed) { return this };
	this.tid();
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
	self.oid();
	self.tid();
	let type = self._options.type;
	type && type.traverse();
	
	if (STACK.hmr()) {
		self.cssid();
	};
	
	if (self.isSelf() || (self.tagName().indexOf('-') >= 0) || self.isDynamicType() || (type && type.isComponent())) {
		self._options.custom = true;
		self._kind = 'component';
	} else {
		self._kind = 'element';
	};
	
	if (self._attributes.length == 0 && !self._options.type) {
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
		if (decl) { decl.set({self: self,sourceId: self.sourceId()}) };
	};
	
	self._tagName = tagName;
	
	self._dynamics = [];
	
	let i = 0;
	while (i < self._attributes.length){
		let item = self._attributes[i++];
		if ((item instanceof TagFlag) && (item.name() instanceof StyleRuleSet)) {
			if (item.name().placeholders().length) {
				for (let j = 0, items = iter$(item.name().placeholders()), len = items.length, ph; j < len; j++) {
					ph = items[j];
					let setter = new TagStyleAttr(ph.name());
					setter._tag = self;
					setter.setValue(ph.runtimeValue());
					setter.set(
						{propname: ph._propname,
						unit: ph.option('unit'),
						styleterm: ph}
					);
					self._attributes.splice(i++,0,setter);
					setter.traverse();
				};
			};
		};
	};
	
	self._attributes = self._attributes.filter(function(item) {
		
		if ((item instanceof TagFlag) && item.isStatic()) {
			self._classNames.push(item);
			return false;
		};
		
		if (!STACK.tsc()) {
			if (item == self._attrmap.$key) {
				item.warn("$key= is deprecated, use key=",{loc: item._name});
				self.set({key: item.value()});
				return false;
			};
			
			if (item == self._attrmap.key) {
				self.set({key: item.value()});
				return false;
			};
		};
		
		if (!item.isStatic()) {
			self._dynamics.push(item);
		};
		
		return true;
	});
	
	if (self._parent) {
		if (self._attrmap.route || self.isDynamicType() || self.isSlot()) {
			self._parent.set({shouldEnd: true,ownCache: true});
		};
	};
	
	if (self.isSlot()) {
		// @tvar = tagvar('t'+oid)
		let name = self._attrmap.name ? self._attrmap.name.value() : '__';
		if (name instanceof Str) { name = name.raw() };
		self.set({name: name});
		self._attributes = [];
	};
	
	self._scope = new TagBodyScope(self);
	self._scope.visit();
	
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
		// let name = slotKey ? slotKey.value .toRaw : '__'
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
	
	if (this._options.reference) {
		let method = this.stack().up(MethodDeclaration);
		let tagdef = this.stack().up(TagDeclaration);
		let err;
		
		if (this._options.key) {
			err = "Named element cannot be keyed at the same time";
		};
		
		if (tagdef && method && String(method.name()) == 'render') {
			for (let i = 0, items = iter$(this.tagLikeParents()), len = items.length, el; i < len; i++) {
				el = items[i];
				if (el instanceof TagLoopFragment) {
					err = "Named tags not allowed inside loops";
				};
				if ((el instanceof Tag) && el.isDynamicType()) {
					err = "Named tags not allowed inside dynamic parent";
				};
			};
			
			if (!err) {
				tagdef.addElementReference(this._options.reference,this);
			};
		} else {
			err = "Named tags are only allowed inside render method";
		};
		
		if (err) {
			// FIXME should actually classify as error
			this.warn(err,{loc: this._options.reference});
		};
	};
	
	// FIXME Slots are not allowed inside loops
	
	return this;
};

Tag.prototype.visitAfterConsumedChildren = function (){
	if (this.isSlot() && this._consumed.length > 1) {
		this.set({markWhenBuilt: true,reactive: true});
	};
	return;
};

Tag.prototype.hasBlockScopedVariables = function (){
	return Object.keys(this._scope._varmap).length > 0;
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
			
			let typ = this.option('type');
			if (typ._token == 'div') { typ = null };
			this.set({dynamic: true});
			let op = part.nodes()[0];
			
			if (typ) {
				op = CALL(typ.toFunctionalType(),part.nodes());
			};
			this.set({type: op,functional: op});
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
			(curr._condition = part,curr);
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
	} else if (curr instanceof TagHandler) {
		if ((part instanceof IdentifierExpression) && part._single && !part.isPrimitive()) {
			// console.log 'is stack tsc?'
			part = new (STACK.tsc() ? Func : IsolatedFunc)([],[part._single],null,{});
		};
		
		curr.add(part,type);
	} else if (curr instanceof TagAttr) {
		curr.add(part,type);
	} else {
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
			
			if (name.match(/^bind(?=\:|$)/) && this.isFunctional()) {
				next._name.error("bind not supported for functional fragments");
			};
			if (name == 'bind') {
				
				(next._name._single || next._name)._value = 'bind:data';
				name = 'bind:data';
			};
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
	return (this.type() instanceof ExpressionNode) || this._options.dynamic;
};

Tag.prototype.hasDynamicTagName = function (){
	return this.type() instanceof ExpressionNode;
};

Tag.prototype.isFunctional = function (){
	return !!this._options.functional;
};

Tag.prototype.isSVG = function (){
	return (this._isSVG == null) ? (this._isSVG = (((this.type() instanceof TagTypeIdentifier) && this.type().isSVG()) || (this._parent && this._parent.isSVG() && !(this.isDynamicType())))) : this._isSVG;
};

Tag.prototype.isAsset = function (){
	return this._isAsset || false;
};

Tag.prototype.create_ = function (){
	if (this.isFragment() || this.isSlot()) {
		return this.runtime().createLiveFragment;
		// LIT('imba.createLiveFragment')
	} else if (this.isAsset()) {
		return this.runtime().createAssetElement;
	} else if (this.isDynamicType()) {
		return this.runtime().createDynamic;
	} else if (this.isSVG()) {
		return this.runtime().createSVGElement;
		// LIT('imba.createSVGElement')
	} else if (this.isComponent()) {
		return this.runtime().createComponent;
	} else {
		return this.runtime().createElement;
	};
};

Tag.prototype.isReactive = function (){
	return this.option('reactive') || (this._parent ? this._parent.isReactive() : (!(this.scope__() instanceof RootScope)));
};

Tag.prototype.isDetached = function (){
	return this.option('detached');
};

Tag.prototype.hasDynamicParts = function (){
	if (this._dynamics.length == 0 && !(this.hasDynamicFlags()) && !(this.type() instanceof ExpressionNode)) {
		let nodes = this.body() ? this.body().values() : [];
		if (nodes.every(function(v) { return (v instanceof Str) || ((v instanceof Tag) && !v.isDynamicType()); })) {
			if (!(this.hasNonTagChildren()) && !(this.isSlot()) && !this.option('dynamic')) {
				this.setHasDynamicParts(false);
			};
		};
	};
	return true;
};

Tag.prototype.js = function (o){
	var cname;
	var stack = STACK;
	var tsc = STACK.tsc();
	var isExpression = stack.isExpression();
	
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
	var component = this._tagDeclaration;
	let oscope = this._tagDeclaration ? this._tagDeclaration.scope() : null;
	
	let typ = this.isSelf() ? "self" : ((this.isFragment() ? "'fragment'" : (((this.type().isClass && this.type().isClass()) ? this.type().toTypeArgument() : ("'" + this.type()._value + "'")))));
	
	if (this.type()._value == 'global' || this.type()._value == 'teleport') {
		// console.warn "global will be deprecated in favor of teleport in a future version. Please use teleport instead" unless type.@value == 'teleport'
		typ = ("'i-" + (this.type()._value) + "'");
		STACK.use('dom_teleport');
	};
	
	if (parent && !this._consumedBy) {
		this.set({detached: true});
	};
	
	var parentIsInlined = o.inline;
	
	var isSVG = this.isSVG();
	var isReactive = this.isReactive();
	
	var canInline = false;
	var hasDynamicParts = true;
	var useRoutes = this._attrmap.route || this._attrmap.routeTo || this._attrmap['route-to'];
	var shouldEnd = this.isComponent() || useRoutes || this.option('shouldEnd');
	
	if (useRoutes) {
		stack.use('router');
	};
	
	var dynamicKey = null;
	var ownCache = this.option('ownCache') || false;
	
	if (this._asset) {
		typ = this._assetRef.c();
		// typ = "'{@assetName}'"
	};
	
	var slotPath = "";
	
	if (this.isSlot()) {
		if (this.root().isSelf()) {
			slotPath = OP('.',OP(".",this.root().tvar(),STR("__slots")),STR(this.option('name'))).c();
		} else {
			let fn = OP(".",this.root().tvar(),this.gsym('#registerFunctionalSlot')).c();
			slotPath = ("" + fn + "(" + (STR(this.option('name')).c()) + ")");
		};
	};
	
	if (tsc) {
		let up = STACK.parent();
		let safe = (up instanceof Block) || (up instanceof Tag);
		
		if (!safe) {
			this.option('iife',true);
		};
		// if not we need to wrap the whole thing in an iife
		// let up = STACK.
		if ((this.type() instanceof TagTypeIdentifier) && !(this.isSelf())) {
			if (this.type().isAsset()) {
				add(("var " + this.tvar() + " = new " + M("SVGSVGElement",this.type())));
			} else if (this.type().isClass()) {
				add(M(("var " + this.tvar() + " = new " + M(this.type().toClassName(),this.type()) + ";" + this.tvar()),this.type()));
			} else {
				this.tvar()._datatype = new MappedString(this.type().toClassName(),this.type());
				add(M(("var " + this.tvar() + " = new " + M(this.type().toClassName(),this.type()) + ";" + this.tvar()),this.type()));
			};
		} else if (this.isSelf()) {
			this.tvar()._datatype = 'this';
			add(("var " + this.tvar() + " = " + (this.type().c())));
		} else if (this.isDynamicType()) {
			if (this._options.dynamic) {
				add(("var " + this.tvar() + " = " + (this.type().c()) + ";" + this.tvar()));
			} else {
				add(("var " + this.tvar() + " = new " + M('Γany',this.type())));
			};
		} else {
			add(("var " + this.tvar() + " = new " + M('HTMLElement',this.type())));
		};
		
		for (let i = 0, items = iter$(this._attributes), len = items.length, item; i < len; i++) {
			item = items[i];
			this._ref = this.tvar();
			if ((item instanceof TagAttr) || (item instanceof TagHandler) || (item instanceof TagFlag)) {
				add(item.c(o)); // M("{tvar}.{item.c(o)}",item)
				// add M("{tvar}.{item.c(o)}",item)
			};
			this;
		};
		let nodes = this.body() ? this.body().values() : [];
		for (let i = 0, items = iter$(nodes), len = items.length; i < len; i++) {
			add(items[i].c());
		};
		
		if (!safe) {
			add(("return " + this.tvar()));
			let sep = (o.inline || isExpression) ? ',' : ';\n';
			sep = ';\n';
			return '(()=>{' + out.join(sep) + '})()';
		} else if (false && (o.inline || isExpression)) {
			// o:inline = wasInline
			add(this.option('return') ? (("return " + this.tvar())) : (("" + this.tvar())));
			let js = '(' + out.join(',\n') + ')';
			return js;
		} else {
			if (this.option('return')) {
				add(("return " + this.tvar()));
			};
			
			let js = out.join(";\n");
			if (this.hasBlockScopedVariables()) {
				js = '{' + js + '}';
			};
			return js;
		};
	};
	
	// whether this tag should set a variable indicating
	// whether this was built now or not
	// basically whether we need a reference at all?
	var markWhenBuilt = shouldEnd || this.hasDynamicFlags() || this._attributes.length || this.option('markWhenBuilt') || this.isDetached() || this.isDynamicType() || !(!this.option('key'));
	// when it has any attributes? - but not text or
	
	var inCondition = parent && parent.option('condition');
	
	if (this.isDynamicType()) {
		ownCache = true;
		if (this.isMemoized()) {
			typ = ("" + this.owncvar() + ".value");
		} else {
			typ = this.type().c();
		};
		// @cref = "{parentCache}[{osym('$2')}]"
	};
	
	// add unique flag to this element if it has inline styles or
	// we're compiling for hmr.
	
	if (this._cssid) {
		this._classNames.unshift(this.cssid());
	};
	
	for (let i = 0, items = iter$(STACK.closures()), len = items.length, closure; i < len; i++) {
		closure = items[i];
		if (closure._cssns && (!(this.isSelf()) || closure != oscope)) {
			this._classNames.push(closure._cssns);
		};
	};
	
	for (let i = 0, items = iter$(this.tagLikeParents()), len = items.length, par; i < len; i++) {
		par = items[i];
		if (par._cssns) {
			this._classNames.push(par._cssns);
		};
	};
	
	if (component && !(this.isSelf())) {
		if (cname = component.cssref(this.option('reference') ? null : this.scope__())) {
			let orig = component._cssns;
			// TOOD store in part of static classNames instead. Signal that these are static
			if (this._classNames.indexOf(orig) >= 0) {
				this._classNames.splice(this._classNames.indexOf(orig),1);
			};
			
			if (this.isDynamicType() && true) {
				this._styleName = cname;
			} else {
				this._classNames.push(cname);
			};
		};
	};
	
	if (this.option('reference')) {
		if (oscope) {
			let name = String(this.option('reference')).slice(1);
			this._classNames.push(("$" + name)); // just add the actual ref right?
		};
	};
	
	if (this.option('key')) {
		this.set({detached: true});
	};
	
	if (this._classNames.length) {
		let names = [];
		let dynamic = false;
		for (let i = 0, items = iter$(this._classNames), len = items.length, cls; i < len; i++) {
			cls = items[i];
			if (cls instanceof TagFlag) {
				if (cls.name() instanceof MixinIdentifier) {
					names.push(cls.name().toRaw());
					// dynamic = yes
				} else {
					names.push(cls.rawClassName());
				};
			} else if (cls instanceof Node) {
				dynamic = true;
				names.push('${' + cls.c() + '}');
			} else {
				names.push(cls);
			};
		};
		
		names = names.filter(function(item,i) { return names.indexOf(item) == i; });
		let q = dynamic ? '`' : "'";
		this._className = q + names.join(' ') + q;
	};
	
	var params = [
		typ,
		((fragment && !this.option('detached')) ? fragment.tvar() : 'null'),
		this._className || 'null',
		'null',
		(this._styleName ? this._styleName.c() : 'null')
	];
	
	// if @asset
	//	params[0] = OP('.',@asset:ref,typ).c
	//	# Arr.new([typ,@asset:ref]).c
	
	var nodes = this.body() ? this.body().values() : [];
	
	if (nodes.length == 1 && (nodes[0] instanceof TagContent) && nodes[0].isStatic() && !(this.isSelf()) && !(this.isSlot())) {
		params[3] = nodes[0].value().c();
		nodes = [];
	};
	
	// checking to see if a node is static enough to be inserted directly into the dom without
	// any references.
	if (this._dynamics.length == 0 && !(this.hasDynamicFlags()) && !dynamicKey && !(this.isDynamicType()) && !this.option('slotted')) {
		if (nodes.every(function(v) { return (v instanceof Str) || ((v instanceof Tag) && !v.isDynamicType() && !v.option('key')); })) {
			if (!shouldEnd && !(this.hasNonTagChildren()) && !(this.isSlot()) && !this.option('dynamic') && !this.option('reference')) {
				hasDynamicParts = false;
				if ((parent instanceof Tag) && !(this.up() instanceof Op)) {
					// console.log "CAN INLINE {tagName} {parent} {up}"
					canInline = true;
				};
			};
		};
	};
	
	if (this.isFragment() || this.isSlot()) {
		params = [this._flags].concat(params.slice(1,2)); // .slice(1,3)
	};
	
	if (this.isSlot()) {
		// the slot is not supposed to be inserted immediately
		params[1] = 'null';
	};
	
	var ctor = M(("" + this.create_() + "(" + params.join(',') + ")"),this.type());
	
	if (this.option('reference')) {
		// TODO need to ensure that the name is resolved outside of render
		// what if it is on root?
		let par = params[1];
		params[1] = 'null';
		ctor = M(("" + this.create_() + "(" + params.join(',') + ")"),this.type());
		this.set({ctor: ctor});
		// ctor = OP('=',OP('.',scope__.context,option(:reference)),LIT(ctor)).c()
		ctor = OP('.',this.scope__().context(),this.option('reference')).c();
		ctor = ("(" + this.tvar() + "=" + ctor + "," + this.tvar() + "[" + this.gsym('##up') + "]=" + par + "," + this.tvar() + ")");
		
		let decl = this.option('tagdeclbody');
		
		if (decl && !STACK.tsc()) {
			let head = decl._head || (decl._head = []);
			let ref = helpers.toValidIdentifier(this.option('reference').c());
			let gen = this.option('ctor');
			// let sym = STACK.getSymbol
			// let body = "return this[{sym}] || (this[{sym}] = {gen})"
			let body = ("let el=" + gen + ";\n\treturn (Object.defineProperty(this,'" + ref + "',\{value:el\}),el);");
			let getter = ("get " + ref + "()") + '{\n\t' + body + '\n}';
			head.push(getter);
		};
		
		// ctor = OP('.',scope__.context,option(:reference)).c()
		// should also check if there is already an element like this
		// ctor = CALL(OP('.',LIT(ctor),'ref$'),[STR(option(:reference))])
	} else {
		ctor = ("" + this.tvar() + "=" + ctor);
	};
	
	if (this.option('assign')) {
		// push it into ctor if it is not a variable assignment
		// otherwise we always want to assign it
		ctor = OP('=',this.option('assign'),LIT(ctor)).c();
	};
	
	let deeplyDynamic = this.hasDynamicDescendants();
	
	// console.log "IS INLINE? {o:inline} {STACK.isExpression} {!!@consumedBy} {!!@parent} {isDetached}"
	
	if (!parent && this.option('memoSelf') && !(this.isSelf())) { // scope__.@context # and scope__.@context.@reference
		// what if there is no parent cache here?
		add(("" + this.parentCache() + ".this=this"));
	};
	
	if (!this._consumedBy) {
		this._ref = ("" + this.tvar());
		
		
		
		if (this.isSelf()) {
			add(("" + this.tvar() + "=this"));
			add(("" + this.tvar() + this.domCall('open') + "()"));
			add(("(" + this.bvar() + "=" + this.dvar() + "=1," + this.tvar() + "[" + this.osym() + "] === 1) || (" + this.bvar() + "=" + this.dvar() + "=0," + this.tvar() + "[" + this.osym() + "]=1)"));
			this._cvar = this.tvar();
		} else if (isReactive) {
			// let scop = scope__.closure
			let k = ("" + this.parentCache() + "[" + this.osym() + "]");
			
			if (this.isDynamicType() && this.isMemoized()) {
				if (this.option('key')) {
					// what if this is the only one, should be special?
					add(("" + this.owncvar() + "=" + this.dynamicContextFn() + "(" + this.osym() + "," + (this.option('key').c()) + ")"));
				} else {
					add(("" + this.owncvar() + "=" + this.renderContextFn() + "(" + this.osym() + ")"));
				};
				
				ctor = ("" + this.owncvar() + ".cache(" + ctor + ")");
				add(("(" + this.bvar() + "=" + this.dvar() + "=1," + this.tvar() + "=" + this.owncvar() + ".run(" + (this.type().c()) + "," + (this.hasDynamicTagName() ? 1 : 0) + ")) || (" + this.bvar() + "=" + this.dvar() + "=0," + ctor + ")"));
			} else if (this.option('key')) {
				add(("" + this.cvar() + "=(" + k + "=" + k + "||new Map())"));
				add(("(" + this.bvar() + "=" + this.dvar() + "=1," + this.tvar() + "=" + this.cvar() + ".get(" + this.kvar() + "=" + (this.option('key').c()) + ")) || (" + this.bvar() + "=" + this.dvar() + "=0," + this.cvar() + ".set(" + this.kvar() + "," + ctor + "))"));
			} else {
				if (this.isMemoized()) {
					add(("(" + this.bvar() + "=" + this.dvar() + "=1," + this.tvar() + "=" + k + ") || (" + this.bvar() + "=" + this.dvar() + "=0," + this.tvar() + "=" + k + "=" + ctor + ")"));
				} else {
					add(("(" + this.bvar() + "=" + this.dvar() + "=0," + this.tvar() + "=" + ctor + ")"));
				};
			};
			
			add(("" + this.bvar() + " || (" + this.tvar() + "[" + this.gsym('##up') + "] = " + this.parentRef() + ")")); // really?
			add(("" + this.bvar() + " || (" + this.tvar() + "[" + this.gsym('##register') + "]?.(" + this.parentCache() + "," + this.osym() + "))")); // really?
			
			this._cvar = this.tvar();
			this._ref = this.tvar();
			
			if (isExpression && !deeplyDynamic) {
				this.option('inline',canInline = true);
				o.inline = true;
			} else {
				if (isExpression) {
					this.option('iife',true);
				};
				
				o.inline = false;
			};
		} else {
			add(("(" + ctor + ")"));
			this._cvar = this.tvar();
			
			if (isExpression && !hasDynamicParts) {
				this.option('inline',canInline = true);
				o.inline = true;
				// console.log 'can inline',tagName
			} else {
				this.option('iife',true);
				o.inline = false;
			};
		};
	} else {
		// console.log tagName,'re',isReactive,'expr',isExpression,'inline',canInline,'dyn',hasDynamicParts,'oin',o:inline
		// if the parent was inlined but we are too complex
		if (o.inline && !canInline) {
			// what if this is just asking to be inlined because of a ternary?
			this.option('iife',true);
			o.inline = false;
		};
		
		if (this.isShadowRoot()) {
			let key = ("" + this.cvar() + "[" + this.osym() + "]");
			add(("" + this.tvar() + "=" + key + " || (" + key + "=" + (fragment.tvar()) + ".attachShadow(\{mode:'open'\}))"));
		} else if (this.isSlot() && !(this.hasChildren())) {
			add(("" + this.tvar() + "=" + slotPath));
			if (!((parent instanceof TagSwitchFragment))) {
				let key = ("" + this.cvar() + "[" + this.osym() + "]");
				add(("(" + key + " = " + (fragment.tvar()) + this.domCall('insert') + "(" + this.tvar() + "," + (this._flags) + "," + key + "))"));
			};
		} else if (this.isSlot() && this._consumed.length == 1) {
			// single child can act as slot?
			// if it is a string we dont really want to insert it at all
			this._consumed[0].set({detached: true,slotted: true});
			this._consumed[0]._tvar = this.tvar();
			this._consumed[0]._parent = parent;
			
			ownCache = false;
			// add("{tvar}")
		} else if (parent instanceof TagLoopFragment) {
			this._bvar = this.tagvar('B');
			let key = this.option('key');
			
			if (this.option('key')) {
				if (this.isDynamicType()) {
					add(("" + this.owncvar() + "=" + this.renderContextFn() + "(" + (this.option('key').c()) + ")"));
					let gets = ("" + this.owncvar() + ".run(" + (this.type().c()) + ")");
					add(("(" + this.bvar() + "=" + this.dvar() + "=1," + this.tvar() + "=" + gets + ") || (" + this.bvar() + "=" + this.dvar() + "=0," + this.owncvar() + ".cache(" + ctor + "))"));
				} else {
					let gets = ("" + this.parentCache() + ".get(" + this.kvar() + "=" + (this.option('key').c()) + ")");
					add(("(" + this.bvar() + "=" + this.dvar() + "=1," + this.tvar() + "=" + gets + ") || (" + this.bvar() + "=" + this.dvar() + "=0," + this.parentCache() + ".set(" + this.kvar() + "," + ctor + "))"));
				};
			} else if (parent.isIndexed()) {
				let memo = ("" + this.parentCache() + "[" + (parent.kvar()) + "]");
				add(("(" + this.bvar() + "=" + this.dvar() + "=1," + this.tvar() + "=" + memo + ") || (" + this.bvar() + "=" + this.dvar() + "=0," + memo + "=" + ctor + ")"));
			} else if (parent.isKeyed()) {
				if (!(this.isDynamicType())) {
					let gets = ("(" + this.kvar() + "=" + this.renderContextFn() + "(" + this.osym() + ")).get(" + (parent.kvar()) + ")");
					add(("(" + this.bvar() + "=" + this.dvar() + "=1," + this.tvar() + "=" + gets + ") || (" + this.bvar() + "=" + this.dvar() + "=0," + this.kvar() + ".set(" + (parent.kvar()) + "," + ctor + "))"));
				} else {
					let gets = ("(" + this.owncvar() + "=" + this.dynamicContextFn() + "(" + (this.type().osym()) + "," + (parent.kvar()) + ")).run(" + (this.type().c()) + "," + (this.hasDynamicTagName() ? 1 : 0) + ")"); // .get({parent.kvar})
					add(("(" + this.bvar() + "=" + this.dvar() + "=1," + this.tvar() + "=" + gets + ") || (" + this.bvar() + "=" + this.dvar() + "=0," + this.owncvar() + ".cache(" + ctor + "))"));
				};
			};
			
			this._ref = ("" + this.tvar());
			
			if (true) {
				add(("" + this.bvar() + "||(" + this.tvar() + "[" + this.gsym('##up') + "]=" + (fragment.tvar()) + ")"));
			};
			
			// dont add cvar always!
			// rule is just "do we need our own cache?"
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
			let key = this.option('key');
			let cref = this._cref || (this._cref = ("" + this.cvar() + "[" + this.osym() + "]"));
			
			if (markWhenBuilt) {
				this._bvar = this.tagvar('B');
			};
			
			if (this.isDynamicType()) {
				if (key) {
					add(("" + this.owncvar() + "=" + this.dynamicContextFn() + "(" + (key.osym()) + "," + (key.c()) + ")"));
				} else {
					add(("" + this.owncvar() + "=" + this.renderContextFn() + "(" + (this.type().osym()) + ")"));
				};
				let gets = ("" + this.owncvar() + ".run(" + (this.type().c()) + "," + (this.hasDynamicTagName() ? 1 : 0) + ")");
				add(("(" + this.bvar() + "=" + this.dvar() + "=1," + this.tvar() + "=" + gets + ") || (" + this.bvar() + "=" + this.dvar() + "=0," + this.owncvar() + ".cache(" + ctor + "))"));
			} else if (key) {
				add(("" + this.owncvar() + "=" + this.renderContextFn() + "(" + (key.osym()) + ")"));
				let gets = ("" + this.owncvar() + ".run(" + (key.c()) + ")");
				add(("(" + this.bvar() + "=" + this.dvar() + "=1," + this.tvar() + "=" + gets + ") || (" + this.bvar() + "=" + this.dvar() + "=0," + this.owncvar() + ".cache(" + ctor + "))"));
			} else {
				let ref = ("" + this.parentCache() + "[" + this.osym() + "]");
				if (markWhenBuilt) {
					add(("(" + this.bvar() + "=" + this.dvar() + "=1," + this.tvar() + "=" + ref + ") || (" + this.bvar() + "=" + this.dvar() + "=0," + ref + "=" + ctor + ")"));
				} else {
					add(("(" + this.tvar() + "=" + ref + ") || (" + ref + "=" + ctor + ")"));
				};
			};
			
			if (this.isDetached()) {
				add(("" + this.bvar() + "||(" + this.tvar() + "[" + this.gsym('##up') + "]=" + (fragment.tvar()) + ")"));
			};
			
			this._ref = this.tvar();
			
			if (dynamicKey) {
				ownCache = true;
			};
			
			if (parent instanceof TagSwitchFragment) {
				ownCache = true;
			};
		};
		
		if (ownCache) {
			this._cvar = this.tvar(); // tagvar(:c)
		};
	};
	
	if (this.isDynamicType()) {
		add({'if': ("" + this.tvar() + "[" + this.gsym('#isRichElement') + "]")});
		// ctx:condition =
	};
	
	if (this._slots) {
		for (let o1 = this._slots, slot, i = 0, keys = Object.keys(o1), l = keys.length, name; i < l; i++){
			name = keys[i];slot = o1[name];STACK.use("slots");
			let fn = this.isDynamicType() ? this.gsym('#getFunctionalSlot') : this.gsym('#getSlot');
			add(("" + (slot.tvar()) + " = " + (OP('.',this.tvar(),fn).c()) + "('" + name + "'," + this.cvar() + ")"));
		};
	};
	
	let flagsToConcat = [];
	
	for (let i = 0, items = iter$(this._attributes), len = items.length, item; i < len; i++) {
		item = items[i];
		if (item._chain && item._chain.length && !(item instanceof TagHandler)) {
			let mods = item.modifiers();
			let dyn = !mods.isStatic();
			
			let specials = mods.extractDynamics();
			let modid = item.modsIdentifier();
			let modpath = modid ? OP('.',this.tvar(),modid).c() : (("" + this.cvar() + "[" + (mods.osym()) + "]"));
			
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
		
		if (!isReactive) {
			// buggy
			add(item.c(o)); // "{tvar}.{item.c(o)}"
		} else if (item.isStatic()) {
			add(("" + this.bvar() + " || (" + item.c(o) + ")"));
		} else {
			let iref = ("" + this.cvar() + "[" + (item.osym()) + "]");
			
			if (item instanceof TagFlag) {
				let cond = item._condition;
				let val = item.name();
				let cref;
				let vref;
				let batched = !(this.isDynamicType());
				
				if (cond && !cond.isPrimitive()) {
					cref = ("" + this.cvar() + "[" + (cond.osym()) + "]");
					add(("(" + this.vvar() + "=(" + cond.c(o) + "||undefined)," + this.vvar() + "===" + cref + "||(" + this.dvar() + "|=" + (F.DIFF_FLAGS) + "," + cref + "=" + this.vvar() + "))"));
				};
				
				if (val && !(val instanceof Token) && !val.isPrimitive() && !(val instanceof MixinIdentifier) && !(val instanceof StyleRuleSet)) {
					vref = ("" + this.cvar() + "[" + (val.osym()) + "]");
					add(("(" + this.vvar() + "=" + val.c(o) + "," + this.vvar() + "===" + vref + "||(" + this.dvar() + "|=" + (F.DIFF_FLAGS) + "," + vref + "=" + this.vvar() + "))"));
				};
				
				if (batched || true) {
					if (cref && vref) {
						flagsToConcat.push(("(" + cref + " ? (" + vref + "||'') : '')"));
					} else if (cref) {
						flagsToConcat.push(("(" + cref + " ? " + val.c({as: 'string'}) + " : '')"));
					} else if (vref) {
						flagsToConcat.push(("(" + vref + "||'')"));
					} else if (val instanceof MixinIdentifier) {
						flagsToConcat.push(val.c({as: 'string'}));
					} else {
						flagsToConcat.push(("'" + val.c({as: 'substring'}) + "'"));
					};
				} else {
					if (cref) {
						add(("" + this.tvar() + ".flags.toggle(" + (vref ? vref : val.c({as: 'string'})) + "," + cref + "))"));
					} else {
						add(("(" + this.bvar() + "||" + this.tvar() + ".flags.add(" + (vref ? vref : val.c({as: 'string'})) + ")"));
					};
				};
			} else if (item instanceof TagHandler) {
				let mods = item.modifiers();
				let specials = mods.extractDynamics();
				let visit = false;
				add(("" + this.hvar() + " = " + iref + " || (" + iref + "=" + mods.c(o) + ")"));
				for (let j = 0, ary = iter$(specials), len = ary.length, special; j < len; j++) {
					special = ary[j];
					let k = special.option('key');
					let i = special.option('index');
					let path = ("" + (OP('.',this.hvar(),k).c()) + "[" + i + "]");
					if (k == 'options') {
						visit = true;
						add(("(" + this.vvar() + "=" + special.c(o) + "," + this.vvar() + "===" + path + " || (" + path + "=" + this.vvar() + "," + this.dvar() + "|=" + (F.DIFF_MODIFIERS) + "|" + (F.DIFF_INLINE) + "))"));
					} else {
						add(("" + path + "=" + special.c(o)));
					};
				};
				
				add(("" + this.bvar() + " || " + this.ref() + ".on$(" + (item.quoted()) + "," + (this.hvar().c()) + "," + (this.scope__().context().c()) + ")"));
				if (visit) {
					add(("" + this.dvar() + "&" + (F.DIFF_INLINE) + " && (" + this.dvar() + "^=" + (F.DIFF_INLINE) + "," + this.hvar() + "[" + this.gsym('#visit') + "]?.())"));
				};
			} else if ((item instanceof TagAttr) && item._ns == 'bind') {
				
				let rawVal = item.value();
				let val = PATHIFY(rawVal);
				
				shouldEnd = true;
				if (val instanceof Array) {
					let target = val[0];
					let key = val[1];
					let bval = "[]";
					
					let alit = target && target.isConstant(); //  isa Literal or target isa ScopeContext
					let blit = key && key.isConstant(); // isa Literal or key isa SymbolIdentifier
					
					if ((target instanceof Self) && !this.root().isSelf()) {
						alit = false;
					};
					
					if (alit && blit) {
						bval = ("[" + target.c(o) + "," + key.c(o) + "]");
					} else if (blit) {
						bval = ("[null," + key.c(o) + "]");
					};
					
					add(("" + this.vvar() + "=" + iref + " || (" + iref + "=" + this.ref() + ".bind$('" + (item.key()) + "'," + bval + "))"));
					
					if (target && !alit) {
						add(("" + this.vvar() + "[0]=" + target.c(o)));
					};
					if (key && !blit) {
						add(("" + this.vvar() + "[1]=" + key.c(o)));
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
					add(("" + this.bvar() + " || (" + M(item.js(o),item) + ")"));
				} else if (val instanceof Func) {
					add(("(" + item.js(o) + ")"));
				} else if (val._variable) {
					let vc = val.c(o);
					item.setValue(LIT(("" + iref + "=" + vc)));
					add(("(" + this.bvar() + "&&" + vc + "===" + iref + " || (" + M(item.js(o),item) + "))"));
				} else {
					item.setValue(LIT(("" + iref + "=" + this.vvar())));
					add(("(" + this.vvar() + "=" + val.c(o) + "," + this.bvar() + "&&" + this.vvar() + "===" + iref + " || (" + M(item.js(o),item) + "))"));
				};
			};
		};
	};
	
	if (flagsToConcat.length || ((this.isSelf() || this.isDynamicType()) && this._className)) {
		if (this._className) { flagsToConcat.unshift(this._className) };
		let cond = ("" + this.dvar() + "&" + (F.DIFF_FLAGS));
		let meth = this.isSelf() ? 'flagSelf$' : 'flag$';
		let extra = 'null';
		if (this.isSelf() || this.isDynamicType()) { cond = ("(!" + this.bvar() + "||" + cond + ")") };
		
		if (this.isDynamicType()) {
			if (this._styleName) {
				extra = this._styleName.c();
			};
			
			add(("(" + cond + " && " + this.tvar() + ".flags.reconcile(" + this.osym() + "," + flagsToConcat.join("+' '+") + "," + extra + "))"));
		} else {
			add(("(" + cond + " && " + this.tvar() + "." + meth + "(" + flagsToConcat.join("+' '+") + "," + extra + "))"));
		};
	};
	
	// When there is only one value and that value is a static string or num - include it in ctor
	// loop through attributes etc
	// add
	
	let count = nodes.length;
	
	for (let i = 0, len = nodes.length, item; i < len; i++) {
		item = nodes[i];
		if (item instanceof Str) { // static for sure
			// should this not go into a TagLike? Definitely
			if (isReactive) {
				add(("" + this.bvar() + " || " + this.tvar() + this.domCall('insert') + "(" + item.c(o) + ")"));
			} else {
				add(("" + this.tvar() + this.domCall('insert') + "(" + item.c(o) + ")"));
			};
		} else if (item instanceof StyleRuleSet) {
			for (let j = 0, items = iter$(item.placeholders()), len = items.length; j < len; j++) {
				let item = items[j]._setter;
				// TODO - this logic should definitely move into TagAttr.c
				let iref = ("" + this.cvar() + "[" + (item.osym()) + "]");
				let val = item.value();
				if (item.valueIsStatic()) {
					add(("" + this.bvar() + " || (" + M(item.js(o),item) + ")"));
				} else if (val instanceof Func) {
					add(("(" + item.js(o) + ")"));
				} else if (val._variable) {
					let vc = val.c(o);
					item.setValue(LIT(("" + iref + "=" + vc)));
					add(("(" + this.bvar() + "&&" + vc + "===" + iref + " || (" + M(item.js(o),item) + "))"));
				} else {
					item.setValue(LIT(("" + iref + "=" + this.vvar())));
					add(("(" + this.vvar() + "=" + val.c(o) + "," + this.bvar() + "&&" + this.vvar() + "===" + iref + " || (" + M(item.js(o),item) + "))"));
				};
			};
		} else {
			add(item.c(o));
		};
	};
	
	if (shouldEnd) {
		if (!parent && !(this.isSelf())) {
			foot.push(("" + this.bvar() + " || " + this.parentCache() + ".sym || !" + this.tvar() + ".setup || " + this.tvar() + ".setup(" + this.dvar() + "," + this.parentCache() + "," + this.osym() + ")"));
			foot.push(("" + this.parentCache() + ".sym || " + this.tvar() + this.domCall('end') + "(" + this.dvar() + ")"));
		} else if (this.isSelf()) {
			foot.push(("" + this.tvar() + this.domCall('close') + "(" + this.dvar() + ")"));
		} else {
			foot.push(("" + this.bvar() + " || !" + this.tvar() + ".setup || " + this.tvar() + ".setup(" + this.dvar() + "," + this.owncvar() + ")"));
			foot.push(("" + this.tvar() + this.domCall('end') + "(" + this.dvar() + ")"));
		};
	};
	
	// horrible hacks to work around the way we join the tag parts
	// to expressions and/or statements
	if (this.isDynamicType()) {
		foot.push({endif: true});
	};
	
	if (parent instanceof TagLoopFragment) {
		
		if (parent.isKeyed()) {
			// the last kvar argument here is not used right now
			foot.push(("" + (parent.ref()) + ".push(" + this.tvar() + "," + (parent.kvar()) + "++," + this.kvar() + ")"));
		} else if (parent.isIndexed()) {
			foot.push(("" + (parent.kvar()) + "++"));
		};
	} else if (this.isFragment() && parent && !(parent instanceof TagSwitchFragment)) {
		true;
	} else if (parent && !(parent instanceof TagSwitchFragment) && (this.isComponent() || dynamicKey || this.option('reference'))) {
		let pref = fragment.ref();
		let cref = this._cref;
		
		if (dynamicKey || this.isDynamicType() || this.isDetached()) {
			if (fragment instanceof TagSlotProxy) {
				foot.push(("(" + this.tvar() + "==" + cref + ") || (!" + cref + " && " + pref + this.domCall('appendChild') + "(" + cref + "=" + this.tvar() + ")) || (" + pref + this.domCall('replaceChild') + "(" + this.tvar() + "," + cref + ")," + cref + "=" + this.tvar() + ")"));
			} else {
				foot.push(("(" + this.tvar() + "==" + cref + ") || (!" + cref + " && (" + cref + "=" + this.tvar() + ")" + this.domCall('insertInto') + "(" + pref + ")) || " + cref + this.domCall('replaceWith') + "(" + cref + "=" + this.tvar() + "," + pref + ")"));
			};
		} else if (!(this.isDetached())) {
			foot.push(("" + this.bvar() + " || " + pref + this.domCall('appendChild') + "(" + this.tvar() + ")"));
		};
	};
	
	if (this.option('fragmented')) {
		
		add(("" + (this.runtime().renderContext) + ".context=null"));
	};
	
	if (!this._consumedBy) {
		if (this.option('return') || this.option('iife')) {
			foot.push(("return " + this.tvar()));
		} else if (!isReactive || o.inline) {
			foot.push(("" + this.tvar()));
		};
	};
	
	out = out.concat(foot);
	
	if (o.inline) {
		o.inline = parentIsInlined;
		
		let js = '(';
		let last = out.length - 1;
		
		for (let i = 0, items = iter$(out), len = items.length, item; i < len; i++) {
			item = items[i];
			if (item.if) {
				js += ("(" + (item.if) + " && (\n"); // + '{\n'
			} else {
				js += item.endif ? '))' : item;
				if (!(i == last || (out[i + 1].endif))) { js += ',\n' };
			};
		};
		js += ')';
		
		// let js = '(' + out.join(',\n') + ')'
		if (this.isSlot() && this.hasChildren()) {
			let post = "";
			if (!((parent instanceof TagSwitchFragment))) {
				let key = ("" + this.cvar() + "[" + this.osym() + "]");
				let key_ = ("" + this.cvar() + "[" + this.osym('_') + "]");
				let key__ = ("" + this.cvar() + "[" + this.osym('__') + "]");
				let post = ("" + this.tvar() + "===" + key__ + " || (" + key_ + " = " + (fragment.tvar()) + this.domCall('insert') + "(" + key__ + "=" + this.tvar() + "," + (this._flags) + "," + key_ + "))");
			};
			js = ("(" + this.tvar() + "=" + slotPath + "),(!" + this.tvar() + " || !" + this.tvar() + ".hasChildNodes() && " + js + "),(" + post + ")");
		};
		return js;
	};
	
	o.inline = parentIsInlined;
	
	let js = '';
	for (let i = 0, items = iter$(out), len = items.length, item; i < len; i++) {
		item = items[i];
		if (item.if) {
			js += ("if(" + (item.if) + ")") + '{\n';
		} else if (item.endif) {
			js += '};\n';
		} else {
			js += item + ';\n';
		};
	};
	
	// let js = out.join(";\n")
	if (this.isSlot() && this.hasChildren()) {
		let post = "";
		if (!((parent instanceof TagSwitchFragment))) {
			let key = ("" + this.cvar() + "[" + this.osym() + "]");
			let key_ = ("" + this.cvar() + "[" + this.osym('_') + "]");
			let key__ = ("" + this.cvar() + "[" + this.osym('__') + "]");
			post = ("" + this.tvar() + "===" + key__ + " || (" + key_ + " = " + (fragment.tvar()) + this.domCall('insert') + "(" + key__ + "=" + this.tvar() + "," + (this._flags) + "," + key_ + "))");
		};
		
		js = ("" + this.tvar() + "=" + slotPath + ";\nif(!" + this.tvar() + " || !" + this.tvar() + ".hasChildNodes())\{\n" + js + "\n\}\n" + post);
	};
	
	if (this.option('iife')) {
		js = ("(()=>\{" + js + ";\})()");
		if (this.option('return')) { js = ("return " + js) };
	} else if (this.hasBlockScopedVariables()) {
		// only if we are not in expression?
		js = '{' + js + '}';
	};
	return js;
};

function TagWrapper(){ return ValueNode.apply(this,arguments) };

subclass$(TagWrapper,ValueNode);

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

// SELECTORS

function Selector(list,options){
	this._nodes = list || [];
	this._options = options;
};

subclass$(Selector,ListNode);

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
		return ("" + imba + ".q$(" + q + "," + o.scope().context().c({explicit: true}) + ")"); // explicit context
	} else if (typ == '%%') {
		return ("" + imba + ".q$$(" + q + "," + o.scope().context().c({explicit: true}) + ")");
	} else {
		return ("" + imba + ".q" + typ + "(" + q + ")");
	};
};

function SelectorPart(){ return ValueNode.apply(this,arguments) };

subclass$(SelectorPart,ValueNode);



// DEFER

function Await(){ return ValueNode.apply(this,arguments) };

subclass$(Await,ValueNode);

Await.prototype.js = function (o){
	return ("await " + (this.value().c())); // if option(:native)
	// introduce a util here, no?
	return CALL(OP('.',new Util.Promisify([this.value()]),'then'),[this._func]).c();
};

Await.prototype.visit = function (o){
	// things are now traversed in a somewhat chaotic order. Need to tighten
	// Create await function - push this value up to block, take the outer
	this.value().traverse();
	
	var fnscope = o.up(Func); // do |item| item isa MethodDeclaration or item isa Fun
	
	if (fnscope) {
		fnscope.set({async: true});
	};
	
	return this;
	
	/*
			Top-level await is supported from node 14.8.0 but only when
			using loading script as es module, which breaks require etc.
			Right now we use our old async func transformations for top-level awaits
			but that feels hacky.
			*/
	
	this.warn("toplevel await not allowed");
	
	var block = o.up(Block); // or up to the closest FUNCTION?
	var outer = o.relative(block,1);
	var par = o.relative(this,-1);
	
	(this._func = new AsyncFunc([],[]),this);
	// now we move this node up to the block
	this._func.body()._nodes = block.defers(outer,this);
	this._func.scope().visit();
	
	// if the outer is a var-assignment, we can simply set the params
	if (par instanceof Assign) {
		par._left.traverse();
		var lft = par._left.node();
		// Can be a tuple as well, no?
		if (lft instanceof VarReference) {
			// the param is already registered?
			// should not force the name already??
			// beware of bugs
			this._func.params().at(0,true,lft.variable().name());
		} else {
			(par._right = this._func.params().at(0,true),par);
			this._func.body().unshift(par);
			this._func.scope().context();
		};
	};
	
	// If it is an advance tuple or something, it should be possible to
	// feed in the paramlist, and let the tuple handle it as if it was any
	// other value
	
	// CASE If this is a tuple / multiset with more than one async value
	// we need to think differently.
	
	// now we need to visit the function as well
	this._func.traverse();
	// pull the outer in
	return this;
};

function AsyncFunc(params,body,name,target,options){
	AsyncFunc.prototype.__super__.constructor.call(this,params,body,name,target,options);
};

subclass$(AsyncFunc,Func);

AsyncFunc.prototype.scopetype = function (){
	return LambdaScope;
};

// IMPORTS
function ESMSpecifier(name,alias){
	this._name = name;
	this._alias = alias;
};

subclass$(ESMSpecifier,Node);

ESMSpecifier.prototype.alias = function(v){ return this._alias; }
ESMSpecifier.prototype.name = function(v){ return this._name; }
ESMSpecifier.prototype.setName = function(v){ this._name = v; return this; };

ESMSpecifier.prototype.loc = function (){
	return this._alias ? this._alias.loc() : this._name.loc();
};

ESMSpecifier.prototype.sourcePath = function (){
	return this._importer ? this._importer.sourcePath() : null;
};

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
		if (!this._exporter._source) {
			this._variable = this.scope__().root().lookup(this._cname);
		};
	} else {
		this._variable = this.scope__().root().register(this._key,this,{type: 'imported'});
	};
	return this;
};

ESMSpecifier.prototype.js = function (){
	let n = helpers.toValidIdentifier(this._name.c());
	let a = this._alias && helpers.toValidIdentifier(this._alias.c());
	if (a) {
		return ("" + n + " as " + a);
	} else {
		return ("" + n);
	};
};

function ImportSpecifier(){ return ESMSpecifier.apply(this,arguments) };

subclass$(ImportSpecifier,ESMSpecifier);



function ImportNamespaceSpecifier(){ return ESMSpecifier.apply(this,arguments) };

subclass$(ImportNamespaceSpecifier,ESMSpecifier);



function ExportSpecifier(){ return ESMSpecifier.apply(this,arguments) };

subclass$(ExportSpecifier,ESMSpecifier);



function ExportAllSpecifier(){ return ESMSpecifier.apply(this,arguments) };

subclass$(ExportAllSpecifier,ESMSpecifier);



function ImportDefaultSpecifier(){ return ESMSpecifier.apply(this,arguments) };

subclass$(ImportDefaultSpecifier,ESMSpecifier);



function ESMSpecifierList(){ return ListNode.apply(this,arguments) };

subclass$(ESMSpecifierList,ListNode);

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

ESMDeclaration.prototype.variable = function(v){ return this._variable; }
ESMDeclaration.prototype.addEnv = function (env){
	this._envs || (this._envs = []);
	this._envs.push(new EnvFlag(env));
	return this;
};

ESMDeclaration.prototype.isExcluded = function (){
	if (this.isTypeOnly() && !STACK.tsc()) {
		return true;
	};
	
	if (this._envs) {
		if (STACK.tsc()) {
			return this._envs.find(function(_0) { return _0._key == 'JS'; });
		};
		
		return !this._envs.find(function(_0) { return _0.isTruthy(); });
	};
	return false;
};

ESMDeclaration.prototype.isTypeOnly = function (){
	return false;
};

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

function AssetReference(){ return ValueNode.apply(this,arguments) };

subclass$(AssetReference,ValueNode);

AssetReference.prototype.setup = function (){
	return this;
};

AssetReference.prototype.c = function (){
	let out = "";
	let ref = this.value().ref.c();
	let path = this.value().path;
	if (this._value.kind && path.indexOf('?') == -1) {
		path += ("?" + (this._value.kind));
	};
	if (STACK.tsc()) {
		if (this.value().pathToken) {
			// value:pathToken
			let pathjs = M(("'" + (path.split('?')[0]) + "'"),this.value().pathToken);
			out = ("import " + pathjs + "; const " + ref + " = /** @type\{ImbaAsset\} */(null)");
		} else {
			// out = "const {ref} = /** @type\{ImbaAsset\} */(\{path:'{path}'\})"
			// out = "const {ref} = /** @type\{ImbaAsset\} */(\{path:'{path}'\})"
			out = ("const " + ref + " = /** @type\{ImbaAsset\} */(\{path:'" + path + "'\})");
		};
	} else {
		out = ("import " + ref + " from " + M(("'" + path + "'"),this.value().pathToken));
	};
	return out;
};

function ImportDeclaration(){ return ESMDeclaration.apply(this,arguments) };

subclass$(ImportDeclaration,ESMDeclaration);

ImportDeclaration.prototype.sourcePath = function (){
	return this._source && this._source.c();
};

ImportDeclaration.prototype.ownjs = function (){
	var ary;
	var src = this._source && this._source.c();
	
	if (STACK.tsc()) {
		// let raw = src.slice(1,-1)
		var ary = iter$(this._source.raw().split('?'));let raw = ary[0],q = ary[1];
		src = M(("'" + raw + "'"),this._source);
		
		if (raw.match(/\.(html|svg|png|jpe?g|gif)$/) || (q && q.match(/^\w/) && q != 'external')) {
			if (this._specifiers && this._source) {
				let out = ("" + M(this.keyword().c(),this.keyword()) + " " + src + ";\nimport " + AST.cary(this._specifiers).join(',') + " from 'data:text/asset;';");
				return out;
			};
		};
	};
	
	let type = this.isTypeOnly() ? ' type ' : ' ';
	if (this._specifiers && this._source) {
		return ("" + M(this.keyword().c(),this.keyword()) + type + AST.cary(this._specifiers).join(',') + " from " + src);
	} else {
		return ("" + M(this.keyword().c(),this.keyword()) + type + src);
	};
};

ImportDeclaration.prototype.js = function (){
	if (this.isExcluded()) { return "" };
	
	let out = this.ownjs();
	return out;
};

ImportDeclaration.prototype.push = function (next){
	let curr = (this._next || this);
	return this._up.replace(curr,[curr,BR,this._next = next]);
};

ImportDeclaration.prototype.visit = function (){
	var $1;
	this.setEnds(this._keyword,this._source);
	if (this.isExcluded()) { return };
	
	for (let i = 0, items = iter$(this._specifiers), len = items.length; i < len; i++) {
		($1 = items[i]) && $1.traverse  &&  $1.traverse();
	};
	
	this.scope__()._lastImport = this;
	this._up = this.up();
	return;
};

function ImportTypeDeclaration(){ return ImportDeclaration.apply(this,arguments) };

subclass$(ImportTypeDeclaration,ImportDeclaration);

ImportTypeDeclaration.prototype.isTypeOnly = function (){
	return true;
};

ImportTypeDeclaration.prototype.js2 = function (){
	if (!STACK.tsc()) { return "" };
	
	let src = this._source.c();
	
	if (this._defaults) {
		let tpl = '/** @typedef \{import(SOURCE).default\} NAME */true';
		tpl = tpl.replace('SOURCE',src).replace('NAME',this._defaults.c());
		return tpl; // '/** @typedef \{import("PATH")\} NAME */'
	} else {
		let parts = [];
		
		for (let i = 0, items = iter$(this._specifiers[0].nodes()), len = items.length, item; i < len; i++) {
			item = items[i];
			let name = item._name.c();
			let alias = item._alias ? item._alias.c() : item._name.c();
			let part = ("/** @typedef \{import(" + src + ")." + name + "\} " + alias + " */true");
			parts.push(part);
			// let part = tpl.replace('SOURCE',src).replace('PATH',name).replace('PATH',name)
		};
		return parts.join(';\n');
	};
};

function ExportDeclaration(){ return ESMDeclaration.apply(this,arguments) };

subclass$(ExportDeclaration,ESMDeclaration);

ExportDeclaration.prototype.visit = function (){
	var $1;
	if (this.isExcluded()) { return };
	for (let i = 0, items = iter$(this._specifiers), len = items.length; i < len; i++) {
		($1 = items[i]) && $1.traverse  &&  $1.traverse();
	};
	return this;
};

ExportDeclaration.prototype.js = function (){
	if (this.isExcluded()) { return "" };
	let kw = M(this.keyword().c(),this.keyword());
	
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


function ExportNamedDeclaration(){ return ExportDeclaration.apply(this,arguments) };

subclass$(ExportNamedDeclaration,ExportDeclaration);



function MixinReference(name,scope){
	this._name = name;
	this._scope = scope;
	this._options = {};
};

MixinReference.prototype.name = function(v){ return this._name; }
MixinReference.prototype.setName = function(v){ this._name = v; return this; };
MixinReference.prototype.scope = function(v){ return this._scope; }
function MixinExports(){ return Node.apply(this,arguments) };

subclass$(MixinExports,Node);

MixinExports.prototype.add = function (name,val){
	this._mixins || (this._mixins = {});
	this._mixins[name] = val;
	return this;
};

MixinExports.prototype.c = function (){
	return ("export const mixins$ = " + AST.compileRaw(this._mixins || {}));
};

function Export(){ return ValueNode.apply(this,arguments) };

subclass$(Export,ValueNode);

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
	let isDefault = self.option('default');
	
	if (self.value() instanceof ListNode) {
		self.value().map(function(item) { return item.set({export: self}); });
	};
	// else
	//	value.set export: self
	
	if ((self.value() instanceof MethodDeclaration) || (self.value() instanceof ClassDeclaration)) {
		return self.value().c();
	};
	
	if ((self.value() instanceof Assign) && (self.value()._left instanceof VarReference)) {
		let ek = M('export',self.option('keyword'));
		let dk = isDefault && M('default',self.option('default'));
		return isDefault ? (("" + ek + " " + dk + " " + (self.value().c()))) : (("" + ek + " " + (self.value().c())));
	};
	
	if (isDefault) {
		let out = self.value().c();
		return ("export default " + out);
	};
	return self.value().c();
};

function Require(){ return ValueNode.apply(this,arguments) };

subclass$(Require,ValueNode);

Require.prototype.js = function (o){
	var val = (this.value() instanceof Parens) ? this.value().value() : this.value();
	var out = val.c();
	return (out == 'require') ? 'require' : (("require(" + out + ")"));
};

function EnvFlag(){
	EnvFlag.prototype.__super__.constructor.apply(this,arguments);
	this._key = String(this._value).slice(1,-1);
};

subclass$(EnvFlag,ValueNode);

EnvFlag.prototype.raw = function (){
	return (this._raw == null) ? (this._raw = STACK.env("" + this._key)) : this._raw;
};

EnvFlag.prototype.isTruthy = function (){
	if (this._key == "JS") {
		return !STACK.tsc();
	};
	
	if (STACK.tsc()) {
		// always truthy for tsc unless $js$
		return true;
	};
	
	var val = this.raw();
	if (val !== undefined && !(val instanceof Node)) { return !!val };
	return undefined;
};

EnvFlag.prototype.loc = function (){
	return [0,0];
};

EnvFlag.prototype.c = function (){
	var val = this.raw();
	var out = val;
	if (STACK.tsc()) {
		out = LIT(("" + (this.runtime().$env) + "(" + (STR(this._key).c()) + ")"));
	} else if (this._key == "JS") {
		out = LIT('true');
	} else if (val !== undefined) {
		if ((typeof val=='string'||val instanceof String)) {
			if (val.match(/^\d+(\.\d+)?$/)) {
				out = String(parseFloat(val));
			} else {
				out = ("'" + val + "'");
			};
		} else if (val instanceof Node) {
			out = out.c();
		} else {
			out = ("" + val);
		};
	} else {
		out = ("globalThis.IMBA_ENV_" + (this._key));
	};
	
	return M(out,this._value);
};

function StyleNode(){ return Node.apply(this,arguments) };

subclass$(StyleNode,Node);



function StyleSelector(){ return StyleNode.apply(this,arguments) };

subclass$(StyleSelector,StyleNode);



// all weird parts of a selector? Or do we just compile it?

function StyleRuleSet(selectors,body){
	this._placeholders = [];
	this._selectors = selectors;
	this._body = body;
};

subclass$(StyleRuleSet,StyleNode);

StyleRuleSet.prototype.isStatic = function (){
	return true;
};

StyleRuleSet.prototype.isGlobal = function (){
	return !(!this.option('global'));
};

StyleRuleSet.prototype.addPlaceholder = function (item){
	this._placeholders.push(item);
	return this;
};

StyleRuleSet.prototype.placeholders = function (){
	return this._placeholders;
};

StyleRuleSet.prototype.cssid = function (){
	return this._cssid || (this._cssid = ("" + (STACK.root().sourceId()) + "-" + this.tid()));
};

StyleRuleSet.prototype.visit = function (stack,o){
	let cmp = this._tagDeclaration = stack.up(TagDeclaration);
	
	let tags = stack.parents(TagLike);
	
	if (tags[0] && cmp && tags[0].isSelf() && tags[1]) {
		tags[0] = cmp;
	};
	
	if (tags.length == 0 && cmp) {
		tags = [cmp];
	};
	
	this._css = {};
	this._flag = stack.up(TagFlag);
	this._tag = this._flag && this._flag._tag;
	
	let keywordName = String(this.option('name') || '');
	if (keywordName[0] == '%') {
		// need to be safely converted to a reference? Can do that later
		this._mixin = this.scope__().mixin(keywordName.slice(1));
		(this._mixin._rule = this,this._mixin);
		this._mixin._options.id = this.cssid();
	};
	
	if (this.option('export')) {
		STACK.root().mixinExports().add(this._mixin.name(),this._mixin._options);
	};
	
	let sel = String(this._selectors).trim();
	
	if (stack.parent() instanceof ClassBody) {
		// Declaration in a tag declaration
		let owner = stack.up(2);
		if (owner instanceof TagDeclaration) {
			this._css.type = 'component';
			
			if (!this._variable) {
				this._sel = sel || '&';
				this._css.scope = cmp;
			};
		} else {
			throw "css not allowed in class declaration";
		};
	} else if (stack.parent() instanceof TagBody) {
		this._tag = tags[tags.length - 1];
		this._sel = sel || '&';
		this._css.type = 'scoped';
		this._css.scope = this._tag;
		
		// FIX the selector based on the tag
	} else if (this.option('toplevel')) {
		let inbody = stack.up(TagBody);
		
		if (inbody) {
			// Inside some logical nesting
			this._tag = stack.up(TagLike);
			this._sel = sel || '&';
			
			this._css.scope = this._tag;
			this._css.ns = this.cssid();
			this._css.id = this.cssid();
			this._css.type = 'scoped';
			this._name = this.cssid();
			this.set({inTagTree: true});
		} else {
			this._css.scope = this.isGlobal() ? null : this.scope__().closure();
			this._sel || (this._sel = sel);
		};
	} else if (o.rule) {
		this._sel || (this._sel = this._selectors && this._selectors.toString  &&  this._selectors.toString().trim());
		// console.log "inside other rule? {@sel} | {o:rule.@sel} |"
		if (this._sel.indexOf('&') == -1) { this._sel = ("& " + (this._sel)) };
	} else if (!this._name && this._tag && this._flag && !this._flag._condition) {
		this._css.scope = this._tag;
		this._name = this._tag.cssid();
		this._sel = "&";
	} else if (!this._name) {
		this._name = this.cssid(); // (cmp ? (cmp.cssns + oid) : (sourceId + oid))
		this._sel = ("." + (this._name));
	};
	
	this._selectors && this._selectors.traverse  &&  this._selectors.traverse();
	
	this._styles = {};
	
	this._body && this._body.traverse  &&  this._body.traverse({rule: this,styles: this._styles,rootRule: (o.rule || this)});
	
	// add the placeholderes
	if (this._placeholders.length) {
		if (this.option('inTagTree')) {
			for (let i = 0, items = iter$(this._placeholders), len = items.length, ph; i < len; i++) {
				ph = items[i];
				let setter = new TagStyleAttr(ph.name());
				setter._tag = this._tag;
				setter.setValue(ph.runtimeValue());
				setter.set(
					{propname: ph._propname,
					unit: ph.option('unit'),
					styleterm: ph}
				);
				ph._setter = setter;
				setter.traverse();
			};
		} else if (!this._flag) {
			for (let i = 0, items = iter$(this._placeholders), len = items.length; i < len; i++) {
				items[i].warn("Only allowed inside tag tree");
			};
		};
	};
	
	if (o.rule && o.styles) {
		if (o.styles[this._sel]) {
			let base = o.styles[this._sel];
			helpers.deepAssign(base,this._styles);
		} else {
			o.styles[this._sel] = this._styles;
		};
	} else {
		let component = this._tagDeclaration;
		let opts = {
			selectors: [],
			ns: this._css.ns,
			id: this._css.id,
			type: this._css.type,
			scope: this._css.scope,
			tags: tags,
			component: cmp,
			inline: !!this._flag,
			global: !(!(this.isGlobal())),
			mixins: {},
			apply: {},
			depth: this._tag ? this._tag._level : 0
		};
		
		this._css = new StyleRule(null,this._sel,this._styles,opts).toString();
		STACK._css.add(this._css,opts);
	};
	return this;
};

StyleRuleSet.prototype.toRaw = function (){
	return ("" + (this._name));
};

StyleRuleSet.prototype.c = function (){
	if (this.option('toplevel') && this.option('export')) {
		// console.log "EXPORT??!",@identifier,@mixin,@name
		return "";
	};
	
	if (this._tvar) {
		let out = [("" + (this._tvar) + " = '" + (this._name) + "'")];
		let add = function(_0) { return out.push(_0); };
		let cvar = this._tag.cvar();
		let bvar = this._tag.bvar();
		
		for (let i = 0, items = iter$(this._placeholders), len = items.length; i < len; i++) {
			
			let item = items[i]._setter;
			// TODO - this logic should definitely move into TagAttr.c
			let iref = ("" + cvar + "[" + (item.osym()) + "]");
			let val = item.value();
			
			// TODO optimize the css variable setters
			if (true) {
				add(("" + M(item.js(this._o),item)));
			};
		};
		
		// console.log out.join('\n'),STACK.isExpression
		let expr = STACK.isExpression();
		return expr ? ("(" + out.join(',') + ")") : out.join(";\n");
		// return "{@tvar} = '{@flagIf}'"
	};
	
	if (STACK.tsc() && this._placeholders.length) {
		let out = [];
		for (let i = 0, items = iter$(this._placeholders), len = items.length; i < len; i++) {
			out.push(items[i].runtimeValue().c());
		};
		let expr = STACK.isExpression();
		return expr ? ("(" + out.join(',') + ")") : out.join(";\n");
	};
	
	if (this.option('inClassBody') || this.option('inTagTree') || this.option('toplevel')) {
		return '';
	};
	
	let out = ("'" + (this._name) + "'");
	return out;
};

// nodes # bunch of style properties and potentially nested rules


function StyleBody(){ return ListNode.apply(this,arguments) };

subclass$(StyleBody,ListNode);

StyleBody.prototype.visit = function (){
	let items = this._nodes;
	let i = 0;
	
	let prevname;
	for (let j = 0, ary = iter$(items), len = ary.length, item; j < len; j++) {
		item = ary[j];
		if (!((item instanceof StyleDeclaration))) { continue; };
		if (!item._property._name) {
			item._property._name = prevname;
		};
		
		prevname = item._property._name;
	};
	
	while (i < items.length){
		let item = items[i];
		let res = item.traverse();
		
		if (res != item) {
			if (res instanceof Array) {
				items.splice.apply(items,[].concat([i,1], Array.from(res)));
				continue;
			};
		};
		
		// has changed?
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

StyleDeclaration.prototype.clone = function (name,params){
	if (params == null) { params = this._expr.clone() };
	if (typeof params == 'string' || typeof params == 'number') {
		params = [params];
	};
	if (!(params instanceof Array) && (!(params instanceof ListNode) || (params instanceof StyleOperation))) {
		params = [params];
	};
	return new StyleDeclaration(this._property.clone(name),params);
};

StyleDeclaration.prototype.visit = function (stack,o){
	// see if property can be expanded
	var self = this, v_;
	let theme = stack._theme;
	let list = stack.parent();
	let name = String(self._property.name());
	let alias = theme.expandProperty(name);
	if (self._expr) {
		self._expr.traverse(
			{rule: o.rule,
			rootRule: o.rootRule,
			decl: self,
			property: self._property}
		);
	};
	
	if (alias instanceof Array) {
		list.replace(self,alias.map(function(_0) { return self.clone(_0); }));
		return;
	} else if (alias && alias != name) {
		self._property = self._property.clone(alias);
	};
	
	let method = String(alias || name).replace(/-/g,'_');
	
	
	if (self._expr) { self._expr.traverse({decl: self,property: self._property}) };
	
	
	let res;
	let expanded = [];
	if (self._property.isColor && self._property.isColor()) {
		res = theme.colormix(name.slice(1),self._expr.toArray());
		// console.log "prop is color!!!",res
	} else if (theme[method] && !self.option('plain')) {
		res = theme[method].apply(theme,self._expr.toArray());
	};
	
	if (res instanceof Array) {
		self._expr = new StyleExpressions(res);
	} else if (res instanceof Object) {
		for (let v, i = 0, keys = Object.keys(res), l = keys.length, k; i < l; i++){
			k = keys[i];v = res[k];if (k.indexOf('&') >= 0) {
				let body = new StyleBody([]);
				let rule = new StyleRuleSet(LIT(k),body);
				expanded.push(rule);
				for (let v2, j = 0, keys1 = Object.keys(v), l = keys1.length, k2; j < l; j++){
					// need recursive thing here
					k2 = keys1[j];v2 = v[k2];body.add(self.clone(k2,v2));
				};
			} else {
				expanded.push(self.clone(k,v).set({plain: (k == name) || (k == alias)}));
			};
		};
		list.replace(self,expanded);
		return;
	};
	
	if (self._expr) {
		self._expr.traverse({decl: self,property: self._property});
		self._expr.set({parens: false});
	};
	
	if (o.styles) {
		let key = self._property.toKey();
		
		let val = self._expr;
		if (o.selector) {
			key = JSON.stringify([o.selector,key]);
		};
		
		if (self._property._unit) {
			if (self._property._number != 1) {
				val = LIT(("calc(" + (val.c()) + " / " + (self._property._number) + ")"));
			};
		};
		
		// if this key has already been set we need to delete it
		// because we rely on the key order of the object.
		// Should move over to using an array for this probably
		if (o.styles[key]) {
			(((v_ = o.styles[key]),delete o.styles[key], v_));
		};
		
		o.styles[key] = val.c({property: self._property});
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
	var m;
	this._token = token;
	let raw = String(this._token);
	
	// also split
	this._parts = raw.replace(/(^|\b)\$/g,'--').split(/\b(?=[\^\.\@\!])/g); // .split(/[\.\@]/g)
	
	for (let i = 0, items = iter$(this._parts), len = items.length; i < len; i++) {
		this._parts[i] = items[i].replace(/^\.(?=[^\.])/,'@.');
	};
	
	this._name = String(this._parts[0]);
	
	if (raw[0] == '#') {
		this._kind = 'color';
		if (constants.HEX_REGEX.test(this._name)) {
			this.error(("Color name " + (this._name) + " cannot be identical to valid hex color"),{loc: token[0] || token});
		};
	};
	
	
	if (m = this._name.match(/^(\d+)([a-zA-Z]+)$/)) {
		this._number = parseInt(m[1]);
		this._unit = m[2];
	};
	
	if (!this._name.match(/^[\#\w\-]/)) {
		this._parts.unshift(this._name = null);
	};
	
	this;
};

subclass$(StyleProperty,StyleNode);

// modifiers
// values
StyleProperty.prototype.setName = function (value){
	var m;
	if (m = value.match(/^(\d+)([a-zA-Z]+)$/)) {
		this._number = parseInt(m[1]);
		this._unit = m[2];
	} else {
		this._number = this._unit = null;
	};
	this._name = value;
	return this;
};

StyleProperty.prototype.name = function (){
	return this._name || (this._name = String(this._parts[0]));
};

StyleProperty.prototype.clone = function (newname){
	return new StyleProperty([newname || this._name].concat(this.modifiers()).join(""));
};

StyleProperty.prototype.addModifier = function (modifier){
	this._parts.push(modifier);
	return this;
};

StyleProperty.prototype.isColor = function (){
	return this._kind == 'color' || this._name[0] == '#';
};

StyleProperty.prototype.modifiers = function (){
	return this._parts.slice(1);
};

StyleProperty.prototype.toJSON = function (){
	return this._name + this.modifiers().join("§");
};

StyleProperty.prototype.toString = function (){
	return this._name + this.modifiers().join("§");
};

StyleProperty.prototype.toKey = function (){
	let name = this._unit ? (("--u_" + (this._unit))) : ((this.isColor() ? (("--c_" + this._name.slice(1))) : this._name));
	return [name].concat(this.modifiers()).join('§');
};

StyleProperty.prototype.c = function (){
	return this.toString();
};

// lookup shorthand. If shorthand represents multiple
// props then we compile it to multiple props
;

function StylePropertyIdentifier(name){
	this._name = name;
	if (String(name)[0] == '$') {
		this._name = ("--" + String(name).slice(1));
	};
	// val[0] == '$' ? "var(--{val.slice(1)})" : val
};

subclass$(StylePropertyIdentifier,StyleNode);

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

StylePropertyModifier.prototype.toJSON = function (){
	return String(this._name);
};

StylePropertyModifier.prototype.toString = function (){
	return String(this._name);
};

function StyleExpressions(){ return ListNode.apply(this,arguments) };

subclass$(StyleExpressions,ListNode);

StyleExpressions.prototype.load = function (list){
	if (list instanceof Array) {
		list = list.map(function(_0) { return (_0 instanceof StyleExpression) ? (_0) : new StyleExpression(_0); });
	};
	return [].concat(list);
};

StyleExpressions.prototype.c = function (o){
	let out = AST.cary(this._nodes,o).join(', ');
	if (this.option('parens')) {
		out = ("( " + out + " )");
	};
	return out;
};

StyleExpressions.prototype.clone = function (){
	return new StyleExpressions(this._nodes.slice(0));
};

StyleExpressions.prototype.toArray = function (){
	return this._nodes.filter(function(_0) { return _0 instanceof StyleExpression; }).map(function(_0) { return _0.toArray(); });
};

function StyleExpression(){ return ListNode.apply(this,arguments) };

subclass$(StyleExpression,ListNode);

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

StyleExpression.prototype.c = function (o){
	if (o && o.as == 'js') {
		return AST.cary(this._nodes,o).join(' ');
	};
	return this.toString();
};

StyleExpression.prototype.toJSON = function (){
	return this.toString();
};

StyleExpression.prototype.toArray = function (){
	return this._nodes;
};

StyleExpression.prototype.addParam = function (param,op){
	param._op = op;
	this.last().addParam(param);
	return this;
};

StyleExpression.prototype.reclaimParams = function (){
	let items = this.filter(function(_0) { return _0.param; });
	for (let i = 0, ary = iter$(items), len = ary.length, item; i < len; i++) {
		item = ary[i];
		let param = item.param;
		let op = param._op;
		this.add([op,param],{after: item});
		item._params = [];
	};
	
	return;
};

StyleExpression.prototype.visit = function (stack,o){
	if (o && o.property) {
		let name = o.property._name;
		if (name == 'gt' || name == 'grid-template') {
			this.reclaimParams();
		};
	};
	return StyleExpression.prototype.__super__.visit.apply(this,arguments);
};

function StyleParens(){ return ValueNode.apply(this,arguments) };

subclass$(StyleParens,ValueNode);

StyleParens.prototype.visit = function (stack,o){
	StyleParens.prototype.__super__.visit.apply(this,arguments);
	return this.set({calc: !stack.up(StyleParens) && !stack.up(StyleFunction)});
};

StyleParens.prototype.c = function (o){
	let plain = this._value.c();
	
	// TODO warn when option(:unit) is set
	
	if (o && o.as == 'js') {
		return plain;
	} else if (this.option('calc')) {
		let unit = this._options && String(this._options.unit || '');
		if (unit) {
			
			return ("calc(calc(" + plain + ") * 1" + unit + ")");
		} else {
			return ("calc(" + plain + ")");
		};
	} else {
		return ("(" + plain + ")");
	};
};

function StyleOperation(){ return ListNode.apply(this,arguments) };

subclass$(StyleOperation,ListNode);

StyleOperation.prototype.c = function (o){
	return AST.cary(this._nodes,o).join(' ');
};

function StyleTerm(){ return ValueNode.apply(this,arguments) };

subclass$(StyleTerm,ValueNode);

StyleTerm.prototype.valueOf = function (){
	return String(this._value);
};

StyleTerm.prototype.toString = function (){
	return String(this._value);
};

StyleTerm.prototype.toRaw = function (){
	return this.valueOf();
};

StyleTerm.prototype.toAlpha = function (){
	return this.valueOf();
};

StyleTerm.prototype.visit = function (stack,o){
	this._token = this._value;
	this._property = o.property;
	this._propname = o.property && o.property._name;
	this.alone = (stack.up() instanceof StyleExpression) && stack.up().values().length == 1;
	let resolved = stack._theme.$value(this,0,this._propname);
	if (!(stack.up(StyleParens) || stack.up(StyleFunction))) { this._resolvedValue = resolved };
	return this;
};

Object.defineProperty(StyleTerm.prototype,'param',{get: function(){
	return this._params && this._params[0];
}, configurable: true});

StyleTerm.prototype.runtimeValue = function (){
	return this.value();
};

StyleTerm.prototype.addParam = function (param){
	this._params || (this._params = []);
	this._params.push(param);
	return this;
};

StyleTerm.prototype.c = function (o){
	let out = (this._resolvedValue && !(this._resolvedValue instanceof Node)) ? C(this._resolvedValue) : this.valueOf();
	return out;
};

function StyleInterpolationExpression(){ return StyleTerm.apply(this,arguments) };

subclass$(StyleInterpolationExpression,StyleTerm);

StyleInterpolationExpression.prototype.name = function(v){ return this._name; }
StyleInterpolationExpression.prototype.setName = function(v){ this._name = v; return this; };

StyleInterpolationExpression.prototype.loc = function (){
	return [this._startLoc,this._endLoc];
};

StyleInterpolationExpression.prototype.visit = function (stack,o){
	StyleInterpolationExpression.prototype.__super__.visit.apply(this,arguments);
	if (o.rootRule) {
		o.rootRule.addPlaceholder(this);
	};
	this._id = ("" + this.sourceId() + "_" + this.tid()); // could use a different counter?
	this._name = ("--" + (this._id));
	return this._runtimeValue = this.value();
	// @propname = stack.theme.expandProperty
};

StyleInterpolationExpression.prototype.runtimeValue = function (){
	return this._runtimeValue;
};

Object.defineProperty(StyleInterpolationExpression.prototype,'unit',{get: function(){
	return this._options && String(this._options.unit) || '';
}, configurable: true});

StyleInterpolationExpression.prototype.c = function (){
	return ("var(--" + (this._id) + ")");
};

function StyleFunction(value,params){
	this._name = value;
	this._params = params;
};

subclass$(StyleFunction,Node);

StyleFunction.prototype.kind = function (){
	return 'function';
};

StyleFunction.prototype.visit = function (stack,o){
	this._property = o.property;
	this._propname = o.property && o.property._name;
	if (this._params && this._params.traverse) { this._params.traverse() };
	
	let name = String(this._name);
	let parts = this._params.toArray().flat();
	
	if (this._property.isColor() && name.match(/^(lch|rgba?|hsla?)$/)) {
		
		this._lcha = [];
		for (let i = 0, items = iter$(parts), len = items.length, part; i < len; i++) {
			part = items[i];
			if (part._value == '/') {
				continue;
			};
			this._lcha.push(part);
		};
		
		if (name != 'lch') {
			let alpha = this._lcha[3];
			let kind = name.slice(0,3);
			
			for (let i = 0, items = iter$(this._lcha), len = items.length, part; i < len; i++) {
				part = items[i];
				if (!(part instanceof StyleDimension) && i < 3) {
					return this.error("Dynamic part not allowed in non-lch #color definitions",{loc: part});
				};
			};
			
			try {
				let inside = this._params.c();
				if (alpha && !(alpha instanceof StyleDimension)) {
					inside = inside.replace(alpha.c(),'1');
				};
				let full = ("" + name + "(" + inside + ")");
				
				let col = colord(full).toLch();
				this._lcha = [col.l,col.c,col.h,col.a];
				if (alpha) { this._lcha[3] = alpha };
			} catch (e) {
				this.error("Failed to parse color",{loc: this});
			};
		};
	};
	return this;
};

StyleFunction.prototype.lcha = function (){
	return this._lcha || [0,0,0,1];
};

StyleFunction.prototype.toString = function (){
	return this.c();
};

StyleFunction.prototype.c = function (o){
	
	var res;
	let name = String(this._name);
	let pars = this._params.c();
	let out = ("" + name + "(" + pars + ")");
	
	if ((this._property && this._property.isColor())) {
		
		if (name == 'hsl') {
			let parts = this._params.toArray().flat();
			if (parts.length == 3) {
				return AST.cary(parts).join(',');
			};
		};
		
		if (res = Color.from(out)) {
			return res.toVar();
		};
	};
	
	if (o && o.as == 'js') { out = helpers.singlequote(out) };
	return out;
};

function StyleURL(){ return ValueNode.apply(this,arguments) };

subclass$(StyleURL,ValueNode);

StyleURL.prototype.c = function (){
	let out = String(this._value);
	return SourceMapper.strip(out);
};

function StyleIdentifier(){ return StyleTerm.apply(this,arguments) };

subclass$(StyleIdentifier,StyleTerm);


StyleIdentifier.prototype.visit = function (stack){
	let raw = this.toString();
	if (raw.match(/^[lcha]$/)) {
		StyleIdentifier.prototype.__super__.visit.apply(this,arguments);
		let mix = stack.up(StyleColorMix);
		this._colormix = mix;
		return this._resolvedValue = ("var(--u_" + (this._colormix._name) + raw.toUpperCase() + ")");
	} else {
		if (raw.match(/^([a-zA-Z]+\d+|black|white)$/)) {
			(this._color = "" + raw,this);
			if (this.param) {
				(this._color = this._color + "/" + this.param.toAlpha(),this);
			};
		};
		return StyleIdentifier.prototype.__super__.visit.apply(this,arguments);
	};
};

StyleIdentifier.prototype.c = function (o){
	if (this._colormix) {
		return ("var(--u_" + (this._colormix._name) + this.toString().toUpperCase() + ")");
	};
	
	if (this._color) {
		let val = this._color.toString();
		let asvar = this.option('parameterize') || (this._property && this._property.isColor());
		let pre = asvar ? '/*##*/' : '/*#*/';
		return pre + val;
	};
	
	let val = this.toString();
	if (val[0] == '$') {
		val = ("var(--" + val.slice(1) + ")");
		if (o && o.as == 'js') { val = helpers.singlequote(val) };
		return val;
	} else {
		return StyleIdentifier.prototype.__super__.c.apply(this,arguments);
	};
};

function StyleString(){ return StyleTerm.apply(this,arguments) };

subclass$(StyleString,StyleTerm);



function StyleColor(){ return StyleTerm.apply(this,arguments) };

subclass$(StyleColor,StyleTerm);

StyleColor.prototype.visit = function (){
	var m;
	StyleColor.prototype.__super__.visit.apply(this,arguments);
	let raw = this.toRaw();
	let name = this._name = raw.slice(1);
	
	// only needed for the property color?
	if (m = raw.match(constants.HEX_REGEX)) {
		this._hex = true;
		let col = colord(raw).toLch();
		this._lcha = [col.l,col.c,col.h,col.a];
	} else {
		this._lcha = [
			("var(--u_" + name + "L)"),
			("var(--u_" + name + "C)"),
			("var(--u_" + name + "H)"),
			("var(--u_" + name + "A,1)")
		];
	};
	
	let a = this.param && this.param.toAlpha();
	if (a != null) {
		if (a[0] == '$') { a = ("var(--" + a.slice(1) + ",100%)") };
		return this._lcha[3] = a;
	};
};

StyleColor.prototype.c = function (o){
	var ary;
	let raw = this.toRaw();
	let name = raw.slice(1);
	let rich = Color.from(raw);
	
	if (this._property && this._property.isColor()) {
		console.log('deprecated');
		return rich.toVar();
	};
	
	var ary = iter$(this._lcha);let l = ary[0],c = ary[1],h = ary[2],a = ary[3];
	if (this._hex && a == 1) {
		return raw;
	};
	
	return ("lch(" + l + " " + c + " " + h + " / " + a + ")");
};

function StyleColorMix(){ return StyleTerm.apply(this,arguments) };

subclass$(StyleColorMix,StyleTerm);

StyleColorMix.prototype.params = function (){
	return this.option('params');
};

StyleColorMix.prototype.visit = function (){
	let pars = this.params().toArray().flat();
	let name = this._name = this.toRaw().slice(1);
	this.params().traverse();
	StyleColorMix.prototype.__super__.visit.apply(this,arguments);
	
	this._lcha = [];
	
	for (let i = 0, items = iter$(pars), len = items.length, part; i < len; i++) {
		part = items[i];
		if (part._value == '/') {
			continue;
		};
		this._lcha.push(part);
	};
	
	if (this._lcha.length == 3) {
		this._lcha.push(LIT(("var(--u_" + name + "A,1)")));
	};
	return this;
};

StyleColorMix.prototype.c = function (o){
	var ary;
	let raw = this.toRaw();
	let name = raw.slice(1);
	var ary = iter$(AST.cary(this._lcha));let l = ary[0],c = ary[1],h = ary[2],a = ary[3];
	return ("lch(" + l + " " + c + " " + h + " / " + a + ")");
};

function StyleVar(){ return StyleTerm.apply(this,arguments) };

subclass$(StyleVar,StyleTerm);

StyleVar.prototype.c = function (o){
	return this.toString();
};

var VALID_CSS_UNITS = 'cm mm Q in pc pt px em ex ch rem vw vh vmin vmax % s ms fr deg rad grad turn Hz kHz cqw cqh cqi cqb cqmin cqmax'.split(' ');

function StyleDimension(value){
	this._value = value;
	let m = String(value).match(/^([\-\+]?[\d\.]*)([a-zA-Z]+|%)?$/);
	this._number = parseFloat(m[1]);
	this._unit = m[2] || null;
};

subclass$(StyleDimension,StyleTerm);


StyleDimension.prototype.clone = function (num,unit){
	if(num === undefined) num = this._number;
	if(unit === undefined) unit = this._unit;
	let cloned = new StyleDimension(this.value());
	cloned._unit = unit;
	cloned._number = num;
	return cloned;
};

StyleDimension.prototype.visit = function (stack){
	if (this._unit && this._unit.match(/^[lcha]$/)) {
		if (this._colormix = stack.up(StyleColorMix)) {
			this._unit = ("" + (this._colormix._name) + this._unit.toUpperCase());
		};
		// if par isa StyleDimension
		// 		let u = par:_unit
		// 		if u and regex.test(u)
		// 			par:_unit = "{@name}{u.toUpperCase()}"
	};
	return StyleDimension.prototype.__super__.visit.apply(this,arguments);
};

StyleDimension.prototype.toString = function (){
	return ("" + (this._number) + (this._unit || ''));
};

StyleDimension.prototype.toFloat = function (pct){
	if(pct === undefined) pct = 0.01;
	let num = this._number;
	if (this._unit == '%') {
		num = num * pct;
	};
	return num;
};

StyleDimension.prototype.toRaw = function (){
	return this._unit ? this.toString() : this._number;
};

StyleDimension.prototype.c = function (o){
	let out = (this._resolvedValue && !(this._resolvedValue instanceof Node)) ? C(this._resolvedValue) : this.valueOf();
	if (o && o.as == 'js' && this._unit) { out = helpers.singlequote(out) };
	return out;
};

StyleDimension.prototype.valueOf = function (){
	
	if (this._unit == 'u') {
		return this._number * 4 + 'px';
	} else if (this._unit == null) {
		return this._number;
	} else if (idx$(this._unit,VALID_CSS_UNITS) >= 0) {
		return String(this._value);
	} else {
		let fallback = this._colormix ? '' : ((",1" + this._unit));
		if (this._number == 1) {
			return ("var(--u_" + this._unit + fallback + ")");
		} else {
			return ("calc(var(--u_" + this._unit + fallback + ") * " + (this._number) + ")");
			// return String(@value)
		};
	};
};

StyleDimension.prototype.toAlpha = function (){
	if (!(this._unit)) {
		return this._number + '%';
	} else {
		return this.valueOf();
	};
};

function StyleNumber(){ return StyleDimension.apply(this,arguments) };

subclass$(StyleNumber,StyleDimension);



// UTILS

function Util(args){
	this._args = args;
};

// this is how we deal with it now
subclass$(Util,Node);


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
	// node.cache(force: yes, type: 'iter') if cache
	return node;
};

Util.slice = function (obj,a,b){
	var slice = new Identifier("slice");
	return CALL(OP('.',obj,slice),AST.compact([a,b]));
};

Util.iterable = function (obj,cache){
	// return obj if STACK.tsc
	var node = new Util.Iterable([obj]);
	if (cache && !STACK.tsc()) { node.cache({force: true,pool: 'iter'}) };
	return node;
};

Util.counter = function (start,cache){
	// should it not rather be a variable?!?
	var node = new Num(start); // make sure it really is a number
	if (cache) { node.cache({force: true,pool: 'counter'}) };
	return node;
};

Util.array = function (size,cache){
	var node = new Util.Array([size]);
	if (cache) { node.cache({force: true,pool: 'list'}) };
	return node;
};

Util.prototype.name = function (){
	return 'requireDefault$';
};

Util.prototype.js = function (){
	return this.called(this._args,this.option('stdlib'));
};

Util.prototype.called = function (pars,std,name){
	if (std && !STACK.isStdLib()) {
		// in typescript?
		return ("" + (STACK.corelib()[std].c()) + "(" + AST.cary(pars).join(',') + ")");
	} else {
		this.scope__().root().helper(this,this.helper());
		return ("" + (name || this.name()) + "(" + AST.cary(pars).join(',') + ")");
	};
};

var HELPERS = {
	setField: '(target,key,value,o){\n	Object.defineProperty(target,key,{value:value});\n};',
	
	unit: '(value,unit){\n	return value + unit;\n};',
	
	memo: '(hash,slf,cb,scope = globalThis){\n	let sym = Symbol.for(hash)\n	let fn = scope[sym] ||= (cb.memoized=sym,cb)\n	return slf == null ? fn : fn.bind(slf)\n};',
	
	optNegIndex: '(value,index){ return value ? value[value.length + index] : null };',
	negIndex: '(value,index){ return value[value.length + index] };',
	
	extendTag: '(el,cls){\n	Object.defineProperties(el,Object.getOwnPropertyDescriptors(cls.prototype));\n	return el;\n};',
	
	initField: '(target,key,o){\n	Object.defineProperty(target,key,o);\n};',
	
	watcher: '(k,w){\n	return { enumerable:true,\n		set(v){var o=this[k]; (v===o)||(this[k]=v,this[w]({value:v,oldValue:o}));},\n		get(){ return this[k] }\n	};\n};',
	
	decorate: {
		inline: '(decorators,target,key,desc){\n	var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;\n	else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;\n	return c > 3 && r && Object.defineProperty(target, key, r), r;\n};',
		std: 'decorate$'
	},
	
	contains: {
		inline: '(a,b){\n	const sym = Symbol.for("#has");\n	return b && ( b[sym]?.(a) ?? b.includes?.(a) ?? b.has?.(a) ?? false);\n};',
		std: 'has$'
	},
	
	requireDefault: '(obj){\n	return obj && obj.__esModule ? obj : { default: obj };\n};',
	
	virtualSuper: '(target){\n	var up = Object.getPrototypeOf(target);\n	var supers = Object.getOwnPropertyDescriptors(target);\n\n	const map = new WeakMap();\n	const obj = Object.defineProperties(Object.create(up), supers);\n\n	const proxy = {\n		apply: (self, key, ...params) => { return obj[key].apply(self, params) },\n		get: (self, key) => { return Reflect.get(obj, key, self); },\n		set: (self, key, value, receiver) => { return Reflect.set(obj, key, value, self);}\n	}\n\n	return function (s) {\n		return map.get(s) || map.set(s, new Proxy(s, proxy)) && map.get(s);\n	}\n};'
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
		let helper = 'function ' + k + '$__' + (v.inline || v);
		// different helper when they are bundled?
		return new Util.Helper(args).set({name: k + '$__',helper: helper,stdlib: v.std || null});
	};
};

Util.Extend = function Extend(){ return Util.apply(this,arguments) };

subclass$(Util.Extend,Util);
Util.Extend.prototype.helper = function (){
	return 'function extend$__(target,ext){\n	// @ts-ignore\n	const descriptors = Object.getOwnPropertyDescriptors(ext);\n	delete descriptors.constructor;\n	if(target.extend__ instanceof Function){\n		target.extend__(descriptors,ext);\n	} else {\n		// @ts-ignore\n		Object.defineProperties(target,descriptors);\n	}\n	return target;\n};';
};

Util.Extend.prototype.js = function (o){
	return this.called(AST.compact(this._args),'extend$','extend$__');
};

Util.IndexOf = function IndexOf(){ return Util.apply(this,arguments) };

subclass$(Util.IndexOf,Util);
Util.IndexOf.prototype.helper = function (){
	return 'function idx$__(a,b){\n	return (b && b.indexOf) ? b.indexOf(a) : [].indexOf.call(a,b);\n};';
};

Util.IndexOf.prototype.js = function (o){
	return this.called(this._args,'idx$','idx$__');
};


Util.Is = function Is(){ return Util.apply(this,arguments) };

subclass$(Util.Is,Util);
Util.Is.prototype.left = function (){
	return this._args[0];
};

Util.Is.prototype.right = function (){
	return this._args[1];
};

Util.Is.prototype.op = function (){
	return this._args[2];
};

Util.Is.prototype.stdfn = function (){
	return 'is$';
};

Util.Is.prototype.helper = function (){
	return '// @ts-ignore\nfunction is$(a,b){ return a === b || ' + ("b?.[" + this.symbolRef('#matcher') + "]?.(a) || false") + '}';
};

Util.Is.prototype.clone = function (b){
	return new this.constructor(this._args[2] ? [this._args[0],b,this._args[2]] : [this._args[0],b]);
};

Util.Is.prototype.js = function (o){
	return this.called(this._args,this.stdfn(),this.stdfn());
};

Util.In = function In(){ return Util.Is.apply(this,arguments) };

subclass$(Util.In,Util.Is);
Util.In.prototype.stdfn = function (){
	return 'has$';
};

Util.In.prototype.helper = function (){
	return '// @ts-ignore\nfunction has$(a,b){ const sym = Symbol.for("#has"); return b && ( b[sym]?.(a) ?? b.includes?.(a) ?? b.has?.(a) ?? false); }';
};

Util.Isa = function Isa(){ return Util.Is.apply(this,arguments) };

subclass$(Util.Isa,Util.Is);
Util.Isa.prototype.helper = function (){
	return '// @ts-ignore\nfunction isa$(a,b){ return typeof b === "string" ? (typeof a === b) : b[Symbol.hasInstance]?.(a) }';
};

Util.Isa.prototype.js = function (){
	if (this._right instanceof Str) {
		// only need parens if left is caching...
		return ("typeof (" + (this._left.c()) + ")===" + (this._right.c()));
	};
	
	if (String(this.op()) == 'instanceof' || STACK.tsc()) {
		return ("(" + (this._left.c()) + ") instanceof " + (this._right.c()));
	};
	
	return this.called([this._left,this._right],'isa$','isa$');
};

Util.Promisify = function Promisify(){ return Util.apply(this,arguments) };

subclass$(Util.Promisify,Util);
Util.Promisify.prototype.helper = function (){
	// should also check if it is a real promise
	return 'function promise$__(a){\n	if(a instanceof Array){\n		console.warn("await (Array) is deprecated - use await Promise.all(Array)");\n		return Promise.all(a);\n	} else {\n		return (a && a.then ? a : Promise.resolve(a));\n	}\n}';
};

Util.Promisify.prototype.js = function (o){
	this.scope__().root().helper(this,this.helper());
	return ("promise$__(" + this._args.map(function(v) { return v.c(); }).join(',') + ")");
};

Util.Iterable = function Iterable(){ return Util.apply(this,arguments) };

subclass$(Util.Iterable,Util);
Util.Iterable.prototype.helper = function (){
	// now we want to allow null values as well - just return as empty collection
	// should be the same for for own of I guess
	return ("function iter$__(a)\{ let v; return a ? ((v=a.toIterable) ? v.call(a) : a) : a; \};");
};

Util.Iterable.prototype.js = function (o){
	if (this._args[0] instanceof Arr) { return this._args[0].c() }; // or if we know for sure that it is an array
	return this.called(this._args,'iterable$','iter$__');
};

Util.Array = function Array(){ return Util.apply(this,arguments) };

subclass$(Util.Array,Util);
Util.Array.prototype.js = function (o){
	// When this is triggered, we need to add it to the top of file?
	return ("new Array(" + this._args.map(function(v) { return v.c(); }) + ")");
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

// SCOPES

// handles local variables, self etc. Should create references to outer scopes
// when needed etc.

// add class for annotations / registering methods, etc?
// class Interface

// should move the whole context-thingie right into scope
function Scope(node,parent){
	this._nr = STACK.incr('scopes');
	this._node = node;
	this._parent = parent;
	this._vars = new ScopeVariables([]);
	this._entities = new Entities(this);
	this._head = [this._vars];
	this._meta = {};
	this._annotations = [];
	this._closure = this;
	this._virtual = false;
	this._counter = 0;
	this._varmap = {};
	this._ampermap = {};
	this._counters = {};
	this._varpool = [];
	this._mixins = {};
	this._refcounter = 0;
	this._declListeners = [];
	this._level = (parent ? parent._level : (-1)) + 1;
	this.setup();
};


Scope.prototype.node = function(v){ return this._node; }
Scope.prototype.parent = function(v){ return this._parent; }
Scope.prototype.params = function(v){ return this._params; }
Scope.prototype.head = function(v){ return this._head; }
Scope.prototype.p = function (){
	if (STACK._loglevel > 0) {
		console.log.apply(console,arguments);
	};
	return this;
};

Scope.prototype.oid = function (){
	return this._oid || (this._oid = STACK.generateId(''));
};

Scope.prototype.tid = function (){
	return this._tid || (this._tid = STACK.generateId('tag'));
};

Scope.prototype.stack = function (){
	return STACK;
};

Scope.prototype.kind = function (){
	return this._kind || (this._kind = this.constructor.name.replace('Scope','').toLowerCase());
};

Scope.prototype.setParams = function (val){
	this._params = val;
	if (this._head.indexOf(val) == -1) { this._head.push(val) };
	return val;
	return this;
};

Scope.prototype.runtime = function (){
	return this.root().runtime();
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

Scope.prototype.staticsRef = function (){
	return this._staticsRef || (this._staticsRef = this.declare('$statics$',CALL(STACK.corelib().statics$,[this._context])));
};

Scope.prototype.memovar = function (name,init){
	this._memovars || (this._memovars = {});
	let item = this._memovars[name];
	if (!item) {
		item = this._memovars[name] = this.declare(item,init);
		// temporary(null,{reuse: yes},"{name}")
	};
	
	return item;
};

Scope.prototype.mixin = function (name){
	return this._mixins[name] || (this._mixins[name] = new MixinReference(name,this));
};

// def cssMixinFlag name
Scope.prototype.captureVariableDeclarations = function (blk){
	let items = [];
	this._declListeners.push(items);
	blk();
	this._declListeners.pop();
	return items;
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

Scope.prototype.cssid = function (){
	return this._cssid || (this._cssid = ("" + (this.root().sourceId()) + "-" + this.tid()));
};

Scope.prototype.cssns = function (){
	return this._cssns || (this._cssns = ("" + (this.root().sourceId()) + "_" + this.tid()));
};

Scope.prototype.tagCache = function (){
	if (!this._tagCache) {
		var cache = LIT(("" + (this.runtime().getRenderContext) + "()"));
		if (STACK.closure() instanceof IsolatedFunctionScope) {
			cache = LIT('{}');
		};
		
		this._tagCache = this.declare('ϲτ',cache,
		{system: true,
		temporary: true,
		alias: 'ϲτ'});
	};
	return this._tagCache;
};

Scope.prototype.tagTempCache = function (){
	return this._tagTempCache || (this._tagTempCache = this.declare('ϲττ',LIT('{}'),
	{system: true,
	temporary: true,
	alias: 'ϲττ'}));
};
// def context
// 	@context ||= ScopeContext.new(self)

Scope.prototype.context = function (){
	// why do we need to make sure it is referenced?
	if (!this._context) {
		if (this.selfless()) {
			this._context = this._parent.context().fromScope(this);
			// @context.reference(self)
		} else {
			this._context = new ScopeContext(this);
		};
	};
	return this._context;
};

Scope.prototype.isInExtend = function (){
	return this._closure.node().option('extension');
};

Scope.prototype.traverse = function (){
	return this;
};

Scope.prototype.visit = function (){
	if (this._parent) { return this };
	this._parent = STACK.scope(1); // the parent scope
	this._level = STACK._scopes.length - 1;
	
	STACK.addScope(this);
	this.root()._scopes.push(this);
	return this;
};

Scope.prototype.wrap = function (scope){
	this._parent = scope._parent;
	scope._parent = this;
	return this;
};

// called for scopes that are not real scopes in js
// must ensure that the local variables inside of the scopes do not
// collide with variables in outer scopes -- rename if needed
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
		return new (o.varclass || SystemVariable)(this,name,decl,o);
	};
	
	name = AST.sym(name);
	
	// also look at outer scopes if this is not closed?
	var existing = this._varmap.hasOwnProperty(name) && this._varmap[name];
	
	if (existing) {
		if (decl && existing.type() != 'global') {
			decl.error('Cannot redeclare variable');
		};
		// console.log 'redeclaring variable',"{existing} {decl}",existing.type
	};
	
	// FIXME check if existing is required to be unique as well?
	if (existing && !o.unique && existing.type() != 'global') {
		return existing;
	};
	
	let par = o.lookup && this._parent && this._parent.lookup(name);
	
	// var type = o:system ? SystemVariable : Variable
	var item = new (o.varclass || Variable)(this,name,decl,o);
	
	if (par) {
		item._parent = par;
	};
	
	if (!o.system && (!existing || existing.type() == 'global')) {
		this._varmap[name] = item;
	};
	
	if (STACK._state && (STACK._state.variables instanceof Array)) {
		STACK._state.variables.push(item);
	};
	
	if (this._declListeners.length) {
		for (let i = 0, items = iter$(this._declListeners), len = items.length; i < len; i++) {
			items[i].push(item);
		};
	};
	return item;
};

Scope.prototype.annotate = function (obj){
	this._annotations.push(obj);
	return this;
};

// just like register, but we automatically
Scope.prototype.declare = function (name,init,o){
	var declarator_;
	if(init === undefined) init = null;
	if(o === undefined) o = {};
	var variable = (name instanceof Variable) ? name : this.register(name,null,o);
	// TODO create the variabledeclaration here instead?
	// if this is a sysvar we need it to be renameable
	var dec = this._vars.add(variable,init);
	(declarator_ = variable._declarator) || (((variable._declarator = dec,variable),dec));
	return variable;
};

Scope.prototype.reusevar = function (name){
	return this.temporary(null,{reuse: true},name);
};

// what are the differences here? omj
// we only need a temporary thing with defaults -- that is all
// change these values, no?
Scope.prototype.temporary = function (decl,o,name){
	if(o === undefined) o = {};
	if(name === undefined) name = null;
	if (this._systemscope && this._systemscope != this) {
		return this._systemscope.temporary(decl,o,name);
	};
	
	name || (name = o.name);
	o.temporary = true;
	if (name && o.reuse && this._vars[("_temp_" + name)]) {
		return this._vars[("_temp_" + name)];
	};
	
	if (o.pool) {
		for (let i = 0, items = iter$(this._varpool), len = items.length, v; i < len; i++) {
			v = items[i];
			if (v.pool() == o.pool && v._declarator == null) {
				return (v._declarator = decl,v);
			};
		};
	};
	
	var item = new SystemVariable(this,name,decl,o);
	this._varpool.push(item); // It should not be in the pool unless explicitly put there?
	if (!o.nodecl) { this._vars.push(item) }; // WARN variables should not go directly into a declaration-list
	if (name && o.reuse) {
		this._vars[("_temp_" + name)] = item;
	};
	return item;
};

Scope.prototype.lookup = function (name){
	this._lookups || (this._lookups = {});
	var ret = null;
	name = AST.sym(name);
	if (this._varmap.hasOwnProperty(name)) {
		ret = this._varmap[name];
	} else {
		ret = this._parent && this._parent.lookup(name);
		
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
	// should be the same for node and js
	STACK.meta().universal = false;
	return this._imba || (this._imba = (STACK.isNode() ? LIT(("(this && this[" + (this.root().symbolRef('#imba').c()) + "] || globalThis[" + (this.root().symbolRef('#imba').c()) + "])")) : LIT('imba')));
};

Scope.prototype.autodeclare = function (variable){
	return this._vars.add(variable); // only if it does not exist here!!!
};

Scope.prototype.free = function (variable){
	variable.free(); // :owner = null
	// @varpool.push(variable)
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

Scope.prototype.c = function (o){
	var body;
	if(o === undefined) o = {};
	o.expression = false;
	this._node.body()._head = this._head;
	return body = this._node.body().c(o);
};

Scope.prototype.region = function (){
	return this._node.body().region();
};

Scope.prototype.loc = function (){
	return this._node.loc();
};

Scope.prototype.dump = function (){
	var self = this;
	var vars = Object.keys(self._varmap).map(function(k) {
		var v = self._varmap[k];
		// unless v.@declarator isa Scope
		// 	console.log v.name, v.@declarator:constructor:name
		// AST.dump(v)
		return v._references.length ? AST.dump(v) : null;
	});
	
	var desc = {
		nr: self._nr,
		type: self.constructor.name,
		level: (self._level || 0),
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

// RootScope is wrong? Rather TopScope or ProgramScope
function RootScope(){
	RootScope.prototype.__super__.constructor.apply(this,arguments);
	
	this.GLOBAL = this.register('global',this,{type: 'global'});
	this.GLOBAL._c = 'globalThis';
	
	this.REQUIRE = this.register('require',this,{type: 'global'}); // .@c = 'globalThis'
	this.IMPORT = this.register('import',this,{type: 'global'});
	this.MODULE = this.register('module',this,{type: 'global'});
	this.ASSERT = this.register('assert',this,{type: 'global'});
	this.EQ = this.register('eq',this,{type: 'global'});
	
	this.L = this.register('L',this,{type: 'global'});
	
	// register 'imba', self, type: 'global', varclass: GlobalReference
	this.register('window',this,{type: 'global',varclass: WindowReference});
	(this._document = this.register('document',this,{type: 'global',varclass: DocumentReference}),this);
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
	this.register('__realname',this,{type: 'global'})._c = "__filename";
	this.register('__pure__',this,{type: 'global',varclass: PureReference})._c = "/* @__PURE__ */";
	
	this.register('_',this,{type: 'global'});
	
	// preregister global special variables here
	this._requires = {};
	this._warnings = [];
	this._scopes = [];
	this._helpers = [];
	
	this._assets = {};
	this._selfless = true;
	this._implicitAccessors = [];
	this._entities = new RootEntities(this);
	this._object = Obj.wrap({});
	this._head = [this._vars];
	this._symbolRefs = {};
	this._importProxies = {};
	(this._vars._split = true,this._vars);
	
	this._imba = this.register('imba',this,{type: 'global',varclass: ImbaRuntime,path: 'imba'});
	this._runtime = this._imba.proxy();
	this;
};

subclass$(RootScope,Scope);


RootScope.prototype.importProxy = function (name,path,pre){
	if(pre === undefined) pre = ("$" + name + "$");
	return this._importProxies[name] || (this._importProxies[name] = this.register(pre,this,{type: 'global',varclass: ImportProxy,path: path || name}));
};

RootScope.prototype.runtime = function (){
	return this._runtime;
};

RootScope.prototype.use = function (item){
	if (!STACK.tsc()) {
		return this._imba.touch(("use_" + item));
	};
};

RootScope.prototype.sourceId = function (){
	return this._sourceId || (this._sourceId = STACK.sourceId()); // @options:sourcePath and helpers.identifierForPath(@options:sourcePath)
};

RootScope.prototype.cssns = function (){
	return this._cssns || (this._cssns = ("" + this.sourceId() + "_"));
};

// single-file-component options
RootScope.prototype.sfco = function (){
	return this._sfco || (this._sfco = this.declare('sfc$',LIT('{/*$sfc$*/}')));
};

RootScope.prototype.l = function (){
	return this._l || (this._l = this.declare('l$',LIT('null')));
};

RootScope.prototype.context = function (){
	return this._context || (this._context = new RootScopeContext(this));
};

RootScope.prototype.globalRef = function (){
	return this._globalRef || (this._globalRef = LIT('globalThis'));
};

RootScope.prototype.mixinExports = function (){
	if (!this._mixinExports) {
		this._head.push(this._mixinExports = new MixinExports());
	};
	return this._mixinExports;
};

RootScope.prototype.registerAsset = function (path,kind,context,pathToken){
	let key = path + kind;
	
	if (this._assets[key]) {
		return this._assets[key];
	};
	
	// console.log 'registering asset',!!STACK.lastImport
	let insertAt = STACK.lastImport() || this._head;
	
	let asset = this._assets[key] = {
		path: path,
		kind: kind,
		external: true,
		context: context,
		pathToken: pathToken,
		ref: this.register('asset',null,{system: true})
	};
	
	insertAt.push(new AssetReference(asset));
	return asset;
};

RootScope.prototype.lookup = function (name){
	name = AST.sym(name);
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
		// console.log 'adding helper',value
		// @head.unshift(value)
	};
	
	return this;
};

RootScope.prototype.head = function (){
	return this._head;
};

RootScope.prototype.dump = function (){
	var obj = {
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

// not yet used
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
	(declarator_ = variable._declarator) || (((variable._declarator = dec,variable),dec));
	variable._requirePath = path;
	this._requires[name] = variable;
	return variable;
};

RootScope.prototype.imba = function (){
	return this._imba;
};

RootScope.prototype.symbolRef = function (name){
	name = SourceMapper.strip(name);
	
	if (STACK.tsc()) {
		return this._symbolRefs[name] || (this._symbolRefs[name] = new Identifier(name.slice(1) + "_$INTERNAL$_"));
	};
	
	let map = this._symbolRefs;
	let alias = toJSIdentifier(name);
	return map[name] || (map[name] = this.declare(null,LIT(("Symbol.for('" + name + "')")),{type: 'const',system: true,alias: alias,gsym: name}));
};

RootScope.prototype.c = function (o){
	if(o === undefined) o = {};
	o.expression = false;
	
	let body = this.node().body().c(o);
	
	let sheet = STACK._css;
	let pre = new Block([]);
	pre._head = this._head;
	
	pre.add(LIT(sheet.js(this,STACK)));
	
	let out = pre.c(o) + '\n/*body*/\n' + body;
	
	if (len$(this._helpers)) {
		out = AST.cary(this._helpers).join(';\n') + '\n' + out;
	};
	return out;
};

function ModuleScope(){ return Scope.apply(this,arguments) };

subclass$(ModuleScope,Scope);

ModuleScope.prototype.setup = function (){
	return this._selfless = false;
};

ModuleScope.prototype.namepath = function (){
	return this._node.namepath();
};

function ClassScope(){ return Scope.apply(this,arguments) };

subclass$(ClassScope,Scope);

ClassScope.prototype.setup = function (){
	return this._selfless = false;
};

ClassScope.prototype.namepath = function (){
	return this._node.namepath();
};

// called for scopes that are not real scopes in js
// must ensure that the local variables inside of the scopes do not
// collide with variables in outer scopes -- rename if needed
ClassScope.prototype.virtualize = function (){
	// console.log "virtualizing ClassScope"
	var up = this.parent();
	for (let o = this._varmap, v, i = 0, keys = Object.keys(o), l = keys.length, k; i < l; i++){
		k = keys[i];v = o[k];v.resolve(up,true); // force new resolve
	};
	return this;
};

ClassScope.prototype.prototype = function (){
	return this._prototype || (this._prototype = new ValueNode(OP('.',this.context(),'prototype')));
};

function TagScope(){ return ClassScope.apply(this,arguments) };

subclass$(TagScope,ClassScope);



function ClosureScope(){ return Scope.apply(this,arguments) };

subclass$(ClosureScope,Scope);



function FunctionScope(){ return Scope.apply(this,arguments) };

subclass$(FunctionScope,Scope);



function IsolatedFunctionScope(){ return FunctionScope.apply(this,arguments) };

subclass$(IsolatedFunctionScope,FunctionScope);

IsolatedFunctionScope.prototype.lookup = function (name){
	this._lookups || (this._lookups = {});
	var ret = null;
	name = AST.sym(name);
	if (this._varmap.hasOwnProperty(name)) {
		ret = this._varmap[name];
	} else {
		ret = this.parent() && this.parent().lookup(name);
		
		// only shadow variables inside the same closure?
		if (ret && ret.closure() == this.parent().closure()) {
			this._leaks || (this._leaks = new Map());
			this._nonlocals || (this._nonlocals = {});
			this._nonlocals[name] = ret;
			
			// FIXME in the context of functional components,
			// self is to be considered a leaky variable
			// since it can change between renders
			
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

MethodScope.prototype.setup = function (){
	return this._selfless = false;
};

MethodScope.prototype.isInExtend = function (){
	return this.parent().isInExtend();
};

MethodScope.prototype.visit = function (){
	MethodScope.prototype.__super__.visit.apply(this,arguments);
	
	if (STACK.tsc() && this.isInExtend()) {
		let cls = this.parent().closure().node();
		let clsname = cls._className;
		if (clsname) {
			let iface = null;
			// Identifier should not have this much responsibility - it should be wrapped in an VarOrAccess?
			if ((clsname instanceof Identifier) && !clsname._variable) {
				iface = GLOBAL_INTERFACES[clsname._value];
			};
			
			let gen = clsname.option('generics');
			let suptyp = clsname.c();
			
			if (gen) {
				suptyp += String(gen);
			};
			
			let lit = this.node().option('static') ? LIT(("" + (cls._className.c()))) : (((iface && iface.thistype) ? LIT(("null as any as " + (iface.thistype))) : LIT(("this as (this & " + suptyp + ")"))));
			
			let ref = this.context().reference(lit);
			this.context()._useReference = true;
			ref.c();
		};
	};
	return this;
};

function FieldScope(){ return Scope.apply(this,arguments) };

subclass$(FieldScope,Scope);

FieldScope.prototype.setup = function (){
	return this._selfless = false;
};

FieldScope.prototype.mergeScopeInto = function (other){
	for (let o = this._varmap, v, i = 0, keys = Object.keys(o), l = keys.length, k; i < l; i++){
		k = keys[i];v = o[k];if (k == 'self') { continue; };
		v.resolve(other,true);
		other.declare(v);
	};
	
	if (this._context && this._context._reference) {
		this._context._reference = other.context().reference();
	};
	return true;
};

function LambdaScope(){ return Scope.apply(this,arguments) };

subclass$(LambdaScope,Scope);

LambdaScope.prototype.context = function (){
	// why do we need to make sure it is referenced?
	if (!this._context) {
		this._context = this.parent().context().fromScope(this);
	};
	return this._context;
};

function FlowScope(){ return Scope.apply(this,arguments) };

subclass$(FlowScope,Scope);

FlowScope.prototype.params = function (){
	if (this._parent) { return this._parent.params() };
};

FlowScope.prototype.register = function (name,decl,o){
	var found;
	if(decl === undefined) decl = null;
	if(o === undefined) o = {};
	if (o.type != 'let' && o.type != 'const' && (this.closure() != this)) {
		if (found = this.lookup(name)) {
			if (found.type() == 'let') {
				// console.log "{name} already exists as a block-variable {decl}"
				if (decl) { decl.warn("Variable already exists in block") };
			};
		};
		
		return this.closure().register(name,decl,o);
	} else {
		return FlowScope.prototype.__super__.register.call(this,name,decl,o);
	};
};

// FIXME should override temporary as well

FlowScope.prototype.autodeclare = function (variable){
	// need to be unique for this
	return this.parent().autodeclare(variable);
};

FlowScope.prototype.closure = function (){
	return this._parent.closure(); // this is important?
};

FlowScope.prototype.context = function (){
	return this._context || (this._context = this.parent().context());
};

FlowScope.prototype.closeScope = function (){
	// FIXME
	if (this._context) { this._context.reference() };
	return this;
};

FlowScope.prototype.temporary = function (refnode,o,name){
	if(o === undefined) o = {};
	if(name === undefined) name = null;
	return (this._systemscope || this.parent()).temporary(refnode,o,name);
};

function CatchScope(){ return FlowScope.apply(this,arguments) };

subclass$(CatchScope,FlowScope);



function WhileScope(){ return FlowScope.apply(this,arguments) };

subclass$(WhileScope,FlowScope);

WhileScope.prototype.autodeclare = function (variable){
	return this._vars.add(variable);
};

function ForScope(){ return FlowScope.apply(this,arguments) };

subclass$(ForScope,FlowScope);

ForScope.prototype.autodeclare = function (variable){
	return this._vars.add(variable);
};

function IfScope(){ return FlowScope.apply(this,arguments) };

subclass$(IfScope,FlowScope);



function BlockScope(){ return FlowScope.apply(this,arguments) };

subclass$(BlockScope,FlowScope);

BlockScope.prototype.region = function (){
	return this.node().region();
};

function TagBodyScope(){ return FlowScope.apply(this,arguments) };

subclass$(TagBodyScope,FlowScope);



// lives in scope -- really a node???
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
	this._datatype = o && o.datatype;
	this._resolved = false;
	this._options = o || {};
	this._type = o && o.type || 'var'; // what about let here=
	this._export = false;
	this._references = []; // only needed when profiling
	this._assignments = [];
	this;
};

subclass$(Variable,Node);

Variable.prototype.scope = function(v){ return this._scope; }
Variable.prototype.name = function(v){ return this._name; }
Variable.prototype.setName = function(v){ this._name = v; return this; };
Variable.prototype.alias = function(v){ return this._alias; }
Variable.prototype.type = function(v){ return this._type; }
Variable.prototype.references = function(v){ return this._references; }
Variable.prototype.value = function(v){ return this._value; }
Variable.prototype.setValue = function(v){ this._value = v; return this; };
Variable.prototype.datatype = function(v){ return this._datatype; }
Variable.prototype.setDatatype = function(v){ this._datatype = v; return this; };

Variable.prototype.pool = function (){
	return null;
};

Object.defineProperty(Variable.prototype,'_variable',{get: function(){
	return this;
}, configurable: true});

Variable.prototype.isImported = function (){
	return this._type == 'imported';
};

Variable.prototype.importPath = function (){
	return (this.isImported() && this._declarator) ? this._declarator.sourcePath() : null;
};

Object.defineProperty(Variable.prototype,'is_exported',{get: function(){
	return this._declarator ? this._declarator.option('export') : false;
}, configurable: true});

Object.defineProperty(Variable.prototype,'is_import',{get: function(){
	return this.isImported();
}, configurable: true});

Variable.prototype.typedAlias = function (){
	return this._typedAlias || (this._typedAlias = new Variable(this._scope,this._name + '$TYPED$',this._declarator,this._options));
};

Variable.prototype.isGlobal = function (name){
	return this._type == 'global' && (!name || this._name == name);
};

Variable.prototype.closure = function (){
	return this._scope.closure();
};

Variable.prototype.vartype = function (){
	return this._vartype || (this._declarator && this._declarator.datatype && this._declarator.datatype());
};

// Here we can collect lots of type-info about variables
// and show warnings / give advice if variables are ambiguous etc
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

Variable.prototype.parents = function (){
	let parents = [];
	let scope = this.closure().parent();
	let res = this;
	while (scope && res && parents.length < 5){
		if (res = scope.lookup(this._name)) {
			parents.unshift(res);
			let newscope = res.scope().parent();
			if (scope == newscope) {
				break;
			};
			scope = newscope;
		};
	};
	
	return parents;
};

Variable.prototype.resolve = function (scope,force){
	if(scope === undefined) scope = this._scope;
	if(force === undefined) force = false;
	if (this._resolved && !force) { return this };
	
	this._resolved = true;
	var closure = this._scope.closure();
	var item = this._shadowing || scope.lookup(this._name);
	
	// console.log "resolving var {@name} {scope}",scope == @closure,@virtual
	
	// if this is a let-definition inside a virtual scope we do need
	if (this._scope != closure && this._type == 'let' && this._virtual) { // or if it is a system-variable
		item = closure.lookup(this._name);
		scope = closure;
	};
	
	if (item == this) {
		scope._varmap[this._name] = this;
		return this;
	} else if (item) {
		// possibly redefine this inside, use it only in this scope
		// if the item is defined in an outer scope - we reserve the
		if (item.scope() != scope && (this._options.let || this._type == 'let')) {
			scope._varmap[this._name] = this;
			// if we allow native let we dont need to rewrite scope?
			if ((!this._virtual && !this._shadowing)) { return this };
		};
		
		// different rules for different variables?
		if (this._options.proxy) {
			true;
		} else {
			var i = 0;
			var orig = this._name;
			// it is the closure that we should use
			while (scope.lookup(this._name)){
				this._name = ("" + orig + (i += 1));
			};
		};
	};
	
	scope._varmap[this._name] = this;
	closure._varmap[this._name] = this;
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

Variable.prototype.proxy = function (par,index){
	this._proxy = [par,index];
	return this;
};

Variable.prototype.refcount = function (){
	return this._references.length;
};

Variable.prototype.c = function (params){
	
	if (params) {
		if (params.as == 'declaration' && STACK.tsc()) {
			if (this._datatype) {
				return this.c({}) + ":" + M(this._datatype);
			};
		};
		
		if (params.as == 'field') {
			return "[" + this.c({}) + "]";
		};
	};
	
	if (this._c) { return this._c };
	
	if (this._typedAlias) {
		this._typedAlias.c(params);
	};
	// options - proxy??
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
		var v = (this._alias || this._name);
		this._c = (typeof v == 'string') ? helpers.toValidIdentifier(v) : v.c({as: 'variable'});
		// allow certain reserved words
		// should warn on others though (!!!)
		// if @c == 'new'
		// 	@c = '_new'
		// 	# should happen at earlier stage to
		// 	# get around naming conventions
		if (RESERVED_REGEX.test(this._c)) { this._c = ("" + this.c() + "$") }; // @c.match(/^(default)$/)
		// @c = @c + '/*' + @ref + '*/'
	};
	return this._c;
};

Variable.prototype.js = function (){
	return this.c();
};

// variables should probably inherit from node(!)
Variable.prototype.consume = function (node){
	return this;
};

// this should only generate the accessors - not dael with references
Variable.prototype.accessor = function (ref){
	var node = new LocalVarAccess(".",null,this);
	// this is just wrong .. should not be a regular accessor
	// @references.push([ref,el]) if ref # weird temp format
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
	this._scope.autodeclare(this);
	this._declared = true;
	return this;
};

Variable.prototype.predeclared = function (){
	this._declared = true;
	return this;
};

Variable.prototype.toString = function (){
	return String(this._name);
};

Variable.prototype.dump = function (typ){
	var name = this._name;
	if (name[0].match(/[A-Z]/)) { return null };
	
	return {
		type: this._type,
		name: name,
		refs: AST.dump(this._references,typ)
	};
};

Variable.prototype.via = function (node){
	return new ValueReferenceNode(this,node);
};

function SystemVariable(){ return Variable.apply(this,arguments) };

subclass$(SystemVariable,Variable);

SystemVariable.prototype.pool = function (){
	return this._options.pool;
};

// weird name for this
SystemVariable.prototype.predeclared = function (){
	this.scope()._vars.remove(this);
	return this;
};

SystemVariable.prototype.resolve = function (){
	if (this._resolved) { return this };
	this._resolved = true;
	let o = this._options;
	
	if (o.gsym) {
		this._name = ("" + o.gsym.replace(/\#/g,'$') + "$");
		return this;
	};
	
	let ns = o.ns || '';
	
	let sysnr = (STACK.tsc() || o.safe) ? this._scope.incr('sysvar' + ns) : STACK.incr('sysvar' + ns);
	this._name = ("" + ns + "$" + sysnr);
	return this;
	
	// unless @name
	// adds a very random initial name
	// the auto-magical goes last, or at least, possibly reuse other names
	// "${Math.floor(Math.random * 1000)}"
	o = this._options;
	
	var alias = o.alias || this._name;
	var typ = o.pool;
	var names = [].concat(o.names);
	var alt = null;
	var node = null;
	
	this._name = null;
	
	let name = alias || InternalPrefixes.ANY;
	
	if ((/\d/).test(name[0])) {
		
		name = ("_" + name);
	};
	
	if ((/\d$/).test(name)) {
		name = name + InternalPrefixes.SEP;
	};
	
	let nr = STACK.incr(name);
	if (nr == 1) { nr = '' };
	// if sysvar starts with a greek character (used for sysvars) - dont add dollar-sign
	if (ReservedIdentifierRegex.test(name)) {
		this._name = ("" + name + nr);
	} else {
		this._name = ("" + name + "φ" + nr);
	};
	// @name = helpers.isSystemIdentifier(name) ? "{name}{nr}" : "{name}φ{nr}"
	// console.log "trying to set name??",name[0],name,@name
	return this;
};

SystemVariable.prototype.name = function (){
	this.resolve();
	return this._name;
};

function ShadowedVariable(){ return Variable.apply(this,arguments) };

subclass$(ShadowedVariable,Variable);


function GlobalReference(){ return Variable.apply(this,arguments) };

subclass$(GlobalReference,Variable);


function PureReference(){ return Variable.apply(this,arguments) };

subclass$(PureReference,Variable);



function ZonedVariable(){ return GlobalReference.apply(this,arguments) };

subclass$(ZonedVariable,GlobalReference);

ZonedVariable.prototype.forScope = function (scope){
	return new ZonedVariableAccess(this,scope);
};

ZonedVariable.prototype.c = function (){
	return ("" + (this._name));
};

function DocumentReference(){ return ZonedVariable.apply(this,arguments) };

subclass$(DocumentReference,ZonedVariable);

DocumentReference.prototype.forScope = function (scope){
	return this;
};

DocumentReference.prototype.c = function (){
	if (STACK.isNode()) {
		return ("" + (this.runtime().get_document) + "()");
	} else {
		return "globalThis.document";
	};
};

function WindowReference(){ return GlobalReference.apply(this,arguments) };

subclass$(WindowReference,GlobalReference);

WindowReference.prototype.c = function (){
	if (STACK.isNode()) {
		return ("" + (this.runtime().get_window) + "()");
	} else {
		return "window";
	};
};

function ZonedVariableAccess(variable,scope){
	this._variable = variable;
	this._scope = scope;
};

subclass$(ZonedVariableAccess,Node);

ZonedVariableAccess.prototype.c = function (){
	let name = this._variable._name;
	if (STACK.isNode()) {
		STACK.use(("" + name));
		return ("" + (this.runtime().zone) + ".get('" + name + "'," + (this._scope.context().c()) + ")");
	} else {
		// what if it is redefined somewhere?
		return ("" + name);
	};
};

function ImportProxy(){
	var self = this;
	ImportProxy.prototype.__super__.constructor.apply(self,arguments);
	self._path = self._options.path;
	self._exports = {};
	self._touched = {};
	self._head = LIT("import ");
	self._head.c = self.head.bind(self);
	self.scope()._head.unshift(self._head);
	var getter = function(t,p,r) { return self.access(p); };
	self._proxy_ = new Proxy(self,{get: getter});
};

subclass$(ImportProxy,Variable);

ImportProxy.prototype.proxy = function (){
	return this._proxy_;
};

ImportProxy.prototype.touch = function (key){
	if (!this._touched[key]) {
		this._touched[key] = this.access(key);
	};
	return this;
};

ImportProxy.prototype.head = function (){
	// for own key,value
	var self = this;
	let keys = Object.keys(self._exports);
	let touches = Object.values(self._touched);
	let js = [];
	let path = self._path;
	
	if (path == 'imba') {
		path = STACK.imbaPath() || 'imba';
	};
	
	let pathjs = ("'" + path + "'");
	
	if (self._importAll) {
		js.push(("import * as " + (self._name) + " from " + pathjs + ";"));
	};
	
	if (keys.length > 0) {
		let out = keys.map(function(a) {
			let name = self._exports[a].c();
			return (name == a) ? a : (("" + a + " as " + name));
		}).join(", ");
		
		js.push(("import \{" + out + "\} from " + pathjs + ";"));
	};
	
	if (touches.length) {
		js.push(("(" + touches.map(function(_0) { return _0.c() + "()"; }).join(",") + ");"));
	};
	
	return js.length ? js.join('\n') : '';
};

ImportProxy.prototype.access = function (key,ctx){
	if(ctx === undefined) ctx = null;
	if (this._globalName) {
		return LIT(("" + M(this._globalName,ctx) + "." + C(key)));
	};
	let raw = C(key,{mark: false});
	
	// what if this 
	// TODO what if there are collisions?
	return this._exports[raw] || (this._exports[raw] = new ImportProxyAccess(this._name ? (("" + (this._name) + "_" + raw)) : raw));
};

ImportProxy.prototype.c = function (){
	if (!this._importAll) {
		this._importAll = true;
		// console.log "import all",STACK.current
		// STACK.current.warn("Referencing imba directly disables efficient tree-shaking")
	};
	return ImportProxy.prototype.__super__.c.apply(this,arguments);
};

function ImbaRuntime(){ return ImportProxy.apply(this,arguments) };

subclass$(ImbaRuntime,ImportProxy);

ImbaRuntime.prototype.configure = function (options){
	if (options.runtime == 'global' || STACK.tsc()) {
		this._globalName = 'imba';
	} else if (options.runtime) {
		(this._path = options.runtime,this);
	};
	return this;
};

ImbaRuntime.prototype.head = function (){
	if (STACK.tsc()) { return '' };
	return ImbaRuntime.prototype.__super__.head.apply(this,arguments);
};

ImbaRuntime.prototype.c = function (){
	if (!this._importAll) {
		this._importAll = true;
		// console.log "import all",STACK.current
		STACK.current().warn("Referencing imba directly disables efficient tree-shaking");
	};
	return this._c = "imba";
};

// def access key
// 	# if @globalName
// 	let raw = C(key,mark: false)
// 	@exports[raw] ||= LIT("{@name}_{raw}")
;

function ScopeContext(scope,value){
	this._scope = scope;
	this._value = value;
	this._reference = null;
	this;
};

subclass$(ScopeContext,Node);

ScopeContext.prototype.scope = function(v){ return this._scope; }
ScopeContext.prototype.value = function(v){ return this._value; }
ScopeContext.prototype.setValue = function(v){ this._value = v; return this; };
ScopeContext.prototype.namepath = function (){
	return this._scope.namepath();
};

// instead of all these references we should probably
// just register when it is accessed / looked up from
// a deeper function-scope, and when it is, we should
// register the variable in scope, and then start to
// use that for further references. Might clean things
// up for the cases where we have yet to decide the
// name of the variable etc?

ScopeContext.prototype.reference = function (thisValue){
	// if we are in  constructor we do want to declare it after super
	return this._reference || (this._reference = this._scope.lookup('self') || this._scope.declare("self",(thisValue == undefined) ? new This() : thisValue)); // {@scope.@level}_
};

ScopeContext.prototype.fromScope = function (other){
	return new IndirectScopeContext(other,this);
};

ScopeContext.prototype.isConstant = function (){
	return true;
};

ScopeContext.prototype.c = function (){
	if (this._useReference && this._reference) { return this._reference.c() };
	var val = this._value; // || @reference
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

IndirectScopeContext.prototype.reference = function (){
	return this._reference; // parent.reference
};

IndirectScopeContext.prototype.c = function (){
	return this._reference.c();
};

IndirectScopeContext.prototype.isGlobalContext = function (){
	return this._parent.isGlobalContext();
};

function RootScopeContext(){ return ScopeContext.apply(this,arguments) };

subclass$(RootScopeContext,ScopeContext);

RootScopeContext.prototype.reference = function (){
	// should be a
	return this._reference || (this._reference = this.scope().lookup('global')); // declare("self",scope.object, type: 'global')
};

RootScopeContext.prototype.c = function (o){
	// @reference ||= scope.declare("self",scope.object, type: 'global')
	// return "" if o and o:explicit
	return "globalThis";
	var val = this.reference(); // @value || @reference
	return (val && val != this) ? val.c() : "this";
	// should be the other way around, no?
	// o and o:explicit ? super : ""
};

RootScopeContext.prototype.isGlobalContext = function (){
	return true;
};

function Super(keyword,member){
	this._keyword = keyword;
	this._member = member;
	Super.prototype.__super__.constructor.apply(this,arguments);
};

subclass$(Super,Node);


Super.prototype.visit = function (){
	var m;
	this._method = STACK.method();
	this._up = STACK.parent();
	if (m = STACK.method()) {
		m.set({supr: {node: STACK.blockpart(),block: STACK.block(),real: this}});
		m.set({injectInitAfter: STACK.blockpart()});
	};
	
	if (this._method) { // and @method.option('inExtension')
		this._class = STACK.up(ClassDeclaration);
		
		if (this._class && !this._method.isConstructor()) {
			this._class.set({calledSuper: true});
		};
	};
	
	if (this._args) { this._args.traverse() };
	return this;
};

Super.prototype.startLoc = function (){
	return this._keyword && this._keyword.startLoc();
};

Super.prototype.endLoc = function (){
	return this._keyword && this._keyword.endLoc();
};

Super.callOp = function (name,params){
	let op = OP('.',LIT('super'),name);
	return CALL(op,params || [LIT('...arguments')]);
};

Super.prototype.c = function (){
	let m = this._method;
	let up = this._up;
	let sup = LIT('super');
	let op;
	let top = this.option('top');
	let virtual = m && m.option('inExtension');
	let args = this._args;
	
	// need to know if our method is in the initial declaration
	if (virtual && this._class) {
		sup = CALL(STACK.corelib().sup$,[this.slf(),this._class.refSym()]);
		// sup = CALL(@class.virtualSuper,[slf])
	};
	
	// when super is written all by itself - it means to do the default action
	if (!((up instanceof Access) || (up instanceof Call))) {
		if (m && m.isConstructor() && !(this._member)) {
			
			if (STACK.tsc() && this._class && !this._class._superclass) {
				return args ? (("[" + (args.c()) + "]")) : "";
			};
			
			let target = this.option('target') || LIT('super');
			let fallbackArgs = this.option('args') || [LIT('...arguments')];
			return M(CALL(target,args || fallbackArgs).c(),this._keyword);
		} else if (this._member) {
			op = OP('.',sup,this._member);
		} else if (m) {
			op = OP('.',sup,m.name());
			if (m.isSetter()) {
				op = OP('=',op,m.params().at(0));
			} else if (!m.isGetter()) {
				args || (args = [LIT('...arguments')]);
			};
		};
		
		if (args) {
			op = CALL(op,args);
		};
		
		return op ? ((M(op.c({mark: false}),this._keyword))) : '/**/';
	};
	
	if (this._member) {
		return OP('.',sup,this._member).c();
	};
	
	if ((up instanceof Call) && m && !m.isConstructor()) {
		return OP('.',sup,m.name()).c();
	};
	
	return "super";
};

// constants

var BR0 = new Newline('\n');
var BR = new Newline('\n');
var BR2 = new Newline('\n\n');
var SELF = new Self();
var THIS = LIT('this');
var PROTO = LIT('this.prototype');
// export var SUPER = Super.new

var TRUE = new True('true');
var FALSE = new False('false');
var UNDEFINED = new Undefined();
var NIL = new Nil();

var ARGUMENTS = new ArgsReference('arguments');
var EMPTY = '';
var NULL = 'null';

var RESERVED = ['default','native','enum','with'];
var RESERVED_REGEX = /^(default|native|enum|with|new|char)$/;

export { ARGUMENTS, AST, Access, AmperFunc, AmperRef, AmperWalker, ArgList, ArgsReference, Argvar, Arr, AssertionNode, AssetReference, Assign, AssignList, AsyncFunc, Await, BR, BR0, BR2, BangCall, Begin, Block, BlockParam, BlockScope, Bool, BreakStatement, Call, Catch, CatchScope, ClassAttribute, ClassBody, ClassDeclaration, ClassField, ClassProperty, ClassRelation, ClassScope, ClosedFunc, ClosureScope, Code, CodeBlock, Comment, ComparisonOp, CompoundAssign, ConditionalAssign, Const, ContinueStatement, ControlFlow, ControlFlowStatement, DECLARE, DebuggerStatement, Decorator, DecoratorIdentifier, Delete, Descriptor, DescriptorPart, DoPlaceholder, DocumentReference, EMPTY, ESMDeclaration, ESMSpecifier, ESMSpecifierList, EnvFlag, Export, ExportAllDeclaration, ExportAllSpecifier, ExportDeclaration, ExportNamedDeclaration, ExportSpecifier, ExpressionBlock, ExpressionList, ExpressionNode, ExpressionWithUnit, ExtendDeclaration, ExternDeclaration, F, FALSE, False, FieldScope, Finally, FlowScope, For, ForIn, ForOf, ForScope, Func, FunctionScope, GLOBAL, Generics, GlobalReference, GreedyReturn, Identifier, IdentifierExpression, If, IfScope, IifeFunc, ImbaRuntime, ImplicitAccess, ImplicitReturn, ImportDeclaration, ImportDefaultSpecifier, ImportNamespaceSpecifier, ImportProxy, ImportProxyAccess, ImportSpecifier, ImportTypeDeclaration, In, Indentation, Index, IndexAccess, IndirectScopeContext, InstanceOf, Instantiation, InterpolatedIdentifier, InterpolatedString, InterpolatedSymbolIdentifier, Interpolation, IsolatedFunc, IsolatedFunctionScope, Ivar, IvarAccess, Lambda, LambdaScope, ListNode, Literal, LocalVarAccess, Loop, LoopFlowStatement, Meta, MethodDeclaration, MethodScope, MixinExports, MixinIdentifier, MixinReference, ModuleScope, NIL, NODES, NULL, NamedParam, New, Newline, Nil, Node, Num, NumWithUnit, NumberLike, OP, Obj, ObjAttr, ObjRestAttr, Op, OptionalParam, PROTO, Param, ParamList, Parens, Private, PropertyAccess, PureExpression, PureReference, PushAssign, RESERVED, RESERVED_REGEX, Range, RawScript, RegExp, Require, RequiredParam, RescueFunc, RestParam, Return, Root, RootScope, RootScopeContext, SELF, SETTYPE, SPLAT, STACK, Scope, ScopeContext, ScopeVariables, Selector, SelectorPart, Self, ShadowedVariable, Splat, Stack, Statement, Str, StyleBody, StyleColor, StyleColorMix, StyleDeclaration, StyleDimension, StyleExpression, StyleExpressions, StyleFunction, StyleIdentifier, StyleInterpolationExpression, StyleNode, StyleNumber, StyleOperation, StyleParens, StyleProperty, StylePropertyIdentifier, StylePropertyModifier, StyleRuleSet, StyleSelector, StyleString, StyleTerm, StyleURL, StyleVar, Super, Switch, SwitchCase, Symbol, SymbolIdentifier, SystemVariable, THIS, TPL, TRUE, Tag, TagArgList, TagAttr, TagAttrValue, TagBody, TagBodyScope, TagContent, TagData, TagDeclaration, TagDynamicArg, TagFlag, TagFragment, TagFragmentFunc, TagHandler, TagHandlerCallback, TagHandlerSpecialArg, TagId, TagIdRef, TagIndexedFragment, TagKeyedFragment, TagLoopFragment, TagModifier, TagModifiers, TagPart, TagPushAssign, TagScope, TagSep, TagSlotProxy, TagStyleAttr, TagSwitchFragment, TagTextContent, TagTypeIdentifier, TagWrapper, TaggedTemplate, TemplateString, Terminator, This, Throw, True, Try, TypeAnnotation, TypeOf, UNDEFINED, UnaryOp, Undefined, Util, ValueNode, ValueReferenceNode, VarAccess, VarDeclList, VarDeclaration, VarName, VarOrAccess, VarReference, Variable, VariableDeclarator, Walker, While, WhileScope, WindowReference, Yield, ZonedVariable, ZonedVariableAccess, parseError };
