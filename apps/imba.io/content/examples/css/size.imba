# [preview=styles]
import 'util/styles'
export const vars = {flag: 'demo-1'}

# ---
css .demo-1 size:30px # 30px
css .demo-2 size:50% # 50%
css .demo-3 size:100% # 100%
# ---

imba.mount do <.inline-demo.sizes>
	<.base> <div.target.{vars.flag}>