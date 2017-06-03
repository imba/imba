extern describe, test, eq

describe 'Await' do

	test 'issue#93' do
		var val = Promise.resolve(100)
		class A
			prop x
			prop y default: 100

			def fetch
				x = await y

		var item = A.new
		await item.fetch
		eq item.x,100

