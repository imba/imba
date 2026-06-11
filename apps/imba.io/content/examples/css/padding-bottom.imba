# [preview=styles]
import 'util/styles'
export const vars = {flag: 'demo-1'}

# ---
css .demo-1 pb:1em
css .demo-2 pb:6 # using default scale
css .demo-3 pb:40px
css .demo-4 pb:20%
# ---

imba.mount do <.inline-demo.paddings>
	<div.target.{vars.flag}>