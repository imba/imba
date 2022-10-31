global css .f1 fw:300
css .f1 fw:200
css .f2 fw:200
css .f4 fw:200
global css .f2 fw:300

# should take precendence over tag css style?
css app-item fw:200

tag app-item
	css fw:400

tag App
	css fw:400
		.f1 fw:500

	css .f1 fw:400
	css .f2 fw:400
	css .f3 fw:300
	css .f5 fw:400
	

	f2val = "400"
	
	<self>
		css .f3 fw:400
		<.f1> "400"
		<.f2> f2val
		<.f3> "400"
		<.f2 [fw:500]> "500"
		<.f4>
			css fw:600
			# You would expect this to be more important? - or would no?
			"600"
		<div.f5>
			css fw:700 
			"700"
		<div>
			css .f3 fw:700
			<div.f3> "700"
		
		<div>
			css .f3 fw:701
			<div.f3> "701"

tag App2 < App
	css .f2 fw:350
	# css .f1 fw:350

let app = imba.mount(<App tabIndex=0>)

test do
	# imba.mount(let app = <App tabIndex=0>)
	let els = app.querySelectorAll('*')
	for el in els when el.children.length == 0
		eqcss el,parseInt(el.textContent),null,message: "expected %2 - got %1 ({el.className})"

	# eqcss app.$f1, 400
	# eqcss app.$f2, 250
	# eqcss app.$f2, 250

test do
	imba.mount(let app = <App2 tabIndex=0 f2val="350">)
	let els = app.querySelectorAll('*')
	for el in els when el.children.length == 0
		eqcss el,parseInt(el.textContent)