# imba$imbaPath=global
let rAF = global.requestAnimationFrame || (do(blk) setTimeout(blk,1000 / 60))
let FPS = 60

# Scheduler
class Scheduled
	owner = null
	target = null
	active = no
	value = 0
	skip = 0
	last = 0

	def tick scheduler
		last = owner.#frames
		target.tick(owner)

	def update o, activate?
		let on = active
		if value =? o.value
			deactivate!
		
		if value or on or activate?
			activate!
		self

	def queue
		owner.add(self)
		return

	set interval value
		global.clearInterval(#interval)
		#interval = value and global.setInterval(queue.bind(self),value)
	
	def activate
		if value === yes or value >= 30
			owner.on('raf',self)
			interval = null
		else
			owner.un('raf',self)
			if typeof value == 'number'
				let every = (FPS / value) * (1000 / FPS)
				interval = every

		active = yes
		self

	def deactivate
		owner.un('raf',self)
		active = no
		interval = null
		self

export class Scheduler
	def constructor
		id = Symbol!
		self.queue = []
		self.stage = -1
		#stage = -1
		#frames = 0
		#scheduled = no
		
		self.listeners = {}
		self.intervals = {}
		self.commit = do
			add('render')
			return self

		#fps = 0

		$promise = null
		$resolve = null
		#ticker = do(e)
			#scheduled = no
			self.tick(e)
		self

	def add item, force
		if force or self.queue.indexOf(item) == -1
			self.queue.push(item)

		#schedule! unless #scheduled
		return self

	def listen ns, item
		let set = listeners[ns]
		let first = !set
		set ||= listeners[ns] = new Set
		set.add(item)

		add('raf') if ns == 'raf' and first
		self	

	def unlisten ns, item
		let set = listeners[ns]
		set && set.delete(item)
		if ns == 'raf' and set and set.size == 0
			delete listeners.raf
		self

	def on ns,item
		listen(ns,item)

	def un ns,item
		unlisten(ns,item)

	get promise
		$promise ||= new Promise do(resolve)
			$resolve = resolve

	def tick timestamp
		let items = self.queue
		let frame = #frames++
		self.ts = timestamp unless self.ts
		self.dt = timestamp - self.ts
		self.ts = timestamp
		self.queue = []
		#stage = 1

		# calculate frames elapsed since last tick etc?

		if items.length
			for item,i in items
				if typeof item === 'string' && listeners[item]
					listeners[item].forEach do |item|
						if item.tick isa Function
							item.tick(self)
						elif item isa Function
							item(self)
				elif item isa Function
					item(self.dt,self)
				elif item.tick
					item.tick(self.dt,self)

		#stage = #scheduled ? 0 : -1

		if $promise
			$resolve(self)
			$promise = $resolve = null

		if listeners.raf and true
			add('raf')
		self

	def #schedule
		if !#scheduled
			#scheduled = yes
			#stage = 0 if #stage == -1
			rAF(#ticker)
		self

	def schedule item, o
		o ||= (item[id] ||= {value: yes})
		let state = o[id] ||= new Scheduled(owner: self, target: item)
		state.update(o,yes)

	def unschedule item, o = {}
		o ||= item[id]
		let state = o and o[id]
		if state and state.active
			state.deactivate!
		self

export const scheduler = new Scheduler 

export def commit
	scheduler.add('render').promise

export def setTimeout fn,ms
	global.setTimeout(&,ms) do
		fn!
		commit!
		return

export def setInterval fn,ms
	global.setInterval(&,ms) do
		fn!
		commit!
		return

export const clearInterval = global.clearInterval
export const clearTimeout = global.clearTimeout