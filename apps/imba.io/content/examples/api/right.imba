# [preview=styles]
import 'util/styles'
export const vars = {flag: 'demo-1'}

# ---
css .demo-1 r:0
css .demo-2 r:5 # using default scale
css .demo-3 r:50%
# ---

imba.mount do <.inline-demo.positioning>
	<.base> <div.target.{vars.flag}>