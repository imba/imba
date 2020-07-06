tag nested-item
	css d:block fw:500 c:blue5

	<self>
		<div.box> <slot> 'box'
		<div.rule> 'inner 300?'

def extrule fw
	<div.rule> fw

tag app-root
	css >>> .rule fw:303
	css >> .rule fw:302
	css > .rule fw:301
	
	css .box >>> .rule fw:403
	css .box >> .rule fw:402
	css .box > .rule fw:401

	<self>
		<.rule> '301'
		extrule('302')
		<div> extrule('303')
		<div.box>
			<.rule> '401'
			extrule('402')
			<div> extrule('403')
		
			

imba.mount(let app = <app-root tabIndex=0>)

test do
	let [a,b,c,d] = app.children
	let els = app.getElementsByClassName('rule')
	for el in els
		eqcss el, parseInt(el.textContent)
		
	eqcss a, 301
	# eqcss app.children[1], 300
	# eqcss app.children[2].children[0], 500
	# eqcss app.children[2].children[1], 300
