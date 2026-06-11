import 'util/styles'
const item = {tint: 'sky3'}
export const vars = {flag: 'demo-1'}

imba.mount do <.inline-demo>
	# ---
	css .demo-hex bg:#7A4ACF
	css .demo-hsl bg:hsl(120,90%,45%)
	css .demo-rgba bg:rgba(120,255,176)
	css .demo-1 bg:blue3 @hover:blue5
	css .demo-2 bg:indigo5/80% # with transparency
	css .demo-interpolation bg:{item.tint} # works with interpolated values
	# ---
	<div.filled.{vars.flag}> 'Lipsum'