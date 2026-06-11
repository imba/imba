import 'util/styles'
export const vars = {flag: 'demo-1'}

# ---
css .demo-1 p: 16px # padding
css .demo-2 pt:16px # padding-top
css .demo-3 pr:16px # padding-right
css .demo-4 pb:16px # padding-bottom
css .demo-5 pl:16px # padding-left
css .demo-6 px:16px # padding-left + padding-right
css .demo-7 py:16px # padding-top + padding-bottom
# ---

imba.mount do <.inline-demo.paddings>
	<div.target.{vars.flag}>