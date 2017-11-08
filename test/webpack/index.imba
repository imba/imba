import trim,asyncTrim from './utils'

require './empty'

export tag App
	
	def setup
		var trimmed = await asyncTrim("  App  ")
		return self

	def render
		<self> <h1> "Hello World"