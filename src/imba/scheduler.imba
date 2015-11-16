
var raf # very simple raf polyfill
raf ||= global:requestAnimationFrame
raf ||= global:webkitRequestAnimationFrame
raf ||= global:mozRequestAnimationFrame
raf ||= do |blk| setTimeout(blk,1000 / 60)

def Imba.tick d
	raf(Imba.ticker) if @scheduled
	emit(self,'tick',[d])
	return

def Imba.ticker
	@ticker ||= do |e| tick(e)

###

Global alternative to requestAnimationFrame. Schedule a target
to tick every frame. You can specify which method to call on the
target (defaults to tick).

###
def Imba.schedule target, method = 'tick'
	listen(self,'tick',target,method)
	# start scheduling now if this was the first one
	unless @scheduled
		@scheduled = yes
		raf(Imba.ticker)
	self

###

Unschedule a previously scheduled target

###
def Imba.unschedule target, method
	unlisten(self,'tick',target,method)
	var cbs = self:__listeners__ ||= {}
	if !cbs:tick or !cbs:tick:next or !cbs:tick:next:listener
		@scheduled = no
	self

###

Light wrapper around native setTimeout that expects the block / function
as last argument (instead of first). It also triggers an event to Imba
after the timeout to let schedulers update (to rerender etc) afterwards.

###
def Imba.setTimeout delay, &block
	setTimeout(&,delay) do
		block()
		Imba.emit(Imba,'timeout',[block])

###

Light wrapper around native setInterval that expects the block / function
as last argument (instead of first). It also triggers an event to Imba
after every interval to let schedulers update (to rerender etc) afterwards.

###
def Imba.setInterval interval, &block
	setInterval(&,interval) do
		block()
		Imba.emit(Imba,'interval',[block])

###
Clear interval with specified id
###
def Imba.clearInterval interval
	clearInterval(interval)

###
Clear timeout with specified id
###
def Imba.clearTimeout timeout
	clearTimeout(timeout)

# should add an Imba.run / setImmediate that
# pushes listener onto the tick-queue with times - once


###

Instances of Imba.Scheduler manages when to call `tick()` on their target,
at a specified framerate or when certain events occur. Root-nodes in your
applications will usually have a scheduler to make sure they rerender when
something changes. It is also possible to make inner components use their
own schedulers to control when they render.

@iname scheduler

###
class Imba.Scheduler

	###
	Create a new Imba.Scheduler for specified target
	@return {Imba.Scheduler}
	###
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

	###
	Check whether the current scheduler is active or not
	@return {bool}
	###
	def active
		@active

	###
	Delta time between the two last ticks
	@return {Number}
	###
	def dt
		@dt

	###
	Delta time between the two last ticks
	@return {Number}
	###
	def configure fps: 1, events: yes
		@events = events if events != null
		@fps = fps if fps != null
		self

	# def reschedule
	# 	raf(@ticker)
	# 	self

	###
	Mark the scheduler as dirty. This will make sure that
	the scheduler calls `target.tick` on the next frame
	@return {self}
	###
	def mark
		@marked = yes
		self

	###
	Instantly trigger target.tick and mark scheduler as clean (not dirty/marked).
	This is called implicitly from tick, but can also be called manually if you
	really want to force a tick without waiting for the next frame.
	@return {self}
	###
	def flush
		@marked = no
		@flushes++
		@target.tick
		self

	###
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
	###
	def tick delta
		@ticks++
		@dt = delta

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

	###
	Start the scheduler if it is not already active.
	**While active**, the scheduler will override `target.commit`
	to do nothing. By default Imba.tag#commit calls render, so
	that rendering is cascaded through to children when rendering
	a node. When a scheduler is active (for a node), Imba disables
	this automatic rendering.
	###
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

	###
	Stop the scheduler if it is active.
	###
	def deactivate
		if @active
			@active = no
			@target:commit = @commit
			Imba.unschedule(self)
			Imba.unlisten(Imba,'event',self)
		return self

	def track
		@marker

	def onevent event
		return self if @marked

		if @events isa Function
			mark if @events(event)	
		elif @events isa Array
			mark if event?.type in @events
		elif @events
			mark if event.@responder
		self
