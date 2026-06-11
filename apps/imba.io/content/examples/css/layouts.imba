import 'util/styles'
export const vars = {flag: 'demo-1'}

css .grid bg:clear h:100px w:100px
	> d:block rd:sm bg:sky3 w:auto h:auto
		tween:all 0.1s ease-in-out

css .target w:12 h:12

imba.mount do <.inline-demo>
	# ---
	<div.grid[d:grid ja:stretch g:1]>
		<div[bg:green2]>
		<div[bg:orange3]>
		<div[bg:red3 h:2rows y:6px]>
		<div[bg:indigo3 bg@hover:pink4]>
		<div[bg:teal2]>