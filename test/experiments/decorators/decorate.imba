
var readonly = do |target,key,descriptor|
	descriptor:writable = false
	return descriptor
	
var mark = do |value|
	return do |target,key,descriptor|
		target.@mark = value
		return descriptor
	
class Hello
	hello

	@@mark "Hello"
	@@readonly
	def setup
		console.log "setup!!"
		self