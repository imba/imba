tag nested-item
	css d:block fw:500 c:blue5
	<self> <div.box> <slot> 'box'
	
	def main
		<div.box> 'main'

tag inherited-item < nested-item

tag restyled-item < nested-item
	css .box fw:300

tag rerendered-item < nested-item
	<self> <div.box> <slot> 'other box'
	
tag complicated-item < nested-item
	css .box bg:blue2 fw:300
	
	def main2
		<div.box> 'main2'
		
	<self>
		main!
		main2!
	
tag app-root
	css .box fw:700

	<self>
		<div.box> 'outer 700'
		<nested-item$box2> 'inner 500'
		<inherited-item$box3[c:orange5]> 'inherited 500'
		<inherited-item[c:orange5]> 'inherited 500'
		<inherited-item> 'inherited 500'
		<restyled-item$box4> 'restyled 300'
		<rerendered-item$box5> 'rerendered 500'
		<complicated-item$box6> 'complicated 300'


imba.mount(let app = <app-root tabIndex=0>)

test do
	eqcss app.children[0], 700
	eqcss app.$box2.children[0], 500
	eqcss app.$box3.children[0], 500
	eqcss app.$box4.children[0], 300
	eqcss app.$box6.children[0], 300
	eqcss app.$box6.children[1], 300
	eqcss app.$box5.children[0], 500


# svg
tag A
	css circle stroke-width:2px
	
	<self>
		<div> "svg"
		<svg> <circle>

imba.mount(let a = <A>)

test do
	eqcss <A>, {strokeWidth: 2px}, 'circle'