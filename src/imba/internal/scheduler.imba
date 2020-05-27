var raf = typeof requestAnimationFrame !== 'undefined' ? requestAnimationFrame : (do |blk| setTimeout(blk,1000 / 60))

# Scheduler
export class Scheduler
	def constructor
		self.queue = []
		self.stage = -1
		self.batch = 0
		self.scheduled = no
		self.listeners = {}

		$ticker = do |e|
			self.scheduled = no
			self.tick(e)
		self

	def add item, force
		if force or self.queue.indexOf(item) == -1
			self.queue.push(item)

		self.schedule() unless self.scheduled

	def listen ns, item
		self.listeners[ns] ||= new Set()
		self.listeners[ns].add(item)

	def unlisten ns, item
		self.listeners[ns] && self.listeners[ns].delete(item)

	get promise
		new Promise do |resolve| self.add(resolve)

	def tick timestamp
		var items = self.queue
		self.ts = timestamp unless self.ts
		self.dt = timestamp - self.ts
		self.ts = timestamp
		self.queue = []
		self.stage = 1
		self.batch++

		if items.length
			for item,i in items
				if typeof item === 'string' && self.listeners[item]
					self.listeners[item].forEach do |item|
						if item.tick isa Function
							item.tick(self)
						elif item isa Function
							item(self)
				elif item isa Function
					item(self.dt,self)
				elif item.tick
					item.tick(self.dt,self)
		self.stage = 2
		self.stage = self.scheduled ? 0 : -1
		self

	def schedule
		if !self.scheduled
			self.scheduled = yes
			if self.stage == -1
				self.stage = 0
			raf($ticker)
		self