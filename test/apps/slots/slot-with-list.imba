let items = [1,2,3]

tag app-list
	def render
		<self>
			<header> "header"
			<slot> <span.empty> "no content"
			<footer> "footer"

tag app-root
	def render
		<self>
			<div> "This is the app"
			<app-list> for item in items
				<div .item-{item}> "{item}"

imba.mount <app-root>

test do
	ok $(header + div.item-1)
	ok $(div.item-2)
	ok $(div.item-3 + footer)

test do
	items.pop()
	$(app-root).render()
	ok $(div.item-2 + footer)

test do
	# return # not implemented yet
	return #
	items = []
	$(app-root).render()
	ok $(header + span.empty)