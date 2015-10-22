
var raf # very simple raf polyfill
raf ||= global:requestAnimationFrame
raf ||= global:webkitRequestAnimationFrame
raf ||= global:mozRequestAnimationFrame
raf ||= do |blk| setTimeout(blk,1000 / 60)

# add methods to element
extend tag element

	def scheduler
		@scheduler ?= Scheduler.new(self)

	def schedule o = {}
		scheduler.configure(o).activate
		self

	def unschedule
		scheduler.deactivate if @scheduler
		self

	def tick
		render
		self

export class Scheduler

	def initialize target
		@target = target
		@marked    = no
		@active    = no
		@marker    = do mark
		@ticker    = do |e| tick(e)
		
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

	def reschedule
		raf(@ticker)
		# requestAnimationFrame(@ticker)
		self

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
		reschedule if @active
		self

	def activate
		unless @active
			@active = yes

			# override target#commit while this is active
			@commit = @target:commit
			@target:commit = do this
			Imba.listen(Imba,'event',self,'onevent') if @events
			tick(0) # start ticking
		return self

	def deactivate
		if @active
			@active = no
			@target:commit = @commit
			Imba.unlisten(Imba,'event',self)
		return self

	def track
		@marker

	def onevent e
		if @events isa Function
			mark if @events(e)	
		elif @events isa Array
			mark if e?.type in @events
		elif @events
			mark if e.@responder
		self
