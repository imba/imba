let last = null

class Item
	name @set
		last = e		


test "logging" do
	let item = new Item name: 'a'
	eq last.value, 'a'
	eq last.oldValue, undefined
	item.name = 'b'
	
	eq last.value, 'b'
	eq last.oldValue, 'a'
	
	