# self = SPEC

class SyntaxLoopsObj
	prop value

class IterableObject

	def initialize
		self

	def toArray
		[1,2,3,4,5]


describe 'Syntax - Loops' do
	var ary = [1,2,3,4,5]
	var ary2 = [2,4,6,8,10]
	var dict = {a: 2, b: 4, c: 6, d: 8}
	var dict2 = Object.create(dict)
	dict2:e = 10

	var obj = SyntaxLoopsObj.new

	describe "For In" do

		test "quirks" do
			var i = 10
			var a = [1,2,3]
			var sum = 0

			# i should be local here - or at least be reset
			for v,i in a
				sum += i

			eq sum, 0 + 1 + 2




		test "basic assignment" do
			var rets = for v in ary
				v + 1
			eq rets, [2,3,4,5,6], String

		test "forin with conditional assign" do
			var ret
			
			obj.value = 1

			ret = obj.value ||= for v in ary
				v + 1

			eq ret, 1, String

			ret = obj.value &&= for v in ary
				v * 1

			eq ret, obj.value, String
			eq obj.value, ary, String

		test "inside statement" do
			obj.value = null
			var ret = obj.value ?= if 1
				(v * 2 for v in ary)
			else
				2

			eq ret, ary2, String
			eq obj.value, ary2, String

		test "custom iterable objects" do
			var item = IterableObject.new
			var res = (v * 2 for v in item)
			eq res, [2,4,6,8,10]

		test "forin by" do
			var ary = [1,2,3,4,5,6]
			var res = (v for v in ary by 2)
			eq res, [1,3,5]

	describe "For In with ranges" do
		
		test "statement" do
			var ary = []
			for i in [0 .. 3]
				ary.push(i)
			eq ary, [0,1,2,3]

		test "expression" do
			var a = for i in [0 .. 3]
				i * 2
			eq a, [0,2,4,6]

			a = for i in [0 ... 3]
				i * 2
			eq a, [0,2,4]


	describe "For Of" do

		test "all keys assignment" do
			var keys = (k for k,v of dict)
			eq keys, [:a,:b,:c,:d], String

			var vals = (v for k,v of dict)
			eq vals, [2,4,6,8]

			# The order of the keys are based on assignment-order,
			# prototype-keys always come at the end (as if they were assigned
			# after all other keys=
			keys = (k for k,v of dict2)
			eq keys, [:e,:a,:b,:c,:d]

		test "for own of" do
			var keys = (k for own k,v of dict)
			eq keys, [:a,:b,:c,:d], String

			keys = (k for own k,v of dict2)
			var vals = (val for own k,val of dict2)
			eq keys, [:e]
			eq vals, [10]

	test "implicit return from assignment" do
		var c = 1
		var f = do c ? true : false
		eq f(), true

	test "while" do
		var a = []
		while a:length < 5
			a.push a:length
		eq a, [0,1,2,3,4]

		a = []
		until a:length >= 5
			a.push a:length
		eq a, [0,1,2,3,4]

	describe "Loop" do

		it "should work" do
			var a,b = 0,0
			loop
				a++
				break if b == 0

			eq a, 1


	