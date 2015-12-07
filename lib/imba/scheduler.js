(function(){
	function idx$(a,b){
		return (b && b.indexOf) ? b.indexOf(a) : [].indexOf.call(a,b);
	};
	
	
	var raf; // very simple raf polyfill
	raf || (raf = global.requestAnimationFrame);
	raf || (raf = global.webkitRequestAnimationFrame);
	raf || (raf = global.mozRequestAnimationFrame);
	raf || (raf = function(blk) { return setTimeout(blk,1000 / 60); });
	
	Imba.tick = function (d){
		if (this._scheduled) { raf(Imba.ticker()) };
		this.emit(this,'tick',[d]);
		return;
	};
	
	Imba.ticker = function (){
		var self = this;
		return self._ticker || (self._ticker = function(e) { return self.tick(e); });
	};
	
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
			raf(Imba.ticker());
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
	
	Light wrapper around native setTimeout that expects the block / function
	as last argument (instead of first). It also triggers an event to Imba
	after the timeout to let schedulers update (to rerender etc) afterwards.
	
	*/
	
	Imba.setTimeout = function (delay,block){
		return setTimeout(function() {
			block();
			return Imba.emit(Imba,'timeout',[block]);
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
			return Imba.emit(Imba,'interval',[block]);
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
		self._ticker = function(e) { return self.tick(e); };
		
		self._events = true;
		self._fps = 1;
		
		self._dt = 0;
		self._timestamp = 0;
		self._ticks = 0;
		self._flushes = 0;
	};
	
	/*
		Create a new Imba.Scheduler for specified target
		@return {Imba.Scheduler}
		*/
	
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
		Delta time between the two last ticks
		@return {Number}
		*/
	
	Imba.Scheduler.prototype.configure = function (pars){
		if(!pars||pars.constructor !== Object) pars = {};
		var fps = pars.fps !== undefined ? pars.fps : 1;
		var events = pars.events !== undefined ? pars.events : true;
		if (events != null) { this._events = events };
		if (fps != null) { this._fps = fps };
		return this;
	};
	
	// def reschedule
	// 	raf(@ticker)
	// 	self
	
	/*
		Mark the scheduler as dirty. This will make sure that
		the scheduler calls `target.tick` on the next frame
		@return {self}
		*/
	
	Imba.Scheduler.prototype.mark = function (){
		this._marked = true;
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
		this._target.tick();
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
		this._ticks++;
		this._dt = delta;
		
		var fps = this._fps;
		
		if (fps == 60) {
			this._marked = true;
		} else if (fps == 30) {
			if (this._ticks % 2) { this._marked = true };
		} else if (fps) {
			// if it is less round - we trigger based
			// on date, for consistent rendering.
			// ie, if you want to render every second
			// it is important that no two renders
			// happen during the same second (according to Date)
			var period = ((60 / fps) / 60) * 1000;
			var beat = Math.floor(Date.now() / period);
			
			if (this._beat != beat) {
				this._beat = beat;
				this._marked = true;
			};
		};
		
		if (this._marked) this.flush();
		// reschedule if @active
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
			Imba.schedule(this);
			if (this._events) { Imba.listen(Imba,'event',this,'onevent') };
			this._target && this._target.flag  &&  this._target.flag('scheduled_');
			this.tick(0); // start ticking
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
			Imba.unschedule(this);
			Imba.unlisten(Imba,'event',this);
			this._target && this._target.unflag  &&  this._target.unflag('scheduled_');
		};
		return this;
	};
	
	Imba.Scheduler.prototype.track = function (){
		return this._marker;
	};
	
	Imba.Scheduler.prototype.onevent = function (event){
		var $1;
		if (this._marked) { return this };
		
		if (this._events instanceof Function) {
			if (this._events(event)) this.mark();
		} else if (this._events instanceof Array) {
			if (idx$(($1 = event) && $1.type  &&  $1.type(),this._events) >= 0) this.mark();
		} else if (this._events) {
			if (event._responder) this.mark();
		};
		return this;
	};
	return Imba.Scheduler;

})()