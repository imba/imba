
def log
	return do |target,key,desc|
		let prev = desc.value
		desc.value = do
			console.info "call {key}"
			return prev.apply(this,arguments)
		return

def readonly
	return do |target,key,desc|
		desc.writable = false
		return desc

def debounce wait = 100
	def dec target,key,descriptor
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



