
extern eq

local class A
	
	prop a
	prop b

	def initialize a,b
		@a = a
		@b = b

	def call fn
		var other = A.new(2,2)
		fn.call(other)
		self

	def test
		var res = [a,this.a]
		call do
			res.push a
			res.push this.a
			# loops create their own scope, but should still
			# have the outermost closed scope as their implicit context
			for x in [1]
				res.push(a)
				res.push(this.a)
		return res

	def innerDef
		var ary = []

		# def inside a method scope creates a local function
		# which is implicitly called.

		def recur i
			ary.push(i)
			recur(i + 1) if i < 5

		recur(0)
		eq ary, [0,1,2,3,4,5]

		var k = 0
		def implicit
			ary.push(k)
			implicit if ++k < 6

		implicit
		eq ary, [0,1,2,3,4,5,0,1,2,3,4,5]



		

describe "Syntax - Scope" do
	var item = A.new(1,1)

	test "nested scope" do
		var obj = A.new(1,1)
		var res = obj.test
		eq res, [1,1,1,2,1,2]

	test "def inside method" do
		item.innerDef

