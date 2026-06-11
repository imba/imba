# [preview=styles]
import 'util/styles'
export const vars = {flag: 'demo-1'}

css .demo-1 justify-items: center
css .demo-2 justify-items: start
css .demo-3 justify-items: end
css .demo-4 justify-items: flex-start
css .demo-5 justify-items: flex-end
css .demo-6 justify-items: self-start
css .demo-7 justify-items: self-end
css .demo-8 justify-items: left
css .demo-9 justify-items: right

imba.mount do <.inline-demo.paddings> <div.target.{vars.flag}>