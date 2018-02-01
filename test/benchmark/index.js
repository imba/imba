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
/******/ 	return __webpack_require__(__webpack_require__.s = 2);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports) {

/*
Imba is the namespace for all runtime related utilities
@namespace
*/

var Imba = {VERSION: '1.3.0-beta.1'};

/*
True if running in client environment.
@return {bool}
*/

Imba.isClient = function (){
	return true;
};

/*
True if running in server environment.
@return {bool}
*/

Imba.isServer = function (){
	return false;
};

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

Imba.toCamelCase = function (str){
	if (str.indexOf('-') >= 0) {
		return str.replace(dashRegex,function(m) { return m.charAt(1).toUpperCase(); });
	} else {
		return str;
	};
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
	if (scope.defineAttribute) {
		return scope.defineAttribute(name,opts);
	};
	
	let getName = Imba.toCamelCase(name);
	let setName = Imba.toCamelCase('set-' + name);
	
	scope.prototype[getName] = function() {
		return this.getAttribute(name);
	};
	
	scope.prototype[setName] = function(value) {
		this.setAttribute(name,value);
		return this;
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
/* 1 */
/***/ (function(module, exports, __webpack_require__) {

var Imba = __webpack_require__(0);

Imba.Pointer = function Pointer(){
	this.setButton(-1);
	this.setEvent({x: 0,y: 0,type: 'uninitialized'});
	return this;
};

Imba.Pointer.prototype.phase = function(v){ return this._phase; }
Imba.Pointer.prototype.setPhase = function(v){ this._phase = v; return this; };
Imba.Pointer.prototype.prevEvent = function(v){ return this._prevEvent; }
Imba.Pointer.prototype.setPrevEvent = function(v){ this._prevEvent = v; return this; };
Imba.Pointer.prototype.button = function(v){ return this._button; }
Imba.Pointer.prototype.setButton = function(v){ this._button = v; return this; };
Imba.Pointer.prototype.event = function(v){ return this._event; }
Imba.Pointer.prototype.setEvent = function(v){ this._event = v; return this; };
Imba.Pointer.prototype.dirty = function(v){ return this._dirty; }
Imba.Pointer.prototype.setDirty = function(v){ this._dirty = v; return this; };
Imba.Pointer.prototype.events = function(v){ return this._events; }
Imba.Pointer.prototype.setEvents = function(v){ this._events = v; return this; };
Imba.Pointer.prototype.touch = function(v){ return this._touch; }
Imba.Pointer.prototype.setTouch = function(v){ this._touch = v; return this; };

Imba.Pointer.prototype.update = function (e){
	this.setEvent(e);
	this.setDirty(true);
	return this;
};

// this is just for regular mouse now
Imba.Pointer.prototype.process = function (){
	var e1 = this.event();
	
	if (this.dirty()) {
		this.setPrevEvent(e1);
		this.setDirty(false);
		
		// button should only change on mousedown etc
		if (e1.type == 'mousedown') {
			this.setButton(e1.button);
			
			// do not create touch for right click
			if (this.button() == 2 || (this.touch() && this.button() != 0)) {
				return;
			};
			
			// cancel the previous touch
			if (this.touch()) { this.touch().cancel() };
			this.setTouch(new Imba.Touch(e1,this));
			this.touch().mousedown(e1,e1);
		} else if (e1.type == 'mousemove') {
			if (this.touch()) { this.touch().mousemove(e1,e1) };
		} else if (e1.type == 'mouseup') {
			this.setButton(-1);
			
			if (this.touch() && this.touch().button() == e1.button) {
				this.touch().mouseup(e1,e1);
				this.setTouch(null);
			};
			// trigger pointerup
		};
	} else {
		if (this.touch()) { this.touch().idle() };
	};
	return this;
};

Imba.Pointer.prototype.x = function (){
	return this.event().x;
};

Imba.Pointer.prototype.y = function (){
	return this.event().y;
};


/***/ }),
/* 2 */
/***/ (function(module, exports, __webpack_require__) {

function iter$(a){ return a ? (a.toArray ? a.toArray() : a) : []; };
var Imba = __webpack_require__(3), _T = Imba.TAGS, self = this;
const store = {
	items: [
		{title: "Create example"},
		{title: "Play around with example"}
	]
};

for (let i = 0; i <= 20; i++) {
	store.items.push({title: ("List item " + i)});
};

const actions = {
	add: function() { return store.items.push({title: "Another item"}); },
	tap: function() {
		return console.log("tap",arguments);
	},
	
	reverse: function() { return store.items.reverse(); },
	rename: function(item) {
		return item.name = "Something";
	}
};

var apps = {};
var COUNTER = 0;

apps.noEvents = _T.DIV(this).flag('app').setTemplate(function() {
	var self = this, __ = this.__;
	return (__.$A = __.$A || _T.UL(this)).setContent(
		(function() {
			var t0, $ = (__.$AA = __.$AA || []);
			for (let i = 0, items = iter$(store.items), len = $.taglen = items.length; i < len; i++) {
				(t0 = $[i] = $[i] || _T.LI(self)).setContent((t0.__.$A = t0.__.$A || _T.SPAN(self).flag('title')).setContent(items[i].title,3).end(),2).end();
			};return $;
		})()
	,4).end();
}).end();

// will be cached?
apps.strings = _T.DIV(this).flag('app').setTemplate(function() {
	var self = this, __ = this.__;
	return (__.$A = __.$A || _T.UL(this)).setContent(
		(function() {
			var t0, $ = (__.$AA = __.$AA || []);
			for (let i = 0, items = iter$(store.items), len = $.taglen = items.length; i < len; i++) {
				(t0 = $[i] = $[i] || _T.LI(self).on('tap.prevent','addSomething',0)).setContent((t0.__.$A = t0.__.$A || _T.SPAN(self).flag('title')).setContent(items[i].title,3).end(),2).end();
			};return $;
		})()
	,4).end();
}).end();

apps.functions = _T.DIV(this).flag('app').setTemplate(function() {
	var self = this, __ = this.__;
	return (__.$A = __.$A || _T.UL(this)).setContent(
		(function() {
			var t0, $ = (__.$AA = __.$AA || []);
			for (let i = 0, items = iter$(store.items), len = $.taglen = items.length; i < len; i++) {
				(t0 = $[i] = $[i] || _T.LI(self)).on('tap.prevent',actions.tap,0).setContent((t0.__.$A = t0.__.$A || _T.SPAN(self).flag('title')).setContent(items[i].title,3).end(),2).end();
			};return $;
		})()
	,4).end();
}).end();

apps.functionsNoMod = _T.DIV(this).flag('app').setTemplate(function() {
	var self = this, __ = this.__;
	return (__.$A = __.$A || _T.UL(this)).setContent(
		(function() {
			var t0, $ = (__.$AA = __.$AA || []);
			for (let i = 0, items = iter$(store.items), len = $.taglen = items.length; i < len; i++) {
				(t0 = $[i] = $[i] || _T.LI(self)).on('tap',actions.tap,0).setContent((t0.__.$A = t0.__.$A || _T.SPAN(self).flag('title')).setContent(items[i].title,3).end(),2).end();
			};return $;
		})()
	,4).end();
}).end();

apps.arrays = _T.DIV(this).flag('app').setTemplate(function() {
	var self = this, __ = this.__;
	return (__.$A = __.$A || _T.UL(this)).setContent(
		(function() {
			var t0, $ = (__.$AA = __.$AA || []);
			for (let i = 0, items = iter$(store.items), len = $.taglen = items.length, item; i < len; i++) {
				item = items[i];
				(t0 = $[i] = $[i] || _T.LI(self)).on('tap.prevent',[actions.tap,item],0).setContent((t0.__.$A = t0.__.$A || _T.SPAN(self).flag('title')).setContent(item.title,3).end(),2).end();
			};return $;
		})()
	,4).end();
}).end();

apps.textA = _T.DIV(this).flag('app').setTemplate(function() {
	var self = this, __ = this.__;
	return (__.$A = __.$A || _T.UL(this)).setContent(
		(function() {
			var $ = (__.$AA = __.$AA || []);
			for (let i = 0, items = iter$(store.items), len = $.taglen = items.length; i < len; i++) {
				($[i] = $[i] || _T.LI(self)).setText("a" + COUNTER).end();
			};return $;
		})()
	,4).end();
}).end();

apps.textB = _T.DIV(this).flag('app').setTemplate(function() {
	var self = this, __ = this.__;
	return (__.$A = __.$A || _T.UL(this)).setContent(
		(function() {
			var $ = (__.$AA = __.$AA || []);
			for (let i = 0, items = iter$(store.items), len = $.taglen = items.length; i < len; i++) {
				($[i] = $[i] || _T.LI(self)).setText("b" + COUNTER).end();
			};return $;
		})()
	,4).end();
}).end();

apps.textC = _T.DIV(this).flag('app').setTemplate(function() {
	var self = this, __ = this.__;
	return (__.$A = __.$A || _T.UL(this)).setContent(
		(function() {
			var $ = (__.$AA = __.$AA || []);
			for (let i = 0, items = iter$(store.items), len = $.taglen = items.length; i < len; i++) {
				($[i] = $[i] || _T.LI(self)).setText("c" + COUNTER).end();
			};return $;
		})()
	,4).end();
}).end();

apps.loop = _T.DIV(this).flag('app').setTemplate(function() {
	var self = this, __ = this.__;
	return (__.$A = __.$A || _T.UL(this)).setContent(
		(function() {
			var t0, $ = (__.$AA = __.$AA || []);
			for (let i = 0, items = iter$(store.items), len = $.taglen = items.length; i < len; i++) {
				(t0 = $[i] = $[i] || _T.LI(self)).setContent((t0.__.$A = t0.__.$A || _T.SPAN(self).flag('title')).setContent(items[i].title,3).end(),2).end();
			};return $;
		})()
	,4).end();
}).end();

apps.loopInner = _T.DIV(this).flag('app').setTemplate(function() {
	var __ = this.__, self = this;
	return (__.$A = __.$A || _T.UL(this)).setContent([
		(__.$AA = __.$AA || _T.LI(this)).setText("First item").end(),
		(function() {
			var t0, $ = (__.$AB = __.$AB || []);
			for (let i = 0, items = iter$(store.items), len = $.taglen = items.length; i < len; i++) {
				(t0 = $[i] = $[i] || _T.LI(self)).setContent((t0.__.$A = t0.__.$A || _T.SPAN(self).flag('title')).setContent(items[i].title,3).end(),2).end();
			};return $;
		})(),
		(__.$AC = __.$AC || _T.LI(self)).setText("Last item").end()
	],1).end();
}).end();

apps.loopKeys = _T.DIV(this).flag('app').setTemplate(function() {
	var self = this, __ = this.__;
	return (__.$A = __.$A || _T.UL(this)).setContent(
		(function() {
			var t0, $$AA = (__.$AA = __.$AA || {});
			let res = [];
			for (let i = 0, items = iter$(store.items), len = items.length; i < len; i++) {
				res.push((t0 = $$AA[i] = $$AA[i] || _T.LI(self)).setContent((t0.__.$A = t0.__.$A || _T.SPAN(self).flag('title')).setContent(items[i].title,3).end(),2).end());
			};
			return res;
		})()
	,3).end();
}).end();

apps.loopTrue = _T.DIV(this).flag('app').setTemplate(function() {
	var self = this, __ = this.__;
	return (__.$A = __.$A || _T.UL(this)).setContent([
		true ? (
			(function() {
				var t0, $ = (__.$AA = __.$AA || []);
				for (let i = 0, items = iter$(store.items), len = $.taglen = items.length; i < len; i++) {
					(t0 = $[i] = $[i] || _T.LI(self)).setContent((t0.__.$A = t0.__.$A || _T.SPAN(self).flag('title')).setContent(items[i].title,3).end(),2).end();
				};return $;
			})()
		) : void(0)
	],1).end();
}).end();

apps.loopWeird = _T.DIV(this).flag('app').setTemplate(function() {
	var __ = this.__, self = this;
	return (__.$A = __.$A || _T.UL(this)).setContent([
		(COUNTER % 3 == 0) ? (
			(__.$AA = __.$AA || _T.LI(this)).setText("Single").end()
		) : (
			(function() {
				var t0, $ = (__.$AB = __.$AB || []);
				for (let i = 0, items = iter$(store.items), len = $.taglen = items.length; i < len; i++) {
					(t0 = $[i] = $[i] || _T.LI(self)).setContent((t0.__.$A = t0.__.$A || _T.SPAN(self).flag('title')).setContent(items[i].title,3).end(),2).end();
				};return $;
			})()
		)
	],1).end();
}).end();



var logs = [];

window.APPS = apps;
var currentApp;

var run = function(app,name,times) {
	let item = {title: "Push/pop item"};
	window.app.innerHTML = '';
	window.app.appendChild(app.dom());
	console.time(name);
	let itemCount = store.items.length;
	let t0 = window.performance.now();
	var i = 0;
	COUNTER = 0;
	while (i < times){
		COUNTER++;
		if (i % 2) {
			store.items.pop();
		} else {
			store.items.push(item);
		};
		app.render();
		i++;
	};
	let t1 = window.performance.now();
	store.items.length = itemCount;
	console.timeEnd(name);
	logs.push(("" + name + " x" + times + " took " + (t1 - t0).toFixed(2) + "ms"));
	currentApp = app;
	return Imba.commit();
};

var testWeird = function() {
	let bool = true;
	let item = _T.DIV(self).setText("BOOL").end();
	let items = store.items.slice(0);
	let dyn = function() { return item; };
	let app = _T.DIV(self).flag('app').setTemplate(function() {
		var __ = this.__, self = this;
		return (__.$A = __.$A || _T.DIV(this)).setContent([
			(__.$AA = __.$AA || _T.DIV(this)).setText("before").end(),
			bool ? Imba.static([
				dyn(),
				(function() {
					var t0, $ = (__.$AB = __.$AB || []);
					for (let i = 0, ary = iter$(items), len = $.taglen = ary.length; i < len; i++) {
						(t0 = $[i] = $[i] || _T.LI(self)).setContent((t0.__.$A = t0.__.$A || _T.SPAN(self).flag('title')).setContent(ary[i].title,3).end(),2).end();
					};return $;
				})()
			],2) : void(0),
			(__.$AC = __.$AC || _T.DIV(self)).setText("after").end()
		],1).end();
	}).end();
	run(app,'bug',1);
	bool = false;
	app.render();
	bool = true;
	app.render();
	let par = item.dom().parentNode;
	par.removeChild(item.dom());
	// par.removeChild(item.dom)
	bool = false;
	return app.render();
	
	// add a bunch of items
};

var RunButton = _T.defineTag('RunButton', 'button', function(tag){
	
	tag.prototype.ontap = function (){
		return run(this.data(),this.dom().textContent,100001);
	};
});

var controls = _T.DIV(self).flag('controls').setTemplate(function() {
	var self = this, __ = this.__;
	return Imba.static([
		(__.$A = __.$A || _T.DIV(this).flag('header')).setContent([
			(function() {
				var $ = (__.$AA = __.$AA || []);
				for (let app, i = 0, keys = Object.keys(apps), l = $.taglen = keys.length, name; i < l; i++){
					name = keys[i];app = apps[name];($[i] = $[i] || RunButton.build(self)).setData(app).setText("" + name).end();
				};return $;
			})(),
			(__.$AB = __.$AB || _T.BUTTON(self)).on('tap',function(e) { var $1;
			return ($1 = currentApp) && $1.render  &&  $1.render(); },0).setText("render").end(),
			(__.$AC = __.$AC || _T.BUTTON(self)).on('tap',testWeird,0).setText("weird").end()
		],1).end(),
		(__.$B = __.$B || _T.DIV(self).flag('logs')).setContent((function() {
			var $1 = (__.$BA = __.$BA || []);
			for (let i = 0, len = $1.taglen = logs.length; i < len; i++) {
				($1[i] = $1[i] || _T.DIV(self)).setContent(logs[i],3).end();
			};return $1;
		})(),4).end()
	],1);
}).end();




Imba.mount(controls,window.controls);


/***/ }),
/* 3 */
/***/ (function(module, exports, __webpack_require__) {

module.exports = __webpack_require__(4);


/***/ }),
/* 4 */
/***/ (function(module, exports, __webpack_require__) {

var Imba = __webpack_require__(0);
var activate = false;
if (typeof window !== 'undefined') {
	if (window.Imba) {
		console.warn(("Imba v" + (Imba.VERSION) + " is already loaded."));
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
	__webpack_require__(5);
	__webpack_require__(6);
};

if (activate) {
	Imba.EventManager.activate();
};

if (false) {};


/***/ }),
/* 5 */
/***/ (function(module, exports, __webpack_require__) {

function iter$(a){ return a ? (a.toArray ? a.toArray() : a) : []; };
var Imba = __webpack_require__(0);

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
/* 6 */
/***/ (function(module, exports, __webpack_require__) {

var Imba = __webpack_require__(0);

__webpack_require__(7);

Imba.TagManager = new Imba.TagManagerClass();

__webpack_require__(8);
__webpack_require__(9);
__webpack_require__(10);
__webpack_require__(1);
__webpack_require__(11);
__webpack_require__(12);
__webpack_require__(13);

if (true) {
	__webpack_require__(14);
};

if (false) {};


/***/ }),
/* 7 */
/***/ (function(module, exports, __webpack_require__) {

function iter$(a){ return a ? (a.toArray ? a.toArray() : a) : []; };
var Imba = __webpack_require__(0);

Imba.TagManagerClass = function TagManagerClass(){
	this._spawns = 0;
	this._inserts = 0;
	this._removes = 0;
	this._mounted = [];
	this._hasMountables = false;
	this;
};

Imba.TagManagerClass.prototype.inserts = function(v){ return this._inserts; }
Imba.TagManagerClass.prototype.setInserts = function(v){ this._inserts = v; return this; };
Imba.TagManagerClass.prototype.spawns = function(v){ return this._spawns; }
Imba.TagManagerClass.prototype.setSpawns = function(v){ this._spawns = v; return this; };
Imba.TagManagerClass.prototype.removes = function(v){ return this._removes; }
Imba.TagManagerClass.prototype.setRemoves = function(v){ this._removes = v; return this; };
Imba.TagManagerClass.prototype.mounted = function(v){ return this._mounted; }
Imba.TagManagerClass.prototype.setMounted = function(v){ this._mounted = v; return this; };

Imba.TagManagerClass.prototype.insert = function (node,parent){
	this._inserts++;
	return;
};

Imba.TagManagerClass.prototype.remove = function (node,parent){
	this._removes++;
	return;
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
/* 8 */
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


Imba.static = function (items,nr){
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
	this.__ = {};
	this._owner_ = ctx;
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


Imba.Tag.prototype.tabindex = function(v){ return this.getAttribute('tabindex'); }
Imba.Tag.prototype.setTabindex = function(v){ this.setAttribute('tabindex',v); return this; };
Imba.Tag.prototype.title = function(v){ return this.getAttribute('title'); }
Imba.Tag.prototype.setTitle = function(v){ this.setAttribute('title',v); return this; };
Imba.Tag.prototype.role = function(v){ return this.getAttribute('role'); }
Imba.Tag.prototype.setRole = function(v){ this.setAttribute('role',v); return this; };
Imba.Tag.prototype.name = function(v){ return this.getAttribute('name'); }
Imba.Tag.prototype.setName = function(v){ this.setAttribute('name',v); return this; };

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

/*
	Setting references for tags like
	`<div@header>` will compile to `tag('div').ref_('header',this).end()`
	By default it adds the reference as a className to the tag.

	@return {self}
	@private
	*/

Imba.Tag.prototype.ref_ = function (ref,ctx){
	ctx['_' + ref] = this;
	this.flag(this._ref = ref);
	this._owner = ctx;
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

/*
	Method that is called by the compiled tag-chains, for
	binding events on tags to methods etc.
	`<a :tap=fn>` compiles to `tag('a').setHandler('tap',fn,this).end()`
	where this refers to the context in which the tag is created.
	@return {self}
	*/

Imba.Tag.prototype.setHandler = function (event,handler,ctx){
	var key = 'on' + event;
	
	if (handler instanceof Function) {
		this[key] = handler;
	} else if (handler instanceof Array) {
		var fn = handler.shift();
		this[key] = function(e) { return ctx[fn].apply(ctx,handler.concat(e)); };
	} else {
		this[key] = function(e) { return ctx[handler](e); };
	};
	return this;
};

Imba.Tag.prototype.on = function (event,handler,slot){
	let handlers = this._on_ || (this._on_ = []);
	
	if (slot != undefined) {
		let prev = handlers[slot];
		if (prev) {
			prev[1] = handler;
		} else {
			handlers[slot] = [event,handler];
			if (slot < 0) { handlers.push(handlers[slot]) };
			handlers._dirty = true;
		};
	} else {
		handlers.push([event,handler]);
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
		this._children = null; // ?
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
	// is it dynamic?
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
	The .append method inserts the specified content as the last child
	of the target node. If the content is already a child of node it
	will be moved to the end.
	
		var root = <div.root>
		var item = <div.item> "This is an item"
		root.append item # appends item to the end of root

		root.append "some text" # append text
		root.append [<ul>,<ul>] # append array
	*/

Imba.Tag.prototype.append = function (item){
	// possible to append blank
	// possible to simplify on server?
	if (!item) { return this };
	
	if (item instanceof Array) {
		for (let i = 0, items = iter$(item), len = items.length, member; i < len; i++) {
			member = items[i];
			member && this.append(member);
		};
	} else if ((typeof item=='string'||item instanceof String) || (typeof item=='number'||item instanceof Number)) {
		var node = Imba.document().createTextNode(item);
		this._dom.appendChild(node);
		if (this._empty) { this._empty = false };
	} else {
		// should delegate to self.appendChild
		this.appendChild(item);
		if (this._empty) { this._empty = false };
	};
	
	return this;
};

/*
	@todo Should support multiple arguments like append

	The .prepend method inserts the specified content as the first
	child of the target node. If the content is already a child of 
	node it will be moved to the start.
	
		node.prepend <div.top> # prepend node
		node.prepend "some text" # prepend text
		node.prepend [<ul>,<ul>] # prepend array

	*/

Imba.Tag.prototype.prepend = function (item){
	var first = this._dom.childNodes[0];
	first ? this.insertBefore(item,first) : this.appendChild(item);
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
	this._dom.textContent = (txt == null) ? (txt = "") : txt;
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
		this.__.text = null;
		while (this._dom.firstChild){
			this._dom.removeChild(this._dom.firstChild);
		};
		Imba.TagManager.remove(null,this);
	};
	
	this._children = this._text = null;
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
	@deprecated
	*/

Imba.Tag.prototype.classes = function (){
	throw "Imba.Tag#classes is removed. Use Imba.Tag#flags";
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


/*
	Set/update a named flag. It remembers the previous
	value of the flag, and removes it before setting the new value.

		node.setFlag('type','todo')
		node.setFlag('type','project')
		# todo is removed, project is added.

	@return {self}
	*/

Imba.Tag.prototype.setFlag = function (name,value){
	this._namedFlags || (this._namedFlags = []);
	let prev = this._namedFlags[name];
	if (prev != value) {
		if (prev) { this.unflag(prev) };
		if (value) { this.flag(value) };
		this._namedFlags[name] = value;
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
	// FIXME use native implementation if supported
	if (!sel) { return this.parent() }; // should return self?!
	var node = this;
	if (sel.query) { sel = sel.query() };
	
	while (node){
		if (node.matches(sel)) { return node };
		node = node.parent();
	};
	return null;
};

/*
	Get the index of node.
	@return {Number}
	*/

Imba.Tag.prototype.index = function (){
	var i = 0;
	var el = this.dom();
	while (el.previousSibling){
		el = el.previousSibling;
		i++;
	};
	return i;
};

/*
	Check if node contains other node
	@return {Boolean} 
	*/

Imba.Tag.prototype.contains = function (node){
	return this.dom().contains(node && node._dom || node);
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

/*
	Trigger an event from current node. Dispatched through the Imba event manager.
	To dispatch actual dom events, use dom.dispatchEvent instead.

	@return {Imba.Event}
	*/

Imba.Tag.prototype.trigger = function (name,data){
	if(data === undefined) data = {};
	if (true) {
		return Imba.Events.trigger(name,this,{data: data});
	};
};

Imba.Tag.prototype.setStyle = function (style){
	this.setAttribute('style',style);
	this;
	return this;
};

Imba.Tag.prototype.style = function (){
	return this.getAttribute('style');
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

Imba.HTML_TAGS = "a abbr address area article aside audio b base bdi bdo big blockquote body br button canvas caption cite code col colgroup data datalist dd del details dfn div dl dt em embed fieldset figcaption figure footer form h1 h2 h3 h4 h5 h6 head header hr html i iframe img input ins kbd keygen label legend li link main map mark menu menuitem meta meter nav noscript object ol optgroup option output p param pre progress q rp rt ruby s samp script section select small source span strong style sub summary sup table tbody td textarea tfoot th thead time title tr track u ul var video wbr".split(" ");
Imba.HTML_TAGS_UNSAFE = "article aside header section".split(" ");
Imba.SVG_TAGS = "circle defs ellipse g line linearGradient mask path pattern polygon polyline radialGradient rect stop svg text tspan".split(" ");

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

Imba.Tags.prototype.baseType = function (name){
	return (Imba.indexOf(name,Imba.HTML_TAGS) >= 0) ? 'element' : 'div';
};

Imba.Tags.prototype.defineTag = function (name,supr,body){
	if(body==undefined && typeof supr == 'function') body = supr,supr = '';
	if(supr==undefined) supr = '';
	if (body && body._nodeType) {
		supr = body;
		body = null;
	};
	
	supr || (supr = this.baseType(name));
	
	let supertype = ((typeof supr=='string'||supr instanceof String)) ? this[supr] : supr;
	let tagtype = Tag();
	let norm = name.replace(/\-/g,'_');
	
	tagtype._name = name;
	tagtype._flagName = null;
	
	if (name[0] == '#') {
		this[name] = tagtype;
		Imba.SINGLETONS[name.slice(1)] = tagtype;
	} else if (name[0] == name[0].toUpperCase()) {
		tagtype._flagName = name;
		true;
	} else {
		tagtype._flagName = "_" + name.replace(/_/g,'-');
		this[name] = tagtype;
		this[norm.toUpperCase()] = TagSpawner(tagtype);
		// '$'+
	};
	
	
	extender(tagtype,supertype);
	
	if (body) {
		if (body.length == 2) {
			// create clone
			if (!tagtype.hasOwnProperty('TAGS')) {
				tagtype.TAGS = (supertype.TAGS || this).__clone();
			};
		};
		
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
	var klass = (((typeof name=='string'||name instanceof String)) ? this[name] : name);
	// allow for private tags here as well?
	if (body) { body && body.call(klass,klass,klass.prototype) };
	if (klass.extended) { klass.extended() };
	this.optimizeTag(klass);
	return klass;
};

Imba.Tags.prototype.optimizeTag = function (tagtype){
	var prototype_;
	(prototype_ = tagtype.prototype) && prototype_.optimizeTagStructure  &&  prototype_.optimizeTagStructure();
	return this;
};


Imba.SINGLETONS = {};
Imba.TAGS = new Imba.Tags();
Imba.TAGS.element = Imba.TAGS.htmlelement = Imba.Tag;


var html = Imba.TAGS.defineNamespace('html');
var svg = Imba.TAGS.defineNamespace('svg');
Imba.TAGS = html; // make the html namespace the root

svg.baseType = function (name){
	return 'element';
};

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

Imba.getTagForDom = function (dom){
	var m;
	if (!dom) { return null };
	if (dom._dom) { return dom }; // could use inheritance instead
	if (dom._tag) { return dom._tag };
	if (!dom.nodeName) { return null };
	
	var ns = null;
	var id = dom.id;
	var type = dom.nodeName.toLowerCase();
	var tags = Imba.TAGS;
	var native$ = type;
	var cls = dom.className;
	
	if (id && Imba.SINGLETONS[id]) {
		// FIXME control that it is the same singleton?
		// might collide -- not good?
		return Imba.getTagSingleton(id);
	};
	// look for id - singleton
	
	// need better test here
	if (svgSupport && (dom instanceof SVGElement)) {
		ns = "svg";
		cls = dom.className.baseVal;
		tags = tags._SVG;
	};
	
	var spawner;
	
	if (cls) {
		// there can be several matches here - should choose the last
		// should fall back to less specific later? - otherwise things may fail
		// TODO rework this
		let flags = cls.split(' ');
		let nr = flags.length;
		
		while (--nr >= 0){
			let flag = flags[nr];
			if (flag[0] == '_') {
				if (spawner = tags[flag.slice(1)]) {
					break;
				};
			};
		};
		
		// if var m = cls.match(/\b_([a-z\-]+)\b(?!\s*_[a-z\-]+)/)
		// 	type = m[1] # .replace(/-/g,'_')
		
		if (m = cls.match(/\b([A-Z\-]+)_\b/)) {
			ns = m[1];
		};
	};
	
	spawner || (spawner = tags[native$]);
	return spawner ? new spawner(dom).awaken(dom) : null;
};

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
		Imba.TAGS.extendTag('element', function(tag){
			
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
/* 9 */
/***/ (function(module, exports, __webpack_require__) {

var Imba = __webpack_require__(0);

// predefine all supported html tags
Imba.TAGS.defineTag('fragment', 'element', function(tag){
	
	tag.createNode = function (){
		return Imba.document().createDocumentFragment();
	};
});

Imba.TAGS.defineTag('a', function(tag){
	tag.prototype.href = function(v){ return this.getAttribute('href'); }
	tag.prototype.setHref = function(v){ this.setAttribute('href',v); return this; };
	tag.prototype.target = function(v){ return this.getAttribute('target'); }
	tag.prototype.setTarget = function(v){ this.setAttribute('target',v); return this; };
	tag.prototype.hreflang = function(v){ return this.getAttribute('hreflang'); }
	tag.prototype.setHreflang = function(v){ this.setAttribute('hreflang',v); return this; };
	tag.prototype.media = function(v){ return this.getAttribute('media'); }
	tag.prototype.setMedia = function(v){ this.setAttribute('media',v); return this; };
	tag.prototype.download = function(v){ return this.getAttribute('download'); }
	tag.prototype.setDownload = function(v){ this.setAttribute('download',v); return this; };
	tag.prototype.rel = function(v){ return this.getAttribute('rel'); }
	tag.prototype.setRel = function(v){ this.setAttribute('rel',v); return this; };
	tag.prototype.type = function(v){ return this.getAttribute('type'); }
	tag.prototype.setType = function(v){ this.setAttribute('type',v); return this; };
});

Imba.TAGS.defineTag('abbr');
Imba.TAGS.defineTag('address');
Imba.TAGS.defineTag('area');
Imba.TAGS.defineTag('article');
Imba.TAGS.defineTag('aside');
Imba.TAGS.defineTag('audio');
Imba.TAGS.defineTag('b');
Imba.TAGS.defineTag('base');
Imba.TAGS.defineTag('bdi');
Imba.TAGS.defineTag('bdo');
Imba.TAGS.defineTag('big');
Imba.TAGS.defineTag('blockquote');
Imba.TAGS.defineTag('body');
Imba.TAGS.defineTag('br');

Imba.TAGS.defineTag('button', function(tag){
	tag.prototype.autofocus = function(v){ return this.getAttribute('autofocus'); }
	tag.prototype.setAutofocus = function(v){ this.setAttribute('autofocus',v); return this; };
	tag.prototype.type = function(v){ return this.getAttribute('type'); }
	tag.prototype.setType = function(v){ this.setAttribute('type',v); return this; };
	
	tag.prototype.__disabled = {dom: true,name: 'disabled'};
	tag.prototype.disabled = function(v){ return this.dom().disabled; }
	tag.prototype.setDisabled = function(v){ if (v != this.dom().disabled) { this.dom().disabled = v }; return this; };
});

Imba.TAGS.defineTag('canvas', function(tag){
	tag.prototype.__width = {dom: true,name: 'width'};
	tag.prototype.width = function(v){ return this.dom().width; }
	tag.prototype.setWidth = function(v){ if (v != this.dom().width) { this.dom().width = v }; return this; };
	tag.prototype.__height = {dom: true,name: 'height'};
	tag.prototype.height = function(v){ return this.dom().height; }
	tag.prototype.setHeight = function(v){ if (v != this.dom().height) { this.dom().height = v }; return this; };
	
	tag.prototype.context = function (type){
		if(type === undefined) type = '2d';
		return this.dom().getContext(type);
	};
});

Imba.TAGS.defineTag('caption');
Imba.TAGS.defineTag('cite');
Imba.TAGS.defineTag('code');
Imba.TAGS.defineTag('col');
Imba.TAGS.defineTag('colgroup');
Imba.TAGS.defineTag('data');
Imba.TAGS.defineTag('datalist');
Imba.TAGS.defineTag('dd');
Imba.TAGS.defineTag('del');
Imba.TAGS.defineTag('details');
Imba.TAGS.defineTag('dfn');
Imba.TAGS.defineTag('div');
Imba.TAGS.defineTag('dl');
Imba.TAGS.defineTag('dt');
Imba.TAGS.defineTag('em');
Imba.TAGS.defineTag('embed');

Imba.TAGS.defineTag('fieldset', function(tag){
	tag.prototype.__disabled = {dom: true,name: 'disabled'};
	tag.prototype.disabled = function(v){ return this.dom().disabled; }
	tag.prototype.setDisabled = function(v){ if (v != this.dom().disabled) { this.dom().disabled = v }; return this; };
});

Imba.TAGS.defineTag('figcaption');
Imba.TAGS.defineTag('figure');
Imba.TAGS.defineTag('footer');

Imba.TAGS.defineTag('form', function(tag){
	tag.prototype.method = function(v){ return this.getAttribute('method'); }
	tag.prototype.setMethod = function(v){ this.setAttribute('method',v); return this; };
	tag.prototype.action = function(v){ return this.getAttribute('action'); }
	tag.prototype.setAction = function(v){ this.setAttribute('action',v); return this; };
	tag.prototype.enctype = function(v){ return this.getAttribute('enctype'); }
	tag.prototype.setEnctype = function(v){ this.setAttribute('enctype',v); return this; };
	tag.prototype.autocomplete = function(v){ return this.getAttribute('autocomplete'); }
	tag.prototype.setAutocomplete = function(v){ this.setAttribute('autocomplete',v); return this; };
	tag.prototype.target = function(v){ return this.getAttribute('target'); }
	tag.prototype.setTarget = function(v){ this.setAttribute('target',v); return this; };
	
	tag.prototype.__novalidate = {dom: true,name: 'novalidate'};
	tag.prototype.novalidate = function(v){ return this.dom().novalidate; }
	tag.prototype.setNovalidate = function(v){ if (v != this.dom().novalidate) { this.dom().novalidate = v }; return this; };
});

Imba.TAGS.defineTag('h1');
Imba.TAGS.defineTag('h2');
Imba.TAGS.defineTag('h3');
Imba.TAGS.defineTag('h4');
Imba.TAGS.defineTag('h5');
Imba.TAGS.defineTag('h6');
Imba.TAGS.defineTag('head');
Imba.TAGS.defineTag('header');
Imba.TAGS.defineTag('hr');
Imba.TAGS.defineTag('html', function(tag){
	tag.prototype.parent = function (){
		return null;
	};
});

Imba.TAGS.defineTag('i');

Imba.TAGS.defineTag('iframe', function(tag){
	tag.prototype.referrerpolicy = function(v){ return this.getAttribute('referrerpolicy'); }
	tag.prototype.setReferrerpolicy = function(v){ this.setAttribute('referrerpolicy',v); return this; };
	tag.prototype.src = function(v){ return this.getAttribute('src'); }
	tag.prototype.setSrc = function(v){ this.setAttribute('src',v); return this; };
	tag.prototype.srcdoc = function(v){ return this.getAttribute('srcdoc'); }
	tag.prototype.setSrcdoc = function(v){ this.setAttribute('srcdoc',v); return this; };
	tag.prototype.sandbox = function(v){ return this.getAttribute('sandbox'); }
	tag.prototype.setSandbox = function(v){ this.setAttribute('sandbox',v); return this; };
});

Imba.TAGS.defineTag('img', function(tag){
	tag.prototype.src = function(v){ return this.getAttribute('src'); }
	tag.prototype.setSrc = function(v){ this.setAttribute('src',v); return this; };
	tag.prototype.srcset = function(v){ return this.getAttribute('srcset'); }
	tag.prototype.setSrcset = function(v){ this.setAttribute('srcset',v); return this; };
});

Imba.TAGS.defineTag('input', function(tag){
	tag.prototype.accept = function(v){ return this.getAttribute('accept'); }
	tag.prototype.setAccept = function(v){ this.setAttribute('accept',v); return this; };
	tag.prototype.disabled = function(v){ return this.getAttribute('disabled'); }
	tag.prototype.setDisabled = function(v){ this.setAttribute('disabled',v); return this; };
	tag.prototype.form = function(v){ return this.getAttribute('form'); }
	tag.prototype.setForm = function(v){ this.setAttribute('form',v); return this; };
	tag.prototype.list = function(v){ return this.getAttribute('list'); }
	tag.prototype.setList = function(v){ this.setAttribute('list',v); return this; };
	tag.prototype.max = function(v){ return this.getAttribute('max'); }
	tag.prototype.setMax = function(v){ this.setAttribute('max',v); return this; };
	tag.prototype.maxlength = function(v){ return this.getAttribute('maxlength'); }
	tag.prototype.setMaxlength = function(v){ this.setAttribute('maxlength',v); return this; };
	tag.prototype.min = function(v){ return this.getAttribute('min'); }
	tag.prototype.setMin = function(v){ this.setAttribute('min',v); return this; };
	tag.prototype.pattern = function(v){ return this.getAttribute('pattern'); }
	tag.prototype.setPattern = function(v){ this.setAttribute('pattern',v); return this; };
	tag.prototype.required = function(v){ return this.getAttribute('required'); }
	tag.prototype.setRequired = function(v){ this.setAttribute('required',v); return this; };
	tag.prototype.size = function(v){ return this.getAttribute('size'); }
	tag.prototype.setSize = function(v){ this.setAttribute('size',v); return this; };
	tag.prototype.step = function(v){ return this.getAttribute('step'); }
	tag.prototype.setStep = function(v){ this.setAttribute('step',v); return this; };
	tag.prototype.type = function(v){ return this.getAttribute('type'); }
	tag.prototype.setType = function(v){ this.setAttribute('type',v); return this; };
	
	tag.prototype.__autofocus = {dom: true,name: 'autofocus'};
	tag.prototype.autofocus = function(v){ return this.dom().autofocus; }
	tag.prototype.setAutofocus = function(v){ if (v != this.dom().autofocus) { this.dom().autofocus = v }; return this; };
	tag.prototype.__autocomplete = {dom: true,name: 'autocomplete'};
	tag.prototype.autocomplete = function(v){ return this.dom().autocomplete; }
	tag.prototype.setAutocomplete = function(v){ if (v != this.dom().autocomplete) { this.dom().autocomplete = v }; return this; };
	tag.prototype.__autocorrect = {dom: true,name: 'autocorrect'};
	tag.prototype.autocorrect = function(v){ return this.dom().autocorrect; }
	tag.prototype.setAutocorrect = function(v){ if (v != this.dom().autocorrect) { this.dom().autocorrect = v }; return this; };
	tag.prototype.__value = {dom: true,name: 'value'};
	tag.prototype.value = function(v){ return this.dom().value; }
	tag.prototype.setValue = function(v){ if (v != this.dom().value) { this.dom().value = v }; return this; };
	tag.prototype.__placeholder = {dom: true,name: 'placeholder'};
	tag.prototype.placeholder = function(v){ return this.dom().placeholder; }
	tag.prototype.setPlaceholder = function(v){ if (v != this.dom().placeholder) { this.dom().placeholder = v }; return this; };
	tag.prototype.__required = {dom: true,name: 'required'};
	tag.prototype.required = function(v){ return this.dom().required; }
	tag.prototype.setRequired = function(v){ if (v != this.dom().required) { this.dom().required = v }; return this; };
	tag.prototype.__disabled = {dom: true,name: 'disabled'};
	tag.prototype.disabled = function(v){ return this.dom().disabled; }
	tag.prototype.setDisabled = function(v){ if (v != this.dom().disabled) { this.dom().disabled = v }; return this; };
	tag.prototype.__multiple = {dom: true,name: 'multiple'};
	tag.prototype.multiple = function(v){ return this.dom().multiple; }
	tag.prototype.setMultiple = function(v){ if (v != this.dom().multiple) { this.dom().multiple = v }; return this; };
	tag.prototype.__checked = {dom: true,name: 'checked'};
	tag.prototype.checked = function(v){ return this.dom().checked; }
	tag.prototype.setChecked = function(v){ if (v != this.dom().checked) { this.dom().checked = v }; return this; };
	tag.prototype.__readOnly = {dom: true,name: 'readOnly'};
	tag.prototype.readOnly = function(v){ return this.dom().readOnly; }
	tag.prototype.setReadOnly = function(v){ if (v != this.dom().readOnly) { this.dom().readOnly = v }; return this; };
});

Imba.TAGS.defineTag('ins');
Imba.TAGS.defineTag('kbd');
Imba.TAGS.defineTag('keygen');
Imba.TAGS.defineTag('label', function(tag){
	tag.prototype.accesskey = function(v){ return this.getAttribute('accesskey'); }
	tag.prototype.setAccesskey = function(v){ this.setAttribute('accesskey',v); return this; };
	tag.prototype['for'] = function(v){ return this.getAttribute('for'); }
	tag.prototype.setFor = function(v){ this.setAttribute('for',v); return this; };
	tag.prototype.form = function(v){ return this.getAttribute('form'); }
	tag.prototype.setForm = function(v){ this.setAttribute('form',v); return this; };
});


Imba.TAGS.defineTag('legend');
Imba.TAGS.defineTag('li');

Imba.TAGS.defineTag('link', function(tag){
	tag.prototype.rel = function(v){ return this.getAttribute('rel'); }
	tag.prototype.setRel = function(v){ this.setAttribute('rel',v); return this; };
	tag.prototype.type = function(v){ return this.getAttribute('type'); }
	tag.prototype.setType = function(v){ this.setAttribute('type',v); return this; };
	tag.prototype.href = function(v){ return this.getAttribute('href'); }
	tag.prototype.setHref = function(v){ this.setAttribute('href',v); return this; };
	tag.prototype.media = function(v){ return this.getAttribute('media'); }
	tag.prototype.setMedia = function(v){ this.setAttribute('media',v); return this; };
});

Imba.TAGS.defineTag('main');
Imba.TAGS.defineTag('map');
Imba.TAGS.defineTag('mark');
Imba.TAGS.defineTag('menu');
Imba.TAGS.defineTag('menuitem');

Imba.TAGS.defineTag('meta', function(tag){
	tag.prototype.property = function(v){ return this.getAttribute('property'); }
	tag.prototype.setProperty = function(v){ this.setAttribute('property',v); return this; };
	tag.prototype.content = function(v){ return this.getAttribute('content'); }
	tag.prototype.setContent = function(v){ this.setAttribute('content',v); return this; };
	tag.prototype.charset = function(v){ return this.getAttribute('charset'); }
	tag.prototype.setCharset = function(v){ this.setAttribute('charset',v); return this; };
});

Imba.TAGS.defineTag('meter');
Imba.TAGS.defineTag('nav');
Imba.TAGS.defineTag('noscript');

Imba.TAGS.defineTag('ol');

Imba.TAGS.defineTag('optgroup', function(tag){
	tag.prototype.label = function(v){ return this.getAttribute('label'); }
	tag.prototype.setLabel = function(v){ this.setAttribute('label',v); return this; };
	tag.prototype.__disabled = {dom: true,name: 'disabled'};
	tag.prototype.disabled = function(v){ return this.dom().disabled; }
	tag.prototype.setDisabled = function(v){ if (v != this.dom().disabled) { this.dom().disabled = v }; return this; };
});

Imba.TAGS.defineTag('option', function(tag){
	tag.prototype.label = function(v){ return this.getAttribute('label'); }
	tag.prototype.setLabel = function(v){ this.setAttribute('label',v); return this; };
	tag.prototype.__disabled = {dom: true,name: 'disabled'};
	tag.prototype.disabled = function(v){ return this.dom().disabled; }
	tag.prototype.setDisabled = function(v){ if (v != this.dom().disabled) { this.dom().disabled = v }; return this; };
	tag.prototype.__selected = {dom: true,name: 'selected'};
	tag.prototype.selected = function(v){ return this.dom().selected; }
	tag.prototype.setSelected = function(v){ if (v != this.dom().selected) { this.dom().selected = v }; return this; };
	tag.prototype.__value = {dom: true,name: 'value'};
	tag.prototype.value = function(v){ return this.dom().value; }
	tag.prototype.setValue = function(v){ if (v != this.dom().value) { this.dom().value = v }; return this; };
});

Imba.TAGS.defineTag('output', function(tag){
	tag.prototype['for'] = function(v){ return this.getAttribute('for'); }
	tag.prototype.setFor = function(v){ this.setAttribute('for',v); return this; };
	tag.prototype.form = function(v){ return this.getAttribute('form'); }
	tag.prototype.setForm = function(v){ this.setAttribute('form',v); return this; };
});

Imba.TAGS.defineTag('p');

Imba.TAGS.defineTag('object', function(tag){
	Imba.attr(tag,'type');
	Imba.attr(tag,'data');
	Imba.attr(tag,'width');
	Imba.attr(tag,'height');
});

Imba.TAGS.defineTag('param', function(tag){
	tag.prototype.name = function(v){ return this.getAttribute('name'); }
	tag.prototype.setName = function(v){ this.setAttribute('name',v); return this; };
	tag.prototype.value = function(v){ return this.getAttribute('value'); }
	tag.prototype.setValue = function(v){ this.setAttribute('value',v); return this; };
});

Imba.TAGS.defineTag('pre');
Imba.TAGS.defineTag('progress', function(tag){
	tag.prototype.max = function(v){ return this.getAttribute('max'); }
	tag.prototype.setMax = function(v){ this.setAttribute('max',v); return this; };
	tag.prototype.__value = {dom: true,name: 'value'};
	tag.prototype.value = function(v){ return this.dom().value; }
	tag.prototype.setValue = function(v){ if (v != this.dom().value) { this.dom().value = v }; return this; };
});

Imba.TAGS.defineTag('q');
Imba.TAGS.defineTag('rp');
Imba.TAGS.defineTag('rt');
Imba.TAGS.defineTag('ruby');
Imba.TAGS.defineTag('s');
Imba.TAGS.defineTag('samp');

Imba.TAGS.defineTag('script', function(tag){
	tag.prototype.src = function(v){ return this.getAttribute('src'); }
	tag.prototype.setSrc = function(v){ this.setAttribute('src',v); return this; };
	tag.prototype.type = function(v){ return this.getAttribute('type'); }
	tag.prototype.setType = function(v){ this.setAttribute('type',v); return this; };
	tag.prototype.async = function(v){ return this.getAttribute('async'); }
	tag.prototype.setAsync = function(v){ this.setAttribute('async',v); return this; };
	tag.prototype.defer = function(v){ return this.getAttribute('defer'); }
	tag.prototype.setDefer = function(v){ this.setAttribute('defer',v); return this; };
});

Imba.TAGS.defineTag('section');

Imba.TAGS.defineTag('select', function(tag){
	tag.prototype.size = function(v){ return this.getAttribute('size'); }
	tag.prototype.setSize = function(v){ this.setAttribute('size',v); return this; };
	tag.prototype.form = function(v){ return this.getAttribute('form'); }
	tag.prototype.setForm = function(v){ this.setAttribute('form',v); return this; };
	tag.prototype.multiple = function(v){ return this.getAttribute('multiple'); }
	tag.prototype.setMultiple = function(v){ this.setAttribute('multiple',v); return this; };
	tag.prototype.__autofocus = {dom: true,name: 'autofocus'};
	tag.prototype.autofocus = function(v){ return this.dom().autofocus; }
	tag.prototype.setAutofocus = function(v){ if (v != this.dom().autofocus) { this.dom().autofocus = v }; return this; };
	tag.prototype.__disabled = {dom: true,name: 'disabled'};
	tag.prototype.disabled = function(v){ return this.dom().disabled; }
	tag.prototype.setDisabled = function(v){ if (v != this.dom().disabled) { this.dom().disabled = v }; return this; };
	tag.prototype.__required = {dom: true,name: 'required'};
	tag.prototype.required = function(v){ return this.dom().required; }
	tag.prototype.setRequired = function(v){ if (v != this.dom().required) { this.dom().required = v }; return this; };
	
	tag.prototype.setValue = function (value){
		value = String(value);
		
		if (this.dom().value != value) {
			this.dom().value = value;
			
			if (this.dom().value != value) {
				this._delayedValue = value;
			};
		};
		
		this;
		return this;
	};
	
	tag.prototype.value = function (){
		return this.dom().value;
	};
	
	tag.prototype.syncValue = function (){
		if (this._delayedValue != undefined) {
			this.dom().value = this._delayedValue;
			this._delayedValue = undefined;
		};
		return this;
	};
	
	tag.prototype.setChildren = function (){
		tag.__super__.setChildren.apply(this,arguments);
		return this.syncValue();
	};
});

Imba.TAGS.defineTag('small');
Imba.TAGS.defineTag('source');
Imba.TAGS.defineTag('span');
Imba.TAGS.defineTag('strong');
Imba.TAGS.defineTag('style');
Imba.TAGS.defineTag('sub');
Imba.TAGS.defineTag('summary');
Imba.TAGS.defineTag('sup');
Imba.TAGS.defineTag('table');
Imba.TAGS.defineTag('tbody');
Imba.TAGS.defineTag('td');

Imba.TAGS.defineTag('textarea', function(tag){
	tag.prototype.rows = function(v){ return this.getAttribute('rows'); }
	tag.prototype.setRows = function(v){ this.setAttribute('rows',v); return this; };
	tag.prototype.cols = function(v){ return this.getAttribute('cols'); }
	tag.prototype.setCols = function(v){ this.setAttribute('cols',v); return this; };
	
	tag.prototype.__autofocus = {dom: true,name: 'autofocus'};
	tag.prototype.autofocus = function(v){ return this.dom().autofocus; }
	tag.prototype.setAutofocus = function(v){ if (v != this.dom().autofocus) { this.dom().autofocus = v }; return this; };
	tag.prototype.__autocomplete = {dom: true,name: 'autocomplete'};
	tag.prototype.autocomplete = function(v){ return this.dom().autocomplete; }
	tag.prototype.setAutocomplete = function(v){ if (v != this.dom().autocomplete) { this.dom().autocomplete = v }; return this; };
	tag.prototype.__autocorrect = {dom: true,name: 'autocorrect'};
	tag.prototype.autocorrect = function(v){ return this.dom().autocorrect; }
	tag.prototype.setAutocorrect = function(v){ if (v != this.dom().autocorrect) { this.dom().autocorrect = v }; return this; };
	tag.prototype.__value = {dom: true,name: 'value'};
	tag.prototype.value = function(v){ return this.dom().value; }
	tag.prototype.setValue = function(v){ if (v != this.dom().value) { this.dom().value = v }; return this; };
	tag.prototype.__disabled = {dom: true,name: 'disabled'};
	tag.prototype.disabled = function(v){ return this.dom().disabled; }
	tag.prototype.setDisabled = function(v){ if (v != this.dom().disabled) { this.dom().disabled = v }; return this; };
	tag.prototype.__required = {dom: true,name: 'required'};
	tag.prototype.required = function(v){ return this.dom().required; }
	tag.prototype.setRequired = function(v){ if (v != this.dom().required) { this.dom().required = v }; return this; };
	tag.prototype.__readOnly = {dom: true,name: 'readOnly'};
	tag.prototype.readOnly = function(v){ return this.dom().readOnly; }
	tag.prototype.setReadOnly = function(v){ if (v != this.dom().readOnly) { this.dom().readOnly = v }; return this; };
	tag.prototype.__placeholder = {dom: true,name: 'placeholder'};
	tag.prototype.placeholder = function(v){ return this.dom().placeholder; }
	tag.prototype.setPlaceholder = function(v){ if (v != this.dom().placeholder) { this.dom().placeholder = v }; return this; };
});

Imba.TAGS.defineTag('tfoot');
Imba.TAGS.defineTag('th');
Imba.TAGS.defineTag('thead');
Imba.TAGS.defineTag('time');
Imba.TAGS.defineTag('title');
Imba.TAGS.defineTag('tr');
Imba.TAGS.defineTag('track');
Imba.TAGS.defineTag('u');
Imba.TAGS.defineTag('ul');
Imba.TAGS.defineTag('video');
Imba.TAGS.defineTag('wbr');

true;


/***/ }),
/* 10 */
/***/ (function(module, exports, __webpack_require__) {

var Imba = __webpack_require__(0);

Imba.TAGS.ns('svg').defineTag('element', function(tag){
	
	tag.namespaceURI = function (){
		return "http://www.w3.org/2000/svg";
	};
	
	tag.buildNode = function (){
		var dom = Imba.document().createElementNS(this.namespaceURI(),this._nodeType);
		var cls = this._classes.join(" ");
		if (cls) { dom.className.baseVal = cls };
		return dom;
	};
	
	tag.inherit = function (child){
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
	
	
	Imba.attr(tag,'x');
	Imba.attr(tag,'y');
	
	Imba.attr(tag,'width');
	Imba.attr(tag,'height');
	
	Imba.attr(tag,'stroke');
	Imba.attr(tag,'stroke-width');
});

Imba.TAGS.ns('svg').defineTag('svg', function(tag){
	Imba.attr(tag,'viewbox');
});

Imba.TAGS.ns('svg').defineTag('g');

Imba.TAGS.ns('svg').defineTag('defs');

Imba.TAGS.ns('svg').defineTag('symbol', function(tag){
	Imba.attr(tag,'preserveAspectRatio');
	Imba.attr(tag,'viewBox');
});

Imba.TAGS.ns('svg').defineTag('marker', function(tag){
	Imba.attr(tag,'markerUnits');
	Imba.attr(tag,'refX');
	Imba.attr(tag,'refY');
	Imba.attr(tag,'markerWidth');
	Imba.attr(tag,'markerHeight');
	Imba.attr(tag,'orient');
});

// Basic shapes

Imba.TAGS.ns('svg').defineTag('rect', function(tag){
	Imba.attr(tag,'rx');
	Imba.attr(tag,'ry');
});

Imba.TAGS.ns('svg').defineTag('circle', function(tag){
	Imba.attr(tag,'cx');
	Imba.attr(tag,'cy');
	Imba.attr(tag,'r');
});

Imba.TAGS.ns('svg').defineTag('ellipse', function(tag){
	Imba.attr(tag,'cx');
	Imba.attr(tag,'cy');
	Imba.attr(tag,'rx');
	Imba.attr(tag,'ry');
});

Imba.TAGS.ns('svg').defineTag('path', function(tag){
	Imba.attr(tag,'d');
	Imba.attr(tag,'pathLength');
});

Imba.TAGS.ns('svg').defineTag('line', function(tag){
	Imba.attr(tag,'x1');
	Imba.attr(tag,'x2');
	Imba.attr(tag,'y1');
	Imba.attr(tag,'y2');
});

Imba.TAGS.ns('svg').defineTag('polyline', function(tag){
	Imba.attr(tag,'points');
});

Imba.TAGS.ns('svg').defineTag('polygon', function(tag){
	Imba.attr(tag,'points');
});

Imba.TAGS.ns('svg').defineTag('text', function(tag){
	Imba.attr(tag,'dx');
	Imba.attr(tag,'dy');
	Imba.attr(tag,'text-anchor');
	Imba.attr(tag,'rotate');
	Imba.attr(tag,'textLength');
	Imba.attr(tag,'lengthAdjust');
});

Imba.TAGS.ns('svg').defineTag('tspan', function(tag){
	Imba.attr(tag,'dx');
	Imba.attr(tag,'dy');
	Imba.attr(tag,'rotate');
	Imba.attr(tag,'textLength');
	Imba.attr(tag,'lengthAdjust');
});


/***/ }),
/* 11 */
/***/ (function(module, exports, __webpack_require__) {

function iter$(a){ return a ? (a.toArray ? a.toArray() : a) : []; };
var Imba = __webpack_require__(0);

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
/* 12 */
/***/ (function(module, exports, __webpack_require__) {

function iter$(a){ return a ? (a.toArray ? a.toArray() : a) : []; };
var Imba = __webpack_require__(0);

Imba.KEYMAP = {
	"8": 'backspace',
	"9": 'tab',
	"13": 'enter',
	"16": 'shift',
	"17": 'ctrl',
	"18": 'alt',
	"19": 'break',
	"20": 'caps',
	"27": 'esc',
	"32": 'space',
	"35": 'end',
	"36": 'home',
	"37": 'larr',
	"38": 'uarr',
	"39": 'rarr',
	"40": 'darr',
	"45": 'insert',
	"46": 'delete',
	"107": 'plus',
	"106": 'mult',
	"91": 'meta'
};

Imba.CHARMAP = {
	"%": 'modulo',
	"*": 'multiply',
	"+": 'add',
	"-": 'sub',
	"/": 'divide',
	".": 'dot'
};

var keyCodes = {
	esc: 27,
	tab: 9,
	enter: 13,
	space: 32,
	up: 38,
	left: 37,
	right: 39,
	down: 40
};

var checkKeycode = function(_0,_1,_2) { return _0.keyCode ? ((_0.keyCode !== _2)) : false; };

// return true to skip handler
var Modifiers = exports.Modifiers = {
	halt: function() { return this.stopPropagation() && false; },
	prevent: function() { return this.preventDefault() && false; },
	silence: function() { return this.silence() && false; },
	bubble: function() { return false; },
	self: function(_0,_1) { return _0.target != _1._dom; },
	left: function(_0,_1) { return (_0.button != undefined) ? ((_0.button !== 0)) : checkKeycode(_0,_1,keyCodes.left); },
	right: function(_0,_1) { return (_0.button != undefined) ? ((_0.button !== 2)) : checkKeycode(_0,_1,keyCodes.right); },
	middle: function(_0) { return (_0.button != undefined) ? ((_0.button !== 1)) : false; },
	ctrl: function(_0) { return _0.ctrlKey != true; },
	shift: function(_0) { return _0.shiftKey != true; },
	alt: function(_0) { return _0.altKey != true; },
	meta: function(_0) { return _0.metaKey != true; },
	keycode: function(_0,_1,_2) { return _0.keyCode ? ((_0.keyCode !== _2)) : false; }
};

// 	.enter
// .tab
// .delete (captures both “Delete” and “Backspace” keys)
// .esc
// .space
// .up
// .down
// .left
// .right

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
	this.setBubble(true);
};

/* reference to the native event */

Imba.Event.prototype.event = function(v){ return this._event; }
Imba.Event.prototype.setEvent = function(v){ this._event = v; return this; };

/* reference to the native event */

Imba.Event.prototype.prefix = function(v){ return this._prefix; }
Imba.Event.prototype.setPrefix = function(v){ this._prefix = v; return this; };

Imba.Event.prototype.data = function(v){ return this._data; }
Imba.Event.prototype.setData = function(v){ this._data = v; return this; };

/*
	should remove this alltogether?
	@deprecated
	*/

Imba.Event.prototype.source = function(v){ return this._source; }
Imba.Event.prototype.setSource = function(v){ this._source = v; return this; };

/* A {Boolean} indicating whether the event bubbles up or not */

Imba.Event.prototype.__bubble = {type: Boolean,chainable: true,name: 'bubble'};
Imba.Event.prototype.bubble = function(v){ return v !== undefined ? (this.setBubble(v),this) : this._bubble; }
Imba.Event.prototype.setBubble = function(v){ this._bubble = v; return this; };

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

/*
	Prevents further propagation of the current event.
	@return {self}
	*/

Imba.Event.prototype.halt = function (){
	this.setBubble(false);
	return this;
};


Imba.Event.prototype.stopPropagation = function (){
	return this.halt();
};

/*
	Cancel the event (if cancelable). In the case of native events it
	will call `preventDefault` on the wrapped event object.
	@return {self}
	*/

Imba.Event.prototype.cancel = function (){
	if (this.event().preventDefault) { this.event().preventDefault() };
	this._cancel = true;
	return this;
};

Imba.Event.prototype.preventDefault = function (){
	return this.cancel();
};

Imba.Event.prototype.silence = function (){
	this._silenced = true;
	return this;
};

Imba.Event.prototype.isSilenced = function (){
	return !!this._silenced;
};

/*
	Indicates whether or not event.cancel has been called.

	@return {Boolean}
	*/

Imba.Event.prototype.isPrevented = function (){
	return this.event() && this.event().defaultPrevented || this._cancel;
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

/*
	Get the normalized character for KeyboardEvent/TextEvent
	@return {String}
	*/

Imba.Event.prototype.keychar = function (){
	if (this.event() instanceof KeyboardEvent) {
		var ki = this.event().keyIdentifier || this.event().key;
		var sym = Imba.KEYMAP[this.event().keyCode];
		
		if (!sym) {
			if (ki.substr(0,2) == "U+") {
				sym = String.fromCharCode(parseInt(ki.substr(2),16));
			} else {
				sym = ki;
			};
		};
		return sym;
	} else if (this.event() instanceof (window.TextEvent || window.InputEvent)) {
		return this.event().data;
	};
	
	return null;
};

/*
	@deprecated
	*/

Imba.Event.prototype.keycombo = function (){
	var sym;
	if (!(sym = this.keychar())) { return };
	sym = Imba.CHARMAP[sym] || sym;
	var combo = [],e = this.event();
	if (e.ctrlKey) { combo.push('ctrl') };
	if (e.shiftKey) { combo.push('shift') };
	if (e.altKey) { combo.push('alt') };
	if (e.metaKey) { combo.push('cmd') };
	combo.push(sym);
	return combo.join("_").toLowerCase();
};

Imba.Event.prototype.processHandler = function (node,name,handler){ // , mods = []
	let autoBubble = false;
	
	// go through 
	let modIndex = name.indexOf('.');
	
	if (modIndex >= 0) {
		// could be optimized
		let mods = name.split(".").slice(1);
		// go through modifiers
		for (let i = 0, items = iter$(mods), len = items.length, mod; i < len; i++) {
			mod = items[i];
			if (mod == 'bubble') {
				autoBubble = true;
				continue;
			};
			
			let guard = Modifiers[mod];
			if (!guard) {
				if (keyCodes[mod]) {
					mod = keyCodes[mod];
				};
				if (/^\d+$/.test(mod)) {
					mod = parseInt(mod);
					guard = Modifiers.keycode;
				} else {
					console.warn(("" + mod + " is not a valid event-modifier"));
					continue;
				};
			};
			
			// skipping this handler?
			if (guard.call(this,this.event(),node,mod) == true) {
				return;
			};
		};
	};
	
	var context = node;
	var params = [this,this.data()];
	var result;
	
	if (handler instanceof Array) {
		params = handler.slice(1);
		handler = handler[0];
	};
	
	
	if ((typeof handler=='string'||handler instanceof String)) {
		let el = node;
		while (el){
			// should lookup actions?
			if (el[handler]) {
				context = el;
				handler = el[handler];
				break;
			};
			el = el.parent();
		};
	};
	
	if (handler instanceof Function) {
		result = handler.apply(context,params);
	};
	
	// the default behaviour is that if a handler actually
	// processes the event - we stop propagation. That's usually
	// what you would want
	if (!autoBubble) {
		this.stopPropagation();
	};
	
	this._responder || (this._responder = node);
	
	// if result is a promise and we're not silenced, schedule Imba.commit
	if (result && !this._silenced && (result.then instanceof Function)) {
		result.then(Imba.commit);
	};
	
	return result;
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
			if (handlers = node._on_) {
				for (let i = 0, items = iter$(handlers), len = items.length, handler; i < len; i++) {
					handler = items[i];
					if (!handler) { continue; };
					let hname = handler[0];
					if (hname.indexOf(name) == 0 && this.bubble() && (hname.length == name.length || hname[name.length] == '.')) {
						this.processHandler(node,hname,handler[1] || []);
					};
				};
				if (!(this.bubble())) { break; };
			};
			
			// No longer used
			// if node[meth] isa String
			// 	# should remember the receiver of the event
			// 	meth = node[meth]
			// 	continue # should not continue?
			
			// No longer used
			// if node[meth] isa Array
			// 	args = node[meth].concat(node)
			// 	meth = args.shift
			// 	continue # should not continue?
			
			if (node[meth] instanceof Function) {
				this._responder || (this._responder = node);
				// should autostop bubble here?
				result = args ? node[meth].apply(node,args) : node[meth](this,this.data());
			};
			
			if (node.onevent) {
				node.onevent(this);
			};
			
			// console.log "continue downwards?",domnode,name
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
/* 13 */
/***/ (function(module, exports, __webpack_require__) {

function iter$(a){ return a ? (a.toArray ? a.toArray() : a) : []; };
var Imba = __webpack_require__(0);
__webpack_require__(1);

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
	return this;
};


/***/ }),
/* 14 */
/***/ (function(module, exports, __webpack_require__) {

function iter$(a){ return a ? (a.toArray ? a.toArray() : a) : []; };
var Imba = __webpack_require__(0);

// 1 - static shape - unknown content
// 2 - static shape and static children
// 3 - single item
// 4 - optimized array - only length will change

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
			if (new$.static || old.static) {
				// if the static is not nested - we could get a hint from compiler
				// and just skip it
				if (new$.static == old.static) {
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


Imba.TAGS.extendTag('element', function(tag){
	
	tag.prototype.setChildren = function (new$,typ){
		var old = this._children;
		
		if (new$ === old && new$ && new$.taglen == undefined) {
			return this;
		};
		
		if (!old && typ != 3) {
			this.empty();
			appendNested(this,new$);
		} else if (typ == 1) {
			// here we _know _that it is an array with the same shape
			// every time
			let caret = null;
			for (let i = 0, items = iter$(new$), len = items.length; i < len; i++) {
				// prev = old[i]
				caret = reconcileNested(this,items[i],old[i],caret);
			};
		} else if (typ == 2) {
			return this;
		} else if (typ == 3) {
			// this is possibly fully dynamic. It often is
			// but the old or new could be static while the other is not
			// this is not handled now
			// what if it was previously a static array? edgecase - but must work
			// could we simply do replace-child?
			if (new$ && new$._dom) {
				this.empty();
				this.appendChild(new$);
			} else if (new$ instanceof Array) {
				if (old instanceof Array) {
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
		} else if ((new$ instanceof Array) && (old instanceof Array)) {
			reconcileNested(this,new$,old,null);
		} else {
			this.empty();
			appendNested(this,new$);
		};
		
		this._children = new$;
		return this;
	};
	
	tag.prototype.content = function (){
		return this._content || this.children().toArray();
	};
	
	tag.prototype.setText = function (text){
		if (text != this._text) {
			let val = (text == null || text === false) ? '' : text;
			if (true) {
				if (this.__.text) {
					this.__.text.textContent = val;
				} else {
					this.dom().textContent = val;
					this.__.text = this.dom().firstChild;
				};
			};
			this._text = this._children = text;
		};
		return this;
	};
});


/***/ })
/******/ ]);