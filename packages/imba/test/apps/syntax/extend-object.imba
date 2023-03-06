let obj = {
	one: do return 1
}

test do
	eq obj.one!, 1
	# now extend the object
	extend obj
		def one
			super + 10

	eq obj.one!, 11
	eq obj.name, undefined

# dynamic
test do
	let logged = []
	let logwrap = do(obj,key)
		extend obj
			def [key]
				logged.push "called {key}"
				super

	class Item
		def run
			1

	let item = new Item
	logwrap(item,'run')
	eq item.run!, 1
	eq logged, ["called run"]

test do
	let logged = []

	class Item
		set name value
			#name = value
		get name
			#name

	let track = do(target,key)
		extend target
			get [key]
				super

			set [key] value
				logged.push("set {key} {value}")
				super

	track(Item.prototype,'name')
	let item = new Item
	item.name = 'a'
	eq logged, ["set name a"]