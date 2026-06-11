# [preview=styles]
import 'util/styles'
export const vars = {flag: 'demo-1'}

# ---
css .demo-1 m:1em
css .demo-2 m:5% 0
css .demo-3 m:5px 15px 10px
css .demo-4 m:5px 15px 10px 0
css .demo-5 m:0
# ---

imba.mount do <.inline-demo.margins>
	<div.base.striped[c:orange5/60 bgc:orange5/20]>
		<div[bg:orange5].target.{vars.flag}>