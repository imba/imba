// imba$v2=0

var Imba = require("../imba");

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

// this is just for regular mouse now
Imba.Pointer.prototype.process = function (){
	var e1 = this.event;
	
	if (this.dirty) {
		this.prevEvent = e1;
		this.dirty = false;
		
		// button should only change on mousedown etc
		if (e1.type == 'mousedown') {
			this.button = e1.button;
			
			if ((this.touch && this.button != 0)) {
				return;
			};
			
			// cancel the previous touch
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
			// trigger pointerup
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
