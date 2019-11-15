
# extend tag p
# 	
# 	def analyze
# 		console.log "analyzing paragraph"

### css

.completed {
	color: green;
}

###

var todos = [
	{title: "Remember milk"},
	{title: "Do something here"},
	{title: "Go again", completed: yes}
]

tag list-item
	attr desc

	def $mount
		console.log "mounted todo"
		@render()

		@addEventListener('click') do |e|
			@$mousedown(e)

	def $unmount
		console.log "unmounted todo"
		self

	def $mousedown
		console.log "onmousedown todoitem!!"

	def $awaken
		# called when element is created by residing
		# in document or simply through doc.createElement
		self

	def render
		<self>
			<span> "This is the title"

tag todo-item < list-item
	prop data

	def toggleItem
		@data.completed = !@data.completed

	def $mousedown e
		@render()

	def onmousedown
		console.log "hello"

	def render
		<self .completed=(@data.completed)>
			<span> @data.title

tag app-root
	attr test

	def initialize
		console.log "hello",@getAttribute('test'),!!@parentNode

	def $mount
		console.log "did mount now!",@getAttribute('test'),@test
		# this.render()

	def render
		<self>
			<div> "Hello there"
			<div> "This is the root!"
			<list-item>
			for item in todos
				<todo-item todo=item>

# var item = <todo-item>
var app = document.createElement('app-root')
app.test = 100
app.render()

document.body.appendChild(
	app
)

