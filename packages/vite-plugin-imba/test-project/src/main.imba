import './app.css'
import Counter from './lib/counter.imba'
import logo from "./assets/imba.svg"

tag app
	css .logo h:6em p:1.5em
	<self>
		<div>
			<a href="https://imba.io" target="_blank">
				<svg.logo[h:6.5em] src=logo>
			<a href="https://vitejs.dev" target="_blank">
				<img.logo[filter@hover:drop-shadow(0 0 4em #646cffaa)] src="/vite.svg" alt="Vite Logo">

			<a href="https://imba.io" target="_blank">
				<img.logo[filter@hover:drop-shadow(0 0 4em #ff3e00aa) h:6.5em] src="./assets/imba.svg" alt="Imba Logo">

		<h1[c:yellow4]> "Vite + Imba"
		<div.card> 
			<Counter>
		<p> "Check out"
			<a href="https://imba.io" target="_blank"> " Imba.io"
			", the Imba documentation website"
		<p[c:#888]> "Click on the Vite and Imba logos to learn more!!!"


imba.mount <app>, document.getElementById "app"