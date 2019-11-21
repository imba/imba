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

var scheduled = Imba.scheduled ||= Set.new()

class Ticker
	def initialize
		@queue = []
		@stage = -1
		@batch = 0
		@scheduled = no
		#ticker = do |e|
			@scheduled = no
			@tick(e)
		self

	def add item, force
		if force or @queue.indexOf(item) == -1
			@queue.push(item)

		@schedule() unless @scheduled

	get promise
		Promise.new do |resolve| @add(resolve)

	def tick timestamp
		var items = @queue
		@ts = timestamp unless @ts
		@dt = timestamp - @ts
		@ts = timestamp
		@queue = []
		@stage = 1
		@before()
		@batch++

		if items.length
			for item,i in items
				if item == 'commit'
					Imba.scheduled.forEach do |item|
						if item.tick isa Function
							item.tick(self)
						elif item isa Function
							item(self)
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
		self

Imba.ticker = Ticker.new()
Imba.SCHEDULERS = []

def Imba.requestAnimationFrame callback
	requestAnimationFrame(callback)

def Imba.cancelAnimationFrame id
	cancelAnimationFrame(id)

# should add an Imba.run / setImmediate that
# pushes listener onto the tick-queue with times - once

def Imba.commit params
	Imba.ticker.add('commit')
	return