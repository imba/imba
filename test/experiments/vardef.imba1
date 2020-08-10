
def one a,b,c
	self
	
var def hello a,b,c
	self
	
	
export def three a,b,c
	hello
	one
	self
	
export let def four a,b,c
	self
	
class Something
	def self.staticMethod
		true

	def again
		one
		hello
		
	def cache o
		(right isa Ivar && !left) ? self : super(o)

class Something2
	def self.staticMethod
		true

	def again
		one
		hello
		
	def cache o
		(right isa Ivar && !left) ? self : super(o)
		
extern describe, test, ok


export module utils
	
	def random
		yes
		
	def clamp a,b,c
		Math.round(a,b,c)
		
class SomeClass
	
	def self.staticMethod
		yes
		
	def initialize value
		@value = value
		utils.clamp(1,2,3)
		
		
	def instanceMethod
		yes

# self in root is an actual object, on which
# we can define methods etc.
# defining a method in the root scope is actually
# creating a method on that self
def rootMethod
	self

# it can be called implicitly as expected, since
rootMethod # is the same as self.rootMethod()

# as with an object, you can also access the method
self:rootMethod

# as of Imba 1.4, these methods cannot be called directly
# from within other closed scopes (class/def). At the same
# time, we have introduced a way to declare methods as variables
var def varMethod
	return true
		

class Item
	def initialize
		# previously, Imba would lookup method definitions
		# from outer scopes, so the following code would work:
		rootMethod
		
		# varMethod is like any other variable
		varMethod # just a reference to varMethod
		varMethod() # calling the varMethod
		
	def test
		ok varMethod isa Function
		ok varMethod() == true
	
	def method
		self
		
	def nestedDef
		# defining a method inside a def will work the same as on root
		# it actually defines a method on the self
		def definedDef
			true
		
		# calling definedDef will now work. It translates to self.definedDef()
		ok definedDef == true
		ok self:definedDef isa Function
		
		# defining with var def will merely create a function
		var def varDef
			true
		
		ok varDef isa Function
		ok varDef == true
		ok self:varDef == undefined
		
	def defineInBlock
		var instance = self
		# so, def without var/let/const in front will actually define
		# a method on self. Block-level functions do not introduce a new
		# self in Imba - they can be thought of as fat-arrow functions in es6
		def defInMethod
			true
			
		[1,2,3].map do
			# a blocklevel function does not introduce a new self
			# self is still the same self as inside the outer function
			# so here we are defining defInBlock on the Item instance three times
			def defInBlock
				true
			
			ok self == instance	
			ok self:defInBlock isa Function
			ok defInMethod == true

		
	def letDef
		if true
			let def method
				true
			ok method isa Function
			ok method() == true
		
		# outside of the block, method does not exist as a variable
		# and it is implicitly called on self, as expected
		ok method == self # self.method() == self


describe 'Syntax - Defs' do
	test 'root' do Item.new.test
	test 'nested' do Item.new.nestedDef
	test 'let' do
		Item.new.letDef

	test 'scoping' do
		Item.new.defineInBlock
