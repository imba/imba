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
/******/ 	return __webpack_require__(__webpack_require__.s = 5);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports, __webpack_require__) {

module.exports = __webpack_require__(2);


/***/ }),
/* 1 */
/***/ (function(module, exports) {

/*
Imba is the namespace for all runtime related utilities
@namespace
*/

var Imba = {VERSION: '1.3.0-beta.7'};

/*

Light wrapper around native setTimeout that expects the block / function
as last argument (instead of first). It also triggers an event to Imba
after the timeout to let schedulers update (to rerender etc) afterwards.

*/

Imba.setTimeout = function (delay,block){
	return setTimeout(function() {
		block();
		return Imba.commit();
	},delay);
};

/*

Light wrapper around native setInterval that expects the block / function
as last argument (instead of first). It also triggers an event to Imba
after every interval to let schedulers update (to rerender etc) afterwards.

*/

Imba.setInterval = function (interval,block){
	return setInterval(block,interval);
};

/*
Clear interval with specified id
*/

Imba.clearInterval = function (id){
	return clearInterval(id);
};

/*
Clear timeout with specified id
*/

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

/*
Lightweight method for making an object iterable in imbas for/in loops.
If the compiler cannot say for certain that a target in a for loop is an
array, it will cache the iterable version before looping.

```imba
# this is the whole method
def Imba.iterable o
	return o ? (o:toArray ? o.toArray : o) : []

class CustomIterable
	def toArray
		[1,2,3]

# will return [2,4,6]
for x in CustomIterable.new
	x * 2

```
*/

Imba.iterable = function (o){
	return o ? ((o.toArray ? o.toArray() : o)) : [];
};

/*
Coerces a value into a promise. If value is array it will
call `Promise.all(value)`, or if it is not a promise it will
wrap the value in `Promise.resolve(value)`. Used for experimental
await syntax.
@return {Promise}
*/

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


// Basic events
function emit__(event,args,node){
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

// method for registering a listener on object
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

// register a listener once
Imba.once = function (obj,event,listener){
	var tail = Imba.listen(obj,event,listener);
	tail.times = 1;
	return tail;
};

// remove a listener
Imba.unlisten = function (obj,event,cb,meth){
	var node,prev;
	var meta = obj.__listeners__;
	if (!meta) { return };
	
	if (node = meta[event]) {
		while ((prev = node) && (node = node.next)){
			if (node == cb || node.listener == cb) {
				prev.next = node.next;
				// check for correct path as well?
				node.listener = null;
				break;
			};
		};
	};
	return;
};

// emit event
Imba.emit = function (obj,event,params){
	var cb;
	if (cb = obj.__listeners__) {
		if (cb[event]) { emit__(event,params,cb[event]) };
		if (cb.all) { emit__(event,[event,params],cb.all) }; // and event != 'all'
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

module.exports = __webpack_require__(6);


/***/ }),
/* 3 */
/***/ (function(module, exports, __webpack_require__) {

var Imba = __webpack_require__(1);

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

// this is just for regular mouse now
Imba.Pointer.prototype.process = function (){
	var e1 = this._event;
	
	if (this._dirty) {
		this._prevEvent = e1;
		this._dirty = false;
		
		// button should only change on mousedown etc
		if (e1.type == 'mousedown') {
			this._button = e1.button;
			
			if ((this._touch && this._button != 0)) {
				return;
			};
			
			// cancel the previous touch
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
			// trigger pointerup
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
/* 4 */
/***/ (function(module, exports, __webpack_require__) {

var Imba = __webpack_require__(0);

function hello(){
	return "world";
}; exports.hello = hello;

function Item(){ };

exports.Item = Item; // export class 
Item.prototype.name = function (){
	return "item";
};


function A(){ };

exports.A = A; // export class 
A.prototype.name = function (){
	return "a";
};

function B(){ return A.apply(this,arguments) };

Imba.subclass(B,A);
exports.B = B; // export class 
B.prototype.name = function (){
	return "b";
};

var emptyModule = (function($module){return $module;})({})
exports.emptyModule = emptyModule;

var service = (function($module){
	$module._counter = 0;
	
	$module.name = function(v){ return this._name; }
	$module.setName = function(v){ this._name = v; return this; };
	
	$module.inc = function (){
		"use strict";
		var self = this || $module;
		return ++self._counter;
	};
	
	$module.decr = function (){
		"use strict";
		var self = this || $module;
		return --self._counter;
	};
	
	$module.handle = function (module){
		// module is only a keyword when followed by identifier (for now)
		"use strict";
		var self = this || $module;
		if(module === undefined) module = {a: 1};
		var module = {};
		return module;
	};
	return $module;
})({})
exports.service = service;


/***/ }),
/* 5 */
/***/ (function(module, exports, __webpack_require__) {


// require imba ( ensure local version )
__webpack_require__(2);
__webpack_require__(16);

__webpack_require__(17);
__webpack_require__(18);
__webpack_require__(19);
__webpack_require__(20);
__webpack_require__(21);
__webpack_require__(22);
__webpack_require__(23);
__webpack_require__(24);
__webpack_require__(25);
__webpack_require__(26);
__webpack_require__(27);
__webpack_require__(28);
__webpack_require__(29);
__webpack_require__(30);
__webpack_require__(31);
__webpack_require__(32);
__webpack_require__(33);
__webpack_require__(34);
__webpack_require__(35);
__webpack_require__(36);
__webpack_require__(37);
__webpack_require__(38);
__webpack_require__(39);
__webpack_require__(40);
__webpack_require__(41);

__webpack_require__(42);
__webpack_require__(43);

if (true) {
	__webpack_require__(44);
	__webpack_require__(46);
	__webpack_require__(47);
	__webpack_require__(48);
	__webpack_require__(49);
};

if (false) {};

// externs;

SPEC.run(function(exitCode) {
	if (typeof phantom == 'object') {
		return phantom.exit(exitCode);
	} else if (typeof process == 'object' && process.exit) {
		return process.exit(exitCode);
	};
});


/***/ }),
/* 6 */
/***/ (function(module, exports, __webpack_require__) {

var Imba = __webpack_require__(1);
var activate = false;
if (typeof window !== 'undefined') {
	if (window.Imba) {
		console.warn(("Imba v" + (window.Imba.VERSION) + " is already loaded."));
		Imba = window.Imba;
	} else {
		window.Imba = Imba;
		activate = true;
		if (window.define && window.define.amd) {
			window.define("imba",[],function() { return Imba; });
		};
	};
};

module.exports = Imba;

if (true) {
	__webpack_require__(7);
	__webpack_require__(8);
};

if (true && activate) {
	Imba.EventManager.activate();
};

if (false) {};


/***/ }),
/* 7 */
/***/ (function(module, exports, __webpack_require__) {

function iter$(a){ return a ? (a.toArray ? a.toArray() : a) : []; };
var Imba = __webpack_require__(1);

var requestAnimationFrame; // very simple raf polyfill
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

// should add an Imba.run / setImmediate that
// pushes listener onto the tick-queue with times - once

var commitQueue = 0;

Imba.commit = function (params){
	commitQueue++;
	// Imba.TagManager.refresh
	Imba.emit(Imba,'commit',(params != undefined) ? [params] : undefined);
	if (--commitQueue == 0) {
		Imba.TagManager && Imba.TagManager.refresh();
	};
	return;
};

/*

Instances of Imba.Scheduler manages when to call `tick()` on their target,
at a specified framerate or when certain events occur. Root-nodes in your
applications will usually have a scheduler to make sure they rerender when
something changes. It is also possible to make inner components use their
own schedulers to control when they render.

@iname scheduler

*/

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

/*
	Create a new Imba.Scheduler for specified target
	@return {Imba.Scheduler}
	*/

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

/*
	Check whether the current scheduler is active or not
	@return {bool}
	*/

Imba.Scheduler.prototype.active = function (){
	return this._active;
};

/*
	Delta time between the two last ticks
	@return {Number}
	*/

Imba.Scheduler.prototype.dt = function (){
	return this._dt;
};

/*
	Configure the scheduler
	@return {self}
	*/

Imba.Scheduler.prototype.configure = function (options){
	var v_;
	if(options === undefined) options = {};
	if (options.raf != undefined) { (this.setRaf(v_ = options.raf),v_) };
	if (options.interval != undefined) { (this.setInterval(v_ = options.interval),v_) };
	if (options.events != undefined) { (this.setEvents(v_ = options.events),v_) };
	return this;
};

/*
	Mark the scheduler as dirty. This will make sure that
	the scheduler calls `target.tick` on the next frame
	@return {self}
	*/

Imba.Scheduler.prototype.mark = function (){
	this._marked = true;
	if (!this._scheduled) {
		this.requestTick();
	};
	return this;
};

/*
	Instantly trigger target.tick and mark scheduler as clean (not dirty/marked).
	This is called implicitly from tick, but can also be called manually if you
	really want to force a tick without waiting for the next frame.
	@return {self}
	*/

Imba.Scheduler.prototype.flush = function (){
	this._flushes++;
	this._target.tick(this);
	this._marked = false;
	return this;
};

/*
	@fixme this expects raf to run at 60 fps 

	Called automatically on every frame while the scheduler is active.
	It will only call `target.tick` if the scheduler is marked dirty,
	or when according to @fps setting.

	If you have set up a scheduler with an fps of 1, tick will still be
	called every frame, but `target.tick` will only be called once every
	second, and it will *make sure* each `target.tick` happens in separate
	seconds according to Date. So if you have a node that renders a clock
	based on Date.now (or something similar), you can schedule it with 1fps,
	never needing to worry about two ticks happening within the same second.
	The same goes for 4fps, 10fps etc.

	@protected
	@return {self}
	*/

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

/*
	Start the scheduler if it is not already active.
	**While active**, the scheduler will override `target.commit`
	to do nothing. By default Imba.tag#commit calls render, so
	that rendering is cascaded through to children when rendering
	a node. When a scheduler is active (for a node), Imba disables
	this automatic rendering.
	*/

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

/*
	Stop the scheduler if it is active.
	*/

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
/* 8 */
/***/ (function(module, exports, __webpack_require__) {

var Imba = __webpack_require__(1);

__webpack_require__(9);

Imba.TagManager = new Imba.TagManagerClass();

__webpack_require__(10);
__webpack_require__(11);
__webpack_require__(3);
__webpack_require__(12);
__webpack_require__(13);
__webpack_require__(14);

if (true) {
	__webpack_require__(15);
};

if (false) {};


/***/ }),
/* 9 */
/***/ (function(module, exports, __webpack_require__) {

function iter$(a){ return a ? (a.toArray ? a.toArray() : a) : []; };
var Imba = __webpack_require__(1);

Imba.TagManagerClass = function TagManagerClass(){
	this._inserts = 0;
	this._removes = 0;
	this._mounted = [];
	this._hasMountables = false;
	this;
};

Imba.TagManagerClass.prototype.mounted = function (){
	return this._mounted;
};

Imba.TagManagerClass.prototype.insert = function (node,parent){
	return this._inserts++;
};

Imba.TagManagerClass.prototype.remove = function (node,parent){
	return this._removes++;
};

Imba.TagManagerClass.prototype.changes = function (){
	return this._inserts + this._removes;
};

Imba.TagManagerClass.prototype.mount = function (node){
	if (false) {};
	return this._hasMountables = true;
};

Imba.TagManagerClass.prototype.refresh = function (force){
	if(force === undefined) force = false;
	if (false) {};
	if (!force && this.changes() == 0) { return };
	// console.time('resolveMounts')
	if ((this._inserts && this._hasMountables) || force) {
		this.tryMount();
	};
	
	if ((this._removes || force) && this._mounted.length) {
		this.tryUnmount();
	};
	// console.timeEnd('resolveMounts')
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
	// what if we end up creating additional mountables by mounting?
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
	this._mounted.push(node);
	node.FLAGS |= Imba.TAG_MOUNTED;
	if (node.mount) { node.mount() };
	return;
};

Imba.TagManagerClass.prototype.tryUnmount = function (){
	var count = 0;
	var root = document.body;
	for (let i = 0, items = iter$(this._mounted), len = items.length, item; i < len; i++) {
		item = items[i];
		if (!document.documentElement.contains(item._dom)) {
			item.FLAGS = item.FLAGS & ~Imba.TAG_MOUNTED;
			if (item.unmount && item._dom) {
				item.unmount();
			} else if (item._scheduler) {
				// MAYBE FIX THIS?
				item.unschedule();
			};
			this._mounted[i] = null;
			count++;
		};
	};
	
	if (count) {
		this._mounted = this._mounted.filter(function(item) { return item; });
	};
	return this;
};


/***/ }),
/* 10 */
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

/*
Get the current document
*/

Imba.document = function (){
	if (true) {
		return window.document;
	};
};

/*
Get the body element wrapped in an Imba.Tag
*/

Imba.root = function (){
	return Imba.getTagForDom(Imba.document().body);
};

Imba.static = function (items,typ,nr){
	items._type = typ;
	items.static = nr;
	return items;
};

/*

*/

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

/*
This is the baseclass that all tags in imba inherit from.
@iname node
*/

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

/*
	Called when a tag type is being subclassed.
	*/

Imba.Tag.inherit = function (child){
	child.prototype._empty = true;
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

/*
	Internal method called after a tag class has
	been declared or extended.
	
	@private
	*/

Imba.Tag.prototype.optimizeTagStructure = function (){
	var base = Imba.Tag.prototype;
	var hasSetup = this.setup != base.setup;
	var hasCommit = this.commit != base.commit;
	var hasRender = this.render != base.render;
	var hasMount = this.mount;
	
	var ctor = this.constructor;
	
	if (hasCommit || hasRender || hasMount || hasSetup) {
		
		this.end = function() {
			if (this.mount && !(this.FLAGS & Imba.TAG_MOUNTED)) {
				// just activate 
				Imba.TagManager.mount(this);
			};
			
			if (!(this.FLAGS & Imba.TAG_SETUP)) {
				this.FLAGS |= Imba.TAG_SETUP;
				this.setup();
			};
			
			this.commit();
			
			return this;
		};
	};
	
	if (true) {
		if (hasMount) {
			if (ctor._classes && ctor._classes.indexOf('__mount') == -1) {
				ctor._classes.push('__mount');
			};
			
			if (ctor._protoDom) {
				ctor._protoDom.classList.add('__mount');
			};
		};
		
		for (let i = 0, items = ['mousemove','mouseenter','mouseleave','mouseover','mouseout','selectstart'], len = items.length, item; i < len; i++) {
			item = items[i];
			if (this[("on" + item)]) { Imba.Events.register(item) };
		};
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
	this._dom = dom;
	return this;
};

Imba.Tag.prototype.ref = function (){
	return this._ref;
};

Imba.Tag.prototype.root = function (){
	return this._owner_ ? this._owner_.root() : this;
};

/*
	Setting references for tags like
	`<div@header>` will compile to `tag('div').ref_('header',this).end()`
	By default it adds the reference as a className to the tag.

	@return {self}
	@private
	*/

Imba.Tag.prototype.ref_ = function (ref){
	this.flag(this._ref = ref);
	return this;
};

/*
	Set the data object for node
	@return {self}
	*/

Imba.Tag.prototype.setData = function (data){
	this._data = data;
	return this;
};

/*
	Get the data object for node
	*/

Imba.Tag.prototype.data = function (){
	return this._data;
};

/*
	Set inner html of node
	*/

Imba.Tag.prototype.setHtml = function (html){
	if (this.html() != html) {
		this._dom.innerHTML = html;
	};
	return this;
};

/*
	Get inner html of node
	*/

Imba.Tag.prototype.html = function (){
	return this._dom.innerHTML;
};

Imba.Tag.prototype.on$ = function (slot,handler){
	let handlers = this._on_ || (this._on_ = []);
	let prev = handlers[slot];
	// self-bound handlers
	if (slot < 0) {
		if (prev == undefined) {
			slot = handlers[slot] = handlers.length;
		} else {
			slot = prev;
		};
		prev = handlers[slot];
	};
	
	handlers[slot] = handler;
	if (prev) { handler.state = prev.state };
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

/*
	Adds a new attribute or changes the value of an existing attribute
	on the specified tag. If the value is null or false, the attribute
	will be removed.
	@return {self}
	*/

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

Imba.Tag.prototype.setNestedAttr = function (ns,name,value){
	if (this[ns + 'SetAttribute']) {
		this[ns + 'SetAttribute'](name,value);
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


/*
	removes an attribute from the specified tag
	*/

Imba.Tag.prototype.removeAttribute = function (name){
	return this.dom().removeAttribute(name);
};

/*
	returns the value of an attribute on the tag.
	If the given attribute does not exist, the value returned
	will either be null or "" (the empty string)
	*/

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

/*
	Override this to provide special wrapping etc.
	@return {self}
	*/

Imba.Tag.prototype.setContent = function (content,type){
	this.setChildren(content,type);
	return this;
};

/*
	Set the children of node. type param is optional,
	and should only be used by Imba when compiling tag trees. 
	@return {self}
	*/

Imba.Tag.prototype.setChildren = function (nodes,type){
	if (false) {} else {
		this._empty ? this.append(nodes) : this.empty().append(nodes);
		this._tree_ = null;
	};
	return this;
};

/*
	Set the template that will render the content of node.
	@return {self}
	*/

Imba.Tag.prototype.setTemplate = function (template){
	if (!this._template) {
		// override the basic
		if (this.render == Imba.Tag.prototype.render) {
			this.render = this.renderTemplate; // do setChildren(renderTemplate)
		};
		this.optimizeTagStructure();
	};
	
	this.template = this._template = template;
	return this;
};

Imba.Tag.prototype.template = function (){
	return null;
};

/*
	If no custom render-method is defined, and the node
	has a template, this method will be used to render
	@return {self}
	*/

Imba.Tag.prototype.renderTemplate = function (){
	var body = this.template();
	if (body != this) { this.setChildren(body) };
	return this;
};


/*
	Remove specified child from current node.
	@return {self}
	*/

Imba.Tag.prototype.removeChild = function (child){
	var par = this.dom();
	var el = child._dom || child;
	if (el && el.parentNode == par) {
		par.removeChild(el);
		Imba.TagManager.remove(el._tag || el,this);
	};
	return this;
};


/*
	Append a single item (node or string) to the current node.
	If supplied item is a string it will automatically. This is used
	by Imba internally, but will practically never be used explicitly.
	@return {self}
	*/

Imba.Tag.prototype.appendChild = function (node){
	if ((typeof node=='string'||node instanceof String)) {
		this.dom().appendChild(Imba.document().createTextNode(node));
	} else if (node) {
		this.dom().appendChild(node._dom || node);
		Imba.TagManager.insert(node._tag || node,this);
		// FIXME ensure these are not called for text nodes
	};
	return this;
};

/*
	Insert a node into the current node (self), before another.
	The relative node must be a child of current node. 
	*/

Imba.Tag.prototype.insertBefore = function (node,rel){
	if ((typeof node=='string'||node instanceof String)) {
		node = Imba.document().createTextNode(node);
	};
	
	if (node && rel) {
		this.dom().insertBefore((node._dom || node),(rel._dom || rel));
		Imba.TagManager.insert(node._tag || node,this);
		// FIXME ensure these are not called for text nodes
	};
	return this;
};


/*
	Remove node from the dom tree
	@return {self}
	*/

Imba.Tag.prototype.orphanize = function (){
	var par;
	if (par = this.parent()) { par.removeChild(this) };
	return this;
};

/*
	Get text of node. Uses textContent behind the scenes (not innerText)
	[https://developer.mozilla.org/en-US/docs/Web/API/Node/textContent]()
	@return {string} inner text of node
	*/

Imba.Tag.prototype.text = function (v){
	return this._dom.textContent;
};

/*
	Set text of node. Uses textContent behind the scenes (not innerText)
	[https://developer.mozilla.org/en-US/docs/Web/API/Node/textContent]()
	*/

Imba.Tag.prototype.setText = function (txt){
	this._empty = false;
	this._dom.textContent = (txt == null || this.text() === false) ? '' : txt;
	this;
	return this;
};


/*
	Method for getting and setting data-attributes. When called with zero
	arguments it will return the actual dataset for the tag.

		var node = <div data-name='hello'>
		# get the whole dataset
		node.dataset # {name: 'hello'}
		# get a single value
		node.dataset('name') # 'hello'
		# set a single value
		node.dataset('name','newname') # self


	*/

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


/*
	Remove all content inside node
	*/

Imba.Tag.prototype.empty = function (){
	if (this._dom.firstChild) {
		this.$.text = null;
		while (this._dom.firstChild){
			this._dom.removeChild(this._dom.firstChild);
		};
		Imba.TagManager.remove(null,this);
	};
	
	this._nodes_ = this._text_ = null;
	this._empty = true;
	return this;
};

/*
	Empty placeholder. Override to implement custom render behaviour.
	Works much like the familiar render-method in React.
	@return {self}
	*/

Imba.Tag.prototype.render = function (){
	return this;
};

/*
	Called implicitly while tag is initializing. No initial props
	will have been set at this point.
	@return {self}
	*/

Imba.Tag.prototype.build = function (){
	return this;
};

/*
	Called once, implicitly through Imba.Tag#end. All initial props
	and children will have been set before setup is called.
	setContent.
	@return {self}
	*/

Imba.Tag.prototype.setup = function (){
	return this;
};

/*
	Called implicitly through Imba.Tag#end, for tags that are part of
	a tag tree (that are rendered several times).
	@return {self}
	*/

Imba.Tag.prototype.commit = function (){
	this.render();
	return this;
};

/*

	Called by the tag-scheduler (if this tag is scheduled)
	By default it will call this.render. Do not override unless
	you really understand it.

	*/

Imba.Tag.prototype.tick = function (){
	this.render();
	return this;
};

/*
	
	A very important method that you will practically never manually.
	The tag syntax of Imba compiles to a chain of setters, which always
	ends with .end. `<a.large>` compiles to `tag('a').flag('large').end()`
	
	You are highly adviced to not override its behaviour. The first time
	end is called it will mark the tag as initialized and call Imba.Tag#setup,
	and call Imba.Tag#commit every time.
	@return {self}
	*/

Imba.Tag.prototype.end = function (){
	return this;
};

// called on <self> to check if self is called from other places
Imba.Tag.prototype.$open = function (context){
	if (context != this._context_) {
		this._tree_ = null;
		this._context_ = context;
	};
	return this;
};

/*
	This is called instead of Imba.Tag#end for `<self>` tag chains.
	Defaults to noop
	@return {self}
	*/

Imba.Tag.prototype.synced = function (){
	return this;
};

// called when the node is awakened in the dom - either automatically
// upon attachment to the dom-tree, or the first time imba needs the
// tag for a domnode that has been rendered on the server
Imba.Tag.prototype.awaken = function (){
	return this;
};

/*
	List of flags for this node. 
	*/

Imba.Tag.prototype.flags = function (){
	return this._dom.classList;
};

/*
	Add speficied flag to current node.
	If a second argument is supplied, it will be coerced into a Boolean,
	and used to indicate whether we should remove the flag instead.
	@return {self}
	*/

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

/*
	Remove specified flag from node
	@return {self}
	*/

Imba.Tag.prototype.unflag = function (name){
	this._dom.classList.remove(name);
	return this;
};

/*
	Toggle specified flag on node
	@return {self}
	*/

Imba.Tag.prototype.toggleFlag = function (name){
	this._dom.classList.toggle(name);
	return this;
};

/*
	Check whether current node has specified flag
	@return {bool}
	*/

Imba.Tag.prototype.hasFlag = function (name){
	return this._dom.classList.contains(name);
};


Imba.Tag.prototype.flagIf = function (flag,bool){
	var f = this.$;
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

/*
	Set/update a named flag. It remembers the previous
	value of the flag, and removes it before setting the new value.

		node.setFlag('type','todo')
		node.setFlag('type','project')
		# todo is removed, project is added.

	@return {self}
	*/

Imba.Tag.prototype.setFlag = function (name,value){
	var $_;
	let flags = ($_ = this.$).flags || ($_.flags = {});
	let prev = flags[name];
	if (prev != value) {
		if (prev) { this.unflag(prev) };
		if (value) { this.flag(value) };
		flags[name] = value;
	};
	return this;
};


/*
	Get the scheduler for this node. A new scheduler will be created
	if it does not already exist.

	@return {Imba.Scheduler}
	*/

Imba.Tag.prototype.scheduler = function (){
	return (this._scheduler == null) ? (this._scheduler = new Imba.Scheduler(this)) : this._scheduler;
};

/*

	Shorthand to start scheduling a node. The method will basically
	proxy the arguments through to scheduler.configure, and then
	activate the scheduler.
	
	@return {self}
	*/

Imba.Tag.prototype.schedule = function (options){
	if(options === undefined) options = {events: true};
	this.scheduler().configure(options).activate();
	return this;
};

/*
	Shorthand for deactivating scheduler (if tag has one).
	@deprecated
	*/

Imba.Tag.prototype.unschedule = function (){
	if (this._scheduler) { this.scheduler().deactivate() };
	return this;
};


/*
	Get the parent of current node
	@return {Imba.Tag} 
	*/

Imba.Tag.prototype.parent = function (){
	return Imba.getTagForDom(this.dom().parentNode);
};

/*
	Get the children of node
	@return {Imba.Tag[]}
	*/

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

/*
	Check if this node matches a selector
	@return {Boolean}
	*/

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

/*
	Get the first element matching supplied selector / filter
	traversing upwards, but including the node itself.
	@return {Imba.Tag}
	*/

Imba.Tag.prototype.closest = function (sel){
	return Imba.getTagForDom(this._dom.closest(sel));
};

/*
	Check if node contains other node
	@return {Boolean} 
	*/

Imba.Tag.prototype.contains = function (node){
	return this.dom().contains(node._dom || node);
};


/*
	Shorthand for console.log on elements
	@return {self}
	*/

Imba.Tag.prototype.log = function (){
	var $0 = arguments, i = $0.length;
	var args = new Array(i>0 ? i : 0);
	while(i>0) args[i-1] = $0[--i];
	args.unshift(console);
	Function.prototype.call.apply(console.log,args);
	return this;
};

Imba.Tag.prototype.css = function (key,val){
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
	} else {
		if ((typeof val=='number'||val instanceof Number) && name.match(/width|height|left|right|top|bottom/)) {
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

/*
	Trigger an event from current node. Dispatched through the Imba event manager.
	To dispatch actual dom events, use dom.dispatchEvent instead.

	@return {Imba.Event}
	*/

Imba.Tag.prototype.trigger = function (name,data){
	if(data === undefined) data = {};
	return true && Imba.Events.trigger(name,this,{data: data});
};

/*
	Focus on current node
	@return {self}
	*/

Imba.Tag.prototype.focus = function (){
	this.dom().focus();
	return this;
};

/*
	Remove focus from current node
	@return {self}
	*/

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
	var cls = this._classes.join(" ");
	if (cls) { dom.className.baseVal = cls };
	return dom;
};

Imba.SVGTag.inherit = function (child){
	child._protoDom = null;
	if (Imba.indexOf(child._name,Imba.SVG_TAGS) >= 0) {
		child._nodeType = child._name;
		return child._classes = [];
	} else {
		child._nodeType = this._nodeType;
		var className = "_" + child._name.replace(/_/g,'-');
		return child._classes = this._classes.concat(className);
	};
};

Imba.HTML_TAGS = "a abbr address area article aside audio b base bdi bdo big blockquote body br button canvas caption cite code col colgroup data datalist dd del details dfn div dl dt em embed fieldset figcaption figure footer form h1 h2 h3 h4 h5 h6 head header hr html i iframe img input ins kbd keygen label legend li link main map mark menu menuitem meta meter nav noscript object ol optgroup option output p param pre progress q rp rt ruby s samp script section select small source span strong style sub summary sup table tbody td textarea tfoot th thead time title tr track u ul var video wbr".split(" ");
Imba.HTML_TAGS_UNSAFE = "article aside header section".split(" ");
Imba.SVG_TAGS = "circle defs ellipse g line linearGradient mask path pattern polygon polyline radialGradient rect stop svg text tspan".split(" ");

Imba.HTML_ATTRS = {
	a: "href target hreflang media download rel type",
	form: "method action enctype autocomplete target",
	button: "autofocus type",
	input: "accept disabled form list max maxlength min pattern required size step type",
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
	textarea: "rows cols"
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

function extender(obj,sup){
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

function TagSpawner(type){
	return function(zone) { return type.build(zone); };
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
	
	// if it is namespaced
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
	// allow for private tags here as well?
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

Imba.Tags.prototype.createElement = function (name,owner){
	var typ;
	if (name instanceof Function) {
		typ = name;
	} else {
		if (null) {};
		typ = this.findTagType(name);
	};
	return typ.build(owner);
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
	
	if (pref instanceof Imba.Tag) {
		parent = pref;
	} else {
		parent = (ctx && pref != undefined) ? ctx[pref] : ((ctx && ctx._tag || ctx));
	};
	
	var node = type.build(parent);
	
	if (ctx instanceof TagMap) {
		ctx.i$++;
		node.$key = ref;
	};
	
	// node:$ref = ref if ref
	// context:i$++ # only if it is not an array?
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
	var par = ((pref != undefined) ? ctx[pref] : ctx._tag);
	var node = new TagMap(ctx,ref,par);
	ctx[ref] = node;
	return node;
};

Imba.createTagList = function (ctx,ref,pref){
	var node = [];
	node._type = 4;
	node._tag = ((pref != undefined) ? ctx[pref] : ctx._tag);
	ctx[ref] = node;
	return node;
};

// use array instead?
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
	// self:curr$ = self:$iternew()
	// self:next$ = self:$iternew()
};

TagMap.prototype.$iter = function (){
	var item = [];
	item._type = 5;
	item.static = 5;
	item.cache = this;
	return item;
};

TagMap.prototype.$iter2 = function (){
	let next = this.next$;
	this.next$ = this.curr$;
	next.length = 0;
	return this.curr$ = next;
	// var item = []
	// item.@type = 5
	// item:static = 5
	// item:cache = self
	// return item
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
		
		// no instance - check for element
		if (dom = Imba.document().getElementById(id)) {
			// we have a live instance - when finding it through a selector we should awake it, no?
			// console.log('creating the singleton from existing node in dom?',id,type)
			node = klass.Instance = new klass(dom);
			node.awaken(dom); // should only awaken
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

// shuold be phased out
Imba.getTagForDom = function (dom){
	if (!dom) { return null };
	if (dom._dom) { return dom }; // could use inheritance instead
	if (dom._tag) { return dom._tag };
	if (!dom.nodeName) { return null };
	
	var name = dom.nodeName.toLowerCase();
	var type = name;
	var ns = Imba.TAGS; //  svgSupport and dom isa SVGElement ? Imba.TAGS:_SVG : Imba.TAGS
	
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
	// if ns.@nodeNames.indexOf(name) >= 0
	//	type = ns.findTagType(name)
	
	return new type(dom,null).awaken(dom);
};

// deprecate
Imba.generateCSSPrefixes = function (){
	var styles = window.getComputedStyle(document.documentElement,'');
	
	for (let i = 0, items = iter$(styles), len = items.length, prefixed; i < len; i++) {
		prefixed = items[i];
		var unprefixed = prefixed.replace(/^-(webkit|ms|moz|o|blink)-/,'');
		var camelCase = unprefixed.replace(/-(\w)/g,function(m,a) { return a.toUpperCase(); });
		
		// if there exists an unprefixed version -- always use this
		if (prefixed != unprefixed) {
			if (styles.hasOwnProperty(unprefixed)) { continue; };
		};
		
		// register the prefixes
		Imba.CSSKeyMap[unprefixed] = Imba.CSSKeyMap[camelCase] = prefixed;
	};
	return;
};

if (true) {
	if (document) { Imba.generateCSSPrefixes() };
	
	// Ovverride classList
	if (document && !document.documentElement.classList) {
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
var Imba = __webpack_require__(1);

// predefine all supported html tags
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

function DataValue(node,path,mods){
	var self = this;
	self._node = node;
	self._path = path;
	self._mods = mods || {};
	self._setter = Imba.toSetter(self._path);
	let valueFn = node.value;
	node.value = function() { return self.mod(valueFn.call(this)); };
};

DataValue.prototype.context = function (){
	if (this._context) { return this._context };
	// caching can lead to weird behaviour
	let el = this._node;
	while (el){
		if (el.data()) {
			this._context = el;
			break;
		};
		el = el._owner_;
	};
	return this._context;
};

DataValue.prototype.data = function (){
	var ctx = this.context();
	return ctx ? ctx.data() : null;
};

DataValue.prototype.lazy = function (){
	return this._mods.lazy;
};

DataValue.prototype.get = function (){
	let data = this.data();
	if (!data) { return null };
	let val = data[this._path];
	return ((val instanceof Function) && data[this._setter]) ? data[this._path]() : val;
};

DataValue.prototype.set = function (value){
	let data = this.data();
	if (!data) { return };
	
	let prev = data[this._path];
	if (prev instanceof Function) {
		if (data[this._setter] instanceof Function) {
			data[this._setter](value);
			return this;
		};
	};
	return data[this._path] = value;
};

DataValue.prototype.isArray = function (val){
	if(val === undefined) val = this.get();
	return val && val.splice && val.sort;
};

DataValue.prototype.mod = function (value){
	var self = this;
	if (value instanceof Array) {
		return value.map(function(_0) { return self.mod(_0); });
	};
	if (self._mods.trim && (typeof value=='string'||value instanceof String)) {
		value = value.trim();
	};
	if (self._mods.number) {
		value = parseFloat(value);
	};
	return value;
};

Imba.extendTag('input', function(tag){
	tag.prototype.model = function (){
		return this._model;
	};
	
	tag.prototype.setModel = function (value,mods){
		this._model || (this._model = new DataValue(this,value,mods));
		return this;
	};
	
	tag.prototype.setValue = function (value){
		this.dom().value = this._value = value;
		return this;
	};
	
	tag.prototype.oninput = function (e){
		let val = this._dom.value;
		this._localValue = (this._initialValue != val) ? val : undefined;
		return (this.model() && !this.model().lazy()) ? this.model().set(this.value()) : e.silence();
	};
	
	tag.prototype.onchange = function (e){
		this._modelValue = this._localValue = undefined;
		if (!(this.model())) { return e.silence() };
		
		if (this.type() == 'radio' || this.type() == 'checkbox') {
			let checked = this._dom.checked;
			let mval = this.model().get();
			let dval = (this._value != undefined) ? this._value : this.value();
			// console.log "change",type,checked,dval
			
			if (this.type() == 'radio') {
				return this.model().set(dval,true);
			} else if (this.dom().value == 'on') {
				return this.model().set(!!checked,true);
			} else if (this.model().isArray()) {
				let idx = mval.indexOf(dval);
				if (checked && idx == -1) {
					return mval.push(dval);
				} else if (!checked && idx >= 0) {
					return mval.splice(idx,1);
				};
			} else {
				return this.model().set(dval);
			};
		} else {
			return this.model().set(this.value());
		};
	};
	
	// overriding end directly for performance
	tag.prototype.end = function (){
		if (!this._model || this._localValue !== undefined) { return this };
		let mval = this._model.get();
		if (mval == this._modelValue) { return this };
		if (!this.model().isArray()) { this._modelValue = mval };
		
		if (this.type() == 'radio' || this.type() == 'checkbox') {
			let dval = this._value;
			let checked = this.model().isArray() ? (
				mval.indexOf(dval) >= 0
			) : ((this.dom().value == 'on') ? (
				!!mval
			) : (
				mval == this._value
			));
			
			this._dom.checked = checked;
		} else {
			this._dom.value = mval;
			this._initialValue = this._dom.value;
		};
		return this;
	};
});

Imba.extendTag('textarea', function(tag){
	tag.prototype.model = function (){
		return this._model;
	};
	
	tag.prototype.setModel = function (value,mods){
		this._model || (this._model = new DataValue(this,value,mods));
		return this;
	};
	
	tag.prototype.setValue = function (value){
		if (this._localValue == undefined) { this.dom().value = value };
		return this;
	};
	
	tag.prototype.oninput = function (e){
		let val = this._dom.value;
		this._localValue = (this._initialValue != val) ? val : undefined;
		return (this.model() && !this.model().lazy()) ? this.model().set(this.value()) : e.silence();
	};
	
	tag.prototype.onchange = function (e){
		this._localValue = undefined;
		return this.model() ? this.model().set(this.value()) : e.silence();
	};
	
	tag.prototype.render = function (){
		if (this._localValue != undefined || !(this.model())) { return };
		if (this.model()) {
			this._dom.value = this.model().get();
		};
		this._initialValue = this._dom.value;
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
	tag.prototype.model = function (){
		return this._model;
	};
	
	tag.prototype.setModel = function (value,mods){
		this._model || (this._model = new DataValue(this,value,mods));
		return this;
	};
	
	tag.prototype.setValue = function (value){
		if (value != this._value) {
			this._value = value;
			if (typeof value == 'object') {
				for (let i = 0, items = iter$(this.dom().options), len = items.length, opt; i < len; i++) {
					opt = items[i];
					let oval = (opt._tag ? opt._tag.value() : opt.value);
					if (value == oval) {
						this.dom().selectedIndex = i;
						break;
					};
				};
			} else {
				this.dom().value = value;
			};
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
		return this.model() ? this.model().set(this.value()) : e.silence();
	};
	
	tag.prototype.render = function (){
		if (!(this.model())) { return };
		
		let mval = this.model().get();
		// sync dom value
		if (this.multiple()) {
			for (let i = 0, items = iter$(this.dom().options), len = items.length, option; i < len; i++) {
				option = items[i];
				let oval = this.model().mod(option._tag ? option._tag.value() : option.value);
				let sel = mval.indexOf(oval) >= 0;
				option.selected = sel;
			};
		} else {
			this.setValue(mval);
			// what if mval is rich? Would be nice with some mapping
			// dom:value = mval
		};
		return this;
	};
});


/***/ }),
/* 12 */
/***/ (function(module, exports, __webpack_require__) {

function iter$(a){ return a ? (a.toArray ? a.toArray() : a) : []; };
var Imba = __webpack_require__(1);

// Imba.Touch
// Began	A finger touched the screen.
// Moved	A finger moved on the screen.
// Stationary	A finger is touching the screen but hasn't moved.
// Ended	A finger was lifted from the screen. This is the final phase of a touch.
// Canceled The system cancelled tracking for the touch.

/*
Consolidates mouse and touch events. Touch objects persist across a touch,
from touchstart until end/cancel. When a touch starts, it will traverse
down from the innermost target, until it finds a node that responds to
ontouchstart. Unless the touch is explicitly redirected, the touch will
call ontouchmove and ontouchend / ontouchcancel on the responder when appropriate.

	tag draggable
		# called when a touch starts
		def ontouchstart touch
			flag 'dragging'
			self
		
		# called when touch moves - same touch object
		def ontouchmove touch
			# move the node with touch
			css top: touch.dy, left: touch.dx
		
		# called when touch ends
		def ontouchend touch
			unflag 'dragging'

@iname touch
*/

Imba.Touch = function Touch(event,pointer){
	// @native  = false
	this.setEvent(event);
	this.setData({});
	this.setActive(true);
	this._button = event && event.button || 0;
	this._suppress = false; // deprecated
	this._captured = false;
	this.setBubble(false);
	pointer = pointer;
	this.setUpdates(0);
	return this;
};

Imba.Touch.LastTimestamp = 0;
Imba.Touch.TapTimeout = 50;

// var lastNativeTouchTimeout = 50

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
		var touch = identifiers[t.identifier] = new this(e); // (e)
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
	
	// e.preventDefault
	// not always supported!
	// touches = touches.filter(||)
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

/*
	@internal
	@constructor
	*/

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

/*
	Extend the touch with a plugin / gesture. 
	All events (touchstart,move etc) for the touch
	will be triggered on the plugins in the order they
	are added.
	*/

Imba.Touch.prototype.extend = function (plugin){
	// console.log "added gesture!!!"
	this._gestures || (this._gestures = []);
	this._gestures.push(plugin);
	return this;
};

/*
	Redirect touch to specified target. ontouchstart will always be
	called on the new target.
	@return {Number}
	*/

Imba.Touch.prototype.redirect = function (target){
	this._redirect = target;
	return this;
};

/*
	Suppress the default behaviour. Will call preventDefault for
	all native events that are part of the touch.
	*/

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
		if (tap._responder) { e.preventDefault() };
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
	
	// catching a touch-redirect?!?
	if (this._redirect) {
		if (this._target && this._target.ontouchcancel) {
			this._target.ontouchcancel(this);
		};
		this.setTarget(this._redirect);
		this._redirect = null;
		if (this.target().ontouchstart) { this.target().ontouchstart(this) };
		if (this._redirect) { return this.update() }; // possibly redirecting again
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

/*
	The absolute distance the touch has moved from starting position 
	@return {Number}
	*/

Imba.Touch.prototype.dr = function (){
	return this._dr;
};

/*
	The distance the touch has moved horizontally
	@return {Number}
	*/

Imba.Touch.prototype.dx = function (){
	return this._x - this._x0;
};

/*
	The distance the touch has moved vertically
	@return {Number}
	*/

Imba.Touch.prototype.dy = function (){
	return this._y - this._y0;
};

/*
	Initial horizontal position of touch
	@return {Number}
	*/

Imba.Touch.prototype.x0 = function (){
	return this._x0;
};

/*
	Initial vertical position of touch
	@return {Number}
	*/

Imba.Touch.prototype.y0 = function (){
	return this._y0;
};

/*
	Horizontal position of touch
	@return {Number}
	*/

Imba.Touch.prototype.x = function (){
	return this._x;
};

/*
	Vertical position of touch
	@return {Number}
	*/

Imba.Touch.prototype.y = function (){
	return this._y;
};

/*
	Horizontal position of touch relative to target
	@return {Number}
	*/

Imba.Touch.prototype.tx = function (){
	this._targetBox || (this._targetBox = this._target.dom().getBoundingClientRect());
	return this._x - this._targetBox.left;
};

/*
	Vertical position of touch relative to target
	@return {Number}
	*/

Imba.Touch.prototype.ty = function (){
	this._targetBox || (this._targetBox = this._target.dom().getBoundingClientRect());
	return this._y - this._targetBox.top;
};

/*
	Button pressed in this touch. Native touches defaults to left-click (0)
	@return {Number}
	*/

Imba.Touch.prototype.button = function (){
	return this._button;
}; // @pointer ? @pointer.button : 0

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
el.getHandler = function (str){
	return this[str];
};

/*
Imba handles all events in the dom through a single manager,
listening at the root of your document. If Imba finds a tag
that listens to a certain event, the event will be wrapped 
in an `Imba.Event`, which normalizes some of the quirks and 
browser differences.

@iname event
*/

Imba.Event = function Event(e){
	this.setEvent(e);
	this._bubble = true;
};

/* reference to the native event */

Imba.Event.prototype.event = function(v){ return this._event; }
Imba.Event.prototype.setEvent = function(v){ this._event = v; return this; };

/* reference to the native event */

Imba.Event.prototype.prefix = function(v){ return this._prefix; }
Imba.Event.prototype.setPrefix = function(v){ this._prefix = v; return this; };

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

/*
	@return {String} The name of the event (case-insensitive)
	*/

Imba.Event.prototype.type = function (){
	return this._type || this.event().type;
};

Imba.Event.prototype.button = function (){
	return this.event().button;
};
Imba.Event.prototype.keyCode = function (){
	return this.event().keyCode;
};

Imba.Event.prototype.name = function (){
	return this._name || (this._name = this.type().toLowerCase().replace(/\:/g,''));
};

// mimc getset
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

/*
	Prevents further propagation of the current event.
	@return {self}
	*/

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

// migrate from cancel to prevent
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

/*
	Indicates whether or not event.cancel has been called.

	@return {Boolean}
	*/

Imba.Event.prototype.isPrevented = function (){
	return this.event() && this.event().defaultPrevented || this._cancel;
};

/*
	Cancel the event (if cancelable). In the case of native events it
	will call `preventDefault` on the wrapped event object.
	@return {self}
	*/

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

/*
	A reference to the initial target of the event.
	*/

Imba.Event.prototype.target = function (){
	return Imba.getTagForDom(this.event()._target || this.event().target);
};

/*
	A reference to the object responding to the event.
	*/

Imba.Event.prototype.responder = function (){
	return this._responder;
};

/*
	Redirect the event to new target
	*/

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
		
		// if it is still a string - call getHandler on
		// ancestor of node to see if we get a handler for this name
		if (typeof handler == 'string') {
			let el = node;
			let fn = null;
			while (el && (!fn || !(fn instanceof Function))){
				if (fn = el.getHandler(handler)) {
					handler = fn;
					context = el;
				} else {
					el = el.parent();
				};
			};
		};
		
		if (handler instanceof Function) {
			// what if we actually call stop inside function?
			// do we still want to continue the chain?
			let res = handler.apply(context,params || [this]);
			
			// should we take awaits into account?
			// was bubbling before - has not been modified
			if (!isMod) {
				bubble = false; // stop propagation by default
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
	
	// if we havent stopped or dealt with bubble while handling
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
	// @todo need to stop infinite redirect-rules here
	var result;
	var handlers;
	
	while (domnode){
		this._redirect = null;
		let node = domnode._dom ? domnode : domnode._tag;
		
		if (node) {
			if (node[meth] instanceof Function) {
				this._responder || (this._responder = node);
				this._silenced = false;
				result = args ? node[meth].apply(node,args) : node[meth](this,this.data());
			};
			
			if (handlers = node._on_) {
				for (let i = 0, items = iter$(handlers), len = items.length, handler; i < len; i++) {
					handler = items[i];
					if (!handler) { continue; };
					let hname = handler[0];
					if (name == handler[0] && this.bubble()) { // and (hname:length == name:length or hname[name:length] == '.')
						this.processHandlers(node,handler);
					};
				};
				if (!(this.bubble())) { break; };
			};
			
			if (node.onevent) {
				node.onevent(this);
			};
		};
		
		// add node.nextEventResponder as a separate method here?
		if (!(this.bubble() && (domnode = (this._redirect || (node ? node.parent() : domnode.parentNode))))) {
			break;
		};
	};
	
	this.processed();
	
	// if a handler returns a promise, notify schedulers
	// about this after promise has finished processing
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

/*
	Return the x/left coordinate of the mouse / pointer for this event
	@return {Number} x coordinate of mouse / pointer for event
	*/

Imba.Event.prototype.x = function (){
	return this.event().x;
};

/*
	Return the y/top coordinate of the mouse / pointer for this event
	@return {Number} y coordinate of mouse / pointer for event
	*/

Imba.Event.prototype.y = function (){
	return this.event().y;
};

/*
	Returns a Number representing a system and implementation
	dependent numeric code identifying the unmodified value of the
	pressed key; this is usually the same as keyCode.

	For mouse-events, the returned value indicates which button was
	pressed on the mouse to trigger the event.

	@return {Number}
	*/

Imba.Event.prototype.which = function (){
	return this.event().which;
};



/***/ }),
/* 14 */
/***/ (function(module, exports, __webpack_require__) {

function iter$(a){ return a ? (a.toArray ? a.toArray() : a) : []; };
var Imba = __webpack_require__(1);
__webpack_require__(3);

/*

Manager for listening to and delegating events in Imba. A single instance
is always created by Imba (as `Imba.Events`), which handles and delegates all
events at the very root of the document. Imba does not capture all events
by default, so if you want to make sure exotic or custom DOMEvents are delegated
in Imba you will need to register them in `Imba.Events.register(myCustomEventName)`

@iname manager

*/

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

Imba.EventManager.prototype.enabledDidSet = function (bool){
	bool ? this.onenable() : this.ondisable();
	return this;
};

Imba.EventManager.activate = function (){
	var Imba_;
	if (Imba.Events) { return Imba.Events };
	
	if (true) {
		Imba.POINTER || (Imba.POINTER = new Imba.Pointer());
		
		Imba.Events = new Imba.EventManager(Imba.document(),{events: [
			'keydown','keyup','keypress',
			'textInput','input','change','submit',
			'focusin','focusout','focus','blur',
			'contextmenu','dblclick',
			'mousewheel','wheel','scroll',
			'beforecopy','copy',
			'beforepaste','paste',
			'beforecut','cut'
		]});
		
		// should listen to dragdrop events by default
		Imba.Events.register([
			'dragstart','drag','dragend',
			'dragenter','dragover','dragleave','dragexit','drop'
		]);
		
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
				if (tap._responder) {
					return e.preventDefault();
				};
			};
			// delegate the real click event
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
		Imba.Events.setEnabled(true);
		return Imba.Events;
	};
};


/*

	Tell the current EventManager to intercept and handle event of a certain name.
	By default, Imba.Events will register interceptors for: *keydown*, *keyup*, 
	*keypress*, *textInput*, *input*, *change*, *submit*, *focusin*, *focusout*, 
	*blur*, *contextmenu*, *dblclick*, *mousewheel*, *wheel*

	*/

Imba.EventManager.prototype.register = function (name,handler){
	if(handler === undefined) handler = true;
	if (name instanceof Array) {
		for (let i = 0, items = iter$(name), len = items.length; i < len; i++) {
			this.register(items[i],handler);
		};
		return this;
	};
	
	if (this.delegators()[name]) { return this };
	// console.log("register for event {name}")
	var fn = this.delegators()[name] = (handler instanceof Function) ? handler : this.delegator();
	if (this.enabled()) { return this.root().addEventListener(name,fn,true) };
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

/*

	Create a new Imba.Event

	*/

Imba.EventManager.prototype.create = function (type,target,pars){
	if(!pars||pars.constructor !== Object) pars = {};
	var data = pars.data !== undefined ? pars.data : null;
	var source = pars.source !== undefined ? pars.source : null;
	var event = Imba.Event.wrap({type: type,target: target});
	if (data) { (event.setData(data),data) };
	if (source) { (event.setSource(source),source) };
	return event;
};

/*

	Trigger / process an Imba.Event.

	*/

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
	
	window.addEventListener('hashchange',Imba.commit);
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
	
	window.removeEventListener('hashchange',Imba.commit);
	return this;
};


/***/ }),
/* 15 */
/***/ (function(module, exports, __webpack_require__) {

function iter$(a){ return a ? (a.toArray ? a.toArray() : a) : []; };
// externs;

var Imba = __webpack_require__(1);

function removeNested(root,node,caret){
	// if node/nodes isa String
	// 	we need to use the caret to remove elements
	// 	for now we will simply not support this
	if (node instanceof Array) {
		for (let i = 0, items = iter$(node), len = items.length; i < len; i++) {
			removeNested(root,items[i],caret);
		};
	} else if (node && node._dom) {
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

function appendNested(root,node){
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


// insert nodes before a certain node
// does not need to return any tail, as before
// will still be correct there
// before must be an actual domnode
function insertNestedBefore(root,node,before){
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

// after must be an actual domnode
function insertNestedAfter(root,node,after){
	var before = after ? after.nextSibling : root._dom.firstChild;
	
	if (before) {
		insertNestedBefore(root,node,before);
		return before.previousSibling;
	} else {
		appendNested(root,node);
		return root._dom.lastChild;
	};
};

function reconcileCollectionChanges(root,new$,old,caret){
	
	var newLen = new$.length;
	var lastNew = new$[newLen - 1];
	
	// This re-order algorithm is based on the following principle:
	// 
	// We build a "chain" which shows which items are already sorted.
	// If we're going from [1, 2, 3] -> [2, 1, 3], the tree looks like:
	//
	// 	3 ->  0 (idx)
	// 	2 -> -1 (idx)
	// 	1 -> -1 (idx)
	//
	// This tells us that we have two chains of ordered items:
	// 
	// 	(1, 3) and (2)
	// 
	// The optimal re-ordering then becomes to keep the longest chain intact,
	// and move all the other items.
	
	var newPosition = [];
	
	// The tree/graph itself
	var prevChain = [];
	// The length of the chain
	var lengthChain = [];
	
	// Keep track of the longest chain
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
		
		// Build the chain:
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
	
	// Now we can walk the longest chain backwards and mark them as "sticky",
	// which implies that they should not be moved
	var cursor = newPosition.length - 1;
	while (cursor >= 0){
		if (cursor == maxChainEnd && newPosition[cursor] != -1) {
			stickyNodes[newPosition[cursor]] = true;
			maxChainEnd = prevChain[maxChainEnd];
		};
		
		cursor -= 1;
	};
	
	// possible to do this in reversed order instead?
	for (let idx = 0, items = iter$(new$), len = items.length, node; idx < len; idx++) {
		node = items[idx];
		if (!stickyNodes[idx]) {
			// create textnode for string, and update the array
			if (!(node && node._dom)) {
				node = new$[idx] = Imba.createTextNode(node);
			};
			
			var after = new$[idx - 1];
			insertNestedAfter(root,node,(after && after._dom || after || caret));
		};
		
		caret = node._dom || (caret && caret.nextSibling || root._dom.firstChild);
	};
	
	// should trust that the last item in new list is the caret
	return lastNew && lastNew._dom || caret;
};


// expects a flat non-sparse array of nodes in both new and old, always
function reconcileCollection(root,new$,old,caret){
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
		return last && last._dom || last || caret;
	} else {
		return reconcileCollectionChanges(root,new$,old,caret);
	};
};

// TYPE 5 - we know that we are dealing with a single array of
// keyed tags - and root has no other children
function reconcileLoop(root,new$,old,caret){
	var nl = new$.length;
	var ol = old.length;
	var cl = new$.cache.i$; // cache-length
	var i = 0,d = nl - ol;
	
	// find the first index that is different
	while (i < ol && i < nl && new$[i] === old[i]){
		i++;
	};
	
	// conditionally prune cache
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
			// console.log "added in chunk",i,i1
			let before = old[i]._dom;
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

// expects a flat non-sparse array of nodes in both new and old, always
function reconcileIndexedArray(root,array,old,caret){
	var newLen = array.taglen;
	var prevLen = array.domlen || 0;
	var last = newLen ? array[newLen - 1] : null;
	// console.log "reconcile optimized array(!)",caret,newLen,prevLen,array
	
	if (prevLen > newLen) {
		while (prevLen > newLen){
			var item = array[--prevLen];
			root.removeChild(item._dom);
		};
	} else if (newLen > prevLen) {
		// find the item to insert before
		let prevLast = prevLen ? array[prevLen - 1]._dom : caret;
		let before = prevLast ? prevLast.nextSibling : root._dom.firstChild;
		
		while (prevLen < newLen){
			let node = array[prevLen++];
			before ? root.insertBefore(node._dom,before) : root.appendChild(node._dom);
		};
	};
	
	array.domlen = newLen;
	return last ? last._dom : caret;
};


// the general reconciler that respects conditions etc
// caret is the current node we want to insert things after
function reconcileNested(root,new$,old,caret){
	
	// var skipnew = new == null or new === false or new === true
	var newIsNull = new$ == null || new$ === false;
	var oldIsNull = old == null || old === false;
	
	
	if (new$ === old) {
		// remember that the caret must be an actual dom element
		// we should instead move the actual caret? - trust
		if (newIsNull) {
			return caret;
		} else if (new$._dom) {
			return new$._dom;
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
				
				// if they are not the same we continue through to the default
			} else {
				// Could use optimized loop if we know that it only consists of nodes
				return reconcileCollection(root,new$,old,caret);
			};
		} else if (!oldIsNull) {
			if (old._dom) {
				root.removeChild(old);
			} else {
				// old was a string-like object?
				root.removeChild(caret ? caret.nextSibling : root._dom.firstChild);
			};
		};
		
		return insertNestedAfter(root,new$,caret);
		// remove old
	} else if (!newIsNull && new$._dom) {
		if (!oldIsNull) { removeNested(root,old,caret) };
		return insertNestedAfter(root,new$,caret);
	} else if (newIsNull) {
		if (!oldIsNull) { removeNested(root,old,caret) };
		return caret;
	} else {
		// if old did not exist we need to add a new directly
		let nextNode;
		// if old was array or imbatag we need to remove it and then add
		if (old instanceof Array) {
			removeNested(root,old,caret);
		} else if (old && old._dom) {
			root.removeChild(old);
		} else if (!oldIsNull) {
			// ...
			nextNode = caret ? caret.nextSibling : root._dom.firstChild;
			if ((nextNode instanceof Text) && nextNode.textContent != new$) {
				nextNode.textContent = new$;
				return nextNode;
			};
		};
		
		// now add the textnode
		return insertNestedAfter(root,new$,caret);
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
		
		if (new$ === old && new$ && new$.taglen == undefined) {
			return this;
		};
		
		if (!old && typ != 3) {
			this.empty();
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
			
			if (new$ && new$._dom) {
				this.empty();
				this.appendChild(new$);
			} else if (new$ instanceof Array) {
				if (new$._type == 5 && old && old._type == 5) {
					reconcileLoop(this,new$,old,null);
				} else if (old instanceof Array) {
					reconcileNested(this,new$,old,null);
				} else {
					this.empty();
					appendNested(this,new$);
				};
			} else {
				this.setText(new$);
				return this;
			};
		} else if (typ == 4) {
			reconcileIndexedArray(this,new$,old,null);
		} else if (typ == 5) {
			reconcileLoop(this,new$,old,null);
		} else if ((new$ instanceof Array) && (old instanceof Array)) {
			reconcileNested(this,new$,old,null);
		} else {
			// what if text?
			this.empty();
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

// if $web$
// optimization for setText
var proto = Imba.Tag.prototype;
var apple = typeof navigator != 'undefined' && (navigator.vendor || '').indexOf('Apple') == 0;
if (apple) {
	proto.setText = function (text){
		if (text != this._tree_) {
			this._dom.textContent = ((text === null || text === false) ? '' : text);
			this._tree_ = text;
		};
		return this;
		// optimization
	};
};


/***/ }),
/* 16 */
/***/ (function(module, exports, __webpack_require__) {

function iter$(a){ return a ? (a.toArray ? a.toArray() : a) : []; };
var Imba = __webpack_require__(0);

var TERMINAL_COLOR_CODES = {
	bold: 1,
	underline: 4,
	reverse: 7,
	black: 30,
	red: 31,
	green: 32,
	yellow: 33,
	blue: 34,
	magenta: 35,
	cyan: 36,
	white: 37
};

function fmt(code,string){
	if (console.group) { return string.toString() };
	code = TERMINAL_COLOR_CODES[code];
	var resetStr = "\x1B[0m";
	var resetRegex = /\x1B\[0m/g;
	var codeRegex = /\x1B\[\d+m/g;
	var tagRegex = /(<\w+>|<A\d+>)|(<\/\w+>|<A\d+>)/i;
	var numRegex = /\d+/;
	var str = ('' + string).replace(resetRegex,("" + resetStr + "\x1B[" + code + "m")); // allow nesting
	str = ("\x1B[" + code + "m" + str + resetStr);
	return str;
};

function Spec(){
	this._blocks = [];
	this._assertions = [];
	this._stack = [this._context = this];
	this;
};

window.Spec = Spec; // global class 
Spec.prototype.blocks = function(v){ return this._blocks; }
Spec.prototype.setBlocks = function(v){ this._blocks = v; return this; };
Spec.prototype.context = function(v){ return this._context; }
Spec.prototype.setContext = function(v){ this._context = v; return this; };
Spec.prototype.stack = function(v){ return this._stack; }
Spec.prototype.setStack = function(v){ this._stack = v; return this; };
Spec.prototype.assertions = function(v){ return this._assertions; }
Spec.prototype.setAssertions = function(v){ this._assertions = v; return this; };

Spec.prototype.fullName = function (){
	return "";
};

Spec.prototype.eval = function (block,ctx){
	var self = this;
	self._stack.push(self._context = ctx);
	var res = block();
	var after = function() {
		self._stack.pop();
		self._context = self._stack[self._stack.length - 1];
		return self;
	};
	
	if (res && res.then) {
		return res.then(after,after);
	} else {
		after();
		return Promise.resolve(self);
	};
};

Spec.prototype.describe = function (name,blk){
	if (this._context == this) {
		return this._blocks.push(new SpecGroup(name,blk,this));
	} else {
		return this._context.describe(name,blk);
	};
};

Spec.prototype.run = function (i,blk){
	var self = this;
	if(blk==undefined && typeof i == 'function') blk = i,i = 0;
	if(i==undefined) i = 0;
	if (blk) { Imba.once(self,'done',blk) };
	Spec.CURRENT = self;
	var block = self._blocks[i];
	
	// we need the notifications
	if (!block) { return self.finish() };
	Imba.once(block,'done',function() { return self.run(i + 1); });
	return block.run();
};


Spec.prototype.finish = function (){
	console.log("\n");
	
	var ok = [];
	var failed = [];
	
	for (let i = 0, items = iter$(this.assertions()), len = items.length, test; i < len; i++) {
		test = items[i];
		test.success() ? ok.push(test) : failed.push(test);
	};
	
	var logs = [
		fmt('green',("" + (ok.length) + " OK")),
		fmt('red',("" + (failed.length) + " FAILED")),
		("" + (this.assertions().length) + " TOTAL")
	];
	
	console.log(logs.join(" | "));
	
	for (let i = 0, len = failed.length, item; i < len; i++) {
		item = failed[i];
		console.log(item.fullName());
		console.log("    " + item.details());
	};
	
	var exitCode = ((failed.length == 0) ? 0 : 1);
	
	return Imba.emit(this,'done',[exitCode]);
};

// def describe name, blk do SPEC.context.describe(name,blk)
Spec.prototype.it = function (name,blk){
	return SPEC.context().it(name,blk);
};
Spec.prototype.test = function (name,blk){
	return SPEC.context().it(name,blk);
};
Spec.prototype.eq = function (actual,expected,format){
	return SPEC.context().eq(actual,expected,format);
};
Spec.prototype.match = function (actual,expected,format){
	return SPEC.context().match(actual,expected,format);
};
Spec.prototype.ok = function (actual,msg){
	return SPEC.context().assertion(new SpecAssertTruthy(SPEC.context(),actual,msg));
};
Spec.prototype.assert = function (expression){
	return SPEC.context().assert(expression);
};
Spec.prototype.await = function (){
	var context_;
	return (context_ = SPEC.context()).await.apply(context_,arguments);
};


function SpecCaller(scope,method,args){
	this._scope = scope;
	this._method = method;
	this._args = args;
};

window.SpecCaller = SpecCaller; // global class 
SpecCaller.prototype.run = function (){
	return (this._value == null) ? (this._value = this._scope[this._method].apply(this._scope,this._args)) : this._value;
};

function SpecGroup(name,blk,parent){
	this._parent = parent;
	this._name = name;
	this._blocks = [];
	if (blk) { SPEC.eval(blk,this) };
	this;
};

window.SpecGroup = SpecGroup; // global class 
SpecGroup.prototype.fullName = function (){
	return ("" + (this._parent.fullName()) + (this._name) + " > ");
};

SpecGroup.prototype.blocks = function (){
	return this._blocks;
};

SpecGroup.prototype.describe = function (name,blk){
	return this._blocks.push(new SpecGroup(name,blk,this));
};

SpecGroup.prototype.it = function (name,blk){
	return this._blocks.push(new SpecExample(name,blk,this));
};

SpecGroup.prototype.emit = function (ev,pars){
	return Imba.emit(this,ev,pars);
};

SpecGroup.prototype.run = function (i){
	var self = this;
	if(i === undefined) i = 0;
	if (i == 0) self.start();
	var block = self._blocks[i];
	if (!block) { return self.finish() };
	Imba.once(block,'done',function() { return self.run(i + 1); });
	// block.once :done do run(i+1)
	return block.run();
};

SpecGroup.prototype.start = function (){
	this.emit('start',[this]);
	
	if (console.group) {
		return console.group(this._name);
	} else {
		return console.log(("\n-------- " + (this._name) + " --------"));
	};
};


SpecGroup.prototype.finish = function (){
	if (console.groupEnd) { console.groupEnd() };
	return this.emit('done',[this]);
};


function SpecExample(name,block,parent){
	this._parent = parent;
	this._evaluated = false;
	this._name = name;
	this._block = block;
	this._assertions = [];
	this;
};

window.SpecExample = SpecExample; // global class 
SpecExample.prototype.fullName = function (){
	return ("" + (this._parent.fullName()) + (this._name));
};

SpecExample.prototype.emit = function (ev,pars){
	return Imba.emit(this,ev,pars);
};

SpecExample.prototype.await = function (){
	return this.assertion(new SpecAwait(this,arguments)).callback();
};

SpecExample.prototype.eq = function (actual,expected,format){
	if(format === undefined) format = null;
	return this.assertion(new SpecAssert(this,actual,expected,format));
};

SpecExample.prototype.assert = function (expression){
	return this.assertion(new SpecAssert(this,expression));
};

SpecExample.prototype.assertion = function (ass){
	var self = this;
	self._assertions.push(ass);
	Imba.once(ass,'done',function() {
		if (self._evaluated && self._assertions.every(function(a) { return a.done(); })) { return self.finish() };
	});
	return ass;
};

SpecExample.prototype.run = function (){
	var self = this;
	var promise = (self._block ? SPEC.eval(self._block,self) : Promise.resolve({}));
	return promise.then(function() {
		self._evaluated = true;
		if (self._assertions.every(function(a) { return a.done(); })) { return self.finish() };
	});
};

SpecExample.prototype.finish = function (){
	var details = [];
	var dots = this._assertions.map(function(v,i) {
		Spec.CURRENT.assertions().push(v);
		if (v.success()) {
			return fmt('green',"✔");
		} else {
			details.push((" - " + (v.details())));
			return fmt('red',"✘");
		};
	});
	
	var str = ("" + (this._name) + " " + dots.join(" "));
	console.log(str);
	if (details.length > 0) { console.log(details.join("\n")) };
	return this.emit('done',[this]);
};

function SpecObject(){ };

window.SpecObject = SpecObject; // global class 
SpecObject.prototype.ok = function (actual,message){
	return SPEC.ok(actual,message);
};

function SpecCondition(example){
	this._example = example;
	this;
};


window.SpecCondition = SpecCondition; // global class 
SpecCondition.prototype.success = function(v){ return this._success; }
SpecCondition.prototype.setSuccess = function(v){ this._success = v; return this; };

SpecCondition.prototype.fullName = function (){
	return this._example.fullName();
};

SpecCondition.prototype.state = function (){
	return true;
};

SpecCondition.prototype.failed = function (){
	this._done = true;
	this._success = false;
	this.emit('done',[false]);
	// process:stdout.write(fmt(:red,"✘"))
	return true;
};

SpecCondition.prototype.passed = function (){
	this._done = true;
	this._success = true;
	this.emit('done',[true]);
	// process:stdout.write(fmt(:green,"✔"))
	return true;
};

SpecCondition.prototype.emit = function (ev,pars){
	return Imba.emit(this,ev,pars);
};

SpecCondition.prototype.done = function (){
	return this._done;
};

SpecCondition.prototype.details = function (){
	return "error?";
};

function SpecAwait(example,args){
	var self = this;
	self._example = example;
	self._args = args;
	
	// TODO extract options
	// TODO extract times the method should be called
	
	self._timeout = Imba.delay(100,function() { return self.failed(); });
	
	self._callback = function() {
		var $0 = arguments, i = $0.length;
		var args = new Array(i>0 ? i : 0);
		while(i>0) args[i-1] = $0[--i];
		Imba.clearTimeout(self._timeout);
		return args.equals(self._args[0]) ? self.passed() : self.failed();
	};
	
	self;
};

Imba.subclass(SpecAwait,SpecCondition);
window.SpecAwait = SpecAwait; // global class 
SpecAwait.prototype.callback = function (){
	return this._callback;
};

function SpecAssert(example,actual,expected,format){
	if(format === undefined) format = null;
	this._example = example;
	this._actual = actual;
	this._expected = expected;
	this._format = format;
	if (expected instanceof Array) {
		this._format || (this._format = String);
	};
	this.run();
	this;
};

Imba.subclass(SpecAssert,SpecCondition);
window.SpecAssert = SpecAssert; // global class 
SpecAssert.prototype.run = function (){
	var value = (this._actual instanceof SpecCaller) ? this._actual.run() : this._actual;
	return this.test(this._value = value);
};

SpecAssert.prototype.test = function (value){
	if (value && value.equals) {
		return value.equals(this.expected()) ? this.passed() : this.failed();
	} else if (this._format) {
		this._left = this._format(value);
		this._right = this._format(this._expected);
		return (this._left == this._right) ? this.passed() : this.failed();
	} else {
		return (value == this._expected) ? this.passed() : this.failed();
	};
};

SpecAssert.prototype.failed = function (){
	if (console.group) {
		console.error("expected",this._expected,"got",this._actual,this);
	};
	return SpecAssert.__super__.failed.call(this);
};

SpecAssert.prototype.details = function (){
	if (!this._success) {
		if (this._format) {
			return fmt('red',("expected " + (this._right) + " got " + (this._left)));
		} else {
			return fmt('red',("expected " + (this._expected) + " got " + (this._value)));
		};
	} else {
		return "passed test";
	};
};

function SpecAssertTruthy(example,value,message){
	this._example = example;
	this._actual = value;
	this._message = message;
	this.run();
};

Imba.subclass(SpecAssertTruthy,SpecAssert);
window.SpecAssertTruthy = SpecAssertTruthy; // global class 
SpecAssertTruthy.prototype.test = function (value){
	return (!(!(value))) ? this.passed() : this.failed();
};

SpecAssertTruthy.prototype.failed = function (){
	if (console.group) {
		console.error("failed",this._message,this);
	};
	return SpecAssertTruthy.__super__.failed.call(this);
};

SpecAssertTruthy.prototype.details = function (){
	if (!this._success) {
		return fmt('red',("assertion failed: " + (this._message)));
	} else {
		return "passed test";
	};
};

function SpecAssertFalsy(example,value){
	this._example = example;
	this._actual = value;
	this.run();
};

Imba.subclass(SpecAssertFalsy,SpecAssert);
window.SpecAssertFalsy = SpecAssertFalsy; // global class 
SpecAssertFalsy.prototype.test = function (value){
	return (!(value)) ? this.passed() : this.failed();
};


SPEC = new Spec();

// global def p do console.log(*arguments)
describe = function describe(name,blk){
	return SPEC.context().describe(name,blk);
};
it = function it(name,blk){
	return SPEC.context().it(name,blk);
};
test = function test(name,blk){
	return SPEC.context().it(name,blk);
};
eq = function eq(actual,expected,format){
	return SPEC.context().eq(actual,expected,format);
};
match = function match(actual,expected,format){
	return SPEC.context().match(actual,expected,format);
};
ok = function ok(actual,message){
	return SPEC.context().assertion(new SpecAssertTruthy(SPEC.context(),actual,message));
};
assert = function assert(expression){
	return SPEC.context().assert(expression);
};
await = function await(){
	var context_;
	return (context_ = SPEC.context()).await.apply(context_,arguments);
};




/***/ }),
/* 17 */
/***/ (function(module, exports) {

function iter$(a){ return a ? (a.toArray ? a.toArray() : a) : []; };
// externs;

function SyntaxLoopsObj(){ };

SyntaxLoopsObj.prototype.value = function(v){ return this._value; }
SyntaxLoopsObj.prototype.setValue = function(v){ this._value = v; return this; };

function IterableObject(){
	this;
};

IterableObject.prototype.toArray = function (){
	return [1,2,3,4,5];
};


describe('Syntax - Loops',function() {
	var ary = [1,2,3,4,5];
	var ary2 = [2,4,6,8,10];
	var dict = {a: 2,b: 4,c: 6,d: 8};
	var dict2 = Object.create(dict);
	dict2.e = 10;
	
	var obj = new SyntaxLoopsObj();
	
	describe("For In",function() {
		
		test("issue with shadowing items var",function() {
			var ret = [];
			function iterate(items){
				items;
				let res = [];
				for (let i = 0, array = iter$(items), len = array.length; i < len; i++) {
					res.push(ret.push(array[i]));
				};
				return res;
			};
			
			return eq([1,2,3],iterate([1,2,3]));
		});
		
		
		test("scoped let",function() {
			return new Promise(function(resolve) {
				var res = [];
				for (let i = 0, len = ary.length, item; i < len; i++) {
					item = ary[i];
					setTimeout(function() {
						res.push(item);
						if (res.length == ary.length) {
							eq(res,[1,2,3,4,5]);
							return resolve(true);
						};
					},1);
				};
				
				return true;
			});
		});
		
		test("quirks",function() {
			var i = 10;
			var a = [1,2,3];
			var sum = 0;
			
			// i should be local here - or at least be reset
			for (let i = 0, len = a.length; i < len; i++) {
				sum += i;
			};
			
			return eq(sum,0 + 1 + 2);
		});
		
		test("redefining var inside",function() {
			
			var breaks = [1,2,3];
			for (let i = 0, len = breaks.length, x; i < len; i++) {
				x = breaks[i];
				x = 0;
				eq(x,0);
			};
			
			eq(breaks,[1,2,3]);
			
			return;
		});
		
		
		test("basic assignment",function() {
			var o = 0,l = 0,i = 0,len = 0;
			let res = [];
			for (let j = 0, len_ = ary.length; j < len_; j++) {
				res.push(ary[j] + 1);
			};
			var rets = res;
			eq(rets,[2,3,4,5,6],String);
			return eq(o + l + i + len,0);
		});
		
		test("guarded",function() {
			var items = [1,2,3,4];
			
			let res = [];
			for (let i = 0, len = items.length, v; i < len; i++) {
				v = items[i];
				if (!(v % 2)) { continue; };
				res.push(v);
			};
			var ret = res;
			return eq(ret,[1,3]);
		});
		
		test("forin with conditional assign",function() {
			var value_, $1;
			var ret;
			
			obj.setValue(1);
			
			if (!(value_ = obj.value())) { let res = [];
			for (let i = 0, len = ary.length; i < len; i++) {
				res.push(ary[i] + 1);
			};
			ret = (obj.setValue(res),res); } else {
				ret = value_
			};
			
			eq(ret,1,String);
			
			if ($1 = obj.value()) { let res1 = [];
			for (let i = 0, len = ary.length; i < len; i++) {
				res1.push(ary[i] * 1);
			};
			ret = (obj.setValue(res1),res1); } else {
				ret = $1
			};
			
			eq(ret,obj.value(),String);
			return eq(obj.value(),ary,String);
		});
		
		test("inside statement",function() {
			var value_;
			obj.setValue(null);
			if ((value_ = obj.value()) == null) { if (1) {
				let res = [];
				for (let i = 0, len = ary.length; i < len; i++) {
					res.push(ary[i] * 2);
				};
				var ret = (obj.setValue(res),res);
			} } else {
				ret = value_
			};
			
			eq(ret,ary2,String);
			return eq(obj.value(),ary2,String);
		});
		
		test("custom iterable objects",function() {
			var item = new IterableObject();
			let res1 = [];
			for (let i = 0, items = iter$(item), len = items.length; i < len; i++) {
				res1.push(items[i] * 2);
			};
			var res = res1;
			return eq(res,[2,4,6,8,10]);
		});
		
		test("forin by",function() {
			var ary = [1,2,3,4,5,6];
			let res1 = [];
			for (let i = 0, len = ary.length; i < len; i = i + 2) {
				res1.push(ary[i]);
			};
			var res = res1;
			return eq(res,[1,3,5]);
		});
		
		return test("variable collisions",function() {
			
			var res = [];
			for (let a = 0; a <= 2; a++) {
				var len = 10;
				res.push(a);
			};
			
			eq(res.length,3);
			
			function hello(){
				var res;
				var ary = [1,2,3];
				let res1 = [];
				for (let i = 0, len_ = ary.length; i < len_; i++) {
					res1.push((res = ary[i] * 2));
				};
				return res1;
			};
			
			eq(hello(),[2,4,6]);
			return;
		});
	});
	
	describe("For In with ranges",function() {
		
		test("statement",function() {
			var ary = [];
			for (let i = 0; i <= 3; i++) {
				ary.push(i);
			};
			return eq(ary,[0,1,2,3]);
		});
		
		test("expression",function() {
			let res = [];
			for (let i = 0; i <= 3; i++) {
				res.push(i * 2);
			};
			var a = res;
			eq(a,[0,2,4,6]);
			
			let res1 = [];
			for (let i = 0; i < 3; i++) {
				res1.push(i * 2);
			};
			a = res1;
			return eq(a,[0,2,4]);
		});
		
		test("dynamic",function() {
			var a = 10;
			var b = 15;
			
			let res1 = [];
			for (let len = b, i = a, rd = len - i; (rd > 0) ? (i <= len) : (i >= len); (rd > 0) ? (i++) : (i--)) {
				res1.push(i);
			};
			var res = res1;
			
			return eq(res,[10,11,12,13,14,15]);
		});
		
		test("with index",function() {
			var a = 10;
			var b = 15;
			
			let res1 = [];
			for (let len = b, val = a, idx = 0, rd = len - val; (rd > 0) ? (val <= len) : (val >= len); (rd > 0) ? (val++) : (val--),idx++) {
				res1.push(idx);
			};
			var res = res1;
			
			return eq(res,[0,1,2,3,4,5]);
		});
		
		return test("negative",function() {
			var a = 15;
			var b = 10;
			
			var res = [];
			for (let len = b, val = a, idx = 0, rd = len - val; (rd > 0) ? (val <= len) : (val >= len); (rd > 0) ? (val++) : (val--),idx++) {
				res.push(val,idx);
			};
			
			return eq(res,[15,0,14,1,13,2,12,3,11,4,10,5]);
		});
	});
	
	
	
	describe("For Of",function() {
		
		test("dont override value",function() {
			var obj = {a: 1,b: 2};
			for (let v, i = 0, keys = Object.keys(obj), l = keys.length, k; i < l; i++){
				k = keys[i];v = obj[k];v = 3;
			};
			
			eq(obj.a,1);
			return eq(obj.b,2);
		});
		
		test("all keys assignment",function() {
			var o = 0;
			var l = 0;
			var len = 0;
			
			let res = [];
			for (let k in dict){
				let v;
				v = dict[k];res.push(k);
			};
			var keys = res;
			eq(keys,['a','b','c','d'],String);
			
			let res1 = [];
			for (let k in dict){
				let v;
				v = dict[k];res1.push(v);
			};
			var vals = res1;
			eq(vals,[2,4,6,8]);
			
			// The order of the keys are based on assignment-order,
			// prototype-keys always come at the end (as if they were assigned
			// after all other keys=
			let res2 = [];
			for (let k in dict2){
				let v;
				v = dict2[k];res2.push(k);
			};
			keys = res2;
			eq(keys,['e','a','b','c','d']);
			
			eq(o,0);
			eq(l,0);
			return eq(len,0);
		});
		
		test("for own of",function() {
			let res = [];
			for (let v, i = 0, keys1 = Object.keys(dict), l1 = keys1.length, k; i < l1; i++){
				k = keys1[i];v = dict[k];res.push(k);
			};
			var keys = res;
			eq(keys,['a','b','c','d'],String);
			
			let res1 = [];
			for (let v, i = 0, keys1 = Object.keys(dict2), l1 = keys1.length, k; i < l1; i++){
				k = keys1[i];v = dict2[k];res1.push(k);
			};
			keys = res1;
			let res2 = [];
			for (let val, i = 0, keys1 = Object.keys(dict2), l1 = keys1.length, k; i < l1; i++){
				k = keys1[i];val = dict2[k];res2.push(val);
			};
			var vals = res2;
			eq(keys,['e']);
			eq(vals,[10]);
			
			var l = 0;
			var len = 0;
			
			function d(){
				return {obj: {a: 1,b: 2,c: 3}};
			};
			
			function m(o){
				for (let o1 = d().obj, v, i = 0, keys1 = Object.keys(o1), l1 = keys1.length, k; i < l1; i++){
					k = keys1[i];v = o1[k];o.push(k,v);
				};
				return;
			};
			
			var v = [];
			m(v);
			return eq(v,['a',1,'b',2,'c',3]);
		});
		
		test("for of",function() {
			
			var x_;
			var items = {x: {a: 1,b: 2,c: 3}};
			var out = [];
			for (let k in x_ = items.x){
				let v;
				v = x_[k];out.push(k,v);
			};
			return eq(out,['a',1,'b',2,'c',3]);
		});
		
		return test("for own of global bug",function() {
			
			var obj = {a: 1,b: 2};
			function hello(){
				let res = [];
				for (let v, i = 0, keys = Object.keys(obj), l = keys.length, forOfKeyVar; i < l; i++){
					forOfKeyVar = keys[i];v = obj[forOfKeyVar];forOfKeyVar;
					forOfKeyVar;
					res.push(forOfKeyVar);
				};
				return res;
			};
			hello();
			return ok(typeof forOfKeyVar === 'undefined');
		});
	});
	
	
	test("implicit return from assignment",function() {
		var c = 1;
		var f = function() { return c ? true : false; };
		return eq(f(),true);
	});
	
	test("while",function() {
		var a = [];
		while (a.length < 5){
			a.push(a.length);
		};
		eq(a,[0,1,2,3,4]);
		
		a = [];
		while (a.length < 5){
			a.push(a.length);
		};
		return eq(a,[0,1,2,3,4]);
	});
	
	test("nested loops",function() {
		var res = [];
		var people = [{name: 'John',meta: {a: 1}},{name: 'Jane',meta: {b: 2}}];
		
		for (let i = 0, len = people.length, person; i < len; i++) {
			person = people[i];
			var name = person.name;
			
			for (let o = person.meta, v, j = 0, keys = Object.keys(o), l = keys.length, k; j < l; j++){
				k = keys[j];v = o[k];res.push(k);
			};
		};
		
		eq(res,['a','b']);
		return;
	});
	
	test("#72: self reference in for-in-expression",function() {
		function A(){
			this._v = 1;
		};
		
		A.prototype.map = function (){
			var self = this;
			return ((function() {
				let res = [];
				for (let i = 0, items = [1,2,3], len = items.length; i < len; i++) {
					res.push(items[i] * self._v);
				};
				return res;
			})()).join("-");
		};
		
		return eq(new A().map(),"1-2-3");
	});
	
	test("issue with multi-let",function() {
		var array;
		var items = ["12","22","32"];
		let res1 = [];
		for (let i = 0, len = items.length; i < len; i++) {
			var array = iter$(items[i].split(''));var a = array[0],b = array[1];
			res1.push(b + a);
		};
		var res = res1;
		
		return eq(res.join(''),"212223");
	});
	
	
	return describe("Loop",function() {
		
		return it("should work",function() {
			var a = 0;
			var b = 0;
			while (true){
				a++;
				if (b == 0) { break; };
			};
			
			return eq(a,1);
		});
	});
});




/***/ }),
/* 18 */
/***/ (function(module, exports, __webpack_require__) {

var Imba = __webpack_require__(0);
// externs;

function Organism(){
	this._ivar = 1;
};

var lvar = 10;

Organism.type = function (){
	return 'organism';
};

Organism.prototype.lineage = function (){
	return 'organism';
};

Organism.prototype.name = function (){
	return 'organism';
};

Organism.prototype.speak = function (){
	return 'ghaarg';
};

Organism.prototype.alive = function (){
	return true;
};

Organism.prototype.lvar = function (){
	return lvar;
};

// hmm, maybe we shouldnt allow this?
//	class Other
//
//		def inner
//			yes
;

function Virus(){
	this._ivar = 2;
};

Imba.subclass(Virus,Organism);
Virus.prototype.lineage = function (){
	return ("" + this.name() + "." + (Virus.__super__.lineage.call(this)));
};

Virus.prototype.name = function (){
	return 'virus';
};

function Animal(){ return Organism.apply(this,arguments) };

Imba.subclass(Animal,Organism);
Animal.prototype.lineage = function (){
	return ("animal." + (Animal.__super__.lineage.call(this)));
};

function Cat(){ return Animal.apply(this,arguments) };

Imba.subclass(Cat,Animal);
Cat.prototype.lineage = function (){
	return ("cat." + (Cat.__super__.lineage.call(this)));
};

Cat.prototype.speak = function (){
	return 'miau';
};

function Dog(){ return Animal.apply(this,arguments) };

Imba.subclass(Dog,Animal);
Dog.prototype.lineage = function (){
	return ("dog." + (Dog.__super__.lineage.call(this)));
};

Dog.prototype.speak = function (){
	return 'woff';
};


function Human(){ return Animal.apply(this,arguments) };

Imba.subclass(Human,Animal);
Human.prototype.lineage = function (){
	return ("human." + (Human.__super__.lineage.call(this)));
};

Human.prototype.speak = function (){
	return 'hello';
};

function Zombie(){ return Human.apply(this,arguments) };

Imba.subclass(Zombie,Human);
Zombie.prototype.lineage = function (){
	return ("zombie." + (Zombie.__super__.lineage.call(this)));
};

Zombie.prototype.alive = function (){
	return false;
};


describe('Syntax - Class',function() {
	
	// test 'nested classes work' do
	// 	ok !!Organism.Other
	
	test('should',function() {
		
		// you can define variables local to classbody
		var obj = new Organism();
		return eq(obj.lvar(),10);
	});
	
	describe('Methods',function() {
		
		it('should define class methods',function() {
			return eq(Organism.type(),'organism');
		});
		
		return it('should inherit class methods',function() {
			return eq(Virus.type,Organism.type);
		});
		
		// it 'should call super in class methods' do
		//   eq Dog.type, "dog.animal.organism"
		//   eq Cat.type, "cat.animal.organism"
	});
	
	describe('Instance',function() {
		
		it('should call the parent constructor by default',function() {
			var obj = new Cat();
			return eq(obj._ivar,1);
		});
		
		it('should define instance methods',function() {
			var obj = new Organism();
			var val = obj.alive();
			// eq val, true
			ok(obj.alive());
			return eq(obj.speak(),'ghaarg');
		});
		
		it('should inherit instance methods',function() {
			var obj = new Virus();
			return ok(obj.alive());
		});
		
		
		it('should override instance methods',function() {
			eq(new Organism().name(),'organism');
			return eq(new Virus().name(),'virus');
		});
		
		return it('should call super in instance methods',function() {
			// Should not refer to the prototype directly?
			eq(new Virus().lineage(),'virus.organism');
			return eq(new Zombie().lineage(),'zombie.human.animal.organism');
		});
	});
	
	test('define methods outside scope',function() {
		function Cls(){ };
		
		Cls.a = function (){
			return 1;
		};
		Cls.prototype.a = function (){
			return 2;
		};
		
		Cls.b = function (){
			return 1;
		};
		
		
			Cls.prototype.b = function (){
				return 2;
			};
		
		
		eq(Cls.a(),1);
		eq(Cls.b(),1);
		
		eq(new Cls().a(),2);
		return eq(new Cls().b(),2);
	});
	
	
	test('Scoping',function() {
		
		var variable = 1;
		
		function A(add){
			this._sum = variable1 + add;
			this;
		};
		
		var variable1 = 2;
		
		A.base = function (){
			return variable1;
		};
		
		A.add = function (add){
			return variable1 += add;
		};
		
		A.prototype.base = function (){
			return variable1;
		};
		
		A.prototype.sum = function (){
			return this._sum;
		};
		
		eq(variable,1);
		eq(A.base(),2);
		eq(new A().base(),2);
		eq(new A(5).sum(),7);
		
		A.add(2);
		
		eq(variable,1);
		return eq(A.base(),4);
	});
	
	return test('issue #71',function() {
		var res;
		function ping(cb){
			return res = cb();
		};
		
		function A(){ };
		
		ping(function() { return A; });
		
		return eq(res,A);
	});
});







/***/ }),
/* 19 */
/***/ (function(module, exports, __webpack_require__) {

var Imba = __webpack_require__(0);
// externs;

function Organism(){
	this.setGroup("organism");
};

Organism.prototype.alias = function(v){ return this._alias; }
Organism.prototype.setAlias = function(v){ this._alias = v; return this; };
Organism.prototype.group = function(v){ return this._group; }
Organism.prototype.setGroup = function(v){ this._group = v; return this; };

Organism.type = function (){
	return 'organism';
};

Organism.prototype.lineage = function (){
	return 'organism';
};
Organism.prototype.name = function (){
	return 'organism';
};
Organism.prototype.speak = function (){
	return 'ghaarg';
};
Organism.prototype.alive = function (){
	return true;
};

function Virus(){
	this._ivar = 2;
};

Imba.subclass(Virus,Organism);
Virus.prototype.lineage = function (){
	return ("" + this.name() + "." + (Virus.__super__.lineage.call(this)));
};

Virus.prototype.name = function (){
	return 'virus';
};

function Animal(){
	this.setGroup("animal");
};

Imba.subclass(Animal,Organism);
Animal.prototype.lineage = function (){
	// super should do the same as super.lineage(*arguments)
	return ("animal." + Animal.__super__.lineage.apply(this,arguments));
};

function Cat(){
	this.setGroup("cat");
};

Imba.subclass(Cat,Animal);
Cat.prototype.lineage = function (){
	return ("cat." + (Cat.__super__.lineage.call(this)));
};

Cat.prototype.speak = function (){
	return 'miau';
};

Cat.prototype.cloak = function (){
	// call the initialize of animal
	return Cat.__super__.initialize.call(this);
};


function Dog(){ return Animal.apply(this,arguments) };

Imba.subclass(Dog,Animal);
Dog.prototype.lineage = function (){
	return ("dog." + Dog.__super__.lineage.call(this));
};

Dog.prototype.speak = function (){
	return 'woff';
};

function FakeDog(){ return Dog.apply(this,arguments) };

Imba.subclass(FakeDog,Dog);
FakeDog.prototype.lineage = function (){
	("fakedog." + (FakeDog.__super__.__super__.lineage.apply(this,arguments)));
	return ("fakedog." + FakeDog.__super__.__super__.lineage.call(this));
};

function Human(){
	this._human = true;
};

Imba.subclass(Human,Animal);
Human.prototype.lineage = function (){
	return ("human." + (Human.__super__.lineage.call(this)));
};

Human.prototype.speak = function (){
	return 'hello';
};

function Zombie(){ return Human.apply(this,arguments) };

Imba.subclass(Zombie,Human);
Zombie.prototype.lineage = function (){
	return ("zombie." + Zombie.__super__.lineage.apply(this,arguments));
};

Zombie.prototype.alive = function (){
	return false;
};

Human.Child = function Child(){
	Human.Child.__super__.constructor.apply(this,arguments);
};
Imba.subclass(Human.Child,Human);





describe('Syntax - super',function() {
	
	return test("stuff",function() {
		
		var cat = new Cat();
		var virus = new Virus();
		var dog = new Dog();
		var fakedog = new FakeDog();
		var human = new Human();
		var zombie = new Zombie();
		
		eq(virus.lineage(),'virus.organism');
		eq(cat.lineage(),'cat.animal.organism');
		eq(dog.lineage(),'dog.animal.organism');
		eq(zombie.lineage(),'zombie.human.animal.organism');
		eq(fakedog.lineage(),'fakedog.animal.organism');
		
		eq(cat.group(),"cat");
		cat.cloak();
		return eq(cat.group(),"animal");
	});
});





/***/ }),
/* 20 */
/***/ (function(module, exports, __webpack_require__) {

function intersect$(a,b){
	if(a && a.__intersect) return a.__intersect(b);
	var res = [];
	for(var i=0, l=a.length; i<l; i++) {
		var v = a[i];
		if(b.indexOf(v) != -1) res.push(v);
	}
	return res;
};

function union$(a,b){
	if(a && a.__union) return a.__union(b);

	var u = a.slice(0);
	for(var i=0,l=b.length;i<l;i++) if(u.indexOf(b[i]) == -1) u.push(b[i]);
	return u;
};

var Imba = __webpack_require__(0);
// externs;

function Cache(val){
	this._gets = 0;
	this._value = val;
};

Cache.prototype.gets = function(v){ return this._gets; }
Cache.prototype.setGets = function(v){ this._gets = v; return this; };

Cache.prototype.value = function (){
	this._gets++;
	return this._value;
};

function Group(items){
	this._items = items;
};
Group.prototype.items = function(v){ return this._items; }
Group.prototype.setItems = function(v){ this._items = v; return this; };

Group.prototype.toString = function (){
	return this._items.toString();
};
Group.prototype.__union = function (other){
	return new Group(union$(this._items,other.items()));
};
Group.prototype.__intersect = function (other){
	return new Group(intersect$(this._items,other.items()));
};

// x if 3 > i > 0
// x unless 3 > i > 0
// should test if/unless inversions

describe('Syntax - Operators',function() {
	
	test("&&",function() {
		var a = 10 && 20;
		eq(a,20);
		
		var b = 10 && 20;
		return eq(b,20);
	});
	
	test("union and intersect",function() {
		
		// union regular arrays
		var a = [1,2,3,6];
		var b = [3,4,5,6];
		eq(union$(a,b),[1,2,3,6,4,5]);
		eq(intersect$(a,b),[3,6]);
		
		// union custom objects
		var ga = new Group([4,5,6]);
		var gb = new Group([5,6,7]);
		var gc = new Group([8,9]);
		var gd = (union$(ga,gb));
		
		ok(gd instanceof Group);
		eq(gd.items(),[4,5,6,7]);
		
		gd = intersect$(ga,gb);
		ok(gd instanceof Group);
		eq(gd.items(),[5,6]);
		
		eq((intersect$(gb,gc)).items(),[]);
		
		// precedence
		gd = union$(intersect$(ga,gb),gc); // precedence right
		// gd = ((ga ∩ gb) ∪ gc)
		eq(gd,[5,6,8,9]);
		
		gd = union$(intersect$(ga,gb),gc) && ga;
		// gd = ((ga ∩ gb) ∪ gc) && true
		return eq(gd,ga);
	});
	
	
	test("in",function() {
		var a = 5;
		var ary = [1,2,3,4,5];
		
		ok(Imba.indexOf(a,ary) >= 0);
		eq(Imba.indexOf(3,ary) >= 0,true);
		eq(Imba.indexOf(10,ary) >= 0,false);
		eq(Imba.indexOf(3,[1,2,3,4]) >= 0,true);
		eq(Imba.indexOf(6,[1,2,3,4]) >= 0,false);
		
		return ok(Imba.indexOf(6,ary) == -1);
	});
	
	
	test("comparison",function() {
		
		var $1, value_, $2;
		var a = 50;
		ok(100 > a && a > 10);
		eq(100 > ($1 = (a = 10)) && $1 > 10,false); // not elegant
		ok(100 > a && a < 50);
		
		var b = new Cache(10);
		ok(100 > (value_ = b.value()) && value_ > 2);
		ok(b.gets() == 1);
		
		ok(100 > ($2 = b.value()) && $2 < 30);
		return ok(b.gets() == 2);
	});
	
	// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Operator_Precedence
	test("precedence",function() {
		
		ok(10 + 10 * 2,30);
		ok((10 + 10) * 2,40);
		
		var a = 0;
		var b = 0;
		var c = 0;
		
		a = 10 + 20;
		eq(a,30);
		
		(a = 10) + 20;
		eq(a,10);
		b = 10 + (a = 5);
		eq(b,15);
		eq(a,5);
		
		a = 0;
		if (false) { a = 10 };
		return eq(a,0);
	});
	
	test("ternary",function() {
		var x = ( true) ? true : false;
		eq(x,true);
		
		x = ( true) ? false : true;
		eq(x,false);
		
		if (x = 2) {
			true;
		};
		
		return eq(x,2);
	});
	
	return test("?.",function() {
		var $1, $2, $3, none_, $4, ref_;
		function Obj(){ };
		
		Obj.prototype.meth = function (){
			return 10;
		};
		
		Obj.prototype.chain = function (){
			return this;
		};
		
		var o = new Obj();
		o.key = 1;
		o.ref = o;
		
		eq(($1 = o) && $1.meth  &&  $1.meth(),10);
		eq(($2 = o) && $2.key,1);
		eq(($3 = o) && $3.none  &&  $3.none(),null);
		eq((none_ = ($4 = o) && $4.none  &&  $4.none()) && none_.none  &&  none_.none(),null);
		return eq((ref_ = o.ref) && ref_.meth  &&  ref_.meth(),10);
	});
});




/***/ }),
/* 21 */
/***/ (function(module, exports) {

// externs;

describe("Syntax - Variables",function() {
	
	test("allow in expression",function() {
		
		function x(){
			if (true) {
				var a = 1;
				var b = 2;
				return 3;
			};
		};
		
		try {
			var res = x();
		} catch (e) {
			res = 0;
		};
		
		return eq(x(),3);
	});
	
	
	
	test("allow predeclaring variables",function() {
		var b;
		var a;
		b;
	});
	
	test("lookup let variables",function() {
		let Hello = 10;
		if (100 > 10) {
			let Hello = 20;
			return eq(Hello,20);
		};
	});
	
	test("allow predeclaring multiple variables",function() {
		var a = 1,b = 2,c = 3;
		var x,y,z;
		
		eq(a,1);
		eq(b,2);
		return eq(c,3);
	});
	
	
	return test("allow implicit returns from var declaration",function() {
		// var hey, ho
		
		var hey = 10 && 5;
		var blank = function() { return true; };
		
		var fn = function(a) {
			var z, b, res;
			blank(a,z = 10);
			if (b = a + 1) { var x = b * 2 };
			return res = x + 4;
		};
		
		return eq(fn(1),8);
	});
});


/***/ }),
/* 22 */
/***/ (function(module, exports) {

function len$(a){
	return a && (a.len instanceof Function ? a.len() : a.length) || 0;
};
// externs;

describe('Syntax - Arrays',function() {
	
	test("trailing commas",function() {
		var ary = [1,2,3];
		ok((ary[0] == 1) && (ary[2] == 3) && (ary.length == 3));
		
		return ary = [
			1,2,3,
			4,5,6,
			7,8,9
		];
		
		// really?
		// (sum = (sum or 0) + n) for n in ary
		// a = [((x) -> x), ((x) -> x * x)]
		// ok a:length is 2
	});
	
	// Splats in Array Literals
	
	test("array splat expansions with assignments",function() {
		var nums = [1,2,3];
		var list = [].concat([0], [].slice.call(nums), [4]);
		return eq([0,1,2,3,4],list);
	});
	
	test("mixed shorthand objects in array lists",function() {
		var ary = [
			{a: 1},
			'b',
			{c: 1}
		];
		ok(ary.length == 3);
		ok(ary[2].c == 1);
		
		ary = [{b: 1,a: 2},100];
		eq(ary[1],100);
		
		ary = [{a: 0,b: 1},(1 + 1)];
		eq(ary[1],2);
		
		ary = [{a: 1},'a',{b: 1},'b'];
		eq(ary.length,4);
		eq(ary[2].b,1);
		return eq(ary[3],'b');
	});
	
	
	test("array splats with nested arrays",function() {
		var nonce = {};
		var a = [nonce];
		var list = [].concat([1,2], [].slice.call(a));
		eq(list[0],1);
		eq(list[2],nonce);
		
		a = [[nonce]];
		list = [].concat([1,2], [].slice.call(a));
		return eq(list,[1,2,[nonce]]);
	});
	
	test("special #len method",function() {
		var a = [1,2,3];
		eq(a.length,3);
		return eq(len$(a),3);
	});
	
	return test("nested arrays",function() {
		var res = [];
		for (let i = 0, items = [1,2], len = items.length, a; i < len; i++) {
			a = items[i];
			for (let j = 0, ary = [1,2], len = ary.length; j < len; j++) {
				res.push(a,ary[j]);
			};
		};
		eq(res,[1,1,1,2,2,1,2,2]);
		
		res = [];
		for (let i = 0, items = [1,2], len = items.length, a; i < len; i++) {
			a = items[i];
			for (let i = 1; i <= 2; i++) {
				res.push(a,i);
			};
		};
		eq(res,[1,1,1,2,2,1,2,2]);
		
		res = [];
		for (let i = 0, items = [1,2], len = items.length, a; i < len; i++) {
			a = items[i];
			for (let i = 1; i < 3; i++) {
				res.push(a,i);
			};
		};
		return eq(res,[1,1,1,2,2,1,2,2]);
	});
});


/***/ }),
/* 23 */
/***/ (function(module, exports) {

var self = this;
// externs;

function ThrowClass(){ };

ThrowClass.prototype.cleanup = function(v){ return this._cleanup; }
ThrowClass.prototype.setCleanup = function(v){ this._cleanup = v; return this; };

ThrowClass.prototype.returnBeforeFinally = function (num){
	try {
		10;
		return num * 2;
	} finally {
		10;
		this.setCleanup(true);
	};
};



describe('Syntax - Catch',function() {
	
	return test("throw catch",function() {
		
		var res = false;
		var after = false;
		
		try {
			self.nometh() * 10;
		} catch (e) {
			res = 1;
		};
		ok(res);
		
		// also works with statements
		try {
			res = self.nometh();
		} catch (e) {
			res = 2;
		};
		eq(res,2);
		
		// finally is executed after the result of
		// expression is evaluated
		try {
			res = self.nometh();
		} catch (e) {
			res = 2;
		} finally {
			after = 3;
		};
		
		eq(res,2);
		eq(after,3);
		
		// check that throw works as expected
		try {
			2;
			throw 10;
		} catch (e) {
			res = e + 10;
		};
		
		eq(res,20);
		
		// try works alone - adds automatic catch
		try {
			res = 10;
		} catch (e) { };
		eq(res,10);
		
		var obj = new ThrowClass();
		eq(obj.returnBeforeFinally(2),4);
		return eq(obj.cleanup(),true);
	});
});







/***/ }),
/* 24 */
/***/ (function(module, exports, __webpack_require__) {

var Imba = __webpack_require__(0);
// externs;

function Paramer(){ return SpecObject.apply(this,arguments) };

Imba.subclass(Paramer,SpecObject);
Paramer.prototype.blk = function (blk){
	return [blk];
};

Paramer.prototype.req = function (name){
	return [name];
};

Paramer.prototype.req_blk = function (name,blk){
	return [name,blk];
};

Paramer.prototype.req_splat = function (name){
	var $0 = arguments, i = $0.length;
	var items = new Array(i>1 ? i-1 : 0);
	while(i>1) items[--i - 1] = $0[i];
	return [name,items];
};

Paramer.prototype.opt_blk = function (name,blk){
	if(blk==undefined && typeof name == 'function') blk = name,name = 'anon';
	if(name==undefined) name = 'anon';
	return [name,blk];
};

Paramer.prototype.req_opt_blk = function (name,options,blk){
	if(blk==undefined && typeof options == 'function') blk = options,options = {};
	if(options==undefined) options = {};
	return [name,options,blk];
};

Paramer.prototype.opt_opt_blk = function (name,options,blk){
	var $0 = arguments, i = $0.length;
	var blk = typeof $0[i-1] == 'function' ? $0[--i] : null;
	if(i < 1) name = 'anon';
	if(i < 2) options = {};
	return [name,options,blk];
};

Paramer.prototype.req_opt_splat_blk = function (name,options){
	var $0 = arguments, i = $0.length;
	var blk = typeof $0[i-1] == 'function' ? $0[--i] : null;
	if(i < 2) options = {};
	var items = new Array(i>2 ? i-2 : 0);
	while(i>2) items[--i - 2] = $0[i];
	return [name,options,items,blk];
};

Paramer.prototype.req_key = function (name,pars){
	// m('john', age: 20)
	if(!pars||pars.constructor !== Object) pars = {};
	var gender = pars.gender !== undefined ? pars.gender : 0;
	var age = pars.age !== undefined ? pars.age : 18;
	return [name,gender,age];
};

Paramer.prototype.req_key_blk = function (name,pars,blk){
	// m(age: 20)
	if(blk==undefined && typeof pars == 'function') blk = pars,pars = {};
	else if(!pars||pars.constructor !== Object) pars = {};
	var gender = pars.gender !== undefined ? pars.gender : 0;
	var age = pars.age !== undefined ? pars.age : 18;
	return [name,gender,age,blk];
};
// if the arg is an actual options-block I guess we should check for this first

Paramer.prototype.opt_key_blk = function (name,pars,blk){
	// m(age: 20)
	// m('john', age: 20) # should work
	var $0 = arguments, i = $0.length;
	var blk = typeof $0[i-1] == 'function' ? $0[--i] : null;
	var pars = $0[i-1]&&$0[i-1].constructor === Object ? $0[--i] : {};
	if(i < 1) name = 'anon';
	var gender = pars.gender !== undefined ? pars.gender : 0;
	var age = pars.age !== undefined ? pars.age : 18;
	return [name,gender,age,blk];
};

Paramer.prototype.splat_key_blk = function (){
	var $0 = arguments, i = $0.length;
	var blk = typeof $0[i-1] == 'function' ? $0[--i] : null;
	var pars = $0[i-1]&&$0[i-1].constructor === Object ? $0[--i] : {};
	var tags = new Array(i>0 ? i : 0);
	while(i>0) tags[i-1] = $0[--i];
	var gender = pars.gender !== undefined ? pars.gender : 0;
	var age = pars.age !== undefined ? pars.age : 18;
	return [tags,gender,age,blk];
};

Paramer.prototype.opt = function (name){
	if(name === undefined) name = 'anon';
	return name;
};

Paramer.prototype.setVal = function (value){
	this._val = value;
	return this;
};

Paramer.prototype.val = function (){
	return this._val;
};



	
	Number.prototype.num_meth = function (){
		return true;
	};



describe('Syntax - Functions',function() {
	
	var obj = new Paramer();
	var blk = function() { return true; };
	var res = null;
	
	test("methods",function() {
		// basic arguments works
		eq(obj.req('john'),['john']);
		eq(obj.blk(blk),[blk]);
		
		eq(obj.req_blk('john',blk),['john',blk]);
		
		// options will be set to default, blk will be correctly set
		eq(obj.req_opt_blk('john',blk),['john',{},blk]);
		
		// if we supply options to method, blk is still specified
		eq(obj.req_opt_blk('john',{opt: 10},blk),['john',{opt: 10},blk]);
		
		// hmmm
		eq(obj.req_opt_blk('john',undefined,blk),['john',{},blk]);
		
		// only set blk if it is a function
		eq(obj.req_opt_blk('john',{opt: 10}),['john',{opt: 10},undefined]);
		
		// should work for two optionals as well
		eq(obj.opt_opt_blk(blk),['anon',{},blk]);
		
		// should work for two optionals as well
		eq(obj.opt_opt_blk('john',blk),['john',{},blk]);
		eq(obj.opt_opt_blk('john',{opt: 10},blk),['john',{opt: 10},blk]);
		
		res = obj.req_opt_splat_blk('john',blk);
		eq(res,['john',{},[],blk]);
		
		res = obj.req_opt_splat_blk('john',{opt: 10},blk);
		eq(res,['john',{opt: 10},[],blk]);
		
		res = obj.req_opt_splat_blk('john');
		eq(res,['john',{},[],undefined]);
		
		res = obj.req_opt_splat_blk('john',{opt: 10},10,11,12,blk);
		eq(res,['john',{opt: 10},[10,11,12],blk]);
		
		res = obj.req_splat('john',1,2,3);
		eq(res,['john',[1,2,3]]);
		
		// optional arguments
		eq(obj.opt(),'anon');
		
		// null overrides the default argument
		eq(obj.opt(null),null);
		
		// undefined is like sending on argument
		return eq(obj.opt(undefined),'anon');
	});
	
	test("keyword arguments",function() {
		// [name,gender,age]
		res = obj.req_key('john',{age: 20});
		eq(res,['john',0,20]);
		
		res = obj.req_key('john');
		eq(res,['john',0,18]);
		
		// keywords are optional, and block is greedy
		// req_key_blk name, gender: 0, age: 18, &blk
		res = obj.req_key_blk('john',blk);
		eq(res,['john',0,18,blk]);
		
		res = obj.req_key_blk('john',{gender: 1},blk);
		eq(res,['john',1,18,blk]);
		
		// opt_key_blk name = 'anon', gender: 0, age: 18, &blk
		res = obj.opt_key_blk({gender: 1},blk);
		eq(res,['anon',1,18,blk]);
		
		res = obj.opt_key_blk(blk);
		eq(res,['anon',0,18,blk]);
		
		res = obj.opt_key_blk('john',{age: 20});
		eq(res,['john',0,20,null]);
		
		// splat_key_blk *tags, gender: 0, age: 18, &blk
		res = obj.splat_key_blk(1,2,3,{age: 20});
		eq(res,[[1,2,3],0,20,null]);
		
		res = obj.splat_key_blk(1,2,3,{gender: 1},blk);
		eq(res,[[1,2,3],1,18,blk]);
		
		res = obj.splat_key_blk({gender: 1},blk);
		eq(res,[[],1,18,blk]);
		
		res = obj.splat_key_blk();
		eq(res,[[],0,18,null]);
		
		res = obj.splat_key_blk(1,2,3);
		eq(res,[[1,2,3],0,18,null]);
		
		res = obj.splat_key_blk(1,2,3,blk);
		return eq(res,[[1,2,3],0,18,blk]);
	});
	
	
	test("basic lambdas",function() {
		
		// we use do-syntax fo define basic functions
		var fn = function() { return 1; };
		eq(fn(),1);
		
		// arguments are defined in do | args |
		fn = function(a) {
			return 1 + a;
		};
		
		eq(fn(0),1);
		eq(fn(1),2);
		
		// multiple arguments
		fn = function(a,b) {
			return a + b;
		};
		
		eq(fn(1,1),2);
		eq(fn(2,3),5);
		
		// we support default arguments
		fn = function(a,b,c) {
			if(c === undefined) c = 2;
			return a + b + c;
		};
		
		eq(fn(1,1),4);
		eq(fn(1,1,1),3);
		
		// splat arguments
		fn = function(a,b,c) {
			var $0 = arguments, i = $0.length;
			var d = new Array(i>3 ? i-3 : 0);
			while(i>3) d[--i - 3] = $0[i];
			return [a,b,c,d];
		};
		
		eq(fn(1,2,3,4,5),[1,2,3,[4,5]]);
		
		var outer = function() {
			var $0 = arguments, i = $0.length;
			var args = new Array(i>0 ? i : 0);
			while(i>0) args[i-1] = $0[--i];
			return args;
		};
		
		var inner = function(blk) {
			return blk ? blk() : null;
		};
		
		// block precedence
		// f1 f2 do 10 -> f1(f2(10))
		var v = outer(5,inner(function() { return 10; }));
		return eq(v,[5,10]);
	});
	
	test("methods on numbers",function() {
		return ok((1).num_meth());
	});
	
	
	test("block-argument position",function() {
		var fn = function(a,b,c) { return [(a instanceof Function) ? a() : a,(b instanceof Function) ? b() : b,(c instanceof Function) ? c() : c]; };
		var res;
		
		res = fn(1,2,function() { return 3; });
		eq(res,[1,2,3]);
		
		res = fn(1,function() { return 3; },2);
		eq(res,[1,3,2]);
		
		res = fn(function() { return 3; },2,3);
		return eq(res,[3,2,3]);
	});
	
	return test("setters",function() {
		obj.setVal(10);
		eq(obj.val(),10);
		
		var res = obj.setVal(20);
		eq(obj.val(),20);
		return eq(res,obj);
	});
});


// 	describe 'argvars' do
// 		test '$0 refers to arguments' do
// 			var fn = do $0:length
// 			eq fn(yes,yes,yes), 3
// 
// 		test '$i refers to arguments[i-1]' do
// 			fn = do $1+$2
// 			eq fn(10,20), 30
// 
// 			fn = do |a,b,c|
// 				eq a, $1
// 				eq b, $2
// 				eq c, $3
// 
// 			fn()
// 
// 	describe 'default arguments' do
// 
// 		it 'should work for numbers' do
// 			fn = do |a,b=1| return b
// 			eq fn(), 1
// 			eq fn(0), 1
// 			eq fn(0,2), 2
// 
// 		it 'should work for strings' do
// 			fn = do |a,b="b"| return b
// 			eq fn(), "b"
// 			eq fn(0), "b"
// 			eq fn(0,"x"), "x"
// 			eq fn(0,2), 2
// 
// 		it 'should work for arrays' do
// 			fn = do |a,b=[1,2,3]| return b
// 			eq fn(), [1,2,3]
// 			eq fn(0,"x"), "x"
// 			eq fn(0,2), 2
// 			eq fn(0,[0,1,2]), [0,1,2]
// 
// 		it 'should only override null/undefined' do
// 			fn = do |a,b=1| return b
// 			eq fn(0,0), 0
// 			eq fn(0,""), ""
// 
// 	
// 
// 	describe 'splats' do
// 
// 		test 'do |a,...b|' do
// 			fn = do|a,...b| return [a,b]
// 			eq fn(0,1,2,3), [0,[1,2,3]]
// 
// 			# other syntax
// 			fn = (|a,...b| return [a,b])
// 			eq fn(0,1,2,3), [0,[1,2,3]]
// 
// 		test 'do |a,...b,c|' do
// 			fn = do|a,...b,c| return [a,b,c]
// 			eq fn(0,1,2,3,4), [0,[1,2,3],4]
// 
// 			fn = (|a,...b,c| return [a,b,c])
// 			eq fn(0,1,2,3,4), [0,[1,2,3],4]
// 
// 	test 'callbacks' do
// 		res = [1,2,3].map do |a| a*2
// 		eq res, [2,4,6]
// 
// 		res = [1,2,3].map(|a| a*2)
// 		eq res, [2,4,6]
// 
// 	test 'self-referencing functions' do
// 		change = do change = 10
// 		change()
// 		eq change, 10

/***/ }),
/* 25 */
/***/ (function(module, exports) {

// externs;

describe('Syntax - Return',function() {
	
	function SyntaxReturn(){ };
	
	SyntaxReturn.prototype.none = function (){
		return;
	};
	
	SyntaxReturn.prototype.single = function (){
		return 1;
	};
	
	SyntaxReturn.prototype.multi = function (){
		return [1,2];
	};
	
	SyntaxReturn.prototype.d = function (){
		if (true) { return };
		return 1;
	};
	
	var obj = new SyntaxReturn();
	
	return test("explicit",function() {
		eq(obj.single(),1);
		eq(obj.multi(),[1,2]);
		eq(obj.d(),undefined);
		
		var fn = function() {
			return [
				1,
				2
			];
		};
		return eq(fn(),[1,2]);
	});
});


/***/ }),
/* 26 */
/***/ (function(module, exports) {

function union$(a,b){
	if(a && a.__union) return a.__union(b);

	var u = a.slice(0);
	for(var i=0,l=b.length;i<l;i++) if(u.indexOf(b[i]) == -1) u.push(b[i]);
	return u;
};

// externs;

var ary = [1,2,3];
let res = [];
for (let i = 0, len = ary.length; i < len; i++) {
	res.push(ary[i] + 1);
};
var rets = res;

var str = ("" + (ary[0]) + " " + (ary[1]) + " " + (ary[2]));


describe("Syntax - Statements",function() {
	
	return test("allow statements as arguments",function() {
		
		var fn = function() { var $0 = arguments, i = $0.length;
		var pars = new Array(i>0 ? i : 0);
		while(i>0) pars[i-1] = $0[--i];
		return pars; };
		var ary = [1,2,3,4];
		var res = fn(10,((function() {
			let res1 = [];
			for (let i = 0, len = ary.length; i < len; i++) {
				res1.push(ary[i] * 2);
			};
			return res1;
		})()),20);
		eq(res,[10,[2,4,6,8],20]);
		
		// unsure
		// 10 + try 10 catch e 10
		// since ary and fn are local, we can go all the way
		// up to cache it before.
		
		res = fn(union$(ary,((function() {
			let res2 = [];
			for (let i = 0, len = ary.length; i < len; i++) {
				res2.push(ary[i] * 2);
			};
			return res2;
		})())));
		
		var outer = 0;
		// when using statements as arguments, they might be
		// moved up into the statement and cache, but it needs
		// to happen in the expected order
		function Obj(){ };
		
		Obj.obj = function (){
			return new this();
		};
		Obj.prototype.test = function (arg){
			return arg;
		};
		return Obj;
		
		// res = Obj.new.test ((outer = v) for v in ary)
	});
});




/***/ }),
/* 27 */
/***/ (function(module, exports, __webpack_require__) {

var Imba = __webpack_require__(0);
// externs;

function Model(nestings){
	if(nestings === undefined) nestings = 0;
	this._gets = 0;
	this._sets = 0;
	this._calls = 0;
	this;
};

Model.prototype.a = function(v){ return this._a; }
Model.prototype.setA = function(v){ this._a = v; return this; };
Model.prototype.__b = {'default': 10,name: 'b'};
Model.prototype.b = function(v){ return this._b; }
Model.prototype.setB = function(v){ this._b = v; return this; }
Model.prototype._b = 10;

Model.prototype.setIvar = function (val){
	this._sets = this._sets + 1;
	this._ivar = val;
	return this;
};

Model.prototype.ivar = function (){
	this._gets = this._gets + 1;
	return this._ivar;
};

Model.prototype.child = function (){
	this._calls = this._calls + 1;
	return this._child;
};

Model.prototype.gets = function (){
	return this._gets;
};

Model.prototype.sets = function (){
	return this._sets;
};

Model.prototype.calls = function (){
	return this._calls;
};

Model.prototype.reset = function (){
	this._gets = 0;
	this._sets = 0;
	this._calls = 0;
	if (this._child) { this._child.reset() };
	return this;
};

Model.prototype.testmeth1 = function (){
	this.reset();
	this._ivar = 10;
	var ivar = this.ivar();
	ivar;
	return this;
};


// Assignment
// ----------

// * Assignment
// * Compound Assignment
// * Destructuring Assignment
// * Context Property (@) Assignment
// * Existential Assignment (?=)
describe('Syntax - Properties',function() {
	
	test("default values",function() {
		var object = new Model();
		eq(object.a(),undefined);
		return eq(object.b(),10);
	});
	
	test("watch: yes",function() {
		let track = null;
		function Example(){ };
		
		Example.prototype.__name = {watch: 'nameDidSet',name: 'name'};
		Example.prototype.name = function(v){ return this._name; }
		Example.prototype.setName = function(v){
			var a = this.name();
			if(v != a) { this._name = v; }
			if(v != a) { this.nameDidSet && this.nameDidSet(v,a,this.__name) }
			return this;
		};
		
		Example.prototype.nameDidSet = function (value){
			return track = value;
		};
		
		new Example().setName(10);
		return eq(track,10);
	});
	
	test("watch: String",function() {
		let track = null;
		function Example(){ };
		
		Example.prototype.__name = {watch: 'tracker',name: 'name'};
		Example.prototype.name = function(v){ return this._name; }
		Example.prototype.setName = function(v){
			var a = this.name();
			if(v != a) { this._name = v; }
			if(v != a) { this.tracker && this.tracker(v,a,this.__name) }
			return this;
		};
		Example.prototype.__other = {watch: 'tracker',name: 'other'};
		Example.prototype.other = function(v){ return this._other; }
		Example.prototype.setOther = function(v){
			var a = this.other();
			if(v != a) { this._other = v; }
			if(v != a) { this.tracker && this.tracker(v,a,this.__other) }
			return this;
		};
		Example.prototype.tracker = function (value){
			return track = value;
		};
		new Example().setName(10);
		eq(track,10);
		
		new Example().setOther(10);
		return eq(track,10);
	});
	
	return test("watch: function",function() {
		let track = null;
		function Example(){ };
		
		Example.prototype.__name = {watch: function(v) { return track = v; },name: 'name'};
		Example.prototype.name = function(v){ return this._name; }
		Example.prototype.setName = function(v){
			var a = this.name();
			if(v != a) { this._name = v; }
			if(v != a) { Imba.propDidSet(this,this.__name,v,a) }
			return this;
		};
		new Example().setName(10);
		return eq(track,10);
	});
});


/***/ }),
/* 28 */
/***/ (function(module, exports) {

// externs;

describe("Syntax - Literals",function() {
	
	test("object",function() {
		var o = {
			a: 1,
			b: 2
		};
		eq(o.a,1);
		eq(o.b,2);
		
		o = {a: 1};
		{b: 2};
		eq(o.a,1);
		return eq(o.b,undefined);
	});
	
	test("objects with methods",function() {
		var obj = {
			num: 1,
			meth: function(){
				return 2;
			},
			other: 3
		};
		eq(obj.meth(),2);
		
		var implicit = {
			_num: 1,
			meth: function(){
				return this._num;
			},
			other: 3
		};
		
		eq(implicit.meth(),1);
		eq(implicit.other,3);
		
		implicit = {
			meth: function(){
				return this._num;
			},
			_num: 2
		};
		
		return eq(implicit.meth(),2);
	});
	
	test("hashes with dynamic keys",function() {
		var $1;
		var key = "b";
		var obj = ($1 = {a: 1},$1[("" + key)] = 2,$1.c = 3,$1);
		eq(obj.a,1);
		eq(obj.b,2);
		return eq(obj.c,3);
	});
	
	test("strings",function() {
		var fn = function(arg) { return arg; };
		var name = 'john';
		var str = ("test " + 1 + " ");
		eq(str,"test 1 ");
		
		str = ("test " + 2 + " dette");
		eq(str,"test 2 dette");
		
		eq(("basic" + 100),"basic100");
		
		str = ("test " + 100 + " 	this");
		
		eq(str,"test 100 	this");
		
		str = "test\nthis\nnow";
		
		eq(str,"test\nthis\nnow");
		
		str = "test\n	this\n	now";
		
		eq(str,"test\n\tthis\n\tnow");
		eq(("import " + fn(name)),"import john");
		
		str = ("<?xml \" version=\"1.0\" \{ encoding=\"UTF-8\"?>");
		eq(str,'<?xml " version="1.0" { encoding="UTF-8"?>');
		
		var v = 1;
		str = ("" + (v ? 'a' : 'b') + "c");
		return eq(str,'ac');
	});
	
	test("symbols",function() {
		var sym = 'one';
		
		eq('one','one');
		eq('one:two','one:two');
		eq('oneTwo','oneTwo');
		return eq('one_two','one_two');
	});
	
	return test("regex",function() {
		var reg = /\w\d/;
		ok(reg.test('a1'));
		
		var hereg = /\w\d/;
		
		return ok(hereg.test('a1'));
	});
});


/***/ }),
/* 29 */
/***/ (function(module, exports) {

// externs;

describe('Syntax - Existential operator',function() {
	
	return test('chained',function() {
		var chain;
		function Chainable(){ };
		
		Chainable.prototype.a = function (){
			return this;
		};
		Chainable.prototype.b = function (){
			return this;
		};
		Chainable.prototype.n = function (){
			return null;
		};
		
		
		return chain = new Chainable();
		
		// eq chain.a.b.a, chain
		// ok chain?.a?.n?.err or yes
	});
});


/***/ }),
/* 30 */
/***/ (function(module, exports) {

// externs;

function A(a,b){
	this._a = a;
	this._b = b;
	this._c = 1;
	this._d = 1;
	this._e = 1;
	this._f = 1;
};

A.prototype.a = function(v){ return this._a; }
A.prototype.setA = function(v){ this._a = v; return this; };
A.prototype.b = function(v){ return this._b; }
A.prototype.setB = function(v){ this._b = v; return this; };
A.prototype.c = function(v){ return this._c; }
A.prototype.setC = function(v){ this._c = v; return this; };
A.prototype.d = function(v){ return this._d; }
A.prototype.setD = function(v){ this._d = v; return this; };
A.prototype.e = function(v){ return this._e; }
A.prototype.setE = function(v){ this._e = v; return this; };
A.prototype.f = function(v){ return this._f; }
A.prototype.setF = function(v){ this._f = v; return this; };

A.prototype.call = function (fn){
	var other = new A(2,2);
	fn.call(other);
	return this;
};

A.prototype.test = function (){
	var self = this;
	var res = [self.a(),this.a()];
	self.call(function() {
		res.push(self.a());
		res.push(this.a());
		// loops create their own scope, but should still
		// have the outermost closed scope as their implicit context
		let res1 = [];
		for (let i = 0, items = [1], len = items.length; i < len; i++) {
			res.push(self.a());
			res1.push(res.push(this.a()));
		};
		return res1;
	});
	return res;
};

A.prototype.innerDef = function (){
	var ary = [];
	
	// def inside a method scope creates a local function
	// which is implicitly called.
	
	function recur(i){
		ary.push(i);
		if (i < 5) { return recur(i + 1) };
	};
	
	recur(0);
	eq(ary,[0,1,2,3,4,5]);
	
	var k = 0;
	function implicit(){
		ary.push(k);
		if (++k < 6) { return implicit() };
	};
	
	implicit();
	return eq(ary,[0,1,2,3,4,5,0,1,2,3,4,5]);
};


A.prototype.letVar = function (){
	var ary = [1,2,3];
	var a = 1;
	var b = 1;
	var len = 1;
	var i = 1;
	var v = 1;
	
	for (let i = 0, len_ = ary.length; i < len_; i++) {
		ary[i] + 2;
		i;
	};
	
	eq(i,1);
	
	if (true) {
		for (let i = 0, len_ = ary.length; i < len_; i++) {
			i;
		};
		eq(i,1);
	};
	
	let res = [];
	for (let j = 0, len_ = ary.length; j < len_; j++) {
		res.push(ary[j]);
	};
	var r = res;
	
	r.length;
	
	for (let j = 0, len_ = ary.length; j < len_; j++) {
		let l = 1;
		let a = 2;
		let b = 2;
		let c = 2;
		let h = 0;
		a + b + c;
	};
	
	for (let j = 0, len_ = ary.length; j < len_; j++) {
		let a = 3;
		let b = 3;
		let c = 3;
		this.f();
	};
	
	if (true) {
		let a = 4;
		let b = 4;
		let i = 0;
		let len = 10;
		
		if (true) {
			let a = 5;
			let b = 5;
		};
		
		let e;
		let res1 = [];
		for (let i = 0, len_ = ary.length; i < len_; i++) {
			eq(a,4);
			res1.push(i);
		};
		e = res1;
		
		eq(a,4);
		eq(i,0);
	};
	
	if (1) {
		for (let j = 0, len_ = ary.length; j < len_; j++) {
			true;
		};
		var z = 4;
	};
	
	eq(v,1);
	eq(i,1);
	eq(len,1);
	eq(a + b + this.c() + this.d() + this.e() + this.f(),6);
	return;
};

A.prototype.letIf = function (){
	var v1, a;
	var v = 2;
	
	if (v1 = 3) {
		eq(v1,3);
	};
	
	eq(v,2);
	
	if (a = 2) {
		eq(a,2);
	};
	
	return eq(this.a(),1);
};

A.prototype.letShadow = function (){
	let v = 1;
	if (true) {
		let v1 = v * 2;
		eq(v1,2);
	};
	eq(v,1);
	
	if (true) {
		let c = this.c() * 2;
		return eq(c,2);
	};
};

A.prototype.letSwitch = function (val){
	if(val === undefined) val = 10;
	let x = val;
	let y = 20;
	
	switch (x) {
		case 10: {
			let y = 30;
			let z = 30;
			eq(y,30);
			break;
		}
		case 20: {
			let y = 40;
			let z = 40;
			eq(z,40);
			break;
		}
	};
	
	return eq(y,20);
};



A.prototype.varShadow = function (){
	var x = 10;
	var y = function() {
		var x1 = x * 2;
		return eq(x1,20);
	};
	
	return y();
};

A.prototype.caching = function (){
	
	var f;
	if (f = this.f()) {
		eq(f,this._f);
	} else {
		eq(1,0);
	};
	return this;
};

// console.log A.new.test


describe("Syntax - Scope",function() {
	var item = new A(1,1);
	
	test("nested scope",function() {
		var obj = new A(1,1);
		var res = obj.test();
		return eq(res,[1,1,1,2,1,2]);
	});
	
	test("def inside method",function() {
		return item.innerDef();
	});
	
	test("let",function() {  });
	
	
	test("class",function() {
		var x = 10;
		function A(){ };
		
		var x1 = 20;
		
		A.prototype.test = function (){
			eq(x1,20);
			x1 += 10;
			return eq(x1,30);
		};
		
		eq(x,10);
		new A().test();
		return eq(x,10);
	});
	
	test("let",function() {
		item.letVar();
		item.letIf();
		item.letShadow();
		item.letSwitch(10);
		item.letSwitch(20);
		
		var a = 0;
		if (true) {
			let a = 1;
			eq(a,1);
		};
		return eq(a,0);
	});
	
	test("var shadowing",function() {
		return item.varShadow();
	});
	
	return test("caching",function() {
		return new A().caching();
	});
});



/***/ }),
/* 31 */
/***/ (function(module, exports) {

// externs;

describe('Syntax - Delete',function() {
	
	return test("should return value",function() {
		var v_;
		var obj = {name: "John",age: 20};
		var age = (((v_ = obj.age),delete obj.age, v_));
		eq(age,20);
		return eq(obj.age,undefined);
	});
});


/***/ }),
/* 32 */
/***/ (function(module, exports) {

// externs;

function fn(blk,time){
	return blk(time);
};

describe('Syntax - Blockparam',function() {
	test('specify position',function() {
		var res = fn(function(mult) { return 10 * mult; },2);
		return eq(res,20);
	});
	
	return test('specify position using &',function() {
		var res = fn(function(mult) { return 10 * mult; },2);
		return eq(res,20);
	});
});




/***/ }),
/* 33 */
/***/ (function(module, exports, __webpack_require__) {

var Imba = __webpack_require__(0);
// externs;

// import two specific items from module
var module$ = __webpack_require__(4), Item = module$.Item, hello = module$.hello, myService = module$.service;

// import everything from module into a local namespace/variable 'm'
var m = __webpack_require__(4);

function Sub(){ return Item.apply(this,arguments) };

Imba.subclass(Sub,Item);
Sub.prototype.name = function (){
	return "sub" + Sub.__super__.name.apply(this,arguments);
};


describe("Syntax - Modules",function() {
	
	return test("modules",function() {
		var item = new Item();
		eq(item.name(),"item");
		
		item = new (m.Item)();
		eq(item.name(),"item");
		
		eq(m.Item,Item);
		
		eq(hello(),"world");
		
		
		// subclassing an imported class
		var sub = new Sub();
		eq(sub.name(),"subitem");
		
		
		eq(new (m.A)().name(),"a");
		eq(new (m.B)().name(),"b");
		
		eq(myService.inc(),1);
		eq(myService.decr(),0);
		
		myService.setName("Service");
		return eq(myService.name(),"Service");
	});
});


exports.Item = Item;


/***/ }),
/* 34 */
/***/ (function(module, exports) {

// externs;

describe('Syntax - Switch',function() {
	
	return test("general",function() {
		var type = 1;
		switch (type) {
			case 1: {
				value = 'A';
				break;
			}
			default:
			
				var value = 'B';
		
		};
		eq(value,'A');
		
		// compact
		switch (type) {
			case 1: {
				value = 'A';break;
			}
			default:
			
				value = 'B';
		
		};
		return eq(value,'A');
	});
});


/***/ }),
/* 35 */
/***/ (function(module, exports) {

function iter$(a){ return a ? (a.toArray ? a.toArray() : a) : []; };
function intersect$(a,b){
	if(a && a.__intersect) return a.__intersect(b);
	var res = [];
	for(var i=0, l=a.length; i<l; i++) {
		var v = a[i];
		if(b.indexOf(v) != -1) res.push(v);
	}
	return res;
};

function union$(a,b){
	if(a && a.__union) return a.__union(b);

	var u = a.slice(0);
	for(var i=0,l=b.length;i<l;i++) if(u.indexOf(b[i]) == -1) u.push(b[i]);
	return u;
};

var self = this;
// externs;

function O(){ };

O.prototype.x = function(v){ return this._x; }
O.prototype.setX = function(v){ this._x = v; return this; };
O.prototype.y = function(v){ return this._y; }
O.prototype.setY = function(v){ this._y = v; return this; };
O.prototype.z = function(v){ return this._z; }
O.prototype.setZ = function(v){ this._z = v; return this; };

function SyntaxAssignment(nestings){
	if(nestings === undefined) nestings = 0;
	this._gets = 0;
	this._sets = 0;
	this._calls = 0;
	if (nestings > 0) {
		this._child = new SyntaxAssignment(nestings - 1);
	};
	this;
};

SyntaxAssignment.prototype.setIvar = function (val){
	this._sets = this._sets + 1;
	this._ivar = val;
	return this;
};

SyntaxAssignment.prototype.ivar = function (){
	this._gets = this._gets + 1;
	return this._ivar;
};

SyntaxAssignment.prototype.child = function (){
	this._calls = this._calls + 1;
	return this._child;
};

SyntaxAssignment.prototype.gets = function (){
	return this._gets;
};

SyntaxAssignment.prototype.sets = function (){
	return this._sets;
};

SyntaxAssignment.prototype.calls = function (){
	return this._calls;
};

SyntaxAssignment.prototype.reset = function (){
	this._gets = 0;
	this._sets = 0;
	this._calls = 0;
	if (this._child) { this._child.reset() };
	return this;
};

SyntaxAssignment.prototype.testmeth1 = function (){
	this.reset();
	this._ivar = 10;
	var ivar = this.ivar();
	ivar;
	return this;
};


// Assignment
// ----------

// * Assignment
// * Compound Assignment
// * Destructuring Assignment
// * Context Property (@) Assignment
// * Existential Assignment (?=)
describe('Syntax - Assignment',function() {
	
	describe("properties",function() {
		var obj = new SyntaxAssignment();
		
		test("=",function() {
			obj.setIvar(1);
			return eq(obj.ivar(),1);
		});
		
		test("||=",function() {
			var ivar_, v_, $1, $2;
			(ivar_ = obj.ivar()) || ((obj.setIvar(v_ = 2),v_));
			eq(obj.ivar(),1);
			
			obj.setIvar(0);
			($1 = obj.ivar()) || ((obj.setIvar(v_ = 2),v_));
			eq(obj.ivar(),2);
			
			obj.setIvar(null);
			($2 = obj.ivar()) || ((obj.setIvar(v_ = 3),v_));
			return eq(obj.ivar(),3);
		});
		
		test("&&=",function() {
			var ivar_, v_;
			obj.setIvar(1);
			(ivar_ = obj.ivar()) && ((obj.setIvar(v_ = 2),v_));
			return eq(obj.ivar(),2);
		});
		
		test("+=",function() {
			obj.setIvar(1);
			obj.setIvar(obj.ivar() + 1);
			return eq(obj.ivar(),2);
		});
		
		test("-=",function() {
			obj.setIvar(1);
			obj.setIvar(obj.ivar() - 1);
			return eq(obj.ivar(),0);
		});
		
		return test("caching target",function() {
			var child_;
			var o1 = new SyntaxAssignment(3);
			var o2 = o1.child();
			var o3 = o2.child();
			o1.reset();
			eq(o1.calls(),0);
			o1.child().child().setIvar(2);
			eq(o3.ivar(),2);
			eq(o1.calls(),1);
			
			(child_ = o1.child().child()).setIvar(child_.ivar() + 2);
			eq(o3.ivar(),4);
			return eq(o1.calls(),2);
		});
		
		// test "var is not defined during set" do
	});
	
	
	describe("statements",function() {
		var obj = new SyntaxAssignment();
		var truthy = 1;
		var falsy = 0;
		
		test("=",function() {
			var v_;
			var localvar;
			obj.setIvar(1);
			eq(obj.ivar(),1);
			
			if (truthy) {
				try {
					localvar = (obj.setIvar(v_ = 4),v_);
				} catch (e) {
					localvar = (obj.setIvar($1 = 3),$1);
				};
			} else {
				localvar = (obj.setIvar(v_ = 2),v_);
			};
			
			eq(localvar,4);
			eq(obj.ivar(),4);
			
			if (truthy) {
				try {
					localvar = (obj.setIvar(v_ = self.nomethod()),v_);
				} catch (e) {
					localvar = (obj.setIvar($1 = 3),$1);
				};
			} else {
				localvar = (obj.setIvar(v_ = 2),v_);
			};
			
			eq(localvar,3);
			return eq(obj.ivar(),3);
		});
		
		test("||= statement",function() {
			var ivar_, v_;
			obj.setIvar(0);
			if (!(ivar_ = obj.ivar())) { if (truthy) {
				try {
					var l = (obj.setIvar(v_ = self.nomethod()),v_);
				} catch (e) {
					l = (obj.setIvar($1 = 3),$1);
				};
			} else {
				l = (obj.setIvar(v_ = 2),v_);
			} } else {
				l = ivar_
			};
			
			eq(l,3);
			return eq(obj.ivar(),3);
		});
		
		test("+= statement",function() {
			var tmp, v_;
			var l0 = 0;
			var l1 = 0;
			var l2 = 0;
			var l3 = 1;
			obj.setIvar(1);
			
			// 
			if (!l1) { if (l3) { if (truthy) {
				try {
					l0 = l1 = (obj.setIvar(v_ = obj.ivar() + (l3 = self.nomethod())),v_);
				} catch (e) {
					l0 = l1 = (obj.setIvar($1 = obj.ivar() + (l3 = 3)),$1);
				};
			} else {
				l0 = l1 = (obj.setIvar(v_ = obj.ivar() + (l3 = 2)),v_);
			} } else {
				l0 = l1 = (obj.setIvar(v_ = obj.ivar() + l3),v_)
			} } else {
				l0 = l1
			};
			
			eq(l0,l1);
			eq(l1,obj.ivar());
			return eq(obj.ivar(),4);
			// eq obj.ivar, 4
		});
		
		return test("caching access for compound assigns",function() {
			var child_, ivar_, v_;
			var o1 = new SyntaxAssignment(3);
			var o2 = o1.child();
			var o3 = o2.child();
			o1.reset();
			
			o1.setIvar(1);
			o1.child().setIvar(1);
			eq(o1.calls(),1);
			o1.reset();
			
			// on a compound access we should cache the left-side
			(ivar_ = (child_ = o1.child()).ivar()) && ((child_.setIvar(v_ = 2),v_));
			eq(o2.ivar(),2);
			return eq(o1.calls(),1);
		});
	});
	
	test("indexes",function() {
		var a = {};
		var b = false;
		a[b ? 'yes' : 'no'] = true;
		return eq(a.no,true);
	});
	
	// Compound Assignment
	test("boolean operators",function() {
		var nonce = {};
		
		var a = 0;
		a || (a = nonce);
		eq(nonce,a);
		
		var b = 1;
		b || (b = nonce);
		eq(1,b);
		
		// want to change this syntax later, or at least
		// introduce another one for value != null ...
		var c = 0;
		c && (c = nonce);
		eq(0,c);
		
		var d = 1;
		d && (d = nonce);
		return eq(nonce,d);
	});
	
	test("mathematical operators",function() {
		var a = [1,2,3,4];
		var b = [3,4,5,6];
		
		var u = union$(a,b);
		eq(u,[1,2,3,4,5,6]);
		
		var i = intersect$(a,b);
		return eq(i,[3,4]);
		
		// ensure that RHS is treated as a group
		// e = f = false
		// e and= f or true
		// eq false, e
	});
	
	// *note: this test could still use refactoring*
	test("compound assignment should be careful about caching variables",function() {
		var $1, $2, $3, $4, $5;
		var count = 0;
		var list = [];
		
		(list[$1 = ++count] == null) ? (list[$1] = 1) : list[$1];
		eq(1,list[1]);
		eq(1,count);
		
		(list[$2 = ++count] == null) ? (list[$2] = 2) : list[$2];
		eq(2,list[2]);
		eq(2,count);
		
		list[$3 = count++] && (list[$3] = 6);
		eq(6,list[2]);
		eq(3,count);
		
		// TODO inside the inner scope - the outer variable sound
		// already exist -- unless we've auto-called the function?
		var base;
		
		base = function() {
			++count;
			return base;
		};
		
		(($4 = base()).four == null) ? ($4.four = 4) : $4.four;
		eq(4,base.four);
		eq(4,count);
		
		(($5 = base()).five == null) ? ($5.five = 5) : $5.five;
		eq(5,base.five);
		return eq(5,count);
	});
	
	test("compound assignment with implicit objects",function() {
		var obj = undefined;
		(obj == null) ? (obj = {one: 1}) : obj;
		
		eq(obj.one,1);
		
		obj && (obj = {two: 2});
		
		eq(undefined,obj.one);
		return eq(2,obj.two);
	});
	
	test("compound assignment (math operators)",function() {
		var num = 10;
		num -= 5;
		eq(5,num);
		
		num *= 10;
		eq(50,num);
		
		num /= 10;
		eq(5,num);
		
		num %= 3;
		return eq(2,num);
	});
	
	test("more compound assignment",function() {
		var a = {};
		var val = undefined;
		val || (val = a);
		val || (val = true);
		eq(a,val);
		
		var b = {};
		val && (val = true);
		eq(val,true);
		val && (val = b);
		eq(b,val);
		
		var c = {};
		val = null;
		(val == null) ? (val = c) : val;
		(val == null) ? (val = true) : val;
		return eq(c,val);
	});
	
	
	test('a,b,c = 1,2,3',function(_0,_1,_2) {
		
		var $1, $2, items, array, len, i, coll, len_, j, tmp, ary_, ary__, $3, len__, k, tmplist;
		var ary = [1,2,3,4,5];
		var obj = new O();
		
		var a = 1;
		eq(a,1);
		var b = 2,c = 3;
		eq([a,b,c],[1,2,3]);
		
		var a = 2,b = [4],c = 6; // should result in error, no?
		eq([a,b,c],[2,[4],6]);
		
		
		var a = 2,b = 4,c = [6]; // should result in error, no?
		eq([a,b,c],[2,4,[6]]);
		
		var a = 1,b = [2,3],c = 4,d = 5; // should result in error, no?
		eq([a,b,c,d],[1,[2,3],4,5]);
		
		var a = 1,b = 2,c = 3,d = [4,5]; // should result in error, no?
		eq([a,b,c,d],[1,2,3,[4,5]]);
		
		var a = [1,2],b = 3,c = 4,d = 5; // should result in error, no?
		eq([a,b,c,d],[[1,2],3,4,5]);
		
		$1 = b,$2 = a,a = $1,b = $2;
		eq([a,b],[3,[1,2]]);
		
		$1 = [30,a],a = 10,b = 20,c = $1;
		eq([a,b,c],[10,20,[30,3]]);
		
		var items = iter$(ary);var a = items[0],b = items[1],c = items[2];
		eq([a,b,c],[1,2,3]);
		
		var array = iter$(ary),len = array.length,i = 0;var a = array[i++],b = array[i++],c = new Array(len - 2);while (i < len){
			c[i - 2] = array[i++]
		};
		eq([a,b,c],[1,2,[3,4,5]]);
		
		var list = [10,20,30];
		
		$1 = list[1],$2 = list[0],list[0] = $1,list[1] = $2;
		eq(list,[20,10,30]);
		
		var coll = iter$(ary),len_ = coll.length,j = 0,tmp = new Array(len_ - 2);list[0] = coll[j++];while (j < len_ - 1){
			tmp[j - 1] = coll[j++]
		};list[1] = tmp;list[2] = coll[j++];
		eq(list,[1,[2,3,4],5]);
		
		let res = [];
		for (let k = 0, len__ = ary.length; k < len__; k++) {
			res.push(ary[k] * 2);
		};
		var x = res;
		
		eq(x,[2,4,6,8,10]);
		
		let res1 = [];
		for (let k = 0, len__ = ary.length; k < len__; k++) {
			res1.push(ary[k] * 2);
		};
		var ary_ = iter$(res1);x = ary_[0];var y = ary_[1];
		
		eq([x,y],[2,4]);
		
		let res2 = [];
		for (let k = 0, len__ = ary.length; k < len__; k++) {
			res2.push(ary[k] * 2);
		};
		var ary__ = iter$(res2);x = ary__[0];y = ary__[1];obj.setZ(ary__[2]);
		eq([x,y,obj.z()],[2,4,6]);
		
		let res3 = [];
		for (let k = 0, len__ = ary.length; k < len__; k++) {
			res3.push(ary[k] * 2);
		};
		var $3 = iter$(res3),len__ = $3.length,k = 0,tmplist = new Array(len__ - 2);x = $3[k++];y = $3[k++];while (k < len__){
			tmplist[k - 2] = $3[k++]
		};obj.setZ(tmplist);
		eq([x,y,obj.z()],[2,4,[6,8,10]]);
		
		// special case for arguments
		a = _0,b = _1,c = _2;
		return;
	});
	
	test('a,b,c = x,y,z',function() {
		var $1, $2, $3;
		var o = {x: 0,y: 1,z: 2};
		var a = o.x,b = o.y,c = o.z;
		eq([a,b,c],[0,1,2]);
		
		// tuples should be preevaluated
		var v = 0;
		var $1 = (v = 5),$2 = v,$3 = v,a = $1,b = $2,c = $3;
		eq([a,b,c],[5,5,5]);
		
		var x = 10,y = 20;
		$1 = y,$2 = x,x = $1,y = $2;
		eq([x,y],[20,10]);
		
		x = 10,y = 20;
		$1 = (x += 20,y),$2 = x,x = $1,y = $2;
		eq([x,y],[20,30]);
		
		var fn = function() {
			x = 100;
			return 10;
		};
		
		// how are we supposed to handle this?
		x = 10,y = 20;
		$1 = fn(),$2 = x,x = $1,y = $2;
		return eq([x,y],[10,100]);
	});
	
	test('.a,.b = x,y',function() {
		// b will nececarrily need to be set after a is set
		var z_, $1, $2;
		function A(){
			this._x = 0;
			this._y = 0;
			this._z = 0;
		};
		
		// accessing x will increment y
		// def x
		// 	@x
		
		A.prototype.x = function(v){ return this._x; }
		A.prototype.setX = function(v){ this._x = v; return this; };
		A.prototype.y = function(v){ return this._y; }
		A.prototype.setY = function(v){ this._y = v; return this; };
		A.prototype.z = function(v){ return this._z; }
		A.prototype.setZ = function(v){ this._z = v; return this; };
		
		A.prototype.setX = function (x){
			this._z++;
			this._x = x;
			return this;
		};
		
		
		A.prototype.test = function (){
			var y_, x_;
			this.setX(1);
			this.setY(2);
			// switching them
			y_ = this.y(),x_ = this.x(),this.setX(y_),this.setY(x_);
			
			eq(this.y(),1);
			return eq(this.x(),2);
		};
		
		
		// o.x should not be set before we get o.z
		// if the left side was vars however, we could do it the easy way
		var o = new A();
		z_ = o.z(),o.setX(1),o.setY(z_);
		eq([o.x(),o.y()],[1,0]);
		
		// now predefine local variables
		var a = 0,b = 0,c = 0,i = 0;
		var m = function() { return a + b + c; };
		z_ = m(),$1 = m(),$2 = m(),a = z_,b = $1,c = $2;
		eq([a,b,c],[0,0,0]);
		
		return o.test();
	});
	
	
	test('tuples - edgecase',function() {
		var $1, $2;
		var b = 0,c = 0,i = 0;
		var m = function() { return (++i) + b + c; };
		
		// since a is not predefined, it is safe to evaluate this directly
		// while the values for b and c must be precached before assignment
		var a = m(),$1 = m(),$2 = m(),b = $1,c = $2;
		return eq([a,b,c],[1,2,3]);
	});
	
	test('tuples - edgecase 2',function() {
		var $1, $2, $3;
		var a = 0,c = 0,i = 0;
		
		var m = function() {
			a = 10;
			return (++i) + a + c;
		};
		
		// since a is not predefined, it is safe to evaluate this directly
		// while the values for b and c must be precached before assignment
		// here a is predefined AND evals to a value
		var $1 = m(),$2 = m(),$3 = m(),a = $1,b = $2,c = $3;
		return eq([a,b,c],[11,12,13]);
	});
	
	test('hoisting',function() {
		var fn = function(o,i) {
			if (i > 0) { fn(o,i - 1) };
			o.counter++;
			return o.counter;
		};
		
		var obj = {counter: 0};
		eq(fn(obj,10),11);
		return true;
	});
	
	return test('tupes - let',function() {
		var ary;
		var a = 1,b = 2,str = 'ab';
		
		if (true) {
			var ary = iter$(str.split(''));let a = ary[0],b = ary[1];
			eq(a,'a');
			eq(b,'b');
		};
		
		eq(a,1);
		return eq(b,2);
	});
});


/***/ }),
/* 36 */
/***/ (function(module, exports) {

// externs;

describe("Syntax - Conditionals",function() {
	
	test("unary",function() {
		var $1, $2;
		var t = true,f = false;
		var obj = {on: function() { return true; },off: function() { return false; }};
		
		eq((t ? 10 : 20),10);
		eq(((f !== undefined) ? (!f) : undefined),true);
		eq((t ? ($1 = obj) && $1.on  &&  $1.on() : ($2 = obj) && $2.off  &&  $2.off()),true);
		
		return eq((t ? ('.' + f) : ''),'.false');
		// e.event:metaKey ? pane?.show : pane?.maximize
	});
	
	return test("unary precedence",function() {
		var m;
		var a = null;
		var b = 2;
		var res;
		var block = function() { return true; };
		
		block(
			(m = a) ? (
				res = 1
			) : ((m = b) ? (
				res = m
			) : (
				null
			))
		);
		
		return eq(res,2);
	});
});


/***/ }),
/* 37 */
/***/ (function(module, exports, __webpack_require__) {

// externs;

function delay(ret){
	if(ret === undefined) ret = 1;
	return new Promise(function(resolve,reject) {
		return setTimeout(function() {
			if (ret instanceof Error) {
				return reject(ret);
			} else {
				return resolve(ret);
			};
		},0);
	});
};

describe('Await',function() {
	
	test('issue#93',async function() {
		var val = Promise.resolve(100);
		function A(){ };
		
		A.prototype.x = function(v){ return this._x; }
		A.prototype.setX = function(v){ this._x = v; return this; };
		A.prototype.__y = {'default': 100,name: 'y'};
		A.prototype.y = function(v){ return this._y; }
		A.prototype.setY = function(v){ this._y = v; return this; }
		A.prototype._y = 100;
		
		A.prototype.fetch = async function (){
			var v_;
			return (this.setX(v_ = await this.y()),v_);
		};
		
		var item = new A();
		await item.fetch();
		return eq(item.x(),100);
	});
	
	
	if (true) {
		test('es6',function() {
			async function add2(x){
				let p_a = delay(20);
				let p_b = delay(30);
				return x + await p_a + await p_b;
			};
			
			return add2(10).then(function(val) {
				return eq(val,60);
			});
		});
		
		return test('try-catch',async function() {
			try {
				var z = await Promise.reject(30);
				return eq(1,2);
			} catch (e) {
				return eq(e,30);
			};
		});
	};
});



/***/ }),
/* 38 */
/***/ (function(module, exports, __webpack_require__) {

var Imba = __webpack_require__(0), self = this, _2 = Imba.createTagCache, _1 = Imba.createElement;
// externs;

function jseq(find,blk){
	let val = String(blk);
	return ok(val.indexOf(find) >= 0,("'" + find + "' not found in " + val));
};

function htmleq(find,val){
	if (val instanceof Function) {
		val = val();
	};
	
	if (val instanceof Imba.Tag) {
		val = val.toString();
	};
	
	return ok(val.indexOf(find) >= 0,("'" + find + "' not found in " + val));
};

describe('Syntax - Tags',function() {
	
	var strvar = "hello";
	var numvar = 1;
	var fnvar = function() { return true; };
	var objvar = {a: 1,b: 2};
	
	test('id',function() {
		return jseq("setId('one')",function() { return (_1('div').setId('one')); });
	});
	
	test('flags',function() {
		jseq("flag('only')",function() { return (_1('div').flag('only')); });
		jseq("flag('two')",function() { return (_1('div').flag('two')); });
		jseq("flagIf('two',numvar)",function() { return (_1('div')).flagIf('two',numvar).end(); });
		jseq("setFlag(0,strvar)",function() { return (_1('div').setFlag(0,strvar)); });
		return jseq("setFlag(0,self.name())",function() { return (_1('div').setFlag(0,self.name())); });
	});
	
	// attributes
	test('attributes',function() {
		jseq("setTitle(strvar)",function() { return (_1('div')).setTitle(strvar).end(); });
		jseq("css('display','block')",function() { return (_1('div').css('display','block')); });
		jseq("setDisabled('disabled')",function() { return (_1('input').setDisabled('disabled')).end(); });
		jseq("setDisabled('disabled').setReadonly('readonly')",function() { return (_1('input').setDisabled('disabled').setReadonly('readonly')).end(); });
		return jseq(("set('model',strvar,\{number:1\})"),function() { return (_1('div')).set('model',strvar,{number:1}).end(); });
	});
	
	// events
	test('events',function() {
		jseq("(0,['tap','prevent','after'])",function() { return (_1('div').flag('two').on$(0,['tap','prevent','after'])); });
		jseq("(0,['tap',['incr',10]])",function() { return (_1('div').flag('two').on$(0,['tap',['incr',10]])); });
		return jseq("(0,['tap',fnvar])",function() { return (_1('div').flag('two')).on$(0,['tap',fnvar]).end(); });
	});
	
	test('data',function() {
		jseq("setData(objvar)",function() { return (_1('div')).setData(objvar).end(); });
		return jseq("setData(objvar)",function() { return (_1('div').flag('only')).setData(objvar).end(); });
	});
	
	test('ref',function() {
		return jseq("._main =",function() { let $ = this.$$ || (this.$$ = {});
		return (self._main = self._main||_1('div',self).flag('main')).setData(objvar).end(); });
	});
	
	
	test('template',function() {
		function Local(){ };
		
		Local.prototype.__title = {'default': "class",name: 'title'};
		Local.prototype.title = function(v){ return this._title; }
		Local.prototype.setTitle = function(v){ this._title = v; return this; }
		Local.prototype._title = "class";
		
		Local.prototype.closed = function (){
			return (t0 = (t0=_1('div')).setTitle("tag").setTemplate(function() {
				var $ = this.$, t0;
				return ($[0] || _1('h1',$,0,t0)).setContent(this.title(),3).end();
			})).end();
		};
		
		Local.prototype.open = function (){
			var self = this;
			return (t0 = (t0=_1('div')).setTitle("tag").setTemplate(function() {
				var $ = this.$, t0;
				return ($[0] || _1('h1',$,0,t0)).setContent(self.title(),3).end();
			})).end();
		};
		
		var instance = new Local();
		htmleq("<h1>tag</h1>",instance.closed());
		return htmleq("<h1>class</h1>",instance.open());
	});
	
	test('root',function() {
		var t0;
		let a,b,c,d,e;
		var item = (t0 = (t0=_1('div')).setContent([
			_1('div',t0.$,0,t0).flag('b'),
			_1('div',t0.$,1,t0).flag('c'),
			_1('div',t0.$,2,t0).flag('d')
		],2)).end((
			t0.$[2].setContent(
				e = t0.$[3] || _1('div',t0.$,3,2).flag('e')
			,3).end()
		,true));
		
		return eq(e.root(),item);
	});
	
	return test('multiple self',function() {
		var Something = Imba.defineTag('Something');
		var Local = Imba.defineTag('Local', function(tag){
			tag.prototype.render = function (){
				var $ = this.$;
				return this.$open(0).setChildren($[0] || _1('div',$,0,this).setText("ready"),2).synced();
			};
			
			tag.prototype.loading = function (){
				var $ = ($_ = this.$).$loading$ || ($_.$loading$ = _2(this));
				return this.$open('loading0').setChildren($[0] || _1('span',$,0,this).setText("loading"),2).synced();
			};
			
			tag.prototype.flip = function (bool){
				var $ = ($_ = this.$).$flip$ || ($_.$flip$ = _2(this));
				if(bool === undefined) bool = false;
				if (bool) {
					return this.$open('flip0').setChildren($[0] || _1(Something,$,0,this).setText("bold"),2).synced((
						$[0].end()
					,true));
				} else {
					return this.$open('flip1').setChildren($[1] || _1('i',$,1,this).setText("italic"),2).synced();
				};
			};
		});
		
		var node = (_1(Local)).end();
		htmleq('<div>ready</div>',node);
		node.loading();
		htmleq('<span>loading</span>',node);
		node.render();
		return htmleq('<div>ready</div>',node);
	});
});



/***/ }),
/* 39 */
/***/ (function(module, exports) {

// externs;

function chk(str,fn){
	var stripped = fn.toString().replace(/^function\s?\(\)\s?\{\s*(return )?/,'').replace(/\;?\s*\}\s*$/,'');
	return eq(stripped,str);
};

describe("Formatting",function() {
	
	// some basic tests to make sure we dont add nested parens all over the place
	return test("test",function() {
		chk("!!true",function() { return !!true; });
		return chk("1 + 2",function() { return 1 + 2; });
	});
});


/***/ }),
/* 40 */
/***/ (function(module, exports) {

// externs;

describe('Issues',function() {
	
	test('dynamic new',function() {
		
		function a(){
			return A;
		};
		
		function A(){ };
		
		A.b = function (){
			return A.B;
		};
		
		A.B = function B(){ };
		
		A.B.B = function (){
			return true;
		};
		
		A.B.C = function C(){ };
		
		
		
		ok(new A() instanceof A);
		ok(new A.B() instanceof A.B);
		ok(new A.B.C() instanceof A.B.C);
		
		ok(new (A.b().C)() instanceof A.B.C);
		ok(new (A.b().C)() instanceof A.B.C);
		return ok(new (a().B)() instanceof A.B);
	});
	
	test('var hoisting with loops',function() {
		
		let a = 0;
		
		function method(){
			let res = [];
			for (let i = 0, items = [1,2,3], len = items.length; i < len; i++) {
				res.push(items[i] * 2);
			};
			a = res;
			return;
		};
		
		method(); // call the method
		
		return eq(a,[2,4,6]);
	});
	
	test('missing var alias in loop',function() {
		try {
			let res = [];
			for (let i = 0, items = [{}], len = items.length; i < len; i++) {
				res.push(items[i].first = function (){
					return true;
				});
			};
			return res;
		} catch (e) {
			return eq(1,2);
		};
	});
	
	return test('incorrect var lookup with loops',function() {
		var a = {};
		var b = {};
		
		for (let i = 0, items = [a], len = items.length; i < len; i++) {
			let proto = items[i];
			proto.first = function (){
				return true;
			};
		};
		
		for (let i = 0, items = [b], len = items.length; i < len; i++) {
			let proto = items[i];
			proto.last = function (){
				return true;
			};
		};
		
		ok(a.first instanceof Function);
		return ok(b.last instanceof Function);
	});
});


/***/ }),
/* 41 */
/***/ (function(module, exports) {

// externs;

describe("Syntax - Quirks",function() {
	
	test("ivar in object",function() {
		let object = {
			_ivar: 10
		};
		
		let other = {
			_ivar: 100,
			ovar: 10
		};
		
		eq(object._ivar,10);
		return eq(object._ivar,10);
	});
	
	test("let item = try",function() {
		var item = 20;
		item;
		try {
			item = 1000;
		} catch (e) { };
		return eq(item,1000);
	});
	
	test("let item = try catch",function() {
		
		let item;
		try {
			Math.rendom(); // error
			item = 1000;
		} catch (e) {
			item = 2000;
		};
		
		return eq(item,2000);
	});
	
	test("let if",function() {
		let item;
		if (Math.random()) {
			for (let i = 0, items = [1,2,3], len = items.length, item; i < len; i++) {
				item = items[i];
				item * item * item;
			};
			item = 1000;
		} else {
			item = 1000;
		};
		
		return eq(item,1000);
	});
	
	return test("let item = forin",function() {
		let item;
		let res = [];
		for (let i = 0, items = [1,2,3], len = items.length; i < len; i++) {
			res.push(items[i] * 2);
		};
		item = res;
		return eq(item,[2,4,6]);
	});
});


/***/ }),
/* 42 */
/***/ (function(module, exports, __webpack_require__) {

function iter$(a){ return a ? (a.toArray ? a.toArray() : a) : []; };
var Imba = __webpack_require__(0), _2 = Imba.createTagMap, _3 = Imba.createTagList, _1 = Imba.createElement;
// externs;

(_1('a'));
(_1('a').flag('a').flag('b'));
(_1('a').flag('b').setHref(""));
(_1('a').flag('b').flagIf('c',true));

var buildCount = 0;

Imba.defineTag('custom', function(tag){
	
	tag.prototype.setup = function (){
		tag.__super__.setup.apply(this,arguments);
		return buildCount++;
	};
	
	tag.prototype.hello = function (){
		return true;
	};
});

Imba.defineTag('cached', function(tag){
	
	tag.prototype.setup = function (){
		this._ary = ['a','b','c'];
		return this.render();
	};
	
	tag.prototype.render = function (){
		var self = this, $ = this.$;
		return self.$open(0).setChildren(
			(function($0) {
				var v_, $$ = $0.$iter();
				for (let i = 0, items = iter$(self._ary), len = items.length; i < len; i++) {
					$$.push(($0[items[i]] || _1('div',$0,items[i]).setText("v")));
				};return $$;
			})($[0] || _2($,0))
		,5).synced();
	};
});

function CustomClass(){ return Imba.Tag.apply(this,arguments) };

Imba.subclass(CustomClass,Imba.Tag);
CustomClass.prototype.end = function (){
	return this.$open('end0').flag('one').flag('two').setText("Custom").synced();
};

Imba.defineTag('custom-init', function(tag){
	
	tag.prototype.initialize = function (dom){
		this.setDom(dom);
		this._custom = true;
		this.log('custom init');
		return this;
	};
});

Imba.defineTag('super-init', function(tag){
	
	tag.prototype.initialize = function (dom){
		this._custom = true;
		return tag.__super__.initialize.apply(this,arguments);
	};
});

var toArray = function(list) {
	return [].slice.call(list,0);
};

describe('Tags - Define',function() {
	
	test("basic",function() {
		var el = (_1('custom')).end();
		eq(el.hello(),true);
		return eq(el.toString(),'<div class="_custom"></div>');
	});
	
	
	test("caching",function() {
		var ary;
		var el = (_1('cached')).end();
		var els = toArray(el.dom().children);
		var ary = iter$(els);var a = ary[0],b = ary[1],c = ary[2];
		eq(els.length,3);
		eq(els,[a,b,c]);
		
		el.render();
		// children should remain the same after rerender
		return eq(toArray(el.dom().children),[a,b,c]);
	});
	
	// bug
	test("as part of object",function() {
		var obj;
		return obj = {
			name: 'something',
			node: (_1('a').setHref('#'))
		};
	});
	
	test("with switch",function() {
		var t0, el;
		var num = 1;
		// not yet caching with switch
		return el = (t0 = (t0=_1('div')).setContent(
			t0.$[0] || _1('div',t0.$,0,t0).flag('inner')
		,2)).end((
			t0.$[0].setContent(
				(function() {
					switch (num) {
						case 1: {
							return t0.$[1] || _1('div',t0.$,1,0).flag('one');
							break;
						}
						default:
						
							return t0.$[2] || _1('div',t0.$,2,0).flag('other');
					
					};
				})()
			,3).end()
		,true));
	});
	
	test("singleton with reserved names",function() {
		Imba.defineTag('#try', function(tag){
			tag.prototype.hello = function (){
				return true;
			};
		});
		return (_1('div').setId('try'));
	});
	
	test("cache for in",function() {
		buildCount = 0;
		var root = (_1('div'));
		
		root.render = function (){
			var $ = this.$;
			var ary = ['a','b','c','d'];
			return this.$open(0).setChildren([
				$[0] || _1('h1',$,0,this).setText('heading'),
				(function($0) {
					for (let i = 0, len = $0.taglen = ary.length; i < len; i++) {
						($0[i] || _1('custom',$0,i)).setContent(ary[i],3).end();
					};return $0;
				})($[1] || _3($,1))
			],1).synced();
		};
		
		root.render();
		eq(buildCount,4);
		
		root.render();
		root.render();
		root.render();
		console.log(root._children);
		return eq(buildCount,4);
	});
	
	test("cache double for in",function() {
		buildCount = 0;
		var root = (_1('div'));
		
		root.render = function (){
			var $ = this.$;
			var ary = ['a','b','c','d'];
			return this.$open(0).setChildren([
				$[0] || _1('h1',$,0,this).setText('heading'),
				(function($0,$1,$$) {
					for (let i = 0, len = ary.length, v; i < len; i++) {
						v = ary[i];
						$$.push(Imba.static([
							($0[i] || _1('custom',$0,i).flag('one')).setContent(v,3).end(),
							($1[i] || _1('custom',$1,i).flag('two')).setContent(v,3).end()
						],2,1));
					};return $$;
				})($[1] || _3($,1),$[2] || _3($,2),[])
			],1).synced();
		};
		
		root.render();
		eq(buildCount,8);
		
		root.render();
		root.render();
		root.render();
		eq(buildCount,8);
		return eq(root.dom().children.length,9);
	});
	
	test("dynamic flags",function() {
		let val = 'hello';
		var div = (_1('div'));
		div.render = function (){
			return this.$open(0).setFlag(-1,val).synced();
		};
		
		eq(div.render().toString(),'<div class="hello"></div>');
		
		val = 'other';
		return eq(div.render().toString(),'<div class="other"></div>');
	});
	
	test("void elements",function() {
		var el = (_1('input')).end();
		return eq(el.toString(),'<input>');
	});
	
	test("idn attributes",function() {
		var el = (_1('input').setType('checkbox').setRequired(true).setDisabled(false).setChecked(true).setValue("a")).end();
		var html = el.dom().outerHTML;
		
		eq(el.dom().required,true);
		eq(el.dom().checked,true);
		eq(el.dom().disabled,false);
		
		ok(html.indexOf('required') >= 0);
		return ok(html.indexOf('value="a"') >= 0);
	});
	
	
	test("style attribute",function() {
		var el = (_1('div').css('display','inline'));
		if (true) {
			return eq(el.dom().style.display,'inline');
		};
	});
	
	test("class",function() {
		var el = (_1(CustomClass)).end();
		if (true) {
			eq(el.dom().className,'one two');
			return document.body.appendChild(el.dom());
		};
	});
	
	// test "namespaced attributes" do
	// 	var el = <div cust:title="one">
	// 	eq el.toString, '<div cust:title="one"></div>'
	
	
	test("initialize",function() {
		var a = (_1('custom-init')).end();
		eq(a._custom,true);
		
		var b = (_1('super-init')).end();
		return eq(b._custom,true);
	});
	
	test("local tag",function() {
		var LocalTag = Imba.defineTag('LocalTag', 'canvas', function(tag){
			tag.prototype.initialize = function (){
				this._local = true;
				return tag.__super__.initialize.apply(this,arguments);
			};
		});
		
		var node = (_1(LocalTag)).end();
		eq(node.toString(),'<canvas class="LocalTag"></canvas>');
		eq(node._local,true);
		
		
		var SubTag = Imba.defineTag('SubTag', LocalTag);
		
		var sub = (_1(SubTag)).end();
		return eq(node._local,true);
	});
	
	test("caching event-handlers",function() {
		var Cache = Imba.defineTag('Cache', function(tag){
			tag.prototype.render = function (){
				var self = this, $ = this.$;
				return self.$open(0).setChildren(self._body = self._body||_1('div',self).flag('body').on$(0,['tap',function(e) { return self.title(); }]),2).synced();
			};
		});
		
		var node = (_1(Cache)).end();
		
		var fn = node._body._on_[0][1];
		node.render();
		eq(node._body._on_[0][1],fn);
		
		// if the handler references variables outside
		// of its scope we dont cache it on first render
		var NoCache = Imba.defineTag('NoCache', function(tag){
			tag.prototype.render = function (arg){
				var $ = this.$;
				return this.$open(0).setChildren(this._body = this._body||_1('div',this).flag('body'),2).synced((
					this._body.on$(0,['tap',function(e) { return arg; }]).end()
				,true));
			};
		});
		
		node = (_1(NoCache)).end();
		fn = node._body._on_[0][1];
		node.render();
		return ok(node._body._on_[0][1] != fn);
	});
	
	test("parsing correctly",function() {
		try {
			return (_1('div')).dataset('date',new Date()).end();
		} catch (e) {
			return ok(false);
		};
	});
	
	test("snake_case properties",function() {
		var Custom = Imba.defineTag('Custom', function(tag){
			tag.prototype.my_title = function(v){ return this._my_title; }
			tag.prototype.setMy_title = function(v){ this._my_title = v; return this; };
		});
		
		try {
			return (_1(Custom).setMy_title("hello")).end();
		} catch (e) {
			return ok(false);
		};
	});
	
	test("forin range",function() {
		var Custom = Imba.defineTag('Custom', function(tag){
			tag.prototype.render = function (){
				var $ = this.$;
				return this.$open(0).setChildren(
					(function($0) {
						for (let v = 1; v <= 2; v++) {
							($0[v] || _1('div',$0,v)).setContent(v,3).end();
						};return $0;
					})($[0] || _3($,0))
				,4).synced();
			};
		});
		
		var node = (_1(Custom)).end();
		return eq(node.toString(),'<div class="Custom"><div>1</div><div>2</div></div>');
	});
	
	test("data syntax",function() {
		var data = {a: 1,b: 2};
		var el = (_1('div')).setData(data).end();
		return eq(el.data(),data);
	});
	
	test("build order",function() {
		var order = [];
		var Custom = Imba.defineTag('Custom', function(tag){
			
			tag.prototype.build = function (){
				return order.push('build');
			};
			
			tag.prototype.setup = function (){
				return order.push('setup');
			};
			
			tag.prototype.setName = function (val){
				this._name = val;
				order.push('name');
				return this;
			};
		});
		
		var node = (_1(Custom).setName("custom")).end();
		return eq(order,['build','name','setup']);
	});
	
	test("issue #89",function() {
		var Custom = Imba.defineTag('Custom', function(tag){
			tag.prototype.render = function (){
				var self = this, $ = this.$;
				self._items = ["a","b","c"];
				self._k = 0;
				return self.$open(0).setChildren(
					(function($0) {
						var $1, $$ = $0.$iter();
						for (let i = 0, items = iter$(self._items), len = items.length; i < len; i++) {
							$$.push(($0[$1 = self._k++] || _1('div',$0,$1)).setContent(items[i],3).end());
						};return $$;
					})($[0] || _2($,0))
				,5).synced();
			};
		});
		
		var node = (_1(Custom)).end();
		return eq(node._k,3);
	});
	
	return test("css",function() {
		var Custom = Imba.defineTag('Custom', function(tag){
			
			tag.prototype.build = function (){
				return this.css({opacity: 0});
			};
		});
		
		var node = (_1(Custom)).end();
		eq(node.dom().style.opacity,0);
		return ok(node.toString().match(/opacity\:\s*0/));
	});
});


/***/ }),
/* 43 */
/***/ (function(module, exports, __webpack_require__) {

function iter$(a){ return a ? (a.toArray ? a.toArray() : a) : []; };
var Imba = __webpack_require__(0), _2 = Imba.createTagList, _3 = Imba.createTagMap, self = this, _1 = Imba.createElement;
// externs;

var a = 0;
var b = 0;
var c = 0;

var Tester = Imba.defineTag('Tester', function(tag){
	tag.prototype.toString = function (){
		let html = this.dom().outerHTML;
		return html = html.replace(/\<[^\>]+\>/g,function(m) {
			return (m[1] == '/') ? ']' : '[';
		});
	};
	
	tag.prototype.test = function (options){
		this._o = options;
		this.render(options);
		return this.toString();
	};
});

Imba.defineTag('cachetest', function(tag){
	
	Imba.defineTag('panel', function(tag){
		
		tag.prototype.header = function (){
			let $ = this.$$ || (this.$$ = {}), t0;
			return (t0 = this._header = this._header||(t0=_1('div',this)).flag('header').setContent(t0.$[0] || _1('div',t0.$,0,t0).setText('H'),2)).end();
		};
		
		tag.prototype.body = function (){
			return (_1('div'));
		};
		
		tag.prototype.render = function (){
			var $ = this.$;
			return this.$open(0).setChildren([
				$[0] || _1('div',$,0,this).setText('P'),
				this.header(),
				this.body()
			],1).synced();
		};
	});
	
	Imba.defineTag('subpanel', 'panel', function(tag){
		
		tag.prototype.header = function (){
			let $ = this.$$ || (this.$$ = {}), t0;
			return (t0 = this._header = this._header||(t0=_1('div',this)).flag('header').setContent(t0.$[0] || _1('div',t0.$,0,t0).setText('X'),2)).end();
		};
	});
	
	Imba.defineTag('wrapped', function(tag){
		tag.prototype.content = function(v){ return this._content; }
		tag.prototype.setContent = function(v){ this._content = v; return this; };
		
		tag.prototype.render = function (){
			var $ = this.$;
			return this.$open(0).setChildren([
				$[0] || _1('div',$,0,this).setText('W'),
				this._content
			],1).synced();
		};
	});
	
	tag.prototype.render = function (o){
		var $ = this.$;
		if(o === undefined) o = {};
		return this.$open(0).setChildren([
			o.a ? (
				($[0] || _1('div',$,0,this).setText('A'))
			) : void(0),
			o.b && ($[1] || _1('div',$,1,this).setText('B')),
			o.c ? (
				($[2] || _1('wrapped',$,2,this).setContent([
					_1('div',$,3,2).setText('B'),
					_1('div',$,4,2).setText('C')
				],2)).end()
			) : void(0),
			
			(function($0) {
				for (let i = 0, items = iter$(o.letters), len = $0.taglen = items.length; i < len; i++) {
					($0[i] || _1('div',$0,i)).setContent(items[i],3).end();
				};return $0;
			})($[5] || _2($,5))
		],1).synced();
	};
	
	tag.prototype.toString = function (){
		let html = this.dom().outerHTML;
		// strip away all tags
		return html = html.replace(/\<[^\>]+\>/g,function(m) {
			return (m[1] == '/') ? ']' : '[';
		});
		// html = html.replace(/\[(\w+)\]/g,'$1')
	};
	
	tag.prototype.test = function (options){
		this.render(options);
		return this.toString();
	};
});

let has = function(text,fn) {
	return ok(String(fn).indexOf(text) >= 0);
};


describe('Tags - Cache',function() {
	var node = (_1('cachetest')).end();
	test("basic",function() {
		return eq(node.test(),"[]");
	});
	
	test("wrapped",function() {
		return eq(node.test({c: true}),"[[[W][B][C]]]");
	});
	
	test("with list",function() {
		return eq(node.test({letters: ['A','B','C']}),"[[A][B][C]]");
	});
	
	test("setText",function() {
		let has = function(text,fn) {
			return ok(String(fn).indexOf(text) >= 0);
		};
		let dyn = 10;
		has('setText',function() { return (_1('div').setText("title")); });
		has('setText',function() { return (_1('div')).setText("title " + dyn).end(); });
		return has('setText',function() { return (_1('div')).setText("title" + dyn).end(); });
	});
	
	test("svg dynamic set",function() {
		return has('set(',function() { return (_1('svg:rect').set('fill','red')).end(); });
	});
	
	test("alternate text and dom",function() {
		if (false) {};
		var items = ["A",(_1('div').setText("B"))];
		var flip = function() {
			items.reverse();
			return items[0];
		};
		
		var el = (t0 = (t0=_1(Tester))).setTemplate(function() {
			var $ = this.$, t0;
			return ($[0] || _1('li',$,0,t0)).setContent(items[this._o],3).end();
		}).end();
		// items = ["A",<div> "B"]
		eq(el.test(0),'[[A]]');
		eq(el.test(1),'[[[B]]]');
		return eq(el.test(0),'[[A]]');
	});
	
	true && test("parent",function() {
		var Local = Imba.defineTag('Local', function(tag){
			tag.prototype.header = function (){
				let $ = this.$$ || (this.$$ = {}), t0, t1;
				return (t0 = this._header = this._header||(t0=_1('div',this)).flag('header').setContent([
					_1('h1',t0.$,0,t0),
					_1('h2',t0.$,1,t0),
					t1 = this._b = this._b||(t1=_1('ul',t0)).flag('b').setContent([
						this._c = this._c||_1('li',t1).flag('c'),
						_1('li',t0.$,2,t1)
					],2)
				],2)).end((
					this._b.end()
				,true));
			};
		});
		var node = (_1(Local)).end();
		var nodes = node.header().dom();
		for (let i = 0, items = iter$(nodes.querySelectorAll("*")), len = items.length, node; i < len; i++) {
			node = items[i];
			eq(node._tag._owner_,node.parentNode._tag);
		};
		return;
	});
	
	return true && test("pruning",function() {
		var counter = 0;
		var items = [];
		for (let i = 0; i <= 10; i++) {
			items.push({id: counter++,name: "Item"});
		};
		
		var node = (t0 = (t0=_1('div'))).setTemplate(function() {
			var $ = this.$, t0;
			return ($[0] || _1('ul',$,0,t0)).setContent((function($0) {
				var id_, $$ = $0.$iter();
				for (let i = 0, len = items.length, item; i < len; i++) {
					item = items[i];
					$$.push(($0[id_ = item.id] || _1('li',$0,id_)).setContent(item.name,3).end());
				};return $$;
			})($[1] || _3($,1,0)),5).end();
		}).end();
		
		let prevFn = Imba.TagMap.prototype.$prune;
		var pruned = false;
		
		Imba.TagMap.prototype.$prune = function(items) {
			pruned = true;
			return prevFn.call(this,items);
		};
		
		for (let i = 0; i <= 2000; i++) {
			items.shift();
			items.push({id: counter++,name: "Item"});
			node.render();
		};
		
		let map = node.$[1];
		eq(pruned,true);
		return self;
	});
});







/***/ }),
/* 44 */
/***/ (function(module, exports, __webpack_require__) {

function iter$(a){ return a ? (a.toArray ? a.toArray() : a) : []; };
var Imba = __webpack_require__(0), _2 = Imba.createTagList, self = this, _1 = Imba.createElement;
// to run these tests, simply open the imbadir/test/dom.html in your browser and
// open the console / developer tools.

// externs;

var _ = __webpack_require__(45);

Imba.defineTag('el', function(tag){
	
	tag.prototype.flag = function (ref){
		this._flagged = ref;
		return tag.__super__.flag.apply(this,arguments);
	};
});

Imba.defineTag('group', function(tag){
	tag.prototype.ops = function(v){ return this._ops; }
	tag.prototype.setOps = function(v){ this._ops = v; return this; };
	tag.prototype.opstr = function(v){ return this._opstr; }
	tag.prototype.setOpstr = function(v){ this._opstr = v; return this; };
	
	tag.prototype.expected = function(v){ return this._expected; }
	tag.prototype.setExpected = function(v){ this._expected = v; return this; };
	tag.prototype.actual = function(v){ return this._actual; }
	tag.prototype.setActual = function(v){ this._actual = v; return this; };
	
	tag.prototype.setChildren = function (nodes,typ){
		this._ops = [];
		this._opstr = "";
		this._errors = null;
		this.setExpected(_.flatten(nodes).filter(function(n) {
			return (typeof n=='string'||n instanceof String) || (n && n._dom);
			// n isa String ? n : (n and n.@dom)
			// n and n.@dom
		}));
		this.setActual([]);
		// log "setStaticChildren",nodes,expected
		tag.__super__.setChildren.call(this,nodes,typ);
		
		for (let i = 0, items = iter$(this._dom.childNodes), len = items.length, child; i < len; i++) {
			// how would this work on server?
			// if child isa Text
			// 	actual.push( child:textContent )
			// 	continue if child:textContent == expected[i]
			
			child = items[i];
			var el = (child instanceof Text) ? child.textContent : (Imba.getTagForDom(child));
			if (el != this.expected()[i]) {
				this._errors || (this._errors = []);
				// log "not the same as expected at i",child,expected[i].@dom
				this._errors.push([el,this.expected()[i],i]);
			};
			
			this.actual().push(el);
		};
		// log actual
		
		if (this._errors) {
			console.log('got errors');
			console.log('expected',this.expected());
			console.log('found',this.actual());
		};
		
		eq(this._errors,null);
		return this;
	};
	
	tag.prototype.appendChild = function (node){
		// log "appendChild",node
		this.ops().push(["appendChild",node]);
		this._opstr += "A";
		return tag.__super__.appendChild.apply(this,arguments);
	};
	
	tag.prototype.removeChild = function (node){
		// log "removeChild",node
		this.ops().push(["removeChild",node]);
		this._opstr += "R";
		return tag.__super__.removeChild.apply(this,arguments);
	};
	
	tag.prototype.insertBefore = function (node,rel){
		// log "insertBefore"
		this.ops().push(["insertBefore",node,rel]);
		this._opstr += "I";
		return tag.__super__.insertBefore.apply(this,arguments);
	};
	
	tag.prototype.reset = function (){
		return this.render();
	};
	
	tag.prototype.commit = function (){
		return this; // dont render automatically
	};
	
	tag.prototype.name = function (){
		return "test";
	};
	
	tag.prototype.render = function (pars){
		// no need for nested stuff here - we're testing setStaticChildren
		// if it works on the flat level it should work everywhere
		var $ = this.$;
		if(!pars||pars.constructor !== Object) pars = {};
		var a = pars.a !== undefined ? pars.a : false;
		var b = pars.b !== undefined ? pars.b : false;
		var c = pars.c !== undefined ? pars.c : false;
		var d = pars.d !== undefined ? pars.d : false;
		var e = pars.e !== undefined ? pars.e : false;
		var list = pars.list !== undefined ? pars.list : null;
		var str = pars.str !== undefined ? pars.str : null;
		var list2 = pars.list2 !== undefined ? pars.list2 : null;
		return this.$open(0).setChildren([
			($[0] || _1('el',$,0,this).flag('a')).setContent(this.name(),3).end(),
			str,
			($[1] || _1('el',$,1,this).flag('b').setText("ok")).end(),
			a ? Imba.static([
				($[2] || _1('el',$,2,this).flag('header')).end(),
				($[3] || _1('el',$,3,this).flag('title').setText("Header")).end(),
				($[4] || _1('el',$,4,this).flag('tools')).end(),
				b ? Imba.static([
					($[5] || _1('el',$,5,this).flag('long')).end(),
					($[6] || _1('el',$,6,this).flag('long')).end()
				],2,1) : Imba.static([
					($[7] || _1('el',$,7,this).flag('short')).end(),
					($[8] || _1('el',$,8,this).flag('short')).end(),
					($[9] || _1('el',$,9,this).flag('short')).end()
				],2,2),
				($[10] || _1('el',$,10,this).flag('ruler')).end()
			],1,3) : void(0),
			c ? Imba.static([
				($[11] || _1('div',$,11,this).flag('c1').setText("long")),
				($[12] || _1('div',$,12,this).flag('c2').setText("loong"))
			],2,4) : void(0),
			(d && e) ? Imba.static([
				($[13] || _1('el',$,13,this).flag('long')).end(),
				($[14] || _1('el',$,14,this).flag('footer')).end(),
				($[15] || _1('el',$,15,this).flag('bottom')).end()
			],2,5) : (e ? Imba.static([
				($[16] || _1('el',$,16,this).flag('footer')).end(),
				($[17] || _1('el',$,17,this).flag('bottom')).end()
			],2,6) : (
				($[18] || _1('el',$,18,this).setText("!d and !e")).end()
			)),
			list,
			($[19] || _1('el',$,19,this).flag('x').setText("very last")).end(),
			list2
		],1).synced();
	};
});


Imba.defineTag('other', function(tag){
	
	tag.prototype.render = function (){
		var self = this, $ = this.$;
		return self.$open(0).setChildren((function($0) {
			for (let i = 0, items = iter$(self.items()), len = $0.taglen = items.length; i < len; i++) {
				($0[i] || _1('li',$0,i)).setContent(items[i],3).end();
			};return $0;
		})($[0] || _2($,0)),4).synced();
	};
});

Imba.defineTag('textlist', function(tag){
	tag.prototype.render = function (texts){
		if(texts === undefined) texts = [];
		return this.$open(0).setChildren((function($$) {
			for (let i = 0, items = iter$(texts), len = items.length; i < len; i++) {
				$$.push(items[i]);
			};return $$;
		})([]),3).synced();
	};
});

Imba.defineTag('group2', 'group', function(tag){
	
	tag.prototype.render = function (pars){
		var $ = this.$;
		if(!pars||pars.constructor !== Object) pars = {};
		var a = pars.a !== undefined ? pars.a : false;
		return this.$open(0).setChildren(
			a ? Imba.static([
				($[0] || _1('el',$,0,this).flag('a')).end(),
				($[1] || _1('el',$,1,this).flag('b')).end(),
				($[2] || _1('el',$,2,this).flag('c')).end()
			],2,1) : Imba.static([
				($[3] || _1('el',$,3,this).flag('d')).end(),
				($[4] || _1('el',$,4,this).flag('e')).end()
			],2,2)
		,3).synced();
	};
});

Imba.defineTag('group3', 'group', function(tag){
	
	tag.prototype.render = function (pars){
		var $ = this.$;
		if(!pars||pars.constructor !== Object) pars = {};
		var a = pars.a !== undefined ? pars.a : false;
		return this.$open(0).setChildren([
			($[0] || _1('el',$,0,this).flag('a')).end(),
			a ? "items" : "item"
		],1).synced();
	};
});

Imba.defineTag('group4', 'group', function(tag){
	
	tag.prototype.render = function (pars){
		var $ = this.$;
		if(!pars||pars.constructor !== Object) pars = {};
		var a = pars.a !== undefined ? pars.a : false;
		return this.$open(0).setChildren([
			($[0] || _1('el',$,0,this).flag('a')).end(),
			a ? (
				"text"
			) : Imba.static([
				($[1] || _1('el',$,1,this).flag('b')).end(),
				($[2] || _1('el',$,2,this).flag('c')).end()
			],2,1)
		],1).synced();
	};
});

Imba.defineTag('group5', 'group', function(tag){
	
	tag.prototype.render = function (pars){
		var $ = this.$;
		if(!pars||pars.constructor !== Object) pars = {};
		var a = pars.a !== undefined ? pars.a : false;
		return this.$open(0).setChildren([
			"a",
			"b",
			a ? ((($[0] || _1('el',$,0,this).flag('c').setText("c")).end())) : "d"
		],1).synced();
	};
});

Imba.defineTag('unknowns', 'div', function(tag){
	
	tag.prototype.ontap = function (){
		var self = this;
		self.render();
		setInterval(function() { return self.render(); },100);
		return self;
	};
	
	tag.prototype.tast = function (){
		return 10;
	};
	
	tag.prototype.render = function (){
		var $ = this.$;
		return this.$open(0).setChildren([
			5,
			new Date().toString(),
			10,
			"20",
			"30",
			$[0] || _1('div',$,0,this).flag('hello'),
			$[1] || _1('div',$,1,this).flag('hello').setContent($[2] || _1('b',$,2,1),2),
			$[3] || _1('div',$,3,this).flag('int'),
			$[4] || _1('div',$,4,this).flag('date'),
			$[5] || _1('div',$,5,this).flag('str').setText("string"),
			$[6] || _1('div',$,6,this).flag('list'),
			$[7] || _1('div',$,7,this).flag('item'),
			$[8] || _1('div',$,8,this).flag('if'),
			
			$[9] || _1('div',$,9,this).flag('if')
		],1).synced((
			$[1].end(),
			$[3].setContent(10,3).end(),
			$[4].setContent(new Date(),3).end(),
			$[6].setContent(this.list(),3).end(),
			$[7].setContent(this.tast(),3).end(),
			$[8].setContent(
				true ? (
					this.list()
				) : void(0)
			,3).end(),
			$[9].setContent([
				$[10] || _1('b',$,10,9),
				$[11] || _1('b',$,11,9),
				this.tast(),
				$[12] || _1('b',$,12,9)
			],1).end()
		,true));
	};
	
	
	tag.prototype.list = function (){
		let x_, $ = this.$$ || (this.$$ = {});
		let res = [];
		for (let i = 0, items = [1,2,3], len = items.length; i < len; i++) {
			res.push(($[items[i]] || _1('div',$,items[i]).flag('x')));
		};
		return res;
	};
});

Imba.defineTag('stat', 'group', function(tag){
	tag.prototype.render = function (){
		var $ = this.$;
		return this.$open(0).setChildren($.$ = $.$ || [
			_1('div',$,0,this).flag('hello'),
			_1('ul',$,1,this).flag('other').setContent([
				_1('li',$,2,1).flag('a'),
				_1('li',$,3,1).flag('b')
			],2),
			_1('div',$,4,this).flag('again')
		],2).synced((
			$[1].end()
		,true));
	};
});

describe("Tags",function() {
	
	var a = (_1('el').flag('a').setText("a")).end();
	var b = (_1('el').flag('b').setText("b")).end();
	var c = (_1('el').flag('c').setText("c")).end();
	var d = (_1('el').flag('d').setText("d")).end();
	var e = (_1('el').flag('e').setText("e")).end();
	var f = (_1('el').flag('f').setText("f")).end();
	
	var g = (_1('el').flag('g').setText("g")).end();
	var h = (_1('el').flag('h').setText("h")).end();
	var i = (_1('el').flag('i').setText("i")).end();
	var j = (_1('el').flag('j').setText("j")).end();
	
	var group = (_1('group')).end();
	document.body.appendChild(group.dom());
	
	// test "first render with string" do
	// 	group.render str: "Hello"
	// 	eq group.opstr, "AAAAA"
	
	test("first render",function() {
		group.render();
		return eq(group.opstr(),"AAAA");
	});
	
	test("second render",function() {
		// nothing should happen on second render
		group.render();
		return eq(group.opstr(),"");
	});
	
	test("added block",function() {
		group.render({c: true});
		return eq(group.opstr(),"II");
	});
	
	test("remove again",function() {
		group.render({c: false});
		return eq(group.opstr(),"RR");
	});
	
	test("with string",function() {
		group.render({str: "Hello there"});
		eq(group.opstr(),"I");
		
		// changing the string only - should not be any
		// dom operations on the parent
		group.render({str: "Changed string"});
		eq(group.opstr(),"");
		
		// removing string, expect a single removeChild
		group.render({str: null});
		return eq(group.opstr(),"R");
	});
	
	test("changing conditionals",function() {
		group.render({a: true});
		eq(group.opstr(),"IIIIIII");
		
		group.render({a: true,b: true});
		return eq(group.opstr(),"RRRII");
	});
	
	test("toplevel conditionals",function() {
		var node = (_1('group2')).end();
		node.render({a: true});
		eq(node.opstr(),"AAA");
		
		node.render({a: false});
		eq(node.opstr(),"RRRAA");
		return self;
	});
	
	test("conditionals with strings",function() {
		var node = (_1('group3')).end();
		node.render({a: true});
		eq(node.opstr(),"AA");
		
		node.render({a: false});
		eq(node.opstr(),"");
		return self;
	});
	
	test("conditionals with strings II",function() {
		var node = (_1('group4')).end();
		node.render({a: true});
		eq(node.opstr(),"AA");
		
		// string should simply be replaced
		node.render({a: false});
		eq(node.opstr(),"RAA");
		return self;
	});
	
	describe("group5",function() {
		
		return test("conditions",function() {
			var node = (_1('group5')).end();
			document.body.appendChild(node.dom());
			node.render({a: false});
			eq(node.opstr(),"AAA");
			
			// string should simply be replaced
			node.render({a: true});
			eq(node.opstr(),"RA");
			
			node.render({a: false});
			return eq(node.opstr(),"RA");
		});
	});
	
	test("unknowns",function() {
		var node = (_1('unknowns')).end();
		document.body.appendChild(node.dom());
		return node.render({a: false});
		// eq node.opstr, "AAA"
	});
	
	describe("dynamic lists",function() {
		// render once without anything to reset
		var full = [a,b,c,d,e,f];
		
		test("last list",function() {
			group.render();
			group.render({list2: [h,i]});
			eq(group.opstr(),"AA");
			
			group.render({list2: [h,i,j]});
			eq(group.opstr(),"A");
			
			return group.render();
			// render full regular again
		});
		
		test("adding dynamic list items",function() {
			group.render({list: full});
			eq(group.opstr(),"IIIIII");
			
			// append one
			group.render({list: [a,b,c,d,e,f,g]});
			eq(group.opstr(),"I");
			// remove again
			group.render({list: full});
			eq(group.opstr(),"R");
			
			// add first element last
			group.render({list: [b,c,d,e,f,a]});
			eq(group.opstr(),"I");
			
			return group.render({list: full});
		});
		
		test("removing",function() {
			group.render({list: [a,b,e,f]});
			eq(group.opstr(),"RR");
			
			group.render({list: full});
			return eq(group.opstr(),"II");
		});
		
		return test("should be reorderable",function() {
			
			group.render({list: full}); // render with the regular list
			group.render({list: [b,a,c,d,e,f]});
			eq(group.opstr(),"I");
			
			// reordering two elements
			group.render({list: full});
			group.render({list: [c,d,a,b,e,f]});
			eq(group.opstr(),"II");
			
			// reordering two elements
			group.render({list: full});
			group.render({list: [c,d,e,f,a,b],str: "Added string again as well"});
			return eq(group.opstr(),"III");
		});
	});
	
	return describe("text lists",function() {
		var node = (_1('textlist')).end();
		document.body.appendChild(node.dom());
		
		return test("render",function() {
			node.render(['a','b','c','d']);
			eq(node.dom().textContent,'abcd');
			node.render(['b','c','a','d']);
			eq(node.dom().textContent,'bcad');
			
			node.render(['b','a','a','d','a','g']);
			eq(node.dom().textContent,'baadag');
			node.render(['b','g','a','a','d','a']);
			return eq(node.dom().textContent,'bgaada');
		});
	});
});




/***/ }),
/* 45 */
/***/ (function(module, exports, __webpack_require__) {

var __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;//     Underscore.js 1.8.3
//     http://underscorejs.org
//     (c) 2009-2015 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
//     Underscore may be freely distributed under the MIT license.

(function() {

  // Baseline setup
  // --------------

  // Establish the root object, `window` in the browser, or `exports` on the server.
  var root = this;

  // Save the previous value of the `_` variable.
  var previousUnderscore = root._;

  // Save bytes in the minified (but not gzipped) version:
  var ArrayProto = Array.prototype, ObjProto = Object.prototype, FuncProto = Function.prototype;

  // Create quick reference variables for speed access to core prototypes.
  var
    push             = ArrayProto.push,
    slice            = ArrayProto.slice,
    toString         = ObjProto.toString,
    hasOwnProperty   = ObjProto.hasOwnProperty;

  // All **ECMAScript 5** native function implementations that we hope to use
  // are declared here.
  var
    nativeIsArray      = Array.isArray,
    nativeKeys         = Object.keys,
    nativeBind         = FuncProto.bind,
    nativeCreate       = Object.create;

  // Naked function reference for surrogate-prototype-swapping.
  var Ctor = function(){};

  // Create a safe reference to the Underscore object for use below.
  var _ = function(obj) {
    if (obj instanceof _) return obj;
    if (!(this instanceof _)) return new _(obj);
    this._wrapped = obj;
  };

  // Export the Underscore object for **Node.js**, with
  // backwards-compatibility for the old `require()` API. If we're in
  // the browser, add `_` as a global object.
  if (true) {
    if (typeof module !== 'undefined' && module.exports) {
      exports = module.exports = _;
    }
    exports._ = _;
  } else {
    root._ = _;
  }

  // Current version.
  _.VERSION = '1.8.3';

  // Internal function that returns an efficient (for current engines) version
  // of the passed-in callback, to be repeatedly applied in other Underscore
  // functions.
  var optimizeCb = function(func, context, argCount) {
    if (context === void 0) return func;
    switch (argCount == null ? 3 : argCount) {
      case 1: return function(value) {
        return func.call(context, value);
      };
      case 2: return function(value, other) {
        return func.call(context, value, other);
      };
      case 3: return function(value, index, collection) {
        return func.call(context, value, index, collection);
      };
      case 4: return function(accumulator, value, index, collection) {
        return func.call(context, accumulator, value, index, collection);
      };
    }
    return function() {
      return func.apply(context, arguments);
    };
  };

  // A mostly-internal function to generate callbacks that can be applied
  // to each element in a collection, returning the desired result — either
  // identity, an arbitrary callback, a property matcher, or a property accessor.
  var cb = function(value, context, argCount) {
    if (value == null) return _.identity;
    if (_.isFunction(value)) return optimizeCb(value, context, argCount);
    if (_.isObject(value)) return _.matcher(value);
    return _.property(value);
  };
  _.iteratee = function(value, context) {
    return cb(value, context, Infinity);
  };

  // An internal function for creating assigner functions.
  var createAssigner = function(keysFunc, undefinedOnly) {
    return function(obj) {
      var length = arguments.length;
      if (length < 2 || obj == null) return obj;
      for (var index = 1; index < length; index++) {
        var source = arguments[index],
            keys = keysFunc(source),
            l = keys.length;
        for (var i = 0; i < l; i++) {
          var key = keys[i];
          if (!undefinedOnly || obj[key] === void 0) obj[key] = source[key];
        }
      }
      return obj;
    };
  };

  // An internal function for creating a new object that inherits from another.
  var baseCreate = function(prototype) {
    if (!_.isObject(prototype)) return {};
    if (nativeCreate) return nativeCreate(prototype);
    Ctor.prototype = prototype;
    var result = new Ctor;
    Ctor.prototype = null;
    return result;
  };

  var property = function(key) {
    return function(obj) {
      return obj == null ? void 0 : obj[key];
    };
  };

  // Helper for collection methods to determine whether a collection
  // should be iterated as an array or as an object
  // Related: http://people.mozilla.org/~jorendorff/es6-draft.html#sec-tolength
  // Avoids a very nasty iOS 8 JIT bug on ARM-64. #2094
  var MAX_ARRAY_INDEX = Math.pow(2, 53) - 1;
  var getLength = property('length');
  var isArrayLike = function(collection) {
    var length = getLength(collection);
    return typeof length == 'number' && length >= 0 && length <= MAX_ARRAY_INDEX;
  };

  // Collection Functions
  // --------------------

  // The cornerstone, an `each` implementation, aka `forEach`.
  // Handles raw objects in addition to array-likes. Treats all
  // sparse array-likes as if they were dense.
  _.each = _.forEach = function(obj, iteratee, context) {
    iteratee = optimizeCb(iteratee, context);
    var i, length;
    if (isArrayLike(obj)) {
      for (i = 0, length = obj.length; i < length; i++) {
        iteratee(obj[i], i, obj);
      }
    } else {
      var keys = _.keys(obj);
      for (i = 0, length = keys.length; i < length; i++) {
        iteratee(obj[keys[i]], keys[i], obj);
      }
    }
    return obj;
  };

  // Return the results of applying the iteratee to each element.
  _.map = _.collect = function(obj, iteratee, context) {
    iteratee = cb(iteratee, context);
    var keys = !isArrayLike(obj) && _.keys(obj),
        length = (keys || obj).length,
        results = Array(length);
    for (var index = 0; index < length; index++) {
      var currentKey = keys ? keys[index] : index;
      results[index] = iteratee(obj[currentKey], currentKey, obj);
    }
    return results;
  };

  // Create a reducing function iterating left or right.
  function createReduce(dir) {
    // Optimized iterator function as using arguments.length
    // in the main function will deoptimize the, see #1991.
    function iterator(obj, iteratee, memo, keys, index, length) {
      for (; index >= 0 && index < length; index += dir) {
        var currentKey = keys ? keys[index] : index;
        memo = iteratee(memo, obj[currentKey], currentKey, obj);
      }
      return memo;
    }

    return function(obj, iteratee, memo, context) {
      iteratee = optimizeCb(iteratee, context, 4);
      var keys = !isArrayLike(obj) && _.keys(obj),
          length = (keys || obj).length,
          index = dir > 0 ? 0 : length - 1;
      // Determine the initial value if none is provided.
      if (arguments.length < 3) {
        memo = obj[keys ? keys[index] : index];
        index += dir;
      }
      return iterator(obj, iteratee, memo, keys, index, length);
    };
  }

  // **Reduce** builds up a single result from a list of values, aka `inject`,
  // or `foldl`.
  _.reduce = _.foldl = _.inject = createReduce(1);

  // The right-associative version of reduce, also known as `foldr`.
  _.reduceRight = _.foldr = createReduce(-1);

  // Return the first value which passes a truth test. Aliased as `detect`.
  _.find = _.detect = function(obj, predicate, context) {
    var key;
    if (isArrayLike(obj)) {
      key = _.findIndex(obj, predicate, context);
    } else {
      key = _.findKey(obj, predicate, context);
    }
    if (key !== void 0 && key !== -1) return obj[key];
  };

  // Return all the elements that pass a truth test.
  // Aliased as `select`.
  _.filter = _.select = function(obj, predicate, context) {
    var results = [];
    predicate = cb(predicate, context);
    _.each(obj, function(value, index, list) {
      if (predicate(value, index, list)) results.push(value);
    });
    return results;
  };

  // Return all the elements for which a truth test fails.
  _.reject = function(obj, predicate, context) {
    return _.filter(obj, _.negate(cb(predicate)), context);
  };

  // Determine whether all of the elements match a truth test.
  // Aliased as `all`.
  _.every = _.all = function(obj, predicate, context) {
    predicate = cb(predicate, context);
    var keys = !isArrayLike(obj) && _.keys(obj),
        length = (keys || obj).length;
    for (var index = 0; index < length; index++) {
      var currentKey = keys ? keys[index] : index;
      if (!predicate(obj[currentKey], currentKey, obj)) return false;
    }
    return true;
  };

  // Determine if at least one element in the object matches a truth test.
  // Aliased as `any`.
  _.some = _.any = function(obj, predicate, context) {
    predicate = cb(predicate, context);
    var keys = !isArrayLike(obj) && _.keys(obj),
        length = (keys || obj).length;
    for (var index = 0; index < length; index++) {
      var currentKey = keys ? keys[index] : index;
      if (predicate(obj[currentKey], currentKey, obj)) return true;
    }
    return false;
  };

  // Determine if the array or object contains a given item (using `===`).
  // Aliased as `includes` and `include`.
  _.contains = _.includes = _.include = function(obj, item, fromIndex, guard) {
    if (!isArrayLike(obj)) obj = _.values(obj);
    if (typeof fromIndex != 'number' || guard) fromIndex = 0;
    return _.indexOf(obj, item, fromIndex) >= 0;
  };

  // Invoke a method (with arguments) on every item in a collection.
  _.invoke = function(obj, method) {
    var args = slice.call(arguments, 2);
    var isFunc = _.isFunction(method);
    return _.map(obj, function(value) {
      var func = isFunc ? method : value[method];
      return func == null ? func : func.apply(value, args);
    });
  };

  // Convenience version of a common use case of `map`: fetching a property.
  _.pluck = function(obj, key) {
    return _.map(obj, _.property(key));
  };

  // Convenience version of a common use case of `filter`: selecting only objects
  // containing specific `key:value` pairs.
  _.where = function(obj, attrs) {
    return _.filter(obj, _.matcher(attrs));
  };

  // Convenience version of a common use case of `find`: getting the first object
  // containing specific `key:value` pairs.
  _.findWhere = function(obj, attrs) {
    return _.find(obj, _.matcher(attrs));
  };

  // Return the maximum element (or element-based computation).
  _.max = function(obj, iteratee, context) {
    var result = -Infinity, lastComputed = -Infinity,
        value, computed;
    if (iteratee == null && obj != null) {
      obj = isArrayLike(obj) ? obj : _.values(obj);
      for (var i = 0, length = obj.length; i < length; i++) {
        value = obj[i];
        if (value > result) {
          result = value;
        }
      }
    } else {
      iteratee = cb(iteratee, context);
      _.each(obj, function(value, index, list) {
        computed = iteratee(value, index, list);
        if (computed > lastComputed || computed === -Infinity && result === -Infinity) {
          result = value;
          lastComputed = computed;
        }
      });
    }
    return result;
  };

  // Return the minimum element (or element-based computation).
  _.min = function(obj, iteratee, context) {
    var result = Infinity, lastComputed = Infinity,
        value, computed;
    if (iteratee == null && obj != null) {
      obj = isArrayLike(obj) ? obj : _.values(obj);
      for (var i = 0, length = obj.length; i < length; i++) {
        value = obj[i];
        if (value < result) {
          result = value;
        }
      }
    } else {
      iteratee = cb(iteratee, context);
      _.each(obj, function(value, index, list) {
        computed = iteratee(value, index, list);
        if (computed < lastComputed || computed === Infinity && result === Infinity) {
          result = value;
          lastComputed = computed;
        }
      });
    }
    return result;
  };

  // Shuffle a collection, using the modern version of the
  // [Fisher-Yates shuffle](http://en.wikipedia.org/wiki/Fisher–Yates_shuffle).
  _.shuffle = function(obj) {
    var set = isArrayLike(obj) ? obj : _.values(obj);
    var length = set.length;
    var shuffled = Array(length);
    for (var index = 0, rand; index < length; index++) {
      rand = _.random(0, index);
      if (rand !== index) shuffled[index] = shuffled[rand];
      shuffled[rand] = set[index];
    }
    return shuffled;
  };

  // Sample **n** random values from a collection.
  // If **n** is not specified, returns a single random element.
  // The internal `guard` argument allows it to work with `map`.
  _.sample = function(obj, n, guard) {
    if (n == null || guard) {
      if (!isArrayLike(obj)) obj = _.values(obj);
      return obj[_.random(obj.length - 1)];
    }
    return _.shuffle(obj).slice(0, Math.max(0, n));
  };

  // Sort the object's values by a criterion produced by an iteratee.
  _.sortBy = function(obj, iteratee, context) {
    iteratee = cb(iteratee, context);
    return _.pluck(_.map(obj, function(value, index, list) {
      return {
        value: value,
        index: index,
        criteria: iteratee(value, index, list)
      };
    }).sort(function(left, right) {
      var a = left.criteria;
      var b = right.criteria;
      if (a !== b) {
        if (a > b || a === void 0) return 1;
        if (a < b || b === void 0) return -1;
      }
      return left.index - right.index;
    }), 'value');
  };

  // An internal function used for aggregate "group by" operations.
  var group = function(behavior) {
    return function(obj, iteratee, context) {
      var result = {};
      iteratee = cb(iteratee, context);
      _.each(obj, function(value, index) {
        var key = iteratee(value, index, obj);
        behavior(result, value, key);
      });
      return result;
    };
  };

  // Groups the object's values by a criterion. Pass either a string attribute
  // to group by, or a function that returns the criterion.
  _.groupBy = group(function(result, value, key) {
    if (_.has(result, key)) result[key].push(value); else result[key] = [value];
  });

  // Indexes the object's values by a criterion, similar to `groupBy`, but for
  // when you know that your index values will be unique.
  _.indexBy = group(function(result, value, key) {
    result[key] = value;
  });

  // Counts instances of an object that group by a certain criterion. Pass
  // either a string attribute to count by, or a function that returns the
  // criterion.
  _.countBy = group(function(result, value, key) {
    if (_.has(result, key)) result[key]++; else result[key] = 1;
  });

  // Safely create a real, live array from anything iterable.
  _.toArray = function(obj) {
    if (!obj) return [];
    if (_.isArray(obj)) return slice.call(obj);
    if (isArrayLike(obj)) return _.map(obj, _.identity);
    return _.values(obj);
  };

  // Return the number of elements in an object.
  _.size = function(obj) {
    if (obj == null) return 0;
    return isArrayLike(obj) ? obj.length : _.keys(obj).length;
  };

  // Split a collection into two arrays: one whose elements all satisfy the given
  // predicate, and one whose elements all do not satisfy the predicate.
  _.partition = function(obj, predicate, context) {
    predicate = cb(predicate, context);
    var pass = [], fail = [];
    _.each(obj, function(value, key, obj) {
      (predicate(value, key, obj) ? pass : fail).push(value);
    });
    return [pass, fail];
  };

  // Array Functions
  // ---------------

  // Get the first element of an array. Passing **n** will return the first N
  // values in the array. Aliased as `head` and `take`. The **guard** check
  // allows it to work with `_.map`.
  _.first = _.head = _.take = function(array, n, guard) {
    if (array == null) return void 0;
    if (n == null || guard) return array[0];
    return _.initial(array, array.length - n);
  };

  // Returns everything but the last entry of the array. Especially useful on
  // the arguments object. Passing **n** will return all the values in
  // the array, excluding the last N.
  _.initial = function(array, n, guard) {
    return slice.call(array, 0, Math.max(0, array.length - (n == null || guard ? 1 : n)));
  };

  // Get the last element of an array. Passing **n** will return the last N
  // values in the array.
  _.last = function(array, n, guard) {
    if (array == null) return void 0;
    if (n == null || guard) return array[array.length - 1];
    return _.rest(array, Math.max(0, array.length - n));
  };

  // Returns everything but the first entry of the array. Aliased as `tail` and `drop`.
  // Especially useful on the arguments object. Passing an **n** will return
  // the rest N values in the array.
  _.rest = _.tail = _.drop = function(array, n, guard) {
    return slice.call(array, n == null || guard ? 1 : n);
  };

  // Trim out all falsy values from an array.
  _.compact = function(array) {
    return _.filter(array, _.identity);
  };

  // Internal implementation of a recursive `flatten` function.
  var flatten = function(input, shallow, strict, startIndex) {
    var output = [], idx = 0;
    for (var i = startIndex || 0, length = getLength(input); i < length; i++) {
      var value = input[i];
      if (isArrayLike(value) && (_.isArray(value) || _.isArguments(value))) {
        //flatten current level of array or arguments object
        if (!shallow) value = flatten(value, shallow, strict);
        var j = 0, len = value.length;
        output.length += len;
        while (j < len) {
          output[idx++] = value[j++];
        }
      } else if (!strict) {
        output[idx++] = value;
      }
    }
    return output;
  };

  // Flatten out an array, either recursively (by default), or just one level.
  _.flatten = function(array, shallow) {
    return flatten(array, shallow, false);
  };

  // Return a version of the array that does not contain the specified value(s).
  _.without = function(array) {
    return _.difference(array, slice.call(arguments, 1));
  };

  // Produce a duplicate-free version of the array. If the array has already
  // been sorted, you have the option of using a faster algorithm.
  // Aliased as `unique`.
  _.uniq = _.unique = function(array, isSorted, iteratee, context) {
    if (!_.isBoolean(isSorted)) {
      context = iteratee;
      iteratee = isSorted;
      isSorted = false;
    }
    if (iteratee != null) iteratee = cb(iteratee, context);
    var result = [];
    var seen = [];
    for (var i = 0, length = getLength(array); i < length; i++) {
      var value = array[i],
          computed = iteratee ? iteratee(value, i, array) : value;
      if (isSorted) {
        if (!i || seen !== computed) result.push(value);
        seen = computed;
      } else if (iteratee) {
        if (!_.contains(seen, computed)) {
          seen.push(computed);
          result.push(value);
        }
      } else if (!_.contains(result, value)) {
        result.push(value);
      }
    }
    return result;
  };

  // Produce an array that contains the union: each distinct element from all of
  // the passed-in arrays.
  _.union = function() {
    return _.uniq(flatten(arguments, true, true));
  };

  // Produce an array that contains every item shared between all the
  // passed-in arrays.
  _.intersection = function(array) {
    var result = [];
    var argsLength = arguments.length;
    for (var i = 0, length = getLength(array); i < length; i++) {
      var item = array[i];
      if (_.contains(result, item)) continue;
      for (var j = 1; j < argsLength; j++) {
        if (!_.contains(arguments[j], item)) break;
      }
      if (j === argsLength) result.push(item);
    }
    return result;
  };

  // Take the difference between one array and a number of other arrays.
  // Only the elements present in just the first array will remain.
  _.difference = function(array) {
    var rest = flatten(arguments, true, true, 1);
    return _.filter(array, function(value){
      return !_.contains(rest, value);
    });
  };

  // Zip together multiple lists into a single array -- elements that share
  // an index go together.
  _.zip = function() {
    return _.unzip(arguments);
  };

  // Complement of _.zip. Unzip accepts an array of arrays and groups
  // each array's elements on shared indices
  _.unzip = function(array) {
    var length = array && _.max(array, getLength).length || 0;
    var result = Array(length);

    for (var index = 0; index < length; index++) {
      result[index] = _.pluck(array, index);
    }
    return result;
  };

  // Converts lists into objects. Pass either a single array of `[key, value]`
  // pairs, or two parallel arrays of the same length -- one of keys, and one of
  // the corresponding values.
  _.object = function(list, values) {
    var result = {};
    for (var i = 0, length = getLength(list); i < length; i++) {
      if (values) {
        result[list[i]] = values[i];
      } else {
        result[list[i][0]] = list[i][1];
      }
    }
    return result;
  };

  // Generator function to create the findIndex and findLastIndex functions
  function createPredicateIndexFinder(dir) {
    return function(array, predicate, context) {
      predicate = cb(predicate, context);
      var length = getLength(array);
      var index = dir > 0 ? 0 : length - 1;
      for (; index >= 0 && index < length; index += dir) {
        if (predicate(array[index], index, array)) return index;
      }
      return -1;
    };
  }

  // Returns the first index on an array-like that passes a predicate test
  _.findIndex = createPredicateIndexFinder(1);
  _.findLastIndex = createPredicateIndexFinder(-1);

  // Use a comparator function to figure out the smallest index at which
  // an object should be inserted so as to maintain order. Uses binary search.
  _.sortedIndex = function(array, obj, iteratee, context) {
    iteratee = cb(iteratee, context, 1);
    var value = iteratee(obj);
    var low = 0, high = getLength(array);
    while (low < high) {
      var mid = Math.floor((low + high) / 2);
      if (iteratee(array[mid]) < value) low = mid + 1; else high = mid;
    }
    return low;
  };

  // Generator function to create the indexOf and lastIndexOf functions
  function createIndexFinder(dir, predicateFind, sortedIndex) {
    return function(array, item, idx) {
      var i = 0, length = getLength(array);
      if (typeof idx == 'number') {
        if (dir > 0) {
            i = idx >= 0 ? idx : Math.max(idx + length, i);
        } else {
            length = idx >= 0 ? Math.min(idx + 1, length) : idx + length + 1;
        }
      } else if (sortedIndex && idx && length) {
        idx = sortedIndex(array, item);
        return array[idx] === item ? idx : -1;
      }
      if (item !== item) {
        idx = predicateFind(slice.call(array, i, length), _.isNaN);
        return idx >= 0 ? idx + i : -1;
      }
      for (idx = dir > 0 ? i : length - 1; idx >= 0 && idx < length; idx += dir) {
        if (array[idx] === item) return idx;
      }
      return -1;
    };
  }

  // Return the position of the first occurrence of an item in an array,
  // or -1 if the item is not included in the array.
  // If the array is large and already in sort order, pass `true`
  // for **isSorted** to use binary search.
  _.indexOf = createIndexFinder(1, _.findIndex, _.sortedIndex);
  _.lastIndexOf = createIndexFinder(-1, _.findLastIndex);

  // Generate an integer Array containing an arithmetic progression. A port of
  // the native Python `range()` function. See
  // [the Python documentation](http://docs.python.org/library/functions.html#range).
  _.range = function(start, stop, step) {
    if (stop == null) {
      stop = start || 0;
      start = 0;
    }
    step = step || 1;

    var length = Math.max(Math.ceil((stop - start) / step), 0);
    var range = Array(length);

    for (var idx = 0; idx < length; idx++, start += step) {
      range[idx] = start;
    }

    return range;
  };

  // Function (ahem) Functions
  // ------------------

  // Determines whether to execute a function as a constructor
  // or a normal function with the provided arguments
  var executeBound = function(sourceFunc, boundFunc, context, callingContext, args) {
    if (!(callingContext instanceof boundFunc)) return sourceFunc.apply(context, args);
    var self = baseCreate(sourceFunc.prototype);
    var result = sourceFunc.apply(self, args);
    if (_.isObject(result)) return result;
    return self;
  };

  // Create a function bound to a given object (assigning `this`, and arguments,
  // optionally). Delegates to **ECMAScript 5**'s native `Function.bind` if
  // available.
  _.bind = function(func, context) {
    if (nativeBind && func.bind === nativeBind) return nativeBind.apply(func, slice.call(arguments, 1));
    if (!_.isFunction(func)) throw new TypeError('Bind must be called on a function');
    var args = slice.call(arguments, 2);
    var bound = function() {
      return executeBound(func, bound, context, this, args.concat(slice.call(arguments)));
    };
    return bound;
  };

  // Partially apply a function by creating a version that has had some of its
  // arguments pre-filled, without changing its dynamic `this` context. _ acts
  // as a placeholder, allowing any combination of arguments to be pre-filled.
  _.partial = function(func) {
    var boundArgs = slice.call(arguments, 1);
    var bound = function() {
      var position = 0, length = boundArgs.length;
      var args = Array(length);
      for (var i = 0; i < length; i++) {
        args[i] = boundArgs[i] === _ ? arguments[position++] : boundArgs[i];
      }
      while (position < arguments.length) args.push(arguments[position++]);
      return executeBound(func, bound, this, this, args);
    };
    return bound;
  };

  // Bind a number of an object's methods to that object. Remaining arguments
  // are the method names to be bound. Useful for ensuring that all callbacks
  // defined on an object belong to it.
  _.bindAll = function(obj) {
    var i, length = arguments.length, key;
    if (length <= 1) throw new Error('bindAll must be passed function names');
    for (i = 1; i < length; i++) {
      key = arguments[i];
      obj[key] = _.bind(obj[key], obj);
    }
    return obj;
  };

  // Memoize an expensive function by storing its results.
  _.memoize = function(func, hasher) {
    var memoize = function(key) {
      var cache = memoize.cache;
      var address = '' + (hasher ? hasher.apply(this, arguments) : key);
      if (!_.has(cache, address)) cache[address] = func.apply(this, arguments);
      return cache[address];
    };
    memoize.cache = {};
    return memoize;
  };

  // Delays a function for the given number of milliseconds, and then calls
  // it with the arguments supplied.
  _.delay = function(func, wait) {
    var args = slice.call(arguments, 2);
    return setTimeout(function(){
      return func.apply(null, args);
    }, wait);
  };

  // Defers a function, scheduling it to run after the current call stack has
  // cleared.
  _.defer = _.partial(_.delay, _, 1);

  // Returns a function, that, when invoked, will only be triggered at most once
  // during a given window of time. Normally, the throttled function will run
  // as much as it can, without ever going more than once per `wait` duration;
  // but if you'd like to disable the execution on the leading edge, pass
  // `{leading: false}`. To disable execution on the trailing edge, ditto.
  _.throttle = function(func, wait, options) {
    var context, args, result;
    var timeout = null;
    var previous = 0;
    if (!options) options = {};
    var later = function() {
      previous = options.leading === false ? 0 : _.now();
      timeout = null;
      result = func.apply(context, args);
      if (!timeout) context = args = null;
    };
    return function() {
      var now = _.now();
      if (!previous && options.leading === false) previous = now;
      var remaining = wait - (now - previous);
      context = this;
      args = arguments;
      if (remaining <= 0 || remaining > wait) {
        if (timeout) {
          clearTimeout(timeout);
          timeout = null;
        }
        previous = now;
        result = func.apply(context, args);
        if (!timeout) context = args = null;
      } else if (!timeout && options.trailing !== false) {
        timeout = setTimeout(later, remaining);
      }
      return result;
    };
  };

  // Returns a function, that, as long as it continues to be invoked, will not
  // be triggered. The function will be called after it stops being called for
  // N milliseconds. If `immediate` is passed, trigger the function on the
  // leading edge, instead of the trailing.
  _.debounce = function(func, wait, immediate) {
    var timeout, args, context, timestamp, result;

    var later = function() {
      var last = _.now() - timestamp;

      if (last < wait && last >= 0) {
        timeout = setTimeout(later, wait - last);
      } else {
        timeout = null;
        if (!immediate) {
          result = func.apply(context, args);
          if (!timeout) context = args = null;
        }
      }
    };

    return function() {
      context = this;
      args = arguments;
      timestamp = _.now();
      var callNow = immediate && !timeout;
      if (!timeout) timeout = setTimeout(later, wait);
      if (callNow) {
        result = func.apply(context, args);
        context = args = null;
      }

      return result;
    };
  };

  // Returns the first function passed as an argument to the second,
  // allowing you to adjust arguments, run code before and after, and
  // conditionally execute the original function.
  _.wrap = function(func, wrapper) {
    return _.partial(wrapper, func);
  };

  // Returns a negated version of the passed-in predicate.
  _.negate = function(predicate) {
    return function() {
      return !predicate.apply(this, arguments);
    };
  };

  // Returns a function that is the composition of a list of functions, each
  // consuming the return value of the function that follows.
  _.compose = function() {
    var args = arguments;
    var start = args.length - 1;
    return function() {
      var i = start;
      var result = args[start].apply(this, arguments);
      while (i--) result = args[i].call(this, result);
      return result;
    };
  };

  // Returns a function that will only be executed on and after the Nth call.
  _.after = function(times, func) {
    return function() {
      if (--times < 1) {
        return func.apply(this, arguments);
      }
    };
  };

  // Returns a function that will only be executed up to (but not including) the Nth call.
  _.before = function(times, func) {
    var memo;
    return function() {
      if (--times > 0) {
        memo = func.apply(this, arguments);
      }
      if (times <= 1) func = null;
      return memo;
    };
  };

  // Returns a function that will be executed at most one time, no matter how
  // often you call it. Useful for lazy initialization.
  _.once = _.partial(_.before, 2);

  // Object Functions
  // ----------------

  // Keys in IE < 9 that won't be iterated by `for key in ...` and thus missed.
  var hasEnumBug = !{toString: null}.propertyIsEnumerable('toString');
  var nonEnumerableProps = ['valueOf', 'isPrototypeOf', 'toString',
                      'propertyIsEnumerable', 'hasOwnProperty', 'toLocaleString'];

  function collectNonEnumProps(obj, keys) {
    var nonEnumIdx = nonEnumerableProps.length;
    var constructor = obj.constructor;
    var proto = (_.isFunction(constructor) && constructor.prototype) || ObjProto;

    // Constructor is a special case.
    var prop = 'constructor';
    if (_.has(obj, prop) && !_.contains(keys, prop)) keys.push(prop);

    while (nonEnumIdx--) {
      prop = nonEnumerableProps[nonEnumIdx];
      if (prop in obj && obj[prop] !== proto[prop] && !_.contains(keys, prop)) {
        keys.push(prop);
      }
    }
  }

  // Retrieve the names of an object's own properties.
  // Delegates to **ECMAScript 5**'s native `Object.keys`
  _.keys = function(obj) {
    if (!_.isObject(obj)) return [];
    if (nativeKeys) return nativeKeys(obj);
    var keys = [];
    for (var key in obj) if (_.has(obj, key)) keys.push(key);
    // Ahem, IE < 9.
    if (hasEnumBug) collectNonEnumProps(obj, keys);
    return keys;
  };

  // Retrieve all the property names of an object.
  _.allKeys = function(obj) {
    if (!_.isObject(obj)) return [];
    var keys = [];
    for (var key in obj) keys.push(key);
    // Ahem, IE < 9.
    if (hasEnumBug) collectNonEnumProps(obj, keys);
    return keys;
  };

  // Retrieve the values of an object's properties.
  _.values = function(obj) {
    var keys = _.keys(obj);
    var length = keys.length;
    var values = Array(length);
    for (var i = 0; i < length; i++) {
      values[i] = obj[keys[i]];
    }
    return values;
  };

  // Returns the results of applying the iteratee to each element of the object
  // In contrast to _.map it returns an object
  _.mapObject = function(obj, iteratee, context) {
    iteratee = cb(iteratee, context);
    var keys =  _.keys(obj),
          length = keys.length,
          results = {},
          currentKey;
      for (var index = 0; index < length; index++) {
        currentKey = keys[index];
        results[currentKey] = iteratee(obj[currentKey], currentKey, obj);
      }
      return results;
  };

  // Convert an object into a list of `[key, value]` pairs.
  _.pairs = function(obj) {
    var keys = _.keys(obj);
    var length = keys.length;
    var pairs = Array(length);
    for (var i = 0; i < length; i++) {
      pairs[i] = [keys[i], obj[keys[i]]];
    }
    return pairs;
  };

  // Invert the keys and values of an object. The values must be serializable.
  _.invert = function(obj) {
    var result = {};
    var keys = _.keys(obj);
    for (var i = 0, length = keys.length; i < length; i++) {
      result[obj[keys[i]]] = keys[i];
    }
    return result;
  };

  // Return a sorted list of the function names available on the object.
  // Aliased as `methods`
  _.functions = _.methods = function(obj) {
    var names = [];
    for (var key in obj) {
      if (_.isFunction(obj[key])) names.push(key);
    }
    return names.sort();
  };

  // Extend a given object with all the properties in passed-in object(s).
  _.extend = createAssigner(_.allKeys);

  // Assigns a given object with all the own properties in the passed-in object(s)
  // (https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object/assign)
  _.extendOwn = _.assign = createAssigner(_.keys);

  // Returns the first key on an object that passes a predicate test
  _.findKey = function(obj, predicate, context) {
    predicate = cb(predicate, context);
    var keys = _.keys(obj), key;
    for (var i = 0, length = keys.length; i < length; i++) {
      key = keys[i];
      if (predicate(obj[key], key, obj)) return key;
    }
  };

  // Return a copy of the object only containing the whitelisted properties.
  _.pick = function(object, oiteratee, context) {
    var result = {}, obj = object, iteratee, keys;
    if (obj == null) return result;
    if (_.isFunction(oiteratee)) {
      keys = _.allKeys(obj);
      iteratee = optimizeCb(oiteratee, context);
    } else {
      keys = flatten(arguments, false, false, 1);
      iteratee = function(value, key, obj) { return key in obj; };
      obj = Object(obj);
    }
    for (var i = 0, length = keys.length; i < length; i++) {
      var key = keys[i];
      var value = obj[key];
      if (iteratee(value, key, obj)) result[key] = value;
    }
    return result;
  };

   // Return a copy of the object without the blacklisted properties.
  _.omit = function(obj, iteratee, context) {
    if (_.isFunction(iteratee)) {
      iteratee = _.negate(iteratee);
    } else {
      var keys = _.map(flatten(arguments, false, false, 1), String);
      iteratee = function(value, key) {
        return !_.contains(keys, key);
      };
    }
    return _.pick(obj, iteratee, context);
  };

  // Fill in a given object with default properties.
  _.defaults = createAssigner(_.allKeys, true);

  // Creates an object that inherits from the given prototype object.
  // If additional properties are provided then they will be added to the
  // created object.
  _.create = function(prototype, props) {
    var result = baseCreate(prototype);
    if (props) _.extendOwn(result, props);
    return result;
  };

  // Create a (shallow-cloned) duplicate of an object.
  _.clone = function(obj) {
    if (!_.isObject(obj)) return obj;
    return _.isArray(obj) ? obj.slice() : _.extend({}, obj);
  };

  // Invokes interceptor with the obj, and then returns obj.
  // The primary purpose of this method is to "tap into" a method chain, in
  // order to perform operations on intermediate results within the chain.
  _.tap = function(obj, interceptor) {
    interceptor(obj);
    return obj;
  };

  // Returns whether an object has a given set of `key:value` pairs.
  _.isMatch = function(object, attrs) {
    var keys = _.keys(attrs), length = keys.length;
    if (object == null) return !length;
    var obj = Object(object);
    for (var i = 0; i < length; i++) {
      var key = keys[i];
      if (attrs[key] !== obj[key] || !(key in obj)) return false;
    }
    return true;
  };


  // Internal recursive comparison function for `isEqual`.
  var eq = function(a, b, aStack, bStack) {
    // Identical objects are equal. `0 === -0`, but they aren't identical.
    // See the [Harmony `egal` proposal](http://wiki.ecmascript.org/doku.php?id=harmony:egal).
    if (a === b) return a !== 0 || 1 / a === 1 / b;
    // A strict comparison is necessary because `null == undefined`.
    if (a == null || b == null) return a === b;
    // Unwrap any wrapped objects.
    if (a instanceof _) a = a._wrapped;
    if (b instanceof _) b = b._wrapped;
    // Compare `[[Class]]` names.
    var className = toString.call(a);
    if (className !== toString.call(b)) return false;
    switch (className) {
      // Strings, numbers, regular expressions, dates, and booleans are compared by value.
      case '[object RegExp]':
      // RegExps are coerced to strings for comparison (Note: '' + /a/i === '/a/i')
      case '[object String]':
        // Primitives and their corresponding object wrappers are equivalent; thus, `"5"` is
        // equivalent to `new String("5")`.
        return '' + a === '' + b;
      case '[object Number]':
        // `NaN`s are equivalent, but non-reflexive.
        // Object(NaN) is equivalent to NaN
        if (+a !== +a) return +b !== +b;
        // An `egal` comparison is performed for other numeric values.
        return +a === 0 ? 1 / +a === 1 / b : +a === +b;
      case '[object Date]':
      case '[object Boolean]':
        // Coerce dates and booleans to numeric primitive values. Dates are compared by their
        // millisecond representations. Note that invalid dates with millisecond representations
        // of `NaN` are not equivalent.
        return +a === +b;
    }

    var areArrays = className === '[object Array]';
    if (!areArrays) {
      if (typeof a != 'object' || typeof b != 'object') return false;

      // Objects with different constructors are not equivalent, but `Object`s or `Array`s
      // from different frames are.
      var aCtor = a.constructor, bCtor = b.constructor;
      if (aCtor !== bCtor && !(_.isFunction(aCtor) && aCtor instanceof aCtor &&
                               _.isFunction(bCtor) && bCtor instanceof bCtor)
                          && ('constructor' in a && 'constructor' in b)) {
        return false;
      }
    }
    // Assume equality for cyclic structures. The algorithm for detecting cyclic
    // structures is adapted from ES 5.1 section 15.12.3, abstract operation `JO`.

    // Initializing stack of traversed objects.
    // It's done here since we only need them for objects and arrays comparison.
    aStack = aStack || [];
    bStack = bStack || [];
    var length = aStack.length;
    while (length--) {
      // Linear search. Performance is inversely proportional to the number of
      // unique nested structures.
      if (aStack[length] === a) return bStack[length] === b;
    }

    // Add the first object to the stack of traversed objects.
    aStack.push(a);
    bStack.push(b);

    // Recursively compare objects and arrays.
    if (areArrays) {
      // Compare array lengths to determine if a deep comparison is necessary.
      length = a.length;
      if (length !== b.length) return false;
      // Deep compare the contents, ignoring non-numeric properties.
      while (length--) {
        if (!eq(a[length], b[length], aStack, bStack)) return false;
      }
    } else {
      // Deep compare objects.
      var keys = _.keys(a), key;
      length = keys.length;
      // Ensure that both objects contain the same number of properties before comparing deep equality.
      if (_.keys(b).length !== length) return false;
      while (length--) {
        // Deep compare each member
        key = keys[length];
        if (!(_.has(b, key) && eq(a[key], b[key], aStack, bStack))) return false;
      }
    }
    // Remove the first object from the stack of traversed objects.
    aStack.pop();
    bStack.pop();
    return true;
  };

  // Perform a deep comparison to check if two objects are equal.
  _.isEqual = function(a, b) {
    return eq(a, b);
  };

  // Is a given array, string, or object empty?
  // An "empty" object has no enumerable own-properties.
  _.isEmpty = function(obj) {
    if (obj == null) return true;
    if (isArrayLike(obj) && (_.isArray(obj) || _.isString(obj) || _.isArguments(obj))) return obj.length === 0;
    return _.keys(obj).length === 0;
  };

  // Is a given value a DOM element?
  _.isElement = function(obj) {
    return !!(obj && obj.nodeType === 1);
  };

  // Is a given value an array?
  // Delegates to ECMA5's native Array.isArray
  _.isArray = nativeIsArray || function(obj) {
    return toString.call(obj) === '[object Array]';
  };

  // Is a given variable an object?
  _.isObject = function(obj) {
    var type = typeof obj;
    return type === 'function' || type === 'object' && !!obj;
  };

  // Add some isType methods: isArguments, isFunction, isString, isNumber, isDate, isRegExp, isError.
  _.each(['Arguments', 'Function', 'String', 'Number', 'Date', 'RegExp', 'Error'], function(name) {
    _['is' + name] = function(obj) {
      return toString.call(obj) === '[object ' + name + ']';
    };
  });

  // Define a fallback version of the method in browsers (ahem, IE < 9), where
  // there isn't any inspectable "Arguments" type.
  if (!_.isArguments(arguments)) {
    _.isArguments = function(obj) {
      return _.has(obj, 'callee');
    };
  }

  // Optimize `isFunction` if appropriate. Work around some typeof bugs in old v8,
  // IE 11 (#1621), and in Safari 8 (#1929).
  if (typeof /./ != 'function' && typeof Int8Array != 'object') {
    _.isFunction = function(obj) {
      return typeof obj == 'function' || false;
    };
  }

  // Is a given object a finite number?
  _.isFinite = function(obj) {
    return isFinite(obj) && !isNaN(parseFloat(obj));
  };

  // Is the given value `NaN`? (NaN is the only number which does not equal itself).
  _.isNaN = function(obj) {
    return _.isNumber(obj) && obj !== +obj;
  };

  // Is a given value a boolean?
  _.isBoolean = function(obj) {
    return obj === true || obj === false || toString.call(obj) === '[object Boolean]';
  };

  // Is a given value equal to null?
  _.isNull = function(obj) {
    return obj === null;
  };

  // Is a given variable undefined?
  _.isUndefined = function(obj) {
    return obj === void 0;
  };

  // Shortcut function for checking if an object has a given property directly
  // on itself (in other words, not on a prototype).
  _.has = function(obj, key) {
    return obj != null && hasOwnProperty.call(obj, key);
  };

  // Utility Functions
  // -----------------

  // Run Underscore.js in *noConflict* mode, returning the `_` variable to its
  // previous owner. Returns a reference to the Underscore object.
  _.noConflict = function() {
    root._ = previousUnderscore;
    return this;
  };

  // Keep the identity function around for default iteratees.
  _.identity = function(value) {
    return value;
  };

  // Predicate-generating functions. Often useful outside of Underscore.
  _.constant = function(value) {
    return function() {
      return value;
    };
  };

  _.noop = function(){};

  _.property = property;

  // Generates a function for a given object that returns a given property.
  _.propertyOf = function(obj) {
    return obj == null ? function(){} : function(key) {
      return obj[key];
    };
  };

  // Returns a predicate for checking whether an object has a given set of
  // `key:value` pairs.
  _.matcher = _.matches = function(attrs) {
    attrs = _.extendOwn({}, attrs);
    return function(obj) {
      return _.isMatch(obj, attrs);
    };
  };

  // Run a function **n** times.
  _.times = function(n, iteratee, context) {
    var accum = Array(Math.max(0, n));
    iteratee = optimizeCb(iteratee, context, 1);
    for (var i = 0; i < n; i++) accum[i] = iteratee(i);
    return accum;
  };

  // Return a random integer between min and max (inclusive).
  _.random = function(min, max) {
    if (max == null) {
      max = min;
      min = 0;
    }
    return min + Math.floor(Math.random() * (max - min + 1));
  };

  // A (possibly faster) way to get the current timestamp as an integer.
  _.now = Date.now || function() {
    return new Date().getTime();
  };

   // List of HTML entities for escaping.
  var escapeMap = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#x27;',
    '`': '&#x60;'
  };
  var unescapeMap = _.invert(escapeMap);

  // Functions for escaping and unescaping strings to/from HTML interpolation.
  var createEscaper = function(map) {
    var escaper = function(match) {
      return map[match];
    };
    // Regexes for identifying a key that needs to be escaped
    var source = '(?:' + _.keys(map).join('|') + ')';
    var testRegexp = RegExp(source);
    var replaceRegexp = RegExp(source, 'g');
    return function(string) {
      string = string == null ? '' : '' + string;
      return testRegexp.test(string) ? string.replace(replaceRegexp, escaper) : string;
    };
  };
  _.escape = createEscaper(escapeMap);
  _.unescape = createEscaper(unescapeMap);

  // If the value of the named `property` is a function then invoke it with the
  // `object` as context; otherwise, return it.
  _.result = function(object, property, fallback) {
    var value = object == null ? void 0 : object[property];
    if (value === void 0) {
      value = fallback;
    }
    return _.isFunction(value) ? value.call(object) : value;
  };

  // Generate a unique integer id (unique within the entire client session).
  // Useful for temporary DOM ids.
  var idCounter = 0;
  _.uniqueId = function(prefix) {
    var id = ++idCounter + '';
    return prefix ? prefix + id : id;
  };

  // By default, Underscore uses ERB-style template delimiters, change the
  // following template settings to use alternative delimiters.
  _.templateSettings = {
    evaluate    : /<%([\s\S]+?)%>/g,
    interpolate : /<%=([\s\S]+?)%>/g,
    escape      : /<%-([\s\S]+?)%>/g
  };

  // When customizing `templateSettings`, if you don't want to define an
  // interpolation, evaluation or escaping regex, we need one that is
  // guaranteed not to match.
  var noMatch = /(.)^/;

  // Certain characters need to be escaped so that they can be put into a
  // string literal.
  var escapes = {
    "'":      "'",
    '\\':     '\\',
    '\r':     'r',
    '\n':     'n',
    '\u2028': 'u2028',
    '\u2029': 'u2029'
  };

  var escaper = /\\|'|\r|\n|\u2028|\u2029/g;

  var escapeChar = function(match) {
    return '\\' + escapes[match];
  };

  // JavaScript micro-templating, similar to John Resig's implementation.
  // Underscore templating handles arbitrary delimiters, preserves whitespace,
  // and correctly escapes quotes within interpolated code.
  // NB: `oldSettings` only exists for backwards compatibility.
  _.template = function(text, settings, oldSettings) {
    if (!settings && oldSettings) settings = oldSettings;
    settings = _.defaults({}, settings, _.templateSettings);

    // Combine delimiters into one regular expression via alternation.
    var matcher = RegExp([
      (settings.escape || noMatch).source,
      (settings.interpolate || noMatch).source,
      (settings.evaluate || noMatch).source
    ].join('|') + '|$', 'g');

    // Compile the template source, escaping string literals appropriately.
    var index = 0;
    var source = "__p+='";
    text.replace(matcher, function(match, escape, interpolate, evaluate, offset) {
      source += text.slice(index, offset).replace(escaper, escapeChar);
      index = offset + match.length;

      if (escape) {
        source += "'+\n((__t=(" + escape + "))==null?'':_.escape(__t))+\n'";
      } else if (interpolate) {
        source += "'+\n((__t=(" + interpolate + "))==null?'':__t)+\n'";
      } else if (evaluate) {
        source += "';\n" + evaluate + "\n__p+='";
      }

      // Adobe VMs need the match returned to produce the correct offest.
      return match;
    });
    source += "';\n";

    // If a variable is not specified, place data values in local scope.
    if (!settings.variable) source = 'with(obj||{}){\n' + source + '}\n';

    source = "var __t,__p='',__j=Array.prototype.join," +
      "print=function(){__p+=__j.call(arguments,'');};\n" +
      source + 'return __p;\n';

    try {
      var render = new Function(settings.variable || 'obj', '_', source);
    } catch (e) {
      e.source = source;
      throw e;
    }

    var template = function(data) {
      return render.call(this, data, _);
    };

    // Provide the compiled source as a convenience for precompilation.
    var argument = settings.variable || 'obj';
    template.source = 'function(' + argument + '){\n' + source + '}';

    return template;
  };

  // Add a "chain" function. Start chaining a wrapped Underscore object.
  _.chain = function(obj) {
    var instance = _(obj);
    instance._chain = true;
    return instance;
  };

  // OOP
  // ---------------
  // If Underscore is called as a function, it returns a wrapped object that
  // can be used OO-style. This wrapper holds altered versions of all the
  // underscore functions. Wrapped objects may be chained.

  // Helper function to continue chaining intermediate results.
  var result = function(instance, obj) {
    return instance._chain ? _(obj).chain() : obj;
  };

  // Add your own custom functions to the Underscore object.
  _.mixin = function(obj) {
    _.each(_.functions(obj), function(name) {
      var func = _[name] = obj[name];
      _.prototype[name] = function() {
        var args = [this._wrapped];
        push.apply(args, arguments);
        return result(this, func.apply(_, args));
      };
    });
  };

  // Add all of the Underscore functions to the wrapper object.
  _.mixin(_);

  // Add all mutator Array functions to the wrapper.
  _.each(['pop', 'push', 'reverse', 'shift', 'sort', 'splice', 'unshift'], function(name) {
    var method = ArrayProto[name];
    _.prototype[name] = function() {
      var obj = this._wrapped;
      method.apply(obj, arguments);
      if ((name === 'shift' || name === 'splice') && obj.length === 0) delete obj[0];
      return result(this, obj);
    };
  });

  // Add all accessor Array functions to the wrapper.
  _.each(['concat', 'join', 'slice'], function(name) {
    var method = ArrayProto[name];
    _.prototype[name] = function() {
      return result(this, method.apply(this._wrapped, arguments));
    };
  });

  // Extracts the result from a wrapped and chained object.
  _.prototype.value = function() {
    return this._wrapped;
  };

  // Provide unwrapping proxy for some methods used in engine operations
  // such as arithmetic and JSON stringification.
  _.prototype.valueOf = _.prototype.toJSON = _.prototype.value;

  _.prototype.toString = function() {
    return '' + this._wrapped;
  };

  // AMD registration happens at the end for compatibility with AMD loaders
  // that may not enforce next-turn semantics on modules. Even though general
  // practice for AMD registration is to be anonymous, underscore registers
  // as a named module because, like jQuery, it is a base library that is
  // popular enough to be bundled in a third party lib, but not be part of
  // an AMD load request. Those cases could generate an error when an
  // anonymous define() is called outside of a loader request.
  if (true) {
    !(__WEBPACK_AMD_DEFINE_ARRAY__ = [], __WEBPACK_AMD_DEFINE_RESULT__ = function() {
      return _;
    }.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__),
				__WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));
  }
}.call(this));


/***/ }),
/* 46 */
/***/ (function(module, exports, __webpack_require__) {

var Imba = __webpack_require__(0), _1 = Imba.createElement;
// to run these tests, simply open the imbadir/test/dom.html in your browser and
// open the console / developer tools.

// externs;

describe("Tags - SVG",function() {
	
	return test("basics",function() {
		var t0;
		var item = (t0 = (t0=_1('svg:svg')).setContent([
			_1('svg:g',t0.$,0,t0),
			_1('svg:circle',t0.$,1,t0).set('r',20)
		],2)).end((
			t0.$[0].end(),
			t0.$[1].end()
		,true));
		
		Imba.root().appendChild(item);
		
		try {
			(_1('svg:div')).end();
			eq(1,0);
		} catch (e) {
			true;
		};
		
		ok(item.dom() instanceof SVGElement);
		return ok(((_1('svg:circle')).end()).dom() instanceof SVGCircleElement);
	});
});


/***/ }),
/* 47 */
/***/ (function(module, exports, __webpack_require__) {

var Imba = __webpack_require__(0), _1 = Imba.createElement;
// externs;

describe("HTML",function() {
	
	return describe("select",function() {
		
		return test("automatic value",function() {
			var t0;
			var el = (t0 = (t0=_1('select')).setContent([
				_1('option',t0.$,0,t0).setText("a"),
				_1('option',t0.$,1,t0).setText("b"),
				_1('option',t0.$,2,t0).setText("c")
			],2)).end();
			
			return eq(el.value(),"a");
		});
		
		// disable this for now
		// test "setting value" do
		// 	var el = <select value="c">
		// 		<option> "a"
		// 		<option> "b"
		// 		<option> "c"
		// 	eq el.value, "c"
	});
});



/***/ }),
/* 48 */
/***/ (function(module, exports, __webpack_require__) {

function iter$(a){ return a ? (a.toArray ? a.toArray() : a) : []; };
var Imba = __webpack_require__(0), _2 = Imba.createTagList, _1 = Imba.createElement;
// externs;

Imba.defineTag('xul', 'ul');
Imba.defineTag('xno');

Imba.defineTag('wraps', function(tag){
	
	tag.prototype.render = function (){
		return this.$open(0).setChildren(
			// <div>
			// <h2> "content of template:"
			this.template()
		,3).synced();
	};
});

AA = [1,2,3,4,5];
TT = (t0 = (t0=_1('div')).setTemplate(function() {
	var $ = this.$, t0;
	return Imba.static([
		($[0] || _1('ul',$,0,t0).flag('x').setContent([
			_1('li',$,1,0).setText("Hello"),
			_1('li',$,2,0),
			_1('li',$,3,0).setContent([
				t1 = (t1=_1('xul',$,4,3)),
				_1('xno',$,5,3),
				t1 = (t1=_1('wraps',$,6,3))
			],2)
		],2)).end((
			$[2].setContent(Date.now(),3).end(),
			$[3].end((
				$[4].setTemplate(function() {
					var $1 = this.$, t1;
					return Imba.static([
						($1[0] || _1('li',$1,0,t1).setText("Inner")),
						($1[1] || _1('li',$1,1,t1)).setContent(Date.now(),3).end()
					],2,1);
				}).end(),
				$[5].setTemplate(function() {
					var $1 = this.$;
					return this.$open(0).dataset('stamp',Date.now()).setChildren([
						$1[0] || _1('li',$1,0,this).setText("Inner"),
						$1[1] || _1('li',$1,1,this),
						(function($0) {
							for (let i = 0, items = iter$(AA), len = $0.taglen = items.length; i < len; i++) {
								($0[i] || _1('li',$0,i)).setContent(items[i],3).end();
							};return $0;
						})($1[2] || _2($1,2))
					],1).synced();
				}).end(),
				$[6].setTemplate(function() {
					var $1 = this.$, t1;
					return Imba.static([
						($1[0] || _1('div',$1,0,t1)).setText("This is inside " + (Date.now())).end(),
						(function($0) {
							for (let i = 0, items = iter$(AA), len = $0.taglen = items.length; i < len; i++) {
								($0[i] || _1('div',$0,i)).setContent(items[i],3).end();
							};return $0;
						})($1[1] || _2($1,1,6))
					],1,1);
				}).end()
			,true))
		,true)),
		($[7] || _1('span',$,7,t0))
	],2,1);
})).end();

Imba.defineTag('hello', function(tag){
	
	tag.prototype.render = function (){
		var $ = this.$;
		return this.$open(0).setChildren(
			$[0] || _1('div',$,0,this)
		,2).synced((
			$[0].setContent([
				$[1] || _1('h2',$,1,0).setText("content of template:"),
				$[2] || _1('div',$,2,0),
				(function($0) {
					for (let i = 0, items = iter$(AA), len = $0.taglen = items.length; i < len; i++) {
						($0[i] || _1('div',$0,i)).setContent(items[i],3).end();
					};return $0;
				})($[3] || _2($,3,0))
			],1).end((
				$[2].setText("This is inside " + (Date.now())).end()
			,true))
		,true));
	};
});

HE = (_1('hello')).end();
document.body.appendChild(TT.dom());
document.body.appendChild(HE.dom());


/***/ }),
/* 49 */
/***/ (function(module, exports, __webpack_require__) {

var Imba = __webpack_require__(0), _1 = Imba.createElement;
// externs;

var value = null;
var counter = 0;
var emits = [];

var store = {
	title: "Something",
	counter: 0,
	update: function(val) { if(val === undefined) val = true;
	return value = val; },
	inc: function() {
		this.counter++;
		return counter++;
	},
	
	reset: function() {
		emits = [];
		store.counter = counter = 0;
		return value = null;
	},
	
	a: function() { return emits.push('a'); },
	b: function() { return emits.push('b'); },
	c: function() { return emits.push('c'); },
	d: function() { return emits.push('d'); },
	arg: function() { var $0 = arguments, i = $0.length;
	var args = new Array(i>0 ? i : 0);
	while(i>0) args[i-1] = $0[--i];
	return emits.push.apply(emits,args); },
	dataAction: function() { return emits.push(this); }
};

Imba.extendTag('element', function(tag){
	tag.prototype.ref = function(v){ return this._ref; }
	tag.prototype.setRef = function(v){ this._ref = v; return this; };
	
	tag.prototype.click = function (o){
		if(o === undefined) o = {};
		return this.dispatch('click',o);
	};
	
	tag.prototype.on = function (){
		var $0 = arguments, i = $0.length;
		var params = new Array(i>0 ? i : 0);
		while(i>0) params[i-1] = $0[--i];
		this._on_ || (this._on_ = []);
		this._on_[0] = params;
		return this;
	};
	
	tag.prototype.dispatch = function (name,opts){
		if(opts === undefined) opts = {};
		emits = []; // reset emits every time
		let type = MouseEvent;
		let desc = {
			bubbles: true,
			cancelable: true
		};
		for (let v, i = 0, keys = Object.keys(opts), l = keys.length, k; i < l; i++){
			k = keys[i];v = opts[k];desc[k] = v;
		};
		let event = new type(name,desc);
		this.dom().dispatchEvent(event);
		return emits;
	};
	
	tag.prototype.mark = function (){
		var $0 = arguments, i = $0.length;
		var params = new Array(i>0 ? i : 0);
		while(i>0) params[i-1] = $0[--i];
		if (params[0] instanceof Imba.Event) {
			return emits.push(this._ref);
		} else {
			return emits.push.apply(emits,params);
		};
	};
});

var Custom = Imba.defineTag('Custom', function(tag){
	tag.prototype.meth = function (){
		return emits.push('Custom');
	};
});

var Example = Imba.defineTag('Example', function(tag){
	
	tag.prototype.meth = function (){
		return emits.push('Example');
	};
	
	tag.prototype.emeth = function (){
		return emits.push('Example');
	};
	
	tag.prototype.ontap = function (){
		return emits.push('tapa');
	};
	
	tag.prototype.render = function (){
		var $ = this.$, t0, t1;
		return this.$open(0).setChildren($.$ = $.$ || [
			"A",
			t0 = this._b = this._b||(t0=_1('div',this)).flag('b').setRef('b').setContent([
				"B",
				t1 = this._c = this._c||(t1=_1(Custom,t0)).flag('c').setRef('c').setContent([
					"C",
					this._d = this._d||_1('div',t1).flag('d').setRef('d').setText("D")
				],2)
			],2)
		],2).synced((
			this._b.end((
				this._c.end()
			,true))
		,true));
	};
	
	tag.prototype.tagAction = function (){
		emits.push(this);
		return this;
	};
	
	tag.prototype.testModifiers = function (){
		
		// test self
		this._c.on('tap','mark');
		eq(this._d.click(),['c']);
		
		this._c.on('tap','self','mark');
		eq(this._d.click(),['tapa']);
		
		this._c.on('tap','emeth');
		eq(this._d.click(),['Example']);
		
		eq(this._b.on('tap','mark').click(),['b']);
		eq(this._b.on('tap',['mark',1,2]).click(),[1,2]);
		
		// fall through
		eq(this._b.on('tap','bubble','mark').click(),['b','tapa']);
		
		// alt modifier
		eq(this._b.on('tap','alt','mark').click(),['tapa']);
		eq(this._b.on('tap','stop','alt','mark').click(),[]);
		eq(this._b.on('tap','stop','alt',['mark',true]).click({altKey: true}),[true]);
		eq(this._b.on('tap','mark').click(),['b']);
		
		return this;
	};
});

describe("Tags - Events",function() {
	var node = (_1(Example)).setData(store).end();
	document.body.appendChild(node.dom());
	return test("modifiers",function() { return node.testModifiers(); });
	// test "arguments" do node.testArguments
});






/***/ })
/******/ ]);