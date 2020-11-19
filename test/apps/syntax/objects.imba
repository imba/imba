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