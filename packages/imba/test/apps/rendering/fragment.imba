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

	def addNumber
		state.numbers.push("" + state.numbers.length)
		console.info('added')

	def addName name
		state.names.push(name)
		console.info('added')

	def list items
		return null if hideList

		<ul> for item in items
			<li> item

	def render
		<self>
			<div>
				<button.add-number :click.addNumber> "Add number"
				<button.add-name :click.addName("Name")> "Add name"

			<div> "Count is there"
			footer("First footer")
			footer("Second footer")
			<div> state.title
			self.list(state.numbers)
			self.list(state.names)

var app = <app-root>
app.render()
imba.mount(app)

test "add number" do
	await spec.click('.add-number')
	eq $1.mutations.length,1,"mutations error"

test "add name" do
	await spec.click('.add-name')
	eq $1.mutations.length,1,"mutations error"
