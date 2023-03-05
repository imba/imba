test do
	let a = -0
	let b = 1 - -0
	let c = - -2
	
	eq a,0
	eq Object.is(-0,-0), true
	eq Object.is(-0,+0), false
	eq b,1
	eq c,2