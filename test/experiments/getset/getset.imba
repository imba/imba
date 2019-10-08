class Person

	prop alias
	prop role watch: yes

	def initialize name
		self.data = {name: name}
		@inspect 123

	def inspect value
		console.log("Hello",value)

	get name
		self.data.name

	set name val
		self.data.name = val

var p1 = Person.new("Mark")

console.log p1.name

p1.name = "Jane"



console.log p1.name

extend class Person
	get name
		"Person again {@data:name}"

console.log p1.name