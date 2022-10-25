import './assets/app.css'
import Counter from './lib/counter'
import logo from "./assets/imba.svg"

# Uncomment for dark mode:
# import './dark-styles'

tag my-first-imba-app
	css .logo h:6em p:1.5em
	<self>
		<div>
			<a href="https://imba.io" target="_blank">
				<img.logo[filter@hover:drop-shadow(0 0 4em #ff3e00aa) h:6.5em] src=logo alt="Imba Logo">

		<h1[c:yellow4]> "Imba server + client"

		<div.card>
			<Counter>

		<p>
			"Check out"
			<a href="https://imba.io" target="_blank"> " Imba.io"
			", the Imba documentation website"

imba.mount <my-first-imba-app>, document.getElementById('app')
