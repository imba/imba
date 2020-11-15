const x = 100
const y = 200

describe 'Object' do

	test do
		let obj = {x,y, a: 10, b: 20, [x]: y}
		ok obj.x == 100 && obj[100] == 200
