import './shared.imba'
import 'imba/spec'
global css * bs:solid

tag App

	def render
		<self.app[d:hflex ja:center g:10]>
			css div size:100px fs:xs d:flex ja:center hue:blue @hover:teal

			# Just supplying a color will default to 1px solid
			<div[bd:blue] eq={border: '1px solid rgb(0, 0, 255)'}>

			<div[bw:1px bd:none] eq={border: '0px none rgb(0, 0, 0)'}>

			# these do not currently work - but they should
			# <div[bw:2px bd:blue] eq={border: '2px solid rgb(0, 0, 255)'}>
			# <div[bd:2px bd:blue] eq={border: '2px solid rgb(0, 0, 255)'}>
			# <div[bd:blue bw:2px] eq={border: '2px solid rgb(0, 0, 255)'}>

			<div[c:blue bd:1px] eq={border: '1px solid rgb(0, 0, 255)'}>

			# Ok to 
			<div[bd:2px blue] eq={border: '2px solid rgb(0, 0, 255)'}>
			# bw (border-width) and bc (border-color)
			<div[bw:2px bc:blue] eq={border: '2px solid rgb(0, 0, 255)'}>

			<div[bd:1px bc:blue bcl:red] eq={borderLeft: '1px solid rgb(255, 0, 0)',borderTop: '1px solid rgb(0, 0, 255)'}>
			<div[c:red bd:2px] eq={border: '2px solid rgb(255, 0, 0)'}>

			# Shorthands
			<div[bcx:red bcy:blue] eq={borderColor: 'rgb(0, 0, 255) rgb(255, 0, 0)'}>

			<div[bwx:2px bwy:4px] eq={borderWidth: '4px 2px'}>

			<div[bsx:solid bsy:ridge] eq={borderStyle: 'ridge solid'}>

			<div[bdx:red bdy:blue] eq={borderWidth: '1px',borderColor: 'rgb(0, 0, 255) rgb(255, 0, 0)'}>

			<div[bdx:red bdy:blue] eq={borderWidth: '1px',borderColor: 'rgb(0, 0, 255) rgb(255, 0, 0)'}>
			

imba.mount(let app = <App>)

for child in app.children
	test do
		eqcss child, child.eq or {border: child.innerText}


###
Unlike regular css, imba allows supplying just a size or just a style to
border(-left|right|top|bottom|x|y). But doing this multiple times in a rule
will reset the other, so bd:2px bd:blue will end up as 1px solid blue.

Going to fix this by making border rules !important and falling back to defaults
###