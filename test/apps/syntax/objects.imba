var x = 100
var y = 200

describe 'Object' do

	test do
		var obj = {x,y, a: 10, b: 20, [x]: y}
		ok obj.x == 100 && obj[100] == 200
