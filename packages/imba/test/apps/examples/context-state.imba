
let pages = [
	{title: "Home", items: [1,2,3]}
	{title: "About", items: [4,5,6]}
]
let bool = true

def functional-tag item
	<div> <page-item item=item>

tag page-item
	def render
		let list = #context.items
		<self.block> <div>
			<span> "Item"
			<span> item.title
			<span> "item {list.indexOf(item)+1} of {list.length} in page {#context.page.title}"

tag page-list

	def render
		<self.block>
			<div> "List inside {#context.page.title}"
			for item in #context.items
				<page-item item=item>

tag page-panel
	def render
		<self>
			<header> "Header"
			<section> <slot>
			<footer> <slot name="footer">

tag app-page
	get pagetitle
		page.title

	def render
		<self.block items=page.items>
			<header> "page: {page.title}"
			<page-list>
			if bool
				functional-tag(page.items[0])
			<page-panel> <page-item item=page.items[0]>

tag app-root

	get toplevel
		"root"

	def render
		<self.block>
			<div> "app"
			for page in pages
				<app-page page=page>

let app = <app-root>
imba.mount app

test do
	app.render!
	ok true