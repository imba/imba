extern describe, test, eq

def delay ret = 1
	Promise.new do |resolve,reject|
		setTimeout(&,0) do
			if ret isa Error
				reject(ret)
			else
				resolve(ret)

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


	unless $es5$
		test 'es6' do
			var add2 = do |x|
				let p_a = delay(20)
				let p_b = delay(30)
				return x + await p_a + await p_b

			add2(10).then do |val|
				eq val,60

		test 'try-catch' do
			try
				var z = await Promise.reject(30)
				eq 1,2
			catch e
				eq e,30

