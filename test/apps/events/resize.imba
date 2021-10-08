describe "@resize" do

	let ctx = {}
	let events = []

	tag App
		prop w = 400
		<self[inset:0]>
			<div[pos:abs h:200px w:{w}px] @resize=events.push(e)>

	let app = imba.mount <App>

	# resize should be triggered immediately
	test do
		await imba.commit!
		eq app.offsetWidth,800
		eq app.offsetHeight,600
		let ev = events[-1]
		ok ev isa CustomEvent
		eq ev.width, 400
		eq ev.height, 200

	test do
		events = []
		app.w = 300
		app.render!
		await imba.commit!
		let ev = events[-1]
		eq ev.width, 300