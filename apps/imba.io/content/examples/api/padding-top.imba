# [preview=styles]
import 'util/styles'
export const vars = {flag: 'demo-1'}

# ---
css .demo-1 pt:1em
css .demo-2 pt:6 # using default scale
css .demo-3 pt:40px
css .demo-4 pt:20%
# ---

imba.mount do <.inline-demo.paddings>
	<div.target.{vars.flag}>