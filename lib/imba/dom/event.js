function iter$(a){ return a ? (a.toArray ? a.toArray() : a) : []; };
var Imba = require("../imba");

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

Imba.Event.prototype.setBubble = function (v){
	this._bubble = v;
	return this;
	return this;
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

Imba.Event.prototype.processHandler = function (node,name,handler){ // , mods = []
	var autoBubble = false;
	
	// go through 
	var modIndex = name.indexOf('.');
	
	if (modIndex >= 0) {
		// could be optimized
		var mods = name.split(".").slice(1);
		// go through modifiers
		for (var i = 0, items = iter$(mods), len = items.length, mod; i < len; i++) {
			mod = items[i];
			if (mod == 'bubble') {
				autoBubble = true;
				continue;
			};
			
			var guard = Modifiers[mod];
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
		var el = node;
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
		var node = domnode._dom ? domnode : domnode._tag;
		if (node) {
			if (handlers = node._on_) {
				for (var i = 0, items = iter$(handlers), len = items.length, handler; i < len; i++) {
					handler = items[i];
					if (!handler) { continue; };
					var hname = handler[0];
					if (hname.indexOf(name) == 0 && this.bubble() && (hname.length == name.length || hname[name.length] == '.')) {
						this.processHandler(node,hname,handler[1] || []);
					};
				};
				if (!(this.bubble())) { break; };
			};
			
			if (node[meth] instanceof Function) {
				this._responder || (this._responder = node);
				result = args ? node[meth].apply(node,args) : node[meth](this,this.data());
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

