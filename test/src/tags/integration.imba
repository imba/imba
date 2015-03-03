
# util to trace which items we call etc
local class Tracer

	prop stack

	def initialize
		clear

	def clear
		@stack = []

	def trace arg
		@stack.push(arg)
		self

var tracer
var trace = do
	tracer ||= Tracer.new
	tracer.trace(*arguments)


tag entries < ul

tag entry < li

tag task < entry

tag project < entry


tag #app

	def awake
		var v = 19
		self



