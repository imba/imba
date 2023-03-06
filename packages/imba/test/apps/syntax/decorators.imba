# SKIP

def @log target,key,desc
	let prev = desc.value
	desc.value = do
		console.info "call {key}"
		return prev.apply(this,arguments)
	return

def @readonly target,key,desc
	desc.writable = false
	return desc

def @debounce target,key,descriptor
	let wait = this[0] or 100
	const sym = Symbol('debounces')
	const callback = descriptor.value

	if typeof callback !== 'function'
		throw new SyntaxError('Only functions can be debounced')

	descriptor.value = do
		const args = arguments
		clearTimeout(this[sym])
		this[sym] = setTimeout(&,wait) do
			delete this[sym]
			return callback.apply(this,args)

	return descriptor

def @track target,key,desc
	unless desc
		desc = {enumerable: true}
		let map = this.weakmap = new WeakMap
		def desc.get do map.get(this)
		def desc.set value do map.set(this,value)

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

def @watch target,key,desc
	unless desc
		desc = {enumerable: true}
		let map = this.weakmap = new WeakMap
		def desc.get do map.get(this)
		def desc.set value do map.set(this,value)

	let meth = this[0] or (key + 'DidSet')
	let setter = desc.set

	if setter isa Function
		desc.set = do |value|
			let prev = this[key]
			if value != prev
				setter.call(this,value)
				this[meth] and this[meth](value,prev,key)

	return desc

class Hello

	@log
	def setup
		a = 1
		b = 2

	@readonly
	def enable
		self

	def disable
		self

	@debounce(10)
	def debounced
		console.info 'debounced'

	@log
	static def setup
		true

	@track
	prop number

	@watch
	prop name = 'john'

	def nameDidSet value,prev
		console.info([prev,value])

let item = new Hello

test do	
	item.setup!
	eq $1.log, ['call setup']

test do
	Hello.setup!
	eq $1.log, ['call setup']

test do
	let item = new Hello
	item.disable = 1
	eq item.disable, 1
	item.enable = 2
	ok item.enable isa Function

let i2 = new Hello

test do
	i2.debounced!
	i2.debounced!
	i2.debounced!
	await spec.wait(20)
	eq $1.log,['debounced']

let i3 = new Hello

test do
	i3.number
	i3.number = 2
	eq $1.log,['get number','set number']

let i4 = new Hello

test do
	eq i4.name, 'john'
	i4.name = 'john'
	i4.name = 'jane'
	eq $1.log,[['john','jane']]

class CustomWatch
	@watch('updated')
	prop name = 'john'

	def updated value,prev,key
		console.info([prev,value,key])

let i5 = new CustomWatch

test do	
	eq i5.name, 'john'
	i5.name = 'jane'
	eq $1.log,[['john','jane','name']]

console.log Object.keys(new Hello)