import { Local } from './local'
import { TestView } from './views/test'

import './index.css'
import html from './index.html'
import tool from './assets/tool.svg'

import stuff from './ns?text'

const entries = {
	view: import.iife('./view')
	stuff: import.iife('./ns')
	again: import('./ns?text')
	asset: import('./assets/tool.svg')
}

let m = new SomeClass
m.ext
m.that.extthis
m.num
global.appState.one
m.state.one

let m3 = new Local
m3.ext
m3.state.three
m3.localState.two
m3.str
m3.state.one
m3.element.main
m3.state

let m5 = <app-panel>
m5.main
m5.ext
m5.that.ext
global.APPNS={}

if true
	let item = new APPCLS
	APPCLS.main
	item.main
	item.ext

if true
	let item = new APPNS.Main
	APPNS.Main.main
	item.main
	item.ext

if true
	let item = new APPCLS.Main
	APPCLS.Main.main
	item.main
	item.ext


let m10\SomeClass

let m12 = new AutoGlobal

m12.main
m12.that.main

let m13\AutoGlobal

m13.main

let m14\SomeSubClass
m14.that.sub.num

global class MainStuff

	def render
		yes

tag app-main
	data\SomeClass

	css d:block w:auto
	css code sd:a
	css div code d:block
	css $test d:contents
	css div d:grid c:blue3
	# css code
	get helloz
		yes

	def mount
		space
		space.ext2
		space.ext
		smeth
		spuce
		state
		staff
		button
		rect
		data.that.main

		that.helloz
		data.extthis!
		other.main.state.extended
		[SomeClass]

		let el\<app-button>
		el.ext
		el.stata

	<self>
		<app-button>
		<input$text type='text'>
		# <svg src='./assets/tool.svg'>
		