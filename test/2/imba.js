(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory();
	else if(typeof define === 'function' && define.amd)
		define([], factory);
	else if(typeof exports === 'object')
		exports["imba"] = factory();
	else
		root["Imba"] = factory();
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

var Imba = __webpack_require__(1);
var activate = false;
var ns = ((typeof window !== 'undefined') ? window : (((typeof global !== 'undefined') ? global : null)));

if (ns && ns.Imba) {
	console.warn(("Imba v" + (ns.Imba.VERSION) + " is already loaded."));
	Imba = ns.Imba;
} else if (ns) {
	ns.Imba = Imba;
	activate = true;
	if (ns.define && ns.define.amd) {
		ns.define("imba",[],function() { return Imba; });
	};
};

module.exports = Imba;

if (true) {
	__webpack_require__(2);
	__webpack_require__(3);
	
	if (activate) {
		Imba.EventManager.activate();
	};
};

if (false) {};


/***/ }),
/* 1 */
/***/ (function(module, exports) {



var Imba = {VERSION: '2.0.0'};


Imba.createElementFactory = function (){
	return function() { return true; };
};

Imba.createTagScope = function (){
	return Imba;
};



Imba.setTimeout = function (delay,block){
	return setTimeout(function() {
		block();
		return Imba.commit();
	},delay);
};



Imba.setInterval = function (interval,block){
	return setInterval(function() {
		block();
		return Imba.commit();
	},interval);
};



Imba.clearInterval = function (id){
	return clearInterval(id);
};



Imba.clearTimeout = function (id){
	return clearTimeout(id);
};


Imba.subclass = function (obj,sup){
	for (let k in sup){
		let v;
		v = sup[k];if (sup.hasOwnProperty(k)) { obj[k] = v };
	};
	
	obj.prototype = Object.create(sup.prototype);
	obj.__super__ = obj.prototype.__super__ = sup.prototype;
	obj.prototype.initialize = obj.prototype.constructor = obj;
	return obj;
};



Imba.iterable = function (o){
	return o ? ((o.toArray ? o.toArray() : o)) : [];
};



Imba.await = function (value){
	if (value instanceof Array) {
		console.warn("await (Array) is deprecated - use await Promise.all(Array)");
		return Promise.all(value);
	} else if (value && value.then) {
		return value;
	} else {
		return Promise.resolve(value);
	};
};

var dashRegex = /-./g;
var setterCache = {};

Imba.toCamelCase = function (str){
	if (str.indexOf('-') >= 0) {
		return str.replace(dashRegex,function(m) { return m.charAt(1).toUpperCase(); });
	} else {
		return str;
	};
};

Imba.toSetter = function (str){
	return setterCache[str] || (setterCache[str] = Imba.toCamelCase('set-' + str));
};

Imba.indexOf = function (a,b){
	return (b && b.indexOf) ? b.indexOf(a) : [].indexOf.call(a,b);
};

Imba.prop = function (scope,name,opts){
	if (scope.defineProperty) {
		return scope.defineProperty(name,opts);
	};
	return;
};

Imba.attr = function (scope,name,opts){
	if(opts === undefined) opts = {};
	if (scope.defineAttribute) {
		return scope.defineAttribute(name,opts);
	};
	
	let getName = Imba.toCamelCase(name);
	let setName = Imba.toCamelCase('set-' + name);
	let proto = scope.prototype;
	
	if (opts.dom) {
		proto[getName] = function() { return this.dom[name]; };
		proto[setName] = function(value) {
			if (value != this[name]()) {
				this.dom[name] = value;
			};
			return this;
		};
	} else {
		proto[getName] = function() { return this.getAttribute(name); };
		proto[setName] = function(value) {
			this.setAttribute(name,value);
			return this;
		};
	};
	return;
};

Imba.getPropertyDescriptor = function (obj,key){
	if (!obj) { return undefined };
	return Object.getOwnPropertyDescriptor(obj,key) || Imba.getPropertyDescriptor(Object.getPrototypeOf(obj),key);
};

Imba.propDidSet = function (object,property,val,prev){
	let fn = property.watch;
	if (fn instanceof Function) {
		fn.call(object,val,prev,property);
	} else if ((typeof fn=='string'||fn instanceof String) && object[fn]) {
		object[fn](val,prev,property);
	};
	return;
};



var emit__ = function(event,args,node) {
	// var node = cbs[event]
	var prev,cb,ret;
	
	while ((prev = node) && (node = node.next)){
		if (cb = node.listener) {
			if (node.path && cb[node.path]) {
				ret = args ? cb[node.path].apply(cb,args) : cb[node.path]();
			} else {
				// check if it is a method?
				ret = args ? cb.apply(node,args) : cb.call(node);
			};
		};
		
		if (node.times && (node.times = node.times - 1) <= 0) {
			prev.next = node.next;
			node.listener = null;
		};
	};
	return;
};


Imba.listen = function (obj,event,listener,path){
	var __listeners___;
	var cbs,list,tail;
	cbs = (__listeners___ = obj.__listeners__) || (obj.__listeners__ = {});
	list = cbs[event] || (cbs[event] = {});
	tail = list.tail || (list.tail = (list.next = {}));
	tail.listener = listener;
	tail.path = path;
	list.tail = tail.next = {};
	return tail;
};


Imba.once = function (obj,event,listener){
	var tail = Imba.listen(obj,event,listener);
	tail.times = 1;
	return tail;
};


Imba.unlisten = function (obj,event,cb,meth){
	var node,prev;
	var meta = obj.__listeners__;
	if (!meta) { return };
	
	if (node = meta[event]) {
		while ((prev = node) && (node = node.next)){
			if (node == cb || node.listener == cb) {
				prev.next = node.next;
				
				node.listener = null;
				break;
			};
		};
	};
	return;
};


Imba.emit = function (obj,event,params){
	var cb;
	if (cb = obj.__listeners__) {
		if (cb[event]) { emit__(event,params,cb[event]) };
		if (cb.all) { emit__(event,[event,params],cb.all) }; 
	};
	return;
};

Imba.observeProperty = function (observer,key,trigger,target,prev){
	if (prev && typeof prev == 'object') {
		Imba.unlisten(prev,'all',observer,trigger);
	};
	if (target && typeof target == 'object') {
		Imba.listen(target,'all',observer,trigger);
	};
	return this;
};

module.exports = Imba;


/***/ }),
/* 2 */
/***/ (function(module, exports, __webpack_require__) {

function iter$(a){ return a ? (a.toArray ? a.toArray() : a) : []; };
var Imba = __webpack_require__(1);

var requestAnimationFrame; 
var cancelAnimationFrame;

if (false) {};

if (true) {
	cancelAnimationFrame = window.cancelAnimationFrame || window.mozCancelAnimationFrame || window.webkitRequestAnimationFrame;
	requestAnimationFrame = window.requestAnimationFrame;
	requestAnimationFrame || (requestAnimationFrame = window.webkitRequestAnimationFrame);
	requestAnimationFrame || (requestAnimationFrame = window.mozRequestAnimationFrame);
	requestAnimationFrame || (requestAnimationFrame = function(blk) { return setTimeout(blk,1000 / 60); });
};

function Ticker(){
	var self = this;
	self.queue = [];
	self.stage = -1;
	self.scheduled = false;
	self.__ticker = function(e) {
		self.scheduled = false;
		return self.tick(e);
	};
	self;
};

Ticker.prototype.add = function (item,force){
	if (force || this.queue.indexOf(item) == -1) {
		this.queue.push(item);
	};
	
	if (!this.scheduled) { return this.schedule() };
};

Ticker.prototype.tick = function (timestamp){
	var items = this.queue;
	if (!this.ts) { this.ts = timestamp };
	this.dt = timestamp - this.ts;
	this.ts = timestamp;
	this.queue = [];
	this.stage = 1;
	this.before();
	if (items.length) {
		for (let i = 0, ary = iter$(items), len = ary.length, item; i < len; i++) {
			item = ary[i];
			if (item instanceof Function) {
				item(this.dt,this);
			} else if (item.tick) {
				item.tick(this.dt,this);
			};
		};
	};
	this.stage = 2;
	this.after();
	this.stage = this.scheduled ? 0 : (-1);
	return this;
};

Ticker.prototype.schedule = function (){
	if (!this.scheduled) {
		this.scheduled = true;
		if (this.stage == -1) {
			this.stage = 0;
		};
		requestAnimationFrame(this.__ticker);
	};
	return this;
};

Ticker.prototype.before = function (){
	return this;
};

Ticker.prototype.after = function (){
	if (Imba.TagManager) {
		Imba.TagManager.refresh();
	};
	return this;
};

Imba.TICKER = new Ticker();
Imba.SCHEDULERS = [];

Imba.ticker = function (){
	return Imba.TICKER;
};

Imba.requestAnimationFrame = function (callback){
	return requestAnimationFrame(callback);
};

Imba.cancelAnimationFrame = function (id){
	return cancelAnimationFrame(id);
};




var commitQueue = 0;

Imba.commit = function (params){
	commitQueue++;
	
	Imba.emit(Imba,'commit',(params != undefined) ? [params] : undefined);
	if (--commitQueue == 0) {
		Imba.TagManager && Imba.TagManager.refresh();
	};
	return;
};



Imba.Scheduler = function Scheduler(target){
	var self = this;
	self.id = counter++;
	self.target = target;
	self.marked = false;
	self.active = false;
	self.marker = function() { return self.mark(); };
	self.ticker = function(e) { return self.tick(e); };
	
	self.dt = 0;
	self.frame = {};
	self.scheduled = false;
	self.timestamp = 0;
	self.ticks = 0;
	self.flushes = 0;
	
	self.onevent = self.onevent.bind(self);
	self;
};

var counter = 0;

Imba.Scheduler.event = function (e){
	return Imba.emit(Imba,'event',e);
};



Imba.Scheduler.prototype.__raf = {watch: 'rafDidSet',name: 'raf'};
Object.defineProperty(Imba.Scheduler.prototype,'raf',{
	configurable: true,
	get: function(){ return this._raf; },
	set: function(v){
		var a = this._raf;
		if(v != a) { this._raf = v; }
		if(v != a) { this.rafDidSet && this.rafDidSet(v,a,this.__raf) }
	}
});
Imba.Scheduler.prototype.__interval = {watch: 'intervalDidSet',name: 'interval'};
Object.defineProperty(Imba.Scheduler.prototype,'interval',{
	configurable: true,
	get: function(){ return this._interval; },
	set: function(v){
		var a = this._interval;
		if(v != a) { this._interval = v; }
		if(v != a) { this.intervalDidSet && this.intervalDidSet(v,a,this.__interval) }
	}
});
Imba.Scheduler.prototype.__events = {watch: 'eventsDidSet',name: 'events'};
Object.defineProperty(Imba.Scheduler.prototype,'events',{
	configurable: true,
	get: function(){ return this._events; },
	set: function(v){
		var a = this._events;
		if(v != a) { this._events = v; }
		if(v != a) { this.eventsDidSet && this.eventsDidSet(v,a,this.__events) }
	}
});
Object.defineProperty(Imba.Scheduler.prototype,'marked',{
	configurable: true,
	get: function(){ return this._marked; },
	set: function(v){ this._marked = v; }
});

Imba.Scheduler.prototype.rafDidSet = function (bool){
	if (bool && this.active) { this.requestTick() };
	return this;
};

Imba.Scheduler.prototype.intervalDidSet = function (time){
	clearInterval(this.intervalId);
	this.intervalId = null;
	if (time && this.active) {
		this.intervalId = setInterval(this.oninterval.bind(this),time);
	};
	return this;
};

Imba.Scheduler.prototype.eventsDidSet = function (new$,prev){
	if (this.active && new$ && !prev) {
		return Imba.listen(Imba,'commit',this,'onevent');
	} else if (!(new$) && prev) {
		return Imba.unlisten(Imba,'commit',this,'onevent');
	};
};













Imba.Scheduler.prototype.configure = function (options){
	if(options === undefined) options = {};
	if (options.raf != undefined) { this.raf = options.raf };
	if (options.interval != undefined) { this.interval = options.interval };
	if (options.events != undefined) { this.events = options.events };
	return this;
};



Imba.Scheduler.prototype.mark = function (){
	this.marked = true;
	if (!this.scheduled) {
		this.requestTick();
	};
	return this;
};



Imba.Scheduler.prototype.flush = function (){
	this.flushes++;
	this.target.tick(this);
	this.marked = false;
	return this;
};



Imba.Scheduler.prototype.tick = function (delta,ticker){
	this.ticks++;
	this.dt = delta;
	
	if (ticker) {
		this.scheduled = false;
	};
	
	this.flush();
	
	if (this.raf && this.active) {
		this.requestTick();
	};
	return this;
};

Imba.Scheduler.prototype.requestTick = function (){
	if (!this.scheduled) {
		this.scheduled = true;
		Imba.TICKER.add(this);
	};
	return this;
};



Imba.Scheduler.prototype.activate = function (immediate){
	if(immediate === undefined) immediate = true;
	if (!this.active) {
		this.active = true;
		this.commit = this.target.commit;
		this.target.commit = function() { return this; };
		this.target && this.target.flag  &&  this.target.flag('scheduled_');
		Imba.SCHEDULERS.push(this);
		
		if (this.events) {
			Imba.listen(Imba,'commit',this,'onevent');
		};
		
		if (this.interval && !this.intervalId) {
			this.intervalId = setInterval(this.oninterval.bind(this),this.interval);
		};
		
		if (immediate) {
			this.tick(0);
		} else if (this.raf) {
			this.requestTick();
		};
	};
	return this;
};



Imba.Scheduler.prototype.deactivate = function (){
	if (this.active) {
		this.active = false;
		this.target.commit = this.commit;
		let idx = Imba.SCHEDULERS.indexOf(this);
		if (idx >= 0) {
			Imba.SCHEDULERS.splice(idx,1);
		};
		
		if (this.events) {
			Imba.unlisten(Imba,'commit',this,'onevent');
		};
		
		if (this.intervalId) {
			clearInterval(this.intervalId);
			this.intervalId = null;
		};
		
		this.target && this.target.unflag  &&  this.target.unflag('scheduled_');
	};
	return this;
};

Imba.Scheduler.prototype.track = function (){
	return this.marker;
};

Imba.Scheduler.prototype.oninterval = function (){
	this.tick();
	Imba.TagManager.refresh();
	return this;
};

Imba.Scheduler.prototype.onevent = function (event){
	if (!this.events || this.marked) { return this };
	
	if (this.events instanceof Function) {
		if (this.events(event,this)) { this.mark() };
	} else if (this.events instanceof Array) {
		if (this.events.indexOf((event && event.type) || event) >= 0) {
			this.mark();
		};
	} else {
		this.mark();
	};
	return this;
};


/***/ }),
/* 3 */
/***/ (function(module, exports, __webpack_require__) {

var Imba = __webpack_require__(1);

__webpack_require__(4);
__webpack_require__(5);

Imba.TagManager = new Imba.TagManagerClass();

__webpack_require__(7);
__webpack_require__(8);
__webpack_require__(6);
__webpack_require__(9);
__webpack_require__(10);

if (true) {
	__webpack_require__(11);
};

if (false) {};


/***/ }),
/* 4 */
/***/ (function(module, exports, __webpack_require__) {

function iter$(a){ return a ? (a.toArray ? a.toArray() : a) : []; };
var Imba = __webpack_require__(1);

Imba.TagManagerClass = function TagManagerClass(){
	this.inserts = 0;
	this.removes = 0;
	this.mounted = [];
	this.mountables = 0;
	this.unmountables = 0;
	this.unmounting = 0;
	this;
};

Imba.TagManagerClass.prototype.insert = function (node,parent){
	this.inserts++;
	if (node && node.mount) { this.regMountable(node) };
	
	
	
	return;
};

Imba.TagManagerClass.prototype.remove = function (node,parent){
	return this.removes++;
};

Object.defineProperty(Imba.TagManagerClass.prototype,'changes',{get: function(){
	return this.inserts + this.removes;
}, configurable: true});

Imba.TagManagerClass.prototype.mount = function (node){
	return;
};

Imba.TagManagerClass.prototype.refresh = function (force){
	if(force === undefined) force = false;
	if (false) {};
	if (!force && this.changes == 0) { return };
	
	if ((this.inserts && this.mountables > this.mounted.length) || force) {
		this.tryMount();
	};
	
	if ((this.removes || force) && this.mounted.length) {
		this.tryUnmount();
	};
	
	this.inserts = 0;
	this.removes = 0;
	return this;
};

Imba.TagManagerClass.prototype.unmount = function (node){
	return this;
};

Imba.TagManagerClass.prototype.regMountable = function (node){
	if (!(node.FLAGS & Imba.TAG_MOUNTABLE)) {
		node.FLAGS |= Imba.TAG_MOUNTABLE;
		return this.mountables++;
	};
};


Imba.TagManagerClass.prototype.tryMount = function (){
	var count = 0;
	var root = document.body;
	var items = root.querySelectorAll('.__mount');
	
	for (let i = 0, ary = iter$(items), len = ary.length, el; i < len; i++) {
		el = ary[i];
		if (el && el.tag) {
			if (this.mounted.indexOf(el.tag) == -1) {
				this.mountNode(el.tag);
			};
		};
	};
	return this;
};

Imba.TagManagerClass.prototype.mountNode = function (node){
	if (this.mounted.indexOf(node) == -1) {
		this.regMountable(node);
		this.mounted.push(node);
		
		node.FLAGS |= Imba.TAG_MOUNTED;
		if (node.mount) { node.mount() };
		
		
		
		
		
	};
	return;
};

Imba.TagManagerClass.prototype.tryUnmount = function (){
	this.unmounting++;
	
	var unmount = [];
	var root = document.body;
	for (let i = 0, items = iter$(this.mounted), len = items.length, item; i < len; i++) {
		item = items[i];
		if (!item) { continue; };
		if (!document.documentElement.contains(item.dom)) {
			unmount.push(item);
			this.mounted[i] = null;
		};
	};
	
	this.unmounting--;
	
	if (unmount.length) {
		this.mounted = this.mounted.filter(function(item) { return item && unmount.indexOf(item) == -1; });
		for (let i = 0, len = unmount.length, item; i < len; i++) {
			item = unmount[i];
			item.FLAGS = item.FLAGS & ~Imba.TAG_MOUNTED;
			if (item.unmount && item.dom) {
				item.unmount();
			} else if (item.scheduler) {
				item.unschedule();
			};
		};
	};
	return this;
};


/***/ }),
/* 5 */
/***/ (function(module, exports, __webpack_require__) {

function iter$(a){ return a ? (a.toArray ? a.toArray() : a) : []; };
var Imba = __webpack_require__(1);
__webpack_require__(6);

var native$ = [
	'keydown','keyup','keypress',
	'textInput','input','change','submit',
	'focusin','focusout','focus','blur',
	'contextmenu','selectstart','dblclick','selectionchange',
	'mousewheel','wheel','scroll',
	'beforecopy','copy','beforepaste','paste','beforecut','cut',
	'dragstart','drag','dragend','dragenter','dragover','dragleave','dragexit','drop',
	'mouseup','mousedown','mouseenter','mouseleave','mouseout','mouseover','mousemove',
	'transitionstart','transitionend','transitioncancel',
	'animationstart','animationiteration','animationend'
];

var initialBind = [];



Imba.EventManager = function EventManager(node,pars){
	var self = this;
	if(!pars||pars.constructor !== Object) pars = {};
	var events = pars.events !== undefined ? pars.events : [];
	self.shimFocusEvents =  true && window.netscape && node.onfocusin === undefined;
	self.root = node;
	self.listeners = [];
	self.delegators = {};
	self.delegator = function(e) {
		self.delegate(e);
		return true;
	};
	
	for (let i = 0, items = iter$(events), len = items.length; i < len; i++) {
		self.register(items[i]);
	};
	
	return self;
};

Imba.EventManager.prototype.__enabled = {'default': false,watch: 'enabledDidSet',name: 'enabled'};
Object.defineProperty(Imba.EventManager.prototype,'enabled',{
	configurable: true,
	get: function(){ return this._enabled; },
	set: function(v){
		var a = this._enabled;
		if(v != a) { this._enabled = v; }
		if(v != a) { this.enabledDidSet && this.enabledDidSet(v,a,this.__enabled) }
	}
});
Imba.EventManager.prototype._enabled = false;

Imba.EventManager.prototype.enabledDidSet = function (bool){
	bool ? this.onenable() : this.ondisable();
	return this;
};

Imba.EventManager.bind = function (name){
	if (Imba.Events) {
		return Imba.Events.autoregister(name);
	} else if (initialBind.indexOf(name) == -1 && native$.indexOf(name) >= 0) {
		return initialBind.push(name);
	};
};

Imba.EventManager.activate = function (){
	var Imba_;
	if (Imba.Events) { return Imba.Events };
	Imba.Events = new Imba.EventManager(Imba.document,{events: []});
	if (false) {};
	
	Imba.POINTER || (Imba.POINTER = new Imba.Pointer());
	
	var hasTouchEvents = window && window.ontouchstart !== undefined;
	
	if (hasTouchEvents) {
		Imba.Events.listen('touchstart',function(e) {
			return Imba.Touch.ontouchstart(e);
		});
		
		Imba.Events.listen('touchmove',function(e) {
			return Imba.Touch.ontouchmove(e);
		});
		
		Imba.Events.listen('touchend',function(e) {
			return Imba.Touch.ontouchend(e);
		});
		
		Imba.Events.listen('touchcancel',function(e) {
			return Imba.Touch.ontouchcancel(e);
		});
	};
	
	Imba.Events.register('click',function(e) {
		// Only for main mousebutton, no?
		if ((e.timeStamp - Imba.Touch.LastTimestamp) > Imba.Touch.TapTimeout) {
			e.imbaSimulatedTap = true;
			var tap = new Imba.Event(e);
			tap.type = 'tap';
			tap.process();
			if (tap.responder && tap.defaultPrevented) {
				return e.preventDefault();
			};
		};
		
		
		return Imba.Events.delegate(e);
	});
	
	Imba.Events.listen('mousedown',function(e) {
		if ((e.timeStamp - Imba.Touch.LastTimestamp) > Imba.Touch.TapTimeout) {
			if (Imba.POINTER) { return Imba.POINTER.update(e).process() };
		};
	});
	
	Imba.Events.listen('mouseup',function(e) {
		if ((e.timeStamp - Imba.Touch.LastTimestamp) > Imba.Touch.TapTimeout) {
			if (Imba.POINTER) { return Imba.POINTER.update(e).process() };
		};
	});
	
	Imba.Events.register(['mousedown','mouseup']);
	Imba.Events.register(initialBind);
	Imba.Events.enabled = true;
	return Imba.Events;
};




Imba.EventManager.prototype.register = function (name,handler){
	if(handler === undefined) handler = true;
	if (name instanceof Array) {
		for (let i = 0, items = iter$(name), len = items.length; i < len; i++) {
			this.register(items[i],handler);
		};
		return this;
	};
	
	if (this.delegators[name]) { return this };
	
	
	var fn = this.delegators[name] = (handler instanceof Function) ? handler : this.delegator;
	if (this.enabled) { return this.root.addEventListener(name,fn,true) };
};

Imba.EventManager.prototype.autoregister = function (name){
	if (native$.indexOf(name) == -1) { return this };
	return this.register(name);
};

Imba.EventManager.prototype.listen = function (name,handler,capture){
	if(capture === undefined) capture = true;
	this.listeners.push([name,handler,capture]);
	if (this.enabled) { this.root.addEventListener(name,handler,capture) };
	return this;
};

Imba.EventManager.prototype.delegate = function (e){
	var event = Imba.Event.wrap(e);
	event.process();
	if (this.shimFocusEvents) {
		if (e.type == 'focus') {
			Imba.Event.wrap(e).setType('focusin').process();
		} else if (e.type == 'blur') {
			Imba.Event.wrap(e).setType('focusout').process();
		};
	};
	return this;
};



Imba.EventManager.prototype.create = function (type,target,pars){
	if(!pars||pars.constructor !== Object) pars = {};
	var data = pars.data !== undefined ? pars.data : null;
	var source = pars.source !== undefined ? pars.source : null;
	var event = Imba.Event.wrap({type: type,target: target});
	if (data != undefined) { event.data = data };
	if (source) { event.source = source };
	return event;
};



Imba.EventManager.prototype.trigger = function (){
	// TODO @create(*arguments) results in bug
	var $0 = arguments, i = $0.length;
	var params = new Array(i>0 ? i : 0);
	while(i>0) params[i-1] = $0[--i];
	return this.create.apply(this,params).process();
};

Imba.EventManager.prototype.onenable = function (){
	for (let o = this.delegators, handler, i = 0, keys = Object.keys(o), l = keys.length, name; i < l; i++){
		name = keys[i];handler = o[name];this.root.addEventListener(name,handler,true);
	};
	
	for (let i = 0, items = iter$(this.listeners), len = items.length, item; i < len; i++) {
		item = items[i];
		this.root.addEventListener(item[0],item[1],item[2]);
	};
	
	if (true) {
		window.addEventListener('hashchange',Imba.commit);
		window.addEventListener('popstate',Imba.commit);
	};
	return this;
};

Imba.EventManager.prototype.ondisable = function (){
	for (let o = this.delegators, handler, i = 0, keys = Object.keys(o), l = keys.length, name; i < l; i++){
		name = keys[i];handler = o[name];this.root.removeEventListener(name,handler,true);
	};
	
	for (let i = 0, items = iter$(this.listeners), len = items.length, item; i < len; i++) {
		item = items[i];
		this.root.removeEventListener(item[0],item[1],item[2]);
	};
	
	if (true) {
		window.removeEventListener('hashchange',Imba.commit);
		window.removeEventListener('popstate',Imba.commit);
	};
	
	return this;
};


/***/ }),
/* 6 */
/***/ (function(module, exports, __webpack_require__) {



var Imba = __webpack_require__(1);

Imba.Pointer = function Pointer(){
	this.button = -1;
	this.event = {x: 0,y: 0,type: 'uninitialized'};
	return this;
};

Imba.Pointer.prototype.button = function (){
	return this.button;
};

Imba.Pointer.prototype.touch = function (){
	return this.touch;
};

Imba.Pointer.prototype.update = function (e){
	this.event = e;
	this.dirty = true;
	return this;
};


Imba.Pointer.prototype.process = function (){
	var e1 = this.event;
	
	if (this.dirty) {
		this.prevEvent = e1;
		this.dirty = false;
		
		
		if (e1.type == 'mousedown') {
			this.button = e1.button;
			
			if ((this.touch && this.button != 0)) {
				return;
			};
			
			
			if (this.touch) { this.touch.cancel };
			this.touch = new Imba.Touch(e1,this);
			this.touch.mousedown(e1,e1);
		} else if (e1.type == 'mousemove') {
			if (this.touch) { this.touch.mousemove(e1,e1) };
		} else if (e1.type == 'mouseup') {
			this.button = -1;
			
			if (this.touch && this.touch.button == e1.button) {
				this.touch.mouseup(e1,e1);
				this.touch = null;
			};
			
		};
	} else if (this.touch) {
		this.touch.idle;
	};
	return this;
};

Imba.Pointer.prototype.x = function (){
	return this.event.x;
};
Imba.Pointer.prototype.y = function (){
	return this.event.y;
};


/***/ }),
/* 7 */
/***/ (function(module, exports, __webpack_require__) {

function iter$(a){ return a ? (a.toArray ? a.toArray() : a) : []; };
var Imba = __webpack_require__(1);



Imba.CSSKeyMap = {};

Imba.TAG_BUILT = 1;
Imba.TAG_SETUP = 2;
Imba.TAG_MOUNTING = 4;
Imba.TAG_MOUNTED = 8;
Imba.TAG_SCHEDULED = 16;
Imba.TAG_AWAKENED = 32;
Imba.TAG_MOUNTABLE = 64;
Imba.TAG_AUTOCLASS_GLOBALS = true;
Imba.TAG_AUTOCLASS_LOCALS = true;
Imba.TAG_AUTOCLASS_SVG = true;



if (true) {
	Imba.document = window.document;
};

Imba.static = function (items,typ,nr){
	items.type = typ;
	items.static = nr;
	return items;
};



Imba.mount = function (node,into){
	into || (into = Imba.document.body);
	into.appendChild(node.dom);
	Imba.TagManager.insert(node,into);
	node.scheduler.configure({events: true}).activate(false);
	Imba.TagManager.refresh();
	return node;
};


Imba.createTextNode = function (node){
	if (node && node.nodeType == 3) {
		return node;
	};
	return Imba.document.createTextNode(node);
};





Imba.Tag = function Tag(dom,parent){
	this.dom = dom;
	dom.tag = this;
	this.slot_ = dom;
	this.__tree_ = null; 
	this.__slots_ = [];
	this.__parent_ = parent;
	this.$ = {};
	this.FLAGS = 0;
	this.build();
	this;
};

Imba.Tag.buildNode = function (){
	var dom = Imba.document.createElement(this.nodeType || 'div');
	
	if (this.classes_) {
		var cls = this.classes_.join(" ");
		if (cls) { dom.className = cls };
	};
	return dom;
};

Imba.Tag.createNode = function (){
	var proto = (this.protoDom || (this.protoDom = this.buildNode()));
	return proto.cloneNode(false);
};

Imba.Tag.build = function (ctx){
	return new this(this.createNode(),ctx);
};

Imba.Tag.dom = function (){
	return this.protoDom || (this.protoDom = this.buildNode());
};

Imba.Tag.end = function (){
	return this.commit(0);
};



Imba.Tag.inherit = function (child){
	child.protoDom = null;
	
	if (this.nodeType) {
		child.nodeType = this.nodeType;
		child.classes_ = this.classes_.slice(0);
		
		if (child.flagName) {
			return child.classes_.push(child.flagName);
		};
	} else {
		child.nodeType = child.tagName;
		child.flagName = null;
		return child.classes_ = [];
	};
};



Imba.Tag.prototype.optimizeTagStructure = function (){
	if (false) {};
	var ctor = this.constructor;
	let keys = Object.keys(this);
	
	if (keys.indexOf('mount') >= 0) {
		if (ctor.classes_ && ctor.classes_.indexOf('__mount') == -1) {
			ctor.classes_.push('__mount');
		};
		
		if (ctor.protoDom) {
			ctor.protoDom.classList.add('__mount');
		};
	};
	
	for (let i = 0, items = iter$(keys), len = items.length, key; i < len; i++) {
		key = items[i];
		if ((/^on/).test(key)) { Imba.EventManager.bind(key.slice(2)) };
	};
	return this;
};


Object.defineProperty(Imba.Tag.prototype,'root',{get: function(){
	return this.__parent_ ? this.__parent_.root : this;
}, configurable: true});





Imba.Tag.prototype.setData = function (data){
	this.data = data;
	return this;
};






Imba.Tag.prototype.bindData = function (target,path,args){
	return this.data = args ? target[path].apply(target,args) : target[path];
};



Imba.Tag.prototype.setHtml = function (html){
	if (this.html != html) {
		this.dom.innerHTML = html;
	};
	return this;
};



Imba.Tag.prototype.html = function (){
	return this.dom.innerHTML;
};

Imba.Tag.prototype.on$ = function (slot,handler,context){
	let handlers = this.on_ || (this.on_ = []);
	let prev = handlers[slot];
	
	if (slot < 0) {
		if (prev == undefined) {
			slot = handlers[slot] = handlers.length;
		} else {
			slot = prev;
		};
		prev = handlers[slot];
	};
	
	handlers[slot] = handler;
	if (prev) {
		handler.state = prev.state;
	} else {
		handler.state = {context: context};
		if (true) { Imba.EventManager.bind(handler[0]) };
	};
	return this;
};


Imba.Tag.prototype.setAttribute = function (name,value){
	var old = this.dom.getAttribute(name);
	
	if (old == value) {
		value;
	} else if (value != null && value !== false) {
		this.dom.setAttribute(name,value);
	} else {
		this.dom.removeAttribute(name);
	};
	return this;
};

Imba.Tag.prototype.setNestedAttr = function (ns,name,value,modifiers){
	if (this[ns + 'SetAttribute']) {
		this[ns + 'SetAttribute'](name,value,modifiers);
	} else {
		this.setAttributeNS(ns,name,value);
	};
	return this;
};

Imba.Tag.prototype.setAttributeNS = function (ns,name,value){
	var old = this.getAttributeNS(ns,name);
	
	if (old != value) {
		if (value != null && value !== false) {
			this.dom.setAttributeNS(ns,name,value);
		} else {
			this.dom.removeAttributeNS(ns,name);
		};
	};
	return this;
};




Imba.Tag.prototype.removeAttribute = function (name){
	return this.dom.removeAttribute(name);
};



Imba.Tag.prototype.getAttribute = function (name){
	return this.dom.getAttribute(name);
};

Imba.Tag.prototype.getAttributeNS = function (ns,name){
	return this.dom.getAttributeNS(ns,name);
};


Imba.Tag.prototype.set = function (key,value,mods){
	// should somehow cache the setter lookup
	// so that we don't need to do it multiple times
	let cachedSetter = this.$[key];
	
	if (cachedSetter instanceof Function) {
		cachedSetter.call(this,value,mods);
		return this;
	} else if (cachedSetter) {
		this.dom[key] = value;
		return this;
	};
	
	let descriptor = Imba.getPropertyDescriptor(this,key);
	
	if (descriptor && descriptor.set) {
		this.$[key] = descriptor.set;
		descriptor.set.call(this,value,mods);
	} else {
		this.$[key] = true;
		let setter = Imba.toSetter(key);
		if (this[setter] instanceof Function) {
			this[setter](value,mods);
		} else {
			this.dom[key] = value;
		};
	};
	return this;
};


Imba.Tag.prototype.get = function (key){
	return this.dom.getAttribute(key);
};



Imba.Tag.prototype.setContent = function (content,type){
	this.setChildren(content,type);
	return this;
};



Imba.Tag.prototype.setChildren = function (nodes,type){
	// overridden on client by reconciler
	this.__tree_ = nodes;
	return this;
};



Imba.Tag.prototype.setTemplate = function (template){
	if (!this.__template) {
		if (this.render == Imba.Tag.prototype.render) {
			this.render = this.renderTemplate;
		};
	};
	
	this.template = this.__template = template;
	return this;
};



Imba.Tag.prototype.renderTemplate = function (){
	var body = this.template();
	if (body != this) { this.setChildren(body) };
	return this;
};




Imba.Tag.prototype.removeChild = function (child){
	var par = this.dom;
	var el = child.slot_ || child;
	if (el && el.parentNode == par) {
		Imba.TagManager.remove(el.tag || el,this);
		par.removeChild(el);
	};
	return this;
};



Imba.Tag.prototype.removeAllChildren = function (){
	if (this.dom.firstChild) {
		var el;
		while (el = this.dom.firstChild){
			 true && Imba.TagManager.remove(el.tag || el,this);
			this.dom.removeChild(el);
		};
	};
	this.__tree_ = this.__text_ = null;
	return this;
};



Imba.Tag.prototype.appendChild = function (node){
	if ((typeof node=='string'||node instanceof String)) {
		this.dom.appendChild(Imba.document.createTextNode(node));
	} else if (node) {
		this.dom.appendChild(node.slot_ || node);
		Imba.TagManager.insert(node.tag || node,this);
		
	};
	return this;
};



Imba.Tag.prototype.insertBefore = function (node,rel){
	if ((typeof node=='string'||node instanceof String)) {
		node = Imba.document.createTextNode(node);
	};
	
	if (node && rel) {
		this.dom.insertBefore((node.slot_ || node),(rel.slot_ || rel));
		Imba.TagManager.insert(node.tag || node,this);
		
	};
	return this;
};

Imba.Tag.prototype.detachFromParent = function (){
	var placeholder__, tag_;
	if (this.slot_ == this.dom) {
		this.slot_ = ((placeholder__ = this.dom.placeholder_) || (this.dom.placeholder_ = Imba.document.createComment("node")));
		(tag_ = this.slot_.tag) || (this.slot_.tag = this);
		
		if (this.dom.parentNode) {
			Imba.TagManager.remove(this,this.dom.parentNode);
			this.dom.parentNode.replaceChild(this.slot_,this.dom);
		};
	};
	return this;
};

Imba.Tag.prototype.attachToParent = function (){
	if (this.slot_ != this.dom) {
		let prev = this.slot_;
		this.slot_ = this.dom;
		if (prev && prev.parentNode) {
			Imba.TagManager.insert(this);
			prev.parentNode.replaceChild(this.dom,prev);
		};
	};
	return this;
};



Imba.Tag.prototype.orphanize = function (){
	var par;
	if (par = this.parent) { par.removeChild(this) };
	return this;
};



Object.defineProperty(Imba.Tag.prototype,'text',{get: function(v){
	return this.dom.textContent;
}, configurable: true});









Imba.Tag.prototype.setText = function (txt){
	this.text = txt;
	return this;
};




Imba.Tag.prototype.dataset = function (key,val){
	if (key instanceof Object) {
		for (let v, i = 0, keys = Object.keys(key), l = keys.length, k; i < l; i++){
			k = keys[i];v = key[k];this.dataset(k,v);
		};
		return this;
	};
	
	if (arguments.length == 2) {
		this.setAttribute(("data-" + key),val);
		return this;
	};
	
	if (key) {
		return this.getAttribute(("data-" + key));
	};
	
	var dataset = this.dom.dataset;
	
	if (!dataset) {
		dataset = {};
		for (let i = 0, items = iter$(this.dom.attributes), len = items.length, atr; i < len; i++) {
			atr = items[i];
			if (atr.name.substr(0,5) == 'data-') {
				dataset[Imba.toCamelCase(atr.name.slice(5))] = atr.value;
			};
		};
	};
	
	return dataset;
};



Imba.Tag.prototype.render = function (){
	return this;
};



Imba.Tag.prototype.build = function (){
	return this;
};



Imba.Tag.prototype.setup = function (){
	return this;
};



Imba.Tag.prototype.commit = function (){
	if (this.beforeRender() !== false) { this.render() };
	return this;
};

Imba.Tag.prototype.beforeRender = function (){
	return this;
};



Imba.Tag.prototype.tick = function (){
	if (this.beforeRender() !== false) { this.render() };
	return this;
};



Imba.Tag.prototype.end = function (){
	this.setup();
	this.commit(0);
	this.end = Imba.Tag.end;
	return this;
};


Imba.Tag.prototype.$open = function (context){
	if (context != this.__context_) {
		this.__tree_ = null;
		this.__context_ = context;
	};
	return this;
};



Imba.Tag.prototype.synced = function (){
	return this;
};




Imba.Tag.prototype.awaken = function (){
	return this;
};



Object.defineProperty(Imba.Tag.prototype,'flags',{get: function(){
	return this.dom.classList;
}, configurable: true});



Imba.Tag.prototype.flag = function (name,toggler){
	// it is most natural to treat a second undefined argument as a no-switch
	// so we need to check the arguments-length
	if (arguments.length == 2) {
		if (this.dom.classList.contains(name) != !!toggler) {
			this.dom.classList.toggle(name);
		};
	} else {
		// firefox will trigger a change if adding existing class
		if (!this.dom.classList.contains(name)) { this.dom.classList.add(name) };
	};
	return this;
};



Imba.Tag.prototype.unflag = function (name){
	this.dom.classList.remove(name);
	return this;
};



Imba.Tag.prototype.toggleFlag = function (name){
	this.dom.classList.toggle(name);
	return this;
};



Imba.Tag.prototype.hasFlag = function (name){
	return this.dom.classList.contains(name);
};


Imba.Tag.prototype.flagIf = function (flag,bool){
	this.dom.classList.toggle(flag,bool);
	return this;
};



Imba.Tag.prototype.setFlag = function (name,value){
	let flags = this.__namedFlags_ || (this.__namedFlags_ = {});
	let prev = flags[name];
	if (prev != value) {
		if (prev) { this.unflag(prev) };
		if (value) { this.flag(value) };
		flags[name] = value;
	};
	return this;
};




Object.defineProperty(Imba.Tag.prototype,'scheduler',{get: function(){
	return (this.__scheduler == null) ? (this.__scheduler = new Imba.Scheduler(this)) : this.__scheduler;
}, configurable: true});



Imba.Tag.prototype.schedule = function (options){
	if(options === undefined) options = {events: true};
	this.scheduler.configure(options).activate();
	return this;
};



Imba.Tag.prototype.unschedule = function (){
	if (this.__scheduler) { this.scheduler.deactivate() };
	return this;
};




Object.defineProperty(Imba.Tag.prototype,'parent',{get: function(){
	return Imba.getTagForDom(this.dom.parentNode);
}, configurable: true});



Imba.Tag.prototype.children = function (sel){
	let res = [];
	for (let i = 0, items = iter$(this.dom.children), len = items.length, item; i < len; i++) {
		item = items[i];
		res.push(item.tag || Imba.getTagForDom(item));
	};
	return res;
};

Imba.Tag.prototype.querySelector = function (q){
	return Imba.getTagForDom(this.dom.querySelector(q));
};

Imba.Tag.prototype.querySelectorAll = function (q){
	var items = [];
	for (let i = 0, ary = iter$(this.dom.querySelectorAll(q)), len = ary.length; i < len; i++) {
		items.push(Imba.getTagForDom(ary[i]));
	};
	return items;
};



Imba.Tag.prototype.matches = function (sel){
	var fn;
	if (sel instanceof Function) {
		return sel(this);
	};
	
	if (sel.query instanceof Function) { sel = sel.query() }; 
	if (fn = (this.dom.matches || this.dom.matchesSelector || this.dom.webkitMatchesSelector || this.dom.msMatchesSelector || this.dom.mozMatchesSelector)) {
		return fn.call(this.dom,sel);
	};
};



Imba.Tag.prototype.closest = function (sel){
	return Imba.getTagForDom(this.dom.closest(sel));
};



Imba.Tag.prototype.contains = function (node){
	return this.dom.contains(node.dom || node);
};




Imba.Tag.prototype.log = function (){
	var $0 = arguments, i = $0.length;
	var args = new Array(i>0 ? i : 0);
	while(i>0) args[i-1] = $0[--i];
	args.unshift(console);
	Function.prototype.call.apply(console.log,args);
	return this;
};

Imba.Tag.prototype.css = function (key,val,mod){
	if (key instanceof Object) {
		for (let v, i = 0, keys = Object.keys(key), l = keys.length, k; i < l; i++){
			k = keys[i];v = key[k];this.css(k,v);
		};
		return this;
	};
	
	var name = Imba.CSSKeyMap[key] || key;
	
	if (val == null) {
		this.dom.style.removeProperty(name);
	} else if (val == undefined && arguments.length == 1) {
		return this.dom.style[name];
	} else if (name.match(/^--/)) {
		this.dom.style.setProperty(name,val);
	} else {
		// TODO remove for v2
		if ((typeof val=='number'||val instanceof Number) && (name.match(/width|height|left|right|top|bottom/) || (mod && mod.px))) {
			this.dom.style[name] = val + "px";
		} else {
			this.dom.style[name] = val;
		};
	};
	return this;
};

Imba.Tag.prototype.setStyle = function (style){
	return this.setAttribute('style',style);
};

Imba.Tag.prototype.style = function (){
	return this.getAttribute('style');
};



Imba.Tag.prototype.trigger = function (name,data){
	if(data === undefined) data = {};
	return  true && Imba.Events.trigger(name,this,{data: data});
};



Imba.Tag.prototype.focus = function (){
	this.dom.focus();
	return this;
};



Imba.Tag.prototype.blur = function (){
	this.dom.blur();
	return this;
};

Imba.Tag.prototype.toString = function (){
	return this.dom.outerHTML;
};

Object.defineProperty(Imba.Tag.prototype,'outerHTML',{get: function(){
	return this.dom.outerHTML;
}, configurable: true});

Object.defineProperty(Imba.Tag.prototype,'innerHTML',{get: function(){
	return this.dom.innerHTML;
}, configurable: true});

Imba.Tag.prototype.render_ = function (item,index){
	if (true) {
		var prev = this.__slots_[index];
		var node = item;
		
		
		if (prev === undefined) {
			if (item instanceof TagFragment) {
				// console.log "rendering TagFragment"
				// what if this is the same tag fragment as before?
				// should probably just add it manually?
				item.insertInto(this,index,this.__slots_);
				
			};
			
			if (item.dom instanceof Element) {
				this.dom.appendChild(item.dom);
			} else if (typeof item == 'string' || typeof item == 'number') {
				this.dom.appendChild(node = document.createTextNode(item));
			};
		} else {
			// need to check if this is a magic slot or not?
			if (prev instanceof Text) {
				prev.textContent = item;
				return;
			};
		};
		
		return this.__slots_[index] = node;
	};
};


Imba.Tag.prototype.initialize = Imba.Tag;

Imba.SVGTag = function SVGTag(){ return Imba.Tag.apply(this,arguments) };

Imba.subclass(Imba.SVGTag,Imba.Tag);
Imba.SVGTag.namespaceURI = function (){
	return "http://www.w3.org/2000/svg";
};

Imba.SVGTag.buildNode = function (){
	var dom = Imba.document.createElementNS(this.namespaceURI(),this.nodeType);
	if (this.classes_) {
		var cls = this.classes_.join(" ");
		if (cls) { dom.className.baseVal = cls };
	};
	return dom;
};

Imba.SVGTag.inherit = function (child){
	child.protoDom = null;
	
	if (this == Imba.SVGTag) {
		child.nodeType = child.tagName;
		return child.classes_ = [];
	} else {
		child.nodeType = this.nodeType;
		var classes = (this.classes_ || []).slice(0);
		if (Imba.TAG_AUTOCLASS_SVG && child.flagName) {
			classes.push(child.flagName);
		};
		return child.classes_ = classes;
	};
};


Imba.HTML_TAGS = "a abbr address area article aside audio b base bdi bdo big blockquote body br button canvas caption cite code col colgroup data datalist dd del details dfn div dl dt em embed fieldset figcaption figure footer form h1 h2 h3 h4 h5 h6 head header hr html i iframe img input ins kbd keygen label legend li link main map mark menu menuitem meta meter nav noscript object ol optgroup option output p param pre progress q rp rt ruby s samp script section select small source span strong style sub summary sup table tbody td textarea tfoot th thead time title tr track u ul var video wbr".split(" ");
Imba.HTML_TAGS_UNSAFE = "article aside header section".split(" ");

Imba.HTML_ATTRS = {
	a: "href target hreflang media download rel type ping referrerpolicy",
	audio: "autoplay controls crossorigin loop muted preload src",
	area: "alt coords download href hreflang ping referrerpolicy rel shape target",
	base: "href target",
	video: "autoplay buffered controls crossorigin height loop muted preload poster src width playsinline",
	fieldset: "disabled form name",
	form: "method action enctype autocomplete target",
	button: "autofocus type form formaction formenctype formmethod formnovalidate formtarget value name",
	embed: "height src type width",
	input: "accept disabled form list max maxlength min minlength pattern required size step type",
	label: "accesskey for form",
	img: "alt src srcset crossorigin decoding height importance intrinsicsize ismap referrerpolicy sizes width usemap",
	link: "rel type href media",
	iframe: "allow allowfullscreen allowpaymentrequest height importance name referrerpolicy sandbox src srcdoc width frameborder align longdesc scrolling",
	meta: "property content charset desc http-equiv color-scheme name scheme",
	map: "name",
	optgroup: "label",
	option: "label",
	output: "for form",
	object: "type data width height",
	param: "name type value valuetype",
	progress: "max",
	script: "src type async defer crossorigin integrity nonce language nomodule",
	select: "size form multiple",
	source: "sizes src srcset type media",
	textarea: "rows cols minlength maxlength form wrap",
	track: "default kind label src srclang",
	td: "colspan rowspan headers",
	th: "colspan rowspan"
};


Imba.HTML_PROPS = {
	input: "autofocus autocomplete autocapitalize autocorrect value placeholder required disabled multiple checked readOnly spellcheck",
	textarea: "autofocus autocomplete autocapitalize autocorrect value placeholder required disabled multiple checked readOnly spellcheck",
	form: "novalidate",
	fieldset: "disabled",
	button: "disabled",
	select: "autofocus disabled required readOnly multiple",
	option: "disabled selected value",
	optgroup: "disabled",
	progress: "value",
	fieldset: "disabled",
	canvas: "width height"
};

var extender = function(obj,sup) {
	for (let v, i = 0, keys = Object.keys(sup), l = keys.length, k; i < l; i++){
		k = keys[i];v = sup[k];(obj[k] == null) ? (obj[k] = v) : obj[k];
	};
	
	obj.prototype = Object.create(sup.prototype);
	obj.__super__ = obj.prototype.__super__ = sup.prototype;
	obj.prototype.constructor = obj;
	if (sup.inherit) { sup.inherit(obj) };
	
	
	return obj;
};



function Tag(){
	return function(dom,ctx) {
		this.initialize(dom,ctx);
		return this;
	};
};

Imba.Tags = function Tags(){
	this;
};

Imba.Tags.prototype.__clone = function (ns){
	var clone = Object.create(this);
	clone.parent = this;
	return clone;
};

Imba.Tags.prototype.ns = function (name){
	return this['_' + name.toUpperCase()] || this.defineNamespace(name);
};

Imba.Tags.prototype.defineNamespace = function (name){
	var clone = Object.create(this);
	clone.parent = this;
	clone.ns = name;
	this['_' + name.toUpperCase()] = clone;
	return clone;
};

Imba.Tags.prototype.baseType = function (name,ns){
	return (Imba.indexOf(name,Imba.HTML_TAGS) >= 0) ? 'element' : 'div';
};

Imba.Tags.prototype.defineTag = function (o,fullName,supr,body){
	var classes__;
	if(body==undefined && typeof supr == 'function') body = supr,supr = '';
	if(supr==undefined) supr = '';
	if (body && body.nodeType) {
		supr = body;
		body = null;
	};
	
	if (this[fullName]) {
		console.log("tag already exists?",fullName);
	};
	
	
	var ns;
	var name = fullName;
	let nsidx = name.indexOf(':');
	if (nsidx >= 0) {
		ns = fullName.substr(0,nsidx);
		name = fullName.substr(nsidx + 1);
		if (ns == 'svg' && !supr) {
			supr = 'svg:element';
		};
	};
	
	supr || (supr = this.baseType(fullName));
	
	let supertype = ((typeof supr=='string'||supr instanceof String)) ? this.findTagType(supr) : supr;
	let tagtype = Tag();
	
	tagtype.tagName = name;
	tagtype.flagName = null;
	
	if (name[0] == '#') {
		Imba.SINGLETONS[name.slice(1)] = tagtype;
		this[name] = tagtype;
	} else if (name[0] == name[0].toUpperCase()) {
		if (Imba.TAG_AUTOCLASS_LOCALS) {
			tagtype.flagName = name;
		};
	} else {
		if (Imba.TAG_AUTOCLASS_GLOBALS) {
			tagtype.flagName = "_" + fullName.replace(/[_\:]/g,'-');
		};
		this[fullName] = tagtype;
	};
	
	extender(tagtype,supertype);
	
	if ((o && o.scope && o.scope.flags)) {
		(classes__ = tagtype.classes_).push.apply(classes__,o.scope.flags);
	};
	
	if (body) {
		body.call(tagtype,tagtype,tagtype.TAGS || this);
		if (tagtype.defined) { tagtype.defined() };
		this.optimizeTag(tagtype);
	};
	return tagtype;
};

Imba.Tags.prototype.extendTag = function (o,name,supr,body){
	if(body==undefined && typeof supr == 'function') body = supr,supr = '';
	if(supr==undefined) supr = '';
	var klass = (((typeof name=='string'||name instanceof String)) ? this.findTagType(name) : name);
	
	if (body) { body && body.call(klass,klass,klass.prototype) };
	if (klass.extended) { klass.extended() };
	this.optimizeTag(klass);
	return klass;
};

Imba.Tags.prototype.optimizeTag = function (tagtype){
	var prototype_;
	return (prototype_ = tagtype.prototype) && prototype_.optimizeTagStructure  &&  prototype_.optimizeTagStructure();
};

Imba.Tags.prototype.findTagType = function (type){
	let klass = this[type];
	if (!klass) {
		if (type.substr(0,4) == 'svg:') {
			klass = this.defineTag(null,type,'svg:element');
		} else if (Imba.HTML_TAGS.indexOf(type) >= 0) {
			klass = this.defineTag(null,type,'element');
			
			
			
			
			
			
			
			
		};
	};
	
	return klass;
};

Imba.createElement = function (name,parent,index,flags,text){
	var type = name;
	
	if (name instanceof Function) {
		type = name;
	} else {
		
		type = Imba.TAGS.findTagType(name);
		if (null) {};
	};
	
	var node = type.build(parent);
	
	if (flags) {
		// need to include the base classnames for tag as well
		node.dom.className = flags;
	};
	
	if (text !== null) {
		// escape on server?
		node.dom.textContent = text;
	};
	
	
	if (parent && index != null && (parent instanceof Imba.Tag)) {
		parent.render_(node,index);
	};
	
	
	return node;
};

Imba.createElementFactory = function (ns){
	if (!ns) { return Imba.createElement };
	
	return function(name,ctx,ref,pref) {
		var node = Imba.createElement(name,ctx,ref,pref);
		node.dom.classList.add('_' + ns);
		return node;
	};
};

Imba.createTagScope = function (ns){
	return new TagScope(ns);
};

Imba.createTagCache = function (owner){
	var item = [];
	item.tag = owner;
	return item;
};

Imba.createFragment = function (type,parent,slot,options){
	if (type == 2) {
		return new KeyedTagFragment(parent,slot,options);
	} else if (type == 1) {
		return new IndexedTagFragment(parent,slot,options);
	};
};

Imba.createTagList = function (ctx,ref,pref){
	var node = [];
	node.type = 4;
	node.tag = ((pref != undefined) ? pref : ctx.tag);
	ctx[ref] = node;
	return node;
};


function TagCache(owner){
	this.tag = owner;
	this;
};
TagCache.build = function (owner){
	var item = [];
	item.tag = owner;
	return item;
};




function TagFragment(){ };

exports.TagFragment = TagFragment; // export class 


function KeyedTagFragment(parent,slot){
	this.parent = parent;
	this.slot = slot;
	this.$ = {}; 
	this.array = [];
	this.prev = [];
	this.index = 0;
	this.taglen = 0;
	this.starter = Imba.document.createComment('');
	this.reconciled = false;
};

Imba.subclass(KeyedTagFragment,TagFragment);
exports.KeyedTagFragment = KeyedTagFragment; // export class 
KeyedTagFragment.prototype.reset = function (){
	this.index = 0;
	var curr = this.array;
	this.array = this.prev;
	this.prev = curr;
	this.prev.taglen = this.taglen;
	this.index = 0;
	
	return this;
};

KeyedTagFragment.prototype.$iter = function (){
	return this.reset();
};

KeyedTagFragment.prototype.prune = function (items){
	return this;
};

KeyedTagFragment.prototype.push = function (item){
	let prev = this.prev[this.index];
	this.array[this.index] = item;
	this.index++;
	return;
};

KeyedTagFragment.prototype.insertInto = function (parent,index){
	// console.log "inserting into!!",parent,index
	var fragment = Imba.document.createDocumentFragment();
	var i = 0;
	var len = this.index;
	while (i < len){
		let item = this.array[i++];
		fragment.appendChild(item.dom);
	};
	
	parent.dom.appendChild(fragment);
	return this;
};

KeyedTagFragment.prototype.reconcile = function (parent,siblings,index){
	console.log("reconciling fragment!",this);
	
	return this;
};

Object.defineProperty(KeyedTagFragment.prototype,'length',{get: function(){
	return this.taglen;
}, configurable: true});

function IndexedTagFragment(parent,slot){
	this.parent = parent;
	this.$ = [];
	this.length = 0;
};

Imba.subclass(IndexedTagFragment,TagFragment);
exports.IndexedTagFragment = IndexedTagFragment; // export class 
IndexedTagFragment.prototype.push = function (item,idx){
	this.$[idx] = item;
	return;
};

IndexedTagFragment.prototype.reconcile = function (len){
	let from = this.length;
	if (from == len) { return };
	let array = this.$;
	
	if (from > len) {
		// items should have been added automatically
		while (from > len){
			var item = array[--from];
			this.removeChild(item,from);
		};
	} else if (len > from) {
		while (len > from){
			let node = array[from++];
			this.appendChild(node,from - 1);
		};
	};
	this.length = len;
	return;
};

IndexedTagFragment.prototype.insertInto = function (parent,slot){
	return this;
};

IndexedTagFragment.prototype.appendChild = function (item,index){
	this.parent.appendChild(item);
	return;
};

IndexedTagFragment.prototype.removeChild = function (item,index){
	let dom = item.slot_;
	dom.parentNode.removeChild(dom);
	return;
};

function TagScope(ns){
	this.ns = ns;
	this.flags = ns ? ['_' + ns] : [];
};

TagScope.prototype.defineTag = function (name,supr,body){
	if(body==undefined && typeof supr == 'function') body = supr,supr = '';
	if(supr==undefined) supr = '';
	return Imba.TAGS.defineTag({scope: this},name,supr,body);
};

TagScope.prototype.extendTag = function (name,body){
	return Imba.TAGS.extendTag({scope: this},name,body);
};

Imba.TagCache = TagCache;
Imba.SINGLETONS = {};
Imba.TAGS = new Imba.Tags();
Imba.TAGS.element = Imba.TAGS.htmlelement = Imba.Tag;
Imba.TAGS['svg:element'] = Imba.SVGTag;

Imba.attr(Imba.Tag,'is');

Imba.defineTag = function (name,supr,body){
	if(body==undefined && typeof supr == 'function') body = supr,supr = '';
	if(supr==undefined) supr = '';
	return Imba.TAGS.defineTag({},name,supr,body);
};

Imba.extendTag = function (name,body){
	return Imba.TAGS.extendTag({},name,body);
};


Imba.getTagSingleton = function (id){
	var klass;
	var dom,node;
	
	if (klass = Imba.SINGLETONS[id]) {
		if (klass && klass.Instance) { return klass.Instance };
		
		
		if (dom = Imba.document.getElementById(id)) {
			// we have a live instance - when finding it through a selector we should awake it, no?
			// console.log('creating the singleton from existing node in dom?',id,type)
			node = klass.Instance = new klass(dom);
			node.awaken(dom); 
			return node;
		};
		
		dom = klass.createNode();
		dom.id = id;
		node = klass.Instance = new klass(dom);
		node.end().awaken(dom);
		return node;
	} else if (dom = Imba.document.getElementById(id)) {
		return Imba.getTagForDom(dom);
	};
};

var svgSupport = typeof SVGElement !== 'undefined';


Imba.getTagForDom = function (dom){
	if (!dom) { return null };
	if (dom.dom) { return dom };
	if (dom.tag) { return dom.tag };
	if (!dom.nodeName) { return null };
	
	var name = dom.nodeName.toLowerCase();
	var type = name;
	var ns = Imba.TAGS;
	
	
	if (dom.id && Imba.SINGLETONS[dom.id]) {
		return Imba.getTagSingleton(dom.id);
	};
	
	if (svgSupport && (dom instanceof SVGElement)) {
		type = ns.findTagType("svg:" + name);
	} else if (Imba.HTML_TAGS.indexOf(name) >= 0) {
		type = ns.findTagType(name);
	} else {
		type = Imba.Tag;
	};
	
	return new type(dom,null).awaken(dom);
};


if (false) { var camelCase, unprefixed, styles; };

Imba.Tag;


/***/ }),
/* 8 */
/***/ (function(module, exports, __webpack_require__) {

function iter$(a){ return a ? (a.toArray ? a.toArray() : a) : []; };
var Imba = __webpack_require__(1);

Imba.createTagScope(/*SCOPEID*/).defineTag('fragment', 'element', function(tag){
	tag.createNode = function (){
		return Imba.document.createDocumentFragment();
	};
});

Imba.createTagScope(/*SCOPEID*/).extendTag('html', function(tag){
	tag.prototype.parent = function (){
		return null;
	};
});

Imba.createTagScope(/*SCOPEID*/).extendTag('canvas', function(tag){
	tag.prototype.context = function (type){
		if(type === undefined) type = '2d';
		return this.dom.getContext(type);
	};
});

function DataProxy(node,path,args){
	this.node = node;
	this.path = path;
	this.args = args;
	if (this.args) { this.setter = Imba.toSetter(this.path) };
};

DataProxy.bind = function (receiver,data,path,args){
	let proxy = receiver.data || (receiver.data = new this(receiver,path,args));
	proxy.bind(data,path,args);
	return receiver;
};

DataProxy.prototype.bind = function (data,key,args){
	if (data != this.data) {
		this.data = data;
	};
	return this;
};

DataProxy.prototype.getFormValue = function (){
	return this.setter ? this.data[this.path]() : this.data[this.path];
};

DataProxy.prototype.setFormValue = function (value){
	return this.setter ? this.data[this.setter](value) : ((this.data[this.path] = value));
};

var isArray = function(val) {
	return val && val.splice && val.sort;
};

var isSimilarArray = function(a,b) {
	let l = a.length,i = 0;
	if (l != b.length) { return false };
	while (i++ < l){
		if (a[i] != b[i]) { return false };
	};
	return true;
};

Imba.createTagScope(/*SCOPEID*/).extendTag('input', function(tag){
	Object.defineProperty(tag.prototype,'lazy',{
		configurable: true,
		get: function(){ return this._lazy; },
		set: function(v){ this._lazy = v; }
	});
	Object.defineProperty(tag.prototype,'number',{
		configurable: true,
		get: function(){ return this._number; },
		set: function(v){ this._number = v; }
	});
	
	tag.prototype.bindData = function (target,path,args){
		DataProxy.bind(this,target,path,args);
		return this;
	};
	
	Object.defineProperty(tag.prototype,'checked',{get: function(){
		return this.dom.checked;
	}, configurable: true});
	
	Object.defineProperty(tag.prototype,'checked',{set: function(value){
		if (!!value != this.dom.checked) {
			this.dom.checked = !!value;
		};
		return this;
	}, configurable: true});
	
	
	tag.prototype.setValue = function (value,source){
		if (this.localValue == undefined || source == undefined) {
			this.dom.value = this.value = value;
			this.localValue = undefined;
		};
		return this;
	};
	
	
	
	
	
	tag.prototype.value = function (){
		return (this.dom.type == 'number') ? parseFloat(this.dom.value || 0) : this.dom.value;
	};
	
	tag.prototype.oninput = function (e){
		let val = this.dom.value;
		this.localValue = val;
		if (this.data && !this.lazy && this.dom.type != 'radio' && this.dom.type != 'checkbox') {
			this.data.setFormValue(this.value(),this); 
		};
		return;
	};
	
	tag.prototype.onchange = function (e){
		this.modelValue = this.localValue = undefined;
		if (!this.data) { return };
		
		let type = this.dom.type;
		
		if (type == 'radio' || type == 'checkbox') {
			let checked = this.checked;
			let mval = this.data.getFormValue(this);
			let dval = (this.__value != undefined) ? this.__value : this.value();
			
			if (type == 'radio') {
				return this.data.setFormValue(dval,this);
			} else if (this.dom.value == 'on' || this.dom.value == undefined) {
				return this.data.setFormValue(!!checked,this);
			} else if (isArray(mval)) {
				let idx = mval.indexOf(dval);
				if (checked && idx == -1) {
					return mval.push(dval);
				} else if (!checked && idx >= 0) {
					return mval.splice(idx,1);
				};
			} else {
				return this.data.setFormValue(dval,this);
			};
		} else {
			return this.data.setFormValue(this.value());
		};
	};
	
	tag.prototype.onblur = function (e){
		return this.localValue = undefined;
	};
	
	
	
	tag.prototype.end = function (){
		if (this.localValue !== undefined || !this.data) {
			return this;
		};
		
		let mval = this.data.getFormValue(this);
		if (mval === this.modelValue) { return this };
		if (!isArray(mval)) { this.modelValue = mval };
		
		if (this.dom.type == 'radio' || this.dom.type == 'checkbox') {
			let dval = this.value();
			let checked = isArray(mval) ? (
				mval.indexOf(dval) >= 0
			) : ((this.dom.value == 'on' || this.dom.value == undefined) ? (
				!!mval
			) : (
				mval == this.value
			));
			
			this.checked = checked;
		} else {
			this.dom.value = mval;
		};
		return this;
	};
});

Imba.createTagScope(/*SCOPEID*/).extendTag('textarea', function(tag){
	Object.defineProperty(tag.prototype,'lazy',{
		configurable: true,
		get: function(){ return this._lazy; },
		set: function(v){ this._lazy = v; }
	});
	
	tag.prototype.bindData = function (target,path,args){
		DataProxy.bind(this,target,path,args);
		return this;
	};
	
	tag.prototype.setValue = function (value,source){
		if (this.localValue == undefined || source == undefined) {
			this.dom.value = value;
			this.localValue = undefined;
		};
		return this;
	};
	
	tag.prototype.oninput = function (e){
		let val = this.dom.value;
		this.localValue = val;
		if (this.data && !this.lazy) { return this.data.setFormValue(this.value,this) };
	};
	
	tag.prototype.onchange = function (e){
		this.localValue = undefined;
		if (this.data) { return this.data.setFormValue(this.value,this) };
	};
	
	tag.prototype.onblur = function (e){
		return this.localValue = undefined;
	};
	
	tag.prototype.render = function (){
		if (this.localValue != undefined || !this.data) { return };
		if (this.data) {
			let dval = this.data.getFormValue(this);
			this.dom.value = (dval != undefined) ? dval : '';
		};
		return this;
	};
});

Imba.createTagScope(/*SCOPEID*/).extendTag('option', function(tag){
	Object.defineProperty(tag.prototype,'value',{set: function(value){
		if (value != this.__value) {
			this.dom.value = this.__value = value;
		};
		return this;
	}, configurable: true});
	
	Object.defineProperty(tag.prototype,'value',{get: function(){
		return this.__value || this.dom.value;
	}, configurable: true});
});

Imba.createTagScope(/*SCOPEID*/).extendTag('select', function(tag){
	tag.prototype.bindData = function (target,path,args){
		DataProxy.bind(this,target,path,args);
		return this;
	};
	
	Object.defineProperty(tag.prototype,'value',{set: function(value,syncing){
		let prev = this.__value;
		this.__value = value;
		if (!this.__syncing) { this.syncValue(value) };
		return this;
	}, configurable: true});
	
	tag.prototype.syncValue = function (value){
		let prev = this.__syncedValue;
		
		if (this.dom.multiple && (value instanceof Array)) {
			if ((prev instanceof Array) && isSimilarArray(prev,value)) {
				return this;
			};
			
			value = value.slice();
		};
		
		this.__syncedValue = value;
		
		
		if (typeof value == 'object') {
			let mult = this.dom.multiple && (value instanceof Array);
			
			for (let i = 0, items = iter$(this.dom.options), len = items.length, opt; i < len; i++) {
				opt = items[i];
				let oval = (opt.tag ? opt.tag.value : opt.value);
				if (mult) {
					opt.selected = value.indexOf(oval) >= 0;
				} else if (value == oval) {
					this.dom.selectedIndex = i;
					break;
				};
			};
		} else {
			this.dom.value = value;
		};
		return this;
	};
	
	Object.defineProperty(tag.prototype,'value',{get: function(){
		if (this.dom.multiple) {
			let res = [];
			for (let i = 0, items = iter$(this.dom.selectedOptions), len = items.length, option; i < len; i++) {
				option = items[i];
				res.push(option.tag ? option.tag.value : option.value);
			};
			return res;
		} else {
			let opt = this.dom.selectedOptions[0];
			return opt ? ((opt.tag ? opt.tag.value : opt.value)) : null;
		};
	}, configurable: true});
	
	tag.prototype.onchange = function (e){
		if (this.data) { return this.data.setFormValue(this.value,this) };
	};
	
	tag.prototype.end = function (){
		if (this.data) {
			this.__syncing = true;
			this.value = this.data.getFormValue(this);
			this.__syncing = false;
		};
		
		if (this.value != this.__syncedValue) {
			this.syncValue(this.value);
		};
		return this;
	};
});


/***/ }),
/* 9 */
/***/ (function(module, exports, __webpack_require__) {

function iter$(a){ return a ? (a.toArray ? a.toArray() : a) : []; };
var Imba = __webpack_require__(1);








var touches = [];
var count = 0;
var identifiers = {};



Imba.Touch = function Touch(event,pointer){
	// @native  = false
	this.event = event;
	this.data = {};
	this.active = true;
	this.button = event && event.button || 0;
	this.suppress = false; 
	this.captured = false;
	this.bubble = false;
	this.pointer = pointer;
	this.updates = 0;
	return this;
};

Imba.Touch.count = function (){
	return count;
};

Imba.Touch.lookup = function (item){
	return item && (item.__touch__ || identifiers[item.identifier]);
};

Imba.Touch.release = function (item,touch){
	var v_, $1;
	(((v_ = identifiers[item.identifier]),delete identifiers[item.identifier], v_));
	((($1 = item.__touch__),delete item.__touch__, $1));
	return;
};

Imba.Touch.ontouchstart = function (e){
	for (let i = 0, items = iter$(e.changedTouches), len = items.length, t; i < len; i++) {
		t = items[i];
		if (this.lookup(t)) { continue; };
		var touch = identifiers[t.identifier] = new this(e); 
		t.__touch__ = touch;
		touches.push(touch);
		count++;
		touch.touchstart(e,t);
	};
	return this;
};

Imba.Touch.ontouchmove = function (e){
	var touch;
	for (let i = 0, items = iter$(e.changedTouches), len = items.length, t; i < len; i++) {
		t = items[i];
		if (touch = this.lookup(t)) {
			touch.touchmove(e,t);
		};
	};
	
	return this;
};

Imba.Touch.ontouchend = function (e){
	var touch;
	for (let i = 0, items = iter$(e.changedTouches), len = items.length, t; i < len; i++) {
		t = items[i];
		if (touch = this.lookup(t)) {
			touch.touchend(e,t);
			this.release(t,touch);
			count--;
		};
	};
	
	
	
	
	return this;
};

Imba.Touch.ontouchcancel = function (e){
	var touch;
	for (let i = 0, items = iter$(e.changedTouches), len = items.length, t; i < len; i++) {
		t = items[i];
		if (touch = this.lookup(t)) {
			touch.touchcancel(e,t);
			this.release(t,touch);
			count--;
		};
	};
	return this;
};

Imba.Touch.onmousedown = function (e){
	return this;
};

Imba.Touch.onmousemove = function (e){
	return this;
};

Imba.Touch.onmouseup = function (e){
	return this;
};

Imba.Touch.prototype.__bubble = {chainable: true,name: 'bubble'};
Object.defineProperty(Imba.Touch.prototype,'bubble',{
	configurable: true,
	get: function(){ return v !== undefined ? (this.setBubble(v),this) : this._bubble; },
	set: function(v){ this._bubble = v; }
});



Imba.Touch.prototype.capture = function (){
	this.captured = true;
	this.event && this.event.stopPropagation();
	if (!this.__selblocker) {
		this.__selblocker = function(e) { return e.preventDefault(); };
		Imba.document.addEventListener('selectstart',this.__selblocker,true);
	};
	return this;
};

Imba.Touch.prototype.isCaptured = function (){
	return !!this.captured;
};



Imba.Touch.prototype.extend = function (plugin){
	// console.log "added gesture!!!"
	this.gestures || (this.gestures = []);
	this.gestures.push(plugin);
	return this;
};



Imba.Touch.prototype.redirect = function (target){
	this.__redirect = target;
	return this;
};



Imba.Touch.prototype.suppress = function (){
	// collision with the suppress property
	this.active = false;
	return this;
};


Imba.Touch.prototype.setSuppress = function (value){
	console.warn('Imba.Touch#suppress= is deprecated');
	this.supress = value;
	this;
	return this;
};

Imba.Touch.prototype.touchstart = function (e,t){
	this.event = e;
	this.touch = t;
	this.button = 0;
	this.x = t.clientX;
	this.y = t.clientY;
	this.began();
	this.update();
	if (e && this.captured) { e.preventDefault() };
	return this;
};

Imba.Touch.prototype.touchmove = function (e,t){
	this.event = e;
	this.x = t.clientX;
	this.y = t.clientY;
	this.update();
	if (e && this.captured) { e.preventDefault() };
	return this;
};

Imba.Touch.prototype.touchend = function (e,t){
	this.event = e;
	this.x = t.clientX;
	this.y = t.clientY;
	this.ended();
	
	Imba.Touch.LastTimestamp = e.timeStamp;
	
	if (this.maxdr < 20) {
		var tap = new Imba.Event(e);
		tap.type = 'tap';
		tap.process();
	};
	
	if (e && this.captured) { e.preventDefault() };
	return this;
};

Imba.Touch.prototype.touchcancel = function (e,t){
	return this.cancel();
};

Imba.Touch.prototype.mousedown = function (e,t){
	var self = this;
	self.event = e;
	self.button = e.button;
	self.x = t.clientX;
	self.y = t.clientY;
	self.began();
	self.update;
	self.__mousemove = function(e) { return self.mousemove(e,e); };
	Imba.document.addEventListener('mousemove',self.__mousemove,true);
	return self;
};

Imba.Touch.prototype.mousemove = function (e,t){
	this.x = t.clientX;
	this.y = t.clientY;
	this.event = e;
	if (this.captured) { e.preventDefault() };
	this.update();
	this.move();
	return this;
};

Imba.Touch.prototype.mouseup = function (e,t){
	this.x = t.clientX;
	this.y = t.clientY;
	this.ended();
	return this;
};

Imba.Touch.prototype.idle = function (){
	return this.update();
};

Imba.Touch.prototype.began = function (){
	this.timestamp = Date.now();
	this.maxdr = this.dr = 0;
	this.x0 = this.x;
	this.y0 = this.y;
	
	var dom = this.event.target;
	var node = null;
	
	this.sourceTarget = dom && Imba.getTagForDom(dom);
	
	while (dom){
		node = Imba.getTagForDom(dom);
		if (node && node.ontouchstart) {
			this.bubble = false;
			this.target = node;
			this.target.ontouchstart(this);
			if (!this.bubble) { break; };
		};
		dom = dom.parentNode;
	};
	
	this.updates++;
	return this;
};

Imba.Touch.prototype.update = function (){
	if (!this.active || this.cancelled) { return this };
	
	var dr = Math.sqrt(this.dx * this.dx + this.dy * this.dy);
	if (dr > this.dr) { this.maxdr = dr };
	this.dr = dr;
	
	
	if (this.__redirect) {
		if (this.target && this.target.ontouchcancel) {
			this.target.ontouchcancel(this);
		};
		this.target = this.__redirect;
		this.__redirect = null;
		if (this.target.ontouchstart) { this.target.ontouchstart(this) };
		if (this.__redirect) { return this.update() };
	};
	
	this.updates++;
	if (this.gestures) {
		for (let i = 0, items = iter$(this.gestures), len = items.length; i < len; i++) {
			items[i].ontouchupdate(this);
		};
	};
	
	this.target && this.target.ontouchupdate  &&  this.target.ontouchupdate(this);
	if (this.__redirect) { this.update() };
	return this;
};

Imba.Touch.prototype.move = function (){
	if (!this.active || this.cancelled) { return this };
	
	if (this.gestures) {
		for (let i = 0, items = iter$(this.gestures), len = items.length, g; i < len; i++) {
			g = items[i];
			if (g.ontouchmove) { g.ontouchmove(this,this.event) };
		};
	};
	
	this.target && this.target.ontouchmove  &&  this.target.ontouchmove(this,this.event);
	return this;
};

Imba.Touch.prototype.ended = function (){
	if (!this.active || this.cancelled) { return this };
	
	this.updates++;
	
	if (this.gestures) {
		for (let i = 0, items = iter$(this.gestures), len = items.length; i < len; i++) {
			items[i].ontouchend(this);
		};
	};
	
	this.target && this.target.ontouchend  &&  this.target.ontouchend(this);
	this.cleanup_();
	return this;
};

Imba.Touch.prototype.cancel = function (){
	if (!this.cancelled) {
		this.__cancelled = true;
		this.cancelled();
		this.cleanup_();
	};
	return this;
};

Imba.Touch.prototype.cancelled = function (){
	if (!this.active) { return this };
	
	this.__cancelled = true;
	this.updates++;
	
	if (this.gestures) {
		for (let i = 0, items = iter$(this.gestures), len = items.length, g; i < len; i++) {
			g = items[i];
			if (g.ontouchcancel) { g.ontouchcancel(this) };
		};
	};
	
	this.target && this.target.ontouchcancel  &&  this.target.ontouchcancel(this);
	return this;
};

Imba.Touch.prototype.cleanup_ = function (){
	if (this.__mousemove) {
		Imba.document.removeEventListener('mousemove',this.__mousemove,true);
		this.__mousemove = null;
	};
	
	if (this.__selblocker) {
		Imba.document.removeEventListener('selectstart',this.__selblocker,true);
		this.__selblocker = null;
	};
	
	return this;
};







Object.defineProperty(Imba.Touch.prototype,'dx',{get: function(){
	return this.x - this.x0;
}, configurable: true});



Object.defineProperty(Imba.Touch.prototype,'dy',{get: function(){
	return this.y - this.y0;
}, configurable: true});



















Object.defineProperty(Imba.Touch.prototype,'tx',{get: function(){
	this.targetBox || (this.targetBox = this.target.dom.getBoundingClientRect());
	return this.x - this.targetBox.left;
}, configurable: true});



Object.defineProperty(Imba.Touch.prototype,'ty',{get: function(){
	this.targetBox || (this.targetBox = this.target.dom.getBoundingClientRect);
	return this.y - this.targetBox.top;
}, configurable: true});








Imba.Touch.prototype.elapsed = function (){
	return Date.now - this.timestamp;
};


Imba.Touch.LastTimestamp = 0;
Imba.Touch.TapTimeout = 50;

Imba.TouchGesture = function TouchGesture(){ };

Imba.TouchGesture.prototype.__active = {'default': false,name: 'active'};
Object.defineProperty(Imba.TouchGesture.prototype,'active',{
	configurable: true,
	get: function(){ return this._active; },
	set: function(v){ this._active = v; }
});
Imba.TouchGesture.prototype._active = false;

Imba.TouchGesture.prototype.ontouchstart = function (e){
	return this;
};

Imba.TouchGesture.prototype.ontouchupdate = function (e){
	return this;
};

Imba.TouchGesture.prototype.ontouchend = function (e){
	return this;
};



/***/ }),
/* 10 */
/***/ (function(module, exports, __webpack_require__) {

function iter$(a){ return a ? (a.toArray ? a.toArray() : a) : []; };
var Imba = __webpack_require__(1);

var keyCodes = {
	esc: 27,
	tab: 9,
	enter: 13,
	space: 32,
	up: 38,
	down: 40
};

var el = Imba.Tag.prototype;
el.stopModifier = function (e){
	return e.stop() || true;
};
el.preventModifier = function (e){
	return e.prevent() || true;
};
el.silenceModifier = function (e){
	return e.silence() || true;
};
el.bubbleModifier = function (e){
	return e.bubble(true) || true;
};
el.ctrlModifier = function (e){
	return e.event.ctrlKey == true;
};
el.altModifier = function (e){
	return e.event.altKey == true;
};
el.shiftModifier = function (e){
	return e.event.shiftKey == true;
};
el.metaModifier = function (e){
	return e.event.metaKey == true;
};
el.keyModifier = function (key,e){
	return e.keyCode ? ((e.keyCode == key)) : true;
};
el.delModifier = function (e){
	return e.keyCode ? ((e.keyCode == 8 || e.keyCode == 46)) : true;
};
el.selfModifier = function (e){
	return e.event.target == this.dom;
};
el.leftModifier = function (e){
	return (e.button != undefined) ? ((e.button === 0)) : el.keyModifier(37,e);
};
el.rightModifier = function (e){
	return (e.button != undefined) ? ((e.button === 2)) : el.keyModifier(39,e);
};
el.middleModifier = function (e){
	return (e.button != undefined) ? ((e.button === 1)) : true;
};

el.getHandler = function (str,event){
	if (this[str]) {
		return this;
	};
	if (this.owner_ && this.owner_.getHandler) {
		return this.owner_.getHandler(str,event);
	};
};



Imba.Event = function Event(e){
	this.event = this.native = e;
	this.bubble = true;
};

Object.defineProperty(Imba.Event.prototype,'prefix',{
	configurable: true,
	get: function(){ return this._prefix; },
	set: function(v){ this._prefix = v; }
});
Object.defineProperty(Imba.Event.prototype,'source',{
	configurable: true,
	get: function(){ return this._source; },
	set: function(v){ this._source = v; }
});
Object.defineProperty(Imba.Event.prototype,'data',{
	configurable: true,
	get: function(){ return this._data; },
	set: function(v){ this._data = v; }
});
Object.defineProperty(Imba.Event.prototype,'responder',{
	configurable: true,
	get: function(){ return this._responder; },
	set: function(v){ this._responder = v; }
});

Imba.Event.wrap = function (e){
	return new this(e);
};

Object.defineProperty(Imba.Event.prototype,'type',{set: function(value){
	return this.__type = value;
}, configurable: true});

Object.defineProperty(Imba.Event.prototype,'type',{get: function(){
	return this.__type || this.event.type;
}, configurable: true});

Object.defineProperty(Imba.Event.prototype,'name',{get: function(){
	return this.__name || (this.__name = this.type.toLowerCase().replace(/\:/g,''));
}, configurable: true});



Imba.Event.prototype.bubble = function (v){
	if (v != undefined) {
		this.bubble = v;
		return this;
	};
	return this.bubble;
};

Imba.Event.prototype.setBubble = function (v){
	this.bubble = v;
	return this;
};



Imba.Event.prototype.stop = function (){
	this.bubble = false;
	return this;
};

Imba.Event.prototype.stopPropagation = function (){
	return this.stop();
};

Imba.Event.prototype.halt = function (){
	return this.stop();
};


Imba.Event.prototype.prevent = function (){
	if (this.event.preventDefault) {
		this.event.preventDefault();
	} else {
		this.event.defaultPrevented = true;
	};
	this.defaultPrevented = true;
	return this;
};

Imba.Event.prototype.preventDefault = function (){
	console.warn("Event#preventDefault is deprecated - use Event#prevent");
	return this.prevent();
};



Imba.Event.prototype.isPrevented = function (){
	return this.event ? this.event.defaultPrevented : this.defaultPrevented;
};



Imba.Event.prototype.cancel = function (){
	console.warn("Event#cancel is deprecated - use Event#prevent");
	return this.prevent();
};

Imba.Event.prototype.silence = function (){
	this.silenced = true;
	return this;
};

Imba.Event.prototype.isSilenced = function (){
	return !!this.silenced;
};



Object.defineProperty(Imba.Event.prototype,'target',{get: function(){
	return Imba.getTagForDom(this.event._target || this.event.target);
}, configurable: true});



Imba.Event.prototype.redirect = function (node){
	this.__redirect = node;
	return this;
};

Imba.Event.prototype.processHandlers = function (node,handlers){
	var state_;
	let i = 1;
	let l = handlers.length;
	let bubble = this.bubble;
	let state = (state_ = handlers.state) || (handlers.state = {});
	let result;
	
	if (bubble) {
		this.bubble = 1;
	};
	
	while (i < l){
		let isMod = false;
		let handler = handlers[i++];
		let params = null;
		let context = node;
		let checkSpecial = false;
		
		if (handler instanceof Array) {
			params = handler.slice(1);
			checkSpecial = true;
			handler = handler[0];
		};
		
		if (typeof handler == 'string') {
			if (keyCodes[handler]) {
				params = [keyCodes[handler]];
				handler = 'key';
			};
			
			let mod = handler + 'Modifier';
			
			if (node[mod]) {
				isMod = true;
				params = (params || []).concat([this,state]);
				handler = node[mod];
			};
		};
		
		
		
		if (typeof handler == 'string') {
			let el = node;
			let fn = null;
			let ctx = state.context;
			
			if (ctx) {
				if (ctx.getHandler instanceof Function) {
					ctx = ctx.getHandler(handler,this);
				};
				
				if (ctx[handler] instanceof Function) {
					handler = fn = ctx[handler];
					context = ctx;
				};
			};
			
			if (!fn) {
				console.warn(("event " + this.type + ": could not find '" + handler + "' in context"),ctx);
			};
			
			
			
			
			
			
			
			
			
			
			
		};
		
		if (handler instanceof Function) {
			// what if we actually call stop inside function?
			// do we still want to continue the chain?
			
			// loop through special variables from params?
			
			if (checkSpecial) {
				// replacing special params
				for (let i = 0, items = iter$(params), len = items.length, param; i < len; i++) {
					param = items[i];
					if (typeof param == 'string' && param[0] == '~' && param[1] == '$') {
						let name = param.slice(2);
						if (name == 'event') {
							params[i] = this;
						} else if (this[name] instanceof Function) {
							params[i] = this[name]();
						} else if (node[name] instanceof Function) {
							params[i] = node[name]();
						} else {
							console.warn(("Missing special handler $" + name));
						};
					};
				};
			};
			
			let res = handler.apply(context,params || [this]);
			
			if (!isMod) {
				this.responder || (this.responder = node);
			};
			
			if (res == false) {
				break;
			};
			
			if (res && !this.silenced && (res.then instanceof Function)) {
				res.then(Imba.commit);
			};
		};
	};
	
	
	if (this.bubble === 1) {
		this.bubble = bubble;
	};
	
	return null;
};

Imba.Event.prototype.process = function (){
	var name = this.name;
	var meth = ("on" + (this.prefix || '') + name);
	var args = null;
	
	var domtarget = this.event._target || this.event.target;
	var domnode = domtarget._responder || domtarget;
	
	var result;
	var handlers;
	
	while (domnode){
		this.__redirect = null;
		let node = domnode.dom ? domnode : domnode.tag;
		
		if (node) {
			if (handlers = node.on_) {
				for (let i = 0, items = iter$(handlers), len = items.length, handler; i < len; i++) {
					handler = items[i];
					if (!handler) { continue; };
					let hname = handler[0];
					if (name == handler[0] && this.bubble) {
						this.processHandlers(node,handler);
					};
				};
				if (!this.bubble) { break; };
			};
			
			if (this.bubble && (node[meth] instanceof Function)) {
				this.responder || (this.responder = node);
				this.silenced = false;
				result = args ? node[meth].apply(node,args) : node[meth](this,this.data);
			};
			
			if (node.onevent) {
				node.onevent(this);
			};
		};
		
		
		if (!(this.bubble && (domnode = (this.__redirect || (node ? node.parent : domnode.parentNode))))) {
			break;
		};
	};
	
	this.processed();
	
	
	
	if (result && (result.then instanceof Function)) {
		result.then(this.processed.bind(this));
	};
	return this;
};


Imba.Event.prototype.processed = function (){
	if (!this.silenced && this.responder) {
		Imba.emit(Imba,'event',[this]);
		Imba.commit(this.event);
	};
	return this;
};



Object.defineProperty(Imba.Event.prototype,'x',{get: function(){
	return this.event.x;
}, configurable: true});



Object.defineProperty(Imba.Event.prototype,'y',{get: function(){
	return this.event.y;
}, configurable: true});

Object.defineProperty(Imba.Event.prototype,'button',{get: function(){
	return this.event.button;
}, configurable: true});

Object.defineProperty(Imba.Event.prototype,'keyCode',{get: function(){
	return this.event.keyCode;
}, configurable: true});

Object.defineProperty(Imba.Event.prototype,'ctrl',{get: function(){
	return this.event.ctrlKey;
}, configurable: true});

Object.defineProperty(Imba.Event.prototype,'alt',{get: function(){
	return this.event.altKey;
}, configurable: true});

Object.defineProperty(Imba.Event.prototype,'shift',{get: function(){
	return this.event.shiftKey;
}, configurable: true});

Object.defineProperty(Imba.Event.prototype,'meta',{get: function(){
	return this.event.metaKey;
}, configurable: true});

Object.defineProperty(Imba.Event.prototype,'key',{get: function(){
	return this.event.key;
}, configurable: true});



Object.defineProperty(Imba.Event.prototype,'which',{get: function(){
	return this.event.which;
}, configurable: true});


/***/ }),
/* 11 */
/***/ (function(module, exports, __webpack_require__) {

function iter$(a){ return a ? (a.toArray ? a.toArray() : a) : []; };
var self = {};
// externs;

var Imba = __webpack_require__(1);
var TagFragmentLoop = __webpack_require__(7).TagFragmentLoop;

var removeNested = function(root,node,caret) {
	// if node/nodes isa String
	// 	we need to use the caret to remove elements
	// 	for now we will simply not support this
	if (node instanceof Array) {
		for (let i = 0, items = iter$(node), len = items.length; i < len; i++) {
			removeNested(root,items[i],caret);
		};
	} else if (node && node.slot_) {
		// TODO fix slot_ private thingine
		root.removeChild(node);
	} else if (node != null) {
		// what if this is not null?!?!?
		// take a chance and remove a text-elementng
		let next = caret ? caret.nextSibling : root.dom.firstChild;
		if ((next instanceof Text) && next.textContent == node) {
			root.removeChild(next);
		} else {
			throw 'cannot remove string';
		};
	};
	
	return caret;
};

var appendNested = function(root,node) {
	if (node instanceof Array) {
		let i = 0;
		let c = node.taglen;
		let k = (c != null) ? ((node.domlen = c)) : node.length;
		while (i < k){
			appendNested(root,node[i++]);
		};
	} else if (node && node.dom) {
		root.appendChild(node);
	} else if (node != null && node !== false) {
		root.appendChild(Imba.createTextNode(node));
	};
	
	return;
};






var insertNestedBefore = function(root,node,before) {
	if (node instanceof Array) {
		let i = 0;
		let c = node.taglen;
		let k = (c != null) ? ((node.domlen = c)) : node.length;
		while (i < k){
			insertNestedBefore(root,node[i++],before);
		};
	} else if (node && node.dom) {
		root.insertBefore(node,before);
	} else if (node != null && node !== false) {
		root.insertBefore(Imba.createTextNode(node),before);
	};
	
	return before;
};


self.insertNestedAfter = function (root,node,after){
	var before = after ? after.nextSibling : root.dom.firstChild;
	
	if (before) {
		insertNestedBefore(root,node,before);
		return before.previousSibling;
	} else {
		appendNested(root,node);
		return root.dom.lastChild;
	};
};

var reconcileCollectionChanges = function(root,new$,old,caret) {
	
	var newLen = new$.length;
	var lastNew = new$[newLen - 1];
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	var newPosition = [];
	
	
	var prevChain = [];
	
	var lengthChain = [];
	
	
	var maxChainLength = 0;
	var maxChainEnd = 0;
	
	var hasTextNodes = false;
	var newPos;
	
	for (let idx = 0, items = iter$(old), len = items.length, node; idx < len; idx++) {
		// special case for Text nodes
		node = items[idx];
		if (node && node.nodeType == 3) {
			newPos = new$.indexOf(node.textContent);
			if (newPos >= 0) { new$[newPos] = node };
			hasTextNodes = true;
		} else {
			newPos = new$.indexOf(node);
		};
		
		newPosition.push(newPos);
		
		if (newPos == -1) {
			root.removeChild(node);
			prevChain.push(-1);
			lengthChain.push(-1);
			continue;
		};
		
		var prevIdx = newPosition.length - 2;
		
		
		while (prevIdx >= 0){
			if (newPosition[prevIdx] == -1) {
				prevIdx--;
			} else if (newPos > newPosition[prevIdx]) {
				// Yay, we're bigger than the previous!
				break;
			} else {
				// Nope, let's walk back the chain
				prevIdx = prevChain[prevIdx];
			};
		};
		
		prevChain.push(prevIdx);
		
		var currLength = (prevIdx == -1) ? 0 : (lengthChain[prevIdx] + 1);
		
		if (currLength > maxChainLength) {
			maxChainLength = currLength;
			maxChainEnd = idx;
		};
		
		lengthChain.push(currLength);
	};
	
	var stickyNodes = [];
	
	
	
	var cursor = newPosition.length - 1;
	while (cursor >= 0){
		if (cursor == maxChainEnd && newPosition[cursor] != -1) {
			stickyNodes[newPosition[cursor]] = true;
			maxChainEnd = prevChain[maxChainEnd];
		};
		
		cursor -= 1;
	};
	
	
	for (let idx = 0, items = iter$(new$), len = items.length, node; idx < len; idx++) {
		node = items[idx];
		if (!stickyNodes[idx]) {
			// create textnode for string, and update the array
			if (!(node && node.dom)) {
				node = new$[idx] = Imba.createTextNode(node);
			};
			
			var after = new$[idx - 1];
			self.insertNestedAfter(root,node,(after && after.slot_ || after || caret));
		};
		
		caret = node.slot_ || (caret && caret.nextSibling || root.dom.firstChild);
	};
	
	
	return lastNew && lastNew.slot_ || caret;
};



var reconcileCollection = function(root,new$,old,caret) {
	var k = new$.length;
	var i = k;
	var last = new$[k - 1];
	
	
	if (k == old.length && new$[0] === old[0]) {
		// running through to compare
		while (i--){
			if (new$[i] !== old[i]) { break; };
		};
	};
	
	if (i == -1) {
		return last && last.slot_ || last || caret;
	} else {
		return reconcileCollectionChanges(root,new$,old,caret);
	};
};



var reconcileLoop = function(root,new$,old,caret) {
	var nl = new$.length;
	var ol = old.length;
	var cl = new$.cache.i$; 
	var i = 0,d = nl - ol;
	
	
	
	
	while (i < ol && i < nl && new$[i] === old[i]){
		i++;
	};
	
	
	if (cl > 1000 && (cl - nl) > 500) {
		new$.cache.$prune(new$);
	};
	
	if (d > 0 && i == ol) {
		// added at end
		while (i < nl){
			root.appendChild(new$[i++]);
		};
		return;
	} else if (d > 0) {
		let i1 = nl;
		while (i1 > i && new$[i1 - 1] === old[i1 - 1 - d]){
			i1--;
		};
		
		if (d == (i1 - i)) {
			let before = old[i].slot_;
			while (i < i1){
				root.insertBefore(new$[i++],before);
			};
			return;
		};
	} else if (d < 0 && i == nl) {
		// removed at end
		while (i < ol){
			root.removeChild(old[i++]);
		};
		return;
	} else if (d < 0) {
		let i1 = ol;
		while (i1 > i && new$[i1 - 1 + d] === old[i1 - 1]){
			i1--;
		};
		
		if (d == (i - i1)) {
			while (i < i1){
				root.removeChild(old[i++]);
			};
			return;
		};
	} else if (i == nl) {
		return;
	};
	
	return reconcileCollectionChanges(root,new$,old,caret);
};



var reconcileLoopFragment = function(root,frag,old,caret) {
	var old = frag.prev;
	var new$ = frag.array;
	
	var nl = frag.taglen;
	var ol = old.taglen || 0;
	
	
	var i = 0,d = nl - ol;
	
	
	
	
	
	
	while (i < ol && i < nl && new$[i] === old[i]){
		i++;
	};
	
	
	
	
	
	
	
	if (d > 0 && i == ol) {
		// added at end
		while (i < nl){
			root.appendChild(new$[i++]);
		};
		return;
	} else if (d > 0) {
		let i1 = nl;
		while (i1 > i && new$[i1 - 1] === old[i1 - 1 - d]){
			i1--;
		};
		
		if (d == (i1 - i)) {
			// new items added at start
			let before = old[i].slot_;
			while (i < i1){
				root.insertBefore(new$[i++],before);
			};
			return;
		};
	} else if (d < 0 && i == nl) {
		// removed at end
		while (i < ol){
			root.removeChild(old[i++]);
		};
		return;
	} else if (d < 0) {
		let i1 = ol;
		while (i1 > i && new$[i1 - 1 + d] === old[i1 - 1]){
			i1--;
		};
		
		if (d == (i - i1)) {
			while (i < i1){
				root.removeChild(old[i++]);
			};
			return;
		};
	} else if (i == nl) {
		return;
	};
	
	
	new$.length = nl;
	return reconcileCollectionChanges(root,new$,old,caret);
};




var reconcileIndexedArray = function(root,array,old,caret) {
	var newLen = array.taglen;
	var prevLen = array.domlen || 0;
	var last = newLen ? array[newLen - 1] : null;
	
	
	if (prevLen > newLen) {
		while (prevLen > newLen){
			var item = array[--prevLen];
			root.removeChild(item.slot_);
		};
	} else if (newLen > prevLen) {
		// find the item to insert before
		let prevLast = prevLen ? array[prevLen - 1].slot_ : caret;
		let before = prevLast ? prevLast.nextSibling : root.dom.firstChild;
		
		while (prevLen < newLen){
			let node = array[prevLen++];
			before ? root.insertBefore(node.slot_,before) : root.appendChild(node.slot_);
		};
	};
	
	array.domlen = newLen;
	return last ? last.slot_ : caret;
};




var reconcileNested = function(root,new$,old,caret) {
	
	// var skipnew = new == null or new === false or new === true
	var newIsNull = new$ == null || new$ === false;
	var oldIsNull = old == null || old === false;
	
	
	if (new$ === old) {
		// remember that the caret must be an actual dom element
		// we should instead move the actual caret? - trust
		if (newIsNull) {
			return caret;
		} else if (new$.slot_) {
			return new$.slot_;
		} else if ((new$ instanceof Array) && new$.taglen != null) {
			return reconcileIndexedArray(root,new$,old,caret);
		} else {
			return caret ? caret.nextSibling : root.dom.firstChild;
		};
	} else if (new$ instanceof Array) {
		if (old instanceof Array) {
			// look for slot instead?
			let typ = new$.static;
			if (typ || old.static) {
				// if the static is not nested - we could get a hint from compiler
				// and just skip it
				if (typ == old.static) { // should also include a reference?
					for (let i = 0, items = iter$(new$), len = items.length; i < len; i++) {
						// this is where we could do the triple equal directly
						caret = reconcileNested(root,items[i],old[i],caret);
					};
					return caret;
				} else {
					removeNested(root,old,caret);
				};
				
				
			} else {
				// Could use optimized loop if we know that it only consists of nodes
				return reconcileCollection(root,new$,old,caret);
			};
		} else if (!oldIsNull) {
			if (old.slot_) {
				root.removeChild(old);
			} else {
				// old was a string-like object?
				root.removeChild(caret ? caret.nextSibling : root.dom.firstChild);
			};
		};
		
		return self.insertNestedAfter(root,new$,caret);
		
	} else if (!newIsNull && new$.slot_) {
		if (!oldIsNull) { removeNested(root,old,caret) };
		return self.insertNestedAfter(root,new$,caret);
	} else if (newIsNull) {
		if (!oldIsNull) { removeNested(root,old,caret) };
		return caret;
	} else {
		// if old did not exist we need to add a new directly
		let nextNode;
		
		if (old instanceof Array) {
			removeNested(root,old,caret);
		} else if (old && old.slot_) {
			root.removeChild(old);
		} else if (!oldIsNull) {
			// ...
			nextNode = caret ? caret.nextSibling : root.dom.firstChild;
			if ((nextNode instanceof Text) && nextNode.textContent != new$) {
				nextNode.textContent = new$;
				return nextNode;
			};
		};
		
		
		return self.insertNestedAfter(root,new$,caret);
	};
};


Imba.createTagScope(/*SCOPEID*/).extendTag('element', function(tag){
	
	// 1 - static shape - unknown content
	// 2 - static shape and static children
	// 3 - single item
	// 4 - optimized array - only length will change
	// 5 - optimized collection
	// 6 - text only
	
	tag.prototype.setChildren = function (new$,typ){
		// if typeof new == 'string'
		// 	return self.text = new
		var old = this.__tree_;
		
		if (new$ === old && (!(new$) || new$.taglen == undefined)) {
			return this;
		};
		
		if (new$ instanceof TagFragmentLoop) {
			reconcileLoopFragment(this,new$,old,null);
		} else if (!old && typ != 3) {
			this.removeAllChildren();
			appendNested(this,new$);
		} else if (typ == 1) {
			let caret = null;
			for (let i = 0, items = iter$(new$), len = items.length; i < len; i++) {
				caret = reconcileNested(this,items[i],old[i],caret);
			};
		} else if (typ == 2) {
			return this;
		} else if (typ == 3) {
			let ntyp = typeof new$;
			
			if (ntyp != 'object') {
				return this.setText(new$);
			};
			
			if (new$ && new$.dom) {
				this.removeAllChildren();
				this.appendChild(new$);
			} else if (new$ instanceof Array) {
				if (new$.type == 5 && old && old.type == 5) {
					reconcileLoop(this,new$,old,null);
				} else if (old instanceof Array) {
					reconcileNested(this,new$,old,null);
				} else {
					this.removeAllChildren();
					appendNested(this,new$);
				};
			} else {
				return this.setText(new$);
			};
		} else if (typ == 4) {
			reconcileIndexedArray(this,new$,old,null);
		} else if (typ == 5) {
			reconcileLoop(this,new$,old,null);
		} else if ((new$ instanceof Array) && (old instanceof Array)) {
			reconcileNested(this,new$,old,null);
		} else {
			// what if text?
			this.removeAllChildren();
			appendNested(this,new$);
		};
		
		this.__tree_ = new$;
		return this;
	};
	
	tag.prototype.getContent = function (){
		// TODO fix for v2
		return this.content || this.children.toArray();
	};
	
	
	
	tag.prototype.setText = function (text){
		if (text != this.__tree_) {
			var val = (text === null || text === false) ? '' : text;
			(this.__text_ || this.dom).textContent = val;
			this.__text_ || (this.__text_ = this.dom.firstChild);
			this.__tree_ = text;
		};
		return this;
	};
});


var proto = Imba.Tag.prototype;
proto.setContent = proto.setChildren;


var apple = typeof navigator != 'undefined' && (navigator.vendor || '').indexOf('Apple') == 0;
if (apple) {
	proto.setText = function (text){
		if (text != this.__tree_) {
			this.dom.textContent = ((text === null || text === false) ? '' : text);
			this.__tree_ = text;
		};
		return this;
	};
};


/***/ })
/******/ ]);
});