# . still feels like the best shorthand for this? But the opener is not important
const a = .{
	background: linear-gradient(red-100)
	color: red-500
	font-weight: bold
	text: red-500 bold h1
	display: block
	pl: 1
	py: 2
	px: 1 0
	shadow: inner
	bg: red-500
	margin-top: 2
	display.md: inline
	font: bold xl/2 sans
	text: bold teal-200 xl/2
	tween.md: colors 250ms quint
	
	x: 1u
}

###
const style = $alias
	color: red-500
	display: block
	&.blue
		opacity: 0.5

const style = $
	color: red-500, display: block
	&.blue { opacity: 0.5 }
###