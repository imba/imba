import logo from './imba.svg'

tag app
	<self>
		<h1> "version {process.env.MY_VERSION}"
		<svg src=logo title="imba is cool">

imba.mount <app>
