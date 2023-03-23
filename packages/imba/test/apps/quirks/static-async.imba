class Quirk
	static def setup
		await Promise.resolve(1)

test 'static async' do
	let a = await Quirk.setup!
	eq a,1