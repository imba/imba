let ary = [1,2,3]
let objary = [{a: 1},{a: 2},{a: 3}]

let fn = do yes
	
test do
	var func = do |{a,b}|
		if let a = 2
			eq a,2
		eq a,b
	
	func(1,1)

test do
	let a = 0
	if let a = 2
		for {a},i in objary
			eq a,i+1
	eq a,0

test do
	let obj = {
		a: {a: 1, key: 'a'}
		b: {a: 1, key: 'b'}
		c: {a: 1, key: 'c'}
	}

	let a = 0
	let i = 0
	if let a = 2
		for own k,{a,key} of obj when a == 1
			eq a,1
			eq k,key
			i++
	eq a,0
	eq i,3

test do
	let ary = [[{a:0}],[{a:1}],[{a:2}]]
	let a = 0
	if let a = 2
		let k = 0
		for [{a}] of ary
			eq a,k++
		eq k,3
	eq a,0
	
test do
	fn(let y = 1)

	if true
		fn(let y = 2)
		eq y, 2
		
	eq y, 1

test do
	let o = {a: 2}
	let a = 1
	if let {a} = o
		eq a, 2
	else
		eq a, 1
	eq a, 1

test do
	let a = 1
	let s = 'a'
	if let a = 2
		eq a,2
		let {name: s} = {name: 'b'}
		eq s,'b'

		let x = {@b,a,s}
		eq x.a,2
		eq x.s,'b'
		
		[a=3] = [1,2,3]
		eq a, 1
		[a=3] = []
		eq a, 3
	else
		eq a, 1
	eq a,1
	eq s,'a'


test do
	let a = [1,2,3]
	var b = for item in a
		item * 2
	eq b, [2,4,6]
	
	
	var [e,f,g] = for item in a
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
	let a = 1, b = 2, c = 3
	let x = do yes
	x(let y = 1)
	
	if true
		x(let z = 2)
		x(let y = 2)
		eq y, 2
		
	eq y, 1

test do
	let a = 1
	if let a = 2
		eq a, 2
	eq a, 1

test do
	let a = 1
	if let a = 0
		eq a, 0
	else
		eq a, 1
	eq a,1

test do
	let {a,b} = {a: 1,b: 1}
	
	if true
		let a = 2
		eq a, 2

	eq a,1
	
test do
	let {a,b} = {a: 1,b: 1}
	
	if let a = 2
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
	{a,@b = 10} = {a: 1}
	eq a,1
	eq @b,10

test do
	class x
		def constructor
			#priv = for o in ary
				o
		get priv
			#priv
	
	let v = x.new
	eq v.priv,[1,2,3]
	