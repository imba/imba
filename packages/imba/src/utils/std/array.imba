extend class Array

	get empty?
		length is 0

	get size
		length

	set size value
		length = value

	get random
		self[Math.floor(Math.random! * length)]

	def resolve
		await Promise.all self

	get unique
		let items = []
		for item in self
			if items.indexOf(item) == -1
				items.push(item)
		items

	def add item
		push(item) unless has(item)
		item

	def has item
		includes item

	get reversed
		slice!.reverse!

	def sorted key, reverse = no
		let items = slice!
		let cb = key

		if typeof key is "string"
			cb = do $1[key]

		elif key isa Map
			cb = do key.get $1

		elif !(key isa Function)
			cb = do $1

		items.sort do
			let a = cb($1)
			let b = cb($2)
			a > b ? 1 : (a < b ? -1 : 0)

		reverse ? items.reversed : items

	def delete item
		let idx = indexOf(item)
		return unless idx >= 0
		splice(idx,1)
