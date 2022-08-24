
import './shared'
global css @root $about:1 bg:url(assets/code.png)

import head from './head?iife'

tag about-page

	<self>
		<div[fw:700]> "Hello from about page!!!"
		<img src="assets/code.png">
		<svg src="svg/logo.svg">

imba.mount <about-page>