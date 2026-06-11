# [preview=styles]
import 'util/styles'
export const vars = {flag: 'demo-1'}

# ---
css .demo-1 d:htl # horizontal top left
css .demo-2 d:htc # horizontal top center
css .demo-3 d:htr # horizontal top right
css .demo-4 d:hts # horizontal top space-between

css .demo-5 d:hcl # horizontal center left
css .demo-6 d:hcc # horizontal center center
css .demo-7 d:hcr # horizontal center right
css .demo-8 d:hcs # horizontal center space-between
css .demo-9 d:hbl # horizontal bottom left
css .demo-10 d:hbc # horizontal bottom center
css .demo-11 d:hbr # horizontal bottom right
css .demo-12 d:hbs # horizontal bottom space-between

css .demo-13 d:hsl # horizontal stretch left
css .demo-14 d:hsc # horizontal stretch center
css .demo-15 d:hsr # horizontal stretch right
css .demo-16 d:hss # horizontal stretch space-between
# ---

imba.mount do <.inline-demo>
	<div[g:2 p:2 rd:6px size:180px bd:1px dashed cooler4/50 bg:cooler7/10].{vars.flag}>
		<div.child[rd:3px min-width:40px min-height:40px bg:teal4]>
		<div.child[rd:3px min-width:50px min-height:50px bg:indigo4]>
		<div.child[rd:3px min-width:30px min-height:30px bg:purple4]>