import 'util/styles'
export const vars = {flag: 'demo-1'}

imba.mount do <.inline-demo>
	# ---
	css .demo-1 bxs:xxs
	css .demo-2 bxs:xs
	css .demo-3 bxs:sm
	css .demo-4 bxs:md
	css .demo-5 bxs:lg
	css .demo-6 bxs:xl
	css .demo-7 bxs:xxl
	css .demo-8 bxs:outline
	# ---
	<div.filled[bg:gray1 inset:0]>
		<div.target[pos:absolute inset:8 bg:white].{vars.flag}>