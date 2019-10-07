class Person

	prop alias
	prop role watch: yes

	def initialize name
		@data = {
			name: name
		}

	def age
		20

	def height
		20

	def setProperty key, value, options
		self

	def getProperty key, value, options
		self

	get name
		@data.name

	set name val
		@data.name = val
		self.data.name = val

var p1 = Person.new("Mark")
console.log p1.name
p1.name = "Jane"
console.log p1.name
console.log p1:name

extend class Person
	get name
		"Person again {@data:name}"

console.log p1.name
