###

###
let inits = 0

class Accessor
	static def accessor target, key, name, slot, context
		inits++
		new self

	def accessor target, key, name, slot, context
		inits++
		return target[slot] = self

	def get target, key, name
		return target[key]

	def set value, target, key, name
		target[key] = value

const Upcase = {
	def get target, key
		target[key]

	def set value, target, key, name
		if typeof value == 'string'
			value = value.toUpperCase!
		target[key] = value
}

class Main
	prop title @ new Accessor
	prop initials @ Upcase

class Sub < Main


test "basics" do 
	let obj = new Main
	ok obj.@@title isa Accessor
	obj.title = "obj"
	eq obj.title, "obj"
	eq inits,1

	obj.initials = "saa"
	eq obj.initials, "SAA"
	eq obj.@@initials.set,Upcase.set
	