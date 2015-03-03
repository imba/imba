
var a = [1,2,3,4]
var x = await a.map(|v| v.load )


var y = await for x in test
	x.load