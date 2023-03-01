tag App
	<self>
		<div[fw:500 @900:700 !@300:300].btn>

test do
	# window starts at 800 width
	eqcss <App>, 500, '.btn'
	await spec.page.setViewport(width: 950, height: 600)
	eqcss <App>, 700, '.btn'
	await spec.page.setViewport(width: 300, height: 600)
	eqcss <App>, 500, '.btn'
	await spec.page.setViewport(width: 299, height: 600)
	eqcss <App>, 300, '.btn'