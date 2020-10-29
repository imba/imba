global class Imba2

	def constructor
		#depth = 0
		#context = {prototype: self}
		self
	
	def get target, key, receiver
		if let bound = #context[key]
			return bound
		let val = self[key]
		if val isa Function
			return #context[key] = val.bind(self)
		val !== undefined ? val : target[key]

	def set target, key, value, receiver
		self[key] = value
		return true
		target[key] = value

	get flags
		document.documentElement.classList

	get ##imba
		self

	def commit
		yes

	def run cb
		cb()

	def fork
		self
	
	def setTimeout fn,ms
		setTimeout(&,ms) do
			fn!
			commit!
			return

	def setInterval fn,ms
		setInterval(&,ms) do
			fn!
			commit!
			return
