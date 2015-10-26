
var raf # very simple raf polyfill
raf ||= global:requestAnimationFrame
raf ||= global:webkitRequestAnimationFrame
raf ||= global:mozRequestAnimationFrame
raf ||= do |blk| setTimeout(blk,1000 / 60)

def Imba.tick d
	# how do we start this?
	emit(self,'tick',[d])
	raf(Imba.ticker) if @scheduled
	return

def Imba.ticker
	@ticker ||= do |e| tick(e)

def Imba.schedule obj, meth = 'tick'
	listen(self,'tick',obj,meth)
	# start scheduling now if this was the first one
	unless @scheduled
		@scheduled = yes
		raf(Imba.ticker)
	self

def Imba.unschedule obj, meth
	unlisten(self,'tick',obj,meth)
	var cbs = self:__listeners__ ||= {}
	if !cbs:tick or !cbs:tick:next or !cbs:tick:next:listener
		@scheduled = no
	self

# trackable timeout
def Imba.setTimeout delay, &block
	setTimeout(&,delay) do
		block()
		Imba.emit(Imba,'timeout',[block])

# trackable interval
def Imba.setInterval interval, &block
	setInterval(&,interval) do
		block()
		Imba.emit(Imba,'interval',[block])

def Imba.clearInterval interval
	clearInterval(interval)

def Imba.clearTimeout timeout
	clearTimeout(timeout)

# should add an Imba.run / setImmediate that
# pushes listener onto the tick-queue with times - once

class Imba.Scheduler

	def initialize target
		@target = target
		@marked = no
		@active = no
		@marker = do mark
		@ticker = do |e| tick(e)
		
		@events = yes
		@fps = 1

		@dt = 0
		@timestamp = 0
		@ticks = 0
		@flushes = 0
		self

	def active
		@active

	def dt
		@dt

	def configure o
		@events = o:events if o:events != null
		@fps = o:fps if o:fps != null
		self

	# def reschedule
	# 	raf(@ticker)
	# 	self

	def mark
		@marked = yes
		self

	def flush
		@marked = no
		@flushes++
		@target.tick
		self

	# WARN this expects raf to run at 60 fps
	def tick d
		@ticks++
		@dt = d

		let fps = @fps
		
		if fps == 60
			@marked = yes
		elif fps == 30
			@marked = yes if @ticks % 2
		elif fps
			# if it is less round - we trigger based
			# on date, for consistent rendering.
			# ie, if you want to render every second
			# it is important that no two renders
			# happen during the same second (according to Date)
			let period = ((60 / fps) / 60) * 1000
			let beat = Math.floor(Date.now / period)

			if @beat != beat
				@beat = beat
				@marked = yes

		flush if @marked
		# reschedule if @active
		self

	def activate
		unless @active
			@active = yes
			# override target#commit while this is active
			@commit = @target:commit
			@target:commit = do this
			Imba.schedule(self)
			Imba.listen(Imba,'event',self,'onevent') if @events
			tick(0) # start ticking
		return self

	def deactivate
		if @active
			@active = no
			@target:commit = @commit
			Imba.unschedule(self)
			Imba.unlisten(Imba,'event',self)
		return self

	def track
		@marker

	def onevent e
		return self if @marked

		if @events isa Function
			mark if @events(e)	
		elif @events isa Array
			mark if e?.type in @events
		elif @events
			mark if e.@responder
		self
