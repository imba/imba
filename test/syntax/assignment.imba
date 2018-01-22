extern describe, test, ok, eq, it

class O

	prop x
	prop y
	prop z

class SyntaxAssignment

	def initialize nestings = 0
		@gets = 0
		@sets = 0
		@calls = 0
		if nestings > 0
			@child = SyntaxAssignment.new(nestings - 1)
		self

	def ivar= val
		@sets = @sets + 1
		@ivar = val

	def ivar
		@gets = @gets + 1
		@ivar

	def child
		@calls = @calls + 1
		@child

	def gets
		@gets

	def sets
		@sets

	def calls
		@calls

	def reset
		@gets = 0
		@sets = 0
		@calls = 0
		@child.reset if @child
		self

	def testmeth1
		reset
		@ivar = 10
		var ivar = ivar
		ivar
		self


# Assignment
# ----------

# * Assignment
# * Compound Assignment
# * Destructuring Assignment
# * Context Property (@) Assignment
# * Existential Assignment (?=)
describe 'Syntax - Assignment' do

	describe "properties" do
		var obj = SyntaxAssignment.new

		test "=" do
			obj.ivar = 1
			eq obj.ivar, 1

		test "||=" do
			obj.ivar ||= 2
			eq obj.ivar, 1

			obj.ivar = 0
			obj.ivar ||= 2
			eq obj.ivar, 2

			obj.ivar = null
			obj.ivar ||= 3
			eq obj.ivar, 3

		test "&&=" do
			obj.ivar = 1
			obj.ivar &&= 2
			eq obj.ivar, 2

		test "+=" do
			obj.ivar = 1
			obj.ivar += 1
			eq obj.ivar, 2

		test "-=" do
			obj.ivar = 1
			obj.ivar -= 1
			eq obj.ivar, 0

		test "caching target" do
			var o1 = SyntaxAssignment.new(3)
			var o2 = o1.child
			var o3 = o2.child
			o1.reset
			eq o1.calls,0
			o1.child.child.ivar = 2
			eq o3.ivar,2
			eq o1.calls,1

			o1.child.child.ivar += 2
			eq o3.ivar,4
			eq o1.calls,2

		# test "var is not defined during set" do


	describe "statements" do
		var obj = SyntaxAssignment.new
		var truthy = 1
		var falsy = 0

		test "=" do
			var localvar
			obj.ivar = 1
			eq obj.ivar, 1

			localvar = obj.ivar = if truthy
				try
					4
				catch e
					3
			else 2

			eq localvar, 4
			eq obj.ivar, 4

			localvar = obj.ivar = if truthy
				try
					nomethod
				catch e
					3
			else 2

			eq localvar, 3
			eq obj.ivar, 3

		test "||= statement" do
			obj.ivar = 0
			var l = obj.ivar ||= if truthy
				try
					nomethod
				catch e
					3
			else 2

			eq l, 3
			eq obj.ivar, 3
		
		test "+= statement" do
			var l0 = 0
			var l1 = 0
			var l2 = 0
			var l3 = 1
			obj.ivar = 1

			# 
			l0 = l1 ||= obj.ivar += l3 &&= if truthy
				try
					nomethod
				catch e
					3
			else 2

			eq l0, l1
			eq l1, obj.ivar
			eq obj.ivar, 4 
			# eq obj.ivar, 4

		test "caching access for compound assigns" do
			var o1 = SyntaxAssignment.new(3)
			var o2 = o1.child
			var o3 = o2.child
			o1.reset

			o1.ivar = 1
			o1.child.ivar = 1
			eq o1.calls, 1
			o1.reset

			# on a compound access we should cache the left-side
			o1.child.ivar &&= 2
			eq o2.ivar, 2
			eq o1.calls, 1

	test "indexes" do
		var a = {}
		var b = no
		a[b ? 'yes' : 'no'] = true
		eq a:no, true

	# Compound Assignment
	test "boolean operators" do
		var nonce = {}

		var a = 0
		a ||= nonce
		eq nonce, a

		var b = 1
		b ||= nonce
		eq 1, b

		# want to change this syntax later, or at least
		# introduce another one for value != null ...
		var c = 0
		c &&= nonce
		eq 0, c

		var d = 1
		d &&= nonce
		eq nonce, d

	test "mathematical operators" do
		var a = [1,2,3,4]
		var b = [3,4,5,6]

		var u = a ∪ b
		eq u, [1,2,3,4,5,6]

		var i = a ∩ b
		eq i, [3,4]

		# ensure that RHS is treated as a group
		# e = f = false
		# e and= f or true
		# eq false, e

	# *note: this test could still use refactoring*
	test "compound assignment should be careful about caching variables" do
		var count = 0
		var list = []

		list[++count] ?= 1
		eq 1, list[1]
		eq 1, count

		list[++count] ?= 2
		eq 2, list[2]
		eq 2, count

		list[count++] &&= 6
		eq 6, list[2]
		eq 3, count

		# TODO inside the inner scope - the outer variable sound
		# already exist -- unless we've auto-called the function?
		var base

		base = do
			++count
			base

		base():four ?= 4
		eq 4, base:four
		eq 4, count

		base():five ?= 5
		eq 5, base:five
		eq 5, count

	test "compound assignment with implicit objects" do
		var obj = undefined
		obj ?=
			one: 1
	
		eq obj:one, 1
	
		obj &&=
			two: 2
	
		eq undefined, obj:one
		eq         2, obj:two

	test "compound assignment (math operators)" do
		var num = 10
		num -= 5
		eq 5, num

		num *= 10
		eq 50, num

		num /= 10
		eq 5, num

		num %= 3
		eq 2, num

	test "more compound assignment" do
		var a = {}
		var val = undefined
		val ||= a
		val ||= true
		eq a, val

		var b = {}
		val &&= true
		eq val, true
		val &&= b
		eq b, val

		var c = {}
		val = null
		val ?= c
		val ?= true
		eq c, val


	test 'a,b,c = 1,2,3' do

		var ary = [1,2,3,4,5]
		var obj = O.new
		
		var a = 1
		eq a, 1
		var [b,c] = 2,3
		eq [a,b,c], [1,2,3]

		var [a,*b,c] = [2,4,6] # should result in error, no?
		eq [a,b,c], [2,[4],6]

	
		var [a,b,*c] = [2,4,6] # should result in error, no?
		eq [a,b,c], [2,4,[6]]

		var [a,*b,c,d] = [1,2,3,4,5] # should result in error, no?
		eq [a,b,c,d], [1,[2,3],4,5]

		var [a,b,c,*d] = [1,2,3,4,5] # should result in error, no?
		eq [a,b,c,d], [1,2,3,[4,5]]

		var [*a,b,c,d] = [1,2,3,4,5] # should result in error, no?
		eq [a,b,c,d], [[1,2],3,4,5]

		[a,b] = b,a
		eq [a,b], [3,[1,2]]

		[a,b,*c] = 10,20,30,a
		eq [a,b,c], [10,20,[30,3]]

		var [a,b,c] = ary
		eq [a,b,c], [1,2,3]

		var [a,b,*c] = ary
		eq [a,b,c], [1,2,[3,4,5]]

		var list = [10,20,30]

		[list[0] , list[1]] = list[1] , list[0]
		eq list, [20,10,30]

		[list[0],*list[1],list[2]] = ary
		eq list, [1,[2,3,4],5]

		var x = for v in ary
			v * 2

		eq x, [2,4,6,8,10]

		var [x,y] = for v in ary
			v * 2

		eq [x,y], [2,4]

		[x,y,obj.z] = for v in ary
			v * 2
		eq [x,y,obj.z], [2,4,6]

		[x,y,*obj.z] = for v in ary
			v * 2
		eq [x,y,obj.z], [2,4,[6,8,10]]

		# special case for arguments
		[a,b,c] = arguments
		return

	test 'a,b,c = x,y,z' do
		var o = {x: 0, y: 1, z: 2}
		var [a,b,c] = o:x,o:y,o:z
		eq [a,b,c], [0,1,2]

		# tuples should be preevaluated
		var v = 0
		var [a,b,c] = (v=5),v,v
		eq [a,b,c], [5,5,5]

		var [x,y] = 10,20
		[x,y] = y,x
		eq [x,y], [20,10]

		x,y = 10,20
		x,y = (x+=20,y),x
		eq [x,y], [20,30]

		var fn = do
			x = 100
			return 10

		# how are we supposed to handle this?
		[x,y] = 10,20
		[x,y] = fn(),x
		eq [x,y], [10,100]

	test '.a,.b = x,y' do
		# b will nececarrily need to be set after a is set
		local class A
			
			prop x
			prop y
			prop z

			def initialize
				@x = 0
				@y = 0
				@z = 0

			# accessing x will increment y
			# def x
			# 	@x

			def x= x
				@z++
				@x = x


			def test
				x = 1
				y = 2
				# switching them
				[x,y] = y,x

				eq y, 1
				eq x, 2

				
		# o.x should not be set before we get o.z
		# if the left side was vars however, we could do it the easy way
		var o = A.new
		[o.x,o.y] = 1,o.z
		eq [o.x,o.y], [1,0]

		# now predefine local variables
		var [a,b,c,i] = 0,0,0,0
		var m = do a + b + c
		[a,b,c] = m(),m(),m()
		eq [a,b,c], [0,0,0]

		o.test


	test 'tuples - edgecase' do
		var [b,c,i] = 0,0,0
		var m = do (++i) + b + c

		# since a is not predefined, it is safe to evaluate this directly
		# while the values for b and c must be precached before assignment
		var [a,b,c] = m(),m(),m()
		eq [a,b,c], [1,2,3]		

	test 'tuples - edgecase 2' do
		var [a,c,i] = 0,0,0

		var m = do
			a = 10
			(++i) + a + c

		# since a is not predefined, it is safe to evaluate this directly
		# while the values for b and c must be precached before assignment
		# here a is predefined AND evals to a value
		var [a,b,c] = m(),m(),m()
		eq [a,b,c], [11,12,13]

	test 'hoisting' do
		var fn = do |o,i|
			fn(o,i - 1) if i > 0
			o:counter++
			return o:counter

		var obj = {counter: 0}
		eq fn(obj,10), 11
		yes

	test 'tupes - let' do
		var a = 1, b = 2, str = 'ab'

		if true
			let [a,b] = str.split('')
			eq a, 'a'
			eq b, 'b'

		eq a, 1
		eq b, 2
