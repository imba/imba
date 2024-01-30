class @desc
	def $get target,key,name
		target[key] or callback..call(target)
	def $set value,target,key,name
		target[key] = value

class Item
	number = 2
	vals @desc do
		[1,2,3].map do
			$1 * number




test "works" do
	let item = new Item
	eq item.vals,[2,4,6]
