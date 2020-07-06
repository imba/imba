tag Button
	css &
		fw:500

tag App
	<self> <Button[fw:600].btn>


test do eqcss <App>, 600, '.btn'

let flip = no

tag A1
	css .btn fw:600
	css div fw:300
	
	<self>
		<div .one=flip> '300'
		<div.btn .one=flip> '600'

test do
	flip = no
	let app = <A1>
	eqcss app,300,'div'
	eqcss app,600,'.btn'
	flip = yes
	app.render!
	eqcss app,300,'div'
	eqcss app,600,'.btn'
	
	
