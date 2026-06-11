# [preview=styles]
import 'util/styles'
export const vars = {flag: 'demo-1'}

# ---
css .demo-1 mt:1em
css .demo-2 mt:2 # using default scale
css .demo-3 mt:10%
css .demo-4 mt:50px
# ---

imba.mount do <.inline-demo.margins>
	<div.base.striped[c:orange5/60 bgc:orange5/20]>
		<div[bg:orange5].target.{vars.flag}>