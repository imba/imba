import './app.css'
import Counter from './lib/counter'

tag app
	css .logo h:6em p:1.5em
	<self>
		<div>
			<a href="https://vitejs.dev" target="_blank">
				<img.logo[filter@hover:drop-shadow(0 0 4em #646cffaa)] src="/vite.svg" alt="Vite Logo">

			<a href="https://svelte.dev" target="_blank">
				<img.logo[filter@hover:drop-shadow(0 0 4em #ff3e00aa)] src="./assets/svelte.svg" alt="Svelte Logo">

		<h1> "Vite + Imba"
		<div.card>
			<Counter>
		<p> "Check out"
			<a href="https://github.com/sveltejs/kit#readme" target="_blank"> "SvelteKit"
			", the official Svelte app framework powered by Vite!"
		<p[c:#888]> "Click on the Vite and Svelte logos to learn more!!!"


imba.mount <app#app>