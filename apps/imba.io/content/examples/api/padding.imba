# [preview=styles]
import 'util/styles'
export const vars = {flag: 'demo-1'}

# ---
css .demo-1 p:1em
css .demo-2 p:5% 0
css .demo-3 p:5px 15px 10px
css .demo-4 p:5px 15px 10px 0
css .demo-5 p:0
# ---

imba.mount do <.inline-demo.paddings>
	<div.target.{vars.flag}>