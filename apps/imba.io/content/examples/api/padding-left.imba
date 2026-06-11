# [preview=styles]
import 'util/styles'
export const vars = {flag: 'demo-1'}

# ---
css .demo-1 pl:1em
css .demo-2 pl:6 # using default scale
css .demo-3 pl:40px
css .demo-4 pl:20%
# ---

imba.mount do <.inline-demo.paddings>
	<div.target.{vars.flag}>