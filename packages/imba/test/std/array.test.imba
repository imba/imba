test "sorted" do
	let arr
	let exp

	arr = [0, 1, 9, 2, 8, 3, 7, 4, 6, 5]
	exp = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]
	eq exp, arr.sorted!
	eq exp, arr.sorted do $1
	eq exp.reversed, arr.sorted(null, yes)

	arr = [
		{ a: 1 }
		{ a: 4 }
		{ a: 7 }
		{ a: 5 }
		{ a: 3 }
		{ a: 2 }
		{ a: 6 }
	]
	exp = [
		{ a: 1 }
		{ a: 2 }
		{ a: 3 }
		{ a: 4 }
		{ a: 5 }
		{ a: 6 }
		{ a: 7 }
	]
	eq exp, arr.sorted 'a'
	eq exp, arr.sorted do $1.a
	eq exp.reversed, arr.sorted('a', yes)
	eq exp.reversed, arr.sorted((do $1.a), yes)

	arr = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j']
	let map = {
		'a': 0
		'b': 1
		'c': 9
		'd': 2
		'e': 8
		'f': 3
		'g': 4
		'h': 7
		'i': 5
		'j': 6
	}
	map = new Map Object.entries(map)
	exp = ['a', 'b', 'd', 'f', 'g', 'i', 'j', 'h', 'e', 'c']
	eq exp, arr.sorted(map)
