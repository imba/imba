# [preview=styles]
import 'util/styles'
export const vars = {flag: 'demo-1'}

# ---
css .demo-1 pr:1em
css .demo-2 pr:6 # using default scale
css .demo-3 pr:40px
css .demo-4 pr:20%
# ---

imba.mount do <.inline-demo.paddings>
	<div.target.{vars.flag}>