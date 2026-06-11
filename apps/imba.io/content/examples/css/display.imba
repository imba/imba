# [preview=styles] [example=ImbaTouch.@moved-x]
import 'util/styles'
export const vars = {flag: 'demo-1'}

# ---
css .demo-1 d:vtl # vertical top left
css .demo-2 d:vtc # vertical top center
css .demo-3 d:vtr # vertical top right
css .demo-4 d:vts # vertical stretch

css .demo-5 d:vcl # vertical center left
css .demo-6 d:vcc # vertical center center
css .demo-7 d:vcr # vertical center right
css .demo-8 d:vcs # vertical center stretch

css .demo-9 d:vbl # vertical bottom left
css .demo-10 d:vbc # vertical bottom center
css .demo-11 d:vbr # vertical bottom right
css .demo-12 d:vbs # vertical bottom stretch

css .demo-13 d:vsl # vertical space-between left
css .demo-14 d:vsc # vertical space-between center
css .demo-15 d:vsr # vertical space-between right
css .demo-16 d:vss # vertical space-between stretch
# ---

imba.mount do <.inline-demo>
	<div[g:2 p:2 rd:6px size:180px bd:1px dashed cooler4/50 bg:cooler7/10].{vars.flag}>
		<div.child[rd:3px min-width:40px min-height:40px bg:teal4]>
		<div.child[rd:3px min-width:50px min-height:50px bg:indigo4]>
		<div.child[rd:3px min-width:30px min-height:30px bg:purple4]>