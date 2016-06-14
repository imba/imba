
var requestAnimationFrame # very simple raf polyfill
var cancelAnimationFrame

if $node$
	cancelAnimationFrame = do |id| clearTimeout(id)
	requestAnimationFrame = do |blk| setTimeout(blk,1000 / 60)

if $web$
	cancelAnimationFrame = window:cancelAnimationFrame || window:mozCancelAnimationFrame || window:webkitRequestAnimationFrame
	requestAnimationFrame = window:requestAnimationFrame
	requestAnimationFrame ||= window:webkitRequestAnimationFrame
	requestAnimationFrame ||= window:mozRequestAnimationFrame
	requestAnimationFrame ||= do |blk| setTimeout(blk,1000 / 60)

class Ticker

	prop stage
	prop queue

	def initialize
		@queue = []
		@stage = -1
		@scheduled = no
		@ticker = do |e|
			@scheduled = no
			tick(e)
		self

	def add item
		@queue.push(item)
		schedule unless @scheduled

	def tick timestamp
		var items = @queue
		@ts = timestamp unless @ts
		@dt = timestamp - @ts
		@ts = timestamp
		@queue = []
		@stage = 1
		before
		if items:length
			for item,i in items
				if item isa Function
					item(@dt,self)
				elif item:tick
					item.tick(@dt,self)
		@stage = 2
		after
		@stage = 0
		self

	def schedule
		if !@scheduled
			@scheduled = yes
			requestAnimationFrame(@ticker)
		self

	def before
		self

	def after
		Imba.commit
		self

Imba.TICKER = Ticker.new

def Imba.tick d
	return

def Imba.commit
	Imba.TagManager.refresh

def Imba.ticker
	@ticker ||= do |e|
		Imba.SCHEDULED = no
		Imba.tick(e)

def Imba.requestAnimationFrame callback
	requestAnimationFrame(callback)

def Imba.cancelAnimationFrame id
	cancelAnimationFrame(id)

###

Light wrapper around native setTimeout that expects the block / function
as last argument (instead of first). It also triggers an event to Imba
after the timeout to let schedulers update (to rerender etc) afterwards.

###
def Imba.setTimeout delay, &block
	setTimeout(&,delay) do
		block()
		Imba.commit
		# Imba.Scheduler.markDirty
		# Imba.emit(Imba,'timeout',[block])

###

Light wrapper around native setInterval that expects the block / function
as last argument (instead of first). It also triggers an event to Imba
after every interval to let schedulers update (to rerender etc) afterwards.

###
def Imba.setInterval interval, &block
	setInterval(&,interval) do
		block()
		Imba.commit
		# Imba.Scheduler.markDirty
		# Imba.emit(Imba,'interval',[block])

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

Global alternative to requestAnimationFrame. Schedule a target
to tick every frame. You can specify which method to call on the
target (defaults to tick).

###
def Imba.schedule target, method = 'tick'
	listen(self,'tick',target,method)
	# start scheduling now if this was the first one
	unless @scheduled
		@scheduled = yes
		requestAnimationFrame(Imba.ticker)
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

Instances of Imba.Scheduler manages when to call `tick()` on their target,
at a specified framerate or when certain events occur. Root-nodes in your
applications will usually have a scheduler to make sure they rerender when
something changes. It is also possible to make inner components use their
own schedulers to control when they render.

@iname scheduler

###
class Imba.Scheduler
	var counter = 0
	def self.markDirty
		@dirty = yes
		self

	def self.isDirty
		!!@dirty

	def self.willRun
		@active = yes

	def self.didRun
		@active = no
		@dirty = no
		Imba.TagManager.refresh

	def self.isActive
		!!@active

	###
	Create a new Imba.Scheduler for specified target
	@return {Imba.Scheduler}
	###
	def initialize target
		@id = counter++
		@target = target
		@marked = no
		@active = no
		@marker = do mark
		@ticker = do |e| tick(e)

		@dt = 0
		@state = {raf: no, event: no, interval: no}
		@scheduled = no
		@timestamp = 0
		@ticks = 0
		@flushes = 0
		self

	prop raf watch: yes
	prop interval watch: yes
	prop events watch: yes

	def rafDidSet bool
		@state:raf = bool
		requestTick if bool
		self

	def intervalDidSet time
		clearInterval(@intervalId)

		if time
			@intervalId = Imba.setInterval(time,@ticker)
		self

	def eventsDidSet new, prev
		if new
			Imba.listen(Imba,'event',self,'onevent')
		else
			Imba.unlisten(Imba,'event',self,'onevent')

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
	Configure the scheduler
	@return {self}
	###
	def configure options = {} # fps: 1, events: yes
		raf = options:raf if options:raf != undefined
		interval = options:interval if options:interval != undefined
		events = options:events if options:events != undefined
		self

	###
	Mark the scheduler as dirty. This will make sure that
	the scheduler calls `target.tick` on the next frame
	@return {self}
	###
	def mark
		if !@scheduled
			requestTick
		self

	###
	Instantly trigger target.tick and mark scheduler as clean (not dirty/marked).
	This is called implicitly from tick, but can also be called manually if you
	really want to force a tick without waiting for the next frame.
	@return {self}
	###
	def flush
		@flushes++
		@target.tick(@state,self)
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
	def tick delta, ticker
		@ticks++
		@dt = delta

		if ticker
			@scheduled = no

		flush

		if @raf
			requestTick
		self

	def requestTick
		unless @scheduled
			@scheduled = yes
			Imba.TICKER.add(self)
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
			@commit = @target:commit
			@target:commit = do this
			@target?.flag('scheduled_')
			tick(0)

		return self

	###
	Stop the scheduler if it is active.
	###
	def deactivate
		@restoreState = {events: events, raf: raf, interval: interval}
		events = no
		raf = no
		interval = 0

		if @active
			@active = no
			@target:commit = @commit
			# Imba.unschedule(self)
			# Imba.unlisten(Imba,'event',self)
			@target?.unflag('scheduled_')
		return self

	def track
		@marker

	def onevent event
		return self if @scheduled or !@events

		if @events isa Function
			mark if @events(event)	
		elif @events isa Array
			mark if event?.type in @events
		else
			mark
		self
