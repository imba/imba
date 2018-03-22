extern describe, test, ok, eq, it

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

		test "issue with shadowing items var" do
			var ret = []
			var def iterate items
				items
				for item,i in items
					ret.push(item)

			eq [1,2,3], iterate([1,2,3])


		test "scoped let" do
			Promise.new do |resolve|
				var res = []
				for item,i in ary
					setTimeout(&,1) do
						res.push(item)
						if res:length == ary:length
							eq res, [1,2,3,4,5]
							resolve(yes)

				yes

		test "quirks" do
			var i = 10
			var a = [1,2,3]
			var sum = 0

			# i should be local here - or at least be reset
			for v,i in a
				sum += i

			eq sum, 0 + 1 + 2

		test "redefining var inside" do

			var breaks = [1,2,3]
			for x,i in breaks
				x = 0
				eq x, 0

			eq breaks, [1,2,3]

			return


		test "basic assignment" do
			var o = 0, l = 0, i = 0, len = 0
			var rets = for v in ary
				v + 1
			eq rets, [2,3,4,5,6], String
			eq o + l + i + len, 0

		test "guarded" do
			var items = [1,2,3,4]

			var ret = for v in items when (v % 2)
				v
			eq ret, [1,3]

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

		test "variable collisions" do

			var res = []
			for a in [0..2]
				var len = 10
				res.push(a)

			eq res:length, 3

			var def hello
				var ary = [1,2,3]
				for item in ary
					var res = item * 2

			eq hello(), [2,4,6]
			return

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
			
		test "dynamic" do
			var a = 10
			var b = 15
			
			var res = for i in [a .. b]
				i
			
			eq res, [10,11,12,13,14,15]
			
		test "with index" do
			var a = 10
			var b = 15
			
			var res = for val,idx in [a .. b]
				idx
			
			eq res, [0,1,2,3,4,5]
		
		test "negative" do
			var a = 15
			var b = 10
			
			var res = []
			for val,idx in [a .. b]
				res.push(val,idx)
			
			eq res, [15,0,14,1,13,2,12,3,11,4,10,5]
			


	describe "For Of" do

		test "dont override value" do
			var obj = {a: 1,b: 2}
			for own k,v of obj
				v = 3

			eq obj:a,1
			eq obj:b,2

		test "all keys assignment" do
			var o = 0
			var l = 0
			var len = 0

			var keys = (k for k,v of dict)
			eq keys, [:a,:b,:c,:d], String

			var vals = (v for k,v of dict)
			eq vals, [2,4,6,8]

			# The order of the keys are based on assignment-order,
			# prototype-keys always come at the end (as if they were assigned
			# after all other keys=
			keys = (k for k,v of dict2)
			eq keys, [:e,:a,:b,:c,:d]

			eq o, 0
			eq l, 0
			eq len, 0

		test "for own of" do
			var keys = (k for own k,v of dict)
			eq keys, [:a,:b,:c,:d], String

			keys = (k for own k,v of dict2)
			var vals = (val for own k,val of dict2)
			eq keys, [:e]
			eq vals, [10]

			var l = 0
			var len = 0

			var d = do
				return {obj: {a: 1, b: 2, c: 3}}

			var m = do |o|
				for own k,v of d():obj
					o.push(k,v)
				return		

			var v = []
			m(v)
			eq v, [:a,1,:b,2,:c,3]

		test "for of" do

			var items = {x: {a: 1, b: 2, c: 3}}
			var out = []
			for k,v of items:x
				out.push(k,v)
			eq out, ['a',1,'b',2,'c',3]

		test "for own of global bug" do

			var obj = {a: 1, b: 2}
			var def hello
				for own forOfKeyVar,v of obj
					forOfKeyVar
					forOfKeyVar
					forOfKeyVar
			hello()
			ok `typeof forOfKeyVar === 'undefined'`


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

	test "nested loops" do
		var res = []
		var people = [{name: 'John', meta: {a: 1}},{name: 'Jane', meta: {b: 2}}]

		for person in people
			var name = person:name

			for own k,v of person:meta
				res.push(k)

		eq res, ['a','b']
		return

	test "#72: self reference in for-in-expression" do
		class A
			def initialize
				@v = 1

			def map
				(x * @v for x in [1,2,3]).join("-")

		eq A.new.map, "1-2-3"

	test "issue with multi-let" do
			var items = ["12","22","32"]
			var res = for item in items
				var [a,b] = item.split('')
				b + a

			eq res.join(''), "212223"


	describe "Loop" do

		it "should work" do
			var a = 0
			var b = 0
			loop
				a++
				break if b == 0

			eq a, 1


	