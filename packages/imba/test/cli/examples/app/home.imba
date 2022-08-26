
import './shared'

global css @root $home:1 bg:url(assets/code.png)

tag home-page

	<self>
		<div[fw:700]> "Hello from about page!"
		<img src="assets/code.png">
		<svg src="svg/logo.svg">

imba.mount <home-page>
