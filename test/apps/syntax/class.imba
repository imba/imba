
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

describe 'Class' do

	test 'dynamic methods' do
		let method = 'hello'
		class Example
			def [method]
				return true

		ok Example.new.hello() == true