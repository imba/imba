extern describe, test, ok, eq, it

export def hello
	return "world"

export class Item

	def name
		"item"


class A

	def name
		"a"

class B < A

	def name
		"b"

export module Service
	@counter = 0
	
	def inc
		++@counter
	
	def decr
		--@counter


export A, B
		