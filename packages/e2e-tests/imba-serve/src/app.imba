import logo from './imba.svg'

tag app
	<self>
		<h1> "version {process.env.VERSION}"
		<svg src=logo title="imba is cool">

imba.mount <app>
