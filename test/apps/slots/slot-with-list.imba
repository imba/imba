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
			<div> "app"
			<app-list> for item in items
				<div .item-{item}> "{item}"

let app = <app-root>
imba.mount app

test do
	ok document.querySelector('header + div.item-1')
	ok document.querySelector('div.item-2')
	ok document.querySelector('div.item-3 + footer')

test do
	items.pop()
	document.querySelector('app-root').render()
	ok document.querySelector('div.item-2 + footer')

test do
	items = []
	document.querySelector('app-root').render()
	ok document.querySelector('header + span.empty')