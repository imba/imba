tag App
	css 1rdu:10px
	def render
		<self.app[g:10px]>
			<div$a[d:grid g:4px]> "4px"
			<div$b[d:grid g:4px 8px]> "4px 8px"

			# the gap properties injects cg (colgap) and rg (rowgap) css units
			<div[d:grid g:4px 6px]> <div$c[px:1cg py:1rg]>

			<div$d[d:grid g:2rg]>


imba.mount(let app = <App>)

test do
	eqcss app.$a, {rowGap: 4px, columnGap: 4px}
	eqcss app.$b, {rowGap: 4px, columnGap: 8px}
	eqcss app.$c, {paddingLeft: 6px, paddingTop: 4px}
	eqcss app.$d, {rowGap: 20px, columnGap: 20px}