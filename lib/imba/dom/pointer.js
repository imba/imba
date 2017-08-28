// imba$nolib=1

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
