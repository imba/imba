class Item
	changes = 0

	###
	when you supply a second argument to a setter - it defaults
	to the value of the same getter. Useful for setters where you
	check the old value to compare. Ie

	set description val
		let prev = description
		if val != prev
			...

	Would now be
	set description val, prev
		if val != prev
			...
	###
	set value val, prev
		if val != prev
			changes++
			#value = val

	get value
		#value

test 'second argument for setters' do
	let item = new Item
	eq item.changes,0
	item.value = 1
	eq item.changes,1