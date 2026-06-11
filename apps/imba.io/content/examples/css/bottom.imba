import 'util/styles'
export const vars = {flag: 'demo-1'}

# ---
css .demo-1 b:0
css .demo-2 b:5 # using default scale
css .demo-3 b:50%
# ---

imba.mount do <.inline-demo.positioning>
	<.base> <div.target.{vars.flag}>