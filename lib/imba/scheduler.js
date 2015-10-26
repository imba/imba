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
		// how do we start this?
		this.emit(this,'tick',[d]);
		if (this._scheduled) { raf(Imba.ticker()) };
		return;
	};
	
	Imba.ticker = function (){
		var self = this;
		return self._ticker || (self._ticker = function(e) { return self.tick(e); });
	};
	
	Imba.schedule = function (obj,meth){
		if(meth === undefined) meth = 'tick';
		this.listen(this,'tick',obj,meth);
		// start scheduling now if this was the first one
		if (!this._scheduled) {
			this._scheduled = true;
			raf(Imba.ticker());
		};
		return this;
	};
	
	Imba.unschedule = function (obj,meth){
		this.unlisten(this,'tick',obj,meth);
		var cbs = this.__listeners__ || (this.__listeners__ = {});
		if (!cbs.tick || !cbs.tick.next || !cbs.tick.next.listener) {
			this._scheduled = false;
		};
		return this;
	};
	
	// trackable timeout
	Imba.setTimeout = function (delay,block){
		return setTimeout(function() {
			block();
			return Imba.emit(Imba,'timeout',[block]);
		},delay);
	};
	
	// trackable interval
	Imba.setInterval = function (interval,block){
		return setInterval(function() {
			block();
			return Imba.emit(Imba,'interval',[block]);
		},interval);
	};
	
	Imba.clearInterval = function (interval){
		return clearInterval(interval);
	};
	
	Imba.clearTimeout = function (timeout){
		return clearTimeout(timeout);
	};
	
	// should add an Imba.run / setImmediate that
	// pushes listener onto the tick-queue with times - once
	
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
		self;
	};
	
	Imba.Scheduler.prototype.active = function (){
		return this._active;
	};
	
	Imba.Scheduler.prototype.dt = function (){
		return this._dt;
	};
	
	Imba.Scheduler.prototype.configure = function (o){
		if (o.events != null) { this._events = o.events };
		if (o.fps != null) { this._fps = o.fps };
		return this;
	};
	
	// def reschedule
	// 	raf(@ticker)
	// 	self
	
	Imba.Scheduler.prototype.mark = function (){
		this._marked = true;
		return this;
	};
	
	Imba.Scheduler.prototype.flush = function (){
		this._marked = false;
		this._flushes++;
		this._target.tick();
		return this;
	};
	
	// WARN this expects raf to run at 60 fps
	Imba.Scheduler.prototype.tick = function (d){
		this._ticks++;
		this._dt = d;
		
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
	
	Imba.Scheduler.prototype.activate = function (){
		if (!this._active) {
			this._active = true;
			// override target#commit while this is active
			this._commit = this._target.commit;
			this._target.commit = function() { return this; };
			Imba.schedule(this);
			if (this._events) { Imba.listen(Imba,'event',this,'onevent') };
			this.tick(0); // start ticking
		};
		return this;
	};
	
	Imba.Scheduler.prototype.deactivate = function (){
		if (this._active) {
			this._active = false;
			this._target.commit = this._commit;
			Imba.unschedule(this);
			Imba.unlisten(Imba,'event',this);
		};
		return this;
	};
	
	Imba.Scheduler.prototype.track = function (){
		return this._marker;
	};
	
	Imba.Scheduler.prototype.onevent = function (e){
		var $1;
		if (this._marked) { return this };
		
		if (this._events instanceof Function) {
			if (this._events(e)) this.mark();
		} else if (this._events instanceof Array) {
			if (idx$(($1 = e) && $1.type  &&  $1.type(),this._events) >= 0) this.mark();
		} else if (this._events) {
			if (e._responder) this.mark();
		};
		return this;
	};
	return Imba.Scheduler;

})()