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

describe "@resize.css" do

	let events = []

	tag App
		prop w = 400
		<self[inset:0]>
			<div$div[pos:abs h:200px w:{w}px] @resize.css=events.push(e)>
				<div$clone[pos:abs w:0.5elw*1px h:0.5elh*1px]>
			
			# TODO support custom names in resize css selector?
			<div$sidebar[pos:abs h:200px] @resize.css(1sbw,1sbh,self)>
				<div$c[pos:abs w:0.5elw*1px h:0.5elh*1px]>
				
			<div$x[pos:absolute w:0.2sbw*1px]>
			

	let app = imba.mount <App>

	# resize should be triggered immediately
	test do
		await imba.commit!
		let style = global.getComputedStyle(app.$div)
		# eq style.getPropertyValue('')
		eq app.$clone.offsetWidth,200
		app.w = 300
		app.render!
		await imba.commit!
		eq app.$clone.offsetWidth,150
		
		
	test do
		app.$sidebar.style.width = 100px
		await imba.commit!
		eq app.$x.offsetWidth,20
		