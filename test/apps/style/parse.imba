# . still feels like the best shorthand for this? But the opener is not important
const a = .{
	color: red-500
	display: block
	py: 2
	shadow: inner
	display.md: inline
}

const c = .{ color: red-500, display: block }

###
const style = $
	color: red-500
	display: block
	&.blue
		opacity: 0.5

const style = $
	color: red-500, display: block
	&.blue { opacity: 0.5 }
###