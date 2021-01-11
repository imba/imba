let ary = [1,2,3]
let objary = [{a: 1},{a: 2},{a: 3}]

let fn = do yes

test 'implicit return' do
	let x = 1
	let impl = do x = 10
	eq impl!, 10

test 'return let' do
	let impl = do
		# declarations return implicitly like assignments
		let x = 10
	eq impl!, 10

	let expl = do
		# gramatically valid
		return let x = 10
	eq expl!, 10

test do
	if let a = 2
		for {a},i in objary
			eq a,i+1
	eq a,2


test do
	let obj = {
		a: {a: 1, key: 'a'}
		b: {a: 1, key: 'b'}
		c: {a: 1, key: 'c'}
	}

	# let a = 0
	let i = 0
	if let a = 2
		for own k,{a,key} of obj when a == 1
			eq a,1
			eq k,key
			i++
		eq a,2
	eq a,2
	eq i,3

test do
	let ary = [[{a:0}],[{a:1}],[{a:2}]]
	if let a = 2
		let k = 0
		for [{a}] of ary
			eq a,k++
		eq k,3
	eq a,2
	
test do
	# variable declarations are expressable like assignments
	fn(let y = 1)

	if true
		fn(let y = 2)
		eq y, 2

	eq y, 1

test do
	let o = {a: 2}
	if let {a} = o
		eq a, 2
	eq a, 2

test do
	let s = 'a'
	global.b = 3

	if let a = 2
		eq a,2
		let {name: s} = {name: 'b'}
		eq s,'b'

		let x = {b,a,s}
		# bug
		eq x.b,3
		eq x.a,2
		eq x.s,'b'
		
		[a=3] = [1,2,3]
		eq a, 1
		[a=3] = []
		eq a, 3
	else
		eq a, undefined
	eq s,'a'


test do
	let a = [1,2,3]
	let b = for item in a
		item * 2
	eq b, [2,4,6]
	
	
	let [e,f,g] = for item in a
		item * 2
	eq e,2
	eq f,4
	eq g,6

test do
	let x = do
		let a = for item in ary
			item * 2
	x()
	# should return?
	# eq x(),[2,4,6]
	

test do
	let a = 1
	let b = 2
	let c = 3
	let x = do yes
	x(let y = 1)
	
	if true
		x(let z = 2)
		x(let y = 2)
		eq y, 2

	eq y, 1

test do
	let {a,b} = {a: 1,b: 1}
	
	if true
		let a = 2
		eq a, 2

	eq a,1
	
test do
	let {a,b} = {a: 1,b: 1}
	
	if true
		let a = 2
		let b = 2
		eq a, 2
		eq b, 2

	eq a,1
	eq b,1
	
test do
	let a = 1
	let b = 1
	let c = 1
	let d = 1
	let e = 1
	let f = 1
	let g = 1
	
	let at = 1

	if 1
		let a = 2
		let b = {a}
		let {c,name: {g}} = {c: 2,name: {g: 2}}
		let [d,e,...rest] = [2,2,2,2]
		let [x,y,z = at] = [2,2]
	
		eq a, 2
		eq b.a, 2
		eq c, 2
		eq e, 2
		eq g, 2
		eq x, 2
		eq y, 2
		eq z, 1
		eq at, 1
				
	eq a, 1

test do
	let [a,b,c] = [1,1,1]
	
	if true
		let {a = 2, b = 2} = {a: 3}
		eq a,3
		eq b,2
	eq a, 1

test do
	let a = 0
	{a,b = 10} = {a: 1}
	eq a,1
	eq b,10

test do
	class x
		def constructor
			_priv = for o in ary
				o

		get priv
			_priv
	
	let v = new x
	eq v.priv,[1,2,3]

test do
	let i = 0
	
	# difficult to show the bug - but it is there
	# will be apparent if we reenable implicit self
	let fn = do(v)
		i++
		if v > 0
			fn(v - 1)
	fn(4)
	eq i,5
		