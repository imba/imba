
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


test do
	let item = Hello.new
	item.setup()
	eq $1.log, ['call setup']

test do
	let item = Hello.new
	item.disable = 1
	eq item.disable, 1
	item.enable = 2
	ok item.enable isa Function


