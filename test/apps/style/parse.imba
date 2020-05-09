# . still feels like the best shorthand for this? But the opener is not important
const a = .{
	color: red-500
	display: block
	pl: 1
	py: 2
	px: 1 0
	shadow: inner
	
	margin-top: 2
	display.md: inline
	font: bold xl/2 sans
	text: bold teal-200 xl/2
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