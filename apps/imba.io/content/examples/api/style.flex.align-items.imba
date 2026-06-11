# [preview=styles]
import 'util/preview'
export const vars = {flag: 'demo-3'}

# ---
css .demo-8 ai:normal
css .demo-1 ai:stretch
css .demo-3 ai:center # Pack items around the center
css .demo-2 ai:start # Pack items from the start - grid only
css .demo-4 ai:end # Pack items from the end - grid only
css .demo-5 ai:flex-start # Pack flex items from the start
css .demo-6 ai:flex-end # Pack flex items from the end
css .demo-7 ai:baseline

# ---

imba.mount do <.inline-demo.layouts>
	# allow selecting between grid or hbox
	<main[d:vflex].{vars.flag}>
		<section>
		<section>
		<section>