let ary = [1,2,3]

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
	let o = {a: 2}
	let a = 1
	if let {a} = o
		yes
		eq a, 2
	else
		eq a, 1
	eq a, 1