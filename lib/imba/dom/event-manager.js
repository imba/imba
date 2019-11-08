function iter$(a){ return a ? (a.toArray ? a.toArray() : a) : []; };
var Imba = require("../imba");
require("./pointer");

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
	self.shimFocusEvents = false && window.netscape && node.onfocusin === undefined;
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
	Imba.Events = new Imba.EventManager(Imba.document,{events: []});
	if (!false) { return };
	
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
	Imba.Events.register(initialBind);
	Imba.Events.enabled = true;
	return Imba.Events;
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
	
	if (this.delegators[name]) { return this };
	
	// console.log("register for event {name}")
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

/*

	Create a new Imba.Event

	*/

Imba.EventManager.prototype.create = function (type,target,pars){
	if(!pars||pars.constructor !== Object) pars = {};
	var data = pars.data !== undefined ? pars.data : null;
	var source = pars.source !== undefined ? pars.source : null;
	var event = Imba.Event.wrap({type: type,target: target});
	if (data != undefined) { event.data = data };
	if (source) { event.source = source };
	return event;
};

/*

	Trigger / process an Imba.Event.

	*/

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
	
	if (false) {};
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
	
	if (false) {};
	
	return this;
};
