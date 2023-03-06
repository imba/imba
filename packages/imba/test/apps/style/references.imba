tag A1
	css .btn fw:600
	css $btn fw:600
	css .label fw:300
	css $label fw:200

	<self>
		<div.btn> '600'
		<div$btn> '600'
		<div.label> '300'
		<div$label> '200'

tag A2 < A1
	css $label fw:700

test do
	let app = <A1>
	eqcss app, 600, 0
	eqcss app, 600, 1
	eqcss app, 300, 2
	eqcss app, 200, 3

test do
	let app = <A2>
	eqcss app, 600, 0
	eqcss app, 600, 1
	eqcss app, 300, 2
	eqcss app, 700, 3
# imba.mount <App>