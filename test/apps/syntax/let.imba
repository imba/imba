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
		let [x,y = e,z = at] = [10]
	
		eq a, 2
		eq b.a, 2
		eq c, 2
		eq e, 2
		eq g, 2
		eq x, 10
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
	