import { getEl, page, untilMatches } from '~utils';

test('should render the svg and pass props', async () => {
	const calendar = await getEl("ion-datetime")
	expect(calendar).not.toBeNull()
	const day = await calendar.evaluate(el=>el.shadowRoot.querySelector(".calendar-day-active").dataset.day)
	expect(day).toBe('10')
	const incr = await getEl("#inc")
	await incr.click()
	await untilMatches(
		()=> calendar.evaluate(el=>el.shadowRoot.querySelector(".calendar-day-active").dataset.day),
		'11'
	)


	const target = await calendar.evaluate(el=>el.shadowRoot.querySelectorAll("button[data-day='7']")[1].click())
	await untilMatches(
		()=> calendar.evaluate(el=>el.shadowRoot.querySelector(".calendar-day-active").dataset.day),
		'7'
	)
});
