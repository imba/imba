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





__webpack_require__(7);









/***/ }),
/* 4 */,
/* 5 */,
/* 6 */,
/* 7 */
/***/ (function(module, exports, __webpack_require__) {

var Imba = __webpack_require__(1);

if (false) {};


	Element.prototype.text$ = function (item){
		this.textContent = item;
		return this;
	};
	
	Element.prototype.insert$ = function (item,index,prev){
		let type = typeof item;
		
		if (type !== 'object') {
			let res;
			let txt = (item === undefined || item === null) ? '' : item;
			if (index == -1) {
				this.textContent = txt;
			} else {
				this.appendChild(res = document.createTextNode(txt));
				return res;
			};
		} else if (item instanceof Element) {
			this.appendChild(item);
		};
		return;
	};
	
	Element.prototype.flag$ = function (str){
		this.className = str;
		return;
	};
	
	Element.prototype.flagIf$ = function (flag,bool){
		bool ? this.classList.add(flag) : this.classList.remove(flag);
		return;
	};
	
	Element.prototype.render = function (){
		if (this.template$) {
			this.template$();
		};
		return;
	};


Imba.createElement = function (name,parent,index,flags,text){
	var type = name;
	var el;
	
	if (name instanceof Function) {
		type = name;
	} else {
		el = document.createElement(name);
	};
	
	if (el) {
		if (flags) { el.className = flags };
		if (text !== null) { el.text$(text) };
		
		if (parent && index != null && (parent instanceof Element)) {
			parent.insert$(el,index);
		};
	};
	return el;
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

Imba.createFragment = function (type,parent,slot,options){
	if (type == 2) {
		return new KeyedTagFragment(parent,slot,options);
	} else if (type == 1) {
		return new IndexedTagFragment(parent,slot,options);
	};
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
	// we know that these items are dom elements
	this.parent.appendChild(item);
	return;
};

IndexedTagFragment.prototype.removeChild = function (item,index){
	this.parent.removeChild(item);
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


/***/ })
/******/ ]);
});