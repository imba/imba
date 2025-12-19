extend class Array<T>

	get size
		length

	set size value
		length = value

	get empty?
		size === 0

	get any?
		size > 0

	get many?
		size > 1

	get one?
		size === 1

	get random
		self[Math.floor(Math.random! * length)]

	def clear
		length = 0
		self

	def resolve
		await Promise.all self

	get unique
		# to allow overrides
		let items = []
		for item in self
			if items.indexOf(item) == -1
				items.push(item)
		items
	
	set unique val
		Object.defineProperty(self,'unique',{value: val})

	def add item
		push(item) unless has(item)
		item

	def has item
		includes item

	def sorted key\any?, reverse = no
		let items = slice!
		let cb = key

		if key isa "string"
			cb = do $1[key]

		elif key isa Map
			cb = do key.get $1

		elif !(key isa Function)
			cb = do $1

		if reverse
			items.sort do
				let a = cb($1)
				let b = cb($2)
				a < b ? 1 : (a > b ? -1 : 0)
		else
			items.sort do
				let a = cb($1)
				let b = cb($2)
				a > b ? 1 : (a < b ? -1 : 0)

	def delete item
		let idx = indexOf(item)
		return false unless idx >= 0
		splice(idx,1)
		return true
