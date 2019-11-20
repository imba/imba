var state =
	counter: 50
	bool: false
	title: "Hello"

var footer = do |title|
	if state.bool
		<footer>
			<div> title
			<span> "bool is true"
	else
		<footer>
			<div> title
			<span> "bool is false"

tag app-root
	def render
		<self>
			<div> "Count is there"
			footer("First footer {Math.random()}")
			footer("Second footer")
			<div> state.title

var app = <app-root>
document.body.appendChild(app)
EL = app

FLIP = do
	state.bool = !state.bool
	app.render()