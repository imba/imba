# [preview=styles]
import 'util/styles'
export const vars = {flag: 'demo-1'}

# ---
css .demo-1 px:4 # size units
css .demo-2 px:8px
css .demo-3 px:10% # relative to width of container
css .demo-4 px:4 @hover:8
css .demo-5 px:0
# ---

imba.mount do <.inline-demo.paddings> <div.target.{vars.flag}>