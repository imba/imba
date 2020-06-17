
# import {%header} from './style'

css %button d:block ml:1px mr:1px
	
tag app-item
	css %button ml:2px
	<self> <i%button> 'hello'
	
tag app-root
	css %button mr:2px

	<self>
		<b%button> 'hello'
		<app-item>


def check el, match
	if typeof el == 'string'
		el = document.querySelector(el)
	elif el isa Element and !el.parentNode
		document.body.appendChild(el)
	let style = window.getComputedStyle(el)
	for own k,expected of match
		let real = style[k]
		if expected isa RegExp
			global.ok real.match(expected)
			unless real.match(expected)
				console.log real,'did no match',expected
		else
			global.eq(real,expected)
	return

imba.mount(<app-root>)

test do
	check('app-root b', marginLeft: '1px', marginRight: '2px')
	check('app-item i', marginLeft: '2px', marginRight: '1px')