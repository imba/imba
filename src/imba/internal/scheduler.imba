var raf = typeof requestAnimationFrame !== 'undefined' ? requestAnimationFrame : (do |blk| setTimeout(blk,1000 / 60))

# Scheduler
export class Scheduler
	def constructor
		@queue = []
		@stage = -1
		@batch = 0
		@scheduled = no
		@listeners = {}

		#ticker = do |e|
			@scheduled = no
			@tick(e)
		self

	def add item, force
		if force or @queue.indexOf(item) == -1
			@queue.push(item)

		@schedule() unless @scheduled

	def listen ns, item
		@listeners[ns] ||= Set.new()
		@listeners[ns].add(item)

	def unlisten ns, item
		@listeners[ns] && @listeners[ns].delete(item)

	get promise
		Promise.new do |resolve| @add(resolve)

	def tick timestamp
		var items = @queue
		@ts = timestamp unless @ts
		@dt = timestamp - @ts
		@ts = timestamp
		@queue = []
		@stage = 1
		@batch++

		if items.length
			for item,i in items
				if typeof item === 'string' && @listeners[item]
					@listeners[item].forEach do |item|
						if item.tick isa Function
							item.tick(self)
						elif item isa Function
							item(self)
				elif item isa Function
					item(@dt,self)
				elif item.tick
					item.tick(@dt,self)
		@stage = 2
		@stage = @scheduled ? 0 : -1
		self

	def schedule
		if !@scheduled
			@scheduled = yes
			if @stage == -1
				@stage = 0
			raf(#ticker)
		self