
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



