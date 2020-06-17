let bool = true

tag app-panel
	def render
		<self>
			<header> <slot name='header'>
			<section> <slot> "content?"
			<footer> "footer"
			<section>
				<slot name='footer'> 
					<span.one> "foot?"
					<span.two> "foot?"
			<slot name='copy'> 'copy?'

tag app-root
	def render
		<self>
			<input bind=bool type='checkbox'>
			<div> "app"
			<app-panel>
				if bool
					<div.stuff> "content in panel"

let app = <app-root>
imba.mount app 

test do
	ok $(app-panel section .stuff)

test do
	bool = false
	app.render()
	ok !$(app-panel .stuff)
	ok app.textContent.indexOf('content?') > 0
