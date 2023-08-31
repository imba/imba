export default class ChangeLog
	def constructor o = {}
		log = []
		maps = new WeakMap
		cursors = o.ignoreInitial ? null : new WeakMap # new WeakMap
		depth = 0
		offset = 0
		pulled = 0
		options = o
		batch = null

	def flush
		if batch
			if options.withFlags
				log.push(...Array.from(batch))
			else
				for [item,marks] of batch
					log.push(item)
			batch = null
		return self

	def push item
		mark(item)

	def mark item, flag = 2
		return unless cursors

		if batch
			batch.set(item,(batch.get(item) or 0) | flag)
		else
			batch = new Map
			batch.set(item,flag)

	def trim
		offset += log.length
		log.length = 0
		self

	get cursor
		offset + log.length

	get length
		log.length

	def pull target
		# Dont use beacons here?
		flush! if batch
		let map = (cursors ||= new WeakMap)
		let pos = map.get(target)
		let cur = cursor
		# let len = log.length

		if pos == undefined or pos < cur
			map.set(target,cur)
			let start = Math.max((pos or 0) - offset,0)
			return log.slice(start)

		return no