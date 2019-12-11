

class Item
	prop hello

	def constructor title
		@title = title

	def archive
		@archived = yes

	# static def type
	# 	'Item'

class Todo < Item
	def due
		yes

global class GlobalTodo < Todo
	def due
		yes

extend class Todo
	
	def extended
		yes

describe 'Defining classes' do

	test 'Class declarations' do
		class Rectangle
			def constructor height, width
				@height = height
				@width = width

		ok Rectangle.new

	test 'Class expressions' do
		var tmpclass = class
			def constructor height, width
				@height = height
				@width = width
		ok tmpclass.new

describe 'Class' do

	test 'dynamic methods' do
		let method = 'hello'
		class Example
			def [method]
				return true

		ok Example.new.hello() == true