###
The descriptor syntax allows you to concisely set/toggle properties on an object
###
let check = do(a,b) eq JSON.stringify(a), JSON.stringify(b)

describe 'descriptors' do
	
	test 'basics' do
		# if you supply no object it will create one
		let x = @({}).one.two.three	
		check x, {one: yes, two: yes, three: yes}

	test 'setting non-boolean values' do
		# if you supply no object it will create one
		let x = @({}).one.two[2]
		check x, {one: yes, two: 2}

	test 'calling methods in chain' do
		let o = {prep: do this.prepared = yes }
		let x = @(o).one.prep().two
		eq x.prepared, yes

	test 'setting value' do
		# When you assign to a descriptor, it actually wraps the assigned value in a function
		# this is very useful for rich field accessors etc that want to decide when / how
		# to fill in a default value etc
		let x = @({}).one = [1,2,3]
		check x.default!, [1,2,3]

	test 'literal value' do
		# if the value you assign to the descriptor is a literal / primitive, it can be accessed
		# on the function
		let item = {}
		let desc = @(item) = 10
		eq desc.default!, 10
		eq desc.default.literal, 10

	test 'getting the target' do
		return # add later
		# a descriptor always sets .self to the value of self in the context it was created
		# the magical method 
		def generate
			let item = {}
			let desc = @(item).hey = 20

		let ctx = {}
		let res = generate.call(ctx)
		eq res.default.literal, 20
		eq res.self