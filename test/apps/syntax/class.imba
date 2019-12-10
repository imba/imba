describe 'Class' do

	test 'dynamic methods' do
		let method = 'hello'
		class Example
			def [method]
				return true

		ok Example.new.hello() == true