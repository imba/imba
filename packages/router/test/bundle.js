/******/ (function(modules) { // webpackBootstrap
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
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
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
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 3);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports) {



var Imba = {VERSION: '1.4.0'};



Imba.setTimeout = function (delay,block){
	return setTimeout(function() {
		block();
		return Imba.commit();
	},delay);
};



Imba.setInterval = function (interval,block){
	return setInterval(block,interval);
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

Imba.len = function (a){
	return a && ((a.len instanceof Function) ? a.len.call(a) : a.length) || 0;
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
		proto[getName] = function() { return this.dom()[name]; };
		proto[setName] = function(value) {
			if (value != this[name]()) {
				this.dom()[name] = value;
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
		
		if (node.times && --node.times <= 0) {
			prev.next = node.next;
			node.listener = null;
		};
	};
	return;
};


Imba.listen = function (obj,event,listener,path){
	var cbs,list,tail;
	cbs = obj.__listeners__ || (obj.__listeners__ = {});
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
/* 1 */
/***/ (function(module, exports, __webpack_require__) {

module.exports = __webpack_require__(4);


/***/ }),
/* 2 */
/***/ (function(module, exports, __webpack_require__) {

var Imba = __webpack_require__(0);

Imba.Pointer = function Pointer(){
	this._button = -1;
	this._event = {x: 0,y: 0,type: 'uninitialized'};
	return this;
};

Imba.Pointer.prototype.button = function (){
	return this._button;
};

Imba.Pointer.prototype.touch = function (){
	return this._touch;
};

Imba.Pointer.prototype.update = function (e){
	this._event = e;
	this._dirty = true;
	return this;
};


Imba.Pointer.prototype.process = function (){
	var e1 = this._event;
	
	if (this._dirty) {
		this._prevEvent = e1;
		this._dirty = false;
		
		
		if (e1.type == 'mousedown') {
			this._button = e1.button;
			
			if ((this._touch && this._button != 0)) {
				return;
			};
			
			
			if (this._touch) { this._touch.cancel() };
			this._touch = new Imba.Touch(e1,this);
			this._touch.mousedown(e1,e1);
		} else if (e1.type == 'mousemove') {
			if (this._touch) { this._touch.mousemove(e1,e1) };
		} else if (e1.type == 'mouseup') {
			this._button = -1;
			
			if (this._touch && this._touch.button() == e1.button) {
				this._touch.mouseup(e1,e1);
				this._touch = null;
			};
			
		};
	} else if (this._touch) {
		this._touch.idle();
	};
	return this;
};

Imba.Pointer.prototype.x = function (){
	return this._event.x;
};
Imba.Pointer.prototype.y = function (){
	return this._event.y;
};


/***/ }),
/* 3 */
/***/ (function(module, exports, __webpack_require__) {

var Imba = __webpack_require__(1), _1 = Imba.createElement;

var Router = __webpack_require__(15).Router;
var App = __webpack_require__(17).App;

var router = new Router();
var app = (_1(App)).setRouter(router).end();




router.onReady(function() {
	document.body.innerHTML = '';
	return Imba.mount(app);
});


/***/ }),
/* 4 */
/***/ (function(module, exports, __webpack_require__) {

/* WEBPACK VAR INJECTION */(function(global) {var Imba = __webpack_require__(0);
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
	__webpack_require__(6);
	__webpack_require__(7);
};

if (activate) {
	Imba.EventManager.activate();
};

if (false) {};

/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(5)))

/***/ }),
/* 5 */
/***/ (function(module, exports) {

var g;

// This works in non-strict mode
g = (function() {
	return this;
})();

try {
	// This works if eval is allowed (see CSP)
	g = g || Function("return this")() || (1,eval)("this");
} catch(e) {
	// This works if the window reference is available
	if(typeof window === "object")
		g = window;
}

// g can still be undefined, but nothing to do about it...
// We return undefined, instead of nothing here, so it's
// easier to handle this case. if(!global) { ...}

module.exports = g;


/***/ }),
/* 6 */
/***/ (function(module, exports, __webpack_require__) {

function iter$(a){ return a ? (a.toArray ? a.toArray() : a) : []; };
var Imba = __webpack_require__(0);

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
	self._queue = [];
	self._stage = -1;
	self._scheduled = false;
	self._ticker = function(e) {
		self._scheduled = false;
		return self.tick(e);
	};
	self;
};

Ticker.prototype.stage = function(v){ return this._stage; }
Ticker.prototype.setStage = function(v){ this._stage = v; return this; };
Ticker.prototype.queue = function(v){ return this._queue; }
Ticker.prototype.setQueue = function(v){ this._queue = v; return this; };

Ticker.prototype.add = function (item,force){
	if (force || this._queue.indexOf(item) == -1) {
		this._queue.push(item);
	};
	
	if (!this._scheduled) { return this.schedule() };
};

Ticker.prototype.tick = function (timestamp){
	var items = this._queue;
	if (!this._ts) { this._ts = timestamp };
	this._dt = timestamp - this._ts;
	this._ts = timestamp;
	this._queue = [];
	this._stage = 1;
	this.before();
	if (items.length) {
		for (let i = 0, ary = iter$(items), len = ary.length, item; i < len; i++) {
			item = ary[i];
			if (item instanceof Function) {
				item(this._dt,this);
			} else if (item.tick) {
				item.tick(this._dt,this);
			};
		};
	};
	this._stage = 2;
	this.after();
	this._stage = this._scheduled ? 0 : (-1);
	return this;
};

Ticker.prototype.schedule = function (){
	if (!this._scheduled) {
		this._scheduled = true;
		if (this._stage == -1) {
			this._stage = 0;
		};
		requestAnimationFrame(this._ticker);
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
	self._id = counter++;
	self._target = target;
	self._marked = false;
	self._active = false;
	self._marker = function() { return self.mark(); };
	self._ticker = function(e) { return self.tick(e); };
	
	self._dt = 0;
	self._frame = {};
	self._scheduled = false;
	self._timestamp = 0;
	self._ticks = 0;
	self._flushes = 0;
	
	self.onevent = self.onevent.bind(self);
	self;
};

var counter = 0;

Imba.Scheduler.event = function (e){
	return Imba.emit(Imba,'event',e);
};



Imba.Scheduler.prototype.__raf = {watch: 'rafDidSet',name: 'raf'};
Imba.Scheduler.prototype.raf = function(v){ return this._raf; }
Imba.Scheduler.prototype.setRaf = function(v){
	var a = this.raf();
	if(v != a) { this._raf = v; }
	if(v != a) { this.rafDidSet && this.rafDidSet(v,a,this.__raf) }
	return this;
};
Imba.Scheduler.prototype.__interval = {watch: 'intervalDidSet',name: 'interval'};
Imba.Scheduler.prototype.interval = function(v){ return this._interval; }
Imba.Scheduler.prototype.setInterval = function(v){
	var a = this.interval();
	if(v != a) { this._interval = v; }
	if(v != a) { this.intervalDidSet && this.intervalDidSet(v,a,this.__interval) }
	return this;
};
Imba.Scheduler.prototype.__events = {watch: 'eventsDidSet',name: 'events'};
Imba.Scheduler.prototype.events = function(v){ return this._events; }
Imba.Scheduler.prototype.setEvents = function(v){
	var a = this.events();
	if(v != a) { this._events = v; }
	if(v != a) { this.eventsDidSet && this.eventsDidSet(v,a,this.__events) }
	return this;
};
Imba.Scheduler.prototype.marked = function(v){ return this._marked; }
Imba.Scheduler.prototype.setMarked = function(v){ this._marked = v; return this; };

Imba.Scheduler.prototype.rafDidSet = function (bool){
	if (bool && this._active) this.requestTick();
	return this;
};

Imba.Scheduler.prototype.intervalDidSet = function (time){
	clearInterval(this._intervalId);
	this._intervalId = null;
	if (time && this._active) {
		this._intervalId = setInterval(this.oninterval.bind(this),time);
	};
	return this;
};

Imba.Scheduler.prototype.eventsDidSet = function (new$,prev){
	if (this._active && new$ && !prev) {
		return Imba.listen(Imba,'commit',this,'onevent');
	} else if (!(new$) && prev) {
		return Imba.unlisten(Imba,'commit',this,'onevent');
	};
};



Imba.Scheduler.prototype.active = function (){
	return this._active;
};



Imba.Scheduler.prototype.dt = function (){
	return this._dt;
};



Imba.Scheduler.prototype.configure = function (options){
	var v_;
	if(options === undefined) options = {};
	if (options.raf != undefined) { (this.setRaf(v_ = options.raf),v_) };
	if (options.interval != undefined) { (this.setInterval(v_ = options.interval),v_) };
	if (options.events != undefined) { (this.setEvents(v_ = options.events),v_) };
	return this;
};



Imba.Scheduler.prototype.mark = function (){
	this._marked = true;
	if (!this._scheduled) {
		this.requestTick();
	};
	return this;
};



Imba.Scheduler.prototype.flush = function (){
	this._flushes++;
	this._target.tick(this);
	this._marked = false;
	return this;
};



Imba.Scheduler.prototype.tick = function (delta,ticker){
	this._ticks++;
	this._dt = delta;
	
	if (ticker) {
		this._scheduled = false;
	};
	
	this.flush();
	
	if (this._raf && this._active) {
		this.requestTick();
	};
	return this;
};

Imba.Scheduler.prototype.requestTick = function (){
	if (!this._scheduled) {
		this._scheduled = true;
		Imba.TICKER.add(this);
	};
	return this;
};



Imba.Scheduler.prototype.activate = function (immediate){
	if(immediate === undefined) immediate = true;
	if (!this._active) {
		this._active = true;
		this._commit = this._target.commit;
		this._target.commit = function() { return this; };
		this._target && this._target.flag  &&  this._target.flag('scheduled_');
		Imba.SCHEDULERS.push(this);
		
		if (this._events) {
			Imba.listen(Imba,'commit',this,'onevent');
		};
		
		if (this._interval && !this._intervalId) {
			this._intervalId = setInterval(this.oninterval.bind(this),this._interval);
		};
		
		if (immediate) {
			this.tick(0);
		} else if (this._raf) {
			this.requestTick();
		};
	};
	return this;
};



Imba.Scheduler.prototype.deactivate = function (){
	if (this._active) {
		this._active = false;
		this._target.commit = this._commit;
		let idx = Imba.SCHEDULERS.indexOf(this);
		if (idx >= 0) {
			Imba.SCHEDULERS.splice(idx,1);
		};
		
		if (this._events) {
			Imba.unlisten(Imba,'commit',this,'onevent');
		};
		
		if (this._intervalId) {
			clearInterval(this._intervalId);
			this._intervalId = null;
		};
		
		this._target && this._target.unflag  &&  this._target.unflag('scheduled_');
	};
	return this;
};

Imba.Scheduler.prototype.track = function (){
	return this._marker;
};

Imba.Scheduler.prototype.oninterval = function (){
	this.tick();
	Imba.TagManager.refresh();
	return this;
};

Imba.Scheduler.prototype.onevent = function (event){
	if (!this._events || this._marked) { return this };
	
	if (this._events instanceof Function) {
		if (this._events(event,this)) this.mark();
	} else if (this._events instanceof Array) {
		if (this._events.indexOf((event && event.type) || event) >= 0) {
			this.mark();
		};
	} else {
		this.mark();
	};
	return this;
};


/***/ }),
/* 7 */
/***/ (function(module, exports, __webpack_require__) {

var Imba = __webpack_require__(0);

__webpack_require__(8);
__webpack_require__(9);

Imba.TagManager = new Imba.TagManagerClass();

__webpack_require__(10);
__webpack_require__(11);
__webpack_require__(2);
__webpack_require__(12);
__webpack_require__(13);

if (true) {
	__webpack_require__(14);
};

if (false) {};


/***/ }),
/* 8 */
/***/ (function(module, exports, __webpack_require__) {

function iter$(a){ return a ? (a.toArray ? a.toArray() : a) : []; };
var Imba = __webpack_require__(0);

Imba.TagManagerClass = function TagManagerClass(){
	this._inserts = 0;
	this._removes = 0;
	this._mounted = [];
	this._mountables = 0;
	this._unmountables = 0;
	this._unmounting = 0;
	this;
};

Imba.TagManagerClass.prototype.mounted = function (){
	return this._mounted;
};

Imba.TagManagerClass.prototype.insert = function (node,parent){
	this._inserts++;
	if (node && node.mount) {
		if (!(node.FLAGS & Imba.TAG_MOUNTABLE)) {
			node.FLAGS |= Imba.TAG_MOUNTABLE;
			this._mountables++;
		};
	};
	return;
};

Imba.TagManagerClass.prototype.remove = function (node,parent){
	return this._removes++;
};


Imba.TagManagerClass.prototype.changes = function (){
	return this._inserts + this._removes;
};

Imba.TagManagerClass.prototype.mount = function (node){
	return;
};

Imba.TagManagerClass.prototype.refresh = function (force){
	if(force === undefined) force = false;
	if (false) {};
	if (!force && this.changes() == 0) { return };
	
	if ((this._inserts && this._mountables > this._mounted.length) || force) {
		this.tryMount();
	};
	
	if ((this._removes || force) && this._mounted.length) {
		this.tryUnmount();
	};
	
	this._inserts = 0;
	this._removes = 0;
	return this;
};

Imba.TagManagerClass.prototype.unmount = function (node){
	return this;
};

Imba.TagManagerClass.prototype.tryMount = function (){
	var count = 0;
	var root = document.body;
	var items = root.querySelectorAll('.__mount');
	
	for (let i = 0, ary = iter$(items), len = ary.length, el; i < len; i++) {
		el = ary[i];
		if (el && el._tag) {
			if (this._mounted.indexOf(el._tag) == -1) {
				this.mountNode(el._tag);
			};
		};
	};
	return this;
};

Imba.TagManagerClass.prototype.mountNode = function (node){
	if (this._mounted.indexOf(node) == -1) {
		this._mounted.push(node);
		node.FLAGS |= Imba.TAG_MOUNTED;
		if (node.mount) { node.mount() };
		
		let el = node.dom().parentNode;
		while (el && el._tag && !el._tag.mount && !(el._tag.FLAGS & Imba.TAG_MOUNTABLE)){
			el._tag.FLAGS |= Imba.TAG_MOUNTABLE;
			el = el.parentNode;
		};
	};
	return;
};

Imba.TagManagerClass.prototype.tryUnmount = function (){
	this._unmounting++;
	
	var unmount = [];
	var root = document.body;
	for (let i = 0, items = iter$(this._mounted), len = items.length, item; i < len; i++) {
		item = items[i];
		if (!item) { continue; };
		if (!document.documentElement.contains(item._dom)) {
			unmount.push(item);
			this._mounted[i] = null;
		};
	};
	
	this._unmounting--;
	
	if (unmount.length) {
		this._mounted = this._mounted.filter(function(item) { return item && unmount.indexOf(item) == -1; });
		for (let i = 0, len = unmount.length, item; i < len; i++) {
			item = unmount[i];
			item.FLAGS = item.FLAGS & ~Imba.TAG_MOUNTED;
			if (item.unmount && item._dom) {
				item.unmount();
			} else if (item._scheduler) {
				item.unschedule();
			};
		};
	};
	return this;
};


/***/ }),
/* 9 */
/***/ (function(module, exports, __webpack_require__) {

function iter$(a){ return a ? (a.toArray ? a.toArray() : a) : []; };
var Imba = __webpack_require__(0);
__webpack_require__(2);

var native$ = [
	'keydown','keyup','keypress',
	'textInput','input','change','submit',
	'focusin','focusout','focus','blur',
	'contextmenu','selectstart','dblclick','selectionchange',
	'mousewheel','wheel','scroll',
	'beforecopy','copy','beforepaste','paste','beforecut','cut',
	'dragstart','drag','dragend','dragenter','dragover','dragleave','dragexit','drop',
	'mouseup','mousedown','mouseenter','mouseleave','mouseout','mouseover','mousemove'
];



Imba.EventManager = function EventManager(node,pars){
	var self = this;
	if(!pars||pars.constructor !== Object) pars = {};
	var events = pars.events !== undefined ? pars.events : [];
	self._shimFocusEvents = true && window.netscape && node.onfocusin === undefined;
	self.setRoot(node);
	self.setListeners([]);
	self.setDelegators({});
	self.setDelegator(function(e) {
		self.delegate(e);
		return true;
	});
	
	for (let i = 0, items = iter$(events), len = items.length; i < len; i++) {
		self.register(items[i]);
	};
	
	return self;
};

Imba.EventManager.prototype.root = function(v){ return this._root; }
Imba.EventManager.prototype.setRoot = function(v){ this._root = v; return this; };
Imba.EventManager.prototype.count = function(v){ return this._count; }
Imba.EventManager.prototype.setCount = function(v){ this._count = v; return this; };
Imba.EventManager.prototype.__enabled = {'default': false,watch: 'enabledDidSet',name: 'enabled'};
Imba.EventManager.prototype.enabled = function(v){ return this._enabled; }
Imba.EventManager.prototype.setEnabled = function(v){
	var a = this.enabled();
	if(v != a) { this._enabled = v; }
	if(v != a) { this.enabledDidSet && this.enabledDidSet(v,a,this.__enabled) }
	return this;
}
Imba.EventManager.prototype._enabled = false;
Imba.EventManager.prototype.listeners = function(v){ return this._listeners; }
Imba.EventManager.prototype.setListeners = function(v){ this._listeners = v; return this; };
Imba.EventManager.prototype.delegators = function(v){ return this._delegators; }
Imba.EventManager.prototype.setDelegators = function(v){ this._delegators = v; return this; };
Imba.EventManager.prototype.delegator = function(v){ return this._delegator; }
Imba.EventManager.prototype.setDelegator = function(v){ this._delegator = v; return this; };

var initialBind = [];

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
	Imba.Events = new Imba.EventManager(Imba.document(),{events: []});
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
			e._imbaSimulatedTap = true;
			var tap = new Imba.Event(e);
			tap.setType('tap');
			tap.process();
			if (tap._responder && tap.defaultPrevented) {
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
	Imba.Events.setEnabled(true);
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
	
	if (this.delegators()[name]) { return this };
	
	
	var fn = this.delegators()[name] = (handler instanceof Function) ? handler : this.delegator();
	if (this.enabled()) { return this.root().addEventListener(name,fn,true) };
};

Imba.EventManager.prototype.autoregister = function (name){
	if (native$.indexOf(name) == -1) { return this };
	return this.register(name);
};

Imba.EventManager.prototype.listen = function (name,handler,capture){
	if(capture === undefined) capture = true;
	this.listeners().push([name,handler,capture]);
	if (this.enabled()) { this.root().addEventListener(name,handler,capture) };
	return this;
};

Imba.EventManager.prototype.delegate = function (e){
	var event = Imba.Event.wrap(e);
	event.process();
	if (this._shimFocusEvents) {
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
	if (data) { (event.setData(data),data) };
	if (source) { (event.setSource(source),source) };
	return event;
};



Imba.EventManager.prototype.trigger = function (){
	return this.create.apply(this,arguments).process();
};

Imba.EventManager.prototype.onenable = function (){
	for (let o = this.delegators(), handler, i = 0, keys = Object.keys(o), l = keys.length, name; i < l; i++){
		name = keys[i];handler = o[name];this.root().addEventListener(name,handler,true);
	};
	
	for (let i = 0, items = iter$(this.listeners()), len = items.length, item; i < len; i++) {
		item = items[i];
		this.root().addEventListener(item[0],item[1],item[2]);
	};
	
	if (true) {
		window.addEventListener('hashchange',Imba.commit);
		window.addEventListener('popstate',Imba.commit);
	};
	return this;
};

Imba.EventManager.prototype.ondisable = function (){
	for (let o = this.delegators(), handler, i = 0, keys = Object.keys(o), l = keys.length, name; i < l; i++){
		name = keys[i];handler = o[name];this.root().removeEventListener(name,handler,true);
	};
	
	for (let i = 0, items = iter$(this.listeners()), len = items.length, item; i < len; i++) {
		item = items[i];
		this.root().removeEventListener(item[0],item[1],item[2]);
	};
	
	if (true) {
		window.removeEventListener('hashchange',Imba.commit);
		window.removeEventListener('popstate',Imba.commit);
	};
	
	return this;
};


/***/ }),
/* 10 */
/***/ (function(module, exports, __webpack_require__) {

function iter$(a){ return a ? (a.toArray ? a.toArray() : a) : []; };
var Imba = __webpack_require__(0);

Imba.CSSKeyMap = {};

Imba.TAG_BUILT = 1;
Imba.TAG_SETUP = 2;
Imba.TAG_MOUNTING = 4;
Imba.TAG_MOUNTED = 8;
Imba.TAG_SCHEDULED = 16;
Imba.TAG_AWAKENED = 32;
Imba.TAG_MOUNTABLE = 64;



Imba.document = function (){
	return window.document;
};



Imba.root = function (){
	return Imba.getTagForDom(Imba.document().body);
};

Imba.static = function (items,typ,nr){
	items._type = typ;
	items.static = nr;
	return items;
};



Imba.mount = function (node,into){
	into || (into = Imba.document().body);
	into.appendChild(node.dom());
	Imba.TagManager.insert(node,into);
	node.scheduler().configure({events: true}).activate(false);
	Imba.TagManager.refresh();
	return node;
};


Imba.createTextNode = function (node){
	if (node && node.nodeType == 3) {
		return node;
	};
	return Imba.document().createTextNode(node);
};





Imba.Tag = function Tag(dom,ctx){
	this.setDom(dom);
	this.$ = TagCache.build(this);
	this.$up = this._owner_ = ctx;
	this._tree_ = null;
	this.FLAGS = 0;
	this.build();
	this;
};

Imba.Tag.buildNode = function (){
	var dom = Imba.document().createElement(this._nodeType || 'div');
	if (this._classes) {
		var cls = this._classes.join(" ");
		if (cls) { dom.className = cls };
	};
	return dom;
};

Imba.Tag.createNode = function (){
	var proto = (this._protoDom || (this._protoDom = this.buildNode()));
	return proto.cloneNode(false);
};

Imba.Tag.build = function (ctx){
	return new this(this.createNode(),ctx);
};

Imba.Tag.dom = function (){
	return this._protoDom || (this._protoDom = this.buildNode());
};

Imba.Tag.end = function (){
	return this.commit(0);
};



Imba.Tag.inherit = function (child){
	child._protoDom = null;
	
	if (this._nodeType) {
		child._nodeType = this._nodeType;
		child._classes = this._classes.slice();
		
		if (child._flagName) {
			return child._classes.push(child._flagName);
		};
	} else {
		child._nodeType = child._name;
		child._flagName = null;
		return child._classes = [];
	};
};



Imba.Tag.prototype.optimizeTagStructure = function (){
	if (false) {};
	var ctor = this.constructor;
	let keys = Object.keys(this);
	
	if (keys.indexOf('mount') >= 0) {
		if (ctor._classes && ctor._classes.indexOf('__mount') == -1) {
			ctor._classes.push('__mount');
		};
		
		if (ctor._protoDom) {
			ctor._protoDom.classList.add('__mount');
		};
	};
	
	for (let i = 0, items = iter$(keys), len = items.length, key; i < len; i++) {
		key = items[i];
		if ((/^on/).test(key)) { Imba.EventManager.bind(key.slice(2)) };
	};
	return this;
};


Imba.attr(Imba.Tag,'name');
Imba.attr(Imba.Tag,'role');
Imba.attr(Imba.Tag,'tabindex');
Imba.Tag.prototype.title = function(v){ return this.getAttribute('title'); }
Imba.Tag.prototype.setTitle = function(v){ this.setAttribute('title',v); return this; };

Imba.Tag.prototype.dom = function (){
	return this._dom;
};

Imba.Tag.prototype.setDom = function (dom){
	dom._tag = this;
	this._dom = this._slot_ = dom;
	return this;
};

Imba.Tag.prototype.ref = function (){
	return this._ref;
};

Imba.Tag.prototype.root = function (){
	return this._owner_ ? this._owner_.root() : this;
};



Imba.Tag.prototype.ref_ = function (ref){
	this.flag(this._ref = ref);
	return this;
};



Imba.Tag.prototype.setData = function (data){
	this._data = data;
	return this;
};



Imba.Tag.prototype.data = function (){
	return this._data;
};


Imba.Tag.prototype.bindData = function (target,path,args){
	return this.setData(args ? target[path].apply(target,args) : target[path]);
};



Imba.Tag.prototype.setHtml = function (html){
	if (this.html() != html) {
		this._dom.innerHTML = html;
	};
	return this;
};



Imba.Tag.prototype.html = function (){
	return this._dom.innerHTML;
};

Imba.Tag.prototype.on$ = function (slot,handler,context){
	let handlers = this._on_ || (this._on_ = []);
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


Imba.Tag.prototype.setId = function (id){
	if (id != null) {
		this.dom().id = id;
	};
	return this;
};

Imba.Tag.prototype.id = function (){
	return this.dom().id;
};



Imba.Tag.prototype.setAttribute = function (name,value){
	var old = this.dom().getAttribute(name);
	
	if (old == value) {
		value;
	} else if (value != null && value !== false) {
		this.dom().setAttribute(name,value);
	} else {
		this.dom().removeAttribute(name);
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
			this.dom().setAttributeNS(ns,name,value);
		} else {
			this.dom().removeAttributeNS(ns,name);
		};
	};
	return this;
};




Imba.Tag.prototype.removeAttribute = function (name){
	return this.dom().removeAttribute(name);
};



Imba.Tag.prototype.getAttribute = function (name){
	return this.dom().getAttribute(name);
};


Imba.Tag.prototype.getAttributeNS = function (ns,name){
	return this.dom().getAttributeNS(ns,name);
};


Imba.Tag.prototype.set = function (key,value,mods){
	let setter = Imba.toSetter(key);
	if (this[setter] instanceof Function) {
		this[setter](value,mods);
	} else {
		this._dom.setAttribute(key,value);
	};
	return this;
};


Imba.Tag.prototype.get = function (key){
	return this._dom.getAttribute(key);
};



Imba.Tag.prototype.setContent = function (content,type){
	this.setChildren(content,type);
	return this;
};



Imba.Tag.prototype.setChildren = function (nodes,type){
	// overridden on client by reconciler
	this._tree_ = nodes;
	return this;
};



Imba.Tag.prototype.setTemplate = function (template){
	if (!this._template) {
		if (this.render == Imba.Tag.prototype.render) {
			this.render = this.renderTemplate; 
		};
	};
	
	this.template = this._template = template;
	return this;
};

Imba.Tag.prototype.template = function (){
	return null;
};



Imba.Tag.prototype.renderTemplate = function (){
	var body = this.template();
	if (body != this) { this.setChildren(body) };
	return this;
};




Imba.Tag.prototype.removeChild = function (child){
	var par = this.dom();
	var el = child._slot_ || child;
	if (el && el.parentNode == par) {
		Imba.TagManager.remove(el._tag || el,this);
		par.removeChild(el);
	};
	return this;
};



Imba.Tag.prototype.removeAllChildren = function (){
	if (this._dom.firstChild) {
		var el;
		while (el = this._dom.firstChild){
			true && Imba.TagManager.remove(el._tag || el,this);
			this._dom.removeChild(el);
		};
	};
	this._tree_ = this._text_ = null;
	return this;
};



Imba.Tag.prototype.appendChild = function (node){
	if ((typeof node=='string'||node instanceof String)) {
		this.dom().appendChild(Imba.document().createTextNode(node));
	} else if (node) {
		this.dom().appendChild(node._slot_ || node);
		Imba.TagManager.insert(node._tag || node,this);
		
	};
	return this;
};



Imba.Tag.prototype.insertBefore = function (node,rel){
	if ((typeof node=='string'||node instanceof String)) {
		node = Imba.document().createTextNode(node);
	};
	
	if (node && rel) {
		this.dom().insertBefore((node._slot_ || node),(rel._slot_ || rel));
		Imba.TagManager.insert(node._tag || node,this);
		
	};
	return this;
};

Imba.Tag.prototype.detachFromParent = function (){
	if (this._slot_ == this._dom) {
		this._slot_ = (this._dom._placeholder_ || (this._dom._placeholder_ = Imba.document().createComment("node")));
		this._slot_._tag || (this._slot_._tag = this);
		
		if (this._dom.parentNode) {
			Imba.TagManager.remove(this,this._dom.parentNode);
			this._dom.parentNode.replaceChild(this._slot_,this._dom);
		};
	};
	return this;
};

Imba.Tag.prototype.attachToParent = function (){
	if (this._slot_ != this._dom) {
		let prev = this._slot_;
		this._slot_ = this._dom;
		if (prev && prev.parentNode) {
			Imba.TagManager.insert(this);
			prev.parentNode.replaceChild(this._dom,prev);
		};
	};
	
	return this;
};



Imba.Tag.prototype.orphanize = function (){
	var par;
	if (par = this.parent()) { par.removeChild(this) };
	return this;
};



Imba.Tag.prototype.text = function (v){
	return this._dom.textContent;
};



Imba.Tag.prototype.setText = function (txt){
	this._tree_ = txt;
	this._dom.textContent = (txt == null || this.text() === false) ? '' : txt;
	this;
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
	
	var dataset = this.dom().dataset;
	
	if (!dataset) {
		dataset = {};
		for (let i = 0, items = iter$(this.dom().attributes), len = items.length, atr; i < len; i++) {
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
	if (this.beforeRender() !== false) this.render();
	return this;
};

Imba.Tag.prototype.beforeRender = function (){
	return this;
};



Imba.Tag.prototype.tick = function (){
	if (this.beforeRender() !== false) this.render();
	return this;
};



Imba.Tag.prototype.end = function (){
	this.setup();
	this.commit(0);
	this.end = Imba.Tag.end;
	return this;
};


Imba.Tag.prototype.$open = function (context){
	if (context != this._context_) {
		this._tree_ = null;
		this._context_ = context;
	};
	return this;
};



Imba.Tag.prototype.synced = function (){
	return this;
};




Imba.Tag.prototype.awaken = function (){
	return this;
};



Imba.Tag.prototype.flags = function (){
	return this._dom.classList;
};



Imba.Tag.prototype.flag = function (name,toggler){
	// it is most natural to treat a second undefined argument as a no-switch
	// so we need to check the arguments-length
	if (arguments.length == 2) {
		if (this._dom.classList.contains(name) != !!toggler) {
			this._dom.classList.toggle(name);
		};
	} else {
		// firefox will trigger a change if adding existing class
		if (!this._dom.classList.contains(name)) { this._dom.classList.add(name) };
	};
	return this;
};



Imba.Tag.prototype.unflag = function (name){
	this._dom.classList.remove(name);
	return this;
};



Imba.Tag.prototype.toggleFlag = function (name){
	this._dom.classList.toggle(name);
	return this;
};



Imba.Tag.prototype.hasFlag = function (name){
	return this._dom.classList.contains(name);
};


Imba.Tag.prototype.flagIf = function (flag,bool){
	var f = this._flags_ || (this._flags_ = {});
	let prev = f[flag];
	
	if (bool && !prev) {
		this._dom.classList.add(flag);
		f[flag] = true;
	} else if (prev && !bool) {
		this._dom.classList.remove(flag);
		f[flag] = false;
	};
	
	return this;
};



Imba.Tag.prototype.setFlag = function (name,value){
	let flags = this._namedFlags_ || (this._namedFlags_ = {});
	let prev = flags[name];
	if (prev != value) {
		if (prev) { this.unflag(prev) };
		if (value) { this.flag(value) };
		flags[name] = value;
	};
	return this;
};




Imba.Tag.prototype.scheduler = function (){
	return (this._scheduler == null) ? (this._scheduler = new Imba.Scheduler(this)) : this._scheduler;
};



Imba.Tag.prototype.schedule = function (options){
	if(options === undefined) options = {events: true};
	this.scheduler().configure(options).activate();
	return this;
};



Imba.Tag.prototype.unschedule = function (){
	if (this._scheduler) { this.scheduler().deactivate() };
	return this;
};




Imba.Tag.prototype.parent = function (){
	return Imba.getTagForDom(this.dom().parentNode);
};



Imba.Tag.prototype.children = function (sel){
	let res = [];
	for (let i = 0, items = iter$(this._dom.children), len = items.length, item; i < len; i++) {
		item = items[i];
		res.push(item._tag || Imba.getTagForDom(item));
	};
	return res;
};

Imba.Tag.prototype.querySelector = function (q){
	return Imba.getTagForDom(this._dom.querySelector(q));
};

Imba.Tag.prototype.querySelectorAll = function (q){
	var items = [];
	for (let i = 0, ary = iter$(this._dom.querySelectorAll(q)), len = ary.length; i < len; i++) {
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
	if (fn = (this._dom.matches || this._dom.matchesSelector || this._dom.webkitMatchesSelector || this._dom.msMatchesSelector || this._dom.mozMatchesSelector)) {
		return fn.call(this._dom,sel);
	};
};



Imba.Tag.prototype.closest = function (sel){
	return Imba.getTagForDom(this._dom.closest(sel));
};



Imba.Tag.prototype.contains = function (node){
	return this.dom().contains(node._dom || node);
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
		this.dom().style.removeProperty(name);
	} else if (val == undefined && arguments.length == 1) {
		return this.dom().style[name];
	} else if (name.match(/^--/)) {
		this.dom().style.setProperty(name,val);
	} else {
		if ((typeof val=='number'||val instanceof Number) && (name.match(/width|height|left|right|top|bottom/) || (mod && mod.px))) {
			this.dom().style[name] = val + "px";
		} else {
			this.dom().style[name] = val;
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
	return true && Imba.Events.trigger(name,this,{data: data});
};



Imba.Tag.prototype.focus = function (){
	this.dom().focus();
	return this;
};



Imba.Tag.prototype.blur = function (){
	this.dom().blur();
	return this;
};

Imba.Tag.prototype.toString = function (){
	return this.dom().outerHTML;
};


Imba.Tag.prototype.initialize = Imba.Tag;

Imba.SVGTag = function SVGTag(){ return Imba.Tag.apply(this,arguments) };

Imba.subclass(Imba.SVGTag,Imba.Tag);
Imba.SVGTag.namespaceURI = function (){
	return "http://www.w3.org/2000/svg";
};

Imba.SVGTag.buildNode = function (){
	var dom = Imba.document().createElementNS(this.namespaceURI(),this._nodeType);
	if (this._classes) {
		var cls = this._classes.join(" ");
		if (cls) { dom.className.baseVal = cls };
	};
	return dom;
};

Imba.SVGTag.inherit = function (child){
	child._protoDom = null;
	
	if (this == Imba.SVGTag) {
		child._nodeType = child._name;
		return child._classes = [];
	} else {
		child._nodeType = this._nodeType;
		var className = "_" + child._name.replace(/_/g,'-');
		return child._classes = (this._classes || []).concat(className);
	};
};

Imba.HTML_TAGS = "a abbr address area article aside audio b base bdi bdo big blockquote body br button canvas caption cite code col colgroup data datalist dd del details dfn div dl dt em embed fieldset figcaption figure footer form h1 h2 h3 h4 h5 h6 head header hr html i iframe img input ins kbd keygen label legend li link main map mark menu menuitem meta meter nav noscript object ol optgroup option output p param pre progress q rp rt ruby s samp script section select small source span strong style sub summary sup table tbody td textarea tfoot th thead time title tr track u ul var video wbr".split(" ");
Imba.HTML_TAGS_UNSAFE = "article aside header section".split(" ");

Imba.HTML_ATTRS = {
	a: "href target hreflang media download rel type",
	form: "method action enctype autocomplete target",
	button: "autofocus type",
	input: "accept disabled form list max maxlength min minlength pattern required size step type",
	label: "accesskey for form",
	img: "src srcset",
	link: "rel type href media",
	iframe: "referrerpolicy src srcdoc sandbox",
	meta: "property content charset desc",
	optgroup: "label",
	option: "label",
	output: "for form",
	object: "type data width height",
	param: "name value",
	progress: "max",
	script: "src type async defer crossorigin integrity nonce language",
	select: "size form multiple",
	textarea: "rows cols minlength maxlength",
	td: "colspan rowspan",
	th: "colspan rowspan"
};


Imba.HTML_PROPS = {
	input: "autofocus autocomplete autocorrect value placeholder required disabled multiple checked readOnly",
	textarea: "autofocus autocomplete autocorrect value placeholder required disabled multiple checked readOnly",
	form: "novalidate",
	fieldset: "disabled",
	button: "disabled",
	select: "autofocus disabled required",
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
	clone._parent = this;
	return clone;
};

Imba.Tags.prototype.ns = function (name){
	return this['_' + name.toUpperCase()] || this.defineNamespace(name);
};

Imba.Tags.prototype.defineNamespace = function (name){
	var clone = Object.create(this);
	clone._parent = this;
	clone._ns = name;
	this['_' + name.toUpperCase()] = clone;
	return clone;
};

Imba.Tags.prototype.baseType = function (name,ns){
	return (Imba.indexOf(name,Imba.HTML_TAGS) >= 0) ? 'element' : 'div';
};

Imba.Tags.prototype.defineTag = function (fullName,supr,body){
	if(body==undefined && typeof supr == 'function') body = supr,supr = '';
	if(supr==undefined) supr = '';
	if (body && body._nodeType) {
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
	
	tagtype._name = name;
	tagtype._flagName = null;
	
	if (name[0] == '#') {
		Imba.SINGLETONS[name.slice(1)] = tagtype;
		this[name] = tagtype;
	} else if (name[0] == name[0].toUpperCase()) {
		tagtype._flagName = name;
	} else {
		tagtype._flagName = "_" + fullName.replace(/[_\:]/g,'-');
		this[fullName] = tagtype;
	};
	
	extender(tagtype,supertype);
	
	if (body) {
		body.call(tagtype,tagtype,tagtype.TAGS || this);
		if (tagtype.defined) { tagtype.defined() };
		this.optimizeTag(tagtype);
	};
	return tagtype;
};

Imba.Tags.prototype.defineSingleton = function (name,supr,body){
	return this.defineTag(name,supr,body);
};

Imba.Tags.prototype.extendTag = function (name,supr,body){
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
	var attrs, props;
	let klass = this[type];
	if (!klass) {
		if (type.substr(0,4) == 'svg:') {
			klass = this.defineTag(type,'svg:element');
		} else if (Imba.HTML_TAGS.indexOf(type) >= 0) {
			klass = this.defineTag(type,'element');
			
			if (attrs = Imba.HTML_ATTRS[type]) {
				for (let i = 0, items = iter$(attrs.split(" ")), len = items.length; i < len; i++) {
					Imba.attr(klass,items[i]);
				};
			};
			
			if (props = Imba.HTML_PROPS[type]) {
				for (let i = 0, items = iter$(props.split(" ")), len = items.length; i < len; i++) {
					Imba.attr(klass,items[i],{dom: true});
				};
			};
		};
	};
	return klass;
};

Imba.createElement = function (name,ctx,ref,pref){
	var type = name;
	var parent;
	if (name instanceof Function) {
		type = name;
	} else {
		if (null) {};
		type = Imba.TAGS.findTagType(name);
	};
	
	if (ctx instanceof TagMap) {
		parent = ctx.par$;
	} else if (pref instanceof Imba.Tag) {
		parent = pref;
	} else {
		parent = (ctx && pref != undefined) ? ctx[pref] : ((ctx && ctx._tag || ctx));
	};
	
	var node = type.build(parent);
	
	if (ctx instanceof TagMap) {
		ctx.i$++;
		node.$key = ref;
	};
	
	if (ctx && ref != undefined) {
		ctx[ref] = node;
	};
	
	return node;
};

Imba.createTagCache = function (owner){
	var item = [];
	item._tag = owner;
	return item;
	
	var par = ((this.pref() != undefined) ? this.ctx()[this.pref()] : this.ctx()._tag);
	var node = new TagMap(this.ctx(),this.ref(),par);
	this.ctx()[this.ref()] = node;
	return node;
};

Imba.createTagMap = function (ctx,ref,pref){
	var par = ((pref != undefined) ? pref : ctx._tag);
	var node = new TagMap(ctx,ref,par);
	ctx[ref] = node;
	return node;
};

Imba.createTagList = function (ctx,ref,pref){
	var node = [];
	node._type = 4;
	node._tag = ((pref != undefined) ? pref : ctx._tag);
	ctx[ref] = node;
	return node;
};

Imba.createTagLoopResult = function (ctx,ref,pref){
	var node = [];
	node._type = 5;
	node.cache = {i$: 0};
	return node;
};


function TagCache(owner){
	this._tag = owner;
	this;
};
TagCache.build = function (owner){
	var item = [];
	item._tag = owner;
	return item;
};



function TagMap(cache,ref,par){
	this.cache$ = cache;
	this.key$ = ref;
	this.par$ = par;
	this.i$ = 0;
};

TagMap.prototype.$iter = function (){
	var item = [];
	item._type = 5;
	item.cache = this;
	return item;
};

TagMap.prototype.$prune = function (items){
	let cache = this.cache$;
	let key = this.key$;
	let clone = new TagMap(cache,key,this.par$);
	for (let i = 0, ary = iter$(items), len = ary.length, item; i < len; i++) {
		item = ary[i];
		clone[item.key$] = item;
	};
	clone.i$ = items.length;
	return cache[key] = clone;
};

Imba.TagMap = TagMap;
Imba.TagCache = TagCache;
Imba.SINGLETONS = {};
Imba.TAGS = new Imba.Tags();
Imba.TAGS.element = Imba.TAGS.htmlelement = Imba.Tag;
Imba.TAGS['svg:element'] = Imba.SVGTag;

Imba.defineTag = function (name,supr,body){
	if(body==undefined && typeof supr == 'function') body = supr,supr = '';
	if(supr==undefined) supr = '';
	return Imba.TAGS.defineTag(name,supr,body);
};

Imba.defineSingletonTag = function (id,supr,body){
	if(body==undefined && typeof supr == 'function') body = supr,supr = 'div';
	if(supr==undefined) supr = 'div';
	return Imba.TAGS.defineTag(this.name(),supr,body);
};

Imba.extendTag = function (name,body){
	return Imba.TAGS.extendTag(name,body);
};

Imba.getTagSingleton = function (id){
	var klass;
	var dom,node;
	
	if (klass = Imba.SINGLETONS[id]) {
		if (klass && klass.Instance) { return klass.Instance };
		
		
		if (dom = Imba.document().getElementById(id)) {
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
	} else if (dom = Imba.document().getElementById(id)) {
		return Imba.getTagForDom(dom);
	};
};

var svgSupport = typeof SVGElement !== 'undefined';


Imba.getTagForDom = function (dom){
	if (!dom) { return null };
	if (dom._dom) { return dom };
	if (dom._tag) { return dom._tag };
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


if (false) {
	var styles = window.getComputedStyle(document.documentElement,'');
	
	for (let i = 0, items = iter$(styles), len = items.length, prefixed; i < len; i++) {
		prefixed = items[i];
		var unprefixed = prefixed.replace(/^-(webkit|ms|moz|o|blink)-/,'');
		var camelCase = unprefixed.replace(/-(\w)/g,function(m,a) { return a.toUpperCase(); });
		
		
		if (prefixed != unprefixed) {
			if (styles.hasOwnProperty(unprefixed)) { continue; };
		};
		
		
		Imba.CSSKeyMap[unprefixed] = Imba.CSSKeyMap[camelCase] = prefixed;
	};
	
	
	if (!document.documentElement.classList) {
		Imba.extendTag('element', function(tag){
			
			tag.prototype.hasFlag = function (ref){
				return new RegExp('(^|\\s)' + ref + '(\\s|$)').test(this._dom.className);
			};
			
			tag.prototype.addFlag = function (ref){
				if (this.hasFlag(ref)) { return this };
				this._dom.className += (this._dom.className ? ' ' : '') + ref;
				return this;
			};
			
			tag.prototype.unflag = function (ref){
				if (!this.hasFlag(ref)) { return this };
				var regex = new RegExp('(^|\\s)*' + ref + '(\\s|$)*','g');
				this._dom.className = this._dom.className.replace(regex,'');
				return this;
			};
			
			tag.prototype.toggleFlag = function (ref){
				return this.hasFlag(ref) ? this.unflag(ref) : this.flag(ref);
			};
			
			tag.prototype.flag = function (ref,bool){
				if (arguments.length == 2 && !!bool === false) {
					return this.unflag(ref);
				};
				return this.addFlag(ref);
			};
		});
	};
};

Imba.Tag;


/***/ }),
/* 11 */
/***/ (function(module, exports, __webpack_require__) {

function iter$(a){ return a ? (a.toArray ? a.toArray() : a) : []; };
var Imba = __webpack_require__(0);

Imba.defineTag('fragment', 'element', function(tag){
	tag.createNode = function (){
		return Imba.document().createDocumentFragment();
	};
});

Imba.extendTag('html', function(tag){
	tag.prototype.parent = function (){
		return null;
	};
});

Imba.extendTag('canvas', function(tag){
	tag.prototype.context = function (type){
		if(type === undefined) type = '2d';
		return this.dom().getContext(type);
	};
});

function DataProxy(node,path,args){
	this._node = node;
	this._path = path;
	this._args = args;
	if (this._args) { this._setter = Imba.toSetter(this._path) };
};

DataProxy.bind = function (receiver,data,path,args){
	let proxy = receiver._data || (receiver._data = new this(receiver,path,args));
	proxy.bind(data,path,args);
	return receiver;
};

DataProxy.prototype.bind = function (data,key,args){
	if (data != this._data) {
		this._data = data;
	};
	return this;
};

DataProxy.prototype.getFormValue = function (){
	return this._setter ? this._data[this._path]() : this._data[this._path];
};

DataProxy.prototype.setFormValue = function (value){
	return this._setter ? this._data[this._setter](value) : ((this._data[this._path] = value));
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

Imba.extendTag('input', function(tag){
	tag.prototype.lazy = function(v){ return this._lazy; }
	tag.prototype.setLazy = function(v){ this._lazy = v; return this; };
	tag.prototype.number = function(v){ return this._number; }
	tag.prototype.setNumber = function(v){ this._number = v; return this; };
	
	tag.prototype.bindData = function (target,path,args){
		DataProxy.bind(this,target,path,args);
		return this;
	};
	
	tag.prototype.checked = function (){
		return this._dom.checked;
	};
	
	tag.prototype.setChecked = function (value){
		if (!!value != this._dom.checked) {
			this._dom.checked = !!value;
		};
		return this;
	};
	
	tag.prototype.setValue = function (value,source){
		if (this._localValue == undefined || source == undefined) {
			this.dom().value = this._value = value;
			this._localValue = undefined;
		};
		return this;
	};
	
	tag.prototype.setType = function (value){
		this.dom().type = this._type = value;
		return this;
	};
	
	tag.prototype.value = function (){
		let val = this._dom.value;
		return (this._number && val) ? parseFloat(val) : val;
	};
	
	tag.prototype.oninput = function (e){
		let val = this._dom.value;
		this._localValue = val;
		if (this._data && !(this.lazy())) { return this._data.setFormValue(this.value(),this) };
	};
	
	tag.prototype.onchange = function (e){
		this._modelValue = this._localValue = undefined;
		if (!(this.data())) { return };
		
		if (this.type() == 'radio' || this.type() == 'checkbox') {
			let checked = this._dom.checked;
			let mval = this._data.getFormValue(this);
			let dval = (this._value != undefined) ? this._value : this.value();
			
			if (this.type() == 'radio') {
				return this._data.setFormValue(dval,this);
			} else if (this.dom().value == 'on') {
				return this._data.setFormValue(!!checked,this);
			} else if (isArray(mval)) {
				let idx = mval.indexOf(dval);
				if (checked && idx == -1) {
					return mval.push(dval);
				} else if (!checked && idx >= 0) {
					return mval.splice(idx,1);
				};
			} else {
				return this._data.setFormValue(dval,this);
			};
		} else {
			return this._data.setFormValue(this.value());
		};
	};
	
	tag.prototype.onblur = function (e){
		return this._localValue = undefined;
	};
	
	
	tag.prototype.end = function (){
		if (this._localValue !== undefined || !this._data) {
			return this;
		};
		
		let mval = this._data.getFormValue(this);
		if (mval == this._modelValue) { return this };
		if (!isArray(mval)) { this._modelValue = mval };
		
		if (this.type() == 'radio' || this.type() == 'checkbox') {
			let dval = this._value;
			let checked = isArray(mval) ? (
				mval.indexOf(dval) >= 0
			) : ((this.dom().value == 'on') ? (
				!!mval
			) : (
				mval == this._value
			));
			
			this._dom.checked = checked;
		} else {
			this._dom.value = mval;
		};
		return this;
	};
});

Imba.extendTag('textarea', function(tag){
	tag.prototype.lazy = function(v){ return this._lazy; }
	tag.prototype.setLazy = function(v){ this._lazy = v; return this; };
	
	tag.prototype.bindData = function (target,path,args){
		DataProxy.bind(this,target,path,args);
		return this;
	};
	
	tag.prototype.setValue = function (value,source){
		if (this._localValue == undefined || source == undefined) {
			this.dom().value = value;
			this._localValue = undefined;
		};
		return this;
	};
	
	tag.prototype.oninput = function (e){
		let val = this._dom.value;
		this._localValue = val;
		if (this._data && !(this.lazy())) { return this._data.setFormValue(this.value(),this) };
	};
	
	tag.prototype.onchange = function (e){
		this._localValue = undefined;
		if (this._data) { return this._data.setFormValue(this.value(),this) };
	};
	
	tag.prototype.onblur = function (e){
		return this._localValue = undefined;
	};
	
	tag.prototype.render = function (){
		if (this._localValue != undefined || !this._data) { return };
		if (this._data) {
			let dval = this._data.getFormValue(this);
			this._dom.value = (dval != undefined) ? dval : '';
		};
		return this;
	};
});

Imba.extendTag('option', function(tag){
	tag.prototype.setValue = function (value){
		if (value != this._value) {
			this.dom().value = this._value = value;
		};
		return this;
	};
	
	tag.prototype.value = function (){
		return this._value || this.dom().value;
	};
});

Imba.extendTag('select', function(tag){
	tag.prototype.bindData = function (target,path,args){
		DataProxy.bind(this,target,path,args);
		return this;
	};
	
	tag.prototype.setValue = function (value,syncing){
		let prev = this._value;
		this._value = value;
		if (!syncing) { this.syncValue(value) };
		return this;
	};
	
	tag.prototype.syncValue = function (value){
		let prev = this._syncValue;
		
		if (this.multiple() && (value instanceof Array)) {
			if ((prev instanceof Array) && isSimilarArray(prev,value)) {
				return this;
			};
			
			value = value.slice();
		};
		
		this._syncValue = value;
		
		if (typeof value == 'object') {
			let mult = this.multiple() && (value instanceof Array);
			
			for (let i = 0, items = iter$(this.dom().options), len = items.length, opt; i < len; i++) {
				opt = items[i];
				let oval = (opt._tag ? opt._tag.value() : opt.value);
				if (mult) {
					opt.selected = value.indexOf(oval) >= 0;
				} else if (value == oval) {
					this.dom().selectedIndex = i;
					break;
				};
			};
		} else {
			this.dom().value = value;
		};
		return this;
	};
	
	tag.prototype.value = function (){
		if (this.multiple()) {
			let res = [];
			for (let i = 0, items = iter$(this.dom().selectedOptions), len = items.length, option; i < len; i++) {
				option = items[i];
				res.push(option._tag ? option._tag.value() : option.value);
			};
			return res;
		} else {
			let opt = this.dom().selectedOptions[0];
			return opt ? ((opt._tag ? opt._tag.value() : opt.value)) : null;
		};
	};
	
	tag.prototype.onchange = function (e){
		if (this._data) { return this._data.setFormValue(this.value(),this) };
	};
	
	tag.prototype.end = function (){
		if (this._data) {
			this.setValue(this._data.getFormValue(this),1);
		};
		
		if (this._value != this._syncValue) {
			this.syncValue(this._value);
		};
		return this;
	};
});


/***/ }),
/* 12 */
/***/ (function(module, exports, __webpack_require__) {

function iter$(a){ return a ? (a.toArray ? a.toArray() : a) : []; };
var Imba = __webpack_require__(0);










Imba.Touch = function Touch(event,pointer){
	// @native  = false
	this.setEvent(event);
	this.setData({});
	this.setActive(true);
	this._button = event && event.button || 0;
	this._suppress = false; 
	this._captured = false;
	this.setBubble(false);
	pointer = pointer;
	this.setUpdates(0);
	return this;
};

Imba.Touch.LastTimestamp = 0;
Imba.Touch.TapTimeout = 50;



var touches = [];
var count = 0;
var identifiers = {};

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


Imba.Touch.prototype.phase = function(v){ return this._phase; }
Imba.Touch.prototype.setPhase = function(v){ this._phase = v; return this; };
Imba.Touch.prototype.active = function(v){ return this._active; }
Imba.Touch.prototype.setActive = function(v){ this._active = v; return this; };
Imba.Touch.prototype.event = function(v){ return this._event; }
Imba.Touch.prototype.setEvent = function(v){ this._event = v; return this; };
Imba.Touch.prototype.pointer = function(v){ return this._pointer; }
Imba.Touch.prototype.setPointer = function(v){ this._pointer = v; return this; };
Imba.Touch.prototype.target = function(v){ return this._target; }
Imba.Touch.prototype.setTarget = function(v){ this._target = v; return this; };
Imba.Touch.prototype.handler = function(v){ return this._handler; }
Imba.Touch.prototype.setHandler = function(v){ this._handler = v; return this; };
Imba.Touch.prototype.updates = function(v){ return this._updates; }
Imba.Touch.prototype.setUpdates = function(v){ this._updates = v; return this; };
Imba.Touch.prototype.suppress = function(v){ return this._suppress; }
Imba.Touch.prototype.setSuppress = function(v){ this._suppress = v; return this; };
Imba.Touch.prototype.data = function(v){ return this._data; }
Imba.Touch.prototype.setData = function(v){ this._data = v; return this; };
Imba.Touch.prototype.__bubble = {chainable: true,name: 'bubble'};
Imba.Touch.prototype.bubble = function(v){ return v !== undefined ? (this.setBubble(v),this) : this._bubble; }
Imba.Touch.prototype.setBubble = function(v){ this._bubble = v; return this; };
Imba.Touch.prototype.timestamp = function(v){ return this._timestamp; }
Imba.Touch.prototype.setTimestamp = function(v){ this._timestamp = v; return this; };

Imba.Touch.prototype.gestures = function(v){ return this._gestures; }
Imba.Touch.prototype.setGestures = function(v){ this._gestures = v; return this; };



Imba.Touch.prototype.capture = function (){
	this._captured = true;
	this._event && this._event.stopPropagation();
	if (!this._selblocker) {
		this._selblocker = function(e) { return e.preventDefault(); };
		Imba.document().addEventListener('selectstart',this._selblocker,true);
	};
	return this;
};

Imba.Touch.prototype.isCaptured = function (){
	return !!this._captured;
};



Imba.Touch.prototype.extend = function (plugin){
	// console.log "added gesture!!!"
	this._gestures || (this._gestures = []);
	this._gestures.push(plugin);
	return this;
};



Imba.Touch.prototype.redirect = function (target){
	this._redirect = target;
	return this;
};



Imba.Touch.prototype.suppress = function (){
	// collision with the suppress property
	this._active = false;
	
	return this;
};

Imba.Touch.prototype.setSuppress = function (value){
	console.warn('Imba.Touch#suppress= is deprecated');
	this._supress = value;
	this;
	return this;
};

Imba.Touch.prototype.touchstart = function (e,t){
	this._event = e;
	this._touch = t;
	this._button = 0;
	this._x = t.clientX;
	this._y = t.clientY;
	this.began();
	this.update();
	if (e && this.isCaptured()) { e.preventDefault() };
	return this;
};

Imba.Touch.prototype.touchmove = function (e,t){
	this._event = e;
	this._x = t.clientX;
	this._y = t.clientY;
	this.update();
	if (e && this.isCaptured()) { e.preventDefault() };
	return this;
};

Imba.Touch.prototype.touchend = function (e,t){
	this._event = e;
	this._x = t.clientX;
	this._y = t.clientY;
	this.ended();
	
	Imba.Touch.LastTimestamp = e.timeStamp;
	
	if (this._maxdr < 20) {
		var tap = new Imba.Event(e);
		tap.setType('tap');
		tap.process();
	};
	
	if (e && this.isCaptured()) {
		e.preventDefault();
	};
	
	return this;
};

Imba.Touch.prototype.touchcancel = function (e,t){
	return this.cancel();
};

Imba.Touch.prototype.mousedown = function (e,t){
	var self = this;
	self._event = e;
	self._button = e.button;
	self._x = t.clientX;
	self._y = t.clientY;
	self.began();
	self.update();
	self._mousemove = function(e) { return self.mousemove(e,e); };
	Imba.document().addEventListener('mousemove',self._mousemove,true);
	return self;
};

Imba.Touch.prototype.mousemove = function (e,t){
	this._x = t.clientX;
	this._y = t.clientY;
	this._event = e;
	if (this.isCaptured()) { e.preventDefault() };
	this.update();
	this.move();
	return this;
};

Imba.Touch.prototype.mouseup = function (e,t){
	this._x = t.clientX;
	this._y = t.clientY;
	this.ended();
	return this;
};

Imba.Touch.prototype.idle = function (){
	return this.update();
};

Imba.Touch.prototype.began = function (){
	this._timestamp = Date.now();
	this._maxdr = this._dr = 0;
	this._x0 = this._x;
	this._y0 = this._y;
	
	var dom = this.event().target;
	var node = null;
	
	this._sourceTarget = dom && Imba.getTagForDom(dom);
	
	while (dom){
		node = Imba.getTagForDom(dom);
		if (node && node.ontouchstart) {
			this._bubble = false;
			this.setTarget(node);
			this.target().ontouchstart(this);
			if (!this._bubble) { break; };
		};
		dom = dom.parentNode;
	};
	
	this._updates++;
	return this;
};

Imba.Touch.prototype.update = function (){
	var target_;
	if (!this._active || this._cancelled) { return this };
	
	var dr = Math.sqrt(this.dx() * this.dx() + this.dy() * this.dy());
	if (dr > this._dr) { this._maxdr = dr };
	this._dr = dr;
	
	
	if (this._redirect) {
		if (this._target && this._target.ontouchcancel) {
			this._target.ontouchcancel(this);
		};
		this.setTarget(this._redirect);
		this._redirect = null;
		if (this.target().ontouchstart) { this.target().ontouchstart(this) };
		if (this._redirect) { return this.update() }; 
	};
	
	
	this._updates++;
	if (this._gestures) {
		for (let i = 0, items = iter$(this._gestures), len = items.length; i < len; i++) {
			items[i].ontouchupdate(this);
		};
	};
	
	(target_ = this.target()) && target_.ontouchupdate  &&  target_.ontouchupdate(this);
	if (this._redirect) this.update();
	return this;
};

Imba.Touch.prototype.move = function (){
	var target_;
	if (!this._active || this._cancelled) { return this };
	
	if (this._gestures) {
		for (let i = 0, items = iter$(this._gestures), len = items.length, g; i < len; i++) {
			g = items[i];
			if (g.ontouchmove) { g.ontouchmove(this,this._event) };
		};
	};
	
	(target_ = this.target()) && target_.ontouchmove  &&  target_.ontouchmove(this,this._event);
	return this;
};

Imba.Touch.prototype.ended = function (){
	var target_;
	if (!this._active || this._cancelled) { return this };
	
	this._updates++;
	
	if (this._gestures) {
		for (let i = 0, items = iter$(this._gestures), len = items.length; i < len; i++) {
			items[i].ontouchend(this);
		};
	};
	
	(target_ = this.target()) && target_.ontouchend  &&  target_.ontouchend(this);
	this.cleanup_();
	return this;
};

Imba.Touch.prototype.cancel = function (){
	if (!this._cancelled) {
		this._cancelled = true;
		this.cancelled();
		this.cleanup_();
	};
	return this;
};

Imba.Touch.prototype.cancelled = function (){
	var target_;
	if (!this._active) { return this };
	
	this._cancelled = true;
	this._updates++;
	
	if (this._gestures) {
		for (let i = 0, items = iter$(this._gestures), len = items.length, g; i < len; i++) {
			g = items[i];
			if (g.ontouchcancel) { g.ontouchcancel(this) };
		};
	};
	
	(target_ = this.target()) && target_.ontouchcancel  &&  target_.ontouchcancel(this);
	return this;
};

Imba.Touch.prototype.cleanup_ = function (){
	if (this._mousemove) {
		Imba.document().removeEventListener('mousemove',this._mousemove,true);
		this._mousemove = null;
	};
	
	if (this._selblocker) {
		Imba.document().removeEventListener('selectstart',this._selblocker,true);
		this._selblocker = null;
	};
	
	return this;
};



Imba.Touch.prototype.dr = function (){
	return this._dr;
};



Imba.Touch.prototype.dx = function (){
	return this._x - this._x0;
};



Imba.Touch.prototype.dy = function (){
	return this._y - this._y0;
};



Imba.Touch.prototype.x0 = function (){
	return this._x0;
};



Imba.Touch.prototype.y0 = function (){
	return this._y0;
};



Imba.Touch.prototype.x = function (){
	return this._x;
};



Imba.Touch.prototype.y = function (){
	return this._y;
};



Imba.Touch.prototype.tx = function (){
	this._targetBox || (this._targetBox = this._target.dom().getBoundingClientRect());
	return this._x - this._targetBox.left;
};



Imba.Touch.prototype.ty = function (){
	this._targetBox || (this._targetBox = this._target.dom().getBoundingClientRect());
	return this._y - this._targetBox.top;
};



Imba.Touch.prototype.button = function (){
	return this._button;
}; 

Imba.Touch.prototype.sourceTarget = function (){
	return this._sourceTarget;
};

Imba.Touch.prototype.elapsed = function (){
	return Date.now() - this._timestamp;
};


Imba.TouchGesture = function TouchGesture(){ };

Imba.TouchGesture.prototype.__active = {'default': false,name: 'active'};
Imba.TouchGesture.prototype.active = function(v){ return this._active; }
Imba.TouchGesture.prototype.setActive = function(v){ this._active = v; return this; }
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
/* 13 */
/***/ (function(module, exports, __webpack_require__) {

function iter$(a){ return a ? (a.toArray ? a.toArray() : a) : []; };
var Imba = __webpack_require__(0);

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
	return e.event().ctrlKey == true;
};
el.altModifier = function (e){
	return e.event().altKey == true;
};
el.shiftModifier = function (e){
	return e.event().shiftKey == true;
};
el.metaModifier = function (e){
	return e.event().metaKey == true;
};
el.keyModifier = function (key,e){
	return e.keyCode() ? ((e.keyCode() == key)) : true;
};
el.delModifier = function (e){
	return e.keyCode() ? ((e.keyCode() == 8 || e.keyCode() == 46)) : true;
};
el.selfModifier = function (e){
	return e.event().target == this._dom;
};
el.leftModifier = function (e){
	return (e.button() != undefined) ? ((e.button() === 0)) : el.keyModifier(37,e);
};
el.rightModifier = function (e){
	return (e.button() != undefined) ? ((e.button() === 2)) : el.keyModifier(39,e);
};
el.middleModifier = function (e){
	return (e.button() != undefined) ? ((e.button() === 1)) : true;
};

el.getHandler = function (str,event){
	if (this[str]) { return this };
};



Imba.Event = function Event(e){
	this.setEvent(e);
	this._bubble = true;
};



Imba.Event.prototype.event = function(v){ return this._event; }
Imba.Event.prototype.setEvent = function(v){ this._event = v; return this; };

Imba.Event.prototype.prefix = function(v){ return this._prefix; }
Imba.Event.prototype.setPrefix = function(v){ this._prefix = v; return this; };

Imba.Event.prototype.source = function(v){ return this._source; }
Imba.Event.prototype.setSource = function(v){ this._source = v; return this; };

Imba.Event.prototype.data = function(v){ return this._data; }
Imba.Event.prototype.setData = function(v){ this._data = v; return this; };

Imba.Event.prototype.responder = function(v){ return this._responder; }
Imba.Event.prototype.setResponder = function(v){ this._responder = v; return this; };

Imba.Event.wrap = function (e){
	return new this(e);
};

Imba.Event.prototype.setType = function (type){
	this._type = type;
	this;
	return this;
};



Imba.Event.prototype.type = function (){
	return this._type || this.event().type;
};
Imba.Event.prototype.native = function (){
	return this._event;
};

Imba.Event.prototype.name = function (){
	return this._name || (this._name = this.type().toLowerCase().replace(/\:/g,''));
};


Imba.Event.prototype.bubble = function (v){
	if (v != undefined) {
		this.setBubble(v);
		return this;
	};
	return this._bubble;
};

Imba.Event.prototype.setBubble = function (v){
	this._bubble = v;
	return this;
	return this;
};



Imba.Event.prototype.stop = function (){
	this.setBubble(false);
	return this;
};

Imba.Event.prototype.stopPropagation = function (){
	return this.stop();
};
Imba.Event.prototype.halt = function (){
	return this.stop();
};


Imba.Event.prototype.prevent = function (){
	if (this.event().preventDefault) {
		this.event().preventDefault();
	} else {
		this.event().defaultPrevented = true;
	};
	this.defaultPrevented = true;
	return this;
};

Imba.Event.prototype.preventDefault = function (){
	console.warn("Event#preventDefault is deprecated - use Event#prevent");
	return this.prevent();
};



Imba.Event.prototype.isPrevented = function (){
	return this.event() && this.event().defaultPrevented;
};



Imba.Event.prototype.cancel = function (){
	console.warn("Event#cancel is deprecated - use Event#prevent");
	return this.prevent();
};

Imba.Event.prototype.silence = function (){
	this._silenced = true;
	return this;
};

Imba.Event.prototype.isSilenced = function (){
	return !!this._silenced;
};



Imba.Event.prototype.target = function (){
	return Imba.getTagForDom(this.event()._target || this.event().target);
};



Imba.Event.prototype.responder = function (){
	return this._responder;
};



Imba.Event.prototype.redirect = function (node){
	this._redirect = node;
	return this;
};

Imba.Event.prototype.processHandlers = function (node,handlers){
	let i = 1;
	let l = handlers.length;
	let bubble = this._bubble;
	let state = handlers.state || (handlers.state = {});
	let result;
	
	if (bubble) {
		this._bubble = 1;
	};
	
	while (i < l){
		let isMod = false;
		let handler = handlers[i++];
		let params = null;
		let context = node;
		
		if (handler instanceof Array) {
			params = handler.slice(1);
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
				console.warn(("event " + this.type() + ": could not find '" + handler + "' in context"),ctx);
			};
			
			
			
			
			
			
			
			
			
			
			
		};
		
		if (handler instanceof Function) {
			// what if we actually call stop inside function?
			// do we still want to continue the chain?
			let res = handler.apply(context,params || [this]);
			
			if (!isMod) {
				this._responder || (this._responder = node);
			};
			
			if (res == false) {
				// console.log "returned false - breaking"
				break;
			};
			
			if (res && !this._silenced && (res.then instanceof Function)) {
				res.then(Imba.commit);
			};
		};
	};
	
	
	if (this._bubble === 1) {
		this._bubble = bubble;
	};
	
	return null;
};

Imba.Event.prototype.process = function (){
	var name = this.name();
	var meth = ("on" + (this._prefix || '') + name);
	var args = null;
	var domtarget = this.event()._target || this.event().target;
	var domnode = domtarget._responder || domtarget;
	
	var result;
	var handlers;
	
	while (domnode){
		this._redirect = null;
		let node = domnode._dom ? domnode : domnode._tag;
		
		if (node) {
			if (handlers = node._on_) {
				for (let i = 0, items = iter$(handlers), len = items.length, handler; i < len; i++) {
					handler = items[i];
					if (!handler) { continue; };
					let hname = handler[0];
					if (name == handler[0] && this.bubble()) {
						this.processHandlers(node,handler);
					};
				};
				if (!(this.bubble())) { break; };
			};
			
			if (this.bubble() && (node[meth] instanceof Function)) {
				this._responder || (this._responder = node);
				this._silenced = false;
				result = args ? node[meth].apply(node,args) : node[meth](this,this.data());
			};
			
			if (node.onevent) {
				node.onevent(this);
			};
		};
		
		
		if (!(this.bubble() && (domnode = (this._redirect || (node ? node.parent() : domnode.parentNode))))) {
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
	if (!this._silenced && this._responder) {
		Imba.emit(Imba,'event',[this]);
		Imba.commit(this.event());
	};
	return this;
};



Imba.Event.prototype.x = function (){
	return this.native().x;
};



Imba.Event.prototype.y = function (){
	return this.native().y;
};

Imba.Event.prototype.button = function (){
	return this.native().button;
};
Imba.Event.prototype.keyCode = function (){
	return this.native().keyCode;
};
Imba.Event.prototype.ctrl = function (){
	return this.native().ctrlKey;
};
Imba.Event.prototype.alt = function (){
	return this.native().altKey;
};
Imba.Event.prototype.shift = function (){
	return this.native().shiftKey;
};
Imba.Event.prototype.meta = function (){
	return this.native().metaKey;
};
Imba.Event.prototype.key = function (){
	return this.native().key;
};



Imba.Event.prototype.which = function (){
	return this.event().which;
};



/***/ }),
/* 14 */
/***/ (function(module, exports, __webpack_require__) {

function iter$(a){ return a ? (a.toArray ? a.toArray() : a) : []; };
var self = {};
// externs;

var Imba = __webpack_require__(0);

var removeNested = function(root,node,caret) {
	// if node/nodes isa String
	// 	we need to use the caret to remove elements
	// 	for now we will simply not support this
	if (node instanceof Array) {
		for (let i = 0, items = iter$(node), len = items.length; i < len; i++) {
			removeNested(root,items[i],caret);
		};
	} else if (node && node._slot_) {
		root.removeChild(node);
	} else if (node != null) {
		// what if this is not null?!?!?
		// take a chance and remove a text-elementng
		let next = caret ? caret.nextSibling : root._dom.firstChild;
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
	} else if (node && node._dom) {
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
	} else if (node && node._dom) {
		root.insertBefore(node,before);
	} else if (node != null && node !== false) {
		root.insertBefore(Imba.createTextNode(node),before);
	};
	
	return before;
};


self.insertNestedAfter = function (root,node,after){
	var before = after ? after.nextSibling : root._dom.firstChild;
	
	if (before) {
		insertNestedBefore(root,node,before);
		return before.previousSibling;
	} else {
		appendNested(root,node);
		return root._dom.lastChild;
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
			if (!(node && node._dom)) {
				node = new$[idx] = Imba.createTextNode(node);
			};
			
			var after = new$[idx - 1];
			self.insertNestedAfter(root,node,(after && after._slot_ || after || caret));
		};
		
		caret = node._slot_ || (caret && caret.nextSibling || root._dom.firstChild);
	};
	
	
	return lastNew && lastNew._slot_ || caret;
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
		return last && last._slot_ || last || caret;
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
			let before = old[i]._slot_;
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


var reconcileIndexedArray = function(root,array,old,caret) {
	var newLen = array.taglen;
	var prevLen = array.domlen || 0;
	var last = newLen ? array[newLen - 1] : null;
	
	
	if (prevLen > newLen) {
		while (prevLen > newLen){
			var item = array[--prevLen];
			root.removeChild(item._slot_);
		};
	} else if (newLen > prevLen) {
		// find the item to insert before
		let prevLast = prevLen ? array[prevLen - 1]._slot_ : caret;
		let before = prevLast ? prevLast.nextSibling : root._dom.firstChild;
		
		while (prevLen < newLen){
			let node = array[prevLen++];
			before ? root.insertBefore(node._slot_,before) : root.appendChild(node._slot_);
		};
	};
	
	array.domlen = newLen;
	return last ? last._slot_ : caret;
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
		} else if (new$._slot_) {
			return new$._slot_;
		} else if ((new$ instanceof Array) && new$.taglen != null) {
			return reconcileIndexedArray(root,new$,old,caret);
		} else {
			return caret ? caret.nextSibling : root._dom.firstChild;
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
			if (old._slot_) {
				root.removeChild(old);
			} else {
				// old was a string-like object?
				root.removeChild(caret ? caret.nextSibling : root._dom.firstChild);
			};
		};
		
		return self.insertNestedAfter(root,new$,caret);
		
	} else if (!newIsNull && new$._slot_) {
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
		} else if (old && old._slot_) {
			root.removeChild(old);
		} else if (!oldIsNull) {
			// ...
			nextNode = caret ? caret.nextSibling : root._dom.firstChild;
			if ((nextNode instanceof Text) && nextNode.textContent != new$) {
				nextNode.textContent = new$;
				return nextNode;
			};
		};
		
		
		return self.insertNestedAfter(root,new$,caret);
	};
};


Imba.extendTag('element', function(tag){
	
	// 1 - static shape - unknown content
	// 2 - static shape and static children
	// 3 - single item
	// 4 - optimized array - only length will change
	// 5 - optimized collection
	// 6 - text only
	
	tag.prototype.setChildren = function (new$,typ){
		// if typeof new == 'string'
		// 	return self.text = new
		var old = this._tree_;
		
		if (new$ === old && (!(new$) || new$.taglen == undefined)) {
			return this;
		};
		
		if (!old && typ != 3) {
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
			
			if (new$ && new$._dom) {
				this.removeAllChildren();
				this.appendChild(new$);
			} else if (new$ instanceof Array) {
				if (new$._type == 5 && old && old._type == 5) {
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
		
		this._tree_ = new$;
		return this;
	};
	
	tag.prototype.content = function (){
		return this._content || this.children().toArray();
	};
	
	tag.prototype.setText = function (text){
		if (text != this._tree_) {
			var val = (text === null || text === false) ? '' : text;
			(this._text_ || this._dom).textContent = val;
			this._text_ || (this._text_ = this._dom.firstChild);
			this._tree_ = text;
		};
		return this;
	};
});


var proto = Imba.Tag.prototype;
proto.setContent = proto.setChildren;


var apple = typeof navigator != 'undefined' && (navigator.vendor || '').indexOf('Apple') == 0;
if (apple) {
	proto.setText = function (text){
		if (text != this._tree_) {
			this._dom.textContent = ((text === null || text === false) ? '' : text);
			this._tree_ = text;
		};
		return this;
	};
};


/***/ }),
/* 15 */
/***/ (function(module, exports, __webpack_require__) {

function len$(a){
	return a && (a.len instanceof Function ? a.len() : a.length) || 0;
};
var Imba = __webpack_require__(1);
// externs;

var Route = __webpack_require__(16).Route;



var isWeb = typeof window !== 'undefined';


function Hash(){ };



function Request(router,path,referrer){
	this._router = router;
	this._path = this._originalPath = path;
	this._referrer = referrer;
};

Request.prototype.router = function(v){ return this._router; }
Request.prototype.setRouter = function(v){ this._router = v; return this; };
Request.prototype.path = function(v){ return this._path; }
Request.prototype.setPath = function(v){ this._path = v; return this; };
Request.prototype.referrer = function(v){ return this._referrer; }
Request.prototype.setReferrer = function(v){ this._referrer = v; return this; };
Request.prototype.aborted = function(v){ return this._aborted; }
Request.prototype.setAborted = function(v){ this._aborted = v; return this; };

Request.prototype.redirect = function (path){
	this._redirected = this._path = path;
	return this;
};

Request.prototype.abort = function (){
	this._aborted = true;
	return this;
};

Request.prototype.url = function (){
	return this.path();
};

Request.prototype.match = function (str){
	return new Route(this,str).test();
};


function Router(o){
	var self = this;
	if(o === undefined) o = {};
	self._url = o.url || '';
	self._hash = '';
	self._routes = {};
	self._options = o;
	self._redirects = o.redirects || {};
	self._aliases = o.aliases || {};
	self._busy = [];
	self._root = o.root || '';
	self.setMode(o.mode || 'history');
	self.setup();
	
	if (isWeb) {
		// warn if multiple instances?
		self._instance || (self._instance = self);
		self._clickHandler = function(e) { return self.onclick(e); };
		self._captor = window.addEventListener('click',self._clickHandler,true);
	};
	self;
};

exports.Router = Router; // export class 
Router._instance = null;

Router.prototype.__mode = {watch: 'modeDidSet',chainable: true,name: 'mode'};
Router.prototype.mode = function(v){ return v !== undefined ? (this.setMode(v),this) : this._mode; }
Router.prototype.setMode = function(v){
	var a = this.mode();
	if(v != a) { this._mode = v; }
	if(v != a) { this.modeDidSet && this.modeDidSet(v,a,this.__mode) }
	return this;
};
Router.prototype.busy = function(v){ return this._busy; }
Router.prototype.setBusy = function(v){ this._busy = v; return this; };
Router.prototype.root = function(v){ return this._root; }
Router.prototype.setRoot = function(v){ this._root = v; return this; };

Router.instance = function (){
	return this._instance || (this._instance = new this());
};


Router.prototype.option = function (key,value){
	if (value == undefined) {
		return this._options[key];
	} else {
		this._options[key] = value;
	};
	return this;
};

Router.prototype.location = function (){
	return document.location;
};

Router.prototype.state = function (){
	return {};
};

Router.prototype.refresh = function (params){
	if(params === undefined) params = {};
	if (this._refreshing) { return };
	this._refreshing = true;
	let path = params.path || this.path();
	
	if (path != this._path) {
		
		let req = new Request(this,path,this._path);
		
		this.emit('beforechange',req);
		
		if (req.aborted()) {
			// console.log "request was aborted",params
			var res = window.confirm("Are you sure you want to leave? You might have unsaved changes");
			
			if (res) {
				req.setAborted(false);
			} else if (params.pop) {
				path = this._path;
				this.history().pushState(this.state(),null,this.normalize(this._path));
			} else if (!params.push) {
				this.history().replaceState(this.state(),null,this.normalize(this._path));
			};
			
			
		};
		
		if (!req.aborted()) {
			this._path = req.path();
			
			if (params.push) {
				// console.log "actually changing url"
				this.history().pushState(params.state || this.state(),null,this.normalize(req.path()));
			} else {
				if (path != req.path()) {
					this.replace(path = req.path());
				};
				this;
			};
			
			this.emit('change',req);
			Imba.commit();
		};
		
		
		
	};
	
	this._refreshing = false;
	return this;
};

Router.prototype.onpopstate = function (e){
	// console.log "onpopstate",e
	this.refresh({pop: true});
	return this;
};

Router.prototype.onbeforeunload = function (e){
	// console.log "onbeforeunload"
	let req = new Request(this,null,this.path());
	this.emit('beforechange',req);
	if (req.aborted()) { return true };
	return;
	
	
};

Router.prototype.setup = function (){
	var self = this;
	if (isWeb) {
		// let url = location:pathname
		// temporary hack to support scrimba out-of-the-box
		if (!self._root && window.SCRIMBA_ROOT && self.mode() != 'hash') {
			self._root = window.SCRIMBA_ROOT.replace(/\/$/,'');
		};
		
		let url = self.url();
		
		self.history().replaceState(self.state(),null,self.normalize(url));
		window.onpopstate = self.onpopstate.bind(self); 
		window.onbeforeunload = self.onbeforeunload.bind(self);
		
		self._hash = self.location().hash;
		window.addEventListener('hashchange',function(e) {
			self.emit('hashchange',self._hash = self.location().hash);
			return Imba.commit();
		});
	};
	return self;
};

Router.prototype.path = function (){
	let url = this._url || (isWeb ? (((this.mode() == 'hash') ? (this.hash() || '').slice(1) : this.location().pathname)) : '');
	if (this._root && url.indexOf(this._root) == 0) {
		url = url.slice(this._root.length);
	};
	if (url == '') { url = '/' };
	url = this._redirects[url] || url;
	url = this._aliases[url] || url;
	return url;
};

Router.prototype.url = function (){
	var url = this.path();
	if (isWeb && this.mode() != 'hash') {
		url += this.location().hash;
	};
	return url;
};

Router.prototype.hash = function (){
	return isWeb ? this.location().hash : '';
};

Router.prototype.serializeParams = function (params){
	if (params instanceof Object) {
		let res = [];
		for (let val, i = 0, keys = Object.keys(params), l = keys.length, key; i < l; i++){
			key = keys[i];val = params[key];res.push([key,encodeURI(val)].join("="));
		};
		var value = res;
		return value.join("&");
	};
	return params || '';
};

Router.prototype.setHash = function (value){
	if (isWeb) {
		// console.log "set hash",serializeParams(value)
		// will set without jumping
		this.history().replaceState({},null,'#' + this.serializeParams(value)); 
		
	};
	return this;
};

Router.prototype.history = function (){
	return window.history;
};

Router.prototype.match = function (pattern){
	var route = this._routes[pattern] || (this._routes[pattern] = new Route(this,pattern));
	return route.test();
};

Router.prototype.go = function (url,state){
	// remove hash if we are hash-based and url includes hash
	var self = this;
	if(state === undefined) state = {};
	url = self._redirects[url] || url;
	
	
	self.refresh({push: true,path: url,state: state});
	
	isWeb && self.onReady(function() {
		let hash = self.location().hash;
		if (hash != self._hash) {
			return self.emit('hashchange',self._hash = hash);
		};
	});
	return self;
};

Router.prototype.replace = function (url,state){
	if(state === undefined) state = {};
	url = this._redirects[url] || url;
	this.history().replaceState(state,null,this.normalize(url));
	return this.refresh();
};

Router.prototype.normalize = function (url){
	if (this.mode() == 'hash') {
		url = ("#" + url);
	} else if (this.root()) {
		url = this.root() + url;
	};
	return url;
};

Router.prototype.onReady = function (cb){
	var self = this;
	return Imba.ticker().add(function() {
		return (len$(self._busy) == 0) ? cb(self) : Imba.once(self,'ready',cb);
	});
};

Router.prototype.emit = function (name){
	var $0 = arguments, i = $0.length;
	var params = new Array(i>1 ? i-1 : 0);
	while(i>1) params[--i - 1] = $0[i];
	return Imba.emit(this,name,params);
};
Router.prototype.on = function (name){
	var Imba_;
	var $0 = arguments, i = $0.length;
	var params = new Array(i>1 ? i-1 : 0);
	while(i>1) params[--i - 1] = $0[i];
	return Imba.listen.apply(Imba,[].concat([this,name], [].slice.call(params)));
};
Router.prototype.once = function (name){
	var Imba_;
	var $0 = arguments, i = $0.length;
	var params = new Array(i>1 ? i-1 : 0);
	while(i>1) params[--i - 1] = $0[i];
	return Imba.once.apply(Imba,[].concat([this,name], [].slice.call(params)));
};
Router.prototype.un = function (name){
	var Imba_;
	var $0 = arguments, i = $0.length;
	var params = new Array(i>1 ? i-1 : 0);
	while(i>1) params[--i - 1] = $0[i];
	return Imba.unlisten.apply(Imba,[].concat([this,name], [].slice.call(params)));
};


Router.prototype.tapRouteHandler = function (e){
	let el = this.dom();
	let href = this.dom().getAttribute('href');
	
	if (el.nodeName != 'A' && (e.meta() || e.alt())) {
		e.stop().prevent();
		window.open(href,'_blank');
	};
	
	let ev = this.trigger('taproute',{path: href,sourceEvent: e,router: this.router()}); 
	if (!ev.isPrevented()) {
		e.stop().prevent();
		(e.meta() || e.alt()) ? window.open(href,'_blank') : this.router().go(href,{});
	};
	return;
};

Router.prototype.onclick = function (e){
	// console.log "onclick",e, e:defaultPrevented
	let i = 0;
	
	let el = e.target;
	let href;
	
	if (e.defaultPrevented) { return };
	
	while (el && el.getAttribute){ // = e:path[i++]
		if (href = el.getAttribute('href')) { break; };
		el = el.parentNode;
	};
	
	if (!el || !href || (href[0] != '#' && href[0] != '/')) {
		return;
	};
	
	
	if (el._tag) {
		if (el._tag.resolveRoute) {
			el._tag.resolveRoute();
			href = el.getAttribute('href');
		};
		
		el._tag.on$(-20,['tap',this.tapRouteHandler]);
		return;
	};
	return this;
};

const LinkExtend = {
	inject: function(node,opts){
		let render = node.render;
		node.resolveRoute = this.resolveRoute;
		return node.beforeRender = this.beforeRender;
		
	},
	
	beforeRender: function(){
		this.resolveRoute();
		return true;
	},
	
	ontap: function(e){
		this.resolveRoute();
		var href = this.href ? this.href() : this.dom().href;
		if (!href) { return };
		
		if ((href[0] != '#' && href[0] != '/')) {
			e._responder = null;
			e.prevent().stop();
			return window.open(href,'_blank');
		};
		
		if (e.meta() || e.alt()) {
			e._responder = null;
			e.prevent().stop();
			return window.open(this.router().root() + href,'_blank');
		};
		
		var ev = this.trigger('taproute',{path: href});
		
		if (!ev.isPrevented()) {
			e.prevent().stop();
			return this.router().go(href,{});
		};
	},
	
	resolveRoute: function(){
		if (!this._route) { return this };
		
		let match = this._route.test();
		let href = this._route.resolve();
		
		if (this._route && this._route.option('sticky')) {
			let prev = this._route.params().url;
			if (prev && prev.indexOf(href) == 0) {
				href = prev;
			};
		};
		
		this.setAttribute('href',this.router().root() + href);
		this.flagIf('active',match);
		return this;
	}
};

const RoutedExtend = {
	
	inject: function(node){
		node._params = {};
		node.resolveRoute = this.resolveRoute;
		node.beforeRender = this.beforeRender;
		node.renderWithStatusCode = this.renderWithStatusCode;
		return node.detachFromParent();
	},
	
	renderWithStatusCode: function(code){
		if(code === undefined) code = this._route.status();
		if (this[("render" + code)]) {
			this[("render" + code)]();
			return true;
		};
		return false;
	},
	
	beforeRender: function(){
		this.resolveRoute();
		if (!this._params._active) { return false };
		
		let status = this._route.status();
		
		if (this.renderWithStatusCode(status)) {
			return false;
		};
		
		if (status >= 200) {
			return true;
		};
		
		return false;
	},
	
	resolveRoute: function(next){
		let prev = this._params;
		let match = this._route.test();
		
		if (match) {
			let active = match._active;
			match._active = true;
			
			if (match != prev) {
				this.setParams(match);
			};
			
			if (match != prev || !active) {
				this.routeDidMatch(match,prev);
			};
			
			if (!active) {
				// match.@active = true
				// should happen after load?
				this.attachToParent();
				return Imba.commit();
			};
		} else if (prev && prev._active) {
			prev._active = false;
			this.detachFromParent();
			return Imba.commit();
		};
	}
};


Imba.extendTag('element', function(tag){
	tag.prototype.__params = {watch: 'paramsDidSet',name: 'params'};
	tag.prototype.params = function(v){ return this._params; }
	tag.prototype.setParams = function(v){
		var a = this.params();
		if(v != a) { this._params = v; }
		if(v != a) { this.paramsDidSet && this.paramsDidSet(v,a,this.__params) }
		return this;
	};
	
	tag.prototype.route = function (){
		return this._route;
	};
	
	tag.prototype.setRoute = function (path,mods){
		let prev = this._route;
		
		if (!prev) {
			path = String(path);
			let par = (path[0] != '/') ? this.getParentRoute() : null;
			let opts = mods || {};
			opts.node = this;
			this._route = new Route(this.router(),path,par,opts);
			if (opts.link) {
				LinkExtend.inject(this,opts);
			} else {
				RoutedExtend.inject(this);
			};
		} else if (String(path) != prev._raw) {
			prev.setPath(String(path));
		};
		return this;
	};
	
	tag.prototype.setRouteTo = function (path,mods){
		if (this._route) {
			return this.setRoute(path);
		} else {
			mods || (mods = {});
			mods.link = true;
			return this.setRoute(path,mods);
		};
	};
	
	
	tag.prototype.setRouterUrl = function (url){
		this._router || (this._router = new Router(url));
		return this;
	};
	
	tag.prototype.setRouterRoot = function (url){
		this.router().setRoot(url);
		return this;
	};
	
	tag.prototype.getParentRoute = function (){
		var route = null;
		var par = this._owner_;
		while (par){
			if (par._route) {
				return par._route;
			};
			par = par._owner_;
		};
		return null;
	};
	
	tag.prototype.setRouter = function (router){
		this._router = router;
		return this;
	};
	
	tag.prototype.router = function (){
		return this._router || (this._router = (this._owner_ && this._owner_.router() || new Router()));
		
	};
	
	tag.prototype.routeDidLoad = function (params){
		this.log('routeDidLoad');
		return this;
	};
	
	tag.prototype.routeDidFail = function (error){
		return this;
	};
	
	tag.prototype.routeDidMatch = function (params,prev){
		var self = this;
		if (!self.load) {
			self.routeDidLoad(params,prev);
			return self;
		};
		
		self.route().load(async function() {
			let val;
			try {
				if (params == prev && self.reload) {
					val = await self.reload(params,prev);
				} else {
					val = await self.load(params,prev);
				};
			} catch (e) {
				// log "route error",e
				val = 400;
				self.routeDidFail(e);
			};
			self.routeDidLoad(val);
			return val;
		});
		
		return self;
	};
	
	
	tag.prototype.ontaproute = function (){
		return this;
	};
});


/***/ }),
/* 16 */
/***/ (function(module, exports, __webpack_require__) {

function iter$(a){ return a ? (a.toArray ? a.toArray() : a) : []; };
var Imba = __webpack_require__(1);
var isWeb = typeof window !== 'undefined';

function Route(router,str,parent,options){
	this._parent = parent;
	this._router = router;
	this._options = options || {};
	this._node = this._options.node;
	this._status = 200;
	this.setPath(str);
};

exports.Route = Route; // export class 
Route.prototype.raw = function(v){ return this._raw; }
Route.prototype.setRaw = function(v){ this._raw = v; return this; };
Route.prototype.params = function(v){ return this._params; }
Route.prototype.setParams = function(v){ this._params = v; return this; };
Route.prototype.__status = {watch: 'statusDidSet',name: 'status'};
Route.prototype.status = function(v){ return this._status; }
Route.prototype.setStatus = function(v){
	var a = this.status();
	if(v != a) { this._status = v; }
	if(v != a) { this.statusDidSet && this.statusDidSet(v,a,this.__status) }
	return this;
};

Route.prototype.option = function (key){
	return this._options[key];
};

Route.prototype.setPath = function (path){
	var self = this;
	if (self._raw == path) { return self };
	self._raw = path;
	self._groups = [];
	self._params = {};
	self._cache = {};
	path = path.replace(/\:(\w+|\*)(\.)?/g,function(m,id,dot) {
		// what about :id.:format?
		if (id != '*') { self._groups.push(id) };
		if (dot) {
			return "([^\/\#\.\?]+)\.";
		} else {
			return "([^\/\#\?]+)";
		};
	});
	
	path = '^' + path;
	let end = path[path.length - 1];
	if (self._options.exact && end != '$') {
		path = path + '(?=[\#\?]|$)';
	} else if ((end != '/' && end != '$' && path != '^/')) {
		// we only want to match end OR /
		// if path[path:length - 1]
		path = path + '(?=[\/\#\?]|$)';
	};
	self._regex = new RegExp(path);
	return self;
};

Route.prototype.test = function (url){
	var m, match;
	url || (url = this._router.url()); 
	if (url == this._cache.url) { return this._cache.match };
	
	let prefix = '';
	let matcher = this._cache.url = url;
	this._cache.match = null;
	
	if (this._parent && this._raw[0] != '/') {
		if (m = this._parent.test(url)) {
			if (url.indexOf(m.path) == 0) {
				prefix = m.path + '/';
				matcher = url.slice(m.path.length + 1);
			};
		};
	};
	
	if (match = matcher.match(this._regex)) {
		let path = prefix + match[0];
		if (path == this._params.path) {
			this._params.url = url;
			return this._cache.match = this._params;
		};
		
		this._params = {path: path,url: url};
		if (this._groups.length) {
			for (let i = 0, items = iter$(match), len = items.length, item, name; i < len; i++) {
				item = items[i];
				if (name = this._groups[i - 1]) {
					this._params[name] = item;
				};
			};
		};
		
		return this._cache.match = this._params;
	};
	
	return this._cache.match = null;
};


Route.prototype.statusDidSet = function (status,prev){
	let idx = this._router.busy().indexOf(this);
	clearTimeout(this._statusTimeout);
	
	if (status < 200) {
		if (idx == -1) { this._router.busy().push(this) };
		this._statusTimeout = setTimeout(function() { return status = 408; },25000);
	} else if (idx >= 0 && status >= 200) {
		this._router.busy().splice(idx,1);
		
		
		
		this._node && this._node.commit  &&  this._node.commit();
		
		if (this._router.busy().length == 0) {
			Imba.emit(this._router,'ready',[this._router]);
		};
	};
	
	return this._node && this._node.setFlag  &&  this._node.setFlag('route-status',("status-" + status));
};

Route.prototype.load = function (cb){
	var self = this;
	self.setStatus(102);
	
	var handler = self._handler = function(res) {
		var v_;
		if (handler != self._handler) {
			// console.log "another load has started after this"
			return;
		};
		
		self._handler = null;
		return (self.setStatus(v_ = ((typeof res=='number'||res instanceof Number)) ? res : 200),v_);
	};
	
	if (cb instanceof Function) {
		cb = cb(handler);
	};
	
	if (cb && cb.then) {
		cb.then(handler,handler);
	} else {
		handler(cb);
	};
	return self;
};

Route.prototype.resolve = function (url){
	var m;
	url || (url = this._router.url());
	if (this._cache.resolveUrl == url) {
		return this._cache.resolved;
	};
	
	
	let base = '';
	this._cache.resolveUrl = url; 
	
	if (this._parent && this._raw[0] != '/') {
		if (m = this._parent.test()) {
			this._cache.resolved = base + m.path + '/' + this._raw; 
		};
	} else {
		// FIXME what if the url has some unknowns?
		this._cache.resolved = base + this._raw; 
	};
	
	return this._cache.resolved;
};


/***/ }),
/* 17 */
/***/ (function(module, exports, __webpack_require__) {

function iter$(a){ return a ? (a.toArray ? a.toArray() : a) : []; };
var Imba = __webpack_require__(1), _2 = Imba.createTagList, _1 = Imba.createElement;
__webpack_require__(18);
var api = __webpack_require__(20);

var Customer = Imba.defineTag('Customer', 'section', function(tag){
	tag.prototype.list = function(v){ return this._list; }
	tag.prototype.setList = function(v){ this._list = v; return this; };
	tag.prototype.orders = function(v){ return this._orders; }
	tag.prototype.setOrders = function(v){ this._orders = v; return this; };
	
	tag.prototype.load = async function (params,next){
		this.setData(null);
		
		for (let i = 0, items = iter$(this.list()), len = items.length, item; i < len; i++) {
			item = items[i];
			if (item.id == params.id) {
				this.setData(item);break;
			};
		};
		
		this.setOrders(await api.rpc(("/customers/" + (params.id) + "/orders.json")));
		return this.data() ? 200 : 404;
	};
	
	tag.prototype.render = function (){
		var $ = this.$, self = this;
		if (!(self.data())) {
			return self.$open(0).setText("Loading!").synced();
		};
		
		return self.$open(1).setChildren($.$ = $.$ || [
			_1('h2',$,0,self),
			
			_1('div',$,1,self).flag('details').setContent([
				_1('a',$,2,1).setRouteTo('info').setText('Info'),
				_1('a',$,3,1).setRouteTo('orders').setText('Orders')
			
			],2),
			
			_1('div',$,4,self).setRoute('info').setContent([
				_1('h2',$,5,4),
				_1('input',$,6,4).setType('text')
			],2),
			
			t0 = (t0=_1('div',$,7,self)).setRoute('orders')
		],2).synced((
			$[0].setContent(self.data().name,3),
			$[2].end(),
			$[3].end(),
			$[4].end((
				$[5].setContent(self.data().name,3),
				$[6].bindData(self.data(),'name').end()
			,true)),
			$[7].setTemplate(function() {
				var $1 = this.$, t0;
				return Imba.static([
					($1[0] || _1('h2',$1,0,t0).setText("Orders")),
					($1[1] || _1('ul',$1,1,t0)).setContent((function tagLoop($0) {
						for (let i = 0, items = iter$(self.orders()), len = $0.taglen = items.length, order; i < len; i++) {
							order = items[i];
							($0[i] || _1('li',$0,i)).setRouteTo(("/orders/" + (order.id))).setText("Order #" + (order.id)).end();
						};return $0;
					})($1[2] || _2($1,2,$1[1])),4)
				],2,1);
			}).end()
		,true));
	};
});

var Page = Imba.defineTag('Page');

var Customers = Imba.defineTag('Customers', Page, function(tag){
	
	tag.prototype.query = function(v){ return this._query; }
	tag.prototype.setQuery = function(v){ this._query = v; return this; };
	
	tag.prototype.load = async function (params){
		this.setData(await api.rpc('/customers.json'));
		return 200;
	};
	
	tag.prototype.filtered = function (){
		var self = this;
		return (!(self.query())) ? self.data() : self.data().filter(function(item) {
			return item.name.indexOf(self.query()) >= 0;
		});
	};
	
	tag.prototype.render = function (){
		var $ = this.$, self = this;
		return self.$open(0).setChildren($.$ = $.$ || [
			_1('nav',$,0,self).setContent(
				$[1] || _1('button',$,1,0).setText("add customer")
			,2),
			
			_1('aside',$,2,self).setContent([
				_1('input',$,3,2).setType('text'),
				_1('ul',$,4,2).flag('entries')
			],2),
			
			_1(Customer,$,7,self).flag('main').setRoute(':id')
		],2).synced((
			$[3].bindData(self,'query',[]).end(),
			$[4].setContent([
				(function tagLoop($0) {
					for (let i = 0, items = iter$(self.filtered()), len = $0.taglen = items.length, item; i < len; i++) {
						item = items[i];
						(t0 = $0[i] || (t0=_1('li',$0,i)).flag('entry')).set('route-to',item.id,{sticky:1}).setTemplate(function() {
							var $1 = this.$, t0;
							return ($1[0] || _1('span',$1,0,t0).flag('name')).setContent(item.name,3);
						}).end();
					};return $0;
				})($[5] || _2($,5,$[4])),
				t0 = $[6] || (t0=_1('li',$,6,4)).flag('entry').setRouteTo("14")
			],1).end((
				$[6].setTemplate(function() {
					var $1 = this.$, t0;
					return ($1[0] || _1('span',$1,0,t0).flag('name').setText("Unknown"));
				}).end()
			,true)),
			$[7].setList(self.data()).end()
		,true));
	};
});

var Order = Imba.defineTag('Order', function(tag){
	tag.prototype.list = function(v){ return this._list; }
	tag.prototype.setList = function(v){ this._list = v; return this; };
	
	tag.prototype.render = function (){
		var $ = this.$;
		return this.$open(0).setChildren(
			$[0] || _1('section',$,0,this).setText("Order ")
		,2).synced();
	};
});

var Orders = Imba.defineTag('Orders', Page, function(tag){
	
	tag.prototype.load = async function (params,next){
		this.setData(await api.rpc('/orders.json'));
		return 200;
	};
	
	tag.prototype.render = function (){
		var $ = this.$, self = this;
		return self.$open(0).setChildren($.$ = $.$ || [
			_1('nav',$,0,self).setContent($[1] || _1('button',$,1,0).setText("new order"),2),
			_1('aside',$,2,self).setContent(
				$[3] || _1('ul',$,3,2).flag('entries')
			,2),
			_1(Order,$,5,self).flag('main').setRoute(':id')
		],2).synced((
			$[3].setContent((function tagLoop($0) {
				var t0;
				for (let i = 0, items = iter$(self.data()), len = $0.taglen = items.length, item; i < len; i++) {
					item = items[i];
					(t0 = $0[i] || (t0=_1('li',$0,i)).flag('entry').flag('order').setContent(
						t0.$.A || _1('span',t0.$,'A',t0).flag('name')
					,2)).set('route',item.id,{link:1}).end((
						t0.$.A.setText("Order #" + item.id)
					,true));
				};return $0;
			})($[4] || _2($,4,$[3])),4),
			$[5].setList(self.data()).end()
		,true));
	};
});

var Nested = Imba.defineTag('Nested', function(tag){
	
	tag.prototype.ontap = function (){
		this.log('Nested.ontap?!?');
		return this.router().go('/customers');
	};
	
	tag.prototype.testing = function (){
		this.log('testing');
		return this;
	};
	
	tag.prototype.render = function (){
		var $ = this.$;
		return this.$open(0).setChildren($.$ = $.$ || [
			_1('div',$,0,this).on$(0,['tap','testing'],this).setText("Button?"),
			_1('span',$,1,this).setText("To customers"),
			_1('a',$,2,this).setRouteTo('/about').setText("To about"),
			_1('div',$,3,this).setRouteTo("/orders").setContent([
				_1('div',$,4,3).setText("To orders"),
				_1('div',$,5,3).on$(0,['tap','prevent','stop'],this).setText("Cancel click before route-to"),
				_1('a',$,6,3).setRouteTo('/about').setText("To about")
			],2)
		],2).synced((
			$[2].end(),
			$[3].end((
				$[6].end()
			,true))
		,true));
	};
});

var Home = Imba.defineTag('Home', function(tag){
	tag.prototype.render = function (){
		var $ = this.$;
		return this.$open(0).setChildren($.$ = $.$ || [
			_1('section',$,0,this).setText("Welcome"),
			_1(Nested,$,1,this)
		],2).synced((
			$[1].end()
		,true));
	};
});


var About = Imba.defineTag('About', Page, function(tag){
	tag.prototype.render = function (){
		var $ = this.$;
		return this.$open(0).setChildren($.$ = $.$ || [
			_1('nav',$,0,this).setContent([
				_1('a',$,1,0).setRouteTo('team').setText('Team'),
				_1('a',$,2,0).setRouteTo('contact').setText('Contact')
			],2),
			
			_1('section',$,3,this).setRoute('team').setText("About us"),
			_1('section',$,4,this).setRoute('contact').setText("Contact us")
		],2).synced((
			$[1].end(),
			$[2].end(),
			$[3].end(),
			$[4].end()
		,true));
	};
});


var App = Imba.defineTag('App', function(tag){
	tag.prototype.render = function (){
		var $ = this.$;
		return this.$open(0).setChildren($.$ = $.$ || [
			_1('nav',$,0,this).flag('main').setContent([
				_1('a',$,1,0).setRouteTo('/').setText('Home'),
				_1('a',$,2,0).set('route-to','/customers',{sticky:1}).setText('Customers'),
				_1('a',$,3,0).set('route-to','/orders',{sticky:1}).setText('Orders'),
				_1('a',$,4,0).set('route-to','/about',{sticky:1}).setText('About')
			],2),
			
			_1(Home,$,5,this).set('route','/',{exact:1}),
			_1(Customers,$,6,this).setRoute('/customers'),
			_1(Orders,$,7,this).setRoute('/orders'),
			_1(About,$,8,this).setRoute('/about')
		],2).synced((
			$[1].end(),
			$[2].end(),
			$[3].end(),
			$[4].end(),
			$[5].end(),
			$[6].end(),
			$[7].end(),
			$[8].end()
		,true));
	};
})
exports.App = App;


/***/ }),
/* 18 */
/***/ (function(module, exports, __webpack_require__) {

function len$(a){
	return a && (a.len instanceof Function ? a.len() : a.length) || 0;
};
var Imba = __webpack_require__(1);
// externs;

var Route = __webpack_require__(19).Route;

// check if is web

var isWeb = typeof window !== 'undefined';

// proxy for hash
function Hash(){ };



function Request(router,path,referrer){
	this._router = router;
	this._path = this._originalPath = path;
	this._referrer = referrer;
};

Request.prototype.router = function(v){ return this._router; }
Request.prototype.setRouter = function(v){ this._router = v; return this; };
Request.prototype.path = function(v){ return this._path; }
Request.prototype.setPath = function(v){ this._path = v; return this; };
Request.prototype.referrer = function(v){ return this._referrer; }
Request.prototype.setReferrer = function(v){ this._referrer = v; return this; };
Request.prototype.aborted = function(v){ return this._aborted; }
Request.prototype.setAborted = function(v){ this._aborted = v; return this; };

Request.prototype.redirect = function (path){
	this._redirected = this._path = path;
	return this;
};

Request.prototype.abort = function (){
	this._aborted = true;
	return this;
};

Request.prototype.url = function (){
	return this.path();
};

Request.prototype.match = function (str){
	return new Route(this,str).test();
};


function Router(o){
	var self = this;
	if(o === undefined) o = {};
	self._url = o.url || '';
	self._hash = '';
	self._routes = {};
	self._options = o;
	self._redirects = o.redirects || {};
	self._aliases = o.aliases || {};
	self._busy = [];
	self._root = o.root || '';
	self.setMode(o.mode || 'history');
	self.setup();
	
	if (isWeb) {
		// warn if multiple instances?
		self._instance || (self._instance = self);
		self._clickHandler = function(e) { return self.onclick(e); };
		self._captor = window.addEventListener('click',self._clickHandler,true);
	};
	self;
};

exports.Router = Router; // export class 
Router._instance = null;

Router.prototype.__mode = {watch: 'modeDidSet',chainable: true,name: 'mode'};
Router.prototype.mode = function(v){ return v !== undefined ? (this.setMode(v),this) : this._mode; }
Router.prototype.setMode = function(v){
	var a = this.mode();
	if(v != a) { this._mode = v; }
	if(v != a) { this.modeDidSet && this.modeDidSet(v,a,this.__mode) }
	return this;
};
Router.prototype.busy = function(v){ return this._busy; }
Router.prototype.setBusy = function(v){ this._busy = v; return this; };
Router.prototype.root = function(v){ return this._root; }
Router.prototype.setRoot = function(v){ this._root = v; return this; };

Router.instance = function (){
	return this._instance || (this._instance = new this());
};

// support redirects
Router.prototype.option = function (key,value){
	if (value == undefined) {
		return this._options[key];
	} else {
		this._options[key] = value;
	};
	return this;
};

Router.prototype.location = function (){
	return document.location;
};

Router.prototype.state = function (){
	return {};
};

Router.prototype.refresh = function (params){
	if(params === undefined) params = {};
	if (this._refreshing) { return };
	this._refreshing = true;
	let path = params.path || this.path();
	
	if (path != this._path) {
		
		let req = new Request(this,path,this._path);
		
		this.emit('beforechange',req);
		
		if (req.aborted()) {
			// console.log "request was aborted",params
			var res = window.confirm("Are you sure you want to leave? You might have unsaved changes");
			
			if (res) {
				req.setAborted(false);
			} else if (params.pop) {
				path = this._path;
				this.history().pushState(this.state(),null,this.normalize(this._path));
			} else if (!params.push) {
				this.history().replaceState(this.state(),null,this.normalize(this._path));
			};
			
			// if we're not popping - should happen before we are changing
		};
		
		if (!req.aborted()) {
			this._path = req.path();
			
			if (params.push) {
				// console.log "actually changing url"
				this.history().pushState(params.state || this.state(),null,this.normalize(req.path()));
			} else {
				if (path != req.path()) {
					this.replace(path = req.path());
				};
				this;
			};
			
			this.emit('change',req);
			Imba.commit();
		};
		
		// checking hash?
		// let e = Imba.Event.wrap(type: 'change')
	};
	
	this._refreshing = false;
	return this;
};

Router.prototype.onpopstate = function (e){
	// console.log "onpopstate",e
	this.refresh({pop: true});
	return this;
};

Router.prototype.onbeforeunload = function (e){
	// console.log "onbeforeunload"
	let req = new Request(this,null,this.path());
	this.emit('beforechange',req);
	if (req.aborted()) { return true };
	return;
	
	// return req.aborted ? true : false
};

Router.prototype.setup = function (){
	var self = this;
	if (isWeb) {
		// let url = location:pathname
		// temporary hack to support scrimba out-of-the-box
		if (!self._root && window.SCRIMBA_ROOT && self.mode() != 'hash') {
			self._root = window.SCRIMBA_ROOT.replace(/\/$/,'');
		};
		
		let url = self.url();
		// if url and @redirects[url]
		self.history().replaceState(self.state(),null,self.normalize(url));
		window.onpopstate = self.onpopstate.bind(self); // do |e| onpopstate(e)
		window.onbeforeunload = self.onbeforeunload.bind(self);
		
		self._hash = self.location().hash;
		window.addEventListener('hashchange',function(e) {
			self.emit('hashchange',self._hash = self.location().hash);
			return Imba.commit();
		});
	};
	return self;
};

Router.prototype.path = function (){
	let url = this._url || (isWeb ? (((this.mode() == 'hash') ? (this.hash() || '').slice(1) : this.location().pathname)) : '');
	if (this._root && url.indexOf(this._root) == 0) {
		url = url.slice(this._root.length);
	};
	if (url == '') { url = '/' };
	url = this._redirects[url] || url;
	url = this._aliases[url] || url;
	return url;
};

Router.prototype.url = function (){
	var url = this.path();
	if (isWeb && this.mode() != 'hash') {
		url += this.location().hash;
	};
	return url;
};

Router.prototype.hash = function (){
	return isWeb ? this.location().hash : '';
};

Router.prototype.serializeParams = function (params){
	if (params instanceof Object) {
		let res = [];
		for (let val, i = 0, keys = Object.keys(params), l = keys.length, key; i < l; i++){
			key = keys[i];val = params[key];res.push([key,encodeURI(val)].join("="));
		};
		var value = res;
		return value.join("&");
	};
	return params || '';
};

Router.prototype.setHash = function (value){
	if (isWeb) {
		// console.log "set hash",serializeParams(value)
		// will set without jumping
		this.history().replaceState({},null,'#' + this.serializeParams(value)); // last state?
		// location:hash = serializeParams(value)
	};
	return this;
};

Router.prototype.history = function (){
	return window.history;
};

Router.prototype.match = function (pattern){
	var route = this._routes[pattern] || (this._routes[pattern] = new Route(this,pattern));
	return route.test();
};

Router.prototype.go = function (url,state){
	// remove hash if we are hash-based and url includes hash
	var self = this;
	if(state === undefined) state = {};
	url = self._redirects[url] || url;
	// call from here instead?
	// history.pushState(state,null,normalize(url))
	self.refresh({push: true,path: url,state: state});
	
	isWeb && self.onReady(function() {
		let hash = self.location().hash;
		if (hash != self._hash) {
			return self.emit('hashchange',self._hash = hash);
		};
	});
	return self;
};

Router.prototype.replace = function (url,state){
	if(state === undefined) state = {};
	url = this._redirects[url] || url;
	this.history().replaceState(state,null,this.normalize(url));
	return this.refresh();
};

Router.prototype.normalize = function (url){
	if (this.mode() == 'hash') {
		url = ("#" + url);
	} else if (this.root()) {
		url = this.root() + url;
	};
	return url;
};

Router.prototype.onReady = function (cb){
	var self = this;
	return Imba.ticker().add(function() {
		return (len$(self._busy) == 0) ? cb(self) : Imba.once(self,'ready',cb);
	});
};

Router.prototype.emit = function (name){
	var $0 = arguments, i = $0.length;
	var params = new Array(i>1 ? i-1 : 0);
	while(i>1) params[--i - 1] = $0[i];
	return Imba.emit(this,name,params);
};
Router.prototype.on = function (name){
	var Imba_;
	var $0 = arguments, i = $0.length;
	var params = new Array(i>1 ? i-1 : 0);
	while(i>1) params[--i - 1] = $0[i];
	return Imba.listen.apply(Imba,[].concat([this,name], [].slice.call(params)));
};
Router.prototype.once = function (name){
	var Imba_;
	var $0 = arguments, i = $0.length;
	var params = new Array(i>1 ? i-1 : 0);
	while(i>1) params[--i - 1] = $0[i];
	return Imba.once.apply(Imba,[].concat([this,name], [].slice.call(params)));
};
Router.prototype.un = function (name){
	var Imba_;
	var $0 = arguments, i = $0.length;
	var params = new Array(i>1 ? i-1 : 0);
	while(i>1) params[--i - 1] = $0[i];
	return Imba.unlisten.apply(Imba,[].concat([this,name], [].slice.call(params)));
};

// bound to target
Router.prototype.tapRouteHandler = function (e){
	let el = this.dom();
	let href = this.dom().getAttribute('href');
	
	if (el.nodeName != 'A' && (e.meta() || e.alt())) {
		e.stop().prevent();
		window.open(href,'_blank');
	};
	
	let ev = this.trigger('taproute',{path: href,sourceEvent: e,router: this.router()}); // include metaKey etc
	if (!ev.isPrevented()) {
		e.stop().prevent();
		(e.meta() || e.alt()) ? window.open(href,'_blank') : this.router().go(href,{});
	};
	return;
};

Router.prototype.onclick = function (e){
	// console.log "onclick",e, e:defaultPrevented
	let i = 0;
	// let path = e:path
	let el = e.target;
	let href;
	
	if (e.defaultPrevented) { return };
	
	while (el && el.getAttribute){ // = e:path[i++]
		if (href = el.getAttribute('href')) { break; };
		el = el.parentNode;
	};
	
	if (!el || !href || (href[0] != '#' && href[0] != '/')) {
		return;
	};
	
	// deal with alternative routes
	if (el._tag) {
		if (el._tag.resolveRoute) {
			el._tag.resolveRoute();
			href = el.getAttribute('href');
		};
		
		el._tag.on$(-20,['tap',this.tapRouteHandler]);
		return;
	};
	return this;
};

const LinkExtend = {
	inject: function(node,opts){
		let render = node.render;
		node.resolveRoute = this.resolveRoute;
		return node.beforeRender = this.beforeRender;
		// node:ontap ||= self:ontap
	},
	
	beforeRender: function(){
		this.resolveRoute();
		return true;
	},
	
	ontap: function(e){
		this.resolveRoute();
		var href = this.href ? this.href() : this.dom().href;
		if (!href) { return };
		
		if ((href[0] != '#' && href[0] != '/')) {
			e._responder = null;
			e.prevent().stop();
			return window.open(href,'_blank');
		};
		
		if (e.meta() || e.alt()) {
			e._responder = null;
			e.prevent().stop();
			return window.open(this.router().root() + href,'_blank');
		};
		
		var ev = this.trigger('taproute',{path: href});
		
		if (!ev.isPrevented()) {
			e.prevent().stop();
			return this.router().go(href,{});
		};
	},
	
	resolveRoute: function(){
		if (!this._route) { return this };
		
		let match = this._route.test();
		let href = this._route.resolve();
		
		if (this._route && this._route.option('sticky')) {
			let prev = this._route.params().url;
			if (prev && prev.indexOf(href) == 0) {
				href = prev;
			};
		};
		
		this.setAttribute('href',this.router().root() + href);
		this.flagIf('active',match);
		return this;
	}
};

const RoutedExtend = {
	
	inject: function(node){
		node._params = {};
		node.resolveRoute = this.resolveRoute;
		node.beforeRender = this.beforeRender;
		node.renderWithStatusCode = this.renderWithStatusCode;
		return node.detachFromParent();
	},
	
	renderWithStatusCode: function(code){
		if(code === undefined) code = this._route.status();
		if (this[("render" + code)]) {
			this[("render" + code)]();
			return true;
		};
		return false;
	},
	
	beforeRender: function(){
		this.resolveRoute();
		if (!this._params._active) { return false };
		
		let status = this._route.status();
		
		if (this.renderWithStatusCode(status)) {
			return false;
		};
		
		if (status >= 200) {
			return true;
		};
		
		return false;
	},
	
	resolveRoute: function(next){
		let prev = this._params;
		let match = this._route.test();
		
		if (match) {
			let active = match._active;
			match._active = true;
			
			if (match != prev) {
				this.setParams(match);
			};
			
			if (match != prev || !active) {
				this.routeDidMatch(match,prev);
			};
			
			if (!active) {
				// match.@active = true
				// should happen after load?
				this.attachToParent();
				return Imba.commit();
			};
		} else if (prev && prev._active) {
			prev._active = false;
			this.detachFromParent();
			return Imba.commit();
		};
	}
};


Imba.extendTag('element', function(tag){
	tag.prototype.__params = {watch: 'paramsDidSet',name: 'params'};
	tag.prototype.params = function(v){ return this._params; }
	tag.prototype.setParams = function(v){
		var a = this.params();
		if(v != a) { this._params = v; }
		if(v != a) { this.paramsDidSet && this.paramsDidSet(v,a,this.__params) }
		return this;
	};
	
	tag.prototype.route = function (){
		return this._route;
	};
	
	tag.prototype.setRoute = function (path,mods){
		let prev = this._route;
		
		if (!prev) {
			path = String(path);
			let par = (path[0] != '/') ? this.getParentRoute() : null;
			let opts = mods || {};
			opts.node = this;
			this._route = new Route(this.router(),path,par,opts);
			if (opts.link) {
				LinkExtend.inject(this,opts);
			} else {
				RoutedExtend.inject(this);
			};
		} else if (String(path) != prev._raw) {
			prev.setPath(String(path));
		};
		return this;
	};
	
	tag.prototype.setRouteTo = function (path,mods){
		if (this._route) {
			return this.setRoute(path);
		} else {
			mods || (mods = {});
			mods.link = true;
			return this.setRoute(path,mods);
		};
	};
	
	// for server
	tag.prototype.setRouterUrl = function (url){
		this._router || (this._router = new Router(url));
		return this;
	};
	
	tag.prototype.setRouterRoot = function (url){
		this.router().setRoot(url);
		return this;
	};
	
	tag.prototype.getParentRoute = function (){
		var route = null;
		var par = this._owner_;
		while (par){
			if (par._route) {
				return par._route;
			};
			par = par._owner_;
		};
		return null;
	};
	
	tag.prototype.setRouter = function (router){
		this._router = router;
		return this;
	};
	
	tag.prototype.router = function (){
		return this._router || (this._router = (this._owner_ && this._owner_.router() || new Router()));
		// isWeb ? Router.instance : (@router or (@owner_ ? @owner_.router : (@router ||= Router.new)))
	};
	
	tag.prototype.routeDidLoad = function (params){
		this.log('routeDidLoad');
		return this;
	};
	
	tag.prototype.routeDidFail = function (error){
		return this;
	};
	
	tag.prototype.routeDidMatch = function (params,prev){
		var self = this;
		if (!self.load) {
			self.routeDidLoad(params,prev);
			return self;
		};
		
		self.route().load(async function() {
			let val;
			try {
				if (params == prev && self.reload) {
					val = await self.reload(params,prev);
				} else {
					val = await self.load(params,prev);
				};
			} catch (e) {
				// log "route error",e
				val = 400;
				self.routeDidFail(e);
			};
			self.routeDidLoad(val);
			return val;
		});
		
		return self;
	};
	
	
	tag.prototype.ontaproute = function (){
		return this;
	};
});


/***/ }),
/* 19 */
/***/ (function(module, exports, __webpack_require__) {

function iter$(a){ return a ? (a.toArray ? a.toArray() : a) : []; };
var Imba = __webpack_require__(1);
var isWeb = typeof window !== 'undefined';

function Route(router,str,parent,options){
	this._parent = parent;
	this._router = router;
	this._options = options || {};
	this._node = this._options.node;
	this._status = 200;
	this.setPath(str);
};

exports.Route = Route; // export class 
Route.prototype.raw = function(v){ return this._raw; }
Route.prototype.setRaw = function(v){ this._raw = v; return this; };
Route.prototype.params = function(v){ return this._params; }
Route.prototype.setParams = function(v){ this._params = v; return this; };
Route.prototype.__status = {watch: 'statusDidSet',name: 'status'};
Route.prototype.status = function(v){ return this._status; }
Route.prototype.setStatus = function(v){
	var a = this.status();
	if(v != a) { this._status = v; }
	if(v != a) { this.statusDidSet && this.statusDidSet(v,a,this.__status) }
	return this;
};

Route.prototype.option = function (key){
	return this._options[key];
};

Route.prototype.setPath = function (path){
	var self = this;
	if (self._raw == path) { return self };
	self._raw = path;
	self._groups = [];
	self._params = {};
	self._cache = {};
	path = path.replace(/\:(\w+|\*)(\.)?/g,function(m,id,dot) {
		// what about :id.:format?
		if (id != '*') { self._groups.push(id) };
		if (dot) {
			return "([^\/\#\.\?]+)\.";
		} else {
			return "([^\/\#\?]+)";
		};
	});
	
	path = '^' + path;
	let end = path[path.length - 1];
	if (self._options.exact && end != '$') {
		path = path + '(?=[\#\?]|$)';
	} else if ((end != '/' && end != '$' && path != '^/')) {
		// we only want to match end OR /
		// if path[path:length - 1]
		path = path + '(?=[\/\#\?]|$)';
	};
	self._regex = new RegExp(path);
	return self;
};

Route.prototype.test = function (url){
	var m, match;
	url || (url = this._router.url()); // should include hash?
	if (url == this._cache.url) { return this._cache.match };
	
	let prefix = '';
	let matcher = this._cache.url = url;
	this._cache.match = null;
	
	if (this._parent && this._raw[0] != '/') {
		if (m = this._parent.test(url)) {
			if (url.indexOf(m.path) == 0) {
				prefix = m.path + '/';
				matcher = url.slice(m.path.length + 1);
			};
		};
	};
	
	if (match = matcher.match(this._regex)) {
		let path = prefix + match[0];
		if (path == this._params.path) {
			this._params.url = url;
			return this._cache.match = this._params;
		};
		
		this._params = {path: path,url: url};
		if (this._groups.length) {
			for (let i = 0, items = iter$(match), len = items.length, item, name; i < len; i++) {
				item = items[i];
				if (name = this._groups[i - 1]) {
					this._params[name] = item;
				};
			};
		};
		
		return this._cache.match = this._params;
	};
	
	return this._cache.match = null;
};

// should split up the Route types
Route.prototype.statusDidSet = function (status,prev){
	let idx = this._router.busy().indexOf(this);
	clearTimeout(this._statusTimeout);
	
	if (status < 200) {
		if (idx == -1) { this._router.busy().push(this) };
		this._statusTimeout = setTimeout(function() { return status = 408; },25000);
	} else if (idx >= 0 && status >= 200) {
		this._router.busy().splice(idx,1);
		
		// immediately to be able to kick of nested routes
		// is not commit more natural?
		this._node && this._node.commit  &&  this._node.commit();
		// Imba.commit
		if (this._router.busy().length == 0) {
			Imba.emit(this._router,'ready',[this._router]);
		};
	};
	
	return this._node && this._node.setFlag  &&  this._node.setFlag('route-status',("status-" + status));
};

Route.prototype.load = function (cb){
	var self = this;
	self.setStatus(102);
	
	var handler = self._handler = function(res) {
		var v_;
		if (handler != self._handler) {
			// console.log "another load has started after this"
			return;
		};
		
		self._handler = null;
		return (self.setStatus(v_ = ((typeof res=='number'||res instanceof Number)) ? res : 200),v_);
	};
	
	if (cb instanceof Function) {
		cb = cb(handler);
	};
	
	if (cb && cb.then) {
		cb.then(handler,handler);
	} else {
		handler(cb);
	};
	return self;
};

Route.prototype.resolve = function (url){
	var m;
	url || (url = this._router.url());
	if (this._cache.resolveUrl == url) {
		return this._cache.resolved;
	};
	
	// let base = @router.root or ''
	let base = '';
	this._cache.resolveUrl = url; // base + url
	
	if (this._parent && this._raw[0] != '/') {
		if (m = this._parent.test()) {
			this._cache.resolved = base + m.path + '/' + this._raw; // .replace('$','')
		};
	} else {
		// FIXME what if the url has some unknowns?
		this._cache.resolved = base + this._raw; // .replace(/[\@\$]/g,'')
	};
	
	return this._cache.resolved;
};


/***/ }),
/* 20 */
/***/ (function(module, exports) {

var self = {};

var customers = exports.customers = [{
	"id": 1,
	"name": "Corey Celand",
	"email": "cceland0@dell.com"
},{
	"id": 2,
	"name": "Gustav Huckle",
	"email": "ghuckle1@noaa.gov"
},{
	"id": 3,
	"name": "Bell Crafts",
	"email": "bcrafts2@furl.net"
},{
	"id": 4,
	"name": "Val Instone",
	"email": "vinstone3@joomla.org"
},{
	"id": 5,
	"name": "Gilly Molan",
	"email": "gmolan4@about.me"
},{
	"id": 6,
	"name": "Hogan Alleway",
	"email": "halleway5@paginegialle.it"
},{
	"id": 7,
	"name": "Chan Strickett",
	"email": "cstrickett6@alibaba.com"
},{
	"id": 8,
	"name": "Whitney Keasey",
	"email": "wkeasey7@bravesites.com"
},{
	"id": 9,
	"name": "Vernen Roston",
	"email": "vroston8@posterous.com"
},{
	"id": 10,
	"name": "Letti Pelchat",
	"email": "lpelchat9@google.cn"
}];


var orders = exports.orders = [{
	"id": 1,
	"date": "2017-06-04T03:01:07Z",
	"custid": 6,
	"quantity": 2,
	"price": 139,
	"product": "Tomato - Peeled Italian Canned"
},{
	"id": 2,
	"date": "2017-06-27T23:24:01Z",
	"custid": 10,
	"quantity": 1,
	"price": 169,
	"product": "Soup - Knorr, Veg / Beef"
},{
	"id": 3,
	"date": "2017-11-15T19:31:18Z",
	"custid": 1,
	"quantity": 1,
	"price": 189,
	"product": "Broom And Broom Rack White"
},{
	"id": 4,
	"date": "2017-03-05T15:54:43Z",
	"custid": 4,
	"quantity": 3,
	"price": 179,
	"product": "Wine - Pinot Noir Latour"
},{
	"id": 5,
	"date": "2017-11-07T11:01:20Z",
	"custid": 10,
	"quantity": 3,
	"price": 119,
	"product": "Pepperoni Slices"
},{
	"id": 6,
	"date": "2017-04-29T11:52:23Z",
	"custid": 7,
	"quantity": 1,
	"price": 159,
	"product": "Banana"
},{
	"id": 7,
	"date": "2017-08-06T23:05:52Z",
	"custid": 9,
	"quantity": 2,
	"price": 189,
	"product": "Corn Syrup"
},{
	"id": 8,
	"date": "2017-10-20T03:39:38Z",
	"custid": 10,
	"quantity": 3,
	"price": 139,
	"product": "Onions - Pearl"
},{
	"id": 9,
	"date": "2017-12-26T02:29:20Z",
	"custid": 9,
	"quantity": 1,
	"price": 159,
	"product": "Red Pepper Paste"
},{
	"id": 10,
	"date": "2017-12-21T07:42:08Z",
	"custid": 4,
	"quantity": 3,
	"price": 139,
	"product": "Shiratamako - Rice Flour"
},{
	"id": 11,
	"date": "2017-06-01T08:46:47Z",
	"custid": 2,
	"quantity": 2,
	"price": 169,
	"product": "Cornstarch"
},{
	"id": 12,
	"date": "2017-07-17T20:12:01Z",
	"custid": 2,
	"quantity": 2,
	"price": 119,
	"product": "Straws - Cocktale"
},{
	"id": 13,
	"date": "2017-04-12T23:16:03Z",
	"custid": 7,
	"quantity": 1,
	"price": 109,
	"product": "Wine - Taylors Reserve"
},{
	"id": 14,
	"date": "2018-02-17T06:24:08Z",
	"custid": 3,
	"quantity": 2,
	"price": 119,
	"product": "Schnappes - Peach, Walkers"
},{
	"id": 15,
	"date": "2017-12-30T06:55:07Z",
	"custid": 1,
	"quantity": 2,
	"price": 99,
	"product": "Juice - Propel Sport"
},{
	"id": 16,
	"date": "2017-03-05T03:12:44Z",
	"custid": 9,
	"quantity": 1,
	"price": 159,
	"product": "Aspic - Clear"
},{
	"id": 17,
	"date": "2017-10-03T06:15:26Z",
	"custid": 4,
	"quantity": 3,
	"price": 139,
	"product": "Mushroom - Chantrelle, Fresh"
},{
	"id": 18,
	"date": "2017-12-28T04:10:50Z",
	"custid": 2,
	"quantity": 3,
	"price": 129,
	"product": "Tuna - Fresh"
},{
	"id": 19,
	"date": "2018-01-09T00:40:50Z",
	"custid": 7,
	"quantity": 3,
	"price": 199,
	"product": "Aromat Spice / Seasoning"
},{
	"id": 20,
	"date": "2017-06-26T05:41:09Z",
	"custid": 10,
	"quantity": 2,
	"price": 119,
	"product": "Pastry - Chocolate Marble Tea"
},{
	"id": 21,
	"date": "2017-05-25T12:03:51Z",
	"custid": 5,
	"quantity": 3,
	"price": 159,
	"product": "Wine - Sauvignon Blanc Oyster"
},{
	"id": 22,
	"date": "2017-03-19T15:28:59Z",
	"custid": 5,
	"quantity": 3,
	"price": 159,
	"product": "Beans - Long, Chinese"
},{
	"id": 23,
	"date": "2017-03-30T09:01:27Z",
	"custid": 3,
	"quantity": 2,
	"price": 129,
	"product": "Juice - Cranberry, 341 Ml"
},{
	"id": 24,
	"date": "2017-05-02T18:38:42Z",
	"custid": 7,
	"quantity": 1,
	"price": 109,
	"product": "Sauce - Roasted Red Pepper"
},{
	"id": 25,
	"date": "2017-12-11T21:47:20Z",
	"custid": 1,
	"quantity": 3,
	"price": 169,
	"product": "Pecan Raisin - Tarts"
},{
	"id": 26,
	"date": "2017-10-12T13:48:50Z",
	"custid": 4,
	"quantity": 1,
	"price": 139,
	"product": "Juice - Pineapple, 341 Ml"
},{
	"id": 27,
	"date": "2018-02-01T00:44:51Z",
	"custid": 3,
	"quantity": 2,
	"price": 199,
	"product": "Nut - Peanut, Roasted"
},{
	"id": 28,
	"date": "2017-09-18T02:50:48Z",
	"custid": 2,
	"quantity": 3,
	"price": 109,
	"product": "Mikes Hard Lemonade"
},{
	"id": 29,
	"date": "2017-05-20T15:08:49Z",
	"custid": 8,
	"quantity": 3,
	"price": 139,
	"product": "Wine - Rosso Toscano Igt"
},{
	"id": 30,
	"date": "2017-09-29T02:14:56Z",
	"custid": 7,
	"quantity": 2,
	"price": 119,
	"product": "Sugar - Monocystal / Rock"
},{
	"id": 31,
	"date": "2017-07-11T05:32:43Z",
	"custid": 6,
	"quantity": 2,
	"price": 119,
	"product": "Glass Clear 8 Oz"
},{
	"id": 32,
	"date": "2017-10-08T10:23:11Z",
	"custid": 4,
	"quantity": 3,
	"price": 99,
	"product": "Pork - Liver"
},{
	"id": 33,
	"date": "2017-09-15T01:12:32Z",
	"custid": 7,
	"quantity": 1,
	"price": 179,
	"product": "Lid Tray - 12in Dome"
},{
	"id": 34,
	"date": "2017-10-16T00:05:20Z",
	"custid": 4,
	"quantity": 1,
	"price": 169,
	"product": "Vermouth - White, Cinzano"
},{
	"id": 35,
	"date": "2017-04-27T11:54:22Z",
	"custid": 8,
	"quantity": 2,
	"price": 159,
	"product": "Wine - Cabernet Sauvignon"
},{
	"id": 36,
	"date": "2017-03-29T06:58:40Z",
	"custid": 1,
	"quantity": 1,
	"price": 159,
	"product": "Island Oasis - Strawberry"
},{
	"id": 37,
	"date": "2018-01-05T08:24:20Z",
	"custid": 5,
	"quantity": 2,
	"price": 179,
	"product": "Brandy - Orange, Mc Guiness"
},{
	"id": 38,
	"date": "2017-07-01T23:34:54Z",
	"custid": 4,
	"quantity": 1,
	"price": 119,
	"product": "Water, Tap"
},{
	"id": 39,
	"date": "2017-08-27T22:39:55Z",
	"custid": 9,
	"quantity": 3,
	"price": 119,
	"product": "Mcguinness - Blue Curacao"
},{
	"id": 40,
	"date": "2018-01-16T19:03:31Z",
	"custid": 10,
	"quantity": 3,
	"price": 179,
	"product": "Squid - Tubes / Tenticles 10/20"
}];

var endpoints = {
	'/customers.json': customers,
	'/orders.json': orders
};

exports.rpc = self.rpc = function (url){
	return new Promise(function(resolve,reject) {
		var cid;
		let data = endpoints[url];
		
		if (cid = url.match(/\/customers\/(\w+)\/orders.json/)) {
			console.log("get custom order data");
			data = orders.filter(function(order) {
				return order.custid == cid[1];
			});
		};
		
		if (data) {
			return setTimeout(function() { return resolve(data); },50);
		} else {
			return resolve(null);
		};
	});
};


/***/ })
/******/ ]);