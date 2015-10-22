(function(){
	function idx$(a,b){
		return (b && b.indexOf) ? b.indexOf(a) : [].indexOf.call(a,b);
	};
	
	
	var raf; // very simple raf polyfill
	raf || (raf = global.requestAnimationFrame);
	raf || (raf = global.webkitRequestAnimationFrame);
	raf || (raf = global.mozRequestAnimationFrame);
	raf || (raf = function(blk) { return setTimeout(blk,1000 / 60); });
	
	// add methods to element
	Imba.extendTag('element', function(tag){
		
		tag.prototype.scheduler = function (){
			return this._scheduler == null ? (this._scheduler = new Scheduler(this)) : (this._scheduler);
		};
		
		tag.prototype.schedule = function (o){
			if(o === undefined) o = {};
			this.scheduler().configure(o).activate();
			return this;
		};
		
		tag.prototype.unschedule = function (){
			if (this._scheduler) { this.scheduler().deactivate() };
			return this;
		};
		
		tag.prototype.tick = function (){
			this.render();
			return this;
		};
	});
	
	function Scheduler(target){
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
	
	exports.Scheduler = Scheduler; // export class 
	Scheduler.prototype.active = function (){
		return this._active;
	};
	
	Scheduler.prototype.dt = function (){
		return this._dt;
	};
	
	Scheduler.prototype.configure = function (o){
		if (o.events != null) { this._events = o.events };
		if (o.fps != null) { this._fps = o.fps };
		return this;
	};
	
	Scheduler.prototype.reschedule = function (){
		raf(this._ticker);
		// requestAnimationFrame(@ticker)
		return this;
	};
	
	Scheduler.prototype.mark = function (){
		this._marked = true;
		return this;
	};
	
	Scheduler.prototype.flush = function (){
		this._marked = false;
		this._flushes++;
		this._target.tick();
		return this;
	};
	
	// WARN this expects raf to run at 60 fps
	Scheduler.prototype.tick = function (d){
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
		if (this._active) this.reschedule();
		return this;
	};
	
	Scheduler.prototype.activate = function (){
		if (!this._active) {
			this._active = true;
			
			// override target#commit while this is active
			this._commit = this._target.commit;
			this._target.commit = function() { return this; };
			if (this._events) { Imba.listen(Imba,'event',this,'onevent') };
			this.tick(0); // start ticking
		};
		return this;
	};
	
	Scheduler.prototype.deactivate = function (){
		if (this._active) {
			this._active = false;
			this._target.commit = this._commit;
			Imba.unlisten(Imba,'event',this);
		};
		return this;
	};
	
	Scheduler.prototype.track = function (){
		return this._marker;
	};
	
	Scheduler.prototype.onevent = function (e){
		var $1;
		if (this._events instanceof Function) {
			if (this._events(e)) this.mark();
		} else if (this._events instanceof Array) {
			if (idx$(($1 = e) && $1.type  &&  $1.type(),this._events) >= 0) this.mark();
		} else if (this._events) {
			if (e._responder) this.mark();
		};
		return this;
	};
	return Scheduler;

})()