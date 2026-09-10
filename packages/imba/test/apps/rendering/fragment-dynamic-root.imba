# A dynamic tag whose expression returns a fragment goes through the same
# flags.reconcile as element roots. Fragments have no class attribute, so
# the reconcile must treat them as having no classes instead of throwing.

tag app-root
	css .item w:16px

	def items
		<>
			<span.item> 'a'
			<span.item> 'b'

	def render
		<self>
			<div.wrap> <(items!)>

let app = <app-root>
imba.mount app

test do
	eq app.querySelectorAll('.wrap span').length, 2
	app.render!
	eq app.querySelectorAll('.wrap span').length, 2
