
describe 'Issues' do

	test 'dynamic new' do

		def a
			A

		class A
			def self.b
				A.B

		class A.B

			def self.B
				true

		class A.B.C

		ok A.new isa A
		ok A.B.new isa A.B
		ok A.B.C.new isa A.B.C

		ok A.b.C.new isa A.B.C
		ok (A.b.C).new isa A.B.C
		ok a.B.new isa A.B

	test 'var hoisting with loops' do

		let a = 0

		def method
			a = for x in [1,2,3]
				x * 2
			return

		method # call the method

		eq a, [2,4,6]



