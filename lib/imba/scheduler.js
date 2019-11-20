function iter$(a){ return a ? (a.toArray ? a.toArray() : a) : []; };
var Imba_, scheduled_;
var Imba = require("./imba");

var requestAnimationFrame; // very simple raf polyfill
var cancelAnimationFrame;

if (true) {
	cancelAnimationFrame = function(id) { return clearTimeout(id); };
	requestAnimationFrame = function(blk) { return setTimeout(blk,1000 / 60); };
};

if (false) {};

var scheduled = (scheduled_ = Imba.scheduled) || (Imba.scheduled = new Set());

function Ticker(){
	var self = this;
	self.queue = [];
	self.stage = -1;
	self.batch = 0;
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
	var self = this;
	var items = self.queue;
	if (!self.ts) { self.ts = timestamp };
	self.dt = timestamp - self.ts;
	self.ts = timestamp;
	self.queue = [];
	self.stage = 1;
	self.before();
	self.batch++;
	
	if (items.length) {
		for (let i = 0, ary = iter$(items), len = ary.length, item; i < len; i++) {
			item = ary[i];
			if (item == 'commit') {
				Imba.scheduled.forEach(function(item) {
					if (item.tick instanceof Function) {
						return item.tick(self);
					} else if (item instanceof Function) {
						return item(self);
					};
				});
			};
			if (item instanceof Function) {
				item(self.dt,self);
			} else if (item.tick) {
				item.tick(self.dt,self);
			};
		};
	};
	self.stage = 2;
	self.after();
	self.stage = self.scheduled ? 0 : (-1);
	return self;
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
	return this;
};

Imba.ticker = new Ticker();
Imba.SCHEDULERS = [];

Imba.requestAnimationFrame = function (callback){
	return requestAnimationFrame(callback);
};

Imba.cancelAnimationFrame = function (id){
	return cancelAnimationFrame(id);
};

// should add an Imba.run / setImmediate that
// pushes listener onto the tick-queue with times - once

Imba.commit = function (params){
	// return if committed
	Imba.ticker.add('commit');
	// Imba.TagManager.refresh
	// Imba.emit(Imba,'commit',params != undefined ? [params] : undefined)
	// if --commitQueue == 0
	// 	Imba.TagManager and Imba.TagManager.refresh()
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

/*
	Create a new Imba.Scheduler for specified target
	@return {Imba.Scheduler}
	*/

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

/*
	Check whether the current scheduler is active or not
	@return {bool}
	*/

// def active
// 	@active

/*
	Delta time between the two last ticks
	@return {Number}
	*/

// def dt
// 	@dt

/*
	Configure the scheduler
	@return {self}
	*/

Imba.Scheduler.prototype.configure = function (options){
	if(options === undefined) options = {};
	if (options.raf != undefined) { this.raf = options.raf };
	if (options.interval != undefined) { this.interval = options.interval };
	if (options.events != undefined) { this.events = options.events };
	return this;
};

/*
	Mark the scheduler as dirty. This will make sure that
	the scheduler calls `target.tick` on the next frame
	@return {self}
	*/

Imba.Scheduler.prototype.mark = function (){
	this.marked = true;
	if (!this.scheduled) {
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
	this.flushes++;
	this.target.tick(this);
	this.marked = false;
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

/*
	Stop the scheduler if it is active.
	*/

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
