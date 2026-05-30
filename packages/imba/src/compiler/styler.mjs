function iter$__(a){ let v; return a ? ((v=a.toIterable) ? v.call(a) : a) : a; };;
// @ts-ignore
function isa$(a,b){ return typeof b === "string" ? (typeof a === b) : b[Symbol.hasInstance]?.(a) };
// @ts-ignore
function is$(a,b){ return a === b || b?.[$matcher$]?.(a) || false};
function negIndex$__(value,index){ return value[value.length + index] };
import {register$} from 'imba/runtime';
var $1;
const $lcha$ = Symbol.for('#lcha'), $matcher$ = Symbol.for('#matcher'), $stack$ = Symbol.for('#stack'), $parts$ = Symbol.for('#parts'), $apply$ = Symbol.for('#apply'), $register$ = Symbol.for('#register'), $string$ = Symbol.for('#string'), $media$ = Symbol.for('#media'), $rules$ = Symbol.for('#rules');

/*body*/
// imba$stdlib=1
// var conv = require('../../vendor/colors')
import * as selparser from './selparse.mjs';
import {conv} from '../../vendor/colors.mjs';
import {colord,toLchArray} from './colord.mjs';
import {fonts,colors,variants,named_colors} from './theme.mjs';
import * as theme from './theme.mjs';

const extensions = {};
let ThemeInstance = null;
const ThemeCache = new WeakMap;

// {string: "hsla(0,0,0,var(--alpha,1))",h:0,s:0,l:0}
// {string: "hsla(0,100%,100%,var(--alpha,1))",h:0,s:0,l:100}

// export const properties =

export const layouts = {
	
	vflex: function(o) {
		o.display = 'flex';
		return o.fld = 'column';
	},
	
	hflex: function(o) {
		o.display = 'flex';
		return o.fld = 'row';
	},
	
	box: function(o) {
		o.display = 'flex';
		o.ai = 'center';
		return o.jc = 'center';
	},
	
	vbox: function(o) {
		o.display = 'flex';
		o.fld = 'column';
		o.ai = 'center';
		return o.jc = 'center';
	},
	
	hbox: function(o) {
		o.display = 'flex';
		o.fld = 'row';
		o.ai = 'center';
		return o.jc = 'center';
	},
	
	lbox: function(o) {
		o.display = 'flex';
		o.fld = 'row';
		o.ai = 'center';
		return o.jc = 'flex-start';
	},
	
	rbox: function(o) {
		o.display = 'flex';
		o.fld = 'row';
		o.ai = 'center';
		return o.jc = 'flex-end';
	},
	
	tbox: function(o) {
		o.display = 'flex';
		o.fld = 'column';
		o.ai = 'center';
		return o.jc = 'flex-start';
	},
	
	bbox: function(o) {
		o.display = 'flex';
		o.fld = 'column';
		o.ai = 'center';
		return o.jc = 'flex-end';
	},
	
	hgrid: function(o) {
		o.display = 'grid';
		o.gaf = 'column';
		return o.gac = '1fr';
	},
	
	vgrid: function(o) {
		o.display = 'grid';
		return o.gaf = 'row';
	}
};

$1 = 0; for (let dir of iter$__('vh')){
	let row = $1++;
	for (let va of iter$__('tcbs')){
		for (let ha of iter$__('lcrs')){
			let vm = {
				t: 'flex-start',
				b: 'flex-end',
				c: 'center',
				s: row ? 'stretch' : 'space-between'
			};
			
			let hm = {
				l: 'flex-start',
				r: 'flex-end',
				c: 'center',
				s: row ? 'space-between' : 'stretch'
			};
			
			let name = ("" + dir + va + ha);
			let combo = {
				display: 'flex',
				fld: row ? 'row' : 'column',
				jc: row ? hm[ha] : vm[va],
				ai: row ? vm[va] : hm[ha],
				ac: row ? vm[va] : hm[ha]
			};
			
			layouts[name] = function(o) {
				Object.assign(o,combo);
				return o;
			};
			
			// if dir == 'v'
		};
	};
};

export const validTypes = {
	ease: 'linear|ease|ease-in|ease-out|ease-in-out|step-start|step-end|stepsƒ|cubic-bezierƒ'
};

for (let $2 = 0, $3 = Object.keys(validTypes), $7 = $3.length, k, v; $2 < $7; $2++){
	k = $3[$2];v = validTypes[k];let o = {};
	for (let $4 = 0, $5 = iter$__(v.split('|')), $6 = $5.length; $4 < $6; $4++) {
		let item = $5[$4];
		o[item] = 1;
	};
	validTypes[k] = o;
};

export const aliases = {
	
	c: 'color',
	d: 'display',
	pos: 'position',
	
	// padding
	p: 'padding',
	pl: 'padding-left',
	pr: 'padding-right',
	pt: 'padding-top',
	pb: 'padding-bottom',
	px: 'padding-x',
	py: 'padding-y',
	
	// margins
	m: 'margin',
	ml: 'margin-left',
	mr: 'margin-right',
	mt: 'margin-top',
	mb: 'margin-bottom',
	mx: 'margin-x',
	my: 'margin-y',
	
	// add scroll snap shorthands?
	
	w: 'width',
	h: 'height',
	t: 'top',
	b: 'bottom',
	l: 'left',
	r: 'right',
	s: 'size',
	mih: 'min-height',
	mah: 'max-height',
	miw: 'min-width',
	maw: 'max-width',
	// size: ['width','height']
	
	// justify
	ji: 'justify-items',
	jc: 'justify-content',
	js: 'justify-self',
	j: ['justify-content','justify-items'],// Deprecate?
	
	// align
	ai: 'align-items',
	ac: 'align-content',
	as: 'align-self',
	a: ['align-content','align-items'],// Deprecate?
	
	// justify & align
	// To fit better with the spec - this ought to be
	jai: 'place-items',
	jac: 'place-content',
	jas: 'place-self',
	// ja: ['place-items','place-content']
	ja: 'justify-align',
	
	// consider using these instead
	// pi: 'place-items'
	// pc: 'place-content'
	// ps: 'place-self'
	// pa: 'place-all'
	
	// flex
	fl: 'flex',
	flf: 'flex-flow',
	fld: 'flex-direction',
	flb: 'flex-basis',
	flg: 'flex-grow',
	fls: 'flex-shrink',
	flw: 'flex-wrap',
	
	// fonts
	ff: 'font-family',
	fs: 'font-size',
	fw: 'font-weight',
	ts: 'text-shadow',// DEPCRATED - use for font-style instead?
	txs: 'text-shadow',
	
	// text-decoration
	td: 'text-decoration',
	tdl: 'text-decoration-line',
	tdc: 'text-decoration-color',
	tds: 'text-decoration-style',
	tdt: 'text-decoration-thickness',
	tdsi: 'text-decoration-skip-ink',
	tuo: 'text-underline-offset',
	
	// text-emphasis
	te: 'text-emphasis',
	tec: 'text-emphasis-color',
	tes: 'text-emphasis-style',
	tep: 'text-emphasis-position',
	tet: 'text-emphasis-thickness',
	
	// text
	tt: 'text-transform',
	ta: 'text-align',
	va: 'vertical-align',
	ls: 'letter-spacing',
	lh: 'line-height',
	
	// border
	bd: 'border',
	bdr: 'border-right',
	bdl: 'border-left',
	bdt: 'border-top',
	bdb: 'border-bottom',
	bdx: 'border-x',
	bdy: 'border-y',
	
	// border-style
	bs: 'border-style',
	bsr: 'border-right-style',
	bsl: 'border-left-style',
	bst: 'border-top-style',
	bsb: 'border-bottom-style',
	bsx: 'border-x-style',
	bsy: 'border-y-style',
	
	// border-width
	bw: 'border-width',
	bwr: 'border-right-width',
	bwl: 'border-left-width',
	bwt: 'border-top-width',
	bwb: 'border-bottom-width',
	bwx: 'border-x-width',
	bwy: 'border-y-width',
	
	// border-color
	bc: 'border-color',
	bcr: 'border-right-color',
	bcl: 'border-left-color',
	bct: 'border-top-color',
	bcb: 'border-bottom-color',
	bcx: 'border-x-color',
	bcy: 'border-y-color',
	
	// border-radius
	rd: 'border-radius',
	rdtl: 'border-top-left-radius',
	rdtr: 'border-top-right-radius',
	rdbl: 'border-bottom-left-radius',
	rdbr: 'border-bottom-right-radius',
	
	// TODO change these into a shared main one
	rdt: 'border-top-radius',
	rdb: 'border-bottom-radius',
	rdl: 'border-left-radius',
	rdr: 'border-right-radius',
	
	// background
	bg: 'background',
	bgp: 'background-position',
	bgc: 'background-color',
	bgr: 'background-repeat',
	bgi: 'background-image',
	bga: 'background-attachment',
	bgs: 'background-size',
	bgo: 'background-origin',
	bgclip: 'background-clip',
	
	// grid
	g: 'gap',
	rg: 'row-gap',
	cg: 'column-gap',
	gtr: 'grid-template-rows',
	gtc: 'grid-template-columns',
	gta: 'grid-template-areas',
	gar: 'grid-auto-rows',
	gac: 'grid-auto-columns',
	gaf: 'grid-auto-flow',
	gcg: 'grid-column-gap',
	grg: 'grid-row-gap',
	ga: 'grid-area',
	gr: 'grid-row',
	gc: 'grid-column',
	gt: 'grid-template',
	grs: 'grid-row-start',
	gcs: 'grid-column-start',
	gre: 'grid-row-end',
	gce: 'grid-column-end',
	
	// shadow
	shadow: 'box-shadow',// DEPRECATED
	bxs: 'box-shadow',
	
	// overflow
	of: 'overflow',
	ofx: 'overflow-x',
	ofy: 'overflow-y',
	ofa: 'overflow-anchor',
	tof: 'text-overflow',
	
	// content
	prefix: 'content@before',
	suffix: 'content@after',
	
	// transforms
	x: 'x',
	y: 'y',
	z: 'z',
	rotate: 'rotate',
	scale: 'scale',
	'scale-x': 'scale-x',
	'scale-y': 'scale-y',
	'skew-x': 'skew-x',
	'skew-y': 'skew-y',
	origin: 'transform-origin',
	
	// others
	ws: 'white-space',
	zi: 'z-index',
	pe: 'pointer-events',
	us: 'user-select',
	o: 'opacity',
	tween: 'transition',
	
	// easing
	e: 'ease-styles',// Deprecate
	ea: 'ease-all',
	ead: 'ease-all-duration',
	eaf: 'ease-all-function',
	eaw: 'ease-all-delay',
	
	es: 'ease-styles',
	esd: 'ease-styles-duration',
	esf: 'ease-styles-function',
	esw: 'ease-styles-delay',
	
	eo: 'ease-opacity',
	eod: 'ease-opacity-duration',
	eof: 'ease-opacity-function',
	eow: 'ease-opacity-delay',
	
	ec: 'ease-colors',
	ecd: 'ease-colors-duration',
	ecf: 'ease-colors-function',
	ecw: 'ease-colors-delay',
	
	eb: 'ease-box',
	ebd: 'ease-box-duration',
	ebf: 'ease-box-function',
	ebw: 'ease-box-delay',
	
	et: 'ease-transform',
	etd: 'ease-transform-duration',
	etf: 'ease-transform-function',
	etw: 'ease-transform-delay',
	
	// outline
	ol: 'outline',
	olo: 'outline-offset',
	olc: 'outline-color',
	ols: 'outline-style',
	olw: 'outline-width'
};

export const abbreviations = {};
for (let $8 = 0, $9 = Object.keys(aliases), $10 = $9.length, k, v; $8 < $10; $8++){
	k = $9[$8];v = aliases[k];if (typeof v == 'string') {
		abbreviations[v] = k;
	};
};

function isNumber(val){
	if (val._value && val._value._type == "NUMBER" && !val._unit) {
		return true;
	};
	return false;
};

function parseColorPart(part){
	let num = parseFloat(part);
	if (typeof part == 'string' && part.indexOf('%') > 0) {
		num = num / 100;
	};
	return num;
};

export function parseColorString(str,to = 'hsl'){
	let m;
	if (named_colors[str]) {
		str = named_colors[str];
	};
	
	if (to == 'lch') {
		return toLchArray(str);
	};
	
	if (str[0] == '#') {
		let hex = conv.hex.rgb(str);
		return conv.rgb.hsl(hex);
	};
	
	if (m = str.match(/^(hsla?|rgba?)\((.+)\)$/)) {
		let [a,b,c,d = ''] = m[2].replace(/[\,\/]/g,' ').split(/\s+/g);
		
		let out;
		a = parseColorPart(a);
		b = parseColorPart(b);
		c = parseColorPart(c);
		
		if (to == 'lch') {
			return conv.rgb.lch([a,b,c]);
		};
		
		if (m[1] == 'rgb' || m[1] == 'rgba') {
			out = conv.rgb.hsl([parseFloat(a),parseFloat(b),parseFloat(c)]);
		};
		
		if (m[1] == 'hsl' || m[1] == 'hsla') {
			out = [parseFloat(a),parseFloat(b),parseFloat(c)];
		};
		
		return out;
	};
	
	return null;
};

let c$0 = Symbol();
export class Color {
	static from(raw){
		if (typeof raw == 'string') {
			if (raw[0] == '#' && !(raw.match(/^\#([A-Fa-f0-9]{6})([A-Fa-f0-9]{2})?$/))) {
				return new NamedColor(raw.slice(1));
			};
			
			raw = parseColorString(raw);
		};
		
		if (isa$(raw,Array)) {
			return new this('',raw[0],raw[1],raw[2]);
		};
		
		return null;
	}
	
	constructor(name,h,s,l,a = 1){
		this.name = name;
		this.h = h;
		this.s = s;
		this.l = l;
		this.a = a;
	}
	
	lcha(){
		return this[$lcha$] ||= toLchArray(("hsla(" + this.h + " " + this.s + "% " + this.l + "% / " + this.a + ")"));
	}
	
	alpha(a = 1){
		return new Color(this.name,this.h,this.s,this.l,a);
	}
	
	clone(){
		return new Color(this.name,this.h,this.s,this.l,this.a);
	}
	
	mix(other,hw = 0.5,sw = 0.5,lw = 0.5){
		let h1 = this.h + (other.h - this.h) * hw;
		let s1 = this.s + (other.s - this.s) * sw;
		let l1 = this.l + (other.l - this.l) * lw;
		return new Color(this.name + other.name,h1,s1,l1);
	}
	
	toString(a = this.a){
		// if typeof a == 'string' and a.match(/%$/)
				// a = parseFloat(a.slice(0,-1)) / 100
		if (typeof a == 'string' && a[0] == '$') {
			a = ("var(--" + a.slice(1) + ",100%)");
		};
		return ("hsla(" + this.h.toFixed(2) + "," + this.s.toFixed(2) + "%," + this.l.toFixed(2) + "%," + a + ")");
	}
	
	toVar(round = 2){
		return ("" + Math.round(this.h) + "," + Math.round(this.s) + "%," + Math.round(this.l) + "%");
		// "{h.toFixed(2)},{s.toFixed(2)}%,{l.toFixed(2)}%"
	}
	
	toLchString(){
		let [l,c,h,a] = this.lcha();
		return (`lcha(` + l.toFixed(2) + ` ` + c.toFixed(2) + ` ` + h.toFixed(2) + `% / ` + a + `)`);
	}
	
	c(){
		return this.toString();
	}
	static { register$(this,c$0,'Color',16) }
};

let c$1 = Symbol();
export class NamedColor extends Color {
	toVar(){
		return ("var(--c_" + this.name + ")");
	}
	static { register$(this,c$1,'NamedColor',0) }
};

let c$2 = Symbol();
export class Tint extends Color {
	alpha(a = 1){
		return new Tint(this.name,this.h,this.s,this.l,a);
	}
	
	clone(){
		return new Tint(this.name,this.h,this.s,this.l,this.a);
	}
	
	toString(a = this.a){
		if (typeof a == 'string' && a[0] == '$') {
			a = ("var(--" + a.slice(1) + ",100%)");
		};
		
		return ("hsla(var(--" + this.name + ")," + a + ")");
	}
	
	toVar(round = 2){
		return ("var(--" + this.name + ")");
	}
	static { register$(this,c$2,'Tint',0) }
};

let c$3 = Symbol();
export class Length {
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
	
	c(){
		return this.toString();
	}
	
	get _unit(){
		return this.unit;
	}
	
	get _number(){
		return this.number;
	}
	static { register$(this,c$3,'Length',16) }
};

let c$4 = Symbol();
export class Var {
	constructor(name,fallback){
		this.name = name;
		this.fallback = fallback;
	}
	
	c(){
		return this.fallback ? (("var(--" + this.name + "," + (this.fallback.c ? this.fallback.c() : String(this.fallback)) + ")")) : (("var(--" + this.name + ")"));
	}
	static { register$(this,c$4,'Var',16) }
};

let c$5 = Symbol();
export class Calc {
	constructor(expr){
		this.expr = expr;
	}
	
	cpart(parts){
		let out = '(';
		for (let $11 = 0, $12 = iter$__(parts), $13 = $12.length; $11 < $13; $11++) {
			let part = $12[$11];
			if (typeof part == 'string') {
				out += ' ' + part + ' ';
			} else if (typeof part == 'number') {
				out += part;
			} else if (isa$(part.c,Function)) {
				out += part.c();
			} else if (isa$(part,Array)) {
				out += this.cpart(part);
			};
		};
		
		out += ')';
		return out;
	}
	
	c(){
		return 'calc' + this.cpart(this.expr);
	}
	static { register$(this,c$5,'Calc',16) }
};

// This has to move into StyleTheme class
let defaultPalette = {
	// should deprecate
		current: {string: "currentColor",c: function() { return 'currentColor'; }},
	transparent: new Color('transparent',0,0,100,'0%'),
	clear: new Color('transparent',100,100,100,'0%'),
	black: new Color('black',0,0,0,'100%'),
	white: new Color('white',0,0,100,'100%')
};

function parseColors(palette,colors){
	for (let $14 = 0, $15 = Object.keys(colors), $19 = $15.length, name, variations; $14 < $19; $14++){
		name = $15[$14];variations = colors[name];if (typeof variations == 'string') {
			palette[name] = variations;
			continue;
		};
		
		for (let $16 = 0, $17 = Object.keys(variations), $18 = $17.length, subname, raw; $16 < $18; $16++){
			subname = $17[$16];raw = variations[subname];let path = name + subname;
			
			if (palette[raw]) {
				palette[path] = palette[raw];
			} else {
				let [h,s,l] = parseColorString(raw);
				let color = palette[path] = new Color(path,h,s,l,'100%');
			};
		};
	};
	return palette;
};

parseColors(defaultPalette,colors);

const VALID_CSS_UNITS = 'cm mm Q in pc pt px em ex ch rem vw vh vmin vmax % s ms fr deg rad grad turn Hz kHz'.split(' ');

let c$6 = Symbol();
export class StyleTheme {
	static instance(){
		return ThemeInstance ||= new this;
	}
	
	static propAbbr(name){
		return abbreviations[name] || name;
	}
	
	static wrap(config){
		if (!config) { return this.instance() };
		
		let theme = ThemeCache.get(config);
		if (!theme) { ThemeCache.set(config,theme = new this(config)) };
		return theme;
	}
	
	constructor(ext = {}){
		this.options = theme;
		this.palette = Object.assign({},defaultPalette);
		
		if (ext.theme) { ext = ext.theme };
		
		if (ext && ext.colors) {
			parseColors(this.palette,ext.colors);
		};
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
		
		if (typeof value == 'number' && config.NUMBER) {
			let [step,num,unit] = config.NUMBER.match(/^(\-?[\d\.]+)(\w+|%)?$/);
			return value * parseFloat(num) + unit;
		};
		
		return value;
	}
	
	padding_x([l,r = l]){
		return {'padding-left': l,'padding-right': r};
	}
	
	padding_y([t,b = t]){
		return {'padding-top': t,'padding-bottom': b};
	}
	
	margin_x([l,r = l]){
		return {'margin-left': l,'margin-right': r};
	}
	
	margin_y([t,b = t]){
		return {'margin-top': t,'margin-bottom': b};
	}
	
	ease(pars){
		return this.$ease(pars,'s');
	}
	
	ease_all(pars){
		return this.$ease(pars,'a');
	}
	
	ease_opacity(pars){
		return this.$ease(pars,'o');
	}
	
	ease_styles(pars){
		return this.$ease(pars,'s');
	}
	
	ease_box(pars){
		return this.$ease(pars,'b');
	}
	
	ease_transform(pars){
		return this.$ease(pars,'t');
	}
	
	ease_colors(pars){
		return this.$ease(pars,'c');
	}
	
	$ease(pars,k = '',slot = null){
		pars = pars.slice(0);
		
		let o = {__ease__: k};
		
		if (pars[0]?.unit) {
			o[("--e_" + k + "d")] = pars[0];
			pars.shift();
		};
		
		if (pars[0] && !(pars[0].unit)) {
			let ev = this.$varFallback('ease',[pars[0]]);
			o[("--e_" + k + "f")] = ev;
			pars.shift();
		};
		
		if (pars[0] && pars[0].unit) {
			o[("--e_" + k + "w")] = pars[0];
			pars.shift();
		};
		
		return o;
	}
	
	inset([t,r = t,b = t,l = r]){
		return {position: 'absolute',top: t,right: r,bottom: b,left: l};
	}
	
	grid(params){
		let m;
		if (m = this.$varFallback('grid',params)) {
			return m;
		};
		return;
	}
	
	animation(...params){
		let valids = {
			normal: 1,reverse: 1,alternate: 1,'alternate-reverse': 1,
			infinite: 2,
			none: 3,forwards: 3,backwards: 3,both: 3,
			running: 4,paused: 4
		};
		let used = {};
		for (let k = 0, $20 = iter$__(params), $23 = $20.length; k < $23; k++) {
			let anim = $20[k];
			let name = null;
			let ease = null;
			for (let i = 0, $21 = iter$__(anim), $22 = $21.length; i < $22; i++) {
				let part = $21[i];
				let str = String(part);
				let typ = valids[str];
				
				if (validTypes.ease[str] && !ease) {
					ease = true;
				} else if (typ) {
					if (used[typ]) {
						name = [i,str];
					};
					used[typ] = true;
				} else if (str.match(/^[^\d\.]/) && str.indexOf('(') == -1) {
					if (name) {
						ease = [i,str];
					} else {
						name = [i,str];
					};
				};
			};
			if (name) {
				anim[name[0]] = new Var(("animation-" + (name[1])),name[1]);
			};
			if (isa$(ease,Array)) {
				let fallback = this.options.variants.easings[ease[1]];
				anim[ease[0]] = new Var(("ease-" + (ease[1])),fallback);
			};
		};
		
		return {animation: params};
	}
	
	animation_timing_function(...params){
		for (let i = 0, $24 = iter$__(params), $25 = $24.length; i < $25; i++) {
			let param = $24[i];
			let fb = this.$varFallback('ease',param);
			if (fb) { params[i] = fb };
		};
		return params;
	}
	
	animation_name(...params){
		let m;
		for (let i = 0, $26 = iter$__(params), $27 = $26.length; i < $27; i++) {
			let param = $26[i];
			let fb = this.$varFallback('animation',param);
			if (fb) {
				// param[0] = fb[0]
				params[i] = fb;
			};
			// params[i] = $varFallback('animation',param)
		};
		return params;
		
		if (m = this.$varFallback('animation',params)) {
			return m;
		};
		return;
	}
	
	display(params){
		let out = {display: params};
		for (let $28 = 0, $29 = iter$__(params), $30 = $29.length, layout; $28 < $30; $28++) {
			let par = $29[$28];
			if (layout = layouts[String(par)]) {
				layout.call(this,out,par,params);
			};
		};
		return out;
	}
	
	text_transform(params){
		let out = {'text-transform': params};
		let str = String(params[0]);
		if ((is$(str,'cap'))) {
			out['text-transform'] = 'capitalize';
		} else if ((is$(str,'up'))) {
			out['text-transform'] = 'uppercase';
		};
		return out;
	}
	
	position(params){
		let out = {position: params};
		let str = String(params[0]);
		if (str == 'abs') {
			out.position = 'absolute';
		} else if (str == 'rel') {
			out.position = 'relative';
		};
		return out;
	}
	
	width([...params]){
		let o = {};
		for (let $31 = 0, $32 = iter$__(params), $33 = $32.length; $31 < $33; $31++) {
			let param = $32[$31];
			let opts = param._options || {};
			let u = param._unit;
			if (u == 'c' || u == 'col' || u == 'cols') {
				o['grid-column-end'] = ("span " + (param._number));
			} else if (opts.op && String(opts.op) == '>') {
				o['min-width'] = param;
			} else if (opts.op && String(opts.op) == '<') {
				o['max-width'] = param;
			} else {
				o.width = param;
			};
		};
		return o;
	}
	
	height([...params]){
		let o = {};
		for (let $34 = 0, $35 = iter$__(params), $36 = $35.length; $34 < $36; $34++) {
			let param = $35[$34];
			let opts = param._options || {};
			let u = param._unit;
			if (u == 'r' || u == 'row' || u == 'rows') {
				o['grid-row-end'] = ("span " + (param._number));
			} else if (opts.op && String(opts.op) == '>') {
				o['min-height'] = param;
			} else if (opts.op && String(opts.op) == '<') {
				o['max-height'] = param;
			} else {
				o.height = param;
			};
		};
		return o;
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
			
			if (group && parts.length == 0) {
				part[0] = 'none';
				Object.assign(add,{'transition-property': group.join(',')});
			} else if (group && parts.length > 1) {
				// TODO we could do a more advanced version where we
								// create repeating transition-property and duration etc and seam
								// the pairs together
				let subparts = group.map(function(_0) { return [_0].concat(part.slice(1)); });
				parts.splice(i,1,...subparts);
				continue;
			};
			i++;
		};
		
		// this is a hack
		Object.assign(out,{'--e_rest': parts},add);
		return out;
	}
	
	font(params,...rest){
		for (let i = 0, $37 = iter$__(params), $38 = $37.length; i < $38; i++) {
			let param = $37[i];
			true;
		};
		return;
	}
	
	font_family(params){
		let m;
		if (m = this.$varFallback('font',params)) {
			return m;
		};
		return;
	}
	
	text_shadow(...params){
		for (let i = 0, $39 = iter$__(params), $40 = $39.length, m; i < $40; i++) {
			let par = $39[i];
			if (m = this.$varFallback('text-shadow',par)) {
				params[i] = m;
			};
		};
		return params;
	}
	
	box_shadow(...params){
		let o = {'box-shadow': params};
		for (let i = 0, $41 = iter$__(params), $44 = $41.length; i < $44; i++) {
			let pair = $41[i];
			let tpl = false;
			for (let pi = 0, $42 = iter$__(pair), $43 = $42.length; pi < $43; pi++) {
				let par = $42[pi];
				if (pi == 0 && pair.length < 3) {
					let str = String(par);
					if (str.match(/^[\w\-]+$/)) {
						tpl = str;
						pair[pi] = new Var(("box-shadow-" + str),par);
					};
				};
				
				if (pi == 1 && tpl) {
					o[("--bxs-" + tpl + "-color")] = ("/*##*/" + par);
					
					if (par.param) {
						o[("--bxs-" + tpl + "-alpha")] = par.param.toAlpha();
					};
					
					par.set({parameterize: true});
					pair[pi] = '';
					// pair.pop!
					true;
					// need to add another property
					// if let m = $varFallback('box-shadow',par)
					// params[i] = m
				};
			};
		};
		return o;
		return params;
	}
	
	grid_template(params){
		for (let i = 0, $45 = iter$__(params), $46 = $45.length; i < $46; i++) {
			let param = $45[i];
			if (isNumber(param)) {
				param._resolvedValue = ("repeat(" + (param._value) + ",1fr)");
			};
		};
		return;
	}
	
	grid_template_columns(params){
		return this.grid_template(params);
	}
	
	grid_template_rows(params){
		return this.grid_template(params);
	}
	
	size([w,h = w]){
		return {width: w,height: h};
	}
	
	font_size([v]){
		let sizes = this.options.variants['font-size'];
		let raw = String(v);
		let size = v;
		let lh;
		let out = {};
		
		if (sizes[raw]) {
			[size,lh] = sizes[raw];
			size = Length.parse(size);
			lh = Length.parse(lh || '');
		};
		
		if (v.param && v.param) {
			lh = v.param;
		};
		
		out['font-size'] = size;
		
		if (lh) {
			let lhu = lh._unit;
			let lhn = lh._number;
			out.lh = lh;
			// supprt base unit as well?
			if (lhu == 'fs') {
				out.lh = new Length(lhn);
			} else if (lhu) {
				out.lh = lh;
			} else if (lhn == 0) {
				out.lh = 'inherit';
			} else if (lhn && size._unit == 'px') {
				let rounded = Math.round(size._number * lhn);
				if (rounded % 2 == 1) {
					rounded++;
				};
				out.lh = new Length(rounded,'px');
			};
		};
		
		return out;
	}
	
	line_height([v]){
		let uvar = v;
		// TODO what if it has u unit?
		if (v._number && !v._unit) {
			uvar = v.clone(v._number,'em');
		};
		
		return {
			'line-height': v,
			'--u_lh': uvar
		};
	}
	
	text_decoration(params){
		for (let i = 0, $47 = iter$__(params), $48 = $47.length; i < $48; i++) {
			let param = $47[i];
			let str = String(param);
			if (str == 'u') {
				param._resolvedValue = 'underline';
			} else if (str == 's') {
				param._resolvedValue = 'line-through';
			};
		};
		
		return [params];
	}
	
	// TODO allow setting border style and color w/o width?
	// TODO allow size hidden etc?
	border([...params]){
		return this.$border(params,'');
	}
	
	$border(params,side = ''){
		let o = {__border__: true};
		let len = params.length;
		
		if (len == 3) {
			o[("border" + side)] = [params];
			return o;
		};
		
		if (this.isNumeric(params[0])) {
			if (len == 2 && this.isColorish(params[1])) {
				params.splice(1,0,'solid');
				o[("border" + side)] = [params];
				return o;
			};
			
			o[("border" + side + "-style")] = 'solid';
			o[("border" + side + "-width")] = params.shift();
		};
		
		if (this.isColorish(params[0])) {
			if (len == 1) {
				o[("border" + side)] = [['1px','solid',params.shift()]];
			} else {
				// add weak border styles
				o[("border" + side + "-width")] ||= '1px';
				o[("border" + side + "-style")] = 'solid';
				o[("border" + side + "-color")] = params.shift();
			};
		};
		
		// TODO if it is not a variable?
		if (params[0]) {
			o[("border" + side + "-style")] = params[0];
		};
		
		return o;
	}
	
	border_left(params){
		return this.$border(params,'-left');
	}
	
	border_right(params){
		return this.$border(params,'-right');
	}
	
	border_top(params){
		return this.$border(params,'-top');
	}
	
	border_bottom(params){
		return this.$border(params,'-bottom');
	}
	
	border_x(params){
		return this.$border(params,'-inline');
	}
	
	border_y(params){
		return this.$border(params,'-block');
	}
	
	border_x_width([l,r = l]){
		return {bwl: l,bwr: r};
	}
	
	border_y_width([t,b = t]){
		return {bwt: t,bwb: b};
	}
	
	border_x_style([l,r = l]){
		return {bsl: l,bsr: r};
	}
	
	border_y_style([t,b = t]){
		return {bst: t,bsb: b};
	}
	
	border_x_color([l,r = l]){
		return {bcl: l,bcr: r};
	}
	
	border_y_color([t,b = t]){
		return {bct: t,bcb: b};
	}
	
	// it should rather send the same to both
	border_top_radius(pars){
		return {'border-top-left-radius': [pars],'border-top-right-radius': [pars]};
	}
	
	border_left_radius(pars){
		return {'border-top-left-radius': [pars],'border-bottom-left-radius': [pars]};
	}
	
	border_bottom_radius(pars){
		return {'border-bottom-left-radius': [pars],'border-bottom-right-radius': [pars]};
	}
	
	border_right_radius(pars){
		return {'border-top-right-radius': [pars],'border-bottom-right-radius': [pars]};
	}
	
	justify_align([justify,align = justify]){
		let o = {};
		if (justify == align) {
			o['place-items'] = o['place-content'] = justify;
		} else {
			o['justify-content'] = o['justify-items'] = justify;
			o['align-content'] = o['align-items'] = align;
		};
		return o;
	}
	
	outline(params){
		// TODO use :where() selector for 0 specificity outline defaults
		if (params.length == 3 || (params.length == 1 && String(params[0]) == 'none')) {
			return {outline: [params]};
		};
		let o = {__outline__: true};
		if (this.isNumeric(params[0])) {
			o.olw = params.shift();
		};
		if (this.isColorish(params[0])) {
			o.olc = params.shift();
		};
		
		if (!o.olw) {
			o['--ol_w'] = '1px';
		};
		return o;
	}
	
	gap([rg,cg = rg]){
		let o = {};
		if (cg != rg) {
			o = {'row-gap': rg,'column-gap': cg};
		} else {
			o = {gap: rg};
			if (rg._unit != 'rg') { o['--u_rg'] = rg };
			if (rg._unit != 'cg') { o['--u_cg'] = rg };
		};
		return o;
	}
	
	row_gap([v]){
		let o = {'row-gap': v};
		if (v._unit != 'rg') { o['--u_rg'] = v };
		return o;
	}
	
	column_gap([v]){
		let o = {'column-gap': v};
		if (v._unit != 'cg') { o['--u_cg'] = v };
		return o;
	}
	
	tint([v]){
		let o = {'--hue': v};
		for (let i = 0; i < 10; i++) {
			o[("--hue" + i)] = ("/*##*/" + v + i);
			// new Tint("v{i}")
		};
		return o;
	}
	
	hue([v]){
		let o = {'--hue': v};
		
		for (let i = 0; i < 10; i++) {
			o[("--hue" + i)] = ("/*##*/" + v + i);
			// new Tint("v{i}")
		};
		return o;
	}
	
	// def shadow ...params
	// {}
	
	colormix(name,expr){
		let o = {};
		let pre = ("--c_" + name);
		
		let val = expr[0][0];
		let [l,c,h,a] = [null,null,null,1];
		
		if (val?.lcha) {
			[l,c,h,a] = val.lcha();
		} else if (isa$(val?._resolvedValue,Color)) {
			[l,c,h,a] = val._resolvedValue.lcha();
			if (val.param && val.param.toAlpha) {
				a = val.param.toAlpha();
			};
		};
		
		if (typeof l == 'number') {
			l = Math.round(l * 10) / 10;
		};
		if (typeof c == 'number') {
			c = Math.round(c * 10) / 10;
		};
		if (typeof h == 'number') {
			h = Math.round(h * 10) / 10;
		};
		
		
		if (l != null) {
			o[(`--u_` + name + `L`)] = l;
			o[(`--u_` + name + `C`)] = c;
			o[(`--u_` + name + `H`)] = (h?._resolvedValue ?? h);// no?
			// o[`--u_{name}N`] = l > 50 ? 0 : 100
			o[(`--u_` + name + `A`)] = (a ?? 1);
			// o[pre] = color.toLchString()
		};
		
		return o;
	}
	
	$color(name){
		let parsed;
		let m = name.match(/^([A-Za-z\-]+)(\d)(\d*)$/);
		let ns = m && m[1];
		
		// aliased colors
		if (ns && typeof this.palette[ns] == 'string') {
			return this.$color(this.palette[ns] + name.slice(ns.length));
		};
		
		if (ns == 'hue') {
			return new Tint(name);
		};
		
		if (this.palette[name]) {
			return this.palette[name];
		};
		
		if (m) {
			let nr = parseInt(m[2]);
			let fraction = m[3] ? parseFloat(("0." + (m[3]))) : 0;
			let from = null;
			let to = null;
			
			// what if it is fractional?
			
			// if nr > 9
			// fraction = (nr % 100) / 10
			// nr = Math.floor(nr / 100)
			
			let n0 = nr + 1;
			let n1 = nr;
			
			if (typeof this.palette[ns] == 'string') {
				// proxy to a different color
				return this.$color(this.palette[ns] + name.slice(ns.length));
			};
			
			while (n0 > 1 && !from){
				from = this.palette[ns + (--n0)];
			};
			
			while (n1 < 9 && !to){
				to = this.palette[ns + (++n1)];
			};
			
			// only when we could not find colors?
			let weight = ((nr - n0) + (fraction)) / (n1 - n0);
			let hw = weight;
			let sw = weight;
			let lw = weight;
			
			if (!to) {
				to = this.palette.black;
				hw = 0;
				sw = lw = fraction;
			};
			
			if (!from) {
				from = this.palette.blue1;
				hw = 1;
				sw = lw = 1 - fraction;
			};
			
			if (from && to) {
				return this.palette[name] = from.mix(to,hw,sw,lw);
			};
		};
		
		if (parsed = parseColorString(name)) {
			return new Color('',...parsed);
		};
		return null;
	}
	
	isNumeric(val){
		if (isNumber(val)) { return true };
		if (typeof val == 'number') { return true };
		if (String(val).match(/^[\-\+]?\d?(\.?\d+)(\w+|%)?$/)) { return true };
		return false;
	}
	
	isColorish(val){
		if (this.$parseColor(val)) { return true };
		return false;
	}
	
	// too many methods doing the same thing
	$parseColor(identifier){
		let color;
		let key = String(identifier);
		if (color = this.$color(key)) {
			return color;
		};
		
		if (key.match(/^#[a-fA-F0-9]{3,8}/)) {
			return identifier;
		} else if (key.match(/^(rgb|hsl)/)) {
			return identifier;
		} else if (key == 'currentColor') {
			return identifier;
		};
		
		return null;
	}
	
	$varFallback(name,params,exclude = []){
		if (params.length == 1) {
			let str = String(params[0]);
			let fallback = params[0];
			exclude.push('none','initial','unset','inherit');
			if (exclude.indexOf(str) == -1 && str.match(/^[\w\-]+$/)) {
				if (name == 'font' && fonts[str]) {
					fallback = fonts[str];
				};
				if (name == 'ease' && this.options.variants.easings[str]) {
					fallback = this.options.variants.easings[str];
				};
				// elif name == 'box-shadow' and
				return [new Var(("" + name + "-" + str),fallback)];
			};
		};
		return;
	}
	
	$value(value,index,config){
		let color;
		let key = config;
		let orig = value;
		let raw = (value && value.toRaw) ? value.toRaw() : String(value);
		let str = String(value);
		let fallback = false;
		let result = null;
		let unit = orig._unit;
		if (typeof config == 'string') {
			if (aliases[config]) {
				config = aliases[config];
				
				if (isa$(config,Array)) {
					config = config[0];
				};
			};
			
			if (config.match(/^((min-|max-)?(width|height)|top|left|bottom|right|padding|margin|sizing|inset|spacing|sy$|s$|\-\-s[xy])/)) {
				config = 'sizing';
			} else if (config.match(/^\-\-[gs][xy]_/)) {
				config = 'sizing';
			} else if (config.match(/^(row-|column-)?gap/)) {
				config = 'sizing';
			} else if (config.match(/^[mps][trblxy]?$/)) {
				config = 'sizing';
			} else if (config.match(/^[trblwh]$/)) {
				config = 'sizing';
			} else if (config.match(/^e[otbca]?f$/) || config.match(/^ease(-\w+)?-function$/)) {
				config = 'easings';
				fallback = 'ease';
			} else if (config.match(/^border-.*radius/) || config.match(/^rd[tlbr]{0,2}$/)) {
				config = 'radius';
				fallback = 'border-radius';
			} else if (config.match(/^tween|transition/) && this.options.variants.easings[raw]) {
				return this.options.variants.easings[raw];
			};
			
			config = this.options.variants[config] || {};
		};
		
		if (value == undefined) {
			value = config.default;
		};
		
		if (config.hasOwnProperty(raw)) {
			// should we convert it or rather just link it up?
			value = config[value];
		};
		
		if (typeof raw == 'number' && config.NUMBER) {
			let [step,num,unit] = config.NUMBER.match(/^(\-?[\d\.]+)(\w+|%)?$/);
			return value * parseFloat(num) + unit;
		} else if (typeof raw == 'string') {
			if (color = this.$parseColor(raw)) {
				return color;
			};
		};
		
		if (fallback && !unit) {
			let okstr = str.match(/^[a-zA-Z\-][\w\-]*$/) && !(str.match(/^(none|inherit|unset|initial)$/));
			let oknum = unit && VALID_CSS_UNITS.indexOf(unit) == -1;
			if ((okstr || oknum) && value.alone) {
				return new Var(("" + fallback + "-" + str),(orig != value) ? value : raw);
			};
		};
		
		return value;
	}
	
	transformColors(text){
		var self = this;
		text = text.replace(/\/\*(#+)\*\/(\#?\w+)(?:\/(\d+%?|\$[\w\-]+))?/g,function(m,typ,c,a) {
			let color;
			if (color = self.$color(c)) {
				if (typ == '#') {
					return color.toString(a,typ);
				} else if (typ == '##') {
					return color.toVar(a);
				};
			};
			return m;
		});
		return text;
	}
	static { register$(this,c$6,'StyleTheme',16) }
};

// should not happen at root - but create a theme instance

export const StyleExtenders = {
	transform: {
		specificity: 0,
		body: '--t_x:0;--t_y:0;--t_rotate:0;\n--t_scale:1;--t_scale-x:1;--t_scale-y:1;\ntransform: translate(var(--t_x),var(--t_y)) rotate(var(--t_rotate))\n	scaleX(var(--t_scale-x)) scaleY(var(--t_scale-y)) scale(var(--t_scale));'
	},
	
	transform_complex: {
		specificity: 0,
		body: '--t_z:0;--t_skew-x:0;--t_skew-y:0;\ntransform: translate3d(var(--t_x),var(--t_y),var(--t_z))\n					rotate(var(--t_rotate))\n					skewX(var(--t_skew-x)) skewY(var(--t_skew-y))\n					scaleX(var(--t_scale-x)) scaleY(var(--t_scale-y)) scale(var(--t_scale)) !important;'
	},
	
	outline: {body: '--ol_s:solid;--ol_w:1px;--ol_o:0px; --ol_c:transparent;\noutline:var(--ol_w) var(--ol_s) var(--ol_c); outline-offset:var(--ol_o);\noutline:1px solid transparent; outline-offset:var(--ol_o);'},
	
	ease: {body: '--e_ad:0ms;--e_af:cubic-bezier(0.23, 1, 0.32, 1);--e_aw:0ms;\n--e_sd:var(--e_ad);--e_sf:var(--e_af);--e_sw:var(--e_aw);\n--e_od:var(--e_sd);--e_of:var(--e_sf);--e_ow:var(--e_sw);\n--e_cd:var(--e_sd);--e_cf:var(--e_sf);--e_cw:var(--e_sw);\n--e_bd:var(--e_sd);--e_bf:var(--e_sf);--e_bw:var(--e_sw);\n--e_td:var(--e_bd);--e_tf:var(--e_bf);--e_tw:var(--e_bw);\n--e_b:var(--e_bd) var(--e_bf) var(--e_bw);\n--e_c:var(--e_cd) var(--e_cf) var(--e_cw);\n--e_rest:any;\ntransition:\n	all var(--e_ad) var(--e_af) var(--e_aw),\n	opacity var(--e_od) var(--e_of) var(--e_ow),\n	transform var(--e_td) var(--e_tf) var(--e_tw),\n	color var(--e_c),background-color var(--e_c),border-color var(--e_c),fill var(--e_c),stroke var(--e_c), outline-color var(--e_c), box-shadow var(--e_c), filter var(--e_c),\n	inset var(--e_b), width var(--e_b),height var(--e_b),max-width var(--e_b),max-height var(--e_b),min-width var(--e_b),min-height var(--e_b),border-width var(--e_b),outline-width var(--e_b),stroke-width var(--e_b),margin var(--e_b),padding var(--e_b),\n	var(--e_rest);'}
};

export const AutoPrefixes = {
	'user-select': ['-webkit-user-select'],
	appearance: ['-webkit-appearance'],
	'backdrop-filter': ['-webkit-backdrop-filter'],
	'mask-image': ['-webkit-mask-image']
};

let c$7 = Symbol();
export class StyleSheet {
	constructor(stack){
		this[$stack$] = stack;
		this[$parts$] = [];
		this[$apply$] = {transform_complex: [],transform: []};
		this[$register$] = {};
		this.transforms = null;
	}
	
	get transitions(){
		return this[$register$].transition;
	}
	
	add(part,meta = {}){
		this[$parts$].push(part);
		
		if (meta.apply) {
			for (let $51 = meta.apply, $49 = 0, $50 = Object.keys($51), $55 = $50.length, k, v; $49 < $55; $49++){
				k = $50[$49];v = $51[k];let arr = this[$apply$][k] ||= [];
				for (let $52 = 0, $53 = iter$__(v), $54 = $53.length; $52 < $54; $52++) {
					let item = $53[$52];
					if (arr.indexOf(item) < 0) { arr.push(item) };
				};
			};
		};
		return;
	}
	
	js(root,stack){
		let js = [];
		
		for (let $58 = this[$register$], $56 = 0, $57 = Object.keys($58), $59 = $57.length, k, v; $56 < $59; $56++){
			k = $57[$56];v = $58[k];js.push(root.runtime().transitions + (".addSelectors(" + JSON.stringify(v) + ",'" + k + "')"));
		};
		return js.join('\n');
	}
	
	parse(){
		if (this[$string$]) { return this[$string$] };
		
		let js = [];
		let parts = this[$parts$].slice(0);
		
		let prepend = function(val) {
			if (parts.indexOf(val) < 0) {
				return parts.unshift(val);
			};
		};
		
		for (let $62 = this[$apply$], $60 = 0, $61 = Object.keys($62), $74 = $61.length, k, v; $60 < $74; $60++){
			k = $61[$60];v = $62[k];if (!v || v.length == 0) { continue; };
			
			let helper = StyleExtenders[k];
			
			let base = {};
			let all = {};
			let groups = {"": base};
			let easing = k == 'transition' || k.match(/^_(off|out|in)_sized/);
			
			for (let $63 = 0, $64 = iter$__(v), $68 = $64.length; $63 < $68; $63++) {
				let item = $64[$63];
				for (let $65 = 0, $66 = iter$__((item[$rules$] || [])), $67 = $66.length; $65 < $67; $65++) {
					let rule = $66[$65];
					let ns = rule[$media$] || '';
					let sel = rule[$string$].replace(/:not\((#_|\._0?)+\)/g,'');
					
					if (easing || k == 'ease') {
						sel = sel.replace(/\.\\@(off|out|in|on)\b/g,'');
					};
					sel = sel.replace(/((\:+)[\w\-]+)(?!\()/g,function(m,k) { return (k.length > 1) ? m : ''; });
					sel = sel.replace(/^\:root /g,'');
					
					// simplify the selectors as much as possible
					
					let group = groups[ns] ||= {};
					group[sel] = rule;
					all[sel] = true;
				};
			};
			
			if (helper) {
				for (let $69 = 0, $70 = Object.keys(groups), $73 = $70.length, ns, group; $69 < $73; $69++){
					ns = $70[$69];group = groups[ns];let sel = Object.keys(group);
					if (ns != '') {
						sel = sel.filter(function(_0) { return !(base[_0]); });
					};
					
					if (sel.length == 0) { continue; };
					// sel.unshift('._ease_') if k == 'transition' or k == 'ease'
					
					let sels = sel.sort(function(a,b) { return a.length - b.length; });
					let corr = [];
					
					for (let i = 0, $71 = iter$__(sels), $72 = $71.length; i < $72; i++) {
						let s = $71[i];
						let pre = sels.slice(0,i);
						let some = pre.find(function(_0) {
							return s.indexOf(_0) >= 0;
						});
						if (!some || s.match(/[\s\>\,]|:(not|before|after|marker)|::/)) {
							corr.push(s);
						};
					};
					sel = corr;
					let selstr = sel.join(', ');
					
					// if helper.specificity === 0
					// selstr = `:where({selstr})`
					
					let str = selstr + ' {\n' + helper.body + '\n}';
					
					if (ns) {
						str = ns + ' {\n' + str + '\n}';
					};
					
					parts.unshift(str);
				};
			};
			
			let selectors = Object.keys(all);
			if (k == 'transition' && selectors.length) {
				prepend('.\\@enter:not(#_),.\\@leave:not(#_) {--e_ad:300ms;}');
				prepend('._instant_:not(#_):not(#_):not(#_):not(#_) { transition-duration:0ms !important; }');// 
			};
			if (easing) {
				this[$register$][k] = selectors;
			};
		};
		
		this[$string$] = parts.join('\n\n');
		
		if (this[$stack$].resolveColors()) {
			this[$string$] = this[$stack$].theme().transformColors(this[$string$],{prefix: false});
		};
		
		return this[$string$];
	}
	
	toString(){
		try {
			return this.parse();
		} catch (e) {
			console.warn("failed to parse stylesheet",this[$parts$],e);
			return "";
		};
	}
	static { register$(this,c$7,'StyleSheet',16) }
};

let c$8 = Symbol();
export class StyleRule {
	constructor(parent,selector,content,options = {}){
		this.parent = parent;
		this.selector = selector;
		this.content = content;
		this.options = options;
		this.isKeyFrames = !(!(selector.match(/\@keyframes \w/)));
		this.isKeyFrame = parent && parent.isKeyFrames;
		this.meta = {};
	}
	
	root(){
		return this.parent ? this.parent.root : this;
	}
	
	apply(kind,sel){
		let arr = this.options.apply[kind] ||= [];
		return arr.push(sel);
	}
	
	register(kind,sel){
		let arr = this.options.register[kind] ||= [];
		return arr.push(sel);
	}
	
	toString(o = {}){
		if (!(this.parent) && this.selector) {
			// parse the nested groups here
			let selast;
			let layers;
			
			try {
				selast = selparser.parse(this.selector,this.options);
				layers = selparser.layerize(selast,this.options);
				
				if (layers[1] && layers[1][0]) {
					[this.ownsel,...this.ownrules] = layers[1];
				};
			} catch (e) {
				console.log('error',e,selast,this.selector);
			};
		};
		
		let parts = [];
		let subrules = [];
		let subrule;
		
		let out = "";
		
		let suffix = [];
		let indent = o.indent || '';
		
		if (this.isKeyFrames) {
			let [context,name] = this.selector.split(/\s*\@keyframes\s*/);
			
			context = context.trim();
			name = name.trim();
			
			let path = [name,context,this.options.ns].filter(function(_0) { return _0; }).join('-');
			// what if it is global?
			this.meta.name = name;
			this.meta.uniqueName = path.replace(/[\s\.\,]+/g,'').replace(/[^\w\-]/g,'_');
			
			if (this.options.global && !context) {
				this.meta.uniqueName = this.meta.name;
			};
			
			let subprops = {};
			subprops[("--animation-" + name)] = ("" + (this.meta.uniqueName));
			
			if (context) {
				subrules.push(new StyleRule(null,context,subprops,this.options));
			} else if (this.options.ns && !(this.options.global)) {
				subrules.push(new StyleRule(null,("." + (this.options.ns)),subprops,{}));
			};
		};
		
		let selpri = (typeof this.selector == 'string' && this.selector.indexOf('@important') >= 0) ? 1 : 0;
		
		for (let $77 = this.content, $75 = 0, $76 = Object.keys($77), $81 = $76.length, key, value; $75 < $81; $75++){
			key = $76[$75];value = $77[key];if (value == undefined) { continue; };
			
			let subsel = null;
			let important = selpri ? ' !important' : '';
			let rawkey = key;
			
			// let [m,imp,name,mods] = (key.match(/^(\?*\!*)?([\w\-]+)(\§.+)?/) or [])
			
			// if imp
			// important = imp[0] == '!' ? ' !important' : ''
			// key = key.slice(imp.length)
			
			if (key.indexOf('&') >= 0) {
				if (this.isKeyFrames) {
					let keyframe = key.replace(/&/g,'');
					let rule = new StyleRule(this,keyframe,value,this.options);
					parts.push(rule.toString({indent: indent + '\t'}));
					continue;
				};
				
				// Rename to @mount?
				if (key.match(/@start\b/)) {
					let [pre,post] = key.split(/\s*\@start\s*/);
					
					let rule = new StyleRule(null,'@starting-style',value,{});
					parts.push(rule.toString({indent: indent + '\t'}));
					continue;
				};
				
				let subsel = selparser.unwrap(this.selector,key);
				if (this.ownsel) {
					// subsel = selparser.unwrap('&',key)
										// only replace the first one?
					subsel = key.replace(/&/g,':scope');
				};
				
				subrules.push(new StyleRule(this,subsel,value,this.options));
				continue;
			} else if (key.indexOf('§') >= 0) {
				// let keys = key.replace(/[\.\~\@\+]/g,'\\$&').split('§')
				let keys = rawkey.split('§');
				// keys.slice(1).join(' ')
				// using :is it should be much, much easier with the nested selectors?
				// can even just take the whole outer selector as a simple :is on this element
				let substr = keys.slice(1).join('');
				// do we unwrap, or can we just use :where etc and trust it?
				let subsel = selparser.unwrap(this.selector,substr);
				let obj = {};
				
				
				obj[keys[0]] = value;
				if (subrule = subrules[subsel]) {
					subrule.content[keys[0]] = value;
				} else {
					subrule = new StyleRule(this,subsel,obj,this.options);
					subrules.push(subrules[subsel] = subrule);
				};
				continue;
			} else if (key.match(/^__(\w+)__$/)) {
				this.meta[key.slice(2,-2)] = true;
			} else if (key[0] == '[') {
				// better to just check if key contains '.'
								// this is only for a single property
				let o = JSON.parse(key);
				subrules.push(new StyleRule(this,this.selector,value,this.options));
				continue;
			} else if (key.match(/^(x|y|z|scale|scale-x|scale-y|skew-x|skew-y|rotate)$/)) {
				if (!(this.meta.transform)) {
					this.meta.transform = true;
				};
				if (key.match(/^(z|skew-x|skew-y)$/)) {
					this.meta.transform_complex = true;
				};
				
				parts.push(("--t_" + key + ": " + value + " !important;"));
			} else if (key.match(/^(ease-.*)$/)) {
				this.meta.ease = true;
				let ref = key.replace('delay','wait').split('-').map(function(_0) { return _0[0]; }).join('');
				parts.push(("--e_" + ref.slice(1) + ": " + value + " !important;"));
				
				if (!abbreviations[key]) {
					console.warn(("" + key + " is not a valid style property"));
				};
			} else if (key.match(/^(--e_\w+)$/)) {
				this.meta.ease = true;
				if (this.selector.match(/@in\b/)) {
					true;
					// TODO warn about easings not making sense inside here
				};
				parts.push(("" + key + ": " + value + " !important;"));
			} else if (key.match(/^__ease__$/)) {
				true;
			} else if (key.match(/^raw-/)) {
				parts.push(("" + key.slice(4) + ": " + value + important + ";"));
				true;
			} else if (key.match(/^__outline__$/)) {
				this.meta.outline = true;
			} else {
				if (key.match(/^(width|height)$/)) {
					// what about min/max sizes?
					this.meta.size = true;
				};
				
				parts.push(("" + key + ": " + value + important + ";"));
				
				if (AutoPrefixes[key]) {
					for (let $78 = 0, $79 = iter$__(AutoPrefixes[key]), $80 = $79.length; $78 < $80; $78++) {
						let prefixed = $79[$78];
						parts.push(("" + prefixed + ": " + value + important + ";"));
					};
				};
			};
		};
		
		
		let content = parts.map(function(_0) { return indent + '\t' + _0; }).join('\n');
		// let content = parts.join('\n')
		if (o.indent || this.isKeyFrames) {
			content = '\n' + content + '\n';
		};
		
		if (this.isKeyFrame) {
			out = ("" + this.selector + " \{" + content + "\}");
		} else if (this.isKeyFrames) {
			out = ("@keyframes " + (this.meta.uniqueName) + " \{" + content + "\}");
		} else {
			let sel = this.isKeyFrame ? this.selector : selparser.parse(this.selector,this.options);
			if (this.meta.transform) {
				this.apply('transform',sel);
			};
			
			if (this.meta.transform_complex) {
				this.apply('transform_complex',sel);
			};
			
			if (this.meta.ease) {
				this.apply('ease',sel);
			};
			
			if (this.meta.outline) {
				this.apply('outline',sel);
			};
			
			if (sel && sel.hasTransitionStyles) {
				this.apply('transition',sel);
				if (!(this.meta.ease)) { this.apply('ease',sel) };
			};
			
			if (this.meta.size) {
				for (let $82 = 0, $83 = ['_off_','_out_','_in_'], $84 = $83.length; $82 < $84; $82++) {
					let typ = $83[$82];
					if (sel[typ]) {
						this.apply(("" + typ + "sized"),sel);
					};
				};
			};
			
			// should definitely be able to merge these back together
			// content += indent
			out = (content.match(/[^\n\s]/)) ? selparser.render(sel,content,this.options,o) : "";
			out = indent + out;
		};
		
		o.indent = indent;
		
		if (!(this.parent) && this.ownsel) {
			out = '';
			let ind = indent;// + '\t'
			
			for (let $85 = 0, $86 = iter$__(this.ownsel), $87 = $86.length; $85 < $87; $85++) {
				let layer = $86[$85];
				out += ind + layer + '{\n';
				suffix.push('\n' + ind + '}');
				ind += '\t';
			};
			
			for (let $88 = 0, $89 = iter$__(this.ownrules), $90 = $89.length; $88 < $90; $88++) {
				let ownrule = $89[$88];
				out += ind + ownrule + ' {\n';
				suffix.push('\n' + ind + '}');
				ind += '\t';
				// suffix += '}'
			};
			
			if (content) {
				out += parts.map(function(_0) { return ind + _0; }).join('\n');
			};
			
			if (negIndex$__(this.ownrules,-1) == ':scope') {
				ind = ind.slice(0,-1);
				out += negIndex$__(suffix,-1);
				suffix.pop();
			};
			
			o.indent = ind;
		};
		
		for (let $91 = 0, $92 = iter$__(subrules), $93 = $92.length; $91 < $93; $91++) {
			let subrule = $92[$91];
			out += '\n' + subrule.toString(o);
		};
		
		o.indent = indent;
		out += suffix.toReversed().join('');
		
		return out;
	}
	static { register$(this,c$8,'StyleRule',16) }
};
