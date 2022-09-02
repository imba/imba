import state from './state'

tag app
	<self>
		<h1[c:blue4]> "Hello {import.meta.env.VITE_LANG}"
		<h2> "Count is {state.count}"

imba.mount <app>