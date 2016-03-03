(function(){
	function idx$(a,b){
		return (b && b.indexOf) ? b.indexOf(a) : [].indexOf.call(a,b);
	};
	
	function iter$(a){ return a ? (a.toArray ? a.toArray() : a) : []; };
	
	var requestAnimationFrame; // very simple raf polyfill
	var cancelAnimationFrame;
	
	if (ENV_NODE) {
		cancelAnimationFrame = function(id) { return clearTimeout(id); };
		requestAnimationFrame = function(blk) { return setTimeout(blk,1000 / 60); };
	};
	
	if (ENV_WEB) {
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
	
	Ticker.prototype.add = function (item){
		this._queue.push(item);
		if (!this._scheduled) { return this.schedule() };
	};
	
	Ticker.prototype.tick = function (e){
		var items = this._queue;
		this._queue = [];
		this._stage = 1;
		this.before();
		if (items.length) {
			for (var i = 0, ary = iter$(items), len = ary.length, item; i < len; i++) {
				item = ary[i];
				if (item instanceof Function) {
					item(e);
				} else if (item.tick) {
					item.tick(e,this);
				};
			};
		};
		this._stage = 2;
		this.after();
		this._stage = 0;
		return this;
	};
	
	Ticker.prototype.schedule = function (){
		if (!this._scheduled) {
			this._scheduled = true;
			requestAnimationFrame(this._ticker);
		};
		return this;
	};
	
	Ticker.prototype.before = function (){
		// Imba.Scheduler.willRun
		return this;
	};
	
	Ticker.prototype.after = function (){
		// Imba.Scheduler.didRun
		Imba.commit();
		return this;
	};
	
	Imba.TICKER = new Ticker();
	
	Imba.tick = function (d){
		// raf(Imba.ticker) if @scheduled
		// Imba.Scheduler.willRun
		// emit(self,'tick',[d])
		// Imba.Scheduler.didRun
		return;
	};
	
	Imba.commit = function (){
		return Imba.TagManager.refresh();
	};
	
	Imba.ticker = function (){
		return this._ticker || (this._ticker = function(e) {
			Imba.SCHEDULED = false;
			return Imba.tick(e);
		});
	};
	
	Imba.requestAnimationFrame = function (callback){
		return requestAnimationFrame(callback);
	};
	
	Imba.cancelAnimationFrame = function (id){
		return cancelAnimationFrame(id);
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
			// Imba.Scheduler.markDirty
			// Imba.emit(Imba,'timeout',[block])
		},delay);
	};
	
	/*
	
	Light wrapper around native setInterval that expects the block / function
	as last argument (instead of first). It also triggers an event to Imba
	after every interval to let schedulers update (to rerender etc) afterwards.
	
	*/
	
	Imba.setInterval = function (interval,block){
		return setInterval(function() {
			block();
			return Imba.commit();
			// Imba.Scheduler.markDirty
			// Imba.emit(Imba,'interval',[block])
		},interval);
	};
	
	/*
	Clear interval with specified id
	*/
	
	Imba.clearInterval = function (interval){
		return clearInterval(interval);
	};
	
	/*
	Clear timeout with specified id
	*/
	
	Imba.clearTimeout = function (timeout){
		return clearTimeout(timeout);
	};
	
	// should add an Imba.run / setImmediate that
	// pushes listener onto the tick-queue with times - once
	
	
	/*
	
	Global alternative to requestAnimationFrame. Schedule a target
	to tick every frame. You can specify which method to call on the
	target (defaults to tick).
	
	*/
	
	Imba.schedule = function (target,method){
		if(method === undefined) method = 'tick';
		this.listen(this,'tick',target,method);
		// start scheduling now if this was the first one
		if (!this._scheduled) {
			this._scheduled = true;
			requestAnimationFrame(Imba.ticker());
		};
		return this;
	};
	
	/*
	
	Unschedule a previously scheduled target
	
	*/
	
	Imba.unschedule = function (target,method){
		this.unlisten(this,'tick',target,method);
		var cbs = this.__listeners__ || (this.__listeners__ = {});
		if (!cbs.tick || !cbs.tick.next || !cbs.tick.next.listener) {
			this._scheduled = false;
		};
		return this;
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
		self._target = target;
		self._marked = false;
		self._active = false;
		self._marker = function() { return self.mark(); };
		
		self._ticker = function(e) {
			// @scheduled = no
			return self.tick(e);
		};
		
		self._dt = 0;
		self._state = {raf: false,event: false,interval: false};
		self._scheduled = false;
		self._timestamp = 0;
		self._ticks = 0;
		self._flushes = 0;
		self;
	};
	
	Imba.Scheduler.markDirty = function (){
		this._dirty = true;
		return this;
	};
	
	Imba.Scheduler.isDirty = function (){
		return !!this._dirty;
	};
	
	Imba.Scheduler.willRun = function (){
		return this._active = true;
	};
	
	Imba.Scheduler.didRun = function (){
		this._active = false;
		this._dirty = false;
		return Imba.TagManager.refresh();
	};
	
	Imba.Scheduler.isActive = function (){
		return !!this._active;
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
	
	Imba.Scheduler.prototype.rafDidSet = function (bool){
		console.log('rafDidSet');
		this._state.raf = bool;
		if (bool) this.requestTick();
		return this;
	};
	
	Imba.Scheduler.prototype.intervalDidSet = function (time){
		clearInterval(this._intervalId);
		
		if (time) {
			this._intervalId = Imba.setInterval(time,this._ticker);
		};
		return this;
	};
	
	Imba.Scheduler.prototype.eventsDidSet = function (new$,prev){
		if (new$) {
			return Imba.listen(Imba,'event',this,'onevent');
		} else {
			return Imba.unlisten(Imba,'event',this,'onevent');
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
	
	Imba.Scheduler.prototype.configure = function (o){ // fps: 1, events: yes
		var v_;
		if(o === undefined) o = {};
		if (o.raf != undefined) { (this.setRaf(v_ = o.raf),v_) };
		if (o.interval != undefined) { (this.setInterval(v_ = o.interval),v_) };
		if (o.events != undefined) { (this.setEvents(v_ = o.events),v_) };
		// @events = events if events != null
		// @fps = fps if fps != null
		return this;
	};
	
	/*
		Mark the scheduler as dirty. This will make sure that
		the scheduler calls `target.tick` on the next frame
		@return {self}
		*/
	
	Imba.Scheduler.prototype.mark = function (){
		if (!this._scheduled) {
			// console.log('Scheduler was #marked')
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
		this._marked = false;
		this._flushes++;
		this._target.tick(this._state,this);
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
	
	Imba.Scheduler.prototype.tick = function (delta){
		// console.log("ticking",@target.dom)
		this._scheduled = false;
		this._ticks++;
		this._dt = delta;
		this.flush();
		if (this._raf && !this._scheduled) this.requestTick();
		return this;
	};
	
	Imba.Scheduler.prototype.requestTick = function (){
		// console.log 'Scheduler requestTick'
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
	
	Imba.Scheduler.prototype.activate = function (){
		if (!this._active) {
			this._active = true;
			// override target#commit while this is active
			this._commit = this._target.commit;
			this._target.commit = function() { return this; };
			// should track when commit comes from 
			// Imba.schedule(self)
			// Imba.listen(Imba,'event',self,'onevent') if @events
			this._target && this._target.flag  &&  this._target.flag('scheduled_');
			this.tick(0); // start ticking
		};
		return this;
	};
	
	/*
		Stop the scheduler if it is active.
		*/
	
	Imba.Scheduler.prototype.deactivate = function (){
		console.log('deactivate scheduler');
		this._restoreState = {events: this.events(),raf: this.raf(),interval: this.interval()};
		this.setEvents(false);
		this.setRaf(false);
		this.setInterval(0);
		
		if (this._active) {
			this._active = false;
			this._target.commit = this._commit;
			// Imba.unschedule(self)
			// Imba.unlisten(Imba,'event',self)
			this._target && this._target.unflag  &&  this._target.unflag('scheduled_');
		};
		return this;
	};
	
	Imba.Scheduler.prototype.track = function (){
		return this._marker;
	};
	
	Imba.Scheduler.prototype.onevent = function (event){
		var $1;
		if (this._marked || !this._events) { return this };
		
		if (this._events instanceof Function) {
			if (this._events(event)) this.mark();
		} else if (this._events instanceof Array) {
			if (idx$(($1 = event) && $1.type  &&  $1.type(),this._events) >= 0) this.mark();
		} else {
			this.mark();
		};
		return this;
	};
	return Imba.Scheduler;

})();