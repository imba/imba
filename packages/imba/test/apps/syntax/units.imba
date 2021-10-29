test do
	let num = 10

	eq 1.5s, 1500
	eq -2s, -2000
	eq 250ms, 250
	eq 2fps, 500
	eq 50fps, 20
	eq (1s - 100ms), 900
	
	eq 10%,'10%'
	eq 10px, '10px'
	eq -10px, '-10px'
	eq (-num)px,'-10px'
	eq (num)%,'10%'
	
	