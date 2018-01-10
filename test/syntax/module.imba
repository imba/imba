
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

export module service
	@counter = 0
	
	prop name
	
	def inc
		++@counter
	
	def decr
		--@counter
