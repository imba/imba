class Item

	###
	@template T
	@overload
	@param {T} this
	@return {InstanceType<T>}
	###
	static def test
		new self

	static get stuff\Array<this>
		[this]

	get stuff\Array<this>
		[this]

class Car < Item

	def start
		yes

let a = Item.test!
let b = Car.test!

b.start!
b.stuff
Car.stuff
Car.test().start
const arr = [b,b]

for item of arr
	let x = Car.test()
	arr[0].stuff(1)

	yes