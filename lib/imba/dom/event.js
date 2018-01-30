var Imba = require("../imba");

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


Imba.Event.prototype.process = function (){
	var node;
	var meth = ("on" + (this._prefix || '') + this.name());
	var args = null;
	var domtarget = this.event()._target || this.event().target;
	// var node = <{domtarget:_responder or domtarget}>
	// need to clean up and document this behaviour
	
	var domnode = domtarget._responder || domtarget;
	// @todo need to stop infinite redirect-rules here
	var result;
	
	while (domnode){
		this._redirect = null;
		if (node = Imba.getTagForDom(domnode)) { // not only tag 
			
			// FIXME No longer used? 
			if ((typeof node[meth]=='string'||node[meth] instanceof String)) {
				// should remember the receiver of the event
				meth = node[meth];
				continue; // should not continue?
			};
			
			if (node[meth] instanceof Array) {
				args = node[meth].concat(node);
				meth = args.shift();
				continue; // should not continue?
			};
			
			if (node[meth] instanceof Function) {
				this._responder || (this._responder = node);
				// should autostop bubble here?
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

