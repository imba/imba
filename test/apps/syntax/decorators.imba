
def log
	def decor target,key,desc
		let prev = desc.value
		desc.value = do
			console.info "call {key}"
			return prev.apply(this,arguments)
		return

def readonly
	def decor target,key,desc
		desc.writable = false
		return desc

def debounce wait = 100
	def decor target,key,descriptor
		const sym = Symbol('debounces')
		const callback = descriptor.value

		if typeof callback !== 'function'
			throw SyntaxError.new('Only functions can be debounced')

		descriptor.value = do
			const args = arguments
			clearTimeout(this[sym])
			this[sym] = setTimeout(&,wait) do
				delete this[sym]
				return callback.apply(this,args)

		return descriptor

def track
	def decor target,key,desc
		let getter = desc.get
		let setter = desc.set
		if getter isa Function
			desc.get = do
				console.info(`get {key}`)
				getter.call(this)
		if setter isa Function
			desc.set = do |value|
				console.info(`set {key}`)
				setter.call(this,value)
		# desc.writable = false
		return desc

def watch meth
	def decor target,key,desc
		let setter = desc.set
		meth ||= key + 'DidSet'
		if setter isa Function
			desc.set = do |value|
				let prev = this[key]
				if value != prev
					setter.call(this,value)
					this[meth] and this[meth](value,prev,key)

		return desc

class Hello

	@@log
	def setup
		@a = 1
		@b = 2

	@@readonly
	def enable
		self

	def disable
		self

	@@debounce(10)
	def debounced
		console.info 'debounced'

	@@log
	static def setup
		true

	@@track
	@number

	@@watch
	@name = 'john'

	def nameDidSet value,prev
		console.info([prev,value])

test do
	let item = Hello.new
	item.setup()
	eq $1.log, ['call setup']

test do
	Hello.setup()
	eq $1.log, ['call setup']

test do
	let item = Hello.new
	item.disable = 1
	eq item.disable, 1
	item.enable = 2
	ok item.enable isa Function

test do
	let item = Hello.new
	item.debounced()
	item.debounced()
	item.debounced()
	await spec.wait(20)
	eq $1.log,['debounced']


test do
	let item = Hello.new
	item.number
	item.number = 2
	eq $1.log,['get number','set number']


test do
	let item = Hello.new
	eq item.name, 'john'
	item.name = 'john'
	item.name = 'jane'
	eq $1.log,[['john','jane']]


class CustomWatch
	@@watch('updated')
	@name = 'john'

	def updated value,prev,key
		console.info([prev,value,key])

test do
	let item = CustomWatch.new
	eq item.name, 'john'
	item.name = 'jane'
	eq $1.log,[['john','jane','name']]

console.log Object.keys(Hello.new)