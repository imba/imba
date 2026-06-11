# [preview=styles]
import 'util/styles'
export const vars = {flag: 'demo-1'}

# ---
css .demo-1 m: 16px # margin
css .demo-2 mt:16px # margin-top
css .demo-3 mr:16px # margin-right
css .demo-4 mb:16px # margin-bottom
css .demo-5 ml:16px # margin-left
css .demo-6 mx:16px # margin-left + margin-right
css .demo-7 my:16px # margin-top + margin-bottom
# ---

imba.mount do <.inline-demo.margins>
	<.base> <div.target.{vars.flag}>