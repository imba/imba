# [preview=styles]
import 'util/styles'
export const vars = {flag: 'demo-1'}

# ---
css .demo-1 l:0
css .demo-2 l:5 # using default scale
css .demo-3 l:50%
# ---

imba.mount do <.inline-demo.positioning>
	<.base> <div.target.{vars.flag}>