import 'util/styles'
# https://github.com/eugenkiss/7guis/wiki#flight-booker
tag flight-booker
	isReturn = false
	start = (new Date).toISOString!.slice(0,10)
	end = start

	def bookFlight
		let type = isReturn ? 'return' : 'one-way'
		let message = `You have booked a {type} flight, leaving {new Date(end).toDateString!}`
		message += ` and returning {new Date(end).toDateString!}` if isReturn
		window.alert(message)

	<self[d:grid gap:3]>
		<select[w:100%] bind=isReturn>
			<option value=false> 'one-way flight'
			<option value=true>	'return flight'
		<input bind=start type='date'>
		<input bind=end type='date' disabled=!isReturn>
		<button @click=bookFlight disabled=(isReturn && start >= end)> 'book'

imba.mount <flight-booker>