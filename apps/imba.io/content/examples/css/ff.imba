# [preview=styles]
import 'util/styles'
export const vars = {flag: 'demo-sans'}

# ---
css .demo-sans ff:sans # all
css .demo-serif ff:serif # top-left
css .demo-mono ff:mono # top-right
css .demo-georgia ff:Georgia, serif
css .demo-gill ff:"Gill Sans", sans-serif
# ---

imba.mount do <.inline-demo.typography>
	<div.{vars.flag}> 'This is my text'