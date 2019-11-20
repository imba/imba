var state =
	counter: 50
	bool: false
	title: "Hello"
	numbers: ["One","Two","Three"]
	names: ["John","Jane","Sam"]

var hideList = false

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
	def list items
		return null if hideList

		<ul> for item in items
			<li> item

	def render
		<self>
			<div> "Count is there"
			footer("First footer {Math.random()}")
			footer("Second footer")
			<div> state.title
			list(state.numbers)
			list(state.names)

var app = <app-root>
document.body.appendChild(app)
# these are exposed to root(!)
def flip
	state.bool = !state.bool
	app.render()

def addNumber
	state.numbers.push("" + state.numbers.length)
	app.render()

def toggleList
	hideList = !hideList
	app.render()