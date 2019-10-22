
### css scoped
p {
	color: blue;
}
###

### less scoped

p {  }
###


require './test.css'

import {Section} from './section'

export tag App
	def render
		<self>
			<header>
				<h1> "Hello"
			<section>
				<p> "Something"
				<button.button> 'Submit'
			<Section>

Imba.mount(<App>)

export def render
	<div>
		<header>
			<h1> "Hello"
		<section>
			<p> "Something"
			<button.button> 'Submit'
		<Section>


export var app = <div -> <self>
	<header>
		<h1> "Hello"
	<section>
		<p> "Something"
		<button.button> 'Submit'
	<Section>

### less scoped

@size: 20px;

p {
	font-size: @size;
}

###