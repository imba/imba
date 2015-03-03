
local class Organism

	prop alias
	prop group

	def self.type
		'organism'

	def initialize
		group = "organism"
	
	def lineage do 'organism'
	def name do 'organism'
	def speak do 'ghaarg'
	def alive do yes

local class Virus < Organism

	def initialize
		@ivar = 2

	def lineage
		"{name}.{super.lineage}"

	def name
		'virus'

local class Animal < Organism
	
	def initialize
		group = "animal"

	def lineage
		# super should do the same as super.lineage(*arguments)
		"animal.{super}"

local class Cat < Animal
	
	def initialize
		group = "cat"

	def lineage
		"cat.{super.lineage}"

	def speak
		'miau'

	def cloak
		# call the initialize of animal
		super.initialize
		

local class Dog < Animal

	def lineage
		"dog.{super()}"
		
	def speak
		'woff'

local class FakeDog < Dog
	
	def lineage
		"fakedog.{super.super}"
		"fakedog.{super.super()}"

local class Human < Animal

	def lineage
		"human.{super.lineage}"

	def speak
		'hello'

local class Zombie < Human

	def lineage do "zombie.{super}"

	def alive
		no


describe 'Syntax - super' do

	test "stuff" do

		var cat = Cat.new
		var virus = Virus.new
		var dog = Dog.new
		var fakedog = FakeDog.new
		var human = Human.new
		var zombie = Zombie.new

		eq virus.lineage, 'virus.organism'
		eq cat.lineage, 'cat.animal.organism'
		eq dog.lineage, 'dog.animal.organism'
		eq zombie.lineage, 'zombie.human.animal.organism'
		eq fakedog.lineage, 'fakedog.animal.organism'

		eq cat.group, "cat"
		cat.cloak
		eq cat.group, "animal"



