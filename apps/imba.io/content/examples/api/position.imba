# [preview=styles]
import 'util/styles'
export const vars = {flag: 'demo-1'}

# ---
css .demo-1 pos:relative
css .demo-2 pos:absolute
css .demo-3 pos:fixed
# ---

imba.mount do <.inline-demo.positions>
	<.base> <div.target.{vars.flag}>