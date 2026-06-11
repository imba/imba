# [preview=styles]
import 'util/styles'
export const vars = {flag: 'demo-1'}

# ---
css .demo-1 transform: translate(30px,50%)
css .demo-2 transform: rotate(0.5turn)
css .demo-3 transform: skew(30deg,20deg)
css .demo-4 transform: scale(0.7) translate(-50%,-50%)
css .demo-5 transform: rotate(3deg) scale(0.8)
css .demo-6 transform: skewY(20deg)
# ---

imba.mount do <.inline-demo.transforms>
	<div.base> <div.target.{vars.flag}>