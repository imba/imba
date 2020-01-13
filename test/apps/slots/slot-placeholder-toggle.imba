let bool = true

tag app-panel
	def render
		<self>
			<header> "header"
			<section> <slot> "placeholder"
			<footer> "footer"

tag app-root
	def render
		<self>
			<div> "This is the app"
			<app-panel>
				if bool
					<div.stuff> "content in panel"

imba.mount <app-root>

test do
	ok $(app-panel section .stuff)

test do
	bool = false
	return
	$(app-root).render()
	ok !$(app-panel .stuff)
	ok $(app-panel).textContent.indexOf('placeholder') > 0
