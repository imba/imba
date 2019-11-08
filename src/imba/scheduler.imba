var Imba = require("./imba")

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
	def initialize
		@queue = []
		@stage = -1
		@scheduled = no
		#ticker = do |e|
			@scheduled = no
			@tick(e)
		self

	def add item, force
		if force or @queue.indexOf(item) == -1
			@queue.push(item)

		@schedule() unless @scheduled

	def tick timestamp
		var items = @queue
		@ts = timestamp unless @ts
		@dt = timestamp - @ts
		@ts = timestamp
		@queue = []
		@stage = 1
		@before()
		if items.length
			for item,i in items
				if item isa Function
					item(@dt,self)
				elif item.tick
					item.tick(@dt,self)
		@stage = 2
		@after()
		@stage = @scheduled ? 0 : -1
		self

	def schedule
		if !@scheduled
			@scheduled = yes
			if @stage == -1
				@stage = 0
			requestAnimationFrame(#ticker)
		self

	def before
		self

	def after
		if Imba.TagManager
			Imba.TagManager.refresh()
		self

Imba.TICKER = Ticker.new()
Imba.SCHEDULERS = []

def Imba.ticker
	Imba.TICKER

def Imba.requestAnimationFrame callback
	requestAnimationFrame(callback)

def Imba.cancelAnimationFrame id
	cancelAnimationFrame(id)

# should add an Imba.run / setImmediate that
# pushes listener onto the tick-queue with times - once

var commitQueue = 0

def Imba.commit params
	commitQueue++
	# Imba.TagManager.refresh
	Imba.emit(Imba,'commit',params != undefined ? [params] : undefined)
	if --commitQueue == 0
		Imba.TagManager and Imba.TagManager.refresh()
	return

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

	def self.event e
		Imba.emit(Imba,'event',e)

	###
	Create a new Imba.Scheduler for specified target
	@return {Imba.Scheduler}
	###
	def initialize target
		@id = counter++
		@target = target
		@marked = no
		@active = no
		@marker = do @mark()
		@ticker = do |e| @tick(e)

		@dt = 0
		@frame = {}
		@scheduled = no
		@timestamp = 0
		@ticks = 0
		@flushes = 0

		@onevent = @onevent.bind(self)
		self

	prop raf watch: yes
	prop interval watch: yes
	prop events watch: yes
	prop marked

	def rafDidSet bool
		@requestTick() if bool and @active
		self

	def intervalDidSet time
		clearInterval(@intervalId)
		@intervalId = null
		if time and @active
			@intervalId = setInterval(@oninterval.bind(self),time)
		self

	def eventsDidSet new, prev
		if @active and new and !prev
			Imba.listen(Imba,'commit',self,'onevent')
		elif !new and prev
			Imba.unlisten(Imba,'commit',self,'onevent')

	###
	Check whether the current scheduler is active or not
	@return {bool}
	###
	# def active
	# 	@active

	###
	Delta time between the two last ticks
	@return {Number}
	###
	# def dt
	# 	@dt

	###
	Configure the scheduler
	@return {self}
	###
	def configure options = {}
		@raf = options.raf if options.raf != undefined
		@interval = options.interval if options.interval != undefined
		@events = options.events if options.events != undefined
		self

	###
	Mark the scheduler as dirty. This will make sure that
	the scheduler calls `target.tick` on the next frame
	@return {self}
	###
	def mark
		@marked = yes
		if !@scheduled
			@requestTick()
		self

	###
	Instantly trigger target.tick and mark scheduler as clean (not dirty/marked).
	This is called implicitly from tick, but can also be called manually if you
	really want to force a tick without waiting for the next frame.
	@return {self}
	###
	def flush
		@flushes++
		@target.tick(self)
		@marked = no
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

		@flush()

		if @raf and @active
			@requestTick()
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
	def activate immediate = yes
		unless @active
			@active = yes
			@commit = @target.commit
			@target.commit = do this
			@target?.flag('scheduled_')
			Imba.SCHEDULERS.push(self)
			
			if @events
				Imba.listen(Imba,'commit',self,'onevent')
				
			if @interval and !@intervalId
				@intervalId = setInterval(@oninterval.bind(self),@interval)

			if immediate
				@tick(0)
			elif @raf
				@requestTick()
		return self

	###
	Stop the scheduler if it is active.
	###
	def deactivate
		if @active
			@active = no
			@target.commit = @commit
			let idx = Imba.SCHEDULERS.indexOf(self)
			if idx >= 0
				Imba.SCHEDULERS.splice(idx,1)
				
			if @events
				Imba.unlisten(Imba,'commit',self,'onevent')

			if @intervalId
				clearInterval(@intervalId)
				@intervalId = null
			
			@target?.unflag('scheduled_')
		return self

	def track
		@marker
		
	def oninterval
		@tick()
		Imba.TagManager.refresh()
		self

	def onevent event
		return self if !@events or @marked

		if @events isa Function
			@mark() if @events(event,self)
		elif @events isa Array
			if @events.indexOf((event and event.type) or event) >= 0
				@mark()
		else
			@mark()
		self
