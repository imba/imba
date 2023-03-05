test do
	const fiveHundredMs = 0.5s
	eq 500ms, fiveHundredMs
	eq 250ms, 250
	eq 1, 1ms

	eq 1.5s, 1500
	eq -2s, -2000
	eq (1s - 100ms), 900

	const oneMinute = 60s
	eq 1minutes, oneMinute
	eq 0.5minutes, 30s
	eq (1minutes - 1s), 59s
	eq (1minutes - 1ms), 59999ms
	eq (1minutes - 0.5minutes), 30s

	const oneHour = 60minutes
	eq 1hours, oneHour
	eq 0.5hours, 30minutes
	eq (1hours - 1minutes), 59minutes
	eq (1hours - 1s), 3599s
	eq (1hours - 0.5hours), 30minutes

	const oneDay = 24hours
	eq 1days, oneDay
	eq 0.5days, 12hours
	eq (1days - 1hours), 23hours
	eq (1days - 1minutes), 1439minutes
	eq (1days - 0.5days), 12hours

	const twoFps = 500
	eq 2fps, twoFps
	eq 50fps, 20
	
	const num = 10
	eq (-num)px, '-10px'
	eq (num)%, '10%'
	eq 10%, '10%'
	eq 10px, '10px'
	eq -10px, '-10px'
