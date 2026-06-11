# [preview=styles]
import 'util/styles'
export const vars = {flag: 'demo-1'}

# ---
css .demo-1 fw:100
css .demo-2 fw:900
css .demo-3 fw:normal
css .demo-4 fw:bold
css .demo-5 fw:lighter
css .demo-6 fw:bolder
# ---

imba.mount do <.inline-demo.typography> <div.{vars.flag}> 'Text'