# imba$imbaPath=global
let rAF = global.requestAnimationFrame || (do(blk) setTimeout(blk,1000 / 60))
let FPS = 60
let SPF = 1 / 60

let parseCache = {}

# TODO use ms as the internal unit instead of this clunky framecount

def parseScheduleValue input
	if input === true or input === false or input === null
		return input

	let v = parseCache[input]
	return v if v !== undefined
	let val = input
	if typeof val == 'string'
		if val.match(/^\d+fps$/)
			val = 60 / parseInt(val)
		elif val.match(/^[\d\.]+s$/)
			val = parseFloat(val) / (1 / 60)
		elif val.match(/^[\d\.]+ms$/)
			val = parseFloat(val) / (1000 / 60)
	return parseCache[input] = val
		
# Scheduler
class Scheduled
	owner = null
	target = null
	active = no
	value = undefined
	skip = 0
	last = 0

	def tick scheduler
		last = owner.#frames
		target.tick(owner)

	def update o, activate?
		let on = active
		let val = parseScheduleValue(o.value)

		if value != val
			deactivate!
			value = val

		if value or on or activate?
			activate!
		self

	def queue
		owner.add(self)
		return

	def activate
		if value === yes
			owner.on('commit',self)
		elif value === no
			yes
			# stop from even 
		elif value <= 2 and value >= 0.1
			# this is not correct at all for now
			owner.on('raf',self)
		elif value > 2
			#interval = global.setInterval(queue.bind(self),value * (1000 / FPS))

		active = yes
		self

	def deactivate
		if value === yes
			owner.un('commit',self)
		owner.un('raf',self)

		if #interval
			global.clearInterval(#interval)
			#interval = null

		active = no
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
			add('commit')
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
	scheduler.add('commit').promise

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