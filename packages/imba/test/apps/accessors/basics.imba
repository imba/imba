###

###
let instances = 0
let inits = 0

class Accessor
	static def $accessor target, key, name, slot, context
		instances++
		new self

	def $accessor target, key, name, slot, context
		instances++
		return target[slot] = self

	def $get target, key, name
		return target[key]

	def $set value, target, key, name
		target[key] = value

	def $init value, target, key, name
		inits++
		target[key] = value

class @any < Accessor

const Upcase = {
	def $get\string target, key
		target[key]

	def $set value, target, key, name
		if typeof value == 'string'
			value = value.toUpperCase!
		target[key] = value

	def $init value, target, key, name
		if value
			$set(value,target,key,name)
		return
}

class Main
	title @(new Accessor)
	initials @(Upcase)

class Sub < Main

test "basics" do
	let obj = new Main
	ok obj.@@title isa Accessor
	obj.title = "obj"
	eq obj.title, "obj"
	eq instances,1
	eq inits,1

	obj.initials = "saa"
	eq obj.initials, "SAA"
	eq obj.@@initials.$set,Upcase.$set

test "defaults" do
	class Item
		prop title = "hello" @(Upcase)

		get stuff
			Upcase.$get(10)

	let item = new Item
	eq item.title, "HELLO"

	class SubItem < Item
		get title
			"sub {super}"

	eq (new SubItem).title, "sub HELLO"