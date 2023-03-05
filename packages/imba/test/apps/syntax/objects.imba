const x = 100
const y = 200

describe 'Object' do

	test do
		let obj = {x,y, a: 10, b: 20, [x]: y}
		ok obj.x == 100 && obj[100] == 200

describe 'Object initializing' do

	test do
		let x = 1
		let y = 2
		let o = {x,y}
		eq o.x,1
		eq o.y,2

describe 'Object spread' do
	let a = {a: 1}
	let b = {b: 1}
	let c = {c: 1}

	test do
		let o = {a:0,...a}
		eq o.a, 1
	
	test do
		let o = {...a,a:2}
		eq o.a, 2

	test do
		let o = {
			...a
			...b
			c: 2
		}

		eq o.a, 1
		eq o.b, 1
		eq o.c, 2

	test do
		let x = {a: 1}
		let y = {...x}
		eq y.a, 1

	test do
		let x = {a: 1, b: 2}
		let y = {c:3, ...x}
		eq y.a, 1
		eq y.b, 2
		eq y.c, 3