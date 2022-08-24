
import './shared'
global css @root $about:1 bg:url(assets/code.png)

import head from './head?iife'

import json from './manifest.json?copy'

const icons = {
	tool: import('svg/logo3.svg')
}

console.log icons

tag about-page

	<self>
		<div[fw:700]> "Hello from about page!!!"
		<img src="assets/code.png">
		<svg src="svg/logo.svg">

global.json = json

imba.mount <about-page>