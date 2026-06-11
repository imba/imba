# [preview=styles]
import 'util/styles'
export const vars = {flag: 'demo-1'}

# ---
css .demo-1 d:block
css .demo-3 d:inline-block
css .demo-2 d:none
css .demo-4 d:flex # ...
css .demo-5 d:inline-flex # ...
css .demo-6 d:grid # ...
css .demo-7 d:inline-grid # ...

# ---

imba.mount do <main[d:block ta:center c:white inset:0]>
	<span> "Some text A."
	<main[g:2 p:2 rd:6px bd:1px dashed cooler4/50 bg:cooler7/10] .{vars.flag}>
		<main.child[d:inline-block rd:3px min-width:30px min-height:30px bg:teal4]>
		<main.child[d:inline-block rd:3px min-width:30px min-height:30px bg:indigo4]>
		<main.child[d:inline-block rd:3px min-width:30px min-height:30px bg:purple4]>
	<span> "Some text B."