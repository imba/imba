extern describe, test, ok, eq, it

describe "Syntax - Literals" do
	
	test "object" do
		var o =
			a: 1
			b: 2
		eq o:a, 1
		eq o:b, 2
		
		var o = a: 1
		b: 2
		eq o:a, 1
		eq o:b, undefined
	
	test "objects with methods" do
		var obj = {
			num: 1
			def meth
				2
			other: 3
		}
		eq obj.meth, 2
		
		var implicit =
			@num: 1
			def meth
				@num
			other: 3
		
		eq implicit.meth,1
		eq implicit:other, 3
		
		var implicit =
			def meth
				@num
			@num: 2
		
		eq implicit.meth,2

	test "hashes with dynamic keys" do
		var key = "b"
		var obj = a: 1, "{key}": 2, c: 3
		eq obj:a, 1
		eq obj:b, 2
		eq obj:c, 3

	test "strings" do
		var fn = do |arg| arg
		var name = 'john'
		var str = """test {1} """
		eq str, "test 1 "

		str = "test {2} 
dette"
		eq str, "test 2 dette"

		eq "basic{100}", "basic100"

		str = "test {100} 
	this"

		eq str, "test 100 	this"

		str = """
		test
		this
		now
		"""

		eq str, "test\nthis\nnow"
		
		str = """
			test
				this
				now
		"""

		eq str, "test\n\tthis\n\tnow"
		eq "import {fn name}", "import john"

		str = """<?xml \" version="1.0" \{ encoding="UTF-8"?>"""
		eq str, '<?xml " version="1.0" { encoding="UTF-8"?>'

		var v = 1
		str = "{v ? 'a' : 'b'}c"
		eq str, 'ac'
	
	test "symbols" do
		var sym = :one
		
		eq :one, 'one'
		eq :one:two, 'one:two'
		eq :one-two, 'oneTwo'
		eq :one_two, 'one_two'
	
	test "regex" do
		var reg = /\w\d/
		ok reg.test('a1')
		
		var hereg = ///
			\w\d
		///
		
		ok hereg.test('a1')
		