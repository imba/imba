# [preview=styles]
import 'util/styles'
export const vars = {flag: 'demo-rd'}

# ---
css .demo-rd rd:16px # all
css .demo-rdtl rdtl:16px # top-left
css .demo-rdtr rdtr:16px # top-right
css .demo-rdbl rdbl:16px # bottom-left
css .demo-rdbr rdbr:16px # bottom-right
css .demo-rdt rdt:16px # top-left and top-right
css .demo-rdr rdr:16px # top-right and bottom-right
css .demo-rdb rdb:16px # bottom-left and bottom-right
css .demo-rdl rdl:16px # top-left and bottom-left
# ---

imba.mount do <.inline-demo>
	<div.filled>
		<div.target[pos:absolute inset:8 bg:teal3/30 bd:teal3].{vars.flag}> ''