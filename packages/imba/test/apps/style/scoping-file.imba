global css
	.global fw:501

css
	.file fw:401

tag nested-item
	<self>
		<div.box> <slot> 'box'
		<div.rule.file> '401'
		<div.rule.global> '501'
		<div.rule.scope> '400'

def extrule fw
	<div.rule.file> fw

tag app-root
	css fw:400
	css self
		.scope fw:301

	<self>
		<div.rule.file> '401'
		<div.rule.global> '501'
		<div.rule.scope> '301'
		<extrule('401')>
		<div innerHTML='<div class="rule global">501</div>'>
		<div innerHTML='<div class="rule file">400</div>'>
		<div innerHTML='<div class="rule scole">400</div>'>

imba.mount(let app = <app-root tabIndex=0>)

test do
	let els = app.getElementsByClassName('rule')
	for el in els
		eqcss el, parseInt(el.textContent)

	# eqcss app.children[1], 300
	# eqcss app.children[2].children[0], 500
	# eqcss app.children[2].children[1], 300
