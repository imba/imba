
export def hello
	return "world"

export class Item

	def name
		"item"


export class A

	def name
		"a"

export class B < A

	def name
		"b"

export module emptyModule

export module service
	@counter = 0
	
	prop name
	
	def inc
		++@counter
	
	def decr
		--@counter
		
	def handle module = {a: 1}
		# module is only a keyword when followed by identifier (for now)
		var module = {}
		return module
