test do
	let num = 10

	eq 250ms, 250

	eq 1.5s, 1500
	eq -2s, -2000
	eq (1s - 100ms), 900

	eq 1minutes, 60s
	eq 0.5minutes, 30s
	eq (1minutes - 1s), 59s
	eq (1minutes - 1ms), 59999ms
	eq (1minutes - 0.5minutes), 30s

	eq 1hours, 60minutes
	eq 0.5hours, 30minutes
	eq (1hours - 1minutes), 59minutes
	eq (1hours - 1s), 3599s
	eq (1hours - 0.5hours), 30minutes

	eq 1days, 24hours
	eq 0.5days, 12hours
	eq (1days - 1hours), 23hours
	eq (1days - 1minutes), 1439minutes
	eq (1days - 0.5days), 12hours

	eq 2fps, 500
	eq 50fps, 20
	
	eq 10%,'10%'
	eq 10px, '10px'
	eq -10px, '-10px'
	eq (-num)px,'-10px'
	eq (num)%,'10%'
	
	